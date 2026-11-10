/* ---------- 미니게임 「대통령 출근길」: 끝없는 길 건너기 ----------
   메인 메뉴 기록 보관소의 내 이름을 2.5초 안에 다섯 번 누르면 열린다(게임 → 미니게임에서도 할 수 있다).
   관저를 나선 대통령이 한 칸씩 깡충 뛰어 광장 · 차도 · 인도 · 한강 · 철길을 건너 끝없이 출근한다.
   · 차도: 택시 · 구급차 · 버스 · 방역차. 철길: 빨간 불이 깜빡이면 곧 고속열차. 닿으면 끝.
   · 인도: 기침하는 확진자. 닿으면 감염(끝). 마스크를 주워 두면 한 번 막아 준다(하나만 들 수 있다).
   · 한강: 오리배 · 뗏목 · 구조 보트를 밟고 건넌다. 물에 빠지거나 판 밖으로 떠내려가면 끝.
   · 머뭇거리면 뒤에서 기자단이 따라온다(화면이 저절로 올라간다). 화면 아래로 밀려나면 붙잡힌다.
   · 길은 판마다 새로 만든다. 광장(풀밭)에는 늘 지나갈 길이 하나 이상 남는다. 50칸마다 서울의 이름난 곳을 지난다.
   · 정해진 간격 없이 가끔 왕복 8~24차선 큰길이 나온다(아래 절반은 오른쪽, 위 절반은 왼쪽으로 달리고 가운데 두 줄은 중앙버스전용차로).
     멀리 갈수록 더 넓은 길까지 나온다. 5~10줄 내리 풀밭인 「쉼터」(나무 · 벤치)도 아무 때나 나와 잠깐 숨을 고를 수 있다.
     큰길 한가운데에 50칸이 걸리면 그 칸의 명소 광장은 큰길을 다 건넌 뒤 첫 줄로 미룬다.
   판은 가로 9칸. 좌표는 칸 단위(왼쪽 끝 0, 칸 c의 가운데 c+.5), 줄 r은 관저 앞이 0이고 위로 갈수록 커진다.
   기록: 가장 멀리 간 줄 수(칸). 10칸 이상 간 판은 명예의 전당에 오른다. 이 기기의 기록은 MEM.cg. */
