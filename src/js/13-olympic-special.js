/* ---------- 올림픽 특집: 판마다 다른 대회 ----------
   개막 → 개막 전야 이야기(무작위) → 종목 둘(양궁·수영·태권도·승부차기 가운데 무작위, 승부차기는 나오면 늘 뒤) → 대회 중 사건(무작위) → 폐막.
   무작위로 고른 것은 첫 단계에서 ctx에 적어 두어 저장·불러오기 뒤에도 같은 대회가 이어진다.
   종목이 끝날 때마다 시상대가 서고, 메달은 ctx.med(금·은·동)에 쌓여 특별 이벤트 머리의 메달 집계판과 폐막식에 나온다. */
const OLY_IDS=['olym','olym_u','wolym','wolym_u'],WOLY_IDS=['wolym','wolym_u'];
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
const OLY_SPORT={arch:c=>MG_ARCH(c),swim:c=>MG_SWIM(c),tkd:c=>MG_TKD(c),pk:c=>MG_PK(c),skate:c=>MG_SKATE(c),curl:c=>MG_CURL(c),jump:c=>MG_JUMP(c),hockey:c=>MG_HOCKEY(c)};
// 대회 묶음: 하계는 양궁·수영·태권도·승부차기, 동계는 스케이트·컬링·스키점프·아이스하키. 단체 결승(승부차기·아이스하키)은 나오면 늘 마지막에 둔다
const OLY_SUMMER={pre:OLY_PRE,mid:OLY_MID,sp:['arch','swim','tkd','pk'],last:'pk'};
function olyPlan(c,W){if(c.plan)return;W=W||OLY_SUMMER;const A=olyPool(W.pre),B=olyPool(W.mid),pick=a=>a[Math.floor(Math.random()*a.length)];
  const S=W.sp.slice().sort(()=>Math.random()-.5).slice(0,2).sort((a,b)=>(a===W.last)-(b===W.last));
  c.plan=1;c.pre=pick(A);c.mid=pick(B);c.sports=S;c.med=[0,0,0];}
// 메달 집계 한 줄(폐막 글에 쓴다). 금메달 수로 종합 순위를 어림한다.
function olyMedalLine(c){const m=c.med||[0,0,0],n=m[0]+m[1]+m[2],rk=m[0]>=3?1:m[0]===2?2+(m[1]?0:1):m[0]===1?4+Math.max(0,2-m[1]):n?9:15;
  return '<em>금 '+m[0]+' · 은 '+m[1]+' · 동 '+m[2]+'</em>, 종합 '+rk+'위로 대회를 마쳤다. ';}
function olySteps(open,close,W){W=W||OLY_SUMMER;const P=c=>olyPlan(c,W),ST=[
  c=>{P(c);return open(c);},
  c=>{P(c);return olyGet(W.pre,c.pre);},
  c=>{P(c);return OLY_SPORT[c.sports[0]](c);},
  c=>{P(c);return olyGet(W.mid,c.mid);},
  c=>{P(c);return OLY_SPORT[c.sports[1]](c);},
  // 종목이 셋이던 때 저장한 대회는 여기서 셋째 종목을 치르고, 폐막은 steps.close로 이어진다(spGen)
  c=>{P(c);return c.sports[2]?OLY_SPORT[c.sports[2]](c):cl(c);}];
  const cl=c=>{const e=close(c);return Object.assign({},e,{d:olyMedalLine(c)+e.d});};
  ST.close=c=>{P(c);return cl(c);};return ST;}
{const O=SP.kr.find(s=>s.id==='olym');if(O){const st=O.steps;O.steps=olySteps(st[0],st[st.length-1]);}
 const U=SP.usa.find(s=>s.id==='olym_u');if(U){const st=U.steps;U.steps=olySteps(st[0],st[st.length-1]);}}
/* ---------- 동계올림픽: 하계올림픽을 치른 해로부터 2년 뒤 ----------
   하계올림픽을 시작하면 CAR.wolyAt에 '커리어 몇 번째 해'(careerYear)로 2년 뒤를 적어 둔다. 임기가 바뀌어도 그대로 이어진다.
   그해 과제 판이 열릴 자리에 동계올림픽이 대신 개막한다(그해에는 다른 과제를 벌이지 않는다). 새 임기 첫해는 과제 판이 없어 그다음 해로 밀린다.
   흐름은 하계와 같다: 개최지 → 개막 전야 → 종목 둘(스케이트·컬링·스키점프·아이스하키 가운데 무작위) → 대회 중 사건 → 폐막. 조선에는 올림픽이 없다. */
