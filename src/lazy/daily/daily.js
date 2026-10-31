/* ---------- 오늘의 도전 창 ----------
   메인 메뉴 '오늘의 도전'과 도전 판의 결산 화면 '오늘의 순위'가 연다(dcOpen). 오늘의 조건(무대 · 출발 인물 · 규칙)과 시작 단추,
   그리고 명예의 전당 서버가 함께 보내는 오늘 · 어제의 도전 순위와 학교 순위(daily · dailyY)를 보여 준다.
   순위 판을 시작하기 전에는 연습을 막는다(같은 판이 그대로 나오므로, 연습으로 미리 보고 순위 판을 하면 공정하지 않다). */
let DC_TAB='today',DC_DATA=null,DC_FROM=null;
function dcClose(){const o=document.querySelector('.dc-bg');if(o)o.remove();const f=DC_FROM;DC_FROM=null;if(f&&f.isConnected)try{f.focus({preventScroll:true});}catch(e){}}
// opts.score: 방금 끝낸 도전 판의 점수(순위가 아직 서버에 안 올라갔으면 예상 순위를 보여 준다)
function dcOpen(from,opts){opts=opts||{};const old=document.querySelector('.dc-bg');if(old)old.remove();DC_FROM=from||null;DC_TAB='today';
  const C=dcConf(),r=dcRec(),esc=v=>String(v==null?'':v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const st=!r?'':r.done?'오늘의 순위 판: <b>'+Number(r.score).toLocaleString('ko-KR')+'점</b>'+(r.star!=null?' · 도전 별 <b>'+'★'.repeat(r.star)+'☆'.repeat(3-r.star)+'</b>':''):'오늘의 순위 판을 시작했어요(끝까지 마치지 못하면 순위에 오르지 않아요).';
  const o=document.createElement('div');o.className='sndp-bg dc-bg';
  o.innerHTML='<div class="sndp dc" role="dialog" aria-modal="true" aria-labelledby="dcT"><div class="sndp-h"><span id="dcT">오늘의 도전</span><button type="button" class="sndp-x" aria-label="닫기">✕</button></div>'+
    '<p class="dc-date">'+dcLabel(C.date)+' · 한국 시간 자정에 바뀌어요</p>'+
    '<div class="dc-cond"><div class="dc-face">'+portrait(C.B.n,76)+'</div><div class="dc-ci"><span class="dc-k">오늘의 무대</span><b>'+esc(CAMPS[C.camp].n)+' · '+esc(C.B.n)+'</b>'+
      '<span class="dc-tags"><i class="dc-sc">'+esc(SCN[CAMPS[C.camp].scen0].n)+'</i><i>보통</i><i>속전속결</i><i>한 '+(C.camp==='joseon'?'치세':'임기')+' · '+CAMPS[C.camp].yrs+'년</i></span></div></div>'+
    '<ul class="dc-rules"><li>모두가 <b>같은 조건</b>에서 시작하고, 같은 선택을 하면 같은 결과가 나와요.</li><li>순위에는 <b>오늘 처음 시작한 판</b>만 올라가요. 중간에 나가도 그 판이 첫 판이에요.</li><li>순위 판을 마친 뒤에는 같은 판을 연습할 수 있어요. 도전 판은 저장할 수 없어요.</li></ul>'+
    (st?'<p class="dc-st">'+st+'</p>':'')+
    '<div class="dc-go">'+(!r?'<button type="button" class="pri" id="dcGo">도전 시작 · 오늘의 첫 판</button>':'<button type="button" id="dcPr"'+(r.done?'':' disabled')+'>연습하기'+(r.done?'':' (순위 판을 마친 뒤)')+'</button>')+'</div>'+
    '<div class="dc-tabs" role="tablist"><button type="button" role="tab" data-t="today">오늘</button><button type="button" role="tab" data-t="yest">어제</button><button type="button" role="tab" data-t="sch">학교</button></div>'+
    '<div class="dc-list" id="dcList"><p class="dc-wait">순위를 불러오는 중…</p></div></div>';
  document.body.appendChild(o);const $=s=>o.querySelector(s),x=()=>{try{SFX.back();}catch(e){}dcClose();};let dn=null;
  o.onpointerdown=e=>{dn=e.target;};o.onclick=e=>{if(e.target===o&&dn===o)x();};$('.sndp-x').onclick=x;
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();x();}});
  // 시작 단추는 바로 판을 열지 않고, 그날의 상황을 읽히는 브리핑(dcBrief)을 먼저 띄운다. 순위 판 기록은 브리핑에서 '수락'해야 남는다
  const go=ranked=>{try{SFX.click();}catch(e){}dcClose();dcBrief(ranked,from);};
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

