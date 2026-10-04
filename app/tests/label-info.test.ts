import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { describeLabel, labelKey } from '../src/scene/labelInfo';
import '../src/labs/cell/model'; // registers the transporter descriptions
import { TRANSPORTERS } from '../src/labs/cell/model';
import { scrapeLabels } from '../scripts/labelScrape';
import { buildIndex } from '../scripts/label-index';

const read = (f: string) => fs.readFileSync(`src/${f}`, 'utf8');
const all = (re: RegExp, s: string, g = 1) => [...s.matchAll(re)].map((m) => m[g]);

const inventory = () => [...new Set(scrapeLabels().filter((x) => !x.info).map((x) => x.text))];

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
  it('every scraped label (incl. organelles and dynamic keys) resolves, and the glossary index is up to date', () => {
    expect(scrapeLabels().filter((x) => !describeLabel(x.info ?? labelKey(x.text), x.text)).map((x) => x.text)).toEqual([]);
    const saved = JSON.parse(fs.readFileSync('src/scene/labelIndex.json', 'utf8'));
    expect(saved).toEqual(buildIndex()); // run: npx tsx scripts/label-index.ts
  });
});
