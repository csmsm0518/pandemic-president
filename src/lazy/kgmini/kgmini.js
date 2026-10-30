/* ---------- 국난 직접 지휘: 국난 갈래마다 20초 남짓한 짧은 경기 ----------
   kgOpen에서 맞서는 길을 고른 뒤 부른다(kgMini). 결과는 0 대승 · 1 선전 · 2 고전 · 3 참패로 돌려주고,
   그만큼 왕권을 지킬 가능성이 오르내린다(KG_MG). 갈래마다 경기가 다르다:
   해전(바다 외침) · 성벽 수비(북방 외침) · 역모 색출(반정 · 궁중 정변 · 양위 강요) · 봉기 진무(민란) · 담판(외세 압박).
   경기마다 run(A)는 준비 모습을 그리고 {go}를 돌려준다. go()가 실제로 시작하고, 끝나면 A.end(등급, 한 줄)을 부른다. */
const KGM={
 sea:{n:'해전',how:'다가오는 왜선을 눌러 포를 쏜다. 판옥선 세 척이 번갈아 장전하고, 큰 배(안택선)는 두 발을 맞아야 가라앉는다. 왜선이 해안선을 넘으면 포구 하나를 잃는다.',run:kmSea},
 wall:{n:'성벽 수비',how:'사다리를 타고 오르는 적을 눌러 떨어뜨린다. 갑옷 입은 적은 두 번 눌러야 한다. 적이 성가퀴를 넘으면 성벽이 뚫린다.',run:kmWall},
 spy:{n:'역모 색출',how:'밀서를 주고받는 자들이 잠깐 붉게 드러났다가, 대신들이 자리를 뒤섞는다. 섞임이 멈추면 그들을 골라낸다. 세 차례, 갈수록 빠르다.',run:kmSpy},
 riot:{n:'봉기 진무',how:'도마다 민심이 끓어오른다. 눌러서 관원과 환곡을 보내 가라앉힌다. 창고의 쌀은 천천히 다시 찬다. 끓어 넘치면 봉기가 일어난다.',run:kmRiot},
 talk:{n:'담판',how:'흔들리는 바늘이 우리 몫(금빛 칸)에 들어왔을 때 누른다(스페이스). 가운데일수록 좋다. 네 차례, 갈수록 빠르고 좁아진다.',run:kmTalk}};
const kmS=f=>{try{f();}catch(e){}};   // 소리는 실패해도 경기를 멈추지 않는다
function kgMini(kind,K,j,box,done){const T=KGM[kind],o=K.o[j];window.scrollTo(0,0);
  if(window.__kgSim)return done(window.__kgSim(kind));   // 자동 시험(시뮬레이터)만 쓴다
  box.innerHTML='<div class="kg-sc kg-mini">'+kgEmbers()+kgTop(5,'직접 지휘 · '+K.n)+
   '<div class="km-h"><b>'+T.n+'</b><span>'+o[0]+'</span></div><p class="km-how">'+T.how+'</p>'+
   '<div class="km-st" id="kmSt"></div>'+
   '<div class="km-hud"><span id="kmInfo"></span><span class="km-tm" aria-hidden="true"><i id="kmTm"></i></span></div>'+
   '<div id="kmRes" aria-live="polite"></div>'+
   '<button type="button" class="pri km-go" id="kmGo">지휘 시작</button></div>';
  if(CP.dict)skinNode(box);
  const $=id=>document.getElementById(id),st=$('kmSt');let ended=0;
  const A={st:st,info:h=>{const e=$('kmInfo');if(e)e.innerHTML=h;},time:f=>{const e=$('kmTm');if(e)e.style.width=Math.max(0,Math.min(1,f))*100+'%';},
    alive:()=>!ended&&st.isConnected,
    end:(t,msg)=>{if(ended)return;ended=1;kmS(()=>SFX.tier(t));vib(t>=2?[80,40,80]:30);
      $('kmRes').innerHTML='<div class="km-tier t'+t+'"><b>'+KG_MGT[t]+'</b><span>'+msg+'</span><em>왕권을 지킬 가능성 '+(KG_MG[t]>0?'+':'−')+Math.abs(KG_MG[t])+'%p</em></div>';
      const g=$('kmGo');g.textContent='판정을 본다';g.style.display='';g.onclick=()=>{SFX.click();done(t);};try{g.focus({preventScroll:true});}catch(e){}}};
  const G=T.run(A);
  $('kmGo').onclick=()=>{try{aInit();}catch(e){}SFX.click();$('kmGo').style.display='none';
    let n=3;const cd=()=>{if(!st.isConnected)return;if(!n){st.removeAttribute('data-cd');G.go();return;}
      st.setAttribute('data-cd',n);kmS(()=>tone(n===1?880:660,'square',.07,.08));n--;setTimeout(cd,600);};cd();};}
