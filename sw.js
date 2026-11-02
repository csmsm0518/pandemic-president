// 팬데믹 대통령 서비스 워커: 홈 화면에 설치(웹앱)할 수 있게 하고, 인터넷이 끊겼을 때 마지막으로 받은 화면을 보여 준다.
// 항상 네트워크가 먼저다. 그래서 새 버전을 올리면 다음 접속에 바로 바뀐다(캐시에 갇히지 않는다).
// 같은 사이트의 파일만 다루고, 배경음악(audio/)은 크고 구간 요청이라 건드리지 않는다. 기록 서버 · 대결 서버(다른 주소)도 건드리지 않는다.
const CACHE = 'pp-offline-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/audio/') || r.headers.has('range')) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      // ?v=지문 이 붙은 파일은 같은 파일의 옛 지문을 지우고 새것만 남긴다
      caches.open(CACHE).then(c => c.keys().then(ks => Promise.all(ks.filter(k => { const o = new URL(k.url); return o.pathname === u.pathname && o.search !== u.search; }).map(k => c.delete(k))))
        .then(() => c.put(r, copy))).catch(() => {});
    }
    return res;
  }).catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('./') : undefined)).then(m => m || Response.error())));
});
