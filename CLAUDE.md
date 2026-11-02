# CLAUDE.md — 팬데믹 대통령 저장소 안내 (AI 도우미가 먼저 읽기)

이 저장소의 게임 기획 · 디자인 · 코드는 모두 원작자 **@csmsm0518**의 것이다. 원작자가 따로 말하지 않으면
**디자인 · UI · 게임 방식(규칙 · 밸런스 · 문구)은 바꾸지 않는다.** 시킨 일만 하고, 그 밖에 고칠 점은 제안만 한다.

## 1. 한눈에

- 바닐라 HTML/CSS/JS 브라우저 게임. 프레임워크 · npm 없음. 빌드는 파이썬 표준 라이브러리만 쓴다.
- GitHub Pages가 `main` 브랜치 맨 위 폴더를 그대로 보여 준다: https://csmsm0518.github.io/pandemic-president/
- 플레이어는 주로 고등학생, 휴대폰 한 손 화면이 기본(`PRODUCT.md`). 디자인 기준은 `DESIGN.md`.

## 2. 가장 중요한 규칙: 고치는 곳은 `src/`

```
python build.py            # src/ → index.html · game.js · game.css · lazy/*.js 생성
python build.py --check    # 생성 파일이 src/와 맞는지(커밋 전에 꼭). "맞음"이 나와야 한다
python build.py --single 경로.html   # 한 파일 판(오프라인 사본)
python tools/jsdeps.py [조각]        # lazy 조각끼리 주고받는 이름 보기
python -m http.server 8000           # 로컬 실행 → http://localhost:8000
```

- `index.html`, `game.js`, `game.css`, `lazy/`는 **생성 파일**. 직접 고치지 말고 `src/`를 고친 뒤 빌드한다.
- 커밋에는 `src/` 변경과 다시 만든 생성 파일을 **함께** 넣는다(Pages가 생성 파일을 그대로 쓰므로).
- 자세한 빌드 원리와 lazy 조각 표는 `src/README.md`.

## 3. 코드 지도

`src/js/*.js`는 파일 이름 순서대로 이어 붙여 `(function(){ … })();` 하나로 감싼다. 파일끼리 맨 바깥 변수를 그대로 공유한다.

| 번호 | 내용 |
|---|---|
| 00 · 00a | 공통 도구 · lazy 조각 로더(`lzRun`, `lzThen`, 지문 검사) |
| 01–04 | 커리어 데이터, 시나리오, 초상, 참모 명단 |
| 05 | 참모 회의(`council`, 비상소집 `cnEmerg`, 숨은 인물 만남 `cnEnc`) |
| 06–08b | DLC(조선 · 미국 · 제국), 캠페인 정의 `CAMPS`, 나라별 사건 |
| 09–17 | 좀비 비밀판, 특별 사건 · 특별 국정 과제 보드 · 방역/올림픽 특집, 특집 흐름 `spAct` |
| 18–19 | 소리(`BGM`, `SFX`, 곡 파일은 `audio/` + 파일 이름) · 지도 |
| 20 | 상태 변수 선언(`S`, `CAR`, `RUN` …), 기기 저장 `mload`/`msave` |
| 21–25 | 이스터에그, 금빛 효과, 시네마, 홈 메뉴 · 로비 상자, 화면 설정 |
| 26 | 저장/불러오기 슬롯(`svSave`, `svLoad`) |
| 27–32 | 판 시작 `start`, 한 턴 진행 `ev`/`choose`/`resolve`/`reroll`, 차트, 연말, 임기 평가, 커리어 결산 `careerEnd` |
| 33–36z | 보드 코어, 좀비 서바이버, 홈 아이콘, 제국 DLC 흐름, 조선 위기, 회원(`acApi`) |
| 37 | 연구 기록 전송(`SHEET_URL`, 보낼 편지함 `obFlush`), 참가자 정보 `PF`, `GAME_VER` |
| 38 | 업데이트 소식 `PATCHES` |

`src/lazy/<이름>/`: battle(실시간 대결) · board(명예의 전당) · boxes(건의사항함 · 쿠폰함) · card · dex(도감) · door · games · guide(가이드북) · kgmini · sail · slash(백신 슬래시) · sports(올림픽 종목) · star · wcurl/whockey/wjump/wskate(동계 종목).

## 4. 새 버전을 올릴 때

