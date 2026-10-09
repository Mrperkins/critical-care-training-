import { describe, it, expect } from 'vitest';
import { stripeMm, US_WINDOWS } from '../src/abdomen/ultrasound';
import { fastKey } from '../src/abdomen/UltrasoundScene';
import { emptyAbdomen, evolve, fastExam } from '../src/abdomen/state';
import { ABD_PRESETS, currentAbdomen, useAbdUI } from '../src/abdomen/abdomenStore';
import { resolve, duration } from '../src/director/timeline';
import { FAST_LESSON, AAA_LESSON } from '../src/director/lessons/abdomen';

const liver = (ml: number) => ({ ...emptyAbdomen(), injury: { liver: 3 }, freeFluidMl: ml });

describe('FAST reading (real clip chosen by window and finding)', () => {
  it('stripe is zero until positive, then grows with volume', () => {
    expect(stripeMm(500, false)).toBe(0);
    const a = stripeMm(60, true), b = stripeMm(200, true), c = stripeMm(900, true);
    expect(a).toBeGreaterThan(0); expect(b).toBeGreaterThan(a); expect(c).toBeGreaterThan(b); expect(c).toBeLessThanOrEqual(35);
  });
  it('normal abdomen: every window asks for a real negative view', () => {
    for (const w of US_WINDOWS) expect(fastKey(w.id, emptyAbdomen())).toMatch(/negative$|aorta_normal_us/);
  });
  it('RUQ fluid volume grows monotonically with bleeding and turns the window positive', () => {
    const ml = [150, 300, 600, 1200].map((v) => fastExam(liver(v)).find((w) => w.id === 'ruq')!.ml);
    for (let i = 1; i < ml.length; i++) expect(ml[i]).toBeGreaterThan(ml[i - 1]);
    expect(fastKey('ruq', liver(1200))).toBe('fast_ruq_positive');
  });
  it('pelvic fluid appears behind the bladder once the pelvis is positive', () => {
    const st = liver(900); expect(fastExam(st).find((w) => w.id === 'pelvis')!.positive).toBe(true);
    expect(fastKey('pelvis', st)).toBe('fast_pelvis_positive');
  });
  it('a liver bleed turns the RUQ positive before the pelvis or LUQ', () => {
    const s0 = ABD_PRESETS.find((p) => p.id === 'liver3')!.make(); let first: string | null = null;
    for (let m = 0; m <= 60 && !first; m += 0.5) { const pos = fastExam(evolve(s0, m)).filter((w) => w.positive); if (pos.length) first = pos.map((w) => w.id).join(','); }
    expect(first).toBe('ruq');
  });
  it('retroperitoneal rupture leaves every FAST image identical to normal; the aorta view changes', () => {
    const aaa = currentAbdomen({ base: ABD_PRESETS.find((p) => p.id === 'aaaContained')!.make(), minutes: 60 });
    const normalAaa = { ...emptyAbdomen(), aaa: { ...aaa.aaa } };
    for (const w of ['ruq', 'luq', 'pelvis', 'pericardial'] as const) expect(fastKey(w, aaa)).toBe(fastKey(w, normalAaa));
    expect(fastKey('aorta', aaa)).toBe('aaa'); expect(fastKey('aorta', emptyAbdomen())).toBe('aorta_normal_us');
  });
});

describe('abdomen lessons', () => {
  const at = (tl: typeof FAST_LESSON, t: number) => { resolve(tl, t); const s = useAbdUI.getState(); return { s, st: currentAbdomen(s) }; };
  it('FAST lesson: normal → early negative → RUQ positive → progression → retroperitoneal miss', () => {
    const c = (id: string) => FAST_LESSON.cues.find((x) => x.id === id)!.at + 0.5;
    expect(fastExam(at(FAST_LESSON, c('fast-2')).st).some((w) => w.positive)).toBe(false);
    expect(fastExam(at(FAST_LESSON, c('fast-3')).st).some((w) => w.positive)).toBe(false);
    const r4 = fastExam(at(FAST_LESSON, c('fast-4')).st); expect(r4.find((w) => w.id === 'ruq')!.positive).toBe(true);
    const cue7 = FAST_LESSON.cues.find((x) => x.id === 'fast-7')!;
    const early = at(FAST_LESSON, cue7.at + 0.1).st, late = at(FAST_LESSON, cue7.at + cue7.dur! - 0.1).st; expect(late.freeFluidMl).toBeGreaterThan(early.freeFluidMl);
    const r8 = at(FAST_LESSON, c('fast-9')); expect(fastExam(r8.st).some((w) => w.positive)).toBe(false); expect(r8.st.retroMl).toBeGreaterThan(1000); expect(r8.s.view).toBe('us');
  });
  it('AAA lesson: diameter grows, contained stays FAST-negative, free rupture turns positive', () => {
    const cue2 = AAA_LESSON.cues.find((x) => x.id === 'aaa-2')!;
    expect(at(AAA_LESSON, cue2.at + cue2.dur! - 0.1).st.aaa.diameterCm).toBeGreaterThan(at(AAA_LESSON, cue2.at + 0.1).st.aaa.diameterCm);
    expect(fastExam(at(AAA_LESSON, AAA_LESSON.cues.find((x) => x.id === 'aaa-6')!.at + 0.5).st).some((w) => w.positive)).toBe(false);
    const cue7 = AAA_LESSON.cues.find((x) => x.id === 'aaa-7')!; expect(fastExam(at(AAA_LESSON, cue7.at + cue7.dur! - 0.1).st).some((w) => w.positive)).toBe(true);
  });
  it('seeking is exact in both lessons', () => {
    for (const tl of [FAST_LESSON, AAA_LESSON]) for (const t of [3, duration(tl) * 0.43, duration(tl) * 0.77, duration(tl) - 1]) {
      resolve(tl, duration(tl) - 0.5); const a = JSON.stringify(at(tl, t).st); resolve(tl, 0); const b = JSON.stringify(at(tl, t).st); expect(a).toBe(b);
    }
  });
});
