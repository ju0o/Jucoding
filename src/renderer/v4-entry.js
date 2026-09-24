'use strict';

(() => {
  if (window.__juCodingV4Mounted) return;
  window.__juCodingV4Mounted = true;

  const course = {
    id: 'v4-one-shot',
    title: 'AI · Agent · 바이브코딩',
    shortTitle: '3시간 스터디',
    code: 'STUDY',
    family: '기초',
    track: 'BEGINNER · 3H',
    color: '#7357ff',
    sessions: []
  };

  const item = {
    id: 'v4-one-shot-main',
    title: 'AI · Agent · 바이브코딩 한 번에 이해하기',
    subtitle: '비개발자를 위한 3시간 시각형 커리큘럼',
    description: '왜 바이브코딩인지부터 AI/Agent, 프론트엔드·백엔드·API·DB, PRD/WBS/ERD/DBML/SSOT, 개발서버·배포, Git/GitHub, MCP와 자동화까지 하나의 흐름으로 연결합니다.',
    duration: '약 3시간 · 쉬는 시간 포함',
    type: 'theory',
    status: 'active',
    revision: 'v4-lecture-studio',
    file: 'v4/one-shot.html'
  };
  course.sessions = [item];

  function openV4() {
    if (typeof window.openPlayer !== 'function') {
      console.error('JuCoding V4 launcher: openPlayer is unavailable.');
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
    button.className = 'topbar-button compact jv4-start-button';
    button.innerHTML = '<span>3시간 스터디 시작</span>';
    button.title = 'AI · Agent · 바이브코딩 3시간 커리큘럼 열기';
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
    button.className = 'course-button jv4-course-entry';
    button.innerHTML = `
      <span class="course-color" style="background:#7357ff">J</span>
      <span class="course-copy">
        <b>AI · Agent · 바이브코딩</b>
        <small>왕초보 3시간 스터디</small>
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
