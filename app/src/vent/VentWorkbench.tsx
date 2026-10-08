import { useEffect, useState } from 'react';
import { useUI } from '../app/store';
import { session } from './session';
import { ventNumbers } from './numbers';
import { explainVent } from '../knowledge/ventExplain';
import { Scalars, Loops } from './Waveforms';
import { EquipmentPatient } from './EquipmentPatient';
import { Reassessment } from './Reassessment';
import { captureObservation, type Observation } from './observation';
import { GasCard, Interventions } from './VentPanel';
import { VentSim } from './VentSim';
import { alarms, commitSettings, constrainSetting, DEFAULT_ALARMS, EQUIPMENT_MODES, EQUIPMENT_SCENARIOS, LIMITS, loadEquipmentScenario, parametersFor, type SettingKey } from './equipment';
import type { VentSettings, Mode } from '../physiology/mechanics';

const format=(key:SettingKey,value:number) => key==='vt'?`${Math.round(value*1000)} mL`:key==='fio2'?`${Math.round(value*100)}%`:`${+value.toFixed(2)} ${LIMITS[key].unit}`;
const PRIMARY:SettingKey[]=['vt','rr','peep','fio2','flow','ti','pinsp','ps','phigh','plow','thigh','tlow'];
export function VentWorkbench() {
  useUI(s=>s.pulse);
  const [scenario,setScenario]=useState('ards'); const [draft,setDraft]=useState<VentSettings>(()=>({...session.m.s}));
  const [selected,setSelected]=useState<SettingKey>('vt'); const [pane,setPane]=useState<'patient'|'ventilator'|'waveforms'|'feedback'>('ventilator');
  const [advanced,setAdvanced]=useState(false); const [limits,setLimits]=useState({...DEFAULT_ALARMS});
  const [baseline,setBaseline]=useState<Observation|null>(null); const [attempt,setAttempt]=useState(0);
  const [message,setMessage]=useState(''); const [errors,setErrors]=useState<string[]>([]); const [commits,setCommits]=useState(0); const [guided,setGuided]=useState(false);
  const refresh=() => useUI.getState().set({pulse:useUI.getState().pulse+1});
  const load=(id:string) => { const sc=loadEquipmentScenario(session,id); session.paused=false; setBaseline(captureObservation(session)); setAttempt(a=>a+1); setScenario(id); setDraft({...session.m.s}); setSelected(parametersFor(session.m.s.mode)[0]); setLimits({...DEFAULT_ALARMS,lowMinuteVolume:session.pt.p.age<18?.5:DEFAULT_ALARMS.lowMinuteVolume}); setMessage('Select a setting, adjust, then confirm.'); setErrors([]); setCommits(0); useUI.getState().set({ventScenario:sc.scenario}); refresh(); };
  useEffect(()=>{load(EQUIPMENT_SCENARIOS.find(s=>s.scenario===useUI.getState().ventScenario)?.id ?? 'ards');return()=>{session.paused=false;};},[]);
  const params=parametersFor(draft.mode); const key=params.includes(selected)?selected:params[0];
  const setValue=(value:number) => { setDraft(s=>({...s,[key]:constrainSetting(key,value)})); setMessage('Pending setting · patient unchanged until confirmation'); setErrors([]); };
  const setMode=(mode:Mode) => { setDraft(s=>({...s,mode})); setSelected(parametersFor(mode)[0]); setMessage('Pending mode · confirm to apply'); setErrors([]); };
  const confirm=() => { const result=commitSettings(session,draft); setErrors(result.errors); if(result.ok){setCommits(c=>c+1);setMessage('Settings committed. Observe several breaths and reassess the patient.');refresh();} };
  const dirty=JSON.stringify(draft)!==JSON.stringify(session.m.s), n=ventNumbers(session), alarm=alarms(session,limits);
  const feedback=explainVent(n,session.m.s,session.m.recent(6),session.m.pt.pmax>0);
  const sc=EQUIPMENT_SCENARIOS.find(s=>s.id===scenario)!;
  const visible=params.filter(p=>PRIMARY.includes(p)||advanced);
  if(guided) return <main className="equipment-guided"><button className="back" onClick={()=>{setGuided(false);setDraft({...session.m.s});}}>← Equipment simulator</button><VentSim /></main>;
  return <main className={`equipment-workbench equipment-pane-${pane}`}>
    <div className="equipment-heading"><div><span className="eyebrow">Respiratory · interactive 3D equipment simulation</span><h2>Operate. Observe. Reassess.</h2><p className="muted small">Inspired by established clinical simulation teaching: adjust the settings, confirm, then observe 3D regional anatomy and reassess actual waveforms and gas exchange.</p><div className="equipment-reference-links"><a href="https://www.openpediatrics.org/interactive-media/ventilator-simulator" target="_blank" rel="noreferrer">OPENPediatrics original simulator ↗</a><a href="https://www.openpediatrics.org/critical-care-videos/ventilator-waveforms" target="_blank" rel="noreferrer">Waveform reference ↗</a></div></div><label>Patient scenario<select value={scenario} onChange={e=>load(e.target.value)}>{EQUIPMENT_SCENARIOS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></label></div>
    <nav className="equipment-mobile-nav" aria-label="Ventilator simulation view">{(['patient','ventilator','waveforms','feedback'] as const).map(p=><button key={p} aria-pressed={pane===p} onClick={()=>setPane(p)}>{p==='ventilator'?'Ventilator':p==='patient'?'Patient':p==='waveforms'?'Waveforms':'Feedback'}</button>)}</nav>
    <section className="equipment-patient-pane"><h3>Patient &amp; circuit</h3><EquipmentPatient onCircuitChange={refresh} onVentilator={()=>setPane('ventilator')} /><p>{session.sc.story}</p><p className="muted">{sc.objective}</p><GasCard compact /></section>
    <section className="equipment-console"><header><span>ASTRA training ventilator</span><b>Active: {session.m.s.mode}</b></header>
      <div className={`equipment-alarm${alarm.length?' active':''}`} role="status">{alarm.length?alarm.join(' · '):'No active alarms'}<span>Alarm limits are training settings.</span></div>
      <label className="equipment-mode">Ventilation mode<select value={draft.mode} onChange={e=>setMode(e.target.value as Mode)}>{EQUIPMENT_MODES.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
      <div className="equipment-readings"><div><span>Ppeak</span><b>{n.pip.toFixed(0)}</b><small>cmH₂O</small></div><div><span>Pplat{n.pplatMeasured?'':' est.'}</span><b>{n.pplat.toFixed(0)}</b><small>cmH₂O</small></div><div><span>Vte</span><b>{n.vte.toFixed(0)}</b><small>mL</small></div><div><span>V̇E</span><b>{n.mv.toFixed(1)}</b><small>L/min</small></div><div><span>Auto-PEEP</span><b>{n.autoPeep.toFixed(1)}</b><small>cmH₂O</small></div><div><span>I:E measured</span><b>{n.ie}</b><small>breath timing</small></div></div>
      <div className="equipment-settings" role="group" aria-label="Select a ventilator parameter">{visible.map(p=><button key={p} aria-pressed={key===p} onClick={()=>setSelected(p)}><span>{LIMITS[p].label}</span><b>{format(p,draft[p])}</b>{draft[p]!==session.m.s[p]&&<small>Pending</small>}</button>)}</div>
      <button className="equipment-disclosure" aria-expanded={advanced} onClick={()=>setAdvanced(!advanced)}>{advanced?'Hide':'Show'} trigger &amp; advanced settings</button>
      <div className="equipment-knob"><label htmlFor="equipment-setting">{LIMITS[key].label}<output>{format(key,draft[key])}</output></label><div className="equipment-knob-row"><button aria-label={`Decrease ${LIMITS[key].label}`} onClick={()=>setValue(draft[key]-LIMITS[key].step)}>−</button><input id="equipment-setting" type="range" min={LIMITS[key].min} max={LIMITS[key].max} step={LIMITS[key].step} value={draft[key]} onChange={e=>setValue(+e.target.value)} /><button aria-label={`Increase ${LIMITS[key].label}`} onClick={()=>setValue(draft[key]+LIMITS[key].step)}>+</button></div><p>Active {format(key,session.m.s[key])} → pending {format(key,draft[key])}</p></div>
      <div className="equipment-confirm"><button className="act" disabled={!dirty} onClick={()=>{setDraft({...session.m.s});setErrors([]);setMessage('Pending edits discarded.');}}>Cancel edits</button><button className="act primary" disabled={!dirty} onClick={confirm}>Confirm settings</button></div>
      <p className="equipment-message" role="status">{message}</p>{errors.length>0&&<ul role="alert">{errors.map(e=><li key={e}>{e}</li>)}</ul>}
      <div className="equipment-holds"><button onClick={()=>{session.hold('i');refresh();}}>Inspiratory hold</button><button onClick={()=>{session.hold('e');refresh();}}>Expiratory hold</button></div>
      <details className="equipment-limits"><summary>Alarm limits &amp; circuit</summary><label>High pressure (cmH₂O)<input type="number" min="10" max="80" value={limits.highPressure} onChange={e=>setLimits(l=>({...l,highPressure:Math.max(10,Math.min(80,+e.target.value||10))}))} /></label><label>Low minute volume (L/min)<input type="number" min=".2" max="20" step=".1" value={limits.lowMinuteVolume} onChange={e=>setLimits(l=>({...l,lowMinuteVolume:Math.max(.2,Math.min(20,+e.target.value||.2))}))} /></label><label>Low SpO₂ (%)<input type="number" min="50" max="99" value={limits.lowSpO2} onChange={e=>setLimits(l=>({...l,lowSpO2:Math.max(50,Math.min(99,+e.target.value||50))}))} /></label><button className="act" onClick={()=>{session.circuit('none');refresh();}}>Reconnect / seal circuit</button><button className="act" onClick={()=>{session.circuit('disconnect');refresh();}}>Disconnect circuit</button></details>
    </section>
    <section className="equipment-waveforms"><h3>Scalars &amp; loops</h3><Scalars height={300} /><Loops /><p className="muted small">Pressure · flow · volume. Loops use the same breath samples as the numerical monitor.</p></section>
    <section className="equipment-feedback"><h3>Clinical response</h3><p>{commits} setting confirmations this scenario. Gas exchange evolves at {session.physioSpeed}× physiologic time.</p><div className="actions"><button className="act" aria-pressed={session.paused} onClick={()=>{session.paused=!session.paused;refresh();}}>{session.paused?'Resume simulation':'Pause to inspect'}</button><button className="act" onClick={()=>load(scenario)}>Restart scenario</button></div><Reassessment key={attempt} baseline={baseline} onBaseline={setBaseline} /><GasCard /><Interventions /><details><summary>Interpret the physiology</summary><ul>{feedback.map(f=><li key={f.key}><b>{f.title}</b><p>{f.text}</p></li>)}</ul></details><button className="act" onClick={()=>setGuided(true)}>Guided intubation cases</button></section>
  </main>;
}
