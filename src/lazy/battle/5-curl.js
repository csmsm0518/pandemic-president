/* ---------- 실시간 대결 5 · 컬링 모드 ----------
   방 씨앗(seed)이 'C'로 시작하면 컬링 대결이다. 'C' + 엔드 수(1~9, A=10) + 팀당 돌 수(2~8). 대기실에서 방장이 정하면 seed='C84'처럼 두고,
   시작할 때 그 뒤에 무작위를 붙인다(DB 규칙을 바꾸지 않으려고 씨앗 칸을 같이 쓴다. 대통령 대결 씨앗은 소문자 · 숫자뿐이라 겹치지 않는다).
   들어온 순서로 두 명씩 1:1(1-2, 3-4), 남는 한 명은 인공지능과. 경기는 올림픽 컬링 경기(mgCurl)를 엔드마다 한 번씩 부른다.
   규칙: 첫 엔드 망치(마지막 돌)는 동전 던지기(방 씨앗으로 정해 두 기기가 같게). 점수를 낸 쪽은 다음 엔드에 망치를 넘기고, 블랭크 엔드(무득점)면 망치는 그대로.
   정한 엔드가 끝나 동점이면 연장 엔드(최대 3번, 그래도 같으면 무승부).
   엔드 사이에는 짝이 같은 엔드를 끝낼 때까지 기다린다(던진 돌 신호 칸 m이 하나뿐이라, 앞 엔드 마지막 돌을 상대가 받기 전에 덮어쓰지 않게).
   짝이 방을 나가거나 연결이 끊기면(45초) 그 뒤로는 인공지능이 대신 던진다.
   진행 g: r 판 · y 지금 엔드(0부터) · t 끝낸 엔드 수 · n 정한 엔드 수 · a 경기 중 1 · ex 엔드별 '나-상대,…' · lid 합계 '나:상대' · sc 내 점수 · fin 끝 · m 던진 돌 */
const CM_EC='123456789A',CM_XMAX=3,CM_INMAX=15e3,CM_GAP=150e3;
let CM=null;   // {code, rd, seed, cf{ends,stones}, opp{uid,n}|null, ham 다음 엔드 망치가 나인가, end 치른 엔드 수, xn 연장 번호, tot [나,상대], log [[나,상대]…], ph intro|count|play|gap|final, room, seen, net}
const cuIs=T=>String((T&&T.seed)||'')[0]==='C';
const btGk=T=>{const c=String((T&&T.seed)||'')[0];return c==='W'||c==='C'?c:'';};
function cmCfg(seed){const s=String(seed||''),e=CM_EC.indexOf(s[1])+1,n=+s[2];return {ends:e>=1?e:4,stones:n>=2&&n<=8?n:4};}
const cmSeed=c=>'C'+CM_EC[Math.max(1,Math.min(10,c.ends|0))-1]+Math.max(2,Math.min(8,c.stones|0));
function cmHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0)/4294967296;}
const cmCfgTx=c=>c.ends+'엔드 · 팀당 '+c.stones+'개';
// 짝의 진행 칸(이번 판 것만)
function cmG(u){const T=CM&&CM.room,p=T&&T.p&&T.p[u],g=p&&p.g;return g&&+g.r===CM.rd?g:null;}
function cmW(g){const b=BT;if(!b||!CM||b.code!==CM.code)return;btReq('PATCH','rooms/'+b.code+'/p/'+b.uid+'/g',g).catch(()=>{});
  if(CM.room&&CM.room.p&&CM.room.p[b.uid])CM.room=btSet(CM.room,'p/'+b.uid+'/g',Object.assign({},CM.room.p[b.uid].g||{},g));}
// 이번 판 선수들: 방에 있는 사람 + 한 번이라도 본 사람
function cmPl(){const C=CM,T=C.room,live=u=>!!(T&&T.p&&T.p[u]);if(T)btRound(T,C.rd).forEach(p=>{C.seen[p.uid]=p;});
  return Object.keys(C.seen).map(u=>Object.assign({uid:u},C.seen[u],{gone:!live(u)})).sort((a,b)=>(+a.j||0)-(+b.j||0));}

