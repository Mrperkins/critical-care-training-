/** FP-C III.1–III.2: airway assessment; airway anatomy and physiology. */
import type { FpcLesson } from '../types';

export const AIRWAY_ASSESSMENT: FpcLesson = {
  id: 'fpc-airway-assessment', domain: 'airway', ref: 'III.1',
  title: 'Airway assessment: predicting the difficult airway',
  summary: 'Separate the four kinds of difficulty — laryngoscopy, mask ventilation, supraglottic device and surgical airway — and add the physiological difficulty that kills more transport patients than anatomy does.',
  objectives: [
    'Assess for difficult laryngoscopy, bag-mask ventilation, supraglottic airway and cricothyrotomy using structured mnemonics.',
    'Recognise the physiologically difficult airway: hypoxaemia, hypotension, severe acidosis and right-ventricular failure.',
    'Turn an assessment into a plan with a stated backup at every step, before the drugs go in.',
  ],
  sections: [
    {
      id: 'four', title: 'Four different difficulties', core: true,
      body: [
        'A "difficult airway" is not one thing. Four separate tasks can be hard, and a patient can be easy for one and impossible for another. Difficult laryngoscopy means you cannot see the glottis. Difficult bag-mask ventilation means you cannot move air with a mask. A difficult supraglottic airway means a rescue device will not seat or seal. A difficult cricothyrotomy means you cannot find or reach the cricothyroid membrane.',
        'Assess all four, because the plan depends on which ones are threatened. A bearded, edentulous patient with a normal neck may be a poor mask but an easy laryngoscopy. A patient with a radiation-scarred neck may be an easy mask and an easy view but an impossible surgical airway. The most dangerous patient is the one in whom several fail together: the plan has no safe exit.',
        'In transport medicine, add a fifth: the environment. Poor lighting, a patient on the ground or in a wreck, limited access to the head, vibration, noise that defeats auscultation, and a small team all make every task harder. Many programmes prefer to secure an airway before loading rather than in an aircraft cabin where positioning and access are compromised.',
      ],
      table: {
        caption: 'Common mnemonics for the four difficulties',
        head: ['Task', 'Mnemonic', 'What it reminds you to look for'],
        rows: [
          ['Laryngoscopy', 'LEMON', 'Look externally, Evaluate 3-3-2, Mallampati, Obstruction or obesity, Neck mobility'],
          ['Bag-mask ventilation', 'ROMAN', 'Radiation or restriction, Obstruction / obesity / OSA, Mask seal (beard, trauma), Age over 55, No teeth'],
          ['Supraglottic airway', 'RODS', 'Restricted mouth opening, Obstruction at or below the larynx, Distorted airway, Stiff lungs or cervical spine'],
          ['Cricothyrotomy', 'SMART', 'Surgery or disruption, Mass (haematoma, abscess), Access or anatomy (obesity, oedema), Radiation, Tumour'],
        ],
      },
    },
    {
      id: 'lemon', title: 'Laryngoscopy: LEMON in practice',
      body: [
        'Look externally first: facial trauma, a short thick neck, a small mandible, large incisors, or the overall gestalt that this will be hard. Gestalt from experienced operators is a useful predictor and should not be dismissed.',
        'The 3-3-2 rule estimates whether the mouth, mandible and larynx line up. Three of the patient\'s fingerbreadths of mouth opening allow the blade and tube in. Three fingerbreadths from the chin to the hyoid suggest enough mandibular space to displace the tongue into. Two fingerbreadths from the hyoid to the thyroid notch suggest the larynx is not sitting too high.',
        'Mallampati grading needs a cooperative, sitting patient, so in emergency and transport practice it is often unobtainable. Obstruction — blood, vomit, angioedema, epiglottitis, an expanding haematoma, a foreign body — and obesity both reduce the view and the time available. Neck mobility matters when you need to extend for direct laryngoscopy; a patient in spinal motion restriction has lost it.',
        'Video laryngoscopy changes the weight of several predictors. A hyperangulated blade sees around a curve that a direct blade cannot, so mouth opening and blood in the airway become the dominant limits rather than mandibular space. Blood and secretions on the camera can turn a good video view into no view at all, which is why suction must be ready before the blade goes in.',
      ],
      list: { caption: 'Cormack–Lehane view grades', items: ['Grade 1: most of the glottis visible.', 'Grade 2: posterior glottis or arytenoids only (2a partial cords, 2b arytenoids only).', 'Grade 3: epiglottis only.', 'Grade 4: no laryngeal structures, not even the epiglottis.'], ordered: false },
    },
    {
      id: 'physiological', title: 'The physiologically difficult airway', core: true,
      body: [
        'Most peri-intubation deaths in critically ill patients are not caused by failure to place the tube. They are caused by hypoxaemia, hypotension and cardiac arrest around induction. The physiologically difficult airway is the patient in whom the act of intubation — apnoea, induction drugs and positive pressure — is itself dangerous.',
        'Hypoxaemia: a patient who starts desaturated, or who has a small or shunted functional residual capacity, will desaturate within seconds of apnoea. Optimise pre-oxygenation, consider non-invasive ventilation to pre-oxygenate, and plan to ventilate gently during the apnoeic period if saturation falls.',
        'Hypotension: induction agents blunt sympathetic tone, and positive pressure reduces venous return. A patient with a shock index above about 0.9, a low systolic pressure, or a high vasopressor requirement may arrest at induction. Resuscitate first where possible: volume or blood for the hypovolaemic, a push-dose or infusion vasopressor ready, and a reduced induction dose of a haemodynamically gentler agent.',
        'Severe metabolic acidosis: a patient compensating with a minute ventilation of 20 litres or more depends on that ventilation to hold the pH. A period of apnoea and then "normal" ventilator settings can drop the pH sharply and precipitate arrest. Match their pre-intubation minute ventilation on the ventilator and keep apnoea as short as possible.',
        'Right-ventricular failure: pulmonary hypertension, massive pulmonary embolism and RV infarction leave a ventricle that tolerates neither hypotension nor the rise in afterload from hypoxia, hypercapnia and high intrathoracic pressure. These patients can collapse at induction; avoid hypotension and hypoxia, and use modest tidal volumes and PEEP.',
      ],
      example: {
        case: 'A 64-year-old with septic shock from pneumonia: SpO₂ 86 % on a non-rebreather, BP 82/48, HR 128, RR 34, pH 7.18. The team wants to intubate before a 40-minute flight.',
        steps: [
          'Name the threats: hypoxaemia (shunt from pneumonia), hypotension (shock index 1.6), and a compensatory respiratory rate defending an acidotic pH.',
          'Resuscitate before induction: fluid as indicated, start or increase norepinephrine, have a push-dose vasopressor drawn up.',
          'Pre-oxygenate with NIV or high-flow plus a tightly sealed mask, sitting up, for at least three minutes; leave nasal oxygen on for apnoeic oxygenation.',
          'Choose a reduced-dose, haemodynamically stable induction agent and a full-dose paralytic; plan first-pass success with a video laryngoscope and a bougie.',
          'After the tube: set a high minute ventilation to match the patient\'s own, confirm with waveform capnography, and recheck blood pressure every few minutes.',
        ],
      },
    },
    {
      id: 'plan', title: 'From assessment to a plan', core: true,
      body: [
        'An airway assessment is only useful if it changes what you do. Before induction, state aloud the plan: who intubates, with which device, what the first-attempt backup is (a bougie, a different blade), the rescue oxygenation device (supraglottic airway size chosen and opened), and the point at which the team moves to a surgical airway.',
        'Use a checklist. Challenge-response checklists before rapid sequence intubation reduce omissions — suction on, pre-oxygenation adequate, drugs drawn and labelled, monitoring with waveform capnography ready, the backup devices in reach, the patient positioned. Checklists are especially valuable in transport, where teams may be small and environments unfamiliar.',
        'If the predicted difficulty is high and the patient is maintaining oxygenation, consider whether the airway needs to be secured now, by you, in this environment. Options include an awake approach with topical anaesthesia and light sedation, delaying until a better setting, or transporting with the patient\'s own airway and a clear plan for deterioration.',
      ],
      list: { caption: 'Positioning before every attempt', items: ['Ear to sternal notch: the external auditory meatus level with the sternal notch, face plane parallel to the ceiling.', 'Head up 20–30° (or reverse Trendelenburg if spinal precautions): improves FRC and view, reduces aspiration.', 'Ramp the obese patient with blankets under shoulders and head.', 'Bed or stretcher at the operator\'s waist height, 360° access if possible.'] },
    },
    {
      id: 'aspiration', title: 'Aspiration risk and the full stomach',
      body: [
        'Every emergency patient is treated as having a full stomach. Risk is higher with bowel obstruction, upper GI bleeding, recent food or alcohol, pregnancy, obesity, diabetic gastroparesis, and bag-mask ventilation with high pressures that inflate the stomach.',
        'Reduce it: head-up positioning, gentle mask ventilation (low pressures, low rates) only when needed, decompression of an obviously distended stomach with a gastric tube before induction in high-risk patients, and large-bore suction running and in hand. Cricoid pressure is no longer routine in many guidelines because evidence of benefit is weak and it can worsen the view; if used, release it when it impairs laryngoscopy or ventilation.',
      ],
    },
  ],
  keyPoints: [
    'Assess four tasks separately: laryngoscopy (LEMON), mask ventilation (ROMAN), supraglottic device (RODS), cricothyrotomy (SMART).',
    'The physiologically difficult airway — hypoxaemia, hypotension, severe acidosis, RV failure — causes most peri-intubation arrests.',
    'Resuscitate before you intubate: oxygen, volume or blood, and vasopressors ready.',
    'Match the minute ventilation of a patient compensating for a metabolic acidosis.',
    'State the plan and the backup aloud with a checklist before the drugs go in.',
  ],
  pearls: ['A gestalt that "this will be hard" from an experienced operator is a valid predictor.', 'Blood and vomit defeat video laryngoscopes: suction before the blade.', 'Mark the cricothyroid membrane before induction when difficulty is predicted.'],
  pitfalls: ['Focusing on anatomy and inducing a hypotensive, hypoxic patient without resuscitation.', 'Ventilating an acidotic patient at "normal" settings after intubation.', 'Relying on Mallampati in a patient who cannot cooperate.'],
  live: [{ id: 'pop-apnoea', label: 'Apnoea: how long the oxygen lasts' }, { id: 'abg-resp-vs-metabolic', label: 'Respiratory vs metabolic acidosis' }],
  questions: [
    { q: 'Which finding most predicts difficult bag-mask ventilation?', options: ['Mallampati class II', 'A full beard and no teeth', 'Thyromental distance of four fingerbreadths', 'Isolated tibial fracture'], answer: 1, why: 'Beards and edentulism defeat the mask seal (the M and N of ROMAN).' },
    { q: 'In LEMON, the "3" of the hyoid-to-chin distance assesses:', options: ['Mouth opening', 'Mandibular space to displace the tongue', 'Laryngeal height', 'Neck extension'], answer: 1, why: 'Three fingerbreadths from mentum to hyoid suggests room to compress the tongue into the submandibular space.' },
    { q: 'A septic patient with BP 78/40 needs intubation. Which step most reduces the risk of peri-intubation arrest?', options: ['Larger induction dose to ensure amnesia', 'Resuscitation and a vasopressor ready before induction', 'Delaying pre-oxygenation to save time', 'Using cricoid pressure'], answer: 1, why: 'Hypotension is a leading cause of peri-intubation arrest; resuscitate and prepare vasopressors first.' },
    { q: 'A DKA patient breathing 36 times a minute (PaCO₂ 16) is intubated. Best initial ventilator approach?', options: ['RR 12, VT 6 mL/kg', 'Match the pre-intubation minute ventilation', 'Permissive hypercapnia', 'Pressure support only'], answer: 1, why: 'Removing respiratory compensation can drop the pH precipitously; match their minute ventilation.' },
    { q: 'Cormack–Lehane grade 3 means:', options: ['Full glottis visible', 'Arytenoids only', 'Epiglottis only', 'No structures'], answer: 2, why: 'Grade 3 is epiglottis only.' },
    { q: 'Which mnemonic assesses difficulty placing a supraglottic airway?', options: ['LEMON', 'ROMAN', 'RODS', 'SMART'], answer: 2, why: 'RODS: Restricted opening, Obstruction, Distorted airway, Stiff lungs or spine.' },
    { q: 'A neck previously treated with radiation primarily threatens which task?', options: ['Laryngoscopy only', 'Surgical airway and mask ventilation', 'Supraglottic insertion only', 'None of these'], answer: 1, why: 'Radiation appears in both ROMAN and SMART: fibrosis stiffens tissue and distorts landmarks.' },
    { q: 'Best position for intubating an obese patient with no spinal concern:', options: ['Flat supine', 'Ramped with ear level to sternal notch, head up', 'Trendelenburg', 'Left lateral'], answer: 1, why: 'Ramping aligns the axes and head-up improves FRC and the view.' },
    { q: 'Which statement about cricoid pressure is most accurate?', options: ['It reliably prevents aspiration and is mandatory', 'Evidence is weak; release it if it worsens the view', 'It should be increased if ventilation is difficult', 'It improves video laryngoscopy views'], answer: 1, why: 'Many guidelines no longer mandate it; it can impair laryngoscopy and ventilation.' },
    { q: 'A patient with massive PE needs intubation. Greatest risk at induction is:', options: ['Bronchospasm', 'RV failure and cardiovascular collapse', 'Hyperkalaemia', 'Laryngospasm'], answer: 1, why: 'Hypotension, hypoxia and positive pressure all worsen a failing RV.' },
  ],
  sources: [
    { title: 'Difficult Airway Society: guidelines for tracheal intubation in critically ill adults (2018)', url: 'https://das.uk.com/guidelines/icu_guidelines2017' },
    { title: 'Mosier JM et al. The physiologically difficult airway. West J Emerg Med (2015)', url: 'https://pubmed.ncbi.nlm.nih.gov/26759643/' },
  ],
};

