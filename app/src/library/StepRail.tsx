/**
 * The player column beside the clinical workspace. While a module plays it lists the steps; on a case
 * step (or a case opened on its own) it becomes the case shell. On phones it folds into a bar under
 * the workspace that expands into the full list.
 */
import { useState } from 'react';
import { useProgress } from '../curriculum/progress';
import { KIND_LABEL, MODULE_BY_ID, SHELF_BY_ID, stepDone } from './modules';
import { useLibrary } from './libraryStore';
import { exitPlayer, nextStep, openLibrary, playStep, previousStep } from './launch';
import { COURSE_STUDIES } from './imaging/catalog';
import { stepTitle } from './Library';
import { CaseRunner } from './CaseRunner';
import { useCaseRun } from './caseRun';

function SoloCase() {
  return (
    <aside className="step-rail case-mode open" aria-label="Case">
      <div className="step-rail-h">
        <button className="step-rail-module" onClick={() => exitPlayer()}><small>Cases</small><b>Back to cases</b></button>
      </div>
      <div className="step-rail-case"><CaseRunner /></div>
    </aside>
  );
}

export function StepRail() {
  const playing = useLibrary((s) => s.playing); const solo = useLibrary((s) => s.solo); const passed = useLibrary((s) => s.passed);
  const completed = useProgress((s) => s.completed); const attempts = useProgress((s) => s.attempts);
  const caseId = useCaseRun((s) => s.id);
  const [open, setOpen] = useState(false);
  if (solo && !playing) return <SoloCase />;
  if (!playing) return null;
  const m = MODULE_BY_ID[playing.moduleId]; if (!m) return null;
  const cur = m.steps[playing.step]; const last = playing.step === m.steps.length - 1;
  const onCase = cur.kind === 'case' && !!caseId;
  return (
    <aside className={`step-rail${open ? ' open' : ''}${onCase ? ' case-mode' : ''}`} aria-label={`${m.title} steps`}>
      <div className="step-rail-h">
        <button className="step-rail-module" onClick={() => exitPlayer()}><small>{SHELF_BY_ID[m.shelf].title}</small><b>{m.title}</b></button>
        <button className="step-rail-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>Step {playing.step + 1} of {m.steps.length}<span className="sr-only">: {stepTitle(cur)}</span></button>
      </div>
      {onCase && !open
        ? <div className="step-rail-case"><CaseRunner onNext={nextStep} nextLabel={last ? 'Finish module' : 'Next step'} /></div>
        : <ol className="step-rail-list">
          {m.steps.map((s, i) => {
            const done = stepDone(m.id, i, completed, attempts, passed); const now = i === playing.step;
            return <li key={i}><button className={`step-rail-item${now ? ' now' : ''}${done ? ' done' : ''}`} aria-current={now ? 'step' : undefined} onClick={() => { playStep(m.id, i); setOpen(false); }}>
              <span className="lib-step-n" aria-hidden="true">{done && !now ? '✓' : i + 1}</span>
              <span><b className={`k-${s.kind}`}>Step {i + 1} · {KIND_LABEL[s.kind]}{now && <em>Now</em>}</b><span>{stepTitle(s)}</span></span>
            </button></li>;
          })}
        </ol>}
      <div className="step-rail-foot">
        <p className="step-rail-now"><b className={`k-${cur.kind}`}>{KIND_LABEL[cur.kind]}</b> {stepTitle(cur)}</p>
        {COURSE_STUDIES[m.id]?.length > 0 && <button className="lib-link step-rail-imaging" onClick={() => openLibrary({ page: 'imaging', moduleId: m.id })}>Learn imaging: anatomy, technique and real studies</button>}
        <div className="step-rail-nav">
          <button className="lib-btn" disabled={playing.step === 0} onClick={previousStep}>Back</button>
          <button className={`lib-btn${onCase ? '' : ' primary'}`} onClick={nextStep}>{onCase ? (last ? 'Skip and finish' : 'Skip case') : last ? 'Finish module' : 'Next step'}</button>
        </div>
      </div>
    </aside>
  );
}
