/* ---------- 연구용 기록 ---------- */
const SHEET_URL='https://script.google.com/macros/s/AKfycbwN85Q_Ms0h-H2UjT6dRiDFqGYdpJuAaP1Uib7KtEoRFCqrKjiT_kIZPly1DzfgmhtH/exec';
// 게임 버전: 고칠 때마다 올린다(작은 수정 v2.1, 큰 변화 v3.0). 기록 시트의 '게임 버전' 칸에 함께 남는다. 바뀐 내용은 바탕화면 '팬데믹 대통령 업데이트 기록.txt'에 적는다.
const GAME_VER='v3.2';
let NICK='익명',LOG=[],T0=0,RUN=null,SHOWN=0;
// 참가자 정보: 이 창을 닫으면 사라진다(같은 기기를 여러 사람이 쓰므로 브라우저에 저장하지 않는다)
let PF={school:'',name:'',phone:'',agree:false};
const NM={i:'확산',m:'의료',a:'지지율',e:'경제',p:'행정권한',c:'유착',u:'갈등',chk:'견제',trn:'투명성',saf:'안전망',mil:'군사'};
const PRI={i:[-1,'방역'],e:[1,'경제'],a:[1,'여론'],m:[1,'의료'],saf:[1,'복지'],u:[-1,'사회 통합']};
// 권력 방향 점수 = 행정권한 + 유착 - 견제 - 투명성 (선택지에 설계된 효과 기준, 주사위 전)
function dirOf(e){if(e.X==='crush')return [30,'권력 집중'];if(e.X==='quit')return [0,'하야'];
  const v=(e.p||0)+(e.c||0)-(e.chk||0)-(e.trn||0);return [v,v>=5?'권력 집중':v<=-5?'견제·분산':'중립'];}
function priOf(e){let b='없음',bv=0;for(const k in PRI){const v=(e[k]||0)*PRI[k][0];if(v>bv){bv=v;b=PRI[k][1];}}return b==='방역'&&!isCov()?'위기 대응':b;}
function effStr(e){if(e.X==='crush')return '강제 해산';if(e.X==='quit')return '하야';
  return Object.keys(e).filter(k=>NM[k]).map(k=>NM[k]+(e[k]>0?'+':'')+e[k]).join(' ');}
