/* ---------- 승부차기 ----------
   우리가 찰 때는 골문을 눌러 노릴 곳을 고르고 힘 게이지를 멈춘다. 상대가 찰 때는 키커의 시선을 읽고 몸을 날린다.
   다섯 번씩 번갈아 차고, 승부가 갈리면 일찍 끝난다. 같으면 서든데스(최대 5라운드, 그래도 같으면 추첨). */
const PK_ZN=['왼쪽 위','가운데 위','오른쪽 위','왼쪽 아래','가운데 아래','오른쪽 아래'],PK_N=5;
const PK_SW=r=>r?[.5,.8]:[.63,.79];   // 힘 게이지의 초록 칸. 위쪽 구석은 막기 어려운 대신 좁다
const PK_FIG=(c,up)=>'<svg viewBox="0 0 40 60" aria-hidden="true"><path d="'+(up?'M12 19L3 8M28 19l9-11':'M12 19L8 35M28 19l4 16')+'" stroke="'+c+'" stroke-width="5" stroke-linecap="round" fill="none"/>'+
  (up?'<circle cx="3" cy="8" r="3.4" fill="#fff" stroke="#1d1b18"/><circle cx="37" cy="8" r="3.4" fill="#fff" stroke="#1d1b18"/>':'')+
  '<rect x="13" y="37" width="6" height="21" rx="2" fill="#1d1b18"/><rect x="21" y="37" width="6" height="21" rx="2" fill="#1d1b18"/><rect x="11" y="15" width="18" height="24" rx="5" fill="'+c+'" stroke="#1d1b18" stroke-width="1.2"/><circle cx="20" cy="9" r="6.5" fill="#f0d2b0" stroke="#1d1b18" stroke-width="1.2"/></svg>';
// 우리 슛: tgt 칸(0~5), p 힘(0~1). 너무 세면 위쪽은 크로스바를 넘기고, 아래쪽은 떠서 위로 가거나(65%) 빗나간다.
function pkShot(tgt,p){const r=tgt/3|0,c=tgt%3,[lo,hi]=PK_SW(r),weak=p<lo;let miss='',ty=r;
  if(p>hi){if(r===0||Math.random()<.35)miss=c===1||r===0?'over':'wide';else ty=0;}
  const kc=Math.random()<.22?c:(Math.random()<.18?1:Math.random()<.5?0:2);
  let save=false;if(!miss){if(kc===c)save=Math.random()<Math.min(.96,(ty===0?(c===1?.6:.4):(c===1?.88:.72))+(weak?.3:0));else if(weak&&c===1)save=Math.random()<.45;}
  return {r:r,c:c,ty:ty,miss:miss,weak:weak,kc:kc,save:save,goal:!miss&&!save};}
// 상대 키커: 찰 곳과, 70%만 맞는 시선
function pkOpp(){const oc=Math.random()<.2?1:Math.random()<.5?0:2;return {oc:oc,orow:Math.random()<.38?0:1,tl:Math.random()<.7?oc:Math.floor(Math.random()*3)};}
function pkKeep(d,o){const miss=Math.random()<.07,save=!miss&&d===o.oc&&Math.random()<(o.orow===0?(o.oc===1?.7:.5):(o.oc===1?.92:.82));return {miss:miss,save:save,goal:!miss&&!save};}
const pkScore=a=>a.filter(Boolean).length;
function pkDecided(me,op){const a=pkScore(me),b=pkScore(op);
  if(!(me.length>=PK_N&&op.length>=PK_N))return a+(PK_N-me.length)<b||b+(PK_N-op.length)<a;
  return me.length===op.length&&a!==b;}
const pkOver=(me,op)=>pkDecided(me,op)||(me.length>=PK_N+5&&me.length===op.length);
function pkEnd(me,op){let a=pkScore(me),b=pkScore(op),lot='';if(a===b){lot=' (끝내 가리지 못해 추첨)';if(Math.random()<.5)a++;else b++;}
  const d=a-b;return {a:a,b:b,t:d>=2?0:d>=1?1:d>=-1?2:3,txt:'최종 '+a+' : '+b+(d>0?' 승리!':' 패배')+lot};}
