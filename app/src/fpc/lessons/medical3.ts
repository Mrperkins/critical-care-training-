/** FP-C IV.7–IV.9: toxicology; blood products; gastrointestinal emergencies. */
import type { FpcLesson } from '../types';

export const TOX: FpcLesson = {
  id: 'fpc-tox', domain: 'medical', ref: 'IV.7',
  title: 'Toxicology: toxidromes and antidotes',
  summary: 'Recognising toxidromes, the high-risk overdoses that kill in transport — salicylates, tricyclics, calcium-channel and beta-blockers, acetaminophen, toxic alcohols, cyanide and carbon monoxide — and their antidotes.',
  objectives: [
    'Identify the major toxidromes from vital signs, pupils, skin and mental status.',
    'Treat life-threatening poisonings with specific antidotes and supportive measures.',
    'Avoid the classic ventilation and drug errors in poisoned patients.',
  ],
  sections: [
    {
      id: 'toxidromes', title: 'Toxidromes', core: true,
      body: [
        'A toxidrome is a pattern of signs that points to a class of poison. Look at heart rate, blood pressure, temperature, respiratory rate, pupils, skin (dry or sweaty), bowel sounds and mental status. Mixed ingestions blur the picture, so treat the patient in front of you.',
        'Sympathomimetic (cocaine, amphetamines): agitation, tachycardia, hypertension, hyperthermia, dilated pupils, sweating. Treat with benzodiazepines, cooling and avoidance of physical restraint struggles. Anticholinergic (diphenhydramine, tricyclics, jimson weed): "hot as a hare, dry as a bone, red as a beet, blind as a bat, mad as a hatter" — tachycardia, hyperthermia, dry flushed skin, dilated pupils, urinary retention, delirium; physostigmine has a role in pure anticholinergic delirium under expert guidance.',
        'Cholinergic (organophosphates, nerve agents): SLUDGE/DUMBELS — salivation, lacrimation, urination, defecation, GI upset, emesis, plus bronchorrhoea and bronchospasm ("the killer Bs") and bradycardia, with miosis. Treat with large, repeated doses of atropine titrated to drying of secretions, and pralidoxime for organophosphates; decontaminate and protect the crew. Opioid: miosis, respiratory depression and coma; naloxone titrated to breathing, not wakefulness. Sedative-hypnotic: depressed consciousness with relatively normal vital signs; support the airway and breathing.',
      ],
      table: {
        caption: 'Toxidrome quick table',
        head: ['Toxidrome', 'HR / BP', 'Temp', 'Pupils', 'Skin', 'Key treatment'],
        rows: [
          ['Sympathomimetic', '↑ / ↑', '↑', 'Dilated', 'Sweaty', 'Benzodiazepines, cooling'],
          ['Anticholinergic', '↑ / ↑ or ↔', '↑', 'Dilated', 'Dry, flushed', 'Benzodiazepines, cooling'],
          ['Cholinergic', '↓ (often) / ↔', '↔', 'Pinpoint', 'Wet', 'Atropine, pralidoxime'],
          ['Opioid', '↓ / ↓', '↓ or ↔', 'Pinpoint', '↔', 'Naloxone, ventilation'],
          ['Sedative-hypnotic', '↔ or ↓', '↔', '↔', '↔', 'Airway and breathing support'],
        ],
      },
    },
    {
      id: 'killers', title: 'Overdoses that kill in transport', core: true,
      body: [
        'Salicylates: tinnitus, vomiting, hyperthermia, tachypnoea, a mixed respiratory alkalosis and high-gap metabolic acidosis, and altered mental status. The patient survives by hyperventilating; if intubated, the minute ventilation must stay high or the pH falls, salicylate enters the brain and the patient may arrest. Alkalinise with sodium bicarbonate, give dextrose for neuroglycopenia, and arrange haemodialysis for severe toxicity. Methyl salicylate (oil of wintergreen) is highly concentrated and has a distinctive smell.',
        'Tricyclic antidepressants: anticholinergic signs, seizures, hypotension and sodium-channel blockade with a wide QRS (> 100 ms) and a tall terminal R in aVR. Treat QRS widening, hypotension or arrhythmia with sodium bicarbonate boluses (1–2 mEq/kg, repeated) to a pH of about 7.45–7.55; avoid type IA and IC antiarrhythmics.',
        'Calcium-channel and beta-blockers: bradycardia and hypotension, with hyperglycaemia typical of calcium-channel blockers. Treat with fluids, calcium, glucagon (beta-blockers), vasopressors, and high-dose insulin euglycaemia therapy (insulin around 1 unit/kg bolus then infusion with dextrose and potassium monitoring) per toxicology advice; lipid emulsion for refractory lipophilic drug toxicity.',
        'Acetaminophen: few early symptoms, then liver injury at 24–72 hours. N-acetylcysteine is most effective within 8 hours of ingestion; never withhold it while waiting for levels if presentation is late or the dose is unknown.',
        'Toxic alcohols (methanol, ethylene glycol): inebriation, then a high anion-gap acidosis with a raised osmolar gap; methanol causes visual loss, ethylene glycol renal failure. Fomepizole blocks alcohol dehydrogenase; dialysis removes the parent compound and toxic metabolites.',
      ],
    },
    {
      id: 'gases', title: 'Carbon monoxide and cyanide', core: true,
      body: [
        'Carbon monoxide binds haemoglobin about 200–250 times more avidly than oxygen and shifts the dissociation curve left, so tissues receive less oxygen. Headache, nausea, confusion and syncope are common; standard pulse oximetry reads falsely normal because it cannot distinguish carboxyhaemoglobin. Give 100 % oxygen (the half-life of COHb falls from about 4–6 hours on air to about 60–90 minutes on 100 %); hyperbaric oxygen is considered for severe cases, pregnancy, loss of consciousness or neurological deficits.',
        'Cyanide blocks cytochrome oxidase, halting aerobic metabolism: sudden collapse, seizures, severe lactic acidosis and a high venous oxygen saturation. House fires (burning plastics) cause combined CO and cyanide poisoning; consider cyanide in smoke-inhalation victims with altered consciousness, hypotension or lactate above about 8 mmol/L. Hydroxocobalamin binds cyanide to form cyanocobalamin and turns skin and urine red, interfering with some lab tests.',
      ],
    },
    {
      id: 'principles', title: 'General principles',
      body: [
        'Airway, breathing and circulation first; check glucose in every altered patient. Decontaminate before transport when the poison is on the skin or clothing (organophosphates, chemicals) to protect the crew and aircraft. Activated charcoal is considered only when the airway is protected and within about an hour of a significant ingestion of an adsorbable toxin; it does not bind iron, lithium, alcohols or metals.',
        'Seizures from poisoning are treated with benzodiazepines first; phenytoin is ineffective and harmful in some (tricyclics). Contact a poison centre early; transport time is a good time to call.',
      ],
      example: {
        case: 'A 32-year-old after a mixed overdose: GCS 8, HR 132, BP 84/50, temp 38.6 °C, pupils dilated, skin dry, QRS 140 ms with a tall R in aVR.',
        steps: [
          'Anticholinergic signs plus a wide QRS: suspect a tricyclic.',
          'Sodium bicarbonate 1–2 mEq/kg IV, repeat until the QRS narrows and BP improves.',
          'Secure the airway; after intubation hyperventilate modestly to keep the pH alkaline.',
          'Benzodiazepines for seizures; avoid class IA/IC antiarrhythmics; vasopressor for persistent hypotension.',
        ],
      },
    },
  ],
  keyPoints: [
    'Use HR, BP, temperature, pupils, skin and mental status to name the toxidrome.',
    'Cholinergic: atropine until secretions dry, plus pralidoxime; opioid: naloxone to breathing.',
    'Salicylates: keep minute ventilation high if intubated; bicarbonate; dialysis.',
    'TCA: wide QRS and tall R in aVR → sodium bicarbonate.',
    'CO: pulse oximetry falsely normal — 100 % O₂; cyanide in fires — hydroxocobalamin.',
  ],
  pearls: ['Oil of wintergreen smells distinctive and is highly concentrated salicylate.', 'High venous oxygen saturation plus severe lactic acidosis suggests cyanide.'],
  pitfalls: ['Normal ventilator settings after intubating a salicylate overdose.', 'Trusting SpO₂ in carbon monoxide poisoning.'],
  live: [{ id: 'metab', label: 'Metabolic acidosis and the anion gap (salicylates)' }],
  questions: [
    { q: 'Dry, flushed skin, dilated pupils, tachycardia and delirium suggest:', options: ['Cholinergic', 'Anticholinergic', 'Opioid', 'Sedative'], answer: 1, why: 'Classic anticholinergic toxidrome.' },
    { q: 'Treatment end-point for atropine in organophosphate poisoning:', options: ['Heart rate 60', 'Drying of bronchial secretions', 'Pupil dilation', 'Fixed dose of 1 mg'], answer: 1, why: 'Titrate to dry secretions and clear breathing.' },
    { q: 'An unresponsive patient with seizures and a wintergreen odour on her breath most likely has:', options: ['Acetaminophen poisoning', 'Methyl salicylate poisoning', 'DKA', 'Hypermethioninaemia'], answer: 1, why: 'Oil of wintergreen is methyl salicylate.' },
    { q: 'After intubating a salicylate-poisoned patient, ventilation should be:', options: ['Low rate', 'High minute ventilation', 'Permissive hypercapnia', 'PS only'], answer: 1, why: 'Acidosis drives salicylate into the brain.' },
    { q: 'A tricyclic overdose with QRS 150 ms is treated first with:', options: ['Amiodarone', 'Sodium bicarbonate', 'Procainamide', 'Phenytoin'], answer: 1, why: 'Sodium loading and alkalinisation.' },
    { q: 'Hyperglycaemia with bradycardia and hypotension suggests poisoning with:', options: ['Beta-blocker', 'Calcium-channel blocker', 'Opioid', 'Organophosphate'], answer: 1, why: 'CCBs impair insulin release.' },
    { q: 'High-dose insulin therapy is used for:', options: ['TCA toxicity', 'Calcium-channel/beta-blocker toxicity', 'Opioids', 'CO'], answer: 1, why: 'Improves myocardial energy use.' },
    { q: 'N-acetylcysteine is most effective within:', options: ['1 hour', '8 hours', '48 hours', '7 days'], answer: 1, why: 'Early therapy prevents hepatotoxicity.' },
    { q: 'Fomepizole treats:', options: ['Methanol and ethylene glycol', 'Cyanide', 'CO', 'Iron'], answer: 0, why: 'Blocks alcohol dehydrogenase.' },
    { q: 'Standard pulse oximetry in CO poisoning reads:', options: ['Falsely low', 'Falsely normal', 'Accurate', 'Zero'], answer: 1, why: 'COHb is read as oxyhaemoglobin.' },
    { q: 'Half-life of COHb on 100 % oxygen:', options: ['4–6 h', '60–90 min', '5 min', '24 h'], answer: 1, why: 'Much shorter than on room air.' },
    { q: 'Smoke inhalation with lactate 12 and coma suggests adding:', options: ['Naloxone', 'Hydroxocobalamin', 'Flumazenil', 'Atropine'], answer: 1, why: 'Cyanide toxicity.' },
    { q: 'Activated charcoal does NOT bind:', options: ['Acetaminophen', 'Iron and lithium', 'Aspirin', 'Tricyclics'], answer: 1, why: 'Metals and alcohols are not adsorbed.' },
    { q: 'First-line for toxin-induced seizures:', options: ['Phenytoin', 'Benzodiazepine', 'Propranolol', 'Physostigmine'], answer: 1, why: 'Phenytoin is ineffective/harmful in some poisonings.' },
    { q: 'Naloxone should be titrated to:', options: ['Full wakefulness', 'Adequate breathing', 'Pupil size', 'Heart rate'], answer: 1, why: 'Avoid precipitating violent withdrawal.' },
  ],
  sources: [
    { title: 'StatPearls: Toxidromes', url: 'https://www.ncbi.nlm.nih.gov/books/NBK534807/' },
    { title: 'StatPearls: Salicylate toxicity', url: 'https://www.ncbi.nlm.nih.gov/books/NBK499879/' },
    { title: 'StatPearls: Carbon monoxide toxicity', url: 'https://www.ncbi.nlm.nih.gov/books/NBK430740/' },
  ],
};

