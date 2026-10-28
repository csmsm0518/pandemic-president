// 팬데믹 대통령 - 연구용 기록 + 자동 분석 스크립트 (v15: 보안 — 크기·빈도 제한, 값 다듬기, 숨김 칸, 욕설 가리기, 중복 기록 정리 · 비밀 게임 「별똥별」)
//
// [기록 시트] 게임이 끝날 때마다 자동으로 쌓인다
//   "요약"       : 인생(커리어) 1개 = 1줄. 난이도·배경·결정 빈도·시대 조건, 임기 수, 퇴장 방식, 개헌, 닮은 지도자,
//                  권력 방향 통계, 최종 지표 10개, 마지막 임기 점수 구성, 커리어 점수 …
//   "임기별 결과" : 임기 1개 = 1줄. 임기 평가·점수·등급, 점수 구성 5개, 임기 말 지표 10개, 임기 말 결정, 그 임기의 선택 통계
//   "연간 결산"   : 1년 = 1줄. 연말 지표 10개, 그해 인명피해, 업적·불명예, 그해 선택 통계, 주사위
//   "선택 상세"   : 선택 1개 = 1줄. 사건·선택·권력 방향, 선택 직전/직후 지표, 고민 시간, 주사위, 난이도·배경 …
//   "참가자(비공개)" : 판ID, 학교, 이름, 전화번호, 동의 여부. 상품 연락용. 분석 시트에는 이름과 전화번호를 넣지 않는다.
//   모든 시트는 "판ID"로 서로 연결된다.
//
// [분석 시트] 새 기록이 들어오면 (최대 30초 간격으로) 자동으로 다시 계산된다. 메뉴 "팬데믹 분석 > 분석 새로고침"으로도 된다.
//   "분석"       : 개요, 난이도·배경·결정 빈도·시대 조건·닮은 지도자·퇴장 방식별 비교, 임기별·연차별 추이,
//                  상황별 권력 선택, 임기 말 결정, 업적·불명예 빈도, 위기 시나리오별 결과·선택, 대선 결과
//   "선택 분석"   : 사건별·선택지별 선택 횟수와 비율, 고민 시간, 주사위, 난이도별 선택 수, 평균 지표 변화
//   "분석 차트"   : 위 표를 그래프로
//
// [리더보드] doGet이 leaderboard.html과 게임 속 명예의 전당에 순위·통계를 JSON으로 내보낸다 (닉네임과 결과만).
//   커리어 점수는 상한 없는 정수 합계(이룬 것은 더하고 무너진 것은 뺀다). 이 체계로 기록된 판(기록 버전 12 이상)만 순위에 오른다.
//   난이도는 쉬움 · 보통 · 어려움 · 지옥. 기록 버전 12 전의 보통 · 어려움 · 지옥이 지금의 쉬움 · 보통 · 어려움이다.
//   명예의 전당은 전체 순위와 함께 난이도마다 따로 순위(byDiff)를 만들어 보낸다.
//
// 열은 항상 예전 버전 뒤에 이어 붙이므로, 이미 쌓인 기록과 줄이 어긋나지 않는다. 머리글(1행)은 자동으로 새 버전으로 바뀐다.

const SCRIPT_VER = 'v15';
// [비밀 게임 기록] v13: 좀비 서바이벌 「방역선」과 비밀 모드 「대항해」의 점수가 "비밀 게임 기록" 탭에 쌓이고, 명예의 전당 오른쪽 두 칸에 순위가 나온다.
const ARCADE = [['판ID', 'id'], ['게임', 'game'], ['닉네임', 'nickname'], ['학교', 'school'], ['점수', 'score'], ['시간(초)', 'sec'], ['성공', 'win'], ['세부', 'detail'], ['게임 버전', 'gv'],
  // ----- v15: 숨김(관리자가 아무 글자나 적으면 그 줄은 순위에서 빠진다. 서버가 말이 안 되는 기록을 받으면 스스로 사유를 적는다) -----
  ['숨김', 'hidden'], ['학교(적은 그대로)', 'schoolRaw'], ['플레이어ID', 'pid']];
const ARCADE_GAMES = {zg: '방역선', sail: '대항해', star: '별똥별'};

const SUMMARY = [
  ['판ID', 'id'], ['시작 시각', 'startedAt'], ['닉네임', 'nickname'],
  ['난이도', 'difficulty'], ['출신 배경', 'perk'], ['시대 조건', 'era'],
  ['마지막 임기 평가ID', 'endingId'], ['마지막 임기 평가', 'ending'], ['마지막 임기 점수', 'score'], ['마지막 임기 등급', 'grade'],
  ['플레이 시간(초)', 'playSeconds'], ['총 재임 개월', 'months'],
  ['최종 지지율', 'a'], ['최종 확산', 'i'], ['마지막 임기 최고 확산', 'peakI'], ['누적 인명피해 지수', 'deaths'],
  ['최종 의료', 'm'], ['최종 경제', 'e'], ['최종 행정권한', 'p'], ['최종 유착', 'c'],
  ['최종 갈등', 'u'], ['최종 견제', 'chk'], ['최종 투명성', 'trn'], ['최종 안전망', 'saf'],
  ['마지막 임기 제도 변화', 'ins'], ['최고 행정권한', 'peakP'], ['최고 유착', 'peakC'], ['권위주의 판정', 'auth'],
  ['선택 수', 'nChoices'], ['권력 집중 선택 수', 'nConc'], ['견제·분산 선택 수', 'nDisp'], ['중립 선택 수', 'nNeut'],
  ['평균 권력 방향 점수', 'avgDir'],
  ['1년차 평균 방향(전 임기)', 'dirY1'], ['2년차 평균 방향(전 임기)', 'dirY2'], ['3년차 평균 방향(전 임기)', 'dirY3'], ['4년차 평균 방향(전 임기)', 'dirY4'],
  ['첫 권력 집중 선택(커리어 턴)', 'firstConcTurn'], ['위기 사건 대응', 'crisis'],
  ['대성공', 'dice0'], ['성공', 'dice1'], ['실패', 'dice2'], ['대실패', 'dice3'],
  ['운명 개입 사용', 'rerolls'], ['남은 개입', 'tokensLeft'],
  // ----- v3 -----
  ['결정 빈도', 'mode'], ['임기 수(선)', 'terms'], ['총 재임(년)', 'careerYears'], ['퇴장 방식', 'exitType'],
  ['개헌 횟수', 'amendCount'], ['연임 가능했는데 퇴임', 'retireEligible'],
  ['닮은 지도자ID', 'leaderId'], ['닮은 지도자', 'leader'], ['커리어 점수', 'careerScore'],
  ['업적 수', 'trophiesGood'], ['불명예 수', 'trophiesBad'], ['업적·불명예 목록', 'trophyList'],
  ['임기별 등급', 'termGrades'], ['임기별 평가', 'termTitles'],
  ['1기 평균 방향', 'dirT1'], ['2기 평균 방향', 'dirT2'], ['3기 평균 방향', 'dirT3'], ['4기 평균 방향', 'dirT4'], ['5기 평균 방향', 'dirT5'],
  ['취임 나이', 'ageStart'], ['퇴임 나이', 'ageEnd'], ['강제 해산 선택', 'crushCount'],
  // ----- v4 -----
  ['임기별 점수', 'termScores'], ['평균 임기 점수', 'avgTermScore'],
  ['마지막 임기 점수 구성: 지지율', 'compA'], ['마지막 임기 점수 구성: 생명 보호', 'compLife'], ['마지막 임기 점수 구성: 경제', 'compEco'],
  ['마지막 임기 점수 구성: 청렴', 'compClean'], ['마지막 임기 점수 구성: 제도', 'compInst'],
  ['마지막 임기 생명 보호 점수(0~100)', 'lifeScore'], ['마지막 임기 제도 점수(0~100)', 'instScore'],
  ['임기 말 결정 흐름', 'termDecisions'], ['기록된 연도 수', 'yearsLogged'], ['기록 버전', 'v'],
  // ----- v5: 커리어 점수 100점 만점 = 성과 70 + 연임 15 + 명예 15 -----
  ['커리어 점수: 성과(70)', 'scorePerf'], ['커리어 점수: 연임(15)', 'scoreCont'], ['커리어 점수: 명예(15)', 'scoreHonor'],
  // ----- v6: 임기마다 다른 위기, 확률 대선 -----
  ['겪은 위기(임기 순)', 'scenarios'], ['대선 기록', 'elections'],
  // ----- v7: 판정은 상황 적합도(-1~1)에 따라, 선택이 쌓이면 노선별 후속 사건 -----
  ['선택이 부른 사건', 'pathEvents'], ['평균 판정 적합도', 'avgFit'],
  // ----- v8: 게임 v3.0 (무대 DLC, 특별 이벤트, 승부수·안전책, 참모, 군사, 마지막 승부) -----
  ['게임 버전', 'gv'], ['무대', 'campaign'], ['학교', 'school'], ['튜토리얼', 'tutorial'],
  ['개헌 방식', 'amendHow'], ['다음 대통령부터 적용한 개헌', 'amendFuture'], ['특별 이벤트', 'specials'], ['특별 이벤트 결말', 'specialEnds'],
  ['승부수 선택 수', 'nBold'], ['안전책 선택 수', 'nSafe'], ['승부수 대성공', 'boldWin'], ['승부수 대실패', 'boldLoss'],
  ['1번 참모 조언 따른 수', 'followSafe'], ['2번 참모 조언 따른 수', 'followBold'],
  ['참모 기록(임명·해임·사직·히든)', 'counselors'], ['마지막 참모', 'counselorsEnd'], ['비상소집', 'emergencyCall'],
  ['마지막 승부(임기 말 개헌)', 'lastShot'], ['최종 군사', 'milEnd'],
  // ----- v8.1: 특별 국정 과제 판, 경기 -----
  ['특별 과제 판 기록(해마다 고른 것·가능했던 것)', 'boardPicks'], ['백신 슬래시 등급', 'slashGrades'], ['엔데믹 선언', 'endemic'],
  // ----- v9: 게임 v3.1 -----
  ['계엄 시도', 'coup'], ['영구집권(계엄)', 'dict'],
  // ----- v10 (스크립트 v15): 숨김 — 관리자가 아무 글자나 적으면 그 판은 명예의 전당에서 빠진다. 말이 안 되는 점수는 서버가 사유를 적는다 -----
  ['숨김', 'hidden'],
  // ----- 학교: '학교' 칸에는 같은 학교끼리 합친 이름(예: 경기과고 → 경기과학고), 이 칸에는 학생이 적은 그대로 -----
  ['학교(적은 그대로)', 'schoolRaw'],
  // ----- 플레이어ID: 기기마다 만든 무작위 표시. 같은 사람의 여러 판을 한 사람으로 묶는 데만 쓴다(공개 순위에는 나가지 않는다) -----
  ['플레이어ID', 'pid']
];
// 상품 연락용 참가자 정보. 분석 시트와 따로 둔다.
const PRIVATE = [['판ID', 'id'], ['시작 시각', 'startedAt'], ['닉네임', 'nickname'], ['학교', 'school'], ['이름', 'realName'], ['전화번호', 'phone'], ['개인정보 동의', 'consent'], ['게임 버전', 'gv'], ['학교(적은 그대로)', 'schoolRaw']];

