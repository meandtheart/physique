// Caches the whole app so it opens with no internet. Bump CACHE when you change any file.
const CACHE = "vtaper30-v2";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "barlow-latin-400-normal.woff2", "barlow-latin-500-normal.woff2", "barlow-latin-600-normal.woff2",
  "barlow-condensed-latin-600-normal.woff2", "barlow-condensed-latin-700-normal.woff2", "barlow-condensed-latin-800-normal.woff2",
  "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => {
    const net = fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return net.then(res => res || caches.match("index.html"));
  }));
});
