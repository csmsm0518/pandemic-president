/* ---------- DLC · 조선: 국난(임진왜란 · 병자호란 · 중종반정 · 갑신정변 · 강화도조약 · 고종 강제 퇴위) ---------- */
// 조선에는 5년마다 오는 민심의 심판이 없다. 그 대신 다스리는 동안 쌓인 일이 국난의 '조짐'으로 달마다 차오르고,
// 조짐이 판마다 다르게 정해진 문턱을 넘으면 그 국난이 닥친다(국난마다 한 커리어에 한 번). 맞서는 길 셋 가운데 하나를 고르면
// 왕권을 지킬 가능성이 정해지고, 지키면 치세가 이어지며(+300, 열세를 뒤집으면 +200 더) 지키지 못하면 폐위된다.
// 강화도조약만은 지면 폐위 대신 불평등 조약을 맺고, 그 뒤로 '고종 강제 퇴위'의 조짐이 빠르게 찬다.
// 예전에는 민심 60만 넘기면 치세가 공짜로 이어져서, 같은 4임기여도 다른 나라보다 2,000점 넘게 앞섰다.
// rate: 한 달에 차오르는 조짐(지금 상태가 곧 쌓인 선택이다) · odds: 왕권을 지킬 가능성에 더하는 값 · o: [길, 설명, 가능성 보정, 바로 바뀌는 지표, 이겼을 때 붙는 불명예]
const KG_LAST=()=>{const l=LOG[LOG.length-1];return l&&typeof l.dirScore==='number'?l.dirScore:0;};
const KG=[
 {id:'imjin',n:'임진왜란',y:'1592',h:'왜군 20만이 부산포에 올랐다',
  d:'바다 건너에서 <em>왜군 20만</em>이 부산포에 상륙했다. 보름 만에 도성까지 길이 열렸다. 성을 지킬 것인가, 몽진할 것인가.',
  why:S=>[['군사가 약하다',55-S.mil],['당쟁이 깊다',S.u-40]],
  rate:S=>1.1+Math.max(0,55-S.mil)*.08+Math.max(0,S.u-40)*.06+(sidNow()==='wae'?1.5:0),
  odds:S=>[['군사',(S.mil-50)*.6],['민심',(S.a-50)*.3],['국고',(S.e-50)*.25],['당쟁',-(S.u-40)*.35]],
  o:[['도성을 지키며 맞선다','관군을 모아 도성 앞에서 결전한다',S=>S.mil>=55?8:-6,{mil:-6,a:4,e:-4}],
     ['몽진하고 명에 원군을 청한다','의주로 피난해 명나라 군대를 부른다',6,{a:-8,p:-6,e:-6}],
     ['의병과 수군에 전권을 맡긴다','각지 의병장과 수군 장수에게 지휘를 맡긴다',S=>Math.round((S.chk-50)*.2)+3,{p:-8,a:6,mil:4}]],
  ok:{a:4,e:-6,mil:4},win:'일곱 해의 전란 끝에 왜군이 물러갔다. 잿더미 위에서도 백성은 임금을 다시 불렀다.',
  lose:'도성이 무너지고 몽진 길에서 민심이 등을 돌렸다. 대신들은 새 임금을 세웠다.',
  hist:'선조는 의주까지 몽진했다. 이순신의 수군과 각지 의병, 명나라 원군이 버텨 7년 만에 전쟁이 끝났지만, 나라는 쑥대밭이 됐다.'},
 {id:'byeongja',n:'병자호란',y:'1636',h:'청의 기병이 압록강을 건넜다',
  d:'국서를 물리치자 <em>청 태종이 12만 대군</em>을 이끌고 왔다. 닷새 만에 도성 코앞이다. 남한산성으로 들어갈 것인가, 무릎을 꿇을 것인가.',
  why:S=>[['군사가 약하다',50-S.mil],['왕권이 강경하다',S.p-60],['국고가 비었다',50-S.e]],
  rate:S=>.9+Math.max(0,50-S.mil)*.07+Math.max(0,S.p-60)*.06+Math.max(0,50-S.e)*.04,
  odds:S=>[['군사',(S.mil-50)*.5],['국고',(S.e-50)*.3],['민심',(S.a-50)*.25],['당쟁',-(S.u-40)*.3]],
  o:[['남한산성에서 끝까지 버틴다','성문을 닫고 근왕병을 기다린다',-4,{a:6,e:-6,mil:-4}],
     ['화친하고 청의 요구를 받아들인다','삼전도에 나가 군신의 예를 갖춘다',14,{a:-10,p:-10,u:6},'삼전도의 굴욕'],
     ['강화도로 옮겨 수군으로 막는다','왕실과 조정을 섬으로 옮긴다',S=>Math.round((S.mil-50)*.2),{e:-4,a:-2}]],
  ok:{e:-4},win:'청군이 물러갔다. 상처는 깊지만 옥좌는 지켰다.',
  lose:'성이 무너지고 왕실이 포로가 됐다. 청은 새 임금을 세우라 했다.',
  hist:'인조는 남한산성에서 47일을 버티다 삼전도에서 청 태종에게 세 번 절하고 아홉 번 머리를 조아렸다. 왕위는 지켰지만 소현세자를 비롯한 수많은 사람이 볼모로 끌려갔다.'},
 {id:'jungjong',n:'중종반정',y:'1506',h:'훈련된 군사들이 밤에 움직였다',
  d:'폭정과 사화를 견디다 못한 <em>대신들과 군사들이 반정을 모의</em>했다. 오늘 밤 궁궐 문이 열린다는 밀고가 들어왔다.',
  why:S=>[['왕권이 지나치다',S.p-55],['민심이 떠났다',50-S.a],['세도가 짙다',S.c-35],['간쟁이 막혔다',50-S.chk]],
  rate:S=>.7+Math.max(0,S.p-55)*.09+Math.max(0,50-S.a)*.12+Math.max(0,S.c-35)*.08+Math.max(0,50-S.chk)*.06+(KG_LAST()>=5?1.5:0),
  odds:S=>[['민심',(S.a-50)*.5],['왕권',(S.p-50)*.3],['세도',-(S.c-30)*.3],['간쟁',(S.chk-50)*.15]],
  o:[['반정 세력을 먼저 친다','밀고된 대신들을 잡아들이고 군을 틀어쥔다',S=>Math.round((S.p-50)*.2),{a:-6,chk:-8,p:6}],
     ['경연을 열고 간언을 받아들인다','폭정을 거두고 신하들의 말을 듣겠다고 약속한다',S=>Math.round((S.a-40)*.15)+2,{p:-10,chk:8,a:6}],
     ['숙위군을 늘려 궁을 지킨다','국고를 풀어 궁궐 수비를 두 배로 늘린다',5,{e:-8,mil:-4}]],
  ok:{a:2},win:'반정 모의가 새어 나가 꺾였다. 그러나 왜 모의가 있었는지 잊어서는 안 된다.',
  lose:'새벽에 궁궐 문이 열렸다. 대신들은 새 임금을 세우고 당신을 섬으로 보냈다.',
  hist:'연산군은 두 번의 사화로 신하들을 죽이고 경연과 사간원을 없앴다. 1506년 박원종 · 성희안 등이 반정을 일으켜 연산군을 폐하고 중종을 세웠다. 연산군은 교동도로 쫓겨나 두 달 만에 죽었다.'},
 {id:'gapsin',n:'갑신정변',y:'1884',h:'우정국 연회장에 불길이 올랐다',
  d:'개혁이 더디다며 <em>급진 개화파</em>가 외국 공사관 병력을 끌어들여 정변을 일으켰다. 대신들이 쓰러지고, 정변 세력은 임금을 다른 궁으로 옮겼다.',
  why:S=>[['당쟁이 깊다',S.u-45],['왕권이 약하다',45-S.p],['개혁 요구가 크다',S.trn-60]],
  rate:S=>.7+Math.max(0,S.u-45)*.1+Math.max(0,45-S.p)*.09+Math.max(0,S.trn-60)*.05+(KG_LAST()<=-5?1:0),
  odds:S=>[['왕권',(S.p-50)*.35],['군사',(S.mil-50)*.35],['민심',(S.a-50)*.25],['당쟁',-(S.u-45)*.3]],
  o:[['청군에 진압을 청한다','청나라 군대를 궁으로 불러들인다',12,{p:-8,chk:-4,a:-4}],
     ['개화파 요구를 일부 받아들인다','혁신 정강 가운데 일부를 받아들인다',S=>Math.round((S.trn-50)*.2),{p:-6,trn:8,u:-6}],
     ['궁을 빠져나가 관군을 모은다','몰래 궁을 나와 친위군을 부른다',S=>Math.round((S.mil-50)*.25),{mil:-4,a:2}]],
  ok:{u:-4},win:'정변은 사흘 만에 무너졌다. 옥좌는 지켰지만, 외국 군대가 궁궐을 드나드는 나라가 됐다.',
  lose:'정변 세력이 궁을 틀어쥐고 새 정부를 세웠다. 임금은 이름만 남았다가 끝내 물러났다.',
  hist:'1884년 김옥균 · 박영효 등 급진 개화파가 정변을 일으켰지만, 청군이 개입하면서 사흘 만에 무너졌다(삼일천하). 그 뒤 조선에 대한 청의 간섭은 더 심해졌다.'},
 {id:'ganghwa',n:'강화도조약',y:'1876',h:'운요호가 강화도 앞바다에 나타났다',soft:1,
  d:'외국 군함 <em>운요호</em>가 강화도를 포격하고, 이를 핑계로 군함을 몰고 와 개항을 요구한다. 조약문에는 치외법권과 해안 측량권이 들어 있다.',
  why:S=>[['군사가 약하다',50-S.mil],['언로가 막혔다',50-S.trn],['국고가 비었다',50-S.e]],
  rate:S=>.7+Math.max(0,50-S.mil)*.06+Math.max(0,50-S.trn)*.07+Math.max(0,50-S.e)*.04,
  odds:S=>[['군사',(S.mil-50)*.45],['국고',(S.e-50)*.25],['언로',(S.trn-50)*.25],['당쟁',-(S.u-40)*.25]],
  o:[['포구를 닫고 끝까지 맞선다','척화비를 세우고 군함에 포를 겨눈다',S=>Math.round((S.mil-55)*.3),{mil:-4,trn:-6,a:4}],
     ['조약을 맺되 조항을 따져 고친다','개항은 받아들이되 독소 조항을 하나하나 다툰다',8,{trn:6,e:-2,p:-4}],
     ['요구를 그대로 받아들인다','군함 앞에서 서둘러 도장을 찍는다',16,{p:-12,a:-8,e:-4},'불평등 조약']],
  ok:{},bad:{p:-12,a:-8,e:-6},win:'군함은 물러갔고 독소 조항은 막아 냈다. 그러나 바다 건너의 눈길은 거두어지지 않았다.',
  lose:'군함의 포구 앞에서 불평등 조약에 도장을 찍었다. 항구가 열리고 왕권은 크게 꺾였다. 이제 외세가 조정을 넘본다.',
  hist:'1876년 조선은 강화도조약(조일수호조규)을 맺고 부산 등 세 항구를 열었다. 치외법권과 해안 측량권이 들어간 불평등 조약이었고, 뒤이은 침략의 발판이 됐다.'},
 {id:'gojong',n:'고종 강제 퇴위',y:'1907',h:'외세가 임금의 양위를 요구했다',b:45,
  d:'외국 군대와 통감이 조정을 틀어쥐었다. 밀사 사건을 핑계로 <em>임금에게 자리에서 물러나라</em>고 요구한다. 궁궐 밖에는 군대가 늘어섰다.',
  why:S=>[['불평등 조약을 맺었다',CAR.kg&&CAR.kg.forced?30:0],['군사가 무너졌다',35-S.mil],['왕권이 꺾였다',35-S.p]],
  rate:S=>(CAR.kg&&CAR.kg.forced?2.5:0)+Math.max(0,35-S.mil)*.1+Math.max(0,35-S.p)*.1,
  odds:S=>[['군사',(S.mil-50)*.4],['왕권',(S.p-50)*.35],['민심',(S.a-50)*.3]],
  o:[['만국평화회의에 특사를 보낸다','헤이그에 밀사를 보내 국제 사회에 호소한다',-4,{trn:6,a:4}],
     ['의병과 손잡고 맞선다','전국의 의병에게 밀지를 내린다',S=>Math.round((S.mil-40)*.3),{mil:4,a:6,e:-6}],
     ['외교로 시간을 번다','열강 공사들을 불러 중재를 청한다',6,{p:-6,e:-4}]],
  ok:{a:4},win:'외세의 요구를 끝내 물리쳤다. 옥좌는 지켰지만 싸움은 이제 시작이다.',
  lose:'군대가 궁을 에워싼 가운데 양위 조칙이 내려졌다. 당신은 옥좌에서 끌려 내려왔다.',
  hist:'1907년 고종은 헤이그 만국평화회의에 특사를 보냈다. 일본은 이를 구실로 고종을 강제로 물러나게 하고 순종을 세웠으며, 곧 군대를 해산했다. 3년 뒤 나라가 국권을 잃었다.'}];
