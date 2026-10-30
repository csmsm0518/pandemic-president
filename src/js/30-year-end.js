/* ---------- 연간 결산 ---------- */
function report(){dcSeed('report');SFX.report();window.scrollTo(0,0);
  const y=S.turn/PY,fin=S.turn>=YRS*PY,sc=score();let tr='';
  if(prev!==null){const d=sc-prev;tr=d>3?'전체적으로 작년보다 나아지고 있습니다.':d<-3?'솔직히 말씀드리면, <em>작년보다 나빠지고 있습니다</em>.':'작년과 크게 다르지 않습니다.';}
  prev=sc;
  const earned=TRO.filter(t=>{try{return t.c();}catch(e){return false;}}).sort((a,b)=>b.g-a.g).filter((t,j,arr)=>t.g?arr.filter(z=>z.g).indexOf(t)<2:true);
  earned.forEach(t=>CAR.tro.push({id:t.id,n:t.n,g:t.g,term:CAR.term,year:y}));
  CAR.cs.push(S.c);CAR.ts.push(S.trn);CAR.us.push(S.u);CAR.ss.push(S.saf);
  const X=SCX(),hs=hudStats();
  const tro=earned.length?earned.map((t,j)=>chip((t.g?'업적 · ':'불명예 · ')+t.n,t.g?'#2e7d55':'#b3261e','animation:reelIn .4s cubic-bezier(.2,1.4,.4,1) both;animation-delay:'+(300+j*120)+'ms;font-weight:600;color:'+(t.g?'#2a6e4b':'#a8321f'))).join(''):'<span style="font-size:12px;color:var(--text-muted)">올해는 특별한 기록이 없다.</span>';
  const P=YS,vr=k=>({n:vName(k),v:vVal(k,S),pv:vVal(k,P),bad:V6[k].pol<0,neu:V6[k].pol===0,c:V6[k].col}),rows=['A','E','H','M'].map(vr);
  const pw=['P','X'].map(vr);
  const cr=chron.map(c=>chip(c.n,TIER[c.t].bd)).join('');
  const worst=[['i',100-S.i],['m',S.m],['a',S.a],['e',S.e],['u',100-S.u],['c',100-S.c]].sort((a,b)=>a[1]-b[1])[0][0];
  const say=RPX(worst)[bd(S[worst])];
  // 세로 화면: 지표는 3×2 타일, 흐름 그래프는 같은 카드에 낮게, 다음 버튼은 아래 고정(pfit)
  const PO=isP(),chart=lineChart([{pts:TH.map(h=>h.h!=null?h.h:100-h.i),col:V6.H.col,w:1.6},{pts:TH.map(h=>h.a),col:'#2e7d55',w:2.4}],YRS*PY),
    legend='<div style="display:flex;gap:14px;font-size:11px;color:var(--text-muted);margin-top:8px;flex-wrap:wrap"><span><b style="color:#2e7d55">━</b> '+KN.a+'</span><span><b style="color:'+V6.H.col+'">━</b> '+X.ctrl+'</span><span>'+(CP.rule==='reign'?'┄ '+rgt('deadMark')+' 위험선 35 · 안정 65':'┄ 출마선 35 · 당선 확정 65')+'</span></div>';
  R.innerHTML='<div class="'+(PO?'pfit rp':'')+'" style="position:relative;animation:fdIn .35s ease-out">'+(PO?'<div class="p-sc">':'')+
   '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px"><span style="font-size:12px;font-weight:600;color:var(--text-muted)">'+(CP.id==='joseon'?CAR.term+'번째 치세':CAR.term+'기')+' '+y+'년차 연말 · '+ageNow()+'세</span><span style="font-size:11px;color:var(--text-muted)">'+MOD.n+'</span></div>'+
   '<div class="hd rp-h" style="font-size:24px;margin-bottom:8px">'+(fin?'임기 마지막 결산':'연간 총결산')+'</div>'+
   '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"><span style="font-size:11px;padding:4px 9px;border-radius:999px;background:rgba(179,38,30,.14);color:#a8321f;font-weight:600">'+(isCov()?(y>=3?'신종 변이':'코로나19'):X.n)+'</span>'+
   hs.map(q=>'<span style="font-size:11px;padding:4px 9px;border-radius:999px;background:var(--surface-1);color:var(--text-secondary)">'+q[0]+' <b style="color:var(--text-primary)">'+fmtStat(q)+'</b></span>').join('')+'</div>'+
   tip('report')+card(lab('올해의 기록')+tro)+
   (PO?card(lab('국정 지표 · 작년 대비')+tiles(rows.concat(pw))+'<div class="rp-ch">'+chart.replace('<svg ','<svg preserveAspectRatio="none" ')+'</div>'+legend):
   card(lab('국정 지표 · 흰 눈금은 작년')+bars(rows)+'<div style="height:1px;background:var(--border);margin:6px 0 12px"></div>'+bars(pw)+
     '<div style="font-size:11px;color:var(--text-muted);line-height:1.6;margin-top:4px">'+vName('P')+'이 크면 일이 빨라지지만 견제가 사라지고 '+vName('X')+'도 함께 자란다.</div>')+
   card(lab('임기 흐름')+chart+legend))+
   '<div style="display:flex;gap:10px;align-items:flex-start;margin:4px 4px 14px">'+(cnHired()[0]?portrait(cnHired()[0].n,30):'')+
   '<div style="font-size:13px;line-height:1.7;color:var(--text-secondary)">'+(cnHired()[0]?'<b style="color:var(--text-primary)">'+cnHired()[0].n+'</b> ':'')+'<span style="font-family:var(--font-voice)">"'+say+(tr?' '+tr:'')+'"</span></div></div>'+
   lab('그해의 결정들')+'<div style="margin-bottom:18px">'+cr+'</div>'+(PO?'</div><div class="p-bt">':'')+
   '<button id="nx" class="pri" style="width:100%;padding:15px;font-size:15px">'+(fin?'임기 만료':(y+1)+'년차로')+'</button></div>'+(PO?'</div>':'');
  CAR.yrs.push(yearSnap(y,earned,1));bindTips();pMore();
  const ny=y+1,varN=!fin&&CP.id==='kr'&&CAR.term===1&&ny===3&&CAR.endemic!==CAR.term;
  chron=[];yd=0;yTally=[0,0,0,0];YS=Object.assign({},S);
  // 해가 바뀔 때는 금장 셔터로 넘어간다
  document.getElementById('nx').onclick=()=>{SFX.click();const tl=CP.id==='joseon'?CAR.term+'번째 치세':CAR.term+'기';
    if(fin)return yearFx(tl+' 임기 만료','이 임기의 성적표가 나왔다',termEnd);
    yearFx(tl+' '+ny+'년차',leaderQ(careerYear(ny))||'새해가 밝았다',()=>council(()=>spBoard(()=>{if(varN)variantHit();else{if(CAR.term>=2)waveHit();next();}pickAdv();ev();})));};}

