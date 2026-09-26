'use strict';

// JuCoding V4 lecture player.
//
// Separation of concerns (V4.1):
//   DATA  — src/content/v4/curriculum.json + scenes/*.json + simulations/*.json,
//           compiled into window.JUCODING_V4_CONTENT by scripts/build-v4-content.js.
//           Chapter order, scene order, titles, instructor cues and simulation
//           wiring all come from here. The Archive Update Engine only ever edits
//           this kind of data; it never touches this file.
//   CODE  — the SCENE_RENDERERS map below: visual markup only, one function per
//           scene id, and no teaching copy.

(() => {
  const stage = document.getElementById('stage');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const chapterLabel = document.getElementById('chapter-label');
  const sceneCounter = document.getElementById('scene-counter');
  const progressBar = document.getElementById('progress-bar');
  const cue = document.getElementById('speaker-cue');
  const cueTitle = document.getElementById('cue-title');
  const cueSummary = document.getElementById('cue-summary');
  const cueBody = document.getElementById('cue-body');
  const cueExtra = document.getElementById('cue-extra');
  const chapterDialog = document.getElementById('chapter-dialog');
  const chapterGrid = document.getElementById('chapter-grid');
  const mapDialog = document.getElementById('map-dialog');

  const CONTENT = window.JUCODING_V4_CONTENT;
  if (!CONTENT || !Array.isArray(CONTENT.scenes) || !CONTENT.scenes.length) {
    stage.innerHTML = '<div class="scene center"><h1 class="hero">강의 내용을 불러오지 못했습니다.</h1>'
      + '<p class="lead">content-registry.js가 필요합니다. node scripts/build-v4-content.js 로 다시 만드세요.</p></div>';
    return;
  }

  const chapters = CONTENT.chapters;
  const simulations = CONTENT.simulations || {};
  const sceneData = CONTENT.scenes;

  // ---------------------------------------------------------------------------
  // Visual layer: one renderer per scene id. No teaching copy lives here.
  // ---------------------------------------------------------------------------
  const header = (kicker, title, sub) => `
    <div class="scene-header">
      <div>
        <span class="kicker">${kicker}</span>
        <h1 class="scene-title">${title}</h1>
        ${sub ? `<p class="scene-sub">${sub}</p>` : ''}
      </div>
    </div>`;

  const ASSET_BASE = '../../assets/lecture/v4/';
  const assetFigure = (file, title, caption, hero) => `
    <figure class="v4-asset-figure${hero ? ' v4-asset-hero' : ''}">
      <img src="${ASSET_BASE}${file}" alt="${title}" data-asset-full="${ASSET_BASE}${file}" data-asset-title="${title}" data-asset-cap="${caption}">
      <figcaption><b>${title} · 클릭하면 크게 보기</b>${caption}<br><small>수업용 로컬 자료 · 인터넷 없이 표시됩니다</small></figcaption>
    </figure>`;

  const SCENE_RENDERERS = {
    cover: () => `
        <div class="scene center" style="position:relative">
          <span class="kicker">3시간 스터디 · 왕초보용</span>
          <h1 class="hero"><span class="grad">AI · Agent · 바이브코딩</span></h1>
          <p class="lead">AI에게 물어보는 것에서 시작해서, Agent에게 일을 맡기고,<br>결국 내가 원하는 도구와 공간까지 만드는 흐름을 한 번에 이해합니다.</p>
          ${assetFigure('ai-agent-vibecoding.webp', 'AI · Agent · 바이브코딩 개념도', '제1장 대표 자료. AI라는 큰 범주 안에서 Agent가 목표를 향해 행동하고, 그 협업 방식이 바이브코딩임을 한 장으로 정리합니다.', true)}
          <div class="robot-hero" aria-hidden="true"></div>
          <span class="float-chip chip-ai">AI</span><span class="float-chip chip-agent">Agent</span><span class="float-chip chip-vibe">Vibe Coding</span>
        </div>`,
    spaces: () => `
        <div class="scene">
          ${header('왜 바이브코딩인가?', '우리는 지금까지 <span class="grad">만들어진 공간</span>을 사용했습니다.', '좋은 서비스는 이미 정해진 목적에 맞춰 아주 편리하게 만들어져 있습니다.')}
          <div class="space-row">
            <div class="space"><span class="logo youtube">▶</span><div><b>YouTube</b><small>영상 업로드 · 공유 공간</small></div></div>
            <div class="space"><span class="logo notion">N</span><div><b>Notion</b><small>기록 · 정리 공간</small></div></div>
            <div class="space"><span class="logo excel">X</span><div><b>Excel</b><small>표 · 숫자 · 데이터 공간</small></div></div>
          </div>
          <div class="big-quote">“그런데 <span style="color:#6a50ec">내가 원하는 방식으로</span> AI와 Agent가 일할 공간은?”</div>
        </div>`,
    vibe: () => `
        <div class="scene">
          ${header('WHY VIBE CODING', '내 일에 맞는 <span class="grad">도구와 공간</span>을 직접 만듭니다.', '처음부터 모든 코드를 직접 작성하지 않아도, 원하는 결과를 설명하고 확인하며 반복할 수 있습니다.')}
          <div class="formula">
            <div class="formula-item"><div class="icon">🌐</div><strong>오픈소스</strong><span>이미 만들어진 열린 기술</span></div>
            <div class="formula-sign">+</div>
            <div class="formula-item"><div class="icon">✨</div><strong>AI</strong><span>설명하고 구현을 돕는 도구</span></div>
            <div class="formula-sign">+</div>
            <div class="formula-item"><div class="icon">💡</div><strong>내 아이디어</strong><span>나만의 문제와 방식</span></div>
            <div class="formula-sign">=</div>
            <div class="formula-item" style="border-color:#b9aaff;background:#f5f1ff"><div class="icon">🧊</div><strong>나만의 도구</strong><span>내 방식대로 일하는 공간</span></div>
          </div>
          <div class="process">
              <div class="process-node"><div class="e">🗣️</div><b>원하는 것 설명</b><span>목표와 상황을 말함</span></div><div class="process-arrow">→</div>
              <div class="process-node"><div class="e">🤖</div><b>AI가 구현</b><span>코드 · 화면 · 구조 제작</span></div><div class="process-arrow">→</div>
              <div class="process-node"><div class="e">👀</div><b>사람이 확인</b><span>원하는 결과인지 확인</span></div><div class="process-arrow">→</div>
              <div class="process-node"><div class="e">🔁</div><b>수정 반복</b><span>점점 내 방식에 맞춤</span></div>
            </div>
        </div>`,
    'ai-agent': () => `
        <div class="scene">
          ${header('AI VS AGENT', '대답하는 AI에서, <span class="grad">행동하는 Agent</span>로', '지능의 높고 낮음이 아니라 “목표를 받고 실제 행동까지 이어지는가”가 핵심입니다.')}
          <div class="compare">
            <div class="compare-box" style="background:linear-gradient(180deg,#eef7ff,#fff)">
              <div class="compare-title"><span class="num">01</span> AI <small>질문 → 답변</small></div>
              <div class="step-flow">
                <div class="step"><div class="emoji">❓</div><b>질문</b><span>“이거 알려줘”</span></div><span class="arr">→</span>
                <div class="step"><div class="emoji">🧠</div><b>생각</b><span>입력을 이해</span></div><span class="arr">→</span>
                <div class="step"><div class="emoji">💬</div><b>답변</b><span>결과를 생성</span></div>
              </div>
            </div>
            <div class="compare-box" style="background:linear-gradient(180deg,#f7f0ff,#fff)">
              <div class="compare-title"><span class="num">02</span> Agent <small>목표 → 행동 → 확인 → 반복</small></div>
              <div class="step-flow">
                <div class="step"><div class="emoji">🎯</div><b>목표</b><span>“이걸 완성해줘”</span></div><span class="arr">→</span>
                <div class="step"><div class="emoji">🛠️</div><b>도구</b><span>필요한 도구 사용</span></div><span class="arr">→</span>
                <div class="step"><div class="emoji">✅</div><b>확인</b><span>결과 검토</span></div><span class="arr">→</span>
                <div class="step"><div class="emoji">🔁</div><b>반복</b><span>필요하면 재시도</span></div><span class="arr">→</span>
                <div class="step"><div class="emoji">🏆</div><b>완료</b><span>목표 달성</span></div>
              </div>
            </div>
          </div>
        </div>`,
    'chat-terminal': () => `
        <div class="scene">
          ${header('AI를 쓰는 두 가지 경험', '대화형 AI와 <span class="grad">컴퓨터에서 일하는 Agent</span>', '둘 다 유용하지만 할 수 있는 행동 범위가 다릅니다.')}
          <div class="agent-compare">
            <div class="agent-card" style="background:linear-gradient(180deg,#eefaff,#fff)"><h3>💬 ChatGPT</h3><p>대화를 통해 설명하고 아이디어를 정리하는 데 강합니다.</p><div class="agent-mini-flow"><span>질문</span><i>→</i><span>아이디어 정리</span><i>→</i><span>답변</span></div></div>
            <div class="agent-card" style="background:linear-gradient(180deg,#f5f0ff,#fff)"><h3>⌨️ 터미널 Agent</h3><p>내 컴퓨터의 파일을 읽고, 명령을 실행하고, 코드를 직접 수정할 수 있습니다.</p><div class="agent-mini-flow"><span>목표</span><i>→</i><span>파일 수정</span><i>→</i><span>코드 실행</span><i>→</i><span>테스트</span></div></div>
          </div>
          <div class="big-quote">ChatGPT: “<b>어떻게</b> 고쳐?” &nbsp;&nbsp; ↔ &nbsp;&nbsp; Agent: “<b>직접</b> 고쳐.”</div>
          ${assetFigure('chat-ai-vs-computer-agent.webp', '대화형 AI와 컴퓨터 Agent 비교표', '제2장 보조 자료이자 유인물. 화면 속 요금제·모델 순위는 수시로 바뀌므로 참고용으로만 보고 핵심 차이인 행동 범위에 집중합니다.', false)}
        </div>`,
    'web-terms': () => `
        <div class="scene">
          ${header('처음 만나는 개발 용어', '기본 용어 <span class="grad">쉽게 이해하기</span>', '어려운 기술 이름보다 먼저 “무슨 역할인지”를 눈으로 이해합니다.')}
          <div class="term-grid">
            <div class="term-card frontend"><span class="num">01</span><div class="term-art">🖥️</div><div><h3>프론트엔드</h3><strong>= 보이는 곳</strong><p>사용자가 직접 보고 클릭하는 화면을 만드는 부분</p></div></div>
            <div class="term-card backend"><span class="num">02</span><div class="term-art">⚙️</div><div><h3>백엔드</h3><strong>= 뒤에서 일하는 곳</strong><p>요청을 처리하고 필요한 일을 수행하는 부분</p></div></div>
            <div class="term-card api"><span class="num">03</span><div class="term-art">↔️</div><div><h3>API</h3><strong>= 서로 말 거는 방법</strong><p>서로 다른 프로그램이 데이터를 주고받는 약속</p></div></div>
            <div class="term-card database"><span class="num">04</span><div class="term-art">🗄️</div><div><h3>데이터베이스</h3><strong>= 기억하는 곳</strong><p>필요한 데이터를 저장하고 다시 꺼내는 곳</p></div></div>
          </div>
          ${assetFigure('beginner-dev-terms.webp', '기초 개발 용어 정리도', '제3장 대표 자료. 프론트엔드·백엔드·API·데이터베이스와 GUI·TUI·CLI 관계를 한 장으로 복습합니다.', false)}
        </div>`,
    architecture: () => `
        <div class="scene">
          ${header('한눈에 보는 구조', '이렇게 연결되어 <span class="grad">하나의 서비스</span>가 동작합니다.', '각 부품은 따로 외우는 것이 아니라 서로 연결되어 움직입니다.')}
          <div class="arch">
            <div class="arch-node"><div class="bubble-icon">🖥️</div><b>프론트엔드</b><span>보이는 화면</span></div><span class="arch-arrow">↔</span>
            <div class="arch-node"><div class="bubble-icon">💬</div><b>API</b><span>요청 · 응답</span></div><span class="arch-arrow">↔</span>
            <div class="arch-node"><div class="bubble-icon">⚙️</div><b>백엔드</b><span>뒤에서 처리</span></div><span class="arch-arrow">↔</span>
            <div class="arch-node"><div class="bubble-icon">🗄️</div><b>데이터베이스</b><span>데이터 저장</span></div>
          </div>
          <div class="big-quote" style="font-size:25px">사용자 행동 하나도 사실은 <span style="color:#684fe8">여러 부품이 대화하는 과정</span>입니다.</div>
        </div>`,
    'ui-terms': () => `
        <div class="scene">
          ${header('화면과 조작 방식', 'GUI · TUI · CLI를 <span class="grad">한 번에</span>', '이 용어는 “어떤 방식으로 프로그램을 조작하는가?”를 설명합니다.')}
          <div class="mini-terms">
            <div class="mini-term"><b>GUI</b><span>= 그림으로 조작하는 화면</span><div class="term-art">🪟</div><p class="micro">예: 웹사이트, 일반 앱</p></div>
            <div class="mini-term"><b>TUI</b><span>= 터미널 안에서 조작하는 화면</span><div class="terminal-mini">AGENT 1  WORKING<br>AGENT 2  IDLE<br>QA       PASS</div></div>
            <div class="mini-term"><b>CLI</b><span>= 명령어를 입력하는 방식</span><div class="terminal-mini">$ git status<br>$ npm run dev<br>$ codex</div></div>
          </div>
        </div>`,
    'planning-terms-a': () => `
        <div class="scene">
          ${header('프로젝트 만들기 전에', '어려운 단어를 <span class="grad">쉬운 말로</span> 바꾸기', '좋은 프로젝트는 코딩보다 먼저 생각을 정리하는 데서 시작합니다.')}
          <div class="docs-grid">
            <div class="doc-card"><span class="tag">01</span><h3>PRD</h3><strong>= 기획서</strong><p>무엇을 왜 만들고 어떤 기능이 필요한지 정리</p></div>
            <div class="doc-card"><span class="tag">02</span><h3>WBS</h3><strong>= 할 일 목록</strong><p>프로젝트를 작은 작업으로 나누고 순서 정리</p></div>
            <div class="doc-card"><span class="tag">03</span><h3>Wireframe</h3><strong>= 화면 스케치</strong><p>화면에 무엇이 어디에 있을지 미리 그린 도면</p></div>
            <div class="doc-card"><span class="tag">04</span><h3>Prototype</h3><strong>= 눌러보는 시제품</strong><p>완성 전 실제 사용 흐름을 미리 확인하는 모형</p></div>
          </div>
          ${assetFigure('project-planning-terms.webp', '프로젝트 기획 용어 정리도', '제4장 대표 자료. PRD·WBS·Wireframe·Prototype·ERD·DBML·SSOT가 프로젝트의 어느 단계에서 쓰이는지 한 장으로 정리합니다.', false)}
        </div>`,
    'planning-terms-b': () => `
        <div class="scene">
          ${header('데이터와 기준 정리', 'ERD · DBML · <span class="grad">SSOT</span>', '데이터를 어떻게 기억할지, 그리고 프로젝트의 최종 기준이 무엇인지 정합니다.')}
          <div class="grid three">
            <div class="card soft-blue"><span class="num">05</span><div class="icon">🔗</div><h3>ERD = 데이터 관계 그림</h3><p>회원, 게시글, 댓글 같은 데이터가 서로 어떤 관계인지 그림으로 표현합니다.</p></div>
            <div class="card soft-pink"><span class="num">06</span><div class="icon">⌨️</div><h3>DBML = 데이터 구조를 글로 표현</h3><p>데이터베이스 구조를 코드처럼 읽기 쉬운 글로 작성합니다.</p></div>
            <div class="card soft-purple"><span class="num">07</span><div class="icon">📌</div><h3>SSOT = 최종 기준 문서</h3><p>의견이 다를 때 “이 문서가 최종 기준”이라고 정한 하나의 기준점입니다.</p></div>
          </div>
          <div class="big-quote" style="font-size:23px">A 문서엔 로그인 있음 / B 문서엔 로그인 없음 → “<b>그래서 뭐가 맞아?</b>” → SSOT가 필요</div>
        </div>`,
    'project-flow': () => `
        <div class="scene">
          ${header('PROJECT FLOW', '아이디어가 <span class="grad">실제 프로그램</span>이 되는 과정', '완벽하게 한 번에 만드는 것이 아니라 작은 단계를 반복합니다.')}
          <div class="process">
            <div class="process-node"><div class="e">💡</div><b>아이디어</b><span>무슨 문제를 해결?</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">📋</div><b>기획</b><span>PRD · WBS</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">🪟</div><b>화면</b><span>Wireframe · Prototype</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">🗄️</div><b>데이터</b><span>ERD · DBML</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">💻</div><b>구현</b><span>AI와 기능 제작</span></div>
          </div>
        </div>`,
    'project-form': () => `
        <div class="scene">
          ${header('간단 실습', '내 첫 프로젝트를 <span class="grad">3문장으로</span> 정리하기', '처음부터 완벽한 기획서가 필요하지 않습니다.')}
          <div class="form-card">
            <div class="form-fields">
              <div class="field"><label>1. 무엇을 만들고 싶나요?</label><input id="project-what" placeholder="예: 모임 자료를 자동으로 정리하는 앱"></div>
              <div class="field"><label>2. 누가 사용할까요?</label><input id="project-who" placeholder="예: 나와 스터디 멤버"></div>
              <div class="field"><label>3. 가장 중요한 기능은?</label><textarea id="project-core" placeholder="예: 메모를 넣으면 AI가 회차별 자료로 정리"></textarea></div>
              <button id="project-build" class="form-button" type="button">간단 기획 만들기</button>
            </div>
            <div class="output-card"><h3>📝 프로젝트 초안</h3><pre id="project-plan-output">왼쪽에 3가지만 적으면\n여기에 간단한 프로젝트 초안이 만들어집니다.</pre></div>
          </div>
        </div>`,
    'dev-deploy': () => `
        <div class="scene">
          ${header('실행되는 장소', '개발서버는 내 작업실, <span class="grad">배포는 세상에 공개</span>', '만든 프로그램을 어디서 실행하고 누구에게 보여줄지 이해합니다.')}
          <div class="deploy-grid">
            <div class="deploy-card"><h3>🏠 개발서버 = 내 작업실</h3><p>내 컴퓨터에서 코드를 수정하고 바로 확인하는 개발 중 공간입니다.</p><div class="deploy-visual"><div class="v">💻</div><span>→</span><div class="v" style="font-size:17px;font-weight:900">localhost<br><small>내 컴퓨터</small></div></div></div>
            <div class="deploy-card"><h3>🌍 배포 = 다른 사람도 쓰는 공간</h3><p>인터넷 서버에 올려 다른 사람이 URL로 접속할 수 있게 합니다.</p><div class="deploy-visual"><div class="v">💻</div><span>→</span><div class="v">☁️</div><span>→</span><div class="v">👥</div></div></div>
          </div>
        </div>`,
    git: () => `
        <div class="scene">
          ${header('기록과 공유', 'Git과 GitHub는 <span class="grad">같은 것이 아닙니다.</span>', '코드를 안전하게 기록하고, 온라인에서 보관하고, 다른 사람과 공유합니다.')}
          <div class="git-compare">
            <div class="git-card" style="background:linear-gradient(180deg,#fff4ee,#fff)"><div class="git-logo">🔀</div><h3>Git</h3><strong>= 변경 기록</strong><p>내 코드가 어떻게 바뀌었는지 기록합니다. 필요하면 이전 상태로 돌아갈 수 있습니다.</p></div>
            <div class="git-card" style="background:linear-gradient(180deg,#f1f3f8,#fff)"><div class="git-logo">🐙</div><h3>GitHub</h3><strong>= 온라인 저장소 · 협업 공간</strong><p>Git으로 기록한 프로젝트를 인터넷에 올려 보관하고 공유합니다.</p></div>
          </div>
          <div class="process"><div class="process-node"><div class="e">📄</div><b>파일 수정</b><span>오늘 작업</span></div><div class="process-arrow">→</div><div class="process-node"><div class="e">📸</div><b>Git 기록</b><span>Commit</span></div><div class="process-arrow">→</div><div class="process-node"><div class="e">☁️</div><b>GitHub</b><span>Push · 공유</span></div></div>
        </div>`,
    'program-choice': () => `
        <div class="scene">
          ${header('PROGRAM TYPE', '어디에서 사용할지에 따라 <span class="grad">형태가 달라집니다.</span>', '기술부터 고르는 것이 아니라 “누가 어디서 쓰는가?”부터 생각합니다.')}
          <div class="grid four">
            <div class="card soft-blue"><div class="icon">🌐</div><h3>웹</h3><p>브라우저에서 사용. 링크 하나로 공유하기 쉬움.</p></div>
            <div class="card soft-purple"><div class="icon">🖥️</div><h3>PC 앱</h3><p>Windows/macOS에서 실행. 로컬 파일·OS 기능 활용에 좋음.</p></div>
            <div class="card soft-green"><div class="icon">📱</div><h3>모바일 앱</h3><p>휴대폰 중심 사용 경험. 카메라·센서 활용 가능.</p></div>
            <div class="card soft-orange"><div class="icon">⌨️</div><h3>CLI / TUI</h3><p>터미널 중심. 빠른 자동화와 개발 도구에 적합.</p></div>
          </div>
        </div>`,
    mcp: () => `
        <div class="scene">
          ${header('AI + TOOLS', 'MCP = AI가 다른 도구를 <span class="grad">사용하게 연결하는 방식</span>', 'Agent가 말만 하는 것을 넘어 브라우저, 파일, DB, 디자인 도구 등을 사용하도록 연결할 수 있습니다.')}
          <div class="mcp-center">
            <div class="mcp-card"><h3 style="font-size:27px;margin-top:0">쉽게 말하면</h3><div class="big-quote" style="font-size:24px;box-shadow:none">AI에게 <b style="color:#674fe9">손과 도구함</b>을 연결하는 공통 규격</div><p style="color:#6d7691;line-height:1.7">MCP 자체가 일을 하는 것은 아닙니다. Agent가 어떤 도구를 발견하고 호출할 수 있도록 연결해주는 방식입니다.</p></div>
            <div class="mcp-card mcp-hub"><div class="mcp-core">MCP</div><span class="tool-orbit tool-1">🌐 브라우저</span><span class="tool-orbit tool-2">📁 파일</span><span class="tool-orbit tool-3">🎨 디자인</span><span class="tool-orbit tool-4">🗄️ DB</span></div>
          </div>
          ${assetFigure('automation-deploy-mcp.webp', '배포 · MCP · Agent · Worker 정리도', '제6장 대표 자료. 배포 흐름과 MCP 연결, Agent의 판단과 Worker의 실행 분담을 한 장으로 정리합니다.', false)}
        </div>`,
    'video-auto': () => `
        <div class="scene">
          ${header('실전 예시 ①', '영상 제작을 <span class="grad">작업 흐름</span>으로 만들기', '한 번의 마법 버튼보다 역할을 나눠 연결하면 자동화가 이해하기 쉽습니다.')}
          <div class="workflow">
            <div class="work-node"><div class="we">💡</div><b>아이디어</b><span>콘텐츠 주제</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">🤖</div><b>Agent</b><span>기획 · 대본 · 장면 설계</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">⚙️</div><b>Worker</b><span>필요 작업 실행</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">🎬</div><b>Remotion</b><span>코드로 영상 제작</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">🔎</div><b>QA</b><span>문제 확인 · 수정</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">✅</div><b>완성</b><span>최종 영상</span></div>
          </div>
        </div>`,
    'sns-auto': () => `
        <div class="scene">
          ${header('실전 예시 ②', 'SNS도 <span class="grad">Agent + Worker</span>로 연결하기', '반복 작업을 줄이되, 게시 승인과 플랫폼 정책은 사람이 통제합니다.')}
          <div class="workflow">
            <div class="work-node"><div class="we">📝</div><b>콘텐츠 초안</b><span>Agent가 문구 정리</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">👀</div><b>사람 승인</b><span>문구 · 이미지 확인</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">🔌</div><b>SNS API</b><span>공식 연결 사용</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">📤</div><b>Worker</b><span>업로드 실행</span></div><span class="work-arrow">→</span>
            <div class="work-node"><div class="we">📊</div><b>결과 확인</b><span>조회 · 반응 기록</span></div>
          </div>
          <div class="big-quote" style="font-size:22px">자동화의 핵심은 “사람을 없애기”가 아니라 <span style="color:#674fe9">반복을 줄이고 통제 지점을 남기는 것</span></div>
        </div>`,
    'automation-form': () => `
        <div class="scene">
          ${header('마무리 실습', '내가 반복하는 일 하나를 <span class="grad">자동화 흐름</span>으로 바꾸기', '입력 · 처리 · 결과 세 가지만 정리해도 첫 자동화 설계가 됩니다.')}
          <div class="form-card">
            <div class="form-fields">
              <div class="field"><label>반복해서 하는 일</label><input id="auto-task" placeholder="예: 매일 재고를 종이에 적음"></div>
              <div class="field"><label>AI/Agent에게 맡기고 싶은 일</label><input id="auto-worker" placeholder="예: 사진을 읽고 품목별 수량 정리"></div>
              <div class="field"><label>최종 결과</label><input id="auto-result" placeholder="예: 날짜별 재고표 자동 저장"></div>
              <button id="auto-build" class="form-button" type="button">자동화 흐름 보기</button>
            </div>
            <div class="output-card"><h3>⚡ 자동화 흐름</h3><pre id="auto-output">반복 업무를 3단계로 적어보세요.\n\n입력 → Agent/Worker → 결과</pre></div>
          </div>
        </div>`,
    safety: () => `
        <div class="scene">
          ${header('SAFETY BOUNDARY', '화면 밖으로 나가면 <span class="grad">더 강한 확인</span>이 필요합니다.', '화면 안의 실험이 항상 안전한 것은 아닙니다. 어디까지가 낮은 위험이고 어디부터 확인이 필요한지 경계를 그어봅니다.')}
          ${assetFigure('safety-boundary.webp', '안전 경계 정리도', '마무리 안전 수업의 핵심 자료. 클릭해서 크게 띄우고 한 장씩 짚으며 설명합니다.', true)}
          <div class="risk-grid">
            <div class="risk-card low"><h3>🟢 상대적으로 위험이 낮은 쪽 · 내 화면 안</h3><ul><li>자료 조사·검색</li><li>가짜·예시 데이터로 테스트</li><li>내 컴퓨터에서 실행</li><li>공개 전 초안 작성</li></ul></div>
            <div class="risk-card high"><h3>🔴 강한 확인이 필요한 쪽 · 화면 밖</h3><ul><li>실제 결제 API 호출</li><li>운영 데이터베이스 쓰기</li><li>공개·SNS 게시</li><li>외부 계정 설정 변경</li><li>다른 사람·서비스에 영향을 주는 행동</li></ul></div>
          </div>
          <div class="big-quote" style="font-size:20px">내 화면 안의 실험은 보통 위험이 낮고, 화면 밖의 실제 서비스·사람에게 영향을 주는 행동은 <span style="color:#674fe9">더 강한 확인</span>이 필요하다.</div>
        </div>`,
    summary: () => `
        <div class="scene">
          ${header('WRAP UP', '오늘 배운 것은 사실 <span class="grad">하나의 흐름</span>입니다.', 'AI를 이해하고, 프로젝트를 기획하고, 프로그램을 만들고, Agent가 일할 수 있는 공간으로 확장합니다.')}
          <div class="summary-grid">
            <div class="summary-card"><b>AI</b><p>생각과 생성을 도와주는 기술</p></div>
            <div class="summary-card"><b>Agent</b><p>목표를 받고 도구를 사용해 행동하는 AI 시스템</p></div>
            <div class="summary-card"><b>바이브코딩</b><p>AI와 대화하며 내가 원하는 프로그램을 만드는 방식</p></div>
            <div class="summary-card"><b>Front / Back / API / DB</b><p>내 프로그램을 구성하는 기본 부품</p></div>
            <div class="summary-card"><b>PRD / WBS / ERD / SSOT</b><p>만들기 전에 생각과 기준을 정리하는 방법</p></div>
            <div class="summary-card"><b>MCP / Worker</b><p>Agent가 실제 도구를 사용해 일하도록 연결하는 방법</p></div>
          </div>
          <div class="big-quote" style="text-align:center">다음은 “아는 것”보다 <span style="color:#674fe9">직접 하나 만들어보는 것</span>입니다.</div>
        </div>`
  };

  // Data order wins; the renderer map only supplies markup. A scene id with no
  // renderer is reported instead of silently rendering an empty slide.
  const missingRenderers = sceneData.filter((scene) => typeof SCENE_RENDERERS[scene.id] !== 'function').map((s) => s.id);
  if (missingRenderers.length) {
    console.error('[JuCoding V4] scenes without a renderer:', missingRenderers.join(', '));
  }
  const scenes = sceneData
    .filter((scene) => typeof SCENE_RENDERERS[scene.id] === 'function')
    .map((scene) => ({ ...scene, render: SCENE_RENDERERS[scene.id] }));

  // ---------------------------------------------------------------------------
  // Approved Archive overrides.
  //
  // These come from the user's Archive and are the ONLY thing that can change
  // lecture text at runtime. The installed app is never written to, so a fresh
  // install or an uninstalled copy still behaves identically.
  // ---------------------------------------------------------------------------
  const escapeHtml = (text) => String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // A scene created entirely from Archive material renders from a small block
  // vocabulary rather than from a hand-written renderer.
  const renderDataScene = (scene) => {
    const blocks = Array.isArray(scene.blocks) ? scene.blocks : [];
    const body = blocks.map((block) => {
      const type = block.type || 'lead';
      if (type === 'quote') return `<div class="big-quote">${escapeHtml(block.text || '')}</div>`;
      if (type === 'cards') {
        const items = (block.items || []).map((item) => `
          <div class="card soft-purple">
            <h3>${escapeHtml(item.title || '')}</h3>
            <p>${escapeHtml(item.text || '')}</p>
          </div>`).join('');
        return `<div class="grid ${(block.items || []).length >= 4 ? 'four' : 'three'}">${items}</div>`;
      }
      if (type === 'list') {
        return `<div class="risk-grid"><div class="risk-card low"><h3>${escapeHtml(block.title || '핵심 내용')}</h3><ul>${
          (block.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
        }</ul></div></div>`;
      }
      return `<p class="lead">${escapeHtml(block.text || '')}</p>`;
    }).join('');
    return `
      <div class="scene">
        ${header(scene.kicker || 'ARCHIVE MATERIAL', escapeHtml(scene.title || ''), scene.sub || '자료함에서 추가된 장면입니다.')}
        ${body || `<p class="lead">${escapeHtml(scene.narration || '')}</p>`}
      </div>`;
  };

  const archiveAssetFigure = (scene) => {
    const asset = scene.archiveAsset;
    if (!asset || !asset.archivePath) return '';
    const src = window.vibeCodingApp && typeof window.vibeCodingApp.archiveUrl === 'function'
      ? window.vibeCodingApp.archiveUrl(asset.archivePath)
      : '';
    if (!src) return '';
    return `
      <figure class="v4-asset-figure v4-asset-hero">
        <img src="${escapeHtml(src)}" alt="${escapeHtml(asset.title || '자료함 자료')}"
             data-asset-full="${escapeHtml(src)}" data-asset-title="${escapeHtml(asset.title || '자료함 자료')}"
             data-asset-cap="${escapeHtml(asset.caption || '')}">
        <figcaption><b>${escapeHtml(asset.title || '자료함 자료')} · 클릭하면 크게 보기</b>${escapeHtml(asset.caption || '')}<br><small>Archive 자료함 자료 · 인터넷 없이 표시됩니다</small></figcaption>
      </figure>`;
  };

  let appliedOverrideCount = 0;

  function applyOverrides(overrides) {
    if (!overrides) return 0;
    const sceneOverrides = overrides.scenes || {};
    const assets = overrides.assets || {};
    const newScenes = Array.isArray(overrides.newScenes) ? overrides.newScenes : [];
    let count = 0;

    for (const scene of scenes) {
      const patch = sceneOverrides[scene.id];
      if (patch) {
        for (const field of ['title', 'narration', 'cue', 'extra']) {
          if (typeof patch[field] === 'string' && patch[field].trim()) {
            scene[field] = patch[field];
            count += 1;
          }
        }
      }
      const asset = assets[scene.id];
      if (asset && asset.archivePath) {
        scene.archiveAsset = asset;
        count += 1;
      }
    }

    for (const extra of newScenes) {
      if (!extra || !extra.id) continue;
      if (scenes.some((scene) => scene.id === extra.id)) continue;
      scenes.push({
        ...extra,
        chapter: extra.chapter || chapters[chapters.length - 1].id,
        origin: 'archive',
        render: () => renderDataScene(extra)
      });
      count += 1;
    }
    return count;
  }

  async function loadOverrides() {
    const bridge = window.vibeCodingApp;
    if (!bridge || typeof bridge.getLectureOverrides !== 'function') return;
    try {
      const result = await bridge.getLectureOverrides();
      if (!result || !result.ok || !result.overrides) return;
      appliedOverrideCount = applyOverrides(result.overrides);
      if (appliedOverrideCount) {
        const notice = document.getElementById('archive-notice');
        if (notice) {
          notice.textContent = `자료함 적용 내용 ${appliedOverrideCount}건이 반영되어 있습니다.`;
          notice.hidden = false;
        }
        renderScene();
      }
    } catch { /* lecture stays on the shipped content when the bridge is absent */ }
  }

  let index = 0;
  let cueOpen = false;
  let simView = null;

  function getChapter(id) {
    return chapters.find((chapter) => chapter.id === id) || chapters[0];
  }

  function sceneSimulations(scene) {
    return (scene.simulations || [])
      .map((id) => simulations[id])
      .filter(Boolean);
  }

  // Staggered entrance for the sections of a scene. `--i` is consumed by
  // .scene > * in one-shot.css; prefers-reduced-motion disables it entirely.
  function applyStagger(root) {
    const kids = Array.from(root.children).slice(0, 8);
    kids.forEach((kid, i) => {
      kid.style.setProperty('--i', String(i));
    });
  }

  function closeSimulation() {
    if (simView) {
      simView.destroy();
      simView = null;
    }
  }

  function renderScene() {
    closeSimulation();
    const scene = scenes[index];
    stage.innerHTML = scene.render();
    const sceneEl = stage.querySelector('.scene');
    // An Archive image approved for this scene is appended here rather than
    // baked into the renderer, so the renderer stays content-free.
    if (sceneEl && scene.archiveAsset) {
      sceneEl.insertAdjacentHTML('beforeend', archiveAssetFigure(scene));
    }
    applyStagger(sceneEl || stage);

    const chapter = getChapter(scene.chapter);
    chapterLabel.textContent = `${chapter.label} · ${chapter.title}`;
    sceneCounter.textContent = `${index + 1} / ${scenes.length}`;
    progressBar.style.width = `${((index + 1) / scenes.length) * 100}%`;
    prev.disabled = index === 0;
    next.disabled = index === scenes.length - 1;
    next.textContent = index === scenes.length - 1 ? '완료 ✓' : '다음 →';
    updateCue(false);
    attachSceneInteractions(scene.id);
    mountSimulationEntry(scene, sceneEl);
  }

  function mountSimulationEntry(scene, sceneEl) {
    const available = sceneSimulations(scene);
    if (!available.length || !sceneEl) return;
    const chapter = getChapter(scene.chapter);
    const view = new window.JuCodingSimulation.SimulationView({
      container: stage,
      scene: { ...scene, chapterLabel: `${chapter.label} · ${chapter.title}` },
      simulations: available,
      staticLayer: sceneEl,
      onState: () => {}
    });
    view.build();
    sceneEl.insertAdjacentHTML('beforeend', view.entryMarkup());
    sceneEl.querySelectorAll('[data-sim]').forEach((button) => {
      button.addEventListener('click', () => view.open(button.dataset.sim));
    });
    simView = view;
    if (deepLinkSim) {
      const wanted = deepLinkSim;
      deepLinkSim = '';
      if (available.some((s) => s.id === wanted)) view.open(wanted);
    }
  }

  function updateCue(forceToggle) {
    const scene = scenes[index];
    if (forceToggle) cueOpen = !cueOpen;
    cue.classList.toggle('open', cueOpen);
    cue.setAttribute('aria-hidden', String(!cueOpen));
    cueTitle.textContent = scene.title;
    cueSummary.textContent = scene.narration || '';
    cueSummary.hidden = !scene.narration;
    cueBody.textContent = scene.cue;
    cueExtra.textContent = scene.extra || '';
  }

  function gotoScene(target) {
    index = Math.max(0, Math.min(scenes.length - 1, target));
    renderScene();
  }

  function gotoChapter(id) {
    const target = scenes.findIndex((scene) => scene.chapter === id);
    if (target >= 0) gotoScene(target);
  }

  function attachSceneInteractions(id) {
    if (id === 'project-form') {
      const button = document.getElementById('project-build');
      button?.addEventListener('click', () => {
        const what = document.getElementById('project-what').value.trim() || '아직 미정';
        const who = document.getElementById('project-who').value.trim() || '아직 미정';
        const core = document.getElementById('project-core').value.trim() || '아직 미정';
        document.getElementById('project-plan-output').textContent = `# 내 첫 프로젝트\n\n무엇을 만들까?\n${what}\n\n누가 사용할까?\n${who}\n\n가장 중요한 기능\n${core}\n\n→ 이제 이 내용을 AI에게 보여주고 PRD 초안을 요청해보세요.`;
      });
    }

    if (id === 'automation-form') {
      const button = document.getElementById('auto-build');
      button?.addEventListener('click', () => {
        const task = document.getElementById('auto-task').value.trim() || '반복 업무';
        const worker = document.getElementById('auto-worker').value.trim() || 'Agent/Worker 작업';
        const result = document.getElementById('auto-result').value.trim() || '원하는 결과';
        document.getElementById('auto-output').textContent = `${task}\n\n        ↓\n\n${worker}\n\n        ↓\n\n${result}`;
      });
    }
  }

  function buildChapterGrid() {
    chapterGrid.innerHTML = chapters.map((chapter) => `
      <button class="chapter-button" type="button" data-chapter="${chapter.id}">
        <span>${chapter.label}</span><b>${chapter.title}</b><small>${chapter.time}</small>
      </button>`).join('');
    chapterGrid.querySelectorAll('[data-chapter]').forEach((button) => {
      button.addEventListener('click', () => {
        gotoChapter(button.dataset.chapter);
        chapterDialog.close();
      });
    });
  }

  prev.addEventListener('click', () => gotoScene(index - 1));
  next.addEventListener('click', () => {
    if (index < scenes.length - 1) gotoScene(index + 1);
  });
  document.getElementById('btn-notes').addEventListener('click', () => updateCue(true));
  document.getElementById('btn-chapters').addEventListener('click', () => chapterDialog.showModal());
  document.getElementById('btn-map').addEventListener('click', () => mapDialog.showModal());
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => document.getElementById(button.dataset.close)?.close());
  });

  // Keyboard arbitration.
  // While a simulation is open the view owns Space / → / ← / R / Esc and the
  // lecture's own next/prev keys stand down, so the two never fight over the
  // same key. Outside a simulation nothing changes.
  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (typing) return;
    if (simView && simView.isOpen && simView.handleKey(event)) {
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      if (index < scenes.length - 1) gotoScene(index + 1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      if (index > 0) gotoScene(index - 1);
    }
    if (event.key.toLowerCase() === 'n') updateCue(true);
    if (event.key.toLowerCase() === 'm') mapDialog.showModal();
    if (event.key.toLowerCase() === 'c') chapterDialog.showModal();
    if (event.key === 'Escape' && cueOpen) {
      cueOpen = false;
      updateCue(false);
    }
  });

  // Connector geometry is measured from the DOM, so a resize needs a relayout.
  let relayoutTimer = null;
  window.addEventListener('resize', () => {
    if (relayoutTimer) clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => simView?.relayout(), 120);
  });

  buildChapterGrid();

  // Deep link: one-shot.html#scene=<id>  ·  one-shot.html#scene=<id>&sim=<simulationId>
  const params = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
  const initialScene = params.get('scene');
  let deepLinkSim = params.get('sim') || '';
  if (initialScene) {
    const target = scenes.findIndex((scene) => scene.id === initialScene);
    if (target >= 0) index = target;
  }
  renderScene();
  // Renders immediately with the shipped content, then re-renders once the
  // approved Archive overrides arrive, so a missing bridge is never a blank slide.
  loadOverrides();

  const homeButton = document.getElementById('btn-home');
  homeButton?.addEventListener('click', () => {
    window.location.href = '../../renderer/v4/home.html';
  });

  const assetDialog = document.getElementById('asset-dialog');
  stage.addEventListener('click', (event) => {
    const img = event.target.closest('img[data-asset-full]');
    if (!img || !assetDialog) return;
    const dialogImg = document.getElementById('asset-dialog-img');
    const dialogTitle = document.getElementById('asset-dialog-title');
    const dialogCap = document.getElementById('asset-dialog-cap');
    if (dialogImg) {
      dialogImg.src = img.dataset.assetFull;
      dialogImg.alt = img.alt || '강의 자료';
    }
    if (dialogTitle) dialogTitle.textContent = img.dataset.assetTitle || '강의 자료';
    if (dialogCap) dialogCap.textContent = img.dataset.assetCap || '';
    if (!assetDialog.open) assetDialog.showModal();
  });

  // Exposed for the V4 smoke test so simulation playback can be asserted
  // without reaching into private closure state.
  window.__jucodingV4 = {
    get sceneIndex() { return index; },
    get sceneCount() { return scenes.length; },
    get simulationOpen() { return Boolean(simView && simView.isOpen); },
    get simulationState() { return simView?.engine?.snapshot() || null; },
    get appliedOverrideCount() { return appliedOverrideCount; },
    get scenes() { return scenes.map((s) => ({ id: s.id, title: s.title, narration: s.narration, origin: s.origin || 'shipped' })); },
    openSimulation: (id) => simView?.open(id),
    closeSimulation: () => simView?.close(),
    gotoScene
  };
})();
