/* ---------- DLC · 전쟁기 독일: 세계대전의 승패, 라인강의 기적으로 넘어가기, 특별 과제 ---------- */
// 1기(6년)가 끝나면 결전이 열린다. 승전 확률 = 25% + 전황(위기 지수가 낮을수록) + 군사 + 전시 경제 + 민심. 5~90% 안에서 정한다.
// 이기면 그대로 통치가 이어지고(점령지 · 체제 피로 · 대륙 냉전), 지면 정권이 무너지고 '라인강의 기적' 에피소드가 열린다.
function warOdds(){const f=[['전황',Math.round((50-S.i)*.9)],['군사',Math.round((S.mil-50)*.7)],['전시 경제',Math.round((S.e-50)*.3)],['민심',Math.round((S.a-50)*.2)]];
  const p=Math.max(5,Math.min(90,25+f.reduce((s,x)=>s+x[1],0)));return {p:p,f:f};}
function warEnd(te){window.scrollTo(0,0);const W=warOdds(),p=W.p;
  const fx=W.f.map(x=>'<span style="display:inline-block;margin:0 10px 4px 0">'+x[0]+' <b style="color:'+(x[1]>=0?'#2e7d55':'#b3261e')+'">'+(x[1]>=0?'+':'')+x[1]+'%p</b></span>').join('');
  R.innerHTML='<div style="animation:fdIn .4s ease-out">'+lab('1기 통치 · '+YRS+'년의 끝 · '+ageNow()+'세')+
   card('<div class="hd" style="font-size:24px;margin-bottom:8px">결전</div><div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">여섯 해의 전쟁이 마지막 고비에 왔다. 적 연합군이 모든 전선에서 <em>총공세</em>에 나섰다. 이 싸움에서 이기면 전쟁이 끝나고 제국이 남는다. 지면 정권도 함께 무너진다.</div>'+
     '<div style="font-size:12.5px;color:var(--text-muted);margin-top:10px">기본 25% · '+fx+'</div>'+
     '<div style="font-size:15px;margin-top:8px">승전 가능성 <b>'+p+'%</b></div>')+
   '<button id="wgo" class="pri" style="width:100%;padding:15px;font-size:15px">결전에 나선다</button></div>';
  let gone=0;document.getElementById('wgo').onclick=()=>{if(gone++)return;SFX.click();warRoll(te,p);};}
