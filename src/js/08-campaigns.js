/* ---------- 캠페인: 기본(대한민국) + DLC(조선, 미국) ---------- */
// 지표 색: 화면 위 지표판과 선택지 상자가 같은 색을 쓴다. 상자 색을 보면 그 선택이 어떤 지표를 움직이는지 한눈에 보인다.
const SCOL={a:'#8f6a12',i:'#b3261e',m:'#56c7e8',e:'#2e7d55',p:'#3d5a80',c:'#d4884f',u:'#a8406f',chk:'#2f5f99',trn:'#cfd6de',saf:'#a3d95b'};
const SORD=['a','e','m','i','u','c','p','chk','trn','saf'];
const KN0={a:'지지율',i:'확산',m:'의료',e:'경제',p:'행정 권한',c:'유착',u:'갈등',chk:'견제',trn:'투명성',saf:'안전망',mil:'군사'};
const CAMPS={
 kr:{id:'kr',n:'대한민국',tag:'기본',sub:'5년 단임 대통령 · 팬데믹, 그리고 그 뒤의 위기',role:'대통령',yrs:5,maxT:5,rule:'single',scen0:'covid',post:['oil','war','fin','clim'],
  intro:'5년 단임이다. 임기를 마치면 물러나야 한다. 다만 <b>권력이 크게 커지면</b> 연임 개헌의 길이 열린다. 첫 임기는 팬데믹으로 시작한다.',lbl:{}},
 joseon:{id:'joseon',n:'조선',tag:'DLC',sub:'국왕의 치세 · 기근과 전란, 붕당과 세도',role:'왕',yrs:5,maxT:4,rule:'reign',scen0:'famine',post:['wae','plague','revolt'],
  intro:'선거도, 5년마다의 심판도 없다. 대신 다스리며 쌓인 일이 그 임금의 시대에 실제로 있었던 <b>국난</b>(세종이면 대마도 정벌 · 파저강 여진, 선조면 임진왜란 · 정여립 사건)으로 닥친다. 국난에서 왕권을 지켜야 치세가 이어진다. 세자에게 선위할지, 끝까지 옥좌를 지킬지는 당신이 정한다.',
  lbl:{a:'민심',m:'구휼',e:'국고',p:'왕권',c:'세도',u:'당쟁',chk:'간쟁',trn:'언로',saf:'환곡'},init:{i:14,m:58,a:55,e:54,p:40,c:17,u:33,chk:70,trn:55,saf:50},tdk:.8,mk:.06},
 usa:{id:'usa',n:'미국',tag:'DLC',sub:'4년 중임 대통령 · 불황과 재난, 분열된 의회',role:'대통령',yrs:4,maxT:5,rule:'two',scen0:'recess',post:['storm','war2'],
  intro:'4년 중임제다. 재선까지는 선거로 가능하고, 세 번째 임기는 수정헌법 22조가 막는다. 두 번째 임기에 <b>권력이 크게 커지면</b> 그 조항을 없애려는 움직임이 생긴다.',
  lbl:{c:'로비 유착',u:'양극화',chk:'의회·법원 견제',saf:'사회 안전망'},init:{i:14,m:60,a:60,e:60,p:34,c:16,u:34,chk:78,trn:66,saf:48}},
 // 전쟁기 독일: 선거 없는 일당 군사 국가. 1기(6년)가 세계대전이고, 1기가 끝날 때 승패가 갈린다(36-dlc-reich-flow.js)
 reich:{id:'reich',n:'전쟁기 독일',tag:'비밀',sub:'추축국 지도자 · 세계대전, 그리고 실제 역사',role:'지도자',yrs:6,maxT:4,rule:'reign',scen0:'ww2',post:['occupy','resist','coldw'],
  intro:'히틀러 · 무솔리니 같은 실제 추축국 지도자로 나라를 이끈다. 선택은 자유지만, 실제 역사가 있었던 사건에서는 <b>그때 실제로 무슨 일이 있었는지</b>가 함께 뜬다. 첫 6년은 <b>세계대전</b>이다. 이기면 제국이 이어지고, 지면 정권이 무너지며 <b>라인강의 기적</b> 에피소드가 열린다.',
  lbl:{a:'민심',m:'보급·의무',e:'전시 경제',p:'당의 장악력',c:'간부 부패',u:'내부 반발',chk:'군부 견제',trn:'언론 자유',saf:'배급'},init:{i:30,m:50,a:58,e:56,p:62,c:22,u:30,chk:40,trn:22,saf:40,mil:62},
  rgT:{termL:n=>n+'기 통치',lastMsg:'권좌에 오른 지 {Y}년. <b>이제 후계자에게 자리를 넘길 때다.</b>',heir:'후계자에게 권력을 넘긴다',finSub:'통치를 마친다',heirSub:'스스로 물러나 당 원로가 된다',
   dead:'민심도 군도 떠났다. <b>장교들이 관저를 포위했다.</b>',deadBtn:'운명을 맞는다',deadSub:'쿠데타가 일어난다',shaky:'민심이 흔들린다',shaky2:'민심은 버티지만 장교단이 술렁인다',
   cont:'통치를 이어 가면',risk:'쿠데타가 일어날 가능성',riskS:'쿠데타 위험',why:['민심','오래된 집권','내부 반발 · 부패'],calm:'체제가 안정돼 있다. <b>권력을 이어 갈 수 있다.</b>',run:n=>n+'기 통치를 이어 간다',
   runSub:'다음 기에는 새로운 시련이 온다',evalN:'통치 평가',evalT:'이번 통치의 평가',endA:'통치 끝의 민심',deadMark:'쿠데타',dRun:'통치를 이어 감',dRetire:'권력 이양 (이어 갈 수 있었음)',dDead:'쿠데타',dFin:'통치 완료',
   plotLab:n=>'쿠데타 모의 · '+n+'기 통치의 문턱',plotH:'관저 밖이 술렁인다',plotD:'장교 몇이 쿠데타를 꾀한다는 밀고가 들어왔다. 군과 당은 누구 편에 설 것인가.',plotBar:'지도자 편에 선 병력',
   won:'쿠데타를 진압했다',lost:'쿠데타가 일어났다',wonS:'진압',lostS:'축출',ok:'쿠데타 진압',fail:'쿠데타',stab:n=>n+'기 체제 안정',elT:n=>n+'기 통치 ',start:n=>n+'기 통치 시작',kind:'purged'}},
 // 에피소드 · 라인강의 기적: 전쟁기 독일에서 지면 열린다. 총리는 임기 제한이 없고, 4년마다 연방의회 선거로 신임을 묻는다
 bonn:{id:'bonn',n:'라인강의 기적',tag:'에피소드',sub:'서독 총리 · 폐허에서 경제 기적, 그리고 통일',role:'총리',yrs:4,maxT:4,rule:'free',scen0:'ruin',post:['berlin','terror','unify'],
  intro:'1949년, 폐허 위에 새 공화국이 섰다. 총리는 임기 제한이 없고, 4년마다 <b>연방의회 선거</b>로 신임을 묻는다. 무너진 도시와 배급표, 갈라진 나라에서 <b>라인강의 기적</b>을 일으켜라.',
  lbl:{p:'총리 권한',c:'정경 유착',u:'사회 갈등',chk:'의회·헌재 견제',saf:'사회 안전망'},init:{i:40,m:44,a:54,e:38,p:30,c:14,u:36,chk:72,trn:58,saf:38,mil:24}}};
