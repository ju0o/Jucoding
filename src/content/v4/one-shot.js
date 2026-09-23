'use strict';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const node = (title, sub='', cls='') => `<div class="node ${cls}"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;
const arrow = () => `<div class="arrow">→</div>`;

const chapters = [
  ['OPEN','전체 지도','오늘 배울 모든 개발 용어를 한 장에'],
  ['AI','AI vs Agent','말해주는 AI와 움직이는 Agent'],
  ['AGENT','Agent의 부품','Model · Tool · API · MCP · Worker'],
  ['WEB','웹서비스 구조','Frontend · Backend · Database'],
  ['CONNECT','API · MCP','프로그램의 대화 창구와 Agent 연결'],
  ['PROJECT','파일 · Node · npm','프로젝트를 실행하고 부품을 가져오기'],
  ['UI','React · Next.js','화면 부품과 웹앱 프레임워크'],
  ['HISTORY','Git · GitHub','작업 기록과 협업'],
  ['RELEASE','Deploy','localhost를 실제 링크로'],
  ['PLAN','PRD · SSOT · WBS','무엇을 만들고 어떻게 진행할지'],
  ['DESIGN','Flow · Wireframe · Prototype','사용 흐름에서 눌러보는 화면까지'],
  ['DATA','ERD · DBML','서비스가 기억할 데이터를 설계'],
  ['END','전체 연결','아이디어에서 실제 사용자까지']
];

const scene = (chapter, kicker, html, cueTitle, cueBody, cueExtra='') => ({chapter,kicker,html,cueTitle,cueBody,cueExtra});

const scenes = [
  scene(0,'DEVELOPMENT, WITHOUT FEAR',`
    <div class="scene">
      <div class="kicker">JUCODING · ONE SHOT</div>
      <h1 class="hero">개발을 몰라도<br><span class="accent">전체 그림</span>은 볼 수 있다.</h1>
      <p class="lead">오늘 목표는 코드를 외우는 게 아니라, “지금 내가 어디를 만들고 있는지” 말할 수 있게 되는 것입니다.</p>
      <div class="callout">화살표 키 또는 하단 버튼으로 진행 · N = 강사 큐 · M = 목차</div>
    </div>`,
    '처음 30초',
    '오늘은 코딩 수업이라기보다 “개발 세계 지도 읽는 법”을 배운다고 말해주세요.',
    '전문용어를 먼저 외우게 하지 않습니다. 상황 → 흐름 → 이름 순서입니다.'
  ),
  scene(0,'MASTER MAP',`
    <div class="scene center">
      <div class="kicker">아이디어가 실제 서비스가 되는 길</div>
      <div class="flow">${node('IDEA','무엇을 만들까?')}${arrow()}${node('PRD','무엇을 · 왜')}${arrow()}${node('PROTOTYPE','미리 눌러보기')}</div>
      <div class="flow">${node('FRONTEND','보이는 곳','cyan')}${arrow()}${node('API','대화 창구')}${arrow()}${node('BACKEND','처리하는 곳','lime')}${arrow()}${node('DATABASE','기억하는 곳')}</div>
      <div class="flow">${node('GIT / GITHUB','기록 · 협업')}${arrow()}${node('DEPLOY','인터넷 공개','lime')}${arrow()}${node('USER','실제 사용자','cyan')}</div>
      <p class="caption">이 강의는 이 지도를 왼쪽에서 오른쪽으로 한 번 완주합니다.</p>
    </div>`,
    '지도 먼저',
    '학생이 세부 용어를 몰라도 괜찮습니다. “오늘 이 길을 한 번 끝까지 간다”는 감각만 주면 됩니다.'
  ),
  scene(1,'AI ≠ AGENT',`
    <div class="scene">
      <div class="kicker">01 · AI vs Agent</div>
      <h1 class="hero">AI는 <span class="cyan">답하고</span><br>Agent는 <span class="accent">움직인다.</span></h1>
      <div class="split">
        <div class="card cyan"><small>CHAT AI</small><h3>“이렇게 하면 됩니다.”</h3><p>설명, 코드, 아이디어를 대화 안에서 돌려줍니다.</p></div>
        <div class="card lime"><small>AGENT</small><h3>“제가 해볼게요.”</h3><p>파일을 열고, 수정하고, 실행하고, 오류를 다시 고칠 수 있습니다.</p></div>
      </div>
    </div>`,
    '핵심 한 문장',
    '“누가 더 똑똑하냐”가 아니라 “행동 범위가 어디까지냐”의 차이라고 설명하세요.'
  ),
  scene(1,'SAME PROMPT, DIFFERENT RESULT',`
    <div class="scene">
      <div class="kicker">같은 요청을 두 곳에 보내면</div>
      <div class="split">
        <div class="mock-window">
          <div class="mock-titlebar"><i class="dot"></i><i class="dot"></i><i class="dot"></i> Chat AI</div>
          <div class="mock-body">
            <div class="chat-row user"><div class="bubble">“카페 홈페이지 만들어줘.”</div></div>
            <div class="chat-row"><div class="bubble">좋아요. 아래와 같은 구조로 만들 수 있습니다…<br><br>&lt;header&gt; JuCafe…</div></div>
          </div>
        </div>
        <div class="mock-window">
          <div class="mock-titlebar"><i class="dot"></i><i class="dot"></i><i class="dot"></i> Coding Agent</div>
          <div class="mock-body agent-log">
            <div>→ inspecting project files</div>
            <div>→ editing <span class="warn">app/page.tsx</span></div>
            <div>→ running npm test</div>
            <div>→ test failed · fixing</div>
            <div class="ok">✓ 18 tests passed · done</div>
          </div>
        </div>
      </div>
      <p class="caption">왼쪽은 “답”, 오른쪽은 “환경 안의 행동”을 보여주는 목업입니다.</p>
    </div>`,
    '목업을 가리키며',
    '왼쪽은 대화를 끝내면 사용자가 다음 행동을 합니다. 오른쪽은 Agent가 도구를 써서 여러 단계를 이어갑니다.'
  ),
  scene(2,'INSIDE AN AGENT',`
    <div class="scene center">
      <div class="kicker">02 · Agent의 부품</div>
      <div class="flow">${node('MODEL','생각하는 부분','cyan')}${arrow()}${node('AGENT','다음 행동을 고름','lime')}${arrow()}${node('TOOL','파일 · 브라우저 · 터미널')}</div>
      <p class="lead">Agent도 혼자 모든 걸 하는 마법이 아니라,<br>생각 + 연결 + 실행이 이어지는 구조입니다.</p>
    </div>`,
    '사람 비유',
    '사람도 머리만 있다고 일이 끝나지 않습니다. 손, 전화, 도구가 있어야 합니다. Agent도 똑같다고 설명하면 됩니다.'
  ),
  scene(2,'TOOL · API · MCP · WORKER',`
    <div class="scene">
      <div class="kicker">헷갈리는 네 단어를 역할로 구분</div>
      <div class="three">
        <div class="card"><small>TOOL</small><h3>쓸 수 있는 도구</h3><p>파일, 브라우저, 터미널, GitHub처럼 실제 행동을 위한 수단.</p></div>
        <div class="card cyan"><small>API</small><h3>프로그램의 창구</h3><p>프로그램끼리 기능을 요청하고 응답받는 인터페이스.</p></div>
        <div class="card lime"><small>MCP</small><h3>Agent 연결 규격</h3><p>Agent가 도구와 리소스를 일정한 방식으로 발견하고 쓰게 하는 표준.</p></div>
      </div>
      <div class="flow">${node('WORKER','맡은 작업을 실제로 실행하는 단위','')}</div>
    </div>`,
    '정의보다 역할',
    'API와 MCP를 같은 것으로 가르치지 마세요. API는 프로그램 간 인터페이스, MCP는 Agent-tool 연결 표준에 초점을 둡니다.'
  ),
  scene(3,'CLICK → PROCESS → REMEMBER',`
    <div class="scene">
      <div class="kicker">03 · 웹서비스는 어떻게 움직일까?</div>
      <h1 class="hero">버튼 하나 뒤에<br><span class="accent">세 곳</span>이 움직인다.</h1>
      <div class="flow">${node('보는 곳','버튼 · 화면','cyan')}${arrow()}${node('처리하는 곳','가격 · 재고 · 규칙','lime')}${arrow()}${node('기억하는 곳','회원 · 주문 · 기록')}</div>
    </div>`,
    '영어 이름 숨기기',
    '여기서는 아직 Frontend/Backend/Database라는 말을 먼저 하지 마세요. 역할을 먼저 이해시킵니다.'
  ),
  scene(3,'JUCAFE ORDER FLOW',`
    <div class="scene">
      <div class="kicker">주문하기를 누르면</div>
      <div class="flow">
        <div class="phone"><div class="phone-screen"><div class="phone-notch"></div><h3>☕ JuCafe</h3><div class="product"><b>아메리카노</b><span>4,000원</span><button type="button">주문하기</button></div></div></div>
        ${arrow()}
        <div class="server"><div class="lights"><i></i><i></i><i></i></div><b>SERVER</b><div class="row">주문 확인</div><div class="row">가격 / 재고 처리</div><div class="row">저장 요청</div></div>
        ${arrow()}
        <div class="db"><div class="r"><b>ID</b><b>MENU</b><b>USER</b></div><div class="r"><span>001</span><span>Americano</span><span>주영</span></div><div class="r"><span>002</span><span>Latte</span><span>A</span></div></div>
      </div>
    </div>`,
    '실제 서비스처럼',
    '휴대폰 → 서버 → 기록 순서로 손가락으로 따라가세요. 학생이 먼저 “화면/처리/저장”이라고 답하게 해도 좋습니다.'
  ),
  scene(3,'NOW NAME IT',`
    <div class="scene center">
      <div class="kicker">이제 이름을 붙입니다</div>
      <div class="flow">${node('FRONTEND','사람이 보는 곳','cyan')}${arrow()}${node('BACKEND','뒤에서 처리','lime')}${arrow()}${node('DATABASE','기억하는 곳')}</div>
      <h2 class="lead">이 세 단어만 이해해도<br>웹 개발 대화의 절반은 덜 낯설어집니다.</h2>
    </div>`,
    '용어 Reveal',
    '역할을 이해한 다음 영어 이름을 붙이면 암기 부담이 훨씬 줄어듭니다.'
  ),
  scene(4,'API',`
    <div class="scene">
      <div class="kicker">04 · API</div>
      <h1 class="hero"><span class="cyan">Frontend</span>가<br>Backend와 대화하는 <span class="accent">창구.</span></h1>
      <div class="flow">${node('Frontend','“아메리카노 1개”','cyan')}${arrow()}${node('API','정해진 요청 / 응답','lime')}${arrow()}${node('Backend','주문 처리')}</div>
      <div class="code">POST /orders\n{ "productId": 17, "qty": 1 }\n\n← 201 CREATED</div>
    </div>`,
    'JSON은 잠깐만',
    '코드는 외우라고 보여주는 게 아닙니다. “실제 개발에서는 이런 모양으로 보인다” 정도로만 보여주세요.'
  ),
  scene(4,'MCP',`
    <div class="scene">
      <div class="kicker">그리고 Agent에는</div>
      <h1 class="hero">도구를 붙이는<br><span class="accent">공통 연결 방식</span>이 필요하다.</h1>
      <div class="flow">${node('AGENT','도구를 쓰고 싶음','cyan')}${arrow()}${node('MCP','연결 규격','lime')}${arrow()}${node('GitHub · Files · DB','Tools / Resources')}</div>
      <p class="caption">API = 프로그램 간 기능 호출에 널리 쓰이는 인터페이스 · MCP = Agent가 도구/리소스와 연결되는 방식에 초점</p>
    </div>`,
    '오해 방지',
    'MCP를 “새 API”라고 단순화하지 않는 게 좋습니다. 해결하려는 초점이 다릅니다.'
  ),
  scene(5,'A PROJECT IS JUST FILES',`
    <div class="scene">
      <div class="kicker">05 · 프로젝트 파일</div>
      <h1 class="hero">프로그램도 결국<br><span class="cyan">파일과 폴더</span>의 모음.</h1>
      <div class="file-tree"><span class="folder">📁 JuCafe</span>\n  <span class="folder">📁 app</span>          ← 화면 / 페이지\n  <span class="folder">📁 components</span>   ← 재사용 부품\n  <span class="folder">📁 public</span>       ← 이미지 / 공개 자산\n  <span class="key">📄 package.json</span> ← 프로젝트 정보 / 패키지</div>
    </div>`,
    '겁먹지 않게',
    'AI가 파일을 수십 개 만들더라도 전부 읽을 필요는 없습니다. “무슨 역할의 폴더인지”부터 찾는 습관을 줍니다.'
  ),
  scene(5,'NODE + NPM',`
    <div class="scene">
      <div class="kicker">실행과 부품</div>
      <div class="split">
        <div class="card cyan"><small>NODE.JS</small><h3>JavaScript를 실행하는 환경</h3><p>브라우저 밖, 컴퓨터와 서버 환경에서 JavaScript를 실행할 수 있게 합니다.</p></div>
        <div class="card lime"><small>NPM</small><h3>패키지를 설치하고 관리</h3><p>남이 만든 유용한 기능을 프로젝트에 가져오고 의존성을 관리합니다.</p></div>
      </div>
      <div class="code">$ node app.js\n$ npm install some-package</div>
    </div>`,
    '둘을 분리',
    'Node.js와 npm을 한 덩어리로 외우지 않게 해주세요. Node = 실행 환경, npm = 패키지 관리.'
  ),
  scene(6,'REACT',`
    <div class="scene">
      <div class="kicker">06 · React</div>
      <h1 class="hero">큰 화면을<br><span class="accent">작은 부품</span>으로.</h1>
      <div class="split">
        <div class="component-ui"><div class="comp"><strong>HEADER</strong><br>☕ JuCafe</div><div class="comp product-comp"><strong>PRODUCT CARD</strong><br><br>아메리카노 · 4,000원</div><div class="comp product-comp"><strong>PRODUCT CARD</strong><br><br>카페라떼 · 4,500원</div></div>
        <div class="card lime"><small>COMPONENT THINKING</small><h3>ProductCard 하나를 여러 번 재사용</h3><p>React는 UI를 컴포넌트 단위로 구성하기 좋은 라이브러리입니다.</p></div>
      </div>
    </div>`,
    '화면을 쪼개기',
    '학생에게 “똑같이 생긴 상품 카드 두 개를 매번 새로 만들 필요가 있을까요?”라고 물어보세요.'
  ),
  scene(6,'NEXT.JS',`
    <div class="scene center">
      <div class="kicker">React로 만든 부품을 실제 웹앱으로</div>
      <div class="flow">${node('React','UI Components','cyan')}${arrow()}${node('Next.js','React 기반 Framework','lime')}${arrow()}${node('Web App','Routing · Server · Build')}</div>
      <p class="lead">React가 화면 부품을 잘 만들게 해준다면,<br>Next.js는 React로 웹앱 전체 구조를 만들기 쉽게 해줍니다.</p>
    </div>`,
    '경쟁 제품 아님',
    'React vs Next를 “둘 중 하나 고르는 경쟁 제품”처럼 설명하지 마세요. Next.js는 React 기반 프레임워크입니다.'
  ),
  scene(7,'GIT = HISTORY',`
    <div class="scene">
      <div class="kicker">07 · Git</div>
      <h1 class="hero">개발에도<br><span class="accent">세이브 포인트</span>가 있다.</h1>
      <div class="timeline">
        <div class="time good"><span>09:00</span><i></i><div><b>프로젝트 시작</b><span> · commit</span></div></div>
        <div class="time good"><span>10:30</span><i></i><div><b>메뉴 화면 완성</b><span> · commit</span></div></div>
        <div class="time good"><span>12:10</span><i></i><div><b>로그인 완성</b><span> · commit</span></div></div>
        <div class="time bad"><span>14:20</span><i></i><div><b>💥 프로그램 고장</b></div></div>
      </div>
    </div>`,
    '게임 비유',
    'Git은 단순 백업이 아니라 “무엇이 어떻게 바뀌었는지” 추적하는 버전 관리 시스템이라고 마지막에 정확히 붙여주세요.'
  ),
  scene(7,'GITHUB = SHARE + COLLABORATE',`
    <div class="scene center">
      <div class="kicker">Git 기록을 온라인으로</div>
      <div class="flow">${node('💻 MY PC','Git Repository','cyan')}${arrow()}${node('☁ GITHUB','Repository Hosting','lime')}${arrow()}${node('👥 TEAM','Review · Collaborate')}</div>
      <div class="flow">${node('Branch','따로 작업')}${arrow()}${node('Pull Request','검토 요청')}${arrow()}${node('Merge','합치기','lime')}</div>
      <p class="caption">Git = 버전 관리 시스템 · GitHub = Git 저장소 호스팅과 협업 서비스</p>
    </div>`,
    'Git과 GitHub 분리',
    '둘을 같은 단어처럼 쓰는 초보자가 많습니다. 내 PC의 기록 방식과 온라인 협업 장소를 시각적으로 떨어뜨려 보여주세요.'
  ),
  scene(8,'LOCALHOST → PUBLIC',`
    <div class="scene">
      <div class="kicker">08 · Deploy</div>
      <h1 class="hero"><span class="muted">localhost</span>에서<br><span class="accent">누구나 접속</span>하게.</h1>
      <div class="flow">${node('💻 Local','localhost:3000')}${arrow()}${node('GitHub','코드')}${arrow()}${node('Build / Hosting','서비스 준비','lime')}${arrow()}${node('🌎 Public URL','인터넷','cyan')}</div>
    </div>`,
    '배포 한 문장',
    '내 컴퓨터에서만 되던 프로그램을 다른 사람이 접속할 수 있는 상태로 내보내는 과정이라고 설명하면 충분합니다.'
  ),
  scene(8,'DON’T SHIP YOUR SECRET',`
    <div class="scene">
      <div class="kicker">배포할 때 함께 기억할 것</div>
      <div class="split">
        <div class="card red"><small>BAD</small><h3>코드에 API Key</h3><p>공개 저장소에 비밀값이 그대로 올라가면 노출 위험이 생깁니다.</p></div>
        <div class="card lime"><small>BETTER</small><h3>Environment Variable</h3><p>코드와 비밀 설정을 분리해서 배포 환경에 저장합니다.</p></div>
      </div>
    </div>`,
    '보안은 최소 원칙',
    '초급에서는 보안 전체를 가르치지 말고 “비밀값을 코드에 박아 공개하지 않는다”는 한 원칙만 확실히 남깁니다.'
  ),
  scene(9,'THREE DOCUMENTS, THREE QUESTIONS',`
    <div class="scene">
      <div class="kicker">09 · PRD · SSOT · WBS</div>
      <div class="doc-stack">
        <div class="doc"><small>01</small><h3>PRD</h3><ul><li>왜 만들지?</li><li>누가 쓰지?</li><li>무슨 문제?</li><li>무엇을 만들지?</li></ul></div>
        <div class="doc current"><small>02</small><h3>SSOT</h3><ul><li>지금 확정된 건?</li><li>현재 기준은?</li><li>무엇이 최신?</li><li>어디를 믿을까?</li></ul></div>
        <div class="doc"><small>03</small><h3>WBS</h3><ul><li>큰 일을 어떻게?</li><li>어떤 작업으로?</li><li>어떤 순서로?</li><li>무엇부터 할까?</li></ul></div>
      </div>
    </div>`,
    '문서 암기 금지',
    '세 문서를 같은 종류로 외우게 하지 말고 “각각 무슨 질문에 답하는가”로 구분합니다.'
  ),
  scene(9,'WHY SSOT EXISTS',`
    <div class="scene">
      <div class="kicker">정보가 흩어지면</div>
      <div class="split">
        <div class="card red"><small>CHAOS</small><h3>뭐가 맞는데?</h3><p>카톡: 포인트 넣기<br>전화: 회원가입 빼기<br>옛 문서: 회원가입 필수</p></div>
        <div class="card lime"><small>SSOT · CURRENT TRUTH</small><h3>현재 결정</h3><p>✓ 회원가입 없음<br>✓ 포인트 있음<br>✓ 카드결제 있음</p></div>
      </div>
    </div>`,
    'SSOT 체감',
    '“문서를 예쁘게 정리하는 것”보다 “현재 진짜 기준이 어디냐”를 해결하는 개념이라고 설명하세요.'
  ),
  scene(10,'FLOW → WIREFRAME → PROTOTYPE',`
    <div class="scene center">
      <div class="kicker">10 · 화면 설계는 이렇게 자란다</div>
      <div class="flow">${node('LOGIN','')}${arrow()}${node('HOME','')}${arrow()}${node('MENU','')}${arrow()}${node('ORDER','')}</div>
      <p class="lead">먼저 사람의 <span style="color:var(--lime)">길</span>을 그리고,<br>그 다음 화면의 <span style="color:var(--cyan)">뼈대</span>를 만듭니다.</p>
    </div>`,
    'User Flow',
    '화면 디자인보다 먼저 “사용자가 어떤 순서로 움직이나?”를 그리는 게 User Flow라고 이름을 붙입니다.'
  ),
  scene(10,'WIREFRAME',`
    <div class="scene center">
      <div class="kicker">화면의 뼈대</div>
      <div class="wireframe"><div class="bar"></div><div class="box"></div><div class="box"></div><div class="btn"></div></div>
      <h2 class="lead">색과 예쁨보다<br>“무엇이 어디에 있나?”</h2>
    </div>`,
    'Wireframe',
    '회색 박스만 보여주면서 정보 구조와 배치를 확인하는 단계라고 설명하세요.'
  ),
  scene(10,'PROTOTYPE',`
    <div class="scene center">
      <div class="kicker">그리고 실제처럼 눌러보면</div>
      <div class="phone"><div class="phone-screen"><div class="phone-notch"></div><h3>☕ JuCafe</h3><div class="product"><b>아메리카노</b><span>4,000원</span><button id="demo-order" type="button">주문하기</button></div></div></div>
      <p class="lead">User Flow = 길 · Wireframe = 뼈대 · Prototype = 체험</p>
    </div>`,
    '직접 누르게',
    '버튼을 실제로 한 번 눌러보게 하세요. “가짜지만 사용 경험을 미리 검증하는 화면”이라는 감각이 생깁니다.'
  ),
  scene(11,'WHAT MUST THE SERVICE REMEMBER?',`
    <div class="scene">
      <div class="kicker">11 · ERD</div>
      <h1 class="hero">카페 앱은<br>무엇을 <span class="accent">기억</span>해야 할까?</h1>
      <div class="flow">${node('🙋 USER','손님')}${node('🧾 ORDER','주문')}${node('☕ PRODUCT','메뉴')}${node('🏪 STORE','매장')}</div>
    </div>`,
    'ERD 전에 질문',
    '테이블, 컬럼부터 시작하지 마세요. “우리 서비스가 기억해야 하는 대상이 뭐지?”에서 시작합니다.'
  ),
  scene(11,'CONNECT THE DATA',`
    <div class="scene center">
      <div class="kicker">데이터와 데이터의 관계</div>
      <div class="flow"><div class="entity"><b>User</b><span>id</span><span>name</span></div><div class="relation"></div><div class="entity"><b>Order</b><span>id</span><span>user_id</span></div><div class="relation"></div><div class="entity"><b>Product</b><span>id</span><span>name</span></div></div>
      <p class="lead">“손님은 주문한다.”<br>“주문은 상품을 포함한다.”</p>
    </div>`,
    '이름 Reveal',
    '이제야 “이런 데이터 구조와 관계를 그린 설계도를 ERD라고 한다”고 붙입니다.'
  ),
  scene(11,'DBML',`
    <div class="scene">
      <div class="kicker">같은 구조를 텍스트로</div>
      <div class="split">
        <div class="flow"><div class="entity"><b>User</b><span>id · name</span></div><div class="relation"></div><div class="entity"><b>Order</b><span>id · user_id</span></div></div>
        <div class="code">Table users {\n  id int [pk]\n  name varchar\n}\n\nTable orders {\n  id int [pk]\n  user_id int [ref: > users.id]\n}</div>
      </div>
      <p class="caption">DBML은 DB 구조를 텍스트로 표현하는 언어 중 하나입니다. 기초에서는 작성 암기보다 “ERD ↔ 텍스트 구조” 연결만 봅니다.</p>
    </div>`,
    'DBML은 짧게',
    '초급 수업에서 문법 시험은 필요 없습니다. 같은 설계를 그림과 텍스트로 표현할 수 있다는 정도면 충분합니다.'
  ),
  scene(12,'THE WHOLE SYSTEM',`
    <div class="scene center">
      <div class="kicker">12 · 전부 다시 연결</div>
      <div class="flow">${node('IDEA','생각')}${arrow()}${node('PRD','정의')}${arrow()}${node('USER FLOW','길')}${arrow()}${node('PROTOTYPE','체험')}</div>
      <div class="flow">${node('FRONTEND','보는 곳','cyan')}${arrow()}${node('API','대화')}${arrow()}${node('BACKEND','처리','lime')}${arrow()}${node('DATABASE','기억')}</div>
      <div class="flow">${node('GIT / GITHUB','기록 · 협업')}${arrow()}${node('DEPLOY','인터넷 공개','lime')}${arrow()}${node('USER','실제 사용자','cyan')}</div>
    </div>`,
    '새 용어 없음',
    '마지막에는 새 단어를 추가하지 마세요. 처음의 지도에 학생이 아는 단어가 얼마나 늘었는지 확인합니다.'
  ),
  scene(12,'WHERE DOES THE AGENT FIT?',`
    <div class="scene">
      <div class="kicker">Agent는 이 모든 것 위에서 일한다</div>
      <h1 class="hero"><span class="muted">사람이</span> 목표와 기준을 잡고,<br><span class="accent">Agent</span>가 도구로 움직인다.</h1>
      <div class="flow">${node('HUMAN','목표 · 판단 · 검토','cyan')}${arrow()}${node('AGENT','작업 계획 · 반복','lime')}${arrow()}${node('TOOLS','Files · Terminal · GitHub')}${arrow()}${node('RESULT','Code · Test · Deploy')}</div>
    </div>`,
    'AI 만능론 피하기',
    'Agent가 모든 판단을 대신한다는 식보다, 사람이 목표와 검증 기준을 잡고 Agent가 실행 범위를 넓힌다고 설명합니다.'
  ),
  scene(12,'YOU CAN READ THE MAP NOW',`
    <div class="scene center">
      <div class="kicker">END</div>
      <h1 class="hero">이제 코드를 몰라도<br><span class="accent">어디를 보고 있는지</span> 안다.</h1>
      <p class="lead">Frontend인지, Database인지, Git인지, Deploy인지.<br>Agent에게 일을 시킬 때도 무엇을 바꾸는지 말할 수 있습니다.</p>
      <div class="callout">오늘의 목표 = “외우기”가 아니라 “위치를 설명하기”</div>
    </div>`,
    '마무리',
    '다음 실습부터는 학생이 “프론트 쪽 바꿔주세요”, “DB 구조가 필요한가요?”, “이제 배포하는 단계인가요?”라고 말할 수 있으면 성공입니다.'
  )
];

let index = 0;
let cueOpen = false;

function render() {
  const s = scenes[index];
  $('#stage').innerHTML = s.html;
  $('#chapter-label').textContent = `${chapters[s.chapter][0]} · ${chapters[s.chapter][1]}`;
  $('#scene-counter').textContent = `${index + 1} / ${scenes.length}`;
  $('#progress-bar').style.width = `${((index + 1) / scenes.length) * 100}%`;
  $('#cue-title').textContent = s.cueTitle;
  $('#cue-body').textContent = s.cueBody;
  $('#cue-extra').textContent = s.cueExtra || '';
  $('#prev').disabled = index === 0;
  $('#next').textContent = index === scenes.length - 1 ? '처음으로 ↺' : '다음 →';

  const demo = $('#demo-order');
  if (demo) demo.addEventListener('click', () => {
    demo.textContent = '✓ 주문 완료';
    demo.style.background = '#36531f';
  });
}

function move(delta) {
  if (index === scenes.length - 1 && delta > 0) index = 0;
  else index = Math.max(0, Math.min(scenes.length - 1, index + delta));
  render();
}

function goChapter(chapterIndex) {
  const target = scenes.findIndex((s) => s.chapter === chapterIndex);
  if (target >= 0) {
    index = target;
    render();
  }
}

$('#prev').addEventListener('click', () => move(-1));
$('#next').addEventListener('click', () => move(1));

function toggleCue() {
  cueOpen = !cueOpen;
  $('#speaker-cue').classList.toggle('open', cueOpen);
  $('#speaker-cue').setAttribute('aria-hidden', cueOpen ? 'false' : 'true');
}
$('#btn-notes').addEventListener('click', toggleCue);

$('#chapter-grid').innerHTML = chapters.map((c, i) => `
  <button class="chapter-button" type="button" data-chapter="${i}">
    <span>${esc(c[0])}</span><b>${esc(c[1])}</b><small>${esc(c[2])}</small>
  </button>`).join('');
$('#chapter-grid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-chapter]');
  if (!btn) return;
  goChapter(Number(btn.dataset.chapter));
  $('#chapter-dialog').close();
});

$('#btn-chapters').addEventListener('click', () => $('#chapter-dialog').showModal());
$('#btn-map').addEventListener('click', () => $('#map-dialog').showModal());
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => {
  document.getElementById(b.dataset.close)?.close();
}));

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    if (document.querySelector('dialog[open]')) return;
    e.preventDefault(); move(1);
  }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    if (document.querySelector('dialog[open]')) return;
    e.preventDefault(); move(-1);
  }
  if (e.key.toLowerCase() === 'n') toggleCue();
  if (e.key.toLowerCase() === 'm') $('#chapter-dialog').showModal();
});

render();