const KG_TH=[110,190];   // 문턱: 판마다 국난마다 이 사이에서 무작위로 정한다(언제 올지 미리 알 수 없게)
const kgT=()=>(CAR.term-1)*YRS*PY+S.turn;   // 커리어 전체에서 몇 번째 결정인가
function kgInit(){if(CAR.kg)return CAR.kg;const th={};KG.forEach(K=>{th[K.id]=KG_TH[0]+Math.random()*(KG_TH[1]-KG_TH[0]);});
  return CAR.kg={a:{},th:th,done:{},win:[],last:-99,forced:0};}
// 결정 하나가 끝날 때마다 조짐을 쌓고(한 결정 = TPT달), 문턱을 넘은 국난이 있으면 돌려준다.
// 첫해에는 오지 않고, 한 번 오면 1년은 쉰다. 여럿이 넘었으면 가장 많이 넘친 것부터
function kgTick(){if(!CAR||CP.id!=='joseon'||godRun())return null;const G=kgInit();
  KG.forEach(K=>{if(!G.done[K.id])G.a[K.id]=(G.a[K.id]||0)+Math.max(0,K.rate(S))*TPT;});
  const t=kgT();if(t<PY||t-G.last<PY)return null;
  const due=KG.filter(K=>!G.done[K.id]&&G.a[K.id]>=G.th[K.id]).sort((x,y)=>G.a[y.id]/G.th[y.id]-G.a[x.id]/G.th[x.id]);
  return due[0]||null;}
