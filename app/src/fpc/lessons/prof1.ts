/** FP-C X.1–X.4: accreditation standards; research design; privacy; just culture. */
import type { FpcLesson } from '../types';

export const ACCREDITATION: FpcLesson = {
  id: 'fpc-accreditation', domain: 'professional', ref: 'X.1',
  title: 'Accreditation standards in medical transport',
  summary: 'Why accreditation exists, the main accrediting bodies (CAMTS, NAAMTA, and EMS and hospital accreditation), the domains they assess, and how standards shape daily practice.',
  objectives: [
    'Distinguish regulation, licensure, certification and accreditation.',
    'Describe the major accreditation bodies and what they assess.',
    'Explain how accreditation standards translate into daily practice and quality improvement.',
  ],
  sections: [
    {
      id: 'terms', title: 'Regulation, licensure, certification and accreditation', core: true,
      body: [
        'Regulation sets legal minimum requirements (for example, FAA rules for aircraft operations, state EMS rules for medical care). Licensure is a government permission for an individual or organisation to practise (a paramedic or nursing licence, a state air ambulance licence). Certification recognises an individual\'s knowledge and skills beyond licensure — the FP-C (Certified Flight Paramedic) and CFRN (Certified Flight Registered Nurse) credentials, for example. Accreditation is voluntary peer review of an organisation against standards that usually exceed regulatory minimums.',
        'Accreditation exists because regulation focuses on minimums and on aviation; it does not fully address medical quality, crew training, patient safety culture or the integration of aviation and medical systems. Many insurers, hospitals and state agencies prefer or require accredited services.',
        'Certification of individual clinicians (such as the IBSC\'s FP-C and CCP-C) validates knowledge; accreditation of the service validates the systems around that clinician.',
      ],
    },
    {
      id: 'bodies', title: 'Accrediting bodies and their standards', core: true,
      body: [
        'CAMTS (Commission on Accreditation of Medical Transport Systems) is the best-known accreditor for air and ground critical care transport in North America. Its standards address management and leadership, medical direction, clinical care and staffing, training and continuing education, quality management, safety management (including SMS, risk assessment, fatigue management and post-accident incident plans), communications, aviation operations, vehicle and aircraft configuration, and infection control. Programmes undergo site visits and periodic re-accreditation.',
        'NAAMTA (National Accreditation Alliance of Medical Transport Applications) offers an alternative accreditation model built on international standards. Ground EMS agencies may be accredited by CAAS (Commission on Accreditation of Ambulance Services), and hospital-based programmes also fall under hospital accreditation (such as The Joint Commission) for their clinical services. Internationally, EURAMI and other bodies accredit air medical services.',
        'Typical standards include: a qualified medical director with involvement in protocols and quality review; minimum crew qualifications and certifications; initial and annual training (airway, high-risk procedures, neonatal and paediatric, aviation safety); case review and quality metrics; safety committee and reporting systems; and communications specialist training.',
      ],
      table: {
        caption: 'Terms at a glance',
        head: ['Term', 'Who grants it', 'Example'],
        rows: [['Regulation', 'Government (mandatory)', 'FAA Part 135'], ['Licensure', 'Government', 'Paramedic licence; state air ambulance licence'], ['Certification', 'Professional body (individual)', 'FP-C, CFRN, CCP-C'], ['Accreditation', 'Independent body (organisation)', 'CAMTS, NAAMTA, CAAS']],
      },
    },
    {
      id: 'practice', title: 'Standards in daily practice', core: true,
      body: [
        'Accreditation standards show up in everyday work: documented training records and skills competency, case reviews for high-risk procedures (intubations, surgical airways, blood transfusion), equipment checks and preventive maintenance logs, fatigue policies and rest facilities, post-accident incident plans that are practised, communications protocols with flight following, and safety briefings.',
        'Quality management under accreditation involves defining indicators (for example, first-pass intubation success, time to departure, adherence to protocols), collecting and reviewing data, identifying trends, implementing changes and re-measuring (the plan–do–study–act cycle). Benchmarking against other programmes, such as through the GAMUT quality metrics, helps identify where a programme stands.',
        'For individual clinicians, accreditation means continuing education, competency validation (often including simulation), adherence to protocols and participation in case review and safety reporting.',
      ],
    },
    {
      id: 'case', title: 'Scenario: preparing for a site visit',
      body: ['Your programme has a CAMTS site visit in three months. The safety committee notes that the post-accident incident plan has not been exercised for two years, and training records for neonatal resuscitation are incomplete for several crew.'],
      example: { case: 'What should happen?', steps: [
        'Schedule and run a post-accident incident plan exercise with communications, management and external agencies; document and debrief.',
        'Close training gaps: neonatal resuscitation courses and documented competencies for all crew.',
        'Review quality metrics and case reviews for completeness.',
        'Treat these as safety improvements, not just "passing the visit" — the standards exist because of past accidents.',
      ] },
    },
  ],
  keyPoints: [
    'Regulation = mandatory minimum; licensure = permission; certification = individual; accreditation = voluntary organisational standard.',
    'CAMTS and NAAMTA accredit medical transport; CAAS ground EMS; hospital accreditation covers hospital programmes.',
    'Standards cover medical direction, training, quality, safety, communications and aviation.',
    'Quality management: define, measure, review, change, re-measure.',
    'Accreditation standards translate into daily checks, training, case review and safety practices.',
  ],
  pearls: ['Accreditation usually exceeds regulatory minimums.', 'Practise the post-accident incident plan.'],
  pitfalls: ['Treating accreditation as a one-off inspection.', 'Confusing certification with accreditation.'],
  questions: [
    { q: 'Accreditation is best described as:', options: ['Mandatory government licensing', 'Voluntary peer review of an organisation against standards', 'Individual certification', 'An FAA rule'], answer: 1, why: 'Organisational standards.' },
    { q: 'The FP-C credential is an example of:', options: ['Accreditation', 'Certification', 'Licensure', 'Regulation'], answer: 1, why: 'Individual knowledge validation.' },
    { q: 'CAMTS accredits:', options: ['Individual paramedics', 'Medical transport programmes', 'Aircraft manufacturers', 'Hospitals only'], answer: 1, why: 'Air and ground critical care transport.' },
    { q: 'Regulation sets:', options: ['Best practice', 'Legal minimum requirements', 'Voluntary goals', 'Billing rules only'], answer: 1, why: 'Mandatory minimums.' },
    { q: 'A paramedic licence is an example of:', options: ['Accreditation', 'Licensure', 'Certification by a professional board', 'Regulation of aircraft'], answer: 1, why: 'Government permission.' },
    { q: 'Accreditation standards typically exceed:', options: ['Nothing', 'Regulatory minimums', 'Hospital standards always', 'Insurance rules'], answer: 1, why: 'Higher bar.' },
    { q: 'An area assessed by CAMTS:', options: ['Stock prices', 'Safety management and medical direction', 'Hospital catering', 'Fuel prices'], answer: 1, why: 'Core standards.' },
    { q: 'The PDSA cycle stands for:', options: ['Plan, Do, Study, Act', 'Patient, Doctor, Staff, Admin', 'Prepare, Deploy, Survey, Adjust', 'None'], answer: 0, why: 'Quality improvement.' },
    { q: 'A post-accident incident plan should be:', options: ['Written and filed away', 'Written and regularly exercised', 'Optional', 'Only for pilots'], answer: 1, why: 'Regular exercises keep the plan workable.' },
    { q: 'CAAS accredits:', options: ['Air medical only', 'Ground ambulance services', 'Pilots', 'Hospitals'], answer: 1, why: 'Ambulance services.' },
    { q: 'Quality management under accreditation includes:', options: ['Ignoring data', 'Defining and tracking indicators and acting on trends', 'Punishing errors', 'Annual parties'], answer: 1, why: 'Continuous improvement.' },
    { q: 'Why does accreditation exist beyond regulation?', options: ['To raise costs', 'Regulation focuses on minimums and may not address medical quality', 'To replace regulation', 'No reason'], answer: 1, why: 'Fills gaps.' },
    { q: 'Medical direction standards require:', options: ['No physician involvement', 'A qualified medical director involved in protocols and quality review', 'Only a nurse manager', 'Pilot oversight'], answer: 1, why: 'Clinical governance.' },
    { q: 'For individual clinicians, accreditation means:', options: ['Nothing', 'Continuing education, competency validation and case review', 'Fewer protocols', 'No training'], answer: 1, why: 'Practical impact.' },
    { q: 'Benchmarking quality against other programmes can use:', options: ['GAMUT metrics', 'Weather reports', 'Fuel logs', 'Billing codes'], answer: 0, why: 'Shared quality indicators.' },
  ],
  sources: [
    { title: 'CAMTS: Accreditation standards', url: 'https://www.camts.org/standards/' },
    { title: 'NAAMTA: Accreditation', url: 'https://naamta.com/' },
    { title: 'IBSC: Certifications', url: 'https://www.ibscertifications.org/' },
  ],
};

