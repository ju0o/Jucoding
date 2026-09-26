'use strict';

// JuCoding V4 home shell. Renders the V4 default product UI directly —
// no legacy course-management DOM is loaded or patched by this file.

(() => {
  const LECTURE_URL = '../../content/v4/one-shot.html';
  const ASSET_BASE = '../../assets/lecture/v4/';
  const bridge = window.vibeCodingApp || null;

  const chapters = [
    { id: 'cover', label: '01', title: '왜 바이브코딩인가?', time: '약 25분', desc: '만들어진 공간 사용에서 내 도구 만들기로' },
    { id: 'ai-agent', label: '02', title: 'AI와 Agent', time: '약 25분', desc: '대답하는 AI에서 행동하는 Agent로' },
    { id: 'web-terms', label: '03', title: '기본 개발 용어', time: '약 30분', desc: '프론트엔드 · 백엔드 · API · DB · GUI/TUI/CLI' },
    { id: 'planning-terms-a', label: '04', title: '프로젝트 기획 용어', time: '약 40분', desc: 'PRD · WBS · 화면 스케치 · ERD · SSOT' },
    { id: 'dev-deploy', label: '05', title: '개발서버 · 배포 · Git', time: '약 30분', desc: '내 작업실에서 세상에 공개하기까지' },
    { id: 'mcp', label: '06', title: 'MCP · Worker · 자동화', time: '약 20분', desc: '도구 연결과 영상 · SNS 자동화 흐름' },
    { id: 'safety', label: '＋', title: '안전 경계', time: '약 10분', desc: '화면 밖 행동은 더 강한 확인' }
  ];

  const assets = [
    { file: 'ai-agent-vibecoding.webp', title: 'AI · Agent · 바이브코딩 개념도', use: '제1장 대표 자료' },
    { file: 'chat-ai-vs-computer-agent.webp', title: '대화형 AI와 컴퓨터 Agent 비교표', use: '제2장 보조 자료 · 요금제는 참고용' },
    { file: 'beginner-dev-terms.webp', title: '기초 개발 용어 정리도', use: '제3장 대표 자료' },
    { file: 'project-planning-terms.webp', title: '프로젝트 기획 용어 정리도', use: '제4장 대표 자료' },
    { file: 'automation-deploy-mcp.webp', title: '배포 · MCP · Agent · Worker 정리도', use: '제6장 대표 자료' },
    { file: 'safety-boundary.webp', title: '안전 경계 정리도', use: '마무리 안전 수업 핵심 자료' }
  ];

  function lectureUrl(sceneId) {
    return sceneId ? `${LECTURE_URL}#scene=${sceneId}` : LECTURE_URL;
  }

  async function openLecture(sceneId) {
    try {
      if (bridge && typeof bridge.toggleFullscreen === 'function') {
        const isFs = await bridge.getFullscreen().catch(() => false);
        if (!isFs) await bridge.toggleFullscreen().catch(() => {});
      }
    } catch { /* fullscreen is best-effort outside the packaged app */ }
    window.location.href = lectureUrl(sceneId);
  }

  // Section navigation
  const navButtons = [...document.querySelectorAll('.home-nav button')];
  function gotoSection(name) {
    navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.section === name));
    document.querySelectorAll('.home-section').forEach((sec) => {
      sec.classList.toggle('active', sec.id === `sec-${name}`);
    });
  }
  navButtons.forEach((btn) => btn.addEventListener('click', () => gotoSection(btn.dataset.section)));
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => gotoSection(btn.dataset.goto));
  });

  // Chapter list
  const chapterList = document.getElementById('chapter-list');
  chapterList.innerHTML = chapters.map((chapter) => `
    <button class="chapter-row" type="button" data-scene="${chapter.id}">
      <span class="chapter-num">${chapter.label}</span>
      <span class="chapter-copy"><b>${chapter.title}</b><small>${chapter.desc}</small></span>
      <span class="chapter-time">${chapter.time}</span>
    </button>`).join('');
  chapterList.querySelectorAll('[data-scene]').forEach((btn) => {
    btn.addEventListener('click', () => openLecture(btn.dataset.scene));
  });

  document.getElementById('btn-start-lecture').addEventListener('click', () => openLecture());
  document.getElementById('btn-goto-curriculum').addEventListener('click', () => gotoSection('lecture'));
  document.querySelectorAll('[data-lecture-scene]').forEach((btn) => {
    btn.addEventListener('click', () => openLecture(btn.dataset.lectureScene));
  });

  // Asset library
  const assetGrid = document.getElementById('asset-grid');
  assetGrid.innerHTML = assets.map((asset) => `
    <figure class="asset-thumb" data-full="${ASSET_BASE}${asset.file}" data-title="${asset.title}" data-cap="${asset.use}">
      <img src="${ASSET_BASE}${asset.file}" alt="${asset.title}" loading="lazy">
      <figcaption><b>${asset.title}</b><small>${asset.use}</small></figcaption>
    </figure>`).join('');

  const assetDialog = document.getElementById('asset-dialog');
  assetGrid.addEventListener('click', (event) => {
    const fig = event.target.closest('.asset-thumb');
    if (!fig || !assetDialog) return;
    const img = document.getElementById('asset-dialog-img');
    if (img) {
      img.src = fig.dataset.full;
      img.alt = fig.dataset.title || '자료';
    }
    document.getElementById('asset-dialog-title').textContent = fig.dataset.title || '자료';
    document.getElementById('asset-dialog-cap').textContent = `${fig.dataset.cap || ''} · 인터넷 없이 표시됩니다`;
    if (!assetDialog.open) assetDialog.showModal();
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.close)?.close());
  });

  // Project memo (app userData when available, localStorage fallback)
  const memoFields = {
    what: document.getElementById('memo-what'),
    who: document.getElementById('memo-who'),
    core: document.getElementById('memo-core')
  };
  const memoOutput = document.getElementById('memo-output');
  const memoStatus = document.getElementById('memo-status');

  function renderMemo(memo) {
    if (!memo || (!memo.what && !memo.who && !memo.core)) {
      memoOutput.textContent = '아직 저장된 메모가 없습니다.';
      return;
    }
    memoOutput.textContent = `# 내 첫 프로젝트\n\n무엇을 만들까?\n${memo.what || '미정'}\n\n누가 사용할까?\n${memo.who || '미정'}\n\n가장 중요한 기능\n${memo.core || '미정'}`;
  }

  async function loadMemo() {
    try {
      if (bridge && typeof bridge.loadData === 'function') {
        const memo = await bridge.loadData('v4-project-memo');
        if (memo) {
          memoFields.what.value = memo.what || '';
          memoFields.who.value = memo.who || '';
          memoFields.core.value = memo.core || '';
          renderMemo(memo);
          return;
        }
      }
    } catch { /* fall through to localStorage */ }
    try {
      const raw = window.localStorage.getItem('jucoding-v4-project-memo');
      if (raw) {
        const memo = JSON.parse(raw);
        memoFields.what.value = memo.what || '';
        memoFields.who.value = memo.who || '';
        memoFields.core.value = memo.core || '';
        renderMemo(memo);
      }
    } catch { /* empty initial state */ }
  }

  document.getElementById('memo-save').addEventListener('click', async () => {
    const memo = {
      what: memoFields.what.value.trim(),
      who: memoFields.who.value.trim(),
      core: memoFields.core.value.trim(),
      savedAt: new Date().toISOString()
    };
    renderMemo(memo);
    try {
      if (bridge && typeof bridge.saveData === 'function') {
        const ok = await bridge.saveData('v4-project-memo', memo);
        memoStatus.textContent = ok ? '이 컴퓨터에 저장했습니다.' : '저장에 실패했습니다. 다시 시도해 주세요.';
        return;
      }
    } catch { /* fall through */ }
    try {
      window.localStorage.setItem('jucoding-v4-project-memo', JSON.stringify(memo));
      memoStatus.textContent = '브라우저 임시 저장소에 저장했습니다. 앱에서 실행하면 이 컴퓨터에 저장됩니다.';
    } catch {
      memoStatus.textContent = '저장에 실패했습니다. 다시 시도해 주세요.';
    }
  });

  // Instructor tools
  document.getElementById('btn-fullscreen').addEventListener('click', async () => {
    const status = document.getElementById('home-status');
    try {
      if (bridge && typeof bridge.toggleFullscreen === 'function') {
        const next = await bridge.toggleFullscreen();
        status.textContent = next ? 'FULLSCREEN' : 'OFFLINE READY';
      } else {
        status.textContent = '앱에서 실행하면 전체화면을 사용할 수 있습니다.';
      }
    } catch {
      status.textContent = '전체화면 전환에 실패했습니다.';
    }
  });

  document.getElementById('btn-export').addEventListener('click', async () => {
    const status = document.getElementById('backup-status');
    try {
      if (bridge && typeof bridge.exportData === 'function') {
        const result = await bridge.exportData();
        status.textContent = result && result.ok ? `백업 저장 완료: ${result.filePath}` : '백업을 취소했습니다.';
      } else {
        status.textContent = '앱에서 실행하면 백업을 사용할 수 있습니다.';
      }
    } catch {
      status.textContent = '백업에 실패했습니다.';
    }
  });

  document.getElementById('btn-import').addEventListener('click', async () => {
    const status = document.getElementById('backup-status');
    try {
      if (bridge && typeof bridge.importData === 'function') {
        const result = await bridge.importData();
        status.textContent = result && result.ok ? '백업을 복원했습니다. 메모를 다시 불러옵니다.' : '복원을 취소했습니다.';
        if (result && result.ok) loadMemo();
      } else {
        status.textContent = '앱에서 실행하면 복원을 사용할 수 있습니다.';
      }
    } catch {
      status.textContent = '복원에 실패했습니다. 지원하지 않는 백업 파일일 수 있습니다.';
    }
  });

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (event.key === 'Escape') gotoSection('home');
  });

  loadMemo();

  // ===========================================================================
  // JuCoding Archive — material inbox and the lecture update approval flow
  //
  // Flow, in this order and never any other:
  //   자료 투입 → 새 자료 확인 → 변경안 만들기 → Preview → 사람 승인 → 적용
  //
  // Nothing here writes lecture content. The only mutating call is
  // applyProposal(), and the main process backs up first.
  // ===========================================================================

  const archiveEls = {
    path: document.getElementById('archive-path'),
    count: document.getElementById('archive-count'),
    files: document.getElementById('archive-files'),
    proposeRow: document.getElementById('archive-propose-row'),
    proposeNote: document.getElementById('archive-propose-note'),
    ai: document.getElementById('archive-ai'),
    applied: document.getElementById('archive-applied')
  };
  const proposalDialog = document.getElementById('proposal-dialog');
  const proposalEls = {
    title: document.getElementById('proposal-title'),
    meta: document.getElementById('proposal-meta'),
    changes: document.getElementById('proposal-changes'),
    summary: document.getElementById('proposal-summary'),
    status: document.getElementById('proposal-status')
  };
  const proposalListDialog = document.getElementById('proposal-list-dialog');
  const proposalList = document.getElementById('proposal-list');

  const ACTION_LABEL = {
    replace: '한 줄 요약 교체',
    append: '강사 메모에 추가',
    asset: '장면 자료로 추가',
    new_scene: '새 장면 추가'
  };
  const CONFIDENCE_LABEL = { high: '높음', medium: '보통', low: '낮음' };

  let archiveStatus = null;
  let currentProposal = null;

  const esc = (value) => String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const hasArchive = () => Boolean(bridge && typeof bridge.archiveStatus === 'function');
  const fmtSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  function renderArchiveFiles(files) {
    if (!files || !files.length) {
      archiveEls.files.innerHTML = '<p class="meta-line">inbox에 지원 형식(.md .txt .json .png .jpg .jpeg .webp) 자료를 넣어주세요.</p>';
      return;
    }
    archiveEls.files.innerHTML = `<p class="archive-files-title">새 자료 ${files.filter((f) => f.supported).length}개</p>`
      + files.map((file) => `
        <div class="archive-file${file.supported ? '' : ' is-ignored'}">
          <span class="archive-file-icon">${file.kind === 'image' ? '🖼️' : file.kind === 'text' ? '📄' : '⛔'}</span>
          <span class="archive-file-name">${esc(file.name)}</span>
          <span class="archive-file-meta">${esc(fmtSize(file.size))}</span>
          <span class="archive-file-state">${file.supported ? '사용 가능' : esc(file.reason || '지원하지 않는 형식')}</span>
        </div>`).join('');
  }

  async function refreshArchiveStatus() {
    if (!hasArchive()) {
      archiveEls.path.textContent = '앱에서 실행하면 Documents/JuCoding/Archive 가 자동 생성됩니다';
      archiveEls.count.textContent = '앱 전용 기능';
      archiveEls.ai.textContent = '';
      renderArchiveFiles([]);
      return;
    }
    try {
      const status = await bridge.archiveStatus();
      if (!status || !status.root) {
        archiveEls.count.textContent = '자료함 초기화 실패';
        return;
      }
      archiveStatus = status;
      archiveEls.path.textContent = status.root;
      archiveEls.count.textContent = status.newCount > 0
        ? `새 자료 ${status.newCount}개${status.ignoredCount ? ` · 무시 ${status.ignoredCount}개` : ''}`
        : '새 자료 없음';
      archiveEls.ai.textContent = status.providerStatus
        ? `${status.providerStatus.aiMessage} 현재 변경안 생성기: ${status.providerStatus.activeProviderLabel || '없음'}. ${status.providerStatus.aiHint}`
        : '';
      archiveEls.applied.textContent = [
        `자료함 위치: ${status.root}`,
        `반영된 장면 ${status.appliedSceneCount}개 · 자료 ${status.appliedAssetCount}개 · 추가 장면 ${status.newSceneCount}개`,
        status.lastAppliedAt ? `마지막 적용: ${new Date(status.lastAppliedAt).toLocaleString('ko-KR')}` : '아직 적용된 변경이 없습니다'
      ].join(' · ');
      renderArchiveFiles(status.files);
      archiveEls.proposeRow.hidden = status.newCount === 0;
      archiveEls.proposeNote.textContent = status.newCount > 0
        ? `${status.newCount}개 자료로 변경안 초안을 만듭니다. 바로 강의에 반영되지 않습니다.`
        : '';
    } catch (error) {
      archiveEls.count.textContent = '자료함을 읽지 못했습니다';
    }
  }

  async function scanArchive() {
    if (!hasArchive()) {
      archiveEls.count.textContent = '앱에서 실행하면 사용할 수 있습니다';
      return;
    }
    archiveEls.count.textContent = 'inbox 확인 중…';
    const result = await bridge.scanArchive();
    if (!result || !result.ok) {
      archiveEls.count.textContent = (result && result.message) || 'inbox를 읽지 못했습니다';
      return;
    }
    archiveStatus = { ...(archiveStatus || {}), newCount: result.newCount, ignoredCount: result.ignoredCount, files: result.files };
    archiveEls.count.textContent = result.newCount > 0
      ? `새 자료 ${result.newCount}개${result.ignoredCount ? ` · 무시 ${result.ignoredCount}개` : ''}`
      : '새 자료 없음';
    renderArchiveFiles(result.files);
    archiveEls.proposeRow.hidden = result.newCount === 0;
  }

  async function openArchiveFolder(which) {
    if (!hasArchive()) {
      archiveEls.count.textContent = '앱에서 실행하면 Windows 탐색기에서 열립니다';
      return;
    }
    const result = await bridge.openArchiveFolder(which || 'inbox');
    if (!result || !result.ok) archiveEls.count.textContent = (result && result.message) || '폴더를 열지 못했습니다';
  }

  function renderProposal(proposal) {
    currentProposal = proposal;
    proposalEls.title.textContent = proposal.sourceFiles.map((f) => f.name).join(' · ') || '강의 변경안';
    proposalEls.meta.innerHTML = `
      <span class="chip">작성 ${new Date(proposal.createdAt).toLocaleString('ko-KR')}</span>
      <span class="chip">생성기 ${esc(proposal.provider ? proposal.provider.label : '-')}</span>
      <span class="chip">변경 후보 ${proposal.changes.length}건</span>
      <span class="chip">원자료 ${proposal.sourceFiles.length}개</span>`;
    const sceneOptions = proposal.sceneOptions || [];
    proposalEls.changes.innerHTML = proposal.changes.length
      ? proposal.changes.map((change) => renderChangeCard(change, sceneOptions)).join('')
      : '<p class="meta-line">이 자료로부터 만든 변경 후보가 없습니다. 다른 자료를 넣어보세요.</p>';
    hydrateAssetPreviews();
    updateProposalSummary();
    proposalEls.status.textContent = '기본값은 "기존 유지"입니다. 반영할 변경만 눌러 표시한 뒤 적용하세요.';
  }

  // Each image is pulled on demand so a large image set does not have to travel
  // inside the proposal payload.
  function hydrateAssetPreviews() {
    proposalEls.changes.querySelectorAll('[data-asset-preview]').forEach((holder) => {
      const archivePath = holder.getAttribute('data-asset-preview');
      if (!archivePath || !bridge || typeof bridge.getArchiveAssetData !== 'function') {
        holder.textContent = '미리보기를 표시할 수 없습니다';
        return;
      }
      bridge.getArchiveAssetData(archivePath)
        .then((result) => {
          if (!result || !result.ok) {
            holder.textContent = '미리보기를 표시할 수 없습니다';
            return;
          }
          const img = document.createElement('img');
          img.className = 'change-asset-preview';
          img.alt = holder.getAttribute('data-asset-title') || '자료 미리보기';
          img.src = result.dataUrl;
          holder.replaceWith(img);
        })
        .catch(() => { holder.textContent = '미리보기를 표시할 수 없습니다'; });
    });
  }

  function renderChangeCard(change, sceneOptions) {
    const isAsset = change.action === 'asset';
    // An image proposal only guesses its scene from the filename, so the card
    // shows the picture and lets the instructor place it.
    const assetBody = isAsset ? `
      <div class="change-asset">
        <div class="change-asset-preview is-blank" data-asset-preview="${esc(change.assetPath || `inbox/${change.sourceName}`)}" data-asset-title="${esc(change.after)}">불러오는 중…</div>
        <div class="change-asset-fields">
          <label>이미지를 붙일 장면
            <select data-scene-pick>
              ${sceneOptions.map((s) => `
                <option value="${esc(s.id)}"${s.id === change.sceneId ? ' selected' : ''}>${esc(s.chapterLabel ? `${s.chapterLabel} · ` : '')}${esc(s.title)}</option>
              `).join('')}
            </select>
          </label>
          <label>자료 이름
            <input type="text" data-asset-title value="${esc(change.after)}">
          </label>
          <label>설명
            <input type="text" data-asset-caption placeholder="이 그림을 왜 보여주는지 한 줄로">
          </label>
        </div>
      </div>` : `
      <div class="change-diff">
        <div class="change-before"><b>현재</b><p>${esc(change.before) || '<em>없음</em>'}</p></div>
        <div class="change-after">
          <b>제안 <span class="change-edit-hint">직접 수정할 수 있습니다</span></b>
          <textarea data-after rows="3">${esc(change.after)}</textarea>
        </div>
      </div>`;

    return `
      <article class="change-card${isAsset ? ' is-asset' : ''}" data-change="${esc(change.id)}" data-decision="keep" data-action="${esc(change.action)}">
        <div class="change-head">
          <span class="change-scene">${esc(change.chapterLabel ? `${change.chapterLabel} · ` : '')}${esc(change.sceneTitle || change.sceneId)}</span>
          <span class="change-tag change-${esc(change.action)}">${esc(ACTION_LABEL[change.action] || change.action)}</span>
          <span class="change-conf conf-${esc(change.confidence)}">일치도 ${esc(CONFIDENCE_LABEL[change.confidence] || change.confidence)}</span>
          <span class="change-source">${esc(change.sourceName || '')}</span>
        </div>
        <p class="change-reason">${esc(change.reason)}</p>
        ${assetBody}
        <div class="change-actions">
          <button type="button" class="ghost small" data-decide="keep">기존 유지</button>
          <button type="button" class="cta small" data-decide="apply">이 변경 적용</button>
        </div>
      </article>`;
  }

  // Marks which decision is currently selected on a change card. Both buttons
  // are always available, so without this the default "기존 유지" is invisible
  // and it looks like the change is already queued.
  function paintDecisions(card) {
    const decision = card.dataset.decision;
    card.querySelectorAll('[data-decide]').forEach((button) => {
      const picked = button.dataset.decide === decision;
      button.classList.toggle('is-picked', picked);
      button.classList.toggle('is-muted', !picked);
      button.setAttribute('aria-pressed', String(picked));
    });
  }

  function updateProposalSummary() {
    proposalEls.changes.querySelectorAll('.change-card').forEach(paintDecisions);
    const apply = proposalEls.changes.querySelectorAll('.change-card[data-decision="apply"]').length;
    const keep = proposalEls.changes.querySelectorAll('.change-card[data-decision="keep"]').length;
    proposalEls.summary.textContent = `적용 ${apply}건 · 유지 ${keep}건`;
    document.getElementById('btn-proposal-apply').disabled = apply === 0;
  }

  function setAllDecisions(decision) {
    proposalEls.changes.querySelectorAll('.change-card').forEach((card) => {
      card.dataset.decision = decision;
    });
    updateProposalSummary();
  }

  async function makeProposal() {
    if (!hasArchive()) {
      archiveEls.count.textContent = '앱에서 실행하면 사용할 수 있습니다';
      return;
    }
    proposalEls.status.textContent = '변경안을 만드는 중…';
    const result = await bridge.proposeFromArchive(null);
    if (!result || !result.ok) {
      proposalEls.status.textContent = (result && result.message) || '변경안을 만들지 못했습니다';
      if (!proposalDialog.open) proposalDialog.showModal();
      return;
    }
    renderProposal(result.proposal);
    if (!proposalDialog.open) proposalDialog.showModal();
    refreshArchiveStatus();
  }

  async function openProposal(id) {
    const result = await bridge.getProposal(id);
    if (!result || !result.ok) return;
    proposalListDialog?.close();
    renderProposal(result.proposal);
    if (!proposalDialog.open) proposalDialog.showModal();
  }

  async function showProposalList() {
    if (!hasArchive()) return;
    const result = await bridge.listProposals();
    if (!result || !result.ok) {
      proposalList.innerHTML = `<p class="meta-line">${esc((result && result.message) || '변경안을 읽지 못했습니다')}</p>`;
    } else if (!result.proposals.length) {
      proposalList.innerHTML = '<p class="meta-line">저장된 변경안이 없습니다. 자료실에서 "변경안 만들기"를 눌러 주세요.</p>';
    } else {
      proposalList.innerHTML = result.proposals.map((p) => `
        <button type="button" class="proposal-row" data-proposal="${esc(p.id)}">
          <span class="proposal-row-main">
            <b>${esc(p.sourceFiles.join(' · ') || '변경안')}</b>
            <small>${esc(new Date(p.createdAt).toLocaleString('ko-KR'))} · ${esc(p.providerLabel)}</small>
          </span>
          <span class="proposal-row-state state-${esc(p.status)}">${p.status === 'applied' ? '적용 완료' : `검토 대기 · ${p.changeCount}건`}</span>
        </button>`).join('');
    }
    if (!proposalListDialog.open) proposalListDialog.showModal();
  }

  async function applyCurrentProposal() {
    if (!currentProposal) return;
    const decisions = [...proposalEls.changes.querySelectorAll('.change-card')].map((card) => {
      const id = card.dataset.change;
      const source = currentProposal.changes.find((c) => c.id === id) || {};
      const base = {
        id,
        decision: card.dataset.decision,
        // The applied text is whatever the instructor left in the box.
        after: card.querySelector('[data-after]') ? card.querySelector('[data-after]').value : source.after
      };
      if (card.dataset.action !== 'asset') return base;
      const pick = card.querySelector('[data-scene-pick]');
      const titleInput = card.querySelector('[data-asset-title]');
      const captionInput = card.querySelector('[data-asset-caption]');
      return {
        ...base,
        // The scene the instructor chose overrides the filename-based guess.
        sceneId: pick ? pick.value : source.sceneId,
        title: titleInput ? titleInput.value : source.after,
        caption: captionInput ? captionInput.value : ''
      };
    });
    document.getElementById('btn-proposal-apply').disabled = true;
    proposalEls.status.textContent = '적용 중… (백업 생성 → 강의 반영 → 자료 이동)';
    const result = await bridge.applyProposal(currentProposal.id, decisions);
    document.getElementById('btn-proposal-apply').disabled = false;
    if (!result || !result.ok) {
      proposalEls.status.textContent = (result && result.message) || '적용하지 못했습니다';
      return;
    }
    proposalEls.status.textContent = result.message
      + (result.backupDir ? ` · 백업: ${result.backupDir}` : '')
      + (result.scenes && result.scenes.length ? ` · 반영 장면: ${result.scenes.join(', ')}` : '')
      + ' · 강의 다시 열면 반영된 내용이 보입니다.';
    await refreshArchiveStatus();
  }

  // Wiring
  document.getElementById('btn-open-archive')?.addEventListener('click', () => openArchiveFolder('inbox'));
  document.getElementById('btn-scan-archive')?.addEventListener('click', scanArchive);
  document.getElementById('btn-review-proposals')?.addEventListener('click', showProposalList);
  document.getElementById('btn-make-proposal')?.addEventListener('click', makeProposal);
  document.getElementById('btn-instructor-archive')?.addEventListener('click', () => { gotoSection('library'); openArchiveFolder('inbox'); });
  document.getElementById('btn-instructor-review')?.addEventListener('click', showProposalList);
  document.getElementById('btn-open-backup')?.addEventListener('click', () => openArchiveFolder('backup'));
  document.getElementById('btn-new-proposal')?.addEventListener('click', () => {
    proposalListDialog?.close();
    makeProposal();
  });
  document.getElementById('btn-proposal-all')?.addEventListener('click', () => setAllDecisions('apply'));
  document.getElementById('btn-proposal-none')?.addEventListener('click', () => setAllDecisions('keep'));
  document.getElementById('btn-proposal-apply')?.addEventListener('click', applyCurrentProposal);

  proposalEls.changes.addEventListener('click', (event) => {
    const button = event.target.closest('[data-decide]');
    if (!button) return;
    const card = button.closest('.change-card');
    if (card) {
      card.dataset.decision = button.dataset.decide;
      updateProposalSummary();
    }
  });

  proposalList.addEventListener('click', (event) => {
    const row = event.target.closest('[data-proposal]');
    if (row) openProposal(row.dataset.proposal);
  });

  refreshArchiveStatus();
})();
