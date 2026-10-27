---
name: 팬데믹 대통령
description: 따뜻한 어둠 위에 금·은·동 명판을 거는 명예의 전당 세계, 장식을 덜어 낸 판
colors:
  wall: "#120f0b"
  wall-glow: "#1b1610"
  wall-2: "#1d1812"
  wall-3: "#2a2219"
  ticker-ground: "#15110c"
  detail-hi: "#221c14"
  detail-lo: "#16120d"
  gold: "#f1d589"
  gold-2: "#c9a24a"
  gold-3: "#8a6a24"
  brass-hi: "#f8e3a3"
  brass-mid: "#d9b158"
  brass-low: "#b88b34"
  ink: "#efe7d6"
  ink-2: "#cdbf9f"
  ink-3: "#a8987a"
  engraved-ink: "#2a1c07"
  button-ink: "#24170a"
  selection-ink: "#1d1406"
  line: "rgba(201,162,74,.28)"
  line-2: "rgba(201,162,74,.14)"
  silver-plate: "#c1c9d0"
  silver-ink: "#1c2126"
  bronze-plate: "#c6874f"
  bronze-ink: "#2a1405"
  broadcast-red: "#ff5a4f"
  broadcast-red-soft: "#ff8f86"
  broadcast-red-deep: "#c2372e"
  live-green: "#3fc38f"
  alarm-red: "#f0605f"
  diff-easy: "#3fc38f"
  diff-normal: "#e3b341"
  diff-hard: "#e0604f"
  diff-hell: "#ff4d4d"
  diff-all: "#c9a24a"
  exit-retired: "#6f9be0"
typography:
  display:
    fontFamily: "Noto Serif KR, Apple Myungjo, Batang, Georgia, serif"
    fontSize: "clamp(30px, 8vw, 44px)"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "0.06em"
  headline:
    fontFamily: "Noto Serif KR, Apple Myungjo, Batang, Georgia, serif"
    fontSize: "clamp(34px, 10vw, 46px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Noto Serif KR, Apple Myungjo, Batang, Georgia, serif"
    fontSize: "22px"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "0.01em"
  title-sm:
    fontFamily: "Noto Serif KR, Apple Myungjo, Batang, Georgia, serif"
    fontSize: "15px"
    fontWeight: 800
    letterSpacing: "0.02em"
  numeral:
    fontFamily: "Noto Serif KR, Apple Myungjo, Batang, Georgia, serif"
    fontSize: "18px"
    fontWeight: 900
    fontFeature: "tnum"
  body:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
  body-strong:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "15.5px"
    fontWeight: 700
  label:
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.5
rounded:
  chip: "3px"
  control: "6px"
  plate: "8px"
  pill: "999px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "18px"
  2xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.brass-mid}"
    textColor: "{colors.button-ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  button-primary-wide:
    backgroundColor: "{colors.brass-mid}"
    textColor: "{colors.button-ink}"
    rounded: "{rounded.pill}"
    padding: "13px 16px"
    width: "100%"
  link-quiet:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "8px 6px"
  difficulty-track:
    rounded: "{rounded.pill}"
    padding: "3px"
    width: "440px"
  difficulty-pill:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "34px"
  difficulty-pill-selected:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.button-ink}"
    rounded: "{rounded.pill}"
  view-tab:
    textColor: "{colors.ink-3}"
    height: "40px"
    padding: "0 2px"
  view-tab-selected:
    textColor: "{colors.gold}"
  plaque-gold:
    backgroundColor: "{colors.brass-mid}"
    textColor: "{colors.engraved-ink}"
    rounded: "{rounded.plate}"
    padding: "16px 18px"
  plaque-silver:
    backgroundColor: "{colors.silver-plate}"
    textColor: "{colors.silver-ink}"
    rounded: "{rounded.plate}"
  plaque-bronze:
    backgroundColor: "{colors.bronze-plate}"
    textColor: "{colors.bronze-ink}"
    rounded: "{rounded.plate}"
  list-row:
    textColor: "{colors.ink}"
    padding: "13px 4px"
  detail-panel:
    backgroundColor: "{colors.detail-hi}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.control}"
    padding: "16px 16px 14px"
  my-career-row:
    textColor: "{colors.ink-2}"
    padding: "12px 14px"
  ticker:
    backgroundColor: "{colors.ticker-ground}"
    textColor: "{colors.ink}"
    height: "36px"