function warRoll(te,p){window.scrollTo(0,0);const win=Math.random()*100<p;
  R.innerHTML='<div style="animation:fdIn .35s ease-out;padding-top:10px">'+lab('결전 · 1945년')+
   '<div id="vt" style="font-size:24px;font-weight:600;margin-bottom:6px">포성이 하늘을 덮는다</div>'+
   '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:18px">모든 전선에서 마지막 싸움이 벌어진다. <span style="color:var(--text-muted)">· 승전 가능성 '+p+'%</span></div>'+
   card('<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px"><span>지켜 낸 전선</span><span id="vp">0%</span></div>'+
     '<div style="position:relative;height:20px;border-radius:10px;background:rgba(29,27,24,.07);overflow:hidden"><span id="vb" style="position:absolute;left:0;top:0;bottom:0;width:0;background:#5b6146;border-radius:10px;transition:width 1.6s cubic-bezier(.2,.8,.2,1)"></span>'+
     '<span style="position:absolute;left:calc(50% - 1px);top:0;bottom:0;width:2px;background:#fff;opacity:.8"></span></div>')+
   '<div id="won" style="text-align:center;margin:22px 0;min-height:70px"></div><div id="wtx"></div>'+
   '<button id="go2" class="pri" style="width:100%;padding:15px;font-size:15px;opacity:0;pointer-events:none">'+(win?'전후 처리로':'커리어 결산 보기')+'</button></div>';
  const share=win?52+Math.random()*20:28+Math.random()*20;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const vb=document.getElementById('vb');if(vb)vb.style.width=share+'%';}));
  const t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/1600),el=document.getElementById('vp');if(!el)return;el.textContent=(share*(1-Math.pow(1-k,3))).toFixed(1)+'%';if(k<1)requestAnimationFrame(f);})();
  SFX.roll(1.7);
  setTimeout(()=>{const w=document.getElementById('won');if(!w)return;const tx=document.getElementById('wtx');
    const stamp=(t,c)=>'<div style="display:inline-block;font-size:40px;font-weight:800;color:'+c+';letter-spacing:6px;border:3px solid '+c+';border-radius:10px;padding:4px 18px;animation:stamp .6s cubic-bezier(.2,1.4,.4,1) both">'+t+'</div>';
    if(win){CAR.ww='win';te.elect='승전';te.winP=p;CAR.elections.push('세계대전 '+p+'% 승전');logSpecial('세계대전 승전',0,'중립');
      S.a=cl(S.a+6);S.mil=cl(S.mil+4);S.e=cl(S.e-4);CAR.tro.push({id:'ww_win',n:'세계대전 승전',g:1,term:1,year:YRS});
      document.getElementById('vt').textContent='전쟁에서 이겼다';SFX.stamp(.3);SFX.win(.3);w.innerHTML=stamp('승전','#2e7d55');
      tx.innerHTML=card('<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">적 연합군이 강화를 청했다. 대륙의 절반이 제국의 손에 들어왔다. 거리마다 종이 울렸다. 그러나 총으로 얻은 땅은 총으로 지켜야 하고, 전쟁에 지친 사람들은 이제 다른 것을 원한다. <b>이제부터가 진짜 통치다.</b></div>');}
    else{CAR.ww='lose';te.elect='패전';te.winP=p;CAR.elections.push('세계대전 '+p+'% 패전');logSpecial('세계대전 패전',0,'중립');
      if(!godRun()){MEM.bonn=1;msave();}CAR.tro.push({id:'ww_lose',n:'세계대전 패전',g:0,term:1,year:YRS});
      document.getElementById('vt').textContent='전쟁에서 졌다';SFX.stamp(.3);SFX.lose(.3);vib([90,60,120]);w.innerHTML=stamp('패전','#b3261e');
      tx.innerHTML=card('<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">1945년 5월, 무조건 항복 문서에 서명이 끝났다. 도시들은 잿더미가 됐고, 나라는 네 조각으로 나뉘어 점령됐다. 정권의 지도자들은 뉘른베르크 국제 군사 재판정에 섰다. 재판정에서는 전쟁 중 끌려간 사람들과 사라진 사람들의 이름이 하나씩 불렸다.</div>'+
        '<div style="font-size:13px;line-height:1.7;margin-top:10px;color:var(--text-muted)">4년 뒤, 폐허 위에 새 공화국이 선다. <b style="color:var(--text-secondary)">에피소드 「라인강의 기적」</b>이 열렸다.</div>');}
    const g=document.getElementById('go2');g.style.opacity=1;g.style.pointerEvents='auto';g.style.transition='opacity .3s';
    let gone=0;g.onclick=()=>{if(gone++)return;SFX.click();if(win)reignEnd(te);else{te.decision='패전';careerEnd('defeat');}};},1800);}
// 실제 역사 쪽지: 고른 선택지가 실제 역사와 같은지 세고(다시 굴리기는 한 번만 센다), 결과 화면에 붙일 글을 만든다
function histHit(o){const k=cur.o.indexOf(o),same=k===cur.hh;const key=CAR.term+'-'+S.turn+'-'+cur.t;CAR.hsK=CAR.hsK||{};if(!CAR.hsK[key]){CAR.hsK[key]=1;CAR.hs=CAR.hs||[0,0];CAR.hs[same?0:1]++;}
  last.hn=(same?'히틀러도 같은 길을 택했다. ':'히틀러는 「'+cur.o[cur.hh][0]+'」 쪽을 택했다. ')+cur.hist;}
// 결산 화면: 어떻게 끝났든 당신의 선택과 실제 역사를 나란히 보여 준다
const HIST_FATE={hitler:'히틀러는 1945년 4월 30일 베를린의 지하 벙커에서 스스로 목숨을 끊었다.',mussolini:'무솔리니는 1943년 실각했고, 1945년 4월 달아나다 이탈리아 파르티잔에게 붙잡혀 처형됐다.',
 goering:'괴링은 뉘른베르크 재판에서 사형을 선고받고, 집행 전날 밤 스스로 목숨을 끊었다.',rommel:'롬멜은 1944년 히틀러 암살 음모에 얽혔다는 의심을 받고 자살을 강요당했다.',doenitz:'되니츠는 히틀러가 죽은 뒤 국가원수로 항복을 지휘했고, 뉘른베르크 재판에서 징역 10년을 선고받았다.'};
