/* ---------- 실시간 대결 4 · 동계올림픽 ----------
   방 씨앗(seed)이 'W'로 시작하면 동계올림픽 대결이다. 대기실에서 방장이 고르면 seed='W', 시작할 때 'W'+무작위가 된다
   (대통령 대결의 씨앗은 소문자 · 숫자뿐이라 겹치지 않는다. DB 규칙을 바꾸지 않으려고 씨앗 칸을 같이 쓴다).
   네 종목(쇼트트랙 · 스키점프 · 컬링 · 아이스하키)을 모두 함께 차례로 치른다. 경기는 올림픽 특별 과제와 같은 경기(MG_SPORT)를 그대로 쓰고,
   끝날 때 경기가 남기는 숫자(MG_OUT)로 순위를 매긴다. 종목마다 모두가 안내 화면에 모이면(또는 20초가 지나면) 3 · 2 · 1로 함께 시작하고,
   모두 끝내면(또는 내가 끝낸 뒤 4분이 지나면) 시상대 → 다음 종목. 종목 안의 무작위(상대 · 바람 · 돌풍)는 방 씨앗 · 판 · 종목으로 정해 모두 같은 경기로 시작한다.
   진행 g: r 판 · y 지금 종목(0~3) · t 끝낸 종목 수 · n 4 · a 경기 중이면 1 · ex 종목별 값 '값,값,…'(못 끝내면 x) · lid 종목별 짧은 기록 'a|b|…' · sc 메달 점수 · fin 모두 끝남 */
const WO_EV=['skate','jump','curl','hockey'],WO_IC={skate:'⛸️',jump:'🎿',curl:'🥌',hockey:'🏒'},
  WO_N={skate:'쇼트트랙 500m',jump:'스키점프 라지힐',curl:'컬링 · 마지막 엔드',hockey:'아이스하키'},
  WO_HOW={skate:'<b>같은 링크에서 모두 함께</b> 출발해 4바퀴 반. 친구들이 바로 옆에서 달린다. <b>기록(초)</b>이 빠른 사람이 이긴다.',jump:'<b>같은 언덕에서 모두 함께</b> 뛴다(친구 점퍼는 반투명). 바람도 같다. <b>점수</b>가 높은 사람이 이긴다.',
    curl:'<b>두 명씩 1:1</b>로 돌을 번갈아 던진다(남는 한 명은 인공지능과). 메달이 적은 쪽이 마지막 돌(망치)을 쥔다. <b>득점</b> → 버튼에 더 가까운 돌 순으로 가린다.',hockey:'같은 상대와 한 경기. <b>골 득실</b> → 넣은 골 → 슈팅 차 순으로 가린다.'},
  WO_INTRO=5e3,WO_INMAX=20e3,WO_WAIT=240e3,WO_POD=7e3,WO_MED=['🥇','🥈','🥉'],WO_SYNC={skate:1,jump:1};   // WO_SYNC: 같은 경기장에서 같은 시각에 출발하는 종목
let WO=null;   // {code, rd, seed, k 지금 종목, ph intro|count|play|wait|pod|final, at 이 단계에 들어온 때, ex 내 값, lb 내 짧은 기록, seen uid→마지막 칸, room, iv, r0}
const woIs=T=>String((T&&T.seed)||'')[0]==='W';
// 짧은 기록 → 보여 줄 글
function woLb(e,s){if(s==null||s===''||s==='x')return '기록 없음';
  return e==='skate'?s+'초':e==='jump'?s+'점':e==='curl'?(+s>0?s.replace('+','')+'점 득점':+s<0?String(-s)+'점 실점':'무득점'):s.replace(':',' : ');}
// MG_OUT → 짧은 기록
function woShort(e,o){if(!o)return 'x';if(e==='skate')return o.v.toFixed(2);if(e==='jump')return o.v.toFixed(1);
  if(e==='curl'){const p=Math.round((o.v+2.5)/10);return p>0?'+'+p:String(p);}const m=String(o.lb||'').match(/(\d+)\s*:\s*(\d+)/);return m?m[1]+':'+m[2]:'x';}
