/* ---------- 임기 평가 · 연임 ---------- */
const ENDS={ousted:['거리로 쫓겨난 대통령','여론과 광장이 정권을 먼저 끝냈다. 위기 대응의 성패를 따지기도 전에 정부가 사라졌다.','#b3261e'],
medfail:['의료 붕괴','병상도 인력도 남지 않았다. 이 시기의 사망자 수는 이후 어떤 통계에서도 정상으로 분류되지 않는다.','#b3261e'],
ecofail:['무너진 경제','위기는 어떻게든 버텼다. 사람들이 돌아갈 일자리가 남지 않았을 뿐이다.','#b8541e']};
const r1=v=>Math.round(v*10)/10;
// 임기 점수 = 지지율×0.26 + 생명 보호×0.27 + 경제×0.19 + 청렴(100−유착)×0.11 + 제도 변화×0.17
function scoreParts(){const ins=Math.max(0,(S.chk+S.trn+S.saf)-base),life=cl(100-deaths/2.2),inst=Math.min(100,ins*1.25);
  return {a:r1(S.a*.26),life:r1(life*.27),eco:r1(S.e*.19),clean:r1((100-S.c)*.11),inst:r1(inst*.17),lifeScore:r1(life),instScore:r1(inst)};}
function choiceStats(N){const avg=a=>a.length?r1(a.reduce((p,q)=>p+q,0)/a.length):'';
  return {nCh:N.length,nConc:N.filter(z=>z.direction==='권력 집중').length,nDisp:N.filter(z=>z.direction==='견제·분산').length,nNeut:N.filter(z=>z.direction==='중립').length,avgDir:avg(N.map(z=>z.dirScore))};}
function yearSnap(y,earned,done){const N=LOG.filter(z=>z.term===CAR.term&&z.year===y&&z.eventType!=='임기 결정');
  const hs=hudStats();
  return Object.assign({term:CAR.term,year:y,scenario:y>=3&&isCov()?'신종 변이':isCov()?'코로나19':SCX().n,disp1:hs[0][0]+' '+fmtStat(hs[0]),disp2:hs[1]?hs[1][0]+' '+fmtStat(hs[1]):'',cyear:(CAR.term-1)*YRS+y,age:CAR.age0+(CAR.term-1)*YRS+y-1,done:done?'예':'아니오(중간에 끝남)',
    score:r1(score()),grade:grade(score()),yd:Math.round(yd),cDeaths:Math.round(cDeaths),
    troGood:earned.filter(t=>t.g).map(t=>t.n).join(', '),troBad:earned.filter(t=>!t.g).map(t=>t.n).join(', '),
    dice0:yTally[0],dice1:yTally[1],dice2:yTally[2],dice3:yTally[3]},stNow(),choiceStats(N));}
