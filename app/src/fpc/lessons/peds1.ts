/** FP-C IX.1–IX.3: paediatric diagnostics; lab values; pharmacologic agents. */
import type { FpcLesson } from '../types';

export const PEDS_DX: FpcLesson = {
  id: 'fpc-peds-dx', domain: 'peds', ref: 'IX.1',
  title: 'Paediatric assessment and diagnostics',
  summary: 'The Paediatric Assessment Triangle, age-based vital signs, recognising compensated and decompensated shock and respiratory failure, and how chest films, ultrasound and blood gases differ in children.',
  objectives: [
    'Use the Paediatric Assessment Triangle to form a rapid general impression.',
    'Interpret vital signs and physical findings against age-appropriate norms.',
    'Recognise paediatric-specific imaging findings and their transport implications.',
  ],
  sections: [
    {
      id: 'pat', title: 'The Paediatric Assessment Triangle', core: true,
      body: [
        'The Paediatric Assessment Triangle (PAT) is a 30-second, hands-off look from the doorway at three components: appearance (tone, interactiveness, consolability, look or gaze, speech or cry — "TICLS"), work of breathing (abnormal sounds, retractions, nasal flaring, head bobbing, positioning such as tripoding or sniffing), and circulation to the skin (pallor, mottling, cyanosis). Appearance reflects brain perfusion and oxygenation and is the most important single element.',
        'The pattern of abnormal components suggests the physiological problem: abnormal work of breathing alone suggests respiratory distress; abnormal work of breathing plus abnormal appearance suggests respiratory failure; abnormal circulation alone suggests compensated shock; abnormal circulation plus appearance suggests decompensated shock; abnormal appearance alone suggests a primary brain problem, metabolic or toxic cause. All three abnormal suggests cardiopulmonary failure.',
        'After the PAT, perform the primary assessment (ABCDE with hands-on vital signs), then secondary assessment and history (SAMPLE), including birth history and immunisations for young children.',
      ],
      table: {
        caption: 'Approximate normal vital signs (awake)',
        head: ['Age', 'HR (/min)', 'RR (/min)', 'SBP lower limit (mmHg)'],
        rows: [['Newborn', '100–180', '30–60', '60'], ['Infant (1–12 mo)', '100–160', '30–53', '70'], ['Toddler (1–2 y)', '98–140', '22–37', '70 + 2 × age'], ['Preschool (3–5 y)', '80–120', '20–28', '70 + 2 × age'], ['School (6–11 y)', '75–118', '18–25', '70 + 2 × age'], ['Adolescent', '60–100', '12–20', '90']],
      },
    },
    {
      id: 'shock', title: 'Shock and respiratory failure in children', core: true,
      body: [
        'Children compensate for shock by increasing heart rate and systemic vascular resistance; blood pressure is maintained until about 25–30 % of circulating volume is lost, and hypotension is a late, pre-arrest sign. Early signs: tachycardia, prolonged capillary refill (more than 2 seconds), cool extremities, weak peripheral pulses compared with central pulses, decreased urine output and altered mental status. The hypotension threshold for ages 1–10 years is a systolic below 70 + (2 × age in years).',
        'Respiratory failure in children often follows a period of distress with increasing work of breathing; fatigue leads to a falling respiratory rate, decreasing effort, altered consciousness and bradycardia — ominous signs that precede arrest. In infants, bradycardia is usually a response to hypoxia. Treat hypoxia first.',
        'Weight estimation: use a length-based tape (such as the Broselow) or parent-reported weight; formulas (for example (age + 4) × 2 kg for ages 1–10) are less accurate. Accurate weight is the foundation of drug and fluid dosing.',
      ],
    },
    {
      id: 'imaging', title: 'Imaging and point-of-care tests', core: true,
      body: [
        'Children\'s chest films look different: the thymus can widen the upper mediastinum in infants (the "sail sign"), the heart appears relatively large, and films are often taken supine and rotated. Look for hyperinflation and peribronchial thickening (bronchiolitis, asthma), focal consolidation (pneumonia), pneumothorax, foreign body (asymmetric inflation — the obstructed side may be hyperinflated on expiratory films), and ETT position (the tip should sit midway between the thoracic inlet and the carina, about T2–T3).',
        'Ultrasound avoids radiation and is useful for FAST in trauma (though less sensitive in children because solid organ injuries often occur without free fluid), lung ultrasound, cardiac function and effusion, and vascular access. Neck soft tissue films show the "steeple sign" in croup and the "thumb sign" in epiglottitis, but a child with suspected epiglottitis should not be sent for X-ray — secure the airway in a controlled setting.',
        'Capillary blood gases are commonly used in children and reflect pH and PCO₂ reasonably well if perfusion is good; they do not reflect oxygenation. Glucose must be checked in every sick child: infants have small glycogen stores and become hypoglycaemic quickly when ill.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the quiet infant',
      body: ['A 4-month-old with 2 days of vomiting and diarrhoea is "sleepy". From the doorway: limp, not tracking faces, mottled skin, breathing fast but without retractions. HR 196, capillary refill 4 seconds, BP 74/40, glucose 2.4 mmol/L.'],
      example: { case: 'Interpret and act.', steps: [
        'PAT: abnormal appearance + abnormal circulation, normal work of breathing → decompensated (or nearly) shock from dehydration.',
        'BP is still in the normal range for age — do not be reassured; tachycardia, refill and mental status show shock.',
        'IV or IO access; 10–20 mL/kg isotonic crystalloid bolus, reassess after each.',
        'Treat hypoglycaemia: 10 % dextrose 2–5 mL/kg.',
        'Reassess the PAT and vital signs after each intervention; check electrolytes.',
      ] },
    },
  ],
  keyPoints: [
    'PAT: appearance, work of breathing, circulation — appearance matters most.',
    'Hypotension is late; tachycardia, refill and mental status show early shock.',
    'Hypotension (1–10 y): SBP < 70 + 2 × age.',
    'Falling respiratory rate and bradycardia in a distressed child signal impending arrest.',
    'Use a length-based tape for weight; check glucose in every sick child.',
  ],
  pearls: ['Infant bradycardia usually means hypoxia.', 'Don\'t X-ray suspected epiglottitis — secure the airway.'],
  pitfalls: ['Reassurance from a normal blood pressure.', 'Mistaking the thymus for mediastinal widening.'],
  live: [{ id: 'peds-shock', label: 'Paediatric shock on the live model' }],
  questions: [
    { q: 'The three components of the Paediatric Assessment Triangle:', options: ['HR, BP, RR', 'Appearance, work of breathing, circulation to skin', 'Airway, breathing, circulation', 'Pulse, pupils, posture'], answer: 1, why: 'Hands-off assessment.' },
    { q: 'The most important PAT component:', options: ['Work of breathing', 'Appearance', 'Circulation', 'Blood pressure'], answer: 1, why: 'Reflects brain perfusion and oxygenation.' },
    { q: 'Abnormal work of breathing and abnormal appearance suggest:', options: ['Respiratory distress', 'Respiratory failure', 'Compensated shock', 'Normal'], answer: 1, why: 'Fatigue and hypoxia.' },
    { q: 'Abnormal circulation alone suggests:', options: ['Brain injury', 'Compensated shock', 'Respiratory failure', 'Cardiopulmonary failure'], answer: 1, why: 'Appearance still normal.' },
    { q: 'Hypotension threshold for a 4-year-old:', options: ['SBP < 60', 'SBP < 78', 'SBP < 90', 'SBP < 100'], answer: 1, why: '70 + 2 × 4 = 78.' },
    { q: 'In children, hypotension is:', options: ['An early sign of shock', 'A late, pre-arrest sign', 'Normal', 'Unrelated to volume'], answer: 1, why: 'Compensation maintains BP.' },
    { q: 'Normal capillary refill in children:', options: ['< 2 seconds', '< 5 seconds', '< 10 seconds', 'Any'], answer: 0, why: 'Prolonged suggests shock.' },
    { q: 'Bradycardia in a distressed infant usually means:', options: ['Calm', 'Hypoxia — impending arrest', 'Fever', 'Normal sleep'], answer: 1, why: 'Treat oxygenation first.' },
    { q: 'The most accurate prehospital weight estimate:', options: ['Guessing', 'Length-based tape or known weight', 'Age formula only', 'Head circumference'], answer: 1, why: 'Drug dosing foundation.' },
    { q: 'The "sail sign" on an infant chest film represents:', options: ['Pneumothorax', 'Normal thymus', 'Mediastinal haematoma', 'Pneumonia'], answer: 1, why: 'Normal finding.' },
    { q: 'The "steeple sign" suggests:', options: ['Epiglottitis', 'Croup', 'Foreign body', 'Asthma'], answer: 1, why: 'Subglottic narrowing.' },
    { q: 'A child with suspected epiglottitis should:', options: ['Go to X-ray', 'Have the airway secured in a controlled setting', 'Lie flat', 'Have a throat exam with a tongue depressor'], answer: 1, why: 'Avoid precipitating obstruction.' },
    { q: 'Paediatric ETT tip should be at about:', options: ['C5', 'T2–T3 (mid-trachea)', 'Carina', 'T8'], answer: 1, why: 'Midway between inlet and carina.' },
    { q: 'A capillary blood gas reflects:', options: ['Oxygenation accurately', 'pH and PCO₂ reasonably, not oxygenation', 'Nothing useful', 'Lactate only'], answer: 1, why: 'Arterialised sample limits.' },
    { q: 'Glucose in a sick infant:', options: ['Rarely needed', 'Should always be checked', 'Only if diabetic', 'Only after fluids'], answer: 1, why: 'Small glycogen stores.' },
  ],
  sources: [
    { title: 'Dieckmann RA et al. The Pediatric Assessment Triangle. Pediatr Emerg Care (2010)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Dieckmann+pediatric+assessment+triangle+2010' },
    { title: 'AHA Pediatric Advanced Life Support guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-and-advanced-life-support' },
    { title: 'Fleming S et al. Normal ranges of heart rate and respiratory rate in children. Lancet (2011)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Fleming+normal+ranges+heart+rate+respiratory+rate+children+Lancet+2011' },
  ],
};

export const PEDS_LABS: FpcLesson = {
  id: 'fpc-peds-labs', domain: 'peds', ref: 'IX.2',
  title: 'Paediatric lab values',
  summary: 'How children\'s lab values differ from adults: haemoglobin by age, glucose thresholds, electrolytes, blood gases, inflammatory markers and the newborn bilirubin — and the labs that change transport care.',
  objectives: [
    'Interpret paediatric lab values against age-specific norms.',
    'Recognise and treat hypoglycaemia and electrolyte emergencies in children.',
    'Use blood gases and inflammatory markers in the sick child.',
  ],
  sections: [
    {
      id: 'heme', title: 'Haematology by age', core: true,
      body: [
        'Haemoglobin is high at birth (about 14–20 g/dL) because of fetal haemoglobin, falls to a physiological nadir of about 9–11 g/dL at 2–3 months as fetal cells are replaced, then rises gradually to adult values by adolescence. A haemoglobin of 10 g/dL may be normal at 2 months but abnormal at 2 years.',
        'White cell counts are higher in infants and young children, with a lymphocyte predominance from about 1 month to 4–6 years. Neutropenia (an absolute neutrophil count below 1.0 × 10⁹/L, severe below 0.5) in a febrile child — often during chemotherapy — is an emergency requiring antibiotics within an hour. Platelet counts are similar to adults.',
        'Coagulation tests are mildly prolonged in neonates because of immature liver synthesis; vitamin K is given at birth to prevent haemorrhagic disease of the newborn.',
      ],
    },
    {
      id: 'chem', title: 'Glucose and electrolytes', core: true,
      body: [
        'Hypoglycaemia: in children, a glucose below about 3.0–3.3 mmol/L (54–60 mg/dL) is treated; in neonates, thresholds vary by age in hours, but levels below about 2.6 mmol/L (47 mg/dL) are commonly treated. Treat with 10 % dextrose 2–5 mL/kg IV or IO (0.2–0.5 g/kg). Avoid concentrated dextrose (25–50 %) in small children and neonates because of vein damage and rebound. In neonates, 10 % dextrose 2 mL/kg followed by an infusion is typical. Look for causes: sepsis, inborn errors of metabolism, adrenal insufficiency, toxins (alcohol, beta-blockers, sulfonylureas), and hyperinsulinism.',
        'Sodium: hyponatraemia in children can be caused by hypotonic fluids, gastroenteritis, SIADH (meningitis, pneumonia, bronchiolitis) and water intoxication (dilute formula). Seizures from acute hyponatraemia need 3 % saline 2–5 mL/kg (up to 100–150 mL). Hypernatraemic dehydration (often from inadequate feeding in breastfed infants or excessive losses) must be corrected slowly — no faster than about 0.5 mmol/L per hour (10–12 mmol/L per day) — to avoid cerebral oedema.',
        'Potassium: haemolysed capillary samples often give falsely high potassium; repeat on a free-flowing sample before treating if the ECG is normal. Hyperkalaemia occurs with renal failure, congenital adrenal hyperplasia (with hyponatraemia and hypoglycaemia in a newborn) and tumour lysis syndrome.',
      ],
      table: {
        caption: 'Key paediatric thresholds',
        head: ['Test', 'Concerning value', 'Action'],
        rows: [['Glucose (child)', '< 3.0–3.3 mmol/L', '10 % dextrose 2–5 mL/kg'], ['Glucose (neonate)', '< 2.6 mmol/L', '10 % dextrose 2 mL/kg + infusion'], ['Sodium (seizing)', 'Low (often < 125)', '3 % saline 2–5 mL/kg'], ['ANC with fever', '< 0.5 × 10⁹/L', 'Antibiotics within 1 hour'], ['Lactate', '> 2 (> 4 severe)', 'Sepsis/shock workup'], ['Bilirubin (newborn)', 'Above age-specific threshold', 'Phototherapy or exchange']],
      },
    },
    {
      id: 'gas', title: 'Blood gases, inflammation and bilirubin', core: true,
      body: [
        'Blood gas norms are similar to adults beyond the neonatal period. Children with chronic lung disease (bronchopulmonary dysplasia) may have chronically raised PCO₂ with metabolic compensation; know their baseline. A normal or rising PCO₂ in a child with asthma who is breathing fast is a warning sign of fatigue.',
        'Inflammatory markers (CRP, procalcitonin) help risk-stratify febrile infants: elevated procalcitonin raises the likelihood of serious bacterial infection. Febrile infants under 28 days need full sepsis evaluation and antibiotics regardless of appearance. Lactate above 2 mmol/L supports sepsis or hypoperfusion.',
        'Neonatal jaundice: unconjugated (indirect) bilirubin rises in the first days of life; levels above age-in-hours thresholds need phototherapy, and very high levels risk kernicterus (bilirubin encephalopathy). Jaundice in the first 24 hours is always pathological (haemolysis), and conjugated hyperbilirubinaemia (pale stools, dark urine) suggests biliary atresia or liver disease.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the vomiting newborn',
      body: ['A 10-day-old boy is lethargic and vomiting, with poor feeding. Glucose 2.0 mmol/L, sodium 124, potassium 7.1, HR 190, capillary refill 4 seconds. The genitalia appear normal.'],
      example: { case: 'Interpret and treat.', steps: [
        'Hypoglycaemia, hyponatraemia, hyperkalaemia and shock in a 1–2-week-old: suspect adrenal crisis from congenital adrenal hyperplasia (salt-wasting) — males may have normal-appearing genitalia.',
        'Fluid bolus 10–20 mL/kg isotonic crystalloid; 10 % dextrose 2 mL/kg then infusion.',
        'Hydrocortisone IV (stress dose — commonly about 50–100 mg/m², or 25 mg for an infant) after drawing a sample for 17-hydroxyprogesterone if possible.',
        'Monitor ECG for hyperkalaemia; treat if changes are present.',
        'Also consider sepsis and inborn errors of metabolism; give antibiotics.',
      ] },
    },
  ],
  keyPoints: [
    'Haemoglobin nadir about 9–11 g/dL at 2–3 months is physiological.',
    'Febrile neutropenia (ANC < 0.5) → antibiotics within 1 hour.',
    'Hypoglycaemia: 10 % dextrose 2–5 mL/kg; avoid concentrated dextrose in small children.',
    'Correct hypernatraemia slowly; seizing hyponatraemia → 3 % saline 2–5 mL/kg.',
    'Haemolysed capillary samples raise potassium falsely; jaundice in the first 24 h is pathological.',
  ],
  pearls: ['Newborn with low Na, high K, low glucose and shock = think CAH.', 'Febrile infants < 28 days get full workup and antibiotics.'],
  pitfalls: ['Treating a haemolysed potassium.', 'Rapid correction of hypernatraemia.'],
  questions: [
    { q: 'The physiological haemoglobin nadir occurs at about:', options: ['Birth', '2–3 months', '5 years', 'Adolescence'], answer: 1, why: 'Fetal cells replaced.' },
    { q: 'Febrile neutropenia is defined by an ANC below about:', options: ['5.0', '0.5 × 10⁹/L', '10', '2.0 only'], answer: 1, why: 'Severe neutropenia.' },
    { q: 'Antibiotics in febrile neutropenia should be given within:', options: ['24 hours', '1 hour', '6 hours', 'After culture results'], answer: 1, why: 'Time-critical sepsis.' },
    { q: 'Dextrose for paediatric hypoglycaemia:', options: ['50 % 1 mL/kg', '10 % 2–5 mL/kg', '5 % 1 mL/kg', 'Oral only'], answer: 1, why: 'Avoid concentrated solutions.' },
    { q: 'Hypernatraemia should be corrected:', options: ['Rapidly', 'Slowly (~0.5 mmol/L/h)', 'Not at all', 'With 3 % saline'], answer: 1, why: 'Avoid cerebral oedema.' },
    { q: 'Seizures from acute hyponatraemia in a child:', options: ['Free water', '3 % saline 2–5 mL/kg', 'Furosemide', 'Dextrose only'], answer: 1, why: 'Raise sodium quickly.' },
    { q: 'A falsely high potassium is commonly caused by:', options: ['Haemolysed capillary sample', 'Dehydration', 'Insulin', 'Vomiting'], answer: 0, why: 'Cell lysis releases K⁺.' },
    { q: 'Low sodium, high potassium, low glucose and shock in a 2-week-old suggests:', options: ['Pyloric stenosis', 'Congenital adrenal hyperplasia (adrenal crisis)', 'Normal', 'Bronchiolitis'], answer: 1, why: 'Salt-wasting crisis.' },
    { q: 'Jaundice in the first 24 hours of life:', options: ['Is normal', 'Is always pathological', 'Needs no evaluation', 'Means breastfeeding jaundice'], answer: 1, why: 'Suggests haemolysis.' },
    { q: 'Kernicterus is caused by:', options: ['Conjugated bilirubin', 'Very high unconjugated bilirubin', 'Low glucose', 'High sodium'], answer: 1, why: 'Bilirubin encephalopathy.' },
    { q: 'Febrile infants under 28 days:', options: ['Can go home if well-appearing', 'Need full sepsis evaluation and antibiotics', 'Need only paracetamol', 'Need no tests'], answer: 1, why: 'High risk of serious infection.' },
    { q: 'A normal PCO₂ in a tachypnoeic child with asthma suggests:', options: ['Improvement', 'Fatigue and impending failure', 'Normal', 'Hyperventilation only'], answer: 1, why: 'Should be low.' },
    { q: 'Neonatal hypoglycaemia is commonly treated below about:', options: ['5.0 mmol/L', '2.6 mmol/L', '1.0 mmol/L only', '7.0 mmol/L'], answer: 1, why: 'Common threshold.' },
    { q: 'Conjugated hyperbilirubinaemia with pale stools suggests:', options: ['Physiological jaundice', 'Biliary atresia or liver disease', 'Breast milk jaundice', 'Haemolysis'], answer: 1, why: 'Obstructive pattern.' },
    { q: 'Lymphocyte-predominant white counts are normal in:', options: ['Neonates only', 'Infants and young children', 'Adults', 'Never'], answer: 1, why: 'Age-specific pattern.' },
  ],
  sources: [
    { title: 'Neonatal hypoglycaemia: AAP clinical report (Adamkin 2011)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Adamkin+postnatal+glucose+homeostasis+late-preterm+term+infants+2011' },
    { title: 'AAP Clinical Practice Guideline: Febrile infants 8–60 days (2021)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Pantell+evaluation+management+well-appearing+febrile+infants+8+to+60+days+2021' },
  ],
};

export const PEDS_PHARM: FpcLesson = {
  id: 'fpc-peds-pharm', domain: 'peds', ref: 'IX.3',
  title: 'Paediatric pharmacology',
  summary: 'Weight-based dosing and error prevention, resuscitation drugs, RSI and sedation in children, analgesia, seizure drugs, and the pharmacokinetic differences that matter in transport.',
  objectives: [
    'Calculate and verify weight-based doses and avoid ten-fold errors.',
    'Dose resuscitation, RSI, sedation and analgesic drugs for children.',
    'Explain paediatric pharmacokinetic differences.',
  ],
  sections: [
    {
      id: 'safety', title: 'Dosing safely', core: true,
      body: [
        'Almost every paediatric drug is weight-based, and errors are common: ten-fold errors (a misplaced decimal point), using pounds instead of kilograms, confusion between mg and mL, and wrong concentrations. Use a length-based tape or cognitive aid with pre-calculated doses, state the dose and volume aloud, have a second person check high-risk drugs (closed-loop: "Epinephrine 0.15 mg — that\'s 1.5 mL of 0.1 mg/mL"), and never exceed adult maximum doses.',
        'Draw up only what you need in an appropriately sized syringe, label every syringe, and flush small volumes carefully — dead space in IV lines can hold a significant fraction of a small child\'s dose.',
        'Pharmacokinetics differ: neonates and infants have more total body water (larger volume of distribution for water-soluble drugs), less fat, lower protein binding, immature hepatic enzymes (slower clearance of many drugs) and immature renal function. Toddlers often metabolise drugs faster than adults. Use age-appropriate references.',
      ],
    },
    {
      id: 'resus', title: 'Resuscitation and airway drugs', core: true,
      body: [
        'Cardiac arrest: epinephrine 0.01 mg/kg IV/IO (0.1 mL/kg of 0.1 mg/mL), maximum 1 mg, every 3–5 minutes. Amiodarone 5 mg/kg (max 300 mg) or lidocaine 1 mg/kg for shock-refractory VF/pulseless VT. Defibrillation 2 J/kg, then 4 J/kg, up to 10 J/kg or the adult dose. Synchronised cardioversion 0.5–1 J/kg, then 2 J/kg. Adenosine 0.1 mg/kg (max 6 mg), then 0.2 mg/kg (max 12 mg), for SVT. Atropine 0.02 mg/kg (no minimum dose in current guidance; max 0.5 mg) for vagal bradycardia.',
        'RSI: ketamine 1–2 mg/kg IV or etomidate 0.3 mg/kg; rocuronium 1 mg/kg (higher in shock) or succinylcholine 2 mg/kg in infants (1–1.5 mg/kg in older children). Infants are prone to bradycardia during laryngoscopy, mostly from hypoxia; have atropine ready. Avoid succinylcholine in undiagnosed myopathies (risk of hyperkalaemic arrest).',
        'Vasoactive drugs: epinephrine (0.05–1 mcg/kg/min) or norepinephrine for fluid-refractory septic shock — cold shock often responds to epinephrine, warm shock to norepinephrine. Dopamine is no longer first line. Peripheral or IO infusions are acceptable initially in children.',
      ],
      table: {
        caption: 'Common paediatric doses',
        head: ['Drug', 'Dose', 'Max'],
        rows: [['Epinephrine (arrest)', '0.01 mg/kg IV/IO', '1 mg'], ['Epinephrine (anaphylaxis IM)', '0.01 mg/kg of 1 mg/mL', '0.5 mg'], ['Amiodarone', '5 mg/kg', '300 mg'], ['Adenosine', '0.1 then 0.2 mg/kg', '6 then 12 mg'], ['Ketamine (RSI)', '1–2 mg/kg IV', '—'], ['Rocuronium', '1 mg/kg (1.2 in shock)', '—'], ['Fentanyl', '1 mcg/kg IV; 1.5 mcg/kg IN', '50–100 mcg/dose'], ['Midazolam (seizure)', '0.2 mg/kg IM/IN; 0.1 mg/kg IV', '10 mg'], ['Dextrose 10 %', '2–5 mL/kg', '—']],
      },
    },
    {
      id: 'analgesia', title: 'Analgesia, sedation and seizures', core: true,
      body: [
        'Children are often under-treated for pain. Intranasal fentanyl (1.5 mcg/kg via an atomiser, max 100 mcg) works within minutes without IV access. Ketamine (0.1–0.3 mg/kg IV for analgesia; 1–1.5 mg/kg IV or 4 mg/kg IM for procedural sedation) preserves airway reflexes and breathing. Paracetamol (15 mg/kg) and ibuprofen (10 mg/kg) are effective for mild to moderate pain. Use age-appropriate pain scales (FLACC for preverbal children, faces scales for young children).',
        'Seizures: benzodiazepine first line — midazolam 0.2 mg/kg IM or intranasal (max 10 mg), 0.3 mg/kg buccal, or 0.1 mg/kg IV; lorazepam 0.1 mg/kg IV. Second line: levetiracetam 60 mg/kg (max 4500 mg), fosphenytoin 20 mg PE/kg, or valproate 40 mg/kg. Respiratory depression is more likely after repeated benzodiazepine doses.',
        'Common transport infusions such as sedation after intubation use morphine or fentanyl with midazolam, or dexmedetomidine; propofol infusions are avoided for long-term sedation in children because of propofol infusion syndrome.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the dose check',
      body: ['A 3-year-old (length-based tape: 14 kg) in pulseless VT after a drowning. The team prepares epinephrine 1 mg/10 mL (0.1 mg/mL), amiodarone and defibrillation.'],
      example: { case: 'Calculate.', steps: [
        'Epinephrine 0.01 mg/kg = 0.14 mg = 1.4 mL of 0.1 mg/mL.',
        'Defibrillation 2 J/kg = 28 J (round to the nearest setting, about 30 J), then 4 J/kg = 56 J.',
        'Amiodarone 5 mg/kg = 70 mg after the third shock.',
        'Read back each dose and volume; a second person checks; treat hypothermia and hypoxia from drowning.',
      ] },
    },
  ],
  keyPoints: [
    'Weight-based dosing with a length-based tape; read back dose and volume; never exceed adult max.',
    'Epinephrine 0.01 mg/kg (arrest); amiodarone 5 mg/kg; adenosine 0.1 then 0.2 mg/kg.',
    'Defibrillation 2 then 4 J/kg; cardioversion 0.5–1 then 2 J/kg.',
    'Intranasal fentanyl 1.5 mcg/kg; ketamine for analgesia and sedation.',
    'Seizures: midazolam 0.2 mg/kg IM/IN, then levetiracetam 60 mg/kg.',
  ],
  pearls: ['Dead space in IV lines can hold a large part of a small dose.', 'Cold septic shock → epinephrine; warm → norepinephrine.'],
  pitfalls: ['Ten-fold decimal errors.', 'Using pounds instead of kilograms.'],
  live: [{ id: 'moa-ketamine', label: 'Ketamine: mechanism' }, { id: 'moa-epinephrine', label: 'Epinephrine: mechanism' }],
  questions: [
    { q: 'Paediatric arrest epinephrine dose:', options: ['0.1 mg/kg', '0.01 mg/kg IV/IO (max 1 mg)', '1 mg/kg', '0.001 mg/kg'], answer: 1, why: 'Standard PALS dose.' },
    { q: 'Volume of 0.1 mg/mL epinephrine for a 20 kg child in arrest:', options: ['0.2 mL', '2 mL', '20 mL', '0.02 mL'], answer: 1, why: '0.2 mg ÷ 0.1 mg/mL.' },
    { q: 'Initial paediatric defibrillation dose:', options: ['0.5 J/kg', '2 J/kg', '10 J/kg', '200 J'], answer: 1, why: 'Then 4 J/kg.' },
    { q: 'Synchronised cardioversion initial dose:', options: ['0.5–1 J/kg', '4 J/kg', '10 J/kg', '50 J flat'], answer: 0, why: 'Then 2 J/kg.' },
    { q: 'Adenosine first dose for SVT:', options: ['0.01 mg/kg', '0.1 mg/kg (max 6 mg)', '1 mg/kg', '12 mg flat'], answer: 1, why: 'Rapid push with flush.' },
    { q: 'Amiodarone for refractory VF in a child:', options: ['1 mg/kg', '5 mg/kg (max 300 mg)', '15 mg/kg', '0.5 mg/kg'], answer: 1, why: 'The PALS dose is 5 mg/kg, maximum 300 mg.' },
    { q: 'Intranasal fentanyl dose:', options: ['0.1 mcg/kg', '1.5 mcg/kg', '10 mcg/kg', '15 mcg/kg'], answer: 1, why: 'Via atomiser.' },
    { q: 'Midazolam IM/IN for paediatric seizures:', options: ['0.02 mg/kg', '0.2 mg/kg (max 10 mg)', '2 mg/kg', '1 mg flat'], answer: 1, why: 'First line.' },
    { q: 'A common cause of paediatric medication errors:', options: ['Weight-based dosing aids', 'Ten-fold decimal errors', 'Closed-loop communication', 'Labelling syringes'], answer: 1, why: 'Misplaced decimals.' },
    { q: 'Succinylcholine dose in infants:', options: ['0.5 mg/kg', '2 mg/kg', '5 mg/kg', '0.1 mg/kg'], answer: 1, why: 'Larger extracellular volume.' },
    { q: 'Neonates have a larger volume of distribution for water-soluble drugs because:', options: ['More fat', 'More total body water', 'Faster liver', 'Higher protein binding'], answer: 1, why: 'Body composition.' },
    { q: 'Cold septic shock in a child often responds best to:', options: ['Norepinephrine', 'Epinephrine', 'Dopamine', 'Vasopressin first'], answer: 1, why: 'Inotropy and vasoconstriction.' },
    { q: 'Propofol infusions are avoided for prolonged paediatric sedation because of:', options: ['Cost', 'Propofol infusion syndrome', 'Seizures', 'Hypertension'], answer: 1, why: 'Metabolic acidosis, rhabdomyolysis, arrest.' },
    { q: 'A pain scale for preverbal children:', options: ['Numeric 0–10', 'FLACC', 'GCS', 'APGAR'], answer: 1, why: 'Behavioural scale.' },
    { q: 'Paediatric doses should never exceed:', options: ['The adult maximum dose', 'Twice the adult dose', '10 mg', 'The neonatal dose'], answer: 0, why: 'Safety cap.' },
  ],
  sources: [
    { title: 'AHA Pediatric Advanced Life Support guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-and-advanced-life-support' },
    { title: 'Surviving Sepsis Campaign International Guidelines for Children (2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Weiss+Surviving+Sepsis+Campaign+international+guidelines+children+2020' },
  ],
};
