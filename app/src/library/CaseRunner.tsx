/**
 * The case shell shown beside the live scene: Patient → Assess → Decide → Debrief.
 * Scene cases run fully here; engine cases keep their own controls and this shell supplies the
 * progress header and the debrief once the attempt is recorded.
 */
import { useEffect, useMemo } from 'react';
import { CASE_BY_ID, type SceneCase } from '../challenge/sceneCases';
import { CHALLENGE_CONCEPTS, CONCEPTS } from '../curriculum/catalog';
import { useProgress } from '../curriculum/progress';
import { titleOf } from '../curriculum/titles';
import { MECH } from '../moa/registry';
import { openDrug, openLesson } from '../app/navigate';
import { ApnoeaCard, AirwayCard, NeoCard, ObCard } from '../populations/Cards';
import { PedsCard } from '../populations/PedsCard';
import { STAGES, answer, endCase, fmtTime, nextQuestion, startCase, useCaseRun, type Stage } from './caseRun';
import { useLibrary } from './libraryStore';
const CARD = { apnoea: ApnoeaCard, airway: AirwayCard, neo: NeoCard, ob: ObCard, peds: PedsCard };

const shuffle = (n: number, seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function Stepper({ stage, stages = STAGES }: { stage: Stage; stages?: typeof STAGES }) {
  const at = stages.findIndex((s) => s.key === stage);
  return (
    <ol className="case-stepper" aria-label="Case progress">
      {stages.map((s, i) => <li key={s.key} className={i < at ? 'done' : i === at ? 'now' : ''} aria-current={i === at ? 'step' : undefined}>
        <span aria-hidden="true">{i < at ? '✓' : i + 1}</span>{s.label}
      </li>)}
    </ol>
  );
}

function Facts({ c }: { c: SceneCase }) {
  const pulse = useCaseRun((s) => s.stage); // re-read the live facts when the stage changes
  const facts = useMemo(() => { try { return c.facts(); } catch { return []; } }, [c, pulse]);
  if (!facts.length) return null;
  return <dl className="case-monitor">{facts.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

/** Concepts the case tests, each with the lesson or drug that teaches it. */
function Review({ id, ok }: { id: string; ok: boolean }) {
  const cs = CHALLENGE_CONCEPTS[id] ?? []; if (!cs.length) return null;
  const leave = (f: () => void) => { endCase(); useLibrary.getState().setPlaying(null); useLibrary.getState().setSolo(null); f(); };
  return (
    <section className="case-panel" aria-labelledby="review-h">
      <h3 id="review-h">{ok ? 'What this case tested' : 'Review what you missed'}</h3>
      {cs.map((k) => <div key={k} className="case-review-row"><span>{CONCEPTS[k].name}</span>
        <div className="case-review-links">{CONCEPTS[k].remediate.map((r) => 'lesson' in r
          ? <button key={r.lesson} onClick={() => leave(() => openLesson(r.lesson))}><b className="k-lesson">Lesson</b>{titleOf(r.lesson)}</button>
          : <button key={r.drug} onClick={() => leave(() => openDrug(r.drug))}><b className="k-procedure">Drug</b>{MECH[r.drug]?.drug ?? r.drug}</button>)}</div>
      </div>)}
    </section>
  );
}

function Attempts({ id }: { id: string }) {
  const list = useProgress((s) => s.attempts[id]) ?? [];
  if (list.length < 2) return null;
  return <p className="case-attempts">Attempt {list.length} · earlier: {list.slice(0, -1).slice(-5).map((a, i) => <span key={i} className={a.ok ? 'ok' : 'miss'} aria-label={a.ok ? 'passed' : 'missed'}>{a.ok ? '✓' : '✕'}</span>)}</p>;
}

export function DebriefActions({ id, onNext, nextLabel }: { id: string; onNext?: () => void; nextLabel?: string }) {
  const solo = useLibrary((s) => s.solo);
  return (
    <div className="case-actions">
      {onNext && <button className="lib-btn primary" onClick={onNext}>{nextLabel ?? 'Next step'}</button>}
      <button className="lib-btn" onClick={() => startCase(id)}>Run the case again</button>
      {solo && <button className="lib-btn" onClick={() => { endCase(); useLibrary.getState().setSolo(null); useLibrary.getState().go({ page: 'shelf', id: 'all', filter: 'case' }); }}>Back to cases</button>}
    </div>
  );
}

function SceneDebrief({ c, onNext, nextLabel }: { c: SceneCase; onNext?: () => void; nextLabel?: string }) {
  const decisions = useCaseRun((s) => s.decisions);
  const right = decisions.filter((d) => d.ok).length; const ok = right === c.questions.length;
  const last = decisions[decisions.length - 1]?.atMs ?? 0;
  const Card = c.card ? CARD[c.card] : null;
  return (
    <>
      <section className={`case-score-card${ok ? ' ok' : ''}`}>
        <span className="case-score-n">{right}/{c.questions.length}</span>
        <span className="case-score-verdict">{ok ? 'Passed' : 'Not yet'}</span>
        <p>{ok ? `Every decision right, in ${fmtTime(last)}.` : `${c.questions.length - right} decision${c.questions.length - right > 1 ? 's' : ''} to review. Finished in ${fmtTime(last)}.`} The written findings are now shown on the scene.</p>
      </section>
      <section className="case-panel" aria-labelledby="dec-h">
        <h3 id="dec-h">Your decisions</h3>
        <ol className="case-decisions">
          {decisions.map((d) => { const q = c.questions[d.q]; return (
            <li key={d.q} className={d.ok ? 'ok' : 'miss'}>
              <span className="case-dec-mark" aria-hidden="true">{d.ok ? '✓' : '!'}</span>
              <div><b>{q.q}</b>
                {!d.ok && <p className="case-dec-yours">You chose: {q.options[d.pick]}<br />Best: {q.options[q.answer]}</p>}
                <p>{q.explain}</p></div>
              <span className="case-dec-t">{fmtTime(d.atMs)}</span>
            </li>); })}
        </ol>
      </section>
      <Review id={c.id} ok={ok} />
      {Card && <div className="case-panel"><Card /></div>}
      <Attempts id={c.id} />
      <DebriefActions id={c.id} onNext={onNext} nextLabel={nextLabel} />
    </>
  );
}

function SceneCaseRun({ c, onNext, nextLabel }: { c: SceneCase; onNext?: () => void; nextLabel?: string }) {
  const stage = useCaseRun((s) => s.stage); const qi = useCaseRun((s) => s.qi); const decisions = useCaseRun((s) => s.decisions);
  const set = useCaseRun((s) => s.set);
  // put the case's state back on screen once the module's own code has loaded and mounted
  useEffect(() => { const t = setTimeout(() => { if (!useCaseRun.getState().decisions.length) c.setup(); }, 450); return () => clearTimeout(t); }, [c]);
  const q = c.questions[qi]; const order = useMemo(() => shuffle(q.options.length, `${c.id}:${qi}`), [c.id, qi, q.options.length]);
  const mine = decisions.find((d) => d.q === qi);
  return (
    <div className="case-run">
      <Stepper stage={stage} />
      {stage === 'patient' && <>
        <section className="case-panel">
          <p className="case-level">{c.level} case · {c.questions.length} decisions</p>
          <h2>{c.title}</h2>
          <p className="case-story">{c.story}</p>
        </section>
        <Facts c={c} />
        <button className="lib-btn primary" onClick={() => set({ stage: 'assess' })}>Assess the patient</button>
      </>}
      {stage === 'assess' && <>
        <section className="case-panel">
          <h2>Look before you decide</h2>
          <p className="case-story">The scene shows this patient now. Turn it, change the view and use the labels. Written findings stay hidden until the debrief.</p>
        </section>
        <Facts c={c} />
        <div className="case-actions"><button className="lib-btn" onClick={() => set({ stage: 'patient' })}>Back to the report</button><button className="lib-btn primary" onClick={() => set({ stage: 'decide' })}>I’m ready to decide</button></div>
      </>}
      {stage === 'decide' && <section className="case-panel" aria-labelledby="q-h">
        <p className="case-level">Decision {qi + 1} of {c.questions.length}</p>
        <h2 id="q-h">{q.q}</h2>
        <div className="case-options" role="group" aria-labelledby="q-h">
          {order.map((k) => {
            const cls = mine ? (k === q.answer ? ' right' : k === mine.pick ? ' wrong' : '') : '';
            return <button key={k} className={`case-option${cls}`} disabled={!!mine} aria-pressed={mine?.pick === k} onClick={() => answer(k)}><span aria-hidden="true" />{q.options[k]}</button>;
          })}
        </div>
        {mine && <div className={`case-feedback${mine.ok ? ' ok' : ''}`} role="status"><b>{mine.ok ? 'Right.' : `Not quite. Best: ${q.options[q.answer]}.`}</b> {q.explain}</div>}
        <div className="case-dots" aria-hidden="true">{c.questions.map((_, i) => <span key={i} className={i < decisions.length ? 'on' : ''} />)}</div>
        {mine && <button className="lib-btn primary" onClick={nextQuestion}>{qi + 1 < c.questions.length ? 'Next decision' : 'See the debrief'}</button>}
      </section>}
      {stage === 'debrief' && <SceneDebrief c={c} onNext={onNext} nextLabel={nextLabel} />}
    </div>
  );
}

/** Engine-owned case: the engine's own panel runs it; this shell waits for the attempt, then debriefs. */
function EngineCaseRun({ id, onNext, nextLabel }: { id: string; onNext?: () => void; nextLabel?: string }) {
  const prior = useCaseRun((s) => s.priorAttempts); const startedAt = useCaseRun((s) => s.startedAt);
  const list = useProgress((s) => s.attempts[id]) ?? [];
  const last = list.length > prior ? list[list.length - 1] : null;
  return (
    <div className="case-run">
      <Stepper stage={last ? 'debrief' : 'decide'} stages={[{ key: 'patient', label: 'Patient' }, { key: 'decide', label: 'Work the case' }, { key: 'debrief', label: 'Debrief' }]} />
      {!last ? <section className="case-panel">
        <h2>{titleOf(id)}</h2>
        <p className="case-story">This case runs in the panel beside the scene: read the patient, make your call there. The debrief opens here when you answer.</p>
      </section> : <>
        <section className={`case-score-card${last.ok ? ' ok' : ''}`}>
          <span className="case-score-verdict">{last.ok ? 'Passed' : 'Not yet'}</span>
          <p>{titleOf(id)} · {fmtTime(new Date(last.at).getTime() - startedAt)}</p>
        </section>
        <Review id={id} ok={last.ok} />
        <Attempts id={id} />
        <DebriefActions id={id} onNext={onNext} nextLabel={nextLabel} />
      </>}
    </div>
  );
}

export function CaseRunner({ onNext, nextLabel }: { onNext?: () => void; nextLabel?: string }) {
  const id = useCaseRun((s) => s.id); if (!id) return null;
  const c = CASE_BY_ID[id];
  return c ? <SceneCaseRun key={id} c={c} onNext={onNext} nextLabel={nextLabel} /> : <EngineCaseRun key={id} id={id} onNext={onNext} nextLabel={nextLabel} />;
}
