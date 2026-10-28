/* ---------- 이스터에그 · 비밀 인물 ---------- */
let TAPS=[],SEC_NEW=[];
const eggOn=k=>!!(MEM.egg&&MEM.egg[k]);
function eggSet(k){MEM.egg=MEM.egg||{};if(!MEM.egg[k]){MEM.egg[k]=1;msave();}}
const campOn=id=>id!=='zombie'||eggOn('zombie');
// 잠긴 비밀 인물이면 {h:힌트, used:이미 씀}을, 고를 수 있으면 null을 돌려준다
function bgLock(q){if(!q.sec)return null;
  if(q.once&&MEM.secUsed&&MEM.secUsed[q.sec])return {used:1,h:'이미 한 번 함께했다. 단 한 번뿐인 만남이었다.'};
  if(q.sec==='jyw')return /hafs/i.test(String((PF&&PF.school)||''))?null:{h:q.hint};
  return MEM.sec&&MEM.sec[q.sec]?null:{h:q.hint};}
// 커리어가 끝날 때 비밀 인물 해금 조건을 확인한다
function secCheck(kind){const H=MEM.sec=MEM.sec||{},nw=[],un=id=>{if(!H[id]){H[id]=1;nw.push(id);}};
  if(CAR.camp==='joseon'&&kind==='deposed')un('hong');
  if(CAR.camp==='usa'&&CAR.terms.some(t=>t.elect==='당선'))un('unclesam');
  if(CAR.camp==='zombie'&&CAR.terms.some(t=>t.kind==='done'))un('zinf');
  if(Object.keys(HNAME).some(k=>MEM.ends[k]))un('dangun');
  if(nw.length){msave();SEC_NEW=SEC_NEW.concat(nw);}}
function eggToast(h){const o=document.getElementById('eggT');if(o)o.remove();
  const d=document.createElement('div');d.id='eggT';d.className='egg-toast';d.setAttribute('role','status');d.innerHTML=h;document.body.appendChild(d);
  setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),400);},3800);}

// 이스터에그: 메인 화면 로고의 나침반(금빛 방위표)을 손가락·마우스로 돌린다. 놓으면 관성으로 조금 더 돈다.
// 한 화면에서 모두 다섯 바퀴(1800°)를 돌리면 done()을 부른다(비밀 모드 「대항해」가 열린다).
const SAIL_TURNS=5;
function compassSpin(el,done){if(!el)return;let a=0,v=0,sum=0,tick=0,drag=null,raf=0,fired=false;
  el.style.touchAction='none';el.style.cursor='grab';el.style.transformOrigin='50% 50%';
  const ang=e=>{const r=el.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;};
  const turn=d=>{a+=d;sum+=Math.abs(d);el.style.transform='rotate('+a.toFixed(1)+'deg)';
    if((tick+=Math.abs(d))>=30){tick=0;gxSfx('tick',Math.floor(sum/30)%5);}
    if(!fired&&sum>=SAIL_TURNS*360){fired=true;done();}};
  const spin=()=>{if(!el.isConnected||drag)return;v*=.965;if(Math.abs(v)<.15){v=0;return;}turn(v);raf=requestAnimationFrame(spin);};
  el.addEventListener('pointerdown',e=>{e.preventDefault();cancelAnimationFrame(raf);try{el.setPointerCapture(e.pointerId);}catch(x){}drag={p:ang(e),t:performance.now()};el.style.cursor='grabbing';});
  el.addEventListener('pointermove',e=>{if(!drag)return;const p=ang(e),now=performance.now();let d=p-drag.p;if(d>180)d-=360;if(d<-180)d+=360;
    v=v*.5+d/Math.max(1,now-drag.t)*16*.5;drag={p:p,t:now};turn(d);});
  const up=()=>{if(!drag)return;drag=null;el.style.cursor='grab';v=Math.max(-40,Math.min(40,v));raf=requestAnimationFrame(spin);};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
