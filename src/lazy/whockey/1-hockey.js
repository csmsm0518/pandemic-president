/* ---------- 아이스하키 결승(에어하키 방식) ----------
   위에서 내려다본 링크. 아래가 우리 골문, 위가 상대 골문이다(가로로 짧은 화면에서는 링크를 눕혀 우리 골문이 왼쪽에 온다).
   우리 스트라이커(금색)는 손가락·마우스(또는 방향키·WASD)를 따라 우리 진영 안에서만 움직이고, 퍽을 치면 스트라이커가 움직이던 속도가 퍽에 실린다.
   골은 엔드 보드에 뚫린 틈이다. 45초씩 2피리어드, 5골을 먼저 넣으면 바로 끝난다. 비기면 골든골 연장(60초),
   그래도 못 가리면 유효 슈팅이 많은 쪽이 이긴다. 결승이라 이기면 금, 지면 은이다.
   물리는 링크 단위(가로 300 · 세로 480)로 1/120초마다 돌고, 그 안을 네 번 쪼개 빠른 퍽도 스트라이커를 뚫고 지나가지 않는다.
   그래서 60Hz·120Hz 화면에서 똑같이 움직이고, 시뮬레이션도 같은 물리에 인공지능 둘을 붙여 돌린다. */
// M: 링크 밖 보드·골망 두께, GW: 골 틈 너비, R: 모서리 반지름, RP·RS: 퍽·스트라이커 반지름, VMAX: 퍽 최고 속도, E·EW: 스트라이커·보드 반발
// PV: 손가락·마우스로 움직일 때 스트라이커 최고 속도(순간 이동해 퍽을 뚫고 지나가지 않게), PK: 방향키로 움직일 때
const IH={W:300,H:480,M:18,GW:104,R:42,RP:11,RS:20,VMAX:900,E:.9,EW:.86,FR:.28,ST:1/120,SUB:4,PER:45,OT:60,WIN:5,PV:1500,PK:760};
// 상대 나라 색(스트라이커 몸통 · 테두리). 하키 강국이 먼저 뽑히고, 목록에 없는 나라는 붉은색
const IH_COL={캐나다:['#d8342b','#fff'],미국:['#2f57b0','#e04848'],스웨덴:['#2b6fd6','#f3c623'],독일:['#f4f4f0','#1d1b18'],일본:['#f2efe8','#c4282f'],
  중국:['#d32f2f','#f2c230'],프랑스:['#2f5bd0','#fff'],영국:['#25407e','#d6312b'],이탈리아:['#2a7fd0','#fff'],호주:['#1f7a4d','#f2c230']};
const IH_DEF=['#c0392b','#f7f3ea'];
// 상대는 하키 강국 가운데 하나(미국 무대에서는 미국을 뺀다). 체육 조각의 MG_NAT·mgGauss는 다른 조각이라 여기서 못 써서 따로 둔다
const ihNat=()=>{const L=Object.keys(IH_COL).filter(n=>!(CP.id==='usa'&&n==='미국'));return L[Math.floor(Math.random()*L.length)];};
const ihGauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
// 받침이 있으면 앞 조사(을·이), 없으면 뒤 조사(를·가)
const ihJ=(n,a,b)=>{const c=n.charCodeAt(n.length-1)-0xAC00;return n+(c>=0&&c<11172&&c%28?a:b);};
// 인공지능 실력(0~1): 최고 속도 · 가속 · 다시 판단하는 간격(반응 지연) · 겨누는 각도 오차(라디안)
const ihPar=lv=>({spd:480+lv*260,acc:4000+lv*3200,re:.2-lv*.09,err:.24-lv*.13,dz:30-lv*8});
const ihRiv=()=>ihPar(.56+Math.random()*.3);
const IH_SIMLV=.8;   // 시뮬레이션의 우리 선수(평균 실력). 이길 확률이 절반 남짓이 되게 맞췄다
function ihNew(){const {W,H}=IH,st=y=>({x:W/2,y:y,vx:0,vy:0,ex:0,ey:0});
  return {p:{x:W/2,y:H/2,vx:0,vy:0},s:[st(H-60),st(60)],sc:[0,0],sh:[0,0],zn:[0,0],ht:[-9,-9],t:0,per:1,clk:IH.PER,log:[],lh:-1,shot:0,lock:0,ai:[{},{}],ev:null};}
// 페이스오프: k 진영(0 우리 · 1 상대 · -1 한가운데)에 퍽을 세워 두고 스트라이커는 제자리로
function ihPlace(S,k){const {W,H}=IH;Object.assign(S.p,{x:W/2,y:k<0?H/2:k?H*.28:H*.72,vx:0,vy:0});
  S.s.forEach((s,i)=>Object.assign(s,{x:W/2,y:i?60:H-60,vx:0,vy:0,ex:0,ey:0}));S.ai=[{},{}];S.lh=-1;S.shot=0;}
const ihFold=(x,lo,hi)=>{const w=hi-lo;x=(x-lo)%(2*w);if(x<0)x+=2*w;return lo+(x>w?2*w-x:x);};   // 옆 보드에 몇 번 튕겨도 어디로 오는지
// 둥근 모서리 안쪽으로 밀어 넣는다. 밀었으면 바깥쪽 법선을 돌려준다
function ihCorner(o,r){const {W,H,R}=IH,cx=o.x<R?R:o.x>W-R?W-R:0,cy=o.y<R?R:o.y>H-R?H-R:0;if(!cx||!cy)return null;
  const dx=o.x-cx,dy=o.y-cy,m=R-r;if(dx*dx+dy*dy<=m*m)return null;const d=ihHy(dx,dy);const nx=dx/d,ny=dy/d;o.x=cx+nx*m;o.y=cy+ny*m;return [nx,ny];}
