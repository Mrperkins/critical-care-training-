/**
 * Canonical Critical Care Audio narration inventory.
 * Production renderers consume this file; the app never synthesizes narration in-browser.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { draftTranscriptForEpisode } from '../src/audio/scriptDraft';

const out = path.resolve('public/audio/voice'); fs.mkdirSync(out, { recursive: true });
const lines: { id: string; text: string; kind: 'episode' | 'mental-rep'; transcriptHash: string }[] = [];
const add = (id: string, text: string, kind: 'episode' | 'mental-rep') => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return;
  lines.push({ id, text: clean, kind, transcriptHash: crypto.createHash('sha256').update(clean).digest('hex').slice(0, 16) });
};
for (const e of EPISODES) add(`episode.${e.id}`, draftTranscriptForEpisode(e), 'episode');
for (const r of MENTAL_REPS) for (const b of r.beats) add(`rep.${r.id}.${b.id}`, b.narration, 'mental-rep');
const ids = new Set<string>(); for (const l of lines) { if (ids.has(l.id)) throw new Error(`duplicate audio line id ${l.id}`); ids.add(l.id); }
fs.writeFileSync(path.join(out, 'lines.json'), JSON.stringify(lines, null, 2));
console.log(`${lines.length} premium voice lines · ${lines.reduce((n, x) => n + x.text.length, 0)} characters`);
