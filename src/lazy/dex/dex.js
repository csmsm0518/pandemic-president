/* ---------- 도감: 기록 보관소 ----------
   명예의 전당과 같은 어두운 금빛 무대에 네 칸(닮은 지도자 · 임기 평가 · 비밀 인물 · 비밀 기록)을 둔다.
   만난 것은 초상·설명·만난 횟수까지, 아직 못 만난 것은 실루엣과 힌트만 보인다. 카드를 누르면 아래에 자세한 이야기가 펼쳐진다. */
// 닮은 지도자: 아직 못 만났을 때 보이는 힌트(어떤 길을 걸으면 닮게 되는지)
const DX_LH={cinc:'위기를 수습하고, 얻은 권력을 스스로 돌려준다',wash:'두 번이면 충분하다며 스스로 물러난다',sejong:'백성에게 묻고, 제도를 남긴다',lincoln:'분열 속에서 비상 권한을 쓰고도 나라를 지킨다',
  peri:'역병 앞에서 민주정을 지키려 애쓴다',marcus:'절대 권력을 쥐고도 스스로를 경계한다',caesar:'모든 권력을 한 손에 모은다',napo:'공화국에서 시작해 황제가 된다',louis14:'아주 오래, 홀로 다스린다',
  qin:'강하게 밀어붙이되 가혹하게 다스린다',louis16:'결단하지 못하고 민심을 놓친다'};
// 임기 평가: 설명과 받는 조건. hid는 숨겨진 평가라 받기 전에는 이름 대신 수수께끼만 보인다
const DX_E={legend:['세계가 이 나라의 사례를 인용했다. 그리고 실제로 사람이 덜 죽었다.','임기 점수 80 이상'],reelect:['완벽하지 않았지만 국민은 이 정부를 믿었다.','임기 점수 66 이상'],
  modest:['큰 실패도 큰 성취도 없었다. 위기의 시대 대통령에게 이것이 나쁜 성적인지는 애매하다.','임기 점수 52 이상'],judged:['사람들은 이 시절을 되도록 이야기하지 않으려 한다.','임기 점수 36 이상'],
  failfp:['막을 수 있었던 죽음이 너무 많았다. 그것이 이 임기에 대한 유일한 요약이다.','임기 점수 36 미만'],inst:['개인의 판단이 아니라 구조를 바꿨다. 다음 위기에 이 나라가 덜 다친다면 그건 이 임기 덕분이다.','제도를 크게 남기고 지지율 45 이상'],
  auth:['위기를 이유로 얻은 권한을 끝내 돌려주지 않았다. 다음 대통령도 그 권한을 쓴다.','권위주의로 기울고 점수 70 미만'],ousted:['여론과 광장이 정권을 먼저 끝냈다. 위기 대응의 성패를 따지기도 전에 정부가 사라졌다.','민심이 무너져 쫓겨난다'],
  medfail:['병상도 인력도 남지 않았다. 이 시기의 사망자 수는 이후 어떤 통계에서도 정상으로 분류되지 않는다.','의료가 바닥나 정권이 무너진다'],ecofail:['위기는 어떻게든 버텼다. 사람들이 돌아갈 일자리가 남지 않았을 뿐이다.','경제가 바닥나 정권이 무너진다'],
  quit:['스스로 내려왔다. 그 판단이 옳았는지는 오래 논쟁거리로 남는다.','임기 도중 스스로 물러난다'],
  shadow:['유착은 극에 달했는데 지지율은 무너지지 않았다. 부패한 정부가 사랑받을 수 있다는 가장 불편한 증명이 됐다.','썩었는데도 사랑받는 정부',1],
  kmyth:['사람도 지키고 경제도 지켰다. 다른 나라들은 둘 중 하나는 포기해야 했다.','사람과 경제, 둘 다 지킨다',1],science:['이 정부의 무기는 권한이 아니라 공개된 데이터였다.','권한이 아니라 투명함을 무기로',1],
  balance:['방역, 경제, 의료, 여론, 청렴. 무엇 하나 버리지 않았다.','무엇 하나 버리지 않는다',1],lucky:['판정 주사위가 이상할 만큼 당신 편이었다. 실력이었는지 운이었는지는 아무도 모른다.','주사위가 이상할 만큼 당신 편',1],
  clean:['뒷돈 한 푼, 감춘 문서 한 장 없었다. 털어도 먼지가 나지 않는 정부를 사람들은 처음 보았다.','털어도 먼지 하나 없다',1],storm:['나라는 갈라졌고 권력 주변은 썩었다. 그런데도 임기를 끝까지 채웠다.','갈라지고 썩어도 끝까지 버틴다',1]};
