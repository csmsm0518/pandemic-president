/* ---------- 화면 설정: 세로/가로 모드 · 라이트 모드 ----------
   시작 화면에서 고르고 메뉴에서 바꾼다. 기록(MEM)과 함께 이 브라우저에 남는다.
   ori: 'p' 세로(한 칸) · 'l' 가로(넓으면 상황판|사건 두 칸). lite: 예전 종이 메뉴 + 무거운 연출 끄기.
   처음에는 기기 방향과 화면 크기(짧은 변 400px 미만이면 라이트)로 미리 골라 둔다. */
function viewGet(){const v=MEM.view||{};
  return {ori:v.ori||(matchMedia('(orientation:portrait)').matches?'p':'l'),lite:v.lite!=null?!!v.lite:Math.min(screen.width,screen.height)<400};}
function applyView(){const v=viewGet(),h=document.documentElement;h.dataset.ori=v.ori;if(v.lite)h.dataset.lite='1';else delete h.dataset.lite;}
function setView(k,val){MEM.view=Object.assign(viewGet(),{[k]:val});msave();applyView();}
function vwHTML(head){const v=viewGet(),b=(k,val,t,s)=>'<button data-k="'+k+'" data-v="'+val+'" class="'+((k==='ori'?v.ori===val:(v.lite?'1':'0')===val)?'on':'')+'"><b>'+t+'</b><span>'+s+'</span></button>';
  return '<div class="vw">'+(head?'<div class="vw-h">화면 설정<span>나중에 메뉴에서 바꿀 수 있어요</span></div>':'')+
   '<div class="vw-l">화면 방향</div><div class="vw-g">'+b('ori','p','세로 모드','휴대폰을 세워서 · 한 칸 화면')+b('ori','l','가로 모드','눕혀서 · 태블릿·PC · 두 칸 화면')+'</div>'+
   '<div class="vw-l">화면 효과</div><div class="vw-g">'+b('lite','0','기본','연출과 애니메이션 모두')+b('lite','1','라이트','작은 휴대폰 · 예전처럼 가볍게')+'</div></div>';}
// after(k): 바꾼 뒤 할 일(라이트를 바꾸면 메뉴를 다시 그리는 등)
function vwBind(root,after){root.querySelectorAll('.vw [data-k]').forEach(x=>x.onclick=()=>{try{SFX.click();}catch(e){}
  const k=x.dataset.k;setView(k,k==='lite'?x.dataset.v==='1':x.dataset.v);
  root.querySelectorAll('.vw [data-k="'+k+'"]').forEach(y=>y.classList.toggle('on',y===x));if(after)after(k);});}
function viewPage(back){if(CINE)cineClose();window.scrollTo(0,0);
  R.innerHTML='<div style="animation:fdIn .3s ease-out"><button id="vwBack" style="font-size:13px;padding:7px 12px;margin-bottom:14px">← 돌아가기</button>'+
   '<div class="hd" style="font-size:25px;margin-bottom:12px">화면 설정</div>'+vwHTML()+
   '<div style="font-size:12.5px;color:var(--text-muted);line-height:1.7">세로 모드는 한 칸짜리 화면이고, 가로 모드는 넓은 화면에서 왼쪽 상황판과 오른쪽 사건으로 나뉘어요. 휴대폰을 고른 방향과 반대로 들고 있으면 돌려 달라는 안내가 나와요.</div></div>';
  vwBind(R);document.getElementById('vwBack').onclick=()=>{try{SFX.back();}catch(e){}back();};}
// 인적사항 다음에 나오는 화면 설정: 화면 가득 가운데에서 크게 고르고, '이대로 시작'을 누르면 done(오프닝)으로 간다.
// 누르는 즉시 적용되고, 처음에는 기기 방향·크기로 미리 골라 둔다(viewGet).
function viewSetup(done){window.scrollTo(0,0);const v=viewGet();
  const PH=l=>'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="'+(l?5:14)+'" y="'+(l?14:5)+'" width="'+(l?38:20)+'" height="'+(l?20:38)+'" rx="3.5"/><path d="'+(l?'M38 22v4':'M22 38h4')+'"/></svg>';
  const IC={full:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6l4.5 13.5L42 24l-13.5 4.5L24 42l-4.5-13.5L6 24l13.5-4.5z"/></svg>',
    lite:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M38 8C25 8 13 18 13 31v7h7c13 0 22-11 22-24V8z"/><path d="M13 38l17-17"/></svg>'};
  const card=(k,val,icon,t,s,on)=>'<button class="vset-c'+(on?' on':'')+'" data-k="'+k+'" data-v="'+val+'">'+icon+'<b>'+t+'</b><span>'+s+'</span></button>';
  const o=document.createElement('div');o.className='vset';o.setAttribute('role','dialog');o.setAttribute('aria-label','화면 설정');
  o.innerHTML='<div class="vset-in"><div class="vset-k">시작하기 전에</div><h2 class="vset-h">화면 설정</h2>'+
    '<p class="vset-p">어떻게 플레이할지 골라 주세요. 나중에 메뉴에서 언제든 바꿀 수 있어요.</p>'+
    '<div class="vset-l">화면 방향</div><div class="vset-g">'+card('ori','p',PH(0),'세로 모드','휴대폰을 세워서 · 한 칸 화면',v.ori==='p')+card('ori','l',PH(1),'가로 모드','눕혀서 · 태블릿·PC · 두 칸 화면',v.ori==='l')+'</div>'+
    '<div class="vset-l">화면 효과</div><div class="vset-g">'+card('lite','0',IC.full,'기본','연출과 애니메이션 모두',!v.lite)+card('lite','1',IC.lite,'라이트','작은 휴대폰 · 예전처럼 가볍게',v.lite)+'</div>'+
    '<button class="vset-go pri" id="vsetGo">이대로 시작</button></div>';
  document.body.appendChild(o);
  o.querySelectorAll('.vset-c').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}const k=b.dataset.k;setView(k,k==='lite'?b.dataset.v==='1':b.dataset.v);
    o.querySelectorAll('.vset-c[data-k="'+k+'"]').forEach(x=>x.classList.toggle('on',x===b));});
  let gone=false;const go=()=>{if(gone)return;gone=true;try{SFX.coin();}catch(e){}setView('ori',viewGet().ori);document.removeEventListener('keydown',key);
    o.classList.add('out');setTimeout(()=>o.remove(),300);done();};
  const key=e=>{if(e.key==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('.vset-c'))){e.preventDefault();go();}};
  document.addEventListener('keydown',key);o.querySelector('#vsetGo').onclick=go;
  setTimeout(()=>{try{o.querySelector('#vsetGo').focus({preventScroll:true});}catch(e){}},50);}
// 휴대폰을 고른 방향과 반대로 들고 있을 때 덮는 안내(CSS가 보이고 숨긴다)
document.body.insertAdjacentHTML('beforeend','<div class="rotq" role="alert"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></svg>'+
  '<p class="rq-l">가로 모드를 골랐어요.<br>휴대폰을 가로로 돌려 주세요.</p><p class="rq-p">세로 모드를 골랐어요.<br>휴대폰을 세로로 돌려 주세요.</p>'+
  '<button class="rq-l" data-o="p">세로 모드로 바꾸기</button><button class="rq-p" data-o="l">가로 모드로 바꾸기</button></div>');
