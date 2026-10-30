/* ---------- START / TERM ---------- */function start(){if(camp==='zombie')return zgOpen();
  PINH='';cfgApply();
  if(!CP.bg[bg]||bgLock(CP.bg[bg])){bg=-1;return home();}
  const B=CP.bg[bg];if(B.once){MEM.secUsed=MEM.secUsed||{};MEM.secUsed[B.sec]=1;msave();}
  LOG=[];T0=Date.now();SHOWN=0;RUN={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),st:new Date().toISOString(),rr:0,pkP:0,pkC:0,crisis:[],sent:0};
  S=Object.assign({turn:0,quit:0},INIT,CP.init||{});B.f(S);for(const k in INIT)S[k]=cl(S[k]);
  CAR={camp:CP.id,path:{hard:0,soft:0,eco:0},pstage:{},pathLog:[],news:0,term:1,age0:B.age,bg:(CP.id==='kr'?'':CP.n+' · ')+B.n,bgid:B.id,bgn:B.n,bgx:B.x||(B.n+' 출신'),terms:[],tro:[],amend:0,crush:0,exit:'',tEval:0,retireElig:false,cs:[],ts:[],us:[],ss:[],done:0,tt:[0,0,0,0],yrs:[],scen:[],elections:[]};cnStart();
  // 배경음악은 새 커리어를 만든 뒤에 고른다(앞 판의 올림픽 응원가가 이어지지 않게)
  bgmGame();histArm();
  SEENT={};SEENN=0;MOD=pk(MODS);tok=2+(B.t||0)+cpTokUse();streak=0;snap=null;peakI=S.i;hist=[];TH=[{a:S.a,i:S.i}];SEEN=new Set();   // 운명 개입: 기본 2 + 인물 보너스 + 쿠폰으로 받아 둔 것(cpTokUse)
  base=S.chk+S.trn+S.saf;pool=CP.ev.slice();last=null;tally=[0,0,0,0];yTally=[0,0,0,0];chron=[];prev=null;queue=[];deaths=0;yd=0;cDeaths=0;covD=0;setTroName();
  YS=Object.assign({},S);
  mapReset();MAP.tgt=S.i;mapStart();
  if(CP.id!=='kr'){const X=SCN[CP.scen0];cur=Object.assign({tag:(CP.id==='joseon'?'즉위 첫해':CP.id==='zombie'?'생존 첫날':'취임 첫 달')+' · '+X.n,bn:X.bn},X.op);bnSeen=null;pendingNews=null;pickAdv();return quoteFx(CP.id==='joseon'?'치세의 시작':'임기의 시작',ev,leaderQ(1));}
  cur={t:'첫 확진자',tag:'취임 3주째',d:'해외 유입 <em>첫 확진자</em>가 확인됐다. 상황실이 처음으로 소집됐고, 모두가 대통령의 입을 보고 있다.',o:[
   ['위기경보를 최고 단계로 즉시 격상한다',{p:11,i:-11,e:-7,a:5},'과잉대응이라는 비판이 하루 만에 나왔다. 3주 뒤에는 아무도 그 말을 하지 않았다.'],
   ['상황을 지켜보며 단계적으로 대응한다',{i:5,e:4,a:4,chk:5},'신중했다. 그사이 지역사회 전파가 시작됐다.'],
   ['질병관리청에 전권을 위임한다',{trn:11,chk:9,p:-7,i:-5},'대통령이 한 발 물러섰고 전문가가 마이크를 잡았다.']],bn:FIRSTBN};
  bnSeen=null;pendingNews=null;pickAdv();quoteFx('임기의 시작',ev,leaderQ(1));
}
function newTerm(){
  CAR.ttT=(CAR.ttT||[]).concat([CAR.tt.slice()]);CAR.term++;CAR.tt=[0,0,0,0];CAR.path={hard:0,soft:0,eco:0};CAR.pstage={};S.turn=0;tok+=1;base=S.chk+S.trn+S.saf;deaths=0;yd=0;hist=[];chron=[];prev=null;queue=[];pool=CP.ev.slice();CAR.spRun=null;
  // 아직 겪지 않은 위기 하나를 고른다. 위기 지수는 새로 시작하지만 임기가 거듭될수록 출발점이 높다.
  const left=CP.post.filter(k=>CAR.scen.indexOf(k)<0);CAR.scen.push(pk(left.length?left:CP.post));setTroName();
  S.i=cl(22+6*(CAR.term-2));peakI=S.i;TH=[{a:S.a,i:S.i}];YS=Object.assign({},S);yTally=[0,0,0,0];streak=0;
  mapReset();MAP.tgt=S.i;const X=SCX();bnSeen=null;cur=Object.assign({tag:CAR.term+(CP.id==='joseon'?'번째 치세 · 새로운 시련: ':'기 취임 · 새로운 위기: ')+X.n,bn:X.bn},X.op);pickAdv();quoteFx(CAR.term+(CP.id==='joseon'?'번째 치세의 시작':'기 임기의 시작'),ev,leaderQ(careerYear(1)));}
