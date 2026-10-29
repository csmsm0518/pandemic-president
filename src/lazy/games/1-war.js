/* ---------- 전선 배치: 전쟁 과제의 전투 단계 ----------
   사흘 동안 날마다 병력을 세 전선에 나눠 보낸다. 적도 숨겨서 나눈다(정찰 보고는 ±1쯤 틀리고, 한 곳은 안개에 가려 안 보인다).
   전선마다 더 많은 쪽이 이기고, 이긴 전선이 진 전선보다 많으면 그날을 이긴다. 지켜 낸 전선에는 다음 날 거점 병력 1이 붙는다.
   참전 규모(ctx.war)에 따라 하루 병력이 달라지고, 공세(ctx.stance 'atk')면 적이 1 더 많고, 방어('def')면 비겨도 우리가 지킨다. */
const WR_D=3;
const WR_F=()=>CP.id==='joseon'?['포구','해안','산성']:CP.id==='usa'?['북부 전선','수도 외곽','남부 전선']:CP.id==='reich'?['서부 전선','동부 전선','북아프리카']:['해협','항구','고지'];
function wrSetup(){const c=(CAR.spRun&&CAR.spRun.ctx)||{};
  return {u:10+(c.war==='big'?2:c.war==='small'||c.war==='talk'?-1:0),eu:10+(c.stance==='atk'?1:0),def:c.stance==='def'};}
// 적의 배치: 무작위로 나누되, 전날 빼앗긴 전선에는 더 보낸다
function wrEnemy(n,lost){const w=[0,1,2].map(k=>.6+Math.random()+(lost&&lost[k]?.9:0)),s=w.reduce((a,b)=>a+b,0),a=w.map(x=>Math.floor(x/s*n));
  let r=n-a.reduce((p,q)=>p+q,0);while(r-->0)a[Math.floor(Math.random()*3)]++;return a;}
