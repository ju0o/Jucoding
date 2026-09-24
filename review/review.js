'use strict';

const frame = document.getElementById('lesson');
const viewport = document.getElementById('viewport');
const shell = document.getElementById('frame-shell');
const modeButton = document.getElementById('mode');
const dialog = document.getElementById('feedback-dialog');
const sceneTitle = document.getElementById('scene-title');
const sceneMeta = document.getElementById('scene-meta');
const feedbackText = document.getElementById('feedback-text');
const toast = document.getElementById('toast');
let mode = 'fidelity';

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1600);
}

function fitDesktop() {
  if (mode !== 'fidelity') return;
  const baseW = 1440;
  const baseH = 900;
  const availableW = viewport.clientWidth;
  const availableH = viewport.clientHeight;
  const scale = Math.min(availableW / baseW, availableH / baseH);
  shell.style.transform = `scale(${scale})`;
  shell.style.left = `${Math.max(0, (availableW - baseW * scale) / 2)}px`;
  shell.style.top = `${Math.max(0, (availableH - baseH * scale) / 2)}px`;
}

function setMode(next) {
  mode = next;
  viewport.classList.toggle('fidelity', mode === 'fidelity');
  viewport.classList.toggle('adaptive', mode === 'adaptive');
  modeButton.textContent = mode === 'fidelity' ? '데스크탑 그대로' : '모바일 맞춤';
  shell.style.transform = '';
  shell.style.left = '';
  shell.style.top = '';
  requestAnimationFrame(fitDesktop);
}

function currentScene() {
  try {
    const doc = frame.contentDocument;
    const counter = doc?.getElementById('scene-counter')?.textContent?.trim() || '장면 확인 불가';
    const chapter = doc?.getElementById('chapter-label')?.textContent?.trim() || '챕터 확인 불가';
    const kicker = doc?.querySelector('#stage .kicker')?.textContent?.trim() || '';
    return { counter, chapter, kicker };
  } catch (_) {
    return { counter: '장면 확인 불가', chapter: '챕터 확인 불가', kicker: '' };
  }
}

function feedbackPayload() {
  const scene = currentScene();
  const comment = feedbackText.value.trim();
  const title = `[V4 Feedback] ${scene.counter} · ${scene.chapter}`;
  const body = [
    '## JuCoding V4 모바일 검토',
    '',
    `- 장면: ${scene.counter}`,
    `- 챕터: ${scene.chapter}`,
    scene.kicker ? `- 화면 제목: ${scene.kicker}` : '',
    `- 보기 모드: ${mode === 'fidelity' ? 'Desktop Fidelity' : 'Mobile Adaptive'}`,
    `- 검토 링크: ${location.href}`,
    '',
    '## 피드백',
    comment || '(의견을 입력해주세요)'
  ].filter(Boolean).join('\n');
  return { scene, comment, title, body };
}

function openFeedback() {
  const scene = currentScene();
  sceneTitle.textContent = scene.kicker || scene.chapter;
  sceneMeta.textContent = `${scene.chapter} · ${scene.counter}`;
  feedbackText.value = '';
  dialog.showModal();
  setTimeout(() => feedbackText.focus(), 80);
}

modeButton.addEventListener('click', () => setMode(mode === 'fidelity' ? 'adaptive' : 'fidelity'));
document.getElementById('feedback').addEventListener('click', openFeedback);

document.getElementById('copy-feedback').addEventListener('click', async () => {
  const { body } = feedbackPayload();
  try {
    await navigator.clipboard.writeText(body);
    showToast('현재 장면 정보와 피드백을 복사했어요.');
  } catch (_) {
    feedbackText.select();
    showToast('클립보드 권한이 없어 입력 내용을 선택했어요.');
  }
});

document.getElementById('issue-feedback').addEventListener('click', () => {
  const { title, body } = feedbackPayload();
  if (!feedbackText.value.trim()) {
    showToast('피드백을 한 줄이라도 적어주세요.');
    return;
  }
  const url = `https://github.com/ju0o/Jucoding/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

frame.addEventListener('load', () => {
  fitDesktop();
  try {
    frame.contentWindow.addEventListener('resize', fitDesktop);
  } catch (_) {}
});
window.addEventListener('resize', fitDesktop);
window.addEventListener('orientationchange', () => setTimeout(fitDesktop, 120));
setMode('fidelity');
