/**
 * Library: the content the app already has, packaged as short MODULES (ordered playlists of steps),
 * grouped onto SHELVES (body systems) and chained into LEARNING PATHS. Data only — every step points at an
 * existing lesson, workflow, challenge or simulator, so no engine changes are needed to play a module.
 */
import { LESSON_MINUTES } from './lessonMinutes';
import type { Module, Mode } from '../app/store';
import { BLUEPRINT, type DomainId } from '../fpc/blueprint';

export type StepKind = 'lesson' | 'procedure' | 'case' | 'simulator';
export type Step =
  | { kind: 'lesson' | 'procedure'; ref: string; minutes: number }
  | { kind: 'case'; ref: string; minutes: number }
  | { kind: 'simulator'; module: Module; mode: Extract<Mode, 'explore' | 'sim'>; scenario?: string; heart?: 'structure' | 'coronary'; title: string; minutes: number };

export type ShelfId = 'resp' | 'gas' | 'hemo' | 'cardiac' | 'neuro' | 'abdomen' | 'special' | 'pharm';
export interface Shelf { id: ShelfId; title: string; blurb: string; module: Module; tone: string; line: string; motif: string }
export interface LibraryModule { id: string; shelf: ShelfId; title: string; art: string; blurb: string; outcomes: string[]; steps: Step[]; isNew?: boolean }
export interface LearningPath { id: string; title: string; blurb: string; tone: string; modules: string[] }

const VENT = 'M0 54 L20 54 L32 6 L70 12 L78 34 L86 54 L120 54 L132 6 L170 12 L178 34 L186 54 L220 54 L232 6 L270 12 L278 34 L286 54 L300 54';
const ECG = 'M0 40 L60 40 L70 34 L80 40 L92 40 L98 6 L104 54 L110 40 L170 40 L180 34 L190 40 L202 40 L208 6 L214 54 L220 40 L300 40';
const ART = 'M0 50 L20 50 L34 8 L48 26 L56 22 L70 50 L100 50 L114 8 L128 26 L136 22 L150 50 L180 50 L194 8 L208 26 L216 22 L230 50 L260 50 L274 8 L288 26 L296 22 L300 30';
const WAVE = 'M0 30 C40 6 60 6 100 30 S160 54 200 30 S260 6 300 30';

export const SHELVES: Shelf[] = [
  { id: 'resp', title: 'Respiratory & ventilation', blurb: 'The vent, the lung and the gas, on one patient.', module: 'vent', tone: '#132238', line: '#ffb86b', motif: VENT },
  { id: 'gas', title: 'Blood gas & labs', blurb: 'Acid–base, oxygenation, electrolytes and clotting.', module: 'abg', tone: '#11261f', line: '#5ee0c6', motif: WAVE },
  { id: 'hemo', title: 'Hemodynamics & lines', blurb: 'Pressure, flow, shock and the lines that measure them.', module: 'lines', tone: '#271a12', line: '#ffb86b', motif: ART },
  { id: 'cardiac', title: 'Cardiac', blurb: 'The pump, its vessels and its shunts.', module: 'heart', tone: '#2a1620', line: '#ff7b8a', motif: ECG },
  { id: 'neuro', title: 'Neuro', blurb: 'Stroke, bleeding and pressure inside the skull.', module: 'neuro', tone: '#1d1a33', line: '#b7a6ff', motif: WAVE },
  { id: 'abdomen', title: 'Abdomen & trauma', blurb: 'Free fluid, the aorta and the gut.', module: 'abdomen', tone: '#262012', line: '#ffd166', motif: WAVE },
  { id: 'special', title: 'Pediatrics, newborn & OB', blurb: 'Small patients and pregnant ones.', module: 'pediatrics', tone: '#12262a', line: '#7dd3fc', motif: ECG },
  { id: 'pharm', title: 'Pharmacology', blurb: 'From receptor to whole patient.', module: 'moa', tone: '#22182a', line: '#e0a6ff', motif: WAVE },
];

/** A lesson's length is what the player reports for it (lessonMinutes.ts, generated), never an estimate. */
const L = (ref: string, minutes = 8): Step => ({ kind: 'lesson', ref, minutes: LESSON_MINUTES[ref] ?? minutes });
const P = (ref: string, minutes = 8): Step => ({ kind: 'procedure', ref, minutes });
const C = (ref: string, minutes = 6): Step => ({ kind: 'case', ref, minutes });
const SIM = (module: Module, title: string, mode: 'explore' | 'sim' = 'explore', scenario?: string, minutes = 6, heart?: 'structure' | 'coronary'): Step => ({ kind: 'simulator', module, mode, scenario, heart, title, minutes });