document.querySelectorAll('.rotq [data-o]').forEach(b=>b.onclick=()=>setView('ori',b.dataset.o));

// 라이트 모드의 메인 화면: 예전 버전처럼 종이 한 장에 무대·출발 인물·결정 빈도·난이도를 두고 바로 취임한다
function homeLite(){bgmIntro(true);if(CINE)cineClose();window.scrollTo(0,0);CP=CAMPS.kr;if(!campOn(camp))camp='kr';document.documentElement.dataset.camp=camp;
  const msg=HUB_MSG;HUB_MSG='';const C=CAMPS[camp],BGS=C.bg;
  // 출발 인물은 드롭다운으로 고른다. 처음엔 '인물을 선택하세요'이고, 고르기 전에는 취임할 수 없다.
  if(bg>=BGS.length||(bg>=0&&bgLock(BGS[bg])))bg=-1;const B=bg>=0?BGS[bg]:null;
  const sel='border-color:var(--ink);background:#fbf8f2;box-shadow:inset 0 0 0 1px var(--ink);';
  const got=Object.keys(MEM.ends).length,lg=Object.keys(MEM.leaders||{}).length;
  const chip=(on,col,inner,pad)=>'<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle;font-size:12px;padding:'+(pad||'4px 10px')+';border-radius:999px;margin:0 6px 6px 0;'+(on?'background:color-mix(in srgb,'+col+' 18%,var(--surface-1));border:1px solid color-mix(in srgb,'+col+' 45%,transparent);color:var(--text-primary);font-weight:600':'border:1px dashed var(--border-strong);color:var(--text-muted)')+'">'+inner+'</span>';
  const dex=ENDC.map(e=>{const on=MEM.ends[e[0]];return chip(on,'#2f4a6b',on?(HNAME[e[0]]||e[1]):(HNAME[e[0]]?'???':e[1]));}).join('');
  const ldex=LEADK.map(id=>{const on=MEM.leaders&&MEM.leaders[id],L=LEAD[id];return chip(on,L.col,on?portrait(L.n,22)+L.n:'???',on?'3px 10px 3px 3px':'');}).join('');
  const cmb=Object.keys(CAMPS).filter(campOn).map(id=>{const X=CAMPS[id];return '<button class="cmb'+(camp===id?' on':'')+'" data-c="'+id+'"><span class="cmb-t"><b>'+X.n+'</b><span class="cmb-tag'+(X.tag==='DLC'?' dlc':'')+'">'+X.tag+'</span></span><span class="cmb-s">'+X.sub+'</span></button>';}).join('');
  const lockd=BGS.map(q=>[q,bgLock(q)]).filter(x=>x[1]);
  const opts='<option value=""'+(B?'':' selected')+' disabled>인물을 선택하세요</option><option value="r">🎲 랜덤 — 고를 수 있는 인물 중 무작위로</option>'+BGS.map((q,k)=>{const L=bgLock(q);
    return '<option value="'+k+'"'+(L?' disabled':'')+(bg===k?' selected':'')+'>'+(L?(L.used?q.n+' · 이미 함께한 비밀 인물':'??? · 잠긴 비밀 인물'):q.n+' — '+(q.k||''))+'</option>';}).join('');
  const bgSel='<label class="bgsel'+(B?'':' ph')+'"><select id="bgSel" aria-label="출발 인물">'+opts+'</select></label>'+
    (B?'<div class="bgcard">'+portrait(B.n,56)+'<div><div class="bgcard-h"><b>'+B.n+'</b><span>'+ageTxt(B)+'</span></div><div class="bgcard-k">'+(B.k||'')+(B.sec?' · 비밀 인물':'')+'</div>'+
      (B.s?'<p>'+B.s+'</p>':'')+'<div class="bgcard-e">'+bgDesc(B,C)+'</div>'+(B.once?'<div class="bgcard-w">단 한 번만 함께할 수 있다. 취임하는 순간 다시 잠긴다.</div>':'')+'</div></div>'
     :'<div class="bgcard empty">함께할 인물을 고르면 여기에 소개와 능력치가 나와요.</div>');
  const bgHint=lockd.length?'<div class="bghint">'+lockd.map(x=>'<div>🔒 '+(x[1].used?x[0].n+' · ':'')+x[1].h+'</div>').join('')+'</div>':'<div style="height:14px"></div>';
  const mdb=MODE.map((q,k)=>'<button class="mdb" data-k="'+k+'" style="flex:1;font-size:13.5px;padding:11px 6px;'+(mode===k?sel:'')+'"><span style="display:block;font-weight:600">'+q.n+'</span><span style="display:block;font-size:12px;color:var(--text-muted);margin-top:1px">'+q.d+'</span></button>').join('');
  const dfb=DIFF.map((q,k)=>'<button class="dfb" data-k="'+k+'" style="flex:1;font-size:13.5px;padding:11px 6px;'+(dif===k?sel:'')+'">'+q.n+'<span class="dfp d'+k+'">'+Array.from({length:DIFF.length},(_,j)=>'<i'+(j<=k?' class="f"':'')+'></i>').join('')+'</span></button>').join('');
  const stat=(a,b)=>'<div style="flex:1;min-width:0;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px 12px"><div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+a+'</div><div style="font-size:18px;font-weight:700;margin-top:2px;font-variant-numeric:tabular-nums">'+b+'</div></div>';
  // 세로 화면에서는 무대 소개와 기록 카드를 취임 버튼 아래로 내려, 게임을 시작하는 데 필요한 것만 첫 화면에 둔다
  const P=isP(),intro='<div class="hl-in" style="font-size:14px;color:var(--text-secondary);line-height:1.75;margin:12px 0 18px">'+C.intro+'</div>'+
    '<div style="display:flex;gap:8px;margin-bottom:24px">'+stat('최고 커리어 점수',MEM.best100?MEM.best100.toLocaleString('ko-KR')+'<span style="font-size:12px;color:var(--text-muted)">점</span>':'—')+stat('최장 재임',MEM.longest?MEM.longest+'년':'—')+stat('지나온 인생',(MEM.careers||0)+'번')+'</div>';
  R.innerHTML='<div class="hl" style="animation:fdIn .35s ease-out">'+
  '<div class="hl-hd" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><span class="hd" id="ttl" style="font-size:25px;user-select:none">팬데믹 대통령</span><button id="snd" style="width:38px;height:34px;padding:0;display:flex;align-items:center;justify-content:center" aria-label="소리 설정">'+sndIco()+'</button></div>'+
  (msg?'<div style="font-size:13.5px;line-height:1.7;color:var(--text-secondary);background:var(--surface-1);border-radius:10px;padding:10px 12px;margin-bottom:16px">'+msg+'</div>':'')+
  lab('무대 고르기')+'<div class="cmbs">'+cmb+'</div>'+(P?'<div style="height:14px"></div>':intro)+
  lab('출발 인물')+bgSel+(P?'<div style="height:12px"></div>':bgHint)+
  lab('결정 빈도')+'<div class="hl-mode" style="display:flex;gap:8px;margin-bottom:22px">'+mdb+'</div>'+
  lab('난이도')+'<div class="hl-dif" style="display:flex;gap:8px;margin-bottom:24px">'+dfb+'</div>'+
  '<div class="hl-go"><button id="st" class="pri"'+(B?'':' disabled')+' style="width:100%;padding:16px;font-size:16.5px;margin-bottom:12px">'+(!B?'인물을 선택하세요':camp==='joseon'?'즉위한다':camp==='zombie'?'지휘를 맡는다':'취임한다')+'</button></div>'+(P?bgHint+intro:'')+
  '<div class="hm-row"><button id="tutBtn" class="tgl" role="switch" aria-checked="'+tutOn()+'"><span class="tgl-k"></span><span>튜토리얼 '+(tutOn()?'켜짐':'꺼짐')+'</span></button></div>'+
  '<button id="ldBtn" class="hm-card"><span class="hm-i">'+ICO2.book+'</span><span class="hm-x"><b>불러오기</b><span>'+gEsc(svMenuTxt()||'저장된 게임이 없다')+'</span></span><span class="hm-go">'+CHEV+'</span></button>'+
  '<button id="lbBtn" class="hm-card"><span class="hm-i">'+ICO2.book+'</span><span class="hm-x"><b>명예의 전당</b><span>모두의 최고 기록</span></span><span class="hm-go">'+CHEV+'</span></button>'+
  '<button id="gbBtn" class="hm-card"><span class="hm-i">'+ICO2.book+'</span><span class="hm-x"><b>가이드북</b><span>판정 규칙, 지표, 대선, 점수 계산까지 한 번에</span></span><span class="hm-go">'+CHEV+'</span></button>'+
  '<div style="height:16px"></div>'+vwHTML()+
  lab('지도자 도감 '+lg+' / '+LEADK.length)+'<div style="margin-bottom:22px">'+ldex+'</div>'+
  lab('임기 평가 도감 '+got+' / '+ENDC.length)+'<div style="margin-bottom:22px">'+dex+'</div>'+
  '<button id="edBtn" style="width:100%;font-size:13px;margin-bottom:8px">인적사항 바꾸기</button>'+
  '<button id="rsBtn" style="width:100%;font-size:12.5px;margin-bottom:8px;color:var(--text-muted)">이 기기 기록 초기화</button>'+
  '<div style="text-align:center;font-size:11px;color:var(--text-muted);margin:6px 0 10px">팬데믹 대통령 '+GAME_VER+' · 라이트</div></div>';
  const $=id=>document.getElementById(id);
  $('bgSel').onchange=e=>{SFX.click();const v=e.target.value;
    // 랜덤: 지금 고를 수 있는(잠기지 않은) 인물 가운데 한 명
    if(v==='r'){const P=BGS.map((q,i)=>i).filter(i=>!bgLock(BGS[i]));bg=P.length?P[Math.floor(Math.random()*P.length)]:-1;}else bg=v===''?-1:+v;homeLite();};
  R.querySelectorAll('.cmb').forEach(b=>b.onclick=()=>{SFX.click();if(camp!==b.dataset.c){camp=b.dataset.c;bg=-1;}homeLite();});
  R.querySelectorAll('.mdb').forEach(b=>b.onclick=()=>{SFX.click();mode=+b.dataset.k;homeLite();});
  R.querySelectorAll('.dfb').forEach(b=>b.onclick=()=>{SFX.click();dif=+b.dataset.k;homeLite();});
  $('snd').onclick=toggleSound;
  $('st').onclick=()=>{try{aInit();SFX.start();}catch(e){}start();};
  $('tutBtn').onclick=()=>{SFX.click();MEM.tut=!tutOn();msave();homeLite();};
  $('lbBtn').onclick=()=>{SFX.click();openBoard({back:home});};
  if($('ldBtn'))$('ldBtn').onclick=()=>{try{aInit();}catch(e){}SFX.click();svPicker();};   // 라이트 모드 메인 화면은 작은 창으로 연다
  $('gbBtn').onclick=()=>{SFX.click();guide(home);};
  $('edBtn').onclick=()=>{SFX.click();intro();};
  $('rsBtn').onclick=()=>{SFX.click();resetAsk();};
  vwBind(R,k=>{if(k==='lite')home();});
  // 이스터에그: 제목을 3초 안에 7번 누르면 좀비 무대가 열린다
  $('ttl').onclick=()=>{const n=Date.now();TAPS=TAPS.filter(x=>n-x<3000);TAPS.push(n);if(TAPS.length<7)return;TAPS=[];
    if(eggOn('zombie')){eggToast('🧟 좀비 무대는 이미 열려 있어요.');return;}
    eggSet('zombie');try{SFX.zombie();}catch(e){}vib([60,40,60,40,200]);camp='zombie';bg=-1;eggToast('🧟 <b>어디선가 신음 소리가 들린다…</b><br>비밀 무대 「좀비 아포칼립스」가 열렸어요.');homeLite();};
  if(SEC_NEW.length){const nm=SEC_NEW.map(id=>{for(const c in CAMPS){const q=CAMPS[c].bg.find(b=>b.sec===id);if(q)return q.n;}return id;});SEC_NEW=[];SFX.unlock();eggToast('🔓 비밀 인물 해금: <b>'+nm.join(', ')+'</b>');}
}