// 경기 공통: 프레임 고리(dt는 0.05초까지만), 화면 위 좌표
function kmLoop(A,f){let l=performance.now();(function s(n){if(!A.alive())return;const dt=Math.min(.05,(n-l)/1000);l=n;if(f(dt)!==false)requestAnimationFrame(s);})(l);}
const kmXY=(el,e)=>{const r=el.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
const kmLife=(n,max,c)=>Array.from({length:max},(_,i)=>'<i class="km-lf'+(i<n?'':' x')+'">'+c+'</i>').join('');

/* ----- 해전: 바다 위로 왜선이 내려온다. 아래 해안의 판옥선 세 척이 누른 곳으로 포를 쏜다(한 척마다 1초 장전) ----- */
function kmSea(A){const st=A.st,W=st.clientWidth||340,H=Math.round(Math.min(420,Math.max(300,W*1.08))),D=Math.min(2,window.devicePixelRatio||1);
  st.innerHTML='<canvas class="km-cv" aria-label="해전 바다"></canvas>';const cv=st.firstChild,g=cv.getContext('2d');
  cv.width=W*D;cv.height=H*D;cv.style.height=H+'px';g.setTransform(D,0,0,D,0,0);
  const DUR=22,shore=H-56,LIFE=4,guns=[.18,.5,.82].map(x=>({x:W*x,cd:0,rc:0}));
  let E=[],B=[],FX=[],t=0,nx=.5,life=LIFE,sunk=0,leak=0,on=0,shake=0,msg='',msgT=0;
  const say=s=>{msg=s;msgT=1.1;};
  const spawn=()=>{const big=Math.random()<.18+t/DUR*.2,cross=Math.max(5,8.2-t*.14);
    E.push({x:26+Math.random()*(W-52),y:-24,vy:(shore+24)/cross*(big?.82:1),hp:big?2:1,big:big,ph:Math.random()*6,sw:(Math.random()-.5)*14,hit:0});};
  const hull=(x,y,w,h,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x+w/2,y);g.lineTo(x+w/2-h,y+h);g.lineTo(x-w/2+h,y+h);g.closePath();g.fill();};
  const pan=q=>{const x=q.x,y=shore+10,r=q.rc;g.save();g.translate(x,y+Math.sin(t*2+x)*1.2);
    hull(0,0,46,10,'#5a3a1e');g.fillStyle='#7b5230';g.fillRect(-17,-9,34,9);g.fillStyle='#8f6a3a';g.fillRect(-11,-15,22,6);   // 2층 판옥
    g.fillStyle='#2b1a10';for(let i=-2;i<=2;i++)g.fillRect(i*7-1.5,-6,3,3);   // 포문
    g.strokeStyle='#d8c39a';g.lineWidth=1.3;g.beginPath();g.moveTo(0,-15);g.lineTo(0,-30);g.stroke();g.fillStyle='#c0392b';g.fillRect(0,-30,10,6);
    g.restore();
    // 장전 표시: 고리
    g.strokeStyle=q.cd>0?'rgba(255,190,120,.85)':'rgba(140,230,180,.9)';g.lineWidth=2.5;g.beginPath();g.arc(x,y+22,6,-Math.PI/2,-Math.PI/2+Math.PI*2*(q.cd>0?1-q.cd:1));g.stroke();};
  const wae=e=>{const s=e.big?1.35:1,x=e.x+Math.sin(t*1.3+e.ph)*e.sw*.25;g.save();g.translate(x,e.y);g.scale(s,s);if(e.hit>0)g.globalAlpha=.55+.45*Math.sin(e.hit*40);
    hull(0,0,30,8,'#2a1c16');g.fillStyle='#e9dfc6';g.fillRect(-1,-24,2,24);g.fillRect(-9,-21,18,13);g.fillStyle='#1d1410';for(let i=0;i<3;i++)g.fillRect(-9,-18+i*4,18,1.2);
    if(e.big){g.fillStyle='#e9dfc6';g.fillRect(-15,-15,9,9);g.fillStyle='#b3261e';g.beginPath();g.arc(0,-14,2.6,0,6.3);g.fill();}
    g.restore();if(e.big&&e.hp>1){g.fillStyle='#ffce8a';g.beginPath();g.arc(x,e.y+16,2.2,0,6.3);g.fill();g.beginPath();g.arc(x+6,e.y+16,2.2,0,6.3);g.fill();}};
  const draw=()=>{g.save();if(shake>0)g.translate((Math.random()-.5)*shake*14,(Math.random()-.5)*shake*10);
    const sg=g.createLinearGradient(0,0,0,H);sg.addColorStop(0,'#0b1d2a');sg.addColorStop(1,'#14394a');g.fillStyle=sg;g.fillRect(-10,-10,W+20,H+20);
    g.strokeStyle='rgba(170,215,230,.09)';g.lineWidth=1;for(let i=0;i<10;i++){const y=(i*43+t*16)%shore;g.beginPath();for(let x=0;x<=W;x+=10)g.lineTo(x,y+Math.sin(x*.05+i*2+t*1.4)*2.5);g.stroke();}
    g.strokeStyle='rgba(255,100,80,.5)';g.setLineDash([6,6]);g.beginPath();g.moveTo(0,shore-4);g.lineTo(W,shore-4);g.stroke();g.setLineDash([]);
    g.fillStyle='#3b3122';g.beginPath();g.moveTo(-10,H+10);g.lineTo(-10,shore+30);for(let x=0;x<=W+10;x+=14)g.lineTo(x,shore+30+Math.sin(x*.08)*4);g.lineTo(W+10,H+10);g.fill();
    guns.forEach(pan);E.forEach(wae);
    B.forEach(b=>{const k=b.k,x=b.x0+(b.x1-b.x0)*k,y=b.y0+(b.y1-b.y0)*k-Math.sin(k*Math.PI)*26;g.fillStyle='#111';g.beginPath();g.arc(x,y,3,0,6.3);g.fill();});
    FX.forEach(f=>{const a=1-f.t/f.d;if(f.k==='boom'){g.fillStyle='rgba(255,'+(140+80*a|0)+',60,'+a+')';g.beginPath();g.arc(f.x,f.y,6+(1-a)*22,0,6.3);g.fill();}
      else{g.strokeStyle='rgba(220,240,255,'+a+')';g.lineWidth=2;g.beginPath();g.arc(f.x,f.y,4+(1-a)*14,0,6.3);g.stroke();}});
    if(msgT>0){g.fillStyle='rgba(255,220,180,'+Math.min(1,msgT*2)+')';g.font='700 14px sans-serif';g.textAlign='center';g.fillText(msg,W/2,shore-14);}
    g.restore();};
  const hud=()=>A.info('포구 '+kmLife(life,LIFE,'■')+' <span>격침 <b>'+sunk+'</b></span>');
  cv.addEventListener('pointerdown',e=>{if(!on)return;e.preventDefault();const [x,y]=kmXY(cv,e);if(y>shore)return;
    const q=guns.filter(q=>q.cd<=0).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];
    if(!q){say('장전 중!');kmS(()=>clk(500,.5));return;}
    q.cd=1;B.push({x0:q.x,y0:shore,x1:x,y1:y,k:0,s:1/(.16+(shore-y)/H*.22)});kmS(()=>{thud(110,.3);noise(.12,.12,0,900);});});
  const end=()=>{on=0;const tr=leak===0?0:leak===1?1:leak<LIFE?2:3;
    A.end(tr,tr===3?'왜선이 포구를 모두 휩쓸었다':'왜선 '+sunk+'척을 가라앉혔다'+(leak?' · 포구 '+leak+'곳을 잃었다':' · 포구를 모두 지켰다'));};
  hud();draw();
  return {go:()=>{on=1;kmLoop(A,dt=>{t+=dt;shake=Math.max(0,shake-dt*2);msgT-=dt;
    if(t<DUR){nx-=dt;if(nx<=0){spawn();nx=1.25-t/DUR*.6;}}
    guns.forEach(q=>{q.cd=Math.max(0,q.cd-dt);});
    B=B.filter(b=>{b.k+=dt*b.s;if(b.k<1)return true;
      const h=E.find(e=>Math.hypot(e.x-b.x1,e.y-b.y1)<(e.big?27:20));
      if(h){h.hp--;h.hit=.25;FX.push({k:'boom',x:b.x1,y:b.y1,t:0,d:.45});kmS(()=>{noise(.3,.22,0,700);thud(70,.25);});
        if(h.hp<=0){h.dead=1;sunk++;hud();}}
      else{FX.push({k:'splash',x:b.x1,y:b.y1,t:0,d:.5});kmS(()=>noise(.18,.08,0,2500));}
      return false;});
    E.forEach(e=>{e.y+=e.vy*dt;e.hit=Math.max(0,e.hit-dt);if(e.y>=shore-4&&!e.dead){e.dead=1;leak++;life--;shake=1;say('포구가 불탄다!');
      FX.push({k:'boom',x:e.x,y:shore,t:0,d:.8});kmS(()=>{noise(.6,.3,0,400);thud(55,.4);});vib(80);hud();}});
    E=E.filter(e=>!e.dead);FX=FX.filter(f=>(f.t+=dt)<f.d);
    A.time(1-t/DUR);draw();
    if(life<=0||(t>=DUR&&!E.length&&!B.length)){end();return false;}});}};}

