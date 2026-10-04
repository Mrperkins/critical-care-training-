/** The child's numbers against the age norms: loss, heart rate, systolic pressure, capillary refill, stage of shock. */
import { lines } from '../lines/session';
import { useUI } from '../app/store';
import { usePopUI } from './popStore';
import { CHILD, CHILD_BLOOD_ML, CHILD_NORMS, capRefill, shockStage } from './paediatric';

export function PedsCard() {
  useUI((s) => s.pulse); const p = usePopUI((s) => s.peds); const n = lines.num; const loss = p.lossFrac;
  const stage = shockStage(loss, n.tSys); const hrHigh = n.hr > CHILD_NORMS.hr[1], hrLow = n.hr < CHILD_NORMS.hr[0], sbpLow = n.tSys < CHILD_NORMS.sbpLow;
  return (
    <section className="card pop-card">
      <div className="card-h"><h3>A {CHILD.ageY}-year-old, {CHILD.weightKg} kg</h3><span className="muted small">blood volume ≈ {Math.round(CHILD_BLOOD_ML)} mL</span></div>
      <div className="pop-sats">
        <div><span className="muted small">Lost</span><b className="pop-big">{Math.round(loss * CHILD_BLOOD_ML)} mL</b><span className="muted small">{Math.round(loss * 100)} % of volume{p.bloodMlKg ? ` · ${p.bloodMlKg} mL/kg blood given` : ''}</span></div>
        <div><span className="muted small">Heart rate</span><b className={`pop-big${hrHigh || hrLow ? ' bad' : ''}`}>{Math.round(n.hr)}</b><span className="muted small">normal {CHILD_NORMS.hr[0]}–{CHILD_NORMS.hr[1]}</span></div>
        <div><span className="muted small">Systolic</span><b className={`pop-big${sbpLow ? ' bad' : ''}`}>{Math.round(n.tSys)}</b><span className="muted small">lower limit {CHILD_NORMS.sbpLow}</span></div>
      </div>
      <div className="pop-sats">
        <div><span className="muted small">Capillary refill</span><b className={`pop-big${capRefill(loss) > 2 ? ' bad' : ''}`}>{capRefill(loss)} s</b></div>
        <div><span className="muted small">Pulse pressure</span><b className="pop-big">{Math.round(n.tSys - n.tDia)}</b></div>
        <div><span className="muted small">Shock</span><b className={`pop-big${stage !== 'none' ? ' bad' : ''}`} style={{ fontSize: 15 }}>{stage === 'none' ? 'none' : stage}</b></div>
      </div>
      <p className="muted small">Children hold their blood pressure until about a third of their volume is gone; a rising heart rate, narrowing pulse pressure and slow capillary refill come first. The bedside figure is adult-sized; the monitor shows the child.</p>
    </section>
  );
}
