/* ---------- PLAY SCREENS ---------- */
// 세로 화면 상태 바: 한 줄 정보 · 진행 막대 · 누르면 펼쳐지는 상황판 띠 · 지표 6칸 · 급한 문제와 속보 한 줄
const isP=()=>document.documentElement.dataset.ori==='p';
let hpMap=false;
function hudP(o){o=o||{};const y=Math.floor(S.turn/PY)+1,v=Math.round(S.i),X=SCX(),hs=hudStats();
  const lb=X.lv[Math.min(4,Math.floor(v/20))],cL=v<20?'#7fd8a8':v<40?'#f0c060':v<60?'#f39a62':'#ff8f86',c=v<20?'#2e7d55':v<40?'#9a6400':v<60?'#b8541e':'#b3261e';
  let seg='';for(let k=0;k<YRS*PY;k++){const col=k<hist.length?TIER[hist[k]].bd:(k===S.turn?c:'rgba(29,27,24,.09)');seg+='<span style="background:'+col+';'+(k===S.turn&&k>=hist.length?'animation:pls 1.2s infinite;':'')+(k%PY===PY-1&&k<YRS*PY-1?'margin-right:3px;':'')+'"></span>';}
  return '<div class="hp-top"><span class="hp-k">'+(CP.id==='joseon'?'치세 '+CAR.term:CAR.term+'기')+'</span><b>'+y+'년차</b><span>'+(S.turn%PY+1)+'/'+PY+'</span><span class="hp-m">'+ageNow()+'세 · '+DIFF[dif].n+(CAR.term>1?' +'+(CAR.term-1):'')+'</span>'+
   (streak>=2?'<span class="hp-st">연속 '+streak+'</span>':'')+
   '<span class="hp-r">'+(tok?'<span class="dots" title="운명 개입 '+tok+'회" aria-label="운명 개입 '+tok+'회">'+'<i></i>'.repeat(tok)+'</span>':'')+
   (o.em&&!CAR.cnEm?'<button id="cnEm" class="hp-em" aria-label="비상소집: 전설 '+roleOf().n+' 부르기, 커리어에 한 번">비상소집</button>':'')+
   '<button id="snd" class="hp-snd" aria-label="소리 설정">'+sndIco()+'</button>'+moreBtn()+'</span></div>'+
  '<div class="hp-seg">'+seg+'</div>'+
  '<button id="hpLive" class="hp-live" aria-expanded="'+hpMap+'"><span class="hp-dot"></span><b class="hp-lv">'+(CP.id==='joseon'?'장계':'LIVE')+' · '+scnName()+'</b>'+
   '<span>'+X.iName+' <b style="color:'+cL+'">'+v+'</b> <span style="color:'+cL+'">'+lb+'</span></span>'+
   '<span class="hp-hs">'+hs.map((q,j)=>q[0]+' '+odoHTML(X.id+(isCov()?'':CAR.term)+'_'+j,q)).join(' &nbsp;')+'</span><i class="hp-chev" aria-hidden="true">▾</i></button>'+
  '<div class="hp-map"'+(hpMap?'':' hidden')+'><canvas id="map"></canvas><span>'+X.map+'</span></div>'+
  statsHTML()+
  '<div class="hp-line">'+urgentHTML(1)+'<div class="hp-tk"><span><b>'+(CP.id==='joseon'?'풍문':'속보')+'</b>&nbsp; '+headlines()+'</span></div></div>';}
// 사건 글이 가운데 칸을 넘치면 글씨를 조금씩 줄인다(85%까지). 줄여도 안 들어가면 원래 크기로 두고 그 칸 안에서만 스크롤한다.
// 반대로 자리가 많이 남으면(아이패드·짧은 사건) 글씨를 18%까지 키우고, 그래도 남으면 선택지를 사건 바로 아래로 붙여 가운데 모은다(loose).
// 가로 화면(720px 이상, 두 칸)도 한 화면에 맞춘다: 오른쪽 사건 칸은 같은 방식으로 글씨를 맞추고, 왼쪽 결정 기록은 넘치는 만큼 오래된 줄부터 뺀다.
const fitOn=()=>isP()||matchMedia('(min-width:720px)').matches;
function fitP(){const w=document.querySelector('#wrap.fit'),sc=w&&w.querySelector('.g-sc');if(!sc||!fitOn())return;
  w.classList.remove('loose');
  if(!isP()){const h=w.querySelector('.g-hud'),rows=h?[...h.querySelectorAll('.gs-lg')]:[];
    for(let i=rows.length-1;i>0&&h.scrollHeight>h.clientHeight+1;i--)rows[i].remove();}
  const over=()=>sc.scrollHeight>sc.clientHeight+1;let f=1;w.style.setProperty('--fz',f);
  while(over()&&f>.86){f=Math.round((f-.03)*100)/100;w.style.setProperty('--fz',f);}
  if(over())w.style.setProperty('--fz',1);
  else{while(f<1.18){const g=Math.round((f+.03)*100)/100;w.style.setProperty('--fz',g);if(over()){w.style.setProperty('--fz',f);break;}f=g;}
    const top=sc.getBoundingClientRect().top,used=[...sc.children].reduce((a,c)=>Math.max(a,c.getBoundingClientRect().bottom-top),0);
    if(sc.clientHeight-used>48)w.classList.add('loose');}
  pMore(sc);}
// 스크롤 칸 아래를 흐려서 글이 더 있다는 것을 알린다(끝까지 내리면 사라진다)
function pMore(sc){sc=sc||document.querySelector('.pfit>.p-sc');if(!sc||!fitOn())return;
  const more=()=>sc.classList.toggle('more',sc.scrollTop+sc.clientHeight<sc.scrollHeight-4);more();sc.onscroll=more;}
{let t=0;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(fitP,120);});try{document.fonts.ready.then(fitP);}catch(e){}}
function hud(o){if(isP())return hudP(o);const y=Math.floor(S.turn/PY)+1,v=Math.round(S.i),X=SCX(),hs=hudStats();
  const lb=X.lv[Math.min(4,Math.floor(v/20))];
  const c=v<20?'#2e7d55':v<40?'#9a6400':v<60?'#b8541e':'#b3261e';const cL={'#2e7d55':'#7fd8a8','#9a6400':'#f0c060','#b8541e':'#f39a62','#b3261e':'#ff8f86'}[c];
  let seg='';for(let k=0;k<YRS*PY;k++){const col=k<hist.length?TIER[hist[k]].bd:(k===S.turn?c:'rgba(29,27,24,.09)');seg+='<span style="flex:1;height:4px;border-radius:2px;background:'+col+';'+(k===S.turn&&k>=hist.length?'animation:pls 1.2s infinite;':'')+(k%PY===PY-1&&k<YRS*PY-1?'margin-right:4px;':'')+'"></span>';}
  const coins='<span class="dots" aria-label="'+tok+'회">'+'<i></i>'.repeat(tok)+'</span>';
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
  '<span style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span style="background:rgba(47,74,107,.18);color:#3d5a80;font-weight:700;padding:2px 8px;border-radius:6px">'+(CP.id==='joseon'?'치세 '+CAR.term:CAR.term+'기')+'</span><span style="color:var(--text-secondary);font-weight:600">'+y+'년차</span><span>'+(S.turn%PY+1)+'/'+PY+'</span><span style="opacity:.75">· '+ageNow()+'세 · '+DIFF[dif].n+(CAR.term>1?' +'+(CAR.term-1):'')+'</span></span>'+
  '<span style="display:flex;gap:6px"><button id="snd" style="width:32px;height:28px;padding:0;display:flex;align-items:center;justify-content:center" aria-label="소리 설정">'+sndIco()+'</button>'+moreBtn()+'</span></div>'+
  '<div style="display:flex;gap:2px;margin-bottom:10px">'+seg+'</div>'+
  '<div style="position:relative;border-radius:10px;overflow:hidden;background:#1d1b18;margin-bottom:12px;--text-secondary:#cfc6b4;--text-muted:#a39a88"><canvas id="map" style="width:100%;height:118px"></canvas>'+
  '<div id="hstat" style="position:absolute;left:8px;top:7px;background:rgba(10,14,20,.66);border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:5px 10px 6px;line-height:1.4">'+
   '<div style="font-size:10.5px;letter-spacing:.06em;color:#ff8f86;font-weight:700;display:flex;align-items:center;gap:5px"><span style="width:6px;height:6px;border-radius:50%;background:#ff8f86;animation:pls 1.4s infinite"></span>'+(CP.id==='joseon'?'장계':'LIVE')+' · '+scnName()+'</div>'+
   hs.map((q,j)=>'<div style="font-size:11px;color:var(--text-secondary);white-space:nowrap;line-height:1.5">'+q[0]+' <span style="color:#fff;font-size:13px;font-weight:700">'+odoHTML(X.id+(isCov()?'':CAR.term)+'_'+j,q)+'</span></div>').join('')+'</div>'+
  '<div style="position:absolute;left:10px;bottom:7px;font-size:12px;color:var(--text-secondary);text-shadow:0 1px 6px rgba(0,0,0,.8)">'+X.iName+' <span style="font-weight:600;color:'+cL+'">'+v+'</span> <span style="color:'+cL+'">'+lb+'</span></div>'+
  // 올림픽 중에는 지도 이름 자리에 메달 집계를 띄운다
  (CAR&&CAR.spRun&&OLY_IDS.indexOf(CAR.spRun.id)>=0&&CAR.spRun.ctx.med?'<div class="map-med">'+CAR.spRun.ctx.med.map((n,k)=>'<i class="m'+k+'">'+['금','은','동'][k]+'</i><b>'+n+'</b>').join('')+'</div>'
   :'<div style="position:absolute;right:10px;top:8px;font-size:11px;color:var(--text-muted)">'+X.map+'</div>')+'</div>'+
  statsHTML()+
  '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:12px;color:var(--text-muted)">'+
  '<span style="display:inline-flex;align-items:center;gap:6px">운명 개입 '+(tok?coins:'<span style="opacity:.5">없음</span>')+'</span>'+
  // 가로 화면의 비상소집은 상황판의 작은 버튼으로(세로 화면의 상태 바 버튼과 같은 역할) 둬서 오른쪽 사건 칸을 줄인다
  (o&&o.em&&!CAR.cnEm?'<button id="cnEm" class="gs-em" aria-label="비상소집: 전설 '+roleOf().n+' 부르기, 커리어에 한 번">비상소집</button>':'')+
  (streak>=2?'<span style="color:#2e7d55;font-weight:700">연속 '+streak+(streak>=4?' 모멘텀':'')+'</span>':'<span></span>')+'</div>'+
  '<div style="overflow:hidden;white-space:nowrap;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:7px 0;margin-bottom:16px"><span style="display:inline-block;padding-left:100%;animation:tk 30s linear infinite;animation-delay:-7s;font-size:12px;color:var(--text-secondary)"><span style="color:var(--text-danger);font-weight:600">'+(CP.id==='joseon'?'풍문':'속보')+'</span>&nbsp; '+headlines()+'</span></div>';}
