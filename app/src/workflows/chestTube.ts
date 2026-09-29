/**
 * Tension pneumothorax on the ventilator → needle decompression → tube thoracostomy, performed on the
 * REAL vent session (scenario 'ptx'). Teaching sequence in our own words; local protocols differ.
 */
import type { Workflow } from './workflow';
import { session } from '../vent/session';

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
export const VENT_WORKFLOWS: Workflow[] = [CHEST_TUBE, DOPES];
