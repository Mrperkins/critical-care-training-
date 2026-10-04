/** Synthetic FAST: four windows + a transverse aorta, drawn from the current abdominal state, with a probe map. */
import { useEffect, useMemo, useRef } from 'react';
import { useAbdUI, currentAbdomen } from './abdomenStore';
import { renderUs, US_WINDOWS, US_LABELS, usUV, type UsWindow } from './ultrasound';
import { IS_PHONE } from '../scene/Studio';
import type { AbdomenState } from './state';
import { useHideFindings } from '../challenge/caseStore';
import { RealCase } from '../scene/imaging/RealCase';
import { useSceneLabelMode } from '../scene/labels';

function UsPanel({ win, st }: { win: UsWindow; st: AbdomenState }) {
  const ref = useRef<HTMLCanvasElement>(null); const meta = US_WINDOWS.find((w) => w.id === win)!;
  const img = useMemo(() => renderUs(win, st, IS_PHONE ? 180 : 260), [win, st]);
  useEffect(() => { const c = ref.current; if (!c) return; c.width = img.w; c.height = img.h; const ctx = c.getContext('2d')!; const d = ctx.createImageData(img.w, img.h); d.data.set(img.rgba); ctx.putImageData(d, 0, 0); }, [img]);
  const labelMode = useSceneLabelMode(); const hide = useHideFindings(); const coronal = meta.plane.startsWith('coronal'); const show = img.fluidPx > 0 && !hide;
  return (
    <figure className="img-panel us-panel">
      <div className="us-frame" style={{ aspectRatio: `${img.w} / ${img.h}` }}>
        <canvas ref={ref} aria-label={meta.name} />
        {labelMode !== 'off' && US_LABELS[win].filter((l) => (l.fluid ? show : !IS_PHONE)).map((l) => { const p = usUV(win, l.x, l.z); return <span key={l.t} className={`us-lab${l.fluid ? ' fl' : ''}`} style={{ left: `${p.u * 100}%`, top: `${p.v * 100}%` }}>{l.t}</span>; })}
        {!IS_PHONE && <><span className="us-orient">{coronal ? '◀ head' : 'R · L'}</span><span className="us-depth">{img.depthCm} cm</span></>}
      </div>
      <figcaption>{IS_PHONE ? meta.short : meta.name}</figcaption>
      {hide ? null : meta.fast ? <span className={`badge us-badge ${img.positive ? 'bad' : 'ok'}`}>{img.positive ? (IS_PHONE ? `${Math.round(img.stripeMm)} mm` : `Fluid · ${Math.round(img.stripeMm)} mm`) : IS_PHONE ? '−' : 'Negative'}</span>
        : <span className="badge us-badge">{st.aaa.diameterCm.toFixed(1)} cm{st.aaa.diameterCm >= 3 ? ' · AAA' : ''}</span>}
    </figure>
  );
}
const PROBE: Record<UsWindow, [number, number]> = { ruq: [30, 92], luq: [92, 78], pelvis: [60, 168], pericardial: [60, 58], aorta: [60, 100] };
function ProbeMap({ st }: { st: AbdomenState }) {
  const hide = useHideFindings();
  const imgs = useMemo(() => Object.fromEntries(US_WINDOWS.map((w) => [w.id, renderUs(w.id, st, 16)])) as Record<UsWindow, ReturnType<typeof renderUs>>, [st]);
  return (
    <figure className="img-panel us-map">
      <svg viewBox="0 0 120 190" role="img" aria-label="Probe positions">
        <path d="M34 16 Q60 4 86 16 L96 60 Q102 100 94 140 L88 178 L32 178 L26 140 Q18 100 24 60 Z" fill="none" stroke="rgba(222,235,241,.35)" strokeWidth="1.4" />
        <path d="M36 52 Q60 70 84 52" fill="none" stroke="rgba(222,235,241,.2)" />
        {US_WINDOWS.map((w) => { const [x, y] = PROBE[w.id]; const pos = !hide && w.fast && imgs[w.id].positive; return <g key={w.id}><rect x={x - 6} y={y - 2.5} width={12} height={5} rx={2} fill={pos ? '#e0645a' : w.fast ? '#7fc4d8' : '#d4b36a'} /><text x={x} y={y + 11} textAnchor="middle" fontSize="5.5" fill="rgba(222,235,241,.8)">{w.id === 'pericardial' ? 'subxiphoid' : w.id.toUpperCase()}</text></g>; })}
        <text x="6" y="12" fontSize="7" fill="rgba(222,235,241,.6)">R</text><text x="108" y="12" fontSize="7" fill="rgba(222,235,241,.6)">L</text>
      </svg>
      <figcaption>Probe positions</figcaption>
    </figure>
  );
}
export function UltrasoundScene() {
  const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes); const st = useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]); const hide = useHideFindings();
  return (
    <div className="imaging us-view">
      <div className="img-grid us-grid">{US_WINDOWS.map((w) => <UsPanel key={w.id} win={w.id} st={st} />)}<ProbeMap st={st} /></div>
      {!hide && <div className="rc-pair"><RealCase kind="fast" title="Real positive FAST" /><RealCase kind="tamponade" title="Real tamponade (pericardial window)" /><RealCase kind="ivc" title="Real IVC scans" /></div>}
      <div className="img-bar"><p className="img-note">Synthetic teaching ultrasound generated from the model state — not patient scans. Free fluid is black (anechoic); FAST sees only intraperitoneal and pericardial fluid, never the retroperitoneum.</p></div>
    </div>
  );
}
