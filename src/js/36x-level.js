/* ---------- v6 대통령 레벨 · 칭호 · 옷장 ----------
   무엇을 하든 XP가 쌓여 레벨(1~50)이 오른다. 레벨 구간마다 칭호, 레벨 · 조건마다 대통령 옷(지금은 「대통령 출근길」에서만 보인다).
   · XP 원천(lvAdd를 부르는 곳): 임기를 마친 인생(32-career-end) · 처음 만난 지도자 · 새 임기 평가(31-term-eval · 32-career-end)
     · 비밀 처음 찾기(21-easter-eggs eggSet) · 미니게임 한 판(37-research-log sendArcade, 기록이 올라갈 만한 판만) · 출근 미션 도장(lazy/cg)
     · 하루 첫 입장(home → lvDaily).
   · 레벨 곡선: L → L+1에 100 + 50×(L−1) XP. 50이 끝.
   · 소급: v6 전에 쌓은 기록(지나온 인생 · 도감 · 비밀 · 미니게임 판 수 · 출근 도장)으로 처음 한 번 시작 XP를 정한다(lvSeed).
   · 저장: MEM.lv = {v:1, x:확정 XP, p:서버에 아직 안 보낸 XP, mid:마지막으로 맞춘 회원 아이디, fit:고른 옷('' = 기본), u:{열린 조건 옷}, day:오늘 첫 입장 날짜}
     회원이면 서버(Apps Script v28, 회원 op 'lv')에 맞춘다: 서버는 {s:소급 최댓값, d:더한 XP 합}을 두고 s+d를 돌려준다.
     이 기기에서 처음 맞추는 회원이면 이 기기의 XP 전체를 소급(seed, 최댓값으로 합침)으로, 그다음부터는 새로 받은 XP만(add) 보낸다.
     다른 회원이 이 기기에 들어오면 앞 회원의 기록은 넘기지 않고 서버 값을 받아 온다(학교 공용 컴퓨터).
     비회원이 받은 XP는 이 기기에만 쌓인다. 서버가 아직 v28이 아니면(badop) 이 기기에만 쌓였다가, 서버가 바뀐 뒤 처음 맞출 때 한꺼번에 올라간다. */
const LV_MAX=50;
const lvNeed=L=>100+50*(L-1);
// XP → {L:레벨, cur:이번 레벨에서 쌓은 XP, need:다음 레벨까지 필요한 XP(50이면 0)}
function lvAt(x){let L=1;x=Math.max(0,Math.floor(x||0));while(L<LV_MAX&&x>=lvNeed(L)){x-=lvNeed(L);L++;}return {L:L,cur:L<LV_MAX?x:0,need:L<LV_MAX?lvNeed(L):0};}
const LV_TT=[[1,'초선 의원'],[5,'구청장'],[10,'시장'],[15,'장관'],[20,'국무총리'],[30,'대통령'],[40,'국부'],[50,'전설의 지도자']];
const lvTitle=L=>{let t=LV_TT[0][1];LV_TT.forEach(x=>{if(L>=x[0])t=x[1];});return t;};
const lvDec=()=>{const d=new Date();return d.getMonth()===11||(d.getMonth()===10&&d.getDate()>=20);};   // 크리스마스 철: 11월 20일 ~ 12월 31일
// 옷: lv면 그 레벨부터, ok는 조건(레벨과 상관없이)
const LV_FIT=[
  {id:'suit',n:'남색 양복',d:'처음부터 입는 옷'},
  {id:'santa',n:'산타 옷',d:'크리스마스 철(11월 20일 ~ 12월 31일)에만',ok:lvDec},
  {id:'hazmat',n:'방호복',d:'레벨 8',lv:8},
  {id:'usa',n:'성조기 넥타이',d:'미국 DLC에서 인생을 마치면',ok:()=>!!lvMem().u.usa},
  {id:'royal',n:'곤룡포',d:'조선 DLC에서 인생을 마치면',ok:()=>!!lvMem().u.royal},
  {id:'tux',n:'턱시도',d:'레벨 20',lv:20},
  {id:'space',n:'우주복',d:'미니게임 여섯 개를 모두 한 번씩 하면',ok:()=>{try{return MINI.every(x=>{const m=MEM[x.id==='zombie'?'zg':x.id];return !!(m&&+m.runs>0);});}catch(e){return false;}}},
  {id:'gold',n:'황금 양복',d:'레벨 50',lv:50}];
