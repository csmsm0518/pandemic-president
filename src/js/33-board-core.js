/* ---------- 명예의 전당 공통: 사이트 주소, 글자 이스케이프 (명예의 전당 화면은 lazy/board) ---------- */
// 아티팩트(아이패드용)로 빌드하면 true가 된다. 아티팩트는 외부 주소에 연결할 수 없어서 순위표 대신 게임 사이트 링크를 보여 준다.
const IN_ART=false,SITE='https://csmsm0518.github.io/pandemic-president/';
const lbEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
