/** Writes src/scene/labelIndex.json — the glossary: one entry per distinct description, with where it appears. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeLabels } from './labelScrape';
import { describeLabel, labelKey } from '../src/scene/labelInfo';
import '../src/labs/cell/model';

export function buildIndex() {
  const by = new Map<string, { title: string; desc: string; modules: string[]; aka: string[] }>();
  for (const raw of scrapeLabels()) {
    const s = { ...raw, text: raw.text.replace(/^[→\s]+|[\s→]+$/g, '') };
    const key = s.info ?? labelKey(s.text); const desc = describeLabel(key, s.text); if (!desc) continue;
    const e = by.get(desc) ?? { title: s.text, desc, modules: [], aka: [] };
    if (!e.modules.includes(s.module)) e.modules.push(s.module);
    if (s.text !== e.title && !e.aka.includes(s.text)) { if (s.text.length > e.title.length && /[a-z]/.test(s.text) && e.title.length <= 4) { e.aka.push(e.title); e.title = s.text; } else e.aka.push(s.text); }
    by.set(desc, e);
  }
  return [...by.values()].sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
}
const here = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === here) {
  const out = path.resolve(path.dirname(here), '..', 'src/scene/labelIndex.json');
  fs.writeFileSync(out, JSON.stringify(buildIndex(), null, 1) + '\n'); console.log('label index', buildIndex().length, 'entries');
}
