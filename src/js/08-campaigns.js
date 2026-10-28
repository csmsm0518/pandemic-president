/* ---------- 캠페인: 기본(대한민국) + DLC(조선, 미국) ---------- */
// 지표 색: 화면 위 지표판과 선택지 상자가 같은 색을 쓴다. 상자 색을 보면 그 선택이 어떤 지표를 움직이는지 한눈에 보인다.
const SCOL={a:'#8f6a12',i:'#b3261e',m:'#56c7e8',e:'#2e7d55',p:'#3d5a80',c:'#d4884f',u:'#a8406f',chk:'#2f5f99',trn:'#cfd6de',saf:'#a3d95b'};
const SORD=['a','e','m','i','u','c','p','chk','trn','saf'];
const KN0={a:'지지율',i:'확산',m:'의료',e:'경제',p:'행정 권한',c:'유착',u:'갈등',chk:'견제',trn:'투명성',saf:'안전망',mil:'군사'};
const CAMPS={
 kr:{id:'kr',n:'대한민국',tag:'기본',sub:'5년 단임 대통령 · 팬데믹, 그리고 그 뒤의 위기',role:'대통령',yrs:5,maxT:5,rule:'single',scen0:'covid',post:['oil','war','fin','clim'],
  intro:'5년 단임이다. 임기를 마치면 물러나야 한다. 다만 <b>권력이 크게 커지면</b> 연임 개헌의 길이 열린다. 첫 임기는 팬데믹으로 시작한다.',lbl:{}},
 joseon:{id:'joseon',n:'조선',tag:'DLC',sub:'국왕의 치세 · 기근과 전란, 붕당과 세도',role:'왕',yrs:5,maxT:4,rule:'reign',scen0:'famine',post:['wae','plague','revolt'],
  intro:'선거는 없다. 치세 5년마다 민심의 심판이 있다. 민심이 무너지면 <b>반정</b>이 일어난다. 세자에게 선위할지, 끝까지 옥좌를 지킬지는 당신이 정한다.',
  lbl:{a:'민심',m:'구휼',e:'국고',p:'왕권',c:'세도',u:'당쟁',chk:'간쟁',trn:'언로',saf:'환곡'},init:{i:14,m:58,a:55,e:54,p:40,c:17,u:33,chk:70,trn:55,saf:50},tdk:.8,mk:.06},
 usa:{id:'usa',n:'미국',tag:'DLC',sub:'4년 중임 대통령 · 불황과 재난, 분열된 의회',role:'대통령',yrs:4,maxT:5,rule:'two',scen0:'recess',post:['storm','war2'],
  intro:'4년 중임제다. 재선까지는 선거로 가능하고, 세 번째 임기는 수정헌법 22조가 막는다. 두 번째 임기에 <b>권력이 크게 커지면</b> 그 조항을 없애려는 움직임이 생긴다.',
  lbl:{c:'로비 유착',u:'양극화',chk:'의회·법원 견제',saf:'사회 안전망'},init:{i:14,m:60,a:60,e:60,p:34,c:16,u:34,chk:78,trn:66,saf:48}}};
CAMPS.joseon.advN=['영의정','병조판서'];CAMPS.joseon.vl={P:'왕권',C:'부패'};CAMPS.usa.advN=['비서실장','선거 전략가'];
CAMPS.joseon.bg=BG_J;CAMPS.joseon.ev=EV_J;CAMPS.joseon.adv=ADV_J;CAMPS.joseon.news=NEWS_J;CAMPS.joseon.rp=RP_J;CAMPS.joseon.dict=DICT_J;
CAMPS.usa.bg=BG_U;CAMPS.usa.ev=EV_U;CAMPS.usa.adv=ADV_U;CAMPS.usa.news=NEWS_U;CAMPS.usa.rp=RP_U;CAMPS.usa.dict=DICT_U;
CAMPS.kr.bg=BG;CAMPS.kr.ev=EV;

