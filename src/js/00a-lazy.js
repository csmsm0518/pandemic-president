/* ---------- 나중에 불러오는 조각(src/lazy) ----------
   가이드북·체육 미니게임·백신 슬래시·명예의 전당·문 소리는 첫 화면에서 받지 않는다. 처음 쓸 때, 또는 첫 화면이 뜨고 쉬는 틈에 받는다.
   조각 파일(lazy/이름.js)은 window.__ppLZ(이름, 코드, 디자인)를 부르기만 한다. 코드는 아래 lzRun 안에서 eval하므로
   예전 한 파일일 때처럼 이 큰 함수 안의 변수를 그대로 쓴다. 조각 목록·버전·지문(LZ_M)과, 조각 밖에서 부르는 함수의
   대신 부르기 함수(불러온 뒤 진짜를 부른다)는 build.py가 만들어 이 파일 앞에 붙인다.
---------- */
const LZ={x:{},p:{}};
function lzRun(__lzCode){return eval(__lzCode);}
const lzHex=b=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
// 조각이 스스로 자기를 등록한다. 지금 기다리는 조각이고 지문(SHA-256 앞 16자)이 맞을 때만 실행한다
window.__ppLZ=function(n,js,css){const P=LZ.p[n];if(!P||P.got||!LZ_M[n])return;P.got=1;
  const run=()=>{try{if(css){const st=document.createElement('style');st.dataset.lz=n;st.textContent=css;document.head.appendChild(st);}
      LZ.x[n]=lzRun(js)||{};P.res(LZ.x[n]);}catch(e){P.rej(e);}};
  let sub=null;try{sub=window.crypto&&crypto.subtle;}catch(e){}
  if(!sub||!window.TextEncoder)return run();
  sub.digest('SHA-256',new TextEncoder().encode(js)).then(b=>{if(lzHex(b).slice(0,16)===LZ_M[n].h)run();else{const e=new Error('lazy-ver');e.lzVer=1;P.rej(e);}},()=>run());};
// 한 파일 빌드(python build.py --single)는 조각을 <script id="lzd" type="application/json">에 넣어 둔다. 있으면 받지 않고 바로 쓴다
let LZ_D;
function lzInline(n){if(LZ_D===undefined){const el=document.getElementById('lzd');try{LZ_D=el?JSON.parse(el.textContent):null;}catch(e){LZ_D=null;}}return LZ_D&&LZ_D[n];}
function lzLoad(n){if(LZ.x[n])return Promise.resolve(LZ.x[n]);if(LZ.p[n])return LZ.p[n].pr;
  if(!LZ_M[n])return Promise.reject(new Error('no lazy '+n));
  const d=lzInline(n);
  if(d){try{if(d.css){const st=document.createElement('style');st.dataset.lz=n;st.textContent=d.css;document.head.appendChild(st);}
      LZ.x[n]=lzRun(d.js)||{};return Promise.resolve(LZ.x[n]);}catch(e){return Promise.reject(e);}}
  const P=LZ.p[n]={};P.pr=new Promise((res,rej)=>{P.res=res;P.rej=rej;});
  const s=document.createElement('script');s.src='lazy/'+n+'.js?v='+LZ_M[n].v;
  s.onerror=()=>P.rej(new Error('lazy-net'));s.onload=()=>{if(!P.got)P.rej(new Error('lazy-net'));};
  document.head.appendChild(s);
  // 실패하면 다음 부를 때 처음부터 다시 받는다
  P.pr.then(()=>s.remove(),()=>{s.remove();if(LZ.p[n]===P)delete LZ.p[n];});
  return P.pr;}
// 받는 동안 0.3초가 넘으면 아래에 '불러오는 중'을 띄우고, 실패하면 다시 시도(또는 새로고침) 단추를 보여 준다
function lzNote(h,btn,fn){let el=document.getElementById('lzNote');if(!h){if(el)el.remove();return;}
  if(!el){el=document.createElement('div');el.id='lzNote';el.className='lz-note';el.setAttribute('role','status');document.body.appendChild(el);}
  el.innerHTML='<span>'+h+'</span>'+(btn?'<button type="button">'+btn+'</button>':'');if(btn)el.querySelector('button').onclick=fn;}
// 조각 n을 받은 뒤 fn을 부른다(이미 있으면 바로). 받은 뒤 fn에서 난 오류는 예전처럼 화면 아래 오류 안내(window.onerror)로 보낸다
function lzThen(n,fn){if(LZ.x[n])return fn();
  const tm=setTimeout(()=>lzNote('불러오는 중…'),300);
  return lzLoad(n).then(()=>{clearTimeout(tm);lzNote('');try{return fn();}catch(e){setTimeout(()=>{throw e;});}},e=>{clearTimeout(tm);
    if(e&&e.lzVer)lzNote('게임이 새 버전으로 바뀌었어요.','새로고침',()=>location.reload());
    else lzNote('불러오지 못했어요. 인터넷 연결을 확인해 주세요.','다시 시도',()=>{lzNote('');lzThen(n,fn);});});}
function lzCall(n,f,a){return lzThen(n,()=>LZ.x[n][f].apply(null,a));}
// 첫 화면이 뜨고 2.5초 뒤부터 쉬는 틈에 하나씩 미리 받아 둔다(문 소리는 소리를 켤 때 받는다)
addEventListener('load',()=>setTimeout(function pre(){const n=Object.keys(LZ_M).find(k=>k!=='door'&&!LZ.x[k]&&!LZ.p[k]);if(!n)return;
  const go=()=>lzLoad(n).then(()=>setTimeout(pre,200),()=>{});window.requestIdleCallback?requestIdleCallback(go,{timeout:4000}):go();},2500));
