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
function checkSpecial(){const y=Math.round(S.turn/PY);if(y>=YRS)return false;CAR.spDone=CAR.spDone||{};
  const key=sp=>sp.id+(sp.perTerm?'_'+CAR.term:'');
  const L=(SP[CP.id]||[]).filter(sp=>!CAR.spDone[key(sp)]&&(()=>{try{return sp.cond(y);}catch(e){return false;}})());
  if(!L.length)return false;
  const goodN=(CAR.spLog||[]).filter(x=>x.indexOf(CAR.term+'기 ')===0).length-(CAR.spDone&&Object.keys(CAR.spDone).some(k=>k.indexOf('_'+CAR.term)>0)?1:0);
  const pw=L.filter(sp=>sp.k==='power'),sp=pw.length?pw[0]:(goodN<2&&Math.random()<.55?spPick(L):null);if(!sp)return false;
  CAR.spDone[key(sp)]=1;CAR.spLog=CAR.spLog||[];CAR.spLog.push(CAR.term+'기 '+(y+1)+'년 '+sp.n);
  CAR.spRun={id:sp.id,n:sp.n,k:sp.k,tro:sp.tro,ok:0,done:0,total:sp.steps.length,ctx:{}};
  sp.steps.forEach((f,i)=>queue.splice(i,0,{sg:[sp.id,i]}));
  pendingNews=Object.assign({},sp.bn);bgmGame();return true;}
// 대기열의 특별 이벤트 단계는 함수 대신 [과제 id, 단계 번호] 또는 ['+이어지는 단계 키', 번호]로 둔다(게임 저장이 되도록)
function spGen(g){const k=g[0];if(k[0]==='+')return spMake(SP_NEXT[k.slice(1)],g[1],'이어지는 단계');
  const sp=(SP[CP.id]||[]).find(s=>s.id===k);return spMake(sp.steps[g[1]],g[1]);}
function spMake(f,i,label){const R0=CAR.spRun;const e=f(R0.ctx);e.sp={i:i,n:R0.total};
  e.tag='특별 이벤트 · '+R0.n+' '+(label||((i+1)+'/'+R0.total));e.tc='#8f6a12';return e;}
