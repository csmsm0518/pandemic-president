/* ---------- 오늘의 도전 이야기 · 김구 (화면) ----------
   dckgOpen(C): 오늘의 도전 창의 시작 단추가 부른다(dcStart). 원본 시안의 화면 그대로, 게임 위에 덮는 창(#kgd) 안에서 돈다.
   끝나면 dcSave · dcStorySend로 오늘의 도전 순위에 올리고, 「로비로」는 창을 닫고 홈으로 간다. */
function dckgOpen(C) {
  var E = KGD_E;
  var SEED = '1101-kimgu';
  var KEY = 'ppd_daily_1101_kimgu';
  // 게임 화면 위에 덮는 창. 게임에도 #app이 있으므로 이 창 안의 .kgd-in에 그린다
  var old = document.getElementById('kgd'); if (old) old.remove();
  if (!document.getElementById('kgdFont')) { var fl = document.createElement('link'); fl.id = 'kgdFont'; fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+KR:wght@400;600;700;900&display=swap'; document.head.appendChild(fl); }
  var root = document.createElement('div'); root.id = 'kgd'; root.tabIndex = -1; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', '오늘의 도전 · 김구, 대한민국 독립');
  var app = document.createElement('div'); app.className = 'kgd-in'; root.appendChild(app); document.body.appendChild(root);
  document.documentElement.classList.add('kgd-on');
  var T0 = 0;
  function snd(k) { try { SFX[k](); } catch (e) { } }
  // 로비로: 창을 닫고 홈 화면을 다시 그린다
  function close(then) { stopTyping(); window.removeEventListener('keydown', kd, true); root.remove(); document.documentElement.classList.remove('kgd-on'); home(); if (then) then(); }
  var S = null, curEv = null, order = [], typer = null, phase = 'intro', keyHandler = null;

  function $(s, r) { return (r || root).querySelector(s); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { } }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 장면 일러스트 (SVG) ---------- */
  var PAL = {
    journey: ['#3a2f4a', '#e08a5b', '#ffd9a0', 0], city: ['#16233a', '#c46a4a', '#ffcf8a', 1], army: ['#1c2c44', '#d98a52', '#fff0c8', 2],
    hall: ['#241a14', '#6b4a2a', '#ffd27a', 3], bomb: ['#0b0f18', '#7a2a1c', '#ff8a3a', 4], ocean: ['#10304f', '#3a7ca5', '#fff1c0', 5],
    night: ['#0a1020', '#1d2a48', '#e9eefc', 6], cairo: ['#2a2038', '#d99a58', '#fff0c0', 7], jungle: ['#10281c', '#4a8a52', '#ffe9a0', 8], dawn: ['#2b2140', '#f0a060', '#fff3c4', 9]
  };
  function rng(seed) { var a = seed; return function () { a = (a * 1664525 + 1013904223) % 4294967296; return a / 4294967296; }; }
  function ridge(r, base, amp, step, w) { var pts = ['0,300'], x = 0; for (x = 0; x <= w + step; x += step) pts.push(x + ',' + (base - r() * amp)); pts.push(w + ',300'); return pts.join(' '); }
  function taegeuk(x, y, s) {
    var t = '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-30" y="-20" width="60" height="40" fill="#f4efe2" stroke="#00000033"/>' +
      '<path d="M-10 0a10 10 0 0 1 20 0z" fill="#c8312b"/><path d="M-10 0a10 10 0 0 0 20 0z" fill="#1f3f8a"/>';
    [[-22, -13, 1], [22, -13, -1], [-22, 13, -1], [22, 13, 1]].forEach(function (q) { t += '<g transform="translate(' + q[0] + ' ' + q[1] + ') rotate(' + (q[0] * q[1] > 0 ? 40 : -40) + ')"><rect x="-5" y="-3" width="10" height="1.6" fill="#111"/><rect x="-5" y="0" width="10" height="1.6" fill="#111"/><rect x="-5" y="3" width="10" height="1.6" fill="#111"/></g>'; });
    return t + '</g>';
  }
  function sceneSVG(kind, big) {
    var P = PAL[kind] || PAL.city, r = rng(P[3] * 977 + 13), W = 800, i, s = '';
    s += '<svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sk' + kind + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P[0] + '"/><stop offset="1" stop-color="' + P[1] + '"/></linearGradient>' +
      '<radialGradient id="gl' + kind + '"><stop offset="0" stop-color="' + P[2] + '" stop-opacity=".9"/><stop offset="1" stop-color="' + P[2] + '" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="800" height="300" fill="url(#sk' + kind + ')"/>';
    if (kind === 'night' || kind === 'bomb' || kind === 'cairo' || kind === 'hall') for (i = 0; i < 50; i++) s += '<circle cx="' + (r() * 800).toFixed(0) + '" cy="' + (r() * 150).toFixed(0) + '" r="' + (r() * 1.2 + .3).toFixed(1) + '" fill="#fff" opacity="' + (r() * .7 + .2).toFixed(2) + '"/>';
    var sx = kind === 'dawn' ? 400 : 120 + r() * 560, sy = kind === 'dawn' ? 175 : 70 + r() * 30;
    s += '<circle cx="' + sx + '" cy="' + sy + '" r="130" fill="url(#gl' + kind + ')"/><circle cx="' + sx + '" cy="' + sy + '" r="' + (kind === 'dawn' ? 34 : 22) + '" fill="' + P[2] + '"/>';
    var cols = ['#00000030', '#00000055', '#00000088'], bases = [170, 200, 232];
    for (i = 0; i < 3; i++) s += '<polygon points="' + ridge(r, bases[i], 60 - i * 12, 40, W) + '" fill="' + cols[i] + '"/>';
    s += '<rect y="255" width="800" height="45" fill="#00000099"/>';
    var x;
    if (kind === 'city' || kind === 'hall' || kind === 'night' || kind === 'bomb') {
      for (x = 20; x < 800; x += 26 + r() * 20) { var h = 30 + r() * 70; s += '<rect x="' + x.toFixed(0) + '" y="' + (262 - h).toFixed(0) + '" width="' + (16 + r() * 14).toFixed(0) + '" height="' + h.toFixed(0) + '" fill="#06090f"/>'; for (var j = 0; j < 3; j++) if (r() > .45) s += '<rect x="' + (x + 4 + j * 6).toFixed(0) + '" y="' + (262 - h + 8 + r() * (h - 16)).toFixed(0) + '" width="3" height="4" fill="#ffd27a"/>'; }
    }
    if (kind === 'bomb') {
      s += '<polygon points="120,300 150,0 190,0 230,300" fill="#fff" opacity=".07"/><polygon points="560,300 520,0 560,0 640,300" fill="#fff" opacity=".07"/>';
      for (i = 0; i < 3; i++) s += '<g transform="translate(' + (250 + i * 150) + ' ' + (60 + i * 18) + ')"><path d="M0 0l22-3 8-12 3 12 14 1-14 3-3 12-8-12z" fill="#0b0b0b"/></g>';
      s += '<ellipse cx="400" cy="262" rx="260" ry="30" fill="#ff6a2a" opacity=".25"/>';
    }
    if (kind === 'army') {
      for (x = 140; x < 700; x += 22) s += '<g fill="#05080d"><circle cx="' + x + '" cy="236" r="5"/><rect x="' + (x - 5) + '" y="241" width="10" height="22"/><rect x="' + (x + 5) + '" y="228" width="2" height="30"/></g>';
      s += '<rect x="396" y="150" width="3" height="110" fill="#222"/>' + taegeuk(430, 168, 1.3);
    }
    if (kind === 'ocean') {
      s += '<rect y="200" width="800" height="100" fill="#0a2a48"/>';
      for (i = 0; i < 7; i++) s += '<path d="M0 ' + (215 + i * 12) + ' q 40 -8 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0 t 80 0" stroke="#9fd0ee" stroke-opacity="' + (0.35 - i * .03).toFixed(2) + '" fill="none" stroke-width="1.5"/>';
      s += '<g transform="translate(470 196)"><path d="M0 20h120l-14 18H14z" fill="#05080d"/><rect x="54" y="2" width="4" height="20" fill="#05080d"/><path d="M58 4l30 14H58z" fill="#e8e0cf"/></g>';
    }
    if (kind === 'cairo') {
      s += '<polygon points="200,255 300,150 400,255" fill="#1b1424"/><polygon points="360,255 430,185 500,255" fill="#241a2e"/><polygon points="470,255 540,200 610,255" fill="#2a2035"/>';
    }
    if (kind === 'jungle') for (x = 10; x < 800; x += 38 + r() * 20) s += '<g fill="#07130c"><rect x="' + x + '" y="190" width="5" height="75"/><ellipse cx="' + (x + 2) + '" cy="188" rx="' + (18 + r() * 10).toFixed(0) + '" ry="' + (22 + r() * 8).toFixed(0) + '"/></g>';
    if (kind === 'journey') s += '<path d="M0 262 Q200 245 400 262 T800 258 V300H0z" fill="#12182a"/><g transform="translate(330 246)"><path d="M0 8h60l-8 8H8z" fill="#05080d"/><rect x="28" y="-14" width="2.5" height="22" fill="#05080d"/><path d="M30 -12l16 12H30z" fill="#05080d"/></g>';
    if (kind === 'dawn') { s += '<rect x="396" y="190" width="3.5" height="70" fill="#1a1a1a"/>' + taegeuk(430, 206, 1.6); s += '<g opacity=".9">'; for (i = 0; i < 14; i++) s += '<line x1="400" y1="175" x2="' + (400 + Math.cos(i * .45 - .2) * 460) + '" y2="' + (175 - Math.sin(i * .45 - .2) * 460) + '" stroke="' + P[2] + '" stroke-opacity=".09" stroke-width="10"/>'; s += '</g>'; }
    if (kind === 'hall') s += '<rect x="330" y="40" width="140" height="150" fill="#ffd27a" opacity=".1" stroke="#ffd27a" stroke-opacity=".5"/><line x1="400" y1="40" x2="400" y2="190" stroke="#ffd27a" stroke-opacity=".4"/><line x1="330" y1="115" x2="470" y2="115" stroke="#ffd27a" stroke-opacity=".4"/>';
    s += '</svg>';
    return s;
  }
  function sceneBox(ev) {
    return '<div class="scene">' + sceneSVG(ev.scene) + '<div class="cap"><div><div class="dt">' + esc(ev.date) + '</div><h2>' + esc(ev.title) + '</h2></div><div class="pl">📍 ' + esc(ev.place) + '</div></div></div>';
  }

  /* ---------- HUD ---------- */
  function hud(year, doneEvents) {
    var segs = '';
    for (var y = 1; y <= 5; y++) {
      var evs = E.eventsOfYear(y).length, n = 0;
      E.eventsOfYear(y).forEach(function (e) { if (S.log.some(function (l) { return l.id === e.id; })) n++; });
      segs += '<div class="seg ' + (y < year ? 'done' : '') + '"><i style="width:' + (y < year ? 100 : y === year ? Math.round(n / evs * 100) : 0) + '%"></i></div>';
    }
    var Y = E.YEARS[year - 1];
    var st = E.STATS.map(function (t) {
      var v = S.st[t.k];
      return '<div class="stat ' + (v < 25 ? 'low' : '') + '" data-k="' + t.k + '" title="' + t.d + '"><div class="row"><span class="gl">' + t.g + '</span><span class="nm">' + t.n + '</span><span class="v">' + v + '</span></div><div class="bar"><i style="width:' + v + '%"></i>' + (t.k !== 'f' ? '<b class="goal" title="목표 55"></b>' : '') + '</div><span class="delta"></span></div>';
    }).join('');
    return '<div class="term">' + segs + '</div><div class="term-meta"><span><b>' + year + '년차</b> · ' + esc(Y.title) + '</span><span>' + esc(Y.period) + ' · 결정 ' + S.log.length + '/' + E.EVENTS.length + '</span></div><div class="stats">' + st + '</div>' + goals();
  }
  // 광복 준비도: 결말을 정하는 네 조건(민심 · 외교 · 단합 55, 군사 55 + 독수리 작전)과 남은 위기 구제를 늘 보여 준다
  function goals() {
    var G = [['p', '민심 55'], ['d', '외교 55'], ['u', '단합 55'], ['a', '군사 55 · 독수리 작전']], n = 0;
    var cs = G.map(function (g) { var ok = S.st[g[0]] >= 55 && (g[0] !== 'a' || S.flags.eagle); if (ok) n++; return '<span class="gc' + (ok ? ' ok' : '') + '">' + (ok ? '✓ ' : '') + g[1] + '</span>'; }).join('');
    return '<div class="goals"><span class="gt">광복 준비도 <b>' + n + '/4</b></span>' + cs + '<span class="sv' + (S.saved ? ' used' : '') + '">' + (S.saved ? '위기 구제 다 씀' : '⚑ 위기 구제 1회') + '</span>' +
      '<span class="gh">채운 개수가 결말을 정해요 · 4개 S · 3개 A · 2개 B</span></div>';
  }
  function topbar() {
    return '<div class="topbar"><div class="brand"><div class="kgd-seal">史</div><div>펜데믹 대통령<small>오늘의 도전 · 11월 1일</small></div></div><div class="tb-right"><button class="chip-btn" data-act="codex">인물 도감</button><button class="chip-btn" data-act="home">처음으로</button><button class="chip-btn" data-act="exit">로비로</button></div></div>';
  }
  function setStats(real) {
    E.STATS.forEach(function (t) {
      var el = $('.stat[data-k="' + t.k + '"]'); if (!el) return;
      var v = S.st[t.k]; el.querySelector('.v').textContent = v; el.querySelector('.bar i').style.width = v + '%'; el.classList.toggle('low', v < 25);
      var d = real && real[t.k];
      if (d) { var de = el.querySelector('.delta'); de.textContent = (d > 0 ? '+' : '') + d; de.className = 'delta show ' + (d > 0 ? 'up' : 'dn'); }
    });
    var gl = $('.goals'); if (gl) gl.outerHTML = goals();
  }

  /* ---------- 타자기 ---------- */
  function typeInto(el, text, done) {
    stopTyping();
    if (reduce) { el.textContent = text; done && done(); return; }
    var i = 0, fin = false;
    function end() { if (fin) return; fin = true; clearInterval(typer); typer = null; el.textContent = text; el.onclick = null; done && done(); }
    el.onclick = end;
    typer = setInterval(function () { i += 2; if (i >= text.length) return end(); el.innerHTML = esc(text.slice(0, i)) + '<span class="cur"></span>'; }, 22);
  }
  function stopTyping() { if (typer) { clearInterval(typer); typer = null; } }

  /* ---------- 화면: 인트로 ---------- */
  function intro() {
    phase = 'intro'; stopTyping();
    var rec = load();
    var best = rec.best ? '<span class="best">나의 최고 기록 <b>' + rec.best + '점</b> · ' + esc(rec.bestGrade || '') + ' (도전 ' + (rec.attempts || 0) + '회)</span>' : '<span class="best">아직 기록이 없습니다. 첫 도전을 시작해 보세요.</span>';
    app.innerHTML = topbar() +
      '<div class="hero fade"><div class="scene" style="aspect-ratio:16/9">' + sceneSVG('journey') + '</div><div class="over">' +
      '<div class="kicker"><span class="dot"></span>11월 1일 · 오늘의 도전</div>' +
      '<h1>김구,<br><em>대한민국 독립</em></h1>' +
      '<p class="sub">전염병이 아닌 역사 속 한 인물이 마주친 시대. 1940년 가을, 충칭에 닿은 임시정부의 주석이 되어 5년 단임의 임기 동안 광복을 향해 나아가세요.</p>' +
      '<div class="pills"><span class="pill">⏳ 5년 단임 (1940.9 – 1945.8)</span><span class="pill">🚫 아이템 없음</span><span class="pill">🗣 참모 회의</span><span class="pill">📜 실제 역사 기반</span></div>' +
      '<div class="cta"><button class="btn primary" data-act="brief">도전 시작하기</button>' + best + '</div></div></div>' +
      '<div class="teaser"><span class="lock">🔒</span><span>내일의 도전은 아직 비밀입니다. 오늘의 임기를 마치고 기록을 남겨 보세요.</span></div>';
  }

  /* ---------- 화면: 브리핑 ---------- */
  function brief() {
    phase = 'brief';
    var rs = E.STATS.map(function (t) { return '<div class="rs"><span class="gl">' + t.g + '</span><span><b>' + t.n + '</b> — ' + t.d + '</span></div>'; }).join('');
    app.innerHTML = topbar() +
      '<div class="panel fade"><div class="profile"><div class="avatar">金</div><div><b>김구 (金九, 1876~1949)</b><span>대한민국 임시정부 · 1940년 가을, 만 64세</span></div></div>' +
      '<p>동학 농민군에서 의병, 교육 운동, 신민회를 거쳐 1919년 상하이 임시정부에 합류했다. 1932년 이봉창·윤봉길 의거를 이끈 뒤 일본의 끈질긴 추격을 받으며 난징, 창사, 광저우, 류저우, 치장으로 피난을 거듭했고, 1940년 9월 마침내 충칭에 닿았다. 어머니와 아들을 먼저 잃은 노(老)투사에게 남은 것은 가난한 정부와 흩어진 동지들, 그리고 광복이라는 한 가지 목표다.</p></div>' +
      '<div class="brief">' +
      '<div class="panel"><h3>시대 배경</h3><ul><li>중일전쟁 3년째, 충칭은 장제스 정부의 전시 수도이자 일본군 폭격의 표적이다.</li><li>유럽에서는 나치 독일이 서유럽을 휩쓸고, 태평양에는 전운이 짙어진다.</li><li>임시정부는 중국의 지원 없이는 한 달도 버티기 어렵지만, 지원받는 만큼 자주성은 흔들린다.</li><li>미국, 영국, 소련 어느 나라도 임정을 승인하지 않았다.</li></ul></div>' +
      '<div class="panel"><h3>규칙</h3><ul><li>5년의 임기 동안 <b>23번의 결정</b>을 내립니다.</li><li><b>아이템은 쓸 수 없습니다.</b> 오직 선택만으로 시대를 헤쳐 나갑니다.</li><li>결정마다 <b>참모 회의</b>가 열립니다. 참모마다 자기 제안을 따르면 무엇이 오르고(▲) 내리는지(▼) 말해 줍니다. 누구의 말을 따를지 고르세요.</li><li><b>광복 준비도</b>: 민심 · 외교 · 단합 55 이상, 군사 55 이상과 독수리 작전. 많이 채울수록 좋은 결말을 맞습니다.</li><li>지표가 0이 되면 <b>한 번은</b> 동지들이 버텨 줍니다. 두 번째에는 임기가 끝납니다.</li><li>임기가 끝나면 커리어 점수, 등급, 결말이 정해집니다.</li></ul></div>' +
      '<div class="panel full"><h3>다섯 가지 지표</h3><div class="rule-stats">' + rs + '</div></div></div>' +
      '<div class="nextbar"><button class="btn ghost" data-act="home" style="margin-right:10px">뒤로</button><button class="btn primary" data-act="start">1940년 9월, 충칭으로</button></div>';
  }

  /* ---------- 게임 진행 ---------- */
  function start() {
    S = E.newGame(); var rec = load(); rec.attempts = (rec.attempts || 0) + 1; save(rec); T0 = Date.now(); dcTry(C.date); snd('start');
    showEvent();
  }
  function nextEventObj() { return E.EVENTS[S.idx] || null; }

  function showEvent() {
    var ev = nextEventObj(); if (!ev) return finish();
    curEv = ev; phase = 'event'; S.year = ev.y;
    order = E.order(SEED, ev.id, ev.ch.length);
    var sp = ev.sp;
    app.innerHTML = topbar() + hud(ev.y) + '<div class="fade">' + sceneBox(ev) +
      '<div class="card"><div class="speaker"><div class="avatar">' + esc(sp[2]) + '</div><div><div class="n">' + esc(sp[0]) + '</div><div class="r">' + esc(sp[1]) + '</div></div></div><div class="story" id="story"></div><div class="hint">클릭하면 문장이 바로 나타납니다</div></div>' +
      '<div class="choices" id="choices" style="display:none"></div><div id="res"></div></div>';
    var text = ev.text;
    (ev.tx || []).forEach(function (t) { if (E.condOK(t.c, S)) text += '\n\n' + t.t; });
    typeInto($('#story'), text, showChoices);
    root.scrollTo({ top: 0, behavior: 'smooth' });
  }
  // 참모 회의: 선택지마다 그 길을 내세우는 임정 인물을 붙인다. 지금 상황에서 실제로 오를(▲) · 내릴(▼) 지표를 미리 계산해 보여 준다(숫자 대신 크기만)
  var ADV = { p: ['엄항섭', '차리석'], d: ['조소앙', '이승만', '김규식'], a: ['지청천', '이범석', '김원봉'], f: ['차리석', '엄항섭'], u: ['김규식', '조소앙', '차리석'] };
  var ADV_FROM = { '김규식': 3, '김원봉': 2 };   // 임정에 합류한 해(년차) 전에는 내세우지 않는다
  function person(n) { for (var i = 0; i < PEOPLE.length; i++) if (PEOPLE[i][1] === n) return PEOPLE[i]; return ['議', n, '국무위원', '']; }
  function council(ev) {
    var used = {};
    return ev.ch.map(function (c, i) {
      var P = E.preview(S, ev, i), fx = P.fx, who = null;
      var ks = E.STATS.map(function (t) { return t.k; }).sort(function (a, b) { return (fx[b] || 0) - (fx[a] || 0); });
      for (var j = 0; j < ks.length && !who; j++) (ADV[ks[j]] || []).some(function (n) { if (!used[n] && (ADV_FROM[n] || 0) <= ev.y) { who = n; return true; } return false; });
      who = who || '국무위원 회의'; used[who] = 1;
      return { p: person(who), pv: P };
    });
  }
  function advChips(P) {
    var h = E.STATS.filter(function (t) { return P.fx[t.k]; }).map(function (t) { var d = P.fx[t.k], a = d > 0 ? (d >= 6 ? '▲▲' : '▲') : (d <= -6 ? '▼▼' : '▼'); return '<span class="ac ' + (d > 0 ? 'up' : 'dn') + '">' + t.g + ' ' + t.n + ' ' + a + '</span>'; }).join('');
    if (P.over) h += '<span class="ac dn">⚠ 임기가 끝난다</span>'; else if (P.saved) h += '<span class="ac dn">⚑ 위기 구제를 쓴다</span>';
    return h || '<span class="ac">큰 변화 없음</span>';
  }
  var CN = [];
  function showChoices() {
    var box = $('#choices'); if (!box) return; var h = '<div class="council"><b>참모 회의</b><span>누구의 말을 따르시겠습니까?</span></div>';
    CN = council(curEv);
    order.forEach(function (ci, pos) {
      var c = curEv.ch[ci], A = CN[ci], P = A.p;
      h += '<button class="choice adv" data-ci="' + ci + '" style="animation-delay:' + pos * 90 + 'ms"><span class="no">' + (pos + 1) + '</span><span class="ab">' +
        '<span class="who"><i class="av">' + esc(P[0]) + '</i><b>' + esc(P[1]) + '</b><small>' + esc(P[2]) + '</small></span>' +
        '<div class="t">' + esc(c.t) + '</div><div class="d">' + esc(c.d) + '</div><div class="acs">' + advChips(A.pv) + '</div></span></button>';
    });
    box.innerHTML = h; box.style.display = 'grid';
    // 참모 카드가 화면 아래에 숨어 있으면, 회의 제목이 화면 위쪽 1/3쯤 오도록 내려 준다
    setTimeout(function () { var c = $('.council'); if (c && c.getBoundingClientRect().top > root.clientHeight * 0.6) root.scrollTo({ top: Math.max(0, c.offsetTop - root.clientHeight * 0.3), behavior: reduce ? 'auto' : 'smooth' }); }, 80);
    var hn = $('.hint'); if (hn) hn.textContent = '숫자 키 1~' + order.length + '로도 선택할 수 있습니다';
  }

  function pick(ci) {
    if (phase !== 'event') return; phase = 'result'; stopTyping();
    var box = $('#choices'); box.classList.add('locked');
    [].forEach.call(box.children, function (b) { if (+b.dataset.ci === ci) b.classList.add('picked'); });
    var res = E.choose(S, curEv, ci), AP = (CN[ci] || {}).p || person('국무위원 회의');
    S.log[S.log.length - 1].adv = AP[1];
    setStats(res.fx);
    var chips = E.STATS.filter(function (t) { return res.fx[t.k]; }).map(function (t) { var d = res.fx[t.k]; return '<span class="dchip ' + (d > 0 ? 'up' : 'dn') + '">' + t.g + ' ' + t.n + ' ' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</span>'; }).join('');
    var extra = res.texts.map(function (t) { return '<div class="extra">' + esc(t) + '</div>'; }).join('');
    var hist = res.note || res.hist ? '<div class="histbox">' + (res.hist ? '<span class="badge">실제 역사와 같은 선택</span>' : '') + (res.note ? '<b>역사 속에서는</b> — ' + esc(res.note) : '') + '</div>' : '';
    var overTxt = '';
    if (S.over) { var st = E.STATS.filter(function (t) { return t.k === S.over; })[0]; overTxt = '<div class="extra" style="border-color:#b3302c;background:#b3302c22"><b>⚠ ' + st.n + ' 지표가 바닥났습니다.</b> 임기가 여기서 끝납니다.</div>'; }
    if (res.saved) { var sv = E.STATS.filter(function (t) { return t.k === res.saved; })[0]; overTxt += '<div class="extra save"><b>⚑ ' + sv.n + '이(가) 바닥날 뻔했지만 동지들이 십시일반 버텨 냈습니다.</b> 이 구제는 한 번뿐입니다. 다음에 바닥나면 임기가 끝납니다.</div>'; }
    $('#res').innerHTML = '<div class="result"><div class="card"><div class="followed"><i class="av">' + esc(AP[0]) + '</i><span><b>' + esc(AP[1]) + '</b>의 말을 따랐다</span></div><div class="rt">' + esc(res.r) + '</div>' + extra + overTxt + '<div class="deltas">' + chips + '</div>' + hist + '</div>' +
      '<div class="nextbar"><button class="btn primary" data-act="next">' + (S.over ? '결과 보기' : '다음 ›') + '</button></div></div>';
    setTimeout(function () { var r = $('#res'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
  }

  function next() {
    if (phase !== 'result') return;
    if (S.over) return finish();
    var ev = curEv, upcoming = nextEventObj();
    if (!upcoming) return finish();
    if (upcoming.y !== ev.y) return yearEnd(ev.y);
    showEvent();
  }

  function yearEnd(y) {
    phase = 'yearend';
    var res = E.yearEnd(S, y), Y = E.YEARS[y - 1], N = E.YEARS[y];
    var news = Y.news.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');
    var chips = E.STATS.filter(function (t) { return res.fx[t.k]; }).map(function (t) { var d = res.fx[t.k]; return '<span class="dchip ' + (d > 0 ? 'up' : 'dn') + '" style="background:#ffffff10;border-color:#ffffff22;color:' + (d > 0 ? '#7be0ae' : '#ff8b82') + '">' + t.g + ' ' + t.n + ' ' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</span>'; }).join('');
    app.innerHTML = topbar() + hud(y) + '<div class="fade"><div class="news"><div class="mast"><b>世 界 日 報</b><small>' + esc(Y.period) + ' · ' + y + '년차 결산</small></div><ul>' + news + '</ul></div>' +
      '<div class="ye-note"><b style="color:var(--gold2);font-family:var(--serif)">임기 ' + y + '년차를 마치며.</b> ' + esc(res.note) + ' ' + res.texts.map(esc).join(' ') + (res.saved ? ' <b style="color:#ffd27a">⚑ 연말에 지표가 바닥날 뻔했지만 동지들이 버텨 냈습니다. 구제는 이제 남지 않았습니다.</b>' : '') + '<div class="deltas" style="margin-top:10px">' + chips + '</div></div>' +
      (S.over ? '' : '<div class="next-ch"><small>NEXT CHAPTER</small><h3>' + (y + 1) + '년차 · ' + esc(N.title) + '</h3><p>' + esc(N.intro) + '</p></div>') +
      '<div class="nextbar"><button class="btn primary" data-act="next2">' + (S.over ? '결과 보기' : (y + 1) + '년차 시작') + '</button></div></div>';
    setStats(res.fx);
    root.scrollTo({ top: 0 });
  }

  /* ---------- 결과 ---------- */
  function radar(a, b) {
    var cx = 130, cy = 120, R = 85, ks = E.STATS, n = ks.length, g = '';
    function pt(i, v) { var an = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(an) * R * v / 100, cy + Math.sin(an) * R * v / 100]; }
    [25, 50, 75, 100].forEach(function (lv) { g += '<polygon points="' + ks.map(function (k, i) { return pt(i, lv).join(','); }).join(' ') + '" fill="none" stroke="#ffffff22"/>'; });
    ks.forEach(function (k, i) { var p = pt(i, 100), q = pt(i, 118); g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="#ffffff18"/><text x="' + q[0] + '" y="' + (q[1] + 4) + '" fill="#cfd7e4" font-size="12" text-anchor="middle" font-family="serif">' + k.n + '</text>'; });
    g += '<polygon points="' + ks.map(function (k, i) { return pt(i, b[k.k]).join(','); }).join(' ') + '" fill="none" stroke="#9aa6b8" stroke-dasharray="4 3"/>';
    g += '<polygon points="' + ks.map(function (k, i) { return pt(i, a[k.k]).join(','); }).join(' ') + '" fill="#c9a24a44" stroke="#e6c26a" stroke-width="2"/>';
    ks.forEach(function (k, i) { var p = pt(i, a[k.k]); g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="#e6c26a"/><text x="' + p[0] + '" y="' + (p[1] - 7) + '" fill="#fff" font-size="11" text-anchor="middle">' + a[k.k] + '</text>'; });
    return '<svg viewBox="0 0 260 240" style="width:100%;max-width:330px;display:block;margin:0 auto">' + g + '</svg>';
  }

  function finish() {
    phase = 'final'; stopTyping();
    var sc = E.score(S), gr = E.grade(sc.total), en = sc.ending;
    var rec = load(), newBest = false;
    if (!rec.best || sc.total > rec.best) { rec.best = sc.total; rec.bestGrade = gr.g + ' · ' + gr.n; newBest = true; save(rec); }
    var gradeLetter = en.fail ? 'F' : gr.g;
    // 오늘의 도전 순위: 이 기기에 최고 점수를 남기고, 기록 서버로 한 줄을 보낸다(점수 · 등급 · 결말만)
    dcSave(C.date, sc.total);
    dcStorySend(C, sc.total, en.fail ? '임기 중단 · ' + en.title : en.title, gradeLetter + ' · ' + (en.fail ? '조기 퇴진' : gr.n), Math.round((Date.now() - T0) / 1000), S.log.length);
    var mb = dcRec(C.date); if (mb && mb.done && +mb.score > (rec.best || 0)) rec.best = +mb.score;
    var tl = S.log.map(function (l) {
      var ev = E.EVENTS.filter(function (e) { return e.id === l.id; })[0], cls = l.net >= 8 ? 'g' : l.net >= 0 ? 'y' : 'r';
      return '<div class="it"><span class="dot ' + cls + '"></span><span><span class="ev">' + esc(ev.date) + ' · ' + esc(ev.title) + '</span>' + esc(l.label) + '</span>' + (l.hist ? '<span class="hb">史</span>' : '') + '</div>';
    }).join('');
    var ach = E.ACH.map(function (a) { var ok = a.test(S); return '<div class="a ' + (ok ? '' : 'off') + '"><span>🏅</span><span><b>' + esc(a.n) + '</b><span>' + esc(a.t) + '</span></span><em>' + (ok ? '+' + a.pts : '🔒') + '</em></div>'; }).join('');
    var emoji = S.log.map(function (l) { return l.net >= 8 ? '🟩' : l.net >= 0 ? '🟨' : '🟥'; }).join('');
    var shareTxt = '🇰🇷 펜데믹 대통령 · 오늘의 도전 (11/1)\n김구 — 대한민국 독립\n\n등급 ' + gradeLetter + (en.fail ? ' (임기 중단)' : ' · ' + gr.n) + '\n커리어 점수 ' + sc.total + '점\n결말: ' + en.title + '\n실제 역사와 같은 선택 ' + S.histCount + '/' + E.EVENTS.length + '\n\n' + emoji.replace(/(.{20})/g, '$1\n').trim();
    root._share = shareTxt;
    app.innerHTML = topbar() + '<div class="fade">' +
      '<div class="final-top"><div class="stamp">' + gradeLetter + '</div><div><div class="kicker"><span class="dot"></span>' + (en.fail ? '임기 중단' : '임기 종료 · 1945년 8월') + '</div><h1>' + esc(en.title) + '</h1><div class="gname">' + (en.fail ? '조기 퇴진' : esc(gr.n) + ' — ' + esc(gr.d)) + '</div><div class="score"><b>' + sc.total + '</b>점 ' + (newBest ? '· ✨ 오늘의 최고 기록' : '· 최고 ' + rec.best + '점') + '</div></div></div>' +
      '<div class="panel" style="margin-top:16px"><p class="endtext">' + esc(en.text) + '</p>' + (en.alt ? '<span class="alt">※ 실제 역사와 다른 가상의 결말입니다</span>' : '') + '</div>' +
      '<div class="grid2"><div class="panel"><h3>최종 지표</h3>' + radar(S.st, E.START) + '<div class="hint" style="color:#9aa6b8;text-align:center">점선은 임기 시작 시점</div></div>' +
      '<div class="panel"><h3>커리어 점수</h3><div class="breakdown"><div><span>지표 합산</span><b>' + sc.core + '</b></div><div><span>임기 진행도</span><b>' + sc.prog + '</b></div><div><span>결말 보너스</span><b>' + sc.bonus + '</b></div><div><span>업적</span><b>' + sc.apts + '</b></div><div style="border:0;font-size:16px"><span>합계</span><b style="color:var(--gold2)">' + sc.total + '</b></div></div>' +
      '<div class="hint" style="color:#9aa6b8;text-align:left;margin-top:8px">실제 역사와 같은 선택: ' + S.histCount + '/' + E.EVENTS.length + trust() + '</div></div></div>' +
      '<div class="grid2"><div class="panel"><h3>업적</h3><div class="ach">' + ach + '</div></div><div class="panel"><h3>나의 임기 기록</h3><div class="tl">' + tl + '</div><div class="hint" style="text-align:left;color:#9aa6b8">🟩 큰 성과 · 🟨 무난 · 🟥 손실 · 史 = 실제 역사와 같은 선택</div></div></div>' +
      '<div class="epi"><b style="color:var(--gold2)">그 후의 역사.</b> ' + esc(E.EPILOGUE) + '</div>' +
      '<div class="panel" style="margin-top:14px"><h3>결과 공유</h3><div class="share">' + esc(shareTxt) + '</div><div class="nextbar" style="justify-content:flex-start;gap:10px;flex-wrap:wrap"><button class="btn primary" data-act="copy">결과 복사</button><button class="btn ghost" data-act="start">다시 도전</button><button class="btn ghost" data-act="rank">오늘의 순위</button><button class="btn ghost" data-act="exit">로비로</button></div></div></div>';
    root.scrollTo({ top: 0 });
  }

  // 가장 많이 말을 따른 참모
  function trust() {
    var c = {}, top = null; S.log.forEach(function (l) { if (l.adv) { c[l.adv] = (c[l.adv] || 0) + 1; if (!top || c[l.adv] > c[top]) top = l.adv; } });
    return top ? '<br>가장 믿은 참모: <b style="color:var(--gold2)">' + esc(top) + '</b> (' + c[top] + '번)' : '';
  }
  /* ---------- 도감 ---------- */
  var PEOPLE = [
    ['金', '김구', '임시정부 주석', '1940년 10월 주석에 선출되어 1945년 광복까지 임시정부를 이끌었다. 한인애국단을 조직해 이봉창·윤봉길 의거를 지휘했다.'],
    ['池', '지청천', '광복군 총사령', '만주 독립군 지도자 출신. 1940년 한국광복군 총사령으로 취임했다.'],
    ['李', '이범석', '광복군 참모장 · 제2지대장', '청산리 전투에 참여한 군인. 시안에서 OSS와 합동 훈련(독수리 작전)을 이끌었다.'],
    ['趙', '조소앙', '외무부장', '삼균주의를 체계화해 1941년 건국강령의 이론적 기초를 놓았다.'],
    ['嚴', '엄항섭', '선전부장', '임시정부의 대외 홍보와 선전·기관지 발행을 맡았다.'],
    ['車', '차리석', '비서장', '임정의 살림과 행정을 맡아 충칭 시기를 버텨 낸 실무의 중심 인물.'],
    ['金', '김규식', '부주석', '미국·중국에 폭넓은 인맥을 가진 학자·외교가. 1944년 부주석에 선출되었다.'],
    ['金', '김원봉', '조선의용대장 · 군무부장', '조선의용대를 이끌었고 1942년 광복군 부사령에 올랐다. 1944년에는 군무부장을 맡았다.'],
    ['李', '이승만', '주미외교위원장', '1941년 주미외교위원부 위원장으로 워싱턴에서 승인 외교를 벌였다.'],
    ['蔣', '장제스', '중국 국민정부 주석', '임정과 광복군을 지원했고, 카이로 회담에서 한국 독립 문제를 제기했다.'],
    ['張', '장준하', '학병 탈출자', '일본군을 탈출해 1945년 1월 충칭에 도착, 광복군에 합류했다. 훗날 잡지 『사상계』를 발행했다.']
  ];
  function codex() {
    var m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = '<div class="box"><h3>인물 도감</h3>' + PEOPLE.map(function (p) { return '<div class="person"><div class="avatar">' + p[0] + '</div><div><b>' + p[1] + '</b><small>' + p[2] + '</small><p>' + p[3] + '</p></div></div>'; }).join('') + '<div class="nextbar"><button class="btn ghost" data-act="close">닫기</button></div></div>';
    m.addEventListener('click', function (e) { if (e.target === m || (e.target.dataset && e.target.dataset.act === 'close')) m.remove(); });
    root.appendChild(m);
  }
  function toast(t) { var d = document.createElement('div'); d.className = 'toast'; d.textContent = t; root.appendChild(d); setTimeout(function () { d.remove(); }, 2200); }
  function copy() {
    var t = root._share || '';
    function ok() { toast('결과를 복사했습니다'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = t; root.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('복사하지 못했습니다'); } ta.remove(); }
  }

  /* ---------- 이벤트 ---------- */
  root.addEventListener('click', function (e) {
    var ch = e.target.closest('.choice'); if (ch && phase === 'event') return pick(+ch.dataset.ci);
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.dataset.act;
    if (a !== 'copy') snd(a === 'exit' || a === 'home' ? 'back' : 'click');
    if (a === 'exit') return close();
    if (a === 'rank') { var sc0 = S && E.score(S).total; return close(function () { dcOpen(null, { score: sc0, ranked: true }); }); }
    if (a === 'brief') brief(); else if (a === 'start') start(); else if (a === 'home') { stopTyping(); intro(); }
    else if (a === 'next') next(); else if (a === 'next2') { if (S.over) finish(); else showEvent(); }
    else if (a === 'codex') codex(); else if (a === 'copy') copy();
  });
  var kd = function (e) {
    if (!root.isConnected) { window.removeEventListener('keydown', kd, true); return; }
    e.stopPropagation();
    if (e.key === 'Escape') { var m = $('.modal'); if (m) m.remove(); return; }
    if (phase === 'event' && /^[1-9]$/.test(e.key)) { var pos = +e.key - 1; if (order[pos] !== undefined && $('#choices') && $('#choices').style.display !== 'none') pick(order[pos]); }
    else if ((e.key === 'Enter' || e.key === ' ') && phase === 'result') { e.preventDefault(); next(); }
    else if ((e.key === 'Enter' || e.key === ' ') && phase === 'yearend') { e.preventDefault(); if (S.over) finish(); else showEvent(); }
  };
  window.addEventListener('keydown', kd, true);

  intro();
  try { root.focus({ preventScroll: true }); } catch (e) { }
  window.__kgd = { get S() { return S; }, pick: function (ci) { pick(ci); }, next: function () { if (phase === 'yearend') { if (S.over) finish(); else showEvent(); } else next(); }, get phase() { return phase; }, get order() { return order; } };
}
