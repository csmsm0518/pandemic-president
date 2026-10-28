/* ---------- 양궁 개인전 ----------
   여섯 발을 쏴 합계로 메달을 가린다(같으면 10점 개수, 그래도 같으면 추첨). 화살마다 바람이 새로 분다.
   과녁을 눌러 겨눌 곳을 정하면 조준점이 그 둘레를 흔들린다. 오래 당길수록 흔들림이 커진다.
   바람 1m/s마다 화살이 과녁 반 칸쯤 밀린다. 경쟁자 셋은 강·중·약 실력이 섞여 있다. */
const AR_R=120,AR_RW=12,AR_N=6,AR_DRIFT=6;   // 과녁 반지름, 한 칸 너비, 화살 수, 바람 1m/s당 밀림(과녁 단위)
const AR_COL=s=>s>=9?'#f2c94c':s>=7?'#e0504a':s>=5?'#3d8fd6':s>=3?'#2a2a2a':'#f7f3ea';
function arRivals(){const NAT=MG_NAT();return [9.05+Math.random()*.45,8.55+Math.random()*.45,7.9+Math.random()*.6].sort(()=>Math.random()-.5).map((m,i)=>({n:NAT[i],m:m,sc:[]}));}
const arShot=m=>Math.max(5,Math.min(10,Math.round(m+mgGauss()*.9)));
const arSum=a=>a.reduce((s,x)=>s+x,0),arTens=a=>a.filter(x=>x===10).length;
function arPlace(mine,riv){const k=a=>arSum(a)*100+arTens(a);const me=k(mine);
  return 1+riv.filter(r=>k(r.sc)>me||(k(r.sc)===me&&Math.random()<.5)).length;}
