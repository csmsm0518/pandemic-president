// 예전 명예의 전당(leaderboard.html을 화면 가득 띄우던 방식). 지금은 쓰지 않지만 postMessage 처리를 위해 남겨 둔다.
let LBE=null;
function openBoardEmbed(o){o=o||{};if(IN_ART)return artBoard(o);lbeClose();window.scrollTo(0,0);
  const q='embed=1&diff='+encodeURIComponent(o.diff||(DIFF[dif]&&DIFF[dif].n)||'보통')+(o.id?'&id='+encodeURIComponent(o.id)+'&me='+encodeURIComponent(o.nick||''):'');
  const w=document.createElement('div');w.className='lbe';w.setAttribute('role','dialog');w.setAttribute('aria-label','명예의 전당');
  w.innerHTML='<iframe src="leaderboard.html?'+q+'" title="명예의 전당"></iframe>';document.body.appendChild(w);document.body.style.overflow='hidden';
  LBE={el:w,back:o.back||home};const fr=w.querySelector('iframe');fr.onload=()=>{try{fr.contentWindow.focus();}catch(e){}};}
function lbeClose(){if(!LBE)return;LBE.el.remove();document.body.style.overflow='';LBE=null;}
addEventListener('message',e=>{if(!LBE||!e.data||!e.data.lb)return;const fr=LBE.el.querySelector('iframe');if(!fr||e.source!==fr.contentWindow)return;
  const back=LBE.back;SFX.back();lbeClose();
  if(e.data.lb==='play'){home();if(!viewGet().lite)setTimeout(()=>{try{stepCamp();}catch(x){}},0);}else back();});function lbClose(){LB.open=false;clearTimeout(LB.timer);const o=document.getElementById('lbFs');if(o)o.remove();document.body.style.overflow='';}
function lbSchedule(){clearTimeout(LB.timer);if(!LB.open)return;
  // 내 기록이 아직 시트에 안 들어왔으면 5초마다, 그 뒤로는 15초마다
  const waiting=LB.id&&LB.data&&LB.data.order&&LB.data.order.indexOf(LB.id)<0;
  LB.timer=setTimeout(()=>{if(!document.hidden)lbLoad();else lbSchedule();},waiting?5000:15000);}
function lbLoad(){if(LB.busy||!LB.open)return;LB.busy=true;
  lbFetch().then(d=>{if(!d||!Array.isArray(d.top))throw new Error('형식이 다른 응답');
    LB.err='';const sig=JSON.stringify(Object.assign({},d,{updated:0}));LB.data=d;
    if(!LB.open)return;
    if(sig!==LB.sig){const ids=new Set((d.recent||[]).map(r=>r.id));LB.fresh=new Set();if(LB.seen)ids.forEach(id=>{if(!LB.seen.has(id))LB.fresh.add(id);});
      const first=!LB.seen;LB.seen=ids;LB.sig=sig;lbRender(first);}
    lbLive();
  }).catch(e=>{LB.err=(e&&e.message)||String(e);if(LB.open){lbLive();if(!LB.data)lbBody('<div class="card-lb" style="text-align:center;padding:28px 12px;color:var(--text-secondary);font-size:14px;line-height:1.8">기록을 불러오지 못했어요.<div style="font-size:12px;color:var(--text-muted);margin-top:6px">인터넷 연결과 Apps Script 배포(새 버전, 모든 사용자)를 확인해 주세요.<br>('+lbEsc(LB.err)+')</div><button id="lbRetry" style="margin-top:14px">다시 시도</button></div>');
      const r=document.getElementById('lbRetry');if(r)r.onclick=()=>{SFX.click();lbBody('<div class="lb-skel"></div><div class="lb-skel"></div>');lbLoad();};}})
  .finally(()=>{LB.busy=false;lbSchedule();});}

