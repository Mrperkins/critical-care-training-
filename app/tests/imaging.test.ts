import { describe, it, expect } from 'vitest';
import { render } from '../src/neuro/imaging/synth';
import { emptyNeuro, type NeuroState } from '../src/neuro/perfusion';
import { presetState, useNeuroUI } from '../src/neuro/neuroStore';
import { STROKE_TIME_MACHINE } from '../src/director/lessons/neuro';
import { resolve, duration } from '../src/director/timeline';

const N = 120;
/** mean grey level in a box given in local units (x lateral: + = patient left = image right; z anterior) */
function mean(img: { rgba: Uint8ClampedArray }, x0: number, x1: number, z0: number, z1: number, ch = 0) {
  let s = 0, n = 0; const E = 1.2;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const x = (i / (N - 1) * 2 - 1) * E, z = -((j / (N - 1) * 2 - 1) * E); if (x >= x0 && x <= x1 && z >= z0 && z <= z1) { s += img.rgba[(j * N + i) * 4 + ch]; n++; } }
  return s / n;
}
const m1 = (min: number): NeuroState => ({ ...presetState('m1_L'), minutes: min });

describe('synthetic clinical imaging', () => {
  it('normal NCCT is left–right symmetric', () => { const a = render('ncct', emptyNeuro(), -0.2, N); expect(Math.abs(mean(a, 0.4, 0.8, -0.2, 0.3) - mean(a, -0.8, -0.4, -0.2, 0.3))).toBeLessThan(6); });
  it('an established left MCA infarct is hypodense on NCCT', () => { const a = render('ncct', m1(480), -0.2, N); expect(mean(a, 0.4, 0.8, -0.2, 0.3)).toBeLessThan(mean(a, -0.8, -0.4, -0.2, 0.3) - 15); });
  it('CT perfusion shows low left MCA flow; CTA shows fewer left branches', () => {
    const cbf = render('cbf', m1(60), -0.2, N); const cta = render('cta', m1(60), -0.3, N); const ctaN = render('cta', emptyNeuro(), -0.3, N);
    // flow colour: red+green channels drop on the ischaemic side
    const L = mean(cbf, 0.4, 0.85, -0.2, 0.3, 1) + mean(cbf, 0.4, 0.85, -0.2, 0.3, 0), R = mean(cbf, -0.85, -0.4, -0.2, 0.3, 1) + mean(cbf, -0.85, -0.4, -0.2, 0.3, 0);
    expect(L).not.toBeCloseTo(R, 0);
    expect(mean(cta, 0.3, 1, -0.6, 0.6)).toBeLessThan(mean(ctaN, 0.3, 1, -0.6, 0.6));
  });
  it('ICH is hyperdense', () => { const a = render('ncct', presetState('ich'), -0.22, N); expect(mean(a, 0.25, 0.4, 0.0, 0.15)).toBeGreaterThan(mean(a, -0.4, -0.25, 0.0, 0.15) + 60); });
});

describe('stroke time machine', () => {
  it('reperfusion at 150 min freezes the core; the lesson seeks exactly', () => {
    resolve(STROKE_TIME_MACHINE, duration(STROKE_TIME_MACHINE)); const s = useNeuroUI.getState().state; expect(s.recanalizedAt).toBe(150); expect(s.minutes).toBe(1440);
    const a = JSON.stringify(s); resolve(STROKE_TIME_MACHINE, 20); resolve(STROKE_TIME_MACHINE, duration(STROKE_TIME_MACHINE)); expect(JSON.stringify(useNeuroUI.getState().state)).toBe(a);
    resolve(STROKE_TIME_MACHINE, 30); expect(useNeuroUI.getState().view).toBe('imaging');
  });
});