function histPanel(){const h=CAR.hs||[0,0],li=t=>'<li style="margin-bottom:6px">'+t+'</li>';
  return '<div style="background:var(--surface-1);border:1px solid rgba(143,106,18,.32);border-radius:var(--radius);padding:13px 15px;margin-bottom:16px">'+
   '<div style="font-size:12px;font-weight:700;color:#8f6a12;letter-spacing:.04em;margin-bottom:6px">당신의 선택과 실제 역사</div>'+
   '<div style="font-size:14px;line-height:1.65;margin-bottom:10px">실제 역사가 있었던 사건에서 <b>같은 선택 '+h[0]+'번</b>, <b>다른 선택 '+h[1]+'번</b>을 했다.</div>'+
   '<ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.65;color:var(--text-secondary)">'+
   li('실제 나치 독일은 1945년 5월 무조건 항복했다. '+(HIST_FATE[CAR.bgid]||''))+
   li('나치 정권은 유럽의 유대인 약 600만 명을 학살했다(홀로코스트). 로마인(집시), 장애인, 정치범, 동성애자도 박해하고 죽였다.')+
   li('제2차 세계대전의 사망자는 7천만 명이 넘는 것으로 추산된다. 그 절반 이상이 민간인이었다.')+
   li('정권 지도자들은 뉘른베르크 국제 군사 재판에서 전쟁 범죄와 인도에 반한 죄로 심판받았다.')+'</ul></div>';}
// 패전 뒤 결산 화면의 '라인강의 기적 시작': 서독 총리 고르기로 바로 간다
function rhineGo(){if(!godRun()){MEM.bonn=1;msave();}camp='bonn';bg=-1;stepLeader();}

// 무대 낱말
ROLE.reich={n:'측근',meet:'당 지도부 개편',sub:'새해를 함께할 측근을 고른다'};ROLE.bonn={n:'장관',meet:'연방 내각 개편',sub:'새해를 함께할 장관을 고른다'};
TVCH.reich=['제국 방송','주간 뉴스 영화'];TVCH.bonn=['서독 공영방송','저녁 8시 뉴스'];
Object.assign(HN,{ww2:'전쟁 수행',occupy:'점령 행정',resist:'체제 유지',coldw:'안보',ruin:'재건',berlin:'안보',terror:'치안',unify:'통일 관리'});

// 군사 사건
MILEV.reich=[mev('장군들의 무기 요구','참모본부가 <em>전차 생산을 두 배로</em> 늘려 달라고 한다.',[
   ['전차 생산을 두 배로 늘린다',{mil:8,e:-5,a:-1},'공장 라인이 전차로 바뀌었다. 트랙터 공장도 전차를 찍었다.'],
   ['비행기에 먼저 쓴다',{mil:5,e:-3},'하늘을 먼저 지켰다.'],
   ['지금 수준을 지킨다',{mil:-2,e:2},'장군들은 불만이었다.']]),
  mev('국경 요새 기습','적 특공대가 <em>국경 요새</em> 하나를 기습했다.',[
   ['예비대를 보내 되찾는다',{mil:3,a:3,e:-2},'요새를 되찾았다.'],['포격으로 요새째 날린다',{mil:1,e:-3},'요새는 사라졌다. 적도 사라졌다.'],['다른 요새를 보강한다',{mil:2,e:-2},'요새 하나를 내주고 둘을 지켰다.']],{crisis:1})];
MILEV.bonn=[mev('연방군 예산','동맹이 <em>국방비를 늘리라</em>고 요구한다. 복지 예산과 부딪친다.',[
   ['국방비를 크게 늘린다',{mil:7,e:-3,saf:-2},'새 전차가 배치됐다. 연금 인상은 미뤄졌다.'],
   ['동맹과 분담을 다시 협상한다',{mil:3,chk:2},'협상은 길었다.'],
   ['동결한다',{mil:-3,saf:3},'동맹국들이 서운해했다.']]),
  mev('동독 국경 사건','동독 국경 경비대가 <em>서독 쪽으로 총을 쐈다</em>. 다친 사람은 없다.',[
   ['국경 병력을 늘린다',{mil:3,a:2,e:-2},'국경에 긴장이 돌았다.'],['동맹에 공동 항의를 요청한다',{mil:1,chk:2},'성명이 나왔다.'],['조용히 넘긴다',{mil:-2,a:-2},'"약하다"는 말이 나왔다.']],{crisis:1})];

