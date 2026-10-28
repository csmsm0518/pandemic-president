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
// 닮은 지도자의 별칭: 이름을 바로 대지 않고 그 사람을 떠올리게 하는 수식어(소설 속 '성좌'를 부르는 방식). 만나기 전에는 이 별칭만 보인다
const DX_MOD={cinc:'쟁기로 돌아간 독재관',wash:'세 번째 왕관을 사양한 장군',louis14:'거울의 궁전에 앉은 태양',napo:'스스로 왕관을 쓴 포병',qin:'책을 불태운 첫 번째 황제',louis16:'자물쇠를 깎던 왕',
  marcus:'전장에서 일기를 쓴 철인',caesar:'주사위를 던진 자',lincoln:'갈라진 집을 지킨 나무꾼',sejong:'백성의 입에 글자를 쥐여 준 임금',peri:'역병 속에서 연설한 웅변가',sulla:'명부를 내건 뒤 은퇴한 독재관',
  solon:'법을 남기고 떠난 여행자',jeongjo:'새 성을 쌓은 효자 임금',fred:'감자를 심게 한 피리 부는 왕',peter:'수염에 세금을 매긴 황제',bism:'철과 피로 보험을 만든 재상',augu:'벽돌을 대리석으로 바꾼 자',
  fdr:'두려움 자체를 두려워하라던 자',gwang:'두 거인 사이를 걸은 폐주',church:'시가를 문 불독',asoka:'칼을 내려놓은 정복자',boli:'다섯 나라를 풀어 준 해방자',hamm:'눈에는 눈을 새긴 왕',
  nich2:'마지막 겨울궁전의 주인',charles1:'의회에 목을 내준 왕',nixon:'녹음테이프에 발목 잡힌 자',robes:'청렴하다 불린 공포의 설계자',marcos:'노란 물결에 쫓겨난 계엄의 주인',ceau:'발코니에서 야유를 들은 자',
  suharto:'새 질서를 세운 장군',hoover:'대공황을 맞은 기술자',carter:'땅콩 농장에서 온 정직한 자',bush41:'내 입술을 읽으라던 자',mandela:'스물일곱 해를 견딘 수인',diocl:'양배추를 기르러 간 황제',
  taejong:'형제의 피로 왕좌를 닦은 자',jeff:'독립의 문장을 쓴 농부 철학자',ike:'군복을 벗고 길을 놓은 장군',reagan:'벽을 허물라 외친 배우',eliz1:'나라와 결혼한 여왕',akbar:'모든 신을 한자리에 앉힌 황제',
  lky:'껌을 금지한 섬의 설계자',ataturk:'글자를 바꾼 나라의 아버지',havel:'극장에서 걸어 나온 대통령',just:'역병에 이름을 빌려준 황제',wuzt:'글자 없는 비석의 주인',taizong:'거울 같은 신하를 둔 황제',
  yang:'운하를 판 만큼 원성을 판 황제',wangmang:'옛 법으로 새 나라를 꿈꾼 찬탈자',gongmin:'변발을 풀어 버린 왕',yeonsan:'입에 패를 채운 폭군',sejo:'조카의 자리에 앉은 숙부',yeongjo:'탕평비를 세운 장수 임금',
  daewon:'척화비를 세운 아버지',gojong:'황제가 된 마지막 왕',attlee:'거인을 이긴 조용한 사내',degaulle:'국민투표에 모든 것을 건 장군',mujica:'낡은 자동차를 몬 대통령',catherine:'남편의 왕좌를 이은 계몽의 여제',
  tr:'곰 인형이 된 사냥꾼',grant:'무조건 항복을 받아 낸 장군',wilson:'열네 개의 원칙을 내건 교수',cromwell:'왕을 베고 왕처럼 다스린 자',alfred:'빵을 태운 왕',truman:'책임이 멈추는 책상의 주인',
  maria:'열여섯 아이를 둔 여제',rhee:'사월에 물러난 노정객',yeltsin:'탱크 위에 올라선 자',edward8:'사랑을 위해 왕관을 내려놓은 자',chamb:'우산을 든 평화의 신사',gorby:'문을 열었다가 나라를 잃은 자'};