/* 시작: 3 · 2 · 1이 끝나면 btBegin이 부른다 */
function cmBegin(T){const b=BT;if(!b)return;b.view='wo';b.rd=+T.rd||0;
  const o=document.querySelector('.bt-bg');if(o)o.remove();BT_FROM=null;btHudOff();try{cineClose();}catch(e){}
  if(WO)woClose();if(CM)cmClose();
  const cf=cmCfg(T.seed),me=b.uid,L=btP(T).filter(p=>btLive(p)||p.uid===me),i=L.findIndex(p=>p.uid===me),j=i^1,
    opp=i>=0&&j<L.length?{uid:L[j].uid,n:L[j].n||'익명'}:null,ids=opp?[me,opp.uid].sort():[me],h=cmHash(String(T.seed)+'|'+b.rd+'|'+ids.join('|'));
  CM={code:b.code,rd:b.rd,seed:String(T.seed),cf:cf,opp:opp,ham:opp?(h<.5?ids[0]:ids[1])===me:h<.5,end:0,xn:0,tot:[0,0],log:[],ph:'',at:0,room:T,seen:{}};
  CM.ham0=CM.ham;
  CM.net={rd:b.rd,opp:opp||{uid:'',n:'인공지능'},ai:!opp,dead:0,m:u=>{const g=cmG(u);return g?g.m||'':'';},sendM:s=>cmW({m:s})};
  let bg=document.getElementById('woBg');if(!bg){bg=document.createElement('div');bg.id='woBg';bg.className='wo-bg';document.body.appendChild(bg);}
  bg.innerHTML='<div class="wo cm" role="region" aria-label="컬링 대결"><div class="wo-top"><b>🥌 컬링 대결<small>방 '+gEsc(b.code)+' · '+b.rd+'번째 판 · '+cmCfgTx(cf)+'</small></b><span id="woStep"></span><button type="button" id="woQuit">기권</button></div>'+
    '<div class="wo-strip" id="woStrip" aria-live="polite"></div><div class="wo-main" id="woMain"></div></div>';
  document.documentElement.classList.add('wo-on');
  let q=0,qt=0;document.getElementById('woQuit').onclick=function(){try{SFX.click();}catch(e){}
    if(!q){q=1;this.textContent='정말 기권?';this.classList.add('x');clearTimeout(qt);qt=setTimeout(()=>{q=0;const el=document.getElementById('woQuit');if(el){el.textContent='기권';el.classList.remove('x');}},3000);return;}
    cmQuit();};
  cmW({r:b.rd,y:0,t:0,n:cf.ends,a:0,ex:'',lid:'0:0',sc:0});
  try{lzLoad('wcurl').catch(()=>{});}catch(e){}
  CM.iv=setInterval(cmTick,300);cmIntro();}
function cmClose(){if(!CM)return;clearInterval(CM.iv);CM=null;const bg=document.getElementById('woBg');if(bg)bg.remove();document.documentElement.classList.remove('wo-on');}
function cmQuit(){if(!CM)return;cmW({fin:1,a:0,ex:CM.log.map(e=>e.join('-')).join(',')+(CM.log.length?',':'')+'기권',lid:CM.tot.join(':')});cmClose();if(BT)btLeave();}
// 방 소식(woRoom이 넘겨준다). 방이 닫혀도 혼자(인공지능과) 끝까지 할 수 있다
function cmRoom(T){if(!CM)return;CM.room=T||null;cmStrip();cmTick();if(CM.ph==='final'){const o=document.getElementById('cmOth');if(o)o.innerHTML=cmOthers();}}
// 다른 짝들의 결과(3~4명일 때). 결과 화면에서 방 소식이 올 때마다 다시 그린다
function cmOthers(){const C=CM,me=BT_AU&&BT_AU.uid,P=cmPl().filter(p=>p.uid!==me&&(!C.opp||p.uid!==C.opp.uid));
  return P.length?'<div class="wo-all"><div><span>다른 경기</span>'+P.map(p=>{const g=p.g||{};return '<i>'+gEsc(p.n||'익명')+' <small>'+(g.fin?'끝 · ':p.gone?'나감 · ':'진행 중 · ')+gEsc(String(g.lid||'0:0').replace(':',' : '))+'</small></i>';}).join('')+'</div></div>':'';}