/* ----- 성벽 수비: 성가퀴 다섯 칸. 사다리에 적이 붙어 오른다. 누르면 떨어진다(갑옷은 두 번) ----- */
function kmWall(A){const st=A.st,N=5,DUR=22,LIFE=4;
  st.innerHTML='<div class="kw">'+Array.from({length:N},(_,k)=>'<button type="button" class="kw-c" data-k="'+k+'" aria-label="'+(k+1)+'번째 성가퀴"><span class="kw-lad"></span><span class="kw-e"><i></i></span></button>').join('')+'</div>';
  const C=[...st.querySelectorAll('.kw-c')].map(el=>({el:el,e:el.querySelector('.kw-e'),on:0,y:0,v:0,hp:0}));
  let t=0,nx=.4,life=LIFE,rep=0,brk=0,on=0;
  const hud=()=>A.info('성벽 '+kmLife(life,LIFE,'■')+' <span>물리침 <b>'+rep+'</b></span>');
  const put=c=>{c.e.style.transform='translateY('+((1-c.y)*100)+'%)';c.el.classList.toggle('on',!!c.on);c.e.classList.toggle('ar',c.hp>1);};
  C.forEach(c=>{c.el.addEventListener('pointerdown',e=>{e.preventDefault();if(!on||!c.on)return;c.hp--;kmS(()=>thud(150,.28));
    if(c.hp<=0){c.on=0;rep++;hud();c.el.classList.add('fall');setTimeout(()=>c.el.classList.remove('fall'),380);kmS(()=>sweep(.3,.05,900,200));}
    else{c.e.classList.add('hit');setTimeout(()=>c.e.classList.remove('hit'),160);}
    put(c);});});
  const spawn=()=>{const F=C.filter(c=>!c.on);if(!F.length)return;const c=F[Math.floor(Math.random()*F.length)];
    c.on=1;c.y=0;c.hp=Math.random()<.16+t/DUR*.22?2:1;c.v=1/Math.max(1.65,3.1-t*.07);put(c);};
  hud();
  return {go:()=>{on=1;kmLoop(A,dt=>{t+=dt;
    if(t<DUR){nx-=dt;if(nx<=0){spawn();nx=Math.max(.42,.95-t*.025);}}
    C.forEach(c=>{if(!c.on)return;c.y+=c.v*dt;if(c.y>=1){c.on=0;brk++;life--;hud();c.el.classList.add('brk');setTimeout(()=>c.el.classList.remove('brk'),500);
      kmS(()=>{noise(.5,.25,0,500);thud(60,.35);});vib(80);}put(c);});
    A.time(1-t/DUR);
    if(life<=0||(t>=DUR&&!C.some(c=>c.on))){on=0;const tr=brk===0?0:brk===1?1:brk<LIFE?2:3;
      A.end(tr,tr===3?'성벽이 무너졌다':'적 '+rep+'명을 떨어뜨렸다'+(brk?' · 성벽이 '+brk+'번 뚫렸다':' · 성벽을 지켰다'));return false;}});}};}

