/* ---------- 기록 카드: 커리어 결과를 사진 한 장으로(공유 · 저장) ----------
   결산 화면의 '기록 카드 공유'와 '사진으로 저장'이 연다(32-career-end.js가 cardOpen(D, 'share' | 'save')를 부른다).
   카드는 캔버스로 그린다. 기본은 1080×1350(4:5, 카톡 · 피드)이고, 인스타 스토리는 1080×1920(9:16)에 같은 카드를 조금 줄여 올리고
   그 아래에 게임으로 오는 QR 코드를 둔다(웹에서는 스토리에 링크 스티커를 자동으로 붙일 수 없어서). 인스타 단추는 게임 주소도 복사해 두어
   스토리 편집 화면에서 '스티커 → 링크'에 붙여 넣기만 하면 되게 한다.
   디자인 넷: 한지(기본) · 집무실의 밤 · 호외 · 포스터. 고른 디자인은 이 기기에 기억한다(MEM.cardTh).
   공유: 휴대폰은 사진 파일을 붙여 운영체제 공유 창을 연다(카카오톡 · 인스타그램이 그 창에 있다. 인스타는 '스토리'를 고르면 된다).
   공유 창이 없는 PC는 사진을 내려받고 결과 글을 복사한다. */
const CD_TH=[['hanji','한지'],['night','집무실의 밤'],['news','호외'],['poster','포스터']];
const CD_URL='csmsm0518.github.io/pandemic-president';
// 게임 주소(https://csmsm0518.github.io/pandemic-president/)의 QR 코드(오류 정정 M, 33×33). 주소가 늘 같으므로 미리 만들어 둔다(python qrcode)
const CD_QR=["111111101100000010111011101111111","100000101110001001001111101000001","101110100101011010111010101011101","101110101000000100100011101011101","101110100100100010100010101011101","100000100000010110000010101000001","111111101010101010101010101111111","000000001101000111010001100000000","101101110011101101101110001001011","100100000001110011011111001101101","001110110101010010100011101111011","001110000010100101010011011101000","010000101001001010011000110011010","000101011111111001001000100100110","001110111011001000111000001011000","111001010010110100000110011101100","001011101101110000101101111011100","111100000111011110001101111011011","110011100110010110101010010110110","011001010111001111110011111010001","010000111000101110010011000101100","100101001111001110001101011000001","000011111001100100011001101100011","010001011001111100001000001101001","101101100101101001110001111110011","000000001101001110010111100011000","111111101110010001110101101010000","100000101111101101111001100011101","101110100110000111110011111110110","101110101110001011010111100100011","101110101000101111001100111101000","100000100010100001001001101111001","111111101111110011110111001010100"];
const CD_SERIF='"Noto Serif KR","Apple Myungjo",serif',CD_SANS='"Pretendard Variable",Pretendard,"Apple SD Gothic Neo","Malgun Gothic",sans-serif';
let CD_D=null,CD_MODE='share',CD_FMT='card',CD_IMG={};   // CD_IMG: 디자인 · 판형마다 그린 그림(다시 그리지 않게)
const cdTh=()=>CD_TH.some(t=>t[0]===MEM.cardTh)?MEM.cardTh:'hanji';
// 글꼴: 웹 글꼴은 쓰는 글자만 받으므로, 카드에 들어갈 글을 모두 넘겨 미리 받아 둔다(안 받으면 캔버스에 기본 글꼴로 찍힌다)
function cdFonts(D){const t=Object.values(D).join(' ')+JSON.stringify(D.grades)+D.L.n+D.L.k+D.L.era+'0123456789,·→점기선년세임평가업적불명예닮은지도자커리어수최고호외위기일보號外나의인생결과팬데믹대통령당신도해보기';
  const f=[['800 80px','"Noto Serif KR"'],['600 40px','"Noto Serif KR"'],['700 40px','"Pretendard Variable"'],['500 40px','"Pretendard Variable"'],['900 40px','"Pretendard Variable"']];
  try{return Promise.race([Promise.all(f.map(x=>document.fonts.load(x[0]+' '+x[1],t))),new Promise(r=>setTimeout(r,4000))]);}catch(e){return Promise.resolve();}}
// 닮은 지도자 그림: 게임의 SVG 초상화에 공용 정의(무늬 · 자르기)를 붙여 그림 한 장으로 만든다
function cdPortrait(name){return new Promise(res=>{let s=portrait(name,512,0,true);if(!s)return res(null);
  const defs=(document.querySelector('svg defs #pfclip')||{}).parentNode;
  s=s.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/,'$1'+(defs?defs.outerHTML:''));
  const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);});}
