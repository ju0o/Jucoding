'use strict';

// JuCoding V4 lecture smoke.
//
// Covers the deck contract (21 scenes, 6 chapters, both practice forms, the
// three dialogs), the six lecture visuals, layout at 1366x768 and 1920x1080,
// zero console errors, offline operation, and the full simulation control
// matrix: start / pause / resume / next / reset / speed / keyboard /
// prefers-reduced-motion.
//
// The window is hidden by default so QA never steals focus or covers the
// desktop. Background throttling is disabled and the compositor is invalidated
// before every capture, which keeps capturePage() from returning a stale frame.
// Set --visible (or JUCODING_QA_VISIBLE=1) to run with a real visible window.
//
// prefers-reduced-motion still needs a real media emulation, and the layout
// checks measure actual pixels, so neither depends on the window being visible.

const { app, BrowserWindow, session } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const qaDir = path.join(root, 'artifacts', 'qa');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The window is hidden by default so QA never steals focus or covers the
// desktop. Rendering still happens (background throttling is disabled and the
// compositor is invalidated before each capture), which keeps capturePage()
// honest. Set JUCODING_QA_VISIBLE=1 to run with a real visible window.

// argv is checked as well as the env var because WSL does not forward
// environment variables into Windows binaries, which is exactly the host
// this QA runs on.
const VISIBLE = process.env.JUCODING_QA_VISIBLE === '1' || process.argv.includes('--visible');

const ASSETS = [
  { file: 'ai-agent-vibecoding.webp', scene: 'cover' },
  { file: 'chat-ai-vs-computer-agent.webp', scene: 'chat-terminal' },
  { file: 'beginner-dev-terms.webp', scene: 'web-terms' },
  { file: 'project-planning-terms.webp', scene: 'planning-terms-a' },
  { file: 'automation-deploy-mcp.webp', scene: 'mcp' },
  { file: 'safety-boundary.webp', scene: 'safety' }
];

// Simulation ids, with the scene index they are attached to.
const SIMULATIONS = [
  { id: 'chat-agent', scene: 3 },
  { id: 'ai-agent', scene: 3 },
  { id: 'chatgpt-vs-computer-agent', scene: 4 },
  { id: 'frontend-api-backend', scene: 6 },
  { id: 'mcp-worker', scene: 16 },
  { id: 'sns-automation', scene: 17 },
  { id: 'safety-boundary', scene: 19 }
];