function mgPK(box,done){const me=[],op=[];let ph='',tgt=-1,pw=0,pd=1,tm=0,tmax=1.5,O=null,dive=-1,live=true,last=performance.now();
  box.innerHTML='<div class="mgx pq">'+
   '<div class="pq-sb"><div><span>우리</span><b id="pqMe"></b></div><div class="c"><strong id="pqSc">0 : 0</strong><em id="pqRd"></em></div><div class="r"><span>상대</span><b id="pqOp"></b></div></div>'+
   '<div class="pq-fd" id="pqFd"><div class="pq-cr" aria-hidden="true"></div><div class="pq-ad" aria-hidden="true"><span>PANDEMIC CUP · 결승 · 승부차기 · PANDEMIC CUP · 결승 · 승부차기 · PANDEMIC CUP · 결승 · 승부차기</span></div><div class="pq-gl"><div class="pq-net" id="pqNet"></div><div class="pq-zs">'+PK_ZN.map((n,z)=>'<button class="pq-z" data-z="'+z+'" aria-label="'+n+'"></button>').join('')+'</div>'+
    '<div class="pq-kp" id="pqKp">'+PK_FIG('#e3a72f',1)+'</div></div>'+
    '<div class="pq-tg" id="pqTg"></div><div class="pq-kk" id="pqKk">'+PK_FIG('#b3261e',0)+'<i class="pq-tell" id="pqTell"></i></div><div class="pq-ball" id="pqBall"></div><div class="pq-fx" id="pqFx"></div></div>'+
   '<div class="pq-ctl"><div class="pq-pow" id="pqPow"><i class="pq-sw" id="pqSw"></i><b class="pq-nd" id="pqNd"></b><span>약하게</span><span>강하게</span></div>'+
    '<div class="pq-ti" id="pqTi"><i id="pqTf"></i></div>'+
    '<div class="pq-dv" id="pqDv"><button data-d="0">← 왼쪽</button><button data-d="1">가운데</button><button data-d="2">오른쪽 →</button></div></div>'+
   '<div class="pk-msg" id="pqMsg"></div><button id="pqGo" class="pri" style="width:100%;padding:15px;font-size:17px">찬다!</button></div>';
  const $=id=>document.getElementById(id),fd=$('pqFd');
  const GT=16,GH=130,BALL0=[50,206];   // 골문 위 여백·높이(px), 공 놓는 자리(가로 %, 세로 px)
  const zpos=(c,r)=>[10+80*(c+.5)/3,GT+GH*(r+.5)/2];
  const sbar=()=>{const n=Math.max(PK_N,me.length,op.length),d=a=>Array.from({length:n},(_,i)=>i<a.length?'<i class="'+(a[i]?'g':'x')+'"></i>':'<i></i>').join('');
    $('pqMe').innerHTML=d(me);$('pqOp').innerHTML=d(op);$('pqSc').textContent=me.filter(Boolean).length+' : '+op.filter(Boolean).length;const r=me.length+(me.length===op.length?1:0);
    $('pqRd').textContent=r>PK_N?'서든데스':r+'번째 키커';};
  const show=ids=>['pqPow','pqTi','pqDv','pqGo'].forEach(i=>{$(i).style.display=ids.indexOf(i)>=0?'':'none';});
  const reset=()=>{const b=$('pqBall'),kp=$('pqKp');b.style.transition=kp.style.transition='none';
    b.style.left=BALL0[0]+'%';b.style.top=BALL0[1]+'px';b.style.transform='translate(-50%,-50%)';kp.style.transform='translateX(-50%)';
    void b.offsetWidth;b.style.transition=kp.style.transition='';$('pqTg').style.display='none';$('pqFx').className='pq-fx';$('pqTell').style.opacity=0;fd.classList.remove('aim','keep');};
  // 공과 골키퍼를 움직인다. kc: 골키퍼가 날아간 쪽(0 왼쪽 1 가운데 2 오른쪽), kr: 높이(0 위 1 아래)
  // 결과 글씨(골!·선방!)를 크게 찍고, 골이면 그물이 출렁인다
  const fx=(s,c,net)=>{const f=$('pqFx');f.textContent=s;f.className='pq-fx '+c;void f.offsetWidth;f.classList.add('on');
    if(net){const n=$('pqNet');n.classList.remove('hit');void n.offsetWidth;n.classList.add('hit');}};
  const fly=(x,y,kc,kr)=>{const b=$('pqBall'),kp=$('pqKp');b.style.left=x+'%';b.style.top=y+'px';b.style.transform='translate(-50%,-50%) scale(.62) rotate(600deg)';
    kp.style.transform=kc===1?(kr===0?'translateX(-50%) translateY(-24%)':'translateX(-50%) scaleY(.9)'):'translateX(-50%) translateX('+(kc===0?-115:115)+'%) rotate('+(kc===0?-1:1)*(kr===0?50:74)+'deg)';};
  const next=()=>{if(!live)return;sbar();reset();
    if(pkOver(me,op))return finish();
    if(me.length===op.length){SFX.whistle();ph='aim';tgt=-1;fd.classList.add('aim');show([]);$('pqMsg').textContent='골문에서 노릴 곳을 누르세요';}
    else{SFX.whistle();ph='keep';dive=-1;O=pkOpp();
      fd.classList.add('keep');$('pqTell').style.transform='translateX(-50%) rotate('+[-40,0,40][O.tl]+'deg)';$('pqTell').style.opacity=1;
      tmax=Math.max(.95,1.6-op.length*.1);tm=tmax;show(['pqTi','pqDv']);$('pqMsg').textContent='키커의 시선(흰 화살표)을 읽고 몸을 날려라';}};
  fd.querySelectorAll('.pq-z').forEach(b=>b.onclick=()=>{if(ph!=='aim'&&ph!=='power')return;tgt=+b.dataset.z;
    const r=tgt/3|0,[x,y]=zpos(tgt%3,r),t=$('pqTg');t.style.left=x+'%';t.style.top=y+'px';t.style.display='block';
    if(ph==='aim'){ph='power';pw=0;pd=1;}
    const sw=PK_SW(r);$('pqSw').style.left=sw[0]*100+'%';$('pqSw').style.width=(sw[1]-sw[0])*100+'%';
    show(['pqPow','pqGo']);$('pqGo').textContent='찬다!';$('pqMsg').textContent=PK_ZN[tgt]+' · 바늘이 초록 칸에 왔을 때 차세요';try{SFX.click();}catch(e){}});
  const shoot=()=>{if(ph!=='power')return;ph='fly';SFX.kick();show([]);fd.classList.remove('aim');
    const s=pkShot(tgt,pw);me.push(s.goal);let [x,y]=zpos(s.c,s.ty);if(s.miss==='over')y=GT-20;if(s.miss==='wide')x=s.c===0?4:96;
    fly(x,y,s.kc,s.kc===s.c?s.ty:1);
    setTimeout(()=>{$('pqMsg').textContent=s.goal?'골!':s.miss==='over'?'크로스바 위로 떴다!':s.miss==='wide'?'골대를 벗어났다!':s.weak?'힘이 실리지 않았다. 막혔다!':'골키퍼가 막았다!';
      if(s.goal)fx('골!','g',1);else fx(s.miss?'실축':'막혔다','x');
      try{if(s.goal)SFX.goal();else SFX.miss();}catch(e){}sbar();},420);
    setTimeout(next,1700);};
  const kick=()=>{if(ph!=='keep')return;ph='fly';show([]);const d=dive<0?1:dive,k=pkKeep(d,O);op.push(k.goal);SFX.kick();if(d!==1)SFX.dive();
    let [x,y]=zpos(O.oc,O.orow);if(k.miss)y=GT-20;fly(x,y,d,d===O.oc?O.orow:1);
    setTimeout(()=>{$('pqMsg').textContent=k.miss?'상대가 실축했다!':k.save?'막아냈다!':'실점…';
      if(k.save)fx('선방!','s');else if(k.miss)fx('실축!','s');else fx('실점','x',1);try{if(k.save)SFX.save();else if(!k.goal)SFX.goal();else SFX.concede();}catch(e){}sbar();},420);
    setTimeout(next,1700);};
  $('pqDv').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(ph!=='keep')return;dive=+b.dataset.d;kick();});
  const key=e=>{if(!live)return;
    if(ph==='keep'){const m={ArrowLeft:0,ArrowDown:1,ArrowUp:1,ArrowRight:2}[e.key];if(m!=null){e.preventDefault();dive=m;kick();}}
    else if(ph==='power'&&(e.key===' '||e.key==='Enter')){e.preventDefault();shoot();}};
  document.addEventListener('keydown',key);
  const finish=()=>{live=false;document.removeEventListener('keydown',key);const E=pkEnd(me,op);SFX.medal(E.t);show(['pqGo']);
    $('pqMsg').textContent=E.txt;$('pqGo').textContent='결과 보기';$('pqGo').onclick=()=>done(E.t);};
  $('pqGo').onclick=shoot;
  const loop=now=>{if(!live||!box.isConnected){live=false;document.removeEventListener('keydown',key);return;}
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(ph==='power'){pw+=pd*(1.05+me.length*.12)*dt;if(pw>1){pw=1;pd=-1;}if(pw<0){pw=0;pd=1;}$('pqNd').style.left=(pw*100)+'%';}
    if(ph==='keep'){tm-=dt;$('pqTf').style.width=Math.max(0,tm/tmax*100)+'%';if(tm<=0)kick();}
    requestAnimationFrame(loop);};
  next();requestAnimationFrame(loop);}
