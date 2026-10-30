/* ---------- 커리어 결산 ---------- */
const EXH={served:'임기를 마치고 물러났다',deposed:'반정으로 폐위됐다',retire:'명예롭게 퇴임했다',lost:'지지율 미달로 출마하지 못했다',defeated:'선거에서 패배했다',limit:'더는 출마할 수 없었다',ousted:'거리로 쫓겨났다',amendfail:'무리한 개헌이 무너지며 쫓겨났다',coupfail:'내란이 실패하며 체포됐다',lifelong:'종신 집권 끝에 권좌에서 내려왔다',medfail:'의료 붕괴로 정권이 무너졌다',ecofail:'경제 붕괴로 정권이 무너졌다',quit:'스스로 하야했다',purged:'군부 쿠데타로 축출됐다',defeat:'전쟁에 져 정권이 무너졌다'};
function careerStats(){const N=LOG.filter(x=>x.eventType!=='임기 결정'),avg=a=>a.length?a.reduce((p,q)=>p+q,0)/a.length:0;
  const cs=CAR.cs.length?CAR.cs:[S.c],ts=CAR.ts.length?CAR.ts:[S.trn],us=CAR.us.length?CAR.us:[S.u],ss=CAR.ss.length?CAR.ss:[S.saf];
  const pc={};N.forEach(x=>{if(x.priority&&x.priority!=='없음')pc[x.priority]=(pc[x.priority]||0)+1;});
  const prio=Object.keys(pc).sort((a,b)=>pc[b]-pc[a])[0]||'';
  const h=Math.floor(N.length/2),h1=N.length>=8?avg(N.slice(0,h).map(x=>x.dirScore)):0,h2=N.length>=8?avg(N.slice(h).map(x=>x.dirScore)):0;
  return {dir:avg(N.map(x=>x.dirScore)),perf:avg(CAR.terms.map(t=>t.sc)),cor:avg(cs),trn:avg(ts),u:avg(us),saf:avg(ss),ins:avg(CAR.terms.map(t=>t.ins||0)),
    prio:prio,h1:h1,h2:h2,terms:CAR.term,exit:CAR.exit,amend:CAR.amend,dict:CAR.dict};}
// 닮은 지도자: 퇴장 방식이 가장 크게 갈라 놓고, 그 위에 통치 방향·성과·지표 습관·업적과 불명예·겪은 사건을 점수로 더한다.
// 가장 잘 맞는 사람을 고르되, 3점 안쪽으로 비슷한 사람이 여럿이면 운이 고르고, 아직 만나지 못한 사람을 조금 앞세운다.
let LEADF=null;
function leadF(C){const s=S||{},tro=CAR.tro||[],T=new Set(tro.map(t=>t.id)),good=tro.filter(t=>t.g).length,sc=(CAR.scen||[]).concat(CP&&CP.scen0?[CP.scen0]:[]);
  const yrs=Math.max(1,(CAR.term-1)*YRS+Math.ceil((s.turn||0)/PY));
  return {ex:C.exit||'served',d:C.dir||0,f:C.perf||0,n:C.terms||1,am:C.amend||0,dict:!!C.dict,cor:C.cor,trn:C.trn,u:C.u,saf:C.saf,ins:C.ins||0,pr:C.prio||'',
   turn:C.h1>=2&&C.h2<=-3?-1:C.h1<=-2&&C.h2>=3?1:0,   // 노선을 뒤집었는가: -1 집중→분산, 1 분산→집중
   T:T,gy:good/yrs,by:(tro.length-good)/yrs,bw:CAR.boldWin||0,bl:CAR.boldLoss||0,crush:CAR.crush||0,
   mil:s.mil==null?50:s.mil,e:s.e==null?50:s.e,a:s.a==null?50:s.a,m:s.m==null?50:s.m,
   war:sc.some(k=>/^(war|war2|wae)$/.test(k)),fin:sc.some(k=>/^(fin|recess)$/.test(k)),oil:sc.indexOf('oil')>=0,
   mart:T.has('martial')||T.has('selfcoup'),coup:T.has('coup')||T.has('selfcoup'),end:!!CAR.endemic,camp:CAR.camp,
   adv:(CAR.cn||[]).filter(i=>i!=null).length,winLow:(CAR.terms||[]).some(t=>t.elect==='당선'&&t.winP<50),sp:(CAR.spEnds||[]).join(' ')};}