function etype(c){return c.sp?'특별 이벤트':c===UPR?'위기(전국 저항)':c===IMP?'위기(탄핵)':c.path?'선택이 부른 사건':c.st?'상태가 부른 사건':c.tm?'권력의 시험':Object.values(CH).indexOf(c)>=0?'연쇄 사건':'일반 사건';}
function stNow(){const o={};for(const k in NM)o[k]=Math.round(S[k]);o.deaths=Math.round(deaths);return o;}
function peak(){if(!RUN)return;RUN.pkP=Math.max(RUN.pkP,S.p);RUN.pkC=Math.max(RUN.pkC,S.c);}
function where(){const y=Math.min(YRS,Math.floor(S.turn/PY)+1);return {campaign:CP.n,special:cur&&cur.sp?(CAR.spRun?CAR.spRun.n:'특별 이벤트'):'',turn:S.turn+1,year:y,term:CAR.term,scenario:isCov()?(y>=3?'신종 변이':'코로나19'):SCX().n,cyear:(CAR.term-1)*YRS+y,age:ageNow(),cturn:(CAR.term-1)*YRS*PY+S.turn+1};}
function pre(){const o={};for(const k in NM)o['b_'+k]=Math.round(S[k]);return o;}
function logChoice(k){const o=cur.o[k],d=dirOf(o[1]);peak();
  LOG.push(Object.assign({seq:LOG.length+1},where(),pre(),{event:cur.t,eventType:etype(cur),optionNo:k+1,nOptions:cur.o.length,
    choice:o[0],direction:d[1],dirScore:d[0],priority:priOf(o[1]),effects:effStr(o[1]),dice:'',rerolls:0,fit:lastFit.q,fitWhy:lastFit.why.map(w=>(w[0]==='+'?'▲':'▼')+w[1]).join(' / '),risk:o[1].X==='quit'?'':riskOf(lastFit.q)[1].replace('위험 ',''),stake:o[1].X==='quit'?'':STK[lastS].n,
    pOk:o[1].X?'':Math.round((stakeP(lastFit.q,lastS)[0]+stakeP(lastFit.q,lastS)[1])*100),effects6:o[1].X?'':eff6(o[1]),opts:optsStr(),
    pBig:o[1].X?'':Math.round(stakeP(lastFit.q,lastS)[0]*100),pCrash:o[1].X?'':Math.round(stakeP(lastFit.q,lastS)[3]*100),
    hasBold:cur.o.some(x=>!x[1].X&&stakeOf(x,cur.o)===2)?'예':'아니오',hasSafe:cur.o.some(x=>!x[1].X&&stakeOf(x,cur.o)===0)?'예':'아니오',
    adv1:(CAR.cn[0]!=null?CN[CAR.cn[0]].n+'(★'+CN[CAR.cn[0]].t+' '+CN_DOM[CN[CAR.cn[0]].d].n+')':''),adv2:(CAR.cn[1]!=null?CN[CAR.cn[1]].n+'(★'+CN[CAR.cn[1]].t+' '+CN_DOM[CN[CAR.cn[1]].d].n+')':''),
    advSafe:((cur._cr||[]).find(r=>r.s===0)||{k:-1}).k+1||'',advBold:((cur._cr||[]).find(r=>r.s===1)||{k:-1}).k+1||'',
    advFollow:(cur._cr||[]).filter(r=>r.k===k).map(r=>r.c.n).join(' · ')||((cur._cr||[]).length?'안 따름':''),urgent:urgentKeys().map(x=>UNM(x[0])).join(', '),path:cur.path?PATHN[cur.path]+' '+cur.stage+'단계':'',
    decideSec:SHOWN?Math.round((Date.now()-SHOWN)/100)/10:'',after:null}));
  if(cur===UPR||cur===IMP)RUN.crisis.push(CAR.term+'기 '+cur.t+': '+o[0]);}
// 분석용: 화면에 보여 준 선택지 전부(성격·확률·권력 방향·적합도·화면 효과)
function eff6(e){return VORD.map(k=>[k,vDelta(k,e)]).filter(x=>Math.abs(x[1])>=1).map(([k,v])=>vName(k)+(v>0?'+':'')+Math.round(v)).join(' ');}
function optsStr(){try{return cur.o.map((x,i)=>{if(x[1].X)return (i+1)+') '+x[0]+' [특수]';const s=stakeOf(x,cur.o),f=fitOf(x,cur.o).q,P=stakeP(f,s);
  return (i+1)+') '+x[0]+' ['+STK[s].n+' · 성공 '+Math.round((P[0]+P[1])*100)+'% · 대성공 '+Math.round(P[0]*100)+'% · 대실패 '+Math.round(P[3]*100)+'% · 방향 '+dirOf(x[1])[0]+' · 적합도 '+f+' · '+eff6(x[1])+']';}).join(' || ');}catch(e){return '';}}
function logSpecial(choice,ds,dl){const w=where();w.turn=YRS*PY;w.year=YRS;w.cyear=CAR.term*YRS;w.age=CAR.age0+CAR.term*YRS;w.cturn=CAR.term*YRS*PY;
  LOG.push(Object.assign({seq:LOG.length+1},w,pre(),{event:'임기 만료',eventType:'임기 결정',optionNo:'',nOptions:'',choice:choice,direction:dl,dirScore:ds,
    priority:'',effects:'',dice:'',rerolls:0,decideSec:SHOWN?Math.round((Date.now()-SHOWN)/100)/10:'',after:stNow()}));}
