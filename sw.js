/* Critical Care Physiology — offline support.
 * App shell + 3D models are cached on install; narration, clips and images are cached the first time they are used
 * (or all at once from "Save for offline"). Media range requests are answered from the cached file.
 * The version string is replaced at build time; a new version replaces the old caches. */
const VERSION = '01e88010278b';
const SHELL = `cc-shell-${VERSION}`, MEDIA = 'cc-media-v1';
const CORE = ['./', 'index.html', "js/c-3HJLTHMT.js", "js/c-JCCZ3K47.js", "js/c-62EKK5H4.js", "js/c-4ELDQ45O.js", "js/c-QQPY44PR.js", "js/c-NN6D3ZSF.js", "js/c-LIYRNVD6.js", "js/c-HBZOWRL5.js", "js/c-A5VP2HYC.js", "js/c-HDVCJLWB.js", "js/c-5XPGBPDF.js", "js/c-EOAWTVAC.js", "js/c-6X6LP7GW.js", "js/c-VJ6KHWYA.js", "js/c-GOZNL3NM.js", "js/c-A2QCY27L.js", "js/c-CEDBV5IZ.js", "js/c-NTI5IEN2.js", "js/c-LARDXPXI.js", "js/c-7TXOJQON.js", "js/c-DG3H2OFY.js", "js/c-WFUJ3UND.js", "js/c-JVY55B2X.js", "js/c-7B347KLF.js", "js/c-GXMA5LOO.js", "js/c-QXVZ2R3D.js", "js/c-HMKE55WN.js", "js/c-OTVZILC3.js", "js/c-SZCZEQRL.js", "js/c-PTX7NURO.js", "js/c-YG32LYYM.js", "js/c-ITFTNNPS.js", "js/c-44V67I32.js", "js/c-AEYISI6I.js", "js/c-6DCP4AGG.js", "js/c-YWUK7HJT.js", "js/c-KSHNPPPJ.js", "js/c-RZX6IWF5.js", "js/c-ECVHMZTB.js", "js/c-KX25PWBA.js", "js/c-WQ2PHO7R.js", "js/app-R2AL2BDZ.js", "js/c-MLCC76KB.js", "js/c-IDKVQUWJ.js", "js/c-IMWUPVMG.js", "js/c-XO6SJHZL.js", "js/c-IZK77F4F.js", "js/c-PCERGDHQ.js", "js/c-QH5WJ5BZ.js", "js/c-XMUTPPWH.js", "js/c-HMLVEVX4.js", "js/c-7D3JVWNV.js", "js/c-P5FZWOFE.js", "js/c-GLOPYFSS.js", "js/c-7CSZ6SXT.js", "js/c-6AKJ7ABY.js", "js/c-US5YUUJR.js", "js/c-SPA5XOWU.js", "js/c-7B3RX6BV.js", "js/c-V5DUMM43.js", "js/c-Q7FUMMO4.js", "js/c-2M7PL3IR.js", "js/c-4P4HSUXR.js", "js/c-BAROJ54P.js", "js/c-PFU5VIIQ.js", "js/c-FH6SUL5Y.js", "js/c-BC7BEIF3.js", "js/c-KHSOSMBY.js", "js/c-GV75JS3E.js", "js/c-UC77S2T4.js", "js/c-4TIYSYRS.js", "js/c-ZYIGBBBU.js", "js/c-GCNXBE3O.js", "js/c-XHMOJL66.js", "js/c-LV7NOCMP.js", 'audio/index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'imaging/real/manifest.json',
  'models/body.glb.txt', 'models/body.mapping.json', 'models/body-f.glb.txt', 'models/body-f.mapping.json', 'models/eyes.glb.txt', 'models/eyes.mapping.json', 'models/resp.glb.txt', 'models/resp.mapping.json',
  'models/micro.glb.txt', 'models/micro.mapping.json', 'models/lines.glb.txt', 'models/lines.mapping.json',
  'models/skeleton.glb.txt', 'models/skeleton.mapping.json', 'models/pericardium.glb.txt', 'models/pericardium.mapping.json', 'models/neuro.glb.txt', 'models/neuro.mapping.json', 'models/heart-internals.glb.txt', 'models/heart-internals.mapping.json', 'models/upper-airway.glb.txt', 'models/upper-airway.mapping.json', 'models/coronary-heart.glb.txt', 'models/coronary-heart.mapping.json', 'models/heart-hd.glb.txt', 'models/heart-hd.mapping.json', 'models/nerves.glb.txt', 'models/nerves.mapping.json', 'models/gut.glb.txt', 'models/gut.mapping.json', 'models/cerebral-arteries.glb.txt', 'models/cerebral-arteries.mapping.json', 'models/brain-volume.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => Promise.all(CORE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => undefined)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('cc-shell-') && k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

const isMedia = (u) => /\/(vo|imaging|models|js|conferences)\//.test(u.pathname) || /\.(mp4|webm|mp3|jpg|png|webp|glb|txt)$/.test(u.pathname);
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