/* ---------- 도전 브리핑: '사건 파일'로 그날의 상황을 먼저 읽힌다 ----------
   평소 판은 무대 → 인물 → 준비를 고르고 바로 취임하지만, 오늘의 도전은 누군가 건네준 파일을 펼치며 시작한다.
   글은 날짜 · 무대 · 출발 인물로만 고른다(dcHash). Math.random을 쓰지 않으므로 같은 날 모두가 같은 브리핑을 읽는다.
   첫 신문(조보 · 호외)과 같은 사건을 미리 들려주어, 판이 열리면 '방금 들은 그 일'이 눈앞에 온다. */
const DCB={
 kr:{loc:[['청와대 지하 국가위기관리센터','새벽 4시 12분'],['질병관리청 긴급상황실','밤 11시 47분'],['청와대 관저 집무실','새벽 5시 30분']],st:'疫',when:'취임 3주째',
  a:['취임 3주째. 집무실 의자는 아직 낯설다.','취임 3주째. 첫 국무회의 자료도 다 읽지 못했다.','취임 3주째. 참모들의 이름을 이제 겨우 다 외웠다.'],
  b:['비상 회선이 울렸다. 해외에서 들어온 <b>첫 확진자</b>가 확인됐다는 보고다.','검역소에서 올라온 보고서 한 장. <b>첫 확진자</b>다. 같은 비행기에 탄 승객이 이백 명이 넘는다.','방역 당국이 문을 두드렸다. <b>국내 첫 확진자</b>. 지역사회 전파 가능성은 아직 아무도 모른다.'],
  c:['감염은 지수적으로 번진다. 오늘의 한 걸음이 3주 뒤의 숫자가 된다.','막으면 경제가 멈추고, 열어 두면 병상이 찬다. 정답은 없고 대가만 있다.'],
  who:B=>'오늘 이 나라의 대통령은 '+B.k+', <b>'+dcJ(B.n,'이다','다')+'</b>.',go:'취임한다'},
 joseon:{loc:[['경복궁 사정전','삼경 · 밤 11시'],['창덕궁 희정당','오경 · 새벽 4시'],['승정원','인시 · 새벽 5시']],st:'飢',when:'즉위 첫해',
  a:['즉위한 지 한 달. 용상은 아직 몸에 맞지 않는다.','즉위한 지 한 달. 대신들은 아직 새 임금의 속을 떠보는 중이다.','즉위한 지 한 달. 경연에서 읽을 책을 막 고른 참이었다.'],
  b:['삼남에서 올라온 장계가 밤새 쌓였다. 올해 농사는 <b>반타작</b>이라는 보고다.','봄부터 비 한 방울 오지 않았다. 논바닥이 거북 등처럼 갈라지고, 도성 쌀값이 <b>하루 새 두 배</b>가 됐다.','도승지가 장계를 받쳐 들고 들어왔다. 굶주린 백성들이 <b>도성으로</b> 몰려오기 시작했다.'],
  c:['굶주림은 민심을 무너뜨리고, 무너진 민심은 옥좌를 흔든다.','창고를 열면 국고가 비고, 닫아 두면 백성이 굶는다.'],
  who:B=>'옥좌에 앉은 임금은 '+B.k+', <b>'+dcJ(B.n,'이다','다')+'</b>.',go:'옥좌에 오른다'},
 usa:{loc:[['백악관 상황실','오전 5시 40분'],['백악관 오벌 오피스','밤 10시 15분'],['캠프 데이비드','오전 6시 58분']],st:'慌',when:'취임 첫 달',
  a:['취임 한 달. 아직 짐도 다 풀지 못했다.','취임 한 달. 첫 의회 연설 원고의 잉크가 아직 마르지 않았다.','취임 한 달. 백악관 복도에서 아직 길을 잃는다.'],
  b:['어젯밤 <b>대형 투자은행 두 곳</b>이 파산 신청을 했다. 개장 전 선물 시장이 이미 붉다.','재무장관의 전화. 주가가 하루에 <b>12%</b> 빠졌다. "대공황 이후 최악"이라는 말이 돈다.','은행 두 곳이 쓰러졌다. 다음 차례를 묻는 사람들이 <b>은행 창구 앞에 줄을 섰다</b>.'],
  c:['한 번 시작된 공황은 은행에서 공장으로, 공장에서 식탁으로 번진다.','돈을 풀면 월가만 살렸다고 욕먹고, 묶어 두면 메인 스트리트가 무너진다.'],
  who:B=>'오늘 집무실의 주인은 '+B.k+', <b>'+dcJ(B.n,'이다','다')+'</b>.',go:'취임한다'}};