// 스트라이커는 자기 진영 안(가운데 선에 테두리가 닿는 데까지)과 링크 안에만
function ihKeep(s,top){const {W,H,RS}=IH;s.x=Math.max(RS,Math.min(W-RS,s.x));s.y=top?Math.max(RS,Math.min(H/2-RS,s.y)):Math.max(H/2+RS,Math.min(H-RS,s.y));ihCorner(s,RS);}
// 갈 곳(tx,ty)을 향한 속도를 정한다. 가속 한계(acc)가 있으면 멈출 거리를 남기고 줄여 지나치지 않게 한다
function ihAim(s,tx,ty,top,vmax,acc,h){const {W,H,RS}=IH;tx=Math.max(RS,Math.min(W-RS,tx));ty=top?Math.max(RS,Math.min(H/2-RS,ty)):Math.max(H/2+RS,Math.min(H-RS,ty));
  const dx=tx-s.x,dy=ty-s.y,d=ihHy(dx,dy);let w=Math.min(vmax,d/h);if(acc)w=Math.min(w,Math.sqrt(2*acc*d));
  let vx=d?dx/d*w:0,vy=d?dy/d*w:0;
  if(acc){const ax=vx-s.vx,ay=vy-s.vy,a=ihHy(ax,ay),m=acc*h;if(a>m){vx=s.vx+ax*m/a;vy=s.vy+ay*m/a;}}
  s.vx=vx;s.vy=vy;}
// 인공지능 하나(k 0 우리 · 1 상대). 자기 골문이 y=0에 있는 쪽으로 보고 판단한다(아래쪽 선수는 위아래를 뒤집어 같은 규칙을 쓴다).
// 반응 지연: re초마다만 다시 판단하고 그 사이엔 마지막 판단대로 간다. 치러 갈 때는 퍽 뒤로 돌아가 겨눈 쪽으로 밀어 친다(각도 오차 err)
function ihAI(S,k,P,h){const {W,H,RS,RP}=IH,a=S.ai[k],s=S.s[k],q=S.p,f=y=>k?y:H-y,px=q.x,py=f(q.y),vx=q.vx,vy=k?q.vy:-q.vy,sx=s.x,sy=f(s.y),cx=W/2,hy=H/2,DY=46,m=RS+RP;
  a.rt=(a.rt||0)-h;a.ch=(a.ch||0)-h;a.cd=(a.cd||0)-h;a.age=(a.age||0)-h;if(a.x==null){a.x=cx;a.y=DY+14;}
  if(a.rt<=0&&a.ch<=0){a.rt=P.re*(.7+Math.random()*.6);
    if(S.lock){a.x=cx;a.y=DY+14;a.aim=null;}
    else if(py<hy+RP&&vy>-380&&a.cd<=0){   // 퍽이 우리 진영에 있고 우리 골문으로 세게 날아오지 않으면 치러 간다
      // 겨눌 곳: 상대 스트라이커가 비워 둔 쪽 골대 구석(가끔은 반대로 속인다). 30%는 옆 보드를 맞히는 뱅크 슛
      if(!a.aim||a.age<=0){a.age=1.1;a.bk=Math.random()<.3?(Math.random()<.5?-1:1):0;a.fk=Math.random()<.25;}
      const o=S.s[1-k],l=o.x-RS-(cx-IH.GW/2),r=cx+IH.GW/2-o.x-RS,sd=(l>r)!==a.fk?-1:1,gx=cx+sd*(IH.GW/2-RP-3-Math.random()*14);
      a.aim=[a.bk<0?2*RP-gx:a.bk>0?2*(W-RP)-gx:gx,H+30];
      const lx=px+vx*.07,ly=py+vy*.07,e=ihGauss()*P.err;let dx=a.aim[0]-lx,dy=a.aim[1]-ly;const d=Math.hypot(dx,dy);dx/=d;dy/=d;
      const c=Math.cos(e),sn=Math.sin(e),ex=dx*c-dy*sn,ey=dx*sn+dy*c,bx=lx-ex*(m+4),by=ly-ey*(m+4),ox=sx-lx,oy=sy-ly;
      if(Math.hypot(sx-bx,sy-by)<13){a.x=lx+ex*50;a.y=ly+ey*50;a.ch=.22;a.cd=.5;}   // 퍽 뒤에 섰다: 힘껏 밀어 친다
      else if(ox*ex+oy*ey>-m*.5){const sd=(oy*ex-ox*ey)>=0?1:-1;a.x=lx-ey*sd*(m+12)-ex*m;a.y=ly+ex*sd*(m+12)-ey*m;}   // 퍽 앞에 있으면 옆으로 돌아 뒤로
      else{a.x=bx;a.y=by;}}
    else if(vy<-30){const t=(py-DY)/(-vy),x=ihFold(px+vx*t,RP,W-RP);a.x=cx+(x-cx)*.85+ihGauss()*P.dz;a.y=DY+(Math.hypot(vx,vy)<250?30:0);a.aim=null;}   // 날아오는 퍽: 막아설 곳을 미리 짐작
    else{a.x=cx+(px-cx)*.4;a.y=DY+10;a.aim=null;}}
  return [a.x,f(a.y)];}
