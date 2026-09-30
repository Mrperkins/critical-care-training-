/**
 * Scene-based challenge cases for the modules that had none (Abdomen, Brain, Heart) and for chest imaging
 * (X-ray / lung ultrasound on the ventilator patient). Each case puts the module's EXISTING state where the
 * case needs it — nothing is drawn or typed in by hand — and the learner reads the live picture and the
 * bedside numbers. `verify` is run by the tests: the keyed answers must agree with what the engines say
 * about that exact state, so a later engine change cannot silently make a case wrong.
 * Questions and explanations are this app's own teaching wording (not protocol text).
 */
import { useUI } from '../app/store';
import { loadAbdPreset, useAbdUI, currentAbdomen } from '../abdomen/abdomenStore';
import { fastExam, shockClass, abdomenFindings } from '../abdomen/state';
import { ctaFindings, type CtaLevel } from '../abdomen/cta';
import { useCtaUI } from '../abdomen/ctaStore';
import { useNeuroUI, presetState, type NeuroPreset } from '../neuro/neuroStore';
import { useIcpUI } from '../neuro/icpStore';
import { neuroExam } from '../neuro/exam';
import { icpState, ICP_DEFAULT, type IcpInput } from '../neuro/icp';
import { DEFAULT_SYSTEMIC, type NeuroState } from '../neuro/perfusion';
import { loadHeartPreset, useHeartUI } from '../heart/heartStore';
import { solveShunt, HEART_PRESETS, type HeartPresetId } from '../heart/shunt';
import { session } from '../vent/session';
import { scene as ventScene } from '../director/lessons/vent';
import { cxrFromVent, cxrFindings } from '../vent/cxr';
import { lusFromVent } from '../vent/lus';
import { ventNumbers } from '../vent/numbers';
import { POP_CASES } from './populationCases';

export type CaseModule = 'abdomen' | 'neuro' | 'heart' | 'vent' | 'abg' | 'lines';
export interface CaseQ { q: string; options: [string, string, string, string]; answer: 0 | 1 | 2 | 3; explain: string }
export interface SceneCase {
  /** 'case-<abd|neuro|heart|img|vent|abg|lines>-…' — the middle part says which module it runs in */
  id: string; module: CaseModule; level: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
  title: string; story: string;
  setup: () => void;
  facts: () => [string, string][];
  questions: CaseQ[];
  verify: () => boolean;
}

const mode = (m: CaseModule) => useUI.getState().set({ module: m, mode: 'challenge' });

/* ------------------------------------------------------------------ abdomen */
function abd(preset: Parameters<typeof loadAbdPreset>[0], minutes: number, view: 'us' | 'cta' | '3d', level?: CtaLevel) {
  loadAbdPreset(preset); useAbdUI.getState().set({ minutes, view, target: 'abdomen.whole' }); if (level) useCtaUI.getState().set(level);
}
const abdVitals = (): [string, string][] => { const s = shockClass(currentAbdomen()); return [['HR', `${s.hr}`], ['SBP', `${s.sbp} mmHg`], ['RR', `${s.rr}`], ['Mental status', s.mental]]; };

/* ------------------------------------------------------------------ brain */
const ICH = (ml: number): NeuroState => ({ ...presetState('ich'), hemorrhage: { kind: 'ich', at: [0.33, -0.22, 0.08], volumeMl: ml } });
function brain(st: NeuroState, preset: NeuroPreset, icp: Partial<IcpInput> = {}) {
  useNeuroUI.getState().set({ preset, state: st, sys: { ...DEFAULT_SYSTEMIC }, playing: false, view: '3d', target: 'brain.whole' });
  useIcpUI.getState().set({ input: { ...ICP_DEFAULT, ...icp } });
}
const curIcp = () => icpState(useNeuroUI.getState().state, useNeuroUI.getState().sys, useIcpUI.getState().input);
/** the exam as a bedside examiner reports it — without the teaching hints that name the lesion */
const examFacts = (): [string, string][] => {
  const e = neuroExam(useNeuroUI.getState().state, useNeuroUI.getState().sys);
  return [['NIHSS (approx.)', `${e.nihss.total}`], ...e.findings.map((f, i) => [i === 0 ? 'Exam' : '', f.replace(/\s*\((toward the lesion|brainstem)\)/, '')] as [string, string])];
};
const icpFacts = (): [string, string][] => {
  const s = curIcp(); const pup = (k: 'L' | 'R') => `${s.pupils[k].mm} mm ${s.pupils[k].reactive ? 'reactive' : 'fixed'}`;
  return [['BP (MAP)', `${Math.round(s.map)} mmHg`], ['HR', `${Math.round(s.hr)}`], ['Breathing', s.resp], ['Pupils', `L ${pup('L')} · R ${pup('R')}`], ['Motor', s.posture === 'none' ? 'localises' : s.posture], ['GCS', `≤ ${s.gcsCap}`], ...(s.evd ? [['EVD reads', `${Math.round(s.evd.readsIcp)} mmHg`] as [string, string], ['EVD output', s.evd.overdrainage ? 'brisk, continuous' : s.evd.drainingMlH ? `${s.evd.drainingMlH} mL/h` : 'none']] as [string, string][] : [])];
};

