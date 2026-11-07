/** FP-C VI.9–VI.11: hypertensive crisis; haemodynamic instability; chronic cardiac conditions. */
import type { FpcLesson } from '../types';

export const HTN_CRISIS: FpcLesson = {
  id: 'fpc-htn-crisis', domain: 'cardiac', ref: 'VI.9',
  title: 'Hypertensive emergencies',
  summary: 'Separating hypertensive emergency from urgency, organ-specific blood pressure targets, the drugs that lower pressure smoothly, and the conditions where the rules change.',
  objectives: [
    'Distinguish hypertensive emergency (end-organ damage) from severe hypertension without it.',
    'Apply organ-specific targets and rates of reduction.',
    'Choose titratable IV agents and avoid harmful ones.',
  ],
  sections: [
    {
      id: 'define', title: 'Emergency or urgency?', core: true,
      body: [
        'Severe hypertension (often above 180/120) becomes a hypertensive emergency when it causes acute end-organ injury: hypertensive encephalopathy, stroke (ischaemic or haemorrhagic), acute coronary syndrome, acute pulmonary oedema, aortic dissection, acute kidney injury, pre-eclampsia or eclampsia, or retinal haemorrhage and papilloedema. Without organ injury, the pressure is lowered gradually over hours to days with oral agents.',
        'Chronic hypertension shifts cerebral autoregulation to higher pressures; dropping the pressure too fast causes cerebral, coronary or renal ischaemia. The general rule for most emergencies is to lower MAP by no more than about 20–25 % in the first hour, then toward 160/100 over the next 2–6 hours, then to normal over 24–48 hours.',
      ],
    },
    {
      id: 'targets', title: 'Exceptions with their own targets', core: true,
      body: [
        'Aortic dissection: rapid control — heart rate around 60 and systolic below about 120 within 20 minutes or so — with a beta-blocker first (esmolol or labetalol), then a vasodilator if needed. Pre-eclampsia/eclampsia with severe range pressures (≥ 160 systolic or ≥ 110 diastolic): treat within 30–60 minutes with IV labetalol or hydralazine or oral nifedipine, plus magnesium for seizure prophylaxis. Acute ischaemic stroke: lower only if above 185/110 before thrombolysis (and keep below 180/105 afterwards), or above 220/120 if no reperfusion therapy. Intracerebral haemorrhage: smooth lowering of systolic to about 140 is commonly targeted. Sympathetic crashing pulmonary oedema: high-dose nitrates and NIV.',
      ],
      table: {
        caption: 'Targets by condition (common guidance)',
        head: ['Condition', 'Target', 'Preferred agents'],
        rows: [
          ['Most emergencies', 'MAP ↓ ≤ 25 % in 1 h', 'Nicardipine, clevidipine, labetalol'],
          ['Aortic dissection', 'HR ~60, SBP < 120 quickly', 'Esmolol/labetalol, then nicardipine'],
          ['Pre-eclampsia', 'Treat ≥ 160/110 within 30–60 min', 'Labetalol, hydralazine, nifedipine + Mg'],
          ['Ischaemic stroke + lysis', '< 185/110 before, < 180/105 after', 'Labetalol, nicardipine'],
          ['ICH', 'SBP ≈ 140, smoothly', 'Nicardipine, labetalol'],
          ['Acute pulmonary oedema', 'Relieve congestion', 'Nitroglycerin, NIV'],
        ],
      },
    },
    {
      id: 'drugs', title: 'Drug choices', core: true,
      body: [
        'Use short-acting, titratable IV drugs on a pump with an arterial line when possible. Nicardipine and clevidipine (calcium-channel blockers) are arterial vasodilators with little effect on heart rate or contractility; clevidipine is ultra-short-acting and lipid-based. Labetalol combines alpha- and beta-blockade; avoid in bradycardia, heart block, decompensated heart failure and asthma. Esmolol is a short-acting beta-1 blocker. Nitroglycerin is mainly a venodilator — ideal for pulmonary oedema and ACS. Nitroprusside is potent but risks cyanide toxicity and rebound and is used less often.',
        'Avoid immediate-release sublingual nifedipine (unpredictable, precipitous drops, except oral nifedipine in pregnancy protocols) and avoid pure vasodilators without beta-blockade in dissection. In cocaine or amphetamine toxicity, benzodiazepines come first.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the confused hypertensive patient',
      body: ['A 52-year-old with untreated hypertension: BP 238/142, headache, vomiting, confusion, papilloedema; CT shows no haemorrhage.'],
      example: { case: 'How fast and with what?', steps: [
        'Hypertensive encephalopathy: an emergency.',
        'MAP ≈ 174; reduce by no more than about 25 % in the first hour (to MAP ≈ 130).',
        'Nicardipine infusion (e.g. 5 mg/h, titrating by 2.5 mg/h every 5–15 min) or labetalol per protocol, with frequent or arterial BP monitoring.',
        'Avoid overshoot; reassess neurology; destination with ICU and neuro capability.',
      ] },
    },
  ],
  keyPoints: [
    'Emergency = severe hypertension + acute end-organ damage.',
    'Most emergencies: MAP ↓ ≤ 25 % in the first hour.',
    'Dissection: beta-blocker first, HR ~60 and SBP < 120 quickly.',
    'Pre-eclampsia ≥ 160/110: labetalol, hydralazine or nifedipine within 30–60 min, plus magnesium.',
    'Stroke: < 185/110 before lysis; ICH: SBP ≈ 140 smoothly.',
  ],
  pearls: ['Clevidipine has a minute-long half-life.', 'Nitroglycerin is the agent for pulmonary oedema and ACS.'],
  pitfalls: ['Normalising BP in an hour in chronic hypertension.', 'Vasodilator without beta-blockade in dissection.'],
  questions: [
    { q: 'Hypertensive emergency requires:', options: ['BP > 160/100', 'Acute end-organ damage', 'Headache only', 'Age > 60'], answer: 1, why: 'Organ injury defines emergency.' },
    { q: 'Initial MAP reduction in most hypertensive emergencies:', options: ['50 % in 10 min', '≤ 25 % in the first hour', 'To normal immediately', 'None for 24 h'], answer: 1, why: 'Avoid hypoperfusion.' },
    { q: 'Aortic dissection first agent:', options: ['Nitroprusside alone', 'Esmolol or labetalol', 'Hydralazine', 'Nifedipine'], answer: 1, why: 'Reduce shear (dP/dt).' },
    { q: 'BP before thrombolysis for ischaemic stroke should be below:', options: ['220/120', '185/110', '140/90', '120/80'], answer: 1, why: 'Bleeding risk.' },
    { q: 'Severe-range BP in pre-eclampsia:', options: ['≥ 140/90', '≥ 160/110', '≥ 200/120', '≥ 120/80'], answer: 1, why: 'Treat within 30–60 min.' },
    { q: 'Labetalol should be avoided in:', options: ['Pre-eclampsia', 'Asthma and heart block', 'Stroke', 'Dissection'], answer: 1, why: 'β-blockade risks.' },
    { q: 'Nicardipine is primarily:', options: ['Venodilator', 'Arterial vasodilator (CCB)', 'β-blocker', 'α-agonist'], answer: 1, why: 'Dihydropyridine CCB.' },
    { q: 'Nitroglycerin primarily dilates:', options: ['Arterioles', 'Veins (preload reduction)', 'Coronary only', 'Renal arteries'], answer: 1, why: 'Venodilation at lower doses.' },
    { q: 'A risk of prolonged nitroprusside use:', options: ['Hyperkalaemia', 'Cyanide toxicity', 'Bronchospasm', 'Hypoglycaemia'], answer: 1, why: 'Metabolism releases cyanide.' },
    { q: 'ICH systolic target commonly:', options: ['~180', '~140', '~100', '~90'], answer: 1, why: 'Limits haematoma growth.' },
    { q: 'Cocaine-induced hypertension first-line:', options: ['Beta-blocker', 'Benzodiazepine', 'Hydralazine', 'Diuretic'], answer: 1, why: 'Treat sympathetic excess.' },
    { q: 'Why avoid rapid normalisation in chronic hypertension?', options: ['Causes bleeding', 'Autoregulation shifted — ischaemia', 'Causes tachycardia', 'No reason'], answer: 1, why: 'Organs adapted to higher pressure.' },
    { q: 'Clevidipine is notable for:', options: ['Long half-life', 'Ultra-short half-life', 'Oral use', 'β-blockade'], answer: 1, why: 'Its half-life is about one minute, allowing fine titration.' },
    { q: 'Hypertensive encephalopathy signs include:', options: ['Papilloedema, confusion, headache', 'Wheeze', 'Bradycardia only', 'Rash'], answer: 0, why: 'Cerebral oedema from loss of autoregulation.' },
    { q: 'Pre-eclampsia seizure prophylaxis:', options: ['Phenytoin', 'Magnesium sulfate', 'Diazepam infusion', 'Levetiracetam'], answer: 1, why: 'Standard of care.' },
  ],
  sources: [
    { title: '2017 ACC/AHA high blood pressure guideline: hypertensive crises', url: 'https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065' },
    { title: 'ACOG: emergent therapy for acute-onset severe hypertension in pregnancy', url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2020/02/clinical-guidance-for-the-integration-of-the-findings-of-the-chronic-hypertension-and-pregnancy-chap-study' },
  ],
};

export const HEMO_INSTAB: FpcLesson = {
  id: 'fpc-hemo-instab', domain: 'cardiac', ref: 'VI.10',
  title: 'Haemodynamic instability: a framework for shock',
  summary: 'Using the haemodynamic equation to find the broken variable, fluid responsiveness, choosing between fluids, blood, vasopressors and inotropes, and avoiding over-resuscitation.',
  objectives: [
    'Use MAP = CO × SVR and CO = HR × SV to locate the failing component.',
    'Assess fluid responsiveness and tolerance before giving volume.',
    'Match the intervention to the problem and monitor its effect.',
  ],
  sections: [
    {
      id: 'framework', title: 'Find the broken variable', core: true,
      body: [
        'Blood pressure is the product of cardiac output and systemic vascular resistance; cardiac output is heart rate times stroke volume; stroke volume depends on preload, contractility and afterload. Every hypotensive patient has a problem in one or more of these: rate (too slow, too fast), preload (the tank), contractility (the pump), afterload or vascular tone (the pipes), or obstruction to flow.',
        'Bedside clues: cold, clammy and narrow pulse pressure suggest low output (hypovolaemic, cardiogenic, obstructive); warm, bounding and wide pulse pressure with low diastolic pressure suggest low SVR (distributive). Neck veins and ultrasound separate empty from full. Rhythm strips identify rate problems quickly.',
      ],
    },
    {
      id: 'fluid', title: 'Fluid responsiveness and tolerance', core: true,
      body: [
        'Only about half of haemodynamically unstable patients increase stroke volume with fluid. A patient is fluid-responsive if stroke volume (or a surrogate such as pulse pressure or velocity–time integral on echo) rises by about 10–15 % after a fluid challenge or a passive leg raise. The passive leg raise is a reversible "self-bolus" of about 300 mL; measure the response within about a minute.',
        'Pulse-pressure variation above about 12–13 % predicts responsiveness only in sedated patients on controlled ventilation with tidal volumes of at least 8 mL/kg, regular rhythm and a closed chest. Static measures such as CVP alone predict poorly. Fluid tolerance matters as much: worsening oxygenation, B-lines and a plethoric IVC say stop.',
      ],
    },
    {
      id: 'interventions', title: 'Matching the intervention', core: true,
      body: [
        'Hypovolaemia from bleeding: stop the bleeding and give blood products. Dehydration: crystalloid in boluses with reassessment. Distributive shock: fluid until no longer responsive, then norepinephrine (and vasopressin, steroids in sepsis; adrenaline in anaphylaxis). Cardiogenic shock: inotropes with vasopressor support and treatment of the cause. Obstructive shock: relieve the obstruction — decompress, drain, thrombolyse. Rate problems: pace or treat the arrhythmia.',
        'Reassess after every intervention using perfusion markers, not just pressure. Over-resuscitation — fluid overload, excessive vasopressor doses — has its own harms: pulmonary oedema, bowel and limb ischaemia, arrhythmias.',
      ],
      example: {
        case: 'A ventilated trauma patient: BP 86/50, HR 122, PPV 18 %, Hb 8.2, FAST positive.',
        steps: ['Low output picture with high PPV on controlled ventilation: preload-responsive.', 'Positive FAST: haemorrhage — the right fluid is blood.', 'Transfuse, give TXA if within 3 h, keep warm, give calcium.', 'Surgical haemorrhage control is definitive; avoid vasopressors as a substitute.'],
      },
    },
    {
      id: 'case', title: 'Transport case: falling pressure at altitude',
      body: ['Fifteen minutes into a flight, a septic patient on norepinephrine 0.12 mcg/kg/min drops from MAP 70 to MAP 54. HR 118, SpO₂ 95 %, EtCO₂ falls from 34 to 26.'],
      example: { case: 'Work through the variables.', steps: [
        'Check equipment first: is the norepinephrine running (line kinked, bag empty, pump alarm, line disconnected)?',
        'Falling EtCO₂ at constant ventilation suggests falling cardiac output.',
        'Assess preload: passive leg raise or small bolus; consider increasing norepinephrine and adding vasopressin.',
        'Exclude new arrhythmia, tension pneumothorax and auto-PEEP if ventilated.',
      ] },
    },
  ],
  keyPoints: [
    'MAP = CO × SVR; CO = HR × SV; SV = preload, contractility, afterload.',
    'Cold and narrow pulse pressure = low output; warm and wide = low SVR.',
    'Only about half of unstable patients are fluid-responsive: test with a passive leg raise.',
    'PPV works only on controlled ventilation, VT ≥ 8 mL/kg, regular rhythm.',
    'Match the treatment to the failed variable; reassess perfusion after every intervention.',
  ],
  pearls: ['Always check the pump and line before escalating a vasopressor.', 'A passive leg raise is a reversible fluid test.'],
  pitfalls: ['Giving fluid by reflex to a non-responder.', 'Using vasopressors to hide haemorrhage.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states at the bedside' }, { id: 'ln-heartlung', label: 'Heart–lung interactions' }],
  questions: [
    { q: 'MAP is determined by:', options: ['HR × SVR', 'CO × SVR', 'SV × PVR', 'CVP × HR'], answer: 1, why: 'Haemodynamic equation.' },
    { q: 'A wide pulse pressure with low diastolic suggests:', options: ['Cardiogenic shock', 'Low SVR (distributive)', 'Tamponade', 'Hypovolaemia'], answer: 1, why: 'Vasodilation.' },
    { q: 'Fluid responsiveness means stroke volume rises by about:', options: ['1 %', '10–15 %', '50 %', '100 %'], answer: 1, why: 'Common threshold.' },
    { q: 'A passive leg raise delivers roughly:', options: ['50 mL', '300 mL', '1 L', '2 L'], answer: 1, why: 'Autotransfusion.' },
    { q: 'PPV is valid only with:', options: ['Spontaneous breathing', 'Controlled ventilation, VT ≥ 8 mL/kg, regular rhythm', 'AF', 'Open chest'], answer: 1, why: 'Validation conditions.' },
    { q: 'A poor predictor of fluid responsiveness used alone:', options: ['Passive leg raise', 'Static CVP', 'Echo VTI change', 'PPV in valid conditions'], answer: 1, why: 'Static values predict poorly.' },
    { q: 'Signs of fluid intolerance:', options: ['Improving SpO₂', 'Worsening oxygenation and new B-lines', 'Falling HR', 'Rising urine output'], answer: 1, why: 'Lungs are filling.' },
    { q: 'Best fluid for haemorrhagic shock:', options: ['Saline', 'Blood products', 'Dextrose', 'Albumin only'], answer: 1, why: 'Replace what is lost.' },
    { q: 'Treatment of obstructive shock:', options: ['Inotropes', 'Relieve the obstruction', 'Vasopressors alone', 'Diuretics'], answer: 1, why: 'Decompress, drain, thrombolyse.' },
    { q: 'Before escalating a vasopressor during a sudden drop, first check:', options: ['Labs', 'The infusion line and pump', 'Temperature', 'Glucose'], answer: 1, why: 'Equipment failures are common.' },
    { q: 'Falling EtCO₂ at constant ventilation suggests:', options: ['Rising metabolism', 'Falling cardiac output', 'Hypoventilation', 'Rebreathing'], answer: 1, why: 'Less CO₂ delivered to lungs.' },
    { q: 'Cold, clammy skin with narrow pulse pressure suggests:', options: ['Distributive shock', 'Low output state', 'Hyperthermia', 'Normal'], answer: 1, why: 'Vasoconstriction compensating.' },
    { q: 'Proportion of unstable patients who are fluid-responsive:', options: ['~10 %', '~50 %', '~90 %', '100 %'], answer: 1, why: 'About half.' },
    { q: 'Stroke volume determinants:', options: ['Rate, rhythm, temperature', 'Preload, contractility, afterload', 'Hb, SaO₂, PaO₂', 'CVP, PVR, HR'], answer: 1, why: 'Classic triad.' },
    { q: 'Over-resuscitation with fluid can cause:', options: ['Improved oxygenation', 'Pulmonary oedema and abdominal compartment syndrome', 'Lower CVP', 'Bradycardia'], answer: 1, why: 'Harms of excess fluid.' },
  ],
  sources: [
    { title: 'Monnet X, Teboul JL. Passive leg raising: five rules. Crit Care (2015)', url: 'https://ccforum.biomedcentral.com/articles/10.1186/s13054-014-0708-5' },
    { title: 'StatPearls: Shock', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Shock+StatPearls' },
  ],
};

export const CHRONIC_CARDIAC: FpcLesson = {
  id: 'fpc-chronic-cardiac', domain: 'cardiac', ref: 'VI.11',
  title: 'Chronic cardiac conditions in the acute patient',
  summary: 'Transporting patients with cardiomyopathies, congenital heart disease in adults, pulmonary hypertension, heart transplants and chronic valve disease — the physiology that changes acute management.',
  objectives: [
    'Adapt resuscitation to hypertrophic, dilated and restrictive cardiomyopathy.',
    'Recognise the special risks of pulmonary hypertension and adult congenital heart disease.',
    'Manage heart transplant recipients\' unique physiology.',
  ],
  sections: [
    {
      id: 'cm', title: 'Cardiomyopathies', core: true,
      body: [
        'Hypertrophic cardiomyopathy (HCM) is a genetic disorder with a thick, stiff ventricle and, in many, dynamic left ventricular outflow obstruction from systolic anterior motion of the mitral valve. It causes exertional syncope and sudden death in the young. Obstruction worsens with low preload, low afterload and high contractility or heart rate: avoid dehydration, vasodilators (nitrates) and inotropes; give fluids, use phenylephrine for hypotension, and beta-blockers to slow the heart. Atrial fibrillation is poorly tolerated.',
        'Dilated cardiomyopathy causes systolic heart failure, arrhythmias and thromboembolism; manage as HFrEF. Restrictive cardiomyopathy (amyloidosis and others) has stiff ventricles, small stroke volumes and dependence on preload and heart rate — hypotension follows aggressive diuresis or vasodilation.',
      ],
    },
    {
      id: 'ph', title: 'Pulmonary hypertension', core: true,
      body: [
        'In pulmonary arterial hypertension the right ventricle works against high resistance and may be at the edge of failure. Decompensation follows infection, arrhythmia, missed medications, pregnancy and anaesthesia. Avoid hypoxia, hypercapnia, acidosis and hypothermia (all raise pulmonary vascular resistance), maintain systemic pressure (norepinephrine, vasopressin), avoid excessive fluid, and support the RV with dobutamine or milrinone.',
        'Never interrupt continuous pulmonary vasodilator infusions (epoprostenol, treprostinil) — rebound pulmonary hypertension can be fatal within minutes. These run through dedicated lines and pumps; bring backup supplies and do not flush or use the line for anything else. Intubation is extremely high-risk.',
      ],
    },
    {
      id: 'chd', title: 'Adult congenital heart disease',
      body: [
        'Adults with repaired or palliated congenital heart disease are increasingly common. Fontan patients (single-ventricle circulation, passive venous flow to the lungs) depend on low intrathoracic pressure and adequate preload; positive pressure and dehydration drop output. Eisenmenger patients have reversed shunts and fixed pulmonary hypertension; avoid systemic vasodilation (it increases right-to-left shunting) and air in IV lines (paradoxical embolism). Use air filters on IV lines in any patient with a right-to-left shunt. Contact the specialist centre early.',
      ],
    },
    {
      id: 'transplant', title: 'Heart transplant recipients', core: true,
      body: [
        'The transplanted heart is denervated: resting heart rate is higher (often 90–110), it responds to exercise and stress slowly via circulating catecholamines, and drugs acting through the vagus (atropine) have no effect. Use direct-acting agents for bradycardia (epinephrine, isoproterenol) or pacing. Adenosine has an exaggerated effect; use a reduced dose or avoid. Ischaemia may be painless. Patients are immunosuppressed: infection risk is high, and rejection can present as heart failure or arrhythmia.',
      ],
      example: {
        case: 'A transplant recipient with symptomatic bradycardia at 38, BP 78/40.',
        steps: ['Atropine will not work (no vagal innervation).', 'Epinephrine infusion or transcutaneous pacing.', 'Consider rejection or drug effects; contact the transplant centre.'],
      },
    },
    {
      id: 'case', title: 'Transport case: the hypotensive HCM patient',
      body: ['A 24-year-old with known HCM collapses at a tournament; now alert but BP 82/50, HR 128, systolic murmur louder on standing. The referring team is about to give nitroglycerin for chest pain.'],
      example: { case: 'What do you change?', steps: [
        'Stop the nitroglycerin: vasodilation worsens outflow obstruction.',
        'Give fluid to improve preload; lie flat with legs raised.',
        'Phenylephrine for hypotension (raises afterload without inotropy); a beta-blocker to slow the rate if tolerated.',
        'Avoid inotropes; pads on for arrhythmia; destination with cardiology.',
      ] },
    },
  ],
  keyPoints: [
    'HCM: give volume, phenylephrine, beta-blockers; avoid nitrates, inotropes, dehydration.',
    'Pulmonary hypertension: avoid hypoxia, hypercapnia, acidosis; support SVR and the RV.',
    'Never interrupt epoprostenol or treprostinil infusions.',
    'Right-to-left shunts: air filters on IV lines; avoid systemic vasodilation.',
    'Transplanted hearts: no response to atropine; use epinephrine or pacing.',
  ],
  pearls: ['HCM murmur increases with standing or Valsalva.', 'Fontan circulation depends on low intrathoracic pressure.'],
  pitfalls: ['Nitrates for chest pain in HCM.', 'Flushing a prostacyclin line.'],
  questions: [
    { q: 'In HCM with outflow obstruction, avoid:', options: ['Fluids', 'Nitrates and inotropes', 'Phenylephrine', 'Beta-blockers'], answer: 1, why: 'Worsen obstruction.' },
    { q: 'Vasopressor of choice for hypotension in HCM:', options: ['Dobutamine', 'Phenylephrine', 'Epinephrine', 'Milrinone'], answer: 1, why: 'Pure afterload increase.' },
    { q: 'HCM murmur increases with:', options: ['Squatting', 'Standing or Valsalva', 'Leg raise', 'Handgrip'], answer: 1, why: 'Lower preload worsens obstruction.' },
    { q: 'Interrupting an epoprostenol infusion risks:', options: ['Hypertension', 'Fatal rebound pulmonary hypertension', 'Bradycardia', 'Hypoglycaemia'], answer: 1, why: 'Very short half-life.' },
    { q: 'Which raises pulmonary vascular resistance?', options: ['Oxygen', 'Hypercapnia and acidosis', 'Alkalosis', 'Normothermia'], answer: 1, why: 'Pulmonary vasoconstriction.' },
    { q: 'Heart transplant bradycardia does NOT respond to:', options: ['Epinephrine', 'Isoproterenol', 'Atropine', 'Pacing'], answer: 2, why: 'Denervated heart.' },
    { q: 'Adenosine in transplant recipients has:', options: ['No effect', 'An exaggerated effect', 'Reduced effect', 'Same effect'], answer: 1, why: 'Denervation hypersensitivity.' },
    { q: 'Resting heart rate after heart transplant is typically:', options: ['40–50', '90–110', '150', '60'], answer: 1, why: 'Loss of vagal tone.' },
    { q: 'IV air filters are important with:', options: ['Left-to-right shunts only', 'Right-to-left shunts', 'Normal hearts', 'HCM'], answer: 1, why: 'Paradoxical air embolism.' },
    { q: 'A Fontan circulation depends on:', options: ['High intrathoracic pressure', 'Low intrathoracic pressure and adequate preload', 'A strong RV', 'High PVR'], answer: 1, why: 'Passive pulmonary blood flow.' },
    { q: 'Restrictive cardiomyopathy patients are sensitive to:', options: ['Volume loading only', 'Aggressive diuresis and vasodilation', 'Oxygen', 'Bradycardia benefit'], answer: 1, why: 'Preload-dependent.' },
    { q: 'Systemic vasodilation in Eisenmenger syndrome:', options: ['Reduces cyanosis', 'Increases right-to-left shunting', 'Has no effect', 'Treats PH'], answer: 1, why: 'Lower SVR favours R→L flow.' },
    { q: 'Ischaemia in transplant recipients may be:', options: ['Always painful', 'Painless', 'Impossible', 'Only arrhythmic'], answer: 1, why: 'Denervation.' },
    { q: 'Pulmonary hypertension decompensation support:', options: ['Large fluid boluses', 'Maintain SVR and support RV contractility', 'Hypoventilation', 'Nitrates'], answer: 1, why: 'Protect RV perfusion.' },
    { q: 'AF in HCM is:', options: ['Well tolerated', 'Poorly tolerated', 'Protective', 'Irrelevant'], answer: 1, why: 'Loss of atrial kick in a stiff ventricle.' },
  ],
  sources: [
    { title: '2024 AHA/ACC guideline for hypertrophic cardiomyopathy', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001250' },
    { title: 'StatPearls: Pulmonary hypertension', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Pulmonary+hypertension+StatPearls' },
  ],
};
