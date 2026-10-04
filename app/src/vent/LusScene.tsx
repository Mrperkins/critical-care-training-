/** Lung ultrasound of the ventilated patient: four probe zones (B-mode, animated), M-mode of the chosen zone, reading, and real clips. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { session } from './session';
import { lusFromVent, lusSummary, lusScene, renderMmode, LUS_ZONES, LUS_W, LUS_D, type LusZone, type LusZoneId } from './lus';
import { renderLinear } from '../scene/ultrasound/bmode';
import { StateRealReference } from '../scene/imaging/StateRealReference';
import { selectLusReal } from './realReference';
import { IS_PHONE } from '../scene/Studio';
import { useHideFindings } from '../challenge/caseStore';
import { create } from 'zustand';
/** selected probe zone (lessons can point the probe) */
export const useLusUI = create<{ zone: LusZoneId; set: (z: LusZoneId) => void }>((set) => ({ zone: 'R-ant', set: (zone) => set({ zone }) }));

function useZones() {
  const key = (zs: LusZone[]) => JSON.stringify(zs);
  const [k, setK] = useState(() => key(lusFromVent(session)));
  useEffect(() => { const id = setInterval(() => { const n = key(lusFromVent(session)); setK((o) => (o === n ? o : n)); }, 700); return () => clearInterval(id); }, []);
  return useMemo(() => JSON.parse(k) as LusZone[], [k]);
}
function draw(c: HTMLCanvasElement | null, img: { rgba: Uint8ClampedArray; w: number; h: number }) { if (!c) return; if (c.width !== img.w) { c.width = img.w; c.height = img.h; } const ctx = c.getContext('2d')!; const d = ctx.createImageData(img.w, img.h); d.data.set(img.rgba); ctx.putImageData(d, 0, 0); }

function Zone({ z, on, pick, hide }: { z: LusZone; on: boolean; pick: () => void; hide: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null); const size = IS_PHONE ? 110 : 150;
  useEffect(() => {
    let raf = 0, last = 0; const t0 = performance.now(); const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const every = reduce ? 1e9 : on ? 140 : 700; // the zone being read animates smoothly; the other three tick slowly (each frame costs ~10–20 ms)
    const f = (now: number) => { if (now - last > every) { last = now; draw(ref.current, renderLinear(lusScene(z, (now - t0) / 1000), LUS_W, LUS_D, size)); } raf = requestAnimationFrame(f); };
    draw(ref.current, renderLinear(lusScene(z, 0), LUS_W, LUS_D, size)); raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [z, size, on]);
  const name = LUS_ZONES.find((x) => x.id === z.id)!.name;
  return (
    <button className={`lus-zone${on ? ' on' : ''}`} onClick={pick} aria-pressed={on} aria-label={hide ? name : `${name}: ${z.pattern}`}>
      <canvas ref={ref} />
      <span className="lus-name">{name}</span>
      {!hide && <span className={`lus-tag ${z.sliding ? 'ok' : 'bad'}`}>{z.sliding ? 'sliding' : z.lungPulse ? 'lung pulse' : 'no sliding'}{z.bLines >= 3 ? ` · ${z.white ? 'white lung' : `${z.bLines} B-lines`}` : ''}{z.lungPoint ? ' · lung point' : ''}</span>}
    </button>
  );
}

export function LusScene() {
  const hide = useHideFindings(); const zs = useZones(); const sel = useLusUI((s) => s.zone); const setSel = useLusUI.getState().set; const z = zs.find((x) => x.id === sel)!; const real = hide ? null : selectLusReal(z); const mref = useRef<HTMLCanvasElement>(null);
  useEffect(() => draw(mref.current, renderMmode(z, 220, 150)), [z]);
  return (
    <div className="imaging lus-view">
      <div className="lus-grid">{zs.map((x) => <Zone key={x.id} z={x} on={x.id === sel} pick={() => setSel(x.id)} hide={hide} />)}</div>
      <div className="lus-side">
        <figure className="img-panel lus-m"><canvas ref={mref} aria-label={hide ? 'M-mode' : `M-mode, ${z.mmode}`} /><figcaption>M-mode{hide ? '' : ` · ${z.mmode}`}</figcaption></figure>
        <section className="cxr-find"><h4>{LUS_ZONES.find((x) => x.id === sel)!.name}</h4>{hide ? <p className="muted small">Reading hidden while you answer — tap each zone and watch the pleural line and the M-mode.</p> : <><p className="small">{z.pattern}.</p><h4>Reading</h4><ul>{lusSummary(zs).map((l) => <li key={l}>{l}</li>)}</ul></>}</section>
      </div>
      <StateRealReference match={real} />
      <div className="img-bar"><p className="img-note">Synthetic lung ultrasound drawn from the ventilator model’s selected zone (linear probe, 4 × 6 cm). The real clip above, when present, is selected to match that zone’s current finding and comes from a different patient.</p></div>
    </div>
  );
}
