/* ---------- 올림픽 특집: 판마다 다른 대회 ----------
   개막 → 개막 전야 이야기(무작위) → 종목 셋(양궁·수영·태권도·승부차기 가운데 무작위, 승부차기는 나오면 늘 마지막) → 대회 중 사건(무작위) → 폐막.
   무작위로 고른 것은 첫 단계에서 ctx에 적어 두어 저장·불러오기 뒤에도 같은 대회가 이어진다.
   종목이 끝날 때마다 시상대가 서고, 메달은 ctx.med(금·은·동)에 쌓여 특별 이벤트 머리의 메달 집계판과 폐막식에 나온다. */
const OLY_IDS=['olym','olym_u'];
const OLY_HOME=()=>CP.id==='usa'?'미국':'대한민국';
// 개막 전야: 성화·기수·공연. only가 있으면 그 무대에서만 나온다.
const OLY_PRE=[
 {only:'kr',e:spEv('남북 공동 입장','개막을 열흘 앞두고 <em>남북 선수단 공동 입장</em> 제안이 왔다. 한반도기를 들고 함께 걸어 들어오자는 것이다.',[
  ['받아들인다 — 한반도기를 들고 함께 입장한다',{u:-5,a:4,p:2},'두 선수단이 한 깃발 아래 걸어 들어오자 관중석이 일어섰다. 반대 집회도 같은 날 열렸다.'],
  ['입장은 따로, 응원단만 함께한다',{u:-2,a:2},'남쪽 관중석 한편에 북쪽 응원단이 앉았다. 조용한 화해였다.'],
  ['정중히 거절한다',{u:3,a:-1,mil:1},'"지금은 때가 아니다." 대회는 예정대로 열렸다.']])},
 {e:spEv('성화 최종 주자','성화 봉송 <em>최종 주자</em>를 누구로 할지 정해야 한다. 그 한 사람이 대회의 얼굴이 된다.',[
  ['은퇴한 국민 영웅',{a:4,u:-2},'백발의 영웅이 성화대를 향해 마지막 계단을 올랐다. 해설자가 말을 잇지 못했다.'],
  ['팬데믹 최전선의 간호사',{a:5,m:2,saf:1},'방호복 대신 흰 운동복을 입은 간호사가 불을 붙였다. 세계 언론이 그 얼굴을 1면에 실었다.'],
  ['올림픽을 꿈꾸는 열두 살 아이',{a:3,trn:2},'아이가 성화대에 불을 붙이고 펄쩍 뛰었다. "다음 올림픽엔 선수로 오겠다"는 말이 화제가 됐다.']])},
 {f:null},   // 개막 공연 총감독(아래에서 무대별로 채운다)
 {e:spEv('선수단 포상금','메달을 따면 줄 <em>포상금과 혜택</em>을 정해야 한다. 선수들은 발표를 기다린다.',[
  ['금메달 포상금을 두 배로 올린다',{a:3,e:-3},'선수촌 식당이 술렁였다. "금메달 아니면 안 된다"는 말도 함께 돌았다.'],
  ['메달 색과 상관없이 같은 지원을 한다',{a:2,trn:2,saf:2},'은·동메달 선수들이 처음으로 박수를 받았다. 4위 선수도 연금을 받는다.'],
  ['포상금 대신 은퇴 선수 일자리를 만든다',{saf:3,e:-1,a:1},'코치·심판 일자리가 생겼다. 발표는 조용했지만 선수들은 오래 기억했다.']])},
 {only:'usa',e:spEv('보이콧 압박','몇몇 나라가 <em>대회 보이콧</em>을 검토한다는 보도가 나왔다. 개최국 대통령의 한마디가 필요하다.',[
  ['직접 전화를 돌려 참가를 설득한다',{a:4,p:2},'정상들의 답이 하나씩 왔다. 대부분 온다고 했다.'],
  ['"오지 않을 나라는 오지 말라"고 말한다',{a:2,u:4,p:3},'국내에서는 박수가 나왔다. 두 나라가 실제로 오지 않았다.'],
  ['조용히 기다린다',{a:-1},'보이콧은 흐지부지됐다. 대통령이 한 일은 없었다.']])}];
