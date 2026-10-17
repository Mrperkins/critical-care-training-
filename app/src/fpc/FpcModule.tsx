/**
 * FP-C exam prep: the IBSC blueprint as a course. Home shows every domain with its exam weight and progress;
 * a domain lists its lessons; a lesson opens on the choice between the full course and the TL;DR, then reads
 * like a well-set chapter (narration per paragraph when a clip exists), ending with an exam-style question set.
 */
import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { BLUEPRINT, BY_WEIGHT, DOMAIN, TOTAL_ITEMS, type DomainId } from './blueprint';
import { FPC_BY_ID, lessonsFor } from './index';
import { clipId, lessonMinutes, type FpcLesson, type Question, type Section } from './types';
import { voice } from '../app/voice';
import { openLesson, openDrug } from '../app/navigate';
import { useProgress } from '../curriculum/progress';

/* ------------------------------------------------------------------ state: where you are and your best scores */
const SCORE_KEY = 'cc.fpc.scores.v1';
const readScores = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(SCORE_KEY) ?? '{}'); } catch { return {}; } };
interface FpcUI { domain: DomainId | null; lesson: string | null; track: 'full' | 'tldr' | null; scores: Record<string, number>; set: (p: Partial<FpcUI>) => void; score: (id: string, pct: number) => void }
export const useFpc = create<FpcUI>((set, get) => ({
  domain: null, lesson: null, track: null, scores: readScores(), set: (p) => set(p),
  score: (id, pct) => { const scores = { ...get().scores, [id]: Math.max(pct, get().scores[id] ?? 0) }; try { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); } catch { /* storage unavailable */ } set({ scores }); },
}));
const PASS = 80;