// lup(x,a,b): x가 a일 때 0, b일 때 1(그 사이는 고르게, 밖은 0과 1로 자른다). a>b면 x가 작을수록 커진다.
const lup=(x,a,b)=>Math.max(0,Math.min(1,(x-a)/(b-a)));
// 권력을 늘린 적이 없어야 어울리는 사람들: 개헌이나 계엄이 있으면 크게 깎는다
const LNOAM=new Set(['cinc','solon','wash','jeff','mandela','mujica','havel','carter','ike','attlee','sejong','jeongjo','lincoln','truman','reagan','alfred','asoka']);
// x: 퇴장 방식별 기본 점수(없으면 그 결말에는 나오지 않는다), s: 통치 방식·업적으로 더하는 점수
const LFIT={
 cinc:{x:{retire:30},s:F=>(F.n===1?6:0)+lup(F.d,2,-6)*8+lup(F.f,45,65)*4+(F.war?3:0)},
 solon:{x:{retire:30,served:12,limit:12},s:F=>lup(F.ins,15,45)*10+lup(F.d,0,-8)*6},
 wash:{x:{retire:30,served:16,limit:20},s:F=>(F.n>=2?6:-6)+lup(Math.abs(F.d),6,0)*4+(F.war||F.mil>=60?3:0)},
 jeff:{x:{served:20,limit:20,retire:14},s:F=>lup(F.d,0,-8)*6+lup(F.e,55,80)*5+(F.n===2?4:0)},
 mandela:{x:{retire:30,served:12,limit:14},s:F=>lup(F.u,30,8)*10+lup(F.d,0,-8)*5+(F.n===1?5:0)},
 mujica:{x:{retire:26,served:18,limit:18},s:F=>lup(F.cor,15,2)*12+lup(F.trn,70,95)*5},
 havel:{x:{served:18,limit:18,retire:14,defeated:8},s:F=>lup(F.trn,80,96)*8+lup(F.d,0,-8)*6+(F.turn===-1?4:0)},
 diocl:{x:{retire:30},s:F=>lup(F.d,0,8)*6+lup(F.ins,10,40)*8+(F.n>=2?3:0)},
 sulla:{x:{retire:30},s:F=>lup(F.d,0,8)*8+(F.am?8:0)+(F.dict?6:0)+Math.min(3,F.crush)*2},
 taejong:{x:{retire:28,served:8},s:F=>lup(F.d,2,9)*8+(F.camp==='joseon'?8:0)+Math.min(3,F.crush)*2},
 degaulle:{x:{retire:22,amendfail:18,quit:14,served:10},s:F=>(F.am?10:0)+(/부결에 승복|투표 부결|발의 철회/.test(F.sp)?12:0)+lup(F.d,0,6)*4+(F.war?2:0)},
 sejong:{x:{served:22,limit:22,lifelong:12,retire:8},s:F=>lup(F.d,0,-8)*6+lup(F.f,50,70)*10+lup(F.trn,80,95)*4+lup(F.ins,10,40)*4+(F.camp==='joseon'?3:0)},
 jeongjo:{x:{served:22,limit:22,lifelong:10},s:F=>lup(F.f,50,66)*8+lup(F.u,30,10)*8+(Math.abs(F.d)<5?4:0)+(F.camp==='joseon'?3:0)},
 yeongjo:{x:{served:16,limit:16,lifelong:22},s:F=>lup(F.u,30,10)*8+(F.n>=3?8:0)+lup(F.saf,40,70)*4+(F.camp==='joseon'?4:0)},
 taizong:{x:{served:18,limit:18,lifelong:14},s:F=>lup(F.f,56,70)*10+(F.adv>=2?5:0)+(Math.abs(F.d)<4?3:0)+(F.coup?6:0)},
 lincoln:{x:{served:22,limit:20,defeated:5},s:F=>lup(F.f,45,62)*8+(F.war?6:0)+(Math.abs(F.d)<4?4:0)+lup(F.u,60,25)*4},
 alfred:{x:{served:18,limit:18,lifelong:16},s:F=>(F.war?10:0)+lup(F.mil,50,80)*5+lup(F.ins,10,35)*5+lup(F.f,50,64)*4},
 asoka:{x:{served:16,limit:16,retire:14,lifelong:12,defeated:8},s:F=>(F.turn===-1?22:0)+lup(F.d,0,-6)*3+(F.war?5:0)},
 eliz1:{x:{served:16,limit:16,lifelong:20},s:F=>lup(F.u,35,10)*8+(F.war?5:0)+lup(F.f,52,68)*6+lup(F.n,2,4)*3+(Math.abs(F.d)<5?3:0)},
 akbar:{x:{served:16,limit:16,lifelong:20},s:F=>lup(F.d,1,8)*4+lup(F.u,30,8)*10+lup(F.f,52,66)*4+(F.mil>=65?3:0)},
 maria:{x:{served:16,limit:16,lifelong:18},s:F=>(F.war?6:0)+lup(F.ins,10,35)*5+lup(F.saf,45,70)*5+lup(F.f,50,66)*5},
 attlee:{x:{served:18,limit:16,defeated:14,retire:10},s:F=>lup(F.saf,50,80)*10+(F.T.has('med')?6:0)+lup(F.d,2,-6)*4},
 ike:{x:{served:20,limit:22,retire:10},s:F=>lup(F.mil,55,85)*8+(F.war?5:0)+lup(Math.abs(F.d),6,0)*3+lup(F.f,50,62)*4},
 truman:{x:{served:18,limit:18,retire:10},s:F=>(F.winLow?14:0)+lup(F.a,50,25)*5+lup(F.f,52,64)*5+(F.war?3:0)},
 reagan:{x:{served:20,limit:20},s:F=>(F.pr==='경제'?6:0)+lup(F.e,55,80)*6+lup(F.a,50,75)*6+lup(F.d,0,6)*2},
 peri:{x:{served:18,limit:18,medfail:16,defeated:8,lost:10},s:F=>lup(F.d,0,-8)*6+lup(F.f,50,35)*6+(F.T.has('medx')?5:0)},
 marcus:{x:{served:20,limit:20,lifelong:18,medfail:8},s:F=>lup(F.d,0,6)*5+lup(F.cor,30,10)*8+(/방역|위기 대응/.test(F.pr)?4:0)+lup(F.f,45,65)*5},
 just:{x:{served:16,limit:16,lifelong:18,medfail:12},s:F=>(F.crush?10:0)+lup(F.ins,10,40)*6+(/방역|의료/.test(F.pr)?3:0)+lup(F.d,2,8)*4},
 wilson:{x:{served:18,limit:18,defeated:6,lost:10,medfail:14},s:F=>lup(F.trn,70,40)*8+(F.T.has('world')?5:0)+lup(F.m,50,25)*4},
 hamm:{x:{served:20,limit:20,lifelong:18},s:F=>lup(F.d,1,8)*6+lup(F.ins,8,35)*10+lup(F.f,48,62)*4},
 fred:{x:{served:20,limit:20,lifelong:18},s:F=>lup(F.d,1,8)*6+lup(F.cor,30,10)*6+(F.pr==='경제'?6:0)+lup(F.f,50,65)*4},
 bism:{x:{served:18,limit:18,lifelong:14,defeated:6},s:F=>lup(F.d,1,8)*6+lup(F.saf,45,75)*10+lup(F.f,48,62)*4},
 lky:{x:{served:14,limit:14,lifelong:16,retire:14},s:F=>lup(F.cor,12,2)*10+(F.pr==='경제'?6:0)+lup(F.d,2,8)*6+lup(F.n,2,4)*4+(F.am?4:0)},
 ataturk:{x:{served:16,limit:16,lifelong:18},s:F=>lup(F.d,3,10)*6+lup(F.ins,15,45)*10+lup(F.f,52,66)*4+(F.war?3:0)},
 catherine:{x:{served:14,limit:14,lifelong:18},s:F=>(F.dict?12:0)+(F.coup?6:0)+lup(F.f,52,68)*6+lup(F.ins,10,35)*4},
 sejo:{x:{served:14,limit:14,lifelong:16},s:F=>(F.dict||F.coup?14:0)+lup(F.d,4,10)*6+lup(F.ins,10,35)*5+(F.camp==='joseon'?4:0)},
 wuzt:{x:{served:14,limit:14,lifelong:18},s:F=>lup(F.d,5,12)*8+lup(F.trn,60,30)*4+lup(F.f,50,64)*5+(F.dict?4:0)},
 cromwell:{x:{served:14,limit:14,lifelong:18,ousted:6},s:F=>(F.dict?14:0)+(F.mart?4:0)+lup(F.mil,55,85)*6+lup(F.cor,25,8)*3+(F.war?4:0)},
 caesar:{x:{served:14,limit:14,lifelong:12,ousted:12,quit:6},s:F=>lup(F.d,4,12)*8+lup(F.cor,15,45)*6+(F.dict?(/^(ousted|quit|deposed)$/.test(F.ex)?18:6):0)},
 augu:{x:{served:14,limit:14,lifelong:22},s:F=>(F.dict?10:0)+(F.am?8:0)+lup(F.f,50,68)*8+lup(F.n,2,5)*6+lup(F.d,3,10)*4},
 fdr:{x:{served:16,limit:16,lifelong:16},s:F=>(F.am?10:0)+lup(F.n,2,4)*8+lup(F.saf,45,75)*6+(F.d<3?4:-4)+lup(F.f,55,70)*6+(F.war?3:0)},
 napo:{x:{served:14,limit:14,defeated:12,lifelong:8,ousted:6,amendfail:12},s:F=>(F.am?14:0)+(F.dict?4:0)+lup(F.f,50,65)*6+lup(F.mil,50,80)*6+(F.bw>F.bl?3:0)},
 tr:{x:{defeated:20,served:12,limit:12},s:F=>(F.am?14:0)+lup(F.cor,30,10)*5+(F.bw>F.bl?3:0)+lup(F.f,52,66)*4+(F.camp==='usa'?3:0)},
 louis14:{x:{lifelong:24,served:12,limit:12},s:F=>(F.dict?8:0)+(F.am?6:0)+lup(F.f,60,40)*8+lup(F.n,2,5)*6+lup(F.cor,20,50)*4},
 church:{x:{defeated:24,lost:10},s:F=>lup(F.f,50,65)*8+(F.war?8:0)+lup(F.mil,50,80)*4},
 hoover:{x:{defeated:22,lost:16,ecofail:20},s:F=>lup(F.e,50,20)*10+(F.fin?6:0)+lup(F.f,50,35)*4},
 carter:{x:{defeated:22,lost:14},s:F=>lup(F.cor,15,3)*6+lup(F.trn,75,92)*6+lup(F.f,52,38)*4+(F.oil?6:0)+(F.camp==='usa'?3:0)},
 bush41:{x:{defeated:22,lost:12},s:F=>(F.war?8:0)+lup(F.mil,55,80)*5+lup(F.e,55,30)*5+lup(F.f,48,62)*3},
 grant:{x:{served:18,limit:18,defeated:8},s:F=>lup(F.cor,20,50)*8+(F.war?6:0)+lup(F.mil,55,80)*4+(F.T.has('graft')?5:0)},
 peter:{x:{served:16,limit:16,lifelong:16,ousted:8},s:F=>lup(F.d,3,10)*8+lup(F.ins,10,40)*6+lup(F.f,38,52)*4+lup(F.saf,50,30)*4+(F.bw+F.bl>=3?3:0)},
 boli:{x:{ousted:12,amendfail:17,defeated:12,quit:8,coupfail:18},s:F=>(F.am?12:0)+(F.war?4:0)+lup(F.mil,50,80)*4+lup(F.f,40,60)*3},
 wangmang:{x:{ousted:14,deposed:14,amendfail:16,ecofail:12,coupfail:12},s:F=>(F.am||F.dict?10:0)+lup(F.ins,10,40)*6+lup(F.f,45,30)*6},
 gongmin:{x:{ousted:14,deposed:20,quit:6},s:F=>lup(F.ins,10,40)*6+lup(F.cor,30,10)*4+(F.camp==='joseon'?4:0)+lup(F.f,45,58)*4+(F.turn?3:0)},
 daewon:{x:{ousted:14,deposed:14,retire:12,quit:10},s:F=>lup(F.d,3,10)*6+lup(F.cor,40,15)*5+lup(F.e,55,30)*3+lup(F.ins,10,35)*3+(F.camp==='joseon'?4:0)},
 gwang:{x:{ousted:16,deposed:22,quit:8},s:F=>lup(F.f,45,60)*10+(F.pr==='경제'?3:0)+(F.war?3:0)+(F.camp==='joseon'?4:0)},
 nixon:{x:{quit:18,ousted:14,amendfail:8},s:F=>lup(F.trn,70,35)*10+lup(F.cor,20,50)*6+lup(F.f,45,60)*3+(F.camp==='usa'?4:0)},
 suharto:{x:{ecofail:16,ousted:16,quit:16,lifelong:10},s:F=>lup(F.n,2,5)*8+(F.am||F.dict?6:0)+lup(F.cor,25,55)*6+(F.pr==='경제'?5:0)+(F.fin?5:0)},
 qin:{x:{ousted:14,quit:10,deposed:14,ecofail:8,served:6,lifelong:10},s:F=>lup(F.d,4,12)*10+lup(F.ins,10,40)*4+Math.min(3,F.crush)*3+lup(F.f,50,30)*4},
 yang:{x:{ousted:18,deposed:18,ecofail:12,quit:6},s:F=>lup(F.d,3,10)*6+(F.war?8:0)+lup(F.mil,60,30)*4+lup(F.e,50,25)*4+Math.min(4,F.bl)*2},
 yeonsan:{x:{deposed:24,ousted:16},s:F=>lup(F.d,6,14)*8+lup(F.cor,25,50)*6+lup(F.trn,50,20)*4+(F.camp==='joseon'?5:0)},
 charles1:{x:{coupfail:20,ousted:16,amendfail:16,deposed:10},s:F=>lup(F.d,4,10)*6+(F.T.has('abuse')?6:0)+lup(F.trn,60,30)*3},
 robes:{x:{ousted:18,coupfail:16,quit:6},s:F=>lup(F.d,6,14)*8+Math.min(3,F.crush)*4+lup(F.cor,20,5)*4+lup(F.u,40,70)*4},
 marcos:{x:{ousted:22,quit:8,lifelong:14},s:F=>(F.mart?12:0)+(F.dict?10:0)+lup(F.cor,25,55)*8+(F.am?4:0)},
 ceau:{x:{ousted:22,deposed:12,ecofail:14,lifelong:10},s:F=>(F.dict?10:0)+lup(F.d,6,14)*6+lup(F.e,50,20)*6+lup(F.a,30,5)*4},
 nich2:{x:{ousted:20,quit:14,deposed:16,medfail:8,ecofail:10},s:F=>(F.war?10:0)+lup(F.mil,60,30)*4+lup(F.d,2,8)*5+lup(F.e,50,25)*4},
 gojong:{x:{deposed:16,ousted:14,quit:16,ecofail:10},s:F=>lup(F.mil,50,25)*6+(F.war?6:0)+lup(F.f,50,35)*5+(F.camp==='joseon'?4:0)},
 rhee:{x:{quit:22,ousted:12},s:F=>(F.am?10:0)+lup(F.d,3,10)*5+lup(F.u,40,70)*5+lup(F.trn,60,30)*3+(F.camp==='kr'?3:0)},
 yeltsin:{x:{quit:20,retire:8},s:F=>lup(F.e,50,20)*6+lup(F.a,40,15)*4+lup(F.d,0,-6)*3+(F.war?3:0)},
 edward8:{x:{quit:20},s:F=>lup(F.a,40,70)*8+(F.n===1?5:0)+lup(F.f,40,60)*2},
 chamb:{x:{quit:20,ousted:8},s:F=>(F.war?10:0)+lup(F.d,0,-6)*5+lup(F.mil,50,25)*5},
 gorby:{x:{quit:18,ecofail:10,ousted:8},s:F=>lup(F.trn,60,90)*6+lup(F.d,0,-8)*6+lup(F.e,50,25)*5+(F.turn===-1?4:0)}, louis16:{x:{ousted:18,deposed:18,quit:10,ecofail:10,medfail:10},s:F=>lup(Math.abs(F.d),6,0)*8+lup(F.e,50,20)*6+lup(F.f,50,30)*4+(F.am||F.dict?-10:0)}};
