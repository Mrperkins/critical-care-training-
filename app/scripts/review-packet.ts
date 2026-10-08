/**
 * Clinical review packet: every teaching claim a clinician should check, one row each, with empty Verdict and
 * Comment columns. Writes ../review/clinical-review-packet.csv and .json (run: npx tsx scripts/review-packet.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VENT_NORMALS } from '../src/knowledge/normals';
import { LABS } from '../src/knowledge/labs';
import { LINES_NORMALS } from '../src/lines/LinesNormals';
import { SCENE_CASES } from '../src/challenge/sceneCases';
import { LINES_CASES } from '../src/lines/cases';
import { VENT_LESSONS } from '../src/lessons/vent';
import { ABG_LESSONS } from '../src/lessons/abg';
import { LAB_LESSONS } from '../src/lessons/labs';
import { LINES_LESSONS } from '../src/lines/lessons';
import { LESSON_HOSTS } from '../src/director/lessonIndex';
import { DISEASES } from '../src/atlas/registry';

const here = path.dirname(fileURLToPath(import.meta.url)); const REPO = path.resolve(here, '..', '..');
const MOD: Record<string, string> = { vent: 'Ventilator', abg: 'Blood gas', labs: 'Labs', lines: 'Lines', neuro: 'Brain', heart: 'Heart', abdomen: 'Abdomen', img: 'Ventilator', moa: 'Drugs', pediatrics: 'Pediatrics', womens: 'Women’s Health / OB' };
const modName = (m?: string) => (m ? MOD[m] ?? m : '');
export interface Row { section: string; id: string; where: string; item: string; content: string; source?: string }
const rows: Row[] = []; const add = (r: Row) => rows.push({ ...r, content: r.content.replace(/\s+/g, ' ').trim() });

// 1 reference values
for (const g of VENT_NORMALS) for (const r of g.rows) add({ section: '1 Reference values', id: `vent:${r.label}`, where: `Ventilator › Normal values › ${g.title}`, item: r.label, content: `${r.normal} ${r.unit}${r.note ? ' — ' + r.note : ''}` });
for (const g of LINES_NORMALS) for (const r of g.rows) add({ section: '1 Reference values', id: `lines:${r.label}`, where: `Lines › Normal values › ${g.title}`, item: r.label, content: `${r.normal} ${r.unit}${r.note ? ' — ' + r.note : ''}` });
for (const l of LABS) add({ section: '1 Reference values', id: `lab:${l.id}`, where: `Labs › ${l.group}`, item: `${l.name} (${l.abbr})`,
  content: `Normal ${l.normal[0]}–${l.normal[1]} ${l.unit}${l.critical ? `; critical ${l.critical[0] ?? '—'} / ${l.critical[1] ?? '—'}` : ''}. High (${l.high.label}): ${l.high.causes.join('; ')} — ${l.high.effects}. Low (${l.low.label}): ${l.low.causes.join('; ')} — ${l.low.effects}` });
// 2 narration (every lesson line)
const lines: { id: string; t: string }[] = JSON.parse(fs.readFileSync(path.join(here, '..', 'public/vo/lines.json'), 'utf8'));
const whereVo = new Map<string, string>();
for (const [mod, ls] of [['Ventilator', VENT_LESSONS], ['Blood gas', ABG_LESSONS], ['Labs', LAB_LESSONS], ['Lines', LINES_LESSONS]] as [string, { title: string; steps: { id: string; title: string }[] }[]][])
  for (const l of ls) for (const st of l.steps) whereVo.set(st.id, `${mod} › Learn › ${l.title} › ${st.title}`);
for (const h of LESSON_HOSTS as unknown as { module?: string; timelines: { title: string; cues: { id: string; voice?: string; title?: string }[] }[] }[])
  for (const tl of h.timelines) for (const c of tl.cues) whereVo.set(c.voice ?? c.id, `${h.module ? modName(h.module) + ' › ' : ''}Learn › ${tl.title}${c.title ? ' › ' + c.title : ''}`);
for (const l of lines) add({ section: '2 Lesson narration', id: `vo:${l.id}`, where: whereVo.get(l.id) ?? `Lesson cue ${l.id}`, item: l.id, content: l.t });
// 3 challenge cases
for (const c of SCENE_CASES) c.questions.forEach((q, i) => add({ section: '3 Challenge cases', id: `${c.id}#${i + 1}`, where: `${modName(c.module)} › Challenge › ${c.title} (${c.level})`, item: q.q,
  content: `${i === 0 ? `Story: ${c.story} ` : ''}Answer: ${q.options[q.answer]}. Other options: ${q.options.filter((_, k) => k !== q.answer).join(' | ')}. Explanation: ${q.explain}` }));
for (const c of LINES_CASES) add({ section: '3 Challenge cases', id: `lines-case:${c.id}`, where: `Lines › Challenge › ${c.title}`, item: c.question,
  content: `${c.brief} Answer: ${c.options[c.answer]}. Other options: ${c.options.filter((_, k) => k !== c.answer).join(' | ')}. Explanation: ${c.explain}` });
// 4 real clinical media
const man = JSON.parse(fs.readFileSync(path.join(REPO, 'imaging/real/manifest.json'), 'utf8'));
for (const it of man.items) {
  const base = { section: '4 Real clinical media', where: `Real media › ${it.kind}`, source: `${it.author}. ${it.source}. ${it.license}` };
  add({ ...base, id: `${it.id}:caption`, item: `${it.title} — caption`, content: it.caption });
  add({ ...base, id: `${it.id}:look`, item: `${it.title} — look for`, content: it.look.join(' · ') });
  if (it.teach) add({ ...base, id: `${it.id}:teach`, item: `${it.title} — teaching points`, content: it.teach.join(' · ') });
  if (it.quiz) add({ ...base, id: `${it.id}:quiz`, item: `${it.title} — question`, content: `${it.quiz.q} Answer: ${it.quiz.options[it.quiz.answer]}. Explanation: ${it.quiz.explain}` });
  if (it.marks?.length) add({ ...base, id: `${it.id}:marks`, item: `${it.title} — overlay labels (check placement in the app)`, content: it.marks.map((m: { layer: string; label: string }) => `${m.layer}: ${m.label}`).join(' · ') });
}
// 5 label descriptions (glossary)
const gloss: { title: string; desc: string; modules: string[] }[] = JSON.parse(fs.readFileSync(path.join(here, '..', 'src/scene/labelIndex.json'), 'utf8'));
for (const g of gloss) add({ section: '5 Label descriptions', id: `label:${g.title}`, where: `3D labels › ${g.modules.join(', ')}`, item: g.title, content: g.desc });
// 6 disease atlas: include distinctions and every simulated decision, not just the lesson title.
for (const d of DISEASES) {
  const base = { section: '6 Disease atlas', where: `${modName(d.domain)} › ${d.group} › ${d.title}`, source: d.sources.map(s => `${s.title} (${s.url})`).join('; ') };
  add({ ...base, id: `atlas:${d.id}:mechanism`, item: 'Mechanism and visual findings', content: `${d.mechanism} Visual findings: ${d.findings.map(f => f.label).join('; ')}.` });
  add({ ...base, id: `atlas:${d.id}:distinction`, item: 'Clinical distinction', content: d.distinction });
  for (const choice of d.decisions) add({ ...base, id: `atlas:${d.id}:${choice.id}`, item: `${d.question} — ${choice.label}`, content: choice.explanation });
}

const csv = (s: string) => `"${s.replace(/"/g, '""')}"`;
const header = ['Section', 'ID', 'Where in the app', 'Item', 'Content to review', 'Source / credit', 'Verdict (OK / Change / Remove)', 'Reviewer comment'];
const out = [header.map(csv).join(','), ...rows.map((r) => [r.section, r.id, r.where, r.item, r.content, r.source ?? '', '', ''].map(csv).join(','))].join('\n') + '\n';
fs.mkdirSync(path.join(REPO, 'review'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'review/clinical-review-packet.csv'), out);
fs.writeFileSync(path.join(REPO, 'review/clinical-review-packet.json'), JSON.stringify(rows, null, 1) + '\n');
const counts = rows.reduce<Record<string, number>>((a, r) => ((a[r.section] = (a[r.section] ?? 0) + 1), a), {});
console.log('review packet', rows.length, 'rows', JSON.stringify(counts));
