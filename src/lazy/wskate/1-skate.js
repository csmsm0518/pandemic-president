/* ---------- 쇼트트랙 500m 결승: 가감속 ----------
   한 바퀴 111.1m(곧은 길 28.85m 둘 + 반지름 8.5m 코너 둘)를 4바퀴 반 돈다. 누르고 있으면 얼음을 밀어 빨라지고(체력이 준다),
   떼면 날로 미끄러지며 조금씩 느려진다(체력이 돌아온다). 코너에는 한계 속도(47km/h)가 있어 넘겨 들어가면 바깥으로 밀려 속도를 잃고, 크게 넘으면 넘어진다.
   물리는 m·초(경기 시간) 단위로 고정 간격(SK.DT)만큼씩 돌린다. 화면은 경기 시간을 SK.TS배 빨리 보여 준다(기록 40초 안팎을 30초쯤에 본다).
   직접 할 때와 시뮬레이션이 같은 규칙(skStep)과 같은 상대(skAI)를 쓴다. */
const SK={S:28.85,R:8.5,C:Math.PI*8.5,D:500,P0:73.54,VC:13,TS:1.35,DT:1/90,A:6,VT:17,C0:.15,C1:.0036,CP:.55,DR:1/16,RC:.06,SF:3,SL:4.5,KM:3.6,GX:16.1};
SK.L=2*SK.S+2*SK.C;   // 111.1m. 출발은 위쪽 곧은 길(첫 코너까지 11m), 결승선은 4바퀴 반 뒤 아래쪽 곧은 길 18m 지점(마지막 코너를 나와 스퍼트할 거리)
// 초반 돌격 · 막판 스퍼트 · 고른 페이스: 곧은 길에서 남겨 둘 체력(진행률 p에 따라)
const SK_STY=[p=>p<.45?.05:.4*(1-p),p=>p<.74?.5:0,p=>.3*(1-p)],SK_STN=['초반 돌격','막판 스퍼트','고른 페이스'];
// 나라별 경기복 · 헬멧 색
const SK_COL={'호주':['#1f6f43','#f2c230'],'미국':['#1f3a6d','#d63a3a'],'중국':['#c8251f','#f4d03f'],'일본':['#eef1f4','#c8102e'],'영국':['#1b2d5c','#e8eef6'],'프랑스':['#2350a8','#f2f2f2'],
  '캐나다':['#d22a2a','#f2f2f2'],'이탈리아':['#2a6fd1','#e8eef6'],'헝가리':['#2f7d46','#c8302a'],'브라질':['#f2c230','#1f8a4c'],'독일':['#1d1d1f','#d8a320'],'스웨덴':['#2766b5','#f5cf2a'],
  '튀르키예':['#c8202a','#f2f2f2'],'멕시코':['#16784a','#e8eef6']};
// 나라 이름 · 정규분포 · 메달 이름: 수영(lazy/sports)에 있는 것과 같지만, 그 조각을 받기 전에도 돌도록 여기 따로 둔다
const skNat=()=>Object.keys(SK_COL).filter(n=>!(CP.id==='usa'&&n==='미국')).sort(()=>Math.random()-.5);
const skGauss=()=>{let a=0,b=0;while(!a)a=Math.random();while(!b)b=Math.random();return Math.sqrt(-2*Math.log(a))*Math.cos(2*Math.PI*b);};
const SK_MED=['금메달','은메달','동메달','메달을 놓쳤다'];
const skP=d=>(SK.P0+d)%SK.L,skIn=d=>{const p=skP(d);return p>=SK.S&&p<SK.S+SK.C||p>=2*SK.S+SK.C;};
// 다음 코너까지 남은 거리(코너 안이면 0)
const skToC=d=>{const p=skP(d);return p<SK.S?SK.S-p:p>=SK.S+SK.C&&p<2*SK.S+SK.C?2*SK.S+SK.C-p:0;};
// 트랙 위 자리(m): 안쪽 선에서 바깥으로 ln m. [x, y, 나아가는 방향]. 아래 곧은 길에서 오른쪽으로 달리고 왼쪽으로 돈다(시계 반대 방향)
function skXY(d,ln){const S=SK.S,R=SK.R,r=R+ln;let p=skP(d);
  if(p<S)return [-S/2+p,r,0];p-=S;
  if(p<SK.C){const a=Math.PI/2-p/R;return [S/2+r*Math.cos(a),r*Math.sin(a),-p/R];}p-=SK.C;
  if(p<S)return [S/2-p,-r,-Math.PI];p-=S;
  const a=-Math.PI/2-p/R;return [-S/2+r*Math.cos(a),r*Math.sin(a),-Math.PI-p/R];}
function skMk(n,o){return Object.assign({n:n,d:0,v:0,E:1,ln:0,lt:0,sx:0,sl:0,sw:0,fall:0,over:0,pu:0,ph:Math.random()*6,lean:0,spin:0,t:0,vt:1,mg:.2,ae:.12,ag:0,slp:0,sg:-1,hold:1,rt:0,ns:0,nf:0,st:SK_STY[2]},o);}
// 경쟁자 셋: 강한 선수 하나, 중간 하나, 약한 하나. 경기마다 나라 · 운영 방식 · 실수 버릇이 새로 정해진다
// 기량은 곧은 길 최고 속도(vt)와 코너를 한계에 얼마나 붙여 도는가(mg: 한계보다 몇 m/s 아래로 도는가)로 나뉜다
function skRivals(){const NAT=skNat(),R=Math.random;return [[1.01+R()*.015,.04+R()*.08],[.995+R()*.015,.1+R()*.1],[.975+R()*.015,.18+R()*.12]].sort(()=>R()-.5)
  .map((v,i)=>{const y=Math.floor(R()*3);return skMk(NAT[i],{vt:v[0],mg:v[1],sy:y,st:SK_STY[y],rt:.12+R()*.22,ae:.1,slp:.02});});}
