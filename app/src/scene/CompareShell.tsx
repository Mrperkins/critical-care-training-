/**
 * The NORMAL | ABNORMAL split around a module's scene (see compare.tsx). In 3D mode the module's twin scene sits
 * to the left of the live scene, sized to match it. In "Images & video" mode both halves show a real normal and
 * abnormal study from the imaging library (loops play side by side, in step).
 */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { loadImagingStudies, sourceFor } from '../library/imaging/catalog';
import type { RealItem } from './imaging/RealExamples';
import { resetCameraLink, SceneSlot, TwinProvider, useCompare, type TwinState } from './compare';

export interface MediaPair { normal: string; abnormal: string; label: string; /** scenario ids this pair illustrates best (listed first) */ tags?: string[] }
export interface CompareSpec {
  /** the module's own scene, drawn with `state` as its healthy disease state */
  twin?: ReactNode; state?: TwinState;
  /** what the abnormal side is showing ("Large VSD", "Left M1 occlusion") */
  finding: string; normalLabel?: string;
  /** real studies: normal on the left, abnormal on the right */
  media?: MediaPair[];
  /** the patient is currently normal: say so instead of comparing two identical scenes */
  healthy?: boolean;
  /** the scenario on screen: pairs tagged with it come first */
  prefer?: string;
}

let studies: Promise<Map<string, RealItem>> | null = null;
const loadStudies = () => (studies ??= loadImagingStudies().then((all) => new Map(all.map((i) => [i.id, i]))).catch(() => new Map()));
const isVideo = (it: RealItem) => /\.(mp4|webm|ogv)$/i.test(it.file);
function Media({ it, sync }: { it: RealItem; sync: React.MutableRefObject<HTMLVideoElement[]> }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => { const el = v.current; if (!el) return; sync.current.push(el); return () => { sync.current = sync.current.filter((x) => x !== el); }; }, [sync]);
  if (isVideo(it)) return <video ref={v} poster={it.poster ? sourceFor(it.poster) : undefined} muted loop autoPlay playsInline preload="metadata" aria-label={it.caption}>
    {it.webm && <source src={sourceFor(it.webm)} type="video/webm" />}<source src={sourceFor(it.file)} />
  </video>;
  return <img src={sourceFor(it.file)} alt={it.caption} loading="lazy" />;
}

function MediaCompare({ spec, bar }: { spec: CompareSpec; bar?: ReactNode }) {
  const pair = useCompare((s) => s.pair); const set = useCompare((s) => s.set);
  const [map, setMap] = useState<Map<string, RealItem> | null>(null);
  useEffect(() => { let on = true; loadStudies().then((m) => on && setMap(m)); return () => { on = false; }; }, []);
  const sync = useRef<HTMLVideoElement[]>([]);
  const pairs = (spec.media ?? []).filter((p) => !map || (map.has(p.normal) && map.has(p.abnormal)))
    .map((p, i) => ({ p, k: (spec.prefer && p.tags?.includes(spec.prefer) ? 0 : 1) * 1000 + i })).sort((a, b) => a.k - b.k).map((x) => x.p);
  const cur = pairs[Math.min(pair, pairs.length - 1)];
  const n = cur && map?.get(cur.normal); const a = cur && map?.get(cur.abnormal);
  const restart = () => sync.current.forEach((el) => { el.currentTime = 0; void el.play().catch(() => undefined); });
  if (!map) return <div className="cmp-media">{bar}<p className="cmp-empty">Loading the image library…</p></div>;
  if (!cur || !n || !a) return <div className="cmp-media">{bar}<p className="cmp-empty">No matched normal and abnormal studies for this topic yet.</p></div>;
  return <div className="cmp-media">{bar}
    <figure className="cmp-fig normal"><Media key={n.id} it={n} sync={sync} /><figcaption><b>NORMAL</b><span>{n.title}</span></figcaption></figure>
    <figure className="cmp-fig abnormal"><Media key={a.id} it={a} sync={sync} /><figcaption><b>ABNORMAL</b><span>{a.title}</span></figcaption></figure>
    <div className="cmp-media-bar">
      {pairs.length > 1 && <select aria-label="Which comparison" value={Math.min(pair, pairs.length - 1)} onChange={(e) => set({ pair: Number(e.target.value) })}>{pairs.map((p, i) => <option key={i} value={i}>{p.label}</option>)}</select>}
      {(isVideo(n) || isVideo(a)) && <button type="button" onClick={restart}>↻ Sync loops</button>}
      <small>{[n, a].map((x) => `${x.author} · ${x.license}`).join('  |  ')}</small>
    </div>
  </div>;
}