---

# Design System: 팬데믹 대통령

## Overview

**Creative North Star: "명판의 벽"**

순위는 표가 아니라 어두운 전당에 거는 금·은·동 명판이다. 게임 안 명예의 전당(어두운 무대, 금·은·동 시상대, 지도자 초상)과 같은 금빛 세계를 공유하지만, 리더보드는 사용자 요청("리더보드 디자인 없앨거 없애고 좀 더 깔끔하게")에 따라 장식을 덜어 냈다. 판자 결, 금속 노이즈, 리벳, 안쪽 새김 테두리, 파낸 글자 그림자, 월계관 트로피, 부제, 갱신 타이머 막대는 더 이상 이 세계에 없다. 남은 것은 금속 색 그라데이션과 그림자 하나를 가진 명판, 판 가장자리의 큰 순위 숫자, 초상 메달이다.

밀도는 휴대폰 한 손 화면이 기준이다. 제목 하나 아래 난이도 알약 칸과 밑줄 보기 탭, 그리고 1위 대형 금 명판, 은·동 두 장, '내 커리어' 줄, 넓은 금빛 단추가 첫 화면에 든다. 4위부터는 판이 아니라 이름 · 지도자 · 선 수 · 점수만 담은 조용한 줄이다. 무게는 위계를 따른다: 판이 될수록 귀하고, 줄은 조용하다.

색은 금이 주인공이고 나머지는 따뜻한 검정과 양피지색 글자다. 빨강은 개표 방송에서 들여온 두 장치('내 커리어' 줄과 속보 자막)에만 쓰는 방송의 목소리이며, 사용자가 직접 고른 것이다. 흰 바탕 표에 숫자 줄을 세우는 리더보드 기본형은 이 세계가 거부한 형태다.

**Key Characteristics:**
- 무늬 없는 따뜻한 어둠: 위쪽 480px만 살짝 밝은 세로 그라데이션
- 명판은 금속 색 그라데이션 + 그림자 하나, 모서리 8px, 장식 없음
- 이름·점수·순위·제목은 Noto Serif KR 900, UI와 설명은 Pretendard
- 금·은·동은 재질 색으로 구분하고, 4위부터는 판 없이 줄
- 움직임은 두 가지뿐: 명판이 위에서 '걸리고', 새 기록 위로 빛이 한 번 쓸고 지나간다
- 모든 숫자는 tabular-nums

## Colors

따뜻한 검정 위의 금 한 가지가 세계를 지배하고, 은·동은 재질로만, 빨강은 방송 장치로만 등장한다.

### Primary
- **명판 금** (gold): 제목, 줄 점수, 선택된 난이도 알약 바탕, 선택된 보기 탭 글자와 밑줄, 포커스 테두리, 내 명판 외곽선, ::selection 바탕.
- **바랜 금** (gold-2): 4위 이하 순위 숫자, 선(line) 계열의 바탕색, 닮은 지도자 막대.
- **그늘진 금** (gold-3): 스크롤바 손잡이. 금속의 어두운 면.
- **황동 그라데이션** (brass-hi → brass-mid → brass-low): 행동 단추의 금속면 전용. 위가 밝고 아래가 어두운 180deg 그라데이션으로만 쓴다.

### Secondary
- **은판** (silver-plate, 글자 silver-ink): 2위 명판 전용.
- **동판** (bronze-plate, 글자 bronze-ink): 3위 명판 전용.

