/** Coagulation read-out for the Labs bench patient: a viscoelastic-style trace plus INR / aPTT / fibrinogen / platelets / lysis. */
import { bench } from './bench';
import { useUI } from '../app/store';
import { viscoTrace, COAG_PRESETS, type CoagPresetId, type CoagDrug } from '../physiology/coag';

const DRUGS: [CoagDrug, string][] = [['pcc', '4F-PCC'], ['vitkIV', 'Vitamin K IV'], ['vitkOral', 'Vitamin K oral'], ['heparinStop', 'Stop heparin'], ['protamine', 'Protamine'], ['txa', 'Tranexamic acid'], ['cryo', 'Cryo / fibrinogen'], ['ffp', 'FFP'], ['platelets', 'Platelets']];
export function CoagCard({ interactive = false }: { interactive?: boolean }) {
  useUI((s) => s.pulse); const c = bench.pt.coag; const L = bench.snap.coag;
  const bump = () => useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
  if (!c || !L) return interactive ? (
    <section className="card"><div className="card-h"><h3>Coagulation</h3><span className="muted small">engine off</span></div>
      <p className="muted small">Start a clotting scenario to run the coagulation engine on this patient.</p>
      <div className="chips">{(Object.keys(COAG_PRESETS) as CoagPresetId[]).map((id) => <button key={id} className="chip" onClick={() => { bench.startCoag(id); bench.sel = 'inr'; bump(); }}>{COAG_PRESETS[id].name}</button>)}</div></section>
  ) : null;
  const tr = viscoTrace(c); const W = 300, H = 110; const x = (t: number) => (t / 60) * W; const y = (a: number) => H / 2 - (a / 70) * (H / 2 - 4);
  const top = tr.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.a).toFixed(1)}`).join(''); const bot = [...tr].reverse().map((p) => `L${x(p.t).toFixed(1)},${(H - y(p.a)).toFixed(1)}`).join('');
  const f = (v: number, d = 0) => v.toFixed(d);
  const row = (label: string, v: string, bad: boolean, unit = '') => <div className={`num${bad ? ' bad' : ''}`}><span className="nl">{label}</span><span className="nv">{v}</span><span className="nu">{unit}</span></div>;
  return (
    <section className="card coag-card">
      <div className="card-h"><h3>Clotting</h3><span className="muted small">clot strength over 60 min (viscoelastic-style)</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="pop-svg" role="img" aria-label={`Clot trace: strength ${f(L.mcf)} mm, lysis ${f(L.ly30)} % at 30 minutes`}>
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} className="pop-grid" />
        <path d={`${top}${bot}Z`} className="coag-trace" />
        {[0, 15, 30, 45, 60].map((t) => <text key={t} x={Math.min(W - 12, x(t) + 2)} y={H - 2} className="pop-ax">{t}</text>)}
      </svg>
      <div className="numgrid">
        {row('INR', f(L.inr, 1), L.inr > 1.5)}{row('aPTT', f(L.aptt), L.aptt > 40, 's')}{row('Fibrinogen', f(L.fib), L.fib < 150, 'mg/dL')}{row('Platelets', f(L.plt), L.plt < 100, '×10⁹/L')}
        {row('Clot strength', f(L.mcf), L.mcf < 45, 'mm')}{row('Lysis at 30 min', f(L.ly30), L.ly30 > 5, '%')}{row('Factor II/VII/IX/X', f(L.factorPct), L.factorPct < 40, '%')}{row('Clotting capacity', f(100 * L.capacity), L.capacity < 0.6, '%')}
      </div>
      {interactive && <>
        <div className="chips" style={{ marginTop: 8 }}>{DRUGS.map(([d, l]) => <button key={d} className="chip" onClick={() => { bench.coag(d); bump(); }}>{l}</button>)}</div>
        <div className="chips" style={{ marginTop: 6 }}>{[[30, '+30 min'], [360, '+6 h'], [1440, '+24 h']].map(([m, l]) => <button key={l} className="chip" onClick={() => { bench.fastForward(m as number); bump(); }}>{l}</button>)}
          <button className="chip" onClick={() => { bench.pt.coag = undefined; bench.reset(); bump(); }}>Engine off</button></div>
      </>}
      <p className="muted small">From the coagulation engine in this patient: factor activity, heparin, fibrinogen, platelets and fibrinolysis. Teaching approximations of the lab and viscoelastic tests.</p>
    </section>
  );
}
