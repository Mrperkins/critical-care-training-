import { useState } from 'react';
import { Picker } from '../scene/pane';
import { useEffect, useMemo, useRef } from 'react';
import { lab, type Knob as KnobKey } from './lab';
import { useUI } from '../app/store';
import { useAbgUI, type Station } from './abgStore';
import { ABG_PRESETS } from '../scenarios/abg';
import { Knob, Seg } from '../vent/VentPanel';
import { interpret } from '../physiology/interpret';
import type { DrugId } from '../physiology/patient';

const bump = () => useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
const flag = (v: number, lo: number, hi: number) => (v < lo ? 'lo' : v > hi ? 'hi' : '');

export function AbgPresets() {
  useUI((s) => s.pulse);
  const G: [string, string[]][] = [['Breathing', ['normal', 'opioid', 'asthma', 'copd', 'edema']], ['Metabolic', ['dka', 'sepsis', 'salicylate']], ['Arrest', ['arrest', 'rosc']], ['Pregnancy', ['pregnant', 'pregAsthma']]];
  const placed = new Set(G.flatMap(([, ids]) => ids)); const extra = ABG_PRESETS.filter((p) => !placed.has(p.id)).map((p) => p.id);
  const it = (id: string) => { const p = ABG_PRESETS.find((x) => x.id === id)!; return { id, name: p.name, hint: p.story }; };
  return <Picker label="Patient" value={lab.preset.id} onPick={(id) => { lab.load(id); bump(); }} sub={lab.preset.story}
    groups={[...G.map(([label, ids]) => ({ label, items: ids.filter((i) => ABG_PRESETS.some((p) => p.id === i)).map(it) })), ...(extra.length ? [{ label: 'More', items: extra.map(it) }] : [])]} />;
}
export function AbgStory() {
  useUI((s) => s.pulse);
  return <section className="card story"><div className="eyebrow">{lab.preset.name}</div><p>{lab.preset.story}</p><ul className="look">{lab.preset.teach.map((t) => <li key={t}>{t}</li>)}</ul></section>;
}

export function SampleCards() {
  useUI((s) => s.pulse); const [vbg, setVbg] = useState(false); const [o2, setO2] = useState(false);
  const g = lab.snap; const v = g.vbg; const fio2 = lab.pt.p.fio2;
  return (
    <section className={`card samples${vbg ? '' : ' one'}`}>
      <div className="sample art">
        <div className="s-h"><span className="s-dot art" />ABG · arterial <small>radial artery</small></div>
        <div className="s-grid">
          <span>pH</span><b className={flag(g.pH, 7.35, 7.45)}>{g.pH.toFixed(2)}</b>
          <span>PaCO₂</span><b className={flag(g.paco2, 35, 45)}>{g.paco2.toFixed(0)}</b>
          <span>PaO₂</span><b className={flag(g.pao2, 80, 9999)}>{g.pao2.toFixed(0)}</b>
          <span>HCO₃⁻</span><b className={flag(g.hco3, 22, 26)}>{g.hco3.toFixed(1)}</b>
          <span>BE</span><b className={flag(g.sbe, -2, 2)}>{g.sbe.toFixed(1)}</b>
          <span>SaO₂</span><b className={flag(g.sao2 * 100, 94, 101)}>{(g.sao2 * 100).toFixed(0)}%</b>
          <span>Lactate</span><b className={flag(g.lactate, 0, 2)}>{g.lactate.toFixed(1)}</b>
          <span>FiO₂</span><b>{fio2.toFixed(2)}</b>
        </div>
      </div>
      {vbg && <div className="sample ven">
        <div className="s-h"><span className="s-dot ven" />VBG · venous <small>antecubital vein</small></div>
        <div className="s-grid">
          <span>pH</span><b>{v.pH.toFixed(2)}</b>
          <span>PvCO₂</span><b>{v.pco2.toFixed(0)}</b>
          <span>PvO₂</span><b className="venous">{v.po2.toFixed(0)}</b>
          <span>HCO₃⁻</span><b>{v.hco3.toFixed(1)}</b>
          <span>SvO₂</span><b className="venous">{(v.so2 * 100).toFixed(0)}%</b>
          <span>Lactate</span><b>{v.lactate.toFixed(1)}</b>
        </div>
        <p className="s-note warn">Venous PO₂ is what the tissues left behind — <b>not</b> oxygenation. Use a VBG for pH, CO₂ trend, HCO₃⁻ and lactate.</p>
      </div>}
      {o2 && <div className="o2-row"><span>SpO₂ <b>{Math.round(g.spo2 * 100)}%</b></span><span>Hb <b>{lab.pt.p.hb.toFixed(1)}</b></span><span>CaO₂ <b>{g.cao2.toFixed(1)}</b></span><span>DO₂ <b>{g.do2.toFixed(0)}</b> mL/min</span><span>VO₂ <b>{g.vo2.toFixed(0)}</b></span><span>SvO₂ (mixed) <b>{Math.round(g.svo2 * 100)}%</b></span><span>A–a <b>{g.aaGrad.toFixed(0)}</b></span><span>EtCO₂ <b>{g.etco2.toFixed(0)}</b></span></div>}
      <div className="s-more"><button type="button" className={`chip${vbg ? ' on' : ''}`} aria-pressed={vbg} onClick={() => setVbg(!vbg)}>Compare with VBG</button><button type="button" className={`chip${o2 ? ' on' : ''}`} aria-pressed={o2} onClick={() => setO2(!o2)}>O₂ delivery</button></div>
    </section>
  );
}

