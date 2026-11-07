/** FP-C II.1–II.3: gas laws; hypoxias; stressors of flight. */
import type { FpcLesson } from '../types';

export const GAS_LAWS: FpcLesson = {
  id: 'fpc-gas-laws', domain: 'flightphys', ref: 'II.1',
  title: 'The gas laws and the atmosphere',
  summary: 'The atmosphere and its pressure with altitude, and the gas laws — Boyle, Dalton, Henry, Charles, Graham and Gay-Lussac — with worked calculations and their clinical consequences in flight.',
  objectives: [
    'Describe atmospheric pressure and its change with altitude.',
    'State each gas law and apply it to a clinical problem.',
    'Calculate the effect of altitude on gas volume and oxygen partial pressure.',
  ],
  sections: [
    {
      id: 'atmos', title: 'The atmosphere', core: true,
      body: [
        'Air is about 21 % oxygen, 78 % nitrogen and 1 % other gases, and these percentages stay constant at the altitudes aircraft fly. What changes is pressure: at sea level, barometric pressure is 760 mmHg (1 atmosphere, 101.3 kPa, 29.92 inHg). It falls roughly by half at 18 000 feet (about 380 mmHg) and to about a quarter at 34 000 feet. Pressure falls fastest near the ground — the greatest proportional change in volume occurs in the first few thousand feet.',
        'Physiological zones: the physiological (efficient) zone from sea level to about 10 000–12 000 feet, where the body compensates in healthy people (but sick patients may not); the physiologically deficient zone from about 12 000 to 50 000 feet, where supplemental oxygen is needed; and the space-equivalent zone above that, where a pressure suit is required.',
        'Temperature falls about 2 °C per 1000 feet (the standard lapse rate) in the troposphere; humidity falls with altitude too, drying the airways and mucous membranes.',
      ],
      table: {
        caption: 'Altitude and pressure (approximate)',
        head: ['Altitude (ft)', 'Pressure (mmHg)', 'PO₂ of air (mmHg)'],
        rows: [['Sea level', '760', '160'], ['5000', '632', '133'], ['8000', '565', '119'], ['10 000', '523', '110'], ['18 000', '380', '80'], ['25 000', '282', '59'], ['34 000', '187', '39']],
      },
    },
    {
      id: 'laws', title: 'The gas laws', core: true,
      body: [
        'Boyle\'s law: at constant temperature, the volume of a gas is inversely proportional to its pressure (P₁V₁ = P₂V₂). As an aircraft climbs, trapped gas expands. At 8000 feet (565 mmHg), a gas volume increases by about a third compared with sea level; at 18 000 feet it doubles. Clinical effects: pneumothorax, ETT and catheter cuffs, air splints, gastric and bowel gas, middle ear and sinuses, IV bags and drip chambers, pneumocephalus and air in the eye after surgery.',
        'Dalton\'s law: the total pressure of a gas mixture equals the sum of the partial pressures of its components. The partial pressure of oxygen is 21 % of barometric pressure: 160 mmHg at sea level, but only about 110 mmHg at 10 000 feet. This is the basis of altitude hypoxia. Henry\'s law: the amount of gas dissolved in a liquid is proportional to the partial pressure of that gas above the liquid — when pressure falls quickly, dissolved nitrogen comes out of solution as bubbles (decompression sickness), like opening a carbonated drink.',
        'Charles\' law: at constant pressure, volume is proportional to absolute temperature — cold air contracts. Gay-Lussac\'s law: at constant volume, pressure is proportional to absolute temperature — oxygen cylinder pressure falls in cold conditions and rises in heat. Graham\'s law: gases diffuse from high to low partial pressure, at rates inversely proportional to the square root of their molecular weight — the basis of gas exchange in the lungs and tissues. Fick\'s law relates diffusion to surface area, thickness and pressure gradient.',
      ],
      example: {
        case: 'An ETT cuff holds 6 mL of air at sea level (760 mmHg). What will its volume be at 8000 feet (565 mmHg) if it is free to expand?',
        steps: ['Boyle: P₁V₁ = P₂V₂.', '760 × 6 = 565 × V₂.', 'V₂ = 4560 ÷ 565 ≈ 8.1 mL — a 35 % increase.', 'In practice the cuff pressure rises sharply; check and release air on ascent, re-check on descent (or fill with saline).'],
      },
    },
    {
      id: 'clinical', title: 'Clinical applications', core: true,
      body: [
        'Pneumothorax: a small pneumothorax at sea level expands at altitude and can become a tension pneumothorax; decompress or drain before flight, or fly at a lower cabin altitude. Chest drains with one-way valves vent the expanding air. Bowel obstruction or ileus: gas expands and causes pain, vomiting and diaphragmatic splinting; place a nasogastric tube on free drainage.',
        'Equipment: ETT and tracheostomy cuffs rise in pressure — check with a manometer and adjust on climb and descent, or fill with saline. Air splints and pneumatic anti-shock garments tighten on ascent and loosen on descent. IV drip rates change as air in the bag and drip chamber expands; use infusion pumps and vented bags. Pressure bags expand. Gas-filled spaces after eye surgery (intraocular gas bubbles) can raise intraocular pressure dangerously — flying is contraindicated until absorbed.',
        'Middle ear and sinuses: gas escapes easily on ascent but must re-enter on descent — a blocked Eustachian tube (colds, sedation, infants) causes ear pain and barotrauma on descent. Encourage swallowing, chewing or yawning; give infants a bottle or dummy during descent; decongestants help.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the small pneumothorax',
      body: ['A 40-year-old with rib fractures has a small (1.5 cm) apical pneumothorax on CT, no drain. SpO₂ 95 % on 2 L. Transfer by unpressurised helicopter at 3000 ft, or by fixed-wing with a cabin altitude of 8000 ft.'],
      example: { case: 'What do the gas laws tell you?', steps: [
        'At 8000 ft the pneumothorax volume increases by about a third (Boyle); at 3000 ft by about 10 %.',
        'Partial pressure of oxygen falls (Dalton) — SpO₂ will drop; increase FiO₂.',
        'Options: place a chest drain before flight; or fly low (helicopter) or request a sea-level cabin in fixed-wing.',
        'Have decompression equipment ready and reassess breathing and pressures during climb.',
      ] },
    },
  ],
  keyPoints: [
    'Pressure halves at about 18 000 ft; oxygen percentage stays 21 %.',
    'Boyle: volume ∝ 1/pressure — trapped gas expands ~30 % at 8000 ft, doubles at 18 000 ft.',
    'Dalton: PO₂ = 21 % × barometric pressure — falls with altitude.',
    'Henry: dissolved gas comes out of solution when pressure falls — decompression sickness.',
    'Charles and Gay-Lussac: temperature effects; Graham and Fick: diffusion.',
  ],
  pearls: ['The biggest proportional volume change is near the ground.', 'Fill ETT cuffs with saline or check pressures on climb and descent.'],
  pitfalls: ['Flying an undrained pneumothorax at high cabin altitude.', 'Forgetting that ear barotrauma happens on descent.'],
  live: [{ id: 'o2path', label: 'The oxygen pathway' }],
  questions: [
    { q: 'Boyle\'s law states:', options: ['Volume is proportional to temperature', 'At constant temperature, volume is inversely proportional to pressure', 'Total pressure = sum of partial pressures', 'Gas dissolves in proportion to pressure'], answer: 1, why: 'P₁V₁ = P₂V₂.' },
    { q: 'Dalton\'s law explains:', options: ['Gas expansion', 'Falling oxygen partial pressure at altitude', 'Decompression sickness', 'Cylinder pressure changes'], answer: 1, why: 'PO₂ = FiO₂ × PB.' },
    { q: 'Henry\'s law explains:', options: ['Ear pain', 'Decompression sickness', 'Hypoxia', 'Temperature changes'], answer: 1, why: 'Dissolved nitrogen forms bubbles.' },
    { q: 'At about 18 000 ft, trapped gas volume:', options: ['Halves', 'Doubles', 'Is unchanged', 'Triples'], answer: 1, why: 'Pressure halves.' },
    { q: 'At 8000 ft, gas volume increases by about:', options: ['5 %', '30–35 %', '100 %', '200 %'], answer: 1, why: '760/565 ≈ 1.35.' },
    { q: 'The percentage of oxygen in air at altitude:', options: ['Falls', 'Stays about 21 %', 'Rises', 'Is zero above 10 000 ft'], answer: 1, why: 'Partial pressure falls, not percentage.' },
    { q: 'PO₂ of air at sea level:', options: ['100 mmHg', '160 mmHg', '760 mmHg', '40 mmHg'], answer: 1, why: '0.21 × 760.' },
    { q: 'Gay-Lussac\'s law explains:', options: ['Gas expansion in a cuff', 'Cylinder pressure falling in the cold', 'Diffusion', 'Hypoxia'], answer: 1, why: 'Constant volume, P ∝ T.' },
    { q: 'Charles\' law relates:', options: ['Pressure and volume', 'Volume and temperature at constant pressure', 'Partial pressures', 'Solubility'], answer: 1, why: 'Definition.' },
    { q: 'Graham\'s law concerns:', options: ['Gas diffusion rates', 'Volume expansion', 'Temperature', 'Solubility'], answer: 0, why: 'Diffusion from high to low partial pressure.' },
    { q: 'Ear barotrauma most often occurs during:', options: ['Ascent', 'Descent', 'Cruise', 'Refuelling'], answer: 1, why: 'Air must re-enter the middle ear.' },
    { q: 'An ETT cuff with 6 mL of air at sea level at 8000 ft would expand to about:', options: ['4 mL', '8 mL', '12 mL', '6 mL'], answer: 1, why: '760 × 6 ÷ 565 ≈ 8.1.' },
    { q: 'Patients with bowel obstruction in flight should have:', options: ['Nothing', 'A nasogastric tube on free drainage', 'A clamped NG tube', 'Oral fluids'], answer: 1, why: 'Vent expanding gas.' },
    { q: 'Flying after eye surgery with an intraocular gas bubble:', options: ['Safe', 'Contraindicated until absorbed', 'Safe below 10 000 ft always', 'Requires sunglasses'], answer: 1, why: 'Raised intraocular pressure.' },
    { q: 'The physiological zone extends to about:', options: ['1000 ft', '10 000–12 000 ft', '25 000 ft', '50 000 ft'], answer: 1, why: 'Healthy people compensate.' },
  ],
  sources: [
    { title: 'FAA Pilot\'s Handbook of Aeronautical Knowledge — Aeromedical factors', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak' },
    { title: 'FAA Civil Aerospace Medical Institute: Aeromedical safety brochures', url: 'https://www.faa.gov/pilots/safety/pilotsafetybrochures' },
  ],
};

export const HYPOXIAS: FpcLesson = {
  id: 'fpc-hypoxias', domain: 'flightphys', ref: 'II.2',
  title: 'The four types of hypoxia',
  summary: 'Hypoxic, hypaemic (anaemic), stagnant and histotoxic hypoxia, their causes in flight and in patients, signs and symptoms, and the alveolar gas equation applied to altitude.',
  objectives: [
    'Classify hypoxia into its four types with examples.',
    'Recognise signs and symptoms of hypoxia in crew and patients.',
    'Use the alveolar gas equation to predict the effect of altitude and oxygen.',
  ],
  sections: [
    {
      id: 'types', title: 'Four types of hypoxia', core: true,
      body: [
        'Hypoxic (hypoxaemic) hypoxia: inadequate oxygen reaches the blood. In flight, the main cause is reduced partial pressure of oxygen at altitude; in patients, also hypoventilation, ventilation–perfusion mismatch (pneumonia, ARDS), shunt and diffusion impairment. It is the type most influenced by altitude and corrected by supplemental oxygen or lower cabin altitude.',
        'Hypaemic (anaemic) hypoxia: the blood cannot carry enough oxygen despite adequate partial pressure — anaemia, haemorrhage, carbon monoxide (binds haemoglobin), methaemoglobinaemia (nitrites, local anaesthetics, dapsone). Pulse oximetry may be falsely reassuring in CO poisoning. Smokers carry some carboxyhaemoglobin, effectively raising their "physiological altitude".',
        'Stagnant (circulatory) hypoxia: blood carries oxygen but does not flow adequately to tissues — shock, heart failure, cardiac arrest, local vasoconstriction (cold), tourniquets, prolonged sitting, and G-forces pooling blood. Histotoxic hypoxia: cells cannot use oxygen despite adequate delivery — cyanide, carbon monoxide (at the mitochondrial level), and alcohol and some drugs that impair cellular metabolism.',
      ],
      table: {
        caption: 'Types of hypoxia',
        head: ['Type', 'Problem', 'Examples'],
        rows: [['Hypoxic', 'Low PaO₂', 'Altitude, hypoventilation, V/Q mismatch, shunt'], ['Hypaemic (anaemic)', 'Low carrying capacity', 'Anaemia, haemorrhage, CO, methaemoglobin'], ['Stagnant', 'Low flow', 'Shock, heart failure, cold, G-forces'], ['Histotoxic', 'Cells cannot use O₂', 'Cyanide, alcohol, some poisons']],
      },
    },
    {
      id: 'signs', title: 'Signs and symptoms', core: true,
      body: [
        'Hypoxia is insidious: the person affected often feels well, even euphoric, while judgement deteriorates. Symptoms vary between individuals but are consistent for each person — which is why altitude chamber training helps crew learn their own "hypoxia signature". Early: air hunger, light-headedness, headache, tingling, visual changes (reduced night vision occurs as low as 5000 feet), euphoria or anxiety, fatigue, and poor judgement and coordination. Late: cyanosis, confusion, loss of consciousness, seizures and death.',
        'Signs in patients: tachypnoea, tachycardia (then bradycardia in severe or paediatric hypoxia), agitation or confusion, cyanosis (unreliable — needs about 5 g/dL of deoxygenated haemoglobin, so anaemic patients may never appear cyanotic), and falling SpO₂. Night vision is the first function to deteriorate, so pilots use supplemental oxygen at lower altitudes at night.',
        'Factors that reduce hypoxia tolerance: altitude, rate of ascent, duration of exposure, physical activity, temperature extremes, fatigue, smoking, alcohol and drugs, anaemia, and lung or heart disease.',
      ],
    },
    {
      id: 'calc', title: 'The alveolar gas equation at altitude', core: true,
      body: [
        'The alveolar gas equation estimates the alveolar oxygen partial pressure: PAO₂ = FiO₂ × (PB − 47) − PaCO₂ ÷ 0.8, where 47 mmHg is the water vapour pressure at body temperature and 0.8 is the respiratory quotient. At sea level on room air: 0.21 × (760 − 47) − 40 ÷ 0.8 = 150 − 50 = 100 mmHg.',
        'At 8000 feet (PB about 565 mmHg) on room air: 0.21 × (565 − 47) − 40 ÷ 0.8 ≈ 109 − 50 ≈ 59 mmHg (healthy people hyperventilate, lowering PaCO₂ and raising PAO₂ to about 65–70). A patient whose PaO₂ is already 60 at sea level will fall to dangerous levels.',
        'To keep the same inspired oxygen partial pressure at altitude, adjust FiO₂: FiO₂ (altitude) = FiO₂ (ground) × PB (ground) ÷ PB (altitude). A patient on 40 % at sea level needs 0.40 × 760 ÷ 565 ≈ 54 % at 8000 feet. For a ventilated patient on 100 % with marginal oxygenation, the only options are more PEEP or a lower cabin altitude.',
      ],
      example: {
        case: 'A patient on FiO₂ 0.50 at sea level is transferred in a cabin at 6000 ft (PB ≈ 609 mmHg). What FiO₂ maintains the same inspired PO₂?',
        steps: ['FiO₂ (alt) = 0.50 × 760 ÷ 609.', '= 380 ÷ 609 ≈ 0.62.', 'Increase FiO₂ to about 62 % and monitor SpO₂.', 'If already on 100 %, request a lower cabin altitude or increase PEEP.'],
      },
    },
    {
      id: 'case', title: 'Transport case: the anaemic patient at altitude',
      body: ['A 70-year-old with a GI bleed (Hb 6.8) and COPD is on 2 L oxygen with SpO₂ 92 % before an unpressurised flight over hills at 6000 ft. He smokes heavily.'],
      example: { case: 'Which hypoxias are in play?', steps: [
        'Hypaemic hypoxia from anaemia (and carboxyhaemoglobin from smoking); SpO₂ may look acceptable while oxygen content is low.',
        'Hypoxic hypoxia from COPD and from altitude (Dalton).',
        'Stagnant hypoxia if he becomes hypovolaemic and shocked.',
        'Transfuse before or during transfer, increase FiO₂ (titrate to 88–92 % in COPD), request lower altitude where possible, monitor closely.',
      ] },
    },
  ],
  keyPoints: [
    'Hypoxic (low PaO₂), hypaemic (low carrying capacity), stagnant (low flow), histotoxic (cells can\'t use O₂).',
    'Hypoxia is insidious — judgement fails first; night vision deteriorates early.',
    'Cyanosis is unreliable, especially in anaemia.',
    'PAO₂ = FiO₂ × (PB − 47) − PaCO₂/0.8.',
    'FiO₂ (alt) = FiO₂ (ground) × PB (ground) ÷ PB (alt).',
  ],
  pearls: ['Learn your own hypoxia signature.', 'CO poisoning: normal SpO₂, hypaemic and histotoxic hypoxia.'],
  pitfalls: ['Trusting SpO₂ in anaemia or CO poisoning.', 'Not increasing FiO₂ before climbing.'],
  live: [{ id: 'o2path', label: 'The oxygen pathway' }],
  questions: [
    { q: 'Hypoxia caused by altitude is:', options: ['Hypaemic', 'Hypoxic', 'Stagnant', 'Histotoxic'], answer: 1, why: 'Altitude lowers the inspired PO₂.' },
    { q: 'Carbon monoxide poisoning causes:', options: ['Stagnant hypoxia only', 'Hypaemic (and histotoxic) hypoxia', 'Hypoxic hypoxia only', 'No hypoxia'], answer: 1, why: 'Binds haemoglobin and cytochromes.' },
    { q: 'Shock causes:', options: ['Hypaemic hypoxia', 'Stagnant hypoxia', 'Histotoxic hypoxia', 'Hypoxic hypoxia'], answer: 1, why: 'Reduced flow.' },
    { q: 'Cyanide causes:', options: ['Hypoxic hypoxia', 'Histotoxic hypoxia', 'Stagnant hypoxia', 'Hypaemic hypoxia'], answer: 1, why: 'Blocks cellular respiration.' },
    { q: 'Anaemia causes:', options: ['Hypaemic hypoxia', 'Histotoxic hypoxia', 'Hypoxic hypoxia', 'None'], answer: 0, why: 'Low carrying capacity.' },
    { q: 'The first function to deteriorate with hypoxia:', options: ['Hearing', 'Night vision', 'Touch', 'Taste'], answer: 1, why: 'Rods are oxygen-sensitive.' },
    { q: 'A feature of hypoxia that makes it dangerous:', options: ['Severe pain', 'Euphoria and impaired judgement', 'Immediate unconsciousness', 'Obvious cyanosis'], answer: 1, why: 'Judgement fails before the person notices.' },
    { q: 'Cyanosis requires about:', options: ['0.5 g/dL deoxyhaemoglobin', '5 g/dL deoxyhaemoglobin', '15 g/dL', 'Any hypoxia'], answer: 1, why: 'Unreliable in anaemia.' },
    { q: 'PAO₂ at sea level on room air (PaCO₂ 40):', options: ['150', '100', '60', '40'], answer: 1, why: '0.21 × 713 − 50.' },
    { q: 'Water vapour pressure used in the alveolar gas equation:', options: ['0', '47 mmHg', '760', '100'], answer: 1, why: 'Water vapour pressure at 37 °C is 47 mmHg.' },
    { q: 'A patient on 40 % at sea level needs at 8000 ft (PB 565):', options: ['30 %', 'About 54 %', '100 %', '40 %'], answer: 1, why: '0.4 × 760 ÷ 565.' },
    { q: 'A ventilated patient on 100 % with marginal oxygenation at altitude:', options: ['Increase FiO₂ further', 'Increase PEEP or request lower cabin altitude', 'Ignore', 'Lower PEEP'], answer: 1, why: 'Only remaining options.' },
    { q: 'Smoking affects hypoxia tolerance by:', options: ['Improving it', 'Raising carboxyhaemoglobin — reduced tolerance', 'No effect', 'Raising PO₂'], answer: 1, why: 'Hypaemic component.' },
    { q: 'Hypoxia symptoms for an individual are:', options: ['Random each time', 'Fairly consistent — a personal signature', 'Always absent', 'Identical for everyone'], answer: 1, why: 'Chamber training.' },
    { q: 'G-forces pooling blood cause:', options: ['Hypaemic hypoxia', 'Stagnant hypoxia', 'Histotoxic hypoxia', 'Hypoxic hypoxia'], answer: 1, why: 'Reduced circulation.' },
  ],
  sources: [
    { title: 'FAA Aeromedical Safety Brochure: Hypoxia', url: 'https://www.faa.gov/pilots/safety/pilotsafetybrochures' },
    { title: 'StatPearls: Hypoxia', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Hypoxia+StatPearls' },
  ],
};

export const FLIGHT_STRESSORS: FpcLesson = {
  id: 'fpc-flight-stressors', domain: 'flightphys', ref: 'II.3',
  title: 'Stressors of flight',
  summary: 'The classic stressors — hypoxia, barometric changes, thermal changes, decreased humidity, noise, vibration, fatigue, gravitational forces, third spacing, spatial disorientation, flicker vertigo and fuel vapours — and their effects on patients and crew.',
  objectives: [
    'List and explain the stressors of flight.',
    'Describe their effects on patients and crew.',
    'Apply mitigations for each stressor in transport.',
  ],
  sections: [
    {
      id: 'list', title: 'The stressors', core: true,
      body: [
        'Hypoxia and barometric pressure changes are covered by the gas laws (Dalton and Boyle). Thermal changes: temperature falls about 2 °C per 1000 feet, cabins can be cold or hot, and patients lose heat during loading and in rotor wash. Hypothermia increases oxygen demand (shivering), worsens coagulation and is dangerous for neonates and trauma patients; hyperthermia increases metabolic demand.',
        'Decreased humidity: air at altitude is dry and medical oxygen is completely dry. Mucous membranes dry out, secretions thicken (blocking tubes), and insensible fluid losses increase. Use humidification (heat and moisture exchangers), suction and adequate fluids, and lubricate the eyes of sedated patients.',
        'Noise: helicopter cabins often exceed 90–100 dB, causing hearing damage, fatigue, communication errors, and making auscultation and alarms useless; protect hearing for crew and patients, use visual monitoring and pre-flight assessment. Vibration (especially in helicopters at certain frequencies) causes fatigue, discomfort, motion artefact on monitors, dislodgement of devices and increased pain from fractures; secure the patient and pad well.',
      ],
    },
    {
      id: 'more', title: 'Fatigue, gravity and the rest', core: true,
      body: [
        'Fatigue is the cumulative effect of all the stressors plus shift work and circadian disruption; it degrades performance and judgement. Gravitational forces: acceleration and deceleration during take-off and landing shift blood and fluids. In fixed-wing aircraft, a patient positioned head-forward experiences blood shifting toward the feet on take-off (reduced cerebral perfusion) and toward the head on landing (raised ICP) — head-aft or careful positioning may be chosen for head injury or cardiac patients, according to programme practice.',
        'Third spacing: low cabin pressure, stress and shock-related capillary leak can promote fluid shifts into tissues, contributing to oedema and intravascular depletion over long flights. Spatial disorientation results from conflicting vestibular, visual and proprioceptive cues — most dangerous for pilots in poor visibility (leading to IIMC accidents) but also causing motion sickness in crew and patients.',
        'Flicker vertigo: light flickering through rotor blades or propellers at about 4–20 Hz can cause nausea, disorientation and, in susceptible people, seizures; shade the patient\'s eyes. Fuel vapours and exhaust fumes cause nausea and headache and are an ignition hazard. Motion sickness affects patients and crew; antiemetics and a stable visual horizon help.',
      ],
      table: {
        caption: 'Stressors of flight and mitigations',
        head: ['Stressor', 'Effect', 'Mitigation'],
        rows: [['Hypoxia', 'Reduced PaO₂', 'Supplemental O₂, lower altitude'], ['Barometric change', 'Gas expansion', 'Vent gas, drains, NG tubes, check cuffs'], ['Thermal', 'Hypo/hyperthermia', 'Warm/cool, cover, monitor temperature'], ['Low humidity', 'Dry airways, thick secretions', 'Humidification, suction, fluids'], ['Noise', 'Hearing loss, missed alarms', 'Hearing protection, visual monitoring'], ['Vibration', 'Fatigue, pain, artefact', 'Padding, secure equipment'], ['Fatigue', 'Poor judgement', 'Rest, scheduling, checklists'], ['Gravitational forces', 'Fluid shifts', 'Positioning'], ['Flicker vertigo', 'Nausea, seizures', 'Shade the eyes'], ['Fuel vapours', 'Nausea, fire risk', 'Ventilation, vigilance']],
      },
    },
    {
      id: 'patient', title: 'Thinking stressor by stressor', core: true,
      body: [
        'Before every transport, run through the stressors for the specific patient: which will matter most? A neonate: thermal stress, noise and vibration. A head-injured patient: hypoxia, gravitational forces, vibration and noise (agitation raises ICP). A burns patient: thermal stress and humidity (fluid losses). A patient with COPD: hypoxia and humidity. A patient with a pneumothorax or bowel obstruction: barometric changes.',
        'Crew are affected too: hypoxia (unpressurised flight at altitude), dehydration, noise-induced hearing loss, back injuries from lifting in confined spaces, fatigue and motion sickness. Personal protective equipment, hydration, rest and ergonomic training reduce the cumulative effect.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the head-injured patient in a fixed-wing',
      body: ['A ventilated patient with a severe TBI and an ICP monitor is transferred by fixed-wing over 2 hours. The cabin is cold, noisy and dry. ICP rises during take-off and again during descent.'],
      example: { case: 'Which stressors and what mitigations?', steps: [
        'Gravitational forces: take-off and landing shift blood; position per programme (often head-forward with 30° elevation) and anticipate changes.',
        'Noise and vibration: deepen sedation and analgesia before take-off and landing; ear protection.',
        'Hypoxia: increase FiO₂ to maintain SpO₂; request a lower cabin altitude if needed.',
        'Thermal and humidity: warm the patient, HME in the circuit, suction secretions; monitor temperature.',
      ] },
    },
  ],
  keyPoints: [
    'Classic stressors: hypoxia, barometric change, thermal, low humidity, noise, vibration, fatigue, gravitational forces.',
    'Others: third spacing, spatial disorientation, flicker vertigo, fuel vapours, motion sickness.',
    'Noise makes auscultation and alarms unreliable — assess before flight and monitor visually.',
    'Low humidity thickens secretions — humidify and suction.',
    'Think stressor-by-stressor for each patient and for the crew.',
  ],
  pearls: ['Shade the eyes against flicker vertigo.', 'Pre-emptive sedation before take-off and landing for TBI.'],
  pitfalls: ['Relying on auscultation in a helicopter.', 'Ignoring crew hydration and hearing protection.'],
  questions: [
    { q: 'Temperature falls about ___ per 1000 ft:', options: ['0.5 °C', '2 °C', '10 °C', '0 °C'], answer: 1, why: 'Standard lapse rate.' },
    { q: 'Decreased humidity in flight causes:', options: ['Thinner secretions', 'Thicker secretions and dry membranes', 'Hypothermia only', 'No effects'], answer: 1, why: 'Dry air and oxygen.' },
    { q: 'Helicopter cabin noise often exceeds:', options: ['50 dB', '90–100 dB', '30 dB', '150 dB'], answer: 1, why: 'Hearing protection needed.' },
    { q: 'Vibration can cause:', options: ['Improved monitoring', 'Fatigue, pain and monitor artefact', 'Hypoxia directly', 'Better sleep'], answer: 1, why: 'Mechanical stress.' },
    { q: 'Flicker vertigo occurs at about:', options: ['0.1 Hz', '4–20 Hz', '1000 Hz', 'Any frequency'], answer: 1, why: 'Rotor or propeller flicker.' },
    { q: 'Flicker vertigo is mitigated by:', options: ['More light', 'Shading the patient\'s eyes', 'Faster flight', 'Turning off monitors'], answer: 1, why: 'Prevent seizures and nausea.' },
    { q: 'Fixed-wing take-off with a head-forward patient shifts blood:', options: ['Toward the head', 'Toward the feet', 'Not at all', 'To the arms'], answer: 1, why: 'Acceleration forces.' },
    { q: 'Auscultation in a helicopter is:', options: ['Reliable', 'Unreliable due to noise', 'Better than on the ground', 'Required for confirmation'], answer: 1, why: 'Use capnography and visual monitoring.' },
    { q: 'A neonate\'s most important flight stressors include:', options: ['Gas expansion only', 'Thermal stress, noise and vibration', 'Fuel vapours only', 'None'], answer: 1, why: 'Vulnerable to cold and stimulation.' },
    { q: 'Fuel vapours can cause:', options: ['Euphoria only', 'Nausea, headache and fire risk', 'Hypothermia', 'Nothing'], answer: 1, why: 'Toxic and flammable.' },
    { q: 'Spatial disorientation results from:', options: ['Hypoxia only', 'Conflicting vestibular, visual and proprioceptive cues', 'Noise', 'Dehydration'], answer: 1, why: 'Sensory conflict.' },
    { q: 'The stressor most relevant to a pneumothorax:', options: ['Noise', 'Barometric pressure change', 'Vibration', 'Humidity'], answer: 1, why: 'Boyle\'s law.' },
    { q: 'Fatigue as a stressor is:', options: ['Irrelevant', 'The cumulative effect of the other stressors plus shift work', 'Only for pilots', 'Treated with caffeine alone'], answer: 1, why: 'Cumulative.' },
    { q: 'Mitigation for low humidity:', options: ['More oxygen', 'Humidification and suction', 'Cooling', 'Less fluid'], answer: 1, why: 'Prevent tube blockage.' },
    { q: 'Third spacing in flight refers to:', options: ['Seat allocation', 'Fluid shifts into tissues', 'Air in the pleura', 'Radio frequencies'], answer: 1, why: 'Capillary leak and pressure.' },
  ],
  sources: [
    { title: 'FAA Pilot\'s Handbook of Aeronautical Knowledge — Aeromedical factors', url: 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak' },
    { title: 'Air & Surface Transport Nurses Association: Transport nurse resources', url: 'https://www.astna.org/' },
  ],
};
