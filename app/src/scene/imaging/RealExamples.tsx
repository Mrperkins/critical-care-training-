/**
 * Real, openly licensed clinical images and clips (repo-root `imaging/real/`, see its manifest and
 * ATTRIBUTION.md) shown beside the synthetic views, with author, source, licence and changes on every item.
 */
import { useEffect, useState } from 'react';

export interface RealItem { file: string; poster?: string; kind: 'xray' | 'lus'; id: string; title: string; caption: string; look: string[]; license: string; licenseUrl: string; author: string; source: string; changes: string }
let cache: Promise<RealItem[]> | null = null;
export function loadReal(): Promise<RealItem[]> {
  return (cache ??= fetch('imaging/real/manifest.json').then((r) => (r.ok ? r.json() : { items: [] })).then((m) => m.items as RealItem[]).catch(() => []));
}
export function RealExamples({ kind, title }: { kind: RealItem['kind']; title: string }) {
  const [items, setItems] = useState<RealItem[] | null>(null); const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { let on = true; loadReal().then((x) => on && setItems(x.filter((i) => i.kind === kind))); return () => { on = false; }; }, [kind]);
  if (items === null) return null;
  if (!items.length) return <p className="img-note">Real examples could not be loaded (offline?).</p>;
  const cur = items.find((i) => i.id === open);
  return (
    <section className="real">
      <div className="real-h"><h4>{title}</h4><span className="img-note">Real patients, openly licensed — for comparison with the model, not for diagnosis.</span></div>
      <div className="real-row">
        {items.map((it) => (
          <figure key={it.id} className={`real-fig${open === it.id ? ' on' : ''}`}>
            <button className="real-btn" onClick={() => setOpen(open === it.id ? null : it.id)} aria-expanded={open === it.id} aria-label={`${it.title}: ${it.caption}`}>
              {it.file.endsWith('.mp4') ? <video src={`imaging/real/${it.file}`} poster={it.poster ? `imaging/real/${it.poster}` : undefined} muted loop autoPlay playsInline preload="metadata" /> : <img src={`imaging/real/${it.file}`} alt={it.caption} loading="lazy" />}
            </button>
            <figcaption>{it.title}</figcaption>
          </figure>
        ))}
      </div>
      {cur && <div className="real-detail">
        <p><b>{cur.title}.</b> {cur.caption}</p>
        <p className="small"><b>Look for:</b> {cur.look.join(' · ')}</p>
        <p className="credit">{cur.author}. {cur.source}. <a href={cur.licenseUrl} target="_blank" rel="noreferrer">{cur.license}</a>. Changes: {cur.changes}</p>
      </div>}
    </section>
  );
}