// 위기 지수가 클수록 화면 가장자리가 짙게 붉어지고 안쪽까지 번진다(위기 10부터, 100이면 투명도 0.62).
// 52 이상이면 예전 심장 박동과 같은 빠르기로 두 번씩 맥박친다(위기가 클수록 빨라진다). '동작 줄이기'·라이트 모드에서는 맥박 없이 색만 둔다.
function vign(){const i=S.i,a=Math.min(.62,Math.max(0,(i-10)/90)*.62),c=Math.round(58-Math.min(1,i/100)*26),
    beat=i>=52&&!reduceFx()?';animation:vgBeat '+Math.max(.6,(1350-i*7)/1000).toFixed(2)+'s ease-in-out infinite':'';
  return '<div style="position:absolute;inset:-6px;pointer-events:none;border-radius:12px;background:radial-gradient(ellipse at center,transparent '+c+'%,rgba(196,22,20,'+a.toFixed(3)+') 100%)'+beat+'"></div>';}
function bindSnd(){const b=document.getElementById('snd');if(b)b.onclick=toggleSound;
  document.querySelectorAll('[data-sv]').forEach(x=>x.onclick=()=>{SFX.click();svAct(x.dataset.sv);});document.querySelectorAll('.g-more').forEach(x=>x.onclick=()=>{SFX.click();gameMenu();});odoRun();bindTips();
  const lv=document.getElementById('hpLive');if(lv)lv.onclick=()=>{hpMap=!hpMap;lv.setAttribute('aria-expanded',hpMap);const m=lv.nextElementSibling;if(m)m.hidden=!hpMap;fitP();};}

// 특별 이벤트 무대: 이벤트마다 고유한 색과 상징을 사건 카드 뒤에 깐다. 처음 보는 사람도 "평소와 다른 순간"임을 알아보도록.
const SPX_ART={
 track:'<ellipse cx="60" cy="72" rx="56" ry="30"/><ellipse cx="60" cy="72" rx="44" ry="21"/><ellipse cx="60" cy="72" rx="32" ry="12"/><path d="M60 8c7 9 9 15 4 22-3 4-8 4-11 0-4-6 0-13 7-22z"/><path d="M53 34h14l-3 22h-8z"/>',
 globe:'<circle cx="60" cy="60" r="44"/><ellipse cx="60" cy="60" rx="18" ry="44"/><ellipse cx="60" cy="60" rx="34" ry="44"/><path d="M16 60h88M22 38h76M22 82h76"/>',
 table:'<circle cx="60" cy="60" r="30"/>'+Array.from({length:20},(_,i)=>{const a=i/20*Math.PI*2;return '<circle cx="'+(60+44*Math.cos(a)).toFixed(1)+'" cy="'+(60+44*Math.sin(a)).toFixed(1)+'" r="4"/>';}).join(''),
 branch:'<path d="M14 98C40 76 70 52 106 20"/>'+[[30,84,-35],[44,72,-30],[58,60,-40],[72,48,-35],[86,36,-38],[38,80,55],[52,68,50],[66,56,55],[80,44,50]].map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="10" ry="4.5" transform="rotate('+p[2]+' '+p[0]+' '+p[1]+')"/>').join(''),
 seal:'<rect x="18" y="18" width="84" height="84" rx="6"/><rect x="28" y="28" width="64" height="64" rx="3"/>',
 gate:'<path d="M22 108V26M98 108V26M12 30h96M12 44h96"/>'+Array.from({length:9},(_,i)=>'<path d="M'+(32+i*7)+' 44V22"/>').join('')+'<circle cx="60" cy="16" r="6"/>',
 scroll:'<rect x="26" y="20" width="68" height="84" rx="3"/><path d="M20 20h80M20 104h80M38 36v52M52 36v52M66 36v40M80 36v52"/>',
 books:'<rect x="18" y="80" width="84" height="16" rx="2"/><rect x="26" y="62" width="70" height="16" rx="2"/><rect x="22" y="44" width="76" height="16" rx="2"/><rect x="32" y="26" width="58" height="16" rx="2"/>',
 shield:'<path d="M60 12L98 26V58C98 82 80 100 60 108C40 100 22 82 22 58V26Z"/><path d="M42 46L78 82M78 46L42 82"/>',
 vial:'<rect x="48" y="24" width="24" height="60" rx="5" transform="rotate(40 60 54)"/><path d="M83 27L95 15M90 20L100 30M36 82L22 96"/><path d="M45 62L57 50M51 70L63 58"/>',
 gear:'<circle cx="60" cy="60" r="22"/><circle cx="60" cy="60" r="8"/>'+Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return '<path d="M'+(60+30*Math.cos(a)).toFixed(1)+' '+(60+30*Math.sin(a)).toFixed(1)+'L'+(60+42*Math.cos(a)).toFixed(1)+' '+(60+42*Math.sin(a)).toFixed(1)+'"/>';}).join(''),
 flake:Array.from({length:6},(_,i)=>{const a=i*60;return '<g transform="rotate('+a+' 60 60)"><path d="M60 60V14"/><path d="M60 28l-10-10M60 28l10-10M60 42l-8-8M60 42l8-8"/></g>';}).join('')+'<circle cx="60" cy="60" r="7"/>',
 moon:'<path d="M76 18a42 42 0 1 0 26 66A34 34 0 1 1 76 18z"/><circle cx="24" cy="26" r="2"/><circle cx="102" cy="30" r="1.6"/><circle cx="16" cy="70" r="1.6"/><ellipse cx="60" cy="60" rx="58" ry="16" transform="rotate(-18 60 60)"/>'};
const SPX={
 olym:{bg:'#1d4f73',ac:'#e3a72f',art:'track'},wolym:{bg:'#1b4566',ac:'#cfe8f7',art:'flake'},wolym_u:{bg:'#1b4566',ac:'#cfe8f7',art:'flake'},expo:{bg:'#1f6b63',ac:'#e8c872',art:'globe'},g20:{bg:'#2b3a55',ac:'#c9a85a',art:'table'},
 peace:{bg:'#3d6b88',ac:'#f0e3b0',art:'branch'},war_k:{bg:'#3a2a1c',ac:'#d9a441',art:'shield'},war_j:{bg:'#3a2a1c',ac:'#d9a441',art:'shield'},war_u:{bg:'#3a2a1c',ac:'#d9a441',art:'shield'},
 pand_k:{bg:'#1f5f5a',ac:'#e8f0d8',art:'vial'},pand_j:{bg:'#1f5f5a',ac:'#e8f0d8',art:'vial'},pand_u:{bg:'#1f5f5a',ac:'#e8f0d8',art:'vial'},olym_u:{bg:'#1d4f73',ac:'#e3a72f',art:'track'},newdeal:{bg:'#3b4a2a',ac:'#e6cf9a',art:'gear'},moon:{bg:'#141b2d',ac:'#e8e2c8',art:'moon'},
 amend:{bg:'#5a1410',ac:'#e0b23c',art:'seal',ch:'憲'},amend22:{bg:'#5a1410',ac:'#e0b23c',art:'seal',ch:'憲'},coup:{bg:'#3a0f0c',ac:'#e0b23c',art:'seal',ch:'亂'},
 jikgye:{bg:'#4a1712',ac:'#d9b25a',art:'seal',ch:'權'},envoy:{bg:'#7a1f1a',ac:'#4f9a8a',art:'gate'},gwageo:{bg:'#33312c',ac:'#c7a35a',art:'scroll'},compile:{bg:'#4b3a26',ac:'#e6cf9a',art:'books'}};
function spxOpen(){const R0=CAR.spRun||{},X=SPX[R0.id]||(R0.k==='power'?SPX.amend:SPX.g20),i=cur.sp.i,n=cur.sp.n;
  const dots=Array.from({length:n},(_,j)=>'<i'+(j<i?' class="d"':j===i?' class="c"':'')+'></i>').join('');
  // 특집마다 머리에 한 줄을 더한다: 올림픽은 메달 집계, 방역은 작은 상황판
  const oly=OLY_IDS.indexOf(R0.id)>=0,pand=/^pand_/.test(R0.id||''),m=R0.ctx&&R0.ctx.med;
  const bar=(k,v,c)=>'<span>'+k+'<em><i style="width:'+Math.max(0,Math.min(100,v))+'%;background:'+c+'"></i></em><b>'+Math.round(v)+'</b></span>';
  const extra=oly&&m?'<div class="spx-med">'+olyTally(m)+'</div>':pand?'<div class="spx-dash">'+bar(SCX().iName||'위기 지수',S.i,S.i>=50?'#ff7b6b':S.i>=25?'#ffd166':'#7ee0a8')+bar(vName('H'),vVal('H'),'#8fd3ff')+bar(vName('A'),vVal('A'),'#f1d589')+'</div>':'';
  return '<div class="spx'+(oly?' oly':'')+'" style="--sb:'+X.bg+';--sa:'+X.ac+'"><svg class="spx-art" viewBox="0 0 120 120" aria-hidden="true">'+SPX_ART[X.art]+(X.ch?'<text x="60" y="76" text-anchor="middle" font-size="44" font-weight="800" stroke="none" fill="currentColor">'+X.ch+'</text>':'')+'</svg>'+
   '<div class="spx-h"><b class="hd">'+(R0.n||'특별 이벤트')+'</b><span class="spx-st">특별 이벤트 · '+String(cur.tag||'').replace('특별 이벤트 · '+(R0.n||'')+' ','').replace('/',' / ')+'<span class="spx-d">'+dots+'</span></span>'+extra+'</div>';}

