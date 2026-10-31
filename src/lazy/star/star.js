/* ---------- 미니게임 「별똥별을 피해라」: 밤하늘 서바이벌 ----------
   메인 화면의 큰 나침반을 돌려, 바늘의 하얀 끝이 원 밖의 별을 3초 동안 가리키게 하면 열린다(게임 → 미니게임에서도 할 수 있다).
   나침반의 금빛 별이 밤하늘로 날아올랐다. 쏟아지는 별똥별을 피하며 버틴다.
   · 화면 어디든 손가락(마우스)을 대고 끌면 별이 그만큼 따라 움직인다(손가락이 별을 가리지 않게 '끄는 만큼' 움직인다). 키보드는 방향키 · WASD.
   · 별똥별은 들어오기 전에 화면 가장자리에서 희미한 빛줄기로 지나갈 길을 먼저 보여 준다(피할 틈 없이 갑자기 나오지 않는다).
   · 아슬아슬하게 스치면 +20점. 소원 조각(하늘색)은 이어서 모을수록 배수가 붙는다. 부딪히면 별빛 하나가 꺼진다(셋). 파란 방패별은 한 번 막아 준다.
   · 유성우: 가끔 한꺼번에 쏟아지지만, 늘 한 줄기 빈 길이 남는다(빛줄기가 없는 곳). 크고 붉은 화구는 한가운데쯤에서 셋으로 갈라진다.
   · 150초를 버티면 새벽이 온다(보너스 +2000, 그 뒤로도 계속할 수 있다).
   기록은 점수. 최고 기록은 MEM.star에 남고, 명예의 전당 「미니게임 순위」에 오른다. */