const CG_C=9,CG_M=8,CG_L=CG_C+CG_M*2,CG_HOP=.13;
const CG_PL=['광화문 광장','시청 앞 광장','서울역 앞','여의도 공원','국회 앞','남산 아래','청계천 길','세종로 네거리'];
const CG_CAR={taxi:{n:'택시',len:1,sp:1},amb:{n:'구급차',len:2,sp:1.35},bus:{n:'버스',len:3,sp:.75},dis:{n:'방역차',len:2,sp:.9}};
function cgMem(){let m=MEM.cg;if(!m||m.v!==1)m=MEM.cg={v:1,best:0,runs:0,masks:0,bestS:0};return m;}
// 판마다 새 길(시험할 때 같은 길을 다시 만들 수 있게 씨앗을 쓴다)
function cgRng(s){return ()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
// 한 줄을 도는 것들(차 · 확진자 · 배)은 길이 CG_L 고리를 돈다. 판 밖 양옆 CG_M칸은 보이지 않는 곳
const cgWrap=(o,v,t)=>{const p=(o+v*t)%CG_L;return (p<0?p+CG_L:p)-CG_M;};
const cgHs=(a,b)=>{let h=Math.imul(a*374761393+b*668265263|0,1274126177);h^=h>>>13;h=Math.imul(h,1103515245);return ((h^h>>>16)>>>0)/4294967296;};
function cgOpen(back){if(document.getElementById('cg'))return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);back=back||home;
  try{bgmSet(BGM.trk,false);}catch(e){}
  const w=document.createElement('div');w.id='cg';w.className='cg';w.setAttribute('role','dialog');w.setAttribute('aria-label','대통령 출근길');
  w.innerHTML='<canvas id="cgC"></canvas><div class="cg-hud"><button type="button" class="cg-x" id="cgX" aria-label="미니게임으로">✕</button>'+
    '<div class="cg-mid"><b id="cgS">0</b><small><span id="cgB"></span><span id="cgK"></span></small></div>'+
    '<div class="cg-r"><button type="button" class="cg-p" id="cgP" aria-label="일시정지"><i></i><i></i></button></div></div>'+
    '<div class="cg-ban" id="cgBan" aria-live="polite"></div><div class="cg-ov" id="cgOv"></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id),cv=$('cgC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),FF=getComputedStyle(document.body).fontFamily;
  const RR=(a,b,c,d,r)=>{g.beginPath();if(g.roundRect)g.roundRect(a,b,c,d,Math.max(0,Math.min(r,c/2,d/2)));else g.rect(a,b,c,d);};
  const tm=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  const snd=f=>{try{f();}catch(e){}};
  // ----- 상태 -----
  let st='brief',seed=0,rnd=Math.random,R={},gHi=-1,segT='g',segN=0,sinceG=0,pathC=4,lastW=1,Q=[],lastBig=-999,lastPark=-999,nextLm=50,
    T=0,tt=0,P=null,hop=null,qd=null,maxR=0,camY=0,started=false,shield=0,inv=0,masks=0,cause='',deadT=0,god=false,
    FX=[],POP=[],run=0,shake=0,bump=0,live=true,prev=0,raf=0,banT=0,hudK='',pst='run',danger=0,deadAt=null;
  const WALL={t:'x'};
  /* ----- 길 만들기 ----- */
  const dif=r=>Math.min(1,r/320),lerp=(a,b,k)=>a+(b-a)*k,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
  // 광장: 가로수 · 바리케이드 · 화분. 지난 광장의 길 칸(pathC)에서 새 길 칸까지는 비워 두어 늘 지나갈 수 있다
  // ex.pk: 쉼터 줄(1=첫 줄), ex.sg: 줄 가운데 도로명판. 쉼터에는 나무 · 벤치 · 화분만 둔다
  const grass=(r,dens,lm,ex)=>{ex=ex||{};const np=Math.max(0,Math.min(CG_C-1,pathC+ri(-2,2))),lo=Math.min(pathC,np),hi=Math.max(pathC,np),b=[];
    for(let c=0;c<CG_C;c++)b.push((c>=lo&&c<=hi)||rnd()>=dens?0:ex.pk?(rnd()<.45?4:rnd()<.6?1:3):(rnd()<.55?1:rnd()<.6?2:3));pathC=np;
    const row={t:'g',b:b,lm:lm||'',mk:-1,pk:ex.pk||0,sg:ex.sg||''};if(r>4&&rnd()<.09){const f=[];b.forEach((v,c)=>{if(!v)f.push(c);});row.mk=f[Math.floor(rnd()*f.length)];}return row;};
  // 왕복 L차선 큰길의 한 줄(i=0..L-1). 우측 통행이라 아래 절반은 오른쪽, 위 절반은 왼쪽으로 달린다.
  // 가운데 두 줄은 중앙버스전용차로(버스만). ln은 그 줄 위쪽 경계선: y=노란 중앙선, b=파란 버스차로 선
  const CG_RD=['세종대로','강남대로','테헤란로','올림픽대로','강변북로','여의대로','한강대로','을지로','종로','경부고속도로'];
  const roadBig=(r,i,L)=>{const h=L/2,d=dif(r),dir=i<h?1:-1,bus=i===h-1||i===h,ks=['taxi','taxi','taxi','amb','dis','bus'],k=bus?'bus':ks[Math.floor(rnd()*ks.length)],K=CG_CAR[k],o=[],o0=rnd()*CG_L,
      v=(bus?1.75+1.6*d+rnd()*.4:(1.15+2.2*d+rnd()*1.1)*K.sp)*dir,n=Math.max(1,Math.round(CG_L/(K.len+lerp(bus?7.5:6.9,bus?4.4:3.6,d)+rnd()*1.6))),s=CG_L/n,j=Math.max(0,s-K.len-2.6);
    for(let q=0;q<n;q++)o.push({o:o0+q*s+(rnd()-.5)*j*.5,len:K.len,k:k});return {t:'r',v:v,o:o,big:i+1,bn:L,bus:bus?1:0,ln:i===h-1?'y':i===h-2||i===h?'b':''};};
  const park=r=>{const n=ri(5,10);lastPark=r+n;for(let i=0;i<n;i++)Q.push({t:'g',d:i===0?.06:.12,ex:{pk:i===0?1:2}});};
  const lane=(t,r)=>{const d=dif(r),dir=rnd()<.5?1:-1,o=[],o0=rnd()*CG_L;
    if(t==='r'){const ks=['taxi','taxi','amb','bus','dis'],k=ks[Math.floor(rnd()*ks.length)],K=CG_CAR[k],v=(1.25+2.5*d+rnd()*1.1)*K.sp*dir,
        n=Math.max(1,Math.round(CG_L/(K.len+lerp(6.5,3.1,d)+rnd()*1.6))),s=CG_L/n,j=Math.max(0,s-K.len-2.6);
      for(let i=0;i<n;i++)o.push({o:o0+i*s+(rnd()-.5)*j*.5,len:K.len,k:k});return {t:'r',v:v,o:o};}
    if(t==='p'){const v=(.45+.75*d+rnd()*.45)*dir,n=Math.max(1,Math.round(CG_L/(.7+lerp(4.4,2.1,d)+rnd()*1.2))),s=CG_L/n,j=Math.max(0,s-2.3);
      for(let i=0;i<n;i++)o.push({o:o0+i*s+(rnd()-.5)*j*.5,len:.7,k:ri(0,3)});return {t:'p',v:v,o:o,mk:rnd()<.14?ri(0,CG_C-1):-1};}
    if(t==='w'){lastW=-lastW;const q=rnd(),k=q<.4?'duck':q<.75?'raft':'boat',len=k==='raft'?3:2,v=(.75+1.05*d+rnd()*.45)*lastW,
        n=Math.max(2,Math.round(CG_L/(len+lerp(1.3,2.7,d)+rnd()*.7))),s=CG_L/n;
      for(let i=0;i<n;i++)o.push({o:o0+i*s+(rnd()-.5)*.4,len:len,k:k});return {t:'w',v:v,o:o};}
    const Pd=lerp(7.5,4.2,d)+rnd()*3;return {t:'t',P:Pd,ph:rnd()*Pd,v:34*dir,len:14,hn:-1};};
  const pick=r=>{const d=dif(r);
    // 큰길: 20칸부터, 앞 큰길을 건넌 뒤 15칸 넘게 지나면 줄을 고를 때마다 운으로. 차선 수는 왕복 8~24 중 무작위(멀리 갈수록 넓은 길까지)
    if(r>=20&&r-lastBig>=15&&rnd()<.04+.05*d){const mx=Math.min(12,4+Math.floor(r/30)),L=2*ri(4,mx);lastBig=r+L;
      Q.push({t:'g',d:0,ex:{sg:CG_RD[Math.floor(rnd()*CG_RD.length)]+' · 왕복 '+L+'차선'}});for(let i=0;i<L;i++)Q.push({t:'R',i:i,L:L});segT='r';segN=0;return;}
    if(sinceG>=5){segT='g';segN=1;return;}
    const Wt=[['g',2.2-d],['r',3+1.6*d],['p',1.2],['w',1.4+.9*d],['t',.6+.7*d]].filter(x=>x[0]!==segT&&(r>=8||(x[0]!=='w'&&x[0]!=='t')));
    let s=Wt.reduce((a,x)=>a+x[1],0)*rnd(),k='r';for(const x of Wt){s-=x[1];if(s<=0){k=x[0];break;}}
    if(k==='g'&&r>=10&&r-lastPark>=8&&rnd()<.45){park(r);segT='g';segN=0;return;}
    segT=k;segN=k==='g'?ri(1,2):k==='r'?ri(1,2+Math.round(2*d)):k==='w'?ri(1,2+Math.round(d)):ri(1,2);if(k==='w')lastW=rnd()<.5?1:-1;};
  const gen=r=>{if(r<3)return grass(r,0,'');
    // 50칸마다 명소 광장. 큰길을 건너는 중이면 다 건넌 뒤 첫 줄로 미룬다
    if(r>=nextLm&&!(Q.length&&(Q[0].t==='R'||Q[0].ex.sg))){const k=nextLm/50-1;nextLm+=50;sinceG=0;if(Q.length&&Q[0].ex.pk){const q=Q.shift();if(Q.length&&Q[0].ex&&Q[0].ex.pk)Q[0].ex.pk=q.ex.pk;}return grass(r,0,CG_PL[k%CG_PL.length]);}
    if(!Q.length&&segN<=0)pick(r);
    if(Q.length){const q=Q.shift();if(q.t==='g'){sinceG=0;return grass(r,q.d,'',q.ex);}sinceG++;return roadBig(r,q.i,q.L);}
    segN--;if(segT==='g'){sinceG=0;return grass(r,.16+.16*dif(r),'');}
    sinceG++;return lane(segT,r);};
  const row=r=>{if(r<0)return WALL;while(gHi<r){gHi++;R[gHi]=gen(gHi);}return R[r]||WALL;};
  /* ----- 위험 판정 ----- */
  const train=(rw,t)=>{const m=((t+rw.ph)%rw.P+rw.P)%rw.P,dur=(CG_L+rw.len)/Math.abs(rw.v);if(m>=dur)return null;
    const a=rw.v>0?-CG_M-rw.len+rw.v*m:CG_C+CG_M+rw.v*m;return [a,a+rw.len];};
  const warn=(rw,t)=>{const m=((t+rw.ph)%rw.P+rw.P)%rw.P;return m<(CG_L+rw.len)/Math.abs(rw.v)||m>rw.P-1.6;};
  const hit=(rw,x,t)=>{if(rw.t==='r'){for(const c of rw.o){const a=cgWrap(c.o,rw.v,t);if(x+.3>a+.08&&x-.3<a+c.len-.08)return c;}}
    else if(rw.t==='p'){for(const c of rw.o){const a=cgWrap(c.o,rw.v,t);if(x+.26>a+.06&&x-.26<a+c.len-.06)return c;}}
    else if(rw.t==='t'){const q=train(rw,t);if(q&&x+.3>q[0]&&x-.3<q[1])return {k:'train'};}
    return null;};
  const raftAt=(rw,x,t)=>{for(const c of rw.o){const a=cgWrap(c.o,rw.v,t);if(x>a-.12&&x<a+c.len+.12)return c;}return null;};
  /* ----- 화면 맞추기: 가로 9칸이 꽉 차게(넓은 화면은 높이 12.5줄 기준), 양옆은 판 밖 ----- */
  let W=0,H=0,cs=40,ox=0,VR=20;
  const fit=()=>{W=w.clientWidth;H=w.clientHeight;cv.width=Math.round(W*D);cv.height=Math.round(H*D);cv.style.width=W+'px';cv.style.height=H+'px';
    cs=Math.max(24,Math.min(84,W/(CG_C+.6),H/12.5));ox=Math.round((W-CG_C*cs)/2);VR=H/cs;};
  const lead=()=>Math.min(VR*.3,4.6);   // 대통령 아래로 보이는 줄 수
  const sx=x=>ox+x*cs,sy=r=>H-(r+1-camY)*cs;
  /* ----- 화면 윗줄 · 알림 ----- */
  const hud=()=>{const m=cgMem(),k=maxR+'|'+shield+'|'+m.best;if(k===hudK)return;hudK=k;$('cgS').textContent=maxR;
    $('cgB').innerHTML='최고 <b>'+Math.max(m.best,maxR)+'</b>';$('cgK').innerHTML=shield?'<b class="on">😷 마스크</b>':'';};
  const ov=h=>{$('cgOv').innerHTML=h;$('cgOv').style.display=h?'flex':'none';};
  const ban=(s,sub)=>{const b=$('cgBan');b.innerHTML='<b>'+s+'</b>'+(sub?'<span>'+sub+'</span>':'');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');banT=2;};
  const pop=(s,x,r,c)=>{if(POP.length<14)POP.push({s:s,x:x,r:r,c:c||'#fff',l:1});};
  const burst=(x,r,n,c,sp)=>{for(let i=0;i<n&&FX.length<220;i++){const a=Math.random()*6.283,v=(sp||4)*(.3+Math.random());FX.push({x:x,r:r,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.45+Math.random()*.45,c:c});}};
  /* ----- 한 판 ----- */
  const reset=s=>{run++;seed=s==null?(Math.random()*2147483647)|0:s;rnd=cgRng(seed);R={};gHi=-1;segT='g';segN=0;sinceG=0;pathC=4;lastW=1;Q=[];lastBig=-999;lastPark=-999;nextLm=50;
    T=0;tt=0;P={x:4.5,r:0,f:'u'};hop=null;qd=null;maxR=0;started=false;shield=0;inv=0;masks=0;cause='';FX=[];POP=[];danger=0;deadAt=null;hudK='';
    camY=-lead();row(40);hud();};
  const start=s=>{try{aInit();SFX.click();}catch(e){}ov('');reset(s);st='run';ban('출근!','관저를 나선다 · 앞으로 깡충');};
  const NM={car:c=>(CG_CAR[c.k]||{n:'차'}).n+'에 치였다',walk:()=>'기침하는 확진자에게 감염됐다',water:()=>'한강에 빠졌다',drift:()=>'강물에 떠내려갔다',train:()=>'고속열차에 치였다',press:()=>'기자단에게 붙잡혔다',quit:()=>'출근을 그만뒀다'};
  const die=(k,o)=>{if(st!=='run'||god&&k!=='quit')return;st='dead';cause=NM[k](o||{});deadT=k==='quit'?.01:1.35;
    const x=hop?lerp(hop.fx,hop.tx,Math.min(1,hop.t)):P.x,r=hop?lerp(hop.fr,hop.tr,Math.min(1,hop.t)):P.r;deadAt={k:k,x:x,r:r,t:0};hop=null;qd=null;
    if(k==='quit')return;shake=.4;vib(k==='press'?[30,40,30]:50);
    if(k==='water'||k==='drift'){burst(x,r,24,'#bfe3ff',3.5);snd(()=>{tone(180,'sine',.35,.08,0,60);tone(520,'triangle',.18,.04,.05,200);});}
    else if(k==='walk'){burst(x,r,22,'#9fd68b',3);pop('감염!',x,r+.7,'#b8f0a0');snd(()=>tone(240,'sawtooth',.3,.06,0,110));}
    else if(k==='press'){pop('찰칵! 찰칵!',x,r+.9,'#fff');snd(()=>[0,.12,.2,.34].forEach(d=>tone(1800,'square',.03,.05,d)));}
    else{burst(x,r,26,'#ffd27a',5);pop('쾅!',x,r+.8,'#ffb0a8');snd(()=>{tone(110,'sawtooth',.3,.09,0,50);tone(330,'square',.12,.05);});}};
  // 한 칸 뛰기. 뛰는 중에 또 누르면 하나는 기억했다가 내리자마자 뛴다
  const tryHop=(dx,dr)=>{if(st!=='run')return;if(hop){qd=[dx,dr];return;}
    const tr=P.r+dr,to=row(tr);P.f=dr>0?'u':dr<0?'d':dx<0?'l':'r';
    if(to.t==='x'){bump=.14;return;}
    let tx;if(to.t==='w'){tx=P.x+dx;if(tx<.15||tx>CG_C-.15){bump=.14;return;}}
    else{const c=Math.floor(P.x)+dx;if(c<0||c>=CG_C||(to.t==='g'&&to.b[c])){bump=.14;snd(()=>tone(150,'triangle',.05,.04));return;}tx=c+.5;}
    hop={fx:P.x,fr:P.r,tx:tx,tr:tr,t:0};started=true;snd(()=>tone(dr>0?620:520,'triangle',.05,.035));};
  const land=()=>{const h=hop;hop=null;P.x=h.tx;P.r=h.tr;const rw=row(P.r);
    if(P.r>maxR){maxR=P.r;if(rw.lm){ban(rw.lm,maxR+'칸 지점');snd(()=>[523,659,784].forEach((f,i)=>tone(f,'triangle',.2,.07,i*.08)));burst(P.x,P.r,24,'#f2c94c',5);}
      else if(rw.pk===1)pop('쉼터 · 잠깐 숨 고르기',P.x,P.r+.9,'#c8f5b0');
      else if(row(P.r-1).big&&row(P.r-1).big===row(P.r-1).bn){pop(row(P.r-1).bn+'차선 건넜다!',P.x,P.r+.9,'#ffe08a');burst(P.x,P.r,16,'#f2c94c',4);snd(()=>[659,880].forEach((f,i)=>tone(f,'triangle',.15,.06,i*.07)));}
      else if(maxR%25===0){pop(maxR+'칸!',P.x,P.r+.9,'#ffe08a');}}
    if((rw.t==='g'||rw.t==='p')&&rw.mk>=0&&Math.floor(P.x)===rw.mk){rw.mk=-1;masks++;
      if(shield){pop('마스크 하나 더(이미 쓰고 있다)',P.x,P.r+.8,'#cfefff');}else{shield=1;pop('마스크 착용!',P.x,P.r+.8,'#9fe3ff');}
      burst(P.x,P.r,12,'#bfeaff',3);snd(()=>{tone(1320,'triangle',.12,.07);tone(1760,'triangle',.12,.05,.06);});}
    if(rw.t==='w'&&!raftAt(rw,P.x,T)){die('water');return;}
    if(qd){const q=qd;qd=null;tryHop(q[0],q[1]);}};
  const step=dt=>{if(banT>0){banT-=dt;if(banT<=0)$('cgBan').classList.remove('on');}if(shake>0)shake=Math.max(0,shake-dt);if(bump>0)bump=Math.max(0,bump-dt);if(inv>0)inv-=dt;
    for(const p of FX){p.x+=p.vx*dt;p.r+=p.vy*dt;p.vx*=.9;p.vy*=.9;p.l-=dt;}FX=FX.filter(p=>p.l>0);
    for(const p of POP){p.r+=dt*.9;p.l-=dt*.85;}POP=POP.filter(p=>p.l>0);
    if(st==='dead'){deadT-=dt;if(deadAt)deadAt.t+=dt;T+=dt;if(deadT<=0)end();return;}
    if(st!=='run'){T+=dt*.6;return;}
    T+=dt;if(started)tt+=dt;
    if(hop){const fr=row(hop.fr);if(fr.t==='w'&&hop.tr===hop.fr){hop.fx+=fr.v*dt;hop.tx+=fr.v*dt;}hop.t+=dt/CG_HOP;if(hop.t>=1){land();if(st!=='run')return;}}
    else{const rw=row(P.r);if(rw.t==='w'){P.x+=rw.v*dt;if(P.x<.08||P.x>CG_C-.08){die('drift');return;}}}
    // 부딪힘: 뛰는 중이면 반을 넘기 전에는 떠난 줄, 넘은 뒤에는 닿을 줄
    const k=hop?Math.min(1,hop.t):1,cr=hop?(k<.5?hop.fr:hop.tr):P.r,cx=hop?lerp(hop.fx,hop.tx,k):P.x,rw=row(cr),o=hit(rw,cx,T);
    if(o){if(rw.t==='p'){if(inv<=0){if(shield){shield=0;inv=1.2;pop('마스크가 막았다!',cx,cr+.8,'#9fe3ff');burst(cx,cr,14,'#bfeaff',3);snd(()=>tone(880,'sine',.2,.07));}else{die('walk');return;}}}
      else{die(rw.t==='t'?'train':'car',o);return;}}
    // 기차 경적: 보이는 철길에 빨간 불이 켜지는 순간 한 번
    for(let r=Math.floor(camY);r<camY+VR;r++){const q=row(r);if(q.t==='t'){const on=warn(q,T),c=Math.floor((T+q.ph)/q.P);if(on&&q.hn!==c&&!train(q,T)){q.hn=c;if(Math.abs(r-P.r)<7)snd(()=>{tone(392,'sawtooth',.45,.035);tone(494,'sawtooth',.45,.03);});}}}
    // 화면: 대통령을 따라 올라가고, 한 번 뛴 뒤로는 기자단이 쫓아와 저절로 조금씩 올라간다
    const pr=hop?lerp(hop.fr,hop.tr,k):P.r,want=pr-lead();if(want>camY)camY+=(want-camY)*Math.min(1,dt*6);
    if(started)camY+=(.3+.5*dif(maxR))*dt;danger=Math.max(0,Math.min(1,(2.3-(pr+.5-camY))/2.3));
    if(pr+.55<camY){die('press');return;}
    row(Math.ceil(camY+VR)+3);for(const key in R){if(+key<camY-40)delete R[key];}
    hud();};
  /* ----- 한 판 끝 ----- */
  const end=()=>{if(st==='end')return;const quit=deadAt&&deadAt.k==='quit';st='end';const m=cgMem();m.runs++;const nb=maxR>m.best;
    if(nb){m.best=maxR;m.bestS=Math.round(tt*10)/10;}m.masks=(m.masks||0)+masks;msave();
    // 시험(window.__cgDbg) 판 · 10칸도 못 간 판은 보내지 않는다
    if(!window.__cgDbg&&maxR>=10&&tt>=4)sendArcade('cg',{score:maxR,sec:Math.round(tt*10)/10,win:false,detail:(maxR+'칸 · '+cause+' · '+tm(tt)).slice(0,80)});
    if(nb&&maxR>=10)snd(()=>[784,988,1175,1568].forEach((f,i)=>tone(f,'triangle',.4,.09,i*.1)));
    const my=run;setTimeout(()=>{if(!live||my!==run||st!=='end')return;
      ov('<div class="cg-card"><span class="cg-k">'+(nb&&maxR>0?'최고 기록!':quit?'출근 중단':'출근 실패')+'</span><h2>'+cause+'</h2>'+
        '<div class="cg-big">'+maxR+'<small>칸</small></div>'+
        '<div class="cg-b"><span>최고 <b>'+m.best+'칸</b></span><span>걸린 시간 <b>'+tm(tt)+'</b></span><span>주운 마스크 <b>'+masks+'</b></span></div>'+
        (maxR<10?'<p class="cg-note">10칸 넘게 가면 명예의 전당에 올라요.</p>':'')+
        '<button type="button" class="pri" id="cgAg">다시 출근</button><button type="button" id="cgOut">미니게임으로</button></div>');
      $('cgAg').onclick=()=>start();$('cgOut').onclick=close;setTimeout(()=>{const b=$('cgAg');if(b)try{b.focus({preventScroll:true});}catch(e){}},60);},quit?60:500);};
  /* ----- 안내 · 쉬기 ----- */
  const brief=()=>{st='brief';const m=cgMem();if(gHi<0)reset();ov('<div class="cg-card"><span class="cg-k">미니게임 · 끝없는 길 건너기</span><h2>대통령 출근길</h2>'+
    '<p class="cg-s">관저를 나선 대통령. 차도와 한강, 철길을 건너 오늘도 출근한다. 멀리 갈수록 높은 기록.</p>'+
    '<ul><li><b>누르면 앞으로 한 칸</b> 깡충. 밀면 그 방향으로. 키보드는 <b>방향키 · WASD · 스페이스</b>.</li>'+
    '<li>차도의 <b>택시 · 구급차 · 버스 · 방역차</b>, 철길의 <b>고속열차</b>를 피한다. 빨간 불이 깜빡이면 열차가 온다.</li>'+
    '<li><b>한강</b>은 오리배 · 뗏목을 밟고 건넌다. 물에 빠지거나 판 밖으로 떠내려가면 끝.</li>'+
    '<li>인도의 <b>기침하는 확진자</b>에 닿으면 감염. <b>마스크</b>를 주우면 한 번 막아 준다.</li>'+
    '<li>가끔 <b>왕복 8~24차선 큰길</b>이 나온다. 풀밭이 길게 이어진 <b>쉼터</b>에서는 잠깐 숨을 고를 수 있다.</li>'+
    '<li>머뭇거리면 뒤에서 <b>기자단</b>이 따라잡는다. 50칸마다 서울의 이름난 곳을 지난다.</li></ul>'+
    '<div class="cg-b"><span>최고 <b>'+(m.best||0)+'칸</b></span><span>출근 <b>'+(m.runs||0)+'번</b></span></div>'+
    '<button type="button" class="pri" id="cgGo">출근하기</button><button type="button" id="cgBack">미니게임으로</button></div>');
    $('cgGo').onclick=()=>start();$('cgBack').onclick=close;setTimeout(()=>{const b=$('cgGo');if(b)try{b.focus({preventScroll:true});}catch(e){}},60);};
  const pause=on=>{if(on&&(st==='run')){pst=st;st='pause';ov('<div class="cg-card sm"><span class="cg-k">잠깐</span><h2>쉬는 중</h2><p class="cg-s">'+maxR+'칸 · '+tm(tt)+'</p>'+
      '<button type="button" class="pri" id="cgRe">계속하기</button><button type="button" id="cgQ">그만두기</button></div>');
      $('cgRe').onclick=()=>pause(false);$('cgQ').onclick=()=>{ov('');st=pst;die('quit');};}
    else if(!on&&st==='pause'){ov('');st=pst;prev=performance.now();}};
  const close=()=>{try{SFX.back();}catch(e){}live=false;cancelAnimationFrame(raf);w.remove();document.body.style.overflow='';document.removeEventListener('keydown',kd);
    removeEventListener('resize',onR);document.removeEventListener('visibilitychange',vis);back();};
  $('cgX').onclick=()=>{if(st==='run'){pause(true);return;}if(st==='pause'){pause(false);return;}if(st==='dead')return;close();};
  $('cgP').onclick=()=>{try{SFX.click();}catch(e){}if(st==='run')pause(true);else if(st==='pause')pause(false);};
  /* ----- 입력: 누르기 = 앞으로, 밀기 = 그 방향(손가락을 떼기 전에 26px 넘게 밀면 바로 뛴다) ----- */
  let pd=null;
  cv.addEventListener('pointerdown',e=>{if(st!=='run')return;e.preventDefault();pd={id:e.pointerId,x:e.clientX,y:e.clientY,done:false};try{cv.setPointerCapture(e.pointerId);}catch(x){}});
  cv.addEventListener('pointermove',e=>{if(!pd||e.pointerId!==pd.id||pd.done)return;const dx=e.clientX-pd.x,dy=e.clientY-pd.y;if(Math.hypot(dx,dy)<26)return;pd.done=true;
    if(Math.abs(dx)>Math.abs(dy))tryHop(dx>0?1:-1,0);else tryHop(0,dy<0?1:-1);});
  const up=e=>{if(!pd||e.pointerId!==pd.id)return;const q=pd;pd=null;if(!q.done&&e.type==='pointerup')tryHop(0,1);};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
  const KM={ArrowUp:[0,1],w:[0,1],W:[0,1],' ':[0,1],ArrowDown:[0,-1],s:[0,-1],S:[0,-1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
  const kd=e=>{if(e.key==='Escape'){e.preventDefault();if(st==='run')pause(true);else if(st==='pause')pause(false);else if(st==='brief')close();return;}
    if(e.key==='p'||e.key==='P'){if(st==='run')pause(true);else if(st==='pause')pause(false);return;}
    const a=KM[e.key];if(!a||st!=='run')return;e.preventDefault();if(e.repeat)return;tryHop(a[0],a[1]);};
  document.addEventListener('keydown',kd);
  const vis=()=>{if(document.hidden){pd=null;pause(true);}};document.addEventListener('visibilitychange',vis);
  let rt=0;const onR=()=>{clearTimeout(rt);rt=setTimeout(fit,120);};addEventListener('resize',onR);
  /* ----- 그리기 ----- */
  const shade=(c,a)=>{g.fillStyle=c;g.globalAlpha=a;};
  // 줄 바탕
  const bgRow=(r,y,c0,c1)=>{const rw=row(r),t=rw.t,up=row(r+1).t,dn=row(r-1).t,h=cs+1;
    if(t==='x'){g.fillStyle='#2b251b';g.fillRect(0,y,W,h);
      if(r===-1){g.fillStyle='#5a4a33';g.fillRect(0,y,W,cs*.82);g.fillStyle='#6e5b3e';for(let i=c0;i<=c1;i++)g.fillRect(sx(i)+1,y+cs*.06,cs-2,cs*.16);
        g.fillStyle='rgba(0,0,0,.22)';for(let i=c0;i<=c1;i++)g.fillRect(sx(i),y+cs*.22,1,cs*.6);
        g.fillStyle='#c9a24a';RR(sx(3),y+cs*.18,cs*3,cs*.64,cs*.08);g.fill();g.fillStyle='#8a6512';for(let i=0;i<7;i++)g.fillRect(sx(3.2+i*.41),y+cs*.24,cs*.06,cs*.52);
        g.fillStyle='#fff4d6';g.font='800 '+Math.round(cs*.3)+'px '+FF;g.textAlign='center';g.textBaseline='middle';g.fillText('관저',sx(4.5),y+cs*.5);}
      return;}
    if(t==='g'){if(rw.lm){g.fillStyle='#d6cbb1';g.fillRect(0,y,W,h);g.fillStyle='rgba(120,100,70,.16)';for(let i=c0;i<=c1;i++){g.fillRect(sx(i),y,1,h);g.fillRect(sx(i+.5),y+cs*.5,1,cs*.5);}g.fillRect(0,y+cs*.5,W,1);}
      else{g.fillStyle=rw.pk?(r%2?'#94c876':'#8bc26d'):r%2?'#86bf6b':'#7cb763';g.fillRect(0,y,W,h);
        if(rw.pk){for(let i=c0;i<=c1;i++){const q=cgHs(i+7,r);if(q<.3){g.fillStyle=q<.1?'#f7f0a8':q<.2?'#f6b3c8':'#ffffff';g.beginPath();g.arc(sx(i+.2+q*2),y+cs*(.2+cgHs(r,i+3)*.6),cs*.045,0,6.283);g.fill();}}}
        g.fillStyle='rgba(40,90,40,.22)';
        for(let i=c0;i<=c1;i++){const q=cgHs(r,i);if(q<.35){const x=sx(i+q*2.4),yy=y+cs*(.25+cgHs(i,r)*.5);g.fillRect(x,yy,cs*.05,cs*.12);g.fillRect(x+cs*.08,yy+cs*.03,cs*.05,cs*.09);}}}
      return;}
    if(t==='r'){g.fillStyle='#3f434c';g.fillRect(0,y,W,h);
      if(up==='r'){if(rw.ln==='y'){g.fillStyle='#f2c230';g.fillRect(0,y-cs*.075,W,cs*.05);g.fillRect(0,y+cs*.025,W,cs*.05);}
        else if(rw.ln==='b'){g.fillStyle='#3f86e8';g.fillRect(0,y-2,W,4);}
        else{g.fillStyle='rgba(255,255,255,.5)';for(let i=c0;i<=c1;i++)g.fillRect(sx(i+.2),y-1.5,cs*.55,3);}}else{g.fillStyle='#9a958a';g.fillRect(0,y,W,cs*.07);}
      if(rw.bus){g.fillStyle='rgba(120,170,255,.22)';g.font='800 '+Math.round(cs*.3)+'px '+FF;g.textAlign='center';g.textBaseline='middle';
        for(let i=c0;i<=c1;i++)if(((i%4)+4)%4===1)g.fillText('버스전용',sx(i+.5),y+cs*.5);}
      if(dn!=='r'){g.fillStyle='#9a958a';g.fillRect(0,y+cs*.93,W,cs*.07+1);}
      g.fillStyle='rgba(0,0,0,.08)';for(let i=c0;i<=c1;i++)if(cgHs(i,r)<.18)g.fillRect(sx(i+.3),y+cs*.4,cs*.3,cs*.08);return;}
    if(t==='p'){g.fillStyle='#cbc3b3';g.fillRect(0,y,W,h);g.fillStyle='rgba(80,70,55,.13)';for(let i=c0;i<=c1;i++)g.fillRect(sx(i),y,1,h);g.fillRect(0,y+cs*.5,W,1);
      g.fillStyle='#e2c35a';for(let i=c0;i<=c1;i++)if(i%3===0)g.fillRect(sx(i+.38),y+cs*.12,cs*.24,cs*.76);
      g.fillStyle='rgba(0,0,0,.16)';if(up!=='p')g.fillRect(0,y,W,cs*.05);if(dn!=='p')g.fillRect(0,y+cs*.95,W,cs*.05+1);return;}
    if(t==='w'){g.fillStyle='#3a8bd0';g.fillRect(0,y,W,h);g.strokeStyle='rgba(255,255,255,.26)';g.lineWidth=Math.max(1,cs*.04);g.beginPath();
      const sh=(T*.35*Math.sign(rw.v))%1;for(let i=c0-1;i<=c1;i++){const q=cgHs(r,i),x=sx(i+sh+q*.6),yy=y+cs*(.3+q*.4);g.moveTo(x,yy);g.quadraticCurveTo(x+cs*.12,yy-cs*.08,x+cs*.24,yy);}g.stroke();
      g.fillStyle='rgba(190,225,250,.55)';if(up!=='w')g.fillRect(0,y,W,cs*.07);if(dn!=='w')g.fillRect(0,y+cs*.93,W,cs*.07+1);return;}
    if(t==='t'){g.fillStyle='#716b63';g.fillRect(0,y,W,h);g.fillStyle='#4d3d2e';for(let i=c0*2;i<=c1*2+1;i++)g.fillRect(sx(i/2+.17),y+cs*.12,cs*.15,cs*.76);
      g.fillStyle='#c9cdd3';g.fillRect(0,y+cs*.27,W,cs*.06);g.fillRect(0,y+cs*.67,W,cs*.06);
      if(warn(rw,T)&&Math.floor(T*6)%2){g.fillStyle='rgba(255,60,60,.17)';g.fillRect(0,y,W,h);}}};
  // 신호등(철길 양 끝)
  const sig=(x,y,on)=>{g.fillStyle='#1d2027';g.fillRect(x-cs*.04,y+cs*.12,cs*.08,cs*.7);RR(x-cs*.15,y+cs*.04,cs*.3,cs*.3,cs*.06);g.fill();
    const b=on&&Math.floor(T*6)%2;g.fillStyle=b?'#ff4a4a':'#5a2a2a';g.beginPath();g.arc(x,y+cs*.19,cs*.09,0,6.283);g.fill();if(b){g.fillStyle='rgba(255,80,80,.3)';g.beginPath();g.arc(x,y+cs*.19,cs*.22,0,6.283);g.fill();}};
  const tree=(x,cy)=>{shade('#000',.2);g.beginPath();g.ellipse(x+cs*.05,cy+cs*.25,cs*.32,cs*.11,0,0,6.283);g.fill();g.globalAlpha=1;
    g.fillStyle='#6b4a2e';g.fillRect(x-cs*.06,cy,cs*.12,cs*.26);g.fillStyle='#2e7a3c';g.beginPath();g.arc(x,cy-cs*.1,cs*.34,0,6.283);g.fill();
    g.fillStyle='#3f9a4b';g.beginPath();g.arc(x-cs*.08,cy-cs*.17,cs*.2,0,6.283);g.fill();g.fillStyle='#5cb866';g.beginPath();g.arc(x-cs*.12,cy-cs*.24,cs*.08,0,6.283);g.fill();};
  const bench=(x,cy)=>{shade('#000',.2);g.fillRect(x-cs*.38,cy+cs*.17,cs*.8,cs*.09);g.globalAlpha=1;g.fillStyle='#3a3d44';g.fillRect(x-cs*.32,cy,cs*.06,cs*.24);g.fillRect(x+cs*.26,cy,cs*.06,cs*.24);
    g.fillStyle='#9a6a3c';RR(x-cs*.4,cy-cs*.24,cs*.8,cs*.11,cs*.03);g.fill();g.fillStyle='#b37d48';RR(x-cs*.4,cy-cs*.06,cs*.8,cs*.13,cs*.03);g.fill();
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x-cs*.4,cy+cs*.04,cs*.8,cs*.03);};
  const blk=(b,x,cy)=>{if(b===1)return tree(x,cy);if(b===4)return bench(x,cy);
    if(b===2){shade('#000',.2);g.fillRect(x-cs*.38,cy+cs*.16,cs*.8,cs*.1);g.globalAlpha=1;g.fillStyle='#3a3d44';g.fillRect(x-cs*.34,cy-cs*.05,cs*.06,cs*.3);g.fillRect(x+cs*.28,cy-cs*.05,cs*.06,cs*.3);
      for(let i=0;i<5;i++){g.fillStyle=i%2?'#f6f2e6':'#f08a2a';g.fillRect(x-cs*.4+i*cs*.16,cy-cs*.2,cs*.16,cs*.22);}g.strokeStyle='#6a3510';g.lineWidth=1;g.strokeRect(x-cs*.4,cy-cs*.2,cs*.8,cs*.22);return;}
    shade('#000',.2);g.beginPath();g.ellipse(x,cy+cs*.24,cs*.26,cs*.09,0,0,6.283);g.fill();g.globalAlpha=1;
    g.fillStyle='#a0623a';g.beginPath();g.moveTo(x-cs*.24,cy-cs*.02);g.lineTo(x+cs*.24,cy-cs*.02);g.lineTo(x+cs*.18,cy+cs*.25);g.lineTo(x-cs*.18,cy+cs*.25);g.closePath();g.fill();
    g.fillStyle='#4f8f3a';g.beginPath();g.arc(x,cy-cs*.08,cs*.2,0,6.283);g.fill();g.fillStyle='#f07aa6';[[-.1,-.14],[.09,-.16],[0,-.02],[-.02,-.25]].forEach(([u,v])=>{g.beginPath();g.arc(x+u*cs,cy+v*cs,cs*.065,0,6.283);g.fill();});};
  const mask=(x,cy)=>{const b=Math.sin(T*3.2)*cs*.05;g.fillStyle='rgba(150,225,255,.28)';g.beginPath();g.arc(x,cy+b,cs*.3,0,6.283);g.fill();
    g.strokeStyle='#dfe8ef';g.lineWidth=Math.max(1,cs*.035);g.beginPath();g.arc(x-cs*.23,cy+b,cs*.07,0,6.283);g.arc(x+cs*.23,cy+b,cs*.07,0,6.283);g.stroke();
    g.fillStyle='#f8fbff';RR(x-cs*.22,cy-cs*.13+b,cs*.44,cs*.26,cs*.07);g.fill();g.strokeStyle='#8fb4cc';g.lineWidth=1;g.stroke();
    g.beginPath();g.moveTo(x-cs*.17,cy-cs*.04+b);g.lineTo(x+cs*.17,cy-cs*.04+b);g.moveTo(x-cs*.17,cy+cs*.04+b);g.lineTo(x+cs*.17,cy+cs*.04+b);g.stroke();};
  const car=(k,x0,cy,len,rt)=>{const h=cs*.66,x=x0+cs*.07,wd=len*cs-cs*.14,y=cy-h/2,fx=rt?x+wd:x,s=rt?-1:1;
    shade('#000',.25);RR(x+cs*.05,y+cs*.09,wd,h,cs*.14);g.fill();g.globalAlpha=1;
    g.fillStyle='#15171c';const wl=[.16,.84];if(len>=3)wl.splice(1,0,.5);wl.forEach(f=>{g.fillRect(x+wd*f-cs*.1,y-cs*.05,cs*.2,cs*.08);g.fillRect(x+wd*f-cs*.1,y+h-cs*.03,cs*.2,cs*.08);});
    const C={taxi:['#f2a33a','#ffcf7a'],amb:['#f4f5f7','#ffffff'],bus:['#2f6fbf','#4c88d2'],dis:['#3c8f5a','#55a873']}[k]||['#888','#aaa'];
    g.fillStyle=C[0];RR(x,y,wd,h,cs*.14);g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.stroke();
    if(k==='dis'){g.fillStyle='#dfe8e2';RR(rt?x+cs*.06:x+wd*.4,y+h*.1,wd*.54,h*.8,h*.35);g.fill();g.strokeStyle='#9fb3a6';g.beginPath();for(let i=1;i<4;i++){const xx=(rt?x+cs*.06:x+wd*.4)+wd*.54*i/4;g.moveTo(xx,y+h*.12);g.lineTo(xx,y+h*.88);}g.stroke();
      g.fillStyle='rgba(225,245,232,.33)';for(let i=0;i<3;i++){const ph=(T*1.6+i/3)%1,xx=(rt?x:x+wd)+(rt?-1:1)*ph*cs*.9;g.beginPath();g.arc(xx,cy+(i-1)*h*.22,cs*(.1+ph*.2),0,6.283);g.fill();}}
    else{g.fillStyle=C[1];RR(x+wd*.22,y+h*.14,wd*.56,h*.72,cs*.08);g.fill();}
    g.fillStyle='#1d2a3c';RR(fx+s*cs*.1-(rt?cs*.16:0),y+h*.14,cs*.16,h*.72,cs*.04);g.fill();
    if(k==='bus'){g.fillStyle='#bfe0ff';for(let i=0;i<Math.floor(len*2)-1;i++){const xx=x+cs*.3+i*cs*.48;if(xx+cs*.3>x+wd-cs*.25)break;g.fillRect(xx,y+h*.04,cs*.3,h*.12);g.fillRect(xx,y+h*.84,cs*.3,h*.12);}}
    if(k==='taxi'){g.fillStyle='#fff3c4';RR(x+wd/2-cs*.12,cy-cs*.07,cs*.24,cs*.14,cs*.03);g.fill();g.fillStyle='#222';g.fillRect(x+wd/2-cs*.09,cy-cs*.01,cs*.18,cs*.02);}
    if(k==='amb'){g.fillStyle='#d8344b';g.fillRect(x,cy-h*.08,wd,h*.16);g.fillRect(x+wd*.55-cs*.05,cy-cs*.17,cs*.1,cs*.34);g.fillRect(x+wd*.55-cs*.17,cy-cs*.05,cs*.34,cs*.1);
      const b=Math.floor(T*8)%2,lx=rt?x+wd-cs*.42:x+cs*.3;g.fillStyle=b?'#ff3b3b':'#3b7bff';g.fillRect(lx,y+h*.12,cs*.12,h*.34);g.fillStyle=b?'#3b7bff':'#ff3b3b';g.fillRect(lx,y+h*.54,cs*.12,h*.34);}
    g.fillStyle='#fff2b0';g.fillRect(rt?x+wd-cs*.05:x,y+h*.1,cs*.05,h*.16);g.fillRect(rt?x+wd-cs*.05:x,y+h*.74,cs*.05,h*.16);};
  const walker=(k,x0,cy,rt)=>{const x=x0+cs*.35,C=['#8e5bb5','#c0563f','#3f7fae','#6b8f3a'][k],ph=T*7+x0;
    g.strokeStyle='rgba(224,86,106,.55)';g.lineWidth=Math.max(1,cs*.035);g.setLineDash([cs*.08,cs*.07]);g.beginPath();g.arc(x,cy,cs*.38,0,6.283);g.stroke();g.setLineDash([]);
    shade('#000',.2);g.beginPath();g.ellipse(x,cy+cs*.27,cs*.2,cs*.07,0,0,6.283);g.fill();g.globalAlpha=1;
    g.fillStyle='#2a2f3a';g.fillRect(x-cs*.1,cy+cs*.1+Math.sin(ph)*cs*.03,cs*.07,cs*.16);g.fillRect(x+cs*.03,cy+cs*.1-Math.sin(ph)*cs*.03,cs*.07,cs*.16);
    g.fillStyle=C;RR(x-cs*.17,cy-cs*.1,cs*.34,cs*.26,cs*.09);g.fill();g.fillStyle='#b9d39a';g.beginPath();g.arc(x,cy-cs*.22,cs*.15,0,6.283);g.fill();
    g.fillStyle='#3a4a2a';g.fillRect(x-cs*.07,cy-cs*.24,cs*.04,cs*.03);g.fillRect(x+cs*.03,cy-cs*.24,cs*.04,cs*.03);
    const s=rt?1:-1;for(let i=0;i<3;i++){const q=(T*1.4+i/3+k*.21)%1;g.fillStyle='rgba(200,235,170,'+(.6*(1-q)).toFixed(2)+')';g.beginPath();g.arc(x+s*cs*(.18+q*.32),cy-cs*(.18+q*.08)+(i-1)*cs*.06,cs*(.035+q*.04),0,6.283);g.fill();}};
  const boat=(k,x0,cy,len,rt)=>{const x=x0+cs*.05,wd=len*cs-cs*.1,h=cs*.72,y=cy-h/2;
    g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=Math.max(1,cs*.04);g.beginPath();const bx=rt?x-cs*.06:x+wd+cs*.06;g.moveTo(bx,y+h*.2);g.lineTo(bx+(rt?-1:1)*cs*.16,y+h*.1);g.moveTo(bx,y+h*.8);g.lineTo(bx+(rt?-1:1)*cs*.16,y+h*.9);g.stroke();
    if(k==='raft'){g.fillStyle='#7a5432';RR(x,y,wd,h,cs*.06);g.fill();g.fillStyle='#93673e';for(let i=0;i<Math.round(len*2.5);i++){const xx=x+i*wd/Math.round(len*2.5);g.fillRect(xx+1,y+cs*.03,wd/Math.round(len*2.5)-2,h-cs*.06);}
      g.fillStyle='#d9c08a';g.fillRect(x+cs*.18,y,cs*.05,h);g.fillRect(x+wd-cs*.23,y,cs*.05,h);return;}
    if(k==='boat'){const nose=rt?x+wd:x,back=rt?x:x+wd,s=rt?1:-1;g.fillStyle='#ef6a2a';g.beginPath();g.moveTo(back,y+h*.08);g.lineTo(nose-s*cs*.35,y+h*.08);g.quadraticCurveTo(nose,cy,nose-s*cs*.35,y+h*.92);g.lineTo(back,y+h*.92);g.closePath();g.fill();
      g.fillStyle='#b9461a';RR(Math.min(back,nose)+cs*.14,y+h*.26,wd-cs*.48,h*.48,cs*.06);g.fill();g.fillStyle='#ffe08a';g.fillRect(Math.min(back,nose)+wd*.42,y+h*.08,cs*.08,h*.84);return;}
    // 오리배: 흰 몸통 · 노란 좌석 · 앞에 오리 머리
    g.fillStyle='#f7f3e6';RR(x,y,wd,h,h*.42);g.fill();g.strokeStyle='#c9bfa6';g.lineWidth=1;g.stroke();g.fillStyle='#f4c542';RR(x+wd*.22,y+h*.22,wd*.5,h*.56,h*.2);g.fill();
    const hx=rt?x+wd-cs*.18:x+cs*.18;g.fillStyle='#ffffff';g.beginPath();g.arc(hx,cy,cs*.17,0,6.283);g.fill();g.strokeStyle='#c9bfa6';g.stroke();
    g.fillStyle='#f08a2a';g.beginPath();g.moveTo(hx+(rt?1:-1)*cs*.13,cy-cs*.06);g.lineTo(hx+(rt?1:-1)*cs*.3,cy);g.lineTo(hx+(rt?1:-1)*cs*.13,cy+cs*.06);g.closePath();g.fill();
    g.fillStyle='#222';g.beginPath();g.arc(hx+(rt?1:-1)*cs*.05,cy-cs*.07,cs*.03,0,6.283);g.arc(hx+(rt?1:-1)*cs*.05,cy+cs*.07,cs*.03,0,6.283);g.fill();};
  const trainD=(x0,cy,len,rt)=>{const h=cs*.8,y=cy-h/2,N=3,cl=len/N;shade('#000',.25);g.fillRect(x0,y+cs*.1,len,h);g.globalAlpha=1;
    for(let i=0;i<N;i++){const x=x0+i*cl+cs*.04,wd=cl-cs*.08,lead=rt?i===N-1:i===0;g.fillStyle='#eef1f5';RR(x,y,wd,h,lead?h*.45:cs*.08);g.fill();
      g.fillStyle='#2b5ea8';g.fillRect(x+(lead&&!rt?cs*.3:0),cy-h*.1,wd-(lead?cs*.3:0),h*.2);g.fillStyle='#24324a';for(let j=0;j<Math.floor(cl/cs)-1;j++){const xx=x+cs*.35+j*cs;if(xx+cs*.4>x+wd-cs*.3)break;g.fillRect(xx,y+h*.06,cs*.42,h*.14);g.fillRect(xx,y+h*.8,cs*.42,h*.14);}
      if(lead){g.fillStyle='#1d2a3c';RR(rt?x+wd-cs*.5:x+cs*.12,y+h*.18,cs*.38,h*.64,cs*.1);g.fill();}}};
  // 대통령: 남색 양복 · 빨간 넥타이 · 검은 머리. 앞으로 뛸 때는 뒷모습
  const pres=(x,cy,lift,sq,f,a,green)=>{shade('#000',.25*a);g.beginPath();g.ellipse(x,cy+cs*.26,cs*(.24-lift/cs*.18),cs*.09,0,0,6.283);g.fill();g.globalAlpha=a;
    g.save();g.translate(x,cy-lift+cs*.3);g.scale(f==='l'?-1:1,sq);g.translate(0,-cs*.3);
    if(shield&&!green){g.strokeStyle='rgba(140,220,255,'+(.45+.25*Math.sin(T*5))+')';g.lineWidth=Math.max(1.5,cs*.05);g.beginPath();g.arc(0,-cs*.05,cs*.42,0,6.283);g.stroke();}
    g.fillStyle='#161d30';g.fillRect(-cs*.13,cs*.12,cs*.1,cs*.17);g.fillRect(cs*.03,cs*.12,cs*.1,cs*.17);
    g.fillStyle=green?'#4f7a3a':'#22325a';RR(-cs*.24,-cs*.1,cs*.48,cs*.3,cs*.1);g.fill();
    if(f!=='u'){g.fillStyle='#f4f6fa';g.beginPath();g.moveTo(-cs*.08,-cs*.1);g.lineTo(cs*.08,-cs*.1);g.lineTo(0,cs*.05);g.closePath();g.fill();g.fillStyle='#d8344b';g.fillRect(-cs*.025,-cs*.07,cs*.05,cs*.14);}
    g.fillStyle=green?'#b9d39a':'#f1cfa9';g.beginPath();g.arc(0,-cs*.27,cs*.19,0,6.283);g.fill();g.fillStyle='#1c1c22';
    if(f==='u'){g.beginPath();g.arc(0,-cs*.29,cs*.19,0,6.283);g.fill();}
    else{g.beginPath();g.arc(0,-cs*.31,cs*.19,Math.PI*1.02,Math.PI*1.98);g.fill();g.fillRect(-cs*.19,-cs*.34,cs*.38,cs*.06);
      const e=f==='d'?0:cs*.04;g.fillRect(-cs*.08+e,-cs*.27,cs*.04,cs*.05);g.fillRect(cs*.05+e,-cs*.27,cs*.04,cs*.05);
      if(shield){g.fillStyle='#f8fbff';RR(-cs*.12+e,-cs*.21,cs*.24,cs*.11,cs*.04);g.fill();}}
    g.restore();g.globalAlpha=1;};
  const draw=()=>{g.setTransform(D,0,0,D,0,0);g.fillStyle='#0e1424';g.fillRect(0,0,W,H);if(gHi<0)return;
    g.save();if(shake>0)g.translate((Math.random()-.5)*shake*16,(Math.random()-.5)*shake*16);
    const r0=Math.floor(camY)-1,r1=Math.ceil(camY+VR)+1,c0=Math.floor(-ox/cs)-1,c1=Math.ceil((W-ox)/cs)+1;
    for(let r=r0;r<=r1;r++)bgRow(r,sy(r),c0,c1);
    // 대통령이 그려질 줄(뛰는 중이면 가까운 쪽)
    let px=0,prr=0,lift=0,sq=1;if(P){if(hop){const k=Math.min(1,hop.t);px=lerp(hop.fx,hop.tx,k);prr=lerp(hop.fr,hop.tr,k);lift=Math.sin(k*Math.PI)*cs*.32;sq=1+Math.sin(k*Math.PI)*.08;}
      else{px=P.x;prr=P.r;sq=1-bump*.6;}if(deadAt){px=deadAt.x;prr=deadAt.r;}}
    const pRow=Math.round(prr);
    for(let r=r1;r>=r0;r--){const rw=row(r),y=sy(r),cy=y+cs/2;
      if(rw.t==='g'){for(let c=c0;c<=c1;c++){if(c>=0&&c<CG_C){if(rw.b[c])blk(rw.b[c],sx(c+.5),cy);}else if(cgHs(r,c+99)<.5)tree(sx(c+.5),cy);}if(rw.mk>=0)mask(sx(rw.mk+.5),cy);
        if(rw.sg){g.font='800 '+Math.round(Math.min(cs*.3,16))+'px '+FF;g.textAlign='center';g.textBaseline='middle';const tw=g.measureText(rw.sg).width+cs*.5,x=sx(4.5),bh=cs*.5;
          g.fillStyle='#4a4e57';g.fillRect(x-tw*.3,cy,cs*.07,cs*.38);g.fillRect(x+tw*.3-cs*.07,cy,cs*.07,cs*.38);shade('#000',.25);RR(x-tw/2+2,cy-bh/2-cs*.08+3,tw,bh,cs*.08);g.fill();g.globalAlpha=1;
          g.fillStyle='#1d5fae';RR(x-tw/2,cy-bh/2-cs*.08,tw,bh,cs*.08);g.fill();g.strokeStyle='#e8f0ff';g.lineWidth=Math.max(1,cs*.03);RR(x-tw/2+cs*.05,cy-bh/2-cs*.03,tw-cs*.1,bh-cs*.1,cs*.05);g.stroke();
          g.fillStyle='#ffffff';g.fillText(rw.sg,x,cy-cs*.08);}
        if(rw.lm){g.font='800 '+Math.round(Math.min(cs*.36,20))+'px '+FF;g.textAlign='center';g.textBaseline='middle';g.lineWidth=3;g.strokeStyle='rgba(60,45,20,.5)';g.strokeText(rw.lm,sx(4.5),cy);g.fillStyle='#fff4d6';g.fillText(rw.lm,sx(4.5),cy);}}
      else if(rw.t==='w')rw.o.forEach(c=>boat(c.k,sx(cgWrap(c.o,rw.v,T)),cy,c.len,rw.v>0));
      else if(rw.t==='r')rw.o.forEach(c=>car(c.k,sx(cgWrap(c.o,rw.v,T)),cy,c.len,rw.v>0));
      else if(rw.t==='p'){if(rw.mk>=0)mask(sx(rw.mk+.5),cy);rw.o.forEach(c=>walker(c.k,sx(cgWrap(c.o,rw.v,T)),cy,rw.v>0));}
      else if(rw.t==='t'){const q=train(rw,T),on=warn(rw,T);sig(sx(-.32),y,on);sig(sx(CG_C+.32),y,on);if(q)trainD(sx(q[0]),cy,(q[1]-q[0])*cs,rw.v>0);}
      if(P&&r===pRow&&st!=='brief'){const cyP=sy(prr)+cs/2;
        if(!deadAt)pres(sx(px),cyP,lift,sq,P.f,inv>0&&Math.floor(T*12)%2?.45:1,false);
        else{const d=deadAt,t=d.t;
          if(d.k==='car'||d.k==='train'){if(d.k==='train'){g.save();g.translate(sx(px)+t*cs*9,cyP-t*cs*3);g.rotate(t*9);pres(0,0,0,1,'d',Math.max(0,1-t),false);g.restore();}else pres(sx(px),cyP+cs*.18,0,.3,'d',1,false);}
          else if(d.k==='water'||d.k==='drift'){g.strokeStyle='rgba(255,255,255,'+Math.max(0,.8-t*.6)+')';g.lineWidth=2;g.beginPath();g.arc(sx(px),cyP,cs*(.15+t*.5),0,6.283);g.stroke();if(t<.3)pres(sx(px),cyP+t*cs,0,1-t*2,P.f,1-t*3,false);}
          else pres(sx(px),cyP,0,1,'d',1,d.k==='walk');}}}
    // 판 밖은 어둡게
    const bx=sx(0),ex=sx(CG_C);g.fillStyle='rgba(6,10,20,.42)';g.fillRect(0,0,bx,H);g.fillRect(ex,0,W-ex,H);
    if(bx>cs*2){const gr=g.createLinearGradient(0,0,bx,0);gr.addColorStop(0,'rgba(6,10,20,.9)');gr.addColorStop(1,'rgba(6,10,20,0)');g.fillStyle=gr;g.fillRect(0,0,bx,H);
      const g2=g.createLinearGradient(ex,0,W,0);g2.addColorStop(0,'rgba(6,10,20,0)');g2.addColorStop(1,'rgba(6,10,20,.9)');g.fillStyle=g2;g.fillRect(ex,0,W-ex,H);}
    // 불티 · 글씨
    for(const p of FX){g.globalAlpha=Math.min(1,p.l*2);g.fillStyle=p.c;const r=Math.max(2,cs*.09);g.fillRect(sx(p.x)-r/2,sy(p.r)+cs/2-r/2,r,r);}g.globalAlpha=1;
    g.font='800 '+Math.max(12,Math.min(17,cs*.42))+'px '+FF;g.textAlign='center';g.textBaseline='middle';
    for(const p of POP){let x=sx(p.x);const y=sy(p.r)+cs/2,hw=g.measureText(p.s).width/2+8;x=Math.max(hw,Math.min(W-hw,x));g.globalAlpha=Math.min(1,p.l*1.6);g.lineWidth=3;g.strokeStyle='rgba(8,12,24,.85)';g.strokeText(p.s,x,y);g.fillStyle=p.c;g.fillText(p.s,x,y);}g.globalAlpha=1;
    g.restore();
    // 기자단: 화면 아래에서 따라붙는다(가까울수록 진하게, 붙잡히면 덮친다)
    const dk=deadAt&&deadAt.k==='press'?Math.min(1.6,1+deadAt.t*1.2):danger;
    if(dk>.02&&(st==='run'||st==='dead')){const bh=cs*1.2*Math.min(1.6,dk),y0=H-bh,gr=g.createLinearGradient(0,y0-cs*.6,0,H);gr.addColorStop(0,'rgba(10,12,22,0)');gr.addColorStop(.4,'rgba(10,12,22,'+(.55*Math.min(1,dk))+')');gr.addColorStop(1,'rgba(10,12,22,.92)');
      g.fillStyle=gr;g.fillRect(0,y0-cs*.6,W,bh+cs*.6);
      for(let i=0;i*cs*.75<W+cs;i++){const x=i*cs*.75+(i%2)*cs*.2,hy=H-bh*.55+Math.sin(T*6+i)*cs*.06;g.fillStyle='#1a1e2a';g.beginPath();g.arc(x,hy,cs*.2,0,6.283);g.fill();g.fillRect(x-cs*.28,hy+cs*.1,cs*.56,bh);
        g.fillStyle='#2c3242';g.fillRect(x-cs*.16,hy-cs*.36,cs*.32,cs*.2);g.fillStyle='#5a6378';g.beginPath();g.arc(x,hy-cs*.26,cs*.06,0,6.283);g.fill();
        if(cgHs(i,Math.floor(T*7))<.12*dk){g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(x,hy-cs*.3,cs*.16,0,6.283);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(x,hy-cs*.3,cs*.5,0,6.283);g.fill();}}
      if(dk>.35&&st==='run'){g.font='800 '+Math.max(13,Math.min(17,cs*.38))+'px '+FF;g.fillStyle='#ffe08a';g.textAlign='center';g.fillText('기자단이 따라붙는다! 앞으로!',W/2,H-bh-cs*.3);}}};
  const loop=now=>{if(!live||!w.isConnected){live=false;return;}const dt=Math.min(.05,(now-prev)/1000||0);prev=now;
    if(st!=='pause')step(dt);draw();raf=requestAnimationFrame(loop);};
  fit();brief();prev=performance.now();raf=requestAnimationFrame(loop);
  // 시험용: window.__cgDbg를 미리 켜 두면 상태를 밖에서 보고 움직인다(이 판은 명예의 전당에 보내지 않는다)
  if(window.__cgDbg)window.__cgDbg={st:()=>st,P:()=>({x:P.x,r:P.r}),busy:()=>!!hop,hop:(dx,dr)=>tryHop(dx,dr),start:s=>start(s),row:r=>row(r),T:()=>T,cam:()=>camY,
    hz:(r,x,dt)=>!!hit(row(r),x,T+(dt||0)),raft:(r,x,dt)=>!!raftAt(row(r),x,T+(dt||0)),god:v=>{god=!!v;},maxR:()=>maxR,cause:()=>cause,shield:()=>shield,danger:()=>danger,
    put:(r,x)=>{P.r=r;P.x=x;hop=null;},jump:k=>{T+=k;}};}