// 이 기기 기록 초기화: 이 브라우저에 저장된 것(기록·도감·저장한 게임·인적사항·설정·이스터에그·좀비 게임 기록)을 지우고 처음처럼 다시 연다.
// 명예의 전당(구글 시트)에 이미 올라간 기록은 그대로 남는다. 되돌릴 수 없으니 한 번 더 묻는다.
const RESET_KEYS=k=>/^pandemic_|^pp_zombie_/.test(k);
function resetAsk(){const o=document.getElementById('rsAsk');if(o)o.remove();
  const w=document.createElement('div');w.id='rsAsk';w.className='rs-ask';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');w.setAttribute('aria-labelledby','rsT');
  w.innerHTML='<div class="rs-card"><span class="rs-k">이 기기 기록 초기화</span><h2 id="rsT">처음처럼 다시 시작할까요?</h2>'+
    '<p>이 기기(브라우저)에 저장된 것을 모두 지워요.</p><ul><li>최고 기록 · 도감 · 기록 보관소</li><li>저장한 게임</li><li>인적사항(학교 · 이름 · 닉네임)</li><li>화면 · 소리 설정, 연 이스터에그, 좀비 게임 기록</li></ul>'+
    '<p class="rs-keep">명예의 전당(구글 시트)에 이미 올라간 기록은 지워지지 않아요.</p>'+
    '<div class="rs-b"><button type="button" id="rsNo">취소</button><button type="button" id="rsYes" class="rs-yes">모두 지우고 처음부터</button></div></div>';
  document.body.appendChild(w);const no=()=>{w.remove();document.removeEventListener('keydown',kd,true);},
    // 창이 떠 있는 동안 키는 뒤의 메인 메뉴로 가지 않게 먼저 가로챈다(Enter·스페이스는 창 안의 단추를 누른다)
    kd=e=>{if(!/^(Escape|Enter| |Arrow|Tab)/.test(e.key))return;if(e.key==='Tab')return;e.stopPropagation();e.preventDefault();if(e.key==='Escape')return no();
      const a=document.activeElement;if((e.key==='Enter'||e.key===' ')&&a&&w.contains(a))a.click();else if(/^Arrow/.test(e.key)){const b=[...w.querySelectorAll('button')],i=b.indexOf(a);b[(i+1+b.length)%b.length].focus();}};
  document.addEventListener('keydown',kd,true);
  w.onclick=e=>{if(e.target===w)no();};document.getElementById('rsNo').onclick=()=>{try{SFX.click();}catch(e){}no();};
  document.getElementById('rsYes').onclick=()=>{try{const L=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(RESET_KEYS(k))L.push(k);}L.forEach(k=>localStorage.removeItem(k));}catch(e){}
    location.reload();};
  setTimeout(()=>{const b=document.getElementById('rsNo');if(b)b.focus();},30);}
