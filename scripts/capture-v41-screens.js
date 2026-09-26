'use strict';

// JuCoding V4.1 screenshot capture.
//
// Produces the visual record for the Archive and simulation work in
// artifacts/qa. Run with --visible: Chromium only produces a trustworthy
// frame for a window the user can actually see, and a visible window is also
// the only way to get a real capture.
//
//   npx electron scripts/capture-v41-screens.js --visible
//
// It reuses the same throwaway Archive root approach as smoke:v4:shell, so it
// never writes into the real Documents folder.

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const qaDir = path.join(root, 'artifacts', 'qa');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VISIBLE = process.env.JUCODING_QA_VISIBLE === '1' || process.argv.includes('--visible');

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'jucoding-v41-shot-'));
const archiveRoot = path.join(sandbox, 'Archive');
process.env.JUCODING_ARCHIVE_ROOT = archiveRoot;
app.setPath('userData', path.join(sandbox, 'userData'));

const archive = require('../src/main/v4-archive');

const store = {};
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
ipcMain.handle('load-user-data', (_e, k) => (k in store ? store[k] : null));
ipcMain.handle('save-user-data', (_e, k, v) => { store[k] = v; return true; });
ipcMain.handle('export-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('import-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('open-external', () => ({ ok: true }));
ipcMain.handle('archive-status', () => archive.status());
ipcMain.handle('archive-open-folder', (_e, w) => archive.openFolder(w));
ipcMain.handle('archive-scan', async () => ({ ok: true, ...(await archive.scanInbox()) }));
ipcMain.handle('archive-propose', (_e, n) => archive.propose(n));
ipcMain.handle('archive-proposals', async () => ({ ok: true, proposals: await archive.listProposals() }));
ipcMain.handle('archive-proposal', async (_e, id) => {
  const p = await archive.getProposal(id);
  return p ? { ok: true, proposal: p } : { ok: false, message: '없음' };
});
ipcMain.handle('archive-apply', (_e, id, d) => archive.applyProposal(id, d));
ipcMain.handle('archive-overrides', async () => ({ ok: true, overrides: await archive.readOverrides() }));
ipcMain.handle('organizer-status', () => require('../src/main/v4-organizer').status());
ipcMain.handle('archive-asset-data', async (_e, p) => {
  const u = await archive.assetDataUrl(p);
  return u ? { ok: true, dataUrl: u } : { ok: false };
});


// A real, decodable PNG. The previous inline base64 was truncated (no IEND
// chunk), so image previews rendered as a broken image.
function tinyPng(size = 16, rgb = [124, 107, 240]) {
  const zlib = require('zlib');
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let crc = 0xffffffff;
    for (let n = 0; n < buf.length; n += 1) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[n]) & 0xff];
    return (crc ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc(size * (1 + size * 3));
  let o = 0;
  for (let y = 0; y < size; y += 1) {
    raw[o++] = 0;
    for (let x = 0; x < size; x += 1) { raw[o++] = rgb[0]; raw[o++] = rgb[1]; raw[o++] = rgb[2]; }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}
const TINY_PNG = tinyPng();

function seed() {
  const inbox = path.join(archiveRoot, 'inbox');
  fs.mkdirSync(inbox, { recursive: true });
  fs.writeFileSync(path.join(inbox, 'agent-vs-ai.md'), [
    '# AI와 Agent',
    '',
    'AI는 질문에 답하는 기술이고, Agent는 목표를 받고 필요한 도구를 선택해서 실행한 뒤 결과를 확인하고 필요하면 반복합니다.',
    'Agent 판단은 LLM이, 실제 실행은 Worker가 나눠 맡습니다.'
  ].join('\n'), 'utf-8');
  fs.writeFileSync(path.join(inbox, 'mcp-example.png'), TINY_PNG);
  // A real, full-size lecture visual so the review screen shows an actual picture.
  fs.copyFileSync(
    path.join(root, 'src/assets/lecture/v4/automation-deploy-mcp.webp'),
    path.join(inbox, '배포-mcp-정리도.webp')
  );
  fs.writeFileSync(path.join(inbox, 'syllabus.pdf'), Buffer.from('%PDF-1.4'));
}

const SHOTS = [
  { name: 'v41-01-home.png', step: async () => {
    await win.webContents.executeJavaScript(`document.querySelector('[data-section="home"]').click()`);
    await wait(300);
  } },
  { name: 'v41-02-archive-inbox.png', step: async () => {
    await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('[data-section="library"]').click();
        await sleep(200);
        document.querySelector('#btn-scan-archive').click();
        await sleep(900);
        document.querySelector('#archive-card-top')?.scrollIntoView();
        document.querySelector('.archive-card').scrollIntoView({ block: 'start' });
        await sleep(200);
      })()
    `);
  } },
  { name: 'v41-03-archive-proposal.png', step: async () => {
    await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#btn-make-proposal').click();
        await sleep(1800);
      })()
    `);
  } },
  { name: 'v41-04-archive-approved.png', step: async () => {
    await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const cards = [...document.querySelectorAll('#proposal-changes .change-card')];
        cards.forEach((c) => c.querySelector('[data-decide="apply"]').click());
        await sleep(200);
      })()
    `);
  } }
];

app.whenReady().then(async () => {
  if (!VISIBLE) {
    console.error('capture-v41-screens: pass --visible (a hidden window produces stale frames)');
    app.exit(1);
    return;
  }
  await archive.ensureArchive();
  seed();
  fs.mkdirSync(qaDir, { recursive: true });

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

  const capture = async (name) => {
    await wait(400);
    fs.writeFileSync(path.join(qaDir, name), (await win.webContents.capturePage()).toPNG());
    console.log(`✓ ${name}`);
  };

  await win.loadFile(path.join(root, 'src/renderer/v4/home.html'));
  await wait(900);
  for (const shot of SHOTS) {
    await shot.step();
    await capture(shot.name);
  }

  // Image review: the picture itself, plus the scene picker.
  await win.webContents.executeJavaScript(`
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const dlg = document.querySelector('#proposal-dialog');
      if (dlg?.open) dlg.close();
      document.querySelector('[data-section="library"]').click();
      await sleep(250);
      document.querySelector('#btn-scan-archive').click();
      await sleep(1100);
      document.querySelector('#btn-make-proposal').click();
      await sleep(2800);
      // Prefer the full-size lecture visual over the 16px swatch.
      const cards = [...document.querySelectorAll('#proposal-changes .change-card[data-action="asset"]')];
      const card = cards.find((c) => (c.querySelector('[data-asset-title]')?.value || '').endsWith('.webp')) || cards[0];
      if (card) {
        card.scrollIntoView({ block: 'center' });
        const pick = card.querySelector('[data-scene-pick]');
        const title = card.querySelector('[data-asset-title]');
        if (pick) pick.value = 'mcp';
        if (title) title.value = '배포 · MCP · Agent · Worker 정리도';
        const cap = card.querySelector('[data-asset-caption]');
        if (cap) cap.value = '제6장 수업에서 같이 보는 도표';
      }
      await sleep(500);
    })()
  `);
  await capture('v41-09-archive-image-review.png');

  // Lecture: static scene with the simulation entry, then mid-playback.
  await win.webContents.executeJavaScript(`document.querySelector('#proposal-dialog')?.close()`);
  await win.webContents.executeJavaScript(`document.querySelector('#btn-start-lecture')?.click()`);
  await wait(1600);
  await capture('v41-05-lecture-scene.png');

  await win.webContents.executeJavaScript(`
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      window.__jucodingV4.gotoScene(3);
      await sleep(300);
    })()
  `);
  await capture('v41-06-lecture-simulation-entry.png');

  await win.webContents.executeJavaScript(`document.querySelector('[data-sim="ai-agent"]').click()`);
  await wait(300);
  await win.webContents.executeJavaScript(`
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let i = 0; i < 8; i += 1) {
        document.querySelector('[data-role="next"]').click();
        await sleep(90);
      }
    })()
  `);
  await capture('v41-07-lecture-simulation-running.png');

  await win.webContents.executeJavaScript(`
    (async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      document.querySelector('[data-role="reset"]').click();
      await sleep(150);
      window.__jucodingV4.closeSimulation();
      window.__jucodingV4.gotoScene(19);
      await sleep(250);
      document.querySelector('[data-sim="safety-boundary"]').click();
      await sleep(200);
      for (let i = 0; i < 8; i += 1) {
        document.querySelector('[data-role="next"]').click();
        await sleep(90);
      }
    })()
  `);
  await capture('v41-08-lecture-safety-simulation.png');

  app.exit(0);
});
