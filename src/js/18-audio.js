/* ---------- AUDIO ---------- */
// 위기 지수에 따라 깔리던 배경 웅웅거림과 심장 박동은 뺐다. 위기는 화면 가장자리의 붉은 기운(vign)으로만 보여 준다.
const AU={ac:null,m:null,on:true};
function aInit(){if(AU.ac){try{if(AU.ac.state!=='running'&&!document.hidden)AU.ac.resume();}catch(e){}return;}
  // 새로고침한 뒤에도 음소거가 효과음에 바로 걸리게, 만들 때부터 설정(음소거 · 크기)을 쓴다
  try{AU.ac=new (window.AudioContext||window.webkitAudioContext)();AU.m=AU.ac.createGain();const s=sndGet();AU.m.gain.value=s.mute?0:.7*s.fx;AU.m.connect(AU.ac.destination);doorPrep();}catch(e){AU.ac=null;}}
function tone(f,type,dur,vol,when,slide){if(!AU.ac)return;try{when=when||0;const t0=AU.ac.currentTime+when,o=AU.ac.createOscillator(),g=AU.ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+dur);
  g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+.012);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(AU.m);o.start(t0);o.stop(t0+dur+.05);}catch(e){}}
function noise(dur,vol,when,cut){if(!AU.ac)return;try{when=when||0;const t0=AU.ac.currentTime+when,n=Math.floor(AU.ac.sampleRate*dur),b=AU.ac.createBuffer(1,n,AU.ac.sampleRate),d=b.getChannelData(0);
  for(let k=0;k<n;k++)d[k]=Math.random()*2-1;const s=AU.ac.createBufferSource();s.buffer=b;const f=AU.ac.createBiquadFilter();f.type='lowpass';f.frequency.value=cut||800;
  const g=AU.ac.createGain();g.gain.setValueAtTime(vol,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);s.connect(f);f.connect(g);g.connect(AU.m);s.start(t0);}catch(e){}}
// 휙 지나가는 바람 소리: 띠 필터를 씌운 잡음의 중심 주파수를 f0→f1로 옮기며 커졌다 작아지게 한다
function sweep(dur,vol,f0,f1,when,q){if(!AU.ac)return;try{when=when||0;const t0=AU.ac.currentTime+when,n=Math.floor(AU.ac.sampleRate*dur),b=AU.ac.createBuffer(1,n,AU.ac.sampleRate),d=b.getChannelData(0);
  for(let k=0;k<n;k++)d[k]=Math.random()*2-1;const s=AU.ac.createBufferSource();s.buffer=b;const f=AU.ac.createBiquadFilter();f.type='bandpass';f.Q.value=q||.8;
  f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(f1,t0+dur);const g=AU.ac.createGain();
  g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+dur*.45);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  s.connect(f);f.connect(g);g.connect(AU.m);s.start(t0);s.stop(t0+dur+.02);}catch(e){}}
// 딸깍: 아주 짧게 사그라드는 잡음을 높은 띠로 걸러 기계 바늘이 핀에 걸리는 소리를 낸다
function clk(fr,vol,when){if(!AU.ac)return;try{when=when||0;const t0=AU.ac.currentTime+when,sr=AU.ac.sampleRate,n=Math.floor(sr*.018),b=AU.ac.createBuffer(1,n,sr),d=b.getChannelData(0);
  for(let k=0;k<n;k++)d[k]=(Math.random()*2-1)*Math.exp(-k/(sr*.0025));const s=AU.ac.createBufferSource();s.buffer=b;const f=AU.ac.createBiquadFilter();f.type='bandpass';f.frequency.value=fr;f.Q.value=3;
  const g=AU.ac.createGain();g.gain.value=vol;s.connect(f);f.connect(g);g.connect(AU.m);s.start(t0);}catch(e){}}
// 문 소리: 녹음(문 소리 4.mp3)에서 앞쪽의 큰 구간(원본 0.2~1.2초, 손잡이가 덜컥하고 걸쇠가 철컥 걸리는 소리)만 잘라 품었다.
// 따로 파일로 두면 file://에서 Web Audio로 읽지 못해 base64로 넣고, 처음 쓸 때 한 번 풀어 둔다(풀기 전에는 합성음으로 대신한다).
const DOOR={b64:'',buf:null,busy:false};
function doorPrep(){if(DOOR.buf||DOOR.busy||!AU.ac)return;DOOR.busy=true;const no=()=>{DOOR.busy=false;};
  // 소리 데이터는 lazy/door에 따로 있다. 아직 안 왔으면 받아 온 뒤 다시 부른다
  if(!DOOR.b64){lzLoad('door').then(()=>{DOOR.busy=false;doorPrep();},no);return;}
  try{const s=atob(DOOR.b64),u=new Uint8Array(s.length);for(let k=0;k<s.length;k++)u[k]=s.charCodeAt(k);
    const p=AU.ac.decodeAudioData(u.buffer,b=>{DOOR.buf=doorLoud(b);DOOR.busy=false;},no);if(p&&p.catch)p.catch(no);}catch(e){no();}}
// 녹음이 작게(최대 -16dB) 들어 있어 풀자마자 키운다: 가장 큰 곳을 꽉 차게 맞춘 뒤 tanh로 눌러 작은 덜컥 소리까지 함께 끌어올린다
function doorLoud(b){let pk=0;for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let k=0;k<d.length;k++)pk=Math.max(pk,Math.abs(d[k]));}
  if(!pk)return b;const dr=4,n=Math.tanh(dr);
  for(let c=0;c<b.numberOfChannels;c++){const d=b.getChannelData(c);for(let k=0;k<d.length;k++)d[k]=Math.tanh(d[k]/pk*dr)/n;}return b;}