/* ------------------------------------------------------------------ heart */
const heart = (id: HeartPresetId) => { loadHeartPreset(id); useHeartUI.getState().set({ mode: 'sat', target: 'heart.four_chamber' }); };
const heartFacts = (): [string, string][] => {
  const s = solveShunt(useHeartUI.getState().input);
  return [['SpO₂ (hand)', `${Math.round(s.sat.ao * 100)}%`], ['SpO₂ (foot)', `${Math.round(s.sat.aoPost * 100)}%`], ['PA pressure', `${Math.round(s.p.paSys)}/${Math.round(s.p.paDia)} mmHg`], ['Aortic pressure', `${Math.round(s.p.aoSys)}/${Math.round(s.p.aoDia)} mmHg`]];
};

/* ------------------------------------------------------------------ chest imaging (vent patient) */
const img = (id: string, view: 'xray' | 'lus') => ventScene(id, {}, { view });
const ventFacts = (): [string, string][] => {
  const n = ventNumbers(session); const s = session.snap;
  return [['Peak pressure', `${Math.round(n.pip)} cmH₂O`], ['SpO₂', `${Math.round(s.spo2 * 100)}%`], ['BP', `${Math.round(s.sbp)}/${Math.round(s.dbp)}`], ['HR', `${Math.round(s.hr)}`]];
};

