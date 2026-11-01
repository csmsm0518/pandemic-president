/* ---------- 실시간 대결 1 · 연결(Firebase 실시간 DB를 SDK 없이 REST + 서버 이벤트로) ----------
   Firebase 프로젝트 pandemic-president-battle(DB는 싱가포르). 웹 키는 원래 공개용이다. 누가 무엇을 쓸 수 있는지는 DB 규칙(저장소의 firebase-rules.json)이 정한다.
   기기마다 익명 계정 하나(uid)를 만들어 이 기기에 둔다(pandemic_bt_auth_v1, 이 기기 기록 초기화 때 함께 지워진다).
   방 주인만 방 설정을 바꾸고, 각자 자기 칸(p/uid)만 쓰는 것은 규칙이 uid로 막는다.
   시험은 window.__BT_CFG로 주소를 바꿔 로컬 흉내 서버에 붙인다. */
const BT_CFG=Object.assign({key:'AIzaSyBBG5cII4iTrT-IEMT7yPKtyr6FGZwyBqc',db:'https://pandemic-president-battle-default-rtdb.asia-southeast1.firebasedatabase.app',
  id:'https://identitytoolkit.googleapis.com/v1',st:'https://securetoken.googleapis.com/v1'},window.__BT_CFG||{});
const BT_AK='pandemic_bt_auth_v1',BT_TS={'.sv':'timestamp'};
let BT_AU=null,BT_AP=null,BT_OFF=0;
const btJ=r=>r.ok?r.json():r.text().then(t=>{const e=new Error('bt '+r.status+' '+String(t).slice(0,120));e.st=r.status;throw e;});
const btNow=()=>Date.now()+BT_OFF;   // 서버 시각(내 신호를 쓸 때 돌아온 서버 시각과의 차이로 맞춘다)
// 익명 로그인: 이 기기에 둔 계정이 있으면 토큰만 새로 받고(같은 uid라 방에 다시 들어갈 수 있다), 없으면 새로 만든다
function btAuth(){const ok=a=>a&&a.uid&&a.it&&a.exp>Date.now()+120e3;
  if(ok(BT_AU))return Promise.resolve(BT_AU);
  if(!BT_AU){try{BT_AU=JSON.parse(localStorage.getItem(BT_AK)||'null');}catch(e){BT_AU=null;}if(ok(BT_AU))return Promise.resolve(BT_AU);}
  if(BT_AP)return BT_AP;
  const save=a=>{BT_AU=a;try{localStorage.setItem(BT_AK,JSON.stringify(a));}catch(e){}return a;};
  const up=()=>fetch(BT_CFG.id+'/accounts:signUp?key='+BT_CFG.key,{method:'POST',headers:{'Content-Type':'application/json'},body:'{"returnSecureToken":true}'}).then(btJ)
    .then(d=>save({uid:d.localId,it:d.idToken,rt:d.refreshToken,exp:Date.now()+(+d.expiresIn||3600)*1e3}));
  const rt=BT_AU&&BT_AU.rt;
  const p=rt?fetch(BT_CFG.st+'/token?key='+BT_CFG.key,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(rt)}).then(btJ)
      .then(d=>save({uid:d.user_id,it:d.id_token,rt:d.refresh_token,exp:Date.now()+(+d.expires_in||3600)*1e3}),up):up();
  BT_AP=p.then(a=>{BT_AP=null;return a;},e=>{BT_AP=null;throw e;});
  return BT_AP;}
// DB 읽고 쓰기. 토큰이 막 끝났으면(401) 한 번 새로 받아 다시 한다
function btReq(m,path,body,again){return btAuth().then(a=>fetch(BT_CFG.db+'/'+path+'.json?auth='+encodeURIComponent(a.it),body===undefined?{method:m}:{method:m,body:JSON.stringify(body)}))
  .then(btJ).catch(e=>{if(e&&e.st===401&&!again&&BT_AU){BT_AU.exp=0;return btReq(m,path,body,1);}throw e;});}
// 경로 'a/b/c'에 값을 넣은 새 나무(null이면 지운다)
function btSet(t,p,v){const k=String(p||'').split('/').filter(Boolean);if(!k.length)return v;
  const r=t&&typeof t==='object'?Object.assign({},t):{};let o=r;
  for(let i=0;i<k.length-1;i++){o[k[i]]=o[k[i]]&&typeof o[k[i]]==='object'?Object.assign({},o[k[i]]):{};o=o[k[i]];}
  if(v===null)delete o[k[k.length-1]];else o[k[k.length-1]]=v;return r;}
// 서버 이벤트로 path 아래를 계속 받는다. cb(나무, 'cancel'이면 권한이 없어짐). 끊기면 다시 붙는다
function btListen(path,cb){let es=null,dead=false,tree,retry=0;
  const open=()=>{if(dead)return;btAuth().then(a=>{if(dead)return;
      es=new EventSource(BT_CFG.db+'/'+path+'.json?auth='+encodeURIComponent(a.it));
      es.addEventListener('put',e=>{retry=0;try{const d=JSON.parse(e.data);tree=btSet(tree,d.path,d.data);}catch(x){return;}cb(tree);});
      es.addEventListener('patch',e=>{try{const d=JSON.parse(e.data),b=d.path==='/'?'':d.path;Object.keys(d.data||{}).forEach(k=>{tree=btSet(tree,b+'/'+k,d.data[k]);});}catch(x){return;}cb(tree);});
      es.addEventListener('auth_revoked',()=>{es.close();if(BT_AU)BT_AU.exp=0;setTimeout(open,300);});
      es.addEventListener('cancel',()=>{es.close();dead=true;cb(tree,'cancel');});
      es.onerror=()=>{if(es.readyState===2&&!dead)setTimeout(open,Math.min(8000,1000*(++retry)));};
    },()=>{if(!dead)setTimeout(open,Math.min(8000,1500*(++retry)));});};
  open();
  return {close(){dead=true;if(es)es.close();}};}
