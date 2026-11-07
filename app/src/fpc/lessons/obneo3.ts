/** FP-C VIII.7–VIII.9: pre-eclampsia and eclampsia; premature rupture of membranes; maternal complications. */
import type { FpcLesson } from '../types';

export const PREECLAMPSIA: FpcLesson = {
  id: 'fpc-preeclampsia', domain: 'obneo', ref: 'VIII.7',
  title: 'Pre-eclampsia and eclampsia',
  summary: 'Diagnosing pre-eclampsia and its severe features, controlling blood pressure, magnesium for seizure prophylaxis and treatment, managing eclampsia in transport, and recognising complications.',
  objectives: [
    'Diagnose pre-eclampsia and identify severe features.',
    'Control severe hypertension and give magnesium sulfate correctly.',
    'Manage an eclamptic seizure and its complications during transport.',
  ],
  sections: [
    {
      id: 'dx', title: 'Diagnosis and severe features', core: true,
      body: [
        'Pre-eclampsia is new hypertension (systolic ≥ 140 or diastolic ≥ 90 on two occasions at least 4 hours apart) after 20 weeks of gestation with proteinuria or, in its absence, evidence of end-organ dysfunction. It can also present for the first time postpartum, up to about 6 weeks after delivery. The cause is abnormal placentation leading to widespread endothelial dysfunction and vasospasm.',
        'Severe features: systolic ≥ 160 or diastolic ≥ 110; platelets below 100 × 10⁹/L; liver transaminases twice normal or severe right upper quadrant/epigastric pain; creatinine above 97 µmol/L (1.1 mg/dL) or doubling; pulmonary oedema; and new headache unresponsive to medication or visual disturbances. Hyperreflexia and clonus suggest cerebral irritability.',
        'Risk factors: first pregnancy, previous pre-eclampsia, chronic hypertension, diabetes, renal disease, autoimmune disease, multiple pregnancy, obesity, age over 35 and IVF pregnancy. Definitive treatment is delivery of the placenta; until then, the aims are to prevent stroke, seizures and organ damage while planning timing and place of delivery.',
      ],
    },
    {
      id: 'treat', title: 'Blood pressure and magnesium', core: true,
      body: [
        'Severe hypertension (≥ 160/110 sustained for 15 minutes) must be treated within 30–60 minutes: stroke is the leading cause of death in pre-eclampsia. IV labetalol (20, 40, then 80 mg every 10 minutes, up to 300 mg), IV hydralazine (5–10 mg every 20 minutes) or oral immediate-release nifedipine (10–20 mg) are first line. Aim for 140–150/90–100; overly rapid falls can compromise placental perfusion — monitor the fetal heart.',
        'Magnesium sulfate prevents eclampsia in pre-eclampsia with severe features (and treats eclamptic seizures): 4–6 g IV over 15–20 minutes, then 1–2 g/hour, continued for 24 hours after delivery or the last seizure. Monitor reflexes, respiratory rate and urine output; reduce the dose in oliguria or renal impairment. Calcium gluconate 1 g IV reverses toxicity.',
        'Fluids: pre-eclamptic women are at risk of pulmonary oedema from capillary leak, low oncotic pressure and diastolic dysfunction. Restrict total fluids (often about 80 mL/hour) and avoid large boluses unless haemorrhaging. Place a urinary catheter and record hourly output.',
      ],
      table: {
        caption: 'Severe features of pre-eclampsia',
        head: ['System', 'Feature'],
        rows: [['Blood pressure', '≥ 160 systolic or ≥ 110 diastolic'], ['Haematological', 'Platelets < 100 × 10⁹/L'], ['Liver', 'Transaminases ≥ 2× normal or RUQ/epigastric pain'], ['Renal', 'Creatinine > 97 µmol/L (1.1 mg/dL) or doubling'], ['Lungs', 'Pulmonary oedema'], ['Neurological', 'Persistent headache or visual disturbance']],
      },
    },
    {
      id: 'eclampsia', title: 'Eclampsia', core: true,
      body: [
        'Eclampsia is a generalised seizure in a woman with pre-eclampsia (although up to a fifth of eclamptic seizures occur before hypertension or proteinuria are recognised, and some occur postpartum). Warning signs: severe headache, visual disturbance, epigastric pain and hyperreflexia.',
        'During a seizure: protect from injury, place in left lateral position, maintain the airway, give oxygen and suction. Most eclamptic seizures are brief and self-limiting. Give magnesium 4–6 g IV over 15–20 minutes (or 5 g IM into each buttock if no IV access); for recurrent seizures, give a further 2 g IV. Benzodiazepines are second-line if magnesium fails. Treat severe hypertension.',
        'After the seizure, assess the fetus — bradycardia during and after a seizure usually recovers within minutes as maternal oxygenation improves; do not rush to delivery until the mother is stabilised. Consider other causes of seizures (intracranial haemorrhage, posterior reversible encephalopathy syndrome, cerebral venous thrombosis, hypoglycaemia) if the seizure is atypical or recurrent. Persistent neurological deficit or reduced consciousness needs imaging.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the seizure at altitude',
      body: ['During transfer of a 35-week patient with severe pre-eclampsia (BP 172/112, on magnesium 1 g/h after a 4 g load), she complains of worsening headache and then has a generalised seizure lasting 90 seconds. Fetal heart rate falls to 90.'],
      example: { case: 'Act.', steps: [
        'Left lateral position, protect the airway, oxygen, suction.',
        'Magnesium 2 g IV bolus (recurrent/breakthrough seizure on maintenance); increase maintenance per protocol.',
        'Treat BP: labetalol 20 mg IV (repeat/escalate) or hydralazine.',
        'Recheck fetal heart after maternal stabilisation; it usually recovers.',
        'Notify the receiving obstetric team; plan delivery once the mother is stable.',
      ] },
    },
  ],
  keyPoints: [
    'Pre-eclampsia: BP ≥ 140/90 after 20 weeks + proteinuria or end-organ dysfunction; can occur postpartum.',
    'Severe BP ≥ 160/110 → treat within 30–60 min (labetalol, hydralazine, nifedipine).',
    'Magnesium 4–6 g load, 1–2 g/h; 2 g bolus for recurrent seizures.',
    'Restrict fluids — pulmonary oedema risk.',
    'Fetal bradycardia after an eclamptic seizure usually recovers — stabilise the mother first.',
  ],
  pearls: ['Stroke is the leading cause of death in pre-eclampsia.', 'IM magnesium if no IV access.'],
  pitfalls: ['Treating seizures with benzodiazepines instead of magnesium.', 'Liberal fluid boluses.'],
  live: [{ id: 'moa-labetalol', label: 'Labetalol: mechanism' }],
  questions: [
    { q: 'Pre-eclampsia is diagnosed after:', options: ['10 weeks', '20 weeks', '36 weeks only', 'Delivery only'], answer: 1, why: 'Definition.' },
    { q: 'BP threshold for severe features:', options: ['≥ 140/90', '≥ 160/110', '≥ 130/80', '≥ 180/120'], answer: 1, why: 'Severe range.' },
    { q: 'Leading cause of death in pre-eclampsia:', options: ['Seizures', 'Stroke', 'Renal failure', 'Infection'], answer: 1, why: 'Treat severe hypertension promptly.' },
    { q: 'Severe hypertension should be treated within:', options: ['24 hours', '30–60 minutes', '6 hours', 'After delivery'], answer: 1, why: 'Prevent stroke.' },
    { q: 'Seizure prophylaxis in pre-eclampsia with severe features:', options: ['Phenytoin', 'Magnesium sulfate', 'Diazepam', 'Levetiracetam'], answer: 1, why: 'Superior efficacy.' },
    { q: 'Recurrent eclamptic seizure on maintenance magnesium:', options: ['Stop magnesium', 'Give an additional 2 g IV bolus', 'Give phenytoin first', 'Nothing'], answer: 1, why: 'Top-up dose.' },
    { q: 'Magnesium without IV access:', options: ['Oral', '5 g IM into each buttock', 'Rectal', 'Not possible'], answer: 1, why: 'IM loading.' },
    { q: 'Fluid management in pre-eclampsia:', options: ['Liberal boluses', 'Restrict — pulmonary oedema risk', 'No fluids', 'Hypotonic fluids'], answer: 1, why: 'Capillary leak.' },
    { q: 'Pre-eclampsia can first present:', options: ['Only antenatally', 'Up to about 6 weeks postpartum', 'Only in labour', 'Before 20 weeks typically'], answer: 1, why: 'Postpartum onset.' },
    { q: 'Definitive treatment of pre-eclampsia:', options: ['Magnesium', 'Delivery of the placenta', 'Antihypertensives', 'Bed rest'], answer: 1, why: 'Removes the cause.' },
    { q: 'Fetal bradycardia after an eclamptic seizure usually:', options: ['Requires immediate caesarean in all cases', 'Recovers as maternal oxygenation improves', 'Is permanent', 'Is irrelevant'], answer: 1, why: 'Stabilise mother first.' },
    { q: 'A severe feature of pre-eclampsia:', options: ['Mild ankle swelling', 'Platelets < 100 × 10⁹/L', 'Nausea in first trimester', 'Back pain'], answer: 1, why: 'Thrombocytopenia.' },
    { q: 'Hyperreflexia and clonus suggest:', options: ['Magnesium toxicity', 'Cerebral irritability', 'Normal pregnancy', 'Hypocalcaemia only'], answer: 1, why: 'Seizure risk.' },
    { q: 'Target BP when treating severe hypertension in pregnancy:', options: ['< 100/60', 'About 140–150/90–100', 'Normal for age', '< 120/80'], answer: 1, why: 'Avoid placental hypoperfusion.' },
    { q: 'Magnesium is continued after delivery for about:', options: ['1 hour', '24 hours', '1 week', 'Not continued'], answer: 1, why: 'Seizure risk persists.' },
  ],
  sources: [
    { title: 'ACOG Practice Bulletin 222: Gestational hypertension and preeclampsia (2020)', url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2020/06/gestational-hypertension-and-preeclampsia' },
    { title: 'Magpie Trial Collaborative Group. Lancet (2002)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Magpie+trial+magnesium+sulphate+pre-eclampsia+Lancet+2002' },
  ],
};

export const PROM: FpcLesson = {
  id: 'fpc-prom', domain: 'obneo', ref: 'VIII.8',
  title: 'Premature and preterm premature rupture of membranes',
  summary: 'Defining PROM and PPROM, confirming rupture, the risks of infection, cord prolapse and preterm birth, antibiotics, steroids and magnesium, and transport decisions.',
  objectives: [
    'Define PROM and PPROM and confirm membrane rupture.',
    'Recognise complications, including chorioamnionitis and cord prolapse.',
    'Apply antibiotics, steroids, magnesium and transport decisions for PPROM.',
  ],
  sections: [
    {
      id: 'define', title: 'Definitions and diagnosis', core: true,
      body: [
        'Prelabour rupture of membranes (PROM) is rupture before the onset of labour at any gestation; at term it affects about 8 % of pregnancies, and most women labour within 24 hours. Preterm prelabour rupture of membranes (PPROM) is rupture before 37 weeks and before labour; it complicates about 3 % of pregnancies and causes about a third of preterm births. Prolonged rupture is more than 18–24 hours.',
        'Diagnosis: history of a gush or continuous leak of fluid; sterile speculum examination showing pooling of fluid in the posterior vagina or leaking from the cervix with coughing; and tests such as nitrazine paper (alkaline amniotic fluid turns it blue — false positives with blood, semen and infection) or ferning on microscopy, or commercial protein tests. Avoid digital cervical examination in PPROM unless the woman is in active labour, because it increases infection risk and shortens latency.',
        'Ultrasound may show reduced amniotic fluid (oligohydramnios). Note the colour of the fluid: meconium staining or blood-stained fluid alters management.',
      ],
    },
    {
      id: 'risks', title: 'Complications', core: true,
      body: [
        'Infection: chorioamnionitis (intra-amniotic infection) presents with maternal fever, maternal and fetal tachycardia, uterine tenderness and foul-smelling fluid, and threatens both mother (sepsis) and baby (neonatal sepsis, cerebral palsy). It requires broad-spectrum antibiotics and usually delivery.',
        'Cord prolapse is more likely, especially with malpresentation or a high presenting part. Placental abruption is also more common. Preterm birth follows in most cases of PPROM — about half deliver within a week — with the complications of prematurity. Very early PPROM (before about 24 weeks) risks pulmonary hypoplasia and limb deformities from prolonged oligohydramnios.',
        'Signs of fetal compromise — variable decelerations from cord compression, bradycardia — need urgent assessment for cord prolapse and delivery.',
      ],
    },
    {
      id: 'manage', title: 'Management and transport', core: true,
      body: [
        'At term, most women are offered induction of labour (or expectant management for a limited time); group B streptococcus prophylaxis is given if indicated. In PPROM without infection or fetal compromise, expectant management until about 34 weeks reduces prematurity complications: antibiotics to prolong latency (commonly ampicillin and erythromycin or azithromycin for 7 days — avoid amoxicillin-clavulanate, associated with necrotising enterocolitis), antenatal corticosteroids (24–34 weeks), magnesium for neuroprotection before 32 weeks if delivery is imminent, and GBS prophylaxis in labour. Tocolysis in PPROM is controversial and not routinely recommended.',
        'Transport: women with PPROM are usually transferred to a centre with an appropriate NICU before delivery. Before departure, check for labour, cord prolapse, infection and fetal wellbeing. In flight, monitor maternal temperature, heart rate, contractions and fetal heart, and carry delivery and neonatal resuscitation equipment.',
        'If chorioamnionitis is present, delivery is indicated regardless of gestation; antibiotics should be started before transfer, and the receiving neonatal team informed.',
      ],
      table: {
        caption: 'PPROM checklist before transport',
        head: ['Check', 'Action'],
        rows: [['Gestational age', 'Destination with appropriate NICU'], ['Labour?', 'Assess contractions; avoid digital exam'], ['Infection?', 'Temperature, maternal/fetal tachycardia, tenderness → antibiotics'], ['Cord prolapse?', 'FHR; inspect'], ['Steroids', 'First dose if 24–34 weeks'], ['Antibiotics', 'Latency regimen; GBS prophylaxis in labour'], ['Magnesium', '< 32 weeks if delivery imminent']],
      },
    },
    {
      id: 'case', title: 'Transport case: PPROM at 30 weeks',
      body: ['A 30-week patient with leaking fluid for 14 hours; speculum exam confirms pooling. Temperature 37.2 °C, HR 92, uterus non-tender, mild irregular tightenings. FHR 140 with moderate variability. The referring hospital has no NICU.'],
      example: { case: 'Plan.', steps: [
        'PPROM without signs of infection or labour — transfer to a centre with a NICU.',
        'Latency antibiotics (ampicillin + erythromycin/azithromycin per protocol); first dose of betamethasone.',
        'Magnesium for neuroprotection if delivery becomes imminent (< 32 weeks).',
        'No digital cervical exam; monitor temperature, contractions and FHR in flight; carry neonatal equipment.',
      ] },
    },
  ],
  keyPoints: [
    'PROM = rupture before labour; PPROM = before 37 weeks; prolonged > 18–24 h.',
    'Confirm with sterile speculum; avoid digital exam in PPROM.',
    'Risks: chorioamnionitis, cord prolapse, abruption, preterm birth.',
    'PPROM: latency antibiotics (avoid co-amoxiclav), steroids 24–34 weeks, magnesium < 32 weeks if imminent.',
    'Chorioamnionitis → antibiotics and delivery.',
  ],
  pearls: ['Nitrazine false positives: blood, semen, infection.', 'Half of PPROM deliver within a week.'],
  pitfalls: ['Digital examinations in PPROM.', 'Missing early signs of chorioamnionitis (maternal and fetal tachycardia).'],
  live: [{ id: 'neo-transition', label: 'Neonatal transition' }],
  questions: [
    { q: 'PPROM is rupture of membranes:', options: ['After labour starts at term', 'Before 37 weeks and before labour', 'After 42 weeks', 'During delivery'], answer: 1, why: 'Definition.' },
    { q: 'Prolonged rupture of membranes is more than:', options: ['1 hour', '18–24 hours', '7 days', '2 hours'], answer: 1, why: 'Infection risk rises.' },
    { q: 'Rupture is best confirmed by:', options: ['Digital cervical exam', 'Sterile speculum exam showing pooling', 'Blood test', 'Palpation'], answer: 1, why: 'Avoid infection.' },
    { q: 'Digital cervical exams in PPROM:', options: ['Recommended daily', 'Avoided unless in active labour', 'Required before transport', 'Harmless'], answer: 1, why: 'Increase infection, shorten latency.' },
    { q: 'Nitrazine paper turns blue with:', options: ['Acidic urine', 'Alkaline amniotic fluid', 'Water', 'Glucose'], answer: 1, why: 'Nitrazine is a pH indicator.' },
    { q: 'A false positive nitrazine test can be caused by:', options: ['Blood or semen', 'Water', 'Saline', 'Urine only'], answer: 0, why: 'Alkaline fluids.' },
    { q: 'Signs of chorioamnionitis:', options: ['Maternal bradycardia', 'Maternal fever, maternal and fetal tachycardia, uterine tenderness', 'Hypertension only', 'Normal temperature'], answer: 1, why: 'Intra-amniotic infection.' },
    { q: 'Chorioamnionitis is managed with:', options: ['Expectant care', 'Antibiotics and delivery', 'Tocolysis', 'Steroids only'], answer: 1, why: 'Infection source.' },
    { q: 'Antibiotic avoided in PPROM because of NEC association:', options: ['Ampicillin', 'Amoxicillin-clavulanate', 'Erythromycin', 'Azithromycin'], answer: 1, why: 'ORACLE trial finding.' },
    { q: 'Antenatal steroids in PPROM are given between:', options: ['20–22 weeks', '24–34 weeks', '37–40 weeks', 'Never'], answer: 1, why: 'Reduce prematurity complications.' },
    { q: 'Very early PPROM (< 24 weeks) risks:', options: ['Macrosomia', 'Pulmonary hypoplasia', 'Post-term pregnancy', 'Polyhydramnios'], answer: 1, why: 'Prolonged oligohydramnios.' },
    { q: 'PPROM increases the risk of:', options: ['Cord prolapse', 'Hypertension', 'Gestational diabetes', 'Placenta accreta'], answer: 0, why: 'Loss of fluid cushion.' },
    { q: 'About half of PPROM cases deliver within:', options: ['1 day', '1 week', '1 month', '3 months'], answer: 1, why: 'Latency period.' },
    { q: 'Tocolysis in PPROM is:', options: ['Always given', 'Controversial and not routinely recommended', 'Mandatory', 'Contraindicated by law'], answer: 1, why: 'Limited benefit, infection risk.' },
    { q: 'Variable decelerations after membrane rupture suggest:', options: ['Head compression', 'Cord compression or prolapse', 'Normal', 'Fetal sleep'], answer: 1, why: 'Check for prolapse.' },
  ],
  sources: [
    { title: 'ACOG Practice Bulletin 217: Prelabor rupture of membranes (2020)', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { title: 'Kenyon SL et al. ORACLE I trial. Lancet (2001)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Kenyon+ORACLE+broad-spectrum+antibiotics+preterm+prelabour+rupture+fetal+membranes+2001' },
  ],
};

export const MATERNAL: FpcLesson = {
  id: 'fpc-maternal', domain: 'obneo', ref: 'VIII.9',
  title: 'Maternal complications: hypertension, HELLP, tetanic contractions and retained products',
  summary: 'Pregnancy-induced hypertension, HELLP syndrome, hypertonic and tetanic contractions, retained placenta and products, uterine inversion, amniotic fluid embolism, and maternal cardiac arrest.',
  objectives: [
    'Manage gestational hypertension and HELLP syndrome.',
    'Recognise and treat hypertonic or tetanic contractions.',
    'Manage retained products, uterine inversion, amniotic fluid embolism and maternal arrest.',
  ],
  sections: [
    {
      id: 'htn', title: 'Pregnancy-induced hypertension and HELLP', core: true,
      body: [
        'Gestational (pregnancy-induced) hypertension is new hypertension after 20 weeks without proteinuria or end-organ features; it can progress to pre-eclampsia, so it is monitored closely and severe-range pressures are treated in the same way. Chronic hypertension predates pregnancy or appears before 20 weeks; pre-eclampsia can be superimposed on it.',
        'HELLP syndrome (haemolysis, elevated liver enzymes, low platelets) is a severe variant of pre-eclampsia, sometimes without marked hypertension or proteinuria. Symptoms include right upper quadrant or epigastric pain, nausea, vomiting and malaise — often mistaken for gastritis or gallbladder disease. Complications: DIC, placental abruption, acute kidney injury, pulmonary oedema, and subcapsular liver haematoma or rupture (sudden severe pain, shock — a surgical emergency).',
        'Management: magnesium for seizure prophylaxis, blood pressure control, correction of coagulopathy (platelets before caesarean if below about 50 × 10⁹/L, fibrinogen replacement), and delivery — usually expedited after maternal stabilisation, at a centre with obstetric, intensive care and neonatal capability. Avoid IM injections when platelets are very low.',
      ],
    },
    {
      id: 'tetanic', title: 'Hypertonic and tetanic contractions', core: true,
      body: [
        'A hypertonic contraction lasts more than 2 minutes, or the uterus fails to relax between contractions (raised resting tone); tetanic contractions are sustained, without relaxation. Causes: oxytocin or prostaglandin excess, placental abruption and, rarely, uterine rupture. They reduce placental blood flow and quickly cause fetal bradycardia.',
        'Management: stop oxytocin, place the mother in left lateral position, give an IV fluid bolus (if not pre-eclamptic with pulmonary oedema risk), oxygen if hypoxic, and give a tocolytic such as terbutaline 0.25 mg subcutaneously (or nitroglycerin per protocol). Evaluate for abruption (pain, bleeding, tender uterus) and rupture (previous scar, loss of station). If fetal compromise persists, expedite delivery.',
        'In transport, recognise the pattern on the tocodynamometer or by palpation: a uterus that stays hard between "contractions" is not normal labour.',
      ],
    },
    {
      id: 'post', title: 'Retained products, inversion, AFE and maternal arrest', core: true,
      body: [
        'Retained placenta (not delivered within 30–60 minutes of birth) and retained products of conception cause postpartum haemorrhage and infection. Do not pull hard on the cord (risk of uterine inversion or cord avulsion). Give uterotonics, manage haemorrhage, and transfer for manual removal under anaesthesia. Retained products after miscarriage or delivery can cause sepsis (fever, offensive discharge, tender uterus) — antibiotics and evacuation.',
        'Uterine inversion — the fundus turning inside out, often after excessive cord traction — causes sudden haemorrhage and shock (sometimes disproportionate, from vagal response). Attempt immediate manual replacement (push the fundus back up through the cervix with the palm) before the cervix contracts; stop uterotonics until it is replaced, then give them. Do not remove an attached placenta before replacement.',
        'Amniotic fluid embolism: sudden collapse during labour or shortly after delivery, with hypoxia, hypotension, cardiac arrest and DIC. Treatment is supportive: high-quality CPR, airway and oxygenation, vasopressors and inotropes, massive transfusion with early fibrinogen. Maternal cardiac arrest: call for help, CPR with manual left uterine displacement (from about 20 weeks), early airway management, IV access above the diaphragm, standard ACLS drugs and doses, and resuscitative hysterotomy (perimortem caesarean) within about 4–5 minutes of arrest if no ROSC — mainly to improve maternal resuscitation.',
      ],
      table: {
        caption: 'Maternal arrest: key modifications',
        head: ['Element', 'Modification'],
        rows: [['Positioning', 'Manual left uterine displacement (≥ 20 weeks)'], ['Airway', 'Early, experienced; expect difficulty; smaller tube'], ['Access', 'Above the diaphragm'], ['Drugs', 'Standard ACLS doses'], ['Magnesium patient', 'Stop infusion; give calcium'], ['Hysterotomy', 'Within ~4–5 min if no ROSC (≥ 20 weeks)']],
      },
    },
    {
      id: 'case', title: 'Transport case: the epigastric pain',
      body: ['A 32-week patient presents with epigastric pain and vomiting. BP 146/94. Labs: platelets 48, AST 420, LDH 1100. During transfer, she suddenly develops severe right upper quadrant pain, becomes pale, and BP falls to 78/40.'],
      example: { case: 'Interpret and act.', steps: [
        'HELLP syndrome with probable subcapsular liver haematoma rupture — haemorrhagic shock.',
        'Blood products (platelets, plasma, red cells, fibrinogen); TXA per protocol; calcium.',
        'Magnesium continues for seizure prophylaxis (monitor carefully in shock and oliguria).',
        'Divert or pre-alert for emergency laparotomy and delivery; left lateral tilt; monitor the fetus.',
      ] },
    },
  ],
  keyPoints: [
    'Gestational hypertension can progress to pre-eclampsia; severe pressures are treated the same way.',
    'HELLP: RUQ/epigastric pain, haemolysis, raised enzymes, low platelets; liver rupture risk.',
    'Hypertonic/tetanic contractions: stop oxytocin, left tilt, terbutaline; look for abruption or rupture.',
    'Uterine inversion: replace immediately; hold uterotonics until replaced.',
    'Maternal arrest: left uterine displacement, standard ACLS, hysterotomy within ~4–5 min.',
  ],
  pearls: ['HELLP can mimic gastritis or gallbladder disease.', 'No hard traction on the cord.'],
  pitfalls: ['Missing HELLP without severe hypertension.', 'Giving uterotonics before replacing an inverted uterus.'],
  live: [{ id: 'ob-circulation', label: 'Maternal circulation and haemorrhage' }],
  questions: [
    { q: 'Gestational hypertension differs from pre-eclampsia by:', options: ['Occurring before 20 weeks', 'Absence of proteinuria and end-organ features', 'Higher BP', 'Seizures'], answer: 1, why: 'Definition.' },
    { q: 'HELLP commonly presents with:', options: ['Headache only', 'RUQ or epigastric pain, nausea, malaise', 'Leg swelling only', 'Fever and rash'], answer: 1, why: 'Liver involvement.' },
    { q: 'Sudden severe RUQ pain and shock in HELLP suggests:', options: ['Gastritis', 'Subcapsular liver haematoma rupture', 'Gallstones', 'Normal labour'], answer: 1, why: 'Surgical emergency.' },
    { q: 'A hypertonic contraction lasts more than:', options: ['30 seconds', '2 minutes', '10 seconds', '1 hour'], answer: 1, why: 'Definition.' },
    { q: 'First step for tetanic contractions on oxytocin:', options: ['Increase oxytocin', 'Stop oxytocin', 'Give methylergonovine', 'Push'], answer: 1, why: 'Remove the cause.' },
    { q: 'Tocolytic for acute tachysystole:', options: ['Oxytocin', 'Terbutaline 0.25 mg SC', 'Misoprostol', 'Carboprost'], answer: 1, why: 'Rapid uterine relaxation.' },
    { q: 'Retained placenta is defined as not delivered within:', options: ['5 minutes', '30–60 minutes', '24 hours', '1 week'], answer: 1, why: 'Definition.' },
    { q: 'Uterine inversion is often caused by:', options: ['Fundal massage', 'Excessive cord traction', 'Oxytocin', 'Breastfeeding'], answer: 1, why: 'Pulling on an attached placenta.' },
    { q: 'Uterine inversion management:', options: ['Give uterotonics first', 'Immediate manual replacement, then uterotonics', 'Remove placenta first', 'Wait'], answer: 1, why: 'Before cervix contracts.' },
    { q: 'Amniotic fluid embolism presents with:', options: ['Slow onset rash', 'Sudden collapse, hypoxia, hypotension and DIC', 'Hypertension only', 'Fever only'], answer: 1, why: 'Catastrophic.' },
    { q: 'In maternal arrest after 20 weeks, perform:', options: ['Right uterine displacement', 'Manual left uterine displacement', 'Trendelenburg', 'Prone CPR'], answer: 1, why: 'Relieve aortocaval compression.' },
    { q: 'Resuscitative hysterotomy should be performed within about:', options: ['30 minutes', '4–5 minutes of arrest if no ROSC', '1 hour', 'Never'], answer: 1, why: 'Improves maternal resuscitation.' },
    { q: 'ACLS drug doses in pregnancy:', options: ['Halved', 'Standard', 'Doubled', 'Avoided'], answer: 1, why: 'ACLS drug doses are unchanged in pregnancy.' },
    { q: 'IV access in maternal arrest should be:', options: ['Femoral', 'Above the diaphragm', 'Saphenous', 'Any lower limb'], answer: 1, why: 'Avoid IVC compression.' },
    { q: 'A woman on magnesium who arrests should receive:', options: ['More magnesium', 'Calcium (and stop the infusion)', 'Naloxone', 'Adenosine'], answer: 1, why: 'Possible magnesium toxicity.' },
  ],
  sources: [
    { title: 'Jeejeebhoy FM et al. AHA Scientific Statement: Cardiac arrest in pregnancy (2015)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Jeejeebhoy+cardiac+arrest+in+pregnancy+scientific+statement+2015' },
    { title: 'Society for Maternal-Fetal Medicine: Amniotic fluid embolism guideline (2016)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=SMFM+amniotic+fluid+embolism+diagnosis+management+2016' },
  ],
};