export const AIRWAY_ANATOMY: FpcLesson = {
  id: 'fpc-airway-anatomy', domain: 'airway', ref: 'III.2',
  title: 'Airway anatomy and physiology',
  summary: 'The structures you see and cut through, how the adult and paediatric airway differ, and the physiology of oxygen stores, dead space and airway reflexes that decides how much time you have.',
  objectives: [
    'Identify the laryngeal landmarks used for laryngoscopy and cricothyrotomy.',
    'Explain the anatomical differences of the paediatric airway and their consequences.',
    'Relate FRC, dead space and shunt to desaturation during apnoea.',
  ],
  sections: [
    {
      id: 'upper', title: 'The upper airway and larynx', core: true,
      body: [
        'Air passes the nose or mouth, the pharynx (naso-, oro- and laryngopharynx), then the larynx. The epiglottis sits at the base of the tongue; the space between them is the vallecula, where a curved Macintosh blade tip sits to lift the epiglottis indirectly through the hyoepiglottic ligament. A straight Miller blade lifts the epiglottis directly.',
        'The glottic opening is bounded by the vocal cords. Posteriorly lie the arytenoid cartilages and the interarytenoid notch — the landmark most often seen in a poor view, and the reason a bougie aimed just anterior to the arytenoids usually finds the trachea. The piriform recesses sit on either side of the larynx; a tube or bougie that slides into one meets resistance and does not produce tracheal clicks.',
        'The thyroid cartilage forms the laryngeal prominence. Below it, the cricothyroid membrane spans the gap to the cricoid cartilage — the only complete ring of cartilage in the airway. The membrane is about 1 cm high and 2–3 cm wide in adults, avascular in its midline, and the site of an emergency surgical airway. The cricothyroid arteries run across its upper part, which is why the incision is made through the lower half.',
      ],
      list: { caption: 'Finding the membrane: laryngeal handshake', items: ['Identify the hyoid and the thyroid laminae between thumb and middle finger.', 'Slide down to the cricoid ring and stabilise the larynx.', 'Feel the membrane with the index finger in the gap between thyroid and cricoid.', 'In obese or swollen necks, ultrasound can identify it before induction.'], ordered: true },
    },
    {
      id: 'peds', title: 'The paediatric airway', core: true,
      body: [
        'Infants and young children have a proportionally larger occiput that flexes the neck when supine — place a towel under the shoulders, not the head. The tongue is large relative to the mouth, the larynx sits higher (around C3–C4 in infants versus C5–C6 in adults) and more anterior, and the epiglottis is floppy and omega-shaped, which is why a straight blade lifting it directly is often preferred in infants.',
        'The narrowest functional point in young children has traditionally been taught as the cricoid ring; imaging suggests the glottis is narrowest in some, but the cricoid remains the narrowest complete, non-expandable ring. A tube that passes the cords but is tight at the cricoid can cause mucosal injury and post-extubation stridor. Cuffed tubes are now standard in most children, sized smaller, with cuff pressures monitored.',
        'Small radius magnifies resistance. Resistance to laminar flow rises with the fourth power of the radius, so one millimetre of oedema in a 4 mm airway raises resistance about sixteen-fold. Children have less oxygen reserve per kilogram and roughly double the oxygen consumption, so they desaturate fast, and bradycardia from hypoxia is a pre-arrest sign.',
      ],
      table: {
        caption: 'Adult versus infant airway',
        head: ['Feature', 'Infant', 'Adult'],
        rows: [
          ['Occiput', 'Large: flexes neck supine', 'Proportionate'],
          ['Larynx level', 'C3–C4, anterior', 'C5–C6'],
          ['Epiglottis', 'Long, floppy, omega-shaped', 'Broad, flat, firm'],
          ['Narrowest complete ring', 'Cricoid', 'Cricoid (glottis functionally narrowest)'],
          ['Cricothyroid membrane', 'Tiny: needle approach under ~10–12 years', 'Surgical approach feasible'],
          ['O₂ consumption', '≈ 6–8 mL/kg/min', '≈ 3–4 mL/kg/min'],
        ],
      },
    },
    {
      id: 'stores', title: 'Oxygen stores and the apnoeic clock', core: true,
      body: [
        'During apnoea the patient lives on the oxygen already in the body. The largest modifiable store is the functional residual capacity (FRC) — the gas left in the lungs at the end of a normal breath, about 2–2.5 litres in an adult. Breathing air, that gas is about 21 % oxygen; after thorough pre-oxygenation it can approach 90 %, multiplying the reserve several-fold.',
        'FRC falls when supine, with obesity, in pregnancy, with abdominal distension and with lung disease such as pneumonia or ARDS. Oxygen consumption rises with sepsis, fever, pregnancy and in children. Each change shortens the time to desaturation. A healthy, well pre-oxygenated adult may remain above 90 % for several minutes; a critically ill or obese patient may desaturate within a minute.',
        'Shunt — blood passing unventilated alveoli — limits how much pre-oxygenation can achieve, because those alveoli never fill with oxygen. Patients with large shunts may not reach an end-tidal oxygen above 85–90 % with a mask alone; positive pressure (NIV or PEEP) to recruit lung improves pre-oxygenation in these patients.',
        'The oxyhaemoglobin dissociation curve explains the shape of desaturation. While alveolar oxygen is high, saturation sits on the flat upper part of the curve and barely changes. Once arterial PO₂ falls to about 60 mmHg, the curve is steep and saturation falls quickly. Pulse oximeters also lag behind central desaturation, particularly with poor peripheral perfusion.',
      ],
    },
    {
      id: 'deadspace', title: 'Dead space, reflexes and the lower airway',
      body: [
        'Anatomical dead space — the conducting airways that do not take part in gas exchange — is about 2 mL/kg (around 150 mL in an adult). Alveolar dead space adds ventilated but unperfused alveoli (pulmonary embolism, low cardiac output, overdistension). Equipment adds more: a filter, a catheter mount and a long elbow can add significant dead space, which matters in children and when ventilating small tidal volumes.',
        'The airway is protected by reflexes. Laryngeal stimulation can produce laryngospasm, coughing, bradycardia (vagal, especially in children) and a sympathetic surge with hypertension and tachycardia. That surge is undesirable in raised intracranial pressure, aortic dissection and ischaemic heart disease, and is blunted by adequate depth of anaesthesia and analgesia.',
        'Below the cords the trachea runs about 10–12 cm to the carina at roughly the level of the angle of Louis (T4–T5). The right main bronchus is shorter, wider and more vertical, so a tube advanced too far usually enters it. In an adult, a tube depth of roughly three times the tube size at the teeth, or about 21–23 cm at the incisors, places the tip mid-trachea; confirm with capnography, bilateral breath sounds and imaging.',
      ],
    },
  ],
  keyPoints: [
    'Bougie just anterior to the arytenoids; incise the lower half of the cricothyroid membrane.',
    'Infants: large occiput, high anterior larynx, floppy epiglottis, cricoid the narrowest ring, double the oxygen consumption.',
    'FRC is the oxygen tank during apnoea; obesity, pregnancy, supine position and lung disease shrink it.',
    'Shunt limits pre-oxygenation — PEEP or NIV helps.',
    'Saturation stays flat, then falls fast once PaO₂ nears 60 mmHg.',
  ],
  pearls: ['Use the laryngeal handshake and mark the membrane before a predicted difficult intubation.', 'A towel under an infant\'s shoulders, not the head, aligns the airway.', 'Tube depth roughly three times the tube size at the lips in adults and children over about two years.'],
  pitfalls: ['Pillow under an infant\'s head, which flexes the neck further.', 'Assuming normal saturation means time remains when FRC is small.', 'Long equipment dead space when ventilating small volumes.'],
  live: [{ id: 'peds-airway', label: 'The child\'s airway: radius to the fourth power' }, { id: 'o2path', label: 'Oxygen: from air to mitochondria' }],
  questions: [
    { q: 'A Macintosh blade tip is placed in the:', options: ['Piriform recess', 'Vallecula', 'Glottis', 'Interarytenoid notch'], answer: 1, why: 'The curved blade lifts the epiglottis indirectly via the hyoepiglottic ligament.' },
    { q: 'Why is the cricothyroid incision made in the lower half of the membrane?', options: ['The membrane is thicker there', 'The cricothyroid arteries cross the upper part', 'The vocal cords lie below', 'It is closer to the skin'], answer: 1, why: 'Avoid the cricothyroid vessels running along the upper membrane.' },
    { q: 'In an infant, the larynx lies at about:', options: ['C1', 'C3–C4', 'C6–C7', 'T1'], answer: 1, why: 'The infant larynx is higher and more anterior than the adult\'s (C5–C6).' },
    { q: 'An infant airway of 4 mm develops 1 mm of circumferential oedema. Resistance rises roughly:', options: ['2-fold', '4-fold', '16-fold', '100-fold'], answer: 2, why: 'Diameter halves (radius halves); resistance ∝ 1/r⁴ → 16×.' },
    { q: 'Which most shortens safe apnoea time?', options: ['Sitting up 30°', 'Pregnancy at term', 'Pre-oxygenation for 3 minutes', 'Apnoeic nasal oxygen'], answer: 1, why: 'Pregnancy reduces FRC and increases oxygen consumption.' },
    { q: 'Why can a patient with a large shunt fail to pre-oxygenate with a mask?', options: ['Oxygen toxicity', 'Unventilated alveoli never fill with oxygen', 'CO₂ rises too fast', 'The mask leaks'], answer: 1, why: 'Shunted blood bypasses ventilated alveoli; recruitment with PEEP helps.' },
    { q: 'Anatomical dead space in an adult is approximately:', options: ['50 mL', '150 mL', '500 mL', '1 L'], answer: 1, why: 'About 2 mL/kg.' },
    { q: 'A tube advanced too far most often enters the:', options: ['Left main bronchus', 'Right main bronchus', 'Oesophagus', 'Piriform recess'], answer: 1, why: 'The right main bronchus is shorter, wider and more vertical.' },
    { q: 'Where should padding go to position a supine infant for intubation?', options: ['Under the head', 'Under the shoulders', 'Under the knees', 'No padding'], answer: 1, why: 'The large occiput flexes the neck; a shoulder roll aligns the axes.' },
    { q: 'Saturation begins to fall quickly when arterial PO₂ reaches about:', options: ['200 mmHg', '100 mmHg', '60 mmHg', '20 mmHg'], answer: 2, why: 'Below about 60 mmHg the dissociation curve is steep.' },
  ],
  sources: [
    { title: 'StatPearls: Anatomy, head and neck, larynx', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Anatomy%2C+head+and+neck%2C+larynx+StatPearls' },
    { title: 'StatPearls: Pediatric airway management', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Pediatric+airway+management+StatPearls' },
  ],
};
