/** FP-C IV.4–IV.6: metabolic and electrolyte emergencies; sepsis; infectious disease and transport precautions. */
import type { FpcLesson } from '../types';

export const METABOLIC: FpcLesson = {
  id: 'fpc-metabolic', domain: 'medical', ref: 'IV.4',
  title: 'Metabolic and electrolyte emergencies',
  summary: 'Sodium, calcium and magnesium disorders, acid–base interpretation, and temperature emergencies: what kills, how fast to correct, and what to watch in flight.',
  objectives: [
    'Correct hyponatraemia and hypernatraemia at safe rates.',
    'Recognise and treat dangerous calcium and magnesium disorders.',
    'Interpret acid–base disorders systematically, including mixed disorders.',
  ],
  sections: [
    {
      id: 'sodium', title: 'Sodium', core: true,
      body: [
        'Plasma sodium sets cell volume, and the brain has no room to swell. Severe symptomatic hyponatraemia — seizures, coma, vomiting with confusion — is treated with hypertonic saline boluses (commonly 3 % saline, 100–150 mL over 10–20 minutes, repeated up to two or three times) aiming to raise sodium by 4–6 mmol/L, which is usually enough to stop symptoms.',
        'Chronic hyponatraemia (present more than 48 hours, or of unknown duration) must not be corrected too fast: limit the rise to about 8–10 mmol/L in 24 hours (lower in high-risk patients such as alcoholics, the malnourished and those with hypokalaemia) to avoid osmotic demyelination, which appears days later with dysarthria, dysphagia and quadriparesis.',
        'Hypernatraemia reflects water deficit — elderly or disabled patients without access to water, diabetes insipidus, osmotic diuresis. Correct gradually with hypotonic fluids, lowering sodium by no more than about 10–12 mmol/L per day in chronic cases, to avoid cerebral oedema.',
      ],
    },
    {
      id: 'calcium', title: 'Calcium and magnesium', core: true,
      body: [
        'Hypocalcaemia causes perioral and digital paraesthesia, tetany, Chvostek and Trousseau signs, seizures, QT prolongation and hypotension. Causes include massive transfusion (citrate binds calcium), pancreatitis, hypoparathyroidism and hypomagnesaemia. Treat symptomatic patients with IV calcium (gluconate peripherally; chloride contains about three times the elemental calcium and is irritating, so is preferred centrally). In major haemorrhage, give calcium early and often.',
        'Hypercalcaemia ("stones, bones, groans and psychiatric overtones") causes dehydration, confusion, short QT and arrhythmias, usually from malignancy or hyperparathyroidism. Treat with isotonic fluids first; bisphosphonates and calcitonin follow in hospital.',
        'Magnesium below normal predisposes to torsades de pointes, refractory hypokalaemia and hypocalcaemia. Magnesium sulfate 2 g IV is given for torsades, severe asthma and eclampsia. Hypermagnesaemia (often iatrogenic in pre-eclampsia treatment or renal failure) causes loss of deep tendon reflexes, then respiratory depression and heart block; calcium is the antidote.',
      ],
    },
    {
      id: 'acidbase', title: 'Acid–base in five steps', core: true,
      body: [
        'One: is the pH acidaemic (< 7.35) or alkalaemic (> 7.45)? Two: which value explains it — PaCO₂ (respiratory) or HCO₃⁻ (metabolic)? Three: is compensation appropriate? For metabolic acidosis, expected PaCO₂ = 1.5 × HCO₃⁻ + 8 (± 2), Winter\'s formula; acute respiratory acidosis raises HCO₃⁻ about 1 per 10 mmHg CO₂, chronic about 4. Four: for metabolic acidosis calculate the anion gap, Na⁺ − (Cl⁻ + HCO₃⁻), normal about 8–12. Five: in a high-gap acidosis, compare the change in gap with the change in bicarbonate to uncover a hidden second metabolic disorder.',
        'High anion-gap causes include lactate, ketones (diabetic, alcoholic, starvation), renal failure, and toxins (methanol, ethylene glycol, salicylates, iron, isoniazid). Normal-gap (hyperchloraemic) acidosis follows diarrhoea, large volumes of saline and renal tubular acidosis.',
      ],
      example: {
        case: 'pH 7.18, PaCO₂ 22, HCO₃⁻ 8, Na⁺ 138, Cl⁻ 100.',
        steps: [
          'Acidaemia; low HCO₃⁻ explains it: metabolic acidosis.',
          'Expected PaCO₂ = 1.5 × 8 + 8 = 20 ± 2; measured 22 — appropriate compensation.',
          'Anion gap = 138 − (100 + 8) = 30: high-gap acidosis.',
          'Change in gap 30 − 12 = 18; change in bicarbonate 24 − 8 = 16 — similar, so no hidden second metabolic process. Look for lactate, ketones, toxins, renal failure.',
        ],
      },
    },
    {
      id: 'temp', title: 'Temperature emergencies',
      body: [
        'Heat stroke is a core temperature above about 40 °C with central nervous system dysfunction. It kills by multi-organ failure; the treatment is rapid cooling — cold-water immersion is fastest for exertional heat stroke, or evaporative cooling with mist and fans plus ice packs. Antipyretics do not work. Stop cooling around 38.5–39 °C to avoid overshoot.',
        'Hypothermia is graded by core temperature (mild 32–35 °C, moderate 28–32 °C, severe below 28 °C) and by clinical signs. Handle severely hypothermic patients gently and horizontally to avoid triggering ventricular fibrillation; the cold heart may resist defibrillation and drugs until rewarmed. Rewarm actively; "not dead until warm and dead" applies, and ECMO centres can rewarm patients in arrest.',
      ],
    },
  ],
  keyPoints: [
    'Symptomatic hyponatraemia: 3 % saline bolus to raise Na⁺ 4–6; chronic correction ≤ 8–10 per 24 h.',
    'Massive transfusion and pancreatitis cause hypocalcaemia — give calcium.',
    'Magnesium 2 g IV for torsades; calcium reverses magnesium toxicity.',
    'Acid–base: pH, primary process, compensation (Winter\'s), anion gap, delta gap.',
    'Heat stroke: cool fast; hypothermia: gentle handling, rewarm, prolonged resuscitation.',
  ],
  pearls: ['Calcium chloride has three times the elemental calcium of gluconate.', 'Loss of reflexes is the first sign of magnesium toxicity.'],
  pitfalls: ['Over-correcting chronic hyponatraemia.', 'Antipyretics for heat stroke.'],
  live: [{ id: 'hypona', label: 'Hyponatraemia and the brain' }, { id: 'abg-resp-vs-metabolic', label: 'Respiratory vs metabolic acidosis' }, { id: 'metab', label: 'Metabolic acidosis and the anion gap' }],
  questions: [
    { q: 'A seizing patient with Na⁺ 112. First treatment:', options: ['Fluid restriction', '3 % saline bolus', 'Normal saline 1 L', 'Desmopressin'], answer: 1, why: 'Raise sodium 4–6 mmol/L quickly.' },
    { q: 'Maximum correction of chronic hyponatraemia in 24 h:', options: ['2', '8–10', '20', '30 mmol/L'], answer: 1, why: 'Avoids osmotic demyelination.' },
    { q: 'Osmotic demyelination typically appears:', options: ['Immediately', 'Days later', 'Never', 'Only in children'], answer: 1, why: 'Delayed onset after overcorrection.' },
    { q: 'Hypocalcaemia during massive transfusion results from:', options: ['Dilution only', 'Citrate binding calcium', 'Hyperkalaemia', 'Hypothermia'], answer: 1, why: 'Citrate anticoagulant chelates calcium.' },
    { q: 'Treatment of torsades de pointes:', options: ['Amiodarone first', 'Magnesium sulfate 2 g IV', 'Adenosine', 'Procainamide'], answer: 1, why: 'Magnesium is first-line.' },
    { q: 'First sign of magnesium toxicity:', options: ['Respiratory arrest', 'Loss of deep tendon reflexes', 'Hypertension', 'Tachycardia'], answer: 1, why: 'Reflexes disappear before respiratory depression.' },
    { q: 'Antidote for magnesium toxicity:', options: ['Naloxone', 'Calcium', 'Glucagon', 'Atropine'], answer: 1, why: 'Calcium antagonises magnesium.' },
    { q: 'Winter\'s formula: HCO₃⁻ 10, expected PaCO₂:', options: ['15', '23 ± 2', '30', '40'], answer: 1, why: '1.5 × 10 + 8 = 23.' },
    { q: 'Anion gap for Na 140, Cl 104, HCO₃ 12:', options: ['12', '24', '28', '36'], answer: 1, why: '140 − 116 = 24.' },
    { q: 'Which causes a normal anion-gap acidosis?', options: ['DKA', 'Methanol', 'Severe diarrhoea', 'Lactic acidosis'], answer: 2, why: 'Bicarbonate loss with chloride retention.' },
    { q: 'Heat stroke is defined by high temperature plus:', options: ['Sweating', 'CNS dysfunction', 'Hypotension only', 'Rash'], answer: 1, why: 'Neurological dysfunction distinguishes it from heat exhaustion.' },
    { q: 'Fastest cooling for exertional heat stroke:', options: ['Antipyretics', 'Cold-water immersion', 'Ice packs to groin only', 'Fan alone'], answer: 1, why: 'Immersion has the highest cooling rate.' },
    { q: 'Severely hypothermic patients should be moved:', options: ['Quickly and upright', 'Gently and horizontally', 'Only after rewarming', 'Prone'], answer: 1, why: 'Rough handling can trigger VF.' },
    { q: 'Shortened QT suggests:', options: ['Hypocalcaemia', 'Hypercalcaemia', 'Hypokalaemia', 'Hypomagnesaemia'], answer: 1, why: 'High calcium shortens the QT.' },
    { q: 'Hypernatraemia most often reflects:', options: ['Sodium excess', 'Free-water deficit', 'Hyperglycaemia', 'Renal failure only'], answer: 1, why: 'Water loss or inadequate intake.' },
  ],
  sources: [
    { title: 'European clinical practice guideline on hyponatraemia (2014)', url: 'https://academic.oup.com/ndt/article/29/suppl_2/i1/1907948' },
    { title: 'StatPearls: Hypocalcemia', url: 'https://www.ncbi.nlm.nih.gov/books/NBK430912/' },
    { title: 'StatPearls: Heat stroke', url: 'https://www.ncbi.nlm.nih.gov/books/NBK537135/' },
  ],
};