const WOLY_PRE=[
 {only:'kr',e:spEv('남북 단일팀 제안','개막 석 달 전, <em>여자 아이스하키 남북 단일팀</em>을 꾸리자는 제안이 왔다. 손발을 맞출 시간은 석 달뿐이다.',[
  ['받아들인다 — 한 팀으로 빙판에 선다',{u:-5,a:2,p:2},'두 나라 선수들이 같은 유니폼을 입었다. 출전 시간이 줄어든 선수들의 눈물도 함께 보도됐다.'],
  ['응원단만 함께하고 팀은 따로 꾸린다',{u:-2,a:2},'관중석 한편에서 같은 노래가 울렸다. 빙판 위는 각자의 팀이었다.'],
  ['선수들의 뜻을 먼저 묻는다',{trn:4,a:1,chk:2},'투표 결과가 공개됐다. 찬반이 팽팽했고, 정부는 그 결과를 따랐다.']])},
 {e:spEv('눈이 모자란다','올겨울은 유난히 따뜻하다. 설상 경기장에 <em>쌓인 눈이 기준의 절반</em>도 안 된다. 인공 눈을 만들려면 물과 전기가 엄청나게 든다.',[
  ['인공 눈을 밤낮으로 만든다',{e:-4,a:2,saf:-1},'제설기 수백 대가 밤새 돌았다. 슬로프는 하얘졌고 전기 요금 청구서도 하얘졌다.'],
  ['고지대 경기장으로 일정을 옮긴다',{e:-2,saf:2,u:2},'선수들은 두 시간 더 버스를 탔다. 눈은 진짜였다.'],
  ['"기후 위기 올림픽"이라고 세계에 알린다',{trn:4,a:3,e:-1},'개막식 무대에 녹아내리는 빙하 영상이 떴다. 외신이 그 장면을 1면에 실었다.']])},
 {e:spEv('성화 최종 주자','<em>성화 최종 주자</em>를 정해야 한다. 얼음 위에서 성화에 불을 붙이는 장면을 세계가 본다.',[
  ['은퇴한 빙상 영웅',{a:5,u:-2},'은반 위에서 짧은 연기를 마친 영웅이 성화대에 불을 붙였다. 중계진이 말을 잇지 못했다.'],
  ['산골 분교의 스키부 아이들',{a:3,saf:2},'아이들이 줄지어 성화를 날랐다. 그 학교에 후원 문의가 쏟아졌다.'],
  ['한파 속 제설 작업자',{a:4,trn:2},'형광 조끼를 입은 작업자가 불을 붙였다. "보이지 않던 사람들의 올림픽"이라는 기사가 났다.']])},
 {only:'usa',e:spEv('개막 공연 총감독','<em>동계올림픽 개막 공연</em>을 맡을 총감독을 골라야 한다.',[
  ['아이스쇼 제작사',{a:4,e:-2},'수백 명이 얼음 위에서 성조기를 그렸다. 넘어진 사람은 아무도 없었다.'],
  ['로키산맥 원주민 공동체',{u:-4,a:3},'북소리와 함께 산의 옛 이름들이 불렸다. 외신은 "가장 조용하고 깊은 개막식"이라고 썼다.'],
  ['실리콘밸리 기술 기업',{e:3,a:2,c:2},'드론 만 대가 눈송이를 그렸다. 후원사 로고도 함께 떴다.']])},
 {only:'kr',e:spEv('개막 공연 총감독','<em>동계올림픽 개막 공연</em>을 맡을 총감독을 골라야 한다. 영하의 밤, 세 시간짜리 무대다.',[
  ['드론 쇼와 K팝',{a:5,e:2,c:2},'드론 천 대가 오륜기를 그렸다. 그 영상이 하룻밤에 1억 번 재생됐다.'],
  ['탈춤과 빙상 공연을 잇는다',{a:3,u:-3},'얼음 위에서 탈을 쓴 무용수들이 돌았다. 외신은 "가장 낯설고 아름다운 개막식"이라고 썼다.'],
  ['다섯 아이의 겨울 이야기',{a:4,saf:1},'아이 다섯이 시간 여행을 하는 이야기로 꾸몄다. 관중석의 아이들이 끝까지 졸지 않았다.']])}];