// 개막 공연 총감독은 무대마다 후보가 다르다
OLY_PRE[2].f=()=>CP.id==='usa'?spEv('개막 공연 총감독','개막 공연을 맡을 <em>총감독</em>을 골라야 한다.',[
  ['할리우드 블록버스터 감독',{a:4,e:-3},'경기장 지붕 위로 거대한 우주선이 내려앉았다. 개막식이 영화가 됐다.'],
  ['브로드웨이 연출가',{a:3,u:-2},'주경기장이 거대한 뮤지컬 무대가 됐다. 미국의 이민사가 노래로 흘렀다.'],
  ['실리콘밸리 기술 기업',{e:3,a:2,c:2},'드론 만 대가 성조기를 그렸다. 후원사 로고도 함께 떴다.']])
 :spEv('개막 공연 총감독','개막 공연을 맡을 <em>총감독</em>을 골라야 한다. 세계 수십억 명이 그 세 시간을 본다.',[
  ['세계적인 영화감독',{a:4,e:-2},'한 편의 영화 같은 개막식이었다. 엔딩 크레디트처럼 선수단이 입장했다.'],
  ['K팝 기획사 연합',{a:5,e:2,c:2},'떼창이 경기장을 덮었다. 동영상 조회수가 하룻밤에 1억을 넘었다.'],
  ['국악과 전통 무용 명인들',{a:3,u:-3},'고요한 북소리로 시작해 수천 명의 춤으로 끝났다. 외신은 "가장 우아한 개막식"이라고 썼다.']]);
// 대회 중 사건: 예전 사건 묶음(SP_TROUBLE)에 새 사건을 더한다
const OLY_MID=SP_TROUBLE.map(e=>({e:e})).concat([
 {only:'kr',e:spEv('광장 거리 응원','결승을 앞두고 <em>광화문 광장 거리 응원</em> 신청이 백만 명을 넘었다. 경찰은 안전을 걱정한다.',[
  ['광장을 열고 대형 화면을 세운다',{a:5,u:-4,saf:-2},'붉은 옷의 물결이 광장을 메웠다. 응원가가 새벽까지 이어졌다.'],
  ['구역을 나눠 인원을 제한한다',{a:2,saf:3},'광장이 질서 있게 찼다. 들어가지 못한 사람들은 골목에서 소리를 질렀다.'],
  ['안전을 이유로 불허한다',{a:-4,u:2,saf:2},'광장은 비었다. 사람들은 동네 치킨집에서 응원했다.']])},
 {e:spEv('도핑 의혹','금메달 후보인 우리 선수의 <em>도핑 검사에서 의심 수치</em>가 나왔다는 보도가 떴다. 재검사 결과는 사흘 뒤다.',[
  ['결과가 나올 때까지 출전을 멈춘다',{trn:5,a:-2},'선수는 울면서 숙소로 돌아갔다. 사흘 뒤 재검사는 음성이었다.'],
  ['"우리 선수를 믿는다"고 공개 지지한다',{a:3,trn:-2,u:2},'선수는 예정대로 뛰었다. 세계 언론은 그 발언을 오래 곱씹었다.'],
  ['독립 조사단을 꾸려 모든 과정을 공개한다',{trn:6,chk:2,e:-1},'조사 과정이 생중계됐다. 결과는 검사 기관의 실수였다.']])},
 {e:spEv('경기장 정전','결승이 한창인 주경기장에 <em>정전</em>이 일어났다. 수만 명이 어둠 속에 있다.',[
  ['비상 발전기로 경기를 바로 잇는다',{e:-2,a:2},'불이 12분 만에 다시 켜졌다. 관중들이 휴대폰 불빛으로 기다렸다.'],
  ['관중을 내보내고 경기를 다음 날로 미룬다',{saf:3,a:-2},'아무도 다치지 않았다. 선수들은 하루를 더 기다렸다.'],
  ['책임자부터 문책한다',{p:3,a:1,u:2},'전력 공사 사장이 그날 밤 물러났다. 원인은 끝내 하청 업체의 실수였다.']])},
 {e:spEv('암표 대란','개·폐막식 표가 <em>암표로 열 배</em>에 팔린다. 매크로로 표를 쓸어 간 업자들이 있다.',[
  ['남은 표를 추첨제로 바꾼다',{trn:4,a:3},'추첨에 붙은 사람들의 인증 사진이 쏟아졌다.'],
  ['암표 업자를 일제 단속한다',{p:3,a:2},'업자 수십 명이 붙잡혔다. 표값은 그대로였다.'],
  ['시장에 맡긴다',{e:2,a:-3,c:2},'"올림픽은 부자들의 잔치"라는 기사가 났다.']])},
 {e:spEv('태풍 북상','대회 닷새째, <em>태풍</em>이 개최 도시로 올라오고 있다. 야외 경기 일정이 줄줄이 걸려 있다.',[
  ['야외 경기를 모두 미룬다',{saf:4,e:-2,a:-1},'태풍은 비켜 갔다. 일정은 꼬였지만 아무도 다치지 않았다.'],
  ['경기는 하고 관중만 받지 않는다',{e:-1,a:1},'빈 관중석 앞에서 기록이 쏟아졌다.'],
  ['예정대로 강행한다',{e:2,saf:-4,a:-2},'비바람 속에서 경기가 열렸다. 다친 선수가 나왔다.']])},
 {e:spEv('선수의 정치적 발언','시상대에 선 한 선수가 <em>정부를 비판하는 문구</em>를 들어 보였다.',[
  ['표현의 자유라며 문제 삼지 않는다',{chk:4,trn:3,p:-2},'"그 나라는 선수를 벌하지 않았다." 해외 언론이 높이 평가했다.'],
  ['국가대표 자격을 정지한다',{p:4,chk:-4,u:4},'선수는 짐을 쌌다. 그 사진이 대회의 상징이 됐다.'],
  ['선수를 직접 만나 이야기를 듣는다',{a:3,u:-2},'두 사람이 나란히 앉은 사진이 나왔다. 무슨 말이 오갔는지는 알려지지 않았다.']])}]);
