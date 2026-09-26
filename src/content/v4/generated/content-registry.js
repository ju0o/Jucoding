/*
 * JuCoding V4 content registry — AUTO-GENERATED, DO NOT EDIT BY HAND.
 * Source: src/content/v4/curriculum.json, scenes/*.json, simulations/*.json
 * Regenerate: node scripts/build-v4-content.js
 * Verify:     node scripts/build-v4-content.js --check
 */
(function (global) {
  'use strict';
  global.JUCODING_V4_CONTENT = {
  "version": "4.1",
  "productName": "JuCoding",
  "lectureTitle": "AI · Agent · 바이브코딩",
  "chapters": [
    {
      "id": "why",
      "label": "01",
      "title": "왜 바이브코딩인가?",
      "time": "약 25분"
    },
    {
      "id": "agent",
      "label": "02",
      "title": "AI와 Agent",
      "time": "약 25분"
    },
    {
      "id": "terms",
      "label": "03",
      "title": "기본 개발 용어",
      "time": "약 30분"
    },
    {
      "id": "plan",
      "label": "04",
      "title": "프로젝트 기획 용어",
      "time": "약 40분"
    },
    {
      "id": "deploy",
      "label": "05",
      "title": "개발서버 · 배포 · Git",
      "time": "약 30분"
    },
    {
      "id": "auto",
      "label": "06",
      "title": "MCP · Worker · 자동화",
      "time": "약 20분"
    }
  ],
  "scenes": [
    {
      "id": "cover",
      "ordinal": 1,
      "chapter": "why",
      "title": "오늘의 지도",
      "narration": "오늘은 AI에게 질문하는 것에서 시작해, Agent에게 일을 맡기고, 내가 원하는 도구와 공간까지 만드는 흐름을 한 번에 봅니다.",
      "cue": "오늘은 용어를 외우는 시간이 아니라, AI가 실제로 일할 수 있는 공간을 어떻게 만드는지 연결해서 보는 시간입니다.",
      "extra": "오프닝 질문: “ChatGPT에게 물어보는 것과 직접 프로그램을 만드는 것은 뭐가 다를까요?”"
    },
    {
      "id": "spaces",
      "ordinal": 2,
      "chapter": "why",
      "title": "기존 서비스는 이미 만들어진 공간",
      "narration": "기존 서비스는 이미 정해진 목적에 맞춰 편리하지만, 내가 원하는 방식으로 AI와 Agent가 일하는 공간은 따로 만들어야 합니다.",
      "cue": "YouTube는 영상 공간, Notion은 기록 공간, Excel은 데이터 공간입니다. 편리하지만 결국 남이 정해둔 방식 안에서 일합니다.",
      "extra": "여기서 “그럼 내 업무 방식에 딱 맞는 공간이 없다면?”을 질문하세요."
    },
    {
      "id": "vibe",
      "ordinal": 3,
      "chapter": "why",
      "title": "바이브코딩의 핵심",
      "narration": "바이브코딩은 AI가 대신 코딩해주는 것이 아니라, 내가 원하는 문제 해결 공간을 AI와 함께 만드는 방식입니다.",
      "cue": "바이브코딩은 “AI가 대신 코딩해주는 것”으로만 이해하면 좁습니다. 내가 원하는 문제 해결 공간을 AI와 함께 만드는 방식이라고 설명하세요.",
      "extra": "정의: AI와 대화하며 소프트웨어를 만드는 방식. 결과적으로 나만의 도구/공간을 만들 수 있습니다."
    },
    {
      "id": "ai-agent",
      "ordinal": 4,
      "chapter": "agent",
      "title": "AI와 Agent 차이",
      "narration": "AI는 질문에 답하지만, Agent는 목표를 받고 도구를 선택해 실행한 뒤 결과를 확인하고 필요하면 반복합니다.",
      "cue": "Agent가 왜 ‘목표 → 도구 → 확인 → 반복’으로 도는지, 이 강의에서 실제로 겪은 실패 하나로 설명하세요. 아래 시뮬레이션은 그 실패를 그대로 재현합니다. 확인 단계를 빼면 무엇이 깨지는지 보여주는 게 핵심입니다.",
      "extra": "AI는 자주 틀립니다. 그래서 ‘되돌릴 수 있는 기록’과 ‘확인하는 순간’이 같이 있어야 안전합니다. Git은 여기서 나옵니다.",
      "simulations": [
        "chat-agent",
        "ai-agent"
      ]
    },
    {
      "id": "chat-terminal",
      "ordinal": 5,
      "chapter": "agent",
      "title": "ChatGPT와 터미널 Agent",
      "narration": "ChatGPT는 설명과 아이디어 정리에 강하고, 터미널 Agent는 내 컴퓨터의 파일과 명령을 직접 다룹니다.",
      "cue": "“어떻게 고쳐?”라고 묻는 것과 “직접 고쳐.”라고 맡기는 차이로 설명하면 초보자가 가장 빨리 이해합니다.",
      "extra": "예시: ChatGPT는 수정 방법을 설명할 수 있고, Codex/Claude Code 같은 Agent는 실제 파일과 터미널을 다룰 수 있습니다.",
      "simulations": [
        "chatgpt-vs-computer-agent"
      ]
    },
    {
      "id": "web-terms",
      "ordinal": 6,
      "chapter": "terms",
      "title": "프론트엔드 · 백엔드 · API · DB",
      "narration": "프론트엔드는 보이는 곳, 백엔드는 뒤에서 일하는 곳, API는 서로 말 거는 방법, 데이터베이스는 기억하는 곳입니다.",
      "cue": "네 단어를 따로 외우게 하지 말고 “보이는 곳 / 뒤에서 일하는 곳 / 서로 말 거리는 방법 / 기억하는 곳” 네 문장으로 먼저 잡아주세요.",
      "extra": "이후 기술 이름은 바뀌어도 이 네 역할은 계속 남습니다."
    },
    {
      "id": "architecture",
      "ordinal": 7,
      "chapter": "terms",
      "title": "하나의 서비스가 연결되는 구조",
      "narration": "사용자 행동 하나는 프론트엔드에서 API로 요청하고, 백엔드가 처리해 데이터베이스에 저장하는 과정입니다.",
      "cue": "슬라이드의 저장하기 버튼을 실제로 눌러보게 하세요. 클릭 한 번 뒤 오른쪽 4단계가 차례로 켜지며, 각 단계마다 실제로 도는 코드가 그대로 나옵니다.",
      "extra": "추상적인 ‘화면 → 서버 → DB’ 설명 대신, 내가 누른 버튼 하나가 네 번의 일로 확장되는 장면으로 보여주세요.",
      "simulations": [
        "frontend-api-backend"
      ]
    },
    {
      "id": "ui-terms",
      "ordinal": 8,
      "chapter": "terms",
      "title": "GUI · TUI · CLI",
      "narration": "GUI는 그림으로, TUI는 터미널 안에서, CLI는 명령어로 조작하는 방식입니다.",
      "cue": "세 칸이 전부 같은 동작(메모 저장)이라는 점을 먼저 말하세요. 그 다음 표현만 다르다는 걸 보여주면 용어가 외워집니다. 아무 칸이나 눌러보라고 하세요.",
      "extra": "실제 제품에서도 셋이 섞여 있습니다. VS Code는 GUI이면서 내부적으로 CLI를 호출합니다."
    },
    {
      "id": "planning-terms-a",
      "ordinal": 9,
      "chapter": "plan",
      "title": "PRD · WBS · Wireframe · Prototype",
      "narration": "PRD는 기획서, WBS는 할 일 목록, Wireframe은 화면 스케치, Prototype은 눌러보는 시제품입니다.",
      "cue": "각 영어 단어보다 쉬운 번역을 먼저 말하세요. “기획서, 할 일 목록, 화면 스케치, 눌러보는 시제품”입니다.",
      "extra": "이번 강의에서는 작성법을 깊게 배우는 것이 아니라 언제 쓰는지 이해하는 것이 목표입니다."
    },
    {
      "id": "planning-terms-b",
      "ordinal": 10,
      "chapter": "plan",
      "title": "ERD · DBML · SSOT",
      "narration": "ERD는 데이터 관계 그림, DBML은 데이터 구조를 글로 표현하고, SSOT는 최종 기준 문서입니다.",
      "cue": "SSOT는 특히 실무에서 중요합니다. 여러 문서가 서로 다르면 “그래서 뭐가 진짜 기준이야?”가 생기기 때문입니다.",
      "extra": "ERD=데이터 관계 그림, DBML=DB 구조를 글로 표현, SSOT=최종 기준 문서."
    },
    {
      "id": "project-flow",
      "ordinal": 11,
      "chapter": "plan",
      "title": "프로젝트가 만들어지는 순서",
      "narration": "프로젝트는 아이디어, 기획, 화면, 데이터, 구현 순서로 작은 단계를 반복하며 만들어집니다.",
      "cue": "이 순서가 절대 법칙은 아니지만, 초보자가 전체 흐름을 이해하기엔 좋은 지도라고 설명하세요.",
      "extra": "아이디어 → 기획 → 화면 → 데이터 → 구현. 필요하면 앞뒤로 되돌아갑니다."
    },
    {
      "id": "project-form",
      "ordinal": 12,
      "chapter": "plan",
      "title": "내 첫 프로젝트 정리",
      "narration": "만들고 싶은 것, 사용할 사람, 가장 중요한 기능 세 가지를 적으면 프로젝트 시작점이 만들어집니다.",
      "cue": "참가자 한두 명에게 실제로 입력해보게 해도 좋습니다. 답이 완벽하지 않아도 프로젝트 시작점이 만들어지는 경험이 중요합니다.",
      "extra": "이 폼은 강의 중 예시용입니다. 나중에 실제 PRD 생성기로 확장할 수 있습니다."
    },
    {
      "id": "dev-deploy",
      "ordinal": 13,
      "chapter": "deploy",
      "title": "개발서버와 배포",
      "narration": "개발서버는 내 컴퓨터 안의 작업실이고, 배포는 다른 사람도 접속할 수 있는 공개 공간입니다.",
      "cue": "개발서버는 “내 작업실”, 배포는 “다른 사람도 들어올 수 있는 공간”이라는 비유로 충분합니다.",
      "extra": "localhost 주소는 내 컴퓨터 안에서만 보이는 경우가 많고, 배포 후 공개 URL이 생깁니다."
    },
    {
      "id": "git",
      "ordinal": 14,
      "chapter": "deploy",
      "title": "Git과 GitHub",
      "narration": "Git은 코드 변경 기록을 남기는 도구이고, GitHub는 그 기록을 온라인에서 보관하고 공유하는 서비스입니다.",
      "cue": "GitHub=Git이라고 생각하는 초보자가 많습니다. Git은 변경 기록 시스템, GitHub는 그 기록을 온라인에서 보관/공유하는 서비스라고 분리하세요.",
      "extra": "“AI가 코드를 망치면 돌아갈 수 있게 기록을 남긴다”는 설명도 실용적입니다."
    },
    {
      "id": "program-choice",
      "ordinal": 15,
      "chapter": "deploy",
      "title": "나는 어떤 프로그램을 만들까?",
      "narration": "사용자와 사용 장소에 따라 웹, PC 앱, 모바일 앱, CLI/TUI 중 형태를 고르면 됩니다.",
      "cue": "모든 프로젝트가 웹사이트일 필요는 없습니다. 사용자와 사용 장소에 따라 웹, PC, 모바일, CLI/TUI 등을 고르면 됩니다.",
      "extra": "초보 프로젝트는 배포가 쉬운 웹부터 시작하기 편하지만 절대 규칙은 아닙니다."
    },
    {
      "id": "mcp",
      "ordinal": 16,
      "chapter": "auto",
      "title": "MCP란?",
      "narration": "MCP는 AI가 브라우저, 파일, DB 같은 외부 도구를 사용할 수 있게 연결하는 공통 방식입니다.",
      "cue": "MCP를 “자동화 기능”이라고 설명하지 말고, AI가 외부 도구를 사용할 수 있게 연결하는 공통 방식이라고 설명하세요.",
      "extra": "브라우저, 파일, DB, 디자인 도구 등 다양한 외부 기능을 연결하는 표준화된 통로라는 비유가 좋습니다."
    },
    {
      "id": "video-auto",
      "ordinal": 17,
      "chapter": "auto",
      "title": "영상 자동화",
      "narration": "영상 자동화는 아이디어를 Agent가 기획하고 Worker와 Remotion이 실행한 뒤 QA로 다듬어 완성합니다.",
      "cue": "여기서 본인이 만든 Claude + Remotion 영상 사례를 보여주면 좋습니다. Agent는 판단, Worker는 특정 일을 수행하는 역할로 단순화하세요.",
      "extra": "예시 흐름: 아이디어 → 기획/대본 Agent → Worker → Remotion → QA → 영상 완성.",
      "simulations": [
        "mcp-worker"
      ]
    },
    {
      "id": "sns-auto",
      "ordinal": 18,
      "chapter": "auto",
      "title": "SNS 자동화",
      "narration": "SNS 자동화는 사람이 초안을 승인하고 공식 API로 게시하도록 통제 지점을 남기는 것이 안전합니다.",
      "cue": "SNS 자동화는 플랫폼 정책과 인증 방식이 중요합니다. “Agent가 알아서 무조건 게시”가 아니라 승인/권한/공식 API를 강조하세요.",
      "extra": "실제 운영에서는 초안 생성 → 사람 승인 → 공식 API 게시 → 결과 확인이 안전한 기본 구조입니다.",
      "simulations": [
        "sns-automation"
      ]
    },
    {
      "id": "automation-form",
      "ordinal": 19,
      "chapter": "auto",
      "title": "내 자동화 아이디어",
      "narration": "반복 업무를 입력, 처리, 결과 세 단계로 정리하면 첫 자동화 흐름을 설계할 수 있습니다.",
      "cue": "마지막에는 참가자가 자기 반복 업무 하나를 떠올리게 하세요. 기술 이름보다 “입력 → 일 → 결과” 세 칸이면 충분합니다.",
      "extra": "예: 수기 재고 사진 → AI 정리 → 엑셀/DB 저장."
    },
    {
      "id": "safety",
      "ordinal": 20,
      "chapter": "auto",
      "title": "안전 경계",
      "narration": "내 화면 안의 실험은 위험이 낮고, 화면 밖의 실제 서비스와 사람에게 영향을 주는 행동은 사람이 승인해야 합니다.",
      "cue": "이 장은 장식이 아니라 실제 수업입니다. 화면 안 실험과 화면 밖 실제 영향을 구분하고, 영향이 큰 행동은 사람이 직접 확인한다는 원칙을 남겨주세요.",
      "extra": "핵심 문장: 내 화면 안의 실험은 보통 위험이 낮고, 화면 밖의 실제 서비스·사람에게 영향을 주는 행동은 더 강한 확인이 필요하다.",
      "simulations": [
        "safety-boundary"
      ]
    },
    {
      "id": "summary",
      "ordinal": 21,
      "chapter": "auto",
      "title": "오늘의 전체 연결",
      "narration": "오늘 배운 용어들은 AI 이해, Agent 행동, 프로그램 구조, 기획, 배포, 자동화로 하나의 흐름으로 연결됩니다.",
      "cue": "용어를 얼마나 외웠는지가 아니라 “각 단어가 어디에 쓰이는지” 설명할 수 있으면 성공이라고 마무리하세요.",
      "extra": "다음 단계는 각자 작은 프로젝트 하나를 골라 실제로 AI/Agent와 만들어보는 것입니다."
    }
  ],
  "simulations": {
    "ai-agent": {
      "schema": "jucoding-simulation",
      "id": "ai-agent",
      "title": "AI가 망쳤을 때 · 되돌리는 루프",
      "subtitle": "확인하지 않으면 그대로 남고, 확인하면 되돌립니다",
      "sceneId": "ai-agent",
      "nodes": [
        {
          "id": "goal",
          "row": 0,
          "label": "목표",
          "icon": "🎯",
          "note": "부록 이미지 16장 추가",
          "emphasis": true
        },
        {
          "id": "agent",
          "row": 0,
          "label": "AI가 실행",
          "icon": "🤖",
          "note": "파일을 직접 고침",
          "emphasis": true
        },
        {
          "id": "check",
          "row": 0,
          "label": "결과 확인",
          "icon": "🔍",
          "note": "16장이 전부 사라짐"
        },
        {
          "id": "git",
          "row": 1,
          "label": "되돌리기",
          "icon": "↩️",
          "note": "Git으로 이전 상태 복구",
          "emphasis": true
        },
        {
          "id": "retry",
          "row": 1,
          "label": "다시 시도",
          "icon": "🔁",
          "note": "원인을 바꿔 재실행"
        },
        {
          "id": "done",
          "row": 1,
          "label": "완료",
          "icon": "✅",
          "note": "16장 모두 정상"
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "goal",
          "to": "agent"
        },
        {
          "id": "e2",
          "from": "agent",
          "to": "check"
        },
        {
          "id": "e3",
          "from": "check",
          "to": "git"
        },
        {
          "id": "e4",
          "from": "git",
          "to": "retry"
        },
        {
          "id": "e5",
          "from": "retry",
          "to": "check",
          "curve": true
        },
        {
          "id": "e6",
          "from": "retry",
          "to": "done"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "목표 주기",
          "target": "goal",
          "action": "show",
          "duration": 800,
          "narration": "“부록에 이미지 16장을 추가해줘.” 사람이 목적을 말로 줍니다."
        },
        {
          "id": "s2",
          "label": "AI가 받음",
          "target": "agent",
          "action": "connect",
          "from": "goal",
          "duration": 700,
          "narration": "AI가 목표를 받습니다."
        },
        {
          "id": "s3",
          "label": "AI가 파일 수정",
          "target": "agent",
          "action": "activate",
          "duration": 1100,
          "narration": "AI는 조언만 하지 않고 파일을 직접 고칩니다. 이게 AI와 Agent의 차이입니다."
        },
        {
          "id": "s4",
          "label": "AI가 '완료'라고 말함",
          "target": "agent",
          "action": "complete",
          "duration": 800,
          "narration": "“다 했습니다.” 실행은 끝났다고 말합니다. 그런데 아직 아무것도 확인하지 않았습니다."
        },
        {
          "id": "s5",
          "label": "결과를 확인하러 감",
          "target": "check",
          "action": "connect",
          "from": "agent",
          "duration": 700,
          "narration": "이 다음 단계가 오히려 중요합니다."
        },
        {
          "id": "s6",
          "label": "16장이 사라짐",
          "target": "check",
          "action": "activate",
          "duration": 1200,
          "narration": "확인해 보니 이미지 16장이 전부 사라졌습니다. AI가 고친 곳이 아니라 다른 곳을 건드린 것입니다."
        },
        {
          "id": "s7",
          "label": "되돌리기로 이동",
          "target": "git",
          "action": "connect",
          "from": "check",
          "duration": 700,
          "narration": "그래서 되돌립니다. 기록이 남아 있어야 돌아갈 수 있습니다."
        },
        {
          "id": "s8",
          "label": "Git으로 복구",
          "target": "git",
          "action": "activate",
          "duration": 1100,
          "narration": "Git이 작업 전 상태를 그대로 되돌려 줍니다. 이게 Git의 본래 목적입니다."
        },
        {
          "id": "s9",
          "label": "원래 상태로 복구",
          "target": "git",
          "action": "complete",
          "duration": 700,
          "narration": "복구 완료. 몇 초면 충분합니다."
        },
        {
          "id": "s10",
          "label": "원인을 바꿔 다시 시도",
          "target": "retry",
          "action": "connect",
          "from": "git",
          "duration": 700,
          "narration": "같은 요청을 그대로 다시 하면 같은 문제가 생깁니다. 원인을 바꿔 줍니다."
        },
        {
          "id": "s11",
          "label": "재실행",
          "target": "retry",
          "action": "activate",
          "duration": 1000,
          "narration": "이번엔 대상을 경로가 아니라 파일 이름으로 지정해서 다시 실행합니다."
        },
        {
          "id": "s12",
          "label": "다시 확인",
          "target": "check",
          "action": "connect",
          "from": "retry",
          "duration": 800,
          "narration": "또 확인합니다. 이 왕복이 반복입니다. 한 번만 확인하고 끝내면 안 됩니다."
        },
        {
          "id": "s13",
          "label": "이번엔 정상",
          "target": "check",
          "action": "complete",
          "duration": 700,
          "narration": "16장이 모두 정상으로 들어갔습니다."
        },
        {
          "id": "s14",
          "label": "완료로 이동",
          "target": "done",
          "action": "connect",
          "from": "retry",
          "duration": 700,
          "narration": "목표를 달성했습니다."
        },
        {
          "id": "s15",
          "label": "목표 달성",
          "target": "done",
          "action": "complete",
          "duration": 700,
          "narration": "완료."
        },
        {
          "id": "s16",
          "label": "목표 달성 확인",
          "target": "goal",
          "action": "complete",
          "duration": 500,
          "narration": "처음의 목표를 그대로 만족했습니다."
        },
        {
          "id": "s17",
          "label": "반복 종료",
          "target": "retry",
          "action": "complete",
          "duration": 900,
          "narration": "핵심은 이겁니다. AI는 자주 틀립니다. 그래서 확인 단계와 되돌릴 수 있는 기록이 함께 있어야 합니다."
        }
      ]
    },
    "chat-agent": {
      "schema": "jucoding-simulation",
      "id": "chat-agent",
      "title": "질문 → AI → 답변",
      "subtitle": "AI는 요청을 받고 결과를 만들어 돌려줍니다",
      "sceneId": "ai-agent",
      "nodes": [
        {
          "id": "question",
          "label": "질문",
          "icon": "❓",
          "note": "“이거 알려줘”"
        },
        {
          "id": "ai",
          "label": "AI",
          "icon": "🧠",
          "note": "입력의 뜻 이해"
        },
        {
          "id": "answer",
          "label": "답변",
          "icon": "💬",
          "note": "결과를 생성"
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "question",
          "to": "ai"
        },
        {
          "id": "e2",
          "from": "ai",
          "to": "answer"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "질문 카드 등장",
          "target": "question",
          "action": "show",
          "duration": 800,
          "narration": "사용자가 질문을 입력합니다."
        },
        {
          "id": "s2",
          "label": "AI로 연결",
          "target": "ai",
          "action": "connect",
          "duration": 800,
          "narration": "질문이 AI로 전달됩니다."
        },
        {
          "id": "s3",
          "label": "AI 동작",
          "target": "ai",
          "action": "activate",
          "duration": 1000,
          "narration": "AI가 입력의 뜻을 이해합니다."
        },
        {
          "id": "s4",
          "label": "답변으로 연결",
          "target": "answer",
          "action": "connect",
          "duration": 800,
          "narration": "AI가 답변을 만들기 시작합니다."
        },
        {
          "id": "s5",
          "label": "답변 생성",
          "target": "answer",
          "action": "activate",
          "duration": 1000,
          "narration": "답변 내용이 만들어집니다."
        },
        {
          "id": "s6",
          "label": "AI 완료",
          "target": "ai",
          "action": "complete",
          "duration": 500,
          "narration": "AI가 답변을 완성했습니다."
        },
        {
          "id": "s7",
          "label": "답변 완료",
          "target": "answer",
          "action": "complete",
          "duration": 800,
          "narration": "질문 → AI → 답변 흐름이 끝났습니다."
        }
      ]
    },
    "chatgpt-vs-computer-agent": {
      "schema": "jucoding-simulation",
      "id": "chatgpt-vs-computer-agent",
      "title": "ChatGPT vs 컴퓨터 Agent",
      "subtitle": "“어떻게 고쳐?” 와 “직접 고쳐.”",
      "sceneId": "chat-terminal",
      "nodes": [
        {
          "id": "me",
          "label": "나",
          "icon": "🧑",
          "note": "“이 화면을 고쳐줘”",
          "row": 0,
          "emphasis": true
        },
        {
          "id": "chatgpt",
          "label": "ChatGPT",
          "icon": "💬",
          "note": "대화로 답합니다",
          "row": 1
        },
        {
          "id": "advice",
          "label": "설명 · 코드 제안",
          "icon": "📝",
          "note": "직접 고치지는 않음",
          "row": 1
        },
        {
          "id": "agent",
          "label": "터미널 Agent",
          "icon": "⌨️",
          "note": "직접 일합니다",
          "row": 2,
          "emphasis": true
        },
        {
          "id": "files",
          "label": "실제 파일 · 실행",
          "icon": "📁",
          "note": "코드가 바로 바뀜",
          "row": 2
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "me",
          "to": "chatgpt"
        },
        {
          "id": "e2",
          "from": "chatgpt",
          "to": "advice"
        },
        {
          "id": "e3",
          "from": "me",
          "to": "agent"
        },
        {
          "id": "e4",
          "from": "agent",
          "to": "files"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "요청 등장",
          "target": "me",
          "action": "show",
          "duration": 800,
          "narration": "“이 화면을 고쳐줘”라고 말합니다."
        },
        {
          "id": "s2",
          "label": "ChatGPT 경로",
          "target": "chatgpt",
          "action": "connect",
          "duration": 900,
          "narration": "ChatGPT는 대화를 통해 답합니다."
        },
        {
          "id": "s3",
          "label": "ChatGPT 설명",
          "target": "chatgpt",
          "action": "activate",
          "duration": 1000,
          "narration": "방법을 설명하고 아이디어를 정리합니다."
        },
        {
          "id": "s4",
          "label": "제안 결과",
          "target": "advice",
          "action": "connect",
          "duration": 800,
          "narration": "수정 방법과 코드 예시를 제안합니다."
        },
        {
          "id": "s5",
          "label": "ChatGPT 완료",
          "target": "chatgpt",
          "action": "complete",
          "duration": 500,
          "narration": "대화는 여기서 끝납니다."
        },
        {
          "id": "s6",
          "label": "설명 완료",
          "target": "advice",
          "action": "complete",
          "duration": 700,
          "narration": "직접 적용하려면 사람이 코드를 옮겨야 합니다."
        },
        {
          "id": "s7",
          "label": "Agent 경로",
          "target": "agent",
          "action": "connect",
          "from": "me",
          "duration": 900,
          "narration": "터미널 Agent는 컴퓨터 안에서 일합니다."
        },
        {
          "id": "s8",
          "label": "Agent 실행",
          "target": "agent",
          "action": "activate",
          "duration": 1000,
          "narration": "파일과 명령을 직접 다룹니다."
        },
        {
          "id": "s9",
          "label": "실제 변경",
          "target": "files",
          "action": "connect",
          "duration": 800,
          "narration": "실제 파일을 수정하고 명령을 실행합니다."
        },
        {
          "id": "s10",
          "label": "Agent 완료",
          "target": "agent",
          "action": "complete",
          "duration": 400,
          "narration": "작업이 끝났습니다."
        },
        {
          "id": "s11",
          "label": "파일 완료",
          "target": "files",
          "action": "complete",
          "duration": 800,
          "narration": "대화와 Agent의 차이가 바로 이 지점입니다."
        }
      ]
    },
    "frontend-api-backend": {
      "schema": "jucoding-simulation",
      "id": "frontend-api-backend",
      "title": "Frontend → API → Backend → Database",
      "subtitle": "사용자 행동 하나가 여러 부품을 거치는 과정",
      "sceneId": "architecture",
      "nodes": [
        {
          "id": "frontend",
          "label": "프론트엔드",
          "icon": "🖥️",
          "note": "사용자가 누른 버튼"
        },
        {
          "id": "api",
          "label": "API",
          "icon": "↔️",
          "note": "요청을 넘기는 약속"
        },
        {
          "id": "backend",
          "label": "백엔드",
          "icon": "⚙️",
          "note": "검증하고 처리"
        },
        {
          "id": "database",
          "label": "데이터베이스",
          "icon": "🗄️",
          "note": "데이터를 저장",
          "emphasis": true
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "frontend",
          "to": "api"
        },
        {
          "id": "e2",
          "from": "api",
          "to": "backend"
        },
        {
          "id": "e3",
          "from": "backend",
          "to": "database"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "프론트엔드 등장",
          "target": "frontend",
          "action": "show",
          "duration": 800,
          "narration": "사용자가 화면에서 “게시글 저장”을 누릅니다."
        },
        {
          "id": "s2",
          "label": "API로 요청",
          "target": "api",
          "action": "connect",
          "duration": 800,
          "narration": "프론트엔드가 API로 요청을 보냅니다."
        },
        {
          "id": "s3",
          "label": "API 전달",
          "target": "api",
          "action": "activate",
          "duration": 900,
          "narration": "API는 서로 말 거는 약속입니다."
        },
        {
          "id": "s4",
          "label": "백엔드 처리",
          "target": "backend",
          "action": "connect",
          "duration": 800,
          "narration": "백엔드가 요청을 받습니다."
        },
        {
          "id": "s5",
          "label": "검증 · 처리",
          "target": "backend",
          "action": "activate",
          "duration": 1000,
          "narration": "백엔드가 로그인 확인과 값 검증을 수행합니다."
        },
        {
          "id": "s6",
          "label": "DB 저장 요청",
          "target": "database",
          "action": "connect",
          "duration": 800,
          "narration": "백엔드가 데이터베이스에 저장 요청을 보냅니다."
        },
        {
          "id": "s7",
          "label": "DB 저장",
          "target": "database",
          "action": "activate",
          "duration": 1000,
          "narration": "데이터베이스가 게시글을 저장합니다."
        },
        {
          "id": "s8",
          "label": "백엔드 완료",
          "target": "backend",
          "action": "complete",
          "duration": 500,
          "narration": "처리가 끝났습니다."
        },
        {
          "id": "s9",
          "label": "DB 완료",
          "target": "database",
          "action": "complete",
          "duration": 600,
          "narration": "저장이 확인되었습니다."
        },
        {
          "id": "s10",
          "label": "API 완료",
          "target": "api",
          "action": "complete",
          "duration": 400,
          "narration": "응답이 돌아옵니다."
        },
        {
          "id": "s11",
          "label": "화면 반영",
          "target": "frontend",
          "action": "complete",
          "duration": 800,
          "narration": "화면에 저장 결과가 반영됩니다."
        }
      ]
    },
    "mcp-worker": {
      "schema": "jucoding-simulation",
      "id": "mcp-worker",
      "title": "아이디어 → Agent → Worker → Remotion → 영상 완성",
      "subtitle": "판단은 Agent, 실행은 Worker가 나눠 맡습니다",
      "sceneId": "video-auto",
      "nodes": [
        {
          "id": "idea",
          "label": "아이디어",
          "icon": "💡",
          "note": "콘텐츠 주제"
        },
        {
          "id": "agent",
          "label": "Agent",
          "icon": "🤖",
          "note": "기획 · 대본 · 장면 설계",
          "emphasis": true
        },
        {
          "id": "worker",
          "label": "Worker",
          "icon": "⚙️",
          "note": "정해진 작업 실행"
        },
        {
          "id": "remotion",
          "label": "Remotion",
          "icon": "🎬",
          "note": "코드로 영상 제작"
        },
        {
          "id": "video",
          "label": "영상 완성",
          "icon": "✅",
          "note": "최종 결과물",
          "emphasis": true
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "idea",
          "to": "agent"
        },
        {
          "id": "e2",
          "from": "agent",
          "to": "worker"
        },
        {
          "id": "e3",
          "from": "worker",
          "to": "remotion"
        },
        {
          "id": "e4",
          "from": "remotion",
          "to": "video"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "아이디어 등장",
          "target": "idea",
          "action": "show",
          "duration": 800,
          "narration": "영상 주제 아이디어가 들어옵니다."
        },
        {
          "id": "s2",
          "label": "Agent 기획",
          "target": "agent",
          "action": "connect",
          "duration": 800,
          "narration": "Agent가 기획과 대본을 설계합니다."
        },
        {
          "id": "s3",
          "label": "Agent 판단",
          "target": "agent",
          "action": "activate",
          "duration": 1000,
          "narration": "무엇을 만들지 판단하고 작업 목록을 냅니다."
        },
        {
          "id": "s4",
          "label": "Worker 실행",
          "target": "worker",
          "action": "connect",
          "duration": 800,
          "narration": "Worker가 정해진 작업을 수행합니다."
        },
        {
          "id": "s5",
          "label": "Worker 작업 중",
          "target": "worker",
          "action": "activate",
          "duration": 1100,
          "narration": "Asset 생성, 렌더링 설정처럼 정해진 일만 수행합니다."
        },
        {
          "id": "s6",
          "label": "Worker 완료",
          "target": "worker",
          "action": "complete",
          "duration": 500,
          "narration": "작업 결과가 넘어옵니다."
        },
        {
          "id": "s7",
          "label": "Remotion 렌더",
          "target": "remotion",
          "action": "connect",
          "duration": 800,
          "narration": "Remotion이 코드로 장면을 렌더링합니다."
        },
        {
          "id": "s8",
          "label": "렌더링 중",
          "target": "remotion",
          "action": "activate",
          "duration": 1100,
          "narration": "같은 코드로 다시 실행하면 같은 영상이 나옵니다."
        },
        {
          "id": "s9",
          "label": "Remotion 완료",
          "target": "remotion",
          "action": "complete",
          "duration": 500,
          "narration": "QA를 돌릴 수 있는 상태가 됐습니다."
        },
        {
          "id": "s10",
          "label": "영상 완성",
          "target": "video",
          "action": "connect",
          "duration": 800,
          "narration": "QA를 통과하면 최종 영상이 나옵니다."
        },
        {
          "id": "s11",
          "label": "완료 표시",
          "target": "video",
          "action": "complete",
          "duration": 800,
          "narration": "아이디어에서 영상 완성까지 이어지는 흐름입니다."
        }
      ]
    },
    "safety-boundary": {
      "schema": "jucoding-simulation",
      "id": "safety-boundary",
      "title": "Local Test → External Action 감지 → Human Approval → 실제 실행",
      "subtitle": "화면 밖으로 나가는 행동은 사람이 승인합니다",
      "sceneId": "safety",
      "nodes": [
        {
          "id": "local",
          "label": "Local Test",
          "icon": "🧪",
          "note": "내 화면 안 · 낮은 위험"
        },
        {
          "id": "detect",
          "label": "External Action 감지",
          "icon": "🔎",
          "note": "화면 밖 영향 확인",
          "emphasis": true
        },
        {
          "id": "hold",
          "label": "보류",
          "icon": "⏸️",
          "note": "승인 전까지 실행 안 함",
          "row": 1
        },
        {
          "id": "approval",
          "label": "Human Approval",
          "icon": "👤",
          "note": "사람이 직접 확인",
          "emphasis": true
        },
        {
          "id": "execute",
          "label": "실제 실행",
          "icon": "🚀",
          "note": "승인 후에만 진행"
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "local",
          "to": "detect"
        },
        {
          "id": "e2",
          "from": "detect",
          "to": "hold",
          "curve": true
        },
        {
          "id": "e3",
          "from": "hold",
          "to": "approval",
          "curve": true
        },
        {
          "id": "e4",
          "from": "approval",
          "to": "execute"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "로컬 테스트",
          "target": "local",
          "action": "show",
          "duration": 800,
          "narration": "먼저 내 화면 안에서 가짜 데이터로 시험합니다."
        },
        {
          "id": "s2",
          "label": "로컬 테스트 실행",
          "target": "local",
          "action": "activate",
          "duration": 1000,
          "narration": "여기서는 위험이 상대적으로 낮습니다."
        },
        {
          "id": "s3",
          "label": "외부 영향 감지",
          "target": "detect",
          "action": "connect",
          "duration": 800,
          "narration": "이 행동이 화면 밖으로 나가는지 확인합니다."
        },
        {
          "id": "s4",
          "label": "감지 결과",
          "target": "detect",
          "action": "activate",
          "duration": 1100,
          "narration": "실제 서비스나 사람에게 영향을 주면 위험이 높습니다."
        },
        {
          "id": "s5",
          "label": "실행 보류",
          "target": "hold",
          "action": "connect",
          "duration": 900,
          "narration": "승인이 나기 전까지 실행하지 않고 멈춰 둡니다.",
          "emphasis": true
        },
        {
          "id": "s6",
          "label": "보류 유지",
          "target": "hold",
          "action": "activate",
          "duration": 1000,
          "narration": "멈춰 둘 수 있어야 안전한 자동화입니다."
        },
        {
          "id": "s7",
          "label": "사람 승인",
          "target": "approval",
          "action": "connect",
          "duration": 800,
          "narration": "사람이 무엇이 실행되는지 직접 확인합니다."
        },
        {
          "id": "s8",
          "label": "승인 확인",
          "target": "approval",
          "action": "activate",
          "duration": 1100,
          "narration": "승인한 범위 안에서만 다음 단계로 넘어갑니다."
        },
        {
          "id": "s9",
          "label": "승인 완료",
          "target": "approval",
          "action": "complete",
          "duration": 500,
          "narration": "이제 실행해도 됩니다."
        },
        {
          "id": "s10",
          "label": "실제 실행",
          "target": "execute",
          "action": "connect",
          "duration": 800,
          "narration": "승인된 행동만 실제로 실행합니다."
        },
        {
          "id": "s11",
          "label": "실행 완료",
          "target": "execute",
          "action": "complete",
          "duration": 800,
          "narration": "기록을 남기고 마칩니다."
        }
      ]
    },
    "sns-automation": {
      "schema": "jucoding-simulation",
      "id": "sns-automation",
      "title": "자료 → SNS Worker → 사람 승인 → 게시",
      "subtitle": "자동화의 핵심은 사람이 통제할 지점을 남기는 것",
      "sceneId": "sns-auto",
      "nodes": [
        {
          "id": "source",
          "label": "자료 · 콘텐츠",
          "icon": "📝",
          "note": "원본 자료"
        },
        {
          "id": "worker",
          "label": "SNS Worker",
          "icon": "⚙️",
          "note": "문구 · 이미지 정리"
        },
        {
          "id": "approval",
          "label": "사람 승인",
          "icon": "👀",
          "note": "게시 전 반드시 확인",
          "emphasis": true
        },
        {
          "id": "publish",
          "label": "공식 API 게시",
          "icon": "📤",
          "note": "인증된 통로만 사용"
        },
        {
          "id": "result",
          "label": "결과 확인",
          "icon": "📊",
          "note": "조회 · 반응 기록"
        }
      ],
      "edges": [
        {
          "id": "e1",
          "from": "source",
          "to": "worker"
        },
        {
          "id": "e2",
          "from": "worker",
          "to": "approval"
        },
        {
          "id": "e3",
          "from": "approval",
          "to": "publish"
        },
        {
          "id": "e4",
          "from": "publish",
          "to": "result"
        }
      ],
      "steps": [
        {
          "id": "s1",
          "label": "자료 등장",
          "target": "source",
          "action": "show",
          "duration": 800,
          "narration": "게시할 원본 자료가 들어옵니다."
        },
        {
          "id": "s2",
          "label": "Worker 정리",
          "target": "worker",
          "action": "connect",
          "duration": 800,
          "narration": "SNS Worker가 문구와 이미지를 정리합니다."
        },
        {
          "id": "s3",
          "label": "초안 생성",
          "target": "worker",
          "action": "activate",
          "duration": 1000,
          "narration": "게시 가능한 초안을 만듭니다."
        },
        {
          "id": "s4",
          "label": "승인 요청",
          "target": "approval",
          "action": "connect",
          "duration": 800,
          "narration": "이제 사람이 확인할 차례입니다."
        },
        {
          "id": "s5",
          "label": "사람 확인",
          "target": "approval",
          "action": "activate",
          "duration": 1200,
          "narration": "문구와 이미지를 사람이 직접 확인하고 승인합니다.",
          "emphasis": true
        },
        {
          "id": "s6",
          "label": "승인 완료",
          "target": "approval",
          "action": "complete",
          "duration": 600,
          "narration": "승인된 초안만 다음으로 넘어갑니다."
        },
        {
          "id": "s7",
          "label": "API 게시",
          "target": "publish",
          "action": "connect",
          "duration": 800,
          "narration": "공식 API로만 게시합니다."
        },
        {
          "id": "s8",
          "label": "업로드 실행",
          "target": "publish",
          "action": "activate",
          "duration": 1000,
          "narration": "Worker가 업로드를 실행합니다."
        },
        {
          "id": "s9",
          "label": "게시 완료",
          "target": "publish",
          "action": "complete",
          "duration": 500,
          "narration": "게시가 끝났습니다."
        },
        {
          "id": "s10",
          "label": "결과 확인",
          "target": "result",
          "action": "connect",
          "duration": 800,
          "narration": "조회와 반응을 기록합니다."
        },
        {
          "id": "s11",
          "label": "완료 표시",
          "target": "result",
          "action": "complete",
          "duration": 800,
          "narration": "자동화는 반복을 줄이고 통제 지점은 남깁니다."
        }
      ]
    }
  }
};
})(typeof window !== 'undefined' ? window : globalThis);
