/* ---------- 비밀 모드 「대항해」: 섬마을로 백신을 싣고 ----------
   메인 화면 로고의 나침반을 다섯 바퀴 돌리면 열린다. 위에서 내려다본 바다에서 수송선을 몰아 섬마을 세 곳에 백신을 내려 주고 모항으로 돌아온다.
   · 배는 키(◀ ▶ · A D · ← →)로만 몬다. 돛은 저절로 맞춰진다.
   · 바람을 정면으로 받으면(바람이 불어오는 쪽에서 좌우 35° 안, 붉은 부채꼴) 배가 멈춘다. 바람을 거슬러 갈 때는 비스듬히 지그재그로 간다.
     옆바람(90°)이 가장 빠르고, 뒷바람은 조금 느리다. 바람은 천천히 방향을 바꾼다.
   · 섬과 암초에 부딪히거나 폭풍 구름 안에 오래 있으면 선체가 상한다(셋). 떠다니는 물자 상자를 주우면 기록에서 5초가 빠진다.
   · 기록은 걸린 시간. 항로 길이로 정한 기준 시간에 따라 금·은·동. 최고 기록은 MEM.sail에 남는다. */
const SL={W:2600,H:1800,VMAX:150,NOGO:35};
const slWrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a;};
// 바람이 불어오는 쪽과 뱃머리 사이 각(도)에 따른 속도 비율
function slPolar(th){if(th<SL.NOGO)return .05;if(th<50)return .05+.7*(th-SL.NOGO)/(50-SL.NOGO);if(th<100)return .75+.25*(th-50)/50;if(th<150)return 1-.15*(th-100)/50;return .85-.2*(th-150)/30;}
// 기록 = 걸린 시간 − 상자 보너스. 다만 상자로 줄일 수 있는 건 걸린 시간의 절반까지
const slRec=(t,b)=>Math.max(t*.5,t-b);
const slTime=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
const SL_NAMES=['소금섬','등대섬','갈매섬','달섬','바람섬','동백섬','먼섬'];
// 섬: 둘레를 들쭉날쭉하게. port가 있으면 마을(보건소)이 있는 섬
function slIsland(x,y,r,name){const n=18,pts=[];let s=Math.random()*9;for(let i=0;i<n;i++){s+=.7;pts.push(r*(.8+.18*Math.sin(s)+.12*Math.random()));}
  return {x:x,y:y,r:r,pts:pts,name:name,trees:Array.from({length:Math.round(r/18)},()=>{const a=Math.random()*6.3,d=Math.random()*r*.5;return [x+Math.cos(a)*d,y+Math.sin(a)*d];})};}
