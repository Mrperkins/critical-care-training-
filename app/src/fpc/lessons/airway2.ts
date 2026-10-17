/** FP-C III.3–III.4: airway pharmacology (induction, paralysis, analgesia, sedation); passive and apnoeic oxygenation. */
import type { FpcLesson } from '../types';

export const AIRWAY_PHARM: FpcLesson = {
  id: 'fpc-airway-pharm', domain: 'airway', ref: 'III.3',
  title: 'RSI, analgesia and sedation pharmacology',
  summary: 'Induction agents, neuromuscular blockers and reversal, and post-intubation analgesia and sedation: what each does to the blood pressure, the brain and the potassium, and how to choose for the patient in front of you.',
  objectives: [
    'Choose an induction agent and dose for the haemodynamic and neurological state of the patient.',
    'Compare succinylcholine and rocuronium, including contraindications and reversal with sugammadex.',
    'Plan analgesia-first sedation after intubation and recognise awareness under paralysis.',
  ],
  sections: [
    {
      id: 'sequence', title: 'The sequence', core: true,
      body: [
        'Rapid sequence intubation gives an induction agent and a neuromuscular blocker in quick succession to a pre-oxygenated patient, then intubates without bag-mask ventilation unless saturation falls. The aim is the best intubating conditions in the shortest time while protecting against aspiration and physiological collapse.',
        'Doses below are typical adult intravenous teaching values; programmes publish their own protocols and those govern practice. In shock, induction doses are commonly reduced — often by half — while paralytic doses are kept full or increased, because a slower circulation delays the onset of the blocker and an under-dosed paralytic produces poor conditions.',
      ],
      list: { caption: 'Seven Ps of RSI', items: ['Preparation (team, drugs, equipment, plan)', 'Pre-oxygenation', 'Pre-intubation optimisation (resuscitation)', 'Paralysis with induction', 'Positioning', 'Placement with proof (waveform capnography)', 'Post-intubation management'], ordered: true },
    },
    {
      id: 'induction', title: 'Induction agents', core: true,
      body: [
        'Ketamine is an NMDA antagonist producing dissociative anaesthesia with analgesia. It releases catecholamines, so blood pressure and heart rate are usually maintained or rise, and it preserves airway reflexes and respiratory drive at sub-anaesthetic doses and causes bronchodilation. In a catecholamine-depleted patient its direct myocardial depressant effect can appear, so profound shock still calls for a reduced dose. Older concerns that it raises intracranial pressure are not supported by modern evidence when ventilation is controlled.',
        'Etomidate is an imidazole with minimal cardiovascular effects. It causes transient adrenal suppression by inhibiting 11-β-hydroxylase after a single dose; whether this changes outcomes in sepsis remains debated. It provides no analgesia and can cause myoclonus.',
        'Propofol is a GABA-A agonist with rapid onset and offset. It causes vasodilation and myocardial depression, so hypotension is common, especially in hypovolaemia; it is a poor choice in shock. It has antiemetic and anticonvulsant properties and suits haemodynamically stable patients and status epilepticus.',
        'Midazolam is slower in onset at induction doses, causes dose-dependent hypotension, and is less reliable as a sole RSI induction agent; it is used more for sedation and seizures.',
      ],
      table: {
        caption: 'Induction agents (typical adult IV doses)',
        head: ['Agent', 'Dose', 'Onset', 'BP effect', 'Notes'],
        rows: [
          ['Ketamine', '1–2 mg/kg (reduce in shock)', '30–60 s', 'Maintained or ↑', 'Analgesia, bronchodilation; emergence reactions'],
          ['Etomidate', '0.3 mg/kg', '30–60 s', 'Neutral', 'Adrenal suppression, myoclonus, no analgesia'],
          ['Propofol', '1–2.5 mg/kg', '15–45 s', '↓↓', 'Avoid in shock; anticonvulsant'],
          ['Midazolam', '0.1–0.3 mg/kg', '1–3 min', '↓', 'Slower; better for sedation'],
        ],
      },
    },
    {
      id: 'nmb', title: 'Neuromuscular blockers and reversal', core: true,
      body: [
        'Succinylcholine (1.5 mg/kg IV) is a depolarising blocker: it binds acetylcholine receptors, causes fasciculations, then a block lasting about 6–10 minutes. Onset is about 45–60 seconds. It raises serum potassium by around 0.5 mmol/L in normal patients, and much more where receptors have up-regulated or spread across the muscle membrane.',
        'Contraindications include known or suspected hyperkalaemia, a personal or family history of malignant hyperthermia, neuromuscular disease (muscular dystrophies, myopathies), and conditions with receptor up-regulation such as burns, crush injury, prolonged immobilisation, stroke or spinal cord injury older than about 24–72 hours. Repeat doses can cause bradycardia, especially in children.',
        'Rocuronium (1–1.2 mg/kg IV, some protocols higher in shock) is a non-depolarising aminosteroid. At these doses onset approaches that of succinylcholine, and the block lasts 45–70 minutes or longer. It has no hyperkalaemia risk and few contraindications, which is why many transport programmes use it first-line. Its long duration means a failed airway cannot be rescued by waiting for spontaneous breathing to return — but that rarely happens in time with succinylcholine either, before dangerous desaturation.',
        'Sugammadex encapsulates rocuronium (and vecuronium). A dose of 16 mg/kg reverses a deep block within about three minutes. It does not reverse succinylcholine or the induction agent, and reversal does not fix an obstructed airway: in a "can\'t intubate, can\'t oxygenate" situation the priority remains oxygenation and a surgical airway.',
      ],
    },
    {
      id: 'post', title: 'After the tube: analgesia first', core: true,
      body: [
        'Paralysis is not sedation. After a long-acting paralytic, a patient can be fully aware, in pain and unable to move. Awareness during paralysis is a recognised harm of emergency airway management, and it is associated with later psychological injury. Start analgesia and sedation promptly after confirming the tube, before the induction agent wears off — etomidate and propofol last only minutes.',
        'Use an analgesia-first approach: an opioid such as fentanyl (typically 1 mcg/kg boluses or an infusion, adjusted to effect) to treat the pain of the tube, injuries and procedures, then add a sedative — propofol in the haemodynamically stable, ketamine or midazolam when blood pressure is tenuous. Tachycardia and hypertension under paralysis may signal awareness or pain; treat them as such before attributing them to anything else.',
        'Reassess often. Transport adds stimuli — noise, vibration, movement, cold — and drugs given on the ground may wear off in the air. Document sedation scores before paralysis is redosed, and avoid redosing a paralytic without ensuring sedation.',
      ],
      example: {
        case: 'A 30-year-old with a severe head injury (GCS 6), BP 138/80, HR 96, intubated with rocuronium and a reduced dose of ketamine. Twenty minutes into the flight, HR is 128 and BP 172/96.',
        steps: [
          'Rocuronium is still working; ketamine has probably worn off. The patient may be aware and in pain.',
          'The sympathetic surge also raises intracranial pressure — treat it promptly.',
          'Give an opioid bolus, then start or increase sedation (propofol if BP allows, otherwise more ketamine or midazolam).',
          'Recheck: HR and BP should settle. Continue an infusion so the gap does not recur; maintain MAP to protect cerebral perfusion pressure.',
        ],
      },
    },
    {
      id: 'adjuncts', title: 'Adjuncts and special situations',
      body: [
        'Push-dose vasopressors (for example phenylephrine in small boluses, or dilute epinephrine) treat post-induction hypotension while infusions are prepared. Have them drawn and labelled before induction in any patient with borderline blood pressure.',
        'In bronchospasm, ketamine is favoured for its bronchodilation. In status epilepticus, propofol or a benzodiazepine adds anticonvulsant effect — remember that paralysis hides seizures, so continuous EEG is unavailable in the field and a long-acting paralytic should be paired with adequate anticonvulsant therapy. In suspected raised ICP, the goal is to avoid both hypotension and the sympathetic surge of laryngoscopy: adequate depth, an opioid, and a blood-pressure-neutral agent.',
        'Delayed sequence intubation gives ketamine to an agitated, hypoxaemic patient who will not tolerate pre-oxygenation, then pre-oxygenates with NIV or a mask before paralysis. It is a deliberate procedural sedation to allow pre-oxygenation, not RSI with a delay.',
      ],
    },
  ],
  keyPoints: [
    'Ketamine maintains blood pressure and gives analgesia; etomidate is haemodynamically neutral; propofol drops pressure — avoid it in shock.',
    'In shock: halve the induction dose, keep the paralytic dose full.',
    'Succinylcholine: hyperkalaemia, malignant hyperthermia, neuromuscular disease and late burns/crush/immobility are contraindications.',
    'Rocuronium 1–1.2 mg/kg is reversible with sugammadex 16 mg/kg — reversal never replaces oxygenation.',
    'Paralysis is not sedation: start analgesia and sedation right after tube confirmation.',
  ],
  pearls: ['Tachycardia and hypertension under rocuronium usually mean the patient feels it.', 'Draw up push-dose pressors before induction, not after the pressure falls.', 'Delayed sequence intubation enables pre-oxygenation in the agitated hypoxic patient.'],
  pitfalls: ['Succinylcholine in a patient with chronic renal failure and an unknown potassium.', 'Full-dose propofol in a septic patient.', 'Letting a short-acting induction agent wear off with no sedation running.'],
  live: [{ id: 'moa-ketamine', label: 'Ketamine: mechanism of action' }, { id: 'moa-rocuronium', label: 'Rocuronium: mechanism of action' }, { id: 'moa-succinylcholine', label: 'Succinylcholine: mechanism of action' }],
  questions: [
    { q: 'Which induction agent is most likely to worsen hypotension in septic shock?', options: ['Ketamine', 'Etomidate', 'Propofol', 'Fentanyl at 1 mcg/kg'], answer: 2, why: 'Propofol causes vasodilation and myocardial depression.' },
    { q: 'Succinylcholine is contraindicated in a patient with:', options: ['A burn 6 hours old', 'A burn 5 days old', 'Asthma', 'Isolated femur fracture'], answer: 1, why: 'Receptor up-regulation after about 24–72 hours causes dangerous hyperkalaemia.' },
    { q: 'In shock, the induction agent dose is typically ___ and the paralytic dose ___:', options: ['Increased; reduced', 'Reduced; kept full or increased', 'Unchanged; reduced', 'Reduced; reduced'], answer: 1, why: 'Lower induction dose limits hypotension; slower circulation needs a full paralytic dose.' },
    { q: 'Sugammadex reverses:', options: ['Succinylcholine', 'Rocuronium', 'Etomidate', 'Ketamine'], answer: 1, why: 'It encapsulates aminosteroid blockers (rocuronium, vecuronium).' },
    { q: 'Etomidate\'s best-known adverse effect is:', options: ['Bronchospasm', 'Adrenal suppression', 'Hyperkalaemia', 'Malignant hyperthermia'], answer: 1, why: 'It inhibits 11-β-hydroxylase transiently.' },
    { q: 'Twenty minutes after RSI with rocuronium and etomidate, HR rises to 130 and BP to 180/100. Most likely cause:', options: ['Anaphylaxis', 'Awareness and pain as etomidate wears off', 'Hypovolaemia', 'Tube in the oesophagus'], answer: 1, why: 'Etomidate lasts minutes; rocuronium persists. Give analgesia and sedation.' },
    { q: 'Which agent is favoured for induction in severe bronchospasm?', options: ['Propofol', 'Ketamine', 'Etomidate', 'Midazolam'], answer: 1, why: 'Ketamine causes bronchodilation via catecholamine release.' },
    { q: 'Typical rocuronium RSI dose:', options: ['0.1 mg/kg', '0.6 mg/kg', '1–1.2 mg/kg', '3 mg/kg'], answer: 2, why: 'High doses give onset approaching succinylcholine.' },
    { q: 'Delayed sequence intubation primarily aims to:', options: ['Avoid paralysis', 'Allow pre-oxygenation in an agitated patient', 'Delay transport', 'Reduce drug costs'], answer: 1, why: 'Dissociative ketamine allows NIV or mask pre-oxygenation before paralysis.' },
    { q: 'Repeat succinylcholine doses in children may cause:', options: ['Tachycardia', 'Bradycardia', 'Hypertension', 'Hypokalaemia'], answer: 1, why: 'Muscarinic stimulation causes bradycardia.' },
  ],
  sources: [
    { title: 'StatPearls: Rapid sequence intubation', url: 'https://www.ncbi.nlm.nih.gov/books/NBK557589/' },
    { title: 'StatPearls: Succinylcholine', url: 'https://www.ncbi.nlm.nih.gov/books/NBK548741/' },
    { title: 'StatPearls: Sugammadex', url: 'https://www.ncbi.nlm.nih.gov/books/NBK570587/' },
  ],
};

