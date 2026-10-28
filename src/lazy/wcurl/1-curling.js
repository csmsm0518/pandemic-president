/* ---------- 컬링 결승 · 마지막 엔드 ----------
   동점으로 맞은 마지막 엔드. 상대가 먼저, 우리가 나중에 네 개씩 번갈아 던지고 마지막 돌(망치)은 우리가 쥐었다.
   끝났을 때 버튼(하우스 한가운데)에 가장 가까운 돌이 우리 것이면 금메달, 상대 것이거나 하우스가 비면 은메달.
   물리는 m·초 단위다. 얼음 마찰로 일정하게 느려지고, 회전한 쪽으로 머리가 돌아가는데 느려질수록 더 많이 돈다(끝에서 휘어 들어온다).
   돌끼리는 무게가 같아 거의 그대로 힘을 넘겨준다. 실제보다 두 배쯤 빨리 돌린다(드로 한 번이 7초 남짓).
   상대 인공지능도 같은 물리로 후보 투구를 미리 굴려 보고 가장 나은 것을 고른 뒤, 사람처럼 조금 빗나가게 던진다. */
// 시트(가로 4.75m): 던지는 곳(앞 호그라인)이 y=0. 먼 호그라인 21.95, 티 라인 28.35, 백 라인 30.18. 하우스 반지름 1.83, 돌 반지름 0.145
// MU 마찰 감속(m/s²), K·V1 휘는 정도(머리가 도는 빠르기 K/(v+V1)²), E 부딪힐 때 남는 힘, SWF·SWC 스위핑을 꽉 채웠을 때 줄어드는 마찰·휨
const CU={W:4.75,HOG:21.95,TEE:28.35,BACK:30.18,R:.145,HR:1.83,MU:1.1,K:.86,V1:2,E:.86,DT:1/120,SWF:.16,SWC:.5};
const CU_KN={d:'드로',g:'가드',t:'테이크아웃',c:'컴어라운드'},CU_KO={d:'드로를',g:'가드를',t:'테이크아웃을',c:'컴어라운드를'};
// 던질 때 흔들림: v 세기(배율), a 방향(라디안), b 스위핑 판단(m). 상대 · 시뮬레이션의 우리 팀 · 직접 던지는 사람(손 떨림 정도만)
const CU_NZR={v:.012,a:.0032,b:.28},CU_NZU={v:.022,a:.006,b:.5},CU_NZP={v:.004,a:.0012,b:0};
const CU_NAT=['스웨덴','캐나다','스위스','영국','일본','노르웨이','미국','중국','이탈리아','덴마크'];
const cuG=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
// 세기 게이지(0~1) ↔ 미끄러질 거리(m). 아래 72%는 가드·드로(17~34m)를 넓게 쓰고, 위 28%는 테이크아웃(34~70m)
const cuPL=p=>p<.72?17+p/.72*17:34+(p-.72)/.28*36,cuLP=L=>L<34?Math.max(0,(L-17)/17*.72):Math.min(1,.72+(L-34)/36*.28);
const cuV=L=>Math.sqrt(2*CU.MU*L);
// 돌 하나를 dt초 움직인다. 회전한 쪽으로 머리를 조금 돌리고(속도 크기는 그대로), 마찰만큼 늦춘다
function cuMove(o,dt,sw){const v=Math.hypot(o.vx,o.vy),nv=v-CU.MU*(1-CU.SWF*sw)*dt;if(nv<=0){o.vx=o.vy=0;o.m=0;o.w=0;return;}
  const q=o.w*CU.K*(1-CU.SWC*sw)/((v+CU.V1)*(v+CU.V1))*dt,c=Math.cos(q),s=Math.sin(q),f=nv/v,vx=o.vx,vy=o.vy;
  o.vx=(vx*c+vy*s)*f;o.vy=(vy*c-vx*s)*f;o.x+=o.vx*dt;o.y+=o.vy*dt;o.a+=o.w*(1+v*.1)*dt;}
// 스위핑 판단(인공지능): 지금 속도로 멈출 거리가 목표까지보다 짧으면 쓴다. 테이크아웃 · 이미 부딪힌 돌은 쓸지 않는다
const cuAuto=(s,c,b)=>{if(c.k==='t'||s.hit)return 0;const v=Math.hypot(s.vx,s.vy);if(v<.08)return 0;
  const ux=s.vx/v,uy=s.vy/v;return v*v/(2*CU.MU)<(c.P[0]-s.x)*ux+(c.P[1]-s.y)*uy+b-.04?1:0;};
// 투구 하나(T)를 dt초 진행한다. sw: 사람이 쓰는 스위핑(0~1), 없으면 인공지능이 정한다. 움직이는 돌이 남았으면 true
function cuTick(T,dt,sw){const S=T.S,s=T.s,R2=4*CU.R*CU.R;if(sw==null)sw=T.c?cuAuto(s,T.c,T.b):0;T.sw=sw;
  for(const o of S)if(o.m&&!o.out)cuMove(o,dt,o===s?sw:0);
  for(let i=0;i<S.length;i++){const A=S[i];if(A.out)continue;
    for(let j=i+1;j<S.length;j++){const B=S[j];if(B.out||!(A.m||B.m))continue;const dx=B.x-A.x,dy=B.y-A.y,d2=dx*dx+dy*dy;if(d2>=R2)continue;
      const d=Math.sqrt(d2)||1e-4,nx=dx/d,ny=dy/d,vn=(A.vx-B.vx)*nx+(A.vy-B.vy)*ny;
      if(vn>0){const J=(1+CU.E)/2*vn;A.vx-=J*nx;A.vy-=J*ny;B.vx+=J*nx;B.vy+=J*ny;A.m=B.m=1;A.w*=.5;B.w*=.5;A.hit=B.hit=1;if(T.hits)T.hits.push(vn);}
      const ov=(2*CU.R-d)/2;A.x-=nx*ov;A.y-=ny*ov;B.x+=nx*ov;B.y+=ny*ov;}}
  // 옆 벽에 닿거나 백 라인을 완전히 넘으면 경기에서 빠진다
  let mv=false;for(const o of S){if(o.out||!o.m)continue;if(Math.abs(o.x)>CU.W/2-CU.R||o.y>CU.BACK+CU.R){o.out=1;o.m=0;o.why=o.y>CU.BACK?'back':'side';}else mv=true;}
  return mv;}
// 던지기: 각도 th(0이면 곧장 앞, +면 오른쪽), w 회전(+1 시계 방향 → 오른쪽으로 휜다, -1 반시계)
function cuLaunch(S,c,tm,nz){const z=nz||{v:0,a:0,b:0},v0=c.v0*(1+cuG()*z.v),th=c.th+cuG()*z.a,
    s={x:0,y:0,vx:v0*Math.sin(th),vy:v0*Math.cos(th),w:c.w,tm:tm,a:Math.random()*6.3,m:1,out:0,hit:0,why:''};
  S.push(s);return {S:S,s:s,c:c,b:cuG()*z.b,sw:0};}
// 먼 호그라인을 완전히 넘지 못한 돌은 걷어 낸다
const cuSettle=T=>{const s=T.s;if(!s.out&&s.y<CU.HOG+CU.R){s.out=1;s.why='hog';}};
function cuShot(S,c,tm,nz){const T=cuLaunch(S,c,tm,nz);let k=0;while(cuTick(T,CU.DT,null)&&++k<9000);cuSettle(T);return T.s;}
const cuClone=S=>S.map(o=>Object.assign({},o));
// 다른 돌이 없을 때 곧장 앞으로 던진 돌의 길(얼음이 고르니 다른 방향은 이 길을 돌리면 된다). sw는 스위핑 판단에 쓸 목표
function cuFree(v0,w,c,step){const s={x:0,y:0,vx:0,vy:v0,w:w,m:1,a:0},P=[[0,0]];let k=0;
  while(s.m&&++k<9000){cuMove(s,CU.DT,c?cuAuto(s,c,0):0);if(step&&k%step===0)P.push([s.x,s.y]);}P.push([s.x,s.y]);return step?P:[P[1]];}
