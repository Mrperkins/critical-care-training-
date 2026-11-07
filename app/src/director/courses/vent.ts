/** Respiratory courses: ventilator mechanics, ARDS, obstruction, pneumothorax and the paediatric airway. */
import type { CourseMeta } from '../course';
const q = (question: string, options: string[], answer: number, why: string) => ({ q: question, options, answer, why });

export const VENT_COURSES: Record<string, CourseMeta> = {
  'vent-ards-signature': {
    objectives: ['Explain why ARDS hypoxaemia is mainly shunt and why FiO₂ alone barely helps.', 'Describe what PEEP recruits and what it overstretches.', 'Set protective ventilation from predicted body weight and plateau pressure.'],
    essentials: ['ards-1', 'ards-3', 'ards-5', 'ards-6', 'ards-7'],
    keyPoints: [
      'ARDS lungs are small, heavy and stiff: the dependent lung collapses and floods.',
      'Blood flowing past airless alveoli is shunt. Raising FiO₂ hardly moves the saturation. Reopening alveoli does.',
      'PEEP recruits collapsed units, but past a point it overstretches the open lung and raises plateau pressure.',
      'Ventilate gently: tidal volume by predicted body weight, plateau under 30 cmH₂O, PEEP set by the response.',
      'Films and ultrasound support the picture but cannot diagnose ARDS on their own.',
    ],
    pearls: ['A falling driving pressure after a PEEP rise suggests you recruited lung; a rising one suggests you overstretched it.', 'Prone positioning recruits the dorsal lung without more airway pressure — consider it early in severe ARDS.'],
    pitfalls: ['Chasing a saturation with FiO₂ alone while the lung stays collapsed.', 'Using actual body weight for tidal volume in an obese patient — the lungs are the size of the predicted weight.'],
    bedside: 'Do an inspiratory hold after every PEEP change and write down plateau and driving pressure.',
    checkpoints: { 'ards-5': { prompt: 'PEEP goes from 5 to 16. What should happen to the driving pressure if lung is recruited?', answer: 'It falls: the same tidal volume now fills more open alveoli, so compliance rises and less pressure is needed above PEEP.' } },
    selfCheck: [
      q('A patient with ARDS has SpO₂ 86 % on FiO₂ 0.6. FiO₂ goes to 1.0 and SpO₂ reaches 88 %. What is the main mechanism?', ['Hypoventilation', 'Shunt', 'Diffusion limitation', 'Dead space'], 1, 'Blood passing alveoli that receive no gas never meets the extra oxygen, so a large shunt barely responds to FiO₂.'),
      q('After raising PEEP from 12 to 20, plateau rises from 26 to 34 cmH₂O and blood pressure falls. Best next step?', ['Raise PEEP further to recruit more', 'Reduce PEEP back toward the previous level', 'Increase tidal volume', 'Start a diuretic'], 1, 'Rising plateau plus haemodynamic compromise points to overdistension; step PEEP back down.'),
    ],
  },
  'vent-ards-vs-obstruction': {
    objectives: ['Split peak pressure into resistive and elastic parts with an inspiratory hold.', 'Tell a compliance problem from a resistance problem at the bedside.', 'Recognise and measure auto-PEEP, and fix it with expiratory time.'],
    essentials: ['cr-1', 'cr-2', 'cr-3', 'cr-4', 'cr-5'],
    keyPoints: [
      'Peak = PEEP + elastic pressure + resistive pressure. An inspiratory hold removes the resistive part and leaves the plateau.',
      'High peak, high plateau, normal gap: stiff lung (ARDS, oedema, pneumothorax).',
      'High peak, near-normal plateau, big gap: narrow airways (asthma, secretions, a kinked tube).',
      'Expiratory flow that does not reach zero means trapped gas. Measure auto-PEEP with an expiratory hold.',
      'Treat obstruction with bronchodilators and time to exhale: a lower rate and a shorter inspiration.',
    ],
    pearls: ['In obstruction the peak pressure looks frightening; the plateau is what injures the lung.', 'Disconnecting the circuit briefly in a hypotensive, hyperinflated asthmatic can be diagnostic and therapeutic.'],
    pitfalls: ['Raising the high-pressure alarm instead of treating resistance.', 'Increasing the rate to clear CO₂ in asthma — it shortens expiration and worsens trapping.'],
    bedside: 'When the pressure alarm sounds: inspiratory hold first, then decide whether it is airway or lung.',
    selfCheck: [
      q('Volume control: peak 48, plateau 22, PEEP 5 cmH₂O. Most likely problem?', ['Stiff lung', 'Increased airway resistance', 'Auto-PEEP only', 'Pneumothorax'], 1, 'A 26 cmH₂O gap between peak and plateau is resistive pressure; the plateau is acceptable.'),
      q('Expiratory flow is still negative when the next breath starts. Which change helps most?', ['Increase the rate', 'Lower the rate and shorten inspiratory time', 'Raise PEEP to 15', 'Increase tidal volume'], 1, 'Trapping is fixed by giving more time to exhale.'),
    ],
  },
  'vent-tension-ptx': {
    objectives: ['Recognise tension pneumothorax on the ventilator from pressures, saturation and blood pressure.', 'Explain why it causes obstructive shock.', 'Decompress first; use ultrasound and films to confirm, never to delay.'],
    essentials: ['ptx-2', 'ptx-4', 'ptx-5', 'ptx-6'],
    keyPoints: [
      'Positive pressure pumps air into the pleural space with every breath, and it cannot escape.',
      'Rising intrathoracic pressure collapses venous return: obstructive shock that fluids and pressors cannot fix.',
      'Signs on the ventilator: rising peak and plateau, falling SpO₂, falling blood pressure, rising heart rate.',
      'Treatment is immediate decompression, then a chest drain.',
      'Ultrasound (no sliding, barcode on M-mode, a lung point) confirms in seconds but must never delay decompression.',
    ],
    pearls: ['A lung point is specific for pneumothorax; its absence does not exclude one.', 'Tracheal deviation is a late and unreliable sign in ventilated patients.'],
    pitfalls: ['Waiting for a chest film in a crashing ventilated patient.', 'Treating the hypotension with fluids or vasopressors while the cause is mechanical.'],
    bedside: 'Sudden high pressures plus hypotension on the ventilator: think tension and look for lung sliding now.',
    checkpoints: { 'ptx-4': { prompt: 'Why does the blood pressure fall when the problem is in the pleura?', answer: 'High intrathoracic pressure compresses the great veins; venous return and cardiac output fall.' } },
    selfCheck: [
      q('Ventilated trauma patient: peak pressure jumps from 24 to 45, SpO₂ 82 %, BP 70/40, no sliding on the right. Next step?', ['Chest X-ray', 'Fluid bolus', 'Right-sided decompression', 'Increase FiO₂ and wait'], 2, 'Clinical tension pneumothorax is decompressed immediately.'),
      q('Which ultrasound finding confirms a pneumothorax?', ['B-lines', 'A seashore sign', 'A lung point', 'A-lines alone'], 2, 'A lung point marks the edge of the air; A-lines alone also occur in normal lung.'),
    ],
  },
  'vent-needle': {
    objectives: ['Choose a safe needle decompression site.', 'Avoid the neurovascular bundle and the internal thoracic artery.', 'Recognise a failed decompression and follow with definitive drainage.'],
    essentials: ['nd-2', 'nd-3', 'nd-5', 'nd-7'],
    keyPoints: [
      'Two sites: 2nd intercostal space mid-clavicular line, or 4th–5th space anterior to mid-axillary line (safe triangle).',
      'Go over the top of the rib below — the vessels and nerve run under each rib.',
      'Use a catheter long enough for the chest wall; a short one can end in muscle.',
      'Stay lateral: too medial meets the internal thoracic artery and heart; too low meets diaphragm, liver or spleen.',
      'A needle is a bridge. Reassess often and follow with finger thoracostomy or a chest drain.',
    ],
    pearls: ['The lateral site has a thinner chest wall in most adults and a higher success rate.', 'Feel for a rush of air and watch peak pressure and blood pressure for confirmation.'],
    pitfalls: ['Calling it done when the catheter never reached the pleura.', 'Forgetting that catheters kink — recurrent tension is common.'],
    bedside: 'After any needle decompression, prepare a finger thoracostomy or drain straight away.',
    selfCheck: [
      q('Why go over the top of the rib?', ['The pleura is thinner there', 'The intercostal vessels and nerve run along the lower edge of each rib', 'It is closer to the lung', 'It hurts less'], 1, 'The neurovascular bundle sits in the groove under each rib.'),
      q('Needle decompression at the 2nd space gives no air and no improvement in a large patient. Most likely reason?', ['No pneumothorax', 'Catheter too short for the chest wall', 'Tension has resolved', 'Wrong side'], 1, 'Anterior chest wall thickness often exceeds a 5 cm catheter; try the lateral site with a longer catheter.'),
    ],
  },
  'peds-airway': {
    objectives: ['Use Poiseuille’s law to explain why small airways are vulnerable.', 'Explain why calming a child is treatment.', 'Check the tube first when a ventilated child deteriorates.'],
    essentials: ['pa-1', 'pa-2', 'pa-3', 'pa-6'],
    keyPoints: [
      'Resistance rises with the fourth power of the radius: halve the radius and resistance rises 16 times.',
      'One millimetre of swelling triples resistance in an adult airway but raises it 16-fold in an infant’s.',
      'Crying makes flow turbulent and resistance worse: keep the child calm, with a parent.',
      'The cricoid ring cannot expand, so swelling there narrows the lumen.',
      'A small tube with a little secretion loses a large share of its radius: check the tube first.',
    ],
    pearls: ['A child with stridor who suddenly becomes quiet may be tiring, not improving.', 'Use the DOPE checklist on a deteriorating ventilated child: Displacement, Obstruction, Pneumothorax, Equipment.'],
    pitfalls: ['Upsetting a child with upper airway obstruction for an unnecessary procedure.', 'Assuming the lungs are the problem when the tube is partly blocked.'],
    bedside: 'Ventilated child deteriorating: suction and check the tube before changing ventilator settings.',
    selfCheck: [
      q('An infant airway of 4 mm swells by 1 mm all round. Roughly how much does resistance rise?', ['2×', '4×', '16×', '32×'], 2, 'The radius halves (4 → 2 mm diameter), so resistance rises 2⁴ = 16 times.'),
      q('Peak pressure rises but plateau is unchanged in a ventilated 2-year-old. First action?', ['Increase PEEP', 'Suction and check the tube', 'Give a fluid bolus', 'Increase tidal volume'], 1, 'A widening peak–plateau gap is resistance — usually the small tube.'),
    ],
  },
  eom: {
    objectives: ['State the equation of motion and name each term.', 'Read peak, plateau and driving pressure from a volume-control breath.', 'Calculate static compliance and the time constant.'],
    essentials: ['eom1', 'eom3', 'eom4'],
    keyPoints: [
      'Airway pressure = resistance × flow + volume ÷ compliance + PEEP.',
      'An inspiratory hold stops flow: the drop from peak to plateau is the airways; the plateau is the lung.',
      'Driving pressure = plateau − PEEP. Static compliance = tidal volume ÷ driving pressure.',
      'Exhalation is passive; the time constant τ = R × C. Three τ empties about 95 % of the breath.',
    ],
    pearls: ['Normal static compliance in a ventilated adult is roughly 50–80 mL/cmH₂O.', 'Driving pressure tracks lung strain better than tidal volume alone.'],
    pitfalls: ['Reading the plateau without a proper hold — any flow left adds resistive pressure.'],
    bedside: 'Make an inspiratory hold part of every ventilator check.',
    selfCheck: [
      q('VT 450 mL, plateau 25, PEEP 10 cmH₂O. Static compliance?', ['18 mL/cmH₂O', '30 mL/cmH₂O', '45 mL/cmH₂O', '60 mL/cmH₂O'], 1, '450 ÷ (25 − 10) = 30 mL/cmH₂O.'),
      q('R = 10 cmH₂O/L/s and C = 0.05 L/cmH₂O. What is τ?', ['0.05 s', '0.5 s', '2 s', '5 s'], 1, 'τ = R × C = 10 × 0.05 = 0.5 s.'),
    ],
  },
  rc: {
    objectives: ['Use an inspiratory hold to separate resistance from compliance.', 'List causes of each.'],
    essentials: ['rc1', 'rc3', 'rc4'],
    keyPoints: [
      'High peak with a normal plateau is a resistance problem: bronchospasm, secretions, a kinked or bitten tube.',
      'High peak with a high plateau is a compliance problem: pneumothorax, mainstem intubation, oedema, abdominal distension.',
      'Resistance falls with the fourth power of the radius, so a little bronchodilation drops pressure a lot.',
    ],
    pearls: ['Pass a suction catheter: if it will not go, the tube is the problem.'],
    pitfalls: ['Silencing the alarm without doing the hold.'],
    bedside: 'High-pressure alarm → inspiratory hold → resistance or compliance list.',
    selfCheck: [
      q('Peak rises 20 → 40, plateau rises 18 → 36. Which is likely?', ['Bronchospasm', 'Bitten tube', 'Right mainstem intubation', 'Secretions'], 2, 'Both pressures rose together: a compliance problem, such as ventilating one lung.'),
    ],
  },
  vcpc: {
    objectives: ['Compare what is set and what varies in volume and pressure control.', 'Know which alarm to watch in each mode.'],
    essentials: ['vp1', 'vp2', 'vp3'],
    keyPoints: [
      'Volume control sets volume and flow; pressure is the result — watch the pressures.',
      'Pressure control sets pressure and time; volume is the result — watch the tidal volume.',
      'When the lung stiffens, volume control raises pressure while pressure control drops volume.',
      'A decelerating flow lowers peak pressure; plateau is unchanged because volume and lung are unchanged.',
    ],
    pitfalls: ['Missing hypoventilation in pressure control because the pressures look fine.'],
    bedside: 'In pressure modes, set a low tidal-volume and low minute-volume alarm.',
    selfCheck: [
      q('In pressure control, compliance falls by half. What happens?', ['Peak pressure doubles', 'Tidal volume falls', 'Flow becomes square', 'Nothing changes'], 1, 'Pressure is capped, so less volume enters a stiffer lung.'),
    ],
  },
  peep: {
    objectives: ['Explain recruitment and why opening pressure exceeds closing pressure.', 'Recognise overdistension and its haemodynamic cost.', 'Find a PEEP that balances the two.'],
    essentials: ['pe2', 'pe3', 'pe4'],
    keyPoints: [
      'Dependent ARDS lung collapses and causes shunt.',
      'Raising PEEP recruits collapsed units: driving pressure falls, compliance and saturation rise.',
      'Too much PEEP overstretches the open lung: plateau rises, compliance falls, venous return and blood pressure fall.',
      'Best PEEP: lowest driving pressure with acceptable plateau, oxygenation and blood pressure.',
    ],
    pitfalls: ['Adding PEEP without checking blood pressure.'],
    bedside: 'Change PEEP in small steps and recheck driving pressure and blood pressure after each.',
    selfCheck: [
      q('PEEP 10 → 14: driving pressure 18 → 13 and SpO₂ rises. What happened?', ['Overdistension', 'Recruitment', 'Auto-PEEP', 'Leak'], 1, 'Lower driving pressure for the same volume means more open lung.'),
    ],
  },
  auto: {
    objectives: ['Recognise auto-PEEP on the flow trace.', 'Measure it with an expiratory hold.', 'Treat it by increasing expiratory time.'],
    essentials: ['au1', 'au3'],
    keyPoints: [
      'Expiratory flow that is still negative when the next breath begins means trapped gas.',
      'An expiratory hold reveals auto-PEEP above set PEEP.',
      'Auto-PEEP raises plateau, lowers venous return and makes triggering harder.',
      'Lower the rate and shorten inspiration; accept a higher CO₂ in asthma.',
    ],
    pitfalls: ['Raising the rate to fix CO₂ in a trapped patient.'],
    bedside: 'In any obstructed patient on the ventilator, check that expiratory flow returns to zero.',
    selfCheck: [
      q('Set PEEP 5; end-expiratory hold reads 13. Auto-PEEP?', ['5', '8', '13', '18'], 1, 'Total PEEP 13 − set PEEP 5 = 8 cmH₂O.'),
    ],
  },
  sync: {
    objectives: ['Describe triggering and cycling in pressure support.', 'Recognise premature and delayed cycling and ineffective efforts.'],
    essentials: ['sy1', 'sy3', 'sy4'],
    keyPoints: [
      'Pressure support starts when the patient triggers and stops when flow falls to the cycle-off percentage.',
      'Premature cycling: the breath stops while the patient is still inhaling — a dip in expiratory flow, sometimes double triggering.',
      'Delayed cycling: the ventilator keeps inflating after the patient has finished — raise the cycle-off percentage (common in COPD).',
      'Ineffective efforts: bumps on the expiratory flow with no breath — usually auto-PEEP.',
    ],
    pitfalls: ['Sedating dyssynchrony away instead of adjusting the ventilator.'],
    bedside: 'Watch the flow trace for one minute before reaching for sedation.',
    selfCheck: [
      q('COPD patient on pressure support is actively exhaling against the ventilator at the end of each breath. Fix?', ['Lower the cycle-off %', 'Raise the cycle-off %', 'Raise pressure support', 'Lower PEEP'], 1, 'A higher cycle-off percentage ends the breath sooner — delayed cycling.'),
    ],
  },
};
