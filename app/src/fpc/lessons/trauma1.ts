/** FP-C VII.1–VII.3: trauma diagnostics; trauma labs; trauma pharmacology. */
import type { FpcLesson } from '../types';

export const TRAUMA_DX: FpcLesson = {
  id: 'fpc-trauma-dx', domain: 'trauma', ref: 'VII.1',
  title: 'Trauma diagnostics: primary survey, eFAST, X-ray and CT',
  summary: 'The structured trauma assessment, extended FAST, the trauma films and CT findings you will be handed, and how diagnostics should — and should not — delay transport.',
  objectives: [
    'Perform a structured primary survey that treats life threats as they are found.',
    'Perform and interpret eFAST and recognise its limits.',
    'Interpret key trauma X-ray and CT findings and decide whether imaging should delay transfer.',
  ],
  sections: [
    {
      id: 'survey', title: 'The primary survey', core: true,
      body: [
        'Trauma assessment follows an order that treats the fastest killers first. Many systems use <C>ABCDE: catastrophic external haemorrhage first (direct pressure, tourniquets, wound packing, junctional devices), then airway with cervical spine protection, breathing (tension pneumothorax, open chest wounds, flail chest, massive haemothorax), circulation (shock assessment, haemorrhage control, access, blood), disability (GCS, pupils, glucose, lateralising signs) and exposure (full examination, then prevent hypothermia).',
        'Treat each threat as you find it, then move on. Reassess after every intervention and whenever the patient changes. The secondary survey — a head-to-toe examination and AMPLE history — follows once immediate threats are controlled, and in transport is often completed en route or at the receiving centre.',
        'Mechanism matters but physiology matters more. Field triage guidelines prioritise physiological criteria (GCS ≤ 13, SBP < 90, abnormal respiratory rate) and anatomical injuries (penetrating injury to head, neck, torso; flail chest; pelvic fractures; two or more long-bone fractures; amputation proximal to wrist or ankle; paralysis) for trauma-centre destination, with mechanism and special considerations (older age, anticoagulation, pregnancy) as additional triggers.',
      ],
    },
    {
      id: 'efast', title: 'Extended FAST', core: true,
      body: [
        'eFAST looks for free fluid and air in five areas: right upper quadrant (Morison\'s pouch between liver and kidney — usually the first positive window), left upper quadrant (around the spleen, including above it under the diaphragm), pelvis (behind the bladder), pericardium (subxiphoid), and both anterior chest walls for lung sliding (pneumothorax). Free fluid appears as an anechoic (black) stripe.',
        'In an unstable trauma patient, a positive abdominal FAST supports haemorrhage in the abdomen and points toward laparotomy or interventional radiology. A negative FAST does not exclude injury: early in bleeding, too little fluid may be visible; retroperitoneal bleeding (pelvic fractures, kidneys, aorta) does not appear in FAST windows; solid organ injuries without free fluid are missed; obesity and subcutaneous emphysema degrade images. Repeat the scan when the patient changes.',
        'Absent lung sliding with a "barcode" M-mode suggests pneumothorax; finding a lung point confirms it. Ultrasound detects pneumothorax more sensitively than a supine chest film. A pericardial effusion with haemodynamic compromise after penetrating chest trauma suggests tamponade.',
      ],
    },
    {
      id: 'imaging', title: 'X-ray and CT', core: true,
      body: [
        'The classic trauma series is a chest X-ray and pelvic X-ray in resuscitation, with CT for definitive diagnosis in stable patients. The chest film looks for haemothorax (a white-out on a supine film rather than a meniscus), pneumothorax (deep sulcus sign when supine), widened mediastinum, rib fractures, tube positions and subcutaneous emphysema. The pelvic film identifies unstable pelvic fractures (open-book, vertical shear), which bleed into the retroperitoneum and need a binder.',
        'Whole-body CT finds injuries quickly in stable patients. Unstable patients ("transient" or "non-responders") should not go to CT; they need haemorrhage control in theatre or interventional radiology. In transport, the key question is whether imaging at a non-trauma hospital will change management enough to justify the delay: often it will not, and transfer of a seriously injured patient should not wait for CT that the trauma centre will repeat.',
        'On CT, recognise the critical findings you may be handed: epidural haematoma (biconvex), subdural (crescent), midline shift and herniation, aortic injury, free air, solid organ lacerations with active contrast extravasation ("blush" — ongoing bleeding), and pelvic haematoma.',
      ],
      table: {
        caption: 'Haemorrhagic shock classes (ATLS-style, adult)',
        head: ['Class', 'Blood loss', 'HR', 'BP', 'Mental status'],
        rows: [['I', '< 15 %', 'Normal', 'Normal', 'Normal or anxious'], ['II', '15–30 %', '↑', 'Normal (narrow pulse pressure)', 'Anxious'], ['III', '30–40 %', '↑↑', '↓', 'Confused'], ['IV', '> 40 %', '↑↑↑ or ↓', '↓↓', 'Lethargic']],
      },
    },
    {
      id: 'case', title: 'Transport case: the ejected driver',
      body: ['A 38-year-old ejected from a rolled vehicle: GCS 13, RR 30, SpO₂ 89 %, absent breath sounds on the left, BP 84/50, HR 132, pelvis unstable. The referring rural hospital asks whether to obtain a CT before transfer.'],
      example: { case: 'Prioritise.', steps: [
        'Breathing: likely left tension pneumothorax or massive haemothorax — decompress/drain now; eFAST confirms absent sliding or fluid.',
        'Circulation: class III shock; pelvic binder at the greater trochanters; blood products; TXA within 3 hours.',
        'eFAST abdomen for intraperitoneal blood.',
        'No CT: an unstable patient goes directly to the trauma centre for haemorrhage control; send any images already done.',
        'Reassess after each intervention and en route; keep warm.',
      ] },
    },
  ],
  keyPoints: [
    '<C>ABCDE: catastrophic haemorrhage first, then airway, breathing, circulation, disability, exposure — treat as found.',
    'eFAST: RUQ, LUQ, pelvis, pericardium, lung sliding; negative does not exclude bleeding.',
    'Retroperitoneal (pelvic, renal, aortic) bleeding is invisible to FAST.',
    'Unstable patients go to haemorrhage control, not CT.',
    'Don\'t delay transfer of a seriously injured patient for imaging the trauma centre will repeat.',
  ],
  pearls: ['Morison\'s pouch is usually positive first when supine.', 'A supine haemothorax looks like a diffuse white-out, not a meniscus.'],
  pitfalls: ['Reassurance from a negative FAST in an unstable patient.', 'CT at the referring hospital delaying definitive care.'],
  live: [{ id: 'abd-fast', label: 'FAST: where free blood goes — and what it misses' }, { id: 'abd-solid-organ', label: 'Spleen and liver injury' }],
  questions: [
    { q: 'In <C>ABCDE, the <C> stands for:', options: ['Cervical collar', 'Catastrophic haemorrhage', 'Consciousness', 'Capnography'], answer: 1, why: 'Control massive external bleeding first.' },
    { q: 'The FAST window usually positive first in a supine patient:', options: ['Pelvis', 'Right upper quadrant (Morison\'s pouch)', 'Pericardium', 'LUQ'], answer: 1, why: 'Most dependent upper abdominal space.' },
    { q: 'A negative FAST in an unstable trauma patient:', options: ['Excludes haemorrhage', 'Does not exclude retroperitoneal or early bleeding', 'Means no surgery', 'Requires no reassessment'], answer: 1, why: 'Known limitations.' },
    { q: 'Absent lung sliding with a barcode M-mode suggests:', options: ['Haemothorax', 'Pneumothorax', 'Normal lung', 'Contusion'], answer: 1, why: 'No pleural movement.' },
    { q: 'Which is NOT seen on FAST?', options: ['Haemoperitoneum', 'Pericardial blood', 'Retroperitoneal haematoma from pelvic fracture', 'Pleural fluid with eFAST'], answer: 2, why: 'Retroperitoneum is outside FAST windows.' },
    { q: 'An unstable trauma patient with a positive FAST should go to:', options: ['CT', 'Haemorrhage control (theatre/IR)', 'MRI', 'Ward observation'], answer: 1, why: 'CT delays definitive care.' },
    { q: 'Class III haemorrhage represents blood loss of about:', options: ['< 15 %', '15–30 %', '30–40 %', '> 50 %'], answer: 2, why: 'Hypotension appears.' },
    { q: 'A supine haemothorax on chest film appears as:', options: ['A meniscus', 'Diffuse haziness of the hemithorax', 'Hyperlucency', 'Normal'], answer: 1, why: 'Fluid layers posteriorly.' },
    { q: 'Active contrast extravasation ("blush") on CT indicates:', options: ['Old haematoma', 'Ongoing bleeding', 'Infection', 'Normal enhancement'], answer: 1, why: 'Needs intervention.' },
    { q: 'A physiological trauma-centre triage criterion:', options: ['SBP < 90', 'Age 40', 'Ankle fracture', 'Laceration'], answer: 0, why: 'Field triage guidelines.' },
    { q: 'An open-book pelvic fracture is managed initially with:', options: ['Traction', 'Pelvic binder at the greater trochanters', 'Log-roll repeatedly', 'Ice'], answer: 1, why: 'Reduces pelvic volume and bleeding.' },
    { q: 'Ultrasound is more sensitive than ___ for pneumothorax:', options: ['CT', 'Supine chest X-ray', 'Auscultation in silence', 'MRI'], answer: 1, why: 'Supine films miss anterior air.' },
    { q: 'Class II haemorrhage typically shows:', options: ['Hypotension', 'Tachycardia with narrowed pulse pressure', 'Bradycardia', 'Coma'], answer: 1, why: 'Compensated shock.' },
    { q: 'In the secondary survey, AMPLE includes:', options: ['Allergies, Medications, Past history, Last meal, Events', 'Airway, Mental status, Pulse, Lungs, Extremities', 'Age, Mechanism, Pain, Location, Exposure', 'None'], answer: 0, why: 'Standard history mnemonic.' },
    { q: 'Should a hypotensive multi-trauma patient wait for CT at a rural hospital before transfer?', options: ['Yes, always', 'Generally no — transfer for definitive care', 'Only for head injuries', 'Only at night'], answer: 1, why: 'Avoid delays for imaging that will be repeated.' },
  ],
  sources: [
    { title: 'ACS Committee on Trauma: National guideline for the field triage of injured patients (2021)', url: 'https://www.facs.org/quality-programs/trauma/systems/field-triage-guidelines/' },
    { title: 'StatPearls: FAST exam', url: 'https://www.ncbi.nlm.nih.gov/books/NBK470479/' },
  ],
};