function ev(){if(pendingNews){const n=pendingNews;pendingNews=null;return breaking(n,ev);}
  if(cur.bn&&bnSeen!==cur){bnSeen=cur;return breaking(cur.bn,ev);}
  SVAT='ev';
  SHOWN=Date.now();window.scrollTo(0,0);const tfd=turnFx()?820:0;if(alLast!==cur&&(cur===UPR||cur===IMP||cur===VARIANT||cur.tm)){alLast=cur;SFX.alert(tfd/1000);}
  const tag=cur.tag||(cur.st?'지표가 부른 사건':cur.tm?'권력의 시험':cur===UPR||cur===IMP?'정권 위기':Object.values(CH).indexOf(cur)>=0?'지난 결정의 여파':'');
  const tc=cur.tc||(cur.st?'#9a6400':cur.tm?'#b3261e':cur===UPR||cur===IMP?'#b3261e':'#2f4a6b');
  const bn=banner;banner='';const P=isP();
  // 세로 화면(fit): 위 상태 바 · 가운데 사건(g-sc, 넘치면 그 안에서만 스크롤) · 아래 선택지(g-bt) 세 칸으로 한 화면에 맞춘다
  R.innerHTML='<div id="wrap"'+(cur.mg?'':' class="fit"')+' style="position:relative;--tfd:'+tfd+'ms">'+vign()+'<div class="g-hud">'+hud({em:1})+sideHTML()+'</div><div class="g-main"><div class="g-sc">'+
  (bn?'<div style="font-size:12px;color:#a8321f;background:rgba(179,38,30,.12);border:1px solid rgba(179,38,30,.3);border-radius:8px;padding:7px 11px;margin-bottom:10px;animation:fdIn .3s ease-out">'+bn+'</div>':'')+
  tip('choose')+(cur.path?tip('path'):'')+(cur.sp?tip('special'):'')+(P?'':urgentHTML())+
  (cur.sp?spxOpen():'')+'<div class="evc go'+(cur.sp?' evsp':'')+'" style="background:var(--surface-2);border:1px solid var(--border);border-radius:14px;padding:18px 18px 17px;margin-bottom:14px;animation:fdIn .3s ease-out">'+
  '<div class="hd evt" style="font-size:21px;line-height:1.38;text-wrap:balance">'+cur.t+'</div>'+
  (tag&&!cur.sp?'<div class="evg" style="font-size:12.5px;font-weight:600;color:'+tc+';margin-top:4px">'+tag+'</div>':'')+
  '<div class="evd" style="font-size:15px;color:var(--text-secondary);line-height:1.75;margin-top:12px">'+cur.d+'</div></div>'+(cur.sp?'</div>':'')+
  '</div><div class="g-bt"><div id="gOpts" style="display:flex;flex-direction:column;gap:10px"></div></div>'+
  (cur._cr=cnRec(cur.o),'')+'</div>'+
  '<div id="fx"style="position:absolute;inset:-6px;display:flex;align-items:center;justify-content:center;pointer-events:none"></div></div>';
  const ob=document.getElementById('gOpts');
  // 참모의 조언: 두 사람이 각자 자기 분야에 맞는 선택지를 권한다. 카드에는 누가 권했는지만 붙인다.
  // 세로 화면에서는 조언 블록 대신 선택지에 참모 얼굴을 붙이고, 비상소집은 상태 바의 버튼으로 옮긴다
  // 가로 화면에서는 조언을 사건 칸(g-sc) 끝에 둔다. 보이는 순서는 같고, 선택지 칸(g-bt)에는 선택지만 남아 늘 화면 아래에 보인다. 비상소집은 왼쪽 상황판 버튼(hud).
  const CR=cur._cr||[],recOf=k=>CR.filter(r=>r.k===k).map(r=>(P?portrait(r.c.n,18):'')+r.c.n).join(P?' ':' · ');
  const scBox=document.querySelector('#wrap .g-sc')||ob.parentNode;
  if(CR.length&&!P){const rc=document.createElement('div');rc.className='advrec';
    rc.innerHTML=CR.map(r=>'<div class="ar">'+portrait(r.c.n,30)+'<div><span class="rk">'+r.c.n+' <small>'+'★'.repeat(r.c.t)+' '+CN_DOM[r.c.d].n+'</small> → '+(r.k+1)+'번</span> <span class="rq">"'+r.line+'"</span></div></div>').join('');
    scBox.appendChild(rc);}
  {const em=document.getElementById('cnEm');if(em)em.onclick=()=>{SFX.click();cnEmerg(ev);};}
  cur.o.forEach((o,k)=>{const b=document.createElement('button');b.className='opt';
    b.style.animationDelay=(tfd+80+k*70)+'ms';
    const add=(c,h)=>{if(!h)return;const z=document.createElement('span');z.className=c;z.innerHTML=h;b.appendChild(z);};
    const tx=document.createElement('span');tx.className='opt-t';tx.innerHTML='<span class="opt-n">'+(k+1)+'</span>';
    const tt=document.createElement('span');tt.className='opt-tt';tt.appendChild(document.createTextNode(o[0]));tx.appendChild(tt);b.appendChild(tx);
    if(o[1].X==='quit'){add('opt-m','<span class="stk sq">커리어 종료</span>');}
    else{const s=stakeOf(o,cur.o),P=stakeP(fitOf(o,cur.o).q,s),ok=Math.round((P[0]+P[1])*100),bg=Math.round(P[0]*100),cf=Math.round(P[3]*100),rc=recOf(k);
      // 국민투표·계엄은 판정이 아니라 이벤트 확률로 결과가 갈리므로 그 확률을 크게 보여 준다
      const sx=spFixed(o)&&CAR.spRun?(o[4].vote?[CAR.spRun.ctx.passP,'통과']:[CAR.spRun.ctx.coupP,'거사 성공']):null;
      tx.insertAdjacentHTML('beforeend',sx?'<span class="opt-ok"><b>'+sx[0]+'<small>%</small></b><span>'+sx[1]+'</span></span>':'<span class="opt-ok"><b>'+ok+'<small>%</small></b><span>성공</span></span>');
      add('opt-c',chipsHTML(o[1]));
      if(sx){add('opt-m','<span class="opt-p">판정 주사위 없이 '+sx[1]+' 확률 '+sx[0]+'%로만 갈린다</span>');}else{
      add('opt-bar',P.map((p,j)=>p>.0005?'<i class="t'+j+'" style="flex:'+p.toFixed(4)+'"></i>':'').join(''));
      add('opt-m','<span class="stk s'+s+'">'+STK[s].n+'</span><span class="opt-p">대성공 '+bg+'% · <span class="pp-c">'+(cf?'대실패 '+cf+'%':'대실패 없음')+'</span></span>'+(rc?'<span class="opt-rec">'+(P?'':'★ ')+rc+'</span>':''));}}
    b.onclick=()=>choose(k);ob.appendChild(b);});
  if(cur.mg){ob.innerHTML='';const rc=scBox.querySelector('.advrec');if(rc)rc.remove();const eb=document.getElementById('cnEm');if(eb)eb.remove();mgRun(cur.mg,ob);}
  bindSnd();fitP();}

// 판정 룰렛: 칸 크기 = 그 결과가 나올 확률. 바늘이 돌다가 멈춘 칸이 결과다. 상황에 맞는 선택일수록 초록 칸이 넓고, 대실패 칸은 사라진다.
const WCOL=['#2e7d55','#7a7366','#9a6400','#b3261e'];
function wheelSVG(P){const cx=80,cy=96,r=70,pt=(d,rr)=>{const t=(d-90)*Math.PI/180;return [cx+rr*Math.cos(t),cy+rr*Math.sin(t)];};
  let a=0,s='';const segs=[];
  P.forEach((p,k)=>{if(p<=.0005){segs.push(null);return;}const a0=a,a1=a+p*360;a=a1;segs.push([a0,a1]);
    if(p>=.9995)s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+WCOL[k]+'"/>';
    else{const A=pt(a0,r),B=pt(a1,r);s+='<path d="M'+cx+' '+cy+' L'+A[0].toFixed(2)+' '+A[1].toFixed(2)+' A'+r+' '+r+' 0 '+(a1-a0>180?1:0)+' 1 '+B[0].toFixed(2)+' '+B[1].toFixed(2)+' Z" fill="'+WCOL[k]+'" stroke="#1d1b18" stroke-width="2"/>';}
    if(p>=.07){const M=pt((a0+a1)/2,r*.63);s+='<text x="'+M[0].toFixed(1)+'" y="'+M[1].toFixed(1)+'" fill="#fff" font-size="'+(p>=.18?13:10)+'" font-weight="700" text-anchor="middle" dominant-baseline="central">'+Math.round(p*100)+'%</text>';}});
  return {s:s,segs:segs};}