function slWorld(){const I=[],ok=(x,y,r)=>x>r+120&&x<SL.W-r-120&&y>r+120&&y<SL.H-r-120&&I.every(o=>Math.hypot(o.x-x,o.y-y)>o.r+r+170);
  const home=slIsland(260,SL.H-300,120,'모항');I.push(home);let k=0,names=SL_NAMES.slice().sort(()=>Math.random()-.5);
  for(let t=0;t<900&&I.length<11;t++){const r=60+Math.random()*90,x=Math.random()*SL.W,y=Math.random()*SL.H;if(ok(x,y,r))I.push(slIsland(x,y,r,names[k++%names.length]));}
  // 마을 셋: 모항에서 멀리 흩어진 섬. 항구는 섬 가장자리 바깥쪽(바다 쪽)
  const far=I.slice(1).sort((a,b)=>Math.hypot(b.x-home.x,b.y-home.y)-Math.hypot(a.x-home.x,a.y-home.y));
  const V=[far[0]];for(const o of far)if(V.length<3&&V.every(v=>Math.hypot(v.x-o.x,v.y-o.y)>700))V.push(o);for(const o of far)if(V.length<3&&V.indexOf(o)<0)V.push(o);
  const port=o=>{const a=Math.atan2(SL.H/2-o.y,SL.W/2-o.x)+(Math.random()-.5)*.8;return {x:o.x+Math.cos(a)*(o.r+46),y:o.y+Math.sin(a)*(o.r+46),a:a};};
  home.port=port(home);home.home=1;V.forEach(v=>{v.port=port(v);v.vil=1;v.done=0;});
  const reefs=[];I.forEach(o=>{const n=o.home?0:Math.floor(Math.random()*3);for(let i=0;i<n;i++){const a=Math.random()*6.3;if(o.port&&Math.abs(slWrap(a-o.port.a))<.9)continue;reefs.push({x:o.x+Math.cos(a)*(o.r+38),y:o.y+Math.sin(a)*(o.r+38),r:12+Math.random()*10});}});
  const crates=[];for(let t=0;t<200&&crates.length<6;t++){const x=200+Math.random()*(SL.W-400),y=200+Math.random()*(SL.H-400);if(I.every(o=>Math.hypot(o.x-x,o.y-y)>o.r+90))crates.push({x:x,y:y,got:0,ph:Math.random()*6});}
  // 기준 시간: 모항 → 가까운 순서로 마을 셋 → 모항, 지그재그를 감안해 평균 92px/s로
  let p=home.port,L=V.slice(),d=0;while(L.length){L.sort((a,b)=>Math.hypot(a.port.x-p.x,a.port.y-p.y)-Math.hypot(b.port.x-p.x,b.port.y-p.y));const q=L.shift();d+=Math.hypot(q.port.x-p.x,q.port.y-p.y);p=q.port;}
  d+=Math.hypot(home.port.x-p.x,home.port.y-p.y);
  return {I:I,home:home,V:V,reefs:reefs,crates:crates,par:Math.round(d/92),
    storms:[0,1].map(()=>({x:600+Math.random()*(SL.W-1200),y:300+Math.random()*(SL.H-600),r:150+Math.random()*50}))};}
