/**
 * Runner for scene-based cases (Abdomen, Brain, Heart, chest imaging). The case puts the module's own
 * state on screen; the learner answers from the picture and the bedside numbers. Written findings in the
 * imaging views stay hidden until the case is answered. Attempts feed Curriculum › Weak topics.
 */
import { useEffect, useMemo, useState } from 'react';
import { casesFor, CASE_BY_ID, type CaseModule, type SceneCase } from './sceneCases';
import { useCaseUI } from './caseStore';
import { useProgress } from '../curriculum/progress';
import { takePendingChallenge, usePendingOpen } from '../app/navigate';
import { Remediate } from './Remediate';
import { ApnoeaCard, AirwayCard, NeoCard, ObCard } from '../populations/Cards';
const CARD = { apnoea: ApnoeaCard, airway: AirwayCard, neo: NeoCard, ob: ObCard };

const shuffle = (n: number, seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const HEAD: Record<CaseModule, [string, string]> = {
  abdomen: ['Read the scan, treat the patient', 'FAST and CT angiography drawn from the abdominal model. Findings text is hidden until you answer.'],
  neuro: ['Localise, then decide', 'Stroke and raised-ICP cases from the brain model: the exam and vital signs come from the same state as the 3D brain.'],
  heart: ['Follow the blood', 'Shunt cases from the two-circuit heart model. Watch where the flow goes and what colour it is.'],
  vent: ['Imaging and airway', 'Films and scans drawn from the live ventilator patient, and the child’s airway. The written reading is hidden until you answer.'],
  abg: ['Oxygen reserve', 'Apnoea cases for infants and pregnancy, drawn from the oxygen-store model on the blood-gas patient.'],
  lines: ['Pregnancy', 'Obstetric cases on the live circulation: position and postpartum haemorrhage.'],
};

export function CaseList({ module, onStart, embedded }: { module: CaseModule; onStart: (c: SceneCase) => void; embedded?: boolean }) {
  const attempts = useProgress((s) => s.attempts); const cases = casesFor(module);
  return (
    <>
      <section className="card"><div className="eyebrow">{embedded ? 'More cases' : 'Challenge'}</div><h2 className="h2">{HEAD[module][0]}</h2><p className="muted">{HEAD[module][1]}</p></section>
      {cases.map((c) => { const a = attempts[c.id]; const last = a?.[a.length - 1]; return (
        <button key={c.id} className="chal-item" onClick={() => onStart(c)}>
          <span className={`lvl lvl-${c.level}`}>{c.level}</span><span className="ci-t">{c.title}</span><span className="ci-k">{c.questions.length} questions</span>
          {last && <span className={`tick${last.ok ? '' : ' miss'}`} aria-label={last.ok ? 'last attempt right' : 'last attempt missed'}>{last.ok ? '✓' : '✕'}</span>}
        </button>); })}
    </>
  );
}

export function CaseRun({ c, onExit, onNext }: { c: SceneCase; onExit: () => void; onNext?: () => void }) {
  const [facts, setFacts] = useState<[string, string][]>([]);
  useEffect(() => { c.setup(); setFacts(c.facts()); useCaseUI.getState().set({ active: c.id, revealed: false });
    // phones stack the picture above the questions: start at the picture
    if (typeof document !== 'undefined' && document.querySelector('.app.phone')) document.querySelector('.scene-pane')?.scrollIntoView?.({ block: 'start' }); return () => useCaseUI.getState().set({ active: null, revealed: false }); }, [c]);
  const [qi, setQi] = useState(0); const [picks, setPicks] = useState<number[]>([]);
  const q = c.questions[qi]; const order = useMemo(() => shuffle(q.options.length, `${c.id}:${qi}`), [c.id, qi, q.options.length]);
  const pick = picks[qi]; const done = picks.length === c.questions.length; const right = picks.filter((p, i) => p === c.questions[i].answer).length;
  const choose = (k: number) => {
    if (pick != null) return; const next = [...picks]; next[qi] = k; setPicks(next);
    if (next.length === c.questions.length) { useProgress.getState().record(c.id, next.every((p, i) => p === c.questions[i].answer)); useCaseUI.getState().set({ revealed: true }); }
  };
  return (
    <div className="chal-run">
      <section className="card">
        <div className="card-h"><div className="eyebrow">{c.level} · question {Math.min(qi + 1, c.questions.length)} of {c.questions.length}</div><button className="linkish" onClick={onExit}>← All cases</button></div>
        <h2 className="h2">{c.title}</h2><p>{c.story}</p>
        {facts.length > 0 && <dl className="case-facts">{facts.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
      </section>
      <section className="card">
        <h3>{q.q}</h3>
        <div className="opts" role="group" aria-label="Answers">{order.map((k) => <button key={k} disabled={pick != null} className={`opt${pick != null && k === q.answer ? ' right' : ''}${pick === k && k !== q.answer ? ' wrong' : ''}`} onClick={() => choose(k)}>{q.options[k]}</button>)}</div>
        {pick != null && <div className="reveal" aria-live="polite"><b>{pick === q.answer ? 'Right.' : `Best: ${q.options[q.answer]}.`}</b> {q.explain}</div>}
        {pick != null && !done && <div className="actions" style={{ marginTop: 10 }}><button className="act primary" onClick={() => setQi(qi + 1)}>Next question →</button></div>}
        {done && <>
          <div className="case-score"><b>{right} of {c.questions.length}</b> right. {right === c.questions.length ? 'The written findings are now shown beside the image.' : 'The written findings are now shown — compare them with what you read.'}</div>
          <Remediate id={c.id} ok={right === c.questions.length} />
          {c.card && (() => { const Card = CARD[c.card]; return <div style={{ marginTop: 10 }}><Card /></div>; })()}
          <div className="actions" style={{ marginTop: 10 }}>{onNext && <button className="act primary" onClick={onNext}>Next case →</button>}<button className="act" onClick={onExit}>All cases</button></div>
        </>}
      </section>
    </div>
  );
}

/** The whole Challenge side pane for a module whose challenges are all scene cases. */
export function CaseChallenge({ module }: { module: CaseModule }) {
  const [cur, setCur] = useState<SceneCase | null>(null);
  const pend = usePendingOpen((s) => s.id);
  useEffect(() => { const id = takePendingChallenge((x) => CASE_BY_ID[x]?.module === module); if (id) setCur(CASE_BY_ID[id]); }, [pend, module]);
  const list = casesFor(module);
  if (!cur) return <div className="chal-list"><CaseList module={module} onStart={setCur} /></div>;
  const i = list.indexOf(cur); const next = list[i + 1];
  return <CaseRun key={cur.id} c={cur} onExit={() => setCur(null)} onNext={next ? () => setCur(next) : undefined} />;
}