const DETAIL = [
  ['판ID', 'id'], ['닉네임', 'nickname'], ['순서', 'seq'], ['임기 내 턴', 'turn'], ['연차', 'year'],
  ['사건', 'event'], ['사건 유형', 'eventType'], ['선택 번호', 'optionNo'], ['선택지 수', 'nOptions'],
  ['선택', 'choice'], ['권력 방향', 'direction'], ['방향 점수', 'dirScore'], ['우선 가치', 'priority'],
  ['설계된 효과', 'effects'], ['주사위', 'dice'], ['운명 개입', 'rerolls'], ['고민 시간(초)', 'decideSec'],
  ['선택 후 지지율', 'a'], ['선택 후 확산', 'i'], ['선택 후 의료', 'm'], ['선택 후 경제', 'e'], ['선택 후 행정권한', 'p'], ['선택 후 유착', 'c'],
  ['선택 후 갈등', 'u'], ['선택 후 견제', 'chk'], ['선택 후 투명성', 'trn'], ['선택 후 안전망', 'saf'], ['인명피해 지수(임기)', 'deaths'],
  // ----- v3 -----
  ['임기(기)', 'term'], ['커리어 연차', 'cyear'], ['나이', 'age'], ['커리어 턴', 'cturn'],
  // ----- v4 -----
  ['난이도', 'difficulty'], ['결정 빈도', 'mode'], ['출신 배경', 'perk'], ['시대 조건', 'era'],
  ['선택 전 지지율', 'b_a'], ['선택 전 확산', 'b_i'], ['선택 전 의료', 'b_m'], ['선택 전 경제', 'b_e'], ['선택 전 행정권한', 'b_p'],
  ['선택 전 유착', 'b_c'], ['선택 전 갈등', 'b_u'], ['선택 전 견제', 'b_chk'], ['선택 전 투명성', 'b_trn'], ['선택 전 안전망', 'b_saf'],
  // ----- v6 -----
  ['위기 시나리오', 'scenario'],
  // ----- v7 -----
  ['판정 적합도(-1~1)', 'fit'], ['판정 근거', 'fitWhy'], ['노선 사건', 'path'],
  // ----- v8 -----
  ['무대', 'campaign'], ['특별 이벤트', 'special'], ['위험도', 'risk'], ['선택 성격', 'stake'],
  ['성공 확률(%)', 'pOk'], ['대성공 확률(%)', 'pBig'], ['대실패 확률(%)', 'pCrash'], ['화면 효과', 'effects6'], ['보여 준 선택지 전부', 'opts'],
  ['승부수 있었음', 'hasBold'], ['안전책 있었음', 'hasSafe'], ['지금 급한 문제', 'urgent'],
  ['1번 참모', 'adv1'], ['2번 참모', 'adv2'], ['1번 참모 추천', 'advSafe'], ['2번 참모 추천', 'advBold'], ['따른 참모', 'advFollow'],
  ['선택 전 군사', 'b_mil'], ['선택 후 군사', 'mil']
];

const CONTEXT = [['판ID', 'id'], ['닉네임', 'nickname'], ['난이도', 'difficulty'], ['결정 빈도', 'mode'], ['출신 배경', 'perk'], ['시대 조건', 'era']];
const IND = (pre) => [['지지율', 'a'], ['확산', 'i'], ['의료', 'm'], ['경제', 'e'], ['행정권한', 'p'], ['유착', 'c'],
  ['갈등', 'u'], ['견제', 'chk'], ['투명성', 'trn'], ['안전망', 'saf']].map(c => [pre + c[0], c[1]]);

const TERMS = CONTEXT.concat([
  ['임기(기)', 'term'], ['임기 시작 나이', 'ageStart'], ['재임 개월', 'months'],
  ['임기 평가ID', 'evalId'], ['임기 평가', 'evalTitle'], ['임기 점수', 'score'], ['등급', 'grade'], ['임기 말 결정', 'decision'],
  ['점수 구성: 지지율', 'compA'], ['점수 구성: 생명 보호', 'compLife'], ['점수 구성: 경제', 'compEco'],
  ['점수 구성: 청렴', 'compClean'], ['점수 구성: 제도', 'compInst'],
  ['생명 보호 점수(0~100)', 'lifeScore'], ['제도 점수(0~100)', 'instScore']
], IND('임기 말 '), [
  ['임기 최고 확산', 'peakI'], ['임기 인명피해', 'deaths'], ['누적 인명피해', 'cDeaths'], ['제도 변화', 'ins'], ['권위주의 판정', 'auth'],
  ['선택 수', 'nCh'], ['권력 집중 선택', 'nConc'], ['견제·분산 선택', 'nDisp'], ['중립 선택', 'nNeut'], ['평균 권력 방향', 'avgDir'],
  ['대성공', 'dice0'], ['성공', 'dice1'], ['실패', 'dice2'], ['대실패', 'dice3'], ['업적 수', 'troG'], ['불명예 수', 'troB'],
  // ----- v6 -----
  ['위기 시나리오', 'scenario'], ['대선 결과', 'elect'], ['임기 말 당선 가능성(%)', 'winP'],
  // ----- v8 -----
  ['임기 말 군사', 'mil']
]);

const YEARS = CONTEXT.concat([
  ['임기(기)', 'term'], ['연차', 'year'], ['커리어 연차', 'cyear'], ['나이', 'age'], ['한 해를 다 채움', 'done'],
  ['그 시점 임기 점수', 'score'], ['그 시점 등급', 'grade']
], IND('연말 '), [
  ['그해 인명피해', 'yd'], ['임기 인명피해', 'deaths'], ['누적 인명피해', 'cDeaths'],
  ['선택 수', 'nCh'], ['권력 집중 선택', 'nConc'], ['견제·분산 선택', 'nDisp'], ['중립 선택', 'nNeut'], ['평균 권력 방향', 'avgDir'],
  ['업적', 'troGood'], ['불명예', 'troBad'], ['대성공', 'dice0'], ['성공', 'dice1'], ['실패', 'dice2'], ['대실패', 'dice3'],
  // ----- v6 -----
  ['위기 시나리오', 'scenario'], ['연말 상황판 1', 'disp1'], ['연말 상황판 2', 'disp2'],
  // ----- v8 -----
  ['연말 군사', 'mil']
]);

function sheetWithHeader_(ss, name, cols) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  const header = ['기록 시각'].concat(cols.map(c => c[0]));
  if (sh.getLastRow() === 0) {
    sh.appendRow(header);
    sh.setFrozenRows(1);
  } else {
    // 머리글이 예전 버전이면 새 머리글로 덮어쓴다 (열 순서는 그대로라 기존 기록과 맞는다)
    const cur = sh.getRange(1, 1, 1, header.length).getValues()[0];
    if (cur.join('|') !== header.join('|')) sh.getRange(1, 1, 1, header.length).setValues([header]);
  }
  return sh;
}

// 수식 실행 방지: = + - @ 로 시작하는 글자는 글자로 저장 (숫자는 그대로)
function safe_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'number') return isFinite(v) ? v : '';
  v = String(v);
  if (v.length > MAX_CELL) v = v.slice(0, MAX_CELL);
  // 수식으로 읽히지 않게(=, +, -, @로 시작하면 앞에 따옴표)
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

