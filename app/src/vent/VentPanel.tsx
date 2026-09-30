import { useMemo } from 'react';
import { session } from './session';
import { ventNumbers } from './numbers';
import { useUI } from '../app/store';
import { VENT_SCENARIOS, VENT_SCENARIO } from '../scenarios/vent';
import { explainVent } from '../knowledge/ventExplain';
import type { Mode as VMode, VentSettings } from '../physiology/mechanics';
import { interpret } from '../physiology/interpret';

/* ------------------------------------------------------------------ small controls */
export function Knob({ label, value, min, max, step, unit, fmt, onChange, hint }: { label: string; value: number; min: number; max: number; step: number; unit?: string; fmt?: (v: number) => string; onChange: (v: number) => void; hint?: string }) {
  const f = fmt ?? ((v: number) => (step < 1 ? v.toFixed(step < 0.1 ? 2 : 1) : String(Math.round(v))));
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  return (
    <div className="knob" title={hint}>
      <div className="knob-top"><span className="knob-l">{label}</span><span className="knob-v">{f(value)}<small>{unit}</small></span></div>
      <div className="knob-row">
        <button aria-label={`decrease ${label}`} onClick={() => onChange(clamp(value - step))}>−</button>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(clamp(+e.target.value))} aria-label={label} />
        <button aria-label={`increase ${label}`} onClick={() => onChange(clamp(value + step))}>+</button>
      </div>
    </div>
  );
}
export function Seg<T extends string>({ value, options, onChange, small }: { value: T; options: [T, string][]; onChange: (v: T) => void; small?: boolean }) {
  return <div className={`seg${small ? ' small' : ''}`}>{options.map(([k, l]) => <button key={k} className={value === k ? 'on' : ''} onClick={() => onChange(k)}>{l}</button>)}</div>;
}

const MODES: [VMode, string][] = [['VC', 'VC'], ['PC', 'PC'], ['PRVC', 'PRVC'], ['PSV', 'PSV'], ['SIMV', 'SIMV'], ['CPAP', 'CPAP'], ['APRV', 'APRV']];
export const MODE_INFO: Record<VMode, string> = {
  VC: 'Volume control (A/C): you set Vt and flow; pressure is the result — it rises when the lung stiffens or the airway narrows.',
  PC: 'Pressure control (A/C): you set the pressure and Ti; tidal volume is the result — it falls when the lung stiffens or the airway narrows.',
  PRVC: 'Pressure-regulated volume control: pressure-shaped breaths whose pressure the vent adjusts breath-by-breath to hit a target Vt.',
  PSV: 'Pressure support: every breath is patient-triggered and patient-cycled (when flow falls to the cycle %). No backup rate beyond apnoea.',
  SIMV: 'SIMV: a set number of volume breaths synchronised to effort; extra breaths get pressure support only.',
  CPAP: 'CPAP: a constant pressure; the patient does all the breathing.',
  APRV: 'APRV: long high-pressure phase with brief releases; recruits and allows spontaneous breathing at P-high.',
};

function set(p: Partial<VentSettings>) { session.set(p); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); }

