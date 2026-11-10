/* ---------- 미니게임 「지지율 고공행진」: 발판을 밟고 끝없이 위로 ----------
   메인 화면을 좌 · 우 · 좌 · 우로 번갈아 밀면(키보드는 ← → ← →) 열린다(게임 → 미니게임에서도 할 수 있다).
   대통령이 민심 발판을 밟고 저절로 통통 튀어 오른다. 할 일은 좌우 조종뿐: 휴대폰은 기울이기(자이로), 컴퓨터는 ← → (A · D).
   기울기 센서가 없거나 꺼 두었으면 화면 왼쪽 · 오른쪽을 누르고 있는다. 화면 옆으로 나가면 반대쪽에서 나온다.
   · 발판: 초록 = 굳은 지지층(그냥 발판), 파랑 = 흔들리는 부동층(좌우로 움직인다),
           노랑 = 한 번뿐인 공약(한 번 밟으면 사라진다), 금 간 회색 = 가짜 뉴스(밟으면 무너지고 튀어 오르지 못한다).
   · 백신 주사기(부스터 샷)가 놓인 발판을 밟으면 훨씬 높이 뛴다. 마스크를 주우면 보호막(하나만), 방역 헬기를 잡으면 잠깐 날아오른다.
   · 150m부터 바이러스가 떠다닌다. 옆 · 아래에서 닿으면 감염(끝), 위에서 밟으면 퇴치하고 튀어 오른다.
   · 화면 아래로 떨어지면 끝(지지율 추락). 100m마다 유행이 바뀐다(1차 유행 → 2차 유행 → 알파 → 델타 → 오미크론 …).
     올라갈수록 발판이 좁아지고 멀어지며 움직이는 발판 · 한 번뿐인 발판 · 가짜 뉴스가 늘어난다.
   · 밟고 올라갈 수 있는 발판(가짜 뉴스 말고)은 늘 한 번 뛰어 닿는 높이(2.7칸) 안에 이어진다. 한 번 뛰면 3.2칸 오른다.
   판은 가로 9칸. 좌표는 칸 단위(왼쪽 끝 0), 높이 y는 1칸 = 1m이고 위로 갈수록 커진다. P.y는 대통령의 발.
   기록: 가장 높이 오른 고도(m). 30m 이상 오른 판은 명예의 전당에 오른다. 이 기기의 기록은 MEM.ax(v2). */