function setTroName(){const t=TRO.find(z=>z.id==='safe');if(t)t.n=SCX().safeN;}
// 2기부터는 해가 바뀔 때마다 위기가 다시 커진다
function waveHit(){const X=SCX(),up=Math.round(4+(CAR.term-2));S.i=cl(S.i+up);if(S.i>peakI)peakI=S.i;MAP.tgt=S.i;
  pendingNews=X.wbn?Object.assign({b:X.iName+'가 새해 들어 다시 '+up+' 올랐다.'},X.wbn):null;}
// 1기 3년차가 시작될 때 신종 변이가 덮친다
let banner='',pendingNews=null,bnSeen=null;
// 호외: 신문 한 장이 돌며 날아들고, 확인을 누르면 게임 화면으로 간다
// 선은 '그 소식의 지표'가 가는 방향: 감염·위기 소식은 나쁠수록 치솟고, 주가·경제 소식은 나쁠수록 곤두박질친다
function newsArt(k,n){const W=280,H=92;let p='',x=0,y=k==='good'?24:72;const pts=[];
  const eco=n&&/주가|증시|폭락|폭등|경제|경기|파산|부도|실업|고용|환율|금리|물가|수출|무역|성장률|GDP|은행|금융|시장|코스피|다우|나스닥|국고|재정/.test((n.h||'')+' '+(n.s||''));
  const up=eco?k==='good':k!=='good';
  for(let i=0;i<=14;i++){x=i*W/14;
  y=up?72-Math.pow(i/14,2.2)*58+Math.sin(i*2.1)*4:24+Math.pow(i/14,1.6)*50+Math.sin(i*1.7)*4;pts.push(x.toFixed(1)+' '+y.toFixed(1));}
  let g='';for(let i=1;i<4;i++)g+='<line x1="0" x2="'+W+'" y1="'+(i*H/4)+'" y2="'+(i*H/4)+'" stroke="#1b1d20" stroke-opacity=".12"/>';
  return '<svg viewBox="0 0 '+W+' '+H+'" class="np-art" aria-hidden="true">'+g+'<path d="M'+pts.join(' L')+' L'+W+' '+H+' L0 '+H+'Z" fill="'+(k==='good'?'#2f7d5b':'#b3261e')+'" fill-opacity=".14"/><path d="M'+pts.join(' L')+'" fill="none" stroke="'+(k==='good'?'#2f7d5b':'#b3261e')+'" stroke-width="2.4" stroke-linejoin="round"/></svg>';}
// 소식이 전해지는 방식은 무대마다 다르다. 조선은 조정의 조보, 대한민국과 미국은 신문 호외와 TV 뉴스가 번갈아 온다.
const TVCH={kr:['한빛방송','9시 종합뉴스'],usa:['WNB','이브닝 뉴스'],zombie:['생존 무전 147.5','오늘의 생존 방송']};
function tvDesk(n,y){const ch=TVCH[CP.id]||TVCH.kr,bad=n.k!=='good',d=new Date();
  return '<div class="tv'+(bad?'':' good')+'"><div class="tv-scr">'+
   '<div class="tv-bug"><b>'+ch[0]+'</b><span>'+ch[1]+'</span></div><div class="tv-live"><i></i>LIVE</div>'+
   '<svg class="tv-set" viewBox="0 0 320 180" aria-hidden="true"><defs><linearGradient id="tvg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22324a"/><stop offset="1" stop-color="#0f1724"/></linearGradient></defs>'+
    '<rect width="320" height="180" fill="url(#tvg)"/>'+Array.from({length:9},(_,i)=>'<path d="M'+(i*40)+' 0V180" stroke="#fff" stroke-opacity=".05"/>').join('')+
    '<circle cx="230" cy="70" r="58" fill="none" stroke="#fff" stroke-opacity=".08"/><ellipse cx="230" cy="70" rx="24" ry="58" fill="none" stroke="#fff" stroke-opacity=".08"/>'+
    '<path d="M0 140H320V180H0Z" fill="#0b111b"/><path d="M40 140L70 122H250L280 140Z" fill="#2a3a52"/>'+
    '<g transform="translate(0,-14)"><circle cx="104" cy="74" r="17" fill="#c9b8a4"/><path d="M84 66c2-14 38-14 40 0-6-6-34-6-40 0z" fill="#2b2420"/>'+
    '<path d="M70 132c2-26 16-36 34-36s32 10 34 36z" fill="#1d2a3f"/><path d="M98 98l6 14 6-14z" fill="#e9e4da"/><path d="M103 104l1 22 2-22z" fill="'+(bad?'#b3261e':'#2e7d55')+'"/></g></svg>'+
   '<div class="tv-box">'+newsArt(n.k,n)+'</div>'+
   '<div class="tv-l3"><span class="tv-flag">'+(bad?'속보':'특집')+'</span><div class="tv-h">'+n.h+'</div>'+(n.s?'<div class="tv-s">'+n.s+'</div>':'')+'</div>'+
   '<div class="tv-crawl"><span class="tv-clk">'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+'</span><div class="tv-cr"><span>'+(n.b||n.s||n.h)+'&nbsp;&nbsp;·&nbsp;&nbsp;'+CAR.term+'기 정부 '+y+'년차&nbsp;&nbsp;·&nbsp;&nbsp;'+ageNow()+'세 대통령 재임 중</span></div></div>'+
   '</div><div class="tv-foot">'+ch[0]+' '+ch[1]+' · 제'+(1200+CAR.news)+'회</div></div>';}
