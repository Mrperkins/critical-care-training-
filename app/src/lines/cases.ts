/**
 * Challenge cases. Three kinds:
 *  - fix:    something is wrong with the monitoring system. Name it, then fix it at the bedside
 *            (solved when the monitor again matches the true pressures).
 *  - read:   name the physiology from the monitor alone.
 *  - goal:   treat until the targets are met (the physiology responds, it is not scripted).
 */
import type { LStepDo } from './lessons';
import type { LinesSession } from './session';

export interface LCase {
  id: string; kind: 'fix' | 'read' | 'goal'; level: 'Novice' | 'Intermediate' | 'Advanced'; title: string;
  setup: LStepDo & { hiddenZeroDrift?: 'art' | 'cvp' };
  brief: string; question: string; options: string[]; answer: number; explain: string;
  /** goal cases: all must hold for 8 s */
  goals?: { label: string; test: (s: LinesSession) => boolean }[];
}

const ok = (s: LinesSession) => s.art.fault === 'none' && s.cvp.fault === 'none' && Math.abs(s.levelErr) < 1.5 && ['art', 'cvp'].every((id) => { const L = s.line(id as 'art'); return L.stopcock === 'patient' && Math.abs(L.drift - L.zeroRef) < 2; });
export const systemOK = ok;

