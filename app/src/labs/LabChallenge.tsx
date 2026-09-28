import { useMemo, useState } from 'react';
import { bench } from './bench';
import { useLabUI } from './labStore';
import { useUI } from '../app/store';
import { LAB_CASES, type LabCase } from '../scenarios/labCases';
import { LAB, flagOf } from '../knowledge/labs';
import { Consequences, fmt } from './LabPanel';

function load(c: LabCase) {
  bench.reset(); if (c.renal != null) bench.pt.p.renal = c.renal; bench.naMode = c.naChronic ? 'chronic' : 'acute';
  for (const [id, v] of Object.entries(c.values)) bench.set(id, v);
  useLabUI.getState().set({ lab: c.focus }); useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}
export function LabChallenge() {
  useUI((s) => s.pulse);
  const [i, setI] = useState(0); const [pick, setPick] = useState<number | null>(null); const [score, setScore] = useState({ r: 0, n: 0 });
  const c = LAB_CASES[i % LAB_CASES.length];
  const order = useMemo(() => { load(c); return [0, 1, 2, 3].sort(() => Math.random() - 0.5); }, [c]);
  const shown = Object.keys(c.values);
  return (
    <div className="chal-run">
      <section className="card"><div className="card-h"><div className="eyebrow">{c.level} · case {(i % LAB_CASES.length) + 1} of {LAB_CASES.length}</div><span className="pill">{score.r}/{score.n}</span></div>
        <h2 className="h2">{c.story}</h2>
        <div className="panelrow">{shown.map((id) => { const l = LAB[id]; const v = bench.value(id); return <span key={id} className={`labchip f-${flagOf(l, v)}`}><span>{l.abbr}</span><b>{fmt(l, v)}</b><small>{l.unit}</small></span>; })}</div>
      </section>
      <section className="card"><h3>{c.q}</h3>
        <div className="opts">{order.map((k) => <button key={k} disabled={pick != null} className={`opt${pick != null && k === c.answer ? ' right' : ''}${pick === k && k !== c.answer ? ' wrong' : ''}`} onClick={() => { setPick(k); setScore((s) => ({ r: s.r + (k === c.answer ? 1 : 0), n: s.n + 1 })); }}>{c.options[k]}</button>)}</div>
        {pick != null && <div className="reveal"><b>{pick === c.answer ? 'Right.' : `Best: ${c.options[c.answer]}.`}</b> {c.explain}</div>}
        {pick != null && <div className="actions" style={{ marginTop: 10 }}><button className="act primary" onClick={() => { setPick(null); setI(i + 1); }}>Next case →</button></div>}
      </section>
      <Consequences />
    </div>
  );
}
