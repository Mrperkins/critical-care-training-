import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { SOLID_ORGAN_LESSON, MESENTERIC_LESSON, OBSTRUCTION_LESSON } from '../src/director/lessons/abdomen2';
import { useAbdUI, currentAbdomen } from '../src/abdomen/abdomenStore';
import { shockClass, evolve, emptyAbdomen, fastExam } from '../src/abdomen/state';
import { ctaFindings } from '../src/abdomen/cta';
import { useCtaUI } from '../src/abdomen/ctaStore';

const at = (tl: typeof SOLID_ORGAN_LESSON, t: number) => { resolve(tl, t); return currentAbdomen(); };
describe('solid-organ injury and the response to blood', () => {
  it('low grade stable; high grade class II; blood helps; transient responder climbs again; non-responder stays in class III; control stops the loss', () => {
    expect(shockClass(at(SOLID_ORGAN_LESSON, 1)).cls).toBe(1);
    expect(shockClass(at(SOLID_ORGAN_LESSON, 15)).cls).toBe(2); expect(useAbdUI.getState().view).toBe('us');
    expect(shockClass(at(SOLID_ORGAN_LESSON, 28)).cls).toBe(1);
    expect(shockClass(at(SOLID_ORGAN_LESSON, 41)).cls).toBeGreaterThanOrEqual(2);
    expect(shockClass(at(SOLID_ORGAN_LESSON, 55)).cls).toBeGreaterThanOrEqual(3);
    const c = at(SOLID_ORGAN_LESSON, 69); expect(shockClass(c).cls).toBe(1); expect(fastExam(c).some((w) => w.positive)).toBe(true);
  });
  it('bleeding control is exact under splitting (seekable)', () => {
    const b = { ...emptyAbdomen(), injury: { spleen: 4 }, controlledAt: 40 };
    expect(evolve(evolve(b, 25), 60).freeFluidMl).toBeCloseTo(evolve(b, 85).freeFluidMl, 8); expect(evolve(b, 200).freeFluidMl).toBeCloseTo(evolve(b, 40).freeFluidMl, 8);
  });
});
describe('mesenteric ischaemia and obstruction on CT', () => {
  it('SMA does not fill; the wall stops enhancing; infarction shows gas in the wall', () => {
    const s2 = at(MESENTERIC_LESSON, 15); expect(useCtaUI.getState().level).toBe('renal'); expect(ctaFindings(s2, 'renal').join(' ')).toMatch(/does not fill/);
    expect(ctaFindings(at(MESENTERIC_LESSON, 28), 'renal').join(' ')).toMatch(/enhancing poorly/);
    expect(ctaFindings(at(MESENTERIC_LESSON, 55), 'infrarenal').join(' ')).toMatch(/pneumatosis/);
  });
  it('obstruction: dilated loops with air–fluid levels; perforation: free air on CT', () => {
    expect(ctaFindings(at(OBSTRUCTION_LESSON, 14), 'infrarenal').join(' ')).toMatch(/air–fluid levels/);
    expect(ctaFindings(at(OBSTRUCTION_LESSON, 67), 'celiac').join(' ')).toMatch(/pneumoperitoneum/); expect(useAbdUI.getState().view).toBe('cta');
  });
});
