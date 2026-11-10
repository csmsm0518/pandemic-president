/* ---------- 게임 안 명예의 전당 (리더보드) ---------- */
// leaderboard.html과 같은 Apps Script 주소(doGet)에서 순위를 받아 온다. 화면이 열려 있는 동안 15초마다 갱신.
function artBoard(o){o=o||{};window.scrollTo(0,0);
  R.innerHTML='<div style="animation:fdIn .3s ease-out">'+
  '<button id="lbBack" style="font-size:13px;padding:7px 12px;margin-bottom:14px">← 돌아가기</button>'+
  '<div style="font-size:27px;font-family:var(--font-voice);font-weight:800;margin:2px 0 14px">명예의 전당</div>'+
  '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;font-size:14px;line-height:1.75;color:var(--text-secondary)">'+
  '이 화면(아이패드용 버전)에서는 실시간 순위표를 불러올 수 없어요. 여기서 한 플레이는 <b style="color:var(--text-primary)">순위와 연구 기록에 들어가지 않고</b>, 최고 기록과 도감만 이 기기에 남아요.</div>'+
  '<a href="'+SITE+'leaderboard.html" target="_blank" rel="noopener" style="display:block;text-align:center;text-decoration:none;padding:14px;border-radius:10px;font-size:15px;font-weight:600;color:#8f6a12;border:1px solid rgba(143,106,18,.45);background:rgba(143,106,18,.08);margin-bottom:12px">게임 사이트에서 명예의 전당 보기 ↗</a>'+
  '<div style="font-size:12px;color:var(--text-muted);line-height:1.7">순위에 오르려면 아래 주소의 게임 사이트에서 플레이해 주세요.<div style="user-select:all;-webkit-user-select:all;color:var(--text-secondary);margin-top:4px;word-break:break-all">'+SITE+'</div></div></div>';
  document.getElementById('lbBack').onclick=()=>{SFX.back();(o.back||home)();};}
const LB={data:null,tab:'top',diff:'',open:null,seen:null,fresh:new Set(),sig:'',timer:0,back:null,id:'',nick:'',busy:false,err:'',t0:0,open:false};
const LCOL={'킨키나투스':'#2f5f99','조지 워싱턴':'#2f5f99','루이 14세':'#b3261e','나폴레옹':'#b3261e','진시황':'#b3261e','루이 16세':'#6e675c',
  '마르쿠스 아우렐리우스':'#2f4a6b','율리우스 카이사르':'#b8541e','에이브러햄 링컨':'#2e7d55','세종':'#2e7d55','페리클레스':'#6e675c',
  '술라':'#b8541e','솔론':'#2f5f99','정조':'#2e7d55','프리드리히 2세':'#b8541e','표트르 대제':'#b3261e','오토 폰 비스마르크':'#b8541e','아우구스투스':'#b3261e',
  '프랭클린 루스벨트':'#2f4a6b','광해군':'#6e675c','윈스턴 처칠':'#2f5f99','아소카':'#2e7d55','시몬 볼리바르':'#b8541e','함무라비':'#2f4a6b'};
const LB_N=10;
// 난이도별 순위: 처음에는 지금 고른 난이도로 열고, 전체 순위도 볼 수 있다. 색은 난이도 칸과 같다(지옥은 어두운 무대에서 보이게 밝게).
const LB_DIFS=['쉬움','보통','어려움','전체'],LB_DCOL={'쉬움':'#3fc38f','보통':'#e3b341','어려움':'#e0604f','전체':'#c9a24a'};
const lbCol=n=>LCOL[n]||(LEADK.map(k=>LEAD[k]).find(L=>L.n===n)||{}).col||'#6e675c';
const lbDiffTag=d=>d&&LB_DCOL[d]?'<span class="lb-dt" style="--dc:'+LB_DCOL[d]+'">'+lbEsc(d)+'</span>':'';
// 지금 고른 난이도의 순위. 서버가 난이도별 순위(byDiff)를 아직 안 보내면 받은 목록에서 걸러 낸다.
function lbView(){const d=LB.data;if(!d||LB.diff==='전체')return d;
  if(d.byDiff)return d.byDiff[LB.diff]||{careers:0,players:0,top:[],longest:[],recent:[],order:[],stats:{}};
  const f=a=>(a||[]).filter(r=>r.diff===LB.diff);return Object.assign({},d,{top:f(d.top),longest:f(d.longest),recent:f(d.recent)});}
