/* ---------- 건의사항함 · 쿠폰함 창 ----------
   메인 화면의 반쪽 칸 둘(js/24b-lobby-boxes.js)이 연다. 창 모양은 소리 · 불러오기 창(.sndp)과 같아서 영화식 메뉴와 라이트 화면 어디서나 어울린다.
   건의사항: 분류와 내용을 적어 보내면 기록 시트의 '건의사항' 탭에 한 줄씩 쌓인다(kind:'suggest'). 명예의 전당 · 분석에는 나가지 않는다.
     게임 기록과 같은 '보낼 기록 상자'(obPush · obFlush)로 보내므로, 인터넷이 끊겨 있으면 이 기기에 두었다가 다음 접속 때 보낸다.
   쿠폰: 넣은 번호의 지문을 쿠폰 표(CPN, 1-coupons.js)와 맞춰 보고, 맞으면 보상을 주고 이 기기(MEM.cpn)에 받았다고 적는다(쿠폰마다 한 번).
     MEM에 있으므로 '이 기기 기록 초기화'를 하면 보상과 받은 기록이 함께 지워지고, 같은 쿠폰을 다시 넣어 되찾을 수 있다. */
let BX_FROM=null,BX_DIRTY=false;
// 창을 닫으면 누른 칸으로 초점을 돌려준다. 쿠폰으로 뭔가 열렸으면 메인 화면의 글(미니게임 수 · 받아 둔 운명 개입 등)을 새로 그린다
function bxClose(){const o=document.querySelector('.bx-bg');if(o)o.remove();const f=BX_FROM;BX_FROM=null;
  if(BX_DIRTY){BX_DIRTY=false;if(R.querySelector('.hl')&&!CINE){const y=window.scrollY;home();window.scrollTo(0,y);const b=f&&f.id&&document.getElementById(f.id);if(b)try{b.focus({preventScroll:true});}catch(e){}return;}
    const s=document.querySelector('#mmCpn small');if(s)s.textContent=boxCpnSub();}
  if(f&&f.isConnected)try{f.focus({preventScroll:true});}catch(e){}}
// 창 틀: 제목 + 닫기. 창 안의 키는 뒤의 메인 메뉴로 가지 않게 막는다(Esc는 닫기).
// 바깥을 눌러 닫는 것은 누르기 시작한 곳도 바깥일 때만(글을 고르다 손가락이 바깥에서 떨어져도 닫히지 않게)
function bxPanel(cls,t,from){const old=document.querySelector('.bx-bg');if(old)old.remove();BX_FROM=from||null;
  const o=document.createElement('div');o.className='sndp-bg bx-bg';
  o.innerHTML='<div class="sndp bx '+cls+'" role="dialog" aria-modal="true" aria-labelledby="bxT"><div class="sndp-h"><span id="bxT">'+t+'</span><button type="button" class="sndp-x" aria-label="닫기">✕</button></div><div class="bx-in"></div></div>';
  document.body.appendChild(o);const x=()=>{try{SFX.back();}catch(e){}bxClose();};let dn=null;
  o.onpointerdown=e=>{dn=e.target;};o.onclick=e=>{if(e.target===o&&dn===o)x();};o.querySelector('.sndp-x').onclick=x;
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();x();}});
  return o.querySelector('.bx-in');}

/* ----- 건의사항함 ----- */
// [시트에 적는 이름, 단추 글, 내용 칸의 예시]
const SUG_CAT=[['건의','건의 · 제안','예: 조선 무대에도 올림픽이 있으면 좋겠어요.'],
  ['버그','버그 · 오류','예: 가로 화면에서 2기 취임 뒤 버튼이 안 눌려요.\n언제 · 어느 화면에서 · 무엇을 눌렀는지 적어 주면 고치기 쉬워요.'],
  ['질문','질문','예: 숨겨진 임기 평가는 모두 몇 개인가요?'],['기타','기타','하고 싶은 말을 자유롭게 적어 주세요.']];
