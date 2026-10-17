/** FP-C VIII.4–VIII.6: monitoring equipment; complications of delivery; multiple birth. */
import type { FpcLesson } from '../types';

export const OB_MONITOR: FpcLesson = {
  id: 'fpc-ob-monitor', domain: 'obneo', ref: 'VIII.4',
  title: 'Maternal, fetal and neonatal monitoring equipment',
  summary: 'Monitoring the pregnant patient and fetus in transport, the transport incubator and its systems, neonatal monitoring (pre- and post-ductal saturations, temperature, capnography), and the effects of altitude and motion.',
  objectives: [
    'Choose maternal and fetal monitoring appropriate to transport.',
    'Describe the transport incubator\'s systems and checks.',
    'Monitor neonates effectively, including pre- and post-ductal saturations.',
  ],
  sections: [
    {
      id: 'maternal', title: 'Maternal and fetal monitoring in transport', core: true,
      body: [
        'Monitor the mother as any critical patient: ECG, blood pressure (cuff sized for the arm; in pre-eclampsia, frequent measurements or an arterial line), SpO₂, respiratory rate, temperature, urine output with a catheter, and capnography if sedated or intubated. Position in left lateral tilt to avoid aortocaval compression, which otherwise reduces cardiac output and placental perfusion.',
        'Continuous electronic fetal monitoring in flight is limited by noise, vibration, space and the movement of the transducers; many programmes use intermittent auscultation with a handheld Doppler (fetal heart rate before departure, at intervals during transport and on arrival) and a tocodynamometer or manual palpation for contractions. Some transport monitors record both. Document the FHR baseline and any decelerations, and palpate contractions directly when in doubt.',
        'Point-of-care ultrasound confirms fetal cardiac activity, presentation (cephalic or breech), placental location (praevia) and free fluid. It is useful before departure to anticipate breech delivery or confirm fetal demise.',
      ],
    },
    {
      id: 'isolette', title: 'The transport incubator', core: true,
      body: [
        'A transport incubator (isolette) provides a thermally controlled, enclosed environment with a neonatal ventilator, oxygen and air supplies, suction, monitoring (ECG, SpO₂, temperature, non-invasive BP, often capnography), infusion pumps and battery power. It is mounted on a specialised stretcher and secured to the aircraft; together it is heavy and must be included in weight and balance.',
        'Before each transport: pre-warm the incubator (to about 34–37 °C depending on the infant\'s size and gestation), check battery charge and aircraft power compatibility, gas supplies (and calculate duration), ventilator function, alarms, suction and the neonatal airway and resuscitation kit. Access ports allow care without opening the incubator, which loses heat quickly.',
        'Servo-control mode adjusts heater output to the baby\'s skin temperature probe; air mode controls the air temperature. Secure the infant with internal straps or a nest, and keep lines and tubes visible and secured so they do not kink during loading.',
      ],
    },
    {
      id: 'neo', title: 'Neonatal monitoring', core: true,
      body: [
        'Pre-ductal saturation (right hand) reflects blood reaching the brain; post-ductal (either foot) reflects blood past the ductus arteriosus. A difference of more than about 3 % (post lower than pre) suggests right-to-left shunting across the ductus — persistent pulmonary hypertension of the newborn or duct-dependent systemic circulation (for example coarctation or hypoplastic left heart).',
        'Target pre-ductal SpO₂ in the first minutes of life rises gradually (about 60–65 % at 1 minute to 85–95 % by 10 minutes); afterwards most neonates are kept at about 90–95 %, with lower targets in some cyanotic congenital heart disease per cardiology advice. Avoid hyperoxia in preterm infants (retinopathy, lung injury).',
        'Temperature: aim for an axillary temperature of 36.5–37.5 °C; check every 15–30 minutes in transport. Capnography (mainstream sensors are bulky; low-dead-space adaptors exist) confirms tube placement and helps titrate ventilation. Blood glucose is checked on departure and regularly in transport. Transcutaneous CO₂ monitoring is available in some services.',
      ],
      table: {
        caption: 'Neonatal targets in transport',
        head: ['Parameter', 'Target'],
        rows: [['Axillary temperature', '36.5–37.5 °C'], ['Pre-ductal SpO₂ (after transition)', '~90–95 % (per condition)'], ['Pre/post-ductal difference', '< 3 % normal'], ['Glucose', '> 2.6 mmol/L (47 mg/dL)'], ['Heart rate', '100–180/min'], ['Respiratory rate', '30–60/min']],
      },
    },
    {
      id: 'case', title: 'Transport case: the saturation gap',
      body: ['A term newborn with meconium aspiration is intubated. Right hand SpO₂ 92 %, foot 78 % on FiO₂ 1.0. BP 50/28 (mean 35). The infant becomes agitated with handling and saturations drop further.'],
      example: { case: 'Interpret.', steps: [
        'A 14 % pre/post-ductal gap = right-to-left ductal shunting from persistent pulmonary hypertension of the newborn (PPHN).',
        'Minimise handling and stimulation; sedate and analgese; avoid hypothermia, acidosis and hypoxia (all raise PVR).',
        'Support systemic BP above pulmonary pressure (fluids, inotropes per protocol); optimise ventilation.',
        'Transfer to a centre with inhaled nitric oxide and ECMO; inhaled nitric oxide may be started by the transport team where available.',
      ] },
    },
  ],
  keyPoints: [
    'Left lateral tilt; standard critical monitoring for the mother; catheter for urine output.',
    'Intermittent Doppler FHR and palpated contractions are common in flight.',
    'Pre-warm and check the transport incubator; include its weight in calculations.',
    'Pre-ductal (right hand) vs post-ductal (foot): difference > 3 % suggests ductal shunting.',
    'Neonatal temperature 36.5–37.5 °C; check glucose; avoid hyperoxia in preterm infants.',
  ],
  pearls: ['Opening the incubator loses heat fast — use the ports.', 'Agitation worsens PPHN — minimise handling.'],
  pitfalls: ['A cold incubator at departure.', 'Supine positioning of a term pregnant patient.'],
  live: [{ id: 'neo-transition', label: 'Neonatal transition: from fetal to newborn circulation' }],
  questions: [
    { q: 'The pregnant patient is positioned with:', options: ['Supine, flat', 'Left lateral tilt', 'Trendelenburg', 'Prone'], answer: 1, why: 'Avoid aortocaval compression.' },
    { q: 'Fetal heart monitoring in flight is often:', options: ['Continuous internal scalp electrode', 'Intermittent handheld Doppler', 'Not possible', 'Only after landing'], answer: 1, why: 'Noise and vibration.' },
    { q: 'Pre-ductal saturation is measured on:', options: ['Left hand', 'Right hand', 'Left foot', 'Either ear'], answer: 1, why: 'Before the ductus.' },
    { q: 'A post-ductal SpO₂ lower than pre-ductal by > 3 % suggests:', options: ['Normal transition', 'Right-to-left ductal shunting', 'Probe error only', 'Anaemia'], answer: 1, why: 'PPHN or duct-dependent lesion.' },
    { q: 'Target neonatal axillary temperature:', options: ['35–36 °C', '36.5–37.5 °C', '38–39 °C', '34 °C'], answer: 1, why: 'Normothermia.' },
    { q: 'Servo-control mode of an incubator adjusts heat to:', options: ['Air temperature', 'The infant\'s skin temperature probe', 'Cabin temperature', 'Time of day'], answer: 1, why: 'Feedback control.' },
    { q: 'Before departure, the incubator should be:', options: ['Cold', 'Pre-warmed, with batteries and gases checked', 'Opened fully', 'Disconnected'], answer: 1, why: 'Prevent hypothermia.' },
    { q: 'Pre-ductal SpO₂ at 10 minutes of life is normally about:', options: ['60 %', '85–95 %', '100 %', '50 %'], answer: 1, why: 'Gradual rise after birth.' },
    { q: 'Hyperoxia in preterm infants risks:', options: ['Nothing', 'Retinopathy and lung injury', 'Hypoglycaemia', 'Jaundice'], answer: 1, why: 'Oxygen toxicity.' },
    { q: 'PPHN is worsened by:', options: ['Warmth', 'Hypothermia, acidosis, hypoxia and agitation', 'Sedation', 'Normal pH'], answer: 1, why: 'Each of these raises pulmonary vascular resistance.' },
    { q: 'Ultrasound before maternal transport can show:', options: ['Fetal presentation and placental location', 'Cervical dilation only', 'Maternal lung function', 'Nothing useful'], answer: 0, why: 'Anticipate breech or praevia.' },
    { q: 'Transport incubators must be included in:', options: ['Billing only', 'Weight and balance', 'Nothing', 'Patient chart only'], answer: 1, why: 'Heavy equipment.' },
    { q: 'Opening the incubator frequently causes:', options: ['Better care', 'Rapid heat loss', 'Higher humidity', 'No change'], answer: 1, why: 'Use access ports.' },
    { q: 'Neonatal glucose should be kept above about:', options: ['1.0', '2.6 mmol/L', '5.5', '10'], answer: 1, why: 'Common threshold.' },
    { q: 'Inhaled nitric oxide treats:', options: ['RDS only', 'PPHN', 'Hypoglycaemia', 'Jaundice'], answer: 1, why: 'Pulmonary vasodilator.' },
  ],
  sources: [
    { title: 'AAP/AHA Neonatal Resuscitation guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation' },
    { title: 'S.T.A.B.L.E. Program (post-resuscitation neonatal stabilisation)', url: 'https://stableprogram.org/' },
  ],
};

