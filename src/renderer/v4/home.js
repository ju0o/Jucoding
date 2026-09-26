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
})();
