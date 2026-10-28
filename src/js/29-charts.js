/* ---------- CHARTS (숫자 없이) ---------- */
function bars(rows){return rows.map((r,k)=>{const v=Math.round(cl(r.v)),pv=r.pv==null?null:Math.round(cl(r.pv));
  const gv=r.bad?100-v:v,col=r.neu?'#2f4a6b':gv>=66?'#2e7d55':gv>=40?'#9a6400':'#b3261e';
  const d=pv==null?0:v-pv,up=r.bad?d<=-3:d>=3,dn=r.bad?d>=3:d<=-3,ar=d>=3?'▲':d<=-3?'▼':'–',ac=r.neu?'#3d5a80':up?'#2e7d55':dn?'#b3261e':'var(--text-muted)';
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:9px"><span style="width:62px;font-size:12px;color:var(--text-secondary);flex-shrink:0">'+r.n+'</span>'+
  '<span style="position:relative;flex:1;height:10px;border-radius:5px;background:rgba(29,27,24,.06)">'+
  '<span style="position:absolute;left:0;top:0;bottom:0;width:'+v+'%;border-radius:5px;background:'+col+';animation:barG .9s cubic-bezier(.2,.8,.2,1) both;animation-delay:'+(k*55)+'ms"></span>'+
  (pv!=null?'<span style="position:absolute;top:-3px;bottom:-3px;left:calc('+pv+'% - 1px);width:2px;background:rgba(29,27,24,.6);border-radius:1px"></span>':'')+
  '</span><span style="width:14px;font-size:11px;text-align:center;color:'+ac+'">'+ar+'</span></div>';}).join('');}
// 세로 화면 결산용 지표 타일: 값과 작년 대비 변화(좋아지면 초록, 나빠지면 빨강)
function tiles(rows){return '<div class="rp-tl">'+rows.map(r=>{const v=Math.round(cl(r.v)),pv=r.pv==null?null:Math.round(cl(r.pv)),d=pv==null?0:v-pv;
  const gv=r.bad?100-v:v,col=r.neu?'#2f4a6b':gv>=66?'#2e7d55':gv>=40?'#9a6400':'#b3261e',good=r.bad?d<0:d>0,dc=r.neu?'#3d5a80':!d?'var(--text-muted)':good?'#2e7d55':'#b3261e';
  return '<div class="rp-t" style="--c:'+r.c+'"><span>'+r.n+'</span><b style="color:'+col+'">'+v+'</b><i style="color:'+dc+'">'+(d>0?'▲'+d:d<0?'▼'+(-d):'–')+'</i></div>';}).join('')+'</div>';}
function lineChart(series,n){const W=300,H=100,P=5,X=i=>P+i*(W-2*P)/n,Y=v=>P+(100-v)*(H-2*P)/100;
  let s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" aria-hidden="true">';
  for(let y=1;y<YRS;y++){const x=X(y*PY).toFixed(1);s+='<line x1="'+x+'" x2="'+x+'" y1="0" y2="'+H+'" stroke="rgba(29,27,24,.06)"/>';}
  [35,65].forEach(v=>{s+='<line x1="'+P+'" x2="'+(W-P)+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="rgba(29,27,24,'+(v===35?.4:.22)+')" stroke-dasharray="3 4"/>';});
  series.forEach(se=>{if(se.pts.length<2)return;const d=se.pts.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
    s+='<path d="'+d+'" fill="none" stroke="'+se.col+'" stroke-width="'+se.w+'" stroke-linejoin="round" stroke-linecap="round" pathLength="1" style="stroke-dasharray:1;stroke-dashoffset:1;animation:drawL 1.1s ease-out forwards"/>';
    const j=se.pts.length-1;s+='<circle cx="'+X(j).toFixed(1)+'" cy="'+Y(se.pts[j]).toFixed(1)+'" r="3.2" fill="'+se.col+'"/>';});
  return s+'</svg>';}
function dirByYear(){const ys=[];LOG.forEach(x=>{if(x.eventType==='임기 결정')return;(ys[x.cyear-1]=ys[x.cyear-1]||[]).push(x.dirScore);});
  const out=[];for(let i=0;i<ys.length;i++){const a=ys[i]||[];out.push(a.length?a.reduce((p,q)=>p+q,0)/a.length:0);}return out;}
function powerChart(){const v=dirByYear(),n=Math.max(v.length,1),W=300,H=128,mid=64,bw=(W-10)/n,sc=v2=>Math.max(-1,Math.min(1,v2/14))*54;
  let s='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" aria-hidden="true">';
  s+='<line x1="4" x2="'+(W-4)+'" y1="'+mid+'" y2="'+mid+'" stroke="rgba(29,27,24,.25)"/>';
  for(let t=1;t*YRS<n;t++){const x=(5+t*YRS*bw).toFixed(1);s+='<line x1="'+x+'" x2="'+x+'" y1="4" y2="'+(H-4)+'" stroke="rgba(29,27,24,.12)" stroke-dasharray="2 3"/>';}
  for(let t=0;t*YRS<n;t++){s+='<text x="'+(7+t*YRS*bw).toFixed(1)+'" y="12" font-size="9" fill="rgba(29,27,24,.45)">'+(t+1)+'기</text>';}
  v.forEach((d,i)=>{const h=sc(d),x=5+i*bw+bw*.18,w=bw*.64,y=h>=0?mid-h:mid,col=h>=0?'#b3261e':'#2f5f99';
    s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(1.5,Math.abs(h)).toFixed(1)+'" rx="2" fill="'+col+'" style="transform-origin:'+(x+w/2).toFixed(1)+'px '+mid+'px;animation:upY .6s cubic-bezier(.2,.8,.2,1) both;animation-delay:'+(i*45)+'ms"/>';});
  return s+'</svg>';}
const sbar=(n,v,mx,col,sub,k)=>'<div style="margin-top:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span><b>'+n+'</b> <span style="color:var(--text-muted)">'+sub+'</span></span><span style="font-weight:600">'+v+' <span style="color:var(--text-muted);font-weight:400">/ '+mx+'</span></span></div>'+
  '<div style="height:8px;border-radius:4px;background:rgba(29,27,24,.07);overflow:hidden"><div style="height:100%;width:'+Math.max(0,Math.min(100,v/mx*100))+'%;background:'+col+';border-radius:4px;animation:barG .9s cubic-bezier(.2,.8,.2,1) both;animation-delay:'+(500+k*120)+'ms"></div></div></div>';
const chip=(t,col,ex)=>'<span style="display:inline-block;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;margin:0 6px 6px 0;background:color-mix(in srgb,'+col+' 14%,var(--surface-1));border:1px solid color-mix(in srgb,'+col+' 45%,transparent);'+(ex||'')+'">'+t+'</span>';