export const RESEARCH: FpcLesson = {
  id: 'fpc-research', domain: 'professional', ref: 'X.2',
  title: 'Research design, methods and terminology',
  summary: 'Study designs from case reports to randomised trials and meta-analyses, bias and confounding, statistics that clinicians need (p-values, confidence intervals, sensitivity, specificity, NNT), and research ethics.',
  objectives: [
    'Describe common study designs and their strengths and weaknesses.',
    'Interpret key statistical terms and diagnostic test measures.',
    'Recognise bias and confounding and the principles of research ethics.',
  ],
  sections: [
    {
      id: 'designs', title: 'Study designs', core: true,
      body: [
        'Observational studies observe without assigning interventions. Case reports and case series describe individual patients — useful for rare events and generating hypotheses. Cross-sectional studies measure exposure and outcome at one point in time (prevalence). Case–control studies start with outcomes (cases with a disease and controls without) and look back for exposures — efficient for rare diseases; they produce odds ratios. Cohort studies follow groups with and without an exposure forward (prospective) or through records (retrospective) to compare outcomes — they produce relative risks and can show temporal sequence.',
        'Experimental studies assign interventions. The randomised controlled trial (RCT) allocates participants randomly to intervention or control, balancing known and unknown confounders; blinding (single, double) reduces bias. Analysis by intention-to-treat (analysing participants in the groups they were assigned to) preserves randomisation. Pragmatic trials test interventions in real-world conditions; cluster trials randomise groups (for example, EMS agencies).',
        'Systematic reviews search comprehensively for all studies on a question using a predefined method; meta-analyses statistically combine results. Quality depends on the included studies ("garbage in, garbage out") and heterogeneity between them. Qualitative research explores experiences, perceptions and meanings through interviews and focus groups.',
      ],
    },
    {
      id: 'stats', title: 'Statistics clinicians need', core: true,
      body: [
        'The null hypothesis states that there is no difference between groups. A p-value is the probability of observing results at least as extreme as those found if the null hypothesis were true; p < 0.05 is conventionally called statistically significant. A type I error (alpha) is a false positive — finding a difference that does not exist; a type II error (beta) is a false negative — missing a real difference, often because of small sample size. Power (1 − beta, usually 80 % or more) is the ability to detect a real effect.',
        'Confidence intervals give a range in which the true value probably lies (a 95 % CI); if the interval for a difference includes zero (or a ratio includes 1), the result is not statistically significant. Narrow intervals mean more precision. Statistical significance is not the same as clinical significance — a tiny but statistically significant effect may not matter to patients.',
        'Measures of effect: absolute risk reduction (ARR) = control event rate − treatment event rate; relative risk reduction (RRR) = ARR ÷ control event rate; number needed to treat (NNT) = 1 ÷ ARR. Diagnostic tests: sensitivity = true positives ÷ all with disease (a highly sensitive test, when negative, rules out — "SnNout"); specificity = true negatives ÷ all without disease (a highly specific test, when positive, rules in — "SpPin"); positive and negative predictive values depend on prevalence.',
      ],
      example: {
        case: 'In a trial, 20 % of control patients and 15 % of treated patients die. Calculate ARR, RRR and NNT.',
        steps: ['ARR = 20 % − 15 % = 5 % (0.05).', 'RRR = 0.05 ÷ 0.20 = 25 %.', 'NNT = 1 ÷ 0.05 = 20 — treat 20 patients to prevent one death.', 'Note how "25 % fewer deaths" sounds larger than "5 percentage points fewer".'],
      },
    },
    {
      id: 'bias', title: 'Bias, confounding and ethics', core: true,
      body: [
        'Bias is systematic error. Selection bias: the study population differs systematically from the target population. Information (measurement) bias: outcomes or exposures are measured inaccurately or differently between groups (recall bias in case–control studies). Observer bias: knowledge of group assignment affects assessment (reduced by blinding). Publication bias: positive studies are more likely to be published. Confounding: a third variable associated with both exposure and outcome distorts the apparent relationship (for example, sicker patients both get helicopter transport and die more often).',
        'Levels of evidence rank designs from systematic reviews of RCTs (highest) through individual RCTs, cohort and case–control studies, case series and expert opinion (lowest). Grading systems such as GRADE also consider consistency, precision, directness and risk of bias.',
        'Research ethics: respect for persons (informed consent, protection of vulnerable groups), beneficence (maximise benefit, minimise harm) and justice (fair distribution of burdens and benefits) — the principles of the Belmont Report. Institutional review boards (IRBs) or ethics committees approve research involving humans. Emergency research may use exception from informed consent (EFIC) under strict conditions, with community consultation and public disclosure, because unconscious patients cannot consent.',
      ],
      table: {
        caption: 'Study designs at a glance',
        head: ['Design', 'Direction', 'Measure', 'Strength'],
        rows: [['Case report/series', 'Descriptive', '—', 'Rare events, hypotheses'], ['Cross-sectional', 'Snapshot', 'Prevalence', 'Quick, cheap'], ['Case–control', 'Outcome → exposure', 'Odds ratio', 'Rare diseases'], ['Cohort', 'Exposure → outcome', 'Relative risk', 'Temporal sequence'], ['RCT', 'Assigned intervention', 'RR, ARR, NNT', 'Controls confounding'], ['Systematic review/meta-analysis', 'Combines studies', 'Pooled estimate', 'Highest level (if good studies)']],
      },
    },
    {
      id: 'case', title: 'Scenario: does the helicopter save lives?',
      body: ['A retrospective registry study finds that trauma patients transported by helicopter have higher mortality than those transported by ground. A colleague concludes that helicopters are harmful.'],
      example: { case: 'Critique the conclusion.', steps: [
        'Confounding by indication: helicopters are sent to more severely injured patients.',
        'Retrospective observational design cannot prove causation; adjustment for injury severity is needed (and may still be incomplete).',
        'Selection and information bias may affect registry data.',
        'Better designs: propensity-matched cohorts with robust severity adjustment, or prospective trials where feasible.',
      ] },
    },
  ],
  keyPoints: [
    'Case–control: outcome → exposure (odds ratio); cohort: exposure → outcome (relative risk); RCT: assigned intervention.',
    'p-value < 0.05; type I = false positive, type II = false negative; power ≥ 80 %.',
    'CI including 0 (difference) or 1 (ratio) = not significant.',
    'ARR, RRR, NNT = 1/ARR; sensitivity rules out (SnNout), specificity rules in (SpPin).',
    'Bias and confounding; Belmont principles; IRBs; EFIC for emergency research.',
  ],
  pearls: ['Relative risk reductions sound bigger than absolute ones.', 'Predictive values depend on prevalence.'],
  pitfalls: ['Equating statistical with clinical significance.', 'Inferring causation from observational data.'],
  questions: [
    { q: 'A study that starts with patients who have a disease and looks back for exposures:', options: ['Cohort', 'Case–control', 'RCT', 'Cross-sectional'], answer: 1, why: 'Outcome to exposure.' },
    { q: 'A cohort study produces:', options: ['Odds ratio only', 'Relative risk', 'Prevalence only', 'No measure'], answer: 1, why: 'Exposure to outcome.' },
    { q: 'Randomisation primarily controls:', options: ['Cost', 'Known and unknown confounders', 'Sample size', 'Publication bias'], answer: 1, why: 'Balances groups.' },
    { q: 'A type I error is:', options: ['A false negative', 'A false positive', 'A measurement error', 'A typing error'], answer: 1, why: 'Alpha error.' },
    { q: 'A type II error often results from:', options: ['Large samples', 'Small sample size (low power)', 'Randomisation', 'Blinding'], answer: 1, why: 'Missed real effect.' },
    { q: 'A 95 % CI for a relative risk of 0.8–1.2 means:', options: ['Significant benefit', 'Not statistically significant (includes 1)', 'Significant harm', 'Perfect precision'], answer: 1, why: 'Interval includes 1.' },
    { q: 'Control event rate 10 %, treatment 6 %. NNT:', options: ['4', '25', '10', '40'], answer: 1, why: 'ARR 0.04 → NNT 25.' },
    { q: 'A highly sensitive test, when negative:', options: ['Rules in disease', 'Rules out disease (SnNout)', 'Is useless', 'Confirms disease'], answer: 1, why: 'Few false negatives.' },
    { q: 'Specificity is:', options: ['True positives ÷ all with disease', 'True negatives ÷ all without disease', 'Prevalence', 'NNT'], answer: 1, why: 'Definition.' },
    { q: 'Confounding is:', options: ['Random error', 'A third variable associated with both exposure and outcome', 'Publication bias', 'Blinding failure'], answer: 1, why: 'Distorts association.' },
    { q: 'Intention-to-treat analysis:', options: ['Analyses only compliant patients', 'Analyses participants in their assigned groups', 'Excludes dropouts', 'Is unblinded'], answer: 1, why: 'Preserves randomisation.' },
    { q: 'The Belmont Report principles:', options: ['Speed, accuracy, cost', 'Respect for persons, beneficence, justice', 'Autonomy only', 'Profit, safety, quality'], answer: 1, why: 'Research ethics.' },
    { q: 'Exception from informed consent (EFIC) applies to:', options: ['All research', 'Emergency research in patients unable to consent, under strict conditions', 'Surveys', 'Retrospective chart reviews only'], answer: 1, why: 'Community consultation required.' },
    { q: 'Highest level of evidence (if studies are good):', options: ['Expert opinion', 'Systematic review/meta-analysis of RCTs', 'Case report', 'Cross-sectional study'], answer: 1, why: 'Evidence hierarchy.' },
    { q: 'Recall bias most affects:', options: ['RCTs', 'Case–control studies', 'Meta-analyses', 'Lab studies'], answer: 1, why: 'Participants recall exposures.' },
  ],
  sources: [
    { title: 'The Belmont Report (HHS)', url: 'https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/index.html' },
    { title: 'GRADE Working Group', url: 'https://www.gradeworkinggroup.org/' },
  ],
};

