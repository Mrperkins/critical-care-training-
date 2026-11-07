/**
 * Courses built from data a lesson already has, for the large generated families:
 *  - disease explainers (atlas-*) use the disease definition: mechanism, distinction, findings and the
 *    bedside decisions with their reviewed explanations;
 *  - drug mechanisms (moa-*) use the mechanism blurb, summary, time course and adverse-effect notes.
 * Nothing here is new clinical content: it reorganises reviewed text into the two tracks.
 */
import { registerCourseResolver, type CourseMeta } from '../course';
import { steps, type Cue, type Timeline } from '../timeline';
import { DISEASE_BY_ID, lowerKeepAcronyms } from '../../atlas/registry';
import { EXPLAINERS } from '../../atlas/explainers';
import { MECH } from '../../moa/registry';
import { ADVERSE, TIMECOURSE } from '../../moa/meta';

const sentence = (s: string) => { const t = s.trim(); return t ? t[0].toUpperCase() + t.slice(1) + (/[.!?]$/.test(t) ? '' : '.') : t; };
const mins = ([a, b]: [number, number]) => (b < 1 ? `${Math.round(a * 60)}–${Math.round(b * 60)} s` : b >= 120 ? `${+(a / 60).toFixed(1)}–${+(b / 60).toFixed(1)} h` : `${a}–${b} min`);

/** pick the opening, the biggest change, every checkpoint and the close — about a third of the scenes */
function essentialScenes(s: Cue[], weight: (i: number) => number) {
  const keep = new Set<number>([s.length - 1]);
  s.forEach((c, i) => { if (c.checkpoint) keep.add(i); });
  const order = s.map((_, i) => i).filter((i) => i > 0 && i < s.length - 1).sort((a, b) => weight(b) - weight(a));
  const target = Math.max(3, Math.ceil(s.length * 0.4));
  for (const i of order) { if (keep.size >= target) break; keep.add(i); }
  return [...keep].sort((a, b) => a - b).map((i) => s[i].id);
}

function diseaseCourse(tl: Timeline): CourseMeta | null {
  if (!tl.id.startsWith('atlas-')) return null; const d = DISEASE_BY_ID[tl.id.slice(6)]; if (!d) return null;
  const ex = EXPLAINERS[d.id]; const s = steps(tl);
  const states = ex?.chapters.map((c) => c.state as Record<string, number>) ?? [];
  const jump = (i: number) => { const a = states[i - 1] ?? {}, b = states[i] ?? {}; return Object.keys({ ...a, ...b }).reduce((m, k) => m + Math.abs((b[k] ?? 0) - (a[k] ?? 0)), 0); };
  const best = d.decisions.find((x) => x.outcome === 'stabilize'); const bad = d.decisions.filter((x) => x.outcome === 'deteriorate');
  const findings = d.findings.map((f) => lowerKeepAcronyms(f.label));
  return {
    objectives: [ex?.outcome ?? sentence(d.mechanism), `Recognise the picture: ${findings.join(', ')}.`, best ? `Choose the first move and say why: ${lowerKeepAcronyms(best.label)}.` : sentence(d.question)].filter(Boolean),
    essentials: ex ? essentialScenes(s, jump) : s.filter((c) => /-(zoom|understand|apply)$/.test(c.id)).map((c) => c.id),
    keyPoints: [sentence(d.mechanism), sentence(d.distinction), `Look for ${findings.join(', ')}.`, ...(best ? [`${best.label}: ${best.explanation}`] : [])],
    pearls: ex?.chapters.filter((c) => c.checkpoint).map((c) => c.checkpoint!.answer) ?? [],
    pitfalls: bad.map((x) => `${x.label}: ${x.explanation}`),
    bedside: best ? sentence(best.label) : undefined,
    selfCheck: d.decisions.length >= 2 && best ? [{ q: d.question, options: d.decisions.map((x) => x.label), answer: d.decisions.indexOf(best), why: best.explanation }] : [],
  };
}

function drugCourse(tl: Timeline): CourseMeta | null {
  if (!tl.id.startsWith('moa-')) return null; const m = MECH[tl.id.slice(4)]; if (!m) return null;
  const s = steps(tl); const tc = TIMECOURSE[m.id]; const adv = ADVERSE[m.id];
  const ess = new Set<string>([s[0].id, s[s.length - 1].id]); if (s[1]) ess.add(s[1].id);
  return {
    objectives: [`Trace ${m.drug} from its target to what you see at the bedside.`, `Predict the dose response in the demo patient.`, ...(adv ? [`Name the adverse effect to watch for.`] : [])],
    essentials: s.filter((c) => ess.has(c.id)).map((c) => c.id),
    keyPoints: [sentence(m.blurb), ...(m.summary ? [sentence(m.summary)] : []), ...(tc ? [`${tc.route}: onset ${mins(tc.onset)}, peak ${mins(tc.peak)}, lasts ${mins(tc.duration)}.${tc.note ? ' ' + tc.note : ''}`] : []), ...(adv ? [`Watch for: ${adv.note}`] : [])],
    pitfalls: adv ? [adv.note] : [],
  };
}

registerCourseResolver(diseaseCourse);
registerCourseResolver(drugCourse);
