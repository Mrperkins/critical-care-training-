/** FP-C VIII.1–VIII.3: maternal, fetal and neonatal diagnostics; lab values; pharmacologic agents. */
import type { FpcLesson } from '../types';

export const OB_DX: FpcLesson = {
  id: 'fpc-ob-dx', domain: 'obneo', ref: 'VIII.1',
  title: 'Obstetric and fetal assessment: tocodynamometry and fetal heart monitoring',
  summary: 'Assessing the pregnant patient for transport: gestational age and fundal height, labour assessment, contraction monitoring with a tocodynamometer, fetal heart rate patterns, and point-of-care ultrasound.',
  objectives: [
    'Estimate gestational age and assess labour and imminent delivery.',
    'Interpret contraction patterns and fetal heart rate tracings.',
    'Decide whether a pregnant patient is safe to transport.',
  ],
  sections: [
    {
      id: 'assess', title: 'Assessing the pregnant patient', core: true,
      body: [
        'Gestational age guides almost every decision: viability (about 22–24 weeks), steroid and magnesium benefit, the receiving unit and the neonatal team needed. Use dates from an early ultrasound where available. Fundal height in centimetres approximates gestational weeks between about 20 and 36 weeks; at 20 weeks the fundus is at the umbilicus, and at 12 weeks it rises just above the pubic symphysis.',
        'History: gravidity and parity (G3P2 = three pregnancies, two births beyond 20 weeks), prior caesarean (uterine rupture risk), complications in this pregnancy (pre-eclampsia, placenta praevia, diabetes, multiple pregnancy), rupture of membranes (time and colour of fluid — meconium staining), bleeding, contractions (frequency, duration, strength), fetal movements and prenatal care.',
        'Physiological changes alter assessment: heart rate rises by 10–20 beats/min, blood pressure falls in the second trimester, blood volume increases by about 40–50 % (so significant blood loss may be hidden), there is a dilutional anaemia, a respiratory alkalosis (PaCO₂ about 30 mmHg), and from about 20 weeks the uterus compresses the vena cava when supine — tilt left or manually displace the uterus.',
      ],
    },
    {
      id: 'toco', title: 'Contractions and the tocodynamometer', core: true,
      body: [
        'An external tocodynamometer, a pressure transducer strapped over the fundus, records the frequency and duration of contractions; it does not measure their strength (an intrauterine pressure catheter does). Contraction frequency is measured from the start of one contraction to the start of the next. Normal active labour has 3–5 contractions per 10 minutes.',
        'Tachysystole is more than 5 contractions in 10 minutes, averaged over 30 minutes, and can reduce placental blood flow and cause fetal distress — particularly with oxytocin. A hypertonic or tetanic contraction (lasting longer than 2 minutes, or with no relaxation between contractions) is an emergency that may signal abruption or uterine rupture; stop oxytocin and consider a tocolytic per protocol.',
        'Imminent delivery: regular strong contractions every 2–3 minutes, an urge to push, rectal pressure, crowning or visible presenting part. Transport during active second-stage labour risks delivery in a cramped aircraft; it is often safer to deliver at the referring facility with neonatal support than mid-flight.',
      ],
    },
    {
      id: 'fhr', title: 'Fetal heart rate monitoring', core: true,
      body: [
        'Normal fetal heart rate is 110–160 beats/min. Variability (fluctuations of 6–25 beats/min) indicates an intact fetal nervous system and adequate oxygenation; reduced or absent variability may reflect hypoxia, sleep, prematurity or maternal drugs (opioids, magnesium). Accelerations (rises of 15 beats/min for 15 seconds at term) are reassuring.',
        'Decelerations: early decelerations mirror contractions (head compression) and are benign; variable decelerations are abrupt and vary in shape and timing (cord compression) and are concerning if deep, prolonged or recurrent; late decelerations begin after the contraction peak and return after it ends (uteroplacental insufficiency) and are concerning, especially with reduced variability. Prolonged bradycardia below 110 for more than 10 minutes is an emergency.',
        'The three-tier NICHD system classifies tracings: Category I (normal — reassuring), Category II (indeterminate — needs evaluation and intrauterine resuscitation), and Category III (abnormal — absent variability with recurrent late or variable decelerations or bradycardia, or a sinusoidal pattern — needing urgent delivery). Intrauterine resuscitation: left lateral position, IV fluid bolus, oxygen if the mother is hypoxic, stop oxytocin, treat hypotension, and consider a tocolytic.',
      ],
      table: {
        caption: 'Fetal heart rate patterns',
        head: ['Pattern', 'Cause', 'Significance'],
        rows: [['Accelerations', 'Fetal movement', 'Reassuring'], ['Early decelerations', 'Head compression', 'Benign'], ['Variable decelerations', 'Cord compression', 'Concerning if deep, prolonged or recurrent'], ['Late decelerations', 'Uteroplacental insufficiency', 'Concerning; act'], ['Minimal/absent variability', 'Hypoxia, drugs, sleep', 'Concerning if persistent'], ['Sinusoidal pattern', 'Severe fetal anaemia', 'Abnormal — Category III']],
      },
    },
    {
      id: 'case', title: 'Transport case: is it safe to fly?',
      body: ['A 31-week G2P1 with preterm contractions is referred to a tertiary centre 45 minutes away by air. Contractions every 4 minutes, lasting 50 seconds; cervix 4 cm. FHR 145 with moderate variability and occasional early decelerations. She has received the first dose of betamethasone.'],
      example: { case: 'Decide.', steps: [
        'Category I tracing, active preterm labour, but not imminently delivering — transfer to a centre with a NICU is appropriate.',
        'Tocolysis per protocol (e.g. nifedipine) to allow transfer and steroid effect; magnesium for fetal neuroprotection (< 32 weeks) per protocol.',
        'Left lateral tilt; monitor contractions and fetal heart en route; prepare a delivery kit and neonatal resuscitation equipment.',
        'Re-examine before departure — if delivery seems imminent, deliver at the referring hospital with neonatal support.',
      ] },
    },
  ],
  keyPoints: [
    'Fundal height (cm) ≈ gestational weeks from 20 to 36; umbilicus at 20 weeks.',
    'Pregnancy: higher HR and blood volume, respiratory alkalosis, aortocaval compression after 20 weeks.',
    'Tocodynamometer measures frequency and duration, not strength; tachysystole > 5 in 10 min.',
    'FHR 110–160; moderate variability reassuring; late decelerations concerning.',
    'Category III tracing → urgent delivery; intrauterine resuscitation for Category II.',
  ],
  pearls: ['A tetanic contraction may signal abruption or rupture.', 'Deliver at the referring site rather than mid-flight if birth is imminent.'],
  pitfalls: ['Laying a term patient flat.', 'Assuming a normal BP excludes blood loss in pregnancy.'],
  live: [{ id: 'ob-circulation', label: 'Maternal circulation and aortocaval compression' }],
  questions: [
    { q: 'At 20 weeks the fundus is usually at:', options: ['The pubic symphysis', 'The umbilicus', 'The xiphoid', 'Below the pubis'], answer: 1, why: 'Classic landmark.' },
    { q: 'G3P2 means:', options: ['Three births, two pregnancies', 'Three pregnancies, two births beyond 20 weeks', 'Three miscarriages', 'Two caesareans'], answer: 1, why: 'Gravidity and parity.' },
    { q: 'A tocodynamometer measures:', options: ['Contraction strength', 'Contraction frequency and duration', 'Fetal oxygen', 'Cervical dilation'], answer: 1, why: 'External pressure transducer.' },
    { q: 'Tachysystole is defined as:', options: ['> 2 contractions in 10 min', '> 5 contractions in 10 min averaged over 30 min', 'Contractions lasting 30 s', 'Any painful contraction'], answer: 1, why: 'Reduces placental flow.' },
    { q: 'Normal fetal heart rate:', options: ['60–100', '110–160', '160–200', '80–120'], answer: 1, why: 'Baseline range.' },
    { q: 'Late decelerations indicate:', options: ['Head compression', 'Uteroplacental insufficiency', 'Cord compression', 'Fetal movement'], answer: 1, why: 'Concerning pattern.' },
    { q: 'Early decelerations are caused by:', options: ['Head compression — benign', 'Hypoxia', 'Cord prolapse', 'Abruption'], answer: 0, why: 'Mirror contractions.' },
    { q: 'Variable decelerations are caused by:', options: ['Head compression', 'Cord compression', 'Maternal fever', 'Placental insufficiency only'], answer: 1, why: 'Abrupt shape.' },
    { q: 'Moderate variability (6–25 bpm) suggests:', options: ['Fetal hypoxia', 'Intact nervous system and adequate oxygenation', 'Fetal anaemia', 'Cord prolapse'], answer: 1, why: 'Reassuring.' },
    { q: 'A sinusoidal FHR pattern suggests:', options: ['Normal sleep', 'Severe fetal anaemia', 'Maternal fever', 'Head compression'], answer: 1, why: 'Category III.' },
    { q: 'Intrauterine resuscitation includes:', options: ['Supine positioning and oxytocin', 'Left lateral position, fluids, stop oxytocin', 'Immediate tocolytic only', 'Nothing'], answer: 1, why: 'Improve placental flow.' },
    { q: 'Aortocaval compression becomes significant from about:', options: ['8 weeks', '20 weeks', '38 weeks only', 'Never'], answer: 1, why: 'Uterine size.' },
    { q: 'Normal PaCO₂ in late pregnancy is about:', options: ['40 mmHg', '30 mmHg', '50 mmHg', '20 mmHg'], answer: 1, why: 'Respiratory alkalosis.' },
    { q: 'A contraction lasting longer than 2 minutes:', options: ['Is normal', 'Is hypertonic — may signal abruption or rupture', 'Means delivery is complete', 'Is irrelevant'], answer: 1, why: 'A hypertonic contraction is an emergency.' },
    { q: 'If delivery appears imminent before departure:', options: ['Fly quickly', 'Deliver at the referring facility with neonatal support', 'Give oxytocin', 'Lay flat'], answer: 1, why: 'Avoid in-flight delivery.' },
  ],
  sources: [
    { title: 'Macones GA et al. NICHD workshop report on electronic fetal monitoring (2008)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Macones+2008+National+Institute+of+Child+Health+Human+Development+workshop+electronic+fetal+monitoring' },
    { title: 'ACOG Practice Bulletin 106: Intrapartum fetal heart rate monitoring', url: 'https://www.acog.org/clinical/clinical-guidance' },
  ],
};

