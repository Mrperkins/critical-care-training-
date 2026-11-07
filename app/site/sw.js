/* Critical Care Physiology — offline support.
 * Three caches:
 *  - SHELL (one per version): the pages and code chunks. A new version replaces it.
 *  - STATIC: 3D models, card art and page heroes, keyed by a content revision written at build time, so an update
 *    only downloads the files that actually changed (the models alone are ~30 MB).
 *  - MEDIA: narration, audio episodes, clinical images and conference media — cached the first time they are used,
 *    or a whole pack at once from the Offline page. Media range requests are answered from the cached file.
 * Data files (.json) are network-first with the cached copy as the offline fallback. */
const VERSION = '__VERSION__';
const SHELL = `cc-shell-${VERSION}`, STATIC = 'cc-static-v1', MEDIA = 'cc-media-v1';
const CORE = ['./', 'index.html', '__CHUNKS__', 'audio/index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
/** path (relative to the scope) → content revision */
const ASSETS = '__ASSETS__';
const DATA = ['audio/assets.json', 'imaging/real/manifest.json', 'conferences/manifest.json', 'offline-packs.json'];

const scopePath = new URL(self.registration.scope).pathname;
const rel = (url) => (url.pathname.startsWith(scopePath) ? url.pathname.slice(scopePath.length) : null);
const revKey = (path) => new URL(`${path}?rev=${ASSETS[path]}`, self.registration.scope).href;

async function fillStatic(report) {
  const c = await caches.open(STATIC); const paths = Object.keys(ASSETS); let done = 0;
  for (let i = 0; i < paths.length; i += 6) { // a few at a time: fast, without starving the page
    await Promise.all(paths.slice(i, i + 6).map(async (p) => {
      const key = revKey(p);
      if (!(await c.match(key))) { try { const r = await fetch(new URL(p, self.registration.scope).href, { cache: 'reload' }); if (r.ok && r.status === 200) await c.put(key, r); } catch { /* offline: try next time */ } }
      done++;
    }));
    if (report) report(done, paths.length);
  }
}
async function pruneStatic() {
  const c = await caches.open(STATIC); const want = new Set(Object.keys(ASSETS).map(revKey));
  for (const req of await c.keys()) if (!want.has(req.url)) await c.delete(req);
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const s = await caches.open(SHELL);
    await Promise.all(CORE.map((u) => s.add(new Request(u, { cache: 'reload' })).catch(() => undefined)));
    await Promise.all(DATA.map((u) => fetch(u, { cache: 'reload' }).then((r) => (r.ok ? s.put(new URL(u, self.registration.scope).href, r) : undefined)).catch(() => undefined)));
    await fillStatic();
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // carry the data files over so an update made offline still has them, then drop old shells
    const keys = await caches.keys(); const s = await caches.open(SHELL);
    for (const k of keys.filter((k) => k.startsWith('cc-shell-') && k !== SHELL)) {
      const old = await caches.open(k);
      for (const u of DATA) { const abs = new URL(u, self.registration.scope).href; if (!(await s.match(abs))) { const hit = await old.match(abs); if (hit) await s.put(abs, hit); } }
      await caches.delete(k);
    }
    await pruneStatic();
    // code chunks from earlier versions are never asked for again
    const m = await caches.open(MEDIA); const live = new Set(CORE.map((u) => new URL(u, self.registration.scope).href));
    for (const req of await m.keys()) if (/\/js\/[^/]+\.js$/.test(new URL(req.url).pathname) && !live.has(req.url)) await m.delete(req);
    await self.clients.claim();
  })());
});

const isMedia = (u) => /\/(vo|imaging|models|js|conferences|audio|thumbs|heroes)\//.test(u.pathname) || /\.(mp4|webm|mp3|m4a|jpg|jpeg|png|webp|glb|txt|woff2)$/.test(u.pathname);
async function fromCache(req) { return (await caches.match(req, { ignoreSearch: true })) || null; }