// ---- 그리기 도구 ----
const cdF=(c,w,sz,fam)=>{c.font=w+' '+sz+'px '+fam;};
// 한 줄에 maxW를 넘지 않게 글자 크기를 줄인다(min까지). 그래도 넘치면 두 줄로 나눈다. 돌려준 줄들을 lh 간격으로 찍는다
function cdFit(c,t,w,fam,sz,min,maxW,lines){lines=lines||2;let s=sz;cdF(c,w,s,fam);while(c.measureText(t).width>maxW&&s>min){s-=2;cdF(c,w,s,fam);}
  if(c.measureText(t).width<=maxW||lines<2)return {s:s,L:[t]};
  // 두 줄: 띄어쓰기 기준으로 가장 고르게 나눈다
  const W=t.split(' ');let best=null;for(let i=1;i<W.length;i++){const a=W.slice(0,i).join(' '),b=W.slice(i).join(' '),m=Math.max(c.measureText(a).width,c.measureText(b).width);if(!best||m<best.m)best={a:a,b:b,m:m};}
  if(!best)return {s:s,L:[t]};s=sz;cdF(c,w,s,fam);while(Math.max(c.measureText(best.a).width,c.measureText(best.b).width)>maxW&&s>min){s-=2;cdF(c,w,s,fam);}
  return {s:s,L:[best.a,best.b]};}
function cdText(c,t,x,y,o){o=o||{};cdF(c,o.w||'500',o.s||32,o.f||CD_SANS);c.fillStyle=o.c||'#1d1b18';c.textAlign=o.a||'left';c.textBaseline=o.b||'alphabetic';
  if(o.ls){try{c.letterSpacing=o.ls+'px';}catch(e){}}c.fillText(t,x,y);if(o.ls){try{c.letterSpacing='0px';}catch(e){}}}
function cdRound(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function cdPill(c,t,x,y,o){cdF(c,o.w||'700',o.s||28,o.f||CD_SANS);const w=c.measureText(t).width+o.px*2,h=o.s*1.7;const X=o.a==='center'?x-w/2:o.a==='right'?x-w:x;
  cdRound(c,X,y,w,h,h/2);if(o.bg){c.fillStyle=o.bg;c.fill();}if(o.st){c.strokeStyle=o.st;c.lineWidth=o.lw||2;c.stroke();}
  cdText(c,t,X+w/2,y+h/2+1,{s:o.s,w:o.w||'700',c:o.c,a:'center',b:'middle'});return w;}
// 둥근 테 안에 초상화(없으면 이름 첫 글자)
function cdFace(c,im,cx,cy,r,o){o=o||{};c.save();c.beginPath();c.arc(cx,cy,r,0,6.2832);c.closePath();c.fillStyle=o.bg||'#e3d9c6';c.fill();c.clip();
  if(o.filter)c.filter=o.filter;
  if(im)c.drawImage(im,cx-r*1.05,cy-r*0.92,r*2.1,r*2.1);else{cdText(c,(o.n||'?').slice(0,1),cx,cy+r*.12,{s:r,w:'800',f:CD_SERIF,c:'#6e675c',a:'center',b:'middle'});}
  c.restore();c.filter='none';if(o.ring){c.beginPath();c.arc(cx,cy,r+(o.rw||6)/2,0,6.2832);c.strokeStyle=o.ring;c.lineWidth=o.rw||6;c.stroke();}}
// 등급 도장: 붉은 원 두 겹 + 글자, 살짝 기울여
function cdSeal(c,x,y,r,t,sub,col,rot){c.save();c.translate(x,y);c.rotate(rot||0);c.globalAlpha=.9;c.strokeStyle=col;c.lineWidth=r*.07;
  c.beginPath();c.arc(0,0,r,0,6.2832);c.stroke();c.lineWidth=r*.03;c.beginPath();c.arc(0,0,r*.84,0,6.2832);c.stroke();
  cdText(c,t,0,sub?-r*.06:r*.05,{s:r*.9,w:'800',f:CD_SERIF,c:col,a:'center',b:'middle'});
  if(sub)cdText(c,sub,0,r*.56,{s:r*.2,w:'700',c:col,a:'center',b:'middle'});c.restore();}
// 종이 결: 고정된 씨앗으로 짧은 섬유를 뿌린다(같은 카드는 늘 같은 모양)
function cdFiber(c,W,H,col,n,seed){let s=seed||7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};c.save();c.strokeStyle=col;c.lineWidth=1.2;
  for(let i=0;i<n;i++){const x=r()*W,y=r()*H,l=6+r()*22,a=r()*6.28;c.globalAlpha=.05+r()*.08;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}c.restore();}
function cdMix(hex,k,to){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),a=p(hex),b=p(to||'#000000');return 'rgb('+a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')+')';}
const cdSc=n=>Number(n).toLocaleString('ko-KR');
function cdQR(c,x,y,sz){const n=CD_QR.length,m=sz/(n+4);c.fillStyle='#fff';cdRound(c,x,y,sz,sz,sz*.06);c.fill();c.fillStyle='#111';
  CD_QR.forEach((r,i)=>{for(let j=0;j<n;j++)if(r[j]==='1')c.fillRect(Math.floor(x+(j+2)*m),Math.floor(y+(i+2)*m),Math.ceil(m),Math.ceil(m));});}
