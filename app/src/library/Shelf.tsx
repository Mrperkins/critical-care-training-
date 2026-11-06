/**
 * One home-page row: a title, an optional "View all", and a sideways shelf of equal tiles with ‹ › paging
 * buttons at its edges (mouse affordance only; keyboard and touch scroll the shelf directly).
 * Also the hero photo used at the top of home, module, path and audio pages.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';

const Chevron = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" width="22" height="22"><path d={d} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function Row({ title, action, posters, children }: { title: string; action?: ReactNode; posters?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: true });
  const update = () => { const el = ref.current; if (!el) return; setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 }); };
  useEffect(() => {
    update(); const el = ref.current; if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update); ro.observe(el); return () => ro.disconnect();
  }, []);
  const page = (dir: number) => {
    const el = ref.current; const first = el?.firstElementChild as HTMLElement | null; if (!el) return;
    // move by whole tiles so the shelf never stops on half a tile
    const step = first ? first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth;
    el.scrollBy({ left: dir * Math.max(1, Math.floor((el.clientWidth - 64) / step)) * step, behavior: 'smooth' });
  };
  return (
    <section className={`lib-row${posters ? ' posters' : ''}`} aria-label={title}>
      <div className="lib-row-h"><h2>{title}</h2>{action}</div>
      <div className="lib-shelf">
        <div className="lib-scroller" ref={ref} onScroll={update}>{children}</div>
        {!edge.start && <button className="lib-arrow prev" tabIndex={-1} aria-hidden="true" onClick={() => page(-1)}><Chevron d="M15 5l-7 7 7 7" /></button>}
        {!edge.end && <button className="lib-arrow next" tabIndex={-1} aria-hidden="true" onClick={() => page(1)}><Chevron d="M9 5l7 7-7 7" /></button>}
      </div>
    </section>
  );
}

/** Rendered stills of the app's own 3D scenes (public/heroes, captured by scripts/qa/capture-heroes.mjs). */
export function HeroImage({ name, sizes = '100vw' }: { name: string; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className="lib-hero-img" src={`heroes/${name}.jpg`} srcSet={`heroes/${name}-800.jpg 800w, heroes/${name}.jpg 1920w`} sizes={sizes} alt="" decoding="async" onError={() => setFailed(true)} />;
}

/** A wide photo link at the foot of a home page */
export function Banner({ img, title, sub, onClick, href }: { img: string; title: string; sub: string; onClick?: () => void; href?: string }) {
  const body = <><HeroImage name={img} sizes="(max-width: 760px) 100vw, 34vw" /><span className="lib-banner-copy"><b>{title}</b><small>{sub}</small></span>
    <span className="lib-banner-play" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 4l13 8-13 8z" fill="currentColor" /></svg></span></>;
  return href ? <a className="lib-banner" href={href}>{body}</a> : <button className="lib-banner" onClick={onClick}>{body}</button>;
}

/** Which render each page uses. Most modules have their own (the line-placement and drug-mechanism scenes have
 * no clean backdrop, so those pages keep their colour); paths, audio and the banners borrow one. */
export const PATH_HERO: Record<string, string> = { fpc: 'vent-foundations', 'vent-mastery': 'vent-ards', shock: 'peds-newborn', 'peds-ob': 'ob-pregnancy' };
export const AUDIO_HERO = 'cardiac-mi';
/** Listening-track posters borrow the module still that shows the same body system (none where nothing fits). */
export const TRACK_ART: Record<string, string> = {
  foundations: 'gas-basics', respiratory: 'vent-foundations', hemodynamics: 'lines-shock', cardiac: 'cardiac-mi', neuro: 'neuro-stroke',
  'renal-metabolic': 'gas-dka', infectious: 'lines-cvp', hematology: 'gas-bleeding', pharmacology: 'pharm-moa', 'imaging-monitoring': 'lines-artline',
  procedures: 'lines-devices', 'gi-hepatic': 'abd-gut', endocrine: 'gas-lytes', 'trauma-burns': 'abd-fast', obstetric: 'ob-pregnancy', 'peds-neonatal': 'peds-newborn',
  multisystem: 'lines-bleed',
};
