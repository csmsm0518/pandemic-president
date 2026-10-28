
/* ---------- 대항해 잠금 해제 튜토리얼(수영 금메달 선물) ----------
   올림픽 수영 결승을 직접 헤엄쳐 금메달을 따면 MEM.sailHint=1(sailGift). 다음에 메인 메뉴가 뜨면 home()이 이것을 연다.
   · 일반 화면(el = 로고의 나침반): 나침반만 밝게 남기고 둘레를 어둡게 덮는다. 빛나는 손끝 표시가 나침반 위를 돌며 돌리는 법을 보여 주고,
     나침반 둘레의 다섯 칸 고리가 한 바퀴마다 한 칸씩 찬다. 다섯 바퀴를 채우면 compassSpin이 대항해를 열고, 이 창에서 바로 출항할 수 있다.
   · 라이트 화면(el = null): 로고 나침반이 없어서 창 안에 같은 나침반을 띄워 그것을 돌린다.
   · 고리 안 전체가 손잡이다(작은 휴대폰 화면의 작은 나침반도 잡기 쉽게). 고리를 끌면 el._spinBy로 나침반을 돌린다(바퀴 수 · 해금은 compassSpin이 센다).
   · 닫으면 MEM.sailHint=2: 다시 저절로 뜨지 않고, 미니게임 판의 잠긴 대항해 칸에 여는 법이 남는다(그 칸을 고르면 다시 연다).
   · 키보드: ← → 로 나침반을 돌리고, Esc로 닫는다. 창이 떠 있는 동안 키는 뒤의 메인 메뉴로 가지 않는다. */