export function VentControls() {
  useUI((s) => s.pulse);
  const s = session.m.s; const m = s.mode;
  const volume = m === 'VC' || m === 'SIMV' || m === 'PRVC';
  return (
    <section className="card">
      <div className="card-h"><h3>Ventilator</h3><Seg value={m} options={MODES} onChange={(v) => set({ mode: v })} small /></div>
      <p className="mode-info">{MODE_INFO[m]}</p>
      <div className="knobs">
        {m !== 'APRV' && m !== 'CPAP' && m !== 'PSV' && <Knob label="RR" value={s.rr} min={4} max={40} step={1} unit="/min" onChange={(v) => set({ rr: v })} />}
        {volume && <Knob label="Vt" value={s.vt * 1000} min={200} max={900} step={10} unit="mL" onChange={(v) => set({ vt: v / 1000 })} />}
        {(m === 'VC' || m === 'SIMV') && <Knob label="Peak flow" value={s.flow} min={20} max={120} step={5} unit="L/min" onChange={(v) => set({ flow: v })} />}
        {(m === 'PC' || m === 'PRVC') && <Knob label="Ti" value={s.ti} min={0.4} max={3} step={0.1} unit="s" onChange={(v) => set({ ti: v })} />}
        {m === 'PC' && <Knob label="P insp" value={s.pinsp} min={4} max={40} step={1} unit="cmH₂O" onChange={(v) => set({ pinsp: v })} hint="above PEEP" />}
        {(m === 'PSV' || m === 'SIMV') && <Knob label="Pressure support" value={s.ps} min={0} max={25} step={1} unit="cmH₂O" onChange={(v) => set({ ps: v })} />}
        {m !== 'APRV' && <Knob label="PEEP" value={s.peep} min={0} max={24} step={1} unit="cmH₂O" onChange={(v) => set({ peep: v })} />}
        {m === 'APRV' && <>
          <Knob label="P high" value={s.phigh} min={10} max={35} step={1} unit="cmH₂O" onChange={(v) => set({ phigh: v })} />
          <Knob label="P low" value={s.plow} min={0} max={10} step={1} unit="cmH₂O" onChange={(v) => set({ plow: v })} />
          <Knob label="T high" value={s.thigh} min={2} max={8} step={0.1} unit="s" onChange={(v) => set({ thigh: v })} />
          <Knob label="T low" value={s.tlow} min={0.2} max={1.5} step={0.05} unit="s" onChange={(v) => set({ tlow: v })} />
        </>}
        <Knob label="FiO₂" value={s.fio2} min={0.21} max={1} step={0.05} fmt={(v) => v.toFixed(2)} onChange={(v) => set({ fio2: v })} />
        {(m === 'VC' || m === 'SIMV') && <div className="knob"><div className="knob-top"><span className="knob-l">Flow pattern</span></div><Seg value={s.pattern} options={[['square', 'Square'], ['decel', 'Decelerating']]} onChange={(v) => set({ pattern: v })} small /></div>}
        {(m === 'VC') && <Knob label="Insp pause" value={s.pause} min={0} max={1} step={0.1} unit="s" onChange={(v) => set({ pause: v })} hint="shows Pplat every breath" />}
        {(m === 'PC' || m === 'PRVC' || m === 'PSV' || m === 'SIMV') && <Knob label="Rise time" value={s.rise} min={0.05} max={0.6} step={0.05} unit="s" onChange={(v) => set({ rise: v })} />}
        {(m === 'PSV' || m === 'SIMV') && <Knob label="Cycle-off" value={s.cyclePct} min={5} max={80} step={5} unit="% peak" onChange={(v) => set({ cyclePct: v })} hint="expiratory trigger sensitivity" />}
        {m !== 'APRV' && <Knob label="Trigger" value={s.trigType === 'flow' ? s.trigFlow : s.trigPressure} min={0.5} max={10} step={0.5} unit={s.trigType === 'flow' ? 'L/min' : 'cmH₂O'} onChange={(v) => set(s.trigType === 'flow' ? { trigFlow: v } : { trigPressure: v })} hint="lower = more sensitive" />}
      </div>
    </section>
  );
}

export function Interventions() {
  useUI((s) => s.pulse);
  const sc = session.sc; const hasEffort = session.m.pt.pmax > 0;
  const act = (f: Parameters<typeof session.intervene>[0]) => { session.intervene(f); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); };
  return (
    <div className="actions">
      <button className="act" onClick={() => session.hold('i')}>Inspiratory hold</button>
      <button className="act" onClick={() => session.hold('e')}>Expiratory hold</button>
      {(sc.lung.rSpasm ?? 0) > 0 && <button className={`act${session.bdT >= 0 ? ' done' : ''}`} onClick={() => act('bronchodilator')}>{session.bdT >= 0 ? `Bronchodilator ${Math.round(session.bdEffect() * 100)} %` : 'Give bronchodilator'}</button>}
      {sc.fixes.includes('suction') && <button className={`act${session.suctionT >= 0 ? ' done' : ''}`} onClick={() => act('suction')}>Suction the ETT</button>}
      {sc.fixes.includes('decompress') && <button className={`act${session.decompT >= 0 ? ' done' : ''}`} onClick={() => act('decompress')}>Needle decompression</button>}
      {sc.fixes.includes('withdrawTube') && <button className={`act${session.withdrawT >= 0 ? ' done' : ''}`} onClick={() => act('withdrawTube')}>Withdraw tube 2 cm</button>}
      {sc.fixes.includes('bronchoscopy') && <button className={`act${session.bronchT >= 0 ? ' done' : ''}`} onClick={() => act('bronchoscopy')}>Bronchoscopy</button>}
      {hasEffort && <button className="act" onClick={() => act('paralyse')}>Deep sedation</button>}
    </div>
  );
}

const fx = (v: number | null | undefined, d = 0) => (v == null || !isFinite(v) ? '—' : v.toFixed(d));
export function VentNumbersCard() {
  useUI((s) => s.pulse);
  const n = ventNumbers(session);
  const res = Math.max(0, n.pip - n.pplat), el = n.dp, pe = n.peepTot; const tot = Math.max(1, res + el + pe);
  const cells: [string, string, string, string?][] = [
    ['PIP', fx(n.pip), 'cmH₂O'], [n.pplatMeasured ? 'Pplat' : 'Pplat ≈', fx(n.pplat), 'cmH₂O', n.pplatMeasured ? '' : 'est — do an insp hold'],
    ['PEEP tot', fx(n.peepTot), 'cmH₂O'], ['ΔP', fx(n.dp), 'cmH₂O'],
    ['Vte', fx(n.vte), 'mL'], ['Vt/PBW', fx(n.vtPerKg, 1), 'mL/kg'], ['RR', fx(n.rr), '/min'], ['V̇E', fx(n.mv, 1), 'L/min'],
    ['Cstat', fx(n.cstat), 'mL/cmH₂O'], ['Raw', fx(n.raw), 'cmH₂O/L/s'], ['τ', fx(n.tau, 2), 's'], ['I:E', n.ie, ''],
  ];
  return (
    <section className="card nums">
      <div className="numgrid">{cells.map(([l, v, u, t]) => <div key={l} className="num" title={t}><span className="nl">{l}</span><span className="nv">{v}</span><span className="nu">{u}</span></div>)}</div>
      <div className="eom" aria-label="Equation of motion breakdown">
        <div className="eom-bar">
          <span style={{ width: `${(pe / tot) * 100}%` }} className="b-peep" />
          <span style={{ width: `${(el / tot) * 100}%` }} className="b-el" />
          <span style={{ width: `${(res / tot) * 100}%` }} className="b-res" />
        </div>
        <div className="eom-leg"><span><i className="b-peep" />PEEP {fx(pe)}</span><span><i className="b-el" />Elastic Vt/C {fx(el)}</span><span><i className="b-res" />Resistive R·V̇ {fx(res)}</span></div>
      </div>
    </section>
  );
}