// 명예의 전당 머리: 월계관에 둘러싸인 트로피(가운데) — 잎은 반원 위에 비스듬히 놓는다
// 잎은 원 둘레(왼쪽은 아래 100°→위 230°)를 따라 놓고, 둘레 방향(+90°)으로 눕힌다. 오른쪽은 좌우 대칭.
const LBX_LAUREL=(()=>{let l='';for(let i=0;i<8;i++){const a=100+i*18.5,t=a*Math.PI/180,x=60+38*Math.cos(t),y=50+38*Math.sin(t),r=a+90-14;
    [[x,r],[120-x,180-r]].forEach(([px,rr])=>{l+='<ellipse cx="'+px.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="7.5" ry="3.2" transform="rotate('+rr.toFixed(1)+' '+px.toFixed(1)+' '+y.toFixed(1)+')"/>';});}
  return '<svg class="lbx-em" viewBox="0 0 120 100" aria-hidden="true"><defs><linearGradient id="lbxg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".5" stop-color="#e3b94f"/><stop offset="1" stop-color="#8a6a24"/></linearGradient></defs>'+
    '<g fill="url(#lbxg)">'+l+'</g><path d="M44 30h32v10c0 12-7 20-16 20s-16-8-16-20z" fill="url(#lbxg)" stroke="#5d4515"/><path d="M44 34h-7c0 9 4 14 9 15M76 34h7c0 9-4 14-9 15" fill="none" stroke="url(#lbxg)" stroke-width="3"/>'+
    '<path d="M56 60h8v8h-8zM48 68h24v6H48z" fill="url(#lbxg)" stroke="#5d4515" stroke-width=".8"/><path d="M60 36l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" fill="#15120e"/></svg>';})();
const LBX_CROWN='<svg class="lbx-crown" viewBox="0 0 40 24" aria-hidden="true"><path d="M3 21L1 5l10 8 9-12 9 12 10-8-2 16z" fill="#f1d589" stroke="#7a5a1c" stroke-width="1.4" stroke-linejoin="round"/><circle cx="20" cy="15" r="2.4" fill="#b3261e"/></svg>';
// 명예의 전당은 타이틀 화면처럼 화면 전체를 쓰는 어두운 무대에 띄운다(감염 배경 + 큰 금장 문장).
// 넓은 화면은 왼쪽에 제목·내 순위·통계, 오른쪽에 탭·시상대·순위. 좁으면 위아래로 쌓고 통째로 스크롤한다.
function lbFrame(){let o=document.getElementById('lbFs');if(o)o.remove();
  o=document.createElement('div');o.id='lbFs';o.className='lbfs';o.setAttribute('role','dialog');o.setAttribute('aria-label','명예의 전당');
  o.innerHTML='<canvas class="gx-bg" aria-hidden="true"></canvas><div class="gx-seal" aria-hidden="true">'+emblemSvg('embgL')+'</div><div id="lbRoot" class="lbx">'+
  '<div class="lbx-top"><button id="lbBack">← 돌아가기</button><a id="lbAll" href="leaderboard.html?diff='+encodeURIComponent(LB.diff)+'" target="_blank" rel="noopener">전체 순위 ↗</a></div><div class="lbfs-grid"><div class="lbfs-l">'+
  '<div class="lbx-hero"><div class="lbx-rays" aria-hidden="true"></div>'+LBX_LAUREL+'<div class="lbx-k">HALL OF FAME</div><h1 class="lbx-t">명예의 전당</h1>'+
  '<div id="lbLive" class="lbx-live"><span class="lb-dot"></span><span>불러오는 중</span></div></div>'+
  '<div id="lbMe"></div><div id="lbTiles" class="lb-tiles"></div></div><div class="lbfs-r">'+
  '<div class="lb-tabs" id="lbTabs">'+[['top','커리어 점수'],['longest','최장 집권'],['recent','최근 기록'],['stats','권력 통계']].map(t=>'<button data-t="'+t[0]+'" aria-selected="'+(LB.tab===t[0])+'">'+t[1]+'</button>').join('')+'</div>'+
  '<div class="lb-dif" id="lbDif" role="group" aria-label="난이도">'+LB_DIFS.map(k=>'<button data-d="'+k+'" style="--dc:'+LB_DCOL[k]+'" aria-pressed="'+(LB.diff===k)+'"><i></i>'+k+'</button>').join('')+'</div>'+
  '<div id="lbBody"><div class="lb-skel"></div><div class="lb-skel"></div><div class="lb-skel"></div></div></div></div></div>';
  document.body.appendChild(o);document.body.style.overflow='hidden';gxLattice(o.querySelector('.gx-bg'));
  document.getElementById('lbBack').onclick=()=>{SFX.back();lbClose();(LB.back||home)();};
  document.getElementById('lbTabs').onclick=e=>{const b=e.target.closest('button[data-t]');if(!b)return;SFX.click();LB.tab=b.dataset.t;
    document.querySelectorAll('#lbTabs button').forEach(x=>x.setAttribute('aria-selected',x===b?'true':'false'));if(LB.data)lbRender(true,true);};
  const bd=document.getElementById('lbBody');bd.addEventListener('click',e=>{const p=e.target.closest('[data-open]');if(!p)return;SFX.click();LB.open=LB.open===p.dataset.open?null:p.dataset.open;if(LB.data)lbRender(false,true);});
  bd.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-open]')){e.preventDefault();e.target.click();}});
  document.getElementById('lbDif').onclick=e=>{const b=e.target.closest('button[data-d]');if(!b||b.dataset.d===LB.diff)return;SFX.click();LB.diff=b.dataset.d;
    document.querySelectorAll('#lbDif button').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));
    document.getElementById('lbAll').href='leaderboard.html?diff='+encodeURIComponent(LB.diff);if(LB.data)lbRender(true);};}
