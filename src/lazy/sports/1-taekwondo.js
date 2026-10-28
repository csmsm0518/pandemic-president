/* ---------- 태권도 결승 ----------
   20초씩 세 라운드. 상대는 잠깐 숨을 고르다가 몸통이나 머리를 노리고 발을 든다(둘레의 원이 줄어든다).
   원이 초록일 때 막기를 누르면 막아 내고, 그 뒤 0.7초 안에 차면 반격으로 꽂힌다. 너무 일찍 막거나 못 막으면 상대 점수.
   상대가 숨을 고를 때 먼저 차도 되지만 빗나가면 받아차기를 당할 수 있다. 몸통 2점, 머리 3점. 비기면 골든 라운드(먼저 따면 승). */
const TK_R=3,TK_T=20,TK_WIN=.34;   // 라운드 수, 라운드 길이(초), 막기 창(초)
function tkRival(){const n=MG_NAT()[0];return {n:n,sk:.9+Math.random()*.25};}
function mgTkd(box,done){const R=tkRival(),$=id=>document.getElementById(id);
  let me=0,op=0,rd=1,tl=TK_T,ph='ready',st='idle',tw=0,tt=0,ok='b',cool=0,ctr=0,gold=false,live=false,last=0,raf=0;
  box.innerHTML='<div class="mgx tk"><div class="tk-sb"><div class="tk-p me"><span>'+OLY_HOME()+'</span><b id="tkMe">0</b></div><div class="tk-mid"><b id="tkRd">1라운드</b><i id="tkT">'+TK_T.toFixed(1)+'</i></div><div class="tk-p op"><b id="tkOp">0</b><span>'+R.n+'</span></div></div>'+
    '<div class="tk-mat" id="tkMat"><div class="tk-f me" id="tkF0">'+tkFig('#2f5f99')+'</div><div class="tk-cue" id="tkCue"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="tk-g" cx="50" cy="50" r="22"/><circle id="tkRing" class="tk-ring" cx="50" cy="50" r="46"/></svg><b id="tkCueT"></b></div><div class="tk-f op" id="tkF1">'+tkFig('#c0392b')+'</div></div>'+
    '<div class="pk-msg" id="tkMsg">상대가 발을 들면 원이 줄어든다. 초록일 때 막아라.</div>'+
    '<div class="tk-btns"><button id="tkB" disabled>막기<small>Space</small></button><button id="tkK" disabled>몸통 차기<small>← · A</small></button><button id="tkH" disabled>머리 차기<small>→ · D</small></button></div>'+
    '<button id="tkGo" class="pri" style="width:100%;padding:14px;margin-top:8px">경기 시작</button></div>';
  const f0=$('tkF0'),f1=$('tkF1'),cue=$('tkCue'),ring=$('tkRing'),msg=t=>{$('tkMsg').textContent=t;};
  const anim=(el,c)=>{el.classList.remove('kb','kh','hit','blk');void el.offsetWidth;el.classList.add(c);};
  const sb=()=>{$('tkMe').textContent=me;$('tkOp').textContent=op;};
  // ok: 상대가 노리는 곳(b 몸통·h 머리). 점수 크기(3점은 머리)로 누가 어느 발차기를 했는지 그린다
  const score=(who,p,why)=>{if(who===0){me+=p;anim(f0,p===3?'kh':'kb');anim(f1,'hit');}else{op+=p;anim(f1,p===3?'kh':'kb');anim(f0,'hit');}
    sb();msg(why);try{SFX.tkHit(p);}catch(e){}const el=$(who===0?'tkMe':'tkOp');el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop');
    if(gold){live=false;setTimeout(end,700);}};
  // 상대: 숨 고르기 → 발 들기(원이 줄어든다) → 차기
  const idle=()=>{st='idle';tw=1+Math.random()*1.3/R.sk;cue.className='tk-cue';$('tkCueT').textContent='';};
  const wind=()=>{st='wind';ok=Math.random()<.38*R.sk?'h':'b';tt=.95/R.sk;tw=tt;cue.className='tk-cue on '+ok;$('tkCueT').textContent=ok==='h'?'머리':'몸통';try{SFX.tkWind();}catch(e){}};
  const act=a=>{if(!live)return;
    if(a==='B'){if(st==='wind'){if(tw<=TK_WIN){st='ctr';ctr=.7;anim(f0,'blk');cue.className='tk-cue';try{SFX.tkBlock();}catch(e){}msg('막았다! 지금 차면 반격이다');}
        else{st='idle';tw=.25;score(1,ok==='h'?3:2,'너무 일찍 막았다');idle();}}
      return;}
    if(cool>0)return;const kind=a==='H'?'h':'b',p=kind==='h'?3:2;cool=kind==='h'?1:.6;try{SFX.tkWhiff();}catch(e){}
    if(st==='ctr'){score(0,p,'반격 성공! '+(p===3?'머리':'몸통')+' '+p+'점');idle();return;}
    if(st==='wind'){if(Math.random()<.4){score(0,p,'먼저 꽂았다! '+p+'점');idle();}else{score(1,ok==='h'?3:2,'부딪쳤다. 상대 발이 먼저였다');idle();}return;}
    const hit=Math.random()<(kind==='h'?.3:.55)/R.sk;anim(f0,kind==='h'?'kh':'kb');
    if(hit)score(0,p,(kind==='h'?'머리':'몸통')+' 적중! '+p+'점');
    else if(Math.random()<(kind==='h'?.5:.35)*R.sk){score(1,2,'빗나갔다. 받아차기를 당했다');idle();}
    else msg('빗나갔다');};
  const key=e=>{if(!live)return;const k=e.key;if(k===' '||k==='s'||k==='S'||k==='ArrowDown'){e.preventDefault();act('B');}
    else if(k==='ArrowLeft'||k==='a'||k==='A'){e.preventDefault();act('K');}else if(k==='ArrowRight'||k==='ArrowUp'||k==='d'||k==='D'||k==='w'||k==='W'){e.preventDefault();act('H');}};
  $('tkB').onclick=()=>act('B');$('tkK').onclick=()=>act('K');$('tkH').onclick=()=>act('H');document.addEventListener('keydown',key);
  const stop=()=>{live=false;clearInterval(raf);document.removeEventListener('keydown',key);['tkB','tkK','tkH'].forEach(i=>{const b=$(i);if(b)b.disabled=true;});};
  // 수영처럼 1/60초마다 돈다(시계는 실제 흐른 시간으로 잰다)
  const loop=()=>{if(!box.isConnected){stop();return;}const now=performance.now(),dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(!live)return;
    tl-=dt;cool=Math.max(0,cool-dt);$('tkT').textContent=Math.max(0,tl).toFixed(1);
    if(st==='idle'){tw-=dt;if(tw<=0)wind();}
    else if(st==='wind'){tw-=dt;const k=Math.max(0,tw/tt);ring.setAttribute('r',(22+24*k).toFixed(1));cue.classList.toggle('g',tw<=TK_WIN);
      if(tw<=0){score(1,ok==='h'?3:2,'못 막았다. '+(ok==='h'?'머리 3점':'몸통 2점'));idle();}}
    else if(st==='ctr'){ctr-=dt;if(ctr<=0){msg('반격 기회를 놓쳤다');idle();}}
    if(tl<=0&&live){live=false;cue.className='tk-cue';
      if(rd<TK_R){try{SFX.beep(0);}catch(e){}msg(rd+'라운드 끝 · '+me+' : '+op);setTimeout(()=>{rd++;tl=TK_T;$('tkRd').textContent=rd+'라운드';idle();live=true;},1400);}
      else if(me===op&&!gold){gold=true;try{SFX.beep(0);}catch(e){}msg('동점! 골든 라운드 — 먼저 점수를 따면 이긴다');setTimeout(()=>{tl=15;$('tkRd').textContent='골든 라운드';idle();live=true;},1600);}
      else end();}};
  const end=()=>{stop();const win=me>op||(me===op&&Math.random()<.5),t=win?0:1;SFX.medal(t);
    msg(me+' : '+op+' · '+(win?'금메달!':'은메달'));anim(win?f0:f1,'kh');$('tkGo').style.display='';$('tkGo').textContent='결과 보기';$('tkGo').onclick=()=>done(t);};
  $('tkGo').onclick=()=>{$('tkGo').style.display='none';let c=3;msg('준비 · '+c);SFX.beep(3);const iv=setInterval(()=>{c--;if(c>0){msg('준비 · '+c);SFX.beep(c);}
    else{clearInterval(iv);msg('시작!');SFX.beep(0);['tkB','tkK','tkH'].forEach(i=>$(i).disabled=false);idle();live=true;}},700);};
  last=performance.now();raf=setInterval(loop,1000/60);}
