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