function sailOpen(){if(document.getElementById('sl'))return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);
  const w=document.createElement('div');w.id='sl';w.className='sl';
  w.innerHTML='<canvas id="slC"></canvas><div class="sl-hud"><button type="button" class="sl-x" id="slX" aria-label="메인 메뉴로">✕</button>'+
    '<span class="sl-h"><small>배송</small><b id="slD">0 / 3</b></span><span class="sl-h"><small>시간</small><b id="slT">0:00</b></span><span class="sl-h"><small>선체</small><b id="slHp"></b></span><span class="sl-h"><small>속도</small><b id="slSp">0</b><small>노트</small></span></div>'+
    '<div class="sl-tip" id="slTip"></div><div class="sl-ctl"><button type="button" data-a="l" aria-label="왼쪽으로 키">◀</button><button type="button" data-a="r" aria-label="오른쪽으로 키">▶</button></div>'+
    '<div class="sl-ov" id="slOv"></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id),cv=$('slC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1);
  let VW=0,VH=0;const fit=()=>{VW=w.clientWidth;VH=w.clientHeight;cv.width=VW*D;cv.height=VH*D;cv.style.width=VW+'px';cv.style.height=VH+'px';g.setTransform(D,0,0,D,0,0);};fit();
  let Wd,S0,st='brief',t=0,inp={l:0,r:0},wake=[],fx=[],tipT=0,nogoT=0,camX=0,camY=0,bonus=0;
  const reset=()=>{Wd=slWorld();const hp=Wd.home.port;S0={x:hp.x,y:hp.y,h:hp.a,sp:0,hp:3,inv:0,dl:0};wd=-Math.PI/2+(Math.random()-.5)*1.2;wTo=wd;t=0;bonus=0;wake=[];fx=[];camX=S0.x;camY=S0.y;hud();};
  let wd=0,wTo=0;   // 바람이 불어 가는 쪽(라디안). 바람이 불어오는 쪽은 wd+π
  const tip=(s,sec)=>{$('slTip').textContent=s;$('slTip').classList.add('on');tipT=sec||2.4;};
  const hud=()=>{$('slD').textContent=S0.dl+' / 3';$('slT').textContent=slTime(slRec(t,bonus));$('slHp').innerHTML=[0,1,2].map(i=>'<i'+(i<S0.hp?' class="on"':'')+'></i>').join('');
    $('slSp').textContent=(S0.sp/10).toFixed(1);};
  const ov=h=>{$('slOv').innerHTML=h;$('slOv').style.display=h?'flex':'none';};
  const best=()=>(MEM.sail&&MEM.sail.best)||0;
  const brief=()=>{st='brief';ov('<div class="sl-card"><span class="sl-k">비밀 모드</span><h2>대항해</h2><p class="sl-s">섬마을 세 곳에 백신이 떨어졌다. 수송선을 몰고 모두 들렀다가 모항으로 돌아오라.</p>'+
    '<ul><li><b>바람을 정면으로 받으면 배가 멈춘다.</b> 뱃머리 앞 붉은 부채꼴이 바람이 불어오는 쪽이다. 거슬러 갈 때는 비스듬히 지그재그로.</li><li>옆바람이 가장 빠르다. 바람은 천천히 방향을 바꾼다.</li>'+
    '<li>섬·암초에 부딪히거나 폭풍 구름에 오래 있으면 선체가 상한다(셋). 물자 상자를 주우면 기록에서 5초가 빠진다.</li><li>키: ◀ ▶ 단추 · A D · ← →</li></ul>'+
    '<div class="sl-b"><span>기준 시간 <b>'+slTime(Wd.par)+'</b></span>'+(best()?'<span>최고 기록 <b>'+slTime(best())+'</b></span>':'')+'</div>'+
    '<button type="button" class="pri" id="slGo">출항</button></div>');
    $('slGo').onclick=()=>{try{aInit();SFX.click();}catch(e){}ov('');st='sail';tip('모항 출항 · 붉은 깃발 섬마을 셋을 찾아라',3);try{[392,523,659].forEach((f,i)=>tone(f,'triangle',.35,.08,i*.12));}catch(e){}};};
  const medal=s=>s<=Wd.par*1.05?0:s<=Wd.par*1.35?1:s<=Wd.par*1.8?2:3;
  const end=win=>{st='end';const s=slRec(t,bonus),m=win?medal(s):3,M=MEM.sail=MEM.sail||{best:0,runs:0,gold:0};M.runs++;let nb=false;
    if(win){if(!M.best||s<M.best){M.best=s;nb=true;}if(m===0)M.gold=(M.gold||0)+1;}msave();try{SFX.medal(m);}catch(e){}
    ov('<div class="sl-card"><span class="sl-k">'+(win?(nb?'최고 기록!':'귀항'):'침몰')+'</span><h2>'+(win?['금메달 항해','은메달 항해','동메달 항해','늦은 귀항'][m]:'수송선이 가라앉았다')+'</h2>'+
      '<p class="sl-s">'+(win?'백신 세 상자를 모두 내려 주고 모항으로 돌아왔다.':'배송 '+S0.dl+'곳 · 선원들은 구명정으로 무사히 돌아왔다.')+'</p>'+
      '<div class="sl-b"><span>기록 <b>'+(win?slTime(s):'—')+'</b></span><span>기준 <b>'+slTime(Wd.par)+'</b></span><span>최고 <b>'+(M.best?slTime(M.best):'—')+'</b></span></div>'+
      (win?'<div class="sl-med">'+['금 · 기준의 1.05배 안','은 · 1.35배 안','동 · 1.8배 안','메달 없음'].map((x,i)=>'<span class="'+(i===m?'on':'')+'">'+x+'</span>').join('')+'</div>':'')+
      '<button type="button" class="pri" id="slAg">다시 항해</button><button type="button" id="slOut">메인 메뉴로</button></div>');
    $('slAg').onclick=()=>{try{SFX.click();}catch(e){}reset();brief();};$('slOut').onclick=close;};
  const close=()=>{try{SFX.back();}catch(e){}live=false;w.remove();document.body.style.overflow='';document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);removeEventListener('resize',fit);home();};
  $('slX').onclick=close;
  w.querySelectorAll('.sl-ctl button').forEach(b=>{const a=b.dataset.a,set=v=>e=>{e.preventDefault();inp[a]=v;b.classList.toggle('on',!!v);};
    b.addEventListener('pointerdown',set(1));['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,set(0)));b.addEventListener('contextmenu',e=>e.preventDefault());});
  const km={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r'};
  const kd=e=>{if(e.key==='Escape'){close();return;}const a=km[e.key];if(a){e.preventDefault();inp[a]=1;}else if((e.key==='Enter'||e.key===' ')&&st==='brief'&&$('slGo')){e.preventDefault();$('slGo').click();}},ku=e=>{const a=km[e.key];if(a)inp[a]=0;};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);addEventListener('resize',fit);
  const hit=(why)=>{if(S0.inv>0)return;S0.hp--;S0.inv=2;try{thud(90,.3,0,.3);noise(.25,.15,0,800);}catch(e){}vib(80);tip(why,2);for(let i=0;i<14;i++)fx.push({x:S0.x,y:S0.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,l:.7,c:'#fff'});
    if(S0.hp<=0)end(false);};
  const step=dt=>{t+=st==='sail'?dt:0;if(tipT>0&&(tipT-=dt)<=0)$('slTip').classList.remove('on');
    fx.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;});fx=fx.filter(p=>p.l>0);
    // 바람: 몇 초마다 목표 방향을 조금씩 바꾸고 천천히 따라간다
    if(Math.random()<dt/7)wTo=wd+(Math.random()-.5)*1.4;wd+=slWrap(wTo-wd)*dt*.12;
    Wd.storms.forEach(s=>{s.x+=Math.cos(wd)*14*dt;s.y+=Math.sin(wd)*14*dt;if(s.x<-200||s.x>SL.W+200||s.y<-200||s.y>SL.H+200){s.x=SL.W-s.x;s.y=SL.H-s.y;}});
    if(st!=='sail')return;
    const S=S0,th=Math.abs(slWrap(S.h-(wd+Math.PI)))*180/Math.PI,tg=SL.VMAX*slPolar(th);
    S.sp+=(tg-S.sp)*Math.min(1,dt*(tg>S.sp?.55:1.1));
    const tr=1.7*(.4+.6*Math.min(1,S.sp/SL.VMAX));if(inp.l)S.h-=tr*dt;if(inp.r)S.h+=tr*dt;S.h=slWrap(S.h);
    let nx=S.x+Math.cos(S.h)*S.sp*dt,ny=S.y+Math.sin(S.h)*S.sp*dt;
    // 폭풍: 바람 방향으로 밀고, 오래 있으면 선체가 상한다
    let inStorm=0;Wd.storms.forEach(s=>{const d=Math.hypot(nx-s.x,ny-s.y);if(d<s.r){inStorm=1;nx+=Math.cos(wd)*40*dt;ny+=Math.sin(wd)*40*dt;S.h+=(Math.random()-.5)*dt*1.2;}});
    S.storm=inStorm?(S.storm||0)+dt:0;if(S.storm>2.2){S.storm=0;hit('폭풍에 돛대가 꺾일 뻔했다!');}
    nx=Math.max(20,Math.min(SL.W-20,nx));ny=Math.max(20,Math.min(SL.H-20,ny));
    // 섬과 암초: 부딪히면 밀려나고 선체가 상한다
    // 살짝 닿으면 튕겨 나가기만 하고, 세게(정면 속도 45 넘게) 박으면 선체가 상한다
    const bump=(ox,oy,R,why)=>{const d=Math.hypot(nx-ox,ny-oy);if(d>=R)return;const ux=(nx-ox)/(d||1),uy=(ny-oy)/(d||1);nx=ox+ux*R;ny=oy+uy*R;
      const dx=Math.cos(S.h),dy=Math.sin(S.h),dn=dx*ux+dy*uy;if(dn<0){if(-dn*S.sp>45)hit(why);S.h=Math.atan2(dy-2*dn*uy,dx-2*dn*ux);S.sp*=.5;}};
    for(const o of Wd.I)bump(o.x,o.y,o.r*.92+10,o.name+' 해안에 세게 부딪혔다!');
    for(const r of Wd.reefs)bump(r.x,r.y,r.r+10,'암초에 긁혔다!');
    S.x=nx;S.y=ny;if(S.inv>0)S.inv-=dt;
    if(Math.random()<dt*20&&S.sp>20)wake.push({x:S.x-Math.cos(S.h)*16,y:S.y-Math.sin(S.h)*16,l:1.6});wake.forEach(p=>p.l-=dt);wake=wake.filter(p=>p.l>0);
    if(th<SL.NOGO){if((nogoT+=dt)>1.2&&tipT<=0)tip('바람을 정면으로 받고 있다 · 비스듬히 틀어라');}else nogoT=0;
    for(const c of Wd.crates)if(!c.got&&Math.hypot(S.x-c.x,S.y-c.y)<30){c.got=1;bonus+=5;tip('물자 상자 · 기록 −5초',1.6);try{SFX.coin();}catch(e){}}
    for(const v of Wd.V)if(!v.done&&Math.hypot(S.x-v.port.x,S.y-v.port.y)<58){v.done=1;S.dl++;tip(v.name+' 보건소에 백신을 내렸다 ('+S.dl+'/3)',2.6);
      try{[1047,1319].forEach((f,i)=>tone(f,'sine',.7,.12,i*.18));}catch(e){}for(let i=0;i<18;i++)fx.push({x:v.port.x,y:v.port.y,vx:(Math.random()-.5)*120,vy:(Math.random()-.5)*120,l:.9,c:'#ffe08a'});}
    if(S.dl>=3&&Math.hypot(S.x-Wd.home.port.x,S.y-Wd.home.port.y)<58)end(true);
    hud();};
  // ----- 그리기 -----
  const poly=(o,k,fill)=>{g.beginPath();o.pts.forEach((p,i)=>{const a=i/o.pts.length*6.283,x=o.x+Math.cos(a)*p*k,y=o.y+Math.sin(a)*p*k;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();g.fillStyle=fill;g.fill();};
  const flag=(x,y,c,done)=>{g.strokeStyle='#3b2c1a';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x,y-30);g.stroke();g.fillStyle=c;g.beginPath();g.moveTo(x,y-30);g.lineTo(x+20,y-24);g.lineTo(x,y-18);g.fill();
    if(!done){g.fillStyle='#fff';g.fillRect(x+5,y-26,6,2);g.fillRect(x+7,y-28,2,6);}};
  const ship=S=>{g.save();g.translate(S.x,S.y);g.rotate(S.h);g.scale(1.35,1.35);if(S.inv>0&&Math.floor(S.inv*10)%2)g.globalAlpha=.5;
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(2,4,22,9,0,0,6.3);g.fill();
    g.fillStyle='#7a4f2a';g.beginPath();g.moveTo(24,0);g.quadraticCurveTo(10,-11,-18,-9);g.lineTo(-20,9);g.quadraticCurveTo(10,11,24,0);g.fill();
    g.fillStyle='#b98a55';g.beginPath();g.moveTo(19,0);g.quadraticCurveTo(8,-7,-15,-6);g.lineTo(-16,6);g.quadraticCurveTo(8,7,19,0);g.fill();
    g.fillStyle='#e3dccb';g.fillRect(-12,-4,8,8);g.fillStyle='#b3261e';g.fillRect(-10,-1,4,2);g.fillRect(-9,-2,2,4);
    // 돛: 바람이 불어 가는 쪽(바람 아래)으로 붐이 돌아간다. 역풍이면 펄럭인다
    const rel=slWrap(wd-S.h),th=Math.abs(slWrap(S.h-(wd+Math.PI)))*180/Math.PI,side=rel>0?1:-1,luff=th<SL.NOGO;
    const ba=luff?Math.sin(t*22)*.35:side*Math.min(1.35,Math.max(.15,(th-30)/150*1.35)),bl=26,ex=Math.cos(Math.PI-ba)*bl,ey=Math.sin(Math.PI-ba)*bl;
    // 돛의 배: 붐에 수직으로, 바람이 불어 가는 쪽으로 부푼다
    let px=-ey/bl,py=ex/bl;if(px*Math.cos(rel)+py*Math.sin(rel)<0){px=-px;py=-py;}const bulge=luff?Math.sin(t*30)*3:4+6*slPolar(th);
    g.strokeStyle='#4a341d';g.lineWidth=2;g.beginPath();g.moveTo(4,0);g.lineTo(4+ex,ey);g.stroke();
    g.fillStyle=luff?'rgba(247,243,234,.8)':'#f7f3ea';g.strokeStyle='rgba(60,45,25,.5)';g.lineWidth=1;g.beginPath();g.moveTo(4,0);
    g.quadraticCurveTo(4+ex/2+px*bulge*2,ey/2+py*bulge*2,4+ex,ey);g.lineTo(4,0);g.fill();g.stroke();
    g.fillStyle='#3b2c1a';g.beginPath();g.arc(4,0,2.4,0,6.3);g.fill();g.restore();};
  const draw=()=>{const S=S0;camX+=(S.x+Math.cos(S.h)*80-camX)*.08;camY+=(S.y+Math.sin(S.h)*80-camY)*.08;
    const cx=Math.max(VW/2,Math.min(SL.W-VW/2,camX)),cy=Math.max(VH/2,Math.min(SL.H-VH/2,camY)),ox=VW/2-cx,oy=VH/2-cy;
    const sg=g.createLinearGradient(0,0,0,VH);sg.addColorStop(0,'#0f4c75');sg.addColorStop(1,'#0b3a5c');g.fillStyle=sg;g.fillRect(0,0,VW,VH);
    g.save();g.translate(ox,oy);
    // 물결: 바람 방향으로 흐르는 짧은 호
    const wx=Math.cos(wd)*t*24,wy=Math.sin(wd)*t*24,gs=90;g.strokeStyle='rgba(255,255,255,.13)';g.lineWidth=1.4;g.beginPath();
    // 칸 번호를 바람에 밀린 좌표로 세서, 물결 하나하나가 끊기지 않고 흘러간다
    for(let gx=Math.floor((cx-VW/2-wx)/gs)-1;gx<=Math.ceil((cx+VW/2-wx)/gs)+1;gx++)for(let gy=Math.floor((cy-VH/2-wy)/gs)-1;gy<=Math.ceil((cy+VH/2-wy)/gs)+1;gy++){
      const h=Math.sin(gx*12.9898+gy*78.233)*43758.5,r=h-Math.floor(h),px=gx*gs+r*60+wx,py=gy*gs+r*50+wy;
      g.moveTo(px-9,py);g.quadraticCurveTo(px,py-4-2*Math.sin(t*2+r*6),px+9,py);}g.stroke();
    // 얕은 바다 → 모래 → 숲
    Wd.I.forEach(o=>{const sh=g.createRadialGradient(o.x,o.y,o.r*.6,o.x,o.y,o.r*1.5);sh.addColorStop(0,'rgba(94,190,190,.55)');sh.addColorStop(1,'rgba(94,190,190,0)');g.fillStyle=sh;g.beginPath();g.arc(o.x,o.y,o.r*1.5,0,6.3);g.fill();});
    Wd.I.forEach(o=>{poly(o,1.02,'#e8d7a8');poly(o,.8,o.home?'#6f9a52':'#5f9a4f');g.fillStyle='#3f7a3a';o.trees.forEach(p=>{g.beginPath();g.arc(p[0],p[1],7,0,6.3);g.fill();});
      if(o.port){const P=o.port,ix=o.x+Math.cos(P.a)*o.r*.9,iy=o.y+Math.sin(P.a)*o.r*.9;g.strokeStyle='#8a6a3a';g.lineWidth=5;g.beginPath();g.moveTo(ix,iy);g.lineTo(P.x-Math.cos(P.a)*14,P.y-Math.sin(P.a)*14);g.stroke();
        g.fillStyle='#a0522d';[[-14,-10],[6,-14],[-4,8]].forEach(q=>{const hx=o.x+Math.cos(P.a)*o.r*.45+q[0],hy=o.y+Math.sin(P.a)*o.r*.45+q[1];g.fillStyle='#e6d3b0';g.fillRect(hx-5,hy-4,10,8);g.fillStyle='#b3261e';g.fillRect(hx-6,hy-7,12,4);});
        const pend=o.vil&&!o.done,ring=o.home?S0.dl>=3:pend;if(ring){g.strokeStyle='rgba(255,224,138,'+(.5+.4*Math.sin(t*4))+')';g.lineWidth=2.5;g.setLineDash([8,6]);g.beginPath();g.arc(P.x,P.y,52,0,6.3);g.stroke();g.setLineDash([]);}
        flag(ix,iy,o.home?'#2f6fd0':o.done?'#3fc38f':'#e0504a',o.home||o.done);
        g.font='800 15px '+getComputedStyle(document.body).fontFamily;g.textAlign='center';g.fillStyle='rgba(255,255,255,.92)';g.strokeStyle='rgba(11,58,92,.8)';g.lineWidth=4;g.strokeText(o.name,o.x,o.y-o.r-26);g.fillText(o.name,o.x,o.y-o.r-26);}});
    Wd.reefs.forEach(r=>{g.fillStyle='#5a5148';g.beginPath();g.arc(r.x,r.y,r.r,0,6.3);g.fill();g.strokeStyle='rgba(255,255,255,'+(.35+.25*Math.sin(t*3+r.x))+')';g.lineWidth=2;g.beginPath();g.arc(r.x,r.y,r.r+5,0,6.3);g.stroke();});
    Wd.crates.forEach(c=>{if(c.got)return;const b=Math.sin(t*2+c.ph)*2;g.fillStyle='#c9962e';g.fillRect(c.x-8,c.y-8+b,16,16);g.strokeStyle='#6e4f12';g.lineWidth=2;g.strokeRect(c.x-8,c.y-8+b,16,16);g.beginPath();g.moveTo(c.x-8,c.y-8+b);g.lineTo(c.x+8,c.y+8+b);g.stroke();});
    wake.forEach(p=>{g.fillStyle='rgba(255,255,255,'+(p.l/1.6*.35)+')';g.beginPath();g.arc(p.x,p.y,3+(1.6-p.l)*6,0,6.3);g.fill();});
    // 역풍 부채꼴(배 둘레)
    if(st==='sail'){const wf=wd+Math.PI;g.fillStyle='rgba(224,80,74,.16)';g.beginPath();g.moveTo(S.x,S.y);g.arc(S.x,S.y,70,wf-SL.NOGO*Math.PI/180,wf+SL.NOGO*Math.PI/180);g.closePath();g.fill();}
    ship(S);
    fx.forEach(p=>{g.fillStyle=p.c;g.globalAlpha=Math.max(0,p.l);g.fillRect(p.x,p.y,3,3);g.globalAlpha=1;});
    Wd.storms.forEach(s=>{const cg=g.createRadialGradient(s.x,s.y,10,s.x,s.y,s.r);cg.addColorStop(0,'rgba(40,46,60,.55)');cg.addColorStop(1,'rgba(40,46,60,0)');g.fillStyle=cg;g.beginPath();g.arc(s.x,s.y,s.r,0,6.3);g.fill();
      g.strokeStyle='rgba(200,215,235,.35)';g.lineWidth=1;g.beginPath();for(let i=0;i<14;i++){const a=i*.45+t*.3,rr=s.r*(.25+.5*((i*37)%10)/10),x=s.x+Math.cos(a)*rr,y=s.y+Math.sin(a)*rr,ry=(t*160+i*40)%30;g.moveTo(x-3,y-10+ry);g.lineTo(x-7,y+ry);}g.stroke();});
    g.restore();
    // 아직 안 간 목적지를 화면 가장자리 화살표로
    if(st==='sail'){const T=S.dl>=3?[Wd.home]:Wd.V.filter(v=>!v.done);T.forEach(o=>{const px=o.port.x+ox,py=o.port.y+oy;if(px>20&&px<VW-20&&py>60&&py<VH-90)return;
      const a=Math.atan2(py-VH/2,px-VW/2),m=Math.min((VW/2-26)/Math.abs(Math.cos(a)||1e-6),(VH/2-70)/Math.abs(Math.sin(a)||1e-6)),ax=VW/2+Math.cos(a)*m,ay=VH/2+Math.sin(a)*m;
      g.save();g.translate(ax,ay);g.rotate(a);g.fillStyle=o.home?'#7fb6ff':'#ff8a80';g.beginPath();g.moveTo(12,0);g.lineTo(-8,-8);g.lineTo(-4,0);g.lineTo(-8,8);g.fill();g.restore();});}
    // 바람 나침반(오른쪽 위)과 작은 지도(왼쪽 아래)
    const kx=VW-52,ky=VW<560?132:92;g.fillStyle='rgba(5,20,35,.55)';g.beginPath();g.arc(kx,ky,36,0,6.3);g.fill();g.strokeStyle='rgba(241,213,137,.6)';g.lineWidth=1.5;g.beginPath();g.arc(kx,ky,36,0,6.3);g.stroke();
    g.fillStyle='rgba(241,213,137,.9)';g.font='700 10px sans-serif';g.textAlign='center';g.fillText('N',kx,ky-24);
    g.save();g.translate(kx,ky);g.rotate(wd);g.fillStyle='#cfe6ff';g.beginPath();g.moveTo(24,0);g.lineTo(6,-8);g.lineTo(8,0);g.lineTo(6,8);g.fill();g.fillRect(-24,-1.5,18,3);g.restore();
    g.save();g.translate(kx,ky);g.rotate(S.h);g.strokeStyle='#ffe08a';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(30,0);g.stroke();g.restore();
    g.fillStyle='rgba(207,230,255,.8)';g.font='700 10px sans-serif';g.fillText('바람',kx,ky+50);
    const mw=Math.min(150,VW*.32),mh=mw*SL.H/SL.W,mx=12,my=VH-mh-96;g.fillStyle='rgba(5,20,35,.6)';g.fillRect(mx,my,mw,mh);g.strokeStyle='rgba(255,255,255,.2)';g.strokeRect(mx,my,mw,mh);
    const mk=mw/SL.W;Wd.I.forEach(o=>{g.fillStyle=o.home?'#7fb6ff':o.vil?(o.done?'#3fc38f':'#ff8a80'):'#cbb88a';g.beginPath();g.arc(mx+o.x*mk,my+o.y*mk,Math.max(2,o.r*mk),0,6.3);g.fill();});
    g.fillStyle='#ffe08a';g.beginPath();g.arc(mx+S.x*mk,my+S.y*mk,3,0,6.3);g.fill();
    g.strokeStyle='rgba(255,255,255,.5)';g.strokeRect(mx+(cx-VW/2)*mk,my+(cy-VH/2)*mk,VW*mk,VH*mk);};
  let live=true,last=performance.now();
  reset();brief();
  // 시험용: window.__slDbg를 미리 켜 두면 배와 바다 상태를 밖에서 본다
  if(window.__slDbg)window.__slDbg={S:()=>S0,W:()=>Wd,wind:()=>wd};
  const iv=setInterval(()=>{if(!live||!w.isConnected){clearInterval(iv);return;}const now=performance.now(),dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;step(dt);draw();},1000/60);}