### Tertiary
- **방송 빨강** (broadcast-red): '내 커리어' 줄의 왼쪽 3px 선과 9% 틴트 띠.
- **방송 빨강 연** (broadcast-red-soft): '내 커리어' 줄의 큰 명조 순위 숫자.
- **방송 빨강 진** (broadcast-red-deep): 속보 자막의 '속보' 딱지 바탕.

### Neutral
- **전당 어둠** (wall): 페이지 바탕, theme-color, 스크롤바 트랙. **어둠 윗빛** (wall-glow): 바탕 그라데이션의 시작색. 0에서 480px까지 wall로 내려간다.
- **어둠 2/3** (wall-2, wall-3): 메달 바탕, 속보 멈춤 단추, 스켈레톤 그라데이션.
- **자막 바탕** (ticker-ground): 아래 고정 속보 자막.
- **세부 카드** (detail-hi → detail-lo): 1~3위 세부 수치 카드의 180deg 그라데이션.
- **양피지 글자** (ink / ink-2 / ink-3): 본문, 보조 글, 메타·각주 순으로 어두워진다. 선택 안 된 보기 탭은 ink-3.
- **새긴 글자** (engraved-ink, button-ink, selection-ink): 금속면·금 바탕 위 글자. 순수 검정 대신 갈색 검정.
- **금 선** (line, line-2): 테두리와 목록 구분선. 진한 선은 알약 트랙·빈 상태 테두리·명부 점선, 연한 선은 줄 사이와 탭 바닥선.
- **상태색**: live-green(연결됨 점), alarm-red(연결 끊김 점).
- **데이터색** (diff-easy · diff-normal · diff-hard · diff-hell · diff-all, exit-retired): 줄 안 난이도 딱지, 세부 수치 막대(좋음·보통·나쁨), 통계의 퇴임 막대에만 쓴다. 지도자 초상의 색은 게임 데이터에서 오며 메달 안에만 쓴다.

### Named Rules
**The 금 하나 Rule.** 어둠 위의 강조는 금 계열 하나다. 새 강조색을 만들지 말고 gold / gold-2 / gold-3 중에서 고른다. 선택 상태도 금이다.

**The 방송 빨강 Rule.** 빨강은 개표 방송에서 들여온 '내 커리어' 줄과 속보 자막에만 쓴다(사용자 요청). 명판, 탭, 단추에는 빨강을 쓰지 않는다.

**The 재질이 순위다 Rule.** 1·2·3위는 금·은·동 재질 색으로 구분한다. 순위를 나타내는 메달 아이콘이나 별도 색 딱지를 더하지 않는다(초상 메달은 지도자를 보여 주는 것이지 순위 표시가 아니다).

## Typography

**Display Font:** Noto Serif KR (Apple Myungjo, Batang, Georgia, serif 대체)
**Body Font:** Pretendard Variable (Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic 대체)

**Character:** 명조 900은 명판에 새긴 이름과 숫자, Pretendard는 벽에 붙은 안내문이다. 이름·점수·순위·제목은 명조, 설명·버튼·탭·메타는 고딕. 글자에는 그림자를 주지 않는다.

### Hierarchy
- **Display** (900, clamp(30px,8vw,44px), 1.15, 자간 .06em): '명예의 전당' 제목 하나, 금색, 가운데. 520px 이하에서 28px. 제목 위아래에 부제·트로피를 두지 않는다.
- **Headline** (900, clamp(34px,10vw,46px), 1): 1위 명판 점수. 520px 이하 38px, 은·동 판 23px, 기본 판 30px.
- **Title** (900, 22px, 1.2): 명판 닉네임. 1위 clamp(24px,6.6vw,32px), 은·동 17px.
- **Title-sm** (800, 15px): 통계 구역·세부 수치 제목, 금색 명조.
- **Numeral** (900, 18px): 줄 점수(금), 줄 순위 숫자는 17px 바랜 금. 판 가장자리의 큰 순위 숫자는 48px(은·동 38px), 반투명 갈색.
- **Body** (400, 12.5–13.5px, 1.5–1.65): 내 커리어 문장, 세부 설명, 통계 각주.
- **Body-strong** (700, 15.5px): 줄 닉네임. 단추 글자는 800, 14px(넓은 단추 15px).
- **Label** (700, 12.5–14px): 난이도 알약 13px, 보기 탭 14px(520px 이하 13.5px), 메타·각주 12.5px. 점수 뒤 '점' 단위는 0.45em Pretendard 700.

