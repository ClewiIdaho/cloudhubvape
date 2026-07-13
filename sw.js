/* ==========================================================
   CLOUD HUB — service worker
   Cache-first PWA so the demo runs fully offline after the
   first load. Bump CACHE version to invalidate old caches
   when assets change.
   ========================================================== */

const CACHE = "cloudhub-v4";

const PRECACHE = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/products.js",
  "./js/app.js",
  "./manifest.json",
  "./assets/icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/og.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* Navigations always get the cached shell so reloads work offline */
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then((hit) => hit || fetch(req))
    );
    return;
  }

  /* Same-origin assets: cache-first, backfill cache from network */
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
      )
    );
    return;
  }

  /* Google Fonts (CSS + woff2): cache-first once fetched, so type
     survives offline. Anything else cross-origin (e.g. the Maps
     iframe) is left to the browser — the page has its own fallback. */
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
  }
});
