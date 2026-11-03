/* ---------- 실시간 대결 2 · 방과 대기실 ----------
   btOpen: 홈의 「실시간 대결」이 연다. 방 만들기 / 코드로 들어가기 → 대기실(2~4명) → 방장이 시작하면 3 · 2 · 1 뒤 모두 같은 판을 동시에 시작한다.
   방(rooms/코드 4자리): host 방장 uid · st lobby|play · rd 몇 번째 판 · seed 그 판의 씨앗 · md 결정 빈도(MODE 번호) · ct 만든 때 · t0 시작한 때
     p/uid: n 닉네임 · j 들어온 때 · bg 출발 인물 id · rdy 준비 · at 마지막 신호(15초마다, 45초 넘게 없으면 '연결 끊김')
            g 이번 판 진행 {r 판 번호, t 지난 결정 수, n 전체 결정 수, y 몇 년차, a 지지율, fin 끝남, sc 커리어 점수, lid 닮은 지도자, ex 결말}
   무대는 대한민국, 한 임기(5년 단임) · 난이도 보통. 출발 인물은 각자 고른다(잠긴 인물 · 한 번뿐인 인물은 뺀다).
   방장이 나가면 대기실이면 방이 닫히고, 판이 도는 중이면 방장 칸만 빠진다. */
const BT_MAX=4,BT_ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',BT_STALE=45e3,BT_LAST='pandemic_bt_last_v1';
let BT=null,BT_FROM=null;   // BT: {code, uid, room:방 나무, L:듣기, hb:신호 타이머, played:시작한 판 번호, view:entry|room|count|play|res|''}
const btNick=()=>String(NICK||'익명').slice(0,20);
const btBgs=()=>CAMPS.kr.bg.filter(q=>!q.god&&!q.once&&!bgLock(q));
const btMyBg=()=>{const L=btBgs(),k=MEM.btBg;return (L.find(q=>q.id===k)||L[0]||{id:''}).id;};
const btP=T=>Object.keys((T&&T.p)||{}).map(u=>Object.assign({uid:u},T.p[u])).sort((a,b)=>(+a.j||0)-(+b.j||0));
const btLive=p=>!p.at||btNow()-p.at<BT_STALE;
const btBgN=id=>{const q=CAMPS.kr.bg.find(x=>x.id===id);return q?q.n:'';};
const btErrTx=e=>e&&e.bt?e.bt:e&&e.st===401?'권한이 없어요. 잠시 뒤에 다시 해 주세요.':'연결하지 못했어요. 인터넷을 확인해 주세요.';
const btErr=s=>{const e=new Error(s);e.bt=s;return e;};
function btPanel(){let o=document.querySelector('.bt-bg');
  if(!o){o=document.createElement('div');o.className='sndp-bg bt-bg';
    o.innerHTML='<div class="sndp bt" role="dialog" aria-modal="true" aria-labelledby="btT"><div class="sndp-h"><span id="btT">실시간 대결</span><button type="button" class="sndp-x" aria-label="닫기">✕</button></div><div class="bt-body"></div></div>';
    document.body.appendChild(o);let dn=null;
    o.onpointerdown=e=>{dn=e.target;};o.onclick=e=>{if(e.target===o&&dn===o)btX();};o.querySelector('.sndp-x').onclick=btX;
    o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();btX();}});}
  return o.querySelector('.bt-body');}
// 창 닫기: 대기실에서 닫으면 방에서 나간다(닫힌 채 방에 남아 있다가 갑자기 판이 시작되지 않게)
function btX(){try{SFX.back();}catch(e){}if(BT&&(BT.view==='room'||BT.view==='count'))btLeave();btHide();}
function btHide(){const o=document.querySelector('.bt-bg');if(o)o.remove();if(BT&&BT.view!=='play'&&BT.view!=='res'&&BT.view!=='wo')BT.view='';
  const f=BT_FROM;BT_FROM=null;if(f&&f.isConnected)try{f.focus({preventScroll:true});}catch(e){}}
function btOpen(from){BT_FROM=from||null;if(BT&&BT.room&&BT.view!=='play')return btRoom();btEntry('');}
function btBusy(b){document.querySelectorAll('.bt-body button,.bt-body input,.bt-body select').forEach(x=>{if(b)x.setAttribute('disabled','');else x.removeAttribute('disabled');});}
function btShowErr(t){const e=document.getElementById('btErr');if(e)e.textContent=t||'';}

