/* ---------- 불러오기: 진행 중인 게임 저장 ---------- */
// 게임 중 저장하기를 누르면 이 기기(localStorage)에 저장한다(결정 화면·결과 화면에서만). 커리어가 끝나면 그 판의 저장은 지운다.
// 사건 원본(무대·위기·연쇄 사건 표)은 내용을 적지 않고 '어느 표의 어디'라는 주소로 적었다가, 불러올 때 같은 객체로 되돌린다
// (cur===UPR 같은 비교가 그대로 맞게). 위기마다 모습을 바꾼 사건은 원본과 위기 id로 다시 만든다.
// 같은 기기를 여러 사람이 쓸 수 있어 판마다 저장 칸을 따로 두고(최근 SV_MAX개), 원하면 4자리 비밀번호로 잠근다.
// 비밀번호는 원문 대신 해시만 적는다. 게임 안의 잠금일 뿐 암호화는 아니다(인적사항은 원래도 이 기기에 남는다).
const SAVES_KEY='pandemic_pres_saves_v1',SV_SEP='\u0001',SV_MAX=5;
let PINH='';
const pinHash=p=>{let h=2166136261;const s='pp-save:'+p;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h.toString(16);};let SVREG=null;
const svRoots=()=>({CAMPS:CAMPS,SCN:SCN,CH:CH,PATHS:PATHS,EV:EV,MILEV:MILEV,SP:SP,SKIN:SKIN,MODS:MODS,ADV:ADV,UPR:UPR,IMP:IMP,VARIANT:VARIANT,TRO:TRO});
function svReg(){if(SVREG)return SVREG;const m=new Map(),R=svRoots();
  const walk=(o,p,d)=>{if(m.has(o)||d>12)return;m.set(o,p);for(const k in o){const v=o[k];if(v&&typeof v==='object')walk(v,p+SV_SEP+k,d+1);}};
  for(const k in R)if(R[k]&&typeof R[k]==='object')walk(R[k],k,0);return SVREG=m;}
// bad: 저장할 수 없는 값(함수)이 있던 자리. 비어 있어야 정상이다.
function svEnc(v,bad,p,st){if(v===null||typeof v!=='object'){if(typeof v==='function'){bad.push(p);return null;}return v;}
  const r=svReg().get(v);if(r!==undefined)return {$r:r};
  st=st||new Set();if(st.has(v)){bad.push(p+' (순환)');return null;}st.add(v);let o;
  if(v instanceof Set)o={$s:[...v].map((x,i)=>svEnc(x,bad,p+'['+i+']',st))};
  else if(v._skin)o={$k:[svEnc(v._skin[0],bad,p+'.원본',st),v._skin[1]]};
  else if(Array.isArray(v))o=v.map((x,i)=>svEnc(x,bad,p+'.'+i,st));
  else{o={};for(const k in v)o[k]=svEnc(v[k],bad,p+'.'+k,st);}
  st.delete(v);return o;}
function svDec(v){if(v===null||typeof v!=='object')return v;if(Array.isArray(v))return v.map(svDec);
  if(typeof v.$r==='string'){const s=v.$r.split(SV_SEP);let o=svRoots()[s[0]];for(let i=1;i<s.length&&o;i++)o=o[s[i]];return o;}
  if(v.$s)return new Set(v.$s.map(svDec));
  if(v.$k)return skinOf(svDec(v.$k[0]),v.$k[1]);
  const o={};for(const k in v)o[k]=svDec(v[k]);return o;}