/** A Range request answered from a full cached copy (video/audio seeking). */
async function ranged(req, full) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || ''); const buf = await full.arrayBuffer(); const size = buf.byteLength;
  let start = m && m[1] ? Number(m[1]) : 0, end = m && m[2] ? Number(m[2]) : size - 1; if (!m || !m[1]) { start = m && m[2] ? size - Number(m[2]) : 0; end = size - 1; }
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, statusText: 'Partial Content', headers: { 'Content-Type': full.headers.get('Content-Type') || 'application/octet-stream', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
const mediaKey = (url) => url.origin + url.pathname; // one copy per file, whatever cache-busting query it was asked with
async function cacheFull(url) { try { const r = await fetch(url.href, { cache: 'no-store' }); if (r.ok && r.status === 200) await (await caches.open(MEDIA)).put(mediaKey(url), r); } catch { /* offline */ } }

self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) { // web fonts used by the audio app: cache-first
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
  const path = rel(url);
  if (path && ASSETS[path]) { // revisioned static file: cache-first under its revision
    e.respondWith((async () => {
      const key = revKey(path); const c = await caches.open(STATIC); const hit = await c.match(key);
      if (hit) return hit;
      const r = await fetch(req); if (r.ok && r.status === 200) { const copy = r.clone(); e.waitUntil(c.put(key, copy)); } return r;
    })());
    return;
  }
  if (url.pathname.endsWith('.json')) { // data: network first so new content appears, cached copy offline
    e.respondWith(fetch(req).then((r) => { if (r.ok) { const c = r.clone(); e.waitUntil(caches.open(SHELL).then((s) => s.put(mediaKey(url), c))); } return r; })
      .catch(async () => (await caches.match(mediaKey(url), { ignoreSearch: true })) || Response.error()));
    return;
  }
  if (!isMedia(url)) return;
  e.respondWith((async () => {
    const hit = await fromCache(new Request(mediaKey(url)));
    if (hit) return req.headers.has('range') ? ranged(req, hit) : hit;
    if (req.headers.has('range')) { e.waitUntil(cacheFull(url)); return fetch(req); } // stream now, keep a full copy for next time
    const r = await fetch(req); if (r.ok && r.status === 200) { const c = r.clone(); e.waitUntil(caches.open(MEDIA).then((m) => m.put(mediaKey(url), c))); } return r;
  })());
});

/* Offline page: download a pack (the page posts its URLs; progress is reported back), or check the core files. */
self.addEventListener('message', (e) => {
  const d = e.data || {}; const port = e.ports[0];
  if (d.type === 'cache-all' && Array.isArray(d.urls)) {
    e.waitUntil((async () => {
      const m = await caches.open(MEDIA); let done = 0, bytes = 0, failed = 0;
      for (let i = 0; i < d.urls.length; i += 4) {
        await Promise.all(d.urls.slice(i, i + 4).map(async (u) => {
          const url = new URL(u, self.registration.scope);
          try { if (!(await m.match(mediaKey(url)))) { const r = await fetch(url.href, { cache: 'no-store' }); if (r.ok && r.status === 200) { bytes += Number(r.headers.get('content-length') || 0); await m.put(mediaKey(url), r); } else failed++; } } catch { failed++; }
          done++;
        }));
        if (port) port.postMessage({ done, total: d.urls.length, bytes, failed });
      }
    })());
  }
  if (d.type === 'core-status') {
    e.waitUntil((async () => {
      const c = await caches.open(STATIC); const paths = Object.keys(ASSETS); let have = 0;
      for (const p of paths) if (await c.match(revKey(p))) have++;
      if (have < paths.length) await fillStatic((done, total) => port?.postMessage({ type: 'core', done: Math.max(have, done), total, filling: true }));
      let now = 0; for (const p of paths) if (await c.match(revKey(p))) now++;
      port?.postMessage({ type: 'core', done: now, total: paths.length, filling: false, version: VERSION });
    })());
  }
});
