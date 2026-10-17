/** FP-C V.10–V.12: neurological lab values; pharmacologic agents; monitoring equipment (ICP). */
import type { FpcLesson } from '../types';

export const NEURO_LABS: FpcLesson = {
  id: 'fpc-neuro-labs', domain: 'neuro', ref: 'V.10',
  title: 'Neurological lab values: sodium, glucose and coagulation',
  summary: 'The labs that change neurological management: sodium disorders (SIADH, cerebral salt wasting, diabetes insipidus), osmolality during osmotherapy, glucose, and coagulation before thrombolysis or neurosurgery.',
  objectives: [
    'Differentiate SIADH, cerebral salt wasting and diabetes insipidus.',
    'Monitor sodium and osmolality during hyperosmolar therapy and correct sodium safely.',
    'Interpret glucose and coagulation results that affect thrombolysis and surgery.',
  ],
  sections: [
    {
      id: 'sodium', title: 'Sodium disorders in brain injury', core: true,
      body: [
        'Sodium governs water movement across the blood–brain barrier: low sodium draws water into the brain and worsens oedema; high sodium draws it out. In brain injury, the aim is normal to high-normal sodium (often 140–150 mmol/L when treating raised ICP). Hyponatraemia below about 125 mmol/L, or a rapid fall, can cause seizures and herniation.',
        'SIADH: inappropriate ADH causes water retention — euvolaemic hyponatraemia with concentrated urine (urine osmolality > 100 mOsm/kg) and urine sodium > 30 mmol/L. Treated with fluid restriction (except in SAH). Cerebral salt wasting: the kidneys lose sodium and water — hypovolaemic hyponatraemia with high urine sodium and high urine output. Treated with isotonic or hypertonic saline and fludrocortisone; fluid restriction is harmful. Distinguishing them relies on volume status, which is difficult at the bedside.',
        'Central diabetes insipidus — loss of ADH from pituitary or hypothalamic injury, common after severe TBI and brain death — causes large volumes of dilute urine (> 3 L/day or > 200–250 mL/h, urine specific gravity < 1.005, urine osmolality < 300) and rising sodium. Treat with desmopressin and replace losses with hypotonic fluid; monitor sodium every 2–4 hours.',
      ],
      table: {
        caption: 'Sodium disorders after brain injury',
        head: ['', 'SIADH', 'Cerebral salt wasting', 'Diabetes insipidus'],
        rows: [['Serum Na⁺', 'Low', 'Low', 'High'], ['Volume', 'Euvolaemic', 'Hypovolaemic', 'Hypovolaemic (if untreated)'], ['Urine output', 'Low/normal', 'High', 'Very high, dilute'], ['Urine Na⁺', 'High', 'Very high', 'Low'], ['Treatment', 'Fluid restriction (not in SAH)', 'Saline, fludrocortisone', 'Desmopressin, replace water']],
      },
    },
    {
      id: 'osmo', title: 'Osmolality, osmotherapy and safe correction', core: true,
      body: [
        'Serum osmolality ≈ 2 × Na⁺ + glucose + urea (all in mmol/L), normally 275–295 mOsm/kg. During mannitol therapy, measure the osmolar gap (measured minus calculated osmolality); a gap above about 20 suggests mannitol accumulation and risk of kidney injury, and many centres hold mannitol when serum osmolality exceeds about 320. Hypertonic saline is usually stopped or reviewed when sodium exceeds about 155–160.',
        'Correct chronic hyponatraemia slowly: no more than 8–10 mmol/L in 24 hours, to avoid osmotic demyelination syndrome (quadriparesis, dysarthria, "locked-in"). Acute symptomatic hyponatraemia with seizures or reduced consciousness is the exception — give 3 % saline 100–150 mL over 10–20 minutes, repeated up to two or three times, to raise sodium by 4–6 mmol/L, which is enough to stop seizures. Then slow down.',
      ],
    },
    {
      id: 'glucose', title: 'Glucose and coagulation', core: true,
      body: [
        'Both hypo- and hyperglycaemia damage the injured brain. Hypoglycaemia mimics stroke and causes seizures; a glucose below 2.8 mmol/L (50 mg/dL) excludes thrombolysis until corrected and reassessed. Hyperglycaemia worsens infarct size, haemorrhagic transformation and outcomes in TBI. Aim for about 7.8–10 mmol/L (140–180 mg/dL) in stroke and 6–10 mmol/L in brain injury, avoiding tight control that risks hypoglycaemia.',
        'Coagulation before thrombolysis: platelets ≥ 100 × 10⁹/L, INR ≤ 1.7, normal aPTT if on heparin, no DOAC within 48 hours unless specific levels are normal. Thrombolysis need not wait for results in patients with no history suggesting abnormality — the glucose is the only test required before starting.',
        'Before neurosurgery or EVD placement: INR usually < 1.4 and platelets > 100 × 10⁹/L. TBI itself causes coagulopathy through release of brain tissue factor, so check coagulation in all severe head injuries; coagulopathy predicts haematoma expansion and death.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the falling sodium',
      body: ['Day 5 after aneurysmal SAH. Sodium has fallen from 139 to 127 mmol/L over 24 hours. Urine output 250 mL/h; urine sodium 96 mmol/L; she looks dry, HR 108. The referring team asks whether to restrict fluids before transfer.'],
      example: { case: 'Interpret.', steps: [
        'High urine output, high urine sodium and hypovolaemia after SAH: cerebral salt wasting.',
        'Do not fluid restrict — hypovolaemia worsens vasospasm and delayed ischaemia.',
        'Isotonic or hypertonic saline; fludrocortisone per receiving team.',
        'Correct by no more than 8–10 mmol/L in 24 h unless symptomatic; recheck sodium every 4–6 h.',
      ] },
    },
  ],
  keyPoints: [
    'Low sodium worsens cerebral oedema; aim high-normal in brain injury.',
    'SIADH: euvolaemic, restrict (not in SAH). CSW: hypovolaemic, give salt. DI: high sodium, dilute polyuria, desmopressin.',
    'Correct chronic hyponatraemia ≤ 8–10 mmol/L/24 h; seizures need 3 % saline bolus.',
    'Glucose < 2.8 excludes thrombolysis until corrected; target 7.8–10 in stroke.',
    'Lysis thresholds: platelets ≥ 100, INR ≤ 1.7; only glucose is required before starting.',
  ],
  pearls: ['Osmolar gap > 20 suggests mannitol accumulation.', 'DI after severe TBI may signal brain death.'],
  pitfalls: ['Fluid restricting cerebral salt wasting.', 'Over-rapid correction of chronic hyponatraemia.'],
  live: [{ id: 'hypona', label: 'Hyponatraemia' }, { id: 'moa-hypertonic', label: 'Hypertonic saline: mechanism' }],
  questions: [
    { q: 'Hyponatraemia in brain injury worsens:', options: ['Dehydration', 'Cerebral oedema', 'Hypertension', 'Coagulation'], answer: 1, why: 'Water moves into the brain.' },
    { q: 'SIADH is characterised by:', options: ['Hypovolaemia, high urine output', 'Euvolaemic hyponatraemia, concentrated urine', 'Hypernatraemia', 'Dilute urine'], answer: 1, why: 'Inappropriate ADH.' },
    { q: 'Cerebral salt wasting is treated with:', options: ['Fluid restriction', 'Saline and fludrocortisone', 'Desmopressin', 'Furosemide'], answer: 1, why: 'Replace salt and volume.' },
    { q: 'Central diabetes insipidus produces:', options: ['Concentrated urine', 'Large volumes of dilute urine with rising sodium', 'Hyponatraemia', 'Oliguria'], answer: 1, why: 'Loss of ADH.' },
    { q: 'DI is treated with:', options: ['Fluid restriction', 'Desmopressin and water replacement', 'Hypertonic saline', 'Insulin'], answer: 1, why: 'Replace ADH and water.' },
    { q: 'Maximum correction of chronic hyponatraemia:', options: ['20 mmol/L/24 h', '8–10 mmol/L/24 h', '1 mmol/L/24 h', 'No limit'], answer: 1, why: 'Avoid osmotic demyelination.' },
    { q: 'Hyponatraemic seizures are treated with:', options: ['Fluid restriction', '3 % saline 100–150 mL bolus', 'Free water', 'Desmopressin'], answer: 1, why: 'Raise Na⁺ by 4–6 rapidly.' },
    { q: 'Calculated osmolality:', options: ['Na⁺ + K⁺', '2 × Na⁺ + glucose + urea', 'Na⁺ × 3', 'Glucose ÷ 18'], answer: 1, why: 'Standard formula (mmol/L).' },
    { q: 'An osmolar gap > 20 during mannitol suggests:', options: ['Normal therapy', 'Mannitol accumulation', 'Hyponatraemia', 'Dehydration only'], answer: 1, why: 'Risk of AKI.' },
    { q: 'Glucose below which thrombolysis is excluded until corrected:', options: ['5.0 mmol/L', '2.8 mmol/L (50 mg/dL)', '10 mmol/L', '1.0 mmol/L'], answer: 1, why: 'Stroke mimic.' },
    { q: 'The only test required before starting thrombolysis (no history of coagulopathy):', options: ['INR', 'Glucose', 'Platelets', 'Troponin'], answer: 1, why: 'Others need not delay therapy.' },
    { q: 'Platelet threshold for thrombolysis:', options: ['≥ 20', '≥ 100 × 10⁹/L', '≥ 400', 'Any'], answer: 1, why: 'Bleeding risk.' },
    { q: 'TBI can cause coagulopathy through:', options: ['Release of brain tissue factor', 'Increased platelets', 'Vitamin K excess', 'Hypernatraemia'], answer: 0, why: 'Consumptive coagulopathy.' },
    { q: 'Sodium target during treatment of raised ICP:', options: ['125–130', 'High-normal, often 140–150', '> 170', '< 135'], answer: 1, why: 'Reduce oedema safely.' },
    { q: 'Urine specific gravity in DI:', options: ['> 1.030', '< 1.005', '1.020', 'Unchanged'], answer: 1, why: 'Dilute urine.' },
  ],
  sources: [
    { title: 'Spasovski G et al. Clinical practice guideline on hyponatraemia. Eur J Endocrinol (2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/24569125/' },
    { title: 'StatPearls: Cerebral salt wasting syndrome', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Cerebral+salt+wasting+syndrome+StatPearls' },
  ],
};

export const NEURO_PHARM: FpcLesson = {
  id: 'fpc-neuro-pharm', domain: 'neuro', ref: 'V.11',
  title: 'Neurological pharmacology',
  summary: 'The drugs of neurocritical transport: osmotic agents, antihypertensives for stroke and haemorrhage, anti-epileptics, sedation and analgesia that preserve the neurological exam, thrombolytics and reversal agents, and nimodipine.',
  objectives: [
    'Choose and dose osmotic agents and antihypertensives for neurological emergencies.',
    'Select sedation and anti-epileptic drugs appropriate to brain injury.',
    'Use thrombolytics and anticoagulant reversal agents safely.',
  ],
  sections: [
    {
      id: 'osmotic', title: 'Osmotic agents and antihypertensives', core: true,
      body: [
        'Hypertonic saline (3 % 250 mL over 15–20 minutes, or 23.4 % 30 mL via central line) draws water from brain tissue across an intact blood–brain barrier and expands intravascular volume; it is preferred in hypotensive patients. Peripheral 3 % saline is acceptable in emergencies. Mannitol (0.5–1 g/kg of 20 %) works within 15–30 minutes, also improves blood rheology, and causes an osmotic diuresis — replace urine losses to avoid hypotension; it crystallises when cold, so use an inline filter.',
        'Labetalol (10–20 mg IV over 1–2 minutes, repeated or as an infusion) is a combined alpha and beta blocker — avoid in bradycardia, heart block or bronchospasm. Nicardipine (5 mg/h, increased by 2.5 mg/h every 5–15 minutes to 15 mg/h) is a titratable calcium channel blocker that does not slow the heart. Clevidipine (1–2 mg/h, doubled every 90 seconds initially) has an ultra-short half-life and comes in a lipid emulsion. Avoid nitroprusside and nitroglycerin in raised ICP — they dilate cerebral vessels.',
      ],
    },
    {
      id: 'sedation', title: 'Sedation, analgesia and anti-epileptics', core: true,
      body: [
        'Propofol reduces cerebral metabolic rate and ICP, is short acting (allowing neurological checks) and has anticonvulsant effects, but causes hypotension — which may reduce CPP. Midazolam is anticonvulsant and haemodynamically gentler but accumulates. Ketamine supports blood pressure and does not raise ICP meaningfully in ventilated patients. Fentanyl provides analgesia and blunts the response to suctioning. Dexmedetomidine allows rousable sedation but can cause bradycardia and hypotension.',
        'Anti-epileptic drugs: levetiracetam (seizure prophylaxis in severe TBI for 7 days, or loading 60 mg/kg for status) has few interactions and no haemodynamic effects; phenytoin/fosphenytoin (20 mg PE/kg) requires cardiac monitoring because of hypotension and arrhythmia, particularly with rapid phenytoin; valproate is avoided in liver disease and pregnancy. Benzodiazepines remain first line for active seizures.',
      ],
      table: {
        caption: 'Neuro drugs at a glance',
        head: ['Drug', 'Dose (adult)', 'Key point'],
        rows: [['3 % saline', '250 mL over 15–20 min', 'Preferred if hypotensive'], ['Mannitol 20 %', '0.5–1 g/kg', 'Diuresis; filter; check osmolality'], ['Labetalol', '10–20 mg IV, repeat', 'Avoid in bradycardia/asthma'], ['Nicardipine', '5–15 mg/h', 'No bradycardia; titratable'], ['Levetiracetam', '60 mg/kg (status); 500–1000 mg bd (prophylaxis)', 'Few interactions'], ['Nimodipine', '60 mg enteral q4h', 'SAH only; watch BP'], ['Alteplase', '0.9 mg/kg, max 90 mg', '10 % bolus, rest over 60 min'], ['Tenecteplase', '0.25 mg/kg, max 25 mg', 'Single bolus']],
      },
    },
    {
      id: 'reversal', title: 'Thrombolytics and reversal', core: true,
      body: [
        'Thrombolytics convert plasminogen to plasmin, which breaks down fibrin. Alteplase requires an infusion; tenecteplase is more fibrin-specific and given as a single bolus, which simplifies transfer. After either, avoid antiplatelets and anticoagulants for 24 hours and avoid arterial punctures at non-compressible sites. For symptomatic haemorrhage after lysis: stop the infusion, give cryoprecipitate (10 units) and consider tranexamic acid 1 g.',
        'Anticoagulant reversal in intracranial haemorrhage: warfarin — 4-factor PCC (25–50 units/kg by INR and weight) plus vitamin K 10 mg IV; dabigatran — idarucizumab 5 g IV; apixaban and rivaroxaban — andexanet alfa or PCC 50 units/kg per protocol; unfractionated heparin — protamine 1 mg per 100 units given in the past 2–3 hours (maximum 50 mg); enoxaparin — protamine partially reverses it.',
      ],
    },
    {
      id: 'case', title: 'Transport case: choosing the antihypertensive',
      body: ['A 61-year-old with an acute left thalamic ICH: GCS 13, BP 214/118, HR 48 (sinus bradycardia), history of asthma. The receiving team wants SBP about 140.'],
      example: { case: 'Choose the agent.', steps: [
        'Labetalol is a poor choice: bradycardia and asthma.',
        'Nicardipine infusion at 5 mg/h, increased by 2.5 mg/h every 5–15 min, or clevidipine — no effect on heart rate.',
        'Aim for a controlled fall toward 140 without overshooting below 130; arterial line if available.',
        'Check anticoagulant use; neuro checks every 15 minutes.',
      ] },
    },
  ],
  keyPoints: [
    'Hypertonic saline preferred over mannitol if hypotensive; mannitol needs a filter and osmolality checks.',
    'Labetalol avoided in bradycardia/asthma; nicardipine and clevidipine are titratable and rate-neutral.',
    'Avoid nitrates and nitroprusside in raised ICP.',
    'Propofol lowers ICP but drops BP; ketamine supports BP.',
    'Tenecteplase single bolus; reverse anticoagulants specifically in ICH.',
  ],
  pearls: ['Cold mannitol crystallises — use a filter.', 'Fosphenytoin needs cardiac monitoring.'],
  pitfalls: ['Nitroglycerin for BP in raised ICP.', 'Large propofol boluses dropping CPP.'],
  live: [{ id: 'moa-nicardipine', label: 'Nicardipine: mechanism' }, { id: 'moa-mannitol', label: 'Mannitol: mechanism' }, { id: 'moa-thrombolytic', label: 'Thrombolytics: mechanism' }],
  questions: [
    { q: 'Osmotic agent preferred in a hypotensive patient:', options: ['Mannitol', 'Hypertonic saline', 'Furosemide', 'Albumin'], answer: 1, why: 'Expands volume.' },
    { q: 'Mannitol should be given through:', options: ['A warmer only', 'An inline filter', 'An arterial line', 'An NG tube'], answer: 1, why: 'Mannitol can crystallise when cold.' },
    { q: 'Antihypertensive best avoided with bradycardia and asthma:', options: ['Nicardipine', 'Labetalol', 'Clevidipine', 'Hydralazine'], answer: 1, why: 'Beta blockade.' },
    { q: 'Nicardipine starting rate:', options: ['0.5 mg/h', '5 mg/h', '50 mg/h', '15 mg/h'], answer: 1, why: 'Titrate by 2.5 mg/h.' },
    { q: 'Drugs avoided in raised ICP because they dilate cerebral vessels:', options: ['Labetalol', 'Nitroglycerin and nitroprusside', 'Nicardipine', 'Esmolol'], answer: 1, why: 'Raise cerebral blood volume.' },
    { q: 'Propofol in brain injury:', options: ['Raises ICP', 'Lowers ICP and metabolic rate but can drop BP', 'Has no effect', 'Causes seizures'], answer: 1, why: 'Hypotension from propofol can lower CPP.' },
    { q: 'Ketamine in ventilated brain-injured patients:', options: ['Markedly raises ICP', 'Does not meaningfully raise ICP; supports BP', 'Is contraindicated', 'Causes hypotension'], answer: 1, why: 'Updated evidence.' },
    { q: 'Seizure prophylaxis after severe TBI is typically given for:', options: ['1 day', '7 days', '6 months', 'Life'], answer: 1, why: 'Early post-traumatic seizures.' },
    { q: 'Fosphenytoin requires:', options: ['No monitoring', 'Cardiac monitoring', 'Daily EEG', 'Liver biopsy'], answer: 1, why: 'Hypotension and arrhythmia.' },
    { q: 'Tenecteplase in stroke is given as:', options: ['60-min infusion', 'Single bolus 0.25 mg/kg (max 25 mg)', 'Oral', 'Intrathecal'], answer: 1, why: 'Simplifies transfer.' },
    { q: 'Symptomatic haemorrhage after alteplase: give', options: ['Heparin', 'Cryoprecipitate and consider TXA', 'More alteplase', 'Aspirin'], answer: 1, why: 'Replace fibrinogen.' },
    { q: 'Idarucizumab reverses:', options: ['Warfarin', 'Dabigatran', 'Apixaban', 'Heparin'], answer: 1, why: 'Monoclonal antibody fragment.' },
    { q: 'Protamine dose for heparin reversal:', options: ['1 mg per 100 units given recently (max 50 mg)', '10 mg/kg', '100 mg flat', '1 g'], answer: 0, why: 'Standard calculation.' },
    { q: 'Nimodipine is indicated in:', options: ['All strokes', 'Aneurysmal SAH', 'TBI', 'Seizures'], answer: 1, why: 'Reduces delayed ischaemia.' },
    { q: 'Antiplatelets and anticoagulants after thrombolysis are avoided for:', options: ['1 hour', '24 hours', '1 week', 'Not avoided'], answer: 1, why: 'Bleeding risk.' },
  ],
  sources: [
    { title: 'AHA/ASA Guidelines for early management of acute ischemic stroke (2019)', url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000211' },
    { title: 'Neurocritical Care Society: Guideline for reversal of antithrombotics in ICH (2016)', url: 'https://pubmed.ncbi.nlm.nih.gov/26714677/' },
  ],
};

export const ICP_MONITOR: FpcLesson = {
  id: 'fpc-icp-monitor', domain: 'neuro', ref: 'V.12',
  title: 'Neuro monitoring: ICP monitors, waveforms and troubleshooting',
  summary: 'Parenchymal and ventricular ICP monitors, the ICP waveform and compliance, interpreting trends and pressure waves, and practical troubleshooting at altitude.',
  objectives: [
    'Compare intraparenchymal monitors with EVDs.',
    'Interpret the ICP waveform and recognise poor compliance.',
    'Troubleshoot ICP monitoring during transport.',
  ],
  sections: [
    {
      id: 'devices', title: 'Types of ICP monitor', core: true,
      body: [
        'An external ventricular drain (EVD) in the lateral ventricle is the reference standard: it measures global ICP accurately and drains CSF to treat raised pressure. It can be re-zeroed, but it carries infection (ventriculitis) and haemorrhage risk, and it reads ICP accurately only when clamped (closed to drainage) — many units read ICP intermittently by clamping briefly.',
        'An intraparenchymal fibre-optic or strain-gauge monitor ("bolt") sits in brain tissue. It is easier to place, has lower infection risk and reads continuously, but it cannot drain CSF and cannot be re-zeroed after insertion, so readings drift over days. It is zeroed to atmosphere before insertion only. Its monitor box and cable must travel with the patient.',
        'Indications in TBI include a GCS 3–8 with an abnormal CT, or a normal CT with two of: age over 40, motor posturing, or SBP below 90. Monitoring also guides care in poor-grade SAH, large ICH with hydrocephalus, and acute liver failure with encephalopathy.',
      ],
    },
    {
      id: 'waveform', title: 'The ICP waveform', core: true,
      body: [
        'The ICP waveform has three peaks within each cardiac cycle: P1 (percussion wave, from arterial pulsation), P2 (tidal wave, reflecting brain compliance) and P3 (dicrotic wave, aortic valve closure). Normally P1 > P2 > P3. When P2 rises above P1, compliance is poor — the brain has exhausted its compensatory reserve, and small volume changes will cause large rises in pressure. This often precedes a sustained rise in ICP.',
        'Lundberg A waves (plateau waves) are sustained rises to 50–100 mmHg lasting 5–20 minutes, indicating critically reduced compliance and impending herniation; they demand immediate treatment. B waves are rhythmic oscillations every 0.5–2 minutes, associated with changing breathing patterns and reduced compliance. C waves are small and of little significance.',
        'A dampened, flat waveform suggests a blocked catheter, air in the line (EVD), a closed stopcock, or ventricular collapse from over-drainage — not necessarily a low ICP.',
      ],
      table: {
        caption: 'ICP numbers and waves',
        head: ['Finding', 'Meaning', 'Action'],
        rows: [['ICP 5–15 mmHg', 'Normal', 'Monitor'], ['ICP > 22 mmHg', 'Treatment threshold (TBI)', 'Neuroprotective bundle, osmotherapy, CSF drainage'], ['P2 > P1', 'Poor compliance', 'Anticipate rise; optimise'], ['Lundberg A (plateau) waves', 'Critical compliance; herniation risk', 'Treat immediately'], ['Flat/dampened trace', 'Blocked catheter, closed stopcock, air', 'Troubleshoot system']],
      },
    },
    {
      id: 'trouble', title: 'Troubleshooting in transport', core: true,
      body: [
        'Before departure: confirm the type of monitor, the current ICP and CPP targets, EVD drainage level and plan (clamped or open, and at what pressure to drain), the transport monitor\'s compatibility with the device, spare cables, and a written plan from the neurosurgical team for rising ICP.',
        'In flight: re-level the EVD to the tragus after every position change; watch the waveform, not just the number; respond to sustained ICP above threshold with the neuroprotective bundle before assuming the monitor is wrong. Vibration and motion create artefact — look for a persistent change across several minutes. Altitude has no direct effect on a sealed parenchymal monitor reading, but pneumocephalus (air in the skull) expands on ascent and can raise ICP; consider a lower cabin altitude.',
        'Other neuro monitoring the receiving team may use: brain tissue oxygen (PbtO₂, target > 20 mmHg), jugular venous oxygen saturation (SjvO₂ 55–75 %), continuous EEG for non-convulsive seizures, and transcranial Doppler for vasospasm. Pupillometry gives an objective pupillary reactivity score (the Neurological Pupil index) and can detect deterioration earlier than a penlight.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the waveform changes',
      body: ['A patient with severe TBI and a parenchymal ICP monitor reads ICP 18 mmHg, but over 20 minutes the P2 peak has risen above P1. Then the ICP climbs to 48 and stays there for 8 minutes. MAP 84.'],
      example: { case: 'Interpret and act.', steps: [
        'P2 > P1: poor compliance — the warning.',
        'Sustained ICP 48 for minutes: a plateau (Lundberg A) wave; CPP = 84 − 48 = 36 — critical.',
        'Immediate bundle: head up, neck free, sedation/paralysis, EtCO₂ 35 (brief 30–35 if herniation signs), hypertonic saline; vasopressor to restore CPP.',
        'Check pupils; notify the receiving neurosurgeon — may need CT and decompression on arrival.',
      ] },
    },
  ],
  keyPoints: [
    'EVD: measures and drains, gold standard, infection risk; reads accurately when clamped.',
    'Parenchymal bolt: continuous, low infection, cannot drain or re-zero.',
    'P1 > P2 > P3 normally; P2 > P1 = poor compliance.',
    'Lundberg A (plateau) waves = imminent herniation — treat.',
    'A flat trace is a system problem until proven otherwise.',
  ],
  pearls: ['Pneumocephalus expands on ascent.', 'PbtO₂ target > 20 mmHg.'],
  pitfalls: ['Trusting the number without the waveform.', 'Forgetting to re-level the EVD after moving the patient.'],
  live: [{ id: 'neuro-icp', label: 'ICP and waveforms on the live model' }],
  questions: [
    { q: 'The reference standard ICP monitor:', options: ['Parenchymal bolt', 'External ventricular drain', 'Lumbar drain', 'Epidural sensor'], answer: 1, why: 'Measures and drains.' },
    { q: 'A parenchymal monitor:', options: ['Can drain CSF', 'Cannot be re-zeroed after insertion', 'Has higher infection risk than an EVD', 'Is placed in the ventricle'], answer: 1, why: 'Zeroed before insertion only.' },
    { q: 'P2 in the ICP waveform reflects:', options: ['Arterial pulsation', 'Brain compliance', 'Aortic valve closure', 'Breathing'], answer: 1, why: 'Tidal wave.' },
    { q: 'P2 higher than P1 indicates:', options: ['Normal', 'Poor compliance', 'Blocked catheter', 'Low ICP'], answer: 1, why: 'Reduced reserve.' },
    { q: 'Lundberg A waves are:', options: ['Small oscillations', 'Plateau waves to 50–100 mmHg for 5–20 min', 'Normal respiratory waves', 'Artefact'], answer: 1, why: 'Critical compliance.' },
    { q: 'A flat, dampened ICP trace most likely means:', options: ['ICP is zero', 'A system problem (blockage, air, closed stopcock)', 'Brain death', 'Normal ICP'], answer: 1, why: 'Troubleshoot first.' },
    { q: 'ICP monitoring in TBI is indicated for GCS 3–8 with:', options: ['Normal CT and age 20', 'Abnormal CT', 'GCS 15', 'Isolated scalp laceration'], answer: 1, why: 'BTF indication.' },
    { q: 'Normal ICP:', options: ['0–2 mmHg', '5–15 mmHg', '25–35 mmHg', '> 40 mmHg'], answer: 1, why: 'Adult supine.' },
    { q: 'An EVD reads ICP accurately when:', options: ['Open to drain', 'Clamped (closed to drainage)', 'Removed', 'Elevated'], answer: 1, why: 'Open drainage dampens readings.' },
    { q: 'Brain tissue oxygen target:', options: ['> 5 mmHg', '> 20 mmHg', '> 100 mmHg', '< 10 mmHg'], answer: 1, why: 'Avoid tissue hypoxia.' },
    { q: 'Pneumocephalus at altitude:', options: ['Shrinks', 'Expands and may raise ICP', 'Unchanged', 'Resolves'], answer: 1, why: 'Boyle\'s law.' },
    { q: 'Normal waveform peak order:', options: ['P3 > P2 > P1', 'P1 > P2 > P3', 'P2 > P1 > P3', 'All equal'], answer: 1, why: 'Normal compliance.' },
    { q: 'Jugular venous saturation (SjvO₂) normal range:', options: ['20–30 %', '55–75 %', '95–100 %', '40 %'], answer: 1, why: 'Global cerebral extraction.' },
    { q: 'Pupillometry offers:', options: ['ICP measurement', 'Objective pupillary reactivity scoring', 'EEG', 'Blood flow'], answer: 1, why: 'Neurological Pupil index.' },
    { q: 'A sustained ICP rise during flight should first prompt:', options: ['Assuming the monitor is wrong', 'Applying the neuroprotective bundle while checking the system', 'Ignoring it', 'Removing the monitor'], answer: 1, why: 'Treat the patient.' },
  ],
  sources: [
    { title: 'Brain Trauma Foundation: Guidelines (4th ed.) — ICP monitoring', url: 'https://braintrauma.org/coma/guidelines' },
    { title: 'StatPearls: Intracranial pressure monitoring', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Intracranial+pressure+monitoring+StatPearls' },
  ],
};
