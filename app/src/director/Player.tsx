import { useState } from 'react';
import { voice } from '../app/voice';
/**
 * The course player. Three separate concerns, three separate controls:
 *  - the lesson (what is being taught) runs on its own transport: play, scrub, scenes, speed, voice;
 *  - the camera belongs to the learner: the lesson only suggests a view ("Frame this view");
 *  - the course track (Full or TL;DR) can be switched at any time and lands on the same scene.
 */
import { LESSON_DRUGS } from '../moa/meta';
import { MECH } from '../moa/registry';
import { openDrug } from '../app/navigate';
import { useProgress } from '../curriculum/progress';
import { CATALOG_BY_ID } from '../curriculum/catalog';
import { useDirector, director } from './director';
import { duration, steps, stepIndexAt } from './timeline';
import { trackSummary, type CourseMeta, type SelfCheck, type Track } from './course';
import { useCameraPolicy } from '../scene/cameraPolicy';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const Ico = ({ d, size = 18 }: { d: string; size?: number }) => <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true"><path d={d} fill="currentColor" /></svg>;
const PLAY = 'M8 5.5v13l10.5-6.5z', PAUSE = 'M7 5h3.6v14H7zM13.4 5H17v14h-3.6z', PREV = 'M6 5h2v14H6zM19 5.5v13L9.5 12z', NEXT = 'M16 5h2v14h-2zM5 5.5v13L14.5 12z';

export function DirectorPlayer({ onExit }: { onExit?: () => void }) {
  const tl = useDirector((s) => s.tl); const track = useDirector((s) => s.track); const course = useDirector((s) => s.course); const source = useDirector((s) => s.source);
  if (!tl) return null;
  const exit = onExit && (() => { director.unload(); onExit(); });
  if (!track && course && source) return <CourseChoice onExit={exit} />;
  return <CoursePlayer onExit={exit} />;
}