const SUG_MAX=500,SUG_MIN=5;
// 쓰다 만 글은 창을 닫았다 열어도 남긴다. 한 기기에서 10분에 다섯 번까지(서버도 따로 막는다)
let SUG_D={c:0,t:''},SUG_T=[],SUG_LAST='';
function sugOpen(from){const b=bxPanel('bx-sug','건의사항함',from);sugForm(b);}
function sugForm(b){
  b.innerHTML='<p class="bx-p">게임을 하다 떠오른 생각, 고쳐야 할 버그, 궁금한 점을 적어 주세요. 만든 사람이 하나하나 읽어요.</p>'+
    lab('분류')+'<div class="bx-seg" role="radiogroup" aria-label="분류">'+SUG_CAT.map((c,i)=>'<button type="button" role="radio" data-i="'+i+'">'+c[1]+'</button>').join('')+'</div>'+
    lab('내용')+'<textarea id="sugTx" class="bx-tx" rows="5" maxlength="'+SUG_MAX+'" aria-label="내용"></textarea>'+
    '<div class="bx-meta"><span class="bx-err" id="sugErr" role="alert"></span><span class="bx-cnt"><b id="sugN">0</b> / '+SUG_MAX+'</span></div>'+
    '<p class="bx-note">'+(IN_ART?'이 미리 보기 화면에서는 보낼 수 없어요. 게임 사이트에서 보내 주세요.':'닉네임 · 학교 · 게임 버전 · 화면 크기가 함께 가요. 이름과 전화번호는 보내지 않아요.')+'</p>'+
    '<div class="bx-btns"><button type="button" class="bx-no">닫기</button><button type="button" class="pri" id="sugGo"'+(IN_ART?' disabled':'')+'>보내기</button></div>';
  const tx=b.querySelector('#sugTx'),n=b.querySelector('#sugN'),err=b.querySelector('#sugErr'),seg=[...b.querySelectorAll('.bx-seg button')];
  const pick=i=>{SUG_D.c=i;seg.forEach((s,j)=>{s.setAttribute('aria-checked',j===i);s.tabIndex=j===i?0:-1;});tx.placeholder=SUG_CAT[i][2];};
  // 분류는 라디오처럼: 누르거나 ← → 로 고른다
  seg.forEach((s,i)=>{s.onclick=()=>{try{SFX.click();}catch(e){}pick(i);};s.onkeydown=e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();const j=(i+(e.key==='ArrowRight'?1:-1)+seg.length)%seg.length;pick(j);seg[j].focus();};});
  const cnt=()=>{n.textContent=tx.value.length;n.parentNode.classList.toggle('full',tx.value.length>=SUG_MAX);};
  tx.value=SUG_D.t;pick(SUG_D.c);cnt();tx.oninput=()=>{SUG_D.t=tx.value;cnt();err.textContent='';};
  b.querySelector('.bx-no').onclick=()=>{try{SFX.back();}catch(e){}bxClose();};
  b.querySelector('#sugGo').onclick=()=>{const t=tx.value.trim(),now=Date.now();SUG_T=SUG_T.filter(x=>now-x<600000);
    const bad=t.length<SUG_MIN?'조금만 더 자세히 적어 주세요('+SUG_MIN+'자 이상).':t===SUG_LAST?'방금 보낸 글과 같아요.':SUG_T.length>=5?'잠깐 쉬었다가 보내 주세요. 10분에 다섯 번까지 보낼 수 있어요.':'';
    if(bad){err.textContent=bad;tx.focus();return;}
    if(!sugSend(SUG_CAT[SUG_D.c][0],t)){err.textContent='여기서는 보낼 수 없어요.';return;}
    SUG_T.push(now);SUG_LAST=t;SUG_D.t='';try{SFX.coin();}catch(e){}sugDone(b,SUG_CAT[SUG_D.c][1],t);};
  setTimeout(()=>{try{tx.focus({preventScroll:true});}catch(e){}},30);}