function home(){bgmIntro(true);if(viewGet().lite)return homeLite();
  window.scrollTo(0,0);CP=CAMPS.kr;if(!campOn(camp))camp='kr';document.documentElement.dataset.camp='kr';
  R.innerHTML='<div style="min-height:70vh"></div>';
  const msg=HUB_MSG;HUB_MSG='';
  const sv=svMenuTxt(),M=[].concat([['mmNew','새 게임','한 번의 인생을 시작한다','new'],['mmLoad','불러오기',sv||'저장된 게임이 없다','guide']],[['mmBoard','명예의 전당','모두의 최고 기록','board'],['mmDex','도감','만난 지도자와 임기 평가','dex'],['mmGuide','가이드북','처음이라면 여기부터','guide']]);
  // 기록 카드: 닉네임, 최고 기록, 도감 진행도
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const st=(l,v,u)=>'<div><span>'+l+'</span><b>'+v+'</b>'+(u&&v!=='—'?'<small>'+u+'</small>':'')+'</div>';
  const pb=(l,a,n)=>'<div class="gx-pb"><span>'+l+'</span><em>'+a+' / '+n+'</em><i><s style="width:'+(n?Math.round(a/n*100):0)+'%"></s></i></div>';
  const pc='<aside class="gx-pc" aria-label="내 기록"><div class="gx-pc-h"><span>기록 보관소</span><b>'+esc(NICK||'익명')+'</b></div>'+
    '<div class="gx-pc-g">'+st('최고 커리어 점수',MEM.best100?MEM.best100.toLocaleString('ko-KR'):'—','점')+st('최장 재임',MEM.longest||'—','년')+st('지나온 인생',MEM.careers||0,'번')+'</div>'+
    pb('지도자 도감',Object.keys(MEM.leaders||{}).length,LEADK.length)+pb('임기 평가 도감',Object.keys(MEM.ends||{}).length,ENDC.length)+
    (MEM.zg&&MEM.zg.runs?'<div class="gx-pc-z"><span>방역선 최고</span><b>'+MEM.zg.best.toLocaleString('ko-KR')+'<small>점</small></b><span>새벽 맞이 '+MEM.zg.wins+'번</span></div>':'')+
    (MEM.sail&&MEM.sail.v===2&&MEM.sail.best?'<div class="gx-pc-z"><span>대항해 최고</span><b>'+Math.floor(MEM.sail.best/60)+':'+(MEM.sail.best%60).toFixed(1).padStart(4,'0')+'</b><span>금메달 '+(MEM.sail.gold||0)+'번</span></div>':'')+'</aside>';
  let sel=0;
  cine([{t:'메인 메뉴',h:'<div class="gx gx-title"><canvas class="gx-bg" aria-hidden="true"></canvas><div class="gx-seal" aria-hidden="true">'+emblemSvg('embgS')+'</div>'+
    '<div class="gx-tl"><div class="emb go gx-logo">'+emblemSvg()+'<div><h1 class="emb-t"><span>팬데믹</span> <span>대통령</span></h1><p class="emb-s">한 번의 인생, 한 나라의 운명</p></div></div>'+
    (msg?'<div class="gx-msg">'+msg+'</div>':'')+
    '<div class="gx-row2"><nav class="gx-menu" aria-label="메인 메뉴">'+M.map((m,i)=>'<button class="gx-mi" id="'+m[0]+'" style="--i:'+i+'"><span class="gx-ic" aria-hidden="true">'+GX_IC[m[3]]+'</span><span class="gx-mt"><b>'+m[1]+'</b><small>'+m[2]+'</small></span><span class="gx-ar2" aria-hidden="true">›</span></button>').join('')+
    '<button class="gx-mi sub" id="mmView" style="--i:'+(M.length-1)+'">화면 설정 · 세로/가로 · 라이트</button><button class="gx-mi sub" id="mmEdit" style="--i:'+M.length+'">인적사항 바꾸기</button><button class="gx-mi sub dim" id="mmReset" style="--i:'+(M.length+1)+'">이 기기 기록 초기화</button></nav>'+pc+'</div></div>'+
    '<div class="gx-foot"><span class="gx-keys"><kbd>↑</kbd><kbd>↓</kbd> 고르기 &nbsp;<kbd>Enter</kbd> 결정</span><span>'+GAME_VER+'</span></div></div>'}],
    {nav:false,cls:'gm',top:'<button id="snd" class="cine-x cine-snd" aria-label="소리 설정">'+sndIco()+'</button>',
     key:e=>{const n=MI.length;if(e.key==='ArrowDown'){mark((sel+1)%n,1);return true;}if(e.key==='ArrowUp'){mark((sel-1+n)%n,1);return true;}
       if(gxEnter(e)){MI[sel].click();return true;}}});
  const $=id=>document.getElementById(id),MI=[...document.querySelectorAll('.gx-mi')];
  const mark=(i,snd)=>{if(snd&&i!==sel)gxSfx('tick',i);sel=i;MI.forEach((b,j)=>b.classList.toggle('on',j===i));};
  MI.forEach((b,i)=>{b.onmouseenter=()=>mark(i,1);b.onfocus=()=>mark(i);});mark(0);
  gxLattice(document.querySelector('.gx-bg'));
  $('snd').onclick=toggleSound;
  $('mmNew').onclick=()=>{try{aInit();}catch(e){}gxSfx('click');stepCamp();};
  $('mmLoad').onclick=()=>{try{aInit();}catch(e){}gxSfx('click');ldPanel();};
  $('mmBoard').onclick=()=>{gxSfx('click');cineClose();openBoard({back:home});};
  $('mmDex').onclick=()=>{gxSfx('click');dexScene();};
  $('mmGuide').onclick=()=>{gxSfx('click');cineClose();guide(home);};
  $('mmEdit').onclick=()=>{gxSfx('click');cineClose();intro();};
  $('mmView').onclick=()=>{gxSfx('click');viewPage(home);};
  $('mmReset').onclick=()=>{gxSfx('click');resetAsk();};
  // 이스터에그: 로고의 나침반을 다섯 바퀴 돌리면 비밀 모드 「대항해」가 새 게임의 무대 고르기에 생긴다
  compassSpin(document.querySelector('.cine .gx-logo svg'),()=>{
    if(eggOn('sail')){eggToast('⚓ 대항해는 이미 열려 있어요. 새 게임에서 고르세요.');return;}
    eggSet('sail');try{SFX.unlock();}catch(e){}vib([40,30,40,30,160]);
    eggToast('⚓ <b>나침반 바늘이 바다를 가리킨다…</b><br>비밀 모드 「대항해」가 열렸어요. 새 게임에서 고를 수 있어요.');});
  // 이스터에그: 제목을 3초 안에 7번 누르면(터치·클릭 모두) 좀비 무대가 열린다
  const tt=document.querySelector('.cine .emb-t');tt.id='ttl';tt.style.cursor='default';tt.style.userSelect='none';
  tt.onclick=()=>{const n=Date.now();TAPS=TAPS.filter(x=>n-x<3000);TAPS.push(n);if(TAPS.length<7)return;TAPS=[];
    if(eggOn('zombie')){eggToast('🧟 좀비 무대는 이미 열려 있어요.');return;}
    eggSet('zombie');try{SFX.zombie();}catch(e){}vib([60,40,60,40,200]);camp='zombie';bg=-1;eggToast('🧟 <b>어디선가 신음 소리가 들린다…</b><br>비밀 무대 「좀비 아포칼립스」가 열렸어요. 새 게임에서 고를 수 있어요.');};
  if(SEC_NEW.length){const nm=SEC_NEW.map(id=>{for(const c in CAMPS){const q=CAMPS[c].bg.find(b=>b.sec===id);if(q)return q.n;}return id;});SEC_NEW=[];SFX.unlock();eggToast('🔓 비밀 인물 해금: <b>'+nm.join(', ')+'</b>');}
}
// 1단계: 무대. 비스듬한 깃발 판 중 하나를 고르면 그 판이 넓게 펼쳐진다. 고른 판을 한 번 더 누르면(또는 Enter) 지도자 고르기로.
// 무대 판은 세로로 긴 포스터 한 장처럼 판 전체를 나라의 상징으로 채운다(넓은 판·낮은 판에서는 가운데를 중심으로 잘려 보인다).
// 다섯 판 모두 같은 그림체: 큰 색면으로 된 깃발 그림에 같은 천 주름(일렁인다) · 같은 직물 결 · 같은 빛(CSS)을 입힌다. 대항해는 그 위에서 물결이 흐르고 배가 출렁인다
const CP_ART=(()=>{const sv=(id,b,w)=>'<svg viewBox="0 0 '+(w||300)+' 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+b+'</svg>';
  // 천 주름: 비스듬한 어두운 띠와 밝은 띠를 겹쳐 놓고 조금씩 흔든다
  const fold=id=>'<defs><linearGradient id="'+id+'d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".5" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="'+id+'l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>'+
    '<g class="cp-fold"><rect x="-60" y="-120" width="90" height="900" fill="url(#'+id+'d)" transform="rotate(-28 150 300) translate(40 0)"/><rect x="-60" y="-120" width="60" height="900" fill="url(#'+id+'l)" transform="rotate(-28 150 300) translate(130 0)"/>'+
    '<rect x="-60" y="-120" width="120" height="900" fill="url(#'+id+'d)" transform="rotate(-24 150 300) translate(230 0)"/><rect x="-60" y="-120" width="70" height="900" fill="url(#'+id+'l)" transform="rotate(-24 150 300) translate(330 0)"/></g>';
  // 태극기 천: 위 빨강 · 아래 파랑이 굽이치고, 네 귀퉁이에 같은 빛깔로 어둡게 괘를 놓는다
  const bars=(x,y,v,p,c)=>p.map((b,i)=>{const o=i*17;return v?(b?'<rect x="'+(x+o)+'" y="'+y+'" width="11" height="22" fill="'+c+'"/><rect x="'+(x+o)+'" y="'+(y+30)+'" width="11" height="22" fill="'+c+'"/>':'<rect x="'+(x+o)+'" y="'+y+'" width="11" height="52" fill="'+c+'"/>')
    :(b?'<rect x="'+x+'" y="'+(y+o)+'" width="24" height="11" fill="'+c+'"/><rect x="'+(x+32)+'" y="'+(y+o)+'" width="24" height="11" fill="'+c+'"/>':'<rect x="'+x+'" y="'+(y+o)+'" width="56" height="11" fill="'+c+'"/>');}).join('');
  // 골라진 판(넓다)에서도 네 귀퉁이가 보이도록 가로를 넓게(440) 그린다
  const kr=sv('k','<rect width="440" height="600" fill="#3f5cc8"/><path d="M0 0H440V250C350 245 282 294 222 338C160 384 92 414 0 420Z" fill="#ec4650"/>'+
    bars(40,60,1,[0,0,0],'#a3242d')+bars(344,66,0,[1,0,1],'#a3242d')+bars(40,470,0,[0,1,0],'#22357e')+bars(356,466,1,[1,1,1],'#22357e')+'<g transform="translate(70 0)">'+fold('k')+'</g>',440);
  // 세로로 건 성조기: 세로 줄무늬와 위쪽 파란 칸의 별
  let us='<rect width="300" height="600" fill="#f2ede4"/>';for(let i=0;i<13;i+=2)us+='<rect x="'+(i*300/13).toFixed(1)+'" y="0" width="'+(300/13+.5).toFixed(1)+'" height="600" fill="#d23b45"/>';
  us+='<rect width="300" height="250" fill="#2c3e86"/>';for(let r=0;r<9;r++)for(let c=0;c<(r%2?5:6);c++){const x=26+c*50+(r%2?25:0),y=22+r*26;us+='<path transform="translate('+x+' '+y+') scale(1.35)" d="M0-6L1.8-1.9 6.3-1.9 2.6.8 4 5.1 0 2.5-4 5.1-2.6.8-6.3-1.9-1.8-1.9Z" fill="#f2ede4"/>';}
  const usa=sv('u',us+fold('u'));
  // 일월오봉도: 하늘 · 해와 달 · 다섯 봉우리 · 아래 물결 · 양옆 붉은 소나무
  let jw='';for(let r=0;r<4;r++)for(let i=-1;i<11;i++)jw+='<path d="M'+(i*44+(r%2?22:0))+' '+(470+r*30)+'q22 -20 44 0" fill="none" stroke="#e8e2d2" stroke-width="4"/>';
  // 넓은 판에서도 해와 달이 잘리지 않게 가로 440으로: 가운데 300폭 그림을 70만큼 옮기고 양옆에 낮은 봉우리를 더한다
  const jo=sv('j','<rect width="440" height="600" fill="#2a4b6c"/><path d="M0 450L0 360 40 330 90 450ZM350 450L400 330 440 360 440 450Z" fill="#3c8f7a"/><rect y="446" width="440" height="160" fill="#2f63a5"/><g transform="translate(70 0)">'+
    '<circle cx="222" cy="110" r="32" fill="#d23b2f"/><circle cx="78" cy="110" r="28" fill="#ece6d6"/>'+
    '<path d="M0 450L56 300 100 360 150 190 200 360 244 300 300 450Z" fill="#2e8a72"/><path d="M90 450L150 250 210 450Z" fill="#23705d"/><path d="M0 450L56 340 112 450ZM188 450L244 340 300 450Z" fill="#44a184"/>'+
    '</g>'+jw+'<g transform="translate(70 0)">'+
    '<rect x="18" y="300" width="12" height="160" fill="#b23a24"/><circle cx="24" cy="292" r="30" fill="#2f7a52"/><circle cx="40" cy="330" r="20" fill="#2f7a52"/>'+
    '<rect x="270" y="300" width="12" height="160" fill="#b23a24"/><circle cx="276" cy="292" r="30" fill="#2f7a52"/><circle cx="260" cy="330" r="20" fill="#2f7a52"/></g>'+'<g transform="translate(70 0)">'+fold('j')+'</g>',440);
  // 좀비: 노란 검역기(배가 전염병을 알릴 때 다는 깃발) 바탕에 검정 생물학적 위험 표시와 위아래 경고 띠
  const tape=y=>'<g transform="rotate(-12 150 '+y+')"><rect x="-80" y="'+(y-22)+'" width="460" height="44" fill="#1e2418"/>'+Array.from({length:16},(_,i)=>'<path d="M'+(-80+i*32)+' '+(y-22)+'h16l-22 44h-16z" fill="#d7aa22"/>').join('')+'</g>';
  const ring=a=>'<circle cx="'+(150+44*Math.cos(a)).toFixed(1)+'" cy="'+(300+44*Math.sin(a)).toFixed(1)+'" r="50"/><circle cx="'+(150+58*Math.cos(a)).toFixed(1)+'" cy="'+(300+58*Math.sin(a)).toFixed(1)+'" r="33" fill="#d7aa22" stroke="none"/>';
  const zb=sv('z','<rect width="300" height="600" fill="#d7aa22"/>'+
    tape(90)+tape(520)+'<g fill="#1e2418" stroke="#d7aa22" stroke-width="6">'+[-Math.PI/2,Math.PI/6,5*Math.PI/6].map(ring).join('')+'</g><circle cx="150" cy="300" r="32" fill="none" stroke="#1e2418" stroke-width="10"/><circle cx="150" cy="300" r="13" fill="#d7aa22"/>'+fold('z'));
  // 대항해: 노을 띠가 걸린 하늘 아래 겹겹이 흐르는 물결과 그 위에 떠서 출렁이는 범선
  const wv=(y,c,a)=>{let d='M-300 '+y;for(let x=-300;x<600;x+=60)d+='q15 -'+a+' 30 0t30 0';return '<path class="cp-wv" style="animation-duration:'+(36/a).toFixed(1)+'s" d="'+d+'V620H-300Z" fill="'+c+'"/>';};
  const sa=sv('s','<rect width="300" height="600" fill="#2b5f86"/><rect y="200" width="300" height="120" fill="#d9a86a"/><circle cx="230" cy="250" r="34" fill="#ffe08a" opacity=".85"/>'+
    '<path d="M40 120l10 4 10-4M80 90l8 3 8-3M200 150l9 3 9-3" fill="none" stroke="#0f2a44" stroke-width="3" stroke-linecap="round"/>'+
    wv(300,'#2a6f9e',10)+
    '<g transform="translate(0 16)"><g class="cp-ship"><path d="M95 318h110l-18 30h-74z" fill="#6b3f22"/><path d="M95 318h110l-4 8h-102z" fill="#8a5a33"/><rect x="146" y="196" width="6" height="124" fill="#3b2416"/>'+
    '<path d="M152 204q48 40 2 104z" fill="#f4eee0"/><path d="M146 214q-40 34 -2 92z" fill="#e8dfc8"/><path d="M149 192l22 8-22 8z" fill="#c0392b"/><rect x="128" y="324" width="10" height="8" fill="#f4eee0"/><rect x="162" y="324" width="10" height="8" fill="#f4eee0"/></g></g>'+
    wv(340,'#225e8c',12)+wv(390,'#1b4f78',14)+wv(450,'#164265',16)+wv(520,'#11354f',18)+fold('s'));
  return {kr:kr,usa:usa,joseon:jo,zombie:zb,sail:sa};})();