function wrIntel(e){const fog=Math.floor(Math.random()*3);return e.map((v,k)=>k===fog?null:Math.max(0,v+Math.round((Math.random()-.5)*2.4)));}
// 한 전선: 1 이김 · 0 비김 · -1 짐
const wrFight=(m,e,def)=>m>e||(def&&m===e)?1:m===e?0:-1;
const wrTier=w=>w>=3?0:w===2?1:w===1?2:3;
const WR_RES=['적을 몰아냈다','교착','밀려났다'];
function mgWar(box,done){const F=WR_F(),G=wrSetup(),$=id=>document.getElementById(id);
  let day=1,hold=[0,0,0],lost=null,won=0,loss=0,al=[0,0,0],en=null,ph='plan';
  const tok=(n,c)=>Array.from({length:n},(_,i)=>'<i class="'+c+'" style="--i:'+i+'"></i>').join('');
  box.innerHTML='<div class="mgx wr"><div class="wr-top"><b>작전 상황판</b><span class="wr-days" id="wrDays"></span><span class="wr-left" id="wrLeft"></span></div>'+
   '<div class="wr-map" id="wrMap">'+F.map((n,k)=>'<div class="wr-f" id="wrF'+k+'"><div class="wr-in" id="wrIn'+k+'"></div>'+
     '<div class="wr-zone"><div class="wr-en" id="wrEn'+k+'"></div><div class="wr-ln" id="wrLn'+k+'"><span></span></div><div class="wr-me" id="wrMe'+k+'"></div></div>'+
     '<div class="wr-n">'+n+'</div><div class="wr-rs" id="wrRs'+k+'"></div>'+
     '<div class="wr-ctl"><button type="button" data-k="'+k+'" data-d="-1" aria-label="'+n+' 병력 빼기">−</button><b id="wrC'+k+'">0</b><button type="button" data-k="'+k+'" data-d="1" aria-label="'+n+' 병력 더하기">+</button></div></div>').join('')+'</div>'+
   '<div class="pk-msg" id="wrMsg"></div><button id="wrGo" class="pri" style="width:100%;padding:15px;font-size:16px"></button></div>';
  const left=()=>G.u-al.reduce((a,b)=>a+b,0);
  const draw=()=>{$('wrDays').innerHTML=Array.from({length:WR_D},(_,i)=>'<i class="'+(i<day-1?'d':'')+(i===day-1?' on':'')+'"></i>').join('')+'<span>'+day+'일차</span>';
    $('wrLeft').innerHTML=ph==='plan'?'남은 병력 <b>'+left()+'</b>':'승 '+won+' · 패 '+loss;
    for(let k=0;k<3;k++){$('wrC'+k).textContent=al[k]+(hold[k]?'+'+hold[k]:'');$('wrMe'+k).innerHTML=tok(hold[k],'h')+tok(al[k],'u');}
    const g=$('wrGo');if(ph==='plan'){g.disabled=left()>0;g.textContent=left()>0?'병력 '+left()+'을 더 배치하세요':'명령 하달';}else{g.disabled=false;g.textContent=day<WR_D?(day+1)+'일차 작전으로':'결과 보고';}};
  const plan=()=>{ph='plan';al=[0,0,0];en=wrEnemy(G.eu,lost);const it=wrIntel(en);box.querySelector('.wr').classList.remove('fought');
    for(let k=0;k<3;k++){$('wrIn'+k).innerHTML=it[k]==null?'<span class="fog">안개 · 정찰 불가</span>':'정찰 <b>적 약 '+it[k]+'</b>';
      $('wrEn'+k).innerHTML=tok(it[k]==null?3:Math.min(6,it[k]),'q');$('wrRs'+k).textContent='';$('wrRs'+k).className='wr-rs';$('wrLn'+k).style.setProperty('--y','50%');$('wrF'+k).className='wr-f';}
    $('wrMsg').innerHTML=day+'일차 · 병력 '+G.u+'을 세 전선에 나눠라. '+(G.def?'<b>방어전</b>이라 비기면 우리가 지킨다.':'<b>공세</b>라 적이 하나 더 많다.')+(hold.some(Boolean)?' 어제 지킨 전선에는 거점 병력이 붙어 있다.':'');draw();};
  box.querySelectorAll('.wr-ctl button').forEach(b=>b.onclick=()=>{if(ph!=='plan')return;const k=+b.dataset.k,d=+b.dataset.d;
    if(d>0&&left()<=0||d<0&&al[k]<=0)return;al[k]+=d;try{clk(d>0?900:600,.5);}catch(e){}draw();});
  const fight=()=>{ph='fight';$('wrGo').disabled=true;const res=[0,1,2].map(k=>wrFight(al[k]+hold[k],en[k],G.def));
    box.querySelector('.wr').classList.add('fought');
    res.forEach((r,k)=>setTimeout(()=>{if(!box.isConnected)return;$('wrEn'+k).innerHTML=tok(en[k],'e');$('wrLn'+k).style.setProperty('--y',r>0?'22%':r<0?'78%':'50%');
      $('wrRs'+k).textContent=(al[k]+hold[k])+' : '+en[k]+' · '+WR_RES[1-r];$('wrRs'+k).className='wr-rs '+(r>0?'w':r<0?'l':'d');$('wrF'+k).className='wr-f '+(r>0?'w':r<0?'l':'d');
      try{thud(r>0?120:80,.18,0,.25);noise(.25,.1,0,700);}catch(e){}},300+k*450));
    setTimeout(()=>{if(!box.isConnected)return;const w=res.filter(r=>r>0).length,l=res.filter(r=>r<0).length,ok=w>l;
      if(ok)won++;else loss++;hold=res.map(r=>r>0?1:0);lost=res.map(r=>r>0);
      try{if(ok)[523,659,784].forEach((f,i)=>tone(f,'triangle',.25,.1,i*.07));else[330,262].forEach((f,i)=>tone(f,'sawtooth',.3,.06,i*.1));}catch(e){}
      ph='done';$('wrMsg').innerHTML=day+'일차 '+(ok?'<b class="g">승리</b>':w===l?'<b>교착</b> · 이긴 전선이 진 전선보다 많아야 그날을 이긴다':'<b class="x">패배</b>')+
        (day<WR_D?' · 지켜 낸 전선에는 내일 거점 병력이 붙고, 적은 빼앗긴 곳에 더 보낸다.':'');
      if(day>=WR_D){const t=wrTier(won);$('wrMsg').innerHTML='사흘 전투 '+won+'승 '+loss+'패 · <b class="'+(t<=1?'g':'x')+'">'+['완승','우세','열세','패퇴'][t]+'</b>';try{SFX.medal(t);}catch(e){}ph='end';}
      draw();},300+3*450+250);};
  $('wrGo').onclick=()=>{if(ph==='plan'){if(left()>0)return;try{SFX.click();}catch(e){}fight();}
    else if(ph==='done'){day++;plan();}else if(ph==='end'){done(wrTier(won));}};
  plan();}
// 시뮬레이션: 참모본부가 날마다 무작위에 가깝게 나눈다(정찰을 조금 읽는다)
function simWar(){const F=WR_F(),G=wrSetup(),L=[];let hold=[0,0,0],lost=null,won=0;
  for(let d=1;d<=WR_D;d++){const en=wrEnemy(G.eu,lost),it=wrIntel(en),me=wrEnemy(G.u,it.map(v=>v!=null&&v>=4)),r=[0,1,2].map(k=>wrFight(me[k]+hold[k],en[k],G.def)),w=r.filter(x=>x>0).length,l=r.filter(x=>x<0).length;
    if(w>l)won++;L.push('<span class="k">'+d+'일차</span>'+F.map((n,k)=>n+' '+(me[k]+hold[k])+':'+en[k]).join(' · ')+' → '+(w>l?'<b class="me">승리</b>':w===l?'교착':'패배'));
    hold=r.map(x=>x>0?1:0);lost=r.map(x=>x>0);}
  const t=wrTier(won);return {lines:L,head:'사흘 전투 '+won+'승 · '+['완승','우세','열세','패퇴'][t],t:t};}