// 보낼 기록 상자에 넣고 바로 보내 본다. k(접수ID)로 서버가 같은 글을 한 번만 쓴다
function sugSend(cat,text){if(!SHEET_URL||IN_ART)return false;const v=viewGet(),id=Date.now().toString(36)+Math.random().toString(36).slice(2,7),k='sug:'+id;
  const rec={id:id,cat:cat,text:text.slice(0,SUG_MAX),nickname:NICK||'익명',school:(PF&&PF.school)||'',gv:GAME_VER,pid:pidGet(),
    view:(v.lite?'라이트':'기본')+' · '+(v.ori==='p'?'세로':'가로')+' · '+innerWidth+'×'+innerHeight,ua:String(navigator.userAgent||'').slice(0,200)};
  obPush([{k:k,b:JSON.stringify({k:k,kind:'suggest',v:GAME_VER,rec:rec})}]);obFlush();return true;}
function sugDone(b,cat,t){const off=navigator.onLine===false;
  b.innerHTML='<div class="bx-done" role="status"><span class="bx-k">'+cat+'</span><h3>잘 받았어요. 고마워요!</h3>'+
    '<blockquote class="bx-q">'+gEsc(t.length>90?t.slice(0,90)+'…':t)+'</blockquote>'+
    '<p class="bx-p">'+(off?'지금은 인터넷이 끊겨 있어요. 이 기기에 넣어 두었다가 연결되면 저절로 보내요.':'보낸 글은 만든 사람이 바로 읽을 수 있어요. 다음 업데이트에 반영될지도 몰라요.')+'</p>'+
    '<div class="bx-btns"><button type="button" class="bx-more">하나 더 쓰기</button><button type="button" class="pri bx-no">닫기</button></div></div>';
  b.querySelector('.bx-more').onclick=()=>{try{SFX.click();}catch(e){}sugForm(b);};
  const c=b.querySelector('.bx-no');c.onclick=()=>{try{SFX.click();}catch(e){}bxClose();};c.focus();}

/* ----- 쿠폰함 ----- */
// 번호 다듬기 · 지문: tools/coupon.py의 norm · digest와 똑같이 해야 맞는다(한쪽을 고치면 다른 쪽도)
const CPN_SALT='pandemic-president-coupon-v1',CPN_IT=60000;
const cpnNorm=s=>String(s||'').normalize('NFKC').toUpperCase().replace(/[\s\-_.·]/g,'');
function cpnHash(n){const E=new TextEncoder(),sub=crypto.subtle;
  return sub.importKey('raw',E.encode(n),'PBKDF2',false,['deriveBits']).then(k=>sub.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:E.encode(CPN_SALT),iterations:CPN_IT},k,128)).then(lzHex);}
