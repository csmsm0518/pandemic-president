/* ---------- 비밀 모드 「대항해」: 폭풍 해협 질주 ----------
   메인 화면 로고의 나침반을 다섯 바퀴 돌리면 열리고, 새 게임의 무대 고르기 끝에 생긴다.
   폭풍 속 해협을 배가 멈추지 않고 달린다(점점 빨라진다). 백신이 상하기 전에 섬마을 관문 셋을 지나 모항 결승선에 닿아야 한다.
   · ◀ ▶(A D · ← →)를 누를 때마다 뱃머리가 45°씩 꺾인다(곧장 · 비스듬히 · 옆으로). ↓(S)는 곧장. 옆으로(90°) 돌리면 앞으로는 거의 나아가지 못한다.
   · 가운데 돛 단추(스페이스 · ↑)로 모아 둔 순풍을 터뜨려 가속한다.
   · 관문(빨강·흰 부표 사이)을 지나면 백신을 내리고 남은 시간 +14초. 놓치면 그 마을은 실패(기록에 오르지 못한다).
   · 암초를 아슬아슬하게 스치면 +0.5초와 순풍이 붙고, 연달아 스칠수록 더 붙는다. 부딪히면 느려지고 선체가 상한다(셋).
   · 파도 벽은 틈으로, 번개 표시는 빠져나가고, 소용돌이는 비켜 간다. 푸른 순풍 띠를 타면 저절로 빨라진다.
   기록은 결승까지 걸린 시간. 금·은·동은 코스 길이로 정한 기준 시간으로 매긴다. 최고 기록은 MEM.sail(v:2)에 남는다. */
// 속도: 출발 310 → 결승 500(순풍 돛 1.45배). 뱃머리는 45° 단위(HD: 곧장 · 비스듬히 · 옆으로)이고, 꺾을수록 속도가 준다(HV)
const SR={LEGS:[5200,5600,6000,5400],T0:21,TB:14,V0:310,V1:500,BOOST:1.45,HV:[1,.95,.42],SHIP:14};
const SR_TOTAL=SR.LEGS.reduce((a,b)=>a+b,0),SR_PAR=Math.round(SR_TOTAL/440);
const SR_NAMES=['갈매섬','등대섬','동백섬','바람섬','달섬','소금섬'];
const srTime=s=>Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0');
const srMedal=s=>s<=SR_PAR?0:s<=SR_PAR*1.12?1:s<=SR_PAR*1.3?2:3;
// 해협: 가운데 줄 cx(d)는 굽이치고, 폭 hw(d)는 갈수록 좁아진다(d = 출발점에서 앞으로 간 거리)
function srTrack(){const p=[Math.random()*6,Math.random()*6,Math.random()*6];
  return {cx:d=>150*Math.sin(d/1500+p[0])+60*Math.sin(d/560+p[1]),hw:d=>Math.max(150,215+50*Math.sin(d/900+p[2])-55*Math.min(1,d/SR_TOTAL))};}
