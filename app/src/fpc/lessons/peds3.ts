/** FP-C IX.7–IX.9: fluid and electrolyte replacement; metabolic emergencies (DKA); special needs. */
import type { FpcLesson } from '../types';

export const PEDS_FLUIDS: FpcLesson = {
  id: 'fpc-peds-fluids', domain: 'peds', ref: 'IX.7',
  title: 'Paediatric fluids and electrolytes',
  summary: 'Assessing dehydration, resuscitation boluses and when to stop, maintenance fluids by the 4-2-1 rule, isotonic versus hypotonic fluids, and electrolyte disturbances in children.',
  objectives: [
    'Estimate dehydration and give appropriate resuscitation boluses.',
    'Calculate maintenance fluids with the 4-2-1 (Holliday–Segar) rule.',
    'Choose fluids that avoid iatrogenic hyponatraemia and fluid overload.',
  ],
  sections: [
    {
      id: 'dehydration', title: 'Assessing dehydration', core: true,
      body: [
        'Dehydration is graded by clinical signs: mild (3–5 %) with few signs; moderate (6–9 %) with dry mucous membranes, reduced tears, sunken eyes or fontanelle, reduced urine output, tachycardia and slightly prolonged capillary refill; severe (10 % or more) with lethargy, cool mottled skin, capillary refill over 3 seconds, deep (acidotic) breathing, weak pulses and eventually hypotension. Prolonged capillary refill, abnormal skin turgor and abnormal respiratory pattern are the most useful individual signs.',
        'The best measure is weight loss from a recent known weight: each 1 % of body weight lost equals about 10 mL/kg of fluid deficit. Most children with mild to moderate dehydration from gastroenteritis can be rehydrated orally or by nasogastric tube; IV fluids are for severe dehydration, shock, persistent vomiting or altered consciousness.',
        'Check glucose and electrolytes in children needing IV fluids, particularly infants and those with altered mental status.',
      ],
    },
    {
      id: 'bolus', title: 'Resuscitation and maintenance', core: true,
      body: [
        'Shock: give 10–20 mL/kg isotonic crystalloid (balanced solution or 0.9 % saline) over 5–20 minutes and reassess after each bolus — heart rate, capillary refill, mental status, blood pressure, liver edge and lung sounds. Stop and consider inotropes if signs of fluid overload appear (hepatomegaly, crackles, rising work of breathing). Use smaller boluses (5–10 mL/kg) in cardiac disease, DKA and severe malnutrition. Up to 40–60 mL/kg may be needed in the first hour of septic shock where intensive care is available; in resource-limited settings without ICU, large boluses have caused harm (FEAST trial). Haemorrhagic shock needs blood (10–20 mL/kg) after an initial crystalloid bolus or sooner.',
        'Maintenance fluids (Holliday–Segar, the 4-2-1 rule): 4 mL/kg/hour for the first 10 kg, plus 2 mL/kg/hour for the next 10 kg, plus 1 mL/kg/hour for each kg above 20 kg. A 25 kg child needs 40 + 20 + 5 = 65 mL/hour. Many acutely ill children (those with pneumonia, bronchiolitis, meningitis, post-operative) have raised ADH and should receive about two-thirds of this to avoid fluid overload and hyponatraemia.',
        'Use isotonic maintenance fluids (for example 0.9 % saline or a balanced solution with 5 % dextrose): hypotonic fluids (such as 0.18 % saline) have caused fatal hyponatraemic encephalopathy in children, and the AAP recommends isotonic fluids with appropriate potassium chloride and dextrose for most children aged 28 days to 18 years.',
      ],
      example: {
        case: 'A 15 kg child needs maintenance fluid. What is the hourly rate?',
        steps: ['First 10 kg: 10 × 4 = 40 mL/h.', 'Next 5 kg: 5 × 2 = 10 mL/h.', 'Total: 50 mL/h (about 1200 mL/day).', 'If acutely ill with raised ADH, consider about two-thirds: ~33 mL/h.'],
      },
    },
    {
      id: 'lytes', title: 'Electrolyte disturbances', core: true,
      body: [
        'Hyponatraemic dehydration (sodium below 135) results from replacing losses with water or hypotonic fluids. Symptoms appear with rapid falls or levels below about 125: headache, vomiting, lethargy, seizures. Seizures need 3 % saline 2–5 mL/kg. Otherwise correct with isotonic fluid and monitor sodium every 2–4 hours, aiming for a rise of no more than 8–10 mmol/L per day.',
        'Hypernatraemic dehydration (sodium above 145–150) occurs with excessive water loss or inadequate intake (breastfeeding problems in neonates, diarrhoea with concentrated feeds). The child may look less dehydrated than they are, with doughy skin and irritability. Correct slowly over 48 hours (no more than about 0.5 mmol/L per hour) to avoid cerebral oedema and seizures.',
        'Hypokalaemia from vomiting and diarrhoea causes weakness and arrhythmias; potassium is added to maintenance fluids once urine output is confirmed. Hypocalcaemia in infants (from vitamin D deficiency or hypoparathyroidism) presents with seizures, tetany or stridor (laryngospasm).',
      ],
      table: {
        caption: '4-2-1 rule examples',
        head: ['Weight', 'Calculation', 'mL/h'],
        rows: [['5 kg', '5 × 4', '20'], ['10 kg', '10 × 4', '40'], ['15 kg', '40 + 5 × 2', '50'], ['25 kg', '40 + 20 + 5 × 1', '65'], ['40 kg', '40 + 20 + 20', '80'], ['≥ 70 kg', 'Adult maximum', '~100–120']],
      },
    },
    {
      id: 'case', title: 'Transport case: gastroenteritis and shock',
      body: ['An 18-month-old (11 kg) with 3 days of diarrhoea and vomiting: lethargic, mottled, capillary refill 4 s, HR 180, RR 40 deep, BP 80/50, sunken fontanelle. Glucose 3.4, sodium 131, bicarbonate 12.'],
      example: { case: 'Fluids.', steps: [
        'Severe dehydration (≥ 10 %) with compensated shock.',
        'IV/IO access; 20 mL/kg (220 mL) isotonic crystalloid bolus, reassess; repeat if needed.',
        'After resuscitation: deficit (10 % = 1100 mL) plus maintenance (40 + 2 = 42 mL/h) over 24–48 h with isotonic fluid containing dextrose.',
        'Recheck glucose and electrolytes; add potassium once passing urine.',
      ] },
    },
  ],
  keyPoints: [
    'Severe dehydration (≥ 10 %): lethargy, cap refill > 3 s, deep breathing, weak pulses.',
    '1 % weight loss ≈ 10 mL/kg deficit.',
    'Shock bolus 10–20 mL/kg isotonic, reassess every time; smaller in cardiac, DKA, malnutrition.',
    'Maintenance 4-2-1; often two-thirds in acutely ill children.',
    'Use isotonic maintenance fluids; correct sodium disturbances slowly unless seizing.',
  ],
  pearls: ['Hepatomegaly and crackles mean stop fluids.', 'Hypernatraemic children look less dry than they are.'],
  pitfalls: ['Hypotonic maintenance fluids in sick children.', 'Large boluses without reassessment.'],
  live: [{ id: 'peds-shock', label: 'Paediatric shock' }],
  questions: [
    { q: 'Each 1 % of body weight lost is about:', options: ['1 mL/kg', '10 mL/kg', '100 mL/kg', '5 mL/kg'], answer: 1, why: 'Deficit estimation.' },
    { q: 'A sign of severe dehydration:', options: ['Slightly dry lips', 'Capillary refill > 3 s and lethargy', 'Normal tears', 'Thirst only'], answer: 1, why: 'Shock signs.' },
    { q: 'Initial shock bolus for a child:', options: ['1 mL/kg', '10–20 mL/kg isotonic crystalloid', '50 mL/kg over 1 min', '5 % dextrose'], answer: 1, why: 'Reassess after each.' },
    { q: 'Signs to stop fluid boluses:', options: ['Improved heart rate', 'Hepatomegaly, crackles, rising work of breathing', 'Normal BP', 'Urine output'], answer: 1, why: 'Fluid overload.' },
    { q: 'Maintenance for a 25 kg child (4-2-1):', options: ['25 mL/h', '65 mL/h', '100 mL/h', '45 mL/h'], answer: 1, why: '40 + 20 + 5.' },
    { q: 'Maintenance for a 10 kg child:', options: ['10 mL/h', '40 mL/h', '100 mL/h', '20 mL/h'], answer: 1, why: '10 kg × 4 mL/kg/h = 40 mL/h.' },
    { q: 'The AAP recommends maintenance fluids that are:', options: ['Hypotonic', 'Isotonic', 'Hypertonic', 'Dextrose only'], answer: 1, why: 'Prevent hyponatraemia.' },
    { q: 'Why give about two-thirds maintenance in some sick children?', options: ['They need less sugar', 'Raised ADH risks fluid overload and hyponatraemia', 'To save fluid', 'Kidneys fail'], answer: 1, why: 'SIADH-like states.' },
    { q: 'Smaller boluses (5–10 mL/kg) are used in:', options: ['Gastroenteritis', 'Cardiac disease, DKA, malnutrition', 'Burns', 'Healthy children'], answer: 1, why: 'Risk of overload or oedema.' },
    { q: 'Hypernatraemic dehydration should be corrected:', options: ['Rapidly within 2 hours', 'Slowly over about 48 hours', 'With free water bolus', 'Not at all'], answer: 1, why: 'Avoid cerebral oedema.' },
    { q: 'Seizures with hyponatraemia:', options: ['Fluid restriction', '3 % saline 2–5 mL/kg', 'Hypotonic fluids', 'Furosemide'], answer: 1, why: 'Rapid partial correction.' },
    { q: 'Potassium is added to maintenance fluid:', options: ['Before urine output is confirmed', 'Once urine output is confirmed', 'Never', 'Only in neonates'], answer: 1, why: 'Avoid hyperkalaemia in renal failure.' },
    { q: 'The FEAST trial showed:', options: ['Large boluses always help', 'Harm from large boluses in settings without ICU', 'No effect of fluids', 'Colloids superior'], answer: 1, why: 'African children with febrile illness.' },
    { q: 'Mild to moderate dehydration is best treated with:', options: ['IV fluids always', 'Oral or nasogastric rehydration', 'No fluids', 'Hypertonic saline'], answer: 1, why: 'Effective and safe.' },
    { q: 'A 15 kg child\'s maintenance rate:', options: ['30 mL/h', '50 mL/h', '60 mL/h', '15 mL/h'], answer: 1, why: '40 mL/h for 10 kg + 2 × 5 kg = 50 mL/h.' },
  ],
  sources: [
    { title: 'Feld LG et al. AAP Clinical Practice Guideline: Maintenance IV fluids in children (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Feld+clinical+practice+guideline+maintenance+intravenous+fluids+children+2018' },
    { title: 'Maitland K et al. FEAST trial. NEJM (2011)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Maitland+mortality+after+fluid+bolus+African+children+severe+infection+2011' },
  ],
};