export const TRAUMA_LABS: FpcLesson = {
  id: 'fpc-trauma-labs', domain: 'trauma', ref: 'VII.2',
  title: 'Trauma lab values: coagulopathy, lactate and base deficit',
  summary: 'Trauma-induced coagulopathy, viscoelastic testing, lactate and base deficit as shock markers, and the lab changes of massive transfusion, crush and burns.',
  objectives: [
    'Recognise trauma-induced coagulopathy and its lab signature.',
    'Use lactate and base deficit to grade shock and track resuscitation.',
    'Anticipate electrolyte changes in massive transfusion, crush and burns.',
  ],
  sections: [
    {
      id: 'tic', title: 'Trauma-induced coagulopathy', core: true,
      body: [
        'Up to a quarter of severely injured patients arrive coagulopathic before any fluid is given. Tissue injury and shock activate protein C, consume fibrinogen and promote hyperfibrinolysis; dilution, hypothermia, acidosis and hypocalcaemia then worsen it. Coagulopathy on arrival is associated with markedly higher mortality.',
        'Labs show a prolonged PT/INR (INR above about 1.2–1.5 is a common threshold), prolonged aPTT, low fibrinogen (below about 1.5–2 g/L, or 150–200 mg/dL, is critical in haemorrhage) and falling platelets. Standard tests take time and reflect plasma, not whole-blood clotting.',
        'Viscoelastic tests (TEG, ROTEM) assess clot formation, strength and breakdown in whole blood within minutes and guide targeted therapy: plasma for slow clot initiation, fibrinogen or cryoprecipitate for weak clot from low fibrinogen, platelets for low maximum strength from platelet deficit, and tranexamic acid for hyperfibrinolysis.',
      ],
    },
    {
      id: 'shock', title: 'Lactate and base deficit', core: true,
      body: [
        'Lactate rises with tissue hypoperfusion; an initial lactate above about 4 mmol/L, or failure to clear it, predicts transfusion needs and mortality. Base deficit (negative base excess) reflects metabolic acidosis; a base deficit worse than −6 suggests significant shock and transfusion need, and worsening deficit despite resuscitation suggests ongoing bleeding.',
        'Both can be misleading: alcohol raises lactate; normal saline creates a hyperchloraemic acidosis that worsens base deficit without hypoperfusion; epinephrine raises lactate. Use trends with the clinical picture. Haemoglobin is a lagging indicator early after injury — a normal value does not exclude major bleeding.',
      ],
    },
    {
      id: 'electrolytes', title: 'Electrolytes in trauma', core: true,
      body: [
        'Massive transfusion: ionised calcium falls as citrate binds it — hypocalcaemia worsens coagulation and myocardial contractility, so give calcium early and repeatedly; stored red cells leak potassium (hyperkalaemia) and contain little 2,3-DPG; large volumes cause dilutional thrombocytopenia and coagulopathy.',
        'Crush injury and rhabdomyolysis: hyperkalaemia, hyperphosphataemia, hypocalcaemia, metabolic acidosis, raised creatine kinase and myoglobinuria with risk of acute kidney injury. Burns: early hyperkalaemia from cell lysis, later hypokalaemia; hypoalbuminaemia; and with carbon monoxide or cyanide exposure, raised carboxyhaemoglobin and lactate.',
        'Head injury: sodium disorders (SIADH, cerebral salt wasting, diabetes insipidus) and coagulopathy from released tissue factor. Hyperglycaemia is common and worsens outcomes in brain injury.',
      ],
      table: {
        caption: 'Lab targets in major haemorrhage (common guidance)',
        head: ['Test', 'Target'],
        rows: [['Haemoglobin', '> 7–9 g/dL during active bleeding (clinical judgement)'], ['Platelets', '> 50 × 10⁹/L (> 100 in head injury)'], ['INR', '< 1.5'], ['Fibrinogen', '> 1.5–2 g/L'], ['Ionised calcium', '> 1.1 mmol/L'], ['Temperature', '> 36 °C'], ['pH', '> 7.2']],
      },
    },
    {
      id: 'case', title: 'Transport case: the labs that change the plan',
      body: ['A pedestrian struck by a car: BP 92/58, HR 124 after 2 units of blood. Point-of-care results: Hb 9.4, INR 1.8, fibrinogen 1.1 g/L, lactate 6.8, base deficit −10, ionised calcium 0.92, temperature 35.1 °C.'],
      example: { case: 'Interpret and act.', steps: [
        'Trauma-induced coagulopathy with low fibrinogen, persistent shock (lactate, base deficit), hypocalcaemia and hypothermia — the lethal triad in progress.',
        'Balanced transfusion: plasma with red cells; fibrinogen concentrate or cryoprecipitate; platelets as available.',
        'Calcium chloride or gluconate now; active warming and warmed products.',
        'TXA if within 3 hours of injury; expedite surgical haemorrhage control.',
      ] },
    },
  ],
  keyPoints: [
    'Trauma-induced coagulopathy is present early in up to a quarter of major trauma.',
    'Low fibrinogen is critical — replace with fibrinogen concentrate or cryoprecipitate.',
    'Viscoelastic tests guide targeted product therapy and detect hyperfibrinolysis.',
    'Lactate > 4 or base deficit worse than −6 suggests significant shock; trends matter.',
    'Massive transfusion lowers calcium and raises potassium; crush raises potassium and CK.',
  ],
  pearls: ['Saline worsens base deficit without hypoperfusion.', 'Haemoglobin lags behind acute blood loss.'],
  pitfalls: ['Waiting for formal coagulation results before giving plasma in massive haemorrhage.', 'Forgetting calcium.'],
  live: [{ id: 'labs-coag', label: 'Clotting labs and reversal' }, { id: 'lactate', label: 'Lactate: made and cleared' }],
  questions: [
    { q: 'Proportion of major trauma patients coagulopathic on arrival:', options: ['< 1 %', 'Up to about 25 %', '75 %', '100 %'], answer: 1, why: 'Acute traumatic coagulopathy.' },
    { q: 'Critical fibrinogen level in haemorrhage:', options: ['< 4 g/L', '< 1.5–2 g/L', '< 0.1 g/L only', 'Not relevant'], answer: 1, why: 'Replace below this threshold.' },
    { q: 'Viscoelastic testing detects:', options: ['Only platelet count', 'Clot formation, strength and lysis in whole blood', 'Potassium', 'Lactate'], answer: 1, why: 'TEG and ROTEM assess whole-blood clotting.' },
    { q: 'Base deficit worse than −6 suggests:', options: ['Normal physiology', 'Significant shock and transfusion need', 'Alkalosis', 'Dehydration only'], answer: 1, why: 'Metabolic acidosis from hypoperfusion.' },
    { q: 'Which raises lactate without hypoperfusion?', options: ['Alcohol intoxication', 'Hypothermia only', 'Morphine', 'Normal saline'], answer: 0, why: 'Ethanol metabolism raises lactate.' },
    { q: 'Normal saline resuscitation tends to:', options: ['Improve base deficit', 'Worsen base deficit via hyperchloraemia', 'Raise calcium', 'Lower chloride'], answer: 1, why: 'Hyperchloraemic acidosis.' },
    { q: 'Citrate in transfused blood causes:', options: ['Hypercalcaemia', 'Hypocalcaemia', 'Hypokalaemia', 'Hyponatraemia'], answer: 1, why: 'Binds calcium.' },
    { q: 'Crush injury labs typically show:', options: ['Low potassium, low CK', 'High potassium, high CK, myoglobinuria', 'High calcium', 'Alkalosis'], answer: 1, why: 'Muscle breakdown.' },
    { q: 'Platelet target in traumatic brain injury haemorrhage:', options: ['> 20', '> 50', '> 100', '> 400 × 10⁹/L'], answer: 2, why: 'Higher threshold for intracranial bleeding.' },
    { q: 'TEG showing weak clot strength from low fibrinogen is treated with:', options: ['Platelets', 'Fibrinogen concentrate or cryoprecipitate', 'TXA only', 'Heparin'], answer: 1, why: 'Targeted therapy.' },
    { q: 'Ionised calcium target in massive transfusion:', options: ['> 0.5', '> 1.1 mmol/L', '> 2.5', 'Not monitored'], answer: 1, why: 'Supports coagulation and contractility.' },
    { q: 'Haemoglobin in early haemorrhage:', options: ['Falls immediately', 'Lags behind blood loss', 'Rises', 'Is diagnostic'], answer: 1, why: 'Concentration unchanged until dilution.' },
    { q: 'Worsening base deficit despite resuscitation suggests:', options: ['Recovery', 'Ongoing bleeding', 'Overhydration', 'Lab error always'], answer: 1, why: 'Persistent hypoperfusion.' },
    { q: 'Early burn electrolyte abnormality:', options: ['Hypokalaemia', 'Hyperkalaemia from cell lysis', 'Hypernatraemia', 'Hypercalcaemia'], answer: 1, why: 'Cell destruction releases potassium.' },
    { q: 'INR threshold commonly targeted in major haemorrhage:', options: ['< 3', '< 1.5', '< 0.5', '> 2'], answer: 1, why: 'Correct coagulopathy.' },
  ],
  sources: [
    { title: 'European guideline on management of major bleeding and coagulopathy following trauma (6th ed., 2023)', url: 'https://ccforum.biomedcentral.com/articles/10.1186/s13054-023-04327-7' },
    { title: 'StatPearls: Trauma-induced coagulopathy', url: 'https://www.ncbi.nlm.nih.gov/books/NBK580536/' },
  ],
};

