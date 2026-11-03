/* ---------- 미니게임 「격리 탈출」: 극악 난이도 회피 퍼즐 ----------
   메인 화면의 부제 「한 번의 인생, 한 나라의 운명」을 3초 동안 꾹 누르고 있으면 열린다(게임 → 미니게임에서도 할 수 있다).
   격리 병동에 갇힌 대통령(파란 네모)이 바이러스(붉은 공)를 피해 떨어진 백신을 모두 챙기고 브리핑룸(금빛)으로 가야 한다.
   · 닿으면 바로 감염(죽음). 마지막에 지난 소독 구역(초록)에서 다시 시작하고, 그 뒤에 주운 백신은 제자리로 돌아간다.
   · 바이러스는 정해진 길만 오간다(무작위 없음). 단계 8개, 모두 풀이가 있는지 tools/qxsolve.js로 확인했다.
   · 움직이기: 화면 어디든 손가락(마우스)을 대고 그 자리에서 끄는 방향으로(떠 있는 조이스틱). 키보드는 방향키 · WASD.
   · 세로 화면이면 판을 90° 돌려 크게 그린다(출발이 위, 출구가 아래). 손가락 · 방향키는 늘 화면 기준 방향.
   기록: 1단계부터 이어서 한 판(완주 · 그만둠)은 '깬 단계 → 적은 감염 → 짧은 시간'으로 명예의 전당에 오른다(score = 깬 단계×1000 − 감염(최대 999)).
   단계 골라 연습한 판은 보내지 않는다. 이 기기의 기록은 MEM.qx. */