function logTier(t){const l=LOG[LOG.length-1];if(l){l.dice=TIER[t].n;l.after=null;}}
function logAfter(){const l=LOG[LOG.length-1];if(l)l.after=stNow();peak();}
// 비밀 게임(방역선·대항해) 점수: 한 판에 한 번, 닉네임·학교·점수만 보낸다. 명예의 전당 오른쪽 두 칸 순위에 쓰인다
// 보낼 기록 상자: 기록은 먼저 이 기기에 넣어 두고, 하나씩 차례로 보낸 뒤 서버에 닿으면 지운다.
// 보내다 끊기면(오프라인 · 창 닫힘) 다음에 접속했을 때 다시 보낸다. 조각마다 k(판ID · 조각 번호)를 붙여, 다시 보내도 서버가 한 번만 쓴다.
// (창을 닫을 때 쓰는 keepalive는 한 페이지에서 동시에 64KB까지라, 조각을 한꺼번에 보내면 뒤 조각이 버려진다)
const OB_KEY='pandemic_outbox_v1',OB_MAX=1200000;
// 이 기기의 플레이어 표시(무작위): 서버가 같은 사람의 여러 판을 '한 사람'으로 묶을 때만 쓴다(명예의 전당 인원 · 학교 평균).
// 이름 · 닉네임과 상관없고 공개 순위에는 나가지 않는다. '이 기기 기록 초기화'를 하면 새로 만든다
const PID_KEY='pandemic_pid_v1';
function pidGet(){try{let p=localStorage.getItem(PID_KEY);if(!p||!/^[0-9a-z]{8,24}$/.test(p)){p=(Date.now().toString(36)+Math.random().toString(36).slice(2,12)).slice(0,20);localStorage.setItem(PID_KEY,p);}return p;}catch(e){return '';}}
let OB_BUSY=false;
function obGet(){try{const L=JSON.parse(localStorage.getItem(OB_KEY)||'[]');return Array.isArray(L)?L:[];}catch(e){return [];}}
function obSet(L){try{let n=0;const K=[];for(let i=L.length-1;i>=0;i--){n+=L[i].b.length;if(n>OB_MAX)break;K.unshift(L[i]);}
  if(K.length)localStorage.setItem(OB_KEY,JSON.stringify(K));else localStorage.removeItem(OB_KEY);}catch(e){}}
function obPush(items){const ks=new Set(items.map(x=>x.k));obSet(obGet().filter(x=>!ks.has(x.k)).concat(items));}
function obFlush(){if(OB_BUSY||!SHEET_URL||IN_ART)return;const it=obGet()[0];if(!it)return;OB_BUSY=true;
  const done=()=>{obSet(obGet().filter(x=>x.k!==it.k));OB_BUSY=false;obFlush();};
  try{fetch(SHEET_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:it.b}).then(done,()=>{OB_BUSY=false;});}catch(e){OB_BUSY=false;}}
addEventListener('online',()=>obFlush());
setTimeout(obFlush,4000);
function sendArcade(game,o){if(!SHEET_URL||IN_ART)return;const id=Date.now().toString(36)+Math.random().toString(36).slice(2,7),k='arc:'+id;
  obPush([{k:k,b:JSON.stringify({k:k,kind:'arcade',v:GAME_VER,rec:Object.assign({id:id,game:game,nickname:NICK||'익명',school:(PF&&PF.school)||'',gv:GAME_VER,pid:pidGet()},o)})}]);obFlush();}
