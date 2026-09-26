'use strict';

// JuCoding V4 default-release check. Covers only the V4 runtime that ships
// in the installer. Legacy V3 validation lives in scripts/check.js
// (npm run check:legacy) for archive/reference purposes.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`✗ ${message}`);
}

function pass(message) {
  console.log(`✓ ${message}`);
}

function runNodeCheck(file) {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf-8' });
  if (result.status !== 0) {
    fail(`JS 문법 체크 실패: ${path.relative(root, file)}\n${result.stderr || result.stdout}`);
  }
}

function checkJavaScript() {
  const files = [
    path.join(root, 'src', 'main', 'v4-main.js'),
    path.join(root, 'src', 'main', 'v4-archive.js'),
    path.join(root, 'src', 'main', 'v4-organizer.js'),
    path.join(root, 'src', 'preload', 'preload.js'),
    path.join(root, 'src', 'renderer', 'v4', 'home.js'),
    path.join(root, 'src', 'content', 'v4', 'one-shot.js'),
    path.join(root, 'src', 'content', 'v4', 'simulation-engine.js'),
    path.join(root, 'src', 'content', 'v4', 'generated', 'content-registry.js'),
    path.join(root, 'scripts', 'build-v4-content.js'),
    path.join(root, 'scripts', 'check-v4.js'),
    path.join(root, 'scripts', 'smoke-v4-lecture.js'),
    path.join(root, 'scripts', 'smoke-v4-shell.js'),
  ];
  const missing = files.filter((file) => !fs.existsSync(file));
  if (missing.length) {
    fail(`V4 런타임 파일 누락:\n${missing.join('\n')}`);
    return;
  }
  files.forEach(runNodeCheck);
  pass(`V4 JS syntax ok (${files.length} files)`);
}

// The lecture must never hard-code teaching copy again: that is what makes
// material-driven updates possible at all.
function checkContentSeparation() {
  const registry = require(path.join(root, 'src', 'content', 'v4', 'generated', 'content-registry.js'));
  const data = global.JUCODING_V4_CONTENT;
  if (!data) {
    fail('content-registry.js 가 JUCODING_V4_CONTENT 를 노출하지 않음');
    return;
  }
  if (!Array.isArray(data.scenes) || data.scenes.length !== 21) {
    fail(`lecture 장면 수는 21이어야 합니다: ${Array.isArray(data.scenes) ? data.scenes.length : 'n/a'}`);
  } else {
    pass('curriculum keeps the 21-scene lecture');
  }

  const lecture = fs.readFileSync(path.join(root, 'src', 'content', 'v4', 'one-shot.js'), 'utf-8');
  const sceneBlock = lecture.slice(lecture.indexOf('const SCENE_RENDERERS'), lecture.indexOf('// Data order wins'));
  if (!sceneBlock) {
    fail('one-shot.js 에서 SCENE_RENDERERS 를 찾을 수 없음');
    return;
  }
  const leaked = ['cue:', 'extra:', 'chapter:', 'title:'].filter((key) => sceneBlock.includes(key));
  if (leaked.length) {
    fail(`렌더러에 강의 데이터가 남아 있습니다: ${leaked.join(', ')} (scenes/*.json 으로 이동해야 합니다)`);
  } else {
    pass('renderers contain no teaching copy (content lives in scenes/*.json)');
  }

  // Every scene id in the data must have a renderer, or it renders blank.
  // Scoped to the renderer map so later objects in the file are not mistaken
  // for scene entries.
  const ids = [...sceneBlock.matchAll(/^\s{4}'?([a-z0-9-]+)'?:\s*\(\)\s*=>/gim)].map((m) => m[1]);
  const known = new Set(data.scenes.map((s) => s.id));
  const orphans = ids.filter((id) => !known.has(id));
  const missingRenderers = data.scenes.filter((s) => !ids.includes(s.id)).map((s) => s.id);
  if (orphans.length || missingRenderers.length) {
    fail(`renderer와 데이터 불일치 — 없는 scene: ${orphans.join(', ') || 'none'} / renderer 없는 scene: ${missingRenderers.join(', ') || 'none'}`);
  } else {
    pass(`every scene has exactly one renderer (${ids.length})`);
  }
  void registry;
}

