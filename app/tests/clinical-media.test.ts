import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { RealItem } from '../src/scene/imaging/RealExamples';

const man = JSON.parse(fs.readFileSync('../imaging/real/manifest.json', 'utf8')) as { accepted: string[]; items: RealItem[]; pending?: (RealItem & { licenseClaimed: string })[] };
const all = [...man.items, ...(man.pending ?? [])];
const src = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? src(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []));

describe('real clinical media', () => {
  it('every real-media kind used by a scene has shipped or staged media', () => {
    const used = new Set(src('src').flatMap((f) => { const t = fs.readFileSync(f, 'utf8');
      return [...[...t.matchAll(/<RealCase kind="([\w-]+)"/g)].map((m) => m[1]), ...[...t.matchAll(/<RealStudy[^>]*?kinds=\{\[([^\]]+)\]/g)].flatMap((m) => [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]))]; }));
    for (const k of ['cxr', 'lus', 'fast', 'ct-aorta', 'ijv']) expect(used.has(k), k).toBe(true);
    for (const k of used) expect(all.some((i) => i.kind === k), k).toBe(true);
  });
  it('teaching items commit before reveal: a quiz with a valid answer, look-fors and teaching points', () => {
    for (const it of all.filter((i) => ['ptx', 'fast', 'ivc', 'ijv', 'ptxlus', 'pleuraleff', 'tamponade', 'ptxseries'].includes(i.kind))) {
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

describe('real clinical media — frame-specific teaching', () => {
  const by = Object.fromEntries(man.items.map((i) => [i.id, i]));
  it('all four required items are shipped with WebM + MP4 (videos) and overlays', () => {
    for (const id of ['ptx-expiratory', 'fast-ruq-positive', 'ivc-2026-video-s1', 'ijv-2026-video-s2']) {
      expect(by[id], id).toBeTruthy(); expect(by[id].marks!.length).toBeGreaterThanOrEqual(3);
      if (id !== 'ptx-expiratory') { expect(by[id].webm).toMatch(/\.webm$/); expect(by[id].file).toMatch(/\.mp4$/); expect(by[id].posterAt).toBeGreaterThan(0); }
    }
    for (const id of ['ptx-expiratory', 'fast-ruq-positive', 'ivc-2026-video-s1', 'ijv-2026-video-s2']) expect((man.pending ?? []).some((p) => p.id === id)).toBe(false);
  });
  it('the pneumothorax is taught as LEFT, and its pathology marks sit on the image right (the “Sin” side)', () => {
    const p = by['ptx-expiratory'];
    expect(p.quiz!.options[p.quiz!.answer]).toBe('Left apex');
    expect(p.caption).toMatch(/left apical pneumothorax/);
    for (const m of p.marks!.filter((m) => m.layer === 'pathology')) expect(m.x).toBeGreaterThan(0.5);
    expect(p.marks!.some((m) => /Sin/.test(m.label) && m.x > 0.5)).toBe(true);
  });
  it('FAST marks liver, kidney, Morison’s pouch and the fluid; IVC marks the liver, IVC and the way to the atrium; IJ marks both vessels and the collapse point', () => {
    const labels = (id: string) => by[id].marks!.map((m) => m.label).join(' | ');
    expect(labels('fast-ruq-positive')).toMatch(/Liver.*kidney.*Morison.*Free fluid/s);
    expect(labels('ivc-2026-video-s1')).toMatch(/Liver.*IVC.*right atrium/s);
    expect(labels('ijv-2026-video-s2')).toMatch(/jugular.*Carotid.*Collapse point/s);
    expect(by['ijv-2026-video-s2'].findingLabel).toBe('Show the collapse point');
  });
});