export const BLOOD: FpcLesson = {
  id: 'fpc-blood', domain: 'medical', ref: 'IV.8',
  title: 'Blood products and transfusion',
  summary: 'Red cells, plasma, platelets, cryoprecipitate and whole blood; compatibility; massive transfusion; reactions; and the complications of large-volume transfusion.',
  objectives: [
    'Select the right product and compatibility for the situation.',
    'Run a massive transfusion with balanced ratios, calcium and warming.',
    'Recognise and manage transfusion reactions in flight.',
  ],
  sections: [
    {
      id: 'products', title: 'The products', core: true,
      body: [
        'Packed red blood cells (PRBCs) restore oxygen-carrying capacity; one unit raises haemoglobin by about 1 g/dL in an adult. Plasma (fresh frozen or liquid/thawed) replaces clotting factors. Platelets (one apheresis unit raises the count by roughly 30,000–50,000/µL) treat thrombocytopenia or dysfunction. Cryoprecipitate is concentrated fibrinogen, factor VIII, von Willebrand factor and factor XIII. Low-titre O whole blood provides all components in one bag and is increasingly carried by prehospital services.',
        'Universal donors: O-negative red cells (O-positive acceptable for most males and for women beyond childbearing age when stocks require); AB plasma is the universal plasma donor (low-titre A plasma is used by some programmes). Women of childbearing potential receive O-negative red cells when the type is unknown to avoid Rh sensitisation.',
      ],
      table: {
        caption: 'Products at a glance',
        head: ['Product', 'Contains', 'Main use', 'Storage'],
        rows: [['PRBC', 'Red cells', 'Anaemia, haemorrhage', 'Refrigerated 1–6 °C'], ['Plasma', 'All clotting factors', 'Coagulopathy, MTP', 'Frozen or thawed refrigerated'], ['Platelets', 'Platelets', 'Thrombocytopenia, MTP', 'Room temperature, agitated'], ['Cryoprecipitate', 'Fibrinogen, VIII, vWF, XIII', 'Low fibrinogen', 'Frozen'], ['Whole blood', 'All', 'Haemorrhagic shock', 'Refrigerated']],
      },
    },
    {
      id: 'mtp', title: 'Massive transfusion', core: true,
      body: [
        'Massive transfusion is commonly defined as 10 or more units of red cells in 24 hours, or a rapid rate such as 3–4 units in an hour. Damage-control resuscitation gives products in a balanced ratio approximating whole blood — about 1:1:1 plasma, platelets and red cells — limits crystalloid, permits low blood pressure until haemorrhage control (except in head injury), and treats coagulopathy early with tranexamic acid (within 3 hours of injury) and fibrinogen replacement guided by testing.',
        'Hazards rise with volume: hypocalcaemia (citrate binds calcium — give calcium early), hypothermia (warm every product; cold blood worsens coagulopathy), hyperkalaemia (stored cells leak potassium), acidosis, dilutional coagulopathy, and transfusion-associated circulatory overload.',
      ],
    },
    {
      id: 'reactions', title: 'Transfusion reactions', core: true,
      body: [
        'Watch closely during the first 15 minutes of each unit and throughout. If a reaction is suspected: stop the transfusion, keep the line open with saline, check the patient\'s identity against the unit, treat the symptoms, and report and return the bag per protocol.',
        'Acute haemolytic reaction (ABO incompatibility, usually clerical error): fever, chills, back or flank pain, hypotension, haemoglobinuria and DIC — can be fatal; stop, fluids, support. Febrile non-haemolytic: fever and chills without other signs; antipyretics after excluding haemolysis. Allergic: urticaria and itching; antihistamines; anaphylaxis (wheeze, hypotension) needs adrenaline. TRALI: acute hypoxaemia and bilateral infiltrates within 6 hours, often with hypotension and fever; supportive ventilation. TACO: hypertension, pulmonary oedema and volume overload; slow or stop, diuretics, NIV. Sepsis from contaminated product: high fever and shock, especially with platelets.',
      ],
      list: { caption: 'TRALI versus TACO', items: ['TRALI: hypotension common, no response to diuretics, fever, non-cardiogenic oedema.', 'TACO: hypertension, raised JVP, responds to diuretics, cardiogenic oedema.'] },
    },
    {
      id: 'case', title: 'Transport case: the motorcyclist',
      body: ['A 28-year-old motorcyclist with a pelvic fracture and femur fracture: HR 140, BP 74/40, cool and pale. You carry 2 units of low-titre O whole blood and 2 units of plasma.'],
      example: {
        case: 'Resuscitate.',
        steps: [
          'Control external bleeding; pelvic binder; femoral traction splint.',
          'Give whole blood through a warmer; tranexamic acid 1 g IV (within 3 hours of injury) per protocol.',
          'Give calcium with the blood products; check temperature and keep him warm.',
          'Target a systolic around 80–90 (permissive hypotension) without head injury until haemorrhage control; pre-alert for massive transfusion at the trauma centre.',
          'Monitor for reactions; document unit numbers.',
        ],
      },
    },
  ],
  keyPoints: [
    'O-negative red cells for unknown type in women of childbearing potential; AB plasma is the universal plasma.',
    'Massive transfusion: balanced 1:1:1, limited crystalloid, TXA within 3 h, fibrinogen.',
    'Give calcium and warm every product.',
    'Reaction: stop, saline, check identity, treat, report.',
    'TRALI is hypotensive non-cardiogenic oedema; TACO is hypertensive volume overload.',
  ],
  pearls: ['One unit of PRBCs raises Hb about 1 g/dL.', 'Platelets are stored at room temperature and carry the highest bacterial contamination risk.'],
  pitfalls: ['Running cold blood through a fast line without a warmer.', 'Forgetting calcium during massive transfusion.'],
  live: [{ id: 'lines-haemorrhage-transfusion', label: 'Haemorrhagic shock and transfusion' }, { id: 'labs-coag', label: 'Reversing anticoagulation' }],
  questions: [
    { q: 'Universal donor plasma type:', options: ['O', 'A', 'B', 'AB'], answer: 3, why: 'AB plasma lacks anti-A and anti-B antibodies.' },
    { q: 'Unknown-type woman of childbearing age needs uncrossmatched red cells:', options: ['O-positive', 'O-negative', 'AB-negative', 'A-positive'], answer: 1, why: 'Avoid Rh sensitisation.' },
    { q: 'Cryoprecipitate is mainly used to replace:', options: ['Platelets', 'Fibrinogen', 'Albumin', 'Red cells'], answer: 1, why: 'Rich in fibrinogen.' },
    { q: 'Massive transfusion target ratio:', options: ['1 plasma : 4 RBC', '1:1:1 plasma, platelets, RBC', 'Crystalloid only', 'RBC only'], answer: 1, why: 'Approximates whole blood.' },
    { q: 'TXA in trauma is given within:', options: ['1 hour only', '3 hours of injury', '24 hours', 'Any time'], answer: 1, why: 'Benefit lost (possible harm) after 3 h.' },
    { q: 'Citrate in stored blood causes:', options: ['Hypercalcaemia', 'Hypocalcaemia', 'Hyponatraemia', 'Hypoglycaemia'], answer: 1, why: 'Citrate chelates calcium.' },
    { q: 'First action for a suspected transfusion reaction:', options: ['Slow the rate', 'Stop the transfusion', 'Give furosemide', 'Continue and observe'], answer: 1, why: 'Stop, keep line open with saline.' },
    { q: 'Fever, flank pain, hypotension and dark urine early in a transfusion suggest:', options: ['Allergic reaction', 'Acute haemolytic reaction', 'TACO', 'Febrile non-haemolytic'], answer: 1, why: 'ABO incompatibility.' },
    { q: 'Hypoxaemia, bilateral infiltrates, hypotension within 6 h of transfusion:', options: ['TACO', 'TRALI', 'Anaphylaxis', 'Haemolysis'], answer: 1, why: 'TRALI is non-cardiogenic and often hypotensive.' },
    { q: 'Hypertension, raised JVP and pulmonary oedema after transfusion:', options: ['TRALI', 'TACO', 'Sepsis', 'Haemolysis'], answer: 1, why: 'Volume overload.' },
    { q: 'Highest bacterial contamination risk product:', options: ['PRBC', 'Plasma', 'Platelets', 'Cryoprecipitate'], answer: 2, why: 'Room-temperature storage.' },
    { q: 'One adult PRBC unit raises Hb by about:', options: ['0.1 g/dL', '1 g/dL', '3 g/dL', '5 g/dL'], answer: 1, why: 'Standard estimate.' },
    { q: 'Stored blood potassium tends to be:', options: ['Low', 'High', 'Normal', 'Zero'], answer: 1, why: 'Cells leak potassium during storage.' },
    { q: 'Why warm blood products?', options: ['Prevent hypothermia-induced coagulopathy', 'Increase haemoglobin', 'Prevent TRALI', 'Not needed'], answer: 0, why: 'Hypothermia impairs clotting.' },
    { q: 'Permissive hypotension is NOT appropriate with:', options: ['Penetrating torso trauma', 'Traumatic brain injury', 'Pelvic fracture', 'Splenic injury'], answer: 1, why: 'The brain needs perfusion pressure.' },
  ],
  sources: [
    { title: 'CRASH-2 trial: tranexamic acid in bleeding trauma patients. Lancet (2010)', url: 'https://pubmed.ncbi.nlm.nih.gov/20554319/' },
    { title: 'Holcomb JB et al. PROPPR: 1:1:1 vs 1:1:2 transfusion. JAMA (2015)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2107789' },
    { title: 'StatPearls: Transfusion reactions', url: 'https://www.ncbi.nlm.nih.gov/books/NBK482202/' },
  ],
};

