/* Critical Care Physiology — offline support.
 * Three caches:
 *  - SHELL (one per version): the pages and code chunks. A new version replaces it.
 *  - STATIC: 3D models, card art and page heroes, keyed by a content revision written at build time, so an update
 *    only downloads the files that actually changed (the models alone are ~30 MB).
 *  - MEDIA: narration, audio episodes, clinical images and conference media — cached the first time they are used,
 *    or a whole pack at once from the Offline page. Media range requests are answered from the cached file.
 * Data files (.json) are network-first with the cached copy as the offline fallback. */
const VERSION = 'c3e6bcfb2e10';
const SHELL = `cc-shell-${VERSION}`, STATIC = 'cc-static-v1', MEDIA = 'cc-media-v1';
const CORE = ['./', 'index.html', "js/c-62EKK5H4.js", "js/c-2S75F2YX.js", "js/c-ZBPA5435.js", "js/c-LIYRNVD6.js", "js/c-A5NAS6ZF.js", "js/c-P3Y5K27J.js", "js/c-6X6LP7GW.js", "js/c-4P3FZUPH.js", "js/c-MZTDU653.js", "js/c-XDJ6FFV4.js", "js/c-BD5MP67B.js", "js/c-XKWSVJQS.js", "js/c-CEDBV5IZ.js", "js/c-USLQI7DY.js", "js/c-Q7WWW4TN.js", "js/c-KZ7ZVXPH.js", "js/c-X4JFPN2O.js", "js/c-HYKJUZ6X.js", "js/c-ITY6IQRO.js", "js/c-TVMORNU3.js", "js/c-LVU466EE.js", "js/c-JO3YSTRF.js", "js/c-KU76Z2KR.js", "js/c-WU33FIPO.js", "js/c-EM3234LS.js", "js/c-PEXDH3SI.js", "js/c-PD26ORL6.js", "js/c-YCSIOL5H.js", "js/c-LARDXPXI.js", "js/c-7TXOJQON.js", "js/c-XAQQ2CCN.js", "js/c-KP6ZOEK3.js", "js/c-U2Y5NJVG.js", "js/c-3X7L4ARQ.js", "js/c-QPMINK4N.js", "js/c-LRHSTWYK.js", "js/c-EOAWTVAC.js", "js/c-NOIXKRRO.js", "js/c-YG32LYYM.js", "js/c-44V67I32.js", "js/c-YASCNOCR.js", "js/c-2NFUC7T6.js", "js/c-D54KJBLE.js", "js/c-FAFIOKVG.js", "js/c-6L6T2XUL.js", "js/c-W44LWEKL.js", "js/c-WN45QT27.js", "js/c-QWQDZFFS.js", "js/c-MW5WDGLY.js", "js/c-IC523GCP.js", "js/app-I6SAU6MH.js", "js/c-MVE5WO7Q.js", "js/c-RDZLMDHJ.js", "js/c-5O5F574S.js", "js/c-XO6SJHZL.js", "js/c-2IMGUTC4.js", "js/c-6VU62L7K.js", "js/c-HZKCO6JW.js", "js/c-4TO7V6VY.js", "js/c-ZKHRLTKA.js", "js/c-RLYE3Q7D.js", "js/c-5PT4JHU5.js", "js/c-JPQFFK4N.js", "js/c-SZP5USN3.js", "js/c-FVGZDNWX.js", "js/c-GLOPYFSS.js", "js/c-CEZHNXSC.js", "js/c-TTNRYYRZ.js", "js/c-GMZLDHWN.js", "js/c-WQ2PHO7R.js", "js/c-YIO7YPDQ.js", "js/c-AC4BGTE6.js", "js/c-US5YUUJR.js", "js/c-SPA5XOWU.js", "js/c-7B3RX6BV.js", "js/c-V5DUMM43.js", "js/c-YIRXAWZZ.js", "js/c-YQBJVS6I.js", "js/c-JSE5OMHM.js", "js/c-VSRIDMD7.js", "js/c-BY77YKHU.js", "js/c-TLT3VEVH.js", "js/c-FH6SUL5Y.js", "js/c-BC7BEIF3.js", "js/c-3JWLEAIA.js", "js/c-YIP6WDFO.js", "js/c-UC77S2T4.js", "js/c-4TIYSYRS.js", "js/c-ZYIGBBBU.js", "js/c-GCNXBE3O.js", "js/c-XHMOJL66.js", "js/c-LV7NOCMP.js", 'audio/index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
/** path (relative to the scope) → content revision */
const ASSETS = {"models/bedside-airway.glb.txt":"1ff3d24469","models/body-f.glb.txt":"48992f4cae","models/body-f.mapping.json":"626673e64d","models/body.glb.txt":"e75299668c","models/body.mapping.json":"6f39bcbf79","models/brain-volume.json":"7b55ca0b53","models/cerebral-arteries.glb.txt":"790468d07b","models/cerebral-arteries.mapping.json":"ba278c9b68","models/coronary-heart.glb.txt":"58e2835684","models/coronary-heart.mapping.json":"82cc55f5e9","models/eyes.glb.txt":"0c65c6a2c6","models/eyes.mapping.json":"a640f919f9","models/gut.glb.txt":"5cdc2d5d29","models/gut.mapping.json":"50762bb444","models/heart-hd.glb.txt":"e7ad36c18c","models/heart-hd.mapping.json":"36c91034c4","models/heart-internals.glb.txt":"3642860a1f","models/heart-internals.mapping.json":"e3ce81e955","models/lines.glb.txt":"918d6243d2","models/lines.mapping.json":"364c035fa6","models/medical-ventilator.glb.txt":"7451e109de","models/micro.glb.txt":"f5d97f4b78","models/micro.mapping.json":"739ac3bd1c","models/nerves.glb.txt":"c7393dcf0b","models/nerves.mapping.json":"5489e5389b","models/neuro.glb.txt":"32613ae28e","models/neuro.mapping.json":"c8f488ae35","models/pericardium.glb.txt":"f3d67067f2","models/pericardium.mapping.json":"5d11dca8b3","models/resp.glb.txt":"3a9bd65522","models/resp.mapping.json":"d2ed48ba03","models/skeleton.glb.txt":"5ffd3a2aa8","models/skeleton.mapping.json":"dd7b0c3061","models/upper-airway.glb.txt":"faff2b2013","models/upper-airway.mapping.json":"7dc7c332a8","thumbs/abd-aorta.jpg":"8ead83e7da","thumbs/abd-fast.jpg":"eca10fa33e","thumbs/abd-gut.jpg":"7a35660f11","thumbs/cardiac-congenital.jpg":"3b4dfd29bc","thumbs/cardiac-mi.jpg":"5523b3381c","thumbs/gas-basics.jpg":"9af084cfbd","thumbs/gas-bleeding.jpg":"f20d45144b","thumbs/gas-dka.jpg":"49169db4aa","thumbs/gas-lytes.jpg":"987f119152","thumbs/lines-artline.jpg":"ccf11d454d","thumbs/lines-bleed.jpg":"9e96c5e29a","thumbs/lines-cvp.jpg":"97f94398a3","thumbs/lines-devices.jpg":"a954db8d7e","thumbs/lines-shock.jpg":"77cc123216","thumbs/neuro-icp.jpg":"01de5d664f","thumbs/neuro-stroke.jpg":"ebc50cdf6e","thumbs/ob-pregnancy.jpg":"39ffa93421","thumbs/peds-newborn.jpg":"7cd3c4bbb2","thumbs/peds-sick-child.jpg":"4550f5510a","thumbs/pharm-moa.jpg":"1a0a94df1d","thumbs/vent-ards.jpg":"636a98745d","thumbs/vent-desat.jpg":"117c02ab2a","thumbs/vent-foundations.jpg":"c76c804362","thumbs/vent-pressure.jpg":"c116511f83","thumbs/vent-ptx.jpg":"4efaef0df5","thumbs/vent-waveforms.jpg":"d021c327c6","heroes/abd-aorta-800.jpg":"2248275321","heroes/abd-aorta.jpg":"a1a2911a14","heroes/abd-fast-800.jpg":"f792d3ae00","heroes/abd-fast.jpg":"e36e0943d2","heroes/abd-gut-800.jpg":"c16536e0c5","heroes/abd-gut.jpg":"54dca1769b","heroes/cardiac-congenital-800.jpg":"b21598852a","heroes/cardiac-congenital.jpg":"9367fb29b7","heroes/cardiac-mi-800.jpg":"a51612ab91","heroes/cardiac-mi.jpg":"e73565612c","heroes/gas-basics-800.jpg":"845c069eae","heroes/gas-basics.jpg":"9718f5a27f","heroes/gas-bleeding-800.jpg":"5f0fe873b6","heroes/gas-bleeding.jpg":"764880263b","heroes/gas-dka-800.jpg":"8e6281a7c8","heroes/gas-dka.jpg":"224808ea85","heroes/gas-lytes-800.jpg":"05764da832","heroes/gas-lytes.jpg":"d83b3e3eae","heroes/lines-devices-800.jpg":"7e4f9333ef","heroes/lines-devices.jpg":"38b5804446","heroes/neuro-icp-800.jpg":"8b647d38db","heroes/neuro-icp.jpg":"448b9651fc","heroes/neuro-stroke-800.jpg":"3463bc83d6","heroes/neuro-stroke.jpg":"abe8620663","heroes/ob-pregnancy-800.jpg":"99caf07d3d","heroes/ob-pregnancy.jpg":"5d6e0cbf57","heroes/peds-newborn-800.jpg":"eb0ffbcfb8","heroes/peds-newborn.jpg":"f79bc8a6b3","heroes/peds-sick-child-800.jpg":"0d38989eac","heroes/peds-sick-child.jpg":"613f1bb0c8","heroes/vent-ards-800.jpg":"e57af3ef6a","heroes/vent-ards.jpg":"603cce0384","heroes/vent-desat-800.jpg":"67eb01fa23","heroes/vent-desat.jpg":"35a90a672b","heroes/vent-foundations-800.jpg":"5f9014ebe4","heroes/vent-foundations.jpg":"721f483495","heroes/vent-pressure-800.jpg":"ef127818bc","heroes/vent-pressure.jpg":"0cfb13519e","heroes/vent-ptx-800.jpg":"66e9fd45d7","heroes/vent-ptx.jpg":"34e625f1c7","heroes/vent-waveforms-800.jpg":"d8db73372f","heroes/vent-waveforms.jpg":"28b831435e"};
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
