import { describe, it, expect } from 'vitest';
import { anatomy, clState, clScene, needle, vesselCheck, CL_DEFAULT, CL_WIDTH, CL_DEPTH, type ClInput } from '../src/procedures/centralLine';
import { renderLinear } from '../src/scene/ultrasound/bmode';

const C = (p: Partial<ClInput>): ClInput => ({ ...CL_DEFAULT, ...p });
const img = (p: Partial<ClInput>) => renderLinear(clScene(C(p)), CL_WIDTH, CL_DEPTH, 120);
/** mean brightness in a cm box */
function mean(r: ReturnType<typeof img>, x0: number, x1: number, z0: number, z1: number) {
  let s = 0, n = 0; for (let j = 0; j < r.h; j++) for (let i = 0; i < r.w; i++) { const x = ((i + 0.5) / r.w - 0.5) * CL_WIDTH, z = ((j + 0.5) / r.h) * CL_DEPTH; if (x >= x0 && x <= x1 && z >= z0 && z <= z1) { s += r.rgba[(j * r.w + i) * 4]; n++; } }
  return s / n;
}

describe('neck anatomy and probe pressure', () => {
  it('IJ is lateral and superficial to the carotid; the vein compresses fully, the artery does not', () => {
    const a = anatomy(C({})); expect(a.ij.x).toBeLessThan(a.ca.x); expect(a.ij.z).toBeLessThan(a.ca.z);
    const pressed = anatomy(C({ compress: 0.8 })); expect(pressed.ij.rz).toBeLessThan(0.05); expect(pressed.ca.r).toBeGreaterThan(a.ca.r * 0.85);
  });
  it('head-down tilt and volume distend the vein; hypovolaemia shrinks it', () => {
    expect(anatomy(C({ trendelenburg: true })).ij.rz).toBeGreaterThan(anatomy(C({ trendelenburg: false })).ij.rz);
    expect(anatomy(C({ volume: 0.5, trendelenburg: false })).ij.rz).toBeLessThan(anatomy(C({ trendelenburg: false })).ij.rz * 0.6);
  });
  it('the image shows black lumens where the vessels are, and compression blanks the vein only', () => {
    const r = img({}); const a = anatomy(C({}));
    expect(mean(r, a.ij.x - 0.2, a.ij.x + 0.2, a.ij.z - 0.15, a.ij.z + 0.15)).toBeLessThan(25);
    expect(mean(r, a.ca.x - 0.1, a.ca.x + 0.1, a.ca.z - 0.1, a.ca.z + 0.1)).toBeLessThan(25);
    const p = img({ compress: 0.8 });
    expect(mean(p, a.ij.x - 0.2, a.ij.x + 0.2, a.ij.z - 0.15, a.ij.z + 0.15)).toBeGreaterThan(40);
    expect(mean(p, a.ca.x - 0.1, a.ca.x + 0.1, a.ca.z - 0.1, a.ca.z + 0.1)).toBeLessThan(25);
  });
});

describe('needle, tip and what the screen shows', () => {
  it('advancing over the vein: tissue → vein lumen (venous flash) → back wall → deep', () => {
    const seq = [0.8, 2.2, 3.6, 4.6].map((adv) => clState(C({ advance: adv })).tipIn);
    expect(seq[0]).toMatch(/tissue|scm/); expect(seq[1]).toBe('ij'); expect(seq[2]).toBe('ijBackWall'); expect(seq[3]).toBe('deep');
    expect(clState(C({ advance: 2.2 })).flash).toBe('venous'); expect(clState(C({ advance: 3.6 })).throughAndThrough).toBe(true);
  });
  it('aiming medially enters the carotid (arterial flash); an overlying IJ lets a deep pass go through the vein into the artery', () => {
    const m = clState(C({ aimX: 0.85, advance: 2.8 })); expect(m.tipIn).toBe('carotid'); expect(m.flash).toBe('arterial');
    const o = clState(C({ variant: 'overlying', aimX: 0.6, advance: 3.5 })); expect(o.tipIn).toBe('carotid'); expect(o.throughAndThrough).toBe(true);
  });
  it('out-of-plane without tracking: the dot is the SHAFT, shallower than the real tip; tracking shows the tip', () => {
    const fixed = clState(C({ track: false, advance: 3.2 })); expect(fixed.seesTip).toBe(false); expect(fixed.shownZ!).toBeLessThan(fixed.trueZ - 0.8);
    const tr = clState(C({ track: true, advance: 3.2 })); expect(tr.seesTip).toBe(true); expect(tr.shownZ).toBeCloseTo(tr.trueZ, 6);
    expect(needle(C({ track: false, advance: 0.5 })).cross).toBeNull(); // not yet in the beam: nothing on screen
    expect(clState(C({ plane: 'in', axis: 'long', advance: 2 })).seesTip).toBe(true);
  });
  it('an under-filled vein tents before it is punctured', () => {
    const lo = C({ volume: 0.5, trendelenburg: false }); const zs = Array.from({ length: 40 }, (_, i) => clState({ ...lo, advance: 0.8 + i * 0.05 }));
    expect(zs.some((s) => s.tenting)).toBe(true); expect(zs.some((s) => s.tipIn === 'ij' || s.tipIn === 'ijBackWall')).toBe(true);
    expect(Array.from({ length: 40 }, (_, i) => clState(C({ advance: 0.8 + i * 0.05 }))).some((s) => s.tenting)).toBe(false);
  });
});