export const OB_LABS: FpcLesson = {
  id: 'fpc-ob-labs', domain: 'obneo', ref: 'VIII.2',
  title: 'Maternal and neonatal lab values',
  summary: 'How pregnancy changes normal lab values, the labs of pre-eclampsia and HELLP, coagulation and fibrinogen in obstetric haemorrhage, Rh status and Kleihauer–Betke, and key neonatal values.',
  objectives: [
    'Interpret lab values against pregnancy-adjusted norms.',
    'Use labs to recognise pre-eclampsia, HELLP, DIC and obstetric haemorrhage.',
    'Interpret key neonatal values: glucose, blood gases and bilirubin.',
  ],
  sections: [
    {
      id: 'normal', title: 'Normal values change in pregnancy', core: true,
      body: [
        'Plasma volume rises more than red cell mass, so haemoglobin falls (a level above about 10.5–11 g/dL is acceptable). White cells rise (up to about 15 × 10⁹/L, higher in labour). Platelets fall slightly (gestational thrombocytopenia, rarely below 70–80 × 10⁹/L). Pregnancy is hypercoagulable: fibrinogen rises to about 4–6 g/L at term, so a "normal" non-pregnant fibrinogen of 2 g/L is low in late pregnancy and predicts severe postpartum haemorrhage.',
        'Renal blood flow and glomerular filtration rise by about 50 %, so creatinine falls (normal about 35–70 µmol/L, 0.4–0.8 mg/dL); a creatinine of 90 µmol/L (1.0 mg/dL), normal outside pregnancy, may indicate renal impairment. Blood gases show a compensated respiratory alkalosis (PaCO₂ about 28–32 mmHg, bicarbonate about 18–21 mmol/L), so a "normal" PaCO₂ of 40 in a pregnant woman with asthma suggests respiratory failure.',
        'Alkaline phosphatase rises (placental origin); liver transaminases do not. Glucose tolerance worsens in later pregnancy; gestational diabetes is common.',
      ],
      table: {
        caption: 'Pregnancy-adjusted values (approximate, third trimester)',
        head: ['Test', 'Pregnancy', 'Non-pregnant'],
        rows: [['Haemoglobin', '≥ 10.5–11 g/dL', '12–16 g/dL'], ['WBC', 'Up to ~15 × 10⁹/L', '4–11'], ['Fibrinogen', '4–6 g/L', '2–4 g/L'], ['Creatinine', '35–70 µmol/L (0.4–0.8 mg/dL)', '60–110 µmol/L'], ['PaCO₂', '28–32 mmHg', '35–45 mmHg'], ['Bicarbonate', '18–21 mmol/L', '22–26 mmol/L']],
      },
    },
    {
      id: 'disease', title: 'Labs of obstetric emergencies', core: true,
      body: [
        'Pre-eclampsia: proteinuria (protein:creatinine ratio ≥ 0.3 mg/mg, or ≥ 300 mg in 24 hours) or, in its absence, evidence of end-organ involvement — platelets below 100 × 10⁹/L, creatinine above 97 µmol/L (1.1 mg/dL) or doubling, transaminases twice normal, pulmonary oedema or neurological symptoms. HELLP syndrome: haemolysis (raised LDH above about 600 U/L, schistocytes, falling haemoglobin, raised bilirubin), elevated liver enzymes (AST/ALT twice normal) and low platelets (below 100 × 10⁹/L).',
        'Obstetric haemorrhage and DIC: falling haemoglobin lags behind blood loss; fibrinogen below 2 g/L is a key trigger for fibrinogen replacement (cryoprecipitate or concentrate), and viscoelastic testing guides therapy where available. Placental abruption, amniotic fluid embolism, sepsis, retained dead fetus and severe pre-eclampsia can all cause DIC.',
        'Magnesium therapy is monitored clinically (reflexes, respiratory rate, urine output) and with levels: therapeutic about 2–3.5 mmol/L (4–7 mEq/L); loss of reflexes about 5 mmol/L; respiratory depression about 6–7 mmol/L; cardiac arrest above about 12 mmol/L.',
      ],
    },
    {
      id: 'rh', title: 'Rh status, Kleihauer–Betke and neonatal values', core: true,
      body: [
        'Rh-negative mothers exposed to Rh-positive fetal blood (trauma, bleeding, abruption, delivery) can form anti-D antibodies that harm future pregnancies. Anti-D immunoglobulin is given within 72 hours of a potential sensitising event. The Kleihauer–Betke test quantifies fetal cells in maternal blood to guide the anti-D dose; in trauma it also identifies feto-maternal haemorrhage.',
        'Neonatal values: glucose (treated below about 2.6 mmol/L, 47 mg/dL, in many protocols); umbilical cord gases (an arterial pH below 7.0 or base deficit worse than −12 suggests significant intrapartum hypoxia and may qualify for therapeutic hypothermia); haemoglobin is high at birth (14–20 g/dL); and bilirubin rises over the first days (jaundice in the first 24 hours is pathological).',
        'Neonatal sepsis screening includes blood cultures, white cell count and CRP, with risk factors such as prolonged rupture of membranes, maternal fever and group B streptococcus colonisation.',
      ],
    },
    {
      id: 'case', title: 'Transport case: right upper quadrant pain at 34 weeks',
      body: ['A 34-week primigravida with epigastric and right upper quadrant pain, BP 158/104, headache. Labs: Hb 9.8, platelets 62, AST 310, ALT 280, LDH 890, creatinine 92 µmol/L, fibrinogen 2.6 g/L.'],
      example: { case: 'Interpret.', steps: [
        'HELLP syndrome: haemolysis (LDH, falling Hb), elevated enzymes (AST/ALT), low platelets (62).',
        'Creatinine 92 is raised for pregnancy; fibrinogen 2.6 is low for term — watch for DIC and haemorrhage.',
        'Magnesium sulfate for seizure prophylaxis; antihypertensive to SBP < 160 and DBP < 110.',
        'Transfer to a centre able to deliver and manage maternal and neonatal complications; platelets available for delivery.',
      ] },
    },
  ],
  keyPoints: [
    'Pregnancy: lower Hb, creatinine and PaCO₂; higher WBC and fibrinogen.',
    'Fibrinogen < 2 g/L in late pregnancy predicts severe PPH — replace.',
    'Pre-eclampsia: proteinuria or end-organ signs; HELLP: haemolysis, raised enzymes, platelets < 100.',
    'Magnesium: loss of reflexes ~5, respiratory depression ~6–7 mmol/L.',
    'Rh-negative mothers need anti-D within 72 h of a sensitising event.',
  ],
  pearls: ['A PaCO₂ of 40 in a pregnant asthmatic is respiratory failure.', 'Cord arterial pH < 7.0 suggests significant hypoxia.'],
  pitfalls: ['Calling a creatinine of 90 µmol/L normal in pregnancy.', 'Missing low fibrinogen because it is in the non-pregnant range.'],
  live: [{ id: 'ob-gas', label: 'Blood gases in pregnancy' }],
  questions: [
    { q: 'Fibrinogen at term is normally about:', options: ['1 g/L', '4–6 g/L', '10 g/L', '0.5 g/L'], answer: 1, why: 'Hypercoagulable state.' },
    { q: 'Fibrinogen below ___ in obstetric haemorrhage triggers replacement:', options: ['6 g/L', '2 g/L', '0.2 g/L', '10 g/L'], answer: 1, why: 'Predicts severe PPH.' },
    { q: 'Normal PaCO₂ in late pregnancy:', options: ['40–45 mmHg', '28–32 mmHg', '50 mmHg', '20 mmHg'], answer: 1, why: 'Respiratory alkalosis.' },
    { q: 'A creatinine of 90 µmol/L in pregnancy is:', options: ['Low', 'Possibly abnormal', 'Ideal', 'Irrelevant'], answer: 1, why: 'GFR increases in pregnancy.' },
    { q: 'HELLP stands for:', options: ['High BP, Edema, Low urine, Pain', 'Haemolysis, Elevated Liver enzymes, Low Platelets', 'Headache, Eclampsia, Liver, Pulmonary oedema', 'None'], answer: 1, why: 'Definition.' },
    { q: 'Platelet threshold for HELLP:', options: ['< 400', '< 100 × 10⁹/L', '< 10', '< 200'], answer: 1, why: 'Diagnostic criterion.' },
    { q: 'A sign of haemolysis in HELLP:', options: ['Low LDH', 'Raised LDH and schistocytes', 'High platelets', 'Low bilirubin'], answer: 1, why: 'Red cell destruction.' },
    { q: 'Proteinuria in pre-eclampsia is defined as:', options: ['PCR ≥ 0.3 mg/mg or ≥ 300 mg/24 h', 'Any trace', '> 5 g/day only', 'Not required ever'], answer: 0, why: 'Diagnostic threshold.' },
    { q: 'Loss of deep tendon reflexes on magnesium occurs at about:', options: ['1 mmol/L', '5 mmol/L', '0.5 mmol/L', '20 mmol/L'], answer: 1, why: 'Toxicity sign.' },
    { q: 'Anti-D immunoglobulin is given to Rh-negative mothers within:', options: ['1 week', '72 hours of a sensitising event', '1 month', 'Never'], answer: 1, why: 'Prevents sensitisation.' },
    { q: 'The Kleihauer–Betke test measures:', options: ['Fibrinogen', 'Fetal cells in maternal blood', 'Maternal glucose', 'Platelets'], answer: 1, why: 'Guides anti-D dose.' },
    { q: 'Haemoglobin acceptable in late pregnancy:', options: ['≥ 14', '≥ 10.5–11 g/dL', '≥ 7', '≥ 18'], answer: 1, why: 'Dilutional anaemia.' },
    { q: 'Cord arterial pH suggesting significant intrapartum hypoxia:', options: ['< 7.35', '< 7.0', '< 7.5', '< 7.25'], answer: 1, why: 'Hypothermia criteria.' },
    { q: 'Gestational thrombocytopenia platelet counts rarely fall below:', options: ['300', '70–80 × 10⁹/L', '20', '150'], answer: 1, why: 'Lower suggests another cause.' },
    { q: 'A "normal" PaCO₂ of 40 in a pregnant asthmatic suggests:', options: ['Improvement', 'Respiratory failure', 'Normal pregnancy', 'Metabolic alkalosis'], answer: 1, why: 'Expected ~30.' },
  ],
  sources: [
    { title: 'ACOG Practice Bulletin 222: Gestational hypertension and preeclampsia (2020)', url: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2020/06/gestational-hypertension-and-preeclampsia' },
    { title: 'Abbassi-Ghanavati M et al. Pregnancy and laboratory studies: a reference table. Obstet Gynecol (2009)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Abbassi-Ghanavati+pregnancy+laboratory+studies+reference+table+2009' },
  ],
};

export const OB_PHARM: FpcLesson = {
  id: 'fpc-ob-pharm', domain: 'obneo', ref: 'VIII.3',
  title: 'Obstetric and neonatal pharmacology',
  summary: 'Magnesium, antihypertensives, tocolytics, uterotonics, antenatal steroids and tranexamic acid for the mother; and the drugs of neonatal resuscitation and stabilisation.',
  objectives: [
    'Dose and monitor magnesium sulfate and antihypertensives in hypertensive disorders.',
    'Use tocolytics, uterotonics, steroids and TXA appropriately.',
    'Dose neonatal resuscitation and stabilisation drugs.',
  ],
  sections: [
    {
      id: 'mag', title: 'Magnesium and antihypertensives', core: true,
      body: [
        'Magnesium sulfate prevents and treats eclamptic seizures and provides fetal neuroprotection before 32 weeks. Loading dose 4–6 g IV over 15–20 minutes, then 1–2 g/hour. Monitor deep tendon reflexes, respiratory rate (above 12), urine output (above about 25–30 mL/hour) and, where available, levels. Reduce the infusion in renal impairment. Toxicity: loss of reflexes, respiratory depression, cardiac arrest — stop the infusion and give calcium gluconate 1 g (10 mL of 10 %) IV over 3–10 minutes.',
        'Severe hypertension (systolic ≥ 160 or diastolic ≥ 110 sustained for 15 minutes) is an emergency treated within 30–60 minutes to prevent stroke. First-line: IV labetalol (20 mg, then 40, then 80 mg every 10 minutes; avoid in asthma and heart failure), IV hydralazine (5–10 mg every 20 minutes), or oral immediate-release nifedipine (10–20 mg, repeated). Target about 140–150/90–100 — avoid precipitous drops that compromise placental flow.',
        'ACE inhibitors and angiotensin receptor blockers are contraindicated in pregnancy. Nitroprusside is a last resort because of fetal cyanide toxicity.',
      ],
    },
    {
      id: 'labour', title: 'Tocolytics, uterotonics, steroids and TXA', core: true,
      body: [
        'Tocolytics delay preterm labour for up to 48 hours to allow antenatal steroids and transfer: nifedipine (a common first choice; watch for hypotension), indomethacin (before 32 weeks; avoid longer than 48 hours because of ductal constriction and oligohydramnios), and terbutaline 0.25 mg subcutaneously for short-term use (for example tachysystole) — it causes maternal tachycardia and is not used for prolonged tocolysis. Magnesium is not an effective tocolytic but is given for neuroprotection.',
        'Antenatal corticosteroids (betamethasone 12 mg IM, two doses 24 hours apart, or dexamethasone 6 mg IM every 12 hours for four doses) between about 24 and 34 weeks reduce neonatal death, respiratory distress syndrome and intraventricular haemorrhage. Benefit begins within hours, so the first dose should not be delayed for transfer.',
        'Uterotonics for postpartum haemorrhage: oxytocin (10 units IM or IV infusion — avoid rapid IV bolus, which causes hypotension), methylergonovine (0.2 mg IM; contraindicated in hypertension and pre-eclampsia), carboprost (15-methyl PGF2α 250 mcg IM every 15–90 minutes; contraindicated in asthma), and misoprostol (600–1000 mcg orally, sublingually or rectally). Tranexamic acid 1 g IV within 3 hours of birth (repeat once after 30 minutes if bleeding continues) reduced death from bleeding in the WOMAN trial.',
      ],
      table: {
        caption: 'Uterotonics and their contraindications',
        head: ['Drug', 'Dose', 'Avoid in'],
        rows: [['Oxytocin', '10 U IM or infusion', 'Rapid IV bolus (hypotension)'], ['Methylergonovine', '0.2 mg IM', 'Hypertension, pre-eclampsia'], ['Carboprost', '250 mcg IM', 'Asthma'], ['Misoprostol', '600–1000 mcg PO/SL/PR', 'Few (fever, shivering)'], ['Tranexamic acid', '1 g IV within 3 h', 'Beyond 3 h']],
      },
    },
    {
      id: 'neo', title: 'Neonatal resuscitation and stabilisation drugs', core: true,
      body: [
        'Ventilation is the most important intervention in neonatal resuscitation; drugs are rarely needed. Epinephrine for a heart rate below 60 despite 30 seconds of effective ventilation and 60 seconds of coordinated compressions: 0.02 mg/kg IV/IO (0.2 mL/kg of 0.1 mg/mL; range 0.01–0.03 mg/kg), repeated every 3–5 minutes; endotracheal 0.1 mg/kg while access is obtained. Volume: 10 mL/kg of normal saline or O-negative blood for suspected hypovolaemia (pale, poor perfusion, history of blood loss).',
        'Glucose: 10 % dextrose 2 mL/kg (0.2 g/kg) for hypoglycaemia, followed by an infusion of about 4–6 mg/kg/min (60–80 mL/kg/day of 10 % dextrose). Surfactant is given via the endotracheal tube for preterm respiratory distress syndrome. Prostaglandin E1 (alprostadil) 0.01–0.05 mcg/kg/min keeps the ductus arteriosus open in duct-dependent congenital heart disease; it causes apnoea (prepare to ventilate), fever and hypotension.',
        'Antibiotics for suspected neonatal sepsis: ampicillin plus gentamicin (or cefotaxime/ceftazidime per protocol). Naloxone is not recommended in the delivery room for respiratory depression; support ventilation instead. Vitamin K 1 mg IM is given after birth.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the magnesium infusion',
      body: ['A 36-week patient with severe pre-eclampsia is on magnesium 2 g/h. One hour into a ground-to-air transfer: reflexes absent, respiratory rate 9, SpO₂ 91 %, urine output 10 mL over the past hour.'],
      example: { case: 'Act.', steps: [
        'Magnesium toxicity (absent reflexes, respiratory depression), likely worsened by oliguria.',
        'Stop the infusion; support ventilation (bag-mask if needed); oxygen.',
        'Calcium gluconate 1 g IV (10 mL of 10 %) over 3–10 minutes.',
        'Check level if possible; monitor fetal heart; reassess BP and plan with the receiving team before restarting at a lower rate.',
      ] },
    },
  ],
  keyPoints: [
    'Magnesium 4–6 g load then 1–2 g/h; monitor reflexes, RR, urine; calcium gluconate for toxicity.',
    'Treat BP ≥ 160/110 within 30–60 min: labetalol, hydralazine or oral nifedipine.',
    'Antenatal steroids 24–34 weeks — don\'t delay the first dose.',
    'Uterotonics: oxytocin, methylergonovine (not in hypertension), carboprost (not in asthma), misoprostol; TXA within 3 h.',
    'Neonatal epinephrine 0.02 mg/kg IV/IO; ventilation first; PGE1 causes apnoea.',
  ],
  pearls: ['Rapid IV oxytocin bolus causes hypotension.', 'Prepare to ventilate when starting prostaglandin.'],
  pitfalls: ['Methylergonovine in a hypertensive patient.', 'Carboprost in an asthmatic.'],
  live: [{ id: 'moa-labetalol', label: 'Labetalol: mechanism' }, { id: 'moa-txa', label: 'Tranexamic acid: mechanism' }, { id: 'moa-calcium', label: 'Calcium: mechanism' }],
  questions: [
    { q: 'Magnesium sulfate loading dose in pre-eclampsia:', options: ['1 g', '4–6 g IV over 15–20 min', '20 g', '0.5 g'], answer: 1, why: 'Then 1–2 g/h.' },
    { q: 'Antidote for magnesium toxicity:', options: ['Naloxone', 'Calcium gluconate 1 g IV', 'Flumazenil', 'Atropine'], answer: 1, why: 'Antagonises magnesium.' },
    { q: 'Severe hypertension in pregnancy requiring urgent treatment:', options: ['≥ 140/90', '≥ 160/110 sustained', '≥ 130/80', '≥ 200/120 only'], answer: 1, why: 'Stroke risk.' },
    { q: 'Labetalol first IV dose in pregnancy:', options: ['2 mg', '20 mg', '200 mg', '80 mg'], answer: 1, why: 'Escalate 40, 80 mg.' },
    { q: 'Contraindicated antihypertensive class in pregnancy:', options: ['Calcium channel blockers', 'ACE inhibitors', 'Beta-blockers', 'Hydralazine'], answer: 1, why: 'Fetal toxicity.' },
    { q: 'Antenatal corticosteroids are given between about:', options: ['12–20 weeks', '24–34 weeks', '38–42 weeks', 'Any time'], answer: 1, why: 'Lung maturity benefit.' },
    { q: 'Methylergonovine is contraindicated in:', options: ['Asthma', 'Hypertension and pre-eclampsia', 'Diabetes', 'Anaemia'], answer: 1, why: 'Vasoconstriction.' },
    { q: 'Carboprost is contraindicated in:', options: ['Hypertension', 'Asthma', 'Diabetes', 'Obesity'], answer: 1, why: 'Bronchospasm.' },
    { q: 'TXA for postpartum haemorrhage:', options: ['1 g IV within 3 h of birth', '10 g', 'After 24 h', 'Oral only'], answer: 0, why: 'WOMAN trial.' },
    { q: 'Rapid IV bolus of oxytocin can cause:', options: ['Hypertension', 'Hypotension', 'Seizures', 'Bradycardia only'], answer: 1, why: 'Vasodilation.' },
    { q: 'Neonatal epinephrine IV/IO dose:', options: ['0.1 mg/kg', '0.02 mg/kg (range 0.01–0.03)', '1 mg', '0.001 mg/kg'], answer: 1, why: 'NRP dosing.' },
    { q: 'Neonatal epinephrine is indicated when HR < 60 despite:', options: ['Drying', '30 s effective ventilation and 60 s of compressions', 'Oxygen only', 'Suction'], answer: 1, why: 'Ventilation first.' },
    { q: 'Prostaglandin E1 in neonates may cause:', options: ['Hypertension', 'Apnoea', 'Hypothermia only', 'Seizures'], answer: 1, why: 'Prepare to ventilate.' },
    { q: 'Indomethacin as a tocolytic is limited to 48 hours because of:', options: ['Maternal hypertension', 'Ductal constriction and oligohydramnios', 'Hypoglycaemia', 'Seizures'], answer: 1, why: 'Fetal effects.' },
    { q: 'Magnesium before 32 weeks also provides:', options: ['Tocolysis', 'Fetal neuroprotection', 'Lung maturity', 'Analgesia'], answer: 1, why: 'Reduces cerebral palsy.' },
  ],
  sources: [
    { title: 'WOMAN trial collaborators. TXA for postpartum haemorrhage. Lancet (2017)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=WOMAN+trial+tranexamic+acid+postpartum+haemorrhage+Lancet+2017' },
    { title: 'ACOG Committee Opinion 767: Emergent therapy for acute-onset severe hypertension in pregnancy', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { title: 'AAP/AHA Neonatal Resuscitation guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation' },
  ],
};