// 잘린 파일의 0.1초 지점이 원본 0.2초(소리가 시작되는 곳)이고, 걸쇠 소리는 그로부터 0.47초 뒤에 난다
function door(vol,when){if(!AU.ac||!DOOR.buf){doorPrep();return false;}
  try{const t0=AU.ac.currentTime+(when||0),dur=1,s=AU.ac.createBufferSource(),g=AU.ac.createGain();s.buffer=DOOR.buf;
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+.01);g.gain.setValueAtTime(vol,t0+dur-.12);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    s.connect(g);g.connect(AU.m);s.start(t0,.1,dur);return true;}catch(e){return false;}}
const SFX={
 click:()=>tone(880,'sine',.05,.12),
 spin:()=>sweep(.5,.09,420,2200,0,.7),                       // 룰렛이 뜨며 돌기 시작
 rtick:()=>{clk(2500+Math.random()*600,.5);tone(1300,'triangle',.02,.035);},   // 룰렛 바늘이 칸 경계를 지날 때
 swoosh:()=>sweep(.55,.06,300,1500,0,.6),                    // 새 사건 띠가 화면을 가로지를 때
 shutIn:()=>{sweep(.6,.035,1700,260,0,.6);if(!door(.75,.09)){tone(62,'sine',.34,.26,.56,44);noise(.14,.05,.56,320);}},   // 연차 셔터가 닫히며 맞물림: 셔터가 맞닿는 0.56초에 걸쇠 소리가 나게 맞춘 문 소리
 shutOut:()=>{sweep(.6,.035,260,1500,0,.6);door(.75);},      // 연차 셔터가 열림: 닫힐 때와 같은 문 소리
 tick:(k=0)=>tone(1200+(+k||0)*40,'square',.025,.05),
 tier:t=>{if(t===0){[523,659,784,1047].forEach((f,k)=>tone(f,'triangle',.5,.22,k*.09));noise(.6,.06,.2,4000);}
  else if(t===1){tone(587,'sine',.16,.14);tone(784,'sine',.28,.12,.11);}
  else if(t===2){tone(330,'sawtooth',.28,.1);tone(233,'sawtooth',.42,.11,.16);}
  else{noise(.7,.35,0,260);tone(98,'sawtooth',.95,.2);tone(104,'sawtooth',.95,.2);tone(880,'square',.1,.09,.08);tone(880,'square',.1,.09,.3);}},
 report:()=>{noise(.5,.14,0,1400);tone(494,'sine',.35,.09,.18);tone(659,'sine',.4,.07,.32);},
 gate:()=>{tone(220,'sine',.9,.2,0,90);noise(1.2,.2,0,200);tone(58,'sine',.14,.35,.5);tone(58,'sine',.14,.3,.72);},
 grade:(g,w)=>{const m={S:[523,659,784,1047,1319],A:[523,659,784,1047],B:[523,659,784],C:[440,554],D:[392,330],F:[220,196]}[g];m.forEach((f,k)=>tone(f,'triangle',.55,.2,(w||0)+k*.11));},
 coin:()=>{tone(1319,'square',.08,.1);tone(1760,'square',.16,.1,.07);}};
// 쿵: 아래로 미끄러지는 낮은 사인에 짧은 잡음을 얹어 북·도장·발차기 같은 둔탁한 타격을 낸다
function thud(f,vol,when,dur){tone(f,'sine',dur||.22,vol,when,f*.5);noise(.06,vol*.35,when,500);}
// 호루라기: 높은 사인을 빠르게 떨게 한다
function whis(f,dur,vol,when){if(!AU.ac)return;try{when=when||0;const t0=AU.ac.currentTime+when,o=AU.ac.createOscillator(),l=AU.ac.createOscillator(),lg=AU.ac.createGain(),g=AU.ac.createGain();
  o.type='sine';o.frequency.value=f;l.frequency.value=28;lg.gain.value=f*.04;l.connect(lg);lg.connect(o.frequency);
  g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+.02);g.gain.setValueAtTime(vol,t0+dur-.06);g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
  o.connect(g);g.connect(AU.m);o.start(t0);l.start(t0);o.stop(t0+dur+.05);l.stop(t0+dur+.05);}catch(e){}}
