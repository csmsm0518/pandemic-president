/* ---------- STATE ---------- */
const MEM={best:0,runs:0,ends:{},bestC:0,best100:0,longest:0,careers:0,leaders:{}};
function mload(){try{const r=localStorage.getItem('pandemic_pres_v1');if(r)Object.assign(MEM,JSON.parse(r));}catch(e){}}
function msave(){try{localStorage.setItem('pandemic_pres_v1',JSON.stringify(MEM));}catch(e){}}
let SEENT={},SEENN=0,S,pool,cur,last,tally,chron,prev,queue,base,deaths,yd,MOD,tok,streak,bg=-1,mode=0,dif=1,snap,lastT,lastO,peakI,hist,adv,CAR,TH,SEEN,YS,yTally,cDeaths,covD;
// 판정 확률은 선택지가 지금 상황에 얼마나 맞는지(적합도 q, -1~1)로 정해진다.
//  q=+1: 대성공 32% · 성공 65% · 실패 3% · 대실패 0%   q=0: 7% · 61% · 25% · 7%   q=-1: 0% · 15% · 53% · 32%
//  대성공은 상황에 맞는 선택에서만, 대실패는 상황에 맞지 않는 선택에서만 나올 수 있다(|q|>0.28이면 반대쪽 극단은 0%).
const tierP=q=>{const p0=Math.max(0,.07+.25*q),p3=Math.max(0,.07-.25*q),p2=Math.max(.03,Math.min(.6,.25-.28*q));return [p0,1-p0-p2-p3,p2,p3];};
// 선택지의 성격: 같은 사건 안에서 효과 총량이 가장 크면 승부수, 가장 작으면 안전책.
// 적합도(q)는 성공 쪽인지 실패 쪽인지를, 성격은 결과의 폭(대성공·대실패 확률과 효과 크기)을 정한다.
//  승부수: 대성공 +12%p, 대실패 +8%p, 좋은 효과 ×1.25·나쁜 효과 ×1.1 / 안전책: 대성공·대실패가 거의 사라지고 좋은 효과 ×0.85·나쁜 효과 ×0.9
const STK=[{n:'안전책',m:.85,g:.85,b:.9},{n:'보통',m:1,g:1,b:1},{n:'승부수',m:1.18,g:1.25,b:1.1}];
const magOf=e=>Object.keys(e).filter(k=>k!=='X').reduce((s,k)=>s+Math.abs(e[k]),0);
function stakeOf(o,opts){if(o[1].X==='crush')return 2;if(o[1].X)return 1;const os=(opts||[o]).filter(x=>!x[1].X);if(os.length<2)return 1;
  const m=os.map(x=>magOf(x[1])),me=m.reduce((a,b)=>a+b,0)/m.length,mx=Math.max(...m),mn=Math.min(...m),v=magOf(o[1]);
  if(v===mx&&v>=me*1.15)return 2;if(v===mn&&v<=me*.85)return 0;return 1;}
function stakeP(q,s){let [p0,p1,p2,p3]=tierP(q||0);
  if(s===0){p0*=.35;p3*=.25;p2*=.75;}
  if(cnHas('p3mul')){const m=p3*.4;p3-=m;}
  if(s===2&&cnHas('bold3')){p3*=.5;}
  if(s===2&&cnHas('bold0')){const m=Math.min(p2,.06);p2-=m;p0+=m;}
  else if(s===2){const a=Math.min(.12,Math.max(0,p1-.2));p0+=a;p1-=a;p3+=Math.min(.08,Math.max(0,p1-.2));
    // 책략가가 곁에 있으면 승부수의 실패 칸이 줄어든다
    const T=cnPow('S');if(T){const m=Math.min(p2,.035*T);p2-=m;}}
  return [p0,1-p0-p2-p3,p2,p3];}