const cmMain=h=>{const m=document.getElementById('woMain');if(m)m.innerHTML=h;return m;};
const cmEndName=k=>k<CM.cf.ends?(k+1)+'엔드':'연장 '+(k-CM.cf.ends+1);
// 짝이 아직 있나(방에 있고 신호가 살아 있나)
function cmOppOn(){const C=CM;if(!C.opp)return false;const T=C.room,p=T&&T.p&&T.p[C.opp.uid];return !!p&&btLive(p);}
function cmStrip(){const el=document.getElementById('woStrip');if(!el||!CM)return;const C=CM,me=BT_AU&&BT_AU.uid,P=cmPl();
  // 들어온 순서로 짝을 묶어 '가 vs 나' 칸으로 보여 준다
  const on=P.filter(p=>!p.gone||p.uid===me);
  const chip=p=>{const g=p.g||{},t=+g.t||0;let s,c='';
    if(g.fin){s='끝 · '+String(g.lid||'').replace(':',' : ');c='ok';}else if(p.gone){s='나감';c='off';}else if(!btLive(p)){s='연결 끊김';c='off';}
    else if(g.a){s=cmEndNameOf(+g.y||0,+g.n||C.cf.ends)+' 중 · '+String(g.lid||'0:0').replace(':',' : ');c='run';}else s=(t?t+'엔드 끝 · '+String(g.lid||'0:0').replace(':',' : '):'준비');
    return '<span class="wo-c '+c+(p.uid===me?' me':'')+'"><b>'+gEsc(p.n||'익명')+'</b><small>'+s+'</small></span>';};
  el.innerHTML=on.map(chip).join('');
  const st=document.getElementById('woStep');if(st)st.textContent=C.ph==='final'?'경기 끝':cmEndName(C.end)+(C.end<C.cf.ends?' / '+C.cf.ends:'');}
const cmEndNameOf=(y,n)=>y<n?(y+1)+'엔드':'연장 '+(y-n+1);
// 점수판: 엔드마다 점수(망치를 쥔 엔드는 점), 합계
function cmBoard(){const C=CM,n=Math.max(C.cf.ends,C.log.length),me=gEsc(String(NICK||'나').slice(0,8)),op=gEsc(C.opp?String(C.opp.n).slice(0,8):'인공지능');
  const H=[];let h=C.ham0;for(let k=0;k<n;k++){H.push(h);const e=C.log[k];if(e){if(e[0])h=false;else if(e[1])h=true;}}
  const cell=(k,s)=>{const e=C.log[k],hm=k<=C.end&&(s?H[k]:!H[k]);return '<td class="'+(k===C.end&&C.ph!=='final'?'now':'')+'">'+(e?e[s?0:1]:'')+(hm?'<i class="cm-h" title="망치">●</i>':'')+'</td>';};
  return '<div class="cm-sbw"><table class="cm-sb"><tr><th></th>'+Array.from({length:n},(_,k)=>'<th>'+(k<C.cf.ends?k+1:'X'+(k-C.cf.ends+1))+'</th>').join('')+'<th>합</th></tr>'+
    '<tr class="me"><td>'+me+'</td>'+Array.from({length:n},(_,k)=>cell(k,1)).join('')+'<td class="t">'+C.tot[0]+'</td></tr>'+
    '<tr><td>'+op+'</td>'+Array.from({length:n},(_,k)=>cell(k,0)).join('')+'<td class="t">'+C.tot[1]+'</td></tr></table></div><p class="cm-hl">● 그 엔드의 망치(마지막 돌)</p>';}

