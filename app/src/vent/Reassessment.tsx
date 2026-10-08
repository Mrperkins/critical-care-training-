import { useState } from 'react';
import { session } from './session';
import { captureObservation, OBSERVATION_FIELDS, observationReady, type Observation } from './observation';
import { LIMITS, type SettingKey } from './equipment';

export function Reassessment({ baseline, onBaseline }: { baseline: Observation | null; onBaseline: (o: Observation) => void }) {
  const [records, setRecords] = useState<{ before: Observation; after: Observation; reasoning: string }[]>([]);
  const [reasoning, setReasoning] = useState('');
  const ready = baseline && observationReady(baseline, session);
  const current = captureObservation(session);
  const remaining=Math.max(0,3-(session.breathN-Math.max(baseline?.breath??session.breathN,session.changedAt)));
  const settingsChanges=(before:Observation,after:Observation)=>(Object.keys(LIMITS) as SettingKey[]).filter(k=>before.settings[k]!==after.settings[k]).map(k=>{
    const display=(v:number)=>k==='vt'?`${Math.round(v*1000)} mL`:k==='fio2'?`${Math.round(v*100)}%`:`${+v.toFixed(2)} ${LIMITS[k].unit}`;
    return <li key={k}>{LIMITS[k].label}: {display(before.settings[k])} → {display(after.settings[k])}</li>;
  });
  const compare = (before: Observation, after: Observation) => <div className="equipment-comparison"><table>
    <caption>Observed response · {after.breath - before.breath} completed breaths between samples</caption>
    <thead><tr><th scope="col">Measure</th><th scope="col">Before</th><th scope="col">After</th><th scope="col">Change</th></tr></thead>
    <tbody>{OBSERVATION_FIELDS.map(f => {
      const diff = after[f.key] - before[f.key];
      return <tr key={f.key}><th scope="row">{f.label}<small>{f.unit}</small></th><td>{before[f.key].toFixed(f.digits)}{f.key === 'pplat' && !before.measured ? ' est.' : ''}</td><td>{after[f.key].toFixed(f.digits)}{f.key === 'pplat' && !after.measured ? ' est.' : ''}</td><td>{diff > 0 ? '+' : ''}{diff.toFixed(f.digits)}</td></tr>;
    })}</tbody>
  </table></div>;
  return <section className="equipment-reassessment" aria-label="Bedside reassessment">
    <h3>Make the next decision</h3><p>Inspect the 3D patient and circuit, read the waveforms, then state what you expect your next action to change.</p>
    <label htmlFor="equipment-reasoning">Your clinical reasoning<textarea id="equipment-reasoning" rows={3} value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="What is the problem? What should change? What could worsen?" /></label>
    <div className="actions"><button className="act" onClick={() => onBaseline(captureObservation(session))}>{baseline ? 'Replace baseline with current values' : 'Capture baseline'}</button><button className="act primary" disabled={!ready} onClick={() => {
      if (!baseline || !observationReady(baseline, session)) return;
      setRecords(r => [{ before: baseline, after: captureObservation(session), reasoning }, ...r].slice(0, 8));
      setReasoning(''); onBaseline(captureObservation(session));
    }}>Record reassessment</button></div>
    <p role="status">{!baseline ? 'Capture a baseline before intervening.' : ready ? 'Three or more breaths observed since the last change. Compare oxygenation, ventilation and perfusion before deciding again.' : `Observe ${remaining} more completed breaths after the last change. This is a teaching checkpoint, not physiologic equilibration.`}</p>
    {baseline && <details><summary>Compare baseline with live response</summary>{compare(baseline, current)}</details>}
    <p className="muted small">Gas exchange is time-compressed. Changes are observations, not proof of benefit or a validated clinical prediction. Plateau values marked “est.” were not measured by a hold. Notes stay in this scenario until you leave or reset it.</p>
    {records.length > 0 && <details open><summary>Scenario debrief · {records.length} observations</summary>{records.map((r, i) => <article key={`${r.after.time}-${i}`}><h4>Reassessment {records.length - i}</h4>{r.reasoning && <p>{r.reasoning}</p>}<p>{r.before.settings.mode} → {r.after.settings.mode} · circuit {r.before.circuit} → {r.after.circuit}</p><ul>{settingsChanges(r.before,r.after)}</ul>{compare(r.before, r.after)}</article>)}</details>}
  </section>;
}
