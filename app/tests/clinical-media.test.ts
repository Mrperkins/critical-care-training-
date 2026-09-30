import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { RealItem } from '../src/scene/imaging/RealExamples';

const man = JSON.parse(fs.readFileSync('../imaging/real/manifest.json', 'utf8')) as { accepted: string[]; items: RealItem[]; pending?: (RealItem & { licenseClaimed: string })[] };
const all = [...man.items, ...(man.pending ?? [])];
const src = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? src(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []));

describe('real clinical media', () => {
  it('every RealCase kind used in a lesson has shipped or staged media', () => {
    const used = new Set(src('src').flatMap((f) => [...fs.readFileSync(f, 'utf8').matchAll(/<RealCase kind="(\w+)"/g)].map((m) => m[1])));
    expect([...used].sort()).toEqual(['fast', 'ijv', 'ivc', 'ptx']);
    for (const k of used) expect(all.some((i) => i.kind === k), k).toBe(true);
  });
  it('teaching items commit before reveal: a quiz with a valid answer, look-fors and teaching points', () => {
    for (const it of all.filter((i) => ['ptx', 'fast', 'ivc', 'ijv'].includes(i.kind))) {
      expect(it.quiz, it.id).toBeTruthy();
      expect(it.quiz!.answer).toBeGreaterThanOrEqual(0); expect(it.quiz!.answer).toBeLessThan(it.quiz!.options.length);
      expect(new Set(it.quiz!.options).size).toBe(it.quiz!.options.length);
      expect(it.look.length).toBeGreaterThanOrEqual(3); expect(it.teach!.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('overlay marks stay inside the frame and name a layer', () => {
    for (const it of all) for (const m of it.marks ?? []) {
      expect(['landmark', 'pathology']).toContain(m.layer);
      for (const v of [m.x, m.y, m.lx ?? 0.5, m.ly ?? 0.5, ...(m.pts ?? []).flat()]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1); }
    }
  });
  it('IVC teaching never sells the IVC as a stand-alone fluid-responsiveness test', () => {
    const ivc = all.find((i) => i.kind === 'ivc')!;
    expect(ivc.teach!.join(' ')).toMatch(/does not reliably predict/);
    expect(ivc.quiz!.options[ivc.quiz!.answer]).not.toMatch(/respond/);
  });
  it('only accepted licences, share-alike and non-commercial excluded', () => {
    for (const it of man.items) expect(man.accepted).toContain(it.license);
    for (const it of man.pending ?? []) expect(man.accepted).toContain(it.licenseClaimed);
    expect(all.some((i) => /\b(NC|ND|SA)\b/.test(i.license ?? (i as { licenseClaimed?: string }).licenseClaimed ?? ''))).toBe(false);
  });
});