function sendCareer(exitLabel,x){if(!SHEET_URL||IN_ART||!RUN||RUN.sent||!LOG.length)return;RUN.sent=1;
  const l=LOG[LOG.length-1];if(l&&!l.after)l.after=stNow();peak();
  x=x||{};const terms=CAR.terms.slice(),yrs=CAR.yrs.slice();
  if(CAR.tEval!==CAR.term){const pt=evalTerm('done');pt.decision=exitLabel;terms.push(pt);const py=partialYear();if(py)yrs.push(yearSnap(py,[],0));}
  const lt=terms[terms.length-1],C=careerStats();if(!x.lid){C.exit='';x.lid=leaderOf(C);}
  const N=LOG.filter(z=>z.eventType!=='임기 결정');
  const cnt=n=>N.filter(z=>z.direction===n).length;
  const avg=a=>a.length?Math.round(a.reduce((p,q)=>p+q,0)/a.length*10)/10:'';
  const yr=y=>avg(N.filter(z=>z.year===y).map(z=>z.dirScore)),tr=t=>avg(N.filter(z=>z.term===t).map(z=>z.dirScore));
  const fc=N.find(z=>z.direction==='권력 집중'),f=stNow(),good=CAR.tro.filter(t=>t.g).length;
  const years=x.years||((CAR.term-1)*YRS+Math.max(1,Math.ceil(S.turn/PY)));
  const run={id:RUN.id,pid:pidGet(),startedAt:RUN.st,nickname:NICK,school:PF.school,realName:PF.name,phone:PF.phone,consent:PF.agree?'동의':'',difficulty:DIFF[dif].n,perk:CAR.bg,era:MOD.n,
    endingId:lt.eid,ending:lt.ti,score:Math.round(lt.sc),grade:lt.g,playSeconds:Math.round((Date.now()-T0)/1000),months:years*12,
    a:f.a,i:f.i,peakI:lt.peakI,deaths:Math.round(cDeaths),m:f.m,e:f.e,p:f.p,c:f.c,u:f.u,chk:f.chk,trn:f.trn,saf:f.saf,
    ins:Math.round(lt.ins),peakP:Math.round(RUN.pkP),peakC:Math.round(RUN.pkC),auth:lt.auth?'예':'아니오',
    nChoices:N.length,nConc:cnt('권력 집중'),nDisp:cnt('견제·분산'),nNeut:cnt('중립'),avgDir:avg(N.map(z=>z.dirScore)),
    dirY1:yr(1),dirY2:yr(2),dirY3:yr(3),dirY4:yr(4),firstConcTurn:fc?fc.cturn:'',crisis:RUN.crisis.join(' / '),
    dice0:tally[0],dice1:tally[1],dice2:tally[2],dice3:tally[3],rerolls:RUN.rr,tokensLeft:tok,
    mode:MODE[mode].n,terms:CAR.term,careerYears:years,exitType:exitLabel,scenarios:terms.map(t=>t.scenario).join(' → '),elections:CAR.elections.join(' / '),pathEvents:(CAR.pathLog||[]).join(' / '),tutorial:tutOn()?'켬':'끔',avgFit:avg(N.map(z=>typeof z.fit==='number'?z.fit:0)),amendCount:CAR.amend,retireEligible:CAR.retireElig?'예':'아니오',
    leaderId:x.lid,leader:LEAD[x.lid].n,careerScore:x.csc===undefined?'':x.csc,scorePerf:x.SC?x.SC.perf:'',scoreCont:x.SC?x.SC.cont:'',scoreHonor:x.SC?x.SC.honor:'',trophiesGood:good,trophiesBad:CAR.tro.length-good,
    trophyList:CAR.tro.map(t=>(t.g?'+':'-')+t.n+'('+t.term+'-'+t.year+')').join(', '),
    termGrades:terms.map(t=>t.g).join('/'),termTitles:terms.map(t=>t.ti).join(' / '),
    dirT1:tr(1),dirT2:tr(2),dirT3:tr(3),dirT4:tr(4),dirT5:tr(5),ageStart:CAR.age0,ageEnd:CAR.age0+years,crushCount:CAR.crush,
    termScores:terms.map(t=>r1(t.sc)).join('/'),avgTermScore:r1(terms.reduce((s2,t)=>s2+t.sc,0)/terms.length),
    compA:lt.parts.a,compLife:lt.parts.life,compEco:lt.parts.eco,compClean:lt.parts.clean,compInst:lt.parts.inst,lifeScore:lt.parts.lifeScore,instScore:lt.parts.instScore,
    termDecisions:terms.map(t=>t.decision).join(' / '),yearsLogged:yrs.length,
    campaign:CP.n,amendHow:CAR.amendHow||'',amendFuture:CAR.amendFuture||0,specials:(CAR.spLog||[]).join(' / '),specialEnds:(CAR.spEnds||[]).join(' / '),
    nBold:N.filter(z=>z.stake==='승부수').length,nSafe:N.filter(z=>z.stake==='안전책').length,boldWin:CAR.boldWin||0,boldLoss:CAR.boldLoss||0,
    followSafe:N.filter(z=>z.adv1&&z.advFollow&&z.advFollow!=='안 따름'&&z.advFollow.indexOf(z.adv1.split('(')[0])>=0).length,followBold:N.filter(z=>z.adv2&&z.advFollow&&z.advFollow!=='안 따름'&&z.advFollow.indexOf(z.adv2.split('(')[0])>=0).length,
    counselors:(CAR.cnLog||[]).join(' / '),emergencyCall:CAR.cnEm||'',boardPicks:(CAR.boardLog||[]).join(' / '),slashGrades:RUN.slash||'',endemic:CAR.endemicN?CAR.term+'기 '+CAR.endemicN:'',lastShot:RUN.lastShot||'',coup:RUN.coup||'',dict:CAR.dict?CAR.dict+'기 계엄':'',counselorsEnd:cnHired().map(c=>c.n+'(★'+c.t+' '+CN_DOM[c.d].n+')').join(', '),milEnd:Math.round(S.mil||0)};
  const termsOut=terms.map(t=>Object.assign({term:t.term,scenario:t.scenario,elect:t.elect||'',winP:t.winP===''||t.winP==null?'':t.winP,evalId:t.eid,evalTitle:t.ti,score:r1(t.sc),grade:t.g,decision:t.decision,months:t.months,ageStart:t.ageStart,
    peakI:t.peakI,deaths:t.deaths,cDeaths:t.cDeaths,ins:r1(t.ins),auth:t.auth?'예':'아니오',
    compA:t.parts.a,compLife:t.parts.life,compEco:t.parts.eco,compClean:t.parts.clean,compInst:t.parts.inst,lifeScore:t.parts.lifeScore,instScore:t.parts.instScore,
    nCh:t.nCh,nConc:t.nConc,nDisp:t.nDisp,nNeut:t.nNeut,avgDir:t.avgDir,dice0:t.dice[0],dice1:t.dice[1],dice2:t.dice[2],dice3:t.dice[3],troG:t.troG,troB:t.troB},t.ind));
  const choices=LOG.map(z=>{const o=Object.assign({},z,z.after||{});delete o.after;return o;});
  // 창을 닫아도 전송이 끝까지 가려면 한 번에 64KB 아래여야 한다. 넘치면 선택 기록을 여러 조각으로 나눠 보낸다.
  const size=t=>{try{return new TextEncoder().encode(t).length;}catch(e){return t.length*3;}},LIM=60000;
  run.gv=GAME_VER;const head={id:run.id,nickname:run.nickname,school:run.school,difficulty:run.difficulty,mode:run.mode,perk:run.perk,era:run.era,campaign:run.campaign,gv:GAME_VER,careerScore:run.careerScore,exitType:run.exitType,terms:run.terms};
  const parts=[];let curC=[],room=LIM-size(JSON.stringify({v:12,gv:GAME_VER,run:run,choices:[],terms:termsOut,years:yrs}));
  choices.forEach(c=>{const z=size(JSON.stringify(c))+1;if(z>room&&curC.length){parts.push(curC);curC=[];room=LIM-size(JSON.stringify({v:12,gv:GAME_VER,part:'more',run:head,choices:[]}));}curC.push(c);room-=z;});
  parts.push(curC);
  const ab=exitLabel==='중도 이탈',tag=run.id+':'+(ab?'a':'f')+':';
  const items=parts.map((p,k)=>({k:tag+k,id:run.id,a:ab?1:0,b:JSON.stringify(k===0?{k:tag+k,v:12,gv:GAME_VER,run:run,choices:p,terms:termsOut,years:yrs}:{k:tag+k,v:12,gv:GAME_VER,part:'more',run:head,choices:p})}));
  // 끝난 기록이 나가면, 아직 못 보낸 같은 판의 '중도 이탈' 조각은 버린다(서버는 먼저 온 중도 이탈 줄을 지우고 끝난 기록으로 대신한다)
  if(!ab)obSet(obGet().filter(x=>!(x.id===run.id&&x.a)));
  obPush(items);
  if(ab){OB_BUSY=true;try{fetch(SHEET_URL,{method:'POST',mode:'no-cors',keepalive:size(items[0].b)<63000,headers:{'Content-Type':'text/plain'},body:items[0].b}).catch(()=>{});}catch(e){}}
  else obFlush();}