// 시뮬레이션: 우리 키커는 55% 확률로 초록 칸에 맞추고, 우리 골키퍼는 55% 확률로 키커의 시선을 따라 몸을 날린다
function simPK(){const me=[],op=[],lines=[],mk=(g,w,ours)=>'<b class="'+(g===!!ours?'g':'x')+'">'+(g?'골':w)+'</b>';
  while(!pkOver(me,op)){const rd=me.length+1,z=Math.random()<.65?[3,5][Math.floor(Math.random()*2)]:Math.floor(Math.random()*6),[lo,hi]=PK_SW(z/3|0),
      p=Math.random()<.55?lo+Math.random()*(hi-lo):Math.random()<.5?Math.random()*lo:hi+Math.random()*(1-hi),s=pkShot(z,p);me.push(s.goal);
    let ln='<span class="k">'+(rd>PK_N?'서든데스':rd+'번째')+'</span>우리 '+PK_ZN[z]+' '+mk(s.goal,s.miss?'실축':'선방에 막힘',1);
    if(!pkOver(me,op)){const o=pkOpp(),d=Math.random()<.55?o.tl:Math.floor(Math.random()*3),k=pkKeep(d,o);op.push(k.goal);ln+=' · 상대 '+mk(k.goal,k.miss?'실축':'우리가 막음');}
    lines.push(ln);}
  const E=pkEnd(me,op);return {lines:lines,head:E.txt,t:E.t};}

