// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { wiggers, valveSpecs, H_BASE, heartRateFor } from '../src/heart/beat';

const sample = (hr: number, n = 600) => { const rr = 60 / hr; return Array.from({ length: n }, (_, i) => ({ t: (i / n) * rr, ...wiggers((i / n) * rr, hr) })); };

describe('cardiac cycle timing (Wiggers)', () => {
  it('never has the AV and semilunar valves open together (isovolumic phases between them)', () => {
    for (const hr of [50, 84, 140, 180]) for (const s of sample(hr)) expect(Math.min(s.avOpen, s.slOpen), `hr ${hr} t ${s.t.toFixed(3)}`).toBeLessThan(0.05);
  });
  it('changes ventricular volume only while a valve is open (isovolumic phases hold still)', () => {
    for (const hr of [60, 84, 140]) { const s = sample(hr, 2000);
      for (let i = 1; i < s.length; i++) { const dv = Math.abs(s[i].v - s[i - 1].v); if (s[i].avOpen < 0.001 && s[i].slOpen < 0.001 && s[i - 1].avOpen < 0.001 && s[i - 1].slOpen < 0.001) expect(dv, `hr ${hr} t ${s[i].t.toFixed(3)}`).toBeLessThan(1e-3); }
      // empties during ejection, refills during filling
      const ej = s.filter((x) => x.slOpen > 0.9); expect(ej[ej.length - 1].v).toBeGreaterThan(ej[0].v + 0.5);
    }
  });
  it('contracts the atria just before ventricular systole (late diastole)', () => {
    const s = sample(84); const peak = s.reduce((a, b) => (b.atr > a.atr ? b : a)); expect(peak.phase).toBeGreaterThan(0.8);
  });
  it('shortens diastole far more than systole as the rate rises', () => {
    const slow = wiggers(0, 60), fast = wiggers(0, 150);
    expect(fast.systole / slow.systole).toBeGreaterThan(0.6);
    expect((fast.rr - fast.systole) / (slow.rr - slow.systole)).toBeLessThan(0.45);
  });
  it('runs neonatal flows at a neonatal rate', () => { expect(heartRateFor(0.8)).toBeGreaterThan(120); expect(heartRateFor(5)).toBeLessThan(100); });
});

describe('heart deformation geometry', () => {
  it('has an adult long axis and valve radii in the right range', () => {
    expect(H_BASE * 100).toBeGreaterThan(50); expect(H_BASE * 100).toBeLessThan(110); // mm, apex → AV junction
    const v = valveSpecs({});
    expect(v.mitral.kind).toBe(1); expect(v.aortic_valve.kind).toBe(2);
    // the mitral flow axis points into the LV (toward the apex: down and toward the patient's left)
    expect(v.mitral.ax.y).toBeLessThan(0); expect(v.mitral.ax.x).toBeGreaterThan(0);
    // the aortic flow axis points up out of the heart
    expect(v.aortic_valve.ax.y).toBeGreaterThan(0.5);
  });
});