// 특별 과제
SP.reich=[
 {id:'enable',n:'전권 위임법',k:'power',perTerm:1,cond:y=>vVal('P')>=50&&y>=1,
  bn:{k:'bad',h:'"지도자에게 모든 권한을"',s:'당 대회, 전권 위임법 상정… 남은 견제 장치마저 사라지나',b:'지도자가 법을 만들고 고치고 없앨 수 있게 하자는 법안이 올라왔다.'},
  steps:[c=>spEv('전권 위임법','지도자가 의회와 법원을 거치지 않고 <em>법을 만들 수 있게</em> 하는 법안이다. 통과되면 남은 견제는 사라진다.',[
    ['통과시킨다',{p:12,chk:-12,trn:-5,u:4},'박수 속에 법이 통과됐다. 반대표를 던진 사람은 기억되었다.'],
    ['전시에만 쓰도록 기한을 붙인다',{p:6,chk:-4},'기한은 붙었다. 기한이 올 때마다 연장됐다.'],
    ['법안을 거둬들인다',{chk:6,p:-5,u:-2},'당의 강경파가 실망했다. 장군들은 안도했다.']])]},
 {id:'autob',n:'아우토반 대공사',k:'good',tro:['아우토반 완공','멈춘 공사판'],cond:()=>true,
  bn:{k:'good',h:'전국 고속도로망 착공',s:'"일자리 수십만 개"… 군은 "전차가 달릴 길"이라며 반겨',b:'나라를 가로지르는 고속도로를 놓는다.'},
  steps:[c=>spEv('노선 설계','<em>고속도로 노선</em>을 정해야 한다.',[
    ['국경으로 가는 길을 먼저 놓는다',{mil:4,e:2},'군용 트럭이 국경까지 하루 만에 닿았다.'],['공업 도시를 잇는다',{e:5,c:2},'화물 트럭이 줄지어 달렸다.'],['경치 좋은 길로 놓는다',{a:4,e:1},'사람들이 주말마다 드라이브를 나갔다.']]),
   c=>spEv('공사 인력','공사에 <em>일손</em>이 모자란다.',[
    ['실업자에게 임금을 주고 고용한다',{e:-3,a:4,saf:2},'실업자 줄이 공사장으로 옮겨 갔다.'],['노동 봉사단을 강제로 보낸다',{e:2,a:-3,trn:-3},'공사는 빨랐다. 삽을 든 청년들의 얼굴은 어두웠다.'],['기계를 들여 인력을 줄인다',{e:-4,c:2},'굴착기가 들어왔다.']]),
   c=>spEv('개통식','첫 구간이 완공됐다. <em>개통식</em>을 어떻게 할까.',[
    ['지도자가 첫 차를 몰고 달린다',{a:5,p:2},'뉴스 영화가 그 장면을 전국 극장에 돌렸다.'],['노동자들을 개통식에 세운다',{a:3,saf:2},'공사장 노동자들이 맨 앞줄에 섰다.'],['조용히 연다',{e:2},'트럭들이 먼저 달렸다.']])]},
 {id:'volksw',n:'국민차 계획',k:'good',tro:['국민차의 나라','주문서만 남은 차'],cond:()=>true,
  bn:{k:'good',h:'"누구나 타는 차" 국민차 계획 발표',s:'적금으로 차를 산다… 공장 착공',b:'가족 다섯이 타고 달릴 수 있는 싼 차를 만든다.'},
  steps:[c=>spEv('차 설계','기술자들이 <em>국민차 시제품</em> 세 가지를 가져왔다.',[
    ['딱정벌레처럼 둥근 소형차',{e:4,a:3},'둥근 차가 사람들 마음을 샀다.'],['군용으로도 쓸 수 있는 차',{mil:4,e:2},'지붕을 떼면 군용차가 됐다.'],['고급 세단',{e:-2,c:3},'간부들이 좋아했다.']]),
   c=>spEv('판매 방식','노동자들이 <em>매주 적금</em>을 부어 차를 사게 하자는 안이다.',[
    ['적금으로 판다',{e:4,a:2,trn:-2},'수십만 명이 적금을 부었다. 공장은 그 돈으로 다른 것을 만들기 시작했다.'],['완성되면 현금으로 판다',{e:2,trn:2},'정직했다. 느렸다.'],['당원에게 먼저 준다',{c:5,a:-3},'차를 탄 사람은 대부분 당원이었다.']]),
   c=>spEv('공장','공장을 다 지었다. <em>무엇을 먼저</em> 만들까.',[
    ['약속대로 국민차를 만든다',{a:5,e:3,mil:-2},'첫 국민차가 공장을 나왔다.'],['군용차를 먼저 만든다',{mil:5,a:-3},'적금 부은 사람들은 차를 받지 못했다.'],['반반 나눈다',{mil:2,a:1,e:1},'둘 다 조금씩 나왔다.']])]},
 {id:'rocket',n:'달 로켓 계획',k:'good',tro:['달에 먼저 간 나라','추락한 로켓'],cond:()=>true,
  bn:{k:'good',h:'달 로켓 계획 발표',s:'로켓 공학자들 "대양 건너보다 먼저 달에"',b:'전쟁 무기를 만들던 로켓 연구소가 달을 겨눈다.'},
  steps:[c=>spEv('연구소','로켓 공학자들이 <em>바닷가 비밀 연구소</em>를 원한다.',[
    ['아낌없이 지원한다',{mil:3,e:-5,a:2},'연구소에 불이 꺼지지 않았다.'],['군 연구소에 넣는다',{mil:4,trn:-2},'군복 입은 감독관이 생겼다.'],['대학 연구소로 둔다',{trn:3,e:-2},'논문이 먼저 나왔다.']]),
   c=>spEv('발사','<em>달 로켓</em>이 발사대에 섰다. 우주 비행사 셋이 탄다. 달에 닿으면 착륙을 직접 지휘할 수 있다.',[
    ['발사한다',{a:2},'로켓이 하늘로 솟았다. 사흘 뒤 착륙선이 달 궤도에 들어섰다.',null,{nx:'moon'}],['무인 탐사선을 먼저 보낸다',{mil:2,a:1},'무인 탐사선이 달 사진을 보내왔다.'],['다음 해로 미룬다',{e:2,a:-1},'공학자들이 실망했다.']])]},
 {id:'pand_r',n:'티푸스 방역',k:'good',tro:['티푸스 종식 선언','끝나지 않은 위기'],cond:()=>true}];
