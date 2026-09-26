'use strict';

// JuCoding V4 — JuCoding Archive / Material Inbox (main process).
//
// Owns the external, user-visible folder tree and every read/write against it:
//
//   Documents/JuCoding/Archive/
//     inbox/     ← the user drops material here
//     reviewed/  ← material that was scanned but not applied
//     applied/   ← material that was applied, plus an apply manifest
//     backup/    ← YYYY-MM-DD-HHmm/ snapshot taken before every apply
//
// Hard rules enforced here:
//   * Nothing in the installed app (asar) is ever written. Lecture changes are
//     stored as an override file in userData and merged at render time.
//   * Applying always writes a backup first.
//   * No API key and no network. Analysis goes through
//     LectureOrganizerProvider (see v4-organizer.js).
//   * The app works fully offline; the only outbound capability is
//     shell.openPath, used to reveal the inbox in Explorer.

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { app, shell } = require('electron');
const organizer = require('./v4-organizer');

const SUBFOLDERS = ['inbox', 'reviewed', 'applied', 'backup'];

const SUPPORTED_TEXT = ['.md', '.txt', '.json'];
const SUPPORTED_IMAGE = ['.png', '.jpg', '.jpeg', '.webp'];
const SUPPORTED = [...SUPPORTED_TEXT, ...SUPPORTED_IMAGE];

// Listed so the instructor understands why a file is ignored. V1 ships no PDF
// text extraction; adding it later must not change the rest of the structure.
const PLANNED = [{ ext: '.pdf', label: 'PDF 지원 예정' }];

const MAX_TEXT_BYTES = 512 * 1024;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

const MAX_INLINE_BYTES = 8 * 1024 * 1024;
const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

// Documents/JuCoding/Archive by default. JUCODING_ARCHIVE_ROOT exists so QA can
// run against a temp directory instead of the real user profile.
function archiveRoot() {
  const override = process.env.JUCODING_ARCHIVE_ROOT;
  if (override && override.trim()) return path.resolve(override.trim());
  return path.join(app.getPath('documents'), 'JuCoding', 'Archive');
}

function folderPath(name) {
  return path.join(archiveRoot(), name);
}

function userDataFile(name) {
  return path.join(app.getPath('userData'), name);
}

function proposalsDir() {
  return path.join(app.getPath('userData'), 'jucoding-v4-proposals');
}

function overridesFile() {
  return userDataFile('jucoding-v4-lecture-overrides.json');
}

async function ensureArchive() {
  const root = archiveRoot();
  await fsp.mkdir(root, { recursive: true });
  for (const name of SUBFOLDERS) {
    await fsp.mkdir(path.join(root, name), { recursive: true });
  }
  return root;
}

function stamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Lecture overrides (the only mutable lecture state)
// ---------------------------------------------------------------------------

const EMPTY_OVERRIDES = {
  version: 1,
  updatedAt: '',
  appliedProposalId: '',
  scenes: {},
  assets: {},
  newScenes: []
};

async function readOverrides() {
  try {
    const raw = await fsp.readFile(overridesFile(), 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY_OVERRIDES };
    return {
      ...EMPTY_OVERRIDES,
      ...parsed,
      scenes: parsed.scenes && typeof parsed.scenes === 'object' ? parsed.scenes : {},
      assets: parsed.assets && typeof parsed.assets === 'object' ? parsed.assets : {},
      newScenes: Array.isArray(parsed.newScenes) ? parsed.newScenes : []
    };
  } catch {
    return { ...EMPTY_OVERRIDES };
  }
}

