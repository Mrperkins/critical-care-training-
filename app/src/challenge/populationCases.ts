/**
 * Challenge cases for the paediatric, neonatal and obstetric lessons. Same contract as sceneCases.ts: setup puts
 * the module's own state on screen, facts are read from that state, verify proves the keyed answers.
 */
import type { SceneCase, CaseModule } from './sceneCases';
import { useUI } from '../app/store';
import { abgScene } from '../director/lessons/abg';
import { scene as ventScene } from '../director/lessons/vent';
import { shockScene } from '../director/lessons/lines';
import { lines } from '../lines/session';
import { useHeartUI } from '../heart/heartStore';
import { solveShunt, type ShuntInput } from '../heart/shunt';
import { APNOEA_BY_ID, apnoeaCurve } from '../physiology/apnoea';
import { compareAirways } from '../populations/airway';
import { NEO } from '../populations/neonatal';
import { pphParams, shockIndex } from '../populations/obstetric';
import { setApnoea, setAirway, setNeo, setOb, setPeds } from '../populations/popStore';
import { childParams, CHILD_NORMS } from '../populations/paediatric';

const mode = (m: CaseModule) => useUI.getState().set({ module: m, mode: 'challenge' });
const spo2At = (id: string, min: number) => { const c = apnoeaCurve(APNOEA_BY_ID[id], { minutes: 10 }); const i = Math.round((min * 60) / 2); return c.spo2[Math.min(i, c.spo2.length - 1)]; };
const t90 = (id: string) => apnoeaCurve(APNOEA_BY_ID[id], { minutes: 15 }).t90!;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const neo = (p: ShuntInput) => { useHeartUI.getState().set({ input: { ...p }, preset: 'custom', mode: 'sat', target: 'heart.pda' }); setNeo({ minute: null }); };
const neoFacts = (): [string, string][] => { const i = useHeartUI.getState().input; const s = solveShunt(i); return [['Right hand SpO₂', pct(s.sat.ao)], ['Foot SpO₂', pct(i.lesion === 'pda' ? s.sat.aoPost : s.sat.ao)], ['Mean aortic pressure', `${Math.round(s.p.aoMean)} mmHg`], ['Echo: PA pressure', `${Math.round(s.p.paSys)}/${Math.round(s.p.paDia)} mmHg`]]; };
const obFacts = (): [string, string][] => { const n = lines.num; return [['HR', `${Math.round(n.hr)}`], ['BP', `${Math.round(n.tSys)}/${Math.round(n.tDia)}`], ['MAP', `${Math.round(n.tMap)} mmHg`], ['CVP', `${Math.round(n.tCvp)} mmHg`]]; };

