/**
 * Three-chamber chest-drain unit drawn from `drainView` — the water-seal column moves with the vent
 * session's REAL pleural pressure (positive pressure: falls in inspiration). Live controls let the learner
 * kink / clamp / loop the tubing, add suction or a leak; an occluded drain on a leaking lung is fed back to
 * the vent session so tension re-accumulates in the mechanics. A case quiz reads the same model.
 */
import { useEffect, useRef, useState } from 'react';
import { session } from '../vent/session';
import { drainView, clampTest, DRAIN_CASES, caseConfig, type LeakGrade } from './chestDrain';
import { useDrain, setDrain } from './drainStore';

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
  const W = 520, H = 230;
  // chambers (x, width): collection | water seal | suction control
  const col = { x: 250, w: 130 }, ws = { x: 390, w: 56 }, sc = { x: 456, w: 52 }, top = 40, bot = 206;
  const fillH = Math.min(1, v.total / 2500) * (bot - top - 8);
  const fluidC = cfg.fluid === 'blood' ? '#a3242b' : '#d9c27a';
  const sealBase = 150, level = Math.max(-24, Math.min(24, v.level * 9)); // 9 px per cm (the arm is magnified)
  const bubbles = (on: boolean, x0: number, w: number, y0: number, y1: number, n: number, speed: number) => on ? Array.from({ length: n }, (_, i) => { const y = y0 - (((pl.t * speed + i * ((y0 - y1) / n)) % (y0 - y1))); return <circle key={i} cx={x0 + w * (0.3 + 0.4 * ((i * 37) % 10) / 10)} cy={y} r={2 + (i % 3)} className="dr-bub" />; }) : null;
  // tubing path from the chest to the collection chamber
  const tube = cfg.loopMl > 0 ? 'M70,70 C110,70 120,215 170,215 C215,215 220,40 262,40' : cfg.kink ? 'M70,70 C120,70 130,90 150,60 L158,82 L166,56 C190,40 230,40 262,40' : 'M70,70 C140,70 200,40 262,40';
  const clampTestFor = (at: 'chest' | 'unit') => set({ test: clampTest(cfg, at).meaning });
  return (
    <section className="card drain">
      <div className="card-h"><h3>Chest drain · three-chamber unit</h3><span className="muted small">{cfg.ppv ? 'ventilated — live pleural pressure' : 'spontaneous breathing (teaching trace)'}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="dr-svg" role="img" aria-label={`Drain: swing ${v.swing} cm, bubbling ${v.bubbling}, drainage ${v.rate} mL per hour`}>
        {/* patient chest */}
        <path d="M14,24 Q60,6 70,40 L70,120 Q40,140 14,130 Z" className="dr-chest" /><text x={20} y={150} className="dr-lab">chest</text>
        {cfg.sideHoleOut && <g className="dr-subq">{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={48 + (i % 3) * 7} cy={58 + i * 5} r={3} />)}</g>}
        <path d={tube} className="dr-tube" />
        {cfg.loopMl > 0 && <path d="M150,205 C160,215 180,215 190,205" className="dr-loopfluid" style={{ stroke: fluidC }} />}
        {cfg.clamped && <g transform="translate(96,70)"><rect x={-7} y={-10} width={14} height={20} rx={3} className="dr-clamp" /><text x={0} y={-14} className="dr-lab c">clamp</text></g>}
        {cfg.kink && <text x={158} y={100} className="dr-lab c bad">kink</text>}
        {/* unit */}
        <g transform={cfg.unitHigh ? 'translate(0,-22)' : undefined}>
          <rect x={col.x} y={top} width={col.w} height={bot - top} rx={6} className="dr-box" />
          <rect x={col.x + 3} y={bot - 3 - fillH} width={col.w - 6} height={fillH} className="dr-fluid" style={{ fill: fluidC }} />
          {[500, 1000, 1500, 2000].map((ml) => { const y = bot - 4 - (ml / 2500) * (bot - top - 8); return <g key={ml}><line x1={col.x} x2={col.x + 10} y1={y} y2={y} className="dr-grad" /><text x={col.x + 13} y={y + 3} className="dr-lab">{ml}</text></g>; })}
          <text x={col.x + col.w / 2} y={top - 8} className="dr-lab c">collection</text>
          {/* water seal: U-tube, narrow arm shows the column */}
          <rect x={ws.x} y={top} width={ws.w} height={bot - top} rx={6} className="dr-box" />
          <rect x={ws.x + 3} y={sealBase} width={ws.w - 6} height={bot - 3 - sealBase} className="dr-water" />
          <rect x={ws.x + ws.w - 16} y={sealBase - 8 - level} width={9} height={bot - 3 - (sealBase - 8 - level)} className="dr-water arm" />
          {bubbles(v.bubblingNow, ws.x + 3, ws.w - 22, bot - 8, sealBase + 2, v.bubbling === 'continuous' ? 7 : 4, 55)}
          <text x={ws.x + ws.w / 2} y={top - 8} className="dr-lab c">water seal</text>
          {/* suction control */}
          <rect x={sc.x} y={top} width={sc.w} height={bot - top} rx={6} className="dr-box" />
          {cfg.suction && <rect x={sc.x + 3} y={bot - 3 - cfg.suctionSet * 4.5} width={sc.w - 6} height={cfg.suctionSet * 4.5} className="dr-water" />}
          {bubbles(v.suctionChamber !== 'still', sc.x + 3, sc.w - 6, bot - 8, bot - cfg.suctionSet * 4.5, v.suctionChamber === 'vigorous' ? 12 : 4, v.suctionChamber === 'vigorous' ? 140 : 40)}
          <text x={sc.x + sc.w / 2} y={top - 8} className="dr-lab c">{cfg.suction ? `suction −${cfg.suctionSet}` : 'no suction'}</text>
        </g>
        {cfg.unitHigh && <text x={col.x + col.w / 2} y={H - 4} className="dr-lab c bad">unit above the chest</text>}
      </svg>
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
