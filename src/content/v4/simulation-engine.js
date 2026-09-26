'use strict';

// JuCoding V4 Simulation Engine
//
// One state machine + one renderer for every lecture simulation.
//
// There is deliberately NO per-scene setTimeout code. A simulation is pure data
// (src/content/v4/simulations/*.json):
//
//   { id, title, nodes[], edges[], steps[ { id, label, target, action, duration, narration } ] }
//
// The engine walks `steps` and applies each one as a CSS state change:
//   show     -> node becomes visible
//   activate -> node becomes visible + "currently running"
//   connect  -> node becomes visible + the incoming edge draws
//   complete -> node becomes visible + check mark
//
// Visual motion lives entirely in simulation.css (transitions + keyframes) so
// prefers-reduced-motion can switch it off without touching this file, and so
// no large animation library is required.

(function (global) {
  const SPEEDS = [0.75, 1, 1.5];
  const ACTIONS = ['show', 'activate', 'connect', 'complete'];

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  function prefersReducedMotion() {
    try {
      return Boolean(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Engine: step state machine over a simulation definition
  // ---------------------------------------------------------------------------
  class SimulationEngine {
    constructor(simulation, hooks = {}) {
      this.simulation = simulation;
      this.hooks = hooks;
      this.steps = Array.isArray(simulation.steps) ? simulation.steps : [];
      this.index = -1;          // index of the last applied step
      this.state = 'idle';      // idle | running | paused | finished
      this.speed = 1;
      this.timer = null;
      this.lastNodeId = null;   // used as the default source of a `connect` step
    }

    get total() {
      return this.steps.length;
    }

    get currentStep() {
      return this.index >= 0 ? this.steps[this.index] : null;
    }

    emit() {
      this.hooks.onState?.(this.snapshot());
    }

    snapshot() {
      return {
        simulationId: this.simulation.id,
        state: this.state,
        stepIndex: this.index,
        completed: this.index + 1,
        total: this.total,
        speed: this.speed,
        step: this.currentStep
      };
    }

    clearTimer() {
      if (this.timer !== null) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }

    // Applies one step. Returns false when the simulation is already finished.
    applyStep(step) {
      if (!step) return false;
      const from = step.from || this.lastNodeId;
      this.hooks.onStep?.(step, { from, index: this.index + 1, total: this.total });
      if (step.target) this.lastNodeId = step.target;
      this.index += 1;
      if (this.index >= this.total - 1) {
        this.state = 'finished';
        this.clearTimer();
        this.hooks.onFinish?.(this.snapshot());
        this.emit();
        return false;
      }
      this.emit();
      return true;
    }

    scheduleNext() {
      this.clearTimer();
      const next = this.steps[this.index + 1];
      if (!next) return;
      const wait = Math.max(0, Number(next.duration || 0) / this.speed);
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.state !== 'running') return;
        if (this.applyStep(next)) this.scheduleNext();
      }, wait);
    }

    play() {
      if (this.state === 'finished') this.reset();
      if (this.state === 'running') return;
      this.state = 'running';
      const next = this.steps[this.index + 1];
      if (!next) {
        this.state = 'finished';
        this.emit();
        return;
      }
      this.emit();
      // First step lands immediately so "시작" feels responsive.
      if (this.applyStep(next)) this.scheduleNext();
    }

    pause() {
      if (this.state !== 'running') return;
      this.clearTimer();
      this.state = 'paused';
      this.emit();
    }

    resume() {
      if (this.state !== 'paused') return;
      this.play();
    }

    toggle() {
      if (this.state === 'running') this.pause();
      else this.play();
    }

    // Manual "다음 단계". Advances exactly one step; stays paused so the
    // instructor can talk over each stage.
    next() {
      this.clearTimer();
      const wasRunning = this.state === 'running';
      const next = this.steps[this.index + 1];
      if (!next) {
        this.state = 'finished';
        this.emit();
        return;
      }
      if (this.state !== 'paused') this.state = 'paused';
      this.applyStep(next);
      if (wasRunning && this.state === 'running') this.scheduleNext();
    }

    reset() {
      this.clearTimer();
      this.index = -1;
      this.state = 'idle';
      this.lastNodeId = null;
      this.hooks.onReset?.();
      this.emit();
    }

    setSpeed(value) {
      const next = Number(value);
      if (!SPEEDS.includes(next)) return;
      this.speed = next;
      // Re-arm the pending timer so the new speed takes effect immediately.
      if (this.state === 'running') this.scheduleNext();
      else this.emit();
    }

    destroy() {
      this.clearTimer();
      this.state = 'idle';
    }
  }

  // ---------------------------------------------------------------------------
  // Renderer: turns a simulation definition into DOM and applies step states
  // ---------------------------------------------------------------------------
  class SimulationStage {
    constructor(simulation, engine) {
      this.simulation = simulation;
      this.engine = engine;
      this.nodeEls = new Map();
      this.edgeEls = new Map();
      this.root = el('div', 'sim-root');
      this.canvas = el('div', 'sim-canvas');
      this.lanes = el('div', 'sim-lanes');
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('class', 'sim-edges');
      this.svg.setAttribute('aria-hidden', 'true');
      this.narration = el('div', 'sim-narration');
      this.narrationLabel = el('span', 'sim-narration-label', '준비되었습니다');
      this.narrationBody = el('p', 'sim-narration-body', simulation.subtitle || '');
      this.narration.append(this.narrationLabel, this.narrationBody);
      this.canvas.append(this.lanes, this.svg);
      this.root.append(this.canvas, this.narration);
      this.build();
    }

    build() {
      const byRow = new Map();
      for (const node of this.simulation.nodes) {
        const row = Number(node.row || 0);
        if (!byRow.has(row)) byRow.set(row, []);
        byRow.get(row).push(node);
      }
      for (const row of [...byRow.keys()].sort((a, b) => a - b)) {
        const lane = el('div', 'sim-lane');
        lane.dataset.row = String(row);
        for (const node of byRow.get(row)) {
          const card = el('div', 'sim-node');
          card.dataset.node = node.id;
          if (node.emphasis) card.classList.add('is-emphasis');
          const check = el('i', 'sim-node-check', '✓');
          check.setAttribute('aria-hidden', 'true');
          const icon = el('span', 'sim-node-icon', node.icon || '');
          const label = el('b', 'sim-node-label', node.label);
          const note = el('small', 'sim-node-note', node.note || '');
          card.append(check, icon, label, note);
          this.nodeEls.set(node.id, card);
          lane.append(card);
        }
        this.lanes.append(lane);
      }

      // Two arrowheads so a connector can be grey while pending and purple once
      // it has been drawn, without relying on context-stroke support.
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      for (const [id, fill] of [['sim-arrow-idle', '#c3cbe4'], ['sim-arrow-on', '#7b6bf0'], ['sim-arrow-live', '#4d7cff']]) {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', id);
        marker.setAttribute('viewBox', '0 0 10 10');
        marker.setAttribute('refX', '8.5');
        marker.setAttribute('refY', '5');
        marker.setAttribute('markerWidth', '4.5');
        marker.setAttribute('markerHeight', '4.5');
        marker.setAttribute('orient', 'auto-start-reverse');
        const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        shape.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
        shape.setAttribute('fill', fill);
        marker.append(shape);
        defs.append(marker);
      }
      this.svg.append(defs);

      for (const edge of this.simulation.edges) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', `sim-edge${edge.curve ? ' is-curve' : ''}`);
        path.dataset.edge = edge.id;
        this.svg.append(path);
        this.edgeEls.set(edge.id, path);
      }
    }

    // Edge geometry depends on final node positions, so it is measured after
    // layout rather than guessed from the data.
    layout() {
      const box = this.canvas.getBoundingClientRect();
      if (!box.width || !box.height) return;
      this.svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      this.svg.setAttribute('width', String(box.width));
      this.svg.setAttribute('height', String(box.height));

      const center = (id) => {
        const node = this.nodeEls.get(id);
        if (!node) return null;
        const rect = node.getBoundingClientRect();
        return {
          x: rect.left - box.left + rect.width / 2,
          y: rect.top - box.top + rect.height / 2,
          left: rect.left - box.left,
          right: rect.right - box.left,
          top: rect.top - box.top,
          bottom: rect.bottom - box.top
        };
      };

      for (const edge of this.simulation.edges) {
        const path = this.edgeEls.get(edge.id);
        const a = center(edge.from);
        const b = center(edge.to);
        if (!path || !a || !b) continue;
        // Stop the connector just short of the target card so the arrowhead is
        // not hidden behind it (connectors render under the cards).
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const span = Math.hypot(dx, dy) || 1;
        const trim = Math.min(10, span / 3);
        const ex = b.x - (dx / span) * trim;
        const ey = b.y - (dy / span) * trim;
        let d;
        if (edge.curve) {
          // Bow away from the node row so a return/branch edge stays readable.
          const midX = (a.x + ex) / 2;
          const dip = Math.max(30, Math.abs(ey - a.y) * 0.5);
          const dir = ey >= a.y ? 1 : -1;
          d = `M ${a.x} ${a.y} Q ${midX} ${a.y + dip * dir} ${ex} ${ey}`;
        } else if (Math.abs(dy) < 6) {
          d = `M ${a.left} ${a.y} L ${ex} ${ey}`;
        } else {
          const midY = (a.y + ey) / 2;
          d = `M ${a.x} ${a.y} C ${a.x} ${midY}, ${ex} ${midY}, ${ex} ${ey}`;
        }
        path.setAttribute('d', d);
        try {
          // Expose the length as a custom property instead of an inline
          // stroke-dashoffset, so the `.is-drawn` class can drive the draw
          // animation through a plain CSS transition (which reduced-motion
          // switches off cleanly).
          const length = Math.max(1, Math.round(path.getTotalLength()));
          path.style.setProperty('--sim-len', String(length));
          // Force a style recalculation so the un-drawn offset is the
          // established start value. Without this, a connect step that lands in
          // the same frame as layout() would skip the transition entirely.
          global.getComputedStyle(path).strokeDashoffset;
        } catch { /* getTotalLength is unavailable while detached */ }
      }
    }

    applyStep(step, ctx) {
      // Exactly one node is "running" at a time and only the connector being
      // drawn is "live", so an instructor can always tell what is happening.
      for (const card of this.nodeEls.values()) card.classList.remove('is-running');
      for (const path of this.edgeEls.values()) path.classList.remove('is-live');

      const card = this.nodeEls.get(step.target);
      if (card) card.classList.add('is-shown');

      if (step.action === 'connect' && ctx.from && ctx.from !== step.target) {
        for (const edge of this.simulation.edges) {
          if (edge.from === ctx.from && edge.to === step.target) {
            // Applied synchronously: requestAnimationFrame is throttled in
            // hidden/occluded windows, and a connector that never appears is a
            // correctness bug, not just a missing animation.
            const path = this.edgeEls.get(edge.id);
            if (path) {
              path.classList.add('is-drawn', 'is-live');
            }
          }
        }
      }
      if (step.action === 'activate' && card) card.classList.add('is-running');
      if (step.action === 'complete' && card) card.classList.add('is-done');

      this.narrationLabel.textContent = `${ctx.index} / ${ctx.total} · ${step.label}`;
      this.narrationBody.textContent = step.narration || '';
      this.layout();
    }

    // On a completed run every node that was reached reads as finished, so the
    // end state is unambiguous even for nodes that only have a `show` or
    // `connect` step (inputs, holds and other non-outcome stages).
    finish() {
      for (const card of this.nodeEls.values()) {
        if (card.classList.contains('is-shown')) card.classList.add('is-done');
      }
      for (const path of this.edgeEls.values()) path.classList.remove('is-live');
    }

    reset() {
      for (const card of this.nodeEls.values()) {
        card.classList.remove('is-shown', 'is-running', 'is-done');
      }
      for (const path of this.edgeEls.values()) {
        path.classList.remove('is-drawn', 'is-live');
      }
      this.narrationLabel.textContent = '준비되었습니다';
      this.narrationBody.textContent = this.simulation.subtitle || '';
      this.layout();
    }
  }

  // ---------------------------------------------------------------------------
  // View: entry panel + stage + transport controls, for one lecture scene
  // ---------------------------------------------------------------------------
  class SimulationView {
    constructor(options) {
      this.options = options;
      this.scene = options.scene;
      this.simulations = options.simulations || [];
      this.activeId = null;
      this.engine = null;
      this.stage = null;
      this.built = false;
    }

    get isOpen() {
      return this.activeId !== null;
    }

    // Entry panel markup, rendered by the lecture into the static scene body.
    entryMarkup() {
      if (!this.simulations.length) return '';
      const buttons = this.simulations.map((sim, i) => `
        <button class="sim-start" type="button" data-sim="${sim.id}">
          <span class="sim-start-icon">▶</span>
          <span class="sim-start-text"><b>시뮬레이션 시작</b><small>${sim.title}</small></span>
        </button>`).join('');
      return `
        <div class="sim-entry" data-sim-entry>
          <div class="sim-entry-copy">
            <b>시뮬레이션으로 보기</b>
            <small>단계를 따라가며 흐름을 확인합니다 · Space 시작/일시정지 · → 다음 단계 · R 처음부터</small>
          </div>
          <div class="sim-entry-buttons">${buttons}</div>
        </div>`;
    }

    build() {
      if (this.built) return;
      this.built = true;
      this.host = el('div', 'sim-host');
      this.host.hidden = true;

      this.head = el('div', 'sim-head');
      this.title = el('div', 'sim-title');
      const chapter = this.scene.chapterLabel ? `${this.scene.chapterLabel} · ${this.scene.title}` : this.scene.title;
      this.context = el('p', 'sim-context', `장면 ${chapter}`);
      this.titleName = el('b', 'sim-title-name', this.simulations[0]?.title || '');
      this.titleSub = el('small', 'sim-title-sub', this.simulations[0]?.subtitle || '');
      this.title.append(this.context, this.titleName, this.titleSub);

      this.tabs = el('div', 'sim-tabs');
      this.tabs.hidden = this.simulations.length < 2;

      this.transport = el('div', 'sim-transport');
      this.btnStart = this.button('sim-btn sim-btn-primary', '▶ 시작', 'start');
      this.btnPause = this.button('sim-btn', '⏸ 일시정지', 'pause');
      this.btnResume = this.button('sim-btn', '▶ 계속', 'resume');
      this.btnNext = this.button('sim-btn', '⏭ 다음 단계', 'next');
      this.btnReset = this.button('sim-btn', '↻ 처음부터', 'reset');
      this.btnClose = this.button('sim-btn sim-btn-quiet', '정적 화면', 'close');

      this.speeds = el('div', 'sim-speeds');
      this.speeds.append(el('span', 'sim-speeds-label', '속도'));
      this.speedButtons = SPEEDS.map((speed) => {
        const btn = el('button', 'sim-speed', `${speed}x`);
        btn.type = 'button';
        btn.dataset.speed = String(speed);
        btn.addEventListener('click', () => this.engine?.setSpeed(speed));
        this.speeds.append(btn);
        return btn;
      });

      this.progress = el('div', 'sim-progress');
      this.progressBar = el('i', 'sim-progress-bar');
      this.progressCount = el('span', 'sim-progress-count', '0 / 0');
      this.progress.append(this.progressBar, this.progressCount);

      this.transport.append(
        this.btnStart, this.btnPause, this.btnResume,
        this.btnNext, this.btnReset, this.speeds, this.progress, this.btnClose
      );
      this.head.append(this.title, this.tabs);
      this.host.append(this.head, this.transport);
      this.options.container.append(this.host);
      this.renderTabs();
    }

    button(className, label, role) {
      const btn = el('button', className, label);
      btn.type = 'button';
      btn.dataset.role = role;
      btn.addEventListener('click', () => this.onControl(role));
      return btn;
    }

    renderTabs() {
      this.tabs.innerHTML = '';
      if (this.simulations.length < 2) return;
      for (const sim of this.simulations) {
        const tab = el('button', 'sim-tab', sim.title);
        tab.type = 'button';
        tab.dataset.sim = sim.id;
        tab.classList.toggle('is-active', sim.id === this.activeId);
        tab.addEventListener('click', () => this.open(sim.id));
        this.tabs.append(tab);
      }
    }

    onControl(role) {
      if (!this.engine) return;
      if (role === 'start') this.engine.play();
      else if (role === 'pause') this.engine.pause();
      else if (role === 'resume') this.engine.resume();
      else if (role === 'next') this.engine.next();
      else if (role === 'reset') this.engine.reset();
      else if (role === 'close') this.close();
    }

    // Opens a simulation, hiding the static scene body.
    open(simulationId) {
      const sim = this.simulations.find((s) => s.id === simulationId) || this.simulations[0];
      if (!sim) return;
      this.build();
      if (this.activeId === sim.id && this.stage) return;
      this.teardownStage();
      this.activeId = sim.id;

      this.stage = new SimulationStage(sim, null);
      this.engine = new SimulationEngine(sim, {
        onStep: (step, ctx) => this.stage.applyStep(step, ctx),
        onReset: () => this.stage.reset(),
        onFinish: () => this.stage.finish(),
        onState: (state) => this.syncControls(state)
      });
      this.stage.engine = this.engine;
      this.host.append(this.stage.root);
      this.titleName.textContent = sim.title;
      this.titleSub.textContent = sim.subtitle || '';
      this.renderTabs();

      if (this.options.staticLayer) this.options.staticLayer.hidden = true;
      this.host.hidden = false;
      this.stage.layout();
      this.engine.emit();
      this.options.onOpen?.(sim.id);
    }

    teardownStage() {
      if (this.engine) this.engine.destroy();
      if (this.stage) this.stage.root.remove();
      this.engine = null;
      this.stage = null;
    }

    close() {
      this.teardownStage();
      this.activeId = null;
      this.host.hidden = true;
      if (this.options.staticLayer) this.options.staticLayer.hidden = false;
      this.options.onClose?.();
    }

    syncControls(state) {
      const running = state.state === 'running';
      const paused = state.state === 'paused';
      this.btnStart.disabled = state.state !== 'idle';
      this.btnPause.disabled = !running;
      this.btnResume.disabled = !paused;
      this.btnNext.disabled = state.state === 'finished';
      this.btnReset.disabled = state.state === 'idle';
      this.speedButtons.forEach((btn) => {
        btn.classList.toggle('is-active', Number(btn.dataset.speed) === state.speed);
      });
      const ratio = state.total ? (state.completed / state.total) * 100 : 0;
      this.progressBar.style.width = `${ratio}%`;
      this.progressCount.textContent = `${state.completed} / ${state.total}`;
      this.root?.classList?.toggle('is-finished', state.state === 'finished');
      this.host.classList.toggle('is-running', running);
      this.host.classList.toggle('is-finished', state.state === 'finished');
      if (state.state === 'finished') {
        this.stage.narrationLabel.textContent = '완료';
        this.stage.narrationBody.textContent = `${this.stage.simulation.title} — 재생이 끝났습니다. 처음부터 다시 보거나 정적 화면으로 돌아갈 수 있습니다.`;
      }
      this.options.onState?.(state);
    }

    // Keyboard arbitration. Returns true when the view consumed the key, so
    // the lecture can keep its own scene navigation for everything else.
    handleKey(event) {
      if (!this.isOpen || !this.engine) return false;
      const key = event.key;
      if (key === ' ' || key === 'Spacebar') {
        this.engine.toggle();
        return true;
      }
      if (key === 'ArrowRight') {
        this.engine.next();
        return true;
      }
      if (key === 'r' || key === 'R' || key === 'ArrowLeft') {
        this.engine.reset();
        return true;
      }
      if (key === 'Escape') {
        this.close();
        return true;
      }
      return false;
    }

    relayout() {
      this.stage?.layout();
    }

    destroy() {
      this.close();
      this.built = false;
      this.host?.remove();
    }
  }

  global.JuCodingSimulation = { SPEEDS, ACTIONS, SimulationEngine, SimulationStage, SimulationView };
})(typeof window !== 'undefined' ? window : globalThis);
