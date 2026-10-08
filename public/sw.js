/* Service worker de Coillector.
 * - Precachea /offline (con sus CSS/JS) e íconos.
 * - Navegación: red primero; sin red → /offline.
 * - Estáticos de Next (/_next/static, inmutables): cache primero.
 * - NUNCA intercepta otros orígenes (Supabase) ni peticiones que no sean GET:
 *   los datos siempre llegan frescos.
 */
const VERSION = "coillector-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const OFFLINE_URL = "/offline";
const PRECACHE = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/apple-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      await shell.addAll(PRECACHE).catch(() => undefined);
      const res = await fetch(OFFLINE_URL, { cache: "reload" });
      if (res.ok) {
        const html = await res.clone().text();
        await shell.put(OFFLINE_URL, res);
        const assets = Array.from(new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || []));
        const statics = await caches.open(STATIC_CACHE);
        await Promise.all(assets.map((a) => statics.add(a).catch(() => undefined)));
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/auth/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) {
          const cache = await caches.open(STATIC_CACHE);
          cache.put(request, res.clone());
        }
        return res;
      })(),
    );
  }
});