// ===================== 보안 =====================
// 이 주소는 게임 코드에 들어 있어 누구나 볼 수 있다. 그래서 받기 전에 크기와 빈도를 보고, 받은 값은 길이와 범위를 다듬는다.
// 순위에는 '숨김' 칸이 빈 줄만 오른다. 닉네임·학교에 욕이 섞이면 명예의 전당에는 '익명' · 빈칸으로 보인다(시트의 원래 값은 그대로).
const MAX_BODY = 400000;     // 한 요청의 최대 글자 수(정상 기록은 한 조각 6만 자 안팎)
const RATE_ALL = 300;        // 1분 동안 받는 요청 수(전체). 넘으면 그동안은 받지 않는다(한꺼번에 쏟아붓는 요청 막기)
const RATE_ARCADE = 40;      // 같은 닉네임의 비밀 게임 기록은 10분에 이만큼까지(본게임 커리어 기록 · '익명'에는 걸지 않는다)
const MAX_CELL = 3000;       // 한 칸의 최대 글자 수
const SCORE_MAX = 60000;     // 커리어 점수의 절댓값이 이보다 크면 조작으로 보고 순위에서 뺀다
const ZG_MAX = 120000;       // 방역선 점수 상한(10분을 다 버텨도 4만 점 안팎)
const STAR_MAX = 200000;     // 별똥별 점수 상한
function out_(s) { return ContentService.createTextOutput(s); }
// 시간 칸(sec초)마다 key로 들어온 수를 센다. CacheService라 아주 정확하지는 않지만 쏟아붓는 요청은 충분히 막는다
function rateOk_(key, max, sec) {
  try {
    const c = CacheService.getScriptCache();
    const k = 'rl_' + String(key).slice(0, 60) + '_' + Math.floor(Date.now() / 1000 / sec);
    const n = Number(c.get(k) || 0) + 1;
    c.put(k, String(n), sec + 5);
    return n <= max;
  } catch (e) { return true; }
}
// 같은 조각이 두 번 오면(게임의 다시 보내기) 한 번만 쓴다. 6시간 동안 기억한다
function seen_(k) {
  if (!k) return false;
  try {
    const c = CacheService.getScriptCache(), key = 'rx_' + String(k).slice(0, 120);
    if (c.get(key)) return true;
    c.put(key, '1', 21600);
  } catch (e) {}
  return false;
}
const numOk_ = (v, lo, hi) => { const n = Number(v); return v !== '' && v !== null && isFinite(n) && n >= lo && n <= hi; };
// 욕설: 띄어쓰기·기호·숫자를 끼워 넣어도 걸리게 지운 뒤 본다. 걸리면 공개 화면에는 이름을 감춘다
const BAD_ = /(시발|씨발|씨빨|시빨|씨바|씨팔|시팔|씹|ㅅㅂ|ㅆㅂ|tlqkf|병신|븅신|빙신|ㅂㅅ|qudtls|좆|좃|존나|졸라|개새|개색|개세끼|새끼|섀끼|ㅅㄲ|지랄|ㅈㄹ|미친놈|미친년|또라이|엠창|느금|니애미|니에미|느그애미|애미|애비|창녀|걸레|등신|찐따|꺼져|닥쳐|섹스|야동|fuck|fuk|shit|bitch|asshole|pussy|porn|nigg|ㅗ)/i;
const BAD2_ = /(?<![남여])자지|(?<![맛])보지/;
function clean_(s) {
  s = String(s || '');
  const n = s.toLowerCase().replace(/[\s\u200b-\u200d\ufeff0-9._\-~!@#$%^&*()+=\[\]{}|\\:;"'<>,?\/`·…ㆍ]/g, '');
  return BAD_.test(n) || BAD2_.test(n) ? '' : s;
}
const pubNick_ = v => clean_(String(v || '익명').replace(/^'/, '').slice(0, 20)) || '익명';


// 판ID가 같고 '중도 이탈'로만 들어온 판이면 그 판의 줄을 모든 기록 탭에서 지운다(새로 온 끝난 기록이 대신한다)
function dropAbandoned_(ss, id) {
  if (!id || id === 'test') return;
  const sum = ss.getSheetByName('요약');
  if (!sum || sum.getLastRow() < 2) return;
  const head = sum.getRange(1, 1, 1, sum.getLastColumn()).getValues()[0];
  const ci = head.indexOf('판ID') + 1, ce = head.indexOf('퇴장 방식') + 1;
  if (!ci || !ce) return;
  const hits = sum.getRange(2, ci, sum.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findAll();
  if (!hits.length) return;
  // 그 판의 요약 줄이 모두 '중도 이탈'일 때만 지운다(끝난 기록이 이미 있으면 건드리지 않는다)
  if (!hits.every(h => String(sum.getRange(h.getRow(), ce).getValue()) === '중도 이탈')) return;
  ['요약', '선택 상세', '임기별 결과', '연간 결산', '참가자(비공개)'].forEach(n => {
    const sh = ss.getSheetByName(n);
    if (!sh || sh.getLastRow() < 2) return;
    const h0 = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], c = h0.indexOf('판ID') + 1;
    if (!c) return;
    const rows = sh.getRange(2, c, sh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findAll().map(r => r.getRow()).sort((a, b) => b - a);
    // 붙어 있는 줄은 한 번에 지운다(아래에서 위로)
    let i = 0;
    while (i < rows.length) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1] === rows[j] - 1) j++;
      sh.deleteRows(rows[j], j - i + 1);
      i = j + 1;
    }
  });
}

function appendRows_(ss, name, cols, list, now) {
  if (!list || !list.length) return;
  const rows = list.map(o => [now].concat(cols.map(c => safe_(o[c[1]]))));
  const sh = sheetWithHeader_(ss, name, cols);
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}

function doPost(e) {
  // 잠금을 잡기 전에 거른다: 너무 큰 요청 · 너무 잦은 요청 · JSON이 아닌 것
  const raw = e && e.postData ? String(e.postData.contents || '') : '';
  if (!raw || raw.length > MAX_BODY) return out_('too big');
  if (!rateOk_('all', RATE_ALL, 60)) return out_('busy');
  let d;
  try { d = JSON.parse(raw); } catch (err) { return out_('bad json'); }
  if (!d || typeof d !== 'object' || Array.isArray(d)) return out_('bad');
  // 같은 닉네임 제한은 비밀 게임 기록에만, 그리고 닉네임을 적은 사람에게만 건다('익명'은 여러 사람이 함께 쓰므로 빼고, 전체 제한만 받는다)
  if (d.kind === 'arcade') {
    const nk = String((d.rec && d.rec.nickname) || '').trim().slice(0, 20);
    if (nk && nk !== '익명' && !rateOk_('a_' + nk, RATE_ARCADE, 600)) return out_('busy');
  }
  // 같은 조각을 다시 보낸 것이면(게임의 다시 보내기) 한 번만 쓴다
  if (d.k && seen_(d.k)) return out_('dup');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date();
    // 비밀 게임 점수: 한 판 = 한 줄. 닉네임·학교·점수만 받는다(이름·전화번호는 오지 않는다)
    if (d.kind === 'arcade') {
      const a = d.rec || {};
      if (!ARCADE_GAMES[a.game]) return out_('bad game');
      const sr = String(a.school || '').slice(0, 30);
      const rec = {id: String(a.id || '').slice(0, 40), game: a.game, nickname: String(a.nickname || '익명').slice(0, 20), school: schoolName_(sr), schoolRaw: sr,
        score: Number(a.score) || 0, sec: Math.round((Number(a.sec) || 0) * 10) / 10, win: a.win ? '예' : '', detail: String(a.detail || '').slice(0, 80), gv: String(a.gv || '').slice(0, 20),
        pid: String(a.pid || '').replace(/[^0-9a-z]/gi, '').slice(0, 24)};
      // 말이 안 되는 기록은 저장은 하되 순위에서 빠지게 사유를 적어 둔다
      rec.hidden = !isFinite(rec.score) || !isFinite(rec.sec) || rec.sec < 0 ? '자동: 숫자 아님'
        : a.game === 'zg' && (rec.score < 0 || rec.score > ZG_MAX || rec.sec > 700) ? '자동: 점수 이상'
        : a.game === 'sail' && (rec.sec < SAIL_MIN_SEC || rec.sec > 1200) ? '자동: 시간 이상'
        : a.game === 'star' && (rec.score < 0 || rec.score > STAR_MAX || rec.sec > 3600) ? '자동: 점수 이상' : '';
      appendRows_(ss, '비밀 게임 기록', ARCADE, [rec], now);
      return out_('ok');
    }
    const run = d.run && typeof d.run === 'object' && !Array.isArray(d.run) ? d.run : {};
    run.nickname = String(run.nickname || '익명').slice(0, 20);
    run.pid = String(run.pid || '').replace(/[^0-9a-z]/gi, '').slice(0, 24);
    run.schoolRaw = String(run.school || '').slice(0, 30);
    run.school = schoolName_(run.schoolRaw);
    if (run.realName !== undefined) run.realName = String(run.realName || '').slice(0, 20);
    if (run.phone !== undefined) run.phone = String(run.phone || '').replace(/[^0-9\-]/g, '').slice(0, 13);
    // 말이 안 되는 커리어 점수 · 임기 수는 순위에서 빠지게 사유를 적는다(기록은 연구용으로 남긴다)
    run.hidden = '';
    if (run.careerScore !== '' && run.careerScore !== undefined && run.careerScore !== null && !numOk_(run.careerScore, -SCORE_MAX, SCORE_MAX)) run.hidden = '자동: 점수 이상';
    if (run.terms !== undefined && run.terms !== '' && !numOk_(run.terms, 0, 12)) run.hidden = '자동: 임기 수 이상';
    const cap = (L, n) => (Array.isArray(L) ? L.slice(0, n) : []).filter(o => o && typeof o === 'object' && !Array.isArray(o));
    d.choices = cap(d.choices, 800); d.terms = cap(d.terms, 14); d.years = cap(d.years, 80);
    run.v = d.v || '';
    run.gv = run.gv || d.gv || '';
    // 이름·전화번호는 분석 기록에서 떼어 내 참가자 탭에만 둔다
    const who = {id: run.id, startedAt: run.startedAt, nickname: run.nickname, school: run.school, schoolRaw: run.schoolRaw, realName: run.realName, phone: run.phone, consent: run.consent, gv: run.gv};
    delete run.realName; delete run.phone;
    const ctx = {id: run.id, nickname: run.nickname, difficulty: run.difficulty, mode: run.mode, perk: run.perk, era: run.era};
    const withCtx = list => (list || []).map(o => Object.assign({}, o, ctx));

    if (d.part === 'more') {
      // 긴 커리어는 선택 기록이 여러 조각으로 나뉘어 온다. 두 번째 조각부터는 선택 상세만 이어 붙인다.
      appendRows_(ss, '선택 상세', DETAIL, withCtx(d.choices), now);
    } else {
      // 저장 → 창 닫기('중도 이탈'이 먼저 감) → 불러와서 끝낸 판: 먼저 쌓인 중도 이탈 줄을 지우고 끝난 기록으로 대신한다
      if (run.id && String(run.exitType || '') !== '중도 이탈') dropAbandoned_(ss, String(run.id));
      if (who.realName || who.phone || who.school) appendRows_(ss, '참가자(비공개)', PRIVATE, [who], now);
      appendRows_(ss, '요약', SUMMARY, [run], now);
      appendRows_(ss, '선택 상세', DETAIL, withCtx(d.choices), now);
      appendRows_(ss, '임기별 결과', TERMS, withCtx(d.terms), now);
      appendRows_(ss, '연간 결산', YEARS, withCtx(d.years), now);
    }
  } finally {
    lock.releaseLock();
  }
  // 분석은 기록 저장과 따로 돈다. 실패해도 기록은 이미 저장됐다.
  try { maybeAnalyze_(); } catch (err) { console.error(err); }
  return ContentService.createTextOutput('ok');
}

// ===================== 자동 분석 =====================
const ANALYSIS_GAP_SEC = 30;      // 이 간격 안에 다시 들어온 기록은 다음 분석 때 함께 반영된다
const CHART_VER = 'v7-1';

function onOpen() {
  SpreadsheetApp.getUi().createMenu('팬데믹 분석')
    .addItem('분석 새로고침', 'refreshAnalysis')
    .addItem('차트 다시 만들기', 'rebuildCharts')
    .addSeparator()
    .addItem('기록 백업 후 새로 시작', 'archiveAndReset')
    .addToUi();
}
// 지금까지의 기록을 통째로 사본(내 드라이브)으로 떠 둔 뒤, 이 시트는 머리글만 남기고 비운다.
// 기록 탭은 머리글 줄을 남기고 지우고, 분석 탭은 내용과 차트를 지워 다음 기록이 들어오면 다시 계산되게 한다.
const RESET_DATA = ['참가자(비공개)', '요약', '선택 상세', '임기별 결과', '연간 결산', '비밀 게임 기록'];
const RESET_ANA = ['분석', '선택 분석', '분석 차트'];
function archiveAndReset() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ok = ui.alert('기록 백업 후 새로 시작', '지금까지의 모든 기록을 사본으로 만든 뒤, 이 시트의 기록을 비웁니다(머리글은 남김).\n계속할까요?', ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  let copy;
  try {
    const stamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH.mm');
    copy = ss.copy(ss.getName() + ' 백업 ' + stamp);
    RESET_DATA.forEach(n => {
      const sh = ss.getSheetByName(n);
      if (!sh || sh.getLastRow() < 2) return;
      // 고정 줄(머리글)만 남기고 나머지 줄을 모두 지우는 것은 시트가 막으므로, 2행은 비워 두고 3행부터 지운다
      sh.getRange(2, 1, sh.getLastRow() - 1, sh.getMaxColumns()).clearContent();
      if (sh.getMaxRows() > 2) sh.deleteRows(3, sh.getMaxRows() - 2);
    });
    RESET_ANA.forEach(n => {
      const sh = ss.getSheetByName(n);
      if (!sh) return;
      sh.getCharts().forEach(c => sh.removeChart(c));
      sh.clear();
    });
    const props = PropertiesService.getDocumentProperties();
    props.deleteProperty('chartVer');
    props.deleteProperty('anaDirty');
  } finally {
    lock.releaseLock();
  }
  try { CacheService.getScriptCache().remove('board_v15_n'); } catch (e) {}   // 명예의 전당 캐시도 바로 비운다
  ui.alert('완료', '백업 사본: ' + copy.getName() + '\n' + copy.getUrl() + '\n\n이 시트는 새 기록부터 다시 쌓입니다.', ui.ButtonSet.OK);
}
function refreshAnalysis() {
  buildAnalysis_();
  try { SpreadsheetApp.getActiveSpreadsheet().toast('분석을 새로 계산했습니다.', '팬데믹 분석', 4); } catch (e) {}
}
function rebuildCharts() {
  PropertiesService.getDocumentProperties().deleteProperty('chartVer');
  buildAnalysis_();
}
function maybeAnalyze_() {
  const props = PropertiesService.getDocumentProperties();
  props.setProperty('anaDirty', '1');              // 아직 분석에 반영 안 된 기록이 있다는 표시
  const cache = CacheService.getScriptCache();
  if (cache.get('ana_recent')) return;             // 방금 분석했으면 다음 기회(다음 기록이나 리더보드 갱신)에
  const lock = LockService.getDocumentLock() || LockService.getUserLock();
  if (!lock.tryLock(0)) return;
  try {
    cache.put('ana_recent', '1', ANALYSIS_GAP_SEC);
    props.deleteProperty('anaDirty');
    buildAnalysis_();
  } catch (err) {
    props.setProperty('anaDirty', '1');
    throw err;
  } finally {
    lock.releaseLock();
  }
}

// ---------- 작은 도구들 ----------
const num_ = x => (x === '' || x === null || x === undefined || isNaN(Number(x)) ? null : Number(x));
const r1_ = v => Math.round(v * 10) / 10;
function avg_(a) { const b = a.filter(x => x !== null); return b.length ? r1_(b.reduce((s, x) => s + x, 0) / b.length) : ''; }
function pctOf_(n, d) { return d ? r1_(n / d * 100) : ''; }
function table_(ss, name, cols) {
  const sh = ss.getSheetByName(name);
  const lab = {};
  cols.forEach(c => { lab[c[1]] = c[0]; });
  if (!sh || sh.getLastRow() < 2) return {rows: [], L: lab};
  const v = sh.getDataRange().getValues(), h = v[0];
  const rows = v.slice(1).map(r => { const o = {}; h.forEach((k, i) => { o[k] = r[i]; }); return o; })
    .filter(o => String(o['판ID']) !== 'test');          // 편집기 테스트 줄은 분석에서 뺀다
  return {rows: rows, L: lab};
}
const DIFFS = ['쉬움', '보통', '어려움', '지옥'];
const BOARD_MIN_VER = 12;   // 이 기록 버전보다 오래된 판(100점 체계, 예전 난이도 이름)은 순위에서 뺀다
// 게임이 새 점수 체계로 바뀐 뒤에도 한동안 기록 버전을 11로 보냈다. 그 시각(2026-10-28 04:24 KST) 뒤의 11은 새 체계 판이다
const BOARD_V11_FROM = Date.parse('2026-10-27T19:24:00Z');
function boardVerOk_(ver, t) {
  if (ver >= BOARD_MIN_VER) return true;
  if (ver !== 11) return false;
  const ms = t instanceof Date ? t.getTime() : Date.parse(String(t));
  return !isNaN(ms) && ms >= BOARD_V11_FROM;
}
// 대항해는 해협 22,200을 최고 속도(순풍 돛)로 내달려도 30초가 넘게 걸린다. 그보다 짧은 기록은 시험 판이나 조작으로 보고 뺀다
const SAIL_MIN_SEC = 25;
const BGS = ['감염병 학자', '기업인', '인권 변호사', '군 장성', '정치 명문가'];
const MODES = ['표준', '속전속결'];
const ERAS = ['고령화 사회', '언론 불신의 시대', '저금리 호황', '온건한 야당', '콘크리트 지지층', '교통 허브 국가', '정치 양극화', '재정 취약국'];
const LEADERS = ['킨키나투스', '솔론', '조지 워싱턴', '세종', '정조', '에이브러햄 링컨', '아소카', '윈스턴 처칠', '페리클레스', '마르쿠스 아우렐리우스',
  '함무라비', '프리드리히 2세', '오토 폰 비스마르크', '술라', '율리우스 카이사르', '아우구스투스', '프랭클린 루스벨트', '나폴레옹', '시몬 볼리바르',
  '루이 14세', '표트르 대제', '진시황', '광해군', '루이 16세'];
// '재선에 실패했다'는 v5까지의 기록(과반 미달)
const EXITS = ['명예롭게 퇴임했다', '지지율 미달로 출마하지 못했다', '선거에서 패배했다', '더는 출마할 수 없었다', '거리로 쫓겨났다', '의료 붕괴로 정권이 무너졌다', '경제 붕괴로 정권이 무너졌다', '스스로 하야했다', '재선에 실패했다'];
const SCENS = ['코로나·변이', '오일쇼크', '전쟁', '금융위기', '기후 재난'];
const SCENS_CH = ['코로나19', '신종 변이', '오일쇼크', '전쟁', '금융위기', '기후 재난'];
const COLLAPSE = ['거리로 쫓겨났다', '의료 붕괴로 정권이 무너졌다', '경제 붕괴로 정권이 무너졌다', '스스로 하야했다'];
const TROPHIES = [['방역 모범국', '업적'], ['에너지 위기 극복', '업적'], ['평화를 지킨 나라', '업적'], ['금융 안정 모범국', '업적'], ['재난 대응 모범국', '업적'], ['경제 회복', '업적'], ['국민의 신뢰', '업적'], ['투명한 정부', '업적'], ['사회 통합', '업적'],
  ['든든한 의료', '업적'], ['청렴 정부', '업적'], ['세계가 인용한 대응', '업적'],
  ['조달 스캔들', '불명예'], ['광장의 분노', '불명예'], ['권력 남용 논란', '불명예'], ['의료 대란', '불명예'], ['경기 침체', '불명예'], ['바닥 지지율', '불명예']];
const KEYS10 = ['a', 'i', 'm', 'e', 'p', 'c', 'u', 'chk', 'trn', 'saf'];
const KNAME = {a: '지지율', i: '확산', m: '의료', e: '경제', p: '행정권한', c: '유착', u: '갈등', chk: '견제', trn: '투명성', saf: '안전망'};

function buildAnalysis_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const S = table_(ss, '요약', SUMMARY), D = table_(ss, '선택 상세', DETAIL), T = table_(ss, '임기별 결과', TERMS), Y = table_(ss, '연간 결산', YEARS);
  const SL = S.L, DL = D.L, TL = T.L, YL = Y.L;

  const v3 = S.rows.filter(r => num_(r[SL.terms]) !== null);                       // 커리어 모드 기록
  // 끝까지 간 커리어 (커리어 점수는 100점 체계인 버전 5부터만 비교한다)
  const done = v3.filter(r => num_(r[SL.careerScore]) !== null && (num_(r[SL.v]) || 0) >= 5);
  const quits = v3.filter(r => String(r[SL.exitType]) === '중도 이탈');
  // 조각이 순서 없이 도착해도 되도록 판ID·순서로 정렬해 둔다
  const ch = D.rows.filter(r => num_(r[DL.term]) !== null && String(r[DL.eventType]) !== '임기 결정')
    .sort((x, y) => (String(x[DL.id]) < String(y[DL.id]) ? -1 : String(x[DL.id]) > String(y[DL.id]) ? 1 : (num_(x[DL.seq]) || 0) - (num_(y[DL.seq]) || 0)));
  const dec = D.rows.filter(r => String(r[DL.eventType]) === '임기 결정');
  const terms = T.rows.filter(r => String(r[TL.decision]) !== '중도 이탈');
  const years = Y.rows;

  const blocks = [];   // [제목, 표(머리글 포함), 설명]
  const pos = {};      // 차트용 위치

  // 1. 개요
  const players = Object.keys(done.reduce((m, r) => { m[r[SL.nickname]] = 1; return m; }, {})).length;
  const nConc = ch.filter(r => r[DL.direction] === '권력 집중').length;
  blocks.push(['개요', [['항목', '값'],
    ['끝까지 간 커리어', done.length], ['중도 이탈', quits.length], ['참가자(닉네임 기준)', players],
    ['평균 임기 수(선)', avg_(done.map(r => num_(r[SL.terms])))], ['평균 재임(년)', avg_(done.map(r => num_(r[SL.careerYears])))],
    ['평균 커리어 점수(100점)', avg_(done.map(r => num_(r[SL.careerScore])))],
    ['  └ 평균 성과(70)', avg_(done.map(r => num_(r[SL.scorePerf])))], ['  └ 평균 연임(15)', avg_(done.map(r => num_(r[SL.scoreCont])))], ['  └ 평균 명예(15)', avg_(done.map(r => num_(r[SL.scoreHonor])))],
    ['평균 임기 점수(모든 임기)', avg_(terms.map(r => num_(r[TL.score])))],
    ['재선 성공 비율(%) · 2선 이상', pctOf_(done.filter(r => num_(r[SL.terms]) >= 2).length, done.length)],
    ['대선 당선률(%) · 출마한 대선 중', pctOf_(terms.filter(r => r[TL.elect] === '당선').length, terms.filter(r => r[TL.elect] === '당선' || r[TL.elect] === '낙선').length)],
    ['출마 불가 비율(%) · 임기 말 지지율 35 미만', pctOf_(terms.filter(r => String(r[TL.decision]).indexOf('출마 불가') === 0 || String(r[TL.decision]).indexOf('낙선 (과반') === 0).length, terms.length)],
    ['개헌 경험 비율(%)', pctOf_(done.filter(r => num_(r[SL.amendCount]) > 0).length, done.length)],
    ['연임할 수 있었는데 퇴임한 비율(%)', pctOf_(done.filter(r => r[SL.retireEligible] === '예').length, done.length)],
    ['붕괴·축출·하야 비율(%)', pctOf_(done.filter(r => COLLAPSE.indexOf(String(r[SL.exitType])) >= 0).length, done.length)],
    ['전체 선택 수', ch.length], ['평균 권력 방향 점수(모든 선택)', avg_(ch.map(r => num_(r[DL.dirScore])))],
    ['권력 집중 선택 비율(%)', pctOf_(nConc, ch.length)],
    ['견제·분산 선택 비율(%)', pctOf_(ch.filter(r => r[DL.direction] === '견제·분산').length, ch.length)],
    ['평균 고민 시간(초)', avg_(ch.map(r => num_(r[DL.decideSec])))],
    ['평균 플레이 시간(분)', avg_(done.map(r => { const x = num_(r[SL.playSeconds]); return x === null ? null : x / 60; }))],
    ['마지막 분석 시각', Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')]
  ], '끝까지 간 커리어만 평균에 넣었다. 중도 이탈 기록은 "선택 상세"와 "임기별 결과"에는 남아 있다.']);

  // 2~7. 집단 비교
  const GH = ['구분', '커리어 수', '평균 임기 수', '평균 재임(년)', '평균 커리어 점수', '평균 임기 점수(커리어별)', '평균 권력 방향(커리어별)', '권력 집중 비율(%)',
    '재선 비율(%)', '개헌 비율(%)', '붕괴·축출 비율(%)'].concat(KEYS10.map(k => '최종 ' + KNAME[k]),
    ['누적 인명피해', '점수 구성: 지지율', '점수 구성: 생명 보호', '점수 구성: 경제', '점수 구성: 청렴', '점수 구성: 제도']);
  const agg = (label, rs) => {
    const n = rs.length, av = k => avg_(rs.map(r => num_(r[SL[k]])));
    const sc = rs.reduce((s, r) => s + (num_(r[SL.nConc]) || 0), 0), sn = rs.reduce((s, r) => s + (num_(r[SL.nChoices]) || 0), 0);
    return [label, n, av('terms'), av('careerYears'), av('careerScore'), av('avgTermScore'), av('avgDir'), pctOf_(sc, sn),
      pctOf_(rs.filter(r => num_(r[SL.terms]) >= 2).length, n), pctOf_(rs.filter(r => num_(r[SL.amendCount]) > 0).length, n),
      pctOf_(rs.filter(r => COLLAPSE.indexOf(String(r[SL.exitType])) >= 0).length, n)]
      .concat(KEYS10.map(k => av(k)), [av('deaths'), av('compA'), av('compLife'), av('compEco'), av('compClean'), av('compInst')]);
  };
  const group = (title, key, labels, note) => {
    const rows = labels.map(l => agg(l, done.filter(r => String(r[SL[key]]) === l)));
    rows.push(agg('전체', done));
    blocks.push([title, [GH].concat(rows), note]);
  };
  group('난이도별 비교', 'difficulty', DIFFS, '임기가 거듭될수록 난이도가 한 단계씩 더 올라간다. 여기의 난이도는 시작할 때 고른 난이도다. 기록 버전 12 전의 보통·어려움·지옥은 지금의 쉬움·보통·어려움이다.');
  group('출신 배경별 비교', 'perk', BGS, '');
  group('결정 빈도별 비교', 'mode', MODES, '표준 = 1년에 6번 결정, 속전속결 = 1년에 3번 결정.');
  group('시대 조건별 비교', 'era', ERAS, '시대 조건은 게임이 무작위로 정한다.');
  group('닮은 지도자별 비교', 'leader', LEADERS, '');
  group('퇴장 방식별 비교', 'exitType', EXITS, '');

  // 8. 임기별 추이
  const TH = ['임기', '표본(임기 수)', '평균 임기 점수', 'S', 'A', 'B', 'C', 'D', 'F', '평균 권력 방향', '권력 집중 비율(%)',
    '점수 구성: 지지율', '점수 구성: 생명 보호', '점수 구성: 경제', '점수 구성: 청렴', '점수 구성: 제도']
    .concat(KEYS10.map(k => '임기 말 ' + KNAME[k]), ['임기 인명피해', '업적 수(평균)', '불명예 수(평균)']);
  const termRows = [1, 2, 3, 4, 5].map(t => {
    const rs = terms.filter(r => num_(r[TL.term]) === t), av = k => avg_(rs.map(r => num_(r[TL[k]])));
    const g = x => rs.filter(r => r[TL.grade] === x).length;
    const sc = rs.reduce((s, r) => s + (num_(r[TL.nConc]) || 0), 0), sn = rs.reduce((s, r) => s + (num_(r[TL.nCh]) || 0), 0);
    return [t + '기', rs.length, av('score'), g('S'), g('A'), g('B'), g('C'), g('D'), g('F'), av('avgDir'), pctOf_(sc, sn),
      av('compA'), av('compLife'), av('compEco'), av('compClean'), av('compInst')].concat(KEYS10.map(k => av(k)), [av('deaths'), av('troG'), av('troB')]);
  });
  blocks.push(['임기별 추이 (1기 → 5기)', [TH].concat(termRows), '"권력을 오래 쥘수록 선택이 달라지는가"를 보는 표. 뒤 임기일수록 표본이 적다는 점에 주의.']);
  pos.term = blocks.length - 1;

  // 9. 임기 말 결정
  const DCOL = ['재선 도전', '개헌 후 도전', '퇴임 (출마 가능했음)', '출마 불가 (지지율 35 미만)', '임기 한도로 퇴장', '붕괴·축출·하야'];
  const OLD = {'퇴임 (연임 가능했음)': '퇴임 (출마 가능했음)', '낙선 (과반 미달)': '출마 불가 (지지율 35 미만)'};   // v5까지의 이름
  const dk = d => { d = OLD[d] || d; return d.indexOf('개헌') === 0 ? '개헌 후 도전' : DCOL.indexOf(d) >= 0 ? d : (COLLAPSE.indexOf(d) >= 0 ? '붕괴·축출·하야' : null); };
  const decRows = [1, 2, 3, 4, 5].map(t => {
    const rs = T.rows.filter(r => num_(r[TL.term]) === t), cnt = {};
    rs.forEach(r => { const k = dk(String(r[TL.decision])); if (k) cnt[k] = (cnt[k] || 0) + 1; });
    const tot = DCOL.reduce((s, k) => s + (cnt[k] || 0), 0);
    return [t + '기', tot].concat(DCOL.map(k => cnt[k] || 0), [pctOf_((cnt['재선 도전'] || 0) + (cnt['개헌 후 도전'] || 0), tot)]);
  });
  blocks.push(['임기 말 결정', [['임기', '합계'].concat(DCOL, ['계속 출마 비율(%)'])].concat(decRows), '출마할 수 있을 때(임기 말 지지율 35 이상) 계속 출마했는지, 스스로 내려왔는지. v5까지의 기록은 과반 기준이다.']);

  // 10. 연차별 권력 방향
  const yrow = (label, rs) => [label, rs.length, avg_(rs.map(r => num_(r[DL.dirScore]))),
    pctOf_(rs.filter(r => r[DL.direction] === '권력 집중').length, rs.length), avg_(rs.map(r => num_(r[DL.decideSec])))];
  const YH = ['구분', '선택 수', '평균 권력 방향', '권력 집중 비율(%)', '평균 고민 시간(초)'];
  blocks.push(['임기 안 연차별 선택 (모든 임기 합산)', [YH].concat([1, 2, 3, 4].map(y => yrow(y + '년차', ch.filter(r => num_(r[DL.year]) === y)))), '']);
  const cy = [];
  for (let k = 1; k <= 20; k++) cy.push(yrow(k + '년째', ch.filter(r => num_(r[DL.cyear]) === k)));
  blocks.push(['커리어 연차별 선택 (재임 1년째 → 20년째)', [YH].concat(cy), '']);
  pos.cyear = blocks.length - 1;

  // 11. 상황별 권력 선택
  const CH_H = ['조건', '구간', '선택 수', '권력 집중 비율(%)', '견제·분산 비율(%)', '평균 권력 방향', '평균 고민 시간(초)'];
  const crow = (cond, label, rs) => [cond, label, rs.length, pctOf_(rs.filter(r => r[DL.direction] === '권력 집중').length, rs.length),
    pctOf_(rs.filter(r => r[DL.direction] === '견제·분산').length, rs.length), avg_(rs.map(r => num_(r[DL.dirScore]))), avg_(rs.map(r => num_(r[DL.decideSec])))];
  const bin = (cond, key, cuts) => cuts.map(c => crow(cond, c[0], ch.filter(r => { const x = num_(r[DL[key]]); return x !== null && x >= c[1] && x < c[2]; })));
  const sit = [].concat(
    bin('선택 전 지지율', 'b_a', [['0–29', 0, 30], ['30–49', 30, 50], ['50–69', 50, 70], ['70–100', 70, 101]]),
    bin('선택 전 확산', 'b_i', [['0–19', 0, 20], ['20–39', 20, 40], ['40–59', 40, 60], ['60–100', 60, 101]]),
    bin('선택 전 행정권한', 'b_p', [['0–29', 0, 30], ['30–49', 30, 50], ['50–69', 50, 70], ['70–100', 70, 101]]),
    bin('선택 전 유착', 'b_c', [['0–19', 0, 20], ['20–39', 20, 40], ['40–59', 40, 60], ['60–100', 60, 101]]),
    bin('선택 전 경제', 'b_e', [['0–29', 0, 30], ['30–49', 30, 50], ['50–69', 50, 70], ['70–100', 70, 101]]),
    bin('고민 시간', 'decideSec', [['3초 미만', 0, 3], ['3–7초', 3, 7], ['7–15초', 7, 15], ['15초 이상', 15, 1e9]]),
    ['일반 사건', '연쇄 사건', '선택이 부른 사건', '권력의 시험', '위기(전국 저항)', '위기(탄핵)'].map(t => crow('사건 유형', t, ch.filter(r => r[DL.eventType] === t))),
    ['대성공', '성공', '실패', '대실패'].map(t => crow('직전 선택의 주사위', t, prevDice_(ch, DL, t)))
  );
  blocks.push(['상황별 권력 선택', [CH_H].concat(sit), '"위기에 몰리면 권력을 찾는가"를 보는 표. 선택 직전의 지표 구간별로 권력 집중 선택이 얼마나 나왔는지. ' +
    '"직전 선택의 주사위"는 바로 앞 선택이 성공·실패했을 때 다음 선택이 어땠는지.']);
  pos.sit = blocks.length - 1;

  // 12. 업적·불명예
  const tc = {};
  years.forEach(r => [r[YL.troGood], r[YL.troBad]].forEach(s => String(s || '').split(',').map(x => x.trim()).filter(Boolean).forEach(x => { tc[x] = (tc[x] || 0) + 1; })));
  blocks.push(['업적·불명예 빈도', [['이름', '종류', '횟수', '1년당 비율(%)']].concat(TROPHIES.map(t => [t[0], t[1], tc[t[0]] || 0, pctOf_(tc[t[0]] || 0, years.length)])), '"연간 결산" 기준. 1년에 업적은 최대 2개까지 붙는다.']);

  // 13. 임기 결정(연임/개헌/퇴임) 직전 지표
  blocks.push(['임기 말 결정 직전의 평균 지표', [['결정', '횟수'].concat(KEYS10.map(k => KNAME[k]))].concat(
    ['재선 도전', '개헌', '퇴임'].map(lb => {
      const rs = dec.filter(r => String(r[DL.choice]).indexOf(lb === '개헌' ? '개헌' : lb) === 0);
      return [lb, rs.length].concat(KEYS10.map(k => avg_(rs.map(r => num_(r[DL['b_' + k]])))));
    })), '어떤 상태에서 계속 출마하고, 어떤 상태에서 내려왔는지.']);

  // 14. 위기 시나리오별 임기 결과 (v6부터. 1기는 늘 코로나·변이, 2기부터는 오일쇼크·전쟁·금융위기·기후 재난 중 하나)
  const ended = r => String(r[TL.evalId]);
  const scRow = (label, rs) => {
    const av = k => avg_(rs.map(r => num_(r[TL[k]]))), g = x => rs.filter(r => r[TL.grade] === x).length;
    const sc = rs.reduce((s, r) => s + (num_(r[TL.nConc]) || 0), 0), sn = rs.reduce((s, r) => s + (num_(r[TL.nCh]) || 0), 0);
    const ran = rs.filter(r => r[TL.elect] === '당선' || r[TL.elect] === '낙선');
    return [label, rs.length, av('score'), g('S') + g('A'), g('B') + g('C'), g('D') + g('F'), av('avgDir'), pctOf_(sc, sn),
      rs.filter(r => ended(r) === 'ecofail').length, rs.filter(r => ended(r) === 'medfail').length, rs.filter(r => ended(r) === 'ousted' || ended(r) === 'quit').length,
      av('winP'), pctOf_(ran.filter(r => r[TL.elect] === '당선').length, ran.length), av('peakI'), av('deaths')].concat(KEYS10.map(k => av(k)));
  };
  const v6t = terms.filter(r => String(r[TL.scenario] || '') !== '');
  blocks.push(['위기 시나리오별 임기 결과', [['시나리오', '임기 수', '평균 임기 점수', 'S·A', 'B·C', 'D·F', '평균 권력 방향', '권력 집중 비율(%)',
    '경제 붕괴', '의료 붕괴', '축출·하야', '평균 당선 가능성(%)', '대선 당선률(%)', '평균 최고 위기 지수', '평균 인명피해']
    .concat(KEYS10.map(k => '임기 말 ' + KNAME[k]))].concat(SCENS.map(l => scRow(l, v6t.filter(r => r[TL.scenario] === l))), [scRow('전체', v6t)]),
    '"어떤 위기에서 권력을 더 찾는가"를 보는 표. 같은 사람이라도 2기 이후는 임기가 거듭되며 더 어려워진다는 점에 주의. 위기 지수의 "확산" 열은 시나리오마다 뜻이 다르다(감염 확산·에너지 위기·안보 위기·금융 불안·재난).']);
  pos.scen = blocks.length - 1;

  // 15. 위기 시나리오별 선택 (선택 상세 기준)
  const chs = ch.filter(r => String(r[DL.scenario] || '') !== '');
  blocks.push(['위기 시나리오별 선택', [CH_H].concat(SCENS_CH.map(l => crow('위기', l, chs.filter(r => r[DL.scenario] === l)))),
    '1기의 1~2년차는 코로나19, 3~4년차는 신종 변이로 나눠 셌다.']);
  pos.scench = blocks.length - 1;

  // 16. 대선 결과 (임기 말 → 다음 임기 대선)
  const elRows = [1, 2, 3, 4].map(t => {
    const rs = terms.filter(r => num_(r[TL.term]) === t && String(r[TL.scenario] || '') !== '');
    const ran = rs.filter(r => r[TL.elect] === '당선' || r[TL.elect] === '낙선'), win = ran.filter(r => r[TL.elect] === '당선');
    const no = rs.filter(r => String(r[TL.decision]).indexOf('출마 불가') === 0).length, ret = rs.filter(r => String(r[TL.decision]).indexOf('퇴임') === 0).length;
    return [t + '기 말 → ' + (t + 1) + '기 대선', rs.length, no, ret, ran.length, win.length, ran.length - win.length, pctOf_(win.length, ran.length),
      avg_(ran.map(r => num_(r[TL.winP]))), avg_(win.map(r => num_(r[TL.winP]))), avg_(ran.filter(r => r[TL.elect] === '낙선').map(r => num_(r[TL.winP]))), avg_(rs.map(r => num_(r[TL.a])))];
  });
  blocks.push(['대선 결과', [['대선', '임기 수', '출마 불가(35 미만)', '퇴임', '출마', '당선', '낙선', '당선률(%)', '평균 당선 가능성(%)', '당선자 평균 가능성(%)', '낙선자 평균 가능성(%)', '임기 말 평균 지지율']].concat(elRows),
    '당선 가능성 = 지지율 35 → 1%, 65 → 100% (그 사이는 비례), 65 이상은 100%. 낙선하면 커리어가 끝난다.']);

  // 17. 판정 적합도와 주사위 (v7부터. 상황에 맞는 선택일수록 성공 확률이 높다)
  const chf = ch.filter(r => num_(r[DL.fit]) !== null);
  const FB = [['매우 맞지 않음 (-1 ~ -0.5)', -9, -0.5], ['맞지 않음 (-0.5 ~ -0.15)', -0.5, -0.15], ['보통 (-0.15 ~ 0.15)', -0.15, 0.15], ['맞음 (0.15 ~ 0.5)', 0.15, 0.5], ['매우 맞음 (0.5 ~ 1)', 0.5, 9]];
  blocks.push(['판정 적합도별 주사위 결과', [['적합도 구간', '선택 수', '대성공(%)', '성공(%)', '실패(%)', '대실패(%)', '권력 집중 비율(%)', '평균 고민 시간(초)']].concat(FB.map(b => {
    const rs = chf.filter(r => { const x = num_(r[DL.fit]); return x >= b[1] && x < b[2]; }), n = rs.length, c = t => pctOf_(rs.filter(r => r[DL.dice] === t).length, n);
    return [b[0], n, c('대성공'), c('성공'), c('실패'), c('대실패'), pctOf_(rs.filter(r => r[DL.direction] === '권력 집중').length, n), avg_(rs.map(r => num_(r[DL.decideSec])))];
  })), '적합도 = 지금 급한 문제를 겨냥했는지(같은 사건의 다른 선택지와 비교) + 통치 방식이 여건에 맞는지(강경 조치는 행정 장악력, 협치는 신뢰) + 여력. 대성공은 맞는 선택에서만, 대실패는 맞지 않는 선택에서만 나온다.']);
  pos.fit = blocks.length - 1;

  // 18. 선택이 부른 사건 (노선별 후속 사건에서 무엇을 골랐나)
  const pch = ch.filter(r => String(r[DL.path] || '') !== '');
  const PL = ['강경 노선 1단계', '강경 노선 2단계', '협치 노선 1단계', '협치 노선 2단계', '경제 우선 노선 1단계', '경제 우선 노선 2단계'];
  blocks.push(['선택이 부른 사건 (노선별)', [CH_H].concat(PL.map(l => crow('노선', l, pch.filter(r => r[DL.path] === l)))),
    '강경(권력 집중 선택)·협치(견제·분산 선택)·경제 우선 선택이 쌓이면 그 노선의 후속 사건이 나온다. "강경 노선을 걷던 사람이 2단계에서 더 나아가는가"를 보는 표.']);

  writeBlocks_(ss, '분석', blocks, pos);
  buildChoiceSheet_(ss, D);
  ensureCharts_(ss);
}

// 바로 앞 선택의 주사위 결과가 t였던 선택들
function prevDice_(ch, DL, t) {
  const out = [];
  for (let i = 1; i < ch.length; i++) {
    if (ch[i][DL.id] === ch[i - 1][DL.id] && ch[i - 1][DL.dice] === t) out.push(ch[i]);
  }
  return out;
}

const BLOCK_ROWS_ = {};   // 차트가 참조하는 표의 시작 행 (writeBlocks_가 채운다)
function writeBlocks_(ss, name, blocks, pos) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  let row = 1, maxC = 1;
  sh.getRange(1, 1).setValue('팬데믹 대통령 · 자동 분석').setFontWeight('bold').setFontSize(14);
  row = 3;
  blocks.forEach((b, bi) => {
    const t = b[1], w = Math.max.apply(null, t.map(r => r.length));
    const data = t.map(r => r.concat(Array(w - r.length).fill('')));
    sh.getRange(row, 1).setValue(b[0]).setFontWeight('bold').setFontSize(12);
    if (b[2]) sh.getRange(row, 2).setValue(b[2]).setFontColor('#777777');
    const top = row + 1;
    sh.getRange(top, 1, data.length, w).setValues(data);
    sh.getRange(top, 1, 1, w).setFontWeight('bold').setBackground('#e8eaf6');
    BLOCK_ROWS_[bi] = top;
    maxC = Math.max(maxC, w);
    row = top + data.length + 2;
  });
  sh.setColumnWidth(1, 190);
  for (let c = 2; c <= maxC; c++) sh.setColumnWidth(c, 92);
  PropertiesService.getDocumentProperties().setProperty('anaLayout', JSON.stringify({rows: BLOCK_ROWS_, pos: pos}));
}