/* 첫 화면: 방 만들기 · 코드로 들어가기 */
function btEntry(msg){if(BT)BT.view='entry';const b=btPanel();let last='';try{last=localStorage.getItem(BT_LAST)||'';}catch(e){}
  b.innerHTML='<p class="bt-lead">2~4명이 한 방에 모여 <b>같은 판을 동시에</b> 겨뤄요. 방장이 <b>대통령 대결</b>(같은 사건 · 같은 주사위, 선택이 승부) · <b>동계올림픽</b>(4종목 메달 경쟁) · <b>컬링</b>(1:1, 엔드와 돌 수를 정해요)을 골라요.</p>'+
    '<div class="bt-tags"><i>🏛️ 대통령 대결 · 대한민국 5년 단임</i><i>⛸️ 동계올림픽 · 4종목</i><i>🥌 컬링 · 1:1 맞대결</i></div>'+
    '<button type="button" class="pri bt-mk" id="btMk">방 만들기</button>'+
    '<div class="bt-or"><span>또는 친구의 방 코드로</span></div>'+
    '<form class="bt-jf" id="btJf" autocomplete="off"><input id="btCode" class="bt-in" maxlength="4" placeholder="코드 4자리" aria-label="방 코드" autocapitalize="characters" autocorrect="off" spellcheck="false" value="'+gEsc(last)+'"><button type="submit" id="btJn">들어가기</button></form>'+
    '<div class="bt-err" id="btErr" role="alert">'+gEsc(msg||'')+'</div>'+
    '<p class="bt-note">닉네임 <b>'+gEsc(btNick())+'</b>(으)로 들어가요. 대결 판은 명예의 전당과 기록 시트에 남지 않아요.</p>';
  const inp=b.querySelector('#btCode');inp.oninput=()=>{const v=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);if(v!==inp.value)inp.value=v;};
  b.querySelector('#btMk').onclick=()=>{try{SFX.click();}catch(e){}btCreate();};
  b.querySelector('#btJf').onsubmit=e=>{e.preventDefault();try{SFX.click();}catch(x){}btJoin(inp.value);};
  try{b.querySelector('#btMk').focus({preventScroll:true});}catch(e){}}
function btCodeGen(){let s='';const a=new Uint32Array(4);try{crypto.getRandomValues(a);}catch(e){for(let i=0;i<4;i++)a[i]=Math.floor(DC_RAND0()*1e9);}
  for(let i=0;i<4;i++)s+=BT_ABC[a[i]%BT_ABC.length];return s;}
const btMe=()=>({n:btNick(),j:BT_TS,bg:btMyBg(),rdy:false,at:BT_TS});
function btCreate(){btBusy(1);btShowErr('');let tries=0;
  btAuth().then(a=>{const one=()=>{const code=btCodeGen();
      return btReq('GET','rooms/'+code+'/host').then(h=>{if(h){if(++tries>6)throw btErr('방을 만들지 못했어요. 다시 눌러 주세요.');return one();}
        const P={host:a.uid,st:'lobby',rd:0,md:1,seed:'',ct:BT_TS};P['p/'+a.uid]=btMe();
        return btReq('PATCH','rooms/'+code,P).then(()=>code);});};
    return one();})
  .then(code=>btEnter(code),e=>{btBusy(0);btShowErr(btErrTx(e));});}
function btJoin(raw){const code=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(code.length!==4)return btShowErr('방 코드 4자리를 넣어 주세요.');
  btBusy(1);btShowErr('');
  btAuth().then(a=>btReq('GET','rooms/'+code).then(T=>{
      if(!T||!T.host)throw btErr('그런 방이 없어요. 코드를 다시 확인해 주세요.');
      const mine=T.p&&T.p[a.uid];
      if(!mine&&T.st!=='lobby')throw btErr('이미 판이 시작된 방이에요. 끝나고 대기실로 돌아오면 들어갈 수 있어요.');
      if(!mine&&btP(T).filter(btLive).length>=BT_MAX)throw btErr('방이 꽉 찼어요(최대 '+BT_MAX+'명).');
      return (mine?btReq('PATCH','rooms/'+code+'/p/'+a.uid,{n:btNick(),rdy:false,at:BT_TS}):btReq('PUT','rooms/'+code+'/p/'+a.uid,btMe())).then(()=>code);}))
  .then(code=>btEnter(code),e=>{btBusy(0);btShowErr(btErrTx(e));});}
