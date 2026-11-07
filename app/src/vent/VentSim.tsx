import { useMemo, useRef, useState } from 'react';
import { session } from './session';
import { useUI } from '../app/store';
import { SIM_CASES, type SimCase, type Feedback } from '../scenarios/cases';
import { createPatient, settle, derive, type PatientState, type Snapshot } from '../physiology/patient';
import { interpret } from '../physiology/interpret';
import { loadVentScenario, VentSettingsFold, VentNumbersCard, GasFold, Interventions } from './VentPanel';
import { Fold } from '../scene/pane';
import { ventNumbers } from './numbers';

interface Draw { t: string; setting: string; g: Snapshot; fio2: number; fb: Feedback[] }
export function AbgTable({ rows }: { rows: { t: string; setting?: string; g: Snapshot; fio2: number }[] }) {
  return (
    <div className="abg-table" role="table">
      <div className="abg-tr head" role="row"><span>When</span><span>pH</span><span>PaCO₂</span><span>PaO₂</span><span>HCO₃⁻</span><span>BE</span><span>Lac</span></div>
      {rows.map((r, i) => <div key={i} className="abg-tr" role="row"><span>{r.t}{r.setting && <small>{r.setting}</small>}</span><span className={r.g.pH < 7.35 ? 'lo' : r.g.pH > 7.45 ? 'hi' : ''}>{r.g.pH.toFixed(2)}</span><span className={r.g.paco2 > 45 ? 'hi' : r.g.paco2 < 35 ? 'lo' : ''}>{r.g.paco2.toFixed(0)}</span><span className={r.g.pao2 < 60 ? 'lo' : ''}>{r.g.pao2.toFixed(0)}</span><span>{r.g.hco3.toFixed(0)}</span><span>{r.g.sbe.toFixed(0)}</span><span className={r.g.lactate > 2 ? 'hi' : ''}>{r.g.lactate.toFixed(1)}</span></div>)}
    </div>
  );
}

export function VentSim() {
  const [c, setC] = useState<SimCase | null>(null);
  if (!c) return (
    <div className="chal-list">
      <section className="card"><div className="eyebrow">Simulation</div><h2 className="h2">One patient, start to finish</h2><p className="muted">Meet the patient breathing on their own, decide, intubate, choose the settings — then the repeat blood gas is generated from what you chose.</p></section>
      {SIM_CASES.map((x) => <button key={x.id} className="chal-item" onClick={() => setC(x)}><span className={`lvl lvl-${x.level}`}>{x.level}</span><span className="ci-t">{x.title}</span></button>)}
    </div>
  );
  return <SimRun key={c.id} c={c} onExit={() => setC(null)} />;
}

function SimRun({ c, onExit }: { c: SimCase; onExit: () => void }) {
  useUI((s) => s.pulse);
  const pre = useRef<PatientState>(); if (!pre.current) { pre.current = createPatient(c.pre.params, c.pre.init); settle(pre.current, c.pre.settleMin); }
  const [phase, setPhase] = useState<'pre' | 'vent'>('pre'); const [preAbg, setPreAbg] = useState(false); const [draws, setDraws] = useState<Draw[]>([]); const [t, setT] = useState(0);
  const g0 = useMemo(() => derive(pre.current!), []);
  const intubate = () => {
    loadVentScenario(c.scenario); session.intervene('paralyse'); session.set(c.startSettings);
    const p = pre.current!; session.attachPatient(p); setPhase('vent'); setT(0);
  };
  const draw = () => {
    session.fastForward(30); const nt = t + 30; setT(nt);
    const s = session.m.s; const n = ventNumbers(session); const g = session.snap;
    const setting = `${s.mode} ${s.mode === 'PC' ? 'P' + s.pinsp : 'Vt ' + Math.round(s.vt * 1000)} · RR ${s.rr} · PEEP ${s.peep} · FiO₂ ${s.fio2.toFixed(2)}`;
    setDraws((d) => [...d, { t: `${nt} min`, setting, g: { ...g, vbg: { ...g.vbg } }, fio2: s.fio2, fb: c.review(n, g, s) }]);
  };
  const last = draws[draws.length - 1];
  return (
    <div className="chal-run">
      <button className="back" onClick={onExit}>← All cases</button>
      <section className="card"><div className="eyebrow">{c.level} · simulation</div><h2 className="h2">{c.title}</h2><p>{c.story}</p><p className="muted">{c.exam}</p></section>
      {phase === 'pre' && <>
        <section className="card">
          <div className="card-h"><h3>Breathing on their own</h3><span className="muted small">FiO₂ ≈ {c.pre.params.fio2?.toFixed(2)}</span></div>
          <div className="monitor">
            <div><span className="ml">RR</span><span className="mv">{Math.round(g0.rr)}</span></div>
            <div><span className="ml">SpO₂</span><span className="mv c-spo2">{Math.round(g0.spo2 * 100)}</span></div>
            <div><span className="ml">EtCO₂</span><span className="mv c-co2">{Math.round(g0.etco2)}</span></div>
            <div><span className="ml">MAP</span><span className="mv">{Math.round(g0.map)}</span></div>
          </div>
          <p className="muted small">Vt ≈ {Math.round(g0.vt * 1000)} mL · minute ventilation {g0.ve.toFixed(1)} L/min · alveolar {g0.va.toFixed(1)} L/min</p>
          <div className="actions"><button className="act" onClick={() => setPreAbg(true)}>Draw ABG</button><button className="act primary" onClick={intubate}>Intubate &amp; ventilate</button></div>
          {preAbg && <><AbgTable rows={[{ t: 'Arrival', g: g0, fio2: c.pre.params.fio2 ?? 0.21 }]} /><p className="interp">{interpret({ pH: g0.pH, paco2: g0.paco2, hco3: g0.hco3, pao2: g0.pao2, fio2: c.pre.params.fio2 ?? 0.21, na: g0.na, cl: g0.cl, albumin: g0.albumin, age: c.pre.params.age }).summary}.</p><p className="muted small">EtCO₂ reads below PaCO₂ because of alveolar dead space (PaCO₂ − EtCO₂ = {Math.round(g0.paco2 - g0.etco2)} mmHg).</p></>}
        </section>
      </>}
      {phase === 'vent' && <>
        <section className="card">
          <div className="card-h"><h3>Targets</h3></div>
          <ul className="look">{c.targets.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="actions" style={{ marginTop: 8 }}><button className="act primary" onClick={draw}>Draw ABG in 30 min on these settings</button></div>
          {draws.length > 0 && <AbgTable rows={[{ t: 'Arrival', g: g0, fio2: c.pre.params.fio2 ?? 0.21 }, ...draws]} />}
          {last && <ul className="findings" style={{ marginTop: 10 }}>{last.fb.map((f, i) => <li key={i} className={`f-${f.level}`}><span>{f.text}</span></li>)}</ul>}
        </section>
        <VentNumbersCard />
        <VentSettingsFold group="vent-sim" defaultOpen />
        <Fold group="vent-sim" id="act" title="Interventions"><Interventions /></Fold>
        <GasFold group="vent-sim" />
      </>}
    </div>
  );
}
