'use strict';

const { app, BrowserWindow, ipcMain, globalShortcut, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

let mainWindow;
const smokeMode = process.argv.includes('--smoke-test')
  || process.env.VIBE_SMOKE_TEST === '1'
  || Boolean(process.env.VIBE_SMOKE_REPORT);

function getOptionalIconPath() {
  const iconPath = path.join(__dirname, '../../build/icon.ico');
  return fs.existsSync(iconPath) ? iconPath : undefined;
}

function createWindow() {
  const icon = getOptionalIconPath();
  mainWindow = new BrowserWindow({
    show: !smokeMode,
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'JuCoding · AI & Vibe Coding Studio',
    ...(icon ? { icon } : {}),
    backgroundColor: '#0D0E10',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  if (smokeMode) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(async () => {
        try {
          const result = await mainWindow.webContents.executeJavaScript(`({
            title: document.title,
            courses: document.querySelectorAll('#course-list .course-button').length,
            lessons: document.querySelectorAll('#lesson-list .lesson-row').length,
            panes: ['.course-rail','.lesson-pane','.detail-pane'].every((selector) => Boolean(document.querySelector(selector))),
            version: document.querySelector('.rail-footer strong')?.textContent || ''
          })`);
          const report = {
            ok: result.courses >= 5 && result.lessons > 0 && result.panes && result.version.includes('BETA 3'),
            packaged: app.isPackaged,
            appVersion: app.getVersion(),
            ...result,
          };
          const reportPath = process.env.VIBE_SMOKE_REPORT || path.join(app.getPath('temp'), 'vibe-studio-packaged-smoke.json');
          fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
          console.log(JSON.stringify(report));
          app.exit(report.ok ? 0 : 1);
        } catch (error) {
          console.error(error);
          app.exit(1);
        }
      }, 1200);
    });
  }

  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('fullscreen-changed', true);
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('fullscreen-changed', false);
  });
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+H', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'home');
  });
  globalShortcut.register('CommandOrControl+F', () => {
    if (mainWindow) {
      const next = !mainWindow.isFullScreen();
      mainWindow.setFullScreen(next);
    }
  });
  globalShortcut.register('Escape', () => {
    if (!mainWindow) return;
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    } else {
      mainWindow.webContents.send('shortcut', 'escape');
    }
  });
}

ipcMain.handle('read-manifest', () => {
  const manifestPath = path.join(__dirname, '../content/course-manifest.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
});

ipcMain.handle('read-official-sources', () => {
  const sourcesPath = path.join(__dirname, '../content/sources/official-sources.json');
  const raw = fs.readFileSync(sourcesPath, 'utf-8');
  return JSON.parse(raw);
});

ipcMain.handle('read-community-share-resources', () => {
  const sharePath = path.join(__dirname, '../content/community-share-resources.json');
  if (!fs.existsSync(sharePath)) {
    return { version: 1, resourcesUrl: '', resources: {} };
  }
  const raw = fs.readFileSync(sharePath, 'utf-8');
  return JSON.parse(raw);
});

ipcMain.handle('get-content-base', () => {
  const contentPath = path.join(__dirname, '../content').replace(/\\/g, '/');
  const prefix = /^[a-zA-Z]:/.test(contentPath) ? 'file:///' : 'file://';
  return prefix + contentPath;
});

ipcMain.handle('toggle-fullscreen', () => {
  if (!mainWindow) return false;
  const next = !mainWindow.isFullScreen();
  mainWindow.setFullScreen(next);
  return next;
});

ipcMain.handle('get-fullscreen', () => {
  return mainWindow ? mainWindow.isFullScreen() : false;
});

ipcMain.handle('save-pdf', async (_event, data, defaultPath) => {
  if (!mainWindow) return { ok: false, canceled: true };

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'PDF로 저장',
    defaultPath,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (result.canceled || !result.filePath) {
    return { ok: false, canceled: true };
  }

  fs.writeFileSync(result.filePath, Buffer.from(data));
  return { ok: true, filePath: result.filePath };
});

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
    const dataPath = path.join(app.getPath('userData'), 'vbc-state.json');
    let data = {};
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    data[key] = value;
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch { return false; }
});

ipcMain.handle('is-dev', () => !app.isPackaged);

ipcMain.handle('load-user-data', (_event, key) => {
  try {
    const dataPath = path.join(app.getPath('userData'), 'vbc-state.json');
    if (!fs.existsSync(dataPath)) return null;
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return key in data ? data[key] : null;
  } catch { return null; }
});

function userDataFile() {
  return path.join(app.getPath('userData'), 'vbc-state.json');
}

ipcMain.handle('export-user-data', async () => {
  if (!mainWindow) return { ok: false, canceled: true };
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'VIBE STUDIO 운영 데이터 백업',
    defaultPath: `VIBE-STUDIO-backup-${new Date().toISOString().slice(0, 10)}.zip`,
    filters: [
      { name: 'VIBE STUDIO ZIP Backup', extensions: ['zip'] },
      { name: 'JSON Backup', extensions: ['json'] },
    ],
  });
  if (result.canceled || !result.filePath) return { ok: false, canceled: true };
  let data = {};
  const dataPath = userDataFile();
  if (fs.existsSync(dataPath)) data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const payload = {
    schema: 'vibe-studio-backup',
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
    zip.addFile('README.txt', Buffer.from('VIBE STUDIO local instructor data backup\n', 'utf-8'));
    zip.writeZip(result.filePath);
  }
  return { ok: true, filePath: result.filePath };
});

ipcMain.handle('import-user-data', async () => {
  if (!mainWindow) return { ok: false, canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'VIBE STUDIO 운영 데이터 복원',
    properties: ['openFile'],
    filters: [{ name: 'VIBE STUDIO Backup', extensions: ['zip', 'json'] }],
  });
  if (result.canceled || !result.filePaths[0]) return { ok: false, canceled: true };
  const backupPath = result.filePaths[0];
  const payload = path.extname(backupPath).toLowerCase() === '.zip'
    ? JSON.parse(new AdmZip(backupPath).readAsText('backup.json'))
    : JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  if (payload.schema !== 'vibe-studio-backup' || payload.version !== 1 || typeof payload.data !== 'object') {
    throw new Error('지원하지 않는 백업 파일입니다.');
  }
  fs.writeFileSync(userDataFile(), JSON.stringify(payload.data, null, 2), 'utf-8');
  return { ok: true, filePath: result.filePaths[0], data: payload.data };
});

ipcMain.handle('open-content-path', async (_event, relativePath) => {
  const contentRoot = path.resolve(__dirname, '../content');
  const requested = String(relativePath || '');
  const source = path.resolve(contentRoot, requested);
  if (source !== contentRoot && !source.startsWith(contentRoot + path.sep)) {
    return { ok: false, message: '허용되지 않은 경로입니다.' };
  }
  if (!fs.existsSync(source)) return { ok: false, message: '파일 또는 폴더가 없습니다.' };
  let target = source;
  if (app.isPackaged && requested.replace(/\\/g, '/').startsWith('v3/projects/')) {
    const destinationRoot = path.join(app.getPath('documents'), 'VIBE STUDIO Labs');
    target = path.join(destinationRoot, requested.replace(/^v3[\\/]projects[\\/]/, ''));
    fs.cpSync(source, target, { recursive: true, force: true });
  }
  const errorMessage = await shell.openPath(target);
  return errorMessage ? { ok: false, message: errorMessage } : { ok: true, path: target };
});

app.whenReady().then(() => {
  createWindow();
  registerShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
