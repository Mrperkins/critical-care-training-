/** FP-C IX.10–IX.12: high-tech children (home ventilators); infectious disease; airway and ventilator management. */
import type { FpcLesson } from '../types';

export const HIGH_TECH: FpcLesson = {
  id: 'fpc-high-tech', domain: 'peds', ref: 'IX.10',
  title: 'Technology-dependent children: tracheostomies, home ventilators and devices',
  summary: 'Caring for children who depend on tracheostomies, home ventilators, gastrostomy tubes, VP shunts and central lines: troubleshooting with DOPE, emergency tracheostomy changes, and transporting home equipment.',
  objectives: [
    'Troubleshoot a deteriorating child on a home ventilator or with a tracheostomy.',
    'Perform an emergency tracheostomy tube change and know the fallback options.',
    'Recognise complications of shunts, gastrostomies and long-term central lines.',
  ],
  sections: [
    {
      id: 'trach', title: 'Tracheostomies', core: true,
      body: [
        'Children\'s tracheostomy tubes are small (often 3.0–5.0 mm internal diameter), frequently uncuffed, and easily blocked by secretions. The commonest emergencies are obstruction and accidental decannulation. Caregivers are usually skilled and carry an emergency kit with a spare tube of the same size and one size smaller, suction catheters, ties and a syringe.',
        'For a child in distress with a tracheostomy: give oxygen to the face and the stoma, suction the tube (to the pre-measured depth, often written on the kit), and if suction will not pass or the child does not improve, change the tube immediately — a blocked tube is the most likely cause. If the same size will not go in, insert the smaller tube. If no tube can be placed, cover the stoma and ventilate by bag-mask over the mouth and nose (if the upper airway is patent), or apply a small mask or neonatal mask to the stoma.',
        'Children with a tracheostomy because of upper airway obstruction (for example, subglottic stenosis) may be impossible to intubate or ventilate from above — know why the tracheostomy was placed. A fresh tracheostomy (under about 1 week old) has an immature tract that can close or create a false passage; stay sutures may be present to help reopen it.',
      ],
    },
    {
      id: 'vent', title: 'Home ventilators and DOPE', core: true,
      body: [
        'Home ventilators deliver pressure- or volume-controlled breaths via a tracheostomy or a mask (non-invasive). They are compact, have internal batteries and are often more reliable than people expect, but their circuits, humidifiers and power supply can fail. Caregivers know the usual settings and alarms.',
        'When a ventilated child deteriorates, disconnect from the ventilator and hand-ventilate with a bag and oxygen, then work through DOPE: Displacement of the tube, Obstruction (secretions, kinked tube — suction and change if needed), Pneumothorax (absent breath sounds, rising pressures, hypotension), Equipment failure (ventilator, circuit, oxygen, power). If hand-ventilation improves the child, the problem was probably the equipment. Add "S" for stacked breaths (auto-PEEP) in asthma or obstructive disease.',
        'For transport, the home ventilator can often be used if it is approved for the aircraft, its batteries are sufficient for twice the transport time, and the crew understands it — or the child is transferred to the transport ventilator with equivalent settings. Bring the caregiver\'s emergency bag, spare tubes, suction and the humidification device (heat and moisture exchanger).',
      ],
      list: { caption: 'DOPE(S)', items: ['Displacement', 'Obstruction', 'Pneumothorax', 'Equipment failure', 'Stacked breaths (auto-PEEP)'] },
    },
    {
      id: 'devices', title: 'Shunts, gastrostomies and central lines', core: true,
      body: [
        'Ventriculoperitoneal (VP) shunts drain CSF from the brain to the abdomen. Shunt malfunction (blockage, disconnection, infection) causes raised ICP: headache, vomiting, lethargy, irritability, a bulging fontanelle and increasing head size in infants, sunsetting eyes, and eventually bradycardia, hypertension and coma. Infection presents with fever, abdominal pain and redness along the shunt. Treat as raised ICP, image, and transfer to neurosurgery; the shunt may need emergency tapping by neurosurgery.',
        'Gastrostomy tubes (G-tubes and button devices) can dislodge; the tract can begin to close within hours, so a replacement or a Foley catheter of similar size can be placed to keep it open if the tract is mature (usually older than 6–8 weeks). A new tract should not be re-instrumented — refer back to the surgical team.',
        'Long-term central lines (tunnelled catheters, implanted ports) are used for chemotherapy, parenteral nutrition and long-term antibiotics. Fever in a child with a central line is presumed line infection until proven otherwise — take blood cultures and give antibiotics within 1 hour. Other emergencies: line occlusion, line fracture (clamp proximal to the break) and air embolism (clamp, left side down, oxygen).',
      ],
    },
    {
      id: 'case', title: 'Transport case: the blocked trach',
      body: ['A 3-year-old with a 4.0 uncuffed tracheostomy (for subglottic stenosis) on a home ventilator becomes agitated; SpO₂ falls to 78 %, HR 180, little chest movement. The ventilator alarms "high pressure".'],
      example: { case: 'Act.', steps: [
        'Disconnect and hand-ventilate with oxygen — resistance is high, so suspect obstruction.',
        'Suction to the measured depth; the catheter won\'t pass.',
        'Change the tube immediately (4.0; if it won\'t pass, use the 3.5 from the kit).',
        'Because of subglottic stenosis, oral intubation may be impossible — the stoma is the airway; if no tube passes, ventilate via a small mask over the stoma.',
        'Confirm with capnography and chest movement; reconnect and reassess.',
      ] },
    },
  ],
  keyPoints: [
    'Caregivers are experts and carry the emergency kit — use both.',
    'Trach distress: oxygen, suction, change the tube early; smaller tube if needed.',
    'Know why the trach was placed — upper airway obstruction means the stoma is the airway.',
    'DOPE(S): disconnect and hand-ventilate first.',
    'VP shunt malfunction = raised ICP; fever with a central line = antibiotics within 1 hour.',
  ],
  pearls: ['If hand-ventilation fixes it, suspect the equipment.', 'Keep a mature G-tube tract open with a Foley.'],
  pitfalls: ['Persisting with suction instead of changing a blocked tube.', 'Trying to intubate from above in subglottic stenosis.'],
  live: [{ id: 'peds-airway', label: 'Paediatric airway and ventilation' }],
  questions: [
    { q: 'The commonest tracheostomy emergencies:', options: ['Infection and bleeding', 'Obstruction and decannulation', 'Pneumonia', 'Granulation'], answer: 1, why: 'Small tubes block easily.' },
    { q: 'If suction will not pass a tracheostomy tube in a distressed child:', options: ['Keep suctioning', 'Change the tube immediately', 'Wait for help', 'Give a nebuliser'], answer: 1, why: 'Likely blocked.' },
    { q: 'If the same-size trach tube will not go in:', options: ['Abandon', 'Insert one size smaller', 'Force it', 'Use a larger tube'], answer: 1, why: 'Kit carries a smaller tube.' },
    { q: 'DOPE stands for:', options: ['Drugs, Oxygen, Pressure, ECG', 'Displacement, Obstruction, Pneumothorax, Equipment', 'Dose, Order, Pump, Error', 'None'], answer: 1, why: 'Ventilator troubleshooting.' },
    { q: 'First step when a ventilated child deteriorates:', options: ['Change ventilator settings', 'Disconnect and hand-ventilate with oxygen', 'Call for X-ray', 'Increase PEEP'], answer: 1, why: 'Isolate the problem.' },
    { q: 'If hand-ventilation improves the child, the problem is likely:', options: ['Pneumothorax', 'Equipment', 'Displacement', 'Sepsis'], answer: 1, why: 'Ventilator or circuit.' },
    { q: 'A child with a trach for subglottic stenosis who decannulates:', options: ['Is easy to intubate orally', 'May be impossible to intubate from above — use the stoma', 'Needs no airway', 'Should be laid flat and observed'], answer: 1, why: 'Upper airway obstruction.' },
    { q: 'A fresh tracheostomy (< 1 week):', options: ['Has a mature tract', 'Has an immature tract that can close or create a false passage', 'Can be changed easily', 'Needs no special care'], answer: 1, why: 'Stay sutures help.' },
    { q: 'VP shunt malfunction presents with:', options: ['Hypotension', 'Signs of raised ICP: headache, vomiting, lethargy', 'Diarrhoea', 'Rash'], answer: 1, why: 'CSF blockage.' },
    { q: 'Fever in a child with a central line:', options: ['Observe', 'Presumed line infection — cultures and antibiotics within 1 h', 'Remove the line at home', 'Paracetamol only'], answer: 1, why: 'Sepsis risk.' },
    { q: 'A dislodged mature gastrostomy tract can be kept open with:', options: ['Nothing', 'A replacement tube or Foley catheter', 'Surgical glue', 'A suture'], answer: 1, why: 'Tract closes within hours.' },
    { q: 'Home ventilator batteries for transport should last at least:', options: ['The transport time', 'Twice the transport time', '10 minutes', 'Not needed'], answer: 1, why: 'Margin for delays.' },
    { q: 'Suspected air embolism from a central line:', options: ['Head up, right side down', 'Clamp the line, left side down, oxygen', 'Flush the line', 'Remove it immediately'], answer: 1, why: 'Trap air in right heart.' },
    { q: 'Paediatric tracheostomy tubes are often:', options: ['Cuffed and large', 'Small and uncuffed', 'Metal', 'Fenestrated always'], answer: 1, why: 'Airway size.' },
    { q: 'The "S" added to DOPE refers to:', options: ['Sedation', 'Stacked breaths (auto-PEEP)', 'Suction', 'Saturation'], answer: 1, why: 'Obstructive disease.' },
  ],
  sources: [
    { title: 'American Thoracic Society: Care of the child with a chronic tracheostomy', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=American+Thoracic+Society+care+of+the+child+with+a+chronic+tracheostomy' },
    { title: 'National Tracheostomy Safety Project: Paediatric emergency algorithms', url: 'https://www.tracheostomy.org.uk/' },
  ],
};

export const PEDS_INFECTIOUS: FpcLesson = {
  id: 'fpc-peds-infectious', domain: 'peds', ref: 'IX.11',
  title: 'Paediatric infectious disease: sepsis, meningitis and re-emergent diseases',
  summary: 'Recognising and treating paediatric sepsis and septic shock, bacterial meningitis and meningococcal disease, and the re-emergent vaccine-preventable diseases — measles, pertussis — with crew protection.',
  objectives: [
    'Recognise and treat paediatric sepsis and septic shock using current guidance.',
    'Manage suspected meningitis and meningococcal disease.',
    'Identify re-emergent infections and apply appropriate transmission precautions.',
  ],
  sections: [
    {
      id: 'sepsis', title: 'Paediatric sepsis', core: true,
      body: [
        'Sepsis in children is suggested by fever or hypothermia with tachycardia, tachypnoea, altered mental status, poor perfusion (prolonged capillary refill, mottling, cool peripheries or flash refill and bounding pulses in warm shock), and reduced urine output. Hypotension is late. Infants, children with chronic illness, immunosuppression or central lines are at highest risk. The 2024 Phoenix Sepsis Criteria define sepsis in children as suspected infection with life-threatening organ dysfunction across respiratory, cardiovascular, coagulation and neurological systems.',
        'The Surviving Sepsis Campaign paediatric guidelines recommend: antibiotics within 1 hour for septic shock (and within 3 hours for sepsis without shock), blood cultures if they do not delay antibiotics, 10–20 mL/kg fluid boluses (up to 40–60 mL/kg in the first hour where intensive care is available) with reassessment after each, balanced crystalloids, and early vasoactive drugs — epinephrine or norepinephrine — for fluid-refractory shock, which can be started peripherally. Hydrocortisone is considered for catecholamine-refractory shock.',
        'Check glucose and calcium and correct them. Lactate is useful for risk stratification. Intubation in septic shock can precipitate cardiovascular collapse; resuscitate first, use ketamine, and have adrenaline ready.',
      ],
    },
    {
      id: 'meningitis', title: 'Meningitis and meningococcal disease', core: true,
      body: [
        'Bacterial meningitis in children presents with fever, headache, neck stiffness, photophobia, vomiting and altered consciousness; infants show non-specific signs — irritability, poor feeding, lethargy, a bulging fontanelle, hypothermia or seizures — and often no neck stiffness. Common organisms vary by age: group B streptococcus, E. coli and Listeria in neonates; Streptococcus pneumoniae and Neisseria meningitidis in older children.',
        'Meningococcal septicaemia can progress within hours: a non-blanching petechial or purpuric rash (the "glass test"), with shock, coagulopathy and multi-organ failure. Give antibiotics immediately — a third-generation cephalosporin such as ceftriaxone (80–100 mg/kg) — without waiting for lumbar puncture or imaging; add ampicillin for Listeria coverage in neonates and vancomycin where resistant pneumococcus is common. Dexamethasone given with or before the first antibiotic dose reduces hearing loss in Haemophilus influenzae type b meningitis and is used in many centres for bacterial meningitis beyond infancy.',
        'Transport crews should use droplet precautions (surgical mask) for suspected meningococcal disease until 24 hours of effective antibiotics. Close contacts — including crew who performed unprotected airway procedures — may need chemoprophylaxis (ciprofloxacin, rifampicin or ceftriaxone) per public health advice.',
      ],
    },
    {
      id: 'reemergent', title: 'Re-emergent and vaccine-preventable diseases', core: true,
      body: [
        'Falling vaccination rates have brought back diseases many clinicians have never seen. Measles is extremely contagious (airborne; it lingers in the air for up to 2 hours): prodrome of fever, cough, coryza and conjunctivitis, Koplik spots in the mouth, then a maculopapular rash spreading from the face downward. Complications include pneumonia, encephalitis and death, especially in infants and the malnourished. Use airborne precautions (N95 or equivalent) and ensure crew immunity.',
        'Pertussis (whooping cough) is most dangerous in young infants, who may present with apnoea, cyanosis and bradycardia rather than the classic whoop; extreme leucocytosis and pulmonary hypertension predict death. Treat with macrolide antibiotics, support ventilation and use droplet precautions. Varicella can cause severe skin infection (group A streptococcus), pneumonia and encephalitis; it is airborne and contact transmitted. Diphtheria, polio and tetanus remain rare but are seen in under-vaccinated populations and travellers.',
        'Other considerations: tuberculosis (airborne), multisystem inflammatory syndrome in children (MIS-C) after COVID-19 (fever, shock, cardiac dysfunction, rash), and travel-related infections such as malaria in febrile children returning from endemic areas.',
      ],
      table: {
        caption: 'Precautions for transport',
        head: ['Disease', 'Transmission', 'Crew protection'],
        rows: [['Meningococcal disease', 'Droplet', 'Surgical mask until 24 h of antibiotics; prophylaxis if exposed'], ['Measles', 'Airborne', 'N95; immune crew only'], ['Varicella', 'Airborne + contact', 'N95, gloves, gown; immune crew'], ['Pertussis', 'Droplet', 'Surgical mask'], ['Tuberculosis', 'Airborne', 'N95'], ['RSV', 'Contact + droplet', 'Gloves, gown, mask']],
      },
    },
    {
      id: 'case', title: 'Transport case: the rash',
      body: ['A 14-month-old with fever for 8 hours, now lethargic with cold peripheries, capillary refill 5 seconds, HR 190, BP 72/38, and spreading purple spots on the legs that do not fade under pressure.'],
      example: { case: 'Act.', steps: [
        'Suspected meningococcal septicaemia with shock.',
        'IV/IO access; ceftriaxone 80–100 mg/kg immediately; cultures only if they don\'t delay antibiotics.',
        '10–20 mL/kg fluid boluses with reassessment; early epinephrine infusion (peripheral or IO) if fluid-refractory.',
        'Check glucose and calcium; correct coagulopathy at the receiving centre.',
        'Crew wear surgical masks; notify public health for contact prophylaxis.',
      ] },
    },
  ],
  keyPoints: [
    'Paediatric sepsis: tachycardia, poor perfusion, altered mental status; hypotension is late.',
    'Antibiotics within 1 h for septic shock; 10–20 mL/kg boluses with reassessment; early epinephrine or norepinephrine.',
    'Meningitis in infants may lack neck stiffness; give ceftriaxone without waiting for LP.',
    'Non-blanching rash + fever = meningococcal disease until proven otherwise.',
    'Measles and varicella are airborne (N95); meningococcus and pertussis droplet.',
  ],
  pearls: ['Infants with pertussis may present with apnoea, not a whoop.', 'Peripheral epinephrine is acceptable initially.'],
  pitfalls: ['Delaying antibiotics for LP or CT.', 'Non-immune crew transporting measles.'],
  live: [{ id: 'peds-shock', label: 'Paediatric shock' }],
  questions: [
    { q: 'Antibiotics for paediatric septic shock should be given within:', options: ['6 hours', '1 hour', '24 hours', 'After cultures return'], answer: 1, why: 'Surviving Sepsis Campaign.' },
    { q: 'Fluid bolus volume in paediatric septic shock:', options: ['1–2 mL/kg', '10–20 mL/kg with reassessment', '100 mL/kg at once', 'None'], answer: 1, why: 'Titrated boluses.' },
    { q: 'First-line vasoactive drugs for paediatric fluid-refractory septic shock:', options: ['Dopamine', 'Epinephrine or norepinephrine', 'Dobutamine only', 'Vasopressin'], answer: 1, why: 'Current guidance.' },
    { q: 'Vasoactive infusions in children may initially run:', options: ['Only centrally', 'Peripherally or via IO', 'Orally', 'Never'], answer: 1, why: 'Avoid delay.' },
    { q: 'Meningitis in infants often presents with:', options: ['Classic neck stiffness', 'Irritability, poor feeding, bulging fontanelle', 'Headache complaints', 'Kernig\'s sign'], answer: 1, why: 'Non-specific signs.' },
    { q: 'A non-blanching rash with fever suggests:', options: ['Viral exanthem', 'Meningococcal septicaemia', 'Eczema', 'Allergy'], answer: 1, why: 'Treat immediately.' },
    { q: 'Ceftriaxone dose for meningitis in children:', options: ['10 mg/kg', '80–100 mg/kg', '500 mg/kg', '1 mg/kg'], answer: 1, why: 'Meningitic dose.' },
    { q: 'Antibiotics in suspected meningitis should be given:', options: ['After LP', 'Without waiting for LP or imaging', 'After CT', 'Only if rash present'], answer: 1, why: 'Time-critical.' },
    { q: 'Neonatal meningitis coverage adds:', options: ['Vancomycin only', 'Ampicillin for Listeria', 'Metronidazole', 'Azithromycin'], answer: 1, why: 'Listeria monocytogenes.' },
    { q: 'Crew protection for meningococcal disease:', options: ['N95 only', 'Surgical mask (droplet) until 24 h of antibiotics', 'No precautions', 'Gown only'], answer: 1, why: 'Droplet spread.' },
    { q: 'Measles transmission:', options: ['Contact only', 'Airborne — highly contagious', 'Droplet only', 'Bloodborne'], answer: 1, why: 'N95 needed.' },
    { q: 'Koplik spots are associated with:', options: ['Varicella', 'Measles', 'Pertussis', 'Rubella'], answer: 1, why: 'Buccal mucosa spots.' },
    { q: 'Young infants with pertussis may present with:', options: ['A loud whoop always', 'Apnoea, cyanosis and bradycardia', 'Rash', 'Diarrhoea'], answer: 1, why: 'Atypical presentation.' },
    { q: 'Dexamethasone in bacterial meningitis is given:', options: ['After 3 days', 'With or before the first antibiotic dose', 'Never', 'Only in neonates'], answer: 1, why: 'Reduces hearing loss (Hib).' },
    { q: 'Hypotension in paediatric sepsis is:', options: ['Early', 'Late', 'Never seen', 'The first sign'], answer: 1, why: 'Compensation.' },
  ],
  sources: [
    { title: 'Weiss SL et al. Surviving Sepsis Campaign international guidelines for children (2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Weiss+Surviving+Sepsis+Campaign+international+guidelines+children+2020' },
    { title: 'Schlapbach LJ et al. Phoenix Sepsis Criteria for children. JAMA (2024)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Schlapbach+international+consensus+criteria+pediatric+sepsis+Phoenix+2024' },
    { title: 'CDC: Transmission-based precautions', url: 'https://www.cdc.gov/infection-control/hcp/basics/transmission-based-precautions.html' },
  ],
};

export const PEDS_VENT: FpcLesson = {
  id: 'fpc-peds-vent', domain: 'peds', ref: 'IX.12',
  title: 'Paediatric airway and ventilator management',
  summary: 'Anatomical differences in the paediatric airway, equipment sizing, preoxygenation and RSI in children, cuffed tubes, lung-protective ventilation, and troubleshooting the ventilated child in transport.',
  objectives: [
    'Describe paediatric airway anatomy and how it changes technique.',
    'Plan and perform paediatric RSI with appropriate equipment and drugs.',
    'Set and troubleshoot paediatric ventilator settings in transport.',
  ],
  sections: [
    {
      id: 'anatomy', title: 'Anatomy and equipment', core: true,
      body: [
        'Infants and young children have a large occiput (which flexes the neck when supine — place a towel under the shoulders), a large tongue, a higher and more anterior larynx (C2–C3 in infants versus C4–C6 in adults), a floppy, omega-shaped epiglottis, and a narrow airway in which small amounts of oedema cause large increases in resistance (resistance rises with the fourth power of the radius decrease). Infants are preferential nose breathers. They have a smaller functional residual capacity and higher oxygen consumption, so they desaturate quickly during apnoea.',
        'A straight (Miller) blade lifting the epiglottis directly is often used in infants; a curved (Macintosh) blade in older children; video laryngoscopes with paediatric blades are increasingly standard. Cuffed tubes are now preferred for most children beyond the newborn period, with cuff pressure monitored and kept below 20–25 cmH₂O: they reduce tube changes and leaks without increasing complications. Size: cuffed (age ÷ 4) + 3.5 mm; uncuffed (age ÷ 4) + 4 mm; depth at the lip about 3 × the tube size.',
        'Supraglottic airways (i-gel, LMA) come in weight-based sizes and are excellent rescue devices. Needle cricothyroidotomy is the surgical rescue for children under about 8–10 years, whose cricothyroid membrane is too small for a surgical cricothyrotomy.',
      ],
    },
    {
      id: 'rsi', title: 'Paediatric RSI', core: true,
      body: [
        'Prepare everything sized in advance (length-based tape), position (shoulder roll in infants, ear-to-sternal notch alignment in older children), and preoxygenate with high-flow oxygen; apnoeic oxygenation via nasal cannula prolongs safe apnoea time. Resuscitate shock before induction with fluids and have epinephrine ready (push-dose or infusion).',
        'Drugs: ketamine 1–2 mg/kg IV (haemodynamically stable choice), or etomidate 0.3 mg/kg; rocuronium 1–1.2 mg/kg or succinylcholine (2 mg/kg in infants). Atropine 0.02 mg/kg is not routine but is used for infants with bradycardia or when succinylcholine is repeated. Bradycardia during laryngoscopy in an infant usually means hypoxia — stop, oxygenate, then retry.',
        'Limit attempts, call for help early, use a supraglottic airway as rescue, and confirm placement with waveform capnography. Secure the tube well — small movements in a short trachea cause displacement or endobronchial intubation. Note the depth at the lip and recheck after every move.',
      ],
    },
    {
      id: 'vent', title: 'Ventilating children', core: true,
      body: [
        'Lung-protective ventilation: tidal volume 5–8 mL/kg of ideal body weight (lower, 3–6 mL/kg, in paediatric ARDS with poor compliance), plateau pressure below 28–30 cmH₂O, PEEP 5 cmH₂O or higher as oxygenation requires, and the lowest FiO₂ that maintains SpO₂ around 92–97 % (88–92 % in severe ARDS). Respiratory rates by age: infants about 25–40, toddlers 20–30, school-age 15–25, adolescents 12–20. Adjust to EtCO₂ and blood gases; permissive hypercapnia is accepted in ARDS and asthma.',
        'Pressure-control modes are commonly used in small children because they compensate for tube leaks; volume-control with a set tidal volume is also used, especially with cuffed tubes. Monitor delivered tidal volumes — circuit compliance and leaks affect small breaths more.',
        'Troubleshooting follows DOPE(S): displacement (check depth, capnography), obstruction (secretions — small tubes block easily; suction), pneumothorax, equipment failure, and stacked breaths. In flight, re-check tube depth after loading, monitor cuff pressure on ascent (gas expansion), and keep a bag-valve device with a PEEP valve and appropriately sized mask at hand.',
      ],
      table: {
        caption: 'Paediatric ventilator starting points',
        head: ['Parameter', 'Starting point'],
        rows: [['Tidal volume', '5–8 mL/kg IBW (3–6 in ARDS)'], ['Rate (infant / child / adolescent)', '25–40 / 15–30 / 12–20'], ['PEEP', '5 cmH₂O, titrate up'], ['Plateau pressure', '< 28–30 cmH₂O'], ['Inspiratory time', '0.5–0.6 s infant; 0.7–1.0 s child'], ['FiO₂', 'Lowest for SpO₂ 92–97 %']],
      },
    },
    {
      id: 'case', title: 'Transport case: desaturation after loading',
      body: ['An intubated 18-month-old (cuffed 4.0 tube at 12 cm) with pneumonia desaturates to 80 % immediately after being loaded into the aircraft. Breath sounds are reduced on the left. EtCO₂ waveform present.'],
      example: { case: 'Think DOPE.', steps: [
        'Displacement: a small move in a short trachea can push the tube into the right main bronchus — check the depth marking (12 cm expected).',
        'If the tube has migrated in, withdraw to the correct depth and recheck breath sounds bilaterally.',
        'Obstruction: suction secretions.',
        'Pneumothorax: consider if breath sounds remain absent with rising pressures.',
        'Equipment: check oxygen supply and circuit connections after the move.',
      ] },
    },
  ],
  keyPoints: [
    'Large occiput, large tongue, high anterior larynx, floppy epiglottis; rapid desaturation.',
    'Cuffed tubes preferred beyond the newborn period; cuff pressure < 20–25 cmH₂O.',
    'Resuscitate first; ketamine and rocuronium; infant bradycardia means hypoxia.',
    'Needle cricothyroidotomy for children under ~8–10 years.',
    'Ventilate 5–8 mL/kg IBW, plateau < 28–30; troubleshoot with DOPE(S).',
  ],
  pearls: ['Shoulder roll aligns the infant airway.', 'Recheck tube depth after every move.'],
  pitfalls: ['Hyperventilating an infant with a self-inflating bag.', 'Unsecured small tubes migrating during loading.'],
  live: [{ id: 'peds-airway', label: 'Paediatric airway and ventilation' }, { id: 'moa-rocuronium', label: 'Rocuronium: mechanism' }],
  questions: [
    { q: 'The infant larynx is located at about:', options: ['C4–C6', 'C2–C3', 'T1', 'C7'], answer: 1, why: 'Higher and more anterior.' },
    { q: 'A shoulder roll in infants is used because of:', options: ['Small head', 'Large occiput flexing the neck', 'Short neck', 'Long trachea'], answer: 1, why: 'Aligns the airway.' },
    { q: 'Cuffed tube size for a 6-year-old:', options: ['4.0', '5.0', '6.0', '7.0'], answer: 1, why: '(6/4) + 3.5 = 5.0.' },
    { q: 'Cuff pressure in paediatric tubes should be kept below:', options: ['10', '20–25 cmH₂O', '40', '60'], answer: 1, why: 'Prevent mucosal injury.' },
    { q: 'Surgical rescue airway for a 5-year-old:', options: ['Surgical cricothyrotomy', 'Needle cricothyroidotomy', 'Tracheostomy', 'None'], answer: 1, why: 'Small cricothyroid membrane.' },
    { q: 'Bradycardia during infant laryngoscopy usually indicates:', options: ['Vagal reflex only', 'Hypoxia', 'Hyperkalaemia', 'Normal'], answer: 1, why: 'Stop and oxygenate.' },
    { q: 'Infants desaturate quickly because of:', options: ['Large FRC', 'Small FRC and high oxygen consumption', 'Low metabolic rate', 'Large lungs'], answer: 1, why: 'Physiology.' },
    { q: 'Paediatric tidal volume target:', options: ['10–12 mL/kg', '5–8 mL/kg IBW', '15 mL/kg', '2 mL/kg'], answer: 1, why: 'Lung protection.' },
    { q: 'Plateau pressure limit in children:', options: ['< 50', '< 28–30 cmH₂O', '< 15', 'No limit'], answer: 1, why: 'Avoid barotrauma.' },
    { q: 'Desaturation and reduced left breath sounds after a move suggest:', options: ['Left pneumothorax only', 'Right main bronchus intubation', 'Normal', 'Hyperventilation'], answer: 1, why: 'Tube migrated in.' },
    { q: 'Infant ventilator rate starting point:', options: ['8–12', '25–40', '60–80', '100'], answer: 1, why: 'Age-appropriate.' },
    { q: 'Atropine before paediatric intubation is:', options: ['Mandatory for all', 'Not routine; used for bradycardia or repeat succinylcholine', 'Contraindicated', 'Given IM'], answer: 1, why: 'Current guidance.' },
    { q: 'A straight (Miller) blade is often used in infants to:', options: ['Lift the tongue only', 'Lift the floppy epiglottis directly', 'Avoid the larynx', 'Ventilate'], answer: 1, why: 'Better view.' },
    { q: 'ETT cuffs at altitude:', options: ['Shrink', 'Expand — monitor pressure', 'Unchanged', 'Deflate'], answer: 1, why: 'Boyle\'s law.' },
    { q: 'SpO₂ target in severe paediatric ARDS:', options: ['100 %', '88–92 %', '75 %', '> 98 %'], answer: 1, why: 'Limit oxygen toxicity.' },
  ],
  sources: [
    { title: 'Pediatric Acute Lung Injury Consensus Conference (PALICC-2, 2023)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=PALICC-2+pediatric+acute+respiratory+distress+syndrome+2023' },
    { title: 'AHA Pediatric Advanced Life Support guidelines (2020)', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-and-advanced-life-support' },
  ],
};
