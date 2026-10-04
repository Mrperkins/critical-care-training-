/**
 * Tension pneumothorax on the ventilator → needle decompression → tube thoracostomy, performed on the
 * REAL vent session (scenario 'ptx'). Teaching sequence in our own words; local protocols differ.
 */
import type { Workflow } from './workflow';
import { session } from '../vent/session';
import { DRAIN_DEFAULT } from './chestDrain';
import { useDrain, setDrain } from './drainStore';

export const CHEST_TUBE: Workflow = {
  id: 'wf-chest-tube', module: 'vent', level: 'advanced',
  title: 'Tension pneumothorax: decompress, then drain',
  blurb: 'Recognise tension on the ventilator, decompress immediately, then place a chest drain safely — and watch the lung, pressures and blood pressure respond.',
  context: 'Ventilated trauma patient. Sudden high-pressure alarm: peak AND plateau pressures up, SpO₂ falling, BP 70/40, no breath sounds on the right, trachea deviating left.',
  setup: () => { session.load('ptx'); },
  steps: [
    { id: 'recognise', label: 'Call it: tension pneumothorax (clinical diagnosis)', why: 'High peak and plateau pressures with hypotension, hypoxaemia and one silent side on a ventilated patient is tension until proven otherwise. It is treated before any imaging.' },
    { id: 'fio2', label: 'FiO₂ 1.0', why: 'Buys oxygen reserve while you decompress.' },
    { id: 'needle', label: 'Needle / finger decompression on the affected side', why: 'Releases pleural pressure at once — venous return and blood pressure recover. Sites: 4th–5th intercostal space just anterior to the mid-axillary line, or 2nd space mid-clavicular; in a ventilated patient a finger thoracostomy at the lateral site is common.', critical: true },
    { id: 'site', label: 'Choose the site: triangle of safety, 4th–5th space', why: 'Bounded by the lateral edge of pectoralis major, the anterior edge of latissimus dorsi and a line at the level of the nipple. Lower sites risk diaphragm, liver and spleen.' },
    { id: 'prep', label: 'Position (arm up), aseptic prep, local anaesthetic', why: 'Arm abducted opens the space; asepsis prevents empyema; infiltrate down to the pleura and the periosteum.' },
    { id: 'dissect', label: 'Incise, then blunt-dissect over the TOP of the rib into the pleura', why: 'The intercostal artery, vein and nerve run in the groove under each rib. Going over the upper edge of the rib below avoids them.', critical: true },
    { id: 'sweep', label: 'Finger sweep inside the pleura', why: 'Confirms you are in the pleural space and there are no adhesions or organs in the way.' },
    { id: 'tube', label: 'Guide the tube in (no sharp trocar), all side holes inside', why: 'Directed apically for air. A side hole outside the chest wall leaks air into the tissues.', critical: true },
    { id: 'seal', label: 'Connect to an underwater seal / drainage system, secure', why: 'A one-way valve: air leaves, none returns. Secure and dress so it cannot be pulled out.' },
    { id: 'confirm', label: 'Confirm: swing, bubbling, pressures & SpO₂ recover; chest X-ray', why: 'Fluid swing with breathing and bubbling mean it is in the pleura; the X-ray checks position and re-expansion.' },
  ],
  anyOrder: [['site', 'prep']],
  distractors: [
    { id: 'xray', label: 'Get a chest X-ray before decompressing', why: 'Tension kills in minutes. Waiting for imaging is the classic avoidable death.', critical: true },
    { id: 'peep', label: 'Increase PEEP to fix the oxygenation', why: 'More positive pressure pushes more air through the leak and raises intrathoracic pressure further — pressures climb, blood pressure falls.', critical: true },
    { id: 'underRib', label: 'Dissect along the lower edge of the rib above', why: 'That is where the intercostal vessels and nerve run: bleeding and neuralgia.', critical: true },
    { id: 'trocar', label: 'Push the tube in on a sharp trocar', why: 'Sharp trocars cause lung, heart, liver and spleen injuries. Use blunt dissection and a finger.', critical: true },
    { id: 'low', label: 'Insert at the 7th–8th space for easier access', why: 'Below the safe triangle the diaphragm rises in expiration: abdominal organ injury.', critical: true },
    { id: 'clamp', label: 'Clamp the drain for the CT transfer', why: 'With an ongoing air leak on positive pressure, a clamped drain lets the tension re-accumulate.' },
  ],
  effects: {
    fio2: () => session.set({ fio2: 1 }),
    needle: () => session.intervene('decompress'),
    tube: () => session.intervene('chestTube'),
    peep: () => session.set({ peep: (session.m.s.peep ?? 5) + 6 }),
  },
  debrief: 'Tension is a clinical diagnosis treated with immediate decompression; the drain is the definitive fix. The same ventilator numbers that raised the alarm — peak AND plateau pressure, SpO₂, blood pressure — confirm the result.',
};