// ---------- 선택 분석 ----------
function buildChoiceSheet_(ss, D) {
  const DL = D.L, rows = D.rows.filter(r => num_(r[DL.term]) !== null);
  const by = {};
  rows.forEach(r => {
    const ev = String(r[DL.event]), c = String(r[DL.choice]), k = ev + '\u0001' + c;
    if (!by[k]) by[k] = {ev: ev, type: String(r[DL.eventType]), c: c, dir: r[DL.direction], ds: r[DL.dirScore], eff: r[DL.effects], rs: []};
    by[k].rs.push(r);
  });
  const evTot = {};
  Object.keys(by).forEach(k => { const g = by[k]; evTot[g.ev] = (evTot[g.ev] || 0) + g.rs.length; });
  const groups = Object.keys(by).map(k => by[k]).sort((a, b) => (evTot[b.ev] - evTot[a.ev]) || (a.ev < b.ev ? -1 : a.ev > b.ev ? 1 : 0) || (b.rs.length - a.rs.length));
  const delta = (rs, k) => avg_(rs.map(r => { const x = num_(r[DL[k]]), y = num_(r[DL['b_' + k]]); return x === null || y === null ? null : x - y; }));
  const H = ['사건', '사건 유형', '선택', '권력 방향', '방향 점수', '설계된 효과', '선택 횟수', '사건 안 비율(%)', '평균 고민 시간(초)',
    '대성공', '성공', '실패', '대실패', '쉬움에서', '보통에서', '어려움에서', '지옥에서',
    '평균 선택 전 지지율', '지지율 변화(평균)', '확산 변화(평균)', '경제 변화(평균)', '유착 변화(평균)', '행정권한 변화(평균)'];
  const out = [H].concat(groups.map(g => {
    const rs = g.rs, n = rs.length, cnt = (k, v) => rs.filter(r => r[DL[k]] === v).length;
    return [g.ev, g.type, g.c, g.dir, g.ds, g.eff, n, pctOf_(n, evTot[g.ev]), avg_(rs.map(r => num_(r[DL.decideSec]))),
      cnt('dice', '대성공'), cnt('dice', '성공'), cnt('dice', '실패'), cnt('dice', '대실패'),
      cnt('difficulty', '쉬움'), cnt('difficulty', '보통'), cnt('difficulty', '어려움'), cnt('difficulty', '지옥'),
      avg_(rs.map(r => num_(r[DL.b_a]))), delta(rs, 'a'), delta(rs, 'i'), delta(rs, 'e'), delta(rs, 'c'), delta(rs, 'p')];
  }));
  const sh = ss.getSheetByName('선택 분석') || ss.insertSheet('선택 분석');
  sh.clear();
  sh.getRange(1, 1).setValue('사건별·선택지별 통계 (변화는 주사위와 한 턴의 흐름까지 포함한 실제 변화)').setFontWeight('bold');
  sh.getRange(2, 1, out.length, H.length).setValues(out);
  sh.getRange(2, 1, 1, H.length).setFontWeight('bold').setBackground('#e8eaf6');
  sh.setFrozenRows(2);
  sh.setColumnWidth(1, 150); sh.setColumnWidth(3, 260); sh.setColumnWidth(6, 220);
}

