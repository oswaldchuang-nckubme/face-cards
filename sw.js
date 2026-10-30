/* 識面名片 Service Worker
 * 每次更新程式後，把 VERSION 改掉，手機上就會收到「有新版本」提示。 */
const VERSION = 'v1.0.0';
const SHELL_CACHE = 'face-cards-shell-' + VERSION;
const CDN_CACHE   = 'face-cards-cdn-v1';   // 模型很大，版本不變時沿用，不必重下

const FACEAPI = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png',
];
const MODELS = ['tiny_face_detector_model', 'ssd_mobilenetv1_model', 'face_landmark_68_model', 'face_recognition_model']
  .flatMap(m => [FACEAPI + 'model/' + m + '.json', FACEAPI + 'model/' + m + '.bin']);
const CDN_ASSETS = [FACEAPI + 'dist/face-api.js', ...MODELS];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL);
    // 預先下載模型以便離線使用；個別失敗不影響安裝，之後使用時會再補抓
    const cdn = await caches.open(CDN_CACHE);
    await Promise.all(CDN_ASSETS.map(async url => {
      if (await cdn.match(url)) return;
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (res.ok) await cdn.put(url, res);
      } catch (e) {}
    }));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = [SHELL_CACHE, CDN_CACHE, 'face-cards-fonts'];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 頁面：先走網路拿最新版，離線時用快取
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(SHELL_CACHE);
        c.put('./index.html', res.clone());
        return res;
      } catch (e) {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  // 辨識程式庫與模型：快取優先
  if (url.hostname === 'cdn.jsdelivr.net') {
    event.respondWith(cacheFirst(req, CDN_CACHE));
    return;
  }

  // 字型：先回快取，背景更新
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, 'face-cards-fonts'));
    return;
  }

  // 同網域的其他檔案（圖示、manifest）
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
  }
});

async function cacheFirst(req, cacheName) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') (await caches.open(cacheName)).put(req, res.clone());
  return res;
}
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}