// 아래 소리들의 w는 몇 초 뒤에 울릴지(화면 연출과 맞출 때)
Object.assign(SFX,{
 back:()=>tone(560,'sine',.06,.1),                            // 돌아가기·닫기: click보다 낮게
 lock:()=>{clk(700,.6);tone(220,'square',.05,.06,.02);clk(500,.5,.07);},   // 잠긴 인물을 누름
 start:()=>{thud(80,.35,0,.6);[392,523,659,784].forEach((f,k)=>tone(f,'triangle',.6,.14,.08+k*.1));tone(1568,'sine',1.2,.07,.5);tone(2093,'sine',1,.04,.55);},   // 취임·새 임기
 pick:s=>{clk(1900,.35);tone(700,'triangle',.07,.1);if(s===2)thud(120,.28,.03);else if(s===0)tone(990,'sine',.1,.05,.03);},   // 선택 확정(승부수는 북, 안전책은 맑게)
 rstop:()=>{clk(1100,.6);tone(150,'sine',.09,.18);},           // 룰렛 바늘이 멈춤
 alert:w=>{w=w||0;[0,.22].forEach(d=>{tone(880,'square',.11,.05,w+d);tone(660,'square',.11,.05,w+d+.11);});tone(73,'sine',.6,.16,w,55);},   // 정권 위기·신종 변이 같은 위기 사건
 special:()=>{[196,247,294].forEach(f=>tone(f,'sawtooth',.9,.04));tone(98,'sine',1,.2);thud(70,.3,0,.5);},   // 특별 과제 시작
 // 소식: 조선 조보는 북 두 번, 좀비 무전은 지직거림, TV는 짧은 징글, 신문은 기존 보고 소리. 나쁜 소식이면 속보 신호를 앞에 붙인다.
 news:(k,bad)=>{const w=bad&&k!=='jobo'?.32:0;if(w)[0,.1,.2].forEach(d=>tone(1320,'square',.05,.05,d));
  if(k==='jobo'){thud(85,.42,0,.45);thud(85,.3,.32,.4);}
  else if(k==='radio'){noise(.45,.09,w,4500);tone(1000,'sine',.08,.06,w+.45);tone(1000,'sine',.08,.06,w+.6);}
  else if(k==='tv'){[523,659,784].forEach((f,i)=>tone(f,'triangle',.22,.12,w+i*.12));tone(1047,'triangle',.6,.13,w+.36);tone(262,'sine',.7,.12,w+.36);}
  else{noise(.5,.14,w,1400);tone(494,'sine',.35,.09,w+.18);tone(659,'sine',.4,.07,w+.32);}},
 fire:()=>{noise(.12,.3,0,380);thud(70,.35,0,.3);},            // 참모 경질
 join:()=>{[784,988,1175,1568,1976].forEach((f,k)=>tone(f,'sine',.6,.09,k*.07));tone(2637,'sine',.8,.04,.4);noise(.6,.03,.2,6000);},   // 히든 인물 합류
 gavel:n=>{for(let k=0;k<(n||3);k++){clk(900,.9,k*.22);tone(320,'sine',.09,.22,k*.22,200);}},   // 의사봉
 votePass:()=>{[523,659,784,1047].forEach((f,k)=>tone(f,'triangle',.7,.16,k*.1));[523,659,784].forEach(f=>tone(f,'sine',1.2,.06,.45));},
 voteFail:()=>{tone(392,'triangle',.5,.14);tone(311,'triangle',.6,.14,.25);tone(233,'sawtooth',.9,.07,.5);tone(117,'sine',1,.18,.5);},
 martial:()=>{for(let k=0;k<3;k++){tone(520,'triangle',.45,.09,k*.9,880);tone(880,'triangle',.45,.09,k*.9+.45,520);}thud(60,.35,0,.6);[0,.35,.7,1.05,1.4,1.75,2.1,2.45].forEach(d=>noise(.06,.12,d,250));},   // 사이렌 + 군홧발
 coupOk:()=>{thud(55,.45,0,.8);[147,175,208].forEach(f=>tone(f,'sawtooth',1.6,.05,.15));tone(73,'sine',1.8,.2,.15);},   // 어둡게 내려앉는 화음
 coupFail:()=>{for(let k=0;k<4;k++){tone(960,'square',.25,.045,k*.5);tone(720,'square',.25,.045,k*.5+.25);}thud(50,.45,.1,.7);noise(.4,.15,.1,300);},   // 경찰 사이렌 + 철문
 endemic:()=>{[523,659,784,1047,1319].forEach((f,k)=>tone(f,'sine',1,.11,k*.08));tone(262,'triangle',1.4,.1,.1);},
 stamp:w=>{w=w||0;thud(95,.42,w,.25);noise(.08,.18,w,900);},   // 도장 쾅
 roll:s=>{for(let t=0;t<s;t+=.055)noise(.05,.04+.09*t/s,t,600);tone(110,'sine',s,.06,0,165);},   // 개표 북 굴림(s초)
 win:w=>{w=w||0;[523,659,784].forEach((f,k)=>tone(f,'triangle',.25,.16,w+k*.1));[523,659,784,1047].forEach(f=>tone(f,'triangle',1.3,.08,w+.32));tone(131,'sine',1.4,.16,w+.32);noise(.9,.04,w+.32,5000);},
 lose:w=>{w=w||0;[392,370,349,330].forEach((f,k)=>tone(f,'triangle',.4,.12,w+k*.22));tone(98,'sine',1.4,.2,w+.66);},
 rewind:()=>{sweep(.7,.09,2600,280,0,.9);[1568,1319,1047,784,659].forEach((f,k)=>tone(f,'sine',.09,.06,k*.08));tone(392,'triangle',.5,.12,.5);},   // 운명에 개입(되감기)
 fade:()=>{tone(330,'sine',1.2,.12,0,165);tone(247,'sine',1.4,.08,.1,123);},   // 운명을 받아들임
 // 커리어 엔딩: 무너진 결말은 낮게 울리고, 물러난 결말은 잔잔하게, 패배는 쓸쓸하게
 ending:k=>{if(/^(ousted|amendfail|coupfail|medfail|ecofail|deposed)$/.test(k)){thud(50,.45,0,1);[131,156,185].forEach(f=>tone(f,'sawtooth',2.2,.045,.1));noise(1.6,.08,0,180);}
  else if(/^(served|retire)$/.test(k)){[262,330,392,523].forEach((f,i)=>tone(f,'sine',1.6,.1,i*.18));tone(659,'sine',1.8,.06,.72);}
  else{[440,349,294].forEach((f,i)=>tone(f,'triangle',.9,.11,i*.35));tone(147,'sine',1.8,.14,.7);}},
 count:s=>{let t=0,g=.03;while(t<s){tone(1500,'square',.015,.03,t);g*=1.12;t+=g;}},   // 점수가 올라가는 동안(점점 느려진다)
 record:w=>{w=w||0;[1047,1319,1568,2093].forEach((f,k)=>tone(f,'sine',.8,.1,w+k*.09));for(let k=0;k<5;k++)tone(2637+Math.random()*800,'sine',.15,.03,w+.4+k*.12);},   // 최고 기록
 unlock:()=>{sweep(.8,.05,500,4000,0,2);[659,831,988,1319].forEach((f,k)=>tone(f,'sine',.7,.08,.2+k*.1));},   // 비밀 인물 해금
 zombie:()=>{tone(110,'sawtooth',1.2,.1,0,70);tone(116,'sawtooth',1.2,.08,.05,72);noise(1.2,.1,0,300);tone(880,'square',.1,.07,1);tone(880,'square',.1,.07,1.22);},
 // 미니게임
 beep:(n,w)=>tone(n?660:1320,'sine',n?.12:.4,.14,w||0),       // 3·2·1(n)과 시작(0)
 pause:()=>tone(440,'sine',.1,.08),
 medal:t=>{if(t===0){[523,659,784,1047].forEach((f,k)=>tone(f,'triangle',.3,.16,k*.12));[784,1047,1319].forEach(f=>tone(f,'triangle',1.2,.08,.5));noise(.8,.04,.5,5000);}
  else if(t===1){[523,659,784].forEach((f,k)=>tone(f,'triangle',.5,.14,k*.12));}
  else if(t===2){tone(523,'triangle',.3,.13);tone(659,'triangle',.5,.13,.14);}
  else{tone(330,'triangle',.4,.12);tone(262,'triangle',.6,.12,.2);}},
 tkWhiff:()=>sweep(.16,.05,900,2400,0,1.2),                    // 태권도: 발이 바람을 가른다
 tkWind:()=>tone(520,'triangle',.06,.05),                          // 상대가 발을 든다
 tkBlock:()=>{clk(900,.6);tone(180,'sine',.08,.14);},              // 팔로 막아 냈다
 tkHit:p=>{noise(.09,.16,0,2600);tone(p===3?150:110,'sine',.16,.24,0,60);if(p===3)tone(1320,'triangle',.18,.05,.06);},   // 호구에 꽂혔다(머리는 전자 호구 소리가 한 번 더)
 simRes:(n,t)=>{for(let i=0;i<n;i++)tone(1200,'square',.02,.04,i*.22);SFX.stamp(n*.22+.15);setTimeout(()=>SFX.medal(t),(n*.22+.35)*1000);},
 swing:()=>sweep(.16,.05,900,2600,0,1.1),                      // 백신 슬래시 칼바람
 whistle:()=>whis(2300,.4,.1),
 kick:()=>{thud(140,.4,0,.12);clk(600,.5);},
 dive:()=>sweep(.3,.08,600,200,0,.8),
 goal:()=>{noise(.35,.12,0,1200);[523,659,784,1047].forEach((f,k)=>tone(f,'triangle',.4,.14,.1+k*.08));tone(1047,'triangle',.9,.1,.42);},
 save:()=>{thud(180,.35,0,.15);noise(.1,.2,0,900);tone(587,'sine',.15,.12,.12);tone(784,'sine',.3,.12,.22);},
 miss:()=>{tone(330,'triangle',.3,.1);tone(262,'triangle',.45,.1,.15);},
 concede:()=>{tone(294,'triangle',.3,.12);tone(220,'triangle',.5,.12,.18);},
 stroke:s=>{const f=s==='L'?900:1150;sweep(.16,.07,f*1.6,f*.6,0,1.4);},   // 수영 팔 젓기(왼팔·오른팔 높이가 다르다)
 gulp:()=>{tone(180,'sine',.12,.12,0,120);tone(240,'sine',.1,.08,.08,150);},   // 같은 팔을 두 번 눌러 물을 먹음
 splash:w=>{w=w||0;noise(.5,.2,w,2200);sweep(.5,.1,3000,500,w,.7);},
 touch:()=>{clk(1300,.6);tone(1568,'sine',.5,.1,.03);},        // 수영 터치패드
 bow:()=>tone(140,'sawtooth',.5,.02,0,190),                    // 활시위 당김
 release:()=>{tone(196,'triangle',.25,.16,0,150);clk(400,.6);sweep(.35,.06,2500,900,.03,1.2);},
 thunk:s=>{if(!s)return sweep(.4,.05,1200,400,0,.8);clk(800,.8);thud(160,.3,0,.12);if(s>=9)[1319,1760].forEach((f,k)=>tone(f,'sine',.5,s===10?.1:.06,.08+k*.08));}});
