/* ---------- 수영 50m ----------
   경쟁자 셋은 경기마다 나라·기량·경기 운영이 새로 정해진다(초반 돌격 / 막판 스퍼트 / 고른 페이스).
   레이스 중에도 컨디션이 출렁이고 가끔 치고 나간다. 강한 선수 하나, 중간 하나, 약한 하나는 늘 섞여 있다. */
const SW_D=50,SW_STY=[p=>1.13-.24*p,p=>.9+.24*p*p,()=>1];
function swRivals(){const NAT=MG_NAT();return [4.95+Math.random()*.55,4.5+Math.random()*.5,4.05+Math.random()*.5].sort(()=>Math.random()-.5)
  .map((v,i)=>({n:NAT[i],v:v,x:0,t:0,f:SW_STY[Math.floor(Math.random()*SW_STY.length)],rt:.1+Math.random()*.3,nz:0,sg:0}));}
// 경쟁자 한 명을 dt초 움직인다. 막 들어왔으면 true
function swStep(r,el,dt){if(r.x>=SW_D||el<r.rt)return false;
  r.nz+=(Math.random()-.5)*dt*1.6-r.nz*dt*1.2;r.nz=Math.max(-.12,Math.min(.12,r.nz));
  if(!r.sg&&Math.random()<dt*.18)r.sg=.6+Math.random()*.8;
  let m=r.f(r.x/SW_D)*(1+r.nz);if(r.sg>0){m*=1.1;r.sg=Math.max(0,r.sg-dt);}
  r.x=Math.min(SW_D,r.x+r.v*m*dt);if(r.x>=SW_D&&!r.t){r.t=el;return true;}return false;}
function mgSwim(box,done){const D=SW_D,riv=swRivals();
  let x=0,v=0,last='',live=false,raf=0,fin=0,fc=0;
  const ft=(i,el)=>{fc++;const f=$('swf'+i);f.textContent=fc+'위 · '+el.toFixed(2)+'초';if(fc===1)f.classList.add('p1');};
  box.innerHTML='<div class="mgx sw"><div class="sw-pool" id="swPool">'+['우리'].concat(riv.map(r=>r.n)).map((n,i)=>'<div class="sw-lane"><span>'+n+'</span><i id="sw'+i+'"></i><b class="sw-ft" id="swf'+i+'"></b></div>').join('')+'</div>'+
   '<div class="sw-info"><b id="swT">0.00</b>초 · <span id="swD">0</span>m / '+D+'m</div><div class="pk-msg" id="swMsg">시작하면 왼팔·오른팔을 번갈아 누르세요</div>'+
   '<div class="sw-btns"><button id="swL" disabled>왼팔</button><button id="swR" disabled>오른팔</button></div><button id="swGo" class="pri" style="width:100%;padding:14px;margin-top:8px">출발 준비</button></div>';
  const $=id=>document.getElementById(id);
  const stroke=s=>{if(!live)return;if(s===last){SFX.gulp();v*=.5;$('swMsg').textContent='물을 먹었다! 번갈아 눌러야 한다';}else{SFX.stroke(s);v+=.55;$('swMsg').textContent='';}last=s;};
  const key=e=>{if(e.key==='ArrowLeft'||e.key==='a')stroke('L');if(e.key==='ArrowRight'||e.key==='d')stroke('R');};
  $('swL').onclick=()=>stroke('L');$('swR').onclick=()=>stroke('R');document.addEventListener('keydown',key);
  let simT=0;const step=()=>{if(!live)return;if(!box.isConnected){live=false;clearInterval(raf);document.removeEventListener('keydown',key);return;}
    const dt=1/60;simT+=dt;const el=simT;v*=Math.pow(.404,dt);if(x<D)x=Math.min(D,x+v*dt);
    riv.forEach((r,i)=>{if(swStep(r,el,dt))ft(i+1,el);});
    $('sw0').style.left=(x/D*92)+'%';riv.forEach((r,i)=>{$('sw'+(i+1)).style.left=(r.x/D*92)+'%';});$('swT').textContent=el.toFixed(2);$('swD').textContent=Math.floor(x);
    if(x>=D&&!fin){fin=el;ft(0,el);SFX.touch();}
    if(fin&&riv.every(r=>r.t||r.x>=D)||el>25){live=false;clearInterval(raf);document.removeEventListener('keydown',key);const place=fin?1+riv.filter(r=>r.t&&r.t<fin).length:4,t=Math.min(3,place-1);
      SFX.medal(t);$('swMsg').textContent=(fin?fin.toFixed(2)+'초 · ':'')+['금메달!','은메달','동메달','메달을 놓쳤다'][t];$('swL').disabled=$('swR').disabled=true;$('swGo').style.display='';$('swGo').textContent='결과 보기';$('swGo').onclick=()=>done(t);return;}
    };
  $('swGo').onclick=()=>{$('swGo').style.display='none';let c=3;$('swMsg').textContent=c;SFX.beep(3);const iv=setInterval(()=>{c--;if(c>0){$('swMsg').textContent=c;SFX.beep(c);}else{clearInterval(iv);$('swMsg').textContent='출발!';SFX.beep(0);SFX.splash(.15);$('swL').disabled=$('swR').disabled=false;live=true;raf=setInterval(step,1000/60);}},700);};}
// 시뮬레이션: 우리 선수는 초당 7.6~9.8번 팔을 젓는다(직접 할 때 잘 누르는 사람과 비슷한 범위)
function simSwim(){const riv=swRivals(),f=7.6+Math.random()*2.2,dt=1/60;let x=0,v=0,el=0,next=.25,fin=0;
  while(el<25&&(!fin||riv.some(r=>!r.t))){el+=dt;if(el>=next){v+=.55;next+=1/f;}v*=Math.pow(.404,dt);x=Math.min(SW_D,x+v*dt);if(x>=SW_D&&!fin)fin=el;riv.forEach(r=>swStep(r,el,dt));}
  const L=[{n:'우리',t:fin||99,me:1}].concat(riv.map(r=>({n:r.n,t:r.t||99}))).sort((a,b)=>a.t-b.t),place=L.findIndex(r=>r.me)+1;
  return {lines:L.map((r,i)=>'<span class="k">'+(i+1)+'위</span>'+(r.me?'<b class="me">우리 선수</b>':r.n)+' · '+(r.t<99?r.t.toFixed(2)+'초':'기권')),
    head:(fin?fin.toFixed(2)+'초 · ':'')+MEDAL[Math.min(3,place-1)],t:Math.min(3,place-1)};}