function lbAgo(t){const d=(Date.now()-new Date(t).getTime())/1000;if(!isFinite(d))return '';if(d<60)return '방금';if(d<3600)return Math.floor(d/60)+'분 전';if(d<86400)return Math.floor(d/3600)+'시간 전';
  const x=new Date(t);return (x.getMonth()+1)+'월 '+x.getDate()+'일';}
function lbJsonp(){return new Promise((res,rej)=>{const cb='__lbg'+Date.now()+Math.floor(Math.random()*1e4),s=document.createElement('script');
  // 늦게 온 응답이 없는 함수를 불러 오류가 나지 않게, 끝나면 빈 함수로 바꿔 두었다가 1분 뒤에 지운다
  const done=()=>{clearTimeout(to);window[cb]=()=>{};setTimeout(()=>{try{delete window[cb];}catch(e){window[cb]=undefined;}},60000);s.remove();};
  const to=setTimeout(()=>{done();rej(new Error('시간 초과'));},25000);
  window[cb]=d=>{done();res(d);};s.onerror=()=>{done();rej(new Error('연결 실패'));};
  s.src=SHEET_URL+'?callback='+cb+'&t='+Date.now();document.head.appendChild(s);});}
function lbFetch(){let ab=null,tm=0;try{ab=new AbortController();tm=setTimeout(()=>ab.abort(),12000);}catch(e){}
  return fetch(SHEET_URL+'?t='+Date.now(),{cache:'no-store',signal:ab?ab.signal:undefined}).then(r=>{clearTimeout(tm);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).catch(()=>{clearTimeout(tm);return lbJsonp();});}

/* ---------- 게임 안 명예의 전당: 스포츠 기록실 형식 ----------
   가운데 큰 카드가 커리어 점수 순위(1위는 메달·초상·닉네임·학교·지도자·점수를 크게, 2위부터는 한 줄씩),
   양옆 카드는 부문별 순위(최장 집권·최다 연임·학교 평균·최다 업적·최고 지지율·무대별 최고). 웹 리더보드(leaderboard.html)는 '전체 순위'로 따로 연다. */
const HOF={d:null,diff:'',timer:0,back:null,id:'',nick:'',busy:false,err:'',sig:'',vw:'car'};
function openBoard(o){o=o||{};if(IN_ART)return artBoard(o);hofClose();lbeClose();window.scrollTo(0,0);
  HOF.back=o.back||home;HOF.id=o.id||'';HOF.nick=o.nick||'';HOF.diff=o.diff||(DIFF[dif]&&DIFF[dif].n)||'보통';HOF.sig='';if(o.vw)HOF.vw=o.vw;
  const w=document.createElement('div');w.id='hof';w.className='lbfs hof';w.setAttribute('role','dialog');w.setAttribute('aria-label','명예의 전당');
  w.innerHTML='<canvas class="gx-bg" aria-hidden="true"></canvas><div class="hof-in">'+
    '<header class="hof-top"><button class="hof-back" id="hofBack">← 돌아가기</button>'+
    '<div class="hof-ttl"><span class="hof-k">HALL OF FAME</span><h1>명예의 전당</h1></div>'+
    '<div class="hof-r"><span id="hofLive" class="hof-live"><i></i>불러오는 중</span><a id="hofAll" class="hof-all" target="_blank" rel="noopener">전체 순위 ↗</a></div></header>'+
    '<div class="hof-vw" id="hofVw" role="tablist" aria-label="순위 종류">'+HOF_VW.map(x=>'<button type="button" role="tab" data-v="'+x.k+'" aria-selected="'+(HOF.vw===x.k)+'">'+x.t+'</button>').join('')+'</div>'+
    '<div class="hof-dif" id="hofDif" role="group" aria-label="난이도">'+LB_DIFS.map(k=>'<button data-d="'+k+'" style="--dc:'+LB_DCOL[k]+'" aria-pressed="'+(HOF.diff===k)+'">'+k+'</button>').join('')+'</div>'+
    '<div id="hofTiles" class="hof-tiles"></div><div id="hofBody" class="hof-g">'+hofSkel()+'</div></div>';w.classList.toggle('arc-v',HOF.vw==='arc');
  document.body.appendChild(w);document.body.style.overflow='hidden';gxLattice(w.querySelector('.gx-bg'));
  const all=()=>{document.getElementById('hofAll').href='leaderboard.html?diff='+encodeURIComponent(HOF.diff)+(HOF.id?'&id='+encodeURIComponent(HOF.id)+'&me='+encodeURIComponent(HOF.nick):'');};all();
  document.getElementById('hofBack').onclick=()=>{SFX.back();const b=HOF.back;hofClose();b();};
  w.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();document.getElementById('hofBack').click();}});
  document.getElementById('hofDif').onclick=e=>{const b=e.target.closest('button[data-d]');if(!b||b.dataset.d===HOF.diff)return;SFX.click();HOF.diff=b.dataset.d;
    document.querySelectorAll('#hofDif button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));all();HOF.sig='';hofRender();};
  // 대통령 순위 ↔ 미니게임 순위. 미니게임 순위는 난이도와 상관없어 난이도 버튼 · 통계 줄을 숨긴다
  document.getElementById('hofVw').onclick=e=>{const b=e.target.closest('button[data-v]');if(!b||b.dataset.v===HOF.vw)return;SFX.click();HOF.vw=b.dataset.v;
    document.querySelectorAll('#hofVw button').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));w.classList.toggle('arc-v',HOF.vw==='arc');
    const g=document.getElementById('hofBody');HOF.sig='';if(HOF.d)hofRender();else if(g){g.className='hof-g'+(HOF.vw==='arc'?' mg':'');g.innerHTML=hofSkel();}};
  setTimeout(()=>{const b=document.getElementById('hofBack');if(b)b.focus({preventScroll:true});},50);
  if(HOF.d)hofRender();hofLoad();}
