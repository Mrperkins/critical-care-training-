/** FP-C X.5–X.8: evidence-based medicine; ethical considerations; GAMUT metrics; caregiver PTSD and suicide risk. */
import type { FpcLesson } from '../types';

export const EBM: FpcLesson = {
  id: 'fpc-ebm', domain: 'professional', ref: 'X.5',
  title: 'Evidence-based medicine in transport practice',
  summary: 'The five steps of evidence-based practice, PICO questions, appraising evidence, applying it to transport protocols, and the evidence behind key transport interventions.',
  objectives: [
    'Define evidence-based medicine and its three components.',
    'Formulate a PICO question and find and appraise relevant evidence.',
    'Apply evidence to protocols while recognising the limits of transport research.',
  ],
  sections: [
    {
      id: 'define', title: 'What evidence-based medicine is', core: true,
      body: [
        'Evidence-based medicine (EBM) is the integration of the best available research evidence with clinical expertise and patient values and circumstances. It is not "cookbook medicine": evidence informs decisions but does not replace judgement or the patient\'s preferences. In transport, it also includes the realities of the environment — limited space, equipment and time.',
        'The five steps: Ask a focused clinical question; Acquire the best evidence; Appraise it for validity, importance and applicability; Apply it, integrating expertise and patient values; and Assess (audit) the outcome. A PICO question structures the first step: Population, Intervention, Comparison, Outcome (sometimes with T for time). For example: "In adult trauma patients with haemorrhagic shock (P), does prehospital plasma (I) compared with crystalloid (C) reduce 30-day mortality (O)?"',
        'Sources: pre-appraised resources (clinical practice guidelines from reputable bodies, systematic reviews such as Cochrane, evidence summaries) are the most efficient; primary studies are searched in databases such as PubMed. Guidelines should be judged on their methods, conflicts of interest and currency.',
      ],
    },
    {
      id: 'appraise', title: 'Appraising and applying evidence', core: true,
      body: [
        'Appraisal asks three questions: Is it valid (appropriate design, randomisation, blinding, follow-up, intention-to-treat, minimal bias)? Are the results important (effect size, confidence intervals, absolute versus relative effects, NNT)? Do they apply to my patients and setting (similar populations, feasible in transport, acceptable to patients)?',
        'Transport research has particular challenges: small numbers, heterogeneous patients, difficulty blinding, consent in emergencies, and confounding by indication (sicker patients get more aggressive transport). Much practice rests on extrapolation from emergency department or ICU studies, observational data and expert consensus. When evidence is weak, protocols should say so and be revisited as new evidence appears.',
        'Implementation: change protocols through a structured process, train staff, measure adherence and outcomes, and feed results back — audit closes the loop. Resistance to change is normal; involving front-line clinicians and explaining the evidence improves uptake.',
      ],
      table: {
        caption: 'Selected transport-relevant evidence',
        head: ['Intervention', 'Key study', 'Finding (summary)'],
        rows: [['Prehospital plasma (air medical)', 'PAMPer (2018)', 'Lower 30-day mortality in at-risk trauma patients'], ['TXA in trauma', 'CRASH-2 (2010)', 'Reduced death from bleeding within 3 h'], ['Balanced transfusion', 'PROPPR (2015)', '1:1:1 improved haemostasis, fewer early exsanguination deaths'], ['Prehospital TBI guidelines', 'EPIC (2019)', 'Improved survival in severe TBI'], ['IM midazolam for status', 'RAMPART (2012)', 'At least as effective as IV lorazepam'], ['Video vs direct laryngoscopy', 'DEVICE (2023)', 'Higher first-attempt success with video in the ED/ICU']],
      },
    },
    {
      id: 'limits', title: 'Limits, bias and critical thinking', core: true,
      body: [
        'Be wary of practices adopted on the basis of plausible physiology without outcome evidence — history includes many reversals (routine high-flow oxygen in myocardial infarction, high-dose steroids in spinal cord injury and TBI, aggressive crystalloid resuscitation in trauma, and routine hyperventilation in head injury). Conversely, absence of evidence is not evidence of absence: some interventions are effective but unstudied.',
        'Recognise cognitive biases in applying evidence: confirmation bias (seeking evidence that supports existing beliefs), anchoring, the bandwagon effect and authority bias. Conflicts of interest, industry funding and publication bias can distort the evidence base.',
        'A culture of inquiry — journal clubs, case reviews, participation in research and quality improvement — keeps a transport programme\'s practice current.',
      ],
    },
    {
      id: 'case', title: 'Scenario: should we carry plasma?',
      body: ['Your programme\'s medical director asks whether to start carrying thawed plasma on the helicopter. The programme serves rural areas with transport times of 30–60 minutes.'],
      example: { case: 'Apply EBM.', steps: [
        'Ask: In injured patients at risk of haemorrhagic shock (P), does prehospital plasma (I) vs standard care (C) reduce 30-day mortality (O)?',
        'Acquire: PAMPer (air medical, benefit) and COMBAT (urban ground, short transport, no benefit); later analyses suggest benefit with longer transport times.',
        'Appraise and apply: your long rural transport times resemble PAMPer; consider logistics (blood bank partnership, wastage, storage).',
        'Assess: implement with a protocol, track usage, wastage and outcomes, and review.',
      ] },
    },
  ],
  keyPoints: [
    'EBM = best evidence + clinical expertise + patient values.',
    'Five steps: ask, acquire, appraise, apply, assess.',
    'PICO: population, intervention, comparison, outcome.',
    'Appraise validity, importance and applicability; transport evidence is often limited.',
    'Beware physiology-based practices without outcome evidence; audit changes.',
  ],
  pearls: ['Pre-appraised sources save time.', 'Many "obvious" practices have been reversed by trials.'],
  pitfalls: ['Treating guidelines as infallible.', 'Applying trial results to very different populations.'],
  questions: [
    { q: 'EBM integrates:', options: ['Evidence only', 'Best evidence, clinical expertise and patient values', 'Expert opinion only', 'Cost and speed'], answer: 1, why: 'Definition.' },
    { q: 'PICO stands for:', options: ['Patient, Intervention, Comparison, Outcome', 'Protocol, Implementation, Cost, Outcome', 'Pain, Infection, Circulation, Oxygen', 'Plan, Inform, Check, Order'], answer: 0, why: 'Question structure.' },
    { q: 'The first step of EBM:', options: ['Apply', 'Ask a focused clinical question', 'Assess', 'Appraise'], answer: 1, why: 'Ask, acquire, appraise, apply, assess.' },
    { q: 'The final step of EBM:', options: ['Ask', 'Assess (audit) the outcome', 'Acquire', 'Publish'], answer: 1, why: 'Closes the loop.' },
    { q: 'Appraisal considers:', options: ['Validity, importance and applicability', 'Author fame', 'Journal colour', 'Length'], answer: 0, why: 'Three questions.' },
    { q: 'A challenge in transport research:', options: ['Too many patients', 'Confounding by indication and small samples', 'Easy blinding', 'No ethics issues'], answer: 1, why: 'Methodological limits.' },
    { q: 'PAMPer found that prehospital plasma in air medical transport:', options: ['Increased mortality', 'Reduced 30-day mortality', 'Had no effect', 'Caused TRALI'], answer: 1, why: 'Prehospital plasma cut 30-day mortality in PAMPer.' },
    { q: 'A practice reversed by evidence:', options: ['Defibrillation for VF', 'Routine high-dose steroids in TBI', 'TXA in trauma', 'Epinephrine in anaphylaxis'], answer: 1, why: 'CRASH trial showed harm.' },
    { q: '"Absence of evidence is not evidence of absence" means:', options: ['Unstudied interventions are always useless', 'An intervention may work even if not yet studied', 'Evidence is irrelevant', 'All studies are wrong'], answer: 1, why: 'Interpretation.' },
    { q: 'Confirmation bias is:', options: ['Seeking evidence that supports existing beliefs', 'Random error', 'Publication delay', 'Blinding'], answer: 0, why: 'Cognitive bias.' },
    { q: 'Pre-appraised evidence sources include:', options: ['Blogs', 'Guidelines and systematic reviews', 'Single case reports', 'Advertisements'], answer: 1, why: 'Efficient sources.' },
    { q: 'EBM is NOT:', options: ['Integration of evidence and judgement', '"Cookbook medicine" replacing judgement', 'Considering patient values', 'Using research'], answer: 1, why: 'Common misconception.' },
    { q: 'Implementing a new protocol should include:', options: ['No training', 'Training, measurement and feedback', 'Immediate mandatory use without review', 'Avoiding front-line input'], answer: 1, why: 'Audit loop.' },
    { q: 'Applicability asks:', options: ['Is the study famous?', 'Do the results apply to my patients and setting?', 'Is it expensive?', 'Is it recent?'], answer: 1, why: 'External validity.' },
    { q: 'CRASH-2 studied:', options: ['Plasma', 'Tranexamic acid in trauma', 'Video laryngoscopy', 'Midazolam'], answer: 1, why: 'Reduced death from bleeding.' },
  ],
  sources: [
    { title: 'Sackett DL et al. Evidence based medicine: what it is and what it isn\'t. BMJ (1996)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Sackett+evidence+based+medicine+what+it+is+and+what+it+isn%27t+1996' },
    { title: 'Cochrane Library', url: 'https://www.cochranelibrary.com/' },
  ],
};

