/** Teaching cards for the special-population lessons. Everything drawn comes from the pure models. */
import { useMemo } from 'react';
import { APNOEA_PROFILES, APNOEA_BY_ID, apnoeaCurve } from '../physiology/apnoea';
import { compareAirways } from './airway';
import { NEO_SPO2_TARGETS } from './neonatal';
import { TERM_BLOOD_L, lossPct, shockIndex } from './obstetric';
import { usePopUI, setApnoea, setAirway } from './popStore';
import { useHeartUI } from '../heart/heartStore';
import { solveShunt } from '../heart/shunt';
import { lines } from '../lines/session';
import { useUI } from '../app/store';

const COLOR: Record<string, string> = { adult: '#9fb2ff', pregnant: '#e9b949', obese: '#c79bd8', child: '#5cc8b0', infant: '#e0645a', newborn: '#f0a6c0' };
const fmtMin = (m: number | null) => (m == null ? '> 15 min' : m < 1 ? `${Math.round(m * 60)} s` : `${m.toFixed(1)} min`);

/* ------------------------------------------------------------------ apnoea */
export function ApnoeaCard() {
  const a = usePopUI((s) => s.apnoea);
  const curves = useMemo(() => APNOEA_PROFILES.map((p) => ({ p, c: apnoeaCurve(p, { fao2: a.preox ? 0.87 : 0.14, headUp: a.headUp, minutes: 10 }) })), [a.preox, a.headUp]);
  const W = 360, H = 190, L = 34, R = 10, T = 10, B = 26; const x = (t: number) => L + (t / 10) * (W - L - R); const y = (s: number) => T + (1 - (s * 100 - 50) / 50) * (H - T - B);
  return (
    <section className="card pop-card">
      <div className="card-h"><h3>Apnoea: how long the oxygen lasts</h3><span className="muted small">SpO₂ vs minutes since the last breath</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="pop-svg" role="img" aria-label={`SpO₂ during apnoea. ${curves.filter(({ p }) => a.shown.includes(p.id)).map(({ p, c }) => `${p.short} below 90 % at ${fmtMin(c.t90)}`).join('; ')}`}>
        {[50, 60, 70, 80, 90, 100].map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v / 100)} y2={y(v / 100)} className={v === 90 ? 'pop-thr' : 'pop-grid'} /><text x={L - 5} y={y(v / 100) + 3} className="pop-ax" textAnchor="end">{v}</text></g>)}
        {[0, 2, 4, 6, 8, 10].map((t) => <text key={t} x={x(t)} y={H - 8} className="pop-ax" textAnchor="middle">{t}</text>)}
        {curves.filter(({ p }) => a.shown.includes(p.id)).map(({ p, c }, k) => {
          const on = !a.highlight || a.highlight === p.id; const d = c.t.map((t, i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)},${y(Math.max(0.5, c.spo2[i])).toFixed(1)}`).join('');
          // label where the curve crosses a staggered level below 90 % (curves are steep there, so labels separate)
          const lvl = 0.84 - 0.08 * (k % 3); const j = c.spo2.findIndex((v) => v < lvl); const lx = j > 0 ? x(c.t[j]) : null; const end = lx != null && lx > W - 70;
          return <g key={p.id} opacity={on ? 1 : 0.28}><path d={d} fill="none" stroke={COLOR[p.id]} strokeWidth={a.highlight === p.id ? 3 : 1.8} />
            {c.t90 != null && c.t90 <= 10 && <circle cx={x(c.t90)} cy={y(0.9)} r={3} fill={COLOR[p.id]} />}
            {lx != null && <text x={end ? lx - 5 : lx + 5} y={y(lvl) + 4} textAnchor={end ? 'end' : 'start'} className="pop-lab" fill={COLOR[p.id]}>{p.short}</text>}</g>;
        })}
      </svg>
      <div className="chips" role="group" aria-label="Patients">{APNOEA_PROFILES.map((p) => <button key={p.id} className={`chip${a.shown.includes(p.id) ? ' on' : ''}`} aria-pressed={a.shown.includes(p.id)} onClick={() => setApnoea({ shown: a.shown.includes(p.id) ? a.shown.filter((x) => x !== p.id) : [...a.shown, p.id], highlight: null })}><i className="pop-dot" style={{ background: COLOR[p.id] }} />{p.short}</button>)}</div>
      <div className="chips" style={{ marginTop: 6 }}>
        <button className={`chip${a.preox ? ' on' : ''}`} aria-pressed={a.preox} onClick={() => setApnoea({ preox: !a.preox })}>{a.preox ? 'Pre-oxygenated' : 'Room air'}</button>
        <button className={`chip${a.headUp ? ' on' : ''}`} aria-pressed={a.headUp} onClick={() => setApnoea({ headUp: !a.headUp })}>Head-up</button>
      </div>
      <table className="pop-tab"><thead><tr><th>Patient</th><th>SpO₂ &lt; 90 %</th><th>Why</th></tr></thead><tbody>
        {curves.filter(({ p }) => a.shown.includes(p.id)).map(({ p, c }) => <tr key={p.id} className={a.highlight === p.id ? 'on' : ''}><td><i className="pop-dot" style={{ background: COLOR[p.id] }} />{p.short}</td><td><b>{fmtMin(c.t90)}</b></td><td className="muted small">{APNOEA_BY_ID[p.id].why}</td></tr>)}
      </tbody></table>
      <p className="muted small">Model: closed airway, no oxygen flowing in; the lung and blood oxygen stores drain at the patient's VO₂ while CO₂ climbs. Times are teaching estimates — studies report ranges around them.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ paediatric airway */
export function AirwayCard() {
  const a = usePopUI((s) => s.airway); const rows = compareAirways(a.swellMm);
  return (
    <section className="card pop-card">
      <div className="card-h"><h3>Radius to the fourth power</h3><span className="muted small">{a.swellMm} mm of swelling all round</span></div>
      <div className="pop-airways">{rows.map((r) => {
        const S = 11; const R0 = (r.d / 2) * S, R1 = (r.swollen / 2) * S;
        return (
          <figure key={r.label}>
            <svg viewBox="-50 -50 100 100" role="img" aria-label={`${r.label} airway ${r.d} mm narrowed to ${r.swollen} mm: resistance ×${r.laminar.toFixed(0)}`}>
              <circle r={R0 + 6} className="pop-wall" /><circle r={R0} className="pop-swell" /><circle r={Math.max(0.5, R1)} className="pop-lumen" />
            </svg>
            <figcaption><b>{r.label}</b> · {r.d} → {r.swollen} mm<br /><span className="pop-big">× {(a.crying ? r.turbulent : r.laminar).toFixed(r.laminar < 10 ? 1 : 0)}</span> resistance<br /><span className="muted small">{Math.round(r.areaLeft * 100)} % of the area left</span></figcaption>
          </figure>
        );
      })}</div>
      <div className="chips">{[0.5, 1, 1.5].map((m) => <button key={m} className={`chip${a.swellMm === m ? ' on' : ''}`} aria-pressed={a.swellMm === m} onClick={() => setAirway({ swellMm: m })}>{m} mm</button>)}
        <button className={`chip${a.crying ? ' on' : ''}`} aria-pressed={a.crying} onClick={() => setAirway({ crying: !a.crying })}>Crying (turbulent)</button></div>
      <p className="muted small">Laminar flow: resistance ∝ 1/r⁴ (Poiseuille). Crying makes flow turbulent: the pressure needed rises with 1/r⁵.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ newborn */
export function NeoCard() {
  const inp = useHeartUI((s) => s.input); const s = useMemo(() => solveShunt(inp), [inp]); const minute = usePopUI((p) => p.neo.minute);
  const W = 320, H = 120, L = 30, R = 8, T = 8, B = 22; const x = (m: number) => L + (m / 10) * (W - L - R); const y = (v: number) => T + (1 - (v - 50) / 50) * (H - T - B);
  const band = NEO_SPO2_TARGETS; const top = band.map((b) => `${x(b.min)},${y(b.hi)}`).join(' '); const bot = [...band].reverse().map((b) => `${x(b.min)},${y(b.lo)}`).join(' ');
  const pre = Math.round(s.sat.ao * 100), post = Math.round((inp.lesion === 'pda' ? s.sat.aoPost : s.sat.ao) * 100);
  return (
    <section className="card pop-card">
      <div className="card-h"><h3>Newborn saturations</h3><span className="muted small">target band vs minutes after birth</span></div>
      <div className="pop-sats">
        <div><span className="muted small">Right hand (pre-ductal)</span><b className="pop-big">{pre}%</b></div>
        <div><span className="muted small">Foot (post-ductal)</span><b className="pop-big">{post}%</b></div>
        <div><span className="muted small">Difference</span><b className={`pop-big${pre - post >= 3 ? ' bad' : ''}`}>{pre - post}%</b></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="pop-svg" role="img" aria-label="Pre-ductal SpO₂ target band for the first ten minutes after birth: about 60–65 % at 1 minute rising to 85–95 % at 10 minutes">
        {[60, 70, 80, 90, 100].map((v) => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="pop-grid" /><text x={L - 4} y={y(v) + 3} className="pop-ax" textAnchor="end">{v}</text></g>)}
        {[1, 2, 3, 4, 5, 10].map((m) => <text key={m} x={x(m)} y={H - 7} className="pop-ax" textAnchor="middle">{m}</text>)}
        <polygon points={`${top} ${bot}`} className="pop-band" />
        {minute != null && <line x1={x(minute)} x2={x(minute)} y1={T} y2={H - B} className="pop-cursor" />}
      </svg>
      <p className="muted small">Target band for pre-ductal SpO₂ in the first ten minutes (neonatal resuscitation teaching table). Put the probe on the right hand or wrist.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ obstetric */
export function ObCard() {
  useUI((s) => s.pulse); const ob = usePopUI((s) => s.ob); const n = lines.num; const si = shockIndex(n.tSys > 0 ? n.hr : 0, n.tSys);
  const loss = ob.lossMl ?? 0; const W = 300; const bv = TERM_BLOOD_L * 1000; const scale = W / bv;
  return (
    <section className="card pop-card">
      <div className="card-h"><h3>The pregnant circulation</h3><span className="muted small">{ob.supine ? 'supine — uterus on the IVC' : 'left uterine displacement'}</span></div>
      <svg viewBox={`0 0 ${W} 46`} className="pop-svg" role="img" aria-label={`Blood volume ${TERM_BLOOD_L} litres at term; ${loss} mL lost (${lossPct(loss).toFixed(0)} %)`}>
        <rect x={0} y={6} width={W} height={16} rx={4} className="pop-bv" />
        <rect x={0} y={6} width={5000 * scale} height={16} rx={4} className="pop-bv-np" />
        {loss > 0 && <rect x={W - loss * scale} y={6} width={loss * scale} height={16} className="pop-loss" />}
        <text x={2} y={38} className="pop-ax">0</text><text x={5000 * scale - 4} y={38} className="pop-ax" textAnchor="end">5 L if not pregnant</text><text x={W} y={38} className="pop-ax" textAnchor="end">6.5 L</text>
      </svg>
      <div className="pop-sats">
        <div><span className="muted small">Lost</span><b className="pop-big">{loss ? `${(loss / 1000).toFixed(1)} L` : '—'}</b><span className="muted small">{loss ? `${lossPct(loss).toFixed(0)} % of volume` : ''}</span></div>
        <div><span className="muted small">HR / SBP</span><b className="pop-big">{Math.round(n.hr)} / {Math.round(n.tSys)}</b></div>
        <div><span className="muted small">Shock index</span><b className={`pop-big${si >= 0.9 ? ' bad' : ''}`}>{si.toFixed(2)}</b><span className="muted small">≥ 0.9 – 1.0: significant bleeding</span></div>
      </div>
    </section>
  );
}
