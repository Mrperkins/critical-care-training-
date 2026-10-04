/**
 * Overlay for the blood / clot scenes: labels switch, a collapsible readout panel (oxygen
 * delivery or the bleeding timer), a legend with the real counts, and the cause → effect stepper
 * that drives what the 3D scene highlights.
 */
import { useEffect, useRef } from 'react';
import { useUI } from '../../app/store';
import { useLabUI } from '../labStore';
import { GaugeHead } from '../cell/CellHud';
import { blood } from './BloodScene';
import { NORMAL_SEAL, type BloodModel, type BloodFocus } from './model';

const f0 = (x: number) => x.toFixed(0), f1 = (x: number) => x.toFixed(1);

export function BloodHud() {
  useUI((s) => s.pulse); const ui = useLabUI(); const m = blood.model;
  const sig = m ? m.labId + '|' + m.chain.map((c) => c.focus + (c.tone ?? '')).join(',') : '';
  const last = useRef(''); useEffect(() => { if (sig !== last.current) { last.current = sig; useLabUI.getState().set({ step: 0 }); } }, [sig]);
  useEffect(() => {
    if (!ui.autoplay) return; const id = setInterval(() => { const s = useLabUI.getState(); if (s.autoplay && blood.model) s.set({ step: (s.step + 1) % Math.max(1, blood.model.chain.length) }); }, 5200);
    return () => clearInterval(id);
  }, [ui.autoplay]);
  if (!m) return null;
  const n = m.chain.length; const step = ((ui.step % n) + n) % n; const cur = m.chain[step];
  return (
    <div className="cellhud">
      {m.kind === 'clot' ? <ClotPanel m={m} focus={cur?.focus} /> : <O2Panel m={m} focus={cur?.focus} />}
      <div className="ch-bottom">
        <Legend m={m} />
        {cur && <div className={`ch-step tone-${cur.tone ?? 'none'}`}>
          <button className="ch-arrow" aria-label="Previous step" onClick={() => ui.set({ step: step - 1 + n, autoplay: false })}>‹</button>
          <div className="ch-text"><span className="ch-n">{step + 1}/{n}</span>{cur.text}</div>
          <button className="ch-arrow" aria-label="Next step" onClick={() => ui.set({ step: step + 1, autoplay: false })}>›</button>
          <button className="ch-play" aria-label={ui.autoplay ? 'Pause' : 'Play'} onClick={() => ui.set({ autoplay: !ui.autoplay })}>{ui.autoplay ? '❚❚' : '▶'}</button>
        </div>}
      </div>
    </div>
  );
}

function Bar({ label, frac, text, color, hot, bad }: { label: string; frac: number; text: string; color: string; hot?: boolean; bad?: boolean }) {
  return <div className={`cg-bar${hot ? ' hot' : ''}`}><span>{label}</span><div><i style={{ width: `${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%`, background: color }} /></div><b className={bad ? 'bad' : ''}>{text}</b></div>;
}

function O2Panel({ m, focus }: { m: BloodModel; focus?: BloodFocus }) {
  const open = useLabUI((s) => s.gaugeOpen);
  const wbcLab = m.labId === 'wbc';
  if (wbcLab) return (
    <div className={`ch-gauge${focus === 'wbc' ? ' hot' : ''}${open ? '' : ' closed'}`}>
      <GaugeHead title="White cells" short="WBC" value={`${f1(m.wbc)} ×10⁹/L`} bad={m.wbc < 4 || m.wbc > 11} />
      <Bar label="WBC (normal 4–11)" frac={m.wbc / 30} text={f1(m.wbc)} color="#c9b8ea" hot={focus === 'wbc'} bad={m.wbc < 4 || m.wbc > 11} />
      <div className="cg-row"><span>white cells on screen</span><b>{m.nWbc}</b><span>normal</span><b>≈ 3</b></div>
      <div className="cg-row"><span>red cells per white cell</span><b>≈ {f0(m.hb * 3 * 110 / Math.max(0.1, m.wbc))}</b></div>
    </div>
  );
  const sat = m.sao2 * 100, sv = m.svo2 * 100;
  return (
    <div className={`ch-gauge${focus === 'o2' || focus === 'rbc' || focus === 'tissue' ? ' hot' : ''}${open ? '' : ' closed'}`}>
      <GaugeHead title="Oxygen delivery" short="O₂" value={`CaO₂ ${f1(m.cao2)}`} bad={m.cao2 < 15} />
      <Bar label={`Hb ${f1(m.hb)} g/dL`} frac={m.hb / 22} text={`Hct ${f0(m.hct)} %`} color="#d8141a" hot={focus === 'rbc'} bad={m.hb < 12 || m.hb > 17} />
      <Bar label="SaO₂ (arterial)" frac={sat / 100} text={`${f0(sat)} %`} color="#e0423a" hot={focus === 'o2'} bad={sat < 92} />
      <Bar label="SvO₂ (venous)" frac={sv / 100} text={`${f0(sv)} %`} color="#6a1a3a" hot={focus === 'tissue'} bad={sv < 60} />
      <div className="cg-row"><span>O₂ content</span><b className={m.cao2 < 15 ? 'bad' : ''}>{f1(m.cao2)} mL/dL</b><span>cardiac output</span><b>{f1(m.co)} L/min</b></div>
      <div className="cg-row"><span>O₂ delivery</span><b className={m.do2 < 600 ? 'bad' : ''}>{f0(m.do2)} mL/min</b><span>normal</span><b>≈ 1000</b></div>
    </div>
  );
}

