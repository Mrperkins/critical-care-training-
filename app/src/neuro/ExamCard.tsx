/** Neuro exam driven by the lesion state (exam.ts): the weakness map on the 3D reference body and the findings. */
import { useMemo } from 'react';
import { useNeuroUI } from './neuroStore';
import { examOutcomes } from './exam';
import { DeficitBody3D } from './DeficitBody3D';

export function NeuroExamCard() {
  const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys);
  const o = useMemo(() => examOutcomes(st, sys), [st, sys]); const e = o.now;
  return (
    <section className="card exam">
      <div className="card-h"><h3>Bedside examination</h3><span className="muted small">NIHSS ≈ {e.nihss.total} · GCS {e.gcs}</span></div>
      <div className="exam-row">
        <DeficitBody3D e={e} />
        <ul className="exam-list">{e.findings.length ? e.findings.map((x) => <li key={x}>{x}</li>) : <li>Normal neurological examination</li>}</ul>
      </div>
      {o.reopened && o.never && <div className="whatif"><div className="eyebrow">Same patient at 24 h…</div><div className="numgrid">
        <div className="num"><span className="nl">Reopened now</span><span className="nv">{o.reopened.nihss.total}</span><span className="nu">NIHSS</span></div>
        <div className="num"><span className="nl">Never reopened</span><span className="nv">{o.never.nihss.total}</span><span className="nu">NIHSS</span></div>
      </div><p className="muted small">Penumbra recovers when flow returns; the core does not — what is already infarcted stays.</p></div>}
      <p className="muted small">Dominant hemisphere: left. Examination from the model state — scores are approximate.</p>
    </section>
  );
}