/* ----- 역모 색출: 대신 아홉. 밀서를 주고받는 자가 잠깐 드러났다가 자리가 뒤섞인다. 멈추면 그들을 고른다 ----- */
function kmSpy(A){const st=A.st,N=9,R3=[[2,5,.5],[2,8,.4],[3,10,.32]];
  st.innerHTML='<div class="ks">'+Array.from({length:N},(_,i)=>'<button type="button" class="ks-o" data-i="'+i+'" aria-label="대신"><span class="ks-hat"></span><span class="ks-face"></span><span class="ks-robe"></span><b class="ks-m">密</b></button>').join('')+'<p class="ks-tx" id="ksTx"></p></div>';
  const O=[...st.querySelectorAll('.ks-o')],pos=O.map((_,i)=>i),$tx=st.querySelector('#ksTx');
  const place=()=>O.forEach((o,i)=>{o.style.left=(pos[i]%3)*33.33+'%';o.style.top=Math.floor(pos[i]/3)*33.33+'%';});
  let r=0,got=0,miss=0,pick=null,traitor=[],left=0;
  const hud=()=>A.info('차례 <b>'+Math.min(r+1,3)+'</b>/3 <span>찾아냄 <b>'+got+'</b> · 무고 <b>'+miss+'</b></span>');
  place();hud();$tx.textContent='드러난 자들을 눈으로 따라가라.';
  O.forEach((o,i)=>o.addEventListener('click',()=>{if(!pick||o.classList.contains('dn'))return;o.classList.add('dn');
    if(traitor.includes(i)){got++;o.classList.add('tr');kmS(()=>{thud(120,.3);tone(990,'triangle',.12,.08);});}else{miss++;o.classList.add('no');kmS(()=>tone(180,'sawtooth',.2,.08));}
    left--;hud();if(left<=0)pick(),pick=null;}));
  const wait=(ms,f)=>setTimeout(()=>{if(A.alive())f();},ms);
  const round=()=>{const [k,sw,sp]=R3[r];O.forEach(o=>o.classList.remove('dn','tr','no','show','lost'));st.querySelector('.ks').style.setProperty('--sp',sp+'s');
    const ids=O.map((_,i)=>i).sort(()=>Math.random()-.5);traitor=ids.slice(0,k);
    $tx.textContent='밀서가 오간다…';traitor.forEach(i=>O[i].classList.add('show'));kmS(()=>tone(330,'sine',.6,.08));
    wait(1500,()=>{traitor.forEach(i=>O[i].classList.remove('show'));$tx.textContent='대신들이 자리를 바꾼다';let n=0;
      const swap=()=>{if(n++>=sw){$tx.textContent='역모에 가담한 자 '+k+'명을 골라라';left=k;A.time(1-(r+.5)/3);
          pick=()=>{r++;hud();A.time(1-r/3);traitor.forEach(i=>{if(!O[i].classList.contains('tr'))O[i].classList.add('show','lost');});if(r<3)wait(1100,round);else{const tr=got>=7?0:got===6?1:got===5?2:3;
            A.end(tr,'역모 가담자 '+got+'명을 찾아냈다'+(miss?' · 무고한 대신 '+miss+'명을 의심했다':''));}};return;}
        const a=Math.floor(Math.random()*N);let b=Math.floor(Math.random()*(N-1));if(b>=a)b++;const x=pos[a];pos[a]=pos[b];pos[b]=x;place();
        kmS(()=>clk(1400,.25));wait(sp*1000+40,swap);};
      wait(350,swap);});};
  return {go:()=>{A.time(1);round();}};}