export function AbgControls() {
  useUI((s) => s.pulse);
  const p = lab.pt.p; const set = (k: KnobKey, v: number) => { lab.set(k, v); bump(); };
  return (
    <section className="card">
      <div className="card-h"><h3>Change the causes</h3><Seg value={lab.control} options={[['own', 'Own breathing'], ['set', 'You set RR & Vt']]} onChange={(v) => { lab.setControl(v); bump(); }} small /></div>
      <div className="knobs">
        {lab.control === 'set' ? <>
          <Knob label="RR" value={lab.rr} min={2} max={40} step={1} unit="/min" onChange={(v) => { lab.setVent(v, lab.vt); bump(); }} />
          <Knob label="Vt" value={lab.vt * 1000} min={150} max={900} step={10} unit="mL" onChange={(v) => { lab.setVent(lab.rr, v / 1000); bump(); }} />
        </> : <Knob label="Respiratory drive" value={p.drive} min={0.1} max={3} step={0.05} fmt={(v) => `${v.toFixed(2)}×`} onChange={(v) => set('drive', v)} hint="opioids ↓ · anxiety, sepsis, salicylate ↑" />}
        <Knob label="FiO₂" value={p.fio2} min={0.21} max={1} step={0.01} fmt={(v) => v.toFixed(2)} onChange={(v) => set('fio2', v)} />
        <Knob label="HCO₃⁻ (metabolic)" value={24.4 + lab.metab} min={4} max={48} step={1} unit="mEq/L" onChange={(v) => { lab.setMetab(v - 24.4); bump(); }} hint="adds acid (unmeasured anion) or base (Cl⁻ loss)" />
        <Knob label="V̇CO₂" value={p.vco2} min={120} max={450} step={10} unit="mL/min" onChange={(v) => set('vco2', v)} hint="fever, sepsis, exercise, feeding" />
        <Knob label="V̇O₂ demand" value={p.vo2} min={150} max={600} step={10} unit="mL/min" onChange={(v) => set('vo2', v)} />
        <Knob label="Hb" value={p.hb} min={4} max={20} step={0.5} unit="g/dL" onChange={(v) => set('hb', v)} />
        <Knob label="V/Q mismatch" value={p.lowVQ * 100} min={0} max={50} step={1} unit="% of flow" onChange={(v) => set('lowVQ', v / 100)} />
        <Knob label="Shunt" value={p.shunt * 100} min={0} max={60} step={1} unit="% of flow" onChange={(v) => set('shunt', v / 100)} />
        <Knob label="Dead space" value={p.vdAlv * 100} min={0} max={60} step={1} unit="% of Vt" onChange={(v) => set('vdAlv', v / 100)} />
        <Knob label="Cardiac output" value={p.co} min={1} max={10} step={0.1} unit="L/min" onChange={(v) => set('co', v)} />
      </div>
    </section>
  );
}

const DRUGS: [DrugId, string][] = [['naloxone', 'Naloxone'], ['insulin', 'Insulin + dextrose'], ['bicarb', 'NaHCO₃ 50 mEq'], ['fluids', 'Fluid 1 L'], ['transfusion', 'PRBC 1 unit']];
export function AbgTime() {
  useUI((s) => s.pulse);
  const t = lab.pt.t; const h = Math.floor(t / 60), m = Math.floor(t % 60);
  return (
    <section className="card">
      <div className="card-h"><h3>Time</h3><span className="clock">{h > 0 ? `${h} h ` : ''}{m} min</span></div>
      <div className="actions">
        <button className="act" onClick={() => { lab.fastForward(10); bump(); }}>+10 min</button>
        <button className="act" onClick={() => { lab.fastForward(60); bump(); }}>+1 h</button>
        <button className="act primary" onClick={() => { lab.fastForward(48 * 60); useAbgUI.getState().set({ station: 'kidney' }); bump(); }}>+48 h — the kidneys respond</button>
      </div>
      <div className="actions" style={{ marginTop: 8 }}>{DRUGS.map(([id, l]) => <button key={id} className="act" onClick={() => { lab.give(id); bump(); }}>{l}</button>)}</div>
      <p className="muted small">The body runs at ×{lab.physioSpeed} while you watch: CO₂ stores take minutes to fill or empty; kidneys take days.</p>
    </section>
  );
}

