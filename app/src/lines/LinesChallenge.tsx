import { useEffect, useMemo, useRef, useState } from 'react';
import { useUI } from '../app/store';
import { lines } from './session';
import { LINES_CASES, systemOK, type LCase } from './cases';
import { applyStep } from './LinesLearn';
import { useLinesUI } from './linesStore';
import { LineCard, SetupCard, FlushCard, NumbersCard, TreatCard, BreathingCard } from './LinesPanel';

const store = { get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private */ } } };
const shuffle = <T,>(a: T[], seed: string) => { let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0; const r = a.map((x, i) => ({ x, i })); for (let i = r.length - 1; i > 0; i--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };

export function LinesChallenge() {
  const [cur, setCur] = useState<LCase | null>(null);
  const done = useMemo(() => new Set((store.get('ccp.lines.done') ?? '').split(',').filter(Boolean)), [cur]);
  const start = (c: LCase) => { lines.setNore(0); applyStep(c.setup, true); useLinesUI.getState().set({ labels: c.kind !== 'read', showTrue: false }); setCur(c); };
  if (!cur) return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Challenge</div><h2 className="h2">Trust the line — or fix it</h2><p className="muted">Troubleshoot the monitoring system, read the physiology from the waveforms, and treat to targets. Faults are hidden: use the fast-flush test, the level, the cuff and the waveform shape to find them.</p></section>
      {LINES_CASES.map((c) => (
        <button key={c.id} className="chal-item" onClick={() => start(c)}>
          <span className={`lvl lvl-${c.level}`}>{c.level}</span><span className="ci-t">{c.title}</span><span className="ci-k">{c.kind === 'fix' ? 'Troubleshoot' : c.kind === 'read' ? 'Read the trace' : 'Treat'}</span>{done.has(c.id) && <span className="tick">✓</span>}
        </button>
      ))}
    </div>
  );
  return <Run key={cur.id} c={cur} onExit={() => setCur(null)} onDone={() => { done.add(cur.id); store.set('ccp.lines.done', [...done].join(',')); }} />;
}

function Run({ c, onExit, onDone }: { c: LCase; onExit: () => void; onDone: () => void }) {
  useUI((s) => s.pulse);
  const [pick, setPick] = useState<number | null>(null); const [solved, setSolved] = useState(false); const okSince = useRef<number | null>(null);
  const opts = useMemo(() => shuffle(c.options, c.id), [c]);
  const answered = pick != null; const right = pick === c.answer;
  const fixedNow = c.kind === 'fix' && systemOK(lines);
  const goalsNow = c.kind === 'goal' && !!c.goals?.every((g) => g.test(lines));
  useEffect(() => {
    if (solved) return;
    if (c.kind === 'read' && answered && right) { setSolved(true); onDone(); }
    if ((fixedNow || goalsNow) && answered) { if (okSince.current == null) okSince.current = performance.now(); else if (performance.now() - okSince.current > (c.kind === 'goal' ? 8000 : 1500)) { setSolved(true); onDone(); } } else okSince.current = null;
  });
  return (
    <div className="chal-run">
      <button className="back" onClick={onExit}>← All challenges</button>
      <section className="card">
        <div className="eyebrow">{c.kind === 'fix' ? 'Troubleshoot' : c.kind === 'read' ? 'Read the trace' : 'Treat to target'} · {c.level}</div>
        <h2 className="h2">{c.title}</h2>
        <p>{c.brief}</p>
        <h3 className="q">{c.question}</h3>
        <div className="opts">{opts.map(({ x, i }) => <button key={i} disabled={answered && right} className={`opt${answered && i === c.answer && right ? ' right' : ''}${pick === i && i !== c.answer ? ' wrong' : ''}`} onClick={() => setPick(i)}>{x}</button>)}</div>
        {answered && <p className={`explain ${right ? 'ok' : 'bad'}`}>{right ? c.explain : 'Not quite — look again at the waveform, the fast-flush test and the level, then try another answer.'}</p>}
        {answered && right && c.kind === 'fix' && <p className="muted small">{solved ? '✓ Fixed — the monitor matches the true pressures again.' : 'Now fix it at the bedside with the controls below. The case is solved when the monitor matches the patient again.'}</p>}
        {answered && right && c.kind === 'goal' && <ul className="goals">{c.goals!.map((g) => <li key={g.label} className={g.test(lines) ? 'ok' : ''}>{g.test(lines) ? '✓' : '○'} {g.label}</li>)}{solved && <li className="ok">✓ Targets held — well done.</li>}</ul>}
        {solved && <div className="actions"><button className="act primary" onClick={onExit}>Next challenge →</button></div>}
      </section>
      {c.kind === 'fix' && <><NumbersCard hideTrue={!solved} /><FlushCard /><SetupCard /><LineCard id="art" faults={false} /><LineCard id="cvp" faults={false} />{c.id === 'c-transport' && <TreatCard />}</>}
      {c.kind === 'goal' && answered && right && <><TreatCard /><BreathingCard /><NumbersCard /></>}
      {c.kind === 'read' && <NumbersCard hideTrue />}
    </div>
  );
}
