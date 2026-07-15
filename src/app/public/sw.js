/* Service worker do ToninhoCar Estoque (PWA).
 * Objetivo: tornar o app instalável (Windows/Chrome/Edge exigem um SW com
 * handler de fetch) e dar um mínimo de offline para o "casco" do app.
 * Estratégia:
 *  - Navegações (HTML): network-first, com fallback para o index em cache.
 *  - Estáticos same-origin (JS/CSS/imagens/fontes): cache-first (stale-while-revalidate).
 *  - Requisições ao Supabase / outras origens: sempre rede (nunca cacheia dados).
 */

const CACHE = 'toninhocar-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const mesmaOrigem = url.origin === self.location.origin;

  // Navegação (abrir/atualizar a página): tenta a rede, cai pro cache offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put('/index.html', copia)).catch(() => undefined);
          return resp;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))),
    );
    return;
  }

  // Só cacheia estáticos da própria origem. Supabase e afins passam direto.
  if (!mesmaOrigem) return;

  event.respondWith(
    caches.match(req).then((cacheado) => {
      const rede = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => undefined);
          }
          return resp;
        })
        .catch(() => cacheado);
      return cacheado || rede;
    }),
  );
});
