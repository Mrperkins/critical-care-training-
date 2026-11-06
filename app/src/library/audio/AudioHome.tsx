/**
 * Browse › Audio: the audio library as shelves — Continue listening, Mental Reps, Audio cases, Quick listens,
 * Deep dives and Listening tracks. Sessions play in the player bar; Mental Reps (narration with a visual cue
 * per beat) and anything without a published voice file open in the full audio app.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { EPISODES, MENTAL_REPS } from '../../audio/catalog';
import { DOMAIN_LABELS } from '../../audio/mastery';
import { EXPERT_TRACKS } from '../../audio/tracks';
import { useAudioProgress } from '../../audio/progress';
import { ContentFormatIcon } from '../ContentFormatIcon';
import type { AudioEpisode, AudioFormat, MentalRep } from '../../audio/types';
import { audioAppHref, audioAssets, episodeSeconds, episodeSources, playEpisode, usePlayer } from './player';

const FORMAT_LABEL: Record<AudioFormat, string> = { 'daily-dose': 'Daily dose', rounds: 'Rounds', 'deep-dive': 'Deep dive', 'audio-case': 'Audio case', 'icu-literacy': 'ICU literacy', 'mental-rep': 'Mental Rep' };
const TONE: Record<string, string> = { rep: '#1d1a33', 'audio-case': '#271a12', quick: '#11261f', 'deep-dive': '#2a1620', track: '#1d1a33' };
const bars = (seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; return Array.from({ length: 22 }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; return 18 + ((h >>> 8) % 70) + (i % 3) * 4; }); };

function Wave({ seed }: { seed: string }) {
  return <span className="aud-wave" aria-hidden="true">{bars(seed).map((v, i) => <i key={i} style={{ height: `${Math.min(92, v)}%` }} />)}</span>;
}
function PlayIcon() { return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor" /></svg>; }

function Row({ title, sub, href, children }: { title: string; sub?: string; href?: string; children: ReactNode }) {
  return (
    <section className="lib-row" aria-label={title}>
      <div className="lib-row-h"><div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{href && <a className="lib-link" href={href}>View all<span className="sr-only"> {title}</span></a>}</div>
      <div className="lib-scroller">{children}</div>
    </section>
  );
}

function EpisodeCard({ e, tone, voiced, left, secs }: { e: AudioEpisode; tone: string; voiced: boolean; left?: number; secs?: number | null }) {
  const mins = Math.max(1, Math.round((secs ?? e.minutes * 60) / 60));
  const cur = usePlayer((s) => s.item?.id === e.id); const playing = usePlayer((s) => s.playing && s.item?.id === e.id);
  const done = useAudioProgress((s) => !!s.completed[e.id]);
  const open = async () => { if (!(await playEpisode({ id: e.id, title: e.title, kind: 'episode', minutes: e.minutes, concepts: e.concepts }))) location.href = audioAppHref(`episode=${encodeURIComponent(e.id)}`); };
  return (
    <button className={`aud-card${cur ? ' on' : ''}`} onClick={open} aria-label={`${playing ? 'Pause' : 'Play'} ${e.title}`}>
      <span className="aud-art" style={{ background: tone }}>
        <Wave seed={e.id} />
        <span className="aud-play" aria-hidden="true">{playing ? <svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg> : <PlayIcon />}</span>
        <span className="aud-dur">{left != null ? `${Math.max(1, Math.round(left / 60))} min left` : `${mins} min`}</span>
        {done && <span className="lib-chip done">Done</span>}
      </span>
      <span className="lib-card-meta"><span className="lib-format-mark" title="Audio learning"><ContentFormatIcon kind="audio" size={16} /><span className="sr-only">Audio learning</span></span><b className="k-audio">{FORMAT_LABEL[e.format]}</b><span>{DOMAIN_LABELS[e.domain]}{voiced ? '' : ' · read along'}</span></span>
      <span className="lib-card-title">{e.title.replace(/^(Audio Case|ICU Literacy|Expert Case): /, '')}</span>
    </button>
  );
}

function RepCard({ r }: { r: MentalRep }) {
  const done = useAudioProgress((s) => !!s.repCompleted[r.id]);
  return (
    <a className="aud-card" href={audioAppHref(`rep=${encodeURIComponent(r.id)}`)}>
      <span className="aud-art" style={{ background: TONE.rep }}>
        <Wave seed={r.id} />
        <span className="aud-play" aria-hidden="true"><PlayIcon /></span>
        <span className="aud-dur">{r.minutes} min</span>
        {done && <span className="lib-chip done">Done</span>}
      </span>
      <span className="lib-card-meta"><span className="lib-format-mark" title="Audio learning"><ContentFormatIcon kind="audio" size={16} /><span className="sr-only">Audio learning</span></span><b className="k-audio">Mental Rep</b><span>{r.beats.length} guided beats</span></span>
      <span className="lib-card-title">{r.title}</span>
    </a>
  );
}

export default function AudioHome() {
  const [map, setMap] = useState<Record<string, { file: string; seconds?: number }>>({});
  useEffect(() => { void audioAssets().then(setMap); }, []);
  const voiced = (id: string) => episodeSources(map, id).length > 0;
  const secs = (id: string) => episodeSeconds(map, id);
  const lengthOf = (e: AudioEpisode) => secs(e.id) ?? e.minutes * 60;
  const position = useAudioProgress((s) => s.position); const completed = useAudioProgress((s) => s.completed);
  const going = useMemo(() => EPISODES.filter((e) => (position[e.id] ?? 0) > 5 && !completed[e.id]), [position, completed]);
  const cases = EPISODES.filter((e) => e.format === 'audio-case');
  const quick = EPISODES.filter((e) => lengthOf(e) <= 20 * 60 && e.format !== 'audio-case').sort((a, b) => lengthOf(a) - lengthOf(b));
  const deep = EPISODES.filter((e) => e.format === 'deep-dive').sort((a, b) => lengthOf(b) - lengthOf(a));
  const featured = going[0] ?? EPISODES.find((e) => e.id.includes('ecmo')) ?? deep[0];
  const playFeatured = async () => { if (!(await playEpisode({ id: featured.id, title: featured.title, kind: 'episode', minutes: featured.minutes, concepts: featured.concepts }))) location.href = audioAppHref(`episode=${encodeURIComponent(featured.id)}`); };
  return (
    <>
      <section className="lib-hero aud-hero" style={{ background: '#1d1a33' }}>
        <div className="lib-hero-copy">
          <p className="lib-kicker">{going[0] ? 'Pick up where you left off' : `${FORMAT_LABEL[featured.format]} · ${DOMAIN_LABELS[featured.domain]}`}</p>
          <h1 className="lib-display">{featured.title}</h1>
          <p className="lib-lede">{featured.subtitle}</p>
          <div className="lib-actions">
            <button className="lib-btn primary" onClick={playFeatured}><PlayIcon />{going[0] ? 'Resume' : `Play · ${Math.round(lengthOf(featured) / 60)} min`}</button>
            <a className="lib-btn" href={audioAppHref('page=home')}>Open the audio app</a>
          </div>
        </div>
        <div className="lib-hero-art aud-hero-art" aria-hidden="true"><Wave seed={featured.id} /></div>
      </section>

      {going.length > 0 && <Row title="Continue listening">{going.map((e) => <EpisodeCard key={e.id} e={e} tone={TONE[e.format] ?? TONE.quick} voiced={voiced(e.id)} left={lengthOf(e) - (position[e.id] ?? 0)} />)}</Row>}
      <Row title="Mental Reps · voice-guided procedures" sub="Rehearse a procedure beat by beat, with a visual cue for each step" href={audioAppHref('page=reps')}>{MENTAL_REPS.map((r) => <RepCard key={r.id} r={r} />)}</Row>
      <Row title="Audio cases · think it through out loud" sub="A patient unfolds; you reason along" href={audioAppHref('page=listen')}>{cases.map((e) => <EpisodeCard key={e.id} e={e} tone={TONE['audio-case']} voiced={voiced(e.id)} secs={secs(e.id)} />)}</Row>
      <Row title="Quick listens · under 20 minutes" sub="One idea, one drive" href={audioAppHref('page=listen')}>{quick.map((e) => <EpisodeCard key={e.id} e={e} tone={TONE.quick} voiced={voiced(e.id)} secs={secs(e.id)} />)}</Row>
      <Row title="Deep dives" sub="The long sessions: physiology to bedside decisions" href={audioAppHref('page=listen')}>{deep.map((e) => <EpisodeCard key={e.id} e={e} tone={TONE['deep-dive']} voiced={voiced(e.id)} secs={secs(e.id)} />)}</Row>
      <Row title="Listening tracks · in order, by system" sub="Sessions put in order, start to finish" href={audioAppHref('page=tracks')}>
        {EXPERT_TRACKS.map((t) => <a key={t.id} className="lib-poster aud-poster" style={{ background: TONE.track }} href={audioAppHref('page=tracks')}>
          <span className="lib-poster-k">{t.episodes.length} session{t.episodes.length === 1 ? '' : 's'}</span>
          <span><span className="lib-display sm">{t.title}</span><span className="lib-poster-sub">{t.promise}</span></span>
        </a>)}
      </Row>
    </>
  );
}