function lbBody(h){const b=document.getElementById('lbBody');if(b)b.innerHTML=h;}
function lbLive(){const el=document.getElementById('lbLive');if(!el)return;
  if(LB.err&&!LB.data)el.innerHTML='<span class="lb-dot off"></span><span>연결이 안 돼요</span>';
  else if(LB.err)el.innerHTML='<span class="lb-dot off"></span><span>연결이 끊겼어요 · 다시 시도하는 중</span>';
  else{const u=LB.data&&LB.data.updated?new Date(LB.data.updated):new Date();
    el.innerHTML='<span class="lb-dot"></span><span>LIVE · '+u.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})+'</span>';}}
function lbRender(anim,onlyBody){const d=lbView(),root=document.getElementById('lbRoot');if(!d||!root)return;
  root.classList.toggle('lb-still',!anim);
  if(!onlyBody){
    const me=document.getElementById('lbMe');
    if(LB.id){const rk=d.order.indexOf(LB.id)+1;
      me.innerHTML=rk?'<div class="lb-banner"><span>'+lbEsc(LB.nick||'내')+' 대통령의 이번 커리어는 </span><b style="font-size:20px">'+rk+'위</b><span style="color:var(--text-secondary)"> / '+(LB.diff==='전체'?'전체':LB.diff+' 난이도')+' '+d.order.length+'개</span></div>'
        :'<div class="lb-banner">방금 끝낸 커리어를 시트에 반영하는 중이에요. <span style="color:var(--text-secondary)">잠시 뒤 자동으로 순위가 나타나요.</span></div>';}
    else me.innerHTML='';
    const s=d.stats||{},t=(k,v)=>'<div class="lb-tile"><div class="k">'+k+'</div><div class="v">'+v+'</div></div>';
    document.getElementById('lbTiles').innerHTML=t('지나간 인생',d.careers||0)+t('참가자',d.players||0)+t('평균 임기',(s.avgTerms||0)+'선')+t('2선 이상',(s.reelectRate||0)+'%')+t('개헌한 비율',(s.amendRate||0)+'%')+t('스스로 퇴임',(s.retireRate||0)+'%');}
  if(LB.tab==='stats')return lbBody(lbStats());
  const list=(d[LB.tab]||[]).slice(0,LB_N);
  if(!list.length)return lbBody('<div class="card-lb" style="text-align:center;padding:30px 10px;color:var(--text-secondary);font-size:14px;line-height:1.8">'+(LB.diff==='전체'?'아직 기록이 없어요.':'아직 '+lbEsc(LB.diff)+' 난이도 기록이 없어요.')+'<br>첫 번째 대통령이 되어 보세요.</div>');
  const oi=LB.tab==='top'?list.slice(0,3).findIndex(r=>r.id===LB.open):-1;
  if(LB.tab==='top')return lbBody(lbPodium(list)+(oi>=0?lbDet(list[oi],oi+1):'<div class="lbd-hint">시상대의 1~3위를 누르면 세부 수치를 볼 수 있어요</div>')+(list.length>3?'<div class="card-lb" style="padding:2px 10px">'+list.slice(3).map((r,i)=>lbRow(r,i+3,'top')).join('')+'</div>':'')+
    (LB.data&&!LB.data.script?'<div class="lb-note"><b style="color:#a8321f">2026.10.27</b></div>':''));
  lbBody('<div class="card-lb" style="padding:2px 10px">'+list.map((r,i)=>lbRow(r,i,LB.tab)).join('')+'</div>');}