const ihHy=(x,y)=>Math.sqrt(x*x+y*y);   // Math.hypot은 느려서(시뮬레이션은 한 경기에 수만 번 부른다)
// 퍽과 스트라이커 k의 충돌. 스트라이커는 무겁다고 보고(손이 미는 대로 간다) 상대 속도만 되튕긴다.
// 붙어서 미는 동안은 한 번만 친 것으로 센다(0.3초). 세게 골문 쪽으로 가면 유효 슈팅
function ihHit(S,k){const {W,H,RS,RP,GW,VMAX,E}=IH,q=S.p,s=S.s[k],dx=q.x-s.x,dy=q.y-s.y,m=RS+RP;if(dx*dx+dy*dy>=m*m)return;const d=ihHy(dx,dy);
  const nx=d?dx/d:0,ny=d?dy/d:(k?1:-1);
  if(S.lock){s.x=q.x-nx*m;s.y=q.y-ny*m;return;}   // 페이스오프 전에는 퍽이 꿈쩍 않고 스트라이커가 밀려난다
  q.x=s.x+nx*m;q.y=s.y+ny*m;const rv=(q.vx-s.ex)*nx+(q.vy-s.ey)*ny;if(rv>=0)return;
  q.vx-=(1+E)*rv*nx;q.vy-=(1+E)*rv*ny;const v=ihHy(q.vx,q.vy);if(v>VMAX){q.vx*=VMAX/v;q.vy*=VMAX/v;}
  const fresh=S.t-S.ht[k]>.3;S.ht[k]=S.t;S.lh=k;if(!fresh)return;S.shot=0;
  const up=!k,t=up?q.y/-q.vy:(H-q.y)/q.vy;if((up?q.vy<-220:q.vy>220)&&Math.abs(q.x+q.vx*t-W/2)<GW/2){S.sh[k]++;S.shot=1;}
  if(S.ev&&rv<-40)S.ev('hit',Math.min(1,-rv/900),k);}
// 보드 · 모서리 · 골대 기둥 · 골망 안
function ihWall(S){const {W,H,RP,GW,EW,M}=IH,q=S.p,cx=W/2,g=GW/2,ev=(t,v)=>{if(S.ev&&v>40)S.ev(t,Math.min(1,v/900));};
  if(q.y<0||q.y>H){const lo=cx-g+RP,hi=cx+g-RP,bk=-(M-4)+RP*.6;q.vx*=.985;q.vy*=.985;   // 골 틈 안: 양옆 벽과 그물 뒤(퍽이 그물에 반쯤 묻힌다)
    if(q.x<lo){q.x=lo;q.vx=Math.abs(q.vx)*.4;}if(q.x>hi){q.x=hi;q.vx=-Math.abs(q.vx)*.4;}
    if(q.y<bk){q.y=bk;q.vy=Math.abs(q.vy)*.15;}if(q.y>H-bk){q.y=H-bk;q.vy=-Math.abs(q.vy)*.15;}return;}
  const n=ihCorner(q,RP);if(n){const vn=q.vx*n[0]+q.vy*n[1];if(vn>0){q.vx-=(1+EW)*vn*n[0];q.vy-=(1+EW)*vn*n[1];ev('wall',vn);}}
  if(q.x<RP){ev('wall',-q.vx);q.x=RP;q.vx=Math.abs(q.vx)*EW;}if(q.x>W-RP){ev('wall',q.vx);q.x=W-RP;q.vx=-Math.abs(q.vx)*EW;}
  const inS=Math.abs(q.x-cx)<g,r=RP+2;
  if(!inS&&q.y<RP){ev('wall',-q.vy);q.y=RP;q.vy=Math.abs(q.vy)*EW;}if(!inS&&q.y>H-RP){ev('wall',q.vy);q.y=H-RP;q.vy=-Math.abs(q.vy)*EW;}
  if(q.y>r&&q.y<H-r)return;const py=q.y<H/2?0:H;   // 골대 기둥(틈 양끝)
  for(const px of [cx-g,cx+g]){const dx=q.x-px,dy=q.y-py;if(dx*dx+dy*dy>=r*r)continue;const d=ihHy(dx,dy);if(!d)continue;
    const nx=dx/d,ny=dy/d,vn=q.vx*nx+q.vy*ny;q.x=px+nx*r;q.y=py+ny*r;if(vn<0){q.vx-=(1+EW)*vn*nx;q.vy-=(1+EW)*vn*ny;if(S.ev&&vn<-60)S.ev('post',1);}}}
// 잘게 쪼갠 한 걸음: 스트라이커 이동 → 퍽 이동 → 충돌 → 보드. 보드와 스트라이커 사이에 낀 퍽은 스트라이커를 밀어낸다.
// 퍽이 골 틈 안으로 3 넘게 들어가면 골: 1(우리 골) · 2(상대 골)
function ihSub(S,h){const {H,RP,RS}=IH,q=S.p,f=Math.exp(-IH.FR*h),m=RS+RP;S.t+=h;
  for(let k=0;k<2;k++){const s=S.s[k],ox=s.x,oy=s.y;s.x+=s.vx*h;s.y+=s.vy*h;ihKeep(s,k===1);s.ex=(s.x-ox)/h;s.ey=(s.y-oy)/h;}
  q.x+=q.vx*h;q.y+=q.vy*h;q.vx*=f;q.vy*=f;ihHit(S,0);ihHit(S,1);ihWall(S);
  for(let k=0;k<2;k++){const s=S.s[k],dx=q.x-s.x,dy=q.y-s.y;if(dx*dx+dy*dy>=m*m)continue;const d=ihHy(dx,dy);if(d){s.x=q.x-dx/d*m;s.y=q.y-dy/d*m;ihKeep(s,k===1);}}
  return q.y<-3?1:q.y>H+3?2:0;}