// 고른 선택의 뒷일: 맥락 저장, 이어지는 단계, 국민투표, 연임 허용
function spAct(a,t){const R0=CAR.spRun;if(!R0)return;R0.done++;if(t<=1)R0.ok++;
  if(a&&a.ctx)R0.ctx[a.ctx[0]]=a.ctx[1];
  // 판정이 실패·대실패면 발의는 좌초, 강행은 무산된다(버튼에 보이는 성공 확률 그대로).
  // 국민투표는 판정과 상관없이 화면에 보인 통과 가능성으로만 갈린다(판정은 효과 크기만 바꾼다).
  if(a&&t>=2&&(a.go||a.force)){const us=CP.id==='usa';SFX.voteFail();CAR.amendFail=CAR.term;
    if(a.go){last.x+=' <em>'+(us?'개정안은 의회 문턱을 넘지 못했다':'개헌안은 국회 문턱을 넘지 못했다')+'.</em> 연임의 길은 닫혔다.';CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 발의 좌초');}
    else if(a.vote){R0.ctx.share=(30+Math.random()*19).toFixed(1);R0.ctx.states=26+Math.floor(Math.random()*11);
      last.x+=' <em>'+(us?'비준한 주 '+R0.ctx.states+'곳, 부결':'찬성 '+R0.ctx.share+'%, 부결')+'.</em> 투표가 무너진 뒤라 다시 밀어붙일 명분도 남지 않았다.';CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 투표 부결');}
    else{CAR.tro.push({id:'coupfail',n:'헌정 파괴 시도',g:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});last.x+=' <em>강행은 무산됐다.</em> 연임의 길은 닫혔고, 시도했다는 기록만 남았다.';CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 강행 무산');}
    a=Object.assign({},a,{go:0,vote:0,force:0});}
  if(a&&a.go){SFX.gavel();const g=a.go;queue.unshift({sg:['+'+g,R0.done]});R0.total++;}
  // 계엄은 판정과 상관없이 화면에 보인 성공 가능성으로만 갈린다
  if(a&&a.nx){if(a.nx==='martial')SFX.martial();const g=a.nx;queue.unshift({sg:['+'+g,R0.done]});R0.total++;}
  if(a&&a.coup){const p=R0.ctx.coupP||30,ok=Math.random()*100<p,yr=Math.floor(S.turn/PY)+1;RUN.coup=(ok?'성공':'실패')+' ('+p+'%)';CAR.spEnds=CAR.spEnds||[];
    if(!ok){SFX.coupFail();CAR.tro.push({id:'coupx',n:'내란 실패',g:0,term:CAR.term,year:yr});CAR.spEnds.push(R0.n+': 내란 실패');CAR.spRun=null;return 'coupfail';}
    SFX.coupOk();CAR.dict=CAR.term;S.p=cl(S.p+10);S.chk=cl(S.chk-22);S.trn=cl(S.trn-12);S.u=cl(S.u+10);S.a=cl(S.a-6);S.mil=cl(S.mil+4);
    CAR.tro.push({id:'selfcoup',n:'친위 쿠데타',g:0,term:CAR.term,year:yr});CAR.spEnds.push(R0.n+': 영구집권');
    last.x+=' <em>국회가 해산되고 비상통치기구가 섰다. 이제 선거는 없다.</em> 다음 임기부터는 투표 없이 권좌를 이어 간다. 견제와 신뢰는 무너졌다.';}
  if(a&&a.end==='lift')CAR.tro.push({id:'martial',n:'계엄 선포',g:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});
  if(a&&a.vote){const p=R0.ctx.passP||50,ok=Math.random()*100<p,share=ok?(50.5+Math.random()*Math.min(25,p/3)).toFixed(1):(30+Math.random()*19).toFixed(1);
    R0.ctx.share=share;R0.ctx.states=ok?38+Math.floor(Math.random()*6):26+Math.floor(Math.random()*11);
    if(ok){SFX.votePass();spAmend(CP.id==='usa'?'주 비준':'국민투표');last.x+=' <em>'+(CP.id==='usa'?'비준한 주 '+R0.ctx.states+'곳, 통과':'찬성 '+share+'%, 통과')+'.</em> 이제 임기가 끝날 때마다 다시 출마할 수 있다.';}
    else{SFX.voteFail();CAR.amendFail=CAR.term;last.x+=' <em>'+(CP.id==='usa'?'비준한 주 '+R0.ctx.states+'곳, 부결':'찬성 '+share+'%, 부결')+'.</em>';queue.unshift({sg:['+'+(CP.id==='usa'?'ratifyFail':'fail'),R0.done]});R0.total++;}}
  if(a&&a.force){SFX.gavel(1);spAmend(a.force);CAR.tro.push({id:'coup',n:'헌정 파괴 논란',g:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});last.x+=' <em>이제 임기가 끝날 때마다 다시 출마할 수 있다. 그 대가는 기록에 남는다.</em>';}
  if(a&&a.endemic){if(t<=1){SFX.endemic();CAR.endemic=CAR.term;CAR.endemicN=a.endemic;S.i=cl(Math.min(S.i,8));CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(a.endemic+' 선언');
      last.x+=' <em>'+a.endemic+' 선언.</em> 남은 임기 동안 위기가 다시 커지지 않고, 해마다 내실이 쌓인다.';}
    else last.x+=' <em>선언은 했지만 곧 환자가 다시 늘었다.</em> 선언은 없던 일이 됐다.';}
  if(a&&a.end){R0.end=a.end;CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': '+(SPEND[a.end]||a.end));if(a.end==='future'){CAR.amendFuture=(CAR.amendFuture||0)+1;}}
  if(!queue.some(q=>q.sg)){ // 마지막 단계
    if(R0.k==='good'&&R0.tro){const g=R0.ok*2>R0.done;CAR.tro.push({id:'sp_'+R0.id,n:R0.tro[g?0:1],g:g?1:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});
      last.x+=' <em>'+R0.n+' 마무리: '+(g?R0.tro[0]:R0.tro[1])+'</em>.';}
    // 올림픽: 메달 집계를 커리어 기록에 남기고, 금메달 셋 이상이면 업적을 하나 더 준다
    if(OLY_IDS.indexOf(R0.id)>=0&&R0.ctx.med){const m=R0.ctx.med;CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 금 '+m[0]+' · 은 '+m[1]+' · 동 '+m[2]);
      if(m[0]>=3)CAR.tro.push({id:'oly_gold',n:'금메달 '+m[0]+'개의 대회',g:1,term:CAR.term,year:Math.floor(S.turn/PY)+1});}
    CAR.spRun=null;if(OLY_SP.indexOf(R0.id)>=0)bgmGame();}}
const SPEND={future:'다음 대통령부터 적용',drop:'논의를 접음',withdraw:'발의 철회',accept:'부결에 승복',refuse:'계엄 건의 거절',fire:'장성 경질',lift:'계엄 해제',purge:'공신 숙청',appease:'녹봉으로 회유',step:'권한 일부 반환',balance:'대간 강화',swap:'영의정 교체',trust:'재상에게 맡김',keep:'현행 유지'};
// 한 번 고친 헌법은 계속 유지된다(amendPerm): 이후 임기마다 다시 출마할 수 있다
// 판정 주사위를 굴리지 않고 이벤트 확률로만 결과가 갈리는 선택지(국민투표 정면 승부, 계엄 국회 해산)
function spFixed(o){return !!(cur&&cur.sp&&o&&o[4]&&(o[4].vote||o[4].coup));}
// 계엄 성공 가능성: 지지율과는 상관없다. 권력·군사가 70에서 오를수록, 나라가 혼란할수록(혼란 30 기준) 높다
function coupP(){return Math.round(Math.max(10,Math.min(90,35+(vVal('P')-70)*1.5+(vVal('M')-70)*1.5+(vVal('X')-30)+5*cnPow('S'))));}
function spAmend(how){CAR.amendOK=CAR.term;CAR.amendPerm=1;CAR.amend=(CAR.amend||0)+1;CAR.amendHow=(CAR.amendHow?CAR.amendHow+' / ':'')+CAR.term+'기 '+how;}

