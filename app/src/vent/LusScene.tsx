/** Lung ultrasound of the ventilated patient: four probe zones (B-mode, animated), M-mode of the chosen zone, reading, and real clips. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { session } from './session';
import { lusFromVent, lusSummary, lusScene, renderMmode, LUS_ZONES, LUS_W, LUS_D, type LusZone, type LusZoneId } from './lus';
import { renderLinear } from '../scene/ultrasound/bmode';
import { RealExamples } from '../scene/imaging/RealExamples';
import { IS_PHONE } from '../scene/Studio';

function useZones() {
  const key = (zs: LusZone[]) => JSON.stringify(zs);
  const [k, setK] = useState(() => key(lusFromVent(session)));
  useEffect(() => { const id = setInterval(() => { const n = key(lusFromVent(session)); setK((o) => (o === n ? o : n)); }, 700); return () => clearInterval(id); }, []);
  return useMemo(() => JSON.parse(k) as LusZone[], [k]);
}
function draw(c: HTMLCanvasElement | null, img: { rgba: Uint8ClampedArray; w: number; h: number }) { if (!c) return; if (c.width !== img.w) { c.width = img.w; c.height = img.h; } const ctx = c.getContext('2d')!; const d = ctx.createImageData(img.w, img.h); d.data.set(img.rgba); ctx.putImageData(d, 0, 0); }

function Zone({ z, on, pick }: { z: LusZone; on: boolean; pick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null); const size = IS_PHONE ? 110 : 150;
  useEffect(() => {
    let raf = 0, last = 0; const t0 = performance.now(); const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const f = (now: number) => { if (now - last > (reduce ? 1e9 : 140)) { last = now; draw(ref.current, renderLinear(lusScene(z, (now - t0) / 1000), LUS_W, LUS_D, size)); } raf = requestAnimationFrame(f); };
    draw(ref.current, renderLinear(lusScene(z, 0), LUS_W, LUS_D, size)); raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf);
  }, [z, size]);
  const name = LUS_ZONES.find((x) => x.id === z.id)!.name;
  return (
    <button className={`lus-zone${on ? ' on' : ''}`} onClick={pick} aria-pressed={on} aria-label={`${name}: ${z.pattern}`}>
      <canvas ref={ref} />
      <span className="lus-name">{name}</span>
      <span className={`lus-tag ${z.sliding ? 'ok' : 'bad'}`}>{z.sliding ? 'sliding' : z.lungPulse ? 'lung pulse' : 'no sliding'}{z.bLines >= 3 ? ` · ${z.white ? 'white lung' : `${z.bLines} B-lines`}` : ''}{z.lungPoint ? ' · lung point' : ''}</span>
    </button>
  );
}

export function LusScene() {
  const zs = useZones(); const [sel, setSel] = useState<LusZoneId>('R-ant'); const z = zs.find((x) => x.id === sel)!; const mref = useRef<HTMLCanvasElement>(null);
  useEffect(() => draw(mref.current, renderMmode(z, 220, 150)), [z]);
  return (
    <div className="imaging lus-view">
      <div className="lus-grid">{zs.map((x) => <Zone key={x.id} z={x} on={x.id === sel} pick={() => setSel(x.id)} />)}</div>
      <div className="lus-side">
        <figure className="img-panel lus-m"><canvas ref={mref} aria-label={`M-mode, ${z.mmode}`} /><figcaption>M-mode · {z.mmode}</figcaption></figure>
        <section className="cxr-find"><h4>{LUS_ZONES.find((x) => x.id === sel)!.name}</h4><p className="small">{z.pattern}.</p><h4>Reading</h4><ul>{lusSummary(zs).map((l) => <li key={l}>{l}</li>)}</ul></section>
      </div>
      <RealExamples kind="lus" title="Real lung ultrasound" />
      <div className="img-bar"><p className="img-note">Synthetic lung ultrasound drawn from the ventilator model’s state (linear probe, 4 × 6 cm). Patterns follow standard lung-ultrasound teaching; not patient images except the labelled real clips.</p></div>
    </div>
  );
}
