/** FP-C VI.12, VI.14, VI.15: vascular disorders; cardiac diagnostics; cardiac lab values. */
import type { FpcLesson } from '../types';

export const VASCULAR: FpcLesson = {
  id: 'fpc-vascular', domain: 'cardiac', ref: 'VI.12',
  title: 'Vascular emergencies: aortic dissection, AAA and limb ischaemia',
  summary: 'Recognising thoracic aortic dissection and ruptured abdominal aortic aneurysm, impulse control, permissive hypotension, destination decisions, and acute limb ischaemia.',
  objectives: [
    'Recognise and classify aortic dissection and start impulse control.',
    'Manage ruptured AAA with permissive hypotension and rapid transfer.',
    'Identify acute limb ischaemia and its time-critical treatment.',
  ],
  sections: [
    {
      id: 'dissection', title: 'Aortic dissection', core: true,
      body: [
        'A tear in the intima lets blood split the aortic wall, creating a true and a false lumen. Classic features are sudden, severe, tearing or ripping chest or back pain at maximal intensity from onset, a pulse or blood pressure difference between the arms (more than 20 mmHg), a new diastolic murmur of aortic regurgitation, and neurological deficits. Risk factors: hypertension, connective tissue disease (Marfan, Ehlers–Danlos), bicuspid aortic valve, cocaine, pregnancy and recent aortic procedures.',
        'Stanford type A involves the ascending aorta and is a surgical emergency (complications: tamponade, acute aortic regurgitation, coronary occlusion, stroke). Type B involves only the descending aorta and is usually managed medically unless complicated by malperfusion, rupture or refractory pain.',
        'Impulse control comes first: lower heart rate to about 60 with a short-acting beta-blocker (esmolol or labetalol), then lower systolic pressure below about 120 with a vasodilator (nicardipine, clevidipine) as tolerated by perfusion. A vasodilator alone causes reflex tachycardia and more shear. Analgesia reduces sympathetic drive. Avoid anticoagulants and fibrinolytics — a dissection can mimic STEMI (especially inferior STEMI from RCA involvement).',
      ],
    },
    {
      id: 'aaa', title: 'Ruptured abdominal aortic aneurysm', core: true,
      body: [
        'An AAA is a permanent dilation of the abdominal aorta to 3 cm or more; rupture risk rises with diameter (above 5.5 cm usually warrants repair). Rupture presents with abdominal, back or flank pain, a pulsatile mass (often hard to feel), hypotension and syncope — commonly misdiagnosed as renal colic in older patients. Most ruptures are retroperitoneal and temporarily contained; free intraperitoneal rupture is usually fatal.',
        'Bedside ultrasound showing an aorta over 3 cm in a hypotensive older patient with pain is strongly suggestive. Use permissive hypotension — target a systolic around 70–90 mmHg or the lowest pressure that maintains mentation — to avoid disrupting the contained haematoma, give blood products rather than crystalloid, and transport immediately to a vascular centre capable of open or endovascular repair.',
      ],
    },
    {
      id: 'limb', title: 'Acute limb ischaemia', core: true,
      body: [
        'Sudden loss of limb perfusion from embolism (often atrial fibrillation) or thrombosis presents with the "six Ps": pain, pallor, pulselessness, paraesthesia, paralysis and poikilothermia (cold). Sensory loss and paralysis indicate threatened limb viability; revascularisation within about 6 hours preserves the most tissue.',
        'Start anticoagulation with unfractionated heparin per protocol (unless contraindicated), keep the limb dependent and protected, give analgesia, and transfer to a vascular centre. After reperfusion, watch for compartment syndrome and reperfusion hyperkalaemia and myoglobinuria.',
      ],
      table: {
        caption: 'Dissection versus ruptured AAA',
        head: ['Feature', 'Thoracic dissection', 'Ruptured AAA'],
        rows: [['Pain', 'Tearing chest/back, abrupt', 'Abdominal/back/flank'], ['BP', 'Often hypertensive (type B); may be hypotensive', 'Hypotensive, syncope'], ['Key exam', 'Arm BP difference, AR murmur, deficits', 'Pulsatile mass, aorta > 3 cm on US'], ['Treatment', 'β-blocker then vasodilator; surgery for type A', 'Permissive hypotension, blood, repair']],
      },
    },
    {
      id: 'case', title: 'Transport case: the "renal colic"',
      body: ['A 72-year-old male smoker with sudden left flank pain and a syncopal episode: BP 88/52, HR 104 (on a beta-blocker), pale. Bedside ultrasound shows a 6.4 cm infrarenal aorta.'],
      example: { case: 'Manage and route.', steps: [
        'Ruptured AAA until proven otherwise.',
        'Two large-bore lines; blood products; permissive hypotension (SBP ~70–90 if mentating).',
        'Avoid large crystalloid volumes and aggressive vasopressors.',
        'Direct transport to a vascular centre with pre-alert; minimise scene and handover time.',
      ] },
    },
  ],
  keyPoints: [
    'Dissection: abrupt tearing pain, arm BP difference, AR murmur, deficits.',
    'Type A (ascending) = surgery; type B = medical unless complicated.',
    'Impulse control: β-blocker to HR ~60 first, then vasodilator to SBP < 120.',
    'Ruptured AAA: permissive hypotension, blood, rapid transfer to vascular surgery.',
    'Acute limb ischaemia: six Ps; heparin and revascularisation within ~6 hours.',
  ],
  pearls: ['A dissection can mimic inferior STEMI — never lyse without considering it.', 'Older patients with "renal colic" and hypotension need an aortic scan.'],
  pitfalls: ['Vasodilator without beta-blockade in dissection.', 'Aggressive crystalloid in ruptured AAA.'],
  live: [{ id: 'abd-dissection', label: 'Aortic dissection: type, extent, malperfusion' }, { id: 'abd-aaa', label: 'Abdominal aortic aneurysm' }],
  questions: [
    { q: 'Classic dissection pain is:', options: ['Gradual, pressure-like', 'Sudden, tearing, maximal at onset', 'Pleuritic only', 'Positional'], answer: 1, why: 'Abrupt onset is typical.' },
    { q: 'Stanford type A dissection involves:', options: ['Descending aorta only', 'Ascending aorta', 'Abdominal aorta only', 'Iliac arteries'], answer: 1, why: 'Surgical emergency.' },
    { q: 'First drug in dissection:', options: ['Nicardipine', 'Esmolol', 'Hydralazine', 'Nitroprusside alone'], answer: 1, why: 'Rate control before vasodilation.' },
    { q: 'Target heart rate in dissection:', options: ['~60', '~90', '~120', 'No target'], answer: 0, why: 'Reduce shear stress.' },
    { q: 'An arm BP difference of more than ___ mmHg suggests dissection:', options: ['5', '20', '60', '100'], answer: 1, why: 'Significant inter-arm difference.' },
    { q: 'Type A dissection complication causing hypotension:', options: ['Hyperkalaemia', 'Tamponade', 'Pneumothorax', 'Hyperglycaemia'], answer: 1, why: 'Rupture into the pericardium.' },
    { q: 'AAA is defined as an aortic diameter of at least:', options: ['1.5 cm', '3 cm', '6 cm', '10 cm'], answer: 1, why: 'Aneurysmal dilation.' },
    { q: 'Ruptured AAA resuscitation target:', options: ['SBP > 140', 'Permissive hypotension (SBP ~70–90 if mentating)', 'MAP 100', 'No fluids at all'], answer: 1, why: 'Avoid disrupting the contained haematoma.' },
    { q: 'A common misdiagnosis of ruptured AAA:', options: ['Pneumonia', 'Renal colic', 'Migraine', 'Gout'], answer: 1, why: 'Flank pain in older patients.' },
    { q: 'Six Ps of acute limb ischaemia include all EXCEPT:', options: ['Pallor', 'Pulselessness', 'Paralysis', 'Pyrexia'], answer: 3, why: 'Poikilothermia, not pyrexia.' },
    { q: 'Initial drug for acute limb ischaemia without contraindications:', options: ['Aspirin only', 'Unfractionated heparin', 'Vasopressor', 'Steroids'], answer: 1, why: 'Prevent propagation.' },
    { q: 'Why avoid fibrinolytics until dissection is excluded?', options: ['They cause bradycardia', 'Catastrophic bleeding risk', 'They raise BP', 'No reason'], answer: 1, why: 'Dissection can mimic STEMI.' },
    { q: 'Type B dissection is managed surgically/endovascularly when:', options: ['Always', 'Complicated (malperfusion, rupture, refractory pain)', 'Never', 'BP is normal'], answer: 1, why: 'Uncomplicated type B is medical.' },
    { q: 'After limb revascularisation, watch for:', options: ['Hypokalaemia', 'Compartment syndrome and hyperkalaemia', 'Hypertension only', 'Hypoglycaemia'], answer: 1, why: 'Reperfusion injury.' },
    { q: 'Connective tissue disease linked to dissection:', options: ['Lupus only', 'Marfan syndrome', 'Psoriasis', 'Gout'], answer: 1, why: 'Weak aortic wall.' },
  ],
  sources: [
    { title: '2022 ACC/AHA guideline for diagnosis and management of aortic disease', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001106' },
    { title: 'StatPearls: Aortic dissection', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Aortic+dissection+StatPearls' },
  ],
};

export const CARDIAC_DX: FpcLesson = {
  id: 'fpc-cardiac-dx', domain: 'cardiac', ref: 'VI.14',
  title: 'Cardiac diagnostics: point-of-care echo and ultrasound',
  summary: 'Focused cardiac ultrasound views, what each answers — effusion, LV function, RV strain, volume status — and integrating ultrasound with the ECG and labs.',
  objectives: [
    'Obtain and interpret the four basic cardiac views.',
    'Identify effusion and tamponade, LV dysfunction, RV strain and volume status.',
    'Use ultrasound during cardiac arrest without interrupting compressions.',
  ],
  sections: [
    {
      id: 'views', title: 'Four views', core: true,
      body: [
        'Subxiphoid (subcostal): probe under the xiphoid aiming toward the left shoulder; the best view for pericardial effusion and the one used during CPR. Parasternal long axis: left of the sternum at the third or fourth intercostal space, marker toward the right shoulder; shows the LV, mitral and aortic valves, and helps distinguish pericardial from pleural fluid (pericardial fluid tracks anterior to the descending aorta). Parasternal short axis: rotate 90° for a cross-section of the LV ("doughnut") and RV — good for septal shape. Apical four-chamber: at the point of maximal impulse; compares RV and LV size.',
        'Add the IVC (subcostal long axis) for filling assessment, and lung views for B-lines, effusions and pneumothorax.',
      ],
    },
    {
      id: 'findings', title: 'What to look for', core: true,
      body: [
        'Pericardial effusion appears as an anechoic (black) stripe around the heart. Tamponade adds right atrial systolic collapse and right ventricular diastolic collapse with a plethoric IVC. LV function is graded visually — hyperdynamic, normal, reduced or severely reduced — by wall thickening and endocardial movement; mitral valve leaflet movement close to the septum (E-point septal separation under about 7 mm) suggests normal function.',
        'Acute RV strain (massive PE): an RV as large as or larger than the LV in the apical view, septal flattening ("D sign") in the short axis, and sometimes McConnell sign (RV free-wall hypokinesis with apical sparing). A small, collapsing IVC suggests low filling pressure in a spontaneously breathing patient; a plethoric IVC suggests high right-sided pressure — but neither is decisive alone.',
      ],
      table: {
        caption: 'Ultrasound patterns in shock',
        head: ['Pattern', 'Heart', 'IVC', 'Think'],
        rows: [['Hypovolaemic', 'Small, hyperdynamic', 'Small, collapsing', 'Bleeding, dehydration'], ['Distributive', 'Hyperdynamic', 'Small or normal', 'Sepsis, anaphylaxis'], ['Cardiogenic', 'Poor LV function', 'Plethoric', 'MI, cardiomyopathy'], ['Obstructive (tamponade)', 'Effusion, RV collapse', 'Plethoric', 'Drain'], ['Obstructive (PE)', 'Dilated RV, D sign', 'Plethoric', 'Thrombolysis/embolectomy']],
      },
    },
    {
      id: 'arrest', title: 'Ultrasound in cardiac arrest', core: true,
      body: [
        'Use the subxiphoid view during the rhythm check and limit it to 10 seconds or less — prolonged scanning increases pauses in compressions. Record a clip and review it while compressions resume. Look for cardiac motion (organised activity suggests "pseudo-PEA" with very low output, which may respond to vasopressors), tamponade, a dilated RV, and gross hypovolaemia. Absent cardiac activity after prolonged resuscitation supports decisions to stop, alongside other factors.',
      ],
      example: {
        case: 'A PEA arrest in a post-operative patient: during the pulse check, the subxiphoid view shows a large effusion with a collapsed RV.',
        steps: ['Tamponade: a reversible cause.', 'Continue CPR and perform pericardiocentesis (ultrasound-guided if possible).', 'Reassess rhythm and pulse after drainage; prepare for surgical drainage.'],
      },
    },
    {
      id: 'limits', title: 'Limits and integration',
      body: [
        'Focused ultrasound answers yes/no questions; it does not replace comprehensive echocardiography. Body habitus, ventilation, lung disease, wounds and movement in flight limit images. Integrate with the ECG (for example, regional wall motion abnormality supporting ischaemia), labs (troponin, BNP, lactate) and the clinical picture. Document who scanned, when, and the views obtained.',
      ],
    },
  ],
  keyPoints: [
    'Views: subxiphoid (effusion, CPR), parasternal long and short, apical four-chamber, plus IVC.',
    'Tamponade: effusion + RA systolic and RV diastolic collapse + plethoric IVC.',
    'Massive PE: RV ≥ LV, septal D sign, McConnell sign.',
    'Small hyperdynamic heart + collapsing IVC = hypovolaemia; poor LV + plethoric IVC = cardiogenic.',
    'In arrest: subxiphoid during pulse checks, ≤ 10 seconds, record and review.',
  ],
  pearls: ['Pericardial fluid lies anterior to the descending aorta; pleural fluid lies posterior.', 'Organised cardiac motion in "PEA" suggests very low output that may respond to pressors.'],
  pitfalls: ['Long scans that interrupt CPR.', 'Over-interpreting IVC size in ventilated patients.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states at the bedside' }],
  questions: [
    { q: 'Best view for pericardial effusion during CPR:', options: ['Apical four-chamber', 'Subxiphoid', 'Parasternal short', 'Suprasternal'], answer: 1, why: 'Accessible without interrupting compressions much.' },
    { q: 'Septal flattening (D sign) indicates:', options: ['LV failure', 'RV pressure overload', 'Hypovolaemia', 'Normal heart'], answer: 1, why: 'RV pressure pushes the septum.' },
    { q: 'RV diastolic collapse with effusion suggests:', options: ['Normal', 'Tamponade', 'PE', 'Cardiomyopathy'], answer: 1, why: 'Pericardial pressure exceeds RV pressure.' },
    { q: 'Small hyperdynamic LV with collapsing IVC suggests:', options: ['Cardiogenic shock', 'Hypovolaemia', 'Tamponade', 'PE'], answer: 1, why: 'Empty tank.' },
    { q: 'Maximum duration of ultrasound during a pulse check:', options: ['10 seconds', '30 seconds', '1 minute', 'No limit'], answer: 0, why: 'Minimise compression pauses.' },
    { q: 'Pericardial effusion is distinguished from pleural by relation to:', options: ['IVC', 'Descending aorta', 'Liver', 'Spleen'], answer: 1, why: 'Pericardial fluid lies anterior to it.' },
    { q: 'McConnell sign is associated with:', options: ['Tamponade', 'Acute PE', 'HCM', 'Aortic stenosis'], answer: 1, why: 'RV free wall hypokinesis, apical sparing.' },
    { q: 'Organised cardiac activity on ultrasound in PEA suggests:', options: ['True asystole', 'Pseudo-PEA with very low output', 'Normal output', 'VF'], answer: 1, why: 'May respond to vasopressors.' },
    { q: 'E-point septal separation under ~7 mm suggests:', options: ['Reduced EF', 'Normal LV function', 'Tamponade', 'RV strain'], answer: 1, why: 'Good LV filling and function.' },
    { q: 'IVC assessment is least reliable in:', options: ['Spontaneously breathing patients', 'Ventilated patients', 'Children', 'Hypovolaemia'], answer: 1, why: 'Positive pressure distends it.' },
    { q: 'Poor LV function with plethoric IVC suggests:', options: ['Distributive shock', 'Cardiogenic shock', 'Hypovolaemia', 'Normal'], answer: 1, why: 'Pump failure.' },
    { q: 'Parasternal short axis is best for assessing:', options: ['Pericardial fluid only', 'Septal shape and LV cross-section', 'Aorta', 'IVC'], answer: 1, why: 'Doughnut view.' },
    { q: 'Focused cardiac ultrasound is designed to:', options: ['Replace formal echo', 'Answer specific yes/no questions', 'Measure valves precisely', 'Diagnose congenital disease'], answer: 1, why: 'Goal-directed.' },
    { q: 'RV larger than LV in the apical view during shock suggests:', options: ['Normal', 'Acute RV strain (PE)', 'Hypovolaemia', 'LV hypertrophy'], answer: 1, why: 'Normal RV:LV < 0.6–1.' },
    { q: 'Hyperdynamic heart with small IVC and fever suggests:', options: ['Cardiogenic shock', 'Distributive shock with hypovolaemia', 'Tamponade', 'PE'], answer: 1, why: 'Sepsis pattern.' },
  ],
  sources: [
    { title: 'StatPearls: Focused cardiac ultrasound', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Focused+cardiac+ultrasound+StatPearls' },
    { title: 'Huis in \'t Veld MA et al. Ultrasound use during CPR and pause duration. Resuscitation (2017)', url: 'https://pubmed.ncbi.nlm.nih.gov/28859811/' },
  ],
};

export const CARDIAC_LABS: FpcLesson = {
  id: 'fpc-cardiac-labs', domain: 'cardiac', ref: 'VI.15',
  title: 'Cardiac lab values: troponin, BNP, electrolytes and drug levels',
  summary: 'High-sensitivity troponin pathways, natriuretic peptides, D-dimer, lactate, and the electrolytes and drug levels that drive arrhythmias.',
  objectives: [
    'Interpret troponin trends and recognise non-ischaemic causes of elevation.',
    'Use BNP and D-dimer appropriately.',
    'Link potassium, magnesium, calcium and digoxin levels to ECG findings and arrhythmias.',
  ],
  sections: [
    {
      id: 'troponin', title: 'Troponin', core: true,
      body: [
        'Cardiac troponin I or T is released when myocytes are injured. High-sensitivity assays detect very small amounts within 1–3 hours of injury. Myocardial injury is a troponin value above the 99th percentile upper reference limit; acute injury shows a rise and/or fall on serial testing. Myocardial infarction requires acute injury plus clinical evidence of ischaemia (symptoms, ECG changes, imaging).',
        'Type 1 MI is plaque rupture with thrombosis. Type 2 MI is supply–demand mismatch: tachyarrhythmia, hypotension, anaemia, hypoxaemia, severe hypertension. Non-ischaemic injury raises troponin too: myocarditis, PE, sepsis, heart failure, renal failure (often chronically elevated), stroke, cardiac contusion and defibrillation. STEMI is diagnosed on the ECG; never wait for troponin to activate reperfusion.',
      ],
    },
    {
      id: 'bnp', title: 'BNP, D-dimer and lactate', core: true,
      body: [
        'BNP and NT-proBNP rise with ventricular wall stress. Low values make acute heart failure unlikely in a dyspnoeic patient; high values support it but also occur with renal failure, PE, sepsis, AF and older age. Obesity lowers levels.',
        'D-dimer is a fibrin degradation product: sensitive but non-specific. A normal D-dimer in a patient with low or intermediate pre-test probability helps exclude PE and DVT; it is raised in dissection, sepsis, malignancy, pregnancy, surgery and trauma, so a high value proves little. Lactate rises with hypoperfusion and in cardiogenic shock tracks severity and response to treatment.',
      ],
    },
    {
      id: 'electrolytes', title: 'Electrolytes and arrhythmias', core: true,
      body: [
        'Potassium: hyperkalaemia causes peaked T waves, PR prolongation, QRS widening, sine waves and arrest; hypokalaemia causes U waves, ST depression, QT/QU prolongation and ventricular ectopy, and increases digoxin toxicity. Magnesium: low levels predispose to torsades and refractory hypokalaemia; replete magnesium before or with potassium. Calcium: hypocalcaemia prolongs the QT; hypercalcaemia shortens it.',
        'Targets in high-risk cardiac patients (post-MI, arrhythmias): potassium above about 4.0 and magnesium above about 2.0 mg/dL are commonly used.',
      ],
      table: {
        caption: 'Electrolytes on the ECG',
        head: ['Disturbance', 'ECG'],
        rows: [['Hyperkalaemia', 'Peaked T → long PR, flat P → wide QRS → sine wave'], ['Hypokalaemia', 'U waves, ST depression, long QU, ectopy'], ['Hypomagnesaemia', 'Long QT, torsades'], ['Hypocalcaemia', 'Long QT (long ST segment)'], ['Hypercalcaemia', 'Short QT']],
      },
    },
    {
      id: 'digoxin', title: 'Digoxin and other drug levels',
      body: [
        'Digoxin toxicity causes nausea, vomiting, visual changes (yellow-green tinge), confusion and almost any arrhythmia — classically bidirectional VT, atrial tachycardia with block, and bradycardia — with hyperkalaemia in acute overdose. The "digoxin effect" (scooped ST depression) is not toxicity. Risk rises with renal failure, hypokalaemia and drug interactions (amiodarone). Treat significant toxicity with digoxin-specific antibody fragments; calcium for hyperkalaemia in digoxin toxicity is now considered acceptable by many, but the antidote is the priority.',
      ],
      example: {
        case: 'An 84-year-old on digoxin and furosemide: vomiting, confusion, HR 42 with junctional rhythm, K⁺ 3.0, creatinine 2.6.',
        steps: ['Chronic digoxin toxicity precipitated by renal failure and hypokalaemia.', 'Digoxin-specific antibody fragments per toxicology advice.', 'Replace potassium and magnesium cautiously; atropine or pacing for symptomatic bradycardia.', 'Monitor in flight; avoid further digoxin.'],
      },
    },
    {
      id: 'case', title: 'Transport case: troponin without a blocked artery',
      body: ['A 35-year-old with fever, cough and new atrial fibrillation at 160: troponin elevated and rising; ECG shows no ST elevation; BP 98/60.'],
      example: { case: 'Is this an MI?', steps: [
        'Acute myocardial injury (rising troponin) — causes include type 2 MI from tachycardia and fever, myocarditis or sepsis.',
        'Treat the drivers: rate control or cardioversion if unstable, fever control, infection treatment, oxygen if hypoxaemic.',
        'Antithrombotic therapy decisions depend on the mechanism; do not reflexively treat as type 1 MI.',
        'Echo at the destination to assess for myocarditis or regional wall motion abnormalities.',
      ] },
    },
  ],
  keyPoints: [
    'Acute myocardial injury = troponin above the 99th percentile with a rise/fall; MI needs ischaemia too.',
    'Type 2 MI = supply–demand mismatch; many non-ischaemic causes raise troponin.',
    'Never delay STEMI reperfusion for troponin.',
    'Low BNP argues against acute HF; normal D-dimer helps exclude PE in low-risk patients.',
    'Low K⁺ and Mg²⁺ predispose to arrhythmias and digoxin toxicity; treat digoxin toxicity with antibody fragments.',
  ],
  pearls: ['Bidirectional VT suggests digoxin toxicity.', 'Chronic renal failure often raises baseline troponin — trends matter.'],
  pitfalls: ['Waiting for troponin before activating the cath lab for STEMI.', 'Using a high D-dimer as proof of PE.'],
  questions: [
    { q: 'Myocardial injury is troponin above:', options: ['The 50th percentile', 'The 99th percentile upper reference limit', 'Twice normal', 'Any detectable level'], answer: 1, why: 'Universal definition.' },
    { q: 'Type 2 MI results from:', options: ['Plaque rupture', 'Supply–demand mismatch', 'Coronary dissection always', 'Embolism only'], answer: 1, why: 'E.g. tachycardia, anaemia, hypotension.' },
    { q: 'STEMI reperfusion should be activated based on:', options: ['Troponin', 'ECG and clinical picture', 'BNP', 'D-dimer'], answer: 1, why: 'Do not wait for biomarkers.' },
    { q: 'A low BNP in a dyspnoeic patient:', options: ['Confirms HF', 'Makes acute HF unlikely', 'Indicates PE', 'Is meaningless'], answer: 1, why: 'High negative predictive value.' },
    { q: 'D-dimer is most useful to:', options: ['Confirm PE', 'Help exclude PE in low/intermediate risk', 'Diagnose MI', 'Monitor heparin'], answer: 1, why: 'Sensitive, non-specific.' },
    { q: 'U waves suggest:', options: ['Hyperkalaemia', 'Hypokalaemia', 'Hypercalcaemia', 'Normal'], answer: 1, why: 'Classic hypokalaemia sign.' },
    { q: 'Hypomagnesaemia predisposes to:', options: ['Short QT', 'Torsades de pointes', 'Peaked T waves', 'Bradycardia only'], answer: 1, why: 'QT prolongation.' },
    { q: 'Bidirectional VT suggests:', options: ['Hyperkalaemia', 'Digoxin toxicity', 'WPW', 'Brugada'], answer: 1, why: 'Classic association.' },
    { q: 'Digoxin toxicity risk is increased by:', options: ['Hyperkalaemia', 'Hypokalaemia and renal failure', 'Hypercalcaemia only', 'Bradycardia'], answer: 1, why: 'Reduced clearance and enhanced binding.' },
    { q: 'Antidote for severe digoxin toxicity:', options: ['Naloxone', 'Digoxin-specific antibody fragments', 'Atropine only', 'Calcium alone'], answer: 1, why: 'Binds digoxin.' },
    { q: 'Hypocalcaemia on ECG:', options: ['Short QT', 'Long QT', 'Peaked T', 'Delta wave'], answer: 1, why: 'Prolonged ST segment.' },
    { q: 'High-sensitivity troponin detects injury within about:', options: ['10 minutes', '1–3 hours', '24 hours', '3 days'], answer: 1, why: 'Rapid rule-in/out pathways.' },
    { q: 'Common potassium target in post-MI arrhythmia patients:', options: ['> 2.5', '> 4.0', '> 6.0', '< 3.0'], answer: 1, why: 'Reduces ventricular arrhythmias.' },
    { q: 'Scooped ST depression in a patient on digoxin without symptoms:', options: ['Toxicity', 'Digoxin effect', 'STEMI', 'Hyperkalaemia'], answer: 1, why: 'Expected therapeutic finding.' },
    { q: 'Obesity tends to:', options: ['Raise BNP', 'Lower BNP', 'Not affect BNP', 'Raise troponin'], answer: 1, why: 'Adipose clearance of natriuretic peptides.' },
  ],
  sources: [
    { title: 'Fourth Universal Definition of Myocardial Infarction (2018)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000617' },
    { title: 'StatPearls: Digoxin toxicity', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Digoxin+toxicity+StatPearls' },
  ],
};