// 떼고 x m 미끄러진 뒤의 속도. v·dv/dx = -(C0+C1·v²)을 풀면 C0+C1·v² 이 e^(-2·C1·x) 배로 준다
function skGl(v,x){return Math.sqrt(Math.max(0,((SK.C0+SK.C1*v*v)*Math.exp(-2*SK.C1*x)-SK.C0)/SK.C1));}
// 한 선수를 dt초 움직인다. push: 밀고 있는가
function skStep(k,push,dt){const c=skIn(k.d);let a=-(SK.C0+SK.C1*k.v*k.v);k.pu=0;k.over=0;
  if(k.fall>0){k.fall-=dt;a=-7;push=0;}
  if(push&&!k.t){a+=SK.A*(c?SK.CP:1)*(.5+.5*k.E)*Math.max(0,1-k.v*k.v/(SK.VT*SK.VT*k.vt*k.vt));k.E=Math.max(0,k.E-SK.DR*dt);k.pu=1;}
  else k.E=Math.min(1,k.E+SK.RC*dt);
  if(c&&k.fall<=0&&!k.t){const o=k.v-SK.VC;
    // 한계를 조금(0.25m/s까지) 넘으면 날이 긁히며 깎이고, 그보다 넘으면 바깥으로 밀려난다(한계 아래로 한참 떨어질 때까지)
    if(o>.25&&!k.sw){k.sw=1;k.ns++;}
    if(k.sw){a-=SK.SF*(Math.max(0,o)+.4);if(o>0)k.sl+=(o+(push?.4:0))*SK.SL*dt;if(o<-.9)k.sw=0;}else if(o>0)a-=3*o;
    k.over=Math.max(0,o);
    // 밀려나는 동안 넘은 만큼이 쌓여 1을 넘으면 넘어진다(떼고 들어가면 1.3m/s쯤 넘길 때, 밀려나면서도 계속 밀면 그보다 덜 넘어도)
    if(k.sl>1){k.fall=1.5;k.sw=0;k.sl=0;k.nf++;}}
  else{k.sw=0;k.sl=Math.max(0,k.sl-.6*dt);}
  k.v=Math.max(0,k.v+a*dt);k.d+=k.v*dt;}
// 상대(와 시뮬레이션의 우리 선수)의 판단: 곧은 길에서는 체력 계획만큼 밀되, 지금 떼야 코너 한계에 맞춰 들어갈 수 있으면 뗀다.
// 곧은 길마다 판단이 조금씩 어긋나고(ae), 가끔 크게 어긋나 코너에 과속으로 들어간다(slp)
function skAI(k){if(k.fall>0||k.t)return 0;const p=skP(k.d),sg=p<SK.S?0:p<SK.S+SK.C?1:p<2*SK.S+SK.C?2:3,toC=skToC(k.d),left=SK.D-k.d,rs=k.st(k.d/SK.D);
  if(sg!==k.sg){k.sg=sg;if(!(sg%2))k.ag=skGauss()*k.ae+(Math.random()<k.slp?.8+Math.random()*.9:0);}
  const cap=SK.VC-k.mg+k.ag;
  if(k.hold){if(k.E<rs)k.hold=0;}else if(k.E>rs+.12)k.hold=1;
  if(!toC)return k.v<cap-.08&&(k.hold||k.E>rs*.5)?1:0;
  if(left>toC&&skGl(k.v,toC)>cap)return 0;
  return left<toC?1:k.hold;}
// 화면에서 겹치지 않게 줄을 바꾼다(앞이나 옆에 있으면 바깥으로 돌아 나간다). 거리 계산에는 넣지 않는다
function skLane(all,dt,w){w=w||1.2;const o=all.slice().sort((a,b)=>b.d-a.d);   // w: 선수 한 명이 차지하는 폭(m). 화면에서 선수를 크게 그리면 넓힌다
  o.forEach((k,i)=>{let t=k.fall>0?k.lt:.5;for(let n=0;n<3;n++)for(let j=0;j<i;j++){const q=o[j],gp=q.d-k.d;if(gp<w*2.1&&gp>-w*1.1&&Math.abs(q.ln+q.sx-t)<w*.96)t=q.ln+q.sx+w;}
    k.lt=Math.min(5,t);const s=k.d<25?.9:1.8;k.ln+=Math.max(-s*dt,Math.min(s*dt,k.lt-k.ln));
    k.sx=k.fall>0?Math.min(5.2,k.sx+2.6*dt):k.sw?Math.min(3,k.sx+1.8*dt):Math.max(0,k.sx-.9*dt);});}
// 결승선을 지난 순간(한 걸음 안에서 나눠 더 정확하게)
const skFin=(k,el)=>{if(k.t||k.d<SK.D)return false;k.t=el-(k.d-SK.D)/Math.max(1,k.v);return true;};
const skLap=d=>{const r=(SK.D-d)/SK.L;return r>4?'4½':String(Math.max(0,Math.ceil(r-1e-6)));};
// 소리: 날이 얼음을 미는 소리 · 밀려남 · 넘어짐 · 출발 총성 · 마지막 바퀴 종 · 결승선
const skSnd={scr:()=>noise(.08,.03,0,2600+Math.random()*1800),slide:()=>{sweep(.55,.09,4200,900,0,.8);noise(.4,.06,0,2400);},
  fall:()=>{thud(80,.4,0,.3);noise(.7,.12,0,1400);sweep(.8,.06,2500,500,.05,.7);},gun:()=>{noise(.18,.4,0,4000);thud(120,.3,0,.15);},
  bell:()=>{[0,.3,.6].forEach(w=>{tone(1568,'triangle',.45,.12,w);tone(2349,'sine',.35,.05,w);});},line:()=>{clk(1600,.6);tone(1320,'sine',.35,.1,.02);}};