function ClotPanel({ m, focus }: { m: BloodModel; focus?: BloodFocus }) {
  const open = useLabUI((s) => s.gaugeOpen);
  const sealed = blood.sealedAt != null; const t = blood.t;
  const status = sealed ? `Sealed at ${f1(blood.sealedAt!)} s` : isFinite(m.seal) ? `Bleeding… ${f1(t)} s` : `Still bleeding… ${f0(t)} s`;
  const slow = !isFinite(m.seal) || m.seal > NORMAL_SEAL * 1.5;
  return (
    <div className={`ch-gauge${focus === 'bleed' ? ' hot' : ''}${open ? '' : ' closed'}`}>
      <GaugeHead title="Bleeding time" short="Bleed" value={status} bad={!sealed && slow} />
      <div className="cg-row"><span>stops after</span><b className={slow ? 'bad' : ''}>{isFinite(m.seal) ? `${f1(m.seal)} s` : 'never'}</b><span>normal</span><b>≈ {NORMAL_SEAL} s</b></div>
      <Bar label="Blood escaping" frac={blood.bleeding} text={`${f0(blood.bleeding * 100)} %`} color="#b3121b" hot={focus === 'bleed' || focus === 'injury'} />
      <Bar label={`Platelet plug · Plt ${f0(m.plt)}`} frac={blood.plugFill / 1.4} text={`${f0(blood.plugFill / 1.4 * 100)} %`} color="#dcb45e" hot={focus === 'plug' || focus === 'plt'} bad={m.plt < 150} />
      <Bar label={`Fibrin mesh · Fib ${f0(m.fib)}`} frac={blood.fibrinFill / 1.6} text={`${f0(blood.fibrinFill / 1.6 * 100)} %`} color="#f7efd8" hot={focus === 'fibrin'} bad={m.fib < 150} />
      <div className="cg-row"><span>INR</span><b className={m.inr > 1.3 ? 'bad' : ''}>{f1(m.inr)}</b><span>aPTT</span><b className={m.ptt > 40 ? 'bad' : ''}>{f0(m.ptt)} s</b></div>
    </div>
  );
}

const CHIPS: { k: BloodFocus; name: string; color: string; val: (m: BloodModel) => string; show: (m: BloodModel) => boolean }[] = [
  { k: 'rbc', name: 'Red cells', color: '#d8141a', val: (m) => `Hb ${f1(m.hb)} · ${m.nRbc} drawn`, show: () => true },
  { k: 'wbc', name: 'White cells', color: '#c9b8ea', val: (m) => `${f1(m.wbc)} ×10⁹/L`, show: () => true },
  { k: 'plt', name: 'Platelets', color: '#eadcaa', val: (m) => `${f0(m.plt)} ×10⁹/L`, show: () => true },
  { k: 'o2', name: 'O₂', color: '#bfeaff', val: (m) => `${f0(m.sao2 * 100)} → ${f0(m.svo2 * 100)} %`, show: (m) => m.kind === 'blood' },
  { k: 'fibrin', name: 'Fibrin', color: '#f7efd8', val: (m) => `Fib ${f0(m.fib)}`, show: (m) => m.kind === 'clot' },
];
function Legend({ m }: { m: BloodModel }) {
  return (
    <div className="ch-legend">
      {CHIPS.filter((c) => c.show(m)).map((c) => {
        const idx = m.chain.findIndex((s) => s.focus === c.k || (c.k === 'plt' && s.focus === 'plug'));
        return <button key={c.k} className="lg-chip" disabled={idx < 0} onClick={() => useLabUI.getState().set({ step: idx, autoplay: false })}><i className="gl" style={{ background: c.color }} /><b>{c.name}</b><span>{c.val(m)}</span></button>;
      })}
    </div>
  );
}

export function BloodStory() {
  useUI((s) => s.pulse); const ui = useLabUI(); const m = blood.model; if (!m) return null;
  const n = m.chain.length; const step = ((ui.step % n) + n) % n;
  return (
    <section className="card cellstory">
      <div className="card-h"><h3>{m.kind === 'clot' ? 'What happens at a cut' : 'What’s happening in the blood'}</h3><span className="muted small">{m.headline}</span></div>
      <ol className="story">{m.chain.map((c, i) => <li key={i} className={`${i === step ? 'on' : ''} tone-${c.tone ?? 'none'}`}><button onClick={() => ui.set({ step: i, autoplay: false })}>{c.text}</button></li>)}</ol>
      <p className="muted small">Cell numbers follow the lab value (white cells and platelets are over-represented so a few are always visible); the readout shows the real numbers. {m.kind === 'clot' ? 'The bleed replays on a loop.' : 'Red cells darken along the vessel as they hand O₂ to the tissue.'}</p>
    </section>
  );
}
