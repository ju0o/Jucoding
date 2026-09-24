'use strict';

(() => {
  if (window.__juCodingV4ShellMounted) return;
  window.__juCodingV4ShellMounted = true;

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  function applyBrand() {
    document.documentElement.dataset.jucodingV4 = 'true';
    document.title = 'JuCoding · AI & Vibe Coding Studio';

    setText('.brand-mark', 'J');
    setText('.brand strong', 'JuCoding');
    setText('.brand span', 'AI와 함께 만드는 나의 첫 프로젝트');
    setText('.rail-search-copy', '강의, 키워드, 예제 찾기');

    const courseLabel = document.querySelector('[data-rail-section="courses"] .rail-toggle-copy span:last-child');
    if (courseLabel) courseLabel.textContent = '강의';
    const workspaceLabel = document.querySelector('[data-rail-section="workspace"] .rail-toggle-copy span:last-child');
    if (workspaceLabel) workspaceLabel.textContent = '도구';

    setText('#btn-planner b', '프로젝트 · 메모');
    setText('#planner-status', '아이디어와 수업 기록');
    setText('#btn-settings b', '화면 설정');
    setText('#settings-status', '빔 · 전체화면 · 배율');

    const footerVersion = document.querySelector('.rail-footer strong');
    if (footerVersion) footerVersion.textContent = 'JUCODING V4';
    const footerStatus = document.querySelector('.rail-footer div span:last-child');
    if (footerStatus) footerStatus.textContent = 'OFFLINE READY';

    const playerBack = document.querySelector('#btn-player-close span');
    if (playerBack) playerBack.textContent = 'JuCoding';
    setText('.notes-kicker', '강사 메모');
    setText('#drawer-kicker', 'JUCODING TOOLS');
  }

  function enrichV4Button() {
    const top = document.getElementById('btn-v4-one-shot');
    if (top) {
      top.classList.add('jv4-start-button');
      top.innerHTML = '<span>3시간 스터디 시작</span>';
      top.title = 'AI · Agent · 바이브코딩 3시간 커리큘럼 열기';
    }

    const rail = document.getElementById('v4-one-shot-rail');
    if (rail) {
      rail.classList.add('jv4-course-entry');
      const title = rail.querySelector('b');
      const subtitle = rail.querySelector('small');
      if (title) title.textContent = 'AI · Agent · 바이브코딩';
      if (subtitle) subtitle.textContent = '왕초보 3시간 스터디';
    }
  }

  function mount() {
    applyBrand();
    enrichV4Button();
  }

  mount();

  const observer = new MutationObserver(() => {
    applyBrand();
    enrichV4Button();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  setTimeout(mount, 250);
  setTimeout(mount, 900);
})();