// 비밀 모드 「대항해」: 나라가 아니라 따로 노는 레이스라 CAMPS에 넣지 않고, 열렸으면 무대 고르기 맨 끝에 판 하나로 붙인다
const SAIL_CP={tag:'비밀 모드',n:'대항해',sub:'폭풍을 뚫고 섬마을로 · 시간과의 레이스',intro:'백신이 상하기 전에 폭풍 해협을 뚫고 섬마을 세 곳을 지나 달려라. 암초를 스치면 시간이 붙고, 부딪히면 배가 상한다.'};
function stepCamp(){const ids=Object.keys(CAMPS).filter(campOn).concat(eggOn('sail')?['sail']:[]);let k=Math.max(0,ids.indexOf(camp));
  cine([{t:'무대 선택',h:'<div class="gx gx-camp">'+gxTop(0)+'<h2 class="gx-q">어느 나라를 이끌 것인가</h2><div class="gx-cpw">'+
    ids.map((id,i)=>{const C=CAMPS[id]||SAIL_CP;return '<button class="gx-cp" data-c="'+id+'" style="--i:'+i+'"><span class="gx-cp-art" aria-hidden="true">'+(CP_ART[id]||'')+'</span>'+
      '<span class="gx-cp-tx"><span class="gx-cp-tag">'+C.tag+'</span><b>'+C.n+'</b><span class="gx-cp-sub">'+C.sub+'</span><span class="gx-cp-in">'+C.intro+'</span>'+
      '<span class="gx-cp-go">이 무대로 ▶ <kbd class="gx-keys">Enter</kbd></span></span></button>';}).join('')+'</div></div>'}],
    {nav:false,cls:'gm',back:home,key:e=>{const n=ids.length;
      if(e.key==='ArrowRight'||e.key==='ArrowDown'){pick((k+1)%n,1);return true;}
      if(e.key==='ArrowLeft'||e.key==='ArrowUp'){pick((k-1+n)%n,1);return true;}
      if(gxEnter(e)){go();return true;}}});
  const P=[...document.querySelectorAll('.gx-cp')],hov=matchMedia('(hover:hover)').matches;
  const pick=(i,snd)=>{if(snd&&i!==k)gxSfx('tick',i);k=i;P.forEach((p,j)=>p.classList.toggle('on',j===i));};
  const go=()=>{const id=ids[k];gxSfx('click');if(id==='sail')return sailOpen();if(camp!==id){camp=id;bg=-1;}stepLeader();};
  P.forEach((p,i)=>{if(hov)p.onmouseenter=()=>pick(i,1);p.onclick=()=>{if(i===k)go();else pick(i,1);};});
  pick(k);}
