/* ---------- 특별 과제 진행: 시작 시점, 단계 만들기, 선택의 뒷일, 개헌·계엄 ---------- */
function checkSpecial(){dcSeed('spc');const y=Math.round(S.turn/PY);if(y>=YRS)return false;CAR.spDone=CAR.spDone||{};
  const key=sp=>sp.id+(sp.perTerm?'_'+CAR.term:'');
  const L=(SP[CP.id]||[]).filter(sp=>!CAR.spDone[key(sp)]&&(()=>{try{return sp.cond(y);}catch(e){return false;}})());
  if(!L.length)return false;
  const goodN=(CAR.spLog||[]).filter(x=>x.indexOf(CAR.term+'기 ')===0).length-(CAR.spDone&&Object.keys(CAR.spDone).some(k=>k.indexOf('_'+CAR.term)>0)?1:0);
  const pw=L.filter(sp=>sp.k==='power'),sp=pw.length?pw[0]:(goodN<2&&Math.random()<.55?spPick(L):null);if(!sp)return false;
  CAR.spDone[key(sp)]=1;CAR.spLog=CAR.spLog||[];CAR.spLog.push(CAR.term+'기 '+(y+1)+'년 '+sp.n);
  CAR.spRun={id:sp.id,n:sp.n,k:sp.k,tro:sp.tro,ok:0,done:0,total:sp.steps.length,ctx:{}};
  sp.steps.forEach((f,i)=>queue.splice(i,0,{sg:[sp.id,i]}));
  pendingNews=Object.assign({},sp.bn);bgmGame();return true;}
// 대기열의 특별 이벤트 단계는 함수 대신 [과제 id, 단계 번호] 또는 ['+이어지는 단계 키', 번호]로 둔다(게임 저장이 되도록)
function spGen(g){const k=g[0];if(k[0]==='+')return spMake(SP_NEXT[k.slice(1)],g[1],'이어지는 단계');
  const sp=(SP[CP.id]||[]).find(s=>s.id===k);return spMake(sp.steps[g[1]]||sp.steps.close,g[1]);}
function spMake(f,i,label){const R0=CAR.spRun;const e=f(R0.ctx);e.sp={i:i,n:R0.total};
  e.tag='특별 이벤트 · '+R0.n+' '+(label||((i+1)+'/'+R0.total));e.tc='#8f6a12';return e;}