export const SEPSIS: FpcLesson = {
  id: 'fpc-sepsis', domain: 'medical', ref: 'IV.5',
  title: 'Sepsis and septic shock',
  summary: 'Definitions, early recognition, the first hour, fluids, vasopressors, steroids, and source control — and what to keep doing during transport.',
  objectives: [
    'Apply Sepsis-3 definitions of sepsis and septic shock.',
    'Deliver the first-hour bundle: lactate, cultures, antibiotics, fluids, vasopressors.',
    'Titrate norepinephrine and adjuncts to perfusion targets in transport.',
  ],
  sections: [
    {
      id: 'define', title: 'Definitions', core: true,
      body: [
        'Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection (Sepsis-3). Organ dysfunction is identified by a rise in the SOFA score of two or more points. qSOFA — respiratory rate ≥ 22, altered mentation, systolic BP ≤ 100 — flags patients at higher risk of death but is not recommended as a single screening tool.',
        'Septic shock is sepsis with persistent hypotension needing vasopressors to keep MAP ≥ 65 mmHg and a serum lactate above 2 mmol/L despite adequate volume resuscitation. Mortality is substantially higher than sepsis alone.',
      ],
    },
    {
      id: 'bundle', title: 'The first hour', core: true,
      body: [
        'Measure lactate (and remeasure if above 2). Take blood cultures before antibiotics when this causes no meaningful delay. Give broad-spectrum antibiotics as soon as possible — within one hour for probable septic shock; delays raise mortality. Give 30 mL/kg of crystalloid for hypotension or lactate ≥ 4, guided by reassessment of perfusion and fluid responsiveness rather than as a fixed target. Start a vasopressor if MAP remains below 65 during or after fluids.',
        'Balanced crystalloids (lactated Ringer\'s or Plasma-Lyte) are suggested over saline for large volumes. Albumin may be considered when large volumes of crystalloid are needed. Starch solutions are avoided.',
      ],
      table: {
        caption: 'Vasopressors in septic shock',
        head: ['Agent', 'Role', 'Notes'],
        rows: [
          ['Norepinephrine', 'First-line', 'α-1 vasoconstriction with some β-1; can run peripherally in a good vein for a short time per protocol'],
          ['Vasopressin', 'Second agent', 'Added (often 0.03 U/min) to reduce norepinephrine dose'],
          ['Epinephrine', 'Add-on', 'Useful with cardiac dysfunction; raises lactate'],
          ['Dobutamine', 'Inotrope', 'For persistent hypoperfusion with poor cardiac function'],
          ['Phenylephrine', 'Limited', 'Pure α; can drop cardiac output'],
        ],
      },
    },
    {
      id: 'targets', title: 'Targets and reassessment', core: true,
      body: [
        'Aim for MAP ≥ 65 mmHg initially, adjusted for chronic hypertension. Track perfusion, not just pressure: mental status, capillary refill, skin mottling, urine output (≥ 0.5 mL/kg/h) and lactate clearance. Capillary refill time is a validated, simple target.',
        'Before giving more fluid, ask whether the patient is fluid-responsive (passive leg raise with a change in stroke volume or pulse pressure, pulse-pressure variation in a ventilated patient) and whether lungs and oxygenation will tolerate it. Over-resuscitation causes pulmonary oedema, abdominal compartment syndrome and worse outcomes.',
        'Hydrocortisone (commonly 200 mg/day) is suggested when vasopressor needs are ongoing. Source control — draining an abscess, removing an infected line, relieving obstructed infected urine — must happen as soon as practical; transport to a centre that can do it is part of treatment.',
      ],
      example: {
        case: 'A 70-year-old with urosepsis: BP 82/44 (MAP 57), HR 118, lactate 5.2, confused, mottled knees. Weight 70 kg. Two litres given at the referring hospital; no antibiotics yet.',
        steps: [
          'Antibiotics now — do not wait for the flight.',
          'He has received about 28 mL/kg; reassess responsiveness before more (passive leg raise, ultrasound, lungs).',
          'Start norepinephrine to MAP ≥ 65; peripheral infusion in a large proximal vein is acceptable short-term per protocol.',
          'Targets in flight: MAP ≥ 65, improving mentation and capillary refill, urine output if catheterised.',
          'Hand over source: likely obstructed infected kidney — needs urgent decompression at the receiving centre.',
        ],
      },
    },
  ],
  keyPoints: [
    'Sepsis = infection + organ dysfunction (SOFA ≥ 2); septic shock = vasopressor for MAP ≥ 65 and lactate > 2 after fluids.',
    'Antibiotics within an hour in septic shock; cultures first only if no delay.',
    '30 mL/kg crystalloid for hypotension or lactate ≥ 4, then reassess responsiveness.',
    'Norepinephrine first, vasopressin second; hydrocortisone if pressors are ongoing.',
    'Target MAP ≥ 65 and perfusion markers; source control is treatment.',
  ],
  pearls: ['Peripheral norepinephrine in a good vein is acceptable short-term.', 'Capillary refill time is a practical resuscitation target.'],
  pitfalls: ['Delaying antibiotics for transport.', 'Fluid "to a number" without reassessing responsiveness.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states at the bedside' }, { id: 'lines-oxygen-delivery', label: 'Oxygen delivery' }, { id: 'moa-norepinephrine', label: 'Norepinephrine: mechanism of action' }],
  questions: [
    { q: 'Septic shock requires vasopressors for MAP ≥ 65 and lactate above:', options: ['1 mmol/L', '2 mmol/L', '4 mmol/L', '8 mmol/L'], answer: 1, why: 'Sepsis-3 definition of septic shock.' },
    { q: 'Initial crystalloid volume for sepsis-induced hypotension:', options: ['10 mL/kg', '30 mL/kg', '60 mL/kg', '100 mL/kg'], answer: 1, why: 'Then guided by reassessment.' },
    { q: 'First-line vasopressor in septic shock:', options: ['Dopamine', 'Norepinephrine', 'Phenylephrine', 'Dobutamine'], answer: 1, why: 'Lower arrhythmia risk than dopamine.' },
    { q: 'Usual second vasopressor added:', options: ['Vasopressin', 'Milrinone', 'Isoproterenol', 'Nitroglycerin'], answer: 0, why: 'Reduces norepinephrine requirement.' },
    { q: 'Antibiotic timing in probable septic shock:', options: ['Within 1 hour', 'Within 6 hours', 'After cultures result', 'At the receiving centre'], answer: 0, why: 'Delays increase mortality.' },
    { q: 'Sepsis-3 defines organ dysfunction as:', options: ['SIRS ≥ 2', 'SOFA rise ≥ 2', 'Lactate > 1', 'Fever'], answer: 1, why: 'SOFA-based definition.' },
    { q: 'qSOFA criteria include all EXCEPT:', options: ['RR ≥ 22', 'Altered mentation', 'SBP ≤ 100', 'Temperature > 38'], answer: 3, why: 'Temperature is not part of qSOFA.' },
    { q: 'Hydrocortisone in septic shock is suggested when:', options: ['On any antibiotic', 'Vasopressor requirement is ongoing', 'Lactate is normal', 'BP normal'], answer: 1, why: 'Speeds shock reversal.' },
    { q: 'Preferred crystalloid for large-volume resuscitation:', options: ['Starch', 'Balanced crystalloid', 'D5W', 'Hypertonic saline'], answer: 1, why: 'Less hyperchloraemic acidosis.' },
    { q: 'A good perfusion marker in the field:', options: ['Temperature', 'Capillary refill time', 'Blood glucose', 'Heart sounds'], answer: 1, why: 'Validated as a resuscitation target.' },
    { q: 'Before more fluid, assess:', options: ['Only BP', 'Fluid responsiveness and tolerance', 'Temperature', 'Glucose'], answer: 1, why: 'Avoid over-resuscitation.' },
    { q: 'Epinephrine as an add-on vasopressor characteristically:', options: ['Lowers lactate', 'Raises lactate', 'Lowers HR', 'Causes bradycardia'], answer: 1, why: 'β-2 stimulated glycolysis.' },
    { q: 'Source control example:', options: ['Antipyretics', 'Draining an abscess', 'Albumin', 'Steroids'], answer: 1, why: 'Removes the infection focus.' },
    { q: 'Phenylephrine in septic shock may:', options: ['Increase cardiac output', 'Reduce cardiac output', 'Lower SVR', 'Cause tachycardia'], answer: 1, why: 'Pure afterload increase with reflex bradycardia.' },
    { q: 'Septic patient on norepinephrine: MAP 58, lactate 7.5. Appropriate resuscitation targets:', options: ['60 and 3.5', '65 and lactate falling toward normal', '55 and 6', '80 and 1'], answer: 1, why: 'MAP ≥ 65 with improving lactate.' },
  ],
  sources: [
    { title: 'Singer M et al. The Third International Consensus Definitions for Sepsis (Sepsis-3). JAMA (2016)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2492881' },
    { title: 'Surviving Sepsis Campaign: international guidelines (2021)', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-guidelines-2021' },
  ],
};

