import { describe, it, expect } from 'vitest';
import { LabBench } from '../src/labs/bench';
import { cellModel, targetCounts, naAvailability } from '../src/labs/cell/model';
import { makeSim } from '../src/labs/cell/build';
import type { CellSim } from '../src/labs/cell/sim';

const run = (sim: CellSim, seconds: number) => { for (let t = 0; t < seconds; t += 1 / 30) sim.step(1 / 30); };
function setup(lab: string, patch = false, mutate?: (b: LabBench) => void) {
  const b = new LabBench(); mutate?.(b);
  const m = cellModel(lab, b.snap, b.pt)!; const sim = makeSim(m.story, m.cellType, patch ? 'patch' : 'cell');
  sim.setModel(m, targetCounts(m, sim.cfg.scale)); return { b, m, sim };
}
const siteCount = (sim: CellSim, kind: string) => sim.sites.filter((s) => s.kind === kind).reduce((a, s) => a + s.count, 0);

describe('cell model', () => {
  it('normal K⁺: pump → leak → resting potential chain; ~80 % of Na⁺ channels ready', () => {
    const { m } = setup('k');
    expect(m.story).toBe('membrane'); expect(m.cellType).toBe('cardiac'); expect(m.rmp).toBeLessThan(-80); expect(m.naAvail).toBeGreaterThan(0.7);
    expect(m.chain[0].focus).toEqual({ kind: 'transporter', t: 'pump' });
  });
  it('high K⁺ depolarises and inactivates Na⁺ channels; low K⁺ hyperpolarises', () => {
    const hi = setup('k', false, (b) => b.set('k', 7.5)).m, lo = setup('k', false, (b) => b.set('k', 2.5)).m, n = setup('k').m;
    expect(hi.rmp).toBeGreaterThan(n.rmp + 10); expect(hi.naAvail).toBeLessThan(0.4); expect(hi.kReturn).toBeGreaterThan(n.kReturn);
    expect(lo.rmp).toBeLessThan(n.rmp - 5); expect(hi.chain.some((c) => c.focus.kind === 'transporter' && c.focus.t === 'nachan')).toBe(true);
    expect(naAvailability(-83)).toBeGreaterThan(0.7); expect(naAvailability(-72)).toBeLessThan(0.4);
  });
  it('outside K⁺ particles follow plasma K⁺, gradients stay obvious', () => {
    const t = (k: number) => targetCounts(setup('k', false, (b) => b.set('k', k)).m, 1);
    expect(t(7.5).k!.out).toBeGreaterThan(t(4.2).k!.out + 3); expect(t(2.5).k!.out).toBeLessThan(t(4.2).k!.out);
    expect(t(4.2).k!.in).toBeGreaterThan(5 * t(4.2).k!.out); expect(t(4.2).na!.out).toBeGreaterThan(3 * t(4.2).na!.in);
  });
  it('insulin speeds the pump and moves K⁺ targets inside', () => {
    const { b } = setup('k', false, (x) => { x.pt.p.renal = 0.1; x.set('k', 7); });
    const before = targetCounts(cellModel('k', b.snap, b.pt)!, 1);
    b.give('insulin'); b.fastForward(45); const m = cellModel('k', b.snap, b.pt)!; const after = targetCounts(m, 1);
    expect(m.pumpRate).toBeGreaterThan(1.8); expect(m.kShiftIn).toBeGreaterThan(0.5);
    expect(after.k!.out).toBeLessThan(before.k!.out); expect(after.k!.in).toBeGreaterThan(before.k!.in);
    expect(m.chain[0].text).toMatch(/Insulin/);
  });
  it('sodium: acute low swells the neuron, chronic low has shed osmolytes', () => {
    const acute = setup('na', false, (b) => b.set('na', 120)).m; expect(acute.story).toBe('volume'); expect(acute.cellType).toBe('neuron'); expect(acute.volume).toBeGreaterThan(1.1);
    expect(acute.chain.some((c) => c.focus.kind === 'transporter' && c.focus.t === 'aqp')).toBe(true);
    const chronic = setup('na', false, (b) => { b.naMode = 'chronic'; b.set('na', 120); }).m;
    expect(chronic.adapted).toBe(true); expect(Math.abs(chronic.volume - 1)).toBeLessThan(0.02);
    expect(targetCounts(chronic, 1).osm!.in).toBeLessThan(targetCounts(acute, 1).osm!.in);
  });
  it('labs without a new scene return null (legacy view)', () => { const b = new LabBench(); expect(cellModel('hb', b.snap, b.pt)).toBeNull(); });
});

describe('cell simulator', () => {
  for (const patch of [false, true]) {
    it(`myocyte ${patch ? 'patch' : 'whole cell'}: steady state holds, everything crosses through transporters, nobody is in the wrong place`, () => {
      const { sim } = setup('k', patch); const t = sim.targets;
      run(sim, 40);
      expect(Math.abs(sim.count('k', 'out') - t.k!.out)).toBeLessThanOrEqual(3);
      expect(Math.abs(sim.count('na', 'in') - t.na!.in)).toBeLessThanOrEqual(patch ? 3 : 8);
      expect(siteCount(sim, 'pump')).toBeGreaterThan(patch ? 3 : 20); expect(siteCount(sim, 'kchan')).toBeGreaterThan(3); expect(siteCount(sim, 'nachan')).toBeGreaterThan(3);
      for (const p of sim.particles) if (p.state === 'free') { const d = sim.sdf(p.pos); if (p.comp === 'in') expect(d).toBeLessThan(0); else expect(d).toBeGreaterThan(0); }
      expect(sim.beats).toBeGreaterThan(30);
    });
  }
  it('raising K⁺ brings more K⁺ into the outside fluid', () => {
    const { b, sim } = setup('k'); run(sim, 5); const n0 = sim.count('k', 'out');
    b.set('k', 7.5); const m = cellModel('k', b.snap, b.pt)!; sim.setModel(m, targetCounts(m, 1)); run(sim, 20);
    expect(sim.count('k', 'out')).toBeGreaterThanOrEqual(sim.targets.k!.out - 2); expect(sim.targets.k!.out).toBeGreaterThan(n0 + 2);
    expect(sim.sites.filter((s) => s.kind === 'nachan' && s.inactivated).length).toBeGreaterThan(5);
  });
  it('acute hyponatraemia: water flows in through aquaporins and the neuron swells', () => {
    const { b, sim } = setup('na'); run(sim, 5); const w0 = sim.count('w', 'in'), a0 = siteCount(sim, 'aqp');
    b.set('na', 118); const m = cellModel('na', b.snap, b.pt)!; sim.setModel(m, targetCounts(m, 1)); run(sim, 15);
    expect(sim.vol).toBeGreaterThan(1.1); expect(sim.count('w', 'in')).toBeGreaterThan(w0 + 1); expect(siteCount(sim, 'aqp')).toBeGreaterThan(a0 + 4);
  });
  it('osmolytes leave through the osmolyte channel when the brain adapts', () => {
    const { b, sim } = setup('na'); b.set('na', 120); let m = cellModel('na', b.snap, b.pt)!; sim.setModel(m, targetCounts(m, 1)); run(sim, 5);
    const o0 = sim.count('osm', 'in'); b.fastForward(48 * 60); m = cellModel('na', b.snap, b.pt)!; sim.setModel(m, targetCounts(m, 1)); run(sim, 20);
    expect(sim.count('osm', 'in')).toBeLessThan(o0 - 2); expect(siteCount(sim, 'vrac')).toBeGreaterThan(2); expect(Math.abs(sim.vol - 1)).toBeLessThan(0.06);
  });
});