// 소리 설정: 효과음(합성음)과 음악(배경음악)의 크기를 따로 0~100%로 정한다. 이 브라우저에 저장된다.
// mute: 음소거. 효과음·음악 크기는 그대로 두고 둘 다 끈다. 다시 켜면 원래 크기로 돌아온다.
const sndGet=()=>{const s=MEM.snd||{};return {fx:s.fx==null?1:s.fx,mu:s.mu==null?1:s.mu,mute:!!s.mute};};
const sndIco=()=>{const s=sndGet();return !s.mute&&(s.fx>0||s.mu>0)?ICO.vol:ICO.mute;};   // 음소거거나 둘 다 0이면 음소거 아이콘
function sndApply(){const s=sndGet(),fx=s.mute?0:s.fx,mu=s.mute?0:s.mu;AU.on=fx>0;BGM.vol=.45*mu;if(AU.m)AU.m.gain.value=.7*fx;
  document.querySelectorAll('#snd').forEach(b=>{b.innerHTML=sndIco();});bgmSync();}
// 소리 버튼을 누르면 효과음·음악 막대가 있는 작은 창이 뜬다. 창 밖을 누르거나 Esc로 닫는다.
function toggleSound(){if(document.querySelector('.sndp'))return sndClose();try{aInit();}catch(e){}const s=sndGet();
  const row=(k,l,d)=>'<div class="sndp-r"><div class="sndp-l"><b>'+l+'</b><span>'+d+'</span></div><div class="sndp-c"><input type="range" min="0" max="100" step="5" data-k="'+k+'" value="'+Math.round(s[k]*100)+'" aria-label="'+l+' 크기"><output>'+Math.round(s[k]*100)+'</output></div></div>';
  const o=document.createElement('div');o.className='sndp-bg';
  o.innerHTML='<div class="sndp" role="dialog" aria-label="소리 설정"><div class="sndp-h"><span>소리</span><button class="sndp-m" aria-pressed="'+s.mute+'">'+sndMuteH(s.mute)+'</button><button class="sndp-x" aria-label="닫기">✕</button></div>'+
    row('fx','효과음','버튼 · 판정 · 연출')+row('mu','음악','인트로·메뉴와 게임 중 배경음악')+'</div>';
  document.body.appendChild(o);o.querySelector('.sndp').classList.toggle('muted',s.mute);
  o.onclick=e=>{if(e.target===o)sndClose();};o.querySelector('.sndp-x').onclick=sndClose;
  const mb=o.querySelector('.sndp-m'),setMute=m=>{MEM.snd=Object.assign(sndGet(),{mute:m});msave();sndApply();mb.setAttribute('aria-pressed',m);mb.innerHTML=sndMuteH(m);o.querySelector('.sndp').classList.toggle('muted',m);};
  mb.onclick=()=>{const m=!sndGet().mute;setMute(m);if(!m)SFX.click();};
  o.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')sndClose();});
  let pv=0;o.querySelectorAll('input').forEach(r=>r.oninput=()=>{const k=r.dataset.k,v=+r.value/100;r.nextElementSibling.textContent=r.value;
    if(sndGet().mute)setMute(false);   // 음소거 중에 막대를 움직이면 음소거를 푼다
    MEM.snd=Object.assign(sndGet(),{[k]:v});msave();sndApply();
    if(k==='fx'&&v>0&&Date.now()-pv>120){pv=Date.now();SFX.click();}});   // 효과음은 움직일 때마다 짧게 들려 준다
  o.querySelector('input').focus();}