const pctTxt=P=>{const ok=Math.round((P[0]+P[1])*100),b=Math.round(P[0]*100),c=Math.round(P[3]*100);
  return '<b class="pp-ok">성공 '+ok+'%</b> <span class="pp-x">(대성공 '+b+'%)</span> · <span class="pp-c">'+(c?'대실패 '+c+'%':'대실패 없음')+'</span>';};
const roll=(q,s)=>{const P=stakeP(q||0,s===undefined?1:s),x=Math.random();let a=0;for(let k=0;k<4;k++){a+=P[k];if(x<a)return k;}return 1;};
const bd=v=>Math.min(4,Math.floor(v/20));
const pk=a=>a[Math.floor(Math.random()*a.length)];
const db=v=>v<7?0:v<18?1:v<38?2:v<70?3:4;
const grade=s=>s>=82?'S':s>=70?'A':s>=58?'B':s>=46?'C':s>=33?'D':'F';
const GCOL={S:'#2e7d55',A:'#2e7d55',B:'#2f5f99',C:'#6e675c',D:'#b8541e',F:'#b3261e'};
const ageNow=()=>CAR.age0+(CAR.term-1)*YRS+Math.min(YRS-1,Math.floor(S.turn/PY));
// 지금 임기의 위기 시나리오. 1기는 코로나(1~2년)와 신종 변이(3~4년), 2기부터는 엔데믹 이후 위기.
const isCov=()=>CP.id==='kr'&&(!CAR||CAR.term===1);
const firstT=()=>!CAR||CAR.term===1;
const SCX=()=>isCov()?SCN.covid:firstT()?SCN[CP.scen0]:SCN[CAR.scen[CAR.term-2]]||SCN[CP.post[0]];
const sidNow=()=>firstT()?CP.scen0:CAR.scen[CAR.term-2];
const scnName=()=>isCov()?(S&&Math.floor(S.turn/PY)>=2?'신종 변이':'코로나19'):SCX().n;
const termScn=()=>isCov()?'코로나·변이':SCX().n;
const NW=k=>(SCX().news||{})[k]||(CP.news&&CP.news[k])||(!isCov()&&POSTNEWS[k])||NEWS[k];
const RPX=k=>(SCX().rp||{})[k]||(CP.rp&&CP.rp[k])||(!isCov()&&POSTRP[k])||RP[k];
const wd=(a,b)=>isCov()?a:b;
// 왼쪽 위 상황판 숫자. 1기는 오늘 확진자와 누적 사망자, 그 뒤로는 시나리오별 숫자.
function covCases(){const y=Math.floor(S.turn/PY);if(S.turn===0)return 1;
  const ramp=y===0?Math.min(1,Math.pow((S.turn+.3)/PY,2)):1,j=1+.08*Math.sin(S.turn*12.9898+CAR.term*78.233);
  return Math.max(1,Math.round(620000*Math.pow(S.i/100,2.3)*ramp*j));}
// 상황판 숫자 하나 = [이름, 값, 소수 자릿수, 앞 글자, 뒤 글자, 중립(오르내림 색 없음)]
function hudStats(){if(isCov())return [['누적 사망자',covD,0,'','명']];return SCX().st();}
const fmtInt=(n,d,pre,suf)=>{let x=String(Math.max(0,Math.round(n)));if(d){while(x.length<=d)x='0'+x;x=x.slice(0,-d).replace(/\B(?=(\d{3})+(?!\d))/g,',')+'.'+x.slice(-d);}else x=x.replace(/\B(?=(\d{3})+(?!\d))/g,',');return (pre||'')+x+(suf||'');};
const scaled=q=>Math.max(0,Math.round(q[1]*Math.pow(10,q[2])));
const fmtStat=q=>fmtInt(scaled(q),q[2],q[3],q[4]);
// 숫자 로터리: 자릿수마다 0~9 띠가 돌아가며 이전 값에서 새 값으로 바뀐다. 오르면 위로, 내리면 아래로 돈다.
const ODO={},ODS=Array.from({length:70},(_,i)=>'<i>'+(i%10)+'</i>').join('');
function odoHTML(key,q){const t=scaled(q),f=ODO[key]===undefined?t:ODO[key];
  return '<b class="odo" data-k="'+key+'" data-f="'+f+'" data-t="'+t+'" data-d="'+q[2]+'" data-p="'+q[3]+'" data-s="'+q[4]+'" data-n="'+(q[5]?1:0)+'">'+fmtInt(f,q[2],q[3],q[4])+'</b>';}
