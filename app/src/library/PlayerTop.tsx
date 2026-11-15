/**
 * The top bar while a module plays: Exit, where you are, the step dots (they open the step list),
 * Details (the drawer with everything else the module shows) and Next. Replaces the site header and the
 * old step rail, so the scene and the lesson get the whole screen.
 */
import { useEffect, useRef } from 'react';
import { useProgress } from '../curriculum/progress';
import { KIND_LABEL, MODULE_BY_ID, stepDone } from './modules';
import { useLibrary } from './libraryStore';
import { exitPlayer, nextStep, openLibrary, playStep, previousStep } from './launch';
import { COURSE_STUDIES } from './imaging/catalog';
import { stepTitle } from './Library';
import { usePlayerUI } from './playerUI';
import { CASE_BY_ID } from '../challenge/sceneCases';
import { useCaseRun } from './caseRun';
import { titleOf } from '../curriculum/titles';
import { useGame } from './game';
import { useCompare } from '../scene/compare';

export function PlayerTop() {
  const playing = useLibrary((s) => s.playing); const solo = useLibrary((s) => s.solo); const passed = useLibrary((s) => s.passed);
  const completed = useProgress((s) => s.completed); const attempts = useProgress((s) => s.attempts);
  const steps = usePlayerUI((s) => s.steps); const details = usePlayerUI((s) => s.details); const set = usePlayerUI((s) => s.set);
  const caseId = useCaseRun((s) => s.id); const gameOn = useGame((s) => !!s.id); const debrief = useGame((s) => !!s.debrief); const readers = usePlayerUI((s) => s.readers);
  const drawer = (readers > 0 || gameOn) && !(caseId && CASE_BY_ID[caseId]);
  const pop = useRef<HTMLDivElement>(null); const cmpAvail = useCompare((s) => s.available); const cmpOn = useCompare((s) => s.on);
  const cmpBtn = cmpAvail && <button className={`lp-pill lp-cmp${cmpOn ? ' on' : ''}`} aria-pressed={cmpOn} onClick={() => useCompare.getState().set({ on: !cmpOn, pair: 0 })} title="Compare with normal, side by side" aria-label="Compare with normal"><span className="lp-cmp-i" aria-hidden="true">◧</span><span className="lp-cmp-t">Compare</span></button>;
  useEffect(() => {
    if (!steps) return;
    const close = (e: PointerEvent) => { if (pop.current && !pop.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('.lp-dots')) set({ steps: false }); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') set({ steps: false }); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc); };
  }, [steps, set]);

  if (solo && !playing) {
    const title = CASE_BY_ID[solo]?.title ?? titleOf(solo);
    return (
      <header className="topbar topbar-v2 lp-top">
        <button className="lp-exit" onClick={() => exitPlayer()}><span aria-hidden="true">←</span> Cases</button>
        <div className="lp-where"><b>{title}</b><span>Case</span></div>
        <div className="lp-end">
          {cmpBtn}
          {drawer && <button className={`lp-pill${details ? ' on' : ''}`} aria-pressed={details} onClick={() => set({ details: !details })}>Details</button>}
        </div>
      </header>
    );
  }
  if (!playing) return null;
  const m = MODULE_BY_ID[playing.moduleId]; if (!m) return null;
  const cur = m.steps[playing.step]; const last = playing.step === m.steps.length - 1;
  const onCase = cur.kind === 'case' && !!caseId;
  const nextLabel = onCase && !debrief ? (last ? 'Skip and finish' : 'Skip case') : last ? 'Finish' : 'Next step';
  return (
    <header className="topbar topbar-v2 lp-top">
      <button className="lp-exit" onClick={() => exitPlayer()} aria-label={`Exit ${m.title}`}><span aria-hidden="true">←</span><span className="lp-exit-t"> Exit</span></button>
      <div className="lp-where"><b>{m.title}</b><span>Step {playing.step + 1} of {m.steps.length} · <em className={`k-${cur.kind}`}>{KIND_LABEL[cur.kind]}</em> · {stepTitle(cur)}</span></div>
      <button className="lp-dots" aria-expanded={steps} aria-haspopup="true" aria-label={`Steps, ${playing.step + 1} of ${m.steps.length}`} onClick={() => set({ steps: !steps })}>
        {m.steps.map((_, i) => <i key={i} className={i === playing.step ? 'on' : stepDone(m.id, i, completed, attempts, passed) ? 'done' : ''} />)}
      </button>
      <div className="lp-end">
        {cmpBtn}
        {drawer && <button className={`lp-pill${details ? ' on' : ''}`} aria-pressed={details} onClick={() => set({ details: !details })}>Details</button>}
        <button className={`lp-next${onCase && !debrief ? ' quiet' : ''}`} onClick={() => { set({ steps: false, details: false }); nextStep(); }}>{nextLabel} <span aria-hidden="true">→</span></button>
      </div>
      {steps && <div className="lp-steps" ref={pop} role="dialog" aria-label={`${m.title} steps`}>
        <ol>{m.steps.map((s, i) => {
          const done = stepDone(m.id, i, completed, attempts, passed); const now = i === playing.step;
          return <li key={i}><button className={`step-rail-item${now ? ' now' : ''}${done ? ' done' : ''}`} aria-current={now ? 'step' : undefined} onClick={() => { set({ steps: false }); playStep(m.id, i); }}>
            <span className="lib-step-n" aria-hidden="true">{done && !now ? '✓' : i + 1}</span>
            <span><b className={`k-${s.kind}`}>Step {i + 1} · {KIND_LABEL[s.kind]}{now && <em>Now</em>}</b><span>{stepTitle(s)}</span></span>
          </button></li>;
        })}</ol>
        <div className="lp-steps-foot">
          <button className="lib-btn" disabled={playing.step === 0} onClick={() => { set({ steps: false }); previousStep(); }}>Previous step</button>
          {COURSE_STUDIES[m.id]?.length > 0 && <button className="lib-link" onClick={() => openLibrary({ page: 'imaging', moduleId: m.id })}>Real clinical images for this course</button>}
        </div>
      </div>}
    </header>
  );
}
