import { DiseaseBrowser } from '../atlas/DiseaseBrowser';
import { useUI } from './store';
import type { AtlasDomain } from '../atlas/types';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { director, useDirector } from '../director/director';
import { DirectorPlayer } from '../director/Player';
import { stepTimeline, stepIndexAt, type Timeline } from '../director/timeline';
import { WorkflowRunner } from '../workflows/WorkflowRunner';
import type { Workflow } from '../workflows/workflow';
import { usePendingOpen } from './navigate';
import { useProgress } from '../curriculum/progress';
import { courseFor, trackSummary } from '../director/course';

export interface ShellLesson { id: string; title: string; level: string; blurb: string; steps: { id: string; title: string; say: string }[] }

/**
 * Lesson list + narrated player shared by every module, running on the Lesson Director:
 * each step is a cue on a deterministic clock (seekable, pausable, no timer chains);
 * `apply(lesson, i)` puts the live model into the step's state.
 */
export function LessonShell<L extends ShellLesson>({ lessons, apply, intro, children, reference, timelines, timelineChildren, workflows, workflowChildren }: { lessons: L[]; apply: (l: L, i: number) => void; intro: string; children?: (l: L, i: number) => ReactNode; reference?: () => ReactNode; timelines?: Timeline[]; timelineChildren?: () => ReactNode; workflows?: Workflow[]; workflowChildren?: (wf: Workflow) => ReactNode }) {
  const domain = useUI(s => s.module);
  const [query, setQuery] = useState('');
  const match = (l:{title:string;blurb?:string}) => `${l.title} ${l.blurb ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
  const [tab, setTab] = useState<'lessons' | 'normals'>('lessons');
  const [lesson, setLesson] = useState<L | null>(null); const [sig, setSig] = useState<Timeline | null>(null); const [wf, setWf] = useState<Workflow | null>(null);
  // a deep link (curriculum, remediation) asked for one of this module's step lessons or workflows
  const pend = usePendingOpen();
  useEffect(() => { if (!pend.id) return; if (pend.kind === 'step') { const l = lessons.find((x) => x.id === pend.id); if (l) { setLesson(l); pend.set({ kind: null, id: null }); } } else if (pend.kind === 'workflow') { const w = workflows?.find((x) => x.id === pend.id); if (w) { setWf(w); pend.set({ kind: null, id: null }); } } }, [pend.id]); // eslint-disable-line react-hooks/exhaustive-deps
  // adopt a lesson that was loaded from elsewhere (e.g. "back to the lesson" from a drug mechanism) instead of reloading it
  const dtl = useDirector((s) => s.tl);
  useEffect(() => { if (!sig && !lesson && dtl && timelines?.some((x) => x.id === dtl.id)) setSig(timelines.find((x) => x.id === dtl.id)!); }, [dtl]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (sig && useDirector.getState().tl?.id !== sig.id) director.load(sig, true); return () => { if (sig) director.unload(); }; }, [sig]);
  const tl = useMemo(() => lesson && stepTimeline(lesson.id, lesson.title, lesson.steps.map((st, k) => ({ id: st.id, title: st.title, say: st.say, voice: st.id, apply: () => apply(lesson, k) }))), [lesson]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tl) director.load(tl, true); return () => director.unload(); }, [tl]);
  const t = useDirector((s) => s.t); const i = tl ? Math.max(0, stepIndexAt(tl, t)) : 0;
  const tabs = reference && <div className="seg learn-tabs" role="tablist">{([['lessons', 'Lessons'], ['normals', 'Normal values']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>;
  if (!lesson && tab === 'normals' && reference) return <div className="chal-list">{tabs}{reference()}</div>;
  if (wf) return <WorkflowRunner wf={wf} onExit={() => setWf(null)} onDone={() => useProgress.getState().markComplete(wf.id)}>{workflowChildren?.(wf)}</WorkflowRunner>;
  if (sig) return (
    <div className="chal-run">
      <DirectorPlayer onExit={() => setSig(null)} />
      {timelineChildren?.()}
    </div>
  );
  if (!lesson) return (
    <div className="chal-list">
      {tabs}
      <header className="learn-intro"><h2>Lessons</h2><p>{intro} Every lesson comes as a full course or a short TL;DR.</p></header>
      <label className="lesson-search">Find a lesson or disease<input type="search" placeholder="Search topics…" value={query} onChange={e=>setQuery(e.target.value)} /></label>
      {['vent','heart','neuro','lines','abdomen','labs','pediatrics','womens'].includes(domain) && <DiseaseBrowser domain={domain as AtlasDomain} query={query} />}
      {(timelines?.filter(match).length ?? 0) > 0 && <details className="lesson-group" key={`guided-${!!query}`} open={!!query}><summary>Guided organ explainers <span>{timelines!.filter(match).length}</span></summary>
      {timelines?.filter(match).map((l) => (
        <button key={l.id} className="chal-item sig" onClick={() => setSig(l)}>
          <span className="lvl lvl-sig">Explainer</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k"><LessonLength tl={l} /></span>
        </button>
      ))}
      </details>}
      {(workflows?.filter(match).length ?? 0) > 0 && <details className="lesson-group" key={`procedures-${!!query}`} open={!!query}><summary>Procedures <span>{workflows!.filter(match).length}</span></summary>
      {workflows?.filter(match).map((w) => (
        <button key={w.id} className="chal-item" onClick={() => setWf(w)}>
          <span className="lvl lvl-proc">Procedure</span><span className="ci-t">{w.title}<small className="ci-b">{w.blurb}</small></span><span className="ci-k">{w.steps.length} steps</span>
        </button>
      ))}
      </details>}
      {lessons.filter(match).length > 0 && <details className="lesson-group" key={`fundamentals-${!!query}`} open={!!query}><summary>Fundamentals <span>{lessons.filter(match).length}</span></summary>
      {lessons.filter(match).map((l) => (
        <button key={l.id} className="chal-item" onClick={() => setLesson(l)}>
          <span className={`lvl lvl-${l.level}`}>{l.level}</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k"><LessonLength tl={stepTimeline(l.id, l.title, l.steps.map((st) => ({ id: st.id, title: st.title, say: st.say })))} /></span>
        </button>
      ))}
      </details>}
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

/** "12 min · TL;DR 4" without the middle dot: full length, then the short track */
export function LessonLength({ tl }: { tl: Timeline }) {
  const s = useMemo(() => trackSummary(tl, courseFor(tl)), [tl]);
  return <>{s.full.min} min<small className="ci-tldr">TL;DR {s.tldr.min} min</small></>;
}
