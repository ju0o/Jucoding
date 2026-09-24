'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, filter, out);
    else if (filter(fullPath)) out.push(fullPath);
  }
  return out;
}

function runNodeCheck(file) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf-8',
  });
  if (result.status !== 0) {
    throw new Error(`JS 문법 체크 실패: ${path.relative(root, file)}\n${result.stderr || result.stdout}`);
  }
}

function checkJavaScript() {
  const files = [
    ...walk(path.join(root, 'src', 'renderer'), (file) => file.endsWith('.js')),
    ...walk(path.join(root, 'src', 'content', 'v3'), (file) => file.endsWith('.js')),
    ...walk(path.join(root, 'src', 'content', 'v4'), (file) => file.endsWith('.js')),
    ...walk(path.join(root, 'src', 'content', 'sources'), (file) => file.endsWith('.js')),
    path.join(root, 'src', 'main', 'main.js'),
    path.join(root, 'src', 'main', 'v4-bootstrap.js'),
    path.join(root, 'src', 'preload', 'preload.js'),
    path.join(root, 'src', 'content', 'sessions', 'session-03-direction.bundle.js'),
    ...walk(path.join(root, 'scripts'), (file) => file.endsWith('.js')),
  ];
  files.forEach(runNodeCheck);
  console.log(`✓ JS syntax ok (${files.length} files)`);
}

function checkManifest() {
  const manifestPath = path.join(root, 'src', 'content', 'course-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const missing = [];

  for (const course of manifest.courses) {
    for (const session of course.sessions || []) {
      if (!session.file && session.planned) continue;
      if (!session.file) {
        missing.push(`${session.id || session.title}: file 속성 없음`);
        continue;
      }
      const target = path.join(root, 'src', 'content', session.file.split(/[?#]/)[0]);
      if (!fs.existsSync(target)) missing.push(session.file);
    }
  }

  for (const appendix of manifest.appendix || []) {
    const target = path.join(root, 'src', 'content', appendix.file.split(/[?#]/)[0]);
    if (!fs.existsSync(target)) missing.push(appendix.file);
  }

  for (const course of manifest.courses) {
    for (const audience of ['student', 'instructor']) {
      for (const material of course.materials?.[audience] || []) {
        const target = path.join(root, 'src', 'content', material.file.split(/[?#]/)[0]);
        if (!fs.existsSync(target)) missing.push(material.file);
      }
    }
  }

  if (missing.length) {
    throw new Error(`manifest에 연결된 파일이 없습니다:\n${missing.join('\n')}`);
  }

  console.log('✓ manifest parse ok; all content files exist');
}

function checkSlideCounters() {
  const sessionDir = path.join(root, 'src', 'content', 'sessions');
  const files = walk(sessionDir, (file) => file.endsWith('.html'));
  const mismatches = [];

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf-8');
    const slides = (raw.match(/<div class="slide/g) || []).length + (raw.match(/<section class="slide/g) || []).length;
    const counter = raw.match(/<span id="counter">1 \/ (\d+)<\/span>/);
    if (counter && Number(counter[1]) !== slides) {
      mismatches.push(`${path.basename(file)}: counter=${counter[1]}, slides=${slides}`);
    }
  }

  if (mismatches.length) {
    throw new Error(`슬라이드 카운터 불일치:\n${mismatches.join('\n')}`);
  }

  console.log(`✓ slide counters ok (${files.length} files)`);
}

try {
  checkJavaScript();
  checkManifest();
  checkSlideCounters();
  console.log('Project check passed.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