const sndMuteH=m=>(m?ICO.mute:ICO.vol)+'<span>'+(m?'음소거 해제':'음소거')+'</span>';
function sndClose(){const o=document.querySelector('.sndp-bg');if(o)o.remove();}
// 인트로 배경음악(index.html과 같은 폴더의 bgm.mp3): 메인 메뉴부터 나라·인물 고르기까지 반복하고, 게임이 시작되면 그 무대의 곡(BGM_PLAY)으로 넘어가거나 서서히 끈다.
// 브라우저는 한 번 누르기 전에는 소리를 막으므로, 막히면 첫 터치·키 입력 때 다시 튼다. 소리 끄기와 다른 앱으로 넘어가기를 따른다.
// 틀 때마다(처음 들어올 때·소리를 다시 켤 때·다른 앱에서 돌아올 때) 0에서 시작해 1초 동안 원래 크기로 커진다.
// 게임 중 음악은 무대마다 따로 둔다. 목록에 없는 무대는 예전처럼 게임이 시작되면 음악이 꺼진다.
// 곡을 바꿀 때는 같은 audio에 새 곡을 넣는다(Web Audio 연결은 audio 하나에 한 번만 걸 수 있어서). 지금 곡을 0.6초 동안 줄인 뒤 바꾸고, 새 곡은 1초 동안 커진다.
// 곡이 여럿인 무대는 한 곡이 끝나면 다음 곡으로 넘어가며 돌아가고(BGM.list), 시작 곡은 그때그때 고른다.
const BGM_PLAY={kr:['kr_bgm.mp3','kr_bgm2.mp3'],usa:['america_standardbgm.mp3','america_bgm2.mp3'],joseon:['chosun_bgm.mp3','chosun_bgm2.mp3'],zombie:'zombie_bgm.mp3'};
// 인트로·메인 메뉴 곡: 두 곡이 번갈아 나오고, 처음 들어올 때 어느 곡부터 나올지는 그때그때 다르다
const BGM_MENU=['bgm.mp3','main_bgm2.mp3'];
// 출처를 밝혀야 하는 곡: 나오는 동안 화면 위쪽에 ♫ 제목 – 작곡가 · 연주를 흘려 보여 준다(권리자가 요청하면 곡을 내린다)
// t 제목, a 작곡가(없으면 제목만), p 연주
// g 음량 보정: 곡마다 녹음 크기가 달라(소리가 나는 구간 평균 -13~-23dB) 모두 -18dB 언저리로 맞춘 배율
const BGM_INFO={'bgm.mp3':{t:'Sogno di Volare',a:'Christopher Tin',g:.58},'main_bgm2.mp3':{t:'Baba Yetu',a:'Christopher Tin',g:.7},'america_standardbgm.mp3':{t:'Hard Times Come Again No More',a:'Stephen Foster',g:1.72},
  'america_bgm2.mp3':{t:'Top Gun Anthem',a:'Harold Faltermeyer',p:'The Bands of HM Royal Marines',g:.76},
  'chosun_bgm.mp3':{t:'Variations on a Korean Folk Song',a:'John Barnes Chance',g:1.76},
  'chosun_bgm2.mp3':{t:'아름다운 나라',a:'한태수',p:'커버 드오',g:1.05},
  'zombie_bgm.mp3':{t:'The Avengers',a:'Alan Silvestri',g:.88},
  // 올림픽 응원가(플레이리스트를 곡마다 나눴다. a는 부른 사람)
  'olympic_1.mp3':{t:'Butterfly',a:'러브홀릭스',g:0.52},'olympic_2.mp3':{t:'오 필승 코리아',a:'YB(윤도현 밴드)',g:0.6},'olympic_3.mp3':{t:'Reds Go Together',a:'버즈',g:0.52},
  'olympic_4.mp3':{t:'Smile Boy (Rock Ver.)',a:'김연아, 이승기',g:0.44},'olympic_5.mp3':{t:'승리를 위하여 (Ver.2010)',a:'트랜스픽션',g:0.44},'olympic_6.mp3':{t:'We Are The One',a:'싸이',g:0.47},
  'olympic_7.mp3':{t:'아름다운 나라',a:'신문희',g:0.47},'olympic_8.mp3':{t:'Champions',a:'조수미',g:0.45},'olympic_reds2018.mp3':{t:'승리의 함성 2018 (The Shouts of Reds)',g:0.36},
  'hafs_anthem.mp3':{t:'The Beautiful People · 외대부고 교가',a:'김정욱 작곡 · 남봉철 작사',p:'HAFS Philharmonic Orchestra & Concert Choir',g:1.58},
  'kr_bgm.mp3':{t:'스토브리그 OST',g:.65},'kr_bgm2.mp3':{t:'Waltzing Matilda',a:'Christina Macpherson',p:'Civilization VI',g:.7}};
