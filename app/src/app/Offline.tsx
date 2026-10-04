/**
 * Offline use: install to the home screen, and "Save for offline" — asks the service worker to cache every
 * narration clip and real clinical image/clip now (the app shell and 3D models are cached automatically).
 */
import { useEffect, useState } from 'react';

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: Prompt | null = null;
if (typeof window !== 'undefined') window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as Prompt; });

async function mediaUrls(): Promise<string[]> {
  const urls = ((window as unknown as { __VO_IDS__?: string[] }).__VO_IDS__ ?? []).map((id) => `vo/${id}.mp3`);
  try {
    const m = await (await fetch('imaging/real/manifest.json')).json() as { items: { file: string; webm?: string; poster?: string }[] };
    const webm = document.createElement('video').canPlayType('video/webm; codecs="vp9"') !== '';
    for (const it of m.items) { urls.push(`imaging/real/${it.file.endsWith('.mp4') && webm && it.webm ? it.webm : it.file}`); if (it.poster) urls.push(`imaging/real/${it.poster}`); }
  } catch { /* offline already */ }
  return urls;
}

export function OfflineCard() {
  const [sw, setSw] = useState<boolean | null>(null); const [prog, setProg] = useState<{ done: number; total: number; bytes: number } | null>(null);
  const [canInstall, setCanInstall] = useState(!!deferred); const standalone = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches;
  const ios = typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent);
  useEffect(() => {
    if (!('serviceWorker' in navigator)) { setSw(false); return; }
    navigator.serviceWorker.getRegistration().then((r) => setSw(!!r));
    const on = () => setCanInstall(true); window.addEventListener('beforeinstallprompt', on); return () => window.removeEventListener('beforeinstallprompt', on);
  }, []);
  const save = async () => {
    const reg = await navigator.serviceWorker.ready; const urls = await mediaUrls(); setProg({ done: 0, total: urls.length, bytes: 0 });
    const ch = new MessageChannel(); ch.port1.onmessage = (e) => setProg(e.data); reg.active?.postMessage({ type: 'cache-all', urls }, [ch.port2]);
  };
  const doneAll = prog && prog.done >= prog.total;
  return (
    <section className="card offline-card" aria-label="Use offline">
      <div className="card-h"><h3>Use offline</h3>{standalone && <span className="badge ok">Installed</span>}</div>
      {sw === false ? <p className="muted small">This browser cannot store the app for offline use.</p> : <>
        <p className="small">The app and its 3D models are kept on this device after your first visit. Save the narration and real clinical clips too, and everything works without signal.</p>
        <div className="chips">
          <button type="button" className="chip on" disabled={!sw || (!!prog && !doneAll)} title={sw ? undefined : 'Available on the published site after the first visit'} onClick={save}>{doneAll ? 'Saved — update' : prog ? `Saving ${prog.done}/${prog.total}…` : 'Save everything for offline'}</button>
          {canInstall && !standalone && <button type="button" className="chip" onClick={async () => { await deferred?.prompt(); deferred = null; setCanInstall(false); }}>Install app</button>}
        </div>
        {prog && <div className="cur-bar" style={{ marginTop: 8 }}><i style={{ width: `${(100 * prog.done) / Math.max(1, prog.total)}%` }} /></div>}
        {doneAll && <p className="muted small">{prog!.total} files saved{prog!.bytes ? ` (${(prog!.bytes / 1e6).toFixed(0)} MB new)` : ''}.</p>}
        {ios && !standalone && <p className="muted small">iPhone / iPad: Share → Add to Home Screen to install.</p>}
      </>}
    </section>
  );
}