export const LINES_CASES: LCase[] = [
  { id: 'c-bubble', kind: 'fix', level: 'Novice', title: 'The BP that nobody believes', setup: { scenario: 'normal', art: 'smallBubble', view: 'bed' },
    brief: 'The arterial line reads about 135/73 and the trace looks spiky. The cuff just read about 115/78. The patient looks well.',
    question: 'What is the most likely problem?', options: ['Underdamped line — resonance from a small bubble or long tubing', 'Overdamped line — a clot at the tip', 'The transducer is too low', 'True hypertension — the cuff is wrong'], answer: 0,
    explain: 'A systolic overshoot with a normal MAP and a ringing square-wave test is underdamping. Do a fast-flush test (more than 2 oscillations), find the bubble, aspirate and flush.' },
  { id: 'c-hob', kind: 'fix', level: 'Novice', title: 'CVP 25 after the chest X-ray', setup: { scenario: 'normal', hob: 30, fromHob: 0, view: 'level' },
    brief: 'The bed was sat up to 30° for a chest X-ray. Since then the CVP reads about 25 and the MAP has risen 20 mmHg. Nothing else has changed and the patient looks the same.',
    question: 'Why did both pressures jump?', options: ['The phlebostatic axis rose but the transducer did not — it now sits below the axis', 'Fluid overload from the X-ray contrast', 'The transducer drifted — it needs zeroing', 'Tension pneumothorax'], answer: 0,
    explain: 'Both lines rose by the same amount at the same moment: a reference-level error. Sitting the patient up raised the axis about 27 cm, so every reading is ≈ 20 mmHg too high. Re-level the transducer to the axis.' },
  { id: 'c-openair', kind: 'fix', level: 'Novice', title: 'Flat line after the blood gas', setup: { scenario: 'normal', art: 'openAir', view: 'bed' },
    brief: 'Two minutes after an arterial blood gas was drawn, the monitor alarms: ART reads 0 with a flat trace. The patient is talking to you.',
    question: 'What happened?', options: ['The sampling stopcock was left open to air', 'Cardiac arrest', 'Massive clot in the radial artery', 'The pressure bag burst'], answer: 0,
    explain: 'A flat line at zero in a talking patient is a system problem. The sampling port was left open to air with the stopcock off to the patient, so the transducer reads atmosphere. Cap it, turn the stopcock back to the patient, and check for blood loss. (Had it been left open toward the patient, blood would run out — or, on a central line, air would be drawn in.)' },
  { id: 'c-clot', kind: 'fix', level: 'Intermediate', title: 'Blunted and getting worse', setup: { scenario: 'normal', art: 'clot', view: 'wrist' },
    brief: 'The arterial trace has lost its dicrotic notch and looks rounded. Systolic has drifted down to about 110. Drawing blood back from the sampling port is sluggish.',
    question: 'What is the problem?', options: ['Overdamped: a clot at the catheter tip', 'Underdamped: long tubing', 'Hypovolaemia', 'Aortic stenosis'], answer: 0,
    explain: 'Rounded trace, lost notch, low systolic, high diastolic, MAP unchanged, and a square-wave test with no bounce: overdamped. Sluggish blood return points to a clot. Aspirate it — never flush a clot forward into the radial artery.' },
  { id: 'c-zero', kind: 'fix', level: 'Intermediate', title: 'Hypotension that isn’t', setup: { scenario: 'normal', zeroWrong: 'art', view: 'bed' },
    brief: 'After the transducer was changed, the arterial line reads 26/−21 with a perfect-looking waveform. The patient is pink and talking; the cuff reads about 115/78.',
    question: 'What went wrong?', options: ['It was zeroed while open to the patient', 'The transducer is 60 cm too high', 'Severe vasodilatory shock', 'The line is overdamped'], answer: 0,
    explain: 'The shape is normal but the whole waveform is shifted down by about the patient’s own mean pressure. Zeroing with the stopcock open to the patient made the monitor treat the MAP as “zero”. Turn the stopcock off to the patient, open to air, zero, and turn it back.' },
  { id: 'c-bag', kind: 'fix', level: 'Intermediate', title: 'Blood in the tubing', setup: { scenario: 'normal', art: 'lowBag', view: 'bed' },
    brief: 'Blood has crept up the arterial tubing toward the transducer and the trace is becoming damped. The fast-flush only reaches about 90 mmHg.',
    question: 'What is the cause?', options: ['Pressure bag under-inflated — below arterial systolic', 'Transducer below the axis', 'Catheter in the vein', 'Underdamped system'], answer: 0,
    explain: 'The flush bag must be at 300 mmHg — above systolic — or blood backs up the line, the continuous flush stops and the catheter clots. Inflate the bag to 300 and flush the blood back.' },
  { id: 'c-migrated', kind: 'fix', level: 'Advanced', title: 'The CVP that pulses to 25', setup: { scenario: 'normal', cvp: 'migrated', view: 'heart' },
    brief: 'The CVP trace now swings from about 2 to 25 mmHg with every beat, and there are occasional ectopic beats. Freeze the monitor and look at the shape.',
    question: 'What does the waveform show?', options: ['The catheter tip has migrated into the right ventricle', 'Giant v waves from tricuspid regurgitation', 'Cannon a waves from heart block', 'An underdamped CVP line'], answer: 0,
    explain: 'A sharp systolic rise to ≈ 25 and a diastolic floor near zero is a ventricular trace. TR can give a large c-v wave, but diastolic pressure stays high. Notify the provider and get a chest X-ray; stop vasoactive infusions through that lumen until the tip is confirmed. The provider withdraws it to the cavo-atrial junction; ectopy settles once the tip leaves the RV.' },
  { id: 'c-transport', kind: 'fix', level: 'Advanced', title: 'Onto the transport stretcher', setup: { scenario: 'sepsis', vent: 'ppv', nore: 0.1, bedH: 88, hob: 20, below: 16, art: 'kink', view: 'bed' },
    brief: 'You have just moved the patient onto the transport stretcher. The arterial trace looks smudged and MAP reads higher than a minute ago. Norepinephrine 0.1 µg/kg/min is running. Find everything that is wrong before you touch the pump.',
    question: 'Before changing the norepinephrine, what do you suspect?', options: ['A monitoring problem: the transducer was not re-levelled and the trace is damped', 'The septic shock has resolved', 'The norepinephrine dose is too high', 'Fluid overload'], answer: 0,
    explain: 'A sudden change after moving a patient is a monitoring problem until proven otherwise. The transducer stayed at the old bed height (reading high), and the wrist is flexed, kinking the cannula (damped). Level, straighten the wrist, check with a flush test — then titrate to the real MAP.' },
  { id: 'c-read-tamp', kind: 'read', level: 'Intermediate', title: 'Six hours after cardiac surgery', setup: { scenario: 'tamponade', vent: 'spont', view: 'bed' },
    brief: 'Six hours after valve surgery, the chest drains have stopped draining. Heart rate about 130. Look at both traces with the breathing.',
    question: 'What is the diagnosis?', options: ['Cardiac tamponade', 'Hypovolaemia from bleeding', 'LV failure', 'Complete heart block'], answer: 0,
    explain: 'High CVP (≈ 18) with no y descent, a narrow pulse pressure, and systolic falling more than 10 mmHg on each breath in (pulsus paradoxus): tamponade. Hypovolaemia would have a low CVP. Treatment: surgical re-exploration or pericardiocentesis.' },
  { id: 'c-read-chb', kind: 'read', level: 'Intermediate', title: 'Slow and strange', setup: { scenario: 'chb', view: 'bed' },
    brief: 'Heart rate 38. Every so often a very tall wave appears on the CVP trace.',
    question: 'What causes the tall CVP waves?', options: ['Cannon a waves: atria contracting against a closed tricuspid (AV dissociation)', 'Giant v waves of tricuspid regurgitation', 'Catheter in the right ventricle', 'Artefact from coughing'], answer: 0,
    explain: 'The tall waves are intermittent and fall where an independent P wave lands during ventricular systole: cannon a waves of complete heart block. The slow rate also gives large stroke volumes and a wide pulse pressure.' },
  { id: 'c-read-ar', kind: 'read', level: 'Intermediate', title: 'A bounding pulse', setup: { scenario: 'ar', view: 'bed' },
    brief: 'The arterial trace shows a steep upstroke, a very low diastolic pressure and no clear dicrotic notch.',
    question: 'Which lesion fits?', options: ['Aortic regurgitation', 'Aortic stenosis', 'Hypovolaemia', 'Tamponade'], answer: 0,
    explain: 'Very wide pulse pressure, low diastolic pressure, steep upstroke and a lost notch (often a bisferiens double peak): aortic regurgitation. AS is the opposite — slow, small and late.' },
  { id: 'c-read-as', kind: 'read', level: 'Intermediate', title: 'Slow to rise', setup: { scenario: 'as', view: 'bed' },
    brief: 'An elderly patient with a systolic murmur. The arterial upstroke is slow, with a shoulder on the way up, and peaks late.',
    question: 'Which lesion fits?', options: ['Aortic stenosis', 'Aortic regurgitation', 'Septic shock', 'Stiff arteries only'], answer: 0,
    explain: 'Pulsus parvus et tardus — a small, late, slow-rising pulse with an anacrotic shoulder — is aortic stenosis.' },
  { id: 'c-ppv-af', kind: 'read', level: 'Advanced', title: 'Is she fluid-responsive?', setup: { scenario: 'af', vent: 'ppv', view: 'bed' },
    brief: 'Ventilated, MAP 80. The monitor shows a pulse-pressure variation over 30 %. The team suggests a fluid bolus.',
    question: 'What do you make of the PPV?', options: ['It cannot be used: the rhythm is irregular (AF)', 'Over 13 % — give fluid', 'Over 13 % — start a vasopressor', 'It proves she is overloaded'], answer: 0,
    explain: 'PPV needs a regular rhythm: in AF every beat has a different filling time, so the pulse pressure varies whatever the volume status. Use a passive leg raise or a fluid challenge with a cardiac-output measure instead.' },
  { id: 'c-goal-fluid', kind: 'goal', level: 'Intermediate', title: 'Resuscitate the bleeding patient', setup: { scenario: 'hypovol', vent: 'ppv', vt: 8, view: 'bed' },
    brief: 'Haemorrhage, now controlled. Ventilated at 8 mL/kg, sinus tachycardia. Use the waveform to guide fluid.',
    question: 'Is this patient likely to respond to fluid?', options: ['Yes — PPV > 13 % on controlled ventilation in sinus rhythm', 'No — the CVP is low', 'Cannot tell without a cuff pressure', 'No — the MAP is 65'], answer: 0,
    explain: 'All the conditions for PPV are met and it is well above 13 %. Give fluid in 500 mL steps and re-check the variation after each.',
    goals: [{ label: 'PPV below 12 %', test: (s) => s.num.ppv != null && s.num.ppv < 12 }, { label: 'MAP ≥ 65 (true)', test: (s) => s.num.tMap >= 65 }] },
  { id: 'c-goal-sepsis', kind: 'goal', level: 'Advanced', title: 'Warm, vasodilated and hypotensive', setup: { scenario: 'sepsis', vent: 'ppv', vt: 8, view: 'bed' },
    brief: 'Septic shock after 2 L of fluid. MAP in the high 50s, low diastolic, low dicrotic notch.',
    question: 'What does the waveform suggest is the main problem?', options: ['Low vascular tone — a vasopressor is needed', 'Pump failure — start an inotrope', 'Severe hypovolaemia only', 'Tamponade'], answer: 0,
    explain: 'Low diastolic pressure with a notch near the diastolic level and a high heart rate: vasoplegia. Norepinephrine restores tone. PPV is still just above 13 %, so some fluid may help alongside it.',
    goals: [{ label: 'MAP ≥ 65 (true)', test: (s) => s.num.tMap >= 65 }, { label: 'MAP ≤ 90', test: (s) => s.num.tMap <= 90 }, { label: 'Monitoring system correct', test: ok }] },
];