// 커리어 도중에 창을 닫아도 그때까지의 기록을 보낸다(첫 조각은 바로, 나머지는 다음 접속 때)
window.addEventListener('pagehide',()=>{try{if(RUN&&!RUN.sent&&LOG.length&&CAR&&!CAR.done)sendCareer('중도 이탈');}catch(e){}});
// 뒤로 가기 캐시(bfcache)로 페이지가 돌아오면 같은 판을 이어 하므로, 끝났을 때 끝난 기록을 다시 보낼 수 있게 한다
window.addEventListener('pageshow',e=>{if(!e.persisted)return;OB_BUSY=false;if(RUN&&CAR&&!CAR.done)RUN.sent=0;obFlush();});
// 게임 중 휴대폰의 '뒤로'(안드로이드 뒤로 단추 · 아이폰 가장자리 밀기)로 페이지를 떠나 진행을 잃지 않게, 기록 한 칸을 쌓아 두었다가 막는다
let HIST_ON=false;
function histArm(){if(HIST_ON)return;try{history.pushState({pp:1},'');HIST_ON=true;}catch(e){}}
addEventListener('popstate',()=>{if(!HIST_ON)return;HIST_ON=false;
  if(RUN&&CAR&&!CAR.done){histArm();try{eggToast('게임 중에는 뒤로 가기로 나가지 않아요.<br>나가려면 메뉴의 <b>저장하고 나가기</b>를 쓰세요.');}catch(e){}}});
