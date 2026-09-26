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
    path.join(root, 'src', 'preload', 'preload.js'),
    path.join(root, 'src', 'renderer', 'v4', 'home.js'),
    path.join(root, 'src', 'content', 'v4', 'one-shot.js'),
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

  const required = ['src/main/v4-main.js', 'src/renderer/v4', 'src/content/v4', 'src/assets'];
  const missing = required.filter((pattern) => !blob.includes(pattern));
  if (missing.length) fail(`build.files에 V4 필수 경로 누락: ${missing.join(', ')}`);
  else pass('build.files covers V4 runtime paths');
}

checkJavaScript();
checkNoLegacyInjection();
checkVisualAssets();
checkOffline();
checkHomeNav();
checkPackaging();

if (failures) {
  console.error(`V4 check FAILED (${failures} items).`);
  process.exit(1);
}
console.log('V4 project check passed.');