// 1/120초: 두 스트라이커가 갈 곳을 정하고(P0가 없으면 사람: u={x,y,v}) 네 번 쪼개 움직인다
function ihTick(S,h,P0,P1,u){const s0=S.s[0];
  if(P0){const t=ihAI(S,0,P0,h);ihAim(s0,t[0],t[1],0,P0.spd,P0.acc,h);}else ihAim(s0,u.x,u.y,0,u.v,0,h);
  const t=ihAI(S,1,P1,h);ihAim(S.s[1],t[0],t[1],1,P1.spd,P1.acc,h);
  let g=0;for(let i=0;i<IH.SUB;i++){const r=ihSub(S,h/IH.SUB);if(r&&!g)g=r;}
  S.zn[S.p.y<IH.H/2?0:1]+=h;return g;}
function ihGoal(S,k){S.sc[k]++;if(!(S.lh===k&&S.shot))S.sh[k]++;S.shot=0;S.log.push({k:k,per:S.per,t:(S.per===3?IH.OT:IH.PER)-S.clk,a:S.sc[0],b:S.sc[1]});}
const ihOver=S=>S.sc[0]>=IH.WIN||S.sc[1]>=IH.WIN||(S.per===3&&S.sc[0]!==S.sc[1]);
// 피리어드가 끝났다: 다음 피리어드 · 연장 · 끝
function ihNext(S){if(S.per===1){S.per=2;S.clk=IH.PER;return 'p2';}if(S.per===2&&S.sc[0]===S.sc[1]){S.per=3;S.clk=IH.OT;return 'ot';}return 'end';}
// 이겼나: 골 → 유효 슈팅 → 상대 진영에 퍽이 머문 시간
const ihWin=S=>S.sc[0]!==S.sc[1]?S.sc[0]>S.sc[1]:S.sh[0]!==S.sh[1]?S.sh[0]>S.sh[1]:S.zn[0]>=S.zn[1];
const ihClk=(per,t)=>(per===3?'연장 ':per+'P ')+Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
// 효과음: 퍽이 스트라이커에 맞는 딱 소리, 보드에 부딪는 둔탁한 소리, 골대 기둥의 쨍 소리, 골 혼
const IH_SFX={hit:v=>{clk(2600,.3+.5*v);tone(1150+600*v,'triangle',.035,.04+.07*v);thud(240,.1*v,0,.05);},
  wall:v=>{thud(90,.1+.22*v,0,.12);clk(650,.15+.25*v);},post:()=>{clk(1900,.7);tone(1480,'triangle',.5,.09);tone(2230,'sine',.4,.05);},
  horn:()=>{[[174,.12],[220,.09],[87,.08]].forEach(p=>tone(p[0],'sawtooth',1.5,p[1]));noise(1.9,.11,.05,1700);},net:()=>{noise(.3,.12,0,900);thud(70,.22,0,.2);}};
