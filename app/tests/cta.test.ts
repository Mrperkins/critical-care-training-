import { describe, it, expect } from 'vitest';
import { ctaHU, ctaFindings, dissectedAt, renderCta, aortaCrop, aortaCenter, type CtaLevel } from '../src/abdomen/cta';
import { ABD_PRESETS } from '../src/abdomen/abdomenStore';
import { emptyAbdomen, abdomenFindings, type AbdomenState } from '../src/abdomen/state';

const P = (id: string) => ABD_PRESETS.find((p) => p.id === id)!.make();
const CM = 0.057;
/** outer aortic diameter measured along a horizontal line through the centre: count non-fat HU from the lumen outward */
function measure(st: AbdomenState, level: CtaLevel) { const { x: cx, y: cy } = aortaCenter(st, level);
  const step = 0.002; let r = 0; while (r < 0.4 && ctaHU(st, level, cx + r, cy) > 30) r += step; let l = 0; while (l < 0.4 && ctaHU(st, level, cx - l, cy) > 30) l += step; return (r + l) / CM;
}
/** count of low-HU (non-contrast) points inside a vessel of radius R at centre */
function darkInside(st: AbdomenState, level: CtaLevel, cx: number, cy: number, R: number) {
  let n = 0; for (let a = 0; a < 64; a++) for (let q = 0.1; q < 0.85; q += 0.05) { const hu = ctaHU(st, level, cx + Math.cos((a / 64) * 2 * Math.PI) * q * R, cy + Math.sin((a / 64) * 2 * Math.PI) * q * R); if (hu < 150) n++; } return n;
}

describe('CT angiogram from the abdominal state', () => {
  it('normal: a ~2 cm contrast-filled aorta, no flap, no haematoma', () => {
    const st = emptyAbdomen(); expect(ctaHU(st, 'infrarenal', 0.06, 0.13)).toBeGreaterThan(300);
    expect(measure(st, 'infrarenal')).toBeGreaterThan(1.6); expect(measure(st, 'infrarenal')).toBeLessThan(2.6);
    expect(darkInside(st, 'infrarenal', 0.06, 0.13, CM)).toBe(0); expect(ctaFindings(st, 'infrarenal')[0]).toMatch(/Normal calibre/);
  });
  it('AAA: the outer diameter matches the state; mural thrombus narrows the contrast lumen', () => {
    const st = P('aaa6'); const d = measure(st, 'infrarenal'); expect(d).toBeGreaterThan(5.5); expect(d).toBeLessThan(6.6);
    expect(darkInside(st, 'infrarenal', aortaCenter(st, 'infrarenal').x, aortaCenter(st, 'infrarenal').y, 3 * CM)).toBeGreaterThan(100);
    expect(ctaFindings(st, 'infrarenal').join(' ')).toMatch(/6\.0 cm.*thrombus/);
  });
  it('contained rupture: retroperitoneal haematoma beside the aneurysm and a crescent; free rupture: extravasation and gutter blood', () => {
    const c = P('aaaContained'); expect(ctaHU(c, 'infrarenal', 0.06 + 0.2, 0.25)).toBeGreaterThan(55); expect(ctaHU(emptyAbdomen(), 'infrarenal', 0.26, 0.25)).toBeLessThan(0);
    expect(ctaFindings(c, 'infrarenal').join(' ')).toMatch(/contained rupture/);
    const f = P('aaaFree'); let blush = 0; for (let x = 0.1; x < 0.5; x += 0.004) for (let y = -0.12; y < 0.25; y += 0.004) if (ctaHU(f, 'infrarenal', x, y) > 400) blush++;
    expect(blush).toBeGreaterThan(5); expect(ctaHU(f, 'infrarenal', 0.62, 0.02)).toBeCloseTo(45, 0); expect(ctaFindings(f, 'infrarenal').join(' ')).toMatch(/extravasation/);
  });
  it('type B: flap in the descending and abdominal aorta down to the left iliac, ascending clean; left kidney malperfused', () => {
    const st = P('dissectB');
    expect(dissectedAt(st, 'chest')).toEqual({ ascending: false, aorta: true }); expect(dissectedAt(st, 'bifurcation').aorta).toBe(true);
    expect(darkInside(st, 'chest', -0.04, -0.2, 1.65 * CM)).toBe(0); expect(darkInside(st, 'chest', 0.12, 0.2, 1.3 * CM)).toBeGreaterThan(20);
    expect(darkInside(st, 'renal', 0.06, 0.13, 1.15 * CM)).toBeGreaterThan(20);
    expect(ctaHU(st, 'renal', 0.42 + 0.11, 0.26)).toBeLessThan(ctaHU(st, 'renal', -0.42 - 0.11, 0.26) - 60); // left cortex vs right
    expect(ctaFindings(st, 'chest').join(' ')).toMatch(/type B/); expect(ctaFindings(st, 'renal').join(' ')).toMatch(/Left kidney poorly enhancing/);
    expect(abdomenFindings(st).join(' ')).toMatch(/type B/);
  });
  it('type A: flap in the ascending aorta; extent to the renals leaves the infrarenal aorta clean', () => {
    const st = P('dissectA'); expect(dissectedAt(st, 'chest').ascending).toBe(true); expect(darkInside(st, 'chest', -0.04, -0.2, 1.65 * CM)).toBeGreaterThan(20);
    expect(dissectedAt(st, 'infrarenal').aorta).toBe(false); expect(darkInside(st, 'infrarenal', 0.06, 0.13, CM)).toBe(0);
    expect(ctaFindings(st, 'chest').join(' ')).toMatch(/type A/);
  });
  it('true lumen is the smaller, denser side; a thrombosed false lumen has no contrast', () => {
    const st = P('dissectB'); let tl = 0, fl = 0; const R = 1.15 * CM;
    for (let i = 0; i < 400; i++) { const a = (i / 400) * 2 * Math.PI, q = 0.2 + 0.6 * ((i * 7) % 10) / 10; const hu = ctaHU(st, 'renal', 0.06 + Math.cos(a) * q * R, 0.13 + Math.sin(a) * q * R); if (hu > 300) tl++; else if (hu > 150) fl++; }
    expect(tl).toBeLessThan(fl); expect(tl).toBeGreaterThan(0);
    const th = { ...st, dissection: { ...st.dissection!, falseLumen: 'thrombosed' as const } }; let flc = 0; for (let i = 0; i < 400; i++) { const a = (i / 400) * 2 * Math.PI; const hu = ctaHU(th, 'renal', 0.06 + Math.cos(a) * 0.6 * R, 0.13 + Math.sin(a) * 0.6 * R); if (hu > 150 && hu < 300) flc++; } expect(flc).toBe(0);
  });
  it('renders deterministically, whole slice and magnified crop', () => {
    const st = P('dissectB'); const a = renderCta(st, 'renal', 80, aortaCrop(st, 'renal')), b = renderCta(st, 'renal', 80, aortaCrop(st, 'renal'));
    expect(Buffer.from(a.rgba).equals(Buffer.from(b.rgba))).toBe(true); expect(a.h).toBe(Math.round(80 * 0.72));
  });
});