// 인스타 스토리 판형: 카드를 흐리게 깐 바탕 위에 카드를 82%로 올리고, 아래에 QR 판. 맨 위 · 맨 아래는 스토리 화면의 글자 · 단추가 덮으므로 비운다
function cdStory(card){const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;const c=cv.getContext('2d'),W=1080,H=1920;
  c.save();c.filter='blur(36px) brightness(.55) saturate(1.1)';c.drawImage(card,-W*.25,0,W*1.5,H);c.restore();c.fillStyle='rgba(0,0,0,.18)';c.fillRect(0,0,W,H);
  const k=.82,cw=W*k,ch=1350*k,x=(W-cw)/2,y=236;
  cdText(c,'나의 인생 결과',W/2,y-36,{s:40,w:'800',f:CD_SERIF,c:'#fff',a:'center'});
  c.save();c.shadowColor='rgba(0,0,0,.45)';c.shadowBlur=40;c.shadowOffsetY=14;cdRound(c,x,y,cw,ch,22);c.fillStyle='#000';c.fill();c.restore();
  c.save();cdRound(c,x,y,cw,ch,22);c.clip();c.drawImage(card,x,y,cw,ch);c.restore();
  // QR 판: 흰 바탕 둥근 상자에 QR과 안내
  const py=y+ch+36,pw=cw,ph=200;c.save();c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=24;cdRound(c,x,py,pw,ph,22);c.fillStyle='#fff';c.fill();c.restore();
  cdQR(c,x+18,py+18,ph-36);
  cdText(c,'카메라로 찍으면 바로 시작',x+ph+14,py+76,{s:36,w:'800',c:'#1d1b18'});
  cdText(c,'팬데믹 대통령 · 한 번의 인생, 한 나라의 운명',x+ph+14,py+122,{s:24,w:'600',c:'#55504a'});
  cdText(c,CD_URL,x+ph+14,py+160,{s:22,w:'500',c:'#8a7f6d'});
  return cv;}
/* ----- 디자인 1 · 한지: 게임의 종이 화면을 그대로. 금 테두리 두 겹, 붉은 낙관 도장 ----- */
function cdHanji(c,W,H,D,im){const oy=(H-1350)/2;
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#f6efe1');g.addColorStop(1,'#ebe1cf');c.fillStyle=g;c.fillRect(0,0,W,H);
  cdFiber(c,W,H,'#8a6a24',900,11);
  const vg=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(90,60,20,.12)');c.fillStyle=vg;c.fillRect(0,0,W,H);
  c.strokeStyle='#a8832f';c.lineWidth=4;c.strokeRect(36,36,W-72,H-72);c.lineWidth=1.5;c.strokeRect(52,52,W-104,H-104);
  const y=oy;
  cdText(c,'팬데믹 대통령',96,y+132,{s:30,w:'800',c:'#a8321f',ls:6});
  cdPill(c,D.stageTag,W-96,y+100,{s:24,px:16,c:'#2f4a6b',st:'#2f4a6b',lw:2,a:'right'});
  cdText(c,D.who,96,y+200,{s:40,w:'600',f:CD_SERIF,c:'#3a332a'});
  cdText(c,D.bg,96,y+248,{s:28,w:'500',c:'#6e675c'});
  const E=cdFit(c,D.ending,'800',CD_SERIF,96,56,W-192);E.L.forEach((l,i)=>cdText(c,l,96,y+360+i*E.s*1.18,{s:E.s,w:'800',f:CD_SERIF,c:'#1d1b18'}));
  const yy=y+360+(E.L.length-1)*E.s*1.18;
  cdText(c,D.sub+' · '+D.age,96,yy+62,{s:30,w:'600',c:'#3a332a'});
  cdText(c,'겪은 위기 · '+D.scen,96,yy+108,{s:26,w:'500',c:'#6e675c'});
  c.strokeStyle='#a8832f';c.lineWidth=2;c.beginPath();c.moveTo(96,yy+150);c.lineTo(W-96,yy+150);c.stroke();
  // 닮은 지도자
  const ly=yy+190;cdFace(c,im,96+130,ly+130,130,{ring:D.L.col,rw:8,n:D.L.n});
  cdText(c,'당신과 닮은 지도자',400,ly+62,{s:26,w:'600',c:'#6e675c'});
  const N=cdFit(c,D.L.n,'800',CD_SERIF,78,44,W-96-400,1);cdText(c,N.L[0],400,ly+150,{s:N.s,w:'800',f:CD_SERIF,c:'#1d1b18'});
  cdPill(c,D.L.k,400,ly+178,{s:28,px:18,bg:D.L.col,c:'#fff'});
  cdText(c,D.L.era,400,ly+266,{s:24,w:'500',c:'#6e675c'});
  // 임기별 평가: 작은 도장 줄
  const gy=ly+330,n=D.grades.length,gr=n>6?30:38,gap=Math.min(110,(W-192-150)/Math.max(1,n));
  cdText(c,'임기별 평가',96,gy+12,{s:26,w:'700',c:'#3a332a',b:'middle'});
  cdText(c,'업적 '+D.good+' · 불명예 '+D.bad,W-96,gy+12,{s:26,w:'600',c:'#6e675c',a:'right',b:'middle'});
  D.grades.forEach((x,i)=>{const cx=96+190+gr+i*gap;c.beginPath();c.arc(cx,gy+12,gr,0,6.2832);c.fillStyle=GCOL[x[1]]||'#6e675c';c.fill();
    cdText(c,x[1],cx,gy+14,{s:gr*1.1,w:'800',f:CD_SERIF,c:'#fff',a:'center',b:'middle'});cdText(c,x[0],cx,gy+gr+30,{s:20,w:'600',c:'#6e675c',a:'center'});});
  // 점수와 낙관
  const sy=y+1350-170;
  cdText(c,'커리어 점수'+(D.newBest?' · 최고 기록':''),96,sy-74,{s:26,w:'600',c:'#6e675c'});
  cdF(c,'800',118,CD_SERIF);const sw=c.measureText(cdSc(D.score)).width;cdText(c,cdSc(D.score),96,sy+34,{s:118,w:'800',f:CD_SERIF,c:'#1d1b18'});
  cdText(c,'점',96+sw+14,sy+34,{s:40,w:'700',c:'#3a332a'});
  cdSeal(c,W-210,sy-10,96,D.best,'최고 임기','#b3261e',-.16);
  cdText(c,CD_URL+'  ·  '+D.date,W/2,y+1350-74,{s:22,w:'500',c:'#8a7f6d',a:'center'});}

