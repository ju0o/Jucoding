'use strict';

// JuCoding V4 shell smoke: loads the independent V4 home directly and proves
// the app starts WITHOUT the legacy V3 course-management DOM.
// No scripts are injected; home.html renders on its own.

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const qaDir = path.join(root, 'artifacts', 'qa');
const screenshotPath = path.join(qaDir, 'jucoding-v4home-1366x768.png');
const reportPath = path.join(qaDir, 'jucoding-v4home-1366x768.json');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const store = {};
// Fullscreen stubs drive the REAL BrowserWindow so this smoke genuinely
// verifies setFullScreen/isFullScreen behavior, not just IPC plumbing.
let win = null;
ipcMain.handle('get-content-base', () => `file:///${path.join(root, 'src/content').replace(/\\/g, '/')}`);
ipcMain.handle('get-fullscreen', () => (win ? win.isFullScreen() : false));
ipcMain.handle('toggle-fullscreen', () => {
  if (!win) return false;
  const next = !win.isFullScreen();
  win.setFullScreen(next);
  return win.isFullScreen();
});
ipcMain.handle('is-dev', () => true);
ipcMain.handle('load-user-data', (_event, key) => (key in store ? store[key] : null));
ipcMain.handle('save-user-data', (_event, key, value) => { store[key] = value; return true; });
ipcMain.handle('export-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('import-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('open-external', () => ({ ok: true }));

app.whenReady().then(async () => {
  win = new BrowserWindow({
    // Visible: setFullScreen() is a no-op on hidden windows, and this smoke
    // must genuinely verify the fullscreen IPC round-trip.
    show: true,
    width: 1366,
    height: 768,
    backgroundColor: '#eef2ff',
    webPreferences: {
      preload: path.join(root, 'src/preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      partition: `jucoding-v4home-${Date.now()}`,
    },
  });

  const errors = [];
  win.webContents.on('console-message', (_event, level, message) => {
    if (/Electron Security Warning/i.test(message)) return;
    if (level >= 2 || /uncaught|failed|error/i.test(message)) errors.push(message);
  });

  try {
    // 1. Direct load — this file IS the first thing the app shows.
    await win.loadFile(path.join(root, 'src/renderer/v4/home.html'));
    await wait(700);

    const home = await win.webContents.executeJavaScript(`
      (() => ({
        url: location.href,
        title: document.title,
        v4home: Boolean(document.querySelector('#v4home')),
        brand: document.querySelector('.brand strong')?.textContent || '',
        nav: [...document.querySelectorAll('.home-nav button')].map((b) => b.textContent.trim()),
        // Legacy V3 markers must NOT exist anywhere in this DOM.
        legacy: {
          courseList: Boolean(document.querySelector('#course-list')),
          courseRail: Boolean(document.querySelector('.course-rail')),
          lessonList: Boolean(document.querySelector('#lesson-list')),
          brandMark: Boolean(document.querySelector('.brand-mark')),
          studioShell: Boolean(document.querySelector('.studio-shell')),
          vibeTitle: document.title.includes('VIBE')
        },
        chapters: document.querySelectorAll('#chapter-list .chapter-row').length,
        assets: document.querySelectorAll('#asset-grid .asset-thumb').length,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      }))()
    `);

    fs.mkdirSync(qaDir, { recursive: true });
    fs.writeFileSync(screenshotPath, (await win.webContents.capturePage()).toPNG());

    // 2. Start lecture → same-window navigation to the V4 lecture.
    await win.webContents.executeJavaScript(`document.querySelector('#btn-start-lecture')?.click()`);
    await wait(700);
    const lecture = await win.webContents.executeJavaScript(`
      (() => ({
        url: location.href,
        stage: Boolean(document.querySelector('#stage .scene')),
        counter: document.querySelector('#scene-counter')?.textContent || '',
        legacyStage: Boolean(document.querySelector('#course-list') || document.querySelector('.course-rail')),
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
      }))()
    `);

    // 3. Back home via the lecture's home button.
    await win.webContents.executeJavaScript(`document.querySelector('#btn-home')?.click()`);
    await wait(700);

    // 4. Project memo round-trip through the (stubbed) userData IPC.
    const memo = await win.webContents.executeJavaScript(`
      (async () => {
        document.querySelector('[data-section="project"]')?.click();
        document.querySelector('#memo-what').value = '모임 자료 정리 앱';
        document.querySelector('#memo-who').value = '스터디 운영자';
        document.querySelector('#memo-core').value = '회차 자료 초안 생성';
        document.querySelector('#memo-save')?.click();
        await new Promise((r) => setTimeout(r, 300));
        return {
          output: document.querySelector('#memo-output')?.textContent || '',
          status: document.querySelector('#memo-status')?.textContent || ''
        };
      })()
    `);

    // 5. Fullscreen toggle + backup buttons exist and respond.
    // openLecture() may have left fullscreen ON, so normalize first.
    const tools = await win.webContents.executeJavaScript(`
      (async () => {
        document.querySelector('[data-section="instructor"]')?.click();
        if (await window.vibeCodingApp.getFullscreen()) {
          document.querySelector('#btn-fullscreen')?.click();
          await new Promise((r) => setTimeout(r, 300));
        }
        document.querySelector('#btn-fullscreen')?.click();
        await new Promise((r) => setTimeout(r, 300));
        const fsOn = await window.vibeCodingApp.getFullscreen();
        document.querySelector('#btn-fullscreen')?.click();
        await new Promise((r) => setTimeout(r, 300));
        const fsOff = await window.vibeCodingApp.getFullscreen();
        document.querySelector('#btn-export')?.click();
        await new Promise((r) => setTimeout(r, 200));
        return { fsOn, fsOff, backup: document.querySelector('#backup-status')?.textContent || '' };
      })()
    `);

    // 6. Asset library enlarge dialog.
    const library = await win.webContents.executeJavaScript(`
      (async () => {
        document.querySelector('[data-section="library"]')?.click();
        await new Promise((r) => setTimeout(r, 150));
        document.querySelector('#asset-grid .asset-thumb')?.click();
        await new Promise((r) => setTimeout(r, 250));
        const dlg = document.querySelector('#asset-dialog');
        const out = {
          open: Boolean(dlg?.open),
          imgOk: (document.querySelector('#asset-dialog-img')?.naturalWidth || 0) > 0
        };
        dlg?.close();
        return out;
      })()
    `);

    // 7. Escape returns to the home section.
    const escape = await win.webContents.executeJavaScript(`
      (() => {
        document.querySelector('[data-section="lecture"]')?.click();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return document.querySelector('#sec-home')?.classList.contains('active') || false;
      })()
    `);

    const noLegacy = !home.legacy.courseList && !home.legacy.courseRail
      && !home.legacy.lessonList && !home.legacy.brandMark
      && !home.legacy.studioShell && !home.legacy.vibeTitle;

    const ok = home.url.replace(/\\/g, '/').endsWith('src/renderer/v4/home.html')
      && home.v4home
      && home.brand === 'JuCoding'
      && home.nav.length === 7
      && noLegacy
      && home.chapters === 7
      && home.assets === 6
      && !home.overflowX
      && lecture.url.replace(/\\/g, '/').includes('src/content/v4/one-shot.html')
      && lecture.stage
      && lecture.counter.trim() === '1 / 21'
      && !lecture.legacyStage
      && !lecture.overflowX
      && memo.output.includes('모임 자료 정리 앱')
      && memo.status.includes('저장했습니다')
      && store['v4-project-memo']
      && store['v4-project-memo'].what === '모임 자료 정리 앱'
      && tools.fsOn === true
      && tools.fsOff === false
      && library.open
      && library.imgOk
      && escape
      && errors.length === 0;

    const report = { ok, home, lecture, memo, tools, library, escape, errors, screenshotPath };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(JSON.stringify(report, null, 2));
    app.exit(ok ? 0 : 1);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