function hofClose(){clearTimeout(HOF.timer);const w=document.getElementById('hof');if(w){w.remove();document.body.style.overflow='';}}
function hofLoad(){if(HOF.busy||!document.getElementById('hof'))return;HOF.busy=true;
  lbFetch().then(d=>{if(!d||!Array.isArray(d.top))throw new Error('형식이 다른 응답');HOF.err='';HOF.d=d;hofRender();})
  .catch(e=>{HOF.err=(e&&e.message)||String(e);hofLive();if(!HOF.d){const b=document.getElementById('hofBody');if(b)b.innerHTML='<div class="hc hof-main hc-empty" style="grid-column:1/-1">기록을 불러오지 못했어요.<br><small>인터넷 연결을 확인해 주세요. ('+lbEsc(HOF.err)+')</small><br><button id="hofRetry" class="hof-back" style="margin-top:12px">다시 시도</button></div>';
      const r=document.getElementById('hofRetry');if(r)r.onclick=()=>{SFX.click();hofLoad();};}})
  .finally(()=>{HOF.busy=false;clearTimeout(HOF.timer);if(document.getElementById('hof')){const wait=HOF.id&&HOF.d&&(HOF.d.order||[]).indexOf(HOF.id)<0;const poll=()=>{if(!document.getElementById('hof'))return;if(document.hidden){HOF.timer=setTimeout(poll,5000);return;}hofLoad();};HOF.timer=setTimeout(poll,wait?5000:15000);}});}