// 진행 중이던 해에 이미 고른 선택이 있으면 그 해를 '중간에 끝남'으로 남긴다
function partialYear(){const y=Math.floor(S.turn/PY)+1;return y<=YRS&&!CAR.yrs.some(z=>z.term===CAR.term&&z.year===y)&&LOG.some(z=>z.term===CAR.term&&z.year===y)?y:0;}
function evalTerm(kind){
  const ins=Math.max(0,(S.chk+S.trn+S.saf)-base);
  let sc=score();if(kind==='quit')sc-=6;const auth=(S.p>=60&&S.chk<=44),g=grade(sc);
  let eid,ti,ds,col;
  if(ENDS[kind]){eid=kind;ti=ENDS[kind][0];ds=ENDS[kind][1];col=ENDS[kind][2];}
  else if(kind==='quit'){eid='quit';ti='임기를 채우지 못한 대통령';ds='스스로 내려왔다. 그 판단이 옳았는지는 오래 논쟁거리로 남는다.';col='#6e675c';}
  else if(S.c>=60&&S.a>=48){eid='shadow';ti='그림자 정부';ds='유착은 극에 달했는데 지지율은 무너지지 않았다. <em>부패한 정부가 사랑받을 수 있다</em>는 가장 불편한 증명이 됐다.';col='#b3261e';}
  else if(deaths<34&&S.e>=60&&peakI<=45){eid='kmyth';ti=wd('기적의 방역','기적 같은 위기 극복');ds='사람도 지키고 경제도 지켰다. 다른 나라들은 <em>둘 중 하나는 포기해야 했다</em>.';col='#2e7d55';}
  else if(S.trn>=86&&ins>=20){eid='science';ti='과학이 이겼다';ds='이 정부의 무기는 권한이 아니라 <em>공개된 데이터</em>였다. 사람들은 명령이 아니라 근거를 따라 움직였다.';col='#2f5f99';}
  else if(S.a>=58&&S.e>=58&&S.m>=58&&S.i<=25&&S.c<=28&&S.u<=35){eid='balance';ti='완벽한 균형';ds='방역, 경제, 의료, 여론, 청렴. <em>무엇 하나 버리지 않았다</em>. 교과서는 이런 사례를 오래 찾고 있었다.';col='#2f4a6b';}
  // 히든 엔딩 추가분: 운(대성공 비율), 청렴(유착 바닥 + 높은 투명성), 극한의 혼란 속 완주
  else if((()=>{const n=CAR.tt.reduce((a,b)=>a+b,0);return n>=8&&CAR.tt[0]>=Math.max(4,n*.34);})()){eid='lucky';ti='하늘이 내린 운';ds='판정 주사위가 이상할 만큼 <em>당신 편이었다</em>. 실력이었는지 운이었는지는 아무도 모른다. 본인도.';col='#8f6a12';}
  else if(S.c<=3&&S.trn>=78){eid='clean';ti='맑은 물의 정부';ds='뒷돈 한 푼, 감춘 문서 한 장 없었다. <em>털어도 먼지가 나지 않는</em> 정부를 사람들은 처음 보았다.';col='#1f7a72';}
  else if(S.u>=70&&S.c>=50){eid='storm';ti='폭풍 속의 생존자';ds='나라는 갈라졌고 권력 주변은 썩었다. 그런데도 <em>임기를 끝까지 채웠다</em>. 어떻게 버텼는지는 회고록에도 나오지 않는다.';col='#a8406f';}
  else if(auth&&sc<70){eid='auth';ti='권위주의로 돌아선 대통령';ds='위기를 이유로 얻은 권한을 끝내 돌려주지 않았다. <em>다음 대통령도 그 권한을 쓴다.</em>';col='#b3261e';}
  else if(ins>=28&&S.a>=45){eid='inst';ti='제도를 남긴 대통령';ds='개인의 판단이 아니라 <em>구조를 바꿨다</em>. 다음 '+wd('팬데믹','위기')+'에 이 나라가 덜 다친다면 그건 이 임기 덕분이다.';col='#2f4a6b';}
  else if(sc>=80){eid='legend';ti='역사에 남을 대응';ds='세계가 이 나라의 사례를 인용했다. 그리고 실제로 사람이 덜 죽었다.';col='#2e7d55';}
  else if(sc>=66){eid='reelect';ti='신임받은 대통령';ds='완벽하지 않았지만 국민은 이 정부를 믿었다.';col='#2e7d55';}
  else if(sc>=52){eid='modest';ti='무난히 임기를 마친 대통령';ds='큰 실패도 큰 성취도 없었다. '+wd('팬데믹','위기의')+' 시대 대통령에게 이것이 나쁜 성적인지는 애매하다.';col='#2f5f99';}
  else if(sc>=36){eid='judged';ti='심판받은 대통령';ds='사람들은 이 '+YRS+'년을 되도록 이야기하지 않으려 한다.';col='#6e675c';}
  else{eid='failfp';ti=wd('실패한 방역','실패한 위기 대응');ds='막을 수 있었던 '+wd('죽음','피해')+'이 너무 많았다. 그것이 이 임기에 대한 유일한 요약이다.';col='#b3261e';}
  const N=LOG.filter(z=>z.term===CAR.term&&z.eventType!=='임기 결정');
  return Object.assign({term:CAR.term,scenario:termScn(),elect:'',winP:'',kind:kind,eid:eid,ti:ti,ds:ds,col:col,sc:sc,g:g,ins:ins,auth:auth,peakI:Math.round(peakI),deaths:Math.round(deaths),
    decision:'',months:Math.min(YRS*12,Math.round(S.turn*12/PY)),ageStart:CAR.age0+(CAR.term-1)*YRS,ind:stNow(),cDeaths:Math.round(cDeaths),
    parts:scoreParts(),dice:CAR.tt.slice(),troG:CAR.tro.filter(t=>t.term===CAR.term&&t.g).length,troB:CAR.tro.filter(t=>t.term===CAR.term&&!t.g).length},choiceStats(N));}

