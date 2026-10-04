/** Oxygen-delivery card: every value is read from the Lines session's own patient snapshot. */
import { useUI } from '../app/store';
import { lines } from './session';

export function O2Card() {
  useUI((s) => s.pulse);
  const s = lines.snap; const co = (lines.circ.sv * lines.circ.hr) / 1000; const hb = lines.pt.p.hb;
  const cao2 = 1.34 * hb * s.sao2 + 0.003 * s.pao2; const do2 = co * cao2 * 10;
  const cells: [string, string, string][] = [
    ['Hb', hb.toFixed(1), 'g/dL'], ['SaO₂', (s.sao2 * 100).toFixed(0), '%'], ['CaO₂', cao2.toFixed(1), 'mL/dL'], ['CO', co.toFixed(1), 'L/min'],
    ['DO₂', do2.toFixed(0), 'mL/min'], ['SvO₂', (s.svo2 * 100).toFixed(0), '%'], ['Lactate', s.lactate.toFixed(1), 'mmol/L'], ['MAP', lines.num.map.toFixed(0), 'mmHg'],
  ];
  return (
    <section className="card nums">
      <div className="card-h"><h3>Oxygen delivery</h3><span className="muted small">DO₂ = CO × CaO₂ × 10</span></div>
      <div className="numgrid">{cells.map(([l, v, u]) => <div key={l} className="num"><span className="nl">{l}</span><span className="nv">{v}</span><span className="nu">{u}</span></div>)}</div>
    </section>
  );
}
