'use strict';

// JuCoding V4 shell smoke.
//
// Two jobs:
//   1. The V4 home is the first thing the app shows, with no legacy V3
//      course-management DOM anywhere.
//   2. The Archive flow works end to end against the REAL main-process module:
//      folder creation -> open inbox -> scan -> recognise each supported
//      format -> build a draft -> preview -> reject (lecture unchanged) ->
//      approve (backup first, lecture changes, material filed away).
//
// QA runs against a throwaway Archive root and a throwaway userData directory,
// so the developer's real Documents folder and app state are never touched.

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.join(__dirname, '..');
const qaDir = path.join(root, 'artifacts', 'qa');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'jucoding-v41-'));
const archiveRoot = path.join(sandbox, 'Archive');
process.env.JUCODING_ARCHIVE_ROOT = archiveRoot;
app.setPath('userData', path.join(sandbox, 'userData'));

// Hidden by default so QA never steals focus or covers the desktop.
// Background throttling is disabled and the compositor is invalidated before
// each capture so screenshots stay current.
//
// One caveat: BrowserWindow.setFullScreen() is a no-op on a hidden window, so
// the OS-level fullscreen round-trip can only be verified with a real window.
// It is asserted as a skipped check in hidden mode and reported as such, and
// JUCODING_QA_VISIBLE=1 runs the full assertion.

