import { describe, it, expect } from 'vitest';
import { ecgShape } from '../src/physiology/ecg';
import { createPatient, derive, give, advance } from '../src/physiology/patient';
import { cellSpec } from '../src/labs/cellSpec';
import { LABS } from '../src/knowledge/labs';
import { LabBench } from '../src/labs/bench';
import { VENT_SCENARIOS, buildLung, scenarioSettings } from '../src/scenarios/vent';
import { DYSSYNCHRONIES } from '../src/scenarios/dyssynchrony';
import { Mechanics } from '../src/physiology/mechanics';
import { ABG_PRESETS } from '../src/scenarios/abg';
import { settle } from '../src/physiology/patient';
import { interpret } from '../src/physiology/interpret';
import { alveolarRoles } from '../src/abg/roles';

describe('ECG follows the membrane', () => {
  it('hyperkalaemia widens QRS and peaks T; calcium narrows QRS without lowering K', () => {
    const n = ecgShape({ kEff: 4.2, k: 4.2, ca: 1.2, mg: 2 }); const hi = ecgShape({ kEff: 7.5, k: 7.5, ca: 1.2, mg: 2 });
    expect(hi.qrs).toBeGreaterThan(n.qrs + 0.03); expect(hi.tAmp).toBeGreaterThan(n.tAmp); expect(hi.pAmp).toBeLessThan(n.pAmp);
    const st = createPatient({ renal: 0.1 }, { k: 7.5 }); const s0 = derive(st); give(st, 'calcium'); const s1 = advance(st, 5);
    expect(ecgShape({ kEff: s1.kEffective, k: s1.k, ca: 1.2, mg: 2 }).qrs).toBeLessThan(ecgShape({ kEff: s0.kEffective, k: s0.k, ca: 1.2, mg: 2 }).qrs);
  });
  it('hypokalaemia gives U waves; hypocalcaemia lengthens QT', () => {
    expect(ecgShape({ kEff: 2.6, k: 2.6, ca: 1.2, mg: 2 }).u).toBeGreaterThan(0.05);
    expect(ecgShape({ kEff: 4.2, k: 4.2, ca: 0.8, mg: 2 }).qt).toBeGreaterThan(ecgShape({ kEff: 4.2, k: 4.2, ca: 1.2, mg: 2 }).qt + 0.05);
  });
});

describe('lab bench writes causes into the shared patient', () => {
  it('every lab can be set to a value and read back', () => {
    for (const l of LABS) { const b = new LabBench(); const target = (l.normal[0] + l.range[1]) / 2; b.set(l.id, target); const v = b.value(l.id);
      expect(Math.abs(v - target) / Math.max(1, Math.abs(target)), l.id).toBeLessThan(0.08); }
  });
  it('hyponatraemia swells cells without creating an acid–base disorder', () => {
    const b = new LabBench(); b.set('na', 118); expect(b.snap.cellVolume).toBeGreaterThan(1.1); expect(Math.abs(b.snap.hco3 - 24.4)).toBeLessThan(1);
  });
  it('cell scene counts follow the numbers', () => {
    const b = new LabBench(); const lo = cellSpec('k', b.snap, b.pt).species.find((s) => s.key === 'k')!.outside; b.set('k', 7); expect(cellSpec('k', b.snap, b.pt).species.find((s) => s.key === 'k')!.outside).toBeGreaterThan(lo);
    b.set('hb', 6); expect(cellSpec('hb', b.snap, b.pt).rbc).toBeLessThan(0.5);
    b.set('egfr', 20); expect(cellSpec('cr', b.snap, b.pt).gfr).toBeLessThan(0.3);
  });
  it('every lab has complete teaching content', () => {
    for (const l of LABS) { expect(l.what.length && l.source.length && l.does.length && l.bedside.length, l.id).toBeTruthy(); expect(l.high.causes.length + l.low.causes.length, l.id).toBeGreaterThan(1); expect(l.organs.length).toBeGreaterThan(0); }
  });
});

describe('scenario data runs on the model', () => {
  it('every vent scenario reaches a physiological steady state', () => {
    for (const sc of VENT_SCENARIOS) { const m = new Mechanics(scenarioSettings(sc), buildLung(sc, sc.spasm), sc.effort); m.run(20); const b = m.stats!;
      const minVolume = sc.gas.age != null && sc.gas.age < 18 ? 0.004 * sc.gas.weightKg! : 0.2;
      expect(b.vti, sc.id).toBeGreaterThan(minVolume); expect(b.pip, sc.id).toBeLessThan(60); expect(isFinite(b.pip)).toBe(true); }
  });
  it('every dyssynchrony challenge starts with the problem present', () => {
    for (const d of DYSSYNCHRONIES) { const sc = VENT_SCENARIOS.find((s) => s.id === d.scenario)!; const m = new Mechanics({ ...scenarioSettings(sc), ...d.bad }, buildLung(sc, sc.spasm), d.effort); m.run(45);
      expect(d.metric(m.recent(6)), d.id).toBeGreaterThan(d.threshold); }
  });
  it('blood-gas presets produce the teaching diagnosis', () => {
    const expectP: Record<string, string> = { opioid: 'resp acidosis', dka: 'met acidosis', copd: 'resp acidosis', salicylate: 'resp alkalosis' };
    for (const p of ABG_PRESETS) { if (!expectP[p.id]) continue; const st = createPatient(p.params, p.init ?? {}); const g = settle(st, p.settle);
      const it = interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, na: g.na, cl: g.cl }); expect([...it.primary, ...it.secondary], p.id).toContain(expectP[p.id]); }
  });
  it('shunt and dead-space alveoli follow the fractions', () => {
    const ys = Array.from({ length: 15 }, (_, i) => i); const r = alveolarRoles(15, ys, 0.2, 0.2, 0.2);
    expect(r.filter((x) => x === 'shunt').length).toBe(3); expect(r.filter((x) => x === 'dead').length).toBe(3); expect(r[0]).toBe('shunt'); expect(r[14]).toBe('dead');
  });
});