// 지도자 능력치: 기본 지표에 주는 보정을 가운데 0선 기준 막대로
function gxStats(q,C){if(!q.e)return q.d?'<p class="gx-note">'+q.d+'</p>':'';
  const xs=VORD.map(k=>[k,Math.round(vDelta(k,q.e))]).filter(x=>x[1]);
  return '<dl class="gx-st">'+xs.map(([k,v],j)=>{const g=vGood(k,v),c=g===null?'z':g?'g':'b',w=Math.min(50,Math.abs(v)/15*50);
    return '<dt>'+vNameC(k,C)+'</dt><dd class="gx-bar"><i class="'+(v>0?'p':'n')+' '+c+'" style="width:'+w.toFixed(1)+'%;animation-delay:'+(120+j*60)+'ms"></i></dd><dd class="gx-v '+c+'">'+(v>0?'+':'−')+Math.abs(v)+'</dd>';}).join('')+'</dl>'+
    (q.t?'<div class="gx-note">운명 개입 +'+q.t+'</div>':'');}
// 2단계: 지도자. 아래 명단에서 고르면 왼쪽 무대에 크게 선다. 잠긴 비밀 인물은 실루엣과 힌트만 보인다.
// 명단 맨 앞의 '랜덤' 칸(처음 열면 여기가 골라져 있다. 앞쪽 인물만 몰리지 않게): 고르면 지금 고를 수 있는 지도자들 위를 룰렛처럼 돌다가 한 사람에게 멈추고 취임 준비로 간다
const GX_SIL='<svg class="gx-sil" viewBox="-4 -8 72 72" aria-hidden="true"><path d="M7 64C9 52 19 46 32 46S55 52 57 64Z"/><path d="M28 39.5V47.5H36V39.5Z"/><ellipse cx="32" cy="30" rx="11.5" ry="13.5"/><text x="32" y="37" text-anchor="middle">?</text></svg>';
function stepLeader(){if(camp==='zombie')return zgOpen();const C=CAMPS[camp],BGS=C.bg,RI=BGS.length,pool=BGS.map((q,i)=>i).filter(i=>!bgLock(BGS[i]));
  let k=bg>=0&&!bgLock(BGS[bg])?bg:RI,spin=false;
  // 화면 순서: 랜덤 칸이 맨 앞, 그 뒤로 명단 순서. k는 늘 명단 번호(랜덤은 RI)이고 방향키는 화면 순서(VO)를 따른다
  const VO=[RI].concat(BGS.map((q,i)=>i));
  const tiles='<button class="gx-t gx-rnd" data-i="'+RI+'" style="--i:0" aria-label="무작위 선택">'+GX_SIL+'<span class="gx-tn" aria-hidden="true">랜덤</span></button>'+BGS.map((q,i)=>{const L=bgLock(q);return '<button class="gx-t'+(L?' lk'+(L.used?' used':''):'')+'" data-i="'+i+'" style="--i:'+(i+1)+'" aria-label="'+(L&&!L.used?'잠긴 비밀 인물':q.n)+'">'+portrait(q.n,'100%',0,1)+'<span class="gx-tn" aria-hidden="true">'+(L&&!L.used?'???':q.n)+'</span></button>';}).join('');
  cine([{t:'지도자 선택',h:'<div class="gx gx-ld" data-c="'+camp+'">'+gxTop(1,C.n+' · '+BGS.length+'명')+
    '<div class="gx-stage"><div class="gx-wm" aria-hidden="true"></div><div class="gx-fig"></div></div><div class="gx-info" aria-live="polite"></div><div class="gx-roster" role="listbox" aria-label="지도자 명단">'+tiles+'</div></div>'}],
    {nav:false,cls:'gm',back:stepCamp,key:e=>{if(spin)return true;const n=BGS.length+1;
      const p=VO.indexOf(k);
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){draw(VO[(p+(e.key==='ArrowRight'?1:-1)+n)%n],1);return true;}
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){const D=[...root.querySelectorAll('.gx-t')],cols=D.filter(t=>t.offsetTop===D[0].offsetTop).length||n,j=p+(e.key==='ArrowDown'?cols:-cols);if(j>=0&&j<n)draw(VO[j],1);return true;}
      if(gxEnter(e)){ok();return true;}}});
  const root=document.querySelector('.gx-ld'),T=[...root.querySelectorAll('.gx-t')].sort((a,b)=>a.dataset.i-b.dataset.i),wm=root.querySelector('.gx-wm'),fig=root.querySelector('.gx-fig'),info=root.querySelector('.gx-info');
  // 명단: 한 줄에 다 들어가면 한 줄(조금 빡빡하면 칸을 줄여서라도), 아니면 위아래가 고르게 찬 두 줄. 칸 하나만 아랫줄로 떨어지는 일이 없게 한다
  const RO=root.querySelector('.gx-roster');
  const fitR=()=>{if(!RO.isConnected){removeEventListener('resize',fitR);return;}RO.style.removeProperty('--tile');RO.style.paddingLeft=RO.style.paddingRight='';
    if(getComputedStyle(RO).flexWrap!=='wrap')return;const t0=RO.querySelector('.gx-t');if(!t0)return;
    const n=RO.children.length,g=parseFloat(getComputedStyle(RO).columnGap)||6,tw=t0.getBoundingClientRect().width,base=tw/1.16,W=RO.clientWidth-32,one=n*(tw+g)-g;
    if(one<=W)return;if(W/one>=.8){RO.style.setProperty('--tile',(base*(W-n*g)/(n*tw)*1).toFixed(2)*1+'px');return;}
    const cols=Math.ceil(n/2),s=Math.min(1,(W-(cols-1)*g)/(cols*tw));RO.style.setProperty('--tile',(base*s).toFixed(2)+'px');
    const rowW=cols*tw*s+(cols-1)*g;RO.style.paddingLeft=RO.style.paddingRight=Math.max(16,(RO.clientWidth-rowW)/2-1)+'px';};
  fitR();addEventListener('resize',fitR);
  const ok=()=>{if(spin)return;if(k===RI)return roll();if(bgLock(BGS[k]))return gxSfx('lock');gxSfx('coin');bg=k;stepSetup();};
  // 금테가 명단 순서대로 한 칸씩 돌며 점점 느려지다가, 미리 뽑아 둔 사람의 칸에서 정확히 멈춘다(마지막에 건너뛰지 않는다)
  const roll=()=>{if(!pool.length)return;spin=true;root.classList.add('spin');const L=pool.length,fi=Math.floor(Math.random()*L),s0=Math.floor(Math.random()*L),
      N=L*Math.max(1,Math.ceil(16/L))+((fi-s0+L)%L)+1,seq=[];
    for(let s=0;s<N;s++){const r=N>1?s/(N-1):1;seq.push([pool[(s0+s)%L],34+Math.pow(r,3)*400]);}
    let t=0;seq.forEach(([i,dl],s)=>{t+=dl;setTimeout(()=>{if(!root.isConnected)return;const end=s===seq.length-1;
      T.forEach((x,j)=>x.classList.toggle('on',j===i));try{T[i].scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}wm.textContent=BGS[i].n;
      fig.innerHTML='<div class="gx-fig-in">'+portrait(BGS[i].n,'100%',0,1)+'</div>';gxSfx('tick',s%8);
      if(end){root.classList.remove('spin');draw(i);gxSfx('coin');setTimeout(()=>{if(root.isConnected){bg=i;stepSetup();}},1000);}},t);});};
  const draw=(i,snd)=>{if(snd&&i!==k)gxSfx('tick',i%8);k=i;
    T.forEach((t,j)=>{t.classList.toggle('on',j===i);t.setAttribute('aria-selected',j===i);});
    try{T[i].scrollIntoView({block:'nearest',inline:'nearest'});}catch(e){}
    if(i===RI){wm.textContent='?';fig.innerHTML='<div class="gx-fig-in gx-rand">'+GX_SIL+'</div>';
      info.innerHTML='<div class="gx-k">무작위 선택</div><h2 class="gx-nm">랜덤</h2><p class="gx-s">누가 나올지 모른다. 지금 고를 수 있는 '+pool.length+'명 가운데 한 사람이 무작위로 정해진다.</p>'+
        '<button class="gx-ok"'+(pool.length?'':' disabled')+'>운에 맡긴다 <kbd class="gx-keys">Enter</kbd></button>';
      info.scrollTop=0;const b=info.querySelector('.gx-ok');if(b&&!b.disabled)b.onclick=ok;return;}
    const q=BGS[i],L=bgLock(q);
    wm.textContent=L&&!L.used?'???':q.n;
    try{if(!reduceFx())wm.animate([{opacity:0,transform:'translateX(5%)'},{opacity:1,transform:'none'}],{duration:600,easing:'cubic-bezier(.2,.8,.2,1)'});}catch(e){}
    fig.innerHTML='<div class="gx-fig-in'+(L?' lk':'')+'">'+portrait(q.n,'100%',0,1)+(L?'<span>'+(L.used?'✓':'?')+'</span>':'')+'</div>';
    info.innerHTML=L?'<div class="gx-k">비밀 인물</div><h2 class="gx-nm">'+(L.used?q.n:'???')+'</h2><p class="gx-s">'+L.h+'</p><button class="gx-ok" disabled>'+(L.used?'이미 함께한 인물':'잠긴 인물')+'</button>'
      :'<div class="gx-k">'+(q.k||'')+(q.sec?' · 비밀 인물':'')+'</div><h2 class="gx-nm">'+q.n+'</h2><div class="gx-age">'+ageTxt(q)+'</div>'+(q.s?'<p class="gx-s">'+q.s+'</p>':'')+gxStats(q,C)+
       (q.once?'<div class="gx-note warn">단 한 번만 함께할 수 있다. 취임하는 순간 다시 잠긴다.</div>':'')+'<button class="gx-ok">이 지도자로 <kbd class="gx-keys">Enter</kbd></button>';
    info.scrollTop=0;const b=info.querySelector('.gx-ok');if(b&&!b.disabled)b.onclick=ok;};
  // 고른 칸을 한 번 더 누르면 바로 결정
  T.forEach((t,i)=>t.onclick=()=>{if(spin)return;if(i===k)ok();else draw(i,1);});
  draw(k);}