export const PRIVACY: FpcLesson = {
  id: 'fpc-privacy', domain: 'professional', ref: 'X.3',
  title: 'Privacy considerations: HIPAA, confidentiality and social media',
  summary: 'Protected health information, HIPAA permitted uses and disclosures, minimum necessary, radio and photo privacy, social media, mandatory reporting exceptions and breach response.',
  objectives: [
    'Define protected health information and the HIPAA Privacy and Security Rules.',
    'Apply permitted disclosures and the minimum necessary standard in transport.',
    'Avoid privacy breaches through radio, photos and social media, and respond to breaches.',
  ],
  sections: [
    {
      id: 'hipaa', title: 'HIPAA and protected health information', core: true,
      body: [
        'In the United States, the Health Insurance Portability and Accountability Act (HIPAA) Privacy Rule protects individually identifiable health information — protected health information (PHI) — held or transmitted by covered entities (healthcare providers that bill electronically, health plans and clearinghouses) and their business associates. PHI includes names, addresses, dates (other than year), phone numbers, record numbers, photographs and any other identifier linked to health information.',
        'The Security Rule requires administrative, physical and technical safeguards for electronic PHI: access controls, passwords, encryption, audit trails, secure devices and workstations. Lost or stolen unencrypted tablets and phones are a common cause of breaches.',
        'Patients have rights: access to their records, requesting amendments, an accounting of disclosures, requesting restrictions and confidential communications, and receiving a notice of privacy practices. Other countries have equivalent laws (for example, GDPR in Europe), and professional duties of confidentiality apply everywhere.',
      ],
    },
    {
      id: 'disclose', title: 'Permitted disclosures and minimum necessary', core: true,
      body: [
        'PHI may be used and disclosed without patient authorisation for treatment (sharing with the receiving hospital and other providers), payment and healthcare operations (quality review, training, accreditation). Handover reports, radio reports to receiving facilities and consultation with medical control are all treatment disclosures.',
        'Other permitted disclosures without authorisation include those required by law (mandatory reporting of suspected child or elder abuse, certain injuries such as gunshot wounds in many states, communicable diseases), public health activities, law enforcement in specific circumstances, to avert a serious and imminent threat to health or safety, and to coroners and organ procurement organisations.',
        'The minimum necessary standard requires limiting the information used or disclosed to what is needed for the purpose — except for treatment, where providers may share what they judge necessary. Families and friends involved in care may be told relevant information if the patient agrees or does not object, or if the patient is incapacitated and the provider judges it to be in the patient\'s interest.',
      ],
      table: {
        caption: 'Can I share it?',
        head: ['Situation', 'Permitted without authorisation?'],
        rows: [['Handover to receiving hospital', 'Yes — treatment'], ['Radio report to ED (no name)', 'Yes — treatment; avoid names on open channels'], ['Quality review / case conference', 'Yes — operations (de-identify where possible)'], ['Suspected child abuse report', 'Yes — required by law'], ['Posting a scene photo online', 'No'], ['Telling a reporter the patient\'s condition', 'No (unless authorised/limited directory info per policy)'], ['Discussing a case in a public lift', 'No — avoid incidental disclosure']],
      },
    },
    {
      id: 'risks', title: 'Radio, photos and social media', core: true,
      body: [
        'Radio and scanner traffic can be heard by the public and media. Avoid patient names and identifying details on open channels; use encrypted channels or phone for sensitive information. Similarly, avoid discussing patients in public spaces — hospital lifts, cafeterias, airports.',
        'Photographs and video of patients, scenes and injuries are PHI if they could identify a patient. Take images only for clinical purposes, with consent where possible, on approved devices, and store them securely according to policy. Never post patient images or details on social media — even "anonymised" stories can identify patients through time, place and circumstance. Many clinicians have been disciplined or dismissed for social media posts.',
        'A breach is an unauthorised use or disclosure of PHI. Report suspected breaches promptly to the privacy officer; organisations must assess risk and notify affected individuals (and, for large breaches, regulators and the media) within defined timelines. Penalties can be civil and criminal.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the viral video',
      body: ['After a dramatic rooftop landing and resuscitation, a crew member records a short video of the helicopter landing with the patient being unloaded and posts it to social media, captioned "Saved a life tonight!" The patient\'s face is not visible, but the hospital, time and vehicle crash are recognisable.'],
      example: { case: 'Is this a problem?', steps: [
        'Yes — the combination of location, time and circumstances can identify the patient: this is a potential PHI disclosure.',
        'Remove the post; report to the privacy officer for breach assessment.',
        'Follow the programme\'s media and social media policy; use official communications channels for positive stories, with patient authorisation.',
        'Education for all crew on privacy and social media.',
      ] },
    },
  ],
  keyPoints: [
    'PHI = identifiable health information; HIPAA Privacy and Security Rules protect it.',
    'Treatment, payment and operations disclosures do not need authorisation.',
    'Mandatory reporting and public health disclosures are permitted by law.',
    'Minimum necessary (except treatment); no names on open radio; no patient content on social media.',
    'Report suspected breaches promptly.',
  ],
  pearls: ['Time + place + event can identify a patient.', 'Encrypt devices that hold PHI.'],
  pitfalls: ['"Anonymised" social media posts.', 'Discussing patients in public spaces.'],
  questions: [
    { q: 'PHI includes:', options: ['Only diagnoses', 'Identifiable health information including names, dates and photos', 'Aggregate statistics', 'Weather data'], answer: 1, why: 'Definition.' },
    { q: 'Sharing patient information with the receiving hospital is permitted as:', options: ['Payment', 'Treatment', 'Marketing', 'Research'], answer: 1, why: 'Treatment is a permitted (TPO) disclosure.' },
    { q: 'The minimum necessary standard does NOT apply to:', options: ['Billing', 'Disclosures for treatment', 'Quality review', 'Training'], answer: 1, why: 'Treatment exception.' },
    { q: 'Reporting suspected child abuse is:', options: ['A HIPAA violation', 'Permitted — required by law', 'Only with consent', 'Forbidden'], answer: 1, why: 'Mandatory reporting.' },
    { q: 'Posting a patient\'s photo on social media without authorisation:', options: ['Acceptable if face hidden', 'A privacy violation', 'Allowed for education', 'Permitted after 30 days'], answer: 1, why: 'Identifiable context.' },
    { q: 'Radio reports should avoid:', options: ['Vital signs', 'Patient names on open channels', 'ETA', 'Interventions'], answer: 1, why: 'Public monitoring.' },
    { q: 'The HIPAA Security Rule addresses:', options: ['Paper records only', 'Safeguards for electronic PHI', 'Aircraft security', 'Narcotics'], answer: 1, why: 'Electronic safeguards.' },
    { q: 'A common cause of breaches:', options: ['Encrypted devices', 'Lost unencrypted phones and tablets', 'Locked cabinets', 'Training'], answer: 1, why: 'Device loss.' },
    { q: 'A suspected breach should be:', options: ['Ignored', 'Reported promptly to the privacy officer', 'Posted online', 'Discussed with the media'], answer: 1, why: 'Assessment and notification.' },
    { q: 'Patients have the right to:', options: ['Nothing', 'Access their records and request amendments', 'Delete all records', 'Edit others\' records'], answer: 1, why: 'HIPAA rights.' },
    { q: 'Quality review of cases is permitted as:', options: ['Treatment', 'Healthcare operations', 'Marketing', 'Not permitted'], answer: 1, why: 'Operations.' },
    { q: 'Telling a reporter details of a patient\'s injuries:', options: ['Permitted', 'Not permitted without authorisation', 'Required', 'Allowed for public figures'], answer: 1, why: 'Media disclosure needs patient authorisation.' },
    { q: 'Disclosure to avert a serious and imminent threat is:', options: ['Prohibited', 'Permitted', 'Only with a court order', 'Only for police'], answer: 1, why: 'A recognised exception to authorisation.' },
    { q: 'Discussing a patient in a crowded hospital lift:', options: ['Acceptable', 'Risks incidental disclosure — avoid', 'Required for handover', 'Encouraged'], answer: 1, why: 'Reasonable safeguards.' },
    { q: 'Family involved in care may be told relevant information:', options: ['Never', 'If the patient agrees or does not object, or in the patient\'s interest if incapacitated', 'Always everything', 'Only in writing'], answer: 1, why: 'HIPAA provisions.' },
  ],
  sources: [
    { title: 'HHS: Summary of the HIPAA Privacy Rule', url: 'https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html' },
    { title: 'HHS: Summary of the HIPAA Security Rule', url: 'https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html' },
  ],
};

export const JUST_CULTURE: FpcLesson = {
  id: 'fpc-just-culture', domain: 'professional', ref: 'X.4',
  title: 'Just culture',
  summary: 'The principles of just culture — distinguishing human error, at-risk behaviour and reckless behaviour — and how they shape responses to error, safety reporting and system improvement.',
  objectives: [
    'Define just culture and contrast it with punitive and blame-free cultures.',
    'Classify behaviours as human error, at-risk behaviour or reckless behaviour and respond appropriately.',
    'Apply just culture principles to error reporting and system design.',
  ],
  sections: [
    {
      id: 'define', title: 'What just culture means', core: true,
      body: [
        'A just culture balances learning and accountability. A punitive culture blames individuals for errors, which drives errors underground — people stop reporting, and the system never learns. A blame-free culture ignores individual accountability, which fails to address reckless behaviour. Just culture recognises that competent professionals make mistakes and that systems shape behaviour, but holds people accountable for their choices — particularly conscious disregard of substantial risk.',
        'The model, associated with David Marx and James Reason, focuses on the behaviour and the quality of choices rather than the outcome. Two people who make the same choice should be treated the same way, whether or not harm resulted — the "outcome bias" (judging a decision by its result) is avoided.',
        'Just culture supports safety management: people report errors and near-misses because they trust the response will be fair, enabling the organisation to find and fix system weaknesses.',
      ],
    },
    {
      id: 'behaviours', title: 'Three behaviours and responses', core: true,
      body: [
        'Human error is an inadvertent action — a slip, lapse or mistake — doing something other than what was intended (for example, picking up the wrong vial that looks similar). The response is to console the individual and examine the system: look-alike packaging, interruptions, workload, fatigue, design. Punishing human error does not prevent it.',
        'At-risk behaviour is a choice where the risk is not recognised or is mistakenly believed to be justified — often a drift from rules because shortcuts have become normal and nothing bad has happened (for example, skipping a double-check because "we always do it this way" or because the system makes it cumbersome). The response is coaching: help the person see the risk, remove incentives for the shortcut and fix system barriers that make the safe way harder.',
        'Reckless behaviour is a conscious disregard of a substantial and unjustifiable risk (for example, flying impaired, deliberately falsifying records, or knowingly bypassing a critical safety step without reason). The response is remedial or disciplinary action. Reckless behaviour is rare; most events involve human error or at-risk behaviour within flawed systems.',
      ],
      table: {
        caption: 'Just culture response',
        head: ['Behaviour', 'Description', 'Response'],
        rows: [['Human error', 'Inadvertent slip, lapse or mistake', 'Console; fix the system'], ['At-risk behaviour', 'Risk not recognised or believed justified (drift)', 'Coach; remove incentives; fix barriers'], ['Reckless behaviour', 'Conscious disregard of substantial, unjustifiable risk', 'Remedial or disciplinary action']],
      },
    },
    {
      id: 'apply', title: 'Applying just culture', core: true,
      body: [
        'When an event occurs: focus first on the patient and safety, then gather facts without assuming blame. Ask what happened, what the person intended, what choices were made and why, what the system made easy or hard, and whether others would have done the same in the same situation (the substitution test). Look for repeated patterns — the same error by multiple people points to a system problem.',
        'Design systems that make the right thing easy and the wrong thing hard: standardised equipment and drug concentrations, checklists, forcing functions (devices that prevent errors), adequate staffing and rest, and clear protocols. Train leaders in just culture so that responses are consistent.',
        'Accountability in just culture runs both ways: individuals are accountable for their choices and for reporting; organisations are accountable for system design, resources and fair responses.',
      ],
    },
    {
      id: 'case', title: 'Scenario: three medication events',
      body: ['Three crew members give the wrong drug in three separate events: (A) a tired medic picks up a look-alike vial during a chaotic resuscitation; (B) a nurse routinely skips the second-person check "because we\'re short-staffed and it takes too long"; (C) a crew member, warned twice, knowingly gives a drug outside protocol and falsifies the record to hide it.'],
      example: { case: 'Classify and respond.', steps: [
        '(A) Human error: console; fix look-alike packaging and storage; review fatigue and workload.',
        '(B) At-risk behaviour: coach; make the double-check workable; address staffing; recognise normalisation of deviance.',
        '(C) Reckless behaviour (conscious disregard and falsification): remedial or disciplinary action.',
        'In all three: report through the SMS and share lessons.',
      ] },
    },
  ],
  keyPoints: [
    'Just culture balances learning and accountability — neither punitive nor blame-free.',
    'Judge the choice, not the outcome; avoid outcome bias.',
    'Human error → console and fix the system; at-risk behaviour → coach; reckless → discipline.',
    'Substitution test: would a peer have done the same?',
    'Design systems that make the right thing easy and the wrong thing hard.',
  ],
  pearls: ['Repeated errors by different people signal a system problem.', 'Reckless behaviour is rare.'],
  pitfalls: ['Punishing honest mistakes.', 'Ignoring drift and shortcuts until harm occurs.'],
  questions: [
    { q: 'Just culture balances:', options: ['Profit and safety', 'Learning and accountability', 'Speed and cost', 'Pilots and crew'], answer: 1, why: 'Core principle.' },
    { q: 'A punitive culture tends to:', options: ['Increase reporting', 'Drive errors underground', 'Improve learning', 'Reduce errors'], answer: 1, why: 'People stop reporting.' },
    { q: 'Human error is:', options: ['A conscious disregard of risk', 'An inadvertent slip, lapse or mistake', 'A deliberate shortcut', 'Falsification'], answer: 1, why: 'Unintended.' },
    { q: 'The response to human error:', options: ['Discipline', 'Console and fix the system', 'Ignore', 'Dismiss'], answer: 1, why: 'Punishment doesn\'t prevent it.' },
    { q: 'At-risk behaviour is:', options: ['Inadvertent', 'A choice where risk is not recognised or believed justified', 'Always reckless', 'A slip'], answer: 1, why: 'This is drift: risky shortcuts that feel normal.' },
    { q: 'The response to at-risk behaviour:', options: ['Coaching', 'Termination', 'Ignore', 'Criminal charges'], answer: 0, why: 'Help see the risk.' },
    { q: 'Reckless behaviour is:', options: ['Common', 'Conscious disregard of substantial, unjustifiable risk', 'A typing error', 'A system failure'], answer: 1, why: 'Definition.' },
    { q: 'The response to reckless behaviour:', options: ['Consoling only', 'Remedial or disciplinary action', 'Coaching only', 'Nothing'], answer: 1, why: 'Accountability.' },
    { q: 'Outcome bias means:', options: ['Judging decisions by their results', 'Ignoring outcomes', 'Measuring outcomes', 'Patient outcomes research'], answer: 0, why: 'Avoided in just culture.' },
    { q: 'The substitution test asks:', options: ['Can we replace the person?', 'Would a similar peer have done the same in the same situation?', 'Can we substitute the drug?', 'Who else is to blame?'], answer: 1, why: 'System vs individual.' },
    { q: 'Repeated similar errors by different people suggest:', options: ['Bad individuals', 'A system problem', 'Coincidence', 'Reckless behaviour'], answer: 1, why: 'Look at the system.' },
    { q: 'A blame-free culture fails because:', options: ['It punishes too much', 'It ignores individual accountability for reckless behaviour', 'It encourages reporting', 'It is too expensive'], answer: 1, why: 'Accountability gap.' },
    { q: 'Skipping a double check because "we always do" is:', options: ['Human error', 'At-risk behaviour (normalisation of deviance)', 'Reckless always', 'Best practice'], answer: 1, why: 'This is drift: risky shortcuts that feel normal.' },
    { q: 'Forcing functions are:', options: ['Disciplinary actions', 'Design features that prevent errors', 'Overtime rules', 'Interviews'], answer: 1, why: 'System design.' },
    { q: 'In just culture, organisations are accountable for:', options: ['Nothing', 'System design, resources and fair responses', 'Only discipline', 'Only profit'], answer: 1, why: 'Shared accountability.' },
  ],
  sources: [
    { title: 'Marx D. Patient safety and the "just culture": a primer for health care executives (2001)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Marx+just+culture+primer+health+care+executives' },
    { title: 'AHRQ PSNet: Just culture', url: 'https://psnet.ahrq.gov/primer/culture-safety' },
  ],
};
