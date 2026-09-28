import { useEffect, useState, type ReactNode } from 'react';
import { voice } from './voice';

export interface ShellLesson { id: string; title: string; level: string; blurb: string; steps: { id: string; title: string; say: string }[] }

/** Lesson list + narrated step player shared by every module. `apply(lesson, i)` puts the live model into the step's state. */
export function LessonShell<L extends ShellLesson>({ lessons, apply, intro, children, reference }: { lessons: L[]; apply: (l: L, i: number) => void; intro: string; children?: (l: L, i: number) => ReactNode; reference?: () => ReactNode }) {
  const [tab, setTab] = useState<'lessons' | 'normals'>('lessons');
  const [lesson, setLesson] = useState<L | null>(null); const [i, setI] = useState(0); const [auto, setAuto] = useState(true); const [talking, setTalking] = useState(false);
  useEffect(() => () => voice.stop(), []);
  useEffect(() => {
    if (!lesson) return; apply(lesson, i);
    const st = lesson.steps[i]; setTalking(true);
    const ok = voice.play(st.id, () => { setTalking(false); if (auto && i < lesson.steps.length - 1) setTimeout(() => setI((x) => (x === i ? Math.min(lesson.steps.length - 1, x + 1) : x)), 1800); });
    if (!ok) setTalking(false);
  }, [lesson, i]); // eslint-disable-line react-hooks/exhaustive-deps
  const tabs = reference && <div className="seg learn-tabs" role="tablist">{([['lessons', 'Lessons'], ['normals', 'Normal values']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>;
  if (!lesson && tab === 'normals' && reference) return <div className="chal-list">{tabs}{reference()}</div>;
  if (!lesson) return (
    <div className="chal-list">
      {tabs}
      <section className="card"><div className="eyebrow">Guided learning</div><h2 className="h2">Narrated lessons on the live model</h2><p className="muted">{intro}</p></section>
      {lessons.map((l) => (
        <button key={l.id} className="chal-item" onClick={() => { setI(0); setLesson(l); }}>
          <span className={`lvl lvl-${l.level}`}>{l.level}</span><span className="ci-t">{l.title}<small className="ci-b">{l.blurb}</small></span><span className="ci-k">{l.steps.length} steps</span>
        </button>
      ))}
    </div>
  );
  const st = lesson.steps[Math.min(i, lesson.steps.length - 1)];
  return (
    <div className="chal-run">
      <button className="back" onClick={() => { voice.stop(); setLesson(null); }}>← All lessons</button>
      <section className="card lesson">
        <div className="eyebrow">{lesson.title} · {i + 1}/{lesson.steps.length}</div>
        <h2 className="h2">{st.title}</h2>
        <p className="say">{st.say}</p>
        <div className="steps-dots">{lesson.steps.map((s, k) => <button key={s.id} aria-label={`step ${k + 1}`} className={k === i ? 'on' : k < i ? 'past' : ''} onClick={() => setI(k)} />)}</div>
        <div className="actions">
          <button className="act" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</button>
          {voice.has(st.id) && <button className="act" onClick={() => { if (talking) { voice.stop(); setTalking(false); } else { setTalking(true); if (!voice.play(st.id, () => setTalking(false))) setTalking(false); } }}>{talking ? 'Pause voice' : 'Play voice'}</button>}
          <button className={`act${auto ? ' done' : ''}`} onClick={() => setAuto(!auto)}>Auto-advance {auto ? 'on' : 'off'}</button>
          <button className="act primary" disabled={i === lesson.steps.length - 1} onClick={() => setI(i + 1)}>Next →</button>
        </div>
      </section>
      {children?.(lesson, i)}
      {reference && <details className="card nm-details"><summary>Normal values</summary>{reference()}</details>}
    </div>
  );
}