// 이 종목의 씨앗 난수(경기 안의 Math.random을 잠깐 바꾼다)
function woRand(k){let h=1779033703^0;const s='pp-wo|'+WO.seed+'|'+WO.rd+'|'+k;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  let a=h>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// 이번 판 선수들: 방에 있는 사람 + 한 번이라도 본 사람(나간 사람도 순위에 남긴다)
function woPl(){const W=WO,T=W.room,live=u=>!!(T&&T.p&&T.p[u]);
  if(T)btRound(T,W.rd).forEach(p=>{W.seen[p.uid]=p;});
  return Object.keys(W.seen).map(u=>Object.assign({uid:u},W.seen[u],{gone:!live(u)})).sort((a,b)=>(+a.j||0)-(+b.j||0));}
const woOn=p=>!p.gone&&btLive(p);
const woVals=p=>String((p.g&&p.g.ex)||'').split(','),woLbs=p=>String((p.g&&p.g.lid)||'').split('|');
function woVal(p,k){const v=woVals(p)[k];return v==null||v===''||v==='x'?null:+v;}
// 종목 k의 순위: [{p, v, r(1부터, 동점은 같은 순위)}], 기록 없는 사람은 뒤에(순위 0)
function woRank(P,k){const hi=WO_EV[k]!=='skate',L=P.map(p=>({p:p,v:woVal(p,k)})),ok=L.filter(x=>x.v!=null).sort((a,b)=>hi?b.v-a.v:a.v-b.v);
  ok.forEach(x=>{x.r=1+ok.filter(y=>hi?y.v>x.v:y.v<x.v).length;});return ok.concat(L.filter(x=>x.v==null).map(x=>Object.assign(x,{r:0})));}
// 메달 집계(금 · 은 · 동)와 종합 순위: 금 → 은 → 동 → 순위 합
function woTable(P,upto){const M={};P.forEach(p=>{M[p.uid]={p:p,m:[0,0,0],rs:0};});
  for(let k=0;k<upto;k++)woRank(P,k).forEach(x=>{const o=M[x.p.uid];if(x.r>=1&&x.r<=3)o.m[x.r-1]++;o.rs+=x.r||9;});
  const L=Object.values(M).sort((a,b)=>b.m[0]-a.m[0]||b.m[1]-a.m[1]||b.m[2]-a.m[2]||a.rs-b.rs),same=(a,b)=>a.m.join()===b.m.join()&&a.rs===b.rs;
  L.forEach((o,i)=>{o.r=i&&same(o,L[i-1])?L[i-1].r:i+1;});return L;}
const woPts=m=>m[0]*3+m[1]*2+m[2];
function woW(g){const b=BT;if(!b||!WO||b.code!==WO.code)return;btReq('PATCH','rooms/'+b.code+'/p/'+b.uid+'/g',g).catch(()=>{});
  // 내 칸에도 바로 넣는다(서버 소식이 오기 전에 화면을 그릴 수 있게)
  if(WO.room&&WO.room.p&&WO.room.p[b.uid])WO.room=btSet(WO.room,'p/'+b.uid+'/g',Object.assign({},WO.room.p[b.uid].g||{},g));}

// 위치 신호 보내기: 0.11초에 한 번까지만, 바뀌었을 때만(마지막 값은 꼭 보낸다)
function woSend(a){const W=WO;if(!W||!BT||BT.code!==W.code||a===W.la)return;const now=Date.now(),wt=110-(now-W.lt);
  if(wt>0){W.pend=a;if(!W.ptm)W.ptm=setTimeout(()=>{if(WO!==W)return;W.ptm=0;woSend(W.pend);},wt);return;}
  W.lt=now;W.la=a;btReq('PATCH','rooms/'+BT.code+'/p/'+BT.uid+'/g',{a:a}).catch(()=>{W.la=0;});}
// 컬링 짝: 들어온 순서로 두 명씩(1-2, 3-4). 남는 한 명은 인공지능과. 메달 점수가 적은 쪽이 망치, 같으면 나중에 들어온 사람
function woPair(){const W=WO,me=BT_AU&&BT_AU.uid,P=woPl(),L=P.filter(p=>woOn(p)||p.uid===me),i=L.findIndex(p=>p.uid===me),j=i^1;
  if(i<0||j>=L.length)return null;const tb=woTable(P,W.k),pt=u=>woPts((tb.find(o=>o.p.uid===u)||{m:[0,0,0]}).m),a=pt(L[i].uid),b=pt(L[j].uid);
  return {opp:{uid:L[j].uid,n:L[j].n||'익명'},ham:a<b||(a===b&&i>j)};}

/* 시작: 3 · 2 · 1이 끝나면 btBegin이 부른다 */
function woBegin(T){const b=BT;if(!b)return;b.view='wo';b.rd=+T.rd||0;
  const o=document.querySelector('.bt-bg');if(o)o.remove();BT_FROM=null;btHudOff();try{cineClose();}catch(e){}
  if(WO)woClose();
  WO={code:b.code,rd:b.rd,seed:String(T.seed||''),k:0,ph:'',at:0,ex:[],lb:[],seen:{},room:T,r0:null,st0:+T.t0||0,go:0,lt:0,la:0,ptm:0};
  let bg=document.getElementById('woBg');if(!bg){bg=document.createElement('div');bg.id='woBg';bg.className='wo-bg';document.body.appendChild(bg);}
  bg.innerHTML='<div class="wo" role="region" aria-label="동계올림픽 대결"><div class="wo-top"><b>동계올림픽 대결<small>방 '+gEsc(b.code)+' · '+b.rd+'번째 판</small></b><span id="woStep"></span><button type="button" id="woQuit">기권</button></div>'+
    '<div class="wo-strip" id="woStrip" aria-live="polite"></div><div class="wo-main" id="woMain"></div></div>';
  document.documentElement.classList.add('wo-on');
  let q=0,qt=0;document.getElementById('woQuit').onclick=function(){try{SFX.click();}catch(e){}
    if(!q){q=1;this.textContent='정말 기권?';this.classList.add('x');clearTimeout(qt);qt=setTimeout(()=>{q=0;const el=document.getElementById('woQuit');if(el){el.textContent='기권';el.classList.remove('x');}},3000);return;}
    woQuitNow();};
  woW({r:b.rd,y:0,t:0,n:WO_EV.length,a:0,ex:'',lid:'',sc:0});
  // 경기에 쓰는 조각을 미리 받아 둔다
  WO_EV.forEach(e=>{const G=MG_SPORT[e];if(G&&G.lz)lzLoad(G.lz).catch(()=>{});});
  WO.iv=setInterval(woTick,300);woIntro(0);}
function woClose(){if(!WO)return;clearInterval(WO.iv);if(WO.r0){Math.random=WO.r0;WO.r0=null;}WO=null;const bg=document.getElementById('woBg');if(bg)bg.remove();document.documentElement.classList.remove('wo-on');}
function woQuitNow(){const W=WO;if(!W)return;const ex=W.ex.slice(),lb=W.lb.slice();while(ex.length<WO_EV.length){ex.push('x');lb.push('x');}
  woW({ex:ex.join(','),lid:lb.join('|'),t:WO_EV.length,a:0,fin:1});woClose();if(BT)btLeave();}
// 방 소식(btOnRoom이 부른다). 방이 닫혀도 혼자 끝까지 할 수 있다
function woRoom(T){if(!WO)return;if(T)WO.room=T;else WO.room=null;woStrip();woTick();}
function woStrip(){const el=document.getElementById('woStrip');if(!el||!WO)return;const W=WO,me=BT_AU&&BT_AU.uid,P=woPl(),k=W.k;
  el.innerHTML=P.map(p=>{const g=p.g||{},t=+g.t||0,lb=woLbs(p);let s,c='';
    if(p.gone){s='나감';c='off';}else if(!btLive(p)){s='연결 끊김';c='off';}
    else if(t>k||W.ph==='final'){s='✓ '+woLb(WO_EV[Math.min(k,WO_EV.length-1)],lb[Math.min(k,WO_EV.length-1)]);c='ok';}
    else if((+g.y||0)===k&&g.a){s='경기 중';c='run';}else if((+g.y||0)>=k){s='준비';}else s='앞 종목 중';
    return '<span class="wo-c '+c+(p.uid===me?' me':'')+'"><b>'+gEsc(p.n||'익명')+'</b><small>'+s+'</small></span>';}).join('');
  const st=document.getElementById('woStep');if(st)st.textContent=W.ph==='final'?'모든 종목 끝':(k+1)+' / '+WO_EV.length+' · '+WO_N[WO_EV[k]];}
const woMain=h=>{const m=document.getElementById('woMain');if(m)m.innerHTML=h;return m;};
// 다른 선수를 기다려야 하는가: 아직 연결된 다른 선수 가운데 조건을 못 채운 사람이 있으면
function woLag(f){const me=BT_AU&&BT_AU.uid;return woPl().filter(p=>p.uid!==me&&woOn(p)&&!f(p.g||{}));}

/* 안내 → 3 · 2 · 1 → 경기 → 기다림 → 시상대 */
function woIntro(k){const W=WO;W.k=k;W.ph='intro';W.at=Date.now();W.srv0=btNow();W.go=0;W.t0s=0;const e=WO_EV[k],G=MG_SPORT[e],pr=e==='curl'?woPair():null;
  woW({y:k,a:0});try{SFX.gate();}catch(x){}
  woMain('<div class="wo-in"><span class="wo-ic" aria-hidden="true">'+WO_IC[e]+'</span><span class="wo-k">'+(k+1)+'번째 종목</span><h2>'+WO_N[e]+'</h2>'+
    '<p class="wo-how">'+(G?G.how:'')+'</p><p class="wo-rule">'+WO_HOW[e]+'</p>'+(e==='curl'?'<p class="wo-vs">'+(pr?'<b>나</b> vs <b>'+gEsc(pr.opp.n)+'</b> · 망치: '+(pr.ham?'나':gEsc(pr.opp.n)):'짝이 없어 <b>인공지능</b>과 맞붙는다')+'</p>':'')+'<div class="wo-wt" id="woWt"></div></div>');
  woStrip();woTick();}
function woTick(){const W=WO;if(!W)return;const now=Date.now(),k=W.k;
  if(W.ph==='intro'){const lag=woLag(g=>(+g.y||0)>=k&&(+g.r||0)===W.rd),el=document.getElementById('woWt'),dt=now-W.at;
    const ready=dt>=WO_INTRO&&(!lag.length||dt>=WO_INMAX);
    if(WO_SYNC[WO_EV[k]]){const T=W.room,host=!!(T&&BT&&T.host===BT.uid);
      // 출발 시각(서버 시각)은 방장이 정해 방의 t0에 넣는다. 방장이 없으면 각자 정한다
      if(!W.go&&T&&+T.t0&&+T.t0!==W.st0&&+T.t0>W.srv0-4000)W.go=+T.t0;
      if(!W.go&&host&&ready&&!W.t0s){W.t0s=1;W.go=btNow()+5000;btReq('PATCH','rooms/'+BT.code,{t0:W.go}).catch(()=>{});}
      if(!W.go&&dt>=WO_INMAX+8000)W.go=btNow()+3000;
      if(W.go){const left=W.go-btNow();if(el)el.innerHTML='<span class="wo-gl">모두 함께 출발</span><b class="wo-cd">'+Math.max(1,Math.ceil(left/1000))+'</b>';if(left<=3600)woPlay();}
      else if(el)el.innerHTML=lag.length&&dt<WO_INMAX?'<b>'+lag.map(p=>gEsc(p.n||'익명')).join(' · ')+'</b> 기다리는 중 · '+Math.ceil((WO_INMAX-dt)/1000)+'초 안에 시작':'출발 시각을 맞추는 중…';}
    else{if(el)el.innerHTML=lag.length&&dt<WO_INMAX?'<b>'+lag.map(p=>gEsc(p.n||'익명')).join(' · ')+'</b> 기다리는 중 · '+Math.ceil((WO_INMAX-dt)/1000)+'초 뒤 시작':'곧 시작해요';
      if(ready)woCount();}}
  else if(W.ph==='wait'){const lag=woLag(g=>(+g.t||0)>k),dt=now-W.at,el=document.getElementById('woWt');
    if(el)el.innerHTML=lag.length?'<b>'+lag.map(p=>gEsc(p.n||'익명')).join(' · ')+'</b> 경기 중 · 끝나면 시상식':'시상식으로…';
    if(!lag.length||dt>=WO_WAIT)woPod();}
  else if(W.ph==='pod'){const el=document.getElementById('woPodT'),left=WO_POD-(now-W.at);if(el)el.textContent=k+1<WO_EV.length?Math.max(0,Math.ceil(left/1000))+'초 뒤 다음 종목':'';
    if(left<=0){if(k+1<WO_EV.length)woIntro(k+1);else woFinal();}}}
function woCount(){const W=WO;W.ph='count';let n=3;
  const show=()=>{const e=document.getElementById('woWt');if(e)e.innerHTML='<b class="wo-cd">'+n+'</b>';try{SFX.beep(n);}catch(x){}};show();
  const t=setInterval(()=>{if(WO!==W||W.ph!=='count'){clearInterval(t);return;}n--;if(n>0)return show();clearInterval(t);woPlay();},800);}
function woPlay(){const W=WO,k=W.k,e=WO_EV[k],G=MG_SPORT[e];W.ph='play';W.at=Date.now();woW({a:1});woStrip();
  const m=woMain('<div class="wo-g" id="woBox"></div>'),box=document.getElementById('woBox');
  // 같은 경기장: 함께 출발하는 종목은 친구들 신호(진행 칸 a), 컬링은 짝의 투구(진행 칸 m)를 넘긴다
  const me=BT_AU&&BT_AU.uid,gOf=u=>{const p=W.room&&W.room.p&&W.room.p[u],g=p&&p.g;return g&&+g.r===W.rd&&+g.y===k?g:null;};let net=null;
  if(WO_SYNC[e]&&W.go)net={at:W.go-BT_OFF,rd:W.rd,peers:woPl().filter(p=>p.uid!==me&&woOn(p)).map(p=>({uid:p.uid,n:p.n||'익명'})),raw:u=>{const g=gOf(u);return g?+g.a||0:0;},send:woSend};
  if(e==='curl'){const pr=woPair();if(pr)net={rd:W.rd,opp:pr.opp,hammer:pr.ham,m:u=>{const g=gOf(u);return g?g.m||'':'';},sendM:s=>woW({m:s})};}
  let gone=0;const done=()=>{if(gone++||WO!==W)return;if(W.r0){Math.random=W.r0;W.r0=null;}const o=MG_OUT;MG_OUT=null;woDone(k,o);};
  const run=()=>{if(WO!==W||!box.isConnected)return;MG_OUT=null;if(!W.r0)W.r0=Math.random;Math.random=woRand(k);
    try{if(window.__woFake)window.__woFake(e,box,done,net);else G.run(box,done,net);}catch(x){done();setTimeout(()=>{throw x;});}};
  if(G&&G.lz)lzThen(G.lz,run);else run();
  try{m.scrollIntoView({block:'start'});}catch(x){}}
function woDone(k,o){const W=WO;const e=WO_EV[k];W.ex[k]=o&&isFinite(o.v)?String(Math.round(o.v*100)/100):'x';W.lb[k]=woShort(e,o);
  woW({t:k+1,a:0,ex:W.ex.join(','),lid:W.lb.join('|')});W.ph='wait';W.at=Date.now();
  woMain('<div class="wo-in"><span class="wo-ic" aria-hidden="true">'+WO_IC[e]+'</span><span class="wo-k">'+WO_N[e]+' · 내 기록</span><h2>'+gEsc(woLb(e,W.lb[k]))+'</h2><div class="wo-wt" id="woWt"></div></div>');
  window.scrollTo(0,0);const bg=document.getElementById('woBg');if(bg)bg.scrollTop=0;woStrip();woTick();}
function woPod(){const W=WO,k=W.k,e=WO_EV[k],P=woPl(),me=BT_AU&&BT_AU.uid,R=woRank(P,k),lbOf=p=>woLb(e,woLbs(p)[k]);W.ph='pod';W.at=Date.now();
  const mine=R.find(x=>x.p.uid===me);try{SFX.medal(mine&&mine.r>=1&&mine.r<=3?mine.r-1:3);}catch(x){}
  const top=[2,1,3].map(r=>{const L=R.filter(x=>x.r===r);return '<div class="wo-pd p'+r+'"><span class="wo-pn">'+(L.length?L.map(x=>gEsc(x.p.n||'익명')).join('<br>'):'—')+'</span><small>'+(L.length?gEsc(lbOf(L[0].p)):'')+'</small><i>'+(WO_MED[r-1]||'')+'</i></div>';}).join('');
  const tb=woTable(P,k+1);
  woMain('<div class="wo-pod"><span class="wo-k">'+WO_IC[e]+' '+WO_N[e]+' 시상식</span><div class="wo-pds">'+top+'</div>'+
    '<ol class="wo-rk">'+R.map(x=>'<li class="'+(x.p.uid===me?'me':'')+'"><span>'+(x.r?(WO_MED[x.r-1]||x.r+'위'):'—')+'</span><b>'+gEsc(x.p.n||'익명')+'</b><em>'+gEsc(lbOf(x.p))+'</em></li>').join('')+'</ol>'+
    '<div class="wo-mt"><span class="wo-k">메달 집계 · '+(k+1)+'종목 뒤</span>'+woTbHTML(tb,me)+'</div><p class="wo-nx" id="woPodT"></p></div>');
  woW({sc:woPts((tb.find(o=>o.p.uid===me)||{m:[0,0,0]}).m)});woStrip();woTick();}
function woTbHTML(tb,me){return '<table class="wo-tb"><tr><th></th><th></th><th>🥇</th><th>🥈</th><th>🥉</th></tr>'+tb.map(o=>'<tr class="'+(o.p.uid===me?'me':'')+'"><td>'+o.r+'</td><td>'+gEsc(o.p.n||'익명')+(o.p.gone?' <small>나감</small>':'')+'</td>'+o.m.map(n=>'<td>'+n+'</td>').join('')+'</tr>').join('')+'</table>';}
function woFinal(){const W=WO,P=woPl(),me=BT_AU&&BT_AU.uid,tb=woTable(P,WO_EV.length),win=tb.filter(o=>o.r===1),my=tb.find(o=>o.p.uid===me);W.ph='final';
  woW({fin:1,sc:woPts(my?my.m:[0,0,0])});try{SFX[my&&my.r===1?'win':'record']();}catch(x){}
  const live=!!(BT&&BT.code===W.code&&BT.room),host=live&&BT.room.host===BT.uid;
  woMain('<div class="wo-fin"><span class="wo-k">동계올림픽 대결 · 종합 순위</span><h2>'+(win.length>1?'🤝 '+win.map(o=>gEsc(o.p.n||'익명')).join(' · ')+' 공동 우승':'🏆 '+gEsc((win[0]&&win[0].p.n)||'익명')+' 우승')+'</h2>'+
    woTbHTML(tb,me)+'<div class="wo-all">'+WO_EV.map((e,k)=>'<div><span>'+WO_IC[e]+' '+WO_N[e]+'</span>'+woRank(P,k).map(x=>'<i class="'+(x.p.uid===me?'me':'')+'">'+(x.r?(WO_MED[x.r-1]||x.r+'위'):'—')+' '+gEsc(x.p.n||'익명')+' <small>'+gEsc(woLb(e,woLbs(x.p)[k]))+'</small></i>').join('')+'</div>').join('')+'</div>'+
    '<div class="wo-acts">'+(live?'<button type="button" class="pri" id="woRoomB">'+(host?'대기실로 · 한 판 더':'대기실로')+'</button>':'')+'<button type="button" id="woOut">'+(live?'대결 나가기':'닫기')+'</button></div></div>');
  const q=document.getElementById('woQuit');if(q)q.style.display='none';
  const rb=document.getElementById('woRoomB');if(rb)rb.onclick=()=>{try{SFX.click();}catch(e){}woClose();if(!BT)return;
    if(BT.room&&BT.room.host===BT.uid&&BT.room.st==='play')btReq('PATCH','rooms/'+BT.code,{st:'lobby'}).catch(()=>{});btRoom();};
  document.getElementById('woOut').onclick=()=>{try{SFX.back();}catch(e){}woClose();if(BT&&BT.code===W.code)btLeave();};
  woStrip();}
// 시험 · 고장 찾기용: 지금 동계올림픽 진행 상태(화면에는 쓰지 않는다)
function woInfo(){return WO?{ph:WO.ph,k:WO.k,ex:WO.ex.slice(),lb:WO.lb.slice()}:null;}
