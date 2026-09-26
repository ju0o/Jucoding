# 변경 이력

이 프로젝트는 [Semantic Versioning](https://semver.org/)을 사용합니다.

## [Unreleased]

### 추가 (V4.1 — 시뮬레이션 + Archive, `feat/v4-1-simulation-archive`)

- **인터랙티브 시뮬레이션 강의** — 주요 개념 장면 6곳에 `시뮬레이션 시작` 추가.
  시작/일시정지/계속/다음 단계/처음부터 + 속도 0.75x·1x·1.5x, 키보드는
  `Space`(시작/일시정지) `→`(다음 단계) `R`(처음부터) `Esc`(정적 화면).
  시뮬레이션이 열려 있는 동안에는 강의 전체 다음/이전 키가 양보하므로 키 충돌이
  없습니다. `←` 로 시뮬레이션을 빠져나오면 기존 키 동작이 그대로 복귀합니다.
- **시뮬레이션 7종** — 질문→AI→답변, 목표→Agent→도구→확인→반복→완료,
  ChatGPT vs 컴퓨터 Agent, Frontend→API→Backend→Database,
  아이디어→Agent→Worker→Remotion→영상 완성, 자료→SNS Worker→사람 승인→게시,
  Local Test→External Action 감지→보류→사람 승인→실제 실행.
- **데이터 기반 시뮬레이션 엔진** — `show / activate / connect / complete` 단계와
  `nodes`/`edges`/`steps` 로 정의되는 JSON. 장면별 `setTimeout` 코드는 없습니다
  (`npm run check` 가 이를 검사합니다). 애니메이션은 CSS transition/keyframes
  뿐이며 `prefers-reduced-motion` 를 지원합니다.
- **콘텐츠 원본 분리** — `src/content/v4/curriculum.json` + `scenes/*.json` 이
  강의 순서·제목·강사 메모를 소유하고, `one-shot.js` 는 `SCENE_RENDERERS`
  (시각 마크업)만 남겼습니다. 21개 렌더러 본문은 diff 로 바이트 단위 동일함을
  확인했습니다. `npm run content:build` / `content:check` 로 빌드·검증합니다.
- **JuCoding Archive (외부 자료함)** — `Documents/JuCoding/Archive/` 를 첫 실행 시
  자동 생성(`inbox`/`reviewed`/`applied`/`backup`). 지원 형식
  `.md .txt .json .png .jpg .jpeg .webp`, `.pdf` 는 `PDF 지원 예정` 으로 표시.
- **자료 → 강의 변경안 흐름** — `새 자료 확인` → `변경안 만들기` → Preview →
  변경별 사람 승인 → 적용. 발견만으로 강의가 바뀌지 않으며, 변경 카드는
  `기존 유지` 가 기본값이고 반영되는 문장은 수동 편집본입니다.
- **적용 직전 자동 백업** — `Archive/backup/YYYY-MM-DD-HHmm/` 에 적용 전
  덮어쓰기 파일, 강의 내용 스냅샷, `RESTORE.txt` 를 기록합니다. 반영된 원자료는
  `applied/` (함께 `apply-*.json` 매니페스트), 반영되지 않은 자료는 `reviewed/`,
  후보가 없던 자료는 `inbox` 에 남습니다.
- **LectureOrganizerProvider 어댑터** — API 키 없이 로컬에서 동작하는 규칙 기반
  제공자를 기본으로 둡니다. 자음/한글이 공백 구분되지 않아 문자 trigram
  Sørensen–Dice 유사도로 장면을 매칭합니다. `.json` 자료가 이미 변경안 형식이면
  그대로 사용합니다. AI 제공자가 없을 때 `AI 정리는 연결되지 않았습니다.` 를
  표시하고 수동 Draft 편집은 계속 가능합니다.
- **설치본 무변경** — 승인된 변경은 `userData` 덮어쓰기 파일로 저장되고 강의가
  렌더 시점에 병합합니다. `jucoding-archive://` 프로토콜은 Archive 루트 내부
  파일만 제공합니다.
- **홈 UI** — `자료실` 에 Archive 카드(경로, 새 자료 수, 자료함 열기/새 자료
  확인/강의 변경안 검토), `강사 도구` 에 Archive·변경안 검토·백업 폴더 추가.
  기존 7개 섹션과 디자인은 그대로입니다.
- **QA 확장** — `npm run check` 31개 검사, `npm run smoke:v4` 29개,
  `npm run smoke:v4:shell` 57개(가시 창 필요 1개 제외). 시뮬레이션 제어 전체 매트릭스, 키 충돌 방지,
  reduced-motion(CDP 에뮬레이션), 1366×768·1920×1080 레이아웃, 6개 WEBP,
  콘솔 에러 0, 비로컬 요청 0, Archive 승인 흐름(백업 선행, reject 무효성,
  hand-edit 반영, applied/reviewed 분류)을 검증합니다. 스모크는 기본적으로
  숨김 창으로 실행되어 포커스를 가져가지 않습니다.
- **이미지 자료 → 강의 반영** — inbox 의 `.png .jpg .jpeg .webp` 는 변경안 화면에
  그림 그대로 표시되고, 21개 장면 중 붙일 곳을 직접 고를 수 있습니다(자료 이름 ·
  설명도 입력). 반영된 이미지는 메인 프로세스가 `data:` URL 로 인라인해 주므로
  렌더러는 파일 시스템에 접근하지 않고 CSP 도 바뀌지 않습니다.
  이미지는 더 이상 버려지지 않습니다 — 이전에는 파일명과 문장의 유사도가 임계값을
 임계값을 넘지 못해 **모든 이미지가 변경안 없이 조용히 무시**되었습니다.
- **슬라이드 덱 → 부록 챕터** — `.json` 변경안에 `consumes` 와 `chapterId` /
  `chapterTitle` 을 넣으면 여러 장을 한 번에 새 챕터로 배치합니다. 기존 21장
  커리큘럼은 그대로 두고 뒤에 붙습니다. `size: 'large'` 는 104px 썸네일이 아니라
  슬라이드 크기로 보여주고, 클릭하면 화면 전체 크기로 열립니다. 지면 1254×1254
  슬라이드는 강의 화면에서 작은 글씨가 읽히지 않으므로 「클릭해서 크게 보기」 또는
  강사 구두 설명을 전제로 합니다.
- 이미지는 필요할 때 1장씩만 불러옵니다. 16장 세트(23MB, base64 31MB)를 덮어쓰기
  파일에 인라인하면 강의를 열 때마다 31MB가 IPC로 넘어갔습니다.
- 한 장면에 이미지 2장을 승인하면 **나머지가 조용히 사라지던 버그**를 거부 방식으로
  변경했습니다.
- QA가 `shell.openPath` 를 실제 호출해 강사PC의 탐색기 창을 띄우던 문제를
  제거했습니다(경로만 검증).
- `npm run capture:v41` — V4.1 화면 기록 캡처(가시 창 필요).
- `docs/V4_1_SIMULATION_ARCHIVE.md`, `DESIGN.md` 8.1·10·11절 갱신.

### 수정

- `getProposal()` 이 제안안 id가 `.json` 으로 끝나기를 요구해 모든 적용이 조용히
  실패하던 버그 수정. id 를 정규화하고 화이트리스트로 경로 이탈도 차단합니다.
- `new_scene` 장면의 `chapter` 기본값이 커리큘럼에 없는 `'auto'` 로 저장되어
  1장에 잘못 분류되던 버그 수정, `title`/`cue`/`extra`/`blocks` 전달 누락 수정.
- Archive 변경 카드에서 선택된 결정(기본 `기존 유지`)이 표시되지 않던 문제 수정.
- V4 check 의 패키징 검증을 실제 파일 목록 해석으로 확장(호스트 무관 실행).
- F: 드라이브(9p) 재마운트 시 `chmod` 가 불가해져 git lock 생성이 실패하던
  환경 문제를 `core.sharedRepository=false` 로 우회.

## [4.0.0] - 2026-07-02

### 추가

- 6강 슬라이드 16(React/Next.js 실서비스 목업), 21(VSCode workbench 비밀값 장면), 28(수료식 커튼 연출) 재설계와 해상도별 검증 캡처
- AI 한방 3주차에 `AI LANDSCAPE`(모델→MCP/Skill→SubAgent→Workflow→오케스트레이션 5층 지형도), `LOOP ENGINEERING`(원샷 대비 계획-실행-검증-개선 루프) 개념 슬라이드
- AI 한방 4주차 엔딩 시퀀스: 다음 과정 경로 지도(NEXT STEP)와 수강 후기 QR(THANK YOU)
- AI 한방 W2~W4를 180분 밀도(각 40장)로 증축 — W2: 설치·규칙 파일(CLAUDE.md/AGENTS.md)·컨텍스트 관리·Git 4장면·브랜치·Diff 읽기·검증 루틴·위험 신호·되돌리기·비용 습관·실수 예방·데일리 루틴·예상 질문 15장 / W3: MCP 사례 지도·도입 판단·보안 3원칙·Skill 실례·Skill vs 프롬프트·위임 계약서·병렬 작업·게이트 설계·무게이트 사고 사례·통합 여정·도입 시점·용어 정리·자가 진단·과제 14장 / W4: 조직도·사규와 서고(Rules/Memory/Docs/Log)·md 구조·권한 3등급·로그 해부·예산 규칙·사고 타임라인·도입 로드맵·1인 회사 하루·확장 신호·용어·진단·개설 체크리스트·예상 질문 14장
- 스튜디오 강의 즐겨찾기(상세 패널 토글 + 목록 별표)와 최근 열람 자료 6건 기록
- `Ctrl+K` 빈 검색 상태에서 즐겨찾기·최근 자료를 카탈로그 위에 고정 노출
- onepass 오프라인 대체 화면 `onepass-01.png` 캡처
- AI 한방 W3에 `ENGINEERING ERAS`(프롬프트→컨텍스트→루프→하네스 4세대 사다리), W4에 `HARNESS` 개념 슬라이드 — 과정의 숨은 척추(W2=컨텍스트, W3=루프, W4=하네스)를 명시화
- 발표자 제어 수동 시연 8장면 신설 — W2(규칙 파일이 팀 기준이 되는 순간, 사고→복구 4단계), W3(같은 요청의 4세대 통과, 병렬 분배와 게이트 합류), W4(예산 경보의 하루, 30분 사무실 개설)
- 신규 `특강 라이브러리` 트랙(9번째 과정) — 첫 특강 「AI 엔지니어링의 진화 — 프롬프트에서 하네스까지」 90분 24장 덱(`sessions/special-engineering-eras.html`), 세대별 개념·원리·실물 장면·한계·자가 진단 + 인터랙티브 수동 시연 + 후기 QR
- 특강 수강생 배포자료(4세대 지도·자가 진단 A4 2장)와 강사 노트(90분 타임라인·예상 질문·오해 교정 A4 2장)
- 특강 트랙은 `scripts/data/special-course.manifest.json`으로 정의되어 `build:v3` 재생성에도 보존
- 특강 2호 「AI 안전 운전 — 비용 · 비밀값 · 개인정보」 60분 16장 덱(`sessions/special-ai-safety.html`) — 3대 사고 지점(돈·유출·파괴), 비용 3규칙, 비밀값 금고 구조, 개인정보 가명화·최소화, 권한 3등급, 유출 첫 15분 인터랙티브 시연, 팀 점검표 7문항 + 안전 점검표 A4 배포자료
- 스튜디오 과정 레일에 특강 전용 스파크 아이콘 추가

### 수정

- `v3/material.js` 시연 운영 매뉴얼이 preparation 없는 회차(advanced)에서 빈 화면으로 죽던 버그 수정 — `qa:print` 91종 PDF 전체 통과 복구

### 변경

- onepass 4주 덱을 수작업 유지 파일로 확정 — `build-onepass-week*.js` 생성기는 `FORCE_ONEPASS_REBUILD=1` 없이 덮어쓰기 거부
- `audit-v3-curriculum` 기대값을 현재 커리큘럼에 맞게 갱신(advanced 8강, onepass 180분, 쇼케이스는 아카이브 리비전으로 검사, 43개 회차 장면 데이터)
- `basic-v2-freeze.json`을 검수 완료된 1~6강 리빌드 기준으로 재고정

### 제거

- 사용처가 없는 V2 레거시 셸 `src/renderer/app.js`, `src/renderer/styles.css`
- 루트의 떠돌이 중복 파일 `reviewQR.jpg` (실사용본은 `src/content/assets/`)

## [3.0.0-beta.3] - 2026-06-16

### 추가

- 단일 강사용 로컬 스튜디오 구조
- 전역 강사자료실, 수강생 출력물, 실습파일, 공식자료 학습실 탭
- Workflow Architect 강사용 `Agent·MCP·Skill 전문 연구자료`
- 공식자료 연구노트, 시연 운영 매뉴얼, 강사용 심화 개념집, 질문·답변·오류 복구집
- 공식 출처 59개에 강사용 배경, 쉬운 비유, 자주 생기는 오해, 시연 포인트와 수업 전 체크리스트
- Claude Code Professional 강사용 `Anthropic 공식자료 기반 전문 연구자료`를 추가해 agentic loop, CLAUDE.md, auto memory, permission modes, Skills, Plugins, MCP, Hooks, Subagents, Agent Teams, GitHub Actions를 공식자료 학습 순서와 슬라이드 장면으로 정리
- Codex Professional 6회차별 전문 강사용 연구노트, 시각 시뮬레이션 설계 의도, 실패 훈련, 전문 Q&A
- Codex Professional 강사용 `Codex 공식 매뉴얼 기반 전문 연구자료`를 추가해 표면 선택, 지속 지침, 권한, 검증, Subagents, Worktrees, Hooks, Automations, Release를 공식자료 학습 순서와 슬라이드 장면으로 정리
- AI 제품·수익화, Workflow Architect, Claude Code Professional, Codex Professional 강사자료실에 `V3 전문과정 제작·고도화 기준표`를 추가해 공식자료 기반 회차 제작 순서, 대표 장면, 슬라이드 품질 기준을 통일
- 다음 기수 기초 4주, Workflow Architect, Claude Code, Codex, AI 제품·수익화 전 회차에 공식자료 기반 전문 연구노트 자동 생성
- 회차별 강사용 공부 순서, 슬라이드 고도화 브리프, 모션 스토리보드, 실제 자료 확보 목록, 리허설 체크리스트

### 변경

- 학생/강사 모드 토글을 제거하고 모든 운영 기능을 강사용 스튜디오에서 직접 접근
- 모든 V3 ready 회차는 공식자료 3개 이상, 전문 연구노트, 시연 런북, 실패 훈련, 전문 Q&A, 공부 경로, 슬라이드·모션 설계를 감사 기준으로 통과해야 함
- 강사용 대본을 SAY·DO·ASK·예상 답변·심화 설명·오류 복구 구조로 확장
- 강사용 대본에 모션·시각 큐와 공식자료 큐를 추가
- Codex Professional 강사용 대본과 출력물을 공식 매뉴얼 기반의 표면 선택, AGENTS.md, Skills·Plugins, MCP·Browser, Subagents·Worktrees, Hooks·Release 운영 흐름으로 보강
- AI 제품·수익화 과정에 YC, Atlassian, Nielsen Norman Group, Material Design, Stripe, Toss Payments, Supabase, GitHub, Firebase, Vercel 공식·전문 자료 연결
- `Ctrl+K` 검색 범위를 강의, 강사자료, 수강생 출력물, 실습파일, 공식자료로 확대
- A4 PDF QA 대상을 71종으로 확대
- 4강 파일 구조 설명에서 `src`, `public`, `node_modules`, `package*.json`, `.env*`가 모두 프로젝트 루트 기준에서 구분되도록 수정
- 5강 환경변수 설명에 `.env`, `.env.local`, `.env.example`, 배포 환경변수의 차이를 추가
- 2기 운영본 freeze 기준을 4강 파일 구조와 5강 환경변수 오류 수정본으로 재고정

## [3.0.0-beta.2] - 2026-06-16

### 추가

- 현재 2기 6회차의 별도 V3 작업본과 회차별 운영본 승격·복구
- 터미널, IDE, 브라우저, 배포, 시스템 관제, 제품 보드, 쇼케이스, AI 도구 지형 장면군
- 34개 고유 시뮬레이션 장면과 오프라인 대체 PNG
- 34개 회차별 starter·broken·complete 실행 실습 패키지
- 수강생 개인 실습 기록지, 강사용 오프라인 대체 화면과 현장 리허설 자료
- ZIP/JSON 운영 데이터 백업·복원과 패키징 후 실습 폴더 추출

### 변경

- 모든 V3 시연을 시작·이전·다음·일시정지·초기화로 통일
- 강사용 대본을 13장별 SAY·DO·ASK·예상 답변·복구 구조로 확장
- 수강생 자료를 6종, 강사 자료를 7종으로 확장
- Windows PR QA에서 34개 강의, 앱 셸과 65개 PDF를 전수 검사
- Electron 패키징을 ASAR 방식으로 전환하고 Beta·RC GitHub Release를 사전 릴리즈로 분리

## [3.0.0-beta.1] - 2026-06-16

### 추가

- 현재 2기 6주 운영본을 해시로 동결하고 강사 전용 다음 기수 4주 개편본 추가
- AI 제품·수익화 8주, Workflow Architect 4주, Claude Code 6주, Codex 6주 커리큘럼
- 28개 신규 회차를 위한 13장 공통 인터랙티브 강의 엔진
- 과정별 수강생 자료 5종과 강사용 자료 5종 자동 생성
- 공식 출처 39개 상태를 갱신하는 `sources:refresh`
- 커리큘럼 중복, V2 회귀, A4 PDF와 Electron 화면을 검사하는 V3 QA

### 변경

- 전체 과정 카탈로그와 과정 카드 그리드를 3단 Curriculum Studio UI로 교체
- 자료실을 전역 목록에서 선택 과정의 `강의 / 수강생 자료 / 강사 자료` 탭으로 이동
- 강사 모드에서만 다음 기수 개편본과 강사 자료를 표시
- 모든 V3 교육 애니메이션을 시작·다음·일시정지·초기화 수동 진행 방식으로 통일
- 인쇄 자료를 밝은 A4 전용 CSS로 분리하고 페이지 분할 검사를 추가

### 보존

- `src/content/sessions/*`의 현재 기초반 2기 6주 강의 파일과 기존 진행 구조

## [2.0.0] - 2026-06-15

### 추가

- 13개 과정과 70개 강의를 탐색하는 전체 과정 카탈로그
- 과정별 일정과 장소, 운영 메모를 저장하는 플래너
- 응용·수익화반 1~6강 실행형 인터랙티브 덱
- AI 워크스페이스 심화반 1~6강 실행형 인터랙티브 덱
- SaaS, 외주, 자동화, MCP, Skill, Agent, Agent Teams, Claude Code, Codex와 강사 마스터 과정 52개 실행 강의
- 12개 후속 과정별 수강생 워크북과 강사용 운영 가이드 24종
- 제품, 납품, 자동화, 프로토콜, Skill, Agent, 팀, 터미널과 강의 스튜디오 시각 모드
- Claude Code와 Codex를 분리한 강사용 공부자료
- 강사 프로그램 로드맵과 Agent 시스템 인터랙티브 학습 자료

### 변경

- 단일 기초반 런처를 `VIBE STUDIO` 다과정 강의 운영 콘솔로 리디자인
- 5강을 Git, GitHub, 배포, 환경변수, 데이터 권한 중심의 17장 인터랙티브 강의로 전면 개편
- 수강생 자료실과 강사 자료실을 과정·회차 기준으로 그룹화
- 4강 파일 구조 강의의 수동 시연, 파일별 시각 전환, 수정 영향 범위와 30분 실습 화면 보강
- 릴리즈 스크립트를 특정 V1이 아닌 현재 앱 버전을 기준으로 동작하도록 일반화
- GitHub Release 자산명을 `VIBE-STUDIO-X.Y.Z.exe`로 통일
- 과정 매니페스트에서 전문 강의 HTML과 자료실 항목을 생성하는 동기화 빌드 추가

### 제거

- 4강 실습 타이머 화면의 불필요한 추가 지시문

## [1.0.0] - 2026-06-15

### 추가

- 바이브코딩 기초반 1~6강 강의 프로그램
- 수강생 자료와 강사 자료실 분리
- 4강 파일 구조 이해 인터랙티브 슬라이드 17장
- 응용·수익화반 4강 커리큘럼
- AI 워크스페이스 심화반 6강 커리큘럼
- 후속 과정 설계 및 강사용 공부자료
- 발표자 메모, 판서, 전체화면, 인쇄와 PDF 저장
- Electron 대시보드 및 강의 플레이어 스모크 테스트

### 변경

- 프로그램 UI를 V2 강의 운영 콘솔로 리디자인
- 4강 파일 탐색과 코드 수정 시연을 수동 시작 방식으로 변경
- 프로젝트 설정 파일별 시각 자료와 수정 영향 범위 설명 강화

### 제거

- 네트워크 연결이 필요했던 모바일 무선 리모컨
- 4강 실시간 네트워크 투표 기능
