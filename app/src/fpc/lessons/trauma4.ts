/** FP-C VII.9–VII.10: burns (thermal, electrical, chemical, radiological); toxic inhalation injuries. */
import type { FpcLesson } from '../types';

export const BURNS: FpcLesson = {
  id: 'fpc-burns', domain: 'trauma', ref: 'VII.9',
  title: 'Burns: thermal, electrical, chemical and radiological',
  summary: 'Burn depth, referral criteria, the burn primary survey, and the specific dangers of electrical, chemical and radiation injuries.',
  objectives: [
    'Classify burn depth and apply burn centre referral criteria.',
    'Manage the airway, breathing and circulation of a major burn.',
    'Recognise the distinctive hazards of electrical, chemical and radiological burns.',
  ],
  sections: [
    {
      id: 'depth', title: 'Depth and referral', core: true,
      body: [
        'Superficial (first-degree) burns involve the epidermis only: red, painful, no blisters. Superficial partial-thickness burns are blistered, moist, pink and very painful, and blanch. Deep partial-thickness burns are paler, less painful, and blanch slowly or not at all. Full-thickness (third-degree) burns are white, leathery or charred, insensate and dry; they do not heal without grafting. Fourth-degree burns extend to muscle, tendon or bone.',
        'Burn centre referral criteria (ABA) include partial-thickness burns over 10 % TBSA, any full-thickness burn, burns to the face, hands, feet, genitalia, perineum or major joints, electrical (including lightning) and chemical burns, inhalation injury, burns with concomitant trauma (where the burn poses the greater risk), patients with significant pre-existing illness, and children in hospitals without paediatric capability.',
        'If trauma injuries pose the greater immediate risk, the patient may need a trauma centre first. Burns do not cause early hypotension — shock in the first hour suggests another injury (bleeding) or cyanide or carbon monoxide poisoning.',
      ],
    },
    {
      id: 'survey', title: 'The burn primary survey', core: true,
      body: [
        'Stop the burning: remove clothing and jewellery, cool the burn with cool running water for up to 20 minutes if within 3 hours (avoiding ice and avoiding hypothermia in large burns), then cover with clean dry dressings.',
        'Airway: look for inhalation injury (see the toxic inhalation lesson); the airway can swell over hours, and a long flight is a reason to secure it early if signs are present. Use an uncut, large tube (ideally 7.5–8.0 or larger) to allow bronchoscopy, and secure it without circumferential ties that compress swelling tissue. Breathing: circumferential chest burns may need escharotomy. Circulation: two large-bore lines, fluids per formula, urinary catheter. Disability and exposure: assess, then keep the patient warm — burned skin cannot regulate heat.',
        'Analgesia is essential and often needs large opioid doses or ketamine. Succinylcholine is safe in the first 24 hours; after that, use rocuronium because of hyperkalaemia risk. Tetanus prophylaxis is given; prophylactic systemic antibiotics are not.',
      ],
    },
    {
      id: 'electrical', title: 'Electrical, chemical and radiation burns', core: true,
      body: [
        'Electrical injuries: visible skin wounds (entry and exit) underestimate the damage — current travels through deep tissues, causing muscle necrosis, compartment syndrome and rhabdomyolysis. High-voltage (over 1000 V) injuries cause arrhythmias, cardiac arrest, spinal injuries from falls or tetanic contraction, and myoglobinuria. Monitor the ECG; give fluids to a urine output of 1–1.5 mL/kg/hour if the urine is dark. Lightning causes asystole and respiratory arrest; reverse triage applies at multi-casualty lightning strikes — treat the apparently dead first, as they often respond to ventilation.',
        'Chemical burns: protect yourself first. Brush off dry powders, then irrigate with copious water for a long time (alkalis penetrate more deeply than acids and need prolonged irrigation). Hydrofluoric acid causes severe pain, deep tissue injury and potentially fatal hypocalcaemia and hypomagnesaemia — treat with calcium gluconate gel topically and calcium IV, and monitor the ECG. Phenol is removed with polyethylene glycol where available. Do not neutralise chemicals with other chemicals on the skin.',
        'Radiological injuries: decontaminate by removing clothing (which removes most external contamination) and washing. Life-threatening injuries take priority over decontamination. Acute radiation syndrome produces nausea and vomiting within hours, and the time to onset of vomiting estimates the dose. Contact the receiving facility early so it can prepare.',
      ],
      table: {
        caption: 'Burn depth',
        head: ['Depth', 'Appearance', 'Sensation', 'Heals'],
        rows: [['Superficial', 'Red, dry, no blisters', 'Painful', 'Days'], ['Superficial partial', 'Blisters, moist, pink, blanches', 'Very painful', '2–3 weeks'], ['Deep partial', 'Pale, mottled, slow/no blanch', 'Reduced', 'Weeks; may need graft'], ['Full thickness', 'White, leathery, charred', 'Insensate', 'Needs graft']],
      },
    },
  ],
  keyPoints: [
    'Full-thickness burns are leathery and insensate; superficial burns are not counted in TBSA.',
    'Early hypotension in burns suggests other injury, CO or cyanide.',
    'Secure the airway early when inhalation signs are present before a long transport.',
    'Electrical burns hide deep muscle damage — monitor ECG and urine.',
    'Hydrofluoric acid: calcium gluconate gel and IV calcium.',
  ],
  pearls: ['Reverse triage at lightning strikes.', 'Clothing removal removes most radiological contamination.'],
  pitfalls: ['Wet dressings and hypothermia.', 'Judging electrical injury by the skin wounds.'],
  live: [{ id: 'moa-calcium', label: 'Calcium: mechanism' }, { id: 'moa-fentanyl', label: 'Fentanyl: mechanism' }],
  questions: [
    { q: 'A white, leathery, insensate burn is:', options: ['Superficial', 'Superficial partial', 'Full-thickness', 'First-degree'], answer: 2, why: 'Nerve endings destroyed.' },
    { q: 'A burn centre referral criterion:', options: ['5 % superficial burn', 'Burns to hands, face, feet or genitalia', 'Sunburn', 'Any blister'], answer: 1, why: 'Functional areas.' },
    { q: 'Hypotension within the first hour of a burn suggests:', options: ['Burn shock', 'Another cause — bleeding, CO, cyanide', 'Normal response', 'Dehydration'], answer: 1, why: 'Burn shock develops over hours.' },
    { q: 'Cooling a burn:', options: ['Ice for 1 hour', 'Cool running water up to 20 minutes', 'Butter', 'Never'], answer: 1, why: 'Within 3 hours of injury.' },
    { q: 'Succinylcholine after 24 hours from a major burn:', options: ['Safe', 'Avoid — hyperkalaemia risk', 'Preferred', 'Required'], answer: 1, why: 'Receptor up-regulation.' },
    { q: 'Electrical injury damage is:', options: ['Accurately shown by skin wounds', 'Often far deeper than skin wounds suggest', 'Superficial only', 'Never cardiac'], answer: 1, why: 'Current travels through tissue.' },
    { q: 'Urine output target with myoglobinuria:', options: ['0.3 mL/kg/h', '1–1.5 mL/kg/h', '0.5 mL/kg/h', '5 mL/kg/h'], answer: 1, why: 'Prevents AKI.' },
    { q: 'Reverse triage at a lightning strike means:', options: ['Treat the walking first', 'Treat the apparently dead first', 'Ignore arrested patients', 'Treat children last'], answer: 1, why: 'Respiratory arrest responds to ventilation.' },
    { q: 'Alkali burns compared with acid burns:', options: ['Less severe', 'Penetrate more deeply; need prolonged irrigation', 'Need neutralisation', 'Need no irrigation'], answer: 1, why: 'Liquefactive necrosis.' },
    { q: 'Hydrofluoric acid burns cause:', options: ['Hypercalcaemia', 'Severe hypocalcaemia', 'Hyperglycaemia', 'Hypernatraemia'], answer: 1, why: 'Fluoride binds calcium.' },
    { q: 'First step for a dry chemical powder:', options: ['Water immediately', 'Brush off, then irrigate', 'Neutralise', 'Cover'], answer: 1, why: 'Some powders react with water.' },
    { q: 'Removing clothing in radiological contamination:', options: ['Has no effect', 'Removes most external contamination', 'Is contraindicated', 'Spreads radiation'], answer: 1, why: 'Simple decontamination.' },
    { q: 'Endotracheal tube choice in major burns:', options: ['Small and cut short', 'Large and uncut', 'Supraglottic only', 'Nasal always'], answer: 1, why: 'Allows bronchoscopy and swelling.' },
    { q: 'Prophylactic systemic antibiotics in acute burns:', options: ['Routine', 'Not recommended', 'Required for all', 'Only IV'], answer: 1, why: 'No benefit; resistance.' },
    { q: 'A deep partial-thickness burn:', options: ['Blanches briskly', 'Is pale, with reduced sensation', 'Has no blisters ever', 'Heals in days'], answer: 1, why: 'Deeper dermis involved.' },
  ],
  sources: [
    { title: 'American Burn Association: Burn centre referral criteria', url: 'https://ameriburn.org/resources/burnreferral/' },
    { title: 'StatPearls: Electrical injuries', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Electrical+injuries+StatPearls' },
    { title: 'StatPearls: Chemical burns', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Chemical+burns+StatPearls' },
  ],
};

export const TOXIC_INHALATION: FpcLesson = {
  id: 'fpc-toxic-inhalation', domain: 'trauma', ref: 'VII.10',
  title: 'Toxic inhalation: airway burns, carbon monoxide and cyanide',
  summary: 'Thermal airway injury, smoke inhalation, carbon monoxide and cyanide poisoning, and the decision to intubate before a long flight.',
  objectives: [
    'Identify signs of inhalation injury and decide when to intubate.',
    'Diagnose and treat carbon monoxide poisoning, including the limits of pulse oximetry.',
    'Recognise and treat cyanide toxicity in smoke inhalation.',
  ],
  sections: [
    {
      id: 'airway', title: 'Inhalation injury and the airway', core: true,
      body: [
        'Heat injury is mostly confined to the upper airway, because the upper airway is an efficient heat exchanger; steam is the exception and can burn below the cords. Below the glottis, damage comes from chemicals in smoke — aldehydes, acrolein, ammonia and particulates — causing bronchospasm, mucosal sloughing, casts and pneumonia over hours to days.',
        'Signs include a history of an enclosed-space fire, facial and neck burns, singed nasal hair, carbonaceous sputum, soot in the mouth, hoarseness, stridor, wheeze and respiratory distress. Hoarseness and stridor indicate airway narrowing — swelling continues for 24–48 hours and fluid resuscitation accelerates it.',
        'Intubate early for stridor, hoarseness with deep facial burns, full-thickness burns of the face or neck, extensive burns (often > 40 % TBSA), altered consciousness or respiratory failure. Prophylactic intubation of every patient with soot or singed hair is not required — many have no significant injury — but a long flight with no ability to intervene safely shifts the threshold earlier. A difficult airway plan (including surgical) is essential; swelling makes later attempts much harder.',
      ],
    },
    {
      id: 'co', title: 'Carbon monoxide', core: true,
      body: [
        'Carbon monoxide binds haemoglobin with about 200–250 times the affinity of oxygen, reducing oxygen-carrying capacity and shifting the oxygen–haemoglobin dissociation curve to the left so that tissues receive even less. It also binds cytochrome oxidase and myoglobin, impairing cellular respiration and the heart.',
        'Standard pulse oximetry cannot distinguish carboxyhaemoglobin from oxyhaemoglobin and reads falsely normal. Measure COHb by co-oximetry (blood gas) or a multi-wavelength pulse CO-oximeter. Symptoms — headache, nausea, confusion, syncope, seizures, coma, ischaemic chest pain — correlate imperfectly with levels; smokers carry up to about 10 % at baseline.',
        'Treat with 100 % oxygen by non-rebreather or ventilator: the half-life of COHb falls from about 4–6 hours on room air to 60–90 minutes on 100 % oxygen, and about 20–30 minutes with hyperbaric oxygen. Hyperbaric therapy is considered for loss of consciousness, neurological deficits, cardiac ischaemia, pregnancy with elevated COHb, or very high levels, but the transport risk must be weighed against the benefit, particularly with other injuries.',
      ],
    },
    {
      id: 'cn', title: 'Cyanide', core: true,
      body: [
        'Burning plastics, wool, silk and synthetic materials release hydrogen cyanide. Cyanide blocks cytochrome c oxidase, halting aerobic metabolism: cells cannot use oxygen even when it is delivered. The result is severe lactic acidosis, altered consciousness, seizures, hypotension, bradycardia and arrest. Venous blood may look bright red because tissues have stopped extracting oxygen.',
        'Suspect cyanide in a smoke-inhalation patient with altered consciousness, hypotension, or a lactate above about 8–10 mmol/L. Waiting for a cyanide level is not an option. Hydroxocobalamin 5 g IV over 15 minutes (70 mg/kg in children), repeated once if needed, binds cyanide to form cyanocobalamin, which the kidneys excrete. It turns skin and urine red and interferes with colorimetric lab tests and some co-oximetry readings, so draw bloods first if you can.',
        'Avoid the older nitrite-based kits in smoke inhalation: nitrites create methaemoglobin, which further reduces oxygen-carrying capacity in a patient already poisoned by carbon monoxide. Sodium thiosulfate is a slower adjunct.',
      ],
      table: {
        caption: 'Carbon monoxide vs cyanide',
        head: ['', 'Carbon monoxide', 'Cyanide'],
        rows: [['Source', 'Incomplete combustion', 'Burning plastics, synthetics'], ['Mechanism', 'Binds Hb (and cytochrome oxidase)', 'Blocks cytochrome oxidase'], ['SpO₂', 'Falsely normal', 'Usually normal'], ['Key lab', 'COHb by co-oximetry', 'Lactate > 8–10'], ['Treatment', '100 % O₂ (± hyperbaric)', 'Hydroxocobalamin 5 g IV']],
      },
    },
    {
      id: 'case', title: 'Transport case: the house fire',
      body: ['A 45-year-old pulled from a burning apartment: GCS 10, hoarse voice, soot in the mouth, singed eyebrows, 25 % TBSA burns. BP 86/52, SpO₂ 99 % on a non-rebreather, lactate 11, COHb 28 %. The flight to the burn centre is 70 minutes.'],
      example: { case: 'Plan.', steps: [
        'Airway: hoarseness, soot, altered consciousness and a long flight — intubate before departure with a large uncut tube; prepare a surgical airway backup.',
        'CO: SpO₂ 99 % is false; continue 100 % FiO₂ on the ventilator.',
        'Cyanide: hypotension and lactate 11 — hydroxocobalamin 5 g IV now (draw bloods first).',
        'Fluids per formula from time of injury; keep warm; urinary catheter.',
        'Hyperbaric therapy is considered at the receiving centre if available and appropriate.',
      ] },
    },
  ],
  keyPoints: [
    'Heat burns the upper airway; smoke chemicals injure the lower airway.',
    'Hoarseness and stridor mean narrowing — intubate early before long flights.',
    'Standard SpO₂ reads falsely normal in CO poisoning — use co-oximetry.',
    '100 % O₂ shortens COHb half-life to 60–90 min.',
    'Smoke inhalation with high lactate or hypotension: hydroxocobalamin; avoid nitrites.',
  ],
  pearls: ['Use a large, uncut tube.', 'Draw bloods before hydroxocobalamin.'],
  pitfalls: ['Reassurance from SpO₂ of 99 %.', 'Waiting for a cyanide level.'],
  live: [{ id: 'o2path', label: 'The oxygen pathway' }],
  questions: [
    { q: 'Thermal injury is usually confined to the upper airway because:', options: ['The lower airway is armoured', 'The upper airway dissipates heat effectively', 'Patients hold their breath', 'Smoke is cool'], answer: 1, why: 'Steam is the exception.' },
    { q: 'An indication for early intubation in inhalation injury:', options: ['Singed nasal hair alone', 'Stridor or hoarseness with deep facial burns', 'Any soot on the face', 'Cough'], answer: 1, why: 'Signs of airway narrowing.' },
    { q: 'Standard pulse oximetry in CO poisoning:', options: ['Reads low', 'Reads falsely normal', 'Is accurate', 'Fails to read'], answer: 1, why: 'Cannot distinguish COHb.' },
    { q: 'CO affinity for haemoglobin compared with oxygen:', options: ['Equal', 'About 200–250 times greater', '2 times', 'Lower'], answer: 1, why: 'Displaces oxygen.' },
    { q: 'COHb half-life on 100 % oxygen:', options: ['4–6 hours', '60–90 minutes', '5 minutes', '24 hours'], answer: 1, why: 'Faster elimination.' },
    { q: 'CO shifts the oxygen–haemoglobin curve:', options: ['Right', 'Left', 'No change', 'Down only'], answer: 1, why: 'Reduces tissue unloading.' },
    { q: 'Cyanide causes toxicity by:', options: ['Binding haemoglobin', 'Blocking cytochrome c oxidase', 'Causing bronchospasm', 'Inhibiting acetylcholinesterase'], answer: 1, why: 'Cells cannot use oxygen.' },
    { q: 'A lab finding suggesting cyanide toxicity in smoke inhalation:', options: ['Lactate > 8–10 mmol/L', 'Low glucose', 'High calcium', 'Normal lactate'], answer: 0, why: 'Anaerobic metabolism.' },
    { q: 'Adult hydroxocobalamin dose:', options: ['500 mg', '5 g IV over 15 min', '50 g', '5 mg'], answer: 1, why: 'May repeat once.' },
    { q: 'Nitrite-based cyanide kits are avoided in smoke inhalation because:', options: ['They are expensive', 'They create methaemoglobin, worsening oxygen carriage with CO', 'They are slow', 'They cause hypertension'], answer: 1, why: 'Compounding hypoxia.' },
    { q: 'Hydroxocobalamin side effect:', options: ['Blue skin', 'Red skin and urine; lab interference', 'Hypoglycaemia', 'Seizures'], answer: 1, why: 'Colour interference.' },
    { q: 'Baseline COHb in smokers can reach about:', options: ['0 %', '10 %', '40 %', '60 %'], answer: 1, why: 'Interpretation context.' },
    { q: 'Lower airway injury in smoke inhalation is mainly caused by:', options: ['Heat', 'Chemical irritants', 'Infection on day 1', 'Cold'], answer: 1, why: 'Aldehydes, acrolein, particulates.' },
    { q: 'Airway swelling after burns peaks around:', options: ['Minutes', '24–48 hours', '2 weeks', 'Never'], answer: 1, why: 'Fluid resuscitation worsens oedema.' },
    { q: 'A hyperbaric oxygen consideration in CO poisoning:', options: ['Mild headache only', 'Loss of consciousness, neurological deficits, pregnancy', 'Any smoker', 'COHb 3 %'], answer: 1, why: 'Weigh against transport risk.' },
  ],
  sources: [
    { title: 'StatPearls: Carbon monoxide toxicity', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Carbon+monoxide+toxicity+StatPearls' },
    { title: 'StatPearls: Cyanide toxicity', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Cyanide+toxicity+StatPearls' },
    { title: 'StatPearls: Inhalation injury', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Inhalation+injury+StatPearls' },
  ],
};