function leaderOf(C){const F=LEADF=leadF(C),seen=MEM.leaders||{};
  const sc=LEADK.map(id=>{const L=LFIT[id];if(!L||L.x[F.ex]==null)return [id,-1e9];
    let v=L.x[F.ex]+L.s(F);if(LNOAM.has(id)&&(F.am||F.dict))v-=25;return [id,v];}).sort((a,b)=>b[1]-a[1]);
  if(sc[0][1]<-1e8)return 'louis16';
  const near=sc.filter(x=>x[1]>=sc[0][1]-3).map(x=>[x[0],Math.random()*3+(seen[x[0]]?0:1.5)]).sort((a,b)=>b[1]-a[1]);
  return near[0][0];}
// 닮은 점: 이 커리어를 한눈에 보여 주는 특징 세 가지까지
function leadWhy(F){if(!F)return '';const w=[F.d>=4?'권력을 모은 통치':F.d<=-4?'견제와 분산의 통치':'균형을 잡은 통치'];
  const c=[[F.dict,'계엄 뒤 영구집권'],[F.am,'개헌으로 연임'],[F.mart&&!F.dict,'계엄 선포'],[F.end,'엔데믹 선언'],[F.turn===-1,'집중에서 분산으로 돌아섬'],[F.turn===1,'분산에서 집중으로 돌아섬'],
   [F.winLow,'열세를 뒤집은 선거'],[F.cor<=8,'청렴한 정부'],[F.trn>=90,'투명한 정부'],[F.u<=12,'통합의 정치'],[F.saf>=70,'두터운 안전망'],[F.ins>=35,'제도를 남김'],
   [F.crush>0,'강제 진압'],[F.mil>=75,'강한 군'],[F.bw>=2&&F.bw>F.bl,'승부수가 통함'],[F.bl>=2&&F.bl>F.bw,'무리수가 잦음'],[F.cor>=45,'부패의 그늘'],[F.war,'전쟁을 겪음'],
   [F.pr,F.pr+' 우선']];
  for(const [ok,t] of c){if(w.length>=3)break;if(ok)w.push(t);}return w.join(' · ');}// 커리어 점수: 상한 없이 이룬 것은 더하고 무너진 것은 뺀다. 모든 항목이 정수라 합계도 정수다.
