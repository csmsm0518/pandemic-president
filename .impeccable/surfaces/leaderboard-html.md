---
version: 1
slug: "leaderboard-html"
primary_target: "leaderboard.html"
related_targets: []
---

---
version: 1
slug: "leaderboard-html"
primary_target: "leaderboard.html"
related_targets: []
---

# 리더보드 (leaderboard.html)

## Scope

- 웹 리더보드 페이지 한 장. 모드: Persuade(보는 사람이 1위 점수를 보고 게임을 하러 가게 만든다).
- 주 사용 환경: 학생 각자의 휴대폰·태블릿. 게임 결과 화면의 '전체 순위'나 링크로 들어온다.
- 지킬 기능: 커리어 점수·최장 집권·최근 기록·권력 통계 탭, 난이도 칸(?diff=), 내 순위 배너(?id=&me=), 새 기록 표시, 15초 자동 갱신과 연결 상태, 예시 데이터(?demo=1). 닉네임과 점수 밖의 개인정보는 보이지 않는다.

## Direction contract

THESIS: 순위는 표가 아니라 어두운 전당 벽에 거는 황동 명판이다. 흰 바탕 표에 숫자 줄을 세우는 리더보드 기본형을 거부한다.

OWN-WORLD: 따뜻한 어둠(#1b1610에서 #120f0b로) 위에 금(#f1d589·#c9a24a·#8a6a24)·은·동 명판. 장식(판자 결, 나사, 금속 노이즈, 파낸 글자)은 사용자 요청으로 걷어 냈고, 명판은 금속 색과 그림자 하나, 판 가장자리의 큰 순위 숫자, 초상 메달만 남긴다. 난이도는 한 줄로 이어진 알약 칸, 보기는 밑줄 탭, 행동 단추는 금빛 단추. 개표 방송에서 가져온 '내 커리어' 줄과 맨 아래 속보 자막(사용자 요청).

STORY: 1위 명판의 점수를 보고 경쟁심이 생기고, 내 자리와 1위까지 남은 점수를 확인하고, '게임 하러 가기'를 누른다.

FIRST VIEWPORT: 맨 위 LIVE 표시와 금빛 '게임 하러 가기'(게임 안에서는 '전체 순위'와 '게임으로'). 제목 '명예의 전당'. 난이도 칸과 보기 탭. 1위 큰 금 명판(초상 메달, 닉네임, 점수, 몇 선·닮은 지도자), 은·동 명판 두 장, '내 커리어 · 1위까지 N점 | n위' 줄과 출마하기 단추가 휴대폰 첫 화면 안에 든다. 4위부터 이름·지도자·점수만 담은 목록.

FORM: 명판의 벽, 내 후보 목록 5번째, seed:bccbca74d6b282c8. 대표 동작: 새 기록이 들어오면 그 명판 위로 빛이 한 번 쓸고 지나가고, 난이도를 바꾸면 명판이 위에서 다시 걸린다.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