// 조짐이 얼마나 찼는가(0~100, 치세 끝 화면에 보여 준다)
const kgLv=K=>{const G=CAR.kg;return G?Math.min(100,Math.round((G.a[K.id]||0)/G.th[K.id]*100)):0;};
const kgOddsOf=(K,j)=>{const F=K.odds(S).map(x=>[x[0],Math.round(x[1])]),m=K.o[j][2],mv=typeof m==='function'?m(S):m;
  return {p:Math.max(8,Math.min(92,(K.b||55)+F.reduce((s,x)=>s+x[1],0)+mv)),f:F,m:mv};};
function kgOpen(K){window.scrollTo(0,0);SVAT=null;const G=kgInit();G.done[K.id]=1;G.last=kgT();
  const why=K.why(S).filter(x=>x[1]>0).map(x=>x[0]),F=kgOddsOf(K,0).f.filter(x=>x[1]);
  const fx=F.map(x=>'<span style="display:inline-block;margin:0 10px 4px 0">'+x[0]+' <b style="color:'+(x[1]>=0?'#2e7d55':'#b3261e')+'">'+(x[1]>=0?'+':'')+x[1]+'%p</b></span>').join('');
  R.innerHTML='<div style="animation:fdIn .4s ease-out">'+lab('국난 · '+CAR.term+'번째 치세 '+(Math.floor(S.turn/PY)+1)+'년 · '+ageNow()+'세')+
   card('<div style="font-size:12px;font-weight:700;color:#a8321f;letter-spacing:.04em;margin-bottom:6px">'+K.h+'</div><div class="hd" style="font-size:25px;margin-bottom:8px">'+K.n+'</div>'+
     '<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">'+K.d+'</div>'+
     (why.length?'<div style="font-size:12.5px;color:var(--text-muted);margin-top:10px">쌓인 조짐 · '+why.join(' · ')+'</div>':'')+
     '<div style="font-size:12.5px;color:var(--text-muted);margin-top:6px">기본 '+(K.b||55)+'% · '+fx+'</div>'+
     '<div style="font-size:13.5px;margin-top:8px;line-height:1.6">이 국난에서 <b>왕권을 지켜야</b> 치세가 이어진다. '+(K.soft?'지키지 못하면 불평등 조약을 맺는다.':'지키지 못하면 폐위된다.')+'</div>')+
   K.o.map((o,j)=>{const P=kgOddsOf(K,j);return '<button id="kgA'+j+'" style="width:100%;text-align:left;padding:14px 15px;margin-bottom:8px"><span style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><span style="font-size:15px;font-weight:600">'+o[0]+'</span><span style="font-size:13px;font-weight:700;white-space:nowrap">'+P.p+'%</span></span>'+
     '<span style="display:block;font-size:12px;color:var(--text-muted);margin-top:3px">'+o[1]+' · 왕권을 지킬 가능성 '+P.p+'%'+(o[4]?' · 지켜도 불명예 「'+o[4]+'」':'')+'</span></button>';}).join('')+'</div>';
  if(CP.dict)skinNode(R);
  try{SFX.gate();vib([90,60,120]);}catch(e){}
  let gone=0;K.o.forEach((o,j)=>{document.getElementById('kgA'+j).onclick=()=>{if(gone++)return;SFX.click();const P=kgOddsOf(K,j);apply(o[3],1);kgRoll(K,j,P.p);};});}
