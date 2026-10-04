import { describe, it, expect } from 'vitest';
import { satStd, sat, p50, o2Content, alveolarPO2, solveAcidBase, hh } from '../src/physiology/blood';
import { Mechanics, normalLung, DEFAULT_SETTINGS, VentSettings } from '../src/physiology/mechanics';
import { createPatient, settle, advance, give, derive, restingPotential, egfr, pbw } from '../src/physiology/patient';
import { interpret } from '../src/physiology/interpret';

const S = (o: Partial<VentSettings>): VentSettings => ({ ...DEFAULT_SETTINGS, pattern: 'square', pause: 0.4, ...o });

describe('blood chemistry', () => {
  it('Severinghaus curve hits textbook anchor points', () => {
    expect(satStd(26.8)).toBeCloseTo(0.5, 1);
    expect(satStd(40)).toBeGreaterThan(0.72); expect(satStd(40)).toBeLessThan(0.78);
    expect(satStd(60)).toBeGreaterThan(0.88); expect(satStd(60)).toBeLessThan(0.92);
    expect(satStd(100)).toBeGreaterThan(0.97);
  });
  it('Bohr shift: acidaemia raises P50 and lowers saturation at the same PO2', () => {
    expect(p50(7.2)).toBeGreaterThan(p50(7.4)); expect(sat(50, p50(7.2))).toBeLessThan(sat(50, p50(7.4)));
  });
  it('CaO2 = 1.34·Hb·SaO2 + 0.003·PaO2', () => { expect(o2Content(15, 1, 100)).toBeCloseTo(20.4, 1); expect(o2Content(7.5, 1, 100)).toBeCloseTo(10.35, 1); });
  it('alveolar gas equation', () => { expect(alveolarPO2(0.21, 40)).toBeCloseTo(99.7, 0); expect(alveolarPO2(1, 40)).toBeCloseTo(663, 0); });
  it('Henderson–Hasselbalch & Van Slyke solve are consistent', () => {
    expect(hh(40, 24)).toBeCloseTo(7.39, 1);
    const a = solveAcidBase(40, 0); expect(a.pH).toBeCloseTo(7.4, 2); expect(a.hco3).toBeCloseTo(24.4, 0);
    const acute = solveAcidBase(60, 0); expect(acute.hco3 - a.hco3).toBeGreaterThan(1); expect(acute.hco3 - a.hco3).toBeLessThan(3.5); // ≈+1/10 mmHg
    expect(solveAcidBase(20, -10).pH).toBeGreaterThan(7.3);
  });
});