function sailTut(el){if(document.getElementById('stut')||eggOn('sail')||(el&&!el.isConnected))return;
  const lite=!el,N=SAIL_TURNS,o=document.createElement('div');
  const arc=i=>{const R=54,p=x=>(R*Math.cos(x*Math.PI/180)).toFixed(2)+' '+(R*Math.sin(x*Math.PI/180)).toFixed(2),a0=-90+i*360/N+4;return 'M'+p(a0)+'A'+R+' '+R+' 0 0 1 '+p(a0+360/N-8);};
  const ring='<div class="stut-ring" aria-hidden="true"><svg viewBox="-60 -60 120 120">'+Array.from({length:N},(_,i)=>'<path class="tr" d="'+arc(i)+'"/><path class="fl" pathLength="1" d="'+arc(i)+'"/>').join('')+
    '</svg><span class="stut-orb"><i></i></span></div>';
  const medal='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 0h3.2l1.5 5.2-2.3 1.1zM12.4 0H9.2L7.7 5.2l2.3 1.1z" fill="#8a6a24"/><circle cx="8" cy="10.6" r="4.9" fill="#f1d589" stroke="#8a6a24"/><path d="M8 8.1l.8 1.6 1.7.2-1.3 1.2.4 1.7L8 12l-1.6.8.4-1.7-1.3-1.2 1.7-.2z" fill="#8a6a24"/></svg>';
  o.id='stut';o.className='stut'+(lite?' lt':'');o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','stutH');
  o.innerHTML=(lite?'':'<div class="stut-dim" aria-hidden="true"></div>'+ring)+
    '<div class="stut-card" tabindex="-1">'+(lite?'<div class="stut-cmp">'+emblemSvg('embgT')+ring+'</div>':'')+
    '<div class="stut-hd"><div class="stut-k">'+medal+'<span>비밀 튜토리얼 · 수영 금메달 선물</span></div><h2 class="stut-h" id="stutH">바다가 당신을 부른다</h2>'+
    '<p class="stut-p">물살을 가른 사람에게만 알려 주는 비밀이에요. '+(lite?'위의':'빛나는 <b>로고</b>의')+' <b>금빛 나침반</b>을 손가락(또는 마우스)으로 잡고, 원을 그리며 <b>다섯 바퀴</b> 돌려 보세요.</p></div>'+
    '<ol class="stut-ck"><li class="on"><i>1</i><span>나침반을 잡는다</span></li><li><i>2</i><span>다섯 바퀴 돌린다</span><em id="stutN" aria-live="polite">0 / '+N+'</em></li><li><i>3</i><span>「대항해」가 열린다</span></li></ol>'+
    (lite?'<p class="stut-n">일반 화면(라이트 끄기)에서는 메인 메뉴 로고의 나침반이 바로 이 나침반이에요.</p>':'')+
    '<div class="stut-bt"><button type="button" class="stut-no">나중에 할게요</button><span class="stut-kb gx-keys"><kbd>←</kbd><kbd>→</kbd> 로도 돌린다</span></div></div>';
  document.body.appendChild(o);
  if(lite)el=o.querySelector('.stut-cmp svg');
  const C=o.querySelector('.stut-card'),RG=o.querySelector('.stut-ring'),FL=[...o.querySelectorAll('.stut-ring .fl')],LI=[...o.querySelectorAll('.stut-ck li')],cnt=o.querySelector('#stutN');
  const back=document.activeElement;
  const step=k=>LI.forEach((li,i)=>{li.classList.toggle('ok',i<k);li.classList.toggle('on',i===k);});
  // 라이트 메인의 미니게임 줄 설명(열린 수)을 새로 쓴다
  const sub=()=>{const s=document.querySelector('#mmMini .gx-mt small,#miBtn .hm-x span');if(s)s.textContent=miniSub();};
  let turns=0,grab=false,idle=0,pd=null,pv=0,praf=0;
  // 나침반 자리 따라가기(일반 화면): 둘레 고리(손잡이) · 밝게 남길 자리 · 안내 카드 자리
  const pos=()=>{if(!o.isConnected)return;
    // 라이트 화면의 창은 가운데에 뜬다: 위쪽 음악 띠 아래로만 내린다
    if(lite){const nb=document.querySelector('#npl.on'),nr=nb?nb.getBoundingClientRect():null;o.style.paddingTop=(nr&&nr.bottom>0?Math.round(nr.bottom)+8:16)+'px';return;}
    if(!el.isConnected){close();return;}
    const r=el.getBoundingClientRect(),W=parseFloat(getComputedStyle(el).width)||r.width,cx=r.left+r.width/2,cy=r.top+r.height/2,S=Math.max(W*1.32,W+40),H=S/2,vw=innerWidth,vh=innerHeight;
    RG.style.cssText='left:'+(cx-H).toFixed(1)+'px;top:'+(cy-H).toFixed(1)+'px;width:'+S.toFixed(1)+'px;height:'+S.toFixed(1)+'px;--or:'+(W>=70?W*.3:W*.5+8).toFixed(1)+'px;--sw:'+(3.6*120/S).toFixed(2);
    o.style.setProperty('--cx',cx.toFixed(1)+'px');o.style.setProperty('--cy',cy.toFixed(1)+'px');o.style.setProperty('--r',(H+4).toFixed(1)+'px');
    // 안내 카드: 나침반 아래 → 오른쪽 → 위 → 화면 아래 가운데 순으로, 화면 안에 다 들어가는 첫 자리.
    // 위쪽 가운데의 음악 띠와 겹치지 않게, 띠가 떠 있으면 카드 윗선을 띠 아래로 둔다(카드 높이도 그만큼 줄인다)
    const nb=document.querySelector('#npl.on'),nr=nb?nb.getBoundingClientRect():null,m=16,g=14,top=nr&&nr.bottom>0?Math.round(nr.bottom)+8:m;
    C.style.maxHeight=(vh-top-m)+'px';
    const cw=C.offsetWidth,ch=C.offsetHeight,cx0=Math.min(Math.max(m,cx-H),vw-cw-m),hitsBand=(x,y)=>nr&&y<nr.bottom+4&&x<nr.right&&x+cw>nr.left;let x,y;
    if(cy+H+g+ch<=vh-m&&!hitsBand(cx0,cy+H+g)){x=cx0;y=cy+H+g;}
    else if(cx+H+g+cw<=vw-m){x=cx+H+g;y=Math.min(Math.max(m,cy-ch/2),vh-ch-m);if(hitsBand(x,y))y=Math.max(y,top);}
    else if(cy-H-g-ch>=top){x=cx0;y=cy-H-g-ch;}else{x=Math.max(m,(vw-cw)/2);y=Math.max(top,vh-ch-m);}
    C.style.left=x.toFixed(1)+'px';C.style.top=y.toFixed(1)+'px';};
  const win=()=>{if(o.classList.contains('ok'))return;o.classList.add('ok');o.classList.remove('busy');step(3);cnt.textContent=N+' / '+N;delete MEM.sailHint;msave();sub();
    o.querySelector('.stut-hd').innerHTML='<div class="stut-k"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 4.6v9.8M5.2 7h5.6M2.6 9.6c.4 2.6 2.7 4.6 5.4 4.6s5-2 5.4-4.6" fill="none" stroke="#f1d589" stroke-width="1.5" stroke-linecap="round"/></svg><span>잠금 해제 · 수영 금메달 선물</span></div>'+
      '<h2 class="stut-h" id="stutH">「대항해」가 열렸어요</h2><p class="stut-p">백신을 싣고 폭풍 해협을 달리는 항해 레이스예요. 앞으로는 <b>새 게임 → 미니게임 탭</b>에서 언제든 할 수 있어요.</p>';
    o.querySelector('.stut-bt').innerHTML='<button type="button" class="gx-ok stut-go">지금 출항하기</button><button type="button" class="stut-no">메뉴로</button>';
    o.querySelector('.stut-go').onclick=()=>{gxSfx('click');close();try{aInit();}catch(e){}sailOpen(home);};
    o.querySelector('.stut-no').onclick=()=>{gxSfx('back');close();};
    pos();setTimeout(()=>{const b=o.querySelector('.stut-go');if(b)b.focus({preventScroll:true});},60);};
  // 나침반이 돌 때마다(compassSpin → el._onSpin): 첫 손길에 1단계 끝, 한 바퀴마다 고리 한 칸 · 높아지는 종소리, 다섯 바퀴면 축하
  // 손끝 표시는 돌리는 동안 숨었다가, 손을 떼고 1.6초 지나면 다시 돈다
  const busy=()=>{o.classList.add('busy');clearTimeout(idle);if(!pd)idle=setTimeout(()=>o.classList.remove('busy'),1600);};
  el._onSpin=sum=>{if(!o.isConnected||o.classList.contains('ok'))return;
    if(!grab){grab=true;step(1);}busy();
    const f=Math.min(N,sum/360);FL.forEach((p,i)=>{const v=Math.max(0,Math.min(1,f-i));p.style.strokeDashoffset=(1-v).toFixed(3);p.classList.toggle('full',v>=1);});
    const k=Math.floor(f);if(k>turns){turns=k;cnt.textContent=Math.min(N,k)+' / '+N;if(k<N){try{tone([523,587,659,784][k-1],'sine',.4,.07);tone([1047,1175,1319,1568][k-1],'sine',.3,.03,.05);}catch(e){}vib(16);}}
    if(f>=N&&eggOn('sail'))win();};
  // 라이트 화면의 나침반은 이 창이 직접 연다(일반 화면은 home()의 compassSpin이 연다)
  if(lite)compassSpin(el,()=>{if(eggOn('sail'))return;eggSet('sail');delete MEM.sailHint;msave();try{SFX.unlock();}catch(e){}vib([40,30,40,30,160]);});
  // 고리 손잡이: 나침반 가운데를 축으로 끈 각도만큼 돌리고, 놓으면 관성으로 조금 더 돈다(compassSpin과 같은 느낌)
  const ang=e=>{const r=el.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;};
  const coast=()=>{praf=0;if(pd||!o.isConnected||!el._spinBy)return;pv*=.965;if(Math.abs(pv)<.15){pv=0;return;}el._spinBy(pv);praf=requestAnimationFrame(coast);};
  RG.addEventListener('pointerdown',e=>{if(o.classList.contains('ok')||!el._spinBy)return;e.preventDefault();cancelAnimationFrame(praf);try{RG.setPointerCapture(e.pointerId);}catch(x){}
    pd={p:ang(e),t:performance.now()};pv=0;RG.classList.add('dn');if(!grab){grab=true;step(1);}busy();});
  RG.addEventListener('pointermove',e=>{if(!pd)return;const p=ang(e),now=performance.now();let d=p-pd.p;if(d>180)d-=360;if(d<-180)d+=360;
    pv=pv*.5+d/Math.max(1,now-pd.t)*16*.5;pd={p:p,t:now};el._spinBy(d);});
  const up=()=>{if(!pd)return;pd=null;RG.classList.remove('dn');pv=Math.max(-40,Math.min(40,pv));busy();praf=requestAnimationFrame(coast);};
  RG.addEventListener('pointerup',up);RG.addEventListener('pointercancel',up);RG.addEventListener('contextmenu',e=>e.preventDefault());
  const key=e=>{if(!o.isConnected){document.removeEventListener('keydown',key,true);return;}
    try{if(AU.ac&&AU.ac.state!=='running')AU.ac.resume();}catch(x){}
    const B=[...o.querySelectorAll('button')],a=document.activeElement;
    if(e.key==='Tab'){e.preventDefault();e.stopPropagation();if(B.length){const i=B.indexOf(a);B[i<0?(e.shiftKey?B.length-1:0):(i+(e.shiftKey?-1:1)+B.length)%B.length].focus();}return;}
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();gxSfx('back');close();return;}
    if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&!o.classList.contains('ok')&&el._spinBy){e.preventDefault();el._spinBy(e.key==='ArrowLeft'?-24:24);return;}
    if((e.key==='Enter'||e.key===' ')&&a&&o.contains(a)&&a.tagName==='BUTTON'){e.preventDefault();a.click();return;}
    if(e.key==='Enter'||e.key===' '||/^Arrow/.test(e.key))e.preventDefault();};
  const close=()=>{if(o.dataset.cl)return;o.dataset.cl=1;el._onSpin=null;clearTimeout(idle);cancelAnimationFrame(praf);pd=null;
    removeEventListener('resize',pos);document.removeEventListener('scroll',pos,true);document.removeEventListener('keydown',key,true);
    if(!eggOn('sail')){MEM.sailHint=2;msave();}
    o.classList.add('out');setTimeout(()=>o.remove(),260);sub();
    try{if(back&&back.isConnected&&back!==document.body)back.focus({preventScroll:true});}catch(e){}};
  o.querySelector('.stut-no').onclick=()=>{gxSfx('back');close();};
  addEventListener('resize',pos);document.addEventListener('scroll',pos,true);document.addEventListener('keydown',key,true);
  pos();setTimeout(pos,350);setTimeout(pos,1200);
  try{[784,1175,1568].forEach((f,i)=>tone(f,'sine',.55,.045,i*.09));}catch(e){}
  setTimeout(()=>{try{C.focus({preventScroll:true});}catch(e){}},40);}
