import { describe, it, expect } from 'vitest';
import { ranks, layout } from '../src/moa/layout';
import { moaTimeline } from '../src/moa/moaTimeline';
import { NOREPINEPHRINE } from '../src/moa/defs/norepinephrine';
import { resolve, duration } from '../src/director/timeline';
import { useMoa } from '../src/moa/moaStore';

const vit = () => Object.fromEntries(NOREPINEPHRINE.patient!.readouts().map((r) => [r.id, r.value]));

describe('MOA framework', () => {
  it('lays the graph out causally (every edge goes left → right)', () => {
    const r = ranks(NOREPINEPHRINE); NOREPINEPHRINE.edges.forEach((e) => expect(r[e.to], `${e.from}→${e.to}`).toBeGreaterThan(r[e.from]));
    const p = layout(NOREPINEPHRINE); expect(new Set(p.map((x) => `${Math.round(x.x)},${Math.round(x.y)}`)).size).toBe(p.length);
  });
  it('every edge references real nodes', () => { const ids = new Set(NOREPINEPHRINE.nodes.map((n) => n.id)); NOREPINEPHRINE.edges.forEach((e) => { expect(ids.has(e.from)).toBe(true); expect(ids.has(e.to)).toBe(true); }); });
});

describe('norepinephrine on the Lines engine', () => {
  const tl = moaTimeline(NOREPINEPHRINE);
  it('raises MAP mostly through SVR with heart rate roughly unchanged', () => {
    resolve(tl, 0); const a = vit(); expect(useMoa.getState().lit).toBe(-1);
    resolve(tl, duration(tl)); const b = vit(); expect(useMoa.getState().lit).toBeGreaterThan(5);
    expect(a.map).toBeLessThan(70); expect(b.map).toBeGreaterThan(a.map + 10);
    expect(b.svr).toBeGreaterThan(a.svr * 1.3);
    expect(Math.abs(b.hr - a.hr) / a.hr).toBeLessThan(0.12);
  });
  it('seeks deterministically', () => { resolve(tl, 9); const x = vit(); resolve(tl, 40); resolve(tl, 9); expect(vit().map).toBeCloseTo(x.map, 9); });
});