/* 안내 → 3 · 2 · 1 → 엔드 → (짝 기다림) → 다음 엔드 … → 결과 */
function cmIntro(){const C=CM;C.ph='intro';C.at=Date.now();const op=C.opp?gEsc(C.opp.n):'인공지능';
  cmMain('<div class="wo-in"><span class="wo-ic" aria-hidden="true">🥌</span><span class="wo-k">컬링 대결 · '+cmCfgTx(C.cf)+'</span><h2>나 vs '+op+'</h2>'+
    '<p class="wo-vs">첫 엔드 망치(마지막 돌): <b>'+(C.ham?'나':op)+'</b> · 동전 던지기</p>'+
    '<p class="wo-rule">엔드마다 팀당 <b>'+C.cf.stones+'개</b>씩 번갈아 던지고, 버튼에 가장 가까운 돌의 주인이 상대의 가장 가까운 돌보다 안쪽에 있는 돌 수만큼 점수를 낸다.<br>'+
    '점수를 낸 쪽은 다음 엔드에 <b>망치를 넘긴다</b>. 아무도 못 내면(블랭크 엔드) 망치는 그대로. <b>'+C.cf.ends+'엔드</b>가 끝나 동점이면 <b>연장 엔드</b>(최대 '+CM_XMAX+'번).</p>'+
    (C.opp?'':'<p class="wo-rule">짝이 없어 <b>인공지능</b>과 맞붙는다.</p>')+cmBoard()+'<div class="wo-wt" id="woWt"></div></div>');
  cmStrip();cmTick();}
function cmTick(){const C=CM;if(!C)return;const now=Date.now(),dt=now-C.at,el=document.getElementById('woWt');
  if(C.opp&&!C.net.dead&&!cmOppOn()&&dt>3000)C.net.dead=1;   // 짝이 나가거나 끊기면 그 뒤로는 인공지능이 대신 던진다
  const solo=!C.opp||C.net.dead,og=C.opp?cmG(C.opp.uid):null;
  if(C.ph==='intro'){const ok=solo||!!og;if(el)el.innerHTML=ok?'곧 시작해요':'<b>'+gEsc(C.opp.n)+'</b> 기다리는 중 · '+Math.max(0,Math.ceil((CM_INMAX-dt)/1000))+'초 안에 시작';
    if((ok&&dt>=4000)||dt>=CM_INMAX)cmCount();}
  else if(C.ph==='gap'){const ok=solo||(og&&(+og.t||0)>=C.end);if(el)el.innerHTML=ok?'다음 엔드로…':'<b>'+gEsc(C.opp.n)+'</b>이(가) 엔드를 마치는 중';
    if(ok||dt>=CM_GAP){if(!ok)C.net.dead=1;cmPlay();}}}
function cmCount(){const C=CM;C.ph='count';let n=3;
  const show=()=>{const e=document.getElementById('woWt');if(e)e.innerHTML='<b class="wo-cd">'+n+'</b>';try{SFX.beep(n);}catch(x){}};show();
  const t=setInterval(()=>{if(CM!==C||C.ph!=='count'){clearInterval(t);return;}n--;if(n>0)return show();clearInterval(t);cmPlay();},800);}
function cmPlay(){const C=CM;C.ph='play';C.at=Date.now();cmW({y:C.end,a:1});cmStrip();
  const m=cmMain('<div class="wo-g" id="woBox"></div>'),box=document.getElementById('woBox');
  Object.assign(C.net,{ends:C.cf.ends,stones:C.cf.stones,endNo:C.end,tot:C.tot.slice(),hammer:C.ham,xn:C.end>=C.cf.ends?C.end-C.cf.ends+1:0});
  let gone=0;const done=()=>{if(gone++||CM!==C)return;const o=MG_OUT;MG_OUT=null;cmEnd(o);};
  const run=()=>{if(CM!==C||!box.isConnected)return;MG_OUT=null;
    try{if(window.__cmFake)window.__cmFake(box,done,C.net);else mgCurl(box,done,C.net);}catch(x){done();setTimeout(()=>{throw x;});}};
  lzThen('wcurl',run);try{m.scrollIntoView({block:'start'});}catch(x){}}
