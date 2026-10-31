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
  document.documentElement.dataset.dc=ranked?'r':'p';   // 도전 판은 화면 옷을 갈아입는다(테두리 · 도전 띠 · 사건 파일 카드, lazy/daily/daily.css)
  if(ranked){MEM.dc=MEM.dc||{};const keep={};Object.keys(MEM.dc).sort().slice(-13).forEach(k=>{keep[k]=MEM.dc[k];});MEM.dc=keep;MEM.dc[C.date]={ranked:1};msave();}
  // 나중에 받는 조각(미니게임 · 특별 과제 등)을 모두 받은 뒤에 시작한다. 처음 쓰는 순간에 받으면 그 조각의 무작위가 한 박자 늦게 돌아
  // 같은 선택에도 판이 달라졌다(같은 기기의 두 번째 판과 첫 판이 달랐다)
  const N=Object.keys(LZ_M);let i=0;const nx=()=>{if(i<N.length)return lzThen(N[i++],nx);start();};nx();}
// 도전이 끝나면(결산 · 메인 화면으로) 원래 난수로 되돌린다
function dcEnd(){if(Math.random!==DC_RAND0)Math.random=DC_RAND0;DC=null;delete document.documentElement.dataset.dc;}
// 결산: 순위 판의 점수와 도전 별(오늘의 목표를 이룬 수)을 이 기기에 남긴다(메인 화면 칸 · 도전 창에 보인다)
function dcDone(score,obj){if(!DC)return;if(DC.ranked){const r=MEM.dc&&MEM.dc[DC.date];if(r){r.score=score;r.done=1;if(obj)r.star=obj.filter(o=>o.s>0).length;msave();}}}
const dcLabel=d=>{const p=String(d).split('-');return +p[1]+'월 '+(+p[2])+'일';};
// 메인 메뉴 칸의 작은 글: 오늘의 무대 · 인물, 마쳤으면 내 점수
function dcSub(){const C=dcConf(),r=dcRec();return r&&r.done?'오늘 '+Number(r.score).toLocaleString('ko-KR')+'점'+(r.star!=null?' · 별 '+r.star+'/3':'')+' · 순위 보기':r&&r.ranked?'오늘 도전함 · 순위 보기':CAMPS[C.camp].n+' · '+C.B.n+' · 속전속결';}
// 소리 · 배경음악 · 감염 지도 · 명언 고르기는 화면 꾸밈이다. 도전 중에도 이것들은 원래 난수를 쓰게 감싼다.
// 감싸지 않으면 소리를 켰는지, 앞 판에서 음악이 이미 골라졌는지에 따라 난수 줄이 밀려 같은 선택에도 시대 조건 · 결과가 달라졌다
const dcIso=f=>function(){if(!DC)return f.apply(this,arguments);const m=Math.random;Math.random=DC_RAND0;try{return f.apply(this,arguments);}finally{Math.random=m;}};
Object.keys(SFX).forEach(k=>{if(typeof SFX[k]==='function')SFX[k]=dcIso(SFX[k]);});
bgmCue=dcIso(bgmCue);bgmHold=dcIso(bgmHold);bgmInfo=dcIso(bgmInfo);bgmSkip=dcIso(bgmSkip);bgmSync=dcIso(bgmSync);bgmSet=dcIso(bgmSet);
bgmIntro=dcIso(bgmIntro);bgmGame=dcIso(bgmGame);bgmRamp=dcIso(bgmRamp);bgmLoad=dcIso(bgmLoad);
mapReset=dcIso(mapReset);mapUpdate=dcIso(mapUpdate);mapDraw=dcIso(mapDraw);mapLoop=dcIso(mapLoop);mapStart=dcIso(mapStart);
leaderQ=dcIso(leaderQ);quoteFx=dcIso(quoteFx);

/* ---------- 오늘의 목표 · 도전 띠 ----------
   그날 모두가 같은 목표 셋을 받는다(날짜로 고른다). 순위 점수와는 따로 '도전 별'로만 남는다 → 서버로 보내는 기록 · 점수식은 그대로.
   목표 판정은 게임이 이미 들고 있는 값(tally · hist · peakI · RUN.rr · 여섯 지표)만 읽는다. 여기서는 Math.random을 절대 부르지 않는다
   (도전 중 Math.random은 씨앗 난수라, 화면 그리기에서 한 번만 불러도 뒤의 결과가 달라진다). */