function svList(){try{const a=JSON.parse(localStorage.getItem(SAVES_KEY)||'[]');return Array.isArray(a)?a:[];}catch(e){return [];}}
function svPut(a){for(let k=0;k<3;k++){try{localStorage.setItem(SAVES_KEY,JSON.stringify(a));return true;}catch(e){if(a.length<=1)return false;a=a.slice(0,-1);}}return false;}   // 자리가 모자라면 가장 오래된 칸부터 버린다
function svSave(at){if(!CAR||CAR.done||!S||!RUN)return false;try{const bad=[];
  const G={S:S,pool:pool,cur:cur,last:last,tally:tally,chron:chron,queue:queue,base:base,deaths:deaths,yd:yd,MOD:MOD,tok:tok,streak:streak,lastT:lastT,lastO:lastO,
    peakI:peakI,hist:hist,adv:adv,CAR:CAR,TH:TH,SEEN:SEEN,YS:YS,yTally:yTally,cDeaths:cDeaths,covD:covD,SEENT:SEENT,SEENN:SEENN,banner:banner,pendingNews:pendingNews,LOG:LOG,RUN:RUN};
  const d={v:1,id:RUN.id,at:at,t:Date.now(),camp:camp,bg:bg,mode:mode,dif:dif,nick:NICK,pf:PF,pin:PINH,el:Date.now()-T0,bn:!!cur&&bnSeen===cur,dt:MAP.dtgt,
    meta:{n:CP.n,who:CAR.bgn,term:CAR.term,year:Math.min(YRS,Math.floor(S.turn/PY)+1),jo:CP.id==='joseon',dif:DIFF[dif].n},g:svEnc(G,bad,'')};
  if(bad.length)console.warn('[저장] 저장할 수 없는 값',bad.slice(0,8));
  return svPut([d].concat(svList().filter(x=>x.id!==d.id)).slice(0,SV_MAX));}catch(e){return false;}}
function svDrop(id){svPut(svList().filter(x=>x.id!==id));}
const svSlots=()=>svList().filter(d=>d&&d.v===1&&CAMPS[d.camp]&&campOn(d.camp));
const svSum=d=>{const m=d.meta;return m.n+' · '+m.who+' · '+(m.jo?m.term+'번째 치세 ':m.term+'기 ')+m.year+'년차 · '+m.dif;};
const svTime=d=>{const w=new Date(d.t);return (w.getMonth()+1)+'/'+w.getDate()+' '+String(w.getHours()).padStart(2,'0')+':'+String(w.getMinutes()).padStart(2,'0');};
// 목록에 보일 주인: 닉네임, 없으면 가운데를 가린 이름
const svWho=d=>{if(d.nick&&d.nick!=='익명')return d.nick;const n=(d.pf&&d.pf.name)||'';return n.length>=2?n[0]+'*'.repeat(Math.max(1,n.length-2))+(n.length>2?n.slice(-1):''):'익명';};
// 메뉴의 '불러오기' 설명 한 줄. 저장이 없으면 null
function svMenuTxt(){const L=svSlots();if(!L.length)return null;const d=L[0];
  return L.length===1?svSum(d)+' · '+svTime(d)+(d.pin?' · 잠김':''):'저장된 게임 '+L.length+'개 · 가장 최근: '+d.meta.who+' '+svTime(d);}
// 불러오기 창: 저장 칸 목록 → (잠겼으면) 비밀번호 → 불러오기. 지우기는 두 번 눌러야 한다.
function svPicker(){let o=document.querySelector('.svp-bg');if(o)o.remove();
  o=document.createElement('div');o.className='sndp-bg svp-bg';document.body.appendChild(o);
  const close=()=>o.remove();o.onclick=e=>{if(e.target===o)close();};
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')close();});
  const head=t=>'<div class="sndp-h"><span>'+t+'</span><button class="sndp-x" aria-label="닫기">✕</button></div>';
  const list=()=>{const L=svSlots();
    if(!L.length){o.innerHTML='<div class="sndp svp" role="dialog" aria-label="불러오기">'+head('불러오기')+'<div class="svp-n" style="border:0;font-size:13px">저장된 게임이 없어요.<br>게임 중 왼쪽 아래(세로 화면은 오른쪽 위 ≡ 메뉴)의 <b>저장하기</b>로 저장할 수 있어요.</div></div>';o.querySelector('.sndp-x').onclick=close;return;}
    o.innerHTML='<div class="sndp svp" role="dialog" aria-label="불러오기">'+head('불러오기')+
      L.map(d=>'<div class="svp-r"><button class="svp-i" data-id="'+gEsc(d.id)+'"><b>'+gEsc(svSum(d))+'</b><small>'+gEsc(svWho(d))+' · '+svTime(d)+(d.pin?' · <span class="svp-lk">'+ICO2.lock+'잠김</span>':'')+'</small></button>'+
        '<button class="svp-del" data-del="'+gEsc(d.id)+'">지우기</button></div>').join('')+
      '<div class="svp-n">저장은 이 기기에만 남고, 최근 '+SV_MAX+'개까지 보관해요. 커리어가 끝나면 그 저장은 지워져요.</div></div>';
    o.querySelector('.sndp-x').onclick=close;
    o.querySelectorAll('.svp-i').forEach(b=>b.onclick=()=>{const d=L.find(x=>x.id===b.dataset.id);SFX.click();ask(d,()=>{close();svGo(d.id);});});
    o.querySelectorAll('.svp-del').forEach(b=>b.onclick=()=>{const d=L.find(x=>x.id===b.dataset.del);
      if(!b.classList.contains('arm')){SFX.click();b.classList.add('arm');b.textContent='정말 지우기';return;}
      ask(d,()=>{SFX.fire();svDrop(d.id);list();});});
    const f=o.querySelector('.svp-i');if(f)f.focus();};
  const ask=(d,then)=>{if(!d.pin)return then();
    o.innerHTML='<div class="sndp svp" role="dialog" aria-label="비밀번호">'+head('비밀번호')+'<div class="svp-pin"><p><b>'+gEsc(svWho(d))+'</b>님이 잠근 저장 기록이에요.<br>비밀번호 4자리를 넣어 주세요.</p>'+
      '<input id="svPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="비밀번호 4자리"><div class="svp-err" role="alert"></div>'+
      '<div class="svp-b"><button id="svBack">돌아가기</button><button id="svOk" class="pri">확인</button></div></div></div>';
    const inp=o.querySelector('#svPin'),er=o.querySelector('.svp-err');o.querySelector('.sndp-x').onclick=close;o.querySelector('#svBack').onclick=()=>{SFX.back();list();};
    const ok=()=>{if(pinHash(inp.value)===d.pin){then();return;}SFX.lock();er.textContent='비밀번호가 달라요.';inp.value='';inp.focus();};
    o.querySelector('#svOk').onclick=ok;inp.oninput=()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,4);er.textContent='';if(inp.value.length===4)ok();};
    inp.onkeydown=e=>{if(e.key==='Enter')ok();};inp.focus();};
  list();}
