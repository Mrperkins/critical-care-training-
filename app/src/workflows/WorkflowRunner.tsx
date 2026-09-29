/** Generic procedure runner: pick actions in order; each may drive the live engine; feedback and debrief. */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { evaluate, options, type Workflow } from './workflow';

export function WorkflowRunner({ wf, onExit, children }: { wf: Workflow; onExit: () => void; children?: ReactNode }) {
  const [chosen, setChosen] = useState<string[]>([]); const [finished, setFinished] = useState(false);
  useEffect(() => { wf.setup(); setChosen([]); setFinished(false); }, [wf]);
  useEffect(() => { (window as unknown as { __CCWorkflow: unknown }).__CCWorkflow = { wf, choose: (id: string) => pick(id), finish: () => setFinished(true), reset: () => { wf.setup(); setChosen([]); setFinished(false); } }; }); // eslint-disable-line react-hooks/exhaustive-deps
  const res = useMemo(() => evaluate(wf, chosen, finished), [wf, chosen, finished]);
  const opts = useMemo(() => options(wf), [wf]); const all = useMemo(() => new Map([...wf.steps, ...wf.distractors].map((a) => [a.id, a])), [wf]);
  const isStep = (id: string) => wf.steps.some((s) => s.id === id);
  function pick(id: string) { if (finished || chosen.includes(id)) return; wf.effects?.[id]?.(); setChosen((c) => [...c, id]); }
  const last = chosen[chosen.length - 1]; const lastA = last ? all.get(last) : null;
  const verdict = (id: string) => (!isStep(id) ? (all.get(id)!.critical ? 'harm' : 'wrong') : res.outOfOrder.includes(id) ? 'order' : 'ok');
  const done = res.missing.length === 0 || finished;
  return (
    <div className="chal-run wf">
      <section className="card">
        <button className="linkish" onClick={onExit}>← All lessons</button>
        <div className="eyebrow">Procedure · {wf.level}</div><h2 className="h2">{wf.title}</h2>
        <p className="muted">{wf.context}</p>
        {lastA && <p className={`explain ${verdict(last!) === 'ok' ? 'ok' : 'bad'}`}><b>{verdict(last!) === 'ok' ? '✓ ' : verdict(last!) === 'order' ? '↺ Out of order — ' : verdict(last!) === 'harm' ? '✗ Harmful — ' : '✗ '}{lastA.label}.</b> {lastA.why}</p>}
      </section>
      {!done && <section className="card"><div className="card-h"><h3>What do you do next?</h3><span className="muted small">{chosen.filter(isStep).length}/{wf.steps.length}</span></div>
        <div className="wf-opts">{opts.filter((a) => !chosen.includes(a.id)).map((a) => <button key={a.id} className="wf-opt" onClick={() => pick(a.id)}>{a.label}</button>)}</div>
        <div className="wf-foot"><button className="linkish" onClick={() => setFinished(true)}>I’m done</button><button className="linkish" onClick={() => { wf.setup(); setChosen([]); setFinished(false); }}>Restart</button></div>
      </section>}
      {chosen.length > 0 && <section className="card"><div className="card-h"><h3>Your sequence</h3>{done && <span className={`badge ${res.score >= 80 ? 'ok' : 'bad'}`}>{res.score}/100</span>}</div>
        <ol className="wf-seq">{chosen.map((id) => <li key={id} className={`v-${verdict(id)}`}>{all.get(id)!.label}</li>)}</ol>
      </section>}
      {done && <section className="card">
        <div className="card-h"><h3>Debrief</h3></div>
        {res.harmful.length > 0 && <p className="explain bad"><b>Harmful:</b> {res.harmful.map((id) => all.get(id)!.label).join('; ')}.</p>}
        {res.criticalMissing.length > 0 && <p className="explain bad"><b>Critical step missed:</b> {res.criticalMissing.map((id) => all.get(id)!.label).join('; ')}.</p>}
        <p className="muted">{wf.debrief}</p>
        <ol className="wf-seq ref">{wf.steps.map((s) => <li key={s.id}><b>{s.label}</b><br /><small className="muted">{s.why}</small></li>)}</ol>
        <button className="chip" onClick={() => { wf.setup(); setChosen([]); setFinished(false); }}>Try again</button>
      </section>}
      {children}
    </div>
  );
}
