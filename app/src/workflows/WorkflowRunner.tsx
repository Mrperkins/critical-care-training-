/**
 * Procedure runner on the case HUD: at every step the learner picks the next action from four tiles over the
 * scene. A right pick drives the live engine (the workflow's effect) and moves on; a wrong pick shows why and
 * what the step should have been. The full sequence and any procedure cards sit in the Details drawer.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ranks, type WfAction, type Workflow } from './workflow';
import { endGame, finishGame, fmtClock, harm, order, practice, scoreDecision, startGame, starsFor, toast, useGame } from '../library/game';
import { nextInfo } from '../library/CaseGame';

interface Pick { step: string; picked: string; ok: boolean }
/** The four tiles for one step: the step itself plus three plausible others (later steps and wrong actions). */
export function tilesFor(wf: Workflow, done: string[], stepId: string): WfAction[] {
  const others = [...wf.distractors, ...wf.steps.filter((s) => !done.includes(s.id) && s.id !== stepId && ranks(wf)[s.id] > ranks(wf)[stepId])];
  const o = order(others.length, `${wf.id}:${stepId}`).slice(0, 3).map((i) => others[i]);
  const all = [wf.steps.find((s) => s.id === stepId)!, ...o];
  return order(all.length, `${wf.id}:${stepId}:t`).map((i) => all[i]);
}

export function WorkflowRunner({ wf, onExit, onDone, children }: { wf: Workflow; onExit: () => void; onDone?: () => void; children?: ReactNode }) {
  const [picks, setPicks] = useState<Pick[]>([]); const [started, setStarted] = useState(false); const [run, setRun] = useState(0);
  const shown = useRef(Date.now()); const t0 = useRef(Date.now());
  const reset = () => { wf.setup(); setPicks([]); setStarted(false); setRun((n) => n + 1); };
  useEffect(() => { wf.setup(); setPicks([]); setStarted(false); }, [wf]);
  useEffect(() => { startGame(`wf-${wf.id}`, wf.title, { level: 'Procedure' }); return () => endGame(); }, [wf, run]);
  const r = useMemo(() => ranks(wf), [wf]);
  const sequence = useMemo(() => [...wf.steps].sort((a, b) => r[a.id] - r[b.id]), [wf, r]);
  // the step being asked: the first one not yet resolved; `pending` is a pick waiting for Continue
  const last = picks[picks.length - 1]; const [pending, setPending] = useState(false);
  const idx = pending ? picks.length - 1 : picks.length; const step = sequence[idx]; const done = !step;
  const tiles = useMemo(() => (step ? tilesFor(wf, sequence.slice(0, idx).map((s) => s.id), step.id) : []), [wf, step, idx, sequence]);
  const all = useMemo(() => new Map([...wf.steps, ...wf.distractors].map((a) => [a.id, a])), [wf]);
  function choose(id: string) {
    if (!step || pending) return;
    // steps the workflow says can be done in any order count as right for each other
    const ok = id === step.id || (wf.steps.some((s) => s.id === id) && r[id] === r[step.id] && !picks.some((p) => p.step === id));
    const pts = scoreDecision(ok, shown.current); if (ok && !practice()) toast(true, `+${pts}`);
    if (!ok && wf.distractors.find((d) => d.id === id)?.critical) harm(0.2);
    wf.effects?.[step.id]?.();
    setPicks((p) => [...p, { step: step.id, picked: id, ok }]); setPending(true);
  }
  useEffect(() => { (window as unknown as { __CCWorkflow: unknown }).__CCWorkflow = { wf, choose, start: () => setStarted(true), next: () => setPending(false), reset, step: step?.id ?? null }; }); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const g = useGame.getState(); if (!g.id) return;
    if (!started) { t0.current = Date.now(); g.set({ question: null, card: { kicker: `Procedure · ${sequence.length} steps`, title: wf.title, text: wf.context, cta: { label: 'Start the procedure', onClick: () => setStarted(true) } } }); return; }
    if (!done) {
      if (!pending) shown.current = Date.now();
      const pick = pending ? last : null; const picked = pick ? all.get(pick.picked)! : null;
      g.set({ card: null, question: { key: `${wf.id}:${idx}`, q: `Step ${idx + 1} of ${sequence.length} · What do you do next?`, tiles: tiles.map((a) => ({ label: a.label })), answer: tiles.findIndex((a) => a.id === step.id),
        explain: pick && !pick.ok ? `${picked!.why} ${step.why}` : pick && pick.picked !== step.id ? `${picked!.why} (This and “${step.label}” can go in either order.)` : step.why,
        picked: pick ? tiles.findIndex((a) => a.id === (pick.ok ? step.id : pick.picked)) : null, shownAt: shown.current },
        onAnswer: (i) => choose(tiles[i].id), continueLabel: idx + 1 < sequence.length ? 'Next action' : 'See the debrief', onContinue: () => setPending(false) });
      return;
    }
    const right = picks.filter((p) => p.ok).length; const total = sequence.length; const ms = Date.now() - t0.current; const par = 20000 * total;
    if (right * 10 >= total * 8) onDone?.();
    finishGame({ ok: right === total, right, total, ms, stars: starsFor(right, total, ms, par), verdict: right === total ? 'Procedure complete' : 'Procedure complete — review the misses',
      tip: right === total && ms > par ? `⭐ For the third star, finish in under ${fmtClock(par)}.` : wf.debrief,
      lines: picks.map((p) => { const s = all.get(p.step)!; return { q: s.label, ok: p.ok, yours: all.get(p.picked)!.label, best: s.label, explain: s.why }; }) },
      { ...nextInfo(), onReplay: reset });
  }, [started, idx, pending, done, run]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="chal-run wf">
      <section className="card">
        <button className="linkish" onClick={onExit}>← All lessons</button>
        <div className="eyebrow">Procedure · {wf.level} · details</div><h2 className="h2">{wf.title}</h2>
        <p className="muted">{wf.context}</p>
      </section>
      <section className="card"><div className="card-h"><h3>The sequence</h3><span className="muted small">{picks.length}/{sequence.length}</span></div>
        <ol className="wf-seq">{sequence.map((s, i) => { const p = picks[i]; return <li key={s.id} className={p ? (p.ok ? 'v-ok' : 'v-wrong') : ''}>{p ? s.label : <span className="muted">Step {i + 1}</span>}{p && <><br /><small className="muted">{s.why}</small></>}</li>; })}</ol>
        {done && <p className="muted">{wf.debrief}</p>}
        <div className="wf-foot"><button className="linkish" onClick={reset}>Restart</button></div>
      </section>
      {children}
    </div>
  );
}