const lvFitOk=(f,L)=>!!f&&(f.lv?L>=f.lv:f.ok?f.ok():true);
function lvMem(){let m=MEM.lv;if(!m||m.v!==1){m=MEM.lv={v:1,x:lvSeed(),p:0,mid:'',fit:'',u:{},day:''};try{msave();}catch(e){}}if(!m.u||typeof m.u!=='object')m.u={};return m;}
// 소급 XP: v6 전에 쌓은 기록으로
function lvSeed(){const k=o=>Object.keys(o||{}).length,mg=['zg','sail','star','qx','cg','ax'].reduce((s,g)=>s+((MEM[g]&&+MEM[g].runs)||0),0);
  return Math.min(60000,(+MEM.careers||0)*150+k(MEM.leaders)*150+k(MEM.ends)*200+k(MEM.egg)*100+Math.min(400,mg)*15+((MEM.cg&&+MEM.cg.st)||0)*50);}
const lvXP=()=>{const m=lvMem();return m.x+m.p;};
const lvNow=()=>lvAt(lvXP());
// 지금 입은 옷(고른 옷을 못 입게 됐으면 기본: 크리스마스 철은 산타, 그 밖은 양복)
function lvFit(){const m=lvMem(),L=lvNow().L,f=LV_FIT.find(x=>x.id===m.fit);return f&&lvFitOk(f,L)?f.id:lvDec()?'santa':'suit';}
// 지금 판의 회원(토큰이 있을 때만)
const lvMid=()=>{try{return PF&&PF.mid&&acTok()?PF.mid:'';}catch(e){return '';}};

/* ----- XP 받기 · 알림 ----- */
let LV_Q=[],LV_B=0,LV_TM=0;
function lvAdd(n,why){n=Math.round(+n||0);if(n<=0)return;const m=lvMem();if(!LV_Q.length)LV_B=lvNow().L;
  if(lvMid())m.p+=n;else m.x+=n;msave();LV_Q.push([why,n]);clearTimeout(LV_TM);LV_TM=setTimeout(lvShow,650);lvSyncSoon();}
function lvDaily(){const m=lvMem(),d=new Date(),k=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();if(m.day===k)return;m.day=k;msave();lvAdd(50,'오늘 첫 입장');}
// 화면 아래 알림: 받은 XP 합과 이유(같은 이유는 묶는다), 레벨이 올랐으면 금빛으로 새 레벨 · 칭호 · 새로 입을 수 있는 옷
function lvShow(){const q=LV_Q;LV_Q=[];if(!q.length)return;const sum=q.reduce((s,x)=>s+x[1],0),by={};q.forEach(x=>{by[x[0]]=(by[x[0]]||0)+x[1];});
  const A=lvNow(),up=A.L>LV_B,L0=LV_B,nt=up&&lvTitle(A.L)!==lvTitle(L0)?lvTitle(A.L):'',nf=up?LV_FIT.filter(f=>f.lv&&f.lv>L0&&f.lv<=A.L).map(f=>f.n):[];
  const old=document.getElementById('lvT');if(old)old.remove();const t=document.createElement('div');t.id='lvT';t.className='lvt'+(up?' up':'');t.setAttribute('role','status');
  t.innerHTML=(up?'<div class="lvt-up"><span>레벨 업!</span><b>Lv '+A.L+'</b>'+(nt?'<em>새 칭호 「'+nt+'」</em>':'<em>'+lvTitle(A.L)+'</em>')+(nf.length?'<small>새 옷: '+nf.join(' · ')+' · 옷장에서 갈아입어요</small>':'')+'</div>':'')+
    '<div class="lvt-r"><b>+'+sum.toLocaleString('ko-KR')+' XP</b><span>'+Object.keys(by).map(k=>k+' +'+by[k]).join(' · ')+'</span></div>'+
    '<div class="lvt-bar"><i><s style="width:'+(A.need?Math.round(A.cur/A.need*100):100)+'%"></s></i><em>Lv '+A.L+(A.need?' · '+A.cur+' / '+A.need:' · 최고 레벨')+'</em></div>';
  document.body.appendChild(t);try{lvCardSync();}catch(e){}try{if(up)[523,659,784,1047].forEach((f,i)=>tone(f,'triangle',.25,.07,i*.09));else tone(880,'triangle',.12,.04);}catch(e){}
  setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),400);},up?5200:3000);}

