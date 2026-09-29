import { describe, it, expect } from 'vitest';
import { MECHANISMS, MECH, MOA_GROUPS, withContext } from '../src/moa/registry';
import { moaTimeline } from '../src/moa/moaTimeline';
import { resolve, duration } from '../src/director/timeline';
import type { MechanismDefinition } from '../src/moa/types';

const endOf = (d: MechanismDefinition) => { const tl = moaTimeline(d); resolve(tl, 0); const a = Object.fromEntries(d.patient!.readouts().map((r) => [r.id, r.value])); resolve(tl, duration(tl)); const b = Object.fromEntries(d.patient!.readouts().map((r) => [r.id, r.value])); return { a, b }; };
const ctx = (id: string, c: string) => endOf(withContext(MECH[id], c));

describe('MOA second wave', () => {
  it('every drug is in exactly one picker group; graph-only drugs say so', () => {
    const all = MOA_GROUPS.flatMap((g) => g.ids); expect(new Set(all).size).toBe(all.length); expect(all.sort()).toEqual(MECHANISMS.map((m) => m.id).sort());
    for (const id of ['txa', 'pcc', 'vitamink', 'protamine']) { expect(MECH[id].patient).toBeUndefined(); expect(MECH[id].patientNote).toMatch(/No coagulation model/); expect(() => resolve(moaTimeline(MECH[id]), 5)).not.toThrow(); }
  });
  it('clevidipine: SVR and MAP fall, slight reflex rise in rate', () => { const { a, b } = endOf(MECH.clevidipine); expect(b.svr).toBeLessThan(a.svr * 0.8); expect(b.map).toBeLessThan(a.map - 10); expect(b.hr).toBeGreaterThan(a.hr); });
  it('esmolol: rate and output fall, SVR does not', () => { const { a, b } = endOf(MECH.esmolol); expect(b.hr).toBeLessThan(a.hr - 12); expect(b.co).toBeLessThan(a.co); expect(b.svr).toBeGreaterThanOrEqual(a.svr * 0.99); });
  it('labetalol: SVR and MAP fall WITHOUT reflex tachycardia', () => { const { a, b } = endOf(MECH.labetalol); expect(b.svr).toBeLessThan(a.svr); expect(b.map).toBeLessThan(a.map - 8); expect(b.hr).toBeLessThan(a.hr); });
  it('nitroglycerin: CVP falls in both; output holds in LV failure but falls when preload-dependent', () => {
    const l = ctx('nitroglycerin', 'lvf'), p = ctx('nitroglycerin', 'preload');
    expect(l.b.cvp).toBeLessThan(l.a.cvp - 3); expect(l.b.co).toBeGreaterThanOrEqual(l.a.co * 0.98);
    expect(p.b.cvp).toBeLessThan(p.a.cvp); expect(p.b.co).toBeLessThan(p.a.co * 0.85); expect(p.b.map).toBeLessThan(p.a.map - 8);
  });
  it('milrinone: output up, resistance down', () => { const { a, b } = endOf(MECH.milrinone); expect(b.co).toBeGreaterThan(a.co * 1.2); expect(b.svr).toBeLessThan(a.svr); });
  it('dopamine: pressure effect grows through the dose bands; tachycardia at high dose', () => {
    const lo = ctx('dopamine', 'low'), mid = ctx('dopamine', 'mid'), hi = ctx('dopamine', 'high');
    expect(lo.b.svr).toBeLessThan(lo.a.svr); expect(mid.b.co).toBeGreaterThan(mid.a.co * 1.15); expect(hi.b.svr).toBeGreaterThan(hi.a.svr * 1.2);
    expect(hi.b.map - hi.a.map).toBeGreaterThan(lo.b.map - lo.a.map + 10); expect(hi.b.hr).toBeGreaterThan(hi.a.hr + 10);
  });
  it('etomidate barely moves the pressure; propofol drops it, much more in hypovolaemia', () => {
    const e = endOf(MECH.etomidate); expect(Math.abs(e.b.map - e.a.map)).toBeLessThan(4);
    const n = ctx('propofol', 'normal'), h = ctx('propofol', 'hypo'); expect(n.b.map).toBeLessThan(n.a.map); expect(h.a.map - h.b.map).toBeGreaterThan(n.a.map - n.b.map + 5);
    expect(MECH.propofol.nodes.some((x) => x.id === 'resp')).toBe(true);
  });
  it('midazolam, fentanyl, dexmedetomidine: expected haemodynamic directions; dexmedetomidine spares breathing', () => {
    const m = endOf(MECH.midazolam); expect(m.b.map).toBeLessThan(m.a.map);
    const fc = ctx('fentanyl', 'calm'), fs = ctx('fentanyl', 'stress'); expect(fc.b.hr).toBeLessThan(fc.a.hr); expect(fs.a.map - fs.b.map).toBeGreaterThan(fc.a.map - fc.b.map);
    const d = endOf(MECH.dexmedetomidine); expect(d.b.hr).toBeLessThan(d.a.hr - 12); expect(MECH.dexmedetomidine.edges.find((e) => e.to === 'resp')?.effect).toBe('none');
  });
  it('succinylcholine: small K⁺ rise normally, dangerous rise with up-regulated receptors (bench membrane model)', () => {
    const n = ctx('succinylcholine', 'normal'), u = ctx('succinylcholine', 'upreg');
    expect(n.b.k - n.a.k).toBeCloseTo(0.5, 1); expect(u.b.k).toBeGreaterThan(7.2); expect(u.b.qrs).toBeGreaterThan(n.b.qrs);
  });
  it('mannitol lowers ICP and raises CPP on the neuro ICP model', () => { const { a, b } = endOf(MECH.mannitol); expect(b.icp).toBeLessThan(a.icp - 15); expect(b.cpp).toBeGreaterThan(a.cpp + 15); });
  it('nimodipine lowers systemic pressure and is shown NOT to reverse angiographic spasm', () => { const { a, b } = endOf(MECH.nimodipine); expect(b.map).toBeLessThan(a.map); expect(MECH.nimodipine.edges.find((e) => e.to === 'spasm')?.effect).toBe('none'); });
  it('thrombolysis: occlusion falls, MCA flow rises, penumbra is saved', () => { const { a, b } = endOf(MECH.thrombolytic); expect(b.occl).toBeLessThan(a.occl - 50); expect(b.cbf).toBeGreaterThan(a.cbf + 10); expect(b.core).toBeLessThanOrEqual(a.core); expect(b.pen).toBeLessThan(a.pen); });
  it('ipratropium lowers airway resistance on the ventilator engine (COPD)', () => { const { a, b } = endOf(MECH.ipratropium); expect(b.pip).toBeLessThan(a.pip); expect(b.gap).toBeLessThan(a.gap); });
});
