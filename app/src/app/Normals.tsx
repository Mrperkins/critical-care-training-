/** "Normal values" reference cards for the Learn mode: each row shows the range, a note, and the simulated patient's current value flagged against it. */
import { useUI } from './store';
import { session } from '../vent/session';
import { ventNumbers } from '../vent/numbers';
import { VENT_NORMALS, flag } from '../knowledge/normals';
import { LABS, LAB_GROUPS, flagOf, type Lab } from '../knowledge/labs';
import { bench } from '../labs/bench';
import { useLabUI } from '../labs/labStore';
import { fmt } from '../labs/LabPanel';

const FLAG_TXT = { low: 'low', high: 'high', ok: 'in range', none: '', normal: 'in range', 'critical-low': 'critical low', 'critical-high': 'critical high' } as const;

export function VentNormals() {
  useUI((s) => s.pulse);
  const n = ventNumbers(session); const g = session.snap;
  return (
    <div className="normals">
      <p className="muted small">Typical adult values. Local protocols and laboratories differ. The right-hand column is the simulated patient right now.</p>
      {VENT_NORMALS.map((grp) => (
        <section key={grp.title} className="card">
          <h3 className="nm-h">{grp.title}</h3>{grp.blurb && <p className="muted small nm-b">{grp.blurb}</p>}
          <div className="nm-table" role="table">
            {grp.rows.map((r) => {
              const v = r.live?.(n, g); const num = typeof v === 'number' && isFinite(v) ? v : null; const f = num != null ? flag(num, r.band) : 'none';
              return (
                <div key={r.label} className="nm-row" role="row">
                  <div className="nm-l" role="cell"><b>{r.label}</b>{r.note && <span>{r.note}</span>}</div>
                  <div className="nm-n" role="cell">{r.normal}<small>{r.unit}</small></div>
                  <div className={`nm-v f-${f}`} role="cell">{v == null ? '—' : num != null ? num.toFixed(r.digits ?? 0) : v}{f !== 'none' && <small>{FLAG_TXT[f]}</small>}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

const LAB_NOTES: Record<string, string> = {
  na: 'Correct chronic low Na⁺ no faster than 8–10 mEq/L in 24 h.', k: '> 6.5 or ECG changes → treat immediately.', cl: 'Rises with normal saline (hyperchloraemic acidosis).', hco3: 'Low = metabolic acidosis; high = metabolic alkalosis, or compensation for chronic CO₂ retention.',
  ca: 'Ionised. Total calcium 8.5–10.5 mg/dL (corrects with albumin).', mg: '< 1.2 severe — torsades risk; low Mg²⁺ keeps K⁺ low.', phos: '< 1.0 severe — respiratory muscle weakness.',
  bun: 'BUN : Cr > 20 suggests pre-renal failure or GI bleeding.', cr: 'Women 0.5–1.1. A rise of ≥ 0.3 in 48 h = acute kidney injury.', egfr: '< 60 for > 3 months = chronic kidney disease.',
  glu: 'Fasting 70–99; random < 140. < 70 hypoglycaemia; > 250 with ketones → DKA.', ag: 'Na⁺ − (Cl⁻ + HCO₃⁻). Add 2.5 for every 1 g/dL albumin below 4.', lac: '≥ 2 abnormal in sepsis; ≥ 4 = shock.', ket: '> 3 with acidosis = DKA.',
  hb: 'Women 12–15.5. Transfuse most ICU patients below 7.', hct: 'Women 36–46.', rbc: 'Women 4.0–5.2.', wbc: 'Neutropenia: ANC < 1.5.', plt: '< 50 bleeding risk with procedures; < 10–20 spontaneous bleeding.',
  pt: 'Extrinsic pathway (factor VII); reported as INR.', inr: 'Therapeutic on warfarin 2–3 (2.5–3.5 mechanical valves).', aptt: 'Intrinsic pathway; therapeutic heparin ≈ 1.5–2.5 × control.', fib: '< 150–200 in bleeding → cryoprecipitate / fibrinogen.',
  trop: '99th-percentile upper limit for hs-TnT; the rise and fall matters more than one value.', bnp: '< 100 makes heart failure unlikely; NT-proBNP uses different cut-offs.',
  ast: 'Also in muscle and red cells.', alt: 'More liver-specific than AST.', alp: 'Higher in children, pregnancy and bone disease.', bili: 'Visible jaundice from ≈ 2.5–3.', alb: 'Low albumin lowers total calcium and hides an anion gap.',
};
const range = (l: Lab) => (l.normal[0] === 0 ? `< ${l.normal[1]}` : `${l.normal[0]}–${l.normal[1]}`);
const crit = (l: Lab) => { const c = l.critical; if (!c) return ''; return [c[0] != null ? `< ${c[0]}` : '', c[1] != null ? `> ${c[1]}` : ''].filter(Boolean).join(' or '); };

export function LabNormals() {
  useUI((s) => s.pulse); const sel = useLabUI((s) => s.lab);
  return (
    <div className="normals">
      <p className="muted small">Typical adult reference ranges (conventional US units). Local laboratories differ. Tap a row to show that lab on the patient; the right-hand column is the simulated patient right now.</p>
      {LAB_GROUPS.map((g) => (
        <section key={g} className="card">
          <h3 className="nm-h">{g}</h3>
          <div className="nm-table" role="table">
            {LABS.filter((l) => l.group === g).map((l) => {
              const v = bench.value(l.id); const f = flagOf(l, v); const c = crit(l);
              return (
                <button key={l.id} className={`nm-row nm-btn${sel === l.id ? ' on' : ''}`} onClick={() => useLabUI.getState().set({ lab: l.id })}>
                  <div className="nm-l"><b>{l.name} <em>{l.abbr}</em></b>{LAB_NOTES[l.id] && <span>{LAB_NOTES[l.id]}</span>}{c && <span className="nm-crit">Critical {c}</span>}</div>
                  <div className="nm-n">{range(l)}<small>{l.unit}</small></div>
                  <div className={`nm-v f-${f === 'normal' ? 'ok' : f.startsWith('critical') ? 'crit' : f}`}>{fmt(l, v)}<small>{FLAG_TXT[f]}</small></div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
