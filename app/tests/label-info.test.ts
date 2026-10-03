import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { describeLabel, labelKey } from '../src/scene/labelInfo';
import '../src/labs/cell/model'; // registers the transporter descriptions
import { TRANSPORTERS } from '../src/labs/cell/model';

const read = (f: string) => fs.readFileSync(`src/${f}`, 'utf8');
const all = (re: RegExp, s: string, g = 1) => [...s.matchAll(re)].map((m) => m[g]);

/** Every static label text in the 3D scenes, scraped from the source so new labels are caught. */
function inventory(): string[] {
  const out: string[] = [];
  const lines = read('lines/LinesScene.tsx'), blood = read('labs/blood/BloodScene.tsx');
  out.push(...all(/lbl\('([^']+)',/g, lines), ...all(/\['([^']+)', \[[-\d.]+, [-\d.]+, [-\d.]+\], '[lr]'/g, lines));
  out.push(...all(/lbl\('[a-z0-9]+', '([^']+)'/g, blood));
  out.push(...all(/name: '([^']+)'/g, read('lines/vessels.ts')), ...all(/text: '([^']+)'/g, read('lines/vessels.ts')));
  for (const f of ['heart/HeartScene.tsx', 'abdomen/AbdomenScene.tsx']) out.push(...all(/tag\((?:V\([^)]*\)|new THREE\.Vector3\([^)]*\)|ABD\.[a-z]+\.clone\(\)\.add\(V\([^)]*\)\)), '([^'`]+)'/g, read(f)));
  out.push(...all(/tag\([^\n]*?, '([^']+)', '[a-z]+'\)\)/g, read('vent/LungScene.tsx')));
  const alv = read('vent/AlveolusScene.tsx'); out.push(...all(/\bt: '([^']+)'/g, alv), ...all(/label: '([^']+)'/g, alv), 'Alveolar gas', 'Red cell');
  out.push(...all(/text="([^"]+)"/g, read('abg/AbgScene.tsx')));
  out.push(...all(/\['[a-z0-9_]+', [\d.]+, '([^']+)'\]/g, read('neuro/NeuroScene.tsx')));
  out.push(...all(/\['([^']+)', \[[-\d.]+, [-\d.]+, [-\d.]+\]\]/g, read('labs/LabScene.tsx')));
  out.push(...all(/\['([^']+)', \[SLAB/g, read('labs/cell/patch.tsx')));
  return [...new Set(out)].filter((t) => t.length > 1);
}

describe('label descriptions', () => {
  it('scrapes a realistic number of labels', () => { expect(inventory().length).toBeGreaterThan(120); });
  it('every static 3D label has a description', () => {
    const missing = inventory().filter((t) => !describeLabel(labelKey(t), t));
    expect(missing).toEqual([]);
  });
  it('every whole-cell organelle anchor has a description', () => {
    const src = fs.readdirSync('src/labs/cell/anatomy').map((f) => read(`labs/cell/anatomy/${f}`)).join('\n');
    const keys = new Set([...all(/key: '([a-z0-9_]+)', label:/g, src), ...all(/label: \['([a-z0-9_]+)'/g, src)]);
    expect(keys.size).toBeGreaterThan(20);
    expect([...keys].filter((k) => !describeLabel(`cell ${k}`))).toEqual([]);
  });
  it('transporters, dynamic labels and explicit keys resolve', () => {
    for (const t of Object.values(TRANSPORTERS)) expect(describeLabel(labelKey(t.short)), t.short).toBeTruthy();
    for (const k of ['vsd', 'asd', 'pfo', 'pda', 'aaa', 'free air', 'pressure bag', 'transducer level', 'cvc tip', 'cvc tip in the rv', 'arterial cannula', 'catheter clot', 'core and penumbra', 'extracellular fluid', 'cytosol', 'bone marrow', 'kidney', 'liver', 'heart', 'brain', 'pancreas'])
      expect(describeLabel(k), k).toBeTruthy();
  });
  it('keys keep short codes and drop live numbers', () => {
    expect(labelKey('M1')).toBe('m1'); expect(labelKey('Middle cerebral (M1)')).toBe('middle cerebral (m1)');
    expect(labelKey('Pressure bag 300 mmHg')).toBe('pressure bag'); expect(labelKey('→ Venous end')).toBe('venous end');
    expect(labelKey('Fatty-acid tails · oily core')).toBe('fatty-acid tails');
  });
});