async function writeOverrides(next) {
  const target = overridesFile();
  await fsp.mkdir(path.dirname(target), { recursive: true });
  const payload = { ...next, version: 1, updatedAt: new Date().toISOString() };
  await fsp.writeFile(target, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

function classify(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (SUPPORTED_TEXT.includes(ext)) return { kind: 'text', supported: true };
  if (SUPPORTED_IMAGE.includes(ext)) return { kind: 'image', supported: true };
  const planned = PLANNED.find((p) => p.ext === ext);
  if (planned) return { kind: 'planned', supported: false, reason: planned.label };
  return { kind: 'unknown', supported: false, reason: '지원하지 않는 형식' };
}

async function scanInbox() {
  await ensureArchive();
  const inbox = folderPath('inbox');
  const entries = await fsp.readdir(inbox, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;
    const full = path.join(inbox, entry.name);
    const info = classify(entry.name);
    let size = 0;
    let modifiedAt = '';
    try {
      const stat = await fsp.stat(full);
      size = stat.size;
      modifiedAt = stat.mtime.toISOString();
    } catch { /* unreadable entry is still listed, just without metadata */ }
    if (info.kind === 'text' && size > MAX_TEXT_BYTES) {
      files.push({ name: entry.name, ext: path.extname(entry.name).toLowerCase(), size, modifiedAt, kind: 'text', supported: false, reason: '파일이 너무 큽니다 (최대 512KB)' });
      continue;
    }
    if (info.kind === 'image' && size > MAX_IMAGE_BYTES) {
      files.push({ name: entry.name, ext: path.extname(entry.name).toLowerCase(), size, modifiedAt, kind: 'image', supported: false, reason: '이미지가 너무 큽니다 (최대 12MB)' });
      continue;
    }
    files.push({
      name: entry.name,
      ext: path.extname(entry.name).toLowerCase(),
      size,
      modifiedAt,
      kind: info.kind,
      supported: info.supported,
      ...(info.reason ? { reason: info.reason } : {})
    });
  }
  files.sort((a, b) => (b.modifiedAt || '').localeCompare(a.modifiedAt || '') || a.name.localeCompare(b.name));
  return {
    files,
    newCount: files.filter((f) => f.supported).length,
    ignoredCount: files.filter((f) => !f.supported).length
  };
}

async function readMaterial(name) {
  const inbox = folderPath('inbox');
  const safe = path.basename(String(name || ''));
  const full = path.join(inbox, safe);
  if (!full.startsWith(inbox + path.sep)) throw new Error('잘못된 자료 경로입니다.');
  const info = classify(safe);
  if (!info.supported) {
    const err = new Error(`${safe}은(는) ${info.reason || '지원하지 않는 형식'}입니다.`);
    err.code = 'UNSUPPORTED';
    throw err;
  }
  const buffer = await fsp.readFile(full);
  const material = {
    name: safe,
    ext: path.extname(safe).toLowerCase(),
    kind: info.kind,
    bytes: buffer.length,
    // Path relative to the archive root, used to build jucoding-archive:// URLs.
    archivePath: `inbox/${safe}`
  };
  if (info.kind === 'text') {
    material.text = buffer.toString('utf-8');
  } else {
    material.mime = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp'
    }[material.ext] || 'application/octet-stream';
  }
  return material;
}

// ---------------------------------------------------------------------------
// Proposals
// ---------------------------------------------------------------------------

async function currentScenes() {
  const contentDir = path.join(__dirname, '..', 'content', 'v4', 'scenes');
  const curriculumFile = path.join(__dirname, '..', 'content', 'v4', 'curriculum.json');
  const curriculum = JSON.parse(await fsp.readFile(curriculumFile, 'utf-8'));
  const scenes = [];
  for (const entry of curriculum.scenes) {
    scenes.push(JSON.parse(await fsp.readFile(path.join(contentDir, entry.file), 'utf-8')));
  }
  return scenes;
}

async function chapterList() {
  const curriculumFile = path.join(__dirname, '..', 'content', 'v4', 'curriculum.json');
  const curriculum = JSON.parse(await fsp.readFile(curriculumFile, 'utf-8'));
  return Array.isArray(curriculum.chapters) ? curriculum.chapters : [];
}

// Archive-created scenes have no chapter of their own, so they land at the end
// of the lecture rather than at the front.
async function defaultChapterId() {
  const chapters = await chapterList();
  return chapters.length ? chapters[chapters.length - 1].id : 'auto';
}

async function propose(fileNames) {
  await ensureArchive();
  const wanted = Array.isArray(fileNames) && fileNames.length ? fileNames : null;
  const scan = await scanInbox();
  const targets = scan.files.filter((f) => f.supported && (!wanted || wanted.includes(f.name)));
  if (!targets.length) {
    return { ok: false, message: '변경안을 만들 자료가 없습니다. inbox에 자료를 넣어주세요.' };
  }

  const materials = [];
  const skipped = [];
  for (const file of targets) {
    try {
      materials.push(await readMaterial(file.name));
    } catch (err) {
      skipped.push({ name: file.name, reason: err.message });
    }
  }
  if (!materials.length) {
    return { ok: false, message: '읽을 수 있는 자료가 없습니다.', skipped };
  }

  // The review screen previews each image by pulling it on demand through
  // archive:asset-data, so a 16-image set does not become a ~31MB proposal.

  const scenes = await currentScenes();
  const provider = organizer.activeProvider();
  if (!provider) {
    return { ok: false, message: '변경안을 만들 수 없습니다. LectureOrganizerProvider를 등록해 주세요.' };
  }

  const chapterById = new Map((await chapterList()).map((c) => [c.id, c]));
  const sceneById = new Map(scenes.map((s) => [s.id, s]));
  const changes = await provider.propose({ materials, scenes });
  const proposal = {
    id: `p-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    provider: { id: provider.id, label: provider.label, kind: provider.kind },
    sourceFiles: materials.map((m) => ({ name: m.name, ext: m.ext, kind: m.kind, archivePath: m.archivePath, mime: m.mime || '' })),
    // An image proposal only guesses its target scene from the filename, so the
    // review UI needs the full list to let the instructor place it deliberately.
    sceneOptions: scenes.map((scene) => {
      const chapter = chapterById.get(scene.chapter);
      return {
        id: scene.id,
        title: scene.title,
        chapterLabel: chapter ? `${chapter.label} · ${chapter.title}` : ''
      };
    }),
    skipped,
    changes: changes.map((c) => {
      const scene = sceneById.get(c.sceneId);
      const chapter = chapterById.get(scene ? scene.chapter : '');
      return {
        id: c.id,
        sceneId: c.sceneId,
        // Resolved here so the review UI does not have to know the curriculum.
        sceneTitle: scene ? scene.title : c.sceneId,
        chapterLabel: chapter ? `${chapter.label} · ${chapter.title}` : '',
        action: c.action,
        field: c.field || (c.action === 'append' ? 'extra' : 'narration'),
        before: c.before || '',
        after: c.after || '',
        reason: c.reason || '',
        confidence: c.confidence || 'low',
        sourceName: c.sourceName || '',
        ...(c.assetPath ? { assetPath: c.assetPath } : {}),
        ...(c.mime ? { mime: c.mime } : {}),
        // A new_scene needs more than a sentence, so its presentation fields
        // travel with the change instead of being dropped.
        ...(c.action === 'new_scene'
          ? {
            ...(c.title ? { title: c.title } : {}),
            ...(c.chapter ? { chapter: c.chapter } : {}),
            ...(c.cue ? { cue: c.cue } : {}),
            ...(c.extra ? { extra: c.extra } : {}),
            ...(Array.isArray(c.blocks) ? { blocks: c.blocks } : {})
          }
          : {})
      };
    })
  };

  await fsp.mkdir(proposalsDir(), { recursive: true });
  await fsp.writeFile(path.join(proposalsDir(), `${proposal.id}.json`), JSON.stringify(proposal, null, 2), 'utf-8');
  return { ok: true, proposal, providerStatus: organizer.status() };
}

async function listProposals() {
  try {
    const names = (await fsp.readdir(proposalsDir())).filter((n) => n.endsWith('.json'));
    const out = [];
    for (const name of names) {
      try {
        const proposal = JSON.parse(await fsp.readFile(path.join(proposalsDir(), name), 'utf-8'));
        out.push({
          id: proposal.id,
          createdAt: proposal.createdAt,
          providerLabel: proposal.provider ? proposal.provider.label : '',
          sourceFiles: (proposal.sourceFiles || []).map((f) => f.name),
          changeCount: (proposal.changes || []).length,
          status: proposal.status || 'draft'
        });
      } catch { /* skip unreadable draft */ }
    }
    out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return out;
  } catch {
    return [];
  }
}

async function getProposal(id) {
  // Proposal ids are stored as "<id>.json". basename plus a character
  // whitelist means an id can never escape proposalsDir().
  const base = path.basename(String(id || '')).replace(/\.json$/i, '');
  if (!base || !/^[A-Za-z0-9._-]+$/.test(base)) return null;
  try {
    return JSON.parse(await fsp.readFile(path.join(proposalsDir(), `${base}.json`), 'utf-8'));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

async function uniquePath(dir, name) {
  let target = path.join(dir, name);
  if (!fs.existsSync(target)) return target;
  const ext = path.extname(name);
  const base = name.slice(0, name.length - ext.length);
  for (let i = 2; i < 500; i += 1) {
    target = path.join(dir, `${base}-${i}${ext}`);
    if (!fs.existsSync(target)) return target;
  }
  return path.join(dir, `${base}-${Date.now()}${ext}`);
}

async function backupBeforeApply(proposalId) {
  const root = await ensureArchive();
  const base = stamp();
  let dir = path.join(folderPath('backup'), base);
  let n = 2;
  while (fs.existsSync(dir)) {
    dir = path.join(folderPath('backup'), `${base}-${n}`);
    n += 1;
  }
  await fsp.mkdir(dir, { recursive: true });

  const current = await readOverrides();
  await fsp.writeFile(path.join(dir, 'lecture-overrides.before.json'), JSON.stringify(current, null, 2), 'utf-8');

  // A content snapshot makes the backup meaningful even when nothing has been
  // applied yet: it records exactly which lecture text was in effect.
  const scenes = await currentScenes();
  const snapshot = {
    proposalId,
    createdAt: new Date().toISOString(),
    archiveRoot: root,
    overrides: current,
    scenes: scenes.map((s) => ({ id: s.id, title: s.title, narration: s.narration, cue: s.cue, extra: s.extra }))
  };
  await fsp.writeFile(path.join(dir, 'lecture-content.snapshot.json'), JSON.stringify(snapshot, null, 2), 'utf-8');
  await fsp.writeFile(
    path.join(dir, 'RESTORE.txt'),
    [
      `JuCoding 강의 변경 백업 — ${snapshot.createdAt}`,
      '',
      `변경안 ID : ${proposalId}`,
      `적용 시각 : ${snapshot.createdAt}`,
      '',
      'lecture-overrides.before.json 은 적용 직전의 강의 덮어쓰기 파일입니다.',
      '덮어쓰기 파일 위치는 자료실 > Archive 카드에서 확인할 수 있습니다.',
      '이 파일을 되돌리려면 같은 경로에 그대로 복사하면 됩니다.',
      ''
    ].join('\n'),
    'utf-8'
  );
  return dir;
}

async function applyProposal(proposalId, decisions) {
  const proposal = await getProposal(proposalId);
  if (!proposal) return { ok: false, message: '변경안을 찾을 수 없습니다. 다시 만들어 주세요.' };
  if (proposal.status === 'applied') return { ok: false, message: '이미 적용된 변경안입니다.' };

  const decisionById = new Map((decisions || []).map((d) => [d.id, d]));
  const approved = [];
  const rejected = [];
  for (const change of proposal.changes || []) {
    const decision = decisionById.get(change.id);
    if (decision && decision.decision === 'apply') {
      // `after` may have been hand-edited in the preview, so the applied value
      // is always the reviewed one — never the raw suggestion. An asset also
      // carries the scene the instructor picked, which overrides the guess.
      const picked = typeof decision.sceneId === 'string' && decision.sceneId
        ? decision.sceneId
        : change.sceneId;
      approved.push({
        ...change,
        sceneId: picked,
        after: typeof decision.after === 'string' && decision.after.trim() ? decision.after : change.after,
        ...(typeof decision.title === 'string' && decision.title.trim() ? { title: decision.title.trim() } : {}),
        ...(typeof decision.caption === 'string' && decision.caption.trim() ? { caption: decision.caption.trim() } : {})
      });
    } else {
      rejected.push(change.id);
    }
  }

  if (!approved.length) {
    return { ok: true, applied: 0, rejected: rejected.length, backupDir: '', message: '승인된 변경이 없어 강의가 그대로 유지됩니다.' };
  }

  // A scene carries one archive figure, so two approved images aimed at the same
  // scene would silently overwrite each other. With a large image set the
  // filename guess collapses many files onto one scene, so this is the normal
  // case, not an edge case. Refuse loudly instead of losing material.
  const assetTargets = new Map();
  for (const change of approved) {
    if (change.action !== 'asset') continue;
    if (!assetTargets.has(change.sceneId)) assetTargets.set(change.sceneId, []);
    assetTargets.get(change.sceneId).push(change.after || change.sourceName || '이미지');
  }
  const collisions = [...assetTargets.entries()].filter(([, files]) => files.length > 1);
  if (collisions.length) {
    const detail = collisions
      .map(([sceneId, files]) => `${sceneId}: ${files.join(', ')}`)
      .join(' | ');
    return {
      ok: false,
      message: `한 장면에는 이미지 1장만 붙일 수 있습니다. 같은 장면을 고른 이미지가 ${collisions.length}건 있습니다 — 장면을 나눠서 선택하거나 일부를 유지로 바꿔주세요. (${detail})`,
      conflicts: collisions.map(([sceneId, files]) => ({ sceneId, files }))
    };
  }

  const backupDir = await backupBeforeApply(proposal.id);
  const overrides = await readOverrides();

  // 1) File the source material away first, so approved asset paths can be
  //    rewritten to where the file actually ended up. A path recorded before
  //    the move would point at inbox/ and 404.
  const approvedSourceNames = new Set(approved.map((c) => c.sourceName).filter(Boolean));
  const inbox = folderPath('inbox');
  const moved = [];
  const newPathByName = new Map();
  for (const file of proposal.sourceFiles || []) {
    const from = path.join(inbox, path.basename(file.name));
    if (!fs.existsSync(from)) continue;
    const wasApplied = approvedSourceNames.has(file.name);
    const destDir = wasApplied ? folderPath('applied') : folderPath('reviewed');
    const to = await uniquePath(destDir, path.basename(file.name));
    try {
      await fsp.rename(from, to);
    } catch {
      await fsp.copyFile(from, to);
      await fsp.unlink(from).catch(() => {});
    }
    const relative = path.relative(archiveRoot(), to).replace(/\\/g, '/');
    newPathByName.set(file.name, relative);
    moved.push({ name: file.name, to: relative, applied: wasApplied });
  }

  // 2) Build the new override state.
  const knownChapters = new Set((await chapterList()).map((c) => c.id));
  const fallbackChapter = await defaultChapterId();
  const touchedScenes = new Set();
  for (const change of approved) {
    if (change.action === 'new_scene') {
      const requested = String(change.chapter || '');
      const scene = {
        id: change.sceneId,
        // Never store a chapter id the curriculum does not have: the renderer
        // would silently file the scene under chapter 01.
        chapter: knownChapters.has(requested) ? requested : fallbackChapter,
        title: change.title || change.after,
        narration: change.after,
        cue: change.cue || change.after,
        extra: change.extra || `자료함에서 추가된 장면 · ${change.sourceName || ''}`.trim(),
        origin: 'archive',
        ...(Array.isArray(change.blocks) ? { blocks: change.blocks } : {})
      };
      overrides.newScenes = overrides.newScenes.filter((s) => s.id !== scene.id);
      overrides.newScenes.push(scene);
      continue;
    }
    if (change.action === 'asset') {
      const relative = newPathByName.get(change.sourceName) || change.assetPath;
      overrides.assets[change.sceneId] = {
        archivePath: relative,
        title: change.title || change.after,
        caption: change.caption || `자료함 자료 · ${change.after}`
      };
      touchedScenes.add(change.sceneId);
      continue;
    }
    const field = change.field === 'extra' ? 'extra' : 'narration';
    const existing = overrides.scenes[change.sceneId] || {};
    const sceneOverride = { ...existing };
    if (change.action === 'append') {
      const base = sceneOverride[field] || existing.narration || '';
      sceneOverride[field] = base ? `${base}\n${change.after}` : change.after;
    } else {
      sceneOverride[field] = change.after;
    }
    overrides.scenes[change.sceneId] = sceneOverride;
    touchedScenes.add(change.sceneId);
  }

  overrides.appliedProposalId = proposal.id;
  await writeOverrides(overrides);

  const manifest = {
    proposalId: proposal.id,
    appliedAt: new Date().toISOString(),
    provider: proposal.provider,
    sourceFiles: (proposal.sourceFiles || []).map((f) => f.name),
    approvedChanges: approved.map((c) => ({ sceneId: c.sceneId, action: c.action, field: c.field, after: c.after })),
    rejectedChanges: rejected,
    moved,
    backup: path.basename(backupDir),
    overridesFile: overridesFile()
  };
  await fsp.writeFile(
    path.join(folderPath('applied'), `apply-${stamp()}-${proposal.id}.json`),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  proposal.status = 'applied';
  proposal.appliedAt = manifest.appliedAt;
  proposal.approved = approved.map((c) => c.id);
  proposal.rejected = rejected;
  await fsp.writeFile(path.join(proposalsDir(), `${proposal.id}.json`), JSON.stringify(proposal, null, 2), 'utf-8');

  return {
    ok: true,
    applied: approved.length,
    rejected: rejected.length,
    scenes: [...touchedScenes],
    backupDir,
    moved,
    overridesFile: overridesFile(),
    message: `${approved.length}개 변경을 적용했습니다.`
  };
}

// ---------------------------------------------------------------------------
// Status / shell integration / archive:// protocol
// ---------------------------------------------------------------------------

async function status() {
  const root = archiveRoot();
  const exists = fs.existsSync(root);
  const scan = exists ? await scanInbox() : { files: [], newCount: 0, ignoredCount: 0 };
  const overrides = await readOverrides();
  return {
    root,
    subfolders: SUBFOLDERS,
    folderPaths: Object.fromEntries(SUBFOLDERS.map((n) => [n, folderPath(n)])),
    exists,
    inboxPath: folderPath('inbox'),
    newCount: scan.newCount,
    ignoredCount: scan.ignoredCount,
    files: scan.files,
    supportedExtensions: SUPPORTED,
    plannedExtensions: PLANNED,
    overridesFile: overridesFile(),
    appliedSceneCount: Object.keys(overrides.scenes).length,
    appliedAssetCount: Object.keys(overrides.assets).length,
    newSceneCount: overrides.newScenes.length,
    lastAppliedAt: overrides.updatedAt || '',
    providerStatus: organizer.status()
  };
}

async function openFolder(which) {
  await ensureArchive();
  const name = SUBFOLDERS.includes(which) ? which : 'inbox';
  const target = folderPath(name);
  const err = await shell.openPath(target);
  if (err) throw new Error(`폴더를 열지 못했습니다: ${err}`);
  return { ok: true, opened: target };
}

// Approved images live in the user's Documents folder, which the sandboxed
// renderer cannot read, so they are handed over as data: URLs. The deck's CSP
// already allows data: in img-src, so this needs no custom scheme and gives the
// renderer no filesystem access.
//
// They are resolved ONE AT A TIME, on demand, not bundled with the overrides.
// A 16-image set of 1254x1254 PNGs is ~23MB on disk and ~31MB as base64, so
// inlining everything meant every lecture page load pulled 31MB over IPC before
// showing a single picture.
async function assetDataUrl(archivePath) {
  if (!archivePath) return null;
  try {
    const root = archiveRoot();
    const target = path.resolve(root, archivePath);
    if (target !== root && !target.startsWith(root + path.sep)) return null;
    const stat = await fsp.stat(target);
    if (!stat.isFile()) return null;
    const mime = MIME_BY_EXT[path.extname(target).toLowerCase()];
    if (!mime) return null;
    if (stat.size > MAX_INLINE_BYTES) return null;
    return `data:${mime};base64,${(await fsp.readFile(target)).toString('base64')}`;
  } catch {
    return null;
  }
}

module.exports = {
  SUBFOLDERS,
  SUPPORTED,
  PLANNED,
  archiveRoot,
  folderPath,
  ensureArchive,
  status,
  openFolder,
  scanInbox,
  readMaterial,
  propose,
  listProposals,
  getProposal,
  applyProposal,
  readOverrides,
  writeOverrides,
  currentScenes,
  assetDataUrl
};