const DC_FIN=['served','retire','lost','defeated','limit','lifelong'];   // 임기를 끝까지 마친 퇴장
const dcJ=(w,a,b)=>{const c=String(w).charCodeAt(String(w).length-1);return w+(c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28?a:b);};   // 받침에 맞는 조사
function dcRun3(){let m=0,r=0;(hist||[]).forEach(t=>{r=t<=1?r+1:0;if(r>m)m=r;});return m;}   // 이번 임기의 가장 긴 연속 성공
const dcCampOf=C=>CAMPS[C.camp],dcScnOf=C=>SCN[CAMPS[C.camp].scen0];
// t: 목표 이름 · d: 풀이(브리핑 · 목표 창) · st(e): 1 이룸 · -1 놓침 · 0 아직(e는 끝났을 때의 퇴장 종류, 진행 중엔 null) · v: 지금 값
const DC_OBJ={
 full:{ic:'終',t:C=>(C.camp==='joseon'?'치세':'임기')+'를 끝까지 지킨다',d:C=>'쫓겨나거나 스스로 물러나지 않고 마지막 해까지 버틴다',
   st:e=>e?(DC_FIN.indexOf(e)>=0?1:-1):0,v:()=>Math.min(YRS,Math.floor(S.turn/PY)+1)+' / '+YRS+'년'},
 clean:{ic:'無',t:()=>'대실패 없이 끝낸다',d:()=>'판정에서 대실패를 한 번도 남기지 않는다(운명 개입으로 지운 것은 세지 않는다)',
   st:e=>tally[3]>0?-1:e?1:0,v:()=>'대실패 '+tally[3]+'번'},
 peak:{ic:'壁',t:C=>dcJ(dcScnOf(C).iName,'을','를')+' 60 아래로 막는다',d:C=>"'"+dcScnOf(C).lv[3]+"' 단계(60)에 한 번도 닿지 않게 한다",
   st:e=>peakI>=60?-1:e?1:0,v:()=>'가장 높았던 값 '+Math.round(peakI)},
 pop:{ic:'民',t:C=>vNameC('A',dcCampOf(C))+' 50 이상으로 마친다',d:()=>'마지막 결정이 끝난 순간의 숫자로 잰다',
   st:e=>e?(vVal('A')>=50?1:-1):0,v:()=>'지금 '+Math.round(vVal('A'))},
 calm:{ic:'靜',t:C=>dcJ(vNameC('X',dcCampOf(C)),'을','를')+' 40 아래로 마친다',d:C=>'권력의 그림자인 '+vNameC('X',dcCampOf(C))+', 마지막 순간에 40 미만이면 된다',
   st:e=>e?(vVal('X')<40?1:-1):0,v:()=>'지금 '+Math.round(vVal('X'))},
 nofate:{ic:'命',t:()=>'운명 개입 없이 끝낸다',d:()=>'판정을 한 번도 다시 굴리지 않는다. 받아 든 결과를 그대로 안고 간다',
   st:e=>RUN&&RUN.rr>0?-1:e?1:0,v:()=>'다시 굴림 '+((RUN&&RUN.rr)||0)+'번'},
 crit:{ic:'星',t:()=>'대성공을 두 번 거둔다',d:()=>'판정에서 대성공이 두 번 나와야 한다',
   st:e=>tally[0]>=2?1:e?-1:0,v:()=>'대성공 '+Math.min(2,tally[0])+' / 2'},
 streak:{ic:'連',t:()=>'세 번 연달아 성공한다',d:()=>'성공 이상의 판정을 끊기지 않고 세 번 잇는다',
   st:e=>dcRun3()>=3?1:e?-1:0,v:()=>'가장 긴 연속 '+dcRun3()+'번'}};