// 도복을 입은 선수 한 명(호구 색만 다르다). 차기·맞기·막기는 CSS로 움직인다.
function tkFig(c){return '<svg viewBox="0 0 60 90" aria-hidden="true"><circle cx="30" cy="12" r="8" fill="#f2d7b6" stroke="#3a2a1c" stroke-width="1.4"/><path d="M22 8a8 8 0 0 1 16 0" fill="'+c+'"/>'+
  '<path d="M18 24h24l-3 30H21z" fill="#fbfaf6" stroke="#3a2a1c" stroke-width="1.4"/><path d="M20 26h20l-2 18H22z" fill="'+c+'" opacity=".92"/><path d="M19 47h22" stroke="#1d1b18" stroke-width="3"/>'+
  '<path class="tk-arm" d="M18 27l-8 12 6 4M42 27l8 12-6 4" fill="none" stroke="#fbfaf6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
  '<path class="tk-lg1" d="M24 54l-3 32" stroke="#fbfaf6" stroke-width="7" stroke-linecap="round"/><path class="tk-lg2" d="M36 54l3 32" stroke="#fbfaf6" stroke-width="7" stroke-linecap="round"/></svg>';}
// 시뮬레이션: 라운드마다 주고받기 여러 번. 우리 선수 실력은 상대와 비슷하게(이길 확률 절반 남짓)
function simTkd(){const R=tkRival(),m=.95+Math.random()*.25,L=[];let me=0,op=0;
  for(let r=1;r<=TK_R;r++){let a=0,b=0;for(let x=0;x<6;x++){const p=Math.random()<.35?3:2;if(Math.random()<m/(m+R.sk))a+=Math.random()<.55?p:0;else b+=Math.random()<.55?p:0;}
    me+=a;op+=b;L.push('<span class="k">'+r+'R</span>'+OLY_HOME()+' '+a+' : '+b+' '+R.n);}
  let win=me>op;if(me===op){win=Math.random()<.5;L.push('<span class="k">골든</span>'+(win?OLY_HOME()+'이 먼저 땄다':R.n+'이 먼저 땄다'));}
  return {lines:L,head:me+' : '+op+' · '+(win?'금메달':'은메달'),t:win?0:1};}