/* ----- 서버와 맞추기(회원만) ----- */
let LV_SY=0,LV_BUSY=false;
function lvSyncSoon(){clearTimeout(LV_SY);LV_SY=setTimeout(lvSync,2500);}
function lvSync(){const mid=lvMid();if(!mid||LV_BUSY||typeof acApi!=='function')return;const m=lvMem();
  if(m.mid&&m.mid!==mid){m.p=0;m.x=0;m.u={};m.fit='';m.mid=mid;m.fresh=1;msave();}   // 다른 회원이 들어왔다: 앞 회원 기록은 넘기지 않는다
  const first=!m.mid,p0=m.p;LV_BUSY=true;
  acApi('lv',{id:mid,token:acTok(),seed:first?m.x+p0:0,add:first?0:p0,fit:m.fit||'',u:Object.keys(m.u)}).then(r=>{LV_BUSY=false;
    if(!r||!r.ok||typeof r.xp!=='number')return;const n=lvMem();if(lvMid()!==mid)return;
    n.mid=mid;n.fresh=0;n.x=Math.max(0,r.xp);n.p=Math.max(0,n.p-p0);(r.u||[]).forEach(k=>{n.u[k]=1;});if(r.fit)n.fit=r.fit;msave();
    if(n.p>0)lvSyncSoon();try{lvCardSync();}catch(e){}});}

/* ----- 기록 보관소 카드 · 옷장 ----- */
function lvCard(){const A=lvNow();return '<div class="gx-lv" id="gxLv"><div class="gx-lv-t"><span class="gx-lv-b">Lv '+A.L+'</span><b>'+lvTitle(A.L)+'</b></div>'+
  '<i><s style="width:'+(A.need?Math.round(A.cur/A.need*100):100)+'%"></s></i><em>'+(A.need?A.cur.toLocaleString('ko-KR')+' / '+A.need.toLocaleString('ko-KR')+' XP':'최고 레벨')+'</em></div>';}