// 라이트 모드·세로 화면·'동작 줄이기' 기기에서도 룰렛과 판정 글자가 보이도록 바늘 transition과 판정 animation은 important로 건다
function reel(t,cb){
const f=document.getElementById('fx'),w=document.getElementById('wrap'),q=lastFit.q,P=stakeP(q,lastS),W=wheelSVG(P),fw=fitWord(q);
  const sg=W.segs[t]||[0,1],th=sg[0]+(sg[1]-sg[0])*(.18+.64*Math.random()),rot=360*4+th;
  f.innerHTML='<div class="whl">'+
   '<div class="whl-h"><span class="stk s'+lastS+'">'+STK[lastS].n+'</span> <b style="color:'+fw[1]+'">'+fw[0]+'</b></div>'+
   '<svg viewBox="0 0 160 172" class="whl-s" aria-hidden="true"><circle cx="80" cy="96" r="75" fill="#1d1b18"/>'+W.s+
   '<g id="whg" style="transform-origin:80px 96px;transform:rotate(0deg)"><path d="M80 34 L74 92 L86 92 Z" fill="#fff" stroke="#141a21" stroke-width="1.5"/></g>'+
   '<circle cx="80" cy="96" r="11" fill="#1d1b18" stroke="#fff" stroke-width="2"/></svg>'+
   '<div class="whl-l">'+TIER.map((T,k)=>'<span><i style="background:'+WCOL[k]+'"></i>'+T.n+' '+(P[k]>.0005?Math.round(P[k]*100)+'%':'<b style="opacity:.5">없음</b>')+'</span>').join('')+'</div><div class="whl-k">누르면 바로 멈춘다</div></div>';
  const g=document.getElementById('whg'),SP=1350;let done=false;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{g.style.setProperty('transition','transform '+SP+'ms cubic-bezier(.12,.72,.18,1)','important');g.style.transform='rotate('+rot+'deg)';}));
  // 바늘이 칸 경계를 지날 때마다 딸깍: 바늘 회전(cubic-bezier .12,.72,.18,1)을 그대로 따라가 경계를 넘는 순간에 소리를 예약한다.
  // 처음엔 촘촘하다가 바늘이 느려지는 만큼 간격이 벌어진다. 칸이 4개보다 적으면 90°마다 핀이 있는 것으로 친다.
  const bz=(a,b,s)=>3*(1-s)*(1-s)*s*a+3*(1-s)*s*s*b+s*s*s,
    ease=x=>{let lo=0,hi=1;for(let i=0;i<18;i++){const m=(lo+hi)/2;if(bz(.12,.18,m)<x)lo=m;else hi=m;}return bz(.72,1,(lo+hi)/2);};
  let pins=W.segs.filter(Boolean).map(s=>s[0]);if(pins.length<4)pins=[0,90,180,270];
  const TK=[];{let prev=0,lastT=-99;for(let ms=6;ms<=SP;ms+=6){const a=ease(ms/SP)*rot;let n=0;pins.forEach(b=>{n+=Math.floor((a-b)/360)-Math.floor((prev-b)/360);});
    if(n>0&&ms-lastT>=28){lastT=ms;TK.push(setTimeout(SFX.rtick,ms+25));}prev=a;}}
  SFX.spin();
  // 판정 글자는 룰렛 칸 색의 카드에 담아 1초 넘게 띄운다(뒤의 글과 겹쳐도 읽히게, '성공'도 놓치지 않게)
  const fin=()=>{if(done)return;done=true;const T=TIER[t],ms=Math.max(1100,T.ms);SFX.rstop();SFX.tier(t);vib(t===3?[70,50,90]:t===2?45:t===0?[20,30,20]:0);
     f.innerHTML='<div style="position:absolute;inset:0;background:'+T.tint+';border-radius:12px;animation:fxT '+ms+'ms ease-out forwards!important"></div>'+
     (document.documentElement.dataset.lite?'<div style="position:relative;padding:12px 30px 12px 35px;border-radius:16px;background:var(--surface-2);border:2px solid '+WCOL[t]+';box-shadow:0 14px 34px -8px rgba(70,50,20,.38);font-size:'+Math.max(30,T.fs)+'px;font-weight:700;letter-spacing:5px;color:'+WCOL[t]+';animation:fxL '+ms+'ms ease-out forwards!important">'+T.n+'</div>'
     :'<div class="vd vd'+t+'" style="--ms:'+ms+'ms"><span class="vd-s"><b class="vd-n">'+T.n+'</b></span></div>');
     // 도장이 바닥에 닿는 순간(0.17초) 쿵 소리
     if(!document.documentElement.dataset.lite)try{thud(t===3?110:140,t%3===0?.2:.13,.17,.2);}catch(e){}
     if(t>=2)w.style.animation='shk '+(t===3?480:320)+'ms ease-out';
     setTimeout(()=>{w.style.animation='';f.innerHTML='';cb();},ms);};
  setTimeout(fin,SP+150);
  // 룰렛을 누르면 바늘이 바로 멈춘다
  const wl=f.querySelector('.whl');if(wl){wl.style.pointerEvents='auto';wl.style.cursor='pointer';wl.onclick=()=>{if(done)return;TK.forEach(clearTimeout);SFX.rtick();g.style.setProperty('transition','transform 140ms ease-out','important');g.style.transform='rotate('+rot+'deg)';setTimeout(fin,170);};}}

function takeSnap(){snap={S:Object.assign({},S),deaths:deaths,yd:yd,cd:cDeaths,cv:covD,q:queue.slice(),cl:chron.length,hl:hist.length,st:streak,pi:peakI,th:TH.length};}
function useSnap(){S=Object.assign({},snap.S);deaths=snap.deaths;yd=snap.yd;cDeaths=snap.cd;covD=snap.cv;queue=snap.q.slice();chron.length=snap.cl;hist.length=snap.hl;streak=snap.st;peakI=snap.pi;TH.length=snap.th;}

// 적합도 = 급한 문제를 겨냥했는가(같은 사건의 다른 선택지와 비교) + 통치 방식이 지금 여건에 맞는가 + 여력
// 급한 정도: 지금 눈앞의 문제들만 센다(견제·투명성 같은 제도 지표는 판정이 아니라 시간이 흐르며 결과로 드러난다)
// 위기 지수는 그대로 두면 스스로 커지므로 조금 더 급하게 본다
const URG={i:s=>Math.min(1,(s.i+15)/100),m:s=>(100-s.m)/100,e:s=>(100-s.e)/100,a:s=>(100-s.a)/100*.8,u:s=>s.u/100,c:s=>s.c/100*.5,saf:s=>(100-s.saf)/100*.5,mil:s=>(100-(s.mil==null?50:s.mil))/100*.75};
const UNM=k=>({i:SCX().short,m:'대응 여력 부족',e:KN.e+' 침체',a:'민심 이반',u:KN.u,c:'부패',mil:'안보 공백',saf:'안전망 부족',chk:'견제 약화',trn:'불투명'}[k]);
// 지금 급한 문제: 급한 정도가 0.45 이상인 것 중 위의 두 개
function urgentKeys(){return ['i','m','e','a','u','c','mil'].map(k=>[k,URG[k](S)]).filter(x=>x[1]>=.45).sort((a,b)=>b[1]-a[1]).slice(0,2);}
function urgentHTML(short){const u=urgentKeys();
  if(!u.length)return '<div class="urg"><span class="urg-l">'+(short?'급한 문제':'지금 급한 문제')+'</span><span class="urg-ok">'+(short?'없음':'뚜렷한 위기 없음 · 여유가 있다')+'</span></div>';
  return '<div class="urg"><span class="urg-l">'+(short?'급한 문제':'지금 급한 문제')+'</span>'+u.map(x=>{const lv=x[1]>=.68?3:x[1]>=.56?2:1,col=lv===3?'#b3261e':lv===2?'#b8541e':'#9a6400';
    const vk=K2V[x[0]];return '<span class="urg-c" style="border-color:'+col+'66'+(vk?';background:color-mix(in srgb,'+V6[vk].col+' 14%,transparent)':'')+'">'+(vk?'<i class="urg-v" style="background:'+V6[vk].col+'"></i>':'')+'<b style="color:'+col+'">'+'●'.repeat(lv)+'<span style="opacity:.25">'+'●'.repeat(3-lv)+'</span></b> '+UNM(x[0])+'</span>';}).join('')+'</div>';}
