# V4.1 — interactive simulations + Archive

Delivered on `feat/v4-1-simulation-archive`.

The V4 design, six-chapter curriculum and 21 scenes are unchanged. Two things
were added on top: lecture scenes can now be *played* rather than only read, and
lecture content can now be updated by dropping material into a folder instead of
editing code.

---

## A. Animated lecture / simulation

### Where the content lives

`src/content/v4/simulations/*.json` — seven definitions:

| File | Flow | Scene |
|---|---|---|
| `chat-agent.json` | 질문 → AI → 답변 | 04 AI와 Agent 차이 |
| `ai-agent.json` | 목표 → Agent → 도구 → 확인 → 반복 → 완료 | 04 AI와 Agent 차이 |
| `chatgpt-vs-computer-agent.json` | ChatGPT vs 컴퓨터 Agent (2 branches) | 05 ChatGPT와 터미널 Agent |
| `frontend-api-backend.json` | Frontend → API → Backend → Database | 07 하나의 서비스가 연결되는 구조 |
| `mcp-worker.json` | 아이디어 → Agent → Worker → Remotion → 영상 완성 | 17 영상 자동화 |
| `sns-automation.json` | 자료 → SNS Worker → 사람 승인 → 게시 | 18 SNS 자동화 |
| `safety-boundary.json` | Local Test → 감지 → 보류 → 사람 승인 → 실제 실행 | 20 안전 경계 |

`04 AI와 Agent 차이` carries two simulations because the scene *is* a comparison
of those two flows, and the view shows a tab switcher for them.

### Schema

```jsonc
{
  "id": "ai-agent",
  "title": "목표 → Agent → 도구 → 확인 → 반복 → 완료",
  "nodes": [{ "id": "goal", "label": "목표", "icon": "🎯", "note": "…", "emphasis": true, "row": 0 }],
  "edges": [{ "id": "e1", "from": "goal", "to": "agent" }],
  "steps": [
    { "id": "s1", "label": "목표 카드 등장", "target": "goal", "action": "show",
      "duration": 800, "narration": "사용자가 목표를 줍니다." }
  ]
}
```

`action` is one of `show | activate | connect | complete`. `connect` takes an
optional `from`; without it the engine uses the previously touched node.
`curve: true` on an edge bows it away from the row, which is how the
`safety-boundary` hold branch and the `ai-agent` return edge stay readable.

### Engine

`src/content/v4/simulation-engine.js`, three layers:

- `SimulationEngine` — the state machine (`idle → running → paused → finished`).
  Owns one timer chain driven by `duration / speed`. No per-scene timers exist
  anywhere; `npm run check` fails if one appears in `one-shot.js`.
- `SimulationStage` — builds the DOM, measures the connectors, and maps each step
  onto CSS classes.
- `SimulationView` — the entry panel, the transport controls, the simulation
  switcher, and keyboard arbitration.

Two details worth knowing:

- Connectors are applied **synchronously**, not in `requestAnimationFrame`.
  rAF is throttled in hidden and occluded windows, and a connector that never
  appears is a correctness bug rather than a missing animation.
- Exactly one card is `is-running` at a time, and only the connector being drawn
  is `is-live`. A finished run marks every reached card complete, so the end state
  is unambiguous.

### Controls

`시작` · `일시정지` · `계속` · `다음 단계` · `처음부터` · `정적 화면` and speed
`0.75x / 1x / 1.5x`.

Keyboard: `Space` start/pause, `→` next step, `R` restart, `←`/`Esc` leave the
simulation. While a simulation is open the lecture's scene navigation stands
down, so no key means two things at once. Deep link with
`one-shot.html#scene=ai-agent&sim=ai-agent`.

### Motion

`src/content/v4/simulation.css`, transitions and keyframes only, no animation
library. Navy/white/purple/blue/pastel is unchanged.

`prefers-reduced-motion: reduce` removes all motion from CSS alone while step
timing and state changes keep working, so the explanation survives.

---

## B–C. Archive / material inbox

`Documents/JuCoding/Archive/{inbox,reviewed,applied,backup}`, created on first
run by `src/main/v4-archive.js`. Supported: `.md .txt .json .png .jpg .jpeg
.webp`. `.pdf` is surfaced as **PDF 지원 예정** because V1 has no PDF text
extraction.

### Adding an image to a lecture

1. Put the image in `Archive/inbox/` (`.png .jpg .jpeg .webp`).
2. `자료실 > 새 자료 확인` → `변경안 만들기`.
3. The review screen shows **the picture itself**, a title field, a caption
   field, and a dropdown of all 21 scenes.
4. Pick the scene, then `이 변경 적용` and `승인한 변경만 적용`.

The filename only picks a *default* scene, and the reason line shows the
candidates it considered. That is deliberate: a short filename scored against a
full sentence almost never identifies the right scene, and guessing silently is
worse than asking. Images are therefore never discarded — every image in the
inbox produces a reviewable change.

Applied images are inlined into the lecture as `data:` URLs by the main process,
because the renderer is sandboxed and cannot read the user's Documents folder.
No custom protocol is registered, so the renderer gets no filesystem access and
the deck's CSP is unchanged.