const skS=f=>{try{f();}catch(e){}};
function mgSkate(box,done){const $=id=>document.getElementById(id),MQ=q=>!!(window.matchMedia&&matchMedia(q).matches),RM=MQ('(prefers-reduced-motion: reduce)'),TCH=MQ('(pointer: coarse)');
  const riv=skRivals(),me=skMk('우리',{me:1}),all=[me].concat(riv),L0=[.6,1.8,3,4.2].sort(()=>Math.random()-.5);all.forEach((k,i)=>{k.ln=k.lt=L0[i];});
  const col=k=>k.me?['#e3a72f','#fff4d6']:SK_COL[k.n]||['#6b7a90','#dfe6ee'];
  box.innerHTML='<div class="mgx sk"><div class="sk-in"><div class="sk-sc" id="skSc"><canvas id="skC"></canvas><div class="sk-ov" id="skOv"></div></div><div class="sk-pn">'+
    '<div class="sk-hud"><div><span>기록</span><b id="skT">0.00</b></div><div><span>순위</span><b id="skRk">-</b></div><div><span>남은 바퀴</span><b id="skLp">4½</b></div></div>'+
    '<div class="sk-gs"><div class="sk-g sk-sp" id="skSp"><span>속도</span><i><em id="skSpF"></em><u style="left:'+(SK.VC/SK.GX*100).toFixed(1)+'%"></u></i><b><em id="skV">0</em><small>km/h</small></b></div>'+
    '<div class="sk-g sk-en" id="skEn"><span>체력</span><i><em id="skEnF" style="width:100%"></em></i><b id="skCn">코너 한계 '+Math.round(SK.VC*SK.KM)+'</b></div></div>'+
    '<div class="pk-msg" id="skMsg"></div><button type="button" class="sk-push" id="skPush" style="display:none">밀기<small>'+(TCH?'누르고 있기':'누르고 있기 · 스페이스')+'</small></button>'+
    '<button id="skGo" class="pri">출발 준비</button></div></div></div>';
  const X=box.querySelector('.sk'),sc=$('skSc'),cv=$('skC'),g=cv.getContext('2d'),bg=document.createElement('canvas'),bx=bg.getContext('2d'),FF=getComputedStyle(document.body).fontFamily;
  let W=0,H=0,D=1,z=1,u=8,st='ready',el=0,acc=0,last=0,raf=0,keyOn=0,ptr=new Set(),fin=0,place=0,res=-1,endAt=0,msgT=0,lapSaid=0,rk=0,tipC=0,sndT=0,parts=[],sheen=0,ended=false;
  const inp=()=>keyOn||ptr.size>0;
  const say=(h,s)=>{$('skMsg').innerHTML=h;msgT=s||0;};
  // 화면 크기: 상자 폭에 맞추고, 낮은 가로 화면(휴대폰 가로)이면 계기판을 오른쪽에 붙여 버튼이 화면 밖으로 나가지 않게 한다
  const fit=()=>{const vh=window.innerHeight||600;X.classList.toggle('side',vh<500&&X.clientWidth>=540);const side=X.classList.contains('side');
    W=Math.max(200,Math.floor(sc.clientWidth));H=Math.round(side?Math.max(150,Math.min(330,vh-70)):Math.max(160,Math.min(W*.56,vh-290,420)));
    D=Math.min(2,window.devicePixelRatio||1);cv.width=bg.width=Math.round(W*D);cv.height=bg.height=Math.round(H*D);cv.style.width=W+'px';cv.style.height=H+'px';
    z=Math.min((W-10)/59.5,(H-10)/30.5);u=Math.max(8.5,Math.min(16,z*1.3));paint();};
  const sx=x=>W/2+x*z,sy=y=>H/2+y*z;
  // 경기장 바탕(한 번만 그려 둔다): 관중석 · 펜스와 매트 · 얼음 결 · 아이스하키 선 · 코너 고무 블록 · 출발선과 결승선
  const rr=(c,x,y,w,h,r)=>{c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const paint=()=>{const c=bx;c.setTransform(D,0,0,D,0,0);c.fillStyle='#0d1424';c.fillRect(0,0,W,H);
    const hx=SK.S/2+SK.R+6.3,hy=SK.R+6.1,rx=sx(-hx),ry=sy(-hy),rw=2*hx*z,rh=2*hy*z,cr=SK.R*z;
    // 관중석: 어두운 자리에 옷 색 점들
    for(let y=3;y<H;y+=5)for(let x=3;x<W;x+=5){if(x>rx-6&&x<rx+rw+6&&y>ry-6&&y<ry+rh+6)continue;const h=(x*7919+y*104729)%97;
      c.fillStyle=h<12?'rgba(241,213,137,.35)':h<24?'rgba(224,80,74,.3)':h<40?'rgba(159,176,200,.28)':'rgba(70,90,130,.22)';c.fillRect(x,y,2,2);}
    c.fillStyle='#1d2a44';rr(c,rx-.9*z,ry-.9*z,rw+1.8*z,rh+1.8*z,cr+.9*z);c.fill();
    c.fillStyle='#f4f7fb';rr(c,rx-.35*z,ry-.35*z,rw+.7*z,rh+.7*z,cr+.35*z);c.fill();
    // 얼음
    const ig=c.createLinearGradient(0,ry,0,ry+rh);ig.addColorStop(0,'#f2f8fc');ig.addColorStop(1,'#d9e8f3');c.fillStyle=ig;rr(c,rx,ry,rw,rh,cr);c.fill();
    c.save();rr(c,rx,ry,rw,rh,cr);c.clip();
    const sh=c.createRadialGradient(sx(-12),sy(-9),2,sx(-12),sy(-9),26*z);sh.addColorStop(0,'rgba(255,255,255,.75)');sh.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sh;c.fillRect(rx,ry,rw,rh);
    // 아이스하키 선(흐리게): 가운데 빨간 선 · 파란 선 둘 · 가운데 원
    c.globalAlpha=.16;c.fillStyle='#c8302a';c.fillRect(sx(-.15),ry,.3*z,rh);c.fillStyle='#2350a8';[-8.5,8.5].forEach(x=>c.fillRect(sx(x-.15),ry,.3*z,rh));
    c.strokeStyle='#2350a8';c.lineWidth=Math.max(1,.15*z);c.beginPath();c.arc(sx(0),sy(0),4.5*z,0,7);c.stroke();
    c.strokeStyle='#c8302a';[[-20,-7],[-20,7],[20,-7],[20,7]].forEach(([x,y])=>{c.beginPath();c.arc(sx(x),sy(y),3.4*z,0,7);c.stroke();});c.globalAlpha=1;
    // 얼음 결: 트랙을 따라 난 날 자국
    c.lineCap='round';for(let i=0;i<420;i++){const d=Math.random()*SK.L,l=Math.random()*5.5-.5,a=skXY(d,l),b=skXY(d+1.2+Math.random()*3,l+(Math.random()-.5)*.6);
      c.strokeStyle='rgba(120,150,185,'+(.06+Math.random()*.1)+')';c.lineWidth=Math.random()<.2?1.1:.6;c.beginPath();c.moveTo(sx(a[0]),sy(a[1]));c.lineTo(sx(b[0]),sy(b[1]));c.stroke();}
    // 레인 표시: 안쪽 선(점선)과 바깥 경계(흐린 선)
    [[0,'rgba(40,70,110,.28)',[3,4]],[5.6,'rgba(40,70,110,.12)',[]]].forEach(([l,s,ds])=>{c.strokeStyle=s;c.setLineDash(ds);c.lineWidth=1;c.beginPath();
      for(let d=0;d<=SK.L+.5;d+=.5){const p=skXY(d,l);d?c.lineTo(sx(p[0]),sy(p[1])):c.moveTo(sx(p[0]),sy(p[1]));}c.stroke();});c.setLineDash([]);
    // 출발선(빨강) · 결승선(검정과 흰 칸)
    const ln=(d,f)=>{const a=skXY(d,-.2),b=skXY(d,5.8);f(sx(a[0]),sy(a[1]),sx(b[0]),sy(b[1]));};
    ln(0,(x1,y1,x2,y2)=>{c.strokeStyle='rgba(200,48,42,.75)';c.lineWidth=Math.max(1.5,.18*z);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();});
    ln(SK.D,(x1,y1,x2,y2)=>{const n=8,w=Math.max(3,.35*z);for(let i=0;i<n;i++){c.fillStyle=i%2?'#f7f9fc':'#1d1b18';c.fillRect(x1-w/2,y1+(y2-y1)*i/n,w/2,(y2-y1)/n);c.fillStyle=i%2?'#1d1b18':'#f7f9fc';c.fillRect(x1,y1+(y2-y1)*i/n,w/2,(y2-y1)/n);}});
    c.restore();
    // 코너 안쪽 고무 블록(코너마다 일곱 개)
    [SK.S,2*SK.S+SK.C].forEach(p0=>{for(let i=0;i<7;i++){const p=skXY(p0-SK.P0+SK.L+SK.C*i/6,-.15),bw=Math.max(3,.55*z),bh=Math.max(2,.32*z);
      c.save();c.translate(sx(p[0]),sy(p[1]));c.rotate(p[2]);c.fillStyle='rgba(0,0,0,.18)';rr(c,-bw/2+1,-bh/2+1.2,bw,bh,bh/2);c.fill();c.fillStyle='#22262e';rr(c,-bw/2,-bh/2,bw,bh,bh/2);c.fill();
      c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-bw/2+bh/2,-bh/2+.6,bw-bh,1);c.restore();}});
    // 펜스 매트: 파란 판을 이어 붙인 띠
    c.strokeStyle='#2b5fa8';c.lineWidth=Math.max(2,.55*z);rr(c,rx+.28*z,ry+.28*z,rw-.56*z,rh-.56*z,cr-.28*z);c.stroke();
    c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=1;rr(c,rx+.05*z,ry+.05*z,rw-.1*z,rh-.1*z,cr);c.stroke();};
  // 선수 한 명(위에서 본 모습). 앞이 +x, 안쪽(코너 중심)이 -y
  const skater=(k,x,y,h)=>{const [cs,ch]=col(k),U=u,dk=k.me?'#8a6420':'rgba(0,0,0,.28)';g.save();g.translate(x,y);
    if(k.me){g.fillStyle='rgba(241,213,137,.26)';g.beginPath();g.ellipse(0,0,U*1.3,U*1.1,h,0,7);g.fill();g.strokeStyle='rgba(241,213,137,.9)';g.lineWidth=1.5;g.stroke();}
    g.fillStyle='rgba(20,40,70,.2)';g.beginPath();g.ellipse(U*.12,U*.32,U*.95,U*.45,h,0,7);g.fill();
    g.rotate(h+k.spin);g.lineCap='round';g.lineJoin='round';
    const ly=-k.lean*U*.2,pu=k.pu&&k.fall<=0,s=Math.sin(k.ph);
    const blade=(fx,fy,a)=>{g.save();g.translate(fx,fy);g.rotate(a);g.strokeStyle='#dfe7f0';g.lineWidth=Math.max(1,U*.08);g.beginPath();g.moveTo(-U*.5,0);g.lineTo(U*.5,0);g.stroke();
      g.strokeStyle='#1d1b18';g.lineWidth=U*.17;g.beginPath();g.moveTo(-U*.12,0);g.lineTo(U*.14,0);g.stroke();g.restore();};
    if(k.fall>0){// 넘어짐: 옆으로 누워 다리를 벌린 채 미끄러진다
      blade(-U*.8,U*.45,.5);blade(-U*.7,-U*.4,-.3);g.strokeStyle=cs;g.lineWidth=U*.24;g.beginPath();g.moveTo(-U*.25,U*.1);g.lineTo(-U*.7,U*.42);g.moveTo(-U*.25,-U*.1);g.lineTo(-U*.62,-U*.38);g.stroke();
      g.fillStyle=cs;g.beginPath();g.ellipse(0,0,U*.55,U*.4,0,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;g.stroke();
      g.strokeStyle=cs;g.lineWidth=U*.16;g.beginPath();g.moveTo(U*.2,U*.3);g.lineTo(U*.5,U*.75);g.moveTo(U*.2,-U*.3);g.lineTo(U*.1,-U*.8);g.stroke();
      g.fillStyle=ch;g.beginPath();g.arc(U*.6,0,U*.24,0,7);g.fill();g.restore();return;}
    // 다리와 날: 미끄러질 때는 두 다리를 몸 뒤로 모으고, 밀 때는 한쪽 다리가 번갈아 바깥 뒤로 뻗는다
    const leg=(sd,e)=>{const fx=-U*.72+U*.12*e,fy=sd*(U*.16+U*.55*e)+ly*.5;g.strokeStyle=cs;g.lineWidth=U*.26;g.beginPath();g.moveTo(-U*.28,sd*U*.13+ly);g.lineTo(fx,fy);g.stroke();
      g.strokeStyle=dk;g.lineWidth=U*.1;g.stroke();blade(fx,fy,sd*e*.45);};
    leg(1,pu?Math.max(0,s):0);leg(-1,pu?Math.max(0,-s):0);
    // 몸통: 어깨가 넓고 허리로 갈수록 좁다. 등에 줄무늬
    const bd=g.createLinearGradient(0,-U*.4+ly,0,U*.4+ly);bd.addColorStop(0,cs);bd.addColorStop(.55,cs);bd.addColorStop(1,dk);
    g.fillStyle=cs;g.beginPath();g.moveTo(U*.42,-U*.36+ly);g.quadraticCurveTo(U*.62,ly,U*.42,U*.36+ly);g.lineTo(-U*.3,U*.22+ly);g.quadraticCurveTo(-U*.48,ly,-U*.3,-U*.22+ly);g.closePath();g.fill();
    g.fillStyle=bd;g.globalAlpha=.6;g.fill();g.globalAlpha=1;g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.stroke();
    g.strokeStyle=k.me?'#fff4d6':ch;g.globalAlpha=.7;g.lineWidth=Math.max(1.2,U*.1);g.beginPath();g.moveTo(-U*.3,ly);g.lineTo(U*.4,ly);g.stroke();g.globalAlpha=1;
    // 팔: 곧은 길에서 밀면 크게 흔들고, 미끄러질 때는 뒷짐을 진다. 코너에서는 안쪽 손으로 얼음을 짚는다
    const arm=(sd,hx,hy)=>{g.strokeStyle=cs;g.lineWidth=U*.17;g.beginPath();g.moveTo(U*.36,sd*U*.3+ly);g.lineTo((U*.36+hx)/2+(hx<U*.2?-U*.05:U*.05),sd*U*.5+ly);g.lineTo(hx,hy+ly);g.stroke();
      g.strokeStyle=dk;g.lineWidth=U*.06;g.stroke();g.fillStyle='#22262e';g.beginPath();g.arc(hx,hy+ly,U*.09,0,7);g.fill();};
    if(k.lean>.5){arm(-1,U*.3,-U*1.0);if(pu)arm(1,U*.1-U*.45*s,U*.55);else arm(1,-U*.2,U*.12);}
    else if(pu){arm(1,U*.1+U*.62*s,U*.5);arm(-1,U*.1-U*.62*s,-U*.5);}else{arm(1,-U*.22,U*.1);arm(-1,-U*.22,-U*.1);}
    // 헬멧과 고글
    g.fillStyle=ch;g.beginPath();g.arc(U*.64,ly,U*.25,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1;g.stroke();
    g.fillStyle='rgba(20,28,44,.85)';g.beginPath();g.arc(U*.64,ly,U*.25,-.95,.95);g.lineTo(U*.72,ly);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(U*.58,ly-U*.08,U*.07,0,7);g.fill();
    g.restore();};
  // 코너 입구 표시: 다음 코너 안쪽 레인을 우리 속도에 따라 물들인다(한계 아래 흰빛 · 살짝 넘음 노랑 · 크게 넘음 빨강)
  const cue=()=>{if(me.t||st==='ready'||me.d>SK.D-SK.C-8)return;const toC=skToC(me.d),inC=!toC;if(!inC&&toC>20)return;
    const p=skP(me.d),a0=me.d+toC,a1=inC?me.d+(p<2*SK.S+SK.C?SK.S+SK.C-p:SK.L-p):a0+SK.C,o=(inC?me.v:skGl(me.v,toC))-SK.VC;
    const cl=o>.25?'224,80,74':o>0?'233,177,60':'120,200,160';g.lineCap='round';
    [[Math.max(5,1.5*z),.16],[Math.max(2,.45*z),.75]].forEach(([w,al])=>{g.strokeStyle='rgba('+cl+','+al+')';g.lineWidth=w;g.beginPath();
      for(let d=a0;d<=a1;d+=.6){const q=skXY(d,.9);d===a0?g.moveTo(sx(q[0]),sy(q[1])):g.lineTo(sx(q[0]),sy(q[1]));}g.stroke();});};
  // 가운데 바퀴 판: 남은 바퀴와 지금 순서(헬멧 색)
  const board=()=>{const bw=Math.min(SK.S*z*.62,150),bh=Math.min(2*SK.R*z*.62,64),x=W/2-bw/2,y=H/2-bh/2,o=order();
    g.fillStyle='rgba(13,20,36,.86)';rr(g,x,y,bw,bh,8);g.fill();g.strokeStyle='rgba(241,213,137,.45)';g.lineWidth=1;g.stroke();
    const fs=Math.max(15,Math.min(30,bh*.46)),lp=me.t?'끝':skLap(me.d),last=lp==='1';
    g.fillStyle='#9fb0c8';g.font='700 '+Math.max(9,fs*.34)+'px '+FF;g.textAlign='center';g.textBaseline='top';g.fillText(last?'마지막 바퀴':'남은 바퀴',W/2,y+bh*.08);
    g.fillStyle=last&&!RM&&Math.sin(el*9)>0?'#ff8a80':'#ffe08a';g.font='800 '+fs+'px '+FF;g.textBaseline='middle';g.fillText(lp,W/2,y+bh*.53);
    const r=Math.max(2.5,Math.min(5,bh*.07));o.forEach((k,i)=>{const cx=W/2+(i-1.5)*r*3.4,cy=y+bh-r*1.9;g.fillStyle=col(k)[k.me?0:1];g.beginPath();g.arc(cx,cy,r,0,7);g.fill();
      if(k.me){g.strokeStyle='#fff4d6';g.lineWidth=1.2;g.stroke();}});};
  const order=()=>all.slice().sort((a,b)=>a.t&&b.t?a.t-b.t:a.t?-1:b.t?1:b.d-a.d);
  // 얼음 가루: 밀려날 때 · 넘어질 때 · 코너에서 한계를 긁을 때 날 바깥쪽으로 튄다
  const spray=(k,n,f)=>{if(RM)n=Math.ceil(n/3);const p=skXY(k.d,Math.min(5.6,k.ln+k.sx)),nx=-Math.sin(p[2]),ny=Math.cos(p[2]);
    for(let i=0;i<n&&parts.length<260;i++)parts.push({x:p[0]+nx*.4,y:p[1]+ny*.4,vx:nx*(2+Math.random()*4)*f+Math.cos(p[2])*k.v*.25+(Math.random()-.5)*2,vy:ny*(2+Math.random()*4)*f+Math.sin(p[2])*k.v*.25+(Math.random()-.5)*2,l:.35+Math.random()*.4,r:Math.random()<.3?2:1.3});};
  const draw=()=>{g.setTransform(D,0,0,D,0,0);g.drawImage(bg,0,0,W,H);
    if(!RM){sheen=(sheen+.004)%1.6;const hx=SK.S/2+SK.R+6.3,x=sx(-hx)+(sheen-.3)*W*1.1,lg=g.createLinearGradient(x-60,0,x+60,0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,255,255,.13)');lg.addColorStop(1,'rgba(255,255,255,0)');
      g.save();rr(g,sx(-hx),sy(-SK.R-6.1),2*hx*z,2*(SK.R+6.1)*z,SK.R*z);g.clip();g.fillStyle=lg;g.fillRect(x-60,0,120,H);g.restore();}
    cue();if(!me.t&&st!=='count')board();
    parts.forEach(p=>{g.fillStyle='rgba(255,255,255,'+Math.min(.95,p.l*2)+')';g.beginPath();g.arc(sx(p.x),sy(p.y),p.r,0,7);g.fill();});
    all.map(k=>{const p=skXY(k.d,Math.min(5.6,k.ln+k.sx));return [k,sx(p[0]),sy(p[1]),p[2]];}).sort((a,b)=>a[2]-b[2]).forEach(a=>skater(a[0],a[1],a[2],a[3]));
    // 우리 선수 이름표(늘 똑바로, 위가 모자라면 아래에)
    const p=skXY(me.d,Math.min(5.6,me.ln+me.sx)),tx=sx(p[0]),fs=Math.max(10,Math.min(12,u)),ty=sy(p[1])-u*1.55<fs+2?sy(p[1])+u*1.55+fs:sy(p[1])-u*1.55;
    g.font='800 '+fs+'px '+FF;g.textAlign='center';g.textBaseline='bottom';
    g.lineWidth=3;g.strokeStyle='rgba(13,20,36,.85)';g.strokeText('우리',tx,ty);g.fillStyle='#ffe08a';g.fillText('우리',tx,ty);};
  const hud=()=>{const kmh=me.v*SK.KM,inC=skIn(me.d)&&!me.t,toC=skToC(me.d),warn=!me.t&&st==='race'&&toC>0&&SK.D-me.d>toC&&skGl(me.v+.3,toC-me.v*.3)>SK.VC;   // 사람 손이 늦는 만큼(0.3초) 미리 알린다
    $('skT').textContent=(fin||Math.max(0,el)).toFixed(2);$('skV').textContent=Math.round(kmh);$('skSpF').style.width=Math.min(100,me.v/SK.GX*100)+'%';
    $('skSp').className='sk-g sk-sp'+(inC&&me.over>0?' x':warn?' w':'');$('skEnF').style.width=(me.E*100).toFixed(1)+'%';$('skEn').className='sk-g sk-en'+(me.E<.2?' lo':'');
    $('skCn').textContent=st!=='race'||me.t?'코너 한계 '+Math.round(SK.VC*SK.KM):inC?(me.over>0?'과속!':'코너'):warn?'지금 떼라':'코너까지 '+Math.ceil(toC)+'m';
    $('skCn').className=inC&&me.over>0||warn?'x':'';
    const o=order(),r=o.indexOf(me)+1;$('skRk').textContent=st==='ready'?'-':r+'위';$('skLp').textContent=me.t?'끝':skLap(me.d);return r;};
  // 고정 간격 한 걸음: 선수들 · 줄 바꾸기 · 경기 중 일어난 일(미끄러짐 · 넘어짐 · 마지막 바퀴 · 앞지르기)
  const tick=dt=>{el+=dt;if(el<0)return;const P=inp()&&st==='race';
    all.forEach(k=>{const ns=k.ns,nf=k.nf;skStep(k,k.me?P:el>=k.rt&&skAI(k),dt);
      if(k.pu)k.ph+=dt*(2.4+k.v*.3);
      k.lean+=((skIn(k.d)&&k.v>5&&k.fall<=0?1:0)-k.lean)*Math.min(1,dt*6);if(k.fall>0)k.spin+=dt*(3+k.v*.4);else{if(k.spin>Math.PI)k.spin=(k.spin+Math.PI)%(2*Math.PI)-Math.PI;k.spin*=Math.max(0,1-dt*8);}
      if(k.ns>ns){spray(k,10,1);if(k.me){skS(skSnd.slide);say('<b class="x">코너 과속!</b> 바깥으로 밀려 속도를 잃었다',2.2);}else if(!me.t)say(k.n+' 선수가 코너에서 밀려났다',1.8);}
      if(k.nf>nf){spray(k,22,1.4);skS(skSnd.fall);if(k.me)say('<b class="x">넘어졌다!</b> 코너에 너무 빨리 들어갔다',2.6);else if(!me.t)say(k.n+' 선수가 넘어졌다!',2);}
      if((k.sw||k.fall>0)&&Math.random()<.6)spray(k,1,.8);else if(k.over>0&&Math.random()<.35)spray(k,1,.5);
      if(skFin(k,el)){if(k.me)fin=k.t;else if(!me.t)skS(()=>clk(1400,.3));}});
    // 같은 걸음에 함께 들어온 상대가 있으면 그 기록(걸음 안에서 나눈 시각)까지 본 뒤 순위를 정한다
    if(fin&&st==='race'){place=1+riv.filter(r=>r.t&&r.t<=fin).length;skS(skSnd.line);finish();}
    skLane(all,dt,Math.max(1.2,u*1.15/z));
    if(me.pu&&(sndT-=dt)<=0){sndT=.32-Math.min(.12,me.v*.008);skS(skSnd.scr);}
    if(!me.t){if(skLap(me.d)==='1'&&!lapSaid){lapSaid=1;skS(skSnd.bell);say('<b class="g">마지막 바퀴!</b> 남은 체력을 다 쏟아라',2.4);}
      if(me.E<.06&&me.pu&&msgT<=0)say('체력이 바닥났다 · 잠깐 떼어 숨을 고르자',1.6);
      const toC=skToC(me.d);if(tipC<2&&toC>0&&toC<14&&skGl(me.v,toC)>SK.VC+.25&&msgT<=0){tipC++;say('코너가 다가온다 · <b>손을 떼어</b> 속도를 줄여라',1.8);}}};
  const finish=()=>{st='done';endAt=el;const t=Math.min(3,place-1);res=t;ptr.clear();keyOn=0;$('skPush').classList.remove('on');
    $('skOv').innerHTML='<div class="sk-fx'+(t===0?' g':'')+'">'+place+'위<small>'+fin.toFixed(2)+'초</small></div>';
    setTimeout(()=>{if(!box.isConnected)return;skS(()=>SFX.medal(t));say('<b class="'+(t<3?'g':'x')+'">'+place+'위 · '+fin.toFixed(2)+'초</b> · '+['금메달!','은메달','동메달','메달을 놓쳤다'][t]+(me.nf?' (넘어짐 '+me.nf+'번)':me.ns?' (코너 밀림 '+me.ns+'번)':''),0);
      $('skPush').style.display='none';const b=$('skGo');b.style.display='';b.textContent='결과 보기';b.onclick=()=>{if(ended)return;ended=true;skS(SFX.click);stop();done(t);};},700);};
  const loop=now=>{raf=0;if(!box.isConnected){stop();return;}const dr=last?Math.min(.1,(now-last)/1000):0;last=now;
    if(st==='race'||st==='done'){acc+=dr*SK.TS;while(acc>=SK.DT){acc-=SK.DT;tick(SK.DT);}}
    parts.forEach(p=>{p.x+=p.vx*dr;p.y+=p.vy*dr;p.vx*=.92;p.vy*=.92;p.l-=dr;});parts=parts.filter(p=>p.l>0);if(msgT>0&&(msgT-=dr)<=0&&st==='race')say('');
    draw();const r=hud();if(st==='race'&&r<rk&&msgT<=0)say('<b class="g">앞질렀다!</b> '+r+'위',1.1);if(st==='race')rk=r;
    // 우리가 들어온 뒤 모두 들어오면(또는 4초가 지나면) 그림을 멈춘다
    if(st==='done'&&(all.every(k=>k.t)&&el-endAt>1.2||el-endAt>6)){st='over';draw();unkey();return;}
    raf=requestAnimationFrame(loop);};
  const kd=e=>{if(e.key!==' '&&e.key!=='ArrowUp')return;if(st==='ready'){if(e.target&&e.target.tagName==='BUTTON')return;e.preventDefault();go();return;}
    if(st==='count'||st==='race'){e.preventDefault();if(!e.repeat)keyOn=1;$('skPush').classList.toggle('on',inp());}};
  const ku=e=>{if(e.key===' '||e.key==='ArrowUp'){keyOn=0;$('skPush').classList.toggle('on',inp());}},bl=()=>{keyOn=0;ptr.clear();$('skPush').classList.remove('on');};
  let rzT=0;const rz=()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(box.isConnected){fit();if(!raf)draw();}else stop();},120);};
  // 경기가 끝나 그림을 멈춘 뒤에도 화면 돌리기(크기 바뀜)는 듣는다. 상자가 빠지면 그때 마저 뗀다
  const unkey=()=>{document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);window.removeEventListener('blur',bl);};
  const stop=()=>{if(raf)cancelAnimationFrame(raf);raf=0;unkey();window.removeEventListener('resize',rz);};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);window.addEventListener('blur',bl);window.addEventListener('resize',rz);
  // 밀기: 버튼이나 경기장 그림 어디든 누르고 있는 동안. 손가락이 여럿이어도 하나라도 닿아 있으면 민다
  [$('skPush'),sc].forEach(el0=>{const dn=e=>{if(st!=='count'&&st!=='race')return;e.preventDefault();ptr.add(e.pointerId);try{el0.setPointerCapture(e.pointerId);}catch(x){}$('skPush').classList.add('on');},
    up=e=>{ptr.delete(e.pointerId);$('skPush').classList.toggle('on',inp());};
    el0.addEventListener('pointerdown',dn);['pointerup','pointercancel','lostpointercapture','pointerleave'].forEach(n=>el0.addEventListener(n,up));el0.addEventListener('contextmenu',e=>e.preventDefault());});
  const go=()=>{if(st!=='ready')return;st='count';skS(SFX.click);$('skGo').style.display='none';$('skPush').style.display='';const ov=$('skOv');let c=3;
    const show=s=>{ov.innerHTML='<div class="sk-cd'+(RM?'':' pop')+'">'+s+'</div>';};show(c);say('출발 신호와 함께 <b>밀기</b>를 누르고 있어라');skS(()=>SFX.beep(3));
    const iv=setInterval(()=>{if(!box.isConnected){clearInterval(iv);return;}c--;if(c>0){show(c);skS(()=>SFX.beep(c));}
      else{clearInterval(iv);show('출발!');skS(()=>{SFX.beep(0);skSnd.gun();});st='race';el=0;acc=0;say('');setTimeout(()=>{if(st==='race'||st==='done')ov.innerHTML=st==='race'?'':ov.innerHTML;},650);}},700);};
  $('skGo').onclick=go;
  $('skOv').innerHTML='<div class="sk-br"><b>누르면 밀고, 떼면 미끄러진다</b><span>곧은 길에서 밀어 속도를 올리고, 코너 앞에서 떼어 <em>'+Math.round(SK.VC*SK.KM)+'km/h</em>(속도계 금색 눈금) 아래로 들어가라. 마지막 바퀴에 쓸 체력을 남겨 둬라.</span></div>';
  say(TCH?'<b>밀기</b> 버튼이나 경기장을 누르고 있으면 민다':'스페이스 · ↑ 키나 <b>밀기</b> 버튼을 누르고 있으면 민다');
  fit();raf=requestAnimationFrame(loop);}