export const DOPES: Workflow = {
  id: 'wf-dopes', module: 'vent', level: 'core',
  title: 'Ventilated patient desaturating: DOPES',
  blurb: 'Displacement, Obstruction, Pneumothorax, Equipment, Stacking — work through them in a safe order, and let the inspiratory hold tell resistance from compliance.',
  context: 'Day 5 of ventilation. High-pressure alarm, SpO₂ 88 % and falling, patient coughing. The tube is taped at 22 cm at the teeth.',
  setup: () => { session.load('ett'); },
  steps: [
    { id: 'o2', label: 'FiO₂ 1.0; if unsure, disconnect and hand-ventilate with a bag', why: 'Bagging takes the ventilator (Equipment) and breath stacking out of the equation at once, and lets you feel the resistance.' },
    { id: 'displacement', label: 'Displacement: tube depth at the teeth, capnography waveform, chest rise', why: 'Lost EtCO₂ waveform = the tube is out until proven otherwise. Here it is still there at 22 cm.' },
    { id: 'hold', label: 'Inspiratory hold: compare peak and plateau', why: 'Peak high with a NORMAL plateau means the pressure is being lost across resistance (tube or airways), not a stiff lung or chest.' },
    { id: 'suction', label: 'Obstruction: pass a suction catheter', why: 'It meets resistance and thick secretions come back — the tube was partly blocked.', critical: true },
    { id: 'ptx', label: 'Pneumothorax: breath sounds and chest movement equal? (ultrasound lung sliding)', why: 'Excluded here — but a ventilated patient with high pressures and hypotension has tension until proven otherwise.' },
    { id: 'reassess', label: 'Reconnect and reassess: peak pressure, SpO₂, tidal volume', why: 'The peak–plateau gap should close once the tube is clear.' },
  ],
  anyOrder: [['displacement', 'hold']],
  distractors: [
    { id: 'alarm', label: 'Raise the high-pressure alarm limit', why: 'The alarm is telling you the tube is blocking. Silencing it removes the warning, not the problem.', critical: true },
    { id: 'sedate', label: 'Give more sedation for “fighting the ventilator”', why: 'Treats the patient’s response to a blocked tube, not the tube. Check the machine and the airway first.' },
    { id: 'paralyse', label: 'Paralyse to bring the pressures down', why: 'Masks the cause; with a blocked tube the peak pressure stays high anyway.', critical: true },
    { id: 'peep', label: 'Raise PEEP for the desaturation', why: 'A blocked tube is a resistance problem; more PEEP adds pressure without opening the tube.' },
  ],
  effects: {
    o2: () => session.set({ fio2: 1 }), hold: () => session.hold('i'), suction: () => session.intervene('suction'),
    paralyse: () => session.intervene('paralyse'), peep: () => session.set({ peep: (session.m.s.peep ?? 5) + 5 }),
  },
  debrief: 'Oxygen first, then a fixed order — Displacement, Obstruction, Pneumothorax, Equipment, Stacking. The inspiratory hold splits resistance (high peak, normal plateau) from compliance (both high).',
};

