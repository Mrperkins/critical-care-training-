/** Norepinephrine dose–response on the Lines engine: saturating, scenario-dependent, bounded. */
import { describe, it, expect } from 'vitest';
import { LinesSession } from '../src/lines/session';
import { NOREPINEPHRINE } from '../src/moa/defs/norepinephrine';
import { moaTimeline } from '../src/moa/moaTimeline';
import { resolve, duration } from '../src/director/timeline';

const DOSES = [0, 0.05, 0.1, 0.2, 0.3, 0.5];
function curve(id: string) {
  const s = new LinesSession();
  return DOSES.map((d) => { s.load(id); s.setNore(d); s.settleTherapy(); for (let i = 0; i < 16 * 20; i++) s.tick(0.05); return { d, map: s.num.map, hr: s.num.hr, svr: s.effectiveSvr(), co: (s.circ.sv * s.circ.hr) / 1000 }; });
}
const sep = curve('sepsis'), nor = curve('normal');

describe('norepinephrine dose–response (Emax)', () => {
  it('MAP rises with dose in sepsis and in a normal patient', () => {
    for (const c of [sep, nor]) for (let i = 1; i < c.length; i++) expect(c[i].map, `${c[i].d}`).toBeGreaterThan(c[i - 1].map - 0.5);
    expect(sep[2].map).toBeGreaterThan(sep[0].map + 15);
  });
  it('increments diminish (saturation)', () => {
    const per = (c: typeof sep, i: number) => (c[i].map - c[i - 1].map) / (c[i].d - c[i - 1].d);
    expect(per(sep, 5)).toBeLessThan(per(sep, 1) * 0.5); expect(per(nor, 5)).toBeLessThan(per(nor, 1) * 0.6);
  });
  it('stays physiological at high dose', () => {
    expect(sep[4].map).toBeLessThan(125); expect(sep[5].map).toBeLessThan(130); expect(nor[5].map).toBeLessThan(175);
  });
  it('low-SVR patient responds from a lower base; scenario differences preserved', () => {
    expect(sep[0].svr).toBeLessThan(nor[0].svr * 0.6); expect(sep[3].map).toBeLessThan(nor[3].map);
  });
  it('baroreflex: heart rate does not climb with pressure in a normal patient; afterload: CO does not rise much', () => {
    expect(nor[4].hr).toBeLessThanOrEqual(nor[0].hr + 1); expect(nor[4].co).toBeLessThan(nor[0].co * 1.08);
  });
  it('MOA norepinephrine demo still raises MAP past 65 at its dose', () => {
    const tl = moaTimeline(NOREPINEPHRINE); resolve(tl, duration(tl)); const v = Object.fromEntries(NOREPINEPHRINE.patient!.readouts().map((r) => [r.id, r.value]));
    expect(v.map).toBeGreaterThan(65); expect(v.map).toBeLessThan(100);
  });
});