/** Wraps SceneWrap's own box: renders the twin beside it and the compare controls over it. */
export function useCompareShell(spec: CompareSpec | undefined, wrap: React.RefObject<HTMLDivElement>) {
  const on = useCompare((s) => s.on) && !!spec; const view = useCompare((s) => s.view); const set = useCompare((s) => s.set);
  const hasModel = !!spec?.twin; const hasMedia = (spec?.media?.length ?? 0) > 0;
  const mode = !hasModel ? 'media' : !hasMedia ? 'model' : view;
  useEffect(() => { if (on) resetCameraLink(); }, [on]);
  useEffect(() => { if (!spec) return; useCompare.getState().set({ available: true }); return () => useCompare.getState().set({ available: false, on: false }); }, [!!spec]); // eslint-disable-line react-hooks/exhaustive-deps
  const twinBox = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!on || mode !== 'model') return;
    const w = wrap.current; const t = twinBox.current; if (!w || !t) return;
    const fit = () => { t.style.left = `${w.offsetLeft - w.offsetWidth}px`; t.style.top = `${w.offsetTop}px`; t.style.width = `${w.offsetWidth}px`; t.style.height = `${w.offsetHeight}px`; };
    fit(); const ro = new ResizeObserver(fit); ro.observe(w); if (w.parentElement) ro.observe(w.parentElement);
    window.dispatchEvent(new Event('resize'));
    return () => { ro.disconnect(); window.dispatchEvent(new Event('resize')); };
  }, [on, mode, wrap]);
  const cls = on ? (mode === 'model' ? ' cmp-on cmp-model' : ' cmp-on cmp-mediamode') : '';
  const twin = on && mode === 'model' && spec ? <div ref={twinBox} className="cmp-twin" aria-label={`Normal ${spec.normalLabel ?? ''} for comparison`}>
    <SceneSlot value="twin"><TwinProvider state={spec.state ?? {}}>{spec.twin}</TwinProvider></SceneSlot>
    <div className="cmp-tag normal"><b>NORMAL</b>{spec.normalLabel && <span>{spec.normalLabel}</span>}</div>
  </div> : null;
  const bar = <div className="cmp-bar" role="toolbar" aria-label="Compare with normal">
    {hasModel && hasMedia && <div className="cmp-seg" role="group" aria-label="Compare what">
      <button type="button" aria-pressed={mode === 'model'} onClick={() => set({ view: 'model' })}><span className="cmp-l">3D model</span><span className="cmp-s">3D</span></button>
      <button type="button" aria-pressed={mode === 'media'} onClick={() => set({ view: 'media' })}><span className="cmp-l">Images &amp; video</span><span className="cmp-s">Real</span></button>
    </div>}
    <button type="button" className="cmp-x" onClick={() => set({ on: false })} aria-label="Stop comparing">✕</button>
  </div>;
  // on a phone the real studies get the whole screen (the scene there is only a strip)
  const phone = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;
  const overlay = on && spec ? <>
    {mode === 'model' && <div className="cmp-tag abnormal"><b>{spec.healthy ? 'THIS PATIENT' : 'ABNORMAL'}</b><span>{spec.healthy ? 'currently normal — pick a condition to compare' : spec.finding}</span></div>}
    {mode === 'media' && (phone ? createPortal(<div className="cmp-sheet"><MediaCompare spec={spec} bar={bar} /></div>, document.body) : <MediaCompare spec={spec} />)}
    {!(mode === 'media' && phone) && bar}
  </> : null;
  return { cls, twin, overlay, on };
}

/** The scene toolbar button (also shown in the player's top bar). */
export function CompareButton({ className = 'st-btn st-cmp' }: { className?: string }) {
  const on = useCompare((s) => s.on); const set = useCompare((s) => s.set);
  return <button type="button" className={`${className}${on ? ' on' : ''}`} aria-pressed={on} onClick={() => set({ on: !on, pair: 0 })} title="Compare with normal, side by side">
    <span className="st-ico" aria-hidden="true"><svg className="st-svg" viewBox="0 0 20 20" width="18" height="18"><path d="M3 4h6v12H3zM11 4h6v12h-6z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg></span><span className="st-txt">{on ? 'Comparing' : 'Compare normal'}</span>
  </button>;
}
