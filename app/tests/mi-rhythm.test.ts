/**
 * Rhythms drive the ECG, the beat and the conduction impulse from one schedule. These tests check the schedules
 * (PR behaviour, dropped beats, AV dissociation), the QRS morphologies (bundle branch blocks, escape rhythms) and that
 * the impulse, the contraction and the ECG agree in time.
 */
import { describe, it, expect } from 'vitest';
import { RHYTHM, RHYTHMS, eventsBetween, rhythmVoltage, rhythmState, ventricularRate, atrialRate, rhythmsFor, PR_NORMAL } from '../src/infarct/engine/rhythm';
import { ventricularPart, T_QRS } from '../src/infarct/ecg/ecgModel';
import type { LeadId } from '../src/infarct/data/types';
import type { QrsKind } from '../src/infarct/ecg/ecgModel';

/** QRS duration (ms): span where the summed deflection across leads leaves the baseline */
function qrsMs(kind: QrsKind) {
  const leads: LeadId[] = ['I', 'II', 'V1', 'V6']; let first = -1, last = -1;
  for (let t = T_QRS - 0.02; t < T_QRS + 0.16; t += 0.001) {
    const big = leads.some((l) => Math.abs(ventricularPart(l, t, null, 0, 0, kind) - ventricularPart(l, T_QRS - 0.03, null, 0, 0, kind)) > 0.08);
    if (big) { if (first < 0) first = t; last = t; }
  }
  return (last - first) * 1000;
}
const extreme = (lead: LeadId, kind: QrsKind, from: number, to: number) => { let max = -9, min = 9; for (let t = T_QRS + from; t < T_QRS + to; t += 0.001) { const v = ventricularPart(lead, t, null, 0, 0, kind); max = Math.max(max, v); min = Math.min(min, v); } return { max, min }; };

describe('rhythm schedules', () => {
  it('sinus: one P per QRS at a constant PR', () => {
    const e = eventsBetween(RHYTHM.sinus, 0, 10);
    expect(ventricularRate(RHYTHM.sinus)).toBe(72);
    for (const q of e.ventricular) { const p = e.atrial.filter((a) => a.at <= q.at).pop()!; expect(q.at - p.at).toBeCloseTo(PR_NORMAL, 5); }
  });
  it('first-degree block: PR > 200 ms, every P conducted', () => {
    const e = eventsBetween(RHYTHM.firstDegree, 0, 10); expect(e.atrial.every((a) => a.conducted)).toBe(true);
    const q = e.ventricular[1]; const p = e.atrial.filter((a) => a.at <= q.at).pop()!; expect(q.at - p.at).toBeGreaterThan(0.2);
  });
  it('Wenckebach: the PR lengthens beat by beat, then a P is dropped', () => {
    const r = RHYTHM.wenckebach; const prs = r.ventricular.map((v) => v.at - r.atrial[v.fromP!]);
    expect(prs[1]).toBeGreaterThan(prs[0]); expect(prs[2]).toBeGreaterThan(prs[1]);
    expect(r.atrial.length - r.ventricular.length).toBe(1);
  });
  it('Mobitz II: constant PR then a sudden drop, with wide (bundle-branch) QRS', () => {
    const r = RHYTHM.mobitz2; const prs = new Set(r.ventricular.map((v) => +(v.at - r.atrial[v.fromP!]).toFixed(4)));
    expect(prs.size).toBe(1); expect(r.atrial.length - r.ventricular.length).toBe(1); expect(r.ventricular.every((v) => v.kind !== 'narrow')).toBe(true);
  });
  it('complete heart block: P waves and escape QRS complexes at their own unrelated rates', () => {
    for (const id of ['chbJunctional', 'chbVentricular'] as const) {
      const r = RHYTHM[id]; expect(r.ventricular.every((v) => v.fromP === null)).toBe(true);
      expect(atrialRate(r)).toBeGreaterThan(ventricularRate(r)); expect(ventricularRate(r)).toBeLessThan(50);
    }
    expect(RHYTHM.chbJunctional.ventricular[0].kind).toBe('narrow'); expect(RHYTHM.chbVentricular.ventricular[0].kind).toBe('ventricular');
  });
  it('suggestions follow the culprit anatomy: nodal blocks with inferior MI, infranodal and bundle blocks with anterior MI', () => {
    expect(rhythmsFor('inferior').map((r) => r.id)).toEqual(expect.arrayContaining(['sinusBrady', 'firstDegree', 'wenckebach', 'chbJunctional']));
    expect(rhythmsFor('anteroseptal').map((r) => r.id)).toEqual(expect.arrayContaining(['mobitz2', 'chbVentricular', 'rbbb', 'lbbb']));
    expect(rhythmsFor('inferior').map((r) => r.id)).not.toContain('mobitz2');
  });
});