// 임기 점수가 가장 크고, 임기가 거듭될수록 1 · 0.7 · 0.45 · 0.3 · 0.2배로 줄어든다(조선은 1 · 0.6 · 0.35 · 0.2배). 아주 잘한 긴 커리어여야 10,000점 언저리에 닿는다.
// 조선은 임기 한도도 개헌(−500)도 없이 국난만 넘기면 치세가 이어져, 같은 길이의 커리어에서 치세 점수가 더 쌓였다.
// 그래서 두 번째 치세부터 조금 더 빨리 줄인다(첫 치세는 같다). 시뮬레이션에서 잘하는 플레이의 상위 점수가 대한민국과 비슷해지게 맞췄다
const TERMW_J=[1,.6,.35,.2];
const TERMW=[1,.7,.45,.3,.2],GRADEPT={S:500,A:300,B:150,C:0,D:-150,F:-300},TIERPT=[40,5,-15,-50],
  EXITPT={retire:600,served:400,limit:300,lost:0,defeated:-100,lifelong:-300,quit:-500,ousted:-800,deposed:-800,medfail:-800,ecofail:-800,amendfail:-1000,coupfail:-1500,purged:-800,defeat:-600},
  TROX=new Set(['coup','coupfail','coupx','selfcoup','martial']);   // 헌정을 무너뜨린 기록은 더 크게 뺀다