// 3단계: 결정 빈도 · 난이도 · 튜토리얼을 ◀ ▶로 고르고 취임한다
function stepSetup(){const C=CAMPS[camp],B=C.bg[bg];if(!B||bgLock(B))return stepLeader();
  const DD=['위기가 느리게 자란다','기본 난이도','위기가 한층 가혹하다','숨 돌릴 틈이 없다'];
  const ROWS=[{l:'결정 빈도',n:MODE.length,get:()=>mode,set:v=>{mode=v;},val:v=>MODE[v].n,d:v=>MODE[v].d},
    {l:'난이도',n:DIFF.length,get:()=>dif,set:v=>{dif=v;},val:v=>DIFF[v].n,d:v=>DD[v],pips:1},
    {l:'튜토리얼',n:2,get:()=>tutOn()?0:1,set:v=>{MEM.tut=v===0;msave();},val:v=>v?'끄기':'켜기',d:v=>v?'설명 없이 바로 시작한다':'처음이라면 추천'}];
  const verb=camp==='joseon'?'즉위한다':camp==='zombie'?'지휘를 맡는다':'취임한다',head=camp==='joseon'?'즉위 준비':camp==='zombie'?'출발 준비':'취임 준비';
  let cur=0;
  cine([{t:'게임 설정',h:'<div class="gx gx-su" data-c="'+camp+'">'+gxTop(2,C.n)+
    '<div class="gx-stage"><div class="gx-wm" aria-hidden="true">'+B.n+'</div><div class="gx-fig"><div class="gx-fig-in">'+portrait(B.n,'100%',0,1)+'</div></div><div class="gx-plate"><b>'+B.n+'</b><span>'+(B.k||'')+'</span></div></div>'+
    '<div class="gx-panel"><h2 class="gx-ph">'+head+'</h2><div class="gx-ph-s">마지막으로 규칙을 정한다</div><div class="gx-rows">'+
    ROWS.map((r,i)=>'<div class="gx-row"><div class="gx-rl">'+r.l+'</div><div class="gx-sel"><button class="gx-ar" data-d="-1" aria-label="'+r.l+' 앞으로">◀</button><div class="gx-val" aria-live="polite"></div><button class="gx-ar" data-d="1" aria-label="'+r.l+' 뒤로">▶</button></div><div class="gx-rd"></div></div>').join('')+'</div>'+
    '<button class="gx-ok" id="gxGo">'+verb+' <kbd class="gx-keys">Enter</kbd></button></div></div>'}],
    {nav:false,cls:'gm',back:stepLeader,key:e=>{
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){cur=(cur+(e.key==='ArrowDown'?1:-1)+ROWS.length)%ROWS.length;gxSfx('tick',cur);paint();return true;}
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){move(cur,e.key==='ArrowRight'?1:-1);return true;}
      if(gxEnter(e)){go();return true;}}});
  const RW=[...document.querySelectorAll('.gx-row')];
  const paint=()=>RW.forEach((el,i)=>{const r=ROWS[i],v=r.get();el.classList.toggle('on',i===cur);
    el.querySelector('.gx-val').innerHTML=r.val(v)+(r.pips?'<span class="gx-pips d'+v+'">'+Array.from({length:r.n},(_,j)=>'<i'+(j<=v?' class="f"':'')+'></i>').join('')+'</span>':'');
    el.querySelector('.gx-rd').textContent=r.d(v);
    const a=el.querySelectorAll('.gx-ar');a[0].disabled=v<=0;a[1].disabled=v>=r.n-1;});
  const move=(i,d)=>{const r=ROWS[i],v=r.get()+d;cur=i;if(v>=0&&v<r.n){r.set(v);gxSfx('tick',v+2);}paint();};
  const go=()=>{try{aInit();SFX.start();}catch(e){}cineClose();start();};
  RW.forEach((el,i)=>{el.onmouseenter=()=>{if(cur!==i){cur=i;paint();}};
    el.querySelectorAll('.gx-ar').forEach(b=>b.onclick=()=>move(i,+b.dataset.d));
    el.querySelector('.gx-val').onclick=()=>{const r=ROWS[i];r.set((r.get()+1)%r.n);cur=i;gxSfx('tick');paint();};});
  document.getElementById('gxGo').onclick=go;
  paint();}
// 도감: 만난 지도자와 받아 본 임기 평가