export const MODULES: LibraryModule[] = [
  // ------------------------------------------------------------------ respiratory & ventilation
  { id: 'vent-foundations', shelf: 'resp', title: 'Ventilator foundations', art: 'Vent Foundations', blurb: 'One equation runs every breath. Learn it, then see volume and pressure control side by side.',
    outcomes: ['Apply the equation of motion to peak, plateau and PEEP', 'Compare what volume and pressure control guarantee'],
    steps: [L('eom', 8), L('vcpc', 8), SIM('vent', 'Ventilator simulator: change one setting at a time', 'explore', 'normal'), C('vent-alarm-ett')] },
  { id: 'vent-pressure', shelf: 'resp', title: 'The pressure problem', art: 'The Pressure Problem', isNew: true, blurb: 'High peaks, high plateaus and auto-PEEP. Read the gap between peak and plateau, then use it on a real alarm.',
    outcomes: ['Tell resistance from compliance using peak and plateau', 'Find auto-PEEP with an expiratory hold', 'Work a high-pressure alarm step by step'],
    steps: [L('rc', 6), L('vent-ards-vs-obstruction', 10), C('vent-alarm-ett'), L('auto', 7), C('vent-goal-asthma', 8)] },
  { id: 'vent-ards', shelf: 'resp', title: 'ARDS & PEEP', art: 'ARDS & PEEP', blurb: 'Open the lung, keep it open, don’t overstretch it.',
    outcomes: ['Relate PEEP to recruitment and overdistension', 'Set tidal volume and PEEP to keep plateau and driving pressure low'],
    steps: [L('peep', 8), L('vent-ards-signature', 12), SIM('vent', 'ARDS patient: find the best PEEP', 'explore', 'ards'), C('vent-goal-ards', 8), C('case-img-cxr-ards')] },
  { id: 'vent-waveforms', shelf: 'resp', title: 'Waveform detective', art: 'Waveform Detective', blurb: 'Triggering, cycling and dyssynchrony — read it from the traces.',
    outcomes: ['Recognise triggering and cycling dyssynchrony on waveforms'],
    steps: [L('sync', 8), C('vent-dys-autopeep', 4), C('vent-dys-fs', 4), C('vent-dys-dt', 4), C('vent-dys-st', 4)] },
  { id: 'vent-ptx', shelf: 'resp', title: 'Tension pneumothorax', art: 'Tension PTX', blurb: 'Recognise it on the ventilator, decompress it, then drain it.',
    outcomes: ['Recognise tension on the ventilator', 'Choose a decompression site', 'Place and check a chest drain'],
    steps: [L('vent-tension-ptx', 10), L('vent-needle', 8), P('wf-chest-tube', 10), P('wf-drain-check', 6), C('vent-alarm-ptx'), C('case-img-cxr-tension')] },
  { id: 'vent-desat', shelf: 'resp', title: 'Desaturation on the vent', art: 'Desat on the Vent', blurb: 'DOPES, low-pressure alarms and the tube that moved during transfer.',
    outcomes: ['Work through displacement, obstruction, pneumothorax, equipment and stacking'],
    steps: [P('wf-dopes', 8), P('wf-low-pressure', 6), C('vent-alarm-plug'), C('case-img-mainstem'), C('case-img-lus-plug')] },
  // ------------------------------------------------------------------ blood gas & labs
  { id: 'gas-basics', shelf: 'gas', title: 'Blood gas in five steps', art: 'ABG in 5 Steps', blurb: 'From oxygen in the air to the pH on the printout.',
    outcomes: ['Separate PaO₂, saturation and content', 'Separate respiratory from metabolic acidosis'],
    steps: [L('o2path', 8), L('hypox', 8), L('resp', 6), L('metab', 8), L('abg-resp-vs-metabolic', 10), C('abg-opioid', 4)] },
  { id: 'gas-dka', shelf: 'gas', title: 'DKA & metabolic acidosis', art: 'DKA', blurb: 'Ketoacids, the anion gap and the potassium paradox.',
    outcomes: ['Trace insulin deficiency to an anion gap', 'Sequence fluids, potassium and insulin'],
    steps: [L('metab', 8), L('abg-dka', 12), C('abg-dka', 4), C('lab-dka', 5)] },
  { id: 'gas-lytes', shelf: 'gas', title: 'Potassium & sodium', art: 'K⁺ & Na⁺', blurb: 'The membrane, the ECG and the brain cell.',
    outcomes: ['Stabilise, shift and remove potassium', 'Avoid overcorrecting chronic hyponatraemia'],
    steps: [L('hyperk', 6), L('hyperk-signature', 10), C('lab-k-hd', 5), L('hypona', 8), C('lab-na-acute', 5), C('lab-na-chronic', 5)] },
  { id: 'gas-bleeding', shelf: 'gas', title: 'Bleeding & reversal', art: 'Bleeding & Reversal', blurb: 'What the oximeter can’t see, and how to reverse the thinners.',
    outcomes: ['Explain why the oximeter cannot see anaemia', 'Reverse warfarin and heparin'],
    steps: [L('anaemia', 6), L('labs-coag', 12), C('lab-inr', 5), C('lab-anaemia', 5), C('lab-ca-mtp', 5)] },
  // ------------------------------------------------------------------ hemodynamics & lines
  { id: 'lines-artline', shelf: 'hemo', title: 'Arterial line & damping', art: 'Art Line & Damping', blurb: 'From artery to monitor: level, zero, flush and trust the number.',
    outcomes: ['Level and zero correctly', 'Use the square-wave test to judge damping'],
    steps: [L('ln-setup', 6), L('ln-art', 6), L('ln-level', 6), L('ln-damp', 6), P('wf-artline', 8), C('lines-c-zero', 4), C('lines-c-clot', 4)] },
  { id: 'lines-cvp', shelf: 'hemo', title: 'CVP & heart–lung', art: 'CVP & Heart–Lung', blurb: 'Read the waves, then read what breathing does to them.',
    outcomes: ['Identify a, c, v waves', 'Use pulse-pressure variation and know when it misleads'],
    steps: [L('ln-cvp', 8), L('ln-heartlung', 8), C('lines-c-ppv-af', 4), L('ln-disease', 8), C('lines-c-read-tamp', 4)] },
  { id: 'lines-shock', shelf: 'hemo', title: 'Shock states', art: 'Shock States', blurb: 'Four patterns on one arterial line, and the first treatment for each.',
    outcomes: ['Recognise distributive, cardiogenic, obstructive and hypovolaemic patterns', 'Start a vasopressor infusion safely'],
    steps: [L('lines-shock-states', 10), L('lactate', 6), L('lines-oxygen-delivery', 10), P('wf-nore', 8), C('lines-c-goal-sepsis', 6)] },
  { id: 'lines-bleed', shelf: 'hemo', title: 'Haemorrhage & blood', art: 'Haemorrhage & Blood', blurb: 'Why the haemoglobin is normal early, and how to give blood safely.',
    outcomes: ['Explain dilution from crystalloid', 'Give blood safely and recognise reactions'],
    steps: [L('lines-haemorrhage-transfusion', 12), P('wf-blood', 8), C('lines-c-goal-fluid', 6), C('case-abd-transient', 5)] },
  { id: 'lines-devices', shelf: 'hemo', title: 'Lines & devices', art: 'Lines & Devices', blurb: 'Central lines, balloon pumps and push-dose pressors.',
    outcomes: ['Confirm the wire in the vein before dilating', 'Identify balloon timing errors', 'Give a push-dose pressor without dilution errors'],
    steps: [L('lines-cvc', 10), P('wf-central-line', 10), L('lines-iabp', 10), P('wf-push', 6)] },
  // ------------------------------------------------------------------ cardiac
  { id: 'cardiac-mi', shelf: 'cardiac', title: 'MI Locator', art: 'MI Locator', blurb: 'The beating heart and a live 12-lead side by side: find the territory from the leads.',
    outcomes: ['Match ST changes to a coronary territory'],
    steps: [SIM('heart', 'MI Locator: 3D heart and 12-lead', 'explore', undefined, 10, 'coronary'), SIM('heart', 'Heart & flow: structure and shunts', 'explore', undefined, 6, 'structure')] },
  { id: 'cardiac-congenital', shelf: 'cardiac', title: 'Shunts & congenital heart', art: 'Shunts', blurb: 'Which way the blood goes, and what happens when it reverses.',
    outcomes: ['Predict shunt direction from resistance', 'Explain Eisenmenger physiology'],
    steps: [L('heart-vsd', 12), C('case-heart-vsd', 5), C('case-heart-asd', 5), C('case-heart-eisenmenger', 5), C('case-heart-pfo', 5)] },
  // ------------------------------------------------------------------ neuro
  { id: 'neuro-stroke', shelf: 'neuro', title: 'Stroke: time is brain', art: 'Time Is Brain', blurb: 'Core, penumbra and the clock that runs between them.',
    outcomes: ['Relate collateral flow and blood pressure to core growth', 'Recognise a large-vessel occlusion'],
    steps: [L('neuro-time-is-brain', 10), L('neuro-lvo', 10), L('neuro-time-machine', 10), C('case-neuro-m1l', 5), C('case-neuro-basilar', 5)] },
  { id: 'neuro-icp', shelf: 'neuro', title: 'Brain bleeds & ICP', art: 'Bleeds & ICP', blurb: 'ICH, SAH and the pressure–volume curve.',
    outcomes: ['Estimate haematoma volume', 'Recognise herniation and the Cushing response', 'Level and manage an EVD'],
    steps: [L('neuro-ich', 10), L('neuro-sah', 10), L('neuro-icp', 12), C('case-neuro-uncal', 5), C('case-neuro-cushing', 5), C('case-neuro-evd', 5)] },
  // ------------------------------------------------------------------ abdomen & trauma
  { id: 'abd-fast', shelf: 'abdomen', title: 'FAST & abdominal bleeding', art: 'FAST', blurb: 'Where free blood goes, what FAST misses, and who needs the OR.',
    outcomes: ['Know where free fluid collects', 'Classify responders to blood'],
    steps: [L('abd-fast', 8), L('abd-solid-organ', 10), C('case-abd-fast-early', 5), C('case-abd-fast-spleen', 5)] },
  { id: 'abd-aorta', shelf: 'abdomen', title: 'The aorta', art: 'The Aorta', blurb: 'AAA rupture and dissection: type, extent, malperfusion.',
    outcomes: ['Recognise contained vs free rupture', 'Order anti-impulse therapy'],
    steps: [L('abd-aaa', 10), L('abd-dissection', 12), C('case-abd-aaa', 5), C('case-abd-dissect-a', 5), C('case-abd-dissect-b', 5)] },
  { id: 'abd-gut', shelf: 'abdomen', title: 'Belly emergencies', art: 'Belly Emergencies', blurb: 'Pain out of proportion, obstruction and free air.',
    outcomes: ['Recognise mesenteric ischaemia', 'Recognise obstruction and perforation'],
    steps: [L('abd-mesenteric', 10), L('abd-obstruction', 10), C('case-abd-mesenteric', 5)] },
  // ------------------------------------------------------------------ pediatrics, newborn & OB
  { id: 'peds-sick-child', shelf: 'special', title: 'The sick child', art: 'The Sick Child', blurb: 'Small airways, hidden shock and how fast a child desaturates.',
    outcomes: ['Apply radius-to-the-fourth to airway swelling', 'Recognise compensated shock in a child'],
    steps: [L('peds-airway', 8), L('peds-shock', 10), L('pop-apnoea', 10), C('case-vent-croup', 5), C('case-lines-child-shock', 5), C('case-abg-apnoea-infant', 5)] },
  { id: 'peds-newborn', shelf: 'special', title: 'Newborn transition', art: 'Newborn Transition', blurb: 'From fetal to newborn circulation, and when it doesn’t switch.',
    outcomes: ['Use pre-ductal saturation targets', 'Recognise PPHN'],
    steps: [L('neo-transition', 12), C('case-heart-pphn', 5), C('case-heart-pphn-atrial', 5)] },
  { id: 'ob-pregnancy', shelf: 'special', title: 'Pregnancy & delivery', art: 'Pregnancy & Delivery', blurb: 'The normal gas that isn’t, aortocaval compression and postpartum haemorrhage.',
    outcomes: ['Interpret a gas against pregnancy normals', 'Recognise postpartum haemorrhage before hypotension'],
    steps: [L('ob-gas', 8), L('ob-circulation', 10), C('abg-pregAsthma', 4), C('case-abg-apnoea-preg', 5), C('case-lines-aortocaval', 5), C('case-lines-pph', 5)] },
  // ------------------------------------------------------------------ pharmacology
  { id: 'pharm-moa', shelf: 'pharm', title: 'Drug mechanisms', art: 'Drug Mechanisms', blurb: 'Watch a drug act at the receptor and then on the whole patient.',
    outcomes: ['Follow a drug from receptor to haemodynamic effect'],
    steps: [SIM('moa', 'Mechanism of action visualiser', 'explore', undefined, 10)] },
];