// 방에 들어간 뒤: 방을 계속 듣고, 15초마다 신호를 보낸다
function btEnter(code){if(BT)btStop(BT);try{localStorage.setItem(BT_LAST,code);}catch(e){}
  BT={code:code,uid:BT_AU.uid,room:null,played:-1,view:'room'};const me=BT;
  me.L=btListen('rooms/'+code,(T,why)=>{if(BT!==me)return;btOnRoom(T,why);});
  const beat=()=>{if(BT!==me)return;btReq('PUT','rooms/'+code+'/p/'+me.uid+'/at',BT_TS).then(v=>{if(typeof v==='number')BT_OFF=v-Date.now();},()=>{});};
  me.hb=setInterval(beat,15e3);beat();
  btPanel().innerHTML='<p class="bt-wait">방에 들어가는 중…</p>';}
function btStop(b){if(b.L)b.L.close();clearInterval(b.hb);clearInterval(b.rep);btHudOff();}
function btLeave(){if(!BT)return Promise.resolve();const b=BT;BT=null;btStop(b);const T=b.room;
  const others=btP(T).filter(p=>p.uid!==b.uid);
  const all=T&&T.host===b.uid&&(!others.length||T.st!=='play');
  return btReq('DELETE','rooms/'+b.code+(all?'':'/p/'+b.uid)).catch(()=>{});}
// 탭을 닫으면 대기실에서는 내 칸을 지운다(판이 도는 중이면 남겨 두어 '연결 끊김'으로 보인다)
addEventListener('pagehide',()=>{try{if(!BT||!BT_AU||BT.view==='play'||BT.view==='wo')return;const T=BT.room,host=T&&T.host===BT.uid,alone=btP(T).length<=1;
  fetch(BT_CFG.db+'/rooms/'+BT.code+(host&&(alone||T.st!=='play')?'':'/p/'+BT.uid)+'.json?auth='+encodeURIComponent(BT_AU.it),{method:'DELETE',keepalive:true});}catch(e){}});

/* 방 소식이 올 때마다 */
function btOnRoom(T,why){const b=BT;
  if(why==='cancel'||!T||!T.host||!(T.p&&T.p[b.uid])){const gone=!T||!T.host;b.room=T||null;
    if(b.view==='play'||b.view==='res'||b.view==='wo'){if(gone){if(BT_RES&&BT_RES.code===b.code)BT_RES.closed=1;BT=null;btStop(b);}btHudDraw();btResDraw();if(b.view==='wo')woRoom(gone?null:T);return;}
    BT=null;btStop(b);if(document.querySelector('.bt-bg'))btEntry(gone?'방이 닫혔어요.':'방에서 나왔어요.');return;}
  b.room=T;
  if(T.st==='play'&&(+T.rd||0)>b.played&&(b.view==='room'||b.view==='count')){b.played=+T.rd||0;return btCount(T);}
  if(b.view==='room'){if(!document.getElementById('btPl'))btRoom();else btRoomUpd();}
  if(b.view==='play')btHudDraw();
  if(b.view==='res')btResDraw();
  if(b.view==='wo')woRoom(T);}

/* 대기실 */
function btRoom(){BT.view='room';const b=btPanel(),me=BT.uid,T=BT.room||{};
  const L=btBgs(),my=((T.p||{})[me]||{}).bg||btMyBg();
  b.innerHTML='<div class="bt-cw"><span>방 코드</span><b class="bt-code" id="btCodeV">'+BT.code+'</b><button type="button" class="bt-cp" id="btCp">복사</button></div>'+
    '<p class="bt-hint" id="btHint"></p>'+
    '<div class="bt-pl" id="btPl" aria-live="polite"></div>'+
    '<div class="bt-gm" id="btGm"></div>'+
    '<div id="btBgW"><label class="bt-lb" for="btBg">내 출발 인물</label><select id="btBg" class="bt-sel">'+L.map(q=>'<option value="'+q.id+'"'+(q.id===my?' selected':'')+'>'+gEsc(q.n)+' — '+gEsc(q.k||'')+'</option>').join('')+'</select></div>'+
    '<div class="bt-md" id="btMd"></div>'+
    '<div class="bt-err" id="btErr" role="alert"></div>'+
    '<div class="bt-acts"><button type="button" id="btLv">나가기</button><button type="button" class="pri" id="btGo"></button></div>';
  b.querySelector('#btCp').onclick=function(){copyText(BT.code,this);};
  b.querySelector('#btBg').onchange=e=>{try{SFX.click();}catch(x){}MEM.btBg=e.target.value;msave();btReq('PATCH','rooms/'+BT.code+'/p/'+me,{bg:e.target.value,rdy:false}).catch(x=>btShowErr(btErrTx(x)));};
  b.querySelector('#btLv').onclick=()=>{try{SFX.back();}catch(e){}btLeave().then(()=>btEntry('방에서 나왔어요.'));};
  b.querySelector('#btGo').onclick=btGoClick;
  // 대기실에 들어오면 준비를 풀고, 고른 인물이 없으면 넣어 둔다
  const mine=(T.p||{})[me];if(mine&&(mine.rdy||!mine.bg))btReq('PATCH','rooms/'+BT.code+'/p/'+me,{rdy:false,bg:mine.bg||my}).catch(()=>{});
  btRoomUpd();}
