// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { MODULE_BY_ID } from '../src/library/modules';
import type { RealItem } from '../src/scene/imaging/RealExamples';
import { MRI_STUDIES } from '../src/library/imaging/mriCatalog';
import { COURSE_STUDIES, modalityOf, studiesForCourse, sourceFor } from '../src/library/imaging/catalog';

const man = JSON.parse(fs.readFileSync('../imaging/real/manifest.json', 'utf8')) as {
  accepted: string[]; items: RealItem[]; pending?: RealItem[];
};
const local = man.items.filter((i) => modalityOf(i));
const all = [...local, ...MRI_STUDIES];

describe('Clinical Imaging Trainer catalog', () => {
  it('covers every accepted radiology study, excluding procedure photos and unapproved pending media', () => {
    expect(man.items.length).toBeGreaterThanOrEqual(103);
    expect(local.length).toBeGreaterThanOrEqual(100);
    expect(MRI_STUDIES.length).toBeGreaterThanOrEqual(7);
    expect(all.length).toBeGreaterThanOrEqual(107);
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
    expect(local.filter((i) => modalityOf(i) === 'xray').length).toBeGreaterThanOrEqual(30);
    expect(local.filter((i) => modalityOf(i) === 'ct').length).toBeGreaterThanOrEqual(39);
    expect(local.filter((i) => modalityOf(i) === 'ultrasound').length).toBeGreaterThanOrEqual(31);
    expect(man.items.filter((i) => !modalityOf(i)).length).toBeGreaterThanOrEqual(3);
    expect(local.every((i) => man.accepted.includes(i.license))).toBe(true);
  });
  it('each study has an answerable question or an observation-and-reveal teaching path', () => {
    for (const it of all) {
      expect(it.look.length, it.id).toBeGreaterThan(0);
      expect(it.caption.length, it.id).toBeGreaterThan(0);
      if (it.quiz) {
        expect(it.quiz.options.length, it.id).toBeGreaterThanOrEqual(2);
        expect(it.quiz.answer, it.id).toBeGreaterThanOrEqual(0);
        expect(it.quiz.answer, it.id).toBeLessThan(it.quiz.options.length);
        expect(it.quiz.explain.length, it.id).toBeGreaterThan(0);
      }
    }
    expect(all.filter((i) => i.quiz).length).toBeGreaterThanOrEqual(101);
    expect(all.filter((i) => !i.quiz).length).toBeLessThanOrEqual(6);
  });
  it('only uses verified CC BY 4.0 Wikimedia Commons MRI originals, labeled external', () => {
    for (const it of MRI_STUDIES) {
      expect(it.file).toMatch(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//);
      expect(it.provenance?.pageUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(it.license).toBe('CC BY 4.0');
      expect(it.licenseUrl).toBe('https://creativecommons.org/licenses/by/4.0/');
      expect(it.changes).toContain('network connection');
      expect(sourceFor(it.file)).toBe(it.file);
    }
  });
  it('all local study image and clip paths are present', () => {
    for (const it of local) {
      expect(fs.existsSync(`../imaging/real/${it.file}`), it.id).toBe(true);
      if (it.file.endsWith('.mp4') && it.poster) expect(fs.existsSync(`../imaging/real/${it.poster}`), it.id).toBe(true);
    }
  });
  it('course galleries have valid, non-duplicated and clinically scoped references', () => {
    for (const [course, ids] of Object.entries(COURSE_STUDIES)) {
      expect(MODULE_BY_ID[course], course).toBeTruthy();
      expect(new Set(ids).size, course).toBe(ids.length);
      for (const id of ids) expect(all.some((i) => i.id === id), `${course}: ${id}`).toBe(true);
      expect(studiesForCourse(all, course).map((i) => i.id)).toEqual(ids);
    }
  });
});
