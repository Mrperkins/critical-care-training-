/** FP-C VII.7–VII.8: the lethal triad; burn fluid resuscitation. */
import type { FpcLesson } from '../types';

export const LETHAL_TRIAD: FpcLesson = {
  id: 'fpc-lethal-triad', domain: 'trauma', ref: 'VII.7',
  title: 'The lethal triad: hypothermia, acidosis and coagulopathy',
  summary: 'How hypothermia, acidosis and coagulopathy feed each other in bleeding patients, why hypocalcaemia is now called the fourth corner, and how a transport crew breaks the cycle.',
  objectives: [
    'Explain the mechanism by which each corner of the triad worsens the others.',
    'Prevent and treat hypothermia throughout transport.',
    'Apply damage control resuscitation to interrupt the cycle.',
  ],
  sections: [
    {
      id: 'cycle', title: 'A self-reinforcing cycle', core: true,
      body: [
        'Haemorrhage reduces oxygen delivery; cells switch to anaerobic metabolism and produce lactate, causing metabolic acidosis. Acidosis impairs the clotting enzymes — at a pH of 7.2 factor activity falls substantially — and reduces cardiac contractility and response to catecholamines. Poor perfusion and exposure cause hypothermia, which slows the enzymatic clotting cascade and platelet function further. Coagulopathy means more bleeding, which means more shock, more acidosis and more cooling.',
        'Each corner is independently associated with death; together, mortality climbs steeply. Hypothermia below 32 °C in trauma has historically been associated with very high mortality — far worse than the same temperature in accidental (non-trauma) hypothermia, because the cause is ongoing haemorrhage.',
        'Hypocalcaemia is increasingly described as a fourth corner (the "lethal diamond"). Ionised calcium is a cofactor for several clotting factors and for myocardial contraction; it falls with shock and with citrate in transfused blood. Low ionised calcium on arrival predicts mortality and transfusion need.',
      ],
    },
    {
      id: 'warm', title: 'Hypothermia prevention', core: true,
      body: [
        'Heat loss begins at the scene: cold ground, wet clothes, wind and exposure for assessment. Remove wet clothing, cover the patient, including the head, with insulating and reflective layers, use active warming blankets or chemical heat packs (not directly on skin), keep the cabin warm and warm every infused fluid and blood product.',
        'Measure core temperature early and repeatedly — oesophageal, bladder or a reliable tympanic probe. A patient who arrives warmer than they left is a sign of good care. Avoid passive cooling during long ground waits for the aircraft. Rotor wash during loading strips heat rapidly; package the patient before walking to the aircraft.',
        'Mild induced or permissive hypothermia has no role in bleeding trauma patients; the exception is selected post-cardiac-arrest care, which is not haemorrhagic.',
      ],
    },
    {
      id: 'break', title: 'Breaking the cycle', core: true,
      body: [
        'Stop the bleeding: tourniquets, packing, pelvic binders, and rapid transport to surgical or interventional control. Every intervention that does not stop bleeding buys time at best.',
        'Restore perfusion and clotting with blood, not saline: balanced red cells, plasma and platelets (or whole blood), TXA within 3 hours, fibrinogen replacement guided by levels or viscoelastic tests, and calcium. Sodium bicarbonate does not fix the cause of acidosis and is not routine; the acidosis corrects as perfusion returns.',
        'Accept permissive hypotension in penetrating torso trauma without head injury, avoid large crystalloid volumes that dilute clotting factors and cool the patient, and keep the patient warm. Vasopressors are not first-line in haemorrhagic shock; in some systems, small doses support pressure once volume is replaced or in combined TBI.',
      ],
      table: {
        caption: 'The triad (and diamond) at a glance',
        head: ['Corner', 'Threshold', 'Effect', 'Fix'],
        rows: [['Hypothermia', '< 35 °C', 'Slows clotting enzymes and platelets', 'Insulate, active warming, warm products'], ['Acidosis', 'pH < 7.2, BD worse than −6', 'Impairs clotting factors and contractility', 'Restore perfusion with blood'], ['Coagulopathy', 'INR > 1.5, fibrinogen < 1.5–2', 'More bleeding', '1:1:1 / whole blood, fibrinogen, TXA'], ['Hypocalcaemia', 'iCa < 1.1 mmol/L', 'Coagulopathy and poor contractility', 'Calcium chloride or gluconate']],
      },
    },
    {
      id: 'case', title: 'Transport case: the long extrication',
      body: ['A farmer is trapped under a tractor for 90 minutes in rain at 8 °C. On release: BP 80/50, HR 128, temperature 34.0 °C, open femur fracture with ongoing bleeding. Two litres of saline were given by ground crews.'],
      example: { case: 'Interrupt the triad.', steps: [
        'Tourniquet proximal to the open femur wound; traction splint once bleeding is controlled.',
        'Stop crystalloid; give warmed blood products (or whole blood), TXA and calcium.',
        'Remove wet clothing, insulate, active warming; warm the cabin.',
        'Anticipate coagulopathy from dilution and cold; communicate the MTP need to the receiving centre early.',
        'Consider crush physiology (hyperkalaemia) after prolonged entrapment.',
      ] },
    },
  ],
  keyPoints: [
    'Hypothermia, acidosis and coagulopathy each worsen the others.',
    'Hypocalcaemia is the fourth corner — give calcium.',
    'Trauma hypothermia is far deadlier than accidental hypothermia at the same temperature.',
    'Warm every patient and every product from the scene onward.',
    'Break the cycle with haemorrhage control and blood, not saline or bicarbonate.',
  ],
  pearls: ['Package before walking through rotor wash.', 'Acidosis corrects with perfusion.'],
  pitfalls: ['Litres of cold crystalloid.', 'Not measuring temperature until arrival.'],
  live: [{ id: 'lines-haemorrhage-transfusion', label: 'Haemorrhage and transfusion' }, { id: 'labs-coag', label: 'Clotting labs and reversal' }],
  questions: [
    { q: 'The classic lethal triad:', options: ['Hypoxia, hypotension, hypercapnia', 'Hypothermia, acidosis, coagulopathy', 'Fever, tachycardia, leucocytosis', 'Hypoglycaemia, hyponatraemia, hyperkalaemia'], answer: 1, why: 'Self-reinforcing cycle.' },
    { q: 'The proposed fourth corner:', options: ['Hypercalcaemia', 'Hypocalcaemia', 'Hypernatraemia', 'Hyperglycaemia'], answer: 1, why: 'Lethal diamond.' },
    { q: 'Acidosis worsens bleeding by:', options: ['Increasing platelets', 'Impairing clotting enzyme function', 'Increasing fibrinogen', 'Causing vasoconstriction'], answer: 1, why: 'Enzyme activity is pH dependent.' },
    { q: 'Hypothermia impairs coagulation because:', options: ['Clotting is enzymatic and slows with cold', 'Platelets multiply', 'Fibrinogen rises', 'It has no effect'], answer: 0, why: 'Enzyme kinetics.' },
    { q: 'Sodium bicarbonate for trauma acidosis:', options: ['First-line', 'Not routine; restore perfusion', 'Mandatory below pH 7.3', 'Replaces blood'], answer: 1, why: 'Treat the cause.' },
    { q: 'Large crystalloid volumes in haemorrhage:', options: ['Prevent coagulopathy', 'Dilute clotting factors and cool the patient', 'Correct acidosis', 'Are recommended'], answer: 1, why: 'Worsen the triad.' },
    { q: 'Ionised calcium target:', options: ['> 0.5', '> 1.1 mmol/L', '> 3.0', 'Not needed'], answer: 1, why: 'Supports clotting and contractility.' },
    { q: 'Trauma hypothermia compared with accidental hypothermia at the same temperature:', options: ['Less deadly', 'Much more deadly', 'Identical', 'Protective'], answer: 1, why: 'Driven by haemorrhage.' },
    { q: 'Heat packs should be placed:', options: ['Directly on skin', 'Not directly on skin', 'Only on feet', 'Never used'], answer: 1, why: 'Risk of burns.' },
    { q: 'Therapeutic hypothermia in bleeding trauma:', options: ['Recommended', 'No role', 'Standard for all', 'Only in children'], answer: 1, why: 'Worsens coagulopathy.' },
    { q: 'Vasopressors in haemorrhagic shock are:', options: ['First-line', 'Not first-line; blood and haemorrhage control first', 'Contraindicated always', 'Replace transfusion'], answer: 1, why: 'Volume first.' },
    { q: 'A temperature threshold for hypothermia worsening coagulopathy:', options: ['< 37.5 °C', '< 35 °C', '< 25 °C', '< 39 °C'], answer: 1, why: 'Common threshold.' },
    { q: 'Damage control surgery exists because:', options: ['Surgeons prefer short cases', 'Long operations allow the triad to kill', 'It is cheaper', 'Imaging is unavailable'], answer: 1, why: 'Correct physiology first.' },
    { q: 'Rotor wash during loading:', options: ['Warms the patient', 'Strips heat rapidly', 'Has no effect', 'Reduces bleeding'], answer: 1, why: 'Package first.' },
    { q: 'pH at which clotting factor activity falls substantially:', options: ['7.45', '7.2', '7.6', '7.35'], answer: 1, why: 'Acidosis threshold.' },
  ],
  sources: [
    { title: 'StatPearls: Trauma lethal triad', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Trauma+lethal+triad+StatPearls' },
    { title: 'Ditzel RM et al. A review of transfusion- and trauma-induced hypocalcemia. J Trauma Acute Care Surg (2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Ditzel+transfusion+trauma-induced+hypocalcemia+2020' },
  ],
};

export const BURN_FLUIDS: FpcLesson = {
  id: 'fpc-burn-fluids', domain: 'trauma', ref: 'VII.8',
  title: 'Burn fluid resuscitation',
  summary: 'Estimating total body surface area, the Parkland and modified Brooke formulas, titrating to urine output, fluid creep, and transport timing in the burned patient.',
  objectives: [
    'Estimate %TBSA using the rule of nines, Lund–Browder and the palm method.',
    'Calculate burn fluid requirements and the first-8-hour rate.',
    'Titrate fluids to urine output and avoid over-resuscitation.',
  ],
  sections: [
    {
      id: 'tbsa', title: 'Estimating burn size', core: true,
      body: [
        'Only partial-thickness (second-degree) and full-thickness (third-degree) burns count toward total body surface area (TBSA); superficial (first-degree) erythema does not. The adult rule of nines assigns 9 % to the head, 9 % to each arm, 18 % to the front of the trunk, 18 % to the back, 18 % to each leg and 1 % to the perineum.',
        'Children have proportionally larger heads and smaller legs: in infants the head is about 18 % and each leg about 14 %. The Lund–Browder chart adjusts for age and is the most accurate method. For scattered burns, the patient\'s palm including the fingers is about 1 % TBSA.',
        'Referring hospitals frequently overestimate TBSA — often by including superficial erythema — which leads to over-resuscitation. Recalculate yourself before setting the fluid rate.',
      ],
      table: {
        caption: 'Rule of nines',
        head: ['Region', 'Adult', 'Infant'],
        rows: [['Head and neck', '9 %', '18 %'], ['Each arm', '9 %', '9 %'], ['Anterior trunk', '18 %', '18 %'], ['Posterior trunk', '18 %', '18 %'], ['Each leg', '18 %', '14 %'], ['Perineum', '1 %', '—']],
      },
    },
    {
      id: 'formulas', title: 'Fluid formulas', core: true,
      body: [
        'Burns of about 20 % TBSA or more in adults (10–15 % in children) cause a systemic capillary leak and need formal resuscitation. The Parkland formula estimates 4 mL × weight (kg) × %TBSA of lactated Ringer\'s over the first 24 hours from the time of injury, half in the first 8 hours and half in the next 16. Current ABA guidance starts lower — 2 mL/kg/%TBSA in adults (the modified Brooke), 3 mL in children and 4 mL for electrical injuries — and titrates.',
        'The clock starts at the time of the burn, not at arrival. If fluid was delayed, the first-half volume is given over the remaining hours of the first 8. Children under about 30 kg also need maintenance fluid containing dextrose, as their glycogen stores are small.',
        'A worked example: an 80 kg adult with 40 % TBSA burns at 2 mL/kg/%. Total = 2 × 80 × 40 = 6400 mL in 24 hours. Half (3200 mL) in the first 8 hours = 400 mL/hour. If 2 hours have passed with only 500 mL given, the remaining 2700 mL goes over 6 hours = 450 mL/hour, then adjust to urine output.',
      ],
      example: {
        case: 'A 70 kg adult, 50 % TBSA flame burns, injured 1 hour ago, no fluid yet. Using the Parkland 4 mL formula, what is the first-8-hour rate?',
        steps: ['Total = 4 × 70 × 50 = 14 000 mL.', 'First half = 7000 mL, due by hour 8 from injury.', '7 hours remain, so 7000 ÷ 7 = 1000 mL/hour.', 'Then titrate to urine output — formulas are a starting point, not a prescription.'],
      },
    },
    {
      id: 'titrate', title: 'Titrating and avoiding fluid creep', core: true,
      body: [
        'Urine output is the main endpoint: 0.5 mL/kg/hour in adults (about 30–50 mL/hour), 1 mL/kg/hour in children under 30 kg, and 1–1.5 mL/kg/hour (or until the urine clears) in electrical injury with myoglobinuria. Place a urinary catheter for any major burn. Adjust the rate by about 20–30 % each hour toward the target rather than giving boluses.',
        '"Fluid creep" — receiving far more than the formula predicts — is common and harmful: abdominal compartment syndrome, extremity compartment syndromes, worsened airway oedema, pulmonary oedema and conversion of burn depth. Albumin (colloid rescue) after 8–12 hours and careful titration reduce volume in patients trending toward over-resuscitation.',
        'Transport considerations: secure two large-bore IVs (through burned skin if necessary, or IO), start the pump at the calculated rate, cover burns with clean dry dressings (not wet — hypothermia), keep the cabin warm and record the time of injury and total volumes given.',
      ],
    },
  ],
  keyPoints: [
    'Count only partial- and full-thickness burns in TBSA.',
    'Adult rule of nines; infant head 18 %, leg 14 %; palm ≈ 1 %.',
    'Start at 2 mL/kg/%TBSA (adults), 3 mL (children), 4 mL (electrical); half in the first 8 h from injury.',
    'Titrate to urine output 0.5 mL/kg/h adults, 1 mL/kg/h children.',
    'Avoid fluid creep; children need maintenance dextrose.',
  ],
  pearls: ['The clock starts at the time of the burn.', 'Recalculate the referring hospital\'s TBSA.'],
  pitfalls: ['Counting superficial erythema.', 'Boluses instead of hourly rate changes.'],
  questions: [
    { q: 'Which burns count toward TBSA for fluid calculation?', options: ['Superficial only', 'Partial- and full-thickness', 'All erythema', 'Full-thickness only'], answer: 1, why: 'Superficial burns are excluded.' },
    { q: 'Adult rule of nines: one entire leg is:', options: ['9 %', '18 %', '14 %', '27 %'], answer: 1, why: 'Front and back of leg.' },
    { q: 'Infant head percentage:', options: ['9 %', '18 %', '4.5 %', '27 %'], answer: 1, why: 'Proportionally larger head.' },
    { q: 'The palm including fingers approximates:', options: ['5 %', '1 %', '10 %', '0.1 %'], answer: 1, why: 'Scattered burns.' },
    { q: 'Parkland formula:', options: ['2 mL × kg × %TBSA over 8 h', '4 mL × kg × %TBSA over 24 h, half in the first 8 h', '10 mL/kg bolus', '1 mL × kg × %TBSA'], answer: 1, why: 'Classic formula.' },
    { q: 'The first 8 hours are counted from:', options: ['Hospital arrival', 'Time of injury', 'Start of IV', 'Intubation'], answer: 1, why: 'Leak begins at injury.' },
    { q: 'An 80 kg adult, 30 % TBSA, 2 mL formula. 24-hour total?', options: ['2400 mL', '4800 mL', '9600 mL', '1200 mL'], answer: 1, why: '2 × 80 × 30 = 4800 mL.' },
    { q: 'Urine output target in adult burns:', options: ['0.1 mL/kg/h', '0.5 mL/kg/h', '3 mL/kg/h', '5 mL/kg/h'], answer: 1, why: 'About 30–50 mL/h.' },
    { q: 'Urine output target in children < 30 kg:', options: ['0.5 mL/kg/h', '1 mL/kg/h', '2.5 mL/kg/h', '0.2 mL/kg/h'], answer: 1, why: 'Higher target for children.' },
    { q: 'Electrical burns with myoglobinuria start at:', options: ['2 mL/kg/%TBSA', '4 mL/kg/%TBSA, urine 1–1.5 mL/kg/h', '1 mL/kg/%TBSA', 'No fluid'], answer: 1, why: 'Protect kidneys.' },
    { q: 'Fluid creep can cause:', options: ['Abdominal compartment syndrome', 'Improved outcomes', 'Hypernatraemia only', 'Bradycardia'], answer: 0, why: 'Over-resuscitation harms.' },
    { q: 'Small children on burn resuscitation also need:', options: ['Maintenance fluid with dextrose', 'Hypertonic saline', 'No extra fluid', 'Bicarbonate'], answer: 0, why: 'Limited glycogen stores.' },
    { q: 'Rate adjustments are typically:', options: ['Large boluses', 'Hourly changes of about 20–30 % toward target', 'Fixed for 24 h', 'Stopped at 8 h'], answer: 1, why: 'Titrate toward the urine output target.' },
    { q: 'Burns in transport are best covered with:', options: ['Wet saline dressings', 'Clean dry dressings', 'Ice', 'Ointment only'], answer: 1, why: 'Avoid hypothermia.' },
    { q: 'Preferred resuscitation fluid for burns:', options: ['D5W', 'Lactated Ringer\'s', 'Hypertonic saline', '0.45 % saline'], answer: 1, why: 'Balanced crystalloid.' },
  ],
  sources: [
    { title: 'American Burn Association: Guidelines for burn patient referral and Advanced Burn Life Support', url: 'https://ameriburn.org/resources/burnreferral/' },
    { title: 'StatPearls: Burn resuscitation and early management', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Burn+resuscitation+and+early+management+StatPearls' },
  ],
};