function hofLive(){const el=document.getElementById('hofLive');if(!el)return;
  if(HOF.err)el.innerHTML='<i class="off"></i>'+(HOF.d?'다시 연결하는 중':'연결이 안 돼요');
  else{const u=HOF.d&&HOF.d.updated?new Date(HOF.d.updated):new Date();el.innerHTML='<i></i>LIVE · '+u.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});}}
function hofSkel(){if(HOF.vw==='arc')return HOF_ARC.map(()=>'<div class="hc hc-sk mg"></div>').join('');return '<div class="hc hof-main hc-sk big" style="grid-area:M"></div>'+'abcdefgh'.split('').map(a=>'<div class="hc hc-sk" style="grid-area:'+a+'"></div>').join('');}
// 지금 난이도의 묶음. 예전 스크립트라 부문별 순위(cards)가 없으면 받은 목록으로 만든다.
function hofView(){const d=HOF.d;if(!d)return null;const f=a=>(a||[]).filter(r=>r.diff===HOF.diff);
  const v=HOF.diff==='전체'?d:d.byDiff?(d.byDiff[HOF.diff]||{careers:0,players:0,top:[],longest:[],recent:[],order:[],stats:{}}):Object.assign({},d,{top:f(d.top),longest:f(d.longest),recent:f(d.recent),cards:null});
  if(v.cards)return v;const pool={};[].concat(v.top||[],v.longest||[],v.recent||[]).forEach(r=>{if(!pool[r.nick]||pool[r.nick].score<r.score)pool[r.nick]=r;});
  const L=Object.keys(pool).map(k=>pool[k]),srt=f=>L.slice().sort(f).slice(0,5);
  return Object.assign({},v,{cards:{terms:srt((a,b)=>b.terms-a.terms||b.score-a.score),tro:srt((a,b)=>(b.tro||0)-(a.tro||0)||b.score-a.score).filter(r=>r.tro>0),appr:L.filter(r=>r.appr!=null).sort((a,b)=>b.appr-a.appr).slice(0,5),school:[],camp:[]}});}
const hofCampN=c=>{const k=Object.keys(CAMPS).find(k=>CAMPS[k].id===c||CAMPS[k].n===c);return k?CAMPS[k].n:(c||'');};
// 초상이 없으면(닮은 지도자 미상) 이니셜 대신 그림자 사람
const HOF_SH='<span class="hc-ini sh">'+'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 64c2-12 11-19 23-19s21 7 23 19z"/><ellipse cx="32" cy="28" rx="11.5" ry="13.5"/></svg>'+'</span>',hofAnon=n=>!n||/^\s*(익명|anonymous)?\s*$/i.test(String(n));
/* 사람마다 지도자 얼굴 하나(미니게임 순위 · 닮은 지도자를 모르는 기록). 사람은 닉네임+학교로 가른다.
   같은 사람은 늘 같은 얼굴, 지금 명예의 전당에 오른 사람끼리는 서로 다른 얼굴(사람이 얼굴 수보다 많을 때만 겹친다).
   얼굴은 이름의 해시로 정하고, 겹치면 다음 빈 얼굴로 넘긴다. 해시 순서로 자리를 잡으므로 새 사람이 들어와도 다른 사람 얼굴은 거의 그대로다.
   현직 · 최근 정치인, 학교 선생님 · 게임 속 인물, 이름난 폭군은 넣지 않았다. */
const HOF_FACE=['세종','태조 이성계','태종','영조','정조','광개토대왕','선덕여왕','김춘추','왕건','공민왕','단군왕검','안창호',
  '조지 워싱턴','토머스 제퍼슨','에이브러햄 링컨','율리시스 S. 그랜트','시어도어 루스벨트','우드로 윌슨','프랭클린 루스벨트','해리 트루먼','드와이트 아이젠하워','존 F. 케네디','지미 카터',
  '킨키나투스','솔론','페리클레스','함무라비','아소카','아크바르','율리우스 카이사르','아우구스투스','마르쿠스 아우렐리우스','디오클레티아누스','유스티니아누스 1세',
  '당 태종','측천무후','진시황','앨프레드 대왕','엘리자베스 1세','루이 14세','표트르 대제','프리드리히 2세','마리아 테레지아','예카테리나 2세','나폴레옹','시몬 볼리바르',
  '오토 폰 비스마르크','윈스턴 처칠','클레멘트 애틀리','샤를 드골','무스타파 케말 아타튀르크','넬슨 만델라','리콴유','바츨라프 하벨','미하일 고르바초프','호세 무히카'];
