'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/content/course-manifest.json'), 'utf-8'));
const qaDir = path.join(root, 'artifacts', 'qa');
const screenshotPath = path.join(qaDir, 'jucoding-shell-1366x768.png');
const reportPath = path.join(qaDir, 'jucoding-shell-1366x768.json');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

ipcMain.handle('read-manifest', () => manifest);
ipcMain.handle('read-official-sources', () => JSON.parse(fs.readFileSync(path.join(root, 'src/content/sources/official-sources.json'), 'utf-8')));
ipcMain.handle('read-community-share-resources', () => ({ version: 1, resources: {} }));
ipcMain.handle('get-content-base', () => `file:///${path.join(root, 'src/content').replace(/\\/g, '/')}`);
ipcMain.handle('get-fullscreen', () => false);
ipcMain.handle('toggle-fullscreen', () => false);
ipcMain.handle('is-dev', () => true);
ipcMain.handle('load-user-data', () => null);
ipcMain.handle('save-user-data', () => true);
ipcMain.handle('export-user-data', () => ({ ok: true, filePath: 'smoke-backup.json' }));
ipcMain.handle('import-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('open-content-path', () => ({ ok: true }));

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    width: 1366,
    height: 768,
    backgroundColor: '#eef2ff',
    webPreferences: {
      preload: path.join(root, 'src/preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
      partition: `jucoding-v4-shell-${Date.now()}`,
    },
  });

  const errors = [];
  win.webContents.on('console-message', (_event, level, message) => {
    if (/Electron Security Warning/i.test(message)) return;
    if (level >= 2 || /uncaught|failed|error/i.test(message)) errors.push(message);
  });

  try {
    await win.loadFile(path.join(root, 'src/renderer/index.html'));
    await wait(1000);

    await win.webContents.executeJavaScript(`
      (() => new Promise((resolve, reject) => {
        document.documentElement.dataset.jucodingV4 = 'true';
        if (!document.querySelector('link[data-jucoding-v4-theme]')) {
          const theme = document.createElement('link');
          theme.rel = 'stylesheet';
          theme.href = new URL('./jucoding-v4-theme.css', location.href).href;
          theme.dataset.jucodingV4Theme = 'true';
          document.head.appendChild(theme);
        }
        const files = ['./jucoding-v4-shell.js', './v4-entry.js'];
        let loaded = 0;
        for (const src of files) {
          const script = document.createElement('script');
          script.src = new URL(src, location.href).href;
          script.onload = () => { loaded += 1; if (loaded === files.length) resolve(true); };
          script.onerror = () => reject(new Error('Failed to load ' + src));
          document.body.appendChild(script);
        }
      }))()
    `);
    await wait(500);

    const state = await win.webContents.executeJavaScript(`
      (() => ({
        title: document.title,
        themed: document.documentElement.dataset.jucodingV4 === 'true',
        themeSheet: Boolean(document.querySelector('link[data-jucoding-v4-theme]')),
        brandMark: document.querySelector('.brand-mark')?.textContent || '',
        brand: document.querySelector('.brand strong')?.textContent || '',
        brandSub: document.querySelector('.brand span')?.textContent || '',
        v4Top: document.querySelector('#btn-v4-one-shot')?.textContent.trim() || '',
        v4RailTitle: document.querySelector('#v4-one-shot-rail b')?.textContent || '',
        v4RailSub: document.querySelector('#v4-one-shot-rail small')?.textContent || '',
        railBackground: getComputedStyle(document.querySelector('.course-rail')).backgroundImage,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1
      }))()
    `);

    fs.mkdirSync(qaDir, { recursive: true });
    fs.writeFileSync(screenshotPath, (await win.webContents.capturePage()).toPNG());

    const ok = state.title.includes('JuCoding')
      && state.themed
      && state.themeSheet
      && state.brandMark === 'J'
      && state.brand === 'JuCoding'
      && state.brandSub.includes('AI와 함께')
      && state.v4Top === '3시간 스터디 시작'
      && state.v4RailTitle === 'AI · Agent · 바이브코딩'
      && state.v4RailSub === '왕초보 3시간 스터디'
      && /gradient/i.test(state.railBackground)
      && !state.overflowX
      && !state.overflowY
      && errors.length === 0;

    const report = { ok, state, errors, screenshotPath };
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(JSON.stringify(report, null, 2));
    app.exit(ok ? 0 : 1);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
