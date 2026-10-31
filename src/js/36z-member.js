/* ---------- 회원 로그인 ---------- */
// 첫 화면 맨 위에서 비회원(기본) · 회원 로그인을 고른다. 회원은 아이디 · 비밀번호로 들어오고, 학교 · 이름 · 닉네임 · 전화번호를 매번 적지 않는다.
// 회원 정보는 기록 시트 서버(Apps Script, kind: 'member')의 비공개 탭에 있고, 비밀번호는 서버에서도 지문으로만 남는다.
// 이 기기에는 아이디 · 로그인 토큰 · 학교 · 이름 · 닉네임만 둔다(전화번호는 두지 않는다). 토큰은 서버가 정한 날까지 쓰고, 끝나면 다시 로그인한다.
// 회원으로 한 판은 기록에 아이디와 토큰이 함께 가고, 서버가 토큰을 확인한 뒤에만 회원으로 묶는다(명예의 전당에서 기기가 달라도 한 사람)
const AC_KEY='pandemic_member_v1';
let AC_MODE='in',AC_FULL=null;   // in: 로그인 · up: 회원가입 · edit: 정보 고치기 · leave: 탈퇴 / AC_FULL: 고치기 직전 서버에서 받은 정보(전화번호 포함, 기기에 두지 않는다)
const AC_ERR={badid:['acId','아이디는 영문 소문자로 시작하는 4~16자(소문자 · 숫자 · _)로 적어 주세요.'],badpw:['acPw','비밀번호는 6~64자로 적어 주세요.'],
  exists:['acId','이미 있는 아이디예요. 다른 아이디를 적거나 로그인해 주세요.'],nomatch:['acPw','아이디나 비밀번호가 맞지 않아요.'],
  locked:['acPw','비밀번호를 여러 번 틀려서 15분 동안 막혔어요. 잠시 뒤에 다시 해 주세요.'],expired:['acId','로그인이 끝났어요. 다시 로그인해 주세요.'],
  consent:['acAgree','개인정보 수집·이용에 동의해야 가입할 수 있어요.'],busy:['acId','지금 들어오는 사람이 많아요. 잠시 뒤에 다시 해 주세요.'],
  net:['acId','서버에 닿지 않아요. 인터넷 연결을 확인하거나 비회원으로 시작해 주세요.'],
  school:['acSchool','학교를 적어 주세요.'],name:['acName','이름을 적어 주세요.'],phone:['acPhone','전화번호를 010-0000-0000 형식으로 적어 주세요. 상품이 필요 없으면 비워 두세요.']};
function acGet(){try{const o=JSON.parse(localStorage.getItem(AC_KEY)||'null');return o&&o.id&&o.token&&(!o.exp||o.exp>Date.now())?o:null;}catch(e){return null;}}
function acPut(o){try{if(o)localStorage.setItem(AC_KEY,JSON.stringify(o));else localStorage.removeItem(AC_KEY);}catch(e){}}
const acTok=()=>{const a=acGet();return a&&PF&&a.id===PF.mid?a.token:'';};   // 기록에 붙여 보낼 토큰(지금 판의 회원과 같을 때만)
// 서버에 묻고 JSON 답을 받는다(기록 상자와 달리 답을 읽어야 해서 no-cors가 아니다). 20초 안에 답이 없으면 net
function acApi(op,o){if(!SHEET_URL||IN_ART)return Promise.resolve({ok:false,err:'net'});
  const ac=window.AbortController?new AbortController():null,tm=setTimeout(()=>{try{ac&&ac.abort();}catch(e){}},20000);
  return fetch(SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(Object.assign({kind:'member',op:op},o)),signal:ac?ac.signal:undefined})
    .then(r=>r.json()).catch(()=>({ok:false,err:'net'})).then(r=>{clearTimeout(tm);return r&&typeof r==='object'?r:{ok:false,err:'net'};});}