function lvCardSync(){const o=document.getElementById('gxLv');if(o)o.outerHTML=lvCard();}
function lvRoom(){const A=lvNow(),m=lvMem(),on=lvFit(),nxt=LV_TT.find(x=>x[0]>A.L);
  const fits=LV_FIT.map((f,i)=>{const ok=lvFitOk(f,A.L);return '<button type="button" class="lvw-f'+(ok?'':' lk')+(f.id===on?' on':'')+'" data-f="'+f.id+'" style="--i:'+i+'"'+(ok?'':' aria-disabled="true"')+'>'+
    '<canvas width="120" height="120" data-fit="'+f.id+'" aria-hidden="true"></canvas><b>'+f.n+'</b><small>'+(f.id===on?'입는 중':ok?'입기':f.d)+'</small></button>';}).join('');
  const tt=LV_TT.map(x=>'<li class="'+(A.L>=x[0]?'ok':'')+(lvTitle(A.L)===x[1]?' on':'')+'"><span>Lv '+x[0]+'</span><b>'+x[1]+'</b></li>').join('');
  cine([{t:'옷장 · 칭호',h:'<div class="gx lvw"><div class="lvw-h"><span class="lvw-k">대통령 레벨</span><div class="lvw-lv"><span class="gx-lv-b">Lv '+A.L+'</span><b>'+lvTitle(A.L)+'</b></div>'+
    '<div class="lvw-bar"><i><s style="width:'+(A.need?Math.round(A.cur/A.need*100):100)+'%"></s></i><em>'+(A.need?A.cur.toLocaleString('ko-KR')+' / '+A.need.toLocaleString('ko-KR')+' XP · 다음 칭호 '+(nxt?'Lv '+nxt[0]+' 「'+nxt[1]+'」':'없음'):'최고 레벨')+'</em></div>'+
    '<p class="lvw-n">임기를 마치고, 비밀을 찾고, 미니게임 · 출근 미션을 하면 XP가 쌓여요. 하루 첫 입장은 +50. 옷은 지금 「대통령 출근길」에서 보여요.'+(lvMid()?'':' <b>회원으로 들어오면 레벨이 서버에 저장돼 다른 기기에서도 이어져요.</b>')+'</p></div>'+
    '<h3 class="lvw-s">옷장</h3><div class="lvw-g">'+fits+'</div><h3 class="lvw-s">칭호</h3><ol class="lvw-t">'+tt+'</ol></div>'}],{nav:false,cls:'gm lvw-c',back:home});
  document.querySelectorAll('.lvw canvas[data-fit]').forEach(c=>{const g=c.getContext('2d'),f=c.dataset.fit;g.clearRect(0,0,120,120);g.save();g.translate(60,70);lvBody(g,92,'d',f,{});g.restore();});
  document.querySelectorAll('.lvw-f').forEach(b=>b.onclick=()=>{const f=LV_FIT.find(x=>x.id===b.dataset.f);if(!lvFitOk(f,lvNow().L)){try{gxSfx('lock');}catch(e){}return;}
    try{gxSfx('click');}catch(e){}m.fit=f.id;msave();lvSyncSoon();lvRoom();});}

