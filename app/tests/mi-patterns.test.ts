/**
 * STEMI equivalents: the ECG model must meet each pattern's published criteria, and the scene data must tell the
 * heart what kind of lesion and how deep an injury to draw.
 */
import { describe, it, expect } from 'vitest';
import { EQUIVALENT, EQUIVALENTS } from '../src/infarct/data/patterns';
import { TERRITORIES } from '../src/infarct/data/territories';
import { FOCUS, sceneFor, seqKeysFor, transmuralOf, lesionOf, focusOf } from '../src/infarct/data/focus';
import { stDeviationMm, jPointMm, tWaveMm, qDepthMm, rHeightMm } from '../src/infarct/ecg/ecgModel';
import { sequenceScene } from '../src/infarct/engine/store';
import type { LeadId } from '../src/infarct/data/types';

const P = (id: string) => EQUIVALENT[id].ecgPattern;
const TWELVE: LeadId[] = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'];

describe('left main / aVR pattern', () => {
  const p = P('leftMain');
  it('ST elevation in aVR ≥ 1 mm, greater than in V1', () => {
    expect(stDeviationMm('aVR', p)).toBeGreaterThanOrEqual(1);
    expect(stDeviationMm('aVR', p)).toBeGreaterThan(stDeviationMm('V1', p));
  });
  it('ST depression ≥ 1 mm in at least six leads, including I, II and V4–V6', () => {
    const dep = TWELVE.filter((l) => stDeviationMm(l, p) <= -1);
    expect(dep.length).toBeGreaterThanOrEqual(6);
    for (const l of ['I', 'II', 'V5', 'V6'] as LeadId[]) expect(dep).toContain(l);
  });
  it('no localised ST elevation elsewhere and no Q waves (not a transmural territory)', () => {
    for (const l of TWELVE.filter((x) => x !== 'aVR')) expect(stDeviationMm(l, p)).toBeLessThan(0.5);
    for (const l of TWELVE) expect(qDepthMm(l, p)).toBeCloseTo(qDepthMm(l, null), 3);
  });
});

describe('de Winter T waves', () => {
  const p = P('deWinter');
  it('1–3 mm upsloping J-point depression across V2–V5', () => {
    for (const l of ['V2', 'V3', 'V4', 'V5'] as LeadId[]) { const j = jPointMm(l, p); expect(j).toBeLessThanOrEqual(-1); expect(j).toBeGreaterThanOrEqual(-3.2); }
    // upsloping: less depressed 60 ms later than at the J point
    for (const l of ['V2', 'V3', 'V4'] as LeadId[]) expect(stDeviationMm(l, p)).toBeGreaterThan(jPointMm(l, p));
  });
  it('tall T waves in V2–V4, clearly taller than normal', () => {
    for (const l of ['V2', 'V3', 'V4'] as LeadId[]) expect(tWaveMm(l, p).max).toBeGreaterThan(tWaveMm(l, null).max * 1.35);
  });
  it('no precordial ST elevation; slight elevation in aVR', () => {
    for (const l of ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'] as LeadId[]) expect(stDeviationMm(l, p)).toBeLessThan(0.3);
    expect(jPointMm('aVR', p)).toBeGreaterThan(0.3); expect(jPointMm('aVR', p)).toBeLessThan(1.5);
  });
});

describe('Wellens syndrome', () => {
  it('type B: deep symmetric T inversion in V2–V3 (≥ 2 mm), ST < 1 mm, R waves preserved, no Q waves', () => {
    const p = P('wellensB');
    for (const l of ['V2', 'V3'] as LeadId[]) {
      expect(tWaveMm(l, p).min).toBeLessThan(-2); expect(tWaveMm(l, p).max).toBeLessThan(1);
      expect(Math.abs(stDeviationMm(l, p))).toBeLessThan(1);
      expect(rHeightMm(l, p)).toBeCloseTo(rHeightMm(l, null), 3); expect(qDepthMm(l, p)).toBeCloseTo(qDepthMm(l, null), 3);
    }
  });
  it('type A: biphasic T in V2–V3 — an upright limb then a terminal negative limb', () => {
    const p = P('wellensA');
    for (const l of ['V2', 'V3'] as LeadId[]) { const t = tWaveMm(l, p); expect(t.max).toBeGreaterThan(1); expect(t.min).toBeLessThan(-1); expect(Math.abs(stDeviationMm(l, p))).toBeLessThan(1); }
  });
  it('the limb and lateral leads are left normal', () => {
    for (const id of ['wellensA', 'wellensB']) for (const l of ['I', 'II', 'aVF', 'V6'] as LeadId[]) expect(tWaveMm(l, P(id)).min).toBeGreaterThan(-0.5);
  });
  it('sequence: occludes (thrombus, perfusion lost), re-opens, and only then the T waves change', () => {
    const occluded = sceneFor('wellensB', 0.48), reopened = sceneFor('wellensB', 0.99);
    expect(occluded.perfusionLoss).toBeGreaterThan(0.6); expect(occluded.ecgMorph).toBeLessThan(0.05);
    expect(reopened.perfusionLoss).toBeLessThan(0.05); expect(reopened.reperfusion).toBe(1); expect(reopened.ecgMorph).toBe(1);
    expect(seqKeysFor('wellensB').map((k) => k.label)).toContain('Re-opens');
  });
});

describe('equivalents in the MI Locator', () => {
  it('are rendered like territories but are not in the territory lessons or practice cases', () => {
    for (const e of EQUIVALENTS) { expect(FOCUS[e.id]).toBe(e); expect(TERRITORIES.find((t) => t.id === e.id)).toBeUndefined(); }
    expect(focusOf('inferior')?.id).toBe('inferior');
  });
  it('carry lesion type and depth of injury for the heart and the short-axis slice', () => {
    expect(lesionOf(focusOf('leftMain'))).toBe('near-occlusion'); expect(lesionOf(focusOf('deWinter'))).toBe('occlusion'); expect(lesionOf(focusOf('wellensA'))).toBe('stenosis');
    expect(transmuralOf(focusOf('leftMain'))).toBeLessThan(0.5); expect(transmuralOf(focusOf('inferior'))).toBe(1);
    expect(sceneFor('inferior', 0.7)).toEqual(sequenceScene(0.7));
  });
  it('every criterion names real leads and each pattern has an action', () => {
    for (const e of EQUIVALENTS) { expect(e.criteria.length).toBeGreaterThan(1); expect(e.action.length).toBeGreaterThan(10); for (const c of e.criteria) for (const l of c.leads) expect(TWELVE.concat(['V7', 'V8', 'V9', 'V3R', 'V4R'] as LeadId[])).toContain(l); }
  });
});