export const ETHICS: FpcLesson = {
  id: 'fpc-ethics', domain: 'professional', ref: 'X.6',
  title: 'Ethical considerations: consent, capacity, end of life and DNR',
  summary: 'The four principles of biomedical ethics, consent and decision-making capacity, refusal of care, advance directives, DNR and POLST orders in transport, futility, resource allocation and organ donation.',
  objectives: [
    'Apply the four principles of biomedical ethics to transport decisions.',
    'Assess decision-making capacity and manage consent and refusal.',
    'Honour advance directives, DNR and POLST orders and manage end-of-life care in transport.',
  ],
  sections: [
    {
      id: 'principles', title: 'Principles, consent and capacity', core: true,
      body: [
        'The four principles: autonomy (respecting a capable person\'s right to make decisions about their own care), beneficence (acting in the patient\'s best interest), non-maleficence (avoiding harm) and justice (fair allocation of resources and treatment). They often conflict — for example, a capable patient refusing a beneficial transfer.',
        'Informed consent requires that the patient has decision-making capacity, receives adequate information (nature of the proposed care, risks, benefits and alternatives, including no treatment), understands it and decides voluntarily. Implied consent applies in emergencies when a patient cannot consent and delay would cause harm. Capacity is decision-specific: the patient must be able to understand the information, appreciate how it applies to them, reason about options and communicate a choice. Hypoxia, hypoglycaemia, intoxication, head injury and shock can impair capacity — treat reversible causes and reassess.',
        'Minors generally require parental consent except in emergencies, for emancipated minors and for specific conditions defined by law. A capable adult may refuse care, even if the refusal seems unwise; document capacity, the information given, the risks explained (including death), attempts to persuade, alternatives offered and the patient\'s signature or witness.',
      ],
    },
    {
      id: 'eol', title: 'Advance directives, DNR and POLST', core: true,
      body: [
        'Advance directives (living wills and healthcare powers of attorney) record a person\'s wishes and appoint a surrogate decision-maker for when they cannot decide. Do-not-resuscitate (DNR or DNAR) orders state that CPR will not be attempted in cardiac or respiratory arrest; they do not mean "do not treat" — patients with DNR orders still receive oxygen, analgesia, fluids, antibiotics and transport as appropriate.',
        'POLST (Physician/Portable Orders for Life-Sustaining Treatment) forms are actionable medical orders for seriously ill patients that travel with the patient across settings. They specify CPR status and the level of medical intervention (full treatment, selective treatment or comfort-focused treatment) and preferences about artificial nutrition. Transport crews should look for these documents, verify them according to local law and protocol, and follow them. When the document is unclear or its validity is questioned, contact medical control; in a true emergency with genuine uncertainty, it is usually safest to resuscitate while clarifying.',
        'During interfacility transport, confirm code status with the sending team and the family before departure and document it. If a patient with comfort-focused orders deteriorates in flight, the focus is symptom relief (dyspnoea, pain, agitation) and dignity; diversion may not be appropriate if it does not serve the patient\'s goals.',
      ],
      table: {
        caption: 'Who decides? (general order; varies by jurisdiction)',
        head: ['Situation', 'Decision-maker'],
        rows: [['Capable adult', 'The patient'], ['Incapable adult with valid advance directive/POLST', 'Follow the document; surrogate interprets'], ['Incapable adult with appointed agent (power of attorney)', 'The agent'], ['No document or agent', 'Legal surrogate hierarchy (spouse, adult children, parents…)'], ['Emergency, no information', 'Implied consent — treat'], ['Minor', 'Parent/guardian (emergency exceptions)']],
      },
    },
    {
      id: 'other', title: 'Futility, resources and organ donation', core: true,
      body: [
        'Medical futility refers to interventions that cannot achieve the patient\'s goals or physiological effect. Decisions to withhold or withdraw such treatment should involve the treating team, ethics consultation where available and clear communication with the family; withholding and withdrawing are ethically equivalent. In transport, the question "will this transfer benefit the patient?" is legitimate — a high-risk flight for a patient with no prospect of benefit raises justice and non-maleficence concerns.',
        'Resource allocation (justice): air medical resources are limited; triage protocols allocate aircraft to patients most likely to benefit. In mass casualty incidents, triage shifts from the individual to the greatest good for the greatest number.',
        'Organ and tissue donation: patients with devastating brain injury may become organ donors. Transport crews support this by maintaining physiological support (oxygenation, blood pressure, temperature) during transfer and by notifying the organ procurement organisation according to policy. Conversations about donation are led by trained requesters, not by transport crew.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the POLST form in flight',
      body: ['You are transferring an 88-year-old with a hip fracture and advanced dementia from a nursing home. Her POLST form (signed by her physician) indicates DNR and "selective treatment" — hospital transfer acceptable, no intubation. In flight she develops respiratory distress and SpO₂ 82 %.'],
      example: { case: 'What do you do?', steps: [
        'Follow the POLST: no intubation and no CPR; selective treatment allows oxygen, non-invasive measures, medications.',
        'Give oxygen, position upright if possible, treat likely causes within the plan (e.g. bronchodilators, diuretics if appropriate), relieve distress (opioid for dyspnoea per protocol).',
        'Contact medical control if uncertain; document the POLST, actions and rationale.',
        'Communicate with the family/surrogate and the receiving team.',
      ] },
    },
  ],
  keyPoints: [
    'Autonomy, beneficence, non-maleficence, justice.',
    'Capacity: understand, appreciate, reason, communicate — decision-specific; treat reversible causes.',
    'Capable adults may refuse; document thoroughly.',
    'DNR ≠ do not treat; POLST orders travel with the patient and specify treatment level.',
    'Withholding and withdrawing are ethically equivalent; support organ donation by maintaining physiology.',
  ],
  pearls: ['Confirm code status before departure.', 'When genuinely uncertain in an emergency, resuscitate while clarifying.'],
  pitfalls: ['Treating DNR as "no care".', 'Assuming a confused hypoxic patient lacks capacity without treating the hypoxia.'],
  questions: [
    { q: 'The four principles of biomedical ethics:', options: ['Speed, safety, cost, quality', 'Autonomy, beneficence, non-maleficence, justice', 'Consent, capacity, competence, care', 'Rights, duties, laws, rules'], answer: 1, why: 'Beauchamp and Childress.' },
    { q: 'Decision-making capacity is:', options: ['Global and permanent', 'Decision-specific and can change', 'Determined by age only', 'Determined by diagnosis'], answer: 1, why: 'Assess for each decision.' },
    { q: 'Elements of capacity include:', options: ['Understanding, appreciation, reasoning, communicating a choice', 'Agreeing with the clinician', 'Being calm', 'Being literate'], answer: 0, why: 'Standard criteria.' },
    { q: 'Implied consent applies when:', options: ['The patient refuses', 'The patient cannot consent and delay would cause harm', 'Family disagree', 'Always'], answer: 1, why: 'Emergency doctrine.' },
    { q: 'A capable adult refusing transport:', options: ['Must be transported anyway', 'May refuse; document capacity, risks and alternatives', 'Is restrained', 'Is ignored'], answer: 1, why: 'Respecting autonomy: capable adults may refuse.' },
    { q: 'A DNR order means:', options: ['No treatment at all', 'No CPR in arrest; other treatments continue as appropriate', 'No transport', 'No analgesia'], answer: 1, why: 'Common misunderstanding.' },
    { q: 'POLST forms:', options: ['Are wishes without legal force', 'Are actionable medical orders that travel with the patient', 'Only apply in hospital', 'Replace consent entirely'], answer: 1, why: 'Portable orders.' },
    { q: 'Withholding and withdrawing life-sustaining treatment are:', options: ['Ethically different', 'Ethically equivalent', 'Both illegal', 'Never discussed'], answer: 1, why: 'Accepted ethical view.' },
    { q: 'Hypoxia and hypoglycaemia can:', options: ['Improve capacity', 'Impair capacity — treat and reassess', 'Have no effect', 'Confirm incapacity permanently'], answer: 1, why: 'Reversible causes.' },
    { q: 'Justice in transport relates to:', options: ['Billing', 'Fair allocation of limited resources', 'Court cases', 'Crew pay'], answer: 1, why: 'Resource allocation.' },
    { q: 'In genuine uncertainty about a DNR document during an emergency:', options: ['Never resuscitate', 'Usually resuscitate while clarifying', 'Ask the pilot', 'Wait'], answer: 1, why: 'Err toward life while clarifying.' },
    { q: 'Conversations about organ donation are usually led by:', options: ['The flight crew', 'Trained requesters/organ procurement staff', 'The pilot', 'Security'], answer: 1, why: 'Specialised role.' },
    { q: 'A healthcare power of attorney appoints:', options: ['A lawyer to sue', 'A surrogate decision-maker', 'A physician', 'A guardian for property only'], answer: 1, why: 'Advance directive.' },
    { q: 'Non-maleficence means:', options: ['Do good', 'Avoid harm', 'Respect autonomy', 'Be fair'], answer: 1, why: 'Non-maleficence is the duty to avoid harm.' },
    { q: 'Before an interfacility transfer, code status should be:', options: ['Assumed full', 'Confirmed and documented', 'Ignored', 'Decided by the pilot'], answer: 1, why: 'Avoid confusion in flight.' },
  ],
  sources: [
    { title: 'National POLST', url: 'https://polst.org/' },
    { title: 'Beauchamp TL, Childress JF. Principles of Biomedical Ethics — overview (Stanford Encyclopedia: Theory and bioethics)', url: 'https://plato.stanford.edu/entries/theory-bioethics/' },
  ],
};

export const GAMUT: FpcLesson = {
  id: 'fpc-gamut', domain: 'professional', ref: 'X.7',
  title: 'Quality improvement and GAMUT metrics',
  summary: 'The Ground and Air Medical qUality in Transport (GAMUT) collaborative, its quality metrics for critical care transport, how metrics are defined and benchmarked, and using data to drive improvement.',
  objectives: [
    'Describe the GAMUT collaborative and the purpose of its metrics.',
    'Identify common GAMUT quality metrics and how they are measured.',
    'Use metrics and benchmarking to drive quality improvement.',
  ],
  sections: [
    {
      id: 'what', title: 'What GAMUT is', core: true,
      body: [
        'GAMUT (Ground and Air Medical qUality in Transport) is a quality improvement collaborative for critical care transport programmes, originating from a consensus process among transport medicine experts (initially published around 2014–2015). It developed a set of standardised, transport-specific quality metrics and a database through which participating programmes submit data and compare their performance with others — benchmarking.',
        'Before GAMUT, programmes measured quality in different ways, making comparisons difficult. Shared definitions allow programmes to see where they stand, identify gaps and learn from high performers. Participation is voluntary and data are de-identified for benchmarking.',
        'Metrics are designed to be measurable, relevant to patient outcomes or safety, and actionable — a programme can change practice to improve them.',
      ],
    },
    {
      id: 'metrics', title: 'Common metrics', core: true,
      body: [
        'Airway metrics are among the most widely reported: first-attempt intubation success (with and without hypoxia or hypotension — "first-attempt success without adverse events"), use of waveform capnography to confirm intubation, peri-intubation hypoxia, and DASH-1A (definitive airway sans hypoxia/hypotension on first attempt). Other clinical metrics include: ventilated patients with an EtCO₂ documented, use of a checklist for RSI, appropriate management of specific conditions (such as STEMI time-to-PCI facilitation, pain assessment and reassessment, and neonatal temperature on arrival), and medication errors.',
        'Operational and safety metrics include response or launch times (time from request to departure), scene and bedside times, verbal acknowledgement of safety briefings, adverse events in transport, and unplanned dislodgement of tubes and lines. Pediatric and neonatal metrics include hypothermia on arrival and appropriate weight-based dosing.',
        'Each metric has a precise definition — numerator, denominator, inclusion and exclusion criteria — so that programmes measure the same thing. Accurate, complete documentation is therefore essential: if it is not documented, it cannot be measured.',
      ],
      table: {
        caption: 'Examples of transport quality metrics (GAMUT-type)',
        head: ['Domain', 'Example metric'],
        rows: [['Airway', 'First-attempt intubation success; DASH-1A'], ['Airway', 'Waveform capnography confirmation of ETT'], ['Airway', 'Peri-intubation hypoxia'], ['Cardiac', 'STEMI: time to PCI facilitation'], ['Pain', 'Pain assessed and reassessed'], ['Neonatal', 'Temperature on arrival in range'], ['Operations', 'Request-to-departure time'], ['Safety', 'Unplanned extubation / line dislodgement']],
      },
    },
    {
      id: 'improve', title: 'From data to improvement', core: true,
      body: [
        'Collect data accurately (often from electronic patient care records), review it regularly, compare with benchmarks, and look for trends rather than single events. When a metric lags — for example, peri-intubation hypoxia is higher than peers — investigate causes (preoxygenation practices, apnoeic oxygenation, patient selection, training) and test changes using plan–do–study–act cycles. Re-measure to confirm improvement and sustain it.',
        'Metrics can have unintended consequences: focusing on launch times could encourage unsafe haste; focusing on first-pass success could discourage necessary intubations in difficult cases. Balance measures (such as safety events) should accompany performance measures.',
        'Engage front-line clinicians: share results transparently, celebrate improvements, and use case reviews to connect numbers to real patients. Quality improvement is a team activity, not a punitive audit — just culture principles apply.',
      ],
    },
    {
      id: 'case', title: 'Scenario: the hypoxia problem',
      body: ['Your programme\'s benchmarking shows first-attempt intubation success of 88 % (similar to peers), but peri-intubation hypoxia (SpO₂ < 90 %) in 18 % of intubations — worse than the benchmark median.'],
      example: { case: 'Improve it.', steps: [
        'Review cases: preoxygenation duration, use of apnoeic oxygenation, positioning, NIV for preoxygenation, delayed sequence intubation in agitated patients.',
        'Implement a change bundle: standardised RSI checklist including preoxygenation targets and apnoeic oxygenation; simulation training.',
        'Re-measure monthly (PDSA); track DASH-1A as the combined outcome.',
        'Share results with crews and refine the bundle.',
      ] },
    },
  ],
  keyPoints: [
    'GAMUT = Ground and Air Medical qUality in Transport — shared metrics and benchmarking.',
    'Airway metrics: first-attempt success, capnography confirmation, peri-intubation hypoxia, DASH-1A.',
    'Each metric has defined numerator, denominator and criteria — documentation matters.',
    'Use PDSA cycles and benchmarking; watch for unintended consequences.',
    'Quality improvement is collaborative and non-punitive.',
  ],
  pearls: ['If it isn\'t documented, it can\'t be measured.', 'Pair performance metrics with balance measures.'],
  pitfalls: ['Reacting to single events instead of trends.', 'Metrics that encourage unsafe behaviour.'],
  questions: [
    { q: 'GAMUT stands for:', options: ['General Aviation Medical Unit Training', 'Ground and Air Medical qUality in Transport', 'Global Ambulance Metrics Under Testing', 'None'], answer: 1, why: 'Quality collaborative.' },
    { q: 'A primary purpose of GAMUT:', options: ['Aircraft certification', 'Standardised quality metrics and benchmarking', 'Pilot licensing', 'Billing'], answer: 1, why: 'Compare and improve.' },
    { q: 'DASH-1A refers to:', options: ['A drug dose', 'Definitive airway sans hypoxia/hypotension on first attempt', 'A flight phase', 'A ventilator mode'], answer: 1, why: 'Composite airway metric.' },
    { q: 'A common airway quality metric:', options: ['Fuel use', 'First-attempt intubation success', 'Pilot hours', 'Helicopter colour'], answer: 1, why: 'Widely reported.' },
    { q: 'Waveform capnography confirmation of intubation is:', options: ['Irrelevant', 'A quality metric', 'Optional', 'Only for neonates'], answer: 1, why: 'Standard of care.' },
    { q: 'Metrics require:', options: ['Vague definitions', 'Precise numerator, denominator and inclusion criteria', 'No documentation', 'Opinions'], answer: 1, why: 'Consistency.' },
    { q: 'Benchmarking means:', options: ['Building benches', 'Comparing performance with other programmes', 'Punishing staff', 'Setting fuel prices'], answer: 1, why: 'Definition.' },
    { q: 'A neonatal transport metric:', options: ['Temperature on arrival', 'Pilot age', 'Aircraft speed', 'Fuel temperature'], answer: 0, why: 'Hypothermia prevention.' },
    { q: 'An unintended consequence of focusing only on launch times:', options: ['Improved safety', 'Unsafe haste', 'Better documentation', 'Lower costs'], answer: 1, why: 'Balance measures needed.' },
    { q: 'PDSA cycles are used to:', options: ['Punish', 'Test and implement improvements iteratively', 'Fly aircraft', 'Bill patients'], answer: 1, why: 'Quality improvement.' },
    { q: 'If peri-intubation hypoxia is high, a likely improvement is:', options: ['Skipping preoxygenation', 'Standardised preoxygenation and apnoeic oxygenation', 'More attempts', 'Avoiding monitoring'], answer: 1, why: 'Evidence-based bundle.' },
    { q: 'Quality improvement should be:', options: ['Punitive', 'Collaborative and non-punitive', 'Secret', 'Annual only'], answer: 1, why: 'Just culture.' },
    { q: 'Reviewing trends rather than single events:', options: ['Is less useful', 'Avoids overreacting to random variation', 'Is impossible', 'Is unnecessary'], answer: 1, why: 'Signal vs noise.' },
    { q: 'Accurate documentation is essential because:', options: ['It looks neat', 'Metrics depend on it', 'It is optional', 'It slows care'], answer: 1, why: 'Measurement.' },
    { q: 'Balance measures are:', options: ['Weight and balance calculations', 'Metrics that detect unintended harm from improvement efforts', 'Financial audits', 'Ventilator settings'], answer: 1, why: 'Monitor side effects.' },
  ],
  sources: [
    { title: 'Schwartz HP et al. Quality metrics in pediatric and neonatal critical care transport: a consensus statement (GAMUT origin)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Schwartz+quality+metrics+pediatric+neonatal+critical+care+transport+consensus' },
    { title: 'GAMUT Quality Improvement Collaborative', url: 'https://www.gamutqi.org/' },
  ],
};

export const CAREGIVER_WELLBEING: FpcLesson = {
  id: 'fpc-caregiver-wellbeing', domain: 'professional', ref: 'X.8',
  title: 'Caregiver PTSD, burnout and suicide risk',
  summary: 'How cumulative exposure to trauma affects transport clinicians, recognising burnout, post-traumatic stress and moral injury, suicide risk in emergency services, and the individual, peer and organisational supports that help.',
  objectives: [
    'Describe burnout, compassion fatigue, PTSD and moral injury in emergency clinicians.',
    'Recognise warning signs of distress and suicide risk in yourself and colleagues.',
    'Use peer support, professional help and organisational strategies to protect wellbeing.',
  ],
  sections: [
    {
      id: 'conditions', title: 'How the work affects clinicians', core: true,
      body: [
        'Transport clinicians are exposed repeatedly to death, severe injury, children in crisis, and the stress of high-stakes decisions in demanding environments, often with disrupted sleep. Burnout is a work-related syndrome of emotional exhaustion, depersonalisation (cynicism, detachment from patients) and a reduced sense of accomplishment. Compassion fatigue (secondary traumatic stress) is the emotional cost of caring for people who are suffering.',
        'Post-traumatic stress disorder (PTSD) can follow a single critical incident or cumulative exposure. Symptoms include intrusive memories, nightmares and flashbacks; avoidance of reminders; negative changes in mood and thinking; and hyperarousal (irritability, poor sleep, hypervigilance), lasting more than a month and impairing function. Rates of PTSD, depression, anxiety and substance misuse are higher in emergency services than in the general population.',
        'Moral injury is distress from actions, or failures to act, that violate one\'s moral beliefs — for example, being unable to provide care a patient needed because of resource limits, or witnessing decisions perceived as wrong. It may present with guilt, shame, anger and loss of trust.',
      ],
    },
    {
      id: 'risk', title: 'Suicide risk and warning signs', core: true,
      body: [
        'Studies suggest that emergency medical services personnel, nurses and physicians have elevated rates of suicidal thoughts and, in several studies, suicide compared with the general population. Contributing factors include cumulative trauma, shift work and sleep deprivation, access to lethal means (including medications), workplace stress, stigma around seeking help and fear of career consequences.',
        'Warning signs in a colleague: talking about wanting to die, feeling hopeless or being a burden; withdrawal from colleagues, family and activities; increased alcohol or drug use; changes in sleep, mood or performance; reckless behaviour; giving away possessions; and sudden calm after a period of distress. Situational risk factors include relationship breakdown, financial problems, legal or disciplinary issues, and a recent critical incident.',
        'If you are worried about a colleague: ask directly and privately — "Are you thinking about suicide?" Asking does not plant the idea; it opens the door to help. Listen without judgement, keep them safe (do not leave someone at immediate risk alone, and help reduce access to means), and connect them to help — the 988 Suicide & Crisis Lifeline in the United States (call or text 988), an employee assistance programme, peer support or emergency services if danger is imminent.',
      ],
      table: {
        caption: 'Responding to a colleague in distress',
        head: ['Step', 'What to do'],
        rows: [['Notice', 'Changes in mood, behaviour, performance, withdrawal'], ['Ask', 'Directly and privately: "Are you thinking about suicide?"'], ['Listen', 'Without judgement; take it seriously'], ['Keep safe', 'Don\'t leave someone at immediate risk alone; reduce access to means'], ['Connect', '988 Lifeline (US), EAP, peer support, professional care, emergency services if imminent'], ['Follow up', 'Check in afterwards']],
      },
    },
    {
      id: 'support', title: 'Protective strategies', core: true,
      body: [
        'Individual: protect sleep, exercise, maintain relationships and interests outside work, limit alcohol, use reflective practices, and seek professional help early — talking therapies such as trauma-focused cognitive behavioural therapy and EMDR are effective for PTSD. Recognising your own warning signs is a professional skill, just like recognising a patient\'s deterioration.',
        'Peer support: trained peer supporters offer confidential, informal support after difficult calls and can connect colleagues to professional help. Structured approaches after critical incidents vary; current evidence does not support mandatory single-session psychological debriefing for everyone, but voluntary, supportive conversations, practical help and monitoring for persistent symptoms (psychological first aid and watchful waiting) are recommended.',
        'Organisational: leadership that talks openly about mental health, fatigue management and reasonable workloads, confidential access to mental health care without career penalty, employee assistance programmes, chaplaincy, critical incident support, and just culture. Removing stigma — through example and policy — is one of the most effective interventions.',
      ],
    },
    {
      id: 'case', title: 'Scenario: after the paediatric arrest',
      body: ['After an unsuccessful resuscitation of a toddler, a flight paramedic colleague seems fine at first. Over the next weeks she stops coming to crew meals, snaps at partners, says she is "not sleeping", and mentions that "maybe everyone would be better off without me".'],
      example: { case: 'What do you do?', steps: [
        'Recognise warning signs: withdrawal, irritability, sleep disturbance and a statement suggesting being a burden.',
        'Ask privately and directly about suicidal thoughts; listen without judgement.',
        'If at immediate risk, stay with her and get emergency help; otherwise connect her to 988, the EAP, peer support or a clinician — and offer to help make the call.',
        'Follow up; involve leadership supportively per policy; look after yourself too.',
      ] },
    },
  ],
  keyPoints: [
    'Burnout, compassion fatigue, PTSD and moral injury are occupational risks.',
    'Emergency clinicians have elevated rates of suicidal thoughts.',
    'Warning signs: hopelessness, being a burden, withdrawal, substance use, behaviour change.',
    'Ask directly; listen; keep safe; connect (988 in the US, EAP, peer support); follow up.',
    'Sleep, connection, early professional help, peer support and stigma-free organisations protect.',
  ],
  pearls: ['Asking about suicide does not increase risk.', 'Recognising your own warning signs is a professional skill.'],
  pitfalls: ['Assuming a colleague who "seems fine" is fine.', 'Mandatory one-off debriefs instead of ongoing support.'],
  questions: [
    { q: 'Burnout consists of:', options: ['Fever, rash, fatigue', 'Emotional exhaustion, depersonalisation and reduced accomplishment', 'Hypoxia', 'PTSD only'], answer: 1, why: 'Classic triad.' },
    { q: 'Compassion fatigue is also called:', options: ['Burnout', 'Secondary traumatic stress', 'Moral injury', 'Depression'], answer: 1, why: 'Cost of caring.' },
    { q: 'PTSD symptoms include:', options: ['Improved sleep', 'Intrusive memories, avoidance, negative mood, hyperarousal', 'Increased appetite only', 'No functional impact'], answer: 1, why: 'Symptom clusters.' },
    { q: 'Moral injury results from:', options: ['Physical injury', 'Actions or failures that violate one\'s moral beliefs', 'Fatigue only', 'Infection'], answer: 1, why: 'Definition.' },
    { q: 'Asking a colleague directly about suicide:', options: ['Increases risk', 'Does not plant the idea; opens the door to help', 'Is unprofessional', 'Should be avoided'], answer: 1, why: 'Evidence-based.' },
    { q: 'The US crisis line number:', options: ['911 only', '988', '411', '311'], answer: 1, why: '988 Suicide & Crisis Lifeline.' },
    { q: 'A warning sign of suicide risk:', options: ['Planning a holiday', 'Talking about being a burden', 'Better sleep', 'Increased social contact'], answer: 1, why: 'Recognised warning sign.' },
    { q: 'Mandatory single-session debriefing for everyone after incidents:', options: ['Strongly supported by evidence', 'Not supported by current evidence', 'Required by law', 'Prevents all PTSD'], answer: 1, why: 'Voluntary support preferred.' },
    { q: 'Effective therapies for PTSD include:', options: ['Avoidance', 'Trauma-focused CBT and EMDR', 'Alcohol', 'Isolation'], answer: 1, why: 'Evidence-based therapies.' },
    { q: 'Peer support programmes:', options: ['Replace all professional care', 'Offer confidential support and connect to professional help', 'Are disciplinary', 'Are only for managers'], answer: 1, why: 'Bridge to help.' },
    { q: 'If a colleague is at immediate risk, you should:', options: ['Leave them to rest', 'Stay with them and get emergency help', 'Tell them to call later', 'Ignore it'], answer: 1, why: 'Safety first.' },
    { q: 'An organisational protective factor:', options: ['Stigma around help-seeking', 'Confidential mental health access without career penalty', 'Longer shifts', 'Punitive culture'], answer: 1, why: 'Reduces barriers.' },
    { q: 'A contributing factor to suicide risk in clinicians:', options: ['Good sleep', 'Access to lethal means and stigma', 'Strong support', 'Reasonable workload'], answer: 1, why: 'Risk factor.' },
    { q: 'Sudden calm after a period of distress may indicate:', options: ['Full recovery always', 'A possible warning sign', 'Nothing', 'Improved sleep'], answer: 1, why: 'May reflect a decision.' },
    { q: 'Psychological first aid emphasises:', options: ['Forced retelling', 'Safety, calm, connection, practical help and monitoring', 'Medication for all', 'Immediate return to work'], answer: 1, why: 'Supportive approach.' },
  ],
  sources: [
    { title: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org/' },
    { title: 'SAMHSA: First responders — disaster and trauma resources', url: 'https://www.samhsa.gov/dtac/disaster-responders' },
    { title: 'Code Green Campaign (first responder mental health)', url: 'https://codegreencampaign.org/' },
  ],
};