const WOLY_MID=[
 {e:spEv('개막식 한파','개막식 날 밤 <em>체감 영하 20도</em>가 예보됐다. 지붕 없는 경기장에 관중 3만 명이 들어온다.',[
  ['방한 담요·핫팩·우의를 모두에게 나눠 준다',{e:-3,a:4,saf:3},'3만 명이 똑같은 담요를 둘렀다. 그 담요가 대회 최고의 기념품이 됐다.'],
  ['개막식을 한 시간 줄인다',{a:-1,saf:2},'공연 몇 개가 빠졌다. 아무도 얼지 않았다.'],
  ['예정대로 치른다',{e:1,saf:-4,a:-2},'저체온증으로 실려 간 관중이 나왔다. 다음 날 신문은 공연이 아니라 그 이야기를 썼다.']])},
 {e:spEv('선수촌 노로바이러스','선수촌과 보안 요원 숙소에서 <em>노로바이러스</em>가 퍼졌다. 확진자가 백 명을 넘었다.',[
  ['격리하고 군 인력을 대체 투입한다',{m:4,p:3,e:-2},'군복을 입은 보안 요원들이 경기장 문을 지켰다. 대회는 멈추지 않았다.'],
  ['급식 업체를 바꾸고 매일 수치를 공개한다',{trn:5,m:2,e:-2},'숫자가 매일 줄어드는 게 보였다. 불안도 함께 줄었다.'],
  ['조용히 넘긴다',{trn:-5,c:3,a:-2},'외신이 먼저 썼다. "숨기는 개최국"이라는 제목이었다.']])},
 {e:spEv('피겨 판정 논란','피겨스케이팅 결승에서 <em>석연치 않은 판정</em>이 나왔다. 우리 선수가 0.3점 차로 은메달에 그쳤다.',[
  ['국제빙상연맹에 공식 제소한다',{a:4,u:2,chk:2},'제소는 기각됐다. 국민들은 정부가 싸워 줬다고 기억했다.'],
  ['선수의 연기를 먼저 축하한다',{a:3,u:-3},'"은메달이 아니라 그 4분을 기억해 달라." 선수의 말이 더 오래 남았다.'],
  ['판정단 구성을 공개하라고 요구한다',{trn:5,u:1},'판정 기록이 공개됐다. 다음 대회부터 심판 이름을 숨기지 않게 됐다.']])},
 {e:spEv('폭설로 길이 끊겼다','밤새 <em>폭설 50cm</em>가 내렸다. 산간 경기장으로 가는 길이 막혀 셔틀버스가 멈췄다.',[
  ['군 제설 장비를 총동원한다',{p:3,mil:2,a:3,e:-1},'새벽 네 시에 길이 뚫렸다. 첫 경기는 예정대로 열렸다.'],
  ['경기를 하루 미룬다',{saf:4,a:-1},'아무도 다치지 않았다. 일정표가 하루씩 밀렸다.'],
  ['기차를 늘려 관중을 나른다',{e:-2,a:2,saf:2},'눈 덮인 산을 가르는 기차 사진이 세계로 퍼졌다.']])},
 {e:spEv('컬링 열풍','컬링 대표팀 경기 시청률이 <em>40%</em>를 넘었다. 동네 빙상장마다 컬링을 배우겠다는 문의가 쏟아진다.',[
  ['전국에 컬링장을 짓겠다고 약속한다',{a:5,e:-4,saf:2},'약속은 박수를 받았다. 몇 곳은 끝내 지어지지 않았다.'],
  ['학교 체육 수업에 넣는다',{saf:3,a:3,e:-1},'체육관 바닥에 테이프로 하우스를 그렸다. 빗자루가 동났다.'],
  ['열기는 열기대로 둔다',{a:-1},'열풍은 한 달 만에 식었다. 빙상장은 다시 조용해졌다.']])},
 {e:spEv('경기장 사후 활용','대회가 끝나면 쓸 데가 없는 <em>경기장 셋</em>을 어떻게 할지 묻는 기사가 쏟아졌다. 하나는 산림을 깎아 지은 활강장이다.',[
  ['활강장 산림을 복원하겠다고 발표한다',{trn:3,a:3,e:-3},'환경 단체가 환영했다. 복원비는 다음 예산에 실렸다.'],
  ['국가대표 훈련장으로 남긴다',{e:-2,saf:2,mil:1},'경기장은 남았다. 관리비도 남았다.'],
  ['민간에 팔아 관광지로 만든다',{e:4,c:3,trn:-2},'호텔이 들어섰다. 헐값 매각이라는 기사가 뒤따랐다.']])},
 {only:'kr',e:spEv('응원단 입국','공동 응원단 <em>수백 명이 입국</em>했다. 경기장마다 그들을 보려는 사람들로 붐빈다.',[
  ['환영 행사를 연다',{u:-4,a:3,p:1},'박수와 항의 집회가 같은 날 열렸다.'],
  ['조용히 경기만 응원하게 한다',{u:-1,saf:2},'응원 소리만 남았다. 사진은 많지 않았다.'],
  ['동선을 엄격히 통제한다',{p:3,u:2,chk:-2},'경찰이 응원단을 둘러쌌다. "응원인가 행진인가"라는 말이 나왔다.']])}];
