import { describe, expect, it } from 'vitest';
import { VentSession } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';
import { alarms, commitSettings, constrainSetting, DEFAULT_ALARMS, EQUIPMENT_SCENARIOS, LIMITS, loadEquipmentScenario, validateSettings } from '../src/vent/equipment';
import { VENT_SCENARIO } from '../src/scenarios/vent';
import { ventilationWeight } from '../src/physiology/patient';

const run=(s:VentSession,seconds:number) => { for(let i=0;i<seconds*10;i++) s.tick(.1); };
describe('equipment simulator uses the existing physiology engine',()=>{
  it.each(EQUIPMENT_SCENARIOS)('$id references a playable scenario with valid initial settings',sc=>{
    expect(VENT_SCENARIO[sc.scenario]).toBeDefined(); const s=new VentSession(); loadEquipmentScenario(s,sc.id);
    expect(validateSettings(s.m.s)).toEqual([]); expect(sc.objective.length).toBeGreaterThan(25);
    if(sc.fault) expect(s.circuitFault).toBe(sc.fault);
  });
  it('draft changes stay pending until a valid confirmation',()=>{
    const s=new VentSession('normal'); const before={...s.m.s}; const draft={...before,vt:.3};
    expect(s.m.s).toEqual(before); const result=commitSettings(s,draft); expect(result.ok).toBe(true); expect(s.m.s.vt).toBe(.3);
    draft.vt=.7; expect(s.m.s.vt).toBe(.3);
  });
  it('rejects invalid timing atomically without partially changing FiO₂',()=>{
    const s=new VentSession('normal'); const before={...s.m.s};
    expect(commitSettings(s,{...before,mode:'PC',rr:60,ti:2,fio2:1}).ok).toBe(false); expect(s.m.s).toEqual(before);
    expect(commitSettings(s,{...before,fio2:NaN}).ok).toBe(false); expect(s.m.s).toEqual(before);
    expect(commitSettings(s,{...before,mode:'APRV',phigh:10,plow:10}).ok).toBe(false);
  });
  it.each(Object.keys(LIMITS) as (keyof typeof LIMITS)[])('%s has finite, bounded touch adjustments',key=>{
    expect(constrainSetting(key,-100)).toBe(LIMITS[key].min); expect(constrainSetting(key,1000)).toBe(LIMITS[key].max);
    expect(()=>constrainSetting(key,Infinity)).toThrow();
  });
  it('confirmed tidal volume changes exhaled volume rather than only the display',()=>{
    const s=new VentSession('normal'); run(s,20); const before=ventNumbers(s).vte;
    expect(commitSettings(s,{...s.m.s,vt:.3}).ok).toBe(true); run(s,25);
    expect(ventNumbers(s).vte).toBeLessThan(before-90);
  });
  it('longer expiration reduces simulated auto-PEEP in asthma',()=>{
    const s=new VentSession('asthma'); run(s,35); const before=ventNumbers(s).autoPeep;
    expect(commitSettings(s,{...s.m.s,rr:8,flow:90}).ok).toBe(true); run(s,70);
    expect(ventNumbers(s).autoPeep).toBeLessThan(before);
  });
  it('PEEP recruits ARDS units and modifies shunt in the same session',()=>{
    const s=new VentSession('ards'); run(s,25); const before=ventNumbers(s).openFrac, shunt=s.pt.p.shunt;
    expect(commitSettings(s,{...s.m.s,peep:12,vt:.42}).ok).toBe(true); run(s,45);
    expect(ventNumbers(s).openFrac).toBeGreaterThan(before); expect(s.pt.p.shunt).toBeLessThan(shunt);
  });
  it('disconnect and reconnection change alarms and actual exhaled ventilation',()=>{
    const s=new VentSession('normal'); run(s,20); const before=ventNumbers(s).mv;
    s.circuit('disconnect'); run(s,20); expect(alarms(s,DEFAULT_ALARMS)).toContain('Circuit disconnected'); expect(ventNumbers(s).mv).toBeLessThan(before);
    s.circuit('none'); run(s,25); expect(alarms(s,DEFAULT_ALARMS)).not.toContain('Circuit disconnected'); expect(ventNumbers(s).mv).toBeGreaterThan(1);
  });
  it('does not apply adult PBW to a child',()=>{
    const s=new VentSession('pediatric-asthma'); expect(ventilationWeight(s.pt.p)).toBe(20); run(s,20);
    expect(ventNumbers(s).vtPerKg).toBeGreaterThan(5); expect(ventNumbers(s).vtPerKg).toBeLessThan(9);
  });
});