// 받아 오는 사이 화면이 넘어갔으면(상자가 빠졌으면) 그리지 않는다
function mgPick(kind,box){if(!box||!box.isConnected)return;const G=MG_SPORT[kind];
  box.innerHTML='<div class="mgx mg-pick"><div class="mgx-h">'+G.n+'</div><div class="mgx-t">'+(G.pick||'직접 치르면 실력만큼 결과가 나온다. 시뮬레이션으로 맡기면 선수들이 알아서 치르고, 결과만 빠르게 본다.')+'</div>'+
    '<div class="mg-2"><button id="mgPlay" class="pri"><b>직접 한다</b><small>'+G.how+'</small></button><button id="mgSim"><b>'+(G.simN||'시뮬레이션으로 진행')+'</b><small>'+(G.simS||'선수들에게 맡기고 결과만 본다')+'</small></button></div></div>';
  // 경기가 끝나면 시상대를 세우고(메달 집계에 더한 뒤) 판정으로 넘어간다
  const fin=t=>G.nc?mgResolve(t):olyCere(box,G.n,t,()=>mgResolve(t));
  document.getElementById('mgPlay').onclick=()=>{try{aInit();SFX.click();}catch(e){}G.run(box,fin);};
  document.getElementById('mgSim').onclick=()=>{try{aInit();SFX.click();}catch(e){}mgSimShow(box,G.n,G.sim(),fin);};}
