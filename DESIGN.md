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

---

## 9. Teaching Interaction

V4 may include tiny interactive exercises inside slides.

Examples:

- “What do you want to build?” → project summary
- repetitive task → automation flow
- choice of web/desktop/mobile/CLI

These are for understanding, not a full LMS assessment system.

---

## 10. Current V4 Reference Curriculum

The first V4 reference experience is:

`src/content/v4/one-shot.html`

It follows six sections:

1. 왜 바이브코딩인가?
2. AI와 Agent
3. 기본 개발 용어
4. 프로젝트 기획 용어
5. 개발서버 · 배포 · Git
6. MCP · Worker · 자동화

New beginner lecture UI should remain visually compatible with this reference unless a later Owner decision supersedes it.
