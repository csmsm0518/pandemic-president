/* ---------- 지도자 초상 ---------- */
// 신문 삽화풍 초상. 실제 얼굴을 닮게 그리지 않고, 시대와 신분은 옷차림·머리·소품으로만 드러낸다.
// c 옷, cc 옷 색, t 넥타이 색, h 머리, hc 머리 색, f 수염(+로 겹침), hw 모자, g 안경, w 넓은 얼굴, sk 피부
const PFS={
 '박정희':'c=mil,cc=#5b6146,h=side,a=sung','김대중':'c=suit,cc=#2b3a55,t=#a8321f,h=side,hc=#9a948a,w,a=smile','노무현':'c=shirt,cc=#e9e2d2,h=short,hw=straw,a=smile',
 '정주영':'c=work,cc=#6f7a6a,h=side,hc=#8d877c,w','안철수':'c=doctor,t=#3d5a80,h=side,g',
 '태조 이성계':'c=gon,cc=#2c5a7a,hw=ikseon,f=mus+full,hc=#6a645b','세종':'c=gon,hw=ikseon,f=mus+jbeard','세조':'c=gon,cc=#7d241a,hw=ikseon,f=full',
 '광해군':'c=gon,hw=ikseon,f=mus','정조':'c=gon,cc=#9a2d22,hw=ikseon,f=mus+goatee',
 '조지 워싱턴':'c=coat18,cc=#1f3a5f,h=wigw,w','에이브러햄 링컨':'c=bow,cc=#1d1b18,t=#1d1b18,h=messy,f=chin,hw=tophat','시어도어 루스벨트':'c=suit,cc=#4b3a26,t=#1d1b18,h=short,hc=#5a4632,f=bigmus,a=pn+grin,w',
 '프랭클린 루스벨트':'c=suit,cc=#2b3a55,t=#7a2e2a,h=side,hc=#7d776c,a=pn+holder','드와이트 아이젠하워':'c=mil,cc=#6b5e3c,h=bald,hc=#b8ad98,a=grin',
 '킨키나투스':'c=toga,cc=#8a7a5a,h=curly,hc=#8d877c,f=full,a=wheat','솔론':'c=robe,cc=#5d6b7a,h=bald,hc=#cfc8ba,f=long','아소카':'c=robe,cc=#c27a2c,sk=#b98a62,hw=turb,f=mus',
 '윈스턴 처칠':'c=bow,cc=#1d1b18,t=#2f4a6b,h=bald,hc=#c9a77a,w,a=cigar','페리클레스':'c=robe,cc=#2f4a6b,hw=helm,f=full,hc=#4a3b2e',
 '마르쿠스 아우렐리우스':'c=toga,cc=#4a3d7a,h=curly,hc=#5a4632,f=full','함무라비':'c=robe,cc=#7a5a2e,sk=#d4a77d,hw=hcap,f=long',
 '프리드리히 2세':'c=milcoat,cc=#22314a,h=wigw,hw=tricorn','오토 폰 비스마르크':'c=milcoat,cc=#3a3f45,hw=pickel,f=bigmus,hc=#8d877c,w',
 '술라':'c=toga,cc=#a8321f,h=short,hc=#8a6a3a','율리우스 카이사르':'c=toga,cc=#7a2e2a,h=bald,hw=laurel','아우구스투스':'c=toga,cc=#4a3d7a,h=short,hc=#6b5038',
 '나폴레옹':'c=milcoat,cc=#1f3a5f,col=#a8321f,h=fore,hw=bicorne','시몬 볼리바르':'c=milcoat,cc=#1d2a3f,col=#a8321f,h=curly,sk=#dcb48c,f=burns',
 '루이 14세':'c=royal,cc=#2f4a8a,h=wigl','표트르 대제':'c=milcoat,cc=#2e5a3a,h=long,f=mus','진시황':'c=robe,cc=#1d1b18,hw=myeon,f=mus+goatee',
 '루이 16세':'c=royal,cc=#2f4a8a,h=wigw,w',
 // 출발 인물 추가분
 '광개토대왕':'c=gap,cc=#7a2e2a,h=short,hw=crown,f=mus+full','선덕여왕':'c=hanfu,cc=#8a2e4a,h=bun,hc=#1d1b18,hw=crown','김춘추':'c=hanfu,cc=#2f4a6b,hw=gwan,f=mus+goatee',
 '장보고':'c=gap,cc=#2c5a7a,h=short,f=full,w','왕건':'c=hanfu,cc=#7a2e2a,hw=myeon,f=mus+full','서희':'c=dan,cc=#2f5f7a,hw=samo,f=mus+jbeard',
 '강감찬':'c=gap,cc=#5d6b7a,hw=iron,f=long,hc=#cfc8ba','안창호':'c=suit,cc=#2b3a55,t=#3d5a80,h=side,f=mus','이승만':'c=suit,cc=#3a3f45,t=#2f4a6b,h=side,hc=#cfc8ba',
 '단군왕검':'c=robe,cc=#e6dcc6,h=long,hc=#e6e0d4,f=long','정영우':'c=suit,cc=#2b3a55,t=#2f5f99,h=side,hc=#3a352e,g,a=smile',
 // 엔딩 지도자 추가분
 '니콜라이 2세':'c=milcoat,cc=#2e5a3a,h=side,hc=#6b5038,f=mus+full','찰스 1세':'c=ruff,cc=#3a3f45,h=long,hc=#4a3b2e,f=mus+goatee','로베스피에르':'c=coat18,cc=#2f5f7a,h=wigw',
 '페르디난드 마르코스':'c=shirt,cc=#e9e2d2,sk=#c99a72,h=side,hc=#1d1b18','니콜라에 차우셰스쿠':'c=suit,cc=#3a3f45,t=#7a2e2a,h=messy,hc=#6a645b','수하르토':'c=suit,cc=#2b3a55,t=#3a3f45,sk=#b98a62,h=side,hc=#1d1b18,a=smile',
 '허버트 후버':'c=suit,cc=#3a3f45,t=#2f4a6b,h=side,hc=#8d877c,w','지미 카터':'c=suit,cc=#2b3a55,t=#3d5a80,h=side,hc=#c9a77a,a=grin','조지 H. W. 부시':'c=suit,cc=#22314a,t=#a8321f,h=side,hc=#9a948a,g',
 '넬슨 만델라':'c=shirt,cc=#c28a2c,sk=#6e4a32,h=short,hc=#e6e0d4,a=smile','디오클레티아누스':'c=toga,cc=#7a2e2a,h=short,hc=#9a948a,f=full,hw=laurel','토머스 제퍼슨':'c=coat18,cc=#5a4632,h=wigw',
 '엘리자베스 1세':'c=ruff,cc=#2f4a8a,h=bun,hc=#b8541e,hw=crown','아크바르':'c=robe,cc=#c27a2c,sk=#b98a62,hw=turb,f=mus','리콴유':'c=shirt,cc=#f7f3ea,h=side,hc=#3a352e',
 '무스타파 케말 아타튀르크':'c=suit,cc=#1d1b18,t=#3a3f45,h=fore,hc=#c9a77a','바츨라프 하벨':'c=suit,cc=#4b3a26,t=#7a2e2a,h=messy,hc=#9a7a5a,f=mus','유스티니아누스 1세':'c=royal,cc=#4a3d7a,h=short,hw=crown',
 '측천무후':'c=hanfu,cc=#c28a2c,h=bun,hc=#1d1b18,hw=crown','당 태종':'c=hanfu,cc=#c28a2c,hw=myeon,f=mus+goatee','수 양제':'c=hanfu,cc=#7a2e2a,hw=myeon,f=mus','왕망':'c=hanfu,cc=#2f4a6b,hw=gwan,f=long',
 '공민왕':'c=gon,cc=#7d241a,hw=ikseon,f=mus+goatee','클레멘트 애틀리':'c=suit,cc=#3a3f45,t=#a8321f,h=bald,hc=#9a948a,f=mus,a=pn','샤를 드골':'c=mil,cc=#5b6146,h=short,hc=#3a352e',
 '호세 무히카':'c=work,cc=#6f7a6a,h=messy,hc=#cfc8ba,f=mus,w','예카테리나 2세':'c=dress19,cc=#5d6b7a,h=bun,hc=#cfc8ba,hw=crown','율리시스 S. 그랜트':'c=milcoat,cc=#1d2a3f,h=short,hc=#5a4632,f=full',
 '우드로 윌슨':'c=suit,cc=#3a3f45,t=#1d1b18,h=side,hc=#9a948a,g','올리버 크롬웰':'c=work,cc=#5d4a32,h=long,hc=#6b5038','앨프레드 대왕':'c=robe,cc=#2f4a6b,h=long,hc=#b8862e,f=full,hw=crown',
 '해리 트루먼':'c=suit,cc=#3a3f45,t=#2f4a6b,h=side,hc=#9a948a,g,a=grin',
 '보리스 옐친':'c=suit,cc=#3a3f45,t=#2f4a6b,h=side,hc=#e6e0d4,w','에드워드 8세':'c=suit,cc=#3a3f45,t=#7a2e2a,h=side,hc=#c9a77a','네빌 체임벌린':'c=suit,cc=#1d1b18,t=#3a3f45,h=side,hc=#8d877c,f=mus','미하일 고르바초프':'c=suit,cc=#3a3f45,t=#7a2e2a,h=bald,hc=#9a948a','마리아 테레지아':'c=dress19,cc=#c28a2c,h=bun,hc=#c9a77a,hw=crown',
 '태종':'c=gon,cc=#3a3f45,hw=ikseon,f=mus+full','연산군':'c=gon,cc=#4a3d7a,hw=ikseon,f=mus,a=grin','선조':'c=gon,hw=ikseon,f=mus+goatee',
 '영조':'c=gon,cc=#9a2d22,hw=ikseon,f=mus+jbeard,hc=#cfc8ba','흥선대원군':'c=dan,cc=#4b3a26,hw=samo,f=mus+goatee,hc=#9a948a','고종':'c=gon,cc=#c28a2c,hw=ikseon,f=mus+goatee',
 '홍길동':'c=durumagi,cc=#3a3f45,hw=jeonrip,a=grin',
 '존 F. 케네디':'c=suit,cc=#2b3a55,t=#3d5a80,h=messy,hc=#7a5a2e,a=smile','리처드 닉슨':'c=suit,cc=#3a3f45,t=#7a2e2a,h=side,hc=#3a2b20,w','로널드 레이건':'c=suit,cc=#4b3a26,t=#a8321f,h=fore,hc=#3a2b20,a=grin',
 '버락 오바마':'c=suit,cc=#22314a,t=#2f5f99,sk=#8a5a3c,h=short,hc=#1d1b18,a=smile','도널드 트럼프':'c=suit,cc=#1f3a5f,t=#b3261e,h=fore,hc=#e0c060,w','엉클 샘':'c=coat18,cc=#1f3a5f,h=side,hc=#f7f3ea,f=goatee,hw=tophat,a=grin',
 // 좀비 무대
 '소방 구조대장':'c=work,cc=#b8541e,h=short,w','응급의학과 교수':'c=doctor,t=#1f7a72,h=side,hc=#6a645b,g','편의점 점장':'c=shirt,cc=#2e7d55,h=messy,a=smile',
 '전교 학생회장':'c=suit,cc=#22314a,t=#a8321f,h=short','예비역 중사':'c=mil,cc=#5b6146,h=bald,a=grin','감염된 대통령':'c=suit,cc=#3a3f45,t=#7a2e2a,sk=#a9c49a,h=messy,hc=#3a3f45,a=grin'};
