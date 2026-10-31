/* ---------- 오늘의 도전: 하루에 같은 판, 모두가 같은 조건 ----------
   날짜(한국 시간)로 그날의 판을 정한다: 무대는 대한민국 · 조선 · 미국을 날마다 돌아가며, 출발 인물은 그 무대의 기본 인물 가운데 하나,
   난이도 보통 · 속전속결 · 한 임기. 그날 안에는 몇 번이든 다시 도전할 수 있고, 순위에는 사람마다 그날 끝까지 마친 판 중 가장 높은 점수가 올라간다(v4.9).
   (v4.5~v4.8은 그날 처음 시작한 판만 순위에 올렸는데, 첫 판을 중간에 나가면 그날은 순위 판도 연습도 할 수 없게 막혔다)
   같은 선택을 하면 같은 사건 · 같은 주사위가 나와야 비교가 공정하다. 그래서 도전 중에는 Math.random을 씨앗 있는 난수로 바꾸고,
   무작위로 결과를 정하는 자리마다(사건 고르기 · 판정 주사위 · 연말 · 선거 · 국난 …) '날짜 + 지금 위치(임기 · 차례 · 선택 수 · 운명 개입 수)'로
   씨앗을 다시 맞춘다(dcSeed). 화면 효과도 Math.random을 쓰지만, 결과를 정하기 직전에 씨앗을 다시 맞추므로 결과에는 끼어들지 못한다.
   창(오늘의 조건 · 순위)은 나중에 받는 조각 lazy/daily(dcOpen)가 그린다. */
const DC_CAMPS=['kr','joseon','usa'],DC_DAY0=Date.UTC(2026,0,1);
let DC=null;   // 도전 중이면 {date, base, ranked}. v4.9부터 도전 판은 모두 순위 판(ranked 늘 true)
// 무대 · 인물을 정해 둔 날: 돌림 대신 이 인물로 한다(그날 모두에게 같다).
// story가 있으면 팬데믹 판이 아니라 그 인물이 실제로 마주친 시대를 겪는 별도 이야기 판(lazy/dckg)을 연다(5년 단임 · 아이템 없음 · 오직 선택)
const DC_PIN={'2026-11-01':{camp:'kr',id:'kimgu',story:'kimgu',t:'김구, 대한민국 독립',yrs:'1940–1945',k:'충칭 임시정부의 5년'}};
const DC_RAND0=Math.random;
const dcToday=()=>new Date(Date.now()+9*36e5).toISOString().slice(0,10);   // 한국 시간 날짜
const dcHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;};
let DC_S=0;
// mulberry32: 씨앗 하나로 0~1 난수를 차례로 낸다
function dcRand(){DC_S=(DC_S+0x6D2B79F5)>>>0;let t=DC_S;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
function dcSeed(tag){if(!DC)return;DC_S=dcHash(DC.base+'|'+tag+'|'+(CAR?CAR.term:0)+'|'+(S?S.turn:0)+'|'+(LOG?LOG.length:0)+'|'+(RUN?RUN.rr:0));}
// 그날의 조건. 출발 인물은 비밀 · 한 번뿐 · 조건부 인물을 뺀 기본 인물에서(기기마다 풀린 인물이 달라도 같게)
function dcConf(date){date=date||dcToday();
  const P=DC_PIN[date],PB=P&&CAMPS[P.camp]?CAMPS[P.camp].bg.findIndex(b=>b.id===P.id):-1;
  if(PB>=0)return {date:date,camp:P.camp,bg:PB,B:CAMPS[P.camp].bg[PB],dif:1,mode:1,story:P.story||'',pin:P};
  const day=Math.floor((Date.parse(date+'T00:00:00Z')-DC_DAY0)/864e5),camp=DC_CAMPS[((day%3)+3)%3];
  const L=CAMPS[camp].bg.map((b,i)=>[b,i]).filter(x=>!x[0].sec&&!x[0].once&&!x[0].al&&!x[0].god);
  const pick=L[dcHash('pp-daily-bg|'+date)%L.length];
  return {date:date,camp:camp,bg:pick[1],B:pick[0],dif:1,mode:1};}
const dcRec=d=>(MEM.dc&&MEM.dc[d||dcToday()])||null;   // 이 기기의 그날 기록 {ranked:시작함, n:시작한 횟수, score:마친 판 중 최고 점수, done:한 판이라도 마침}
const dcMode=()=>MODE.findIndex(m=>m.n==='속전속결');
// 도전 시작: 몇 번째 도전이든 순위 판이다(순위는 그날 최고 점수). 시작한 횟수만 이 기기에 적는다
function dcTry(date){MEM.dc=MEM.dc||{};const keep={};Object.keys(MEM.dc).sort().slice(-13).forEach(k=>{keep[k]=MEM.dc[k];});MEM.dc=keep;
  const r=MEM.dc[date]=MEM.dc[date]||{};r.n=(+r.n||(r.ranked?1:0))+1;r.ranked=1;msave();}   // v4.8 전 기록({ranked:1})은 한 번 시작한 것으로 친다
function dcStart(date){const C=dcConf(date);
  if(C.story){dcEnd();return dckgOpen(C);}   // 이야기 판: 도전 횟수는 그 판을 실제로 시작할 때(dcTry) 센다
  camp=C.camp;bg=C.bg;dif=C.dif;mode=Math.max(0,dcMode());
  DC={date:C.date,base:'pp-daily|'+C.date,ranked:true};Math.random=dcRand;
  dcTry(C.date);
  // 나중에 받는 조각(미니게임 · 특별 과제 등)을 모두 받은 뒤에 시작한다. 처음 쓰는 순간에 받으면 그 조각의 무작위가 한 박자 늦게 돌아
  // 같은 선택에도 판이 달라졌다(같은 기기의 두 번째 판과 첫 판이 달랐다)
  const N=Object.keys(LZ_M);let i=0;const nx=()=>{if(i<N.length)return lzThen(N[i++],nx);start();};nx();}
// 도전이 끝나면(결산 · 메인 화면으로) 원래 난수로 되돌린다
function dcEnd(){if(Math.random!==DC_RAND0)Math.random=DC_RAND0;DC=null;}
// 결산: 그날 마친 판 중 가장 높은 점수를 이 기기에 남긴다(메인 화면 칸 · 도전 창에 보인다)
function dcSave(date,score){const r=MEM.dc&&MEM.dc[date];if(!r)return;r.last=score;if(!r.done||score>+r.score)r.score=score;r.done=1;msave();}
function dcDone(score){if(DC)dcSave(DC.date,score);}
// 이야기 판의 순위 기록: 커리어 기록과 같은 길(요약 탭 한 줄)로 보내되, 기록 버전 · 임기 수를 비워 명예의 전당 · 연구 분석에는 들어가지 않고
// 오늘의 도전 순위(서버 dailyOf_)에만 오른다. '닮은 지도자' 칸에는 등급 이름, '퇴장 방식'에는 결말을 적는다
function dcStorySend(C,score,ending,grade,sec,nCh){if(!SHEET_URL||IN_ART)return;
  const id='dc'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),k=id+':f:0',P=PF||{};
  const run={id:id,pid:pidGet(),startedAt:new Date(Date.now()-sec*1000).toISOString(),nickname:NICK||'익명',school:P.school||'',realName:P.name||'',phone:P.phone||'',consent:P.agree?'동의':'',
    difficulty:'오늘의 도전',mode:'이야기 판',perk:C.B.n,campaign:'오늘의 도전 · '+C.pin.t,leader:grade,careerScore:score,exitType:ending,ending:ending,playSeconds:sec,nChoices:nCh,
    dcDate:C.date,dcRanked:'예',mid:P.mid||'',mtok:acTok(),gv:GAME_VER};
  obPush([{k:k,id:id,a:0,b:JSON.stringify({k:k,gv:GAME_VER,run:run,choices:[],terms:[],years:[]})}]);obFlush();}
