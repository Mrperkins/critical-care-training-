import { describe, it, expect } from 'vitest';
import { emptyAbdomen, evolve, fastExam, shockClass, bloodLoss, fluidDistribution, abdomenFindings } from '../src/abdomen/state';
import { ABD_PRESETS, currentAbdomen } from '../src/abdomen/abdomenStore';

const win = (st: ReturnType<typeof emptyAbdomen>, id: string) => fastExam(st).find((w) => w.id === id)!;

describe('abdomen state', () => {
  it('normal abdomen: no fluid, FAST negative, class I', () => {
    const st = evolve(emptyAbdomen(), 120);
    expect(st.freeFluidMl).toBe(0);
    expect(fastExam(st).some((w) => w.positive)).toBe(false);
    expect(shockClass(st).cls).toBe(1);
  });
  it('evolve is pure and accumulates blood monotonically', () => {
    const s0 = { ...emptyAbdomen(), injury: { spleen: 4 } }; const snap = JSON.stringify(s0);
    const a = evolve(s0, 30), b = evolve(s0, 60);
    expect(JSON.stringify(s0)).toBe(snap);
    expect(b.freeFluidMl).toBeGreaterThan(a.freeFluidMl);
    expect(a.freeFluidMl).toBeGreaterThan(0);
    expect(evolve(s0, 60)).toEqual(b);
  });
  it('evolve composes: two steps equal one (seekable)', () => {
    const s0 = { ...emptyAbdomen(), injury: { spleen: 4, liver: 2 }, ischaemia: 0.2 };
    const a = evolve(evolve(s0, 25), 35), b = evolve(s0, 60);
    expect(a.freeFluidMl).toBeCloseTo(b.freeFluidMl, 6); expect(a.ischaemia).toBeCloseTo(b.ischaemia, 9); expect(a.minutes).toBe(60);
  });
  it('grade IV spleen: class II–III by an hour, class IV by three hours untreated', () => {
    const s0 = ABD_PRESETS.find((x) => x.id === 'spleen4')!.make();
    expect([2, 3]).toContain(shockClass(evolve(s0, 60)).cls);
    expect(shockClass(evolve(s0, 180)).cls).toBe(4);
  });
  it('higher grade bleeds faster', () => {
    const lo = evolve({ ...emptyAbdomen(), injury: { spleen: 2 } }, 60), hi = evolve({ ...emptyAbdomen(), injury: { spleen: 5 } }, 60);
    expect(hi.freeFluidMl).toBeGreaterThan(2 * lo.freeFluidMl);
  });
  it('FAST needs a threshold volume before any window turns positive', () => {
    const small = { ...emptyAbdomen(), injury: { liver: 3 }, freeFluidMl: 60 };
    expect(fastExam(small).some((w) => w.positive)).toBe(false);
    const big = { ...small, freeFluidMl: 600 };
    expect(fastExam(big).some((w) => w.positive)).toBe(true);
  });
  it('liver bleeds show in Morison’s pouch first, spleen in the splenorenal space', () => {
    const liver = { ...emptyAbdomen(), injury: { liver: 3 }, freeFluidMl: 250 };
    const spleen = { ...emptyAbdomen(), injury: { spleen: 3 }, freeFluidMl: 250 };
    expect(win(liver, 'ruq').ml).toBeGreaterThan(win(liver, 'luq').ml);
    expect(win(spleen, 'luq').ml).toBeGreaterThan(win(spleen, 'ruq').ml * 0.9);
    expect(win(liver, 'ruq').positive).toBe(true);
    // pelvis fills as volume rises
    expect(win({ ...liver, freeFluidMl: 1000 }, 'pelvis').ml).toBeGreaterThan(win(liver, 'pelvis').ml);
  });
  it('distribution conserves volume', () => {
    const st = { ...emptyAbdomen(), injury: { spleen: 4 }, freeFluidMl: 1234 }; const d = fluidDistribution(st);
    expect(d.ruq + d.luq + d.pelvis + d.gutters).toBeCloseTo(1234, 6);
  });
  it('contained AAA rupture: large blood loss, FAST negative (retroperitoneal)', () => {
    const p = ABD_PRESETS.find((x) => x.id === 'aaaContained')!; const st = evolve(p.make(), 60);
    expect(st.retroMl).toBeGreaterThan(1000);
    expect(fastExam(st).some((w) => w.positive)).toBe(false);
    expect(shockClass(st).cls).toBeGreaterThanOrEqual(2);
    expect(abdomenFindings(st).some((f) => /does not see/.test(f))).toBe(true);
  });
  it('free AAA rupture: FAST positive and class IV quickly', () => {
    const st = evolve(ABD_PRESETS.find((x) => x.id === 'aaaFree')!.make(), 20);
    expect(fastExam(st).some((w) => w.positive)).toBe(true);
    expect(shockClass(st).cls).toBe(4);
  });
  it('shock class rises with loss; HR up, SBP down, urine down', () => {
    const at = (ml: number) => shockClass({ ...emptyAbdomen(), freeFluidMl: ml });
    const c = [300, 1000, 1700, 2500].map(at);
    expect(c.map((x) => x.cls)).toEqual([1, 2, 3, 4]);
    for (let i = 1; i < c.length; i++) { expect(c[i].hr).toBeGreaterThan(c[i - 1].hr); expect(c[i].sbp).toBeLessThanOrEqual(c[i - 1].sbp); expect(c[i].urine).toBeLessThanOrEqual(c[i - 1].urine); }
    expect(c[0].sbp).toBeGreaterThanOrEqual(118); expect(c[1].sbp).toBeGreaterThanOrEqual(105); // pressure holds through class II
  });
  it('non-blood fluid is not counted as blood loss', () => {
    expect(bloodLoss({ ...emptyAbdomen(), freeFluidMl: 800, fluidKind: 'ascites' })).toBe(0);
  });
  it('mesenteric ischaemia progresses with time', () => {
    const p = ABD_PRESETS.find((x) => x.id === 'mesenteric')!.make();
    expect(evolve(p, 240).ischaemia).toBeGreaterThan(p.ischaemia);
    expect(abdomenFindings(evolve(p, 240)).join(' ')).toMatch(/out of proportion/);
  });
  it('every preset evolves and yields findings deterministically', () => {
    for (const p of ABD_PRESETS) {
      const a = currentAbdomen({ base: p.make(), minutes: 45 }), b = currentAbdomen({ base: p.make(), minutes: 45 });
      expect(a).toEqual(b);
      if (p.id !== 'normal') expect(abdomenFindings(a).length).toBeGreaterThan(0);
    }
  });
});
