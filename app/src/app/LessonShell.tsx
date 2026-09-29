import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { stepTimeline, stepIndexAt, type Timeline } from '../director/timeline';
import { WorkflowRunner } from '../workflows/WorkflowRunner';
import type { Workflow } from '../workflows/workflow';

export interface ShellLesson { id: string; title: string; level: string; blurb: string; steps: { id: string; title: string; say: string }[] }

/**
 * Lesson list + narrated player shared by every module, running on the Lesson Director:
 * each step is a cue on a deterministic clock (seekable, pausable, no timer chains);
 * `apply(lesson, i)` puts the live model into the step's state.
 */
export function LessonShell<L extends ShellLesson>({ lessons, apply, intro, children, reference, timelines, timelineChildren, workflows, workflowChildren }: { lessons: L[]; apply: (l: L, i: number) => void; intro: string; children?: (l: L, i: number) => ReactNode; reference?: () => ReactNode; timelines?: Timeline[]; timelineChildren?: () => ReactNode; workflows?: Workflow[]; workflowChildren?: () => ReactNode }) {
  const [tab, setTab] = useState<'lessons' | 'normals'>('lessons');
  const [lesson, setLesson] = useState<L | null>(null); const [sig, setSig] = useState<Timeline | null>(null); const [wf, setWf] = useState<Workflow | null>(null);
  useEffect(() => { if (sig) director.load(sig, true); return () => { if (sig) director.unload(); }; }, [sig]);
  const tl = useMemo(() => lesson && stepTimeline(lesson.id, lesson.title, lesson.steps.map((st, k) => ({ id: st.id, title: st.title, say: st.say, voice: st.id, apply: () => apply(lesson, k) }))), [lesson]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tl) director.load(tl, true); return () => director.unload(); }, [tl]);
  const t = useDirector((s) => s.t); const i = tl ? Math.max(0, stepIndexAt(tl, t)) : 0;
  const tabs = reference && <div className="seg learn-tabs" role="tablist">{([['lessons', 'Lessons'], ['normals', 'Normal values']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>;
  if (!lesson && tab === 'normals' && reference) return <div className="chal-list">{tabs}{reference()}</div>;
  if (wf) return <WorkflowRunner wf={wf} onExit={() => setWf(null)}>{workflowChildren?.()}</WorkflowRunner>;
  if (sig) return (
    <div className="chal-run">
      <DirectorPlayer onExit={() => setSig(null)} />
      {timelineChildren?.()}
    </div>
  );
  if (!lesson) return (
    <div className="chal-list">
      {tabs}
      <section className="card"><div className="eyebrow">Guided learning</div><h2 className="h2">Narrated lessons on the live model</h2><p className="muted">{intro}</p></section>
      {timelines?.map((l) => (
        <button key={l.id} className="chal-item sig" onClick={() => setSig(l)}>
          <span className="lvl lvl-sig">Signature</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k">{l.cues.filter((c) => c.say).length} scenes</span>
        </button>
      ))}
      {workflows?.map((w) => (
        <button key={w.id} className="chal-item" onClick={() => setWf(w)}>
          <span className="lvl lvl-proc">Procedure</span><span className="ci-t">{w.title}<small className="ci-b">{w.blurb}</small></span><span className="ci-k">{w.steps.length} steps</span>
        </button>
      ))}
      {lessons.map((l) => (
        <button key={l.id} className="chal-item" onClick={() => setLesson(l)}>
          <span className={`lvl lvl-${l.level}`}>{l.level}</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k">{l.steps.length} steps</span>
        </button>
      ))}
    </div>
  );
  return (
    <div className="chal-run">
      <DirectorPlayer onExit={() => setLesson(null)} />
      {children?.(lesson, i)}
      {reference && <details className="card nm-details"><summary>Normal values</summary>{reference()}</details>}
    </div>
  );
}