const OLY_WINTER={pre:WOLY_PRE,mid:WOLY_MID,sp:['skate','curl','jump','hockey'],last:'hockey'};
const wolySp=()=>(SP[CP.id]||[]).find(s=>WOLY_IDS.indexOf(s.id)>=0);
// 하계올림픽을 시작하면 2년 뒤를 적어 둔다. 동계를 시작하면 지운다
function wolyMark(sp,y){if(sp.id==='olym'||sp.id==='olym_u')CAR.wolyAt=careerYear(y)+2;else if(WOLY_IDS.indexOf(sp.id)>=0)CAR.wolyAt=null;}
const wolyDue=y=>!!(CAR.wolyAt!=null&&wolySp()&&careerYear(y)>=CAR.wolyAt);
// 개막 안내: 그해 과제 판 대신 뜬다. 단추 하나로 개막한다
function wolyOpen(go,y){const sp=wolySp(),X=SPX[sp.id]||SPX.g20,key=sp.id+'_'+CAR.term,usa=CP.id==='usa';window.scrollTo(0,0);
  R.innerHTML='<div class="spw wo" style="animation:fdIn .35s ease-out"><div style="font-size:12px;font-weight:600;color:var(--text-muted)">'+CAR.term+'기 '+(y+1)+'년차를 앞두고</div>'+
   '<div class="hd" style="font-size:26px;margin:2px 0 4px">'+sp.n+' 개막</div>'+
   '<div class="wo-card" style="--sb:'+X.bg+';--sa:'+X.ac+'"><svg class="spb-art" viewBox="0 0 120 120" aria-hidden="true">'+SPX_ART[X.art]+'</svg>'+
   '<div><b>2년 전 하계올림픽에 이어</b><p>'+(usa?'미국':'대한민국')+'이 이번에는 눈과 얼음의 대회를 연다. 올해는 다른 특별 국정 과제를 벌이지 않는다.</p>'+
   '<span class="wo-sp">쇼트트랙 · 컬링 · 스키점프 · 아이스하키 가운데 두 종목을 직접 치를 수 있다</span></div></div>'+
   '<button id="woGo" class="pri" style="width:100%;padding:15px;font-size:15px;margin-top:14px">개막한다</button></div>';
  document.getElementById('woGo').onclick=()=>{SFX.special();CAR.boardLog=CAR.boardLog||[];CAR.boardLog.push(CAR.term+'기 '+(y+1)+'년: '+sp.n+' (하계올림픽 2년 뒤)');startSpecial(sp,key,y);go();};}
