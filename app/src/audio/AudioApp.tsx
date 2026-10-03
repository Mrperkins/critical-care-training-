import { useEffect, useMemo, useRef, useState } from 'react';
import { EPISODES, MENTAL_REPS } from './catalog';
import { DOMAIN_LABELS, LEVELS, MASTERY, MASTERY_BY_ID } from './mastery';
import { masteryScore, useAudioProgress } from './progress';
import { duePrompts, REVIEW_PROMPTS } from './review';
import { RepVisual } from './RepVisual';
import { bridgeFor } from './bridges';
import { recommendedEpisode, recommendedRep } from './recommend';
import type { AudioEpisode, MentalRep } from './types';

type Page = 'home' | 'listen' | 'reps' | 'review' | 'mastery';

const fmt = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;

export function AudioApp() {
  const [page, setPage] = useState<Page>('home');
  const [episode, setEpisode] = useState<AudioEpisode | null>(null);
  const [rep, setRep] = useState<MentalRep | null>(null);
  const p = useAudioProgress();
  const done = Object.keys(p.completed).length + Object.keys(p.repCompleted).length;
  return (
    <div className="aa-app">
      <aside className="aa-nav">
        <div className="aa-brand"><div className="aa-mark">⌁</div><div><b>Critical Care Audio</b><span>Listen · reason · rehearse</span></div></div>
        <nav aria-label="Audio learning">
          <Nav icon="⌂" label="Home" on={page === 'home'} onClick={() => { setEpisode(null); setRep(null); setPage('home'); }} />
          <Nav icon="◉" label="Listen" on={page === 'listen'} onClick={() => { setEpisode(null); setRep(null); setPage('listen'); }} />
          <Nav icon="↻" label="Mental Reps" on={page === 'reps'} onClick={() => { setEpisode(null); setRep(null); setPage('reps'); }} />
          <Nav icon="◇" label="Review" on={page === 'review'} onClick={() => { setEpisode(null); setRep(null); setPage('review'); }} />
          <Nav icon="◎" label="Mastery" on={page === 'mastery'} onClick={() => { setEpisode(null); setRep(null); setPage('mastery'); }} />
        </nav>
        <div className="aa-level"><span>MASTERy PATH</span><b>{done} sessions completed</b><small>Expert-level literacy + reasoning. Bedside expertise still requires supervised clinical practice.</small></div>
        <a className="aa-back" href="../">← Critical Care Physiology</a>
      </aside>
      <main className="aa-main">
        {episode ? <EpisodePlayer episode={episode} onBack={() => setEpisode(null)} /> :
         rep ? <RepPlayer rep={rep} onBack={() => setRep(null)} /> :
         page === 'home' ? <Home onEpisode={setEpisode} onRep={setRep} navigate={setPage} /> :
         page === 'listen' ? <Listen onEpisode={setEpisode} /> :
         page === 'reps' ? <Reps onRep={setRep} /> :
         page === 'review' ? <Review /> : <Mastery />}
      </main>
    </div>
  );
}

function Nav({ icon, label, on, onClick }: { icon: string; label: string; on: boolean; onClick: () => void }) {
  return <button className={on ? 'on' : ''} onClick={onClick}><span>{icon}</span>{label}</button>;
}