const AX_W=9,AX_G=38,AX_J=15.5,AX_V=9.5,AX_PH=.34;
const AX_WV=['1차 유행','2차 유행','알파 변이','델타 변이','오미크론','스텔스 오미크론','켄타우로스','신종 변이 X'];
const AX_SK=[[39,64,107],[34,50,98],[40,38,92],[52,34,84],[30,30,70],[22,24,56],[14,16,40],[8,9,24]];
function axMem(){let m=MEM.ax;if(!m||m.v!==2)m=MEM.ax={v:2,best:0,runs:0,bestS:0,ctl:(m&&m.ctl)||''};return m;}
function axRng(s){return ()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
const axHs=(a,b)=>{let h=Math.imul(a*374761393+b*668265263|0,1274126177);h^=h>>>13;h=Math.imul(h,1103515245);return ((h^h>>>16)>>>0)/4294967296;};
function axOpen(back){if(document.getElementById('ax'))return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);back=back||home;
  try{bgmSet(BGM.trk,false);}catch(e){}
  const w=document.createElement('div');w.id='ax';w.className='ax';w.setAttribute('role','dialog');w.setAttribute('aria-label','지지율 고공행진');
  w.innerHTML='<canvas id="axC"></canvas><div class="ax-hud"><button type="button" class="ax-x" id="axX" aria-label="미니게임으로">✕</button>'+
    '<div class="ax-mid"><b id="axS">0</b><small><span id="axB"></span><span id="axK"></span></small></div>'+
    '<div class="ax-r"><button type="button" class="ax-p" id="axP" aria-label="일시정지"><i></i><i></i></button></div></div>'+
    '<div class="ax-ban" id="axBan" aria-live="polite"></div><div class="ax-ov" id="axOv"></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id),cv=$('axC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),FF=getComputedStyle(document.body).fontFamily;
  const RR=(a,b,c,d,r)=>{g.beginPath();if(g.roundRect)g.roundRect(a,b,c,d,Math.max(0,Math.min(r,c/2,d/2)));else g.rect(a,b,c,d);};
  const tm=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  const snd=f=>{try{f();}catch(e){}};
  const coarse=(()=>{try{return matchMedia('(pointer:coarse)').matches;}catch(e){return false;}})();
  // ----- 상태 -----
  let st='brief',rnd=Math.random,T=0,tt=0,P={x:AX_W/2,y:0,vx:0,vy:0},face=1,sq=0,camY=-2,maxY=0,PL=[],IT=[],VR=[],topY=0,lastOnce=false,
    shield=0,inv=0,fly=0,stage=0,cause='',deadT=0,quit=false,god=false,FX=[],POP=[],run=0,shake=0,live=true,prev=0,raf=0,banT=0,hudK='',pst='run',
    W=0,H=0,PW=0,cs=40,X0=0,VH=16,kL=0,kR=0,TP=[],tilt=0,tiltSeen=false,tiltOn=false,dbgA=null,inA=0,hintT=0,jumps=0,stomps=0;
  const dif=y=>Math.max(0,Math.min(1,y/600)),lerp=(a,b,k)=>a+(b-a)*k;
  const sx=x=>X0+x*cs,sy=y=>H-(y-camY)*cs;
  const wd=(a,b)=>((a-b+AX_W*1.5)%AX_W)-AX_W/2;   // 옆으로 이어진 판에서 a가 b보다 얼마나 오른쪽인가(−4.5~4.5)
  const fit=()=>{W=innerWidth;H=innerHeight;cv.width=Math.round(W*D);cv.height=Math.round(H*D);cv.style.width=W+'px';cv.style.height=H+'px';
    PW=Math.min(W,H*.62,620);cs=PW/AX_W;X0=(W-PW)/2;VH=H/cs;};
  /* ----- 발판 만들기 ----- */
  const px=p=>p.k==='m'?p.x+p.amp*Math.sin(p.om*T+p.ph):p.x;
  const mk=()=>{const d=dif(topY),dy=lerp(1,1.9,d)+rnd()*lerp(.5,.8,d),y=topY+dy,pw=lerp(1.9,1.3,d),lo=pw/2+.1,hi=AX_W-pw/2-.1,x=lo+rnd()*(hi-lo),q=rnd();
    let k='n';if(y>40&&q<.1+.3*d)k='m';else if(y>80&&!lastOnce&&q<.15+.5*d)k='o';lastOnce=k==='o';
    const p={k:k,x:x,y:y,w:pw,amp:0,om:0,ph:0,gone:0,sp:0};
    if(k==='m'){p.amp=Math.min(.8+1.7*rnd(),x-lo,hi-x);if(p.amp<.4){p.x=AX_W/2;p.amp=1+rnd()*1.5;}p.om=(1+1.2*d*rnd()+.4*rnd());p.ph=rnd()*6.283;}
    PL.push(p);
    if(k==='n'){const a=rnd();if(y>12&&a<.07)p.sp=1;else if(y>60&&a<.1)IT.push({k:'k',p:p,got:0});else if(y>100&&a<.112)IT.push({k:'h',p:p,got:0});}
    // 가짜 뉴스(밟으면 무너진다) · 덤 발판은 이어지는 발판 사이에 끼운다
    const e=rnd(),ey=topY+dy*(.35+.3*rnd()),ex=((x+AX_W/2+(rnd()-.5)*3)%AX_W+AX_W)%AX_W,cx=Math.max(lo,Math.min(hi,ex));
    if(y>25&&e<.22+.2*d)PL.push({k:'f',x:cx,y:ey,w:pw,amp:0,om:0,ph:0,gone:0,sp:0});
    else if(e>.72+.25*d)PL.push({k:'n',x:cx,y:ey,w:pw,amp:0,om:0,ph:0,gone:0,sp:0});
    if(y>150&&rnd()<.06+.12*d)VR.push({x:.6+rnd()*(AX_W-1.2),y:topY+dy*.5+.6,vx:(1+1.5*d*rnd())*(rnd()<.5?-1:1),r:.4,dead:0});
    topY=y;};
  const reset=seed=>{rnd=axRng(seed==null?(Math.random()*4294967296)>>>0:seed);T=0;tt=0;P={x:AX_W/2,y:0,vx:0,vy:AX_J};face=1;sq=0;camY=-2;maxY=0;
    PL=[{k:'g',x:AX_W/2,y:0,w:AX_W+2,amp:0,om:0,ph:0,gone:0,sp:0}];IT=[];VR=[];topY=0;lastOnce=false;shield=0;inv=0;fly=0;stage=0;
    cause='';quit=false;FX=[];POP=[];shake=0;hudK='';hintT=0;jumps=0;stomps=0;while(topY<camY+34)mk();};
  /* ----- 화면 글자 ----- */
  const ov=h=>{const o=$('axOv');o.innerHTML=h;o.style.display=h?'flex':'none';};
  const ban=(t,s)=>{const b=$('axBan');b.innerHTML='<b>'+t+'</b>'+(s?'<span>'+s+'</span>':'');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');banT=2.1;};
  const sc=()=>Math.floor(maxY);
  const hud=()=>{const m=axMem(),k=sc()+'|'+shield+'|'+m.best;if(k===hudK)return;hudK=k;$('axS').innerHTML=sc()+'<span class="ax-u">m</span>';
    $('axB').innerHTML='최고 <b>'+Math.max(m.best,sc())+'m</b>';$('axK').innerHTML='마스크 <b class="'+(shield?'on':'')+'">'+(shield?'있음':'없음')+'</b>';};
  const pop=(t,x,y,c)=>POP.push({t:t,x:x,y:y,c:c||'#fff',l:1});
  const burst=(x,y,k,c,v)=>{for(let i=0;i<k;i++){const a=Math.random()*6.283,s=(v||3)*(.3+Math.random());FX.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:.5+Math.random()*.5,c:c});}};
  /* ----- 조종: 키 > 누르기 > 기울기 ----- */
  const ctlTilt=()=>axMem().ctl!=='t';
  const inp=()=>dbgA!==null?dbgA:(kL||kR)?kR-kL:TP.length?TP[TP.length-1].d:(tiltSeen&&ctlTilt())?tilt:0;
  const onTilt=e=>{if(e.gamma==null||e.beta==null)return;let a=0;try{a=(screen.orientation&&screen.orientation.angle)||window.orientation||0;}catch(x){}
    const v=a===90?e.beta:(a===270||a===-90)?-e.beta:a===180?-e.gamma:e.gamma,m=Math.abs(v);if(!tiltSeen&&(e.gamma||e.beta))tiltSeen=true;
    tilt=m<1.5?0:Math.max(-1,Math.min(1,Math.sign(v)*(m-1.5)/17));};
  // iOS는 누른 순간에 허락을 받아야 기울기 값을 준다(시작 단추에서 부른다)
  const tiltAsk=()=>{if(tiltOn||!ctlTilt())return;const E=window.DeviceOrientationEvent;if(!E)return;
    const add=()=>{if(tiltOn||!live)return;tiltOn=true;addEventListener('deviceorientation',onTilt);};
    if(typeof E.requestPermission==='function'){try{E.requestPermission().then(s=>{if(s==='granted')add();},()=>{});}catch(e){}}else add();};
  /* ----- 한 판 ----- */
  const start=seed=>{tiltAsk();run++;reset(seed);ov('');st='run';prev=performance.now();hud();snd(()=>{SFX.click();tone(330,'triangle',.25,.06);tone(494,'triangle',.3,.06,.12);});
    ban('취임!','민심을 딛고 지지율을 끌어올린다');};
  const die=k=>{if(st!=='run')return;st='dead';deadT=k==='quit'?0:k==='fall'?.5:1;quit=k==='quit';cause=k==='quit'?'도전을 멈췄다':k==='v'?'바이러스에 감염됐다':'지지율이 추락했다';
    if(!quit){shake=.4;if(k==='v'){P.vy=6;burst(P.x,P.y+.5,22,'#ff6a7a',5);}snd(()=>{tone(260,'sawtooth',.3,.08);tone(130,'square',.5,.07,.1);});try{vib([60,40,140]);}catch(e){}}};
  const bounce=(v,p)=>{P.vy=v;sq=1;jumps++;if(p)p.hit=T;snd(()=>tone(v>AX_J?330:520+Math.random()*60,'triangle',v>AX_J?.25:.07,.05));};
  const step=dt=>{
    for(const p of FX){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92;p.l-=dt;}FX=FX.filter(p=>p.l>0);
    for(const p of POP){p.y+=dt*.9;p.l-=dt*.85;}POP=POP.filter(p=>p.l>0);
    if(banT>0){banT-=dt;if(banT<=0)$('axBan').classList.remove('on');}
    if(shake>0)shake=Math.max(0,shake-dt);if(sq>0)sq=Math.max(0,sq-dt*5);
    if(st==='dead'){T+=dt;deadT-=dt;P.vy-=AX_G*dt;P.y+=P.vy*dt;if(deadT<=0)end();return;}
    if(st!=='run'){T+=dt*.6;return;}
    T+=dt;tt+=dt;hintT+=dt;if(inv>0)inv-=dt;
    inA=inp();P.vx+=(inA*AX_V-P.vx)*Math.min(1,dt*12);P.x=((P.x+P.vx*dt)%AX_W+AX_W)%AX_W;if(Math.abs(inA)>.15)face=inA>0?1:-1;
    const y0=P.y;
    if(fly>0){fly-=dt;P.vy=14;P.y+=P.vy*dt;if(fly<=0){P.vy=AX_J*.7;inv=Math.max(inv,.6);}}
    else{P.vy-=AX_G*dt;P.y+=P.vy*dt;
      // 내려오는 중에 발이 발판 윗면을 지나면 밟는다
      if(P.vy<0)for(const p of PL){if(p.gone||y0<p.y||P.y>p.y||Math.abs(wd(P.x,px(p)))>p.w/2+.22)continue;
        if(p.k==='f'){p.gone=T;snd(()=>tone(150,'square',.18,.05));pop('가짜 뉴스!',px(p),p.y+.5,'#ffb0a0');continue;}
        P.y=p.y;if(p.sp){bounce(27,p);p.spT=T;pop('부스터 샷!',P.x,P.y+1.4,'#9fe3ff');burst(P.x,P.y,10,'#bfeaff',4);}else bounce(AX_J,p);
        if(p.k==='o')p.gone=T;break;}}
    // 주울 것: 마스크 · 방역 헬기(발판 위에 떠 있다)
    for(const o of IT){if(o.got||o.p.gone)continue;const ox=px(o.p),oy=o.p.y+.75;if(Math.abs(wd(P.x,ox))<.7&&P.y<oy+.4&&P.y+.95>oy-.4){o.got=1;
      if(o.k==='k'){shield=1;pop('마스크 착용!',ox,oy+.8,'#9fe3ff');burst(ox,oy,10,'#bfeaff',3);snd(()=>{tone(784,'sine',.12,.07);tone(1175,'sine',.2,.07,.08);});}
      else{fly=2.2;pop('방역 헬기 탑승!',ox,oy+.8,'#ffe08a');snd(()=>[392,523,659,784].forEach((f,i)=>tone(f,'sawtooth',.2,.04,i*.07)));}}}
    // 바이러스: 위에서 밟으면 퇴치, 아니면 감염
    for(const v of VR){if(v.dead)continue;v.x+=v.vx*dt;if(v.x<v.r){v.x=v.r;v.vx=-v.vx;}if(v.x>AX_W-v.r){v.x=AX_W-v.r;v.vx=-v.vx;}
      if(Math.abs(wd(P.x,v.x))>v.r+.28||P.y>v.y+v.r||P.y+.9<v.y-v.r)continue;
      if(fly>0||(P.vy<0&&y0>=v.y)){v.dead=T;stomps++;burst(v.x,v.y,14,'#ff8a9a',4);pop('퇴치!',v.x,v.y+.7,'#ffe08a');if(fly<=0)bounce(AX_J);}
      else if(god||inv>0){}
      else if(shield){shield=0;inv=1.1;v.dead=T;pop('마스크가 막았다!',P.x,P.y+1.4,'#9fe3ff');burst(v.x,v.y,14,'#bfeaff',4);snd(()=>tone(880,'sine',.25,.07));}
      else{die('v');return;}}
    if(P.y>maxY)maxY=P.y;const want=P.y-VH*.45;if(want>camY)camY+=(want-camY)*Math.min(1,dt*10);
    if(P.y<camY-1.2){if(god){bounce(AX_J*1.4);}else{die('fall');return;}}
    const s=Math.floor(maxY/100);if(s>stage){stage=s;const k=Math.min(AX_WV.length-1,s-1);ban('고도 '+s*100+'m',AX_WV[k]+'을 넘었다');snd(()=>[659,784,988,1319].forEach((f,i)=>tone(f,'triangle',.3,.07,i*.09)));}
    while(topY<camY+34)mk();PL=PL.filter(p=>p.y>camY-3&&!(p.gone&&T-p.gone>.6));IT=IT.filter(o=>o.p.y>camY-3);VR=VR.filter(v=>v.y>camY-3&&!(v.dead&&T-v.dead>.4));
    hud();};
  /* ----- 한 판 끝 ----- */
  const end=()=>{if(st==='end')return;st='end';const m=axMem(),n=sc();m.runs++;const nb=n>m.best;
    if(nb){m.best=n;m.bestS=Math.round(tt*10)/10;}msave();
    // 시험(window.__axDbg) 판 · 30m도 못 오른 판은 보내지 않는다
    if(!window.__axDbg&&n>=30&&tt>=5)sendArcade('ax',{score:n,sec:Math.round(tt*10)/10,win:false,detail:(n+'m · '+(stage?AX_WV[Math.min(AX_WV.length-1,stage-1)]+' 돌파':'1차 유행 전')+' · '+tm(tt)).slice(0,80)});
    if(nb&&n>=30)snd(()=>[784,988,1175,1568].forEach((f,i)=>tone(f,'triangle',.4,.09,i*.1)));
    const my=run;setTimeout(()=>{if(!live||my!==run||st!=='end')return;
      ov('<div class="ax-card"><span class="ax-k">'+(nb&&n>0?'최고 기록!':quit?'도전 중단':'고공행진 끝')+'</span><h2>'+cause+'</h2>'+
        '<div class="ax-big">'+n+'<small>m</small></div>'+
        '<div class="ax-b"><span>최고 <b>'+m.best+'m</b></span><span>걸린 시간 <b>'+tm(tt)+'</b></span><span>퇴치한 바이러스 <b>'+stomps+'</b></span></div>'+
        (n<30?'<p class="ax-note">30m 넘게 오르면 명예의 전당에 올라요.</p>':'')+
        '<button type="button" class="pri" id="axAg">다시 도전</button><button type="button" id="axOut">미니게임으로</button></div>');
      $('axAg').onclick=()=>start();$('axOut').onclick=close;setTimeout(()=>{const b=$('axAg');if(b)try{b.focus({preventScroll:true});}catch(e){}},60);},quit?60:350);};
  /* ----- 안내 · 쉬기 ----- */
  const brief=()=>{st='brief';const m=axMem();if(PL.length<2)reset();
    ov('<div class="ax-card"><span class="ax-k">미니게임 · 발판 밟고 위로</span><h2>지지율 고공행진</h2>'+
    '<p class="ax-s">민심을 딛고 지지율을 끌어올린다. 대통령은 저절로 통통 튀어 오르고, 떨어지면 지지율 추락.</p>'+
    '<ul><li><b>휴대폰은 좌우로 기울이고</b>, 컴퓨터는 <b>← → 방향키</b>(A · D)로 움직인다. 기울기가 안 되면 <b>화면 왼쪽 · 오른쪽</b>을 누른다.</li>'+
    '<li>화면 옆으로 나가면 <b>반대쪽</b>에서 나온다.</li>'+
    '<li><b class="ax-c-n">초록</b> 굳은 지지층 · <b class="ax-c-m">파랑</b> 움직이는 부동층 · <b class="ax-c-o">노랑</b> 한 번뿐인 공약 · <b class="ax-c-f">금 간 회색</b> 가짜 뉴스(무너진다).</li>'+
    '<li><b>백신 주사기</b> 발판은 부스터 샷(높이 점프). <b>마스크</b>는 보호막, <b>방역 헬기</b>는 잠깐 날아오른다.</li>'+
    '<li><b>바이러스</b>는 위에서 밟으면 퇴치, 옆 · 아래에서 닿으면 감염.</li>'+
    '<li>100m마다 <b>유행</b>이 바뀌어 발판이 좁아지고 멀어진다.</li></ul>'+
    '<div class="ax-b"><span>최고 <b>'+(m.best||0)+'m</b></span><span>도전 <b>'+(m.runs||0)+'번</b></span></div>'+
    (coarse?'<button type="button" class="ax-ctl" id="axCtl"></button>':'')+
    '<button type="button" class="pri" id="axGo">시작</button><button type="button" id="axBack">미니게임으로</button></div>');
    const cb=$('axCtl'),lab=()=>{if(cb)cb.innerHTML='조종 방법 <b>'+(ctlTilt()?'기울이기':'화면 누르기')+'</b> <small>눌러서 바꾸기</small>';};lab();
    if(cb)cb.onclick=()=>{m.ctl=ctlTilt()?'t':'';msave();snd(()=>SFX.click());lab();};
    $('axGo').onclick=()=>start();$('axBack').onclick=close;setTimeout(()=>{const b=$('axGo');if(b)try{b.focus({preventScroll:true});}catch(e){}},60);};
  const pause=on=>{if(on&&st==='run'){pst=st;st='pause';kL=kR=0;TP=[];ov('<div class="ax-card sm"><span class="ax-k">잠깐</span><h2>쉬는 중</h2><p class="ax-s">'+sc()+'m · '+tm(tt)+'</p>'+
      '<button type="button" class="pri" id="axRe">계속하기</button><button type="button" id="axQ">그만두기</button></div>');
      $('axRe').onclick=()=>pause(false);$('axQ').onclick=()=>{ov('');st=pst;die('quit');};}
    else if(!on&&st==='pause'){ov('');st=pst;prev=performance.now();}};
  const shut=()=>{live=false;cancelAnimationFrame(raf);w.remove();document.body.style.overflow='';document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
    removeEventListener('blur',blr);removeEventListener('resize',onR);document.removeEventListener('visibilitychange',vis);if(tiltOn)removeEventListener('deviceorientation',onTilt);};
  const close=()=>{try{SFX.back();}catch(e){}shut();back();};
  $('axX').onclick=()=>{if(st==='run'){pause(true);return;}if(st==='pause'){pause(false);return;}if(st==='dead')return;close();};
  $('axP').onclick=()=>{try{SFX.click();}catch(e){}if(st==='run')pause(true);else if(st==='pause')pause(false);};
  /* ----- 입력 ----- */
  cv.addEventListener('pointerdown',e=>{if(st!=='run')return;e.preventDefault();TP.push({id:e.pointerId,d:e.clientX<W/2?-1:1});try{cv.setPointerCapture(e.pointerId);}catch(x){}});
  cv.addEventListener('pointermove',e=>{const t=TP.find(q=>q.id===e.pointerId);if(t)t.d=e.clientX<W/2?-1:1;});
  const up=e=>{TP=TP.filter(q=>q.id!==e.pointerId);};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
  const KL={ArrowLeft:1,a:1,A:1,'ㅁ':1},KR={ArrowRight:1,d:1,D:1,'ㅇ':1};
  const kd=e=>{if(e.key==='Escape'){e.preventDefault();if(st==='run')pause(true);else if(st==='pause')pause(false);else if(st==='brief')close();return;}
    if(e.key==='p'||e.key==='P'){if(st==='run')pause(true);else if(st==='pause')pause(false);return;}
    if(st!=='run')return;if(KL[e.key]){e.preventDefault();kL=1;}else if(KR[e.key]){e.preventDefault();kR=1;}};
  const ku=e=>{if(KL[e.key])kL=0;else if(KR[e.key])kR=0;};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  const blr=()=>{kL=kR=0;TP=[];};addEventListener('blur',blr);
  const vis=()=>{if(document.hidden){blr();pause(true);}};document.addEventListener('visibilitychange',vis);
  let rt=0;const onR=()=>{clearTimeout(rt);rt=setTimeout(fit,120);};addEventListener('resize',onR);
  /* ----- 그리기 ----- */
  // 하늘: 올라갈수록(유행이 바뀔수록) 어두워지고 별이 뜬다. 맨 아래에는 밤의 도시
  const sky=()=>{const f=Math.max(0,camY+VH*.5)/100,i=Math.min(AX_SK.length-1,Math.floor(f)),j=Math.min(AX_SK.length-1,i+1),k=f-Math.floor(f),a=AX_SK[i],b=AX_SK[j],
      c=q=>Math.round(lerp(a[q],b[q],k)),top='rgb('+Math.round(c(0)*.55)+','+Math.round(c(1)*.55)+','+Math.round(c(2)*.7)+')',gr=g.createLinearGradient(0,0,0,H);
    gr.addColorStop(0,top);gr.addColorStop(1,'rgb('+c(0)+','+c(1)+','+c(2)+')');g.fillStyle=gr;g.fillRect(0,0,W,H);
    // 별(멀리 있어 천천히 흐른다)
    const sa=Math.min(.9,.15+f*.12),G=cs*2.2,oy=camY*.25*cs,j0=Math.floor(oy/G)-1,j1=Math.floor((oy+H)/G)+1;
    for(let q=j0;q<=j1;q++)for(let p=0;p*G<W+G;p++){const h=axHs(p,q);if(h>.55)continue;const x=p*G+axHs(p+3,q)*G,y=H-(q*G-oy)-axHs(p,q+7)*G;
      g.fillStyle='rgba(255,255,255,'+(sa*(.4+.6*Math.abs(Math.sin(T*.8+h*40))))+')';g.fillRect(x,y,h<.1?2.5:1.5,h<.1?2.5:1.5);}
    // 구름(조금 빨리 흐른다)
    const C=cs*7,cy=camY*.5*cs,r0=Math.floor(cy/C)-1,r1=Math.floor((cy+H)/C)+1;g.fillStyle='rgba(255,255,255,.055)';
    for(let q=r0;q<=r1;q++){const h=axHs(q,91),x=((h*W*1.4+T*cs*.12*(.5+h))%(W+cs*8))-cs*4,y=H-(q*C-cy)-h*C;
      g.beginPath();g.ellipse(x,y,cs*2.6,cs*.7,0,0,6.283);g.ellipse(x+cs*1.4,y-cs*.35,cs*1.6,cs*.6,0,0,6.283);g.ellipse(x-cs*1.3,y+cs*.2,cs*1.5,cs*.5,0,0,6.283);g.fill();}
    // 도시(처음 30m쯤까지 보인다)
    if(camY<34){const by=H-(-2-camY*.6+2)*cs+cs*2;for(let i2=Math.floor(-X0/cs/1.3)-1;i2*1.3*cs+X0<W;i2++){const h=axHs(i2,5),bh=cs*(3+h*7),x=X0+i2*1.3*cs;
        g.fillStyle=h<.5?'#141c33':'#19233f';g.fillRect(x,by-bh,cs*1.2,bh+cs*4);
        for(let r=0;r<bh/cs*2-1;r++)for(let q=0;q<3;q++)if(axHs(i2*7+q,r+11)<.4){g.fillStyle=axHs(i2+q,r)<.7?'rgba(255,214,130,.6)':'rgba(170,215,255,.55)';g.fillRect(x+cs*(.18+q*.32),by-bh+cs*(.25+r*.5),cs*.16,cs*.2);}}}
    // 판 밖은 어둡게
    if(X0>1){g.fillStyle='rgba(5,7,14,.6)';g.fillRect(0,0,X0,H);g.fillRect(X0+PW,0,W-X0-PW,H);g.fillStyle='rgba(241,213,137,.25)';g.fillRect(X0-1,0,1,H);g.fillRect(X0+PW,0,1,H);}};
  const PC={n:['#3f9a55','#7fd68f','#2a6e3c'],m:['#3d86c9','#8cc6f5','#275f93'],o:['#d9a52e','#ffe08a','#9a7214'],f:['#7d6f72','#a89a9c','#514648'],g:['#4a5a7a','#8fa3c9','#2c3852']};
  const plat=p=>{const y=sy(p.y);if(y<-cs||y>H+cs*2)return;const x=sx(px(p)),ww=p.w*cs,hh=AX_PH*cs,C=PC[p.k];
    if(p.k==='g'){g.fillStyle=C[2];g.fillRect(0,y,W,H-y+cs);g.fillStyle=C[0];g.fillRect(0,y,W,hh*.7);g.fillStyle=C[1];g.fillRect(0,y,W,hh*.2);
      g.fillStyle='rgba(255,244,214,.75)';g.font='800 '+Math.round(cs*.36)+'px '+FF;g.textAlign='center';g.textBaseline='middle';g.fillText('청와대 앞마당',W/2,y+cs*.85);return;}
    if(p.gone){const k=(T-p.gone)/.6;if(p.k==='f'){g.globalAlpha=Math.max(0,1-k);g.fillStyle=C[0];
        g.save();g.translate(x-ww*.25,y+hh/2+k*k*cs*3);g.rotate(-k*.9);RR(-ww*.25,-hh/2,ww*.5,hh,hh*.3);g.fill();g.restore();
        g.save();g.translate(x+ww*.25,y+hh/2+k*k*cs*3.4);g.rotate(k*1.1);RR(-ww*.25,-hh/2,ww*.5,hh,hh*.3);g.fill();g.restore();g.globalAlpha=1;return;}
      g.globalAlpha=Math.max(0,1-k*1.6);}
    const dip=p.hit!==undefined&&T-p.hit<.18?Math.sin((T-p.hit)/.18*3.14)*cs*.08:0,yy=y+dip;
    g.fillStyle='rgba(0,0,0,.25)';RR(x-ww/2+cs*.04,yy+cs*.07,ww,hh,hh*.5);g.fill();
    g.fillStyle=C[2];RR(x-ww/2,yy,ww,hh,hh*.5);g.fill();g.fillStyle=C[0];RR(x-ww/2,yy,ww,hh*.78,hh*.45);g.fill();g.fillStyle=C[1];RR(x-ww/2+hh*.3,yy+hh*.1,ww-hh*.6,hh*.2,hh*.1);g.fill();
    if(p.k==='m'){g.fillStyle='rgba(255,255,255,.8)';for(const d of [-1,1]){const ax2=x+d*ww*.3;g.beginPath();g.moveTo(ax2+d*hh*.3,yy+hh*.45);g.lineTo(ax2-d*hh*.1,yy+hh*.22);g.lineTo(ax2-d*hh*.1,yy+hh*.68);g.closePath();g.fill();}}
    if(p.k==='o'){g.strokeStyle='rgba(120,80,0,.55)';g.lineWidth=Math.max(1,cs*.03);g.setLineDash([cs*.12,cs*.1]);g.beginPath();g.moveTo(x-ww*.36,yy+hh*.48);g.lineTo(x+ww*.36,yy+hh*.48);g.stroke();g.setLineDash([]);}
    if(p.k==='f'){g.strokeStyle='#2c2325';g.lineWidth=Math.max(1.5,cs*.045);g.beginPath();g.moveTo(x-hh*.1,yy);g.lineTo(x+hh*.25,yy+hh*.3);g.lineTo(x-hh*.2,yy+hh*.55);g.lineTo(x+hh*.15,yy+hh);
      g.moveTo(x-ww*.28,yy);g.lineTo(x-ww*.24,yy+hh*.4);g.moveTo(x+ww*.3,yy+hh);g.lineTo(x+ww*.25,yy+hh*.5);g.stroke();}
    // 백신 주사기(부스터 샷): 밟으면 주사기가 쑥 눌린다
    if(p.sp){const k=p.spT!==undefined?Math.max(0,1-(T-p.spT)/.3):0,sh=cs*(.5-.22*k),sxx=x+ww*.2;g.fillStyle='#c9d3de';g.fillRect(sxx-cs*.015,yy-sh-cs*.14,cs*.03,cs*.14);
      g.fillStyle='#eef6fb';RR(sxx-cs*.1,yy-sh,cs*.2,sh,cs*.04);g.fill();g.fillStyle='#43c2f0';g.fillRect(sxx-cs*.07,yy-sh*.62,cs*.14,sh*.58);
      g.strokeStyle='#1f4f6e';g.lineWidth=Math.max(1,cs*.03);RR(sxx-cs*.1,yy-sh,cs*.2,sh,cs*.04);g.stroke();g.fillStyle='#f1d589';g.fillRect(sxx-cs*.14,yy-sh-cs*.04,cs*.28,cs*.06);}
    g.globalAlpha=1;};
  const item=o=>{if(o.got||o.p.gone)return;const x=sx(px(o.p)),y=sy(o.p.y+.75)+Math.sin(T*3+o.p.y)*cs*.06;if(y<-cs||y>H+cs)return;
    g.fillStyle=o.k==='k'?'rgba(159,227,255,.18)':'rgba(255,224,138,.18)';g.beginPath();g.arc(x,y,cs*.5,0,6.283);g.fill();
    if(o.k==='k'){g.strokeStyle='#dfe6f2';g.lineWidth=Math.max(1.5,cs*.04);g.beginPath();g.moveTo(x-cs*.24,y-cs*.08);g.lineTo(x-cs*.38,y-cs*.14);g.moveTo(x+cs*.24,y-cs*.08);g.lineTo(x+cs*.38,y-cs*.14);g.stroke();
      g.fillStyle='#f4f8fc';RR(x-cs*.26,y-cs*.16,cs*.52,cs*.34,cs*.1);g.fill();g.strokeStyle='#9fc4dc';g.lineWidth=Math.max(1,cs*.025);g.beginPath();g.moveTo(x-cs*.2,y-cs*.04);g.lineTo(x+cs*.2,y-cs*.04);g.moveTo(x-cs*.2,y+cs*.06);g.lineTo(x+cs*.2,y+cs*.06);g.stroke();}
    else copter(x,y,.8);};
  // 방역 헬기(옆모습). s는 크기
  const copter=(x,y,s)=>{const u=cs*s;g.fillStyle='#f4f6fa';g.beginPath();g.ellipse(x,y,u*.34,u*.2,0,0,6.283);g.fill();g.fillRect(x-u*.62,y-u*.05,u*.4,u*.08);g.fillStyle='#d8344b';g.fillRect(x-u*.68,y-u*.16,u*.06,u*.22);
    g.fillStyle='#2b4a8f';g.fillRect(x-u*.3,y+u*.02,u*.6,u*.06);g.fillStyle='#1d2a3c';g.beginPath();g.ellipse(x+u*.16,y-u*.04,u*.13,u*.1,0,0,6.283);g.fill();
    g.strokeStyle='#39425a';g.lineWidth=Math.max(1.5,u*.05);g.beginPath();g.moveTo(x-u*.24,y+u*.28);g.lineTo(x+u*.26,y+u*.28);g.moveTo(x,y-u*.2);g.lineTo(x,y-u*.3);g.stroke();
    const rw=u*.62*Math.abs(Math.cos(T*30));g.strokeStyle='rgba(235,240,250,.85)';g.beginPath();g.moveTo(x-rw,y-u*.3);g.lineTo(x+rw,y-u*.3);g.stroke();};
  const virus=v=>{const x=sx(v.x),y=sy(v.y)+Math.sin(T*2.4+v.y)*cs*.08,r=v.r*cs*(v.dead?Math.max(0,1-(T-v.dead)/.4):1);if(y<-cs||y>H+cs||r<=0)return;
    g.fillStyle='rgba(255,90,110,.2)';g.beginPath();g.arc(x,y,r*1.6,0,6.283);g.fill();g.strokeStyle='#ffb0bc';g.lineWidth=Math.max(1.5,cs*.05);g.beginPath();
    for(let s=0;s<9;s++){const a=s*.698+T*1.4;g.moveTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.8);g.lineTo(x+Math.cos(a)*r*1.35,y+Math.sin(a)*r*1.35);}g.stroke();
    g.fillStyle='#d8344b';g.beginPath();g.arc(x,y,r,0,6.283);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x-r*.32,y-r*.1,r*.2,0,6.283);g.arc(x+r*.32,y-r*.1,r*.2,0,6.283);g.fill();
    g.fillStyle='#3a0c14';g.beginPath();g.arc(x-r*.28,y-r*.06,r*.09,0,6.283);g.arc(x+r*.36,y-r*.06,r*.09,0,6.283);g.fill();};
  // 대통령: 남색 양복 · 빨간 넥타이. 밟는 순간 납작해졌다 펴지고, 오를 때는 다리를 모은다
  const man=x=>{const y=sy(P.y),up=P.vy>2||fly>0;g.save();g.translate(x,y);if(st==='dead'&&!quit)g.rotate(T*9);g.scale(face*(1+sq*.18),1-sq*.22);if(inv>0&&Math.floor(T*14)%2)g.globalAlpha=.5;
    g.fillStyle='#161d30';if(up){RR(-cs*.2,-cs*.16,cs*.15,cs*.12,cs*.04);g.fill();RR(cs*.04,-cs*.16,cs*.15,cs*.12,cs*.04);g.fill();}
    else{RR(-cs*.2,-cs*.2,cs*.14,cs*.2,cs*.04);g.fill();RR(cs*.05,-cs*.2,cs*.14,cs*.2,cs*.04);g.fill();}
    g.fillStyle='#22325a';RR(-cs*.28,-cs*.66,cs*.56,cs*.52,cs*.14);g.fill();
    g.fillStyle='#f4f6fa';g.beginPath();g.moveTo(-cs*.02,-cs*.66);g.lineTo(cs*.2,-cs*.66);g.lineTo(cs*.09,-cs*.44);g.closePath();g.fill();g.fillStyle='#d8344b';g.fillRect(cs*.06,-cs*.62,cs*.06,cs*.26);
    g.fillStyle='#22325a';RR(-cs*.36,-cs*.6,cs*.14,cs*.3,cs*.06);g.fill();
    g.fillStyle='#f2c9a0';g.beginPath();g.arc(cs*.02,-cs*.84,cs*.23,0,6.283);g.fill();
    g.fillStyle='#1c1c22';g.beginPath();g.arc(cs*.02,-cs*.88,cs*.24,3.3,6.1);g.lineTo(cs*.02,-cs*.92);g.closePath();g.fill();
    if(shield){g.fillStyle='#f4f8fc';RR(cs*.0,-cs*.84,cs*.25,cs*.17,cs*.05);g.fill();g.strokeStyle='#9fc4dc';g.lineWidth=Math.max(1,cs*.02);g.beginPath();g.moveTo(cs*.03,-cs*.76);g.lineTo(cs*.22,-cs*.76);g.stroke();}
    else{g.fillStyle='#7a3b2a';g.fillRect(cs*.12,-cs*.75,cs*.09,cs*.025);}
    g.fillStyle='#1c1c22';g.beginPath();g.arc(cs*.13,-cs*.87,cs*.03,0,6.283);g.fill();
    g.restore();
    if(fly>0){g.strokeStyle='rgba(235,240,250,.7)';g.lineWidth=Math.max(1,cs*.03);g.beginPath();g.moveTo(x,y-cs*1.05);g.lineTo(x,y-cs*1.5);g.stroke();copter(x,y-cs*1.75,1);}};
  const draw=()=>{g.setTransform(D,0,0,D,0,0);const sh=shake>0?shake*cs*.3:0;if(sh)g.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
    sky();g.save();g.beginPath();g.rect(X0,-cs,PW,H+cs*2);g.clip();
    for(const p of PL)plat(p);for(const o of IT)item(o);for(const v of VR)virus(v);
    if(st!=='end'||quit){const x=sx(P.x);man(x);if(P.x<1)man(x+PW);else if(P.x>AX_W-1)man(x-PW);}
    for(const p of FX){g.globalAlpha=Math.max(0,Math.min(1,p.l*2));g.fillStyle=p.c;g.beginPath();g.arc(sx(p.x),sy(p.y),cs*.08,0,6.283);g.fill();}g.globalAlpha=1;
    g.textAlign='center';g.textBaseline='middle';g.font='800 '+Math.max(13,Math.min(18,cs*.4))+'px '+FF;
    for(const p of POP){g.globalAlpha=Math.max(0,Math.min(1,p.l*1.6));g.fillStyle='rgba(0,0,0,.55)';g.fillText(p.t,sx(p.x)+1,sy(p.y)+2);g.fillStyle=p.c;g.fillText(p.t,sx(p.x),sy(p.y));}g.globalAlpha=1;
    g.restore();
    if(st==='run'||st==='pause'){
      // 조종 눈금: 지금 들어가는 좌우 입력
      const tw=Math.min(PW*.5,220),tx=W/2,ty=H-Math.max(20,cs*.5);g.fillStyle='rgba(10,14,26,.5)';RR(tx-tw/2,ty-4,tw,8,4);g.fill();g.fillStyle='rgba(255,255,255,.3)';g.fillRect(tx-1,ty-6,2,12);
      g.fillStyle='#f1d589';g.beginPath();g.arc(tx+inA*tw/2,ty,7,0,6.283);g.fill();
      // 처음 몇 초: 조종법
      if(hintT<5&&maxY<12){const tl=tiltSeen&&ctlTilt();g.globalAlpha=Math.min(1,(5-hintT)*1.2)*.9;g.font='800 '+Math.max(13,Math.min(17,cs*.38))+'px '+FF;g.fillStyle='#ffe08a';g.textAlign='center';
        g.fillText(tl?'휴대폰을 좌우로 기울여 움직인다':coarse?'화면 왼쪽 · 오른쪽을 눌러 움직인다':'← → 방향키로 움직인다',W/2,ty-cs*.9);
        if(!tl&&coarse){g.fillStyle='rgba(255,255,255,.5)';g.font='800 '+Math.round(cs*.9)+'px '+FF;g.fillText('◀',X0+cs,H*.62);g.fillText('▶',X0+PW-cs,H*.62);}g.globalAlpha=1;}}};
  const loop=now=>{if(!live||!w.isConnected){live=false;return;}const dt=Math.min(.034,(now-prev)/1000||0);prev=now;
    if(st!=='pause')step(dt);if(!live)return;draw();raf=requestAnimationFrame(loop);};
  // 기울기 허락이 필요 없는 기기는 바로 듣기 시작한다(안내 화면에서 미리 값이 들어온다)
  try{if(window.DeviceOrientationEvent&&typeof window.DeviceOrientationEvent.requestPermission!=='function')tiltAsk();}catch(e){}
  fit();brief();prev=performance.now();raf=requestAnimationFrame(loop);
  // 시험용: window.__axDbg를 미리 켜 두면 상태를 밖에서 보고 조종한다(이 판은 명예의 전당에 보내지 않는다)
  if(window.__axDbg)window.__axDbg={st:()=>st,P:()=>({x:P.x,y:P.y,vx:P.vx,vy:P.vy}),n:()=>sc(),T:()=>T,start:s=>start(s),steer:a=>{dbgA=a;},god:v=>{god=!!v;},cause:()=>cause,shield:()=>shield,fly:()=>fly,
    plats:()=>PL.filter(p=>!p.gone).map(p=>({k:p.k,x:px(p),y:p.y,w:p.w,sp:p.sp})),virus:()=>VR.filter(v=>!v.dead).map(v=>({x:v.x,y:v.y,vx:v.vx})),all:()=>PL.map(p=>({k:p.k,x:p.x,y:p.y,w:p.w,amp:p.amp})),
    tilt:(gm,bt)=>onTilt({gamma:gm,beta:bt}),inA:()=>inA,geo:()=>({W:W,H:H,cs:cs,X0:X0,VH:VH,cam:camY}),gen:h=>{while(topY<h)mk();},
    put:(h,sh,fl)=>{while(topY<h+34)mk();const p=PL.find(q=>q.k==='n'&&q.y>=h);P.x=p.x;P.y=p.y;P.vy=AX_J;maxY=Math.max(maxY,p.y);camY=p.y-VH*.45;stage=Math.floor(maxY/100);if(sh)shield=1;if(fl)fly=fl;hudK='';hud();}};}
