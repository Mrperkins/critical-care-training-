import type { VentSettings, Mode } from '../physiology/mechanics';
import type { VentSession } from './session';
import { ventNumbers } from './numbers';

export type SettingKey = Exclude<keyof VentSettings, 'mode' | 'pattern' | 'trigType'>;
export const LIMITS: Record<SettingKey,{ min:number; max:number; step:number; label:string; unit:string; modes?:Mode[] }> = {
  vt:{min:.02,max:.9,step:.01,label:'Tidal volume',unit:'L',modes:['VC','SIMV','PRVC']},
  rr:{min:4,max:60,step:1,label:'Respiratory rate',unit:'/min',modes:['VC','PC','PRVC','SIMV']},
  peep:{min:0,max:24,step:1,label:'PEEP',unit:'cmH₂O',modes:['VC','PC','PRVC','PSV','SIMV','CPAP']},
  fio2:{min:.21,max:1,step:.01,label:'FiO₂',unit:'fraction'},
  flow:{min:5,max:120,step:5,label:'Inspiratory flow',unit:'L/min',modes:['VC','SIMV']},
  ti:{min:.2,max:3,step:.1,label:'Inspiratory time',unit:'s',modes:['PC','PRVC']},
  pinsp:{min:2,max:40,step:1,label:'Inspiratory pressure above PEEP',unit:'cmH₂O',modes:['PC']},
  ps:{min:0,max:30,step:1,label:'Pressure support above PEEP',unit:'cmH₂O',modes:['PSV','SIMV']},
  trigFlow:{min:.2,max:10,step:.2,label:'Flow trigger',unit:'L/min',modes:['VC','PC','PRVC','PSV','SIMV','CPAP']},
  trigPressure:{min:.5,max:10,step:.5,label:'Pressure trigger',unit:'cmH₂O'},
  rise:{min:.05,max:.6,step:.05,label:'Pressure rise time',unit:'s',modes:['PC','PRVC','PSV','SIMV']},
  cyclePct:{min:5,max:80,step:5,label:'Cycle-off',unit:'% peak flow',modes:['PSV','SIMV']},
  pause:{min:0,max:1,step:.1,label:'Inspiratory pause',unit:'s',modes:['VC']},
  phigh:{min:10,max:35,step:1,label:'APRV high pressure',unit:'cmH₂O',modes:['APRV']},
  plow:{min:0,max:10,step:1,label:'APRV low pressure',unit:'cmH₂O',modes:['APRV']},
  thigh:{min:2,max:8,step:.1,label:'APRV high time',unit:'s',modes:['APRV']},
  tlow:{min:.2,max:1.5,step:.05,label:'APRV release time',unit:'s',modes:['APRV']},
};
export const EQUIPMENT_MODES: {id:Mode;label:string}[] = [{id:'VC',label:'Volume assist/control'},{id:'PC',label:'Pressure control'},{id:'PSV',label:'Pressure support'},{id:'SIMV',label:'SIMV'},{id:'PRVC',label:'PRVC'},{id:'CPAP',label:'CPAP'},{id:'APRV',label:'APRV'}];
export function parametersFor(mode:Mode) { return (Object.keys(LIMITS) as SettingKey[]).filter(key => (!LIMITS[key].modes || LIMITS[key].modes!.includes(mode)) && key !== 'trigPressure'); }
export function constrainSetting(key:SettingKey,value:number) {
  const rule=LIMITS[key]; if(!Number.isFinite(value)) throw new Error('Enter a finite setting.');
  return +Math.max(rule.min,Math.min(rule.max,value)).toFixed(4);
}
export function validateSettings(settings:VentSettings): string[] {
  const errors:string[]=[];
  if(!EQUIPMENT_MODES.some(mode => mode.id===settings.mode)) errors.push('Select a supported mode.');
  for(const key of Object.keys(LIMITS) as SettingKey[]) { const r=LIMITS[key], value=settings[key]; if(!Number.isFinite(value)||value<r.min||value>r.max) errors.push(`${r.label} must be ${r.min}–${r.max} ${r.unit}.`); }
  if(settings.mode==='APRV' && settings.phigh<=settings.plow) errors.push('High pressure must exceed low pressure.');
  if((settings.mode==='PC'||settings.mode==='PRVC') && settings.ti>=60/settings.rr) errors.push('Inspiratory time must leave time for expiration.');
  if((settings.mode==='VC'||settings.mode==='SIMV') && settings.vt/(settings.flow/60)+settings.pause>=60/settings.rr) errors.push('Volume, flow and pause must leave time for expiration.');
  return errors;
}
/** Editing does not mutate the patient. Only a valid confirmation reaches the shared engine. */
export function commitSettings(session:VentSession,draft:VentSettings) {
  const errors=validateSettings(draft); if(errors.length) return { ok:false, errors };
  session.set({...draft}); return {ok:true,errors:[]};
}
export interface AlarmLimits { highPressure:number; lowMinuteVolume:number; lowSpO2:number }
export const DEFAULT_ALARMS:AlarmLimits={highPressure:40,lowMinuteVolume:3,lowSpO2:88};
export function alarms(session:VentSession, limits:AlarmLimits) {
  const n=ventNumbers(session); const messages:string[]=[];
  if(session.circuitFault==='disconnect'||session.circuitFault==='both') messages.push('Circuit disconnected');
  if(session.circuitFault==='cuffLeak'||session.circuitFault==='both') messages.push('Circuit / cuff leak');
  if(n.pip>limits.highPressure) messages.push('High airway pressure');
  if(n.mv<limits.lowMinuteVolume) messages.push('Low exhaled minute volume');
  if(n.spo2*100<limits.lowSpO2) messages.push('Low oxygen saturation');
  return messages;
}
export interface EquipmentScenario {id:string;label:string;scenario:string;fault?:'disconnect'|'cuffLeak';objective:string}
export const EQUIPMENT_SCENARIOS:EquipmentScenario[]=[
  {id:'ards',label:'ARDS',scenario:'ards',objective:'Balance gas exchange, recruitment, plateau pressure and perfusion.'},
  {id:'asthma',label:'Severe asthma',scenario:'asthma',objective:'Relieve obstruction and restore enough expiratory time.'},
  {id:'copd',label:'COPD with auto-PEEP',scenario:'copd',objective:'Reduce trapped pressure and inspect patient triggering.'},
  {id:'edema',label:'Cardiogenic pulmonary edema',scenario:'edema',objective:'Support recruitment while watching cardiac output.'},
  {id:'pneumonia',label:'Pneumonia / hypoxemic failure',scenario:'pneumonia',objective:'Support asymmetric gas exchange without excessive stretch.'},
  {id:'tension',label:'Tension pneumothorax',scenario:'ptx',objective:'Distinguish pleural compression from airway resistance and inspect perfusion after decompression.'},
  {id:'hypotension',label:'Post-intubation hypotension',scenario:'post-intubation',objective:'Inspect the pressure–preload tradeoff and reassess perfusion.'},
  {id:'peak-normal',label:'High peak / normal plateau',scenario:'ett',objective:'Use a hold to distinguish resistive from elastic pressure.'},
  {id:'peak-high',label:'High peak / high plateau',scenario:'ards',objective:'Measure plateau and identify an elastic pressure burden.'},
  {id:'tube',label:'Tube obstruction',scenario:'ett',objective:'Identify the tube problem and observe the response to suction.'},
  {id:'leak',label:'Circuit leak',scenario:'normal',fault:'cuffLeak',objective:'Compare delivered and exhaled ventilation; restore the circuit.'},
  {id:'disconnect',label:'Circuit disconnection',scenario:'normal',fault:'disconnect',objective:'Recognize lost ventilation and restore circuit continuity.'},
  {id:'pediatric-asthma',label:'Pediatric asthma · 20 kg',scenario:'pediatric-asthma',objective:'Use child-sized settings and inspect expiratory emptying.'},
];
export function loadEquipmentScenario(session:VentSession,id:string) {
  const scenario=EQUIPMENT_SCENARIOS.find(s=>s.id===id); if(!scenario) throw new Error(`Unknown equipment scenario ${id}`);
  session.load(scenario.scenario); if(scenario.fault) session.circuit(scenario.fault);
  return scenario;
}
