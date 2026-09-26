'use strict';

// JuCoding V4 lecture scene screenshots.
//
// Captures any scene by id, optionally after driving an interaction, so a
// slide can be checked by looking at it instead of by reading the markup back.
//
//   npx electron scripts/capture-scenes.js --visible architecture:click:save
//   npx electron scripts/capture-scenes.js --visible architecture git ui-terms
//
// Spec forms:
//   <sceneId>                 just the scene, idle
//   <sceneId>:click:<sel>     click <sel> first, then wait for it to finish
//   <sceneId>:run:<railId>    click the control wired to <railId>, then wait
//
// A hidden window produces stale frames, so --visible is required, same as
// capture-v41-screens.js. Under a headless host, run it inside xvfb-run.

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'artifacts', 'qa');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VISIBLE = process.env.JUCODING_QA_VISIBLE === '1' || process.argv.includes('--visible');
// argv[1] is the script under `electron` but an npx shim path when invoked via
// `npx electron`, so the position is not reliable. A spec never ends in .js.
const specs = process.argv.slice(1).filter((a) => !a.startsWith('--') && !/\.(js|cjs|mjs)$/.test(a));
if (!specs.length) {
  console.error('usage: capture-scenes.js --visible <sceneId>[:run:<railId>] ...');
  app.exit(2);
  return;
}

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'jucoding-scene-shot-'));
app.setPath('userData', path.join(sandbox, 'userData'));

// The lecture only needs the read-only side of the bridge; every write is
// answered with a no-op so a capture can never touch real lecture state.
const store = {};
let win = null;
ipcMain.handle('get-content-base', () => `file:///${path.join(root, 'src/content').replace(/\\/g, '/')}`);
ipcMain.handle('get-fullscreen', () => (win ? win.isFullScreen() : false));
ipcMain.handle('toggle-fullscreen', () => (win ? win.setFullScreen(!win.isFullScreen()) : false));
ipcMain.handle('is-dev', () => true);
ipcMain.handle('load-user-data', (_e, k) => (k in store ? store[k] : null));
ipcMain.handle('save-user-data', (_e, k, v) => { store[k] = v; return true; });
ipcMain.handle('export-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('import-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('open-external', () => ({ ok: true }));
ipcMain.handle('archive-overrides', async () => ({ ok: true, overrides: { version: 1, scenes: {}, assets: {}, newScenes: [], chapters: [] } }));
ipcMain.handle('archive-asset-data', () => ({ ok: false }));

const errors = [];

const playSpec = async (spec) => {
  const [sceneId, verb, arg] = spec.split(':');
  const url = `file:///${path.join(root, 'src/content/v4/one-shot.html').replace(/\\/g, '/')}#scene=${sceneId}`;
  await win.loadURL(url);
  await wait(700);

  if (verb === 'click' && arg) {
    const hit = await win.webContents.executeJavaScript(`(() => {
      const el = document.querySelector(${JSON.stringify(arg)});
      if (!el) return false;
      el.click();
      return true;
    })()`);
    if (!hit) errors.push(`${sceneId}: selector not found ${arg}`);
  } else if (verb === 'run' && arg) {
    const hit = await win.webContents.executeJavaScript(`(() => {
      const el = document.querySelector('[data-run="' + ${JSON.stringify(arg)} + '"]');
      if (!el) return false;
      el.click();
      return true;
    })()`);
    if (!hit) errors.push(`${sceneId}: no control wired to rail ${arg}`);
  }

  // Long enough for a full rail to finish: 200ms lead + 620ms per step.
  await wait(verb ? 3200 : 500);

  const state = await win.webContents.executeJavaScript(`(() => ({
    scene: document.querySelector('.scene') ? true : false,
    overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    stageOverflow: (() => {
      const el = document.querySelector('.scene');
      if (!el) return null;
      return el.scrollHeight > el.clientHeight + 1;
    })(),
    lit: document.querySelectorAll('.rail-step.on').length,
    shown: document.querySelectorAll('[data-done].show').length
  }))()`);

  const name = `scene-${sceneId}${verb ? '-' + verb + '-' + arg : ''}.png`;
  fs.writeFileSync(path.join(outDir, name), (await win.webContents.capturePage()).toPNG());
  const flags = [state.overflowY ? 'OVERFLOW-Y' : '', state.overflowX ? 'OVERFLOW-X' : '', state.stageOverflow ? 'STAGE-CUT' : '']
    .filter(Boolean).join(' ');
  console.log(`✓ ${name}  rail=${state.lit} done=${state.shown} ${flags || 'fit'}`);
  if (flags) errors.push(`${sceneId}: ${flags}`);
};

app.whenReady().then(async () => {
  if (!VISIBLE) {
    console.error('capture-scenes: pass --visible (a hidden window produces stale frames)');
    app.exit(1);
    return;
  }
  fs.mkdirSync(outDir, { recursive: true });
  win = new BrowserWindow({
    show: true,
    width: 1366,
    height: 768,
    backgroundColor: '#eef2ff',
    webPreferences: {
      preload: path.join(root, 'src/preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });
  win.setMenuBarVisibility(false);
  win.webContents.on('console-message', (_e, level, message) => {
    if (level >= 2) errors.push(`console: ${message}`);
  });

  for (const spec of specs) {
    try {
      await playSpec(spec);
    } catch (error) {
      errors.push(`${spec}: ${error && error.message ? error.message : error}`);
    }
  }

  if (errors.length) {
    console.error('\ncapture-scenes problems:');
    errors.forEach((e) => console.error('  - ' + e));
    app.exit(1);
    return;
  }
  console.log('\ncapture-scenes: all scenes fit 1366x768 with no console errors');
  app.exit(0);
});