// 기한은 한국 날짜로 본다('2026-12-31'이면 그날 밤 12시까지)
const cpnToday=()=>new Date(Date.now()+324e5).toISOString().slice(0,10);
const cpnDay=(d,y)=>{const p=String(d||'').split('-');return p.length<3?'':(y?(+p[0])+'년 ':'')+(+p[1])+'월 '+(+p[2])+'일';};
// 비밀 인물: 대한민국 · 조선 · 미국 명단에서 sec가 있는 인물(좀비 무대의 인물은 고를 수 없어서 뺀다)
const cpnFig=()=>{const o={};['kr','joseon','usa'].forEach(c=>((CAMPS[c]&&CAMPS[c].bg)||[]).forEach(q=>{if(q.sec&&!q.god)o[q.sec]=q;}));return o;};
// 보상 종류(tools/coupon.py의 REWARDS와 이름을 맞춘다). 대상에 all을 쓰면 그 종류를 모두 준다. 모르는 종류 · 대상은 건너뛴다
const BAG_NM={a:'지지율 +'+BAG_AMT,e:'경제 +'+BAG_AMT,h:'방역(위기 대응) +'+BAG_AMT,m:'군사 +'+BAG_AMT,p:'권력 +'+BAG_AMT,x:'혼란 −'+BAG_AMT};
const CPN_R={
  mini:{ids:()=>MINI.map(x=>x.id),n:id=>'미니게임 「'+MINI.find(x=>x.id===id).n+'」',v:'열림',w:'미니게임은 새 게임 → 미니게임 탭에서 할 수 있어요.',has:id=>eggOn(id),
    give:id=>{eggSet(id);if(id==='sail'&&MEM.sailHint){delete MEM.sailHint;msave();}}},
  stage:{ids:()=>['reich','bonn'],n:id=>'비밀 무대 「'+CAMPS[id].n+'」',v:'열림',w:'비밀 무대는 새 게임의 무대 고르기에 나타나요.',has:id=>campOn(id),
    give:id=>{if(id==='reich')eggSet('reich');else{MEM.bonn=1;msave();}}},
  fig:{ids:()=>Object.keys(cpnFig()),n:id=>'비밀 인물 「'+cpnFig()[id].n+'」',v:'깨어남',w:'비밀 인물은 지도자 고르기에서 고를 수 있어요.',has:id=>!bgLock(cpnFig()[id]),
    give:id=>{MEM.sec=MEM.sec||{};MEM.sec[id]=1;if(MEM.secUsed)delete MEM.secUsed[id];msave();}},
  dex:{ids:()=>LEADK.slice(),n:id=>'지도자 「'+LEAD[id].n+'」',v:'도감에 오름',w:'도감은 메인 화면의 도감에서 볼 수 있어요.',has:id=>!!(MEM.leaders&&MEM.leaders[id]),
    give:id=>{MEM.leaders=MEM.leaders||{};if(!MEM.leaders[id])MEM.leaders[id]=1;msave();}},
  pump:{ids:()=>Object.keys(BAG_V),n:id=>'스텟 펌핑 「'+BAG_NM[id]+'」',v:'보관함에 담김',w:'스텟 펌핑은 게임 중 메뉴의 보관함에서 아무 때나 쓸 수 있어요.',has:()=>false,give:id=>{bagAdd(id,1);}},
  tok:{n:k=>'운명 개입 '+k+'번',v:'받음',w:'운명 개입은 다음 새 게임을 시작할 때 한꺼번에 들어가요.',give:k=>{MEM.cpTok=Math.min(9,(+MEM.cpTok||0)+k);msave();}}};
function cpnGive(r){const G=[];String(r||'').split('+').forEach(p=>{const i=p.indexOf(':'),t=p.slice(0,i).trim(),a=p.slice(i+1).trim(),X=CPN_R[t];if(i<0||!X)return;
    if(t==='tok'){const k=Math.floor(+a);if(k>=1&&k<=5){X.give(k);G.push({s:X.n(k),v:X.v,w:X.w});}return;}
    const ok=X.ids();(a==='all'?ok:[a]).forEach(id=>{if(ok.indexOf(id)<0)return;const had=X.has(id);X.give(id);G.push({s:X.n(id),v:X.v,w:X.w,had:had});});});
  return G;}
// 틀린 번호를 다섯 번 잇달아 넣으면 30초 쉬게 한다(마구 넣어 보기 막기)
let CPN_BAD=0,CPN_WAIT=0;
function cpnOpen(from){const b=bxPanel('bx-cpn','쿠폰함',from);cpnForm(b);}
function cpnForm(b){const M=MEM.cpn||{},L=Object.keys(M).map(h=>M[h]).sort((x,y)=>x.d<y.d?1:x.d>y.d?-1:0);
  b.innerHTML='<p class="bx-p">이벤트나 공지에서 받은 쿠폰 번호를 넣어 주세요. 쿠폰마다 이 기기에서 한 번 받을 수 있어요.</p>'+
    '<form class="bx-cf" autocomplete="off"><input id="cpnIn" class="bx-code" maxlength="40" placeholder="쿠폰 번호" aria-label="쿠폰 번호" autocapitalize="characters" autocorrect="off" spellcheck="false"><button type="submit" class="pri" id="cpnGo">받기</button></form>'+
    '<div class="bx-err" id="cpnErr" role="alert"></div>'+
    (bagN()?'<p class="bx-tok">보관함 <b>스텟 펌핑 '+bagN()+'개</b> · '+Object.keys(BAG_V).filter(k=>+MEM.bag[k]>0).map(k=>BAG_NM[k]+' ×'+MEM.bag[k]).join(' · ')+' · 게임 중 메뉴에서 써요.</p>':'')+
    (+MEM.cpTok>0?'<p class="bx-tok">받아 둔 운명 개입 <b>+'+MEM.cpTok+'</b> · 다음 새 게임을 시작할 때 들어가요.</p>':'')+
    (L.length?lab('받은 쿠폰 · '+L.length+'장')+'<ul class="bx-got">'+L.map(c=>'<li><b>'+gEsc(c.l||'쿠폰')+'</b><span>'+gEsc(c.g||'')+'</span><time>'+cpnDay(c.d)+'</time></li>').join('')+'</ul>':'');
  const inp=b.querySelector('#cpnIn');
  b.querySelector('.bx-cf').onsubmit=e=>{e.preventDefault();cpnTry(b);};inp.oninput=()=>{const e=b.querySelector('#cpnErr');e.textContent='';};
  setTimeout(()=>{try{inp.focus({preventScroll:true});}catch(e){}},30);}