### Adding a slide deck as a new chapter

A whole deck can be placed at once by authoring a Lecture Update Proposal and
dropping it in the inbox next to the images:

```jsonc
{
  "consumes": ["01_첫번째.png", "02_두번째.png"],
  "changes": [
    { "sceneId": "appendix-x-01", "action": "new_scene", "title": "…",
      "chapter": "appendix-x", "chapterId": "appendix-x",
      "chapterLabel": "부록", "chapterTitle": "슬라이드 덱", "blocks": [] },
    { "sceneId": "appendix-x-01", "action": "asset", "sourceName": "01_첫번째.png",
      "assetPath": "inbox/01_첫번째.png", "after": "…", "size": "large" }
  ]
}
```

- `consumes` names the extra files the proposal places. They are **not** run
  through the similarity guess — the proposal already decides where each goes —
  but they stay in `sourceFiles` so they are filed to `applied/` and their paths
  rewritten.
- `new_scene` may introduce a whole chapter via `chapterId`/`chapterTitle`, which
  joins the 목차 grid and the footer label. An unknown `chapter` id falls back to
  a real one rather than storing an id the renderer cannot resolve.
- `size: "large"` renders a full slide instead of the 104px caption thumbnail,
  and opens in a dialog sized to the viewport. A 1254×1254 slide still cannot
  show its fine print at lecture size, so the intended use is click-to-enlarge
  or the instructor narrating it.

The shipped curriculum is untouched: an appendix is added after it, so the
original 21 scenes keep their order and numbering.

Flow, enforced in this order:

```
material → 새 자료 확인 → 변경안 만들기 → preview → per-change approval → apply
```

- Change cards default to **기존 유지**. The applied text is whatever the
  instructor leaves in the editor.
- `applyProposal()` writes `backup/YYYY-MM-DD-HHmm/` **before** anything else:
  previous override file, lecture content snapshot, `RESTORE.txt`.
- Approved lecture changes are stored as an override in `userData`, never inside
  the installed app, and the lecture merges them at render time.
- Material with an approved change → `applied/` (plus an `apply-*.json`
  manifest). Material with none → `reviewed/`. Material that produced no
  candidates stays in `inbox/`.

`jucoding-archive://` serves images from inside the Archive root only; anything
resolving outside it returns 403.

### LectureOrganizerProvider

`src/main/v4-organizer.js` defines the interface and ships one local provider.
It scores material statements against each scene with Sørensen–Dice over character
trigrams — chosen because Korean is not space-delimited, so word tokenization
loses most of the signal. A `.json` material that is already a Lecture Update
Proposal is used verbatim, so the documented schema works as a real interchange
format.

No AI provider is registered, so the UI shows `AI 정리는 연결되지 않았습니다.`
and manual draft editing stays available. `npm run check` fails if the organizer
reads a credential, opens a socket, or gains an AI dependency.

---

## D. Content source of truth

```
src/content/v4/
├─ curriculum.json
├─ scenes/01-cover.json … 21-summary.json
├─ simulations/*.json
└─ generated/content-registry.js      (built)
```

`one-shot.js` keeps only `SCENE_RENDERERS`. All 21 markup bodies were carried
over byte-identical and verified by diff. `npm run content:build` validates the
data and regenerates the registry; `--check` (run inside `npm run check`) fails
on drift.

The registry exists because the lecture is loaded over `file://` under a
restrictive CSP, where fetching local JSON is blocked by Chromium.

---

## F. Home UX

The V4 home is unchanged, including its seven sections.

- `자료실` — the six WEBP figures, plus an Archive card: path, new-material
  count, `자료함 열기` / `새 자료 확인` / `강의 변경안 검토`.
- `강사 도구` — fullscreen, memo backup, plus `Archive 자료함`,
  `강의 변경안 검토`, `백업 폴더`, and a line summarising what has been applied.
- The lecture's `강사 메모` panel now shows the scene's one-line `narration`,
  which is what an approved `replace` targets.

---

## H. QA

```bash
npm run check          # 32 checks: content, simulations, archive, packaging
npm run smoke:v4       # 29 checks: deck, simulations, layout, offline
npm run smoke:v4:shell # 57 checks (56 assert + 1 needs a visible window): archive approval flow, images, slide-deck chapters
```

All three pass. Both smoke suites run on a **hidden window by default** and never
steal focus.

`npm run capture:v41` produces the visual record in `artifacts/qa` and requires
`--visible`, because Chromium only produces a trustworthy frame for a window the
user can actually see — `capturePage()` on a hidden window returns a stale frame,
so in hidden mode screenshots are skipped and reported as skipped rather than
writing a misleading PNG. The same applies to the OS-level fullscreen
round-trip, which is reported as skipped in hidden mode.

## Known gaps

- `.pdf` is listed but not parsed. The UI says `PDF 지원 예정`.
- `npm run release:build` needs a Windows host (or wine) for
  `electron-builder --win nsis`. The packaged-file-set check in `npm run check`
  runs anywhere and covers what QA can verify on Linux.