export const PEDS_DKA: FpcLesson = {
  id: 'fpc-peds-dka', domain: 'peds', ref: 'IX.8',
  title: 'Paediatric metabolic emergencies: DKA and inborn errors',
  summary: 'Diagnosing and grading paediatric DKA, fluid and insulin management that minimises cerebral oedema risk, recognising and treating cerebral oedema, and recognising inborn errors of metabolism.',
  objectives: [
    'Diagnose and grade DKA in children.',
    'Manage fluids, insulin and potassium safely during transport.',
    'Recognise and treat cerebral oedema and suspect inborn errors of metabolism.',
  ],
  sections: [
    {
      id: 'dx', title: 'Diagnosis and severity', core: true,
      body: [
        'DKA is defined by hyperglycaemia (glucose above 11 mmol/L, 200 mg/dL), venous pH below 7.3 or bicarbonate below 15 (18 in some guidelines), and ketonaemia or ketonuria. Severity: mild (pH < 7.3 or bicarbonate < 15), moderate (pH < 7.2 or bicarbonate < 10), severe (pH < 7.1 or bicarbonate < 5). About a third of children present with DKA at diagnosis of type 1 diabetes, often after symptoms (polyuria, polydipsia, weight loss) were missed.',
        'Signs: dehydration (often overestimated clinically), vomiting, abdominal pain (mimicking appendicitis), deep sighing (Kussmaul) breathing, a ketotic smell and altered consciousness. Young children, those with new diabetes and severe DKA are at the greatest risk of complications.',
        'Measure glucose, blood gas, electrolytes (calculate corrected sodium), urea and creatinine, ketones and, where possible, calcium, phosphate and magnesium. Weigh the child. An ECG or monitor helps detect potassium abnormalities.',
      ],
    },
    {
      id: 'manage', title: 'Fluids, insulin and potassium', core: true,
      body: [
        'Fluids: if in shock, give 10–20 mL/kg isotonic crystalloid; otherwise a 10 mL/kg bolus over 30–60 minutes is common. Then replace the deficit (typically estimated at 5–10 %) plus maintenance evenly over 24–48 hours with isotonic fluid. The PECARN FLUID trial (2018) found that neither the rate of rehydration nor the sodium content of fluids within the studied range changed the rate of clinically apparent brain injury — shifting focus from fluid restriction to careful, evenly paced rehydration.',
        'Insulin: start an infusion of 0.05–0.1 units/kg/hour 1–2 hours after fluids have begun; no bolus. Aim for glucose to fall by about 3–5 mmol/L per hour; add dextrose (5–10 %) when glucose falls below about 14–17 mmol/L (250–300 mg/dL) and continue insulin until acidosis resolves. Do not stop insulin to correct falling glucose — add more dextrose instead.',
        'Potassium: total body potassium is depleted even when serum levels are normal or high; insulin drives potassium into cells. Add potassium (typically 40 mmol/L) once the serum level is known and urine output is present, unless above 5.5. Hypokalaemia below 3.5 should be corrected before insulin. Bicarbonate is not given except for life-threatening hyperkalaemia; it increases the risk of cerebral oedema.',
      ],
      table: {
        caption: 'Paediatric DKA essentials',
        head: ['Item', 'Typical approach'],
        rows: [['Initial bolus', '10 mL/kg (20 mL/kg if shocked)'], ['Rehydration', 'Deficit + maintenance over 24–48 h, isotonic'], ['Insulin', '0.05–0.1 U/kg/h, no bolus, start after 1–2 h of fluids'], ['Add dextrose', 'When glucose < 14–17 mmol/L'], ['Potassium', 'Add 40 mmol/L once K⁺ known and urine output, unless > 5.5'], ['Bicarbonate', 'Avoid (except life-threatening hyperkalaemia)'], ['Monitoring', 'Hourly glucose and neuro checks; gas and electrolytes every 2–4 h']],
      },
    },
    {
      id: 'oedema', title: 'Cerebral oedema and inborn errors', core: true,
      body: [
        'Cerebral oedema occurs in about 0.5–1 % of paediatric DKA, usually 4–12 hours after treatment starts, and carries high mortality and morbidity. Risk factors: young age, new-onset diabetes, severe acidosis, low PCO₂, high urea, a failure of measured sodium to rise as glucose falls, and bicarbonate treatment. Warning signs: headache, vomiting, irritability or reduced consciousness, inappropriate slowing of heart rate, rising blood pressure, incontinence and abnormal posturing.',
        'Treat immediately, without waiting for a CT: mannitol 0.5–1 g/kg over 10–15 minutes or 3 % saline 2.5–5 mL/kg, reduce the fluid rate, elevate the head, and support the airway (avoiding hyperventilation except for signs of herniation). Intubation is high-risk in severe acidosis because patients rely on hyperventilation to compensate — match their minute ventilation after intubation.',
        'Inborn errors of metabolism usually present in neonates or infants after feeding begins or during illness: poor feeding, vomiting, lethargy, seizures, unusual odour, hypoglycaemia, metabolic acidosis with a high anion gap, or hyperammonaemia (with respiratory alkalosis). Stop protein feeds, give 10 % dextrose at 1.5 times maintenance to stop catabolism, treat hypoglycaemia, and transfer to a centre with metabolic specialists. Many families carry an emergency letter for known conditions.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the drowsy 7-year-old',
      body: ['A 7-year-old (22 kg) with new diabetes: glucose 32 mmol/L, pH 6.98, bicarbonate 4, PCO₂ 14, sodium 132, potassium 5.1. Three hours after fluids and insulin began, he complains of headache, becomes irritable, and his heart rate falls from 128 to 76 while BP rises.'],
      example: { case: 'Act.', steps: [
        'Severe DKA with signs of cerebral oedema (headache, behaviour change, inappropriate bradycardia, rising BP).',
        'Mannitol 0.5–1 g/kg (11–22 g) or 3 % saline 2.5–5 mL/kg (55–110 mL) now; do not wait for CT.',
        'Reduce IV fluid rate; head up 30°.',
        'If intubation is needed, match the very low PCO₂ (high minute ventilation) to avoid worsening acidosis.',
        'Notify the receiving PICU; continue insulin and glucose monitoring.',
      ] },
    },
  ],
  keyPoints: [
    'DKA: glucose > 11, pH < 7.3 or bicarbonate < 15, ketones; severe pH < 7.1.',
    'Bolus 10 mL/kg (20 if shocked), then deficit + maintenance over 24–48 h.',
    'Insulin 0.05–0.1 U/kg/h without bolus; add dextrose rather than stopping insulin.',
    'Add potassium early; avoid bicarbonate.',
    'Cerebral oedema: headache, behaviour change, bradycardia, hypertension — mannitol or 3 % saline immediately.',
  ],
  pearls: ['Measured sodium should rise as glucose falls.', 'Match minute ventilation if intubating in severe DKA.'],
  pitfalls: ['Insulin bolus or early insulin before fluids.', 'Waiting for CT before treating cerebral oedema.'],
  questions: [
    { q: 'Severe paediatric DKA is defined by pH below:', options: ['7.35', '7.1', '7.25', '6.5'], answer: 1, why: 'Or bicarbonate < 5.' },
    { q: 'Insulin infusion rate in paediatric DKA:', options: ['1 U/kg/h', '0.05–0.1 U/kg/h', '0.5 U/kg bolus', '10 units/h'], answer: 1, why: 'A low-dose infusion, with no bolus, is standard.' },
    { q: 'When glucose falls below about 14–17 mmol/L:', options: ['Stop insulin', 'Add dextrose and continue insulin', 'Give bicarbonate', 'Double insulin'], answer: 1, why: 'Insulin clears ketones.' },
    { q: 'Bicarbonate in paediatric DKA:', options: ['Routine', 'Avoided — raises cerebral oedema risk', 'Required if pH < 7.2', 'Given as bolus'], answer: 1, why: 'Bicarbonate increases cerebral oedema risk.' },
    { q: 'Total body potassium in DKA is:', options: ['High', 'Depleted', 'Normal', 'Irrelevant'], answer: 1, why: 'Urinary losses.' },
    { q: 'Cerebral oedema in paediatric DKA typically occurs:', options: ['Before treatment', '4–12 hours after treatment starts', 'After 1 week', 'Never'], answer: 1, why: 'It typically appears 4–12 hours into treatment.' },
    { q: 'A warning sign of cerebral oedema in DKA:', options: ['Tachycardia improving', 'Inappropriate slowing of heart rate with rising BP', 'Polyuria', 'Thirst'], answer: 1, why: 'Cushing-like response.' },
    { q: 'Cerebral oedema in DKA is treated with:', options: ['More fluid', 'Mannitol or 3 % saline immediately', 'Bicarbonate', 'Waiting for CT'], answer: 1, why: 'Time-critical.' },
    { q: 'The PECARN FLUID trial found:', options: ['Fast fluids cause brain injury', 'Rehydration rate and sodium content did not change brain injury rates', 'Fluids should be withheld', 'Hypotonic fluids are best'], answer: 1, why: 'Within studied ranges.' },
    { q: 'If intubating a child with severe DKA:', options: ['Use low respiratory rates', 'Match their high minute ventilation', 'Avoid ventilation', 'Give paralytic only'], answer: 1, why: 'Respiratory compensation.' },
    { q: 'Potassium should be added to fluids:', options: ['Never', 'Once K⁺ is known and urine output present, unless > 5.5', 'Only after 24 h', 'Before any labs'], answer: 1, why: 'Prevent hypokalaemia.' },
    { q: 'A risk factor for cerebral oedema in DKA:', options: ['Older age', 'Young age and new-onset diabetes', 'Mild acidosis', 'High PCO₂'], answer: 1, why: 'Known risk factors.' },
    { q: 'Inborn errors of metabolism typically present:', options: ['In adulthood', 'In neonates/infants after feeding starts or during illness', 'Only with fever', 'Never with hypoglycaemia'], answer: 1, why: 'Metabolic decompensation.' },
    { q: 'Initial management of suspected inborn error:', options: ['Continue protein feeds', 'Stop protein, give 10 % dextrose at ~1.5× maintenance', 'Give insulin bolus', 'Give bicarbonate only'], answer: 1, why: 'Stop catabolism.' },
    { q: 'Hyperammonaemia often causes:', options: ['Respiratory acidosis', 'Respiratory alkalosis', 'Hypernatraemia', 'Bradypnoea always'], answer: 1, why: 'Central hyperventilation.' },
  ],
  sources: [
    { title: 'ISPAD Clinical Practice Consensus Guidelines 2022: DKA and HHS', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=ISPAD+2022+diabetic+ketoacidosis+hyperglycemic+hyperosmolar+state' },
    { title: 'Kuppermann N et al. PECARN FLUID trial. NEJM (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Kuppermann+clinical+trial+fluid+infusion+rates+pediatric+diabetic+ketoacidosis+2018' },
  ],
};

export const SPECIAL_NEEDS: FpcLesson = {
  id: 'fpc-special-needs', domain: 'peds', ref: 'IX.9',
  title: 'Children with special healthcare needs',
  summary: 'Caring for children with developmental delay, autism, cerebral palsy, haematology–oncology conditions and complex medical histories: using the family\'s expertise, emergency information forms, and specific emergencies such as sickle cell crises and febrile neutropenia.',
  objectives: [
    'Adapt assessment and communication for children with developmental delay and autism.',
    'Use caregivers and emergency information forms to establish baseline and plan.',
    'Manage common emergencies in haematology–oncology patients.',
  ],
  sections: [
    {
      id: 'approach', title: 'Approach and communication', core: true,
      body: [
        'Children with special healthcare needs have chronic physical, developmental, behavioural or emotional conditions requiring more care than usual. They are over-represented among transports. The most valuable resource is the caregiver, who knows the child\'s baseline — usual vital signs, oxygen requirement, neurological status, communication and what "unwell" looks like for them. Ask: "What is different from normal today?"',
        'Emergency information forms (and portable care plans) summarise diagnoses, medications, allergies, devices, baseline examination and specific emergency instructions. Ask for them early. Children with complex conditions may have unusual drug requirements, contraindications (for example, succinylcholine in muscular dystrophies) or known difficult airways.',
        'Children with autism spectrum disorder may be very sensitive to noise, light and touch, and an aircraft is a sensory assault. Explain simply, use the child\'s preferred communication method, allow comfort objects, minimise unnecessary touch and noise (ear defenders help), and let a caregiver stay close. Agitation may be distress rather than defiance. Children with developmental delay may not localise or report pain; use behavioural pain tools and the caregiver\'s interpretation.',
      ],
    },
    {
      id: 'conditions', title: 'Common conditions', core: true,
      body: [
        'Cerebral palsy: spasticity, scoliosis and contractures make positioning, IV access and airway management harder; many have seizures, gastrostomy tubes, aspiration risk and chronic lung disease. Baclofen pump failure or abrupt withdrawal causes rebound spasticity, fever and potentially life-threatening autonomic instability.',
        'Children with neuromuscular disorders (muscular dystrophy, spinal muscular atrophy) have weak respiratory muscles and cough, may use home non-invasive ventilation, and deteriorate quickly with respiratory infections. Avoid succinylcholine (risk of hyperkalaemic arrest) and volatile agents. Ventilator-dependent children are covered in the high-tech lesson.',
        'Down syndrome: congenital heart disease, airway obstruction (large tongue, small midface, subglottic stenosis — use a smaller ETT), atlanto-axial instability (avoid neck extension), hypothyroidism and an increased risk of leukaemia.',
      ],
    },
    {
      id: 'heme', title: 'Haematology–oncology emergencies', core: true,
      body: [
        'Sickle cell disease: vaso-occlusive pain crises (early opioid analgesia, fluids, oxygen if hypoxic), acute chest syndrome (new infiltrate with fever, chest pain or hypoxia — oxygen, antibiotics, incentive spirometry, transfusion), splenic sequestration (rapidly enlarging spleen with falling haemoglobin and shock in young children — careful transfusion), stroke (urgent exchange transfusion), aplastic crisis (parvovirus) and sepsis (functional asplenia — fever over 38.5 °C needs urgent antibiotics). Altitude and dehydration can precipitate sickling; maintain oxygenation and hydration in flight.',
        'Oncology patients: febrile neutropenia (antibiotics within 1 hour), tumour lysis syndrome (hyperkalaemia, hyperphosphataemia, hypocalcaemia, hyperuricaemia, renal failure — fluids, avoid potassium, treat hyperkalaemia), superior mediastinal mass (anterior mediastinal tumours can cause complete airway or cardiovascular collapse with sedation or supine positioning — keep the child upright and avoid sedation and paralysis where possible), hyperleucocytosis, and spinal cord compression. Central lines (ports, tunnelled catheters) are the preferred access but carry infection risk; use strict asepsis.',
        'Haemophilia: treat bleeds early with the child\'s factor concentrate (families often carry it and know the dose); head injuries, neck swelling and iliopsoas bleeds are emergencies. Avoid IM injections and NSAIDs.',
      ],
      list: { caption: 'Questions for the caregiver', items: ['What is normal for your child (vital signs, oxygen, alertness, communication)?', 'What is different today?', 'Do you have an emergency care plan or letter?', 'Medications, allergies, devices — and recent changes?', 'What calms your child? What upsets them?', 'Any airway, drug or procedure problems in the past?'] },
    },
    {
      id: 'case', title: 'Transport case: the boy who covers his ears',
      body: ['A 9-year-old with autism and a femur fracture is screaming and hitting out when touched. His mother says he is non-verbal, hates loud noise and bright light, and calms with his tablet and weighted blanket. The flight is 40 minutes.'],
      example: { case: 'Plan.', steps: [
        'Treat pain first: intranasal fentanyl 1.5 mcg/kg avoids a needle while you prepare.',
        'Reduce sensory load: dim lights, ear defenders, minimal touch, explain each step briefly.',
        'Let mother stay close if she meets ride-along criteria; bring the tablet and blanket.',
        'Splint gently; if he cannot tolerate transport safely, consider ketamine sedation with monitoring rather than physical restraint.',
      ] },
    },
  ],
  keyPoints: [
    'The caregiver is the expert on the child\'s baseline — ask what is different today.',
    'Use emergency information forms and care plans.',
    'Autism: reduce sensory load, use preferred communication, comfort objects, caregiver close.',
    'Neuromuscular disorders: avoid succinylcholine; respiratory failure comes fast.',
    'Sickle cell: acute chest, sequestration, stroke, sepsis; oncology: febrile neutropenia, tumour lysis, mediastinal mass.',
  ],
  pearls: ['Anterior mediastinal mass — keep upright, avoid sedation if possible.', 'Families with haemophilia often carry factor and know the dose.'],
  pitfalls: ['Assuming abnormal baseline findings are acute.', 'Physical restraint of a distressed autistic child.'],
  questions: [
    { q: 'The best source of a child\'s baseline status:', options: ['Textbook norms', 'The caregiver', 'The monitor', 'The ED triage note'], answer: 1, why: 'They know what is normal.' },
    { q: 'An emergency information form contains:', options: ['Billing details', 'Diagnoses, medications, baseline and emergency instructions', 'School grades', 'Nothing useful'], answer: 1, why: 'Care summary.' },
    { q: 'Children with autism in an aircraft benefit from:', options: ['Bright lights and noise', 'Reduced sensory load and comfort objects', 'Physical restraint first', 'Separation from caregivers'], answer: 1, why: 'Sensory sensitivity.' },
    { q: 'Succinylcholine in muscular dystrophy risks:', options: ['Hypokalaemia', 'Hyperkalaemic cardiac arrest', 'Hypertension only', 'Nothing'], answer: 1, why: 'Contraindicated.' },
    { q: 'Baclofen pump failure can cause:', options: ['Flaccid paralysis', 'Rebound spasticity, fever and autonomic instability', 'Hypoglycaemia', 'Bradycardia only'], answer: 1, why: 'Withdrawal syndrome.' },
    { q: 'Children with Down syndrome may need:', options: ['A larger ETT', 'A smaller ETT and neck caution', 'No airway precautions', 'Nasal intubation always'], answer: 1, why: 'Subglottic stenosis, atlanto-axial instability.' },
    { q: 'Acute chest syndrome in sickle cell is:', options: ['Muscle pain', 'New infiltrate with fever, chest pain or hypoxia', 'Normal X-ray with cough', 'Asthma'], answer: 1, why: 'Leading cause of death.' },
    { q: 'Splenic sequestration presents with:', options: ['Small spleen', 'Enlarging spleen, falling haemoglobin and shock', 'High platelets', 'Jaundice only'], answer: 1, why: 'Blood pooling in spleen.' },
    { q: 'A child with sickle cell and fever over 38.5 °C needs:', options: ['Antipyretic only', 'Urgent antibiotics (functional asplenia)', 'Observation', 'Transfusion only'], answer: 1, why: 'Sepsis risk.' },
    { q: 'Tumour lysis syndrome causes:', options: ['Hypokalaemia', 'Hyperkalaemia, hyperphosphataemia, hypocalcaemia', 'Hypercalcaemia', 'Hyponatraemia only'], answer: 1, why: 'Cell breakdown.' },
    { q: 'A child with an anterior mediastinal mass should be:', options: ['Sedated and laid flat', 'Kept upright with sedation avoided where possible', 'Paralysed early', 'Positioned prone'], answer: 1, why: 'Risk of airway/cardiovascular collapse.' },
    { q: 'In haemophilia, avoid:', options: ['Factor concentrate', 'IM injections and NSAIDs', 'Ice packs', 'Analgesia'], answer: 1, why: 'Bleeding risk.' },
    { q: 'A useful question for caregivers:', options: ['"Why didn\'t you come earlier?"', '"What is different from normal today?"', '"Is this serious?"', 'None'], answer: 1, why: 'Identifies acute change.' },
    { q: 'Altitude and dehydration in sickle cell disease can:', options: ['Prevent crises', 'Precipitate sickling', 'Cure anaemia', 'Raise platelets'], answer: 1, why: 'Hypoxia and dehydration.' },
    { q: 'Pain assessment in non-verbal children:', options: ['Assume no pain', 'Use behavioural tools and caregiver interpretation', 'Use numeric scales', 'Only vital signs'], answer: 1, why: 'Different expression of pain.' },
  ],
  sources: [
    { title: 'AAP/ACEP policy: Emergency information forms and emergency preparedness for children with special health care needs (2010)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=emergency+information+forms+emergency+preparedness+children+special+health+care+needs+2010' },
    { title: 'NHLBI: Evidence-based management of sickle cell disease — expert panel report (2014)', url: 'https://www.nhlbi.nih.gov/health-topics/evidence-based-management-sickle-cell-disease' },
  ],
};