/* ------------------------------------------------------------------ the choice */
function CourseChoice({ onExit }: { onExit?: () => void }) {
  const src = useDirector((s) => s.source)!; const course = useDirector((s) => s.course)!;
  const sum = trackSummary(src, course);
  return (
    <section className="course course-choice" aria-labelledby="course-choice-title" data-lesson-transport>
      {onExit && <button className="course-back" onClick={onExit}>All lessons</button>}
      <h2 id="course-choice-title" className="course-title">{src.title}</h2>
      {src.blurb && <p className="course-blurb">{src.blurb}</p>}
      <div className="track-options" role="group" aria-label="Choose how to take this lesson">
        <button className="track-option" onClick={() => director.choose('full')}>
          <span className="track-name">Full course</span>
          <span className="track-meta">{sum.full.min} min, {sum.full.scenes} scene{sum.full.scenes === 1 ? '' : 's'}{sum.full.checkpoints ? `, ${sum.full.checkpoints} checkpoint${sum.full.checkpoints === 1 ? '' : 's'}` : ''}{sum.full.quiz ? ', self-check' : ''}</span>
          {course.objectives.length > 0 && <ul className="track-list">{course.objectives.map((o) => <li key={o}>{o}</li>)}</ul>}
          <span className="track-go">Start the full course</span>
        </button>
        <button className="track-option tldr" onClick={() => director.choose('tldr')}>
          <span className="track-name">TL;DR</span>
          <span className="track-meta">{sum.tldr.min} min, {sum.tldr.scenes} scenes, the {sum.tldr.points} points that matter most</span>
          <ul className="track-list">{course.keyPoints.slice(0, 3).map((o) => <li key={o}>{o}</li>)}</ul>
          <span className="track-go">Start the TL;DR</span>
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ the player */
function CoursePlayer({ onExit }: { onExit?: () => void }) {
  const tl = useDirector((s) => s.tl)!; const t = useDirector((s) => s.t); const playing = useDirector((s) => s.playing); const holding = useDirector((s) => s.holding);
  const muted = useDirector((s) => s.muted); const rate = useDirector((s) => s.rate); const speaking = useDirector((s) => s.speaking);
  const track = useDirector((s) => s.track) ?? 'full'; const course = useDirector((s) => s.course);
  const D = duration(tl); const S = steps(tl); const k = stepIndexAt(tl, t); const cur = k >= 0 ? S[k] : null;
  const finished = D > 0 && t >= D - 0.05 && !playing;
  return (
    <section className={`course course-player track-${track}`} aria-label={`${tl.title}, ${track === 'tldr' ? 'TL;DR' : 'full course'}`} data-lesson-transport>
      <div className="course-bar">
        {onExit && <button className="course-back" onClick={onExit}>All lessons</button>}
        {course && <TrackSwitch track={track} />}
      </div>
      <p className="course-kicker">{tl.title}</p>
      <p className="course-count">Scene {Math.max(1, k + 1)} of {S.length}</p>
      <h2 className="course-title">{cur?.title ?? tl.title}</h2>
      <p className="course-say" aria-live="polite">{cur?.say ?? tl.blurb}</p>
      {cur?.say && !voice.has(cur.voice ?? cur.id) && !muted && <p className="course-note">Captions only for this scene.</p>}
      {cur?.checkpoint && <Prediction key={cur.id} checkpoint={cur.checkpoint} />}

      <div className="transport" role="group" aria-label="Lesson playback">
        <div className="transport-keys">
          <button className="tkey" onClick={() => director.step(-1)} aria-label="Previous scene" disabled={k <= 0}><Ico d={PREV} /></button>
          <button className="tkey play" onClick={() => director.toggle()} aria-label={playing ? 'Pause' : finished ? 'Replay' : 'Play'}><Ico d={playing ? PAUSE : PLAY} size={22} /></button>
          <button className="tkey" onClick={() => director.step(1)} aria-label="Next scene" disabled={k >= S.length - 1}><Ico d={NEXT} /></button>
        </div>
        <div className="scrub">
          <input type="range" min={0} max={D} step={0.05} value={t} aria-label="Lesson time" aria-valuetext={`${mmss(t)} of ${mmss(D)}`} onChange={(e) => director.seek(+e.target.value)} style={{ ['--p' as string]: `${(t / (D || 1)) * 100}%` }} />
          <div className="scrub-ticks" aria-hidden="true">{S.map((c, i) => <span key={c.id} className={i === k ? 'on' : i < k ? 'past' : ''} style={{ left: `${(c.at / (D || 1)) * 100}%` }} />)}</div>
          <div className="scrub-time"><span>{mmss(t)}</span><span className="scrub-state">{holding ? 'Waiting for the narrator' : speaking ? 'Narrating' : ''}</span><span>{mmss(D)}</span></div>
        </div>
        <div className="transport-opts">
          <button className="topt" aria-pressed={!muted} onClick={() => director.setMuted(!muted)}>{muted ? 'Voice off' : 'Voice on'}</button>
          <button className="topt" aria-label={`Playback speed ${rate}×`} onClick={() => director.setRate(rate >= 2 ? 0.75 : rate + 0.25)}>{rate.toFixed(2).replace(/0$/, '').replace(/\.0$/, '')}×</button>
          {CATALOG_BY_ID[tl.id] && <BookmarkBtn id={tl.id} t={t} title={`${tl.title}: ${cur?.title ?? ''}`} />}
        </div>
      </div>
      <CameraBar />

      <details className="scenes">
        <summary>Scenes</summary>
        <ol>{S.map((c, i) => <li key={c.id}><button className={i === k ? 'on' : i < k ? 'past' : ''} aria-current={i === k ? 'step' : undefined} onClick={() => director.seek(c.at, playing)}><span>{c.title ?? `Scene ${i + 1}`}</span><small>{mmss(c.at)}</small></button></li>)}</ol>
      </details>

      {finished && course && <Recap course={course} track={track} />}
      {(LESSON_DRUGS[tl.id]?.length ?? 0) > 0 && <div className="course-links"><span>Drug mechanisms in this lesson</span>{LESSON_DRUGS[tl.id].map((id) => <button key={id} className="chip" onClick={() => openDrug(id)}>{MECH[id]?.drug ?? id}</button>)}</div>}
    </section>
  );
}

function TrackSwitch({ track }: { track: Track }) {
  return <div className="track-switch" role="radiogroup" aria-label="Course length">
    {([['full', 'Full course'], ['tldr', 'TL;DR']] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={track === k} className={track === k ? 'on' : ''} onClick={() => track !== k && director.choose(k)}>{l}</button>)}
  </div>;
}

/** The camera is the learner's. The lesson can only suggest a view. */
function CameraBar() {
  const follow = useCameraPolicy((s) => s.follow); const suggested = useCameraPolicy((s) => s.suggested); const rigs = useCameraPolicy((s) => s.rigs);
  if (!rigs) return null;
  return <div className="camera-bar" role="group" aria-label="Camera">
    <button className={`cam-frame${suggested && !follow ? ' suggested' : ''}`} onClick={() => useCameraPolicy.getState().frameNow()} title="Move the camera to the view this scene suggests">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="12" cy="12" r="2.2" fill="currentColor" /></svg>
      Frame this view
    </button>
    <label className="cam-follow"><input type="checkbox" checked={follow} onChange={(e) => useCameraPolicy.getState().setFollow(e.target.checked)} /> Follow lesson camera</label>
  </div>;
}

function Recap({ course, track }: { course: CourseMeta; track: Track }) {
  return <section className="recap" aria-labelledby="recap-title">
    <h3 id="recap-title">{track === 'tldr' ? 'What to remember' : 'Summary'}</h3>
    <ol className="recap-points">{course.keyPoints.map((p) => <li key={p}>{p}</li>)}</ol>
    {course.bedside && <p className="recap-bedside"><b>At the bedside.</b> {course.bedside}</p>}
    {track === 'full' && <>
      {(course.pearls?.length ?? 0) > 0 && <><h4>Pearls</h4><ul className="recap-list">{course.pearls!.map((p) => <li key={p}>{p}</li>)}</ul></>}
      {(course.pitfalls?.length ?? 0) > 0 && <><h4>Pitfalls</h4><ul className="recap-list pitfalls">{course.pitfalls!.map((p) => <li key={p}>{p}</li>)}</ul></>}
      {(course.selfCheck?.length ?? 0) > 0 && <><h4>Self-check</h4>{course.selfCheck!.map((s, i) => <Question key={i} n={i + 1} s={s} />)}</>}
    </>}
    {track === 'tldr' && <button className="act primary" onClick={() => director.choose('full')}>Take the full course</button>}
  </section>;
}

function Question({ s, n }: { s: SelfCheck; n: number }) {
  const [pick, setPick] = useState<number | null>(null);
  return <fieldset className="selfcheck">
    <legend>{n}. {s.q}</legend>
    {s.options.map((o, i) => <button key={o} type="button" className={pick == null ? '' : i === s.answer ? 'right' : i === pick ? 'wrong' : 'muted'} aria-pressed={pick === i} disabled={pick != null} onClick={() => setPick(i)}>{o}</button>)}
    {pick != null && <p role="status" className={pick === s.answer ? 'sc-right' : 'sc-wrong'}><b>{pick === s.answer ? 'Correct.' : 'Not this one.'}</b> {s.why}</p>}
  </fieldset>;
}

function BookmarkBtn({ id, t, title }: { id: string; t: number; title: string }) {
  const on = useProgress((s) => s.bookmarks.some((b) => b.lessonId === id && Math.abs(b.t - t) < 2));
  return <button className="topt" aria-label={on ? 'Remove bookmark' : 'Bookmark this moment'} aria-pressed={on} onClick={() => useProgress.getState().toggleBookmark({ lessonId: id, t, title })}>{on ? 'Bookmarked' : 'Bookmark'}</button>;
}

export function Prediction({ checkpoint }: { checkpoint: { prompt: string; answer: string } }) {
  const [revealed, setRevealed] = useState(false);
  return <section className="prediction"><h3>Pause and predict</h3><p>{checkpoint.prompt}</p>
    <button className="act" aria-expanded={revealed} onClick={() => { director.pause(); setRevealed(!revealed); }}>{revealed ? 'Hide the answer' : 'Show the answer'}</button>
    {revealed && <p role="status">{checkpoint.answer}</p>}
  </section>;
}
