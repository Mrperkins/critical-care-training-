/** FP-C IV.1–IV.3: endocrine, adrenal and renal emergencies. */
import type { FpcLesson } from '../types';

export const ENDOCRINE: FpcLesson = {
  id: 'fpc-endocrine', domain: 'medical', ref: 'IV.1',
  title: 'Endocrine emergencies: DKA, HHS, thyroid storm and myxoedema',
  summary: 'Diabetic ketoacidosis and the hyperosmolar hyperglycaemic state, hypoglycaemia, thyroid storm and myxoedema coma: recognition, the order of treatment, and the transport traps.',
  objectives: [
    'Differentiate DKA from HHS and treat each in the right order: fluid, potassium, insulin.',
    'Recognise thyroid storm and myxoedema coma and start time-critical therapy.',
    'Anticipate the airway and haemodynamic hazards of endocrine crises in transport.',
  ],
  sections: [
    {
      id: 'dka', title: 'DKA and HHS', core: true,
      body: [
        'Diabetic ketoacidosis (DKA) is insulin deficiency with counter-regulatory hormone excess: glucose usually above 250 mg/dL (14 mmol/L), a high anion-gap metabolic acidosis (pH < 7.30, bicarbonate < 18), and ketones. Kussmaul breathing compensates for the acidosis. Osmotic diuresis causes profound dehydration — often 5–8 litres in adults — and total-body potassium depletion even when the plasma potassium reads high.',
        'The hyperosmolar hyperglycaemic state (HHS) is seen more in older type 2 diabetics: glucose often above 600 mg/dL (33 mmol/L), serum osmolality above 320 mOsm/kg, little or no ketosis or acidosis, and greater dehydration (often 8–10 litres). Altered consciousness tracks osmolality. Mortality is higher than DKA, partly from age, comorbidity and thrombosis.',
        'Order of treatment for both: fluids first (isotonic crystalloid to restore circulation), then potassium (check before insulin; replace if low — many protocols withhold insulin until K⁺ is at least 3.3 mmol/L), then insulin as a fixed-rate infusion. Add dextrose as glucose falls so insulin can continue until ketones clear. Bicarbonate is reserved for extreme acidaemia per protocol. In HHS, lower glucose and sodium more slowly to avoid cerebral oedema.',
      ],
      table: {
        caption: 'DKA versus HHS',
        head: ['Feature', 'DKA', 'HHS'],
        rows: [['Glucose', '> 250 mg/dL', 'Often > 600 mg/dL'], ['pH / HCO₃⁻', '< 7.30 / < 18', '> 7.30 / > 18'], ['Ketones', 'Moderate to large', 'Small or none'], ['Osmolality', 'Variable', '> 320 mOsm/kg'], ['Mental status', 'Variable', 'Often obtunded'], ['Fluid deficit', '≈ 5–8 L', '≈ 8–10 L']],
      },
    },
    {
      id: 'transport', title: 'Transport traps in DKA', core: true,
      body: [
        'Intubation is dangerous: the patient is compensating for a severe metabolic acidosis with a very high minute ventilation. Apnoea and then "normal" ventilator settings can drop the pH precipitously and cause arrest. Avoid intubation unless the airway is truly threatened; if needed, keep apnoea short and set a minute ventilation that matches the patient\'s own.',
        'Potassium falls as insulin and fluids act; hypokalaemia causes arrhythmias. Monitor the ECG continuously and recheck potassium on long transports. In children, rapid fluid shifts risk cerebral oedema — watch for headache, falling GCS, bradycardia and hypertension, and treat with hyperosmolar therapy.',
      ],
    },
    {
      id: 'hypo', title: 'Hypoglycaemia',
      body: [
        'Hypoglycaemia (glucose below about 70 mg/dL, with symptoms; severe when the patient needs assistance) causes sweating, tremor and tachycardia from adrenergic response, then confusion, seizures and coma from neuroglycopenia. Beta-blockers mask the adrenergic warning signs. Sulfonylurea overdose causes prolonged, recurrent hypoglycaemia; octreotide reduces insulin release in that setting.',
        'Treat with IV dextrose (for example D10 in titrated boluses, or D50 in adults per protocol), or IM glucagon if no access (less effective in depleted glycogen stores — alcoholics, starvation). Recheck glucose frequently and follow with food or a dextrose infusion.',
      ],
    },
    {
      id: 'thyroid', title: 'Thyroid storm and myxoedema coma', core: true,
      body: [
        'Thyroid storm is life-threatening thyrotoxicosis: fever, tachycardia (often atrial fibrillation), agitation or delirium, vomiting, diarrhoea and high-output heart failure, often precipitated by infection, surgery, trauma or stopping antithyroid drugs. Treat in sequence: a beta-blocker (propranolol is classic; esmolol when titration is needed) for adrenergic effects, a thionamide (propylthiouracil or methimazole) to block synthesis, iodine at least an hour after the thionamide to block release, corticosteroids, cooling and supportive care. Avoid aspirin for fever (it displaces thyroid hormone from binding proteins).',
        'Myxoedema coma is decompensated hypothyroidism: hypothermia, bradycardia, hypoventilation with hypercapnia, hyponatraemia, hypoglycaemia and depressed consciousness, often in an older woman in winter. Treat with IV levothyroxine (often with liothyronine per specialist advice), stress-dose hydrocortisone until adrenal insufficiency is excluded, passive rewarming, ventilatory support and careful correction of sodium. These patients are very sensitive to sedatives.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the vomiting teenager',
      body: [
        'A 16-year-old with type 1 diabetes, vomiting for a day: GCS 13, RR 36 deep, HR 130, BP 98/60, glucose 540 mg/dL, pH 7.04, HCO₃⁻ 5, K⁺ 5.6, Na⁺ 131. A 90-minute flight to a paediatric ICU.',
      ],
      example: {
        case: 'What are your priorities and what could go wrong in the air?',
        steps: [
          'Fluids per paediatric DKA protocol (measured boluses, then calculated deficit over 24–48 h) — not the large volumes used in adults, to limit cerebral oedema risk.',
          'Potassium is 5.6 now but will fall; add potassium to fluids once urine output is confirmed and K⁺ is falling into the normal range.',
          'Fixed-rate insulin per protocol after initial fluids (no insulin bolus in children).',
          'Avoid intubation; if unavoidable, match her minute ventilation.',
          'In flight: hourly glucose, frequent neuro checks for cerebral oedema (headache, bradycardia, falling GCS); have hyperosmolar therapy available.',
        ],
      },
    },
  ],
  keyPoints: [
    'DKA: glucose > 250, pH < 7.30, ketones; HHS: glucose > 600, osmolality > 320, little acidosis.',
    'Fluid, then potassium (≥ 3.3 before insulin), then insulin; add dextrose and continue until ketones clear.',
    'Do not intubate a compensating DKA patient lightly; match minute ventilation if you must.',
    'Thyroid storm: beta-blocker, thionamide, iodine an hour later, steroids, cooling.',
    'Myxoedema coma: IV thyroid hormone, hydrocortisone, rewarming, ventilatory support.',
  ],
  pearls: ['Plasma potassium is high in DKA but total-body potassium is low.', 'Glucagon fails when glycogen is depleted.', 'Watch children with DKA for cerebral oedema in the first hours of treatment.'],
  pitfalls: ['Insulin before potassium is known.', 'Normal ventilator settings after intubating a DKA patient.', 'Aspirin for fever in thyroid storm.'],
  live: [{ id: 'abg-dka', label: 'DKA: acid, water and potassium' }, { id: 'metab', label: 'Metabolic acidosis and the anion gap' }],
  questions: [
    { q: 'Which best distinguishes HHS from DKA?', options: ['Glucose above 250', 'Osmolality above 320 with minimal acidosis', 'Kussmaul breathing', 'Hyperkalaemia'], answer: 1, why: 'HHS is hyperosmolar with little ketoacidosis.' },
    { q: 'Before starting insulin in DKA, potassium should generally be at least:', options: ['2.5', '3.3', '5.0', '6.0 mmol/L'], answer: 1, why: 'Insulin drives potassium into cells.' },
    { q: 'Glucose falls to 220 mg/dL but the anion gap remains high. You should:', options: ['Stop insulin', 'Add dextrose and continue insulin', 'Give bicarbonate', 'Switch to glucagon'], answer: 1, why: 'Ketosis, not glucose, defines resolution.' },
    { q: 'Signs of cerebral oedema in paediatric DKA include:', options: ['Tachycardia and hypotension', 'Headache, bradycardia, falling GCS', 'Polyuria', 'Hyperkalaemia'], answer: 1, why: 'Raised ICP signs.' },
    { q: 'First drug to control adrenergic symptoms in thyroid storm:', options: ['Iodine', 'Propranolol', 'Aspirin', 'Levothyroxine'], answer: 1, why: 'Beta-blockade treats tachycardia and agitation.' },
    { q: 'Iodine in thyroid storm is given:', options: ['Before the thionamide', 'At least an hour after the thionamide', 'Never', 'Instead of beta-blockers'], answer: 1, why: 'Otherwise it can fuel more hormone synthesis.' },
    { q: 'Myxoedema coma typically presents with:', options: ['Hyperthermia and tachycardia', 'Hypothermia, bradycardia, hypoventilation', 'Hypernatraemia', 'Diarrhoea'], answer: 1, why: 'Decompensated hypothyroidism slows everything.' },
    { q: 'Why give hydrocortisone in myxoedema coma?', options: ['To lower glucose', 'Possible coexisting adrenal insufficiency', 'To raise sodium', 'To treat infection'], answer: 1, why: 'Thyroid replacement can precipitate adrenal crisis.' },
    { q: 'Glucagon is least effective in:', options: ['A healthy adult', 'Chronic alcoholism with depleted glycogen', 'Insulin overdose in a fed patient', 'Children'], answer: 1, why: 'It works by mobilising glycogen.' },
    { q: 'Prolonged recurrent hypoglycaemia after sulfonylurea overdose may be treated with:', options: ['Insulin', 'Octreotide', 'Propranolol', 'Calcium'], answer: 1, why: 'Octreotide suppresses insulin secretion.' },
    { q: 'Typical fluid deficit in adult DKA:', options: ['0.5–1 L', '5–8 L', '15–20 L', 'None'], answer: 1, why: 'Osmotic diuresis causes large losses.' },
    { q: 'A DKA patient must be intubated. Initial ventilation should:', options: ['Use RR 12', 'Match pre-intubation minute ventilation', 'Allow permissive hypercapnia', 'Use PS 5'], answer: 1, why: 'Preserve respiratory compensation.' },
    { q: 'Insulin bolus in paediatric DKA:', options: ['Always given', 'Not recommended', 'Given IM', 'Only with HHS'], answer: 1, why: 'Children receive a fixed-rate infusion without bolus.' },
    { q: 'Beta-blockers can make hypoglycaemia harder to detect because they:', options: ['Raise glucose', 'Mask adrenergic warning symptoms', 'Cause seizures', 'Cause hyperkalaemia'], answer: 1, why: 'Tremor and tachycardia are blunted.' },
    { q: 'HHS mortality is higher than DKA partly because of:', options: ['Younger patients', 'Age, comorbidity and thrombosis', 'Lower glucose', 'Less dehydration'], answer: 1, why: 'Older patients with more complications.' },
  ],
  sources: [
    { title: 'ADA consensus report: hyperglycaemic crises in adults with diabetes (2024)', url: 'https://diabetesjournals.org/care/article/47/8/1257/156808' },
    { title: 'StatPearls: Thyroid storm', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Thyroid+storm+StatPearls' },
    { title: 'StatPearls: Myxedema coma', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Myxedema+coma+StatPearls' },
  ],
};

export const ADRENAL: FpcLesson = {
  id: 'fpc-adrenal', domain: 'medical', ref: 'IV.2',
  title: 'Adrenal emergencies: crisis, steroids and pheochromocytoma',
  summary: 'Primary and secondary adrenal insufficiency, adrenal crisis and stress dosing, relative adrenal insufficiency in shock, and catecholamine crises from pheochromocytoma.',
  objectives: [
    'Recognise adrenal crisis and give hydrocortisone without waiting for confirmation.',
    'Know who needs stress-dose steroids and the role of hydrocortisone in refractory septic shock.',
    'Manage a pheochromocytoma crisis: alpha before beta.',
  ],
  sections: [
    {
      id: 'physiology', title: 'What the adrenals do', core: true,
      body: [
        'The adrenal cortex makes cortisol (glucocorticoid), aldosterone (mineralocorticoid) and androgens. Cortisol supports blood pressure by sensitising vessels to catecholamines, raises glucose and modulates inflammation; aldosterone retains sodium and excretes potassium. The adrenal medulla secretes epinephrine and norepinephrine.',
        'Primary adrenal insufficiency (Addison\'s disease: autoimmune, infection, haemorrhage) loses both cortisol and aldosterone, so hyponatraemia, hyperkalaemia and hyperpigmentation are typical. Secondary insufficiency (pituitary disease, or suppression by long-term steroid therapy — the commonest cause) loses cortisol but aldosterone is largely preserved, so potassium is usually normal.',
      ],
    },
    {
      id: 'crisis', title: 'Adrenal crisis', core: true,
      body: [
        'Adrenal crisis is shock that responds poorly to fluids and vasopressors, often with abdominal pain, vomiting, confusion, fever, hypoglycaemia, hyponatraemia and hyperkalaemia. It is precipitated by infection, trauma, surgery, vomiting that prevents oral steroids, or abrupt withdrawal of chronic steroid therapy. Waterhouse–Friderichsen syndrome is bilateral adrenal haemorrhage in meningococcal sepsis.',
        'Treat immediately: hydrocortisone 100 mg IV or IM in adults (about 50–100 mg/m², often 2 mg/kg up to 100 mg in children per local protocol), isotonic fluids with dextrose if hypoglycaemic, and treatment of the precipitant. Do not delay hydrocortisone for a cortisol level. At doses of 100 mg and above, hydrocortisone provides enough mineralocorticoid effect that fludrocortisone is not needed acutely.',
        'Patients on long-term steroids (for example prednisone 5 mg or more daily for more than a few weeks) may not mount a stress response. Many carry an emergency card and an injection kit; ask about it, and give stress-dose hydrocortisone in serious illness or injury.',
      ],
    },
    {
      id: 'sepsis', title: 'Steroids in septic shock', core: true,
      body: [
        'In septic shock needing ongoing or escalating vasopressor therapy, guidelines suggest IV hydrocortisone (commonly 200 mg/day in divided doses or infusion). Trials show faster shock reversal; mortality benefit is inconsistent. Etomidate\'s transient adrenal suppression after a single induction dose is debated; many clinicians simply ensure hydrocortisone is considered in refractory shock regardless of induction agent.',
      ],
    },
    {
      id: 'pheo', title: 'Pheochromocytoma crisis',
      body: [
        'A catecholamine-secreting tumour can cause paroxysmal hypertension, headache, sweating and palpitations, and crises with severe hypertension, arrhythmias, cardiomyopathy and pulmonary oedema — sometimes triggered by anaesthesia, trauma, steroids or certain drugs (metoclopramide, some antidepressants).',
        'Treat with alpha-blockade or vasodilators first (phentolamine, nicardipine, nitroprusside per protocol). Never give a beta-blocker alone: blocking beta-2 mediated vasodilation leaves alpha vasoconstriction unopposed and blood pressure can rise further. Beta-blockers are added only after adequate alpha-blockade, to control tachycardia.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the post-operative patient who will not stay up',
      body: [
        'A 62-year-old with rheumatoid arthritis on long-term prednisone, two days after bowel surgery, vomiting for 24 hours: BP 76/40 despite 3 L of fluid and norepinephrine 0.3 mcg/kg/min, HR 118, glucose 58 mg/dL, Na⁺ 129, K⁺ 4.6.',
      ],
      example: {
        case: 'What is the likely diagnosis and what do you give?',
        steps: [
          'Chronic steroid use + vomiting (missed doses) + surgical stress + refractory shock + hypoglycaemia and hyponatraemia → adrenal crisis (secondary: potassium normal).',
          'Give hydrocortisone 100 mg IV now; don\'t wait for a cortisol level.',
          'Treat hypoglycaemia with dextrose; continue fluids and vasopressor; expect vasopressor needs to fall within hours.',
          'Consider other causes concurrently: anastomotic leak and sepsis, bleeding.',
        ],
      },
    },
  ],
  keyPoints: [
    'Adrenal crisis: refractory shock, vomiting, hypoglycaemia, hyponatraemia (± hyperkalaemia in primary).',
    'Hydrocortisone 100 mg IV/IM immediately; never wait for a cortisol level.',
    'Long-term steroid users need stress dosing in serious illness or injury.',
    'Hydrocortisone is suggested in septic shock with ongoing vasopressor need.',
    'Pheochromocytoma: alpha-blockade or vasodilator first, never a beta-blocker alone.',
  ],
  pearls: ['Ask about steroid emergency cards and kits.', 'Secondary adrenal insufficiency usually has a normal potassium.'],
  pitfalls: ['Escalating vasopressors in a steroid-dependent patient without hydrocortisone.', 'Beta-blocking a hypertensive pheochromocytoma crisis.'],
  questions: [
    { q: 'Hyperkalaemia is typical of:', options: ['Secondary adrenal insufficiency', 'Primary adrenal insufficiency', 'Cushing\'s syndrome', 'Pheochromocytoma'], answer: 1, why: 'Primary loss of aldosterone.' },
    { q: 'Adult hydrocortisone dose for adrenal crisis:', options: ['5 mg', '25 mg', '100 mg', '1 g'], answer: 2, why: '100 mg IV or IM.' },
    { q: 'The most common cause of secondary adrenal insufficiency:', options: ['Autoimmune adrenalitis', 'Long-term exogenous steroids', 'Meningococcaemia', 'TB'], answer: 1, why: 'HPA axis suppression.' },
    { q: 'Waterhouse–Friderichsen syndrome is:', options: ['Pituitary apoplexy', 'Bilateral adrenal haemorrhage in meningococcal sepsis', 'Thyroid storm', 'Addison\'s from TB'], answer: 1, why: 'Classic fulminant meningococcaemia complication.' },
    { q: 'In adrenal crisis, hydrocortisone should be given:', options: ['After cortisol results', 'Immediately', 'Only if K⁺ is high', 'Only orally'], answer: 1, why: 'Delay increases mortality.' },
    { q: 'Hydrocortisone is suggested in septic shock when:', options: ['Lactate is 1', 'Vasopressor requirement is ongoing', 'BP is normal', 'Fever is present'], answer: 1, why: 'Speeds shock reversal.' },
    { q: 'First-line for pheochromocytoma hypertensive crisis:', options: ['Labetalol alone', 'Propranolol', 'Phentolamine or a vasodilator', 'Metoclopramide'], answer: 2, why: 'Alpha-blockade first.' },
    { q: 'Why avoid a beta-blocker alone in pheochromocytoma?', options: ['Causes hypoglycaemia', 'Unopposed alpha vasoconstriction raises BP', 'Causes hyperkalaemia', 'Causes bronchodilation'], answer: 1, why: 'Loss of beta-2 vasodilation.' },
    { q: 'At hydrocortisone 100 mg, fludrocortisone acutely is:', options: ['Required', 'Not needed — enough mineralocorticoid effect', 'Contraindicated', 'Given first'], answer: 1, why: 'High-dose hydrocortisone has mineralocorticoid activity.' },
    { q: 'Hyperpigmentation suggests:', options: ['Secondary insufficiency', 'Primary insufficiency (high ACTH)', 'Pheochromocytoma', 'Hypothyroidism'], answer: 1, why: 'ACTH shares a precursor with MSH.' },
    { q: 'A drug that can trigger a pheochromocytoma crisis:', options: ['Metoclopramide', 'Phentolamine', 'Nicardipine', 'Hydrocortisone at physiological dose only'], answer: 0, why: 'Dopamine antagonists can provoke catecholamine release.' },
    { q: 'Hypoglycaemia in adrenal crisis results from:', options: ['Excess insulin', 'Lack of cortisol', 'Excess aldosterone', 'Catecholamine excess'], answer: 1, why: 'Cortisol supports gluconeogenesis.' },
    { q: 'A steroid-dependent trauma patient is hypotensive despite volume. Consider:', options: ['More crystalloid only', 'Stress-dose hydrocortisone', 'Beta-blocker', 'Diuretic'], answer: 1, why: 'Inadequate stress response.' },
    { q: 'Etomidate\'s adrenal effect after one dose is:', options: ['Permanent', 'Transient suppression; clinical impact debated', 'Stimulatory', 'Absent'], answer: 1, why: 'Inhibits 11-β-hydroxylase transiently.' },
    { q: 'Aldosterone\'s main effect:', options: ['Retains potassium', 'Retains sodium and excretes potassium', 'Raises glucose', 'Vasodilation'], answer: 1, why: 'Mineralocorticoid action at the distal nephron.' },
  ],
  sources: [
    { title: 'Endocrine Society guideline: diagnosis and treatment of primary adrenal insufficiency (2016)', url: 'https://academic.oup.com/jcem/article/101/2/364/2810222' },
    { title: 'Surviving Sepsis Campaign: international guidelines (2021)', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-guidelines-2021' },
  ],
};

export const RENAL: FpcLesson = {
  id: 'fpc-renal', domain: 'medical', ref: 'IV.3',
  title: 'Renal emergencies: AKI, hyperkalaemia and the dialysis patient',
  summary: 'Pre-renal, intrinsic and post-renal kidney injury, the life-threatening complications of renal failure, rhabdomyolysis, and managing dialysis patients and their access in transport.',
  objectives: [
    'Classify acute kidney injury and identify reversible causes.',
    'Treat hyperkalaemia in order: stabilise, shift, remove.',
    'Manage dialysis patients: access, missed dialysis, fluid overload and drug choices.',
  ],
  sections: [
    {
      id: 'aki', title: 'Acute kidney injury', core: true,
      body: [
        'AKI is a rapid rise in creatinine or fall in urine output (for example, creatinine rising by 0.3 mg/dL within 48 hours, or urine below 0.5 mL/kg/h for 6 hours). Classify by cause. Pre-renal: reduced perfusion from hypovolaemia, shock, heart failure or renal artery disease; the kidney itself is initially normal and recovers with perfusion. Intrinsic: acute tubular necrosis from prolonged ischaemia or toxins (contrast, aminoglycosides, myoglobin), glomerulonephritis, interstitial nephritis. Post-renal: obstruction of both outflows (or one in a single kidney) — prostate, stones, tumours, a blocked catheter.',
        'In transport, the reversible causes are what you can act on: restore perfusion pressure, stop nephrotoxins, and relieve obstruction (a urinary catheter, or flushing a blocked one). Track urine output hourly in critically ill patients.',
      ],
    },
    {
      id: 'hyperk', title: 'Hyperkalaemia', core: true,
      body: [
        'Potassium above about 6.5 mmol/L, or any hyperkalaemia with ECG changes, is an emergency. The ECG progresses roughly from peaked T waves, to PR prolongation and flattened P waves, to QRS widening, to a sine wave and then ventricular fibrillation or asystole — but the sequence is unreliable and arrest can occur without warning.',
        'Stabilise the membrane with IV calcium (calcium gluconate 3 g or calcium chloride 1 g in adults, typically, repeated if ECG changes persist); it acts within minutes, lasts 30–60 minutes and does not lower potassium. Shift potassium into cells with insulin plus dextrose (for example 10 units regular insulin with 25 g dextrose) and nebulised salbutamol; bicarbonate helps mainly in concurrent acidosis. Remove potassium with dialysis (definitive in renal failure), potassium binders, or loop diuretics if the kidneys work. Recheck glucose after insulin.',
      ],
      list: { caption: 'Causes to look for', items: ['Renal failure, missed dialysis', 'Drugs: ACE inhibitors/ARBs, spironolactone, potassium supplements, succinylcholine, digoxin toxicity', 'Cell breakdown: rhabdomyolysis, crush, tumour lysis, haemolysis, burns', 'Acidosis (shift out of cells), adrenal insufficiency', 'Pseudohyperkalaemia from a haemolysed sample — but treat if the ECG is abnormal'] },
    },
    {
      id: 'rhabdo', title: 'Rhabdomyolysis',
      body: [
        'Muscle breakdown from crush, prolonged immobilisation, exertion, seizures, hyperthermia or drugs releases myoglobin, potassium, phosphate and creatine kinase. Myoglobin causes tubular injury, especially in hypovolaemia and acidosis. Dark urine with a dipstick positive for blood but few red cells suggests myoglobinuria.',
        'Treat with early, aggressive isotonic fluids to maintain a high urine output (often targeted around 200–300 mL/h in adults per protocol), correct hyperkalaemia, and in crush injury start fluids before release where possible to blunt reperfusion hyperkalaemia and acidosis. Avoid succinylcholine.',
      ],
    },
    {
      id: 'dialysis', title: 'The dialysis patient in transport', core: true,
      body: [
        'Ask when the last dialysis was. Missed dialysis brings hyperkalaemia, fluid overload with pulmonary oedema, metabolic acidosis and uraemic complications (pericarditis, encephalopathy, bleeding from platelet dysfunction).',
        'Protect the access: avoid blood pressure cuffs, IVs and venepuncture on an arm with a fistula or graft. A palpable thrill and audible bruit indicate patency. Bleeding from a fistula can be torrential; apply firm direct pressure. Central dialysis catheters should not be used for routine access except in an emergency by protocol, as they are often locked with concentrated heparin or citrate that must be aspirated first.',
        'Drug choice: avoid succinylcholine if potassium is unknown or high; use rocuronium. Many drugs accumulate (morphine metabolites, some antibiotics); fentanyl is preferred to morphine. Fluid overload is better treated with nitrates and NIV than with fluid restriction alone; diuretics may be ineffective in anuric patients.',
      ],
      example: {
        case: 'A dialysis patient missed two sessions: dyspnoeic, SpO₂ 86 %, BP 190/100, crackles, HR 52 with wide QRS, K⁺ 7.9.',
        steps: [
          'Immediate threat: hyperkalaemia with ECG changes — IV calcium now, repeat if no narrowing.',
          'Shift: insulin with dextrose and nebulised salbutamol; check glucose hourly.',
          'Pulmonary oedema: sit up, CPAP or BiPAP, nitroglycerin for hypertension.',
          'Arrange urgent dialysis at the destination; avoid the fistula arm; rocuronium if intubation is needed.',
        ],
      },
    },
  ],
  keyPoints: [
    'AKI: pre-renal (perfusion), intrinsic (ATN, toxins), post-renal (obstruction) — fix what is reversible.',
    'Hyperkalaemia with ECG changes: calcium first, then insulin/dextrose and salbutamol, then removal.',
    'Calcium stabilises the membrane but does not lower potassium.',
    'Rhabdomyolysis: early aggressive fluids, high urine output, watch potassium, avoid succinylcholine.',
    'Dialysis patients: last session, protect the fistula arm, rocuronium not succinylcholine.',
  ],
  pearls: ['Check for a blocked urinary catheter in sudden oliguria.', 'Fentanyl is preferred over morphine in renal failure.'],
  pitfalls: ['BP cuff on a fistula arm.', 'Forgetting the glucose recheck after insulin.'],
  live: [{ id: 'hyperk-signature', label: 'Hyperkalaemia: the membrane, the ECG, the rescue' }, { id: 'hyperk', label: 'Hyperkalaemia: stabilise, shift, remove' }],
  questions: [
    { q: 'A blocked urinary catheter causing anuria is which type of AKI?', options: ['Pre-renal', 'Intrinsic', 'Post-renal', 'None'], answer: 2, why: 'Obstruction of outflow.' },
    { q: 'First drug for hyperkalaemia with a widened QRS:', options: ['Insulin', 'Calcium', 'Furosemide', 'Kayexalate'], answer: 1, why: 'Membrane stabilisation first.' },
    { q: 'Calcium in hyperkalaemia:', options: ['Lowers potassium quickly', 'Stabilises the membrane without lowering potassium', 'Removes potassium', 'Is contraindicated'], answer: 1, why: 'It raises threshold potential.' },
    { q: 'Insulin lowers potassium by:', options: ['Renal excretion', 'Shifting it into cells via Na/K-ATPase', 'Binding in the gut', 'Dialysis'], answer: 1, why: 'Stimulates the pump.' },
    { q: 'After insulin for hyperkalaemia, monitor for:', options: ['Hyperglycaemia only', 'Hypoglycaemia', 'Hypercalcaemia', 'Hyponatraemia'], answer: 1, why: 'Hypoglycaemia can occur hours later.' },
    { q: 'Dark urine, dipstick blood positive, few red cells suggests:', options: ['Haematuria', 'Myoglobinuria', 'Bilirubinuria', 'Normal'], answer: 1, why: 'Myoglobin reacts with the haem test.' },
    { q: 'Mainstay of rhabdomyolysis treatment:', options: ['Fluid restriction', 'Aggressive isotonic fluids', 'Diuretics alone', 'Succinylcholine'], answer: 1, why: 'Dilute myoglobin and maintain urine flow.' },
    { q: 'An arm with an AV fistula should not have:', options: ['Assessment for thrill', 'BP cuff or IV', 'Inspection', 'Palpation'], answer: 1, why: 'Protect the access.' },
    { q: 'Paralytic of choice in a dialysis patient with unknown potassium:', options: ['Succinylcholine', 'Rocuronium', 'Either', 'Neither'], answer: 1, why: 'Succinylcholine raises potassium.' },
    { q: 'Opioid preferred in renal failure:', options: ['Morphine', 'Fentanyl', 'Meperidine', 'Codeine'], answer: 1, why: 'Fewer active renally cleared metabolites.' },
    { q: 'Uraemic bleeding is due to:', options: ['Thrombocytosis', 'Platelet dysfunction', 'Excess factor VIII', 'Vitamin K excess'], answer: 1, why: 'Uraemic toxins impair platelets.' },
    { q: 'Before release of a crushed limb trapped for hours you should:', options: ['Delay fluids', 'Start IV fluids', 'Give succinylcholine', 'Apply heat'], answer: 1, why: 'Blunts reperfusion hyperkalaemia and acidosis.' },
    { q: 'Earliest typical ECG sign of hyperkalaemia:', options: ['Sine wave', 'Peaked T waves', 'U waves', 'ST depression'], answer: 1, why: 'Peaked T often first, though progression is unreliable.' },
    { q: 'Urine output definition of AKI:', options: ['< 2 mL/kg/h for 1 h', '< 0.5 mL/kg/h for 6 h', '< 1 L/day', '< 100 mL/h'], answer: 1, why: 'KDIGO criterion.' },
    { q: 'Bicarbonate in hyperkalaemia is most helpful when:', options: ['Always', 'Concurrent metabolic acidosis', 'Alkalosis', 'Never'], answer: 1, why: 'Its shifting effect is modest otherwise.' },
  ],
  sources: [
    { title: 'KDIGO clinical practice guideline for acute kidney injury', url: 'https://kdigo.org/guidelines/acute-kidney-injury/' },
    { title: 'StatPearls: Hyperkalemia', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Hyperkalemia+StatPearls' },
    { title: 'StatPearls: Rhabdomyolysis', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Rhabdomyolysis+StatPearls' },
  ],
};