/* ----- 봉기 진무: 도 다섯의 민심이 끓는다. 누르면 쌀 한 섬으로 크게 가라앉힌다. 창고는 1.6초마다 한 섬 ----- */
function kmRiot(A){const st=A.st,NM=['경기','충청','전라','경상','평안'],DUR=22,LIFE=3,MX=8;
  st.innerHTML='<div class="kr-rice" id="krRice"></div><div class="kr">'+NM.map((n,k)=>'<button type="button" class="kr-c" data-k="'+k+'"><span class="kr-g"><i></i></span><b>'+n+'</b><small></small></button>').join('')+'</div>';
  const C=[...st.querySelectorAll('.kr-c')].map((el,k)=>({el:el,i:el.querySelector('.kr-g i'),s:el.querySelector('small'),h:10+Math.random()*30,r:3.6+Math.random()*2.4,flash:0}));
  let t=0,rice=6,rt=0,life=LIFE,up=0,on=0,surge=3;
  const $r=st.querySelector('#krRice');
  const hud=()=>{A.info('민심 '+kmLife(life,LIFE,'■')+' <span>봉기 <b>'+up+'</b></span>');$r.innerHTML='창고 '+Array.from({length:MX},(_,i)=>'<i'+(i<rice?' class="on"':'')+'></i>').join('');};
  const put=c=>{c.i.style.height=Math.min(100,c.h)+'%';c.el.classList.toggle('hot',c.h>=70);c.s.textContent=c.h>=85?'봉기 직전':c.h>=60?'술렁임':c.h>=30?'불만':'평온';};
  C.forEach(c=>{c.el.addEventListener('pointerdown',e=>{e.preventDefault();if(!on)return;if(rice<1){kmS(()=>clk(500,.5));$r.classList.add('emp');setTimeout(()=>$r.classList.remove('emp'),300);return;}
    rice--;c.h=Math.max(0,c.h-42);kmS(()=>{tone(620,'triangle',.12,.08);noise(.1,.05,0,3000);});c.el.classList.add('give');setTimeout(()=>c.el.classList.remove('give'),250);put(c);hud();});put(c);});
  hud();
  return {go:()=>{on=1;kmLoop(A,dt=>{t+=dt;rt+=dt;if(rt>=1.6){rt-=1.6;if(rice<MX){rice++;hud();}}
    surge-=dt;if(surge<=0&&t<DUR){surge=2.6+Math.random()*2.2;const c=C[Math.floor(Math.random()*C.length)];c.h+=22;c.el.classList.add('sg');setTimeout(()=>c.el.classList.remove('sg'),500);kmS(()=>tone(196,'sawtooth',.25,.06));}
    C.forEach(c=>{c.h+=(c.r+t*.2)*dt;if(c.h>=100){c.h=35;life--;up++;hud();c.el.classList.add('brk');setTimeout(()=>c.el.classList.remove('brk'),600);kmS(()=>{noise(.5,.25,0,600);thud(60,.35);});vib(80);}put(c);});
    A.time(1-t/DUR);
    if(life<=0||t>=DUR){on=0;const tr=up===0?0:up===1?1:up<LIFE?2:3;A.end(tr,tr===3?'봉기가 걷잡을 수 없이 번졌다':up?'봉기가 '+up+'번 일어났지만 가라앉혔다':'봉기 없이 민심을 다독였다');return false;}});}};}