let DCB_T=0;
function dcbClose(){clearInterval(DCB_T);DCB_T=0;const o=document.querySelector('.dcb');if(o)o.remove();document.documentElement.classList.remove('dcb-on');}
function dcBrief(ranked,from){dcbClose();const C=dcConf(),r=dcRec(C.date);if(ranked&&r&&r.ranked)ranked=false;
  const P=DCB[C.camp]||DCB.kr,K=CAMPS[C.camp],X=SCN[K.scen0],B=C.B,h=dcHash('pp-daily-brief|'+C.date),pick=(L,k)=>L[(h>>>k)%L.length];
  const day=Math.floor((Date.parse(C.date+'T00:00:00Z')-DC_DAY0)/864e5)+1,dw='일월화수목금토'[new Date(C.date+'T00:00:00Z').getUTCDay()],dp=C.date.split('-');
  const N=K.yrs*MODE[Math.max(0,dcMode())].py,loc=pick(P.loc,0),D=DC_DATA&&DC_DATA.daily,tried=D&&D.date===C.date?D.tried||D.n:0;
  const paras=[pick(P.a,3),pick(P.b,6),P.who(B),pick(P.c,9),
    '결정은 단 <b>'+N+'번</b>. 오늘 이 파일을 받은 사람은 모두 같은 아침에서 출발한다. 다른 것은 <b>당신의 선택</b>뿐이다.'+(tried?' 지금까지 <b>'+tried+'명</b>이 이 방에 먼저 들어섰다.':'')];
  const lb=K.lbl||{},ch=Object.keys(B.e||{}).filter(k=>KN0[k]).sort((a,b)=>Math.abs(B.e[b])-Math.abs(B.e[a])).slice(0,4)
    .map(k=>'<i class="'+(B.e[k]>0?'up':'dn')+'">'+(lb[k]||KN0[k])+' '+(B.e[k]>0?'+':'−')+Math.abs(B.e[k])+'</i>').join('');
  const objs=dcObjs(C.date).map((id,j)=>{const O=DC_OBJ[id];return '<li style="--d:'+(j*110)+'ms"><i aria-hidden="true">'+O.ic+'</i><span><b>'+O.t(C)+'</b><small>'+O.d(C)+'</small></span></li>';}).join('');
  const o=document.createElement('div');o.className='dcb';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-labelledby','dcbT');
  o.innerHTML='<div class="dcb-in">'+
   '<div class="dcb-top"><span class="dcb-no">오늘의 도전 · 제'+day+'호</span><span class="dcb-kd'+(ranked?' r':'')+'">'+(ranked?'순위 판':'연습 판')+'</span><button type="button" class="dcb-x" aria-label="돌아가기">✕</button></div>'+
   '<div class="dcb-head"><div class="dcb-dt">'+dp[0]+'. '+(+dp[1])+'. '+(+dp[2])+' · '+dw+'요일</div><h2 id="dcbT" class="dcb-t">'+X.n+'</h2><div class="dcb-sub">'+K.n+' · '+B.n+' · '+P.when+'</div></div>'+
   '<div class="dcb-file"><span class="dcb-tab">사건 파일</span><span class="dcb-stamp" aria-hidden="true">'+P.st+'</span>'+
    '<div class="dcb-loc"><b>'+loc[0]+'</b><span>'+loc[1]+'</span></div><div class="dcb-txt" id="dcbTxt"></div>'+
    '<button type="button" class="dcb-skip" id="dcbSkip">바로 읽기 ▸▸</button></div>'+
   '<div class="dcb-more" id="dcbMore" hidden>'+
    '<div class="dcb-who"><div class="dcb-face">'+portrait(B.n,60)+'</div><div><span class="dcb-lab">출발 인물</span><b>'+B.n+'</b><small>'+B.s+'</small>'+(ch?'<span class="dcb-ch">'+ch+'</span>':'')+'</div></div>'+
    '<div class="dcb-obj"><div class="dcb-lab">오늘의 목표 <em>모두에게 같다 · 점수와는 따로 도전 별로 남는다</em></div><ul>'+objs+'</ul></div>'+
    '<div class="dcb-rule"><i>'+DIFF[C.dif].n+'</i><i>속전속결 · 결정 '+N+'번</i><i>한 '+(C.camp==='joseon'?'치세':'임기')+' · '+K.yrs+'년</i><i>저장 불가</i></div>'+
    '<button type="button" class="dcb-go" id="dcbGo">'+(ranked?P.go+' · 순위 판 시작':'연습 시작')+'</button>'+
    '<p class="dcb-note">'+(ranked?'수락하는 순간 오늘의 첫 판으로 기록돼요. 중간에 나가도 다시 순위 판을 할 수 없어요.':'연습 판은 순위에 오르지 않아요.')+'</p></div></div>';
  document.body.appendChild(o);document.documentElement.classList.add('dcb-on');
  const $=s=>o.querySelector(s),T=$('#dcbTxt'),M=$('#dcbMore'),sk=$('#dcbSkip');
  const html=paras.map(p=>'<p>'+p+'</p>').join('');
  const reveal=()=>{clearInterval(DCB_T);DCB_T=0;T.innerHTML=html;T.classList.add('done');sk.hidden=true;if(M.hidden){M.hidden=false;try{$('#dcbGo').focus({preventScroll:true});}catch(e){}}};
  // 타자기: 태그는 한 번에, 글자는 두 자씩. 문단 사이에는 잠깐 쉰다(빈 칸). 글을 누르거나 '바로 읽기'를 누르면 다 보인다
  const tk=[];paras.forEach((p,j)=>{tk.push('<p>');(p.match(/<[^>]+>|[^<]/g)||[]).forEach(t=>tk.push(t));tk.push('</p>');if(j<paras.length-1)for(let k=0;k<12;k++)tk.push('');});
  if(reduceFx())reveal();else{let i=0;DCB_T=setInterval(()=>{let n=0;while(i<tk.length&&n<2){const t=tk[i++];if(!t||t[0]!=='<')n++;}
    T.innerHTML=tk.slice(0,i).join('')+'<span class="dcb-cur"></span>';if(i>=tk.length)reveal();},30);}
  T.onclick=reveal;sk.onclick=()=>{try{SFX.click();}catch(e){}reveal();};
  const back=()=>{try{SFX.back();}catch(e){}dcbClose();dcOpen(from&&from.isConnected?from:null);};
  $('.dcb-x').onclick=back;
  $('#dcbGo').onclick=()=>{try{SFX.start();}catch(e){}dcbClose();cineClose();dcStart(ranked);};
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();back();}else if((e.key==='Enter'||e.key===' ')&&DCB_T&&e.target===o){e.preventDefault();reveal();}});
  o.tabIndex=-1;try{o.focus({preventScroll:true});}catch(e){}}