const SSX={HP:3,DAWN:150,GRAZE:20,SHARD:50,GAP0:.9,GAP_MIN:.24,V0:300};
const ssTime=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function starOpen(back){if(document.getElementById('ss'))return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);back=back||home;
  try{bgmSet(BGM.trk,false);}catch(e){}
  const w=document.createElement('div');w.id='ss';w.className='ss';w.setAttribute('role','dialog');w.setAttribute('aria-label','별똥별을 피해라');
  w.innerHTML='<canvas id="ssC"></canvas><div class="ss-hud"><button type="button" class="ss-x" id="ssX" aria-label="미니게임으로">✕</button>'+
    '<div class="ss-sc"><b id="ssS">0</b><small id="ssT">0:00</small></div>'+
    '<div class="ss-r"><span class="ss-hp" id="ssHp" aria-label="남은 별빛"></span><button type="button" class="ss-p" id="ssP" aria-label="일시정지"><i></i><i></i></button></div></div>'+
    '<div class="ss-ban" id="ssBan" aria-live="polite"></div><div class="ss-ov" id="ssOv"></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id),cv=$('ssC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),FF=getComputedStyle(document.body).fontFamily;
  let W=0,H=0,sc=1,BG=null;
  // 미리 그려 둔 그림(빛 · 별 · 조각): 매 프레임 그라데이션을 만들지 않게 한 번만 만든다
  const spr=(n,f)=>{const c=document.createElement('canvas');c.width=c.height=Math.ceil(n*D);const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);f(x,n);return c;};
  const glow=(col,n)=>spr(n,(x,s)=>{const r=s/2,gr=x.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,col);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,s,s);});
  const SPR={};
  const mkSpr=()=>{SPR.head=glow('rgba(255,236,190,.9)',64);SPR.red=glow('rgba(255,120,90,.95)',64);SPR.cyan=glow('rgba(150,225,255,.9)',48);SPR.gold=glow('rgba(255,214,120,.8)',96);SPR.blue=glow('rgba(120,170,255,.9)',64);
    // 나침반의 금빛 별(네 갈래) — 메인 화면 문장 가운데의 그 별
    SPR.me=spr(48,(x,s)=>{const c=s/2,R=s*.46,r=s*.12;x.translate(c,c);const gr=x.createLinearGradient(-R,-R,R,R);gr.addColorStop(0,'#fff6cf');gr.addColorStop(.5,'#e8c45a');gr.addColorStop(1,'#9a7424');
      x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,rr=i%2?r:R;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}x.closePath();x.fillStyle=gr;x.fill();x.lineWidth=1;x.strokeStyle='#5d4515';x.stroke();
      x.beginPath();x.arc(0,0,s*.07,0,6.283);x.fillStyle='#15120e';x.fill();x.lineWidth=1.2;x.strokeStyle='#f1d589';x.stroke();});
    SPR.shard=spr(24,(x,s)=>{const c=s/2;x.translate(c,c);x.beginPath();x.moveTo(0,-s*.42);x.lineTo(s*.24,0);x.lineTo(0,s*.42);x.lineTo(-s*.24,0);x.closePath();x.fillStyle='#dff6ff';x.fill();x.strokeStyle='#6fd0ff';x.lineWidth=1.5;x.stroke();});};
  mkSpr();
  // 밤하늘 바탕(그라데이션 · 은하수 · 먼 별 · 별자리 · 달 · 잠든 마을)은 크기가 바뀔 때만 다시 그린다
  const mkBG=()=>{const c=document.createElement('canvas');c.width=Math.ceil(W*D);c.height=Math.ceil(H*D);const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);
    const gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#03050c');gr.addColorStop(.55,'#0a1430');gr.addColorStop(1,'#1b2347');x.fillStyle=gr;x.fillRect(0,0,W,H);
    // 은하수: 비스듬한 흐릿한 띠
    x.save();x.translate(W*.5,H*.42);x.rotate(-.5);const mw=x.createLinearGradient(0,-H*.18,0,H*.18);mw.addColorStop(0,'rgba(120,140,220,0)');mw.addColorStop(.5,'rgba(150,165,235,.10)');mw.addColorStop(1,'rgba(120,140,220,0)');
    x.fillStyle=mw;x.fillRect(-W*1.2,-H*.18,W*2.4,H*.36);x.restore();
    for(let i=0;i<Math.round(W*H/2600);i++){const sx=Math.random()*W,sy=Math.random()*H*.86,a=.15+Math.random()*.55,r=Math.random()<.08?1.3:.7;x.fillStyle='rgba(235,240,255,'+a.toFixed(2)+')';x.fillRect(sx,sy,r,r);}
    // 별자리 셋(희미한 선)
    const cons=[[[.12,.18],[.2,.14],[.27,.2],[.33,.16],[.4,.22]],[[.68,.12],[.74,.2],[.82,.17],[.86,.27],[.78,.31]],[[.55,.34],[.6,.4],[.66,.37]]];
    x.strokeStyle='rgba(170,190,255,.16)';x.lineWidth=1;cons.forEach(L=>{x.beginPath();L.forEach(([a,b],i)=>{const px=a*W,py=b*H;i?x.lineTo(px,py):x.moveTo(px,py);});x.stroke();
      L.forEach(([a,b])=>{x.fillStyle='rgba(220,230,255,.55)';x.beginPath();x.arc(a*W,b*H,1.6,0,6.283);x.fill();});});
    // 달
    const mx=W*.82,my=H*.12,mr=Math.max(16,Math.min(34,W*.045));const mg=x.createRadialGradient(mx,my,mr*.2,mx,my,mr*3.2);mg.addColorStop(0,'rgba(255,244,214,.22)');mg.addColorStop(1,'rgba(255,244,214,0)');
    x.fillStyle=mg;x.fillRect(mx-mr*3.2,my-mr*3.2,mr*6.4,mr*6.4);x.fillStyle='#f3ead2';x.beginPath();x.arc(mx,my,mr,0,6.283);x.fill();x.fillStyle='#0a1430';x.beginPath();x.arc(mx+mr*.42,my-mr*.18,mr*.92,0,6.283);x.fill();
    // 잠든 마을: 건물 실루엣과 몇 개의 켜진 창
    let bx=-10;const base=H-2;x.fillStyle='#070b18';while(bx<W+10){const bw=24+Math.random()*48,bh=H*(.05+Math.random()*.11);x.fillRect(bx,base-bh,bw,bh+4);
      for(let wy=base-bh+8;wy<base-6;wy+=11)for(let wx=bx+5;wx<bx+bw-6;wx+=9)if(Math.random()<.12){x.fillStyle='rgba(255,214,140,'+(.35+Math.random()*.4).toFixed(2)+')';x.fillRect(wx,wy,3,4);x.fillStyle='#070b18';}
      bx+=bw+2+Math.random()*6;}
    return c;};
  // 반짝이는 가까운 별(따로 움직인다)
  let TW=[];
  const fit=()=>{W=w.clientWidth;H=w.clientHeight;sc=Math.max(.75,Math.min(1.35,Math.min(W,H)/720));cv.width=Math.round(W*D);cv.height=Math.round(H*D);cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(D,0,0,D,0,0);
    BG=mkBG();TW=Array.from({length:Math.round(36+W*H/14000)},()=>({x:Math.random()*W,y:Math.random()*H*.8,p:Math.random()*6.28,s:.6+Math.random()*1.3}));
    if(P){P.x=Math.max(16,Math.min(W-16,P.x));P.y=Math.max(H*.2,Math.min(H-20,P.y));}};
  // ----- 상태 -----
  let st='brief',P=null,M=[],K=[],FX=[],POP=[],t=0,score=0,hp=SSX.HP,shield=0,inv=0,combo=0,comboT=0,shards=0,grazes=0,level=1,shake=0,flash=0,dawnGot=false,
    nextM=1.2,nextK=1.8,nextShield=28,nextHeart=50,nextShower=34,lastAim=-9,live=true,T=0,prev=0,raf=0,banT=0,drag=null,keys={},startT=0;
  const R0=()=>9*sc;   // 별의 반지름
  const reset=()=>{P={x:W/2,y:H*.78,tx:W/2,ty:H*.78,rot:0,vx:0,vy:0};M=[];K=[];FX=[];POP=[];t=0;score=0;hp=SSX.HP;shield=0;inv=0;combo=0;comboT=0;shards=0;grazes=0;level=1;shake=0;flash=0;dawnGot=false;
    nextM=1.2;nextK=1.8;nextShield=28;nextHeart=50;nextShower=34;lastAim=-9;hud();};
  const M0=()=>{let m=MEM.star;if(!m||m.v!==1)m=MEM.star={v:1,best:0,bestSec:0,runs:0,dawn:0};return m;};
  const hud=()=>{$('ssS').textContent=Math.floor(score).toLocaleString('ko-KR');$('ssT').textContent=ssTime(t)+(t>=SSX.DAWN?' · 새벽':'');
    $('ssHp').innerHTML=Array.from({length:SSX.HP},(_,i)=>'<i'+(i<hp?' class="on"':'')+'></i>').join('')+(shield?'<em>방패</em>':'');};
  const ov=h=>{$('ssOv').innerHTML=h;$('ssOv').style.display=h?'flex':'none';};
  const ban=(s,sub)=>{const b=$('ssBan');b.innerHTML='<b>'+s+'</b>'+(sub?'<span>'+sub+'</span>':'');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');banT=2.2;};
  const pop=(s,x,y,c,big)=>{if(POP.length<24)POP.push({s:s,x:x,y:y,c:c||'#fff',l:big?1.3:.9,big:!!big});};
  const burst=(x,y,n,c,sp)=>{for(let i=0;i<n&&FX.length<240;i++){const a=Math.random()*6.283,v=(sp||160)*(.3+Math.random());FX.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.5+Math.random()*.5,c:c});}};
  const snd=(f)=>{try{f();}catch(e){}};
  const brief=()=>{st='brief';const m=M0();ov('<div class="ss-card"><span class="ss-k">미니게임</span><h2>별똥별을 피해라</h2><p class="ss-s">나침반의 금빛 별이 밤하늘로 날아올랐다. 쏟아지는 별똥별을 피하며 새벽까지 버텨라.</p>'+
    '<ul><li>화면 어디든 <b>손가락(마우스)을 대고 끌면</b> 별이 끈 만큼 따라온다. 키보드는 <b>방향키 · WASD</b>.</li><li>별똥별은 들어오기 전에 <b>희미한 빛줄기</b>로 지나갈 길을 먼저 보여 준다.</li>'+
    '<li>아슬아슬하게 <b>스치면 +'+SSX.GRAZE+'점</b>. 하늘색 <b>소원 조각</b>은 이어 모을수록 배수가 붙는다.</li><li>부딪히면 별빛이 하나 꺼진다(셋). 파란 <b>방패별</b>은 한 번 막아 준다.</li>'+
    '<li>유성우에도 늘 <b>빛줄기 없는 빈 길</b>이 하나 남는다. <b>'+SSX.DAWN+'초</b>를 버티면 새벽이 온다.</li></ul>'+
    '<div class="ss-b"><span>최고 <b>'+(m.best?Math.floor(m.best).toLocaleString('ko-KR')+'점':'—')+'</b></span>'+(m.bestSec?'<span>최장 <b>'+ssTime(m.bestSec)+'</b></span>':'')+(m.dawn?'<span>새벽 맞이 <b>'+m.dawn+'번</b></span>':'')+'</div>'+
    '<button type="button" class="pri" id="ssGo">날아오르기</button><button type="button" id="ssBack">미니게임으로</button></div>');
    $('ssGo').onclick=()=>{try{aInit();SFX.click();}catch(e){}ov('');reset();st='ready';startT=.9;ban('준비','끌어서 움직이기');};
    $('ssBack').onclick=close;setTimeout(()=>{const b=$('ssGo');if(b)try{b.focus({preventScroll:true});}catch(e){}},60);};
  const pause=on=>{if(on&&st==='run'){st='pause';ov('<div class="ss-card sm"><span class="ss-k">잠깐</span><h2>쉬는 중</h2><p class="ss-s">'+ssTime(t)+' 버텼다 · '+Math.floor(score).toLocaleString('ko-KR')+'점</p>'+
      '<button type="button" class="pri" id="ssRe">계속하기</button><button type="button" id="ssQ">그만두기</button></div>');$('ssRe').onclick=()=>pause(false);$('ssQ').onclick=()=>end(true);}
    else if(!on&&st==='pause'){ov('');st='run';prev=performance.now();}};
  const end=quit=>{if(st==='end')return;const was=st;st='end';live=live&&true;const m=M0();m.runs++;const fin=Math.floor(score),nb=!quit&&fin>m.best;
    if(!quit||was==='run'||was==='pause'){if(fin>m.best)m.best=fin;if(t>m.bestSec)m.bestSec=Math.round(t*10)/10;if(t>=SSX.DAWN)m.dawn=(m.dawn||0)+1;}
    msave();
    // 시험(window.__ssDbg)으로 돈 판과 10초도 안 된 판은 명예의 전당에 보내지 않는다
    if(!window.__ssDbg&&t>=10)sendArcade('star',{score:fin,sec:Math.round(t*10)/10,win:t>=SSX.DAWN,detail:'생존 '+ssTime(t)+' · 소원 '+shards+' · 스침 '+grazes});
    snd(()=>{if(nb){[784,988,1175,1568].forEach((f,i)=>tone(f,'triangle',.4,.1,i*.1));}else{[523,440,349,262].forEach((f,i)=>tone(f,'triangle',.5,.08,i*.16));}});
    setTimeout(()=>{if(!live)return;ov('<div class="ss-card"><span class="ss-k">'+(nb?'최고 기록!':t>=SSX.DAWN?'새벽 맞이':'밤이 끝났다')+'</span><h2>'+(t>=SSX.DAWN?'새벽을 맞았다':'별빛이 모두 꺼졌다')+'</h2>'+
      '<div class="ss-big">'+fin.toLocaleString('ko-KR')+'<small>점</small></div>'+
      '<div class="ss-b"><span>버틴 시간 <b>'+ssTime(t)+'</b></span><span>소원 조각 <b>'+shards+'</b></span><span>스침 <b>'+grazes+'</b></span><span>최고 <b>'+m.best.toLocaleString('ko-KR')+'</b></span></div>'+
      '<button type="button" class="pri" id="ssAg">다시 날기</button><button type="button" id="ssOut">미니게임으로</button></div>');
      $('ssAg').onclick=()=>{try{SFX.click();}catch(e){}brief();};$('ssOut').onclick=close;},quit?100:900);};
  const close=()=>{try{SFX.back();}catch(e){}live=false;cancelAnimationFrame(raf);w.remove();document.body.style.overflow='';document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
    removeEventListener('resize',onR);document.removeEventListener('visibilitychange',vis);back();};
  $('ssX').onclick=()=>{if(st==='run'){pause(true);return;}close();};
  $('ssP').onclick=()=>{try{SFX.click();}catch(e){}if(st==='run')pause(true);else if(st==='pause')pause(false);};
  // ----- 입력: 끌면 끈 만큼(상대 이동). 손가락이 별을 가리지 않는다 -----
  cv.addEventListener('pointerdown',e=>{if(st!=='run'&&st!=='ready')return;e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}drag={id:e.pointerId,x:e.clientX,y:e.clientY,px:P.tx,py:P.ty};});
  cv.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const k=e.pointerType==='mouse'?1:1.15;P.tx=drag.px+(e.clientX-drag.x)*k;P.ty=drag.py+(e.clientY-drag.y)*k;clampT();});
  const up=e=>{if(drag&&e.pointerId===drag.id)drag=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
  const KM={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowUp:'u',w:'u',W:'u',ArrowDown:'dn',s:'dn',S:'dn'};
  const kd=e=>{if(e.key==='Escape'){e.preventDefault();if(st==='run')pause(true);else if(st==='pause')pause(false);else close();return;}
      if((e.key==='Enter'||e.key===' ')&&st==='brief'&&$('ssGo')){e.preventDefault();$('ssGo').click();return;}
      if(e.key==='p'||e.key==='P'){if(st==='run')pause(true);else if(st==='pause')pause(false);return;}
      const a=KM[e.key];if(!a)return;e.preventDefault();keys[a]=1;},
    ku=e=>{const a=KM[e.key];if(a)keys[a]=0;};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  const vis=()=>{if(document.hidden)pause(true);};document.addEventListener('visibilitychange',vis);
  let rt=0;const onR=()=>{clearTimeout(rt);rt=setTimeout(fit,120);};addEventListener('resize',onR);
  const clampT=()=>{const r=R0();P.tx=Math.max(r+4,Math.min(W-r-4,P.tx));P.ty=Math.max(H*.2,Math.min(H-r-8,P.ty));};
  // ----- 별똥별 만들기 -----
  // 들어오는 자리(위 가장자리 또는 높은 옆 가장자리)와 겨누는 곳(아래쪽 넓은 띠, 가끔은 별 근처)을 정하고, 들어오기 전에 빛줄기로 예고한다
  const spd=()=>SSX.V0*sc*(1+Math.min(1.25,t/120));
  const addM=(o)=>{M.push(Object.assign({tw:.7,kind:'m',r:(5+Math.random()*3.5)*sc,gz:false,md:1e9},o));};
  const spawn=()=>{const side=level>=2&&Math.random()<.22,v=spd()*(.85+Math.random()*.35);let ex,ey;
    if(side){const L=Math.random()<.5;ex=L?-30:W+30;ey=H*(.05+Math.random()*.35);}else{ex=-W*.1+Math.random()*W*1.2;ey=-30;}
    // 별을 겨누는 것은 0.45초에 하나까지(양쪽에서 동시에 겨눠 피할 길이 없어지지 않게)
    let aim=Math.random()<.34&&t-lastAim>.45;if(aim)lastAim=t;
    const tx=aim?P.x+(Math.random()-.5)*70*sc:W*(.05+Math.random()*.9),ty=aim?P.y+(Math.random()-.5)*50*sc:H*(.55+Math.random()*.5);
    let dx=tx-ex,dy=ty-ey;const n=Math.hypot(dx,dy)||1;dx/=n;dy/=n;if(dy<.35){dy=.35;const k=Math.sqrt(1-dy*dy)*Math.sign(dx||1);dx=k;}
    const big=level>=2&&t>45&&Math.random()<.14;
    addM({x:ex,y:ey,vx:dx*v*(big?.72:1),vy:dy*v*(big?.72:1),kind:big?'big':'m',r:(big?14:5+Math.random()*3.5)*sc,tw:big?.95:.62+Math.random()*.18});};
  // 유성우: 위에서 거의 곧장 내려오는 줄기를 화면 폭에 촘촘히 깔되, 별 가까이에 지나갈 빈 길 하나를 남긴다
  const shower=()=>{const n=Math.round(8+Math.min(8,level*1.5)),gapW=Math.max(R0()*7,64*sc),cx=Math.max(gapW,Math.min(W-gapW,P.x+(Math.random()-.5)*W*.5)),v=spd()*.82;
    ban('유성우가 온다','빛줄기 없는 길로');snd(()=>sweep(.9,.06,300,1800,0,.7));
    for(let i=0;i<n;i++){const x=(i+.5)/n*W;if(Math.abs(x-cx)<gapW/2+8*sc)continue;const a=(Math.random()-.5)*.06;
      addM({x:x,y:-30-Math.random()*40,vx:Math.sin(a)*v,vy:Math.cos(a)*v,tw:1.1+Math.random()*.15});}};
  const addK=(kind,x)=>{K.push({kind:kind,x:x!=null?x:W*(.08+Math.random()*.84),y:-20,vy:(55+Math.random()*35)*sc*(kind==='shard'?1:.8),p:Math.random()*6.28});};
  const hit=(m)=>{if(inv>0)return;if(shield){shield=0;inv=.6;burst(P.x,P.y,22,'#9cc4ff',220);pop('방패가 막았다!',P.x,P.y-24,'#bcd6ff',true);snd(()=>{tone(660,'square',.12,.05);tone(990,'sine',.2,.06,.05);});m.dead=1;hud();return;}
    hp--;inv=1.6;combo=0;comboT=0;shake=.42;flash=.3;burst(P.x,P.y,28,'#ffd28a',260);m.dead=1;snd(()=>{noise(.35,.2,0,900);thud(90,.35,0,.3);});vib([60,30,60]);
    pop(hp>0?'별빛 하나가 꺼졌다':'',P.x,P.y-26,'#ffb4a8',true);hud();if(hp<=0)end(false);};
  const step=dt=>{T+=dt;
    TW.forEach(s=>{s.p+=dt*s.s*2;});
    FX.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2;p.vy*=1-dt*2;p.l-=dt;});FX=FX.filter(p=>p.l>0);
    POP.forEach(p=>{p.y-=28*dt;p.l-=dt;});POP=POP.filter(p=>p.l>0);
    shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt*1.6);if(banT>0&&(banT-=dt)<=0)$('ssBan').classList.remove('on');
    if(st==='ready'){startT-=dt;movePlayer(dt);if(startT<=0){st='run';snd(()=>sweep(.5,.06,600,2400,0,.7));}return;}
    if(st!=='run')return;
    t+=dt;score+=dt*10;if(inv>0)inv-=dt;if(comboT>0&&(comboT-=dt)<=0)combo=0;
    const lv=1+Math.floor(t/25);if(lv>level){level=lv;const NM=['초저녁','별이 내리는 밤','화구가 지나는 밤','유성우의 밤','대유성우','끝없는 별비'];ban(NM[Math.min(NM.length-1,level-1)],level+'단계');snd(()=>[659,880,1175].forEach((f,i)=>tone(f,'triangle',.3,.07,i*.08)));}
    if(!dawnGot&&t>=SSX.DAWN){dawnGot=true;score+=2000;ban('새벽이 온다','+2000 · 계속 버틸 수 있다');snd(()=>[523,659,784,1047,1319].forEach((f,i)=>tone(f,'triangle',.5,.09,i*.1)));}
    // 별똥별 · 조각 · 방패 · 하트가 나오는 때
    const cap=6+Math.min(18,level*3);
    if((nextM-=dt)<=0){nextM=Math.max(SSX.GAP_MIN,SSX.GAP0*Math.pow(.985,t))*(.7+Math.random()*.6);if(M.length<cap)spawn();}
    if((nextShower-=dt)<=0){nextShower=26+Math.random()*10;shower();}
    if((nextK-=dt)<=0){nextK=1.5+Math.random()*1.1;addK('shard');}
    if((nextShield-=dt)<=0){nextShield=34+Math.random()*14;if(!shield)addK('shield');}
    if((nextHeart-=dt)<=0){nextHeart=48+Math.random()*16;if(hp<SSX.HP)addK('heart');}
    movePlayer(dt);
    const pr=R0();
    for(const m of M){if(m.dead)continue;
      if(m.tw>0){m.tw-=dt;continue;}
      m.x+=m.vx*dt;m.y+=m.vy*dt;
      // 화구는 한가운데쯤에서 셋으로 갈라진다
      if(m.kind==='big'&&m.y>H*.44&&!m.split){m.split=1;m.dead=1;burst(m.x,m.y,16,'#ff9a7a',200);snd(()=>{noise(.25,.12,0,1400);});
        const a0=Math.atan2(m.vy,m.vx),v=Math.hypot(m.vx,m.vy)*1.18;[-.5,0,.5].forEach(da=>addM({x:m.x,y:m.y,vx:Math.cos(a0+da)*v,vy:Math.sin(a0+da)*v,tw:0,r:6*sc,kind:'frag'}));continue;}
      const d=Math.hypot(m.x-P.x,m.y-P.y);
      if(d<pr*.7+m.r*.8){hit(m);continue;}
      // 스침: 가장 가까이 왔다가 멀어질 때, 맞지 않았고 가까이(별 둘레 22px 안) 지나갔으면
      if(d<m.md)m.md=d;else if(!m.gz&&m.md<pr+m.r+22*sc&&inv<=0){m.gz=true;grazes++;score+=SSX.GRAZE;pop('스침 +'+SSX.GRAZE,P.x+(m.x>P.x?-26:26),P.y-14,'#ffe9a8');burst(P.x,P.y,6,'#fff1c4',90);snd(()=>{tone(1760,'sine',.06,.05);tone(2349,'sine',.08,.035,.03);});}
      if(m.y>H+60||m.x<-80||m.x>W+80)m.dead=1;}
    M=M.filter(m=>!m.dead);
    for(const k of K){if(k.dead)continue;k.p+=dt*3;k.y+=k.vy*dt;k.x+=Math.sin(k.p)*12*dt*sc;
      if(Math.hypot(k.x-P.x,k.y-P.y)<pr+12*sc){k.dead=1;
        if(k.kind==='shard'){combo=Math.min(5,combo+1);comboT=3.5;shards++;const v=SSX.SHARD*combo;score+=v;pop('소원 +'+v+(combo>1?' ×'+combo:''),k.x,k.y-10,'#bfeaff');burst(k.x,k.y,10,'#bfeaff',120);snd(()=>{tone(1318+combo*90,'triangle',.1,.06);tone(1975+combo*90,'sine',.12,.04,.04);});}
        else if(k.kind==='shield'){shield=1;pop('방패별',k.x,k.y-10,'#bcd6ff',true);burst(k.x,k.y,14,'#9cc4ff',140);snd(()=>{tone(880,'sine',.25,.07);tone(1320,'sine',.3,.05,.06);});hud();}
        else{hp=Math.min(SSX.HP,hp+1);pop('별빛 +1',k.x,k.y-10,'#ffd6e0',true);burst(k.x,k.y,14,'#ffc2d1',140);snd(()=>[784,1047].forEach((f,i)=>tone(f,'triangle',.3,.08,i*.08)));hud();}}
      if(k.y>H+30)k.dead=1;}
    K=K.filter(k=>!k.dead);
    if(Math.floor(t*4)!==Math.floor((t-dt)*4))hud();};
  const movePlayer=dt=>{const r=R0(),ks=520*sc;
    if(keys.l||keys.r||keys.u||keys.dn){P.tx+=((keys.r?1:0)-(keys.l?1:0))*ks*dt;P.ty+=((keys.dn?1:0)-(keys.u?1:0))*ks*dt;clampT();}
    // 따라가되 너무 빨리 순간이동하지 않게(초당 1300px까지)
    const ax=P.tx-P.x,ay=P.ty-P.y,k=Math.min(1,dt*18);let mx=ax*k,my=ay*k;const mv=Math.hypot(mx,my),lim=1300*sc*dt;if(mv>lim){mx*=lim/mv;my*=lim/mv;}
    P.x+=mx;P.y+=my;P.rot+=dt*1.6;if(Math.random()<dt*40&&FX.length<240)FX.push({x:P.x+(Math.random()-.5)*4,y:P.y+r*.6,vx:(Math.random()-.5)*20,vy:40+Math.random()*30,l:.45,c:'#ffe3a0'});
    P.x=Math.max(r,Math.min(W-r,P.x));P.y=Math.max(r,Math.min(H-r,P.y));};
  // ----- 그리기 -----
  const draw=()=>{g.setTransform(D,0,0,D,0,0);const sx=shake>0?(Math.random()-.5)*14*shake:0,sy=shake>0?(Math.random()-.5)*14*shake:0;
    if(BG)g.drawImage(BG,0,0,W,H);
    // 새벽: 150초가 다가오면 지평선이 조금씩 밝아진다
    const dawn=Math.max(0,Math.min(1,(t-(SSX.DAWN-30))/40));if(dawn>0){const dg=g.createLinearGradient(0,H*.45,0,H);dg.addColorStop(0,'rgba(255,170,120,0)');dg.addColorStop(1,'rgba(255,170,120,'+(.28*dawn).toFixed(3)+')');g.fillStyle=dg;g.fillRect(0,0,W,H);}
    for(const s of TW){const a=.35+.45*Math.sin(s.p);if(a<=0)continue;g.fillStyle='rgba(235,242,255,'+a.toFixed(2)+')';g.fillRect(s.x,s.y,1.6,1.6);}
    g.save();g.translate(sx,sy);
    // 예고 빛줄기: 들어올 자리에서 지나갈 방향으로 희미한 점선, 들어오기 직전일수록 진해진다
    g.lineWidth=1.5;for(const m of M){if(m.tw<=0)continue;const v=Math.hypot(m.vx,m.vy)||1,ux=m.vx/v,uy=m.vy/v,len=Math.min(H*.55,260*sc),a=Math.max(.08,.5-m.tw*.35);
      g.strokeStyle=m.kind==='big'?'rgba(255,140,110,'+a.toFixed(2)+')':'rgba(220,232,255,'+a.toFixed(2)+')';g.setLineDash([5,7]);g.beginPath();
      const x0=Math.max(-10,Math.min(W+10,m.x)),y0=Math.max(-10,m.y);g.moveTo(x0,y0);g.lineTo(x0+ux*len,y0+uy*len);g.stroke();
      const gs=(m.kind==='big'?30:20)*sc*(1+.25*Math.sin(T*18));g.globalAlpha=Math.min(1,a*1.6);g.drawImage(m.kind==='big'?SPR.red:SPR.head,x0-gs/2,Math.max(0,y0)-gs/2,gs,gs);g.globalAlpha=1;}
    g.setLineDash([]);
    // 별똥별: 꼬리(속도만큼 길게)와 빛나는 머리
    for(const m of M){if(m.tw>0)continue;const v=Math.hypot(m.vx,m.vy)||1,L=Math.min(220*sc,v*.32)*(m.kind==='big'?1.3:1),tx=m.x-m.vx/v*L,ty=m.y-m.vy/v*L;
      const tg=g.createLinearGradient(m.x,m.y,tx,ty),red=m.kind==='big'||m.kind==='frag';tg.addColorStop(0,red?'rgba(255,190,150,.95)':'rgba(255,248,225,.95)');tg.addColorStop(.35,red?'rgba(255,110,80,.5)':'rgba(255,200,120,.45)');tg.addColorStop(1,'rgba(120,160,255,0)');
      g.strokeStyle=tg;g.lineCap='round';g.lineWidth=m.r*1.25;g.beginPath();g.moveTo(m.x,m.y);g.lineTo(tx,ty);g.stroke();
      const hs=m.r*5.2;g.drawImage(red?SPR.red:SPR.head,m.x-hs/2,m.y-hs/2,hs,hs);g.fillStyle='#fffdf4';g.beginPath();g.arc(m.x,m.y,m.r*.62,0,6.283);g.fill();}
    // 줍는 것
    for(const k of K){const tw=.75+.25*Math.sin(k.p*2);
      if(k.kind==='shard'){const s=22*sc;g.globalAlpha=tw;g.drawImage(SPR.cyan,k.x-s,k.y-s,s*2,s*2);g.globalAlpha=1;g.save();g.translate(k.x,k.y);g.rotate(Math.sin(k.p)*.3);g.drawImage(SPR.shard,-9*sc,-9*sc,18*sc,18*sc);g.restore();}
      else if(k.kind==='shield'){const s=34*sc;g.drawImage(SPR.blue,k.x-s/2,k.y-s/2,s,s);g.strokeStyle='rgba(190,215,255,.95)';g.lineWidth=2;g.beginPath();g.arc(k.x,k.y,9*sc,0,6.283);g.stroke();}
      else{g.fillStyle='#ffb3c6';g.save();g.translate(k.x,k.y);g.scale(sc,sc);g.beginPath();g.moveTo(0,4);g.bezierCurveTo(-9,-4,-5,-11,0,-6);g.bezierCurveTo(5,-11,9,-4,0,4);g.fill();g.restore();}}
    // 불티
    for(const p of FX){g.globalAlpha=Math.max(0,Math.min(1,p.l*1.6));g.fillStyle=p.c;g.fillRect(p.x-1.2,p.y-1.2,2.4,2.4);}g.globalAlpha=1;
    // 나(금빛 별): 맞은 뒤 무적 동안은 깜빡인다
    if(P&&(inv<=0||Math.floor(inv*12)%2===0)){const r=R0(),gs=r*7;g.globalAlpha=.85;g.drawImage(SPR.gold,P.x-gs/2,P.y-gs/2,gs,gs);g.globalAlpha=1;
      g.save();g.translate(P.x,P.y);g.rotate(Math.sin(P.rot)*.25);g.drawImage(SPR.me,-r*1.6,-r*1.6,r*3.2,r*3.2);g.restore();
      if(shield){g.strokeStyle='rgba(170,200,255,'+(.6+.3*Math.sin(T*6)).toFixed(2)+')';g.lineWidth=2;g.beginPath();g.arc(P.x,P.y,r*2.1,0,6.283);g.stroke();}}
    // 떠오르는 글씨
    g.textAlign='center';g.textBaseline='middle';for(const p of POP){if(!p.s)continue;g.globalAlpha=Math.min(1,p.l*1.4);g.font=(p.big?'800 16px ':'700 13px ')+FF;g.lineWidth=3;g.strokeStyle='rgba(5,8,20,.8)';g.strokeText(p.s,p.x,p.y);g.fillStyle=p.c;g.fillText(p.s,p.x,p.y);}
    g.globalAlpha=1;g.restore();
    if(flash>0){g.fillStyle='rgba(255,110,90,'+(flash*.5).toFixed(3)+')';g.fillRect(0,0,W,H);}};
  const loop=now=>{if(!live||!w.isConnected){live=false;return;}const dt=Math.min(.05,(now-prev)/1000||0);prev=now;
    if(st!=='pause')step(dt);draw();raf=requestAnimationFrame(loop);};
  fit();reset();brief();prev=performance.now();raf=requestAnimationFrame(loop);
  // 시험용: window.__ssDbg를 미리 켜 두면 상태를 밖에서 본다(이 판은 명예의 전당에 보내지 않는다)
  if(window.__ssDbg)window.__ssDbg={st:()=>st,P:()=>P,M:()=>M,K:()=>K,t:()=>t,score:()=>score,hp:()=>hp,set:o=>{if(o.t!=null)t=o.t;if(o.hp!=null)hp=o.hp;},end:q=>end(q)};}