SP.kr.push({id:'wolym',n:'동계올림픽',k:'good',tro:['동계올림픽 개최국','빙판 위의 적자'],cond:()=>false,
  bn:{k:'good',h:'동계올림픽 개막',s:'하계 2년 만에 다시 성화… "두 올림픽을 잇달아 치른 나라"',b:'눈과 얼음의 무대다. 잘 치르면 유산이 되고, 망치면 빈 경기장이 남는다.'},
  steps:olySteps(c=>spEv('동계올림픽 개최지','<em>동계올림픽</em>이 열린다. 2년 전 하계올림픽을 치른 나라라 세계의 눈이 다시 쏠린다. 설상과 빙상의 무대를 어디에 세울까.',[
     ['평창·강릉 — 2018년 경기장을 다시 쓴다',{e:4,a:3,trn:2},'녹슬던 경기장에 다시 불이 켜졌다. "두 번 쓰는 올림픽"이라는 기사가 났다.',null,{ctx:['open','평창']}],
     ['서울·강원 공동 개최 — 빙상은 서울, 설상은 강원',{a:4,e:-2,u:-2},'지하철을 타고 피겨를 보러 가는 올림픽이 됐다. 강원의 산은 조금 쓸쓸했다.',null,{ctx:['open','서울·강원']}],
     ['무주·전북 — 새 경기장을 지어 지역을 살린다',{u:-5,e:-5,a:2,c:3},'산골 마을에 경기장 셋이 섰다. 공사비는 예상의 두 배였다.',null,{ctx:['open','무주']}]]),
   c=>spEv('동계올림픽 폐막식','폐막식 날이다. <em>'+(c.open||'개최 도시')+'</em>의 눈과 얼음을 어떻게 남길까.',[
     ['개최 도시에서 그대로 닫는다',{e:2,a:2},'눈 덮인 경기장에 마지막 불꽃이 올랐다. 깔끔했다.'],
     ['경기장을 시민 빙상장으로 연다고 발표한다',{saf:3,u:-2,e:-1},'폐막 다음 날부터 아이들이 줄을 섰다. 관리비는 시가 떠안았다.'],
     ['하계·동계 메달리스트가 함께 무대에 선다',{a:4,u:-2,e:-1},'두 대회의 영웅들이 한 무대에 섰다. "올림픽의 나라"라는 말이 나왔다.']]),OLY_WINTER)});
SP.usa.push({id:'wolym_u',n:'동계올림픽',k:'good',tro:['동계올림픽의 성공','텅 빈 스키장'],cond:()=>false,
  bn:{k:'good',h:'동계올림픽 개막',s:'LA 2년 만에 다시 성화… 로키산맥에 오륜기',b:'세계가 다시 미국을 지켜본다.'},
  steps:olySteps(c=>spEv('동계올림픽 개최지','<em>동계올림픽</em>이 열린다. 2년 전 LA 올림픽을 치른 나라라 세계의 눈이 다시 쏠린다. 어디서 치를까.',[
     ['솔트레이크시티 — 2002년 경기장을 되살린다',{e:4,a:2,trn:2},'오래된 경기장에 새 조명이 켜졌다. 흑자 대회가 될 거라는 전망이 나왔다.',null,{ctx:['open','솔트레이크시티']}],
     ['레이크플래시드 — 작은 마을의 세 번째 대회',{a:4,u:-3,e:-2},'인구 3천 명 마을에 세계가 몰려왔다. "빙판 위의 기적"을 다시 보자는 응원이 붙었다.',null,{ctx:['open','레이크플래시드']}],
     ['덴버 — 1976년에 반납했던 대회를 다시 연다',{e:-3,a:3,c:2},'반세기 전에 돌려준 대회를 되찾았다. 주민 투표는 아슬아슬하게 통과했다.',null,{ctx:['open','덴버']}]]),
   c=>spEv('동계올림픽 폐막식','대회가 끝났다. <em>'+(c.open||'개최 도시')+'</em>에 무엇을 남길까.',[
     ['흑자 대회를 발표한다',{e:4,a:1,trn:-1},'"올림픽은 돈이 된다"는 말이 다시 돌았다.'],
     ['선수들을 백악관에 초청한다',{a:4},'메달리스트들이 대통령과 눈싸움을 하는 사진이 나왔다.'],
     ['경기장을 지역 대학에 넘긴다',{e:2,saf:2},'경기장은 대학 훈련장이 됐다. 관리비는 대학이 떠안았다.']]),OLY_WINTER)});
