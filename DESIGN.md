# JuCoding V4 Design System

## 1. Product Identity

JuCoding is a **visual classroom for AI, Agent, and vibe coding beginners**.

The UI should feel like a friendly desktop learning studio rather than an enterprise LMS or a developer-only control room.

Primary goals:

1. A beginner understands the screen before reading long text.
2. The instructor can project the app on a beam projector and explain by pointing at diagrams.
3. Difficult engineering vocabulary is translated into plain Korean first.
4. Existing V3 player functions (notes, board, print/PDF, fullscreen, offline operation) remain usable.
5. Visual explanation is primary; paragraphs are supporting material.

V3 documentary assets may remain for legacy sessions, but **V4 visual language is the default direction for new beginner curriculum**.

---

## 2. Atmosphere

Keywords:

- friendly
- visual
- calm
- playful but not childish
- beginner-safe
- projector-readable
- desktop application

Signature composition:

```text
Dark navy navigation rail
        +
Bright paper-like learning canvas
        +
Pastel concept cards / diagrams
        +
Large Korean teaching labels
```

Do not turn lecture screens into text documents.

---

## 3. Color

| Role | Value | Usage |
|---|---|---|
| Navy rail | `#111a31` | Main desktop navigation |
| Deep navy | `#0a1020` | Rail depth / footer |
| Paper | `#ffffff` | Main content surfaces |
| App background | `#eef2ff` | Window canvas |
| Primary ink | `#151b31` | Headlines |
| Muted ink | `#66708f` | Supporting explanation |
| Purple | `#755cff` | Primary teaching accent |
| Blue | `#4d7cff` | Flow / links / secondary accent |
| Cyan | `#65ccff` | Tool / connection concepts |
| Mint | `#6cd9b4` | Success / API / connected flow |
| Pink | `#ff7caf` | Highlight / creative automation |
| Orange | `#ffad66` | Deployment / data / caution |
| Border | `#e2e7f5` | Card and panel separation |

### Rules

- Purple/blue gradients are allowed for identity, primary action, and key teaching phrases.
- Pastel backgrounds communicate categories, not status severity.
- Dark navy is primarily navigation chrome; lecture content remains bright.
- Never depend on color alone to communicate meaning.

---

## 4. Typography

Primary:

`Pretendard Variable, Pretendard, Noto Sans KR, system-ui, sans-serif`

### Projector scale

| Level | Target |
|---|---:|
| Cover hero | `54–112px` responsive |
| Lecture title | `34–64px` responsive |
| Card heading | `19–30px` |
| Core definition | `16–22px` |
| Body support | `12–15px` |
| Metadata | `10–11px` |

Large labels should explain the concept without requiring the body copy.

Example:

```text
프론트엔드
= 보이는 곳
```

is preferred over a long definition paragraph.

---

## 5. Lecture Information Pattern

Beginner concepts use this order when possible:

```text
Hard term
↓
Plain Korean translation
↓
Visual metaphor / diagram
↓
Real example
↓
Optional deeper explanation
```

Example:

```text
API
= 서로 말 거는 방법
Frontend ↔ API ↔ Backend
```

---

## 6. App Shell

### Left rail

Dark navy.

Contains:

- JuCoding brand
- courses / lecture entry
- project / notes tools
- settings
- offline readiness

The rail may preserve legacy DOM and behavior, but visible labels should use beginner-friendly Korean.

### Main surfaces

- light background
- 18–28px rounded panels
- subtle purple/blue shadow
- generous whitespace
- no dense enterprise tables unless the content specifically teaches tables

### Player

Player should feel like a presentation surface.

Required existing capabilities to preserve:

- previous / next
- fullscreen
- instructor notes
- board annotation
- print/PDF where already supported
- offline lecture content

---

## 7. Lecture Cards and Diagrams

Recommended components:

- concept card
- before/after comparison
- process arrows
- simple architecture diagram
- workflow
- large quote / key idea
- interactive beginner form

Avoid decorative cards that do not teach anything.

Every card should answer one of:

- What is it?
- Why is it needed?
- Where does it connect?
- What happens next?

---

## 8. Motion

Motion is supportive only.

| Type | Duration |
|---|---:|
| Hover | 120–180ms |
| Slide entry | 250–320ms |
| Dialog / cue | 180–240ms |

Rules:

- no automatic lecture progression
- instructor controls scene changes
- respect `prefers-reduced-motion`
- avoid background motion that competes with projected explanation

### 8.1 Lecture simulation (V4.1)

A simulation is a *stepped replay of a concept inside a scene*, not decoration.
The instructor starts it and stays in control; the deck never advances itself.