const dcLabel=d=>{const p=String(d).split('-');return +p[1]+'월 '+(+p[2])+'일';};
// 메인 메뉴 칸의 작은 글: 오늘의 무대 · 인물, 마쳤으면 내 최고 점수
function dcSub(){const C=dcConf(),r=dcRec();return r&&r.done?'오늘 최고 '+Number(r.score).toLocaleString('ko-KR')+'점 · 다시 도전':C.story?C.pin.t+' · '+C.pin.yrs:CAMPS[C.camp].n+' · '+C.B.n+' · 속전속결';}
// 소리 · 배경음악 · 감염 지도 · 명언 고르기는 화면 꾸밈이다. 도전 중에도 이것들은 원래 난수를 쓰게 감싼다.
// 감싸지 않으면 소리를 켰는지, 앞 판에서 음악이 이미 골라졌는지에 따라 난수 줄이 밀려 같은 선택에도 시대 조건 · 결과가 달라졌다
const dcIso=f=>function(){if(!DC)return f.apply(this,arguments);const m=Math.random;Math.random=DC_RAND0;try{return f.apply(this,arguments);}finally{Math.random=m;}};
Object.keys(SFX).forEach(k=>{if(typeof SFX[k]==='function')SFX[k]=dcIso(SFX[k]);});
bgmCue=dcIso(bgmCue);bgmHold=dcIso(bgmHold);bgmInfo=dcIso(bgmInfo);bgmSkip=dcIso(bgmSkip);bgmSync=dcIso(bgmSync);bgmSet=dcIso(bgmSet);
bgmIntro=dcIso(bgmIntro);bgmGame=dcIso(bgmGame);bgmRamp=dcIso(bgmRamp);bgmLoad=dcIso(bgmLoad);
mapReset=dcIso(mapReset);mapUpdate=dcIso(mapUpdate);mapDraw=dcIso(mapDraw);mapLoop=dcIso(mapLoop);mapStart=dcIso(mapStart);
leaderQ=dcIso(leaderQ);quoteFx=dcIso(quoteFx);