// 티푸스 방역과 전격전 작전은 다른 나라의 방역 총력전 · 전쟁 과제 틀을 빌린다(백신 슬래시 · 전선 배치)
SP.reich[4]=mkPand('pand_r','티푸스 방역','티푸스 종식','전선과 수용소에서 <em>발진티푸스</em>가 번진다. 먼저 어디에 힘을 모을지 정해야 한다.',[
  ['군 병원부터 소독한다',{m:4,mil:2,e:-2},'군 병원에 소독약 냄새가 진동했다.'],['도시 위생 시설을 고친다',{m:3,saf:2,e:-2},'목욕탕과 세탁소가 다시 열렸다.'],['수용소와 점령지까지 함께 방역한다',{m:3,trn:2,i:-2},'방역반이 철조망 안까지 들어갔다.']],
  {k:'bad',h:'전선과 도시에 발진티푸스',s:'이와 함께 번지는 병… 야전 병원 포화',b:'총알보다 이가 더 많은 병사를 쓰러뜨린다.'});
SP.reich.push(mkWar('war_r','전격전 작전',['전격전의 승리','무너진 전선'],
  {k:'bad',h:'참모본부, 대규모 공세 계획 보고',s:'"전차와 비행기로 단숨에"… 장군들 사이에도 찬반',b:'전선을 단번에 뚫을 대공세가 지도자의 서명을 기다린다.'},
  ['공세 결정','참모본부가 <em>기갑 대공세</em> 계획을 올렸다.',[
   ['기갑 사단 전부를 한곳에 모은다',{mil:4,a:2,e:-3,p:2},'전차 수천 대가 숲속에 숨었다.',null,{ctx:['war','big']}],
   ['일부 전선에서만 공세를 편다',{mil:2,a:1,e:-1},'공세 부대가 출발선에 섰다.',null,{ctx:['war','small']}],
   ['장군들과 작전을 다시 짠다',{chk:3,mil:1},'회의는 밤새 이어졌다.',null,{ctx:['war','vote']}]]],
  ['돌파',c=>'공세 첫날이다. '+(c.war==='big'?'전차 수천 대가 한꺼번에 움직였다.':'공세 부대가 적진으로 들어갔다.'),[
   ['쉬지 말고 밀어붙인다',{mil:3,a:4,u:3,e:-2},'적의 방어선이 뚫렸다. 보급선은 길어졌다.'],['거점을 다지며 나아간다',{mil:2,a:1},'느렸지만 단단했다.'],
   ['공세를 멈추고 물러난다',{mil:-2,a:-2,u:-2},'병사들이 돌아왔다. 장군들은 "기회를 버렸다"고 했다.']]],
  ['전과','공세가 끝났다. 무엇을 남길까.',[
   ['승전 열병식을 연다',{a:5,p:3,e:-2},'수도 대로를 전차가 행진했다.'],['포로와 민간인 처우를 규정대로 한다',{trn:3,u:-2,a:1},'점령지가 조금 조용했다.'],['공세 교훈으로 군을 고친다',{mil:5,e:-2},'새 교범이 나왔다.']]]));
