/**
 * Three-chamber chest drain: a real unit, and live gauges from `drainView` — the water-seal column moves with the
 * vent session's REAL pleural pressure (positive pressure: falls in inspiration). Live controls let the learner
 * kink / clamp / loop the tubing, add suction or a leak; an occluded drain on a leaking lung is fed back to
 * the vent session so tension re-accumulates in the mechanics. A case quiz reads the same model.
 */
import { useEffect, useRef, useState } from 'react';
import { session } from '../vent/session';
import { drainView, clampTest, DRAIN_CASES, caseConfig, type LeakGrade } from './chestDrain';
import { useDrain, setDrain } from './drainStore';
import { RealStudy } from '../scene/imaging/RealStudy';

/** Pleural pressure over time: the vent session when ventilated; a labelled spontaneous teaching trace otherwise. */
function usePleural(ppv: boolean) {
  const buf = useRef<number[]>([]); const [s, setS] = useState({ p: 0, lo: 0, hi: 0, t: 0 });
  useEffect(() => {
    let raf = 0; const t0 = performance.now(); buf.current = [];
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      const p = ppv ? session.pleural() : -5 - 3.5 * Math.sin((2 * Math.PI * t) / 3.75); // 16/min, inspiration pulls pleural pressure down
      const b = buf.current; b.push(p); if (b.length > 240) b.shift();
      setS({ p, lo: Math.min(...b), hi: Math.max(...b), t }); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, [ppv]);
  return s;
}

const Tg = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => <button className={`chip${on ? ' on' : ''}`} aria-pressed={on} onClick={onClick}>{label}</button>;

export function DrainCard({ quiz = true }: { quiz?: boolean }) {
  const { cfg: live, caseId, answer, test, set } = useDrain();
  const k = caseId ? DRAIN_CASES.find((c) => c.id === caseId)! : null; const cfg = k ? caseConfig(k) : live;
  const pl = usePleural(cfg.ppv); const v = drainView(cfg, pl);
  const level = Math.max(-6, Math.min(6, v.level)); const problems = [cfg.clamped && 'clamped', cfg.kink && 'kinked tubing', cfg.loopMl > 0 && `dependent loop holding ${cfg.loopMl} mL`, cfg.unitHigh && 'unit above the chest', cfg.sideHoleOut && 'side hole outside the chest (subcutaneous air)'].filter(Boolean) as string[];
  const clampTestFor = (at: 'chest' | 'unit') => set({ test: clampTest(cfg, at).meaning });
  return (
    <section className="card drain">
      <div className="card-h"><h3>Chest drain · three-chamber unit</h3><span className="muted small">{cfg.ppv ? 'ventilated — live pleural pressure' : 'spontaneous breathing (teaching trace)'}</span></div>
      <RealStudy compact kinds={['procedure']} want={['chest_drain_unit']} required={['chest_drain_unit']} label="chest drain photo"
        reading={[`${cfg.fluid === 'blood' ? 'Blood' : 'Serous fluid'} draining${cfg.suction ? `, suction −${cfg.suctionSet} cmH₂O` : ', water seal only'}.`, ...(problems.length ? [`Problem: ${problems.join(', ')}.`] : ['Tubing free, unit below the chest.'])]} />
      <div className="drain-gauges" role="img" aria-label={`Drain: swing ${v.swing} cm, bubbling ${v.bubbling}, drainage ${v.rate} mL per hour`}>
        <div className="dg"><span>Water seal</span><div className="dg-col"><i className="dg-zero" /><b style={{ bottom: `${50 + (level / 6) * 45}%` }} /></div><small>{v.level >= 0 ? '+' : ''}{v.level.toFixed(1)} cm</small></div>
        <div className="dg"><span>Air leak</span><div className={`dg-bub ${v.bubblingNow ? 'on' : ''}`}>{v.bubbling === 'none' ? 'none' : v.bubbling}</div><small>{v.bubblingNow ? 'bubbling now' : 'quiet'}</small></div>
        <div className="dg"><span>Collected</span><div className="dg-col fill"><b style={{ height: `${Math.min(100, (v.total / 2500) * 100)}%`, background: cfg.fluid === 'blood' ? '#a3242b' : '#d9c27a' }} /></div><small>{v.total} mL</small></div>
        <div className="dg"><span>Suction chamber</span><div className={`dg-bub ${v.suctionChamber !== 'still' ? 'on' : ''}`}>{v.suctionChamber}</div><small>{cfg.suction ? `−${cfg.suctionSet}` : 'off'}</small></div>
      </div>
      <div className="ln-flush">
        <div><span>Tidaling</span><b className={v.patent ? 'ok' : 'bad'}>{v.swing} cm</b></div>
        <div><span>Air leak</span><b className={v.bubbling === 'none' ? '' : 'bad'}>{v.bubbling}</b></div>
        <div><span>Drainage</span><b className={v.surgical ? 'bad' : ''}>{v.rate} mL/h</b></div>
        <div><span>Collected</span><b>{v.total} mL</b></div>
      </div>
      {k ? (
        <div className="iabp-quiz">
          <p className="small"><b>{k.title}.</b> {k.story}</p>
          <p className="muted small">{k.question}</p>
          <div className="wf-opts">{k.options.map((o) => <button key={o.id} className={`wf-opt${answer === o.id ? (o.id === k.answer ? ' ok' : ' bad') : ''}`} onClick={() => set({ answer: o.id })}>{o.label}</button>)}</div>
          {answer && <p className={`explain ${answer === k.answer ? 'ok' : 'bad'}`}><b>{answer === k.answer ? '✓ ' : '✗ '}</b>{k.explain}</p>}
          <div className="wf-foot"><button className="linkish" onClick={() => { const i = DRAIN_CASES.indexOf(k); set({ caseId: DRAIN_CASES[(i + 1) % DRAIN_CASES.length].id, answer: null, test: null }); }}>Next case →</button><button className="linkish" onClick={() => set({ caseId: null, answer: null, test: null })}>Back to the live drain</button></div>
        </div>
      ) : (<>
        <div className="chips">
          <Tg on={cfg.suction} label="Suction" onClick={() => setDrain({ suction: !cfg.suction })} />
          <Tg on={cfg.kink} label="Kink" onClick={() => setDrain({ kink: !cfg.kink })} />
          <Tg on={cfg.clamped} label="Clamp" onClick={() => setDrain({ clamped: !cfg.clamped })} />
          <Tg on={cfg.loopMl > 0} label="Dependent loop" onClick={() => setDrain({ loopMl: cfg.loopMl > 0 ? 0 : 90 })} />
          <Tg on={cfg.unitHigh} label="Unit above chest" onClick={() => setDrain({ unitHigh: !cfg.unitHigh })} />
          <Tg on={cfg.leak > 0} label={`Leak ${['none', 'with breaths', 'every breath', 'continuous'][cfg.leak]}`} onClick={() => setDrain({ leak: ((cfg.leak + 1) % 4) as LeakGrade })} />
        </div>
        {(v.bubbling !== 'none') && <div className="wf-foot"><button className="linkish" onClick={() => clampTestFor('chest')}>Brief clamp at the chest</button><button className="linkish" onClick={() => clampTestFor('unit')}>Brief clamp at the unit</button></div>}
        {test && <p className="explain">{test}</p>}
        {quiz && <button className="linkish" onClick={() => set({ caseId: DRAIN_CASES[0].id, answer: null, test: null })}>Drain assessment cases →</button>}
      </>)}
      <ul className="dr-find">{v.findings.map((f) => <li key={f} className={/tension|surgery|siphon|kink|Clot|Clamp|side hole/i.test(f) ? 'bad' : ''}>{f}</li>)}</ul>
    </section>
  );
}
