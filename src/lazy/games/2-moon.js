/* ---------- 달 착륙: 유인 달 탐사 과제의 착륙 단계 ----------
   착륙선이 고도 600m에서 떨어지기 시작한다. 주 엔진(누르고 있기)으로 하강을 늦추고, 좌우 분사로 착륙 표지 위에 맞춘다.
   땅에 닿을 때 하강 속도 2.2m/s · 수평 속도 1.3m/s 이하면 착륙. 표지 위 · 아주 부드럽게 · 연료 20 이상이면 정밀 착륙.
   너무 세게 닿으면 착륙선이 상해 상승단만 떼어 궤도로 돌아간다(우주인은 무사하다). 물리는 m·초 단위, 화면은 그걸 늘려 그린다. */
// 주 엔진 5.0m/s²(달 중력을 빼면 3.4)로, 가장 잘 내리면 연료를 절반쯤 쓴다
const MN={W:400,H:600,G:1.62,TH:5.0,SD:1.1,F:100,BM:4.6,BS:1.6,VY:2.2,VX:1.3};
const mnTier=(ok,pad,vy,fuel)=>!ok?3:pad&&vy<=1.2&&fuel>=20?0:pad?1:2;
const MN_RES=['정밀 착륙','착륙 성공','표지 밖 착륙','착륙 중단 · 궤도로 귀환'];
function mgMoon(box,done){const $=id=>document.getElementById(id);
  box.innerHTML='<div class="mgx mn"><div class="mn-sc" id="mnSc"><canvas id="mnC"></canvas>'+
    '<div class="mn-hud"><div><span>고도</span><b id="mnH">600</b><small>m</small></div><div><span>하강</span><b id="mnVy">0</b><small>m/s</small></div><div><span>수평</span><b id="mnVx">0</b><small>m/s</small></div>'+
    '<div class="mn-fu"><span>연료</span><i><em id="mnF"></em></i></div></div><div class="mn-call" id="mnCall"></div><div class="mn-ov" id="mnOv"></div></div>'+
    '<div class="mn-ctl"><button type="button" data-a="l" aria-label="왼쪽 분사">◀</button><button type="button" data-a="m" class="mn-main">주 엔진<small>누르고 있기 · 스페이스</small></button><button type="button" data-a="r" aria-label="오른쪽 분사">▶</button></div>'+
    '<div class="pk-msg" id="mnMsg"></div><button id="mnGo" class="pri" style="width:100%;padding:15px;font-size:16px;display:none">결과 보고</button></div>';
  const cv=$('mnC'),sc=$('mnSc'),W=sc.clientWidth||360,H=Math.round(Math.min(360,Math.max(280,W*.7))),D=Math.min(2,window.devicePixelRatio||1),g=cv.getContext('2d');
  cv.width=W*D;cv.height=H*D;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(D,0,0,D,0,0);
  // 지형: 울퉁불퉁한 바닥(m)과 평평한 착륙 표지
  const pad=80+Math.random()*240,pw=26,T=[];for(let i=0;i<=80;i++){const x=i*MN.W/80;T.push(Math.abs(x-pad)<pw+6?6:6+24*Math.abs(Math.sin(i*.45+pad))+12*Math.random());}
  const th=x=>{const f=Math.max(0,Math.min(79.999,x/MN.W*80)),i=Math.floor(f);return T[i]+(T[i+1]-T[i])*(f-i);};
  const k=(H-84)/MN.H,base=H-22,sx=x=>x/MN.W*W,sy=y=>base-y*k;
  const stars=Array.from({length:70},()=>[Math.random()*W,Math.random()*(H*.75),Math.random()*1.3+.3]),cr=Array.from({length:7},()=>[Math.random()*MN.W,4+Math.random()*10]);
  let x=pad+(Math.random()<.5?-1:1)*(90+Math.random()*60),y=MN.H,vx=(pad>x?1:-1)*(2.5+Math.random()*2.5),vy=-14,fuel=MN.F,st='brief',t=0,res=null,parts=[],call='',callT=0,said={},asc=0;
  x=Math.max(20,Math.min(MN.W-20,x));
  const inp={m:0,l:0,r:0};
  const say=s=>{call=s;callT=2.6;$('mnCall').textContent=s;$('mnCall').classList.add('on');};
  // mode: 0 전체 · 1 하강단만(중단 뒤 남은 것) · 2 상승단만(궤도로 돌아가는 것)
  const lander=(px,py,ang,flame,sideL,sideR,mode)=>{g.save();g.translate(px,py);g.rotate(ang);
    if(mode!==2){// 하강단: 금박 몸통 + 다리
      g.strokeStyle='#b9b2a3';g.lineWidth=1.6;g.beginPath();g.moveTo(-8,-9);g.lineTo(-14,0);g.moveTo(8,-9);g.lineTo(14,0);g.moveTo(-17,0);g.lineTo(-11,0);g.moveTo(11,0);g.lineTo(17,0);g.stroke();
      const gr=g.createLinearGradient(-10,0,10,0);gr.addColorStop(0,'#8a6420');gr.addColorStop(.45,'#f2cf6b');gr.addColorStop(1,'#a77a24');g.fillStyle=gr;g.fillRect(-10,-14,20,8);
      g.fillStyle='#5b5650';g.beginPath();g.moveTo(-4,-6);g.lineTo(4,-6);g.lineTo(5,-2);g.lineTo(-5,-2);g.fill();
      if(flame){const L=10+Math.random()*9,fg=g.createLinearGradient(0,-2,0,L);fg.addColorStop(0,'rgba(255,240,200,.95)');fg.addColorStop(.4,'rgba(255,170,60,.8)');fg.addColorStop(1,'rgba(255,90,20,0)');
        g.fillStyle=fg;g.beginPath();g.moveTo(-4,-2);g.lineTo(4,-2);g.lineTo(0,L);g.fill();}}
    if(mode===1){g.restore();return;}
    // 상승단: 은빛 선실 + 창
    g.fillStyle='#d7dbe0';g.beginPath();g.moveTo(-8,-14);g.lineTo(-9,-21);g.lineTo(-4,-26);g.lineTo(5,-26);g.lineTo(9,-20);g.lineTo(8,-14);g.closePath();g.fill();
    g.fillStyle='#2a3242';g.beginPath();g.moveTo(-5,-22);g.lineTo(-2,-24);g.lineTo(-1,-20);g.closePath();g.fill();g.fillStyle='#9aa3ad';g.fillRect(-1,-29,2,3);
    if(mode===2&&flame){g.fillStyle='rgba(255,200,120,.85)';g.beginPath();g.moveTo(-3,-14);g.lineTo(3,-14);g.lineTo(0,-4-Math.random()*5);g.fill();}
    g.fillStyle='rgba(255,255,255,.85)';if(sideL){g.beginPath();g.arc(11,-19,2.6,0,6.3);g.fill();}if(sideR){g.beginPath();g.arc(-11,-19,2.6,0,6.3);g.fill();}
    g.restore();};
  const draw=()=>{g.fillStyle='#05070d';g.fillRect(0,0,W,H);
    stars.forEach(s=>{g.fillStyle='rgba(255,255,255,'+(.35+.4*Math.abs(Math.sin(t*.7+s[0])))+')';g.fillRect(s[0],s[1],s[2],s[2]);});
    // 지구
    const ex=W-40,ey=64,eg=g.createRadialGradient(ex-5,ey-6,2,ex,ey,18);eg.addColorStop(0,'#8fc7ff');eg.addColorStop(.7,'#2f6fb8');eg.addColorStop(1,'#123a6b');
    g.fillStyle=eg;g.beginPath();g.arc(ex,ey,17,0,6.3);g.fill();g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2;g.beginPath();g.arc(ex+3,ey+2,9,3.6,5.2);g.stroke();
    g.fillStyle='rgba(5,7,13,.55)';g.beginPath();g.arc(ex+7,ey,17,-1.2,1.2);g.fill();
    // 땅
    const lg=g.createLinearGradient(0,sy(30),0,H);lg.addColorStop(0,'#8c8a86');lg.addColorStop(1,'#3e3d3b');g.fillStyle=lg;g.beginPath();g.moveTo(0,H);
    for(let i=0;i<=80;i++)g.lineTo(sx(i*MN.W/80),sy(T[i]));g.lineTo(W,H);g.fill();
    g.fillStyle='rgba(0,0,0,.18)';cr.forEach(c=>{g.beginPath();g.ellipse(sx(c[0]),sy(th(c[0]))+5,c[1]*1.6,c[1]*.45,0,0,6.3);g.fill();});
    // 착륙 표지
    const blink=Math.sin(t*6)>0;g.strokeStyle='rgba(255,224,138,.9)';g.setLineDash([5,4]);g.lineWidth=2;g.beginPath();g.moveTo(sx(pad-pw),sy(6)+1);g.lineTo(sx(pad+pw),sy(6)+1);g.stroke();g.setLineDash([]);
    g.fillStyle=blink?'#ffe08a':'rgba(255,224,138,.35)';[pad-pw,pad+pw].forEach(p=>{g.beginPath();g.arc(sx(p),sy(6)-2,2.6,0,6.3);g.fill();});
    // 그림자
    const gh=th(x),al=y-gh;if(st!=='brief'&&al<260&&!asc){g.fillStyle='rgba(0,0,0,'+(.45*(1-al/260))+')';g.beginPath();g.ellipse(sx(x),sy(gh)+1,14*(1-al/400),3,0,0,6.3);g.fill();}
    parts.forEach(p=>{g.fillStyle='rgba(200,196,188,'+Math.max(0,p.l)+')';g.fillRect(p.x,p.y,2,2);});
    const ang=st==='end'&&res&&res.t===3?.5:Math.max(-.25,Math.min(.25,vx*.04));
    if(asc){lander(sx(x),sy(gh),.5,0,0,0,1);lander(sx(x),sy(gh)-asc,0,1,0,0,2);}
    else lander(sx(x),sy(y),ang,inp.m&&fuel>0&&st==='fly',inp.l&&fuel>0&&st==='fly',inp.r&&fuel>0&&st==='fly');
    if(st==='end'&&res&&res.t<3&&t-res.at>.8){const fx=sx(x)+22,fy=sy(th(x+5));g.strokeStyle='#ddd';g.lineWidth=1.4;g.beginPath();g.moveTo(fx,fy);g.lineTo(fx,fy-22);g.stroke();
      for(let i=0;i<5;i++){g.fillStyle=i%2?'#f7f3ea':'#b3261e';g.fillRect(fx,fy-22+i*2,13,2);}g.fillStyle='#2f4a8b';g.fillRect(fx,fy-22,6,6);}};
  const hud=()=>{const al=Math.max(0,y-th(x));$('mnH').textContent=Math.round(al);$('mnVy').textContent=(-vy).toFixed(1);$('mnVx').textContent=Math.abs(vx).toFixed(1);
    $('mnVy').className=-vy>MN.VY&&al<80?'x':'';$('mnVx').className=Math.abs(vx)>MN.VX&&al<80?'x':'';$('mnF').style.width=Math.max(0,fuel)+'%';$('mnF').className=fuel<20?'x':'';};
  const land=()=>{const s=-vy,pd=Math.abs(x-pad)<=pw-4,ok=s<=MN.VY&&Math.abs(vx)<=MN.VX,tt=mnTier(ok,pd,s,fuel);res={t:tt,at:t};st='end';y=th(x);
    for(let i=0;i<(ok?18:46);i++)parts.push({x:sx(x)+(Math.random()-.5)*20,y:sy(y)-2,vx:(Math.random()-.5)*(ok?60:160),vy:-Math.random()*(ok?20:90),l:1});
    try{thud(ok?150:70,ok?.18:.32,0,ok?.2:.45);if(!ok)noise(.5,.2,0,600);setTimeout(()=>SFX.medal(tt),500);}catch(e){}
    const spd='하강 '+s.toFixed(1)+' · 수평 '+Math.abs(vx).toFixed(1)+'m/s · 연료 '+Math.round(fuel);
    $('mnMsg').innerHTML='<b class="'+(tt<=1?'g':tt===3?'x':'')+'">'+MN_RES[tt]+'</b> · '+spd+(tt===3?'<br>착륙선 다리가 꺾였다. 상승단을 떼어 궤도로 돌아간다. 우주인은 무사하다.':tt===2?'<br>표지에서 벗어난 곳에 내렸다.':tt===1?'<br>"독수리는 내려앉았다."':'<br>표지 한가운데, 먼지 하나 크게 일지 않았다.');
    say(tt<3?'휴스턴: 착륙 확인. 잘했다.':'휴스턴: 착륙 중단. 상승단 분리.');if(tt===3)setTimeout(()=>{asc=1;},700);
    $('mnGo').style.display='';box.querySelector('.mn-ctl').classList.add('off');};
  const step=dt=>{t+=dt;if(callT>0&&(callT-=dt)<=0)$('mnCall').classList.remove('on');
    parts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;p.l-=dt*1.1;});parts=parts.filter(p=>p.l>0);
    if(asc)asc+=dt*40*(1+asc/60);
    if(st!=='fly')return;
    const on=fuel>0;let ax=0,ay=-MN.G;
    if(inp.m&&on){ay+=MN.TH;fuel-=MN.BM*dt;}if(inp.l&&on){ax-=MN.SD;fuel-=MN.BS*dt;}if(inp.r&&on){ax+=MN.SD;fuel-=MN.BS*dt;}
    vx+=ax*dt;vy+=ay*dt;x+=vx*dt;y+=vy*dt;if(x<12||x>MN.W-12){x=Math.max(12,Math.min(MN.W-12,x));vx*=-.3;}
    const al=y-th(x);
    if(inp.m&&on&&al<45)for(let i=0;i<2;i++)parts.push({x:sx(x)+(Math.random()-.5)*8,y:sy(th(x))-1,vx:(Math.random()<.5?-1:1)*(40+Math.random()*70),vy:-Math.random()*15,l:.7});
    if(inp.m&&on&&Math.random()<.25)try{noise(.07,.035,0,300);}catch(e){}
    [[400,'고도 400'],[200,'고도 200'],[100,'고도 100'],[40,'고도 40, 먼지가 인다']].forEach(([h,s])=>{if(al<h&&!said[h]){said[h]=1;say('휴스턴: '+s+' · 하강 '+(-vy).toFixed(1));}});
    if(fuel<30&&!said.f30){said.f30=1;say('휴스턴: 연료 30 남았다');}if(fuel<=0&&!said.f0){said.f0=1;fuel=0;say('휴스턴: 연료 바닥! 그대로 내려간다');}
    if(al<=0)land();};
  const ov=h=>{$('mnOv').innerHTML=h;$('mnOv').style.display=h?'flex':'none';};
  ov('<div class="mn-br"><b>착륙 표지(노란 점선) 위에 내려앉아라</b><span>하강 '+MN.VY+'m/s · 수평 '+MN.VX+'m/s보다 느리게 닿아야 한다. 주 엔진을 오래 쓰면 연료가 바닥난다.</span><button type="button" id="mnStart" class="pri">하강 시작</button></div>');
  $('mnStart').onclick=()=>{try{aInit();SFX.click();}catch(e){}ov('');st='fly';say('휴스턴: 하강 시작. 행운을 빈다.');};
  box.querySelectorAll('.mn-ctl button').forEach(b=>{const a=b.dataset.a,set=v=>e=>{e.preventDefault();inp[a]=v;b.classList.toggle('on',!!v);};
    b.addEventListener('pointerdown',set(1));['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,set(0)));b.addEventListener('contextmenu',e=>e.preventDefault());});
  const kmap={' ':'m',ArrowUp:'m',ArrowLeft:'l',ArrowRight:'r'};
  const kd=e=>{const a=kmap[e.key];if(!a||st==='end')return;e.preventDefault();if(st==='brief'&&a==='m'){$('mnStart').click();return;}inp[a]=1;},ku=e=>{const a=kmap[e.key];if(a)inp[a]=0;};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  $('mnGo').onclick=()=>{try{SFX.click();}catch(e){}done(res.t);};
  let last=performance.now();
  const iv=setInterval(()=>{if(!box.isConnected){clearInterval(iv);document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);return;}
    const now=performance.now(),dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;step(dt);draw();if(st==='fly')hud();},1000/60);
  hud();draw();}
// 시뮬레이션: 자동 착륙 장치. 대체로 내려앉지만 가끔 표지를 벗어나거나 중단한다
function simMoon(){const r=Math.random(),t=r<.22?0:r<.58?1:r<.85?2:3,L=['<span class="k">고도 600m</span>자동 하강 장치가 주 엔진을 켰다','<span class="k">고도 200m</span>하강 '+(4+Math.random()*3).toFixed(1)+'m/s · 연료 '+Math.round(55+Math.random()*15),
    '<span class="k">고도 40m</span>먼지가 일어 표지가 가려졌다',t===3?'<span class="k">접지</span>세게 닿았다. 상승단을 떼어 궤도로 돌아갔다':'<span class="k">접지</span>'+(t===2?'표지에서 벗어난 곳에 내렸다':'표지 위에 내려앉았다')];
  return {lines:L,head:MN_RES[t],t:t};}
