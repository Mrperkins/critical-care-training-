/** The bar at the foot of the app while an audio session plays; it stays put across Lessons and Audio. */
import { audioAppHref, closePlayer, fmtClock, seekBy, seekTo, togglePlay, usePlayer } from './player';

export function PlayerBar() {
  const item = usePlayer((s) => s.item); const playing = usePlayer((s) => s.playing); const t = usePlayer((s) => s.t); const dur = usePlayer((s) => s.dur);
  const part = usePlayer((s) => s.part); const parts = usePlayer((s) => s.sources.length); const error = usePlayer((s) => s.error);
  if (!item) return null;
  return (
    <div className="lib-player" role="region" aria-label="Audio player">
      <button className="lib-player-play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing
          ? <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor" /></svg>
          : <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor" /></svg>}
      </button>
      <button className="lib-player-skip" onClick={() => seekBy(-15)} aria-label="Back 15 seconds">−15</button>
      <div className="lib-player-body">
        <div className="lib-player-title"><b>{item.title}</b>{parts > 1 && <small>Part {part + 1} of {parts}</small>}{error && <small className="err">{error}</small>}</div>
        <label className="lib-player-scrub"><span className="sr-only">Position</span>
          <input type="range" min={0} max={Math.max(1, Math.floor(dur))} step={1} value={Math.floor(t)} onChange={(e) => seekTo(+e.target.value)} />
        </label>
      </div>
      <button className="lib-player-skip" onClick={() => seekBy(30)} aria-label="Forward 30 seconds">+30</button>
      <span className="lib-player-time">{fmtClock(t)} / {fmtClock(dur)}</span>
      <a className="lib-player-open" onClick={() => { if (playing) togglePlay(); }} href={audioAppHref(`episode=${encodeURIComponent(item.id)}`)}>Full player</a>
      <button className="lib-player-close" onClick={closePlayer} aria-label="Stop and close the player">×</button>
    </div>
  );
}