// 대선: 지지율 35 미만은 출마 불가, 35~65는 1~100% 확률, 65 이상은 확실히 당선
const winPct=a=>a<35?0:a>=65?100:Math.round(1+(a-35)*99/30);
function termEnd(){window.scrollTo(0,0);
  const te=evalTerm('done');CAR.terms.push(te);CAR.tEval=CAR.term;if(!godRun()){MEM.ends[te.eid]=(+MEM.ends[te.eid]||0)+1;msave();}
  if(CP.id==='reich'&&CAR.term===1&&!CAR.ww)return warEnd(te);   // 전쟁기 독일 1기의 끝: 세계대전의 승패(36-dlc-reich-flow.js)
  if(CP.rule==='reign')return reignEnd(te);
  // 개헌(amendPerm)이나 영구집권(dict)이면 임기 한도가 두 배로 늘어난다
  const av=Math.round(cl(S.a)),pct=winPct(av),amended=!!CAR.amendPerm||CAR.amendOK===CAR.term,limit=CP.rule==='single'?!amended:CP.rule==='two'?(CAR.term>=2&&!amended):false;
  const capT=amended||CAR.dict?MAXT*2:MAXT,isLast=CAR.term>=capT||limit,can=!CAR.dict&&pct>0&&!isLast,n=CAR.term+1;
  const risk=av>=35?0:av<15?100:Math.round((35-av)*5);
  // 마지막 승부: 헌법이 막고 있어도 임기 말에 한 번, 개헌을 밀어붙일 수 있다(커리어에 한 번, 지지율 35 이상)
  const lsOK=limit&&!CAR.lastShot&&CAR.amendFail!==CAR.term&&CAR.term<MAXT&&av>=35,lsP=Math.max(.1,Math.min(.8,.15+(av-35)/90+(vVal('P')-40)/160+.05*cnPow('S')));
  te.winP=isLast?'':CAR.dict?100-risk:pct;
  const acol=av>=65?'#2e7d55':av>=35?'#9a6400':'#b3261e';
  const opt=(id,t,sub,col)=>'<button id="'+id+'" style="width:100%;text-align:left;padding:14px 15px;margin-bottom:8px;'+(col?'border-color:'+col+'99;':'')+'"><span style="display:block;font-size:15px;font-weight:600">'+t+'</span><span style="display:block;font-size:12px;color:var(--text-muted);margin-top:3px">'+sub+'</span></button>';
  let msg,btns;
  // 영구집권: 선거 없이 다음 임기로. 지지율이 35 아래면 봉기 위험, 15 아래면 봉기.
  if(CAR.dict){
    if(isLast){msg='<b>'+ageNow()+'세.</b> 종신 집권도 세월은 이기지 못한다. 권좌를 내려놓을 때다.';btns=opt('fin','권좌에서 내려온다','종신 집권을 마친다','#2f5f99');}
    else if(risk>=100){msg='민심이 완전히 등을 돌렸다. <b>광장에 백만 명이 모였고, 군도 흔들린다.</b>';btns=opt('dep','운명을 맞는다','민중 봉기가 일어난다','#b3261e');}
    else{msg='<b>선거는 없다.</b> 비상통치기구가 당신의 집권을 '+n+'기로 연장한다.'+(risk?' 다만 민심이 흔들린다. <b>봉기 가능성 '+risk+'%</b>.':'');
      btns=opt('stay',n+'기 집권을 이어 간다',(risk?'봉기 위험 '+risk+'% · ':'투표 없이 다음 임기로 · ')+'다음 임기에는 새로운 위기가 온다','#b3261e')+
        opt('retire','스스로 권좌에서 내려온다','여기서 커리어를 마친다','#2f5f99');}}
  else if(can){msg=pct>=100?'압도적인 지지. <b>출마하면 반드시 당선된다.</b>':'출마할 수 있다. <b>당선 가능성 '+pct+'%</b> · 떨어지면 그대로 커리어가 끝난다.';
    btns=(amended?opt('run','고친 헌법으로 '+n+'선에 도전한다','당선 가능성 '+pct+'% · '+(CAR.amendHow||'개헌')+'으로 열린 길이다','#b3261e'):
      opt('run','재선에 도전한다','당선 가능성 '+pct+'% · 다음 임기에는 전혀 다른 위기가 온다','#2f4a6b'))+
      opt('retire',amended?'개헌은 했지만 물러난다':'명예롭게 퇴임한다','여기서 커리어를 마친다','#2f5f99');}
  else{msg=limit?(CP.rule==='single'?'<b>'+YRS+'년 단임.</b> 헌법이 연임을 허락하지 않는다. 임기를 마치고 물러난다.':'<b>수정헌법 22조.</b> 세 번째 임기는 없다. 임기를 마치고 물러난다.'):isLast?(amended?'<b>'+ageNow()+'세.</b> 고친 헌법도 세월은 막지 못한다. 더는 출마할 기력이 없다.':'더는 출마할 수 없다. <b>시대가 바뀌었다.</b>'):'지지율이 35에 미치지 못했다. <b>출마조차 할 수 없다.</b> 정권이 교체된다.';
    btns=(lsOK?opt('last','마지막 승부: 임기 말 개헌을 밀어붙인다','성공 가능성 '+Math.round(lsP*100)+'% · 통과하면 출마하지만 권력이 쏠리고 견제·민심이 크게 깎인다 · 실패하면 쫓겨난다 · 커리어에 한 번','#b3261e'):'')+
      opt('fin',limit?'임기를 마치고 퇴임한다':'커리어 결산 보기','지금까지의 인생을 돌아본다');}
  const mk=(v,t,c)=>'<span style="position:absolute;left:calc('+v+'% - 1px);top:-5px;bottom:-5px;width:2px;background:'+c+'"></span>';
  R.innerHTML='<div style="animation:fdIn .4s ease-out">'+
   lab(CAR.term+'기 정부 · 임기 만료 · '+ageNow()+'세')+tip('elect')+
   '<div class="cd sealhit" style="position:relative;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;overflow:hidden">'+
   '<div class="seal" style="--sc:'+GCOL[te.g]+'"><b>'+te.g+'</b><span>임기 평가</span></div>'+
   '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">이번 임기의 평가 · '+te.scenario+'</div>'+
   '<div style="font-size:22px;font-weight:600;color:'+te.col+';line-height:1.3;margin-bottom:8px;padding-right:80px">'+te.ti+'</div>'+
   '<div style="font-size:14px;color:var(--text-secondary);line-height:1.75">'+words(te.ds,200)+'</div></div>'+
   card(lab('임기 말 지지율')+
     '<div style="position:relative;height:16px;border-radius:8px;background:linear-gradient(90deg,rgba(179,38,30,.10) 0 35%,rgba(154,100,0,.12) 35% 65%,rgba(46,125,85,.12) 65% 100%);margin:4px 0 8px"><span style="position:absolute;left:0;top:0;bottom:0;width:'+av+'%;border-radius:8px;background:'+acol+';animation:barG 1.3s cubic-bezier(.2,.8,.2,1) both"></span>'+
     mk(35,'출마','rgba(29,27,24,.55)')+mk(65,'확정','rgba(29,27,24,.55)')+'</div>'+
     '<div style="position:relative;height:14px;font-size:11px;color:var(--text-muted)"><span style="position:absolute;left:0">0</span><span style="position:absolute;left:35%;transform:translateX(-50%);color:var(--text-secondary);font-weight:600">35 출마</span><span style="position:absolute;left:65%;transform:translateX(-50%)">65 당선 확정</span><span style="position:absolute;right:0">100</span></div>'+
     (can&&pct<100?'<div style="margin-top:12px;display:flex;align-items:center;gap:10px"><span style="font-size:12px;color:var(--text-secondary);flex-shrink:0">당선 가능성</span><span style="position:relative;flex:1;height:8px;border-radius:4px;background:rgba(29,27,24,.07);overflow:hidden"><span style="position:absolute;left:0;top:0;bottom:0;width:'+pct+'%;background:#2f4a6b;border-radius:4px;animation:barG 1.1s cubic-bezier(.2,.8,.2,1) both;animation-delay:.3s"></span></span><b style="font-size:15px">'+pct+'%</b></div>':'')+
     '<div style="font-size:14px;margin-top:10px;line-height:1.7">'+msg+'</div>')+
   btns+'</div>';
  SFX.stamp(.78);SFX.grade(te.g,.78);bindTips();termCine(te);
  const b=id=>document.getElementById(id);
  if(b('run'))b('run').onclick=()=>{SFX.click();te.decision=amended?'개헌 후 '+n+'선 도전':'재선 도전';logSpecial(te.decision,amended?25:0,amended?'권력 집중':'중립');election(amended,pct,te);};
  if(b('retire'))b('retire').onclick=()=>{SFX.click();te.decision='퇴임 (출마 가능했음)';CAR.retireElig=true;logSpecial('퇴임 (출마 가능했음)',-10,'견제·분산');careerEnd('retire');};
  if(b('last'))b('last').onclick=()=>{SFX.click();lastShot(te,lsP,n);};
  if(b('stay'))b('stay').onclick=()=>{SFX.click();te.decision='무투표 집권 연장';logSpecial(te.decision,30,'권력 집중');
    if(Math.random()*100>=risk){te.elect=risk?'봉기 진압':'무투표';CAR.elections.push(n+'기 '+te.elect);
      if(!risk)return newTerm();
      S.a=cl(S.a-3);S.chk=cl(S.chk-4);
      return breaking({k:'bad',h:'전국 동시 집회, 계엄군 투입으로 해산',s:'비상통치기구 "질서 회복"… 사상자 집계는 발표되지 않아',b:'광장은 비워졌다. '+n+'기 집권이 시작됐지만, 그날의 사진은 지워지지 않는다.'},()=>newTerm());}
    te.elect='봉기';CAR.elections.push(n+'기 봉기');
    breaking({k:'bad',h:'민중 봉기… 군, 시위대에 발포 거부',s:'비상통치기구 붕괴, 대통령 행방 묘연',b:'총을 든 사람들이 끝내 등을 돌렸다. 영구집권은 '+CAR.term+'기에서 끝났다.'},()=>careerEnd('ousted'));};
  if(b('dep'))b('dep').onclick=()=>{SFX.click();te.decision='민중 봉기';careerEnd('ousted');};
  if(b('fin'))b('fin').onclick=()=>{SFX.click();te.decision=CAR.dict?'종신 집권 끝에 퇴장':limit?'임기 완료 (연임 불가)':isLast?'임기 한도로 퇴장':'출마 불가 (지지율 35 미만)';careerEnd(CAR.dict?'lifelong':limit?'served':isLast?'limit':'lost');};}