export const PATHS: LearningPath[] = [
  { id: 'fpc', title: 'FP-C Study Plan', blurb: 'Every module, grouped by the ten domains of the IBSC FP-C content outline.', tone: '#1c3557', modules: [] },
  { id: 'vent-mastery', title: 'Vent Mastery', blurb: 'From the first equation to troubleshooting in flight.', tone: '#5a3a14', modules: ['vent-foundations', 'gas-basics', 'vent-pressure', 'vent-ards', 'vent-waveforms', 'vent-desat', 'vent-ptx'] },
  { id: 'shock', title: 'Shock & Resuscitation', blurb: 'Pressure, flow, pressors and blood.', tone: '#4a2330', modules: ['lines-artline', 'lines-shock', 'lines-bleed', 'gas-bleeding', 'abd-fast'] },
  { id: 'peds-ob', title: 'Small Patients & Pregnancy', blurb: 'Weight-based thinking and two patients at once.', tone: '#1e4a43', modules: ['peds-sick-child', 'peds-newborn', 'ob-pregnancy'] },
];

export const MODULE_BY_ID: Record<string, LibraryModule> = Object.fromEntries(MODULES.map((m) => [m.id, m]));
export const SHELF_BY_ID = Object.fromEntries(SHELVES.map((s) => [s.id, s])) as Record<ShelfId, Shelf>;
export const PATH_BY_ID: Record<string, LearningPath> = Object.fromEntries(PATHS.map((p) => [p.id, p]));
export const modulesOn = (shelf: ShelfId) => MODULES.filter((m) => m.shelf === shelf);
export const minutesOf = (m: LibraryModule) => m.steps.reduce((a, s) => a + s.minutes, 0);
export const KIND_LABEL: Record<StepKind, string> = { lesson: 'Lesson', procedure: 'Procedure', case: 'Case', simulator: 'Simulator' };

