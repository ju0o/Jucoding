'use strict';

(() => {
  if (window.__juCodingV4Mounted) return;
  window.__juCodingV4Mounted = true;

  const course = {
    id: 'v4-one-shot',
    title: '개발 세계 한방 이해 · V4',
    shortTitle: 'V4 ONE SHOT',
    code: 'V4',
    family: '기초',
    track: 'ONE SHOT · NON-DEVELOPER',
    color: '#d8ff66',
    sessions: []
  };

  const item = {
    id: 'v4-one-shot-main',
    title: '개발 세계 한방 이해',
    subtitle: '비개발자를 위한 전체 지도',
    description: 'AI/Agent부터 웹 구조, Git/GitHub, 배포, PRD/SSOT/WBS, Prototype, ERD/DBML까지 한 번에 연결합니다.',
    duration: '90~110분',
    type: 'theory',
    status: 'preview',
    revision: 'v4-one-shot',
    file: 'v4/one-shot.html'
  };
  course.sessions = [item];

  function openV4() {
    if (typeof window.openPlayer !== 'function') {
      console.error('V4 launcher: openPlayer is unavailable.');
      return;
    }
    window.openPlayer(course, item, false);
  }

  function mountTopButton() {
    if (document.getElementById('btn-v4-one-shot')) return;
    const host = document.querySelector('.topbar-actions');
    if (!host) return;
    const button = document.createElement('button');
    button.id = 'btn-v4-one-shot';
    button.type = 'button';
    button.className = 'topbar-button compact';
    button.innerHTML = '<span style="color:#d8ff66;font-weight:800">V4 ONE SHOT</span>';
    button.title = '비개발자용 개발 세계 한방 이해 강의 열기';
    button.addEventListener('click', openV4);
    host.prepend(button);
  }

  function mountRailCard() {
    if (document.getElementById('v4-one-shot-rail')) return;
    const host = document.getElementById('course-list');
    if (!host) return;

    const button = document.createElement('button');
    button.id = 'v4-one-shot-rail';
    button.type = 'button';
    button.className = 'course-button';
    button.innerHTML = `
      <span class="course-color" style="background:#d8ff66"></span>
      <span class="course-copy">
        <b>V4 ONE SHOT</b>
        <small>개발 세계 한방 이해</small>
      </span>`;
    button.addEventListener('click', openV4);
    host.prepend(button);
  }

  function mount() {
    mountTopButton();
    mountRailCard();
  }

  mount();

  const courseList = document.getElementById('course-list');
  if (courseList) {
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        mountRailCard();
      });
    }).observe(courseList, { childList: true });
  }

  setTimeout(mount, 300);
  setTimeout(mount, 1200);
})();
