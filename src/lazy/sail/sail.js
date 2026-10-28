/* ---------- 비밀 모드 「대항해」: 폭풍 해협 질주 ----------
   메인 화면 로고의 나침반을 다섯 바퀴 돌리면 열리고, 새 게임의 무대 고르기 끝에 생긴다.
   폭풍 속 해협을 배가 멈추지 않고 달린다(점점 빨라진다). 백신이 상하기 전에 섬마을 관문 셋을 지나 모항 결승선에 닿아야 한다.
   · ◀ ▶(A D · ← →)를 누르고 있는 동안 뱃머리가 그쪽으로 45° 꺾이고, 떼면 다시 곧장 간다.
   · 가운데 돛 단추(스페이스 · ↑)로 모아 둔 순풍을 터뜨려 가속한다.
   · 관문(초록·흰 부표 사이, 흰 바탕 초록 십자 표지)을 지나면 백신을 내리고 남은 시간 +14초. 놓치면 그 마을은 실패(기록에 오르지 못한다).
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
// wf: 해협 폭 배율. 가로 화면은 해협이 화면을 꽉 채우도록 넓힌다(굽이도 그만큼 크게)
function srTrack(wf){const p=[Math.random()*6,Math.random()*6,Math.random()*6];wf=wf||1;
  return {wf:wf,cx:d=>wf*(150*Math.sin(d/1500+p[0])+60*Math.sin(d/560+p[1])),hw:d=>wf*Math.max(150,215+50*Math.sin(d/900+p[2])-55*Math.min(1,d/SR_TOTAL))};}
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
  let g;const $=id=>document.getElementById(id),cv=$('slC'),D=Math.min(2,window.devicePixelRatio||1),FF=getComputedStyle(document.body).fontFamily;g=cv.getContext('2d');   // 그리는 동안에는 픽셀 캔버스로 바꿔 끼운다(draw)
  let VW=0,VH=0,sc=1;const fit=()=>{VW=w.clientWidth;VH=w.clientHeight;sc=Math.max(.55,Math.min(1.25,VW/560,VH/640));cv.width=VW*D;cv.height=VH*D;cv.style.width=VW+'px';cv.style.height=VH+'px';g.setTransform(D,0,0,D,0,0);};fit();
  let TR,S,OB,gates,st='brief',t=0,tl=0,cd=0,inp={l:0,r:0,b:0},fx=[],pops=[],wake=[],camX=0,shake=0,flash=0,nextBolt=0,genD=0,combo=0,tipT=0,live=true,T=0;   // T: 화면 장식용 시계(멈춤 없이 흐른다)
  const reset=()=>{TR=srTrack(Math.max(1,Math.min(2.6,VW*.86/(430*sc))));S={x:TR.cx(0),d:0,vx:0,hd:0,ang:0,v:0,hp:3,inv:0,slow:1,boost:30,dl:0,boosting:0};OB=[];fx=[];pops=[];wake=[];t=0;tl=SR.T0;combo=0;genD=500;lastW=null;camX=S.x;shake=0;flash=0;nextBolt=4+Math.random()*4;
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
    '<ul><li><b>배는 멈추지 않는다.</b> ◀ ▶를 <b>누르고 있는 동안</b> 뱃머리가 그쪽으로 45° 꺾이고, 떼면 다시 곧장 간다.</li><li>가운데 <b>순풍 돛</b>(스페이스 · ↑)을 누르고 있으면 모은 바람으로 가속한다.</li><li><b>초록 부표 사이 보건소 관문</b>을 지나면 백신을 내리고 시간 +'+SR.TB+'초. 놓치면 그 마을은 실패.</li>'+
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
  // 뱃머리: ◀ 또는 ▶를 누르고 있는 동안만 그쪽으로 45°, 떼면 다시 곧장(둘 다 누르면 곧장)
  const steer=()=>{const n=(inp.r?1:0)-(inp.l?1:0);if(n===S.hd)return;S.hd=n;if(st==='race'||st==='cd')try{clk(n===0?700:1000,.5);}catch(e){}};
  w.querySelectorAll('.sl-ctl button').forEach(b=>{const a=b.dataset.a,set=v=>e=>{e.preventDefault();inp[a]=v;if(a!=='b')steer();b.classList.toggle('on',!!v);};
    b.addEventListener('pointerdown',set(1));['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,set(0)));b.addEventListener('contextmenu',e=>e.preventDefault());});
  const km={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',' ':'b',ArrowUp:'b',w:'b',W:'b'};
  const kd=e=>{if(e.key==='Escape'){close();return;}if(st==='brief'&&(e.key==='Enter'||e.key===' ')&&$('slGo')){e.preventDefault();$('slGo').click();return;}const a=km[e.key];if(!a)return;e.preventDefault();
      inp[a]=1;if(a!=='b')steer();},
    ku=e=>{const a=km[e.key];if(!a)return;inp[a]=0;if(a!=='b')steer();};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);addEventListener('resize',fit);
  const hit=why=>{if(S.inv>0||st!=='race')return;S.hp--;S.inv=1.3;S.slow=.42;combo=0;shake=.45;try{thud(80,.35,0,.35);noise(.3,.18,0,700);}catch(e){}vib([70,40,70]);tip(why,1.6);
    for(let i=0;i<16;i++)fx.push({x:S.x,d:S.d+10,vx:(Math.random()-.5)*260,vd:(Math.random()-.2)*200,l:.7,c:'#fff'});hud();if(S.hp<=0)end(false);};
  // ----- 장애물: 앞쪽 2200까지 칸마다 하나씩 만든다(갈수록 촘촘하고 다양해진다). 뒤로 지나간 것은 버린다 -----
  // ----- 장애물: 앞쪽 2200까지 칸마다 만든다(갈수록 촘촘하고 다양해지고, 넓은 해협은 폭만큼 더 놓는다). 뒤로 지나간 것은 버린다 -----
  // 언제나 지나갈 수 있게: ① 파도 벽은 520 넘게 떨어뜨리고, 다음 벽의 틈은 앞 벽의 틈에서 45°로 건너갈 수 있는 거리 안에 둔다
  // ② 파도 벽 바로 앞(260)과 뒤(140)에는 암초·소용돌이·번개를 두지 않는다 ③ 한 줄을 막는 것들 사이에는 늘 120 넘는 길이 남는다
  const BLK=o=>o.t==='rock'?o.r+SR.SHIP+8:o.t==='whirl'?o.r*.7:o.t==='bolt'?o.r*.8:0;
  const passOK=(d0,d1,cx,hw)=>{const iv=OB.filter(o=>BLK(o)&&o.d>=d0&&o.d<=d1).map(o=>[o.x-BLK(o),o.x+BLK(o)]).sort((a,b)=>a[0]-b[0]);
    let x=cx-hw+SR.SHIP,best=0;for(const [a,b] of iv){best=Math.max(best,a-x);x=Math.max(x,b);}return Math.max(best,cx+hw-SR.SHIP-x)>=120;};
  let lastW=null;
  const gen=()=>{while(genD<S.d+2200&&genD<SR_TOTAL-300){const d=genD,k=d/SR_TOTAL,cx=TR.cx(d),hw=TR.hw(d),rx=m=>cx+(Math.random()*2-1)*(hw-m);genD+=Math.max(170,260-90*k);
      if(gates.some(G=>Math.abs(G.d-d)<300))continue;const nq=Math.floor(TR.wf)+(Math.random()<TR.wf%1?1:0);
      const nearW=dq=>lastW&&dq>lastW.d-260&&dq<lastW.d+140;
      for(let q=0;q<nq;q++){const r=Math.random(),dq=d+q*70,n0=OB.length;
        if(r>=.42+.12*k&&r<.56+.1*k&&k>.12&&q===0&&(!lastW||d-lastW.d>520)){const gw=Math.max(105,160-70*k);let gx=rx(gw/2+20);
          // 틈은 해협 안이면서 앞 벽의 틈에서 건너갈 수 있는 곳에만. 그런 곳이 없으면 이번 칸엔 벽을 세우지 않는다
          let lo=cx-hw+gw/2+20,hi=cx+hw-gw/2-20;if(lastW){const reach=Math.max(0,d-lastW.d-160)*.85;lo=Math.max(lo,lastW.gx-reach);hi=Math.min(hi,lastW.gx+reach);}
          if(lo<=hi){gx=Math.max(lo,Math.min(hi,gx));
          // 벽 바로 앞뒤를 막고 있던 것은 치운다
          OB=OB.filter(o=>!(BLK(o)&&o.d>d-260&&o.d<d+140));OB.push({t:'wave',d:d,gx:gx,gw:gw});lastW={d:d,gx:gx};break;}}
        if(nearW(dq)){if(Math.random()<.5)OB.push({t:'crate',x:rx(30),d:dq+40});continue;}
        if(r<.42+.12*k||r<.64+.1*k&&(q>0||k<=.22)){OB.push({t:'rock',x:rx(30),d:dq,r:16+Math.random()*14});if(Math.random()<.25+.35*k&&!nearW(dq+60))OB.push({t:'rock',x:rx(30),d:dq+60,r:14+Math.random()*12});}
        else if(r<.64+.1*k)OB.push({t:'whirl',x:rx(60),d:dq,r:66});
        else if(r<.72+.1*k&&k>.32)OB.push({t:'bolt',x:rx(70),d:dq,r:72,arm:-1});
        else if(r<.84+.06*k)OB.push({t:'lane',x:rx(50),d:dq,len:520});
        else OB.push({t:'crate',x:rx(30),d:dq});
        // 이 칸에서 길이 막혔으면 방금 놓은 것을 도로 뺀다
        if(!passOK(d-90,d+200,cx,hw))OB.splice(n0);}}
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
    const off=S.x-cx,lim=hw-SR.SHIP;if(Math.abs(off)>lim){const sv=Math.abs(S.vx);S.x=cx+Math.sign(off)*lim;S.slow=Math.min(S.slow,.7);if(sv>200)hit('해협 절벽에 들이받았다!');else{try{clk(400,.6);}catch(e){}}}
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
  // ----- 그리기: 픽셀 그림 -----
  // 장면은 1/P 크기의 캔버스(pc)에 그린 뒤 흐림 없이 키워 또렷한 픽셀로 보이고, 글자(TXQ)만 원래 해상도로 얹는다.
  // 빠를수록 화면이 조금 멀어진다(sc를 그리는 동안만 줄였다가 되돌린다)
  const pc=document.createElement('canvas'),pg=pc.getContext('2d');let TXQ=[],P=3,dith=null;
  const lbl=(s,x,y,px,c,al)=>TXQ.push([s,x,y,px,c,al==null?1:al]);
  const draw=()=>{P=VW>=900?4:3;const pw=Math.ceil(VW/P),ph=Math.ceil(VH/P);if(pc.width!==pw||pc.height!==ph){pc.width=pw;pc.height=ph;dith=null;}
    if(!dith){const d=document.createElement('canvas');d.width=d.height=4;const dg=d.getContext('2d');dg.fillStyle='rgba(255,255,255,.08)';dg.fillRect(0,0,1,1);dg.fillRect(2,2,1,1);dg.fillStyle='rgba(0,0,0,.08)';dg.fillRect(2,0,1,1);dg.fillRect(0,2,1,1);dith=pg.createPattern(d,'repeat');}
    const scB=sc,G0=g;sc=scB*(1-.16*Math.min(1,Math.max(0,(S.v-300)/320)));TXQ=[];g=pg;g.setTransform(1/P,0,0,1/P,0,0);g.imageSmoothingEnabled=false;
    try{draw0();}finally{g=G0;sc=scB;}
    g.setTransform(D,0,0,D,0,0);g.imageSmoothingEnabled=false;g.clearRect(0,0,VW,VH);g.drawImage(pc,0,0,pw*P,ph*P);
    g.textAlign='center';TXQ.forEach(([s,x,y,px,c,al])=>{g.globalAlpha=al;g.font='800 '+px+'px '+FF;g.lineWidth=4;g.strokeStyle='rgba(5,15,25,.85)';g.strokeText(s,x,y);g.fillStyle=c;g.fillText(s,x,y);});g.globalAlpha=1;};
  const draw0=()=>{const t=T,sy0=VH*.8,ox=VW/2,X=x=>ox+(x-camX)*sc,Y=d=>sy0-(d-S.d)*sc,LW=n=>Math.max(n,P);{const cx=TR.cx(S.d);camX+=(cx+(S.x-cx)*.35-camX)*.12;}   // 화면은 해협 가운데를 따라가고 배 쪽으로 조금만 기운다(양쪽 해안이 보이게)
    g.save();if(shake>0)g.translate((Math.random()-.5)*14*shake,(Math.random()-.5)*14*shake);
    g.fillStyle='#20628c';g.fillRect(-40,-40,VW+80,VH+80);
    const d0=S.d-(VH-sy0)/sc-60,d1=S.d+sy0/sc+60;
    // 해안선: off만큼 물 쪽으로(+) 또는 땅 쪽으로(−) 옮긴 둘레를 따라 바깥을 칠한다
    const edge=(sgn,off)=>{g.beginPath();g.moveTo(sgn<0?-60:VW+60,Y(d0));for(let d=d0;d<=d1;d+=24){const x=TR.cx(d)+sgn*(TR.hw(d)-off+6*Math.sin(d*.05)+4*Math.sin(d*.13));g.lineTo(X(x),Y(d));}g.lineTo(sgn<0?-60:VW+60,Y(d1));g.closePath();};
    // 깊은 물 → 가장자리 얕은 물(두 겹)
    [-1,1].forEach(s=>{edge(s,46);g.fillStyle='#2b7aa6';g.fill();edge(s,20);g.fillStyle='#3fa6b8';g.fill();});
    dith.setTransform(new DOMMatrix([P,0,0,P,0,(S.d*sc)%(4*P)]));g.fillStyle=dith;g.fillRect(0,0,VW,VH);
    // 물결 반짝임: 짧은 가로 픽셀 줄이 배 속도로 흘러내린다
    g.fillStyle='rgba(215,242,255,.5)';const gs=64;
    for(let gd=Math.floor(d0/gs);gd<=Math.ceil(d1/gs);gd++)for(let gx=-9;gx<=9;gx++){const h=Math.sin(gd*12.99+gx*78.2)*43758.5,r=h-Math.floor(h);if(r<.35)continue;
      const x=Math.round(camX/gs)*gs+gx*gs+r*50,d=gd*gs+r*40;g.fillRect(X(x),Y(d),Math.round(2+r*3)*P,P);if(S.v>380)g.fillRect(X(x),Y(d)+P,P,Math.round((S.v-380)*.02)*P);}
    // 순풍 띠
    OB.forEach(o=>{if(o.t!=='lane')return;const y0=Y(o.d+o.len),y1=Y(o.d);g.fillStyle='rgba(90,200,255,.16)';g.fillRect(X(o.x)-36*sc,y0,72*sc,y1-y0);
      g.strokeStyle='rgba(160,230,255,.7)';g.lineWidth=LW(2.5);g.beginPath();for(let d=o.d+((t*300)%60);d<o.d+o.len;d+=60){g.moveTo(X(o.x)-14*sc,Y(d)+8*sc);g.lineTo(X(o.x),Y(d));g.lineTo(X(o.x)+14*sc,Y(d)+8*sc);}g.stroke();});
    // 땅: 흰 거품 → 바위 → 풀밭. 거품은 파도처럼 들락날락한다
    const fo=3+2*Math.sin(t*4);
    [-1,1].forEach(s=>{edge(s,fo);g.fillStyle='#f2fafc';g.fill();edge(s,-6);g.fillStyle='#d9c78f';g.fill();edge(s,-16);g.fillStyle='#8a8676';g.fill();edge(s,-30);g.fillStyle='#4f9a52';g.fill();});
    // 나무와 바위: 칸마다 정해진 자리에(매번 같은 모양)
    for(let d=Math.floor(d0/80)*80;d<d1;d+=80)[-1,1].forEach(s=>{for(let j=0;j<3;j++){const h=Math.sin(d*.013+s*7.1+j*3.3)*43758.5,r=h-Math.floor(h);if(r<.3)continue;
      const x=X(TR.cx(d)+s*(TR.hw(d)+44+j*46+r*30)),y=Y(d+r*60),z=(10+r*8)*sc;
      if(j===2&&r>.85){g.fillStyle='#6b6a60';g.fillRect(x-z*.5,y-z*.3,z,z*.6);g.fillStyle='#8a897d';g.fillRect(x-z*.5,y-z*.3,z*.5,z*.25);continue;}
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-z*.3,y+z*.5,z*.9,z*.25);
      g.fillStyle='#2b6b37';g.beginPath();g.moveTo(x,y-z);g.lineTo(x+z*.7,y+z*.55);g.lineTo(x-z*.7,y+z*.55);g.closePath();g.fill();
      g.fillStyle='#4f9e57';g.beginPath();g.moveTo(x,y-z);g.lineTo(x-z*.7,y+z*.55);g.lineTo(x,y+z*.55);g.closePath();g.fill();}});
    // 관문(부표 · 등대)과 결승선
    gates.forEach(G=>{if(G.d<d0-80||G.d>d1+80)return;const y=Y(G.d);
      if(G.fin){const cx=TR.cx(G.d),hw=TR.hw(G.d),n=Math.max(8,Math.round(hw/14)),wd=2*hw*sc/n;for(let i=0;i<n;i++)for(let r=0;r<2;r++){g.fillStyle=(i+r)%2?'#f7f3ea':'#1d1b18';g.fillRect(X(cx-hw)+i*wd,y-6*sc+r*6*sc,wd,6*sc);}
        lbl('모항 · 결승',X(cx),y-14*sc,Math.round(18*sc),'#ffe08a');return;}
      // 보건소 관문: 초록 부표 사이로 금빛 띠가 반짝이고, 가운데 위에 흰 바탕 초록 십자 표지, 아래에서 들어오라는 화살표
      const a=X(G.x-G.hw),b=X(G.x+G.hw),c=G.done?'#7fe0b4':G.miss?'#777':'#2fbf7a',mx=(a+b)/2;
      if(!G.done&&!G.miss){g.fillStyle='rgba(127,240,190,.14)';g.fillRect(a,y-4*sc,b-a,70*sc);g.fillStyle='rgba(255,224,138,'+(.55+.35*Math.sin(t*8))+')';g.fillRect(a,y-P,b-a,P*2);
        g.fillStyle='rgba(255,224,138,.8)';for(let k=0;k<3;k++){const yy=y+(18+k*20-((t*60)%20))*sc;g.beginPath();g.moveTo(mx-12*sc,yy+8*sc);g.lineTo(mx,yy);g.lineTo(mx+12*sc,yy+8*sc);g.lineTo(mx+12*sc,yy+12*sc);g.lineTo(mx,yy+4*sc);g.lineTo(mx-12*sc,yy+12*sc);g.closePath();g.fill();}}
      else{g.fillStyle='rgba(255,255,255,.4)';for(let x=a;x<b;x+=P*4)g.fillRect(x,y-P/2,P*2,P);}
      const cs=11*sc,cy=y-34*sc;g.fillStyle='#0d2233';g.fillRect(mx-cs-P,cy-cs-P,(cs+P)*2,(cs+P)*2);g.fillStyle='#f7f3ea';g.fillRect(mx-cs,cy-cs,cs*2,cs*2);g.fillStyle=G.miss?'#888':'#22a36a';g.fillRect(mx-cs*.3,cy-cs*.75,cs*.6,cs*1.5);g.fillRect(mx-cs*.75,cy-cs*.3,cs*1.5,cs*.6);
      [a,b].forEach(x=>{g.fillStyle='#0d2233';g.fillRect(x-9*sc,y+6*sc,18*sc,4*sc);g.fillStyle=c;g.fillRect(x-9*sc,y-10*sc,18*sc,16*sc);g.fillStyle='#f7f3ea';g.fillRect(x-9*sc,y-4*sc,18*sc,5*sc);
        if(!G.done&&Math.sin(t*6)>0){g.fillStyle='#bdf5d8';g.fillRect(x-3*sc,y-16*sc,6*sc,6*sc);}});
      // 관문 옆 절벽 위 등대: 가까운 쪽 해안에 서서 불빛을 돌린다
      const sd=G.x>TR.cx(G.d)?1:-1,lx=X(TR.cx(G.d)+sd*(TR.hw(G.d)+38)),lh=46*sc,lw=14*sc;
      g.fillStyle='rgba(0,0,0,.3)';g.fillRect(lx-lw*.4,y+4*sc,lw*1.4,6*sc);
      for(let i=0;i<4;i++){g.fillStyle=i%2?'#b3261e':'#f7f3ea';g.fillRect(lx-lw/2,y-lh*(i+1)/4,lw,lh/4);}
      g.fillStyle='#2a2a2a';g.fillRect(lx-lw*.65,y-lh-8*sc,lw*1.3,8*sc);g.fillStyle=Math.sin(t*3)>-.3?'#ffe08a':'#8a6a24';g.fillRect(lx-lw*.4,y-lh-6*sc,lw*.8,5*sc);
      g.fillStyle='rgba(255,224,138,.13)';g.beginPath();const ba=t*1.6;g.moveTo(lx,y-lh-4*sc);g.lineTo(lx+Math.cos(ba)*260*sc-Math.sin(ba)*30*sc,y-lh+Math.sin(ba)*90*sc);g.lineTo(lx+Math.cos(ba)*260*sc+Math.sin(ba)*30*sc,y-lh+Math.sin(ba)*90*sc+40*sc);g.closePath();g.fill();
      lbl(G.name+(G.done?' · 전달 완료 ✓':G.miss?' · 지나침':' 보건소 · 백신 전달'),mx,y-52*sc,Math.round(15*sc),G.done?'#7fe0b4':G.miss?'#aaa':'#bdf5d8');});
    OB.forEach(o=>{if(o.d<d0-100||o.d>d1+100)return;const x=X(o.x||0),y=Y(o.d);
      if(o.t==='rock'){const r=o.r*sc;g.fillStyle='rgba(255,255,255,'+(.5+.3*Math.sin(t*6+o.d))+')';g.beginPath();g.arc(x,y+2*sc,r+5*sc,0,6.3);g.fill();
        g.fillStyle='#4a453e';g.beginPath();g.arc(x,y,r,0,6.3);g.fill();g.fillStyle='#6e675c';g.beginPath();g.arc(x-r*.2,y-r*.2,r*.72,0,6.3);g.fill();g.fillStyle='#7d766a';g.fillRect(x-r*.55,y-r*.55,r*.45,r*.3);}
      else if(o.t==='wave'){const cx=TR.cx(o.d),hw=TR.hw(o.d),l=X(cx-hw)-30,gl=X(o.gx-o.gw/2),gr=X(o.gx+o.gw/2),r=X(cx+hw)+30;
        for(const [p,q] of [[l,gl],[gr,r]]){g.fillStyle='#bcdbe8';g.fillRect(p,y-4*sc,q-p,14*sc);g.fillStyle='#f4fbfd';for(let xx=p;xx<q;xx+=P*3){const hh=(6+4*Math.sin(xx*.06+t*9))*sc;g.fillRect(xx,y-4*sc-hh,P*3,hh);}}
        g.fillStyle='rgba(127,224,180,.9)';g.fillRect(gl,y+12*sc,gr-gl,P);}
      else if(o.t==='whirl'){g.strokeStyle='rgba(180,225,245,.55)';g.lineWidth=LW(2);for(let i=0;i<3;i++){g.beginPath();for(let a=0;a<9;a+=.3){const rr=(o.r-a*6.5)*sc;if(rr<2)break;g.lineTo(x+Math.cos(a+t*4+i*2.1)*rr,y+Math.sin(a+t*4+i*2.1)*rr*.8);}g.stroke();}
        g.fillStyle='#0a1c2a';g.beginPath();g.arc(x,y,13*sc,0,6.3);g.fill();}
      else if(o.t==='bolt'){if(o.arm>0){const k=o.arm/1.05;g.strokeStyle='rgba(255,90,80,.95)';g.lineWidth=LW(3);g.setLineDash([P*3,P*2]);g.beginPath();g.arc(x,y,o.r*sc*(.6+.4*k),0,6.3);g.stroke();g.setLineDash([]);
          g.fillStyle='rgba(255,90,80,'+(.14+.16*(1-k))+')';g.beginPath();g.arc(x,y,o.r*sc,0,6.3);g.fill();lbl('!',x,y+8*sc,Math.round(24*sc),'#ff8a80');}
        if(o.strike>0){g.fillStyle='rgba(255,255,230,'+(o.strike/.35)+')';let bx=x,by=-10;while(by<y){const ny=Math.min(by+30,y),nx=bx+(Math.random()-.5)*40;for(let k=0;k<=1;k+=.2)g.fillRect(bx+(nx-bx)*k-P,by+(ny-by)*k,P*2,P*2);bx=nx;by=ny;}
          g.fillStyle='rgba(255,255,220,'+(.45*o.strike/.35)+')';g.beginPath();g.arc(x,y,o.r*sc,0,6.3);g.fill();}}
      else if(o.t==='crate'&&!o.done){const b=Math.sin(t*4+o.d)*2,z=9*sc;g.fillStyle='rgba(127,224,255,.28)';g.fillRect(x-z*1.8,y-z*1.8,z*3.6,z*3.6);g.fillStyle='#c9962e';g.fillRect(x-z,y-z+b,z*2,z*2);
        g.fillStyle='#6e4f12';g.fillRect(x-z,y-z+b,z*2,P);g.fillRect(x-z,y+z-P+b,z*2,P);g.fillRect(x-P/2,y-z+b,P,z*2);g.fillStyle='#ffe08a';g.fillRect(x-z+P,y-z+P+b,P*2,P);}});
    wake.forEach(p=>{const z=(3+(1.1-p.l)*7)*sc;g.fillStyle='rgba(235,248,255,'+(p.l/1.1*.4)+')';g.fillRect(X(p.x)-z/2,Y(p.d)-z/2,z,z);});
    // 배: 위를 향해 달리고, 꺾은 만큼 기운다. 돛은 뒷바람을 받아 부풀고, 순풍 돛을 펴면 더 부푼다
    g.save();g.translate(X(S.x),sy0);g.rotate(-Math.PI/2+S.ang);g.scale(sc*1.4,sc*1.4);if(S.inv>0&&Math.floor(S.inv*12)%2)g.globalAlpha=.45;
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(-2,6,22,9,0,0,6.3);g.fill();
    g.fillStyle='#3b2416';g.beginPath();g.moveTo(26,0);g.quadraticCurveTo(10,-13,-19,-10);g.lineTo(-21,10);g.quadraticCurveTo(10,13,26,0);g.fill();
    g.fillStyle='#7a4f2a';g.beginPath();g.moveTo(24,0);g.quadraticCurveTo(10,-11,-18,-9);g.lineTo(-20,9);g.quadraticCurveTo(10,11,24,0);g.fill();
    g.fillStyle='#b98a55';g.beginPath();g.moveTo(19,0);g.quadraticCurveTo(8,-7,-15,-6);g.lineTo(-16,6);g.quadraticCurveTo(8,7,19,0);g.fill();
    g.fillStyle='#8a6438';for(let k=-12;k<16;k+=5)g.fillRect(k,-6,1.5,12);
    g.fillStyle='#e3dccb';g.fillRect(-13,-4,8,8);g.fillStyle='#b3261e';g.fillRect(-11,-1,4,2);g.fillRect(-10,-2,2,4);
    const bl=S.boosting?1.5:1;g.fillStyle='#3b2416';g.beginPath();g.moveTo(7,-18);g.quadraticCurveTo(-5-6*bl,0,7,18);g.lineTo(3,0);g.closePath();g.fill();
    g.fillStyle=S.boosting?'#fff8e0':'#f2ecdc';g.beginPath();g.moveTo(6,-17);g.quadraticCurveTo(-4-6*bl,0,6,17);g.lineTo(2,0);g.closePath();g.fill();
    g.fillStyle='rgba(0,0,0,.12)';g.beginPath();g.moveTo(6,-17);g.quadraticCurveTo(-1-3*bl,0,6,17);g.lineTo(2,0);g.closePath();g.fill();
    g.fillStyle='#3b2c1a';g.fillRect(4,-18,2.5,36);g.fillStyle='#b3261e';g.fillRect(4,-21,6,3);
    g.restore();
    fx.forEach(p=>{g.globalAlpha=Math.max(0,Math.min(1,p.l*1.5));g.fillStyle=p.c;g.fillRect(X(p.x),Y(p.d),P*1.5,P*1.5);});g.globalAlpha=1;
    pops.forEach(p=>lbl(p.s,X(p.x),Y(p.d),Math.round((p.big?20:16)*Math.min(1.2,sc+.2)),p.c,Math.min(1,p.l*1.6)));
    // 속도선과 비: 픽셀 한 칸 굵기의 세로줄
    const sp=Math.max(0,(S.v-260)/300);if(sp>0){g.fillStyle='rgba(230,245,255,'+Math.min(.55,.2+.3*sp)+')';
      for(let i=0;i<26;i++){const h=Math.sin(i*47.3)*43758.5,r=h-Math.floor(h),x=i%2?r*VW*.16:VW-r*VW*.16,y=((r*VH+T*S.v*2.2+i*53)%(VH+120))-60,len=24+S.v*.12;g.fillRect(x,y,P,len);}}
    g.fillStyle='rgba(225,238,250,.28)';for(let i=0;i<55;i++){const h=Math.sin(i*91.7)*43758.5,r=h-Math.floor(h),x=(r*VW*1.3+t*260+i*37)%(VW+60)-30,y=((i*97+t*(700+r*300))%(VH+60))-30;g.fillRect(x,y,P,P*4);}
    if(S.boosting){g.fillStyle='rgba(180,230,255,.07)';g.fillRect(0,0,VW,VH);}
    if(flash>0){g.fillStyle='rgba(235,240,255,'+(flash*.45)+')';g.fillRect(0,0,VW,VH);}
    g.restore();};
  let last=performance.now();
  reset();brief();
  // 시험용: window.__slDbg를 미리 켜 두면 배와 해협 상태를 밖에서 본다
  if(window.__slDbg)window.__slDbg={S:()=>S,gates:()=>gates,OB:()=>OB,TR:()=>TR,st:()=>st,tl:()=>tl};
  const iv=setInterval(()=>{if(!live||!w.isConnected){clearInterval(iv);return;}const now=performance.now(),dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;step(dt);draw();},1000/60);}
