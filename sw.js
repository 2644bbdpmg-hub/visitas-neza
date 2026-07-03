// Service Worker – Visitas Cuartel Neza
const CACHE = "visitas-neza-v1";
const ASSETS = [
  "/visitas-neza/",
  "/visitas-neza/index.html"
];

// Instalación: cachear assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches viejos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network first, cache fallback
self.addEventListener("fetch", e => {
  // Solo cachear assets propios (no Firebase)
  if(!e.request.url.includes("firebaseio.com") &&
     !e.request.url.includes("googleapis.com") &&
     !e.request.url.includes("openstreetmap") &&
     !e.request.url.includes("unpkg.com")) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
