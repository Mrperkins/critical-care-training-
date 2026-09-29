/** Anti-impulse targets read from the Lines patient (heart rate first, then systolic pressure). */
import { useUI } from '../app/store';
import { lines } from '../lines/session';
export function ImpulseCard() {
  useUI((s) => s.pulse); const n = lines.num; const hr = Math.round(n.hr), sys = Math.round(n.tSys), dia = Math.round(n.tDia), map = Math.round(n.tMap);
  return (
    <section className="card"><div className="card-h"><h3>Anti-impulse targets</h3><span className="muted small">same patient · Lines circulation</span></div>
      <div className="ln-flush">
        <div><span>Heart rate</span><b className={hr <= 65 ? 'ok' : 'bad'}>{hr}</b></div>
        <div><span>Systolic</span><b className={sys < 120 ? 'ok' : 'bad'}>{sys}</b></div>
        <div><span>BP</span><b>{sys}/{dia}</b></div>
        <div><span>MAP</span><b>{map}</b></div>
      </div>
      <p className="muted small">Teaching targets: heart rate about 60, then systolic below about 120, if perfusion allows. Local protocols and drug choices vary.</p>
    </section>
  );
}
