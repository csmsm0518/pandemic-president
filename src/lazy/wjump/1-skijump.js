/* ---------- 스키점프 라지힐 결승 (K125 · HS140) ----------
   결승 마지막 점퍼로 우리 선수가 한 번 뛴다. 경쟁자 셋(강한 선수 하나 · 중간 하나 · 기복 큰 선수 하나)은 이미 뛰었다.
   손으로 하는 건 타이밍뿐이다: 도약대 끝에서 고리가 맞물릴 때 · 비행 중 돌풍 표시가 초록 칸에 올 때 · 땅에 닿기 직전.
   점수는 실제 규칙을 줄여 쓴다: 비거리 점수 60+(비거리−K)×1.8, 심판 다섯이 20점 만점으로 매겨 가장 높은·낮은 점수를 빼고 셋을 더한다,
   바람 보정은 맞바람이면 빼고 뒷바람이면 더한다. 시간은 모두 정해진 일정(초)에 맞춰 흐르고, 누른 시각은 이벤트 시각으로 잰다. */
const SJ={K:125,HS:140,MP:1.8,HW:8,TW:9.68,TIN:4,VEND:25.4,TFL:4.5,LEAD:.12,B:116,Q:18};
// 돌풍 등급(0 완벽 · 1 좋음 · 2 흔들림 · 3 놓침)마다 비거리(m)와 심판 점수 가감
const SJ_GD=[1.5,0,-2.5,-5.5],SJ_GS=[.25,0,-.5,-1],SJ_GN=['자세 완벽!','버텼다','흔들렸다','균형을 잃었다'];
// 착지: 0 완벽한 텔레마크 · 1 텔레마크 · 2 일찍 굳음 · 3 두 발 착지 · 4 손 짚음 · 5 넘어짐 → 심판 기준 점수와 비거리 가감
const SJ_LN=['완벽한 텔레마크','텔레마크','일찍 굳은 착지','두 발 착지','손 짚음','넘어짐'],SJ_LS=[18.75,18,16.75,16.25,13,9],SJ_LD=[0,0,-1,0,-.5,-1];
const SJ_NAT=['노르웨이','오스트리아','독일','슬로베니아','일본','폴란드','핀란드','스위스'];
const SJ_MEDAL=['금메달','은메달','동메달','메달을 놓쳤다'];
const sjG=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
// 도약 오차 e(초) → 도약 품질(1이 완벽). 늦은 쪽이 조금 더 아프고, 0.2초를 넘기면 사실상 발판을 놓친 셈이다
function sjQ(e){if(e==null)return -1;let q=Math.exp(-Math.pow(e/(e<0?.1:.085),2));const a=Math.abs(e);if(a>.2)q-=Math.min(1.6,(a-.2)*3);return Math.max(-1,q);}
const sjGg=x=>x==null?3:x<=.035?0:x<=.085?1:x<=.17?2:3;
// 착지 오차 e = 누른 시각 − (닿기 0.12초 전). 닿은 뒤 0.12초까지 누르면 두 발, 그보다 늦거나 한참 이르면 손을 짚는다
function sjLg(e){if(e==null)return 5;const a=Math.abs(e);return a<=.06?0:a<=.14?1:e<0&&e>=-.35?2:e>0&&e<=.24?3:4;}
// 맞바람은 멀리 띄우고(1m/s에 4.8m) 뒷바람은 눌러 앉힌다(5.6m). 보정 점수가 그 대부분을 되돌린다
const sjWd=w=>w>0?4.8*w:5.6*w;
const sjWc=w=>Math.round((w>0?-SJ.HW*w:-SJ.TW*w)*10)/10;
const sjWind=()=>Math.round(Math.max(-2.2,Math.min(2.2,sjG()*.8))*10)/10;
const sjJudge=b=>Array.from({length:5},()=>Math.max(0,Math.min(20,Math.round((b+sjG()*.4)*2)/2)));
// 다섯 심판 중 가장 높은·낮은 점수 하나씩을 뺀다(뺀 자리는 표에 흐리게 보여 준다)
function sjDrop(j){const o=j.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]);return [o[0][1],o[4][1]];}
function sjTotal(r){const x=sjDrop(r.j);r.x=x;r.dp=Math.round((60+(r.d-SJ.K)*SJ.MP)*10)/10;r.wc=sjWc(r.w);r.st=r.j.reduce((a,v,i)=>x.includes(i)?a:a+v,0);r.tot=Math.round((r.dp+r.st+r.wc)*10)/10;return r;}
// 우리 점프: e 도약 오차 · g 돌풍 두 번의 등급 · le 착지 오차 · w 바람 · nz 그날의 거리 흔들림(m)
function sjOurs(o){const q=sjQ(o.e),L=sjLg(o.le),d=Math.max(60,Math.round((SJ.B+SJ.Q*q+o.g.reduce((a,g)=>a+SJ_GD[g],0)+sjWd(o.w)+o.nz+SJ_LD[L])*2)/2);
  return sjTotal({n:'우리 선수',me:1,d:d,w:o.w,L:L,q:q,j:sjJudge(SJ_LS[L]+o.g.reduce((a,g)=>a+SJ_GS[g],0)+(q<.35?-.5:q>.85?.25:0))});}
// 경쟁자 셋: 강한 선수는 거의 늘 텔레마크로 130m 안팎, 기복 큰 선수는 바람과 착지에 따라 크게 출렁인다
function sjRivals(){const N=SJ_NAT.slice().sort(()=>Math.random()-.5);
  return [[130.5,4.5,[.8,.14,.05,.01]],[125,5,[.65,.25,.08,.02]],[118,7,[.55,.28,.13,.04]]].map(([mu,sd,p],i)=>{const w=sjWind();let r=Math.random(),k=0;while(k<3&&r>=p[k]){r-=p[k];k++;}
    return sjTotal({n:N[i],d:Math.round((mu+sjG()*sd+sjWd(w))*2)/2,w:w,L:[1,3,4,5][k],j:sjJudge([18.4,16.6,13,9][k]+sjG()*.3)});}).sort(()=>Math.random()-.5);}