const BASE_CASES: SceneCase[] = [
  // ---------------------------------------------------------------- abdomen
  {
    id: 'case-abd-fast-early', module: 'abdomen', level: 'Novice', title: 'Negative FAST, left-sided impact',
    story: 'Motorcyclist, left lower rib fractures, minutes after the crash. You scan all four windows in the aircraft. Then you scan again ten minutes later.',
    setup: () => { abd('spleen4', 3, 'us'); mode('abdomen'); }, facts: abdVitals,
    questions: [
      { q: 'The first scan: what does it tell you?', options: ['Not enough blood yet to see — a negative FAST does not exclude injury; repeat it', 'No intra-abdominal injury — the abdomen is cleared', 'The bleeding must be retroperitoneal', 'The probe must be in the wrong place'], answer: 0,
        explain: 'FAST needs on the order of a few hundred mL of intraperitoneal fluid before a window turns positive. Early after injury it is often negative; its value is in repeating it as the picture evolves.' },
      { q: 'Ten minutes later, where does blood from the spleen appear first?', options: ['LUQ — splenorenal space and above the spleen', 'RUQ — Morison’s pouch', 'Subxiphoid — pericardium', 'Nowhere until it reaches the pelvis'], answer: 0,
        explain: 'Morison’s pouch is the most sensitive window overall, but splenic blood collects around the spleen and in the splenorenal space first, then spills down the left gutter to the pelvis before it reaches the right upper quadrant.' },
    ],
    verify: () => { abd('spleen4', 3, 'us'); const a = fastExam(currentAbdomen()); abd('spleen4', 10, 'us'); const b = fastExam(currentAbdomen()); const w = (x: typeof b, id: string) => x.find((y) => y.id === id)!.positive;
      return currentAbdomen({ base: useAbdUI.getState().base, minutes: 3 }).freeFluidMl > 0 && a.every((x) => !x.positive) && w(b, 'luq') && !w(b, 'ruq'); },
  },
  {
    id: 'case-abd-fast-spleen', module: 'abdomen', level: 'Intermediate', title: 'Positive FAST, rising heart rate',
    story: 'Same patient, now 30 minutes after the crash and still in the aircraft. Scan all four windows.',
    setup: () => { abd('spleen4', 30, 'us'); mode('abdomen'); }, facts: abdVitals,
    questions: [
      { q: 'Which windows show free fluid?', options: ['RUQ, LUQ and pelvis', 'LUQ only', 'Pericardium only', 'None — it is retroperitoneal'], answer: 0,
        explain: 'With several hundred mL the fluid has filled the left upper quadrant, run down the left paracolic gutter into the pelvis and reached Morison’s pouch.' },
      { q: 'Estimated haemorrhage class?', options: ['Class II — tachycardic, pressure still held', 'Class I', 'Class III', 'Class IV'], answer: 0,
        explain: 'Blood loss of roughly 15–30 %: the heart rate climbs and the pulse pressure narrows, but systolic pressure is still maintained. Waiting for hypotension means waiting for class III.' },
    ],
    verify: () => { abd('spleen4', 30, 'us'); const s = currentAbdomen(); const f = fastExam(s); return ['ruq', 'luq', 'pelvis'].every((id) => f.find((w) => w.id === id)!.positive) && shockClass(s).cls === 2; },
  },
  {
    id: 'case-abd-aaa', module: 'abdomen', level: 'Advanced', title: 'Back pain, pulsatile mass, negative FAST',
    story: '74-year-old, sudden back and left flank pain, near-syncope at home. The FAST is negative. The receiving centre sends the CT angiogram through before you land.',
    setup: () => { abd('aaaContained', 30, 'cta', 'infrarenal'); mode('abdomen'); }, facts: abdVitals,
    questions: [
      { q: 'What does the CT show at the infrarenal level?', options: ['A 7 cm aneurysm with a retroperitoneal haematoma — contained rupture', 'An intact aneurysm, no bleeding', 'Free intraperitoneal rupture', 'A dissection flap'], answer: 0,
        explain: 'A large aneurysm with eccentric thrombus and blood beside it in the retroperitoneum: a contained rupture. It can become free rupture at any moment.' },
      { q: 'Why was the FAST negative?', options: ['FAST sees intraperitoneal fluid; this blood is retroperitoneal', 'The haematoma is too small to matter', 'The scan was done too early — repeat it to rule out rupture', 'Aneurysms cannot be seen on ultrasound'], answer: 0,
        explain: 'The retroperitoneum is invisible to FAST. A negative FAST in a patient with a known or suspected AAA and pain does not rule out rupture.' },
      { q: 'Pressure strategy en route?', options: ['Permissive hypotension: enough pressure for mentation, no push to normal, straight to a vascular centre', 'Fluid bolus to a normal blood pressure', 'Start a vasodilator to protect the aneurysm', 'Divert to the nearest hospital for a formal CT first'], answer: 0,
        explain: 'Raising the pressure can turn a contained rupture into a free one. Accept a low pressure while the patient is awake, give blood rather than crystalloid when needed, and get to definitive repair.' },
    ],
    verify: () => { abd('aaaContained', 30, 'cta'); const s = currentAbdomen(); return ctaFindings(s, 'infrarenal').some((f) => /contained rupture/.test(f)) && fastExam(s).every((w) => !w.positive); },
  },
  {
    id: 'case-abd-dissect-a', module: 'abdomen', level: 'Advanced', title: 'Tearing chest pain to the back',
    story: '58-year-old with sudden tearing chest pain radiating to the back. The CTA is on your screen at the chest level.',
    setup: () => { abd('dissectA', 30, 'cta', 'chest'); mode('abdomen'); }, facts: abdVitals,
    questions: [
      { q: 'What type is this, and what does it need?', options: ['Stanford type A — the ascending aorta is involved: emergency surgery', 'Stanford type B — medical therapy first', 'No dissection — the aorta is normal', 'Type B — immediate endovascular stent'], answer: 0,
        explain: 'Any involvement of the ascending aorta makes it type A: at risk of tamponade, aortic regurgitation and coronary occlusion. It goes to cardiothoracic surgery.' },
      { q: 'While you transport, how do you treat the pressure?', options: ['Rate first (β-blocker toward ≈ 60), then a vasodilator for systolic ≈ 100–120', 'Vasodilator first, then a β-blocker', 'Leave it — the pressure is protective', 'Fluids to maintain perfusion of the false lumen'], answer: 0,
        explain: 'Anti-impulse therapy lowers the force of each ejection (dP/dt) as well as the pressure. A vasodilator alone causes a reflex tachycardia that increases shear on the flap.' },
    ],
    verify: () => { abd('dissectA', 30, 'cta'); const s = currentAbdomen(); return s.dissection?.type === 'A' && ctaFindings(s, 'chest').some((f) => /type A/.test(f)); },
  },
  {
    id: 'case-abd-dissect-b', module: 'abdomen', level: 'Expert', title: 'Type B dissection with a rising creatinine',
    story: 'Known type B dissection on esmolol and nicardipine. Pain persists, urine output is falling. Step to the renal level of the CTA.',
    setup: () => { abd('dissectB', 30, 'cta', 'renal'); mode('abdomen'); }, facts: abdVitals,
    questions: [
      { q: 'What is the new finding at the renal level?', options: ['The left kidney enhances poorly — its artery arises from the false lumen', 'Both kidneys are normal', 'A retroperitoneal haematoma', 'The flap has extended into the ascending aorta'], answer: 0,
        explain: 'The branch fed by a poorly flowing false lumen is under-perfused: renal malperfusion.' },
      { q: 'What does malperfusion change?', options: ['It is now a complicated type B: urgent endovascular repair, not medical therapy alone', 'Nothing — continue anti-impulse therapy', 'It becomes a type A dissection', 'Stop the β-blocker to raise renal perfusion'], answer: 0,
        explain: 'Malperfusion, rupture, refractory pain or uncontrolled hypertension turn an uncomplicated type B into a complicated one, which is treated by covering the entry tear.' },
    ],
    verify: () => { abd('dissectB', 30, 'cta'); const s = currentAbdomen(); return !!s.dissection?.malperfusion.renalL && ctaFindings(s, 'renal').some((f) => /Left kidney poorly enhancing/.test(f)) && abdomenFindings(s).some((f) => /Malperfusion/.test(f)); },
  },
  // ---------------------------------------------------------------- brain
  {
    id: 'case-neuro-m1l', module: 'neuro', level: 'Novice', title: 'Sudden weakness and no words',
    story: 'Right-handed 67-year-old found by his wife an hour after last known well. Examine, then decide.',
    setup: () => { brain(presetState('m1_L'), 'm1_L'); mode('neuro'); }, facts: examFacts,
    questions: [
      { q: 'Where is the occlusion?', options: ['Left middle cerebral artery (M1)', 'Right middle cerebral artery', 'Basilar artery', 'Left posterior cerebral artery'], answer: 0,
        explain: 'Right face, arm and leg weakness with global aphasia, gaze toward the left and a right field defect: the whole left MCA territory in a left-dominant patient — a proximal (M1) occlusion.' },
      { q: 'Next step?', options: ['CT with CT angiography (± perfusion) to confirm a large-vessel occlusion for thrombectomy', 'MRI before any decision', 'Wait for the deficit to settle — it may be a TIA', 'Lumbar puncture'], answer: 0,
        explain: 'A severe cortical deficit predicts a large-vessel occlusion. Non-contrast CT excludes haemorrhage; CTA shows the clot; perfusion shows how much is still salvageable. Go to a thrombectomy-capable centre.' },
    ],
    verify: () => { const e = neuroExam(presetState('m1_L')); return e.aphasia === 'global' && e.power.armR <= 2 && e.gaze.deviation === 'L'; },
  },
  {
    id: 'case-neuro-m1r', module: 'neuro', level: 'Intermediate', title: 'Left weakness, talking normally',
    story: 'Right-handed 71-year-old, sudden left-sided weakness. She says she feels fine.',
    setup: () => { brain(presetState('m1_R'), 'm1_R'); mode('neuro'); }, facts: examFacts,
    questions: [
      { q: 'Where is the occlusion?', options: ['Right middle cerebral artery (M1)', 'Left middle cerebral artery', 'Right posterior cerebral artery', 'Basilar artery'], answer: 0,
        explain: 'Left hemiparesis with gaze to the right, a left field defect and neglect of the left side: the right MCA territory.' },
      { q: 'Why is there no aphasia?', options: ['Language lives in the left (dominant) hemisphere; the right hemisphere gives neglect instead', 'The occlusion is too small', 'Aphasia appears only after 24 h', 'Aphasia is a brainstem sign'], answer: 0,
        explain: 'In most right-handed people language is left-hemispheric. A non-dominant stroke can be as large but shows neglect and anosognosia — “she feels fine” is part of the deficit.' },
    ],
    verify: () => { const e = neuroExam(presetState('m1_R')); return e.aphasia === 'none' && e.neglect === 'L' && e.power.armL <= 2 && e.gaze.deviation === 'R'; },
  },
  {
    id: 'case-neuro-p2r', module: 'neuro', level: 'Intermediate', title: 'Bumping into doorframes',
    story: '63-year-old keeps walking into things on her left. Strength and speech are normal.',
    setup: () => { brain(presetState('p2_R'), 'p2_R'); mode('neuro'); }, facts: examFacts,
    questions: [
      { q: 'Where is the lesion?', options: ['Right posterior cerebral artery — occipital cortex', 'Left posterior cerebral artery', 'Right middle cerebral artery', 'Left eye'], answer: 0,
        explain: 'A left homonymous hemianopia (both eyes, left half of the field) comes from the right occipital cortex, supplied by the right PCA.' },
      { q: 'The NIHSS is low. What does that mean?', options: ['Posterior-circulation strokes score low; a low score does not mean a small or harmless stroke', 'It is too mild to image', 'It excludes a vascular cause', 'It means the stroke is in the brainstem'], answer: 0,
        explain: 'The scale weights limb power and language. Visual, cerebellar and brainstem deficits are under-scored — judge the deficit, not the number.' },
    ],
    verify: () => { const e = neuroExam(presetState('p2_R')); return e.hemianopia === 'L' && e.nihss.total <= 4 && e.power.armL >= 5 && e.power.armR >= 5; },
  },
  {
    id: 'case-neuro-basilar', module: 'neuro', level: 'Advanced', title: 'Dizzy, then unresponsive',
    story: '55-year-old, vertigo and slurred speech this morning, now barely rousable with weakness of all four limbs.',
    setup: () => { brain(presetState('basilar'), 'basilar'); mode('neuro'); }, facts: examFacts,
    questions: [
      { q: 'Which vessel?', options: ['Basilar artery', 'Left middle cerebral artery', 'Both anterior cerebral arteries', 'Right internal carotid'], answer: 0,
        explain: 'Reduced consciousness, gaze palsy, four-limb weakness, dysarthria and ataxia: the brainstem and cerebellum, supplied by the basilar artery.' },
      { q: 'Priorities?', options: ['Protect the airway, then emergent CTA and thrombectomy — the window is often wider for basilar occlusion', 'Supportive care only — prognosis is fixed', 'MRI first to confirm', 'Wait for a second opinion before imaging'], answer: 0,
        explain: 'Untreated basilar occlusion is usually fatal or devastating. The airway is at risk from the depressed consciousness and bulbar weakness; reperfusion is offered later than for anterior strokes in many centres.' },
    ],
    verify: () => { const e = neuroExam(presetState('basilar')); return e.gcs <= 8 && e.gaze.palsy && e.ataxia && e.power.armL <= 2 && e.power.armR <= 2; },
  },
  {
    id: 'case-neuro-uncal', module: 'neuro', level: 'Advanced', title: 'A blown pupil after an ICH',
    story: 'Left basal-ganglia haemorrhage, intubated for transfer. The haematoma has grown. Look at the pupils and the motor response.',
    setup: () => { brain(ICH(54), 'ich'); mode('neuro'); }, facts: icpFacts,
    questions: [
      { q: 'What is happening?', options: ['Left uncal herniation: the temporal lobe is compressing the left third nerve', 'Right uncal herniation', 'Tonsillar herniation', 'An eye drop was given'], answer: 0,
        explain: 'The pupil on the side of the mass dilates and stops reacting first, as the uncus is pushed over the tentorial edge onto the third nerve.' },
      { q: 'Bridge to surgery?', options: ['Head up 30°, hyperosmolar therapy, keep MAP up; brief hyperventilation only as a bridge', 'Prolonged hyperventilation to a PaCO₂ of 25', 'Lower the blood pressure to a MAP of 60', 'Lie the patient flat to improve cerebral blood flow'], answer: 0,
        explain: 'Hypertonic saline or mannitol draws water out; head-up improves venous drainage. Hyperventilation lowers ICP by constricting vessels, which also cuts blood flow — minutes, not hours. CPP = MAP − ICP, so keep the MAP.' },
    ],
    verify: () => { const s = icpState(ICH(54), DEFAULT_SYSTEMIC, ICP_DEFAULT); return s.herniation === 'uncal' && s.side === 'L' && s.pupils.L.mm > 6 && !s.pupils.L.reactive && s.pupils.R.reactive; },
  },
  {
    id: 'case-neuro-cushing', module: 'neuro', level: 'Expert', title: 'Hypertension and bradycardia',
    story: 'Same patient, twenty minutes later. The pressure is climbing, the heart is slowing, and a colleague reaches for a vasodilator.',
    setup: () => { brain(ICH(58), 'ich'); mode('neuro'); }, facts: icpFacts,
    questions: [
      { q: 'What is this pattern?', options: ['The Cushing response — brainstem ischaemia from very high ICP', 'Autonomic dysreflexia', 'Pain — needs more analgesia', 'Hypertensive emergency causing the bleed'], answer: 0,
        explain: 'High pressure, falling heart rate and irregular breathing: the brainstem is raising the MAP to force blood into a brain whose pressure is near arterial. It is a late, pre-terminal sign.' },
      { q: 'Should you drop the blood pressure?', options: ['No — the MAP is holding the CPP; treat the ICP (osmotherapy, surgery)', 'Yes, to a systolic below 140', 'Yes, with a vasodilator and a β-blocker', 'Yes, because bradycardia means the pressure is too high'], answer: 0,
        explain: 'CPP = MAP − ICP. Lowering the MAP now drops cerebral perfusion further. The fix is to lower the ICP.' },
    ],
    verify: () => { const s = icpState(ICH(58), DEFAULT_SYSTEMIC, ICP_DEFAULT); return s.cushing && s.hr < 60 && s.map > DEFAULT_SYSTEMIC.map + 20 && s.resp !== 'regular'; },
  },
  {
    id: 'case-neuro-evd', module: 'neuro', level: 'Expert', title: 'The EVD suddenly drains fast',
    story: 'Left basal-ganglia haemorrhage with an EVD open at 15 cmH₂O. The nurse raised the head of the bed for transfer; now the drain is running quickly and the patient has a headache.',
    setup: () => { brain(ICH(30), 'ich', { evd: { open: true, heightCm: 15, levelErrorCm: 15 } }); mode('neuro'); }, facts: icpFacts,
    questions: [
      { q: 'Why is it over-draining?', options: ['The chamber was not moved with the head: it is now level with the ventricles, so it drains until pressure is near zero', 'The ICP has risen suddenly', 'The catheter is blocked', 'The transducer needs zeroing to air'], answer: 0,
        explain: 'The drip chamber height is measured from the tragus (foramen of Monro). Raising the head lifted the ventricles to the chamber, removing the pressure the drain was set to hold. Over-drainage risks ventricular collapse and bleeding.' },
      { q: 'What do you do?', options: ['Clamp briefly, re-level the zero to the tragus and reset the height, then reopen', 'Lower the chamber to drain even more', 'Leave it open — CSF drainage is always good', 'Flush the catheter'], answer: 0,
        explain: 'Every position change needs the reference re-levelled. Many services clamp the drain for moves and re-level before reopening.' },
    ],
    verify: () => { const s = icpState(ICH(30), DEFAULT_SYSTEMIC, { ...ICP_DEFAULT, evd: { open: true, heightCm: 15, levelErrorCm: 15 } }); const ok = icpState(ICH(30), DEFAULT_SYSTEMIC, { ...ICP_DEFAULT, evd: { open: true, heightCm: 15, levelErrorCm: 0 } }); return !!s.evd?.overdrainage && !ok.evd?.overdrainage; },
  },
  // ---------------------------------------------------------------- heart
  {
    id: 'case-heart-vsd', module: 'heart', level: 'Intermediate', title: 'An infant who sweats with feeds',
    story: 'Three-month-old, poor weight gain, breathless and sweaty with feeds. Watch the flow across the septum.',
    setup: () => { heart('vsdLarge'); mode('heart'); }, facts: heartFacts,
    questions: [
      { q: 'Which chambers carry the extra volume?', options: ['Left atrium and left ventricle', 'Right atrium and right ventricle', 'Only the right ventricle', 'None — flow is balanced'], answer: 0,
        explain: 'Blood crosses the VSD in systole straight into the pulmonary artery, goes round the lungs and returns to the LEFT atrium and ventricle, which dilate.' },
      { q: 'Roughly what is Qp:Qs?', options: ['≈ 2 : 1', '1 : 1', '≈ 0.8 : 1', '≈ 5 : 1'], answer: 0,
        explain: 'The lungs receive about twice the systemic flow — pulmonary overcirculation, which is why the infant is breathless and fails to thrive.' },
    ],
    verify: () => { const s = solveShunt(HEART_PRESETS.vsdLarge); return s.direction === 'L→R' && s.flags.lvVolume && !s.flags.rvVolume && s.qpqs > 1.7 && s.qpqs < 2.7; },
  },
  {
    id: 'case-heart-asd', module: 'heart', level: 'Intermediate', title: 'A big right heart',
    story: '34-year-old with exertional breathlessness; the echo shows a dilated right heart. Watch the atrial septum.',
    setup: () => { heart('asd'); mode('heart'); }, facts: heartFacts,
    questions: [
      { q: 'Which chambers are volume-loaded?', options: ['Right atrium and right ventricle', 'Left atrium and left ventricle', 'Left ventricle only', 'None'], answer: 0,
        explain: 'At atrial level the left atrium empties partly into the right, so the extra flow passes through the right atrium and right ventricle before the lungs.' },
      { q: 'Why is there little murmur from the defect itself?', options: ['The pressure difference between the atria is tiny, so the flow is low-velocity', 'The defect is closed in systole', 'The flow is right to left', 'Murmurs only come from valves'], answer: 0,
        explain: 'Atrial pressures differ by only a few mmHg. The murmur heard is from the extra flow across the pulmonary valve, with fixed splitting of the second sound.' },
    ],
    verify: () => { const s = solveShunt(HEART_PRESETS.asd); return s.direction === 'L→R' && s.flags.rvVolume && !s.flags.lvVolume && s.velocity < 1.5; },
  },
  {
    id: 'case-heart-eisenmenger', module: 'heart', level: 'Advanced', title: 'Blue at thirty',
    story: 'Adult with an unrepaired VSD, now cyanosed and breathless. The old murmur has gone.',
    setup: () => { heart('vsdEisen'); mode('heart'); }, facts: heartFacts,
    questions: [
      { q: 'Why is she cyanosed?', options: ['Pulmonary resistance has risen above systemic, so the shunt has reversed right to left', 'Heart failure has made the left ventricle leak', 'The defect has closed', 'Pneumonia'], answer: 0,
        explain: 'Years of overcirculation remodel the pulmonary arterioles. Once PVR exceeds SVR, deoxygenated blood crosses into the systemic side: Eisenmenger syndrome.' },
      { q: 'Will 100 % oxygen fix the saturation?', options: ['Only a little — shunted blood never meets the alveoli', 'Yes, fully', 'Oxygen makes it worse', 'Yes, after 20 minutes'], answer: 0,
        explain: 'Oxygen corrects low-V/Q units but not true shunt. A little rise can come from pulmonary vasodilation; avoid systemic vasodilators, which increase the right-to-left flow.' },
    ],
    verify: () => { const s = solveShunt(HEART_PRESETS.vsdEisen); return s.direction === 'R→L' && s.flags.eisenmenger && s.sat.ao < 0.93; },
  },
  {
    id: 'case-heart-pfo', module: 'heart', level: 'Advanced', title: 'Stroke after lifting',
    story: '29-year-old diver with a sudden aphasia after heavy lifting. Recent long-haul flight. Watch the atrial septum during the strain.',
    setup: () => { heart('pfoValsalva'); mode('heart'); }, facts: heartFacts,
    questions: [
      { q: 'What happened?', options: ['Paradoxical embolism: straining raised right-atrial pressure above left and a venous clot crossed the PFO', 'An atrial septal defect with left-to-right flow', 'Carotid dissection from lifting', 'Air embolism from the dive only'], answer: 0,
        explain: 'A PFO is a flap valve normally held shut by the higher left-atrial pressure. Valsalva, coughing or a PE reverse the gradient and open a path from the venous to the arterial side.' },
      { q: 'Why is the PFO silent at rest?', options: ['Left-atrial pressure keeps the flap closed; there is no flow until right pressure rises', 'It is too small to hear', 'Flow is continuous but low-velocity', 'It only opens during sleep'], answer: 0,
        explain: 'No gradient, no flow: that is why bubble studies are done with a Valsalva release.' },
    ],
    verify: () => { const a = solveShunt(HEART_PRESETS.pfo), b = solveShunt(HEART_PRESETS.pfoValsalva); return a.direction === 'none' && b.direction === 'R→L'; },
  },
  // ---------------------------------------------------------------- chest imaging (vent patient)
  {
    id: 'case-img-cxr-tension', module: 'vent', level: 'Novice', title: 'High pressures after a central line',
    story: 'Ventilated trauma patient, new subclavian line. Peak pressures alarm, saturation and blood pressure fall. A film happened to be taken for line position.',
    setup: () => { img('ptx', 'xray'); mode('vent'); }, facts: ventFacts,
    questions: [
      { q: 'What does the film show?', options: ['Right tension pneumothorax — pleural edge, no markings beyond it, flat hemidiaphragm, mediastinum pushed left', 'Right lung collapse from a plugged bronchus', 'Bilateral pulmonary oedema', 'A normal film'], answer: 0,
        explain: 'Air outside the lung with the mediastinum pushed away and the hemidiaphragm flattened: pleural pressure is high.' },
      { q: 'Next time this happens, what comes first?', options: ['Decompress on clinical grounds — do not wait for a film in an unstable patient', 'Always get a film first to confirm', 'Increase PEEP to re-expand the lung', 'Give a fluid bolus and reassess'], answer: 0,
        explain: 'Tension pneumothorax is a clinical diagnosis. The film here is a teaching picture; in practice needle or finger thoracostomy comes before imaging when the patient is crashing.' },
    ],
    verify: () => { img('ptx', 'xray'); const f = cxrFindings(cxrFromVent(session)); return f.some((x) => /^Right pneumothorax/.test(x)) && f.some((x) => /pushed away by tension/.test(x)); },
  },
  {
    id: 'case-img-lus-plug', module: 'vent', level: 'Intermediate', title: 'No sliding on the right — needle?',
    story: 'Desaturation after turning; breath sounds absent on the right. Your colleague sees no sliding on the right and reaches for a needle. Tap each zone and watch the pleural line and M-mode.',
    setup: () => { img('plug', 'lus'); mode('vent'); }, facts: ventFacts,
    questions: [
      { q: 'Is this a pneumothorax?', options: ['No — there is a lung pulse: the pleura still touch; the lung is collapsed, not separated', 'Yes — absent sliding means pneumothorax', 'Yes — the M-mode is a barcode', 'Cannot tell without an X-ray'], answer: 0,
        explain: 'Absent sliding alone is not diagnostic. A lung pulse (pleural line twitching with the heartbeat) proves the visceral pleura is against the chest wall — here the right lung is airless from a plugged bronchus.' },
      { q: 'What fixes it?', options: ['Clear the airway — suction, bronchoscopy, recruit — not a needle', 'Needle decompression', 'Chest drain', 'More PEEP only'], answer: 0,
        explain: 'Needling a chest without a pneumothorax creates one. The problem is in the bronchus.' },
    ],
    verify: () => { img('plug', 'lus'); const z = lusFromVent(session); const r = z.find((x) => x.id === 'R-ant')!; return !r.sliding && r.lungPulse && z.find((x) => x.id === 'L-ant')!.sliding; },
  },
  {
    id: 'case-img-lus-asthma', module: 'vent', level: 'Advanced', title: 'Asthmatic, high pressure, falling BP',
    story: 'Intubated asthmatic. Peak pressures are high and the blood pressure is falling. Is it a pneumothorax? Scan all four zones.',
    setup: () => { img('asthma', 'lus'); mode('vent'); }, facts: ventFacts,
    questions: [
      { q: 'What does the scan show?', options: ['Sliding with A-lines in all four zones — pneumothorax very unlikely at these sites', 'Absent sliding on the right — pneumothorax', 'B-lines everywhere — oedema', 'A lung point on the left'], answer: 0,
        explain: 'Sliding at the anterior chest excludes a pneumothorax under the probe with high certainty. The lungs are hyperinflated, not separated from the chest wall.' },
      { q: 'What is the likely cause and first move?', options: ['Dynamic hyperinflation (auto-PEEP): disconnect briefly to let the air out, then slow the rate', 'Needle both sides', 'Increase the rate to clear CO₂', 'Fluid bolus and more PEEP'], answer: 0,
        explain: 'Trapped gas raises intrathoracic pressure and cuts venous return. A short disconnection lets it escape; then lengthen expiratory time.' },
    ],
    verify: () => { img('asthma', 'lus'); return lusFromVent(session).every((z) => z.sliding && z.aLines) && ventNumbers(session).autoPeep > 1; },
  },
  {
    id: 'case-img-cxr-edema', module: 'vent', level: 'Intermediate', title: 'Frothy secretions',
    story: '66-year-old intubated with pink frothy secretions after a large anterior MI.',
    setup: () => { img('edema', 'xray'); mode('vent'); }, facts: ventFacts,
    questions: [
      { q: 'What pattern is this?', options: ['Cardiogenic oedema — perihilar opacity, septal lines, big heart, effusions', 'ARDS — peripheral patchy opacities with a normal heart', 'Tension pneumothorax', 'Hyperinflation'], answer: 0,
        explain: 'A large heart, a central “bat-wing” distribution, septal (Kerley) lines and effusions point to raised left-atrial pressure.' },
      { q: 'What would lung ultrasound show?', options: ['Many B-lines in both lungs, confluent in places, with effusions', 'A-lines everywhere', 'Absent sliding', 'A lung point'], answer: 0,
        explain: 'Interstitial water turns the lung surface into vertical B-lines. They fall as the oedema clears — a quick bedside trend.' },
    ],
    verify: () => { img('edema', 'xray'); const f = cxrFindings(cxrFromVent(session)); const z = lusFromVent(session); return f.some((x) => /bat-wing/.test(x)) && z.every((x) => x.bLines >= 3) && z.some((x) => x.effusion > 0.2); },
  },
  {
    id: 'case-img-cxr-ards', module: 'vent', level: 'Advanced', title: 'Pneumonia, worsening hypoxaemia',
    story: '36-year-old with pneumonia, now P/F well below 150 on high FiO₂.',
    setup: () => { img('ards', 'xray'); mode('vent'); }, facts: ventFacts,
    questions: [
      { q: 'What does the film show?', options: ['Bilateral patchy opacities with air bronchograms and a normal heart — ARDS pattern', 'Cardiogenic oedema', 'Right lung collapse', 'Normal film'], answer: 0,
        explain: 'Bilateral opacities not explained by effusion, collapse or heart failure, with a normal heart size, fit ARDS.' },
      { q: 'Ventilation strategy?', options: ['Tidal volume ≈ 6 mL/kg predicted body weight, plateau ≤ 30, PEEP to keep the lung open', '10 mL/kg to recruit the lung', 'Zero PEEP to protect the heart', 'High rate, low PEEP'], answer: 0,
        explain: 'Lung-protective ventilation limits stretch of the small “baby lung” that remains aerated.' },
    ],
    verify: () => { img('ards', 'xray'); return cxrFindings(cxrFromVent(session)).some((x) => /ARDS pattern/.test(x)); },
  },
];

export const SCENE_CASES: SceneCase[] = [...BASE_CASES, ...POP_CASES];
export const CASE_BY_ID: Record<string, SceneCase> = Object.fromEntries(SCENE_CASES.map((c) => [c.id, c]));
export const casesFor = (m: CaseModule) => SCENE_CASES.filter((c) => c.module === m);