Required controls on every simulation:

| Control | Key |
|---|---|
| 시작 / 일시정지 / 계속 | `Space` |
| 다음 단계 | `→` |
| 처음부터 | `R` |
| 정적 화면으로 돌아가기 | `Esc` |
| 속도 | 0.75x / 1x / 1.5x |

Keyboard arbitration: while a simulation is open it owns `Space`, `→`, `←`, `R`
and `Esc`, and the lecture's own scene navigation stands down. When no simulation
is open the lecture keys behave exactly as before. There is no key that means two
things at once.

Motion vocabulary (see `src/content/v4/simulation.css`):

| Element | Treatment |
|---|---|
| Card entry | fade + translateY |
| Emphasis card | soft scale (~4%) |
| Connector | left→right draw |
| Running step | pulse + glow ring, exactly one at a time |
| Completed step | green tint + check badge |
| Hover | 3px lift |
| Buttons | hover lift + press scale |
| Scene entry | staggered fade + translateY |

Because the running step is the only pulsing element and completed steps keep
their check, a projected room can always tell what is happening right now.

`prefers-reduced-motion: reduce` removes all of it through CSS only. Step timing
and state changes are unaffected, so the explanation still works.

---

## 9. Teaching Interaction

V4 may include tiny interactive exercises inside slides.

Examples:

- “What do you want to build?” → project summary
- repetitive task → automation flow
- choice of web/desktop/mobile/CLI

These are for understanding, not a full LMS assessment system.

---

## 10. Content Source of Truth

Content and rendering code are separate concerns.

```
src/content/v4/
├─ curriculum.json          # chapters + scene order
├─ scenes/NN-slug.json      # per-scene teaching copy (title/narration/cue/extra)
├─ simulations/*.json       # node/edge/step definitions
└─ generated/               # built by scripts/build-v4-content.js (do not hand-edit)
```

- `one-shot.js` holds only `SCENE_RENDERERS`: one markup function per scene id.
  It contains no teaching copy, and `npm run check` fails if it starts to.
- A simulation is data: `nodes`, `edges`, and a list of
  `{ id, label, target, action, duration, narration }` steps where `action` is
  `show | activate | connect | complete`. No scene owns its own timers.
- `scripts/build-v4-content.js` validates the data (every node is targeted, every
  connector is drawn, every run ends in `complete`) and compiles it into
  `generated/content-registry.js`, because the lecture is loaded over `file://`
  where fetching local JSON is blocked.

Because the teaching copy is data, the Archive can change a lecture without
touching code.

---

## 11. JuCoding Archive (V4.1)

An external, user-visible folder, created on first run:

```
Documents/JuCoding/Archive/
├─ inbox/     ← the instructor drops material here
├─ reviewed/  ← scanned, but nothing was applied
├─ applied/   ← applied material + an apply-<timestamp>-<id>.json manifest
└─ backup/    ← YYYY-MM-DD-HHmm/ written before every apply
```

Supported in V1: `.md` `.txt` `.json` `.png` `.jpg` `.jpeg` `.webp`.
`.pdf` is listed as **PDF 지원 예정** rather than silently dropped, because V1
ships no PDF text extraction.

The update flow is ordered and enforced, never suggested:

```
material → scan → analyse → draft → preview → human approval → apply
```

Non-negotiable rules:

- Finding material never changes the lecture.
- Nothing is written inside the installed app. Approved changes become an
  override file in `userData` that the lecture merges at render time, so a fresh
  install behaves identically.
- Every apply writes `backup/YYYY-MM-DD-HHmm/` first, containing the previous
  override file, a lecture content snapshot, and a `RESTORE.txt`.
- Change cards default to **기존 유지**. Only changes explicitly switched to
  **이 변경 적용** are written, and the text that lands is the hand-edited text.
- Material with an approved change moves to `applied/`; material with none moves
  to `reviewed/`; material that produced no candidates stays in `inbox/`.
- The app works with no API key and no network. `LectureOrganizerProvider` is an
  adapter; the shipped local provider is rule-based, and with no AI provider
  connected the UI says `AI 정리는 연결되지 않았습니다.` while manual draft
  editing stays available.

---

## 12. Current V4 Reference Curriculum

The first V4 reference experience is:

`src/content/v4/one-shot.html`

It follows six sections:

1. 왜 바이브코딩인가?
2. AI와 Agent
3. 기본 개발 용어
4. 프로젝트 기획 용어
5. 개발서버 · 배포 · Git
6. MCP · Worker · 자동화

21 scenes in total, with interactive simulations on six of them.

New beginner lecture UI should remain visually compatible with this reference unless a later Owner decision supersedes it.