const PF_I='#1d1b18',PF_W='#f7f3ea',PF_G='#d9a441';
const pfLine=(d,w)=>'<path d="'+d+'" fill="none" stroke="'+PF_I+'" stroke-width="'+(w||1.2)+'" stroke-linecap="round"/>';
const pfFill=(d,f,w)=>'<path d="'+d+'" fill="'+f+'" stroke="'+PF_I+'" stroke-width="'+(w===undefined?1.2:w)+'" stroke-linejoin="round"/>';
const PF_BACK={
 long:hc=>pfFill('M19 26C15 40 17 52 21 57H43C47 52 49 40 45 26Z',hc),
 wigl:hc=>pfFill('M17 24C9 36 11 52 17 60C21 62 25 58 24 52C29 54 35 54 40 52C39 58 43 62 47 60C53 52 55 36 47 24Z','#3a2b20'),
 wigw:()=>pfFill('M30 40C29 46 30 50 32 52C34 50 35 46 34 40Z',PF_W)};
const PF_BODY={
 suit:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M27 46L32 56L37 46Z',PF_W,1)+pfFill('M31 48H33L34.6 57L32 60L29.4 57Z',o.t||'#7a2e2a',.8)+pfLine('M26.5 46.5L30 60M37.5 46.5L34 60',1),
 bow:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M27 46L32 56L37 46Z',PF_W,1)+pfFill('M27.5 48.5L32 50.5L36.5 48.5V53L32 51L27.5 53Z',o.t||PF_I,.8),
 mil:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M26 46L32 53L38 46Z','#d8cfb8',1)+pfLine('M12 54L22 50M52 54L42 50',1.6)+'<circle cx="32" cy="57" r="1.3" fill="'+PF_G+'"/><circle cx="32" cy="62" r="1.3" fill="'+PF_G+'"/>',
 milcoat:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M25 43H39V50H25Z',o.col||o.cc,1.1)+pfFill('M8 53Q14 48 20 51Q15 55 8 56Z',PF_G,.9)+pfFill('M56 53Q50 48 44 51Q49 55 56 56Z',PF_G,.9)+'<circle cx="32" cy="55" r="1.3" fill="'+PF_G+'"/><circle cx="32" cy="60" r="1.3" fill="'+PF_G+'"/>'+pfLine('M27 43.5L32 49L37 43.5',1),
 coat18:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M28.5 45C29 53 35 53 35.5 45L33.5 60H30.5Z',PF_W,1)+pfLine('M24 47L28 64M40 47L36 64',1),
 gon:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc||'#a8321f',1.4)+'<path d="M26 46L37 60M38 46L31 54" stroke="'+PF_W+'" stroke-width="2.6" fill="none"/>'+pfLine('M26 46L37 60M38 46L31 54',.6)+'<circle cx="32" cy="60" r="5.5" fill="'+PF_G+'" stroke="'+PF_I+'" stroke-width="1"/>'+pfLine('M29.5 60Q31 57.5 33 59.5T35 60',.9),
 toga:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z','#ece4d2',1.4)+'<path d="M15 53C25 49 35 53 43 64" stroke="'+o.cc+'" stroke-width="6" fill="none"/>'+pfLine('M15 53C25 49 35 53 43 64',.7),
 robe:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M27 46L32 55L37 46Z','#e6dcc6',1),
 shirt:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M26.5 46L32 52L37.5 46L36 50L32 55L28 50Z','#f3eee2',1)+pfLine('M32 55V64',.9)+'<circle cx="32" cy="58.5" r=".9" fill="'+PF_I+'"/><circle cx="32" cy="62" r=".9" fill="'+PF_I+'"/>',
 work:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M25 44L32 50L39 44L41 49L32 54L23 49Z',o.cc,1.1)+pfLine('M32 54V64',1.4)+pfFill('M38 56H46V60H38Z',o.cc,.9),
 doctor:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z','#f6f3ec',1.4)+pfFill('M26 46L32 58L38 46Z','#22314a',1)+pfFill('M28.5 46L32 53L35.5 46Z',PF_W,.9)+pfFill('M31.2 48H32.8L34 55L32 57.5L30 55Z',o.t,.7)+pfLine('M24 47L29 64M40 47L35 64',1)+pfFill('M40 55H46V58H40Z','#f6f3ec',.8),
 royal:(o)=>pfFill('M7 64C9 52 19 46 32 46S55 52 57 64Z',o.cc,1.4)+pfFill('M9 56C17 45 47 45 55 56L50 60C42 52 22 52 14 60Z',PF_W,1)+'<g fill="'+PF_I+'"><rect x="15" y="54" width="1.4" height="2.4"/><rect x="22" y="50" width="1.4" height="2.4"/><rect x="41" y="50" width="1.4" height="2.4"/><rect x="48" y="54" width="1.4" height="2.4"/></g>'+pfFill('M28.5 46C29 51 35 51 35.5 46L33.5 54H30.5Z',PF_W,.9)};
