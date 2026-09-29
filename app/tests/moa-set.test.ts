import { describe, it, expect } from 'vitest';
import { MECHANISMS, MECH } from '../src/moa/registry';
import { ranks } from '../src/moa/layout';
import { moaTimeline } from '../src/moa/moaTimeline';
import { resolve, duration } from '../src/director/timeline';

const before = (id: string) => { const d = MECH[id]; resolve(moaTimeline(d), 0); return Object.fromEntries(d.patient!.readouts().map((r) => [r.id, r.value])); };
const after = (id: string) => { const d = MECH[id]; const tl = moaTimeline(d); resolve(tl, duration(tl)); return Object.fromEntries(d.patient!.readouts().map((r) => [r.id, r.value])); };

describe('initial MOA set', () => {
  it('every mechanism is a valid causal graph with narration', () => {
    for (const d of MECHANISMS) {
      const ids = new Set(d.nodes.map((n) => n.id)); const r = ranks(d);
      d.edges.forEach((e) => { expect(ids.has(e.from) && ids.has(e.to), `${d.id} ${e.from}→${e.to}`).toBe(true); expect(r[e.to], `${d.id} ${e.from}→${e.to}`).toBeGreaterThan(r[e.from]); });
      expect(d.nodes.filter((n) => n.explain).length, d.id).toBeGreaterThan(2); expect(d.patient, d.id).toBeTruthy();
    }
  });
  it('epinephrine: output, rate and pressure rise', () => { const a = before('epinephrine'), b = after('epinephrine'); expect(b.co).toBeGreaterThan(a.co); expect(b.hr).toBeGreaterThan(a.hr); expect(b.map).toBeGreaterThan(a.map + 10); });
  it('vasopressin: pressure rises without tachycardia', () => { const a = before('vasopressin'), b = after('vasopressin'); expect(b.map).toBeGreaterThan(a.map + 8); expect(b.hr).toBeLessThanOrEqual(a.hr); });
  it('phenylephrine: pressure up, reflex bradycardia', () => { const a = before('phenylephrine'), b = after('phenylephrine'); expect(b.map).toBeGreaterThan(a.map); expect(b.hr).toBeLessThan(a.hr - 5); });
  it('dobutamine: output up, resistance down', () => { const a = before('dobutamine'), b = after('dobutamine'); expect(b.co).toBeGreaterThan(a.co * 1.2); expect(b.svr).toBeLessThan(a.svr); });
  it('calcium: potassium unchanged, gap restored, QRS narrower', () => { const a = before('calcium'), b = after('calcium'); expect(Math.abs(b.k - a.k)).toBeLessThan(0.1); expect(b.gap).toBeGreaterThan(a.gap + 2); expect(b.qrs).toBeLessThan(a.qrs); });
  it('insulin: potassium falls, gap widens', () => { const a = before('insulin'), b = after('insulin'); expect(b.k).toBeLessThan(a.k - 0.4); expect(b.gap).toBeGreaterThan(a.gap); });
});
