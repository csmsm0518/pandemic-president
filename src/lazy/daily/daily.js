/* ---------- 오늘의 도전 창 ----------
   메인 메뉴 '오늘의 도전'과 도전 판의 결산 화면 '오늘의 순위'가 연다(dcOpen). 오늘의 조건(무대 · 출발 인물 · 규칙)과 시작 단추,
   그리고 명예의 전당 서버가 함께 보내는 오늘 · 어제의 도전 순위와 학교 순위(daily · dailyY)를 보여 준다.
   순위 판을 시작하기 전에는 연습을 막는다(같은 판이 그대로 나오므로, 연습으로 미리 보고 순위 판을 하면 공정하지 않다). */
let DC_TAB='today',DC_DATA=null,DC_FROM=null;
function dcClose(){const o=document.querySelector('.dc-bg');if(o)o.remove();const f=DC_FROM;DC_FROM=null;if(f&&f.isConnected)try{f.focus({preventScroll:true});}catch(e){}}
// opts.score: 방금 끝낸 도전 판의 점수(순위가 아직 서버에 안 올라갔으면 예상 순위를 보여 준다)
function dcOpen(from,opts){opts=opts||{};const old=document.querySelector('.dc-bg');if(old)old.remove();DC_FROM=from||null;DC_TAB='today';
  const C=dcConf(),r=dcRec(),esc=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const st=!r?'':r.done?'오늘의 순위 판: <b>'+Number(r.score).toLocaleString('ko-KR')+'점</b>':'오늘의 순위 판을 시작했어요(끝까지 마치지 못하면 순위에 오르지 않아요).';
  const o=document.createElement('div');o.className='sndp-bg dc-bg';
  o.innerHTML='<div class="sndp dc" role="dialog" aria-modal="true" aria-labelledby="dcT"><div class="sndp-h"><span id="dcT">오늘의 도전</span><button type="button" class="sndp-x" aria-label="닫기">✕</button></div>'+
    '<p class="dc-date">'+dcLabel(C.date)+' · 한국 시간 자정에 바뀌어요</p>'+
    '<div class="dc-cond"><div class="dc-face">'+portrait(C.B.n,76)+'</div><div class="dc-ci"><span class="dc-k">오늘의 무대</span><b>'+esc(CAMPS[C.camp].n)+' · '+esc(C.B.n)+'</b>'+
      '<span class="dc-tags"><i>보통</i><i>속전속결</i><i>한 '+(C.camp==='joseon'?'치세':'임기')+' · '+CAMPS[C.camp].yrs+'년</i></span></div></div>'+
    '<ul class="dc-rules"><li>모두가 <b>같은 조건</b>에서 시작하고, 같은 선택을 하면 같은 결과가 나와요.</li><li>순위에는 <b>오늘 처음 시작한 판</b>만 올라가요. 중간에 나가도 그 판이 첫 판이에요.</li><li>순위 판을 마친 뒤에는 같은 판을 연습할 수 있어요. 도전 판은 저장할 수 없어요.</li></ul>'+
    (st?'<p class="dc-st">'+st+'</p>':'')+
    '<div class="dc-go">'+(!r?'<button type="button" class="pri" id="dcGo">도전 시작 · 오늘의 첫 판</button>':'<button type="button" id="dcPr"'+(r.done?'':' disabled')+'>연습하기'+(r.done?'':' (순위 판을 마친 뒤)')+'</button>')+'</div>'+
    '<div class="dc-tabs" role="tablist"><button type="button" role="tab" data-t="today">오늘</button><button type="button" role="tab" data-t="yest">어제</button><button type="button" role="tab" data-t="sch">학교</button></div>'+
    '<div class="dc-list" id="dcList"><p class="dc-wait">순위를 불러오는 중…</p></div></div>';
  document.body.appendChild(o);const $=s=>o.querySelector(s),x=()=>{try{SFX.back();}catch(e){}dcClose();};let dn=null;
  o.onpointerdown=e=>{dn=e.target;};o.onclick=e=>{if(e.target===o&&dn===o)x();};$('.sndp-x').onclick=x;
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();x();}});
  const go=ranked=>{try{SFX.start();}catch(e){}dcClose();cineClose();dcStart(ranked);};
  if($('#dcGo'))$('#dcGo').onclick=()=>go(true);
  if($('#dcPr'))$('#dcPr').onclick=()=>go(false);
  o.querySelectorAll('.dc-tabs button').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}DC_TAB=b.dataset.t;dcList(o,opts);});
  dcList(o,opts);
  if(IN_ART||!SHEET_URL){$('#dcList').innerHTML='<p class="dc-wait">이 화면에서는 순위를 볼 수 없어요.</p>';return;}
  fetch(SHEET_URL+'?t='+Math.floor(Date.now()/3e4)).then(r=>r.json()).then(d=>{DC_DATA=d;if(o.isConnected)dcList(o,opts);})
    .catch(()=>{const l=o.querySelector('#dcList');if(l)l.innerHTML='<p class="dc-wait">순위를 불러오지 못했어요. 잠시 뒤에 다시 열어 주세요.</p>';});
  try{$('.sndp-x').focus({preventScroll:true});}catch(e){}}