const olyPool=L=>L.map((x,i)=>[x,i]).filter(([x])=>!x.only||x.only===CP.id).map(([,i])=>i);
const olyGet=(L,i)=>L[i].f?L[i].f():Object.assign({},L[i].e);   // 표의 원본을 건드리지 않게 복사해서 쓴다
// 종목: 셋을 고르고 승부차기가 있으면 마지막에 둔다
const OLY_SPORT={arch:c=>MG_ARCH(c),swim:c=>MG_SWIM(c),tkd:c=>MG_TKD(c),pk:c=>MG_PK(c)};
function olyPlan(c){if(c.plan)return;const A=olyPool(OLY_PRE),B=olyPool(OLY_MID),pick=a=>a[Math.floor(Math.random()*a.length)];
  const S=['arch','swim','tkd','pk'].sort(()=>Math.random()-.5).slice(0,3).sort((a,b)=>(a==='pk')-(b==='pk'));
  c.plan=1;c.pre=pick(A);c.mid=pick(B);c.sports=S;c.med=[0,0,0];}
// 메달 집계 한 줄(폐막 글에 쓴다). 금메달 수로 종합 순위를 어림한다.
function olyMedalLine(c){const m=c.med||[0,0,0],n=m[0]+m[1]+m[2],rk=m[0]>=3?1:m[0]===2?2+(m[1]?0:1):m[0]===1?4+Math.max(0,2-m[1]):n?9:15;
  return '<em>금 '+m[0]+' · 은 '+m[1]+' · 동 '+m[2]+'</em>, 종합 '+rk+'위로 대회를 마쳤다. ';}
function olySteps(open,close){return [
  c=>{olyPlan(c);return open(c);},
  c=>{olyPlan(c);return olyGet(OLY_PRE,c.pre);},
  c=>{olyPlan(c);return OLY_SPORT[c.sports[0]](c);},
  c=>{olyPlan(c);return olyGet(OLY_MID,c.mid);},
  c=>{olyPlan(c);return OLY_SPORT[c.sports[1]](c);},
  c=>{olyPlan(c);return OLY_SPORT[c.sports[2]](c);},
  c=>{olyPlan(c);const e=close(c);return Object.assign({},e,{d:olyMedalLine(c)+e.d});}];}
{const O=SP.kr.find(s=>s.id==='olym');if(O){const st=O.steps;O.steps=olySteps(st[0],st[st.length-1]);}
 const U=SP.usa.find(s=>s.id==='olym_u');if(U){const st=U.steps;U.steps=olySteps(st[0],st[st.length-1]);}}