// 고른 선택의 뒷일: 맥락 저장, 이어지는 단계, 국민투표, 연임 허용
function spAct(a,t){dcSeed('spa');const R0=CAR.spRun;if(!R0)return;R0.done++;if(t<=1)R0.ok++;
  if(a&&a.ctx)R0.ctx[a.ctx[0]]=a.ctx[1];
  // 판정이 실패·대실패면 발의는 좌초, 강행은 무산된다(버튼에 보이는 성공 확률 그대로).
  // 국민투표는 판정과 상관없이 화면에 보인 통과 가능성으로만 갈린다(판정은 효과 크기만 바꾼다).
  if(a&&t>=2&&(a.go||a.force)){const us=CP.id==='usa';SFX.voteFail();CAR.amendFail=CAR.term;
    if(a.go){last.x+=' <em>'+(us?'개정안은 의회 문턱을 넘지 못했다':'개헌안은 국회 문턱을 넘지 못했다')+'.</em> 연임의 길은 닫혔다.';CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 발의 좌초');}
    else if(a.vote){R0.ctx.share=(30+Math.random()*19).toFixed(1);R0.ctx.states=26+Math.floor(Math.random()*11);
      last.x+=' <em>'+(us?'비준한 주 '+R0.ctx.states+'곳, 부결':'찬성 '+R0.ctx.share+'%, 부결')+'.</em> 투표가 무너진 뒤라 다시 밀어붙일 명분도 남지 않았다.';CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 투표 부결');}
    else{CAR.tro.push({id:'coupfail',n:'헌정 파괴 시도',g:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});last.x+=' <em>강행은 무산됐다.</em> 연임의 길은 닫혔고, 시도했다는 기록만 남았다.';CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 강행 무산');}
    a=Object.assign({},a,{go:0,vote:0,force:0});}
  if(a&&a.go){SFX.gavel();const g=a.go;queue.unshift({sg:['+'+g,R0.done]});R0.total++;}
  // 계엄은 판정과 상관없이 화면에 보인 성공 가능성으로만 갈린다
  if(a&&a.nx){if(a.nx==='martial')SFX.martial();const g=a.nx;queue.unshift({sg:['+'+g,R0.done]});R0.total++;}
  if(a&&a.coup){const p=R0.ctx.coupP||30,ok=Math.random()*100<p,yr=Math.floor(S.turn/PY)+1;RUN.coup=(ok?'성공':'실패')+' ('+p+'%)';CAR.spEnds=CAR.spEnds||[];
    if(!ok){SFX.coupFail();CAR.tro.push({id:'coupx',n:'내란 실패',g:0,term:CAR.term,year:yr});CAR.spEnds.push(R0.n+': 내란 실패');CAR.spRun=null;return 'coupfail';}
    SFX.coupOk();CAR.dict=CAR.term;S.p=cl(S.p+10);S.chk=cl(S.chk-22);S.trn=cl(S.trn-12);S.u=cl(S.u+10);S.a=cl(S.a-6);S.mil=cl(S.mil+4);
    CAR.tro.push({id:'selfcoup',n:'친위 쿠데타',g:0,term:CAR.term,year:yr});CAR.spEnds.push(R0.n+': 영구집권');
    last.x+=' <em>국회가 해산되고 비상통치기구가 섰다. 이제 선거는 없다.</em> 다음 임기부터는 투표 없이 권좌를 이어 간다. 견제와 신뢰는 무너졌다.';}
  if(a&&a.end==='lift')CAR.tro.push({id:'martial',n:'계엄 선포',g:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});
  if(a&&a.vote){const p=R0.ctx.passP||50,ok=Math.random()*100<p,share=ok?(50.5+Math.random()*Math.min(25,p/3)).toFixed(1):(30+Math.random()*19).toFixed(1);
    R0.ctx.share=share;R0.ctx.states=ok?38+Math.floor(Math.random()*6):26+Math.floor(Math.random()*11);
    if(ok){SFX.votePass();spAmend(CP.id==='usa'?'주 비준':'국민투표');last.x+=' <em>'+(CP.id==='usa'?'비준한 주 '+R0.ctx.states+'곳, 통과':'찬성 '+share+'%, 통과')+'.</em> 이제 임기가 끝날 때마다 다시 출마할 수 있다.';}
    else{SFX.voteFail();CAR.amendFail=CAR.term;last.x+=' <em>'+(CP.id==='usa'?'비준한 주 '+R0.ctx.states+'곳, 부결':'찬성 '+share+'%, 부결')+'.</em>';queue.unshift({sg:['+'+(CP.id==='usa'?'ratifyFail':'fail'),R0.done]});R0.total++;}}
  if(a&&a.force){SFX.gavel(1);spAmend(a.force);CAR.tro.push({id:'coup',n:'헌정 파괴 논란',g:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});last.x+=' <em>이제 임기가 끝날 때마다 다시 출마할 수 있다. 그 대가는 기록에 남는다.</em>';}
  if(a&&a.endemic){if(t<=1){SFX.endemic();CAR.endemic=CAR.term;CAR.endemicN=a.endemic;S.i=cl(Math.min(S.i,8));CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(a.endemic+' 선언');
      last.x+=' <em>'+a.endemic+' 선언.</em> 남은 임기 동안 위기가 다시 커지지 않고, 해마다 내실이 쌓인다.';}
    else last.x+=' <em>선언은 했지만 곧 환자가 다시 늘었다.</em> 선언은 없던 일이 됐다.';}
  if(a&&a.end){R0.end=a.end;CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': '+(SPEND[a.end]||a.end));if(a.end==='future'){CAR.amendFuture=(CAR.amendFuture||0)+1;}}
  if(!queue.some(q=>q.sg)){ // 마지막 단계
    if(R0.k==='good'&&R0.tro){const g=R0.ok*2>R0.done;CAR.tro.push({id:'sp_'+R0.id,n:R0.tro[g?0:1],g:g?1:0,term:CAR.term,year:Math.floor(S.turn/PY)+1});
      last.x+=' <em>'+R0.n+' 마무리: '+(g?R0.tro[0]:R0.tro[1])+'</em>.';}
    // 올림픽: 메달 집계를 커리어 기록에 남기고, 금메달 셋 이상이면 업적을 하나 더 준다
    if(OLY_IDS.indexOf(R0.id)>=0&&R0.ctx.med){const m=R0.ctx.med;CAR.spEnds=CAR.spEnds||[];CAR.spEnds.push(R0.n+': 금 '+m[0]+' · 은 '+m[1]+' · 동 '+m[2]);
      if(m[0]>=3)CAR.tro.push({id:'oly_gold',n:'금메달 '+m[0]+'개의 대회',g:1,term:CAR.term,year:Math.floor(S.turn/PY)+1});
      if(CAR.wolyAt!=null&&WOLY_IDS.indexOf(R0.id)<0)last.x+=' <em>2년 뒤에는 동계올림픽이 열린다.</em>';}
    CAR.spRun=null;if(OLY_SP.indexOf(R0.id)>=0)bgmGame();}}
const SPEND={future:'다음 대통령부터 적용',drop:'논의를 접음',withdraw:'발의 철회',accept:'부결에 승복',refuse:'계엄 건의 거절',fire:'장성 경질',lift:'계엄 해제',purge:'공신 숙청',appease:'녹봉으로 회유',step:'권한 일부 반환',balance:'대간 강화',swap:'영의정 교체',trust:'재상에게 맡김',keep:'현행 유지'};
// 한 번 고친 헌법은 계속 유지된다(amendPerm): 이후 임기마다 다시 출마할 수 있다
// 판정 주사위를 굴리지 않고 이벤트 확률로만 결과가 갈리는 선택지(국민투표 정면 승부, 계엄 국회 해산)
function spFixed(o){return !!(cur&&cur.sp&&o&&o[4]&&(o[4].vote||o[4].coup));}
// 계엄 성공 가능성: 지지율과는 상관없다. 권력·군사가 70에서 오를수록, 나라가 혼란할수록(혼란 30 기준) 높다
function coupP(){return Math.round(Math.max(10,Math.min(90,35+(vVal('P')-70)*1.5+(vVal('M')-70)*1.5+(vVal('X')-30)+5*cnPow('S'))));}
function spAmend(how){CAR.amendOK=CAR.term;CAR.amendPerm=1;CAR.amend=(CAR.amend||0)+1;CAR.amendHow=(CAR.amendHow?CAR.amendHow+' / ':'')+CAR.term+'기 '+how;}
