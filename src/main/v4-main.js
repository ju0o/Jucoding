'use strict';

// JuCoding V4 — independent default runtime entry.
// Loads the V4 home shell directly. Does NOT require legacy main.js and
// does NOT inject scripts into the legacy course-management UI.
// Reused Electron capabilities (extracted from legacy main.js):
// BrowserWindow, preload, fullscreen IPC + shortcuts, safe external links,
// user-data load/save, backup export/import.
// V4.1 adds the JuCoding Archive (external material inbox + approved lecture
// update flow). See v4-archive.js and v4-organizer.js.

const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const archive = require('./v4-archive');
const organizer = require('./v4-organizer');

let homeWindow;

// Must run before app is ready so the renderer may load jucoding-archive://
// images. The scheme is registered for a narrow purpose only: serving files
// that live inside the user's Archive folder, which the sandboxed renderer
// cannot reach over file://.
archive.registerArchiveScheme();

function getOptionalIconPath() {
  const iconPath = path.join(__dirname, '../../build/icon.ico');
  return fs.existsSync(iconPath) ? iconPath : undefined;
}

function createHomeWindow() {
  const icon = getOptionalIconPath();
  homeWindow = new BrowserWindow({
    show: true,
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'JuCoding · AI & Vibe Coding Studio',
    ...(icon ? { icon } : {}),
    backgroundColor: '#eef2ff',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  homeWindow.setMenuBarVisibility(false);
  // V4 home renders directly — no legacy renderer/index.html is ever loaded.
  homeWindow.loadFile(path.join(__dirname, '../renderer/v4/home.html'));

  homeWindow.on('enter-full-screen', () => {
    homeWindow.webContents.send('fullscreen-changed', true);
  });
  homeWindow.on('leave-full-screen', () => {
    homeWindow.webContents.send('fullscreen-changed', false);
  });
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+F', () => {
    if (homeWindow) {
      const next = !homeWindow.isFullScreen();
      homeWindow.setFullScreen(next);
    }
  });
  globalShortcut.register('Escape', () => {
    if (!homeWindow) return;
    if (homeWindow.isFullScreen()) {
      homeWindow.setFullScreen(false);
    } else {
      homeWindow.webContents.send('shortcut', 'escape');
    }
  });
}

function userDataFile() {
  return path.join(app.getPath('userData'), 'jucoding-v4-state.json');
}

ipcMain.handle('get-content-base', () => {
  const contentPath = path.join(__dirname, '../content').replace(/\\/g, '/');
  const prefix = /^[a-zA-Z]:/.test(contentPath) ? 'file:///' : 'file://';
  return prefix + contentPath;
});

ipcMain.handle('toggle-fullscreen', () => {
  if (!homeWindow) return false;
  const next = !homeWindow.isFullScreen();
  homeWindow.setFullScreen(next);
  return next;
});

ipcMain.handle('get-fullscreen', () => {
  return homeWindow ? homeWindow.isFullScreen() : false;
});

ipcMain.handle('is-dev', () => !app.isPackaged);