/* ----- 디자인 2 · 집무실의 밤: 엔딩 장면처럼 어두운 바탕에 금빛 빛줄기, 초상화를 가운데 크게 ----- */
function cdNight(c,W,H,D,im){const oy=(H-1350)/2;
  const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1d1912');g.addColorStop(1,'#0a0907');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.save();c.translate(W/2,oy+470);for(let i=0;i<18;i++){c.rotate(Math.PI/9);c.beginPath();c.moveTo(0,0);c.lineTo(-90,-1400);c.lineTo(90,-1400);c.closePath();c.fillStyle='rgba(241,213,137,'+(i%2?.035:.06)+')';c.fill();}c.restore();
  const gl=c.createRadialGradient(W/2,oy+470,40,W/2,oy+470,520);gl.addColorStop(0,'rgba(241,213,137,.28)');gl.addColorStop(1,'rgba(241,213,137,0)');c.fillStyle=gl;c.fillRect(0,0,W,H);
  c.strokeStyle='rgba(201,162,74,.55)';c.lineWidth=2;c.strokeRect(40,40,W-80,H-80);
  const y=oy;
  cdText(c,'팬데믹 대통령 · '+D.stageTag,W/2,y+120,{s:26,w:'700',c:'#c9a24a',a:'center',ls:6});
  cdText(c,D.who,W/2,y+180,{s:36,w:'600',f:CD_SERIF,c:'#efe7d6',a:'center'});
  cdFace(c,im,W/2,y+430,190,{ring:'#c9a24a',rw:8,bg:'#2a2419',n:D.L.n});
  c.beginPath();c.arc(W/2,y+430,212,0,6.2832);c.strokeStyle='rgba(241,213,137,.35)';c.lineWidth=2;c.stroke();
  cdText(c,'닮은 지도자',W/2,y+680,{s:24,w:'600',c:'#c9a24a',a:'center',ls:4});
  const N=cdFit(c,D.L.n,'800',CD_SERIF,74,44,W-200,1);cdText(c,N.L[0],W/2,y+760,{s:N.s,w:'800',f:CD_SERIF,c:'#f1d589',a:'center'});
  cdPill(c,D.L.k,W/2,y+790,{s:26,px:18,st:'#c9a24a',c:'#f1d589',a:'center'});
  const E=cdFit(c,D.ending,'800',CD_SERIF,62,40,W-200);E.L.forEach((l,i)=>cdText(c,l,W/2,y+930+i*E.s*1.2,{s:E.s,w:'800',f:CD_SERIF,c:'#efe7d6',a:'center'}));
  const yy=y+930+(E.L.length-1)*E.s*1.2;
  cdText(c,D.sub+' · '+D.age,W/2,yy+56,{s:28,w:'500',c:'rgba(239,231,214,.75)',a:'center'});
  const n=D.grades.length,gr=26,gap=Math.min(76,(W-240)/Math.max(1,n)),x0=W/2-(n-1)*gap/2;
  D.grades.forEach((x,i)=>{const cx=x0+i*gap;c.beginPath();c.arc(cx,yy+120,gr,0,6.2832);const ok=/[SAB]/.test(x[1]);c.strokeStyle=ok?'#f1d589':'rgba(239,231,214,.45)';c.lineWidth=3;c.stroke();
    cdText(c,x[1],cx,yy+122,{s:30,w:'800',f:CD_SERIF,c:ok?'#f1d589':'#efe7d6',a:'center',b:'middle'});});
  const sg=c.createLinearGradient(0,y+1150,0,y+1260);sg.addColorStop(0,'#f8e6a8');sg.addColorStop(1,'#b8892f');
  cdF(c,'800',112,CD_SERIF);const st=cdSc(D.score),sw=c.measureText(st).width;
  c.fillStyle=sg;c.textAlign='left';c.textBaseline='alphabetic';c.fillText(st,W/2-sw/2-20,y+1252);cdText(c,'점',W/2+sw/2-6,y+1252,{s:38,w:'700',c:'#c9a24a'});
  cdText(c,'커리어 점수'+(D.newBest?' · 최고 기록':'')+'  ·  업적 '+D.good+' · 불명예 '+D.bad,W/2,y+1300,{s:22,w:'500',c:'rgba(239,231,214,.6)',a:'center'});}

