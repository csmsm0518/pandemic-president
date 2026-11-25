/* ---------- 크리스마스 단장(크리스마스 철 lvDec: 11월 20일 ~ 12월 31일에만) ----------
   html에 .xmas를 붙이고(디자인은 css/15-xmas.css), 화면 위에 두 겹을 얹는다. 둘 다 누를 수 없다(pointer-events:none).
   · .xm-lights: 화면 맨 위 전구 줄(46px마다 전구 하나, 색 넷이 번갈아 깜빡). 메뉴 · 게임 화면(.cine z 75) 위, 미니게임(z 120~) 아래.
   · .xm-snow: 화면 가득 내리는 눈(캔버스). 밝은 종이 화면에서도 보이게 눈송이에 옅은 푸른 테. 움직임 줄이기 설정이면 멈춘 눈.
     미니게임이 화면을 덮고 있거나 탭이 숨으면 그리지 않는다(xmasBusy).
   철이 지나면 아무것도 하지 않아 예전 화면 그대로다. */
const xmasOn=()=>{try{return lvDec();}catch(e){return false;}};
const xmasBusy=()=>!!document.querySelector('#cg,#ax,#qx,#sl,#ss,.sl,.ss,#stut,.zge,#woBg')||document.hidden;
function xmasInit(){if(!xmasOn()||document.querySelector('.xm-snow'))return;document.documentElement.classList.add('xmas');
  const L=document.createElement('div');L.className='xm-lights';L.setAttribute('aria-hidden','true');
  const n=Math.ceil(Math.max(screen.width||0,screen.height||0,innerWidth,innerHeight)/46)+1;
  L.innerHTML=Array.from({length:n},(_,i)=>'<i style="--d:'+((i*.53)%1.7).toFixed(2)+'s"></i>').join('');document.body.appendChild(L);
  const c=document.createElement('canvas');c.className='xm-snow';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
  const g=c.getContext('2d'),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;let W=0,H=0,D=1,F=[],last=performance.now(),skip=0;
  const fit=()=>{D=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;c.width=Math.round(W*D);c.height=Math.round(H*D);
    F=Array.from({length:Math.round(Math.max(24,Math.min(70,W*H/20000)))},()=>({x:Math.random()*W,y:Math.random()*H,r:.9+Math.random()*2.1,v:16+Math.random()*28,p:Math.random()*6.28}));draw(0);};
  const draw=dt=>{g.setTransform(D,0,0,D,0,0);g.clearRect(0,0,W,H);g.lineWidth=.7;
    for(const f of F){if(dt){f.y+=f.v*dt;f.p+=dt*.9;f.x+=Math.sin(f.p)*.35;if(f.y>H+6){f.y=-6;f.x=Math.random()*W;}}
      g.beginPath();g.arc(f.x,f.y,f.r,0,6.283);g.fillStyle='rgba(255,255,255,.9)';g.fill();g.strokeStyle='rgba(110,135,170,.4)';g.stroke();}};
  const tick=t=>{const dt=Math.min(.06,(t-last)/1000);last=t;requestAnimationFrame(tick);
    if(xmasBusy()){if(c.style.visibility!=='hidden')c.style.visibility='hidden';return;}if(c.style.visibility)c.style.visibility='';
    if(++skip%2)return;draw(dt*2);};   // 눈은 30번/초면 충분하다
  let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(fit,150);});fit();if(!RM)requestAnimationFrame(tick);}
