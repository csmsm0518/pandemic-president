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
// 데우스 엑스 마키나: 닉네임을 '조성민잘생겼다'로 넣으면 대한민국 · 조선 · 미국 지도자 명단 맨 끝에 조성민이 선다(지도자 고르기에서 처음부터 골라져 있다).
// 좋은 지표(지지율 · 경제 · 방역 · 군사 · 권력 · 견제 · 투명성 · 안전망)는 100, 나쁜 지표(위기 · 갈등 · 부패)는 0에서 시작한다.
// 이 판은 기록 시트 · 명예의 전당 · 이 기기의 기록(최고 점수 · 결말 · 닮은 지도자 · 비밀 인물 해금)에 남지 않는다. 도감에도 나오지 않는다
const GOD_NICK='조성민잘생겼다';
const GOD={id:'csm',n:'조성민',k:'데우스 엑스 마키나',god:1,al:'강림',age:18,t:5,x:'조성민의 길',
  s:'막이 내리기 직전, 기계 장치를 타고 무대 위로 내려온 신. 풀리지 않던 모든 문제가 그가 서는 순간 풀린다.',
  d:'지지율 · 경제 · 방역 · 군사 100, 혼란 0에서 시작한다(권력과 견제도 모두 100이라 권력 칸은 60). 운명 개입 +5. 이 판은 어떤 기록에도 남지 않는다.',
  f:s=>{Object.assign(s,{a:100,e:100,m:100,saf:100,mil:100,p:100,chk:100,trn:100,i:0,u:0,c:0});}};
const godNick=()=>String(NICK||'').replace(/\s/g,'')===GOD_NICK;
const godRun=()=>!!(CAR&&CAR.bgid===GOD.id);
// 닉네임이 바뀔 때(시작 화면 · 불러오기) 명단에 넣거나 뺀다. 맨 끝에 두어 다른 지도자의 번호(저장 파일의 bg)는 그대로다
function godSync(){['kr','joseon','usa'].forEach(c=>{const B=CAMPS[c]&&CAMPS[c].bg;if(!B)return;const i=B.indexOf(GOD);
  if(godNick()){if(i<0)B.push(GOD);}else if(i>=0)B.splice(i,1);});}
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
// 잠금 해제 튜토리얼(sailTut)이 진행을 보려고 el._onSpin(돌린 각도 합, 잡고 있나)을 걸고, 키보드로 돌릴 때 el._spinBy(각도)를 쓴다
const SAIL_TURNS=5;
function compassSpin(el,done){if(!el)return;let a=0,v=0,sum=0,tick=0,drag=null,raf=0,fired=false;
  el.style.touchAction='none';el.style.cursor='grab';el.style.transformOrigin='50% 50%';
  const ang=e=>{const r=el.getBoundingClientRect();return Math.atan2(e.clientY-(r.top+r.height/2),e.clientX-(r.left+r.width/2))*180/Math.PI;};
  const ping=()=>{if(el._onSpin)el._onSpin(sum,!!drag);};
  const turn=d=>{a+=d;sum+=Math.abs(d);el.style.transform='rotate('+a.toFixed(1)+'deg)';
    if((tick+=Math.abs(d))>=30){tick=0;gxSfx('tick',Math.floor(sum/30)%5);}
    if(!fired&&sum>=SAIL_TURNS*360){fired=true;done();}ping();};
  el._spinBy=turn;
  const spin=()=>{if(!el.isConnected||drag)return;v*=.965;if(Math.abs(v)<.15){v=0;return;}turn(v);raf=requestAnimationFrame(spin);};
  el.addEventListener('pointerdown',e=>{e.preventDefault();cancelAnimationFrame(raf);try{el.setPointerCapture(e.pointerId);}catch(x){}drag={p:ang(e),t:performance.now()};el.style.cursor='grabbing';ping();});
  el.addEventListener('pointermove',e=>{if(!drag)return;const p=ang(e),now=performance.now();let d=p-drag.p;if(d>180)d-=360;if(d<-180)d+=360;
    v=v*.5+d/Math.max(1,now-drag.t)*16*.5;drag={p:p,t:now};turn(d);});
  const up=()=>{if(!drag)return;drag=null;el.style.cursor='grab';v=Math.max(-40,Math.min(40,v));ping();raf=requestAnimationFrame(spin);};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);}