function mgArch(box,done){const riv=arRivals(),mine=[];let live=true,ph='',ax=0,ay=0,rx=0,ry=0,t0=0,wind=0,last=performance.now();
  let rings='';for(let s=1;s<=10;s++)rings+='<circle r="'+(11-s)*AR_RW+'" fill="'+AR_COL(s)+'" stroke="'+(s===3||s===4?'#f7f3ea':'#1d1b18')+'" stroke-opacity=".45" stroke-width=".8"/>';
  box.innerHTML='<div class="mgx ar"><div class="ar-sb" id="arSb"></div>'+
   '<div class="ar-rng"><div class="ar-wind"><i class="ar-flag" id="arFlag"></i><span>바람</span><b id="arWind"></b></div>'+
    '<div class="ar-hr" id="arHrW"><i id="arHeart">♥</i><b id="arHr">72</b><span>bpm</span></div>'+
    '<div class="ar-tgt" id="arTgt"><svg viewBox="'+(-AR_R)+' '+(-AR_R)+' '+2*AR_R+' '+2*AR_R+'" aria-hidden="true">'+rings+'<circle r="'+AR_RW/2+'" fill="none" stroke="#1d1b18" stroke-opacity=".35" stroke-width=".6"/><path d="M-3 0H3M0 -3V3" stroke="#1d1b18" stroke-width=".8"/></svg>'+
    '<div class="ar-holes" id="arHoles"></div><i class="ar-aim" id="arAim"></i><i class="ar-ret" id="arRet"></i></div>'+
    '<div class="ar-tip">70m · 바람 2m/s마다 과녁 한 칸쯤 밀린다 · 오래 당길수록 심장이 뛰고 흔들린다</div></div>'+
   '<div class="pk-msg" id="arMsg"></div><button id="arGo" class="pri" style="width:100%;padding:15px;font-size:17px">쏜다!</button></div>';
  const $=id=>document.getElementById(id),tg=$('arTgt'),pos=(el,x,y)=>{el.style.left=((x+AR_R)/(2*AR_R)*100)+'%';el.style.top=((y+AR_R)/(2*AR_R)*100)+'%';};
  // 중계 화면 전광판: 칸 색은 맞힌 과녁 색, 이름 앞 숫자는 지금 순위
  const sbar=()=>{const all=[mine].concat(riv.map(r=>r.sc)),rk=a=>1+all.filter(b=>arSum(b)>arSum(a)).length,
    cell=s=>'<i class="s'+(s>=9?9:s>=7?7:s>=5?5:s>=3?3:s?1:0)+(s===10?' x':'')+'">'+(s||'M')+'</i>',
    row=(n,a,me)=>'<span class="n'+(me?' me':'')+'"><em>'+rk(a)+'</em>'+n+'</span><span class="a">'+Array.from({length:AR_N},(_,i)=>i<a.length?cell(a[i]):'<i'+(me&&i===a.length&&live?' class="cur"':'')+'></i>').join('')+'</span><b'+(me?' class="me"':'')+'>'+arSum(a)+'</b>';
    $('arSb').innerHTML=row('우리',mine,1)+riv.map(r=>row(r.n,r.sc)).join('');};
  const next=()=>{if(!live)return;if(mine.length>=AR_N)return finish();
    ph='aim';SFX.bow();t0=performance.now();ax=ay=0;wind=Math.round((Math.random()<.5?-1:1)*Math.random()*6*10)/10;
    $('arWind').textContent=(wind<0?'← ':'→ ')+Math.abs(wind).toFixed(1)+' m/s';
    $('arFlag').style.transform='scaleX('+(wind<0?-1:1)+') scaleY('+(.5+Math.min(1,Math.abs(wind)/6)*.5)+')';
    $('arMsg').textContent=(mine.length+1)+'번째 화살 · 과녁을 눌러 겨누고, 조준점이 가라앉을 때 쏘세요';$('arGo').disabled=false;
    tg.querySelectorAll('.new').forEach(h=>h.classList.remove('new'));};
  const aimAt=e=>{if(ph!=='aim')return;const b=tg.getBoundingClientRect(),c=v=>Math.max(-AR_R*1.2,Math.min(AR_R*1.2,v));
    ax=c(((e.clientX-b.left)/b.width*2-1)*AR_R);ay=c(((e.clientY-b.top)/b.height*2-1)*AR_R);};
  tg.addEventListener('pointerdown',e=>{e.preventDefault();aimAt(e);});tg.addEventListener('pointermove',e=>{if(e.buttons)aimAt(e);});
  const shoot=()=>{if(ph!=='aim')return;ph='fly';$('arGo').disabled=true;
    const x=rx+wind*AR_DRIFT+mgGauss()*1.6,y=ry+mgGauss()*1.6,d=Math.hypot(x,y),s=d<=AR_R?Math.max(1,10-Math.floor(d/AR_RW)):0;
    mine.push(s);riv.forEach(r=>r.sc.push(arShot(r.m)));
    // 화살은 0.24초 날아가 꽂힌다. 꽂히면 과녁이 흔들리고 점수가 떠오른다
    const h=document.createElement('i');h.className='new';pos(h,x,y);
    setTimeout(()=>{if(!box.isConnected)return;$('arHoles').appendChild(h);tg.classList.remove('thk');void tg.offsetWidth;tg.classList.add('thk');
      const pp=document.createElement('em');pp.className='ar-pop'+(s>=9?' g':'');pp.textContent=s===10&&Math.hypot(x,y)<=AR_RW/2?'X':s||'M';pos(pp,x,y);$('arHoles').appendChild(pp);setTimeout(()=>pp.remove(),1100);},240);
    $('arMsg').textContent=s===10?'텐! 한가운데다':s?s+'점':'과녁을 벗어났다';try{SFX.release();setTimeout(()=>SFX.thunk(s),240);}catch(e){}
    sbar();setTimeout(next,1300);};
  const key=e=>{if(!live||ph!=='aim')return;const m={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];
    if(m){e.preventDefault();ax+=m[0];ay+=m[1];}else if(e.key===' '||e.key==='Enter'){e.preventDefault();shoot();}};
  document.addEventListener('keydown',key);
  const finish=()=>{live=false;document.removeEventListener('keydown',key);const place=arPlace(mine,riv),t=Math.min(3,place-1);
    SFX.medal(t);$('arMsg').textContent='합계 '+arSum(mine)+'점 · '+place+'위 · '+MEDAL[t];$('arGo').disabled=false;$('arGo').textContent='결과 보기';$('arGo').onclick=()=>done(t);
    $('arRet').style.display=$('arAim').style.display='none';};
  $('arGo').onclick=shoot;
  const loop=now=>{if(!live||!box.isConnected){live=false;document.removeEventListener('keydown',key);return;}last=now;
    if(ph==='aim'){const t=(now-t0)/1000,A=3+9*Math.min(1,t/5);
      rx=ax+A*(Math.sin(1.7*t)+.5*Math.sin(4.3*t+1.3))/1.5;ry=ay+A*(Math.cos(1.3*t+.4)+.5*Math.sin(3.7*t))/1.5;
      pos($('arRet'),rx,ry);pos($('arAim'),ax,ay);}
    // 심박수: 시위를 오래 당길수록 오르고(흔들림과 같은 곡선), 쏘고 나면 천천히 내려온다
    if(now-hrT>400){hrT=now;const goal=(ph==='aim'?74+64*Math.min(1,(now-t0)/5000):72)+mine.length*2;bpm+=(goal-bpm)*.35+(Math.random()-.5)*2;
      $('arHr').textContent=Math.round(bpm);$('arHeart').style.animationDuration=(60/bpm).toFixed(2)+'s';$('arHrW').classList.toggle('hi',bpm>118);}
    requestAnimationFrame(loop);};
  let hrT=0,bpm=72;
  sbar();next();requestAnimationFrame(loop);}
// 시뮬레이션: 우리 선수 실력은 화살당 평균 8.3~9.4점
function simArch(){const riv=arRivals(),m=8.3+Math.random()*1.1,mine=[];for(let i=0;i<AR_N;i++){mine.push(arShot(m));riv.forEach(r=>r.sc.push(arShot(r.m)));}
  const place=arPlace(mine,riv),t=Math.min(3,place-1),L=[{n:'우리 선수',sc:mine,me:1}].concat(riv).sort((a,b)=>arSum(b.sc)-arSum(a.sc)||(a.me?-1:b.me?1:0));
  // 표의 순서는 판정 순위와 맞춘다(동점 처리 포함)
  L.splice(L.findIndex(r=>r.me),1);L.splice(place-1,0,{n:'우리 선수',sc:mine,me:1});
  return {lines:L.map((r,i)=>'<span class="k">'+(i+1)+'위</span>'+(r.me?'<b class="me">'+r.n+'</b>':r.n)+' · '+r.sc.join(' ')+' · <b>'+arSum(r.sc)+'점</b>'),
    head:'합계 '+arSum(mine)+'점 · '+MEDAL[t],t:t};}
