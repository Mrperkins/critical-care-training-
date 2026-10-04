import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
import { VENT_LESSONS } from '../src/lessons/vent';
import { ABG_LESSONS } from '../src/lessons/abg';
import { LAB_LESSONS } from '../src/lessons/labs';
import { LINES_LESSONS } from '../src/lines/lessons';

const lines: { id: string; t: string }[] = JSON.parse(fs.readFileSync('public/vo/lines.json', 'utf8'));
const vo: Record<string, string> = JSON.parse(fs.readFileSync('public/vo/vo.json', 'utf8'));
const byId = new Map(lines.map((l) => [l.id, l.t]));
const cues = LESSON_HOSTS.flatMap((h) => h.timelines.flatMap((tl) => tl.cues.filter((c) => c.say).map((c) => ({ id: c.voice ?? c.id, t: c.say! }))));
const steps = ([...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS] as { steps: { id: string; say: string }[] }[]).flatMap((l) => l.steps.map((s) => ({ id: s.id, t: s.say })));

describe('narration', () => {
  it('lines.json is in sync with every narrated cue and step (run scripts/vo-lines.ts after editing lesson text)', () => {
    for (const x of [...cues, ...steps]) expect(byId.get(x.id), x.id).toBe(x.t);
    expect(lines.length).toBe(new Set([...cues, ...steps].map((x) => x.id)).size);
  });
  it('clip ids are unique across lessons', () => {
    const seen = new Map<string, string>(); for (const x of [...cues, ...steps]) { const p = seen.get(x.id); if (p != null) expect(p, x.id).toBe(x.t); seen.set(x.id, x.t); }
  });
  it('every clip in vo.json belongs to a current line; every line — including every new scene — has a clip', () => {
    for (const id of Object.keys(vo)) expect(byId.has(id), id).toBe(true);
    const fresh = cues.filter((c) => /^(ptx|ap|pa|nt|og|oc)-/.test(c.id)); expect(fresh.length).toBe(44);
    for (const c of fresh) expect(vo[c.id], c.id).toBeTruthy();
    for (const l of lines) expect(vo[l.id], `no clip for ${l.id}: run scripts/vo_render.py + vo-pack.ts`).toBeTruthy();
  });
});