function lbGrades(s){return String(s||'').split('/').filter(Boolean).map(g=>'<span class="lb-g" style="color:'+(GCOL[g]||'#6e675c')+'">'+lbEsc(g)+'</span>').join('');}
function lbRow(r,i,mode){const d=lbView(),mine=r.id===LB.id,fr=LB.fresh.has(r.id);
  const right=mode==='longest'?'<div class="b">'+r.years+'<span style="font-size:11px">년</span></div><div class="s">'+r.score+'점</div>':
    mode==='recent'?'<div class="b">'+r.score+'</div><div class="s">'+lbEsc(lbAgo(r.t))+'</div>':'<div class="b">'+r.score+'</div><div class="s">'+r.terms+'선</div>';
  const rk=mode==='recent'?'<span style="font-size:10px;color:var(--text-muted)">'+((d.order.indexOf(r.id)+1)||'–')+'위</span>':i+1;
  return '<div class="lb-row'+(mine?' mine':'')+(fr?' fresh':'')+(mode!=='recent'&&i<3?' m'+(i+1):'')+'" style="animation-delay:'+Math.min(i,12)*30+'ms"><div class="rk">'+rk+'</div><div class="who"><div class="nm">'+lbEsc(r.nick)+(fr?' <span class="lb-new">NEW</span>':'')+(mine?' <span class="lb-new" style="background:#2f4a6b;color:#fff">나</span>':'')+'</div>'+
    '<div class="mt">'+lbEsc(r.bg)+' · '+r.terms+'선 '+r.years+'년 · <span style="color:'+lbCol(r.leader)+'">'+lbEsc(r.leader)+'</span>'+lbDiffTag(r.diff)+'</div>'+
    '<div class="ex">'+lbGrades(r.grades)+'<span>'+lbEsc(r.exit)+'</span>'+(r.amend?'<span style="color:var(--text-danger)">· 개헌 '+r.amend+'회</span>':'')+'</div></div><div class="val">'+right+'</div></div>';}