const sjF1=v=>(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(1);
const sjWtx=w=>w===0?'무풍':(w>0?'맞바람 ':'뒷바람 ')+Math.abs(w).toFixed(1)+'m/s';
// 언덕(m, 도약대 끝이 (0,0)): 착지 사면은 3m 아래에서 25°로 시작해 x=40부터 36°, x=100부터 누그러져 x=175에서 평평한 착지 구역이 된다
const sjSm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const SJ_HILL=(()=>{const X=[],Y=[],S=[],A=[];let y=-3,s=0;
  const ang=x=>x<40?25+11*sjSm(x/40):x<100?36:x<175?36*(1-sjSm((x-100)/75)):x<240?0:-Math.min(9,(x-240)*.35);
  for(let i=0;i<=760;i++){const x=i*.5,a=ang(x)*Math.PI/180;if(i){const a0=A[i-1],dy=-Math.tan((a+a0)/2)*.5;s+=Math.hypot(.5,dy);y+=dy;}X.push(x);Y.push(y);S.push(s);A.push(a);}
  // 도약대 쪽 진입로(인런): 끝 6m는 11°, 그 위 18m에서 35°로 휘어 오른다. u는 도약대 끝에서 거슬러 오른 길이
  const IX=[0],IY=[0];let ix=0,iy=0;for(let k=1;k<=240;k++){const u=k*.25,a=(u<6?11:11+24*sjSm((u-6)/18))*Math.PI/180;ix-=Math.cos(a)*.25;iy+=Math.sin(a)*.25;IX.push(ix);IY.push(iy);}
  // 진입로 아래 땅: 진입로보다 3m 낮게 깔린 비탈(도약대 끝 아래에서 착지 사면 시작점 −3m와 이어진다). 진입로 위쪽 너머로는 35°로 계속 오른다
  const GX=[];let k=0;for(let i=0;i<=200;i++){const x=-i*.5;while(k<239&&IX[k+1]>x)k++;const y=x>=IX[239]?IY[k]+(IY[k+1]-IY[k])*(IX[k]-x)/(IX[k]-IX[k+1]||1):IY[240]+(IX[240]-x)*Math.tan(35*Math.PI/180);GX.push(y-3);}
  return {X:X,Y:Y,S:S,A:A,IX:IX,IY:IY,GX:GX};})();
// 땅 높이: 도약대 앞은 착지 사면, 뒤(x<0)는 진입로 아래 비탈
function sjGy(x){const H=SJ_HILL;if(x<0){const f=Math.min(199.999,-x*2),i=Math.floor(f);return H.GX[i]+(H.GX[i+1]-H.GX[i])*(f-i);}const f=Math.min(759.999,x*2),i=Math.floor(f);return H.Y[i]+(H.Y[i+1]-H.Y[i])*(f-i);}
function sjGa(x){if(x<0){const i=Math.min(199,Math.floor(-x*2)),G=SJ_HILL.GX;return -Math.atan((G[i+1]-G[i])*2);}const H=SJ_HILL,i=Math.min(760,Math.round(x*2));return -H.A[i];}
// 사면을 따라 잰 거리 s → x
function sjXs(s){const H=SJ_HILL,S=H.S;if(s<=0)return 0;if(s>=S[760])return 380;let lo=0,hi=760;while(hi-lo>1){const m=(lo+hi)>>1;if(S[m]<s)lo=m;else hi=m;}return H.X[lo]+(s-S[lo])/(S[hi]-S[lo])*.5;}
// 진입로 위 점(도약대 끝에서 거슬러 오른 길이 u)과 기울기
function sjIn(u){const H=SJ_HILL,f=Math.max(0,Math.min(239.999,u*4)),i=Math.floor(f),t=f-i;return {x:H.IX[i]+(H.IX[i+1]-H.IX[i])*t,y:H.IY[i]+(H.IY[i+1]-H.IY[i])*t,a:-Math.atan2(H.IY[i+1]-H.IY[i],H.IX[i]-H.IX[i+1])};}
// 자세: 발(0,0)을 기준으로 한 관절 자리(m, x는 스키 앞쪽 · y는 위). s1·s2는 두 스키 각도, o2는 뒤 스키를 얼마나 띄우나(V자)
const SJ_PO={
 bar:{f1:[0,0],f2:[0,0],k1:[.36,.42],k2:[.32,.42],hp:[-.2,.5],sh:[.2,.98],hd:[.36,1.16],h1:[.5,.72],h2:[.46,.7],s1:0,s2:0,o2:0},
 tuck:{f1:[0,0],f2:[0,0],k1:[.34,.36],k2:[.3,.36],hp:[-.2,.46],sh:[.46,.7],hd:[.72,.72],h1:[-.36,.4],h2:[-.32,.38],s1:0,s2:0,o2:0},
 ext:{f1:[0,0],f2:[0,0],k1:[.2,.5],k2:[.17,.5],hp:[.12,.98],sh:[.66,1.36],hd:[.86,1.48],h1:[-.18,.74],h2:[-.14,.72],s1:.04,s2:.04,o2:0},
 fly:{f1:[0,0],f2:[0,0],k1:[.42,.17],k2:[.4,.15],hp:[.82,.33],sh:[1.46,.6],hd:[1.7,.68],h1:[.74,.18],h2:[.7,.14],s1:.52,s2:.32,o2:.1},
 tele:{f1:[.36,0],f2:[-.36,0],k1:[.56,.44],k2:[-.12,.17],hp:[.06,.7],sh:[.14,1.28],hd:[.18,1.48],h1:[.66,1.12],h2:[-.5,1.18],s1:0,s2:0,o2:0},
 two:{f1:[.05,0],f2:[-.05,0],k1:[.4,.38],k2:[.36,.38],hp:[-.14,.56],sh:[.24,1.06],hd:[.38,1.22],h1:[.6,.82],h2:[.54,.78],s1:0,s2:0,o2:0},
 touch:{f1:[.1,0],f2:[-.1,0],k1:[.34,.3],k2:[.3,.3],hp:[-.34,.4],sh:[-.02,.86],hd:[.1,1.02],h1:[-.66,.02],h2:[.42,.52],s1:0,s2:0,o2:0},
 glide:{f1:[.06,0],f2:[-.06,0],k1:[.14,.5],k2:[.1,.5],hp:[0,.94],sh:[.06,1.48],hd:[.08,1.68],h1:[.36,2.02],h2:[-.24,2.04],s1:0,s2:0,o2:0},
 fall:{f1:[.2,.06],f2:[-.3,.12],k1:[-.36,.12],k2:[-.3,.28],hp:[-.84,.16],sh:[-1.42,.22],hd:[-1.66,.26],h1:[-1.2,.52],h2:[-1.02,.02],s1:.34,s2:-.42,o2:.05}};
function sjMix(a,b,t){t=Math.max(0,Math.min(1,t));const o={};for(const k in a)o[k]=Array.isArray(a[k])?[a[k][0]+(b[k][0]-a[k][0])*t,a[k][1]+(b[k][1]-a[k][1])*t]:a[k]+(b[k]-a[k])*t;return o;}
// 소리: 진입로 활강음 · 도약 · 비행 바람 · 돌풍 · 착지 · 함성과 카우벨
const SJ_SND={
 hiss:()=>{sweep(SJ.TIN+.1,.05,700,3600,0,.6);sweep(SJ.TIN,.025,2400,6000,.2,.9);},
 pop:()=>{thud(150,.24,0,.25);sweep(.4,.07,600,2600,0,.8);},
 air:()=>sweep(SJ.TFL,.055,260,760,0,.5),
 gust:()=>sweep(.9,.09,420,1900,0,.7),
 ok:k=>{if(k===0){tone(1320,'sine',.14,.11);tone(1760,'sine',.2,.07,.06);}else if(k===1)tone(990,'sine',.12,.09);else if(k===2)tone(520,'triangle',.14,.08);else tone(190,'sawtooth',.22,.07);},
 land:k=>{thud(k>=4?70:110,k>=4?.42:.3,0,.32);noise(.5,.18,0,k>=4?700:2400);},
 bell:w=>{tone(800,'square',.09,.04,w);tone(540,'square',.12,.035,w+.005);},
 roar:big=>{sweep(2.8,big?.12:.06,380,1000,0,.35);noise(2.2,big?.06:.03,.3,1300);if(big)for(let i=0;i<7;i++)SJ_SND.bell(.25+i*.2+Math.random()*.06);}};
const sjSfx=(k,a)=>{try{SJ_SND[k](a);}catch(e){}};
function mgJump(box,done){const $=id=>document.getElementById(id);let RM=false;try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
  let home='대한민국';try{home=OLY_HOME()||home;}catch(e){}
  const riv=sjRivals(),W0=sjWind(),nz=sjG()*1.2,lead=riv.reduce((a,r)=>r.tot>a.tot?r:a),bd=riv.slice().sort((a,b)=>b.tot-a.tot);
  // 선두를 넘으려면 몇 m가 필요한지(심판 54점을 받는다고 보고) — 중계 화면의 초록 선
  const need=Math.round((SJ.K+(lead.tot-54-sjWc(W0)-60)/SJ.MP)*2)/2;
  const TE=SJ.TIN,TL=TE+SJ.TFL,TS=TL-SJ.LEAD,AIN=SJ.VEND/SJ.TIN,LIN=.5*AIN*SJ.TIN*SJ.TIN;
  const GU=[{t0:TE+.5+Math.random()*.25,du:1,c:.42+Math.random()*.36},{t0:TE+1.95+Math.random()*.2,du:.85,c:.42+Math.random()*.36}];
  const R={e:undefined,g:[undefined,undefined],le:undefined,pe:0,pl:0},usa=home==='미국';
  const SUIT=usa?{s:'#24407a',a:'#d6403a',h:'#f3f5fa',k:'#d6403a'}:{s:'#eef1f7',a:'#d6403a',h:'#d6403a',k:'#f1d589'};
  box.innerHTML='<div class="mgx sj" id="sjRoot"><div class="sj-main"><div class="sj-sc" id="sjSc"><canvas id="sjC"></canvas>'+
    '<div class="sj-hud" id="sjHud"><div><span>속도</span><b id="sjV">0.0</b><small>km/h</small></div><div class="sj-wd"><span>바람</span><i id="sjWa" class="'+(W0>0?'h':W0<0?'t':'')+'">'+(W0>0?'←':W0<0?'→':'·')+'</i><b>'+Math.abs(W0).toFixed(1)+'</b><small>m/s</small></div>'+
    '<div><span>비거리</span><b id="sjD">—</b><small>m</small></div><div class="sj-ld"><span>선두</span><b>'+lead.n+' '+lead.tot.toFixed(1)+'</b></div></div>'+
    '<div class="sj-fx" id="sjFx"></div><div class="sj-ov" id="sjOv"></div></div>'+
    '<div class="sj-side"><div class="pk-msg" id="sjMsg">마지막 점퍼다. 출발을 누르면 신호가 켜진다</div>'+
    '<button type="button" id="sjP" class="sj-p" disabled>누르기<small>스페이스 · 엔터</small></button><button type="button" id="sjGo" class="pri">출발</button></div></div></div>';
  const root=$('sjRoot'),sc=$('sjSc'),cv=$('sjC'),g=cv.getContext('2d'),pb=$('sjP');
  let W=320,H=220,S=8,DPR=1;
  const fit=()=>{const side=innerHeight<480&&root.clientWidth>=520;root.classList.toggle('side',side);
    const w=sc.clientWidth||320,cap=w*(w<480?.85:.62);W=w;H=Math.round(Math.max(side?150:180,Math.min(cap,side?innerHeight-96:innerHeight-260)));
    DPR=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cv.style.height=H+'px';root.classList.toggle('wide',W>=440);
    // 선수가 너무 작아지지 않게: 화면 폭에 58m쯤, 높이에 20m쯤 들어오게
    S=Math.max(5.5,Math.min(13,W/58,H/20));};
  fit();
  // 배경 재료(한 번만 만든다): 별 · 나무 · 관중 · 조명탑
  const rnd=(i,k)=>{const v=Math.sin(i*127.1+k*311.7)*43758.5453;return v-Math.floor(v);};
  const stars=Array.from({length:70},(_,i)=>[rnd(i,1),rnd(i,2)*.55,.4+rnd(i,3)*1.1,rnd(i,4)*6]);
  const trees=[];for(let x=-90;x<330;x+=4+rnd(x,5)*7)if(x<-8||x>8)trees.push([x,3.2+rnd(x,6)*3.6,-.6+rnd(x,7)*1.4]);
  const CROWD=['#f1d589','#e0504a','#e8edf6','#3f7fd8','#e3a72f','#9fd8ff','#ff8a80','#ffffff'],crowd=[];
  for(let r=0;r<8;r++)for(let x=184;x<300;x+=.9+rnd(x*3,r)*.5)crowd.push([x,r,CROWD[Math.floor(rnd(x,r+9)*CROWD.length)],rnd(x,r+20)*6.3]);
  const LAMPS=[-34,44,118,196,262];
  let st='brief',T=-2,clk0=0,lastNow=0,raf=0,dCur=SJ.B+SJ.Q*.35+sjWd(W0)+nz,qv=.35,tv=0,parts=[],flakes=[],wob=null,res=null,cam={x:0,y:0,k:0},shake=0,fallT=0,outS=0,outV=0,landed=0,pDone={},lastPd=0,said={};
  if(!RM)flakes=Array.from({length:46},(_,i)=>({x:rnd(i,30),y:rnd(i,31),z:.4+rnd(i,32)*.9,p:rnd(i,33)*6}));
  const msg=h=>{$('sjMsg').innerHTML=h;};
  let fxT=0;const pop=(t,c)=>{const f=$('sjFx');f.textContent=t;f.className='sj-fx '+(c||'');void f.offsetWidth;f.classList.add('on');clearTimeout(fxT);fxT=setTimeout(()=>f.classList.remove('on'),1150);};
  // 지금 비행 중이면 어디까지 날아갈지(아직 안 정해진 건 보통 수준으로 놓는다)
  const target=()=>{const q=R.e===undefined?.35:sjQ(R.e);let d=SJ.B+SJ.Q*q+sjWd(W0)+nz;R.g.forEach(k=>{if(k!==undefined)d+=SJ_GD[k];});if(R.le!==undefined)d+=SJ_LD[sjLg(R.le)];return Math.max(60,d);};
  // 비행 중 사면을 따라 나아가는 비율: 도약 속도(약 92km/h)로 시작해 내려가며 조금 빨라진다
  const gfn=u=>u*(.92+.08*u);
  // 선수 자리(월드 m)와 몸 각도: 진입로 → 비행 → 착지 구역
  const where=t=>{if(t<0){const p=sjIn(LIN+1.4);return {x:p.x,y:p.y,a:p.a,v:0};}
    if(t<TE){const u=LIN-.5*AIN*t*t,p=sjIn(u);return {x:p.x,y:p.y,a:p.a,v:AIN*t};}
    if(t<TL||!landed){const u=Math.min(1,(t-TE)/SJ.TFL),r=gfn(u),s=dCur*r,x=sjXs(s),B=14+6*Math.max(0,qv),h=(1-r)*(3+B*r);return {x:x,y:sjGy(x)+h,s:s,v:dCur*(.92+.16*u)/SJ.TFL,h:h};}
    const x=sjXs(outS);return {x:x,y:sjGy(x),a:sjGa(x),s:outS,v:outV,h:0};};
  // 누르기: 이벤트 시각(ts)을 경기 시계로 바꿔, 그 순간 떠 있는 표시 하나에만 매긴다
  const press=ts=>{if(st==='brief'){start();return;}if(st!=='play')return;
    const now=performance.now();if(!(ts>0)||Math.abs(ts-now)>2000)ts=now;const tp=(ts-clk0)/1000;
    pb.classList.remove('hit');void pb.offsetWidth;pb.classList.add('hit');
    if(R.e===undefined&&tp>=TE-.95&&tp<=TE+.25){const e=R.e=tp-TE,a=Math.abs(e);R.pe=tp;qv=sjQ(e);
      const k=a<=.04?0:a<=.09?1:a<=.16?2:3;sjSfx('ok',k);pop(k===0?'완벽한 도약!':k===1?'좋은 도약':(e<0?(k===2?'조금 일렀다':'너무 일렀다'):(k===2?'조금 늦었다':'너무 늦었다')),k<=1?'g':k===2?'':'x');
      msg((k<=1?'<b class="g">':'<b>')+(e>=0?'+':'−')+Math.round(a*1000)+'ms</b> · 이제 돌풍을 버텨라');return;}
    for(let i=0;i<2;i++){const G=GU[i];if(R.g[i]===undefined&&tp>=G.t0-.05&&tp<=G.t0+G.du){const k=R.g[i]=sjGg(Math.abs((tp-G.t0)/G.du-G.c));G.p=(tp-G.t0)/G.du;sjSfx('ok',k);
      pop(SJ_GN[k],k<=1?'g':k===3?'x':'');if(k>=2)wob={t:T,a:k===3?.32:.16};return;}}
    if(R.le===undefined&&tp>=TS-.95&&tp<=TL+.25){R.le=tp-TS;R.pl=tp;const L=sjLg(R.le);sjSfx('ok',L<=1?(L?1:0):L<=3?2:3);
      if(L<=1)pop(SJ_LN[L]+'!','g');else if(L<=3)pop(L===2?'일찍 굳었다':'두 발 착지',L===2?'':'x');}};
  const down=e=>{if(pb.disabled&&st!=='brief')return;e.preventDefault();lastPd=Date.now();press(e.timeStamp);};
  pb.addEventListener('pointerdown',down);pb.addEventListener('click',()=>{if(Date.now()-lastPd>600){lastPd=Date.now();press(performance.now());}});
  pb.addEventListener('contextmenu',e=>e.preventDefault());
  // 화면(캔버스)을 눌러도 같은 일을 한다. 휴대폰에서 엄지가 단추를 벗어나도 놓치지 않게
  const scDown=e=>{if(st!=='play')return;e.preventDefault();lastPd=Date.now();press(e.timeStamp);};sc.addEventListener('pointerdown',scDown);
  const key=e=>{if(e.key!==' '&&e.key!=='Enter'&&e.code!=='Space')return;if(st!=='play'&&st!=='brief')return;if(st==='brief'&&document.activeElement&&document.activeElement!==document.body&&document.activeElement!==$('sjGo')&&document.activeElement!==pb)return;
    e.preventDefault();if(e.repeat)return;lastPd=Date.now();press(e.timeStamp);};
  document.addEventListener('keydown',key);addEventListener('resize',fit);
  const stop=()=>{cancelAnimationFrame(raf);raf=0;document.removeEventListener('keydown',key);removeEventListener('resize',fit);};
  const start=()=>{if(st!=='brief')return;try{aInit();}catch(e){}st='play';$('sjGo').style.display='none';$('sjOv').style.display='none';pb.disabled=false;
    clk0=performance.now()+1800;T=-1.8;lastNow=performance.now();msg('신호가 초록으로 바뀌면 출발한다');};
  $('sjGo').onclick=()=>{if(st==='brief')start();else if(st==='end'){try{SFX.click();}catch(e){}stop();done(res.t);}};
  // 고정 걸음(1/240초)으로 시간을 나아가게 해, 화면 주사율과 상관없이 판정 창이 같다
  const DT=1/240;
  const step=()=>{T+=DT;
    if(T>=-1.6&&!said.r1){said.r1=1;try{SFX.beep(2);}catch(e){}}if(T>=-.8&&!said.r2){said.r2=1;try{SFX.beep(1);}catch(e){}}
    if(T>=0&&!said.go){said.go=1;try{SFX.beep(0);}catch(e){}sjSfx('hiss');msg('도약대 끝에서 <b>고리가 맞물릴 때</b> 누르기');}
    if(T>=TE&&!said.to){said.to=1;sjSfx('pop');sjSfx('air');for(let i=0;i<10;i++)parts.push({x:0,y:0,vx:6+Math.random()*10,vy:Math.random()*3,l:.6+Math.random()*.4,r:.12});}
    // 누를 기회가 지난 뒤 0.1초 더 기다렸다가 놓친 걸로 친다(이벤트가 한 프레임 늦게 와도 억울하지 않게)
    if(R.e===undefined&&T>TE+.35){R.e=null;qv=-1;sjSfx('ok',3);pop('도약 실패','x');msg('도약대를 그냥 미끄러져 나왔다. 돌풍이라도 버텨라');}
    GU.forEach((G,i)=>{if(T>=G.t0-.35&&!G.s){G.s=1;sjSfx('gust');if(T<TL)msg('<b>돌풍!</b> 표시가 <b class="g">초록 칸</b>에 올 때 누르기');}
      if(R.g[i]===undefined&&T>G.t0+G.du+.1){R.g[i]=3;G.p=null;sjSfx('ok',3);pop(SJ_GN[3],'x');wob={t:T,a:.34};}});
    if(T>=TS-.95&&!said.lw){said.lw=1;msg('땅에 닿기 <b>직전</b>, 고리가 맞물릴 때 누르기');}
    if(T>=TE&&!res){const d=target();dCur+=(d-dCur)*(1-Math.exp(-DT*7));}
    if(T>=TL&&!landed){landed=1;const L=R.le===undefined?3:sjLg(R.le);outS=dCur;outV=dCur*1.08/SJ.TFL;sjSfx('land',L);shake=RM?0:L>=4?1:.5;
      for(let i=0;i<(L>=4?44:28);i++){const x=sjXs(outS);parts.push({x:x,y:sjGy(x),vx:4+Math.random()*14,vy:1+Math.random()*5,l:.5+Math.random()*.7,r:.1+Math.random()*.12});}}
    if(R.le===undefined&&T>TL+.35){R.le=null;fallT=T;pop('넘어짐','x');sjSfx('land',5);}
    if(landed&&!res&&R.le!==undefined){const o=sjOurs({e:R.e,g:R.g,le:R.le,w:W0,nz:nz});outS+=o.d-dCur;dCur=o.d;res=o;
      const ok=o.L<=1;sjSfx('roar',ok&&o.d>=SJ.K-3);msg('<b'+(ok?' class="g"':'')+'>'+o.d.toFixed(1)+'m</b> · '+SJ_LN[o.L]+(o.d>=SJ.HS?' · HS를 넘었다!':o.d>=need?' · 선두 선을 넘었다':''));pb.disabled=true;}
    if(landed){const x=sjXs(outS),dec=(R.le===null||(res&&res.L===5))?7:x>175?5:2.2;outV=Math.max(0,outV-dec*DT);outS+=outV*DT;
      if(outV>3&&Math.random()<DT*30){parts.push({x:x-.6,y:sjGy(x)+.05,vx:-outV*.15+Math.random()*2,vy:.5+Math.random()*2,l:.4,r:.07});}}
    parts.forEach(p=>{p.x+=p.vx*DT;p.y+=p.vy*DT;p.vy-=9*DT;p.vx*=1-DT*1.5;p.l-=DT;});if(parts.length>160||Math.random()<.02)parts=parts.filter(p=>p.l>0);
    if(shake>0)shake=Math.max(0,shake-DT*2.5);
    if(res&&T>TL+3.2&&st==='play')finish();};
  const finish=()=>{st='end';pb.disabled=true;const L=[res].concat(riv).sort((a,b)=>b.tot-a.tot),place=L.indexOf(res)+1,t=Math.min(3,place-1);res.t=t;res.place=place;
    $('sjHud').style.display='none';$('sjOv').style.minHeight=H+'px';sc.classList.add('res');pb.style.display='none';
    const jd=r=>r.j.map((v,i)=>'<i'+(r.x.includes(i)?' class="x"':'')+'>'+v.toFixed(1)+'</i>').join('');
    $('sjOv').innerHTML='<div class="sj-res"><div class="sj-rh"><span>라지힐 결승 · K125 · HS140</span><b>최종 결과</b></div><div class="sj-rg">'+
      '<div class="sj-me"><div class="sj-mt"><em class="p'+place+'">'+place+'위</em><b>우리 선수<small>'+home+'</small></b><strong>'+res.d.toFixed(1)+'<small>m</small></strong></div>'+
      '<div class="sj-jd"><span>심판</span>'+jd(res)+'</div>'+
      '<div class="sj-bk"><div><span>비거리</span><b>'+res.dp.toFixed(1)+'</b></div><div><span>심판</span><b>'+res.st.toFixed(1)+'</b></div><div><span>바람</span><b>'+sjF1(res.wc)+'</b></div><div class="t"><span>합계</span><b>'+res.tot.toFixed(1)+'</b></div></div>'+
      '<div class="sj-nt">'+SJ_LN[res.L]+' · '+sjWtx(W0)+'</div></div>'+
      '<ol class="sj-st">'+L.map((r,i)=>'<li'+(r.me?' class="me"':'')+'><em>'+(i+1)+'</em><b>'+(r.me?'우리 선수':r.n)+'</b><span>'+r.d.toFixed(1)+'m</span><strong>'+r.tot.toFixed(1)+'</strong></li>').join('')+'</ol></div></div>';
    const ov=$('sjOv');ov.style.display='';ov.classList.add('show');if(!RM){ov.querySelectorAll('.sj-me>*,.sj-st li').forEach((el,i)=>{el.style.animationDelay=(i*.12)+'s';});ov.classList.add('anim');}
    try{SFX.medal(t);}catch(e){}
    msg('<b'+(t===0?' class="g"':'')+'>'+res.d.toFixed(1)+'m · '+res.tot.toFixed(1)+'점 · '+SJ_MEDAL[t]+(t===0?'!':'')+'</b>');
    const go=$('sjGo');go.textContent='결과 보기';go.style.display='';};
  // ---------- 그리기 ----------
  const sx=x=>(x-cam.x)*S+W*.4,sy=y=>H*.46-(y-cam.y)*S;
  const ln=(x0,y0,x1,y1)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();};
  // 산 능선: 정해진 사인파를 겹쳐 같은 자리에 같은 산이 서게 한다
  const ridge=(par,yb,amp,col,seed,cap)=>{const off=cam.x*S*par;g.fillStyle=col;g.beginPath();g.moveTo(0,H);
    for(let x=0;x<=W+8;x+=8){const u=(x+off)/S;g.lineTo(x,yb-amp*(.55+.3*Math.sin(u*.045+seed)+.16*Math.sin(u*.13+seed*2)+.07*Math.sin(u*.41+seed*3)));}g.lineTo(W,H);g.fill();
    if(cap){g.save();g.clip();g.fillStyle=cap;g.fillRect(0,0,W,yb-amp*.82);g.restore();}};
  // 전나무: 세 층으로 겹친 삼각형
  const pine=(x,y,h,c)=>{g.fillStyle=c;g.beginPath();for(let i=0;i<3;i++){const t=y-h*i*.28,w=h*(.36-i*.08);g.moveTo(x,t-h*(.5-i*.02));g.lineTo(x+w,t);g.lineTo(x-w,t);}g.fill();g.fillRect(x-h*.03,y-h*.02,h*.06,h*.08);};
  const jumper=(px,py,ang,P,k)=>{g.save();g.translate(px,py);g.rotate(-ang);g.scale(k,-k);g.lineCap='round';g.lineJoin='round';
    const ski=(f,a,dy,c)=>{const ca=Math.cos(a),sa=Math.sin(a),fx=f[0],fy=f[1]+dy;g.strokeStyle=c;g.lineWidth=.075;g.beginPath();g.moveTo(fx-ca*1.02,fy-sa*1.02);g.lineTo(fx+ca*1.42,fy+sa*1.42);
      g.quadraticCurveTo(fx+ca*1.55-sa*.02,fy+sa*1.55+ca*.02,fx+ca*1.6-sa*.1,fy+sa*1.6+ca*.1);g.stroke();};
    const leg=(f,kn,c)=>{g.strokeStyle=c;g.lineWidth=.17;g.beginPath();g.moveTo(f[0],f[1]+.06);g.lineTo(kn[0],kn[1]);g.lineTo(P.hp[0],P.hp[1]);g.stroke();
      g.strokeStyle='#1d2433';g.lineWidth=.12;ln(f[0]-.08,f[1]+.05,f[0]+.12,f[1]+.05);};
    ski(P.f2,P.s2,P.o2,'rgba(150,120,50,.95)');leg(P.f2,P.k2,usa?'#1b2f5c':'#c9d0dc');
    g.strokeStyle=usa?'#1b2f5c':'#c9d0dc';g.lineWidth=.1;ln(P.sh[0],P.sh[1],P.h2[0],P.h2[1]);
    g.strokeStyle=SUIT.s;g.lineWidth=.28;ln(P.hp[0],P.hp[1],P.sh[0],P.sh[1]);
    g.strokeStyle=SUIT.a;g.lineWidth=.07;ln(P.hp[0]+(P.sh[1]-P.hp[1])*.12,P.hp[1]-(P.sh[0]-P.hp[0])*.12,P.sh[0]+(P.sh[1]-P.hp[1])*.12,P.sh[1]-(P.sh[0]-P.hp[0])*.12);
    ski(P.f1,P.s1,0,SUIT.k);leg(P.f1,P.k1,SUIT.s);
    g.strokeStyle=SUIT.s;g.lineWidth=.11;ln(P.sh[0],P.sh[1],P.h1[0],P.h1[1]);
    g.fillStyle=SUIT.h;g.beginPath();g.arc(P.hd[0],P.hd[1],.15,0,6.3);g.fill();
    const fa=Math.atan2(P.hd[1]-P.sh[1],P.hd[0]-P.sh[0])-1.2;g.fillStyle='#e3a72f';g.beginPath();g.arc(P.hd[0],P.hd[1],.13,fa-.6,fa+.6);g.lineTo(P.hd[0],P.hd[1]);g.fill();
    g.restore();};
  const ring=(px,py,tc,lab,dn)=>{const dt=tc-T,r0=Math.max(14,S*1.7);if(dt<-.3)return;const r=r0+Math.max(-r0*.7,dt*92),hot=Math.abs(dt)<=.04&&!dn;
    g.save();g.lineWidth=3;g.strokeStyle=dn?'rgba(241,213,137,.35)':hot?'#7bf0b0':'#f1d589';g.beginPath();g.arc(px,py,r0,0,6.3);g.stroke();
    if(!dn){g.globalAlpha=Math.max(0,Math.min(1,1+dt*4));g.lineWidth=2.5;g.strokeStyle='#fff';g.beginPath();g.arc(px,py,Math.max(2,r),0,6.3);g.stroke();
      if(hot){g.fillStyle='rgba(123,240,176,.25)';g.beginPath();g.arc(px,py,r0,0,6.3);g.fill();}}
    g.globalAlpha=1;g.font='800 11px system-ui,sans-serif';g.textAlign='center';g.fillStyle='#ffe08a';g.strokeStyle='rgba(5,10,24,.8)';g.lineWidth=3;g.strokeText(lab,px,py-r0-7);g.fillText(lab,px,py-r0-7);g.restore();};
  const bar=(G,i)=>{const bw=Math.min(280,W*.62),bx=(W-bw)/2,by=Math.max(46,H*.2),p=G.p!==undefined&&G.p!==null?G.p:Math.max(0,Math.min(1,(T-G.t0)/G.du));
    g.save();g.fillStyle='rgba(8,14,30,.82)';g.strokeStyle='rgba(241,213,137,.5)';g.lineWidth=1;g.beginPath();g.roundRect?g.roundRect(bx-6,by-20,bw+12,40,8):g.rect(bx-6,by-20,bw+12,40);g.fill();g.stroke();
    g.fillStyle='#e3a72f';g.font='800 10.5px system-ui,sans-serif';g.textAlign='left';g.fillText('돌풍 '+(i+1)+' · 자세 유지',bx,by-7);
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect(bx,by,bw,11);g.fillStyle='rgba(227,167,47,.55)';g.fillRect(bx+(G.c-.17)*bw,by,.34*bw,11);
    g.fillStyle='#3fc38f';g.fillRect(bx+(G.c-.085)*bw,by,.17*bw,11);g.fillStyle='#b8ffd9';g.fillRect(bx+(G.c-.035)*bw,by,.07*bw,11);
    const mx=bx+p*bw,r=R.g[i];g.fillStyle=r===undefined?'#fff':r<=1?'#7bf0b0':r===2?'#ffe08a':'#ff8a80';g.fillRect(mx-2,by-4,4,19);
    g.beginPath();g.moveTo(mx-5,by-7);g.lineTo(mx+5,by-7);g.lineTo(mx,by-2);g.fill();g.restore();};
  const draw=()=>{const J=where(T);
    // 카메라: 선수보다 조금 앞·아래를 본다(비행 중엔 내려앉을 사면이 보이게)
    // 선수를 화면 가로 30~37% · 세로 44% 언저리에 둔다(위 정보판에 가리지 않게, 앞쪽 사면이 넉넉히 보이게)
    const fl=T>=TE&&!landed,tx=J.x+W*(fl?.1:T>=0?.06:.02)/S,ty=J.y-H*(T<0?-.04:.03)/S;
    if(!cam.k){cam.x=tx;cam.y=ty;cam.k=1;}else{const f=1-Math.exp(-(1/60)*(fl?9:6));cam.x+=(tx-cam.x)*f;cam.y+=(ty-cam.y)*f;}
    g.setTransform(DPR,0,0,DPR,0,0);g.save();if(shake>0){g.translate((Math.random()-.5)*shake*5,(Math.random()-.5)*shake*5);}
    const sk=g.createLinearGradient(0,0,0,H);sk.addColorStop(0,'#081130');sk.addColorStop(.5,'#1d2350');sk.addColorStop(.85,'#57406c');sk.addColorStop(1,'#7a5a74');g.fillStyle=sk;g.fillRect(-10,-10,W+20,H+20);
    stars.forEach(s=>{g.globalAlpha=RM?.7:.45+.4*Math.sin(tv*1.7+s[3]);g.fillStyle='#e8edf6';g.fillRect(s[0]*W,s[1]*H,s[2],s[2]);});g.globalAlpha=1;
    const mg=g.createRadialGradient(W*.82,H*.17,2,W*.82,H*.17,H*.2);mg.addColorStop(0,'rgba(255,240,200,.5)');mg.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=mg;g.fillRect(0,0,W,H*.5);
    g.fillStyle='#f6eed8';g.beginPath();g.arc(W*.82,H*.17,Math.max(7,H*.035),0,6.3);g.fill();
    const yb=H*.66+(cam.y+40)*S*.05;
    ridge(.05,yb,H*.32,'#2b3768',3.1,'rgba(214,225,245,.55)');ridge(.12,yb+H*.1,H*.24,'#1c2852',7.7,'rgba(180,196,226,.35)');
    // 먼 숲
    const off=cam.x*S*.28,yt=yb+H*.2;g.fillStyle='#121c3c';g.fillRect(0,yt,W,H);for(let x=-((off%14)+14);x<W+14;x+=14){const i=Math.floor((x+off)/14);pine(x,yt+2,8+rnd(i,40)*10,'#121c3c');}
    // 화면에 보이는 월드 범위
    const x0=cam.x-(W*.4)/S-4,x1=cam.x+(W*.6)/S+4,xs=Math.max(.5,2/S);
    // 조명탑: 빛 번짐은 '더하기'로 겹친다
    LAMPS.forEach(lx=>{if(lx<x0-30||lx>x1+30)return;const gy=sjGy(lx)+3,top=gy+38,X=sx(lx),Y0=sy(gy),Y1=sy(top);g.strokeStyle='#2b3550';g.lineWidth=Math.max(1.5,S*.35);ln(X,Y0,X,Y1);
      g.fillStyle='#3a4560';g.fillRect(X-S*1.4,Y1-S*.6,S*2.8,S*.9);g.save();g.globalCompositeOperation='lighter';const lg=g.createRadialGradient(X,Y1,1,X,Y1,S*12);lg.addColorStop(0,'rgba(255,248,220,.55)');lg.addColorStop(1,'rgba(255,248,220,0)');
      g.fillStyle=lg;g.fillRect(X-S*12,Y1-S*12,S*24,S*24);g.fillStyle='#fffbe6';g.fillRect(X-S*1.2,Y1-S*.45,S*2.4,S*.5);g.restore();});
    // 사면 뒤에 선 나무: 꼭대기만 사면 위로 보인다
    trees.forEach(t=>{if(t[0]<x0-6||t[0]>x1+6)return;pine(sx(t[0]),sy(sjGy(t[0])+t[2]),t[1]*S,'#112634');});
    // 관중석(착지 구역 옆)
    if(x1>178){const by0=sjGy(200)+1;g.fillStyle='#1a2340';g.beginPath();g.moveTo(sx(181),sy(by0));g.lineTo(sx(184),sy(by0+6.6));g.lineTo(sx(300),sy(by0+6.6));g.lineTo(sx(303),sy(by0));g.fill();
      g.strokeStyle='rgba(159,176,200,.25)';g.lineWidth=1;for(let r=0;r<=8;r++){const Y=sy(by0+.35+r*.75);ln(sx(182),Y,sx(302),Y);}
      g.fillStyle='#2b3550';g.fillRect(sx(180),sy(by0+8.4),(122)*S,S*.7);g.fillStyle='#e3a72f';g.fillRect(sx(180),sy(by0+7.7),(122)*S,Math.max(1,S*.12));
      const cheer=res&&res.L<=1?1:0,cw=Math.max(1.2,S*.34);crowd.forEach(c=>{if(c[0]<x0||c[0]>x1)return;const j=RM?0:Math.max(0,Math.sin(tv*(cheer?9:2.5)+c[3]))*(cheer?.3:.06);
        g.fillStyle=c[2];g.fillRect(sx(c[0]),sy(by0+.75+c[1]*.75+j),cw,cw*1.2);g.fillStyle='rgba(30,22,16,.7)';g.fillRect(sx(c[0]),sy(by0+.75+c[1]*.75+j)-cw*.7,cw,cw*.7);});
      for(let x=190;x<300;x+=17){const X=sx(x),Y=sy(by0+6.6),wv=RM?0:Math.sin(tv*3+x)*S*.25;g.strokeStyle='#c9d3e2';g.lineWidth=1;ln(X,Y,X,Y-S*2.4);g.fillStyle=x%2?'#d6403a':'#f1d589';g.beginPath();g.moveTo(X,Y-S*2.4);g.lineTo(X+S*1.5,Y-S*2.1+wv);g.lineTo(X,Y-S*1.6);g.fill();}}
    // 땅(눈): 채운 다음 사면 겉면을 밝게 덧칠하고 정설 자국을 긋는다
    if(x0<0){const e=Math.min(.5,x1),hg=g.createLinearGradient(sx(-24),0,sx(0),0);hg.addColorStop(0,'#1a2442');hg.addColorStop(.7,'#45557e');hg.addColorStop(1,'#9fb1d2');g.fillStyle=hg;g.beginPath();g.moveTo(sx(x0),H+20);
      for(let x=x0;x<=e;x+=xs)g.lineTo(sx(x),sy(sjGy(Math.min(0,x))));g.lineTo(sx(e),H+20);g.fill();
      g.strokeStyle='rgba(214,225,245,.5)';g.lineWidth=Math.max(1.5,S*.2);g.beginPath();for(let x=x0;x<=Math.min(0,x1);x+=xs){const X=sx(x),Y=sy(sjGy(x))+1;x===x0?g.moveTo(X,Y):g.lineTo(X,Y);}g.stroke();}
    if(x1>0){const gr=g.createLinearGradient(0,sy(cam.y+10),0,sy(cam.y-30));gr.addColorStop(0,'#c9d6ec');gr.addColorStop(1,'#7f93bb');g.fillStyle=gr;g.beginPath();g.moveTo(sx(Math.max(0,x0)),H+20);
      for(let x=Math.max(0,x0);x<=x1;x+=xs)g.lineTo(sx(x),sy(sjGy(x)));g.lineTo(sx(x1),H+20);g.fill();
      // 도약대 아래 옹벽
      g.fillStyle='#3a4560';g.fillRect(sx(0)-Math.max(2,S*.5),sy(0),Math.max(2,S*.5),3*S+2);}
    g.lineCap='butt';g.strokeStyle='#f6f9ff';g.lineWidth=Math.max(3,S*.9);g.beginPath();for(let x=Math.max(0,x0);x<=x1;x+=xs){const X=sx(x),Y=sy(sjGy(x))+S*.42;x===Math.max(0,x0)?g.moveTo(X,Y):g.lineTo(X,Y);}g.stroke();
    g.strokeStyle='rgba(120,150,200,.35)';g.lineWidth=1;[.22,.55,.78].forEach(o=>{g.beginPath();for(let x=Math.max(0,x0);x<=x1;x+=xs){const X=sx(x),Y=sy(sjGy(x))+S*o;x===Math.max(0,x0)?g.moveTo(X,Y):g.lineTo(X,Y);}g.stroke();});
    // 사면 가장자리의 전나무 가지 줄
    g.fillStyle='#24543d';for(let s=Math.ceil(Math.max(2,SJ_HILL.S[Math.max(0,Math.min(760,Math.round(x0*2)))])/2)*2;;s+=2){const x=sjXs(s);if(x>x1||s>230)break;g.fillRect(sx(x)-1,sy(sjGy(x))+S*.95,Math.max(2,S*.5),Math.max(1.5,S*.18));}
    // 거리 표시: 5m마다 눈금, 10m마다 숫자판. K점은 빨강, HS는 금색, 선두 선은 초록
    g.font='800 '+Math.max(9,Math.round(S*1.05))+'px system-ui,sans-serif';g.textAlign='center';
    for(let s=50;s<=150;s+=5){const x=sjXs(s);if(x<x0-2||x>x1+2)continue;const X=sx(x),Y=sy(sjGy(x));g.strokeStyle='rgba(40,70,130,.55)';g.lineWidth=1.2;ln(X,Y+1,X+S*.25,Y+S*.95);
      if(s%10===0){g.fillStyle='#14203d';g.fillRect(X-S*1.25,Y+S*1.25,S*2.5,S*1.35);g.fillStyle='#f1f4fa';g.fillText(s,X,Y+S*2.3);}}
    const mark=(s,col,lab,glow)=>{const x=sjXs(s);if(x<x0-4||x>x1+4)return;const X=sx(x),Y=sy(sjGy(x));g.save();if(glow){g.shadowColor=col;g.shadowBlur=10;}g.strokeStyle=col;g.lineWidth=Math.max(2.5,S*.35);ln(X,Y-(glow?S*2.6+(glow===2?18:0):0),X+S*.3,Y+S*1.05);g.restore();
      g.font='800 '+Math.max(9,Math.round(S*.95))+'px system-ui,sans-serif';const tw=g.measureText(lab).width+8,ly=Y-S*2.6-(glow===2?18:0);g.fillStyle=col;g.fillRect(X-tw/2,ly-14,tw,14);g.fillStyle=glow===1?'#062417':'#1d150a';g.fillText(lab,X,ly-3.5);};
    mark(SJ.K,'#e0504a','K '+SJ.K);mark(SJ.HS,'#e3a72f','HS '+SJ.HS);if(T>=-.5&&need>70&&need<160&&!res)mark(need,'#3fe08f','선두 '+need.toFixed(1)+'m',1);
    if(res)mark(res.d,'#f1d589',res.d.toFixed(1)+'m',2);
    // 진입로 · 도약대: 받침 기둥 → 콘크리트 몸통 → 눈 덮인 윗면과 얼음 홈
    const IN=SJ_HILL;g.strokeStyle='#2b3550';g.lineWidth=Math.max(1.5,S*.3);for(let u=3;u<LIN+3;u+=6){const p=sjIn(u);if(p.x<x0-3||p.x>x1+3)continue;ln(sx(p.x),sy(p.y),sx(p.x),sy(sjGy(p.x)));
      g.save();g.lineWidth=1;g.globalAlpha=.6;const q=sjIn(u+6);ln(sx(p.x),sy(sjGy(p.x)),sx(q.x),sy(q.y));g.restore();}
    g.fillStyle='#3a4560';g.beginPath();g.moveTo(sx(0),sy(-3));for(let k=0;k<IN.IX.length;k++)g.lineTo(sx(IN.IX[k]),sy(IN.IY[k]-.2));for(let k=IN.IX.length-1;k>=0;k-=8)g.lineTo(sx(IN.IX[k]),sy(IN.IY[k]-1.4));g.lineTo(sx(-1),sy(-3));g.fill();
    g.strokeStyle='#eef3fb';g.lineWidth=Math.max(2,S*.32);g.beginPath();for(let k=0;k<IN.IX.length;k++){const X=sx(IN.IX[k]),Y=sy(IN.IY[k]);k?g.lineTo(X,Y):g.moveTo(X,Y);}g.stroke();
    g.strokeStyle='#7fb2e6';g.lineWidth=1;g.beginPath();for(let k=0;k<IN.IX.length;k++){const X=sx(IN.IX[k]),Y=sy(IN.IY[k])+S*.12;k?g.lineTo(X,Y):g.moveTo(X,Y);}g.stroke();
    g.strokeStyle='rgba(200,210,230,.6)';g.lineWidth=1;g.beginPath();for(let k=0;k<IN.IX.length;k+=4){const X=sx(IN.IX[k]),Y=sy(IN.IY[k]+1.05);k?g.lineTo(X,Y):g.moveTo(X,Y);}g.stroke();
    g.fillStyle='#e3a72f';g.fillRect(sx(0)-2,sy(0),4,Math.max(3,S*.5));
    // 출발대 오두막과 신호등
    {const p=sjIn(LIN+2.6),X=sx(p.x),Y=sy(p.y);if(X>-60&&X<W+60){g.fillStyle='#26304b';g.fillRect(X-S*3,Y-S*3.6,S*3.4,S*3.6);g.fillStyle='#e3a72f';g.beginPath();g.moveTo(X-S*3.5,Y-S*3.6);g.lineTo(X-S*1.3,Y-S*5);g.lineTo(X+S*.9,Y-S*3.6);g.fill();
      g.fillStyle='#ffe9a8';g.fillRect(X-S*2.4,Y-S*2.6,S*1.1,S*.9);const lp=sjIn(LIN-1.5),LX=sx(lp.x)+S*.5,LY=sy(lp.y+3.2);g.fillStyle='#10172a';g.fillRect(LX-S*.5,LY-S*.2,S*1,S*2.2);
      const on=st==='play'&&T>=0,c1=st==='play'&&T<0;g.fillStyle=c1?'#ff4d4d':'#4a2020';g.beginPath();g.arc(LX,LY+S*.4,S*.32,0,6.3);g.fill();g.fillStyle=on?'#3fe08f':'#163a28';g.beginPath();g.arc(LX,LY+S*1.4,S*.32,0,6.3);g.fill();}}
    // 착지 구역 광고판
    if(x1>150){for(let x=150;x<300;x+=6){if(x<x0-6||x>x1)continue;const Y=sy(sjGy(x)+1);g.fillStyle=(x/6)%2?'#14203d':'#e3a72f';g.fillRect(sx(x),Y,S*6-1,S*1+1);g.fillStyle=(x/6)%2?'#e3a72f':'#14203d';g.fillRect(sx(x)+S,Y+S*.42,S*4-1,Math.max(1,S*.16));}}
    // 비행 중 그림자: 사면에 떨어진 그림자가 다가오는 걸로 착지 시점을 가늠한다
    if(fl){const gy=sjGy(J.x);g.fillStyle='rgba(20,30,70,'+Math.max(.08,.32-J.h*.03)+')';g.beginPath();g.ellipse(sx(J.x),sy(gy)+1,S*(1.4+J.h*.08),S*.28,-sjGa(J.x),0,6.3);g.fill();}
    // 눈보라 입자
    g.fillStyle='#f6f9ff';parts.forEach(p=>{if(p.l<=0)return;g.globalAlpha=Math.min(1,p.l*1.6);const r=Math.max(1,p.r*S);g.fillRect(sx(p.x)-r/2,sy(p.y)-r/2,r,r);});g.globalAlpha=1;
    // 선수
    let P,ang;const fallen=R.le===null||(res&&res.L===5),Lk=R.le!==undefined&&R.le!==null?sjLg(R.le):-1;
    if(T<0){P=SJ_PO.bar;ang=J.a;}
    else if(T<TE){P=sjMix(SJ_PO.bar,SJ_PO.tuck,T/.5);ang=J.a;if(R.pe&&T>R.pe)P=sjMix(P,SJ_PO.ext,(T-R.pe)/.14);}
    else if(!landed){const J2=where(T-.03),pa=Math.atan2(J.y-J2.y,J.x-J2.x),tt=T-TE;
      P=R.e===null?sjMix(SJ_PO.tuck,SJ_PO.fly,tt/.9):sjMix(sjMix(SJ_PO.tuck,SJ_PO.ext,R.pe?1:tt/.12),SJ_PO.fly,(tt-.12)/.38);
      if(R.pl){const lp=Lk<=1?SJ_PO.tele:Lk===4?SJ_PO.touch:SJ_PO.two;P=sjMix(P,lp,(T-R.pl)/.2);}
      ang=pa+(1-Math.min(1,tt/.5))*.15;if(wob){const a=T-wob.t;if(a<1.2)ang+=Math.sin(a*16)*wob.a*Math.exp(-a*2.6);}
      if(R.pl)ang=ang+(sjGa(J.x)-ang)*Math.min(1,(T-R.pl)/.25);}
    else{const lt=T-TL;ang=J.a;
      if(fallen){const ft=fallT?T-fallT:0;P=sjMix(SJ_PO.two,SJ_PO.fall,ft/.3);if(!RM&&ft<.8)ang+=Math.sin(ft*9)*.25;}
      else if(Lk===4)P=lt<.9?SJ_PO.touch:sjMix(SJ_PO.touch,SJ_PO.glide,(lt-.9)/.6);
      else{const lp=Lk<=1?SJ_PO.tele:SJ_PO.two;P=lt<1?lp:sjMix(lp,res&&res.L<=1?SJ_PO.glide:sjMix(SJ_PO.glide,SJ_PO.two,.5),(lt-1)/.6);if(R.le===undefined)P=SJ_PO.two;}}
    jumper(sx(J.x),sy(J.y),ang,P,Math.max(13,S*1.6));
    // 비행 속도선(장식)
    if(fl&&!RM){g.strokeStyle='rgba(230,240,255,.28)';g.lineWidth=1;for(let i=0;i<7;i++){const yy=(rnd(i,50)*H+T*40*(i%3+1))%H,xx=(W-((T*(320+i*40)+rnd(i,51)*W)%(W+80)));ln(xx,yy,xx+18+i*3,yy-4);}}
    g.restore();
    // 눈송이(장식): 카메라와 함께 흐른다
    if(flakes.length){g.fillStyle='rgba(255,255,255,.75)';flakes.forEach(f=>{const X=((f.x*W-cam.x*S*f.z*.6+Math.sin(tv+f.p)*8)%W+W)%W,Y=((f.y*H+cam.y*S*f.z*.6+tv*22*f.z)%H+H)%H;g.fillRect(X,Y,f.z*1.6,f.z*1.6);});}
    // 판정 표시
    if(st==='play'){if(T>=TE-.95&&T<=TE+.3&&(R.e===undefined||T<R.pe+.25))ring(sx(0),sy(0),TE,'도약',R.e!==undefined);
      GU.forEach((G,i)=>{if(T>=G.t0-.35&&T<=G.t0+G.du+.35&&!(R.g[i]!==undefined&&T>(G.pt||(G.pt=T))+.45))bar(G,i);});
      if(T>=TS-.95&&T<=TL+.3&&!landed||R.pl&&T<R.pl+.25){const lx=sjXs(target()),Ly=sjGy(lx);ring(sx(lx),sy(Ly)-S*.8,TS,'착지',R.le!==undefined);}}
    // 위 정보판
    $('sjV').textContent=(J.v*3.6).toFixed(1);$('sjD').textContent=res?res.d.toFixed(1):fl||landed?Math.max(0,J.s||0).toFixed(1):'—';};
  const frame=now=>{if(!box.isConnected){stop();return;}raf=requestAnimationFrame(frame);tv+=1/60;
    if(st==='play'){// 탭을 잠깐 떠났다 오면 그만큼 시계를 멈춘 걸로 친다
      if(now-lastNow>250)clk0+=now-lastNow-16;lastNow=now;const tg=(now-clk0)/1000;let n=0;while(T+DT<=tg&&n++<240)step();}
    else if(st==='end'){T+=1/60;}
    draw();};
  // 안내판: 바람 · 선두 점수 · 세 번의 타이밍
  $('sjOv').innerHTML='<div class="sj-br"><b>라지힐 결승 · 마지막 점퍼</b><ol><li><em>도약</em>도약대 끝에서 고리가 맞물릴 때</li><li><em>비행</em>돌풍 표시가 초록 칸에 올 때</li><li><em>착지</em>땅에 닿기 직전(텔레마크)</li></ol>'+
    '<span>'+bd.map((r,i)=>(i+1)+'위 '+r.n+' <b>'+r.tot.toFixed(1)+'</b>').join(' · ')+'</span><span class="w">'+sjWtx(W0)+' · 선두를 넘으려면 약 '+need.toFixed(1)+'m</span></div>';
  // 시험·자동화용으로 일정만 바깥에서 읽을 수 있게 둔다
  box.__sj={get T(){return T;},get clk0(){return clk0;},get st(){return st;},TE:TE,TS:TS,TL:TL,GU:GU,R:R,get res(){return res;}};
  raf=requestAnimationFrame(frame);}
// 시뮬레이션: 보통 선수. 도약 ±75ms · 돌풍 ±70ms · 착지 ±120ms 정도로 흔들리고, 가끔(6%) 한 번씩 크게 어긋난다
function simJump(){const riv=sjRivals(),w=sjWind(),k=()=>Math.random()<.06?3:1;
  const r=sjOurs({e:sjG()*.075*k(),g:[0,1].map(()=>sjGg(Math.abs(sjG()*.07*k()))),le:.02+sjG()*.12*k(),w:w,nz:sjG()*1.2});
  const L=[r].concat(riv).sort((a,b)=>b.tot-a.tot),place=L.indexOf(r)+1,t=Math.min(3,place-1);
  return {lines:L.map((x,i)=>'<span class="k">'+(i+1)+'위</span>'+(x.me?'<b class="me">우리 선수</b>':x.n)+' · '+x.d.toFixed(1)+'m · '+x.tot.toFixed(1)+'점').concat(['<span class="k">우리 선수</span>'+SJ_LN[r.L]+' · 심판 '+r.st.toFixed(1)+' · 바람 '+sjF1(r.wc)]),
    head:r.d.toFixed(1)+'m · '+SJ_MEDAL[t],t:t};}
