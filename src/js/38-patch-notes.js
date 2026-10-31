/* ---------- 업데이트 소식 ----------
   새 버전을 올릴 때 PATCHES 맨 위에 항목을 더한다(GAME_VER와 같은 이름). 업데이트 뒤 처음 홈 화면에 오면 한 번 자동으로 뜨고,
   홈 메뉴 「기타 → 업데이트 소식」에서 언제든 다시 볼 수 있다. 처음 온 사람(기록이 전혀 없음)에게는 띄우지 않고 읽은 것으로 쳐 둔다.
   v4.7: 지금까지의 4.x 소식을 모두 넣었다(v4.7은 크게, 나머지는 한 줄씩). */
const PATCHES=[
 {v:'v4.7',t:'핫패치 · 난이도 · 보관함 · 홈 화면',d:'2026-10-31',big:1,l:[
  ['난이도 재조정','지옥이 없어졌어요. 쉬움 · 보통 · 어려움 세 단계이고, 예전 보통은 쉬움으로, 예전 어려움은 보통으로, 예전 지옥은 어려움으로 한 단계씩 올라갔어요. 저장해 둔 게임은 같은 수치로 이어져요.'],
  ['보관함 (스텟 펌핑 쿠폰)','쿠폰으로 지지율 · 경제 · 방역 · 군사 · 권력 · 혼란 중 하나를 올릴 기회를 받아요. 게임 중 메뉴(≡)의 보관함에서 한 판 안에 아무 때나 쓸 수 있어요.'],
  ['홈 화면 정리','게임(새 게임 · 불러오기) · 오늘의 도전 · 기록(명예의 전당 · 도감) · 기타(가이드북 · 건의사항 · 쿠폰함 · 설정) 네 묶음으로 간단하게 바꿨어요.'],
  ['도감 · 명예의 전당','도감에서 아직 못 만난 닮은 지도자 카드에 "이름이 드러나지 않았다" 대신 어떤 결말과 성향이면 만날 수 있는지 조건이 보여요. 명예의 전당의 지옥 탭은 없어졌어요.'],
  ['세로 화면','세로 모드에서 홈 화면이 잘려 아래가 안 보이던 문제를 고쳤어요.']]},
 {v:'v4.6',t:'조선 국난',d:'2026-10-31',l:[['더 무섭고 직접 지휘','국난 화면을 새로 그리고, 난이도를 올리고, 해전 · 성벽 수비 등 직접 지휘 미니게임 다섯 가지를 더했어요.']]},
 {v:'v4.5',t:'오늘의 도전',d:'2026-10-31',l:[['하루 한 판','날마다 무대와 인물이 정해지고 모두가 같은 조건으로 겨뤄요. 순위에는 그날 처음 한 판만 올라가요.']]},
 {v:'v4.4',t:'기록 카드',d:'2026-10-30',l:[['공유 · 사진 저장','커리어가 끝나면 기록 카드를 사진으로 저장하거나 카카오톡 · 인스타 스토리로 공유할 수 있어요.']]},
 {v:'v4.3',t:'회원 로그인',d:'2026-10-30',l:[['회원','아이디로 가입하면 다른 기기에서도 한 사람으로 기록돼요(비회원으로도 그대로 할 수 있어요).']]},
 {v:'v4.2',t:'조선 · 그 임금의 시대의 국난',d:'2026-10-30',l:[['시대별 국난','조선에서 임금마다 그 시대에 실제로 있었던 국난이 닥쳐요.']]},
 {v:'v4.1',t:'조선 · 국난',d:'2026-10-30',l:[['5년 심판 대신 국난','조선의 5년마다 심판이 위기에 맞서는 「국난」으로 바뀌었어요.']]},
 {v:'v4.0',t:'건의사항함 · 쿠폰함',d:'2026-10-30',l:[['건의 · 쿠폰','홈 화면에서 건의사항을 보내고 쿠폰을 받을 수 있어요. 조선 점수 밸런스도 맞췄어요.']]}];
const vnum=s=>{const m=/(\d+)\.(\d+)/.exec(s||'');return m?+m[1]*100+ +m[2]:0;};
function newsHTML(all,from){
  const L=PATCHES.filter(n=>all||vnum(n.v)>from),cur=L.filter(n=>n.big),rest=L.filter(n=>cur.indexOf(n)<0);
  const blk=n=>'<section class="pn-s"><div class="pn-h"><b>'+n.v+'</b><span>'+gEsc(n.t)+'</span><time>'+n.d+'</time></div><ul>'+n.l.map(x=>'<li><b>'+gEsc(x[0])+'</b><span>'+gEsc(x[1])+'</span></li>').join('')+'</ul></section>';
  return '<div class="pn">'+cur.map(blk).join('')+(rest.length?'<details class="pn-old"><summary>이전 4.x 업데이트 '+rest.length+'개</summary>'+rest.map(blk).join('')+'</details>':'')+
    '<div class="svp-b pn-b"><button type="button" class="pri" id="pnOk">확인</button></div></div>';}
function newsOpen(all){const o=pop('업데이트 소식 · '+GAME_VER,newsHTML(true,0));const b=o.querySelector('#pnOk');b.onclick=()=>{try{SFX.click();}catch(e){}o.close();};b.focus();return o;}
// 홈 화면이 뜬 뒤 한 번: 이번 버전을 아직 안 봤으면 보여 주고 읽은 것으로 적는다
function newsCheck(){if(MEM.seenVer===GAME_VER)return;
  const old=!!(MEM.seenVer||MEM.careers||MEM.runs||MEM.best100||Object.keys(MEM.leaders||{}).length);
  if(!old){MEM.seenVer=GAME_VER;msave();return;}
  setTimeout(()=>{if(MEM.seenVer===GAME_VER||!document.querySelector('.gx-title,.hl')||document.querySelector('.svp-bg,.bx-bg'))return;
    const from=MEM.seenVer?vnum(MEM.seenVer):vnum(GAME_VER)-1;MEM.seenVer=GAME_VER;msave();
    const o=pop('업데이트 소식 · '+GAME_VER,newsHTML(false,from));const b=o.querySelector('#pnOk');b.onclick=()=>{try{SFX.click();}catch(e){}o.close();};try{SFX.unlock();}catch(e){}b.focus();},2800);}