function kgRoll(K,j,p){window.scrollTo(0,0);const win=Math.random()*100<p,o=K.o[j],G=CAR.kg,y=Math.min(YRS,Math.floor(S.turn/PY)+1);
  R.innerHTML='<div style="animation:fdIn .35s ease-out;padding-top:10px">'+lab(K.n+' · '+K.y+'년의 일')+
   '<div id="vt" style="font-size:24px;font-weight:600;margin-bottom:6px">'+o[0]+'</div>'+
   '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:18px">'+o[1]+'. <span style="color:var(--text-muted)">· 왕권을 지킬 가능성 '+p+'%</span></div>'+
   card('<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px"><span>지켜 낸 왕권</span><span id="vp">0%</span></div>'+
     '<div style="position:relative;height:20px;border-radius:10px;background:rgba(29,27,24,.07);overflow:hidden"><span id="vb" style="position:absolute;left:0;top:0;bottom:0;width:0;background:#2f4a6b;border-radius:10px;transition:width 1.6s cubic-bezier(.2,.8,.2,1)"></span>'+
     '<span style="position:absolute;left:calc(50% - 1px);top:0;bottom:0;width:2px;background:#fff;opacity:.8"></span></div>')+
   '<div id="won" style="text-align:center;margin:22px 0;min-height:70px"></div><div id="wtx"></div>'+
   '<button id="kgNx" class="pri" style="width:100%;padding:15px;font-size:15px;opacity:0;pointer-events:none">'+(win||K.soft?'치세를 이어 간다':'커리어 결산 보기')+'</button></div>';
  const share=win?52+Math.random()*20:28+Math.random()*20;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const vb=document.getElementById('vb');if(vb)vb.style.width=share+'%';}));
  const t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/1600),el=document.getElementById('vp');if(!el)return;el.textContent=(share*(1-Math.pow(1-k,3))).toFixed(1)+'%';if(k<1)requestAnimationFrame(f);})();
  SFX.roll(1.7);
  setTimeout(()=>{const w=document.getElementById('won');if(!w)return;const tx=document.getElementById('wtx');
    const stamp=(t,c)=>'<div style="display:inline-block;font-size:40px;font-weight:800;color:'+c+';letter-spacing:6px;border:3px solid '+c+';border-radius:10px;padding:4px 18px;animation:stamp .6s cubic-bezier(.2,1.4,.4,1) both">'+t+'</div>';
    const hist='<div style="margin:0 0 14px;padding:11px 13px;border:1px solid rgba(143,106,18,.32);background:rgba(143,106,18,.06);border-radius:10px;font-size:13.5px;line-height:1.65;color:var(--text-secondary)"><b style="color:#8f6a12">실제 역사</b> · '+K.hist+'</div>';
    if(win){G.win.push({k:K.id,p:p});CAR.elections.push(K.n+' '+p+'% 극복');logSpecial(K.n+' 극복 · '+o[0],0,'중립');apply(K.ok,1);
      if(o[4])CAR.tro.push({id:'kg_'+K.id,n:o[4],g:0,term:CAR.term,year:y});
      document.getElementById('vt').textContent=K.n+'에서 왕권을 지켰다';SFX.stamp(.3);SFX.win(.3);w.innerHTML=stamp('수성','#2e7d55');
      tx.innerHTML=card('<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">'+K.win+'</div>')+hist;}
    else if(K.soft){G.forced=1;CAR.elections.push(K.n+' '+p+'% 굴복');logSpecial(K.n+' 굴복 · '+o[0],0,'중립');apply(K.bad,1);
      CAR.tro.push({id:'kg_'+K.id,n:'불평등 조약',g:0,term:CAR.term,year:y});
      document.getElementById('vt').textContent='불평등 조약을 맺었다';SFX.stamp(.3);SFX.lose(.3);vib([90,60,120]);w.innerHTML=stamp('굴복','#9a6400');
      tx.innerHTML=card('<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">'+K.lose+'</div>')+hist;}
    else{CAR.elections.push(K.n+' '+p+'% 폐위');logSpecial(K.n+' 폐위 · '+o[0],0,'중립');
      document.getElementById('vt').textContent=K.n+'에서 옥좌를 잃었다';SFX.stamp(.3);SFX.lose(.3);vib([90,60,120]);w.innerHTML=stamp('폐위','#b3261e');
      tx.innerHTML=card('<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">'+K.lose+'</div>')+hist;}
    if(CP.dict)skinNode(tx);
    const g=document.getElementById('kgNx');g.style.opacity=1;g.style.pointerEvents='auto';g.style.transition='opacity .3s';
    let gone=0;g.onclick=()=>{if(gone++)return;SFX.click();if(win||K.soft){next();pickAdv();ev();}else careerEnd('deposed');};},1800);}