// ---- 게임 메뉴: 저장하기 · 저장하고 나가기 · 하야하기 ----
// 가로 화면은 왼쪽 상황판 아래에 두고, 세로 화면·라이트 모드는 오른쪽 위 ≡ 메뉴 안에 둔다.
// 저장은 결정 화면(고르기 전)과 결과 화면(계속을 누르기 전)에서만 된다(SVAT). 룰렛이 도는 동안과 다른 화면에서는 막는다.
let SVAT=null;
const ICO_MENU='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
const moreBtn=()=>'<button class="g-more" aria-label="게임 메뉴">'+ICO_MENU+'</button>';
const svActs=()=>'<div class="gs-act"><button data-sv="save">저장하기</button><button data-sv="exit">저장하고 나가기</button><button data-sv="quit" class="gs-quit">하야하기</button>'+
  '<button data-sv="pin" class="gs-pin">'+ICO2.lock+'<span>'+pinLabel()+'</span></button></div>';
// 작은 창(소리 설정과 같은 모양). 바깥을 누르거나 Esc·✕로 닫는다.
function pop(title,body){let o=document.querySelector('.svp-bg');if(o)o.remove();o=document.createElement('div');o.className='sndp-bg svp-bg';
  o.innerHTML='<div class="sndp svp" role="dialog" aria-label="'+title+'"><div class="sndp-h"><span>'+title+'</span><button class="sndp-x" aria-label="닫기">✕</button></div>'+body+'</div>';
  document.body.appendChild(o);const close=()=>o.remove();o.onclick=e=>{if(e.target===o)close();};o.querySelector('.sndp-x').onclick=close;
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')close();});o.close=close;return o;}
function svAct(k){if(k==='pin')return pinSet();if(!SVAT){eggToast('지금은 할 수 없어요. 결정 화면이나 결과 화면에서 다시 눌러 주세요.');return;}
  if(k==='quit')return quitAsk();
  if(!svSave(SVAT)){eggToast('저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.');return;}
  if(k==='exit'){SFX.back();return home();}
  SFX.coin();eggToast('저장했어요. 메인 화면의 <b>불러오기</b>에서 이어서 할 수 있어요.');}
function gameMenu(){const o=pop('게임 메뉴','<div class="gm-acts">'+[['save','저장하기','지금 이 순간을 이 기기에 저장한다'],['pin',pinLabel(),'이 판을 불러오거나 지울 때 물어볼 숫자 4자리'],['exit','저장하고 나가기','저장한 뒤 메인 화면으로 나간다'],['quit','하야하기','스스로 물러나 커리어를 끝낸다']]
    .map(x=>'<button data-k="'+x[0]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>').join('')+'</div>');
  o.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{o.close();svAct(b.dataset.k);});o.querySelector('[data-k]').focus();}
function quitAsk(){const o=pop('하야','<div class="svp-pin"><p>정말 하야하시겠습니까?<br>커리어가 지금 끝나고, 결말은 <b>스스로 하야했다</b>가 된다.</p><div class="svp-b"><button id="qNo">계속 다스린다</button><button id="qYes" class="gs-quit-b">하야한다</button></div></div>');
  o.querySelector('#qNo').onclick=()=>{SFX.back();o.close();};o.querySelector('#qNo').focus();
  o.querySelector('#qYes').onclick=()=>{o.close();SVAT=null;S.quit=1;SFX.fade();careerEnd('quit');};}// 불러오기 상자(메인 메뉴): 메뉴 바로 오른쪽(메뉴와 기록 보관소 사이)에 상자가 펼쳐지고, 기록 보관소는 오른쪽(세로 화면은 아래)으로 밀려난다.
// 고르면 금빛 셔터가 닫혔다 열리며 그 판으로 넘어간다(svGo).
function svPinForm(d){return '<div class="svp-pin"><p><b>'+gEsc(svWho(d))+'</b>님이 잠근 저장 기록이에요.<br>비밀번호 4자리를 넣어 주세요.</p>'+
  '<input class="svPin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="비밀번호 4자리"><div class="svp-err" role="alert"></div>'+
  '<div class="svp-b"><button class="svBack">돌아가기</button><button class="svOk pri">확인</button></div></div>';}
function svPinBind(root,d,then,back){const inp=root.querySelector('.svPin'),er=root.querySelector('.svp-err');
  const ok=()=>{if(pinHash(inp.value)===d.pin){then();return;}SFX.lock();er.textContent='비밀번호가 달라요.';inp.value='';inp.focus();};
  root.querySelector('.svBack').onclick=()=>{SFX.back();back();};root.querySelector('.svOk').onclick=ok;
  inp.oninput=()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,4);er.textContent='';if(inp.value.length===4)ok();};inp.onkeydown=e=>{if(e.key==='Enter')ok();};inp.focus();}