describe('QRS morphology', () => {
  it('narrow QRS < 120 ms; bundle branch blocks and ventricular escape ≥ 120 ms', () => {
    expect(qrsMs('narrow')).toBeLessThan(120);
    for (const k of ['rbbb', 'lbbb', 'ventricular'] as QrsKind[]) expect(qrsMs(k)).toBeGreaterThanOrEqual(120);
  });
  it('RBBB: late positive R′ in V1 and a late negative (slurred S) in I and V6', () => {
    expect(extreme('V1', 'rbbb', 0.08, 0.13).max).toBeGreaterThan(0.3);
    expect(extreme('I', 'rbbb', 0.08, 0.13).min).toBeLessThan(-0.1); expect(extreme('V6', 'rbbb', 0.08, 0.13).min).toBeLessThan(-0.1);
  });
  it('LBBB: deep negative QS in V1, broad positive R in I and V6, no septal q in V6', () => {
    expect(extreme('V1', 'lbbb', 0, 0.15).min).toBeLessThan(-1); expect(extreme('V1', 'lbbb', 0, 0.15).max).toBeLessThan(0.15);
    expect(extreme('V6', 'lbbb', 0, 0.15).max).toBeGreaterThan(1); expect(extreme('I', 'lbbb', 0, 0.15).max).toBeGreaterThan(0.5);
    expect(extreme('V6', 'lbbb', 0, 0.025).min).toBeGreaterThan(-0.05);
  });
});

describe('ECG, beat and impulse share one timeline', () => {
  it('a dropped beat: the P wave appears, the impulse is blocked at the AV node, and the ventricles do not contract', () => {
    const r = RHYTHM.wenckebach; const pDrop = r.atrial[3];
    const s = rhythmState(r, pDrop + 0.12); expect(s.avBlocked).toBeGreaterThan(0.5); expect(s.phase).toMatch(/Blocked/);
    expect(rhythmState(r, pDrop + 0.35).vent).toBeLessThan(0.05);
    // and on the ECG: a P wave in II but no QRS in the next 300 ms
    let maxAbs = 0; for (let t = pDrop + 0.1; t < pDrop + 0.4; t += 0.002) maxAbs = Math.max(maxAbs, Math.abs(rhythmVoltage('II', t, r, null, 0)));
    expect(maxAbs).toBeLessThan(0.3);
  });
  it('a long PR holds the impulse in the AV node until just before the QRS', () => {
    const r = RHYTHM.firstDegree; const p = r.atrial[0]; const q = r.ventricular[0].at;
    expect(rhythmState(r, p + 0.15).avHold).toBe(1); expect(rhythmState(r, q + 0.005).avHold).toBe(0);
  });
  it('the His bundle fires 13 ms before the QRS and the ventricles contract after it', () => {
    const r = RHYTHM.sinus; const q = r.ventricular[0].at;
    expect(rhythmState(r, q - 0.013).msVent).toBeCloseTo(117, 0);
    expect(rhythmState(r, q).vent).toBeLessThan(0.02); expect(rhythmState(r, q + 0.2).vent).toBeGreaterThan(0.9);
  });
  it('every rhythm produces a finite ECG and a full set of states over a minute', () => {
    for (const r of RHYTHMS) for (let t = 0; t < 60; t += 0.37) { expect(Number.isFinite(rhythmVoltage('V1', t, r, null, 0))).toBe(true); expect(rhythmState(r, t).phase.length).toBeGreaterThan(3); }
  });
});