const acEsc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function acBind($){const tg=$('pfTabG'),tm=$('pfTabM'),box=$('pfAcc');if(!tg||!box)return;
  if(IN_ART||!SHEET_URL){document.querySelector('.pf-tab').style.display='none';return;}
  const guest=[document.querySelector('.pf'),$('go'),$('pfNote')],mem=$('pfMem');
  const show=m=>{tg.classList.toggle('on',!m);tm.classList.toggle('on',m);tg.setAttribute('aria-selected',!m);tm.setAttribute('aria-selected',m);
    box.hidden=!m;guest.forEach(e=>{if(e)e.hidden=m;});
    // 비회원 쪽 '지난번 정보' 안내는 회원 쪽에서 숨겼다가, 돌아오면 원래대로
    if(mem){if(m){mem.dataset.d=mem.style.display;mem.style.display='none';}else if(mem.dataset.d!==undefined)mem.style.display=mem.dataset.d;}
    if(m){AC_MODE=(acGet()||acLastId())?'in':'up';acDraw($);}};   // 처음 온 사람은 회원가입 화면부터, 예전에 로그인한 적이 있으면 로그인
  tg.onclick=()=>{try{SFX.click();}catch(e){}show(false);};
  tm.onclick=()=>{try{SFX.click();}catch(e){}show(true);};
  // 회원 쪽(왼쪽 탭)이 기본 화면이다. 이 기기에서 로그인해 둔 회원이면 '이 계정으로 시작'이 먼저 보인다
  show(true);}