function odoRun(){document.querySelectorAll('.odo').forEach(el=>{const f=+el.dataset.f,t=+el.dataset.t,d=+el.dataset.d;ODO[el.dataset.k]=t;if(f===t)return;
  const txt=fmtInt(t,d,el.dataset.p,el.dataset.s),nd=txt.replace(/\D/g,'').length,fd0=String(f).length;let j=nd,h='';
  for(const ch of txt){if(ch<'0'||ch>'9'){h+='<span class="odx">'+ch+'</span>';continue;}
    j--;const pw=Math.pow(10,j),a=Math.floor(f/pw),b=Math.floor(t/pw),fa=a%10,tb=b%10;let st=b-a;
    if(Math.abs(st)>30)st=st>0?20+((tb-fa+10)%10):-(20+((fa-tb+10)%10));
    const s0=30+fa;h+='<span class="odc'+(j>=fd0?' lz':'')+'"><span class="ods" data-e="'+(s0+st)+'" style="transform:translateY(-'+(s0*1.2).toFixed(1)+'em)">'+ODS+'</span></span>';}
  el.innerHTML=h;if(el.dataset.n!=='1')el.classList.add(t>f?'up':'down');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.querySelectorAll('.ods').forEach(x=>{x.style.transform='translateY(-'+(+x.dataset.e*1.2).toFixed(1)+'em)';});el.querySelectorAll('.lz').forEach(x=>x.classList.remove('lz'));}));
  setTimeout(()=>{el.classList.remove('up','down');},1700);});}
const lab=(t)=>{const i=t.indexOf(' · ');return '<div class="lbl">'+(i>0?t.slice(0,i)+'<span class="lbl-n">'+t.slice(i+3)+'</span>':t)+'</div>';};
const CHEV='<svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>';
const card=(h,ex)=>'<div class="cd" style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;'+(ex||'')+'">'+h+'</div>';

function words(txt,base,step){step=step||22;let inEm=false,out='',k=0;txt.split(' ').forEach(w=>{let s=w,oe=false,ce=false;if(s.indexOf('<em>')>=0){s=s.replace('<em>','');oe=true;}if(s.indexOf('</em>')>=0){s=s.replace('</em>','');ce=true;}if(oe)inEm=true;
  out+='<span style="display:inline-block;opacity:0;animation:wIn .22s ease-out forwards;animation-delay:'+(base+k*step)+'ms;'+(inEm?'color:var(--text-danger);font-weight:600;':'')+'">'+s+'&nbsp;</span>';if(ce)inEm=false;k++;});return out;}

function headlines(){const h=[];
  if(S.i>=60)h.push(pk(NW('ih')));else if(S.i<=12)h.push(pk(NW('il')));
  if(S.e<=38)h.push(pk(NW('el')));else if(S.e>=72)h.push(pk(NW('eh')));
  if(S.u>=58)h.push(pk(NW('uh')));else if(S.u<=18)h.push(pk(NW('ul')));
  if(S.c>=50)h.push(pk(NW('ch')));else if(S.c<=8)h.push(pk(NW('cl')));
  if(S.a<=32)h.push(pk(NW('al')));else if(S.a>=68)h.push(pk(NW('ah')));
  while(h.length<3)h.push(pk(NW('g')));
  // 이스터에그: 아주 드물게 가짜 뉴스가 맨 앞에 끼어든다
  if(Math.random()<.02){h.unshift(pk(FAKE[CP.id]||FAKE.kr));MEM.egg=MEM.egg||{};if(!MEM.egg.fake){MEM.egg.fake=1;msave();}}
  return h.slice(0,4).join('  ·  ');}

