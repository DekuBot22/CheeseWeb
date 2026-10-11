// Service worker del Cuaderno. Mínimo y SEGURO para datos financieros:
//  - NUNCA guarda en caché /api/*, HTML, peticiones RSC ni nada que no sea GET.
//  - Solo cachea los archivos versionados de /_next/static/, los íconos y /offline.html.
//  - Sin internet: una navegación a /admin muestra /offline.html. No hay cola de envíos
//    a propósito (evita abonos duplicados).
// Cambia VERSION si cambian los íconos u offline.html.
const VERSION = "cuaderno-v1";
const STATIC = `static-${VERSION}`;
const SHELL = `shell-${VERSION}`;
const SHELL_URLS = ["/offline.html", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // HTML: siempre a la red, jamás a la caché. Solo si no hay red, la página sin conexión.
  if (request.mode === "navigate") {
    if (url.pathname.startsWith("/admin")) {
      event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    }
    return;
  }

  // Archivos estáticos versionados: caché primero.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        if (response.ok && response.type === "basic") cache.put(request, response.clone());
        return response;
      })
    );
  }
});