export const DELIVERY_COMPLICATIONS: FpcLesson = {
  id: 'fpc-delivery-complications', domain: 'obneo', ref: 'VIII.5',
  title: 'Complications of delivery: cord prolapse, abruption, praevia, dystocia and haemorrhage',
  summary: 'Recognising and managing umbilical cord prolapse, placental abruption, placenta praevia, uterine rupture, shoulder dystocia, breech delivery and postpartum haemorrhage — before and during transport.',
  objectives: [
    'Manage umbilical cord prolapse and preparing for emergency delivery.',
    'Distinguish placental abruption from placenta praevia and manage antepartum haemorrhage.',
    'Manage shoulder dystocia, breech delivery and postpartum haemorrhage.',
  ],
  sections: [
    {
      id: 'cord', title: 'Umbilical cord prolapse', core: true,
      body: [
        'Cord prolapse — the cord descending through the cervix ahead of the presenting part after the membranes rupture — compresses the cord and cuts off fetal blood flow. Risk factors: malpresentation (breech, transverse), prematurity, polyhydramnios, multiple pregnancy and a high presenting part at rupture. Suspect it with sudden fetal bradycardia or variable decelerations after rupture, or when the cord is seen or felt.',
        'Management aims to relieve pressure on the cord until caesarean delivery: call ahead, elevate the presenting part off the cord with a gloved hand in the vagina (and keep it there throughout transport), place the mother in knee–chest or steep Trendelenburg with left tilt, or fill the bladder with 500–750 mL of saline via a catheter to lift the presenting part. Minimise handling of the cord (to avoid vasospasm); cover an exposed cord with warm, moist dressings. Tocolysis (terbutaline) may reduce contractions.',
        'If delivery is imminent and vaginal birth can be achieved quickly, deliver; otherwise, rapid transport to a unit able to perform immediate caesarean section.',
      ],
    },
    {
      id: 'bleeding', title: 'Antepartum haemorrhage and uterine rupture', core: true,
      body: [
        'Placental abruption is premature separation of a normally sited placenta: painful bleeding (although bleeding may be concealed), a tender, firm or "woody" uterus, frequent or tetanic contractions, fetal distress and maternal shock out of proportion to visible blood loss. Risk factors: hypertension and pre-eclampsia, trauma, cocaine, smoking and previous abruption. It causes DIC — check fibrinogen and give products early. Ultrasound often misses abruption; diagnosis is clinical.',
        'Placenta praevia is a placenta covering or near the cervix: painless, bright red bleeding, a soft non-tender uterus, often in the third trimester. Never perform a digital vaginal examination when praevia is possible — it can provoke massive haemorrhage. Resuscitate with blood, give Rh immune globulin if Rh-negative, and transfer to a centre able to perform caesarean section.',
        'Uterine rupture — most often in women with a previous caesarean scar during labour — presents with sudden abdominal pain, loss of fetal station, abnormal fetal heart rate (often bradycardia), cessation of contractions and maternal shock. It requires immediate laparotomy.',
      ],
      table: {
        caption: 'Abruption vs praevia',
        head: ['', 'Placental abruption', 'Placenta praevia'],
        rows: [['Pain', 'Painful', 'Painless'], ['Uterus', 'Tender, firm, "woody"', 'Soft, non-tender'], ['Bleeding', 'Dark; may be concealed', 'Bright red, visible'], ['Shock', 'Out of proportion to visible loss', 'Proportional'], ['Fetal distress', 'Common', 'Less common initially'], ['Vaginal exam', 'Cautious', 'Never digital']],
      },
    },
    {
      id: 'delivery', title: 'Dystocia, breech and postpartum haemorrhage', core: true,
      body: [
        'Shoulder dystocia: the head delivers but retracts against the perineum ("turtle sign") and the shoulders do not follow with gentle traction. Call for help, avoid fundal pressure and excessive traction, and use the McRoberts manoeuvre (hyperflex the mother\'s hips onto her abdomen) with suprapubic pressure; then internal rotational manoeuvres, delivery of the posterior arm, or moving the mother to all fours. HELPERR is a memory aid.',
        'Breech delivery: allow the baby to deliver spontaneously to the umbilicus ("hands off the breech"), support the body, and deliver the head with flexion (the Mauriceau manoeuvre: fingers on the maxilla, flex the head, suprapubic pressure). Do not pull. A head that does not deliver within a few minutes is an emergency.',
        'Postpartum haemorrhage (blood loss of 1000 mL or more, or any bleeding with signs of hypovolaemia) is a leading cause of maternal death. Causes — the four Ts: Tone (uterine atony, about 70 %), Trauma (lacerations, inversion, rupture), Tissue (retained placenta or products) and Thrombin (coagulopathy). Treat with fundal massage, uterotonics (oxytocin first), bimanual compression, TXA within 3 hours, blood products (with early fibrinogen) and rapid transfer for definitive control (balloon tamponade, embolisation, surgery).',
      ],
    },
    {
      id: 'case', title: 'Transport case: the cord in the air',
      body: ['A 33-week patient in transport has a sudden gush of fluid. The fetal heart rate falls from 145 to 80 and stays there. On inspection, a loop of cord is visible at the introitus. Landing is 20 minutes away.'],
      example: { case: 'Act.', steps: [
        'Cord prolapse: insert a gloved hand to elevate the presenting part off the cord and keep it there.',
        'Position: knee–chest if possible, or steep left-tilted Trendelenburg; consider filling the bladder via catheter.',
        'Cover the cord with warm, moist dressings; avoid handling it.',
        'Oxygen if hypoxic, IV access, tocolysis per protocol; radio ahead for immediate caesarean on arrival.',
      ] },
    },
  ],
  keyPoints: [
    'Cord prolapse: elevate the presenting part manually, knee–chest or Trendelenburg, fill the bladder, emergency caesarean.',
    'Abruption: painful, tender uterus, shock out of proportion, DIC risk.',
    'Praevia: painless bright red bleeding — no digital vaginal exam.',
    'Shoulder dystocia: McRoberts + suprapubic pressure; no fundal pressure.',
    'PPH four Ts: tone, trauma, tissue, thrombin; oxytocin, massage, TXA, fibrinogen.',
  ],
  pearls: ['"Hands off the breech."', 'Uterine rupture: loss of station, bradycardia, contractions stop.'],
  pitfalls: ['Digital examination in praevia.', 'Pulling on a breech or applying fundal pressure in dystocia.'],
  live: [{ id: 'ob-circulation', label: 'Maternal circulation and haemorrhage' }, { id: 'moa-txa', label: 'Tranexamic acid: mechanism' }],
  questions: [
    { q: 'First action in umbilical cord prolapse:', options: ['Push the cord back', 'Elevate the presenting part off the cord manually', 'Pull the cord', 'Lie supine'], answer: 1, why: 'Relieve compression.' },
    { q: 'Positions used in cord prolapse:', options: ['Sitting upright', 'Knee–chest or steep Trendelenburg', 'Supine flat', 'Standing'], answer: 1, why: 'Gravity lifts presenting part.' },
    { q: 'Filling the bladder in cord prolapse:', options: ['Is contraindicated', 'Lifts the presenting part off the cord', 'Speeds delivery', 'Treats infection'], answer: 1, why: '500–750 mL saline.' },
    { q: 'Painful bleeding with a firm, tender uterus suggests:', options: ['Placenta praevia', 'Placental abruption', 'Cervical polyp', 'Normal labour'], answer: 1, why: 'Classic abruption.' },
    { q: 'Painless bright red bleeding in the third trimester suggests:', options: ['Abruption', 'Placenta praevia', 'Uterine rupture', 'Labour'], answer: 1, why: 'Classic praevia.' },
    { q: 'In suspected placenta praevia, avoid:', options: ['IV access', 'Digital vaginal examination', 'Ultrasound', 'Oxygen'], answer: 1, why: 'Massive haemorrhage risk.' },
    { q: 'Abruption is commonly complicated by:', options: ['Hypercoagulability', 'DIC', 'Hyperglycaemia', 'Hypertension resolution'], answer: 1, why: 'Thromboplastin release.' },
    { q: 'Uterine rupture is most associated with:', options: ['First pregnancy', 'Previous caesarean scar in labour', 'Breech', 'Twins'], answer: 1, why: 'Scar dehiscence.' },
    { q: 'First manoeuvre for shoulder dystocia:', options: ['Fundal pressure', 'McRoberts with suprapubic pressure', 'Strong traction', 'Caesarean'], answer: 1, why: 'Widens pelvic outlet.' },
    { q: 'In shoulder dystocia, avoid:', options: ['Calling for help', 'Fundal pressure', 'McRoberts', 'Suprapubic pressure'], answer: 1, why: 'Worsens impaction.' },
    { q: 'Breech delivery principle:', options: ['Pull on the legs', '"Hands off the breech" until the umbilicus', 'Push the baby back', 'Rotate forcefully'], answer: 1, why: 'Allow spontaneous descent.' },
    { q: 'The most common cause of postpartum haemorrhage:', options: ['Trauma', 'Uterine atony (tone)', 'Coagulopathy', 'Retained tissue'], answer: 1, why: 'About 70 %.' },
    { q: 'PPH is defined as blood loss of:', options: ['≥ 250 mL', '≥ 1000 mL or bleeding with hypovolaemia', '≥ 5000 mL', 'Any bleeding'], answer: 1, why: 'Current definition.' },
    { q: 'First-line uterotonic for PPH:', options: ['Carboprost', 'Oxytocin', 'Methylergonovine', 'Misoprostol'], answer: 1, why: 'Standard first-line.' },
    { q: 'An exposed prolapsed cord should be:', options: ['Handled frequently', 'Covered with warm, moist dressings and minimally handled', 'Cut', 'Pushed back'], answer: 1, why: 'Prevent vasospasm.' },
  ],
  sources: [
    { title: 'RCOG Green-top Guideline 50: Umbilical cord prolapse', url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/umbilical-cord-prolapse-green-top-guideline-no-50/' },
    { title: 'ACOG Practice Bulletin 183: Postpartum hemorrhage', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { title: 'RCOG Green-top Guideline 42: Shoulder dystocia', url: 'https://www.rcog.org.uk/guidance/browse-all-guidance/green-top-guidelines/shoulder-dystocia-green-top-guideline-no-42/' },
  ],
};

export const MULTIPLE_BIRTH: FpcLesson = {
  id: 'fpc-multiple-birth', domain: 'obneo', ref: 'VIII.6',
  title: 'Multiple pregnancy and birth',
  summary: 'Types of twin pregnancy and their risks, preterm labour and transport decisions, preparing for multiple neonates, delivery of the second twin, and postpartum haemorrhage after multiple birth.',
  objectives: [
    'Describe twin types (chorionicity) and their specific complications.',
    'Plan transport and resources for multiple pregnancy and multiple neonates.',
    'Anticipate complications of delivering twins, including the second twin and PPH.',
  ],
  sections: [
    {
      id: 'types', title: 'Types of twins and their risks', core: true,
      body: [
        'Dizygotic (fraternal) twins come from two eggs and always have two placentas and two amniotic sacs (dichorionic diamniotic). Monozygotic (identical) twins come from one egg that splits: depending on timing, they may be dichorionic diamniotic, monochorionic diamniotic (one shared placenta, two sacs — most common for identical twins) or monochorionic monoamniotic (one placenta, one sac — highest risk, including cord entanglement).',
        'Monochorionic twins share placental circulation, which can be unbalanced: twin-to-twin transfusion syndrome (TTTS) — one twin becomes the donor (anaemic, growth-restricted, oligohydramnios) and the other the recipient (polycythaemic, fluid-overloaded, polyhydramnios, heart failure). Multiple pregnancy increases risks of preterm labour (more than half of twins are born before 37 weeks), pre-eclampsia, gestational diabetes, anaemia, placenta praevia, malpresentation, cord prolapse and postpartum haemorrhage.',
        'Triplets and higher-order multiples carry greater risks still; nearly all are born preterm and many need neonatal intensive care.',
      ],
    },
    {
      id: 'transport', title: 'Transport planning', core: true,
      body: [
        'A woman in preterm labour with a multiple pregnancy is usually transferred before delivery to a centre with enough NICU capacity for all the babies — in utero transfer is safer than transferring several sick preterm neonates afterwards. Confirm that the receiving unit has cots for every baby. Give antenatal steroids, magnesium for neuroprotection (< 32 weeks) and tocolysis per protocol.',
        'If delivery is imminent, it is safer to deliver at the referring hospital with neonatal teams present than in an aircraft. A transport team may be requested to retrieve multiple neonates afterwards; each critically ill neonate typically needs its own team and incubator, which may mean several teams or sequential transfers.',
        'Prepare for each baby separately: resuscitation equipment, warming, staff and identification. Label babies and cords (Twin A, Twin B) and record the time of each birth.',
      ],
    },
    {
      id: 'delivery', title: 'Delivering twins', core: true,
      body: [
        'The first twin is delivered as a singleton (the presenting twin is usually cephalic). After the first birth, clamp and cut the cord (labelled), and check the lie and heart rate of the second twin. Contractions often pause; the second twin may change position, and its cord may prolapse. The interval between births is ideally short (often within 30 minutes), as the risk of hypoxia for the second twin rises with time and placental separation.',
        'If the second twin is cephalic or breech and descending, allow delivery with maternal effort; a transverse second twin needs obstetric manoeuvres (external or internal version) or caesarean section — another reason to deliver at a hospital where possible.',
        'After delivery, the over-distended uterus contracts poorly: postpartum haemorrhage is more common. Give oxytocin after the last baby is delivered (not before — it could trap the second twin), massage the fundus, and be ready for the PPH bundle.',
      ],
      table: {
        caption: 'Twin types',
        head: ['Type', 'Placentas', 'Sacs', 'Key risk'],
        rows: [['Dichorionic diamniotic', '2', '2', 'Preterm labour, growth restriction'], ['Monochorionic diamniotic', '1', '2', 'Twin-to-twin transfusion syndrome'], ['Monochorionic monoamniotic', '1', '1', 'Cord entanglement, TTTS']],
      },
    },
    {
      id: 'case', title: 'Transport case: twins at 29 weeks',
      body: ['A 29-week monochorionic diamniotic twin pregnancy in preterm labour at a rural hospital: cervix 5 cm, contractions every 3 minutes, both fetal hearts reassuring. The nearest NICU with two available cots is 60 minutes by air.'],
      example: { case: 'Plan.', steps: [
        'Confirm two NICU cots and an obstetric team at the receiving centre.',
        'Steroids (first dose now), magnesium for neuroprotection, tocolysis per protocol.',
        'Re-examine before departure; if delivery is imminent, deliver locally and request neonatal retrieval teams for both babies.',
        'Carry two sets of neonatal resuscitation equipment and warming; plan for PPH (oxytocin after the second baby).',
      ] },
    },
  ],
  keyPoints: [
    'Monochorionic twins share a placenta — risk of twin-to-twin transfusion syndrome.',
    'Multiple pregnancy: preterm labour, pre-eclampsia, malpresentation, cord prolapse, PPH.',
    'In utero transfer to a unit with cots for every baby.',
    'Second twin: check lie and heart rate after the first birth; short interval.',
    'Oxytocin after the last baby; expect PPH.',
  ],
  pearls: ['Label cords and babies; record each birth time.', 'Each sick neonate needs its own team and incubator.'],
  pitfalls: ['Oxytocin before the second twin is delivered.', 'Transferring to a NICU without enough cots.'],
  live: [{ id: 'neo-transition', label: 'Neonatal transition' }],
  questions: [
    { q: 'Dizygotic twins always have:', options: ['One placenta', 'Two placentas and two sacs', 'One sac', 'Shared circulation'], answer: 1, why: 'Two eggs give two placentas and sacs.' },
    { q: 'Twin-to-twin transfusion syndrome occurs in:', options: ['Dichorionic twins', 'Monochorionic twins', 'All twins', 'Singletons'], answer: 1, why: 'Shared placental vessels.' },
    { q: 'In TTTS, the recipient twin is:', options: ['Anaemic and small', 'Polycythaemic and fluid-overloaded', 'Normal', 'Dehydrated'], answer: 1, why: 'Receives excess blood.' },
    { q: 'Highest-risk twin type:', options: ['Dichorionic diamniotic', 'Monochorionic monoamniotic', 'Dizygotic', 'Fraternal'], answer: 1, why: 'Cord entanglement.' },
    { q: 'Proportion of twins born preterm (< 37 weeks):', options: ['< 5 %', 'More than half', '10 %', 'All'], answer: 1, why: 'High preterm rate.' },
    { q: 'Preferred approach for preterm twins:', options: ['Deliver anywhere and transfer babies', 'In utero transfer to a unit with enough NICU cots', 'Delay delivery indefinitely', 'Home birth'], answer: 1, why: 'Safer than neonatal transport.' },
    { q: 'After the first twin is born, you should:', options: ['Give oxytocin immediately', 'Check the second twin\'s lie and heart rate', 'Leave', 'Clamp nothing'], answer: 1, why: 'Prepare for second delivery.' },
    { q: 'Oxytocin in twin delivery is given:', options: ['Before the first twin', 'After the last baby is delivered', 'Between twins routinely', 'Never'], answer: 1, why: 'Avoid trapping second twin.' },
    { q: 'Postpartum haemorrhage after twins is:', options: ['Less common', 'More common (overdistended uterus)', 'Impossible', 'Unchanged'], answer: 1, why: 'An overdistended uterus contracts poorly (atony).' },
    { q: 'A transverse second twin needs:', options: ['Maternal pushing only', 'Obstetric manoeuvres or caesarean', 'Oxytocin', 'Nothing'], answer: 1, why: 'Malpresentation.' },
    { q: 'Each critically ill neonate typically needs:', options: ['A shared incubator', 'Its own team and incubator', 'No monitoring', 'Only a parent'], answer: 1, why: 'Each sick neonate needs dedicated care.' },
    { q: 'Multiple pregnancy increases the risk of:', options: ['Post-term pregnancy', 'Pre-eclampsia and cord prolapse', 'Hypotension only', 'Nothing'], answer: 1, why: 'Known associations.' },
    { q: 'Monozygotic twins most commonly are:', options: ['Dichorionic', 'Monochorionic diamniotic', 'Monoamniotic', 'Conjoined'], answer: 1, why: 'Most common identical type.' },
    { q: 'Cords should be labelled to:', options: ['Decorate', 'Identify each twin\'s placenta and samples', 'Count time', 'Not necessary'], answer: 1, why: 'Identification.' },
    { q: 'If twin delivery is imminent at a rural hospital:', options: ['Fly immediately', 'Deliver locally and request neonatal retrieval', 'Wait for contractions to stop', 'Give oxytocin'], answer: 1, why: 'Avoid in-flight delivery.' },
  ],
  sources: [
    { title: 'ACOG Practice Bulletin 231: Multifetal gestations', url: 'https://www.acog.org/clinical/clinical-guidance' },
    { title: 'NICE guideline NG137: Twin and triplet pregnancy', url: 'https://www.nice.org.uk/guidance/ng137' },
  ],
};
