/* ---------- 대선 TV 토론: 연임 선거 개표 전 ----------
   상대 후보가 이번 임기의 약점을 네 번 묻는다. 질문마다 '내 기록'(지표)이 좋은지 나쁜지 보이고, 10초 안에 셋 중 하나로 답한다.
   · 기록으로 반박: 기록이 좋으면 크게 오르고, 나쁘면 팩트체크 자막에 걸려 크게 떨어진다.
   · 인정하고 약속: 기록이 나쁠 때 안전하게 조금 오른다. 좋을 때 하면 오히려 조금 깎인다.
   · 약점을 찌른다: 질문 도중 '팩트체크' 자막(상대가 틀렸다)이 떴다면 확실히 크게 오른다. 아니면 반반 도박이고, 쓸수록 역풍이 잦아진다.
   방청석 반응(잘했다 %)이 선처럼 그려지고, 끝난 뒤의 값으로 판정한다(62 이상 압승 · 52 우세 · 42 열세 · 그 아래 완패). */
const DB_Q=4,DB_T=10;
const DB_OPP=()=>(CP.id==='usa'?['로버트 케인','엘리자베스 워드','마이클 그랜트']:['강도윤','한서진','오세헌','윤태경'])[Math.floor(Math.random()*(CP.id==='usa'?3:4))];
// 주제: [이름, 좋은 기록인가, 좋을 때 질문, 나쁠 때 질문, 지표 값]
function dbTopics(amend){const s=S,L=[
    ['방역',s.i<=30,'확진자가 줄었다고 자랑하시는데, 그동안 문 닫은 가게는 누가 책임집니까?','감염이 이렇게 번지는 동안 정부는 대체 무엇을 했습니까?','감염 '+Math.round(s.i)],
    ['경제',s.e>=55,'성장률이 올랐다지만 서민들 장바구니는 그대로입니다.','일자리는 줄고 물가는 올랐습니다. 경제를 망친 책임, 인정하십니까?','경제 '+Math.round(s.e)],
    ['부패',s.c<=25,'깨끗한 정부라고요? 측근 인사 이야기는 왜 안 하십니까?','측근 비리가 줄줄이 터졌습니다. 알고도 덮으신 겁니까?','부패 '+Math.round(s.c)],
    ['권력',s.p<=50&&!amend,'대통령 혼자 다 결정한다는 말이 나옵니다. 아닙니까?',amend?'헌법까지 고쳐 다시 나오셨습니다. 이게 민주주의입니까?':'국회도 언론도 무시하고 밀어붙였습니다. 제왕적 대통령 아닙니까?','권력 '+Math.round(s.p)],
    ['분열',s.u<=35,'통합을 말씀하시는데, 반대편 목소리는 들어 보셨습니까?','나라가 둘로 쪼개졌습니다. 갈라놓은 건 대통령 아닙니까?','분열 '+Math.round(s.u)],
    ['의료',s.m>=55,'병상이 늘었다지만 지방 응급실은 여전히 문을 닫습니다.','환자들이 병원을 찾아 떠돌았습니다. 의료가 무너진 걸 아십니까?','의료 '+Math.round(s.m)]];
  // 나쁜 기록부터 둘을 꼭 묻고, 나머지는 무작위
  const bad=L.filter(x=>!x[1]).sort(()=>Math.random()-.5),good=L.filter(x=>x[1]).sort(()=>Math.random()-.5),pick=bad.slice(0,2);
  bad.slice(2).concat(good).sort(()=>Math.random()-.5).forEach(x=>{if(pick.length<DB_Q)pick.push(x);});
  return pick.sort(()=>Math.random()-.5);}