function btCanStart(T){const P=btP(T).filter(btLive);return P.length>=2&&P.every(p=>p.bg&&(p.uid===T.host||p.rdy));}
function btRoomUpd(){const T=BT.room;if(!T)return;const me=BT.uid,host=T.host===me,P=btP(T),mine=T.p[me]||{};
  const pl=document.getElementById('btPl');if(!pl)return;
  pl.innerHTML=P.map(p=>{const live=btLive(p),nm=btBgN(p.bg);
    return '<div class="bt-pr'+(p.uid===me?' me':'')+(live?'':' off')+'"><span class="bt-pf">'+(nm?portrait(nm,40):'')+'</span><span class="bt-pn"><b>'+gEsc(p.n||'익명')+'</b>'+
      (p.uid===T.host?'<em class="bt-hb">방장</em>':'')+(p.uid===me?'<em class="bt-mb">나</em>':'')+'<small>'+gEsc(nm||'인물 고르는 중')+'</small></span>'+
      '<span class="bt-ps '+(!live?'x':p.uid===T.host?'h':p.rdy?'ok':'')+'">'+(!live?'연결 끊김':p.uid===T.host?'시작 담당':p.rdy?'준비 완료':'준비 중')+'</span></div>';}).join('')+
    Array.from({length:Math.max(0,BT_MAX-P.length)},()=>'<div class="bt-pr empty"><span class="bt-pf"></span><span class="bt-pn"><small>빈자리</small></span></div>').join('');
  const n=P.filter(btLive).length,ok=btCanStart(T);
  document.getElementById('btHint').textContent=host?(n<2?'친구에게 방 코드를 알려 주세요. 2명부터 시작할 수 있어요.':ok?'모두 준비됐어요. 시작하면 3초 뒤 모두 함께 시작해요.':'모두 준비 완료를 누르면 시작할 수 있어요.')
    :(mine.rdy?'준비 완료! 방장이 시작하기를 기다려요.':btGk(T)?'준비 완료를 눌러 주세요.':'인물을 고르고 준비 완료를 눌러 주세요.');
  const gk=btGk(T),wo=!!gk,cf=cmCfg(T.seed),gm=document.getElementById('btGm'),GM=[['','🏛️ 대통령 대결','대한민국 5년 단임 · 같은 사건과 주사위'],['W','⛸️ 동계올림픽','쇼트트랙 · 스키점프 · 컬링 · 아이스하키'],['C','🥌 컬링','1:1 맞대결 · 엔드와 돌 수를 정해요']],G0=GM.find(g=>g[0]===gk)||GM[0];
  // 컬링 설정: 엔드 수(1~10) · 팀당 돌 수(2~8). 정식 경기는 10엔드(또는 8엔드) · 팀당 8개
  const opt=(a,b,v,u)=>Array.from({length:b-a+1},(_,i)=>a+i).map(n=>'<option value="'+n+'"'+(n===v?' selected':'')+'>'+n+u+'</option>').join('');
  gm.innerHTML='<span class="bt-lb">게임</span>'+(host?'<div class="bt-seg">'+GM.map(g=>'<button type="button" data-g="'+g[0]+'" aria-pressed="'+(gk===g[0])+'">'+g[1]+'<small>'+g[2]+'</small></button>').join('')+'</div>'
    :'<p class="bt-mdv"><b>'+G0[1]+'</b> · '+(gk==='C'?cmCfgTx(cf):G0[2])+' · 방장이 정해요</p>')+
    (gk==='W'?'<p class="bt-wol">네 종목을 모두 함께 차례로 치르고, 종목마다 시상대에 올라요. 금메달이 많은 사람이 우승! 상대 · 바람 · 돌풍은 모두에게 똑같아요.</p>':'')+
    (gk==='C'?(host?'<div class="bt-cfg"><label><span>엔드 수</span><select id="btCuE" class="bt-sel">'+opt(1,10,cf.ends,'엔드')+'</select></label><label><span>엔드마다 팀당 돌</span><select id="btCuS" class="bt-sel">'+opt(2,8,cf.stones,'개')+'</select></label></div>':'')+
      '<p class="bt-wol">두 명씩 1:1(남는 한 명은 인공지능과). 첫 엔드 망치는 동전 던지기, 점수를 낸 쪽은 다음 엔드에 망치를 넘겨요. 정한 엔드가 끝나 동점이면 연장 엔드! 정식 경기는 10엔드 · 팀당 8개예요.</p>':'');
  gm.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}const k=b.dataset.g;if(k===gk)return;btReq('PATCH','rooms/'+BT.code,{seed:k==='C'?cmSeed(cf):k}).catch(x=>btShowErr(btErrTx(x)));});
  const cuSet=()=>{const e=document.getElementById('btCuE'),s=document.getElementById('btCuS');if(!e||!s)return;try{SFX.click();}catch(x){}
    btReq('PATCH','rooms/'+BT.code,{seed:cmSeed({ends:+e.value,stones:+s.value})}).catch(x=>btShowErr(btErrTx(x)));};
  ['btCuE','btCuS'].forEach(id=>{const e=document.getElementById(id);if(e)e.onchange=cuSet;});
  document.getElementById('btBgW').style.display=wo?'none':'';
  const md=T.md===0?0:1,mdEl=document.getElementById('btMd');mdEl.style.display=wo?'none':'';
  mdEl.innerHTML='<span class="bt-lb">결정 빈도</span>'+(host?'<div class="bt-seg">'+[1,0].map(k=>'<button type="button" data-k="'+k+'" aria-pressed="'+(md===k)+'">'+MODE[k].n+'<small>'+MODE[k].d+'</small></button>').join('')+'</div>'
    :'<p class="bt-mdv"><b>'+MODE[md].n+'</b> · '+MODE[md].d+' · 방장이 정해요</p>');
  mdEl.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}btReq('PATCH','rooms/'+BT.code,{md:+b.dataset.k}).catch(x=>btShowErr(btErrTx(x)));});
  const go=document.getElementById('btGo');
  if(host){go.textContent='시작하기';go.disabled=!ok;}else{go.textContent=mine.rdy?'준비 취소':'준비 완료';go.disabled=false;go.classList.toggle('pri',!mine.rdy);}
  const sel=document.getElementById('btBg');if(sel&&document.activeElement!==sel&&mine.bg&&sel.value!==mine.bg)sel.value=mine.bg;}