/** Stable key for a step inside a module (a ref can appear in more than one module). */
export const stepKey = (moduleId: string, index: number) => `${moduleId}#${index}`;

/** A step is done when the engine recorded it (lesson finished, case passed) or the learner moved past it in the player. */
export function stepDone(moduleId: string, index: number, completed: Record<string, string>, attempts: Record<string, { ok: boolean }[]>, passed: Record<string, string>): boolean {
  const s = MODULE_BY_ID[moduleId]?.steps[index]; if (!s) return false;
  if (passed[stepKey(moduleId, index)]) return true;
  if (s.kind === 'lesson' || s.kind === 'procedure') return !!completed[s.ref];
  if (s.kind === 'case') return !!attempts[s.ref]?.some((a) => a.ok);
  return false;
}
export function moduleProgress(moduleId: string, completed: Record<string, string>, attempts: Record<string, { ok: boolean }[]>, passed: Record<string, string>) {
  const m = MODULE_BY_ID[moduleId]; if (!m) return { done: 0, total: 0, next: 0 };
  const flags = m.steps.map((_, i) => stepDone(moduleId, i, completed, attempts, passed));
  const done = flags.filter(Boolean).length; const next = Math.max(0, flags.findIndex((f) => !f));
  return { done, total: m.steps.length, next: done === m.steps.length ? 0 : next };
}