function Home({ onEpisode, onRep, navigate }: { onEpisode: (e: AudioEpisode) => void; onRep: (r: MentalRep) => void; navigate: (p: Page) => void }) {
  const p = useAudioProgress(); const featured = recommendedEpisode(p.mastery, p.completed), rep = recommendedRep(p.mastery, p.repCompleted);
  const mastery = Object.values(p.mastery).filter((x) => x.exposures).length; const due = duePrompts(p.mastery).length;
  return <div className="aa-page">
    <header className="aa-hero"><div><span className="aa-kicker">VOICE-FIRST CRITICAL CARE</span><h1>Build the way experts think.</h1><p>Natural-voice rounds, ICU literacy, unfolding cases and guided procedural mental rehearsal — all mapped to the same critical-care mastery graph.</p></div>
      <div className="aa-voice"><span>VOICE STANDARD</span><b>Natural human-quality narration</b><small>No browser TTS. Production lessons require reviewed, pre-rendered premium neural voice or clinician-recorded audio.</small></div>
    </header>
    <section className="aa-grid aa-stats">
      <button onClick={() => navigate('listen')}><span>LISTEN</span><b>{EPISODES.length}</b><small>Daily Dose · Rounds · Deep Dives · Cases</small></button>
      <button onClick={() => navigate('reps')}><span>MENTAL REPS</span><b>{MENTAL_REPS.length}</b><small>Guided procedural visualization</small></button>
      <button onClick={() => navigate('mastery')}><span>MASTERY GRAPH</span><b>{MASTERY.length}</b><small>{mastery} concepts touched so far</small></button>
    </section>
    <section className="aa-reviewcall"><div><span className="aa-kicker">RETRIEVAL + CALIBRATION</span><h2>{due} review{due === 1 ? '' : 's'} due</h2><p>Answer from memory, then rate how certain you were. The system tracks both correctness and confidence because expert reasoning requires calibration, not just accuracy.</p></div><button className="aa-secondary" onClick={() => navigate('review')}>Review now →</button></section>
    <section className="aa-section"><div className="aa-section-h"><div><span className="aa-kicker">RECOMMENDED FOR YOU</span><h2>{featured.title}</h2></div><button className="aa-primary" onClick={() => onEpisode(featured)}>▶ Start round</button></div>
      <div className="aa-feature">
        <div className="aa-orbit" aria-hidden="true"><i /><i /><i /><b>RV</b></div>
        <div><p>{featured.subtitle}</p><div className="aa-tags"><span>Level {featured.level}</span><span>{featured.minutes} min</span><span>{featured.concepts.length} concepts</span><span className="voice">Natural voice sample</span></div>
          <h3>After this round</h3><ul>{featured.outcomes.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
    </section>
    <section className="aa-section"><div className="aa-section-h"><div><span className="aa-kicker">RECOMMENDED MENTAL REP</span><h2>{rep.title}</h2></div><button className="aa-secondary" onClick={() => onRep(rep)}>Begin rehearsal →</button></div>
      <p className="aa-muted">{rep.subtitle} Calm, guided narration walks you through setup, orientation, decision points, confirmation and failure recognition.</p>
    </section>
    <section className="aa-levels">{LEVELS.map((l) => <div key={l.level}><span>{l.level}</span><b>{l.name}</b><small>{l.description}</small></div>)}</section>
  </div>;
}

function Listen({ onEpisode }: { onEpisode: (e: AudioEpisode) => void }) {
  const [format, setFormat] = useState('all');
  const formats = ['all', 'daily-dose', 'rounds', 'deep-dive', 'audio-case', 'icu-literacy'];
  const list = format === 'all' ? EPISODES : EPISODES.filter((e) => e.format === format);
  return <div className="aa-page"><PageHead kicker="LISTEN" title="Critical care in your headphones" body="Start with a five-minute concept or work through a full physiologic model. Every episode maps back to mastery concepts rather than an endless podcast feed." />
    <div className="aa-pills">{formats.map((f) => <button key={f} className={f === format ? 'on' : ''} onClick={() => setFormat(f)}>{f.replace('-', ' ')}</button>)}</div>
    <div className="aa-list">{list.map((e) => <button className="aa-item" key={e.id} onClick={() => onEpisode(e)}>
      <span className="aa-play">▶</span><span className="aa-item-body"><b>{e.title}</b><small>{e.subtitle}</small><em>{DOMAIN_LABELS[e.domain]} · Level {e.level} · {e.minutes} min</em></span>
      <span className={`aa-status ${e.status}`}>{e.status.replace('-', ' ')}</span>
    </button>)}</div>
  </div>;
}

function Reps({ onRep }: { onRep: (r: MentalRep) => void }) {
  return <div className="aa-page"><PageHead kicker="MENTAL REPS" title="Rehearse the room before you enter it." body="Guided procedural visualization: see the patient, orient to anatomy and equipment, mentally perform the sequence, anticipate failure, confirm success and debrief." />
    <div className="aa-warning"><b>Training boundary</b><span>Mental rehearsal complements — and never replaces — supervised hands-on training, credentialing, medical direction and local policy.</span></div>
    <div className="aa-repgrid">{MENTAL_REPS.map((r) => <button key={r.id} onClick={() => onRep(r)}>
      <span className="aa-rep-icon">{r.id.includes('blood') ? '◒' : r.id.includes('efast') ? '◩' : r.id.includes('art') ? '∿' : r.id.includes('chest') ? '◐' : '✚'}</span>
      <b>{r.title}</b><small>{r.subtitle}</small><em>Level {r.level} · {r.minutes} min · {r.beats.length} beats</em>
    </button>)}</div>
  </div>;
}

function Review() {
  const p = useAudioProgress(); const [cursor, setCursor] = useState(0); const [choice, setChoice] = useState<number | null>(null); const [confidence, setConfidence] = useState(60); const [revealed, setRevealed] = useState(false);
  const [sessionIds] = useState(() => { const d = duePrompts(useAudioProgress.getState().mastery); return (d.length ? d : REVIEW_PROMPTS).map((q) => q.id); });
  const liveDue = duePrompts(p.mastery); const pool = sessionIds.map((id) => REVIEW_PROMPTS.find((q) => q.id === id)!).filter(Boolean); const q = pool[cursor % pool.length];
  const submit = () => { if (choice == null) return; p.recordConcept(q.concept, choice === q.answer, confidence); setRevealed(true); };
  const next = () => { setChoice(null); setConfidence(60); setRevealed(false); setCursor((x) => x + 1); };
  const c = MASTERY_BY_ID[q.concept]; const correct = choice === q.answer;
  const calibration = !revealed ? '' : correct && confidence <= 40 ? 'Correct, but you were under-confident — useful knowledge that is not yet fluent.' : !correct && confidence >= 80 ? 'High-confidence miss — prioritize this concept. These are the blind spots expert training should expose.' : correct && confidence >= 80 ? 'Correct and well calibrated.' : !correct ? 'Missed with appropriate uncertainty. Review the model, then retrieve it again later.' : 'Correct. Keep building retrieval strength.';
  return <div className="aa-page"><PageHead kicker="SPACED REVIEW" title="Accuracy is only half the signal." body="Retrieve first. Then tell the system how confident you were. Reviews recur sooner when accuracy or confidence calibration is weak." />
    <div className="aa-reviewmeta"><span>{liveDue.length ? `${liveDue.length} due now` : 'No reviews overdue — optional practice'}</span><span>{c?.name}</span><span>Level {c?.level}</span></div>
    <section className="aa-reviewcard"><span className="aa-kicker">QUESTION {cursor + 1}</span><h2>{q.question}</h2>
      <div className="aa-reviewopts">{q.options.map((o, i) => <button key={o} disabled={revealed} className={revealed ? i === q.answer ? 'ok' : i === choice ? 'bad' : '' : choice === i ? 'on' : ''} onClick={() => setChoice(i)}><span>{String.fromCharCode(65 + i)}</span>{o}</button>)}</div>
      <div className="aa-confidence"><div><b>How confident are you?</b><span>{confidence}%</span></div><input type="range" min="20" max="100" step="20" value={confidence} disabled={revealed} onChange={(e) => setConfidence(+e.target.value)} /><div className="aa-conf-labels"><span>guessing</span><span>certain</span></div></div>
      {!revealed ? <button className="aa-primary" disabled={choice == null} onClick={submit}>Commit answer</button> : <div className="aa-reviewresult"><b>{correct ? 'Correct.' : 'Not quite.'}</b><p>{q.explain}</p><em>{calibration}</em><button className="aa-primary" onClick={next}>Next review →</button></div>}
    </section>
  </div>;
}

function Mastery() {
  const p = useAudioProgress(); const [q, setQ] = useState(''); const [level, setLevel] = useState<number | null>(null);
  const rows = useMemo(() => MASTERY.filter((c) => (!level || c.level === level) && (!q || (c.name + c.summary + DOMAIN_LABELS[c.domain]).toLowerCase().includes(q.toLowerCase()))), [q, level]);
  return <div className="aa-page"><PageHead kicker="MASTERY GRAPH" title="Expert is a network, not a checklist." body="Concepts unlock progressively and recur across audio, visual physiology, cases and Mental Reps. Mastery means being able to predict, interpret and revise — not merely define." />
    <div className="aa-filters"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search concepts…" aria-label="Search mastery concepts" /><div className="aa-pills">{LEVELS.map((l) => <button key={l.level} className={level === l.level ? 'on' : ''} onClick={() => setLevel(level === l.level ? null : l.level)}>L{l.level}</button>)}</div></div>
    <div className="aa-concepts">{rows.map((c) => { const s = p.mastery[c.id], score = masteryScore(s), bridge = bridgeFor(c.id); return <article key={c.id}><div className="aa-c-top"><span>L{c.level} · {DOMAIN_LABELS[c.domain]}</span><b>{score}%</b></div><h3>{c.name}</h3><p>{c.summary}</p>
      <div className="aa-meter"><i style={{ width: `${score}%` }} /></div>
      <small>{s?.exposures ?? 0} exposures · {c.performance[0]}</small>
      {bridge && <a className="aa-visual-link" href={bridge.href}><b>See it visually →</b><span>{bridge.note}</span></a>}
    </article>; })}</div>
  </div>;
}

function EpisodePlayer({ episode, onBack }: { episode: AudioEpisode; onBack: () => void }) {
  const p = useAudioProgress(); const audio = useRef<HTMLAudioElement>(null); const [chapter, setChapter] = useState(0); const [playing, setPlaying] = useState(false);
  const ch = episode.chapters[chapter]; const src = episode.voice?.src ?? episode.voice?.previewSrc;
  useEffect(() => () => { audio.current?.pause(); }, []);
  const toggle = async () => {
    if (!audio.current || !src) return; if (audio.current.paused) { await audio.current.play(); setPlaying(true); } else { audio.current.pause(); setPlaying(false); }
  };
  return <div className="aa-page aa-player"><button className="aa-backbtn" onClick={onBack}>← All audio</button>
    <div className="aa-player-main">
      <div className="aa-cover"><span>{episode.format.replace('-', ' ')}</span><div className="aa-wave">{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ height: `${20 + ((i * 17) % 65)}%` }} />)}</div><b>LEVEL {episode.level}</b></div>
      <div className="aa-player-info"><span className="aa-kicker">{DOMAIN_LABELS[episode.domain]}</span><h1>{episode.title}</h1><p>{episode.subtitle}</p>
        <div className="aa-tags"><span>{episode.minutes} min</span><span>{episode.chapters.length} chapters</span>{episode.voice && <span className="voice">{episode.voice.tier === 'premium-human' ? 'Natural voice' : 'Clinician recorded'}</span>}</div>
        {src ? <><audio ref={audio} src={src} onEnded={() => setPlaying(false)} /><div className="aa-audioctl"><button onClick={toggle}>{playing ? '❚❚ Pause' : '▶ Play natural-voice sample'}</button><small>Prototype voice sample · production audio requires clinical review</small></div></> :
          <div className="aa-pending">Premium natural-voice render pending for this scripted lesson.</div>}
      </div>
    </div>
    <section className="aa-transcript"><div><span className="aa-kicker">NOW LEARNING</span><h2>{ch.title}</h2>{ch.prompt && <div className="aa-prompt"><b>Think before continuing</b><p>{ch.prompt}</p></div>}</div>
      <div className="aa-chapters">{episode.chapters.map((x, i) => <button key={x.id} className={i === chapter ? 'on' : ''} onClick={() => setChapter(i)}><span>{i + 1}</span><b>{x.title}</b><small>{fmt(x.seconds)}</small></button>)}</div>
    </section>
    <section className="aa-section"><h2>Concepts in this session</h2><div className="aa-linkcards">{episode.concepts.map((id) => { const c = MASTERY_BY_ID[id], bridge = bridgeFor(id); return c ? <div key={id}><b>{c.name}</b><small>L{c.level} · {DOMAIN_LABELS[c.domain]}</small>{bridge && <a href={bridge.href}>See it visually →</a>}</div> : null; })}</div>
      <button className="aa-primary" onClick={() => p.completeEpisode(episode.id, episode.concepts)}>Mark session complete</button></section>
  </div>;
}