function btGoClick(){const T=BT&&BT.room;if(!T)return;const me=BT.uid;
  if(T.host!==me){try{SFX.click();}catch(e){}const r=!(T.p[me]||{}).rdy;btReq('PATCH','rooms/'+BT.code+'/p/'+me,{rdy:r,bg:(T.p[me]||{}).bg||btMyBg()}).catch(x=>btShowErr(btErrTx(x)));return;}
  if(!btCanStart(T))return;try{SFX.start();}catch(e){}
  const a=new Uint32Array(2);try{crypto.getRandomValues(a);}catch(e){a[0]=Date.now();a[1]=Math.floor(DC_RAND0()*1e9);}
  document.getElementById('btGo').disabled=true;
  btReq('PATCH','rooms/'+BT.code,{st:'play',rd:(+T.rd||0)+1,seed:(woIs(T)?'W':cuIs(T)?cmSeed(cmCfg(T.seed)):'')+a[0].toString(36)+a[1].toString(36),t0:BT_TS}).catch(x=>{btShowErr(btErrTx(x));btRoomUpd();});}

/* 3 · 2 · 1 */
function btCount(T){BT.view='count';const b=btPanel(),P=btP(T).filter(btLive);
  b.innerHTML='<div class="bt-cd"><span class="bt-cd-k">'+T.rd+'번째 판 · '+(woIs(T)?'⛸️ 동계올림픽 4종목':cuIs(T)?'🥌 컬링 · '+cmCfgTx(cmCfg(T.seed)):MODE[T.md===0?0:1].n)+'</span><b id="btCdN">3</b><p>'+P.map(p=>gEsc(p.n||'익명')).join(' · ')+'</p><small>'+(woIs(T)?'같은 얼음, 같은 바람. 금메달은 누구에게?':cuIs(T)?'하우스 한가운데를 차지하는 쪽이 이긴다.':'같은 위기, 같은 주사위. 누가 더 나은 대통령일까요?')+'</small></div>';
  let n=3;const me=BT;const t=setInterval(()=>{if(BT!==me||me.view!=='count'){clearInterval(t);return;}n--;const el=document.getElementById('btCdN');
    if(n>0){if(el)el.textContent=n;try{SFX.click();}catch(e){}return;}clearInterval(t);btBegin(me.room||T);},1000);
  try{SFX.click();}catch(e){}}
