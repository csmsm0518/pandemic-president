/* ---------- 쿠폰 표 ----------
   손으로 고치지 말고 tools/coupon.py 로 고친다(python tools/coupon.py --help). 고친 뒤 python build.py.
   쿠폰 번호는 적지 않고 지문만 적는다: 번호를 다듬은 것(cpnNorm: 대문자, 띄어쓰기 · - _ . · 뺌)의 PBKDF2-SHA256 앞 16바이트.
   그래서 이 파일을 열어 봐도 번호는 보이지 않는다. 다만 짧은 번호는 하나씩 넣어 보면 찾을 수 있으니 8자 이상으로 만든다.
   h 지문 · r 보상(종류:대상, 여러 개는 +로 잇는다) · u 마지막 날(한국 시간, 그날까지 쓸 수 있다. 없으면 기한 없음) · l 받을 때 보이는 이름 */
const CPN=[
// @coupons-begin (tools/coupon.py가 이 사이를 고친다)
// @coupons-end
];
