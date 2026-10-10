/** Transport for an atlas lesson timeline: a single rAF clock (seek, pause, step); speech is optional and never gates time. */
import { useEffect, useRef, useState } from 'react';
import { duration, resolve, stepAt, type Timeline } from './timeline';

let last = -1;
function speak(text: string, on: boolean) { try { speechSynthesis.cancel(); if (on) { const u = new SpeechSynthesisUtterance(text); u.rate = 1; speechSynthesis.speak(u); } } catch { /* captions only */ } }

export function LessonPlayer({ tl, onExit }: { tl: Timeline; onExit: () => void }) {
  const [t, setT] = useState(0); const [playing, setPlaying] = useState(true); const [voice, setVoice] = useState(true);
  const tr = useRef(0); const D = duration(tl);
  const seek = (x: number) => { tr.current = Math.max(0, Math.min(D, x)); resolve(tl, tr.current); setT(tr.current); last = -1; };
  useEffect(() => { seek(0); (window as unknown as { __IALesson: unknown }).__IALesson = { seek, timeline: tl }; return () => { try { speechSynthesis.cancel(); } catch { /* */ } }; }, [tl]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!playing) return; let raf = 0, prev = performance.now();
    const loop = (now: number) => { raf = requestAnimationFrame(loop); const dt = Math.min(0.1, (now - prev) / 1000); prev = now; const t0 = tr.current; const t1 = Math.min(D, t0 + dt);
      for (const c of tl.cues) if (c.at > t0 && c.at <= t1) c.apply(); tr.current = t1; setT(t1); if (t1 >= D) setPlaying(false); };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [playing, tl, D]);
  const k = stepAt(tl, t); const cur = tl.cues[k];
  useEffect(() => { if (k !== last) { last = k; if (playing) speak(cur.say, voice); } }, [k, playing, voice, cur.say]);
  return (
    <div className="info lesson">
      <button className="linkish" onClick={() => { try { speechSynthesis.cancel(); } catch { /* */ } onExit(); }}>← Territory lessons</button>
      <div className="step-count">{tl.title} · {k + 1} / {tl.cues.length}</div>
      <h2 key={cur.id} className="reveal">{cur.title}</h2>
      <p key={cur.id + 't'} className="explain reveal">{cur.say}</p>
      <input className="lesson-scrub" type="range" min={0} max={D} step={0.05} value={t} onChange={(e) => { setPlaying(false); seek(+e.target.value); }} aria-label="Lesson time" />
      <div className="lesson-nav">
        <button onClick={() => { setPlaying(false); seek(tl.cues[Math.max(0, k - 1)].at); }} disabled={k === 0}>Back</button>
        <button className="pri" onClick={() => { if (t >= D) seek(0); setPlaying(!playing); }}>{playing ? 'Pause' : t >= D ? 'Replay' : 'Play'}</button>
        <button onClick={() => { setPlaying(false); seek(tl.cues[Math.min(tl.cues.length - 1, k + 1)].at); }} disabled={k === tl.cues.length - 1}>Next</button>
        <button onClick={() => setVoice(!voice)}>{voice ? 'Voice on' : 'Voice off'}</button>
      </div>
      <div className="dots">{tl.cues.map((c, i) => <button key={c.id} className={i === k ? 'on' : i < k ? 'done' : ''} onClick={() => { setPlaying(false); seek(c.at); }} aria-label={c.title} />)}</div>
    </div>
  );
}