function check(results, name, ok, detail) {
  results[name] = { ok: Boolean(ok), ...(detail ? { detail } : {}) };
  return Boolean(ok);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: VISIBLE,
    // useContentSize: width/height describe the viewport, not the window frame.
    // Without it the same "1366x768" window yields a 703px viewport under a
    // window manager and a 768px one under xvfb, so the same slide measures
    // differently in CI and on a desktop.
    useContentSize: true,
    width: 1366,
    height: 768,
    backgroundColor: '#eef2ff',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  // A hidden window must still keep rendering, otherwise a capture can return a
  // stale frame and every screenshot assertion becomes meaningless.
  win.webContents.setBackgroundThrottling(false);

  // Chromium only produces a trustworthy compositor frame for a window the user
  // can actually see: on a hidden window capturePage() happily returns a stale
  // or blank image, and Page.captureScreenshot(fromSurface:false) returns
  // nothing useful. No assertion below depends on a screenshot, so hidden runs
  // simply skip capture and say so instead of writing a misleading PNG.
  const capture = async (name) => {
    if (!VISIBLE) {
      skippedScreenshots.push(name);
      return false;
    }
    const image = await win.webContents.capturePage();
    fs.writeFileSync(path.join(qaDir, name), image.toPNG());
    return true;
  };
  const skippedScreenshots = [];

  const errors = [];
  win.webContents.on('console-message', (_event, level, message) => {
    if (/Electron Security Warning/i.test(message)) return;
    if (level >= 2 || /uncaught|failed|error/i.test(message)) errors.push(message);
  });

  // Offline: record and block anything that is not a local file:// load.
  const remoteRequests = [];
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    if (!/^(file|devtools|blob|data|jucoding-archive):/i.test(details.url)) {
      remoteRequests.push(details.url);
      callback({ cancel: true });
      return;
    }
    callback({ cancel: false });
  });

  const results = {};
  fs.mkdirSync(qaDir, { recursive: true });

  // Labels every evaluateJavaScript call so a throw points at the failing step.
  let step = 'startup';
  const evaluate = async (code) => {
    try {
      return await win.webContents.executeJavaScript(code, true);
    } catch (error) {
      throw new Error(`[${step}] ${error.message}`);
    }
  };
  const run = async (label, code) => {
    step = label;
    return evaluate(code);
  };

  try {
    await win.loadFile(path.join(root, 'src/content/v4/one-shot.html'));
    await wait(600);
    // Layout assertions below compare real element heights, and a hidden window
    // never loads the webfont, so Korean text would fall back to a wider face and
    // every slide would measure several lines too tall.
    await win.webContents.executeJavaScript('document.fonts.ready');
    await wait(150);

    // ---------------------------------------------------------------- deck ---
    const initial = await run('deck', `
      (() => ({
        title: document.title,
        brand: document.querySelector('.brand strong')?.textContent || '',
        deck: Boolean(document.querySelector('.deck-shell')),
        stage: Boolean(document.querySelector('#stage .scene')),
        counter: document.querySelector('#scene-counter')?.textContent || '',
        chapterButtons: document.querySelectorAll('#chapter-grid .chapter-button').length,
        hasNext: Boolean(document.querySelector('#next')),
        hasPrev: Boolean(document.querySelector('#prev')),
        hasMap: Boolean(document.querySelector('#btn-map')),
        hasNotes: Boolean(document.querySelector('#btn-notes')),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
      }))()
    `);
    const sceneCount = Number((initial.counter.match(/\/\s*(\d+)/) || [])[1] || 0);

    check(results, 'qa22_sceneCount', sceneCount === 21, `${sceneCount} scenes`);
    check(results, 'qa22_deckShell', initial.deck && initial.stage && initial.hasNext && initial.hasPrev);
    check(results, 'qa22_chapterGrid', initial.chapterButtons === 6);
    check(results, 'qa24_noOverflow1366', !initial.overflowX && !initial.overflowY);

    // Every scene renders without throwing and stays inside the stage.
    const allScenes = await run('allScenes', `
      (() => {
        const api = window.__jucodingV4;
        const bad = [];
        const stage = document.querySelector('.stage-wrap').getBoundingClientRect();
        for (let i = 0; i < api.sceneCount; i += 1) {
          api.gotoScene(i);
          const scene = document.querySelector('#stage .scene');
          if (!scene) { bad.push({ i, why: 'no scene' }); continue; }
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) bad.push({ i, why: 'overflowX' });
          if (document.documentElement.scrollHeight > document.documentElement.clientHeight + 1) bad.push({ i, why: 'overflowY' });
          // The stage clips with overflow:hidden, so a scene that runs past it is
          // silently amputated rather than scrollable, and documentElement never
          // reports it. Two slides were losing their simulation button this way
          // for a long time. Compare the last child's edge against the stage.
          const kids = [...scene.children];
          const last = kids[kids.length - 1];
          if (last) {
            const over = Math.round(last.getBoundingClientRect().bottom - stage.bottom);
            if (over > 1) bad.push({ i, why: 'stageCut', over });
          }
          // A code sample that scrolls is a code sample the room cannot read.
          for (const body of scene.querySelectorAll('.term-body')) {
            if (body.scrollHeight > body.clientHeight + 1) {
              bad.push({ i, why: 'codeClipped', sample: body.textContent.slice(0, 24) });
            }
          }
        }
        api.gotoScene(0);
        return { count: api.sceneCount, bad, titles: api.scenes.map((s) => s.id) };
      })()
    `);
        check(results, 'qa22_allScenesRender', allScenes.bad.length === 0, allScenes.bad);

    await capture('jucoding-v4-1366x768.png');

    // ------------------------------------------------------------- assets ---
    const assets = [];
    for (const asset of ASSETS) {
      // Decoding is asynchronous, and on a window that is not on screen the
      // renderer may not have started the decode yet. Poll instead of reading
      // naturalWidth once, which made this check intermittently fail.
      const probe = await run('asset', `
        (async () => {
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          const api = window.__jucodingV4;
          const target = api.scenes.findIndex((s) => s.id === ${JSON.stringify(asset.scene)});
          api.gotoScene(target);
          let img = null;
          for (let i = 0; i < 40; i += 1) {
            img = document.querySelector('#stage img[data-asset-full*="${asset.file}"]');
            if (img && img.complete && img.naturalWidth > 0) break;
            await sleep(100);
          }
          return {
            found: Boolean(img),
            complete: img ? img.complete : false,
            natural: img ? img.naturalWidth : 0,
            src: img ? img.getAttribute('src') : ''
          };
        })()
      `);
      assets.push({ ...asset, ...probe, ok: probe.found && probe.natural > 0 });
    }
    check(results, 'qa23_sixWebp', assets.every((a) => a.ok), assets);

    // --------------------------------------------------------- simulations ---
    const transports = await run('transports', `
      (() => {
        const api = window.__jucodingV4;
        api.gotoScene(3);
        document.querySelector('[data-sim="ai-agent"]').click();
        const host = document.querySelector('.sim-host');
        const roles = [...host.querySelectorAll('[data-role]')].map((b) => b.dataset.role);
        const speeds = [...host.querySelectorAll('[data-speed]')].map((b) => b.dataset.speed);
        api.closeSimulation();
        return { roles, speeds };
      })()
    `);
    for (const role of ['start', 'pause', 'resume', 'next', 'reset']) {
      check(results, `transport_${role}`, transports.roles.includes(role));
    }
    check(results, 'transport_speeds',
      transports.speeds.join(',') === '0.75,1,1.5',
      transports.speeds.join(','));

    // 5) start  6) pause  7) resume  8) next  9) reset  10) speed
    const controls = await run('controls', `
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const api = window.__jucodingV4;
        const state = () => api.simulationState;
        const role = (r) => document.querySelector('[data-role="' + r + '"]');
        const key = (k) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));

        api.gotoScene(3);
        document.querySelector('[data-sim="ai-agent"]').click();
        await sleep(120);
        const out = { opened: api.simulationOpen, total: state().total };

        out.beforeStart = state().state;
        role('start').click();
        await sleep(160);
        out.afterStart = state().state;
        out.startedStep = state().stepIndex;
        out.disabled = {
          pause: role('pause').disabled,
          resume: role('resume').disabled,
          next: role('next').disabled
        };

        await sleep(1500);
        out.autoAdvanced = state().stepIndex > out.startedStep;
        out.runningStep = state().stepIndex;

        role('pause').click();
        out.pausedState = state().state;
        const heldAt = state().stepIndex;
        await sleep(1300);
        out.pauseHeld = state().stepIndex === heldAt;

        role('resume').click();
        out.resumedState = state().state;
        await sleep(150);
        role('pause').click();

        const beforeNext = state().stepIndex;
        role('next').click();
        out.nextDelta = state().stepIndex - beforeNext;

        role('next').click();
        out.nextDeltaAgain = state().stepIndex - beforeNext;

        document.querySelector('[data-speed="1.5"]').click();
        out.speed = state().speed;
        document.querySelector('[data-speed="0.75"]').click();
        out.speedSlow = state().speed;
        document.querySelector('[data-speed="1"]').click();
        out.speedNormal = state().speed;

        role('reset').click();
        out.afterReset = { state: state().state, stepIndex: state().stepIndex };
        out.shownAfterReset = document.querySelectorAll('.sim-node.is-shown').length;
        api.closeSimulation();
        return out;
      })()
    `);
    check(results, 'qa5_start', controls.opened && controls.afterStart === 'running' && controls.beforeStart === 'idle', controls.afterStart);
    check(results, 'qa5_autoAdvance', controls.autoAdvanced, `step ${controls.startedStep} -> ${controls.runningStep}`);
    check(results, 'qa6_pause', controls.pausedState === 'paused' && controls.pauseHeld);
    check(results, 'qa7_resume', controls.resumedState === 'running');
    check(results, 'qa8_next', controls.nextDelta === 1 && controls.nextDeltaAgain === 2, `+${controls.nextDelta} +${controls.nextDeltaAgain}`);
    check(results, 'qa9_reset',
      controls.afterReset.state === 'idle'
      && controls.afterReset.stepIndex === -1
      && controls.shownAfterReset === 0);
    check(results, 'qa10_speed',
      controls.speed === 1.5 && controls.speedSlow === 0.75 && controls.speedNormal === 1);

    // 11) keyboard, and the arbitration with the lecture's own next/prev keys
    const keyboard = await run('keyboard', `
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const api = window.__jucodingV4;
        const state = () => api.simulationState;
        const key = (k) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
        const out = {};

        api.gotoScene(3);
        const sceneAtStart = api.sceneIndex;
        document.querySelector('[data-sim="ai-agent"]').click();
        await sleep(120);

        key(' ');
        await sleep(160);
        out.spaceStarts = state().state === 'running';
        const at = state().stepIndex;
        key(' ');
        out.spacePauses = state().state === 'paused' && state().stepIndex === at;

        const beforeRight = state().stepIndex;
        key('ArrowRight');
        out.rightIsNextStep = state().stepIndex === beforeRight + 1;
        out.rightDidNotChangeScene = api.sceneIndex === sceneAtStart;

        const beforeReset = state().stepIndex;
        key('r');
        out.rResets = state().stepIndex === -1 && beforeReset >= 0;
        out.rDidNotChangeScene = api.sceneIndex === sceneAtStart;

        // With the simulation closed the lecture keys must behave as before.
        api.closeSimulation();
        key('ArrowRight');
        out.closedRightAdvancesScene = api.sceneIndex === sceneAtStart + 1;
        key('ArrowLeft');
        out.closedLeftGoesBack = api.sceneIndex === sceneAtStart;

        key('Escape');
        out.escapeHarmless = true;
        return out;
      })()
    `);
    check(results, 'qa11_keyboard',
      keyboard.spaceStarts && keyboard.spacePauses && keyboard.rightIsNextStep
      && keyboard.rightDidNotChangeScene && keyboard.rResets && keyboard.rDidNotChangeScene
      && keyboard.closedRightAdvancesScene && keyboard.closedLeftGoesBack,
      keyboard);

    // Every simulation: opens, reaches the end, draws every connector, fits.
    const simRuns = [];
    for (const sim of SIMULATIONS) {
      const probeRun = await run('sim', `
        (async () => {
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          const api = window.__jucodingV4;
          api.gotoScene(${sim.scene});
          await sleep(80);
          const button = document.querySelector('[data-sim="${sim.id}"]');
          if (!button) return { missing: true };
          button.click();
          await sleep(120);
          const total = api.simulationState.total;
          let guard = 0;
          while (api.simulationState.state !== 'finished' && guard < 40) {
            document.querySelector('[data-role="next"]').click();
            guard += 1;
            await sleep(12);
          }
          await sleep(120);
          const edges = [...document.querySelectorAll('.sim-edge')];
          const nodes = [...document.querySelectorAll('.sim-node')];
          const host = document.querySelector('.sim-host').getBoundingClientRect();
          const stage = document.querySelector('.stage-wrap').getBoundingClientRect();
          return {
            title: document.querySelector('.sim-title-name')?.textContent || '',
            total,
            steps: guard,
            finished: api.simulationState.state === 'finished',
            nodes: nodes.length,
            shown: nodes.filter((n) => n.classList.contains('is-shown')).length,
            done: nodes.filter((n) => n.classList.contains('is-done')).length,
            edges: edges.length,
            drawn: edges.filter((e) => e.classList.contains('is-drawn')).length,
            withGeometry: edges.filter((e) => (e.getAttribute('d') || '').length > 4).length,
            fitsStage: host.bottom <= stage.bottom + 1,
            running: nodes.filter((n) => n.classList.contains('is-running')).length,
            overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
          };
        })()
      `);
      simRuns.push({ id: sim.id, ...probeRun });
      if (sim.id === 'ai-agent' || sim.id === 'chatgpt-vs-computer-agent' || sim.id === 'safety-boundary') {
        await capture(`jucoding-v4-sim-${sim.id}.png`);
      }
    }
    const simOk = simRuns.every((r) => !r.missing
      && r.finished
      && r.shown === r.nodes
      && r.done === r.nodes
      && r.drawn === r.edges
      && r.withGeometry === r.edges
      && r.fitsStage
      && r.running === 0);
    check(results, 'qa5_allSimulations', simOk, simRuns);

    // 12) prefers-reduced-motion
    let reduced = { error: 'debugger unavailable' };
    try {
      win.webContents.debugger.attach('1.3');
      await win.webContents.debugger.sendCommand('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
      });
      await wait(200);
      reduced = await run('reduced', `
        (async () => {
          const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
          const api = window.__jucodingV4;
          api.gotoScene(3);
          document.querySelector('[data-sim="ai-agent"]').click();
          await sleep(100);
          const running = document.querySelector('.sim-node.is-running');
          const out = {
            matches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            pulseAnimation: running ? getComputedStyle(running, '::after').animationName : 'none',
            nodeTransition: getComputedStyle(document.querySelector('.sim-node')).transitionDuration,
            edgeTransition: getComputedStyle(document.querySelector('.sim-edge')).transitionDuration
          };
          // State must still advance with motion switched off.
          document.querySelector('[data-role="next"]').click();
          await sleep(80);
          out.stillSteps = api.simulationState.stepIndex;
          api.closeSimulation();
          return out;
        })()
      `);
      win.webContents.debugger.detach();
    } catch (err) {
      reduced = { error: err.message };
    }
    check(results, 'qa12_reducedMotion',
      reduced.matches === true
      && reduced.pulseAnimation === 'none'
      && /^0s(, 0s)*$/.test(String(reduced.nodeTransition))
      && /^0s(, 0s)*$/.test(String(reduced.edgeTransition))
      && reduced.stillSteps === 0,
      reduced);

    // ------------------------------------------------------------- layout ---
    // 25) 1920x1080
    win.setContentSize(1920, 1080);
    await wait(500);
    const wide = await run('wide', `
      (() => {
        const out = [];
        const api = window.__jucodingV4;
        for (const i of [0, 3, 6, 19]) {
          api.gotoScene(i);
          out.push({
            i,
            overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
            overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
          });
        }
        api.gotoScene(4);
        document.querySelector('[data-sim="chatgpt-vs-computer-agent"]').click();
        const host = document.querySelector('.sim-host').getBoundingClientRect();
        const stage = document.querySelector('.stage-wrap').getBoundingClientRect();
        return {
          viewport: { w: window.innerWidth, h: window.innerHeight },
          out,
          simFits: host.bottom <= stage.bottom + 1
        };
      })()
    `);
    check(results, 'qa25_noOverflow1920',
      wide.out.every((o) => !o.overflowX && !o.overflowY) && wide.simFits, wide);
    await capture('jucoding-v4-1920x1080.png');
    win.setContentSize(1366, 768);
    await wait(350);

    // ------------------------------------------------- forms and dialogs ---
    const projectForm = await run('projectForm', `
      (() => {
        const clickNextUntil = (selector, max = 30) => {
          let guard = 0;
          while (!document.querySelector(selector) && guard < max) {
            document.querySelector('#next')?.click();
            guard += 1;
          }
          return guard;
        };
        const steps = clickNextUntil('#project-build');
        const what = document.querySelector('#project-what');
        const who = document.querySelector('#project-who');
        const core = document.querySelector('#project-core');
        if (what) what.value = '모임 자료를 자동으로 정리하는 앱';
        if (who) who.value = '스터디 운영자';
        if (core) core.value = '메모를 넣으면 회차 자료 초안을 만든다';
        document.querySelector('#project-build')?.click();
        return {
          steps,
          present: Boolean(document.querySelector('#project-build')),
          output: document.querySelector('#project-plan-output')?.textContent || '',
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
        };
      })()
    `);

    const automationForm = await run('automationForm', `
      (() => {
        let guard = 0;
        while (!document.querySelector('#auto-build') && guard < 30) {
          document.querySelector('#next')?.click();
          guard += 1;
        }
        const task = document.querySelector('#auto-task');
        const worker = document.querySelector('#auto-worker');
        const result = document.querySelector('#auto-result');
        if (task) task.value = '재고 기록';
        if (worker) worker.value = '사진을 읽고 품목별 수량 정리';
        if (result) result.value = '날짜별 재고표 저장';
        document.querySelector('#auto-build')?.click();
        return {
          steps: guard,
          present: Boolean(document.querySelector('#auto-build')),
          output: document.querySelector('#auto-output')?.textContent || '',
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
        };
      })()
    `);

    const dialogs = await run('dialogs', `
      (() => {
        const chapters = document.querySelector('#chapter-dialog');
        const map = document.querySelector('#map-dialog');
        document.querySelector('#btn-chapters')?.click();
        const chaptersOpen = Boolean(chapters?.open);
        chapters?.close();
        document.querySelector('#btn-map')?.click();
        const mapOpen = Boolean(map?.open);
        map?.close();
        document.querySelector('#btn-notes')?.click();
        const notesOpen = document.querySelector('#speaker-cue')?.classList.contains('open') || false;
        const summary = document.querySelector('#cue-summary')?.textContent || '';
        return { chaptersOpen, mapOpen, notesOpen, summary };
      })()
    `);

    // 26) console errors  27) offline
    check(results, 'qa26_consoleErrors', errors.length === 0, errors);
    check(results, 'qa27_offline', remoteRequests.length === 0, remoteRequests);

    check(results, 'projectForm',
      projectForm.present
      && projectForm.output.includes('모임 자료를 자동으로 정리하는 앱')
      && projectForm.output.includes('스터디 운영자')
      && !projectForm.overflowX && !projectForm.overflowY);
    check(results, 'automationForm',
      automationForm.present
      && automationForm.output.includes('재고 기록')
      && automationForm.output.includes('날짜별 재고표 저장')
      && !automationForm.overflowX && !automationForm.overflowY);
    check(results, 'dialogs', dialogs.chaptersOpen && dialogs.mapOpen && dialogs.notesOpen);
    check(results, 'cueSummary', dialogs.summary.length > 0, dialogs.summary);

    const failed = Object.entries(results).filter(([, v]) => !v.ok).map(([k]) => k);
    const report = {
      ok: failed.length === 0,
      failed,
      results,
      initial,
      assets,
      controls,
      keyboard,
      simRuns,
      reduced,
      wide,
      projectForm,
      automationForm,
      dialogs,
      errors,
      remoteRequests,
      visible: VISIBLE,
      screenshots: {
        captured: skippedScreenshots.length === 0,
        skipped: skippedScreenshots,
        hint: skippedScreenshots.length
          ? 'Hidden window: Chromium does not produce a trustworthy frame, so screenshots were skipped. Re-run with --visible for images. No assertion depends on them.'
          : 'Screenshots written to artifacts/qa.'
      }
    };
    fs.writeFileSync(path.join(qaDir, 'jucoding-v4-1366x768.json'), JSON.stringify(report, null, 2), 'utf-8');
    for (const [name, value] of Object.entries(results)) {
      console.log(`${value.ok ? '✓' : '✗'} ${name}`);
    }
    if (skippedScreenshots.length) {
      console.log(`- screenshots skipped (hidden window): ${skippedScreenshots.join(', ')}`);
      console.log('  re-re-run with --visible to capture images');
    }
    if (failed.length) {
      console.error(`\nFAILED: ${failed.join(', ')}`);
      console.error(JSON.stringify({ controls, keyboard, simRuns, reduced, wide }, null, 2));
    }
    app.exit(failed.length ? 1 : 0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