// 올림픽 수영 결승을 직접 헤엄쳐 금메달을 따면, 다음에 메인 메뉴가 뜰 때 대항해를 여는 법을 차근차근 보여 준다(sailTut).
// MEM.sailHint: 1 = 다음 메인 메뉴에서 튜토리얼을 연다, 2 = 한 번 보고 닫았다(미니게임 판의 잠긴 칸에 힌트가 남는다). 대항해를 열면 지운다
function sailGift(){if(eggOn('sail'))return;MEM.sailHint=1;msave();}
// 이스터에그: 메인 화면 뒤의 큰 나침반(문장)을 손가락·마우스로 돌린다. 원 밖 어딘가에 별 하나가 떠 있다.
// 북쪽 바늘의 하얀 끝이 그 별을 3초 동안 가리키고 있으면(±8°) done()을 부른다(미니게임 「별똥별을 피해라」가 열린다).
// 별 자리는 화면마다 다시 잡는다: 원 바로 바깥(반지름 1.1배)에서, 화면 안이면서 메뉴 · 제목에 가리지 않는 곳.
const SEAL_HOLD=3,SEAL_TOL=8;
function sealSpin(seal,done){const sv=seal&&seal.querySelector('svg'),star=seal&&seal.querySelector('.gx-sstar');if(!sv||!star)return;
  let a=0,v=0,drag=null,raf=0,hold=0,lastT=0,fired=false,auto=true,tick=0;
  const C=()=>{const r=sv.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,R:r.width*.45,w:r.width};};
  // 자동으로 천천히 도는 중이면 지금 각도를 읽어 와 이어서 돌린다
  const cur=()=>{const m=getComputedStyle(sv).transform;if(!m||m==='none')return 0;const p=m.match(/matrix\(([^)]+)\)/);if(!p)return 0;const q=p[1].split(',').map(parseFloat);return Math.atan2(q[1],q[0])*180/Math.PI;};
  const grab=()=>{if(!auto)return;auto=false;a=cur();sv.style.animation='none';sv.style.transform='rotate('+a.toFixed(2)+'deg)';};
  // 별 자리 고르기: 원 바로 바깥(반지름 1.1배부터)을 왼쪽 위에서부터 10°씩 돌며, 화면 안이고 글자 · 메뉴 · 단추에 가리지 않는 첫 자리.
  // 가리는 것은 실제로 그려진 자리만 본다(제목 상자는 화면 폭만큼 넓어서, 상자 대신 글자 자리를 쓴다)
  const place=()=>{if(!seal.isConnected)return;const c=C();if(!c.w)return;const host=seal.getBoundingClientRect(),W=innerWidth,H=innerHeight,occ=[];
    const put=r=>{if(r&&r.width>0&&r.height>0)occ.push(r);};
    document.querySelectorAll('.cine .gx-logo svg,.cine .gx-menu,.cine .gx-pc,.cine .gx-msg,.cine .gx-lp.on,.cine .gx-foot,.cine .cine-x,.cine .cine-back,#npl.on').forEach(e=>put(e.getBoundingClientRect()));
    document.querySelectorAll('.cine .gx-logo .emb-t span,.cine .gx-logo .emb-s').forEach(e=>{try{const rg=document.createRange();rg.selectNodeContents(e);for(const r of rg.getClientRects())put(r);}catch(x){}});
    const ok=(x,y)=>x>=26&&y>=52&&x<=W-26&&y<=H-26&&!occ.some(r=>x>r.left-20&&x<r.right+20&&y>r.top-20&&y<r.bottom+20);
    const A=[];for(let i=0;i<36;i++)A.push(-120+(i%2?1:-1)*Math.ceil(i/2)*10);
    let pick=null;
    for(const f of [1.1,1.17,1.06,1.25,1.34])for(const d of A){const r=d*Math.PI/180,x=c.x+Math.cos(r)*c.R*f,y=c.y+Math.sin(r)*c.R*f;if(ok(x,y)){pick={x:x,y:y};break;}}
    if(!pick){star.hidden=true;return;}star.hidden=false;
    star.style.left=(pick.x-host.left)+'px';star.style.top=(pick.y-host.top)+'px';};
  const aligned=()=>{if(star.hidden)return false;const c=C(),r=star.getBoundingClientRect(),sd=Math.atan2(r.top+r.height/2-c.y,r.left+r.width/2-c.x)*180/Math.PI;
    let d=((a-90-sd)%360+540)%360-180;return Math.abs(d)<=SEAL_TOL;};
  const set=d=>{a+=d;sv.style.transform='rotate('+a.toFixed(2)+'deg)';};
  // 가리키는 동안 별이 밝아지고 둘레의 고리가 찬다. 3초를 다 채우면 연다
  const watch=now=>{raf=0;if(!seal.isConnected||fired)return;const dt=Math.min(.1,(now-(lastT||now))/1000);lastT=now;
    if(!drag&&Math.abs(v)>.05){v*=.95;set(v);}else if(!drag)v=0;
    if(aligned()){hold+=dt;if((tick+=dt)>=.5){tick=0;gxSfx('tick',Math.min(7,Math.floor(hold*2)));}}else{hold=Math.max(0,hold-dt*2);tick=0;}
    star.style.setProperty('--p',Math.min(1,hold/SEAL_HOLD).toFixed(3));star.classList.toggle('lock',hold>0);
    if(hold>=SEAL_HOLD){fired=true;star.classList.add('go');vib([30,40,30,40,120]);done();return;}
    if(drag||Math.abs(v)>.05||hold>0)raf=requestAnimationFrame(watch);};
  const kick=()=>{if(!raf){lastT=0;raf=requestAnimationFrame(watch);}};
  const ang=e=>{const c=C();return Math.atan2(e.clientY-c.y,e.clientX-c.x)*180/Math.PI;};
  sv.addEventListener('pointerdown',e=>{const c=C();if(Math.hypot(e.clientX-c.x,e.clientY-c.y)>c.R*1.08)return;e.preventDefault();grab();try{sv.setPointerCapture(e.pointerId);}catch(x){}
    drag={p:ang(e),t:performance.now()};sv.style.cursor='grabbing';kick();});
  sv.addEventListener('pointermove',e=>{if(!drag)return;const p=ang(e),now=performance.now();let d=p-drag.p;if(d>180)d-=360;if(d<-180)d+=360;
    v=v*.5+d/Math.max(1,now-drag.t)*16*.5;drag={p:p,t:now};set(d);});
  const up=()=>{if(!drag)return;drag=null;sv.style.cursor='';v=Math.max(-30,Math.min(30,v));kick();};
  sv.addEventListener('pointerup',up);sv.addEventListener('pointercancel',up);sv.addEventListener('contextmenu',e=>e.preventDefault());
  // 키보드로도(접근성): 나침반에 초점을 두고 ← → 로 돌린다
  sv.setAttribute('tabindex','-1');
  const onR=()=>{if(!seal.isConnected){removeEventListener('resize',onR);return;}clearTimeout(seal._pt);seal._pt=setTimeout(place,160);};
  addEventListener('resize',onR);
  // 글꼴 · 메뉴가 자리 잡은 뒤에 별을 놓는다(메뉴 등장 연출이 끝난 뒤)
  setTimeout(place,60);setTimeout(place,2600);}
