/** Draws the case HUD (see game.ts) over the 3D scene. Everything is driven by the case that is running. */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fmtClock, useGame } from './game';
import { usePlayerUI } from './playerUI';

function Clock() {
  const startedAt = useGame((s) => s.startedAt); const endedAt = useGame((s) => s.endedAt);
  const [, tick] = useState(0);
  useEffect(() => { if (endedAt) return; const t = setInterval(() => tick((n) => n + 1), 500); return () => clearInterval(t); }, [endedAt]);
  return <span className="hud-clock" aria-label="Elapsed time">{fmtClock((endedAt ?? Date.now()) - startedAt)}</span>;
}
/** While an alarm is unanswered the patient meter slips (not in practice mode). */
function useDecay() {
  const decaying = useGame((s) => s.decaying); const practice = usePlayerUI((s) => s.practice);
  useEffect(() => {
    if (!decaying || practice) return;
    const t = setInterval(() => { const g = useGame.getState(); g.set({ patient: Math.max(0.15, g.patient - 0.006) }); }, 500);
    return () => clearInterval(t);
  }, [decaying, practice]);
}

function Debrief() {
  const d = useGame((s) => s.debrief)!; const title = useGame((s) => s.title); const score = useGame((s) => s.score); const best = useGame((s) => s.bestStreak);
  const onNext = useGame((s) => s.onNext); const nextLabel = useGame((s) => s.nextLabel); const onReplay = useGame((s) => s.onReplay); const replayLabel = useGame((s) => s.replayLabel); const practice = usePlayerUI((s) => s.practice);
  return (
    <div className="hud-debrief" role="dialog" aria-label={`${title} debrief`}>
      <div className="hud-debrief-in">
        <p className="hud-k">{d.verdict ?? (d.ok ? 'Case cleared' : 'Not yet')}</p>
        <div className="hud-stars" aria-label={`${d.stars} of 3 stars`}>{[0, 1, 2].map((i) => <span key={i} className={i < d.stars ? 'on' : ''} aria-hidden="true">★</span>)}</div>
        <h2>{d.ok ? `${title} in ${fmtClock(d.ms)}` : title}</h2>
        <div className="hud-stats">
          <div><b>{d.right}/{d.total}</b><small>Decisions</small></div>
          {!practice && <div><b>{score}</b><small>Points</small></div>}
          <div><b>{fmtClock(d.ms)}</b><small>Time</small></div>
          {!practice && <div><b>🔥 {best}</b><small>Best streak</small></div>}
        </div>
        {d.tip && <p className="hud-tip">{d.tip}</p>}
        <div className="hud-debrief-act">
          {onReplay && <button className="lib-btn" onClick={onReplay}>{replayLabel ?? '↻ Replay'}</button>}
          {onNext && <button className="lib-btn primary" onClick={onNext}>{nextLabel ?? 'Next step'} →</button>}
        </div>
        {d.prevBest != null && <p className="hud-tip muted">Your best before this run: {'★'.repeat(d.prevBest) || 'no stars'}</p>}
        {(d.lines?.length ?? 0) > 0 && <ol className="hud-lines">{d.lines!.map((l, i) => <li key={i} className={l.ok ? 'ok' : 'miss'}>
          <span aria-hidden="true">{l.ok ? '✓' : '!'}</span><div><b>{l.q}</b>{!l.ok && l.yours && <p className="hud-yours">You chose: {l.yours}. Best: {l.best}.</p>}<p>{l.explain}</p></div>
        </li>)}</ol>}
        {d.extra}
      </div>
    </div>
  );
}

/** The HUD sits over the 3D scene itself (so a module's waveforms below it stay readable). */
function useSceneHost(on: boolean) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!on) { setHost(null); return; }
    const ws = document.getElementById('workspace'); if (!ws) return;
    const find = () => setHost((ws.querySelector('.scene-pane .scene-wrap') ?? ws.querySelector('.scene-wrap') ?? ws.querySelector('.scene-pane')) as HTMLElement | null);
    find(); const mo = new MutationObserver(find); mo.observe(ws, { childList: true, subtree: true }); return () => mo.disconnect();
  }, [on]);
  return host;
}

export function GameHUD() {
  const on = useGame((s) => !!s.id); const host = useSceneHost(on);
  if (!on) return null;
  return host ? createPortal(<HUD />, host) : <HUD />;
}