/**
 * Each module's home in the IBSC FP-C content outline (see fpc/blueprint.ts). The FP-C Study Plan is
 * grouped and ordered by these domains; domains no module covers yet point to FP-C exam prep instead.
 */
export const FPC_DOMAIN_OF: Record<string, DomainId> = {
  'vent-foundations': 'airway', 'vent-pressure': 'airway', 'vent-ards': 'airway', 'vent-waveforms': 'airway', 'vent-desat': 'airway', 'vent-ptx': 'trauma',
  'gas-basics': 'medical', 'gas-dka': 'medical', 'gas-lytes': 'medical', 'gas-bleeding': 'medical', 'pharm-moa': 'medical', 'abd-gut': 'medical',
  'lines-artline': 'cardiac', 'lines-cvp': 'cardiac', 'lines-shock': 'cardiac', 'lines-devices': 'cardiac', 'cardiac-mi': 'cardiac', 'cardiac-congenital': 'cardiac', 'abd-aorta': 'cardiac',
  'lines-bleed': 'trauma', 'abd-fast': 'trauma',
  'neuro-stroke': 'neuro', 'neuro-icp': 'neuro',
  'peds-sick-child': 'peds', 'peds-newborn': 'obneo', 'ob-pregnancy': 'obneo',
};
// the FP-C plan runs in blueprint order (I → X), modules in library order within each domain
PATHS[0].modules = BLUEPRINT.flatMap((d) => MODULES.filter((m) => FPC_DOMAIN_OF[m.id] === d.id).map((m) => m.id));