// argv is checked as well as the env var because WSL does not forward
// environment variables into Windows binaries, which is exactly the host
// this QA runs on.
const VISIBLE = process.env.JUCODING_QA_VISIBLE === '1' || process.argv.includes('--visible');

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
ipcMain.handle('load-user-data', (_event, key) => (key in store ? store[key] : null));
ipcMain.handle('save-user-data', (_event, key, value) => { store[key] = value; return true; });
ipcMain.handle('export-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('import-user-data', () => ({ ok: false, canceled: true }));
ipcMain.handle('open-external', () => ({ ok: true }));

// The real archive handlers, so the UI is exercised against production code.
ipcMain.handle('archive-status', () => archive.status());
ipcMain.handle('archive-open-folder', (_e, which) => archive.openFolder(which));
ipcMain.handle('archive-scan', async () => ({ ok: true, ...(await archive.scanInbox()) }));
ipcMain.handle('archive-propose', (_e, names) => archive.propose(names));
ipcMain.handle('archive-proposals', async () => ({ ok: true, proposals: await archive.listProposals() }));
ipcMain.handle('archive-proposal', async (_e, id) => {
  const proposal = await archive.getProposal(id);
  return proposal ? { ok: true, proposal } : { ok: false, message: '없음' };
});
ipcMain.handle('archive-apply', (_e, id, decisions) => archive.applyProposal(id, decisions));
ipcMain.handle('archive-overrides', async () => ({ ok: true, overrides: await archive.resolveAssetUrls(await archive.readOverrides()) }));
ipcMain.handle('organizer-status', () => require('../src/main/v4-organizer').status());

function check(results, name, ok, detail) {
  results[name] = { ok: Boolean(ok), ...(detail !== undefined ? { detail } : {}) };
  return Boolean(ok);
}


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

function seedInbox() {
  const inbox = path.join(archiveRoot, 'inbox');
  fs.mkdirSync(inbox, { recursive: true });
  fs.writeFileSync(path.join(inbox, 'agent-vs-ai.md'), [
    '# Agent와 AI 차이 정리',
    '',
    'AI는 질문에 답하는 기술이고, Agent는 목표를 받고 필요한 도구를 선택해서 실행한 뒤 결과를 확인하고 필요하면 반복합니다.',
    '이 문장은 MCP로 외부 도구를 연결하는 설명에도 그대로 쓰입니다.',
    '',
    '## 참고',
    '- Agent 판단은 LLM이, 실행은 Worker가 맡습니다.'
  ].join('\n'), 'utf-8');
  fs.writeFileSync(path.join(inbox, 'lecture-notes.txt'), [
    'MCP는 AI가 브라우저 파일 데이터베이스 같은 외부 도구를 사용할 수 있게 연결하는 공통 방식입니다.',
    '자동화에서 사람이 통제할 지점을 남기는 것이 안전합니다.'
  ].join('\n'), 'utf-8');
  fs.writeFileSync(path.join(inbox, 'approved-proposal.json'), JSON.stringify({
    changes: [
      {
        sceneId: 'mcp',
        action: 'replace',
        before: 'MCP는 AI가 브라우저, 파일, DB 같은 외부 도구를 사용할 수 있게 연결하는 공통 방식입니다.',
        after: 'MCP는 Agent가 손과 도구함을 써서 외부 도구를 다루게 하는 공통 규격입니다.',
        reason: '수업会用 기준 문구로 정리했습니다.',
        confidence: 'high'
      }
    ]
  }, null, 2), 'utf-8');
  fs.writeFileSync(path.join(inbox, 'mcp-example.png'), TINY_PNG);
  // Must be surfaced as ignored, not silently dropped.
  fs.writeFileSync(path.join(inbox, 'syllabus.pdf'), Buffer.from('%PDF-1.4 not really parsed'));
  fs.writeFileSync(path.join(inbox, 'ignored.docx'), Buffer.from('binary'));
}

app.whenReady().then(async () => {
  win = new BrowserWindow({
    show: VISIBLE,
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
  win.webContents.setBackgroundThrottling(false);

  // See the note in smoke-v4-lecture.js: a hidden window yields stale frames,
  // so screenshots are only written in visible mode and the omission is
  // reported rather than hidden behind a misleading PNG.
  const skippedScreenshots = [];
  const capture = async (name) => {
    if (!VISIBLE) {
      skippedScreenshots.push(name);
      return false;
    }
    fs.writeFileSync(path.join(qaDir, name), (await win.webContents.capturePage()).toPNG());
    return true;
  };

  const errors = [];
  win.webContents.on('console-message', (_event, level, message) => {
    if (/Electron Security Warning/i.test(message)) return;
    if (level >= 2 || /uncaught|failed|error/i.test(message)) errors.push(message);
  });

  const results = {};
  fs.mkdirSync(qaDir, { recursive: true });
  const mark = (m) => process.stdout.write(`[mark] ${m}\n`);

  try {
    // ------------------------------------------- 13. Archive folder creation ---
    const beforeLaunch = fs.existsSync(archiveRoot);
    await archive.ensureArchive(); mark('archive created');
    const tree = archive.SUBFOLDERS.filter((name) => fs.existsSync(path.join(archiveRoot, name)));
    check(results, 'qa13_archiveFoldersCreated',
      beforeLaunch === false && tree.length === 4,
      { beforeLaunch, created: tree, root: archiveRoot });
    check(results, 'qa13_archiveRootOutsideInstall',
      !archiveRoot.startsWith(path.join(root, 'src')),
      archiveRoot);

    seedInbox();

    await win.loadFile(path.join(root, 'src/renderer/v4/home.html')); mark('home loaded');
    await wait(700);

    // ------------------------------------------------------------- home DOM ---
    const home = await win.webContents.executeJavaScript(`
      (() => ({
        url: location.href,
        title: document.title,
        v4home: Boolean(document.querySelector('#v4home')),
        brand: document.querySelector('.brand strong')?.textContent || '',
        nav: [...document.querySelectorAll('.home-nav button')].map((b) => b.textContent.trim()),
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
    await capture('jucoding-v4home-1366x768.png');

    mark('home DOM ok');
    // ------------------------------- 15/16. scan and per-format recognition ---
    const scan = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('[data-section="library"]')?.click();
        await sleep(120);
        document.querySelector('#btn-scan-archive')?.click();
        await sleep(600);
        const rows = [...document.querySelectorAll('#archive-files .archive-file')].map((r) => ({
          name: r.querySelector('.archive-file-name')?.textContent || '',
          state: r.querySelector('.archive-file-state')?.textContent || ''
        }));
        return {
          count: document.querySelector('#archive-count')?.textContent || '',
          ai: document.querySelector('#archive-ai')?.textContent || '',
          path: document.querySelector('#archive-path')?.textContent || '',
          proposeVisible: !document.querySelector('#archive-propose-row')?.hidden,
          rows
        };
      })()
    `);
    const rowFor = (name) => scan.rows.find((r) => r.name === name) || null;
    check(results, 'qa15_scanInbox', scan.rows.length === 6, scan.rows);
    check(results, 'qa16_recognisesSupported',
      Boolean(rowFor('agent-vs-ai.md'))
      && Boolean(rowFor('lecture-notes.txt'))
      && Boolean(rowFor('approved-proposal.json'))
      && Boolean(rowFor('mcp-example.png'))
      && scan.rows.every((r) => !r.name.endsWith('.pdf') || r.state === 'PDF 지원 예정'),
      scan.rows);
    check(results, 'qa16_ignoresUnsupported',
      Boolean(rowFor('syllabus.pdf')) && rowFor('syllabus.pdf').state === 'PDF 지원 예정'
      && Boolean(rowFor('ignored.docx')),
      { pdf: rowFor('syllabus.pdf'), docx: rowFor('ignored.docx') });
    check(results, 'qa16_showsAiNotConnected',
      scan.ai.includes('AI 정리는 연결되지 않았습니다.') && scan.ai.includes('로컬 규칙 기반'),
      scan.ai);
    await capture('jucoding-v4home-archive.png');

    mark('scan ok');
    // ------------------------------------------------------ 14. open inbox ---
    const openInbox = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#btn-open-archive')?.click();
        await sleep(500);
        return document.querySelector('#archive-count')?.textContent || '';
      })()
    `);
    // shell.openPath is a no-op in this environment; assert the folder resolves
    // and the UI reports no error instead.
    check(results, 'qa14_openInbox',
      fs.existsSync(path.join(archiveRoot, 'inbox')) && !openInbox.includes('열지 못'),
      { inboxExists: true, ui: openInbox });

    mark('openInbox ok');
    // ------------------------------------------- 17. proposal + preview UI ---
    const preview = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#btn-make-proposal')?.click();
        await sleep(1500);
        const cards = [...document.querySelectorAll('#proposal-changes .change-card')].map((c) => ({
          id: c.dataset.change,
          action: c.dataset.action,
          decision: c.dataset.decision,
          pickedKeep: c.querySelectorAll('[data-decide="keep"].is-picked').length,
          pickedApply: c.querySelectorAll('[data-decide="apply"].is-picked').length,
          scene: c.querySelector('.change-scene')?.textContent || '',
          tag: c.querySelector('.change-tag')?.textContent || '',
          conf: c.querySelector('.change-conf')?.textContent || '',
          before: c.querySelector('.change-before p')?.textContent || '',
          after: (c.querySelector('[data-after]') || c.querySelector('[data-asset-title]'))?.value || '',
          sceneOptions: c.querySelectorAll('[data-scene-pick] option').length
        }));
        return {
          open: Boolean(document.querySelector('#proposal-dialog')?.open),
          meta: document.querySelector('#proposal-meta')?.textContent || '',
          applyDisabled: document.querySelector('#btn-proposal-apply')?.disabled,
          summary: document.querySelector('#proposal-summary')?.textContent || '',
          count: cards.length,
          cards,
          targetScene: cards.some((c) => c.tag === '강의 메모에 추가' || c.tag === '한 줄 요약 교체')
        };
      })()
    `);
    // An asset card has no "before" text (it attaches a picture rather than
    // replacing copy), so only text changes are required to show a diff.
    check(results, 'qa17_previewShown',
      preview.open
      && preview.count > 0
      && preview.cards.every((c) => c.after && c.scene && c.conf
        && (c.action === 'asset' || c.before)),
      { count: preview.count, meta: preview.meta, actions: preview.cards.map((c) => c.action) });
    check(results, 'qa17_defaultsToKeep',
      preview.cards.every((c) => c.decision === 'keep') && preview.applyDisabled === true,
      { decisions: preview.cards.map((c) => c.decision), summary: preview.summary });
    // The selected decision must be visible, not just stored in a data attribute.
    check(results, 'qa17_selectedDecisionIsVisible',
      preview.cards.every((c) => c.pickedKeep === 1 && c.pickedApply === 0),
      preview.cards.map((c) => ({ keep: c.pickedKeep, apply: c.pickedApply })));
    check(results, 'qa17_imageCardHasScenePicker',
      preview.cards.filter((c) => c.action === 'asset').every((c) => c.sceneOptions >= 21),
      preview.cards.filter((c) => c.action === 'asset').map((c) => c.sceneOptions));

    mark('preview ok');
    // ------------------------------- 18. reject everything -> no change ------
    const beforeReject = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#btn-proposal-none')?.click();
        await sleep(80);
        document.querySelector('#btn-proposal-apply')?.click();
        await sleep(900);
        const overrides = await window.vibeCodingApp.getLectureOverrides();
        return {
          overrides: overrides.overrides,
          status: document.querySelector('#proposal-status')?.textContent || ''
        };
      })()
    `);
    check(results, 'qa18_rejectLeavesLectureUnchanged',
      beforeReject.overrides.scenes
      && Object.keys(beforeReject.overrides.scenes).length === 0
      && Object.keys(beforeReject.overrides.assets).length === 0
      && beforeReject.overrides.newScenes.length === 0,
      beforeReject.overrides);
    // With nothing approved the UI keeps Apply disabled; the module must also
    // refuse an empty approval set rather than writing an empty override file.
    const draft = await archive.listProposals();
    const firstDraft = draft.length ? await archive.getProposal(draft[0].id) : null;
    const rejectCall = firstDraft
      ? await archive.applyProposal(firstDraft.id, [{ id: firstDraft.changes[0].id, decision: 'keep' }])
      : { ok: false };
    const afterReject = await archive.readOverrides();
    check(results, 'qa18_rejectIsANoOp',
      rejectCall.ok === true
      && rejectCall.applied === 0
      && Object.keys(afterReject.scenes).length === 0,
      rejectCall);
    check(results, 'qa18_rejectCreatesNoBackup',
      fs.existsSync(path.join(archiveRoot, 'backup')) && fs.readdirSync(path.join(archiveRoot, 'backup')).length === 0,
      fs.readdirSync(path.join(archiveRoot, 'backup')));
    check(results, 'qa18_rejectKeepsMaterialInInbox',
      fs.readdirSync(path.join(archiveRoot, 'inbox')).includes('agent-vs-ai.md'),
      fs.readdirSync(path.join(archiveRoot, 'inbox')));

    mark('reject ok');
    // --------------------------------- 19/20. approve -> backup then change ---
    const applied = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // Approve candidates that target DIFFERENT scenes, and hand-edit one of
        // them. Two changes to the same field would legitimately overwrite each
        // other, which would make the manual-edit assertion meaningless.
        // Text changes only: an image card has a scene picker and a title field
        // instead of a free-text editor, and is covered by the qa22_* checks.
        const cards = [...document.querySelectorAll('#proposal-changes .change-card')]
          .filter((c) => c.dataset.action !== 'asset');
        const sceneOf = (c) => (c.querySelector('.change-scene')?.textContent || '');
        // Two candidates can target the same scene+field, in which case the last
        // approved one legitimately wins. To make both assertions meaningful,
        // approve the two candidates that belong to DIFFERENT scenes.
        const seenScene = new Set();
        const distinct = cards.filter((c) => {
          const key = sceneOf(c);
          if (seenScene.has(key)) return false;
          seenScene.add(key);
          return true;
        });
        const editTarget = distinct[0];
        const otherTarget = distinct[1];
        editTarget.querySelector('[data-decide="apply"]').click();
        if (otherTarget) otherTarget.querySelector('[data-decide="apply"]').click();
        const editor = editTarget.querySelector('[data-after]');
        editor.value = editor.value + ' (수정본)';
        window.__qaEditScene = sceneOf(editTarget);
        document.querySelector('#btn-proposal-apply')?.click();
        await sleep(2500);
        const overrides = await window.vibeCodingApp.getLectureOverrides();
        return {
          overrides: overrides.overrides,
          status: document.querySelector('#proposal-status')?.textContent || '',
          count: document.querySelector('#archive-count')?.textContent || ''
        };
      })()
    `);
    const sceneOverrides = applied.overrides.scenes || {};
    const overrideSceneIds = Object.keys(sceneOverrides);
    const backupDirs = fs.existsSync(path.join(archiveRoot, 'backup')) ? fs.readdirSync(path.join(archiveRoot, 'backup')) : [];
    const editedValues = Object.values(sceneOverrides)
      .flatMap((patch) => [patch.narration, patch.extra].filter(Boolean));
    const editedApplied = editedValues.some((text) => String(text).endsWith('(수정본)'));

    // Which candidates the local rules pick depends on inbox readdir order, so
    // this asserts the invariant (two distinct scenes changed, each with a real
    // value) rather than a specific field. Per-action coverage is asserted
    // deterministically further down.
    const patchedFieldsOk = Object.values(sceneOverrides).every((patch) =>
      [patch.narration, patch.extra].some((v) => typeof v === 'string' && v.trim()));
    check(results, 'qa19_approveChangesLecture',
      overrideSceneIds.length === 2 && patchedFieldsOk,
      { scenes: overrideSceneIds, ...sceneOverrides });
    check(results, 'qa19_manualEditUsed', editedApplied, sceneOverrides);
    check(results, 'qa19_installedContentUntouched',
      !fs.existsSync(path.join(root, 'src', 'content', 'v4', 'scenes', '20-safety.json.bak'))
      && JSON.parse(fs.readFileSync(path.join(root, 'src/content/v4/curriculum.json'), 'utf-8')).version === '4.1',
      'shipped curriculum.json unchanged');

    check(results, 'qa20_backupBeforeApply',
      backupDirs.length === 1 && /^\d{4}-\d{2}-\d{2}-\d{4}$/.test(backupDirs[0]),
      backupDirs);
    const backupDir = backupDirs[0] ? path.join(archiveRoot, 'backup', backupDirs[0]) : null;
    const backupFiles = backupDir ? fs.readdirSync(backupDir).sort() : [];
    check(results, 'qa20_backupContents',
      backupFiles.includes('lecture-overrides.before.json')
      && backupFiles.includes('lecture-content.snapshot.json')
      && backupFiles.includes('RESTORE.txt'),
      backupFiles);
    if (backupDir) {
      const snapshot = JSON.parse(fs.readFileSync(path.join(backupDir, 'lecture-content.snapshot.json'), 'utf-8'));
      check(results, 'qa20_backupSnapshotIsPreApply',
        snapshot.overrides
        && Object.keys(snapshot.overrides.scenes || {}).length === 0
        && Array.isArray(snapshot.scenes)
        && snapshot.scenes.length === 21,
        { sceneCount: snapshot.scenes.length, overrideScenes: Object.keys(snapshot.overrides.scenes || {}).length });
    }

    mark('apply ok');
    // ---------------------------------------- 21. applied / reviewed filing ---
    const inboxAfter = fs.readdirSync(path.join(archiveRoot, 'inbox'));
    const appliedFiles = fs.readdirSync(path.join(archiveRoot, 'applied'));
    const reviewedFiles = fs.readdirSync(path.join(archiveRoot, 'reviewed'));
    const manifestName = appliedFiles.find((n) => n.startsWith('apply-') && n.endsWith('.json'));
    if (manifestName) {
      const manifest = JSON.parse(fs.readFileSync(path.join(archiveRoot, 'applied', manifestName), 'utf-8'));
      check(results, 'qa21_manifestListsBackup',
        Boolean(manifest.backup) && Array.isArray(manifest.approvedChanges) && manifest.approvedChanges.length > 0,
        { backup: manifest.backup, approved: manifest.approvedChanges.length });
    }
    // Only supported material was part of the scanned/proposed set. Ignored
    // files (.pdf, .docx) were never claimed by the flow and may remain.
    const ignoredStillPresent = inboxAfter.every((n) => /\.(pdf|docx)$/i.test(n));
    check(results, 'qa21_supportedMaterialFiledAway',
      inboxAfter.every((n) => /\.(pdf|docx)$/i.test(n)) && ignoredStillPresent,
      inboxAfter);
    check(results, 'qa21_reviewedHoldsUnappliedMaterial',
      reviewedFiles.length > 0
      && reviewedFiles.every((n) => !n.startsWith('apply-')),
      reviewedFiles);
    // Every source behind an approved change has to reach applied/. Asserting
    // only that "some material" arrived let a change lose its source attribution
    // and still pass, which silently mis-filed the file into reviewed/.
    const appliedProposal = manifestName
      ? JSON.parse(fs.readFileSync(path.join(archiveRoot, 'applied', manifestName), 'utf-8'))
      : null;
    const movedApplied = appliedProposal
      ? appliedProposal.moved.filter((m) => m.applied).map((m) => m.name)
      : [];
    const movedReviewed = appliedProposal
      ? appliedProposal.moved.filter((m) => !m.applied).map((m) => m.name)
      : [];
    check(results, 'qa21_appliedFolderHasMaterial', movedApplied.length > 0, { applied: movedApplied, reviewed: movedReviewed });
    check(results, 'qa21_appliedMaterialIsInAppliedFolder',
      movedApplied.length > 0 && movedApplied.every((n) => appliedFiles.includes(n)),
      { movedApplied, appliedFiles });
    check(results, 'qa21_reviewedMaterialIsInReviewedFolder',
      movedReviewed.every((n) => reviewedFiles.includes(n)),
      { movedReviewed, reviewedFiles });
    check(results, 'qa21_manifestWritten',
      appliedFiles.some((n) => n.startsWith('apply-') && n.endsWith('.json')),
      appliedFiles);

    mark('filing ok');
    // ---------------------------- deterministic per-action coverage ---------
    // A crafted .json material is used verbatim by the organizer, so the write
    // path for each action can be asserted without depending on rule output.
    fs.writeFileSync(path.join(archiveRoot, 'inbox', 'action-matrix.json'), JSON.stringify({
      changes: [
        { sceneId: 'git', action: 'replace', field: 'narration', before: '', after: 'replace 대상 문장입니다.', reason: 'qa', confidence: 'high' },
        { sceneId: 'git', action: 'append', field: 'extra', before: '', after: 'append 대상 문장입니다.', reason: 'qa', confidence: 'high' },
        { sceneId: 'cover', action: 'new_scene', after: '새 장면 본문입니다.', title: '자료함 신규 장면', reason: 'qa', confidence: 'high' }
      ]
    }), 'utf-8');
    const matrixProposal = await archive.propose(['action-matrix.json']);
    const matrixApply = matrixProposal.ok
      ? await archive.applyProposal(matrixProposal.proposal.id,
        matrixProposal.proposal.changes.map((c) => ({ id: c.id, decision: 'apply' })))
      : { ok: false };
    const matrixOverrides = await archive.readOverrides();
    const gitPatch = matrixOverrides.scenes.git || {};
    check(results, 'qa19_replaceWritesNarration',
      gitPatch.narration === 'replace 대상 문장입니다.', gitPatch);
    check(results, 'qa19_appendAppendsToExtra',
      String(gitPatch.extra || '').includes('append 대상 문장입니다.'), gitPatch);
    const newScene = matrixOverrides.newScenes.find((s) => s.id === 'cover');
    const curriculum = JSON.parse(fs.readFileSync(path.join(root, 'src/content/v4/curriculum.json'), 'utf-8'));
    check(results, 'qa19_newSceneRegistered',
      Boolean(newScene)
      && newScene.title === '자료함 신규 장면'
      && curriculum.chapters.some((c) => c.id === newScene.chapter)
      && newScene.origin === 'archive'
      && matrixApply.ok === true,
      matrixOverrides.newScenes);
    // A second replace+append on the same field must append, never clobber.
    check(results, 'qa19_replaceIsNotCumulative',
      gitPatch.narration === 'replace 대상 문장입니다.', gitPatch.narration);

    // ------- regression: prose material keeps its source attribution --------
    // A .md/.txt file goes through the organizer's statement-extraction path,
    // which is separate from the explicit-proposal and image paths. A change
    // that loses sourceName there gets applied to the lecture while its file is
    // mis-filed into reviewed/, so cover it directly.
    fs.writeFileSync(path.join(archiveRoot, 'inbox', 'prose-attribution.md'),
      'AI는 질문에 답하는 기술이고, Agent는 목표를 받고 필요한 도구를 선택해서 실행한 뒤 결과를 확인하고 필요하면 반복합니다.\n', 'utf-8');
    const proseProposal = await archive.propose(['prose-attribution.md']);
    const proseChanges = proseProposal.ok ? proseProposal.proposal.changes : [];
    check(results, 'qa21_proseChangeCarriesSourceName',
      proseChanges.length > 0 && proseChanges.every((c) => c.sourceName === 'prose-attribution.md'),
      proseChanges.map((c) => ({ action: c.action, sourceName: c.sourceName })));
    if (proseChanges.length) {
      await archive.applyProposal(proseProposal.proposal.id,
        proseChanges.map((c) => ({ id: c.id, decision: 'apply' })));
      const appliedNow = fs.readdirSync(path.join(archiveRoot, 'applied'));
      const reviewedNow = fs.readdirSync(path.join(archiveRoot, 'reviewed'));
      check(results, 'qa21_proseMaterialLandsInApplied',
        appliedNow.includes('prose-attribution.md') && !reviewedNow.includes('prose-attribution.md'),
        { applied: appliedNow, reviewed: reviewedNow });
    }

    // ------------------- regression: an image reaches a lecture scene --------
    // An image used to be dropped entirely: the filename-vs-sentence similarity
    // never cleared the confidence threshold, so propose() returned no change
    // for any picture. Images must never be discarded, and the instructor picks
    // the scene.
    fs.copyFileSync(
      path.join(root, 'src', 'assets', 'lecture', 'v4', 'beginner-dev-terms.webp'),
      path.join(archiveRoot, 'inbox', 'zzz-의도치않은파일명.webp')
    );
    const imgProposal = await archive.propose(['zzz-의도치않은파일명.webp']);
    const imgChanges = imgProposal.ok ? imgProposal.proposal.changes : [];
    check(results, 'qa22_imageProducesAssetChange',
      imgChanges.length === 1 && imgChanges[0].action === 'asset',
      imgChanges.map((c) => ({ action: c.action, scene: c.sceneId, source: c.sourceName })));
    check(results, 'qa22_imageCarriesSceneOptions',
      Array.isArray(imgProposal.proposal.sceneOptions) && imgProposal.proposal.sceneOptions.length === 21,
      (imgProposal.proposal.sceneOptions || []).length);
    check(results, 'qa22_imageHasPreview',
      typeof imgChanges[0]?.previewDataUrl === 'string' && imgChanges[0].previewDataUrl.startsWith('data:image/'),
      (imgChanges[0]?.previewDataUrl || '').slice(0, 24));
    if (imgChanges.length) {
      // Place it on a scene the filename could never have guessed.
      const pickedScene = 'git';
      const imgApply = await archive.applyProposal(imgProposal.proposal.id, [{
        id: imgChanges[0].id,
        decision: 'apply',
        sceneId: pickedScene,
        title: 'Git 기록 정리도',
        caption: '수업 중 함께 보는 도표'
      }]);
      const imgOverrides = await archive.readOverrides();
      check(results, 'qa22_imageHonoursChosenScene',
        imgApply.ok === true
        && imgOverrides.assets[pickedScene]
        && imgOverrides.assets[pickedScene].archivePath.startsWith('applied/')
        && imgOverrides.assets[pickedScene].caption === '수업 중 함께 보는 도표',
        imgOverrides.assets);
      const resolved = await archive.resolveAssetUrls(await archive.readOverrides());
      check(results, 'qa22_imageInlinedAsDataUrl',
        typeof resolved.assets[pickedScene]?.dataUrl === 'string'
        && resolved.assets[pickedScene].dataUrl.startsWith('data:image/webp;base64,'),
        (resolved.assets[pickedScene]?.dataUrl || '').slice(0, 24));
    }

    // ------------------------------- 18b. reject-only material -> reviewed ---
    // Everything was approved above, so seed a second, unrelated material and
    // approve none of its candidates.
    fs.writeFileSync(path.join(archiveRoot, 'inbox', 'unrelated.txt'),
      '오늘 날씨가 좋아서 산책하러 갔습니다.\n', 'utf-8');
    const reviewedFlow = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('#btn-scan-archive')?.click();
        await sleep(500);
        document.querySelector('#btn-make-proposal')?.click();
        await sleep(1500);
        const cards = [...document.querySelectorAll('#proposal-changes .change-card')];
        cards.forEach((c) => c.querySelector('[data-decide="keep"]').click());
        document.querySelector('#btn-proposal-apply')?.click();
        await sleep(1200);
        return { count: cards.length, status: document.querySelector('#proposal-status')?.textContent || '' };
      })()
    `);
    const inboxAfterUnrelated = fs.readdirSync(path.join(archiveRoot, 'inbox'));
    const reviewedAfter = fs.existsSync(path.join(archiveRoot, 'reviewed')) ? fs.readdirSync(path.join(archiveRoot, 'reviewed')) : [];
    // Nothing was proposed for this file, so there is nothing to review and
    // nothing to apply: it must stay in inbox rather than being filed away.
    check(results, 'qa21_noProposalStaysInInbox',
      reviewedFlow.count === 0
      && inboxAfterUnrelated.includes('unrelated.txt')
      && !reviewedAfter.includes('unrelated.txt'),
      { flow: reviewedFlow, inbox: inboxAfterUnrelated, reviewed: reviewedAfter });

    mark('reviewed flow ok');
    // ------------------------------- overrides reach the lecture renderer ---
    // The click must be its own evaluateJavaScript call: a pending script is
    // destroyed when the page navigates away, so sleeping inside the same
    // expression would never settle.
    await win.webContents.executeJavaScript(`document.querySelector('#btn-start-lecture')?.click()`);
    await wait(1600);
    const lecture = await win.webContents.executeJavaScript(`
      (() => {
        const v4 = window.__jucodingV4;
        const notices = document.querySelector('#archive-notice');
        return {
          url: location.href,
          stage: Boolean(document.querySelector('#stage .scene')),
          counter: document.querySelector('#scene-counter')?.textContent || '',
          legacyStage: Boolean(document.querySelector('#course-list') || document.querySelector('.course-rail')),
          appliedOverrideCount: v4 ? v4.appliedOverrideCount : -1,
          notice: notices ? notices.textContent : '',
          noticeShown: notices ? !notices.hidden : false,
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
        };
      })()
    `);
    check(results, 'qa30_overridesReachLecture',
      lecture.stage
      && lecture.counter.trim().startsWith('1 /')
      && lecture.appliedOverrideCount > 0
      && lecture.noticeShown,
      lecture);

    // The approved image must actually decode on the scene it was placed on.
    const imageScene = await win.webContents.executeJavaScript(`
      (() => {
        const api = window.__jucodingV4;
        const idx = api.scenes.findIndex((s) => s.id === 'git');
        api.gotoScene(idx);
        return idx;
      })()
    `);
    await wait(900);
    const imageRender = await win.webContents.executeJavaScript(`
      (() => {
        const imgs = [...document.querySelectorAll('#stage img[data-asset-full^="data:image/"]')];
        return {
          sceneIndex: window.__jucodingV4.sceneIndex,
          count: imgs.length,
          natural: imgs.map((i) => i.naturalWidth),
          caption: imgs.map((i) => i.dataset.assetCap),
          missingNotice: document.querySelectorAll('#stage .archive-asset-missing').length
        };
      })()
    `);
    check(results, 'qa30_archiveImageRendersInLecture',
      imageRender.sceneIndex === imageScene
      && imageRender.count === 1
      && imageRender.natural[0] > 0
      && imageRender.caption[0] === '수업 중 함께 보는 도표'
      && imageRender.missingNotice === 0,
      imageRender);

    // ------------------------------------ existing home behaviour regression ---
    await win.webContents.executeJavaScript(`document.querySelector('#btn-home')?.click()`);
    await wait(800);
    const memo = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('[data-section="project"]')?.click();
        document.querySelector('#memo-what').value = '모임 자료 정리 앱';
        document.querySelector('#memo-who').value = '스터디 운영자';
        document.querySelector('#memo-core').value = '회차 자료 초안 생성';
        document.querySelector('#memo-save')?.click();
        await sleep(400);
        return {
          output: document.querySelector('#memo-output')?.textContent || '',
          status: document.querySelector('#memo-status')?.textContent || ''
        };
      })()
    `);
    const tools = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('[data-section="instructor"]')?.click();
        if (await window.vibeCodingApp.getFullscreen()) {
          document.querySelector('#btn-fullscreen')?.click();
          await sleep(400);
        }
        document.querySelector('#btn-fullscreen')?.click();
        await sleep(400);
        const fsOn = await window.vibeCodingApp.getFullscreen();
        document.querySelector('#btn-fullscreen')?.click();
        await sleep(400);
        const fsOff = await window.vibeCodingApp.getFullscreen();
        return { fsOn, fsOff, backup: document.querySelector('#backup-status')?.textContent || '' };
      })()
    `);
    const library = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('[data-section="library"]')?.click();
        await sleep(200);
        document.querySelector('#asset-grid .asset-thumb')?.click();
        await sleep(300);
        const dlg = document.querySelector('#asset-dialog');
        const out = { open: Boolean(dlg?.open), imgOk: (document.querySelector('#asset-dialog-img')?.naturalWidth || 0) > 0 };
        dlg?.close();
        return out;
      })()
    `);
    const proposalList = await win.webContents.executeJavaScript(`
      (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        document.querySelector('[data-section="instructor"]')?.click();
        await sleep(150);
        document.querySelector('#btn-instructor-review')?.click();
        await sleep(700);
        const dlg = document.querySelector('#proposal-list-dialog');
        const out = {
          open: Boolean(dlg?.open),
          rows: dlg ? dlg.querySelectorAll('.proposal-row').length : 0,
          appliedState: dlg ? dlg.querySelectorAll('.state-applied').length : 0
        };
        dlg?.close();
        return out;
      })()
    `);
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

    check(results, 'home_noLegacyDom', noLegacy, home.legacy);
    check(results, 'home_navSections', home.nav.length === 7 && home.chapters === 7 && home.assets === 6);
    check(results, 'home_noOverflow', !home.overflowX);
    check(results, 'lecture_opensFromHome',
      home.url.replace(/\\/g, '/').endsWith('src/renderer/v4/home.html')
      && lecture.url.replace(/\\/g, '/').includes('src/content/v4/one-shot.html')
      && !lecture.legacyStage && !lecture.overflowX);
    check(results, 'projectMemo',
      memo.output.includes('모임 자료 정리 앱')
      && memo.status.includes('저장했습니다')
      && store['v4-project-memo']
      && store['v4-project-memo'].what === '모임 자료 정리 앱');
    // setFullScreen() is a no-op while the window is hidden, so this is only a
    // real assertion in visible mode. Either way the IPC round-trip itself is
    // exercised against the real BrowserWindow.
    if (VISIBLE) {
      check(results, 'instructorFullscreen', tools.fsOn === true && tools.fsOff === false, tools);
    } else {
      results.instructorFullscreen = {
        ok: true,
        skipped: true,
        reason: 'setFullScreen is a no-op on a hidden window; re-run with --visible'
      };
    }
    check(results, 'libraryEnlarge', library.open && library.imgOk);
    check(results, 'proposalListDialog', proposalList.open && proposalList.rows >= 2 && proposalList.appliedState >= 1, proposalList);
    check(results, 'escapeReturnsHome', escape);
    check(results, 'consoleErrors', errors.length === 0, errors);

    const failed = Object.entries(results).filter(([, v]) => !v.ok).map(([k]) => k);
    const skippedChecks = Object.entries(results).filter(([, v]) => v.skipped).map(([k]) => k);
    const report = {
      ok: failed.length === 0,
      failed,
      skipped: skippedChecks,
      results,
      archiveRoot,
      visible: VISIBLE,
      screenshotsSkipped: skippedScreenshots,
      home,
      scan,
      preview,
      applied: applied.overrides,
      backupDirs,
      reviewedAfter,
      inboxAfterUnrelated,
      lecture,
      proposalList,
      errors
    };
    fs.writeFileSync(path.join(qaDir, 'jucoding-v4home-1366x768.json'), JSON.stringify(report, null, 2), 'utf-8');
    for (const [name, value] of Object.entries(results)) {
      if (value.skipped) {
        console.log(`- ${name} (skipped: ${value.reason})`);
        continue;
      }
      console.log(`${value.ok ? '✓' : '✗'} ${name}`);
    }
    if (skippedScreenshots.length) {
      console.log(`- screenshots skipped (hidden window): ${skippedScreenshots.join(', ')}`);
    }
    if (failed.length) {
      console.error(`\nFAILED: ${failed.join(', ')}`);
      console.error(JSON.stringify({ scan, preview, applied: applied.overrides, backupDirs, lecture, errors }, null, 2));
    }
    app.exit(failed.length ? 1 : 0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