/* ----- 디자인 3 · 호외: 게임 속 '위기일보' 신문 1면처럼 ----- */
function cdNews(c,W,H,D,im){const oy=(H-1350)/2;
  c.fillStyle='#f3efe4';c.fillRect(0,0,W,H);cdFiber(c,W,H,'#3a332a',500,23);
  const y=oy,L=70,R=W-70;
  cdText(c,'위기일보',W/2,y+170,{s:118,w:'800',f:CD_SERIF,c:'#1d1b18',a:'center',ls:10});
  c.save();c.translate(R-70,y+96);c.rotate(.08);cdRound(c,-62,-40,124,80,6);c.fillStyle='#b3261e';c.fill();cdText(c,'號外',0,3,{s:44,w:'800',f:CD_SERIF,c:'#fff',a:'center',b:'middle'});c.restore();
  c.fillStyle='#1d1b18';c.fillRect(L,y+205,R-L,6);c.fillRect(L,y+217,R-L,2);
  cdText(c,'팬데믹 대통령 · '+D.stageTag,L,y+258,{s:24,w:'600',c:'#3a332a'});cdText(c,D.date+' 발행',R,y+258,{s:24,w:'600',c:'#3a332a',a:'right'});
  c.fillRect(L,y+280,R-L,2);
  cdPill(c,'속보',L,y+312,{s:26,px:14,bg:'#b3261e',c:'#fff'});
  const E=cdFit(c,D.ending,'800',CD_SERIF,84,48,R-L);E.L.forEach((l,i)=>cdText(c,l,L,y+440+i*E.s*1.15,{s:E.s,w:'800',f:CD_SERIF,c:'#1d1b18'}));
  const yy=y+440+(E.L.length-1)*E.s*1.15;
  cdText(c,D.who+', '+D.sub,L,yy+64,{s:32,w:'700',c:'#3a332a'});
  c.fillRect(L,yy+96,R-L,2);
  // 왼쪽 사진, 오른쪽 기사
  const py=yy+126,pw=400,ph=Math.max(440,y+1350-170-(yy+126)-90);c.fillStyle='#d8d0bf';c.fillRect(L,py,pw,ph);
  if(im){c.save();c.beginPath();c.rect(L,py,pw,ph);c.clip();c.filter='grayscale(1) contrast(1.15) sepia(.25)';c.drawImage(im,L-(ph-pw)/2-20,py+10,ph+40,ph+40);c.restore();c.filter='none';}
  c.strokeStyle='#1d1b18';c.lineWidth=2;c.strokeRect(L,py,pw,ph);
  cdText(c,'▲ 닮은 지도자 '+D.L.n,L,py+ph+38,{s:24,w:'700',c:'#1d1b18'});cdText(c,D.L.k+' · '+D.L.era,L,py+ph+72,{s:22,w:'500',c:'#55504a'});
  const X=L+pw+40,RW=R-X;
  cdText(c,'임기별 평가',X,py+30,{s:26,w:'800',c:'#1d1b18'});
  const gl=D.grades.map(g=>g[0]+' '+g[1]).join(' · '),G=cdFit(c,gl,'600',CD_SANS,30,20,RW);G.L.forEach((l,i)=>cdText(c,l,X,py+78+i*40,{s:G.s,w:'600',c:'#3a332a'}));
  cdText(c,'겪은 위기',X,py+180,{s:26,w:'800',c:'#1d1b18'});
  const S=cdFit(c,D.scen,'500',CD_SANS,28,18,RW);S.L.forEach((l,i)=>cdText(c,l,X,py+226+i*38,{s:S.s,w:'500',c:'#3a332a'}));
  cdText(c,D.age,X,py+320,{s:26,w:'500',c:'#55504a'});
  // 점수 상자
  const by=py+ph-190;c.lineWidth=3;c.strokeRect(X,by,RW,190);
  cdText(c,'커리어 점수'+(D.newBest?' · 최고 기록':''),X+24,by+44,{s:24,w:'700',c:'#3a332a'});
  cdText(c,'최고 '+D.best,X+RW-24,by+44,{s:24,w:'700',c:'#3a332a',a:'right'});
  const P=cdFit(c,cdSc(D.score)+'점','800',CD_SERIF,76,44,RW-48,1);cdText(c,P.L[0],X+24,by+124,{s:P.s,w:'800',f:CD_SERIF,c:'#b3261e'});
  cdText(c,'업적 '+D.good+' · 불명예 '+D.bad,X+24,by+168,{s:22,w:'500',c:'#55504a'});
  c.fillStyle='#1d1b18';c.fillRect(L,y+1350-110,R-L,2);
  cdText(c,'당신의 인생도 호외가 될 수 있다 — '+CD_URL,W/2,y+1350-66,{s:24,w:'600',c:'#3a332a',a:'center'});}