SP.bonn=[
 {id:'emerg',n:'비상조치법',k:'power',perTerm:1,cond:y=>vVal('P')>=50&&y>=1,
  bn:{k:'bad',h:'"비상시 기본권 제한" 비상조치법 상정',s:'대연정 "만일을 위한 대비"… 대학가 "제2의 전권 위임법"',b:'나라가 위기에 빠지면 정부가 기본권을 제한할 수 있게 하자는 법안이다.'},
  steps:[c=>spEv('비상조치법','비상시에 정부가 <em>기본권을 제한</em>할 수 있게 하는 법안이다. 거리에서는 "옛날로 돌아간다"는 외침이 들린다.',[
    ['원안대로 통과시킨다',{p:9,chk:-8,u:6},'법이 통과됐다. 수십만 명이 본으로 행진했다.'],
    ['연방의회와 헌법재판소의 통제를 넣어 통과시킨다',{p:3,chk:3,u:2},'법은 통과됐다. 안전장치도 함께 들어갔다.'],
    ['법안을 접는다',{chk:5,u:-3,p:-4},'대학가가 환호했다. 연정 파트너는 실망했다.']])]},
 {id:'wwunder',n:'경제 기적',k:'good',tro:['라인강의 기적','멈춘 기적'],cond:()=>true,
  bn:{k:'good',h:'"10년 안에 모두가 냉장고를"',s:'경제부, 수출 드라이브와 주택 100만 호 계획',b:'폐허에서 번영으로. 기적을 계획할 수 있을까.'},
  steps:[c=>spEv('성장의 엔진','<em>무엇으로</em> 성장할까.',[
    ['자동차와 기계를 수출한다',{e:6,c:2},'"메이드 인 저머니"가 품질의 다른 말이 됐다.'],['주택 100만 호를 짓는다',{e:3,saf:4,a:2},'아파트 단지가 들판을 채웠다.'],['중소기업 대출을 늘린다',{e:4,u:-2},'동네마다 작은 공장이 섰다.']]),
   c=>spEv('노사','공장이 바쁘다. 노조가 <em>임금 인상</em>을 요구한다.',[
    ['생산성만큼 올리기로 합의한다',{e:3,u:-3,saf:2},'파업 없는 해가 이어졌다.'],['임금을 묶고 수출을 늘린다',{e:5,u:4,a:-2},'수출은 늘었다. 노조는 화가 났다.'],['대폭 올려 준다',{a:4,e:-3,saf:3},'노동자들이 첫 냉장고를 샀다.']]),
   c=>spEv('기적의 계산서','10년 만에 경제가 <em>세 배</em>가 됐다. 남은 돈을 어디에 쓸까.',[
    ['연금과 의료에 쓴다',{saf:6,a:3,e:-2},'노인들이 처음으로 편히 늙었다.'],['감세로 돌려준다',{e:4,a:3,saf:-2},'지갑이 두꺼워졌다.'],['동쪽 피난민 정착에 쓴다',{saf:4,u:-3,e:-1},'수용소가 마지막으로 문을 닫았다.']])]},
 {id:'wc54',n:'월드컵 결승',k:'good',tro:['베른의 기적','결승의 눈물'],cond:()=>true,
  bn:{k:'good',h:'대표팀, 월드컵 결승 진출',s:'전쟁 후 첫 국제 무대… 라디오 앞에 온 나라가',b:'아무도 기대하지 않았던 팀이 결승에 올랐다.'},
  steps:[c=>spEv('결승 전날','대표팀이 <em>결승</em>에 올랐다. 상대는 4년 동안 진 적 없는 세계 최강이다.',[
    ['선수단에 직접 격려 전보를 보낸다',{a:3},'전보가 탈의실 벽에 붙었다.'],['국영 방송에 중계를 늘리라고 한다',{a:2,u:-2},'온 동네가 라디오 앞에 모였다.'],['조용히 지켜본다',{trn:1},'정치는 축구에서 한 발 물러났다.']]),
   MG_PK,
   c=>spEv('결승 이후','결승이 끝났다. 선수단이 <em>기차를 타고</em> 돌아온다.',[
    ['기차역마다 환영식을 연다',{a:5,u:-3},'역마다 사람이 몰렸다.'],['선수들을 총리실에 초청한다',{a:3,p:1},'사진이 신문 1면에 실렸다.'],['동네 축구장 투자를 늘린다',{saf:3,a:2,e:-2},'아이들이 새 잔디 위에서 공을 찼다.']])]},
 {id:'europe',n:'유럽 공동체',k:'good',tro:['유럽 통합의 주역','흔들린 공동체'],cond:()=>true,
  bn:{k:'good',h:'"석탄과 철강을 함께"',s:'옛 적국들과 공동 시장 협상… 다시는 전쟁이 없게',b:'전쟁의 원료였던 석탄과 철을 함께 관리하자는 제안이 왔다.'},
  steps:[c=>spEv('옛 적국과 함께','서쪽 이웃이 <em>석탄과 철강을 함께 관리</em>하자고 제안했다.',[
    ['받아들인다',{e:4,u:-2,p:-2},'석탄과 철이 국경을 자유롭게 넘었다.'],['조건을 더 따진다',{e:2,chk:2},'협상은 길어졌다.'],['국내 산업을 먼저 지킨다',{e:-1,a:2},'이웃들은 실망했다.']]),
   c=>spEv('공동 시장','이제 <em>모든 상품</em>의 관세를 없애자는 논의다.',[
    ['공동 시장에 들어간다',{e:5,u:2},'수출이 크게 늘었다. 농민들은 걱정했다.'],['농업은 빼고 들어간다',{e:3,a:2},'절충이었다.'],['미룬다',{e:-2},'다른 나라들끼리 먼저 시작했다.']]),
   c=>spEv('화해의 조약','서쪽 이웃 정상이 <em>우호 조약</em>을 맺자고 한다. 청소년 교류도 함께다.',[
    ['서명하고 청소년 교류를 크게 연다',{u:-3,a:3,trn:2},'수십만 청소년이 국경을 오갔다. 옛 적이 친구가 됐다.'],['서명만 한다',{a:1},'조약은 맺어졌다.'],['동맹을 먼저 챙긴다',{mil:2,a:-1},'이웃 정상은 서운해했다.']])]},
 {id:'reunify',n:'통일 조약',k:'good',tro:['통일의 총리','어긋난 통일'],cond:()=>SCX().id==='unify',
  bn:{k:'good',h:'"통일 조약" 협상 시작',s:'두 독일과 전승국 네 나라… 2+4 회담',b:'45년 만에 나라를 하나로 묶는 조약을 쓴다.'},
  steps:[c=>spEv('2+4 회담','<em>전승국 네 나라</em>가 통일 독일이 어느 동맹에 속할지 묻는다.',[
    ['서방 동맹에 남는다고 설득한다',{mil:3,a:3,u:2},'동쪽 대국이 끝내 동의했다. 대가로 큰 경제 지원을 약속했다.'],['중립국이 되겠다고 한다',{mil:-3,u:-2,e:-2},'서방 동맹이 당황했다.'],['동쪽 이웃 국경을 확정한다고 먼저 약속한다',{trn:4,u:-3},'이웃 나라들이 안심했다.']]),
   c=>spEv('통일의 날','10월 3일, <em>통일 기념식</em>이다.',[
    ['베를린 국회의사당 앞에서 연다',{a:6,u:-3},'백만 명이 모였다. 불꽃이 밤하늘을 덮었다.'],['동쪽 도시에서 연다',{a:3,u:-5},'동쪽 사람들이 "우리도 주인공"이라고 느꼈다.'],['조용히 서명만 한다',{trn:2,a:1},'역사는 조용히 바뀌었다.']])]},
 {id:'war_b',n:'평화 유지 파병',k:'good',tro:['평화 유지의 군대','상처뿐인 파병'],cond:()=>true}];
