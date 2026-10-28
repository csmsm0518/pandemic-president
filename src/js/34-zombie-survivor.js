/* ---------- 좀비 아포칼립스: 서바이벌 액션 「방역선」 ----------
   좀비 무대는 정치 시뮬레이션 대신 따로 만든 액션 게임(zombie.html)을 화면 가득 띄운다. 게임이 끝나면 결과를 postMessage로 알려 오고,
   최고 점수는 기록 보관소(MEM)에 남긴다. 게임 안 음악과 겹치지 않게 그동안 배경음악은 멈춘다. */
let ZG=null;
function zgOpen(back){if(ZG)return;try{if(CINE)cineClose();}catch(e){}window.scrollTo(0,0);bgmSet(BGM.trk,false);
  const w=document.createElement('div');w.className='lbe zge';w.setAttribute('role','dialog');w.setAttribute('aria-label','좀비 아포칼립스 · 방역선');
  w.innerHTML='<iframe src="zombie.html?embed=1&nick='+encodeURIComponent(NICK||'')+'" title="방역선" allow="autoplay"></iframe>';
  document.body.appendChild(w);document.body.style.overflow='hidden';ZG={el:w,back:typeof back==='function'?back:home};
  const fr=w.querySelector('iframe');fr.onload=()=>{try{fr.contentWindow.focus();}catch(e){}};
  // 8초 안에 게임이 준비됐다고 알려 오지 않으면(파일을 못 받는 등) 바깥에 닫기 단추를 띄워 갇히지 않게 한다
  ZG.to=setTimeout(()=>{if(!ZG||ZG.ready)return;const b=document.createElement('button');b.type='button';b.className='zge-x';b.textContent='✕ 닫기';b.onclick=()=>{try{SFX.back();}catch(e){}zgClose();};ZG.el.appendChild(b);},8000);
  try{eggSet('zombie');}catch(e){}}
function zgClose(){if(!ZG)return;clearTimeout(ZG.to);const b=ZG.back||home;ZG.el.remove();ZG=null;document.body.style.overflow='';b();}
addEventListener('message',e=>{if(!ZG||!e.data||!e.data.zg)return;const fr=ZG.el.querySelector('iframe');if(!fr||e.source!==fr.contentWindow)return;
  if(e.data.zg==='ready'){ZG.ready=1;const x=ZG.el.querySelector('.zge-x');if(x)x.remove();return;}
  if(e.data.zg==='result'){const r=e.data;try{MEM.zg=MEM.zg||{best:0,runs:0,wins:0};MEM.zg.runs++;if(r.win)MEM.zg.wins++;if((+r.score||0)>MEM.zg.best)MEM.zg.best=+r.score||0;msave();}catch(x){}
    sendArcade('zg',{score:Math.round(+r.score||0),sec:Math.round(+r.time||0),win:!!r.win,detail:'처치 '+(+r.kills||0)+' · Lv '+(+r.level||0)+(r.win?' · 새벽 맞이':'')});}
  else if(e.data.zg==='close'){try{SFX.back();}catch(x){}zgClose();}});
