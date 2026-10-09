import { Picker } from '../scene/pane';
import { useState } from 'react';
import { lab } from './lab';
import { useUI } from '../app/store';
import { ABG_PRESETS } from '../scenarios/abg';
import { AbgControls, AcidBaseMap, SampleCards, AbgInterpret } from './AbgPanel';
import { AbgTable } from '../vent/VentSim';
import type { Snapshot, DrugId } from '../physiology/patient';

const DRUGS: [DrugId, string][] = [['naloxone', 'Naloxone'], ['insulin', 'Insulin + dextrose'], ['bicarb', 'NaHCO₃ 50 mEq'], ['fluids', 'Fluid 1 L'], ['transfusion', 'PRBC 1 unit']];
/** Treat-over-time sandbox: every blood gas you draw is kept, so you can see the trajectory your decisions produce. */
export function AbgSim() {
  useUI((s) => s.pulse);
  const [rows, setRows] = useState<{ t: string; setting?: string; g: Snapshot; fio2: number }[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const bump = () => useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
  const drawGas = () => { const t = lab.pt.t; setRows((r) => [...r, { t: `${Math.floor(t / 60)}h${String(Math.round(t % 60)).padStart(2, '0')}`, setting: log.slice(-2).join(' · '), g: { ...lab.snap, vbg: { ...lab.snap.vbg } }, fio2: lab.pt.p.fio2 }]); };
  return (
    <div className="chal-run">
      <section className="card"><div className="eyebrow">Simulation</div><h2 className="h2">Treat the patient over time</h2><p className="muted">Pick a patient, act, let time pass, draw gases. The table keeps every result so you can see the trajectory your decisions produce.</p>
        <div style={{ marginTop: 8 }}><Picker label="Patient" value={lab.preset.id} onPick={(id) => { lab.load(id); setRows([]); setLog([]); bump(); }} groups={[{ items: ABG_PRESETS.filter((p) => p.id !== 'normal').map((p) => ({ id: p.id, name: p.name, hint: p.story })) }]} /></div>
        <p style={{ margin: '10px 0 0' }}>{lab.preset.story}</p>
      </section>
      <section className="card"><div className="card-h"><h3>Act</h3><span className="clock">{Math.floor(lab.pt.t / 60)} h {Math.round(lab.pt.t % 60)} min</span></div>
        <div className="actions">{DRUGS.map(([id, l]) => <button key={id} className="act" onClick={() => { lab.give(id); setLog((x) => [...x, l]); bump(); }}>{l}</button>)}</div>
        <div className="actions" style={{ marginTop: 8 }}>
          <button className="act" onClick={() => { lab.fastForward(15); bump(); }}>Wait 15 min</button><button className="act" onClick={() => { lab.fastForward(60); bump(); }}>Wait 1 h</button><button className="act" onClick={() => { lab.fastForward(360); bump(); }}>Wait 6 h</button>
          <button className="act primary" onClick={drawGas}>Draw blood gas</button>
        </div>
        {rows.length > 0 && <AbgTable rows={rows} />}
      </section>
      <SampleCards />
      <AbgControls />
      <AcidBaseMap />
      <AbgInterpret />
    </div>
  );
}