function lastShot(te,p,n){CAR.lastShot=1;const ok=Math.random()<p,us=CP.id==='usa';RUN.lastShot=(ok?'성공':'실패')+' ('+Math.round(p*100)+'%)';
  logSpecial('임기 말 개헌 강행 · '+(ok?'통과':'부결'),30,'권력 집중');
  if(!ok){SFX.voteFail();te.decision='임기 말 개헌 강행 → 부결';
    return breaking({k:'bad',h:us?'수정헌법 22조 폐지안 부결… "3선 야욕" 역풍':'임기 말 개헌안 부결… 대통령 퇴진 요구 확산',s:'마지막 승부가 무너졌다. 여당마저 등을 돌렸다.',b:'광장은 "헌법을 지켜라"는 구호로 가득 찼다. 임기는 불명예 속에 끝났다.'},()=>careerEnd('amendfail'));}
  SFX.votePass();spAmend(us?'임기 말 22조 폐지':'임기 말 개헌');te.decision='임기 말 개헌 강행 → 통과';
  S.p=cl(S.p+8);S.chk=cl(S.chk-10);S.u=cl(S.u+10);S.c=cl(S.c+5);S.a=cl(S.a-6);
  CAR.tro.push({id:'lastshot',n:'임기 말 개헌 강행',g:0,term:CAR.term,year:YRS});
  breaking({k:'bad',h:us?'수정헌법 22조 폐지안 가까스로 통과':'임기 말 개헌안 가까스로 통과… 연임의 길 열려',s:'통과는 됐다. 정권의 정당성에는 깊은 상처가 남았다.',b:'야권은 "헌정 질서에 대한 도전"이라며 장외 투쟁을 선언했다. 견제 장치는 눈에 띄게 약해졌다.'},()=>{
    const av=Math.round(cl(S.a)),pct=winPct(av);window.scrollTo(0,0);
    R.innerHTML='<div style="animation:fdIn .35s ease-out">'+lab(CAR.term+'기 정부 · 개헌 직후')+card('<div class="hd" style="font-size:22px;margin-bottom:8px">고친 헌법, 남은 질문</div>'+
      '<div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">개헌은 통과했다. 대가로 권력은 커지고 견제와 민심은 깎였다. 지금 지지율은 <b>'+av+'</b>, '+(pct>0?'당선 가능성은 <b>'+pct+'%</b>다.':'<b>출마선 35에 미치지 못한다.</b>')+'</div>')+
      (pct>0?'<button id="lsRun" class="pri" style="width:100%;padding:15px;font-size:15px;margin-bottom:8px">고친 헌법으로 '+n+'선에 도전한다</button>':'')+
      '<button id="lsOut" style="width:100%;padding:13px;font-size:14px">'+(pct>0?'개헌만 남기고 물러난다':'커리어 결산 보기')+'</button></div>';
    const r=document.getElementById('lsRun');if(r)r.onclick=()=>{SFX.click();te.decision='임기 말 개헌 후 '+n+'선 도전';election(true,pct,te);};
    document.getElementById('lsOut').onclick=()=>{SFX.click();te.decision+=pct>0?' 후 퇴임':' 후 출마 불가';careerEnd(pct>0?'retire':'lost');};});}