/* ---------- 오늘의 목표 창: 게임 중 도전 띠를 누르면 ---------- */
function dcObjSheet(from){const old=document.querySelector('.dco-bg');if(old)old.remove();if(!DC)return;
  const C=dcConf(DC.date),O=dcObjRes(),ok=O.filter(x=>x.s>0).length;
  const o=document.createElement('div');o.className='sndp-bg dco-bg';
  o.innerHTML='<div class="sndp dco" role="dialog" aria-modal="true" aria-labelledby="dcoT"><div class="sndp-h"><span id="dcoT">오늘의 목표</span><button type="button" class="sndp-x" aria-label="닫기">✕</button></div>'+
   '<p class="dco-sub">'+dcLabel(C.date)+' · '+CAMPS[C.camp].n+' · '+C.B.n+' · '+(DC.ranked?'순위 판':'연습')+' — <b>'+ok+' / '+O.length+'</b> 이룸</p>'+dcObjRows(O)+
   '<div class="dco-d">'+dcObjs(C.date).map(id=>'<p><b>'+DC_OBJ[id].ic+'</b> '+DC_OBJ[id].d(C)+'</p>').join('')+'</div>'+
   '<p class="dco-n">목표는 순위 점수에 더해지지 않아요. 결산에서 도전 별로 남아요.</p></div>';
  document.body.appendChild(o);let dn=null;
  const x=()=>{try{SFX.back();}catch(e){}o.remove();if(from&&from.isConnected)try{from.focus({preventScroll:true});}catch(e){}};
  o.onpointerdown=e=>{dn=e.target;};o.onclick=e=>{if(e.target===o&&dn===o)x();};o.querySelector('.sndp-x').onclick=x;
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();x();}});
  try{o.querySelector('.sndp-x').focus({preventScroll:true});}catch(e){}}
