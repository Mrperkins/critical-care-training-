import { describe, it, expect } from 'vitest';
import { concMcgPerMl, mlPerHour, mcgKgMin, dilute, bolusMl, mlPerHourFlat } from '../src/workflows/drip';
import { BLOOD_ADMIN, NORE_INFUSION, PUSH_DOSE, LINES_WORKFLOWS } from '../src/workflows/linesWorkflows';
import { evaluate } from '../src/workflows/workflow';
import { lines } from '../src/lines/session';

const run = (s: number) => { for (let i = 0; i < s * 20; i++) lines.tick(0.05); return { ...lines.num, hb: lines.pt.p.hb, svr: lines.effectiveSvr() }; };

describe('drip maths', () => {
  it('standard norepinephrine example', () => {
    const c = concMcgPerMl(4, 250); expect(c).toBe(16); expect(mlPerHour(0.1, 80, c)).toBeCloseTo(30, 9); expect(mcgKgMin(30, 80, c)).toBeCloseTo(0.1, 9);
  });
  it('round trip and flat dosing', () => {
    for (const [d, kg, c] of [[0.05, 70, 16], [0.3, 110, 32], [0.02, 50, 64]]) expect(mcgKgMin(mlPerHour(d, kg, c), kg, c)).toBeCloseTo(d, 12);
    expect(mlPerHourFlat(8, 16)).toBeCloseTo(30, 9); // 8 µg/min = 0.1 µg/kg/min at 80 kg
  });
  it('push-dose dilutions', () => {
    expect(dilute(10_000, 1, 100)).toBe(100); expect(bolusMl(100, 100)).toBe(1);
    expect(dilute(100, 1, 10)).toBe(10); // epinephrine 0.1 mg/mL (1 mL) into 10 mL → 10 µg/mL
  });
});

describe('Lines workflows', () => {
  it('every workflow: perfect run scores 100 and all effects reference real actions', () => {
    for (const wf of LINES_WORKFLOWS) {
      expect(evaluate(wf, wf.steps.map((s) => s.id), true).score).toBe(100);
      const ids = new Set([...wf.steps, ...wf.distractors].map((a) => a.id)); for (const k of Object.keys(wf.effects ?? {})) expect(ids.has(k)).toBe(true);
    }
  });
  it('transfusion raises Hb and MAP on the haemorrhage patient', () => {
    BLOOD_ADMIN.setup(); const a = run(4); BLOOD_ADMIN.effects!.start(); BLOOD_ADMIN.effects!.reassess(); const b = run(20);
    expect(b.hb).toBeCloseTo(a.hb + 2, 6); expect(b.map).toBeGreaterThan(a.map + 3);
  });
  it('norepinephrine start raises MAP in sepsis; the MAP-90 distractor overshoots', () => {
    NORE_INFUSION.setup(); const a = run(4); NORE_INFUSION.effects!.start(); const b = run(40);
    expect(b.map).toBeGreaterThan(a.map + 10); NORE_INFUSION.effects!.map90(); const c = run(40); expect(c.map).toBeGreaterThan(b.map + 5);
  });
  it('push-dose phenylephrine: MAP up and HR down, then fades', () => {
    PUSH_DOSE.setup(); const a = run(6); PUSH_DOSE.effects!.push(); const peak = run(20); const late = run(240);
    expect(peak.map).toBeGreaterThan(a.map + 6); expect(peak.hr).toBeLessThan(a.hr); expect(late.map).toBeLessThan(peak.map - 4); expect(Math.abs(late.map - a.map)).toBeLessThan(4);
  });
  it('reload clears pericardiocentesis relief and boluses (reproducible scenarios)', () => {
    lines.load('normal'); const n0 = run(6).hr;
    lines.load('tamponade'); lines.pericardiocentesis(); lines.pushDose('epinephrine', 10); run(10);
    lines.load('normal'); const n1 = run(6).hr; expect(n1).toBeCloseTo(n0, 6); expect(lines.boluses.length).toBe(0);
  });
});