// 화면 배치: 링크 단위 → 캔버스 픽셀. rot이면 링크를 눕힌다(우리 골문 왼쪽)
function ihTf(g,L,ox,oy){const {M,H}=IH,k=L.s*L.D;if(L.rot)g.setTransform(0,k,-k,0,k*(M+H)+ox*L.D,k*M+oy*L.D);else g.setTransform(k,0,0,k,k*M+ox*L.D,k*M+oy*L.D);}
function ihRR(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
// 움직이지 않는 것(얼음 · 선 · 보드 광고 · 골망)은 한 번만 그려 둔다
function ihRink(L){const {W,H,M,R,GW}=IH,c=document.createElement('canvas'),cx=W/2,B=M-4;c.width=L.cw*L.D;c.height=L.ch*L.D;const g=c.getContext('2d');let sd=11;
  const rnd=()=>(sd=sd*16807%2147483647)/2147483647;
  g.fillStyle='#0b1220';g.fillRect(0,0,c.width,c.height);ihTf(g,L,0,0);
  ihRR(g,-M+1,-M+1,W+2*M-2,H+2*M-2,R+M-1);g.fillStyle='#22324f';g.fill();
  ihRR(g,-B,-B,W+2*B,H+2*B,R+B);g.fillStyle='#eef2f7';g.fill();
  // 보드 광고판: 옆 보드는 세로로, 엔드 보드는 골 틈 양옆에
  const AD=[['PANDEMIC CUP','#123a6b','#f1d589'],['팬데믹 대통령','#f1d589','#14213a'],['백신 접종','#b3261e','#fff'],['결승전','#14213a','#fff'],['손 씻기','#2e7d55','#fff'],['FINAL','#e3a72f','#14213a']];
  const ad=(x,y,w,h,k,rot)=>{const a=AD[k%AD.length];g.fillStyle=a[1];g.fillRect(x,y,w,h);g.save();g.translate(x+w/2,y+h/2);if(rot)g.rotate(rot);
    g.fillStyle=a[2];g.font='800 '+(B*.52)+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(a[0],0,.5,(rot?h:w)-4);g.restore();};
  const n=4,len=(H-2*R)/n;for(let i=0;i<n;i++){ad(-B+1,R+i*len+2,B-2.5,len-4,i,-Math.PI/2);ad(W+1.5,R+i*len+2,B-2.5,len-4,i+3,Math.PI/2);}
  [[R,cx-GW/2-10],[cx+GW/2+10,W-R]].forEach((e,i)=>{ad(e[0],-B+1,e[1]-e[0],B-2.5,i+1,0);ad(e[0],H+1.5,e[1]-e[0],B-2.5,i+4,0);});
  // 얼음: 은은한 결 · 조명 반사 · 스케이트 자국 · 보드 밑 눈 가루
  g.save();ihRR(g,0,0,W,H,R);g.clip();
  const ig=g.createLinearGradient(0,0,W,H);ig.addColorStop(0,'#f5f9fd');ig.addColorStop(.5,'#e2edf6');ig.addColorStop(1,'#eef5fb');g.fillStyle=ig;g.fillRect(0,0,W,H);
  [[W*.28,H*.2,110],[W*.74,H*.6,130],[W*.45,H*.88,80]].forEach(p=>{const r=g.createRadialGradient(p[0],p[1],0,p[0],p[1],p[2]);r.addColorStop(0,'rgba(255,255,255,.8)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(p[0]-p[2],p[1]-p[2],2*p[2],2*p[2]);});
  g.lineCap='round';for(let i=0;i<150;i++){const x=rnd()*W,y=rnd()*H,l=10+rnd()*50,a=rnd()*6.28;g.strokeStyle='rgba(110,140,175,'+(.04+rnd()*.1)+')';g.lineWidth=.25+rnd()*.6;g.beginPath();g.arc(x,y,l,a,a+.25+rnd()*.7);g.stroke();}
  // 선은 얼음 밑에 칠해져 있어 조금 흐리다
  g.globalAlpha=.88;g.fillStyle='#d23a32';g.fillRect(0,H/2-3,W,6);g.fillStyle='rgba(255,255,255,.55)';for(let x=6;x<W;x+=16)g.fillRect(x,H/2-.6,7,1.2);
  g.fillStyle='#2f6fd0';g.fillRect(0,H/3-3,W,6);g.fillRect(0,2*H/3-3,W,6);g.fillStyle='#d23a32';g.fillRect(0,22,W,1.6);g.fillRect(0,H-23.6,W,1.6);
  g.lineWidth=1.8;g.strokeStyle='#2f6fd0';g.beginPath();g.arc(cx,H/2,40,0,6.283);g.stroke();g.fillStyle='#2f6fd0';g.beginPath();g.arc(cx,H/2,3.2,0,6.283);g.fill();
  g.strokeStyle='#d23a32';g.fillStyle='#d23a32';g.lineWidth=1.5;
  [[.27,.17],[.73,.17],[.27,.83],[.73,.83]].forEach(p=>{const x=W*p[0],y=H*p[1];g.beginPath();g.arc(x,y,31,0,6.283);g.stroke();g.beginPath();g.arc(x,y,3.6,0,6.283);g.fill();
    [-1,1].forEach(sx=>[-1,1].forEach(sy=>{g.beginPath();g.moveTo(x+sx*31,y+sy*4);g.lineTo(x+sx*37,y+sy*4);g.stroke();g.beginPath();g.moveTo(x+sx*4,y+sy*7);g.lineTo(x+sx*4,y+sy*12);g.lineTo(x+sx*9,y+sy*12);g.stroke();}));});
  [[.27,.39],[.73,.39],[.27,.61],[.73,.61]].forEach(p=>{g.beginPath();g.arc(W*p[0],H*p[1],3,0,6.283);g.fill();});
  [[0,0,Math.PI],[H,Math.PI,2*Math.PI]].forEach(p=>{g.beginPath();g.moveTo(cx-38,p[0]);g.arc(cx,p[0],38,p[1],p[2]);g.closePath();g.fillStyle='rgba(110,175,235,.5)';g.fill();g.strokeStyle='#d23a32';g.stroke();});
  g.globalAlpha=1;g.strokeStyle='rgba(227,167,47,.35)';g.lineWidth=1;g.beginPath();g.arc(cx,H/2,16,0,6.283);g.stroke();
  ihRR(g,0,0,W,H,R);g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=9;g.stroke();g.restore();
  // 안쪽 테(노란 킥 플레이트)와 골망 · 빨간 골대 기둥
  ihRR(g,0,0,W,H,R);g.strokeStyle='#f1c84b';g.lineWidth=2.2;g.stroke();
  [[-B,0],[H,H]].forEach(p=>{const y=p[0],x0=cx-GW/2;g.fillStyle='#121a2a';g.fillRect(x0,y,GW,B);g.save();g.beginPath();g.rect(x0,y,GW,B);g.clip();g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=.6;
    for(let k=-B;k<GW+B;k+=4){g.beginPath();g.moveTo(x0+k,y);g.lineTo(x0+k+B,y+B);g.stroke();g.beginPath();g.moveTo(x0+k+B,y);g.lineTo(x0+k,y+B);g.stroke();}g.restore();
    g.strokeStyle='#d23a32';g.lineWidth=1.6;g.strokeRect(x0,y,GW,B);g.fillStyle='#d23a32';[x0,x0+GW].forEach(x=>{g.beginPath();g.arc(x,p[1],3,0,6.283);g.fill();});
    g.fillStyle='rgba(255,255,255,.6)';[x0,x0+GW].forEach(x=>{g.beginPath();g.arc(x-.8,p[1]-.8,1,0,6.283);g.fill();});});
  return c;}
function ihPuck(g,x,y){const r=IH.RP;g.fillStyle='rgba(12,24,44,.28)';g.beginPath();g.arc(x+1.6,y+2.2,r,0,6.283);g.fill();
  const gr=g.createRadialGradient(x-3,y-4,1,x,y,r);gr.addColorStop(0,'#3f4650');gr.addColorStop(1,'#07080b');g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();
  g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;g.beginPath();g.arc(x,y,r-1.6,3.5,5.7);g.stroke();g.strokeStyle='rgba(241,213,137,.6)';g.lineWidth=.9;g.beginPath();g.arc(x,y,r*.45,0,6.283);g.stroke();}
// 스트라이커: 그림자 · 팀 색 몸통 · 테두리 띠 · 볼록한 손잡이
function ihStr(g,x,y,c,me){const r=IH.RS;g.fillStyle='rgba(12,24,44,.3)';g.beginPath();g.arc(x+2.4,y+3.4,r,0,6.283);g.fill();
  const b=g.createRadialGradient(x-6,y-7,2,x,y,r);b.addColorStop(0,me?'#fff1bf':'rgba(255,255,255,.75)');b.addColorStop(.35,me?'#f1d589':c[0]);b.addColorStop(1,me?'#a8731a':c[0]);
  g.fillStyle=b;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();if(!me){g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(x,y,r,.3,2.9);g.arc(x,y,r-4,2.9,.3,true);g.fill();}
  g.strokeStyle=me?'#fff6d6':c[1];g.lineWidth=2.4;g.beginPath();g.arc(x,y,r-4.2,0,6.283);g.stroke();
  g.strokeStyle='rgba(10,18,32,.55)';g.lineWidth=1;g.beginPath();g.arc(x,y,r-.5,0,6.283);g.stroke();
  const k=g.createRadialGradient(x-3,y-4,1,x,y,r*.48);k.addColorStop(0,me?'#fff8de':'#fff');k.addColorStop(.5,me?'#e3a72f':c[0]);k.addColorStop(1,me?'#7a5212':'#1d1b18');
  g.fillStyle=k;g.beginPath();g.arc(x,y,r*.48,0,6.283);g.fill();}
function mgHockey(box,done){const $=id=>document.getElementById(id),{W,H,M}=IH,nat=ihNat(),col=IH_COL[nat]||IH_DEF,P1=ihRiv(),S=ihNew(),
    pc=matchMedia('(hover:hover) and (pointer:fine)').matches,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.innerHTML='<div class="mgx ih" id="ihX"><div class="ih-wrap"><div class="ih-sb"><div class="ih-tm me"><i></i><span>우리</span><b id="ihA">0</b></div>'+
    '<div class="ih-ck"><em id="ihP">1P</em><strong id="ihT">0:45</strong><small id="ihS">슈팅 0 · 0</small></div><div class="ih-tm op"><b id="ihB">0</b><span>'+nat+'</span><i style="background:'+col[0]+'"></i></div></div>'+
    '<div class="ih-st" id="ihSt"><canvas id="ihC" aria-label="아이스하키 링크"></canvas><div class="ih-fx" id="ihFx" aria-live="polite"></div>'+
    '<div class="ih-ov" id="ihOv"><b class="ih-tt">아이스하키 결승</b><span class="ih-vs">'+OLY_HOME()+' 대 '+nat+'</span><p id="ihHow"></p><p class="ih-ru">45초씩 2피리어드 · 5골 먼저 넣으면 끝 · 비기면 골든골 연장</p>'+
    '<button id="ihGo" class="pri">경기 시작</button></div></div></div></div>';
  const X=$('ihX'),cv=$('ihC'),st=$('ihSt'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),U={x:W/2,y:H-60,kb:0,id:null},K={};
  let L={s:1,rot:0,cw:1,ch:1,D:D},bg=null,fxT=0,ph='intro',pt=0,beep=0,last=performance.now(),acc=0,live=true,fl=0,fk=-1,shk=0,trail=[],hk='',over=false,snd={};
  // 상자 너비와 화면 높이에 맞춰 링크 크기를 정한다. 세로로 세운 것보다 눕힌 것이 훨씬 크게 들어가면(가로로 짧은 휴대폰) 눕힌다
  const fit=()=>{const cs=getComputedStyle(X),pw=X.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),
      vh=(window.visualViewport?visualViewport.height:innerHeight)-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom)-36,sb=X.querySelector('.ih-sb'),
      tw=W+2*M,th=H+2*M,sP=Math.min(pw/tw,(vh-(X.classList.contains('l')?52:sb.offsetHeight)-8)/th),sL=Math.min((pw-130)/th,vh/tw),rot=sL>sP*1.25,s=Math.max(.42,Math.min(1.3,rot?sL:sP));
    L={s:s,rot:rot,D:D,cw:Math.round((rot?th:tw)*s),ch:Math.round((rot?tw:th)*s)};X.classList.toggle('l',rot);
    cv.width=L.cw*D;cv.height=L.ch*D;cv.style.width=st.style.width=L.cw+'px';cv.style.height=L.ch+'px';X.querySelector('.ih-sb').style.width=rot?'':L.cw+'px';
    bg=ihRink(L);$('ihHow').textContent=(pc?'마우스를 움직이면 금색 스트라이커가 따라간다(방향키·WASD도 된다). ':'화면을 누른 채 끌면 금색 스트라이커가 손가락 조금 위를 따라간다. ')+
      '퍽을 쳐서 '+(rot?'오른쪽':'위쪽')+' 골문에 넣어라.';draw();};
  const phy=(sx,sy)=>L.rot?[sy/L.s-M,H+M-sx/L.s]:[sx/L.s-M,sy/L.s-M];
  // 큰 글씨(골!·3·2·1)는 루프가 시간을 재서 내린다. 라이트 화면은 CSS 애니메이션 시간을 0으로 만들어, 애니메이션으로 지우면 아예 안 보여서다
  const fx=(s,c,d)=>{const f=$('ihFx');f.textContent=s;f.className='ih-fx '+c;void f.offsetWidth;f.classList.add('on');fxT=d||1.4;};
  const hud=()=>{const c=Math.ceil(S.clk-1e-6),k=S.sc+'|'+c+'|'+S.per+'|'+S.sh;if(k===hk)return;const o=hk.split('|')[0];hk=k;
    $('ihA').textContent=S.sc[0];$('ihB').textContent=S.sc[1];$('ihP').textContent=['','1P','2P','연장'][S.per];
    $('ihT').textContent=Math.floor(c/60)+':'+String(c%60).padStart(2,'0');$('ihT').classList.toggle('hot',ph==='play'&&c<=10);$('ihS').textContent='슈팅 '+S.sh[0]+' · '+S.sh[1];
    if(o&&o!==String(S.sc))['ihA','ihB'].forEach((id,i)=>{if(+o.split(',')[i]!==S.sc[i]){const b=$(id);b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}});};
  // 소리는 종류마다 짧은 간격을 두어 겹쳐 터지지 않게
  S.ev=(t,v)=>{const n=performance.now();if(n-(snd[t]||0)<(t==='hit'?45:70))return;snd[t]=n;try{IH_SFX[t](v);}catch(e){}};
  // 손가락·마우스: 링크 위의 점을 우리 스트라이커가 갈 곳으로. 손가락은 스트라이커를 가리지 않게 30px 아래에서 끈다
  const aim=e=>{const r=cv.getBoundingClientRect(),p=phy(e.clientX-r.left,e.clientY-r.top-(e.pointerType==='mouse'?0:30));U.x=p[0];U.y=p[1];U.kb=0;};
  const pd=e=>{if(!live)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}U.id=e.pointerId;aim(e);};
  const pm=e=>{if(!live)return;if(e.pointerType==='mouse'||U.id===e.pointerId){if(e.cancelable&&e.pointerType!=='mouse')e.preventDefault();aim(e);}};
  const pu=e=>{if(U.id===e.pointerId)U.id=null;};
  const tmv=e=>{if(live&&ph!=='intro')e.preventDefault();};   // 경기 중 링크 위 손가락으로 화면이 밀리지 않게(touch-action을 못 따르는 브라우저)
  const KM={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],a:[-1,0],d:[1,0],w:[0,-1],s:[0,1],A:[-1,0],D:[1,0],W:[0,-1],S:[0,1]};
  const kd=e=>{if(!live||ph==='intro'||ph==='end'||!KM[e.key])return;e.preventDefault();K[e.key]=1;U.kb=1;},ku=e=>{delete K[e.key];};
  cv.addEventListener('pointerdown',pd);cv.addEventListener('pointermove',pm);cv.addEventListener('pointerup',pu);cv.addEventListener('pointercancel',pu);
  cv.addEventListener('touchmove',tmv,{passive:false});document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  const rs=()=>{if(live)fit();};addEventListener('resize',rs);if(window.visualViewport)visualViewport.addEventListener('resize',rs);
  const off=()=>{live=false;document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);removeEventListener('resize',rs);if(window.visualViewport)visualViewport.removeEventListener('resize',rs);};
  // 방향키: 화면 기준 방향을 링크 방향으로(눕혔으면 돌려서)
  const key=()=>{let kx=0,ky=0;for(const k in K){kx+=KM[k][0];ky+=KM[k][1];}const s0=S.s[0];if(!kx&&!ky){U.x=s0.x;U.y=s0.y;return;}
    const d=Math.hypot(kx,ky),dx=L.rot?ky/d:kx/d,dy=L.rot?-kx/d:ky/d;U.x=s0.x+dx*60;U.y=s0.y+dy*60;};
  const goal=k=>{ihGoal(S,k);fk=k;fl=1.8;shk=k?.5:1;ph='goal';pt=2.1;S.lock=1;over=ihOver(S);
    if(k===0){try{IH_SFX.horn();SFX.goal();}catch(e){}fx('골!','g');}else{try{IH_SFX.net();SFX.concede();}catch(e){}fx('실점','x');}};
  const perEnd=()=>{try{SFX.whistle();}catch(e){}S.lock=1;const n=ihNext(S);if(n==='end')return fin();ph='break';pt=2.4;fx(n==='ot'?'연장 · 골든골':'2피리어드','n s',2.2);};
  const fin=()=>{ph='end';S.lock=1;const win=ihWin(S),t=win?0:1,a=S.sc[0],b=S.sc[1],ot=S.log.length&&S.log[S.log.length-1].per===3;off();
    try{IH_SFX.horn();SFX.medal(t);}catch(e){}
    const how=a===b?' · 유효 슈팅 판정('+S.sh[0]+' : '+S.sh[1]+')':ot?' · 연장 골든골':'';
    hud();$('ihOv').innerHTML='<b class="ih-tt">최종 '+a+' : '+b+'</b><div class="pk-msg">'+(win?'금메달!':'은메달')+how+'</div><p>'+(win?ihJ(nat,'을','를')+' 꺾고 정상에 섰다.':ihJ(nat,'이','가')+' 한 수 위였다. 그래도 값진 은메달이다.')+'</p>'+
      '<button id="ihGo" class="pri">결과 보기</button>';$('ihOv').classList.remove('off');$('ihGo').onclick=()=>done(t);draw();};
  const tick=h=>{if(ph==='intro'||ph==='end')return;if(U.kb)key();const u={x:U.x,y:U.y,v:U.kb?IH.PK:IH.PV};
    if(ph==='play'){const r=ihTick(S,h,null,P1,u);S.clk-=h;if(r)return goal(r-1);if(S.clk<=0){S.clk=0;perEnd();}return;}
    ihTick(S,h,null,P1,u);pt-=h;
    if(ph==='count'){const n=Math.ceil(pt/.8);if(n!==beep&&n>0){beep=n;try{SFX.beep(n);}catch(e){}fx(String(n),'n',.7);}
      if(pt<=0){beep=0;S.lock=0;ph='play';try{SFX.beep(0);SFX.whistle();}catch(e){}fx('시작!','n',.7);}}
    else if(ph==='ready'&&pt<=0){S.lock=0;ph='play';try{SFX.whistle();}catch(e){}}
    else if(ph==='goal'&&pt<=0){if(over)return fin();ihPlace(S,fk===0?1:0);U.x=W/2;U.y=H-60;ph='ready';pt=.9;fx('페이스오프','n s',.8);}
    else if(ph==='break'&&pt<=0){ihPlace(S,-1);U.x=W/2;U.y=H-60;ph='count';pt=2.4;}};
  function draw(){if(!bg)return;g.setTransform(1,0,0,1,0,0);const ox=shk>0&&!rm?(Math.random()-.5)*shk*7:0,oy=shk>0&&!rm?(Math.random()-.5)*shk*7:0;
    g.fillStyle='#0b1220';g.fillRect(0,0,cv.width,cv.height);g.drawImage(bg,ox*D,oy*D);ihTf(g,L,ox,oy);
    // 골 램프: 골이 나면 그 골문 뒤 빨간 등이 켜진다
    [[-M+3,1],[H+M-3,0]].forEach(p=>{const on=fl>0&&(fk===0?p[1]:!p[1])&&(rm||Math.floor(fl*6)%2===0);
      if(on){const r=g.createRadialGradient(W/2,p[0],0,W/2,p[0],34);r.addColorStop(0,'rgba(255,70,50,.85)');r.addColorStop(1,'rgba(255,70,50,0)');g.fillStyle=r;g.fillRect(W/2-34,p[0]-34,68,68);}
      g.fillStyle=on?'#ff5a46':'#5a1d1a';g.beginPath();g.ellipse(W/2,p[0],7,2.6,0,0,6.283);g.fill();});
    // 퍽 잔상: 빠를수록 길고 진하다
    const q=S.p,v=Math.hypot(q.vx,q.vy);trail.forEach((t,i)=>{const a=(i+1)/trail.length;if(v<160)return;g.fillStyle='rgba(30,50,80,'+(.16*a*Math.min(1,v/700))+')';g.beginPath();g.arc(t[0],t[1],IH.RP*(.55+.45*a),0,6.283);g.fill();});
    ihPuck(g,q.x,q.y);ihStr(g,S.s[1].x,S.s[1].y,col,0);ihStr(g,S.s[0].x,S.s[0].y,col,1);
    if(fl>0&&!rm){g.setTransform(1,0,0,1,0,0);g.fillStyle=fk===0?'rgba(255,214,110,'+(.22*Math.min(1,fl))+')':'rgba(200,40,40,'+(.14*Math.min(1,fl))+')';g.fillRect(0,0,cv.width,cv.height);}}
  const loop=now=>{if(!live)return;if(!box.isConnected){off();return;}
    const dt=Math.min(.05,Math.max(0,(now-last)/1000)),Q=window.__ihQA;last=now;acc+=dt*(Q&&Q.fast||1);
    let n=0;while(acc>=IH.ST&&n<60&&live){tick(IH.ST);acc-=IH.ST;n++;}if(n>=60)acc=0;
    fl=Math.max(0,fl-dt);if(fxT>0&&(fxT-=dt)<=0)$('ihFx').classList.remove('on');shk=Math.max(0,shk-dt*2.2);trail.push([S.p.x,S.p.y]);if(trail.length>(rm?3:7))trail.shift();
    if(live){draw();hud();requestAnimationFrame(loop);}};
  // 시험용: window.__ihQA가 있으면 상태를 읽고(st) 빠르게 돌릴 수 있다(fast)
  if(window.__ihQA)window.__ihQA.st=()=>{const r=cv.getBoundingClientRect();return {ph:ph,sc:S.sc.slice(),sh:S.sh.slice(),per:S.per,clk:S.clk,p:[S.p.x,S.p.y,S.p.vx,S.p.vy],s:[S.s[0].x,S.s[0].y],o:[S.s[1].x,S.s[1].y],
    L:{s:L.s,rot:L.rot,x:r.left,y:r.top,w:r.width,h:r.height,M:M,H:H},nat:nat};};
  $('ihGo').onclick=()=>{try{aInit();SFX.click();}catch(e){}$('ihOv').classList.add('off');ihPlace(S,-1);S.lock=1;ph='count';pt=2.4;beep=0;
    try{X.scrollIntoView({block:'nearest'});}catch(e){}};
  fit();hud();requestAnimationFrame(loop);}