function HUD() {
  const g = useGame(); const practice = usePlayerUI((s) => s.practice); useDecay();
  const [toastOn, setToastOn] = useState(false);
  useEffect(() => { if (!g.toast) return; setToastOn(true); const t = setTimeout(() => setToastOn(false), 4200); return () => clearTimeout(t); }, [g.toast?.at]); // eslint-disable-line react-hooks/exhaustive-deps
  const q = g.question;
  return (
    <div className={`hud${q ? ' has-q' : ''}${g.debrief ? ' has-debrief' : ''}`} aria-label={`${g.title} case`}>
      <div className="hud-top">
        {g.onExit && <button className="hud-exit" onClick={g.onExit} aria-label={g.exitLabel ?? 'Leave the case'}>←</button>}
        <b className="hud-title">{g.title}{g.level && <small>{g.level}</small>}</b>
        <button className={`hud-practice${practice ? ' on' : ''}`} aria-pressed={practice} onClick={() => usePlayerUI.getState().setPractice(!practice)} title="Practice mode: no clock or points">{practice ? 'Practice' : 'Timed'}</button>
        {!practice && <span className="hud-pill streak" aria-label={`Streak ${g.streak}`}>🔥 {g.streak}</span>}
        {!practice && <span className="hud-pill" aria-label={`${g.score} points`}>{g.score} pts</span>}
        {!practice && <Clock />}
      </div>
      {g.banner && <div className={`hud-banner ${g.banner.tone}`} role="status">{g.banner.tone === 'alarm' ? '🔔 ' : ''}{g.banner.text}</div>}
      {g.chips.length > 0 && !g.goals && <div className="hud-chips" aria-label="Key numbers">{g.chips.map((c) => <div key={c.label} className={`hud-chip${c.tone ? ` ${c.tone}` : ''}`}><small>{c.label}</small><b>{c.value}</b></div>)}</div>}
      {g.goals && <div className="hud-goals" aria-label="Goals">{g.goals.map((x, i) => <div key={x.label} className={`hud-chip ${x.ok ? 'ok' : 'bad'}`}><small>{x.label}</small><b>{g.chips[i]?.value ?? ''} {x.ok ? '✓' : '✗'}</b></div>)}</div>}
      {!practice && (g.decaying || g.patient < 1) && !g.debrief && <div className="hud-patient" aria-label={`Patient stability ${Math.round(g.patient * 100)} percent`}>
        <small>Patient</small><div className="hud-bar"><i style={{ width: `${g.patient * 100}%` }} className={g.patient < 0.4 ? 'bad' : g.patient < 0.75 ? 'warn' : 'ok'} /></div>
      </div>}
      {g.toast && toastOn && !g.debrief && <div className={`hud-toast${g.toast.ok === true ? ' ok' : g.toast.ok === false ? ' bad' : ''}`} role="status">{g.toast.text}</div>}

      <div className="hud-bottom">
        {g.card && !q && <section className={`hud-card${g.card.compact ? ' compact' : ''}`}>
          {g.card.kicker && <p className="hud-k">{g.card.kicker}</p>}
          <h2>{g.card.title}</h2>
          {g.card.text && <p>{g.card.text}</p>}
          {g.card.items && g.card.items.length > 0 && <dl className="hud-items">{g.card.items.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
          {(g.card.cta || g.card.secondary) && <div className="hud-card-act">{g.card.secondary && <button className="lib-btn" onClick={g.card.secondary.onClick}>{g.card.secondary.label}</button>}{g.card.cta && <button className="lib-btn primary" onClick={g.card.cta.onClick}>{g.card.cta.label}</button>}</div>}
        </section>}
        {q && <section className="hud-q" aria-labelledby="hud-q-h">
          <h2 id="hud-q-h">{q.q}</h2>
          <div className={`hud-tiles n${q.tiles.length}`} role="group" aria-labelledby="hud-q-h">
            {q.tiles.map((t, i) => {
              const cls = q.picked == null ? '' : i === q.answer ? ' right' : i === q.picked ? ' wrong' : ' dim';
              return <button key={i} className={`hud-tile${cls}`} disabled={q.picked != null} aria-pressed={q.picked === i} onClick={() => g.onAnswer?.(i)}>
                {t.icon && <span className="hud-tile-i" aria-hidden="true">{t.icon}</span>}<span>{t.label}</span>{t.sub && <small>{t.sub}</small>}
              </button>;
            })}
          </div>
          {q.picked != null && <p className={`hud-explain${q.picked === q.answer ? ' ok' : ''}`} role="status"><b>{q.picked === q.answer ? 'Right.' : `Best: ${q.tiles[q.answer].label}.`}</b> {q.explain}</p>}
          {q.picked != null && g.onContinue && <button className="lib-btn primary hud-continue" onClick={g.onContinue}>{g.continueLabel ?? 'Continue'} →</button>}
        </section>}
        {!q && g.meter && <section className="hud-card compact"><p className="hud-k">{g.meter.ok ? 'Resolved' : 'Fix it'}</p>
          <div className="hud-meter"><div className="hud-bar"><i style={{ width: `${Math.min(100, (g.meter.value / (g.meter.target * 3)) * 100)}%` }} className={g.meter.ok ? 'ok' : 'bad'} /><s style={{ left: '33.3%' }} /></div>
            <small>{g.meter.label}: <b>{g.meter.value.toFixed(1)}</b> (target ≤ {g.meter.target}){g.meter.note ? ` · ${g.meter.note}` : ''}</small></div>
        </section>}
        {!q && (g.actions || g.controls || g.tools) && <div className="hud-tray" role="toolbar" aria-label="Actions">
          {g.actions?.map((a) => <button key={a.id} className={`hud-act${a.primary ? ' go' : ''}`} disabled={a.disabled} onClick={() => g.onAction?.(a.id)}>{a.icon && <span aria-hidden="true">{a.icon}</span>}<b>{a.label}</b>{a.sub && <small>{a.sub}</small>}</button>)}
          {g.controls?.map((c) => <div key={c.key} className="hud-ctl" role="group" aria-label={c.label}><small>{c.label}</small><button onClick={c.dec} aria-label={`Lower ${c.label}`}>−</button><b>{c.value}</b><button onClick={c.inc} aria-label={`Raise ${c.label}`}>+</button></div>)}
          {g.tools?.map((t) => <button key={t.label} className={`hud-act${t.primary ? ' go' : ''}`} onClick={t.onClick}>{t.icon && <span aria-hidden="true">{t.icon}</span>}<b>{t.label}</b></button>)}
        </div>}
      </div>
      {g.debrief && <Debrief />}
    </div>
  );
}
