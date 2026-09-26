'use strict';

// JuCoding V4 — LectureOrganizerProvider adapter.
//
// The Archive feature must work with no API key and no network. A "provider"
// is anything that can turn raw material into a Lecture Update Proposal:
//
//   interface LectureOrganizerProvider {
//     id: string
//     label: string
//     kind: 'local' | 'ai'
//     isAvailable(): boolean
//     describe(): string
//     propose({ materials, scenes }): Promise<LectureUpdateProposal>
//   }
//
// V4.1 registers one local provider. An AI provider (OpenAI / OpenRouter / a
// local model) can be added later by implementing the same interface and
// pushing it into PROVIDERS; nothing else in the app needs to change.
//
// When no AI provider is configured the UI shows
// "AI 정리는 연결되지 않았습니다." and the local provider still produces an
// editable draft, so the Archive never breaks.

const CONFIDENCE = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };

const THRESHOLDS = {
  [CONFIDENCE.HIGH]: 0.52,
  [CONFIDENCE.MEDIUM]: 0.34,
  [CONFIDENCE.LOW]: 0.2
};

const MIN_STATEMENT = 12;
const MAX_STATEMENT = 220;

// ---------------------------------------------------------------------------
// Text utilities — deterministic and offline.
// ---------------------------------------------------------------------------

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function trigrams(text) {
  const flat = normalize(text).replace(/\s/g, '');
  const out = new Set();
  for (let i = 0; i + 3 <= flat.length; i += 1) out.add(flat.slice(i, i + 3));
  return out;
}

// Sørensen–Dice over character trigrams. Chosen over word tokenization because
// Korean is written without spaces between morphological units, so a token
// approach loses most of the signal.
function similarity(a, b) {
  const left = a instanceof Set ? a : trigrams(a);
  const right = b instanceof Set ? b : trigrams(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const gram of left) if (right.has(gram)) shared += 1;
  return (2 * shared) / (left.size + right.size);
}

function confidenceFor(score) {
  if (score >= THRESHOLDS[CONFIDENCE.HIGH]) return CONFIDENCE.HIGH;
  if (score >= THRESHOLDS[CONFIDENCE.MEDIUM]) return CONFIDENCE.MEDIUM;
  if (score >= THRESHOLDS[CONFIDENCE.LOW]) return CONFIDENCE.LOW;
  return null;
}