export const PASSIVE_OXYGENATION: FpcLesson = {
  id: 'fpc-passive-oxygenation', domain: 'airway', ref: 'III.4',
  title: 'Pre-oxygenation and passive (apnoeic) oxygenation',
  summary: 'How to fill the oxygen tank before apnoea, how to keep oxygen flowing during the attempt, and when to stop and ventilate.',
  objectives: [
    'Pre-oxygenate effectively with a non-rebreather, bag-mask, high-flow nasal oxygen or NIV.',
    'Explain apnoeic oxygenation and its limits.',
    'Set a stop point before the desaturation cliff.',
  ],
  sections: [
    {
      id: 'why', title: 'Denitrogenation: filling the tank', core: true,
      body: [
        'Pre-oxygenation replaces nitrogen in the functional residual capacity with oxygen. The goal is an end-tidal oxygen fraction near 90 % when it can be measured, or at least three minutes of tidal breathing — or eight vital-capacity breaths — on a high-FiO₂ source with a good seal.',
        'A standard non-rebreather mask at 15 L/min delivers far less than 100 % because room air is entrained around the mask and through the valves when the patient\'s inspiratory flow exceeds the oxygen flow. Turning the flowmeter to "flush" (often 40–60 L/min) reduces entrainment and markedly increases the delivered FiO₂.',
        'A bag-valve-mask with a tight seal and a PEEP valve can deliver close to 100 %, but only if the patient\'s effort opens the valve — or if the operator gently assists. Without a tight seal it performs worse than a non-rebreather. Nasal cannula at high flow under a mask adds oxygen to the reservoir in the nasopharynx.',
      ],
      table: {
        caption: 'Pre-oxygenation options',
        head: ['Device', 'Approximate FiO₂', 'Best for'],
        rows: [
          ['NRB at 15 L/min', '0.6–0.7', 'Not ideal alone'],
          ['NRB at flush rate', 'Up to ~0.9', 'Practical default when no NIV'],
          ['BVM + PEEP valve, sealed', 'Up to ~1.0', 'Spontaneously breathing, cooperative'],
          ['NIV (CPAP/BiPAP) FiO₂ 1.0', '~1.0 with recruitment', 'Shunt physiology, obesity, pneumonia'],
          ['High-flow nasal oxygen', 'High, flow-dependent', 'Pre-oxygenation and apnoeic oxygenation'],
        ],
      },
    },
    {
      id: 'shunt', title: 'When shunt limits the mask', core: true,
      body: [
        'Patients with pneumonia, pulmonary oedema or ARDS have alveoli that are flooded or collapsed. Oxygen delivered to the mouth cannot reach them, so saturation may stay in the 80s even at FiO₂ 1.0. These patients need positive end-expiratory pressure to recruit lung: CPAP or BiPAP for pre-oxygenation, or a BVM with a PEEP valve set to 5–15 cmH₂O.',
        'NIV pre-oxygenation is particularly helpful in obesity and in patients who are already hypoxaemic. It requires a cooperative patient and a protected airway reflex; agitation may require delayed sequence intubation with ketamine.',
      ],
    },
    {
      id: 'apnoeic', title: 'Apnoeic oxygenation', core: true,
      body: [
        'Once the patient is apnoeic, oxygen continues to be taken up from the alveoli at roughly 250 mL/min in an adult, while CO₂ is returned at about 200 mL/min, much of it buffered in blood. The resulting net gas movement into the alveoli draws gas from the pharynx into the lungs. If the pharynx is filled with oxygen — nasal cannula at 15 L/min or high-flow nasal oxygen — that bulk flow is oxygen, extending the time before desaturation.',
        'Apnoeic oxygenation works only with a patent airway: a jaw thrust or the laryngoscope blade keeps the pharynx open. It does not remove CO₂ effectively; PaCO₂ rises by roughly 3 mmHg a minute of apnoea, which matters in patients with acidosis or raised intracranial pressure.',
        'Leave the nasal cannula on throughout the attempt, under the pre-oxygenation mask. It is cheap, quick and does not interfere with laryngoscopy.',
      ],
    },
    {
      id: 'stop', title: 'When to stop and ventilate', core: true,
      body: [
        'Agree a stop point before the blade goes in: a saturation (commonly 93 % or a fall of a set amount from baseline) or a time. When reached, the operator withdraws, the team ventilates with a BVM and an oropharyngeal airway (or places a supraglottic airway), re-oxygenates and reconsiders the plan.',
        'Gentle mask ventilation during the apnoeic period — low pressures, low rates, a PEEP valve — is reasonable in patients at high risk of desaturation; it reduces severe hypoxaemia without a clear increase in aspiration when done carefully.',
      ],
      example: {
        case: 'An obese 52-year-old with COVID pneumonia: SpO₂ 88 % on NRB at 15 L/min.',
        steps: [
          'Recognise shunt and a small FRC: the mask alone will not pre-oxygenate.',
          'Sit up 30°; apply NIV with FiO₂ 1.0 and PEEP 8–10 cmH₂O; add nasal cannula at 15 L/min.',
          'Target SpO₂ ≥ 94 % or the best achievable after three minutes.',
          'During the attempt, keep the cannula flowing; stop at the agreed saturation and ventilate gently with PEEP.',
        ],
      },
    },
  ],
  keyPoints: [
    'Pre-oxygenate for three minutes or eight vital-capacity breaths with a sealed high-FiO₂ source.',
    'NRB at flush rate beats NRB at 15 L/min.',
    'Shunt needs PEEP: NIV or BVM with a PEEP valve.',
    'Nasal cannula at 15 L/min during apnoea extends safe time if the airway is open.',
    'Agree a saturation or time stop point before laryngoscopy.',
  ],
  pearls: ['Head-up positioning adds safe apnoea time in obese and pregnant patients.', 'Apnoeic oxygenation does not clear CO₂.'],
  pitfalls: ['A BVM held loosely over the face without assistance.', 'Removing nasal oxygen to fit the mask.', 'Pressing on with laryngoscopy as saturation drops.'],
  live: [{ id: 'pop-apnoea', label: 'Apnoea: how long the oxygen lasts' }, { id: 'hypox', label: 'Why is the PaO₂ low?' }],
  questions: [
    { q: 'Which increases FiO₂ delivered by a non-rebreather most?', options: ['Reducing flow to 10 L/min', 'Turning the flowmeter to flush rate', 'Removing the reservoir', 'Adding humidification'], answer: 1, why: 'Higher flow reduces room-air entrainment.' },
    { q: 'Minimum pre-oxygenation by tidal breathing is about:', options: ['30 seconds', '1 minute', '3 minutes', '15 minutes'], answer: 2, why: 'Three minutes of tidal breathing or eight vital-capacity breaths.' },
    { q: 'A pneumonia patient stays at SpO₂ 86 % on FiO₂ 1.0 by mask. Best next step:', options: ['Proceed immediately', 'Add PEEP with NIV or a PEEP valve', 'Lower FiO₂', 'Give a diuretic'], answer: 1, why: 'Shunt requires recruitment with positive pressure.' },
    { q: 'Apnoeic oxygenation requires:', options: ['A patent airway', 'Spontaneous breathing', 'An endotracheal tube', 'Sedation reversal'], answer: 0, why: 'Bulk flow from the pharynx needs an open airway.' },
    { q: 'During apnoea, PaCO₂ rises roughly:', options: ['0.3 mmHg/min', '3 mmHg/min', '30 mmHg/min', 'Not at all'], answer: 1, why: 'About 3 mmHg per minute after the first minute.' },
    { q: 'Nasal cannula flow commonly used for apnoeic oxygenation:', options: ['2 L/min', '6 L/min', '15 L/min', '60 L/min with a standard cannula'], answer: 2, why: '15 L/min with a standard cannula; higher with high-flow devices.' },
    { q: 'Why does a BVM perform poorly for pre-oxygenation without a seal?', options: ['Valves leak oxygen', 'Room air is entrained around the mask', 'It delivers too much PEEP', 'It increases CO₂'], answer: 1, why: 'Without a seal, inspiratory flow pulls in room air.' },
    { q: 'Gentle mask ventilation during the apnoeic period is reasonable when:', options: ['Never', 'High risk of desaturation, using low pressures', 'Only after three failed attempts', 'Only in children'], answer: 1, why: 'Careful low-pressure ventilation reduces severe hypoxaemia.' },
    { q: 'The best positioning for pre-oxygenating an obese patient:', options: ['Supine flat', 'Head up 20–30°', 'Trendelenburg', 'Prone'], answer: 1, why: 'Head-up improves FRC.' },
    { q: 'An agitated hypoxic patient tears off every mask. Strategy:', options: ['Proceed with RSI unoxygenated', 'Delayed sequence intubation with ketamine', 'Physical restraint only', 'Abandon intubation'], answer: 1, why: 'Ketamine allows pre-oxygenation before paralysis.' },
  ],
  sources: [
    { title: 'Weingart SD, Levitan RM. Preoxygenation and prevention of desaturation during emergency airway management. Ann Emerg Med (2012)', url: 'https://pubmed.ncbi.nlm.nih.gov/22050948/' },
    { title: 'Casey JD et al. Bag-mask ventilation during tracheal intubation of critically ill adults (PreVent). NEJM (2019)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1812405' },
  ],
};