/* ----- 디자인 4 · 포스터: 닮은 지도자의 색으로 가득 채운 큰 글씨 ----- */
function cdPoster(c,W,H,D,im){const oy=(H-1350)/2,col=D.L.col||'#2f4a6b';
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,cdMix(col,.1));g.addColorStop(1,cdMix(col,.55));c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='rgba(255,255,255,.07)';c.beginPath();c.arc(W*.86,oy+300,330,0,6.2832);c.fill();c.beginPath();c.arc(W*.1,H-oy-120,260,0,6.2832);c.fill();
  c.save();c.translate(0,oy+560);c.rotate(-.12);c.fillStyle='rgba(0,0,0,.14)';c.fillRect(-100,0,W+300,190);c.restore();
  const y=oy,L=84;
  cdText(c,'팬데믹 대통령',L,y+128,{s:34,w:'900',c:'#fff',ls:2});
  cdPill(c,D.stageTag,W-84,y+96,{s:24,px:16,st:'rgba(255,255,255,.8)',c:'#fff',a:'right'});
  cdText(c,D.who,L,y+190,{s:32,w:'600',c:'rgba(255,255,255,.85)'});
  // 결말을 큰 글씨로 최대 세 줄
  // 결말: 두 줄 안에 들어가는 가장 큰 글씨(150부터). 짧으면 크게, 길면 줄여서 세 줄까지
  const wrap=sz=>{cdF(c,'900',sz,CD_SANS);const out=[];let cur='';D.ending.split(' ').forEach(w=>{const t=cur?cur+' '+w:w;if(c.measureText(t).width>W-L*2&&cur){out.push(cur);cur=w;}else cur=t;});if(cur)out.push(cur);return out;};
  let s=150,lines=wrap(s);while(s>84&&(lines.length>2||lines.some(l=>{cdF(c,'900',s,CD_SANS);return c.measureText(l).width>W-L*2;}))){s-=6;lines=wrap(s);}
  lines.slice(0,3).forEach((l,i)=>cdText(c,l,L,y+218+s+i*s*1.1,{s:s,w:'900',c:'#fff'}));
  const yy=y+218+s+(Math.min(3,lines.length)-1)*s*1.1;
  cdText(c,D.sub+' · '+D.age,L,yy+70,{s:30,w:'600',c:'rgba(255,255,255,.88)'});
  cdFace(c,im,W-245,y+870,175,{ring:'#fff',rw:10,bg:cdMix(col,.25,'#ffffff'),n:D.L.n});
  cdText(c,'닮은 지도자',L,y+800,{s:26,w:'700',c:'rgba(255,255,255,.75)'});
  const N=cdFit(c,D.L.n,'900',CD_SANS,68,40,W-L-480,1);cdText(c,N.L[0],L,y+878,{s:N.s,w:'900',c:'#fff'});
  cdPill(c,D.L.k,L,y+904,{s:26,px:16,bg:'#fff',c:cdMix(col,.35)});
  let gx=L;D.grades.forEach(x=>{gx+=cdPill(c,x[0]+' '+x[1],gx,y+990,{s:22,px:12,st:'rgba(255,255,255,.7)',c:'#fff'})+10;});
  cdText(c,'커리어 점수'+(D.newBest?' · 최고 기록':''),L,y+1110,{s:26,w:'700',c:'rgba(255,255,255,.8)'});
  cdText(c,'업적 '+D.good+' · 불명예 '+D.bad,W-84,y+1110,{s:26,w:'600',c:'rgba(255,255,255,.85)',a:'right'});
  cdF(c,'900',132,CD_SANS);const st=cdSc(D.score),sw=c.measureText(st).width;cdText(c,st,L,y+1236,{s:132,w:'900',c:'#fff'});
  cdText(c,'점',L+sw+12,y+1236,{s:44,w:'800',c:'#fff'});
  cdText(c,CD_URL+'  ·  '+D.date,L,y+1300,{s:22,w:'500',c:'rgba(255,255,255,.7)'});}
const CD_DRAW={hanji:cdHanji,night:cdNight,news:cdNews,poster:cdPoster};
// 그림 한 장: 디자인 th, 판형 fmt('card' 1080×1350 · 'story' 1080×1920). 결과는 canvas
async function cdRender(D,th,fmt){const key=th+':'+fmt;if(CD_IMG[key])return CD_IMG[key];
  if(fmt==='story')return CD_IMG[key]=cdStory(await cdRender(D,th,'card'));
  await cdFonts(D);const im=await cdPortrait(D.L.n);
  const cv=document.createElement('canvas');cv.width=1080;cv.height=1350;const c=cv.getContext('2d');
  (CD_DRAW[th]||cdHanji)(c,cv.width,cv.height,D,im);return CD_IMG[key]=cv;}