export const INFECTIOUS: FpcLesson = {
  id: 'fpc-infectious', domain: 'medical', ref: 'IV.6',
  title: 'Infectious disease and transport precautions',
  summary: 'Transmission-based precautions in an aircraft, high-consequence infections, meningitis, necrotising soft-tissue infection, and protecting the crew after exposure.',
  objectives: [
    'Choose standard, contact, droplet and airborne precautions and adapt them to a confined cabin.',
    'Recognise time-critical infections: meningitis, necrotising fasciitis, toxic shock.',
    'Manage occupational exposure, including post-exposure prophylaxis.',
  ],
  sections: [
    {
      id: 'precautions', title: 'Precautions in a confined space', core: true,
      body: [
        'Standard precautions apply to every patient: hand hygiene, gloves for body fluids, eye protection when splashes are likely, safe sharps handling. Contact precautions (gown and gloves) add protection against organisms spread by touch, such as MRSA and Clostridioides difficile (soap and water for hands — alcohol does not kill spores). Droplet precautions (surgical mask within close range) cover influenza, pertussis and meningococcus. Airborne precautions (fit-tested N95 or equivalent respirator) cover tuberculosis, measles and varicella, and aerosol-generating procedures in respiratory viral illness.',
        'Aircraft cabins are small and air circulation varies by airframe. Put a mask on the patient when possible, use HEPA filters on ventilator and BVM circuits, minimise aerosol-generating procedures in flight (secure the airway before departure, use closed suction), and clean the aircraft per protocol afterwards. Some programmes decline or modify transport of high-consequence infections without special containment.',
      ],
      table: {
        caption: 'Precautions by organism (examples)',
        head: ['Precaution', 'Examples', 'PPE'],
        rows: [['Contact', 'MRSA, VRE, C. difficile, scabies', 'Gown, gloves'], ['Droplet', 'Influenza, meningococcus, pertussis', 'Surgical mask + eye protection'], ['Airborne', 'TB, measles, varicella, aerosol procedures', 'N95/respirator, eye protection'], ['High-consequence', 'Ebola, other viral haemorrhagic fevers', 'Specialised PPE and protocols']],
      },
    },
    {
      id: 'meningitis', title: 'Meningitis', core: true,
      body: [
        'Bacterial meningitis presents with fever, headache, neck stiffness and altered mental status, though all four are present in a minority. A petechial or purpuric rash suggests meningococcal disease, which can progress to septic shock and purpura fulminans within hours. Infants may show only irritability, poor feeding, a bulging fontanelle or hypothermia.',
        'Give antibiotics without delay — do not wait for lumbar puncture or imaging when transport or testing will delay treatment. Dexamethasone given with or just before the first antibiotic dose reduces neurological sequelae in some forms (notably pneumococcal). Use droplet precautions until 24 hours of effective therapy; close contacts of meningococcal disease, including crew exposed to respiratory secretions without protection (such as during intubation), need prophylaxis.',
      ],
    },
    {
      id: 'soft', title: 'Necrotising infection and toxic shock', core: true,
      body: [
        'Necrotising soft-tissue infection causes pain out of proportion to the findings, rapidly spreading erythema, tense oedema, crepitus, bullae and systemic toxicity. It is a surgical emergency: antibiotics, resuscitation and urgent debridement. Transport to a surgical centre should not wait for imaging.',
        'Toxic shock syndrome (staphylococcal or streptococcal) produces fever, diffuse erythroderma, hypotension and multi-organ involvement; look for retained tampons, wounds or surgical sites. Treat as septic shock, remove the source, and add an antibiotic that suppresses toxin production per protocol.',
      ],
    },
    {
      id: 'exposure', title: 'After an exposure',
      body: [
        'For a needlestick or mucosal splash: wash with soap and water (irrigate mucosa), report immediately, and arrange evaluation of the source and the exposed worker. HIV post-exposure prophylaxis is most effective started within hours, ideally within 2 hours and no later than 72 hours. Hepatitis B vaccination status determines further management; there is no prophylaxis for hepatitis C, but follow-up testing is needed.',
        'Programmes should have a clear post-exposure process available 24 hours a day, including for exposures far from base.',
      ],
    },
    {
      id: 'case', title: 'Transport case: fever and rash in a dormitory',
      body: ['A 19-year-old student: fever, headache, confusion, BP 84/46, a non-blanching purpuric rash spreading on the legs.'],
      example: {
        case: 'What do you do first, and what do you do for the crew?',
        steps: [
          'Suspect meningococcal sepsis: give IV or IO antibiotics (for example ceftriaxone) immediately; dexamethasone per protocol.',
          'Droplet precautions: surgical masks and eye protection; mask the patient if possible.',
          'Resuscitate as septic shock: fluids, then norepinephrine; consider adrenal crisis if refractory.',
          'If intubation is needed, wear a respirator and eye protection; afterwards report the exposure so crew receive prophylaxis if indicated.',
        ],
      },
    },
  ],
  keyPoints: [
    'Contact: gown and gloves (soap and water for C. difficile); droplet: surgical mask; airborne: N95 respirator.',
    'Mask the patient, HEPA filters on circuits, avoid aerosol procedures in flight.',
    'Suspected bacterial meningitis: antibiotics immediately, dexamethasone with the first dose.',
    'Pain out of proportion with spreading erythema: necrotising infection — surgery now.',
    'Exposure: wash, report, and start HIV PEP within hours if indicated.',
  ],
  pearls: ['Alcohol gel does not kill C. difficile spores.', 'Unprotected intubation of meningococcal disease warrants crew prophylaxis.'],
  pitfalls: ['Delaying antibiotics for a lumbar puncture.', 'Open suction and NIV in a closed cabin without filtration.'],
  questions: [
    { q: 'Tuberculosis requires:', options: ['Contact precautions', 'Droplet precautions', 'Airborne precautions with a respirator', 'Standard only'], answer: 2, why: 'Airborne transmission.' },
    { q: 'Hand hygiene after C. difficile:', options: ['Alcohol gel', 'Soap and water', 'Gloves only', 'None'], answer: 1, why: 'Spores resist alcohol.' },
    { q: 'Meningococcal disease requires:', options: ['Airborne', 'Droplet', 'Contact only', 'None'], answer: 1, why: 'Respiratory droplets.' },
    { q: 'Antibiotics in suspected bacterial meningitis should be given:', options: ['After LP', 'Immediately', 'After CT', 'At the receiving hospital'], answer: 1, why: 'Delay worsens outcomes.' },
    { q: 'Dexamethasone in meningitis is given:', options: ['Days later', 'With or just before the first antibiotic', 'Never', 'Only in viral meningitis'], answer: 1, why: 'Reduces neurological sequelae.' },
    { q: 'A hallmark of necrotising fasciitis:', options: ['Painless rash', 'Pain out of proportion to findings', 'Bradycardia', 'Localised mild swelling'], answer: 1, why: 'Early clue before skin changes.' },
    { q: 'Definitive treatment of necrotising fasciitis:', options: ['Oral antibiotics', 'Surgical debridement', 'Steroids', 'Observation'], answer: 1, why: 'Surgical emergency.' },
    { q: 'Ideal window to start HIV PEP:', options: ['Within 2 hours, no later than 72', 'Within 1 week', 'Within 30 days', 'Not needed'], answer: 0, why: 'Earlier is more effective.' },
    { q: 'Measles requires:', options: ['Contact', 'Droplet', 'Airborne', 'Standard'], answer: 2, why: 'Airborne spread.' },
    { q: 'Reduce aerosol spread from a ventilated patient by:', options: ['Open suction', 'HEPA filter on the circuit', 'Removing filters', 'NIV in flight'], answer: 1, why: 'Filtration of exhaled gas.' },
    { q: 'Infant meningitis may present only with:', options: ['Neck stiffness', 'Irritability, poor feeding, bulging fontanelle', 'Kernig sign', 'Photophobia'], answer: 1, why: 'Classic signs are often absent.' },
    { q: 'Toxic shock syndrome rash is classically:', options: ['Vesicular', 'Diffuse erythroderma', 'Petechial only', 'Absent'], answer: 1, why: 'Sunburn-like rash.' },
    { q: 'Hepatitis C post-exposure prophylaxis:', options: ['Immunoglobulin', 'None available — follow-up testing', 'Antiviral for 28 days routinely', 'Vaccine'], answer: 1, why: 'No PEP; monitor.' },
    { q: 'Purpura fulminans is associated with:', options: ['Meningococcal sepsis', 'C. difficile', 'TB', 'Influenza B only'], answer: 0, why: 'DIC with skin necrosis.' },
    { q: 'Droplet precautions for meningococcus can stop after:', options: ['1 hour', '24 hours of effective antibiotics', '7 days', 'Never'], answer: 1, why: 'Standard recommendation.' },
  ],
  sources: [
    { title: 'CDC: Guideline for isolation precautions (2007, updated)', url: 'https://www.cdc.gov/infection-control/hcp/isolation-precautions/index.html' },
    { title: 'IDSA practice guidelines for bacterial meningitis', url: 'https://www.idsociety.org/practice-guideline/bacterial-meningitis/' },
    { title: 'CDC: Occupational HIV post-exposure prophylaxis', url: 'https://www.cdc.gov/hiv/hcp/pep/index.html' },
  ],
};