export const GI: FpcLesson = {
  id: 'fpc-gi', domain: 'medical', ref: 'IV.9',
  title: 'Gastrointestinal emergencies',
  summary: 'Upper and lower GI bleeding, variceal haemorrhage, liver failure, pancreatitis, bowel obstruction and perforation, and mesenteric ischaemia — what to do before and during transport.',
  objectives: [
    'Resuscitate GI haemorrhage, including variceal bleeding and anticoagulated patients.',
    'Recognise and manage pancreatitis, obstruction, perforation and mesenteric ischaemia.',
    'Plan airway and aspiration management for the vomiting or bleeding patient.',
  ],
  sections: [
    {
      id: 'bleeding', title: 'GI haemorrhage', core: true,
      body: [
        'Upper GI bleeding (above the ligament of Treitz) presents with haematemesis, coffee-ground vomit or melaena; common causes are peptic ulcer, varices, Mallory–Weiss tears and oesophagitis. Brisk upper bleeding can also cause haematochezia. Lower GI bleeding usually presents with fresh blood per rectum (diverticulosis, angiodysplasia, colitis).',
        'Resuscitate with blood products guided by haemodynamics and a restrictive transfusion threshold (around Hb 7 g/dL) in stable patients without cardiac disease; massive bleeding needs balanced products. Reverse anticoagulants as indicated. A proton-pump inhibitor is commonly started for suspected upper bleeding. Large-bore access, suction and a plan for the airway are essential: blood in the airway turns intubation into a contaminated, high-risk procedure.',
      ],
    },
    {
      id: 'varices', title: 'Variceal bleeding and liver failure', core: true,
      body: [
        'Patients with cirrhosis and portal hypertension bleed from oesophageal or gastric varices. Treatment adds octreotide (splanchnic vasoconstrictor) and prophylactic antibiotics (they reduce infection and rebleeding and improve survival) to resuscitation, with endoscopic banding as definitive therapy. Avoid over-transfusion, which raises portal pressure. In uncontrolled bleeding, a balloon tamponade device (Sengstaken–Blakemore or Minnesota tube) is a bridge, placed only after intubation.',
        'Cirrhotic patients have a complex coagulopathy (both bleeding and clotting tendencies), thrombocytopenia, encephalopathy (lactulose; look for precipitants such as bleeding and infection), ascites with possible spontaneous bacterial peritonitis, hepatorenal syndrome and relative hypotension. Acute liver failure (for example from acetaminophen) adds cerebral oedema and hypoglycaemia.',
      ],
    },
    {
      id: 'abdomen', title: 'Pancreatitis, obstruction, perforation and ischaemia', core: true,
      body: [
        'Acute pancreatitis (gallstones and alcohol are commonest) causes epigastric pain radiating to the back, vomiting and raised lipase. Severe disease brings systemic inflammation, third-spacing, hypocalcaemia, ARDS and shock. Give goal-directed fluids — avoid both under- and over-resuscitation — analgesia, and organ support.',
        'Bowel obstruction causes colicky pain, distension, vomiting and absolute constipation; decompress with a gastric tube, replace fluids and electrolytes, and watch for strangulation (constant pain, fever, peritonism, lactate). Perforation causes sudden severe pain, peritonitis and free air; treat with resuscitation, antibiotics and surgery.',
        'Acute mesenteric ischaemia — often an embolus in a patient with atrial fibrillation — causes pain out of proportion to a soft abdomen. Lactate may be normal early. It needs urgent CT angiography and revascularisation; delay costs bowel.',
      ],
    },
    {
      id: 'transport', title: 'Transport considerations',
      body: [
        'Gas expands at altitude (Boyle\'s law): an obstructed or distended bowel enlarges, increasing pain, vomiting and splinting of the diaphragm. Decompress with a gastric tube before flight in obstruction or ileus, and vent it during flight. Consider lower cabin altitude when possible.',
        'For a patient vomiting blood with a decreased level of consciousness, the airway decision is about aspiration risk and the transport environment: intubation on the ground with SALAD technique and resuscitation first is usually safer than an airway crisis in flight.',
      ],
      example: {
        case: 'A 55-year-old with cirrhosis vomiting large volumes of blood: HR 128, BP 86/50, confused.',
        steps: [
          'Blood products through a warmer; avoid over-transfusion; reverse coagulopathy per protocol.',
          'Octreotide and IV antibiotics; PPI per protocol.',
          'Protect the airway before flight: head up, large-bore suction, SALAD-ready, resuscitate first, reduced-dose induction.',
          'Gastric decompression after intubation; balloon tamponade only if bleeding is uncontrolled and expertise exists.',
        ],
      },
    },
  ],
  keyPoints: [
    'Upper GI bleed: haematemesis, coffee grounds, melaena; resuscitate, reverse anticoagulants, PPI.',
    'Varices: octreotide plus antibiotics; avoid over-transfusion; tamponade only after intubation.',
    'Pancreatitis: goal-directed fluids, analgesia, watch for hypocalcaemia and ARDS.',
    'Mesenteric ischaemia: pain out of proportion; normal lactate does not exclude it.',
    'Decompress distended bowel before flight; gas expands with altitude.',
  ],
  pearls: ['Prophylactic antibiotics improve survival in variceal haemorrhage.', 'Brisk upper GI bleeding can present as bright red rectal blood.'],
  pitfalls: ['Liberal transfusion in variceal bleeding.', 'Flying an obstructed patient without gastric decompression.'],
  live: [{ id: 'abd-mesenteric', label: 'Acute mesenteric ischaemia' }, { id: 'abd-obstruction', label: 'Bowel obstruction and perforation' }],
  questions: [
    { q: 'Melaena usually indicates bleeding:', options: ['From haemorrhoids', 'Above the ligament of Treitz', 'From the sigmoid', 'From the bladder'], answer: 1, why: 'Upper GI blood digested in transit.' },
    { q: 'Octreotide in variceal bleeding works by:', options: ['Increasing portal pressure', 'Splanchnic vasoconstriction', 'Neutralising acid', 'Clotting factor replacement'], answer: 1, why: 'Lowers portal inflow.' },
    { q: 'Which improves survival in cirrhotic GI bleeding?', options: ['Prophylactic antibiotics', 'Liberal transfusion', 'Albumin only', 'Aspirin'], answer: 0, why: 'Reduces infection and rebleeding.' },
    { q: 'A balloon tamponade tube should be placed:', options: ['Before intubation', 'After intubation', 'Never', 'In the field always'], answer: 1, why: 'Airway protection first.' },
    { q: 'Over-transfusion in variceal bleeding:', options: ['Lowers portal pressure', 'Raises portal pressure and rebleeding', 'Is required', 'Prevents encephalopathy'], answer: 1, why: 'Restrictive strategy preferred.' },
    { q: 'Classic pancreatitis pain:', options: ['Right lower quadrant', 'Epigastric radiating to the back', 'Suprapubic', 'Left shoulder only'], answer: 1, why: 'Retroperitoneal organ.' },
    { q: 'Electrolyte disturbance in severe pancreatitis:', options: ['Hypercalcaemia', 'Hypocalcaemia', 'Hypernatraemia', 'Hyperkalaemia always'], answer: 1, why: 'Saponification of fat binds calcium.' },
    { q: 'Pain out of proportion with a soft abdomen in AF suggests:', options: ['Appendicitis', 'Mesenteric ischaemia', 'Gastritis', 'Constipation'], answer: 1, why: 'Early ischaemia lacks peritonism.' },
    { q: 'At altitude, gas in an obstructed bowel:', options: ['Contracts', 'Expands', 'Unchanged', 'Dissolves'], answer: 1, why: 'Boyle\'s law.' },
    { q: 'Before flying a patient with bowel obstruction:', options: ['Give oral fluids', 'Place and vent a gastric tube', 'Give laxatives', 'Nothing'], answer: 1, why: 'Decompress to limit expansion.' },
    { q: 'Restrictive Hb threshold for stable GI bleeding without cardiac disease:', options: ['5', '7', '10', '12 g/dL'], answer: 1, why: 'Restrictive strategy improves outcomes.' },
    { q: 'Hepatic encephalopathy is treated with:', options: ['Lactulose', 'Morphine', 'Benzodiazepines', 'Protein loading'], answer: 0, why: 'Reduces ammonia absorption.' },
    { q: 'Free air under the diaphragm on an upright film suggests:', options: ['Obstruction', 'Perforated viscus', 'Pancreatitis', 'Normal'], answer: 1, why: 'Pneumoperitoneum.' },
    { q: 'Strangulated obstruction is suggested by:', options: ['Colicky pain only', 'Constant pain, fever, peritonism', 'Normal lactate always', 'Diarrhoea'], answer: 1, why: 'Ischaemic bowel.' },
    { q: 'Acute liver failure particularly risks:', options: ['Hyperglycaemia', 'Cerebral oedema and hypoglycaemia', 'Hypercoagulability only', 'Bradycardia'], answer: 1, why: 'Loss of hepatic function.' },
  ],
  sources: [
    { title: 'StatPearls: Upper gastrointestinal bleeding', url: 'https://www.ncbi.nlm.nih.gov/books/NBK470300/' },
    { title: 'Villanueva C et al. Transfusion strategies for acute upper GI bleeding. NEJM (2013)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1211801' },
    { title: 'StatPearls: Acute pancreatitis', url: 'https://www.ncbi.nlm.nih.gov/books/NBK482468/' },
  ],
};
