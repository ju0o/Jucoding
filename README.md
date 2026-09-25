<p align="center">
  <img src="src/content/assets/v3/studio-dashboard.png" alt="VIBE STUDIO" width="800" />
</p>

<h1 align="center">VIBE STUDIO</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-3.0.0--beta.3-blue" alt="Version" />
  <img src="https://img.shields.io/badge/platform-Windows%2010%2B-lightgrey" alt="Platform" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

<p align="center">
  <b>바이브코딩 수업 운영, 강의자료, 실습 패키지를 한곳에서 관리하는 Electron 기반 강의 스튜디오</b>
</p>

---

## 소개

VIBE STUDIO는 AI·바이브코딩 강의를 실제 현장에서 운영하기 위한 데스크톱 앱입니다.

강사가 과정과 회차를 고르고, 강의자료·수강생 출력물·실습파일·공식 참고자료를 빠르게 찾고, 인터랙티브 슬라이드를 직접 진행할 수 있도록 구성되어 있습니다.

<p align="center">
  <img src="src/content/assets/v3/studio-dashboard.png" alt="Studio Dashboard" width="720" />
</p>

## 화면 구조

앱은 세 영역으로 구성됩니다.

- **왼쪽** — 과정, 일정, 설정
- **가운데** — 강의, 강사자료실, 수강생 출력물, 실습파일, 공식자료
- **오른쪽** — 목표, 준비물, 결과물, 실행 버튼

`Ctrl+K`로 과정·회차·자료·실습 파일을 빠르게 검색할 수 있습니다.

## 포함 과정

| 트랙 | 구성 | 설명 |
|---|---:|---|
| **바이브코딩 기초반** | 6주 | AI 코딩 입문과 프로젝트 실습 |
| **AI 제품·수익화** | 8주 | SaaS 제작부터 실제 납품 흐름까지 |
| **AI Workflow Architect** | 4주 | 터미널·Git·MCP·Agent 워크플로 |
| **Claude Code Professional** | 6주 | Claude Code 기반 프로젝트 자동화 |
| **Codex Professional** | 6주 | Codex 워크스페이스와 Worktree 활용 |
| **AI 심화 통합과정** | 8주 | 고급 Agent 팀과 자동화 흐름 |
| **AI 한방 이해하기** | 4주 | AI 핵심 개념과 실습 |
| **특강 라이브러리** | 60~90분 | 주제별 단기 강의 |

권장 학습 순서:

```text
기초 → Workflow Architect → Claude Code 또는 Codex
```

## 시작하기

### 설치

```bash
npm install
```

### 개발 실행

```bash
npm start
```

### V3 콘텐츠 생성

```bash
npm run build:v3
```

### 공식 참고자료 갱신

```bash
npm run sources:refresh
```

공식 URL의 상태와 수업용 설명을 갱신하며 원문 전체를 복제하지 않습니다.

## 품질 검사

```bash
npm run audit:curriculum
npm run check
npm run smoke:app
npm run smoke:tracks
npm run qa:print
```

| 명령 | 검사 대상 |
|---|---|
| `audit:curriculum` | 회차 구조, 대본, 실습 패키지, 대체 화면 |
| `check` | 문법, 매니페스트, 파일 연결 |
| `smoke:app` | 메인 UI와 검색·플레이어 동작 |
| `smoke:tracks` | 전체 과정 슬라이드 진행 흐름 |
| `qa:print` | 수강생·강사용 PDF 출력 품질 |

## Windows Beta 빌드

```bash
npm run release:v3-beta
```

`release/` 폴더에 portable EXE와 현장 실행 자료가 생성됩니다.

## 기술 구성

| 구분 | 기술 |
|---|---|
| Desktop | Electron 31 |
| Packaging | electron-builder |
| Build | esbuild + Node scripts |
| Interactive slides | HTML + CSS transform/opacity |
| Labs | starter · broken · complete 3단계 |
| Print QA | A4 PDF 자동 검사 |

## 프로젝트 방향

VIBE STUDIO는 범용 LMS보다 **실제 강사가 수업을 준비하고 진행하는 도구**에 가깝습니다.

핵심 목표는 다음 세 가지입니다.

1. 강의 준비 시간을 줄인다.
2. 회차별 자료와 실습을 잃어버리지 않게 한다.
3. 수업 현장에서 바로 실행 가능한 형태로 유지한다.

## 상태

**Beta / active classroom development.**

실제 수업에서 사용하는 자료와 다음 버전 커리큘럼을 함께 검증하고 있습니다.

---

<p align="center">Made by <a href="https://github.com/ju0o">ju0o</a></p>
