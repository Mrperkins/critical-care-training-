import { useEffect, useMemo, useRef, useState } from 'react';
import { EPISODES, MENTAL_REPS, EPISODE_BY_ID, REP_BY_ID } from './catalog';
import { DOMAIN_LABELS, LEVELS, MASTERY, MASTERY_BY_ID } from './mastery';
import { masteryScore, useAudioProgress } from './progress';
import { duePrompts, REVIEW_PROMPTS } from './review';
import { RepVisual } from './RepVisual';
import { bridgeFor } from './bridges';
import { recommendedEpisode, recommendedRep } from './recommend';
import { handsFreeAvailable, listenForCommand, type HandsFreeCommand } from './handsfree';
import { buildLearningPath } from './pathway';
import { EXPERT_TRACKS } from './tracks';
import type { AudioEpisode, MentalRep } from './types';

type Page = 'home' | 'tracks' | 'listen' | 'reps' | 'review' | 'mastery';

const fmt = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`;

type DurableVoiceAsset = { file: string; reviewed: boolean };
function durableVoiceAsset(id: string): DurableVoiceAsset | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { __CC_AUDIO_ASSETS__?: Record<string, DurableVoiceAsset> };
  return w.__CC_AUDIO_ASSETS__?.[id] ?? null;
}
function durableVoiceSrc(id: string) {
  const a = durableVoiceAsset(id);
  return a ? `voice/${a.file}` : undefined;
}
function durableVoiceParts(prefix: string) {
  if (typeof window === 'undefined') return [] as { id: string; file: string; reviewed: boolean }[];
  const w = window as unknown as { __CC_AUDIO_ASSETS__?: Record<string, DurableVoiceAsset> };
  return Object.entries(w.__CC_AUDIO_ASSETS__ ?? {})
    .filter(([id]) => id.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, a]) => ({ id, ...a }));
}


export function AudioApp() {
  const [page, setPage] = useState<Page>('home');
  const [episode, setEpisode] = useState<AudioEpisode | null>(null);
  const [rep, setRep] = useState<MentalRep | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const p = useAudioProgress();
  const done = Object.keys(p.completed).length + Object.keys(p.repCompleted).length;
  return (
    <div className="aa-app">
      <aside className="aa-nav">
        <div className="aa-brand"><div className="aa-mark">⌁</div><div><b>Critical Care Audio</b><span>Listen · reason · rehearse</span></div></div>
        <a className="aa-visual-switch" href="../"><span aria-hidden="true">←</span><b>Visual app</b></a>
        <nav aria-label="Audio learning">
          <Nav icon="⌂" label="Home" on={page === 'home'} onClick={() => { setEpisode(null); setRep(null); setPage('home'); }} />
          <Nav icon="▤" label="Tracks" on={page === 'tracks'} onClick={() => { setEpisode(null); setRep(null); setPage('tracks'); }} />
          <Nav icon="◉" label="Listen" on={page === 'listen'} onClick={() => { setEpisode(null); setRep(null); setPage('listen'); }} />
          <Nav icon="↻" label="Mental Reps" on={page === 'reps'} onClick={() => { setEpisode(null); setRep(null); setPage('reps'); }} />
          <Nav icon="◇" label="Review" on={page === 'review'} onClick={() => { setEpisode(null); setRep(null); setPage('review'); }} />
          <Nav icon="◎" label="Mastery" on={page === 'mastery'} onClick={() => { setEpisode(null); setRep(null); setPage('mastery'); }} />
        </nav>
        <div className="aa-level"><span>MASTERy PATH</span><b>{done} sessions completed</b><small>Expert-level literacy + reasoning. Bedside expertise still requires supervised clinical practice.</small></div>
        <a className="aa-back" href="../">← Critical Care Physiology</a>
      </aside>
      <main className="aa-main"><a className="aa-global-return" href="../">← Visual app</a>
        {episode ? <EpisodePlayer episode={episode} onBack={() => setEpisode(null)}
           onReview={() => { setEpisode(null); setPage('review'); }}
           onFocus={(id) => { setEpisode(null); setFocus(id); }}
           onExample={(e) => setEpisode(e)} /> :
         rep ? <RepPlayer rep={rep} onBack={() => setRep(null)}
           onReview={() => { setRep(null); setPage('review'); }}
           onFocus={(id) => { setRep(null); setFocus(id); }}
           onExample={(e) => { setRep(null); setEpisode(e); }} /> :
         focus ? <FocusPath conceptId={focus} onBack={() => setFocus(null)} onEpisode={setEpisode} onRep={setRep} onReview={() => { setFocus(null); setPage('review'); }} /> :
         page === 'home' ? <Home onEpisode={setEpisode} onRep={setRep} navigate={setPage} /> :
         page === 'tracks' ? <Tracks onEpisode={setEpisode} /> :
         page === 'listen' ? <Listen onEpisode={setEpisode} /> :
         page === 'reps' ? <Reps onRep={setRep} /> :
         page === 'review' ? <Review /> : <Mastery onFocus={setFocus} />}
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
      <button onClick={() => navigate('tracks')}><span>EXPERT TRACKS</span><b>{EXPERT_TRACKS.length}</b><small>Ordered ICU domain pathways</small></button>
      <button onClick={() => navigate('reps')}><span>MENTAL REPS</span><b>{MENTAL_REPS.length}</b><small>Guided procedural visualization</small></button>
      <button onClick={() => navigate('mastery')}><span>MASTERY GRAPH</span><b>{MASTERY.length}</b><small>{mastery} concepts touched so far</small></button>
    </section>
    <section className="aa-reviewcall"><div><span className="aa-kicker">RETRIEVAL + CALIBRATION</span><h2>{due} review{due === 1 ? '' : 's'} due</h2><p>Answer from memory, then rate how certain you were. The system tracks both correctness and confidence because expert reasoning requires calibration, not just accuracy.</p></div><button className="aa-secondary" onClick={() => navigate('review')}>Review now →</button></section>
    <section className="aa-section"><div className="aa-section-h"><div><span className="aa-kicker">RECOMMENDED FOR YOU</span><h2>{featured.title}</h2></div><button className="aa-primary" onClick={() => onEpisode(featured)}>▶ Start round</button></div>
      <div className="aa-feature">
        <div className="aa-orbit" aria-hidden="true"><i /><i /><i /><b>RV</b></div>
        <div><p>{featured.subtitle}</p><div className="aa-tags"><span>Level {featured.level}</span><span>{featured.minutes} min</span><span>{featured.concepts.length} concepts</span>{featured.voice ? <span className="voice">{featured.voice.reviewed ? 'Reviewed natural voice' : 'Natural voice prototype'}</span> : <span>Script ready · voice pending</span>}</div>
          <h3>After this round</h3><ul>{featured.outcomes.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
    </section>
    <section className="aa-section"><div className="aa-section-h"><div><span className="aa-kicker">RECOMMENDED MENTAL REP</span><h2>{rep.title}</h2></div><button className="aa-secondary" onClick={() => onRep(rep)}>Begin rehearsal →</button></div>
      <p className="aa-muted">{rep.subtitle} Calm, guided narration walks you through setup, orientation, decision points, confirmation and failure recognition.</p>
    </section>
    <section className="aa-levels">{LEVELS.map((l) => <div key={l.level}><span>{l.level}</span><b>{l.name}</b><small>{l.description}</small></div>)}</section>
  </div>;
}

function Tracks({ onEpisode }: { onEpisode: (e: AudioEpisode) => void }) {
  const p = useAudioProgress(); const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return <div className="aa-page"><PageHead kicker="EXPERT TRACKS" title="A curriculum, not a podcast feed." body="Work through each ICU domain in increasing depth. Tracks combine rounds, literacy, deep dives and cases while the mastery engine keeps weak concepts in rotation." />
    <div className="aa-trackgrid">{EXPERT_TRACKS.map((t) => {
      const done = t.episodes.filter((e) => !!p.completed[e.id]).length;
      const pct = t.episodes.length ? Math.round(100 * done / t.episodes.length) : 0;
      const next = t.episodes.find((e) => !p.completed[e.id]) ?? t.episodes[0];
      const open = !!expanded[t.id]; const visible = open ? t.episodes : t.episodes.slice(0,4);
      return <article key={t.id}><div className="aa-tracktop"><span>{t.episodes.length} sessions</span><b>{pct}%</b></div><h2>{t.title}</h2><p>{t.promise}</p><div className="aa-meter"><i style={{width:`${pct}%`}} /></div>
        <div className="aa-trackepisodes">{visible.map((e) => <button key={e.id} onClick={() => onEpisode(e)} className={p.completed[e.id] ? 'done' : ''}><span>{p.completed[e.id] ? '✓' : e.voice?.src ? '♪' : '▶'}</span><b>{e.title}</b><small>L{e.level} · {e.minutes} min · {e.voice?.reviewed ? 'reviewed audio' : e.voice?.src ? 'voice rendered' : e.voice?.previewSrc ? 'voice preview' : 'scripted'}</small></button>)}</div>
        {t.episodes.length > 4 && <button className="aa-more" onClick={() => setExpanded((x) => ({...x,[t.id]:!open}))}>{open ? 'Show fewer sessions ↑' : `Show all ${t.episodes.length} sessions ↓`}</button>}
        <button className="aa-primary" onClick={() => onEpisode(next)}>{done ? 'Continue track →' : 'Start track →'}</button>
      </article>;
    })}</div>
  </div>;
}
function Listen({ onEpisode }: { onEpisode: (e: AudioEpisode) => void }) {
  const [format, setFormat] = useState('all'); const [domain, setDomain] = useState('all'); const [q, setQ] = useState('');
  const formats = ['all', 'daily-dose', 'rounds', 'deep-dive', 'audio-case', 'icu-literacy'];
  const domains = useMemo(() => Array.from(new Set(EPISODES.map((e) => e.domain))), []);
  const list = useMemo(() => EPISODES.filter((e) =>
    (format === 'all' || e.format === format) &&
    (domain === 'all' || e.domain === domain) &&
    (!q || (e.title + ' ' + e.subtitle + ' ' + e.concepts.map((id) => MASTERY_BY_ID[id]?.name ?? '').join(' ')).toLowerCase().includes(q.toLowerCase()))
  ), [format, domain, q]);
  return <div className="aa-page"><PageHead kicker="LISTEN" title="Critical care in your headphones" body="Start with a five-minute concept or work through a full physiologic model. Every episode maps back to mastery concepts rather than an endless podcast feed." />
    <div className="aa-listfilters"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sessions or concepts…" aria-label="Search audio sessions" /><select value={domain} onChange={(e) => setDomain(e.target.value)} aria-label="Filter by domain"><option value="all">All domains</option>{domains.map((d) => <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>)}</select><span>{list.length} sessions</span></div>
    <div className="aa-pills">{formats.map((f) => <button key={f} className={f === format ? 'on' : ''} onClick={() => setFormat(f)}>{f.replace('-', ' ')}</button>)}</div>
    <div className="aa-list">{list.map((e) => <button className="aa-item" key={e.id} onClick={() => onEpisode(e)}>
      <span className="aa-play">▶</span><span className="aa-item-body"><b>{e.title}</b><small>{e.subtitle}</small><em>{DOMAIN_LABELS[e.domain]} · Level {e.level} · {e.minutes} min</em></span>
      <span className={`aa-status ${e.status}`}>{e.status.replace('-', ' ')}</span>
    </button>)}</div>
    {!list.length && <div className="aa-pending">No sessions match those filters.</div>}
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

function Mastery({ onFocus }: { onFocus: (id: string) => void }) {
  const p = useAudioProgress(); const [q, setQ] = useState(''); const [level, setLevel] = useState<number | null>(null);
  const rows = useMemo(() => MASTERY.filter((c) => (!level || c.level === level) && (!q || (c.name + c.summary + DOMAIN_LABELS[c.domain]).toLowerCase().includes(q.toLowerCase()))), [q, level]);
  return <div className="aa-page"><PageHead kicker="MASTERY GRAPH" title="Expert is a network, not a checklist." body="Concepts unlock progressively and recur across audio, visual physiology, cases and Mental Reps. Mastery means being able to predict, interpret and revise — not merely define." />
    <div className="aa-filters"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search concepts…" aria-label="Search mastery concepts" /><div className="aa-pills">{LEVELS.map((l) => <button key={l.level} className={level === l.level ? 'on' : ''} onClick={() => setLevel(level === l.level ? null : l.level)}>L{l.level}</button>)}</div></div>
    <div className="aa-concepts">{rows.map((c) => { const s = p.mastery[c.id], score = masteryScore(s), bridge = bridgeFor(c.id); return <article key={c.id}><div className="aa-c-top"><span>L{c.level} · {DOMAIN_LABELS[c.domain]}</span><b>{score}%</b></div><h3>{c.name}</h3><p>{c.summary}</p>
      <div className="aa-meter"><i style={{ width: `${score}%` }} /></div>
      <small>{s?.exposures ?? 0} exposures · {c.performance[0]}</small>
      <div className="aa-mastery-actions"><button onClick={() => onFocus(c.id)}>Teach me this →</button>{bridge && <a className="aa-visual-link" href={bridge.href}><b>See it visually →</b><span>{bridge.note}</span></a>}</div>
    </article>; })}</div>
  </div>;
}

function FocusPath({ conceptId, onBack, onEpisode, onRep, onReview }: { conceptId: string; onBack: () => void; onEpisode: (e: AudioEpisode) => void; onRep: (r: MentalRep) => void; onReview: () => void }) {
  const c = MASTERY_BY_ID[conceptId]; const steps = buildLearningPath(conceptId);
  if (!c) return null;
  const open = (kind: string, id: string) => {
    if (kind === 'listen' && EPISODE_BY_ID[id]) onEpisode(EPISODE_BY_ID[id]);
    else if (kind === 'rep' && REP_BY_ID[id]) onRep(REP_BY_ID[id]);
    else if (kind === 'review') onReview();
  };
  return <div className="aa-page"><button className="aa-backbtn" onClick={onBack}>← Mastery</button>
    <PageHead kicker="TEACH ME THIS UNTIL I UNDERSTAND IT" title={c.name} body={c.summary} />
    <section className="aa-focus-intro"><div><span>LEVEL {c.level}</span><b>{DOMAIN_LABELS[c.domain]}</b></div><p><b>Mastery looks like:</b> {c.performance.join(' ')}</p></section>
    <div className="aa-path">{steps.map((step, i) => <article key={step.kind + step.id + i} className={`kind-${step.kind}`}>
      <div className="aa-path-num">{i + 1}</div><div className="aa-path-body"><span>{step.kind.replace('-', ' ')}</span><h3>{step.title}</h3><p>{step.note}</p></div>
      {step.kind === 'visual' ? <a className="aa-secondary" href={step.href}>Open visual →</a> :
       step.kind === 'listen' || step.kind === 'rep' || step.kind === 'review' ? <button className="aa-secondary" onClick={() => open(step.kind, step.id)}>{step.kind === 'listen' ? 'Listen →' : step.kind === 'rep' ? 'Rehearse →' : 'Test me →'}</button> : null}
    </article>)}</div>
    <section className="aa-section"><span className="aa-kicker">WHY THIS ORDER?</span><p className="aa-muted">Prerequisites come first, then explanation, visualization, procedural rehearsal when relevant, and retrieval. The target is durable clinical reasoning—not a completed playlist.</p></section>
  </div>;
}

function EpisodePlayer({ episode, onBack, onReview, onFocus, onExample }: { episode: AudioEpisode; onBack: () => void; onReview: () => void; onFocus: (id: string) => void; onExample: (e: AudioEpisode) => void }) {
  const p = useAudioProgress(); const audio = useRef<HTMLAudioElement>(null); const [chapter, setChapter] = useState(0); const [playing, setPlaying] = useState(false);
  const [listening, setListening] = useState(false); const [heard, setHeard] = useState('');
  const savedAt = p.position[episode.id] ?? 0; const lastSaved = useRef(savedAt);
  const savedPartKey = `${episode.id}:part`; const savedPart = p.position[savedPartKey] ?? 0;
  const [part, setPart] = useState(() => Math.max(0, Math.floor(savedPart)));
  const ch = episode.chapters[chapter]; const singleDurable = durableVoiceAsset(`episode.${episode.id}`);
  const durableParts = durableVoiceParts(`episode.${episode.id}.part`);
  const sources = singleDurable
    ? [{ src: `voice/${singleDurable.file}`, durable: singleDurable }]
    : durableParts.length
      ? durableParts.map((a) => ({ src: `voice/${a.file}`, durable: a }))
      : (episode.voice?.src ?? episode.voice?.previewSrc) ? [{ src: (episode.voice?.src ?? episode.voice?.previewSrc)!, durable: null }] : [];
  const safePart = Math.min(part, Math.max(0, sources.length - 1)); const current = sources[safePart]; const src = current?.src; const durable = current?.durable ?? null;
  useEffect(() => { setPart(Math.max(0, Math.floor(useAudioProgress.getState().position[`${episode.id}:part`] ?? 0))); }, [episode.id]);
  useEffect(() => () => { const a = audio.current; if (a) p.setPosition(episode.id, a.currentTime); p.setPosition(savedPartKey, safePart); a?.pause(); }, [episode.id, safePart, savedPartKey]);
  const toggle = async () => {
    if (!audio.current || !src) return; if (audio.current.paused) { await audio.current.play(); setPlaying(true); } else { audio.current.pause(); setPlaying(false); }
  };
  const command = async (cmd: HandsFreeCommand, transcript: string) => {
    setHeard(transcript);
    if (cmd === 'pause') { audio.current?.pause(); setPlaying(false); }
    else if (cmd === 'play') { try { await audio.current?.play(); setPlaying(true); } catch { /* blocked */ } }
    else if (cmd === 'next') setChapter((x) => Math.min(episode.chapters.length - 1, x + 1));
    else if (cmd === 'previous') setChapter((x) => Math.max(0, x - 1));
    else if (cmd === 'repeat' && audio.current) { audio.current.currentTime = 0; try { await audio.current.play(); setPlaying(true); } catch { /* blocked */ } }
    else if (cmd === 'review') onReview();
    else if (cmd === 'deeper') onFocus(episode.concepts[0]);
    else if (cmd === 'example') {
      const cs = new Set(episode.concepts);
      const example = EPISODES.find((e) => e.format === 'audio-case' && e.id !== episode.id && e.concepts.some((c) => cs.has(c)));
      if (example) onExample(example); else onFocus(episode.concepts[0]);
    }
  };
  const mic = () => { setListening(true); listenForCommand(command, () => setListening(false)); };
  return <div className="aa-page aa-player"><button className="aa-backbtn" onClick={onBack}>← All audio</button>
    <div className="aa-player-main">
      <div className="aa-cover"><span>{episode.format.replace('-', ' ')}</span><div className="aa-wave">{Array.from({ length: 28 }).map((_, i) => <i key={i} style={{ height: `${20 + ((i * 17) % 65)}%` }} />)}</div><b>LEVEL {episode.level}</b></div>
      <div className="aa-player-info"><span className="aa-kicker">{DOMAIN_LABELS[episode.domain]}</span><h1>{episode.title}</h1><p>{episode.subtitle}</p>
        <div className="aa-tags"><span>{episode.minutes} min</span><span>{episode.chapters.length} chapters</span>{sources.length > 1 && <span>{safePart + 1}/{sources.length} audio parts</span>}{(durable || episode.voice) && <span className="voice">{durable?.reviewed || episode.voice?.reviewed ? 'Reviewed natural voice' : 'Natural voice · review pending'}</span>}</div>
        {src ? <><audio key={src} ref={audio} src={src}
          onLoadedMetadata={(e) => { const a = e.currentTarget; if (safePart === savedPart && savedAt > 2 && savedAt < a.duration - 3) a.currentTime = savedAt; }}
          onCanPlay={(e) => { if (playing && e.currentTarget.paused) e.currentTarget.play().catch(() => setPlaying(false)); }}
          onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; if (Math.abs(t - lastSaved.current) >= 5) { lastSaved.current = t; p.setPosition(episode.id, t); p.setPosition(savedPartKey, safePart); } }}
          onPause={(e) => { p.setPosition(episode.id, e.currentTarget.currentTime); p.setPosition(savedPartKey, safePart); }}
          onEnded={() => {
            lastSaved.current = 0; p.setPosition(episode.id, 0);
            if (safePart < sources.length - 1) { p.setPosition(savedPartKey, safePart + 1); setPart(safePart + 1); setPlaying(true); }
            else { p.setPosition(savedPartKey, 0); setPart(0); setPlaying(false); }
          }} /><div className="aa-audioctl"><button onClick={toggle}>{playing ? '❚❚ Pause' : durable ? '▶ Play natural-voice session' : '▶ Play natural-voice sample'}</button>{handsFreeAvailable() && <button className={`aa-mic ${listening ? 'on' : ''}`} onClick={mic}>{listening ? 'Listening…' : '⌁ Hands-free'}</button>}<small>{savedAt > 2 ? `Resume saved at ${fmt(savedAt)} · ` : ''}{durable ? (durable.reviewed ? 'Reviewed durable narration' : 'Durable narration · review pending') : 'Prototype voice sample · production audio requires clinical review'}</small></div>{heard && <div className="aa-heard">Heard: “{heard}”</div>}<div className="aa-command-hint">Say: pause · repeat · next · go deeper · give me an example · quiz me</div></> :
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

function RepPlayer({ rep, onBack, onReview, onFocus, onExample }: { rep: MentalRep; onBack: () => void; onReview: () => void; onFocus: (id: string) => void; onExample: (e: AudioEpisode) => void }) {
  const p = useAudioProgress(); const [i, setI] = useState(0); const beat = rep.beats[i];
  const audio = useRef<HTMLAudioElement>(null); const advanceTimer = useRef<number | null>(null); const [guided, setGuided] = useState(false); const [voicePlaying, setVoicePlaying] = useState(false);
  const [listening, setListening] = useState(false); const [heard, setHeard] = useState('');
  const beatVoiceId = `rep.${rep.id}.${beat.id}`; const durableBeat = durableVoiceAsset(beatVoiceId);
  const voiceSrc = durableBeat ? `voice/${durableBeat.file}` : beat.voice?.src ?? beat.voice?.previewSrc;
  const hasVoice = rep.beats.some((b) => !!(durableVoiceSrc(`rep.${rep.id}.${b.id}`) ?? b.voice?.src ?? b.voice?.previewSrc));

  useEffect(() => {
    if (!guided || !voiceSrc || !audio.current) return;
    const a = audio.current; a.load();
    const id = window.setTimeout(() => { a.play().then(() => setVoicePlaying(true)).catch(() => { setVoicePlaying(false); setGuided(false); }); }, 120);
    return () => { window.clearTimeout(id); a.pause(); setVoicePlaying(false); };
  }, [i, guided, voiceSrc]);

  useEffect(() => () => { if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current); audio.current?.pause(); }, []);

  const startGuided = async () => {
    if (!voiceSrc || !audio.current) return;
    setGuided(true);
    try { await audio.current.play(); setVoicePlaying(true); } catch { setGuided(false); setVoicePlaying(false); }
  };
  const toggleVoice = async () => {
    const a = audio.current; if (!a || !voiceSrc) return;
    if (a.paused) { try { setGuided(true); await a.play(); setVoicePlaying(true); } catch { setGuided(false); /* browser blocked */ } }
    else { a.pause(); setVoicePlaying(false); }
  };
  const ended = () => {
    setVoicePlaying(false);
    if (!guided) return;
    const reflectionMs = Math.max(450, (beat.pauseSeconds ?? (beat.prompt ? 5 : 0)) * 1000);
    if (i < rep.beats.length - 1) {
      // Guided mode is intentionally hands-free. Prompts create a timed reflection pause,
      // then the next narrated beat starts without requiring a button press.
      if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => {
        advanceTimer.current = null;
        setI((x) => Math.min(rep.beats.length - 1, x + 1));
      }, reflectionMs);
    } else {
      p.completeRep(rep.id, rep.concepts);
      setGuided(false);
    }
  };
  const go = (next: number) => { if (advanceTimer.current !== null) { window.clearTimeout(advanceTimer.current); advanceTimer.current = null; } audio.current?.pause(); setVoicePlaying(false); setI(Math.max(0, Math.min(rep.beats.length - 1, next))); };
  const command = async (cmd: HandsFreeCommand, transcript: string) => {
    setHeard(transcript);
    if (cmd === 'pause') { audio.current?.pause(); setVoicePlaying(false); setGuided(false); }
    else if (cmd === 'play') { try { await audio.current?.play(); setVoicePlaying(true); } catch { /* blocked */ } }
    else if (cmd === 'next') go(i + 1);
    else if (cmd === 'previous') go(i - 1);
    else if (cmd === 'repeat' && audio.current) { audio.current.currentTime = 0; try { await audio.current.play(); setVoicePlaying(true); } catch { /* blocked */ } }
    else if (cmd === 'review') onReview();
    else if (cmd === 'deeper') onFocus(rep.concepts[0]);
    else if (cmd === 'example') {
      const cs = new Set(rep.concepts);
      const example = EPISODES.find((e) => e.format === 'audio-case' && e.concepts.some((c) => cs.has(c)));
      if (example) onExample(example); else onFocus(rep.concepts[0]);
    }
  };
  const mic = () => { setListening(true); listenForCommand(command, () => setListening(false)); };

  return <div className="aa-page aa-rehearsal"><button className="aa-backbtn" onClick={onBack}>← Mental Reps</button>
    <div className="aa-rephead"><span className="aa-kicker">GUIDED PROCEDURAL VISUALIZATION</span><h1>{rep.title}</h1><p>{rep.subtitle}</p><div className="aa-warning"><b>Training boundary</b><span>{rep.disclaimer}</span></div>
      {hasVoice && <div className="aa-guided-launch"><div><span className="aa-kicker">NATURAL-VOICE GUIDED MODE</span><b>Let the narration carry the visualization.</b><small>It advances automatically through every narrated beat. Reflection prompts pause briefly, then continue without a Next button.</small></div>
        {!guided ? <button className="aa-primary" onClick={startGuided}>▶ Start guided rep</button> : <button className="aa-secondary" onClick={() => { audio.current?.pause(); setVoicePlaying(false); setGuided(false); }}>Exit guided mode</button>}</div>}
    </div>
    <div className="aa-repstage">
      <div className={`aa-visual ${beat.danger ? 'danger' : ''}`}><RepVisual beat={beat} /><small className="aa-vphase">VISUAL CUE · {beat.phase.toUpperCase()}</small></div>
      <section><div className="aa-stepcount">BEAT {i + 1} OF {rep.beats.length}</div><h2>{beat.title}</h2><p className="aa-narration">{beat.narration}</p>
        {voiceSrc && <><audio ref={audio} src={voiceSrc} onEnded={ended} /><div className="aa-beatvoice"><button onClick={toggleVoice}>{voicePlaying ? '❚❚ Pause narration' : '▶ Play guided sequence'}</button>{handsFreeAvailable() && <button className={`aa-mic ${listening ? 'on' : ''}`} onClick={mic}>{listening ? 'Listening…' : '⌁ Hands-free'}</button>}<span>{durableBeat?.reviewed || beat.voice?.reviewed ? 'Reviewed narration' : durableBeat ? 'Durable natural voice · review pending' : 'Natural-voice prototype'}</span></div>{heard && <div className="aa-heard">Heard: “{heard}”</div>}<div className="aa-command-hint">Say: pause · repeat · next · go deeper · give me an example · quiz me</div></>}
        {beat.pauseSeconds && <div className="aa-pause">Pause · {beat.pauseSeconds} seconds</div>}
        {beat.prompt && <div className="aa-prompt"><b>Mentally answer before moving on</b><p>{beat.prompt}</p></div>}
        {guided ? <div className="aa-autoflow"><span className="aa-kicker">HANDS-FREE FLOW</span><b>{i < rep.beats.length - 1 ? 'Next beat will begin automatically.' : 'Final beat — completion will be recorded automatically.'}</b>{beat.prompt && <small>Reflection pause: {beat.pauseSeconds ?? 5} seconds, then narration continues.</small>}</div> :
        <div className="aa-controls"><button disabled={i === 0} onClick={() => go(i - 1)}>← Previous</button>{i < rep.beats.length - 1 ? <button className="aa-primary" onClick={() => go(i + 1)}>Next beat →</button> :
          <button className="aa-primary" onClick={() => p.completeRep(rep.id, rep.concepts)}>Complete Mental Rep ✓</button>}</div>}
      </section>
    </div>
    <div className="aa-beatbar">{rep.beats.map((b, k) => <button aria-label={b.title} className={k === i ? 'on' : k < i ? 'past' : ''} key={b.id} onClick={() => go(k)} />)}</div>
  </div>;
}
function PageHead({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return <header className="aa-pagehead"><span className="aa-kicker">{kicker}</span><h1>{title}</h1><p>{body}</p></header>;
}