// 선거 없는 나라(전쟁기 독일)의 임기 끝 심판. 민심 60 이상이면 민심 탓의 위험은 없고, 30~60은 쿠데타 위험이 비례해서 오르며, 30 미만이면 쿠데타.
// (조선은 v4.1부터 이 심판 대신 국난으로 치세가 갈린다: 36b-joseon-crisis.js)
// 여기에 조정의 불안이 더해진다: 세 번째 치세부터 오래 앉은 임금을 끌어내리려는 움직임(3번째 +10% · 4번째 +20%),
// 당쟁이 45를 넘으면 넘은 만큼 ×0.8, 세도가 35를 넘으면 넘은 만큼 ×0.6. 모두 합쳐 95%까지(민심 30 미만은 100%).
const RG_SAFE=60,RG_DEAD=30;
function rgRisk(n){const av=Math.round(cl(S.a));if(av<RG_DEAD)return {r:100,base:100,old:0,fac:0};
  const base=av>=RG_SAFE?0:Math.round((RG_SAFE-av)*100/(RG_SAFE-RG_DEAD)),old=Math.max(0,n-2)*10,fac=Math.round(Math.max(0,S.u-45)*.8+Math.max(0,S.c-35)*.6);
  return {r:Math.min(95,base+old+fac),base:base,old:old,fac:fac};}
