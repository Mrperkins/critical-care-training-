import type { CoronaryTerritory, Dominance, LessonStep, QuizCase } from './types';
import { VESSEL } from './vessels';
import { LEAD } from './leads';

const list = (ids: string[]) => ids.length <= 1 ? ids.join('') : ids.slice(0, -1).join(', ') + ' and ' + ids[ids.length - 1];

/** Pick the culprit shown for a given dominance. */
export function primaryCulprit(t: CoronaryTerritory, dominance: Dominance) {
  return t.commonCulpritVessels.find((c) => c.likelihood === 'common' && (!c.dominance || c.dominance === dominance))
    ?? t.commonCulpritVessels.find((c) => !c.dominance || c.dominance === dominance)
    ?? t.commonCulpritVessels[0];
}

/**
 * Guided lessons are generated from territory data, so adding a territory
 * automatically adds a lesson. Progressive disclosure: one idea per step.
 */
export function buildLesson(t: CoronaryTerritory, dominance: Dominance): LessonStep[] {
  const c = primaryCulprit(t, dominance);
  const v = VESSEL[c.vessel];
  const facing = t.affectedLeads.map((l) => LEAD[l].label);
  const recip = t.reciprocalLeads.map((l) => LEAD[l].label);
  const steps: LessonStep[] = [
    { id: 'normal', title: 'A normal beating heart', text: 'Every region of myocardium is perfused and contracting. The ECG is normal.', show: { ecg: true, ecgMorph: 0, camera: 'overview' } },
    { id: 'vessel', title: `The ${v.short}`, text: `${v.name}. ${v.course} It is the common culprit vessel here, but coronary anatomy varies between patients.`, show: { highlightVessel: true, flow: true, ecg: true, ecgMorph: 0, camera: 'vessel' } },
    { id: 'occlusion', title: 'A thrombus occludes the artery', text: c.note, show: { highlightVessel: true, flow: true, occlusion: 1, ecg: true, ecgMorph: 0.05, camera: 'vessel' } },
    { id: 'perfusion', title: 'Downstream perfusion stops', text: 'Blood can no longer reach the myocardium beyond the occlusion. Branches that leave the artery before the blockage keep flowing.', show: { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, ecg: true, ecgMorph: 0.25, camera: 'territory' } },
    { id: 'injury', title: 'The myocardium becomes ischemic, then injured', text: `The ${t.short.toLowerCase()} myocardium turns dusky and stops contracting normally. Injured cells leak current, creating an injury vector that points out through this wall.`, show: { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, injury: 1, ecg: true, ecgMorph: 0.55, camera: 'territory' } },
    { id: 'ecg', title: 'The ECG changes', text: 'Hyperacute T waves come first. Within minutes the ST segments lift in the leads that face the injured wall.', show: { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, injury: 1, ecg: true, ecgMorph: 0.85, camera: 'territory' } },
    { id: 'facing', title: `${list(facing)} face this wall`, text: `The positive electrodes of ${list(facing)} look at the ${t.short.toLowerCase()} wall, so the injury vector points toward them: ST elevation.`, show: { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, injury: 1, ecg: true, ecgMorph: 1, emphasizeAffected: true, showExtraLeads: t.extraLeads.length > 0, camera: 'territory' } },
  ];
  if (recip.length) steps.push({ id: 'reciprocal', title: 'Reciprocal changes', text: `${list(recip)} look at the heart from the opposite side. They see the same injury vector pointing away, so they record ST depression: a mirror image.`, show: { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, injury: 1, ecg: true, ecgMorph: 1, emphasizeAffected: true, emphasizeReciprocal: true, showExtraLeads: t.extraLeads.length > 0, camera: 'territory' } });
  steps.push({ id: 'summary', title: `Why ${list(facing)}?`, text: t.explanation, show: { highlightVessel: true, flow: true, occlusion: 1, perfusionLoss: 1, injury: 1, ecg: true, ecgMorph: 1, emphasizeAffected: true, emphasizeReciprocal: true, showExtraLeads: t.extraLeads.length > 0, camera: 'territory' } });
  return steps;
}

export const QUIZ_CASES: QuizCase[] = [
  { id: 'q-inferior', title: 'Chest pain and bradycardia', vignette: '64-year-old man, crushing chest pain for 40 minutes. HR 52, BP 104/66.', territoryId: 'inferior', dominance: 'right' },
  { id: 'q-anterior', title: 'Pain at rest', vignette: '58-year-old woman, 30 minutes of central chest pressure radiating to the jaw.', territoryId: 'anterior', dominance: 'right' },
  { id: 'q-anteroseptal', title: 'Diaphoretic and pale', vignette: '52-year-old man, sudden chest pain while shovelling snow.', territoryId: 'anteroseptal', dominance: 'right' },
  { id: 'q-lateral', title: 'Vague discomfort', vignette: '71-year-old diabetic woman with nausea and left arm heaviness.', territoryId: 'lateral', dominance: 'right' },
  { id: 'q-posterior', title: '“Just ST depression”', vignette: '60-year-old man with ongoing chest pain. The first read says anterior ischemia.', territoryId: 'posterior', dominance: 'right' },
  { id: 'q-rv', title: 'Hypotension after nitroglycerin', vignette: '67-year-old man; BP fell from 118 to 78 systolic after one sublingual nitro. Clear lungs, raised JVP.', territoryId: 'rv', dominance: 'right' },
  { id: 'q-extensive', title: 'Cardiogenic shock', vignette: '49-year-old smoker, grey and clammy. BP 84/50, crackles to mid-lung fields.', territoryId: 'extensiveAnterior', dominance: 'right' },
  { id: 'q-highlateral', title: 'Easy to miss', vignette: '55-year-old woman with epigastric pain. The inferior leads look “only depressed”.', territoryId: 'highLateral', dominance: 'right' },
];