const riskOf=q=>q>=.28?[0,'위험 낮음']:q<=-.28?[2,'위험 높음']:[1,'위험 보통'];
const fitWord=q=>q>=.28?['상황에 잘 맞는 선택','#2e7d55']:q<=-.28?['상황에 맞지 않는 선택','#b3261e']:['무난한 선택','#9a6400'];
function needOf(e){let n=0,d=0;for(const k in URG){const v=e[k];if(!v)continue;n+=(BAD[k]?-v:v)*URG[k](S);d+=Math.abs(v);}return d?n/d:0;}
function fitOf(o,opts){const e=o[1],why=[];
  if(e.X==='crush'){const able=S.p>52&&S.a>32;return {q:able?.3:-.2,why:[able?['+','권력과 지지율이 뒷받침했다']:['-','강제로 밀어붙일 힘이 없었다']]};}
  if(e.X==='quit')return {q:0,why:[]};
  const ns=opts.filter(x=>!x[1].X).map(x=>needOf(x[1])),mean=ns.length?ns.reduce((a,b)=>a+b,0)/ns.length:0,need=needOf(e);
  const qn=Math.max(-1,Math.min(1,(need-mean)*2.6+need*.6));
  let top=null,tv=0;for(const k in URG){const v=e[k];if(!v)continue;const g=(BAD[k]?-v:v)*URG[k](S);if(g>tv){tv=g;top=k;}}
  let worst='i',wv=-1;for(const k of ['i','m','e','a','u','c']){const u=URG[k](S);if(u>wv){wv=u;worst=k;}}
  if(qn>=.3&&top){const hot=URG[top](S)>=.45,vn=vName(K2V[top]||'A');why.push(['+',hot?'지금 급한 '+UNM(top)+' 문제를 겨냥했다':vn+' 쪽을 미리 챙겼다',qn,hot?'지금 급한 '+UNM(top)+' 문제를 겨냥한다':vn+' 쪽을 미리 챙긴다']);}
  else if(qn<=-.3){if(wv>=.45)why.push(['-','가장 급한 '+UNM(worst)+' 문제를 비켜 갔다',-qn,'가장 급한 '+UNM(worst)+' 문제를 비켜 간다']);else why.push(['-','다른 안보다 나라에 보탬이 덜 됐다',-qn,'다른 안보다 나라에 보탬이 덜 된다']);}
  const dir=(e.p||0)+(e.c||0)-(e.chk||0)-(e.trn||0);let gov=0;
  // 강경 조치는 행정 장악력이 있고 위기가 급할 때, 협치는 신뢰가 있고 시간 여유가 있을 때 잘 먹힌다
  if(dir>=5){const cap=(S.p-35)/50,res=Math.max(0,S.u-45)/45,rush=S.i>=55?.2:S.i>=40?.08:0;gov=cap-res+rush;
    if(rush>=.2&&gov>=.1)why.push(['+','위기가 급해 빠른 조치가 먹혔다',gov,'위기가 급해 빠른 조치가 먹힐 때다']);
    else if(gov>=.15)why.push(['+','권력이 뒷받침했다',gov,'권력이 뒷받침한다']);else if(gov<=-.15)why.push(['-',res>.2?'반발이 커서 강제 조치가 먹히지 않았다':'밀어붙일 권력이 부족했다',-gov,res>.2?'반발이 커서 역풍을 맞을 수 있다':'밀어붙일 권력이 모자란다']);}
  else if(dir<=-5){const tr=((S.trn+S.a)/2-60)/50,calm=S.i<25?.12:S.i>=55?-.12:0;gov=tr+calm;
    if(calm<0&&gov<=-.1)why.push(['-','위기가 급해 설득할 시간이 없었다',-gov,'위기가 급해 설득할 시간이 없다']);
    else if(gov>=.15)why.push(['+','높은 신뢰 덕분에 협조가 잘 됐다',gov,'신뢰가 높아 협조를 얻기 쉽다']);else if(gov<=-.15)why.push(['-','신뢰가 낮아 협조를 얻지 못했다',-gov,'신뢰가 낮아 협조를 얻기 어렵다']);}
  let cap=0;
  if((e.e||0)<0&&S.e<35){cap-=.25;why.push(['-','경제 여력이 없었다',.25,'경제 여력이 바닥이라 버티기 어렵다']);}
  if((e.a||0)<0&&S.a<30){cap-=.2;why.push(['-','지지율이 바닥이라 밀어붙일 힘이 없었다',.2,'지지율이 바닥이라 밀어붙일 힘이 없다']);}
  if((e.i||0)<=-9&&S.m<30){cap-=.15;why.push(['-','의료 현장이 버티지 못했다',.15,'의료 현장이 버티지 못할 수 있다']);}
  if(streak>=3){cap+=.1;why.push(['+','연속 성공의 흐름을 탔다',.1,'연속 성공의 흐름을 타고 있다']);}
  const q=Math.max(-1,Math.min(1,.65*qn+.35*gov+cap-.06*dif-.04*(CAR.term-1)));
  why.sort((a,b)=>b[2]-a[2]);
  return {q:Math.round(q*100)/100,why:why.slice(0,3),all:why};}
let lastFit={q:0,why:[]},lastS=1;

// ---------- 참모의 판단 ----------
// 장단점: 지금 상황(적합도 이유) → 효과 → 성격 순서. 두 참모는 같은 기대 이익을 놓고 위험을 다르게 본다.
const GW={a:['상승','하락'],e:['회복','타격'],m:['확충','부담'],i:['진정','악화'],c:['감소','증가'],u:['완화','심화'],saf:['강화','약화'],trn:['상승','하락'],chk:['강화','약화'],p:['강화','축소']};
const kName=k=>k==='i'?SCX().short:KN[k];
function advOf(o,opts,card){if(o[1].X==='crush')return {pro:['광장을 한 번에 비울 수 있다'],con:['실패하면 정권이 그 자리에서 끝난다','민주주의에 깊은 상처를 남긴다']};
  const e=o[1],f=fitOf(o,opts),s=stakeOf(o,opts),P=stakeP(f.q,s),pro=[],con=[];
  f.all.forEach(w=>(w[0]==='+'?pro:con).push(w[3]||w[1]));
  const d=dirOf(e)[0],skipP=Math.abs(d)>=5;
  if(d>=5){pro.push('빠르게 밀어붙일 힘이 생긴다');con.push('권력이 쏠리고 견제가 약해진다');}
  else if(d<=-5){pro.push('권력이 나뉘고 감시가 살아난다');con.push(S.i>=55?'위기가 급한데 대응이 느려질 수 있다':(e.p||0)<0?'대통령이 직접 움직일 힘이 줄어든다':'결정이 느려질 수 있다');}
  const VW={A:['상승','하락'],E:['회복','타격'],H:['개선','악화'],U:['완화','심화'],C:['감소','증가']};
  const ks=VORD.filter(k=>VW[k]).map(k=>[k,vDelta(k,e)]).filter(x=>Math.abs(x[1])>=1).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const ep=[],ec=[];ks.forEach(([k,v])=>{const good=vGood(k,v),amt=Math.abs(v),w=vName(k)+' '+(amt>=7?'크게 ':amt<=2?'조금 ':'')+VW[k][good?0:1];(good?ep:ec).push(w);});
  if(!pro.length&&ep.length)pro.push(ep[0]);if(!con.length&&ec.length)con.push(ec[0]);
  if(card){if(!pro.length&&ep[0])pro.push(ep[0]);if(!con.length&&ec[0])con.push(ec[0]);if(pro.length<2&&ep[1]&&pro.indexOf(ep[1])<0)pro.push(ep[1]);if(con.length<2&&ec[1]&&con.indexOf(ec[1])<0)con.push(ec[1]);
    if(!con.length)con.push(s===2?'결과가 크게 갈린다':s===0?'효과가 작다':'뚜렷한 단점이 없다');return {pro:pro.slice(0,2),con:con.slice(0,2)};}
  if(s===2){pro.unshift('잘되면 효과가 크다 (대성공 '+Math.round(P[0]*100)+'%)');con.unshift('결과가 크게 갈린다 (대실패 '+Math.round(P[3]*100)+'%)');}
  if(s===0){pro.unshift('크게 틀릴 일이 거의 없다');con.unshift('효과가 작다');}
  return {pro:pro.slice(0,3),con:con.slice(0,3)};}
function evOf(o,opts){const e=o[1];if(e.X)return null;const f=fitOf(o,opts),s=stakeOf(o,opts),P=stakeP(f.q,s);let G=0,B=0;
  for(const k in e){const v=e[k],good=BAD[k]?v<0:v>0,w=URG[k]?URG[k](S)+.15:.2;if(good)G+=Math.abs(v)*w;else B+=Math.abs(v)*w;}
  const val=TIER.map(T=>G*T.g*STK[s].g-B*T.b*STK[s].b),mean=P.reduce((a,p,i)=>a+p*val[i],0),sd=Math.sqrt(P.reduce((a,p,i)=>a+p*(val[i]-mean)*(val[i]-mean),0));
  return {mean:mean,sd:sd,s:s};}
function advPicks(opts){const E=opts.map(o=>evOf(o,opts));
  const best=(f)=>{const r=E.map((x,i)=>x?[f(x),i]:null).filter(Boolean).sort((a,b)=>b[0]-a[0]);if(!r.length)return -1;return r.length>1&&Math.random()<.25?r[1][1]:r[0][1];};
  return {safe:best(x=>x.mean-1.1*x.sd),bold:best(x=>x.mean+.25*x.sd)};}
function advLines(pk){const late=Math.floor(S.turn/PY)>=2,u=urgentKeys(),hot=u.length&&u[0][1]>=.68,edge=S.e<22||S.a<22||(S.m<22&&S.i>=60);
  const cs=edge?'한 번만 크게 틀려도 정권이 흔들립니다. 안전하게 가시죠.':S.a>=55?'지지율에 여유가 있습니다. 지키기만 해도 됩니다.':'크게 잃지 않는 쪽이 낫습니다.';
  const cb=S.a<40&&late?'이대로면 임기 말 지지율 35를 넘기기 어렵습니다. 한 번은 걸어야 합니다.':hot?'위기가 이 정도면 작은 대책으로는 못 막습니다.':'지금 크게 움직여야 판이 바뀝니다.';
  return {cs:cs,cb:cb};}
function advHTML(){const pk=cur._adv,L=advLines(pk);
  const item=(o,k)=>{if(o[1].X==='quit')return '';const a=advOf(o,cur.o),s=stakeOf(o,cur.o);
    return '<div class="adv-i"><div class="adv-t"><span class="opt-n">'+(k+1)+'</span>'+o[0]+'</div><div class="adv-pc"><div class="pros">'+a.pro.map(x=>'<span>＋ '+x+'</span>').join('')+'</div>'+(a.con.length?'<div class="cons">'+a.con.map(x=>'<span>－ '+x+'</span>').join('')+'</div>':'<div class="cons"><span class="none">뚜렷한 단점이 없다</span></div>')+'</div></div>';};
  const who=(n,r,k,line)=>'<div class="adv-q"><b>'+n+'</b><span class="adv-r">'+r+'</span> <span class="adv-k">'+(k+1)+'번</span>을 권한다. <span class="adv-l">"'+line+'"</span></div>';
  const sameP=pk.safe===pk.bold;
  return '<div class="advp"><div class="advp-h">참모의 판단</div>'+cur.o.map(item).join('')+
    (pk.safe<0?'':sameP?'<div class="adv-q"><b>참모진</b> 모두 <span class="adv-k">'+(pk.safe+1)+'번</span>을 권한다. <span class="adv-l">"이번엔 의견이 모였습니다."</span></div>'
      :who((CP.advN||ADVN0)[0],'신중론',pk.safe,L.cs)+who((CP.advN||ADVN0)[1],'승부론',pk.bold,L.cb))+'</div>';}
