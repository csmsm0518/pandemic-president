/* ---------- 실시간 대결 3 · 판 진행 · 상대 현황 · 결과 ----------
   btBegin: 3 · 2 · 1이 끝나면 같은 판 모드(DC: 방 씨앗 + 판 번호)로 대한민국 한 임기를 시작한다.
   진행 중에는 1.5초마다 내 진행(몇 년차 · 지난 결정 · 지지율)을 방에 올리고(바뀌었을 때만), 화면 위 작은 띠(#btHud)에 상대들의 진행을 보여 준다.
   판이 끝나면(careerEnd → btFinish) 점수를 올리고, 결산 화면 맨 위 칸(#btRes, btResMount)에 실시간 순위를 보여 준다. */
function btBegin(T){const b=BT;if(!b)return;const me=(T.p||{})[b.uid];if(!me){btEntry('방에서 빠졌어요.');return;}
  if(woIs(T))return woBegin(T);   // 동계올림픽 대결(4-winter.js)
  const L=CAMPS.kr.bg;let i=L.findIndex(q=>q.id===me.bg);if(i<0||bgLock(L[i])||L[i].god||L[i].once)i=L.findIndex(q=>!q.sec&&!q.god&&!q.once);
  b.view='play';b.rd=+T.rd||0;b.last='';
  const o=document.querySelector('.bt-bg');if(o)o.remove();BT_FROM=null;
  try{cineClose();}catch(e){}
  camp='kr';bg=i;dif=1;mode=T.md===0?0:1;
  DC={base:'pp-battle|'+T.seed+'|'+b.rd,bt:{code:b.code,rd:b.rd}};Math.random=dcRand;
  // 준비는 풀어 둔다(다음 판은 대기실에서 다시 준비 완료를 눌러야 시작된다)
  btReq('PATCH','rooms/'+b.code+'/p/'+b.uid,{rdy:false,g:{r:b.rd,t:0,n:CAMPS.kr.yrs*MODE[mode].py,y:1,a:0}}).catch(()=>{});
  // 나중에 받는 조각을 모두 받은 뒤에 시작한다(처음 쓰는 순간에 받으면 그 조각의 무작위가 한 박자 늦게 돌아 같은 선택에도 판이 달라진다)
  const N=Object.keys(LZ_M);let k=0;
  const nx=()=>{if(BT!==b)return;if(k<N.length)return lzThen(N[k++],nx);start();btHudOn();};nx();}
function btHudOn(){const b=BT;if(!b)return;let h=document.getElementById('btHud');
  if(!h){h=document.createElement('div');h.id='btHud';h.className='bt-hud';h.setAttribute('role','status');h.setAttribute('aria-label','실시간 대결 상대 현황 · 누르면 접기');document.body.appendChild(h);
    h.onclick=()=>{MEM.btHudMin=MEM.btHudMin?0:1;msave();btHudMin();};}
  btHudMin();clearInterval(b.rep);b.rep=setInterval(btReport,1500);btReport();btHudDraw();}
function btHudMin(){const h=document.getElementById('btHud'),m=!!MEM.btHudMin;if(h)h.classList.toggle('min',m);
  document.documentElement.classList.toggle('bt-on',!!h);document.documentElement.classList.toggle('bt-min',!!h&&m);}
function btHudOff(){const h=document.getElementById('btHud');if(h)h.remove();document.documentElement.classList.remove('bt-on','bt-min');}
function btReport(){const b=BT;
  if(!b||!DC||!DC.bt||DC.bt.code!==b.code||!S||!CAR||CAR.done){if(!DC||!DC.bt)btHudOff();return;}
  const n=YRS*PY,g={r:DC.bt.rd,t:Math.min(S.turn,n),n:n,y:Math.min(YRS,Math.floor(S.turn/PY)+1),a:Math.round(S.a)},k=JSON.stringify(g);
  if(k===b.last)return;b.last=k;btReq('PATCH','rooms/'+b.code+'/p/'+b.uid+'/g',g).catch(()=>{b.last='';});}