// 시뮬레이션: 우리 선수도 상대와 같은 판단(skAI)으로 탄다. 코너 여유와 판단 어긋남은 경기마다 다르다(가끔 과속으로 밀려나거나 넘어진다)
function simSkate(){const riv=skRivals(),me=skMk('우리',{me:1,vt:1,mg:Math.abs(skGauss())*.14,ae:.12,slp:.025,st:SK_STY[Math.floor(Math.random()*3)],rt:.12+Math.random()*.2}),all=[me].concat(riv),ev=[];
  let el=0;while(el<90&&all.some(k=>!k.t)){el+=SK.DT;all.forEach(k=>{const ns=k.ns,nf=k.nf;skStep(k,el>=k.rt&&skAI(k),SK.DT);skFin(k,el);
    if(k.nf>nf||k.ns>ns&&k.me)ev.push('<span class="k">'+(skLap(k.d)==='1'?'마지막 바퀴':(skLap(k.d)==='4½'?'첫 코너':skLap(k.d)+'바퀴 남기고'))+'</span>'+(k.me?'우리 선수':k.n+' 선수')+'가 코너에서 '+(k.nf>nf?'넘어졌다':'밀려났다'));});}
  const L=all.map(k=>({n:k.n,t:k.t||99,me:k.me})).sort((a,b)=>a.t-b.t),place=L.findIndex(r=>r.me)+1,t=Math.min(3,place-1),mt=me.t||0;
  return {lines:ev.slice(0,2).concat(L.map((r,i)=>'<span class="k">'+(i+1)+'위</span>'+(r.me?'<b class="me">우리 선수</b>':r.n)+' · '+(r.t<99?r.t.toFixed(2)+'초':'기권'))),
    head:(mt?mt.toFixed(2)+'초 · ':'')+SK_MED[t],t:t};}