ipcMain.handle('open-external', async (_event, targetUrl) => {
  try {
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: '지원하지 않는 주소 형식입니다.' };
    }
    await shell.openExternal(parsed.toString());
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('save-user-data', (_event, key, value) => {
  try {
    const dataPath = userDataFile();
    let data = {};
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    data[key] = value;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch { return false; }
});

ipcMain.handle('load-user-data', (_event, key) => {
  try {
    const dataPath = userDataFile();
    if (!fs.existsSync(dataPath)) return null;
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return key in data ? data[key] : null;
  } catch { return null; }
});

ipcMain.handle('export-user-data', async () => {
  if (!homeWindow) return { ok: false, canceled: true };
  const result = await dialog.showSaveDialog(homeWindow, {
    title: 'JuCoding 운영 데이터 백업',
    defaultPath: `JuCoding-backup-${new Date().toISOString().slice(0, 10)}.zip`,
    filters: [
      { name: 'JuCoding ZIP Backup', extensions: ['zip'] },
      { name: 'JSON Backup', extensions: ['json'] },
    ],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  let data = {};
  const dataPath = userDataFile();
  if (fs.existsSync(dataPath)) data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const payload = {
    schema: 'jucoding-backup',
    version: 1,
    appVersion: app.getVersion(),
    exportedAt: new Date().toISOString(),
    data,
  };
  if (path.extname(result.filePath).toLowerCase() === '.json') {
    fs.writeFileSync(result.filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } else {
    const zip = new AdmZip();
    zip.addFile('backup.json', Buffer.from(JSON.stringify(payload, null, 2), 'utf-8'));
    zip.addFile('README.txt', Buffer.from('JuCoding local instructor data backup\n', 'utf-8'));
    zip.writeZip(result.filePath);
  }
  return { ok: true, filePath: result.filePath };
});

ipcMain.handle('import-user-data', async () => {
  if (!homeWindow) return { ok: false, canceled: true };
  const result = await dialog.showOpenDialog(homeWindow, {
    title: 'JuCoding 운영 데이터 복원',
    properties: ['openFile'],
    filters: [{ name: 'JuCoding Backup', extensions: ['zip', 'json'] }],
  });
  if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true };
  const backupPath = result.filePaths[0];
  const payload = path.extname(backupPath).toLowerCase() === '.zip'
    ? JSON.parse(new AdmZip(backupPath).readAsText('backup.json'))
    : JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  if (payload.schema !== 'jucoding-backup' || payload.version !== 1 || typeof payload.data !== 'object') {
    throw new Error('지원하지 않는 백업 파일입니다.');
  }
  fs.writeFileSync(userDataFile(), JSON.stringify(payload.data, null, 2), 'utf-8');
  return { ok: true, filePath: result.filePaths[0], data: payload.data };
});

// ---------------------------------------------------------------------------
// JuCoding Archive / Material Inbox
//
// Order of operations is enforced in the UI (scan -> analyse -> draft ->
// preview -> human approval -> apply) and here: applyProposal() always writes
// Archive/backup/<timestamp>/ before it touches the lecture overrides, and it
// never writes inside the installed app.
// ---------------------------------------------------------------------------

ipcMain.handle('archive-status', async () => {
  try {
    // First run: create Documents/JuCoding/Archive/{inbox,reviewed,applied,backup}
    return await archive.status();
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-open-folder', async (_event, which) => {
  try {
    return await archive.openFolder(which);
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-scan', async () => {
  try {
    return { ok: true, ...(await archive.scanInbox()) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-propose', async (_event, fileNames) => {
  try {
    return await archive.propose(fileNames);
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-proposals', async () => {
  try {
    return { ok: true, proposals: await archive.listProposals() };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-proposal', async (_event, id) => {
  try {
    const proposal = await archive.getProposal(id);
    return proposal ? { ok: true, proposal } : { ok: false, message: '변경안을 찾을 수 없습니다.' };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-apply', async (_event, proposalId, decisions) => {
  try {
    return await archive.applyProposal(proposalId, decisions);
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('archive-overrides', async () => {
  try {
    return { ok: true, overrides: await archive.readOverrides() };
  } catch (err) {
    return { ok: false, message: err.message };
  }
});

ipcMain.handle('organizer-status', () => organizer.status());

// Legacy course-management handlers (read-manifest, read-official-sources,
// read-community-share-resources, save-pdf, open-content-path) are intentionally
// NOT registered here: the V4 default runtime does not load V3 content.

app.whenReady().then(async () => {
  archive.registerArchiveProtocol();
  // Create the external Archive tree up front so the button works on first run
  // even before the instructor opens the 자료실 section.
  await archive.ensureArchive().catch(() => { /* surfaced later via archive-status */ });
  createHomeWindow();
  registerShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createHomeWindow();
});
