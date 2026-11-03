// 「격리 탈출」 단계마다 풀이가 있는지 확인한다: node tools/qxsolve.js [단계 번호…]
// 대통령을 조금 크게(+여유), 바이러스도 조금 크게, 빠르기는 조금 느리게 잡고 시간까지 넣어 너비 우선 탐색을 한다.
// 바이러스는 단계의 P초마다 같은 모습으로 돌아오므로 (자리, 시각 mod P, 모은 백신) 상태만 본다.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../src/lazy/qx/1-levels.js'),'utf8');
const blk=src.slice(src.indexOf('/*LV{*/')+7,src.indexOf('/*}LV*/'));
const M=new Function(blk+';return {QX_LV,qxPos,qxHit,QX_V,QX_H,QX_R};')();
const PAD=+(process.env.PAD||.03),SLOW=+(process.env.SLOW||.9);
function solve(li){const LV=M.QX_LV[li],m=LV.m,H=M.QX_H+PAD,R=M.QX_R+PAD,Hc=M.QX_H;
  if(m.length!==12||m.some(r=>r.length!==20))throw new Error('판 크기 '+li);
  const wall=(i,j)=>j<0||j>=12||i<0||i>=20||m[j][i]==='#';
  const boxW=(x,y)=>{for(let i=Math.floor(x-Hc);i<=Math.floor(x+Hc-1e-9);i++)for(let j=Math.floor(y-Hc);j<=Math.floor(y+Hc-1e-9);j++)if(wall(i,j))return true;return false;};
  const coins=LV.c.slice();m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='*')coins.push([i+.5,j+.5]);}));
  const S=[];m.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='S')S.push([i+.5,j+.5]);}));
  const sx=S.reduce((a,b)=>a+b[0],0)/S.length,sy=S.reduce((a,b)=>a+b[1],0)/S.length;
  let st=S.reduce((b,c)=>Math.hypot(c[0]-sx,c[1]-sy)<Math.hypot(b[0]-sx,b[1]-sy)?c:b);
  const N=Math.round(LV.P*17),dt=LV.P/N,s=M.QX_V*SLOW*dt;
  // 주기 확인
  const o=[0,0],o2=[0,0];for(const e of LV.e){for(const t of [0,.37,1.1]){M.qxPos(e,t,o);let ok=false;for(const f of LV.e){M.qxPos(f,t+LV.P,o2);if(Math.hypot(o[0]-o2[0],o[1]-o2[1])<1e-6){ok=true;break;}}if(!ok)throw new Error('주기 P가 맞지 않음: 단계 '+(li+1));}}
  const x0=st[0]-Math.floor(st[0]/s)*s,y0=st[1]-Math.floor(st[1]/s)*s,NX=Math.ceil((20-x0)/s),NY=Math.ceil((12-y0)/s);
  const NC=coins.length,NM=1<<NC;
  const valid=new Uint8Array(NX*NY);for(let iy=0;iy<NY;iy++)for(let ix=0;ix<NX;ix++){const x=x0+ix*s,y=y0+iy*s;valid[iy*NX+ix]=boxW(x,y)?0:1;}
  const EP=[];for(let k=0;k<N*2;k++){const t=k*dt/2,a=new Float64Array(LV.e.length*2);LV.e.forEach((e,q)=>{M.qxPos(e,t,o);a[q*2]=o[0];a[q*2+1]=o[1];});EP.push(a);}
  const hit=(x,y,h2)=>{const a=EP[h2%(N*2)];for(let q=0;q<a.length;q+=2)if(M.qxHit(x,y,a[q],a[q+1],H,R))return true;return false;};
  const exitAt=(x,y)=>m[Math.floor(y)][Math.floor(x)]==='E';
  const tot=NX*NY*N*NM;const seen=new Uint8Array(tot);
  const idx=(ix,iy,k,mk)=>((mk*N+k)*NY+iy)*NX+ix;
  let q=new Int32Array(1<<22),qn=0;const sIx=Math.round((st[0]-x0)/s),sIy=Math.round((st[1]-y0)/s);
  const pickup=(x,y,mk)=>{for(let c=0;c<NC;c++)if(!(mk>>c&1)&&M.qxHit(x,y,coins[c][0],coins[c][1],Hc,.2-.05))mk|=1<<c;return mk;};
  let cur=[[sIx,sIy,0,pickup(st[0],st[1],0)]];seen[idx(sIx,sIy,0,cur[0][3])]=1;
  for(let step=0;step<17*240&&cur.length;step++){const nx=[];
    for(const [ix,iy,k,mk] of cur){const k1=(k+1)%N;
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const jx=ix+dx,jy=iy+dy;if(jx<0||jy<0||jx>=NX||jy>=NY||!valid[jy*NX+jx])continue;
        const x=x0+jx*s,y=y0+jy*s,xm=x0+(ix+dx/2)*s,ym=y0+(iy+dy/2)*s;
        if(hit(xm,ym,k*2+1)||hit(x,y,k1*2))continue;const m2=pickup(x,y,mk);
        if(m2===NM-1&&exitAt(x,y))return {ok:true,sec:+((step+1)*dt).toFixed(1),coins:NC,states:tot};
        const id=idx(jx,jy,k1,m2);if(seen[id])continue;seen[id]=1;nx.push([jx,jy,k1,m2]);}}
    cur=nx;}
  return {ok:false,coins:NC,states:tot};}
const want=process.argv.slice(2).map(Number);
M.QX_LV.forEach((L,i)=>{if(want.length&&!want.includes(i+1))return;const t0=Date.now();let r;try{r=solve(i);}catch(e){r={err:e.message};}
  console.log((i+1)+'. '+L.n+' → '+(r.err?'오류 '+r.err:r.ok?'풀림 '+r.sec+'초':'풀이 없음')+'  (백신 '+r.coins+', '+(Date.now()-t0)+'ms)');});
