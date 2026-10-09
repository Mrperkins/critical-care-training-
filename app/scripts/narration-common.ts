/** Shared by the narration job list and the site build: which line is which clip, and the hash that says a clip is current. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EPISODES, MENTAL_REPS } from '../src/audio/catalog';
import { draftTranscriptForEpisode } from '../src/audio/scriptDraft';
import { splitTranscript } from '../src/audio/split';
import { NARRATOR } from '../src/audio/narrator';

export interface NarrationJob { id: string; target: 'vo' | 'rep' | 'episode'; text: string; hash: string; transcriptHash?: string }
const sha = (s: string, n = 16) => crypto.createHash('sha256').update(s).digest('hex').slice(0, n);
const clean = (s: string) => s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
export const VOICE_KEY = `${NARRATOR.engine}|${NARRATOR.voice}|${NARRATOR.speed}|${NARRATOR.version}`;
export const jobHash = (text: string) => sha(`${VOICE_KEY}|${clean(text)}`);

/** Every spoken line in both apps. `root` is the app folder (where public/vo/lines.json lives). */
export function narrationJobs(root = '.'): NarrationJob[] {
  const jobs: NarrationJob[] = [];
  const add = (id: string, target: NarrationJob['target'], text: string, transcriptHash?: string) => { const t = clean(text); if (t) jobs.push({ id, target, text: t, hash: jobHash(t), transcriptHash }); };
  const vo: { id: string; t: string }[] = JSON.parse(fs.readFileSync(path.join(root, 'public/vo/lines.json'), 'utf8'));
  for (const l of vo) add(l.id, 'vo', l.t);
  for (const r of MENTAL_REPS) for (const b of r.beats) add(`rep.${r.id}.${b.id}`, 'rep', b.narration, sha(b.narration.replace(/\s+/g, ' ').trim()));
  for (const e of EPISODES) splitTranscript(draftTranscriptForEpisode(e)).forEach((t, i) => add(`episode.${e.id}.part${String(i + 1).padStart(3, '0')}`, 'episode', t));
  const ids = new Set<string>(); for (const j of jobs) { if (ids.has(j.id)) throw new Error(`duplicate narration id ${j.id}`); ids.add(j.id); }
  return jobs;
}