1. `src/js/37-research-log.js`의 `GAME_VER` 올리기(작은 수정 v5.2→v5.3, 큰 변화 v6.0).
2. `src/js/38-patch-notes.js`의 `PATCHES` 맨 위에 같은 이름으로 항목 추가.
3. `python build.py` → `python build.py --check` → 브라우저에서 확인 → 커밋 · 푸시.

## 5. 서버 두 곳 (저장소 파일만 바꾸면 반영되지 않는다)

- **기록 · 순위**: `apps-script.gs` → Apps Script 편집기에 붙여 넣고 *배포 → 배포 관리 → 기존 배포 수정 → 새 버전*. 주소(`SHEET_URL`)는 그대로 유지된다.
- **실시간 대결**: `firebase-rules.json` → Firebase 콘솔 *Realtime Database → 규칙*에 붙여 넣고 게시.
- 클라이언트의 Firebase 웹 키는 원래 공개용이다(권한은 규칙이 막는다).

## 6. 개인정보 (절대 규칙)

- 참가자 이름 · 전화번호는 공개 화면(명예의 전당 · 순위표)에 **절대** 나오면 안 된다. 공개는 닉네임 · 학교 · 점수뿐.
- 전화번호는 기기(localStorage · 저장 슬롯)에 남기지 않는다.
- 서버나 사용자에게서 온 글자를 `innerHTML`에 넣을 때는 반드시 이스케이프: `acEsc`(36z) · `gEsc`(28, 대결 화면도 이것), `lbEsc`(33, 명예의 전당), `esc`(leaderboard.html).
- 테스트할 때 진짜 기록 서버(`script.google.com`)로 가짜 판을 보내지 않는다(연구 시트가 오염된다). 막거나 흉내 낸다.

## 7. 실수하기 쉬운 곳

- **맨 바깥 실행 순서**: 앞 번호 파일의 맨 바깥 코드에서 뒤 번호 파일의 `const`/`let`을 바로 쓰면 TDZ 오류. 함수 선언은 어디서나 된다.
- **lazy 조각**: 조각 밖에서 조각 안의 `const`/`let`을 쓰면 빌드가 멈춘다 → 그 값은 `src/js/`로 옮긴다. 결과를 바로 받아야 하는 조각 함수는 `lzThen('조각', fn)`으로 먼저 받아 둔다.
- **운명 개입(reroll)**: `takeSnap`/`useSnap`(28-play.js)이 판정 전 상태를 되돌린다. `resolve`나 `spAct`에서 **새 `CAR` 기록을 바꾸게 만들면 `SNAP_CAR` 목록에도 그 이름을 더한다.** 안 그러면 다시 굴려도 첫 굴림의 결과가 남는다.
- **기록 보내기**: `obFlush`는 서버 답이 `ok`/`dup`(또는 `bad…`)일 때만 편지함에서 지운다. `apps-script.gs`의 `doPost`는 이 답을 그대로 지켜야 한다.
- **참모 회의**: `council` 안의 `enc`(만남)는 자리(`CAR.cn[s]`)를 기준으로 한다. 자리를 바꾸는 새 버튼을 만들면 만남이 가리키는 사람이 여전히 그 자리에 있는지 확인한다(`draw` 맨 앞의 검사 참고).
- **소리**: 곡은 `BGM_INFO` 등에 **파일 이름만** 적고, 실제 주소는 `'audio/'+이름`. 새 곡은 `audio/`에 넣는다.
- **서비스 워커(sw.js)**: 항상 네트워크 먼저(캐시는 오프라인 대비용)라 새 버전이 바로 반영된다. 바꿀 일이 있으면 `CACHE` 이름을 올린다. 자동 테스트에서 요청을 가로채려면 먼저 서비스 워커 등록을 해제한다.
- **생성 파일 충돌**: 다른 브랜치를 합칠 때 `game.js` · `index.html` · `lazy/`가 충돌하면 손으로 풀지 말고 아무 쪽이나 고른 뒤 `python build.py`로 다시 만든다.

## 8. 브랜치 · PR

- 큰 작업은 `main`에서 새 브랜치를 만들어 하고, 끝나면 PR로 합친 뒤 브랜치를 지운다.
- 커밋 메시지는 `종류: 무엇을 왜` 형식(예: `fix: 참모 해임 시 오류`, `feat: 새 미니게임`).
- 커밋 전: `python build.py --check` → "맞음".
