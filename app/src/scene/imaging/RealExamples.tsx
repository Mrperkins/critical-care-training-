/**
 * Real, openly licensed clinical images and clips (repo-root `imaging/real/`, see its manifest and
 * ATTRIBUTION.md) shown beside the synthetic views, with author, source, licence and changes on every item.
 */
import { useEffect, useState } from 'react';

/** Overlay mark, normalised 0–1 to the media frame. Landmarks = normal anatomy; pathology = the finding. */
export interface RealMark { layer: 'landmark' | 'pathology'; label: string; shape: 'ellipse' | 'line' | 'point'; x: number; y: number; rx?: number; ry?: number; pts?: [number, number][]; lx?: number; ly?: number }
export interface RealItem {
  file: string; poster?: string; webm?: string; posterAt?: number;
  /** xray / lus: comparison strips; ptx / fast / ivc / ijv: single-case teaching items (RealCase) */
  kind: 'xray' | 'lus' | 'ptx' | 'fast' | 'ivc' | 'ijv' | 'ptxlus'; id: string; title: string; caption: string; look: string[];
  teach?: string[]; quiz?: { q: string; options: string[]; answer: number; explain: string }; marks?: RealMark[];
  license: string; licenseUrl: string; author: string; source: string; changes: string; credit?: string; /** button text for the pathology layer, e.g. “Show the collapse point” */ findingLabel?: string;
  provenance?: { pageUrl: string; originalUrl: string; doi?: string; retrieved: string };
}
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
              {it.file.endsWith('.mp4') ? <video poster={it.poster ? `imaging/real/${it.poster}` : undefined} muted loop autoPlay playsInline preload="metadata">{it.webm && <source src={`imaging/real/${it.webm}`} type="video/webm" />}<source src={`imaging/real/${it.file}`} type="video/mp4" /></video> : <img src={`imaging/real/${it.file}`} alt={it.caption} loading="lazy" />}
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