/** Hourly drain check on the SAME ventilated patient after the drain went in; a hidden kink lets tension re-accumulate in the real mechanics until the tubing is traced. */
export const CHEST_DRAIN_CHECK: Workflow = {
  id: 'wf-drain-check', module: 'vent', level: 'core',
  title: 'Chest drain assessment',
  blurb: 'Hourly check of a three-chamber drain: patient, site, tubing, unit, suction, tidaling, air leak and drainage — with a live water seal driven by the patient’s pleural pressure.',
  context: 'Ventilated patient, 4 h after a right chest drain for tension pneumothorax, water seal with an air leak. Peak pressures have crept up over the last few minutes. You start your drain check.',
  setup: () => {
    session.load('ptx'); session.intervene('decompress'); session.intervene('chestTube');
    for (let i = 0; i < 12 * 20; i++) session.tick(0.05); // drain in and lung re-expanded
    useDrain.getState().set({ caseId: null, answer: null, test: null, cfg: { ...DRAIN_DEFAULT, leak: 2, expanded: 0.7 } });
    setDrain({ kink: true }); // the patient is lying on the tubing
  },
  steps: [
    { id: 'patient', label: 'Patient first: SpO₂, ventilator pressures, breath sounds, chest movement, pain', why: 'The drain exists for the patient. Rising peak and plateau pressures with a falling SpO₂ in someone with a drain means the drain may not be working.' },
    { id: 'site', label: 'Insertion site: dressing dry and occlusive, depth mark unchanged, no subcutaneous emphysema', why: 'A tube that has slipped out puts side holes outside the pleura — air is drawn in and tracks under the skin.' },
    { id: 'tubing', label: 'Trace the tubing from chest to unit: no kinks, no dependent loops, connections secure, not under the patient', why: 'Here the patient is lying on it: a kink. Freed, the swing and the leak bubbles return and the pressures come down.', critical: true },
    { id: 'unit', label: 'Unit upright and below the chest', why: 'Above the chest, fluid siphons back into the pleura; tipped over, the water seal is lost.', critical: true },
    { id: 'suction', label: 'Suction as ordered (or water seal only): gentle bubbling in the suction chamber', why: 'In a wet system the water depth sets the suction; vigorous bubbling adds nothing but noise and evaporation.' },
    { id: 'swing', label: 'Water seal at its level; watch for tidaling (suction briefly off if needed)', why: 'Tidaling means the tube is patent and in the pleural space. On the ventilator the column falls with each breath.' },
    { id: 'leak', label: 'Air leak: pattern and grade — with breaths, every breath, continuous', why: 'A leak that is getting smaller means the lung is sealing; a new continuous leak means check the system.' },
    { id: 'output', label: 'Drainage: volume, colour and rate; mark the level with the time', why: 'Trends matter: a sudden fall in bloody output with worsening vital signs is a blocked tube, not a stopped bleed.' },
  ],
  anyOrder: [['suction', 'swing', 'leak', 'output']],
  distractors: [
    { id: 'clamp', label: 'Clamp the drain while you sort it out', why: 'The lung is still leaking under positive pressure. A clamped drain turns an air leak into a tension pneumothorax.', critical: true },
    { id: 'bed', label: 'Lift the unit onto the bed beside the patient', why: 'Level with or above the chest, fluid runs back into the pleura.', critical: true },
    { id: 'topup', label: 'Add water to the water seal to stop the bubbling', why: 'The bubbles are air leaving the lung — the leak is in the patient, not the seal. A deeper seal only makes the air work harder to get out.' },
    { id: 'strip', label: 'Strip (milk) the whole tubing hard every hour', why: 'Stripping generates very high negative pressures at the tube tip. Only gentle milking of a visible clot, if local policy allows.' },
    { id: 'push', label: 'Push the tube further in to improve it', why: 'The external part is not sterile; a migrated tube is secured and replaced, never advanced.', critical: true },
  ],
  effects: {
    tubing: () => setDrain({ kink: false }),
    clamp: () => setDrain({ clamped: true }),
    bed: () => setDrain({ unitHigh: true }),
  },
  debrief: 'Check the drain from the patient outward: patient, site, tubing, unit, then the chambers. Swing and bubbling are the drain talking — their sudden disappearance on a leaking lung is an emergency, and the ventilator shows it before anyone looks at the unit.',
};