const ADVN0=['비서실장','정무수석'];
// 튜토리얼: 커리어마다 처음 한 번씩만 뜨는 짧은 안내. 홈에서 켜고 끌 수 있다.
const TIPS={
 choose:['선택하는 법','선택지 아래 <b>지표 이름과 화살표</b>는 그 선택이 움직이는 지표다. <b style="color:#2a6e4b">초록</b> 화살표는 나라에 좋은 변화, <b style="color:#a8321f">빨강</b>은 나쁜 변화. <b>지금 급한 문제</b>를 겨냥하는 지표에는 형광펜 밑줄이 그어지고, 그런 선택일수록 오른쪽 <b>성공 확률</b>이 높다. 막대는 대성공·성공·실패·대실패의 비율이다. <b>승부수</b>는 크게 얻거나 크게 잃고, <b>안전책</b>은 크게 틀리지 않는다. 고민되면 선택지 바로 위에 모인 조언과 ★표시를 참고하자.'],
 result:['결과 읽는 법','칩은 이번 선택으로 바뀐 지표와 그 크기다. 아래 <b>판정에 영향을 준 것</b>을 보면 왜 성공했는지, 왜 실패했는지 알 수 있다.'],
 reroll:['운명 개입','실패나 대실패가 나오면 보라색 버튼으로 <b>한 번 더 굴릴 수</b> 있다. 횟수가 적으니 정말 중요한 순간에 쓰자.'],
 board:['특별 국정 과제','한 해를 시작하기 전에 큰일을 하나 벌일 수 있다. <b>조건을 채운 칸만 색이 들어온다.</b> 회색 칸도 무엇이고 무엇이 모자란지 보인다. 어떤 과제는 선택지 대신 <b>직접 경기를 치러야</b> 한다.'],
 council:['인사의 시간','해마다 결산 뒤 곁에 둘 사람을 고른다. 나라가 잘하는 분야일수록 거물이 찾아오지만, 거물일수록 <b>대가</b>가 있고 기대에 못 미치면 <b>떠난다</b>. 전설은 정말 잘 다스린 해에만 드물게 오고, 많아야 2년 머문다. 가끔은 이름 모를 사람이 찾아오기도 한다. 후보 카드의 버튼을 누르면 그 자리 사람과 바뀐다.'],
 report:['연간 결산','막대의 <b>흰 눈금은 작년</b> 값이다. 업적과 불명예는 커리어 점수의 명예 점수가 된다.'],
 elect:['임기 말 규칙','무대마다 다르다. <b>대한민국</b>은 5년 단임이라 개헌 없이는 물러난다. <b>미국</b>은 재선까지 선거로 가고, 세 번째 임기는 막혀 있다. 헌법에 막혔어도 지지율이 35 이상이면 임기 말에 한 번 <b>마지막 승부</b>(개헌 강행)를 걸 수 있다. 통과하면 출마하지만 권력이 쏠리고 견제와 민심이 깎이며, 실패하면 쫓겨난다. <b>조선</b>은 민심이 60 아래면 반정 위험이 생긴다. 선거가 있으면 지지율 35 미만은 출마 불가, 35~65는 확률, 65 이상은 당선이다.'],
 special:['특별 이벤트','특별 국정 과제 판에서 고른 큰일이다. 단계가 2~4개 이어지고, 앞에서 고른 것이 뒤를 바꾼다. 절반 넘게 성공하면 업적, 아니면 불명예가 붙는다. <b>권력</b>이 50을 넘으면 연임 개헌 같은 권력 과제도 판에 열린다. 경기가 들어간 단계는 주사위 대신 경기 결과로 판정한다.'],
 path:['선택이 부른 사건','비슷한 방향의 선택이 쌓이면 그 <b>노선의 후속 사건</b>이 나온다. 강경·협치·경제 우선 중 무엇을 골랐느냐에 따라 다음 이야기가 달라진다.']};
const tutOn=()=>MEM.tut!==false;
// 이스터에그: 튜토리얼 안내 아홉 가지를 모두 '알겠어요'로 끝까지 읽으면(커리어를 넘어 모인다) 비밀 인물 주시경이 깨어난다
function tutRead(id){if(!TIPS[id])return;const R=MEM.tutRead=MEM.tutRead||{};if(R[id])return;R[id]=1;const H=MEM.sec=MEM.sec||{};
  if(!H.tutor&&Object.keys(TIPS).every(k=>R[k])){H.tutor=1;try{SFX.unlock();}catch(e){}eggToast('📖 <b>"말이 오르면 나라가 오른다."</b><br>튜토리얼을 끝까지 읽었어요. 비밀 인물 「주시경」이 깨어났어요.');}
  msave();}
function tip(id){if(!tutOn()||!CAR||(CAR.tips=CAR.tips||{})[id])return '';CAR.tips[id]=1;const t=TIPS[id];
  return '<div class="tip" data-tip="'+id+'"><div class="tip-h"><span class="tip-b">튜토리얼</span>'+t[0]+'</div><div class="tip-t">'+t[1]+'</div>'+
   '<div class="tip-a"><button class="tip-ok">알겠어요</button><button class="tip-off">튜토리얼 끄기</button></div></div>';}
function bindTips(){document.querySelectorAll('.tip').forEach(el=>{const ok=el.querySelector('.tip-ok'),off=el.querySelector('.tip-off');
  if(ok)ok.onclick=()=>{SFX.click();el.remove();tutRead(el.dataset.tip);};if(off)off.onclick=()=>{SFX.click();MEM.tut=false;msave();document.querySelectorAll('.tip').forEach(x=>x.remove());};});}
function choose(k){SVAT=null;SFX.pick(cur.o[k][1].X?1:stakeOf(cur.o[k],cur.o));document.querySelectorAll('#wrap button').forEach(b=>b.disabled=true);   /* 룰렛이 뜨기 전에 다른 화면(비상소집 등)으로 넘어가지 않게 이 화면의 단추를 모두 잠근다 */
  takeSnap();lastO=cur.o[k];if(lastO[1].X==='crush')CAR.crush++;lastFit=fitOf(lastO,cur.o);lastS=stakeOf(lastO,cur.o);logChoice(k);
  const go=()=>{
  // 국민투표·계엄은 판정 주사위 없이 이벤트 확률로만 갈린다: 효과는 '성공' 기준으로 적용
  if(spFixed(lastO)){lastT=1;return resolve(lastO,1);}
  let t=roll(lastFit.q,lastS);
  {const yk=CAR.term+'-'+Math.floor(S.turn/PY);if(t===3&&cnHas('save3')&&CAR.saveY!==yk){t=2;CAR.saveY=yk;cnSaveMsg='화타 · 마비산: 대실패를 실패로 막았다';}}
  lastT=t;tally[t]++;yTally[t]++;CAR.tt[t]++;reel(t,()=>resolve(lastO,t));};
  // 고른 선택지만 남기고 나머지를 걷어 낸 뒤 판정으로 넘어간다(선택 시간 기록은 위에서 이미 끝났다)
  const ob=document.querySelectorAll('#gOpts .opt');
  if(!reduceFx()&&ob[k]){ob.forEach((b,j)=>b.classList.add(j===k?'picked':'drop'));setTimeout(go,420);}else go();}
// 가로 화면 왼쪽 상황판 아래: 지금의 나(지도자) · 곁의 참모 · 이번 임기의 결정 기록. 세로 화면에서는 CSS로 숨긴다.
const gEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function sideHTML(){if(!CAR||!CAR.bgn)return '';const RL=roleOf(),H=cnHired(),log=chron.slice(-6).reverse();
  return '<div class="g-side">'+
   '<div class="gs-me"><div class="gs-pf">'+portrait(CAR.bgn,'100%',0,1)+'</div><div class="gs-tx"><span class="gs-k">'+(CP.id==='joseon'?CAR.term+'번째 치세':CAR.term+'기 '+CP.role)+'</span>'+
    '<b>'+CAR.bgn+'</b><span class="gs-s">'+(NICK&&NICK!=='익명'?gEsc(NICK)+' · ':'')+ageNow()+'세 · '+CP.n+'</span></div></div>'+
   '<div class="gs-box"><div class="gs-h">곁의 '+RL.n+'<span>'+H.length+' / 2</span></div>'+
    (H.length?H.map(c=>'<div class="gs-cn">'+portrait(c.n,34)+'<div><b>'+c.n+'</b><span>'+'★'.repeat(c.t)+' '+CN_DOM[c.d].n+'</span></div></div>').join(''):'<div class="gs-e">아직 없다. 연말 '+RL.meet.replace(/^연말\s*/,'')+'에서 앉힐 수 있다.</div>')+'</div>'+
   '<div class="gs-box"><div class="gs-h">이번 임기의 결정<span>'+chron.length+'건</span></div>'+
    (log.length?log.map(x=>'<div class="gs-lg"><i style="background:'+TIER[x.t].bd+'">'+TIER[x.t].n+'</i><span>'+x.n+'</span></div>').join(''):'<div class="gs-e">아직 내린 결정이 없다.</div>')+'</div>'+svActs()+'</div>';}