/* ----- 담판: 바늘이 오가는 막대 위의 금빛 칸(우리 몫). 칸 안에서 멈추면 1점, 한가운데면 2점. 네 차례 ----- */
function kmTalk(A){const st=A.st,RD=[['명분',.26,1.5],['실리',.2,1.25],['기한',.15,1.02],['최후 통첩',.11,.84]];
  st.innerHTML='<div class="kt"><div class="kt-k" id="ktK"></div><div class="kt-bar"><span class="kt-z" id="ktZ"><i></i></span><span class="kt-n" id="ktN"></span></div>'+
    '<div class="kt-sc" id="ktSc"></div><button type="button" class="kt-b" id="ktB">지금! <small>스페이스</small></button></div>';
  const $=id=>st.querySelector('#'+id);let r=-1,c=.5,w=.26,per=1.5,ph=0,on=0,pts=0,res=[],t=0;
  const hud=()=>{A.info('차례 <b>'+Math.max(1,Math.min(r+1,4))+'</b>/4 <span>얻은 몫 <b>'+pts+'</b>/8</span>');$('ktSc').innerHTML=RD.map((d,i)=>'<span class="'+(res[i]==null?'':'r'+res[i])+'">'+d[0]+(res[i]==null?'':res[i]===2?' 정곡':res[i]===1?' 얻음':' 놓침')+'</span>').join('');};
  const pos=()=>{const u=(ph/per)%2;return u<1?u:2-u;};
  const next=()=>{r++;if(r>=4){on=0;const tr=pts>=7?0:pts>=5?1:pts>=3?2:3;A.end(tr,tr===0?'상대가 우리 요구를 거의 다 받아들였다':tr===3?'담판에서 밀려 굴욕적인 조건을 받았다':'몫 '+pts+'/8을 지켜 냈다');return;}
    w=RD[r][1];per=RD[r][2];c=w/2+.05+Math.random()*(.9-w);ph=Math.random()*per;t=0;$('ktK').textContent=RD[r][0];
    const z=$('ktZ');z.style.left=(c-w/2)*100+'%';z.style.width=w*100+'%';on=1;hud();};
  const hit=()=>{if(!on)return;on=0;const d=Math.abs(pos()-c),s=d<=w*.16?2:d<=w/2?1:0;res[r]=s;pts+=s;
    kmS(()=>s===2?SFX.coin():s?tone(660,'triangle',.15,.1):tone(160,'sawtooth',.3,.1));$('ktN').classList.add('st');setTimeout(()=>{if(!A.alive())return;$('ktN').classList.remove('st');next();},750);hud();};
  $('ktB').addEventListener('pointerdown',e=>{e.preventDefault();hit();});
  const kd=e=>{if(!A.alive()){document.removeEventListener('keydown',kd);return;}if(e.key===' '||e.key==='Enter'){e.preventDefault();hit();}};
  hud();$('ktN').style.left='50%';
  return {go:()=>{document.addEventListener('keydown',kd);next();try{$('ktB').focus({preventScroll:true});}catch(e){}
    kmLoop(A,dt=>{if(on){ph+=dt;t+=dt;$('ktN').style.left=pos()*100+'%';if(t>4.5){res[r]=0;on=0;hud();setTimeout(()=>{if(A.alive())next();},500);}}
      A.time(1-(Math.max(0,r)+(on?Math.min(1,t/4.5):1))/4);if(r>=4){document.removeEventListener('keydown',kd);return false;}});}};}