// 선거 없는 나라(조선 · 전쟁기 독일)의 임기 끝 화면 낱말. 조선이 기본이고, 다른 나라는 CP.rgT로 바꿔 쓴다.
const RGT0={termL:n=>n+'번째 치세',lastMsg:'옥좌에 오른 지 {Y}년. <b>이제 세자에게 자리를 물려줄 때다.</b>',heir:'세자에게 선위한다',finSub:'치세를 마친다',heirSub:'스스로 물러나 상왕이 된다',
 dead:'민심이 완전히 떠났다. <b>반정의 칼날이 대궐 문 앞에 와 있다.</b>',deadBtn:'운명을 맞는다',deadSub:'반정이 일어난다',shaky:'민심이 흔들린다',shaky2:'민심은 버티지만 조정이 술렁인다',
 cont:'치세를 이어 가면',risk:'반정이 일어날 가능성',riskS:'반정 위험',why:['민심','오래된 치세','당쟁 · 세도'],calm:'선거도 민심의 심판도 없다. <b>치세를 이어 갈 수 있다.</b> 다만 쌓인 조짐이 다 차면 국난이 닥친다.',run:n=>n+'번째 치세를 이어 간다',
 runSub:'다음 치세에는 새로운 시련이 온다',evalN:'치세 평가',evalT:'이번 치세의 평가',endA:'치세 끝의 민심',deadMark:'반정',dRun:'치세를 이어 감',dRetire:'선위 (이어 갈 수 있었음)',dDead:'반정',dFin:'치세 완료',
 plotLab:n=>'반정 모의 · '+n+'번째 치세의 문턱',plotH:'궐 밖이 술렁인다',plotD:'반정을 꾀하는 무리가 있다는 밀고가 들어왔다. 군사와 대신들은 누구 편에 설 것인가.',plotBar:'임금 편에 선 군사',
 won:'반정 모의를 진압했다',lost:'반정이 일어났다',wonS:'진압',lostS:'폐위',ok:'반정 진압',fail:'반정',stab:n=>n+'번째 치세 안정',elT:n=>n+'번째 치세 ',start:n=>n+'번째 치세 시작',kind:'deposed'};
const rgt=k=>CP.rgT&&CP.rgT[k]!=null?CP.rgT[k]:RGT0[k];
// 조선은 치세 끝에 민심의 심판(반정 위험)이 없다. 치세는 국난에서 왕권을 지키는 동안 이어지고, 이 화면에는 국난의 조짐을 보여 준다
function reignEnd(te){const av=Math.round(cl(S.a)),isLast=CAR.term>=MAXT,n=CAR.term+1,jo=CP.id==='joseon',RK=jo?{r:0,base:0,old:0,fac:0}:rgRisk(n),risk=isLast?0:RK.r;
  te.winP=isLast||jo?'':100-risk;
  const acol=av>=RG_SAFE?'#2e7d55':av>=RG_DEAD?'#9a6400':'#b3261e';
  const opt=(id,t,sub,col)=>'<button id="'+id+'" style="width:100%;text-align:left;padding:14px 15px;margin-bottom:8px;'+(col?'border-color:'+col+'99;':'')+'"><span style="display:block;font-size:15px;font-weight:600">'+t+'</span><span style="display:block;font-size:12px;color:var(--text-muted);margin-top:3px">'+sub+'</span></button>';
  let msg,btns;const W=rgt('why');
  if(isLast){msg=rgt('lastMsg').replace('{Y}',CAR.term*YRS);btns=opt('fin',rgt('heir'),rgt('finSub'),'#2f5f99');}
  else if(risk>=100){msg=rgt('dead');btns=opt('dep',rgt('deadBtn'),rgt('deadSub'),'#b3261e');}
  else{const why=[RK.base?W[0]+' '+RK.base+'%':'',RK.old?W[1]+' '+RK.old+'%':'',RK.fac?W[2]+' '+RK.fac+'%':''].filter(Boolean).join(' · ');
    msg=risk?(RK.base?rgt('shaky'):rgt('shaky2'))+'. '+rgt('cont')+' <b>'+rgt('risk')+' '+risk+'%</b>.'+(why?'<br><span style="font-size:12.5px;color:var(--text-muted)">'+why+'</span>':''):rgt('calm');
    btns=opt('run',rgt('run')(n),risk?rgt('riskS')+' '+risk+'% · '+rgt('runSub'):rgt('runSub'),'#2f4a6b')+opt('retire',rgt('heir'),rgt('heirSub'),'#2f5f99');}
  R.innerHTML='<div style="animation:fdIn .4s ease-out">'+lab(rgt('termL')(CAR.term)+' · '+YRS+'년의 끝 · '+ageNow()+'세')+
   '<div class="cd sealhit" style="position:relative;background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:12px;overflow:hidden">'+
   '<div class="seal" style="--sc:'+GCOL[te.g]+'"><b>'+te.g+'</b><span>'+rgt('evalN')+'</span></div>'+
   '<div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">'+rgt('evalT')+' · '+te.scenario+'</div>'+
   '<div style="font-size:22px;font-weight:600;color:'+te.col+';line-height:1.3;margin-bottom:8px;padding-right:80px">'+te.ti+'</div>'+
   '<div style="font-size:14px;color:var(--text-secondary);line-height:1.75">'+words(te.ds,200)+'</div></div>'+
   (jo?kgOmen():card(lab(rgt('endA'))+'<div style="position:relative;height:16px;border-radius:8px;background:linear-gradient(90deg,rgba(179,38,30,.14) 0 '+RG_DEAD+'%,rgba(179,38,30,.08) '+RG_DEAD+'% '+RG_SAFE+'%,rgba(46,125,85,.10) '+RG_SAFE+'% 100%);margin:4px 0 8px"><span style="position:absolute;left:0;top:0;bottom:0;width:'+av+'%;border-radius:8px;background:'+acol+';animation:barG 1.3s cubic-bezier(.2,.8,.2,1) both"></span></div>'+
     '<div style="position:relative;height:14px;font-size:11px;color:var(--text-muted)"><span style="position:absolute;left:'+RG_DEAD+'%;transform:translateX(-50%)">'+RG_DEAD+' '+rgt('deadMark')+'</span><span style="position:absolute;left:'+RG_SAFE+'%;transform:translateX(-50%);color:var(--text-secondary);font-weight:600">'+RG_SAFE+' 안전</span><span style="position:absolute;right:0">100</span></div>'+
     '<div style="font-size:14px;margin-top:10px;line-height:1.7">'+msg+'</div>'))+(jo?card('<div style="font-size:14px;line-height:1.7">'+msg+'</div>'):'')+btns+'</div>';
  SFX.stamp(.78);SFX.grade(te.g,.78);termCine(te);
  // 두 번 눌러 임기가 두 번 넘어가지 않게 한 번만 받는다
  const b=id=>document.getElementById(id);let gone=0;const one=f=>()=>{if(gone++)return;f();};
  if(b('run'))b('run').onclick=one(()=>{SFX.click();te.decision=rgt('dRun');logSpecial(rgt('dRun'),0,'중립');if(!risk){te.elect='유지';CAR.elections.push(rgt('stab')(n));return newTerm();}election(false,100-risk,te);});
  if(b('retire'))b('retire').onclick=one(()=>{SFX.click();te.decision=rgt('dRetire');CAR.retireElig=true;logSpecial(rgt('dRetire'),-10,'견제·분산');careerEnd('retire');});
  if(b('dep'))b('dep').onclick=one(()=>{SFX.click();te.decision=rgt('dDead');careerEnd(rgt('kind'));});
  if(b('fin'))b('fin').onclick=one(()=>{SFX.click();te.decision=rgt('dFin');careerEnd('served');});}