// 판의 6칸과 조건. 조건 하나 = [화면 지표, 비교, 기준] 또는 특별한 조건 이름
const BOARD={kr:['amend','olym','expo','peace','war_k','pand_k'],joseon:['jikgye','envoy','gwageo','compile','war_j','pand_j'],usa:['amend22','moon','war_u','pand_u','olym_u','newdeal']};
// 2기(두 번째 치세)부터는 임기마다 판을 다시 짠다: 첫 칸은 권력 과제(대한민국은 연임 개헌이 통과된 뒤로 비상계엄), 나머지 다섯은 아래 묶음에서
// 지난 임기에 하지 않은 것을 먼저, 그다음 해 본 것을(임기마다 다시 할 수 있다) 고른다. 같은 임기 안에서는 판이 그대로다(임기 번호로 순서를 정한다)
const BOARD_POOL={kr:['olym','expo','peace','war_k','pand_k','g20'],joseon:['envoy','gwageo','compile','war_j','pand_j'],usa:['moon','war_u','pand_u','olym_u','newdeal']};
function boardIds(){const C=CP.id,base=BOARD[C]||[];let pw=base[0];
  if(C==='kr'&&CAR.amendPerm)pw='coup';   // 연임 개헌을 한 번 이룬 뒤에는 권력 칸이 비상계엄으로 바뀐다
  if(CAR.term<=1)return [pw].concat(base.slice(1));
  // 대한민국 방역 총력전은 코로나(1기) 과제라 2기부터는 판에 올리지 않는다(그 자리에 G20 정상회의가 들어온다)
  const P=(BOARD_POOL[C]||base.slice(1)).filter(id=>id!=='pand_k'||isCov()),prev=CAR.term-1,did=id=>!!(CAR.spDone&&CAR.spDone[id+'_'+prev]),seed=CAR.term*7+3;
  // 임기 번호로 섞는다(같은 임기에는 같은 판)
  P.sort((a,b)=>((a.charCodeAt(0)*31+a.length*7+seed)%11)-((b.charCodeAt(0)*31+b.length*7+seed)%11));
  const fresh=P.filter(id=>!did(id)),old=P.filter(id=>did(id));
  return [pw].concat(fresh.concat(old).slice(0,5));}
const NEED={amend:[['P','>=',50]],coup:[['P','>=',70],['M','>=',65],['NODICT']],g20:[['A','>=',50],['E','>=',50],['P','<=',50]],olym:[['E','>=',57],['A','>=',52],['H','>=',55]],expo:[['E','>=',53],['X','<=',30]],peace:[['X','<=',30],['NOWAR']],war_k:[['M','>=',65]],pand_k:[['COV'],['I','>=',20]],
 jikgye:[['P','>=',50]],envoy:[['A','>=',45],['E','>=',47]],gwageo:[['X','<=',30],['P','<=',50]],compile:[['E','>=',55],['X','<=',30]],war_j:[['M','>=',65]],pand_j:[['I','>=',25]],
 amend22:[['T2'],['P','>=',50]],moon:[['E','>=',58],['X','<=',30]],war_u:[['M','>=',65]],pand_u:[['I','>=',25]],olym_u:[['E','>=',55],['A','>=',50]],newdeal:[['E','<=',45]]};
function needEval(n){if(n[0]==='NOWAR')return {ok:SCX().id!=='war',txt:'전쟁 위기가 아닐 때'};
  if(n[0]==='COV')return {ok:isCov(),txt:'코로나 위기 중(1기)'};
  if(n[0]==='NODICT')return {ok:!CAR.dict,txt:'아직 영구집권하지 않았다'};
  if(n[0]==='T2')return {ok:CAR.term>=2,txt:'2기 임기 중'};
  if(n[0]==='UNIFY')return {ok:SCX().id==='unify',txt:'통일 위기 중'};
  const v=Math.round(n[0]==='I'?S.i:vVal(n[0])),nm=n[0]==='I'?'위기 지수':vName(n[0]),ok=n[1]==='>='?v>=n[2]:v<=n[2];
  return {ok:ok,txt:nm+' '+n[2]+(n[1]==='>='?' 이상':' 이하'),cur:v};}
