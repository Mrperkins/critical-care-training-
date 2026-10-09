/**
 * Collects every narrated line in the app → public/vo/lines.json for offline neural TTS (scripts/vo_render.py).
 * Step lessons use the step id as the clip id; Director cues use `cue.voice ?? cue.id` (the id the Director plays).
 */
import fs from 'node:fs';
import { VENT_LESSONS } from '../src/lessons/vent';
import { ABG_LESSONS } from '../src/lessons/abg';
import { LAB_LESSONS } from '../src/lessons/labs';
import { LINES_LESSONS } from '../src/lines/lessons';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
import { DISEASES } from '../src/atlas/registry';
import { diseaseLesson } from '../src/atlas/engine';
import { MECHANISMS } from '../src/moa/registry';
import { moaTimeline } from '../src/moa/moaTimeline';

const lines: { id: string; t: string }[] = [];
for (const l of [...VENT_LESSONS, ...ABG_LESSONS, ...LAB_LESSONS, ...LINES_LESSONS] as { steps: { id: string; say: string }[] }[]) for (const s of l.steps) lines.push({ id: s.id, t: s.say });
for (const h of LESSON_HOSTS) for (const tl of h.timelines) for (const c of tl.cues) if (c.say) lines.push({ id: c.voice ?? c.id, t: c.say });
// condition-atlas lessons and pharmacology mechanism walk-throughs are Director timelines too
for (const d of DISEASES) for (const c of diseaseLesson(d, () => undefined).cues) if (c.say) lines.push({ id: c.voice ?? c.id, t: c.say });
for (const m of MECHANISMS) for (const c of moaTimeline(m).cues) if (c.say) lines.push({ id: c.voice ?? c.id, t: c.say });
const seen = new Map<string, string>();
for (const l of lines) { const prev = seen.get(l.id); if (prev != null && prev !== l.t) throw new Error(`clip id ${l.id} is used for two different lines`); seen.set(l.id, l.t); }
const uniq = [...new Map(lines.map((l) => [l.id, l])).values()];
fs.writeFileSync('public/vo/lines.json', JSON.stringify(uniq, null, 1));
console.log(uniq.length, 'lines,', uniq.reduce((a, l) => a + l.t.length, 0), 'chars');
