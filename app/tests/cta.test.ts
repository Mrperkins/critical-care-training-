import { describe, it, expect } from 'vitest';
import { ctaFindings, dissectedAt, aorticDiameter } from '../src/abdomen/cta';
import { ctaKeys } from '../src/abdomen/CtaScene';
import { ABD_PRESETS } from '../src/abdomen/abdomenStore';
import { emptyAbdomen, abdomenFindings } from '../src/abdomen/state';

const P = (id: string) => ABD_PRESETS.find((p) => p.id === id)!.make();

describe('CT angiogram reading from the abdominal state (real CT chosen by these keys)', () => {
  it('normal: a ~2 cm aorta, no flap, no haematoma → a real normal CTA', () => {
    const st = emptyAbdomen(); const d = aorticDiameter(st, 'infrarenal'); expect(d).toBeGreaterThan(1.6); expect(d).toBeLessThan(2.6);
    expect(ctaFindings(st, 'infrarenal')[0]).toMatch(/Normal calibre/); expect(ctaKeys(st, 'infrarenal')).toEqual(['aorta_normal']);
  });
  it('AAA: diameter matches the state and is read with mural thrombus', () => {
    const st = P('aaa6'); expect(aorticDiameter(st, 'infrarenal')).toBeCloseTo(6, 1);
    expect(ctaFindings(st, 'infrarenal').join(' ')).toMatch(/6\.0 cm.*thrombus/); expect(ctaKeys(st, 'infrarenal')[0]).toBe('aaa');
  });
  it('contained and free rupture ask for a real ruptured-AAA CT', () => {
    const c = P('aaaContained'); expect(ctaFindings(c, 'infrarenal').join(' ')).toMatch(/contained rupture/); expect(ctaKeys(c, 'infrarenal').slice(0, 2)).toEqual(['aaa_rupture', 'retroperitoneal_hematoma']);
    const f = P('aaaFree'); expect(ctaFindings(f, 'infrarenal').join(' ')).toMatch(/extravasation/); expect(ctaKeys(f, 'infrarenal')[0]).toBe('aaa_rupture');
  });
  it('type B: flap from the descending aorta to the left iliac, ascending clean; left kidney malperfused', () => {
    const st = P('dissectB');
    expect(dissectedAt(st, 'chest')).toEqual({ ascending: false, aorta: true }); expect(dissectedAt(st, 'bifurcation').aorta).toBe(true);
    expect(ctaFindings(st, 'chest').join(' ')).toMatch(/type B/); expect(ctaFindings(st, 'renal').join(' ')).toMatch(/Left kidney poorly enhancing/);
    expect(ctaKeys(st, 'chest')[0]).toBe('dissection_type_b'); expect(ctaKeys(st, 'renal')).toContain('renal_malperfusion');
    expect(abdomenFindings(st).join(' ')).toMatch(/type B/);
  });
  it('type A: flap in the ascending aorta; extent to the renals leaves the infrarenal aorta clean', () => {
    const st = P('dissectA'); expect(dissectedAt(st, 'chest').ascending).toBe(true); expect(dissectedAt(st, 'infrarenal').aorta).toBe(false);
    expect(ctaFindings(st, 'chest').join(' ')).toMatch(/type A/); expect(ctaKeys(st, 'chest')[0]).toBe('dissection_type_a'); expect(ctaKeys(st, 'infrarenal')[0]).not.toMatch(/dissection/);
  });
});