// 둥근 네모(오래된 브라우저에는 roundRect가 없다)
const qxRR=(x,a,b,c,d,r)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,c,d,r);else x.rect(a,b,c,d);};
const qxTime=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
function qxMem(){let m=MEM.qx;if(!m||m.v!==1)m=MEM.qx={v:1,reach:1,runs:0,clears:0,bestD:null,bestS:null,bestLv:0};return m;}
function qxOpen(back){if(document.getElementById('qx'))return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);back=back||home;
  try{bgmSet(BGM.trk,false);}catch(e){}
  const NL=QX_LV.length,w=document.createElement('div');w.id='qx';w.className='qx';w.setAttribute('role','dialog');w.setAttribute('aria-label','격리 탈출');
  w.innerHTML='<canvas id="qxC"></canvas><div class="qx-hud"><button type="button" class="qx-x" id="qxX" aria-label="미니게임으로">✕</button>'+
    '<div class="qx-mid"><b id="qxL"></b><small><span id="qxD"></span><span id="qxK"></span><span id="qxT"></span></small></div>'+
    '<div class="qx-r"><button type="button" class="qx-p" id="qxP" aria-label="일시정지"><i></i><i></i></button></div></div>'+
    '<div class="qx-ban" id="qxBan" aria-live="polite"></div><div class="qx-ov" id="qxOv"></div>';
  document.body.appendChild(w);document.body.style.overflow='hidden';
  const $=id=>document.getElementById(id),cv=$('qxC'),g=cv.getContext('2d'),D=Math.min(2,window.devicePixelRatio||1),FF=getComputedStyle(document.body).fontFamily;
  // ----- 상태 -----
  let st='brief',li=0,LV=null,MAP=null,ZID=null,ZN=[],CO=[],got=[],cpGot=[],cpZ=-1,spawn=null,P=null,lt=0,tt=0,deaths=0,ldeaths=0,full=false,cleared=0,
    deadT=0,clrT=0,lockT=0,FX=[],POP=[],keys={},joy=null,shake=0,live=true,prev=0,raf=0,T=0,banT=0,hudK='';
  // ----- 판 읽기: 벽 · 구역(이어진 S/C/E 칸 묶음) · 백신 -----
  const wall=(i,j)=>j<0||j>=QX_GH||i<0||i>=QX_GW||MAP[j][i]==='#';
  const boxWall=(x,y)=>{for(let i=Math.floor(x-QX_H);i<=Math.floor(x+QX_H-1e-9);i++)for(let j=Math.floor(y-QX_H);j<=Math.floor(y+QX_H-1e-9);j++)if(wall(i,j))return true;return false;};
  const parse=()=>{MAP=LV.m;ZID=MAP.map(r=>Array(r.length).fill(-1));ZN=[];
    for(let j=0;j<QX_GH;j++)for(let i=0;i<QX_GW;i++){const ch=MAP[j][i];if('SCE'.indexOf(ch)<0||ZID[j][i]>=0)continue;
      const z={t:ch,cells:[]},id=ZN.length,q=[[i,j]];ZID[j][i]=id;
      while(q.length){const [a,b]=q.pop();z.cells.push([a,b]);[[1,0],[-1,0],[0,1],[0,-1]].forEach(([u,v])=>{const x=a+u,y=b+v;if(x>=0&&y>=0&&x<QX_GW&&y<QX_GH&&MAP[y][x]===ch&&ZID[y][x]<0){ZID[y][x]=id;q.push([x,y]);}});}
      const cx=z.cells.reduce((s,c)=>s+c[0]+.5,0)/z.cells.length,cy=z.cells.reduce((s,c)=>s+c[1]+.5,0)/z.cells.length;
      const b=z.cells.reduce((p,c)=>Math.hypot(c[0]+.5-cx,c[1]+.5-cy)<Math.hypot(p[0]+.5-cx,p[1]+.5-cy)?c:p);
      z.sp={x:b[0]+.5,y:b[1]+.5};z.cx=cx;z.cy=cy;ZN.push(z);}
    CO=LV.c.map(c=>({x:c[0],y:c[1]}));MAP.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='*')CO.push({x:i+.5,y:j+.5});}));};
  // ----- 화면 맞추기: 가로 20 × 세로 12칸 판을 그대로(가로 화면) 또는 90° 돌려(세로 화면) 가장 크게 -----
  let W=0,H=0,cs=20,rot=false,ox=0,oy=0,bw=0,bh=0,BOARD=null,SPR={};
  const toS=(x,y)=>rot?[ox+(QX_GH-y)*cs,oy+x*cs]:[ox+x*cs,oy+y*cs];
  const fit=()=>{W=w.clientWidth;H=w.clientHeight;cv.width=Math.round(W*D);cv.height=Math.round(H*D);cv.style.width=W+'px';cv.style.height=H+'px';
    const top=W<520?62:70,aw=W-16,ah=H-top-12;const cL=Math.min(aw/QX_GW,ah/QX_GH),cP=Math.min(aw/QX_GH,ah/QX_GW);
    rot=cP>cL*1.06;cs=rot?cP:cL;bw=(rot?QX_GH:QX_GW)*cs;bh=(rot?QX_GW:QX_GH)*cs;ox=Math.round((W-bw)/2);oy=Math.round(top+(ah-bh)/2);mkSpr();if(LV)mkBoard();};
  const spr=(n,f)=>{const c=document.createElement('canvas');c.width=c.height=Math.ceil(n*D);const x=c.getContext('2d');x.setTransform(D,0,0,D,0,0);f(x,n);return c;};
  const mkSpr=()=>{
    // 바이러스: 붉은 몸통(지름의 60%)에 돌기 8개
    SPR.v=spr(64,(x,n)=>{const c=n/2,R=n*.3;x.translate(c,c);x.strokeStyle='#7d1622';x.lineWidth=n*.05;x.lineCap='round';x.fillStyle='#e0566a';
      for(let k=0;k<8;k++){const a=k*Math.PI/4,c1=Math.cos(a),s1=Math.sin(a);x.beginPath();x.moveTo(c1*R*.9,s1*R*.9);x.lineTo(c1*R*1.42,s1*R*1.42);x.stroke();x.beginPath();x.arc(c1*R*1.48,s1*R*1.48,n*.055,0,6.283);x.fill();x.stroke();}
      const gr=x.createRadialGradient(-R*.35,-R*.35,R*.1,0,0,R);gr.addColorStop(0,'#ff9aa6');gr.addColorStop(.55,'#d8344b');gr.addColorStop(1,'#9b1b2c');
      x.beginPath();x.arc(0,0,R,0,6.283);x.fillStyle=gr;x.fill();x.lineWidth=n*.045;x.strokeStyle='#5c0f19';x.stroke();
      x.fillStyle='rgba(255,220,225,.55)';[[-.3,.2],[.25,-.3],[.2,.32]].forEach(([u,v])=>{x.beginPath();x.arc(u*R,v*R,R*.13,0,6.283);x.fill();});});
    // 백신 병: 흰 뚜껑 · 하늘색 약
    SPR.k=spr(48,(x,n)=>{const c=n/2;x.translate(c,c);const bw2=n*.34,bh2=n*.52;
      x.fillStyle='rgba(120,220,255,.28)';x.beginPath();x.arc(0,n*.04,n*.46,0,6.283);x.fill();
      x.fillStyle='#eef6fb';x.strokeStyle='#1f4f6e';x.lineWidth=n*.045;qxRR(x,-bw2/2,-bh2/2+n*.08,bw2,bh2,n*.06);x.fill();x.stroke();
      x.fillStyle='#43c2f0';x.fillRect(-bw2/2+n*.03,-bh2/2+n*.26,bw2-n*.06,bh2-n*.22);
      x.fillStyle='#f6f2e6';qxRR(x,-bw2*.42,-bh2/2-n*.06,bw2*.84,n*.15,n*.03);x.fill();x.stroke();
      x.fillStyle='rgba(255,255,255,.8)';x.fillRect(-bw2/2+n*.06,-bh2/2+n*.2,n*.04,bh2*.55);});};
  // 판 바탕(바닥 타일 · 벽 · 구역)은 단계가 바뀌거나 크기가 바뀔 때만 그린다
  const mkBoard=()=>{const c=document.createElement('canvas');c.width=Math.ceil(bw*D);c.height=Math.ceil(bh*D);const x=c.getContext('2d');
    if(rot)x.setTransform(0,cs*D,-cs*D,0,QX_GH*cs*D,0);else x.setTransform(cs*D,0,0,cs*D,0,0);
    const ZC={S:['#cfe0f5','#c3d6ef'],C:['#c9ead6','#bde2cb'],E:['#f6e3a6','#eed68e']};
    for(let j=0;j<QX_GH;j++)for(let i=0;i<QX_GW;i++){const ch=MAP[j][i],od=(i+j)%2;
      if(ch==='#'){x.fillStyle='#1b2232';x.fillRect(i,j,1.02,1.02);continue;}
      x.fillStyle=ZC[ch]?ZC[ch][od]:od?'#e6e9ee':'#f3f4f6';x.fillRect(i,j,1.02,1.02);}
    // 소독 구역 빗금
    x.save();x.strokeStyle='rgba(60,140,95,.16)';x.lineWidth=.08;for(let j=0;j<QX_GH;j++)for(let i=0;i<QX_GW;i++)if(MAP[j][i]==='C'){x.beginPath();x.moveTo(i,j+1);x.lineTo(i+1,j);x.moveTo(i,j+.5);x.lineTo(i+.5,j);x.moveTo(i+.5,j+1);x.lineTo(i+1,j+.5);x.stroke();}x.restore();
    // 벽과 바닥 사이: 바닥 쪽에 옅은 그림자, 경계에 진한 선
    for(let j=0;j<QX_GH;j++)for(let i=0;i<QX_GW;i++){if(MAP[j][i]==='#')continue;
      if(wall(i,j-1)){x.fillStyle='rgba(15,20,35,.14)';x.fillRect(i,j,1,.14);}if(wall(i-1,j)){x.fillStyle='rgba(15,20,35,.09)';x.fillRect(i,j,.1,1);}
      x.strokeStyle='#0b0f18';x.lineWidth=.09;x.beginPath();if(wall(i,j-1)){x.moveTo(i,j);x.lineTo(i+1,j);}if(wall(i,j+1)){x.moveTo(i,j+1);x.lineTo(i+1,j+1);}
      if(wall(i-1,j)){x.moveTo(i,j);x.lineTo(i,j+1);}if(wall(i+1,j)){x.moveTo(i+1,j);x.lineTo(i+1,j+1);}x.stroke();}
    BOARD=c;};
  // ----- 화면 윗줄 -----
  const hud=()=>{if(!LV)return;const k=li+'|'+deaths+'|'+got.filter(Boolean).length+'|'+Math.floor(tt);if(k===hudK)return;hudK=k;
    $('qxL').textContent=(li+1)+' / '+NL+' · '+LV.n;$('qxD').innerHTML='감염 <b>'+deaths+'</b>';
    $('qxK').innerHTML=CO.length?'백신 <b>'+got.filter(Boolean).length+'/'+CO.length+'</b>':'';$('qxT').textContent=qxTime(tt);};
  const ov=h=>{$('qxOv').innerHTML=h;$('qxOv').style.display=h?'flex':'none';};
  const ban=(s,sub)=>{const b=$('qxBan');b.innerHTML='<b>'+s+'</b>'+(sub?'<span>'+sub+'</span>':'');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');banT=2;};
  const pop=(s,x,y,c)=>{if(POP.length<16)POP.push({s:s,x:x,y:y,c:c||'#fff',l:1});};
  const burst=(x,y,n,c,sp)=>{for(let i=0;i<n&&FX.length<200;i++){const a=Math.random()*6.283,v=(sp||5)*(.3+Math.random());FX.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.45+Math.random()*.4,c:c});}};
  const snd=f=>{try{f();}catch(e){}};
  // ----- 단계 -----
  const load=i=>{li=i;LV=QX_LV[i];parse();const S=ZN.find(z=>z.t==='S');cpZ=ZN.indexOf(S);spawn=S.sp;P={x:spawn.x,y:spawn.y};
    got=CO.map(()=>0);cpGot=got.slice();lt=0;ldeaths=0;FX=[];POP=[];hudK='';mkBoard();hud();st='run';ban((i+1)+'단계 · '+LV.n,LV.s);};
  const start=(i,isFull)=>{try{aInit();SFX.click();}catch(e){}ov('');full=isFull;tt=0;deaths=0;cleared=0;keys={};joy=null;load(i);};
  const die=()=>{if(st!=='run')return;st='dead';deadT=.8;deaths++;ldeaths++;shake=.35;burst(P.x,P.y,26,'#e0566a',5.5);burst(P.x,P.y,10,'#2f5fb3',3.5);
    pop('감염!',P.x,P.y-.6,'#ff8a98');vib(40);snd(()=>tone(260,'sawtooth',.28,.07,0,90));};
  const respawn=()=>{P={x:spawn.x,y:spawn.y};got=cpGot.slice();st='run';hudK='';};
  const clear=()=>{st='clear';clrT=1.5;cleared=Math.max(cleared,li+1);const m=qxMem();if(li+2>m.reach)m.reach=Math.min(NL,li+2);msave();
    burst(P.x,P.y,30,'#f2c94c',6);snd(()=>[523,659,784,1047].forEach((f,i)=>tone(f,'triangle',.22,.08,i*.08)));
    ban(li+1<NL?'탈출 성공':'모든 병동 탈출!',ldeaths?'이번 단계 감염 '+ldeaths+'번':'한 번도 감염되지 않았다');};
  // ----- 한 판 끝(완주 · 그만둠) -----
  const end=(win,quit)=>{if(st==='end'||st==='brief'||st==='sel')return;st='end';const m=qxMem();m.runs++;
    let nb=false;if(full&&win){m.clears++;if(m.bestD===null||deaths<m.bestD||(deaths===m.bestD&&tt<m.bestS)){nb=true;m.bestD=deaths;m.bestS=Math.round(tt*10)/10;}}
    if(full&&cleared>m.bestLv)m.bestLv=cleared;msave();
    // 1단계부터 이어서 한 판만 명예의 전당에 보낸다. 시험(window.__qxDbg) 판 · 10초도 안 된 판 · 한 단계도 못 깬 판은 보내지 않는다
    if(full&&!window.__qxDbg&&tt>=10&&cleared>=1)sendArcade('qx',{score:cleared*1000-Math.min(999,deaths),sec:Math.round(tt*10)/10,win:!!win,detail:(win?'완주':cleared+'단계')+' · 감염 '+deaths+'번 · '+qxTime(tt)});
    if(win)snd(()=>[784,988,1175,1568].forEach((f,i)=>tone(f,'triangle',.4,.1,i*.1)));
    setTimeout(()=>{if(!live)return;
      const head=win?(full?(nb?'최고 기록!':'완주'):'연습 끝'):'여기까지';
      ov('<div class="qx-card"><span class="qx-k">'+head+'</span><h2>'+(win?'격리 병동을 모두 빠져나왔다':cleared?cleared+'단계까지 탈출':'아직 병동 안')+'</h2>'+
        '<div class="qx-big">'+deaths+'<small>번 감염</small></div>'+
        '<div class="qx-b"><span>깬 단계 <b>'+cleared+' / '+NL+'</b></span><span>걸린 시간 <b>'+qxTime(tt)+'</b></span>'+(m.bestD!==null?'<span>완주 최소 감염 <b>'+m.bestD+'번</b></span>':'')+'</div>'+
        (full?'':'<p class="qx-note">단계를 골라 한 연습은 명예의 전당에 오르지 않아요.</p>')+
        '<button type="button" class="pri" id="qxAg">다시 도전</button><button type="button" id="qxOut">미니게임으로</button></div>');
      $('qxAg').onclick=()=>{try{SFX.click();}catch(e){}brief();};$('qxOut').onclick=close;},quit?60:1200);};
  // ----- 안내 · 단계 고르기 -----
  const brief=()=>{st='brief';const m=qxMem();ov('<div class="qx-card"><span class="qx-k">미니게임 · 극악 난이도</span><h2>격리 탈출</h2>'+
    '<p class="qx-s">격리 병동에 갇힌 대통령. 바이러스를 피해 떨어진 백신을 모두 챙겨 브리핑룸으로 가야 한다.</p>'+
    '<ul><li>화면 어디든 <b>손가락(마우스)을 대고 끄는 방향</b>으로 움직인다. 키보드는 <b>방향키 · WASD</b>.</li>'+
    '<li>바이러스에 닿으면 바로 <b>감염</b>. 지난 <b>소독 구역</b>(초록)에서 다시 시작한다.</li>'+
    '<li><b>백신</b>을 모두 챙겨야 <b>브리핑룸</b>(금빛) 문이 열린다. 감염되면 소독 구역 뒤에 주운 백신은 제자리로.</li>'+
    '<li>바이러스는 정해진 길만 오간다. 모든 단계에 길은 있다. <b>'+NL+'단계</b>를 적게 감염될수록 잘한 것.</li></ul>'+
    '<div class="qx-b"><span>완주 <b>'+(m.clears||0)+'번</b></span>'+(m.bestD!==null?'<span>최소 감염 <b>'+m.bestD+'번</b></span>':m.bestLv?'<span>최고 <b>'+m.bestLv+'단계</b></span>':'')+'</div>'+
    '<button type="button" class="pri" id="qxGo">1단계부터 도전</button>'+(m.reach>1?'<button type="button" id="qxSel">단계 골라 연습</button>':'')+'<button type="button" id="qxBack">미니게임으로</button></div>');
    $('qxGo').onclick=()=>start(0,true);if($('qxSel'))$('qxSel').onclick=()=>{try{SFX.click();}catch(e){}sel();};$('qxBack').onclick=close;
    setTimeout(()=>{const b=$('qxGo');if(b)try{b.focus({preventScroll:true});}catch(e){}},60);};
  const sel=()=>{st='sel';const m=qxMem();ov('<div class="qx-card"><span class="qx-k">연습</span><h2>단계 고르기</h2><p class="qx-s">가 본 단계까지 고를 수 있어요. 연습 기록은 명예의 전당에 오르지 않아요.</p>'+
    '<div class="qx-lv">'+QX_LV.map((L,i)=>'<button type="button" data-l="'+i+'"'+(i<m.reach?'':' disabled')+'><b>'+(i+1)+'</b><span>'+(i<m.reach?L.n:'잠김')+'</span></button>').join('')+'</div>'+
    '<button type="button" id="qxSB">뒤로</button></div>');
    $('qxOv').querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>start(+b.dataset.l,false));$('qxSB').onclick=()=>{try{SFX.click();}catch(e){}brief();};};
  const pause=on=>{if(on&&(st==='run'||st==='dead')){pst=st;st='pause';ov('<div class="qx-card sm"><span class="qx-k">잠깐</span><h2>쉬는 중</h2><p class="qx-s">'+(li+1)+'단계 · 감염 '+deaths+'번 · '+qxTime(tt)+'</p>'+
      '<button type="button" class="pri" id="qxRe">계속하기</button><button type="button" id="qxRs">이 단계 처음부터</button><button type="button" id="qxQ">그만두기</button></div>');
      $('qxRe').onclick=()=>pause(false);$('qxRs').onclick=()=>{ov('');const d=deaths;load(li);deaths=d;hudK='';};$('qxQ').onclick=()=>{ov('');st=pst;end(false,true);};}
    else if(!on&&st==='pause'){ov('');st=pst;prev=performance.now();}};
  let pst='run';
  const close=()=>{try{SFX.back();}catch(e){}live=false;cancelAnimationFrame(raf);w.remove();document.body.style.overflow='';document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);
    removeEventListener('resize',onR);document.removeEventListener('visibilitychange',vis);back();};
  $('qxX').onclick=()=>{if(st==='run'||st==='dead'){pause(true);return;}if(st==='pause'){pause(false);return;}close();};
  $('qxP').onclick=()=>{try{SFX.click();}catch(e){}if(st==='run'||st==='dead')pause(true);else if(st==='pause')pause(false);};
  // ----- 입력: 떠 있는 조이스틱(누른 자리 기준으로 끄는 방향) · 방향키 -----
  const JR=34;
  cv.addEventListener('pointerdown',e=>{if(st!=='run'&&st!=='dead'&&st!=='clear')return;e.preventDefault();try{cv.setPointerCapture(e.pointerId);}catch(x){}joy={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY};});
  cv.addEventListener('pointermove',e=>{if(!joy||e.pointerId!==joy.id)return;joy.x=e.clientX;joy.y=e.clientY;
    // 손가락이 멀리 끌려가면 기준점도 따라온다(방향을 바로 바꿀 수 있게)
    const dx=joy.x-joy.x0,dy=joy.y-joy.y0,d=Math.hypot(dx,dy);if(d>JR*1.6){joy.x0=joy.x-dx/d*JR*1.6;joy.y0=joy.y-dy/d*JR*1.6;}});
  const up=e=>{if(joy&&e.pointerId===joy.id)joy=null;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
  const KM={ArrowLeft:'l',a:'l',A:'l',ArrowRight:'r',d:'r',D:'r',ArrowUp:'u',w:'u',W:'u',ArrowDown:'dn',s:'dn',S:'dn'};
  const kd=e=>{if(e.key==='Escape'){e.preventDefault();if(st==='run'||st==='dead')pause(true);else if(st==='pause')pause(false);else if(st==='sel')brief();else if(st==='brief')close();return;}
      if((e.key==='Enter'||e.key===' ')&&st==='brief'&&$('qxGo')&&document.activeElement&&!document.activeElement.closest('.qx-card')){e.preventDefault();$('qxGo').click();return;}
      if(e.key==='p'||e.key==='P'){if(st==='run'||st==='dead')pause(true);else if(st==='pause')pause(false);return;}
      const a=KM[e.key];if(!a)return;e.preventDefault();keys[a]=1;},
    ku=e=>{const a=KM[e.key];if(a)keys[a]=0;};
  document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
  const vis=()=>{if(document.hidden){keys={};joy=null;pause(true);}};document.addEventListener('visibilitychange',vis);
  let rt=0;const onR=()=>{clearTimeout(rt);rt=setTimeout(fit,120);};addEventListener('resize',onR);
  // 화면 방향(손가락 · 방향키)을 판 방향으로. 세로 화면이면 판이 시계 방향으로 90° 돌아가 있다
  const dir=()=>{let sx=(keys.r?1:0)-(keys.l?1:0),sy=(keys.dn?1:0)-(keys.u?1:0);
    if(joy){const dx=joy.x-joy.x0,dy=joy.y-joy.y0,d=Math.hypot(dx,dy);if(d>6){const k=Math.min(1,(d-6)/(JR-6))*1.3/d;sx+=dx*k;sy+=dy*k;}}
    sx=Math.max(-1,Math.min(1,sx));sy=Math.max(-1,Math.min(1,sy));return rot?[sy,-sx]:[sx,sy];};
  const moveAx=(ax,d)=>{if(!d)return;if(ax){P.x+=d;if(boxWall(P.x,P.y))P.x=d>0?Math.floor(P.x+QX_H)-QX_H-1e-4:Math.floor(P.x-QX_H)+1+QX_H+1e-4;}
    else{P.y+=d;if(boxWall(P.x,P.y))P.y=d>0?Math.floor(P.y+QX_H)-QX_H-1e-4:Math.floor(P.y-QX_H)+1+QX_H+1e-4;}};
  const EO=[0,0];
  const step=dt=>{T+=dt;if(banT>0)banT-=dt;if(shake>0)shake=Math.max(0,shake-dt);if(lockT>0)lockT-=dt;
    for(const p of FX){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.9;p.vy*=.9;p.l-=dt;}FX=FX.filter(p=>p.l>0);
    for(const p of POP){p.y-=dt*1.1;p.l-=dt*.9;}POP=POP.filter(p=>p.l>0);
    if(st==='run'||st==='dead'||st==='clear'){lt+=dt;if(st!=='clear')tt+=dt;}
    if(st==='dead'){deadT-=dt;if(deadT<=0)respawn();}
    else if(st==='clear'){clrT-=dt;if(clrT<=0){if(li+1<NL)load(li+1);else end(true);}}
    else if(st==='run'){const [wx,wy]=dir(),n=Math.max(1,Math.ceil(Math.max(Math.abs(wx),Math.abs(wy))*QX_V*dt/.12));
      for(let s=0;s<n;s++){moveAx(1,wx*QX_V*dt/n);moveAx(0,wy*QX_V*dt/n);
        for(const e of LV.e){qxPos(e,lt,EO);if(qxHit(P.x,P.y,EO[0],EO[1],QX_H,QX_R*.9)){die();break;}}if(st!=='run')break;}
      if(st==='run'){CO.forEach((c,k)=>{if(!got[k]&&qxHit(P.x,P.y,c.x,c.y,QX_H,.2)){got[k]=1;pop('백신',c.x,c.y-.4,'#9fe3ff');burst(c.x,c.y,10,'#7fd6ff',3);
          snd(()=>{tone(1320,'triangle',.12,.07);tone(1760,'triangle',.12,.05,.06);});}});
        const z=ZID[Math.floor(P.y)]&&ZID[Math.floor(P.y)][Math.floor(P.x)];
        if(z>=0){const Z=ZN[z];
          if(Z.t==='C'&&z!==cpZ){cpZ=z;spawn=Z.sp;cpGot=got.slice();pop('소독 완료 · 여기서 다시',Z.cx,Z.cy-.8,'#bff0cf');snd(()=>[660,880].forEach((f,i)=>tone(f,'sine',.16,.07,i*.08)));}
          if(Z.t==='E'){if(got.every(Boolean))clear();else if(lockT<=0){lockT=2.2;pop('백신을 모두 챙겨야 문이 열린다',Z.cx,Z.cy-.8,'#ffe08a');snd(()=>tone(196,'square',.12,.05));}}}}}
    hud();};
  // ----- 그리기 -----
  const draw=()=>{g.setTransform(D,0,0,D,0,0);g.fillStyle='#0e1424';g.fillRect(0,0,W,H);if(!LV||!BOARD)return;
    g.save();if(shake>0)g.translate((Math.random()-.5)*shake*14,(Math.random()-.5)*shake*14);
    g.fillStyle='rgba(0,0,0,.35)';g.fillRect(ox+4,oy+6,bw,bh);g.drawImage(BOARD,ox,oy,bw,bh);
    // 구역 이름(늘 화면 기준 똑바로)
    g.textAlign='center';g.textBaseline='middle';const fs=Math.max(10,Math.min(15,cs*.42));g.font='800 '+fs+'px '+FF;
    const allGot=got.every(Boolean);
    ZN.forEach(Z=>{const [x,y]=toS(Z.cx,Z.cy);let t=Z.t==='S'?'격리실':Z.t==='C'?'소독':'브리핑룸';if(Z.t==='E')t+=allGot?' ▶':' 🔒';
      const span=Z.cells.length;if(span<2)return;g.globalAlpha=Z.t==='E'&&allGot?.7+.3*Math.sin(T*5):.5;g.fillStyle=Z.t==='S'?'#3d5f8f':Z.t==='C'?'#2f7a4d':'#8a6512';
      // 좁고 긴 구역이면 글자를 세로로 쓴다
      const sx=new Set(Z.cells.map(c=>c[0])).size,sy=new Set(Z.cells.map(c=>c[1])).size,wS=(rot?sy:sx)*cs,hS=(rot?sx:sy)*cs;
      if(wS<g.measureText(t).width+6&&hS>wS){g.save();g.translate(x,y);g.rotate(-Math.PI/2);g.fillText(t,0,0);g.restore();}else g.fillText(t,x,y);});g.globalAlpha=1;
    // 백신
    CO.forEach((c,k)=>{if(got[k])return;const [x,y]=toS(c.x,c.y),s=cs*.62,b=Math.sin(T*3+k)*cs*.05;g.drawImage(SPR.k,x-s/2,y-s/2+b,s,s);});
    // 바이러스
    const vs=QX_R*cs/.3;for(let q=0;q<LV.e.length;q++){qxPos(LV.e[q],lt,EO);const [x,y]=toS(EO[0],EO[1]);g.save();g.translate(x,y);g.rotate(T*1.6+q*.7);g.drawImage(SPR.v,-vs/2,-vs/2,vs,vs);g.restore();}
    // 대통령: 파란 네모 · 흰 마스크 · 눈
    if(P&&st!=='brief'&&st!=='sel'){const [x,y]=toS(P.x,P.y),s=QX_H*2*cs;let a=1;if(st==='dead')a=Math.max(0,deadT-.45)/.35;
      if(a>0){g.globalAlpha=a;g.fillStyle='#2f5fb3';g.strokeStyle='#0d1a36';g.lineWidth=Math.max(1.5,cs*.07);qxRR(g,x-s/2,y-s/2,s,s,s*.16);g.fill();g.stroke();
        g.fillStyle='#f4f6fa';g.fillRect(x-s*.36,y+s*.04,s*.72,s*.26);g.strokeStyle='rgba(13,26,54,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x-s/2,y+s*.06);g.lineTo(x-s*.36,y+s*.1);g.moveTo(x+s/2,y+s*.06);g.lineTo(x+s*.36,y+s*.1);g.stroke();
        g.fillStyle='#0d1a36';g.fillRect(x-s*.24,y-s*.2,s*.12,s*.14);g.fillRect(x+s*.12,y-s*.2,s*.12,s*.14);g.globalAlpha=1;}}
    // 불티 · 글씨
    for(const p of FX){const [x,y]=toS(p.x,p.y);g.globalAlpha=Math.min(1,p.l*2);g.fillStyle=p.c;const r=Math.max(2,cs*.09);g.fillRect(x-r/2,y-r/2,r,r);}g.globalAlpha=1;
    g.font='800 '+Math.max(12,Math.min(16,cs*.5))+'px '+FF;for(const p of POP){let [x,y]=toS(p.x,p.y);const hw=g.measureText(p.s).width/2+8;x=Math.max(hw,Math.min(W-hw,x));g.globalAlpha=Math.min(1,p.l*1.6);g.lineWidth=3;g.strokeStyle='rgba(8,12,24,.85)';g.strokeText(p.s,x,y);g.fillStyle=p.c;g.fillText(p.s,x,y);}g.globalAlpha=1;
    g.restore();
    // 조이스틱
    if(joy&&(st==='run'||st==='dead')){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=2;g.beginPath();g.arc(joy.x0,joy.y0,JR,0,6.283);g.stroke();
      const dx=joy.x-joy.x0,dy=joy.y-joy.y0,d=Math.hypot(dx,dy),k=d>JR?JR/d:1;g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(joy.x0+dx*k,joy.y0+dy*k,14,0,6.283);g.fill();}};
  const loop=now=>{if(!live||!w.isConnected){live=false;return;}const dt=Math.min(.05,(now-prev)/1000||0);prev=now;
    if(st!=='pause')step(dt);draw();raf=requestAnimationFrame(loop);};
  fit();brief();prev=performance.now();raf=requestAnimationFrame(loop);
  // 시험용: window.__qxDbg를 미리 켜 두면 상태를 밖에서 보고 단계를 바로 연다(이 판은 명예의 전당에 보내지 않는다)
  if(window.__qxDbg)window.__qxDbg={st:()=>st,li:()=>li,P:()=>P,rot:()=>rot,deaths:()=>deaths,got:()=>got.slice(),lt:()=>lt,start:(i,f)=>start(i||0,!!f),
    put:(x,y)=>{P.x=x;P.y=y;},keys:k=>{keys=k||{};},end:(win)=>end(!!win,!win)};}