function sailOpen(){if(document.getElementById('sl'))return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);
  const w=document.createElement('div');w.id='sl';w.className='sl';
  w.innerHTML='<canvas id="slC"></canvas><div class="sl-hud"><button type="button" class="sl-x" id="slX" aria-label="메인 메뉴로">✕</button>'+
    '<span class="sl-h"><small>배송</small><b id="slD">0 / 3</b></span><span class="sl-h"><small>선체</small><b id="slHp"></b></span>'+
    '<span class="sl-tl" id="slTl"><small>백신이 상하기까지</small><b id="slT">0:25.0</b></span><span class="sl-h sl-hr"><small>속도</small><b id="slSp">0</b><small>노트</small></span>'+
    '<div class="sl-pg"><i id="slPg"></i>'+SR.LEGS.slice(0,3).map((_,k)=>'<em style="left:'+(SR.LEGS.slice(0,k+1).reduce((a,b)=>a+b,0)/SR_TOTAL*100)+'%" id="slG'+k+'"></em>').join('')+'</div></div>'+
    '<div class="sl-tip" id="slTip"></div><div class="sl-cd" id="slCd"></div>'+
    '<div class="sl-ctl"><button type="button" data-a="l" aria-label="왼쪽">◀</button><button type="button" data-a="b" class="sl-bo" id="slBo"><i id="slBm"></i><span>순풍 돛<small>스페이스</small></span></button><button type="button" data-a="r" aria-label="오른쪽">▶</button></div>'+
    '<div class="sl-ov" id="slOv"></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id),cv=$('slC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),FF=getComputedStyle(document.body).fontFamily;
  let VW=0,VH=0,sc=1;const fit=()=>{VW=w.clientWidth;VH=w.clientHeight;sc=Math.max(.62,Math.min(1.25,VW/560));cv.width=VW*D;cv.height=VH*D;cv.style.width=VW+'px';cv.style.height=VH+'px';g.setTransform(D,0,0,D,0,0);};fit();
  let TR,S,OB,gates,st='brief',t=0,tl=0,cd=0,inp={l:0,r:0,b:0},fx=[],pops=[],wake=[],camX=0,shake=0,flash=0,nextBolt=0,genD=0,combo=0,tipT=0,live=true,T=0;   // T: 화면 장식용 시계(멈춤 없이 흐른다)
  const reset=()=>{TR=srTrack();S={x:TR.cx(0),d:0,vx:0,hd:0,ang:0,v:0,hp:3,inv:0,slow:1,boost:30,dl:0,boosting:0};OB=[];fx=[];pops=[];wake=[];t=0;tl=SR.T0;combo=0;genD=500;camX=S.x;shake=0;flash=0;nextBolt=4+Math.random()*4;
    let acc=0;const names=SR_NAMES.slice().sort(()=>Math.random()-.5);gates=SR.LEGS.map((L,k)=>{acc+=L;return {d:acc,fin:k===3,x:0,hw:k===3?0:85,name:k===3?'모항':names[k],done:0,miss:0};});
    gates.forEach(G=>{if(!G.fin)G.x=TR.cx(G.d)+(Math.random()-.5)*2*(TR.hw(G.d)-110);});hud();};
  const tip=(s,sec)=>{$('slTip').textContent=s;$('slTip').classList.add('on');tipT=sec||1.8;};
  const pop=(s,c,big)=>pops.push({s:s,c:c||'#fff',x:S.x,d:S.d+40,l:big?1.4:1,big:big});
  const hud=()=>{$('slD').textContent=S.dl+' / 3';$('slHp').innerHTML=[0,1,2].map(i=>'<i'+(i<S.hp?' class="on"':'')+'></i>').join('');
    $('slT').textContent=srTime(Math.max(0,tl));$('slTl').classList.toggle('x',tl<8);$('slSp').textContent=Math.round(S.v/12);
    $('slPg').style.width=Math.min(100,S.d/SR_TOTAL*100)+'%';gates.forEach((G,k)=>{const e=$('slG'+k);if(e)e.className=G.done?'ok':G.miss?'x':'';});
    $('slBm').style.height=S.boost+'%';$('slBo').classList.toggle('rdy',S.boost>=15);};
  const ov=h=>{$('slOv').innerHTML=h;$('slOv').style.display=h?'flex':'none';};
  const M0=()=>{let M=MEM.sail;if(!M||M.v!==2)M=MEM.sail={v:2,best:0,runs:0,gold:0};return M;};
  const brief=()=>{st='brief';const M=M0();ov('<div class="sl-card"><span class="sl-k">비밀 모드</span><h2>대항해 · 폭풍 해협</h2><p class="sl-s">섬마을 세 곳에 백신을 전하라. 폭풍 속 해협을 멈추지 않고 달려, 백신이 상하기 전에 모항 결승선에 닿아야 한다.</p>'+
    '<ul><li><b>배는 멈추지 않는다.</b> ◀ ▶를 누를 때마다 뱃머리가 <b>45°씩</b> 꺾인다. 옆으로(90°) 돌리면 앞으로는 못 간다. ↓는 곧장.</li><li>가운데 <b>순풍 돛</b>(스페이스 · ↑)을 누르고 있으면 모은 바람으로 가속한다.</li><li>빨강·흰 <b>부표 사이 관문</b>을 지나면 백신을 내리고 시간 +'+SR.TB+'초. 놓치면 그 마을은 실패.</li>'+
    '<li>암초를 <b>아슬아슬하게 스치면</b> +0.5초와 순풍. 부딪히면 느려지고 선체가 상한다(셋).</li><li>파도 벽은 틈으로, 번개 표시는 빠져나가고, 소용돌이는 비켜 가라.</li></ul>'+
    '<div class="sl-b"><span>기준 <b>'+srTime(SR_PAR)+'</b></span>'+(M.best?'<span>최고 <b>'+srTime(M.best)+'</b></span>':'')+'</div><button type="button" class="pri" id="slGo">출항</button></div>');
    $('slGo').onclick=()=>{try{aInit();SFX.click();}catch(e){}ov('');st='cd';cd=3;[3,2,1].forEach((n,k)=>{try{SFX.beep(n,k*.8);}catch(e){}});};};
  const end=win=>{if(st==='end')return;st='end';const M=M0(),full=win&&S.dl>=3,m=full?srMedal(t):3;M.runs++;let nb=false;
    if(full){if(!M.best||t<M.best){M.best=Math.round(t*10)/10;nb=true;}if(m===0)M.gold=(M.gold||0)+1;
      sendArcade('sail',{score:Math.round(t*10)/10,sec:Math.round(t*10)/10,win:true,detail:['금메달','은메달','동메달','메달 없음'][m]+' · 선체 '+S.hp+'/3'});}
    msave();try{SFX.medal(m);}catch(e){}
    const why=win?(full?'백신 세 상자를 모두 전하고 모항에 들어왔다.':'모항에는 닿았지만 섬마을 '+(3-S.dl)+'곳을 지나쳤다. 모두 전해야 기록에 오른다.'):S.hp<=0?'배가 부서졌다. 선원들은 구명정으로 무사히 돌아왔다.':'시간이 다 됐다. 백신이 상했다.';
    setTimeout(()=>{if(!live)return;ov('<div class="sl-card"><span class="sl-k">'+(full?(nb?'최고 기록!':'귀항'):'실패')+'</span><h2>'+(full?['금메달 항해','은메달 항해','동메달 항해','늦은 귀항'][m]:win?'배송 '+S.dl+' / 3':S.hp<=0?'난파':'시간 초과')+'</h2><p class="sl-s">'+why+'</p>'+
      '<div class="sl-b"><span>기록 <b>'+(full?srTime(t):'—')+'</b></span><span>기준 <b>'+srTime(SR_PAR)+'</b></span><span>최고 <b>'+(M.best?srTime(M.best):'—')+'</b></span><span>간 거리 <b>'+Math.round(Math.min(1,S.d/SR_TOTAL)*100)+'%</b></span></div>'+
      (full?'<div class="sl-med">'+['금 · 기준 안','은 · 1.12배 안','동 · 1.3배 안','메달 없음'].map((x,i)=>'<span class="'+(i===m?'on':'')+'">'+x+'</span>').join('')+'</div>':'')+
      '<button type="button" class="pri" id="slAg">다시 출항</button><button type="button" id="slOut">메인 메뉴로</button></div>');
      $('slAg').onclick=()=>{try{SFX.click();}catch(e){}reset();brief();};$('slOut').onclick=close;},win?400:900);};
  const close=()=>{try{SFX.back();}catch(e){}live=false;w.remove();document.body.style.overflow='';document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);removeEventListener('resize',fit);home();};
  $('slX').onclick=close;
  // 키: 누를 때마다 45°씩(누르고 있어도 한 번). 순풍 돛만 누르고 있는 동안 켜진다
  const steer=d=>{if(st!=='race'&&st!=='cd')return;const n=d===0?0:Math.max(-2,Math.min(2,S.hd+d));if(n===S.hd)return;S.hd=n;try{clk(n===0?700:900+Math.abs(n)*150,.5);}catch(e){}};
  w.querySelectorAll('.sl-ctl button').forEach(b=>{const a=b.dataset.a,set=v=>e=>{e.preventDefault();if(a==='b')inp.b=v;else if(v)steer(a==='l'?-1:1);b.classList.toggle('on',!!v);};
    b.addEventListener('pointerdown',set(1));['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,set(0)));b.addEventListener('contextmenu',e=>e.preventDefault());});
  const km={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowDown:'s',s:'s',S:'s',' ':'b',ArrowUp:'b',w:'b',W:'b'};
  const kd=e=>{if(e.key==='Escape'){close();return;}if(st==='brief'&&(e.key==='Enter'||e.key===' ')&&$('slGo')){e.preventDefault();$('slGo').click();return;}const a=km[e.key];if(!a)return;e.preventDefault();
      if(a==='b')inp.b=1;else if(!e.repeat)steer(a==='l'?-1:a==='r'?1:0);},
    ku=e=>{if(km[e.key]==='b')inp.b=0;};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);addEventListener('resize',fit);
  const hit=why=>{if(S.inv>0||st!=='race')return;S.hp--;S.inv=1.3;S.slow=.42;combo=0;shake=.45;try{thud(80,.35,0,.35);noise(.3,.18,0,700);}catch(e){}vib([70,40,70]);tip(why,1.6);
    for(let i=0;i<16;i++)fx.push({x:S.x,d:S.d+10,vx:(Math.random()-.5)*260,vd:(Math.random()-.2)*200,l:.7,c:'#fff'});hud();if(S.hp<=0)end(false);};
  // ----- 장애물: 앞쪽 2200까지 칸마다 하나씩 만든다(갈수록 촘촘하고 다양해진다). 뒤로 지나간 것은 버린다 -----
  const gen=()=>{while(genD<S.d+2200&&genD<SR_TOTAL-300){const d=genD,k=d/SR_TOTAL,cx=TR.cx(d),hw=TR.hw(d),rx=m=>cx+(Math.random()*2-1)*(hw-m);genD+=Math.max(170,260-90*k);
      if(gates.some(G=>Math.abs(G.d-d)<300))continue;const r=Math.random();
      if(r<.42+.12*k){OB.push({t:'rock',x:rx(30),d:d,r:16+Math.random()*14});if(Math.random()<.25+.35*k)OB.push({t:'rock',x:rx(30),d:d+60,r:14+Math.random()*12});}
      else if(r<.56+.1*k&&k>.12){const gw=Math.max(105,160-70*k);OB.push({t:'wave',d:d,gx:rx(gw/2+20),gw:gw});}
      else if(r<.64+.1*k&&k>.22)OB.push({t:'whirl',x:rx(60),d:d,r:66});
      else if(r<.72+.1*k&&k>.32)OB.push({t:'bolt',x:rx(70),d:d,r:72,arm:-1});
      else if(r<.84+.06*k)OB.push({t:'lane',x:rx(50),d:d,len:520});
      else OB.push({t:'crate',x:rx(30),d:d});}
    OB=OB.filter(o=>o.d+(o.len||0)>S.d-500);};
  const step=dt=>{T+=dt;if(tipT>0&&(tipT-=dt)<=0)$('slTip').classList.remove('on');shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt*2.2);
    fx.forEach(p=>{p.x+=p.vx*dt;p.d+=p.vd*dt;p.l-=dt;});fx=fx.filter(p=>p.l>0);pops.forEach(p=>{p.d+=60*dt;p.l-=dt;});pops=pops.filter(p=>p.l>0);
    wake.forEach(p=>p.l-=dt);wake=wake.filter(p=>p.l>0);
    // 폭풍 번개: 가끔 화면이 번쩍이고 천둥이 운다(장식)
    if((nextBolt-=dt)<=0){nextBolt=5+Math.random()*7;flash=.9;try{noise(1.2,.2,.15,180);}catch(e){}}
    if(st==='cd'){cd-=dt;$('slCd').textContent=cd>0?Math.ceil(cd):'출항!';$('slCd').classList.add('on');if(cd<=0){st='race';S.v=SR.V0*.7;try{SFX.beep(0,0);}catch(e){}setTimeout(()=>{const c=$('slCd');if(c)c.classList.remove('on');},600);}return;}
    if(st!=='race')return;
    t+=dt;tl-=dt;if(tl<=0){tl=0;hud();return end(false);}
    if(tl<8&&Math.floor(tl*2)!==Math.floor((tl+dt)*2))try{clk(tl<4?1100:800,.7);}catch(e){}
    gen();
    const k=Math.min(1,S.d/SR_TOTAL),cx=TR.cx(S.d),hw=TR.hw(S.d);
    S.boosting=inp.b&&S.boost>0;if(S.boosting){S.boost=Math.max(0,S.boost-34*dt);if(Math.random()<dt*8)try{noise(.08,.05,0,1400);}catch(e){}}
    let lane=0;for(const o of OB)if(o.t==='lane'&&S.d>o.d&&S.d<o.d+o.len&&Math.abs(S.x-o.x)<36)lane=1;
    S.slow=Math.min(1,S.slow+dt*.55);if(S.inv>0)S.inv-=dt;
    // 뱃머리는 목표 각도로 재빨리 돈다. 속도는 뱃머리 방향으로 나가고, 꺾은 만큼 줄어든다
    S.ang+=(S.hd*Math.PI/4-S.ang)*Math.min(1,dt*16);
    const tv=(SR.V0+(SR.V1-SR.V0)*k)*(S.boosting?SR.BOOST:1)*(lane?1.28:1)*S.slow*SR.HV[Math.abs(S.hd)];S.v+=(tv-S.v)*Math.min(1,dt*3);S.vx=S.v*Math.sin(S.ang);
    // 소용돌이: 가운데로 끌어당기고 느리게 한다. 한가운데에 빠지면 선체가 상한다
    for(const o of OB)if(o.t==='whirl'){const dx=o.x-S.x,dd=o.d-S.d,dist=Math.hypot(dx,dd);if(dist<o.r){S.x+=dx*1.8*dt;S.v*=1-dt*.9;if(dist<22&&!o.got){o.got=1;hit('소용돌이에 휘말렸다!');}}}
    S.x+=S.vx*dt;S.d+=S.v*Math.cos(S.ang)*dt;
    // 절벽: 세게 박으면 선체가 상하고, 살짝 닿으면 튕겨 나간다
    const off=S.x-cx,lim=hw-SR.SHIP;if(Math.abs(off)>lim){const sv=Math.abs(S.vx);S.x=cx+Math.sign(off)*lim;S.hd=0;S.slow=Math.min(S.slow,.7);if(sv>200)hit('해협 절벽에 들이받았다!');else{try{clk(400,.6);}catch(e){}}}
    for(const o of OB){if(o.done)continue;
      if(o.t==='rock'){const dx=S.x-o.x,dd=S.d-o.d,dist=Math.hypot(dx,dd);
        if(dist<o.r+SR.SHIP){o.done=1;S.x=o.x+Math.sign(dx||1)*(o.r+SR.SHIP+2);hit('암초에 부딪혔다!');}
        else if(dd>o.r){o.done=1;const gap=Math.abs(dx)-o.r-SR.SHIP;if(gap<30){combo++;const b=.5+.1*Math.min(5,combo-1);tl+=b;S.boost=Math.min(100,S.boost+8+combo*2);pop('아슬아슬! +'+b.toFixed(1)+'초'+(combo>1?' ×'+combo:''),'#ffe08a');try{tone(880+combo*80,'triangle',.12,.08);}catch(e){}}}}
      else if(o.t==='wave'){if(S.d>o.d-12&&S.d<o.d+12){o.done=1;if(Math.abs(S.x-o.gx)>o.gw/2-SR.SHIP*.6){S.slow=.5;hit('파도 벽에 얻어맞았다!');}else{pop('파도를 뚫었다!','#cfe6ff');S.boost=Math.min(100,S.boost+10);try{sweep(.3,.06,600,1800,0,.8);}catch(e){}}}}
      else if(o.t==='bolt'){if(o.arm<0&&o.d-S.d<480){o.arm=1.05;try{clk(1500,.6);}catch(e){}}if(o.arm>0){o.arm-=dt;if(o.arm<=0){o.done=1;o.strike=.35;flash=1;try{noise(.6,.3,0,2400);thud(60,.5,0,.4);}catch(e){}
          if(Math.hypot(S.x-o.x,S.d-o.d)<o.r)hit('번개가 돛대를 때렸다!');}}}
      else if(o.t==='crate'&&Math.hypot(S.x-o.x,S.d-o.d)<30){o.done=1;S.boost=Math.min(100,S.boost+35);pop('순풍 +35','#7fe0ff');try{SFX.coin();}catch(e){}}}
    OB.forEach(o=>{if(o.strike>0)o.strike-=dt;});
    for(const G of gates){if(G.done||G.miss||S.d<G.d)continue;
      if(G.fin){G.done=1;hud();return end(true);}
      if(Math.abs(S.x-G.x)<G.hw){G.done=1;S.dl++;tl+=SR.TB;pop(G.name+' · 백신 전달 +'+SR.TB+'초','#7fe0b4',true);tip(G.name+' 보건소에 백신을 내렸다 ('+S.dl+'/3)',2);try{[1047,1319,1568].forEach((f,i)=>tone(f,'sine',.5,.12,i*.1));}catch(e){}
        for(let i=0;i<20;i++)fx.push({x:G.x,d:G.d,vx:(Math.random()-.5)*300,vd:(Math.random()-.5)*300,l:.9,c:'#ffe08a'});}
      else{G.miss=1;pop(G.name+'을 지나쳤다!','#ff8a80',true);tip('관문을 놓쳤다 · 남은 마을을 꼭 지나라',2);try{tone(220,'sawtooth',.4,.08);}catch(e){}}}
    if(Math.random()<dt*30)wake.push({x:S.x+(Math.random()-.5)*8,d:S.d-18,l:1.1});
    if(S.boosting||lane)for(let i=0;i<2;i++)fx.push({x:S.x+(Math.random()-.5)*20,d:S.d+16,vx:(Math.random()-.5)*120,vd:-S.v*.6,l:.35,c:'rgba(200,235,255,.9)'});
    hud();};
  // ----- 그리기: 배는 화면 아래쪽(80%)에 두고, 앞(위)을 길게 보여 준다(빠른 배라 미리 볼 거리가 필요하다) -----
  // 빠를수록 화면이 조금 멀어진다(sc를 그리는 동안만 줄였다가 되돌린다)
  const draw=()=>{const scB=sc;sc=scB*(1-.16*Math.min(1,Math.max(0,(S.v-300)/320)));try{draw0();}finally{sc=scB;}};
  const draw0=()=>{const t=T,sy0=VH*.8,ox=VW/2,X=x=>ox+(x-camX)*sc,Y=d=>sy0-(d-S.d)*sc;camX+=(S.x-camX)*.12;
    g.save();if(shake>0)g.translate((Math.random()-.5)*14*shake,(Math.random()-.5)*14*shake);
    const bg=g.createLinearGradient(0,0,0,VH);bg.addColorStop(0,'#0a2233');bg.addColorStop(1,'#123a4d');g.fillStyle=bg;g.fillRect(-20,-20,VW+40,VH+40);
    const d0=S.d-(VH-sy0)/sc-60,d1=S.d+sy0/sc+60;
    // 물결 줄무늬: 배가 빠를수록 길게 늘어난다
    g.strokeStyle='rgba(200,230,255,.12)';g.lineWidth=1.5;g.beginPath();const gs=70,L=8+S.v*.05;
    for(let gd=Math.floor(d0/gs);gd<=Math.ceil(d1/gs);gd++)for(let gx=-6;gx<=6;gx++){const h=Math.sin(gd*12.99+gx*78.2)*43758.5,r=h-Math.floor(h),x=Math.round(camX/gs)*gs+gx*gs+r*50,d=gd*gs+r*40;g.moveTo(X(x),Y(d));g.lineTo(X(x),Y(d)+L*sc);}g.stroke();
    // 순풍 띠
    OB.forEach(o=>{if(o.t!=='lane')return;const y0=Y(o.d+o.len),y1=Y(o.d);g.fillStyle='rgba(90,200,255,.13)';g.fillRect(X(o.x)-36*sc,y0,72*sc,y1-y0);
      g.strokeStyle='rgba(150,225,255,.55)';g.lineWidth=2.5;g.beginPath();for(let d=o.d+((t*300)%60);d<o.d+o.len;d+=60){g.moveTo(X(o.x)-14*sc,Y(d)+8*sc);g.lineTo(X(o.x),Y(d));g.lineTo(X(o.x)+14*sc,Y(d)+8*sc);}g.stroke();});
    // 절벽(해협 바깥)
    const side=sgn=>{g.beginPath();g.moveTo(sgn<0?-40:VW+40,Y(d0));for(let d=d0;d<=d1;d+=24){const x=TR.cx(d)+sgn*(TR.hw(d)+6*Math.sin(d*.05)+4*Math.sin(d*.13));g.lineTo(X(x),Y(d));}g.lineTo(sgn<0?-40:VW+40,Y(d1));g.closePath();
      g.fillStyle='#232a27';g.fill();g.strokeStyle='rgba(235,245,250,'+(.55+.25*Math.sin(t*5))+')';g.lineWidth=3;g.stroke();};
    side(-1);side(1);
    g.fillStyle='rgba(255,255,255,.05)';for(let d=Math.floor(d0/140)*140;d<d1;d+=140){[-1,1].forEach(sgn=>{const x=TR.cx(d)+sgn*(TR.hw(d)+40+((d/140)%3)*18);g.beginPath();g.arc(X(x),Y(d),10*sc,0,6.3);g.fill();});}
    // 관문·결승선
    gates.forEach(G=>{if(G.d<d0||G.d>d1)return;const y=Y(G.d);
      if(G.fin){const cx=TR.cx(G.d),hw=TR.hw(G.d);for(let i=0;i<16;i++){g.fillStyle=i%2?'#f7f3ea':'#1d1b18';g.fillRect(X(cx-hw)+i*(2*hw*sc/16),y-6,2*hw*sc/16,12);}
        g.font='800 '+Math.round(18*sc)+'px '+FF;g.textAlign='center';g.fillStyle='#ffe08a';g.fillText('모항 · 결승',X(cx),y-16);return;}
      const a=X(G.x-G.hw),b=X(G.x+G.hw),c=G.done?'#3fc38f':G.miss?'#777':'#e0504a';g.strokeStyle='rgba(255,255,255,.6)';g.setLineDash([6,5]);g.lineWidth=2;g.beginPath();g.moveTo(a,y);g.lineTo(b,y);g.stroke();g.setLineDash([]);
      [a,b].forEach(x=>{g.fillStyle=c;g.beginPath();g.arc(x,y,11*sc,0,6.3);g.fill();g.fillStyle='#f7f3ea';g.fillRect(x-11*sc,y-2*sc,22*sc,4*sc);});
      g.font='800 '+Math.round(15*sc)+'px '+FF;g.textAlign='center';g.fillStyle=G.done?'#7fe0b4':'#fff';g.strokeStyle='rgba(10,34,51,.9)';g.lineWidth=4;const tx=G.name+(G.done?' ✓':' 보건소');g.strokeText(tx,(a+b)/2,y-18);g.fillText(tx,(a+b)/2,y-18);});
    OB.forEach(o=>{if(o.d<d0-100||o.d>d1+100)return;const x=X(o.x||0),y=Y(o.d);
      if(o.t==='rock'){g.fillStyle='#4c4740';g.beginPath();g.arc(x,y,o.r*sc,0,6.3);g.fill();g.fillStyle='#625b52';g.beginPath();g.arc(x-o.r*.25*sc,y-o.r*.25*sc,o.r*.55*sc,0,6.3);g.fill();
        g.strokeStyle='rgba(255,255,255,'+(.4+.3*Math.sin(t*6+o.d))+')';g.lineWidth=2;g.beginPath();g.arc(x,y,(o.r+5)*sc,0,6.3);g.stroke();}
      else if(o.t==='wave'){const cx=TR.cx(o.d),hw=TR.hw(o.d),l=X(cx-hw),gl=X(o.gx-o.gw/2),gr=X(o.gx+o.gw/2),r=X(cx+hw);g.fillStyle='rgba(235,245,255,.85)';
        for(const [p,q] of [[l,gl],[gr,r]]){g.beginPath();g.moveTo(p,y+10*sc);for(let xx=p;xx<=q;xx+=10)g.lineTo(xx,y-10*sc+Math.sin(xx*.08+t*9)*5*sc);g.lineTo(q,y+10*sc);g.closePath();g.fill();}
        g.strokeStyle='rgba(127,224,180,.9)';g.lineWidth=2;g.beginPath();g.moveTo(gl,y+14*sc);g.lineTo(gr,y+14*sc);g.stroke();}
      else if(o.t==='whirl'){g.strokeStyle='rgba(180,220,240,.5)';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();for(let a=0;a<9;a+=.3){const rr=(o.r-a*6.5)*sc;if(rr<2)break;g.lineTo(x+Math.cos(a+t*4+i*2.1)*rr,y+Math.sin(a+t*4+i*2.1)*rr*.8);}g.stroke();}
        g.fillStyle='rgba(5,15,25,.55)';g.beginPath();g.arc(x,y,14*sc,0,6.3);g.fill();}
      else if(o.t==='bolt'){if(o.arm>0){const k=o.arm/1.05;g.strokeStyle='rgba(255,90,80,.9)';g.lineWidth=3;g.setLineDash([8,6]);g.beginPath();g.arc(x,y,o.r*sc*(.6+.4*k),0,6.3);g.stroke();g.setLineDash([]);
          g.fillStyle='rgba(255,90,80,'+(.12+.15*(1-k))+')';g.beginPath();g.arc(x,y,o.r*sc,0,6.3);g.fill();g.font='800 '+Math.round(22*sc)+'px '+FF;g.textAlign='center';g.fillStyle='#ff8a80';g.fillText('!',x,y+8*sc);}
        if(o.strike>0){g.strokeStyle='rgba(255,255,230,'+(o.strike/.35)+')';g.lineWidth=4;g.beginPath();let bx=x,by=-10;g.moveTo(bx,by);while(by<y){by+=30;bx+=(Math.random()-.5)*40;g.lineTo(bx,Math.min(by,y));}g.stroke();
          g.fillStyle='rgba(255,255,220,'+(.4*o.strike/.35)+')';g.beginPath();g.arc(x,y,o.r*sc,0,6.3);g.fill();}}
      else if(o.t==='crate'&&!o.done){const b=Math.sin(t*4+o.d)*2;g.fillStyle='rgba(127,224,255,.25)';g.beginPath();g.arc(x,y,18*sc,0,6.3);g.fill();g.fillStyle='#c9962e';g.fillRect(x-9*sc,y-9*sc+b,18*sc,18*sc);g.strokeStyle='#6e4f12';g.lineWidth=2;g.strokeRect(x-9*sc,y-9*sc+b,18*sc,18*sc);}});
    wake.forEach(p=>{g.fillStyle='rgba(255,255,255,'+(p.l/1.1*.3)+')';g.beginPath();g.arc(X(p.x),Y(p.d),(3+(1.1-p.l)*7)*sc,0,6.3);g.fill();});
    // 배: 위를 향해 달리고, 옆으로 움직이는 만큼 기운다. 돛은 뒷바람을 받아 부풀고, 순풍 돛을 펴면 더 부푼다
    g.save();g.translate(X(S.x),sy0);g.rotate(-Math.PI/2+S.ang);g.scale(sc*1.25,sc*1.25);if(S.inv>0&&Math.floor(S.inv*12)%2)g.globalAlpha=.45;
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(-2,5,22,9,0,0,6.3);g.fill();
    g.fillStyle='#7a4f2a';g.beginPath();g.moveTo(24,0);g.quadraticCurveTo(10,-11,-18,-9);g.lineTo(-20,9);g.quadraticCurveTo(10,11,24,0);g.fill();
    g.fillStyle='#b98a55';g.beginPath();g.moveTo(19,0);g.quadraticCurveTo(8,-7,-15,-6);g.lineTo(-16,6);g.quadraticCurveTo(8,7,19,0);g.fill();
    g.fillStyle='#e3dccb';g.fillRect(-12,-4,8,8);g.fillStyle='#b3261e';g.fillRect(-10,-1,4,2);g.fillRect(-9,-2,2,4);
    const bl=S.boosting?1.5:1;g.fillStyle=S.boosting?'#fff8e0':'#f7f3ea';g.strokeStyle='rgba(60,45,25,.5)';g.lineWidth=1;
    g.beginPath();g.moveTo(6,-17);g.quadraticCurveTo(-4-6*bl,0,6,17);g.lineTo(2,0);g.closePath();g.fill();g.stroke();g.fillStyle='#3b2c1a';g.fillRect(4,-17,2.5,34);
    g.restore();
    fx.forEach(p=>{g.globalAlpha=Math.max(0,Math.min(1,p.l*1.5));g.fillStyle=p.c;g.fillRect(X(p.x),Y(p.d),3,3);});g.globalAlpha=1;
    pops.forEach(p=>{g.globalAlpha=Math.min(1,p.l*1.6);g.font='800 '+Math.round((p.big?20:16)*Math.min(1.2,sc+.2))+'px '+FF;g.textAlign='center';g.fillStyle=p.c;g.strokeStyle='rgba(5,15,25,.8)';g.lineWidth=4;g.strokeText(p.s,X(p.x),Y(p.d));g.fillText(p.s,X(p.x),Y(p.d));});g.globalAlpha=1;
    // 속도선: 화면 양옆으로 빗금이 빠르게 흘러내린다(빠를수록 진하고 길다)
    const sp=Math.max(0,(S.v-260)/300);if(sp>0){g.strokeStyle='rgba(230,245,255,'+Math.min(.5,.18+.3*sp)+')';g.lineWidth=2;g.beginPath();
      for(let i=0;i<26;i++){const h=Math.sin(i*47.3)*43758.5,r=h-Math.floor(h),x=i%2?r*VW*.16:VW-r*VW*.16,y=((r*VH+T*S.v*2.2+i*53)%(VH+120))-60,len=24+S.v*.12;g.moveTo(x,y);g.lineTo(x,y+len);}g.stroke();}
    // 비와 번쩍임
    g.strokeStyle='rgba(200,220,240,.22)';g.lineWidth=1;g.beginPath();for(let i=0;i<70;i++){const h=Math.sin(i*91.7)*43758.5,r=h-Math.floor(h),x=(r*VW*1.3+t*260+i*37)%(VW+60)-30,y=((i*97+t*(700+r*300))%(VH+60))-30;g.moveTo(x,y);g.lineTo(x-7,y+16);}g.stroke();
    if(S.boosting){g.fillStyle='rgba(180,230,255,.06)';g.fillRect(0,0,VW,VH);}
    if(flash>0){g.fillStyle='rgba(235,240,255,'+(flash*.45)+')';g.fillRect(0,0,VW,VH);}
    g.restore();};
  let last=performance.now();
  reset();brief();
  // 시험용: window.__slDbg를 미리 켜 두면 배와 해협 상태를 밖에서 본다
  if(window.__slDbg)window.__slDbg={S:()=>S,gates:()=>gates,OB:()=>OB,TR:()=>TR,st:()=>st,tl:()=>tl};
  const iv=setInterval(()=>{if(!live||!w.isConnected){clearInterval(iv);return;}const now=performance.now(),dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;step(dt);draw();},1000/60);}
