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
function cpTokUse(){const n=Math.max(0,Math.min(9,Math.floor(+MEM.cpTok||0)));if(!n||godRun())return 0;delete MEM.cpTok;msave();if(RUN)RUN.cpTok=n;return n;}