// 대통령 선거(조선 반정 제외)는 당선이 확정이 아니면 개표 전에 TV 토론이 열린다. 토론 결과로 당선 가능성이 오르내린다.
const DB_D=[14,6,-4,-10];
function debateGate(amend,pct,te){window.scrollTo(0,0);const n=CAR.term+1;
  R.innerHTML='<div style="animation:fdIn .35s ease-out">'+lab((amend?n+'선 대선':n+'번째 대통령 선거')+' · 투표 사흘 전')+
   card('<div class="hd" style="font-size:22px;margin-bottom:8px">대선 TV 토론</div><div style="font-size:14px;line-height:1.75;color:var(--text-secondary)">투표 사흘 전, 생중계 TV 토론이 잡혔다. 도전자가 이번 임기의 약점을 파고든다. 잘 받아치면 판이 뒤집히고, 무너지면 앞서던 표도 흔들린다. 지금 당선 가능성은 <b>'+pct+'%</b>다.</div>'+
     '<div style="font-size:12.5px;color:var(--text-muted);margin-top:8px">압승 +'+DB_D[0]+'%p · 우세 +'+DB_D[1]+'%p · 열세 '+DB_D[2]+'%p · 완패 '+DB_D[3]+'%p</div>')+
   '<button id="dbIn" class="pri" style="width:100%;padding:15px;font-size:15px;margin-bottom:8px">토론에 나간다</button>'+
   '<button id="dbNo" style="width:100%;padding:13px;font-size:14px">토론을 거부한다 <span style="font-size:12px;color:var(--text-muted)">· "토론 회피" 비판으로 당선 가능성 −3%p</span></button></div>';
  const go=(p2,why)=>{te.debate=why;RUN.debate=why;election(amend,p2,te,1);};
  document.getElementById('dbNo').onclick=()=>{SFX.click();te.dbD=-3;go(Math.max(1,pct-3),'거부');};
  document.getElementById('dbIn').onclick=()=>{SFX.click();window.scrollTo(0,0);R.innerHTML='<div style="animation:fdIn .35s ease-out">'+lab('대선 TV 토론 · 생중계')+'<div id="dbBox"></div></div>';
    debateRun(document.getElementById('dbBox'),{pct:pct,amend:amend},(t,v)=>{te.dbD=DB_D[t];go(Math.max(1,Math.min(99,pct+DB_D[t])),['압승','우세','열세','완패'][t]+' '+v+'%');});};}