function acDraw($){const box=$('pfAcc'),me=acGet(),M=AC_MODE;
  const row=(id,lb,attr,hint,val)=>'<div class="pf-row"><label for="'+id+'">'+lb+(hint?' <span>'+hint+'</span>':'')+'</label><input id="'+id+'" '+attr+' autocomplete="off"'+(val?' value="'+acEsc(val)+'"':'')+'></div>';
  const prof=(p)=>row('acSchool','학교 <b>*</b>','maxlength="30" placeholder="예: 용인외대부고"','',p&&p.school)+row('acName','이름 <b>*</b>','maxlength="20" placeholder="실명"','',p&&p.name)
    +row('acNick','닉네임','maxlength="20" placeholder="예: 백신 대통령"','명예의 전당에 보이는 이름 · 비우면 익명',p&&p.nick)
    +row('acPhone','전화번호','type="tel" inputmode="tel" maxlength="13" placeholder="010-0000-0000"','선택 · 점수에 따른 상품을 받고 싶을 때만',p&&p.phone);
  const err='<div id="acErr" class="pf-err" role="alert"></div>';
  let h='';
  if(me&&M==='edit')h='<div class="pf-acc-t">'+acEsc(me.id)+' · 바꿀 정보를 고쳐 주세요.</div><div class="pf">'+prof(AC_FULL||me.prof)+err+'</div>'
    +'<button id="acGo" class="pri" type="button">고친 정보 저장</button><div class="pf-acc-sw"><button id="acBack" type="button" class="pf-rs">돌아가기</button></div>';
  else if(me&&M==='leave')h='<div class="pf-acc-me"><b>회원 탈퇴</b><br>'+acEsc(me.id)+' 계정과 학교 · 이름 · 닉네임 · 전화번호를 서버에서 바로 지워요. 이미 남은 게임 기록은 지워지지 않아요.</div><div class="pf">'
    +row('acPw','비밀번호 확인 <b>*</b>','type="password" maxlength="64"')+err+'</div><button id="acGo" class="pri" type="button">탈퇴하기</button><div class="pf-acc-sw"><button id="acBack" type="button" class="pf-rs">돌아가기</button></div>';
  else if(me)h='<div class="pf-acc-me"><b>'+acEsc(me.prof.name)+'</b>님('+acEsc(me.id)+') · '+acEsc(me.prof.school)+(me.prof.nick?'<br>명예의 전당에는 <b>'+acEsc(me.prof.nick)+'</b>(으)로 올라가요.':'')+'</div>'+err
    +'<button id="acGo" class="pri" type="button">이 계정으로 시작</button><div class="pf-acc-sw"><button id="acEdit" type="button" class="pf-rs">정보 고치기</button> · <button id="acOut" type="button" class="pf-rs">로그아웃</button> · <button id="acLeave" type="button" class="pf-rs">회원 탈퇴</button></div>';
  else{h='<div class="pf-seg"><button type="button" data-m="up"'+(M==='up'?' class="on"':'')+'>회원가입</button><button type="button" data-m="in"'+(M==='in'?' class="on"':'')+'>로그인</button></div><div class="pf">'
    +row('acId','아이디 <b>*</b>','maxlength="16" placeholder="영문 소문자로 시작 · 4~16자" autocapitalize="off" spellcheck="false"','',M==='in'?(acLastId()||''):'')
    +row('acPw','비밀번호 <b>*</b>','type="password" maxlength="64" placeholder="6자 이상"');
    if(M==='up')h+=row('acPw2','비밀번호 확인 <b>*</b>','type="password" maxlength="64"')+prof(null)
      +'<label class="pf-ok"><input type="checkbox" id="acAgree"><span>개인정보 수집·이용에 동의합니다 <b>*</b></span></label>'
      +'<details class="pf-d"><summary>무엇을 왜 모으나요?</summary><ul><li><b>모으는 것</b> · 아이디, 학교, 이름, 닉네임, 전화번호(적은 경우만), 게임 속 선택과 결과</li>'
      +'<li><b>쓰는 곳</b> · 사람들이 권력과 부패 앞에서 어떻게 선택하는지 알아보는 학생 탐구, 점수 상위자 상품 연락, 다음에 다시 적지 않고 들어오기</li>'
      +'<li><b>보이는 곳</b> · 명예의 전당에는 닉네임·학교·점수만 보여요. 아이디·이름·전화번호는 탐구 진행자만 보는 시트에 따로 보관해요.</li>'
      +'<li><b>비밀번호</b> · 서버에도 알아볼 수 없는 값(지문)으로만 남아요. 잊으면 건의사항함에 아이디를 적어 알려 주세요.</li>'
      +'<li><b>보관 기간</b> · 회원 탈퇴를 하면 바로 지워요. 탐구와 상품 지급이 끝나면 모두 지워요.</li></ul></details>';
    else h+='<div class="pf-acc-t">비밀번호를 잊었으면 비회원으로 들어가 메인 화면의 건의사항함에 아이디를 적어 알려 주세요.</div>';
    h+=err+'</div><button id="acGo" class="pri" type="button">'+(M==='up'?'가입하고 시작':'로그인')+'</button>';}
  box.innerHTML=h;
  const redraw=m=>{try{SFX.click();}catch(e){}AC_MODE=m;acDraw($);};
  box.querySelectorAll('.pf-seg button').forEach(b=>b.onclick=()=>redraw(b.dataset.m));
  // 고치기: 전화번호는 기기에 두지 않으므로 서버에서 지금 정보를 받아 칸을 채운다
  if($('acEdit'))$('acEdit').onclick=async()=>{const b=$('acEdit');b.disabled=true;const r=await acApi('me',{id:me.id,token:me.token});b.disabled=false;
    if(!r.ok){if(r.err==='expired'){acPut(null);AC_MODE='in';acDraw($);}const e=$('acErr');if(e){e.textContent=(AC_ERR[r.err]||AC_ERR.net)[1];e.style.display='block';}return;}
    AC_FULL=r.prof;redraw('edit');};
  if($('acLeave'))$('acLeave').onclick=()=>redraw('leave');
  if($('acBack'))$('acBack').onclick=()=>{AC_FULL=null;redraw('in');};
  if($('acOut'))$('acOut').onclick=()=>{acApi('logout',{id:me.id,token:me.token});acPut(null);redraw('in');};   // 서버 답을 기다리지 않는다(이 기기에서는 바로 나간다)
  const ph=$('acPhone');if(ph)ph.oninput=()=>{const d=ph.value.replace(/\D/g,'').slice(0,11);ph.value=d.length>7?d.slice(0,3)+'-'+d.slice(3,d.length-4)+'-'+d.slice(-4):d.length>3?d.slice(0,3)+'-'+d.slice(3):d;};
  box.querySelectorAll('input:not([type=checkbox])').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')$('acGo').click();});
  const go=$('acGo'),label=go.textContent,errEl=$('acErr');
  const at=(id,msg)=>{errEl.textContent=msg;errEl.style.display='block';try{($(id)||go).focus();}catch(e){}};
  const bad=k=>{const E=AC_ERR[k]||['acId','잠시 뒤에 다시 해 주세요.'];at(E[0],E[1]);};
  const busy=on=>{go.disabled=on;go.textContent=on?'확인하는 중…':label;};
  const fields=()=>({school:($('acSchool').value||'').trim().slice(0,30),name:($('acName').value||'').trim().slice(0,20),nick:($('acNick').value||'').trim().slice(0,20),phone:pfPhone($('acPhone').value)});
  const check=f=>!f.school?'school':!f.name?'name':f.phone===null?'phone':'';
  const keep=(id,r)=>{acPut({id:id,token:r.token||(me&&me.token),exp:r.exp||(me&&me.exp)||0,prof:{school:r.prof.school,name:r.prof.name,nick:r.prof.nick}});return r.prof;};
  go.onclick=async()=>{if(go.disabled)return;errEl.style.display='none';
    if(me&&M==='edit'){const f=fields(),c=check(f);if(c)return bad(c);busy(true);
      const r=await acApi('update',Object.assign({id:me.id,token:me.token},f));busy(false);
      if(!r.ok){if(r.err==='expired'){acPut(null);AC_MODE='in';acDraw($);return bad('expired');}return bad(r.field||r.err);}
      keep(me.id,r);AC_FULL=null;AC_MODE='in';acDraw($);return;}
    if(me&&M==='leave'){const pw=$('acPw').value||'';if(pw.length<6)return bad('badpw');busy(true);
      const r=await acApi('leave',{id:me.id,token:me.token,pw:pw});busy(false);
      if(!r.ok)return bad(r.err==='nomatch'?'nomatch':r.err);
      acPut(null);try{localStorage.removeItem(AC_LAST);}catch(e){}AC_MODE='in';acDraw($);try{eggToast('탈퇴했어요. 회원 정보를 서버에서 지웠어요.');}catch(e){}return;}
    if(me){busy(true);const r=await acApi('me',{id:me.id,token:me.token});busy(false);
      if(r.ok)return acEnter(me.id,keep(me.id,r));
      if(r.err==='net')return bad('net');
      acPut(null);AC_MODE='in';acDraw($);return bad('expired');}
    const id=($('acId').value||'').trim().toLowerCase(),pw=$('acPw').value||'';
    if(!/^[a-z][a-z0-9_]{3,15}$/.test(id))return bad('badid');
    if(pw.length<6)return bad('badpw');
    let r;
    if(M==='in'){busy(true);r=await acApi('login',{id:id,pw:pw});busy(false);}
    else{if(pw!==$('acPw2').value)return at('acPw2','비밀번호 확인이 달라요.');
      const f=fields(),c=check(f);if(c)return bad(c);
      if(!$('acAgree').checked)return bad('consent');
      busy(true);r=await acApi('signup',Object.assign({id:id,pw:pw,agree:1},f));busy(false);}
    if(!r.ok)return bad(r.field||r.err);
    try{localStorage.setItem(AC_LAST,id);}catch(e){}
    acEnter(id,keep(id,r));};}
const AC_LAST='pandemic_member_last_v1';   // 로그아웃한 뒤에도 아이디 칸은 채워 둔다
const acLastId=()=>{try{return localStorage.getItem(AC_LAST)||'';}catch(e){return '';}};
function acEnter(id,p){PF={school:p.school,name:p.name,phone:p.phone||'',agree:true,mid:id};NICK=p.nick||'익명';PINH='';
  try{aInit();SFX.coin();}catch(e){}viewSetup(hub);}