export default function FpcModule() {
  const domain = useFpc((s) => s.domain); const lesson = useFpc((s) => s.lesson); const track = useFpc((s) => s.track);
  useEffect(() => () => voice.stop(), []);
  const l = lesson ? FPC_BY_ID[lesson] : null;
  return (
    <main id="controls" tabIndex={-1} className="stage fpc-stage">
      <div className="fpc-page">
        {l ? (track ? <Reader l={l} track={track} /> : <Choice l={l} />) : domain ? <DomainView id={domain} /> : <CourseHome />}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ course home: the blueprint */
function CourseHome() {
  const scores = useFpc((s) => s.scores);
  return (
    <>
      <header className="fpc-head">
        <h2>Certified Flight Paramedic exam prep</h2>
        <p>Organised on the IBSC FP-C content outline: {TOTAL_ITEMS} scored items across ten domains. Each domain is weighted the way the exam weights it, and every lesson comes as a full course or a TL;DR.</p>
      </header>
      <section className="fpc-blueprint" aria-labelledby="bp-title">
        <h3 id="bp-title">Domains, by exam weight</h3>
        <ul>{BY_WEIGHT.map((d) => {
          const ls = lessonsFor(d.id); const passed = ls.filter((l) => (scores[l.id] ?? 0) >= PASS).length;
          return <li key={d.id}><button onClick={() => useFpc.getState().set({ domain: d.id })} disabled={!ls.length} aria-describedby={`bp-${d.id}`}>
            <span className="bp-num">{d.num}</span>
            <span className="bp-title">{d.title}</span>
            <span className="bp-weight" aria-label={`${d.items} of ${TOTAL_ITEMS} items`}><i style={{ width: `${(d.items / 17) * 100}%` }} />{d.items} items</span>
            <span className="bp-status" id={`bp-${d.id}`}>{ls.length ? `${passed} of ${d.topics.length} passed` : 'In preparation'}</span>
          </button></li>;
        })}</ul>
      </section>
      <p className="fpc-note">Lesson text is this app’s own, written to the published FP-C outline and cited to open guidelines and references. It is a study aid, not a substitute for your programme’s protocols.</p>
    </>
  );
}

/* ------------------------------------------------------------------ one domain */
function DomainView({ id }: { id: DomainId }) {
  const d = DOMAIN[id]; const ls = lessonsFor(id); const scores = useFpc((s) => s.scores);
  return (
    <>
      <button className="course-back" onClick={() => useFpc.getState().set({ domain: null })}>All domains</button>
      <header className="fpc-head">
        <p className="fpc-kicker">Domain {d.num}, {d.items} of {TOTAL_ITEMS} exam items</p>
        <h2>{d.title}</h2>
      </header>
      <ol className="fpc-lessons">{d.topics.map((t, i) => {
        const l = ls.find((x) => x.ref === `${d.num}.${i + 1}`); const sc = l ? scores[l.id] : undefined;
        return <li key={t}>{l ? <button onClick={() => useFpc.getState().set({ lesson: l.id, track: null })}>
          <span className="fl-ref">{l.ref}</span>
          <span className="fl-t">{l.title}<small>{l.summary}</small></span>
          <span className="fl-len">{lessonMinutes(l, 'full')} min<small>TL;DR {lessonMinutes(l, 'tldr')} min</small></span>
          <span className={`fl-score${sc != null && sc >= PASS ? ' pass' : ''}`}>{sc == null ? 'Not started' : `Best ${sc}%`}</span>
        </button> : <div className="fl-planned"><span className="fl-ref">{d.num}.{i + 1}</span><span className="fl-t">{t}<small>In preparation</small></span></div>}</li>;
      })}</ol>
    </>
  );
}

/* ------------------------------------------------------------------ the choice */
function Choice({ l }: { l: FpcLesson }) {
  const go = (track: 'full' | 'tldr') => { useFpc.getState().set({ track }); useProgress.getState().rememberLesson({ lessonId: l.id, t: 0, title: l.title }); window.scrollTo?.({ top: 0 }); };
  return (
    <section className="course course-choice fpc-choice" aria-labelledby="fpc-choice-title">
      <button className="course-back" onClick={() => useFpc.getState().set({ lesson: null })}>{DOMAIN[l.domain].title}</button>
      <p className="fpc-kicker">FP-C {l.ref}</p>
      <h2 id="fpc-choice-title" className="course-title">{l.title}</h2>
      <p className="course-blurb">{l.summary}</p>
      <div className="track-options" role="group" aria-label="Choose how to take this lesson">
        <button className="track-option" onClick={() => go('full')}>
          <span className="track-name">Full course</span>
          <span className="track-meta">{lessonMinutes(l, 'full')} min, {l.sections.length} sections, {l.questions.length} exam-style questions</span>
          <ul className="track-list">{l.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
          <span className="track-go">Start the full course</span>
        </button>
        <button className="track-option tldr" onClick={() => go('tldr')}>
          <span className="track-name">TL;DR</span>
          <span className="track-meta">{lessonMinutes(l, 'tldr')} min, the {l.keyPoints.length} points that matter most and a 5-question check</span>
          <ul className="track-list">{l.keyPoints.slice(0, 3).map((o) => <li key={o}>{o}</li>)}</ul>
          <span className="track-go">Start the TL;DR</span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ the reader */
function Reader({ l, track }: { l: FpcLesson; track: 'full' | 'tldr' }) {
  const sections = track === 'full' ? l.sections : l.sections.filter((s) => s.core);
  const questions = track === 'full' ? l.questions : l.questions.slice(0, 5);
  const ls = lessonsFor(l.domain); const i = ls.findIndex((x) => x.id === l.id); const next = ls[i + 1];
  return (
    <article className={`fpc-reader track-${track}`} aria-labelledby="fpc-title">
      <div className="course-bar">
        <button className="course-back" onClick={() => { voice.stop(); useFpc.getState().set({ lesson: null, track: null }); }}>{DOMAIN[l.domain].title}</button>
        <div className="track-switch" role="radiogroup" aria-label="Course length">
          {(['full', 'tldr'] as const).map((k) => <button key={k} role="radio" aria-checked={track === k} className={track === k ? 'on' : ''} onClick={() => useFpc.getState().set({ track: k })}>{k === 'full' ? 'Full course' : 'TL;DR'}</button>)}
        </div>
      </div>
      <header className="fpc-article-head">
        <p className="fpc-kicker">FP-C {l.ref}, {lessonMinutes(l, track)} min</p>
        <h2 id="fpc-title">{l.title}</h2>
        <p className="fpc-dek">{l.summary}</p>
      </header>
      {track === 'tldr' && <KeyPoints l={l} title="What matters most" />}
      {track === 'full' && <section className="fpc-objectives"><h3>By the end you can</h3><ul>{l.objectives.map((o) => <li key={o}>{o}</li>)}</ul></section>}
      <nav className="fpc-toc" aria-label="Sections"><ol>{sections.map((s) => <li key={s.id}><a href={`#s-${l.id}-${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`s-${l.id}-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{s.title}</a></li>)}</ol></nav>
      {sections.map((s) => <SectionView key={s.id} l={l} s={s} />)}
      {track === 'full' && <>
        <KeyPoints l={l} title="Summary" />
        <div className="fpc-pp"><section><h3>Pearls</h3><ul>{l.pearls.map((p) => <li key={p}>{p}</li>)}</ul></section><section className="pit"><h3>Pitfalls</h3><ul>{l.pitfalls.map((p) => <li key={p}>{p}</li>)}</ul></section></div>
      </>}
      {(l.live?.length ?? 0) > 0 && <section className="fpc-live"><h3>See it on the live model</h3><div>{l.live!.map((x) => <button key={x.id} className="act" onClick={() => (x.id.startsWith('moa-') ? openDrug(x.id.slice(4)) : openLesson(x.id))}>{x.label}</button>)}</div></section>}
      <Quiz key={`${l.id}-${track}`} l={l} questions={questions} />
      <section className="fpc-sources"><h3>Sources and further reading</h3><ul>{l.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></section>
      <div className="fpc-next">
        {track === 'tldr' && <button className="act primary" onClick={() => { useFpc.getState().set({ track: 'full' }); window.scrollTo?.({ top: 0 }); }}>Take the full course</button>}
        {next && <button className="act" onClick={() => { voice.stop(); useFpc.getState().set({ lesson: next.id, track: null }); window.scrollTo?.({ top: 0 }); }}>Next: {next.title}</button>}
      </div>
    </article>
  );
}

function KeyPoints({ l, title }: { l: FpcLesson; title: string }) {
  return <section className="recap fpc-keypoints"><h3>{title}</h3><ol className="recap-points">{l.keyPoints.map((p) => <li key={p}>{p}</li>)}</ol></section>;
}

/** one section: paragraphs (each narrated when its clip exists), then the list, table and worked example */
function SectionView({ l, s }: { l: FpcLesson; s: Section }) {
  const ids = s.body.map((_, n) => clipId(l.id, s.id, n)); const narrated = ids.some((id) => voice.has(id));
  const [playing, setPlaying] = useState(-1);
  const playFrom = (n: number) => { if (n >= ids.length) { setPlaying(-1); return; } setPlaying(n); if (!voice.play(ids[n], () => playFrom(n + 1))) playFrom(n + 1); };
  useEffect(() => () => { if (playing >= 0) voice.stop(); }, [playing]);
  return (
    <section className="fpc-section" id={`s-${l.id}-${s.id}`} aria-labelledby={`h-${l.id}-${s.id}`}>
      <div className="fpc-section-h">
        <h3 id={`h-${l.id}-${s.id}`}>{s.title}</h3>
        {narrated && <button className="topt" aria-pressed={playing >= 0} onClick={() => (playing >= 0 ? (voice.stop(), setPlaying(-1)) : playFrom(0))}>{playing >= 0 ? 'Stop' : 'Listen'}</button>}
      </div>
      {s.body.map((p, n) => <p key={n} className={playing === n ? 'speaking' : undefined}>{p}</p>)}
      {s.list && <div className="fpc-list"><h4>{s.list.caption}</h4>{s.list.ordered ? <ol>{s.list.items.map((x) => <li key={x}>{x}</li>)}</ol> : <ul>{s.list.items.map((x) => <li key={x}>{x}</li>)}</ul>}</div>}
      {s.table && <figure className="fpc-table"><figcaption>{s.table.caption}</figcaption><div className="fpc-table-scroll"><table><thead><tr>{s.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{s.table.rows.map((r, k) => <tr key={k}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody></table></div></figure>}
      {s.example && <div className="fpc-example"><h4>Worked example</h4><p className="ex-case">{s.example.case}</p><ol>{s.example.steps.map((x) => <li key={x}>{x}</li>)}</ol></div>}
    </section>
  );
}

/* ------------------------------------------------------------------ exam-style questions */
function Quiz({ l, questions }: { l: FpcLesson; questions: Question[] }) {
  const [picks, setPicks] = useState<(number | null)[]>(() => questions.map(() => null));
  const answered = picks.filter((p) => p != null).length; const right = picks.filter((p, i) => p === questions[i].answer).length;
  const pct = Math.round((100 * right) / questions.length); const done = answered === questions.length;
  useEffect(() => { if (done) { useFpc.getState().score(l.id, pct); if (pct >= PASS) useProgress.getState().markComplete(l.id); } }, [done]); // eslint-disable-line react-hooks/exhaustive-deps
  const order = useMemo(() => questions.map((q) => q.options.map((_, i) => i)), [questions]);
  return (
    <section className="fpc-quiz" aria-labelledby={`quiz-${l.id}`}>
      <div className="fpc-section-h"><h3 id={`quiz-${l.id}`}>Exam-style questions</h3><span className="fpc-quiz-count">{answered} of {questions.length} answered</span></div>
      {questions.map((q, i) => (
        <fieldset key={i} className="selfcheck">
          <legend>{i + 1}. {q.q}</legend>
          {order[i].map((k) => { const p = picks[i]; return <button key={k} type="button" disabled={p != null} aria-pressed={p === k} className={p == null ? '' : k === q.answer ? 'right' : k === p ? 'wrong' : 'muted'} onClick={() => setPicks((ps) => ps.map((x, j) => (j === i ? k : x)))}><b>{'ABCD'[k]}.</b> {q.options[k]}</button>; })}
          {picks[i] != null && <p role="status" className={picks[i] === q.answer ? 'sc-right' : 'sc-wrong'}><b>{picks[i] === q.answer ? 'Correct.' : `The answer is ${'ABCD'[q.answer]}.`}</b> {q.why}</p>}
        </fieldset>
      ))}
      {done && <div className={`fpc-score${pct >= PASS ? ' pass' : ''}`} role="status"><b>{right} of {questions.length} ({pct}%)</b> {pct >= PASS ? 'Passed. This lesson is marked complete.' : `Aim for ${PASS}% — reread the sections behind the questions you missed and try again.`}<button className="act" onClick={() => setPicks(questions.map(() => null))}>Try again</button></div>}
    </section>
  );
}

export { BLUEPRINT };