function startSpecial(sp,key,y){dcSeed('sps'+key);CAR.spDone[key]=1;wolyMark(sp,y);CAR.spLog=CAR.spLog||[];CAR.spLog.push(CAR.term+'기 '+(y+1)+'년 '+sp.n);
  CAR.spRun={id:sp.id,n:sp.n,k:sp.k,tro:sp.tro,ok:0,done:0,total:sp.steps.length,ctx:{}};
  sp.steps.forEach((f,i)=>queue.splice(i,0,{sg:[sp.id,i]}));pendingNews=Object.assign({},sp.bn);bgmGame();}
function spBoard(go){dcSeed('spb');const y=Math.round(S.turn/PY);if(y>=YRS)return go();CAR.spDone=CAR.spDone||{};window.scrollTo(0,0);
  if(wolyDue(y))return wolyOpen(go,y);   // 하계올림픽 2년 뒤: 그해는 판 대신 동계올림픽
  // 판의 과제는 임기마다 다시 할 수 있다(이 임기에 이미 치른 것만 막힌다)
  const L=boardIds().map(id=>{const sp=(SP[CP.id]||[]).find(s=>s.id===id);if(!sp)return null;const key=sp.id+'_'+CAR.term,nd=(NEED[id]||[]).map(needEval);
    return {sp:sp,key:key,done:!!CAR.spDone[key],nd:nd,ok:nd.every(x=>x.ok)};}).filter(Boolean);
  let sel=-1;
  const draw=()=>{R.innerHTML='<div class="spw" style="animation:fdIn .35s ease-out"><div style="font-size:12px;font-weight:600;color:var(--text-muted)">'+(CP.id==='joseon'?CAR.term+'번째 치세':CAR.term+'기')+' '+(y+1)+'년차를 앞두고</div>'+
     '<div class="hd" style="font-size:26px;margin:2px 0 4px">특별 국정 과제</div><div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-bottom:14px">올해 벌일 큰일을 하나 고를 수 있다. 조건을 채운 과제만 색이 들어온다. 하지 않고 넘어가도 된다.'+(CAR.term>1?' <b>'+(CP.id==='joseon'?'치세':'임기')+'가 바뀌어 과제 판도 새로 짜였다.</b>':'')+'</div>'+tip('board')+
     '<div class="spb-g">'+L.map((x,j)=>{const X=SPX[x.sp.id]||SPX.g20,on=x.ok&&!x.done;
       return '<button class="spb'+(on?' on':'')+(sel===j?' sel':'')+'" data-j="'+j+'"'+(on?'':' disabled')+' style="--sb:'+X.bg+';--sa:'+X.ac+'">'+
        '<svg class="spb-art" viewBox="0 0 120 120" aria-hidden="true">'+SPX_ART[X.art]+(X.ch?'<text x="60" y="76" text-anchor="middle" font-size="44" font-weight="800" stroke="none" fill="currentColor">'+X.ch+'</text>':'')+'</svg>'+
        '<span class="spb-k">'+(x.sp.k==='power'?'권력':'국정')+'</span><b class="spb-n">'+x.sp.n+'</b>'+
        '<span class="spb-c">'+x.nd.map(n=>'<i class="'+(n.ok?'y':'n')+'">'+(n.ok?'✓':'✗')+' '+n.txt+(n.cur!=null?' <small>(지금 '+n.cur+')</small>':'')+'</i>').join('')+'</span>'+
        (x.done?'<span class="spb-st">'+(CAR.term>1||CP.id==='joseon'?'이번 '+(CP.id==='joseon'?'치세':'임기')+'에 치렀다':'이미 치렀다')+'</span>':'')+'</button>';}).join('')+'</div><div class="spw-bt">'+
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
// 다른 조각의 경기(lz)는 그 조각을 먼저 받아 둔다. 시뮬레이션 결과를 바로 돌려받아야 해서다
function mgRun(kind,box){const G=MG_SPORT[kind];if(G)return G.lz?lzThen(G.lz,()=>mgPick(kind,box)):mgPick(kind,box);
  box.innerHTML='<div class="mgx"><div class="mgx-h">백신 슬래시 · 현장 지휘</div><div class="mgx-t">손가락(또는 마우스)으로 화면을 그어 바이러스를 벤다. 시민을 베거나 바이러스를 놓치면 병상이 줄고, 병상이 바닥나면 끝난다. 결과는 등급으로 매겨진다.</div><button id="mgxGo" class="pri" style="width:100%;padding:14px">현장 지휘 시작</button></div>';
  document.getElementById('mgxGo').onclick=()=>{try{aInit();}catch(e){}mini(null,(gr,sc)=>{CAR.slashGrade=gr;RUN.slash=(RUN.slash?RUN.slash+' / ':'')+gr+' '+sc;mgResolve(gr==='S'?0:gr==='A'?1:gr==='B'?2:3);});};}
// 체육 종목(양궁·수영·승부차기)은 먼저 직접 할지, 시뮬레이션으로 맡길지 고른다.
// 시뮬레이션은 직접 할 때와 같은 판정 규칙을 '평균적인 실력의 선수'로 돌려 결과만 보여 준다.
const MG_SPORT={
  arch:{n:'양궁 개인전 결승',how:'바람을 읽고 흔들리는 조준점을 맞춰 여섯 발을 쏜다',run:(b,d)=>mgArch(b,d),sim:()=>simArch()},
  swim:{n:'수영 50m 결승',how:'왼팔·오른팔을 번갈아 빠르게 눌러 헤엄친다',run:(b,d)=>mgSwim(b,d),sim:()=>simSwim()},
  pk:{n:'축구 결승 승부차기',how:'우리 차례엔 직접 차고, 상대 차례엔 직접 막는다',run:(b,d)=>mgPK(b,d),sim:()=>simPK()},
  tkd:{n:'태권도 결승',how:'상대의 발차기를 막고 반격해 점수를 딴다',run:(b,d)=>mgTkd(b,d),sim:()=>simTkd()},
  // 동계 종목: 종목마다 조각이 따로 있다
  skate:{n:'쇼트트랙 500m 결승',how:'곧은 길에서 밀고, 코너 앞에서 떼어 속도를 맞춘다',run:(b,d)=>mgSkate(b,d),sim:()=>simSkate(),lz:'wskate'},
  curl:{n:'컬링 결승 마지막 엔드',how:'겨누고 회전을 고른 뒤 세기를 멈추고 연타로 스위핑한다',run:(b,d)=>mgCurl(b,d),sim:()=>simCurl(),lz:'wcurl'},
  jump:{n:'스키점프 라지힐 결승',how:'도약·돌풍·착지, 표시가 맞물릴 때 한 번씩 누른다',run:(b,d)=>mgJump(b,d),sim:()=>simJump(),lz:'wjump'},
  hockey:{n:'아이스하키 결승',how:'스트라이커를 끌어 퍽을 쳐서 상대 골문에 넣는다',run:(b,d)=>mgHockey(b,d),sim:()=>simHockey(),lz:'whockey'},
  // 체육 종목이 아닌 경기: 시상식(nc) 없이 바로 판정한다
  war:{n:'전선 배치',how:'사흘 동안 세 전선에 병력을 나눠 보낸다',run:(b,d)=>mgWar(b,d),sim:()=>simWar(),nc:1,lz:'games',
    pick:'직접 지휘하면 판단만큼 결과가 나온다. 맡기면 참모들이 알아서 배치하고, 결과만 빠르게 본다.',simN:'참모본부에 맡긴다',simS:'작전 참모들이 배치하고 결과만 본다'},
  moon:{n:'달 착륙',how:'주 엔진과 좌우 분사로 표지 위에 내려앉는다',run:(b,d)=>mgMoon(b,d),sim:()=>simMoon(),nc:1,lz:'games',
    pick:'직접 내리면 손끝만큼 결과가 나온다. 맡기면 자동 착륙 장치가 내리고, 결과만 빠르게 본다.',simN:'자동 착륙 장치에 맡긴다',simS:'컴퓨터가 내리고 결과만 본다'}};
// 메달 집계 한 줄(상황판·특집 머리에서도 쓴다)
const olyTally=m=>'<span>메달 집계</span>'+['금','은','동'].map((x,k)=>'<i class="m'+k+'">'+x+'</i><b>'+m[k]+'</b>').join('');