// ---------- 차트 ----------
function ensureCharts_(ss) {
  const props = PropertiesService.getDocumentProperties();
  let sh = ss.getSheetByName('분석 차트');
  if (sh && props.getProperty('chartVer') === CHART_VER && sh.getCharts().length) return;
  if (!sh) sh = ss.insertSheet('분석 차트');
  sh.getCharts().forEach(c => sh.removeChart(c));
  const A = ss.getSheetByName('분석');
  const L = JSON.parse(props.getProperty('anaLayout') || '{}'), rows = L.rows || {}, pos = L.pos || {};
  const at = (bi, n) => rows[bi];   // 표 머리글 행
  const add = (type, title, bi, n, domCol, valCol, r, c, opt) => {
    const top = at(bi);
    if (!top) return;
    let b = sh.newChart().setChartType(type)
      .addRange(A.getRange(top, domCol, n + 1, 1)).addRange(A.getRange(top, valCol, n + 1, 1))
      .setNumHeaders(1).setPosition(r, c, 0, 0)
      .setOption('title', title).setOption('legend', {position: 'none'}).setOption('width', 520).setOption('height', 300);
    Object.keys(opt || {}).forEach(k => { b = b.setOption(k, opt[k]); });
    sh.insertChart(b.build());
  };
  sh.getRange(1, 1).setValue('분석 차트 · "분석" 시트의 표가 바뀌면 함께 바뀐다').setFontWeight('bold');
  const C = Charts.ChartType;
  // blocks 순서: 0 개요, 1 난이도, 2 배경, 3 결정 빈도, 4 시대, 5 지도자, 6 퇴장, 7 임기, 8 임기 말 결정, 9 연차, 10 커리어 연차, 11 상황, 12 업적, 13 결정 직전,
  //             14 시나리오별 임기, 15 시나리오별 선택, 16 대선, 17 판정 적합도, 18 선택이 부른 사건
  add(C.COLUMN, '임기별 평균 권력 방향 (위로 갈수록 권력 집중)', 7, 5, 1, 10, 3, 1, {colors: ['#e05252']});
  add(C.COLUMN, '임기별 평균 임기 점수', 7, 5, 1, 3, 3, 8, {colors: ['#4a8fe0']});
  add(C.LINE, '커리어 연차별 평균 권력 방향', 10, 20, 1, 3, 19, 1, {colors: ['#e05252']});
  add(C.COLUMN, '선택 전 지지율 구간별 권력 집중 비율(%)', 11, 4, 2, 4, 19, 8, {colors: ['#8b7cf6']});
  add(C.COLUMN, '난이도별 권력 집중 비율(%)', 1, 3, 1, 8, 35, 1, {colors: ['#eb6834']});
  add(C.COLUMN, '출신 배경별 평균 커리어 점수', 2, 5, 1, 5, 35, 8, {colors: ['#3fc38f']});
  add(C.BAR, '닮은 지도자 분포 (커리어 수)', 5, LEADERS.length, 1, 2, 51, 1, {colors: ['#8b7cf6'], height: 520});
  add(C.PIE, '퇴장 방식', 6, EXITS.length, 1, 2, 51, 8, {legend: {position: 'right'}});
  add(C.COLUMN, '위기 시나리오별 권력 집중 비율(%)', 15, SCENS_CH.length, 2, 4, 79, 1, {colors: ['#e05252']});
  add(C.COLUMN, '위기 시나리오별 평균 임기 점수', 14, SCENS.length, 1, 3, 79, 8, {colors: ['#4a8fe0']});
  add(C.COLUMN, '판정 적합도별 대실패 비율(%)', 17, 5, 1, 6, 95, 1, {colors: ['#e05252']});
  add(C.COLUMN, '노선 사건에서 권력 집중을 고른 비율(%)', 18, 6, 2, 4, 95, 8, {colors: ['#8b7cf6']});
  props.setProperty('chartVer', CHART_VER);
}