// 이번 판에 함께한 사람들: 진행 g의 판 번호가 같은 사람
const btRound=(T,rd)=>btP(T).filter(p=>p.g&&+p.g.r===rd);
function btHudDraw(){const h=document.getElementById('btHud'),b=BT;if(!h)return;
  const k='<span class="bt-h-k">대결<small>'+gEsc(b?b.code:BT_RES?BT_RES.code:'')+'</small></span>';
  if(!b||!b.room){h.innerHTML=k+'<span class="bt-h-x">방 연결이 끊겼어요 · 판은 끝까지 할 수 있어요</span>';return;}
  const rd=DC&&DC.bt?DC.bt.rd:b.rd,O=btRound(b.room,rd).filter(p=>p.uid!==b.uid);
  h.innerHTML=k+(O.length?'<span class="bt-h-ps">'+O.map(p=>{const g=p.g,live=btLive(p);
    return '<span class="bt-h-p'+(g.fin?' fin':'')+(live?'':' off')+'"><b>'+gEsc(p.n||'익명')+'</b><small>'+(g.fin?'끝 · '+Number(g.sc||0).toLocaleString('ko-KR')+'점':!live?'연결 끊김':g.y+'년차 · 지지 '+(+g.a||0))+'</small>'+
      '<i><s style="width:'+(g.fin?100:Math.round(100*(+g.t||0)/Math.max(1,+g.n||1)))+'%"></s></i></span>';}).join('')+'</span>':'<span class="bt-h-x">상대를 기다리는 중</span>');}
// 판이 끝났다: 점수를 방에 올린다(careerEnd가 부른다)
function btFinish(bt,x){const b=BT;if(!b||b.code!==bt.code)return;b.view='res';clearInterval(b.rep);btHudOff();
  const n=YRS*PY;btReq('PATCH','rooms/'+b.code+'/p/'+b.uid+'/g',{r:bt.rd,fin:1,sc:x.sc,lid:x.lid,ex:x.ex,t:n,n:n,y:YRS,a:Math.round(S.a)}).catch(()=>{});
  // 내 칸에도 바로 넣어 둔다(서버 소식이 오기 전에 결과 칸을 그릴 수 있게)
  if(b.room&&b.room.p&&b.room.p[b.uid])b.room=btSet(b.room,'p/'+b.uid+'/g',Object.assign({},b.room.p[b.uid].g,{r:bt.rd,fin:1,sc:x.sc,lid:x.lid,ex:x.ex,t:n,n:n}));}