export function GasCard({ compact }: { compact?: boolean }) {
  useUI((s) => s.pulse);
  const g = session.snap; const fio2 = session.m.s.fio2;
  const it = useMemo(() => interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, pao2: g.pao2, fio2, na: g.na, cl: g.cl, albumin: g.albumin, age: session.pt.p.age }), [g, fio2]);
  return (
    <section className="card gas">
      <div className="card-h"><h3>Patient</h3><span className="muted small">physiology clock ×{session.physioSpeed}</span></div>
      <div className="monitor">
        <div><span className="ml">SpO₂</span><span className="mv c-spo2">{Math.round(g.spo2 * 100)}</span></div>
        <div><span className="ml">EtCO₂</span><span className="mv c-co2">{Math.round(g.etco2)}</span></div>
        <div><span className="ml">MAP</span><span className="mv">{Math.round(g.map)}</span></div>
        <div><span className="ml">HR</span><span className="mv">{Math.round(g.hr)}</span></div>
      </div>
      {!compact && <>
        <div className="abg-row"><span className="abg-t">ABG · arterial</span>
          <span>pH <b>{g.pH.toFixed(2)}</b></span><span>PaCO₂ <b>{g.paco2.toFixed(0)}</b></span><span>PaO₂ <b>{g.pao2.toFixed(0)}</b></span><span>HCO₃⁻ <b>{g.hco3.toFixed(0)}</b></span><span>BE <b>{g.sbe.toFixed(0)}</b></span><span>SaO₂ <b>{Math.round(g.sao2 * 100)}</b></span><span>Lac <b>{g.lactate.toFixed(1)}</b></span>
        </div>
        <div className="abg-row sub"><span className="abg-t">P/F {g.pf.toFixed(0)} · A–a {g.aaGrad.toFixed(0)} · shunt {Math.round(session.pt.p.shunt * 100)} %</span></div>
        <p className="interp">{it.summary}.</p>
        <div className="actions"><button className="act" onClick={() => { session.fastForward(30); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); }}>+30 min on these settings</button><button className="act" onClick={() => { session.fastForward(240); useUI.getState().set({ pulse: useUI.getState().pulse + 1 }); }}>+4 h</button></div>
      </>}
    </section>
  );
}

export function ExplainCard() {
  useUI((s) => s.pulse);
  const n = ventNumbers(session); const F = explainVent(n, session.m.s, session.m.recent(6), session.m.pt.pmax > 0);
  return (
    <section className="card">
      <div className="card-h"><h3>Why</h3></div>
      <ul className="findings">{F.map((f) => <li key={f.key} className={`f-${f.level}`}><b>{f.title}</b><span>{f.text}</span></li>)}</ul>
    </section>
  );
}

export function ScenarioPicker() {
  const cur = useUI((s) => s.ventScenario);
  return (
    <div className="chips" role="group" aria-label="Scenarios">
      {VENT_SCENARIOS.map((sc) => <button key={sc.id} className={`chip${cur === sc.id ? ' on' : ''}`} onClick={() => loadVentScenario(sc.id)}>{sc.name}</button>)}
    </div>
  );
}
export function loadVentScenario(id: string, dyss: Parameters<typeof session.load>[1] = null) {
  session.load(id, dyss); const sc = VENT_SCENARIO[id];
  const view = sc.lung.rSpasm || id === 'ett' || id === 'plug' || id === 'mainstem' ? 'airway' : id === 'ards' || id === 'obesity' || id === 'edema' ? 'side' : 'front';
  useUI.getState().set({ ventScenario: id, ventView: view, showPmus: session.m.pt.pmax > 0, pulse: useUI.getState().pulse + 1 });
}
export function ScenarioStory() {
  const id = useUI((s) => s.ventScenario); const sc = VENT_SCENARIO[id];
  return (
    <section className="card story">
      <div className="eyebrow">{sc.short}</div>
      <p>{sc.story}</p>
      <ul className="look">{sc.look.map((l) => <li key={l}>{l}</li>)}</ul>
    </section>
  );
}