// 판의 6칸과 조건. 조건 하나 = [화면 지표, 비교, 기준] 또는 특별한 조건 이름
const BOARD={kr:['amend','olym','expo','peace','war_k','pand_k'],joseon:['jikgye','envoy','gwageo','compile','war_j','pand_j'],usa:['amend22','moon','war_u','pand_u','olym_u','newdeal']};
const NEED={amend:[['P','>=',50]],olym:[['E','>=',57],['A','>=',52],['H','>=',55]],expo:[['E','>=',53],['X','<=',30]],peace:[['X','<=',30],['NOWAR']],war_k:[['M','>=',70]],pand_k:[['COV'],['I','>=',20]],
 jikgye:[['P','>=',50]],envoy:[['A','>=',45],['E','>=',47]],gwageo:[['X','<=',30],['P','<=',50]],compile:[['E','>=',55],['X','<=',30]],war_j:[['M','>=',70]],pand_j:[['I','>=',25]],
 amend22:[['T2'],['P','>=',50]],moon:[['E','>=',58],['X','<=',30]],war_u:[['M','>=',70]],pand_u:[['I','>=',25]],olym_u:[['E','>=',55],['A','>=',50]],newdeal:[['E','<=',45]]};
function needEval(n){if(n[0]==='NOWAR')return {ok:SCX().id!=='war',txt:'전쟁 위기가 아닐 때'};
  if(n[0]==='COV')return {ok:isCov(),txt:'코로나 위기 중(1기)'};
  if(n[0]==='T2')return {ok:CAR.term>=2,txt:'2기 임기 중'};
  const v=Math.round(n[0]==='I'?S.i:vVal(n[0])),nm=n[0]==='I'?'위기 지수':vName(n[0]),ok=n[1]==='>='?v>=n[2]:v<=n[2];
  return {ok:ok,txt:nm+' '+n[2]+(n[1]==='>='?' 이상':' 이하'),cur:v};}
function startSpecial(sp,key,y){CAR.spDone[key]=1;CAR.spLog=CAR.spLog||[];CAR.spLog.push(CAR.term+'기 '+(y+1)+'년 '+sp.n);
  CAR.spRun={id:sp.id,n:sp.n,k:sp.k,tro:sp.tro,ok:0,done:0,total:sp.steps.length,ctx:{}};
  sp.steps.forEach((f,i)=>queue.splice(i,0,{sg:[sp.id,i]}));pendingNews=Object.assign({},sp.bn);bgmGame();}
function spBoard(go){const y=Math.round(S.turn/PY);if(y>=YRS)return go();CAR.spDone=CAR.spDone||{};window.scrollTo(0,0);
  const L=(BOARD[CP.id]||[]).map(id=>{const sp=(SP[CP.id]||[]).find(s=>s.id===id);if(!sp)return null;const key=sp.id+(sp.perTerm?'_'+CAR.term:''),nd=(NEED[id]||[]).map(needEval);
    return {sp:sp,key:key,done:!!CAR.spDone[key],nd:nd,ok:nd.every(x=>x.ok)};}).filter(Boolean);
  let sel=-1;
  const draw=()=>{R.innerHTML='<div class="spw" style="animation:fdIn .35s ease-out"><div style="font-size:12px;font-weight:600;color:var(--text-muted)">'+(CP.id==='joseon'?CAR.term+'번째 치세':CAR.term+'기')+' '+(y+1)+'년차를 앞두고</div>'+
     '<div class="hd" style="font-size:26px;margin:2px 0 4px">특별 국정 과제</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:14px">올해 벌일 큰일을 하나 고를 수 있다. 조건을 채운 과제만 색이 들어온다. 하지 않고 넘어가도 된다.</div>'+tip('board')+
     '<div class="spb-g">'+L.map((x,j)=>{const X=SPX[x.sp.id]||SPX.g20,on=x.ok&&!x.done;
       return '<button class="spb'+(on?' on':'')+(sel===j?' sel':'')+'" data-j="'+j+'"'+(on?'':' disabled')+' style="--sb:'+X.bg+';--sa:'+X.ac+'">'+
        '<svg class="spb-art" viewBox="0 0 120 120" aria-hidden="true">'+SPX_ART[X.art]+(X.ch?'<text x="60" y="76" text-anchor="middle" font-size="44" font-weight="800" stroke="none" fill="currentColor">'+X.ch+'</text>':'')+'</svg>'+
        '<span class="spb-k">'+(x.sp.k==='power'?'권력':'국정')+'</span><b class="spb-n">'+x.sp.n+'</b>'+
        '<span class="spb-c">'+x.nd.map(n=>'<i class="'+(n.ok?'y':'n')+'">'+(n.ok?'✓':'✗')+' '+n.txt+(n.cur!=null?' <small>(지금 '+n.cur+')</small>':'')+'</i>').join('')+'</span>'+
        (x.done?'<span class="spb-st">이미 치렀다</span>':'')+'</button>';}).join('')+'</div><div class="spw-bt">'+
     '<button id="spGo" class="pri" style="width:100%;padding:15px;font-size:15px;margin-top:14px"'+(sel<0?' disabled':'')+'>'+(sel<0?'과제를 고르세요':L[sel].sp.n+' 시작')+'</button>'+
     '<button id="spSkip" style="width:100%;padding:13px;font-size:14px;margin-top:8px">올해는 넘어간다</button></div></div>';
    bindTips();
    R.querySelectorAll('.spb.on').forEach(b=>b.onclick=()=>{SFX.click();sel=+b.dataset.j;draw();});
    const log=pick=>{CAR.boardLog=CAR.boardLog||[];CAR.boardLog.push(CAR.term+'기 '+(y+1)+'년: '+(pick||'넘어감')+' [가능: '+(L.filter(x=>x.ok&&!x.done).map(x=>x.sp.n).join(', ')||'없음')+']');};
    document.getElementById('spGo').onclick=()=>{if(sel<0)return;SFX.special();const x=L[sel];log(x.sp.n);startSpecial(x.sp,x.key,y);go();};
    document.getElementById('spSkip').onclick=()=>{SFX.click();log('');go();};};
  draw();}