export const TRAUMA_PHARM: FpcLesson = {
  id: 'fpc-trauma-pharm', domain: 'trauma', ref: 'VII.3',
  title: 'Trauma pharmacology: TXA, analgesia, RSI, reversal and antibiotics',
  summary: 'Tranexamic acid, analgesia and sedation in injured patients, induction choices in haemorrhagic shock and head injury, anticoagulant reversal, calcium, and antibiotics for open fractures.',
  objectives: [
    'Give TXA with correct timing and dose.',
    'Choose analgesic and induction agents that preserve perfusion.',
    'Reverse anticoagulants and give prophylactic antibiotics appropriately.',
  ],
  sections: [
    {
      id: 'txa', title: 'Tranexamic acid', core: true,
      body: [
        'TXA is an antifibrinolytic: it blocks the lysine-binding sites on plasminogen, preventing clot breakdown. In bleeding trauma patients it reduced death from bleeding when given within 3 hours of injury, with the greatest benefit in the first hour; given after 3 hours it showed no benefit and possible harm. The adult regimen used in major trials is 1 g IV over 10 minutes followed by 1 g over 8 hours; some prehospital systems give a 2 g bolus.',
        'TXA is also used in traumatic brain injury (mild to moderate TBI within 3 hours) and postpartum haemorrhage. Side effects include rare seizures at high doses and theoretical thrombosis. Record the time of injury and the time of administration — the receiving team needs both.',
      ],
    },
    {
      id: 'analgesia', title: 'Analgesia and sedation', core: true,
      body: [
        'Pain worsens physiology and outcomes; treat it. Fentanyl (1 mcg/kg IV/IN, titrated) has a rapid onset and less histamine release and hypotension than morphine. Ketamine at analgesic doses (0.1–0.3 mg/kg IV) preserves blood pressure and airway reflexes and works well in shocked or hypotensive patients and for splinting and extrication. Morphine causes histamine release and hypotension in hypovolaemia. Regional anaesthesia (for example, fascia iliaca block for hip fractures) reduces opioid need where trained.',
        'Avoid NSAIDs in bleeding or renal injury. In head injury, avoid oversedation that obscures neurological examination unless the patient is intubated; avoid hypotension at all costs.',
      ],
    },
    {
      id: 'rsi', title: 'Airway drugs in trauma', core: true,
      body: [
        'Haemorrhagic shock: resuscitate with blood before induction where possible; use a reduced dose of ketamine or etomidate; keep the paralytic dose full (rocuronium 1.2 mg/kg or more; succinylcholine 1.5–2 mg/kg if not contraindicated). Post-intubation hypotension is common — positive pressure reduces venous return in an empty circulation.',
        'Traumatic brain injury: avoid hypotension (a single systolic below 90 or 110 in some guidelines worsens outcome) and hypoxia. Ketamine is acceptable and maintains pressure. Succinylcholine is safe early after injury (hyperkalaemia risk appears after about 24–72 hours with burns, crush and denervation). An opioid helps blunt the pressor response to laryngoscopy if blood pressure allows.',
      ],
      table: {
        caption: 'Drug choices by scenario',
        head: ['Scenario', 'Induction', 'Paralytic', 'Analgesia'],
        rows: [['Haemorrhagic shock', 'Ketamine (reduced)', 'Rocuronium full dose', 'Ketamine, fentanyl (small)'], ['Isolated TBI, normotensive', 'Ketamine or etomidate', 'Rocuronium or succinylcholine', 'Fentanyl'], ['Burns > 24–72 h', 'Ketamine', 'Rocuronium (no succinylcholine)', 'Fentanyl, ketamine'], ['Crush with hyperkalaemia', 'Ketamine', 'Rocuronium', 'Fentanyl']],
      },
    },
    {
      id: 'reversal', title: 'Anticoagulants, calcium and antibiotics',
      body: [
        'Older trauma patients frequently take anticoagulants or antiplatelets; even minor head injuries can bleed. Warfarin: 4-factor PCC plus IV vitamin K. Dabigatran: idarucizumab. Factor Xa inhibitors: andexanet alfa or PCC per protocol. Heparin: protamine. Antiplatelet reversal is limited; platelet transfusion is selective.',
        'Calcium: give early in massive transfusion (for example calcium chloride 1 g with every few units, or per protocol). Open fractures: give IV antibiotics (commonly a first-generation cephalosporin such as cefazolin, with gram-negative coverage for heavily contaminated wounds per protocol) as early as possible — ideally within an hour — and update tetanus status.',
      ],
      example: {
        case: 'An 82-year-old on apixaban falls and hits her head: GCS 14, headache, vomiting once.',
        steps: ['High risk of intracranial haemorrhage despite a "minor" mechanism.', 'Transport to a centre with CT and neurosurgery.', 'Reversal per protocol once haemorrhage is confirmed (or empirically if deteriorating).', 'Avoid hypotension; repeat neuro checks frequently.'],
      },
    },
  ],
  keyPoints: [
    'TXA 1 g over 10 min then 1 g over 8 h, within 3 h of injury (earlier is better).',
    'Fentanyl or analgesic ketamine for shocked patients; avoid morphine-induced hypotension and NSAIDs.',
    'Haemorrhagic shock: reduced induction dose, full paralytic dose, blood first.',
    'TBI: avoid any hypotension or hypoxia; succinylcholine is safe early.',
    'Reverse anticoagulants per agent; give calcium in massive transfusion; antibiotics within an hour for open fractures.',
  ],
  pearls: ['Record injury time and TXA time.', 'Anticoagulated elders with minor head injury need imaging.'],
  pitfalls: ['TXA beyond 3 hours.', 'Full-dose induction in a bleeding patient.'],
  live: [{ id: 'moa-txa', label: 'Tranexamic acid: mechanism' }, { id: 'moa-ketamine', label: 'Ketamine: mechanism' }, { id: 'moa-pcc', label: 'PCC: mechanism' }],
  questions: [
    { q: 'TXA should be given within:', options: ['1 day', '3 hours of injury', '12 hours', 'Any time'], answer: 1, why: 'Later use showed harm.' },
    { q: 'Standard trauma TXA regimen:', options: ['100 mg once', '1 g over 10 min then 1 g over 8 h', '5 g bolus', '1 g daily for 7 days'], answer: 1, why: 'CRASH-2 regimen.' },
    { q: 'TXA works by:', options: ['Activating factor VII', 'Blocking plasminogen lysine-binding sites', 'Binding heparin', 'Platelet activation'], answer: 1, why: 'Antifibrinolytic.' },
    { q: 'Analgesic least likely to cause hypotension in a hypovolaemic patient:', options: ['Morphine', 'Ketamine', 'Propofol', 'Midazolam'], answer: 1, why: 'Sympathomimetic.' },
    { q: 'Analgesic-dose ketamine:', options: ['1–2 mg/kg', '0.1–0.3 mg/kg', '5 mg/kg', '10 mg/kg'], answer: 1, why: 'Sub-dissociative.' },
    { q: 'In haemorrhagic shock RSI, the paralytic dose should be:', options: ['Halved', 'Full or increased', 'Omitted', 'Doubled induction instead'], answer: 1, why: 'Slow circulation delays onset.' },
    { q: 'Succinylcholine in acute TBI within hours of injury:', options: ['Contraindicated', 'Acceptable', 'Causes immediate hyperkalaemia always', 'Raises ICP permanently'], answer: 1, why: 'Up-regulation develops later.' },
    { q: 'Succinylcholine becomes dangerous in burns after about:', options: ['1 hour', '24–72 hours', '6 months only', 'Never'], answer: 1, why: 'Receptor up-regulation.' },
    { q: 'A single SBP below about ___ worsens TBI outcomes:', options: ['150', '90', '60', '200'], answer: 1, why: 'Avoid hypotension.' },
    { q: 'Warfarin reversal in trauma haemorrhage:', options: ['Protamine', 'PCC + IV vitamin K', 'Idarucizumab', 'Platelets'], answer: 1, why: 'Rapid factor replacement.' },
    { q: 'Open fracture antibiotics should start:', options: ['Within 24 h', 'As early as possible, ideally within 1 h', 'Only after surgery', 'Not needed'], answer: 1, why: 'Reduces infection.' },
    { q: 'NSAIDs in a bleeding trauma patient:', options: ['First-line', 'Avoid', 'Required', 'Neutral'], answer: 1, why: 'Impair platelets and kidneys.' },
    { q: 'Calcium in massive transfusion is given:', options: ['Never', 'Early and repeatedly', 'Only if K⁺ low', 'After 20 units'], answer: 1, why: 'Citrate-induced hypocalcaemia.' },
    { q: 'Morphine may cause hypotension through:', options: ['Bradycardia only', 'Histamine release and venodilation', 'Hyperkalaemia', 'Vasoconstriction'], answer: 1, why: 'Particularly in hypovolaemia.' },
    { q: 'Dabigatran reversal:', options: ['Andexanet', 'Idarucizumab', 'Protamine', 'Vitamin K'], answer: 1, why: 'Specific antibody fragment.' },
  ],
  sources: [
    { title: 'CRASH-2 trial. Lancet (2010)', url: 'https://pubmed.ncbi.nlm.nih.gov/20554319/' },
    { title: 'CRASH-3: TXA in traumatic brain injury. Lancet (2019)', url: 'https://pubmed.ncbi.nlm.nih.gov/31623894/' },
    { title: 'Brain Trauma Foundation guidelines (4th ed.)', url: 'https://braintrauma.org/coma/guidelines' },
  ],
};
