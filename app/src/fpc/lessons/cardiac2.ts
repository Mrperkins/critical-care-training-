/** FP-C VI.4–VI.6: acute coronary syndromes; cardiogenic shock; heart failure. */
import type { FpcLesson } from '../types';

export const ACS: FpcLesson = {
  id: 'fpc-acs', domain: 'cardiac', ref: 'VI.4',
  title: 'Acute coronary syndromes',
  summary: 'STEMI, NSTEMI and unstable angina: pathophysiology, reperfusion strategy and time targets, antithrombotic therapy, and the complications to anticipate during transfer.',
  objectives: [
    'Distinguish STEMI, NSTEMI and unstable angina and their urgency.',
    'Choose a reperfusion strategy (PCI versus fibrinolysis) by time and transport distance.',
    'Give and avoid the right drugs, and anticipate arrhythmic and mechanical complications.',
  ],
  sections: [
    {
      id: 'patho', title: 'From plaque to infarct', core: true,
      body: [
        'Most ACS begins when an atherosclerotic plaque ruptures or erodes, exposing thrombogenic material. Platelets adhere and aggregate, the coagulation cascade forms fibrin, and the resulting thrombus partially or completely occludes the artery. Complete, persistent occlusion produces transmural ischaemia and ST elevation (STEMI); partial or intermittent occlusion produces subendocardial ischaemia (NSTEMI if troponin rises, unstable angina if it does not).',
        'Myocardium dies from the endocardium outward over hours — "time is muscle". Reperfusion within the first few hours salvages the most myocardium and reduces mortality and heart failure.',
      ],
    },
    {
      id: 'reperfusion', title: 'Reperfusion strategy and time', core: true,
      body: [
        'Primary PCI is preferred for STEMI when it can be delivered promptly: first medical contact to device within 90 minutes, or within 120 minutes when transfer from a non-PCI hospital is required. If PCI cannot be achieved within 120 minutes of first medical contact, fibrinolysis is given (goal: within 30 minutes of arrival, "door-to-needle") unless contraindicated, followed by transfer to a PCI centre — immediately for rescue PCI if reperfusion fails, or within 2–24 hours for a routine invasive strategy.',
        'Signs of successful fibrinolysis: ST-segment resolution of 50 % or more at 60–90 minutes, relief of pain and reperfusion arrhythmias such as accelerated idioventricular rhythm. Failed reperfusion or cardiogenic shock needs urgent transfer for PCI regardless of time.',
        'High-risk NSTEMI (refractory pain, haemodynamic instability, arrhythmia, heart failure) needs angiography within hours; others within 24–72 hours.',
      ],
      list: { caption: 'Absolute contraindications to fibrinolysis (examples)', items: ['Any prior intracranial haemorrhage', 'Ischaemic stroke within 3 months', 'Known intracranial neoplasm or vascular malformation', 'Suspected aortic dissection', 'Active bleeding (excluding menses)', 'Significant head or facial trauma within 3 months'] },
    },
    {
      id: 'drugs', title: 'Medications', core: true,
      body: [
        'Aspirin (162–325 mg chewed) for all ACS unless allergic. A P2Y12 inhibitor (ticagrelor, prasugrel or clopidogrel) per the PCI centre\'s protocol. Anticoagulation (unfractionated heparin, enoxaparin or bivalirudin) per strategy.',
        'Nitroglycerin relieves ischaemic pain but is avoided with hypotension, suspected right-ventricular infarction, and recent phosphodiesterase-5 inhibitor use (sildenafil within 24 hours, tadalafil within 48). Oxygen is given only for SpO₂ below 90 % — routine oxygen in normoxic patients has no benefit. Opioids relieve pain but may delay oral P2Y12 absorption; use the lowest effective dose. Beta-blockers are avoided in the acute phase if there are signs of heart failure, low output or risk of shock.',
      ],
    },
    {
      id: 'complications', title: 'Complications en route',
      body: [
        'Arrhythmias: ventricular fibrillation is most common early; have pads on. Bradycardia and AV block with inferior MI (usually nodal, atropine-responsive); Mobitz II and complete block with anterior MI (infranodal, needs pacing). Pump failure and cardiogenic shock with large infarcts. Mechanical complications — papillary muscle rupture (acute MR), ventricular septal rupture (new harsh murmur, shock), and free wall rupture (tamponade, PEA) — typically occur days 2–7 but may occur earlier, and need emergency surgery.',
      ],
      example: {
        case: 'Anterior STEMI at a rural hospital, symptom onset 90 minutes ago. Nearest PCI centre: 140 minutes by ground, 55 minutes by helicopter including handover. No contraindications to fibrinolysis.',
        steps: [
          'By air, first-contact-to-device can be under 120 minutes — primary PCI is feasible: aspirin, P2Y12 and anticoagulant per centre protocol, pre-activate the cath lab.',
          'If air transport is unavailable (weather), PCI within 120 minutes is not achievable: give fibrinolysis within 30 minutes, then transfer.',
          'In flight: pads on, analgesia, avoid hypotension, monitor for VF and AV block.',
        ],
      },
    },
    {
      id: 'special', title: 'Special presentations',
      body: [
        'Women, the elderly and diabetics more often present atypically — dyspnoea, fatigue, nausea, epigastric pain — which delays diagnosis. Cocaine-associated chest pain is treated with benzodiazepines, aspirin and nitrates; beta-blockers are traditionally avoided acutely. Spontaneous coronary artery dissection affects younger women, often peripartum. MI with non-obstructive coronary arteries (MINOCA) and Takotsubo cardiomyopathy can mimic STEMI.',
      ],
    },
  ],
  keyPoints: [
    'STEMI = complete occlusion; NSTEMI = troponin rise without STE; UA = no troponin rise.',
    'Primary PCI if first contact to device ≤ 90 min (≤ 120 with transfer); otherwise fibrinolysis within 30 min then transfer.',
    'Aspirin for all; P2Y12 and anticoagulant per protocol; oxygen only if SpO₂ < 90 %.',
    'No nitrates with hypotension, RV infarction or recent PDE-5 inhibitors.',
    'Pads on: VF early; AV block (inferior nodal, anterior infranodal); mechanical complications need surgery.',
  ],
  pearls: ['Accelerated idioventricular rhythm after lysis often signals reperfusion.', 'Air transport can make primary PCI possible where ground transport cannot.'],
  pitfalls: ['Routine oxygen for normoxic ACS.', 'Nitrates after sildenafil.'],
  questions: [
    { q: 'Target first medical contact to device time when transfer is required:', options: ['≤ 60 min', '≤ 120 min', '≤ 180 min', '≤ 6 h'], answer: 1, why: 'Otherwise fibrinolysis is preferred.' },
    { q: 'Door-to-needle goal for fibrinolysis:', options: ['10 min', '30 min', '60 min', '90 min'], answer: 1, why: 'Within 30 minutes.' },
    { q: 'Sign of successful fibrinolysis:', options: ['New Q waves only', '≥ 50 % ST resolution at 60–90 min', 'Rising BP', 'Bradycardia'], answer: 1, why: 'ST resolution with pain relief.' },
    { q: 'An absolute contraindication to fibrinolysis:', options: ['Age 75', 'Prior intracranial haemorrhage', 'Hypertension 150/90', 'Diabetes'], answer: 1, why: 'Bleeding risk.' },
    { q: 'Oxygen in ACS is indicated when SpO₂ is:', options: ['< 99 %', '< 90 %', 'Always', 'Never'], answer: 1, why: 'No benefit in normoxia.' },
    { q: 'Nitroglycerin should be avoided after sildenafil within:', options: ['2 h', '24 h', '1 week', 'It is fine'], answer: 1, why: 'Profound hypotension.' },
    { q: 'NSTEMI differs from unstable angina by:', options: ['ST elevation', 'Troponin rise', 'Pain duration', 'Age'], answer: 1, why: 'Biomarker evidence of necrosis.' },
    { q: 'Most common lethal arrhythmia early in MI:', options: ['AF', 'VF', 'Sinus tachycardia', 'PACs'], answer: 1, why: 'Have pads on.' },
    { q: 'Mobitz II in anterior MI implies:', options: ['Nodal block', 'Infranodal block — prepare to pace', 'Benign finding', 'Digoxin effect'], answer: 1, why: 'High risk of CHB.' },
    { q: 'New harsh holosystolic murmur and shock on day 4 after MI suggests:', options: ['Pericarditis', 'Ventricular septal rupture', 'Aortic stenosis', 'Dressler syndrome'], answer: 1, why: 'Mechanical complication.' },
    { q: 'Cocaine chest pain first-line adjunct:', options: ['Beta-blocker', 'Benzodiazepine', 'Fibrinolysis always', 'Haloperidol'], answer: 1, why: 'Reduces sympathetic drive.' },
    { q: 'Aspirin dose for ACS:', options: ['81 mg swallowed', '162–325 mg chewed', '1 g IV', 'Not given'], answer: 1, why: 'Chewed for rapid absorption.' },
    { q: 'Opioids in ACS may:', options: ['Speed P2Y12 absorption', 'Delay oral P2Y12 absorption', 'Prevent VF', 'Replace aspirin'], answer: 1, why: 'Slowed gut motility.' },
    { q: 'Plaque rupture leads to occlusion mainly via:', options: ['Vasospasm only', 'Platelet aggregation and fibrin thrombus', 'Embolism from the LA', 'Hypotension'], answer: 1, why: 'Thrombosis.' },
    { q: 'High-risk NSTEMI with refractory pain needs angiography:', options: ['Within hours', 'Within 1 week', 'Electively', 'Not at all'], answer: 0, why: 'Immediate invasive strategy.' },
  ],
  sources: [
    { title: '2025 ACC/AHA guideline for the management of acute coronary syndromes', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001309' },
    { title: 'StatPearls: ST-elevation myocardial infarction', url: 'https://www.ncbi.nlm.nih.gov/books/?term=ST-elevation+myocardial+infarction+StatPearls' },
  ],
};

export const CARDIOGENIC: FpcLesson = {
  id: 'fpc-cardiogenic', domain: 'cardiac', ref: 'VI.5',
  title: 'Cardiogenic shock',
  summary: 'Recognising pump failure, haemodynamic profiles, SCAI staging, inotropes and vasopressors, mechanical support, and the airway and ventilation hazards of the failing heart.',
  objectives: [
    'Recognise cardiogenic shock and stage its severity.',
    'Choose vasopressor and inotrope support by haemodynamic profile.',
    'Anticipate mechanical circulatory support and safe ventilation strategies.',
  ],
  sections: [
    {
      id: 'define', title: 'Definition and profiles', core: true,
      body: [
        'Cardiogenic shock is hypoperfusion from primary cardiac failure: systolic BP below about 90 mmHg (or vasopressors needed to hold it), with signs of hypoperfusion — cold extremities, oliguria, altered mentation, rising lactate — and evidence of high filling pressures (pulmonary oedema, raised JVP). Acute MI is the leading cause; others include decompensated chronic heart failure, myocarditis, valve catastrophes and arrhythmias.',
        'Bedside profiles combine congestion (wet or dry) and perfusion (warm or cold). "Cold and wet" is the classic cardiogenic shock: low cardiac index, high wedge pressure, high SVR. RV-predominant shock has a high CVP with clear lungs. The SCAI stages run from A (at risk) through B (beginning: hypotension or tachycardia without hypoperfusion), C (classic: hypoperfusion needing intervention), D (deteriorating despite treatment) to E (extremis: arrest or refractory collapse).',
      ],
    },
    {
      id: 'treat', title: 'Drugs', core: true,
      body: [
        'Norepinephrine is the usual first agent to restore perfusion pressure (MAP around 65) with less arrhythmia than dopamine. Add an inotrope — dobutamine, or milrinone if beta-blocked or with pulmonary hypertension — for persistent low output once pressure is adequate. Epinephrine is an alternative but raises lactate and myocardial oxygen demand.',
        'Avoid large fluid boluses unless there is clear hypovolaemia or RV infarction (where cautious volume helps). Treat the cause: reperfusion for MI (emergency PCI improves survival in MI-related shock), rhythm control for arrhythmia, surgery for mechanical lesions. Correct acidosis, hypoxaemia and electrolytes.',
      ],
    },
    {
      id: 'mcs', title: 'Mechanical circulatory support', core: true,
      body: [
        'When drugs fail, devices bridge to recovery, transplant or decision: intra-aortic balloon pumps (afterload reduction and coronary perfusion; modest output support), Impella devices (axial-flow pumps across the aortic valve that unload the LV), and VA-ECMO (full cardiopulmonary support but raises LV afterload — the LV may need venting). Transporting patients on these devices is covered in the mechanical support lesson; early recognition and transfer to a centre that can place them is the transport team\'s main contribution.',
      ],
    },
    {
      id: 'airway', title: 'Airway and ventilation', core: true,
      body: [
        'Intubating a patient in cardiogenic shock risks arrest: induction agents drop sympathetic tone, and positive pressure reduces venous return. Yet positive pressure helps the failing LV by reducing afterload and pulmonary oedema. Use NIV first when possible; if intubation is necessary, start or increase vasopressors before induction, use a reduced dose of a haemodynamically stable agent, and apply PEEP thoughtfully. For RV failure, avoid high intrathoracic pressures, hypoxia and hypercapnia, which raise pulmonary vascular resistance.',
      ],
      example: {
        case: 'A 66-year-old after anterior STEMI: BP 78/48, HR 112, cold mottled legs, crackles to mid-zones, SpO₂ 88 % on NRB, lactate 5.1, urine 10 mL/h.',
        steps: [
          'Cold and wet, SCAI stage C: classic cardiogenic shock.',
          'Norepinephrine to MAP ≥ 65; add dobutamine for low output once pressure is supported.',
          'Oxygenation: CPAP/BiPAP if tolerated; if intubating, pressors running and reduced-dose induction.',
          'No routine fluids; aspirin and anticoagulation per protocol; emergency PCI — direct to a centre with mechanical support capability.',
        ],
      },
    },
  ],
  keyPoints: [
    'Cardiogenic shock: hypotension + hypoperfusion + high filling pressures; MI is the leading cause.',
    'Profile "cold and wet": low CI, high wedge, high SVR.',
    'Norepinephrine for pressure, then dobutamine or milrinone for output.',
    'Treat the cause: emergency PCI for MI-related shock.',
    'NIV first; if intubating, pressors before induction and reduced-dose agent.',
  ],
  pearls: ['RV shock: high CVP, clear lungs — cautious fluid helps.', 'Choose destinations with mechanical support capability.'],
  pitfalls: ['Fluid-loading a congested failing LV.', 'Inducing without vasopressor support.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states at the bedside' }, { id: 'ln-disease', label: 'Waveforms of disease (failing LV)' }],
  questions: [
    { q: 'The classic cardiogenic shock profile is:', options: ['Warm and dry', 'Cold and wet', 'Warm and wet', 'Cold and dry'], answer: 1, why: 'Low perfusion, congestion.' },
    { q: 'First vasopressor commonly used in cardiogenic shock:', options: ['Phenylephrine', 'Norepinephrine', 'Vasopressin alone', 'Isoproterenol'], answer: 1, why: 'Fewer arrhythmias than dopamine.' },
    { q: 'An inotrope preferred in a beta-blocked patient:', options: ['Dobutamine', 'Milrinone', 'Phenylephrine', 'Esmolol'], answer: 1, why: 'Acts independently of β-receptors.' },
    { q: 'Leading cause of cardiogenic shock:', options: ['Myocarditis', 'Acute MI', 'Valve disease', 'Sepsis'], answer: 1, why: 'Large infarcts.' },
    { q: 'SCAI stage C means:', options: ['At risk', 'Beginning shock without hypoperfusion', 'Classic shock with hypoperfusion', 'Extremis'], answer: 2, why: 'Hypoperfusion requiring intervention.' },
    { q: 'Haemodynamics of cardiogenic shock:', options: ['High CI, low SVR', 'Low CI, high wedge, high SVR', 'Low wedge, low CVP', 'High CI, high wedge'], answer: 1, why: 'Pump failure.' },
    { q: 'Which improves survival in MI-related cardiogenic shock?', options: ['Fibrinolysis alone', 'Emergency revascularisation', 'Large fluid boluses', 'Beta-blockade'], answer: 1, why: 'Early revascularisation (PCI) improves survival in MI-related shock.' },
    { q: 'VA-ECMO can increase:', options: ['LV preload only', 'LV afterload', 'Coronary perfusion only', 'RV failure'], answer: 1, why: 'Retrograde aortic flow.' },
    { q: 'Positive pressure ventilation helps the failing LV by:', options: ['Increasing afterload', 'Reducing afterload and pulmonary oedema', 'Raising heart rate', 'Increasing preload'], answer: 1, why: 'Lower transmural pressure.' },
    { q: 'RV-predominant shock typically shows:', options: ['Low CVP', 'High CVP with clear lungs', 'Pulmonary oedema', 'High CI'], answer: 1, why: 'RV backs up.' },
    { q: 'Epinephrine in cardiogenic shock may:', options: ['Lower lactate', 'Raise lactate and myocardial oxygen demand', 'Cause bradycardia', 'Lower BP'], answer: 1, why: 'β-2 and β-1 effects.' },
    { q: 'Fluids in cardiogenic shock are appropriate mainly in:', options: ['All cases', 'RV infarction or clear hypovolaemia', 'Pulmonary oedema', 'Never'], answer: 1, why: 'Otherwise worsens congestion.' },
    { q: 'Before intubating cardiogenic shock, start:', options: ['Diuretic', 'Vasopressor support', 'Nitroglycerin', 'Beta-blocker'], answer: 1, why: 'Prevent post-induction collapse.' },
    { q: 'An Impella device:', options: ['Inflates in diastole', 'Pumps blood from LV into aorta', 'Oxygenates blood', 'Paces the heart'], answer: 1, why: 'Axial-flow LV unloading.' },
    { q: 'Mottled legs and oliguria indicate:', options: ['Congestion', 'Hypoperfusion', 'Overhydration', 'Normal'], answer: 1, why: 'End-organ hypoperfusion.' },
  ],
  sources: [
    { title: 'SCAI SHOCK stage classification (2019, updated 2022)', url: 'https://www.jacc.org/doi/10.1016/j.jacc.2021.12.003' },
    { title: 'Hochman JS et al. SHOCK trial. NEJM (1999)', url: 'https://www.nejm.org/doi/full/10.1056/NEJM199908263410901' },
  ],
};