const hofWho=r=>String(r.nick||'').trim()+'|'+String(r.school||'').trim();
const hofHash=t=>{let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}h^=h>>>15;h=Math.imul(h,2246822507);return (h^h>>>13)>>>0;};
let HOF_FM={d:null,m:{}};
function hofFaces(){const d=HOF.d;if(HOF_FM.d===d)return HOF_FM.m;const F=HOF_FACE.filter(n=>PFS[n]),N=F.length,K=new Set(),m={},used=new Set();
  // 받은 기록 전체(난이도별 · 부문별 · 미니게임)에서 사람을 모은다
  const walk=o=>{if(!o||typeof o!=='object')return;if(Array.isArray(o)){o.forEach(walk);return;}if(typeof o.nick==='string'&&!hofAnon(o.nick))K.add(hofWho(o));for(const k in o)if(o[k]&&typeof o[k]==='object')walk(o[k]);};walk(d);
  [...K].sort((a,b)=>hofHash(a)-hofHash(b)||(a<b?-1:a>b?1:0)).forEach(k=>{let i=hofHash(k)%N;if(used.size<N)while(used.has(i))i=(i+1)%N;used.add(i);m[k]=F[i];});
  HOF_FM={d:d,m:m};return m;}
const hofFace=(r,px)=>{if(!r||hofAnon(r.nick)||!HOF_FACE.length)return HOF_SH;const n=hofFaces()[hofWho(r)]||HOF_FACE[hofHash(hofWho(r))%HOF_FACE.length];return portrait(n,px)||HOF_SH;};
// 부문 카드 하나. it(r)은 {n 이름, s 둘째 줄, v 기록, a 초상 자리 HTML, me 내 기록인지}
// 커리어 점수(main)만 1위를 크게 띄우고, 나머지 부문은 작은 순위표(1~5위)로만 보여 준다. ga는 화면 격자의 자리 이름
function hofCard(o){const L=o.list||[],main=!!o.main,big=main||!!o.hero;
  let h='<section class="hc'+(main?' hof-main':' cp')+(o.cls?' '+o.cls:'')+'"'+(o.id?' id="'+o.id+'"':'')+' style="--i:'+(o.i||0)+(o.ga?';grid-area:'+o.ga:'')+(o.ac?';--ac:'+o.ac:'')+'"><div class="hc-h"><b>'+o.t+'</b><span>'+(o.u||'')+'</span></div>'+(o.tabs?'<div class="hc-tabs" role="tablist">'+o.tabs+'</div>':'');
  if(o.me)h+=o.me;
  if(!L.length)return h+'<div class="hc-empty">'+(o.empty||'아직 기록이 없어요')+'</div></section>';
  const f=L.map(o.it),one=f[0],row=(x,k)=>'<div class="hc-r'+(x.me?' me':'')+(k<=3?' r'+k:'')+'"><span class="k">'+k+'</span><span class="a">'+x.a+'</span><span class="t"><b>'+x.n+'</b><small>'+x.s+'</small></span><span class="v">'+x.v+'</span></div>';
  if(big){h+='<div class="hc-hero'+(one.me?' me':'')+'"><span class="hc-md" aria-label="1위">1</span><div class="hc-av">'+one.a+'</div><div class="hc-hx"><div class="hc-n">'+one.n+'</div><div class="hc-s">'+one.s+'</div></div><div class="hc-v">'+one.v+'</div></div>';
    f.slice(1,o.n||10).forEach((x,i)=>{h+=row(x,i+2);});
    // 미니게임 카드: 다섯 명이 안 되면 빈 줄로 채워 다섯 카드 높이를 맞춘다
    if(o.fill)for(let k=f.length+1;k<=o.n;k++)h+='<div class="hc-r nil"><span class="k">'+k+'</span><span class="a"></span><span class="t"><b>—</b></span><span class="v"></span></div>';}
  else f.slice(0,o.n||5).forEach((x,i)=>{h+=row(x,i+1);});
  if(o.more)h+='<a class="hc-more" href="'+o.more+'" target="_blank" rel="noopener">더보기</a>';
  return h+'</section>';}
