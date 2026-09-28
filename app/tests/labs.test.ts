import { describe, it, expect } from 'vitest';
import { LABS, LAB, flagOf } from '../src/knowledge/labs';
import { LabBench } from '../src/labs/bench';
import { cellSpec } from '../src/labs/cellSpec';
import { ecgShape } from '../src/physiology/ecg';
import { interpret } from '../src/physiology/interpret';
import { ABG_PRESETS } from '../src/scenarios/abg';
import { ABG_ACTIONS } from '../src/scenarios/abgChallenges';
import { LAB_CASES } from '../src/scenarios/labCases';
import { AbgLab } from '../src/abg/lab';
import { Mechanics } from '../src/physiology/mechanics';
import { DYSSYNCHRONIES } from '../src/scenarios/dyssynchrony';
import { VENT_SCENARIO, buildLung, scenarioSettings } from '../src/scenarios/vent';

describe('lab knowledge base', () => {
  const required = ['na', 'k', 'cl', 'hco3', 'ca', 'mg', 'phos', 'bun', 'cr', 'egfr', 'glu', 'ag', 'lac', 'ket', 'hb', 'hct', 'rbc', 'wbc', 'plt', 'pt', 'inr', 'aptt', 'fib', 'trop', 'bnp', 'ast', 'alt', 'alp', 'bili', 'alb'];
  it('covers every lab in the brief with the full teaching chain', () => {
    for (const id of required) { const l = LAB[id]; expect(l, id).toBeTruthy(); for (const f of [l.what, l.source, l.does, l.bedside, l.high.effects + l.low.effects]) expect(f.length).toBeGreaterThan(2); expect(l.normal[0]).toBeLessThan(l.normal[1]); expect(l.range[0]).toBeLessThanOrEqual(l.normal[0]); expect(l.range[1]).toBeGreaterThanOrEqual(l.normal[1]); }
  });
  it('flags', () => { expect(flagOf(LAB.k, 7)).toBe('critical-high'); expect(flagOf(LAB.k, 3.2)).toBe('low'); expect(flagOf(LAB.na, 140)).toBe('normal'); });
});

describe('lab bench drives the shared patient', () => {
  it('every lab slider round-trips through the patient model', () => {
    for (const l of LABS) { const b = new LabBench(); const target = (l.normal[0] + l.range[1]) / 2; b.set(l.id, target); const got = b.value(l.id); expect(Math.abs(got - target) / Math.max(1, Math.abs(target)), l.id).toBeLessThan(0.08); }
  });
  it('hyperkalaemia: calcium fixes the ECG without changing K⁺', () => {
    const b = new LabBench(); b.pt.p.renal = 0.1; b.set('k', 7.5); const e0 = ecgShape({ kEff: b.snap.kEffective, k: b.snap.k, ca: b.pt.p.ca, mg: b.pt.p.mg });
    b.give('calcium'); b.fastForward(4); const e1 = ecgShape({ kEff: b.snap.kEffective, k: b.snap.k, ca: b.pt.p.ca, mg: b.pt.p.mg });
    expect(Math.abs(b.snap.k - 7.5)).toBeLessThan(0.2); expect(e1.qrs).toBeLessThan(e0.qrs); expect(e1.tAmp).toBeLessThan(e0.tAmp);
  });
  it('hypokalaemia gives U waves; hypocalcaemia a long QT', () => {
    expect(ecgShape({ kEff: 2.6, k: 2.6, ca: 1.2, mg: 2 }).u).toBeGreaterThan(0.05);
    expect(ecgShape({ kEff: 4, k: 4, ca: 0.8, mg: 2 }).qt).toBeGreaterThan(ecgShape({ kEff: 4, k: 4, ca: 1.2, mg: 2 }).qt + 0.08);
  });
  it('hyponatraemia swells brain cells; the cell scene follows', () => {
    const b = new LabBench(); b.set('na', 118); const s = cellSpec('na', b.snap, b.pt); expect(s.cellScale).toBeGreaterThan(1.1);
    expect(b.snap.hco3).toBeGreaterThan(22); // sodium change alone does not create an acid–base disorder
  });
  it('anaemia: SpO₂ normal, content falls; insulin speeds the pump', () => {
    const b = new LabBench(); b.set('hb', 6); expect(b.snap.spo2).toBeGreaterThan(0.93); expect(b.snap.cao2).toBeLessThan(10);
    const k = new LabBench(); const p0 = cellSpec('k', k.snap, k.pt).pump; k.give('insulin'); k.fastForward(40); expect(cellSpec('k', k.snap, k.pt).pump).toBeGreaterThan(p0 + 0.5);
  });
  it('lab cases have valid answers and known labs', () => { for (const c of LAB_CASES) { expect(c.answer).toBeLessThan(c.options.length); for (const id of Object.keys(c.values)) expect(LAB[id], id).toBeTruthy(); expect(LAB[c.focus]).toBeTruthy(); } });
});

describe('blood-gas presets and challenge actions', () => {
  it('each preset produces its intended primary disorder', () => {
    const expect_: Record<string, string> = { opioid: 'resp acidosis', dka: 'met acidosis', asthma: 'resp acidosis', copd: 'resp acidosis', edema: 'resp alkalosis' };
    const L = new AbgLab();
    for (const [id, d] of Object.entries(expect_)) { L.load(id); const g = L.snap; const it = interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, na: g.na, cl: g.cl }); expect(it.primary, id).toContain(d); }
    L.load('salicylate'); const g = L.snap; const it = interpret({ pH: g.pH, paco2: g.paco2, hco3: g.hco3, na: g.na, cl: g.cl }); expect([...it.primary, ...it.secondary]).toContain('resp alkalosis'); expect(it.hagma).toBe(true);
  });
  it('the correct action improves the gas', () => {
    const L = new AbgLab();
    for (const p of ABG_PRESETS) { const a = ABG_ACTIONS[p.id]; if (!a) continue; L.load(p.id); const before = Math.abs(L.snap.pH - 7.4), lac0 = L.snap.lactate; a.apply(L); L.fastForward(a.ffMin); const after = Math.abs(L.snap.pH - 7.4); if (p.id === 'sepsis') expect(L.snap.lactate).toBeLessThan(lac0 * 0.7); else if (!['copd', 'arrest'].includes(p.id)) expect(after, p.id).toBeLessThan(before + 0.02); }
  });
  it('+48 h renal compensation moves a respiratory acidosis toward normal pH', () => { const L = new AbgLab(); L.load('opioid'); const pH0 = L.snap.pH; L.fastForward(2880); expect(L.snap.pH).toBeGreaterThan(pH0 + 0.05); expect(L.snap.hco3).toBeGreaterThan(32); });
});

describe('dyssynchrony challenges are solvable', () => {
  const fixes: Record<string, object> = { 'flow-starvation': { mode: 'PC', pinsp: 14, ti: 0.9 }, ineffective: { trigFlow: 1.5 }, double: { mode: 'PSV', ps: 10 }, stacking: { mode: 'PSV', ps: 10 }, premature: { cyclePct: 25 }, delayed: { cyclePct: 45 }, autopeep: { rr: 12 } };
  for (const d of DYSSYNCHRONIES) it(d.name, () => {
    const sc = VENT_SCENARIO[d.scenario]; const run = (o: object) => { const m = new Mechanics({ ...scenarioSettings(sc), ...d.bad, ...o }, buildLung(sc, sc.spasm), d.effort); m.run(45); return d.metric(m.recent(6)); };
    expect(run({})).toBeGreaterThan(d.threshold); expect(run(fixes[d.id])).toBeLessThanOrEqual(d.threshold);
  });
});