const cuRot=(p,th)=>[p[0]*Math.cos(th)+p[1]*Math.sin(th),-p[0]*Math.sin(th)+p[1]*Math.cos(th)],cuAng=p=>Math.atan2(p[0],p[1]);
// P에 멈추는 드로: 멈출 거리를 맞춘 뒤 휘는 만큼 각도를 돌린다. 인공지능은 3% 짧게 던지고 스위핑으로 채운다(길면 고칠 수 없으니)
// 같은 목표는 답이 같으니(물리에 우연이 없다) 한 번 구한 것을 기억해 둔다
const CU_AIM=new Map();
function cuAimDraw(P,w,sweep){const key=Math.round(P[0]*100)+','+Math.round(P[1]*100)+','+w+','+(sweep?1:0),m=CU_AIM.get(key);if(m)return Object.assign({},m,{P:P});
  const D=Math.hypot(P[0],P[1]);let L=D,E;for(let i=0;i<3;i++){E=cuFree(cuV(L),w)[0];L*=D/Math.hypot(E[0],E[1]);}
  const c={v0:cuV(L),th:cuAng(P)-cuAng(E),w:w,P:P,k:'d'};if(!sweep){if(CU_AIM.size<4000)CU_AIM.set(key,c);return Object.assign({},c);}
  c.v0*=Math.sqrt(.97);for(let i=0;i<2;i++){const T=cuFree(c.v0,w,{k:'d',P:cuRot(P,-c.th)});c.th=cuAng(P)-cuAng(T[0]);}if(CU_AIM.size<4000)CU_AIM.set(key,c);return Object.assign({},c);}
// P에 있는 돌을 세기 v0로 맞힌다: 길 위에서 P까지와 같은 거리인 점을 찾아 그쪽으로 돌린다
function cuAimHit(P,v0,w){const D=Math.hypot(P[0],P[1]),T={x:0,y:0,vx:0,vy:v0,w:w,m:1,a:0};
  while(T.m&&Math.hypot(T.x,T.y)<D)cuMove(T,CU.DT,0);if(!T.m)return null;return {v0:v0,th:cuAng(P)-cuAng([T.x,T.y]),w:w,P:P,k:'t'};}
// 점수: 버튼에 가까운 순으로, 하우스에 닿은 돌만 센다. 가장 가까운 쪽이 상대의 가장 가까운 돌보다 안쪽인 돌 수만큼 낸다
function cuScore(S){const H=S.filter(o=>!o.out).map(o=>({s:o,d:Math.hypot(o.x,o.y-CU.TEE)})).filter(o=>o.d<=CU.HR+CU.R).sort((a,b)=>a.d-b.d);
  if(!H.length)return {tm:'',n:0,H:H};let n=0;while(n<H.length&&H[n].s.tm===H[0].s.tm)n++;return {tm:H[0].s.tm,n:n,H:H};}
// 판세 어림(tm 쪽에서 본 값). 점수 나는 돌마다 1점이되, 상대가 던질 돌이 남았는데 앞을 막는 가드가 없으면 쳐내기 쉬우니 반만 친다.
// 망치가 없는 상대는 가운데 가드를 반기고(돌을 숨겨 훔치려), 망치를 쥔 우리는 하우스 앞을 비워 두고 싶어 한다
function cuEval(S,tm,i){const sc=cuScore(S);if(i===7)return sc.tm==='u'?(tm==='u'?1:-1)*(1+sc.n*.02):(tm==='u'?0:1);
  const left=t=>{let n=0;for(let j=i+1;j<8;j++)if((j%2?'u':'r')===t)n++;return n;};let v=0;
  if(sc.n){const sg=sc.tm===tm?1:-1,lo=left(sc.tm==='u'?'r':'u');
    for(let k=0;k<sc.n;k++){const s=sc.H[k].s,gd=S.some(g=>g!==s&&!g.out&&g.y<s.y-.35&&g.y>CU.HOG&&Math.abs(g.x-s.x)<.3);v+=sg*(lo?(gd?.95:.5):1);}
    v+=sg*.3*(1-sc.H[0].d/(CU.HR+CU.R));}
  sc.H.forEach(o=>{v+=o.s.tm===tm?.08:-.08;});
  S.forEach(g=>{if(g.out||g.y<CU.HOG||g.y>CU.TEE-CU.HR-CU.R)return;const c=Math.abs(g.x)<.75?1:.4;v+=(tm==='r'?(i===0?1:i===2?.65:.3):-.12)*c;});
  return v;}
// 후보 투구: 버튼 둘레 드로, 가드, 상대 돌 테이크아웃, 가드 뒤로 돌아 들어가기
function cuCands(S,tm,i){const C=[],W=[1,-1],op=tm==='u'?'r':'u',T=CU.TEE,add=c=>{if(c)C.push(c);};
  [[0,T],[.42,T-.1],[-.42,T-.1],[0,T-.55],[0,T+.45]].forEach(P=>W.forEach(w=>add(cuAimDraw(P,w,1))));
  const sc=cuScore(S),sh=sc.n&&sc.tm===tm?sc.H[0].s:null;
  (sh?[[sh.x,sh.y-2.6],[0,CU.HOG+2.4]]:[[0,CU.HOG+2.4],[.55,CU.HOG+3.1],[-.55,CU.HOG+3.1]]).forEach(P=>W.forEach(w=>{const c=cuAimDraw(P,w,1);if(c){c.k='g';add(c);}}));
  S.forEach(o=>{if(o.out||o.y<CU.HOG)return;const hit=o.tm===op&&o.y>T-CU.HR-.3||tm==='u'&&o.y<T-CU.HR&&Math.abs(o.x)<.9;
    if(hit)[0,.09,-.09].forEach(dx=>W.forEach(w=>add(cuAimHit([o.x+dx,o.y],cuV(48),w))));
    if(o.y<T-CU.HR&&Math.abs(o.x)<1.3)W.forEach(w=>{const c=cuAimDraw([o.x,Math.min(T+.2,o.y+2.1)],w,1);if(c){c.k='c';add(c);}});});
  return C;}
// 후보마다 지금 판 위에 굴려 보고 판세가 가장 좋은 것을 고른다. 마지막 두 돌은 흔들림을 넣어 세 번씩 굴려 본다(아슬아슬한 수를 피하게)
function cuAI(S,tm,i){const C=cuCands(S,tm,i),n=i>=6?3:1,nz=tm==='u'?CU_NZU:CU_NZR;let best=C[0],bv=-1e9;
  for(const c of C){let v=0;for(let k=0;k<n;k++){const X=cuClone(S);cuShot(X,c,tm,k?nz:null);v+=cuEval(X,tm,i);}if(v/n>bv){bv=v/n;best=c;}}
  return best;}
