/* ---------- 메인 화면의 건의사항함 · 쿠폰함 ----------
   메뉴 한 칸 자리를 가로로 반씩 나눠 두 상자를 나란히 둔다(주인 요청: 건의사항 | 쿠폰함). 영화식 메뉴와 라이트 메인 화면 둘 다에 둔다.
   상자를 누르면 나중에 받는 조각(lazy/boxes)이 창을 띄운다(sugOpen · cpnOpen). 여기에는 메뉴 칸과,
   새 게임을 시작할 때 쿠폰으로 받아 둔 운명 개입을 꺼내는 부분만 둔다(start가 바로 값을 받아야 해서 조각에 둘 수 없다). */
const BOX_IC={sug:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M4 4.5h16v11.5H10l-6 4.5z"/><path d="M8.5 9h7M8.5 12h4.5"/></svg>',
  cpn:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M3 6.5h18V10a2 2 0 0 0 0 4v3.5H3V14a2 2 0 0 0 0-4z"/><path d="M15 7.5v1.6M15 11.2v1.6M15 14.9v1.6"/></svg>'};
// 쿠폰함 칸의 작은 글: 받아 둔 운명 개입이 있으면 그것을 알려 준다
const boxCpnSub=()=>(+MEM.cpTok>0)?'운명 개입 +'+MEM.cpTok+' 대기 중':'코드로 선물 받기';
const BOX_M=()=>[['Sug','건의사항','의견 · 버그 제보','sug'],['Cpn','쿠폰함',boxCpnSub(),'cpn']];
// 영화식 메인 메뉴: 보통 칸(.gx-mi) 하나의 자리에 반쪽 칸 둘. 반쪽도 .gx-mi라서 ↑↓ 고르기 · Enter에 그대로 들어간다(← →는 옆 칸으로)
function boxTileGx(i){return '<div class="gx-mi2" role="group" aria-label="건의사항함 · 쿠폰함">'+BOX_M().map(m=>'<button class="gx-mi gx-half" id="mm'+m[0]+'" style="--i:'+i+'"><span class="gx-ic" aria-hidden="true">'+BOX_IC[m[3]]+'</span><span class="gx-mt"><b>'+m[1]+'</b><small>'+m[2]+'</small></span></button>').join('')+'</div>';}
// 라이트 메인 화면: 보통 카드(.hm-card) 하나의 자리에 반쪽 카드 둘
function boxTileLite(){return '<div class="hm-split" role="group" aria-label="건의사항함 · 쿠폰함">'+BOX_M().map(m=>'<button id="hl'+m[0]+'" class="hm-card hm-half"><span class="hm-i">'+BOX_IC[m[3]]+'</span><span class="hm-x"><b>'+m[1]+'</b><span>'+m[2]+'</span></span></button>').join('')+'</div>';}
function boxBind(pre,snd){const s=document.getElementById(pre+'Sug'),c=document.getElementById(pre+'Cpn');
  if(s)s.onclick=()=>{snd();sugOpen(s);};if(c)c.onclick=()=>{snd();cpnOpen(c);};}
// 쿠폰으로 받아 둔 운명 개입: 다음 새 게임을 시작할 때 한 번에 꺼내 쓴다. 조성민(데우스 엑스 마키나) 판에는 쓰지 않고 남겨 둔다.
// 공정한 비교를 위해 몇 개를 받았는지 연구 기록(RUN.cpTok → 요약 시트 '쿠폰 운명 개입')에 남긴다
function cpTokUse(){const n=Math.max(0,Math.min(9,Math.floor(+MEM.cpTok||0)));if(!n||godRun()||DC)return 0;delete MEM.cpTok;msave();if(RUN)RUN.cpTok=n;return n;}

// ---------- 보관함: 쿠폰으로 받은 스텟 펌핑 ----------
// 쿠폰이 스텟 이름을 정해 준다(pump:a 지지율 · e 경제 · h 방역 칸 · m 군사 · p 권력 · x 혼란). MEM.bag = {a:개수,…}에 쌓아 두고,
// 한 판 안에서 게임 메뉴(≡ 또는 왼쪽 아래)의 「보관함」으로 아무 때나 하나씩 쓴다. 화면 지표 하나를 BAG_AMT만큼 좋은 쪽으로 올린다
// (혼란은 낮춘다). 엔진 지표 여러 개가 한 화면 지표를 이루므로 그 가중치대로 나눠 올린다. 오늘의 도전 · 조성민 판에서는 쓸 수 없다.
// 공정한 비교를 위해 쓴 횟수를 연구 기록(RUN.cpPump → couponPump)에 남긴다.
const BAG_AMT=10,BAG_V={a:'A',e:'E',h:'H',m:'M',p:'P',x:'X'},BAG_MAX=9;
const bagN=()=>{const b=MEM.bag||{};return Object.keys(BAG_V).reduce((s,k)=>s+Math.max(0,+b[k]||0),0);};
const bagBadge=()=>bagN()?' <small class="bg-n">'+bagN()+'</small>':'';
const bagName=k=>{const V=BAG_V[k];return V==='X'?vName(V)+' 낮추기':vName(V)+' 올리기';};
function bagAdd(k,n){if(!BAG_V[k])return 0;MEM.bag=MEM.bag||{};MEM.bag[k]=Math.min(BAG_MAX,(+MEM.bag[k]||0)+(n||1));msave();return MEM.bag[k];}
function bagUse(k){const V=BAG_V[k],n=+(MEM.bag&&MEM.bag[k])||0;if(!V||n<1||!S)return false;
  const d=V6[V],sg=d.pol<0?-1:1,ws=Object.keys(d.w),den=ws.reduce((a,x)=>a+d.w[x]*d.w[x],0);
  const ap=T=>{if(T)ws.forEach(x=>{T[x]=cl((+T[x]||0)+sg*BAG_AMT*d.w[x]/den);});};
  ap(S);if(snap&&snap.S)ap(snap.S);                       // 운명 개입으로 되돌려도 펌핑은 남도록 직전 상태에도 넣는다
  MEM.bag[k]=n-1;if(!MEM.bag[k])delete MEM.bag[k];msave();if(RUN)RUN.cpPump=(RUN.cpPump||0)+1;
  document.querySelectorAll('.sg6').forEach(el=>{el.outerHTML=statsHTML();});
  return true;}
function bagOpen(){
  if(!S||!CAR)return eggToast('보관함은 게임 중에만 열 수 있어요.');
  if(DC)return eggToast('오늘의 도전에서는 보관함을 쓸 수 없어요.');
  if(godRun())return eggToast('이 판에서는 보관함을 쓸 수 없어요.');
  const o=pop('보관함','<div class="bg-list"></div><p class="bg-note">쿠폰으로 받은 스텟 펌핑이에요. 한 판 안에서 아무 때나 쓸 수 있고, 하나에 지표 <b>+'+BAG_AMT+'</b>이에요. 쓴 만큼 사라져요.</p>');
  const draw=()=>{const b=MEM.bag||{},ks=Object.keys(BAG_V).filter(k=>+b[k]>0);
    o.querySelector('.bg-list').innerHTML=ks.length?ks.map(k=>'<div class="bg-r"><span><b>'+bagName(k)+'</b><small>'+vName(BAG_V[k])+' 지금 '+Math.round(vVal(BAG_V[k]))+'</small></span><em>×'+b[k]+'</em><button data-k="'+k+'" class="pri">쓰기</button></div>').join('')
      :'<p class="bg-empty">받아 둔 스텟 펌핑이 없어요.<br>메인 화면의 쿠폰함에서 쿠폰을 넣으면 여기에 쌓여요.</p>';
    o.querySelectorAll('.bg-r button').forEach(x=>x.onclick=()=>{if(bagUse(x.dataset.k)){SFX.coin();vib([20]);draw();eggToast(bagName(x.dataset.k)+' 완료! '+vName(BAG_V[x.dataset.k])+' <b>'+Math.round(vVal(BAG_V[x.dataset.k]))+'</b>');}});};
  draw();}