function careerScore(kind,years){const it=[],add=(n,v,note)=>{v=Math.round(v);if(v)it.push([n,v,note||'']);return v;},jo=CP.id==='joseon';
  let perf=0;const TW=jo?TERMW_J:TERMW;CAR.terms.forEach((t,i)=>{const w=TW[Math.min(i,TW.length-1)],s=Math.round(cl(t.sc));
    perf+=add((jo?(i+1)+'번째 치세':(i+1)+'기')+' · '+t.g+'등급',(s*30+(GRADEPT[t.g]||0))*w,'임기 점수 '+s+'×30'+(GRADEPT[t.g]?' '+(GRADEPT[t.g]>0?'+':'−')+Math.abs(GRADEPT[t.g]):'')+(w<1?', ×'+w:''));});
  const wins=CAR.terms.filter(t=>t.elect==='당선'||t.elect==='반정 진압'||t.elect==='쿠데타 진압'||t.elect==='승전'),up=wins.filter(t=>t.winP<50).length;
  // 조선은 선거 대신 국난에서 왕권을 지킨 횟수(36b-joseon-crisis.js)
  const kw=jo&&CAR.kg?CAR.kg.win:[],nw=wins.length+kw.length,nu=up+kw.filter(w=>w.p<50).length;
  const cont=add(jo?'국난 극복':CP.id==='reich'?'승전 · 쿠데타 진압':'선거 승리',nw*300+nu*200,nw+'번'+(nu?' (열세를 뒤집은 '+nu+'번 +200씩)':''));
  // 판정과 업적·불명예도 그 일이 있었던 임기의 비율(TERMW)을 따른다
  const tw=k=>TW[Math.min(Math.max(0,(k||1)-1),TW.length-1)],TT=(CAR.ttT||[]).concat([CAR.tt||[0,0,0,0]]),tt=[0,1,2,3].map(k=>TT.reduce((s,a)=>s+(a[k]||0),0));
  add('판정',TT.reduce((s,a,i)=>s+tw(i+1)*a.reduce((q,v,k)=>q+v*TIERPT[k],0),0),TIER.map((T,k)=>T.n+' '+tt[k]).join(' · '));
  const tro=CAR.tro||[],sp=t=>/^sp_/.test(t.id),gN=tro.filter(t=>t.g&&!sp(t)).length,gS=tro.filter(t=>t.g&&sp(t)).length,
    bX=tro.filter(t=>!t.g&&TROX.has(t.id)).length,bS=tro.filter(t=>!t.g&&sp(t)).length,bN=tro.length-gN-gS-bX-bS;
  const tp=(f,v)=>tro.filter(f).reduce((s,t)=>s+v*tw(t.term),0);
  add('업적',tp(t=>t.g&&!sp(t),100)+tp(t=>t.g&&sp(t),300),gN+'개 ×100'+(gS?' · 특별 과제 '+gS+'개 ×300':''));
  add('불명예',-(tp(t=>!t.g&&!sp(t)&&!TROX.has(t.id),150)+tp(t=>!t.g&&sp(t),300)+tp(t=>!t.g&&TROX.has(t.id),800)),bN+'개 ×150'+(bS?' · 특별 과제 '+bS+'개 ×300':'')+(bX?' · 헌정 파괴 '+bX+'건 ×800':''));
  add('승부수',(CAR.boldWin||0)*120-(CAR.boldLoss||0)*100,'통함 '+(CAR.boldWin||0)+' · 무리수 '+(CAR.boldLoss||0));
  if(CAR.endemic)add('엔데믹 선언',600);
  add('개헌',-500*(CAR.amend||0),(CAR.amend||0)+'번');
  if(CAR.dict)add('계엄 영구집권',-2000);
  add('퇴장',EXITPT[kind]||0,EXH[kind]||kind);
  add('마지막 지지율',(Math.round(S.a)-50)*10,Math.round(S.a)+' (50 기준 ×10)');
  add('운명 개입',-60*((RUN&&RUN.rr)||0),((RUN&&RUN.rr)||0)+'번');
  const total=it.reduce((s,x)=>s+x[1],0),ex=EXITPT[kind]||0;
  return {total:total,perf:perf,cont:cont,honor:total-perf-cont,avg:r1(CAR.terms.reduce((s,t)=>s+cl(t.sc),0)/Math.max(1,CAR.terms.length)),ex:ex,items:it};}function careerEnd(kind){if(CAR.done)return;CAR.done=1;if(RUN)svDrop(RUN.id);window.scrollTo(0,0);
  if(CAR.tEval!==CAR.term){const te=evalTerm(ENDS[kind]||kind==='quit'?kind:'done');te.decision=EXH[kind]||kind;CAR.terms.push(te);CAR.tEval=CAR.term;if(!godRun())MEM.ends[te.eid]=(+MEM.ends[te.eid]||0)+1;
    const py=partialYear();if(py)CAR.yrs.push(yearSnap(py,[],0));}
  const god=godRun();if(!god)secCheck(kind);   // 조성민 판은 비밀 인물을 열지 않고 이 기기 기록에도 남기지 않는다
  CAR.exit=kind;if(!CAR.cs.length||kind!=='retire'&&kind!=='lost'&&kind!=='limit'&&kind!=='defeated'){CAR.cs.push(S.c);CAR.ts.push(S.trn);CAR.us.push(S.u);CAR.ss.push(S.saf);}
  const C=careerStats(),lid=leaderOf(C),L=LEAD[lid],why=leadWhy(LEADF);
  const good=CAR.tro.filter(t=>t.g).length,badN=CAR.tro.length-good;
  const years=(CAR.term-1)*YRS+Math.max(1,Math.ceil(S.turn/PY)),age1=CAR.age0+years;
  const SC=careerScore(kind,years),csc=SC.total;
  const newBest=!god&&csc>(MEM.best100||0),newLead=!god&&!(MEM.leaders||{})[lid];
  if(!god){MEM.best100=Math.max(MEM.best100||0,csc);MEM.longest=Math.max(MEM.longest||0,years);MEM.careers=(MEM.careers||0)+1;MEM.runs++;MEM.leaders=MEM.leaders||{};MEM.leaders[lid]=(+MEM.leaders[lid]||0)+1;msave();}
  // 오늘의 도전: 기록에 도전 날짜가 붙어 나간 뒤 원래 난수로 되돌린다(결산 화면의 꾸밈은 보통 난수로)
  const dcI=DC?{date:DC.date,ranked:DC.ranked}:null;dcDone(csc);
  sendCareer(EXH[kind]||kind,{lid:lid,csc:csc,years:years,good:good,bad:badN,SC:SC});dcEnd();

  const ct=CAR.terms.map((t,j)=>'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);opacity:0;animation:fdIn .35s ease-out forwards;animation-delay:'+(j*90)+'ms">'+
    '<span style="font-size:12px;color:var(--text-muted);width:30px">'+(CP.id==='joseon'?'치세'+t.term:t.term+'기')+'</span><span style="font-size:18px;font-weight:700;color:'+GCOL[t.g]+';width:22px">'+t.g+'</span><span style="flex:1;min-width:0"><span style="display:block;font-size:13px;color:'+t.col+'">'+t.ti+'</span><span style="display:block;font-size:11px;color:var(--text-muted)">'+t.scenario+(t.elect?' · 다음 대선 '+t.winP+'% '+t.elect:'')+'</span></span></div>').join('');
  const tro=CAR.tro.length?CAR.tro.map(t=>chip(t.n+' <span style="color:var(--text-muted)">· '+t.term+'기 '+t.year+'년</span>',t.g?'#2e7d55':'#b3261e')).join(''):'<span style="font-size:12px;color:var(--text-muted)">남은 기록이 없다.</span>';
  const row=(a,b)=>'<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--text-secondary)">'+a+'</span><span style="font-weight:600">'+b+'</span></div>';
  const tg=CAR.terms.map(t=>t.term+'기 '+t.g).join(' · ');
  const summary=(CP.id==='kr'?'팬데믹 대통령':'팬데믹 대통령 DLC · '+CP.n)+' — '+NICK+'의 인생\n'+(CAR.bgx||CAR.bg+' 출신')+' · '+CAR.term+'선 · '+years+'년 재임 ('+CAR.age0+'–'+age1+'세)\n겪은 위기: '+CAR.terms.map(t=>t.scenario).join(' → ')+'\n결말: '+(EXH[kind]||kind)+'\n닮은 지도자: '+L.n+' ('+L.k+')\n임기별 평가: '+tg+'\n업적 '+good+' · 불명예 '+badN+'\n커리어 점수 '+csc+'점 (임기 '+SC.perf+' · 선거 '+SC.cont+' · 업적과 그 밖의 것 '+SC.honor+')';
  // 리더보드에 갔다가 돌아오면 이 화면을 다시 그린다
  const bt=CAR.terms.reduce((a,t)=>!a||t.sc>a.sc?t:a,null);
  // 기록 카드(lazy/card): 사진 한 장에 들어갈 것만 추린다
  const now=new Date(),jo=CP.id==='joseon';
  const CARD={who:NICK+' '+CP.role+'의 인생',bg:CAR.bgx||CAR.bg+' 출신',stageTag:dcI?'오늘의 도전 · '+CP.n:CP.id==='kr'?'대한민국':CP.tag+' · '+CP.n,ending:EXH[kind]||kind,
    sub:jo?CAR.term+'번의 치세 · '+years+'년':CAR.term+'선 · '+years+'년 재임',age:CAR.age0+'세 취임 → '+age1+'세',scen:CAR.terms.map(t=>t.scenario).join(' → '),
    grades:CAR.terms.map(t=>[jo?'치세'+t.term:t.term+'기',t.g]),best:(bt||{g:'-'}).g,L:{n:L.n,k:L.k,col:L.col,era:L.era},good:good,bad:badN,score:csc,newBest:newBest,
    date:now.getFullYear()+'.'+String(now.getMonth()+1).padStart(2,'0')+'.'+String(now.getDate()).padStart(2,'0')};
  const medalH=(bt?'<div class="chr-md" aria-hidden="true"><svg viewBox="0 0 70 34" width="70" height="34"><path d="M18 0H33L38 34H23Z" fill="#a8321f"/><path d="M52 0H37L32 34H47Z" fill="#2f4a6b"/></svg><div class="disc"><b>'+bt.g+'</b><span>최고 임기</span></div></div>':'');
  const show=first=>{window.scrollTo(0,0);
  R.innerHTML='<div style="animation:fdIn .45s ease-out">'+
   (dcI?'<div class="dc-res"><div><b>오늘의 도전 · '+dcLabel(dcI.date)+'</b><span>'+(dcI.ranked?'순위 판 · 오늘의 순위에 올라가요':'연습 판 · 순위에는 오르지 않아요')+'</span></div><button id="dcRank" type="button">오늘의 순위</button></div>':'')+
   lab(NICK+' 대통령의 인생 · '+(CAR.bgx||CAR.bg+' 출신'))+
   '<div style="font-size:27px;font-family:var(--font-voice);font-weight:800;line-height:1.25;margin-bottom:6px">'+(EXH[kind]||kind)+'</div>'+
   '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">'+CAR.term+'선 · '+years+'년 재임 · '+CAR.age0+'세에 취임해 '+age1+'세에 물러남<div style="margin-top:4px;color:var(--text-muted)">겪은 위기 · '+CAR.terms.map(t=>t.scenario).join(' → ')+'</div></div>'+
   '<div style="position:relative;border-radius:14px;padding:18px 16px;margin-bottom:12px;background:linear-gradient(135deg,'+L.col+'26,var(--paper) 62%);border:1px solid '+L.col+'66;overflow:hidden">'+
     '<div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:8px">당신과 닮은 지도자'+(newLead?' <span style="color:#fff;background:'+L.col+';padding:1px 6px;border-radius:4px;letter-spacing:0;margin-left:4px">NEW</span>':'')+'</div>'+
     '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px"><div style="flex:1;min-width:0"><div class="hd" style="font-size:28px;margin-bottom:2px;animation:fdIn .5s ease-out .2s both">'+L.n+'</div>'+
     '<div style="font-size:12px;color:var(--text-muted)">'+L.era+'</div></div><div style="flex-shrink:0;animation:reelIn .5s ease-out .3s both">'+portrait(L.n,84,L.col)+'</div></div>'+
     '<div style="display:inline-block;font-size:13px;font-weight:600;color:#fff;background:'+L.col+';padding:3px 10px;border-radius:6px;margin-bottom:10px">'+L.k+'</div>'+
     '<div style="font-size:14px;line-height:1.75;color:var(--text-primary)">'+L.d+'</div>'+
     '<div style="font-size:11px;color:var(--text-muted);margin-top:10px">선택 패턴을 바탕으로 한 게임 속 비유이며, 실제 인물에 대한 평가가 아니다.</div></div>'+
   card(lab('권력 성향 그래프 · 해마다 고른 선택의 방향')+powerChart()+
     '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:6px"><span><b style="color:#b3261e">■</b> 권력 집중</span><span><b style="color:#2f5f99">■</b> 견제·분산</span></div>')+
   // 임기별 평가는 연대기 두루마리로 펼치고, 가장 좋았던 임기의 등급을 메달로 내린다
   '<div class="chr'+(first?'':' open still')+'" id="chr"><div class="chr-roll"></div><div class="chr-w"><div><div class="chr-p">'+lab('임기별 평가')+'<div class="ct">'+ct+'</div></div></div></div><div class="chr-roll"></div>'+
     medalH+'</div>'+
   card(lab('업적 '+good+' · 불명예 '+badN)+tro)+
   '<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:12px">'+
     '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px"><span style="font-size:13px;color:var(--text-secondary)">커리어 점수'+(newBest?' <span style="font-size:11px;color:#2e7d55;margin-left:4px">최고 기록</span>':'')+'</span><span><span id="scn" style="font-size:34px;font-weight:700">0</span><span style="font-size:13px;color:var(--text-muted)">점</span></span></div>'+
     SC.items.map(x=>'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:13px;padding:6px 0;border-top:1px solid var(--border)"><span>'+x[0]+(x[2]?' <span style="font-size:11.5px;color:var(--text-muted)">'+x[2]+'</span>':'')+'</span><b style="color:'+(x[1]>=0?'#2e7d55':'#b3261e')+';font-variant-numeric:tabular-nums;white-space:nowrap">'+(x[1]>=0?'+':'−')+Math.abs(x[1]).toLocaleString('ko-KR')+'</b></div>').join('')+'</div>'+
   lab('마지막 순간의 숫자')+
   '<div style="background:var(--surface-1);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px">'+
   VORD.map(k=>row(vName(k),Math.round(vVal(k)))).join('')+row(SCX().iName,Math.round(S.i))+row('누적 인명 피해 지수',Math.round(cDeaths))+row('개헌',(CAR.amend||0)+'회'+(CAR.amendHow?' ('+CAR.amendHow+')':''))+(CAR.dict?row('영구집권',CAR.dict+'기 계엄으로 시작'):'')+(CAR.spLog&&CAR.spLog.length?row('특별 이벤트',CAR.spLog.join(', ')):'')+'</div>'+
   (CAR.camp==='reich'?histPanel():'')+
   (kind==='defeat'&&CAR.camp==='reich'?'<button id="rhine" class="pri" style="width:100%;margin-bottom:8px;padding:15px;font-weight:700">에피소드 · 라인강의 기적 시작 ▶<span style="display:block;font-size:12px;font-weight:500;opacity:.85;margin-top:3px">1949년, 폐허 위의 새 공화국을 이끈다</span></button>':'')+
   '<button id="again" style="width:100%;margin-bottom:8px;padding:14px;font-weight:600;background:#2f4a6b;border-color:#2f4a6b">새 인생 시작</button>'+
   (god?'<p style="margin:0 0 8px;padding:12px;border-radius:10px;font-size:13px;line-height:1.6;text-align:center;color:var(--text-secondary);border:1px dashed var(--border)">⚡ 데우스 엑스 마키나의 판은 명예의 전당과 이 기기의 기록에 남지 않는다.</p>':
   '<button id="lbMine" style="display:block;width:100%;margin-bottom:8px;padding:13px;border-radius:10px;font-size:14px;font-weight:600;color:#8f6a12;border:1px solid rgba(143,106,18,.45);background:rgba(143,106,18,.08)">명예의 전당에서 내 순위 보기</button>')+
   // 기록 카드: 공유(카카오톡 · 인스타 스토리 · 다른 앱) · 사진으로 저장. 둘 다 같은 카드 창을 열고, 디자인 넷 가운데 고른다
   '<div class="cd-btns"><button id="cdShareBtn" class="pri"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>기록 카드 공유</button>'+
     '<button id="cdSaveBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>사진으로 저장</button></div>'+
   '<button id="cp" style="width:100%;font-size:13px">결과 글 복사하기</button></div>';
  // 두루마리 펼침과 점수 올라가기(처음 그릴 때만)
  const openChr=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const c=document.getElementById('chr');if(c)c.classList.add('open');}));
  let counted=!first;const runScore=()=>{if(counted)return;counted=true;setTimeout(()=>{const el=document.getElementById('scn');if(el)countUp(el,csc,1400);},400);};
  if(!first)document.getElementById('scn').textContent=csc;
  if(first){openChr();runScore();}
  document.getElementById('again').onclick=()=>{SFX.click();home();};
  if(document.getElementById('rhine'))document.getElementById('rhine').onclick=()=>{SFX.click();rhineGo();};
  if(!god)document.getElementById('lbMine').onclick=()=>{SFX.click();openBoard({back:()=>show(false),id:RUN.id,nick:NICK});};
  document.getElementById('cp').onclick=function(){copyText(summary,this);};
  if(document.getElementById('dcRank'))document.getElementById('dcRank').onclick=function(){SFX.click();dcOpen(this,{score:csc,ranked:dcI.ranked});};
  document.getElementById('cdShareBtn').onclick=function(){SFX.click();cardOpen(CARD,'share');};
  document.getElementById('cdSaveBtn').onclick=function(){SFX.click();cardOpen(CARD,'save');};};
  show(false);
  // 화면을 꽉 채운 엔딩 장면: 결말 → 닮은 지도자 → 연대기 → 커리어 점수. 마지막 버튼을 누르면 자세한 결과 화면이 보인다.
  let scored=false;SFX.ending(kind);
  cine([
   {t:'결말',h:'<div class="cs-c"><div class="cs-k a1">'+NICK+' '+CP.role+'의 인생 · '+(CAR.bgx||CAR.bg+' 출신')+'</div><div class="cs-h a2">'+(EXH[kind]||kind)+'</div><div class="cs-line"></div>'+
     '<div class="cs-sub a3">'+CAR.term+'선 · '+years+'년 재임 · '+CAR.age0+'세에 취임해 '+age1+'세에 물러남</div><div class="cs-sub a4">겪은 위기 · '+CAR.terms.map(t=>t.scenario).join(' → ')+'</div></div>'},
   {t:'닮은 지도자',h:'<div class="cs-row"><div class="cs-art"><div class="lrv-m">'+portrait(L.n,300)+'</div></div><div class="cs-tx"><div class="cs-k a1">당신과 닮은 지도자'+(newLead?' · NEW':'')+'</div>'+
     '<div class="cs-h a2">'+L.n+'</div><div class="cs-sub a3">'+L.era+' · '+L.k+'</div>'+(why?'<div class="cs-sub a3" style="margin-top:6px;opacity:.85">닮은 점 · '+why+'</div>':'')+'<div class="cs-line"></div><p class="cs-p">'+cw(L.d.replace(/<[^>]+>/g,''),1100,35)+'</p>'+
     '<div class="cs-note a4">선택 패턴을 바탕으로 한 게임 속 비유이며, 실제 인물에 대한 평가가 아니다.</div></div></div>'},
   {t:'연대기',h:'<div class="cs-c"><div class="cs-k a1" style="margin-bottom:16px">임기별 평가</div><div class="chr"><div class="chr-roll"></div><div class="chr-w"><div><div class="chr-p"><div class="ct">'+ct+'</div></div></div></div><div class="chr-roll"></div>'+medalH+'</div></div>'},
   {t:'커리어 점수',h:'<div class="cs-c"><div class="cs-k a1">커리어 점수'+(newBest?' · 최고 기록':'')+'</div><div class="cs-score a2"><span class="cs-num">0</span><small>점</small></div><div class="cs-line"></div><div class="cs-sub a3">업적 '+good+' · 불명예 '+badN+'</div></div>'}],
   {done:'결과 자세히 보기',onShow:(k,el)=>{
     if(k===2){const c=el.querySelector('.chr');requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.add('open')));}
     if(k===3&&!scored){scored=true;setTimeout(()=>{SFX.count(1.4);SFX.grade(grade(C.perf),1.4);if(newBest)SFX.record(2.1);countUp(el.querySelector('.cs-num'),csc,1400);},500);}}});}

function countUp(el,to,ms){const t0=performance.now();(function f(n){const k=Math.max(0,Math.min(1,(n-t0)/ms));el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f);})(t0);}
function copyText(t,btn){const orig=btn.textContent,done=()=>{btn.textContent='복사됨';setTimeout(()=>btn.textContent=orig,1600);};
  function fb(){const ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(ta);done();}
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,fb);else fb();}