function cmEnd(o){const C=CM,sc=(o&&o.sc)||{tm:'',n:0},e=[sc.tm==='u'?sc.n:0,sc.tm==='r'?sc.n:0];
  C.log.push(e);C.tot[0]+=e[0];C.tot[1]+=e[1];if(e[0])C.ham=false;else if(e[1])C.ham=true;C.end++;
  const over=C.end>=C.cf.ends&&(C.tot[0]!==C.tot[1]||C.end>=C.cf.ends+CM_XMAX);
  cmW({t:C.end,a:0,ex:C.log.map(x=>x.join('-')).join(','),lid:C.tot.join(':'),sc:C.tot[0]});
  window.scrollTo(0,0);const bg=document.getElementById('woBg');if(bg)bg.scrollTop=0;
  if(over)return cmFinal();
  C.ph='gap';C.at=Date.now();const x=C.end>=C.cf.ends,op=C.opp?gEsc(C.opp.n):'인공지능';
  cmMain('<div class="wo-in"><span class="wo-ic" aria-hidden="true">🥌</span><span class="wo-k">'+cmEndName(C.end-1)+' 끝</span><h2>'+(e[0]?'내가 '+e[0]+'점':e[1]?op+' '+e[1]+'점':'블랭크 엔드')+'</h2>'+
    (x?'<p class="wo-vs"><b>'+C.tot[0]+' : '+C.tot[1]+'</b> 동점 · 연장 엔드로!</p>':'')+cmBoard()+'<p class="wo-vs">다음 엔드 망치: <b>'+(C.ham?'나':op)+'</b></p><div class="wo-wt" id="woWt"></div></div>');
  cmStrip();cmTick();}
function cmFinal(){const C=CM;C.ph='final';const w=C.tot[0]>C.tot[1]?1:C.tot[0]<C.tot[1]?-1:0,op=C.opp?gEsc(C.opp.n):'인공지능';
  cmW({fin:1,a:0});try{SFX[w>0?'win':'record']();}catch(x){}
  const live=!!(BT&&BT.code===C.code&&BT.room),host=live&&BT.room.host===BT.uid,me=BT_AU&&BT_AU.uid;
  cmMain('<div class="wo-fin"><span class="wo-k">컬링 대결 · '+cmCfgTx(C.cf)+(C.log.length>C.cf.ends?' · 연장 '+(C.log.length-C.cf.ends):'')+'</span>'+
    '<h2>'+(w>0?'🏆 승리!':w<0?op+' 승리':'🤝 무승부')+'</h2><p class="wo-vs"><b>'+C.tot[0]+' : '+C.tot[1]+'</b> · 나 vs '+op+(C.net.dead&&C.opp?' (중간부터 인공지능이 대신)':'')+'</p>'+cmBoard()+
'<div id="cmOth">'+cmOthers()+'</div>'+
    '<div class="wo-acts">'+(live?'<button type="button" class="pri" id="woRoomB">'+(host?'대기실로 · 한 판 더':'대기실로')+'</button>':'')+'<button type="button" id="woOut">'+(live?'대결 나가기':'닫기')+'</button></div></div>');
  const q=document.getElementById('woQuit');if(q)q.style.display='none';
  const rb=document.getElementById('woRoomB');if(rb)rb.onclick=()=>{try{SFX.click();}catch(e){}cmClose();if(!BT)return;
    if(BT.room&&BT.room.host===BT.uid&&BT.room.st==='play')btReq('PATCH','rooms/'+BT.code,{st:'lobby'}).catch(()=>{});btRoom();};
  document.getElementById('woOut').onclick=()=>{try{SFX.back();}catch(e){}const c=C.code;cmClose();if(BT&&BT.code===c)btLeave();};
  cmStrip();}
// 시험 · 고장 찾기용
function cmInfo(){return CM?{ph:CM.ph,end:CM.end,tot:CM.tot.slice(),log:CM.log.map(e=>e.slice()),ham:CM.ham,ham0:CM.ham0,opp:CM.opp,dead:CM.net.dead,cf:CM.cf}:null;}