function stripMarkdown(line) {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,6}#{1,6}\s*/, '')
    .replace(/^\s{0,6}>\s?/, '')
    .replace(/^\s{0,6}[-*+]\s+/, '')
    .replace(/^\s{0,6}\d+[.)]\s+/, '')
    .replace(/[*_`~]/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function looksLikeHeading(line) {
  return /^\s{0,6}#{1,6}\s+\S/.test(line) && line.replace(/^\s{0,6}#{1,6}\s*/, '').trim().length < 40;
}

function usableStatement(text) {
  if (text.length < MIN_STATEMENT || text.length > MAX_STATEMENT) return false;
  if (/^https?:\/\//i.test(text)) return false;
  // Needs at least two whitespace-separated words, i.e. real Korean prose.
  return text.split(/\s+/).filter(Boolean).length >= 2;
}

// Pulls candidate teaching statements out of a markdown / plain-text material.
function statementsFromText(raw) {
  const body = String(raw || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ');
  const lines = body.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    if (looksLikeHeading(line)) continue;
    const cleaned = stripMarkdown(line);
    if (!cleaned) continue;
    for (const piece of cleaned.split(/(?<=[.!?。])\s+/)) {
      const text = piece.trim();
      if (usableStatement(text)) out.push(text);
    }
  }
  return out;
}

function collectJsonStrings(value, out = [], depth = 0) {
  if (depth > 6 || out.length > 400) return out;
  if (typeof value === 'string') {
    if (usableStatement(value.trim())) out.push(value.trim());
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectJsonStrings(item, out, depth + 1);
    return out;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) collectJsonStrings(value[key], out, depth + 1);
  }
  return out;
}

// A .json material may already be a Lecture Update Proposal. When it is, use it
// verbatim instead of guessing — that makes the documented schema a real
// interchange format rather than just a shape in the docs.
function proposalFromJson(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const changes = Array.isArray(parsed) ? parsed : parsed && parsed.changes;
  if (!Array.isArray(changes) || !changes.length) return null;
  const valid = changes.every((c) => c && typeof c === 'object'
    && typeof c.sceneId === 'string' && c.sceneId
    && typeof c.after === 'string' && c.after.trim()
    && ['replace', 'append', 'asset', 'new_scene'].includes(c.action));
  return valid ? changes : null;
}

function makeChangeId(sceneId, action, after) {
  let hash = 5381;
  const key = `${sceneId}|${action}|${after}`;
  for (let i = 0; i < key.length; i += 1) hash = ((hash << 5) + hash + key.charCodeAt(i)) >>> 0;
  return `c${hash.toString(36)}`;
}

// Presentation fields a new_scene needs, passed through only when present.
function newSceneFields(change) {
  const out = {};
  for (const key of ['title', 'chapter', 'cue', 'extra']) {
    if (typeof change[key] === 'string' && change[key].trim()) out[key] = change[key].trim();
  }
  if (Array.isArray(change.blocks) && change.blocks.length) out.blocks = change.blocks;
  return out;
}

// ---------------------------------------------------------------------------
// Local rule provider
// ---------------------------------------------------------------------------

function localPropose({ materials, scenes }) {
  const byId = new Map(scenes.map((scene) => [scene.id, scene]));
  const sceneGrams = new Map(scenes.map((scene) => [scene.id, trigrams(`${scene.title} ${scene.narration} ${scene.cue}`)]));
  const changes = [];
  const seen = new Set();

  const push = (change) => {
    const dedupeKey = `${change.sceneId}|${change.action}|${normalize(change.after)}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    change.id = makeChangeId(change.sceneId, change.action, change.after);
    changes.push(change);
  };

  // Every change records which material produced it, so applying can file that
  // exact file away and report the attribution back to the instructor.
  const withSource = (change, material) => ({ ...change, sourceName: material.name });

  for (const material of materials) {
    if (material.kind === 'image') {
      // An image is never dropped. The filename only picks a DEFAULT scene, and
      // a short filename scored against a full sentence almost never clears the
      // similarity threshold, so gating on it silently discarded every image the
      // instructor had actually placed in the inbox. The instructor chooses the
      // real target in the preview instead.
      const grams = trigrams(material.name.replace(/[-_.]+/g, ' '));
      const ranked = scenes
        .map((scene) => ({ scene, score: similarity(grams, sceneGrams.get(scene.id)) }))
        .sort((a, b) => b.score - a.score);
      const best = ranked[0];
      if (!best) continue;
      const confidence = confidenceFor(best.score) || CONFIDENCE.LOW;
      const runnersUp = ranked.slice(1, 4)
        .filter((r) => r.score > 0)
        .map((r) => `${r.scene.title}(${(r.score * 100).toFixed(0)}%)`);
      push(withSource({
        sceneId: best.scene.id,
        action: 'asset',
        field: 'assets',
        before: '',
        after: material.name,
        assetPath: material.archivePath,
        mime: material.mime || '',
        reason: `이미지 "${material.name}"을(를) "${best.scene.title}" 장면의 강의 자료로 추가합니다.`
          + ` 파일명 기준 추정 일치도 ${(best.score * 100).toFixed(0)}%.`
          + (runnersUp.length ? ` 다른 후보: ${runnersUp.join(', ')}.` : '')
          + ' 이미지가 붙을 장면은 검토 화면에서 직접 고를 수 있습니다.',
        confidence,
        score: Number(best.score.toFixed(4))
      }, material));
      continue;
    }

    if (material.kind !== 'text') continue;
    const raw = material.text || '';

    // 1) The material is already a proposal → trust it.
    const explicit = material.ext === '.json' ? proposalFromJson(raw) : null;
    if (explicit) {
      for (const change of explicit) {
        if (!byId.has(change.sceneId) && change.action !== 'new_scene') continue;
        push(withSource({
          sceneId: change.sceneId,
          action: change.action,
          field: change.field || (change.action === 'append' ? 'extra' : 'narration'),
          before: typeof change.before === 'string' ? change.before : '',
          after: change.after,
          reason: change.reason || `${material.name} 안에 이미 작성된 변경안이 있습니다.`,
          confidence: Object.values(CONFIDENCE).includes(change.confidence)
            ? change.confidence
            : CONFIDENCE.HIGH,
          // A new_scene carries its own presentation, so those fields must
          // survive re-emission instead of being flattened to `after`.
          ...(change.action === 'new_scene' ? newSceneFields(change) : {})
        }, material));
      }
      continue;
    }

    // 2) Otherwise derive candidates from prose.
    const statements = material.ext === '.json'
      ? collectJsonStrings(safeParse(raw))
      : statementsFromText(raw);

    for (const statement of statements) {
      const grams = trigrams(statement);
      let best = null;
      let bestScore = 0;
      for (const scene of scenes) {
        const score = similarity(grams, sceneGrams.get(scene.id));
        if (score > bestScore) {
          bestScore = score;
          best = scene;
        }
      }
      const confidence = confidenceFor(bestScore);
      if (!best || !confidence) continue;

      const cueScore = similarity(grams, trigrams(best.cue));
      // A statement that mostly repeats what the scene already teaches is an
      // addition ("have Instructor also mention this"), not a replacement.
      const isSupplementary = cueScore >= THRESHOLDS[CONFIDENCE.HIGH]
        || statement.length > (best.extra || '').length;
      const action = isSupplementary ? 'append' : 'replace';
      const field = action === 'append' ? 'extra' : 'narration';
      const before = action === 'append' ? (best.extra || '') : (best.narration || '');

      push(withSource({
        sceneId: best.id,
        action,
        field,
        before,
        after: statement,
        reason: `"${material.name}"의 문장 중 "${best.title}" 장면과 가장 유사합니다. `
          + `일치도 ${(bestScore * 100).toFixed(0)}%. `
          + (action === 'append'
            ? '장면의 기존 설명을 유지한 채 강사 메모에 덧붙입니다.'
            : '장면의 한 줄 요약을 이 문장으로 교체합니다.'),
        confidence,
        score: Number(bestScore.toFixed(4))
      }, material));
    }
  }

  return changes;
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const LocalRuleOrganizerProvider = {
  id: 'local-rules',
  label: '로컬 규칙 기반',
  kind: 'local',
  isAvailable() {
    return true;
  },
  describe() {
    return 'API 키 없이 로컬에서만 동작합니다. 자료 문장과 기존 강의 문장의 유사도로 변경 후보를 만듭니다.';
  },
  async propose(context) {
    return localPropose(context);
  }
};

const PROVIDERS = [LocalRuleOrganizerProvider];

function providerById(id) {
  return PROVIDERS.find((p) => p.id === id) || null;
}

// Which provider handles `kind`. AI providers are opt-in via configuration and
// are absent in V4.1, which is exactly why the UI must tolerate "no AI".
function activeProvider() {
  const wanted = process.env.JUCODING_ORGANIZER_PROVIDER;
  if (wanted) {
    const found = providerById(wanted);
    if (found && found.isAvailable()) return found;
  }
  return PROVIDERS.find((p) => p.isAvailable()) || null;
}

function status() {
  const ai = PROVIDERS.filter((p) => p.kind === 'ai' && p.isAvailable());
  const current = activeProvider();
  return {
    activeProviderId: current ? current.id : null,
    activeProviderLabel: current ? current.label : null,
    aiConnected: ai.length > 0,
    aiMessage: ai.length > 0
      ? `${ai[0].label} 연결됨`
      : 'AI 정리는 연결되지 않았습니다.',
    aiHint: ai.length > 0
      ? 'AI 제공자가 연결되어 있습니다.'
      : 'AI 제공자가 없어 로컬 규칙 기반으로 변경안을 만듭니다. 수동 Draft 편집은 언제든 가능합니다.',
    availableProviders: PROVIDERS.map((p) => ({ id: p.id, label: p.label, kind: p.kind }))
  };
}

module.exports = {
  CONFIDENCE,
  PROVIDERS,
  LocalRuleOrganizerProvider,
  providerById,
  activeProvider,
  status,
  similarity,
  trigrams,
  statementsFromText,
  confidenceFor
};