/* 시상식: 종목이 끝날 때마다 시상대(2위·1위·3위)를 세우고 우리 자리를 금빛으로 비춘다. 메달을 못 따면 우리는 시상대 아래에서 박수를 친다.
   올림픽 특집 중이면 메달을 집계(ctx.med)에 더한다. */
function olyCere(box,n,t,go){const R0=CAR&&CAR.spRun;if(R0&&OLY_IDS.indexOf(R0.id)>=0&&t<3){R0.ctx.med=R0.ctx.med||[0,0,0];R0.ctx.med[t]++;}
  const nat=MG_NAT(),home=OLY_HOME(),P=[0,1,2].map(k=>k===t?{n:home,me:1}:{n:nat.shift()}),col=['#e9c46a','#c9d1d9','#d08a54'],lab=['금','은','동'];
  const blk=k=>'<div class="oc-s s'+k+(P[k].me?' me':'')+'" style="--d:'+[.5,.2,.8][k]+'s"><div class="oc-who"><i style="background:'+col[k]+'">'+lab[k]+'</i><b>'+(P[k].me?'우리 선수':P[k].n)+'</b><small>'+(P[k].me?home:'')+'</small></div><div class="oc-b"><span>'+(k+1)+'</span></div></div>';
  const m=R0&&R0.ctx&&R0.ctx.med;
  box.innerHTML='<div class="mgx oc"><div class="oc-h"><span class="oc-rings" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><b>'+n+' 시상식</b></div>'+
    '<div class="oc-pod">'+blk(1)+blk(0)+blk(2)+'</div>'+
    '<div class="oc-msg">'+(t<3?'<b>'+MEDAL[t]+'</b> · 시상대 '+(t+1)+'번째 칸에 '+home+' 국기가 오른다':'메달은 놓쳤다. 우리 선수가 시상대 아래에서 박수를 쳤다')+'</div>'+
    (m?'<div class="oc-tally">'+olyTally(m)+'</div>':'')+'<button id="ocGo" class="pri" style="width:100%;padding:14px;margin-top:12px">계속</button></div>';
  document.getElementById('ocGo').onclick=()=>{SFX.click();go();};}
// r: {lines:[html], head:'결과 한 줄', t:0~3}. 줄이 하나씩 올라오고 마지막에 결과가 도장처럼 찍힌다.
function mgSimShow(box,n,r,done){box.innerHTML='<div class="mgx mg-sim"><div class="mgx-h">'+n+' · 시뮬레이션</div><div class="mg-sl">'+
    r.lines.map((l,i)=>'<div style="animation-delay:'+(i*220)+'ms">'+l+'</div>').join('')+'</div>'+
    '<div class="mg-res" style="animation-delay:'+(r.lines.length*220+150)+'ms">'+r.head+'</div><button id="mgSimOk" class="pri" style="width:100%;padding:14px;margin-top:12px">결과 보기</button></div>';
  try{SFX.simRes(r.lines.length,r.t);}catch(e){}
  document.getElementById('mgSimOk').onclick=()=>done(r.t);}
const mgGauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const MG_NAT=()=>['호주','미국','중국','일본','영국','프랑스','캐나다','이탈리아','헝가리','브라질','독일','스웨덴','튀르키예','멕시코'].filter(n=>!(CP.id==='usa'&&n==='미국')).sort(()=>Math.random()-.5);
const MEDAL=['금메달','은메달','동메달','메달을 놓쳤다'];