mload();applyView();sndApply();
const INTRO=R.innerHTML;
function pfPhone(v){const d=String(v||'').replace(/\D/g,'');if(!d)return '';if(!/^01[016789]\d{7,8}$/.test(d))return null;return d.slice(0,3)+'-'+d.slice(3,d.length-4)+'-'+d.slice(-4);}
function bindIntro(){const $=id=>document.getElementById(id),err=$('pfErr');
  if($('pfReset'))$('pfReset').onclick=()=>{try{SFX.click();}catch(e){}resetAsk();};   // 첫 화면 맨 아래: 이 기기 기록 초기화
  if(IN_ART)document.querySelectorAll('.pf-pii').forEach(e=>{e.style.display='none';});
  const ph=$('pfPhone');if(ph)ph.oninput=()=>{const d=ph.value.replace(/\D/g,'').slice(0,11);ph.value=d.length>7?d.slice(0,3)+'-'+d.slice(3,d.length-4)+'-'+d.slice(-4):d.length>3?d.slice(0,3)+'-'+d.slice(3):d;};
  $('go').onclick=()=>{
    const nick=($('nick').value||'').trim().slice(0,20);
    if(!IN_ART){const school=($('pfSchool').value||'').trim().slice(0,30),name=($('pfName').value||'').trim().slice(0,20),phone=pfPhone($('pfPhone').value),agree=$('pfAgree').checked;
      const bad=!school?['pfSchool','학교를 적어 주세요.']:!name?['pfName','이름을 적어 주세요.']:phone===null?['pfPhone','전화번호를 010-0000-0000 형식으로 적어 주세요. 상품이 필요 없으면 비워 두세요.']:!agree?['pfAgree','개인정보 수집·이용에 동의해야 시작할 수 있어요.']:null;
      if(bad){err.textContent=bad[1];err.style.display='block';try{$(bad[0]).focus();}catch(e){}return;}
      PF={school:school,name:name,phone:phone,agree:true};}
    err.style.display='none';NICK=nick||'익명';PINH='';   // 저장 비밀번호는 판마다 게임 안에서 건다
    // 같은 기기에서는 다음 판부터 인적사항을 그대로 채워 둔다
    try{localStorage.setItem(PF_KEY,JSON.stringify({school:PF.school,nick:nick}));}catch(e){}
    try{aInit();SFX.coin();}catch(e){}viewSetup(hub);};
  // 지난번 인적사항 채우기
  let mem=null;try{mem=JSON.parse(localStorage.getItem(PF_KEY)||'null');}catch(e){}
  // 예전 판이 이름·전화번호까지 남겨 두었으면 지금 지운다
  if(mem&&(mem.name||mem.phone||mem.agree)){try{localStorage.setItem(PF_KEY,JSON.stringify({school:mem.school||'',nick:mem.nick||''}));}catch(e){}}
  if(mem&&(mem.school||mem.nick)){if($('pfSchool'))$('pfSchool').value=mem.school||'';$('nick').value=mem.nick||'';
    const box=$('pfMem');box.style.display='flex';box.innerHTML='<span>지난번에 적은 학교와 닉네임을 채워 두었어요. 이름과 동의는 같은 기기를 쓰는 다른 사람을 위해 매번 새로 받아요.</span><button id="pfClear">내가 아니에요 · 지우기</button>';
    $('pfClear').onclick=()=>{try{localStorage.removeItem(PF_KEY);}catch(e){}['pfSchool','pfName','pfPhone','nick'].forEach(id=>{if($(id))$(id).value='';});if($('pfAgree'))$('pfAgree').checked=false;box.style.display='none';};}}