// 칸마다 하나씩: 버티기 · 위기 · 운영 방식. 날짜만으로 정하므로 모두에게 같다
function dcObjs(date){const h=dcHash('pp-daily-obj|'+(date||dcToday()));return [['full','clean'][h%2],['peak','pop','calm'][(h>>>4)%3],['nofate','crit','streak'][(h>>>9)%3]];}
// 지금(또는 끝난 순간의) 목표 상태
function dcObjRes(end){const C=dcConf(DC?DC.date:undefined);return dcObjs(C.date).map(id=>{const O=DC_OBJ[id];let s=0,v='';try{s=O.st(end||null);v=O.v();}catch(e){}return {id:id,ic:O.ic,t:O.t(C),s:s,v:v};});}
const dcPip=o=>'<i class="'+(o.s>0?'ok':o.s<0?'no':'')+'" aria-hidden="true">'+(o.s>0?'✓':o.s<0?'✕':o.ic)+'</i>';
// 게임 화면 맨 위의 도전 띠: 날짜 · 판 종류 · 목표 셋의 상태 · 몇 번째 상황인지. 누르면 목표 창(lazy/daily의 dcObjSheet)
function dcStrip(){if(!DC||!S)return '';const N=YRS*PY,n=Math.min(N,S.turn+1),O=dcObjRes(),ok=O.filter(o=>o.s>0).length;
  return '<button type="button" class="dcs" id="dcStrip" aria-label="오늘의 목표 보기 · '+O.length+'개 가운데 '+ok+'개 이룸">'+
   '<span class="dcs-k"><i aria-hidden="true"></i>오늘의 도전</span><span class="dcs-m">'+dcLabel(DC.date)+' · '+(DC.ranked?'순위 판':'연습')+'</span>'+
   '<span class="dcs-o">'+O.map(dcPip).join('')+'</span><span class="dcs-n">상황 <b>'+String(n).padStart(2,'0')+'</b>/'+N+'</span></button>';}
// 사건 카드 위 꼬리표: 사건 파일 번호처럼
function dcCase(){if(!DC||!S)return '';const N=YRS*PY,n=Math.min(N,S.turn+1);return '<div class="dc-case" aria-hidden="true"><b>CASE '+String(n).padStart(2,'0')+'</b><span>오늘의 상황 · '+n+' / '+N+'</span></div>';}
// 목표 줄(연말 점검 · 결산 · 목표 창이 함께 쓴다)
function dcObjRows(O,fin){return '<ul class="dc-ol">'+O.map(o=>'<li class="'+(o.s>0?'ok':o.s<0?'no':'')+'">'+dcPip(o)+'<span><b>'+o.t+'</b><small>'+(o.s>0?'이룸':o.s<0?'놓침':fin?'못 이룸':'진행 중')+(o.v?' · '+o.v:'')+'</small></span></li>').join('')+'</ul>';}
// 연말 결산 안의 중간 점검
function dcYearCard(){if(!DC)return '';const O=dcObjRes(),ok=O.filter(o=>o.s>0).length,no=O.filter(o=>o.s<0).length;
  return '<div class="dc-yc"><div class="dc-yc-h"><b>오늘의 목표 · 중간 점검</b><span>'+ok+'개 이룸'+(no?' · '+no+'개 놓침':'')+'</span></div>'+dcObjRows(O)+'</div>';}
// 결산 화면 맨 위: 도전 결과(별 · 목표) + 오늘의 순위 단추(id dcRank는 32-career-end.js가 묶는다)
const DC_VERD=['내일 다시 오세요','아쉬운 하루','잘 버틴 하루','완벽한 하루'];
function dcResHTML(I){const O=I.obj||[],k=O.filter(o=>o.s>0).length;
  return '<div class="dc-res dc-res2"><div class="dc-rh"><div><b>오늘의 도전 · '+dcLabel(I.date)+'</b><span>'+(I.ranked?'순위 판 · 오늘의 순위에 올라가요':'연습 판 · 순위에는 오르지 않아요')+'</span></div><button id="dcRank" type="button">오늘의 순위</button></div>'+
   (O.length?'<div class="dc-stars" aria-label="도전 별 '+k+'개"><span class="dc-sr" aria-hidden="true">'+O.map((o,j)=>'<i class="'+(j<k?'on':'')+'" style="--d:'+(j*160+250)+'ms">★</i>').join('')+'</span><b>'+DC_VERD[k]+'</b><em>목표 '+k+' / '+O.length+' · 점수와는 따로 남는 기록</em></div>'+dcObjRows(O,1):'')+'</div>';}
