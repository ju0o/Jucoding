'use strict';

(() => {
  const stage = document.getElementById('stage');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const chapterLabel = document.getElementById('chapter-label');
  const sceneCounter = document.getElementById('scene-counter');
  const progressBar = document.getElementById('progress-bar');
  const cue = document.getElementById('speaker-cue');
  const cueTitle = document.getElementById('cue-title');
  const cueBody = document.getElementById('cue-body');
  const cueExtra = document.getElementById('cue-extra');
  const chapterDialog = document.getElementById('chapter-dialog');
  const chapterGrid = document.getElementById('chapter-grid');
  const mapDialog = document.getElementById('map-dialog');

  const chapters = [
    { id: 'why', label: '01', title: '왜 바이브코딩인가?', time: '약 25분' },
    { id: 'agent', label: '02', title: 'AI와 Agent', time: '약 25분' },
    { id: 'terms', label: '03', title: '기본 개발 용어', time: '약 30분' },
    { id: 'plan', label: '04', title: '프로젝트 기획 용어', time: '약 40분' },
    { id: 'deploy', label: '05', title: '개발서버 · 배포 · Git', time: '약 30분' },
    { id: 'auto', label: '06', title: 'MCP · Worker · 자동화', time: '약 20분' }
  ];

  const header = (kicker, title, sub) => `
    <div class="scene-header">
      <div>
        <span class="kicker">${kicker}</span>
        <h1 class="scene-title">${title}</h1>
        ${sub ? `<p class="scene-sub">${sub}</p>` : ''}
      </div>
    </div>`;

  const scenes = [
    {
      chapter:'why', id:'cover', title:'오늘의 지도',
      cue:'오늘은 용어를 외우는 시간이 아니라, AI가 실제로 일할 수 있는 공간을 어떻게 만드는지 연결해서 보는 시간입니다.',
      extra:'오프닝 질문: “ChatGPT에게 물어보는 것과 직접 프로그램을 만드는 것은 뭐가 다를까요?”',
      render:() => `
        <div class="scene center" style="position:relative">
          <span class="kicker">3시간 스터디 · 왕초보용</span>
          <h1 class="hero"><span class="grad">AI · Agent · 바이브코딩</span></h1>
          <p class="lead">AI에게 물어보는 것에서 시작해서, Agent에게 일을 맡기고,<br>결국 내가 원하는 도구와 공간까지 만드는 흐름을 한 번에 이해합니다.</p>
          <div class="robot-hero" aria-hidden="true"></div>
          <span class="float-chip chip-ai">AI</span><span class="float-chip chip-agent">Agent</span><span class="float-chip chip-vibe">Vibe Coding</span>
        </div>`
    },
    {
      chapter:'why', id:'spaces', title:'기존 서비스는 이미 만들어진 공간',
      cue:'YouTube는 영상 공간, Notion은 기록 공간, Excel은 데이터 공간입니다. 편리하지만 결국 남이 정해둔 방식 안에서 일합니다.',
      extra:'여기서 “그럼 내 업무 방식에 딱 맞는 공간이 없다면?”을 질문하세요.',
      render:() => `
        <div class="scene">
          ${header('왜 바이브코딩인가?', '우리는 지금까지 <span class="grad">만들어진 공간</span>을 사용했습니다.', '좋은 서비스는 이미 정해진 목적에 맞춰 아주 편리하게 만들어져 있습니다.')}
          <div class="space-row">
            <div class="space"><span class="logo youtube">▶</span><div><b>YouTube</b><small>영상 업로드 · 공유 공간</small></div></div>
            <div class="space"><span class="logo notion">N</span><div><b>Notion</b><small>기록 · 정리 공간</small></div></div>
            <div class="space"><span class="logo excel">X</span><div><b>Excel</b><small>표 · 숫자 · 데이터 공간</small></div></div>
          </div>
          <div class="big-quote">“그런데 <span style="color:#6a50ec">내가 원하는 방식으로</span> AI와 Agent가 일할 공간은?”</div>
        </div>`
    },
    {
      chapter:'why', id:'vibe', title:'바이브코딩의 핵심',
      cue:'바이브코딩은 “AI가 대신 코딩해주는 것”으로만 이해하면 좁습니다. 내가 원하는 문제 해결 공간을 AI와 함께 만드는 방식이라고 설명하세요.',
      extra:'정의: AI와 대화하며 소프트웨어를 만드는 방식. 결과적으로 나만의 도구/공간을 만들 수 있습니다.',
      render:() => `
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
        </div>`
    },
    {
      chapter:'agent', id:'ai-agent', title:'AI와 Agent 차이',
      cue:'포함관계 설명보다 “행동 루프”를 먼저 보여주세요. AI Agent는 AI를 이용해 여러 단계의 일을 수행하는 시스템이라고 설명하면 됩니다.',
      extra:'AI Agent는 AI의 한 형태/활용 구조입니다. 모든 AI가 Agent처럼 행동하는 것은 아닙니다.',
      render:() => `
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
        </div>`
    },
    {
      chapter:'agent', id:'chat-terminal', title:'ChatGPT와 터미널 Agent',
      cue:'“어떻게 고쳐?”라고 묻는 것과 “직접 고쳐.”라고 맡기는 차이로 설명하면 초보자가 가장 빨리 이해합니다.',
      extra:'예시: ChatGPT는 수정 방법을 설명할 수 있고, Codex/Claude Code 같은 Agent는 실제 파일과 터미널을 다룰 수 있습니다.',
      render:() => `
        <div class="scene">
          ${header('AI를 쓰는 두 가지 경험', '대화형 AI와 <span class="grad">컴퓨터에서 일하는 Agent</span>', '둘 다 유용하지만 할 수 있는 행동 범위가 다릅니다.')}
          <div class="agent-compare">
            <div class="agent-card" style="background:linear-gradient(180deg,#eefaff,#fff)"><h3>💬 ChatGPT</h3><p>대화를 통해 설명하고 아이디어를 정리하는 데 강합니다.</p><div class="agent-mini-flow"><span>질문</span><i>→</i><span>아이디어 정리</span><i>→</i><span>답변</span></div></div>
            <div class="agent-card" style="background:linear-gradient(180deg,#f5f0ff,#fff)"><h3>⌨️ 터미널 Agent</h3><p>내 컴퓨터의 파일을 읽고, 명령을 실행하고, 코드를 직접 수정할 수 있습니다.</p><div class="agent-mini-flow"><span>목표</span><i>→</i><span>파일 수정</span><i>→</i><span>코드 실행</span><i>→</i><span>테스트</span></div></div>
          </div>
          <div class="big-quote">ChatGPT: “<b>어떻게</b> 고쳐?” &nbsp;&nbsp; ↔ &nbsp;&nbsp; Agent: “<b>직접</b> 고쳐.”</div>
        </div>`
    },
    {
      chapter:'terms', id:'web-terms', title:'프론트엔드 · 백엔드 · API · DB',
      cue:'네 단어를 따로 외우게 하지 말고 “보이는 곳 / 뒤에서 일하는 곳 / 서로 말 거는 방법 / 기억하는 곳” 네 문장으로 먼저 잡아주세요.',
      extra:'이후 기술 이름은 바뀌어도 이 네 역할은 계속 남습니다.',
      render:() => `
        <div class="scene">
          ${header('처음 만나는 개발 용어', '기본 용어 <span class="grad">쉽게 이해하기</span>', '어려운 기술 이름보다 먼저 “무슨 역할인지”를 눈으로 이해합니다.')}
          <div class="term-grid">
            <div class="term-card frontend"><span class="num">01</span><div class="term-art">🖥️</div><div><h3>프론트엔드</h3><strong>= 보이는 곳</strong><p>사용자가 직접 보고 클릭하는 화면을 만드는 부분</p></div></div>
            <div class="term-card backend"><span class="num">02</span><div class="term-art">⚙️</div><div><h3>백엔드</h3><strong>= 뒤에서 일하는 곳</strong><p>요청을 처리하고 필요한 일을 수행하는 부분</p></div></div>
            <div class="term-card api"><span class="num">03</span><div class="term-art">↔️</div><div><h3>API</h3><strong>= 서로 말 거는 방법</strong><p>서로 다른 프로그램이 데이터를 주고받는 약속</p></div></div>
            <div class="term-card database"><span class="num">04</span><div class="term-art">🗄️</div><div><h3>데이터베이스</h3><strong>= 기억하는 곳</strong><p>필요한 데이터를 저장하고 다시 꺼내는 곳</p></div></div>
          </div>
        </div>`
    },
    {
      chapter:'terms', id:'architecture', title:'하나의 서비스가 연결되는 구조',
      cue:'로그인이나 게시글 작성 같은 실제 행동 하나를 예로 들어 화살표를 따라가면 됩니다.',
      extra:'예: “게시글 저장” → 화면에서 입력 → API 요청 → 백엔드 처리 → DB 저장.',
      render:() => `
        <div class="scene">
          ${header('한눈에 보는 구조', '이렇게 연결되어 <span class="grad">하나의 서비스</span>가 동작합니다.', '각 부품은 따로 외우는 것이 아니라 서로 연결되어 움직입니다.')}
          <div class="arch">
            <div class="arch-node"><div class="bubble-icon">🖥️</div><b>프론트엔드</b><span>보이는 화면</span></div><span class="arch-arrow">↔</span>
            <div class="arch-node"><div class="bubble-icon">💬</div><b>API</b><span>요청 · 응답</span></div><span class="arch-arrow">↔</span>
            <div class="arch-node"><div class="bubble-icon">⚙️</div><b>백엔드</b><span>뒤에서 처리</span></div><span class="arch-arrow">↔</span>
            <div class="arch-node"><div class="bubble-icon">🗄️</div><b>데이터베이스</b><span>데이터 저장</span></div>
          </div>
          <div class="big-quote" style="font-size:25px">사용자 행동 하나도 사실은 <span style="color:#684fe8">여러 부품이 대화하는 과정</span>입니다.</div>
        </div>`
    },
    {
      chapter:'terms', id:'ui-terms', title:'GUI · TUI · CLI',
      cue:'같은 프로그램도 화면을 어떻게 조작하느냐에 따라 표현 방식이 달라질 수 있다는 정도면 충분합니다.',
      extra:'GUI=그래픽 화면, TUI=터미널 안의 UI, CLI=명령어 입력 방식.',
      render:() => `
        <div class="scene">
          ${header('화면과 조작 방식', 'GUI · TUI · CLI를 <span class="grad">한 번에</span>', '이 용어는 “어떤 방식으로 프로그램을 조작하는가?”를 설명합니다.')}
          <div class="mini-terms">
            <div class="mini-term"><b>GUI</b><span>= 그림으로 조작하는 화면</span><div class="term-art">🪟</div><p class="micro">예: 웹사이트, 일반 앱</p></div>
            <div class="mini-term"><b>TUI</b><span>= 터미널 안에서 조작하는 화면</span><div class="terminal-mini">AGENT 1  WORKING<br>AGENT 2  IDLE<br>QA       PASS</div></div>
            <div class="mini-term"><b>CLI</b><span>= 명령어를 입력하는 방식</span><div class="terminal-mini">$ git status<br>$ npm run dev<br>$ codex</div></div>
          </div>
        </div>`
    },
    {
      chapter:'plan', id:'planning-terms-a', title:'PRD · WBS · Wireframe · Prototype',
      cue:'각 영어 단어보다 쉬운 번역을 먼저 말하세요. “기획서, 할 일 목록, 화면 스케치, 눌러보는 시제품”입니다.',
      extra:'이번 강의에서는 작성법을 깊게 배우는 것이 아니라 언제 쓰는지 이해하는 것이 목표입니다.',
      render:() => `
        <div class="scene">
          ${header('프로젝트 만들기 전에', '어려운 단어를 <span class="grad">쉬운 말로</span> 바꾸기', '좋은 프로젝트는 코딩보다 먼저 생각을 정리하는 데서 시작합니다.')}
          <div class="docs-grid">
            <div class="doc-card"><span class="tag">01</span><h3>PRD</h3><strong>= 기획서</strong><p>무엇을 왜 만들고 어떤 기능이 필요한지 정리</p></div>
            <div class="doc-card"><span class="tag">02</span><h3>WBS</h3><strong>= 할 일 목록</strong><p>프로젝트를 작은 작업으로 나누고 순서 정리</p></div>
            <div class="doc-card"><span class="tag">03</span><h3>Wireframe</h3><strong>= 화면 스케치</strong><p>화면에 무엇이 어디에 있을지 미리 그린 도면</p></div>
            <div class="doc-card"><span class="tag">04</span><h3>Prototype</h3><strong>= 눌러보는 시제품</strong><p>완성 전 실제 사용 흐름을 미리 확인하는 모형</p></div>
          </div>
        </div>`
    },
    {
      chapter:'plan', id:'planning-terms-b', title:'ERD · DBML · SSOT',
      cue:'SSOT는 특히 실무에서 중요합니다. 여러 문서가 서로 다르면 “그래서 뭐가 진짜 기준이야?”가 생기기 때문입니다.',
      extra:'ERD=데이터 관계 그림, DBML=DB 구조를 글로 표현, SSOT=최종 기준 문서.',
      render:() => `
        <div class="scene">
          ${header('데이터와 기준 정리', 'ERD · DBML · <span class="grad">SSOT</span>', '데이터를 어떻게 기억할지, 그리고 프로젝트의 최종 기준이 무엇인지 정합니다.')}
          <div class="grid three">
            <div class="card soft-blue"><span class="num">05</span><div class="icon">🔗</div><h3>ERD = 데이터 관계 그림</h3><p>회원, 게시글, 댓글 같은 데이터가 서로 어떤 관계인지 그림으로 표현합니다.</p></div>
            <div class="card soft-pink"><span class="num">06</span><div class="icon">⌨️</div><h3>DBML = 데이터 구조를 글로 표현</h3><p>데이터베이스 구조를 코드처럼 읽기 쉬운 글로 작성합니다.</p></div>
            <div class="card soft-purple"><span class="num">07</span><div class="icon">📌</div><h3>SSOT = 최종 기준 문서</h3><p>의견이 다를 때 “이 문서가 최종 기준”이라고 정한 하나의 기준점입니다.</p></div>
          </div>
          <div class="big-quote" style="font-size:23px">A 문서엔 로그인 있음 / B 문서엔 로그인 없음 → “<b>그래서 뭐가 맞아?</b>” → SSOT가 필요</div>
        </div>`
    },
    {
      chapter:'plan', id:'project-flow', title:'프로젝트가 만들어지는 순서',
      cue:'이 순서가 절대 법칙은 아니지만, 초보자가 전체 흐름을 이해하기엔 좋은 지도라고 설명하세요.',
      extra:'아이디어 → 기획 → 화면 → 데이터 → 구현. 필요하면 앞뒤로 되돌아갑니다.',
      render:() => `
        <div class="scene">
          ${header('PROJECT FLOW', '아이디어가 <span class="grad">실제 프로그램</span>이 되는 과정', '완벽하게 한 번에 만드는 것이 아니라 작은 단계를 반복합니다.')}
          <div class="process">
            <div class="process-node"><div class="e">💡</div><b>아이디어</b><span>무슨 문제를 해결?</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">📋</div><b>기획</b><span>PRD · WBS</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">🪟</div><b>화면</b><span>Wireframe · Prototype</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">🗄️</div><b>데이터</b><span>ERD · DBML</span></div><div class="process-arrow">→</div>
            <div class="process-node"><div class="e">💻</div><b>구현</b><span>AI와 기능 제작</span></div>
          </div>
        </div>`
    },
    {
      chapter:'plan', id:'project-form', title:'내 첫 프로젝트 정리',
      cue:'참가자 한두 명에게 실제로 입력해보게 해도 좋습니다. 답이 완벽하지 않아도 프로젝트 시작점이 만들어지는 경험이 중요합니다.',
      extra:'이 폼은 강의 중 예시용입니다. 나중에 실제 PRD 생성기로 확장할 수 있습니다.',
      render:() => `
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
        </div>`
    },
    {
      chapter:'deploy', id:'dev-deploy', title:'개발서버와 배포',
      cue:'개발서버는 “내 작업실”, 배포는 “다른 사람도 들어올 수 있는 공간”이라는 비유로 충분합니다.',
      extra:'localhost 주소는 내 컴퓨터 안에서만 보이는 경우가 많고, 배포 후 공개 URL이 생깁니다.',
      render:() => `
        <div class="scene">
          ${header('실행되는 장소', '개발서버는 내 작업실, <span class="grad">배포는 세상에 공개</span>', '만든 프로그램을 어디서 실행하고 누구에게 보여줄지 이해합니다.')}
          <div class="deploy-grid">
            <div class="deploy-card"><h3>🏠 개발서버 = 내 작업실</h3><p>내 컴퓨터에서 코드를 수정하고 바로 확인하는 개발 중 공간입니다.</p><div class="deploy-visual"><div class="v">💻</div><span>→</span><div class="v" style="font-size:17px;font-weight:900">localhost<br><small>내 컴퓨터</small></div></div></div>
            <div class="deploy-card"><h3>🌍 배포 = 다른 사람도 쓰는 공간</h3><p>인터넷 서버에 올려 다른 사람이 URL로 접속할 수 있게 합니다.</p><div class="deploy-visual"><div class="v">💻</div><span>→</span><div class="v">☁️</div><span>→</span><div class="v">👥</div></div></div>
          </div>
        </div>`
    },
    {
      chapter:'deploy', id:'git', title:'Git과 GitHub',
      cue:'GitHub=Git이라고 생각하는 초보자가 많습니다. Git은 변경 기록 시스템, GitHub는 그 기록을 온라인에서 보관/공유하는 서비스라고 분리하세요.',
      extra:'“AI가 코드를 망치면 돌아갈 수 있게 기록을 남긴다”는 설명도 실용적입니다.',
      render:() => `
        <div class="scene">
          ${header('기록과 공유', 'Git과 GitHub는 <span class="grad">같은 것이 아닙니다.</span>', '코드를 안전하게 기록하고, 온라인에서 보관하고, 다른 사람과 공유합니다.')}
          <div class="git-compare">
            <div class="git-card" style="background:linear-gradient(180deg,#fff4ee,#fff)"><div class="git-logo">🔀</div><h3>Git</h3><strong>= 변경 기록</strong><p>내 코드가 어떻게 바뀌었는지 기록합니다. 필요하면 이전 상태로 돌아갈 수 있습니다.</p></div>
            <div class="git-card" style="background:linear-gradient(180deg,#f1f3f8,#fff)"><div class="git-logo">🐙</div><h3>GitHub</h3><strong>= 온라인 저장소 · 협업 공간</strong><p>Git으로 기록한 프로젝트를 인터넷에 올려 보관하고 공유합니다.</p></div>
          </div>
          <div class="process"><div class="process-node"><div class="e">📄</div><b>파일 수정</b><span>오늘 작업</span></div><div class="process-arrow">→</div><div class="process-node"><div class="e">📸</div><b>Git 기록</b><span>Commit</span></div><div class="process-arrow">→</div><div class="process-node"><div class="e">☁️</div><b>GitHub</b><span>Push · 공유</span></div></div>
        </div>`
    },
    {
      chapter:'deploy', id:'program-choice', title:'나는 어떤 프로그램을 만들까?',
      cue:'모든 프로젝트가 웹사이트일 필요는 없습니다. 사용자와 사용 장소에 따라 웹, PC, 모바일, CLI/TUI 등을 고르면 됩니다.',
      extra:'초보 프로젝트는 배포가 쉬운 웹부터 시작하기 편하지만 절대 규칙은 아닙니다.',
      render:() => `
        <div class="scene">
          ${header('PROGRAM TYPE', '어디에서 사용할지에 따라 <span class="grad">형태가 달라집니다.</span>', '기술부터 고르는 것이 아니라 “누가 어디서 쓰는가?”부터 생각합니다.')}
          <div class="grid four">
            <div class="card soft-blue"><div class="icon">🌐</div><h3>웹</h3><p>브라우저에서 사용. 링크 하나로 공유하기 쉬움.</p></div>
            <div class="card soft-purple"><div class="icon">🖥️</div><h3>PC 앱</h3><p>Windows/macOS에서 실행. 로컬 파일·OS 기능 활용에 좋음.</p></div>
            <div class="card soft-green"><div class="icon">📱</div><h3>모바일 앱</h3><p>휴대폰 중심 사용 경험. 카메라·센서 활용 가능.</p></div>
            <div class="card soft-orange"><div class="icon">⌨️</div><h3>CLI / TUI</h3><p>터미널 중심. 빠른 자동화와 개발 도구에 적합.</p></div>
          </div>
        </div>`
    },
    {
      chapter:'auto', id:'mcp', title:'MCP란?',
      cue:'MCP를 “자동화 기능”이라고 설명하지 말고, AI가 외부 도구를 사용할 수 있게 연결하는 공통 방식이라고 설명하세요.',
      extra:'브라우저, 파일, DB, 디자인 도구 등 다양한 외부 기능을 연결하는 표준화된 통로라는 비유가 좋습니다.',
      render:() => `
        <div class="scene">
          ${header('AI + TOOLS', 'MCP = AI가 다른 도구를 <span class="grad">사용하게 연결하는 방식</span>', 'Agent가 말만 하는 것을 넘어 브라우저, 파일, DB, 디자인 도구 등을 사용하도록 연결할 수 있습니다.')}
          <div class="mcp-center">
            <div class="mcp-card"><h3 style="font-size:27px;margin-top:0">쉽게 말하면</h3><div class="big-quote" style="font-size:24px;box-shadow:none">AI에게 <b style="color:#674fe9">손과 도구함</b>을 연결하는 공통 규격</div><p style="color:#6d7691;line-height:1.7">MCP 자체가 일을 하는 것은 아닙니다. Agent가 어떤 도구를 발견하고 호출할 수 있도록 연결해주는 방식입니다.</p></div>
            <div class="mcp-card mcp-hub"><div class="mcp-core">MCP</div><span class="tool-orbit tool-1">🌐 브라우저</span><span class="tool-orbit tool-2">📁 파일</span><span class="tool-orbit tool-3">🎨 디자인</span><span class="tool-orbit tool-4">🗄️ DB</span></div>
          </div>
        </div>`
    },
    {
      chapter:'auto', id:'video-auto', title:'영상 자동화',
      cue:'여기서 본인이 만든 Claude + Remotion 영상 사례를 보여주면 좋습니다. Agent는 판단, Worker는 특정 일을 수행하는 역할로 단순화하세요.',
      extra:'예시 흐름: 아이디어 → 기획/대본 Agent → Worker → Remotion → QA → 영상 완성.',
      render:() => `
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
        </div>`
    },
    {
      chapter:'auto', id:'sns-auto', title:'SNS 자동화',
      cue:'SNS 자동화는 플랫폼 정책과 인증 방식이 중요합니다. “Agent가 알아서 무조건 게시”가 아니라 승인/권한/공식 API를 강조하세요.',
      extra:'실제 운영에서는 초안 생성 → 사람 승인 → 공식 API 게시 → 결과 확인이 안전한 기본 구조입니다.',
      render:() => `
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
        </div>`
    },
    {
      chapter:'auto', id:'automation-form', title:'내 자동화 아이디어',
      cue:'마지막에는 참가자가 자기 반복 업무 하나를 떠올리게 하세요. 기술 이름보다 “입력 → 일 → 결과” 세 칸이면 충분합니다.',
      extra:'예: 수기 재고 사진 → AI 정리 → 엑셀/DB 저장.',
      render:() => `
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
        </div>`
    },
    {
      chapter:'auto', id:'summary', title:'오늘의 전체 연결',
      cue:'용어를 얼마나 외웠는지가 아니라 “각 단어가 어디에 쓰이는지” 설명할 수 있으면 성공이라고 마무리하세요.',
      extra:'다음 단계는 각자 작은 프로젝트 하나를 골라 실제로 AI/Agent와 만들어보는 것입니다.',
      render:() => `
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
    }
  ];

  let index = 0;
  let cueOpen = false;

  function getChapter(id) {
    return chapters.find((chapter) => chapter.id === id) || chapters[0];
  }

  function renderScene() {
    const scene = scenes[index];
    stage.innerHTML = scene.render();
    const chapter = getChapter(scene.chapter);
    chapterLabel.textContent = `${chapter.label} · ${chapter.title}`;
    sceneCounter.textContent = `${index + 1} / ${scenes.length}`;
    progressBar.style.width = `${((index + 1) / scenes.length) * 100}%`;
    prev.disabled = index === 0;
    next.disabled = index === scenes.length - 1;
    next.textContent = index === scenes.length - 1 ? '완료 ✓' : '다음 →';
    updateCue(false);
    attachSceneInteractions(scene.id);
  }

  function updateCue(forceToggle) {
    const scene = scenes[index];
    if (forceToggle) cueOpen = !cueOpen;
    cue.classList.toggle('open', cueOpen);
    cue.setAttribute('aria-hidden', String(!cueOpen));
    cueTitle.textContent = scene.title;
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

  document.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (typing) return;
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

  buildChapterGrid();
  renderScene();
})();