function svGo(id){const d=svList().find(x=>x.id===id);if(!d)return;SFX.start();
  yearFx(d.meta.jo?'다시 편전으로':'다시 집무실로',svSum(d),()=>svLoad(id));}
function ldPanel(){const row=document.querySelector('.cine .gx-row2');if(!row)return svPicker();
  let p=row.querySelector('.gx-lp');
  const lb=document.getElementById('mmLoad'),por=document.documentElement.dataset.ori==='p'&&!!lb;
  const close=()=>{const q=row.querySelector('.gx-lp');if(!q)return;q.classList.remove('on');row.classList.remove('ld');if(lb){lb.classList.remove('open');lb.setAttribute('aria-expanded','false');}setTimeout(()=>q.remove(),480);};
  if(p)return close();
  // 가로 화면은 메뉴 오른쪽에 상자가 밀고 들어오고, 세로 화면은 불러오기 칸 바로 밑으로 펼쳐진다
  p=document.createElement('section');p.className='gx-lp';p.id='gxLp';p.setAttribute('aria-label','불러오기');const mn=row.querySelector('.gx-menu');
  if(por)lb.after(p);else if(mn)mn.after(p);else row.prepend(p);
  if(lb){lb.setAttribute('aria-controls','gxLp');lb.setAttribute('aria-expanded','true');lb.classList.add('open');}
  if(por)setTimeout(()=>{if(p.isConnected)p.scrollIntoView({block:'nearest',behavior:'smooth'});},520);
  p.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){SFX.back();close();}});
  const head='<div class="gx-lp-h"><b>불러오기</b><button class="gx-lp-x" aria-label="불러오기 닫기">✕</button></div>';
  const list=()=>{const L=svSlots();
    p.innerHTML='<div class="gx-lp-in">'+head+(L.length?L.map(d=>'<div class="gx-lp-r"><button class="gx-lp-i" data-id="'+gEsc(d.id)+'"><b>'+gEsc(svSum(d))+'</b><small>'+gEsc(svWho(d))+' · '+svTime(d)+
        (d.pin?' · <span class="svp-lk">'+ICO2.lock+'잠김</span>':'')+'</small></button><button class="gx-lp-d" data-del="'+gEsc(d.id)+'">지우기</button></div>').join('')+
        '<p class="gx-lp-n">저장은 이 기기에만 남고, 최근 '+SV_MAX+'개까지 보관해요.</p>'
      :'<p class="gx-lp-n">저장된 게임이 없어요.<br>게임 중 왼쪽 아래(세로 화면은 오른쪽 위 ≡ 메뉴)의 <b>저장하기</b>로 저장할 수 있어요.</p>')+'</div>';
    p.querySelector('.gx-lp-x').onclick=()=>{SFX.back();close();};
    p.querySelectorAll('.gx-lp-i').forEach(b=>b.onclick=()=>{const d=L.find(x=>x.id===b.dataset.id);SFX.click();ask(d,()=>svGo(d.id));});
    p.querySelectorAll('.gx-lp-d').forEach(b=>b.onclick=()=>{const d=L.find(x=>x.id===b.dataset.del);
      if(!b.classList.contains('arm')){SFX.click();b.classList.add('arm');b.textContent='정말 지우기';return;}
      ask(d,()=>{SFX.fire();svDrop(d.id);list();});});
    const f=p.querySelector('.gx-lp-i');(f||p.querySelector('.gx-lp-x')).focus({preventScroll:true});};
  const ask=(d,then)=>{if(!d.pin)return then();p.innerHTML='<div class="gx-lp-in">'+head+svPinForm(d)+'</div>';
    p.querySelector('.gx-lp-x').onclick=()=>{SFX.back();close();};svPinBind(p,d,then,list);};
  list();requestAnimationFrame(()=>requestAnimationFrame(()=>{p.classList.add('on');row.classList.add('ld');}));}
