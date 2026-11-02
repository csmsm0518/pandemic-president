/* ---------- 같은 판 장치(씨앗 있는 난수) ----------
   실시간 대결(lazy/battle)에서 한 방의 모두가 같은 사건 · 같은 주사위를 받게 한다(v5.0 전에는 오늘의 도전이 쓰던 장치).
   같은 선택을 하면 같은 결과가 나와야 비교가 공정하다. 그래서 대결 중에는 Math.random을 씨앗 있는 난수로 바꾸고,
   무작위로 결과를 정하는 자리마다(사건 고르기 · 판정 주사위 · 연말 · 선거 · 국난 …) '씨앗 + 지금 위치(임기 · 차례 · 선택 수 · 운명 개입 수)'로
   씨앗을 다시 맞춘다(dcSeed). 화면 효과도 Math.random을 쓰지만, 결과를 정하기 직전에 씨앗을 다시 맞추므로 결과에는 끼어들지 못한다.
   DC가 있으면 같은 판 모드다: {base:씨앗 글자, bt:{code:방 코드, rd:몇 번째 판}}. 대결 판은 한 임기로 끝나고(5년 단임) 저장 · 보관함 · 쿠폰 운명 개입을 쓰지 않으며
   기록 시트로 보내지 않는다. */
let DC=null;
// 홈의 「실시간 대결」 칸 작은 글(대결 조각 lazy/battle은 누르면 받는다)
const btSub=()=>'2~4명 · 대통령 대결 · 동계올림픽';
const DC_RAND0=Math.random;
const dcHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;};
let DC_S=0;
// mulberry32: 씨앗 하나로 0~1 난수를 차례로 낸다
function dcRand(){DC_S=(DC_S+0x6D2B79F5)>>>0;let t=DC_S;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
function dcSeed(tag){if(!DC)return;DC_S=dcHash(DC.base+'|'+tag+'|'+(CAR?CAR.term:0)+'|'+(S?S.turn:0)+'|'+(LOG?LOG.length:0)+'|'+(RUN?RUN.rr:0));}
// 판이 끝나면(결산 · 메인 화면으로) 원래 난수로 되돌린다
function dcEnd(){if(Math.random!==DC_RAND0)Math.random=DC_RAND0;DC=null;}
// 소리 · 배경음악 · 감염 지도 · 명언 고르기는 화면 꾸밈이다. 같은 판 모드에서도 이것들은 원래 난수를 쓰게 감싼다.
// 감싸지 않으면 소리를 켰는지, 앞 판에서 음악이 이미 골라졌는지에 따라 난수 줄이 밀려 같은 선택에도 시대 조건 · 결과가 달라졌다
const dcIso=f=>function(){if(!DC)return f.apply(this,arguments);const m=Math.random;Math.random=DC_RAND0;try{return f.apply(this,arguments);}finally{Math.random=m;}};
Object.keys(SFX).forEach(k=>{if(typeof SFX[k]==='function')SFX[k]=dcIso(SFX[k]);});
bgmCue=dcIso(bgmCue);bgmHold=dcIso(bgmHold);bgmInfo=dcIso(bgmInfo);bgmSkip=dcIso(bgmSkip);bgmSync=dcIso(bgmSync);bgmSet=dcIso(bgmSet);
bgmIntro=dcIso(bgmIntro);bgmGame=dcIso(bgmGame);bgmRamp=dcIso(bgmRamp);bgmLoad=dcIso(bgmLoad);
mapReset=dcIso(mapReset);mapUpdate=dcIso(mapUpdate);mapDraw=dcIso(mapDraw);mapLoop=dcIso(mapLoop);mapStart=dcIso(mapStart);
leaderQ=dcIso(leaderQ);quoteFx=dcIso(quoteFx);