const PF_HAIR={
 side:hc=>pfFill('M20.5 29C19 17 26 14 33 14C40 14 45.5 18 43.5 29C42 23 37 20.5 29 21.5C26 22.5 23 25 20.5 29Z',hc),
 short:hc=>pfFill('M20.5 28C20 18 26 15 32 15S44 18 43.5 28C40 22 24 22 20.5 28Z',hc),
 messy:hc=>pfFill('M20 29C18 18 24 13 32 14C40 13 46 18 44 29C42 24 40 22 37 23L35 19L31 22L27 19.5L25 24C23 25 21 27 20 29Z',hc),
 bald:hc=>pfFill('M20.6 33C20 27 21 24.5 23 23.5L23.5 33ZM43.4 33C44 27 43 24.5 41 23.5L40.5 33Z',hc,.9),
 curly:hc=>[[21,26],[23,21],[27,17.5],[32,16.5],[37,17.5],[41,21],[43,26]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" fill="'+hc+'" stroke="'+PF_I+'" stroke-width="1"/>').join(''),
 long:hc=>pfFill('M20.5 30C19 17 26 14 32 14S45 17 43.5 30C41 22 36 20 32 21S23 22 20.5 30Z',hc),
 wigl:()=>[[20,22],[25,16.5],[32,15],[39,16.5],[44,22],[19,29],[45,29]].map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4.6" fill="#3a2b20" stroke="'+PF_I+'" stroke-width="1"/>').join(''),
 fore:hc=>pfFill('M20.5 28C20 18 26 15 32 15S44 18 43.5 28C41 23 37 21.5 33 22L31 26.5L29 22.5C25 23 22 25 20.5 28Z',hc),
 wigw:()=>pfFill('M20.5 28C20 17 26 15 32 15S44 17 43.5 28C40 21 24 21 20.5 28Z',PF_W)+[[19.5,29],[19.5,34.5],[44.5,29],[44.5,34.5]].map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="3.4" ry="2.4" fill="'+PF_W+'" stroke="'+PF_I+'" stroke-width="1"/>').join('')};
const PF_FACE={
 mus:hc=>pfFill('M27.5 36.6Q32 34.6 36.5 36.6Q32 37.9 27.5 36.6Z',hc,.8),
 bigmus:hc=>pfFill('M23.5 35.5Q28 33 32 35.4Q36 33 40.5 35.5Q36 38.2 32 36.8Q28 38.2 23.5 35.5Z',hc,.8),
 goatee:hc=>pfFill('M30 40Q32 46 34 40Z',hc,.8),
 jbeard:hc=>pfFill('M30.2 40Q32 53 33.8 40Z',hc,.8),
 chin:hc=>pfFill('M20.8 31Q21.5 46.5 32 47.5Q42.5 46.5 43.2 31Q41.5 41.5 32 41.5Q22.5 41.5 20.8 31Z',hc),
 full:hc=>pfFill('M20.8 30Q19.5 47 32 50.5Q44.5 47 43.2 30Q42 39.5 36 38.6Q32 40.8 28 38.6Q22 39.5 20.8 30Z',hc)+pfFill('M27 36.4Q32 34.4 37 36.4Q32 38 27 36.4Z',hc,.8),
 burns:hc=>pfFill('M20.8 24V37Q23 39 24 35V24Z',hc,.8)+pfFill('M43.2 24V37Q41 39 40 35V24Z',hc,.8),
 long:hc=>pfFill('M20.8 30Q19 50 32 59Q45 50 43.2 30Q42 39.5 36 38.6Q32 40.8 28 38.6Q22 39.5 20.8 30Z',hc)+pfFill('M27 36.4Q32 34.4 37 36.4Q32 38 27 36.4Z',hc,.8)};
const PF_ACC={
 sung:()=>'<path d="M23.5 28.2H30.5L30 32.6Q27 34 24 32.6ZM33.5 28.2H40.5L40 32.6Q37 34 34 32.6Z" fill="'+PF_I+'"/>'+pfLine('M30.5 29H33.5M21.5 28.5H23.5M40.5 28.5H42.5',1),
 smile:()=>'<path d="M28.6 37.8Q32 41.6 35.4 37.8" fill="none" stroke="'+PF_I+'" stroke-width="1.3" stroke-linecap="round"/>'+pfLine('M25.5 33.8Q26 35.2 27.2 35.4M38.5 33.8Q38 35.2 36.8 35.4',.8),
 grin:()=>pfFill('M27.4 37.6Q32 43.6 36.6 37.6Z',PF_W,1.1)+pfLine('M29.6 38.2V40M32 38.2V41M34.4 38.2V40',.6),
 pn:()=>'<ellipse cx="27.6" cy="30.4" rx="3" ry="2.6" fill="none" stroke="'+PF_I+'" stroke-width="1.1"/><ellipse cx="36.4" cy="30.4" rx="3" ry="2.6" fill="none" stroke="'+PF_I+'" stroke-width="1.1"/>'+pfLine('M30.6 30H33.4M24.6 30.8Q22 36 23.5 44',.8),
 holder:()=>'<path d="M35 38.8L48.5 32.5" stroke="'+PF_I+'" stroke-width="1.6" stroke-linecap="round"/><path d="M48.5 32.5L52 30.8" stroke="#f3eee2" stroke-width="2.2" stroke-linecap="round"/><path d="M53 29Q55 25 53 22Q55 19 54 16" fill="none" stroke="#8a847a" stroke-width=".9" stroke-opacity=".7"/>',
 cigar:()=>'<path d="M34 38.6L45 40.6" stroke="#6b4a2a" stroke-width="3.4" stroke-linecap="round"/><path d="M44.4 40.5L46 40.8" stroke="#b3261e" stroke-width="3.4"/><path d="M47 38Q49 34 47 31Q49 28 48 25" fill="none" stroke="#8a847a" stroke-width=".9" stroke-opacity=".7"/>',
 wheat:()=>pfLine('M51 64L56 38',1.2)+[[55.5,41],[54.8,44.5],[54.1,48],[53.4,51.5]].map(p=>'<ellipse cx="'+(p[0]-2)+'" cy="'+p[1]+'" rx="2.2" ry="1.1" transform="rotate(-40 '+(p[0]-2)+' '+p[1]+')" fill="#d9a441" stroke="'+PF_I+'" stroke-width=".5"/><ellipse cx="'+(p[0]+2)+'" cy="'+p[1]+'" rx="2.2" ry="1.1" transform="rotate(40 '+(p[0]+2)+' '+p[1]+')" fill="#d9a441" stroke="'+PF_I+'" stroke-width=".5"/>').join('')};
const PF_HAT={
 tophat:()=>pfFill('M22 20.5V1.5H42V20.5Z',PF_I)+'<path d="M22 16H42" stroke="#4a443b" stroke-width="2"/>'+pfFill('M16 22.5Q32 18.5 48 22.5Q32 21 16 22.5Z',PF_I),
 tricorn:()=>pfFill('M10 23Q14 11 32 8Q50 11 54 23Q43 17 32 18Q21 17 10 23Z',PF_I)+'<path d="M14 21Q32 12.5 50 21" stroke="'+PF_G+'" stroke-width=".9" fill="none"/>',
 straw:()=>pfFill('M20.5 22Q20 9.5 32 9.5T43.5 22Z','#d9bf7a')+'<path d="M20.7 19.5Q32 16 43.3 19.5" stroke="#7a2e2a" stroke-width="2.4" fill="none"/>'+pfFill('M5 24Q32 15 59 24Q32 30 5 24Z','#d9bf7a')+pfLine('M12 23.5Q32 19 52 23.5',.5),
 ikseon:()=>'<path d="M23 15.5Q20.5 6.5 27.5 9.5L28.5 15ZM41 15.5Q43.5 6.5 36.5 9.5L35.5 15Z" fill="#3a352e" stroke="'+PF_I+'" stroke-width="1"/>'+pfFill('M19.5 25.5C19.5 12.5 44.5 12.5 44.5 25.5Z',PF_I)+'<path d="M20 25H44" stroke="#4a443b" stroke-width="2"/><path d="M26 15.5Q32 12.5 38 15.5" stroke="#4a443b" stroke-width="1" fill="none"/>',
 laurel:()=>[[20.5,27,-70],[21.5,22,-55],[24,18,-38],[27.5,15.5,-20],[36.5,15.5,20],[40,18,38],[42.5,22,55],[43.5,27,70]].map(p=>'<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="3.6" ry="1.7" transform="rotate('+p[2]+' '+p[0]+' '+p[1]+')" fill="#5d7a3e" stroke="'+PF_I+'" stroke-width=".7"/>').join(''),
 crown:()=>pfFill('M21 20L23 10.5L27.5 15.5L32 8.5L36.5 15.5L41 10.5L43 20Z',PF_G),
 bicorne:()=>pfFill('M6 22Q32 0 58 22Q32 15.5 6 22Z',PF_I)+'<circle cx="32" cy="12.5" r="2.2" fill="#b3261e" stroke="'+PF_W+'" stroke-width=".8"/>',
 pickel:()=>pfFill('M19.5 25C19.5 12 44.5 12 44.5 25Z',PF_I)+'<path d="M32 13V3.5" stroke="'+PF_G+'" stroke-width="2.2" stroke-linecap="round"/>'+'<path d="M17 25H47" stroke="'+PF_I+'" stroke-width="2.2"/>',
 myeon:()=>pfFill('M21.5 22C21.5 14 42.5 14 42.5 22Z',PF_I)+pfFill('M12 9.5H52V13.5H12Z',PF_I,.8)+[16,20,24,40,44,48].map(x=>'<path d="M'+x+' 13.5V22" stroke="'+PF_I+'" stroke-width=".7"/><circle cx="'+x+'" cy="'+(17+(x%8)/2)+'" r="1.1" fill="'+PF_G+'"/>').join(''),
 helm:()=>pfFill('M18.5 34C17 13 47 13 45.5 34H41.5V27.5H22.5V34Z','#a7783c')+pfFill('M30.5 27.5H33.5V36.5H30.5Z','#a7783c',.9)+pfFill('M18 13Q32 -3 46 13Q32 7 18 13Z','#a8321f'),
 turb:()=>pfFill('M19.5 22.5C18.5 11 45.5 11 44.5 22.5Z',PF_G)+pfLine('M20 18Q32 13 44 18',.9)+'<circle cx="32" cy="15.5" r="2.6" fill="#a8321f" stroke="'+PF_I+'" stroke-width=".8"/>',
 hcap:()=>pfFill('M20.5 23V11Q32 4.5 43.5 11V23Z','#5d4b3a')+pfLine('M20.5 16Q32 11 43.5 16',.9)};
// bust: 둥근 배경 없이 어깨까지 잘린 큰 초상(캐릭터 고르기 화면용)
function portrait(name,px,ring,bust){const s=PFS[name];if(!s)return '';const o={};s.split(',').forEach(kv=>{const i=kv.indexOf('=');o[i<0?kv:kv.slice(0,i)]=i<0?1:kv.slice(i+1);});
  const hc=o.hc||'#2b2420',sk=o.sk||'#ecd3b4',rx=o.w?12.6:11;let g='';
  if(!bust)g+='<circle cx="32" cy="32" r="32" fill="#e3d9c6"/><circle cx="32" cy="32" r="32" fill="url(#pfht)"/>';
  if(PF_BACK[o.h])g+=PF_BACK[o.h](hc);
  g+=(PF_BODY[o.c]||PF_BODY.suit)(o);
  g+=pfFill('M28 39.5V47.5H36V39.5Z',sk,1.1);
  g+='<ellipse cx="'+(32-rx)+'" cy="31" rx="2.2" ry="3.2" fill="'+sk+'" stroke="'+PF_I+'" stroke-width="1.1"/><ellipse cx="'+(32+rx)+'" cy="31" rx="2.2" ry="3.2" fill="'+sk+'" stroke="'+PF_I+'" stroke-width="1.1"/>';
  g+='<ellipse cx="32" cy="30" rx="'+rx+'" ry="13" fill="'+sk+'" stroke="'+PF_I+'" stroke-width="1.4"/>';
  g+='<circle cx="27.6" cy="30.2" r="1.15" fill="'+PF_I+'"/><circle cx="36.4" cy="30.2" r="1.15" fill="'+PF_I+'"/>'+pfLine('M25.2 27H29.6M34.4 27H38.8',1.1)+pfLine('M32.3 31.2V34.8H30.8',1);
  const acc=String(o.a||'').split('+');
  if(acc.indexOf('smile')<0&&acc.indexOf('grin')<0)g+=pfLine('M29.3 38.6Q32 39.8 34.7 38.6',1.1);
  if(o.h&&PF_HAIR[o.h]&&!(o.hw==='ikseon'||o.hw==='helm'||o.hw==='pickel'||o.hw==='turb'||o.hw==='hcap'||o.hw==='myeon'))g+=PF_HAIR[o.h](hc);
  if(o.f)String(o.f).split('+').forEach(k=>{if(PF_FACE[k])g+=PF_FACE[k](hc);});
  if(o.g)g+='<circle cx="27.6" cy="30.4" r="3.3" fill="none" stroke="'+PF_I+'" stroke-width="1.1"/><circle cx="36.4" cy="30.4" r="3.3" fill="none" stroke="'+PF_I+'" stroke-width="1.1"/>'+pfLine('M30.9 30.4H33.1',1.1);
  acc.forEach(k=>{if(PF_ACC[k])g+=PF_ACC[k]();});
  if(o.hw&&PF_HAT[o.hw])g+=PF_HAT[o.hw]();
  if(bust)return '<svg class="pf pfb" viewBox="-4 -8 72 72" width="'+px+'" height="'+px+'" aria-hidden="true">'+g+'</svg>';
  return '<svg class="pf" viewBox="0 0 64 64" width="'+px+'" height="'+px+'" aria-hidden="true" style="'+(ring?'box-shadow:0 0 0 2px '+ring+';':'')+'"><g clip-path="url(#pfclip)">'+g+'</g><circle cx="32" cy="32" r="31.4" fill="none" stroke="'+PF_I+'" stroke-opacity=".35" stroke-width="1.2"/></svg>';}
document.body.insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><clipPath id="pfclip"><circle cx="32" cy="32" r="32"/></clipPath><pattern id="pfht" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="1.6" cy="1.6" r=".55" fill="#1d1b18" fill-opacity=".16"/></pattern></defs></svg>');
// 참모 초상용 부품: 조선 관복(사모·단령), 갑옷, 옛 중국 관, 여성 머리 등
const PF_BD='M7 64C9 52 19 46 32 46S55 52 57 64Z';
Object.assign(PF_BODY,{
 dan:(o)=>pfFill(PF_BD,o.cc||'#2f5f7a',1.4)+pfFill('M25 46.5Q32 55 39 46.5L37 46Q32 51.5 27 46Z','#f3eee2',1)+pfFill('M26.5 54.5H37.5V63H26.5Z','#d9a441',1)+pfLine('M29 60Q32 56 35 60',.8),
 hanfu:(o)=>pfFill(PF_BD,o.cc,1.4)+'<path d="M26 46L36.5 59M38 46L31.5 53.5" stroke="#f3eee2" stroke-width="2.6" fill="none"/>'+pfLine('M26 46L36.5 59M38 46L31.5 53.5',.6)+pfLine('M14 60H50',1.6),
 gap:(o)=>pfFill(PF_BD,o.cc,1.4)+'<path d="M12 54.5H52M9.5 59.5H54.5" stroke="'+PF_G+'" stroke-width="1.8" stroke-dasharray="2.2 1.8" fill="none"/>'+pfFill('M25 44H39V49H25Z','#3a352e',1),
 ruff:(o)=>pfFill(PF_BD,o.cc,1.4)+'<ellipse cx="32" cy="46.5" rx="11" ry="3.8" fill="'+PF_W+'" stroke="'+PF_I+'" stroke-width="1"/>'+pfLine('M24 46.5L25 49M28 45.5L28.5 49.8M32 45.2V50M36 45.5L35.5 49.8M40 46.5L39 49',.6),
 jeogori:(o)=>pfFill(PF_BD,o.cc,1.4)+pfFill('M26 46L33 56L38 46L35 46L32 51L29 46Z','#f6f3ec',.9)+'<path d="M33 54L39 63M33 54L36 63" stroke="#a8321f" stroke-width="2" fill="none"/>',
 dress19:(o)=>pfFill(PF_BD,o.cc,1.4)+pfFill('M28 44H36V48H28Z','#f6f3ec',.9)+'<circle cx="32" cy="51" r="1.8" fill="'+PF_G+'" stroke="'+PF_I+'" stroke-width=".7"/>',
 blouse:(o)=>pfFill(PF_BD,o.cc,1.4)+pfFill('M27 46Q32 52 37 46Z','#f6f3ec',1)+pfLine('M26.5 46.5L30.5 60M37.5 46.5L33.5 60',1),
 durumagi:(o)=>pfFill(PF_BD,'#e6e1d6',1.4)+pfLine('M26 46L36 60M38 46L32 53',1.1)+pfLine('M34 55L38 61M34 55L35.5 62',1.1),
 shawl:(o)=>pfFill(PF_BD,'#efe9dc',1.4)+pfLine('M14 52Q30 58 46 64M18 50Q30 54 40 64',.9),
 cleric:(o)=>pfFill(PF_BD,o.cc,1.4)+pfFill('M28 44.5H36V48.5H28Z',o.cc,1)+pfFill('M30.6 45H33.4V48H30.6Z',PF_W,.6)+'<path d="M32 51V60M28.5 54H35.5" stroke="'+PF_G+'" stroke-width="1.6"/>'});
Object.assign(PF_BACK,{bun:hc=>'<circle cx="32" cy="14" r="5.4" fill="'+hc+'" stroke="'+PF_I+'" stroke-width="1.1"/>',
 bob:hc=>pfFill('M18.5 25C16.5 36 17.5 43 21.5 45.5H42.5C46.5 43 47.5 36 45.5 25Z',hc)});
Object.assign(PF_HAIR,{bun:hc=>pfFill('M20.5 29C20 18 26 15 32 15S44 18 43.5 29C41 22 36 20 32 21C28 20 23 22 20.5 29Z',hc)+pfLine('M32 15.5V20.5',.7),
 jbun:hc=>pfFill('M20.5 29C20 18 26 15 32 15S44 18 43.5 29C41 22 36 20 32 21C28 20 23 22 20.5 29Z',hc)+pfLine('M32 15.5V20.5',.7)+'<path d="M38 36L47 33" stroke="'+PF_G+'" stroke-width="1.6" stroke-linecap="round"/>',
 bob:hc=>pfFill('M20.5 28C20 17 26 14.5 32 14.5S44 17 43.5 28C40 24 35 22 28 23C25 24 22 26 20.5 28Z',hc),
 none:()=>''});
Object.assign(PF_HAT,{
 samo:()=>'<ellipse cx="13.5" cy="17.5" rx="7" ry="2.5" fill="'+PF_I+'"/><ellipse cx="50.5" cy="17.5" rx="7" ry="2.5" fill="'+PF_I+'"/>'+pfFill('M25 17C25 8.5 39 8.5 39 17Z',PF_I)+pfFill('M20.5 25C20.5 13.5 43.5 13.5 43.5 25Z',PF_I)+'<path d="M21 24.5H43" stroke="#4a443b" stroke-width="1.8"/>',
 gwan:()=>pfFill('M27.5 16.5V8.5H36.5V16.5Z',PF_I)+'<path d="M22 12.5H42" stroke="'+PF_G+'" stroke-width="1.4" stroke-linecap="round"/>',
 jeonrip:()=>pfFill('M21.5 21Q21 9 32 9T42.5 21Z',PF_I)+pfFill('M7 23Q32 14.5 57 23Q32 27.5 7 23Z',PF_I)+'<path d="M32 9.5L36 4.5" stroke="#a8321f" stroke-width="2.6" stroke-linecap="round"/>',
 iron:()=>pfFill('M19.5 26C19.5 11 44.5 11 44.5 26Z','#6b7078')+pfLine('M32 11.5V26',.8)+'<path d="M32 11.5Q35 5 40 4" stroke="#a8321f" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
 zucch:()=>pfFill('M23.5 17.5Q32 10 40.5 17.5Q32 15.5 23.5 17.5Z','#a8321f'),
 nurse:()=>pfFill('M21.5 19Q32 9.5 42.5 19L40.5 22H23.5Z','#f6f3ec')});
PF_ACC.fan=()=>'<path d="M47 63L50 46" stroke="#6b4a2a" stroke-width="1.6"/>'+pfFill('M50 46C42 42 42 30 48 26C52 30 58 30 60 34C60 40 56 46 50 46Z','#f3eee2',1)+pfLine('M50 46L49 29M50 46L54 30M50 46L58 35',.6);

