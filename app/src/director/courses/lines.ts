/** Haemodynamics courses: shock, oxygen delivery, haemorrhage, IABP, central access, pregnancy, children and invasive lines. */
import type { CourseMeta } from '../course';
const q = (question: string, options: string[], answer: number, why: string) => ({ q: question, options, answer, why });

export const LINES_COURSES: Record<string, CourseMeta> = {
  'lines-shock-states': {
    objectives: ['Classify shock using MAP = CO × SVR.', 'Read each shock state from the arterial line, CVP and output.', 'Match the treatment to the broken variable.'],
    essentials: ['sh-0', 'sh-1', 'sh-3', 'sh-5', 'sh-8', 'sh-10'],
    keyPoints: [
      'MAP ≈ cardiac output × SVR. Each shock breaks a different part.',
      'Distributive: low SVR, normal or high output, low diastolic and a low dicrotic notch — fluid then norepinephrine.',
      'Cardiogenic: low output, high filling pressures, narrow pulse pressure — inotropy, not fluid.',
      'Obstructive (tamponade): high CVP, equalised pressures, pulsus paradoxus — drain it.',
      'Hypovolaemic: low CVP, high pulse-pressure variation — volume and blood, then stop the bleeding.',
    ],
    pearls: ['A wide pulse pressure with a low diastolic points toward vasodilation.', 'Pulsus paradoxus over 10 mmHg in a hypotensive patient should prompt an echo for tamponade.'],
    pitfalls: ['Fluid-loading cardiogenic shock.', 'Using pressors to hide hypovolaemia.'],
    bedside: 'Name the broken variable — pump, tank, pipes or obstruction — before choosing a drug.',
    selfCheck: [
      q('Hypotension, CVP 18, narrow pulse pressure, cold peripheries, low output. Type?', ['Distributive', 'Cardiogenic', 'Hypovolaemic', 'Neurogenic'], 1, 'Low output with high filling pressures is a failing pump.'),
      q('Septic shock after adequate fluid with MAP 55. Next step?', ['More fluid until CVP 20', 'Norepinephrine to MAP ≈ 65', 'Dobutamine alone', 'Diuretic'], 1, 'Restore vascular tone with an α-agonist.'),
    ],
  },
  'lines-oxygen-delivery': {
    objectives: ['Calculate oxygen content and delivery.', 'Explain why SpO₂ hides anaemia and low output.', 'Recognise sepsis lactate with high delivery.'],
    essentials: ['do-1', 'do-2', 'do-5', 'do-6'],
    keyPoints: [
      'CaO₂ ≈ 1.34 × Hb × SaO₂ (+ a little dissolved). DO₂ = CaO₂ × cardiac output.',
      'Anaemia halves content with a perfect SpO₂; a healthy heart partly compensates, a failing one cannot.',
      'Low output lowers delivery in proportion: venous saturation falls, lactate rises.',
      'Sepsis can raise lactate despite high delivery: maldistribution and cellular dysfunction.',
    ],
    pitfalls: ['Reassurance from a normal or high ScvO₂ in sepsis.'],
    bedside: 'When perfusion looks poor, check haemoglobin, output and ScvO₂ together.',
    selfCheck: [
      q('Which change lowers DO₂ the most if the others stay normal?', ['SpO₂ 97 → 92 %', 'Hb 14 → 7 g/dL', 'PaO₂ 100 → 80 mmHg', 'FiO₂ 0.4 → 0.3'], 1, 'Halving haemoglobin halves content; small saturation changes matter much less.'),
    ],
  },
  'lines-haemorrhage-transfusion': {
    objectives: ['Explain why haemoglobin is normal early in haemorrhage.', 'Compare crystalloid and blood resuscitation.', 'Recognise a transfusion reaction.'],
    essentials: ['ht-2', 'ht-3', 'ht-4', 'ht-6'],
    keyPoints: [
      'Whole blood is lost: haemoglobin barely changes at first — the problem is volume.',
      'Crystalloid dilutes red cells and leaves the circulation within an hour.',
      'Blood restores volume and carrying capacity; in major haemorrhage give plasma, platelets and calcium too.',
      'Watch every unit for a reaction: stop, keep the line open with saline, check patient and product.',
      'Transfusion buys time; control of bleeding is the treatment.',
    ],
    pitfalls: ['Being reassured by a normal first haemoglobin.', 'Large crystalloid volumes in haemorrhagic shock.'],
    bedside: 'Shocked trauma patient: activate the major haemorrhage protocol early and think about where the bleeding is.',
    selfCheck: [
      q('20 minutes after major bleeding, Hb is 13.5. Interpretation?', ['No significant bleeding', 'Haemoglobin lags volume loss', 'Polycythaemia', 'Lab error'], 1, 'Concentration is unchanged until fluid shifts or is given.'),
    ],
  },
  'lines-iabp': {
    objectives: ['Explain diastolic augmentation and afterload reduction.', 'Read 1:2 timing.', 'Identify the four timing errors, especially late deflation.'],
    essentials: ['iabp-1', 'iabp-2', 'iabp-3', 'iabp-7'],
    keyPoints: [
      'The balloon inflates in diastole (coronary perfusion) and deflates just before systole (afterload reduction).',
      'At 1:2, compare assisted and unassisted beats: augmentation should match or exceed systole.',
      'Assisted end-diastolic pressure and assisted systole should both be lower than the patient’s own.',
      'Early inflation shortens ejection; late inflation loses augmentation; early deflation loses afterload reduction.',
      'Late deflation is the dangerous error: the ventricle ejects against a full balloon.',
    ],
    pitfalls: ['Missing late deflation because augmentation looks good.'],
    bedside: 'Check IABP timing at 1:2 whenever the heart rate or rhythm changes.',
    selfCheck: [
      q('Assisted end-diastolic pressure is higher than unassisted. Error?', ['Early inflation', 'Late inflation', 'Early deflation', 'Late deflation'], 3, 'The balloon is still inflated when ejection starts, raising afterload.'),
    ],
  },
  'lines-cvc': {
    objectives: ['Identify the IJ and carotid on ultrasound.', 'Track the needle tip, not the shaft.', 'Confirm venous placement before dilating.'],
    essentials: ['cvc-1', 'cvc-4', 'cvc-5', 'cvc-7', 'cvc-9'],
    keyPoints: [
      'The IJ is lateral, superficial and compressible; the carotid is medial, deeper, round and pulsatile.',
      'Out of plane, the bright dot may be the shaft while the tip has gone through the back wall.',
      'Walk the tip: slide the probe with the needle so the dot you see is the tip.',
      'Colour of blood is unreliable; confirm with pressure or waveform before dilating.',
      'See the wire inside the vein in two planes before any dilator, and never let go of the wire.',
    ],
    pitfalls: ['Excessive head rotation that rolls the vein over the artery.', 'Dilating before confirming the wire is in the vein.'],
    bedside: 'Before dilating, see the wire in the vein in short axis and long axis.',
    selfCheck: [
      q('Dark, non-pulsatile blood returns from the needle in a hypoxic patient. Is it venous?', ['Yes, certainly', 'Not proven — confirm with pressure transduction or waveform', 'Yes, if it is dark', 'No'], 1, 'Arterial blood can be dark in shock and hypoxaemia.'),
    ],
  },
  'ob-circulation': {
    objectives: ['Describe the term circulation.', 'Relieve aortocaval compression.', 'Recognise compensated postpartum haemorrhage early.'],
    essentials: ['oc-2', 'oc-3', 'oc-5', 'oc-7'],
    keyPoints: [
      'At term, output is about 40 % higher and blood volume about 6.5 L.',
      'Supine, the uterus compresses the IVC: output can fall by a third — displace the uterus left or tilt.',
      'Young pregnant women hold their blood pressure until late; use heart rate and shock index (HR ÷ SBP).',
      'Treat PPH cause and volume together: uterotonics and massage, early TXA, blood, calcium and senior help.',
    ],
    pitfalls: ['Waiting for hypotension before calling PPH serious.'],
    bedside: 'Any collapsed pregnant woman beyond about 20 weeks: displace the uterus with the first compressions.',
    selfCheck: [
      q('Postpartum: HR 120, SBP 100. Shock index?', ['0.8', '1.2', '1.0', '2.0'], 1, '120 ÷ 100 = 1.2 — significant blood loss despite a normal-looking pressure.'),
    ],
  },
  'peds-shock': {
    objectives: ['Recognise compensated shock in a child.', 'Know why hypotension and bradycardia are late signs.', 'Resuscitate with small measured blood boluses.'],
    essentials: ['ps-1', 'ps-3', 'ps-4', 'ps-5', 'ps-6'],
    keyPoints: [
      'A child’s output depends on heart rate; blood volume is about 80 mL/kg.',
      'Compensated shock: tachycardia, pallor, mottling, slow capillary refill — with a normal blood pressure.',
      'Hypotension (below 70 + 2 × age) appears late, at around 40 % loss.',
      'Bradycardia in a shocked child means imminent arrest, not improvement.',
      'Give blood in about 10 mL/kg boluses and reassess after each, while controlling the bleeding.',
    ],
    pitfalls: ['Waiting for hypotension.', 'Reading a falling heart rate as recovery.'],
    bedside: 'In a sick child, trust heart rate, skin and capillary refill over the blood pressure.',
    selfCheck: [
      q('A 4-year-old has SBP 90, HR 160, CRT 4 s, mottled. Status?', ['Normal', 'Compensated shock', 'Decompensated shock', 'Dehydration only'], 1, 'Pressure is normal but perfusion signs show compensated shock.'),
    ],
  },
  'ln-setup': {
    objectives: ['Describe an arterial and central line pressure system.', 'Level to the phlebostatic axis.'],
    essentials: ['ln-setup-1', 'ln-setup-2', 'ln-setup-5'],
    keyPoints: [
      'A saline column carries pressure from the vessel to the transducer.',
      'A 300 mmHg pressure bag flushes about 3 mL/h and keeps the line patent.',
      'The CVC tip belongs at the cavo-atrial junction.',
      'Level the transducer to the phlebostatic axis: 4th intercostal space, mid-axillary line.',
    ],
    pitfalls: ['A soft pressure bag that lets blood back up the line.'],
    bedside: 'Check bag pressure and transducer level at the start of every shift.',
    selfCheck: [
      q('Where is the phlebostatic axis?', ['2nd ICS, mid-clavicular', '4th ICS, mid-axillary', '5th ICS, anterior axillary', 'Sternal angle'], 1, 'Roughly right atrial level.'),
    ],
  },
  'ln-art': {
    objectives: ['Name the parts of the arterial waveform.', 'Explain why MAP is the number to trust.', 'Recognise vasodilation and stiff arteries from the trace.'],
    essentials: ['ln-art-1', 'ln-art-2', 'ln-art-3'],
    keyPoints: [
      'Upstroke = ejection; dicrotic notch = aortic valve closure; diastolic = run-off.',
      'Peripheral systolic is higher and spikier than central, but MAP is nearly the same.',
      'Low SVR drops the notch and the diastolic pressure; norepinephrine lifts them.',
      'Stiff arteries widen pulse pressure with a late systolic shoulder.',
    ],
    bedside: 'Make decisions on MAP from an arterial line, not the radial systolic.',
    selfCheck: [
      q('Which value differs least between radial and central aortic pressure?', ['Systolic', 'Diastolic', 'Mean', 'Pulse pressure'], 2, 'Wave amplification changes systolic and pulse pressure; mean is preserved.'),
    ],
  },
  'ln-cvp': {
    objectives: ['Identify a, c, v waves and x, y descents.', 'Read CVP at end-expiration.', 'Recognise cannon a waves, AF and tricuspid regurgitation.'],
    essentials: ['ln-cvp-1', 'ln-cvp-3', 'ln-cvp-4', 'ln-cvp-5'],
    keyPoints: [
      'a = atrial contraction (after P), c = tricuspid closure (after QRS), v = filling against a closed valve.',
      'Read CVP at end-expiration, at the base of the c wave.',
      'Spontaneous breaths lower CVP; ventilator breaths raise it. End-expiration is the reference either way.',
      'Cannon a waves = AV dissociation; no a wave in AF; giant c-v waves in tricuspid regurgitation.',
    ],
    pitfalls: ['Recording the monitor mean during laboured breathing.'],
    bedside: 'Freeze the trace and read the CVP at end-expiration yourself.',
    selfCheck: [
      q('Giant intermittent a waves with a regular slow pulse suggest…', ['Atrial fibrillation', 'Complete heart block', 'Tricuspid regurgitation', 'Tamponade'], 1, 'Atria contract against a closed tricuspid valve when AV timing is dissociated.'),
    ],
  },
  'ln-level': {
    objectives: ['Distinguish levelling from zeroing.', 'Estimate the error from a mislevelled transducer.'],
    essentials: ['ln-level-2', 'ln-level-3', 'ln-level-5'],
    keyPoints: [
      'Levelling sets the reference height; zeroing sets atmospheric pressure.',
      'Each 10 cm the transducer sits below the axis adds about 7.4 mmHg — a big error for CVP.',
      'Raising the bed head without re-levelling makes every pressure read high.',
      'Zero with the stopcock open to air, not to the patient.',
    ],
    pitfalls: ['Forgetting to re-level after moving the bed.'],
    bedside: 'Re-level after every change in bed height or position.',
    selfCheck: [
      q('Transducer 10 cm below the axis. CVP of 5 reads about…', ['2', '5', '12', '20'], 2, '5 + 7.4 ≈ 12 mmHg.'),
    ],
  },
  'ln-damp': {
    objectives: ['Perform and read a square-wave test.', 'Recognise under- and overdamping and their effect on readings.', 'Clear a line safely.'],
    essentials: ['ln-damp-1', 'ln-damp-2', 'ln-damp-4', 'ln-damp-5'],
    keyPoints: [
      'Optimal damping: 1.5–2 oscillations after a flush.',
      'Underdamped: many oscillations, systolic overestimated.',
      'Overdamped: no bounce, notch lost, systolic underestimated, diastolic overestimated. MAP is most robust.',
      'Aspirate before flushing a sluggish line; flush air out of the side port to waste.',
    ],
    pitfalls: ['Flushing a clot or bubble toward the patient.'],
    bedside: 'Do a square-wave test before acting on an unexpected arterial pressure.',
    selfCheck: [
      q('After a flush the trace returns slowly with no oscillation. Effect on systolic?', ['Overestimated', 'Underestimated', 'Accurate', 'Doubled'], 1, 'Overdamping blunts the peak.'),
    ],
  },
  'ln-heartlung': {
    objectives: ['Use pulse-pressure variation to predict fluid response.', 'Know when PPV is invalid.', 'Recognise pulsus paradoxus in tamponade.'],
    essentials: ['ln-hl-1', 'ln-hl-2', 'ln-hl-3', 'ln-hl-5'],
    keyPoints: [
      'On controlled ventilation, PPV above about 13 % suggests fluid responsiveness.',
      'PPV needs controlled breaths of at least 8 mL/kg, a regular rhythm, no spontaneous effort and a closed chest.',
      'AF and spontaneous breathing make PPV meaningless.',
      'Tamponade: systolic falls more than 10 mmHg on inspiration, high CVP, lost y descent.',
    ],
    pitfalls: ['Giving fluid on a high PPV in a spontaneously breathing patient.'],
    bedside: 'Check the PPV validity conditions before using the number.',
    selfCheck: [
      q('PPV 18 % in a patient in AF. Interpretation?', ['Fluid responsive', 'Not fluid responsive', 'Not interpretable', 'Tamponade'], 2, 'Irregular filling times invalidate PPV.'),
    ],
  },
  'ln-disease': {
    objectives: ['Recognise valve disease, LV failure, ectopy and RV failure on the arterial and CVP traces.'],
    essentials: ['ln-dz-1', 'ln-dz-2', 'ln-dz-3'],
    keyPoints: [
      'Aortic stenosis: slow, late, small upstroke (parvus et tardus), faint notch.',
      'Aortic regurgitation: steep upstroke, wide pulse pressure, very low diastolic, no notch.',
      'Failing LV: sluggish upstroke, narrow pulse pressure, high CVP.',
      'RV failure: high CVP with large a and v waves and a narrow arterial pulse.',
    ],
    bedside: 'Look at the waveform shape before the numbers.',
    selfCheck: [
      q('Wide pulse pressure with a very low diastolic and steep upstroke suggests…', ['Aortic stenosis', 'Aortic regurgitation', 'Tamponade', 'Hypovolaemia'], 1, 'Diastolic run-off back into the LV lowers diastolic pressure.'),
    ],
  },
};