const DB_A=[['기록으로 반박한다','기록이 좋을 때 강하다 · 나쁘면 팩트체크에 걸린다'],['잘못을 인정하고 약속한다','기록이 나쁠 때 안전하다'],['상대의 약점을 찌른다','팩트체크 자막이 뜬 뒤면 확실하다 · 아니면 역풍 위험']];
const dbTier=v=>v>=62?0:v>=52?1:v>=42?2:3;
const DB_RES=['토론 압승','토론 우세','토론 열세','토론 완패'];
function debateRun(box,o,done){const $=id=>document.getElementById(id),opp=DB_OPP(),Q=dbTopics(o.amend),us=CP.id==='usa';
  let v=46+(o.pct-50)*.15,qi=-1,tm=0,ph='intro',flaw=0,flawAt=0,neg=0,hist=[v],ht=0,live=true;
  box.innerHTML='<div class="mgx db"><div class="db-st" id="dbSt"><span class="db-live">LIVE</span><span class="db-ch">'+(us?'대통령 후보 TV 토론':'대통령 후보 TV 토론 · 생중계')+'</span>'+
    '<div class="db-pd me" id="dbMe"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="20" r="11"/><path d="M8 60c0-14 10-24 22-24s22 10 22 24z"/></svg><b>기호 1 · 현직</b><span>나</span></div>'+
    '<div class="db-pd op" id="dbOp"><svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="20" r="11"/><path d="M8 60c0-14 10-24 22-24s22 10 22 24z"/></svg><b>기호 2 · 도전자</b><span>'+opp+'</span></div>'+
    '<div class="db-wm"><span>방청석 반응 · 잘했다</span><b id="dbV"></b><svg viewBox="0 0 300 50" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="25" x2="300" y2="25"/><polyline id="dbWm"/></svg></div>'+
    '<div class="db-fc" id="dbFc"></div></div>'+
   '<div class="db-q" id="dbQ"></div><div class="db-ti"><i id="dbTi"></i></div>'+
   '<div class="db-as" id="dbAs">'+DB_A.map((a,k)=>'<button type="button" data-k="'+k+'"><b>'+a[0]+'</b><small>'+a[1]+'</small></button>').join('')+'</div>'+
   '<div class="pk-msg" id="dbMsg"></div><button id="dbGo" class="pri" style="width:100%;padding:15px;font-size:16px">토론 시작</button></div>';
  const wm=()=>{const n=hist.length,pts=hist.map((h,i)=>(n<2?0:i/(n-1)*300).toFixed(1)+','+(50-h/2).toFixed(1)).join(' ');$('dbWm').setAttribute('points',pts);
    $('dbV').textContent=Math.round(v)+'%';$('dbV').className=v>=52?'g':v<42?'x':'';};
  const speak=w=>{$('dbMe').classList.toggle('on',w==='me');$('dbOp').classList.toggle('on',w==='op');};
  const lock=b=>box.querySelectorAll('.db-as button').forEach(x=>x.disabled=b);
  const ask=()=>{qi++;if(qi>=Q.length)return end();const q=Q[qi];ph='ask';tm=DB_T;flaw=Math.random()<.42?2.5+Math.random()*3:0;flawAt=0;speak('op');
    $('dbQ').innerHTML='<div class="db-qh"><span>'+(qi+1)+' / '+Q.length+' · '+q[0]+'</span><em class="'+(q[1]?'g':'x')+'">내 기록 · '+q[4]+' · '+(q[1]?'좋은 편':'나쁜 편')+'</em></div><p><b>'+opp+'</b> "'+(q[1]?q[2]:q[3])+'"</p>';
    $('dbMsg').textContent='10초 안에 답하세요';$('dbFc').className='db-fc';lock(false);try{tone(660,'sine',.12,.06);tone(880,'sine',.18,.06,.1);}catch(e){}};
  const answer=k=>{if(ph!=='ask')return;ph='react';lock(true);speak('me');const q=Q[qi],fast=DB_T-tm<4;let d,txt,fc='';
    if(k<0){d=-5;txt='말을 잇지 못했다. 몇 초의 침묵이 그대로 생중계됐다.';}
    else if(k===0){if(q[1]){d=7+(fast?1:0);txt='숫자를 하나하나 짚었다. 방청석에서 고개를 끄덕인다.';}else{d=-8;txt='화면 아래 자막이 떴다.';fc='[팩트체크] 대통령 발언 · 사실과 다름';}}
    else if(k===1){if(q[1]){d=-1;txt='굳이 사과할 일이었나. 지지층이 갸웃했다.';}else{d=4+(fast?1:0);txt='잘못을 먼저 인정하자 분위기가 누그러졌다.';}}
    else{if(flawAt){d=9;txt='상대가 든 숫자가 틀렸다는 걸 짚었다. 상대가 말을 더듬는다.';}
      else{const ok=Math.random()<Math.max(.2,.55-neg*.15);neg++;d=ok?5:-6;txt=ok?'상대의 약점을 정확히 찔렀다.':'"네거티브 그만하라"는 야유가 쏟아졌다.';}}
    v=Math.max(5,Math.min(95,v+d));if(fc){$('dbFc').textContent=fc;$('dbFc').className='db-fc on x';}
    box.querySelectorAll('.db-as button').forEach((b,j)=>b.classList.toggle('pick',j===k));
    $('dbMsg').innerHTML=txt+' <b class="'+(d>=0?'g':'x')+'">'+(d>=0?'+':'')+d+'</b>';
    try{if(d>=0)[523,659,784].slice(0,d>=7?3:2).forEach((f,i)=>tone(f,'triangle',.2,.08,i*.06));else{tone(180,'sawtooth',.3,.08);noise(.3,.08,0,900);}}catch(e){}
    setTimeout(()=>{if(!live||!box.isConnected)return;box.querySelectorAll('.db-as button').forEach(b=>b.classList.remove('pick'));ask();},2300);};
  box.querySelectorAll('.db-as button').forEach(b=>b.onclick=()=>answer(+b.dataset.k));
  const kd=e=>{if(ph==='ask'&&['1','2','3'].indexOf(e.key)>=0){e.preventDefault();answer(+e.key-1);}};document.addEventListener('keydown',kd);
  const end=()=>{ph='end';speak('');const t=dbTier(v);$('dbQ').innerHTML='<div class="db-end"><span class="db-stamp t'+t+'">'+DB_RES[t]+'</span><p>토론 직후 조사 · "현직 대통령이 잘했다" <b>'+Math.round(v)+'%</b></p></div>';
    $('dbMsg').textContent='';lock(true);$('dbAs').style.display='none';$('dbGo').style.display='';$('dbGo').textContent='개표 보러 가기';try{SFX.medal(t);}catch(e){}};
  $('dbGo').onclick=()=>{if(ph==='intro'){try{aInit();SFX.click();}catch(e){}$('dbGo').style.display='none';ask();}else if(ph==='end'){live=false;document.removeEventListener('keydown',kd);done(dbTier(v),Math.round(v));}};
  lock(true);$('dbQ').innerHTML='<p class="db-in">사회자 "지금부터 대통령 후보 TV 토론을 시작하겠습니다. 도전자 <b>'+opp+'</b> 후보가 질문합니다."</p>';
  $('dbMsg').innerHTML='질문마다 보이는 <b>내 기록</b>을 보고 답을 고르세요. 질문 도중 <b>팩트체크 자막</b>이 뜨면 상대를 찌를 기회다.';
  const iv=setInterval(()=>{if(!live||!box.isConnected){clearInterval(iv);document.removeEventListener('keydown',kd);return;}
    if(ph==='ask'){tm-=.1;$('dbTi').style.width=Math.max(0,tm/DB_T*100)+'%';$('dbTi').className=tm<3?'x':'';
      if(flaw&&!flawAt&&DB_T-tm>=flaw){flawAt=1;$('dbFc').textContent='[팩트체크] '+opp+' 후보가 든 수치 · 실제와 다름';$('dbFc').className='db-fc on';try{clk(1200,.6);}catch(e){}setTimeout(()=>{if($('dbFc')&&ph==='ask')$('dbFc').className='db-fc';},1800);}
      if(tm<=3&&Math.abs(tm-Math.round(tm))<.05)try{clk(700,.4);}catch(e){}
      v+=(Math.random()-.5)*.5;if(tm<=0)answer(-1);}
    if((ht+=.1)>=.25){ht=0;hist.push(v);if(hist.length>120)hist.shift();wm();}},100);
  wm();}
