/**
 * Bedside workflows on the REAL `lines` session (Lines module). Teaching sequences in our own words;
 * concentrations are common examples — always follow local standards.
 */
import type { Workflow } from './workflow';
import { lines } from '../lines/session';
import { concMcgPerMl, mlPerHour, dilute, bolusMl } from './drip';

const KG = 80; const NE_CONC = concMcgPerMl(4, 250); const NE_RATE = mlPerHour(0.1, KG, NE_CONC);
const PE_CONC = dilute(10_000, 1, 100); // 10 mg/mL vial, 1 mL into 100 mL

export const BLOOD_ADMIN: Workflow = {
  id: 'wf-blood', module: 'lines', level: 'core',
  title: 'Starting a blood transfusion safely',
  blurb: 'From indication to the first 15 minutes: identity checks, the right line and the right observations — on a bleeding patient whose numbers respond.',
  context: 'Trauma patient, still bleeding: HR 118, BP falling, CVP low, arterial line in. Two units of red cells are on their way.',
  setup: () => { lines.load('hypovol'); },
  steps: [
    { id: 'indication', label: 'Confirm the indication (haemorrhagic shock)', why: 'Tachycardia, low filling pressure and ongoing loss — the haemoglobin can still look normal early because nothing has diluted it yet.' },
    { id: 'sample', label: 'Group & crossmatch sample, labelled at the bedside', why: 'Samples labelled away from the patient are a classic source of wrong-blood-in-tube.' },
    { id: 'product', label: 'Choose the product (crossmatched, or emergency group O if it cannot wait); call the major-haemorrhage protocol if bleeding continues', why: 'Ongoing major bleeding needs plasma and platelets as well as red cells, not red cells alone.' },
    { id: 'check', label: 'Two-person bedside check: ID band ↔ unit label ↔ prescription', why: 'Almost all ABO-incompatible transfusions come from wrong-patient errors at the bedside, not from the laboratory.', critical: true },
    { id: 'obs', label: 'Baseline temperature, HR, BP, RR, SpO₂', why: 'A reaction is recognised as a CHANGE from baseline.' },
    { id: 'set', label: 'Blood giving set with filter; warmer for rapid transfusion; saline only on that line', why: 'The filter catches clots; cold blood worsens coagulopathy; dextrose and many drugs are incompatible.' },
    { id: 'start', label: 'Start, and stay with the patient for the first 15 minutes', why: 'Severe reactions (ABO incompatibility, anaphylaxis) usually declare themselves early.' },
    { id: 'reassess', label: 'Reassess after each unit: HR, BP, CVP, Hb, bleeding', why: 'Transfuse to physiology and bleeding control, not to a single number.' },
    { id: 'source', label: 'Stop the bleeding (surgery / interventional radiology)', why: 'Blood buys time; only source control ends haemorrhagic shock.' },
  ],
  anyOrder: [['sample', 'product'], ['obs', 'set']],
  distractors: [
    { id: 'dextrose', label: 'Run it through the 5 % dextrose line that is already up', why: 'Dextrose causes red-cell clumping and haemolysis. Only 0.9 % saline may share the line.', critical: true },
    { id: 'skipId', label: 'Skip the bedside check — the lab has crossmatched it', why: 'The crossmatch is only as good as the identity of the patient receiving it.', critical: true },
    { id: 'coinfuse', label: 'Co-infuse antibiotics through the blood line', why: 'Incompatibility, and if a reaction occurs you cannot tell which caused it.' },
    { id: 'crystalloid', label: 'Keep giving crystalloid until the Hb drops', why: 'Large crystalloid volumes dilute clotting factors and haemoglobin and cool the patient.' },
    { id: 'warmRoom', label: 'Leave the unit on the bed for an hour to warm up', why: 'Bacterial growth: units must start promptly after leaving controlled storage and finish within the local time limit. Use a blood warmer.' },
  ],
  effects: {
    start: () => lines.transfuse(),
    reassess: () => lines.transfuse(),
    crystalloid: () => { lines.fluid(); lines.fluid(); },
  },
  debrief: 'Identity checks at the bedside prevent the catastrophic errors; the first 15 minutes catch the early reactions; and every unit is followed by a reassessment — while someone stops the bleeding.',
};