// 턴 카드: 새 사건이 열릴 때 띠가 화면을 가로지른다. 같은 사건을 다시 그릴 때나 다른 연출이 떠 있을 때는 건너뛴다.
let tfLast=null,alLast=null;
function turnFx(){if(reduceFx()||document.documentElement.dataset.lite||tfLast===cur||document.querySelector('.qfx,.yrfx,.cine'))return false;tfLast=cur;
  const o=document.createElement('div');o.className='turnfx';o.setAttribute('aria-hidden','true');
  o.innerHTML='<div class="turnfx-b"><div class="turnfx-in"><span class="turnfx-k">'+(Math.floor(S.turn/PY)+1)+'년차 · 결정 '+(S.turn%PY+1)+' / '+PY+'</span><span class="turnfx-t">'+cur.t+'</span></div></div>';
  document.body.appendChild(o);if(CP&&CP.dict)skinNode(o);SFX.swoosh();
  const end=()=>{if(o.isConnected)o.remove();};o.onclick=end;setTimeout(end,1250);return true;}
// 게임 화면 단축키: 숫자로 선택지, Enter·Space로 '계속'. 턴 카드가 떠 있으면 먼저 걷는다.
document.addEventListener('keydown',e=>{if(CINE||e.repeat||e.ctrlKey||e.metaKey||e.altKey||document.querySelector('.qfx,.yrfx'))return;
  const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
  const tf=document.querySelector('.turnfx');if(tf){tf.remove();if(!/^[1-9]$/.test(e.key))return;}
  if(/^[1-9]$/.test(e.key)){const b=document.querySelectorAll('#gOpts .opt')[+e.key-1];if(b&&!b.disabled){e.preventDefault();b.click();}return;}
  if(e.key==='Enter'||e.key===' '){const n=document.getElementById('nx');if(n&&(!t||t.tagName!=='BUTTON'||t===n)){e.preventDefault();n.click();}}});
function reroll(){if(tok<=0)return;SVAT=null;SFX.rewind();tok--;RUN.rr++;{const _l=LOG[LOG.length-1];if(_l)_l.rerolls++;}useSnap();tally[lastT]--;yTally[lastT]--;CAR.tt[lastT]--;const t2=roll(lastFit.q,lastS);lastT=t2;tally[t2]++;yTally[t2]++;CAR.tt[t2]++;
  R.innerHTML='<div id="wrap" style="position:relative;min-height:260px">'+vign()+'<div class="g-hud">'+hud()+'</div>'+
  '<div class="g-main" style="font-size:13px;color:var(--text-muted);text-align:center;margin-top:24px">운명의 주사위를 다시 굴린다</div>'+
  '<div id="fx" style="position:absolute;inset:-6px;display:flex;align-items:center;justify-content:center;pointer-events:none"></div></div>';
  bindSnd();reel(t2,()=>resolve(lastO,t2));}

function resolve(o,t){const e=o[1],ch=o[3];logTier(t);
  chron.push({t:t,n:cur.t});hist.push(t);streak=(t<=1)?streak+1:0;
  if(e.X==='crush'){const able=(S.p>52&&S.a>32);
    if(t===3||(!able&&t!==0))return gate('ousted');
    apply({u:-30,a:-22,c:11,p:6},1);
    last={t:t,x:'공권력이 광장을 비웠다. 질서는 돌아왔고 <em>그 장면이 정부의 얼굴</em>이 됐다. '+pk(TIER[t].l)};}
  else if(e.X==='quit'){S.quit=1;return careerEnd('quit');}
  else{apply(e,0,t,STK[lastS]);last={t:t,x:o[2]+' '+pk(TIER[t].l),cn:cnBonus(e,t).concat(cnSaveMsg?[cnSaveMsg]:[])};cnSaveMsg='';if(cur.hist)histHit(o);
    if(t===3){S.a=cl(S.a-4);S.u=cl(S.u+4);}
    if(lastS===2&&t===0){S.a=cl(S.a+4);last.x+=' <em>승부수가 통했다.</em> 결단력 있는 지도자라는 평가가 붙었다.';CAR.boldWin=(CAR.boldWin||0)+1;}
    if(lastS===2&&t===3){S.a=cl(S.a-2);S.u=cl(S.u+2);last.x+=' <em>무리수였다</em>는 비판이 쏟아졌다.';CAR.boldLoss=(CAR.boldLoss||0)+1;}
    if(ch){const id=t<=1?ch.ok:ch.bad;if(id&&CH[id])queue.push(CH[id]);}
    if(cur.sp&&spAct(o[4],t)==='coupfail')return breaking({k:'bad',h:'계엄 해제 요구안 가결… 내란 실패',s:'계엄군 철수, 대통령 관저 앞에 시민 수만 명',b:'군은 끝내 국회 진입 명령을 따르지 않았다. 내란 혐의 수사가 시작됐고, 정권은 그날 밤으로 끝났다.'},()=>careerEnd('coupfail'));
    pathAfter(e);}
  for(let k=0;k<TPT;k++)tick();
  TH.push({a:S.a,i:S.i,h:vVal('H')});logAfter();MAP.tgt=S.i;MAP.dtgt=deaths;
  if(S.m<=3&&S.i>=75)return gate('medfail');
  if(S.e<=4)return gate('ecofail');
  if(S.a<=3&&S.u>=68)return gate('ousted');
  res();}

// 선택이 쌓이면 노선이 생기고, 노선마다 다른 후속 사건이 1·2단계로 이어진다 (임기마다 새로 센다)
function pathAfter(e){if(!CAR.path)return;const d=dirOf(e)[0],pr=priOf(e);
  if(d>=5)CAR.path.hard++;if(d<=-5)CAR.path.soft++;if(pr==='경제'||(e.e||0)>=5)CAR.path.eco++;
  const sid=sidNow(),T1=PY>=6?3:2,T2=PY>=6?6:4,P=PATHS[sid];if(!P)return;
  for(const k of ['hard','soft','eco']){const n=CAR.path[k],st=CAR.pstage[k]||0;
    const want=n>=T2&&st===1?2:n>=T1&&st===0?1:0;
    if(want&&!queue.some(x=>x.path)){queue.push(P[k][want-1]);CAR.pstage[k]=want;CAR.pathLog.push(CAR.term+'기 '+PATHN[k]+' '+want+'단계');break;}}}
function gate(kind){SVAT=null;if(tok<=0)return careerEnd(kind);SFX.gate();vib([120,80,160]);
  R.innerHTML='<div style="animation:fdIn .5s ease-out;position:relative"><div style="position:absolute;inset:-6px;pointer-events:none;border-radius:12px;background:radial-gradient(ellipse at center,transparent 40%,rgba(179,38,30,.35) 100%)"></div>'+
  '<div style="font-size:12.5px;font-weight:700;color:var(--text-danger);letter-spacing:.04em;margin-bottom:8px;animation:pls 1.4s infinite">정권의 마지막 순간</div>'+
  '<div style="font-size:24px;font-weight:600;margin-bottom:12px">이대로 끝인가?</div>'+
  '<div style="font-size:14px;color:var(--text-secondary);line-height:1.8;margin-bottom:22px">역사가 이 정권의 마지막 문장을 쓰기 직전이다. 아직 <em>운명에 개입할 기회</em>가 '+tok+'번 남아 있다. 다시 굴려도 같은 결과가 나올 수 있다.</div>'+
  '<button id="rr" style="width:100%;margin-bottom:8px;padding:13px"><span style="color:#2f4a6b">●</span>&nbsp; 운명에 개입한다 (남은 '+tok+'회)</button>'+
  '<button id="ac" style="width:100%;font-size:13px;color:var(--text-secondary)">운명을 받아들인다</button></div>';
  document.getElementById('rr').onclick=reroll;document.getElementById('ac').onclick=()=>{SFX.fade();careerEnd(kind);};}

// 영구집권(계엄) 상태에서는 지지율이 떨어질 때 DICT_AK배로 더 크게 떨어진다
const DICT_AK=1.5;
function apply(e,raw,t,M){const T=TIER[t===undefined?1:t],mom=streak>=4?1.1:1;M=M||STK[1];
  for(const k in e){if(k==='X')continue;const v=e[k],good=BAD[k]?v<0:v>0;let d=raw?v:v*EVS*(good?M.g*T.g*mom:M.b*T.b);
    if(k==='a'&&d<0&&CAR&&CAR.dict)d*=DICT_AK;
    // 군사는 올리기가 너무 더뎠다: 군사를 올리는 선택은 1.35배로 듣는다
    if(k==='mil'&&d>0&&!raw)d*=MIL_UP;S[k]=cl(S[k]+d);}}
const MIL_UP=1.35;

// 한 번 호출 = 1개월. 결정 빈도와 상관없이 1년에 12번 돈다. 임기가 거듭될수록(TD) 확산·피해·부패 압력이 커지고 지지율은 더 빨리 빠진다.
function tick(){const te=MOD.te||1,D=DIFF[dif],yr=Math.floor(S.turn/PY),TD=(CAR.term-1)*(CP.tdk||1);
  let r=.18+S.u/500+(MOD.ip||0)+yr*.022+D.r+TD*.02+(TD===0&&yr>=2?.015:0)-S.p/330-(S.trn*te)/900-S.m/1100;r=Math.max(-.11,Math.min(.36,r));
  S.i=cl(Math.max(D.fl+(TD>0?2+2*TD:0),S.i+S.i*r*(1-S.i/100)));if(S.i>peakI)peakI=S.i;
  S.m=cl(S.m-Math.max(0,S.i-50)/13+S.e/150+.2+(CP.mk||0));
  const dd=(S.i/28)*(1+Math.max(0,50-S.m)/42)*(MOD.dd||1)*D.dd*(1+TD*.2);deaths+=dd;yd+=dd;cDeaths+=dd;if(TD===0)covD+=dd*320*(yr===0?Math.min(1,Math.pow((S.turn+.3)/PY,2)):1);
  S.e=cl(S.e-S.i/72-S.p/170+S.saf/210+.48+(MOD.ep||0)-S.c/62+(TD>0?SCX().eb||0:0));
  S.c=cl(S.c+.22+TD*.07+Math.max(0,S.p-34)/22*(1-(S.trn*te)/150)-(S.trn*te)/320);
  S.u=cl(S.u+S.i/95+Math.max(0,S.p-45)/47+Math.max(0,45-S.e)/58-S.saf/230-.32+(MOD.up||0));
  const a0=S.a;S.a=cl(S.a-.32-D.ad-TD*.06-Math.max(0,S.a-55)/65+Math.max(0,S.p-40)/260*(S.i>40?1:0)-S.i/85-Math.max(0,48-S.e)/62-S.u/130-S.c/160+Math.max(0,S.e-55)/95+(MOD.ap||0));
  if(CAR&&CAR.dict&&S.a<a0)S.a=cl(a0-(a0-S.a)*DICT_AK);
  S.p=cl(S.p-S.chk/100*(S.p/115));
  S.chk=cl(S.chk-.12-TD*.03-Math.max(0,S.p-45)/70);S.trn=cl(S.trn-.1-S.c/260);S.saf=cl(S.saf-.08);
  S.mil=cl((S.mil==null?50:S.mil)-.045+(S.e-50)/1500);
  if(CAR&&CAR.endemic===CAR.term)S.i=Math.min(S.i,10);}