/* ----- 옷 그림: 대통령 몸(원점이 몸 가운데, cs = 한 칸 크기). f: 'u' 뒷모습 · 'd' 앞 · 'l'/'r' 옆, o: {shield, green, T} ----- */
function lvBody(g,cs,f,fit,o){o=o||{};const T=o.T||performance.now()/1000,gr=!!o.green,back=f==='u',e=f==='d'||back?0:cs*.04;
  const R=(x,y,w,h,r)=>{g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)));else g.rect(x,y,w,h);};
  const C={suit:['#22325a','#161d30'],usa:['#22325a','#161d30'],santa:['#c8333f','#2a2226'],hazmat:['#f2c230','#c99a14'],tux:['#121318','#0b0c10'],royal:['#b3261e','#3a1210'],space:['#e9edf2','#aab3bf'],gold:['#d9a93a','#6b4f12']}[fit]||['#22325a','#161d30'];
  // 다리 · 몸
  g.fillStyle=C[1];g.fillRect(-cs*.13,cs*.12,cs*.1,cs*.17);g.fillRect(cs*.03,cs*.12,cs*.1,cs*.17);
  g.fillStyle=gr?'#4f7a3a':C[0];R(-cs*.24,-cs*.1,cs*.48,cs*.3,cs*.1);g.fill();
  if(!gr){
    if(fit==='santa'){g.fillStyle='#f6f9fd';g.fillRect(-cs*.24,cs*.13,cs*.48,cs*.07);g.fillStyle='#1d1a1c';g.fillRect(-cs*.24,cs*.04,cs*.48,cs*.05);g.fillStyle='#f2c94c';g.fillRect(-cs*.04,cs*.035,cs*.08,cs*.06);
      if(!back){g.fillStyle='#f6f9fd';g.fillRect(-cs*.03,-cs*.1,cs*.06,cs*.14);}}
    else if(fit==='hazmat'){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-cs*.01,-cs*.08,cs*.02,cs*.26);g.fillStyle='#1d1d1d';g.fillRect(-cs*.24,cs*.02,cs*.48,cs*.03);}
    else if(fit==='royal'){g.fillStyle='#f2c94c';g.fillRect(-cs*.24,cs*.06,cs*.48,cs*.04);g.beginPath();g.arc(0,-cs*.01,cs*.075,0,6.283);g.fill();g.fillStyle='#b3261e';g.beginPath();g.arc(0,-cs*.01,cs*.04,0,6.283);g.fill();}
    else if(fit==='space'){g.fillStyle='#2f6fbf';g.fillRect(-cs*.2,-cs*.06,cs*.09,cs*.06);g.fillStyle='#d8344b';g.fillRect(cs*.11,-cs*.06,cs*.09,cs*.06);g.fillStyle='#c5ccd6';g.fillRect(-cs*.24,cs*.08,cs*.48,cs*.03);}
    else if(fit==='gold'){const s=Math.sin(T*4);g.fillStyle='rgba(255,246,200,'+(.5+.4*s)+')';g.fillRect(-cs*.16,-cs*.04,cs*.03,cs*.03);g.fillRect(cs*.12,cs*.06,cs*.03,cs*.03);}
    // 앞모습: 셔츠 깃 · 넥타이(옷마다)
    if(!back&&(fit==='suit'||fit==='usa'||fit==='tux'||fit==='gold')){g.fillStyle='#f4f6fa';g.beginPath();g.moveTo(-cs*.08,-cs*.1);g.lineTo(cs*.08,-cs*.1);g.lineTo(0,cs*.05);g.closePath();g.fill();
      if(fit==='tux'){g.fillStyle='#0b0c10';g.beginPath();g.moveTo(0,-cs*.07);g.lineTo(-cs*.07,-cs*.1);g.lineTo(-cs*.07,-cs*.04);g.closePath();g.moveTo(0,-cs*.07);g.lineTo(cs*.07,-cs*.1);g.lineTo(cs*.07,-cs*.04);g.closePath();g.fill();
        g.fillStyle='#d8344b';g.beginPath();g.arc(-cs*.15,-cs*.04,cs*.03,0,6.283);g.fill();}
      else if(fit==='usa'){for(let i=0;i<5;i++){g.fillStyle=i%2?'#f4f6fa':'#d8344b';g.fillRect(-cs*.025,-cs*.07+i*cs*.028,cs*.05,cs*.028);}g.fillStyle='#2f4f9e';g.fillRect(-cs*.17,-cs*.06,cs*.05,cs*.035);}
      else{g.fillStyle=fit==='gold'?'#6b4f12':'#d8344b';g.fillRect(-cs*.025,-cs*.07,cs*.05,cs*.14);}}}
  // 머리 뒤 두건(방호복)
  if(fit==='hazmat'&&!gr){g.fillStyle='#e8b81d';g.beginPath();g.arc(0,-cs*.28,cs*.235,0,6.283);g.fill();}
  // 얼굴 · 머리카락 · 눈
  g.fillStyle=gr?'#b9d39a':'#f1cfa9';g.beginPath();g.arc(0,-cs*.27,cs*.19,0,6.283);g.fill();g.fillStyle='#1c1c22';
  if(back){if(fit!=='hazmat'){g.beginPath();g.arc(0,-cs*.29,cs*.19,0,6.283);g.fill();}else{g.fillStyle='#e8b81d';g.beginPath();g.arc(0,-cs*.28,cs*.2,0,6.283);g.fill();}}
  else{if(fit!=='hazmat'){g.beginPath();g.arc(0,-cs*.31,cs*.19,Math.PI*1.02,Math.PI*1.98);g.fill();g.fillRect(-cs*.19,-cs*.34,cs*.38,cs*.06);}
    g.fillStyle='#1c1c22';g.fillRect(-cs*.08+e,-cs*.27,cs*.04,cs*.05);g.fillRect(cs*.05+e,-cs*.27,cs*.04,cs*.05);
    if(o.shield){g.fillStyle='#f8fbff';R(-cs*.12+e,-cs*.21,cs*.24,cs*.11,cs*.04);g.fill();}
    if(fit==='hazmat'&&!gr){g.fillStyle='rgba(170,215,245,.55)';R(-cs*.15,-cs*.39,cs*.3,cs*.24,cs*.08);g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=Math.max(1,cs*.015);g.stroke();}
    if(fit==='santa'&&!gr){g.fillStyle='#f6f9fd';g.beginPath();g.moveTo(-cs*.15,-cs*.22);g.quadraticCurveTo(0,-cs*.02,cs*.15,-cs*.22);g.quadraticCurveTo(0,-cs*.14,-cs*.15,-cs*.22);g.fill();}}
  // 머리에 쓰는 것
  if(gr)return;
  if(fit==='santa'){g.fillStyle='#d8344b';g.beginPath();g.moveTo(-cs*.19,-cs*.37);g.quadraticCurveTo(-cs*.02,-cs*.7,cs*.24,-cs*.56);g.lineTo(cs*.19,-cs*.37);g.closePath();g.fill();
    g.fillStyle='rgba(0,0,0,.14)';g.beginPath();g.moveTo(cs*.05,-cs*.4);g.quadraticCurveTo(cs*.12,-cs*.55,cs*.24,-cs*.56);g.lineTo(cs*.19,-cs*.37);g.closePath();g.fill();
    g.fillStyle='#f6f9fd';R(-cs*.22,-cs*.42,cs*.44,cs*.09,cs*.045);g.fill();g.beginPath();g.arc(cs*.25,-cs*.56,cs*.065,0,6.283);g.fill();}
  else if(fit==='royal'){g.fillStyle='#1a1416';R(-cs*.17,-cs*.5,cs*.34,cs*.16,cs*.08);g.fill();g.fillRect(-cs*.2,-cs*.38,cs*.4,cs*.04);
    g.beginPath();g.ellipse(-cs*.2,-cs*.5,cs*.07,cs*.045,-.5,0,6.283);g.ellipse(cs*.2,-cs*.5,cs*.07,cs*.045,.5,0,6.283);g.fill();}
  else if(fit==='space'){g.fillStyle='rgba(185,220,255,.28)';g.beginPath();g.arc(0,-cs*.28,cs*.27,0,6.283);g.fill();g.strokeStyle='#f4f7fb';g.lineWidth=Math.max(1.5,cs*.035);g.stroke();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-cs*.1,-cs*.38,cs*.06,cs*.03,-.6,0,6.283);g.fill();}
  else if(fit==='gold'){g.fillStyle='#f2c94c';g.beginPath();g.moveTo(-cs*.14,-cs*.4);g.lineTo(-cs*.14,-cs*.52);g.lineTo(-cs*.07,-cs*.45);g.lineTo(0,-cs*.55);g.lineTo(cs*.07,-cs*.45);g.lineTo(cs*.14,-cs*.52);g.lineTo(cs*.14,-cs*.4);g.closePath();g.fill();}}
// 미니게임 한 판(명예의 전당에 보낼 만한 판만 sendArcade가 부른다): 15 + 성과(최대 +80)
const LV_MG={zg:'방역선',sail:'대항해',star:'별똥별',qx:'격리 탈출',cg:'출근길',ax:'백신 점프'};
function lvMini(gm,o){o=o||{};const s=+o.score||0,h=/^지옥/.test(String(o.detail||''));
  const pf={cg:s/(h?3:4),ax:s/20,zg:s/1500,star:s/300,qx:Math.floor(s/1000)*6+(o.win?30:0),sail:o.win?40:10}[gm];lvAdd(15+Math.min(80,Math.round(pf||0)),LV_MG[gm]||'미니게임');}
