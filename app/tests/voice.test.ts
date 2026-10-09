import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
import { VENT_LESSONS } from '../src/lessons/vent';
import { ABG_LESSONS } from '../src/lessons/abg';
import { LAB_LESSONS } from '../src/lessons/labs';
import { LINES_LESSONS } from '../src/lines/lessons';
import { DISEASES } from '../src/atlas/registry';
import { diseaseLesson } from '../src/atlas/engine';
import { MECHANISMS } from '../src/moa/registry';
import { moaTimeline } from '../src/moa/moaTimeline';
import { narrationJobs } from '../scripts/narration-common';

const lines: { id: string; t: string }[] = JSON.parse(fs.readFileSync('public/vo/lines.json', 'utf8'));
const vo: Record<string, { hash: string }> = fs.existsSync('public/vo/narration.json') ? JSON.parse(fs.readFileSync('public/vo/narration.json', 'utf8')) : {};
const jobs = narrationJobs(); const want = new Map(jobs.map((j) => [j.id, j.hash]));
const byId = new Map(lines.map((l) => [l.id, l.t]));
const timelines = [...LESSON_HOSTS.flatMap((h) => h.timelines), ...DISEASES.map((d) => diseaseLesson(d, () => undefined)), ...MECHANISMS.map((m) => moaTimeline(m))];
const cues = timelines.flatMap((tl) => tl.cues.filter((c) => c.say).map((c) => ({ id: c.voice ?? c.id, t: c.say! })));
const steps = ([...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS] as { steps: { id: string; say: string }[] }[]).flatMap((l) => l.steps.map((s) => ({ id: s.id, t: s.say })));

describe('narration', () => {
  it('lines.json is in sync with every narrated cue and step (run scripts/vo-lines.ts after editing lesson text)', () => {
    for (const x of [...cues, ...steps]) expect(byId.get(x.id), x.id).toBe(x.t);
    expect(lines.length).toBe(new Set([...cues, ...steps].map((x) => x.id)).size);
  });
  it('clip ids are unique across lessons', () => {
    const seen = new Map<string, string>(); for (const x of [...cues, ...steps]) { const p = seen.get(x.id); if (p != null) expect(p, x.id).toBe(x.t); seen.set(x.id, x.t); }
  });
  it('every spoken line has a current natural-voice clip (scripts/narration-jobs.ts → narrate.py → narration_collect.py)', () => {
    for (const id of Object.keys(vo)) expect(byId.has(id), id).toBe(true);
    for (const l of lines) expect(vo[l.id]?.hash, `no current clip for ${l.id}`).toBe(want.get(l.id));
    for (const l of lines) expect(fs.existsSync(`../vo/${l.id}.mp3`), `missing file vo/${l.id}.mp3`).toBe(true);
  });
  it('the apps never fall back to browser or operating-system speech', () => {
    const src = (d: string): string[] => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? src(`${d}/${e.name}`) : /\.tsx?$/.test(e.name) ? [`${d}/${e.name}`] : []));
    for (const f of src('src')) expect(fs.readFileSync(f, 'utf8'), f).not.toMatch(/speechSynthesis|SpeechSynthesisUtterance/);
  });

});
