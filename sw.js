/* Critical Care Physiology — offline support.
 * App shell + 3D models are cached on install; narration, clips and images are cached the first time they are used
 * (or all at once from "Save for offline"). Media range requests are answered from the cached file.
 * The version string is replaced at build time; a new version replaces the old caches. */
const VERSION = '864d3ae348f4';
const SHELL = `cc-shell-${VERSION}`, MEDIA = 'cc-media-v1';
const CORE = ['./', 'index.html', 'audio/index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'imaging/real/manifest.json',
  'models/body.glb.txt', 'models/body.mapping.json', 'models/resp.glb.txt', 'models/resp.mapping.json',
  'models/micro.glb.txt', 'models/micro.mapping.json', 'models/lines.glb.txt', 'models/lines.mapping.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => undefined)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('cc-shell-') && k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const isMedia = (u) => /\/(vo|imaging|models)\//.test(u.pathname) || /\.(mp4|webm|mp3|jpg|png|glb|txt)$/.test(u.pathname);
async function fromCache(req) { return (await caches.match(req, { ignoreSearch: true })) || null; }

/** A Range request answered from a full cached copy (video/audio seeking). */
async function ranged(req, full) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || ''); const buf = await full.arrayBuffer(); const size = buf.byteLength;
  let start = m && m[1] ? Number(m[1]) : 0, end = m && m[2] ? Number(m[2]) : size - 1; if (!m || !m[1]) { start = m && m[2] ? size - Number(m[2]) : 0; end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers: { 'Content-Type': full.headers.get('Content-Type') || 'application/octet-stream', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
async function cacheFull(url) { try { const r = await fetch(url, { cache: 'no-store' }); if (r.ok && r.status === 200) await (await caches.open(MEDIA)).put(url, r); } catch { /* offline */ } }

self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) { // fonts: cache-first
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(fromCache(req).then((hit) => hit || fetch(req).then((r) => { const c = r.clone(); caches.open(MEDIA).then((m) => m.put(req, c)); return r; })));
    return;
  }
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) { // newest page when online
    // Keep each app shell under its own request URL. Otherwise visiting /audio/ can overwrite
    // the cached main index (or vice versa) and the wrong product opens offline.
    e.respondWith(fetch(req).then((r) => {
      const c = r.clone(); caches.open(SHELL).then((s) => s.put(req, c)); return r;
    }).catch(async () => {
      const hit = await fromCache(req); if (hit) return hit;
      const isAudio = /\/audio(?:\/|\/index\.html)$/.test(url.pathname);
      return (await caches.match(isAudio ? 'audio/index.html' : 'index.html')) || Response.error();
    }));
    return;
  }
  if (url.pathname.endsWith('/manifest.json')) { // media manifest: network first so new clips appear
    e.respondWith(fetch(req).then((r) => { const c = r.clone(); caches.open(SHELL).then((s) => s.put(req, c)); return r; }).catch(async () => (await fromCache(req)) || Response.error()));
    return;
  }
  if (!isMedia(url)) return;
  e.respondWith((async () => {
    const hit = await fromCache(new Request(url.href));
    if (hit) return req.headers.has('range') ? ranged(req, hit) : hit;
    if (req.headers.has('range')) { e.waitUntil(cacheFull(url.href)); return fetch(req); } // stream now, keep a full copy for next time
    const r = await fetch(req); if (r.ok && r.status === 200) { const c = r.clone(); e.waitUntil(caches.open(MEDIA).then((m) => m.put(url.href, c))); } return r;
  })());
});

/* "Save for offline": the page posts a list of URLs; progress is reported back. */
self.addEventListener('message', (e) => {
  const d = e.data || {}; if (d.type !== 'cache-all' || !Array.isArray(d.urls)) return;
  const port = e.ports[0];
  e.waitUntil((async () => {
    const m = await caches.open(MEDIA); let done = 0, bytes = 0;
    for (const u of d.urls) {
      const abs = new URL(u, self.registration.scope).href;
      try { if (!(await m.match(abs))) { const r = await fetch(abs, { cache: 'no-store' }); if (r.ok) { bytes += Number(r.headers.get('content-length') || 0); await m.put(abs, r); } } } catch { /* skip */ }
      done++; if (port && (done % 5 === 0 || done === d.urls.length)) port.postMessage({ done, total: d.urls.length, bytes });
    }
  })());
});