// 시뮬레이션: 직접 할 때와 같은 물리 · 같은 상대에, 우리 쪽도 평균 실력의 인공지능을 세워 한 경기를 통째로 돌린다
function simHockey(){const nat=ihNat(),S=ihNew(),P0=ihPar(IH_SIMLV),P1=ihRiv();let ot=0;ihPlace(S,-1);
  for(let n=0;n<60000;n++){const r=ihTick(S,IH.ST,P0,P1);S.clk-=IH.ST;
    if(r){ihGoal(S,r-1);if(ihOver(S))break;ihPlace(S,r===1?1:0);continue;}
    if(S.clk<=0){S.clk=0;const x=ihNext(S);if(x==='end')break;if(x==='ot')ot=1;ihPlace(S,-1);}}
  const win=ihWin(S),a=S.sc[0],b=S.sc[1];
  let G=S.log.map(e=>'<span class="k">'+ihClk(e.per,e.t)+'</span>'+(e.k?'<b class="x">'+nat+' 골</b>':'<b class="g">우리 골</b>')+' · '+e.a+' : '+e.b+(e.per===3?' · 골든골':''));
  if(G.length>6)G=G.slice(0,2).concat(['<span class="k">…</span>골 '+(G.length-5)+'개 더']).concat(G.slice(-3));
  if(!S.log.length)G.push('<span class="k">1·2P</span>양 팀 골리가 모든 슛을 막아 냈다');
  if(ot&&a===b)G.push('<span class="k">연장</span>골든골 없이 60초가 흘렀다');
  G.push('<span class="k">유효 슈팅</span>우리 '+S.sh[0]+' · '+nat+' '+S.sh[1]);
  return {lines:G,head:a+' : '+b+(a===b?' (슈팅 '+S.sh[0]+' : '+S.sh[1]+')':'')+' · '+(win?'금메달':'은메달'),t:win?0:1};}
