/**
 * Writes narration/jobs.json — every line the apps speak — for scripts/narrate.py:
 *   vo (visual-app lessons: Director cues, step lessons, atlas, pharmacology) · rep (Mental Rep beats) · episode (audio episodes, in parts).
 * Lines whose current clip already matches (public/vo/narration.json, public/audio/voice/manifest.json) are listed in narration/done.json.
 */
import fs from 'node:fs';
import { narrationJobs } from './narration-common';
import { NARRATOR } from '../src/audio/narrator';

const jobs = narrationJobs();
const done: Record<string, { hash: string }> = {};
const vo = fs.existsSync('public/vo/narration.json') ? JSON.parse(fs.readFileSync('public/vo/narration.json', 'utf8')) as Record<string, { hash: string }> : {};
const man = fs.existsSync('public/audio/voice/manifest.json') ? JSON.parse(fs.readFileSync('public/audio/voice/manifest.json', 'utf8')) as { assets: { id: string; narrationHash?: string }[] } : { assets: [] };
for (const [id, v] of Object.entries(vo)) done[id] = { hash: v.hash };
for (const a of man.assets) if (a.narrationHash) done[a.id] = { hash: a.narrationHash };
fs.mkdirSync('narration', { recursive: true });
fs.writeFileSync('narration/jobs.json', JSON.stringify({ narrator: NARRATOR, jobs }, null, 1));
fs.writeFileSync('narration/done.json', JSON.stringify(done));
const by = (t: string) => jobs.filter((j) => j.target === t);
const todo = jobs.filter((j) => done[j.id]?.hash !== j.hash);
console.log(`${jobs.length} narration lines (vo ${by('vo').length} · rep ${by('rep').length} · episode parts ${by('episode').length}); ${todo.length} to render, ${todo.reduce((n, j) => n + j.text.length, 0)} chars`);