SP.bonn[5]=mkWar('war_b','평화 유지 파병',['평화 유지의 군대','상처뿐인 파병'],
  {k:'bad',h:'동맹, 연방군 첫 해외 파병 요청',s:'"독일군이 다시 국경을 넘는다"… 헌법재판소 판단 주목',b:'전후 처음으로 군대를 나라 밖으로 보낼지 정해야 한다.'},
  ['파병 결정','동맹이 내전 지역의 <em>평화 유지 작전</em>에 연방군을 요청했다.',[
   ['전투 부대를 보낸다',{mil:4,a:-1,u:3},'"제복 입은 시민"이 처음으로 전장에 섰다.',null,{ctx:['war','big']}],
   ['의무 · 수송 부대만 보낸다',{mil:1,a:1,trn:2},'역할은 작았다. 위험도 작았다.',null,{ctx:['war','small']}],
   ['연방의회 동의를 먼저 받는다',{chk:4,trn:3},'긴 토론 끝에 동의안이 통과됐다.',null,{ctx:['war','vote']}]]],
  ['현지 작전',c=>'파병 부대가 현지에 닿았다. '+(c.war==='big'?'무장 세력이 순찰대를 노린다.':'의무 부대 근처에 포탄이 떨어졌다.'),[
   ['무장 세력 거점을 친다',{mil:3,a:2,u:3},'거점이 무너졌다. 사상자 소식도 왔다.'],['피난민 보호에 집중한다',{mil:2,a:3},'수용소가 지켜졌다.'],
   ['철수한다',{mil:-2,a:-2},'"독일은 아직 준비가 안 됐다"는 말이 나왔다.']]],
  ['귀환','부대가 돌아온다.',[
   ['환영식을 크게 연다',{a:4,mil:2},'공항에 가족들이 몰렸다.'],['참전 장병 지원을 늘린다',{saf:3,a:2},'트라우마 치료소가 문을 열었다.'],['파병 원칙을 법으로 정한다',{chk:4,trn:2},'의회 동의 없는 파병이 금지됐다.']]]);
