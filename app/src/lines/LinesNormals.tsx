/** Reference values for invasive pressure monitoring, with the live patient's value where it can be measured. */
import { useUI } from '../app/store';
import { lines } from './session';

type Row = { label: string; normal: string; unit: string; note?: string; live?: () => number | null; band?: [number | null, number | null]; digits?: number };
export const LINES_NORMALS: { title: string; blurb?: string; rows: Row[] }[] = [
  { title: 'Arterial pressure', blurb: 'Radial arterial line in an adult. Treat the MAP: it is the least affected by damping and by where the catheter sits.', rows: [
    { label: 'Systolic', normal: '90–140', unit: 'mmHg', note: 'Radial systolic runs a few to 15 mmHg higher than central aortic (peripheral amplification; less in the elderly).', live: () => lines.num.sys, band: [90, 140] },
    { label: 'Diastolic', normal: '60–90', unit: 'mmHg', live: () => lines.num.dia, band: [60, 90] },
    { label: 'Mean arterial pressure', normal: '70–105 (target ≥ 65)', unit: 'mmHg', note: '≈ diastolic + ⅓ pulse pressure; the monitor integrates the waveform.', live: () => lines.num.map, band: [65, 105] },
    { label: 'Pulse pressure', normal: '30–60', unit: 'mmHg', note: 'Narrow: low stroke volume, tamponade, AS. Wide: AR, stiff arteries, sepsis, heart block.', live: () => lines.num.pp, band: [30, 60] },
    { label: 'Pulse-pressure variation', normal: '< 9 (grey zone 9–13, > 13 = fluid-responsive)', unit: '%', note: 'Valid only with controlled ventilation ≥ 8 mL/kg, no spontaneous effort, sinus rhythm, closed chest, HR/RR > 3.6, compliance > 30 mL/cmH₂O, no RV failure or intra-abdominal hypertension.', live: () => lines.num.ppv, band: [null, 13] },
    { label: 'Systolic fall on inspiration (spontaneous)', normal: '< 10', unit: 'mmHg', note: '> 10 = pulsus paradoxus: tamponade, severe asthma/COPD, massive PE.', live: () => (lines.resp.mode === 'spont' ? lines.num.spv : null), band: [null, 10] },
  ] },
  { title: 'Central venous pressure', blurb: 'Read at end-expiration, at the base of the c wave (or the mean of the a wave).', rows: [
    { label: 'CVP', normal: '2–8', unit: 'mmHg', note: 'A single value says little about fluid responsiveness; trends and the waveform say more.', live: () => lines.num.cvpEE, band: [2, 8], digits: 1 },
    { label: 'Conversion', normal: '1 mmHg = 1.36 cmH₂O', unit: '', note: 'A water manometer reads 1.36 × higher numbers than the transducer.' },
    { label: 'Waves', normal: 'a · c · x · v · y', unit: '', note: 'a after P (atrial kick) · c at QRS (tricuspid bulge) · x (atrial relaxation) · v after T (atrial filling) · y (tricuspid opens).' },
  ] },
  { title: 'The monitoring system', rows: [
    { label: 'Reference level', normal: 'Phlebostatic axis', unit: '', note: '4th intercostal space, mid-axillary line (≈ right atrium). Valid with the head of the bed 0–60°.' },
    { label: 'Level error', normal: '0.74 per cm', unit: 'mmHg', note: 'Transducer below the axis → reads high; above → reads low.', live: () => lines.hydro(), band: [-1, 1], digits: 1 },
    { label: 'Pressure bag', normal: '300', unit: 'mmHg', note: 'Continuous flush ≈ 3 mL/h. A soft bag lets blood back up and damps the trace.', live: () => lines.art.bag, band: [280, null] },
    { label: 'Fast-flush (square-wave) test', normal: '1.5–2 oscillations', unit: '', note: '> 2: underdamped (SBP high, DBP low). < 1.5: overdamped (SBP low, DBP high). MAP holds.' },
    { label: 'Natural frequency', normal: '> 15–20', unit: 'Hz', note: 'Long compliant tubing, many stopcocks and small bubbles lower it.' },
    { label: 'Damping coefficient ζ', normal: '≈ 0.4–0.7', unit: '', note: 'The lower the natural frequency, the higher ζ must be to avoid overshoot.' },
    { label: 'Zeroing', normal: 'Open to air at the axis', unit: '', note: 'At set-up, after disconnecting the transducer or cable, when values are doubtful, and per policy. Re-LEVEL (not re-zero) after any move of the patient or transducer.' },
  ] },
];

export function LinesNormals() {
  useUI((s) => s.pulse);
  return (
    <div className="normals">
      <p className="muted small">Typical adult values; local protocols differ. The right-hand column is the simulated patient right now, as the monitor measures it.</p>
      {LINES_NORMALS.map((g) => (
        <section key={g.title} className="card">
          <h3 className="nm-h">{g.title}</h3>{g.blurb && <p className="muted small nm-b">{g.blurb}</p>}
          <div className="nm-table" role="table">
            {g.rows.map((r) => { const v = r.live?.(); const f = v == null || !r.band ? 'none' : r.band[0] != null && v < r.band[0] ? 'low' : r.band[1] != null && v > r.band[1] ? 'high' : 'ok';
              return (<div key={r.label} className="nm-row" role="row">
                <div className="nm-l"><b>{r.label}</b>{r.note && <span>{r.note}</span>}</div>
                <div className="nm-n">{r.normal}<small>{r.unit}</small></div>
                <div className={`nm-v f-${f}`}>{v == null ? '—' : v.toFixed(r.digits ?? 0)}{f !== 'none' && <small>{f === 'ok' ? 'in range' : f}</small>}</div>
              </div>); })}
          </div>
        </section>
      ))}
    </div>
  );
}