function hofRender(){const v=hofView(),body=document.getElementById('hofBody');hofLive();if(!v||!body)return;
  const sig=HOF.vw+'|'+HOF.diff+'|'+JSON.stringify(v)+'|'+JSON.stringify((HOF.d&&HOF.d.arcade)||{});if(sig===HOF.sig)return;const first=!HOF.sig;HOF.sig=sig;
  body.className='hof-g'+(HOF.vw==='arc'?' mg':'')+(first?'':' still');
  if(HOF.vw==='arc'){document.getElementById('hofTiles').innerHTML='<p class="hof-note">난이도와 상관없이 게임마다 순위 하나 · 한 사람은 가장 좋은 기록 하나만</p>';
    body.innerHTML=HOF_ARC.map(hofMgCard).join('');return;}
  const C=v.cards||{},E=lbEsc,num=x=>Number(x||0).toLocaleString('ko-KR');
  const who=r=>[r.school,r.leader].filter(Boolean).map(E).join(' · ')||'&nbsp;';
  const P=(r,val,s)=>({n:E(r.nick),s:s!=null?s:who(r),v:val,a:portrait(r.leader,main?120:40)||hofFace(r,main?120:40),me:!!HOF.id&&r.id===HOF.id});let main=false;
  const s=v.stats||{},tile=(k,x)=>'<div><span>'+k+'</span><b>'+x+'</b></div>';
  document.getElementById('hofTiles').innerHTML=tile('지나간 인생',num(v.careers))+tile('참가자',num(v.players))+tile('평균 임기',(s.avgTerms||0)+'선')+tile('2선 이상',(s.reelectRate||0)+'%')+tile('개헌한 비율',(s.amendRate||0)+'%');
  // 내 순위: 이번 커리어가 몇 위인지, 1위까지 몇 점 남았는지
  let me='';if(HOF.id){const rk=(v.order||[]).indexOf(HOF.id)+1,top=(v.top||[])[0],mine=[].concat(v.top||[],v.recent||[]).find(r=>r.id===HOF.id);
    me='<div class="hc-me">'+(rk?'<span>'+E(HOF.nick||'내')+' · 이번 커리어</span><b>'+rk+'위</b><span>'+(rk===1?'지금 1위':top&&mine?'1위까지 '+num(top.score-mine.score)+'점':'')+'</span>':'<span>방금 끝낸 커리어를 반영하는 중이에요</span>')+'</div>';}
  const dq=encodeURIComponent(HOF.diff);
  main=true;const mainCard=hofCard({main:true,i:0,ga:'M',t:'커리어 점수',u:(HOF.diff==='전체'?'전체':HOF.diff)+' · 상위 10',list:v.top,me:me,n:10,more:'leaderboard.html?diff='+dq,empty:'아직 기록이 없어요. 첫 번째 대통령이 되어 보세요.',it:r=>P(r,num(r.score)+'<small>점</small>')});
  main=false;
  // 화면 격자: 넓으면 [최장 집권 · 최다 연임 | 커리어 점수 | 최고 지지율 · 미니게임 순위] / [학교 · 최다 업적 | 〃 | 무대별 · 〃] — 오른쪽 끝 칸이 미니게임 순위(두 줄 높이)
  const left=hofCard({i:1,ga:'a',t:'최장 집권',u:'재임 기간',list:v.longest,it:r=>P(r,r.years+'<small>년</small>')})+
    hofCard({i:2,ga:'b',t:'최다 연임',u:'임기 수',list:C.terms,it:r=>P(r,r.terms+'<small>선</small>')})+
    // 학교 평균: 순위를 매긴 값(인원 보정 평균 adj)을 그대로 보여 준다(인원 수는 보여 주지 않는다). 예전 서버(adj 없음)면 평균
    hofCard({i:3,ga:'c',t:'학교 평균 점수',u:'사람마다 최고 기록 · 인원 보정 평균',list:C.school,empty:'학교를 적은 기록이 아직 없어요',it:x=>({n:E(x.school),s:x.best&&x.best.nick?'최고 기록 · '+E(x.best.nick):'&nbsp;',v:num(x.adj!=null?x.adj:x.avg)+'<small>점</small>',a:'<span class="hc-ini sc">'+E(String(x.school).slice(0,1))+'</span>',me:false})});
  const right=hofCard({i:4,ga:'d',t:'최다 업적',u:'한 커리어의 업적 수',list:C.tro,it:r=>P(r,r.tro+'<small>개</small>')});
  // 지지율·무대별 최고는 가운데 큰 순위 아래 두 칸으로
  const sub=hofCard({i:5,ga:'e',t:'최고 지지율',u:'물러날 때 지지율',list:C.appr,it:r=>P(r,Math.round(r.appr)+'<small>%</small>')})+
    hofCard({i:7,ga:'g',t:'무대별 최고',u:'무대마다 1위',list:C.camp,it:r=>P(r,num(r.score)+'<small>점</small>',E(hofCampN(r.camp))+(r.school?' · '+E(r.school):''))});
  body.innerHTML=mainCard+left+right+sub;}