function election(amend,pct,te,deb){
  if(!deb&&CP.rule!=='reign'&&pct>0&&pct<100)return debateGate(amend,pct,te);
  window.scrollTo(0,0);
  const n=CAR.term+1,win=Math.random()*100<pct,jit=Math.random()*4-2;
  const share=win?Math.max(50.4,Math.min(79,50.5+(S.a-50)*.55+jit)):Math.min(49.6,Math.max(28,48+(S.a-50)*.45+jit));
  const RG=CP.rule==='reign';te.elect=RG?(win?rgt('ok'):rgt('fail')):win?'당선':'낙선';te.winP=pct;CAR.elections.push((RG?rgt('elT')(n):n+'기 ')+pct+'% '+te.elect);
  R.innerHTML='<div style="animation:fdIn .35s ease-out;padding-top:10px">'+
   lab(RG?rgt('plotLab')(n):amend?n+'선 대선 · 고친 헌법 아래':(n)+'번째 대통령 선거')+
   '<div id="vt" style="font-size:24px;font-weight:600;margin-bottom:6px">'+(RG?rgt('plotH'):'개표 중')+'</div>'+
   '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:18px">'+(RG?rgt('plotD'):amend?'헌법이 바뀌었다. 이제 남은 것은 표다.':'국민이 다시 묻는다. 한 번 더 맡길 것인가.')+' <span style="color:var(--text-muted)">· '+(RG?'진압 가능성 ':'당선 가능성 ')+pct+'%'+(te.dbD!=null&&!RG?' (TV 토론 '+(te.dbD>=0?'+':'')+te.dbD+'%p)':'')+'</span></div>'+
   card('<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px"><span>'+(RG?rgt('plotBar'):'득표율')+'</span><span id="vp">0%</span></div>'+
     '<div style="position:relative;height:20px;border-radius:10px;background:rgba(29,27,24,.07);overflow:hidden"><span id="vb" style="position:absolute;left:0;top:0;bottom:0;width:0;background:#2f4a6b;border-radius:10px;transition:width 1.6s cubic-bezier(.2,.8,.2,1)"></span>'+
     '<span style="position:absolute;left:calc(50% - 1px);top:0;bottom:0;width:2px;background:#fff;opacity:.8"></span></div>')+
   '<div id="won" style="text-align:center;margin:22px 0;min-height:70px"></div>'+
   '<button id="go2" class="pri" style="width:100%;padding:15px;font-size:15px;opacity:0;pointer-events:none">'+(win?(RG?rgt('start')(n):n+'기 정부 출범'):'커리어 결산 보기')+'</button></div>';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{const vb=document.getElementById('vb');if(vb)vb.style.width=share+'%';}));
  const t0=performance.now();(function f(){const k=Math.min(1,(performance.now()-t0)/1600),el=document.getElementById('vp');if(!el)return;el.textContent=(share*(1-Math.pow(1-k,3))).toFixed(1)+'%';if(k<1)requestAnimationFrame(f);})();
  SFX.roll(1.7);
  setTimeout(()=>{const w=document.getElementById('won');if(!w)return;document.getElementById('vt').textContent=RG?(win?rgt('won'):rgt('lost')):'개표 완료';
    if(win){SFX.stamp(.3);SFX.win(.3);w.innerHTML='<div style="display:inline-block;font-size:40px;font-weight:800;color:#2e7d55;letter-spacing:6px;border:3px solid #2e7d55;border-radius:10px;padding:4px 18px;animation:stamp .6s cubic-bezier(.2,1.4,.4,1) both">'+(RG?rgt('wonS'):'당선')+'</div>';}
    else{SFX.stamp(.3);SFX.lose(.3);vib([90,60,120]);w.innerHTML='<div style="display:inline-block;font-size:40px;font-weight:800;color:#b3261e;letter-spacing:6px;border:3px solid #b3261e;border-radius:10px;padding:4px 18px;animation:stamp .6s cubic-bezier(.2,1.4,.4,1) both">'+(RG?rgt('lostS'):'낙선')+'</div><div style="font-size:13px;color:var(--text-secondary);margin-top:12px">'+pct+'%의 가능성은 이번에 오지 않았다.</div>';}
    const g=document.getElementById('go2');g.style.opacity=1;g.style.pointerEvents='auto';g.style.transition='opacity .3s';
    g.onclick=()=>{if(win){SFX.start();newTerm();}else{SFX.click();careerEnd(RG?rgt('kind'):'defeated');}};},1800);}

