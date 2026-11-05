/**
 * The module player's step list: sits beside the clinical workspace while a module is playing.
 * On phones it collapses to a bar (current step + Back/Next) that expands into the full list.
 */
import { useState } from 'react';
import { useProgress } from '../curriculum/progress';
import { KIND_LABEL, MODULE_BY_ID, SHELF_BY_ID, stepDone } from './modules';
import { useLibrary } from './libraryStore';
import { exitPlayer, nextStep, playStep, previousStep } from './launch';
import { stepTitle } from './Library';

export function StepRail() {
  const playing = useLibrary((s) => s.playing); const passed = useLibrary((s) => s.passed);
  const completed = useProgress((s) => s.completed); const attempts = useProgress((s) => s.attempts);
  const [open, setOpen] = useState(false);
  if (!playing) return null;
  const m = MODULE_BY_ID[playing.moduleId]; if (!m) return null;
  const cur = m.steps[playing.step]; const last = playing.step === m.steps.length - 1;
  return (
    <aside className={`step-rail${open ? ' open' : ''}`} aria-label={`${m.title} steps`}>
      <div className="step-rail-h">
        <button className="step-rail-module" onClick={() => exitPlayer()}><small>{SHELF_BY_ID[m.shelf].title}</small><b>{m.title}</b></button>
        <button className="step-rail-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>Step {playing.step + 1} of {m.steps.length}<span className="sr-only">: {stepTitle(cur)}</span></button>
      </div>
      <ol className="step-rail-list">
        {m.steps.map((s, i) => {
          const done = stepDone(m.id, i, completed, attempts, passed); const now = i === playing.step;
          return <li key={i}><button className={`step-rail-item${now ? ' now' : ''}${done ? ' done' : ''}`} aria-current={now ? 'step' : undefined} onClick={() => { playStep(m.id, i); setOpen(false); }}>
            <span className="lib-step-n" aria-hidden="true">{done && !now ? '✓' : i + 1}</span>
            <span><b className={`k-${s.kind}`}>Step {i + 1} · {KIND_LABEL[s.kind]}{now && <em>Now</em>}</b><span>{stepTitle(s)}</span></span>
          </button></li>;
        })}
      </ol>
      <div className="step-rail-foot">
        <p className="step-rail-now"><b className={`k-${cur.kind}`}>{KIND_LABEL[cur.kind]}</b> {stepTitle(cur)}</p>
        <div className="step-rail-nav">
          <button className="lib-btn" disabled={playing.step === 0} onClick={previousStep}>Back</button>
          <button className="lib-btn primary" onClick={nextStep}>{last ? 'Finish module' : 'Next step'}</button>
        </div>
      </div>
    </aside>
  );
}
