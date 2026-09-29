import { useProgress } from '../curriculum/progress';
import { useEffect, useMemo, useState } from 'react';
import { session } from './session';
import { useUI } from '../app/store';
import { VENT_CHALLENGES, type VentChallenge as VC } from '../scenarios/ventChallenges';
import { DYSS, DYSSYNCHRONIES } from '../scenarios/dyssynchrony';
import { loadVentScenario, VentControls, VentNumbersCard, Interventions, GasCard } from './VentPanel';
import { Loops } from './Waveforms';
import { ventNumbers } from './numbers';

const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } } };
const seeded = <T,>(arr: T[], seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function VentChallenge() {
  const [cur, setCur] = useState<VC | null>(null);
  const done = useMemo(() => new Set((store.get('ccp.vent.done') ?? '').split(',').filter(Boolean)), [cur]);
  const start = (c: VC) => { loadVentScenario(c.scenario, c.dyss ?? null); if (c.settings) session.set(c.settings); useUI.getState().set({ showPmus: false }); setCur(c); };
  if (!cur) return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Challenge</div><h2 className="h2">Read the machine, fix the patient</h2><p className="muted">Each case runs on the live lung model. Nothing is scripted: when you change a setting, the problem gets better or worse because the physics says so.</p></section>
      {VENT_CHALLENGES.map((c) => (
        <button key={c.id} className="chal-item" onClick={() => start(c)}>
          <span className={`lvl lvl-${c.level}`}>{c.level}</span><span className="ci-t">{c.title}</span><span className="ci-k">{c.kind === 'dyss' ? 'Dyssynchrony' : c.kind === 'alarm' ? 'Alarm' : 'Targets'}</span>{done.has(c.id) && <span className="tick">✓</span>}
        </button>
      ))}
    </div>
  );
  return <ChallengeRun key={cur.id} c={cur} onExit={() => setCur(null)} onDone={() => { done.add(cur.id); store.set('ccp.vent.done', [...done].join(',')); }} />;
}

function ChallengeRun({ c, onExit, onDone }: { c: VC; onExit: () => void; onDone: () => void }) {
  useUI((s) => s.pulse);
  const [pick, setPick] = useState<number | null>(null); const [act, setAct] = useState<number | null>(null); const [solved, setSolved] = useState(false);
  const d = c.dyss ? DYSS[c.dyss] : null;
  const options = useMemo(() => d ? seeded(DYSSYNCHRONIES.map((x) => x.name), c.id) : c.options ?? [], [c, d]);
  const answer = d ? options.indexOf(d.name) : c.answer ?? 0;
  const r = session.m.recent(6); const since = session.breathN - session.changedAt;
  const n = ventNumbers(session); const g = session.snap;

  const okNow = (d != null && pick != null && d.metric(r) <= d.threshold && since >= 6) || (c.kind === 'goal' && !!c.goals && c.goals.every((gl) => gl.test(n, g)) && since >= 6);
  useEffect(() => { if (okNow && !solved) { setSolved(true); onDone(); } }, [okNow, solved, onDone]);
  let status: JSX.Element | null = null;
  if (d && pick != null) {
    const v = d.metric(r); const pct = Math.min(1, v / (d.threshold * 3));
    status = (
      <section className="card">
        <div className="card-h"><h3>Fix it</h3><span className={`pill ${solved ? 'ok' : 'bad'}`}>{solved ? 'Resolved' : since < 6 ? `measuring… ${since}/6 breaths` : 'Still present'}</span></div>
        <div className="meter"><div className="meter-bar"><span style={{ width: `${pct * 100}%` }} className={v <= d.threshold ? 'ok' : 'bad'} /><i style={{ left: `${(1 / 3) * 100}%` }} /></div><div className="meter-l">{d.label}: <b>{v.toFixed(1)}</b> (target ≤ {d.threshold})</div></div>
        {solved && <div className="reveal"><b>Why that worked.</b> {d.why}<ul>{d.fixes.map((f) => <li key={f}>{f}</li>)}</ul></div>}
      </section>
    );
  }
  if (c.kind === 'goal' && c.goals) {
    const res = c.goals.map((gl) => gl.test(n, g));
    status = (
      <section className="card">
        <div className="card-h"><h3>Targets</h3><span className={`pill ${solved ? 'ok' : ''}`}>{solved ? 'Achieved' : `${res.filter(Boolean).length}/${res.length}`}</span></div>
        <ul className="goals">{c.goals.map((gl, i) => <li key={gl.label} className={res[i] ? 'ok' : 'bad'}>{res[i] ? '✓' : '○'} {gl.label}</li>)}</ul>
        <p className="muted small">Settings take a few breaths to settle; use “+30 min” to let the blood gases catch up.</p>
      </section>
    );
  }

  return (
    <div className="chal-run">
      <button className="back" onClick={onExit}>← All challenges</button>
      <section className="card"><div className="eyebrow">{c.level} · {c.kind === 'dyss' ? 'Dyssynchrony' : c.kind === 'alarm' ? 'Alarm' : 'Targets'}</div><h2 className="h2">{c.title}</h2><p>{c.brief}</p></section>
      {(c.kind === 'dyss' || c.kind === 'alarm') && (
        <section className="card">
          <h3>{d ? 'What is the waveform telling you?' : c.question}</h3>
          <div className="opts">{options.map((o, i) => <button key={o} disabled={pick != null} className={`opt${pick != null && i === answer ? ' right' : ''}${pick === i && i !== answer ? ' wrong' : ''}`} onClick={() => { setPick(i); useProgress.getState().record(`vent-${c.id}`, i === answer); if (d) useUI.getState().set({ showPmus: true }); }}>{o}</button>)}</div>
          {pick != null && <div className="reveal"><b>{pick === answer ? 'Correct.' : `It's ${options[answer]}.`}</b> {d ? <>{d.clue} <em>The dashed red trace now shows the patient’s own muscle effort — the thing the ventilator cannot see.</em></> : c.explain}</div>}
        </section>
      )}
      {c.kind === 'alarm' && pick != null && c.action && (
        <section className="card">
          <h3>{c.action.question}</h3>
          <div className="opts">{c.action.options.map((o, i) => <button key={o} disabled={act != null} className={`opt${act != null && i === c.action!.answer ? ' right' : ''}${act === i && i !== c.action!.answer ? ' wrong' : ''}`} onClick={() => { setAct(i); const fix = session.sc.fixes[0]; if (fix) session.intervene(fix); if (!solved) { setSolved(true); onDone(); } }}>{o}</button>)}</div>
          {act != null && <div className="reveal"><b>{act === c.action.answer ? 'Right.' : `Best answer: ${c.action.options[c.action.answer]}.`}</b> {c.action.explain} <em>It has been done — watch the waveforms and the lungs.</em></div>}
        </section>
      )}
      {status}
      <VentNumbersCard />
      {c.kind === 'alarm' ? <Interventions /> : <><Interventions /><VentControls /></>}
      <section className="card"><Loops /></section>
      <GasCard />
    </div>
  );
}