function dcList(o,opts){const L=o.querySelector('#dcList');o.querySelectorAll('.dc-tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===DC_TAB));
  if(!DC_DATA){if(DC_DATA===null&&!L.querySelector('.dc-wait'))L.innerHTML='<p class="dc-wait">순위를 불러오는 중…</p>';return;}
  const esc=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]),sc=n=>Number(n).toLocaleString('ko-KR');
  const D=DC_TAB==='yest'?DC_DATA.dailyY:DC_DATA.daily;
  if(!D){L.innerHTML='<p class="dc-wait">기록 서버가 아직 오늘의 도전을 모르는 버전이에요.</p>';return;}
  if(DC_TAB==='sch'){const S=D.schools||[];L.innerHTML=S.length?'<p class="dc-cap">오늘 학교별 평균(참가 인원)</p>'+S.map((s,i)=>'<div class="dc-row"><span class="dc-r">'+(i+1)+'</span><span class="dc-n"><b>'+esc(s.s)+'</b><small>'+s.n+'명 · 최고 '+sc(s.best)+'점</small></span><span class="dc-s">'+sc(s.avg)+'</span></div>').join(''):'<p class="dc-wait">아직 학교 기록이 없어요.</p>';return;}
  const r=DC_TAB==='today'?dcRec():dcRec(D.date),mine=r&&r.done?r.score:(DC_TAB==='today'&&opts.ranked?opts.score:null);
  let head='<p class="dc-cap">'+dcLabel(D.date)+' · '+D.n+'명이 마침'+(D.tried>D.n?' (시작 '+D.tried+'명)':'')+'</p>';
  // 내 순위: 서버 목록에 아직 없으면(방금 끝냄 · 1분 안쪽) 점수로 예상한다
  if(mine!=null){const ahead=(D.scores||[]).filter(v=>v>mine).length,inList=(D.top||[]).some(t=>t.score===mine&&t.nick===(NICK||'익명'));
    head+='<div class="dc-me">내 점수 <b>'+sc(mine)+'점</b> · '+(D.n?'<b>'+(ahead+1)+'위</b> / '+Math.max(D.n,ahead+1)+'명':'첫 기록')+(inList?'':'<small>(방금 기록은 1분 안에 순위에 올라가요)</small>')+'</div>';}
  const T=D.top||[];
  L.innerHTML=head+(T.length?T.map(t=>{const me=mine!=null&&t.score===mine&&t.nick===(NICK||'익명');
    return '<div class="dc-row'+(me?' me':'')+(t.r<=3?' t'+t.r:'')+'"><span class="dc-r">'+t.r+'</span><span class="dc-n"><b>'+esc(t.nick)+'</b><small>'+esc(t.school||'학교 없음')+' · '+esc(t.leader)+'</small></span><span class="dc-s">'+sc(t.score)+'</span></div>';}).join(''):
    '<p class="dc-wait">'+(DC_TAB==='today'?'아직 오늘 기록이 없어요. 첫 번째가 되어 보세요!':'어제 기록이 없어요.')+'</p>');}
