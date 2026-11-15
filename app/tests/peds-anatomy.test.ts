import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { ORGANS, PEDS, PEDS_SOURCE } from '../src/atlas/pedsAnatomy';

const models = resolve(__dirname, '../public/models');
describe('real pediatric anatomy', () => {
  const report = JSON.parse(readFileSync(resolve(models, 'peds-anatomy.json'), 'utf8'));
  it('ships a model for an infant, a one-year-old and a school-age child, from an openly licensed source', () => {
    expect(PEDS_SOURCE.license).toBe('CC BY 4.0'); expect(report.license).toBe('CC BY 4.0');
    for (const b of ['infant', 'toddler', 'child'] as const) { expect(existsSync(resolve(models, `peds-${b}.glb`)), b).toBe(true); expect(statSync(resolve(models, `peds-${b}.glb`)).size).toBeLessThan(4e6); expect(PEDS[b].patient).toMatch(/^Pediatric-CT-SEG-/); }
  });
  it('each child has the key organs, and they are that child’s own size (nothing scaled from an adult)', () => {
    for (const b of ['infant', 'toddler', 'child'] as const) { const v = PEDS[b].ml;
      for (const k of ['heart', 'liver', 'spleen', 'kidney_l', 'kidney_r', 'lung_l', 'lung_r', 'bones', 'skin']) { expect(v[k], `${b} ${k}`).toBeGreaterThan(0); expect(ORGANS[k], k).toBeTruthy(); }
      // screened for normal-looking paired organs
      expect(v.kidney_l / v.kidney_r).toBeGreaterThan(0.77); expect(v.kidney_l / v.kidney_r).toBeLessThan(1.3); }
    // organs grow with the child: the pipeline measures them, it does not scale them
    expect(PEDS.child.ml.liver).toBeGreaterThan(PEDS.toddler.ml.liver); expect(PEDS.child.ml.heart).toBeGreaterThan(PEDS.toddler.ml.heart); expect(PEDS.child.ml.lung_r).toBeGreaterThan(PEDS.toddler.ml.lung_r);
    // adult liver is about 1,500 mL: every child here is well under it
    for (const b of ['infant', 'toddler', 'child'] as const) expect(PEDS[b].ml.liver).toBeLessThan(1100);
  });
  it('the windpipe is only shown where the scan really shows it, with plausible measurements', () => {
    const a = PEDS.child.airway!; expect(a).toBeTruthy(); expect(existsSync(resolve(models, 'peds-child-airway.glb'))).toBe(true);
    expect(a.diameterMm).toBeGreaterThan(5); expect(a.diameterMm).toBeLessThan(12); expect(a.lengthSeenMm).toBeGreaterThan(50); expect(a.lengthSeenMm).toBeLessThan(130);
    for (const b of ['infant', 'toddler'] as const) { expect(PEDS[b].airway).toBeNull(); expect(PEDS[b].noAirway).toBeTruthy(); expect(existsSync(resolve(models, `peds-${b}-airway.glb`))).toBe(false); }
    expect(ORGANS.airway).toBeTruthy();
  });
  it('abnormal scans were screened out and the reasons are on record', () => {
    const why = report.candidates.map((c: { why: string }) => c.why); expect(report.candidates.length).toBeGreaterThan(80);
    expect(why.some((w: string) => w.startsWith('kidneys differ'))).toBe(true); expect(why.filter((w: string) => w.startsWith('chosen')).length).toBe(3);
    expect(PEDS.toddler.wholeChest && PEDS.child.wholeChest).toBe(true);
  });
});
