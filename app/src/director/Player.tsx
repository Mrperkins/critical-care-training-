/** Transport + captions for the Lesson Director. */
import { LESSON_DRUGS } from '../moa/meta';
import { MECH } from '../moa/registry';
import { openDrug } from '../app/navigate';
import { useDirector, director } from './director';
import { duration, steps, stepIndexAt } from './timeline';

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export function DirectorPlayer({ onExit }: { onExit?: () => void }) {
  const tl = useDirector((s) => s.tl); const t = useDirector((s) => s.t); const playing = useDirector((s) => s.playing); const holding = useDirector((s) => s.holding);
  const muted = useDirector((s) => s.muted); const rate = useDirector((s) => s.rate); const speaking = useDirector((s) => s.speaking);
  if (!tl) return null;
  const D = duration(tl); const S = steps(tl); const k = stepIndexAt(tl, t); const cur = k >= 0 ? S[k] : null;
  return (
    <section className="card lesson director">
      {onExit && <button className="back" onClick={() => { director.unload(); onExit(); }}>← All lessons</button>}
      <div className="eyebrow">{tl.title} · {Math.max(1, k + 1)}/{S.length}</div>
      <h2 className="h2">{cur?.title ?? tl.title}</h2>
      <p className="say" aria-live="polite">{cur?.say ?? tl.blurb}</p>
      <div className="dir-track">
        <input type="range" min={0} max={D} step={0.05} value={t} aria-label="Lesson time" onChange={(e) => director.seek(+e.target.value)} />
        <div className="dir-ticks" aria-hidden="true">{S.map((c, i) => <button key={c.id} tabIndex={-1} className={i === k ? 'on' : i < k ? 'past' : ''} style={{ left: `${(c.at / D) * 100}%` }} onClick={() => director.seek(c.at, playing)} title={c.title ?? ''} />)}</div>
        <div className="dir-time"><span>{mmss(t)}</span><span className="muted">{holding ? 'waiting for narration…' : speaking ? 'narrating' : ''}</span><span>{mmss(D)}</span></div>
      </div>
      <div className="actions">
        <button className="act" onClick={() => director.step(-1)} aria-label="Previous step">←</button>
        <button className="act primary" onClick={() => director.toggle()}>{playing ? 'Pause' : t >= D - 0.01 ? 'Replay' : 'Play'}</button>
        <button className="act" onClick={() => director.step(1)} aria-label="Next step">→</button>
        <button className={`act${muted ? '' : ' done'}`} onClick={() => director.setMuted(!muted)}>{muted ? 'Voice off' : 'Voice on'}</button>
        <button className="act" onClick={() => director.setRate(rate >= 2 ? 0.75 : rate + 0.25)}>{rate.toFixed(2).replace(/0$/, '')}×</button>
      </div>
      {(LESSON_DRUGS[tl.id]?.length ?? 0) > 0 && <div className="dir-links"><span className="muted small">Drug mechanisms in this lesson:</span> {LESSON_DRUGS[tl.id].map((id) => <button key={id} className="chip" onClick={() => openDrug(id)}>{MECH[id]?.drug ?? id} →</button>)}</div>}
    </section>
  );
}