// 비밀 인물: 잠겨 있을 때 보이는 수수께끼(어떻게 여는지 바로 말하지 않는다)
const DX_SH={dangun:'아무도 받지 못한 평가를 받는 날, 가장 오래된 이름이 눈을 뜬다.',jusigyeong:'끝까지 읽는 사람에게만 말이 닿는다.',jyw:'이름 대신 배움터가 열쇠다.',
  hong:'옥좌에서 내려와 본 임금만 그를 만난다.',unclesam:'같은 나라가 두 번 고른 사람에게 손가락이 향한다.',zinf:'가장 긴 밤을 끝까지 버틴 자만이 그 얼굴을 본다.'};
// 임기 평가의 상징 그림(흰 선 그림, 24칸)
const DX_IC=(()=>{const s=b=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+b+'</svg>';
  return {legend:s('<path d="M12 20c-4-2-7-6-7-11M12 20c4-2 7-6 7-11M5 9l-2-1M5 13l-2 0M6 16l-2 1M19 9l2-1M19 13l2 0M18 16l2 1"/><path d="M12 4l1.5 3 3 .4-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.4z"/>'),
    reelect:s('<rect x="4" y="10" width="16" height="10" rx="1"/><path d="M9 10V5h6v5M8 14h8M10 7.5l1.5 1.5L14 6"/>'),
    modest:s('<path d="M3 15h18M6 15v-3h12v3M8 12V9h8v3"/>'),
    judged:s('<path d="M14 5l5 5M11 8l5 5M12.5 6.5l-6 6M9 15l-5 5M3 21h9"/>'),
    failfp:s('<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 7l-1.5 4 3 2-1.5 4"/>'),
    inst:s('<path d="M3 9l9-5 9 5M5 9v9M9.7 9v9M14.3 9v9M19 9v9M3 20h18"/>'),
    auth:s('<path d="M7 11V7a2 2 0 0 1 4 0v4M11 9V6a2 2 0 0 1 4 0v5M15 10V8a2 2 0 0 1 4 0v5c0 4-3 7-7 7s-6-2-7-5l-1-4a2 2 0 0 1 3-1l1 2"/>'),
    ousted:s('<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>'),
    medfail:s('<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/><path d="M12 8l-1.5 3 3 1.5-1.5 3"/>'),
    ecofail:s('<path d="M3 4v16h18M6 7l4 4 3-2 6 7M15 16h4v-4"/>'),
    quit:s('<path d="M6 21V4h9v17M15 4l4 2v15M11 12h.01M3 21h18"/>'),
    shadow:s('<path d="M3 9c3-2 6-2 9 0 3-2 6-2 9 0-1 5-4 7-6 7-1.5 0-2-1-3-2-1 1-1.5 2-3 2-2 0-5-2-6-7z"/><path d="M8 11h.01M16 11h.01"/>'),
    kmyth:s('<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 16s-3.5-2.2-3.5-5A2 2 0 0 1 12 9.7 2 2 0 0 1 15.5 11c0 2.8-3.5 5-3.5 5z"/>'),
    science:s('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.5 15h9"/>'),
    balance:s('<path d="M12 4v16M8 20h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>'),
    lucky:s('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01"/>'),
    clean:s('<path d="M12 3c3 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 3-6.5 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
    zb:s('<circle cx="12" cy="12" r="2"/><path d="M12 10V4.5a4 4 0 0 0-3.5 6M12 10a4 4 0 0 1 3.5-5.5M10.3 13L5.5 15.8a4 4 0 0 0 6.2 2.8M13.7 13l4.8 2.8a4 4 0 0 1-6.2 2.8"/>'),
    sail:s('<path d="M12 3v13M12 4l6 10h-6M11 6l-5 8h5M3 17h18l-2.5 3.5h-13z"/>'),
    star:s('<path d="M15 9l1.4 3.2 3.4.3-2.6 2.3.8 3.4L15 16.4l-3 1.8.8-3.4-2.6-2.3 3.4-.3zM3 4l6.5 5.5M2.5 9.5l4 3M7 2.5l4 4.5"/>'),
    storm:s('<path d="M7 16a4 4 0 0 1-.5-8A5.5 5.5 0 0 1 17 8.5 3.5 3.5 0 0 1 17 16"/><path d="M12 13l-2 4h3l-2 4"/>')};})();
function dexScene(){dexClose();window.scrollTo(0,0);try{if(CINE)cineClose();}catch(e){}
  const E=lbEsc,n=x=>+x||0,cnt=o=>Object.keys(o||{}).filter(k=>o[k]).length;
  const SEC=[];Object.keys(CAMPS).forEach(c=>(CAMPS[c].bg||[]).forEach(q=>{if(q.sec)SEC.push({q:q,camp:CAMPS[c].n,cid:c});}));
  const secOn=x=>{const L=bgLock(x.q);return !L||!!L.used;};
  const ARC=[{id:'zombie',n:'방역선 · 좀비 서바이벌',on:eggOn('zombie'),h:'제목을 빠르게 여러 번 두드려 보라',rec:MEM.zg&&MEM.zg.runs?['최고 '+Number(MEM.zg.best||0).toLocaleString('ko-KR')+'점','새벽 맞이 '+(MEM.zg.wins||0)+'번','출격 '+MEM.zg.runs+'번']:null},
    {id:'sail',n:'대항해 · 폭풍 해협',on:eggOn('sail'),h:'나침반은 돌라고 있는 것이다',rec:MEM.sail&&MEM.sail.v===2&&MEM.sail.runs?[MEM.sail.best?'최고 '+Math.floor(MEM.sail.best/60)+':'+(MEM.sail.best%60).toFixed(1).padStart(4,'0'):'아직 완주 못 함','금메달 '+(MEM.sail.gold||0)+'번','출항 '+MEM.sail.runs+'번']:null},
    {id:'star',n:'별똥별을 피해라 · 밤하늘 서바이벌',on:eggOn('star'),h:'큰 바늘 끝이 별을 오래 바라보게 하라',rec:MEM.star&&MEM.star.v===1&&MEM.star.runs?['최고 '+Number(MEM.star.best||0).toLocaleString('ko-KR')+'점','새벽 맞이 '+(MEM.star.dawn||0)+'번','비행 '+MEM.star.runs+'번']:null}];
  const AIC={zombie:'zb',sail:'sail',star:'star'},ACOL={zombie:'#7a9a4a',sail:'#3d8fd6',star:'#8fb4ff'};
  const T=[{k:'lead',n:'닮은 지도자',a:LEADK.filter(id=>MEM.leaders&&MEM.leaders[id]).length,b:LEADK.length},{k:'end',n:'임기 평가',a:ENDC.filter(e=>MEM.ends[e[0]]).length,b:ENDC.length},
    {k:'sec',n:'비밀 인물',a:SEC.filter(secOn).length,b:SEC.length},{k:'arc',n:'비밀 기록',a:ARC.filter(x=>x.on).length,b:ARC.length}];
  const all=T.reduce((s,x)=>s+x.a,0),tot=T.reduce((s,x)=>s+x.b,0),pct=Math.round(all/tot*100);
  const sil='<svg class="dx-sil" viewBox="0 0 64 64" aria-hidden="true"><path d="M7 64C9 52 19 46 32 46S55 52 57 64Z"/><ellipse cx="32" cy="30" rx="11.5" ry="13.5"/><text x="32" y="36" text-anchor="middle">?</text></svg>';
  const av=(name,px)=>portrait(name,px)||'<span class="dx-ini sh"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M9 64c2-12 11-19 23-19s21 7 23 19z"/><ellipse cx="32" cy="28" rx="11.5" ry="13.5"/></svg></span>';
  const card=(o)=>'<button type="button" class="dx-c'+(o.on?' on':'')+(o.hid&&!o.on?' hid':'')+'" style="--c:'+o.c+';--i:'+o.i+'" data-k="'+o.key+'">'+(o.top||'')+
    '<span class="dx-av">'+(o.on||o.lav?o.av:sil)+'</span><b class="dx-n">'+o.n+'</b><span class="dx-s">'+o.s+'</span>'+(o.cnt?'<i class="dx-x">×'+o.cnt+'</i>':'')+'</button>';
  const D={};   // 카드 key → 펼쳐 볼 자세한 이야기
  const grid={
    lead:()=>LEADK.map((id,i)=>{const L=LEAD[id],c=n(MEM.leaders&&MEM.leaders[id]),key='l'+id;
      // 별칭이 이름 자리에 서고, 실명과 시대는 만난 뒤에만 드러난다
      const md=DX_MOD[id]||L.k;
      D[key]=c?'<b>「'+E(md)+'」</b><p><b class="dx-rn">'+E(L.n)+'</b> · '+E(L.era)+'</p><p>'+E(L.d)+'</p><small>커리어 끝에 '+c+'번 닮았다고 평가받았다</small>'
        :'<b>「'+E(md)+'」</b><p>아직 이름이 드러나지 않았다. 커리어를 마칠 때 걸어온 길이 닮으면 그 이름이 보인다.</p>'+(DX_LH[id]?'<small>어렴풋한 길: '+E(DX_LH[id])+'</small>':'');
      return card({i:i,key:key,on:c>0,c:L.col,av:av(L.n,78),n:E(md),s:c?E(L.n):'이름이 드러나지 않았다',cnt:c,top:c?'<span class="dx-era">'+E(L.era.split(' · ')[0])+'</span>':''});}).join(''),
    end:()=>ENDC.map((e,i)=>{const id=e[0],c=n(MEM.ends[id]),X=DX_E[id]||['',''],hid=!!X[2],nm=HNAME[id]||e[1],key='e'+id;
      D[key]=c?'<b>'+E(nm)+'</b><p>'+E(X[0])+'</p><small>받는 길 · '+E(X[1])+' · 지금까지 '+c+'번 받았다</small>':hid?'<b>숨겨진 평가</b><p>수수께끼: '+E(X[1])+'</p><small>받으면 비밀 인물 「단군왕검」이 깨어난다</small>':'<b>'+E(nm)+'</b><p>아직 받지 못한 평가다.</p><small>받는 길 · '+E(X[1])+'</small>';
      return card({i:i,key:key,on:c>0,hid:hid,c:DX_EC[id]||'#6e675c',av:'<span class="dx-seal">'+(hid&&!c?'<i class="dx-q">?</i>':(DX_IC[id]||''))+'</span>',lav:1,n:c||!hid?E(nm):'???',s:c||!hid?E(X[1]):'수수께끼 · '+E(X[1]),cnt:c,top:hid?'<span class="dx-era">숨김</span>':''});}).join(''),
    sec:()=>SEC.map((x,i)=>{const on=secOn(x),q=x.q,key='s'+q.id;
      D[key]=on?'<b>'+E(q.n)+'</b> · '+E(x.camp)+'<p>'+E(q.s)+'</p><small>'+(bgLock(q)&&bgLock(q).used?'단 한 번뿐인 만남을 이미 함께했다':'새 게임의 지도자 고르기에서 고를 수 있다')+'</small>':'<b>잠긴 비밀 인물</b> · '+E(x.camp)+'<p>'+E(DX_SH[q.id]||'아직은 아무것도 알 수 없다.')+'</p>';
      return card({i:i,key:key,on:on,c:'#c9a24a',av:av(q.n,78),n:on?E(q.n):'???',s:on?E(q.k||''):E(DX_SH[q.id]||''),top:'<span class="dx-era">'+E(x.camp)+'</span>'});}).join(''),
    arc:()=>ARC.map((x,i)=>{const key='a'+x.id;
      D[key]=x.on?'<b>'+E(x.n)+'</b><p>'+(x.rec?x.rec.map(E).join(' · '):'열렸지만 아직 한 번도 해 보지 않았다.')+'</p><small>새 게임 → 미니게임 탭에서 할 수 있다</small>':'<b>잠긴 비밀 기록</b><p>힌트: '+E(x.h)+'</p>';
      return card({i:i,key:key,on:x.on,c:ACOL[x.id],lav:1,av:'<span class="dx-seal">'+(x.on?DX_IC[AIC[x.id]]:'<i class="dx-q">?</i>')+'</span>',n:x.on?E(x.n.split(' · ')[0]):'???',s:x.on?(x.rec?E(x.rec[0]):'아직 기록 없음'):'미니게임'});}).join('')};
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