function cpnTry(b){const inp=b.querySelector('#cpnIn'),go=b.querySelector('#cpnGo'),err=b.querySelector('#cpnErr'),say=t=>{err.textContent=t;if(t)try{SFX.back();}catch(e){}};
  if(go.disabled)return;const n=cpnNorm(inp.value);
  if(!n){say('쿠폰 번호를 넣어 주세요.');inp.focus();return;}
  const w=Math.ceil((CPN_WAIT-Date.now())/1000);if(w>0)return say('여러 번 틀렸어요. '+w+'초 뒤에 다시 넣어 주세요.');
  let sub=null;try{sub=window.crypto&&crypto.subtle;}catch(e){}
  if(!sub||!window.TextEncoder)return say('이 브라우저에서는 쿠폰을 쓸 수 없어요. 다른 브라우저로 열어 주세요.');
  go.disabled=true;err.textContent='';
  cpnHash(n).then(h=>{go.disabled=false;const c=CPN.find(x=>x.h===h),u=MEM.cpn&&MEM.cpn[h];
    if(!c){if(++CPN_BAD>=5){CPN_BAD=0;CPN_WAIT=Date.now()+30000;}return say('맞는 쿠폰이 없어요. 글자를 다시 확인해 주세요.');}
    CPN_BAD=0;
    if(u)return say('이미 이 기기에서 받은 쿠폰이에요('+cpnDay(u.d)+'에 받음).');
    if(c.u&&cpnToday()>c.u)return say('기간이 끝난 쿠폰이에요('+cpnDay(c.u,1)+'까지였어요).');
    const G=cpnGive(c.r);if(!G.length)return say('이 쿠폰은 지금 버전의 게임에서 쓸 수 없어요.');
    MEM.cpn=MEM.cpn||{};MEM.cpn[h]={d:cpnToday(),l:String(c.l||'').slice(0,40),g:G.map(g=>g.s).join(' · ')};msave();BX_DIRTY=true;
    cpnDone(b,c,G);},()=>{go.disabled=false;say('쿠폰을 확인하지 못했어요. 다시 해 주세요.');});}
function cpnDone(b,c,G){try{SFX.unlock();}catch(e){}vib([30,30,60]);const W=[...new Set(G.filter(g=>!g.had).map(g=>g.w))];
  b.innerHTML='<div class="bx-done" role="status"><span class="bx-k">쿠폰 사용 완료</span><h3>'+gEsc(c.l||'쿠폰 선물이 도착했어요')+'</h3>'+
    '<ul class="bx-gift">'+G.map(g=>'<li'+(g.had?' class="had"':'')+'><b>'+g.s+'</b><em>'+(g.had?'이미 있었어요':g.v)+'</em></li>').join('')+'</ul>'+
    (W.length?'<p class="bx-p">'+W.join('<br>')+'</p>':'')+'<div class="bx-btns one"><button type="button" class="pri" id="cpnOk">확인</button></div></div>';
  const ok=b.querySelector('#cpnOk');ok.onclick=()=>{try{SFX.click();}catch(e){}cpnForm(b);};ok.focus();}
