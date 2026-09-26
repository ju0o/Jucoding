'use strict';

// JuCoding V4 content build.
//
// Source of truth (hand-edited, machine-readable):
//   src/content/v4/curriculum.json
//   src/content/v4/scenes/*.json
//   src/content/v4/simulations/*.json
//
// Output (generated, committed):
//   src/content/v4/generated/content-registry.js
//
// The lecture page is loaded over file:// with a restrictive CSP, where fetch()
// of local JSON is blocked by Chromium. The registry is a plain <script> that
// installs the same data on window, so the lecture keeps working offline,
// in the packaged app, and when opened directly from disk.
//
// Usage:
//   node scripts/build-v4-content.js           # write registry
//   node scripts/build-v4-content.js --check   # verify registry is in sync

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const contentDir = path.join(root, 'src', 'content', 'v4');
const scenesDir = path.join(contentDir, 'scenes');
const simsDir = path.join(contentDir, 'simulations');
const outFile = path.join(contentDir, 'generated', 'content-registry.js');

const VALID_ACTIONS = ['show', 'activate', 'connect', 'complete'];
const VALID_CONFIDENCE = ['high', 'medium', 'low'];

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function validateSimulation(sim, file) {
  const where = path.basename(file);
  if (sim.schema !== 'jucoding-simulation') fail(`${where}: schema must be "jucoding-simulation"`);
  if (!sim.id) fail(`${where}: missing id`);
  if (!sim.title) fail(`${where}: missing title`);
  if (!Array.isArray(sim.nodes) || !sim.nodes.length) fail(`${where}: needs a non-empty nodes[]`);
  if (!Array.isArray(sim.edges) || !sim.edges.length) fail(`${where}: needs a non-empty edges[]`);
  if (!Array.isArray(sim.steps) || !sim.steps.length) fail(`${where}: needs a non-empty steps[]`);

  const nodeIds = new Set((sim.nodes || []).map((n) => n.id));
  (sim.edges || []).forEach((edge, i) => {
    if (!nodeIds.has(edge.from)) fail(`${where}: edges[${i}].from "${edge.from}" is not a node`);
    if (!nodeIds.has(edge.to)) fail(`${where}: edges[${i}].to "${edge.to}" is not a node`);
  });
  (sim.steps || []).forEach((step, i) => {
    const at = `${where}: steps[${i}]`;
    if (!step.id) fail(`${at} missing id`);
    if (!VALID_ACTIONS.includes(step.action)) fail(`${at} action must be one of ${VALID_ACTIONS.join('|')}`);
    if (!nodeIds.has(step.target)) fail(`${at} target "${step.target}" is not a node`);
    if (!(Number(step.duration) > 0)) fail(`${at} needs a positive duration`);
    if (step.action === 'connect' && !step.from) {
      // `from` may be omitted: the engine then uses the most recent node.
      const hasDefault = (sim.steps || []).slice(0, i).some((s) => s.target === step.target);
      if (!hasDefault && i === 0) fail(`${at} connect step cannot be the first step without "from"`);
    }
  });
  if (!(sim.steps || []).some((s) => s.action === 'complete')) {
    fail(`${where}: needs at least one "complete" step so the run can finish`);
  }

  // Every declared connector must be reachable by some connect step, otherwise
  // it silently never draws and the diagram lies about the flow. `from` may be
  // omitted, in which case the engine falls back to the previously touched
  // node, so both forms have to be simulated here.
  const used = new Set();
  let last = null;
  for (const step of sim.steps) {
    if (step.action === 'connect') {
      const from = step.from || last;
      (sim.edges || []).forEach((edge) => {
        if (edge.from === from && edge.to === step.target) used.add(edge.id);
      });
    }
    if (step.target) last = step.target;
  }
  (sim.edges || []).forEach((edge) => {
    if (!used.has(edge.id)) {
      fail(`${where}: edge "${edge.id}" (${edge.from} → ${edge.to}) is never drawn by a connect step`);
    }
  });

  // Every node should also appear in the narration flow, or it is decoration.
  const touched = new Set((sim.steps || []).map((s) => s.target));
  (sim.nodes || []).forEach((node) => {
    if (!touched.has(node.id)) fail(`${where}: node "${node.id}" is never targeted by a step`);
  });
}