export const NORE_INFUSION: Workflow = {
  id: 'wf-nore', module: 'lines', level: 'core',
  title: 'Starting a norepinephrine infusion',
  blurb: `Concentration, rate and the double-check: ${Math.round(NE_CONC)} µg/mL, 0.1 µg/kg/min for ${KG} kg = ${Math.round(NE_RATE)} mL/h — then watch the arterial line respond.`,
  context: `Septic shock after 30 mL/kg of fluid: MAP in the 50s, warm peripheries, wide pulse pressure. Weight ${KG} kg. Norepinephrine 0.1 µg/kg/min prescribed.`,
  setup: () => { lines.load('sepsis'); },
  steps: [
    { id: 'target', label: 'Set the target: MAP ≥ 65 mmHg', why: 'A common starting target; higher targets add arrhythmias and ischaemia without clear benefit for most patients.' },
    { id: 'order', label: `Confirm drug, weight (${KG} kg) and dose units (µg/kg/min)`, why: 'µg/min and µg/kg/min differ by a factor of the body weight — an 80-fold error.' },
    { id: 'conc', label: `Standard concentration: 4 mg in 250 mL = ${Math.round(NE_CONC)} µg/mL; label it`, why: 'Standard concentrations make pump libraries and double-checks work.' },
    { id: 'calc', label: `Rate = 0.1 × ${KG} × 60 ÷ ${Math.round(NE_CONC)} = ${Math.round(NE_RATE)} mL/h`, why: 'Dose (µg/kg/min) × weight × 60 ÷ concentration (µg/mL) = mL/h.' },
    { id: 'double', label: 'Independent double-check: drug, concentration, rate, pump programme', why: 'Done independently — not by reading the first person’s numbers back.', critical: true },
    { id: 'line', label: 'Dedicated lumen (central preferred; peripheral short-term in a large proximal vein, site checked)', why: 'Nothing else is flushed through it, and extravasation is spotted early.' },
    { id: 'start', label: 'Start and titrate every few minutes to the target', why: 'Watch the arterial line: SVR rises, diastolic and mean pressures climb; the heart rate barely changes in a hypotensive patient.' },
    { id: 'monitor', label: 'Beyond MAP: lactate, urine output, mental state, skin, the infusion site', why: 'Pressure is a means; perfusion is the goal.' },
  ],
  anyOrder: [['conc', 'order']],
  distractors: [
    { id: 'units', label: 'Programme 0.1 µg/min', why: `For ${KG} kg that is 1/${KG} of the prescribed dose — the MAP will not move and the dose will be "escalated" blindly.`, critical: true },
    { id: 'sameLumen', label: 'Run it into the lumen used for fluid boluses', why: 'Every bolus flushes the dead space — a surge of pressor — and pauses leave the patient without it.', critical: true },
    { id: 'skipCheck', label: 'Skip the double-check, it is urgent', why: 'Urgency is when calculation errors happen.', critical: true },
    { id: 'map90', label: 'Aim for MAP 90 to be safe', why: 'More vasoconstriction, more afterload, more arrhythmia — without better outcomes for most patients.' },
  ],
  effects: { start: () => lines.setNore(0.1), map90: () => lines.setNore(0.3) },
  debrief: 'Right drug, right concentration, right units, checked independently, on its own line — and titrated to perfusion, not just a number.',
};

export const PUSH_DOSE: Workflow = {
  id: 'wf-push', module: 'lines', level: 'advanced',
  title: 'Push-dose phenylephrine for transient hypotension',
  blurb: `Make ${PE_CONC} µg/mL from a 10 mg/mL vial, push ${bolusMl(100, PE_CONC)} mL, and watch pressure rise and the heart rate fall — then fade.`,
  context: 'Moments after induction for intubation the MAP drops to the 50s. An infusion is being prepared; you need a short bridge.',
  setup: () => { lines.load('sepsis'); },
  steps: [
    { id: 'recognise', label: 'Transient hypotension: bridge it while you treat the cause', why: 'Push-dose pressors are a bridge, not a treatment for ongoing shock.' },
    { id: 'dilute', label: `Dilute: 10 mg (1 mL of 10 mg/mL) into 100 mL saline → ${PE_CONC} µg/mL; draw 10 mL`, why: 'The vial is 100 times too concentrated to push.', critical: true },
    { id: 'label', label: 'Label the syringe: drug and µg/mL', why: 'Unlabelled syringes of vasopressor are a recognised cause of catastrophic errors.', critical: true },
    { id: 'push', label: `Give 100 µg (${bolusMl(100, PE_CONC)} mL) and flush`, why: 'Onset within about a minute; effect lasts roughly 10–20 minutes at the bedside (compressed on screen).' },
    { id: 'watch', label: 'Watch MAP and heart rate over 1–2 minutes', why: 'Pure α1: SVR up, pressure up — and the baroreflex slows the heart.' },
    { id: 'infusion', label: 'Needing repeated doses? Start an infusion', why: 'Repeated pushes give swinging pressures.' },
    { id: 'cause', label: 'Treat the cause (volume, sedative dose, sepsis source)', why: 'The pressor hides the problem; it does not fix it.' },
  ],
  distractors: [
    { id: 'undiluted', label: 'Push the vial undiluted (10 mg/mL)', why: 'A 100-fold overdose: severe hypertension, reflex bradycardia, stroke, pulmonary oedema.', critical: true },
    { id: 'epi1mg', label: 'Draw 10 µg from the 1 mg/mL epinephrine vial', why: 'Measuring 0.01 mL is impossible — dilute to 10 µg/mL first.', critical: true },
    { id: 'brady', label: 'Choose phenylephrine for a hypotensive patient who is already bradycardic', why: 'Reflex slowing makes it worse; epinephrine (α + β) is the better push-dose choice.' },
  ],
  effects: { push: () => lines.pushDose('phenylephrine', 100), infusion: () => lines.setNore(0.08) },
  debrief: 'Dilute, label, small dose, watch — and use the time to fix the cause or start an infusion.',
};