### Named Rules
**The 숫자 정렬 Rule.** 페이지 전체가 tabular-nums다. 점수 비교가 이 화면의 일이다.

## Layout

단일 컬럼, 최대 폭 720px, 좌우 16px(안전 영역 존중), 위 14px, 아래는 고정 속보 자막을 피하려고 96px. 넓은 화면에서도 두 열이나 사이드바로 바뀌지 않는다.

위에서부터: 상태 줄(LIVE 점 + 금빛 '게임 하러 가기'; 게임 안 ?embed=1에서는 '전체 순위' 조용한 링크가 '게임으로' 단추 옆에 붙는다), 제목, 난이도 알약 칸(최대 440px 가운데), 보기 탭 4개(가운데 정렬, 간격 18px, 아래 연한 금 바닥선), 그리고 판.

판의 위계: 1위 대형 판(폭 전체) → 은·동 2열(간격 10px) → '내 커리어' 줄 → 넓은 금빛 단추 → 4위부터 목록(줄 사이 연한 금 선). 권력 통계는 '권력 통계' 탭 안에서만 보이며, 카드 없이 제목과 내용만 있는 네 구역(기록 보관소 명부, 권력 방향 차트, 닮은 지도자, 어떻게 물러났나)이 28px 간격으로 쌓인다.

반응형: 520px 이하에서 제목을 28px로, 탭 간격을 14px로, 판 패딩과 위아래 여백을 줄여 1위와 내 자리가 첫 화면에 들어오게 한다.

## Elevation & Depth

바탕은 평평하다: 질감 없이 wall-glow에서 wall로 내려가는 세로 그라데이션뿐이다. 깊이는 명판에만 있고, 명판은 위쪽 1px 안쪽 빛과 아래로 퍼지는 그림자 하나로 벽에서 뜬다. 세부 수치 카드만 안쪽 1px 금 테두리와 흐린 그림자를 갖고, 통계 구역·목록·알약 칸은 그림자 없이 선으로만 나뉜다.

### Shadow Vocabulary
- **명판 걸림** (`box-shadow: inset 0 1px 0 rgba(255,250,228,.6), 0 14px 24px -14px rgba(0,0,0,.85)`): 금·은·동 명판 전용.
- **황동 단추** (`box-shadow: inset 0 1px 0 rgba(255,250,230,.7), inset 0 -1px 0 rgba(80,50,10,.45), 0 6px 14px -6px rgba(0,0,0,.7)`): 금빛 행동 단추.
- **세부 카드** (`box-shadow: inset 0 0 0 1px rgba(241,213,137,.45), 0 12px 22px -16px rgba(0,0,0,.8)`): 명판 아래 펼쳐지는 세부 수치.
- **자막 들림** (`box-shadow: 0 -8px 18px -10px rgba(0,0,0,.8)`): 아래 고정 속보 자막.

### Named Rules
**The 걸린 물건 Rule.** 큰 그림자는 '걸린' 명판에만 준다. 통계 구역·목록·알약 칸은 선 이상으로 띄우지 않는다.

**The 덜어낸 판 Rule.** 사용자 요청으로 걷어 낸 장식을 되살리지 않는다: 바탕이나 판 위의 노이즈 질감, 리벳, 판 안쪽 새김 테두리, 여러 겹 베벨 그림자, 글자 그림자, 트로피·부제·타이머 막대. 명판은 색 그라데이션 + 안쪽 빛 1px + 그림자 하나로 끝난다.

## Shapes

