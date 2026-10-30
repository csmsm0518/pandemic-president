/* ---------- 전체 화면 연출(시네마) ----------
   화면을 꽉 채운 어두운 무대에 장면을 한 장씩 띄우고, PPT처럼 ‹ › 버튼·방향키·밀기로 넘긴다.
   scenes: [{t:장면 이름, h:html}] · 장면이 처음 보일 때 .go가 붙어 그 장면의 연출이 재생된다.
   o.done: 큰 버튼 글자(마지막 장면, pick이면 모든 장면) · o.onDone(k): 큰 버튼을 눌렀을 때
   o.pick: 장면마다 큰 버튼이 고르기 버튼이 된다(리더 고르기) · o.cancel: 닫기(×) 버튼과 Esc
   o.start: 처음 보여 줄 장면 · o.onShow(k, el): 장면이 보일 때마다
   o.back: 왼쪽 위 "‹ 이전" 버튼을 눌렀을 때 · o.title: 위쪽 가운데 단계 표시 · o.top: 오른쪽 위에 넣을 버튼 html
   o.nav===false: 아래 버튼 줄을 없앤다(장면 안의 버튼으로만 움직이는 메뉴) · o.lock(k): 고를 수 없는 장면이면 버튼에 쓸 글자
   o.cls: 무대에 붙일 클래스('gm'이면 장면이 화면 전체를 쓴다) · o.key(e): 키 입력을 먼저 받는다. true를 돌려주면 기본 동작을 막는다 */
let CINE=null;
function cineClose(){if(!CINE)return;const c=CINE;CINE=null;document.body.style.overflow='';c.el.classList.add('out');setTimeout(()=>c.el.remove(),450);}
// 새 장면을 열 때 사라지는 중(cineClose)인 예전 장면도 바로 걷어 낸다. 남아 있으면 같은 id · 같은 칸이 둘이 되어
// 새 화면이 예전 화면의 버튼을 잡거나(getElementById), 칸 번호가 넘쳐 없는 무대 · 미니게임을 고르다 멈췄다
function cine(scenes,o){o=o||{};if(CINE){CINE.el.remove();CINE=null;}document.querySelectorAll('.cine.out').forEach(x=>x.remove());
  const n=scenes.length,many=n>8,el=document.createElement('div');
  el.className='cine'+(o.nav===false?' nonav':'')+(o.cls?' '+o.cls:'');el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  el.innerHTML='<div class="cine-tr">'+scenes.map(s=>'<section class="cs" aria-label="'+s.t+'"><div class="dk-rays"></div><div class="cs-in">'+s.h+'</div></section>').join('')+'</div>'+
    (o.back?'<button class="cine-back">‹ 이전</button>':'')+(o.title?'<div class="cine-title">'+o.title+'</div>':'')+(o.top||'')+
    '<nav class="cine-nav"'+(o.nav===false?' hidden':'')+'>'+(n>1?'<button class="cine-b" data-d="-1" aria-label="이전 장면">‹</button>'+(many?'<span class="cine-cnt"></span>':'<div class="cine-dots">'+scenes.map(s=>'<i title="'+s.t+'"></i>').join('')+'</div>')+'<button class="cine-b" data-d="1" aria-label="다음 장면">›</button>':'')+
    '<button class="cine-go pri"></button></nav>'+(o.cancel?'<button class="cine-x" aria-label="닫기">✕</button>':'');
  document.body.appendChild(el);document.body.style.overflow='hidden';
  // 장면은 #app 밖에 붙으므로 무대별 낱말 바꾸기(대통령→왕 등)를 직접 한 번 적용한다
  if(CP&&CP.dict)skinNode(el);
  const C=CINE={el:el,k:-1,n:n,o:o},SC=el.querySelectorAll('.cs'),gb=el.querySelector('.cine-go');
  const show=k=>{k=Math.max(0,Math.min(k,n-1));if(k===C.k)return;C.k=k;
    el.querySelector('.cine-tr').style.transform='translateX(-'+k*100+'%)';
    SC.forEach((s,j)=>{if(j===k){s.removeAttribute('inert');s.classList.add('go');s.scrollTop=0;}else s.setAttribute('inert','');});
    el.querySelectorAll('.cine-dots i').forEach((d,j)=>d.classList.toggle('on',j===k));
    const cnt=el.querySelector('.cine-cnt');if(cnt)cnt.textContent=(k+1)+' / '+n;
    const bs=el.querySelectorAll('.cine-b');if(bs.length){bs[0].disabled=k===0;bs[1].disabled=k===n-1;}
    const lk=o.lock&&o.lock(k);gb.disabled=!!lk;
    gb.textContent=lk||(o.pick||k===n-1?(o.done||'계속'):'다음 장면');
    if(o.onShow)o.onShow(k,SC[k]);};
  C.go=d=>{try{SFX.click();}catch(e){}show(C.k+d);};
  C.ok=()=>{if(gb.disabled)return;try{SFX.click();}catch(e){}if(!o.pick&&C.k<n-1)return show(C.k+1);const k=C.k;cineClose();if(o.onDone)o.onDone(k);};
  el.querySelectorAll('.cine-b').forEach(b=>b.onclick=()=>C.go(+b.dataset.d));
  gb.onclick=C.ok;
  const bk=el.querySelector('.cine-back');if(bk)bk.onclick=()=>{try{SFX.back();}catch(e){}o.back();};
  const x=el.querySelector('.cine-x:not(.cine-snd)');if(x)x.onclick=()=>{try{SFX.click();}catch(e){}cineClose();if(o.onCancel)o.onCancel();};
  let x0=null,y0=0;
  el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
  el.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)C.go(dx<0?1:-1);},{passive:true});
  show(o.start||0);setTimeout(()=>{try{gb.focus({preventScroll:true});}catch(e){}},50);
  return C;}
// 방향키로 장면 넘기기, Enter로 큰 버튼, Esc로 닫기(닫기 버튼이 있을 때만)
document.addEventListener('keydown',e=>{if(!CINE||e.repeat)return;
  if(CINE.o.key&&CINE.o.key(e)===true){e.preventDefault();return;}
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();CINE.go(e.key==='ArrowRight'?1:-1);}
  else if(e.key==='Escape'&&CINE.o.back){e.preventDefault();CINE.o.back();}
  else if(e.key==='Escape'&&CINE.o.cancel){e.preventDefault();const o=CINE.o;cineClose();if(o.onCancel)o.onCancel();}});
const cw=(txt,base,step)=>txt.split(' ').map((x,i)=>'<span class="w" style="animation-delay:'+(base+i*step)+'ms">'+x+' </span>').join('');

// 임기(치세) 평가: 화면 가득 큰 인장을 찍고, 버튼을 누르면 자세한 화면이 보인다
function termCine(te){const jo=CP.id==='joseon';
  cine([{t:'임기 평가',h:'<div class="cs-c"><div class="cs-k a1">'+(jo?CAR.term+'번째 치세':CAR.term+'기')+' · '+te.scenario+'</div>'+
    '<div class="seal big" style="--sc:'+GCOL[te.g]+'"><b>'+te.g+'</b><span>'+(jo?'치세 평가':'임기 평가')+'</span></div>'+
    '<div class="cs-h a3" style="font-size:clamp(28px,4.6vw,50px)">'+te.ti+'</div><div class="cs-line"></div>'+
    '<p class="cs-p">'+cw(te.ds.replace(/<[^>]+>/g,''),1500,40)+'</p></div>'}],{done:'자세히 보기'});}