const PF_KEY='pandemic_pf_v1';
// 인적사항 다음 화면: 가이드북과 게임 시작
// 이스터에그: 특별한 닉네임을 넣으면 인사말이 바뀐다(일부는 비밀 무대를 연다)
const EGGN=[
 [/좀비|zombie/i,'🧟 …으어어. 어디선가 신음 소리가 들린다. <b>미니게임 「방역선」이 열렸어요.</b>',()=>eggSet('zombie')],
 [/^세종(대왕)?$/,'어서 오시옵소서, 전하. 스물여덟 글자는 준비되어 있사옵니다.'],
 [/^이순신$/,'신에게는 아직 열두 척의 배가 있사옵니다.'],
 [/^홍길동$/,'아버지를 아버지라 부르지 못하고… 오늘은 대통령을 대통령이라 부르셔도 됩니다.'],
 [/^단군(왕검)?$/,'널리 인간을 이롭게 하라. 숨겨진 임기 평가를 찾으면 다시 만날 수 있을지도.'],
 [/정영우|교장/,'교장 선생님…? 설마 진짜세요? 수학 시험은 미뤄 주세요.'],
 [/hafs|외대부고/i,'외대부고 학생이군요. 학교 이름을 잘 적으면 좋은 일이 생길지도 몰라요.'],
 [/^(대통령|president)$/i,'이미 대통령이시군요. 그래도 선거는 치러야 합니다.'],
 [/^(admin|관리자|개발자|developer)$/i,'개발자 모드는 없습니다. 대신 힌트: 게임 제목은 생각보다 많이 눌러 볼 만해요.'],
 [/^claude$/i,'AI가 나라를 이끈다고요? 흥미롭군요. 판정 주사위는 공정합니다.']];
function hub(){window.scrollTo(0,0);document.documentElement.dataset.camp='kr';
  const eg=EGGN.find(x=>x[0].test(NICK||''));if(eg&&eg[2])eg[2]();
  HUB_MSG=(PF.name||NICK)+'님, 준비됐어요.'+(NICK&&NICK!=='익명'?' 명예의 전당에는 <b style="color:#f1d589">'+NICK+'</b>(으)로 올라가요.':'')+(eg?'<div class="cs-fx" style="margin-top:12px">✨ '+eg[1]+'</div>':'');
  home();}
function intro(){bgmIntro(true);window.scrollTo(0,0);document.documentElement.dataset.camp="kr";R.innerHTML=INTRO;bindIntro();}
bgmIntro(true);bindIntro();