명판은 부드러운 8px 모서리, 세부 카드·빈 상태·내 줄 틴트·스켈레톤은 6px, 행동 단추·난이도 알약 트랙과 알약은 완전한 알약형(999px), 지도자 초상은 3px 반투명 크림 고리를 두른 원형 메달 안에 든다. 작은 칩(난이도 딱지, NEW)은 3px. 보기 탭은 모양이 없고 2px 밑줄만 갖는다.

## Components

### Buttons
금속을 두드려 만든 손잡이 같은 단추. 이 세계에서 황동 그라데이션이 남은 유일한 곳이다.
- **Shape:** 알약형 (999px)
- **Primary:** 황동 그라데이션(180deg, brass-hi → brass-mid 55% → brass-low) 위에 button-ink 800 14px, 패딩 10px 16px.
- **Wide:** 같은 재질, 폭 100%, 패딩 13px 16px, 15px. '다시 출마하기', '나도 출마하기' 같은 주 행동.
- **Hover / Active:** hover는 밝기 1.06, active는 1px 내려앉음. 포커스는 전역 2px 금 outline, offset 3px.
- **Quiet link:** 게임 안에서만 쓰는 '전체 순위'. ink-2 700 13px, 바깥 화살표 SVG, hover 시 금.

### 난이도 알약 칸
- **Style:** 한 줄로 이어진 알약 트랙(5칸, 최대 440px, 패딩 3px, 바탕 rgba(255,236,190,.05), 안쪽 1px 금 선). 칸은 바탕 없이 ink-2 700 13px, 최소 높이 34px.
- **Selected:** gold 바탕 알약 + button-ink 글자. hover는 글자만 ink로.
- **State:** aria-pressed.

### 보기 탭
- **Style:** 글자 탭, ink-3 700 14px, 최소 높이 40px, 간격 18px, 전체 아래 1px 연한 금 바닥선.
- **Selected:** gold 글자 + 2px gold 밑줄. hover는 ink.
- **State:** role=tab + aria-selected.