// 판마다 저장 비밀번호: 저장하기 아래(세로 화면은 ≡ 메뉴)에서 걸고 바꾸고 없앤다. 이미 저장한 칸에도 바로 붙는다.
const pinLabel=()=>PINH?'저장 비밀번호 바꾸기':'저장 비밀번호 걸기';
function pinApply(h){PINH=h;if(RUN){const L=svList();const d=L.find(x=>x.id===RUN.id);if(d){d.pin=h;svPut(L);}}
  document.querySelectorAll('[data-sv="pin"] span,[data-k="pin"] b').forEach(x=>{x.textContent=pinLabel();});}
function pinSet(){const o=pop('저장 비밀번호','<div class="svp-pin"><p>이 판의 저장 기록을 불러오거나 지울 때 물어볼 숫자 4자리예요.'+(PINH?'<br>지금은 비밀번호가 걸려 있어요.':'')+'</p>'+
    '<input class="pnIn" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" aria-label="새 비밀번호 4자리"><div class="svp-err" role="alert"></div>'+
    '<div class="svp-b">'+(PINH?'<button class="pnOff">비밀번호 없애기</button>':'<button class="pnNo">취소</button>')+'<button class="pnOk pri">'+(PINH?'바꾸기':'걸기')+'</button></div></div>');
  const inp=o.querySelector('.pnIn'),er=o.querySelector('.svp-err');inp.oninput=()=>{inp.value=inp.value.replace(/\D/g,'').slice(0,4);er.textContent='';};
  const ok=()=>{if(!/^\d{4}$/.test(inp.value)){er.textContent='숫자 4자리로 넣어 주세요.';inp.focus();return;}pinApply(pinHash(inp.value));o.close();SFX.coin();eggToast('비밀번호를 걸었어요. 이 판의 저장 기록은 이 번호로만 열려요.');};
  o.querySelector('.pnOk').onclick=ok;inp.onkeydown=e=>{if(e.key==='Enter')ok();};
  const off=o.querySelector('.pnOff'),no=o.querySelector('.pnNo');if(no)no.onclick=()=>{SFX.back();o.close();};
  if(off)off.onclick=()=>{pinApply('');o.close();SFX.click();eggToast('비밀번호를 없앴어요.');};inp.focus();}