export const POP_CASES: SceneCase[] = [
  // ---------------------------------------------------------------- paediatric
  {
    id: 'case-abg-apnoea-infant', module: 'abg', card: 'apnoea', level: 'Intermediate', title: 'The laryngoscopy that takes too long',
    story: 'Three-month-old (6 kg), well pre-oxygenated and paralysed for intubation. Your colleague is still looking at the cords 75 seconds after the last breath. The saturation still reads high.',
    setup: () => { abgScene({ preset: 'normal' }); setApnoea({ shown: ['adult', 'child', 'infant'], highlight: 'infant', preox: true, headUp: false }); mode('abg'); },
    facts: () => [['Weight', '6 kg'], ['Pre-oxygenated', 'yes, tight seal'], ['Since last breath', '75 s'], ['SpO₂ now', pct(spo2At('infant', 1.25))]],
    questions: [
      { q: 'How long before the saturation falls below 90 %?', options: ['Well under a minute — call time now and ventilate', 'About five more minutes', 'About eight minutes, as in an adult', 'It will stay up while it reads this high'], answer: 0,
        explain: 'The reading is high because the top of the dissociation curve is flat, but the infant’s small oxygen store is nearly used up. Below 90 % the fall is fast.' },
      { q: 'Why is the infant so much faster than an adult?', options: ['Oxygen use per kilo is about twice as high, from a smaller lung volume that collapses after induction', 'Infants have less haemoglobin binding capacity at every age', 'Their pulse oximeters read late', 'They breathe faster, which uses up oxygen'], answer: 0,
        explain: 'Oxygen consumption of ≈ 7–8 mL/kg/min drains a functional residual capacity that the soft infant chest lets fall to ≈ 15 mL/kg.' },
    ],
    verify: () => { const left = t90('infant') - 1.25; return spo2At('infant', 1.25) >= 0.93 && left > 0.2 && left < 1 && t90('adult') > 3 * t90('infant'); },
  },
  {
    id: 'case-vent-croup', module: 'vent', card: 'airway', level: 'Novice', title: 'Barking cough, stridor',
    story: 'Two-year-old with a barking cough and stridor at rest, frightened and starting to cry. The subglottis has about a millimetre of swelling all round.',
    setup: () => { ventScene('normal', {}, { view: 'airway' }); setAirway({ swellMm: 1, crying: false }); mode('vent'); },
    facts: () => { const [inf] = compareAirways(1); return [['Airway diameter (normal)', `${inf.d} mm`], ['After swelling', `${inf.swollen} mm`], ['Area left', `${Math.round(inf.areaLeft * 100)} %`]]; },
    questions: [
      { q: 'By how much has the resistance to quiet breathing risen?', options: ['About 16 times', 'About 2 times', 'About 4 times', 'It has not changed'], answer: 0,
        explain: 'Laminar resistance rises with the fourth power of the radius: from 4 mm to 2 mm diameter halves the radius, 2⁴ = 16.' },
      { q: 'What should you avoid?', options: ['Upsetting the child — crying makes flow turbulent and the work of breathing much higher', 'Letting the parent hold the child', 'Sitting the child up', 'Giving humidified oxygen by a mask the child tolerates'], answer: 0,
        explain: 'Turbulent flow through the narrowed segment needs pressure that rises with the fifth power of the radius (× 32). Keep the child calm and upright, with a parent.' },
    ],
    verify: () => { const [inf, ad] = compareAirways(1); return Math.round(inf.laminar) === 16 && Math.round(inf.turbulent) === 32 && ad.laminar < 4; },
  },
  {
    id: 'case-lines-child-shock', card: 'peds', module: 'lines', level: 'Intermediate', title: 'A quiet, pale four-year-old',
    story: 'Four-year-old (16 kg) hit by a car 40 minutes ago. Quiet, pale and cool. The arterial line is in. Her blood pressure is reassuring, says a colleague.',
    setup: () => { shockScene({ id: 'child', view: 'bed', params: childParams(0.25) }); setPeds({ lossFrac: 0.25, bloodMlKg: 0 }); mode('lines'); }, facts: obFacts,
    questions: [
      { q: 'Is she in shock?', options: ['Yes — compensated shock: tachycardia, narrow pulse pressure, cool skin with a normal pressure', 'No — the systolic pressure is normal for her age', 'Only if the capillary refill exceeds 6 s', 'Not until she becomes hypotensive'], answer: 0,
        explain: 'Children maintain their pressure with tachycardia and intense vasoconstriction until about a third of their blood volume is lost. Hypotension is late.' },
      { q: 'What if her heart rate starts to fall without treatment?', options: ['Pre-arrest: the failing, hypoxic heart is slowing — act now', 'She is improving', 'Pain relief is working', 'Normal for sleep'], answer: 0,
        explain: 'In a shocked child bradycardia is an ominous sign that the heart is running out of oxygen.' },
    ],
    verify: () => { shockScene({ id: 'child', view: 'bed', params: childParams(0.25) }); const n = lines.num; return n.tSys >= CHILD_NORMS.sbpLow && n.hr > CHILD_NORMS.hr[1] && n.tSys - n.tDia < 35; },
  },
  // ---------------------------------------------------------------- neonatal
  {
    id: 'case-heart-pphn', module: 'heart', card: 'neo', level: 'Advanced', title: 'Pink hand, blue feet',
    story: 'Term newborn, meconium at delivery, now four hours old and hard to oxygenate. Two probes: right hand and a foot.',
    setup: () => { neo(NEO.pphn); mode('heart'); }, facts: neoFacts,
    questions: [
      { q: 'What does the difference between the probes tell you?', options: ['Right-to-left flow across the ductus: pulmonary pressure is at or above systemic — PPHN', 'A faulty foot probe', 'Normal newborn transition', 'Left-to-right flow through a PDA'], answer: 0,
        explain: 'The ductus enters the aorta beyond the right subclavian artery. Deoxygenated blood crossing it reaches the legs, not the right hand.' },
      { q: 'Which of these lowers pulmonary resistance?', options: ['Oxygen, normal CO₂, warmth, correcting acidosis — and inhaled nitric oxide', 'Letting the CO₂ rise to protect the lungs', 'Keeping the baby cool', 'Restricting oxygen to avoid toxicity'], answer: 0,
        explain: 'Hypoxia, hypercapnia, acidosis and cold all constrict the pulmonary vessels. Inhaled nitric oxide relaxes pulmonary vessels selectively.' },
    ],
    verify: () => { const s = solveShunt(NEO.pphn); const t = solveShunt(NEO.pphnTreated); return s.sat.ao - s.sat.aoPost > 0.15 && s.rl > 0 && t.sat.ao - t.sat.aoPost < 0.03; },
  },
  {
    id: 'case-heart-pphn-atrial', module: 'heart', card: 'neo', level: 'Expert', title: 'Both probes low, no difference',
    story: 'Same baby a few hours later. The right hand and the foot now read the same — and both are low. A colleague says the difference has gone, so the PPHN is better.',
    setup: () => { neo(NEO.pphnAtrial); mode('heart'); }, facts: neoFacts,
    questions: [
      { q: 'Is the colleague right?', options: ['No — blood is now also crossing the foramen ovale right-to-left, lowering both hand and foot', 'Yes — no difference means no pulmonary hypertension', 'Yes — the ductus has closed, so the problem is solved', 'The probes must both be faulty'], answer: 0,
        explain: 'Shunting at atrial level mixes deoxygenated blood before the aorta, so pre- and post-ductal saturations fall together. A low pre-ductal saturation still needs an explanation.' },
      { q: 'What raised the right atrial pressure?', options: ['A struggling right ventricle pumping against high pulmonary resistance', 'Too much oxygen', 'Closure of the ductus arteriosus by itself', 'Low pulmonary resistance'], answer: 0,
        explain: 'Against a high pulmonary resistance the right ventricle dilates and its filling pressure rises until right atrial pressure exceeds left and the flap opens.' },
    ],
    verify: () => { const s = solveShunt(NEO.pphnAtrial); return s.direction === 'R→L' && s.sat.ao < 0.9 && s.p.ra > s.p.la; },
  },
  // ---------------------------------------------------------------- obstetric
  {
    id: 'case-abg-apnoea-preg', module: 'abg', card: 'apnoea', level: 'Advanced', title: 'Emergency intubation at 38 weeks',
    story: 'Rapid-sequence induction at term for eclamptic seizures. Pre-oxygenated well. Four minutes into a difficult laryngoscopy the saturation is still high.',
    setup: () => { abgScene({ preset: 'pregnant' }); setApnoea({ shown: ['adult', 'pregnant'], highlight: 'pregnant', preox: true, headUp: false }); mode('abg'); },
    facts: () => [['Gestation', '38 weeks'], ['Since last breath', '4 min'], ['SpO₂ now', pct(spo2At('pregnant', 4))]],
    questions: [
      { q: 'What now?', options: ['Stop and oxygenate now (mask or supraglottic airway): she is about a minute from the cliff', 'Keep going — 98 % leaves plenty of time', 'Wait for the saturation to reach 90 % before stopping', 'Apply cricoid pressure harder and continue'], answer: 0,
        explain: 'A smaller functional residual capacity and higher oxygen use give a term pregnancy about five minutes, not eight — and the fall below 90 % is steep.' },
      { q: 'What would have bought her more time?', options: ['Head-up position during pre-oxygenation and nasal oxygen during the attempt', 'Lying her completely flat', 'Pre-oxygenating with room air', 'Hyperventilating after induction'], answer: 0,
        explain: 'Head-up (with left uterine displacement) gives back some lung volume; oxygen flowing through the nose keeps topping up the alveoli during apnoea.' },
    ],
    verify: () => { const c = apnoeaCurve(APNOEA_BY_ID.pregnant, { minutes: 15 }); return spo2At('pregnant', 4) > 0.95 && c.t90! > 4 && c.t90! < 6 && t90('adult') - c.t90! > 2 && apnoeaCurve(APNOEA_BY_ID.pregnant, { minutes: 15, headUp: true }).t90! > c.t90!; },
  },
  {
    id: 'case-lines-aortocaval', module: 'lines', card: 'ob', level: 'Novice', title: 'Faint on the stretcher at 36 weeks',
    story: '36 weeks pregnant, transferred for reduced fetal movements. Lying flat on the stretcher she becomes pale, sweaty and light-headed.',
    setup: () => { shockScene({ id: 'pregSupine', view: 'bed' }); setOb({ lossMl: null, supine: true }); mode('lines'); }, facts: obFacts,
    questions: [
      { q: 'What is the most likely cause?', options: ['Aortocaval compression: the uterus is squeezing the inferior vena cava', 'Hidden haemorrhage', 'Pulmonary embolism', 'Vasovagal fainting only'], answer: 0,
        explain: 'Supine at term, venous return falls and output drops by up to a third; the low CVP fits.' },
      { q: 'First action?', options: ['Left uterine displacement — tilt her or push the uterus to the left', 'A 2 L fluid bolus', 'Start a vasopressor infusion', 'Raise her legs while keeping her flat'], answer: 0,
        explain: 'Relieving the compression restores venous return within a minute; the placenta, which has no autoregulation, benefits at once.' },
    ],
    verify: () => { shockScene({ id: 'pregSupine', view: 'bed' }); const sup = lines.num.tMap; shockScene({ id: 'pregnant', view: 'bed' }); const tilt = lines.num.tMap; return tilt - sup > 10 && sup < 75; },
  },
  {
    id: 'case-lines-pph', module: 'lines', card: 'ob', level: 'Advanced', title: 'Bleeding after delivery, pressure “fine”',
    story: 'Thirty minutes after a vaginal delivery, a soft uterus and ongoing bleeding. The estimated loss is nearly two litres. The midwife says the blood pressure is fine.',
    setup: () => { shockScene({ id: 'pregnant', view: 'bed', params: pphParams(1800) }); setOb({ lossMl: 1800, supine: false }); mode('lines'); }, facts: obFacts,
    questions: [
      { q: 'How worried should you be?', options: ['Very — the shock index is well above 1: she is compensating for a large loss', 'Not very — the systolic pressure is still near 90', 'Only if she becomes confused', 'Only once the pressure falls below 70'], answer: 0,
        explain: 'Pregnant women hold their pressure until late because of a 6.5 L blood volume and strong vasoconstriction. Heart rate divided by systolic pressure unmasks the loss.' },
      { q: 'Best next steps?', options: ['Uterine massage and uterotonics, tranexamic acid, blood and products, call for help', 'Crystalloid until the pressure is normal, then reassess', 'Wait for a haemoglobin result', 'Vasopressor to raise the pressure'], answer: 0,
        explain: 'Treat the cause (uterine atony is the commonest) and replace blood; early tranexamic acid reduces death from bleeding.' },
    ],
    verify: () => { shockScene({ id: 'pregnant', view: 'bed', params: pphParams(1800) }); const n = lines.num; return shockIndex(n.hr, n.tSys) > 1.1 && n.tSys > 80; },
  },
];
