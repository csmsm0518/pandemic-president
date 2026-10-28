/* ---------- MAP ---------- */
const MAP={d:[],nb:[],inf:new Set(),dead:new Set(),tgt:10,dtgt:0,last:0,run:false};
(function(){const C=30,Rw=11;for(let r=0;r<Rw;r++)for(let c=0;c<C;c++){MAP.d.push({x:(c+.5)/C+(Math.random()-.5)*.02,y:(r+.5)/Rw+(Math.random()-.5)*.05,ph:Math.random()*6.28});}
 for(let r=0;r<Rw;r++)for(let c=0;c<C;c++){const a=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&rr<Rw&&cc>=0&&cc<C)a.push(rr*C+cc);}MAP.nb.push(a);}})();
function mapReset(){MAP.inf.clear();MAP.dead.clear();MAP.tgt=INIT.i;MAP.dtgt=0;}
function mapUpdate(){const N=MAP.d.length,want=Math.round(MAP.tgt/100*N);
  for(let s=0;s<4;s++){if(MAP.inf.size<want){let done=false;if(MAP.inf.size){const arr=[...MAP.inf],src=arr[Math.floor(Math.random()*arr.length)];const nb=MAP.nb[src].filter(j=>!MAP.inf.has(j)&&!MAP.dead.has(j));if(nb.length){MAP.inf.add(nb[Math.floor(Math.random()*nb.length)]);done=true;}}
    if(!done){const free=[];for(let k=0;k<N;k++)if(!MAP.inf.has(k)&&!MAP.dead.has(k))free.push(k);if(free.length)MAP.inf.add(free[Math.floor(Math.random()*free.length)]);}}
   else if(MAP.inf.size>want){const arr=[...MAP.inf];MAP.inf.delete(arr[Math.floor(Math.random()*arr.length)]);}else break;}
  const wd=Math.min(Math.round(N*.4),Math.round(MAP.dtgt/4));
  if(MAP.dead.size<wd){let cand=[...MAP.inf];if(!cand.length){cand=[];for(let k=0;k<N;k++)if(!MAP.dead.has(k))cand.push(k);}if(cand.length){const k=cand[Math.floor(Math.random()*cand.length)];MAP.inf.delete(k);MAP.dead.add(k);}}}
function mapDraw(){const c=document.getElementById('map');if(!c)return;const w=c.clientWidth||320,h=118;
  if(c.width!==Math.round(w*DPR)){c.width=Math.round(w*DPR);c.height=Math.round(h*DPR);}
  const x=c.getContext('2d');x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,w,h);const t=performance.now()/1000;
  for(let k=0;k<MAP.d.length;k++){const d=MAP.d[k],px=d.x*w,py=d.y*h;
    if(MAP.dead.has(k)){x.fillStyle='rgba(70,52,56,.95)';x.beginPath();x.arc(px,py,1.5,0,6.283);x.fill();}
    else if(MAP.inf.has(k)){const p=.7+.3*Math.sin(t*4.2+d.ph);x.shadowColor='#e34948';x.shadowBlur=8;x.fillStyle='rgba(227,73,72,'+p+')';x.beginPath();x.arc(px,py,2.5,0,6.283);x.fill();x.shadowBlur=0;}
    else{x.fillStyle='rgba(160,168,178,.32)';x.beginPath();x.arc(px,py,1.7,0,6.283);x.fill();}}}
function mapLoop(){if(!MAP.run)return;const t=performance.now();if(t-MAP.last>70){MAP.last=t;mapUpdate();}mapDraw();requestAnimationFrame(mapLoop);}
function mapStart(){if(MAP.run)return;MAP.run=true;requestAnimationFrame(mapLoop);}