describe('vessel confirmation from the patient’s own pressures', () => {
  it('pressure and pulsatility separate artery from vein; colour can mislead', () => {
    const pt = { map: 72, cvp: 9, sao2: 0.84, svo2: 0.55 };
    const v = vesselCheck('venous', pt)!, a = vesselCheck('arterial', pt)!;
    expect(v.pressure).toBe(9); expect(v.pulsatile).toBe(false); expect(a.pressure).toBe(72); expect(a.pulsatile).toBe(true);
    expect(a.colourMisleading).toBe(true); expect(a.colour).not.toBe('bright red'); expect(a.columnCm).toBeGreaterThan(v.columnCm * 5);
    expect(vesselCheck('none', pt)).toBeNull();
  });
});

describe('central line workflow and lesson', async () => {
  const { CENTRAL_LINE, CENTRAL_LINE_LESSON } = await import('../src/procedures/centralLineFlow');
  const { useCl } = await import('../src/procedures/clStore');
  const { resolve } = await import('../src/director/timeline');
  const { evaluate } = await import('../src/workflows/workflow');
  it('the correct sequence scores 100 and puts the wire in the vein; blind advancing is harmful and goes through the back wall', () => {
    CENTRAL_LINE.setup(); const ids = CENTRAL_LINE.steps.map((s) => s.id);
    for (const id of ids) CENTRAL_LINE.effects?.[id]?.();
    expect(useCl.getState().wire).toBe('inVein'); expect(useCl.getState().input.axis).toBe('long');
    expect(evaluate(CENTRAL_LINE, ids, true).score).toBe(100);
    CENTRAL_LINE.setup(); CENTRAL_LINE.effects!.blind(); expect(clState(useCl.getState().input).tipIn).toBe('ijBackWall');
    const r = evaluate(CENTRAL_LINE, ['prep', 'blind', 'colour'], true); expect(r.harmful).toEqual(['blind', 'colour']); expect(r.criticalMissing).toEqual(expect.arrayContaining(['scan', 'wireSeen', 'catheter']));
  });
  it('lesson scenes: shaft-not-tip trap, walked tip in the vein, carotid on the medial aim, wire in the vein; exact seek', () => {
    const at = (id: string) => { resolve(CENTRAL_LINE_LESSON, CENTRAL_LINE_LESSON.cues.find((c) => c.id === id)!.at + 1); const s = useCl.getState(); return { s: clState(s.input), wire: s.wire, j: JSON.stringify(s) }; };
    expect(at('cvc-2').s.anat.ij.rz).toBeLessThan(0.05);
    const trap = at('cvc-4').s; expect(trap.seesTip).toBe(false); expect(trap.tipIn).toBe('ijBackWall');
    const walk = at('cvc-5').s; expect(walk.seesTip).toBe(true); expect(walk.tipIn).toBe('ij'); expect(walk.flash).toBe('venous');
    expect(at('cvc-7').s.flash).toBe('arterial'); expect(at('cvc-8').s.tipIn).toBe('carotid'); expect(at('cvc-9').wire).toBe('inVein');
    const a = at('cvc-7').j; at('cvc-1'); expect(at('cvc-7').j).toBe(a);
  });
  it('the wire renders as a bright echo inside the vein lumen', () => {
    const c = C({ advance: 0 }); const A = anatomy(c);
    const r = renderLinear(clScene(c, 'inVein'), CL_WIDTH, CL_DEPTH, 160); const r0 = renderLinear(clScene(c), CL_WIDTH, CL_DEPTH, 160);
    expect(mean(r as never, A.ij.x - 0.08, A.ij.x + 0.08, A.ij.z + 0.35 * A.ij.rz - 0.05, A.ij.z + 0.35 * A.ij.rz + 0.05)).toBeGreaterThan(mean(r0 as never, A.ij.x - 0.08, A.ij.x + 0.08, A.ij.z + 0.35 * A.ij.rz - 0.05, A.ij.z + 0.35 * A.ij.rz + 0.05) + 60);
  });
});