export function AbgInterpret() {
  useUI((s) => s.pulse);
  const g = lab.snap;
  const it = useMemo(() => interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, pao2: g.pao2, fio2: lab.pt.p.fio2, na: g.na, cl: g.cl, albumin: g.albumin, age: lab.pt.p.age, lactate: g.lactate }), [g]);
  return (
    <section className="card">
      <div className="card-h"><h3>Read it step by step</h3></div>
      <p className="interp">{it.summary}.</p>
      <ol className="steps">{it.steps.map((s) => <li key={s.key} className={`f-${s.tone}`}><b>{s.title}</b><span>{s.text}</span></li>)}</ol>
    </section>
  );
}

/** PaCO₂ × HCO₃⁻ map with pH isopleths and the expected-compensation bands; the patient's path over time is drawn on it. */
export function AcidBaseMap() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!; let raf = 0; let w = 0, h = 0;
    const ro = new ResizeObserver(() => { const r = c.getBoundingClientRect(); const d = Math.min(2, devicePixelRatio || 1); w = r.width; h = r.height; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); }); ro.observe(c);
    const draw = () => {
      raf = requestAnimationFrame(draw); if (!w) return; ctx.clearRect(0, 0, w, h);
      const pad = { l: 34, r: 10, t: 10, b: 26 }; const X = (pc: number) => pad.l + (w - pad.l - pad.r) * (pc - 10) / 90; const Y = (hc: number) => h - pad.b - (h - pad.t - pad.b) * (hc - 4) / 46;
      ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.fillStyle = '#8e8a84'; ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      for (let pc = 20; pc <= 100; pc += 20) { ctx.beginPath(); ctx.moveTo(X(pc), pad.t); ctx.lineTo(X(pc), h - pad.b); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(String(pc), X(pc), h - 10); }
      for (let hc = 10; hc <= 50; hc += 10) { ctx.beginPath(); ctx.moveTo(pad.l, Y(hc)); ctx.lineTo(w - pad.r, Y(hc)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(hc), pad.l - 5, Y(hc) + 3); }
      ctx.save(); ctx.translate(10, (h - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('HCO₃⁻', 0, 0); ctx.restore(); ctx.textAlign = 'right'; ctx.fillText('PaCO₂ →', w - pad.r, h - 10);
      // pH isopleths
      for (const pH of [7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6]) {
        ctx.strokeStyle = pH === 7.4 ? 'rgba(211,178,122,0.5)' : 'rgba(255,255,255,0.1)'; ctx.beginPath();
        for (let pc = 10; pc <= 100; pc += 2) { const hc = 0.0307 * pc * 10 ** (pH - 6.1); const x = X(pc), y = Y(Math.min(52, hc)); if (pc === 10) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
        const pcL = Math.min(100, 50 / (0.0307 * 10 ** (pH - 6.1))); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.textAlign = 'left'; ctx.fillText(pH.toFixed(1), Math.min(X(pcL) + 2, w - 26), Math.max(Y(Math.min(50, 0.0307 * pcL * 10 ** (pH - 6.1))) + 10, 18));
      }
      // compensation bands
      const band = (fn: (x: number) => [number, number], from: number, to: number, col: string, label: string, byX = true) => {
        ctx.fillStyle = col; ctx.beginPath(); const up: [number, number][] = [], dn: [number, number][] = [];
        for (let v = from; v <= to; v += 1) { const [a, b] = fn(v); if (byX) { up.push([X(v), Y(b)]); dn.push([X(v), Y(a)]); } else { up.push([X(b), Y(v)]); dn.push([X(a), Y(v)]); } }
        [...up, ...dn.reverse()].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill();
        const m = up[Math.floor(up.length * 0.8)]; ctx.fillStyle = 'rgba(235,231,225,0.55)'; ctx.textAlign = 'center'; ctx.fillText(label, m[0], m[1] - 4);
      };
      band((pc) => [24 + 0.1 * (pc - 40) - 1.5, 24 + 0.1 * (pc - 40) + 1.5], 45, 95, 'rgba(224,100,90,0.13)', 'acute resp acid.');
      band((pc) => [24 + 0.35 * (pc - 40) - 2, 24 + 0.4 * (pc - 40) + 2], 45, 85, 'rgba(224,100,90,0.22)', 'chronic');
      band((pc) => [24 - 0.2 * (40 - pc) - 1.5, 24 - 0.2 * (40 - pc) + 1.5], 14, 35, 'rgba(124,196,212,0.14)', 'acute resp alk.');
      band((pc) => [24 - 0.5 * (40 - pc) - 2, 24 - 0.4 * (40 - pc) + 2], 16, 35, 'rgba(124,196,212,0.24)', 'chronic');
      band((hc) => [1.5 * hc + 6, 1.5 * hc + 10], 5, 21, 'rgba(233,185,73,0.18)', 'met. acidosis', false);
      band((hc) => [0.7 * hc + 19, 0.7 * hc + 23], 27, 46, 'rgba(159,178,255,0.18)', 'met. alkalosis', false);
      // normal box
      ctx.strokeStyle = 'rgba(111,207,151,0.7)'; ctx.strokeRect(X(35), Y(26), X(45) - X(35), Y(22) - Y(26));
      // trail
      const tr = lab.trail; ctx.strokeStyle = 'rgba(235,231,225,0.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); tr.forEach((p, i) => { const x = X(Math.min(100, Math.max(10, p.paco2))), y = Y(Math.min(50, Math.max(4, p.hco3))); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
      const g = lab.snap; const x = X(Math.min(100, Math.max(10, g.paco2))), y = Y(Math.min(50, Math.max(4, g.hco3)));
      ctx.fillStyle = '#ebe7e1'; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#0a0a0c'; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = '#ebe7e1'; ctx.textAlign = x > w - 90 ? 'right' : 'left'; ctx.fillText(`pH ${g.pH.toFixed(2)}`, x + (x > w - 90 ? -9 : 9), y - 8);
    };
    raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <section className="card"><div className="card-h"><h3>Acid–base map</h3><span className="muted small">the dot is your patient; the line is where they have been</span></div><canvas ref={ref} className="abmap" aria-label="Acid-base map" /></section>;
}

const STATION_TEXT: Record<Station, () => string> = {
  lung: () => { const g = lab.snap; return `Minute ventilation ${g.ve.toFixed(1)} L/min, of which ${g.va.toFixed(1)} reaches perfused alveoli (dead space ${Math.round(g.vdvt * 100)} % of each breath). PaCO₂ = 0.863 × V̇CO₂ / V̇A = 0.863 × ${lab.pt.p.vco2.toFixed(0)} / ${g.va.toFixed(1)} ≈ ${(0.863 * lab.pt.p.vco2 / Math.max(0.1, g.va)).toFixed(0)} mmHg at steady state.`; },
  alveolus: () => { const g = lab.snap; const p = lab.pt.p; return `Alveolar gas: PAO₂ = ${p.fio2.toFixed(2)} × 713 − ${g.paco2.toFixed(0)}/0.8 = ${g.pAO2.toFixed(0)} mmHg. Blood arrives at SvO₂ ${Math.round(g.svo2 * 100)} % and leaves healthy alveoli at ${Math.round(g.ccNormal * 100)} %. Dark, collapsed alveoli = shunt (${Math.round(p.shunt * 100)} % of flow) — their blood stays venous. Grey capillaries = dead space: ventilated, not perfused.`; },
  capillary: () => { const g = lab.snap; return `One pulmonary capillary, to scale: the lumen (~7 µm) is narrower than a red cell (7.8 µm), so cells fold and squeeze through single-file in about 0.75 s. They arrive at ${Math.round(g.svo2 * 100)} % saturation and are normally fully loaded within the first third of the transit — reserve time that exercise, fibrosis or oedema can use up.`; },
  tissue: () => { const g = lab.snap; return `Delivery DO₂ = CaO₂ × CO = ${g.cao2.toFixed(1)} × ${g.co.toFixed(1)} × 10 = ${g.do2.toFixed(0)} mL/min; consumption ${g.vo2.toFixed(0)} of ${g.demandVO2.toFixed(0)} needed${g.o2debt > 5 ? ' — the shortfall is made up anaerobically: lactate (magenta)' : ''}. CO₂ from the mitochondria enters the RBC: CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻ (carbonic anhydrase); Hb buffers the H⁺, HCO₃⁻ leaves in exchange for Cl⁻.`; },
  kidney: () => { const k = lab.kidney(); return `Kidneys compensate for a respiratory problem over 2–5 days by reclaiming and generating HCO₃⁻ (or excreting it). Expected for PaCO₂ ${lab.pt.paco2.toFixed(0)}: ${k.target >= 0 ? '+' : ''}${k.target.toFixed(1)} mEq/L; achieved so far: ${k.done >= 0 ? '+' : ''}${k.done.toFixed(1)}.`; },
};
export function StationCard() {
  useUI((s) => s.pulse); const st = useAbgUI((s) => s.station);
  return <section className="card station-card"><div className="eyebrow">{({ lung: 'Lungs', alveolus: 'Alveolus & pulmonary capillary', capillary: 'Pulmonary capillary (close-up)', tissue: 'Muscle capillary bed', kidney: 'Kidney' } as const)[st]}</div><p>{STATION_TEXT[st]()}</p></section>;
}