let BT_RES=null;   // 결산 화면이 보여 주는 판 {code, rd}
function btResMount(bt){if(!BT_RES||BT_RES.code!==bt.code||BT_RES.rd!==bt.rd)BT_RES={code:bt.code,rd:bt.rd};btResDraw();}
function btResDraw(){const el=document.getElementById('btRes');if(!el||!BT_RES)return;const b=BT,me=BT_AU&&BT_AU.uid;
  // 방이 닫히거나 내가 나와도 마지막으로 본 순위는 남겨 둔다(snap)
  // 한 번 본 사람은 방을 나가도 순위에 남긴다(seen: uid → 마지막 칸)
  const live=b&&b.code===BT_RES.code&&b.room?b.room:null;BT_RES.seen=BT_RES.seen||{};
  if(live){BT_RES.snap=live;btRound(live,BT_RES.rd).forEach(p=>{BT_RES.seen[p.uid]=p;});}const T=live||BT_RES.snap;
  if(!T){el.innerHTML='<div class="bt-rh"><b>실시간 대결 · 방 '+gEsc(BT_RES.code)+'</b><span>'+(b&&b.code===BT_RES.code?'결과를 불러오는 중…':'대결 방에서 나왔어요. 내 점수는 아래에 있어요.')+'</span></div>'+
      '<div class="bt-rb"><button type="button" id="btResNew">새 대결 열기</button></div>';
    const nb=document.getElementById('btResNew');if(nb)nb.onclick=()=>{try{SFX.click();}catch(e){}btOpen(nb);};return;}
  const inRoom=u=>!!(live&&live.p&&live.p[u]),P=Object.keys(BT_RES.seen).map(u=>Object.assign({},BT_RES.seen[u],{gone:!inRoom(u)})),done=P.filter(p=>p.g.fin),left=P.filter(p=>!p.g.fin&&!p.gone&&btLive(p));
  const L=done.sort((x,y)=>(+y.g.sc||0)-(+x.g.sc||0)).concat(P.filter(p=>!p.g.fin).sort((x,y)=>(+y.g.t||0)-(+x.g.t||0)));
  const all=!left.length,host=!!live&&T.host===b.uid,rk=p=>1+done.filter(q=>(+q.g.sc||0)>(+p.g.sc||0)).length,tops=done.filter(p=>rk(p)===1);
  el.innerHTML='<div class="bt-rh"><b>실시간 대결 · '+BT_RES.rd+'번째 판 · 방 '+gEsc(BT_RES.code)+'</b><span>'+(!live?(BT_RES.closed?'방장이 방을 닫았어요':'대결 방에서 나왔어요')+' · 마지막 순위예요':all?(tops.length>1?'🤝 <b>'+tops.map(p=>gEsc(p.n||'익명')).join(' · ')+'</b> 공동 우승!':tops.length?'🏆 <b>'+gEsc(tops[0].n||'익명')+'</b> 우승!':'')+' 모두 끝났어요':P.length+'명 중 '+done.length+'명이 끝냈어요 · 순위가 실시간으로 바뀌어요')+'</span></div>'+
    '<ol class="bt-rk">'+L.map(p=>{const g=p.g,fin=!!g.fin,on=!p.gone&&btLive(p);
      const r=fin?rk(p):0;return '<li class="'+(p.uid===me?'me ':'')+(r&&r<4?'t'+r:'')+(fin?'':' run')+'"><span class="bt-rr">'+(fin?r:'·')+'</span><span class="bt-rn"><b>'+gEsc(p.n||'익명')+(p.uid===me?' <em>나</em>':'')+'</b><small>'+gEsc(btBgN(p.bg))+
        (fin?' · '+gEsc(g.ex||'')+(p.gone&&live?' · 방을 나감':''):p.gone&&live?' · 방을 나감':on?' · 진행 중 '+g.y+'년차 · 결정 '+(+g.t||0)+'/'+(+g.n||0):' · 연결 끊김')+'</small></span>'+
        '<span class="bt-rs">'+(fin?Number(g.sc||0).toLocaleString('ko-KR')+'<small>점</small>':'…')+'</span></li>';}).join('')+'</ol>'+
    (live?'<div class="bt-rb"><button type="button" class="pri" id="btResRoom">'+(host?'대기실로 · 한 판 더':'대기실로')+'</button><button type="button" id="btResOut">대결 나가기</button></div>'
      :'<div class="bt-rb"><button type="button" id="btResNew">새 대결 열기</button></div>');
  if(!live){const nb=document.getElementById('btResNew');nb.onclick=()=>{try{SFX.click();}catch(e){}btOpen(nb);};return;}
  document.getElementById('btResRoom').onclick=()=>{try{SFX.click();}catch(e){}if(!BT)return;BT_RES=null;
    if(BT.room&&BT.room.host===BT.uid&&BT.room.st==='play')btReq('PATCH','rooms/'+BT.code,{st:'lobby'}).catch(()=>{});
    btRoom();};
  document.getElementById('btResOut').onclick=()=>{try{SFX.back();}catch(e){}btLeave().then(btResDraw);};}

// 시험 · 고장 찾기용: 지금 방 상태를 본다(화면에는 쓰지 않는다)
function btInfo(){return BT?{code:BT.code,uid:BT.uid,view:BT.view,room:BT.room}:null;}
