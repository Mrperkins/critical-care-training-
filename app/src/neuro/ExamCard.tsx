/** Synthetic patient + neuro exam, driven by the lesion state (exam.ts). */
import { useMemo } from 'react';
import { useNeuroUI } from './neuroStore';
import { examOutcomes, type NeuroExam, type Side } from './exam';

/** Patient facing you: their RIGHT is on your LEFT. */
export function PatientFigure({ e }: { e: NeuroExam }) {
  const X = (s: Side, dx: number) => (s === 'R' ? 100 - dx : 100 + dx); // screen x for the patient's side
  const armY = (p: number) => 118 + (5 - p) * 9; const legLen = (p: number) => 5 - p;
  const droopR = e.face.side === 'R' ? e.face.grade * 3 : 0, droopL = e.face.side === 'L' ? e.face.grade * 3 : 0;
  const gx = e.gaze.deviation === 'R' ? -3 : e.gaze.deviation === 'L' ? 3 : 0; const eyesOpen = e.gcs > 8;
  const speech = e.aphasia === 'none' ? (e.dysarthria ? 'slurred…' : '') : e.aphasia === 'expressive' ? '“…uh… w-want…”' : e.aphasia === 'receptive' ? '“the fish went blue tables”' : '(no words)';
  return (
    <svg viewBox="0 0 200 250" className="pt-fig" role="img" aria-label={`Patient: ${e.findings.join(', ') || 'normal examination'}`}>
      {e.neglect && <g><rect x={e.neglect === 'L' ? 100 : 0} y="0" width="100" height="250" fill="rgba(90,110,140,.28)" /><text x={e.neglect === 'L' ? 150 : 50} y="244" textAnchor="middle" className="pt-side">ignored side</text></g>}
      <text x="8" y="14" className="pt-side">R</text><text x="186" y="14" className="pt-side">L</text>
      {/* head */}
      <circle cx="100" cy="52" r="30" className="pt-skin" />
      {eyesOpen ? <><circle cx="89" cy="46" r="5" fill="#f3efe8" /><circle cx={89 + gx} cy="46" r="2.2" fill="#1b2430" /><circle cx="111" cy="46" r="5" fill="#f3efe8" /><circle cx={111 + gx} cy="46" r="2.2" fill="#1b2430" /></>
        : <><path d="M84 46h10M106 46h10" stroke="#3a2a2a" strokeWidth="1.6" /></>}
      <path d={`M86 ${66 + droopR} Q100 ${72 + (droopR + droopL) / 2} 114 ${66 + droopL}`} fill="none" stroke="#6b2a2a" strokeWidth="2" strokeLinecap="round" />
      {/* body */}
      <rect x="78" y="84" width="44" height="70" rx="12" className="pt-body" />
      {/* arms held out (drift test) */}
      <line x1="80" y1="100" x2={X('R', 60)} y2={armY(e.power.armR)} className={`pt-limb${e.power.armR < 5 ? ' weak' : ''}`} />
      <line x1="120" y1="100" x2={X('L', 60)} y2={armY(e.power.armL)} className={`pt-limb${e.power.armL < 5 ? ' weak' : ''}`} />
      <line x1="90" y1="152" x2={X('R', 16 + legLen(e.power.legR) * 3)} y2={236 - legLen(e.power.legR) * 4} className={`pt-limb${e.power.legR < 5 ? ' weak' : ''}`} />
      <line x1="110" y1="152" x2={X('L', 16 + legLen(e.power.legL) * 3)} y2={236 - legLen(e.power.legL) * 4} className={`pt-limb${e.power.legL < 5 ? ' weak' : ''}`} />
      {speech && <g><rect x="122" y="14" width="74" height="22" rx="8" className="pt-bubble" /><text x="159" y="29" textAnchor="middle" className="pt-say">{speech}</text></g>}
      {e.hemianopia && <g transform="translate(18 22)"><circle r="11" className="pt-vf" /><path d={e.hemianopia === 'R' ? 'M0 -11 A11 11 0 0 0 0 11 Z' : 'M0 -11 A11 11 0 0 1 0 11 Z'} fill="#0b0e12" /><text y="24" textAnchor="middle" className="pt-side">field</text></g>}
      {e.gcs < 9 && <text x="100" y="20" textAnchor="middle" className="pt-coma">GCS {e.gcs}</text>}
    </svg>
  );
}

export function NeuroExamCard() {
  const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys);
  const o = useMemo(() => examOutcomes(st, sys), [st, sys]); const e = o.now;
  return (
    <section className="card exam">
      <div className="card-h"><h3>Bedside examination</h3><span className="muted small">NIHSS ≈ {e.nihss.total} · GCS {e.gcs}</span></div>
      <div className="exam-row">
        <PatientFigure e={e} />
        <ul className="exam-list">{e.findings.length ? e.findings.map((x) => <li key={x}>{x}</li>) : <li>Normal neurological examination</li>}</ul>
      </div>
      {o.reopened && o.never && <div className="whatif"><div className="eyebrow">Same patient at 24 h…</div><div className="numgrid">
        <div className="num"><span className="nl">Reopened now</span><span className="nv">{o.reopened.nihss.total}</span><span className="nu">NIHSS</span></div>
        <div className="num"><span className="nl">Never reopened</span><span className="nv">{o.never.nihss.total}</span><span className="nu">NIHSS</span></div>
      </div><p className="muted small">Penumbra recovers when flow returns; the core does not — what is already infarcted stays.</p></div>}
      <p className="muted small">Dominant hemisphere: left. Synthetic examination from the model state — scores are approximate.</p>
    </section>
  );
}
