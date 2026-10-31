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
/* 메인 메뉴(가로 화면)의 오늘의 도전 칸 채우기. 메뉴 판은 옆의 기록 카드 높이에 맞춰 늘어나고, 다른 칸이 쓰고 남은 높이는 이 칸이 다 가져간다(CSS flex).
   남는 높이가 생기면 오른쪽에 오늘의 출발 인물 초상이 칸 높이만큼 커지며 들어오고, 그 아래로 조건 · 인물 소개 · 내 상태 · 인물 이야기를
   들어가는 만큼만 한 줄씩 더 보여 준다(dcFit). 줄은 칸 높이를 늘리지 않을 때만 보이므로 다른 칸이 밀리지 않는다.
   묶음을 펼쳐 남는 높이가 없어지면 다시 보통 칸으로 돌아간다. */
function dcFillHTML(){const C=dcConf(),r=dcRec(),B=C.B,jo=C.camp==='joseon';
  const st=r&&r.done?'순위 판을 마쳤어요 · 이제 연습할 수 있어요':r&&r.ranked?'순위 판을 시작했어요 · 끝까지 마쳐야 올라가요':'오늘 처음 시작한 판만 순위에 올라가요';
  const ln=(c,h)=>'<span class="gx-dcl'+(c?' '+c:'')+'">'+h+'</span>';
  // pic: 칸 오른쪽의 초상(칸 안 맨 끝) · txt: 글 칸(.gx-mt) 안, 작은 글 밑에 붙는 줄들
  return {pic:'<span class="gx-dcv" aria-hidden="true">'+portrait(B.n,'100%',0,1)+'</span>',
    txt:'<span class="gx-dcx" aria-hidden="true">'+
      ln('gx-dct','<i>보통</i><i>속전속결</i><i>한 '+(jo?'치세':'임기')+' · '+CAMPS[C.camp].yrs+'년</i>')+
      (B.k?ln('gx-dck','<b>'+gEsc(B.n)+'</b> '+gEsc(B.k)):'')+
      ln('gx-dcs',dcLabel(C.date)+' · '+st)+
      (B.s?ln('gx-dcb',gEsc(B.s)):'')+'</span>'};}
function dcFit(btn){if(!btn||!btn.querySelector('.gx-dcx'))return;
  const mt=btn.querySelector('.gx-mt'),base=[...mt.children].filter(e=>!e.classList.contains('gx-dcx')),L=[...btn.querySelectorAll('.gx-dcl')],GAP=5;
  const fit=()=>{if(!btn.isConnected){if(ro)ro.disconnect();return;}
    // 남는 높이 = 칸 안쪽 높이 - 제목 · 작은 글. 조금이라도 있으면 초상이 들어온다(.gx-dcf)
    const cs=getComputedStyle(btn),room=btn.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-base.reduce((s,e)=>s+e.offsetHeight,0)-2*(base.length-1);
    // 초상 너비(칸 높이, 칸 너비의 46%까지)와 .gx-dcf를 먼저 정해 글 줄의 너비를 확정한 뒤에 줄 높이를 잰다
    btn.style.setProperty('--dcw',Math.round(Math.min(btn.clientHeight,btn.clientWidth*.46))+'px');
    btn.classList.toggle('gx-dcf',room>=10);
    let h=0,n=0;for(const l of L){h+=l.scrollHeight+GAP;if(h>room)break;n++;}
    L.forEach((l,i)=>l.classList.toggle('on',i<n));};
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;
  if(ro)ro.observe(btn);else fit();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(btn.isConnected)fit();});}
// 소리 · 배경음악 · 감염 지도 · 명언 고르기는 화면 꾸밈이다. 도전 중에도 이것들은 원래 난수를 쓰게 감싼다.
// 감싸지 않으면 소리를 켰는지, 앞 판에서 음악이 이미 골라졌는지에 따라 난수 줄이 밀려 같은 선택에도 시대 조건 · 결과가 달라졌다
const dcIso=f=>function(){if(!DC)return f.apply(this,arguments);const m=Math.random;Math.random=DC_RAND0;try{return f.apply(this,arguments);}finally{Math.random=m;}};
Object.keys(SFX).forEach(k=>{if(typeof SFX[k]==='function')SFX[k]=dcIso(SFX[k]);});
bgmCue=dcIso(bgmCue);bgmHold=dcIso(bgmHold);bgmInfo=dcIso(bgmInfo);bgmSkip=dcIso(bgmSkip);bgmSync=dcIso(bgmSync);bgmSet=dcIso(bgmSet);
bgmIntro=dcIso(bgmIntro);bgmGame=dcIso(bgmGame);bgmRamp=dcIso(bgmRamp);bgmLoad=dcIso(bgmLoad);
mapReset=dcIso(mapReset);mapUpdate=dcIso(mapUpdate);mapDraw=dcIso(mapDraw);mapLoop=dcIso(mapLoop);mapStart=dcIso(mapStart);
leaderQ=dcIso(leaderQ);quoteFx=dcIso(quoteFx);