// 공유 창은 누른 순간(사용자 동작 안)에 열어야 아이폰 사파리가 막지 않는다. 그래서 고른 디자인의 사진 파일을 창이 열릴 때 미리 만들어 둔다
let CD_FILE={};
async function cdPrep(D,th){for(const fmt of ['card','story']){const key=th+':'+fmt;if(CD_FILE[key])continue;
  const b=await cdBlob(await cdRender(D,th,fmt));if(b)CD_FILE[key]=new File([b],cdName(fmt),{type:'image/png'});}}
const cdBlob=cv=>new Promise(r=>{try{cv.toBlob(b=>r(b),'image/png');}catch(e){r(null);}});
const cdName=fmt=>'pandemic-president-'+(fmt==='story'?'story':'card')+'-'+D_STAMP()+'.png';
const D_STAMP=()=>{const d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');};
const cdShareText=D=>D.who+' — '+D.ending+' ('+D.sub+') · 커리어 점수 '+cdSc(D.score)+'점 · 닮은 지도자 '+D.L.n+'\n팬데믹 대통령: https://'+CD_URL+'/';
// 공유 창(파일)을 쓸 수 있는가
function cdCanFiles(f){try{return !!(navigator.canShare&&navigator.canShare({files:[f]}));}catch(e){return false;}}
function cdDownload(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);}
const cdIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
/* ----- 창 ----- */
function cardOpen(D,mode){CD_D=D;CD_MODE=mode||'share';CD_FMT='card';CD_IMG={};CD_FILE={};
  const old=document.querySelector('.cd-bg');if(old)old.remove();
  const o=document.createElement('div');o.className='sndp-bg cd-bg';
  o.innerHTML='<div class="sndp cd" role="dialog" aria-modal="true" aria-labelledby="cdT"><div class="sndp-h"><span id="cdT">'+(CD_MODE==='save'?'사진으로 저장':'기록 카드 공유')+'</span><button type="button" class="sndp-x" aria-label="닫기">✕</button></div>'+
    '<div class="cd-pv"><img id="cdImg" alt="기록 카드 미리 보기"><div class="cd-wait" id="cdWait">카드를 그리는 중…</div></div>'+
    '<div class="cd-th" role="radiogroup" aria-label="디자인">'+CD_TH.map(t=>'<button type="button" role="radio" data-t="'+t[0]+'"><i class="cd-sw cd-sw-'+t[0]+'" aria-hidden="true"></i>'+t[1]+'</button>').join('')+'</div>'+
    (CD_MODE==='save'?
      '<div class="cd-fmt" role="radiogroup" aria-label="판형"><button type="button" role="radio" data-f="card">카드 4:5</button><button type="button" role="radio" data-f="story">스토리 9:16</button></div>'+
      '<button type="button" class="pri cd-go" id="cdSave">사진으로 저장</button><p class="cd-tip" id="cdTip">'+(cdIOS()?'공유 창이 열리면 <b>이미지 저장</b>을 누르세요. 안 되면 위 카드를 길게 눌러 저장할 수 있어요.':'저장한 사진은 휴대폰 앨범(다운로드)에 들어가요. 안 되면 위 카드를 길게 눌러 저장할 수 있어요.')+'</p>':
      '<div class="cd-sh"><button type="button" id="cdKakao" class="cd-k"><i aria-hidden="true">'+CD_IC.kakao+'</i><span>카카오톡</span></button>'+
      '<button type="button" id="cdInsta" class="cd-i"><i aria-hidden="true">'+CD_IC.insta+'</i><span>인스타 스토리</span></button>'+
      '<button type="button" id="cdMore"><i aria-hidden="true">'+CD_IC.more+'</i><span>다른 앱</span></button>'+
      '<button type="button" id="cdCopy"><i aria-hidden="true">'+CD_IC.link+'</i><span>글 · 링크 복사</span></button></div>'+
      '<p class="cd-tip" id="cdTip">카카오톡 · 다른 앱: 공유 창에서 앱을 고르면 카드 사진과 결과 글이 함께 가요. 인스타 스토리: 공유 창에서 <b>Instagram → 스토리</b>를 고르세요. 게임 주소가 복사되니 스토리에서 <b>스티커 → 링크</b>에 붙여 넣으면 링크가 걸려요.</p>')+
    '</div>';
  document.body.appendChild(o);const $=s=>o.querySelector(s),img=$('#cdImg'),wait=$('#cdWait');
  const x=()=>{try{SFX.back();}catch(e){}o.remove();};let dn=null;
  o.onpointerdown=e=>{dn=e.target;};o.onclick=e=>{if(e.target===o&&dn===o)x();};$('.sndp-x').onclick=x;
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();x();}});
  let busy=0;
  const draw=async()=>{const th=cdTh(),my=++busy;wait.style.display='flex';
    o.querySelectorAll('.cd-th button').forEach(b=>b.setAttribute('aria-checked',b.dataset.t===th));
    o.querySelectorAll('.cd-fmt button').forEach(b=>b.setAttribute('aria-checked',b.dataset.f===CD_FMT));
    const cv=await cdRender(D,th,CD_MODE==='save'?CD_FMT:'card');if(my!==busy)return;
    img.src=cv.toDataURL('image/png');img.className=CD_MODE==='save'&&CD_FMT==='story'?'st':'';wait.style.display='none';cdPrep(D,th);};
  o.querySelectorAll('.cd-th button').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}MEM.cardTh=b.dataset.t;msave();draw();});
  o.querySelectorAll('.cd-fmt button').forEach(b=>b.onclick=()=>{try{SFX.click();}catch(e){}CD_FMT=b.dataset.f;draw();});
  const tip=(t)=>{const p=$('#cdTip');if(p)p.innerHTML=t;};
  // 파일을 붙여 공유 창을 연다. 공유 창이 없으면(PC) 내려받고 글을 복사한다.
  // 미리 만든 파일이 있으면 기다리지 않고 바로 연다(아이폰은 누른 뒤 시간이 지나면 공유 창을 막는다)
  const send=async(fmt,how)=>{const key=cdTh()+':'+fmt,text=cdShareText(D),link='https://'+CD_URL+'/';
    if(how==='insta')try{navigator.clipboard.writeText(link).catch(()=>{});}catch(e){}   // 기다리지 않는다(공유 창을 먼저 연다)
    const go=f=>navigator.share(how==='insta'?{files:[f]}:{files:[f],text:text,title:'팬데믹 대통령 — 나의 인생 결과'});
    // 공유 창을 한 번만 연다. 사용자가 닫으면(AbortError) 그대로 끝, 그 밖의 이유로 막히면 아래처럼 내려받기 + 복사로 넘어간다
    let f=CD_FILE[key];
    if(!f){const bl=await cdBlob(await cdRender(D,cdTh(),fmt));if(!bl)return tip('사진을 만들지 못했어요. 위 카드를 길게 눌러 저장해 주세요.');f=CD_FILE[key]=new File([bl],cdName(fmt),{type:'image/png'});}
    if(cdCanFiles(f)){try{await go(f);if(how==='insta')tip(CD_INSTA_TIP);return;}catch(e){if(e&&e.name==='AbortError')return;}}
    const b=f;
    cdDownload(b,cdName(fmt));try{await navigator.clipboard.writeText(how==='insta'?link:text);}catch(e){}
    tip(how==='insta'?'이 기기에서는 인스타그램 공유 창을 열 수 없어서 <b>스토리용 사진(9:16)</b>을 내려받고 게임 주소를 복사했어요. 휴대폰에서 열면 바로 스토리로 보낼 수 있어요.':
      '이 기기에서는 공유 창을 열 수 없어서 <b>카드 사진을 내려받고 결과 글을 복사</b>했어요. 카카오톡 대화방에 사진과 글을 붙여 넣으세요.');};
  if($('#cdKakao'))$('#cdKakao').onclick=()=>{try{SFX.click();}catch(e){}send('card','kakao');};
  if($('#cdInsta'))$('#cdInsta').onclick=()=>{try{SFX.click();}catch(e){}send('story','insta');};
  if($('#cdMore'))$('#cdMore').onclick=()=>{try{SFX.click();}catch(e){}send('card','more');};
  // 복사는 결산 화면의 copyText를 쓴다(클립보드가 막힌 브라우저는 숨은 글 칸으로 복사)
  if($('#cdCopy'))$('#cdCopy').onclick=()=>{try{SFX.click();}catch(e){}copyText(cdShareText(D),$('#cdCopy span'));tip('결과 글과 게임 주소를 복사했어요. 원하는 곳에 붙여 넣으세요.');};
  if($('#cdSave'))$('#cdSave').onclick=async()=>{try{SFX.click();}catch(e){}
    const pre=CD_FILE[cdTh()+':'+CD_FMT];if(pre&&cdIOS()&&cdCanFiles(pre)){try{await navigator.share({files:[pre]});return;}catch(e){if(e&&e.name==='AbortError')return;}}
    const cv=await cdRender(D,cdTh(),CD_FMT),b=await cdBlob(cv);if(!b)return;
    const f=new File([b],cdName(CD_FMT),{type:'image/png'});
    // 아이폰 사파리는 내려받기가 '파일' 앱으로 가므로, 공유 창의 '이미지 저장'으로 사진첩에 넣는다
    if(cdIOS()&&cdCanFiles(f)){try{await navigator.share({files:[f]});return;}catch(e){if(e&&e.name==='AbortError')return;}}
    cdDownload(b,cdName(CD_FMT));tip('사진을 저장했어요. 앨범이나 다운로드 폴더에서 찾을 수 있어요.');};
  draw();
  try{$('.sndp-x').focus({preventScroll:true});}catch(e){}}
const CD_INSTA_TIP='게임 주소를 복사해 두었어요. 스토리 편집 화면에서 <b>스티커 → 링크</b>를 누르고 붙여 넣으면 친구가 눌러서 바로 들어올 수 있어요. 사진 아래 QR 코드로도 들어올 수 있어요.';
const CD_IC={kakao:'<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.5.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>',
  insta:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>'};
// 미리 보기 시험용: 디자인 · 판형 하나를 그려 dataURL로(결산 화면 없이 카드만 보고 싶을 때)
async function cardPreview(D,th,fmt){CD_IMG={};const cv=await cdRender(D,th,fmt);return cv.toDataURL('image/png');}