// 치세 끝 화면: 민심의 심판 대신 지금 차오른 국난의 조짐을 보여 준다(가장 짙은 셋)
function kgOmen(){if(CP.id!=='joseon')return '';kgInit();
  const L=KG.filter(K=>!CAR.kg.done[K.id]).map(K=>[K,kgLv(K)]).filter(x=>x[1]>=8).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const W=CAR.kg.win.map(w=>(KG.find(K=>K.id===w.k)||{}).n).filter(Boolean);
  return card(lab('국난의 조짐')+(L.length?L.map(([K,v])=>{const c=v>=75?'#b3261e':v>=45?'#9a6400':'#2f4a6b';
      return '<div style="display:flex;align-items:center;gap:10px;margin:6px 0"><span style="width:92px;font-size:13px;font-weight:600">'+K.n+'</span><span style="flex:1;height:10px;border-radius:5px;background:rgba(29,27,24,.07);overflow:hidden"><span style="display:block;height:100%;width:'+v+'%;background:'+c+';border-radius:5px"></span></span><span style="width:34px;text-align:right;font-size:12px;color:'+c+'">'+(v>=75?'임박':v>=45?'짙음':'옅음')+'</span></div>';}).join(''):
    '<div style="font-size:13.5px;color:var(--text-secondary)">아직 짙은 조짐은 없다.</div>')+
   '<div style="font-size:12.5px;color:var(--text-muted);margin-top:8px;line-height:1.6">조짐은 다스리는 동안 쌓인 일(군사 · 당쟁 · 왕권 · 민심 · 세도 · 간쟁 · 언로 · 국고)로 차오른다. 다 차면 국난이 닥치고, 거기서 왕권을 지켜야 치세가 이어진다.'+(W.length?' 지켜 낸 국난: <b>'+W.join(' · ')+'</b>':'')+'</div>');}