CAMPS.joseon.advN=['영의정','병조판서'];CAMPS.joseon.vl={P:'왕권',C:'부패'};CAMPS.usa.advN=['비서실장','선거 전략가'];
CAMPS.joseon.bg=BG_J;CAMPS.joseon.ev=EV_J;CAMPS.joseon.adv=ADV_J;CAMPS.joseon.news=NEWS_J;CAMPS.joseon.rp=RP_J;CAMPS.joseon.dict=DICT_J;
CAMPS.usa.bg=BG_U;CAMPS.usa.ev=EV_U;CAMPS.usa.adv=ADV_U;CAMPS.usa.news=NEWS_U;CAMPS.usa.rp=RP_U;CAMPS.usa.dict=DICT_U;
CAMPS.reich.advN=['참모총장','선전부 차관'];CAMPS.reich.vl={P:'당 장악',C:'부패'};CAMPS.bonn.advN=['총리실장','당 사무총장'];
CAMPS.reich.bg=BG_R;CAMPS.reich.ev=EV_R;CAMPS.reich.adv=ADV_R;CAMPS.reich.news=NEWS_R;CAMPS.reich.rp=RP_R;CAMPS.reich.dict=DICT_R;
CAMPS.bonn.bg=BG_B;CAMPS.bonn.ev=EV_B;CAMPS.bonn.adv=ADV_B;CAMPS.bonn.news=NEWS_B;CAMPS.bonn.rp=RP_B;CAMPS.bonn.dict=DICT_B;
CAMPS.kr.bg=BG;CAMPS.kr.ev=EV;

