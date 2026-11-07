/** FP-C IV.10–IV.12: lab values; advanced medical assessment; treatment modalities. */
import type { FpcLesson } from '../types';

export const LABS: FpcLesson = {
  id: 'fpc-labs', domain: 'medical', ref: 'IV.10',
  title: 'Lab values: CBC, coagulation, BMP, ABG and cardiac markers',
  summary: 'The normal ranges worth knowing cold, what each abnormality means for the patient in front of you, and how to read a set of labs as a story rather than a list.',
  objectives: [
    'Recall normal ranges for common critical care labs.',
    'Interpret CBC, coagulation, chemistry, blood gas and cardiac marker results in context.',
    'Spot the lab patterns that change transport management.',
  ],
  sections: [
    {
      id: 'ranges', title: 'Values to know', core: true,
      body: [
        'Reference ranges vary slightly between laboratories, but exam questions and bedside decisions rest on a core set. Learn the units your system uses; US labs report glucose in mg/dL and many others in mmol/L (divide mg/dL by 18).',
      ],
      table: {
        caption: 'Common adult reference values (approximate)',
        head: ['Test', 'Normal', 'Critical clues'],
        rows: [
          ['Haemoglobin', '12–16 (F), 13.5–17.5 (M) g/dL', 'Lags behind acute bleeding'],
          ['WBC', '4–11 × 10⁹/L', '> 12 or < 4 in SIRS; left shift in infection'],
          ['Platelets', '150–400 × 10⁹/L', '< 50 bleeding risk with procedures; < 20 spontaneous'],
          ['Sodium', '135–145 mmol/L', '< 120 or > 160 dangerous'],
          ['Potassium', '3.5–5.0 mmol/L', '> 6.5 or ECG changes: emergency'],
          ['Chloride / HCO₃⁻', '98–106 / 22–28 mmol/L', 'Anion gap = Na − (Cl + HCO₃), ≈ 8–12'],
          ['BUN / creatinine', '7–20 / 0.6–1.2 mg/dL', 'BUN:Cr > 20 suggests pre-renal or upper GI bleed'],
          ['Glucose', '70–100 mg/dL fasting', '< 70 hypoglycaemia'],
          ['PT / INR', '11–13.5 s / 0.8–1.2', 'Warfarin target 2–3'],
          ['aPTT', '25–35 s', 'Prolonged with heparin, factor deficits'],
          ['Fibrinogen', '200–400 mg/dL', '< 150–200 replace in haemorrhage'],
          ['Lactate', '< 2 mmol/L', '> 4 high risk'],
          ['Troponin', 'Below the 99th percentile (assay specific)', 'Rise and/or fall indicates myocardial injury'],
          ['ABG', 'pH 7.35–7.45, PaCO₂ 35–45, PaO₂ 80–100, HCO₃⁻ 22–26', 'Interpret with compensation'],
        ],
      },
    },
    {
      id: 'cbc', title: 'CBC and coagulation in context', core: true,
      body: [
        'Haemoglobin is a concentration. In acute haemorrhage it stays near normal until fluid shifts in or crystalloid is given, so a normal first haemoglobin does not exclude major bleeding. Conversely, dilution after crystalloid can lower it without further bleeding.',
        'White cell counts rise with infection, stress, steroids and epinephrine. A low count in sepsis is ominous. Thrombocytopenia has many causes: consumption (DIC, massive bleeding), sequestration (splenomegaly), destruction (immune, heparin-induced thrombocytopenia) and dilution.',
        'PT/INR tests the extrinsic and common pathways (factor VII and vitamin K–dependent factors: warfarin, liver disease); aPTT tests the intrinsic and common pathways (heparin, haemophilia). DIC prolongs both, lowers platelets and fibrinogen and raises D-dimer. Viscoelastic tests (TEG, ROTEM) guide targeted product replacement in haemorrhage where available.',
      ],
    },
    {
      id: 'chem', title: 'Chemistry and cardiac markers', core: true,
      body: [
        'Creatinine reflects filtration but rises late; a normal value does not mean normal function in an elderly, small or malnourished patient. A BUN-to-creatinine ratio above about 20 suggests pre-renal states or blood digested from an upper GI bleed.',
        'Troponin rises within hours of myocardial injury; high-sensitivity assays detect smaller injuries earlier, and serial values distinguish acute injury (a rise and/or fall) from chronic elevation (renal failure, heart failure). Troponin elevation is not the same as myocardial infarction: sepsis, pulmonary embolism, myocarditis and tachyarrhythmia also cause it. BNP rises with ventricular stretch and supports a diagnosis of heart failure; it is higher with renal failure and lower in obesity.',
        'Liver tests: AST and ALT rise with hepatocellular injury (ischaemic "shock liver" and acetaminophen produce very high values); bilirubin and alkaline phosphatase rise with obstruction. Ammonia rises in liver failure but does not correlate tightly with encephalopathy severity.',
      ],
    },
    {
      id: 'story', title: 'Reading labs as a story',
      body: [
        'Ask what process could produce all the abnormalities at once. A low bicarbonate, high anion gap, high glucose and high potassium tell the story of DKA. Low platelets, low fibrinogen and prolonged clotting times after major trauma tell the story of consumptive coagulopathy. Low sodium with seizures in a marathon runner tells the story of exercise-associated hyponatraemia.',
      ],
      example: {
        case: 'A 68-year-old with fever and confusion: WBC 2.8, platelets 62, INR 1.9, fibrinogen 120, lactate 6.4, creatinine 2.4.',
        steps: [
          'Leukopenia and high lactate: severe sepsis with hypoperfusion.',
          'Low platelets, prolonged INR and low fibrinogen: disseminated intravascular coagulation.',
          'Raised creatinine: acute kidney injury from hypoperfusion.',
          'Management: septic shock bundle, source control, product replacement only if bleeding or procedures are planned.',
        ],
      },
    },
  ],
  keyPoints: [
    'Potassium > 6.5 or ECG changes: emergency; sodium < 120 or > 160: dangerous.',
    'Haemoglobin lags behind acute bleeding.',
    'PT/INR = extrinsic (warfarin, liver); aPTT = intrinsic (heparin); DIC prolongs both, lowers platelets and fibrinogen.',
    'Troponin rise/fall = acute myocardial injury, not necessarily MI.',
    'BUN:Cr > 20 suggests pre-renal states or upper GI bleeding.',
  ],
  pearls: ['Divide glucose in mg/dL by 18 for mmol/L.', 'A low WBC in sepsis is a bad sign.'],
  pitfalls: ['Reassurance from a normal haemoglobin early in haemorrhage.', 'Calling every troponin rise a heart attack.'],
  live: [{ id: 'labs-coag', label: 'Reversing anticoagulation' }, { id: 'lactate', label: 'Lactate: made and cleared' }],
  questions: [
    { q: 'Normal anion gap is about:', options: ['2–4', '8–12', '20–24', '30–34'], answer: 1, why: 'Na − (Cl + HCO₃).' },
    { q: 'Warfarin prolongs mainly:', options: ['aPTT', 'PT/INR', 'Bleeding time only', 'Platelet count'], answer: 1, why: 'Vitamin K–dependent factors, especially VII.' },
    { q: 'Unfractionated heparin prolongs mainly:', options: ['PT', 'aPTT', 'Fibrinogen', 'Hb'], answer: 1, why: 'Intrinsic pathway via antithrombin.' },
    { q: 'DIC typically shows:', options: ['High platelets, high fibrinogen', 'Low platelets, low fibrinogen, prolonged PT/aPTT', 'Normal coagulation', 'Isolated high INR'], answer: 1, why: 'Consumption of factors and platelets.' },
    { q: 'Hb 14 ten minutes after a stab wound with BP 80/50:', options: ['Excludes bleeding', 'Does not exclude major haemorrhage', 'Means polycythaemia', 'Means dehydration only'], answer: 1, why: 'Concentration lags.' },
    { q: 'BUN:Cr ratio above 20 suggests:', options: ['Intrinsic renal disease', 'Pre-renal state or upper GI bleed', 'Liver failure', 'Normal'], answer: 1, why: 'BUN rises disproportionately.' },
    { q: 'Glucose 180 mg/dL in mmol/L:', options: ['5', '10', '18', '32'], answer: 1, why: '180 ÷ 18 = 10.' },
    { q: 'Troponin elevation without MI can occur in:', options: ['Pulmonary embolism', 'Ankle sprain', 'Hypoglycaemia only', 'Asthma always'], answer: 0, why: 'RV strain causes myocardial injury.' },
    { q: 'BNP is falsely lower in:', options: ['Renal failure', 'Obesity', 'Heart failure', 'Old age'], answer: 1, why: 'Adipose tissue clears natriuretic peptides.' },
    { q: 'Platelet count below which spontaneous bleeding risk rises sharply:', options: ['150', '100', '20', '400'], answer: 2, why: 'Below about 10–20 × 10⁹/L.' },
    { q: 'Very high AST/ALT after prolonged hypotension suggests:', options: ['Biliary obstruction', 'Ischaemic hepatitis (shock liver)', 'Pancreatitis', 'Normal'], answer: 1, why: 'Hepatocellular injury.' },
    { q: 'Fibrinogen threshold commonly prompting replacement in haemorrhage:', options: ['< 400', '< 150–200 mg/dL', '< 50', 'Never'], answer: 1, why: 'Low fibrinogen predicts bleeding.' },
    { q: 'Normal PaCO₂ range:', options: ['25–35', '35–45', '45–55', '60–80'], answer: 1, why: 'Standard reference.' },
    { q: 'Lactate above which risk of death rises markedly in sepsis:', options: ['1', '2', '4', '0.5 mmol/L'], answer: 2, why: 'Lactate ≥ 4 triggers aggressive resuscitation.' },
    { q: 'Leukopenia in sepsis indicates:', options: ['Good prognosis', 'Severe illness and worse prognosis', 'Viral infection only', 'Lab error'], answer: 1, why: 'Bone marrow overwhelmed.' },
  ],
  sources: [
    { title: 'StatPearls: Laboratory evaluation (reference ranges)', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Laboratory+evaluation+%28reference+ranges%29+StatPearls' },
    { title: 'Fourth Universal Definition of Myocardial Infarction (2018)', url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000617' },
  ],
};

export const ADV_ASSESS: FpcLesson = {
  id: 'fpc-adv-assess', domain: 'medical', ref: 'IV.11',
  title: 'Advanced medical assessment',
  summary: 'Structured assessment of the critically ill transport patient: the primary survey, focused history, haemodynamic and perfusion assessment, point-of-care ultrasound, and handover.',
  objectives: [
    'Perform a structured primary and secondary assessment adapted to transport.',
    'Assess perfusion beyond blood pressure.',
    'Use bedside ultrasound and structured handover to guide transport decisions.',
  ],
  sections: [
    {
      id: 'primary', title: 'Primary survey and the referral handover', core: true,
      body: [
        'Begin with what threatens life in the next few minutes: airway patency and protection, breathing and oxygenation, circulation and haemorrhage, disability (GCS, pupils, glucose), and exposure (temperature, rashes, wounds, lines). In medical patients, catastrophic haemorrhage is less common but GI and obstetric bleeding are not.',
        'At an inter-facility transfer, take a structured handover from the sending team (for example SBAR or a programme-specific format), then assess the patient yourself before leaving. Reconcile infusions, ventilator settings, lines and drains against what you were told. Many transport adverse events trace to unreconciled information.',
      ],
      list: { caption: 'Before leaving the referring facility', items: ['Airway secure and confirmed with waveform capnography', 'Adequate IV access (two reliable lines), drips labelled and on transport pumps', 'Oxygen, battery and drug quantities calculated for the trip plus reserve', 'Imaging and records sent; consent and family informed', 'Patient packaged: temperature, padding, restraints, tubes secured'] },
    },
    {
      id: 'perfusion', title: 'Perfusion beyond the blood pressure', core: true,
      body: [
        'Blood pressure is a late and imperfect marker. Assess end-organ perfusion: mental status, capillary refill (more than about 3 seconds is abnormal in adults), skin temperature and mottling, urine output, and lactate trends. A shock index (heart rate ÷ systolic BP) above about 0.9–1.0 suggests significant shock even with a "normal" pressure.',
        'Classify shock to choose treatment: hypovolaemic (low filling, low output), cardiogenic (high filling, low output), obstructive (tamponade, tension pneumothorax, PE: high filling, low output, obstructed), distributive (low SVR: sepsis, anaphylaxis, neurogenic). Mixed states are common.',
      ],
    },
    {
      id: 'pocus', title: 'Point-of-care ultrasound', core: true,
      body: [
        'Focused ultrasound answers specific questions quickly. RUSH-style protocols look at the pump (pericardial effusion, gross LV function, RV dilation), the tank (IVC size and collapsibility, FAST for free fluid, pleural effusions) and the pipes (aortic aneurysm, DVT). Lung ultrasound identifies pneumothorax (absent sliding, lung point), interstitial syndrome (B-lines) and consolidation.',
        'Ultrasound findings support decisions; they do not replace clinical judgement. IVC size is unreliable in ventilated patients and those with raised intra-abdominal pressure. In flight, vibration and limited space make scanning harder; scan before departure when possible.',
      ],
      example: {
        case: 'Hypotension of unclear cause: BP 78/44, HR 122, JVP raised, clear lungs.',
        steps: [
          'Raised JVP with hypotension narrows the field to cardiogenic or obstructive shock.',
          'Cardiac view: pericardial effusion with RV diastolic collapse → tamponade; dilated RV with septal flattening → massive PE; poor LV → cardiogenic.',
          'Lung: absent sliding unilaterally → tension pneumothorax.',
          'Treat the finding: pericardiocentesis, decompression, thrombolysis per protocol, or inotropes.',
        ],
      },
    },
    {
      id: 'secondary', title: 'Secondary survey and history',
      body: [
        'A focused history (SAMPLE or OPQRST for pain) and a head-to-toe examination follow stabilisation. In medical transports, the medication list is a diagnostic tool: anticoagulants, beta-blockers masking tachycardia, steroids (adrenal suppression), insulin and sulfonylureas, recent antibiotics.',
        'Reassess after every intervention and at regular intervals in flight. Trends — a rising heart rate, falling EtCO₂, widening pulse pressure — often warn before absolute values cross thresholds.',
      ],
    },
  ],
  keyPoints: [
    'Primary survey first; take a structured handover and reassess everything yourself before leaving.',
    'Perfusion: mentation, capillary refill, mottling, urine, lactate; shock index > 0.9 is a warning.',
    'Classify shock: hypovolaemic, cardiogenic, obstructive, distributive.',
    'POCUS: pump, tank, pipes; lung sliding and B-lines.',
    'Reassess after every intervention; trends warn early.',
  ],
  pearls: ['The medication list is a diagnostic test.', 'Scan before departure — flight makes ultrasound harder.'],
  pitfalls: ['Departing with unreconciled infusions.', 'Treating a normal BP as reassuring with a shock index of 1.2.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states at the bedside' }, { id: 'abd-fast', label: 'FAST: where free blood goes' }],
  questions: [
    { q: 'Shock index of HR 120, SBP 100:', options: ['0.8', '1.2', '2.0', '0.5'], answer: 1, why: 'Shock index = 120 ÷ 100 = 1.2.' },
    { q: 'Raised JVP with hypotension suggests:', options: ['Hypovolaemia', 'Cardiogenic or obstructive shock', 'Distributive only', 'Normal'], answer: 1, why: 'High filling pressure with low output.' },
    { q: 'Normal adult capillary refill is under about:', options: ['1 s', '3 s', '6 s', '10 s'], answer: 1, why: 'Beyond about 3 s is delayed.' },
    { q: 'Pericardial effusion with RV diastolic collapse indicates:', options: ['Massive PE', 'Tamponade', 'Cardiogenic shock', 'Pneumothorax'], answer: 1, why: 'Ultrasound sign of tamponade.' },
    { q: 'A dilated RV with septal flattening in shock suggests:', options: ['Tamponade', 'Massive PE', 'Hypovolaemia', 'Sepsis'], answer: 1, why: 'Acute RV pressure overload.' },
    { q: 'Absent lung sliding with a lung point indicates:', options: ['Pneumonia', 'Pneumothorax', 'Effusion', 'Oedema'], answer: 1, why: 'Lung point is specific.' },
    { q: 'IVC size is unreliable in:', options: ['Spontaneously breathing healthy patients', 'Ventilated patients', 'Children always', 'Never'], answer: 1, why: 'Positive pressure alters IVC dynamics.' },
    { q: 'Distributive shock includes:', options: ['Tamponade', 'Sepsis, anaphylaxis, neurogenic', 'Haemorrhage', 'MI'], answer: 1, why: 'Low SVR states.' },
    { q: 'Before leaving the referring hospital you should confirm:', options: ['Only the BP', 'Airway, access, drips, oxygen and battery reserves', 'Nothing — trust the handover', 'Lab results only'], answer: 1, why: 'Reconcile and prepare.' },
    { q: 'Which medication may mask tachycardia in shock?', options: ['Beta-blocker', 'Insulin', 'Furosemide', 'Statin'], answer: 0, why: 'Blunts heart rate response.' },
    { q: 'B-lines on lung ultrasound indicate:', options: ['Pneumothorax', 'Interstitial fluid', 'Normal lung', 'Consolidation only'], answer: 1, why: 'Interstitial syndrome.' },
    { q: 'Mottling of the knees suggests:', options: ['Good perfusion', 'Poor peripheral perfusion', 'Hyperthermia only', 'Allergy'], answer: 1, why: 'Associated with mortality in shock.' },
    { q: 'An early trend warning of deterioration in flight:', options: ['Stable HR', 'Rising HR and falling EtCO₂', 'Improving capillary refill', 'Falling lactate'], answer: 1, why: 'Suggests falling output.' },
    { q: 'SBAR stands for:', options: ['Situation, Background, Assessment, Recommendation', 'Signs, Blood, Airway, Respiration', 'Status, Base, Action, Review', 'None'], answer: 0, why: 'Structured handover.' },
    { q: 'The RUSH "tank" assessment includes:', options: ['LV function', 'IVC, FAST, pleural fluid', 'Aorta only', 'DVT only'], answer: 1, why: 'Volume status and fluid collections.' },
  ],
  sources: [
    { title: 'StatPearls: RUSH exam', url: 'https://www.ncbi.nlm.nih.gov/books/?term=RUSH+exam+StatPearls' },
    { title: 'Hernández G et al. ANDROMEDA-SHOCK: capillary refill-targeted resuscitation. JAMA (2019)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2724361' },
  ],
};

export const TREATMENT: FpcLesson = {
  id: 'fpc-treatment', domain: 'medical', ref: 'IV.12',
  title: 'Treatment modalities: infusions, drips and transport pharmacology',
  summary: 'Vasopressors and inotropes, infusion calculations, sedation and analgesia drips, anticoagulants and reversal, and managing pumps and drug supplies during transport.',
  objectives: [
    'Choose and titrate vasoactive infusions by haemodynamic goal.',
    'Calculate infusion rates accurately.',
    'Manage anticoagulated patients and reversal agents.',
  ],
  sections: [
    {
      id: 'vaso', title: 'Vasoactive drugs', core: true,
      body: [
        'Match the drug to the problem. Low SVR (distributive shock): norepinephrine first (α-1 with some β-1), vasopressin as a second agent. Poor contractility (cardiogenic shock): an inotrope — dobutamine (β-1 with some β-2 vasodilation) or milrinone (a phosphodiesterase-3 inhibitor; vasodilating, renally cleared) — usually with norepinephrine to support pressure. Bradycardia with hypotension: epinephrine or dopamine infusions, or pacing.',
        'Epinephrine combines inotropy and vasoconstriction; it raises lactate and heart rate. Phenylephrine is pure α-1 and useful as a push-dose agent for transient post-induction hypotension, but it can lower cardiac output in a weak heart. Dopamine causes more arrhythmias than norepinephrine and is no longer first-line in septic shock.',
      ],
      table: {
        caption: 'Common infusions (typical adult ranges; follow protocol)',
        head: ['Drug', 'Receptors', 'Typical range', 'Use'],
        rows: [
          ['Norepinephrine', 'α-1 > β-1', '0.02–0.5+ mcg/kg/min', 'Septic and vasodilatory shock'],
          ['Epinephrine', 'β-1, β-2, α-1', '0.02–0.5 mcg/kg/min', 'Anaphylaxis, cardiogenic, add-on'],
          ['Vasopressin', 'V1', '0.03–0.04 U/min (fixed)', 'Second agent in septic shock'],
          ['Dobutamine', 'β-1 > β-2', '2–20 mcg/kg/min', 'Low output, cardiogenic'],
          ['Phenylephrine', 'α-1', 'Push 50–200 mcg; infusion per protocol', 'Transient hypotension'],
          ['Milrinone', 'PDE-3 inhibitor', '0.125–0.75 mcg/kg/min', 'Low output, pulmonary hypertension'],
        ],
      },
    },
    {
      id: 'calc', title: 'Infusion calculations', core: true,
      body: [
        'For weight-based drips: mL/h = dose (mcg/kg/min) × weight (kg) × 60 ÷ concentration (mcg/mL). For example, norepinephrine 4 mg in 250 mL is 16 mcg/mL; 0.1 mcg/kg/min for 80 kg = 0.1 × 80 × 60 ÷ 16 = 30 mL/h.',
        'Non-weight-based: mL/h = dose per hour ÷ concentration. Use smart pumps with drug libraries where available, double-check high-alert infusions with a second clinician, and label every line at the patient end. Before transport, change bags that will run out during the trip and calculate the volume needed plus a reserve.',
      ],
      example: {
        case: 'Dobutamine 250 mg in 250 mL (1000 mcg/mL); order 5 mcg/kg/min; patient 70 kg.',
        steps: ['5 × 70 = 350 mcg/min.', '× 60 = 21,000 mcg/h.', '÷ 1000 mcg/mL = 21 mL/h.'],
      },
    },
    {
      id: 'anticoag', title: 'Anticoagulants and reversal', core: true,
      body: [
        'Warfarin: four-factor prothrombin complex concentrate (PCC) plus IV vitamin K for life-threatening bleeding; plasma if PCC is unavailable. Heparin: protamine (about 1 mg per 100 units given in the last few hours; partial effect for low-molecular-weight heparin). Dabigatran: idarucizumab. Factor Xa inhibitors (apixaban, rivaroxaban): andexanet alfa where available, or PCC per protocol.',
        'Thrombolytics (alteplase, tenecteplase) cause bleeding that may need cryoprecipitate and antifibrinolytics. Antiplatelet drugs are not reversed by PCC; platelet transfusion has a limited and selective role. In intracranial haemorrhage, reversal is time-critical.',
      ],
    },
    {
      id: 'transport', title: 'Infusions in transport',
      body: [
        'Consolidate infusions onto transport pumps before leaving, and verify each against the order. Avoid stopping vasopressors during transfers — a brief interruption can drop pressure. Run critical drips through dedicated lines; do not bolus through a line carrying a vasopressor. Peripheral vasopressors in a good, proximal vein are acceptable short-term with site checks; extravasation of norepinephrine is treated with phentolamine infiltration per protocol.',
        'Altitude can affect drip chambers and pressure bags; pumps eliminate most gravity-based errors. Battery life and oxygen supply should exceed the planned transport time with a margin.',
      ],
    },
  ],
  keyPoints: [
    'Low SVR → norepinephrine (then vasopressin); low output → dobutamine or milrinone, often with norepinephrine.',
    'mL/h = mcg/kg/min × kg × 60 ÷ mcg/mL.',
    'Warfarin → PCC + vitamin K; heparin → protamine; dabigatran → idarucizumab; Xa inhibitors → andexanet or PCC.',
    'Never bolus through a vasopressor line; don\'t interrupt pressors during moves.',
    'Calculate drug, battery and oxygen needs with a reserve before departure.',
  ],
  pearls: ['Phenylephrine push doses bridge transient hypotension.', 'Milrinone accumulates in renal failure.'],
  pitfalls: ['A bag running out mid-flight.', 'Flushing a line that carries norepinephrine.'],
  live: [{ id: 'moa-norepinephrine', label: 'Norepinephrine: mechanism' }, { id: 'moa-dobutamine', label: 'Dobutamine: mechanism' }, { id: 'labs-coag', label: 'Reversing anticoagulation' }],
  questions: [
    { q: 'Norepinephrine 4 mg/250 mL at 0.05 mcg/kg/min for 80 kg:', options: ['5 mL/h', '15 mL/h', '30 mL/h', '60 mL/h'], answer: 1, why: '0.05 × 80 × 60 ÷ 16 = 15 mL/h.' },
    { q: 'Inotrope that is a PDE-3 inhibitor:', options: ['Dobutamine', 'Milrinone', 'Dopamine', 'Vasopressin'], answer: 1, why: 'Raises cAMP independent of β-receptors.' },
    { q: 'Dabigatran is reversed with:', options: ['Protamine', 'Idarucizumab', 'Vitamin K', 'Andexanet'], answer: 1, why: 'Specific antibody fragment.' },
    { q: 'Warfarin reversal in life-threatening bleeding:', options: ['Vitamin K alone', 'PCC plus IV vitamin K', 'Protamine', 'Platelets'], answer: 1, why: 'Fast factor replacement plus sustained effect.' },
    { q: 'Heparin is reversed by:', options: ['Protamine', 'Naloxone', 'Flumazenil', 'Calcium'], answer: 0, why: 'Protamine binds heparin.' },
    { q: 'Vasopressin in septic shock is usually dosed:', options: ['By weight, titrated widely', 'Fixed around 0.03 U/min', '1 U/kg', 'As a bolus only'], answer: 1, why: 'Fixed-dose second agent.' },
    { q: 'A drug that raises lactate:', options: ['Norepinephrine', 'Epinephrine', 'Vasopressin', 'Milrinone'], answer: 1, why: 'β-2 glycolysis.' },
    { q: 'Phenylephrine acts on:', options: ['β-1', 'α-1', 'V1', 'D1'], answer: 1, why: 'Pure α-1 agonist.' },
    { q: 'Norepinephrine extravasation is treated with:', options: ['Heat and massage', 'Phentolamine infiltration', 'Calcium', 'Protamine'], answer: 1, why: 'α-blockade reverses local vasoconstriction.' },
    { q: 'Dobutamine 1000 mcg/mL at 10 mcg/kg/min for 60 kg:', options: ['6 mL/h', '36 mL/h', '60 mL/h', '600 mL/h'], answer: 1, why: '10 × 60 × 60 ÷ 1000 = 36.' },
    { q: 'Which should never be done through a vasopressor line?', options: ['Monitoring', 'Bolus injections', 'Labeling', 'Using a pump'], answer: 1, why: 'Flushes a pressor bolus into the patient.' },
    { q: 'Dopamine compared with norepinephrine in septic shock:', options: ['Fewer arrhythmias', 'More arrhythmias', 'Equal', 'Preferred'], answer: 1, why: 'Higher arrhythmia rate.' },
    { q: 'Factor Xa inhibitor reversal options include:', options: ['Idarucizumab', 'Andexanet alfa or PCC', 'Vitamin K', 'Protamine fully'], answer: 1, why: 'Specific or non-specific reversal.' },
    { q: 'Before a 2-hour transport, a drip bag with 45 minutes left should be:', options: ['Left alone', 'Replaced before departure', 'Doubled in rate', 'Stopped'], answer: 1, why: 'Avoid running out in flight.' },
    { q: 'Milrinone dose adjustment is needed in:', options: ['Liver failure', 'Renal failure', 'Hypertension', 'Hyperthermia'], answer: 1, why: 'Renally cleared.' },
  ],
  sources: [
    { title: 'Surviving Sepsis Campaign (2021): vasoactive agents', url: 'https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-guidelines-2021' },
    { title: 'ACC expert consensus: management of bleeding on oral anticoagulants (2020)', url: 'https://www.jacc.org/doi/10.1016/j.jacc.2020.04.053' },
  ],
};