// 시상대: 어두운 무대 위 금·은·동 받침대. 1위는 가운데 가장 높이, 왕관을 쓴다. 얼굴은 그 커리어와 닮은 지도자.
function lbPodium(list){const m=[list[1],list[0],list[2]],rk=[2,1,3],cls=['s','g','b'];
  const sp=[[8,24,0],[22,62,.8],[50,12,1.6],[78,58,.4],[91,20,1.2],[66,30,2]].map(p=>'<i class="lbx-spk" style="left:'+p[0]+'%;top:'+p[1]+'%;animation-delay:'+p[2]+'s"></i>').join('');
  return '<div class="lbx-stage">'+sp+'<div class="lbx-pods">'+m.map((r,j)=>r?'<div class="lbx-pod '+cls[j]+(LB.fresh.has(r.id)?' fresh':'')+(r.id===LB.id?' mine':'')+'" style="animation-delay:'+[.25,.05,.4][j]+'s" data-open="'+lbEsc(r.id)+'" role="button" tabindex="0" aria-expanded="'+(LB.open===r.id)+'">'+
    '<div class="lbx-av">'+(j===1?LBX_CROWN:'')+(portrait(r.leader,'100%')||'<span>'+rk[j]+'</span>')+'</div><div class="nm">'+lbEsc(r.nick)+'</div><div class="sc">'+Number(r.score).toLocaleString('ko-KR')+'</div>'+
    '<div class="ld">'+r.terms+'선 · '+lbEsc(r.leader)+(LB.diff==='전체'?lbDiffTag(r.diff):'')+'</div><div class="lbx-ped"><b>'+rk[j]+'</b></div></div>':'<div></div>').join('')+'</div></div>';}
function lbBars(obj,colf){const a=Object.entries(obj||{}).sort((x,y)=>y[1]-x[1]);if(!a.length)return '<div class="lb-note">아직 데이터가 없어요.</div>';const mx=a[0][1];
  return a.map(([k,v],i)=>'<div class="lb-hb"><span class="n">'+lbEsc(k)+'</span><span class="tr"><span style="width:'+(v/mx*100)+'%;background:'+colf(k)+';animation-delay:'+i*45+'ms"></span></span><span class="c">'+v+'</span></div>').join('');}
function lbDir(rows){const W=300,H=140,mid=70,bw=(W-20)/5,sc=v=>Math.max(-1,Math.min(1,v/12))*54;
  let s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="임기별 평균 권력 방향">';
  s+='<line x1="8" x2="'+(W-8)+'" y1="'+mid+'" y2="'+mid+'" stroke="rgba(29,27,24,.25)"/>';
  s+='<text x="10" y="11" font-size="9" fill="rgba(29,27,24,.45)">권력 집중 ↑</text><text x="10" y="'+(H-3)+'" font-size="9" fill="rgba(29,27,24,.45)">견제·분산 ↓</text>';
  rows.forEach((r,i)=>{const x=10+i*bw+bw*.22,w=bw*.56,cx=x+w/2;
    if(r.avg===null){s+='<text x="'+cx+'" y="'+(mid-6)+'" font-size="9" text-anchor="middle" fill="rgba(29,27,24,.3)">'+r.term+'기 없음</text>';return;}
    const h=sc(r.avg),y=h>=0?mid-h:mid,col=h>=0?'#b3261e':'#2f5f99';
    s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(2,Math.abs(h)).toFixed(1)+'" rx="3" fill="'+col+'"/>';
    s+='<text x="'+cx+'" y="'+(h>=0?y-4:y+Math.abs(h)+11).toFixed(1)+'" font-size="10" font-weight="700" text-anchor="middle" fill="'+col+'">'+(r.avg>0?'+':'')+r.avg+'</text>';
    s+='<text x="'+cx+'" y="'+(h>=0?mid+12:mid-5)+'" font-size="9" text-anchor="middle" fill="rgba(29,27,24,.6)">'+r.term+'기 · '+r.n+'명</text>';});
  return s+'</svg>';}
function lbStats(){const s=lbView().stats||{},dt=(s.dirByTerm&&s.dirByTerm.length)?s.dirByTerm:[1,2,3,4,5].map(t=>({term:t,n:0,avg:null}));
  const exitCol=k=>/퇴임/.test(k)?'#2f5f99':/실패|출마|패배/.test(k)?'#6e675c':'#b3261e';
  const box=(t,h)=>'<div class="card-lb"><div style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-bottom:10px">'+t+'</div>'+h+'</div>';
  return box('임기가 거듭될수록 선택은 어디로',lbDir(dt))+
    box('닮은 지도자 분포',lbBars(s.leaders,lbCol))+box('어떻게 물러났나',lbBars(s.exits,exitCol))+box('출신 배경',lbBars(s.backgrounds,()=>'#2f4a6b'));}