// ===================== 리더보드 (읽기 전용) =====================
// leaderboard.html이 이 주소를 GET으로 불러 간다. 닉네임과 게임 결과만 내보내고, 선택 기록은 내보내지 않는다.
// 같은 결과를 15초 동안 캐시해서 여러 명이 동시에 열어도 시트를 매번 읽지 않는다.
function doGet(e) {
  const p = (e && e.parameter) || {};
  const cache = CacheService.getScriptCache();
  let json = null;
  try { json = cacheGet_(cache, 'board_v15'); } catch (err) {}
  if (!json) {
    // 캐시가 비는 순간 여러 명이 동시에 시트를 읽지 않게 짧게 잠그고, 그사이 다른 요청이 채웠는지 한 번 더 본다.
    // 분석 다시 계산은 기록을 받을 때(doPost)만 한다(순위를 보는 사람이 분석을 기다리지 않게)
    const lock = LockService.getScriptLock();
    const got = lock.tryLock(2500);
    try {
      try { json = cacheGet_(cache, 'board_v15'); } catch (err) {}
      if (!json) {
        json = JSON.stringify(buildBoard_());
        try { cachePut_(cache, 'board_v15', json, 30); } catch (err) {}
      }
    } finally { if (got) lock.releaseLock(); }
  }
  const cb = p.callback;
  if (cb && /^[A-Za-z_$][\w$]*$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function buildBoard_() {
  // script: 게임이 이 값으로 새 스크립트인지 확인한다(없으면 명예의 전당에 '예전 코드' 경고)
  const out = {script: SCRIPT_VER, updated: new Date().toISOString(), careers: 0, players: 0, top: [], longest: [], recent: [], order: [], stats: {}, arcade: arcadeBoard_()};
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('요약');
  if (!sh || sh.getLastRow() < 2) return out;
  const v = sh.getDataRange().getValues();
  const ix = {};
  v[0].forEach((n, i) => { ix[n] = i; });
  const g = (r, n) => (ix[n] === undefined ? '' : r[ix[n]]);
  const num = x => (x === '' || x === null || isNaN(Number(x)) ? null : Number(x));
  const PS = privSchools_();
  const rows = [];
  for (let i = 1; i < v.length; i++) {
    const r = v[i], sc = num(g(r, '커리어 점수')), id = String(g(r, '판ID'));
    // 학교: 관리자가 '참가자(비공개)' 탭에서 고친 학교가 있으면 그것을 쓴다(요약 탭의 학교는 처음 받은 그대로)
    const sch = Object.prototype.hasOwnProperty.call(PS, id) ? PS[id] : g(r, '학교');
    if (sc === null || id === 'test') continue;          // 중도 이탈·테스트 줄은 제외
    if (String(g(r, '숨김') || '').trim()) continue;      // 관리자가 가린 줄 · 서버가 이상하다고 적은 줄
    if (Math.abs(sc) > SCORE_MAX) continue;
    const t = g(r, '기록 시각');
    if (!boardVerOk_(num(g(r, '기록 버전')) || 0, t)) continue;   // 예전 점수 체계·난이도 이름의 기록은 순위에서 제외
    rows.push({
      id: id,
      nick: pubNick_(g(r, '닉네임')),
      who: personKey_(g(r, '플레이어ID'), g(r, '닉네임'), sch, id),
      score: sc,
      terms: num(g(r, '임기 수(선)')) || 1,
      years: num(g(r, '총 재임(년)')) || 0,
      exit: String(g(r, '퇴장 방식')),
      leader: String(g(r, '닮은 지도자')),
      lid: String(g(r, '닮은 지도자ID')),
      bg: String(g(r, '출신 배경')),
      diff: String(g(r, '난이도')),
      school: schoolName_(sch),
      tro: num(g(r, '업적 수')) || 0,
      appr: num(g(r, '최종 지지율')),
      camp: String(g(r, '무대') || ''),
      grades: String(g(r, '임기별 등급')),
      amend: num(g(r, '개헌 횟수')) || 0,
      retire: String(g(r, '연임 가능했는데 퇴임')) === '예',
      dirs: [1, 2, 3, 4, 5].map(k => num(g(r, k + '기 평균 방향'))),
      // 명예의 전당 상위 3명을 누르면 보이는 세부 수치(닉네임 밖의 개인정보는 넣지 않는다)
      det: {
        stat: {a: num(g(r, '최종 지지율')), e: num(g(r, '최종 경제')), m: num(g(r, '최종 의료')), c: num(g(r, '최종 유착')),
               u: num(g(r, '최종 갈등')), chk: num(g(r, '최종 견제')), trn: num(g(r, '최종 투명성')), saf: num(g(r, '최종 안전망'))},
        part: [num(g(r, '커리어 점수: 성과(70)')), num(g(r, '커리어 점수: 연임(15)')), num(g(r, '커리어 점수: 명예(15)'))],
        dice: [num(g(r, '대성공')), num(g(r, '성공')), num(g(r, '실패')), num(g(r, '대실패'))],
        dir: [num(g(r, '권력 집중 선택 수')), num(g(r, '견제·분산 선택 수')), num(g(r, '평균 권력 방향 점수'))],
        tro: [num(g(r, '업적 수')), num(g(r, '불명예 수'))],
        camp: String(g(r, '무대') || ''), scen: String(g(r, '겪은 위기(임기 순)') || ''), titles: String(g(r, '임기별 평가') || ''),
        avg: num(g(r, '평균 임기 점수')), sec: num(g(r, '플레이 시간(초)')), n: num(g(r, '선택 수'))
      },
      t: t instanceof Date ? t.toISOString() : String(t)
    });
  }
  Object.assign(out, boardOf_(rows, 30, 15));
  // 난이도별 순위: 응답이 너무 커지지 않게 목록은 조금 짧게 자른다
  out.diffs = DIFFS;
  out.byDiff = {};
  DIFFS.forEach(d => { out.byDiff[d] = boardOf_(rows.filter(r => r.diff === d), 20, 10); });
  return out;
}

// 한 묶음의 기록으로 순위표·통계를 만든다(전체 한 번, 난이도마다 한 번)
function boardOf_(rows, nTop, nList) {
  // det(세부 수치)는 점수 순위 상위 3명에게만 붙인다(응답 크기를 줄이려고)
  const pub = (r, d) => Object.assign({id: r.id, nick: r.nick, school: r.school, score: r.score, terms: r.terms, years: r.years, exit: r.exit,
                     leader: r.leader, lid: r.lid, bg: r.bg, diff: r.diff, grades: r.grades, amend: r.amend, tro: r.tro, appr: r.appr, camp: r.camp, t: r.t}, d ? {det: r.det} : {});
  const bestPer = list => {
    const seen = {}, res = [];
    list.forEach(r => { const k = r.who || r.nick; if (!seen[k]) { seen[k] = 1; res.push(r); } });
    return res;
  };
  const byScore = rows.slice().sort((a, b) => b.score - a.score || (a.t < b.t ? -1 : 1));
  const cnt = f => rows.reduce((m, r) => { const k = f(r); if (k) m[k] = (m[k] || 0) + 1; return m; }, {});
  const pct = f => (rows.length ? Math.round(rows.filter(f).length / rows.length * 100) : 0);
  const dirByTerm = [0, 1, 2, 3, 4].map(k => {
    const a = rows.map(r => r.dirs[k]).filter(x => x !== null);
    return {term: k + 1, n: a.length, avg: a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length * 10) / 10 : null};
  });
  return {
    careers: rows.length,
    players: Object.keys(rows.reduce((m, r) => { m[r.who || r.nick] = 1; return m; }, {})).length,
    order: byScore.map(r => r.id),
    top: bestPer(byScore).slice(0, nTop).map((r, i) => pub(r, i < 3)),
    longest: bestPer(rows.slice().sort((a, b) => b.years - a.years || b.score - a.score)).slice(0, nList).map(r => pub(r)),
    recent: rows.slice().sort((a, b) => (a.t < b.t ? 1 : -1)).slice(0, nList).map(r => pub(r)),
    // 게임 안 명예의 전당 둘레의 부문별 순위(부문마다 5명, 한 사람은 가장 좋은 기록 하나만)
    cards: {
      terms: bestPer(rows.slice().sort((a, b) => b.terms - a.terms || b.years - a.years || b.score - a.score)).slice(0, 5).map(r => pub(r)),
      tro: bestPer(rows.filter(r => r.tro > 0).sort((a, b) => b.tro - a.tro || b.score - a.score)).slice(0, 5).map(r => pub(r)),
      appr: bestPer(rows.filter(r => r.appr !== null).sort((a, b) => b.appr - a.appr || b.score - a.score)).slice(0, 5).map(r => pub(r)),
      school: schoolRank_(rows).slice(0, 5),
      camp: campBest_(rows).map(r => pub(r))
    },
    stats: {
      avgTerms: rows.length ? Math.round(rows.reduce((s, r) => s + r.terms, 0) / rows.length * 10) / 10 : 0,
      reelectRate: pct(r => r.terms >= 2),
      amendRate: pct(r => r.amend > 0),
      retireRate: pct(r => r.retire),
      leaders: cnt(r => r.leader),
      exits: cnt(r => r.exit),
      backgrounds: cnt(r => r.bg),
      dirByTerm: dirByTerm
    }
  };
}

// 학교 이름: 앞뒤 공백·따옴표를 떼고, 같은 학교를 부르는 여러 이름(외대부고·HAFS 등)은 하나로 묶는다. 비었거나 'X' 같은 값은 빈칸.
// 학교 이름: 같은 학교를 부르는 여러 이름을 하나로 합친다(시트에 쓸 때와 순위를 낼 때 모두 이것을 쓴다).
//   · 띄어쓰기 · 기호를 지우고, 지역 이름을 줄인다: 경기도→경기, 서울특별시→서울, 세종특별자치시→세종, 충청남도→충남 …
//   · 학교 종류를 흔히 쓰는 줄임말로: 과학고등학교·과학고·과고→과학고, 외국어고등학교·외고→외고, 국제고등학교→국제고,
//     예술고등학교·예고→예고, 체육고등학교→체고, 여자고등학교·여고→여고, 사범대학부설고등학교·사대부고→사대부고, 그 밖의 고등학교→고, 중학교→중, 초등학교→초
//   예) 경기도과학고등학교 · 경기과고 → 경기과학고 / 세종과고 · 세종과학고 → 세종과학고 / 대원외국어고등학교 → 대원외고
//   · 외대부고 · 한국외대부고 · 용인한국외국어대학교부설고등학교 · HAFS → 용인외대부고, 영어 약칭 몇 개(KSA · KMLA · GSHS · SSHS)도 한국어 이름으로
//   비었거나 'X' 같은 값, 욕설이 섞인 값은 빈칸.
const SCHOOL_AC_ = {hafs: '용인외대부고', ksa: '한국과학영재학교', kmla: '민족사관고', gshs: '경기과학고', sshs: '서울과학고', dshs: '대구과학고', kshs: '경남과학고'};
// 관리자가 직접 고치는 학교 이름 합치기 표(시트 '학교 이름 합치기'): 왼쪽 칸에 적힌 이름은 오른쪽 칸 이름으로 합친다.
// 오타(예: 경가외국어고 → 경기외고)처럼 규칙으로 알 수 없는 것을 여기에 적는다. 새 기록에는 5분 안에, 순위에는 다음 갱신 때 반영된다.
// 이 탭은 '기록 백업 후 새로 시작'으로도 지워지지 않는다.
const ALIAS_SHEET = '학교 이름 합치기';
const ALIAS_SEED = [['경가외국어고등학교', '경기외고']];
let ALIAS_ = null;
function schoolAlias_() {
  if (ALIAS_) return ALIAS_;
  ALIAS_ = {};
  try {
    const c = CacheService.getScriptCache(), hit = c.get('alias_v1');
    if (hit) { ALIAS_ = JSON.parse(hit); return ALIAS_; }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(ALIAS_SHEET);
    if (!sh) {
      sh = ss.insertSheet(ALIAS_SHEET);
      sh.appendRow(['이렇게 적힌 학교(합치기 전)', '이 이름으로 합친다', '메모']);
      sh.setFrozenRows(1);
      ALIAS_SEED.forEach(r => sh.appendRow([r[0], r[1], '처음부터 넣어 둔 예']));
    }
    // 오른쪽 칸에 적은 이름이 그대로 쓰인다(그 이름을 규칙으로 다듬은 꼴도 같은 이름으로 모은다)
    sh.getDataRange().getValues().slice(1).forEach(r => {
      const from = schoolBase_(r[0]), to = clean_(String(r[1] || '').replace(/^'/, '').trim()).slice(0, 20);
      if (!from || !to) return;
      if (from !== to) ALIAS_[from] = to;
      const tb = schoolBase_(to);
      if (tb && tb !== to) ALIAS_[tb] = to;
    });
    c.put('alias_v1', JSON.stringify(ALIAS_), 300);
  } catch (e) {}
  return ALIAS_;
}
function schoolName_(v) {
  const s = schoolBase_(v);
  if (!s) return '';
  const A = schoolAlias_();
  return A[s] || s;
}
// 규칙으로 하는 학교 이름 다듬기(합치기 표는 보지 않는다)
function schoolBase_(v) {
  let s = clean_(String(v || '').replace(/^'/, '').trim());
  if (!s) return '';
  s = s.replace(/[\s\u200b-\u200d\ufeff·.,\-_~()\[\]{}'"`!?/\\|:;<>@#$%^&*+=]/g, '').slice(0, 30);
  if (/외대부고|외대부속고|외대부설고|외국어대학교부설|외국어대부설|외대부고등학교|^hafs$/i.test(s)) return '용인외대부고';
  const ac = SCHOOL_AC_[s.toLowerCase()];
  if (ac) return ac;
  if (s.length < 2 || /^[xX]+$/.test(s)) return '';
  // 지역 이름의 흔한 오타(맨 앞만): 경가 → 경기
  s = s.replace(/^경가(?=.)/, '경기');
  // 지역 이름 줄이기(맨 앞에 올 때만)
  s = s.replace(/^(서울|부산|대구|인천|광주|대전|울산)(특별시|광역시|시)/, '$1').replace(/^세종(특별자치시|시)/, '세종')
    .replace(/^경기도/, '경기').replace(/^강원(특별자치)?도/, '강원').replace(/^충청북도/, '충북').replace(/^충청남도/, '충남')
    .replace(/^전라북도|^전북특별자치도/, '전북').replace(/^전라남도/, '전남').replace(/^경상북도/, '경북').replace(/^경상남도/, '경남').replace(/^제주(특별자치)?도/, '제주');
  // 학교 종류(긴 것부터). '대학교'가 이름 안에 있으면 '대'로(서울대학교사범대학부설고 → 서울대사범대학부설고 → 서울사대부고)
  s = s.replace(/대학교(?=.)/g, '대')
    .replace(/(사범대학?부설|사대부설|사대부속|사범대부속)(고등학교|고)$/, '사대부고').replace(/대사대부고$/, '사대부고')
    .replace(/(사범대학?부설|사대부설|사대부속)(중학교|중)$/, '사대부중').replace(/대사대부중$/, '사대부중')
    .replace(/과학고등학교$|과학고$|과고$/, '과학고')
    .replace(/외국어고등학교$|외국어고$|외고$/, '외고')
    .replace(/국제고등학교$/, '국제고')
    .replace(/예술고등학교$|예술고$/, '예고')
    .replace(/체육고등학교$|체육고$/, '체고')
    .replace(/여자고등학교$|여자고$/, '여고').replace(/여자중학교$|여자중$/, '여중')
    .replace(/고등학교$/, '고').replace(/중학교$/, '중').replace(/초등학교$/, '초');
  return s.length >= 2 ? s.slice(0, 20) : '';
}
// 학교별 평균 커리어 점수(사람마다 가장 좋은 기록 하나로 센다). 참가자 수와 학교 최고 기록도 함께 낸다.
// 한 사람을 가리키는 열쇠: 플레이어ID(기기) + 닉네임. 플레이어ID가 없는 예전 기록은 학교 + 닉네임이고, 그중 '익명'은 판마다 다른 사람으로 본다
// (예전에는 같은 학교의 익명 학생들이 모두 한 사람으로 뭉쳐, 학교 인원이 줄고 평균이 그중 가장 좋은 판 하나로 계산됐다)
function personKey_(pid, nick, school, id) {
  pid = String(pid || '').trim();
  const nk = String(nick || '').replace(/^'/, '').trim(), anon = !nk || nk === '익명';
  if (pid) return 'p:' + pid + (anon ? '' : '|' + nk);
  return anon ? 'r:' + id : 'n:' + schoolName_(school) + '|' + nk;
}
// 관리자가 '참가자(비공개)' 탭의 학교 칸을 고치면(잘못 적은 학교 이름 등) 명예의 전당은 그 판의 학교를 고친 값으로 본다.
// 판ID → 그 탭의 학교. 같은 판이 두 줄이면 관리자가 고친 줄(학교가 '학교(적은 그대로)'와 다른 줄)을, 그다음 아래 줄을 쓴다.
// 고친 이름도 schoolName_으로 다듬고 '학교 이름 합치기' 표를 거친다. 학교 칸을 비우거나 X를 적으면 그 판은 학교 순위에서 빠진다.
// 이 탭에서는 판ID · 학교 · 학교(적은 그대로) 세 칸만 읽는다(이름 · 전화번호는 읽지 않는다). 순위에는 다음 갱신 때(30초 안에) 반영된다.
const PRIV_SHEET = '참가자(비공개)';
function privSchools_() {
  const m = {}, fixed = {};
  try {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(PRIV_SHEET);
    if (!sh || sh.getLastRow() < 2) return m;
    const H = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(x => String(x).trim());
    const ci = H.indexOf('판ID'), cs = H.indexOf('학교'), cr = H.indexOf('학교(적은 그대로)'), n = sh.getLastRow() - 1;
    if (ci < 0 || cs < 0) return m;
    const col = c => sh.getRange(2, c + 1, n, 1).getValues();
    const ids = col(ci), sch = col(cs), raw = cr >= 0 ? col(cr) : null;
    for (let i = 0; i < n; i++) {
      const id = String(ids[i][0] || '').replace(/^'/, '').trim();
      if (!id) continue;
      const s = String(sch[i][0] === null || sch[i][0] === undefined ? '' : sch[i][0]).trim();
      const r = raw ? String(raw[i][0] || '').trim() : '';
      const edited = !!r && schoolName_(r) !== schoolName_(s);
      if (fixed[id] && !edited) continue;
      m[id] = s;
      if (edited) fixed[id] = 1;
    }
  } catch (e) {}
  return m;
}
// 학교 평균 점수: 사람마다 가장 좋은 기록 하나로 학교 평균을 낸다. 순위는 인원이 적은 학교가 한 판의 운으로 맨 위에 서지 않게,
// 평균을 전체 평균 쪽으로 조금 당긴 값(베이지안 평균: 가상의 '보통 학생' SCHOOL_M명을 더한 셈)으로 매긴다.
// 화면에는 순위를 매긴 그 값(adj, 인원 보정 평균)을 보여 준다(인원 수는 보여 주지 않는다). avg · n은 예전 게임 화면이 쓰던 값이라 그대로 둔다
const SCHOOL_M = 3;
function schoolRank_(rows) {
  const best = {};
  rows.forEach(r => { if (!r.school) return; const k = r.school + '|' + r.who; if (!best[k] || best[k].score < r.score) best[k] = r; });
  const by = {}, all = Object.keys(best).map(k => best[k]);
  all.forEach(r => { (by[r.school] = by[r.school] || []).push(r); });
  const C = all.length ? all.reduce((t, r) => t + r.score, 0) / all.length : 0;
  return Object.keys(by).map(s => {
    const L = by[s].sort((a, b) => b.score - a.score), sum = L.reduce((t, r) => t + r.score, 0);
    return {school: s, avg: Math.round(sum / L.length), n: L.length, adj: Math.round((sum + SCHOOL_M * C) / (L.length + SCHOOL_M)), best: {nick: L[0].nick, score: L[0].score, leader: L[0].leader}};
  }).sort((a, b) => b.adj - a.adj || b.n - a.n || b.avg - a.avg);
}
// 비밀 게임 순위: 방역선은 점수가 높은 순, 대항해는 귀항한 판만 시간이 짧은 순. 한 사람은 가장 좋은 기록 하나만, 5명씩
function arcadeBoard_() {
  const out = {zg: [], sail: [], star: []};
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('비밀 게임 기록');
  if (!sh || sh.getLastRow() < 2) return out;
  const v = sh.getDataRange().getValues(), ix = {};
  v[0].forEach((n, i) => { ix[n] = i; });
  const g = (r, n) => (ix[n] === undefined ? '' : r[ix[n]]);
  // 테스트 줄 · 숨김 칸에 무엇이든 적힌 줄은 뺀다
  const rows = v.slice(1).filter(r => String(g(r, '판ID')) !== 'test' && !String(g(r, '숨김') || '').trim()).map(r => ({game: String(g(r, '게임')), nick: pubNick_(g(r, '닉네임')),
    who: personKey_(g(r, '플레이어ID'), g(r, '닉네임'), g(r, '학교'), String(g(r, '판ID'))),
    school: schoolName_(g(r, '학교')), score: Number(g(r, '점수')) || 0, sec: Number(g(r, '시간(초)')) || 0, win: String(g(r, '성공')) === '예', detail: String(g(r, '세부') || '').slice(0, 80)}));
  const best = (L, better) => { const m = {}; L.forEach(r => { if (!m[r.who] || better(r, m[r.who])) m[r.who] = r; }); return Object.keys(m).map(k => { const r = m[k]; delete r.who; return r; }); };
  out.zg = best(rows.filter(r => r.game === 'zg' && r.score <= ZG_MAX), (a, b) => a.score > b.score).sort((a, b) => b.score - a.score).slice(0, 5);
  out.sail = best(rows.filter(r => r.game === 'sail' && r.win && r.sec >= SAIL_MIN_SEC), (a, b) => a.sec < b.sec).sort((a, b) => a.sec - b.sec).slice(0, 5);
  out.star = best(rows.filter(r => r.game === 'star' && r.score <= STAR_MAX), (a, b) => a.score > b.score).sort((a, b) => b.score - a.score).slice(0, 5);
  return out;
}
// 무대마다 가장 높은 커리어 하나
function campBest_(rows) {
  const m = {};
  rows.forEach(r => { const k = r.camp || '기타'; if (!m[k] || m[k].score < r.score) m[k] = r; });
  return Object.keys(m).map(k => m[k]).sort((a, b) => b.score - a.score);
}

// 캐시는 한 칸에 100KB까지라 나눠 담는다(한글은 한 글자가 3바이트라 넉넉히 3만 자씩)
function cachePut_(cache, key, s, ttl) {
  const parts = {}, n = Math.ceil(s.length / 30000);
  for (let i = 0; i < n; i++) parts[key + '_' + i] = s.slice(i * 30000, (i + 1) * 30000);
  parts[key + '_n'] = String(n);
  cache.putAll(parts, ttl);
}
function cacheGet_(cache, key) {
  const n = Number(cache.get(key + '_n') || 0);
  if (!n) return null;
  const keys = [];
  for (let i = 0; i < n; i++) keys.push(key + '_' + i);
  const m = cache.getAll(keys);
  let s = '';
  for (let i = 0; i < n; i++) { if (m[keys[i]] == null) return null; s += m[keys[i]]; }
  return s;
}

// ===================== 편집기에서 실행해 보는 함수 =====================
// test: 테스트 기록 한 줄을 네 시트에 넣는다 (판ID가 test라서 리더보드와 분석에서는 빠진다)
function test() {
  doPost({postData: {contents: JSON.stringify({
    v: 7,
    run: {id: 'test', nickname: '테스트', difficulty: '보통', mode: '표준', perk: '감염병 학자', era: '정치 양극화',
          ending: '테스트 평가', score: 50, nChoices: 1, terms: 1, exitType: '테스트', leader: '세종', scenarios: '코로나·변이'},
    choices: [{seq: 1, turn: 1, year: 1, term: 1, cyear: 1, age: 54, cturn: 1, event: '첫 확진자',
               choice: '테스트 선택', direction: '중립', dirScore: 0, effects: '확산-5 경제-2', b_a: 58, a: 60, scenario: '코로나19'}],
    terms: [{term: 1, evalTitle: '테스트', score: 50, grade: 'C', decision: '테스트', a: 60, scenario: '코로나·변이', winP: 84}],
    years: [{term: 1, year: 1, cyear: 1, age: 54, done: '예', a: 60, scenario: '코로나19', disp1: '오늘 확진자 1,234명', disp2: '누적 사망자 12명'}]
  })}});
}
// testBoard: 리더보드로 나가는 데이터를 실행 로그에서 확인
function testBoard() {
  Logger.log(JSON.stringify(buildBoard_()).slice(0, 3000));
}