// 지금 곡을 틀 크기: 설정 음량(BGM.vol)에 곡 보정을 곱한다(audio.volume은 1을 넘을 수 없다)
function bgmLv(){return Math.min(1,BGM.vol*((BGM_INFO[BGM.trk]||{}).g||1));}
const ICO_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',ICO_PAUSE='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
  ICO_PREV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2.5v14H6zM9.5 12 19 5.5v13z" fill="currentColor"/></svg>',ICO_NEXT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 5H18v14h-2.5zM14.5 12 5 18.5v-13z" fill="currentColor"/></svg>';
// 재생/일시정지: 음악만 멈추고(효과음은 그대로) 띠는 남는다. 다시 누르면 이어서 튼다.
// 브라우저가 자동 재생을 막았으면(BGM.blocked) 시작 화면의 '배경음악 켜기'를 보이고, 띠의 단추도 재생 모양으로 둔다
function bgmCue(){const off=BGM.blocked&&BGM.want&&BGM.vol>0&&!BGM.hold;document.querySelectorAll('.bgm-cue').forEach(b=>{b.hidden=!off;});
  const el=document.getElementById('npl'),b=el&&el.querySelector('.npl-pp'),stop=BGM.hold||BGM.blocked;if(b){b.innerHTML=stop?ICO_PLAY:ICO_PAUSE;b.setAttribute('aria-label',stop?'음악 재생':'음악 일시정지');}if(el)el.classList.toggle('hold',!!stop);}
document.addEventListener('click',e=>{if(!e.target.closest('.bgm-cue'))return;try{aInit();}catch(x){}BGM.hold=false;bgmSync();});
function bgmHold(){if(BGM.blocked&&!BGM.hold)return bgmSync();BGM.hold=!BGM.hold;bgmSync();const el=document.getElementById('npl');if(el){el.classList.toggle('hold',!!BGM.hold);const b=el.querySelector('.npl-pp');if(b){b.innerHTML=BGM.hold?ICO_PLAY:ICO_PAUSE;b.setAttribute('aria-label',BGM.hold?'음악 재생':'음악 일시정지');}}}
function bgmInfo(){let el=document.getElementById('npl');const I=BGM_INFO[BGM.trk],on=!!I&&BGM.want&&BGM.vol>0&&!document.hidden;
  if(!on){if(el)el.classList.remove('on');return;}
  if(!el){el=document.createElement('div');el.id='npl';el.className='npl';el.setAttribute('role','status');document.body.appendChild(el);
    el.innerHTML='<i aria-hidden="true">♫</i><span class="npl-w" aria-hidden="true"><span class="npl-m"></span></span>'+
      '<button class="npl-b" data-d="-1" aria-label="이전 곡">'+ICO_PREV+'</button><button class="npl-b npl-pp" aria-label="음악 일시정지">'+ICO_PAUSE+'</button><button class="npl-b" data-d="1" aria-label="다음 곡">'+ICO_NEXT+'</button>';
    el.querySelectorAll('.npl-b').forEach(b=>{b.onclick=e=>{e.stopPropagation();if(b.dataset.d)bgmSkip(+b.dataset.d);else bgmHold();};});}
  if(el.dataset.trk!==BGM.trk){el.dataset.trk=BGM.trk;el.setAttribute('aria-label','지금 나오는 곡: '+I.t+(I.a?', '+I.a:''));
    NPL.s='<span>'+I.t+(I.a?' – '+I.a:'')+(I.p?' · '+I.p:'')+'</span>';NPL.x=null;}
  bgmCue();
  void el.offsetWidth;el.classList.add('on');nplRun();}