Object.assign(BOARD,{reich:['enable','war_r','autob','volksw','rocket','pand_r'],bonn:['emerg','wwunder','wc54','europe','war_b','reunify']});
Object.assign(BOARD_POOL,{reich:['war_r','autob','volksw','rocket','pand_r'],bonn:['wwunder','wc54','europe','war_b','reunify']});
Object.assign(NEED,{enable:[['P','>=',50]],war_r:[['M','>=',60]],autob:[['E','>=',45]],volksw:[['E','>=',52],['X','<=',40]],rocket:[['E','>=',55],['M','>=',55]],pand_r:[['I','>=',25]],
 emerg:[['P','>=',50]],wwunder:[['E','<=',50]],wc54:[['A','>=',45]],europe:[['E','>=',50],['X','<=',35]],war_b:[['M','>=',55]],reunify:[['UNIFY']]});

// 무대 고르기 그림: 전쟁기 독일은 실제 나치 깃발(빨간 바탕 · 흰 원 · 45° 기운 하켄크로이츠), 서독은 검정 · 빨강 · 금색 삼색.
// 하켄크로이츠는 이 깃발 한 곳에만 쓴다(초상이나 화면 장식으로 되풀이하지 않는다)
CP_ART.reich=(()=>{const arm=[[-8,-54,16,108],[-54,-8,108,16],[-8,-54,62,16],[38,-8,16,62],[-54,38,62,16],[-54,-54,16,62]];
  return '<svg viewBox="0 0 300 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="300" height="600" fill="#c8281e"/><circle cx="150" cy="300" r="100" fill="#f2ede4"/>'+
   '<g transform="translate(150 300) rotate(45)" fill="#1d1b18">'+arm.map(r=>'<rect x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'"/>').join('')+'</g></svg>';})();
CP_ART.bonn=(()=>{let s='<svg viewBox="0 0 300 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="300" height="200" fill="#1d1b18"/><rect y="200" width="300" height="200" fill="#c8281e"/><rect y="400" width="300" height="200" fill="#e8b81c"/>';
  for(let i=0;i<3;i++){let d='M-20 '+(470+i*40);for(let x=-20;x<320;x+=40)d+='q10 -10 20 0t20 0';s+='<path d="'+d+'" fill="none" stroke="#fff4c8" stroke-opacity=".45" stroke-width="4"/>';}
  return s+'</svg>';})();