export const ART_LINE: Workflow = {
  id: 'wf-artline', module: 'lines', level: 'core',
  title: 'Arterial line: level, zero, flush test, fix',
  blurb: 'An over-reading arterial line: find out whether the number or the patient is wrong — levelling, zeroing, the square-wave test and the fix, on the live transducer.',
  context: 'New radial arterial line. The monitor shows a spiky systolic of about 150 while the patient looks well. The transducer has slipped down the pole; nobody has checked the damping.',
  setup: () => { lines.load('normal'); lines.setup.transH = lines.axis - 10; lines.setFault('art', 'smallBubble'); lines.setStopcock('art', 'patient'); },
  steps: [
    { id: 'cuff', label: 'Cross-check with a cuff pressure', why: 'Cuff and arterial MEAN pressures should agree closely; systolic can legitimately differ. A large disagreement means check the system before treating.' },
    { id: 'level', label: 'Level the transducer to the phlebostatic axis', why: '4th intercostal space, mid-chest. Every 10 cm below the axis adds about 7 mmHg to every reading.' },
    { id: 'air', label: 'Stopcock off to the patient, open to air', why: 'Zeroing sets atmospheric pressure as 0 — the transducer must see air, not the patient.' },
    { id: 'zero', label: 'Zero on the monitor', why: 'Removes electrical and hydrostatic offset in the transducer itself.', critical: true },
    { id: 'back', label: 'Cap the port, stopcock back to the patient', why: 'An open port reads atmospheric pressure (a flat zero) and can bleed or entrain air.', critical: true },
    { id: 'flushTest', label: 'Square-wave (fast-flush) test', why: 'Pull the flush: after the square wave, 1.5–2 oscillations before the trace returns is optimal. More = underdamped (over-reads systolic), fewer = overdamped (under-reads systolic).' },
    { id: 'fix', label: 'Underdamped: off to the patient, aspirate / flush the bubble to waste', why: 'A small bubble drops the natural frequency and the trace rings. It must leave through the side port, never toward the patient.' },
    { id: 'retest', label: 'Repeat the flush test, then trust the trace', why: 'Now the systolic and diastolic are believable; the mean was the most robust number all along.' },
  ],
  anyOrder: [['cuff', 'level']],
  distractors: [
    { id: 'zeroPatient', label: 'Zero with the stopcock still open to the patient', why: 'The monitor subtracts the patient’s own pressure as if it were zero: every reading drops by tens of mmHg and a normal patient suddenly looks shocked.', critical: true },
    { id: 'flushFwd', label: 'Flush the bubble forward into the artery', why: 'Air from a radial line can travel retrograde to the brain. Always flush air out of the side port to waste.', critical: true },
    { id: 'bed', label: 'Level the transducer to the mattress', why: 'The reference is the heart (phlebostatic axis), not the bed — raising the head of the bed moves the axis.' },
    { id: 'treat', label: 'Start a vasodilator for the high systolic', why: 'Treating an artefact. Check level, zero and damping first.' },
  ],
  effects: {
    cuff: () => lines.startNibp(), level: () => lines.levelToAxis(),
    air: () => lines.setStopcock('art', 'air'), zero: () => lines.zero('art'), back: () => lines.setStopcock('art', 'patient'),
    flushTest: () => lines.flush('art'), fix: () => { lines.act('art', 'aspirate'); }, retest: () => lines.flush('art'),
    zeroPatient: () => { lines.setStopcock('art', 'patient'); lines.zero('art'); }, flushFwd: () => { lines.act('art', 'flushForward'); },
    bed: () => { lines.setup.transH = lines.setup.bedH; lines.version++; },
  },
  debrief: 'Before treating an arterial number: is it levelled, zeroed and properly damped? The mean pressure survives damping errors best; levelling errors shift every number.',
};

export const LINES_WORKFLOWS: Workflow[] = [BLOOD_ADMIN, NORE_INFUSION, PUSH_DOSE, ART_LINE];
export const DRIP_EXAMPLE = { kg: KG, neConc: NE_CONC, neRate: NE_RATE, peConc: PE_CONC };