// 띠의 글자는 기차처럼 오른쪽 끝에서 천천히(초당 24px) 들어와 왼쪽으로 빠져나가고, 한 칸(제목+간격) 뒤에 같은 제목이 줄지어 따라온다.
// 띠를 다 채울 만큼 같은 칸을 이어 붙이고, 한 칸만큼 지나가면 제자리로 돌려 끊김 없이 이어지게 한다(글꼴이 늦게 들어와 칸 폭이 바뀔 수 있어 돌릴 때마다 다시 잰다).
const NPL={s:'',x:null,u:0,t:0,raf:0};
function nplRun(){if(NPL.raf)return;const step=now=>{NPL.raf=0;const el=document.getElementById('npl');if(!el||!el.classList.contains('on')||document.hidden)return;
    if(now-NPL.t<30&&NPL.x!==null){NPL.raf=requestAnimationFrame(step);return;}
    const w=el.querySelector('.npl-w'),m=el.querySelector('.npl-m'),W=w.clientWidth;
    if(NPL.x===null||m.dataset.w!==String(W)){const one=document.createElement('span');one.innerHTML=NPL.s;m.innerHTML='';m.appendChild(one.firstChild);
      NPL.u=m.firstChild.offsetWidth||1;m.innerHTML=NPL.s.repeat(Math.ceil(W/NPL.u)+2);m.dataset.w=W;if(NPL.x===null)NPL.x=W;NPL.t=now;}
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)NPL.x=0;
    else if(!el.classList.contains('hold'))NPL.x-=Math.min(.1,(now-NPL.t)/1000)*24;
    NPL.t=now;if(NPL.x<=-NPL.u){NPL.u=m.firstChild&&m.firstChild.offsetWidth||NPL.u;NPL.x+=NPL.u;}m.style.transform='translateX('+NPL.x.toFixed(1)+'px)';
    // 멈춰 있으면(일시정지 · 동작 줄이기) 글자가 움직이지 않으니 고리를 쉰다. 다시 틀면 bgmInfo가 nplRun을 다시 부른다
    if(el.classList.contains('hold')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;NPL.raf=requestAnimationFrame(step);};
  NPL.raf=requestAnimationFrame(step);}
// 이전/다음 곡: 지금 무대의 곡 목록(한 곡뿐이면 그 곡을 처음부터) 안에서 옮겨 간다. 멈춰 있었으면 새 곡부터 다시 튼다.
function bgmSkip(d){const L=BGM.list||[BGM.trk],i=Math.max(0,L.indexOf(BGM.trk)),nx=L[(i+d+L.length)%L.length],a=BGM.el;BGM.hold=false;
  if(nx===BGM.trk){if(a)try{a.currentTime=0;}catch(e){}return bgmSync();}
  BGM.next=nx;
  if(a&&!a.paused)bgmRamp(0,300,()=>{if(BGM.next===nx)bgmSync();});else bgmSync();}
// cur: 지금 오디오에 실제로 걸린 곡(곡 파일은 틀 때만 받는다) · next: 바꾸기를 기다리는 곡 · own: 게임이 스스로 멈춘 중인지
const BGM={el:null,trk:BGM_MENU[Math.floor(Math.random()*BGM_MENU.length)],list:BGM_MENU,want:false,t:0,to:0,vol:.45,ac:null,g:null,gx:false,cur:'',next:null,own:0,visT:0};
function bgmEl(){if(!BGM.el){try{BGM.el=new Audio();BGM.el.preload='none';
    // 곡 목록이 있으면 끝난 곡 다음 곡을 이어서 튼다
    BGM.el.addEventListener('ended',()=>{if(!BGM.list)return;const L=BGM.list;BGM.next=L[(L.indexOf(BGM.trk)+1)%L.length];bgmSync();});
    // 게임이 멈추지 않았는데 멈췄으면(미디어 키 · 이어폰 뽑기 · 다른 앱의 소리) 사람이 멈춘 것으로 보고, 다음 터치에 저절로 다시 틀지 않는다
    BGM.el.addEventListener('pause',()=>{if(BGM.own){BGM.own=0;return;}const a=BGM.el;if(!a||a.ended||document.hidden||Date.now()-BGM.visT<1500)return;
      if(BGM.want&&!BGM.hold){BGM.hold=true;try{bgmCue();bgmInfo();}catch(e){}}});
    BGM.el.loop=true;}catch(e){}}return BGM.el;}
function bgmPause(a){if(!a||a.paused)return;BGM.own=1;try{a.pause();}catch(e){BGM.own=0;}}
// 곡 파일은 실제로 틀 때 건다(음악을 꺼 둔 사람은 파일을 받지 않는다)
function bgmLoad(a){if(BGM.cur===BGM.trk)return;BGM.cur=BGM.trk;try{a.src=BGM.trk;a.loop=!BGM.list;a.load();}catch(e){}}
// 사이트(http/https)에서는 Web Audio 게인으로 음량을 다룬다(아이폰·아이패드는 audio.volume을 바꿀 수 없어서 이렇게 해야 페이드가 된다).
// 파일로 직접 연 경우에는 브라우저가 이 연결의 소리를 막을 수 있어 audio.volume을 쓴다.
function bgmGain(a){if(BGM.gx)return BGM.g;BGM.gx=true;if(!/^https?:$/.test(location.protocol))return null;
  try{const C=window.AudioContext||window.webkitAudioContext;BGM.ac=new C();const s=BGM.ac.createMediaElementSource(a);
    BGM.g=BGM.ac.createGain();BGM.g.gain.value=0;s.connect(BGM.g);BGM.g.connect(BGM.ac.destination);}catch(e){BGM.g=null;}
  return BGM.g;}
// 음량을 ms 동안 v까지 고르게 바꾸고, 끝나면 done을 부른다
function bgmRamp(v,ms,done){const a=BGM.el,g=BGM.g;clearInterval(BGM.t);clearTimeout(BGM.t);BGM.to=v;
  if(g){const now=BGM.ac.currentTime,cur=g.gain.value;g.gain.cancelScheduledValues(now);g.gain.setValueAtTime(cur,now);g.gain.linearRampToValueAtTime(v,now+ms/1000);
    if(done)BGM.t=setTimeout(done,ms);return;}
  const v0=a.volume,n=Math.max(1,Math.round(ms/50));let k=0;
  BGM.t=setInterval(()=>{k++;try{a.volume=Math.max(0,Math.min(1,v0+(v-v0)*k/n));}catch(e){}if(k>=n){clearInterval(BGM.t);if(done)done();}},50);}