function jobo(n,y){const bad=n.k!=='good';
  return '<div class="jb"><div class="jb-mast"><span class="jb-t">朝報</span><span class="jb-k">조보</span><span class="jb-seal">'+(bad?'急':'慶')+'</span></div>'+
   '<div class="jb-meta"><span>'+CAR.term+'번째 치세 '+y+'년</span><span>승정원 반포 · 제'+(300+CAR.news)+'호</span></div>'+
   '<div class="jb-flag">'+(bad?'급보':'경사')+'</div>'+
   '<div class="jb-h">'+n.h+'</div>'+(n.s?'<div class="jb-s">'+n.s+'</div>':'')+'<div class="jb-rule"></div>'+(n.b?'<div class="jb-b">'+n.b+'</div>':'')+'</div>';}
function paper(n,y){const us=CP.id==='usa';
  return '<div class="np'+(us?' np-us':'')+'">'+
   '<div class="np-mast"><span>'+(us?'The Crisis Times':'위기일보')+'</span><span class="np-ex">'+(us?'EXTRA':'호외')+'</span></div>'+
   '<div class="np-meta"><span>제'+(1200+CAR.news)+'호</span><span>'+CAR.term+'기 정부 '+y+'년차</span><span>'+ageNow()+'세 대통령 재임 중</span></div>'+
   '<div class="np-flag">'+(n.k==='good'?'특집':'특보')+'</div>'+
   '<div class="np-h">'+n.h+'</div>'+(n.s?'<div class="np-s">'+n.s+'</div>':'')+newsArt(n.k,n)+
   (n.b?'<div class="np-b">'+n.b+'</div>':'')+'</div>';}
function breaking(n,cb){window.scrollTo(0,0);CAR.news=(CAR.news||0)+1;const y=Math.min(YRS,Math.floor(S.turn/PY)+1);
  const how=CP.id==='joseon'?jobo:CAR.news%2===0?tvDesk:paper;
  // 연차 셔터·인용구가 아직 덮고 있으면, 신문은 멈춘 채 그려 두었다가 화면이 다 열린 뒤에 돌며 날아든다
  R.innerHTML='<div class="np-wrap np-hold">'+how(n,y)+
   '<button id="npOk" class="np-ok">확인</button></div>';
  const b=document.getElementById('npOk');b.onclick=()=>{SFX.click();cb();};
  afterFx(()=>{const w=R.querySelector('.np-wrap');if(!w||!w.contains(b))return;w.classList.remove('np-hold');
    SFX.news(how===jobo?'jobo':how===tvDesk?(CP.id==='zombie'?'radio':'tv'):'paper',n.k!=='good');vib([40,30,40]);setTimeout(()=>{try{b.focus({preventScroll:true});}catch(e){}},700);});}
function variantHit(){S.i=cl(Math.max(S.i+12,28));if(S.i>peakI)peakI=S.i;MAP.tgt=S.i;bnSeen=null;cur=VARIANT;}
function pickAdv(){const L=CP.adv?(SCX().adv||[]).concat(CP.adv):isCov()?ADV:(SCX().adv||[]).concat(ADV.filter(a=>a.who!=='방역청장'));
  for(const a of L){if(a.c(S)){adv={who:a.who,l:pk(a.l)};return;}}}