// 미니게임 순위(따로 보는 화면): 여섯 게임을 한 화면에 나란히. 카드마다 1위를 크게(메달 · 얼굴 · 이름 · 학교 · 기록), 2~5위는 한 줄씩. 얼굴은 hofFace(사람마다 지도자 하나). 순위는 난이도와 상관없이 하나다
const HOF_VW=[{k:'car',t:'대통령 순위'},{k:'arc',t:'미니게임 순위'}];
const HOF_ARC=[{k:'zg',t:'방역선',u:'좀비 서바이벌 · 최고 점수',c:'#e0604f',empty:'아직 해가 뜬 기록이 없어요'},{k:'sail',t:'대항해',u:'폭풍 해협 · 최단 기록',c:'#4a9bd6',empty:'아직 돌아온 배가 없어요'},{k:'star',t:'별똥별',u:'밤하늘 서바이벌 · 최고 점수',c:'#9b8cff',empty:'아직 하늘을 난 별이 없어요'},{k:'qx',t:'격리 탈출',u:'깬 단계 → 적은 감염 → 짧은 시간',c:'#3fc38f',empty:'아직 병동을 빠져나온 대통령이 없어요'},{k:'cg',t:'출근길',u:'가장 멀리 간 칸',c:'#e3b341',empty:'아직 출근한 대통령이 없어요'},{k:'ax',t:'백신 공수',u:'지나간 감염 구름 장벽',c:'#d98ad6',empty:'아직 이륙한 헬기가 없어요'}];
function hofMgCard(X,i){const A=(HOF.d&&HOF.d.arcade)||{},E=lbEsc,num=x=>Number(x||0).toLocaleString('ko-KR');
  const mmss=s=>Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0');
  return hofCard({i:i,cls:'mg',ac:X.c,t:X.t,u:X.u,list:(A[X.k]||[]).slice(0,5),hero:true,n:5,fill:true,empty:X.empty,
    it:r=>({n:E(r.nick),s:[r.school,r.detail].filter(Boolean).map(E).join(' · ')||'&nbsp;',v:X.k==='sail'?mmss(r.sec):X.k==='qx'?(r.win?'완주':Math.floor(r.score/1000)+'<small>단계</small>'):X.k==='cg'?num(r.score)+'<small>칸</small>':X.k==='ax'?num(r.score)+'<small>장벽</small>':num(r.score)+'<small>점</small>',a:hofFace(r,96),me:false})});}