function checkSimulations() {
  const dir = path.join(root, 'src', 'content', 'v4', 'simulations');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : [];
  if (files.length < 6) {
    fail(`시뮬레이션 정의 부족: ${files.length}개 (최소 6개 필요)`);
    return;
  }
  const ids = new Set();
  for (const name of files) {
    const sim = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf-8'));
    ids.add(sim.id);
  }
  const required = ['chat-agent', 'ai-agent', 'frontend-api-backend', 'chatgpt-vs-computer-agent', 'mcp-worker', 'sns-automation', 'safety-boundary'];
  const missing = required.filter((id) => !ids.has(id));
  if (missing.length) fail(`필수 시뮬레이션 누락: ${missing.join(', ')}`);
  else pass(`all required simulations present (${required.length}/${required.length}, ${files.length} files)`);

  // The engine must be a shared state machine, not per-scene timing code.
  const lecture = fs.readFileSync(path.join(root, 'src', 'content', 'v4', 'one-shot.js'), 'utf-8');
  const engine = fs.readFileSync(path.join(root, 'src', 'content', 'v4', 'simulation-engine.js'), 'utf-8');
  const sceneBlock = lecture.slice(lecture.indexOf('const SCENE_RENDERERS'), lecture.indexOf('// Data order wins'));
  // Scene timing must come from step data, not from code. Timers elsewhere in
  // the lecture (the resize debounce) are legitimate.
  //
  // String literals are blanked first: a slide is allowed to show students a
  // timer API in a code sample - that is the lesson, not a scheduling call -
  // and a bare substring test cannot tell the two apart.
  const codeOnly = sceneBlock
    .replace(/`(?:[^`\\]|\\.)*`/g, '``')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  if (/setTimeout\s*\(|setInterval\s*\(/.test(codeOnly)) {
    fail('SCENE_RENDERERS 안에 타이머가 있습니다 — 시뮬레이션은 데이터 기반으로 실행되어야 합니다');
  } else if (!/requestAnimationFrame|setTimeout/.test(engine)) {
    fail('simulation engine 에 step 진행 타이머가 없습니다');
  } else {
    pass('no per-scene timing code; all step timing lives in the engine');
  }
  ['show', 'activate', 'connect', 'complete'].forEach((action) => {
    if (!engine.includes(action)) fail(`simulation engine 가 "${action}" 단계를 처리하지 않습니다`);
  });
  if (!/SPEEDS\s*=\s*\[0\.75,\s*1,\s*1\.5\]/.test(engine)) {
    fail('simulation engine 속도 값이 0.75 / 1 / 1.5 가 아닙니다');
  } else {
    pass('simulation engine covers show/activate/connect/complete and 0.75x/1x/1.5x');
  }

  const css = fs.readFileSync(path.join(root, 'src', 'content', 'v4', 'simulation.css'), 'utf-8');
  if (!/prefers-reduced-motion/.test(css)) fail('simulation.css 에 prefers-reduced-motion 처리가 없습니다');
  else pass('simulation.css honours prefers-reduced-motion');
}

function checkArchiveSurface() {
  const files = [
    'src/main/v4-archive.js',
    'src/main/v4-organizer.js',
  ];
  const missing = files.filter((rel) => !fs.existsSync(path.join(root, rel)));
  if (missing.length) {
    fail(`Archive 모듈 누락: ${missing.join(', ')}`);
    return;
  }

  const archive = fs.readFileSync(path.join(root, 'src', 'main', 'v4-archive.js'), 'utf-8');
  for (const sub of ['inbox', 'reviewed', 'applied', 'backup']) {
    if (!archive.includes(`'${sub}'`)) fail(`Archive 서브폴더 "${sub}" 정의 없음`);
  }
  // Required subfolder set.
  const declared = (archive.match(/const SUBFOLDERS = \[([^\]]*)\]/) || [])[1] || '';
  const subs = declared.split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean);
  const wantSubs = ['inbox', 'reviewed', 'applied', 'backup'];
  if (subs.join(',') !== wantSubs.join(',')) {
    fail(`Archive 폴더 구조가 다릅니다: ${subs.join(',') || 'none'} (기대: ${wantSubs.join(',')})`);
  } else {
    pass('Archive folder tree is inbox/reviewed/applied/backup');
  }

  if (!/app\.getPath\('documents'\)/.test(archive)) {
    fail('Archive 루트가 Documents 아래가 아닙니다');
  } else {
    pass('Archive root is Documents/JuCoding/Archive (outside the install)');
  }

  const formats = ["'.md'", "'.txt'", "'.json'", "'.png'", "'.jpg'", "'.jpeg'", "'.webp'"];
  const missingFormats = formats.filter((f) => !archive.includes(f));
  if (missingFormats.length) fail(`지원 형식 누락: ${missingFormats.join(', ')}`);
  else pass('V1 formats declared (.md .txt .json .png .jpg .jpeg .webp)');
  if (!/PDF 지원 예정/.test(archive)) fail('.pdf 가 "PDF 지원 예정" 으로 안내되지 않습니다');
  else pass('.pdf surfaced as "PDF 지원 예정" rather than silently ignored');

  // The write barrier: lecture overrides never touch the installed app.
  if (!/jucoding-v4-lecture-overrides\.json/.test(archive)) {
    fail('강의 덮어쓰기 파일 정의 없음');
  } else {
    pass('lecture changes are stored as a userData override, not in the install');
  }
  if (!/backup/.test(archive) || !/lecture-content\.snapshot\.json/.test(archive)) {
    fail('적용 직전 백업 스냅샷이 없습니다');
  } else {
    pass('apply writes a backup snapshot first');
  }
  // Auto-publish guard.
  if (/archive\/inbox[\s\S]{0,40}writeFileSync/.test(archive)) {
    fail('inbox 에 직접 쓰는 코드가 있습니다 — 분석은 읽기만 해야 합니다');
  } else {
    pass('scanning never writes to the inbox');
  }

  const organizer = fs.readFileSync(path.join(root, 'src', 'main', 'v4-organizer.js'), 'utf-8');
  if (!/LectureOrganizerProvider/.test(organizer)) fail('LectureOrganizerProvider 어댑터 정의 없음');
  else if (!/AI 정리는 연결되지 않았습니다\./.test(organizer)) fail('AI 미연결 안내 문구가 없습니다');
  else pass('LectureOrganizerProvider adapter present with a no-AI fallback message');
  // V4.1 must work with no key and no network. Comments may mention API keys;
  // what matters is that the module reads no credential and opens no socket.
  const readsCredential = /process\.env\.[A-Z0-9_]*(KEY|TOKEN|SECRET)/.test(organizer);
  const opensSocket = /\b(fetch|https?\.request|net\.request|axios|openai)\s*\(/.test(organizer);
  const pkgDeps = Object.keys(require(path.join(root, 'package.json')).dependencies || {});
  const aiDeps = pkgDeps.filter((d) => /openai|anthropic|langchain|ollama|gemini/i.test(d));
  if (readsCredential || opensSocket || aiDeps.length) {
    fail(`organizer 가 외부 AI 에 의존합니다 — readsCredential=${readsCredential} opensSocket=${opensSocket} deps=${aiDeps.join(',') || 'none'}`);
  } else {
    pass('organizer needs no API key, no network, and no AI dependency');
  }

  const preload = fs.readFileSync(path.join(root, 'src', 'preload', 'preload.js'), 'utf-8');
  const bridge = ['archiveStatus', 'openArchiveFolder', 'scanArchive', 'proposeFromArchive', 'applyProposal', 'getLectureOverrides']
    .filter((fn) => !preload.includes(fn));
  if (bridge.length) fail(`preload 브리지 누락: ${bridge.join(', ')}`);
  else pass('preload exposes the full Archive bridge');

  // The lecture must merge overrides, and must be able to run without the bridge.
  const lecture = fs.readFileSync(path.join(root, 'src', 'content', 'v4', 'one-shot.js'), 'utf-8');
  if (!/applyOverrides/.test(lecture) || !/getLectureOverrides/.test(lecture)) {
    fail('강의가 Archive 덮어쓰기를 반영하지 않습니다');
  } else {
    pass('lecture merges approved Archive overrides at render time');
  }
}

function checkNoLegacyInjection() {
  const removed = [
    'src/main/v4-bootstrap.js',
    'src/renderer/v4-entry.js',
    'src/renderer/jucoding-v4-shell.js',
    'src/renderer/jucoding-v4-theme.css',
  ];
  const stillThere = removed.filter((rel) => fs.existsSync(path.join(root, rel)));
  if (stillThere.length) fail(`제거되어야 할 주입 레이어가 남아 있음:\n${stillThere.join('\n')}`);
  else pass('legacy injection layer absent');

  const mainEntry = require(path.join(root, 'package.json')).main || '';
  if (mainEntry.replace(/\\/g, '/') !== 'src/main/v4-main.js') {
    fail(`package.json main이 V4 진입점이 아님: ${mainEntry}`);
  } else {
    pass('package.json main → src/main/v4-main.js');
  }

  const legacyMain = fs.readFileSync(path.join(root, 'src', 'main', 'v4-main.js'), 'utf-8');
  if (/require\(['"]\.\/main\.js['"]\)/.test(legacyMain)) {
    fail('v4-main.js가 legacy main.js를 require함');
  } else {
    pass('v4-main.js is independent of legacy main.js');
  }
}

function checkVisualAssets() {
  const expected = [
    'ai-agent-vibecoding.webp',
    'chat-ai-vs-computer-agent.webp',
    'beginner-dev-terms.webp',
    'project-planning-terms.webp',
    'automation-deploy-mcp.webp',
    'safety-boundary.webp',
  ];
  const dir = path.join(root, 'src', 'assets', 'lecture', 'v4');
  const missing = expected.filter((name) => !fs.existsSync(path.join(dir, name)));
  if (missing.length) fail(`시각 에셋 누락: ${missing.join(', ')}`);
  else pass(`six WEBP assets present (${expected.length}/6)`);

  const lectureJs = fs.readFileSync(path.join(root, 'src', 'content', 'v4', 'one-shot.js'), 'utf-8');
  const homeJs = fs.readFileSync(path.join(root, 'src', 'renderer', 'v4', 'home.js'), 'utf-8');
  const unreferenced = expected.filter((name) => !lectureJs.includes(name) && !homeJs.includes(name));
  if (unreferenced.length) fail(`사용되지 않는 에셋: ${unreferenced.join(', ')}`);
  else pass('all six assets referenced by V4 runtime');
}

function checkOffline() {
  const targets = [
    path.join(root, 'src', 'renderer', 'v4', 'home.html'),
    path.join(root, 'src', 'renderer', 'v4', 'home.js'),
    path.join(root, 'src', 'content', 'v4', 'one-shot.html'),
    path.join(root, 'src', 'content', 'v4', 'one-shot.js'),
  ];
  const offenders = [];
  for (const file of targets) {
    const raw = fs.readFileSync(file, 'utf-8');
    const hits = raw.match(/https?:\/\/[^\s"'<>]+/g) || [];
    const remote = hits.filter((url) => !url.startsWith('https://github.com/ju0o/Jucoding'));
    if (remote.length) offenders.push(`${path.basename(file)}: ${remote.join(', ')}`);
  }
  if (offenders.length) fail(`원격 의존성 발견:\n${offenders.join('\n')}`);
  else pass('V4 runtime has no remote image/script dependency');
}

function checkHomeNav() {
  const html = fs.readFileSync(path.join(root, 'src', 'renderer', 'v4', 'home.html'), 'utf-8');
  const required = ['home', 'lecture', 'practice', 'project', 'ai', 'library', 'instructor'];
  const missing = required.filter((name) => !html.includes(`data-section="${name}"`) || !html.includes(`id="sec-${name}"`));
  if (missing.length) fail(`홈 내비게이션 누락: ${missing.join(', ')}`);
  else pass('V4 home nav covers 7 sections');
}

function checkPackaging() {
  const pkg = require(path.join(root, 'package.json'));
  const files = (pkg.build && pkg.build.files) || [];
  const blob = files.join('\n');
  const forbidden = ['src/**/*', 'src/content/sessions', 'src/content/tracks', 'src/content/v3'];
  const hits = forbidden.filter((pattern) => blob.includes(pattern));
  if (hits.length) fail(`build.files에 V3 포함 패턴 존재: ${hits.join(', ')}`);
  else pass('build.files excludes V3 content patterns');

  const required = ['src/main', 'src/preload', 'src/renderer/v4', 'src/content/v4', 'src/assets'];
  const missing = required.filter((pattern) => !blob.includes(pattern));
  if (missing.length) fail(`build.files에 V4 필수 경로 누락: ${missing.join(', ')}`);
  else pass('build.files covers V4 runtime paths');

  // electron-builder only ever copied src/main/v4-main.js, so the archive and
  // organizer modules were missing from the asar and the installed app could
  // not start. The globs must be directories, not single files.
  const singleFileMain = files.filter((f) => /^src\/main\/[^/*]+$/.test(f));
  if (singleFileMain.length) {
    fail(`build.files가 src/main 을 개별 파일로 지정 — 같은 폴더의 다른 모듈이 누락됩니다: ${singleFileMain.join(', ')}`);
  } else {
    pass('build.files includes whole src/main and src/preload directories');
  }

  const globish = (pattern) => {
    const abs = path.join(root, pattern);
    if (pattern.endsWith('/**/*')) {
      const base = abs.slice(0, -5);
      if (!fs.existsSync(base)) return [];
      const out = [];
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else out.push(full);
        }
      };
      walk(base);
      return out;
    }
    return fs.existsSync(abs) ? [abs] : [];
  };
  const shipped = files.flatMap(globish);

  // The new runtime files must actually be inside the packaged globs. A missing
  // entry here ships a build that fails at startup, which nothing else in this
  // repo can catch — the asar is only assembled by electron-builder.
  const mustShip = [
    'src/main/v4-main.js',
    'src/main/v4-archive.js',
    'src/main/v4-organizer.js',
    'src/preload/preload.js',
    'src/content/v4/one-shot.html',
    'src/content/v4/one-shot.js',
    'src/content/v4/simulation.css',
    'src/content/v4/simulation-engine.js',
    'src/content/v4/generated/content-registry.js',
    'src/content/v4/curriculum.json',
    'src/renderer/v4/home.html',
    'src/renderer/v4/home.js',
  ];
  const simulations = fs.existsSync(path.join(root, 'src/content/v4/simulations'))
    ? fs.readdirSync(path.join(root, 'src/content/v4/simulations')).filter((f) => f.endsWith('.json'))
    : [];
  const sceneFiles = fs.existsSync(path.join(root, 'src/content/v4/scenes'))
    ? fs.readdirSync(path.join(root, 'src/content/v4/scenes')).filter((f) => f.endsWith('.json'))
    : [];
  mustShip.push(...simulations.map((f) => `src/content/v4/simulations/${f}`));
  mustShip.push(...sceneFiles.map((f) => `src/content/v4/scenes/${f}`));

  const notInPackage = mustShip.filter((rel) => !shipped.includes(path.join(root, rel)));
  if (notInPackage.length) {
    fail(`패키징 globs가 다음을 포함하지 못함 (설치본이 시작하지 못합니다):\n${notInPackage.join('\n')}`);
  } else {
    pass(`packaged file set resolves (${shipped.length} files, ${simulations.length} simulations, ${sceneFiles.length} scene files)`);
  }

  // The negated patterns have to be applied, otherwise a whole-directory glob
  // quietly ships the legacy V3 entry point again.
  const excluded = new Set(
    files
      .filter((f) => f.startsWith('!'))
      .map((f) => path.join(root, f.slice(1).replace(/\/\*\*\/$/, '')))
  );
  const excludedFile = files
    .filter((f) => f.startsWith('!') && !f.endsWith('/**/*'))
    .map((f) => path.join(root, f.slice(1)));
  const actuallyShipped = shipped.filter((abs) => !excluded.has(abs) && !excludedFile.includes(abs));
  const v3Leaks = actuallyShipped.filter((abs) => /[\\/]src[\\/](main[\\/]main\.js|content[\\/]v3|content[\\/]sessions|content[\\/]tracks)[\\/]?/.test(abs)
    || abs.endsWith(path.join('src', 'content', 'v3'))
    || abs.endsWith(path.join('src', 'main', 'main.js')));
  if (v3Leaks.length) {
    fail(`V3 코드가 패키지에 포함됩니다:\n${v3Leaks.map((f) => path.relative(root, f)).join('\n')}`);
  } else {
    pass(`no V3 runtime code in the package (${actuallyShipped.length} files after exclusions)`);
  }
}

// The generated registry is committed, so it must match the JSON source of
// truth or the app would silently ship stale lecture content.
function checkContentBuild() {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-v4-content.js'), '--check'], {
    cwd: root,
    encoding: 'utf-8',
  });
  if (result.status !== 0) {
    fail(`콘텐츠 빌드 검증 실패:\n${result.stdout || ''}${result.stderr || ''}`);
  } else {
    pass((result.stdout || '').trim());
  }
}

checkJavaScript();
checkContentSeparation();
checkSimulations();
checkArchiveSurface();
checkNoLegacyInjection();
checkVisualAssets();
checkOffline();
checkHomeNav();
checkPackaging();
checkContentBuild();

if (failures) {
  console.error(`V4 check FAILED (${failures} items).`);
  process.exit(1);
}
console.log('V4 project check passed.');