// 투구 결과 한 줄(던진 쪽 기준이 아니라 우리 · 상대로 적는다)
function cuWhat(pre,S,s,tm,k){const op=tm==='u'?'r':'u',nm=t=>t==='u'?'우리':'상대',gone=S.filter((o,j)=>j<pre.length&&!pre[j]&&o.out),
    ko=gone.filter(o=>o.tm===op).length,own=gone.filter(o=>o.tm===tm).length,sc=cuScore(S),inH=sc.H.some(o=>o.s===s),miss=k==='t'&&!ko;
  let t=s.out?(s.why==='hog'?'호그라인을 못 넘었다':s.why==='side'?'옆 벽에 닿아 빠졌다':ko?'':miss?'빗나가 지나쳤다':'하우스를 지나쳤다')
    :inH?(sc.H[0].s===s?'1번 스톤':'하우스 안')+(miss?'(빗나감)':''):k==='g'?'하우스 앞을 막았다':miss?'빗나가 하우스 앞에 섰다':'짧아서 하우스 앞에 섰다';
  if(ko)t=nm(op)+' 돌 '+(ko>1?ko+'개 ':'')+'쳐냄'+(t?' · '+t:'');if(own)t+=' · '+nm(tm)+' 돌도 빠짐';return t;}
const cuHead=sc=>sc.tm==='u'?'우리 '+sc.n+'점 · 금메달':sc.tm==='r'?'상대 '+sc.n+'점 스틸 · 은메달':'득점 없음 · 은메달';
const cuNat=()=>{const h=OLY_HOME(),L=CU_NAT.filter(n=>n!==h);return L[Math.floor(Math.random()*L.length)];};

/* ---- 그림 재료: 화강암 돌(손잡이 색으로 편을 가른다)과 얼음 알갱이(페블) ---- */
const CU_SPR={};
function cuRR(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function cuSprite(tm){if(CU_SPR[tm])return CU_SPR[tm];const n=128,r=n/2,c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d'),
    [c1,c2]=tm==='u'?['#fff0b8','#d99d22']:['#ff9a90','#b3232b'];
  let gr=g.createRadialGradient(r*.72,r*.68,r*.08,r,r,r);gr.addColorStop(0,'#c4c8ce');gr.addColorStop(.62,'#868b93');gr.addColorStop(1,'#4b4f56');
  g.fillStyle=gr;g.beginPath();g.arc(r,r,r-1,0,6.2832);g.fill();
  for(let k=0;k<520;k++){const a=Math.random()*6.2832,d=Math.sqrt(Math.random())*(r-4),z=Math.random()*2.2+.6;g.fillStyle=Math.random()<.55?'rgba(28,30,36,.34)':'rgba(248,248,250,.3)';g.fillRect(r+Math.cos(a)*d,r+Math.sin(a)*d,z,z);}
  g.strokeStyle='rgba(18,20,26,.4)';g.lineWidth=r*.08;g.beginPath();g.arc(r,r,r*.9,0,6.2832);g.stroke();   // 부딪히는 띠
  g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=r*.03;g.beginPath();g.arc(r,r,r*.78,0,6.2832);g.stroke();
  gr=g.createRadialGradient(r*.86,r*.84,r*.04,r,r,r*.48);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.beginPath();g.arc(r,r,r*.44,0,6.2832);g.fill();
  g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=r*.035;g.stroke();
  g.save();g.translate(r,r);g.fillStyle='rgba(0,0,0,.32)';cuRR(g,-r*.12+3,-r*.66+4,r*.24,r*1.04,r*.12);g.fill();
  const hg=g.createLinearGradient(-r*.12,0,r*.12,0);hg.addColorStop(0,c2);hg.addColorStop(.42,c1);hg.addColorStop(1,c2);g.fillStyle=hg;cuRR(g,-r*.12,-r*.66,r*.24,r*1.04,r*.12);g.fill();
  g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;g.stroke();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-r*.035,-r*.58,r*.05,r*.72);g.restore();
  return CU_SPR[tm]=c;}
function cuPebble(D){const n=Math.round(150*D),c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');
  for(let k=0;k<n*n/55;k++){const x=Math.random()*n,y=Math.random()*n,r=(.45+Math.random()*1.1)*D;g.fillStyle=Math.random()<.6?'rgba(255,255,255,.55)':'rgba(120,150,185,.16)';g.beginPath();g.arc(x,y,r,0,6.2832);g.fill();}
  return c;}
const cuRM=()=>{try{return typeof reduceFx==='function'?reduceFx():matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}};
// 소리: 미끄러지는 돌의 웅웅거림(이어지는 갈색 잡음을 낮게 거른다), 화강암끼리 딱 부딪히는 소리, 비질 소리
function cuHum(){if(typeof AU==='undefined'||!AU.ac)return null;try{const ac=AU.ac,n=ac.sampleRate,b=ac.createBuffer(1,n,n),d=b.getChannelData(0);let l=0;
    for(let k=0;k<n;k++){l=(l+.02*(Math.random()*2-1))/1.02;d[k]=l*7;}
    const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;s.loop=true;f.type='lowpass';f.frequency.value=340;g.gain.value=0;
    s.connect(f);f.connect(g);g.connect(AU.m);s.start();return {ac:ac,s:s,f:f,g:g};}catch(e){return null;}}
const cuClack=v=>{const k=Math.min(1,v/7);try{clk(1900,.35+.6*k);clk(3100,.25*k,.004);tone(760,'triangle',.07,.04+.12*k);noise(.06,.04+.12*k,0,5200);}catch(e){}};
const cuSwish=()=>{try{sweep(.11,.035,2600,1100,0,1.3);}catch(e){}};
const CU_SHOUT=['영미~!','영미~!','영미야~!!','영미 영미!','헐! 헐!','더! 더!'];

