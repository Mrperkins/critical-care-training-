/** FP-C V.1–V.3: neurological assessment; seizures; altered mental status. */
import type { FpcLesson } from '../types';

export const NEURO_ASSESS: FpcLesson = {
  id: 'fpc-neuro-assess', domain: 'neuro', ref: 'V.1',
  title: 'Neurological assessment: GCS, pupils, herniation and stroke scales',
  summary: 'A reproducible neurological examination for transport: GCS and its pitfalls, pupils, lateralising signs, herniation syndromes, stroke and LVO scales, and how to hand over a neuro exam that the next team can compare against.',
  objectives: [
    'Score the GCS accurately and report its components.',
    'Recognise the signs of raised intracranial pressure and herniation.',
    'Apply a stroke scale and an LVO screen to choose a destination.',
  ],
  sections: [
    {
      id: 'gcs', title: 'The Glasgow Coma Scale', core: true,
      body: [
        'The GCS scores eye opening (1–4), verbal response (1–5) and motor response (1–6), from 3 to 15. Report the components, not just the total: "E2 V2 M5 = 9" tells the receiving team far more than "GCS 9", and the motor score carries the most prognostic weight. A GCS of 8 or less is the conventional definition of coma and severe brain injury.',
        'Score the best response, using a central stimulus (trapezius squeeze or supraorbital pressure) for motor and a peripheral stimulus (fingernail pressure) for eye opening. Localising means the hand moves above the clavicle toward a central stimulus. Abnormal flexion (decorticate, M3) and extension (decerebrate, M2) indicate severe injury; extension is worse. If a limb is injured or the patient is intubated, record "T" for verbal (for example E3 VT M6) rather than guessing.',
        'Sedatives, paralytics, alcohol, hypoglycaemia, hypoxia, hypotension and post-ictal states all lower the GCS. Record the best GCS before you give drugs — once a patient is intubated and paralysed, the pre-intubation examination is the last neurological examination anyone will have for hours. A fall of 2 or more points, or of 1 point in the motor score, is significant deterioration.',
      ],
      table: {
        caption: 'Glasgow Coma Scale',
        head: ['Score', 'Eyes', 'Verbal', 'Motor'],
        rows: [['6', '—', '—', 'Obeys commands'], ['5', '—', 'Oriented', 'Localises'], ['4', 'Spontaneous', 'Confused', 'Withdraws (normal flexion)'], ['3', 'To voice', 'Inappropriate words', 'Abnormal flexion (decorticate)'], ['2', 'To pressure', 'Sounds', 'Extension (decerebrate)'], ['1', 'None', 'None', 'None']],
      },
    },
    {
      id: 'pupils', title: 'Pupils, lateralising signs and herniation', core: true,
      body: [
        'Check size, symmetry and reactivity. A unilateral fixed, dilated pupil in a patient with a reduced GCS suggests compression of the oculomotor nerve by uncal (transtentorial) herniation, usually on the side of the mass. Bilateral fixed, dilated pupils suggest severe herniation or global hypoxic injury — but also occur with atropine, sympathomimetics and severe hypothermia. Pinpoint pupils suggest opioids or a pontine lesion.',
        'Lateralising signs — weakness on one side, asymmetric motor response, a unilateral dilated pupil — point to a focal lesion such as a haematoma that may need surgery. The Cushing response (hypertension with a widening pulse pressure, bradycardia and irregular breathing) is a late sign of raised intracranial pressure and impending herniation.',
        'Herniation is an emergency treated in transport: elevate the head 30°, ensure oxygenation and normal blood pressure, give hyperosmolar therapy (hypertonic saline or mannitol), and use brief hyperventilation to an EtCO₂ of about 30–35 mmHg as a bridge to surgery. Expedite transfer to a neurosurgical centre.',
      ],
    },
    {
      id: 'stroke', title: 'Stroke scales and LVO screens', core: true,
      body: [
        'The NIH Stroke Scale (NIHSS) scores consciousness, gaze, visual fields, facial palsy, limb strength, ataxia, sensation, language, dysarthria and neglect, from 0 to 42. A score of 6 or more raises the probability of a large-vessel occlusion. Prehospital scales are shorter: the Cincinnati and BE-FAST screens identify stroke, while LVO scales — RACE, LAMS, VAN, FAST-ED — estimate the likelihood of a large-vessel occlusion to guide transport to a thrombectomy-capable centre.',
        'Document the last known well time — the last time the patient was seen at their normal baseline, not the time they were found. For a patient who woke with symptoms, last known well is when they went to sleep. Obtain a glucose: hypoglycaemia mimics stroke. Record anticoagulant use and get a contact number for a family member who can confirm history and consent.',
        'Repeat the examination at fixed intervals and after any change, and hand over a comparable baseline: the same scale, the same components, the time of each exam and the drugs given in between.',
      ],
      list: { caption: 'BE-FAST', items: ['Balance — sudden loss of balance or coordination', 'Eyes — sudden visual loss or double vision', 'Face — facial droop', 'Arm — arm drift or weakness', 'Speech — slurred or abnormal speech', 'Time — note last known well and call ahead'] },
    },
    {
      id: 'case', title: 'Transport case: the GCS that changes',
      body: ['A 52-year-old fell from a ladder. At the scene: E3 V4 M6 (13). On arrival at the rural hospital: E2 V2 M5 (9), right pupil 6 mm and sluggish, left 3 mm, BP 172/84, HR 58. CT shows a right temporal biconvex haematoma.'],
      example: { case: 'Interpret and act.', steps: [
        'A 4-point fall with a motor drop, a unilateral dilated pupil and Cushing signs: uncal herniation from an epidural haematoma.',
        'Intubate after documenting the pre-intubation exam (E2 V2 M5, pupils).',
        'Head up 30°, SpO₂ ≥ 94 %, SBP ≥ 110; hypertonic saline or mannitol; brief hyperventilation to EtCO₂ 30–35 as a bridge.',
        'Direct to neurosurgery for evacuation; call ahead.',
      ] },
    },
  ],
  keyPoints: [
    'Report GCS components; motor score carries the most weight.',
    'Record the best pre-intubation exam before drugs.',
    'Unilateral fixed dilated pupil + falling GCS = uncal herniation until proven otherwise.',
    'Cushing response (hypertension, bradycardia, irregular breathing) is late.',
    'Last known well, glucose and an LVO scale guide stroke destination.',
  ],
  pearls: ['Localising = hand crosses the clavicle toward the stimulus.', 'Wake-up stroke: last known well is bedtime.'],
  pitfalls: ['Scoring GCS after sedation and reporting it as the baseline.', 'Calling bilateral dilated pupils "brain death" after atropine.'],
  live: [{ id: 'neuro-icp', label: 'Intracranial pressure on the live model' }, { id: 'neuro-time-is-brain', label: 'Time is brain' }],
  questions: [
    { q: 'GCS motor score for abnormal flexion (decorticate):', options: ['2', '3', '4', '5'], answer: 1, why: 'Withdrawal is 4; extension is 2.' },
    { q: 'The GCS component with most prognostic value:', options: ['Eyes', 'Verbal', 'Motor', 'Pupils'], answer: 2, why: 'Motor is most predictive.' },
    { q: 'Coma is conventionally defined as GCS:', options: ['≤ 13', '≤ 8', '≤ 3', '≤ 10'], answer: 1, why: 'Severe brain injury threshold.' },
    { q: 'An intubated patient opens eyes to voice and obeys commands:', options: ['E3 V1 M6', 'E3 VT M6', 'E4 V5 M6', 'E2 VT M5'], answer: 1, why: 'Record T for verbal when intubated.' },
    { q: 'A unilateral fixed dilated pupil with falling GCS suggests:', options: ['Opioid toxicity', 'Uncal herniation', 'Pontine stroke', 'Hypoglycaemia'], answer: 1, why: 'Oculomotor nerve compression.' },
    { q: 'The Cushing response consists of:', options: ['Hypotension, tachycardia', 'Hypertension, bradycardia, irregular breathing', 'Fever, rash', 'Hypoxia, tachypnoea'], answer: 1, why: 'Late sign of raised ICP.' },
    { q: 'Pinpoint pupils suggest:', options: ['Atropine', 'Opioids or a pontine lesion', 'Uncal herniation', 'Sympathomimetics'], answer: 1, why: 'Opioids and pontine lesions constrict the pupils.' },
    { q: 'A significant GCS deterioration is a fall of:', options: ['Any change', '≥ 2 points overall or 1 in motor', '5 points only', 'None — GCS is unreliable'], answer: 1, why: 'Triggers reassessment and action.' },
    { q: '"Last known well" for a patient found with symptoms at 07:00 after sleeping from 23:00:', options: ['07:00', '23:00', 'Midnight', 'Unknown'], answer: 1, why: 'Last time seen normal.' },
    { q: 'Brief hyperventilation for herniation targets EtCO₂ of about:', options: ['20', '30–35 mmHg', '45', '50'], answer: 1, why: 'Temporising bridge only.' },
    { q: 'An NIHSS of ≥ 6 suggests:', options: ['TIA', 'Higher likelihood of large-vessel occlusion', 'Haemorrhage', 'Seizure'], answer: 1, why: 'LVO screening threshold.' },
    { q: 'A stroke mimic to exclude immediately:', options: ['Hypoglycaemia', 'Hyperkalaemia', 'Anaemia', 'Hypothyroidism'], answer: 0, why: 'Check glucose.' },
    { q: 'Localising to pain is scored:', options: ['M4', 'M5', 'M6', 'M3'], answer: 1, why: 'Purposeful movement to stimulus.' },
    { q: 'Bilateral fixed dilated pupils can occur after:', options: ['Atropine', 'Naloxone', 'Ondansetron', 'Paracetamol'], answer: 0, why: 'Drug effect — interpret with care.' },
    { q: 'An LVO scale\'s main use in transport is:', options: ['Diagnosing haemorrhage', 'Choosing a thrombectomy-capable destination', 'Calculating tPA dose', 'Scoring GCS'], answer: 1, why: 'Destination decisions.' },
  ],
  sources: [
    { title: 'Teasdale G et al. The Glasgow Coma Scale at 40 years. Lancet Neurol (2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Teasdale+Glasgow+Coma+Scale+at+40+years' },
    { title: 'StatPearls: NIH Stroke Scale', url: 'https://www.ncbi.nlm.nih.gov/books/?term=NIH+Stroke+Scale+StatPearls' },
    { title: 'StatPearls: Brain herniation', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Brain+herniation+StatPearls' },
  ],
};

export const SEIZURES: FpcLesson = {
  id: 'fpc-seizures', domain: 'neuro', ref: 'V.2',
  title: 'Seizures and status epilepticus',
  summary: 'Recognising seizures and status epilepticus, the timed treatment pathway, causes to correct, non-convulsive status in the paralysed patient, and seizure risk in the aircraft.',
  objectives: [
    'Define status epilepticus and follow a timed treatment pathway.',
    'Identify and correct provoking causes.',
    'Manage seizures in intubated and paralysed patients during transport.',
  ],
  sections: [
    {
      id: 'define', title: 'Definitions and danger', core: true,
      body: [
        'Status epilepticus is a seizure lasting 5 minutes or more, or two or more seizures without full recovery between them. The 5-minute threshold reflects the point at which seizures are unlikely to stop on their own; by 30 minutes, neuronal injury begins. GABA-A receptors are internalised as seizures continue, which is why benzodiazepines lose effect over time — early, adequate dosing matters most.',
        'Convulsive status causes hypoxia, aspiration, hyperthermia, lactic acidosis, rhabdomyolysis and injury. Non-convulsive status — ongoing electrical seizure without visible convulsions — presents as unexplained coma or confusion, subtle twitching or eye deviation. It is common after convulsive status and is invisible in a paralysed patient.',
        'Not every event is a seizure: syncope with brief jerking, psychogenic non-epileptic events, rigors and posturing from raised ICP can look similar. Treat a prolonged convulsion as a seizure when in doubt.',
      ],
    },
    {
      id: 'treat', title: 'The timed treatment pathway', core: true,
      body: [
        'Stabilise (0–5 minutes): airway positioning, oxygen, suction, glucose check, IV or IO access, monitoring. Give thiamine before glucose in malnourished or alcohol-dependent patients.',
        'First line (5–20 minutes): a benzodiazepine at full dose — IV lorazepam 0.1 mg/kg (up to 4 mg, repeat once), IM midazolam 10 mg for adults over 40 kg (5 mg for 13–40 kg), or IV diazepam. IM midazolam was at least as effective as IV lorazepam in the prehospital RAMPART trial, because it avoids delays for IV access. Under-dosing is the commonest error.',
        'Second line (20–40 minutes): levetiracetam 60 mg/kg (max 4500 mg), fosphenytoin 20 mg PE/kg, or valproate 40 mg/kg — these were equally effective in the ESETT trial. Third line (refractory status): intubation and an anaesthetic infusion — midazolam, propofol or ketamine — ideally with EEG monitoring at the receiving centre.',
      ],
      table: {
        caption: 'Status epilepticus pathway (adult)',
        head: ['Phase', 'Time', 'Treatment'],
        rows: [['Stabilise', '0–5 min', 'ABCs, O₂, glucose, access, thiamine if indicated'], ['First line', '5–20 min', 'Lorazepam 0.1 mg/kg IV or midazolam 10 mg IM (repeat once)'], ['Second line', '20–40 min', 'Levetiracetam 60 mg/kg, fosphenytoin 20 mg PE/kg, or valproate 40 mg/kg'], ['Refractory', '> 40 min', 'Intubate; midazolam, propofol or ketamine infusion']],
      },
    },
    {
      id: 'causes', title: 'Causes to find and fix', core: true,
      body: [
        'Correct what is correctable: hypoglycaemia (dextrose), hyponatraemia (3 % saline 100–150 mL bolus for seizures from severe hyponatraemia), hypocalcaemia and hypomagnesaemia, hypoxia, and eclampsia (magnesium sulfate 4–6 g IV, not benzodiazepines alone, in a pregnant or recently delivered patient beyond 20 weeks).',
        'Toxicological causes include withdrawal from alcohol or benzodiazepines, tricyclic antidepressants (give sodium bicarbonate for wide QRS), isoniazid (pyridoxine), sympathomimetics, and bupropion. Structural causes — trauma, stroke, haemorrhage, tumour, infection (meningitis, encephalitis) — need imaging and specific treatment; a first seizure with a focal onset, fever, headache or head injury needs a CT.',
        'Non-adherence to anti-epileptic drugs is the most common cause of status in people with known epilepsy. Bring the medication list and levels if drawn.',
      ],
    },
    {
      id: 'transport', title: 'Seizures in the aircraft',
      body: [
        'Flicker vertigo — light flashing through rotor blades at 4–20 Hz — can provoke seizures in susceptible patients; shade the patient\'s eyes. Hypoxia at altitude lowers the seizure threshold, so maintain oxygenation. Secure the patient and equipment; a seizing patient can dislodge lines and tubes in a confined cabin.',
        'If you paralyse a patient, you remove the only sign of seizure activity. Use long-acting sedation (and an anti-epileptic loading dose) in any patient intubated for status, and watch for unexplained tachycardia, hypertension and pupillary changes that may be the only clue to ongoing seizures. Avoid repeated paralytic doses when they are not needed.',
      ],
    },
  ],
  keyPoints: [
    'Status epilepticus = seizure ≥ 5 min or recurrent without recovery.',
    'Benzodiazepines early and at full dose; IM midazolam 10 mg is as good as IV lorazepam.',
    'Second line: levetiracetam, fosphenytoin or valproate — equally effective.',
    'Correct glucose, sodium, calcium, magnesium; magnesium for eclampsia.',
    'Paralysis hides seizures — sedate and load anti-epileptics.',
  ],
  pearls: ['Shade the eyes to prevent flicker vertigo.', 'Pyridoxine for isoniazid seizures.'],
  pitfalls: ['Repeated small benzodiazepine doses.', 'Paralysing without anti-epileptic cover.'],
  live: [{ id: 'moa-midazolam', label: 'Midazolam: mechanism' }, { id: 'moa-propofol', label: 'Propofol: mechanism' }],
  questions: [
    { q: 'Status epilepticus is a seizure lasting at least:', options: ['1 minute', '5 minutes', '30 minutes', '60 minutes'], answer: 1, why: 'Operational definition for treatment.' },
    { q: 'Benzodiazepines lose effect in prolonged seizures because:', options: ['Liver metabolism speeds up', 'GABA-A receptors are internalised', 'Sodium channels open', 'Blood-brain barrier closes'], answer: 1, why: 'Fewer receptors at the synapse.' },
    { q: 'IM midazolam dose for an adult > 40 kg in status:', options: ['1 mg', '10 mg', '50 mg', '0.5 mg'], answer: 1, why: 'RAMPART dosing.' },
    { q: 'The RAMPART trial showed:', options: ['IM midazolam at least as effective as IV lorazepam', 'Phenytoin superior', 'Diazepam ineffective', 'Ketamine first-line'], answer: 0, why: 'Avoids delay for IV access.' },
    { q: 'ESETT compared second-line agents and found:', options: ['Levetiracetam superior', 'Levetiracetam, fosphenytoin and valproate similar', 'Valproate harmful', 'Phenytoin superior'], answer: 1, why: 'Equivalent efficacy.' },
    { q: 'Levetiracetam loading dose in status:', options: ['10 mg/kg', '60 mg/kg (max 4500 mg)', '1 g flat', '200 mg/kg'], answer: 1, why: 'ESETT dosing.' },
    { q: 'Seizures in a 34-week pregnant patient are treated with:', options: ['Phenytoin', 'Magnesium sulfate', 'Lorazepam alone', 'Propofol only'], answer: 1, why: 'This is eclampsia; magnesium is first line.' },
    { q: 'Isoniazid-induced seizures need:', options: ['Pyridoxine', 'Thiamine', 'Naloxone', 'Flumazenil'], answer: 0, why: 'Replaces depleted B6.' },
    { q: 'Seizures from severe hyponatraemia are treated with:', options: ['Free water', '3 % saline bolus', 'Furosemide', 'Dextrose'], answer: 1, why: 'Raise sodium quickly by a few mmol/L.' },
    { q: 'Flicker vertigo is caused by:', options: ['Noise', 'Light flashing through rotor blades', 'Hypoxia', 'Vibration'], answer: 1, why: 'Shade the eyes.' },
    { q: 'In a paralysed patient, ongoing seizures may show as:', options: ['Convulsions', 'Unexplained tachycardia, hypertension, pupil changes', 'Bradycardia only', 'Nothing ever'], answer: 1, why: 'Non-convulsive status.' },
    { q: 'Refractory status (after two agents) is treated with:', options: ['A third benzodiazepine dose', 'Intubation and anaesthetic infusion', 'Observation', 'Physostigmine'], answer: 1, why: 'Midazolam, propofol or ketamine.' },
    { q: 'Thiamine before glucose is indicated in:', options: ['Children', 'Malnourished or alcohol-dependent patients', 'Everyone', 'Diabetics only'], answer: 1, why: 'Prevents Wernicke encephalopathy.' },
    { q: 'Most common cause of status in known epilepsy:', options: ['Brain tumour', 'Anti-epileptic non-adherence', 'Stroke', 'Fever'], answer: 1, why: 'Low drug levels.' },
    { q: 'TCA overdose seizures with a wide QRS: add', options: ['Sodium bicarbonate', 'Physostigmine', 'Flumazenil', 'Phenytoin'], answer: 0, why: 'Sodium channel blockade.' },
  ],
  sources: [
    { title: 'Glauser T et al. AES guideline: treatment of convulsive status epilepticus. Epilepsy Curr (2016)', url: 'https://pubmed.ncbi.nlm.nih.gov/26900382/' },
    { title: 'RAMPART trial. NEJM (2012)', url: 'https://pubmed.ncbi.nlm.nih.gov/22335736/' },
    { title: 'ESETT trial. NEJM (2019)', url: 'https://pubmed.ncbi.nlm.nih.gov/31774955/' },
  ],
};

export const AMS: FpcLesson = {
  id: 'fpc-ams', domain: 'neuro', ref: 'V.3',
  title: 'Altered mental status: a structured approach',
  summary: 'A systematic approach to the confused or unresponsive patient: immediate threats, the reversible causes, delirium versus dementia, excited delirium, and when altered consciousness demands an airway.',
  objectives: [
    'Assess altered mental status systematically and treat immediately reversible causes.',
    'Distinguish structural from metabolic and toxic causes.',
    'Decide on airway protection and safe sedation for transport.',
  ],
  sections: [
    {
      id: 'approach', title: 'Immediate approach', core: true,
      body: [
        'Altered mental status is a symptom, not a diagnosis. Start with what kills quickly: airway, breathing (hypoxia, hypercapnia), circulation (shock), and the bedside glucose. Hypoglycaemia is the most important single cause to exclude and is treated within minutes. Give naloxone for suspected opioid toxicity with respiratory depression, titrated to breathing rather than full awakening.',
        'A useful framework is AEIOU-TIPS: Alcohol and other toxins; Endocrine, Electrolytes, Encephalopathy (hepatic, uraemic, hypertensive); Insulin (hypo/hyperglycaemia); Oxygen (hypoxia, CO) and Opioids; Uraemia; Trauma, Temperature; Infection (sepsis, meningitis, encephalitis); Psychiatric (a diagnosis of exclusion), Poisons; Seizure (post-ictal, non-convulsive status), Stroke, Shock and Space-occupying lesions.',
        'Focal neurological signs, a unilateral dilated pupil, sudden onset, severe headache, or a history of trauma suggest a structural cause needing CT. Symmetric findings, a gradual onset and abnormal vital signs or labs suggest metabolic or toxic causes.',
      ],
    },
    {
      id: 'delirium', title: 'Delirium, dementia and agitation', core: true,
      body: [
        'Delirium is an acute, fluctuating disturbance of attention and awareness caused by an underlying illness — infection, drugs, hypoxia, urinary retention, pain, metabolic derangement. It can be hyperactive (agitated) or hypoactive (quiet and withdrawn, easily missed). Dementia is chronic and progressive; patients with dementia are at much higher risk of delirium. Ask a carer about the patient\'s baseline: "Is this normal for them?"',
        'Severely agitated patients — from stimulants, psychosis, withdrawal or hyperactive delirium — risk hyperthermia, acidosis, rhabdomyolysis and sudden cardiac arrest, particularly during struggle and physical restraint in the prone position. Treat as a medical emergency: rapid chemical sedation (ketamine 4–5 mg/kg IM or 1–2 mg/kg IV, or midazolam, or droperidol/olanzapine per protocol), then cooling, fluids and monitoring. Avoid prone restraint.',
        'In the aircraft, an agitated patient is a flight safety threat. If the patient cannot be reliably calmed and secured, sedation and sometimes intubation before departure are safer than an in-flight struggle.',
      ],
    },
    {
      id: 'airway', title: 'When altered consciousness needs an airway', core: true,
      body: [
        'A low GCS alone does not mandate intubation — a patient with hypoglycaemia or opioid toxicity who responds to treatment does not need a tube — but loss of airway reflexes, inability to protect against aspiration, hypoventilation, hypoxia, an expected deteriorating course, or the need for transport without the ability to intervene are all reasons to intubate.',
        'Before intubation, document a full neurological examination, and correct glucose and hypoxia first. Choose drugs that preserve blood pressure. After intubation, hand over the pre-intubation GCS and pupils, and the times and doses of all drugs, so that the receiving team can interpret their own examination.',
      ],
      table: {
        caption: 'Structural vs metabolic/toxic clues',
        head: ['Feature', 'Structural', 'Metabolic/toxic'],
        rows: [['Onset', 'Often sudden', 'Often gradual'], ['Focal signs', 'Present', 'Usually absent'], ['Pupils', 'May be asymmetric', 'Usually symmetric (reactive)'], ['Asterixis, myoclonus', 'Unusual', 'Common'], ['Investigation', 'CT', 'Glucose, gas, electrolytes, toxicology']],
      },
    },
    {
      id: 'case', title: 'Transport case: the confused older man',
      body: ['A 78-year-old man is brought in "confused for two days". Temperature 38.6 °C, HR 112, BP 98/60, SpO₂ 93 %, glucose 7.2. He is drowsy, picks at the sheets and cannot keep attention on a conversation. No focal signs. His daughter says he was managing alone a week ago.'],
      example: { case: 'Approach.', steps: [
        'Acute, fluctuating inattention = hypoactive-to-mixed delirium, not dementia.',
        'Sepsis is the likely driver (fever, tachycardia, borderline BP) — cultures, antibiotics, fluids per sepsis bundle.',
        'Check for urinary retention, hypoxia, electrolytes and medications.',
        'Airway: GCS adequate and protecting; monitor and reassess rather than intubate.',
      ] },
    },
  ],
  keyPoints: [
    'Check glucose first; treat hypoxia and shock.',
    'AEIOU-TIPS covers the reversible causes.',
    'Focal signs or sudden onset → structural → CT.',
    'Delirium is acute and fluctuating; find and treat the cause.',
    'Severe agitation is a medical emergency: rapid sedation, cool, avoid prone restraint.',
  ],
  pearls: ['Ask "Is this their normal?"', 'Titrate naloxone to breathing, not wakefulness.'],
  pitfalls: ['Labelling confusion as "psychiatric" before excluding medical causes.', 'Flying an agitated, unsecured patient.'],
  live: [{ id: 'moa-ketamine', label: 'Ketamine: mechanism' }, { id: 'hypona', label: 'Hyponatraemia' }],
  questions: [
    { q: 'The first bedside test in altered mental status:', options: ['CT', 'Glucose', 'Urine drug screen', 'EEG'], answer: 1, why: 'Hypoglycaemia is quickly reversible.' },
    { q: 'Naloxone is titrated to:', options: ['Full wakefulness', 'Adequate breathing', 'Pupil size', 'Heart rate'], answer: 1, why: 'Avoid precipitated withdrawal.' },
    { q: 'A clue suggesting a structural cause:', options: ['Asterixis', 'Focal neurological signs', 'Symmetric reactive pupils', 'Gradual onset'], answer: 1, why: 'Points to a lesion.' },
    { q: 'Delirium is characterised by:', options: ['Chronic progressive decline', 'Acute fluctuating inattention', 'Normal attention', 'Focal weakness'], answer: 1, why: 'Underlying illness.' },
    { q: 'Hypoactive delirium is:', options: ['Easily recognised', 'Often missed — quiet and withdrawn', 'Always due to alcohol', 'Not real'], answer: 1, why: 'Quiet presentation.' },
    { q: 'IM ketamine dose for severe agitation:', options: ['0.1 mg/kg', '4–5 mg/kg', '20 mg/kg', '0.01 mg/kg'], answer: 1, why: 'Rapid dissociation.' },
    { q: 'Prone restraint of an agitated patient risks:', options: ['Improved breathing', 'Sudden cardiac arrest', 'Hypothermia', 'Nothing'], answer: 1, why: 'Restricted ventilation and acidosis.' },
    { q: 'A low GCS from hypoglycaemia that corrects with dextrose:', options: ['Requires intubation', 'Does not require intubation', 'Requires CT before treatment', 'Requires naloxone'], answer: 1, why: 'Treat the cause.' },
    { q: 'In AEIOU-TIPS, "I" stands for:', options: ['Infection', 'Insulin (glucose disorders)', 'Ischaemia', 'Injury'], answer: 1, why: 'Hypo/hyperglycaemia.' },
    { q: 'Asterixis suggests:', options: ['Stroke', 'Metabolic encephalopathy', 'Epidural haematoma', 'Spinal injury'], answer: 1, why: 'Hepatic, uraemic or CO₂ encephalopathy.' },
    { q: 'Before intubating a patient with AMS, you should:', options: ['Skip the neuro exam', 'Document a full neurological exam and correct glucose', 'Give paralytic first', 'Wait for CT'], answer: 1, why: 'Last reliable exam.' },
    { q: 'A psychiatric cause of altered mental status is:', options: ['The first assumption', 'A diagnosis of exclusion', 'Never possible', 'Confirmed by glucose'], answer: 1, why: 'Exclude medical causes first.' },
    { q: 'Patients with dementia are:', options: ['Immune to delirium', 'At higher risk of delirium', 'Always delirious', 'Unaffected by infection'], answer: 1, why: 'Reduced reserve.' },
    { q: 'An agitated patient who cannot be secured before flight:', options: ['Fly anyway', 'Sedate and consider intubation before departure', 'Restrain prone', 'Leave unmonitored'], answer: 1, why: 'Flight safety.' },
    { q: 'Hyperthermia and rhabdomyolysis in agitation are treated with:', options: ['Restraint only', 'Sedation, cooling and fluids', 'Antipyretics only', 'Diuretics'], answer: 1, why: 'Stop heat production.' },
  ],
  sources: [
    { title: 'StatPearls: Altered mental status', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Altered+mental+status+StatPearls' },
    { title: 'StatPearls: Delirium', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Delirium+StatPearls' },
    { title: 'ACEP Task Force: Hyperactive delirium with severe agitation (2021)', url: 'https://www.acep.org/siteassets/sites/acep/media/equal-rights/acep-task-force-report-on-hyperactive-delirium-final.pdf' },
  ],
};
