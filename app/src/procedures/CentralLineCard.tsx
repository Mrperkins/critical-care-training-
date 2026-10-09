/**
 * Ultrasound-guided IJ trainer: the model works out where the needle tip really is (and what the screen would show,
 * the flash and the transduced pressure from the Lines patient); the ultrasound on screen is the real scan matching
 * that moment, and the depth chart plots true tip depth against the vessels.
 */
import { useEffect, useState } from 'react';
import { Knob } from '../vent/VentPanel';
import { useUI } from '../app/store';
import { RealStudy } from '../scene/imaging/RealStudy';
import { clState, vesselCheck, type ClInput } from './centralLine';
import { useCl, setCl, clPatient } from './clStore';

const TIP: Record<string, string> = { tissue: 'soft tissue', scm: 'sternocleidomastoid', ijWall: 'tenting the front wall of the IJ', ij: 'IJ lumen', ijBackWall: 'through the back wall of the IJ', carotid: 'CAROTID ARTERY', deep: 'deep to the vessels' };

function usePhase() { const [p, setP] = useState(0); useEffect(() => { let raf = 0, last = 0; const t0 = performance.now(); const f = (now: number) => { if (now - last > 110) { last = now; setP((((now - t0) / 1000) * 1.3) % 1); } raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, []); return p; }

/** Which real IJ scan matches this moment (none for a wrong-vessel or through-and-through tip). */
export function ijKey(input: ClInput, st: ReturnType<typeof clState>, wire: 'none' | 'inVein' | 'inArtery'): string {
  if (wire === 'inArtery' || (['carotid', 'ijBackWall', 'deep'].includes(st.tipIn) && input.advance > 0)) return 'ij_wrong_vessel';
  if (wire === 'inVein') return 'ij_needle';
  if (input.advance > 0.2 && st.shownZ != null) return 'ij_needle';
  if (input.axis === 'long') return input.compress > 0.5 ? 'ij_collapse' : 'ij_long_axis';
  if (input.compress > 0.5) return 'ij_compression';
  return 'ij_carotid';
}

export function CentralLineCard() {
  useUI((s) => s.pulse);
  const { input, wire } = useCl(); const phase = usePhase(); const c: ClInput = { ...input, phase };
  const st = clState(c);
  const chk = vesselCheck(st.flash, clPatient()); const key = ijKey(input, st, wire);
  // side (sagittal) view: probe plane, needle from the skin entry to the TRUE tip, the crossing point the screen shows
  const ijHalf = st.anat.ij.rz * Math.sqrt(Math.max(0, 1 - ((input.aimX - st.anat.ij.x) / st.anat.ij.rx) ** 2)); const caHalf = Math.sqrt(Math.max(0, st.anat.ca.r ** 2 - (input.aimX - st.anat.ca.x) ** 2));
  const SW = 220, SH = 150, sx = (y: number) => 110 + y * 36, sz = (z: number) => 14 + z * 30; const n = st.ndl;
  const pick = <T extends string>(label: string, cur: T, opts: [T, string][], on: (v: T) => void) => (
    <div className="nd-row"><span className="muted small">{label}</span><div className="chips">{opts.map(([k, l]) => <button key={k} className={`chip${cur === k ? ' on' : ''}`} onClick={() => on(k)}>{l}</button>)}</div></div>);
  return (
    <section className="card cline">
      <div className="card-h"><h3>Ultrasound-guided right IJ</h3><span className="muted small">{input.axis === 'short' ? 'short axis' : 'long axis'} · {input.plane === 'out' ? 'out-of-plane' : 'in-plane'}</span></div>
      <div className="cl-views">
        <RealStudy kinds={['ijv']} want={[key]} required={[key]} label="IJ ultrasound"
          reading={[`Tip in ${TIP[st.tipIn]}.`, st.shownZ == null ? 'Screen: no needle in the beam.' : st.seesTip ? 'Screen shows the tip.' : `Screen shows the shaft; the real tip is ${(st.trueZ - st.shownZ).toFixed(1)} cm deeper.`, input.axis === 'short' ? 'Short axis: IJ lateral, carotid medial and deeper.' : 'Long axis along the IJ.']}
          missing={key === 'ij_wrong_vessel' ? 'No real scan of this complication is shown on purpose: the tip is outside the vein. Withdraw to the skin and re-aim.' : undefined} />
        <svg viewBox={`0 0 ${SW} ${SH}`} className="dr-svg cl-side" role="img" aria-label="Depth chart: true needle tip depth against the vein and artery">
          <line x1={0} x2={SW} y1={sz(0)} y2={sz(0)} className="nd-scale" /><text x={4} y={sz(0) - 3} className="dr-lab">skin</text>
          {ijHalf > 0.02 && <><rect x={0} y={sz(st.anat.ij.z - ijHalf)} width={SW} height={2 * ijHalf * 30} className="cl-vein" /><text x={SW - 4} y={sz(st.anat.ij.z) + 3} className="dr-lab" textAnchor="end">IJ</text></>}
          {caHalf > 0.02 && <><rect x={0} y={sz(st.anat.ca.z - caHalf)} width={SW} height={2 * caHalf * 30} className="cl-art" /><text x={SW - 4} y={sz(st.anat.ca.z) + 3} className="dr-lab" textAnchor="end">carotid</text></>}
          <rect x={sx(n.plane) - 3} y={2} width={6} height={12} className="cl-probe" /><line x1={sx(n.plane)} x2={sx(n.plane)} y1={sz(0)} y2={SH} className="cl-beam" />
          <line x1={sx(-input.entry)} y1={sz(0)} x2={sx(n.tip.y)} y2={sz(n.tip.z)} className="nd-needle" /><circle cx={sx(n.tip.y)} cy={sz(n.tip.z)} r={3.5} className={`nd-tip ${st.tipIn === 'ij' ? 'decompressed' : st.tipIn === 'carotid' || st.tipIn === 'ijBackWall' || st.tipIn === 'deep' ? 'short' : ''}`} />
          {st.shownZ != null && <circle cx={sx(n.plane)} cy={sz(st.shownZ)} r={5} className="cl-shown" />}
          <text x={4} y={SH - 5} className="dr-lab">depth chart · ● true tip · ○ what the screen shows</text>
        </svg>
      </div>
      <div className="ln-flush">
        <div><span>Tip</span><b className={st.tipIn === 'ij' ? 'ok' : st.tipIn === 'carotid' || st.tipIn === 'ijBackWall' ? 'bad' : ''}>{TIP[st.tipIn]}</b></div>
        <div><span>Screen shows</span><b className={st.seesTip ? 'ok' : 'bad'}>{st.shownZ == null ? 'no needle' : st.seesTip ? 'the tip' : `shaft (tip ${(st.trueZ - st.shownZ).toFixed(1)} cm deeper)`}</b></div>
        <div><span>Flash</span><b className={st.flash === 'arterial' ? 'bad' : st.flash === 'venous' ? 'ok' : ''}>{chk ? `${chk.colour}${chk.pulsatile ? ', pulsatile' : ''}` : '—'}</b></div>
        <div><span>Transduced</span><b className={chk?.wave === 'arterial' ? 'bad' : ''}>{chk ? `${chk.pressure} mmHg · ${chk.wave}` : '—'}</b></div>
      </div>
      {st.tenting && <p className="explain bad">The needle is pushing the front wall in — a soft, under-filled vein collapses ahead of the tip and both walls can be pierced. Tilt head-down, fill the vein, a short controlled advance.</p>}
      {chk?.colourMisleading && <p className="explain bad">Colour is misleading here ({chk.colour}). Pulsatility and a transduced pressure ({chk.pressure} mmHg, {chk.wave} waveform) are what identify the vessel.</p>}
      {pick<'short' | 'long'>('View', input.axis, [['short', 'Short axis'], ['long', 'Long axis']], (v) => setCl({ axis: v, plane: v === 'long' ? 'in' : 'out' }))}
      {pick<'out' | 'in'>('Needle', input.plane, [['out', 'Out-of-plane'], ['in', 'In-plane']], (v) => setCl({ plane: v }))}
      <div className="chips">
        <button className={`chip${input.track ? ' on' : ''}`} aria-pressed={input.track} onClick={() => setCl({ track: !input.track })}>Slide the probe with the tip</button>
        <button className={`chip${input.trendelenburg ? ' on' : ''}`} aria-pressed={input.trendelenburg} onClick={() => setCl({ trendelenburg: !input.trendelenburg })}>Head-down tilt</button>
        {([[0.5, 'Hypovolaemic'], [1, 'Normal'], [1.3, 'Full']] as const).map(([v, l]) => <button key={l} className={`chip${input.volume === v ? ' on' : ''}`} onClick={() => setCl({ volume: v })}>{l}</button>)}
        <button className={`chip${input.variant === 'overlying' ? ' on' : ''}`} aria-pressed={input.variant === 'overlying'} onClick={() => setCl({ variant: input.variant === 'overlying' ? 'lateral' : 'overlying' })}>IJ over the carotid</button>
      </div>
      <Knob label="Probe pressure" value={Math.round(input.compress * 100)} min={0} max={100} step={5} unit=" %" onChange={(v) => setCl({ compress: v / 100 })} hint="The vein collapses; the artery stays round and pulses" />
      <Knob label="Aim (lateral − / medial +)" value={input.aimX} min={-1.6} max={1.6} step={0.05} unit=" cm" onChange={(v) => setCl({ aimX: v })} hint="Centre of the IJ in this view" />
      <Knob label="Needle angle to skin" value={input.angle} min={20} max={70} step={5} unit="°" onChange={(v) => setCl({ angle: v })} />
      <Knob label="Advance" value={input.advance} min={0} max={5} step={0.1} unit=" cm" onChange={(v) => setCl({ advance: v })} />
      <p className="muted small" style={{ marginTop: 6 }}>Real scans from different patients illustrate each step; distances in the model are illustrative. Follow your institution’s procedure and supervision requirements.</p>
    </section>
  );
}