function bgmSync(){const a=bgmEl();if(!a)return;
  // 바꿀 곡이 기다리고 있으면 지금 바꾼다(줄어드는 사이 탭 숨김 · 소리 막대 같은 일이 끼어들어도 곡 바꾸기가 사라지지 않게)
  if(BGM.next){const nx=BGM.next;BGM.next=null;if(nx!==BGM.cur){clearInterval(BGM.t);clearTimeout(BGM.t);bgmPause(a);BGM.trk=nx;}}
  if(BGM.want&&BGM.vol>0&&!document.hidden&&!BGM.hold){bgmLoad(a);const g=bgmGain(a);if(BGM.ac&&BGM.ac.state!=='running')try{BGM.ac.resume();}catch(e){}
    if(a.paused){if(g)g.gain.value=0;else a.volume=0;const p=a.play();if(p&&p.then)p.then(()=>{BGM.blocked=false;bgmCue();},()=>{BGM.blocked=true;bgmCue();});bgmRamp(bgmLv(),1000);}
    else if(BGM.to!==bgmLv())bgmRamp(bgmLv(),300);}   // 이미 원래 크기로 가는 중이면 그대로 둔다(1초 페이드가 끊기지 않게)
  else if(!a.paused){clearInterval(BGM.t);clearTimeout(BGM.t);BGM.to=0;bgmPause(a);}bgmInfo();}
// 게임이 시작되면 1.2초 동안 줄이다가 멈춘다
// src 곡을 틀거나(on) 지금 곡을 1.2초 동안 줄이며 끈다
function bgmSet(src,on){BGM.want=on;bgmInfo();
  if(BGM.el)BGM.el.loop=!BGM.list;
  if(on&&(BGM.next||BGM.trk)!==src){const a=BGM.el;BGM.next=src;
    if(a&&!a.paused)bgmRamp(0,600,()=>{if(BGM.next===src)bgmSync();});else bgmSync();return;}
  if(on){if(BGM.next===BGM.trk)BGM.next=null;return bgmSync();}
  BGM.next=null;const a=BGM.el;if(!a||a.paused)return;bgmRamp(0,1200,()=>bgmPause(a));}
// 이스터에그: 인적사항 학교에 용인외대부고·외대부고·HAFS를 적은 사람에게만 교가가 목록 끝에 한 곡 더 끼어든다.
// 시작 곡은 늘 원래 목록에서 고르므로 교가가 첫 곡으로 나오지는 않고, 두 번째 곡부터 한 바퀴에 한 번씩 나온다.
const BGM_HAFS='hafs_anthem.mp3';
// PF는 아래쪽에서 선언되어 처음 그릴 때는 아직 없을 수 있다(그때는 교가를 넣지 않는다)
function bgmWith(L){let s='';try{s=String((PF&&PF.school)||'');}catch(e){}return /외대부고|hafs/i.test(s.replace(/\s/g,''))?L.concat(BGM_HAFS):L;}
// 메뉴를 다시 그릴 때(home)는 메뉴에서 이어 나오던 교가를 끊지 않고, 게임에서 메뉴로 돌아올 때만 교가 대신 메뉴 곡으로 시작한다
function bgmIntro(on){if(on){const was=!!(BGM.list&&BGM.list.indexOf(BGM_MENU[0])>=0);BGM.list=bgmWith(BGM_MENU);bgmSet(BGM.list.indexOf(BGM.trk)>=0&&(was||BGM.trk!==BGM_HAFS)?BGM.trk:BGM_MENU[Math.floor(Math.random()*BGM_MENU.length)],true);}else bgmSet(BGM.trk,false);}
// 게임을 시작하면 그 무대의 곡으로 넘어가고, 곡이 없는 무대는 음악을 끈다
// 올림픽 한정: 대한민국 하계올림픽 과제(olym)를 벌이는 동안에는 응원가 목록으로 바뀌고, 과제가 끝나면 무대 곡으로 돌아온다
const BGM_OLY=['olympic_1.mp3','olympic_2.mp3','olympic_3.mp3','olympic_4.mp3','olympic_5.mp3','olympic_6.mp3','olympic_7.mp3','olympic_8.mp3','olympic_reds2018.mp3'],OLY_SP=['olym','wolym'];
function bgmOly(){try{return !!(CP&&CP.id==='kr'&&CAR&&CAR.spRun&&OLY_SP.indexOf(CAR.spRun.id)>=0);}catch(e){return false;}}
function bgmGame(){const s=bgmOly()?BGM_OLY:CP&&BGM_PLAY[CP.id];if(!s)return bgmIntro(false);const L=[].concat(s),F=bgmWith(L);
  BGM.list=F.length>1?F:null;bgmSet(BGM.list&&BGM.list.indexOf(BGM.trk)>=0&&BGM.trk!==BGM_HAFS?BGM.trk:L[Math.floor(Math.random()*L.length)],true);}
['pointerdown','touchend','keydown'].forEach(t=>addEventListener(t,()=>{if(AU.ac&&AU.ac.state!=='running')try{AU.ac.resume();}catch(e){}
  if(BGM.want&&BGM.vol>0&&!BGM.hold&&BGM.el&&(BGM.el.paused||(BGM.ac&&BGM.ac.state!=='running')))bgmSync();},true));
document.addEventListener('visibilitychange',()=>{BGM.visT=Date.now();
  try{if(AU.ac){if(document.hidden)AU.ac.suspend();else if(AU.ac.state!=='running')AU.ac.resume();}}catch(e){}
  try{if(BGM.ac&&document.hidden)BGM.ac.suspend();}catch(e){}bgmSync();});
function vib(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