describe('respiratory mechanics', () => {
  const run = (m: Mechanics, s = 20) => { m.run(s); return m.stats!; };
  it('normal VC: plateau and compliance are physiological', () => {
    const b = run(new Mechanics(S({})));
    expect(b.pplat!).toBeGreaterThan(9); expect(b.pplat!).toBeLessThan(15);
    expect(b.cstat! * 1000).toBeGreaterThan(55); expect(b.cstat! * 1000).toBeLessThan(80);
    expect(b.vte * 1000).toBeGreaterThan(420);
  });
  it('stiff lung raises plateau; high resistance raises PIP but not plateau', () => {
    const n = run(new Mechanics(S({})));
    const l = normalLung(); l.comps.forEach((c) => (c.C *= 0.35)); const st = run(new Mechanics(S({}), l));
    const lr = normalLung(); lr.comps.forEach((c) => (c.R = 30)); const hr = run(new Mechanics(S({}), lr));
    expect(st.pplat! - n.pplat!).toBeGreaterThan(5);
    expect(hr.pip - n.pip).toBeGreaterThan(8); expect(Math.abs(hr.pplat! - n.pplat!)).toBeLessThan(2);
  });
  it('PC: delivered volume falls when compliance falls', () => {
    const n = run(new Mechanics(S({ mode: 'PC', pause: 0 })));
    const l = normalLung(); l.comps.forEach((c) => (c.C *= 0.35)); const st = run(new Mechanics(S({ mode: 'PC', pause: 0 }), l));
    expect(st.vti).toBeLessThan(n.vti * 0.65);
  });
  it('obstruction + high rate produces auto-PEEP that an expiratory hold reveals', () => {
    const l = normalLung(); l.comps.forEach((c) => { c.R = 25; c.rExp = 2; });
    const m = new Mechanics(S({ rr: 26, flow: 50, pause: 0, vt: 0.5 }), l); m.run(20); m.holdReq = 'e'; m.run(8);
    const hist = m.history.find((h) => h.peepTotal != null)!;
    expect(hist.peepTotal! - 5).toBeGreaterThan(3);
  });
  it('PEEP recruits a recruitable lung', () => {
    const mk = (peep: number) => { const l = normalLung(); l.comps.forEach((c) => { c.recruitable = 0.5; c.C *= 0.6; }); const m = new Mechanics(S({ peep, vt: 0.4, rr: 20 }), l); m.run(20); return m.regional()[0].open; };
    expect(mk(18)).toBeGreaterThan(mk(5) + 0.2);
  });
  it('bronchodilation (lower R) reduces PIP–Pplat gap', () => {
    const l = normalLung(); l.comps.forEach((c) => (c.R = 25)); const a = run(new Mechanics(S({}), l));
    const l2 = normalLung(); l2.comps.forEach((c) => (c.R = 8)); const b = run(new Mechanics(S({}), l2));
    expect(a.pip - a.pplat!).toBeGreaterThan(b.pip - b.pplat! + 4);
  });
  it('dyssynchrony emerges from timing mismatch and resolves with the right fix', () => {
    const psv = (cyc: number) => { const m = new Mechanics(S({ mode: 'PSV', ps: 14, cyclePct: cyc, pause: 0 }), normalLung(), { pmax: 5, rate: 18, ti: 1.3, expPush: 0 }); m.run(40); return m.recent(10); };
    expect(psv(60).prematureCycle).toBeGreaterThan(5); expect(psv(25).prematureCycle).toBeLessThan(2);
    const copd = () => { const l = normalLung(); l.comps.forEach((c) => { c.R = 20; c.rExp = 2; c.C = 0.08; c.flowLimit = 1.2; }); return l; };
    const del = (cyc: number) => { const m = new Mechanics(S({ mode: 'PSV', ps: 14, cyclePct: cyc }), copd(), { pmax: 6, rate: 16, ti: 0.8, expPush: 6 }); m.run(40); return m.recent(10); };
    expect(del(5).delayedCycle).toBeGreaterThan(2); expect(del(40).delayedCycle).toBe(0);
    const trig = (tf: number) => { const m = new Mechanics(S({ vt: 0.5, rr: 12, trigFlow: tf, pause: 0 }), copd(), { pmax: 4, rate: 22, ti: 1.0, expPush: 0 }); m.run(40); return m.recent(10).ineffectivePerMin; };
    expect(trig(6)).toBeGreaterThan(trig(1.5));
    const dbl = () => { const m = new Mechanics(S({ vt: 0.4, flow: 60, pause: 0, rr: 12 }), normalLung(), { pmax: 10, rate: 16, ti: 1.8, expPush: 0 }); m.run(40); return m.recent(10).doubleTrigger; };
    expect(dbl()).toBeGreaterThan(2);
  });
});

