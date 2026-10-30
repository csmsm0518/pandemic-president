/* ---------- 오늘의 도전: 하루 한 판, 모두가 같은 조건 ----------
   날짜(한국 시간)로 그날의 판을 정한다: 무대는 대한민국 · 조선 · 미국을 날마다 돌아가며, 출발 인물은 그 무대의 기본 인물 가운데 하나,
   난이도 보통 · 속전속결 · 한 임기. 순위에는 그날 처음 시작한 판만 올라가고(첫 판), 그 판을 마친 뒤에는 같은 판을 연습할 수 있다.
   같은 선택을 하면 같은 사건 · 같은 주사위가 나와야 비교가 공정하다. 그래서 도전 중에는 Math.random을 씨앗 있는 난수로 바꾸고,
   무작위로 결과를 정하는 자리마다(사건 고르기 · 판정 주사위 · 연말 · 선거 · 국난 …) '날짜 + 지금 위치(임기 · 차례 · 선택 수 · 운명 개입 수)'로
   씨앗을 다시 맞춘다(dcSeed). 화면 효과도 Math.random을 쓰지만, 결과를 정하기 직전에 씨앗을 다시 맞추므로 결과에는 끼어들지 못한다.
   창(오늘의 조건 · 순위)은 나중에 받는 조각 lazy/daily(dcOpen)가 그린다. */
const DC_CAMPS=['kr','joseon','usa'],DC_DAY0=Date.UTC(2026,0,1);
let DC=null;   // 도전 중이면 {date, base, ranked}
const DC_RAND0=Math.random;
const dcToday=()=>new Date(Date.now()+9*36e5).toISOString().slice(0,10);   // 한국 시간 날짜
const dcHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;};
let DC_S=0;
// mulberry32: 씨앗 하나로 0~1 난수를 차례로 낸다
function dcRand(){DC_S=(DC_S+0x6D2B79F5)>>>0;let t=DC_S;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
function dcSeed(tag){if(!DC)return;DC_S=dcHash(DC.base+'|'+tag+'|'+(CAR?CAR.term:0)+'|'+(S?S.turn:0)+'|'+(LOG?LOG.length:0)+'|'+(RUN?RUN.rr:0));}
// 그날의 조건. 출발 인물은 비밀 · 한 번뿐 · 조건부 인물을 뺀 기본 인물에서(기기마다 풀린 인물이 달라도 같게)
function dcConf(date){date=date||dcToday();const day=Math.floor((Date.parse(date+'T00:00:00Z')-DC_DAY0)/864e5),camp=DC_CAMPS[((day%3)+3)%3];
  const L=CAMPS[camp].bg.map((b,i)=>[b,i]).filter(x=>!x[0].sec&&!x[0].once&&!x[0].al&&!x[0].god);
  const pick=L[dcHash('pp-daily-bg|'+date)%L.length];
  return {date:date,camp:camp,bg:pick[1],B:pick[0],dif:1,mode:1};}
const dcRec=d=>(MEM.dc&&MEM.dc[d||dcToday()])||null;   // 이 기기의 그날 기록 {ranked:시작함, score, done}
const dcMode=()=>MODE.findIndex(m=>m.n==='속전속결');
// 도전 시작: ranked면 오늘의 첫 판(순위), 아니면 연습. 순위 판은 시작하는 순간 '오늘 첫 판'으로 적는다(중간에 나가도 다시 순위 판을 하지 못한다)
function dcStart(ranked,date){const C=dcConf(date),r=dcRec(C.date);if(ranked&&r&&r.ranked)ranked=false;
  camp=C.camp;bg=C.bg;dif=C.dif;mode=Math.max(0,dcMode());
  DC={date:C.date,base:'pp-daily|'+C.date,ranked:!!ranked};Math.random=dcRand;
  if(ranked){MEM.dc=MEM.dc||{};const keep={};Object.keys(MEM.dc).sort().slice(-13).forEach(k=>{keep[k]=MEM.dc[k];});MEM.dc=keep;MEM.dc[C.date]={ranked:1};msave();}
  // 나중에 받는 조각(미니게임 · 특별 과제 등)을 모두 받은 뒤에 시작한다. 처음 쓰는 순간에 받으면 그 조각의 무작위가 한 박자 늦게 돌아
  // 같은 선택에도 판이 달라졌다(같은 기기의 두 번째 판과 첫 판이 달랐다)
  const N=Object.keys(LZ_M);let i=0;const nx=()=>{if(i<N.length)return lzThen(N[i++],nx);start();};nx();}
// 도전이 끝나면(결산 · 메인 화면으로) 원래 난수로 되돌린다
function dcEnd(){if(Math.random!==DC_RAND0)Math.random=DC_RAND0;DC=null;}
// 결산: 순위 판의 점수를 이 기기에 남긴다(메인 화면 칸 · 도전 창에 보인다)
function dcDone(score){if(!DC)return;if(DC.ranked){const r=MEM.dc&&MEM.dc[DC.date];if(r){r.score=score;r.done=1;msave();}}}
const dcLabel=d=>{const p=String(d).split('-');return +p[1]+'월 '+(+p[2])+'일';};
// 메인 메뉴 칸의 작은 글: 오늘의 무대 · 인물, 마쳤으면 내 점수
function dcSub(){const C=dcConf(),r=dcRec();return r&&r.done?'오늘 '+Number(r.score).toLocaleString('ko-KR')+'점 · 순위 보기':r&&r.ranked?'오늘 도전함 · 순위 보기':CAMPS[C.camp].n+' · '+C.B.n+' · 속전속결';}
// 소리 · 배경음악 · 감염 지도 · 명언 고르기는 화면 꾸밈이다. 도전 중에도 이것들은 원래 난수를 쓰게 감싼다.
// 감싸지 않으면 소리를 켰는지, 앞 판에서 음악이 이미 골라졌는지에 따라 난수 줄이 밀려 같은 선택에도 시대 조건 · 결과가 달라졌다
const dcIso=f=>function(){if(!DC)return f.apply(this,arguments);const m=Math.random;Math.random=DC_RAND0;try{return f.apply(this,arguments);}finally{Math.random=m;}};
Object.keys(SFX).forEach(k=>{if(typeof SFX[k]==='function')SFX[k]=dcIso(SFX[k]);});
bgmCue=dcIso(bgmCue);bgmHold=dcIso(bgmHold);bgmInfo=dcIso(bgmInfo);bgmSkip=dcIso(bgmSkip);bgmSync=dcIso(bgmSync);bgmSet=dcIso(bgmSet);
bgmIntro=dcIso(bgmIntro);bgmGame=dcIso(bgmGame);bgmRamp=dcIso(bgmRamp);bgmLoad=dcIso(bgmLoad);
mapReset=dcIso(mapReset);mapUpdate=dcIso(mapUpdate);mapDraw=dcIso(mapDraw);mapLoop=dcIso(mapLoop);mapStart=dcIso(mapStart);
leaderQ=dcIso(leaderQ);quoteFx=dcIso(quoteFx);