// 게임 안 명예의 전당: 시상대 1~3위를 누르면 그 아래에 세부 수치가 펼쳐진다(서버가 보낸 det)
const LBD_SN=[['a','지지율'],['e','경제'],['m','의료'],['saf','안전망'],['chk','견제'],['trn','투명성'],['c','유착',1],['u','갈등',1]];
function lbDet(r,rk){const d=r.det,dv=v=>v==null||v===''?'–':Number(v).toLocaleString('ko-KR');
  if(!d)return '<div class="lbd"><p class="lbd-p" style="margin:0">세부 수치는 기록 시트를 새 버전으로 배포한 뒤 끝난 커리어부터 보여요.</p></div>';
  const st=d.stat||{},P=d.part||[],D=d.dice||[],R=d.dir||[],T=d.tro||[],L=(k,v)=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>';
  const bar=([k,l,bad])=>{const v=st[k];if(v==null)return '';const g=bad?100-v:v,col=g>=66?'#3fc38f':g>=40?'#e3b341':'#e0604f';
    return '<div class="lbd-s"><span>'+l+'</span><i><s style="width:'+Math.max(0,Math.min(100,v))+'%;background:'+col+'"></s></i><b>'+Math.round(v)+'</b></div>';};
  return '<div class="lbd" aria-label="'+lbEsc(r.nick)+' 세부 수치"><div class="lbd-h">'+rk+'위 '+lbEsc(r.nick)+'의 마지막 순간</div><div class="lbd-g">'+LBD_SN.map(bar).join('')+'</div>'+
    '<p class="lbd-p" style="margin:0 0 6px"><b>점수 구성</b>임기 '+dv(P[0])+' · 선거 '+dv(P[1])+' · 업적과 그 밖 '+dv(P[2])+'</p><dl class="lbd-l">'+L('평균 임기 점수',d.avg==null?'–':d.avg)+
    L('대성공 · 성공',dv(D[0])+' · '+dv(D[1]))+L('실패 · 대실패',dv(D[2])+' · '+dv(D[3]))+L('권력 집중 선택',dv(R[0]))+L('견제·분산 선택',dv(R[1]))+L('업적 · 불명예',dv(T[0])+' · '+dv(T[1]))+L('내린 결정',dv(d.n)+'번')+'</dl>'+
    (d.camp||d.scen?'<p class="lbd-p"><b>겪은 위기</b>'+lbEsc([d.camp,d.scen].filter(Boolean).join(' · '))+'</p>':'')+(d.titles?'<p class="lbd-p"><b>임기 평가</b>'+lbEsc(d.titles)+'</p>':'')+'</div>';}function svLoad(id){const d=svList().find(x=>x.id===id);
  if(!d||d.v!==1||!CAMPS[d.camp]){svDrop(id);return home();}
  try{camp=d.camp;bg=d.bg;mode=d.mode;dif=d.dif;NICK=d.nick||NICK;if(d.pf)PF=Object.assign({school:'',name:'',phone:'',agree:false},d.pf);PINH=d.pin||'';
    cineClose();cfgApply();
    ({S,pool,cur,last,tally,chron,queue,base,deaths,yd,MOD,tok,streak,lastT,lastO,peakI,hist,adv,CAR,TH,SEEN,YS,yTally,cDeaths,covD,SEENT,SEENN,banner,pendingNews,LOG,RUN}=svDec(d.g));
    prev=null;snap=null;T0=Date.now()-(d.el||0);SHOWN=0;tfLast=null;alLast=null;lastFit={q:0,why:[]};lastS=1;
    setTroName();mapReset();MAP.tgt=S.i;MAP.dtgt=d.dt||0;mapStart();window.scrollTo(0,0);}
  catch(e){svDrop(id);HUB_MSG='저장된 게임을 불러오지 못했어요. 새 게임을 시작해 주세요.';return home();}
  bgmGame();histArm();
  // 게임이 바뀐 뒤(사건 표 등) 예전 저장본이 첫 화면에서 깨지면, 같은 오류가 되풀이되지 않게 그 저장본을 지우고 안내한다
  try{if(d.at==='nx')return goNext();   // 결과를 본 뒤 저장했으면 '계속'을 누른 것처럼 이어 간다
    bnSeen=d.bn?cur:null;ev();}
  catch(e){svDrop(id);HUB_MSG='이 저장본은 예전 게임 버전에서 만들어져 이어 할 수 없어요. 새 게임을 시작해 주세요.';return home();}}// 무대·결정 빈도에 따라 정해지는 값(새 게임과 불러오기가 함께 쓴다)
function cfgApply(){CP=CAMPS[camp];document.documentElement.dataset.camp=CP.id;YRS=CP.yrs;MAXT=CP.maxT;KN=Object.assign({},KN0,CP.lbl);PY=MODE[mode].py;TPT=12/PY;EVS=MODE[mode].evs;}

