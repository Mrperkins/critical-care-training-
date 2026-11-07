/** FP-C IX.4–IX.6: paediatric monitoring; airway disease (croup, RSV); non-accidental trauma. */
import type { FpcLesson } from '../types';

export const PEDS_MONITOR: FpcLesson = {
  id: 'fpc-peds-monitor', domain: 'peds', ref: 'IX.4',
  title: 'Monitoring children in transport',
  summary: 'Choosing and fitting paediatric monitoring equipment: cuffs, probes and capnography, temperature management, alarm limits by age, and the problems of motion, noise and small patients in an aircraft.',
  objectives: [
    'Select and apply correctly sized monitoring equipment for children.',
    'Set age-appropriate alarm limits and interpret trends.',
    'Monitor temperature and prevent heat loss in infants and children.',
  ],
  sections: [
    {
      id: 'equipment', title: 'Sizing and fitting', core: true,
      body: [
        'Blood pressure cuffs should cover about 80–100 % of the arm circumference with a bladder width of about 40 % of the circumference; a cuff too small over-reads and too large under-reads. Non-invasive BP is particularly unreliable in small, moving, vasoconstricted children; trends, capillary refill and mental status add essential information.',
        'Pulse oximetry probes designed for the child\'s size (wraps for infants, placed on a foot or palm) reduce motion artefact. Look at the waveform: a poor plethysmograph means the number may be wrong. Pre-ductal (right hand) and post-ductal (foot) saturations differ in some congenital heart disease and pulmonary hypertension of the newborn.',
        'Waveform capnography is the standard for confirming and monitoring tracheal tube position in children of all sizes; use paediatric or neonatal adaptors with low dead space. Small tidal volumes and high respiratory rates can make sidestream readings lower than true values. ECG electrodes sized for children, placed away from the area where defibrillation pads may be needed.',
      ],
    },
    {
      id: 'alarms', title: 'Alarms and trends', core: true,
      body: [
        'Set alarm limits by age rather than leaving adult defaults: a heart rate of 60 is normal for an adolescent but an emergency in an infant; a respiratory rate of 40 is normal for a newborn but abnormal in a teenager. Programmes often use age-banded alarm presets.',
        'In flight, vibration and noise make it impossible to hear alarms and difficult to examine the child. Position monitors where they can be seen, use visual alarms, and reassess the child directly — chest movement, skin colour and mental status — at regular intervals.',
        'Trends matter more than single values. A slowly rising heart rate, increasing respiratory rate or widening gap between core and peripheral temperature over a flight are early signs of deterioration that a single reading may miss.',
      ],
      table: {
        caption: 'Equipment sizing quick guide',
        head: ['Item', 'Sizing rule'],
        rows: [['BP cuff', 'Bladder width ~40 % of arm circumference; covers 80–100 % of the arm'], ['Uncuffed ETT (internal diameter)', '(age ÷ 4) + 4 mm'], ['Cuffed ETT', '(age ÷ 4) + 3.5 mm'], ['ETT depth (lip)', '3 × ETT internal diameter (cm)'], ['Suction catheter (Fr)', '2 × ETT size'], ['Oral airway', 'Central incisors to angle of jaw']],
      },
    },
    {
      id: 'temp', title: 'Temperature', core: true,
      body: [
        'Infants and small children lose heat quickly: a large surface area relative to body mass, little subcutaneous fat, a large head, and (in neonates) reliance on non-shivering thermogenesis from brown fat, which consumes oxygen and glucose. Cold stress increases oxygen consumption, causes hypoglycaemia and acidosis and worsens outcomes.',
        'Prevent heat loss: keep the child covered (including the head), warm the cabin, use warming mattresses or chemical warmers (with a barrier), warm IV fluids and minimise exposure during assessment. Monitor temperature continuously in critically ill infants (skin or rectal probe) and at least at departure and arrival in all children.',
        'Avoid overheating as well: hyperthermia increases metabolic demand and may worsen brain injury. Febrile children should not be bundled excessively; antipyretics treat discomfort.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the alarm that wasn\'t heard',
      body: ['A 2-year-old with pneumonia is on high-flow nasal cannula. Thirty minutes into the flight, the monitor shows SpO₂ 94 %, HR 165 (up from 140), RR 52 (up from 40). The pleth trace is poor. Nobody heard an alarm because the limits were left at adult defaults.'],
      example: { case: 'What does this tell you?', steps: [
        'Rising HR and RR are trends of worsening distress; the SpO₂ may be falsely reassuring with a poor waveform.',
        'Look at the child: retractions, colour, mental status; reposition the probe.',
        'Increase support (flow, FiO₂) and prepare for escalation (NIV or intubation).',
        'Set age-appropriate alarm limits at the start of every paediatric transport.',
      ] },
    },
  ],
  keyPoints: [
    'Cuff bladder ~40 % of arm circumference; wrong size gives wrong BP.',
    'Trust the waveform: a poor pleth means an unreliable SpO₂.',
    'Waveform capnography for every intubated child.',
    'Set age-appropriate alarm limits; watch trends; look at the child.',
    'Infants lose heat fast — cover, warm, monitor temperature.',
  ],
  pearls: ['Uncuffed ETT ≈ age/4 + 4; cuffed ≈ age/4 + 3.5.', 'Pre- and post-ductal saturations can differ in neonates.'],
  pitfalls: ['Adult alarm defaults on a paediatric patient.', 'Over-bundling a febrile child.'],
  live: [{ id: 'peds-airway', label: 'Paediatric airway and ventilation' }],
  questions: [
    { q: 'BP cuff bladder width should be about:', options: ['10 % of arm circumference', '40 % of arm circumference', '100 % of arm length', 'Any size'], answer: 1, why: 'Accurate readings.' },
    { q: 'A cuff that is too small:', options: ['Under-reads BP', 'Over-reads BP', 'Has no effect', 'Damages the arm only'], answer: 1, why: 'Needs more pressure to occlude.' },
    { q: 'Uncuffed ETT size for a 4-year-old:', options: ['3.0', '5.0', '6.5', '4.0'], answer: 1, why: '(4/4) + 4 = 5.0.' },
    { q: 'Cuffed ETT size for a 4-year-old:', options: ['3.5', '4.5', '5.5', '6.0'], answer: 1, why: '(4/4) + 3.5 = 4.5.' },
    { q: 'ETT depth at the lip for a 5.0 tube:', options: ['10 cm', '15 cm', '20 cm', '12 cm'], answer: 1, why: 'Depth ≈ 3 × tube size = 3 × 5.0.' },
    { q: 'A poor plethysmograph means:', options: ['SpO₂ is accurate', 'SpO₂ may be unreliable', 'The child is well', 'Capnography is wrong'], answer: 1, why: 'Signal quality.' },
    { q: 'Pre-ductal saturation is measured on:', options: ['Left foot', 'Right hand', 'Either foot', 'Forehead only'], answer: 1, why: 'Before the ductus arteriosus.' },
    { q: 'Alarm limits for children should be:', options: ['Adult defaults', 'Age-appropriate', 'Turned off', 'Set to maximum'], answer: 1, why: 'Normal values differ.' },
    { q: 'Infants lose heat rapidly because of:', options: ['More fat', 'Large surface area to mass and large head', 'Faster shivering', 'Lower metabolic rate'], answer: 1, why: 'Physiology.' },
    { q: 'Neonates generate heat mainly by:', options: ['Shivering', 'Non-shivering thermogenesis (brown fat)', 'Sweating', 'Exercise'], answer: 1, why: 'Consumes oxygen and glucose.' },
    { q: 'Cold stress in infants causes:', options: ['Lower oxygen consumption', 'Hypoglycaemia and acidosis', 'Hypertension only', 'Nothing'], answer: 1, why: 'Metabolic cost.' },
    { q: 'Suction catheter size for a 4.0 ETT:', options: ['4 Fr', '8 Fr', '12 Fr', '16 Fr'], answer: 1, why: '2 × ETT size.' },
    { q: 'In flight, the best way to detect deterioration:', options: ['Audible alarms only', 'Visual alarms, trends and direct reassessment', 'Waiting until landing', 'Asking parents'], answer: 1, why: 'Noise masks alarms.' },
    { q: 'Waveform capnography in intubated children is:', options: ['Optional', 'The standard for tube confirmation and monitoring', 'Only for adults', 'Contraindicated'], answer: 1, why: 'It is the standard at every age.' },
    { q: 'A slowly rising heart rate during transport suggests:', options: ['Improvement', 'Possible deterioration', 'Normal sleep', 'Equipment fault only'], answer: 1, why: 'Trend matters.' },
  ],
  sources: [
    { title: 'AHA Pediatric Advanced Life Support guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-and-advanced-life-support' },
    { title: 'AAP Section on Transport Medicine: Guidelines for air and ground transport of neonatal and pediatric patients', url: 'https://www.aap.org/' },
  ],
};

export const PEDS_AIRWAY_DISEASE: FpcLesson = {
  id: 'fpc-peds-airway-disease', domain: 'peds', ref: 'IX.5',
  title: 'Paediatric airway disease: croup, bronchiolitis, asthma and epiglottitis',
  summary: 'Upper versus lower airway obstruction, croup severity and treatment, RSV bronchiolitis and high-flow, acute severe asthma, epiglottitis and bacterial tracheitis, and foreign bodies.',
  objectives: [
    'Distinguish upper from lower airway disease by sound and presentation.',
    'Grade and treat croup, bronchiolitis and acute asthma.',
    'Recognise epiglottitis, tracheitis and foreign body and manage the airway safely.',
  ],
  sections: [
    {
      id: 'upper', title: 'Upper airway: croup, epiglottitis, tracheitis', core: true,
      body: [
        'Stridor indicates upper airway narrowing. Croup (laryngotracheobronchitis), usually viral (parainfluenza), affects children from about 6 months to 3 years with a barking cough, hoarse voice and inspiratory stridor, often worse at night. Severity is graded by stridor at rest, retractions, air entry, cyanosis and consciousness (the Westley score). Treat all severities with dexamethasone 0.15–0.6 mg/kg orally or IV (max 10–16 mg); moderate to severe croup with nebulised epinephrine (0.5 mL/kg of 1 mg/mL, max 5 mL), which works within minutes but wears off in 2 hours — observe for rebound. Keep the child calm, with a parent, in a position of comfort.',
        'Epiglottitis — now rare because of Hib vaccination but still seen in unvaccinated children and adults — presents with sudden high fever, toxic appearance, drooling, dysphagia, muffled voice, tripod positioning and soft stridor. Do not lie the child down, examine the throat or cause distress. The airway is secured in a controlled setting by the most experienced operator, with surgical airway backup. Bacterial tracheitis follows a viral illness with high fever, toxic appearance and thick secretions; many need intubation.',
        'Foreign body aspiration peaks in toddlers: sudden choking, then cough, stridor or wheeze, sometimes unilateral reduced breath sounds. Complete obstruction requires back blows and chest thrusts (infants) or abdominal thrusts (children), then direct laryngoscopy and Magill forceps if unsuccessful.',
      ],
    },
    {
      id: 'lower', title: 'Lower airway: bronchiolitis and asthma', core: true,
      body: [
        'Bronchiolitis, most often caused by RSV, affects infants under 2 years: coryza, then cough, tachypnoea, retractions, crackles and wheeze, peaking around days 3–5. Treatment is supportive — nasal suction, oxygen to keep SpO₂ ≥ 90–92 %, hydration (nasogastric or IV), and high-flow nasal cannula (about 1–2 L/kg/min) or CPAP for increasing work of breathing. Bronchodilators, steroids and antibiotics do not help routinely. Apnoea is a risk in young infants (under 2 months) and premature babies. Watch for fatigue, apnoea and rising CO₂.',
        'Acute severe asthma: cannot complete sentences, accessory muscle use, SpO₂ below 92 %, peak flow below 50 % predicted; life-threatening features include silent chest, cyanosis, exhaustion, confusion and normal or rising PCO₂. Treat with oxygen, repeated or continuous salbutamol (albuterol), ipratropium in the first hour, systemic steroids (prednisolone 1–2 mg/kg or dexamethasone 0.3–0.6 mg/kg), IV magnesium 40–50 mg/kg (max 2 g) over 20 minutes, and IV salbutamol or epinephrine for refractory cases.',
        'Intubation in asthma is high-risk: use ketamine, a large tube, low respiratory rate, short inspiratory time and long expiratory time, accept permissive hypercapnia, and disconnect and compress the chest if the patient becomes hypotensive from air trapping.',
      ],
      table: {
        caption: 'Upper vs lower airway',
        head: ['', 'Upper airway (croup, epiglottitis)', 'Lower airway (bronchiolitis, asthma)'],
        rows: [['Sound', 'Inspiratory stridor', 'Expiratory wheeze, crackles'], ['Voice', 'Hoarse (croup) or muffled (epiglottitis)', 'Normal (but short sentences)'], ['Key drug', 'Dexamethasone, nebulised epinephrine', 'Salbutamol, steroids, magnesium (asthma); support (bronchiolitis)'], ['Avoid', 'Upsetting the child, lying flat (epiglottitis)', 'Over-ventilation after intubation']],
      },
    },
    {
      id: 'transport', title: 'Transport decisions', core: true,
      body: [
        'Distressed children are often best kept calm with a parent rather than separated for procedures. Decide before departure whether the child\'s trajectory allows transport on current support: rising oxygen needs, worsening work of breathing, apnoeas, a rising PCO₂ or exhaustion suggest escalation (NIV or intubation) before flight.',
        'High-flow and CPAP devices must be compatible with the aircraft; calculate oxygen consumption (high-flow uses a lot). Altitude lowers the inspired oxygen partial pressure, so expect oxygen needs to rise in unpressurised aircraft.',
        'Croup treated with nebulised epinephrine may rebound within 2 hours; ensure dexamethasone has been given and have more epinephrine available.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the infant who stops breathing',
      body: ['A 6-week-old, born at 34 weeks, with RSV bronchiolitis on high-flow nasal cannula at 2 L/kg/min and FiO₂ 0.5. SpO₂ 91 %, RR 70 with marked retractions. In the past hour, two apnoeas with bradycardia needed stimulation. Capillary PCO₂ 68.'],
      example: { case: 'Is she safe to fly on high-flow?', steps: [
        'No: young age, prematurity, recurrent apnoeas and rising PCO₂ predict failure.',
        'Escalate before departure: CPAP or intubation; intubation is safer than an apnoea in the aircraft.',
        'Intubate with atropine ready (infant bradycardia), small tidal volumes, PEEP; suction secretions.',
        'Secure the tube, confirm with capnography and plan for transport ventilation.',
      ] },
    },
  ],
  keyPoints: [
    'Stridor = upper airway; wheeze = lower airway.',
    'Croup: dexamethasone for all, nebulised epinephrine for moderate/severe; watch for rebound.',
    'Epiglottitis: don\'t lie flat or upset; secure the airway in a controlled setting.',
    'Bronchiolitis: supportive; high-flow or CPAP; apnoea risk in young and premature infants.',
    'Asthma: salbutamol, ipratropium, steroids, magnesium; intubation is high-risk.',
  ],
  pearls: ['Keep the parent with the distressed child.', 'High-flow oxygen use can empty cylinders quickly.'],
  pitfalls: ['Examining the throat in suspected epiglottitis.', 'Flying an infant with recurrent apnoeas on high-flow.'],
  live: [{ id: 'peds-airway', label: 'Paediatric airway and ventilation' }, { id: 'pop-apnoea', label: 'Apnoea in infants' }],
  questions: [
    { q: 'Inspiratory stridor indicates:', options: ['Lower airway disease', 'Upper airway narrowing', 'Normal breathing', 'Pneumonia'], answer: 1, why: 'Extrathoracic obstruction.' },
    { q: 'Croup typically affects children aged:', options: ['Newborns', '6 months – 3 years', '10–15 years', 'Adults only'], answer: 1, why: 'Croup peaks between 6 months and 3 years.' },
    { q: 'Dexamethasone dose for croup:', options: ['0.015 mg/kg', '0.15–0.6 mg/kg', '5 mg/kg', '10 mg/kg'], answer: 1, why: 'Single dose.' },
    { q: 'Nebulised epinephrine in croup lasts about:', options: ['24 hours', '2 hours — watch for rebound', '10 minutes', 'Permanently'], answer: 1, why: 'Short duration.' },
    { q: 'Classic features of epiglottitis:', options: ['Barking cough, gradual onset', 'Drooling, toxic appearance, tripod position', 'Wheeze', 'Afebrile'], answer: 1, why: 'Supraglottic infection.' },
    { q: 'In suspected epiglottitis, you should:', options: ['Lie the child flat and examine the throat', 'Keep calm, upright and secure the airway in a controlled setting', 'Send for X-ray alone', 'Give oral antibiotics and wait'], answer: 1, why: 'Avoid complete obstruction.' },
    { q: 'Bronchiolitis is most often caused by:', options: ['Bacteria', 'RSV', 'Allergy', 'Foreign body'], answer: 1, why: 'RSV is the commonest viral cause.' },
    { q: 'Routine bronchiolitis treatment:', options: ['Steroids and antibiotics', 'Supportive care: suction, oxygen, hydration, high-flow if needed', 'Bronchodilators always', 'Epinephrine'], answer: 1, why: 'No proven drug therapy.' },
    { q: 'High-flow nasal cannula flow for infants:', options: ['0.1 L/kg/min', 'About 1–2 L/kg/min', '10 L/kg/min', '15 L/min fixed'], answer: 1, why: 'Weight-based.' },
    { q: 'A life-threatening asthma feature:', options: ['Wheeze', 'Silent chest', 'Cough', 'Tachycardia only'], answer: 1, why: 'Minimal air movement.' },
    { q: 'IV magnesium for paediatric asthma:', options: ['4 mg/kg', '40–50 mg/kg (max 2 g)', '500 mg/kg', '1 mg flat'], answer: 1, why: 'Bronchodilator.' },
    { q: 'Ventilating an intubated asthmatic:', options: ['High rate, short expiration', 'Low rate, long expiration, permissive hypercapnia', 'High PEEP only', 'No ventilation'], answer: 1, why: 'Avoid air trapping.' },
    { q: 'Foreign body aspiration is most common in:', options: ['Adolescents', 'Toddlers', 'Newborns', 'Adults'], answer: 1, why: 'Exploratory behaviour.' },
    { q: 'Infants with highest apnoea risk in bronchiolitis:', options: ['Older than 1 year', 'Under 2 months and premature', 'Term 6-month-olds only', 'None'], answer: 1, why: 'Immature respiratory control.' },
    { q: 'Hib vaccination has made which condition rare?', options: ['Croup', 'Epiglottitis', 'Bronchiolitis', 'Asthma'], answer: 1, why: 'Haemophilus influenzae type b.' },
  ],
  sources: [
    { title: 'AAP Clinical Practice Guideline: Bronchiolitis (2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Ralston+clinical+practice+guideline+bronchiolitis+2014' },
    { title: 'Global Initiative for Asthma (GINA) report', url: 'https://ginasthma.org/reports/' },
    { title: 'Cochrane: Glucocorticoids for croup', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Gates+glucocorticoids+for+croup+Cochrane' },
  ],
};

export const NAT: FpcLesson = {
  id: 'fpc-nat', domain: 'peds', ref: 'IX.6',
  title: 'Non-accidental trauma: recognition, care and reporting',
  summary: 'Recognising patterns of injury that raise concern for abuse, abusive head trauma, documentation, mandatory reporting, and caring for the child and family during transport.',
  objectives: [
    'Recognise injury patterns and history features that raise concern for non-accidental trauma.',
    'Manage abusive head trauma and other serious injuries in transport.',
    'Document objectively and meet mandatory reporting duties.',
  ],
  sections: [
    {
      id: 'recognise', title: 'Recognising concern', core: true,
      body: [
        'Non-accidental trauma is a leading cause of injury death in infants. Clinicians recognise it through mismatches: a history that does not explain the injury, a history that changes or differs between caregivers, a mechanism inconsistent with the child\'s developmental stage (for example, a non-mobile infant who "rolled off"), or an unexplained delay in seeking care.',
        'Injury patterns that raise concern include any bruise in a non-mobile infant ("those who don\'t cruise rarely bruise"), bruises on the torso, ears, neck, buttocks or genitals (the "TEN-4" rule — torso, ears and neck in a child under 4, or any bruise in an infant under 4 months — is a validated screening tool), patterned bruises or burns resembling an object, immersion burns with clear lines and sparing of flexed areas, multiple injuries at different stages of healing, and certain fractures (posterior rib fractures, metaphyseal "corner" fractures, and fractures in non-ambulatory infants).',
        'None of these is proof. Medical conditions (bleeding disorders, osteogenesis imperfecta, congenital dermal melanocytosis that resembles bruising) can mimic abuse. The transport clinician\'s role is to recognise concern, treat, document and report — not to investigate or confront.',
      ],
    },
    {
      id: 'aht', title: 'Abusive head trauma', core: true,
      body: [
        'Abusive head trauma (previously "shaken baby syndrome") typically affects infants under 1 year and causes subdural haemorrhage, retinal haemorrhages and brain injury, sometimes with rib or metaphyseal fractures and few external signs. Presentations range from vomiting, irritability and poor feeding (often mistaken for a viral illness) to seizures, apnoea, a bulging fontanelle and coma.',
        'Management follows the principles of paediatric TBI: airway and ventilation (normocapnia), avoid hypoxia and hypotension, treat seizures, head up 30° and midline, hypertonic saline for signs of raised ICP, and transport to a paediatric trauma centre with neurosurgery. Check glucose. A full skeletal survey, ophthalmology examination and other investigations occur at the receiving centre.',
        'Any infant with an unexplained apnoea, seizure or altered consciousness should have abusive head trauma considered, particularly if the history is vague.',
      ],
      list: { caption: 'Features that raise concern (screening, not proof)', items: ['History inconsistent with injury or development', 'Changing or differing accounts; delay in care', 'Any bruise in a non-mobile infant', 'TEN-4 bruising (torso, ears, neck < 4 y; any < 4 months)', 'Patterned or immersion burns', 'Posterior rib or metaphyseal fractures; injuries of different ages'] },
    },
    {
      id: 'report', title: 'Documentation, reporting and caring for families', core: true,
      body: [
        'Document objectively and precisely: what you saw (size, colour, location and shape of injuries), what you were told, by whom, and in their own words in quotation marks. Avoid judgements ("abused child") and speculation. Body diagrams help. Record times and who was present.',
        'Healthcare providers are mandated reporters: reasonable suspicion of abuse must be reported to child protective services or law enforcement according to local law — proof is not required, and good-faith reports are legally protected. Inform the receiving team so that the hospital\'s child protection team is involved. Siblings and other children in the home may also be at risk.',
        'Remain professional and non-confrontational with caregivers. Accusations can escalate conflict and compromise the child\'s safety or the investigation. Explain what you are doing for the child; decisions about whether a caregiver accompanies the child follow normal safety criteria and any instructions from law enforcement.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the irritable infant',
      body: ['A 3-month-old is referred with "vomiting and a seizure, probably viral". The parent says the baby rolled off a sofa yesterday. On examination: bulging fontanelle, GCS 9, a small bruise behind the left ear and another on the chest. CT shows bilateral subdural collections of different densities.'],
      example: { case: 'Priorities.', steps: [
        'Manage as severe TBI: airway, normocapnia, avoid hypoxia and hypotension, treat seizures, glucose.',
        'The history (a 3-month-old cannot roll off a sofa reliably; minor fall vs severe injury) and TEN-4 bruising raise concern for abusive head trauma.',
        'Document objectively, including the caregiver\'s words; inform the receiving team.',
        'Ensure a report is made per law; do not confront the caregiver.',
      ] },
    },
  ],
  keyPoints: [
    'Mismatch between history, injury and development raises concern.',
    'Any bruise in a non-mobile infant; TEN-4 bruising; patterned or immersion burns.',
    'Posterior rib and metaphyseal fractures are highly specific.',
    'Abusive head trauma can present like a viral illness — consider it in unexplained infant seizures or apnoea.',
    'Document objectively, report suspicion (proof not required), do not confront.',
  ],
  pearls: ['"Those who don\'t cruise rarely bruise."', 'Record caregivers\' words in quotation marks.'],
  pitfalls: ['Accepting a minor fall as the explanation for a major injury.', 'Confronting or accusing caregivers.'],
  questions: [
    { q: 'A strong indicator of possible non-accidental trauma:', options: ['A consistent history', 'A history that does not explain the injury', 'A forehead bruise in a walking toddler', 'Knee abrasions'], answer: 1, why: 'A history that does not fit the injury is a red flag.' },
    { q: 'TEN-4 refers to bruising on:', options: ['Shins and knees', 'Torso, ears and neck (or any bruise under 4 months)', 'Forehead', 'Hands'], answer: 1, why: 'Validated screening rule.' },
    { q: '"Those who don\'t cruise rarely bruise" means:', options: ['Walking toddlers never bruise', 'Bruises in non-mobile infants are concerning', 'All bruises are abuse', 'Bruises are normal'], answer: 1, why: 'Developmental stage.' },
    { q: 'A fracture highly specific for abuse in infants:', options: ['Clavicle fracture at birth', 'Posterior rib fracture', 'Toddler\'s fracture of the tibia', 'Distal radius buckle'], answer: 1, why: 'Squeezing mechanism.' },
    { q: 'Abusive head trauma commonly presents with:', options: ['Only obvious external injuries', 'Subdural haemorrhage, retinal haemorrhages, few external signs', 'Epidural haematoma only', 'Isolated scalp laceration'], answer: 1, why: 'Classic triad.' },
    { q: 'Early abusive head trauma can be mistaken for:', options: ['Appendicitis', 'A viral illness (vomiting, irritability)', 'Asthma', 'Croup'], answer: 1, why: 'Non-specific symptoms.' },
    { q: 'Immersion burns typically show:', options: ['Splash marks', 'Clear lines and sparing of flexed areas', 'Random spots', 'Blisters only on the face'], answer: 1, why: 'Forced immersion pattern.' },
    { q: 'Mandatory reporting requires:', options: ['Proof of abuse', 'Reasonable suspicion', 'Caregiver confession', 'Police presence'], answer: 1, why: 'Low threshold.' },
    { q: 'Documentation should include:', options: ['Opinions about guilt', 'Objective findings and caregivers\' words in quotes', 'Speculation', 'Nothing until confirmed'], answer: 1, why: 'Legal and clinical record.' },
    { q: 'Confronting caregivers about suspected abuse:', options: ['Is recommended', 'Should be avoided', 'Is required', 'Is the crew\'s main role'], answer: 1, why: 'Risk to child and investigation.' },
    { q: 'A condition that can mimic bruising:', options: ['Congenital dermal melanocytosis', 'Eczema', 'Acne', 'Measles'], answer: 0, why: 'Blue-grey birthmarks.' },
    { q: 'Good-faith reports of suspected abuse are:', options: ['Punished if wrong', 'Legally protected', 'Optional', 'Forbidden for EMS'], answer: 1, why: 'Mandated reporter protections.' },
    { q: 'Management of abusive head trauma follows:', options: ['Adult stroke protocols', 'Paediatric TBI principles', 'No intervention', 'Sepsis protocol'], answer: 1, why: 'Prevent secondary injury.' },
    { q: 'Metaphyseal "corner" fractures suggest:', options: ['Accidental falls', 'Possible abuse (shearing/twisting)', 'Rickets only', 'Sports injury'], answer: 1, why: 'Classic metaphyseal lesion.' },
    { q: 'The transport clinician\'s role in suspected abuse is to:', options: ['Investigate and interrogate', 'Recognise, treat, document and report', 'Ignore', 'Decide custody'], answer: 1, why: 'Role clarity.' },
  ],
  sources: [
    { title: 'AAP Clinical Report: The evaluation of suspected child physical abuse (2015)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Christian+evaluation+of+suspected+child+physical+abuse+Pediatrics+2015' },
    { title: 'Pierce MC et al. Validation of a clinical decision rule (TEN-4-FACESp) for bruising. JAMA Netw Open (2021)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Pierce+TEN-4-FACESp+bruising+clinical+decision+rule+2021' },
    { title: 'Child Welfare Information Gateway: Mandatory reporters', url: 'https://www.childwelfare.gov/resources/mandatory-reporters-child-abuse-and-neglect/' },
  ],
};
