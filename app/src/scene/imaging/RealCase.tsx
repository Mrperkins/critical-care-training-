/**
 * One real clinical image or clip, taught as a small case: look → commit to an answer → reveal the explanation,
 * the look-fors and optional landmark / pathology overlays drawn on top (never baked into the media).
 * Attribution sits under the frame in one line ("Real clinical image · CC BY 4.0 · Source") and opens the full
 * credit. Items come from repo-root imaging/real/manifest.json; a kind with no shipped media renders nothing.
 */
import { useEffect, useRef, useState } from 'react';
import { loadReal, type RealItem, type RealMark } from './RealExamples';

const REDUCE = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;

function Overlay({ marks }: { marks: RealMark[] }) {
  if (!marks.length) return null;
  return (
    <>
      <svg className="rc-ov" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {marks.map((m, i) => {
          const c = `rc-mk ${m.layer}`;
          if (m.shape === 'ellipse') return <ellipse key={i} className={c} cx={m.x * 100} cy={m.y * 100} rx={(m.rx ?? 0.05) * 100} ry={(m.ry ?? 0.05) * 100} vectorEffect="non-scaling-stroke" />;
          if (m.shape === 'line') return <polyline key={i} className={c} points={(m.pts ?? []).map(([x, y]) => `${x * 100},${y * 100}`).join(' ')} vectorEffect="non-scaling-stroke" />;
          return <circle key={i} className={c} cx={m.x * 100} cy={m.y * 100} r={1.2} vectorEffect="non-scaling-stroke" />;
        })}
      </svg>
      {marks.map((m, i) => <span key={i} className={`rc-lab ${m.layer}`} style={{ left: pct(m.lx ?? m.x), top: pct(m.ly ?? m.y) }}>{m.label}</span>)}
    </>
  );
}

export function RealCaseCard({ it }: { it: RealItem }) {
  const [pick, setPick] = useState<number | null>(null); const [layers, setLayers] = useState({ landmark: false, pathology: false });
  const [info, setInfo] = useState(false); const [playing, setPlaying] = useState(!REDUCE); const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => { const v = vid.current; if (!v) return; if (playing) v.play().catch(() => setPlaying(false)); else v.pause(); }, [playing]);
  const toggle = (l: RealMark['layer']) => {
    const next = { ...layers, [l]: !layers[l] }; setLayers(next);
    // overlays are drawn on the poster frame: hold the clip there while any are shown
    if (vid.current && (next.landmark || next.pathology)) { setPlaying(false); vid.current.currentTime = it.posterAt ?? 0; }
  };
  const isVideo = it.file.endsWith('.mp4'); const q = it.quiz; const answered = pick != null || !q;
  const marks = (it.marks ?? []).filter((m) => layers[m.layer]); const has = (l: RealMark['layer']) => (it.marks ?? []).some((m) => m.layer === l);
  const cc0 = it.license === 'CC0';
  return (
    <article className="rcase" aria-label={`Real clinical ${isVideo ? 'clip' : 'image'}: ${it.title}`}>
      <div className="rc-frame">
        {isVideo
          ? <video ref={vid} poster={it.poster ? `imaging/real/${it.poster}` : undefined} muted loop playsInline autoPlay={!REDUCE} preload="metadata" aria-label={answered ? it.caption : 'Real ultrasound clip — decide what you see first'}>
              {it.webm && <source src={`imaging/real/${it.webm}`} type="video/webm" />}<source src={`imaging/real/${it.file}`} type="video/mp4" />
            </video>
          : <img src={`imaging/real/${it.file}`} alt={answered ? it.caption : 'Real chest radiograph — decide what you see first'} loading="lazy" />}
        {answered && <Overlay marks={marks} />}
      </div>
      <div className="rc-bar">
        {isVideo && <button className="chip" onClick={() => setPlaying(!playing)} aria-pressed={!playing}>{playing ? '❚❚ Pause' : '▶ Play'}</button>}
        {has('landmark') && <button className={`chip${layers.landmark ? ' on' : ''}`} disabled={!answered} aria-pressed={layers.landmark} onClick={() => toggle('landmark')}>Show landmarks</button>}
        {has('pathology') && <button className={`chip${layers.pathology ? ' on' : ''}`} disabled={!answered} aria-pressed={layers.pathology} onClick={() => toggle('pathology')}>{it.findingLabel ?? 'Show pathology'}</button>}
        <span className="rc-credit">
          Real clinical {isVideo ? 'clip' : 'image'} · {it.credit ?? (cc0 ? 'CC0' : it.license)} ·{' '}
          <button className="linklike" onClick={() => setInfo(!info)} aria-expanded={info}>Source</button>
        </span>
      </div>
      {info && <div className="rc-info">
        <p><b>{it.author}</b>. {it.source}</p>
        <p><a href={it.licenseUrl} target="_blank" rel="noreferrer">{cc0 ? 'CC0 1.0 — public-domain dedication' : it.license}</a>{it.provenance?.pageUrl && <> · <a href={it.provenance.pageUrl} target="_blank" rel="noreferrer">original</a></>}</p>
        <p className="muted">Changes: {it.changes} Teaching use only — not for diagnosis.</p>
      </div>}
      <div className="rc-body">
        <h4>{it.title}</h4>
        {q && <div className="rc-quiz">
          <p className="rc-q">{q.q}</p>
          <div className="rc-opts">{q.options.map((o, i) => (
            <button key={o} className={`rc-opt${pick == null ? '' : i === q.answer ? ' ok' : i === pick ? ' bad' : ' dim'}`} disabled={pick != null} onClick={() => setPick(i)}>{o}</button>))}</div>
          {pick != null && <p className={`explain ${pick === q.answer ? 'ok' : 'bad'}`}><b>{pick === q.answer ? 'Yes.' : 'Not quite.'}</b> {q.explain}</p>}
          {pick == null && <p className="muted small">Commit to an answer first — then the look-fors{(it.marks ?? []).length ? ' and overlays' : ''} open.</p>}
        </div>}
        {answered && <>
          <p className="small">{it.caption}</p>
          <p className="small"><b>Look for:</b> {it.look.join(' · ')}</p>
          {it.teach && <ul className="rc-teach">{it.teach.map((t) => <li key={t}>{t}</li>)}</ul>}
          {isVideo && (it.marks ?? []).length > 0 && <p className="muted small">Overlays are drawn on one frame — the clip holds there while they are shown; the anatomy moves once it plays.</p>}
        </>}
      </div>
    </article>
  );
}

/** Every shipped item of this kind, as cases. Nothing renders until the media is ingested. */
export function RealCase({ kind, title, card }: { kind: RealItem['kind']; title?: string; card?: boolean }) {
  const [items, setItems] = useState<RealItem[]>([]);
  useEffect(() => { let on = true; loadReal().then((x) => on && setItems(x.filter((i) => i.kind === kind))); return () => { on = false; }; }, [kind]);
  if (!items.length) return null;
  return (
    <section className={`real rc-wrap${card ? ' card' : ''}`}>
      {title && <div className="real-h"><h4>{title}</h4><span className="img-note">A real patient — compare with the model, then read it yourself.</span></div>}
      {items.map((it) => <RealCaseCard key={it.id} it={it} />)}
    </section>
  );
}
