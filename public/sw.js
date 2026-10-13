// 網路優先、離線才用快取。頁面網址一律用結尾斜線，避免快取到轉址回應。
const CACHE = 'busan-v3';
const URLS = [
  '/', '/prepare/', '/guide/', '/food/', '/day1/', '/day2/', '/day3/', '/map/', '/weather/', '/tickets/',
  '/expenses/', '/calendar/', '/planner/', '/import/', '/planb/', '/new/',
  '/js/trip-tools.js', '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(URLS.map(u => c.add(new Request(u, { cache: 'reload' }))))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        // 只快取一般成功回應；轉址與錯誤交給瀏覽器處理
        if (res.ok && !res.redirected && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      })
      .catch(async () => {
        const url = new URL(req.url);
        const withSlash = url.pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(url.pathname)
          ? req
          : new Request(url.pathname + '/');
        return (await caches.match(req)) || (await caches.match(withSlash)) || Response.error();
      })
  );
});