export const HEART_FAILURE: FpcLesson = {
  id: 'fpc-heart-failure', domain: 'cardiac', ref: 'VI.6',
  title: 'Acute heart failure',
  summary: 'Systolic and diastolic failure, acute decompensation phenotypes, sympathetic crashing pulmonary oedema, NIV, nitrates and diuretics, and right heart failure.',
  objectives: [
    'Classify acute heart failure by congestion and perfusion.',
    'Treat hypertensive acute pulmonary oedema with NIV and high-dose nitrates.',
    'Recognise right heart failure and its specific hazards.',
  ],
  sections: [
    {
      id: 'types', title: 'Types and triggers', core: true,
      body: [
        'Heart failure with reduced ejection fraction (HFrEF, EF ≤ 40 %) is a failure of contraction; with preserved ejection fraction (HFpEF) the ventricle is stiff and fills poorly at normal pressures. Acute decompensation is triggered by ischaemia, arrhythmia (especially new AF), uncontrolled hypertension, infection, non-adherence to medicines or salt and fluid restriction, renal failure, and drugs (NSAIDs, some calcium-channel blockers).',
        'Most decompensated patients are "warm and wet": congested but perfused. Treat congestion (diuretics, vasodilators). "Cold and wet" patients are in cardiogenic shock. "Cold and dry" patients are underfilled and low output.',
      ],
    },
    {
      id: 'scape', title: 'Hypertensive (sympathetic crashing) pulmonary oedema', core: true,
      body: [
        'A sudden surge of afterload with fluid redistribution into the lungs produces extreme dyspnoea, frothy sputum, hypertension, tachycardia and hypoxaemia. Total body water may not be increased; the problem is afterload and redistribution.',
        'Treatment is immediate CPAP or BiPAP plus high-dose nitroglycerin — for example sublingual 0.4–0.8 mg repeated every few minutes, or IV boluses and an infusion starting high (often 100 mcg/min or more) and titrating down as the blood pressure falls. Diuretics are secondary and slower. Many of these patients avoid intubation if treated aggressively and early.',
      ],
    },
    {
      id: 'diuretics', title: 'Diuretics, morphine and inotropes', core: true,
      body: [
        'In volume-overloaded patients, IV loop diuretics (furosemide, often at least the patient\'s daily oral dose given IV, or 40 mg in diuretic-naive adults) relieve congestion over hours. Monitor potassium and renal function. Morphine is no longer routine — it may increase intubation and adverse outcomes. Inotropes are reserved for low-output states with hypoperfusion.',
      ],
    },
    {
      id: 'rv', title: 'Right heart failure',
      body: [
        'The right ventricle is thin-walled and tolerates volume better than pressure. Acute RV failure (massive PE, RV infarction, decompensated pulmonary hypertension) produces raised JVP, hepatomegaly, peripheral oedema and hypotension with clear lungs. Over-filling dilates the RV, shifts the septum and compresses the LV.',
        'Principles: maintain systemic pressure (norepinephrine, vasopressin, which does not raise PVR), optimise RV preload carefully, reduce RV afterload (oxygen, avoid hypercapnia and acidosis, inhaled pulmonary vasodilators where available), and support contractility (dobutamine or milrinone). Intubation and positive pressure are high-risk.',
      ],
      example: {
        case: 'A 74-year-old woman with sudden dyspnoea: BP 212/118, HR 124, SpO₂ 80 %, sitting upright, frothy sputum, crackles throughout.',
        steps: [
          'Sympathetic crashing acute pulmonary oedema.',
          'CPAP 8–10 cmH₂O immediately, FiO₂ high.',
          'High-dose nitroglycerin sublingual then IV; titrate to BP.',
          'Reassess frequently; furosemide once stabilising if volume overloaded; intubate only if NIV fails.',
        ],
      },
    },
    {
      id: 'case', title: 'Transport case: new AF in heart failure',
      body: ['A 70-year-old with known HFrEF (EF 25 %), new AF at 148, BP 96/60, crackles, SpO₂ 90 % on 4 L.'],
      example: { case: 'Rate, rhythm or flow?', steps: [
        'Rapid AF reduces filling and output in a weak heart; it may be the trigger for decompensation.',
        'Unstable (hypotension, pulmonary oedema): synchronised cardioversion is reasonable.',
        'If borderline stable: avoid negative inotropes (diltiazem) in severe HFrEF; amiodarone or cautious digoxin per protocol.',
        'Treat congestion with NIV and diuretics as BP allows; anticoagulation considerations at the destination.',
      ] },
    },
  ],
  keyPoints: [
    'HFrEF = weak pump (EF ≤ 40 %); HFpEF = stiff ventricle.',
    'Most acute HF is warm and wet: diuretics and vasodilators.',
    'Hypertensive pulmonary oedema: CPAP/BiPAP plus high-dose nitroglycerin.',
    'Morphine is not routine.',
    'RV failure: support pressure, cautious preload, reduce PVR, avoid high intrathoracic pressure.',
  ],
  pearls: ['High-dose nitrates often avert intubation in SCAPE.', 'Vasopressin raises SVR without raising PVR.'],
  pitfalls: ['Diltiazem in severe HFrEF with rapid AF.', 'Large fluid boluses in RV failure.'],
  questions: [
    { q: 'HFrEF is defined by EF:', options: ['≤ 40 %', '≥ 50 %', '60–70 %', '> 80 %'], answer: 0, why: 'Reduced ejection fraction.' },
    { q: 'First-line therapy for hypertensive acute pulmonary oedema:', options: ['Morphine', 'NIV and high-dose nitroglycerin', 'Fluids', 'Beta-blocker'], answer: 1, why: 'Afterload and preload reduction.' },
    { q: 'Most decompensated HF patients are:', options: ['Cold and dry', 'Warm and wet', 'Cold and wet', 'Warm and dry'], answer: 1, why: 'Congested but perfused.' },
    { q: 'Morphine in acute HF:', options: ['Routine', 'Not routine; may worsen outcomes', 'Mandatory', 'Replaces NIV'], answer: 1, why: 'Associated with adverse outcomes.' },
    { q: 'A common trigger of HF decompensation:', options: ['Hypothyroidism only', 'New atrial fibrillation', 'Bradycardia 60', 'Mild exercise'], answer: 1, why: 'Loss of atrial kick and rapid rate.' },
    { q: 'Right heart failure classically shows:', options: ['Pulmonary oedema', 'Raised JVP, clear lungs', 'Low CVP', 'Bradycardia'], answer: 1, why: 'Systemic venous congestion.' },
    { q: 'Vasopressor favoured in RV failure because it does not raise PVR:', options: ['Phenylephrine', 'Vasopressin', 'Dopamine', 'Epinephrine'], answer: 1, why: 'V1 effects spare pulmonary vessels.' },
    { q: 'Avoid in severe HFrEF with rapid AF:', options: ['Amiodarone', 'Diltiazem', 'Cardioversion', 'Anticoagulation'], answer: 1, why: 'Negative inotrope.' },
    { q: 'Furosemide dose for a diuretic-naive adult in acute HF:', options: ['5 mg', '40 mg IV', '400 mg', '1 g'], answer: 1, why: 'Typical starting dose.' },
    { q: 'HFpEF patients have:', options: ['Weak contraction', 'Stiff ventricle with impaired filling', 'Normal hearts', 'Dilated RV only'], answer: 1, why: 'Diastolic dysfunction.' },
    { q: 'Over-filling a failing RV:', options: ['Improves LV output', 'Shifts the septum and compresses the LV', 'Lowers CVP', 'Has no effect'], answer: 1, why: 'Ventricular interdependence.' },
    { q: 'IV nitroglycerin starting dose in SCAPE is often:', options: ['5 mcg/min', '100 mcg/min or more', '1000 mcg/min', '0.1 mcg/min'], answer: 1, why: 'High-dose then titrate.' },
    { q: 'NSAIDs worsen heart failure by:', options: ['Diuresis', 'Sodium and fluid retention', 'Lowering BP', 'Bradycardia'], answer: 1, why: 'Renal prostaglandin inhibition.' },
    { q: 'Unstable rapid AF with pulmonary oedema and hypotension:', options: ['Diltiazem', 'Synchronised cardioversion', 'Observation', 'Adenosine'], answer: 1, why: 'Electrical rhythm control.' },
    { q: 'Inotropes in acute HF are reserved for:', options: ['All patients', 'Low output with hypoperfusion', 'Hypertensive oedema', 'Mild symptoms'], answer: 1, why: 'Not for congestion alone.' },
  ],
  sources: [
    { title: '2022 AHA/ACC/HFSA guideline for the management of heart failure', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063' },
    { title: 'StatPearls: Acute pulmonary edema', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Acute+pulmonary+edema+StatPearls' },
  ],
};