/** Low-pressure / low-volume alarm on the real vent session: a disconnection at the HME, then a residual cuff leak. */
export const LOW_PRESSURE: Workflow = {
  id: 'wf-low-pressure', module: 'vent', level: 'core',
  title: 'Low-pressure alarm: disconnection and cuff leak',
  blurb: 'Peak pressure and exhaled volume have collapsed: find the open circuit, then the leak around the cuff — and watch the lung lose its PEEP while you look.',
  context: 'Ventilated patient just moved from the stretcher to the aircraft litter. Low-pressure and low exhaled-volume alarms, peak pressure barely above zero, the capnography waveform has gone, SpO₂ starting to fall.',
  setup: () => { session.load('ards'); session.set({ peep: 12, vt: 0.42 }); for (let i = 0; i < 10 * 20; i++) session.tick(0.05); session.circuit('both'); },
  steps: [
    { id: 'look', label: 'Look at the patient: chest rise, SpO₂, capnography waveform; listen for gas escaping', why: 'No chest rise and a lost EtCO₂ trace with a low peak pressure means gas is not reaching the lungs — an open circuit until proven otherwise.' },
    { id: 'trace', label: 'Trace the circuit from the tube to the ventilator: tube connector, HME/filter, wye, inline suction, water traps', why: 'Here the HME has come off the tube connector in the move. Reconnected: pressures and volumes return at once.', critical: true },
    { id: 'bag', label: 'If the fault is not found at once: bag with 100 % oxygen and a PEEP valve while you look', why: 'The patient is not ventilated while you search. A bag with a PEEP valve keeps oxygenation up without losing the recruited lung.' },
    { id: 'volumes', label: 'Compare inspired and exhaled tidal volume', why: 'Still a gap after reconnecting: gas is going in but not all of it is coming back — a leak between the ventilator and the alveoli.' },
    { id: 'cuff', label: 'Check the cuff: audible leak at the mouth, cuff pressure 20–30 cmH₂O, tube depth at the teeth', why: 'An under-filled cuff (or a tube pulled back so the cuff sits between the cords) leaks every breath. Re-inflate to the target pressure and confirm depth.', critical: true },
    { id: 'recruit', label: 'Reassess: exhaled volume = set, peak pressure back, EtCO₂ waveform, SpO₂; consider a recruitment step after the PEEP was lost', why: 'An ARDS lung derecruits within seconds of losing PEEP. Oxygenation may lag behind the restored pressures.' },
  ],
  anyOrder: [['trace', 'bag']],
  distractors: [
    { id: 'silence', label: 'Silence the alarm and carry on with the transfer', why: 'A low-pressure alarm on a paralysed patient is a disconnection until proven otherwise. The alarm is the only warning before hypoxia.', critical: true },
    { id: 'limit', label: 'Lower the low-pressure alarm limit so it stops sounding', why: 'The limit exists to catch exactly this. Set it a few cmH₂O below the patient’s usual peak, never to zero.', critical: true },
    { id: 'vt', label: 'Increase the set tidal volume to make up the lost volume', why: 'With the circuit open the extra volume goes into the room; once reconnected it becomes a high tidal volume in an ARDS lung.' },
    { id: 'sedate', label: 'Give more sedation', why: 'The patient is not the problem — the circuit is.' },
  ],
  effects: {
    trace: () => session.circuit(session.circuitFault === 'both' ? 'cuffLeak' : session.circuitFault === 'disconnect' ? 'none' : session.circuitFault),
    cuff: () => session.circuit(session.circuitFault === 'both' ? 'disconnect' : session.circuitFault === 'cuffLeak' ? 'none' : session.circuitFault),
    bag: () => session.set({ fio2: 1 }),
    vt: () => session.set({ vt: 0.6 }),
  },
  debrief: 'A low-pressure alarm is gas escaping: look at the patient, trace the circuit hand over hand, bag if you cannot fix it at once, then compare inspired and exhaled volumes to find a leak nearer the patient. The ventilator shows each fault in its own numbers — peak pressure near zero with nothing coming back is an open circuit; a steady gap between inspired and exhaled volume is a leak.',
};
export const VENT_WORKFLOWS: Workflow[] = [CHEST_TUBE, CHEST_DRAIN_CHECK, DOPES, LOW_PRESSURE];
