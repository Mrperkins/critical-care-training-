import { describe, it, expect } from 'vitest';
import { normalCoag, coagLabs, coagGive, stepCoag, COAG_PRESETS, viscoTrace } from '../src/physiology/coag';
import { createPatient, advance, derive } from '../src/physiology/patient';
import { bench } from '../src/labs/bench';
import { resolve } from '../src/director/timeline';
import { COAG_LESSON } from '../src/director/lessons/coag';

describe('coagulation engine', () => {
  it('normal values; presets land where the lesson says', () => {
    const n = coagLabs(normalCoag()); expect(n.inr).toBeCloseTo(1, 5); expect(n.aptt).toBeCloseTo(30, 5); expect(n.mcf).toBeGreaterThan(50); expect(n.ly30).toBeLessThan(3); expect(n.capacity).toBeGreaterThan(0.95);
    const w = coagLabs(COAG_PRESETS.warfarinBleed.make()); expect(w.inr).toBeGreaterThan(5.5); expect(w.factorPct).toBeLessThan(10);
    const h = coagLabs(COAG_PRESETS.heparinHigh.make()); expect(h.aptt).toBeGreaterThan(90); expect(h.inr).toBeLessThan(1.2);
    const t = coagLabs(COAG_PRESETS.traumaLysis.make()); expect(t.ly30).toBeGreaterThan(10); expect(t.fib).toBeLessThan(200);
  });
  it('warfarin at steady state holds the INR; stopping the block lets factors recover over a day', () => {
    const c = COAG_PRESETS.warfarinBleed.make(); const i0 = coagLabs(c).inr; for (let m = 0; m < 600; m += 5) stepCoag(c, 5); expect(Math.abs(coagLabs(c).inr - i0)).toBeLessThan(0.8);
    c.warfarin = 0; for (let m = 0; m < 1440; m += 5) stepCoag(c, 5); expect(coagLabs(c).inr).toBeLessThan(1.6);
  });
  it('liver failure lowers factor synthesis whatever the vitamin K', () => { const c = normalCoag(); for (let m = 0; m < 2880; m += 5) stepCoag(c, 5, 0.35); coagGive(c, 'vitkIV'); for (let m = 0; m < 720; m += 5) stepCoag(c, 5, 0.35); expect(coagLabs(c).inr).toBeGreaterThan(1.6); });
  it('the engine drives the patient’s lab values and the Labs bench; typing a value takes over', () => {
    const st = createPatient({}); st.coag = COAG_PRESETS.warfarinBleed.make(); advance(st, 1); expect(st.p.inr).toBeGreaterThan(5); expect(derive(st).coag!.inr).toBeCloseTo(st.p.inr, 6);
    bench.reset(); bench.startCoag('warfarinBleed'); expect(bench.value('inr')).toBeGreaterThan(5); bench.coag('pcc'); expect(bench.value('inr')).toBeLessThan(1.5);
    bench.set('inr', 3); expect(bench.pt.coag).toBeUndefined(); expect(bench.value('inr')).toBe(3);
  });
  it('the viscoelastic trace: late and low with warfarin, melting with hyperfibrinolysis', () => {
    const peak = (c: ReturnType<typeof normalCoag>) => Math.max(...viscoTrace(c).map((p) => p.a)); const onset = (c: ReturnType<typeof normalCoag>) => viscoTrace(c).find((p) => p.a > 2)!.t;
    expect(onset(COAG_PRESETS.warfarinBleed.make())).toBeGreaterThan(onset(normalCoag()) + 5);
    const l = viscoTrace(COAG_PRESETS.traumaLysis.make()); expect(l[l.length - 1].a).toBeLessThan(peak(COAG_PRESETS.traumaLysis.make()) * 0.8);
  });
});

describe('reversing anticoagulation lesson', () => {
  const inr = (t: number) => { resolve(COAG_LESSON, t); return bench.snap.coag!; };
  it('PCC now, rebound without vitamin K, stays down with it; protamine; TXA + fibrinogen', () => {
    expect(inr(14).inr).toBeGreaterThan(5.5); expect(inr(28).inr).toBeLessThan(1.5); expect(inr(41).inr).toBeGreaterThan(2.2); expect(inr(55).inr).toBeLessThan(1.3);
    expect(inr(68).aptt).toBeGreaterThan(90); expect(inr(81).aptt).toBeLessThan(35);
    const lysis = inr(94), fixed = inr(108); expect(lysis.fib).toBeLessThan(130); expect(fixed.ly30).toBeLessThan(lysis.ly30 / 2); expect(fixed.mcf).toBeGreaterThan(lysis.mcf + 4);
  });
  it('seeks exactly', () => { const a = inr(41).inr; inr(2); expect(inr(41).inr).toBeCloseTo(a, 9); });
});
