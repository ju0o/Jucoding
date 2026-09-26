# JuCoding V4 — Clean Current Product + Visual Assets Handoff

## OWNER GO

JuCoding V3 is now legacy/reference-only.

Archive branch:

`archive/jucoding-v3-final`

Do not modify or extend that branch.

Current product work happens on `main` as JuCoding V4.

The goal is no longer "V3 with a V4 skin". The goal is a clean, beginner-friendly JuCoding V4 Electron teaching app, while preserving only reusable engine pieces that are still useful.

---

## 1. Product direction

Default app experience:

- beginner friendly
- visual first
- large cards / diagrams / short Korean explanations
- lecture-first navigation
- projector friendly
- minimal operator complexity on the default surface

Target navigation:

1. 홈
2. 강의하기
3. 실습 예제
4. 프로젝트
5. AI 도우미 (placeholder/later is acceptable)
6. 자료실
7. 강사 도구 (secondary/hidden)

Do not make legacy course-management UI the first thing the instructor sees.

---

## 2. Visual assets

The Owner supplied six visual assets. They are authoritative source materials for V4 and should be copied into:

`src/assets/lecture/v4/`

Expected filenames:

- `ai-agent-vibecoding.webp`
- `chat-ai-vs-computer-agent.webp`
- `beginner-dev-terms.webp`
- `project-planning-terms.webp`
- `automation-deploy-mcp.webp`
- `safety-boundary.webp`

Do not download replacement images from the internet.

The Owner/PM will provide the asset bundle locally.

### Mapping

- `ai-agent-vibecoding.webp` → Chapter 1 hero/reference
- `chat-ai-vs-computer-agent.webp` → Chapter 2 supporting reference/handout
- `beginner-dev-terms.webp` → Chapter 3 hero/reference
- `project-planning-terms.webp` → Chapter 4 hero/reference
- `automation-deploy-mcp.webp` → Chapter 6 hero/reference
- `safety-boundary.webp` → closing safety section

Use the images as teaching assets, not just decorative backgrounds.

Where appropriate, allow a teacher to open/enlarge them during class.

---

## 3. Curriculum refinements

Keep the 3-hour beginner session focused on conceptual understanding.

### Core

1. Why vibe coding + AI vs Agent
2. Frontend / Backend / API / Database
3. GUI / TUI / CLI
4. PRD / WBS / Wireframe / Prototype / ERD / SSOT
5. Development server / deployment
6. Git / GitHub
7. Chat AI vs computer/terminal Agent
8. MCP / Worker / automation examples
9. Safety boundary + human approval

### Mention only / supplementary

- detailed DBML syntax
- detailed Git commands
- provider/model rankings
- subscription plan comparisons
- changing rate limits / plan prices

Do not burn beginner lecture time on details that can be looked up later.

---

## 4. Important wording

Use these concepts consistently:

- AI is the broader category.
- An AI Agent is a form of AI that can pursue a goal using tools/actions.
- Vibe coding = developing software through natural-language collaboration with AI.
- "A space where my agents can work" is a teaching metaphor, not the formal definition of vibe coding.
- Frontend = the part the user sees/interacts with.
- Backend = the part that handles requests/business logic behind the scenes.
- Database = where persistent data is stored/managed.
- API = a way for software to communicate with software.
- MCP = a protocol/standard for connecting AI applications with tools/context. MCP is not automation itself.
- Worker = a bounded executor/role. Worker is not synonymous with MCP.
- Remotion = one concrete tool for programmatic video rendering, not a required automation component.

---

## 5. Safety lesson

The supplied safety visual must become a real lesson, not an optional decoration.

Teach it as a relative risk boundary:

### Lower-risk / inside my screen

- research
- sample/fake data testing
- local execution
- drafts

### Higher-impact / outside my screen

- real payment APIs
- production database writes
- public/SNS publishing
- external account changes
- actions affecting other people/services

Important nuance:

Do not teach "inside my screen = always safe" as an absolute rule.

Preferred wording:

> 내 화면 안의 실험은 보통 위험이 낮고, 화면 밖의 실제 서비스·사람에게 영향을 주는 행동은 더 강한 확인이 필요하다.

High-impact actions should include explicit human approval where practical.

---

## 6. Timebox

Target approximately 3 hours including break/Q&A.

Suggested:

- 25m — Why vibe coding + AI/Agent
- 25m — software anatomy / basic terms
- 30m — project planning terms
- 10m — break
- 25m — dev server / deployment / Git/GitHub
- 20m — Chat AI vs computer Agent
- 25m — MCP / Worker / automation
- 10m — safety boundary
- 10m — recap / Q&A

Total: 180m

---

## 7. V3 cleanup policy

Before deleting legacy files from `main`, classify each as:

A. reusable V4 runtime/core
B. reusable teaching utility
C. V3-only course/content
D. dead/obsolete experiment

Actions:

- Keep A.
- Keep or move B behind Instructor Tools.
- Remove C and D from the V4 runtime/package when safe.
- Never delete history from `archive/jucoding-v3-final`.

Do not blindly delete Electron main/preload utilities that V4 still uses.

The goal is to reduce runtime/product complexity, not to maximize deleted file count.

---

## 8. Default V4 UX

Desired start:

`Launch JuCoding → Home → 강의하기 → AI · Agent · 바이브코딩 → 시작 → fullscreen lecture`

The teacher should not need to understand the old V3 content-management structure to start a class.

Home should visibly prioritize:

- 오늘의 강의 / current curriculum
- continue/start
- practice
- materials

Legacy/reference features belong under a secondary instructor area.

---

## 9. Offline requirement

The installed `.exe` must be useful for class even when venue internet is unstable.

Therefore:

- core lecture content must be local
- supplied visuals must be bundled locally
- navigation must not require network
- no remote image dependency for core scenes

Links to external references can be optional extras.

---

## 10. Packaging

After cleanup:

- keep product name `JuCoding`
- build Windows x64 NSIS installer
- create desktop shortcut
- create Start Menu shortcut
- installed app should launch without Node/npm/dev environment

Do not package V3-only content that is no longer needed by V4 unless required by a preserved utility.

---

## 11. QA

Required checks:

- static syntax/check PASS
- V4 shell smoke PASS
- V4 lecture smoke PASS
- local asset paths all resolve
- all six visual assets render offline
- no horizontal overflow at 1366×768
- test 1920×1080 projector layout
- fullscreen lecture controls work
- keyboard previous/next works
- instructor notes work
- project form works
- automation form works
- no console errors
- Windows installer builds
- installed application launches successfully

Also manually inspect Korean text legibility and image scaling.

---

## 12. Delivery

Return:

### RESULT
PASS / PARTIAL / BLOCKED

### V3 CLEANUP
Files kept / moved / removed and why.

### V4 STRUCTURE
Current default app flow.

### VISUAL ASSETS
Confirm all six filenames and where each is used.

### CURRICULUM
Final scene/chapter list and timing.

### QA
Exact command/result evidence.

### INSTALLER
Installer filename, size, and launch result.

### KNOWN ISSUES
Only real remaining issues.

Do not add unrelated features.
