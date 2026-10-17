/** FP-C VIII.10: neonatal fluids, thermal management, cardiac and surgical emergencies, RDS. */
import type { FpcLesson } from '../types';

export const NEONATAL: FpcLesson = {
  id: 'fpc-neonatal', domain: 'obneo', ref: 'VIII.10',
  title: 'Neonatal critical care: resuscitation, thermoregulation, RDS, cardiac and surgical emergencies',
  summary: 'Newborn resuscitation, thermal management and the isolette, neonatal fluids and glucose, respiratory distress syndrome and surfactant, duct-dependent congenital heart disease, and surgical emergencies such as diaphragmatic hernia, gastroschisis and malrotation.',
  objectives: [
    'Resuscitate and stabilise a newborn using current neonatal resuscitation guidance.',
    'Manage temperature, fluids and glucose in sick neonates.',
    'Recognise and stabilise RDS, duct-dependent heart disease and neonatal surgical emergencies.',
  ],
  sections: [
    {
      id: 'resus', title: 'Newborn resuscitation', core: true,
      body: [
        'Most newborns need only warming, drying and stimulation. At birth, ask: term gestation? good tone? breathing or crying? If not, provide warmth, position the airway (neutral "sniffing"), clear secretions if needed, dry and stimulate. If the baby is apnoeic or gasping, or the heart rate is below 100, start positive pressure ventilation within the first minute ("the golden minute") at about 40–60 breaths/min, with SpO₂ monitoring on the right hand.',
        'Ventilation is the key intervention. If the heart rate does not rise, use the MR SOPA corrective steps: Mask adjustment, Reposition the airway, Suction, Open the mouth, Pressure increase, Alternative airway (supraglottic device or intubation). If the heart rate stays below 60 after 30 seconds of effective ventilation, start chest compressions at a 3:1 ratio with ventilation (90 compressions and 30 breaths per minute), increase oxygen to 100 %, and give epinephrine 0.02 mg/kg IV/IO if the heart rate remains below 60.',
        'Begin ventilation with 21 % oxygen for term infants and 21–30 % for preterm infants, titrating to pre-ductal saturation targets. Delayed cord clamping (at least 30–60 seconds) benefits vigorous term and preterm babies. Preterm infants below 32 weeks are placed in a polyethylene bag or wrap without drying, under a radiant warmer.',
      ],
    },
    {
      id: 'thermal', title: 'Temperature, fluids and glucose', core: true,
      body: [
        'Neonates lose heat by evaporation (wet skin), conduction (cold surfaces), convection (drafts) and radiation (cold walls and windows). Hypothermia increases oxygen consumption, causes hypoglycaemia, acidosis and pulmonary hypertension, and raises mortality in preterm infants. Keep axillary temperature at 36.5–37.5 °C: dry, wrap, hat, warmed incubator, warm room or cabin, chemical mattress for transport, and plastic wrap for preterm infants. Avoid hyperthermia, except where therapeutic hypothermia has been started for hypoxic-ischaemic encephalopathy (HIE) in consultation with the cooling centre.',
        'Fluids: start at about 60–80 mL/kg/day of 10 % dextrose on day 1 (higher in extreme prematurity because of insensible losses), increasing over the first week. Add sodium and potassium after the first day or two once urine output is established. Boluses for hypovolaemia: 10 mL/kg normal saline (or O-negative blood after blood loss).',
        'Glucose: neonates at risk (preterm, small or large for gestational age, infants of diabetic mothers, sick or cold infants) are screened. Treat symptomatic hypoglycaemia or levels below protocol thresholds with 10 % dextrose 2 mL/kg, then an infusion at a glucose infusion rate of about 4–6 mg/kg/min. Check glucose every 30–60 minutes until stable.',
      ],
    },
    {
      id: 'rds', title: 'Respiratory distress and RDS', core: true,
      body: [
        'Signs of neonatal respiratory distress: tachypnoea (over 60/min), grunting (exhaling against a closed glottis to maintain lung volume), nasal flaring, retractions and cyanosis. Causes: respiratory distress syndrome (surfactant deficiency in preterm infants), transient tachypnoea of the newborn (retained lung fluid, especially after caesarean), meconium aspiration, pneumonia/sepsis, pneumothorax, congenital heart disease and congenital diaphragmatic hernia.',
        'RDS: the lungs are stiff and collapse at end-expiration; the chest film shows a ground-glass appearance with air bronchograms and low lung volumes. Treat with CPAP early (5–8 cmH₂O) and surfactant via an endotracheal tube or a thin catheter (LISA) for infants needing increasing oxygen (commonly FiO₂ above 0.30–0.40 on CPAP). After surfactant, compliance improves quickly — reduce pressures and tidal volumes promptly to avoid pneumothorax and over-ventilation.',
        'Ventilation targets in preterm infants: tidal volumes about 4–6 mL/kg, PEEP 5–7 cmH₂O, SpO₂ about 90–95 %, PCO₂ about 45–55 mmHg (permissive hypercapnia). Pneumothorax presents with sudden deterioration, asymmetric chest and transillumination of the affected side; needle aspiration may be lifesaving.',
      ],
      table: {
        caption: 'Neonatal surgical emergencies',
        head: ['Condition', 'Key features', 'Stabilisation'],
        rows: [['Congenital diaphragmatic hernia', 'Scaphoid abdomen, respiratory distress, bowel in chest', 'Intubate early; no bag-mask; gastric tube; gentle ventilation'], ['Gastroschisis', 'Bowel outside abdomen, right of cord, no sac', 'Cover in bowel bag/film; right side down; fluids; warm'], ['Oesophageal atresia ± TEF', 'Frothy secretions; tube coils in pouch', 'Replogle tube on suction; head up; avoid bag-mask if possible'], ['Malrotation with volvulus', 'Bilious vomiting', 'Emergency surgery; gastric decompression, fluids'], ['Necrotising enterocolitis', 'Preterm, distension, bloody stools', 'Stop feeds, decompress, antibiotics']],
      },
    },
    {
      id: 'cardiac', title: 'Cardiac and surgical emergencies', core: true,
      body: [
        'Duct-dependent congenital heart disease presents as the ductus arteriosus closes in the first days to weeks of life. Duct-dependent pulmonary circulation (for example pulmonary atresia, critical pulmonary stenosis, tricuspid atresia) causes profound cyanosis that does not improve with oxygen. Duct-dependent systemic circulation (hypoplastic left heart, critical coarctation, interrupted aortic arch, critical aortic stenosis) causes shock, poor perfusion, weak or absent femoral pulses and metabolic acidosis — often mistaken for sepsis.',
        'Start prostaglandin E1 (alprostadil 0.01–0.05 mcg/kg/min, higher if the duct is closing) to reopen the ductus; expect apnoea, fever and hypotension, and be ready to ventilate. In duct-dependent systemic circulation, avoid high oxygen, which lowers pulmonary vascular resistance and steals systemic flow — target saturations of about 75–85 %. A hyperoxia test (pre-ductal SpO₂ fails to rise above about 90 % in 100 % oxygen) supports a cyanotic cardiac lesion. Give antibiotics as sepsis is often co-existent or indistinguishable.',
        'Surgical emergencies (see table): bilious vomiting in a newborn is malrotation with volvulus until proven otherwise — a surgical emergency. Congenital diaphragmatic hernia needs early intubation without bag-mask ventilation (which inflates the bowel in the chest), a gastric tube on suction and gentle ventilation. Abdominal wall defects lose heat and fluid rapidly.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the grey baby at day 5',
      body: ['A 5-day-old is brought in pale, grey and breathing fast. HR 190, capillary refill 5 s, femoral pulses absent, right-arm BP 72/40, leg BP unmeasurable. Pre-ductal SpO₂ 95 %, post-ductal 82 %. pH 7.08, lactate 9.'],
      example: { case: 'Interpret and stabilise.', steps: [
        'Shock with absent femoral pulses and a pre/post-ductal gap at day 5: duct-dependent systemic circulation (critical coarctation or hypoplastic left heart) as the duct closes.',
        'Start prostaglandin E1 (0.05 mcg/kg/min initially to reopen); be ready to ventilate for apnoea.',
        'Avoid high FiO₂; cautious fluid boluses (10 mL/kg); inotropes per cardiology advice.',
        'Glucose, antibiotics (sepsis cannot be excluded), temperature control.',
        'Transfer to a paediatric cardiac centre; discuss with cardiology before departure.',
      ] },
    },
  ],
  keyPoints: [
    'Ventilation is the key to newborn resuscitation; compressions 3:1 if HR < 60 after 30 s of effective ventilation.',
    'Start term infants on 21 % oxygen; titrate to pre-ductal targets.',
    'Keep 36.5–37.5 °C; plastic wrap for < 32 weeks; check glucose.',
    'RDS: CPAP early, surfactant; wean pressures after surfactant.',
    'Duct-dependent lesions: prostaglandin E1 (watch for apnoea); bilious vomiting = malrotation until proven otherwise.',
  ],
  pearls: ['No bag-mask in congenital diaphragmatic hernia.', 'Absent femoral pulses in a shocked neonate = think coarctation.'],
  pitfalls: ['High oxygen in duct-dependent systemic circulation.', 'Assuming every shocked neonate has sepsis alone.'],
  live: [{ id: 'neo-transition', label: 'Neonatal transition: fetal to newborn circulation' }, { id: 'pop-apnoea', label: 'Apnoea in infants' }],
  questions: [
    { q: 'The most important intervention in newborn resuscitation:', options: ['Epinephrine', 'Effective ventilation', 'Chest compressions', 'Volume'], answer: 1, why: 'Most arrests are respiratory.' },
    { q: 'Neonatal compression-to-ventilation ratio:', options: ['15:2', '30:2', '3:1', '5:1'], answer: 2, why: '90 compressions, 30 breaths per minute.' },
    { q: 'Start compressions when HR is below 60 after:', options: ['Drying', '30 seconds of effective ventilation', '5 minutes', 'Birth'], answer: 1, why: 'NRP algorithm.' },
    { q: 'Initial oxygen for term newborn resuscitation:', options: ['100 %', '21 %', '50 %', '0 %'], answer: 1, why: 'Avoid hyperoxia.' },
    { q: 'MR SOPA refers to:', options: ['Medication steps', 'Ventilation corrective steps', 'Compression technique', 'Temperature control'], answer: 1, why: 'Mask, Reposition, Suction, Open, Pressure, Alternative airway.' },
    { q: 'Preterm infants < 32 weeks at birth are placed:', options: ['In cold water', 'In a polyethylene wrap without drying', 'Naked under a fan', 'In a towel only'], answer: 1, why: 'Reduce evaporative loss.' },
    { q: 'Initial neonatal maintenance fluid on day 1:', options: ['200 mL/kg/day', '60–80 mL/kg/day 10 % dextrose', '10 mL/kg/day', 'Normal saline only'], answer: 1, why: 'Standard starting point.' },
    { q: 'Grunting in a newborn indicates:', options: ['Normal', 'An attempt to maintain lung volume (distress)', 'Pain only', 'Hunger'], answer: 1, why: 'Expiration against closed glottis.' },
    { q: 'RDS chest film shows:', options: ['Hyperinflation', 'Ground-glass appearance with air bronchograms', 'Normal lungs', 'Pleural effusions'], answer: 1, why: 'Surfactant deficiency.' },
    { q: 'After surfactant, you should:', options: ['Increase pressures', 'Reduce pressures as compliance improves', 'Stop monitoring', 'Remove the tube'], answer: 1, why: 'Avoid pneumothorax.' },
    { q: 'Prostaglandin E1 is used to:', options: ['Close the ductus', 'Keep the ductus arteriosus open', 'Treat RDS', 'Induce labour'], answer: 1, why: 'Duct-dependent lesions.' },
    { q: 'A shocked neonate with absent femoral pulses suggests:', options: ['Sepsis only', 'Duct-dependent systemic circulation (e.g. coarctation)', 'RDS', 'Normal'], answer: 1, why: 'Closing duct.' },
    { q: 'In congenital diaphragmatic hernia, avoid:', options: ['Gastric tube', 'Bag-mask ventilation', 'Intubation', 'Gentle ventilation'], answer: 1, why: 'Inflates bowel in the chest.' },
    { q: 'Bilious vomiting in a newborn is:', options: ['Normal reflux', 'Malrotation with volvulus until proven otherwise', 'Overfeeding', 'Pyloric stenosis'], answer: 1, why: 'Surgical emergency.' },
    { q: 'Gastroschisis is managed by:', options: ['Pushing bowel back', 'Covering bowel in a sterile bag/film, right side down, warmth and fluids', 'Leaving exposed', 'Feeding'], answer: 1, why: 'Prevent heat and fluid loss.' },
  ],
  sources: [
    { title: 'AAP/AHA Neonatal Resuscitation guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation' },
    { title: 'European Consensus Guidelines on the management of RDS (2022 update)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Sweet+European+consensus+guidelines+management+respiratory+distress+syndrome+2022' },
    { title: 'S.T.A.B.L.E. Program', url: 'https://stableprogram.org/' },
  ],
};
