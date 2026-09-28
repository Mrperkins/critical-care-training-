/** Collects every narrated line in the app (lessons) → public/vo/lines.json for offline neural TTS. */
import fs from 'node:fs';
import { VENT_LESSONS } from '../src/lessons/vent';
const extra: { id: string; t: string }[] = [];
try { const m = await import('../src/lessons/abg' as string); for (const l of m.ABG_LESSONS) for (const s of l.steps) extra.push({ id: s.id, t: s.say }); } catch { /* not yet */ }
try { const m = await import('../src/lessons/labs' as string); for (const l of m.LAB_LESSONS) for (const s of l.steps) extra.push({ id: s.id, t: s.say }); } catch { /* not yet */ }
const lines = [...VENT_LESSONS.flatMap((l) => l.steps.map((s) => ({ id: s.id, t: s.say }))), ...extra];
fs.writeFileSync('public/vo/lines.json', JSON.stringify(lines, null, 1));
console.log(lines.length, 'lines,', lines.reduce((a, l) => a + l.t.length, 0), 'chars');
