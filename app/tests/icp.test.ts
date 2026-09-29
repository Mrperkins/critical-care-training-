import { describe, it, expect } from 'vitest';
import { icpState, icpOfVolume, icpWave, icpFindings, ICP_DEFAULT, type IcpInput } from '../src/neuro/icp';
import { presetState } from '../src/neuro/neuroStore';
import { DEFAULT_SYSTEMIC, type NeuroState, type Systemic } from '../src/neuro/perfusion';

const ich = (ml: number, minutes = 0): NeuroState => { const s = presetState('ich'); return { ...s, minutes, hemorrhage: { ...s.hemorrhage!, volumeMl: ml } }; };
const sys = (p: Partial<Systemic> = {}): Systemic => ({ ...DEFAULT_SYSTEMIC, ...p });
const I = (p: Partial<IcpInput> = {}): IcpInput => ({ ...ICP_DEFAULT, ...p });

describe('Monro–Kellie ICP on the neuro state', () => {
  it('pressure–volume curve: flat, then exponential past the knee', () => {
    const d1 = icpOfVolume(10, 25) - icpOfVolume(0, 25), d2 = icpOfVolume(45, 25) - icpOfVolume(35, 25);
    expect(d1).toBeLessThan(1.5); expect(d2).toBeGreaterThan(8 * d1); expect(icpOfVolume(-10, 25)).toBeLessThan(10);
  });
  it('a growing haematoma: compensated, then high ICP with P2 > P1, falling CPP, midline shift, uncal then tonsillar herniation', () => {
    const a = icpState(ich(20), sys()), b = icpState(ich(48), sys()), c = icpState(ich(57), sys()), d = icpState(ich(70), sys());
    expect(a.icp).toBeLessThan(15); expect(a.p2p1).toBeLessThan(1); expect(a.herniation).toBe('none'); expect(a.pupils.L.reactive).toBe(true);
    expect(b.icp).toBeGreaterThan(22); expect(b.p2p1).toBeGreaterThan(1); expect(b.cpp).toBeLessThan(a.cpp - 10); expect(b.shiftMm).toBeGreaterThan(a.shiftMm);
    expect(['early uncal', 'uncal']).toContain(b.herniation);
    expect(c.herniation).toBe('uncal'); expect(c.pupils.L.mm).toBeGreaterThan(6); expect(c.pupils.L.reactive).toBe(false); expect(c.pupils.R.reactive).toBe(true); expect(c.gcsCap).toBeLessThanOrEqual(8);
    expect(d.herniation).toBe('tonsillar'); expect(d.pupils.R.reactive).toBe(false); expect(d.posture).not.toBe('none');
  });
  it('Cushing response: hypertension and bradycardia only when ICP is very high', () => {
    expect(icpState(ich(48), sys()).cushing).toBe(false);
    const c = icpState(ich(62), sys()); expect(c.cushing).toBe(true); expect(c.map).toBeGreaterThan(110); expect(c.hr).toBeLessThan(60); expect(c.resp).not.toBe('regular');
  });
  it('temporising measures act on the same volume: head-up, brief hyperventilation, osmotherapy, evacuation', () => {
    const base = icpState(ich(50), sys(), I({ headUp: 0 })).icp;
    expect(icpState(ich(50), sys(), I({ headUp: 30 })).icp).toBeLessThan(base);
    expect(icpState(ich(50), sys({ paco2: 32 }), I({ headUp: 0 })).icp).toBeLessThan(base);
    expect(icpState(ich(50), sys({ paco2: 55 }), I({ headUp: 0 })).icp).toBeGreaterThan(base);
    expect(icpState(ich(50), sys(), I({ headUp: 0, osmoMl: 15 })).icp).toBeLessThan(base - 8);
    expect(icpState(ich(50), sys(), I({ decompressed: true })).icp).toBeLessThan(15);
  });
  it('the haematoma grows at high blood pressure → higher ICP later (same state, same model)', () => {
    expect(icpState(ich(40, 180), sys({ map: 130 })).icp).toBeGreaterThan(icpState(ich(40, 180), sys({ map: 95 })).icp);
  });
  it('hydrocephalus: CSF accumulates → central herniation; an EVD holds ICP at the chamber height; levelling errors and clamping', () => {
    const sah = { ...presetState('sah'), minutes: 180 }; const h = I({ hydrocephalus: true });
    const noEvd = icpState(sah, sys(), h); expect(noEvd.icp).toBeGreaterThan(30); expect(noEvd.herniation).toBe('central'); expect(noEvd.shiftMm).toBe(0);
    const open = icpState(sah, sys(), I({ hydrocephalus: true, evd: { open: true, heightCm: 15, levelErrorCm: 0 } }));
    expect(open.icp).toBeCloseTo(15 / 1.36, 0); expect(open.evd!.drainingMlH).toBeGreaterThan(0); expect(open.evd!.overdrainage).toBe(false);
    const raised = icpState(sah, sys(), I({ hydrocephalus: true, evd: { open: true, heightCm: 15, levelErrorCm: 15 } }));
    expect(raised.icp).toBeLessThan(open.icp - 5); expect(raised.evd!.overdrainage).toBe(true);
    const clamped = icpState(sah, sys(), I({ hydrocephalus: true, evd: { open: false, heightCm: 15, levelErrorCm: 0 } }));
    expect(clamped.icp).toBeCloseTo(noEvd.icp, 5); expect(clamped.evd!.clampedHigh).toBe(true);
    expect(icpFindings(raised).join(' ')).toMatch(/overdraining/);
  });
  it('the waveform: taller P2 when compliance is poor', () => {
    const w = (ml: number) => { const s = icpState(ich(ml), sys()); const v = icpWave(s, 100); return v[30] - v[14]; }; // P2 − P1 heights
    expect(w(20)).toBeLessThan(0); expect(w(50)).toBeGreaterThan(0);
  });
});