function RepPlayer({ rep, onBack }: { rep: MentalRep; onBack: () => void }) {
  const p = useAudioProgress(); const [i, setI] = useState(0); const beat = rep.beats[i];
  return <div className="aa-page aa-rehearsal"><button className="aa-backbtn" onClick={onBack}>← Mental Reps</button>
    <div className="aa-rephead"><span className="aa-kicker">GUIDED PROCEDURAL VISUALIZATION</span><h1>{rep.title}</h1><p>{rep.subtitle}</p><div className="aa-warning"><b>Training boundary</b><span>{rep.disclaimer}</span></div></div>
    <div className="aa-repstage">
      <div className={`aa-visual ${beat.danger ? 'danger' : ''}`}><RepVisual beat={beat} /><small className="aa-vphase">VISUAL CUE · {beat.phase.toUpperCase()}</small></div>
      <section><div className="aa-stepcount">BEAT {i + 1} OF {rep.beats.length}</div><h2>{beat.title}</h2><p className="aa-narration">{beat.narration}</p>
        {beat.pauseSeconds && <div className="aa-pause">Pause · {beat.pauseSeconds} seconds</div>}
        {beat.prompt && <div className="aa-prompt"><b>Mentally answer before moving on</b><p>{beat.prompt}</p></div>}
        <div className="aa-controls"><button disabled={i === 0} onClick={() => setI(i - 1)}>← Previous</button>{i < rep.beats.length - 1 ? <button className="aa-primary" onClick={() => setI(i + 1)}>Next beat →</button> :
          <button className="aa-primary" onClick={() => p.completeRep(rep.id, rep.concepts)}>Complete Mental Rep ✓</button>}</div>
      </section>
    </div>
    <div className="aa-beatbar">{rep.beats.map((b, k) => <button aria-label={b.title} className={k === i ? 'on' : k < i ? 'past' : ''} key={b.id} onClick={() => setI(k)} />)}</div>
  </div>;
}

function PageHead({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <header className="aa-pagehead"><span className="aa-kicker">{kicker}</span><h1>{title}</h1><p>{body}</p></header>;
}