### 명판 (Signature)
- **Corner Style:** 8px.
- **Background:** 재질 그라데이션(158deg). 금(#f3dc9c → #d7b25c 34% → #a98030 68% → #d9b765), 은(#eef1f3 → silver-plate 38% → #8b949c 70% → #d0d6db), 동(#f0c69b → bronze-plate 38% → #90572a 70% → #d49966). 무늬 없음.
- **Shadow Strategy:** '명판 걸림' (Elevation 참고).
- **Content:** 초상 메달(1위 92px, 은·동 46px), 닉네임·점수, 메타 한 줄(1위 '몇 선 · 몇 년 · 닮은 지도자', 은·동 '몇 선 · 지도자'), 오른쪽 위 큰 반투명 순위 숫자. 내 명판은 2px 금 외곽선(offset 3px).
- **세부 수치 보기:** 판 아래 30px 띠, 위 1px 반투명 갈색 선, 바탕 없음, 700 12.5px + 펼침 화살표. 누르면 판 아래에 세부 카드가 펼쳐진다.
- **Internal Padding:** 기본 16px 18px, 1위 22px 20px 42px, 은·동 18px 14px 40px.

### 목록 줄
- **Style:** 판 없이 바탕에 직접. 30px 순위 칸(바랜 금 명조) | 닉네임 + '지도자 · 몇 선' | 오른쪽 금 명조 점수. 패딩 13px 4px, 아래 연한 금 선. 최장 집권·최근 기록 보기에서는 점수 아래 작은 보조 값(점수·시간) 한 줄.
- **Mine:** 금 10% 틴트, 6px. 외곽선 없음.

### 세부 수치 카드
- **Style:** detail-hi → detail-lo 그라데이션, 6px, 패딩 16px 16px 14px, '세부 카드' 그림자, 금 명조 15px 제목. 7px 막대 두 열, 명부(dt/dd, 점선 구분), 짧은 설명 문단.
- **Motion:** .38s cubic-bezier(.16,1,.3,1)로 8px 위에서 내려온다.

### 권력 통계 구역
- **Style:** 카드 없음. 금 명조 15px 제목 + 내용, 구역 사이 28px. 명부는 dt/dd 두 열(점선 구분), 가로 막대는 9px 트랙.

### 내 커리어 줄 (사용자 요청, 개표 방송에서 들여옴)
- **Style:** 방송 빨강 9% 틴트 띠, 왼쪽 3px 방송 빨강 선, 패딩 12px 14px. 왼쪽은 'b'로 강조한 한 문장 + 작은 보조 줄, 오른쪽은 26px 명조 900 순위(broadcast-red-soft).
- **Scope:** 리더보드의 '내 자리' 한 곳에만 쓰는 방송 장치다. 다른 카드·목록의 강조 방식으로 퍼뜨리지 않는다.

### 속보 자막 (사용자 요청, 개표 방송에서 들여옴)
- **Style:** 화면 아래 고정, 높이 36px + 안전 영역, ticker-ground 바탕, 위 1px 금 선과 '자막 들림' 그림자. 왼쪽 '속보' 딱지(broadcast-red-deep 바탕, 흰 800 12px, 자간 .12em), 가운데 흐르는 글(42s linear), 오른쪽 40px 멈춤 단추(wall-2 바탕, 금 아이콘).
- **Behavior:** hover·focus·멈춤 단추로 멈춘다. reduced-motion에서는 흐르지 않고 가로 스크롤 가능한 정지 글이 된다. 기록이 있을 때만 보인다.

### 상태 줄
- 8px 원형 점(live-green, 끊기면 alarm-red), 새 데이터를 받은 순간에만 한 번 깜빡인다. 옆에 금 'LIVE'와 ink-2 12px 상태 글. 갱신 막대는 없다.

## Do's and Don'ts

### Do:
- **Do** 새 화면도 무늬 없는 따뜻한 어둠(wall-glow → wall 세로 그라데이션) 위에 둔다.
- **Do** 이름·점수·순위·제목은 Noto Serif KR 900으로, 설명·탭·단추는 Pretendard로 쓴다.
- **Do** 1·2·3위는 금·은·동 명판 재질로, 4위부터는 판 없이 줄로 내린다. 줄에는 이름 · 지도자 · 선 수 · 점수만 둔다.
- **Do** 선택 상태는 금으로 표시한다: 난이도는 금 알약, 보기는 금 글자 + 2px 밑줄.
- **Do** 새 기록에는 빛이 한 번 쓸고 지나가는 sheen(1.5s, cubic-bezier(.4,0,.2,1))을, 목록을 다시 그릴 때는 위에서 걸리는 hang(.62s, cubic-bezier(.16,1,.3,1), 55ms 간격)을 쓰고, reduced-motion에서는 모두 끈다.
- **Do** 행동 단추는 황동 그라데이션 알약형 하나로 통일한다.

### Don't:
- **Don't** 흰 바탕 표에 숫자 줄을 세우는 리더보드 기본형으로 돌아가지 않는다.
- **Don't** 걷어 낸 장식(노이즈 질감, 리벳, 안쪽 새김 테두리, 여러 겹 베벨, 글자 그림자, 트로피, 부제, 갱신 타이머 막대)을 되살리지 않는다(사용자 요청).
- **Don't** 통계나 보조 정보를 카드 상자나 옆 사이드바에 담지 않는다. 통계는 '권력 통계' 탭 안의 맨 구역이다.
- **Don't** 방송 빨강을 '내 커리어' 줄과 속보 자막 밖으로 퍼뜨리지 않는다. 특히 왼쪽 굵은 색 선은 '내 커리어' 줄 한 곳의 방송 장치이며 다른 카드의 강조 방식이 아니다.
- **Don't** 통계 구역·목록·알약 칸에 명판 걸림 그림자를 주지 않는다.
- **Don't** 닉네임과 점수 밖의 개인정보(학교·이름·전화번호)를 어떤 장치에도 표시하지 않는다.
