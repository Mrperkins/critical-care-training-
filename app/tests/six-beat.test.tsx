// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (window as unknown as { matchMedia: unknown }).matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); });
import { DISEASES } from '../src/atlas/registry';
import { diseaseLesson } from '../src/atlas/engine';
import { EXPLAINERS } from '../src/atlas/explainers';
import { PATIENTS } from '../src/atlas/patients';
import { BEATS, courseFor } from '../src/director/course';
import '../src/director/courses';
import { steps } from '../src/director/timeline';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
const LESSONS = LESSON_HOSTS.flatMap((h) => h.timelines.map((tl) => ({ tl: { ...tl, module: tl.module ?? h.module } })));

describe('six-beat lessons', () => {
  it('names the six beats in order', () => { expect([...BEATS]).toEqual(['Patient', 'Predict', 'Watch', 'Your turn', 'Check', 'Recap']); });
  it('every condition opens on its own patient, and the lesson has something to predict, try and recap', () => {
    for (const d of DISEASES) {
      expect(PATIENTS[d.id], d.id).toBeTruthy(); expect(PATIENTS[d.id].length, d.id).toBeGreaterThan(40);
      const tl = diseaseLesson(d, () => undefined); const c = courseFor(tl)!;
      expect(c.patient, d.id).toBe(PATIENTS[d.id]); expect(c.predict?.prompt, d.id).toBeTruthy(); expect(c.yourTurn, d.id).toBeTruthy(); expect(c.keyPoints.length, d.id).toBeGreaterThan(1);
    }
  });
  it('condition lessons no longer use the filler narration', () => {
    for (const d of DISEASES) { if (EXPLAINERS[d.id]) continue; const s = steps(diseaseLesson(d, () => undefined));
      expect(s.map((c) => c.title)).toEqual(['The patient', 'What goes wrong', 'What you would find', 'The first move']);
      for (const c of s) { expect(c.say, d.id).not.toMatch(/Locate the affected|Compare the baseline with the progressive state|which decision best addresses/); }
      expect(s[0].say).toContain(PATIENTS[d.id].slice(0, 30)); }
  });
  it('module lessons get a hands-on prompt for their own scene', () => {
    const withTurn = LESSONS.filter((l) => !l.tl.id.startsWith('atlas-') && courseFor(l.tl)?.yourTurn);
    expect(withTurn.length).toBeGreaterThan(20);
  });
  it('lesson text uses US spelling', () => {
    const uk = /\b(haem|oedema|paediatric|apnoea|centre|colour|labour|recognise|stabilise|litre|ischaemi|anaemi)/i;
    for (const l of LESSONS) for (const c of steps(l.tl)) expect(uk.test(c.say ?? ''), `${l.tl.id}: ${c.say?.match(uk)?.[0]}`).toBe(false);
  });
});