let KN={a:'지지율',i:'확산',m:'의료',e:'경제',p:'행정 권한',c:'유착',u:'갈등',chk:'견제',trn:'투명성',saf:'안전망',mil:'군사'};
function deltas(){if(!snap)return '';
  const ch=VORD.map(k=>[k,vVal(k,S)-vVal(k,snap.S)]).filter(x=>Math.abs(x[1])>=1.5);
  return ch.map(([k,d],j)=>{const g=vGood(k,d),col=g===null?'#3d5a80':g?'#2e7d55':'#b3261e',n=Math.round(d);
    return '<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:4px 9px;border-radius:999px;background:color-mix(in srgb,'+V6[k].col+' 16%,var(--surface-1));border:1px solid color-mix(in srgb,'+V6[k].col+' 45%,transparent);margin:0 5px 5px 0;opacity:0;animation:fdIn .3s ease-out forwards;animation-delay:'+(j*70)+'ms">'+vName(k)+' <b style="color:'+col+';font-size:12px">'+(n>0?'+':'')+n+'</b></span>';}).join('');}

function res(){const T=TIER[last.t],wc=last.x.split(' ').length,dl=Math.min(650,wc*22+120);
  sbFrom=snap&&snap.S;const hh=hud();sbFrom=null;
  R.innerHTML='<div id="wrap" class="fit" style="position:relative">'+vign()+'<div class="g-hud">'+hh+sideHTML()+'</div><div class="g-main"><div class="g-sc">'+
  '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span class="tierb" style="font-size:12.5px;padding:3px 10px;border-radius:999px;background:'+T.tint+';color:'+T.fg+';font-weight:700">'+T.n+'</span><span style="font-size:12.5px;color:var(--text-muted);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+cur.t+'</span></div>'+
  tip('result')+(tok>0&&last.t>=2&&!cur.mg?tip('reroll'):'')+
  '<div id="txt" style="background:color-mix(in srgb,'+T.bd+' 7%,var(--surface-2));border:1px solid color-mix(in srgb,'+T.bd+' 32%,transparent);border-radius:14px;padding:16px 17px;margin-bottom:14px;cursor:pointer"><div class="rsd" style="font-size:15.5px;line-height:1.85">'+words(last.x,40)+'</div></div>'+
  '<div style="margin-bottom:12px;min-height:28px">'+deltas()+'</div>'+
  (last.cn&&last.cn.length?'<div class="cn-fx">'+last.cn.map(x=>'<span>'+x+'</span>').join('')+'</div>':'')+
  (last.hn?'<div style="margin:0 0 14px;padding:11px 13px;border:1px solid rgba(143,106,18,.32);background:rgba(143,106,18,.06);border-radius:10px;font-size:13.5px;line-height:1.65;color:var(--text-secondary)"><b style="color:#8f6a12">실제 역사</b> · '+last.hn+'</div>':'')+
  (()=>{if(cur.mg)return '<div class="jdg"><span>판정</span><b>경기 결과로 정해졌다</b></div>';
  if(spFixed(lastO))return '<div class="jdg"><span>판정</span><b>'+(lastO[4].vote?'투표로':'거사 결과로')+' 정해졌다</b></div>';const fw=fitWord(lastFit.q),P=stakeP(lastFit.q,lastS);return '<div class="jdg"><span>판정</span><span class="stk s'+lastS+'">'+STK[lastS].n+'</span><b style="color:'+fw[1]+'">'+fw[0]+'</b><span class="jdg-p">성공 이상 '+Math.round((P[0]+P[1])*100)+'%</span></div>';})()+
  (lastFit.why.length?'<div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:6px">판정에 영향을 준 것</div><div style="display:flex;flex-direction:column;gap:5px;margin-bottom:18px">'+lastFit.why.map((w,j)=>'<div style="font-size:13px;color:var(--text-secondary);opacity:0;animation:fdIn .3s ease-out forwards;animation-delay:'+(200+j*90)+'ms"><b style="color:'+(w[0]==='+'?'#2e7d55':'#b3261e')+'">'+(w[0]==='+'?'▲':'▼')+'</b> '+w[1]+'</div>').join('')+'</div>':'<div style="height:4px"></div>')+
  '</div><div class="g-bt">'+
  '<button id="nx" class="late pri" style="width:100%;margin-bottom:8px;padding:14px;font-size:15px;opacity:0;animation:fdIn .3s ease-out forwards;animation-delay:'+dl+'ms">계속</button>'+
  (tok>0&&last.t>=2&&!cur.mg&&!(cur.sp&&lastO&&lastO[4])?'<button id="rr" class="late" style="width:100%;font-size:13.5px;font-weight:600;color:#3d5a80;border-color:rgba(47,74,107,.45);background:rgba(47,74,107,.08);display:flex;align-items:center;justify-content:center;gap:8px;opacity:0;animation:fdIn .3s ease-out forwards;animation-delay:'+(dl+120)+'ms"><span class="dots"><i></i></span>운명에 개입한다 (남은 '+tok+'회)</button>':'')+
  '<div class="rs-hint" style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:8px">글을 누르면 바로 넘길 수 있다</div></div></div></div>';
  bindSnd();fitP();
  const w=document.getElementById('wrap');document.getElementById('txt').onclick=()=>{w.classList.add('skip');};
  document.getElementById('nx').onclick=()=>{SFX.click();goNext();};SVAT='nx';
  const r=document.getElementById('rr');if(r)r.onclick=reroll;}

// 결과 화면의 '계속': 다음 결정으로, 해가 끝났으면 연간 결산으로
function goNext(){S.turn++;if(S.turn%PY===0)return report();next();pickAdv();ev();}
function next(){bnSeen=null;if(queue.length){cur=queue.shift();if(cur.sg)cur=spGen(cur.sg);return;}
  {const L=(MILEV[CP.id]||[]).filter(e=>!SEEN.has(e.t));if(L.length&&Math.random()<.11){cur=pk(L);SEEN.add(cur.t);return;}}
  if(S.u>44&&Math.random()<Math.pow(S.u/100,2)*(.35+S.c/110)*(1-S.chk/180)*.22*(cnHas('upr')?.5:1)){cur=(S.chk>=48&&CP.id!=='joseon')?IMP:UPR;return;}
  const y=Math.floor(S.turn/PY)+1,T=CAR.term;
  const sid=sidNow(),late=CP.rule==='single'&&y>=3;
  const okf=e=>(e.sc?e.sc===sid:(e.y===0||sid===CP.scen0))&&(e.y===0||e.y===y)&&(!e.tm||T>=e.tm||late)&&(!e.w||e.w(S))&&!(SKIN[e.t]&&SKIN[e.t].no&&SKIN[e.t].no.indexOf(sid)>=0);
  // 한 커리어에서 같은 사건은 다시 나오지 않는다. 그 위기의 사건을 다 봤을 때만 가장 오래전에 본 사건을 다시 꺼낸다.
  // 위기마다 모습이 다른 공통 사건은 그 모습(제목)으로 따로 센다
  const key=e=>{const k=SKIN[e.t]&&SKIN[e.t][sid];return k&&k.t?k.t:e.t;};
  let ok=pool.filter(okf);
  // 지표가 선에 닿아 생긴 사건은 먼저 나올 가능성이 크다
  const stv=ok.filter(e=>e.st&&!SEEN.has(key(e)));if(stv.length&&Math.random()<.45)ok=stv;
  const fresh=ok.filter(e=>!SEEN.has(key(e)));
  if(fresh.length)ok=fresh;else{const all=CP.ev.filter(okf);const old=all.filter(e=>SEEN.has(key(e))).sort((a,b)=>(SEENT[key(a)]||0)-(SEENT[key(b)]||0));ok=old.slice(0,Math.max(1,Math.ceil(old.length/3)));}
  if(T>=2||late){const te=ok.filter(e=>e.tm);if(te.length&&Math.random()<.3+.08*Math.max(0,T-2))ok=te;}
  if(!ok.length){pool=CP.ev.slice();ok=pool.filter(okf);}
  const pick=pk(ok);if(pool.indexOf(pick)>=0)pool.splice(pool.indexOf(pick),1);SEEN.add(key(pick));SEENT[key(pick)]=++SEENN;cur=skinOf(pick,sid);}

function score(){const ins=Math.max(0,(S.chk+S.trn+S.saf)-base),ds=cl(100-deaths/2.2);
  return S.a*.26+ds*.27+S.e*.19+(100-S.c)*.11+Math.min(100,ins*1.25)*.17;}