function mgCurl(box,done){const $=id=>document.getElementById(id),RM=cuRM(),home=OLY_HOME(),opn=cuNat(),base=4+Math.floor(Math.random()*4);
  box.innerHTML='<div class="mgx cu" id="cuX">'+
   '<div class="cu-sb"><div class="u"><span>'+home+'</span><b id="cuPu"></b></div><div class="c"><strong>'+base+' : '+base+'</strong><em id="cuRd">결승 · 마지막 엔드</em></div><div class="r"><span>'+opn+'</span><b id="cuPr"></b></div></div>'+
   '<div class="cu-sc" id="cuSc"><canvas id="cuC"></canvas><div class="cu-ov" id="cuOv"></div></div>'+
   '<div class="cu-pn"><div class="pk-msg" id="cuMsg"></div><div class="cu-slot">'+
    '<div class="cu-aim" id="cuAim"><button type="button" data-a="-1" id="cuAl" aria-label="조준 옮기기">◀</button><button type="button" id="cuSpin" class="cu-spin"></button><button type="button" data-a="1" id="cuAr" aria-label="조준 옮기기">▶</button></div>'+
    '<div class="cu-pow" id="cuPow"><div class="cu-bar"><i class="z g" id="cuZg"></i><i class="z h" id="cuZh"></i><i class="z t" id="cuZt"></i><b class="cu-mk" id="cuMk"></b><b class="cu-nd" id="cuNd"></b></div>'+
     '<div class="cu-lb"><span id="cuLg">가드</span><span id="cuLh">하우스</span><span id="cuLt">테이크아웃</span></div></div></div>'+
    '<button type="button" id="cuGo" class="pri cu-go">경기 시작</button></div></div>';
  const X=$('cuX'),cv=$('cuC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),peb=cuPebble(D),pat=g.createPattern(peb,'repeat');
  const S=[],trail=new Map();let ph='intro',idx=-1,T=null,spec=null,B=[-1.05,CU.TEE+.05],w=1,gp=0,gd=1,sw=0,tWait=0,ghost=null,res=null,clock=0,alive=true,raf=0,acc=0,last=performance.now(),
    shouts=[],dust=[],lastShout=0,shN=0,lastSwish=0,swPh=0,vs=0,hum=null,pd=0,drag=false,endT=0,kind='d';
  // 화면 배치: 짧은 가로 화면은 시트 옆에 조작판, 그 밖에는 아래. 넓으면 시트를 눕혀(왼쪽→오른쪽) 그린다
  let CW=300,CH=300,HZ=false,LAT=300,ALG=300,sc0=40,scE=60,cam={cy:CU.TEE,sc:40};
  const fit=()=>{const iw=X.clientWidth-24,ih=window.innerHeight||640,side=iw>=400&&ih<520&&iw>ih*1.2;X.classList.toggle('side',side);
    if(side){CW=iw-194;CH=Math.max(180,Math.min(400,ih-60));HZ=true;}
    else{CW=iw;const av=ih-250;HZ=CW>=420&&CW>av*1.15;CH=HZ?Math.max(190,Math.min(420,av,CW*.6)):Math.max(250,Math.min(av,CW*1.75,600));}
    CW=Math.max(200,Math.round(CW));CH=Math.round(CH);cv.width=CW*D;cv.height=CH*D;cv.style.width=CW+'px';cv.style.height=CH+'px';
    LAT=HZ?CH:CW;ALG=HZ?CW:CH;const fw=LAT/(CU.W+.25),span=Math.min(8.98,ALG/(fw*.72));sc0=Math.min(fw,ALG/span);scE=Math.min(LAT/(2*CU.HR+.6),ALG/(2*CU.HR+(HZ?.6:1.6)));
    cam.sc=ph==='end'?scE:sc0;$('cuAl').textContent=HZ?'▲':'◀';$('cuAr').textContent=HZ?'▼':'▶';};
  const cyH=s=>CU.BACK+.45-ALG/s/2;
  // 시트 좌표(x 옆, y 앞) → 화면
  const P2=(x,y)=>HZ?[CW/2+(y-cam.cy)*cam.sc,CH/2+x*cam.sc]:[CW/2+x*cam.sc,CH/2-(y-cam.cy)*cam.sc];
  const S2P=(X,Y)=>HZ?[(Y-CH/2)/cam.sc,cam.cy+(X-CW/2)/cam.sc]:[(X-CW/2)/cam.sc,cam.cy+(CH/2-Y)/cam.sc];
  const msg=h=>{$('cuMsg').innerHTML=h;};
  const pips=()=>{const n=t=>4-S.filter(o=>o.tm===t).length-(spec&&spec.tm===t&&!T?1:0);
    $('cuPu').innerHTML=[0,1,2,3].map(k=>'<i class="'+(k<n('u')?'on':'')+'"></i>').join('');$('cuPr').innerHTML=[0,1,2,3].map(k=>'<i class="'+(k<n('r')?'on':'')+'"></i>').join('');
    $('cuRd').textContent=idx<0?'결승 · 마지막 엔드':idx>7?'마지막 엔드 끝':'마지막 엔드 · '+(idx+1)+'/8구';};
  const slot=k=>{$('cuAim').style.display=k==='aim'?'':'none';$('cuPow').style.display=k==='pow'?'':'none';};
  const go=(t,dis,cls)=>{const b=$('cuGo');b.innerHTML=t;b.disabled=!!dis;b.className='pri cu-go'+(cls?' '+cls:'');};
  const spinLbl=()=>{$('cuSpin').innerHTML='<b>'+(w>0?'↻':'↺')+'</b><span>'+(w>0?'시계 방향':'반시계 방향')+'<small>회전 · R</small></span>';};
  // 게이지 칸: 가드 / 하우스 / 테이크아웃. 흰 줄은 지금 조준점까지 멈추는 세기
  const zone=(id,a,b)=>{const e=$(id);e.style.left=a*100+'%';e.style.width=(b-a)*100+'%';};
  zone('cuZg',cuLP(CU.HOG+.5),cuLP(CU.TEE-CU.HR));zone('cuZh',cuLP(CU.TEE-CU.HR),cuLP(CU.BACK));zone('cuZt',.72,1);
  [['cuLg',(cuLP(CU.HOG+.5)+cuLP(CU.TEE-CU.HR))/2],['cuLh',(cuLP(CU.TEE-CU.HR)+cuLP(CU.BACK))/2],['cuLt',.86]].forEach(([id,p])=>{$(id).style.left=p*100+'%';});
  let mkL=CU.TEE;
  // 조준이 바뀌면: 드로 세기로 멈출 길(점선)을 다시 계산. 세기를 고르는 동안에는 바늘 세기로 계속 다시 그린다
  const aimL=()=>{const Dd=Math.hypot(B[0],B[1]);let L=Dd;for(let i=0;i<2;i++){const E=cuFree(cuV(L),w)[0];L*=Dd/Math.hypot(E[0],E[1]);}mkL=L;$('cuMk').style.left=cuLP(L)*100+'%';};
  const mkGhost=L=>{const th=cuAng(B),P=cuFree(cuV(L),w,null,5).map(p=>cuRot(p,th)),out=[];let hit=null;
    for(const p of P){out.push(p);if(Math.abs(p[0])>CU.W/2-CU.R||p[1]>CU.BACK+.6)break;const o=S.find(o=>!o.out&&Math.hypot(o.x-p[0],o.y-p[1])<2*CU.R);if(o){hit=p;break;}}
    ghost={P:out,hit:hit};};
  const setB=(x,y)=>{B=[Math.max(-CU.W/2+.25,Math.min(CU.W/2-.25,x)),Math.max(CU.HOG+.6,Math.min(CU.BACK+.5,y))];aimL();mkGhost(mkL);};
  // 차례 진행
  const next=()=>{if(!alive)return;idx++;T=null;spec=null;ghost=null;pips();if(idx>7)return finish();
    const tm=idx%2?'u':'r';
    if(tm==='r'){ph='ai';const c=cuAI(S,'r',idx);spec={c:c,tm:'r',nz:CU_NZR};tWait=RM?.6:1.1;pips();slot('');go('상대 차례',1);
      msg(opn+' <b>'+(idx+1)+'구</b> · '+CU_KO[c.k]+' 노린다');}
    else{ph='aim';const n=(idx+1)/2;slot('aim');go('세기 정하기 <small>스페이스</small>');setB(B[0],B[1]);
      msg('<b>우리 '+n+'구'+(idx===7?' · 마지막 돌(망치)':'')+'</b> · 시트를 눌러 조준점(빗자루)을 옮겨라. 점선 끝이 멈출 곳이다');}};
  const launch=()=>{T=cuLaunch(S,spec.c,spec.tm,spec.nz);T.hits=[];sw=0;vs=0;ph='run';pips();try{thud(70,.2,0,.3);sweep(.4,.03,500,180,0,.7);}catch(e){}
    if(spec.tm==='u'){go('스위핑! <small>연타 · 스페이스</small><i class="cu-swm" id="cuSwm"></i>',0,'sw');msg('빨리 연타할수록 더 멀리, 덜 휘어 간다');}
    else{go('상대 투구 중',1);}};
  const settle=()=>{cuSettle(T);const s=T.s,txt=cuWhat(T.pre,S,s,T.s.tm,T.c.k);
    // 1번 스톤이 되면 짧은 알림(우리 것은 밝게, 상대 것은 낮게)
    const sc1=cuScore(S);try{if(s.out&&s.why==='hog')thud(90,.15);else if(sc1.n&&sc1.H[0].s===s){if(s.tm==='u'){tone(784,'sine',.16,.08);tone(1047,'sine',.3,.07,.1);}else tone(311,'triangle',.3,.07);}}catch(e){}
    msg((s.tm==='u'?'<b>우리</b> ':'<b>'+opn+'</b> ')+CU_KN[T.c.k]+' · '+txt);ph='wait';tWait=RM?1:1.6;go(idx<7?'다음 투구':'측정',1);slot('');};
  // 마지막: 하우스를 크게 비추고 버튼에서 각 돌까지 재어 보인다
  const finish=()=>{ph='end';endT=clock;const r=cuScore(S),t=r.tm==='u'?0:1;res={sc:r,t:t};slot('');try{if(hum)hum.g.gain.setTargetAtTime(0,hum.ac.currentTime,.05);}catch(e){}
    const big=r.tm==='u'?'우리 '+r.n+'점':r.tm==='r'?opn+' '+r.n+'점 스틸':'득점 없음';
    $('cuOv').innerHTML='<div class="cu-res '+(t?'s':'g')+'"><b>'+big+'</b><span>'+(t?'은메달':'금메달!')+'</span></div>';$('cuOv').className='cu-ov on res'+(HZ?' hz':'');
    const d0=r.H.length?r.H[0].d:0;
    msg(r.tm?'버튼(한가운데)에서 가장 가까운 돌: <b>'+(r.tm==='u'?'우리':opn)+'</b> · '+d0.toFixed(2)+'m'+(r.n>1?' · '+(r.tm==='u'?opn:'우리')+' 돌보다 안쪽에 '+r.n+'개':''):'하우스에 남은 돌이 없다. 망치를 쥐고도 점수를 내지 못했다');
    go('결과 보기');setTimeout(()=>{if(alive||box.isConnected)try{SFX.medal(t);}catch(e){}},700);};
  // 누르기: 세기 멈추기와 스위핑은 손이 닿는 순간(pointerdown), 나머지는 click으로 받는다
  const act=(src)=>{if(ph==='pow'){ph='go';const L=cuPL(gp);kind=L>36?'t':B[1]<CU.TEE-CU.HR?'g':'d';
      spec={c:{v0:cuV(L),th:cuAng(B),w:w,P:B.slice(),k:kind},tm:'u',nz:CU_NZP};ghost=null;slot('');go('던진다!',1);try{SFX.click();}catch(e){}
      tWait=RM?.15:.75;ph='pre';T=null;return;}
    if(ph==='run'&&T&&T.s.tm==='u'){if(T.s.m&&!T.s.out){sw=Math.min(1,sw+.2);const n=performance.now();if(n-lastSwish>70){lastSwish=n;cuSwish();}}return;}
    if(src==='down')return;
    if(ph==='intro'){try{aInit();SFX.click();}catch(e){}hum=cuHum();$('cuOv').className='cu-ov';next();return;}
    if(ph==='aim'){ph='pow';gp=0;gd=1;slot('pow');go('멈춰! <small>스페이스</small>');msg('바늘이 흰 줄(조준점까지 멈추는 세기)에 왔을 때 멈춰라. 조금 약하면 스위핑으로 채울 수 있다');try{SFX.click();}catch(e){}return;}
    if(ph==='end'){cleanup();try{SFX.click();}catch(e){}done(res.t);}};
  const goB=$('cuGo');goB.style.touchAction='none';
  goB.addEventListener('pointerdown',e=>{if(goB.disabled||e.button>0)return;if(ph==='pow'||ph==='run'){e.preventDefault();pd=Date.now();act('down');}});
  goB.addEventListener('click',()=>{if(Date.now()-pd<600)return;act('click');});
  // 회전을 바꾸면 휘는 쪽이 뒤집히니, 멈출 자리가 그대로이도록 빗자루를 휘는 만큼 두 배 반대로 옮긴다
  $('cuSpin').onclick=()=>{if(ph!=='aim')return;const e=cuRot(cuFree(cuV(mkL),w)[0],cuAng(B));w=-w;spinLbl();setB(B[0]+2*(e[0]-B[0]),B[1]);try{SFX.click();}catch(x){}};
  // ◀ ▶(눕힌 시트에선 ▲ ▼): 누르고 있으면 계속 옮긴다
  ['cuAl','cuAr'].forEach(id=>{const b=$(id),d=+b.dataset.a;let iv=0;const stop=()=>{clearInterval(iv);iv=0;};b.style.touchAction='none';
    b.addEventListener('pointerdown',e=>{e.preventDefault();if(ph!=='aim')return;setB(B[0]+d*.03,B[1]);stop();iv=setInterval(()=>{if(ph!=='aim'||!box.isConnected)return stop();setB(B[0]+d*.03,B[1]);},70);});
    ['pointerup','pointerleave','pointercancel'].forEach(n=>b.addEventListener(n,stop));b.addEventListener('contextmenu',e=>e.preventDefault());});
  const cpos=e=>{const r=cv.getBoundingClientRect();return S2P(e.clientX-r.left,e.clientY-r.top);};
  cv.addEventListener('pointerdown',e=>{if(ph==='aim'){e.preventDefault();drag=true;try{cv.setPointerCapture(e.pointerId);}catch(x){}const p=cpos(e);setB(p[0],p[1]);}
    else if(ph==='run'||ph==='pow'){e.preventDefault();act('down');}});
  cv.addEventListener('pointermove',e=>{if(drag&&ph==='aim'){const p=cpos(e);setB(p[0],p[1]);}});
  ['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,()=>{drag=false;}));
  const key=e=>{if(!box.isConnected){cleanup();return;}const k=e.key;
    if(k===' '||k==='Enter'){e.preventDefault();if(e.repeat)return;if(ph==='pow'||ph==='run')act('down');else if(!$('cuGo').disabled)act('key');return;}
    if(ph!=='aim')return;const lat=HZ?{ArrowUp:-1,ArrowDown:1}:{ArrowLeft:-1,ArrowRight:1},dep=HZ?{ArrowRight:1,ArrowLeft:-1}:{ArrowUp:1,ArrowDown:-1};
    if(lat[k]){e.preventDefault();setB(B[0]+lat[k]*.03,B[1]);}else if(dep[k]){e.preventDefault();setB(B[0],B[1]+dep[k]*.08);}else if(/^[rRㄱ]$/.test(k)){$('cuSpin').click();}};
  const keyUp=e=>{if(e.key===' ')e.preventDefault();};
  let rt=0;const onR=()=>{if(!box.isConnected){cleanup();return;}clearTimeout(rt);rt=setTimeout(()=>{if(alive&&box.isConnected){fit();if(ph==='aim')mkGhost(mkL);}},120);};
  document.addEventListener('keydown',key);document.addEventListener('keyup',keyUp);window.addEventListener('resize',onR);
  function cleanup(){alive=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);document.removeEventListener('keyup',keyUp);window.removeEventListener('resize',onR);
    if(hum){try{hum.s.stop();}catch(e){}hum=null;}}
  /* ---- 그리기 ---- */
  const FONT='"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
  const line=(x0,y0,x1,y1,c,wd)=>{const a=P2(x0,y0),b=P2(x1,y1);g.strokeStyle=c;g.lineWidth=wd;g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();};
  const ring=(y,lo,hi)=>{if(y+CU.HR<lo||y-CU.HR>hi)return;const c=P2(0,y),k=cam.sc;
    [[CU.HR,'#1f5fb3'],[1.22,'#f4f8fb'],[.61,'#c92f38'],[.15,'#f4f8fb']].forEach(([r,f])=>{g.fillStyle=f;g.beginPath();g.arc(c[0],c[1],r*k,0,6.2832);g.fill();});
    g.fillStyle='rgba(235,243,250,.14)';g.beginPath();g.arc(c[0],c[1],CU.HR*k,0,6.2832);g.fill();};
  const stone=(o,al)=>{const p=P2(o.x,o.y),r=CU.R*cam.sc;g.globalAlpha=al==null?1:al;g.fillStyle='rgba(10,24,48,.28)';g.beginPath();g.arc(p[0]+r*.16,p[1]+r*.24,r*1.04,0,6.2832);g.fill();
    g.save();g.translate(p[0],p[1]);g.rotate(o.a);g.drawImage(cuSprite(o.tm),-r,-r,2*r,2*r);g.restore();g.globalAlpha=1;};
  // 스위퍼 두 명: 돌 앞 양옆에서 걷는다(위에서 본 어깨 · 머리 · 팔). 쓸 때는 빗자루 머리를 돌 바로 앞에서 좌우로 빠르게 문지른다(앞뒤로 엇갈리게)
  const sweeper=(o,sd,i,act,tm)=>{const v=Math.hypot(o.vx,o.vy),ux=v?o.vx/v:0,uy=v?o.vy/v:1,rx=uy,ry=-ux,k=cam.sc,W2=(a,b)=>P2(o.x+ux*a+rx*b,o.y+uy*a+ry*b),
      jk=tm==='u'?['#173a73','#f1d589','#0e2752']:['#9b222b','#f3ead7','#6a141b'],ang=HZ?Math.atan2(rx,ry):Math.atan2(-ry,rx),fw=i?.78:.5,
      ph2=swPh+i*1.9,on=act>.05,os=on?Math.sin(ph2)*.17*Math.min(1,act*1.4):0,hd=on?[(i?.5:.3)+.03*Math.cos(ph2),os]:[fw+.2,sd*.42],
      pb=W2(fw,sd*.52),pr=W2(hd[0],hd[1]),sh=W2(fw+.04,sd*.4);
    g.lineCap='round';g.strokeStyle='#3a2c1c';g.lineWidth=Math.max(1.5,.03*k);g.beginPath();g.moveTo(sh[0],sh[1]);g.lineTo(pr[0],pr[1]);g.stroke();
    g.strokeStyle=jk[0];g.lineWidth=Math.max(2,.07*k);const hm=[(sh[0]*2+pr[0])/3,(sh[1]*2+pr[1])/3];[W2(fw+.02,sd*.36),W2(fw+.02,sd*.66)].forEach(a=>{g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(hm[0],hm[1]);g.stroke();});g.lineCap='butt';
    g.save();g.translate(pr[0],pr[1]);g.rotate(ang);g.fillStyle='#14100b';cuRR(g,-.2*k,-.045*k,.4*k,.09*k,.035*k);g.fill();g.fillStyle=jk[1];g.fillRect(-.17*k,-.01*k,.34*k,.02*k);g.restore();
    g.save();g.translate(pb[0],pb[1]);g.rotate(ang);g.fillStyle='rgba(10,24,48,.22)';g.beginPath();g.ellipse(.03*k,.05*k,.25*k,.14*k,0,0,6.2832);g.fill();
    const bg=g.createLinearGradient(0,-.13*k,0,.13*k);bg.addColorStop(0,jk[0]);bg.addColorStop(1,jk[2]);g.fillStyle=bg;g.beginPath();g.ellipse(0,0,.23*k,.13*k,0,0,6.2832);g.fill();
    g.strokeStyle=jk[1];g.lineWidth=Math.max(1,.02*k);g.beginPath();g.moveTo(-.2*k,0);g.lineTo(.2*k,0);g.stroke();
    g.fillStyle='#2a221c';g.beginPath();g.arc(0,0,.085*k,0,6.2832);g.fill();g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(-.02*k,-.025*k,.035*k,0,6.2832);g.fill();g.restore();
    if(on&&act>.35&&!RM&&Math.random()<act*.6)dust.push({x:o.x+ux*hd[0]+rx*hd[1]+(Math.random()-.5)*.3,y:o.y+uy*hd[0]+ry*hd[1]+(Math.random()-.5)*.3,l:1});
    return W2(fw,sd*.52);};
  const sweepers=(o,tm,act)=>{if(Math.hypot(o.vx,o.vy)<.05&&act<.05)return;[-1,1].forEach((sd,i)=>{heads[i]=sweeper(o,sd,i,act,tm);});};
  const heads=[[0,0],[0,0]];
  const draw=()=>{g.setTransform(D,0,0,D,0,0);g.fillStyle='#0b1526';g.fillRect(0,0,CW,CH);
    const hv=ALG/2/cam.sc,lo=cam.cy-hv-.5,hi=cam.cy+hv+.5,y0=Math.max(-9.4,lo),y1=Math.min(CU.BACK+1.25,hi);
    // 얼음
    const a=P2(-CU.W/2,y0),b=P2(CU.W/2,y1),rx=Math.min(a[0],b[0]),ry=Math.min(a[1],b[1]),rw=Math.abs(b[0]-a[0]),rh=Math.abs(b[1]-a[1]);
    const L0=P2(-CU.W/2,cam.cy),L1=P2(CU.W/2,cam.cy),ig=g.createLinearGradient(L0[0],L0[1],L1[0],L1[1]);ig.addColorStop(0,'#cfdeea');ig.addColorStop(.18,'#e9f1f7');ig.addColorStop(.5,'#f3f8fb');ig.addColorStop(.82,'#e9f1f7');ig.addColorStop(1,'#cfdeea');
    g.fillStyle=ig;g.fillRect(rx,ry,rw,rh);
    g.save();g.beginPath();g.rect(rx,ry,rw,rh);g.clip();
    const o0=P2(0,0);try{pat.setTransform(new DOMMatrix([1/D,0,0,1/D,o0[0]%150,o0[1]%150]));}catch(e){}g.fillStyle=pat;g.fillRect(rx,ry,rw,rh);
    // 얼음 아래 그림: 링(먼 쪽 · 가까운 쪽 하우스), 선, 대회 이름
    ring(CU.TEE,lo,hi);ring(-6.4,lo,hi);const k=cam.sc;
    line(0,y0,0,y1,'rgba(20,32,56,.42)',Math.max(1,.012*k));
    [CU.TEE,-6.4].forEach(y=>line(-CU.W/2,y,CU.W/2,y,'rgba(20,32,56,.5)',Math.max(1,.012*k)));
    [CU.BACK,-8.23].forEach(y=>line(-CU.W/2,y,CU.W/2,y,'rgba(20,32,56,.55)',Math.max(1,.015*k)));
    [CU.HOG,0].forEach(y=>line(-CU.W/2,y,CU.W/2,y,'rgba(196,40,50,.82)',Math.max(2,.1*k)));
    if(lo<17&&hi>5){const c=P2(0,11);g.save();g.translate(c[0],c[1]);g.fillStyle='rgba(23,45,90,.13)';g.textAlign='center';g.textBaseline='middle';
      g.font='800 '+Math.round(.42*k)+'px '+FONT;g.fillText('팬데믹 동계올림픽',0,-.3*k);g.font='700 '+Math.round(.3*k)+'px '+FONT;g.fillText('컬링 · 결승',0,.25*k);g.restore();}
    [[-.1,-7.95],[.1,-7.95]].forEach(([x,y])=>{const p=P2(x,y);g.fillStyle='#1d2333';g.fillRect(p[0]-.06*k,p[1]-.06*k,.12*k,.12*k);});
    // 1번 스톤까지의 거리 원(누가 점수권인지 보이게)
    const S0=cuScore(S);if(S0.n&&ph!=='end'&&ph!=='run'){const c=P2(0,CU.TEE);g.setLineDash([4,5]);g.strokeStyle=S0.tm==='u'?'rgba(217,157,34,.75)':'rgba(179,35,43,.6)';g.lineWidth=1.5;
      g.beginPath();g.arc(c[0],c[1],Math.max(3,S0.H[0].d*k),0,6.2832);g.stroke();g.setLineDash([]);}
    // 조준: 던지는 선(가는 선) · 빗자루 · 멈출 길(점선)
    if((ph==='aim'||ph==='pow')&&ghost){const bp=P2(B[0],B[1]),o=P2(0,0);g.strokeStyle='rgba(23,45,90,.35)';g.lineWidth=1;g.setLineDash([2,6]);g.beginPath();g.moveTo(o[0],o[1]);g.lineTo(bp[0],bp[1]);g.stroke();
      g.strokeStyle='rgba(193,128,18,.95)';g.lineWidth=2.2;g.setLineDash([7,6]);g.beginPath();ghost.P.forEach((p,i)=>{const q=P2(p[0],p[1]);if(i)g.lineTo(q[0],q[1]);else g.moveTo(q[0],q[1]);});g.stroke();g.setLineDash([]);
      const e=ghost.hit||ghost.P[ghost.P.length-1],q=P2(e[0],e[1]);g.strokeStyle=ghost.hit?'#b3232b':'#c18012';g.lineWidth=2;g.beginPath();g.arc(q[0],q[1],CU.R*k,0,6.2832);g.stroke();
      if(ghost.hit){g.beginPath();g.moveTo(q[0]-5,q[1]-5);g.lineTo(q[0]+5,q[1]+5);g.moveTo(q[0]+5,q[1]-5);g.lineTo(q[0]-5,q[1]+5);g.stroke();}
      g.save();g.translate(bp[0],bp[1]);g.rotate(HZ?Math.PI/2:0);g.fillStyle='#14203a';cuRR(g,-.24*k,-.06*k,.48*k,.12*k,.04*k);g.fill();g.fillStyle='#f1d589';g.fillRect(-.21*k,-.015*k,.42*k,.03*k);g.restore();}
    if(ph==='ai'&&spec){const p=P2(spec.c.P[0],spec.c.P[1]);g.save();g.translate(p[0],p[1]);g.rotate(HZ?Math.PI/2:0);g.globalAlpha=.6+.4*Math.sin(clock*6);g.fillStyle='#8e1f26';cuRR(g,-.24*k,-.06*k,.48*k,.12*k,.04*k);g.fill();g.restore();g.globalAlpha=1;}
    // 지나온 자국
    trail.forEach((tr,o)=>{if(tr.length<2)return;for(let i=1;i<tr.length;i++){const p=P2(tr[i-1][0],tr[i-1][1]),q=P2(tr[i][0],tr[i][1]);g.strokeStyle='rgba(150,178,206,'+(.4*i/tr.length)+')';g.lineWidth=CU.R*k*1.5*i/tr.length;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}});
    dust.forEach(p=>{const q=P2(p.x,p.y);g.fillStyle='rgba(255,255,255,'+p.l*.8+')';g.fillRect(q[0],q[1],2,2);});
    S.forEach(o=>{if(!o.out)stone(o);});
    if(ph==='pre'&&spec)stone({x:0,y:0,a:0,tm:spec.tm});
    if(T&&!T.s.out&&(T.s.m||vs>.05))sweepers(T.s,T.s.tm,vs);
    if(ph==='end'&&res)measure(k);
    g.restore();
    // 외침 말풍선
    shouts.forEach(s=>{const q=heads[s.i],al=Math.min(1,(1.1-s.t)*3);if(al<=0)return;g.globalAlpha=al;g.font='800 13px '+FONT;const tw=g.measureText(s.txt).width+14,x=q[0]-tw/2,y=q[1]-34-(RM?0:s.t*12);
      g.fillStyle='#ffe08a';cuRR(g,x,y,tw,22,9);g.fill();g.beginPath();g.moveTo(q[0]-4,y+21);g.lineTo(q[0]+1,y+29);g.lineTo(q[0]+5,y+21);g.fill();g.strokeStyle='#1d150a';g.lineWidth=1.2;cuRR(g,x,y,tw,22,9);g.stroke();
      g.fillStyle='#14203a';g.textAlign='center';g.textBaseline='middle';g.fillText(s.txt,q[0],y+11.5);g.globalAlpha=1;});
    mini();};
  // 작은 지도: 시트 전체에서 돌들과 지금 보이는 곳
  const mini=()=>{const n=CU.BACK+1.2+9.4,f=y=>(y+9.4)/n,pos=t=>HZ?[8+t*(CW-16),CH-8]:[CW-9,CH-8-t*(CH-16)];
    g.lineCap='round';g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=6;const a=pos(0),b=pos(1);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();
    const hv=ALG/2/cam.sc,c0=pos(f(Math.max(-9.4,cam.cy-hv))),c1=pos(f(Math.min(CU.BACK+1.2,cam.cy+hv)));g.strokeStyle='rgba(241,213,137,.55)';g.lineWidth=6;g.beginPath();g.moveTo(c0[0],c0[1]);g.lineTo(c1[0],c1[1]);g.stroke();g.lineCap='butt';
    const h=pos(f(CU.TEE));g.strokeStyle='#5d93d6';g.lineWidth=1.5;g.beginPath();g.arc(h[0],h[1],4.5,0,6.2832);g.stroke();
    S.concat(ph==='pre'&&spec?[{x:0,y:0,tm:spec.tm}]:[]).forEach(o=>{if(o.out)return;const p=pos(f(o.y));g.fillStyle=o.tm==='u'?'#f1c34f':'#e0504a';g.beginPath();g.arc(p[0]+(HZ?0:o.x*1.2),p[1]+(HZ?o.x*1.2:0),2.3,0,6.2832);g.fill();});};
  // 측정: 버튼에서 점수 나는 돌까지 선을 긋고 순서를 붙인다. 상대의 가장 가까운 돌까지 원을 그려 그 안쪽만 센다.
  // 거리 꼬리표는 서로 겹치지 않는 자리(오른쪽 위 → 오른쪽 아래 → 왼쪽 …)를 찾아 붙인다
  const measure=k=>{const r=res.sc,c=P2(0,CU.TEE),u=Math.min(1,(clock-endT)/(RM?.01:1.2)),col=r.tm==='u'?'#ffd34d':'#ff6b62';if(!r.H.length)return;
    const cut=r.H.find(o=>o.s.tm!==r.tm);if(cut){g.setLineDash([5,5]);g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2;g.beginPath();g.arc(c[0],c[1],cut.d*k*u,0,6.2832);g.stroke();g.setLineDash([]);}
    r.H.forEach((o,i)=>{const p=P2(o.s.x,o.s.y),cnt=i<r.n,q=[c[0]+(p[0]-c[0])*u,c[1]+(p[1]-c[1])*u];
      g.strokeStyle=cnt?col:'rgba(20,32,56,.5)';g.lineWidth=cnt?3:1.5;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(q[0],q[1]);g.stroke();
      if(cnt&&u>=1){g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(p[0],p[1],CU.R*k+4,0,6.2832);g.stroke();}});
    g.fillStyle='#14203a';g.beginPath();g.arc(c[0],c[1],4,0,6.2832);g.fill();if(u<1)return;
    const lab=[];g.font='800 12px '+FONT;g.textAlign='center';g.textBaseline='middle';
    r.H.forEach((o,i)=>{const p=P2(o.s.x,o.s.y),cnt=i<r.n,t=(cnt?(i+1)+' · ':'')+o.d.toFixed(cut&&Math.abs(o.d-cut.d)<.01?3:2)+'m',tw=g.measureText(t).width+10,rr=CU.R*k+5,
        C=[[rr+tw/2,-rr],[rr+tw/2,rr],[-rr-tw/2,-rr],[-rr-tw/2,rr],[0,-rr-12],[0,rr+12],[rr+tw/2,0],[-rr-tw/2,0]];
      let b=null;for(const [dx,dy] of C){const x=p[0]+dx-tw/2,y=p[1]+dy-9,ok=x>=2&&y>=2&&x+tw<=CW-2&&y+18<=CH-2&&!lab.some(q=>x<q[0]+q[2]&&q[0]<x+tw&&y<q[1]+q[3]&&q[1]<y+18);
        if(ok){b=[x,y,tw,18];break;}if(!b)b=[x,y,tw,18,1];}
      if(b[4])b=[Math.max(2,Math.min(CW-tw-2,p[0]+rr)),Math.max(2,Math.min(CH-20,p[1]-rr-9)),tw,18];lab.push(b);
      g.fillStyle=cnt?'#14203a':'rgba(20,32,56,.78)';cuRR(g,b[0],b[1],tw,18,6);g.fill();g.fillStyle=cnt?(r.tm==='u'?'#ffe08a':'#ffb0a8'):'#e8edf6';g.fillText(t,b[0]+tw/2,b[1]+9.5);});};
  /* ---- 한 박자 ---- */
  const loop=now=>{if(!alive)return;if(!box.isConnected){cleanup();return;}const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=dt;
    if(ph==='pow'){gp+=gd*.68*dt;if(gp>1){gp=2-gp;gd=-1;}if(gp<0){gp=-gp;gd=1;}$('cuNd').style.left=gp*100+'%';mkGhost(cuPL(gp));}
    if(ph==='ai'||ph==='pre'){tWait-=dt;if(tWait<=0){if(ph==='ai'){ph='pre';tWait=RM?.15:.75;}else{const pre=S.map(o=>o.out);launch();T.pre=pre;}}}
    if(ph==='run'&&T){acc+=dt;let mv=true;const ps=S.map(o=>o.out);while(acc>=CU.DT){acc-=CU.DT;mv=cuTick(T,CU.DT,T.s.tm==='u'?sw:null);if(!mv)break;}if(!mv)acc=0;
      T.hits.splice(0).slice(0,3).forEach(v=>cuClack(v));if(S.some((o,i)=>o.out&&!ps[i]))try{thud(120,.14,0,.18);}catch(e){}
      if(T.s.tm==='u'){sw*=Math.exp(-dt*2.6);const m=$('cuSwm');if(m)m.style.width=sw*100+'%';
        if(sw>.68&&T.s.m&&clock-lastShout>.75){lastShout=clock;shN++;shouts.push({i:shN%2,t:0,txt:CU_SHOUT[Math.floor(Math.random()*CU_SHOUT.length)]});}}
      vs+=((T.s.tm==='u'?sw:T.sw)-vs)*Math.min(1,dt*8);
      if(!mv)settle();}
    if(ph==='wait'){vs*=Math.exp(-dt*4);tWait-=dt;if(tWait<=0)next();}
    swPh+=dt*(5+16*vs);shouts.forEach(s=>{s.t+=dt;});shouts=shouts.filter(s=>s.t<1.1);dust.forEach(p=>{p.l-=dt*1.8;});dust=dust.filter(p=>p.l>0);if(dust.length>120)dust.splice(0,dust.length-120);
    S.forEach(o=>{let tr=trail.get(o);if(o.m&&!o.out){if(!tr)trail.set(o,tr=[]);tr.push([o.x,o.y]);if(tr.length>24)tr.shift();}else if(tr){tr.shift();tr.shift();if(!tr.length)trail.delete(o);}});
    // 미끄러지는 소리: 가장 빠른 돌의 속도만큼
    if(hum){let v=0;S.forEach(o=>{if(o.m&&!o.out)v=Math.max(v,Math.hypot(o.vx,o.vy));});try{hum.g.gain.setTargetAtTime(Math.min(.16,v*.018),hum.ac.currentTime,.06);hum.f.frequency.setTargetAtTime(220+v*30+vs*500,hum.ac.currentTime,.08);}catch(e){}}
    // 카메라: 던질 때는 돌을 따라가고, 평소에는 하우스와 가드 자리, 끝나면 하우스를 크게
    let cyT=cyH(sc0),scT=sc0;const hv=ALG/sc0;
    if(ph==='pre')cyT=hv*.24;else if(ph==='run'&&T&&!T.s.out&&T.s.m)cyT=Math.min(cyH(sc0),T.s.y+hv*.24);else if(ph==='end'){scT=scE;cyT=CU.TEE;}
    const kk=RM?1:1-Math.exp(-dt*(ph==='run'?9:5));cam.sc+=(scT-cam.sc)*(RM?1:1-Math.exp(-dt*3));cam.cy+=(cyT-cam.cy)*kk;cam.cy=Math.min(cam.cy,CU.BACK+1.25-ALG/2/cam.sc);
    draw();
    if(ph==='end'&&clock-endT>2.6){alive=false;window.removeEventListener('resize',onR);if(hum){try{hum.s.stop();}catch(e){}hum=null;}return;}   // 측정 그림이 다 그려지면 멈춘다(누르기는 아직 받는다)
    raf=requestAnimationFrame(loop);};
  fit();spinLbl();slot('');pips();cam.cy=cyH(sc0);
  $('cuOv').className='cu-ov on';$('cuOv').innerHTML='<div class="cu-br"><b>동점으로 맞은 마지막 엔드</b><span>상대가 먼저, 우리가 나중에 네 개씩 번갈아 던진다. 마지막 돌(망치)은 우리 것. 끝났을 때 하우스 한가운데에 가장 가까운 돌이 우리 것이면 <em>금메달</em>.</span><span class="cu-how">조준 → 회전 → 세기 → 스위핑</span></div>';
  msg('시트를 눌러 조준하고, 게이지를 멈춰 던진 뒤, 스위핑 버튼을 연타한다');
  raf=requestAnimationFrame(loop);}
// 시뮬레이션: 우리 팀도 같은 인공지능으로 던진다(상대보다 조금 더 흔들린다). 여덟 돌을 다 굴리고 점수를 센다
function simCurl(){const S=[],L=[];
  for(let i=0;i<8;i++){const tm=i%2?'u':'r',c=cuAI(S,tm,i),pre=S.map(o=>o.out),s=cuShot(S,c,tm,tm==='u'?CU_NZU:CU_NZR);
    L.push('<span class="k">'+(i+1)+'구</span>'+(tm==='u'?'<b class="me">우리</b> ':'상대 ')+CU_KN[c.k]+' · '+cuWhat(pre,S,s,tm,c.k));}
  const sc=cuScore(S);return {lines:L,head:cuHead(sc),t:sc.tm==='u'?0:1};}
// 시험 도구: 흔들림 값을 바꿔 시뮬레이션 금메달 비율을 맞춰 볼 때만 쓴다(게임에서는 부르지 않는다)
function cuTune(o){Object.assign(CU_NZU,o.u||{});Object.assign(CU_NZR,o.r||{});return [CU_NZU,CU_NZR];}