describe('ICP lesson', async () => {
  const { ICP_LESSON } = await import('../src/director/lessons/icp');
  const { resolve } = await import('../src/director/timeline');
  const { useNeuroUI } = await import('../src/neuro/neuroStore');
  const { useIcpUI } = await import('../src/neuro/icpStore');
  const at = (id: string) => { resolve(ICP_LESSON, ICP_LESSON.cues.find((c) => c.id === id)!.at + 1); const n = useNeuroUI.getState(); return icpState(n.state, n.sys, useIcpUI.getState().input); };
  it('walks the curve, herniates, treats, then hydrocephalus and the EVD', () => {
    expect(at('icp-1').icp).toBeLessThan(11); expect(at('icp-2').icp).toBeLessThan(15); expect(at('icp-3').icp).toBeGreaterThan(22);
    expect(at('icp-4').cpp).toBeLessThan(at('icp-3').cpp - 15);
    expect(at('icp-5').herniation).toBe('uncal'); expect(at('icp-6').cushing).toBe(true);
    expect(at('icp-7').icp).toBeLessThan(at('icp-5').icp - 15); expect(at('icp-8').icp).toBeLessThan(15);
    expect(at('icp-9').herniation).toBe('central'); expect(at('icp-10').icp).toBeLessThan(13); expect(at('icp-11').evd!.overdrainage).toBe(true); expect(at('icp-12').evd!.clampedHigh).toBe(true);
  });
  it('seeking is exact', () => { const a = JSON.stringify(at('icp-10')); at('icp-3'); expect(JSON.stringify(at('icp-10'))).toBe(a); });
});
describe('ICP lesson ordering', async () => {
  const { ICP_LESSON } = await import('../src/director/lessons/icp');
  const { resolve } = await import('../src/director/timeline');
  const { useNeuroUI } = await import('../src/neuro/neuroStore');
  const { useIcpUI } = await import('../src/neuro/icpStore');
  it('uncal herniation appears before the Cushing response', () => {
    const at = (id: string) => { resolve(ICP_LESSON, ICP_LESSON.cues.find((c) => c.id === id)!.at + 1); const n = useNeuroUI.getState(); return icpState(n.state, n.sys, useIcpUI.getState().input); };
    const u = at('icp-5'); expect(u.herniation).toBe('uncal'); expect(u.cushing).toBe(false); expect(at('icp-6').cushing).toBe(true); expect(at('icp-6').herniation).toBe('uncal');
  });
});