const DX_EC={legend:'#2e7d55',reelect:'#2e7d55',modest:'#2f5f99',judged:'#6e675c',failfp:'#b3261e',inst:'#2f4a6b',auth:'#b3261e',ousted:'#b3261e',medfail:'#b3261e',ecofail:'#b8541e',quit:'#6e675c',
  shadow:'#b3261e',kmyth:'#2e7d55',science:'#2f5f99',balance:'#2f4a6b',lucky:'#8f6a12',clean:'#1f7a72',storm:'#a8406f'};
function dexScene(){dexClose();window.scrollTo(0,0);try{if(CINE)cineClose();}catch(e){}
  const E=lbEsc,n=x=>+x||0,cnt=o=>Object.keys(o||{}).filter(k=>o[k]).length;
  const SEC=[];Object.keys(CAMPS).forEach(c=>(CAMPS[c].bg||[]).forEach(q=>{if(q.sec)SEC.push({q:q,camp:CAMPS[c].n,cid:c});}));
  const secOn=x=>{const L=bgLock(x.q);return !L||!!L.used;};
  const ARC=[{id:'zombie',n:'방역선 · 좀비 서바이벌',on:eggOn('zombie'),h:'제목을 빠르게 여러 번 두드려 보라',rec:MEM.zg&&MEM.zg.runs?['최고 '+Number(MEM.zg.best||0).toLocaleString('ko-KR')+'점','새벽 맞이 '+(MEM.zg.wins||0)+'번','출격 '+MEM.zg.runs+'번']:null},
    {id:'sail',n:'대항해 · 폭풍 해협',on:eggOn('sail'),h:'나침반은 돌라고 있는 것이다',rec:MEM.sail&&MEM.sail.v===2&&MEM.sail.runs?[MEM.sail.best?'최고 '+Math.floor(MEM.sail.best/60)+':'+(MEM.sail.best%60).toFixed(1).padStart(4,'0'):'아직 완주 못 함','금메달 '+(MEM.sail.gold||0)+'번','출항 '+MEM.sail.runs+'번']:null}];
  const T=[{k:'lead',n:'닮은 지도자',a:LEADK.filter(id=>MEM.leaders&&MEM.leaders[id]).length,b:LEADK.length},{k:'end',n:'임기 평가',a:ENDC.filter(e=>MEM.ends[e[0]]).length,b:ENDC.length},
    {k:'sec',n:'비밀 인물',a:SEC.filter(secOn).length,b:SEC.length},{k:'arc',n:'비밀 기록',a:ARC.filter(x=>x.on).length,b:ARC.length}];
  const all=T.reduce((s,x)=>s+x.a,0),tot=T.reduce((s,x)=>s+x.b,0),pct=Math.round(all/tot*100);
  const sil='<svg class="dx-sil" viewBox="0 0 64 64" aria-hidden="true"><path d="M7 64C9 52 19 46 32 46S55 52 57 64Z"/><ellipse cx="32" cy="30" rx="11.5" ry="13.5"/><text x="32" y="36" text-anchor="middle">?</text></svg>';
  const av=(name,px)=>portrait(name,px)||'<span class="dx-ini">'+E(String(name||'?').slice(0,1))+'</span>';
  const card=(o)=>'<button type="button" class="dx-c'+(o.on?' on':'')+(o.hid&&!o.on?' hid':'')+'" style="--c:'+o.c+';--i:'+o.i+'" data-k="'+o.key+'">'+(o.top||'')+
    '<span class="dx-av">'+(o.on||o.lav?o.av:sil)+'</span><b class="dx-n">'+o.n+'</b><span class="dx-s">'+o.s+'</span>'+(o.cnt?'<i class="dx-x">×'+o.cnt+'</i>':'')+'</button>';
  const D={};   // 카드 key → 펼쳐 볼 자세한 이야기
  const grid={
    lead:()=>LEADK.map((id,i)=>{const L=LEAD[id],c=n(MEM.leaders&&MEM.leaders[id]),key='l'+id;
      D[key]=c?'<b>'+E(L.n)+'</b> · '+E(L.era)+'<p>'+E(L.d)+'</p><small>커리어 끝에 '+c+'번 닮았다고 평가받았다</small>':'<b>아직 만나지 못한 지도자</b> · '+E(L.era)+'<p>'+(DX_LH[id]?'이런 길을 걸으면 닮게 된다: '+E(DX_LH[id]):'별명은 「'+E(L.k)+'」. 커리어를 마칠 때 걸어온 길이 닮으면 만난다.')+'</p>';
      return card({i:i,key:key,on:c>0,c:L.col,av:av(L.n,78),n:c?E(L.n):'???',s:E(L.k),cnt:c,top:'<span class="dx-era">'+E(L.era.split(' · ')[0])+'</span>'});}).join(''),
    end:()=>ENDC.map((e,i)=>{const id=e[0],c=n(MEM.ends[id]),X=DX_E[id]||['',''],hid=!!X[2],nm=HNAME[id]||e[1],key='e'+id;
      D[key]=c?'<b>'+E(nm)+'</b><p>'+E(X[0])+'</p><small>받는 길 · '+E(X[1])+' · 지금까지 '+c+'번 받았다</small>':hid?'<b>숨겨진 평가</b><p>수수께끼: '+E(X[1])+'</p><small>받으면 비밀 인물 「단군왕검」이 깨어난다</small>':'<b>'+E(nm)+'</b><p>아직 받지 못한 평가다.</p><small>받는 길 · '+E(X[1])+'</small>';
      return card({i:i,key:key,on:c>0,hid:hid,c:DX_EC[id]||'#6e675c',av:'<span class="dx-seal">'+E((hid&&!c?'?':nm).slice(0,1))+'</span>',lav:1,n:c||!hid?E(nm):'???',s:c||!hid?E(X[1]):'수수께끼 · '+E(X[1]),cnt:c,top:hid?'<span class="dx-era">숨김</span>':''});}).join(''),
    sec:()=>SEC.map((x,i)=>{const on=secOn(x),q=x.q,key='s'+q.id;
      D[key]=on?'<b>'+E(q.n)+'</b> · '+E(x.camp)+'<p>'+E(q.s)+'</p><small>'+(bgLock(q)&&bgLock(q).used?'단 한 번뿐인 만남을 이미 함께했다':'새 게임의 지도자 고르기에서 고를 수 있다')+'</small>':'<b>잠긴 비밀 인물</b> · '+E(x.camp)+'<p>'+E(q.hint||'')+'</p>';
      return card({i:i,key:key,on:on,c:'#c9a24a',av:av(q.n,78),n:on?E(q.n):'???',s:on?E(q.k||''):E(q.hint||''),top:'<span class="dx-era">'+E(x.camp)+'</span>'});}).join(''),
    arc:()=>ARC.map((x,i)=>{const key='a'+x.id;
      D[key]=x.on?'<b>'+E(x.n)+'</b><p>'+(x.rec?x.rec.map(E).join(' · '):'열렸지만 아직 한 번도 해 보지 않았다.')+'</p><small>'+(x.id==='zombie'?'새 게임 → 무대 고르기의 「좀비 아포칼립스」':'새 게임 → 무대 고르기 끝의 「대항해」')+'</small>':'<b>잠긴 비밀 기록</b><p>힌트: '+E(x.h)+'</p>';
      return card({i:i,key:key,on:x.on,c:x.id==='zombie'?'#7a9a4a':'#3d8fd6',lav:1,av:'<span class="dx-seal">'+(x.on?(x.id==='zombie'?'生':'航'):'?')+'</span>',n:x.on?E(x.n.split(' · ')[0]):'???',s:x.on?(x.rec?E(x.rec[0]):'아직 기록 없음'):'비밀 모드'});}).join('')};
  const ring='<svg class="dx-ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="v" cx="60" cy="60" r="52" style="stroke-dasharray:'+(326.7*pct/100).toFixed(1)+' 400"/></svg>';
  const w=document.createElement('div');w.id='dex';w.className='dexs';
  w.innerHTML='<div class="dx-in"><header class="dx-hd"><button type="button" class="dx-bk" id="dxBk">← 돌아가기</button>'+
    '<div class="dx-tt"><span>ARCHIVE</span><h1>도감</h1><p>'+E(NICK||'익명')+'의 기록 보관소</p></div>'+
    '<div class="dx-pc">'+ring+'<b>'+pct+'<small>%</small></b><span>'+all+' / '+tot+'</span></div></header>'+
    '<div class="dx-st"><div><span>지나온 인생</span><b>'+n(MEM.careers)+'<small>번</small></b></div><div><span>최고 커리어 점수</span><b>'+(MEM.best100?Number(MEM.best100).toLocaleString('ko-KR'):'—')+'</b></div>'+
    '<div><span>최장 재임</span><b>'+(MEM.longest||'—')+'<small>'+(MEM.longest?'년':'')+'</small></b></div><div><span>평가 받은 횟수</span><b>'+Object.values(MEM.ends||{}).reduce((s,x)=>s+n(x),0)+'<small>번</small></b></div></div>'+
    '<nav class="dx-tabs" role="tablist">'+T.map((x,i)=>'<button type="button" role="tab" data-t="'+x.k+'"'+(i?'':' class="on"')+'>'+x.n+'<em>'+x.a+' / '+x.b+'</em><i style="width:'+(x.b?x.a/x.b*100:0)+'%"></i></button>').join('')+'</nav>'+
    '<div class="dx-g" id="dxG"></div><div class="dx-d" id="dxD" aria-live="polite"></div></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id);let tab='lead',sel='';
  const show=k=>{tab=k;sel='';$('dxG').innerHTML=grid[k]();$('dxD').innerHTML='';$('dxD').classList.remove('on');w.querySelectorAll('.dx-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===k));
    $('dxG').querySelectorAll('.dx-c').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}const k2=b.dataset.k;
      if(sel===k2){sel='';$('dxD').classList.remove('on');b.classList.remove('sel');return;}sel=k2;$('dxG').querySelectorAll('.dx-c').forEach(x=>x.classList.toggle('sel',x===b));
      const d=$('dxD');d.style.setProperty('--c',b.style.getPropertyValue('--c'));d.innerHTML=D[k2]||'';d.classList.add('on');
      // 넓은 화면은 아래 칸이 보이게, 좁은 화면은 펼친 이야기로 내려간다
      if(innerWidth<640)try{d.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){}});};
  w.querySelectorAll('.dx-tabs button').forEach(b=>b.onclick=()=>{try{SFX.tick?SFX.tick(1):SFX.click();}catch(e){}show(b.dataset.t);});
  $('dxBk').onclick=()=>{try{SFX.back();}catch(e){}dexClose();home();};
  DEX.key=e=>{if(e.key==='Escape'){$('dxBk').click();return;}if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const i=T.findIndex(x=>x.k===tab),j=(i+(e.key==='ArrowRight'?1:T.length-1))%T.length;show(T[j].k);}};
  document.addEventListener('keydown',DEX.key);
  show('lead');}
const DEX={key:null};
function dexClose(){const w=document.getElementById('dex');if(w)w.remove();if(DEX.key){document.removeEventListener('keydown',DEX.key);DEX.key=null;}document.body.style.overflow='';}