describe('synthetic patient', () => {
  it('normal patient has a normal ABG', () => {
    const s = settle(createPatient());
    expect(s.pH).toBeCloseTo(7.4, 1); expect(s.paco2).toBeGreaterThan(37); expect(s.paco2).toBeLessThan(43);
    expect(s.pao2).toBeGreaterThan(75); expect(s.lactate).toBeCloseTo(1, 0); expect(s.ag).toBeGreaterThan(9); expect(s.ag).toBeLessThan(14);
  });
  it('supplemental O2 fixes V/Q mismatch much more than shunt', () => {
    const d = (o: object) => settle(createPatient(o), 60).pao2;
    const vqGain = d({ lowVQ: 0.4, fio2: 0.6 }) - d({ lowVQ: 0.4 }); const shGain = d({ shunt: 0.4, fio2: 0.6 }) - d({ shunt: 0.4 });
    expect(vqGain).toBeGreaterThan(shGain * 2);
  });
  it('anaemia: SpO2 normal while CaO2 falls', () => {
    const a = settle(createPatient({ hb: 6 }), 60), n = settle(createPatient(), 60);
    expect(a.spo2).toBeGreaterThan(0.93); expect(a.cao2).toBeLessThan(n.cao2 * 0.5);
  });
  it('VBG is a venous sample: higher PCO2, lower pH, venous PO2', () => {
    const s = settle(createPatient(), 60);
    expect(s.vbg.pco2).toBeGreaterThan(s.paco2); expect(s.vbg.pH).toBeLessThan(s.pH); expect(s.vbg.po2).toBeLessThan(s.pao2 * 0.7);
  });
  it('hypoventilation (opioid) → respiratory acidosis; naloxone reverses it', () => {
    const st = createPatient({ drive: 0.4 }); let s = settle(st, 60); expect(s.paco2).toBeGreaterThan(60); expect(s.pH).toBeLessThan(7.3);
    give(st, 'naloxone'); s = advance(st, 30); expect(s.paco2).toBeLessThan(50);
  });
  it('kidneys compensate a chronic respiratory acidosis over ~48 h', () => {
    const st = createPatient({ setCO2: 60 }); const s0 = settle(st, 60); const s1 = advance(st, 48 * 60);
    expect(s1.hco3 - s0.hco3).toBeGreaterThan(4); expect(s1.pH).toBeGreaterThan(s0.pH + 0.05);
  });
  it('metabolic acidosis: spontaneous breathing follows Winter’s formula', () => {
    const s = settle(createPatient({ ketoneProd: 1, acidIsMineral: 0 }, { ketones: 15 }), 45);
    const e = 1.5 * s.hco3 + 8; expect(Math.abs(s.paco2 - e)).toBeLessThan(3);
  });
  it('shock → O2 debt → lactate rises', () => {
    const st = createPatient({ co: 1.8, hb: 8 }); const s = advance(st, 90); expect(s.lactate).toBeGreaterThan(3);
  });
  it('hyperkalaemia: calcium restores the membrane gap without lowering K; insulin lowers K; dialysis removes it', () => {
    const st = createPatient({ renal: 0.1, acidIsMineral: 0.8 }, { k: 7.4 }); const s0 = derive(st);
    give(st, 'calcium'); const s1 = advance(st, 5);
    expect(s1.gap).toBeGreaterThan(s0.gap + 4); expect(Math.abs(s1.k - s0.k)).toBeLessThan(0.2); expect(s1.kEffective).toBeLessThan(s0.kEffective - 1);
    give(st, 'insulin'); const s2 = advance(st, 45); expect(s2.k).toBeLessThan(s1.k - 0.6);
    const s3 = advance(st, 360); expect(s3.k).toBeGreaterThan(s2.k + 0.3); // shift wears off → rebound
    give(st, 'dialysis'); const s4 = advance(st, 240); expect(s4.k).toBeLessThan(4.5);
  });
  it('resting membrane potential depolarises as K rises', () => { expect(restingPotential(7)).toBeGreaterThan(restingPotential(4) + 8); });
  it('CKD-EPI 2021 and PBW', () => { expect(egfr(1.0, 50, 'M')).toBeGreaterThan(85); expect(egfr(3, 60, 'F')).toBeLessThan(20); expect(pbw('M', 175)).toBeCloseTo(70.6, 0); });
  it('apnoea raises PaCO2 ~3 mmHg/min', () => {
    const st = createPatient(); advance(st, 0.1, { vte: 0, rr: 0, fio2: 1, peep: 0, pmean: 0, pplat: 0, autoPeep: 0 }); const a = st.paco2; advance(st, 5);
    expect((st.paco2 - a) / 5).toBeGreaterThan(2); expect((st.paco2 - a) / 5).toBeLessThan(5);
  });
  it('hyponatraemia swells cells; fast correction of chronic hyponatraemia flags ODS risk', () => {
    const st = createPatient({ na: 118 }, { naBrain: 118 }); let s = derive(st); expect(s.cellVolume).toBeCloseTo(1, 1);
    st.p.na = 132; s = advance(st, 60); expect(s.odsRisk).toBeGreaterThan(0.3);
    const ac = createPatient({ na: 120 }, { naBrain: 140 }); expect(derive(ac).cellVolume).toBeGreaterThan(1.1);
  });
});

describe('ABG interpretation', () => {
  it('DKA: HAGMA with appropriate compensation', () => {
    const r = interpret({ pH: 7.21, paco2: 22, hco3: 9, na: 136, cl: 100, albumin: 4 });
    expect(r.primary).toEqual(['met acidosis']); expect(r.secondary).toEqual([]); expect(r.hagma).toBe(true);
  });
  it('met acidosis + resp acidosis (tiring patient)', () => {
    const r = interpret({ pH: 7.1, paco2: 35, hco3: 11 }); expect(r.secondary).toContain('resp acidosis');
  });
  it('acute vs chronic respiratory acidosis', () => {
    expect(interpret({ pH: 7.25, paco2: 60, hco3: 26 }).chronicity).toBe('acute');
    expect(interpret({ pH: 7.36, paco2: 60, hco3: 31 }).chronicity).toBe('chronic');
  });
  it('salicylate: resp alkalosis + HAGMA', () => {
    const r = interpret({ pH: 7.46, paco2: 22, hco3: 15, na: 140, cl: 103 });
    expect(r.primary).toContain('resp alkalosis'); expect(r.hagma).toBe(true);
  });
  it('A–a gradient', () => { const r = interpret({ pH: 7.4, paco2: 40, hco3: 24, pao2: 60, fio2: 0.21, age: 40 }); expect(r.aa!).toBeGreaterThan(35); });
});