// 경기 단계: 화면의 선택지 대신 경기를 치르고, 결과(0 대성공 ~ 3 대실패)를 그 단계의 판정으로 쓴다
function mgResolve(t){SVAT=null;SFX.click();takeSnap();lastO=cur.o[t];lastFit={q:0,why:[['+','경기 결과로 판정했다']]};lastS=1;logChoice(t);lastT=t;tally[t]++;yTally[t]++;CAR.tt[t]++;resolve(lastO,t);}
function mgRun(kind,box){if(MG_SPORT[kind])return mgPick(kind,box);
  box.innerHTML='<div class="mgx"><div class="mgx-h">백신 슬래시 · 현장 지휘</div><div class="mgx-t">손가락(또는 마우스)으로 화면을 그어 바이러스를 벤다. 시민을 베거나 바이러스를 놓치면 병상이 줄고, 병상이 바닥나면 끝난다. 결과는 등급으로 매겨진다.</div><button id="mgxGo" class="pri" style="width:100%;padding:14px">현장 지휘 시작</button></div>';
  document.getElementById('mgxGo').onclick=()=>{try{aInit();}catch(e){}mini(null,(gr,sc)=>{CAR.slashGrade=gr;RUN.slash=(RUN.slash?RUN.slash+' / ':'')+gr+' '+sc;mgResolve(gr==='S'?0:gr==='A'?1:gr==='B'?2:3);});};}
// 체육 종목(양궁·수영·승부차기)은 먼저 직접 할지, 시뮬레이션으로 맡길지 고른다.
// 시뮬레이션은 직접 할 때와 같은 판정 규칙을 '평균적인 실력의 선수'로 돌려 결과만 보여 준다.
const MG_SPORT={
  arch:{n:'양궁 개인전 결승',how:'바람을 읽고 흔들리는 조준점을 맞춰 여섯 발을 쏜다',run:(b,d)=>mgArch(b,d),sim:()=>simArch()},
  swim:{n:'수영 50m 결승',how:'왼팔·오른팔을 번갈아 빠르게 눌러 헤엄친다',run:(b,d)=>mgSwim(b,d),sim:()=>simSwim()},
  pk:{n:'축구 결승 승부차기',how:'우리 차례엔 직접 차고, 상대 차례엔 직접 막는다',run:(b,d)=>mgPK(b,d),sim:()=>simPK()},
  tkd:{n:'태권도 결승',how:'상대의 발차기를 막고 반격해 점수를 딴다',run:(b,d)=>mgTkd(b,d),sim:()=>simTkd()}};
// 메달 집계 한 줄(상황판·특집 머리에서도 쓴다)
const olyTally=m=>'<span>메달 집계</span>'+['금','은','동'].map((x,k)=>'<i class="m'+k+'">'+x+'</i><b>'+m[k]+'</b>').join('');
