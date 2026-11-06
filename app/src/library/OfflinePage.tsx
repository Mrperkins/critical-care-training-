/**
 * Offline: what works without signal, what is already on this device, and a download (or remove) button per pack.
 * The app, every 3D model and all card art are stored automatically on the first visit; anything opened after that
 * is kept as it plays. Packs fetch a whole set at once, with sizes from offline-packs.json (written by the build).
 */
import { useCallback, useEffect, useState } from 'react';

type PackFile = { u: string; b: number; alt?: { u: string; b: number } };
type Pack = { id: string; title: string; blurb: string; files: PackFile[] };
type Manifest = { version: string; core: number; packs: Pack[] };
type Progress = { done: number; total: number; failed: number };
const MEDIA = 'cc-media-v1';

type Prompt = Event & { prompt: () => Promise<void> };
let deferredInstall: Prompt | null = null;
if (typeof window !== 'undefined') window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e as Prompt; });

export const mb = (b: number) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${Math.max(1, Math.round(b / 1e6))} MB`);
const webmOk = () => typeof document !== 'undefined' && document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
/** the file this browser will actually ask for */
const pick = (f: PackFile) => (f.alt && !webmOk() ? f.alt : f);
const keyOf = (u: string) => { const x = new URL(u, document.baseURI); return x.origin + x.pathname; };

/** Online/offline, as the browser reports it. */
export function useOnline() {
  const [on, setOn] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => { const up = () => setOn(true), down = () => setOn(false); window.addEventListener('online', up); window.addEventListener('offline', down); return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); }; }, []);
  return on;
}

async function swReady(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return null;
  return navigator.serviceWorker.ready;
}
function ask<T>(reg: ServiceWorkerRegistration, msg: object, onMsg: (d: T) => boolean | void) {
  const ch = new MessageChannel(); ch.port1.onmessage = (e) => { if (onMsg(e.data as T) === true) ch.port1.close(); };
  reg.active?.postMessage(msg, [ch.port2]);
}
async function savedOf(p: Pack): Promise<{ have: number; bytes: number }> {
  if (typeof caches === 'undefined') return { have: 0, bytes: 0 };
  const c = await caches.open(MEDIA); let have = 0, bytes = 0;
  await Promise.all(p.files.map(async (f) => { const g = pick(f); if (await c.match(keyOf(g.u), { ignoreSearch: true })) { have++; bytes += g.b; } }));
  return { have, bytes };
}

export function OfflinePage() {
  const online = useOnline();
  const [reg, setReg] = useState<ServiceWorkerRegistration | null | undefined>(undefined);
  const [man, setMan] = useState<Manifest | null>(null); const [manErr, setManErr] = useState(false);
  const [core, setCore] = useState<{ done: number; total: number; filling: boolean } | null>(null);
  const [saved, setSaved] = useState<Record<string, { have: number; bytes: number }>>({});
  const [prog, setProg] = useState<Record<string, Progress>>({});
  const [store, setStore] = useState<{ usage: number; quota: number; persisted: boolean } | null>(null);
  const [canInstall, setCanInstall] = useState(!!deferredInstall);
  const standalone = typeof window !== 'undefined' && !!window.matchMedia?.('(display-mode: standalone)').matches;
  const ios = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);

  const refreshStore = useCallback(async () => {
    const s = navigator.storage; if (!s?.estimate) return;
    const [e, persisted] = await Promise.all([s.estimate(), s.persisted ? s.persisted() : Promise.resolve(false)]);
    setStore({ usage: e.usage ?? 0, quota: e.quota ?? 0, persisted });
  }, []);
  const refreshSaved = useCallback(async (m: Manifest) => {
    const out: Record<string, { have: number; bytes: number }> = {};
    for (const p of m.packs) out[p.id] = await savedOf(p);
    setSaved(out); void refreshStore();
  }, [refreshStore]);

  useEffect(() => {
    void swReady().then((r) => {
      setReg(r);
      if (r) ask<{ type: string; done: number; total: number; filling: boolean }>(r, { type: 'core-status' }, (d) => { if (d.type === 'core') setCore(d); return !d.filling; });
    });
    fetch('offline-packs.json').then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))).then((m: Manifest) => { setMan(m); void refreshSaved(m); }).catch(() => setManErr(true));
    void refreshStore();
    const on = () => setCanInstall(true); window.addEventListener('beforeinstallprompt', on); return () => window.removeEventListener('beforeinstallprompt', on);
  }, [refreshSaved, refreshStore]);

  const download = async (p: Pack) => {
    if (!reg || !man) return;
    try { await navigator.storage?.persist?.(); } catch { /* not offered */ }
    const urls = p.files.map((f) => pick(f).u);
    setProg((x) => ({ ...x, [p.id]: { done: 0, total: urls.length, failed: 0 } }));
    ask<Progress>(reg, { type: 'cache-all', urls }, (d) => {
      setProg((x) => ({ ...x, [p.id]: d }));
      if (d.done >= d.total) { void refreshSaved(man).then(() => setProg((x) => { const y = { ...x }; delete y[p.id]; return y; })); return true; }
    });
  };
  const remove = async (p: Pack) => {
    if (!man || typeof caches === 'undefined') return;
    const c = await caches.open(MEDIA);
    await Promise.all(p.files.flatMap((f) => [f.u, f.alt?.u].filter(Boolean) as string[]).map((u) => c.delete(keyOf(u), { ignoreSearch: true })));
    void refreshSaved(man);
  };
  const all = man?.packs ?? [];
  const missing = all.filter((p) => (saved[p.id]?.have ?? 0) < p.files.length && !prog[p.id]);
  const missingBytes = missing.reduce((n, p) => n + p.files.reduce((m, f) => m + pick(f).b, 0) - (saved[p.id]?.bytes ?? 0), 0);
  const coreReady = !!core && core.done >= core.total;

  return (
    <div className="lib-page lib-offline">
      <header className="lib-page-h">
        <h1 className="lib-display">Use it without signal</h1>
        <p className="lib-lede">Everything you open is kept on this device as you go. Download a pack to have it ready before a shift, a flight or a dead zone.</p>
      </header>

      {reg === null && <p className="lib-offline-note" role="status">Offline storage starts after your first visit to the published site, in a browser that supports it. Reload once and come back here.</p>}

      <section className="lib-offline-status" aria-label="This device">
        <div className={`lib-off-tile${online ? ' ok' : ' warn'}`}><b>{online ? 'Online' : 'Offline now'}</b><small>{online ? 'Downloads available' : 'Showing what is saved on this device'}</small></div>
        <div className={`lib-off-tile${coreReady ? ' ok' : ''}`}><b>{coreReady ? 'App and 3D models ready' : core ? `Saving app ${core.done}/${core.total}` : reg ? 'Checking…' : 'Not stored yet'}</b><small>Lessons, simulators, cases and all 3D scenes{man ? ` · ${mb(man.core)}` : ''}</small></div>
        <div className="lib-off-tile"><b>{store ? `${mb(store.usage)} used` : 'Storage'}</b><small>{store ? `${store.quota ? `${mb(store.quota)} available · ` : ''}${store.persisted ? 'Kept until you remove it' : 'The browser may clear it if space runs low'}` : 'Not reported by this browser'}</small></div>
      </section>

      {(!standalone && (canInstall || ios)) && (
        <section className="lib-offline-install" aria-label="Install">
          <div><b>Install the app</b><small>{ios ? 'iPhone and iPad keep offline files much longer for installed apps. Tap Share, then Add to Home Screen.' : 'Opens like an app and keeps offline files more reliably.'}</small></div>
          {canInstall && <button className="lib-btn primary" onClick={async () => { await deferredInstall?.prompt(); deferredInstall = null; setCanInstall(false); }}>Install</button>}
        </section>
      )}

      <section className="lib-offline-packs" aria-label="Download packs">
        <div className="lib-row-h"><h2>Download packs</h2>
          {reg && online && missing.length > 1 && <button className="lib-link" onClick={() => missing.forEach((p) => void download(p))}>Download all · {mb(missingBytes)}</button>}
        </div>
        {manErr && <p className="lib-offline-note">The pack list could not be loaded{online ? '' : ' while offline'}.</p>}
        {all.map((p) => {
          const total = p.files.reduce((n, f) => n + pick(f).b, 0); const s = saved[p.id]; const g = prog[p.id];
          const full = !!s && s.have >= p.files.length; const some = !!s && s.have > 0;
          return (
            <article key={p.id} className="lib-pack">
              <div className="lib-pack-copy">
                <h3>{p.title}</h3><p>{p.blurb}</p>
                <small>{p.files.length} files · {mb(total)}{some && !full ? ` · ${s.have} saved` : ''}</small>
                {g && <div className="lib-pack-bar" role="progressbar" aria-label={`${p.title} download`} aria-valuemin={0} aria-valuemax={g.total} aria-valuenow={g.done}><i style={{ width: `${(100 * g.done) / Math.max(1, g.total)}%` }} /></div>}
                {g && <small aria-live="polite">Downloading {g.done} of {g.total}{g.failed ? ` · ${g.failed} could not be fetched` : ''}</small>}
              </div>
              <div className="lib-pack-actions">
                {full ? <span className="lib-pack-done">Saved ✓</span>
                  : <button className="lib-btn primary" disabled={!reg || !online || !!g} onClick={() => void download(p)}>{g ? 'Downloading…' : some ? 'Finish download' : 'Download'}</button>}
                {some && !g && <button className="lib-btn" onClick={() => void remove(p)}>Remove</button>}
              </div>
            </article>
          );
        })}
      </section>
      <p className="lib-offline-note">Seven MRI studies in the imaging trainer stream from Wikimedia Commons and need a connection.</p>
    </div>
  );
}
