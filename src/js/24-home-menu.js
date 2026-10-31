/* ---------- HOME ---------- */
// 시작 과정은 진짜 게임처럼 화면을 꽉 채운 장면을 한 단계씩 넘어간다: 메인 메뉴 → 무대 → 지도자 → 설정 → 취임
let HUB_MSG='';
const ageTxt=q=>q.ageQ?'전성기 나이 미상':(q.al||'전성기')+' '+q.age+'세'+(q.pk?' · '+q.pk:'');
/* ---------- 게임식 메뉴 화면 ----------
   타이틀(home) → 무대(stepCamp) → 지도자(stepLeader) → 취임 준비(stepSetup).
   모두 cine(..., {cls:'gm', nav:false})로 화면 전체를 쓰고, 마우스·터치·방향키·Enter로 고른다. */
const gxSfx=(f,a)=>{try{SFX[f](a);}catch(e){}};
// Enter는 결정 버튼으로 보낸다. 다만 뒤로·소리 버튼에 초점이 있으면 그 버튼이 받게 둔다.
const gxEnter=e=>e.key==='Enter'&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.cine-back,.cine-x'));
const GX_STEP=['무대','지도자','준비'];
// 메인 메뉴 아이콘: 시작 · 왕관 · 책 · 나침반
const GX_IC={daily:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M12 12.2l1.1 2.2 2.4.3-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.3z" fill="currentColor" stroke="none"/></svg>',new:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  board:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>',
  dex:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
  guide:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
  ld:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4.5l2 2.5H19A1.5 1.5 0 0 1 20.5 10v8A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"/></svg>',
  news:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5h4"/></svg>',
  view:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-4 3.6-5.5 7-5.5s6.2 1.5 7 5.5"/></svg>',
  sail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3v13M12 4l7 10h-7M12 6L6 14h6M3 17h18l-2.5 4h-13z"/></svg>',
  mini:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5l2.3 5.4 5.8.5-4.4 3.8 1.3 5.7-5-3-5 3 1.3-5.7-4.4-3.8 5.8-.5z"/></svg>'};
function gxTop(n,right){return '<div class="gx-top"><ol class="gx-steps">'+GX_STEP.map((t,i)=>'<li class="'+(i<n?'done':i===n?'on':'')+'"><i>'+(i+1)+'</i>'+t+'</li>').join('')+'</ol>'+(right?'<span class="gx-tag">'+right+'</span>':'')+'</div>';}
// 타이틀 배경: 화면 가득 깔린 점들 사이로 감염이 번지고, 지나간 자리는 잠시 어두워졌다가 다시 살아난다
function gxLattice(cv){const ctx=cv.getContext&&cv.getContext('2d');if(!ctx)return;
  // 화면 가득한 캔버스라 배율은 2까지만(배율 3~3.75인 휴대폰에서 픽셀이 너무 많아진다), 그리기는 초당 30번이면 충분하다
  let W=0,H=0,N=[],sp=36,lastSeed=0,tm=0,lastDraw=0;const D=Math.min(2,DPR);
  const fit=()=>{const r=cv.getBoundingClientRect();W=r.width;H=r.height;if(!W||!H)return;
    cv.width=Math.round(W*D);cv.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);
    sp=Math.max(26,Math.min(46,Math.sqrt(W*H/950)));N=[];
    const cols=Math.ceil(W/sp)+2,rows=Math.ceil(H/(sp*.87))+2,G={};
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const n={x:(x-.5)*sp+(y%2?sp/2:0)+(Math.random()-.5)*sp*.45,y:(y-.5)*sp*.87+(Math.random()-.5)*sp*.45,s:0,t:0,f:null,nb:[]};
      N.push(n);(G[x+','+y]=n);}
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const n=G[x+','+y];
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const m=G[(x+dx)+','+(y+dy)];if(m&&m!==n&&Math.hypot(m.x-n.x,m.y-n.y)<sp*1.5)n.nb.push(m);}}};
  const seed=now=>{const L=N.filter(n=>n.s===0);if(!L.length)return;const n=L[Math.floor(Math.random()*L.length)];n.s=1;n.t=now;n.f=null;};
  const step=(now,dt)=>{let inf=0;
    for(const n of N){if(n.s===1){inf++;const a=now-n.t;
        if(a<1700&&Math.random()<dt*.0024){const m=n.nb[Math.floor(Math.random()*n.nb.length)];if(m&&m.s===0){m.s=1;m.t=now;m.f=n;}}
        if(a>2600){n.s=2;n.t=now;}}
      else if(n.s===2&&now-n.t>9000+Math.random()*4000)n.s=0;}
    if(inf<3||now-lastSeed>2600){seed(now);lastSeed=now;}};
  const draw=now=>{ctx.clearRect(0,0,W,H);
    ctx.fillStyle='rgba(201,162,74,.26)';ctx.beginPath();
    for(const n of N)if(n.s===0){ctx.moveTo(n.x+1.2,n.y);ctx.arc(n.x,n.y,1.2,0,6.283);}ctx.fill();
    ctx.fillStyle='rgba(120,108,90,.12)';ctx.beginPath();
    for(const n of N)if(n.s===2){ctx.moveTo(n.x+1,n.y);ctx.arc(n.x,n.y,1,0,6.283);}ctx.fill();
    ctx.lineWidth=1;
    for(const n of N){if(n.s!==1)continue;const a=Math.max(0,now-n.t),k=Math.min(1,a/400),fade=a>1800?Math.max(0,1-(a-1800)/800):1;
      if(n.f&&a<900){ctx.strokeStyle='rgba(224,96,79,'+(.55*(1-a/900)).toFixed(3)+')';ctx.beginPath();ctx.moveTo(n.f.x,n.f.y);ctx.lineTo(n.f.x+(n.x-n.f.x)*k,n.f.y+(n.y-n.f.y)*k);ctx.stroke();}
      ctx.fillStyle='rgba(224,96,79,'+(.13*fade).toFixed(3)+')';ctx.beginPath();ctx.arc(n.x,n.y,3+9*k,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(240,130,104,'+(.9*fade).toFixed(3)+')';ctx.beginPath();ctx.arc(n.x,n.y,1.3+1.1*k,0,6.283);ctx.fill();}};
  const onR=()=>{clearTimeout(tm);tm=setTimeout(fit,150);};
  fit();window.addEventListener('resize',onR);
  if(reduceFx()){let t=0;for(let i=0;i<240;i++){t+=33;step(t,33);}draw(t);window.removeEventListener('resize',onR);return;}
  let prev=performance.now();
  (function loop(now){if(!cv.isConnected){window.removeEventListener('resize',onR);return;}
    if(now-lastDraw>=32&&!document.hidden){const dt=Math.min(64,now-prev);prev=now;lastDraw=now;step(now,dt);draw(now);}requestAnimationFrame(loop);})(prev);}