function loadCurriculum() {
  const curriculumFile = path.join(contentDir, 'curriculum.json');
  const curriculum = readJson(curriculumFile);
  if (curriculum.schema !== 'jucoding-curriculum') fail('curriculum.json: schema must be "jucoding-curriculum"');
  if (!Array.isArray(curriculum.chapters) || !curriculum.chapters.length) fail('curriculum.json: needs chapters[]');
  if (!Array.isArray(curriculum.scenes) || !curriculum.scenes.length) fail('curriculum.json: needs scenes[]');

  const chapterIds = new Set(curriculum.chapters.map((c) => c.id));
  const sceneIds = new Set();

  const scenes = curriculum.scenes.map((entry) => {
    if (sceneIds.has(entry.id)) fail(`curriculum.json: duplicate scene id "${entry.id}"`);
    sceneIds.add(entry.id);
    if (!chapterIds.has(entry.chapter)) fail(`curriculum.json: scene "${entry.id}" references unknown chapter "${entry.chapter}"`);
    const file = path.join(scenesDir, entry.file);
    if (!fs.existsSync(file)) {
      fail(`curriculum.json: scene "${entry.id}" file missing: scenes/${entry.file}`);
      return null;
    }
    const scene = readJson(file);
    if (scene.id !== entry.id) fail(`scenes/${entry.file}: id "${scene.id}" does not match curriculum "${entry.id}"`);
    ['title', 'narration', 'cue', 'extra'].forEach((key) => {
      if (typeof scene[key] !== 'string' || !scene[key].trim()) fail(`scenes/${entry.file}: missing text field "${key}"`);
    });
    return scene;
  }).filter(Boolean);

  if (!scenes.length) fail('curriculum.json produced no scenes');
  return { curriculum, scenes };
}

function loadSimulations(sceneRefs) {
  const files = fs.existsSync(simsDir)
    ? fs.readdirSync(simsDir).filter((f) => f.endsWith('.json')).sort()
    : [];
  if (!files.length) fail('src/content/v4/simulations/ has no *.json files');

  const simulations = {};
  files.forEach((name) => {
    const file = path.join(simsDir, name);
    const sim = readJson(file);
    validateSimulation(sim, file);
    if (simulations[sim.id]) fail(`duplicate simulation id "${sim.id}"`);
    simulations[sim.id] = sim;
  });

  // Every simulation a scene references must exist, and every simulation
  // must actually be reachable from at least one scene.
  const referenced = new Set();
  sceneRefs.forEach((ref) => {
    (ref.simulations || []).forEach((id) => {
      referenced.add(id);
      if (!simulations[id]) fail(`curriculum/scenes: unknown simulation id "${id}" referenced by "${ref.id}"`);
    });
  });
  Object.keys(simulations).forEach((id) => {
    if (!referenced.has(id)) fail(`simulation "${id}" is not attached to any scene`);
  });
  return simulations;
}

function build() {
  const { curriculum, scenes } = loadCurriculum();
  const simulations = loadSimulations(curriculum.scenes);

  const data = {
    version: curriculum.version,
    productName: curriculum.productName,
    lectureTitle: curriculum.lectureTitle,
    chapters: curriculum.chapters,
    scenes,
    simulations
  };

  const banner = [
    '/*',
    ' * JuCoding V4 content registry — AUTO-GENERATED, DO NOT EDIT BY HAND.',
    ' * Source: src/content/v4/curriculum.json, scenes/*.json, simulations/*.json',
    ' * Regenerate: node scripts/build-v4-content.js',
    ' * Verify:     node scripts/build-v4-content.js --check',
    ' */'
  ].join('\n');

  const body = `${banner}\n(function (global) {\n  'use strict';\n  global.JUCODING_V4_CONTENT = ${JSON.stringify(data, null, 2)};\n})(typeof window !== 'undefined' ? window : globalThis);\n`;

  if (process.argv.includes('--check')) {
    if (!fs.existsSync(outFile)) {
      fail('generated/content-registry.js is missing — run: node scripts/build-v4-content.js');
      return;
    }
    const current = fs.readFileSync(outFile, 'utf-8');
    if (current !== body) {
      fail('generated/content-registry.js is out of sync with the JSON source of truth — run: node scripts/build-v4-content.js');
      return;
    }
    console.log(`✓ content registry in sync (${scenes.length} scenes, ${Object.keys(simulations).length} simulations)`);
    return;
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, body, 'utf-8');
  if (process.exitCode) return;
  console.log(`✓ wrote ${path.relative(root, outFile)} (${scenes.length} scenes, ${Object.keys(simulations).length} simulations)`);
}

if (require.main === module) build();

module.exports = { VALID_CONFIDENCE };
