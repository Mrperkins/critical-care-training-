/** FP-C VII.4–VII.6: trauma monitoring; surgical interventions; blood product administration. */
import type { FpcLesson } from '../types';

export const TRAUMA_MONITOR: FpcLesson = {
  id: 'fpc-trauma-monitor', domain: 'trauma', ref: 'VII.4',
  title: 'Monitoring the injured patient in transport',
  summary: 'What to watch and why: blood pressure and shock index, capnography as a perfusion signal, temperature, compartment and pelvic checks, chest tubes, and the limits of monitors in a moving aircraft.',
  objectives: [
    'Choose and interpret monitoring that detects ongoing haemorrhage early.',
    'Use EtCO₂, shock index and temperature as resuscitation markers.',
    'Monitor chest drains, splints, tourniquets and binders during transport.',
  ],
  sections: [
    {
      id: 'haemo', title: 'Haemodynamic monitoring', core: true,
      body: [
        'Non-invasive blood pressure cuffs are slow, fail with vibration and motion, and become unreliable at low pressures — exactly when accuracy matters. An arterial line gives beat-to-beat pressure and a waveform; in a patient already lined at the referring hospital, keep it transduced, levelled at the phlebostatic axis and zeroed after any change in altitude or position. Pulse pressure variation on an arterial trace in a ventilated patient suggests fluid (blood) responsiveness.',
        'Shock index — heart rate divided by systolic pressure — above about 1.0 suggests significant blood loss even when the systolic pressure looks acceptable. Young, fit patients compensate until late; older patients and those on beta-blockers may not mount a tachycardia at all. Trends tell more than single values: a rising heart rate and a narrowing pulse pressure across the flight are a warning.',
        'Permissive hypotension is a deliberate target in penetrating torso trauma without head injury: a systolic around 80–90 mmHg (or a palpable radial pulse and mentation) until surgical control, to avoid "popping the clot". It does not apply to traumatic brain injury, where a systolic of at least 100–110 is the aim.',
      ],
    },
    {
      id: 'etco2', title: 'Capnography, oxygenation and temperature', core: true,
      body: [
        'In an intubated patient with stable ventilation, end-tidal CO₂ reflects cardiac output: a falling EtCO₂ with no change in ventilator settings suggests falling perfusion — ongoing bleeding, tension pneumothorax, tamponade or a pulmonary embolism. An abrupt drop to near zero is tube displacement or arrest until proven otherwise. In TBI, aim for normocapnia (EtCO₂ about 35–40 mmHg, confirmed against a blood gas, as the arterial–end-tidal gap widens in shock).',
        'Pulse oximetry fails in cold, vasoconstricted, shocked patients; a poor plethysmograph is itself a sign of hypoperfusion. Try an ear or forehead probe. Carbon monoxide gives falsely normal SpO₂ readings.',
        'Measure core temperature from the start and repeatedly. Hypothermia below 35 °C worsens coagulopathy and acidosis; aircraft cabins, rotor wash, wet clothes, cold blood products and exposure for examination all drain heat. A temperature probe is as important as a blood pressure cuff in major trauma.',
      ],
    },
    {
      id: 'devices', title: 'Devices and limbs', core: true,
      body: [
        'Chest drains: record output at handover and in flight. More than 1500 mL initially, or more than about 200 mL/hour for 2–4 hours, suggests the need for thoracotomy. Check the system is patent, unclamped and below the chest; bubbling (air leak) and tidalling (swing) tell you the tube is in the pleural space. A sudden stop in drainage with deterioration may mean a clotted tube and a re-accumulating haemothorax.',
        'Tourniquets: note the time applied, check that distal bleeding and pulses have stopped, and do not loosen them in flight. Pelvic binders: confirm position over the greater trochanters, not the iliac crests. Splints: check distal pulses, sensation and capillary refill before and after every move. Compartment syndrome — pain out of proportion, pain on passive stretch, tense compartments — progresses in transport; pulses are lost late.',
        'Altitude changes the behaviour of air-filled devices: endotracheal tube cuffs, pneumatic splints and MAST garments expand on ascent. Check cuff pressures and splint tightness during climb and soften them as needed; reinflate on descent.',
      ],
      table: {
        caption: 'Monitoring targets in major trauma (adult)',
        head: ['Parameter', 'Target'],
        rows: [['SBP — penetrating torso, no TBI', '80–90 mmHg until haemorrhage control'], ['SBP — TBI', '≥ 100–110 mmHg'], ['SpO₂', '≥ 94 % (avoid hypoxia)'], ['EtCO₂ — TBI', '35–40 mmHg (check against PaCO₂)'], ['Temperature', '> 36 °C'], ['Urine output', '≥ 0.5 mL/kg/h'], ['Shock index', '< 1.0']],
      },
    },
  ],
  keyPoints: [
    'Shock index > 1.0 suggests significant haemorrhage despite a "normal" BP.',
    'Falling EtCO₂ with constant ventilation suggests falling cardiac output.',
    'Permissive hypotension for penetrating torso trauma, never for TBI.',
    'Chest tube output > 1500 mL initially or > 200 mL/h suggests thoracotomy.',
    'Measure core temperature from the start; expanding air in cuffs and splints on ascent.',
  ],
  pearls: ['A poor pleth trace is itself a perfusion sign.', 'Zero the arterial line after altitude changes.'],
  pitfalls: ['Trusting NIBP in vibration and shock.', 'Loosening a tourniquet in flight to "check".'],
  live: [{ id: 'ln-art', label: 'The arterial line' }, { id: 'ln-level', label: 'Levelling and zeroing' }, { id: 'wf-chest-tube', label: 'Chest drain workflow' }],
  questions: [
    { q: 'Shock index is calculated as:', options: ['SBP ÷ HR', 'HR ÷ SBP', 'MAP ÷ HR', 'HR × SBP'], answer: 1, why: 'Above about 1.0 is concerning.' },
    { q: 'A falling EtCO₂ with unchanged ventilation suggests:', options: ['Hyperventilation', 'Falling cardiac output', 'Improving perfusion', 'Fever'], answer: 1, why: 'CO₂ delivery to lungs drops.' },
    { q: 'Permissive hypotension is appropriate for:', options: ['Isolated TBI', 'Penetrating torso trauma without TBI', 'Spinal cord injury', 'Elderly falls'], answer: 1, why: 'Avoids disrupting clot before control.' },
    { q: 'SBP target in TBI:', options: ['70', '≥ 100–110 mmHg', '80–90', '< 90'], answer: 1, why: 'Hypotension worsens secondary injury.' },
    { q: 'Initial chest tube output suggesting thoracotomy:', options: ['200 mL', '> 1500 mL', '500 mL', 'Any blood'], answer: 1, why: 'Massive haemothorax.' },
    { q: 'Pelvic binders should sit over:', options: ['Iliac crests', 'Greater trochanters', 'Umbilicus', 'Knees'], answer: 1, why: 'Effective reduction of pelvic volume.' },
    { q: 'On ascent, ETT cuffs and air splints:', options: ['Shrink', 'Expand', 'Unchanged', 'Leak always'], answer: 1, why: 'Boyle\'s law.' },
    { q: 'An early sign of compartment syndrome:', options: ['Absent pulse', 'Pain on passive stretch', 'Pallor only', 'Paralysis'], answer: 1, why: 'Pulselessness is late.' },
    { q: 'Hypothermia threshold that worsens coagulopathy:', options: ['< 38 °C', '< 35 °C', '< 30 °C only', 'None'], answer: 1, why: 'Enzyme function falls.' },
    { q: 'Pulse oximetry in a cold, shocked patient:', options: ['Always accurate', 'Often unreliable', 'Over-reads hypoxia', 'Measures CO'], answer: 1, why: 'Poor peripheral perfusion.' },
    { q: 'Sudden cessation of chest drain output with deterioration:', options: ['Recovery', 'Possible clotted tube and re-accumulation', 'Normal', 'Air leak'], answer: 1, why: 'Check the tube.' },
    { q: 'An abrupt EtCO₂ drop to near zero:', options: ['Hyperventilation', 'Tube displacement or arrest', 'Fever', 'Sedation'], answer: 1, why: 'Check tube and pulse.' },
    { q: 'A tourniquet applied before your arrival should be:', options: ['Loosened to check bleeding', 'Left on, time noted, checked for effectiveness', 'Removed', 'Replaced with a dressing'], answer: 1, why: 'Conversion is a hospital decision.' },
    { q: 'Pulse pressure variation in a ventilated patient suggests:', options: ['Fluid responsiveness', 'Pneumothorax', 'Overload', 'Arrhythmia'], answer: 0, why: 'Preload dependence.' },
    { q: 'Urine output target in resuscitation (adult, non-burn):', options: ['0.1 mL/kg/h', '≥ 0.5 mL/kg/h', '5 mL/kg/h', 'None'], answer: 1, why: 'Marker of end-organ perfusion.' },
  ],
  sources: [
    { title: 'StatPearls: Permissive hypotension', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Permissive+hypotension+StatPearls' },
    { title: 'StatPearls: Shock index', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Shock+index+StatPearls' },
  ],
};

export const SURGICAL_INTERVENTIONS: FpcLesson = {
  id: 'fpc-trauma-surgical', domain: 'trauma', ref: 'VII.5',
  title: 'Surgical interventions: decompression, drains, escharotomy and fasciotomy',
  summary: 'Procedures a flight crew performs or must understand: needle and finger thoracostomy, chest tubes, pericardiocentesis, escharotomy and fasciotomy, REBOA, damage control surgery and resuscitative thoracotomy.',
  objectives: [
    'Recognise tension pneumothorax and decompress it correctly.',
    'Describe indications and landmarks for chest drains, escharotomy and pericardiocentesis.',
    'Explain damage control surgery and when REBOA or thoracotomy apply.',
  ],
  sections: [
    {
      id: 'decompress', title: 'Chest decompression', core: true,
      body: [
        'Tension pneumothorax is a clinical diagnosis: respiratory distress or, in ventilated patients, rising airway pressures and falling SpO₂, with hypotension, absent breath sounds on one side and, late, tracheal deviation and distended neck veins. Do not wait for imaging. In ventilated patients, positive pressure turns a simple pneumothorax into a tension quickly — after intubation, suspect it first when the patient deteriorates.',
        'Needle decompression: a long (at least 8 cm in most adults) large-bore catheter at the 4th or 5th intercostal space in the anterior or mid-axillary line, or the 2nd intercostal space mid-clavicular line. The lateral site has a thinner chest wall and lower failure rates. Needles kink, dislodge and block, so recurrence after needle decompression should prompt finger thoracostomy or a chest tube.',
        'Finger (simple) thoracostomy in ventilated patients: an incision and blunt dissection over the top of the rib in the 4th–5th space, mid-axillary line, into the pleura, sweeping with a finger. It is definitive decompression; a chest tube can follow. In spontaneously breathing patients an open thoracostomy creates an open pneumothorax, so a chest tube is placed instead.',
      ],
    },
    {
      id: 'drains', title: 'Chest tubes, pericardiocentesis and escharotomy', core: true,
      body: [
        'Chest tubes go in the "triangle of safety" — bordered by the lateral edge of pectoralis major, the anterior edge of latissimus dorsi and a line at the level of the nipple (5th intercostal space) — above the rib to avoid the neurovascular bundle. Use a large tube for haemothorax. Before flight, secure it well, connect it to a closed system or one-way valve, and never clamp it in a patient with an air leak.',
        'Pericardial tamponade after penetrating chest trauma needs surgical decompression (thoracotomy or pericardial window); needle pericardiocentesis is a temporising measure because clotted blood often will not aspirate. Under ultrasound guidance, the subxiphoid approach aims toward the left shoulder.',
        'Escharotomy releases circumferential full-thickness burns that restrict chest movement (rising airway pressures, failing ventilation) or limb perfusion. Incisions run through the eschar in the mid-lateral and mid-medial lines of limbs and, for the chest, along the anterior axillary lines joined across the costal margin. Fasciotomy, by contrast, opens the fascia for compartment syndrome and is a surgical procedure.',
      ],
    },
    {
      id: 'damage', title: 'Damage control and last-ditch interventions', core: true,
      body: [
        'Damage control surgery stops bleeding and contamination with the shortest possible operation — packing, shunts, stapling bowel — then moves to ICU for warming, correction of coagulopathy and acidosis, with definitive repair 24–48 hours later. It exists because the lethal triad kills patients during long operations. Damage control resuscitation is its partner: permissive hypotension, early balanced blood products, minimal crystalloid and TXA.',
        'REBOA (resuscitative endovascular balloon occlusion of the aorta) inflates a balloon via the femoral artery: zone I (descending thoracic aorta) for abdominal haemorrhage, zone III (infrarenal) for pelvic haemorrhage. It buys minutes at the cost of ischaemia below the balloon and is used only in specific systems.',
        'Resuscitative thoracotomy — opening the chest to relieve tamponade, cross-clamp the aorta and control bleeding — is most effective for penetrating chest trauma with recent loss of signs of life. Survival after blunt trauma arrest is very low.',
      ],
      list: { caption: 'Traumatic arrest: treat the reversible causes', items: ['Hypovolaemia — control haemorrhage, blood', 'Hypoxia — airway and ventilation', 'Tension pneumothorax — bilateral decompression', 'Tamponade — thoracotomy or pericardiocentesis'] },
    },
    {
      id: 'case', title: 'Transport case: the ventilated patient who crashes',
      body: ['A 25-year-old with left rib fractures was intubated at a rural hospital. Ten minutes into flight: peak pressure rises from 24 to 42 cmH₂O, SpO₂ falls to 82 %, BP 70/40, left breath sounds absent.'],
      example: { case: 'Act.', steps: [
        'DOPES: tube position confirmed by waveform capnography; no obstruction with suction.',
        'Tension pneumothorax on the left — needle decompression (lateral 4th–5th ICS) or finger thoracostomy.',
        'If it recurs or the needle blocks, finger thoracostomy; then a chest tube when conditions allow.',
        'Reassess pressures, SpO₂ and BP; consider bilateral decompression if a traumatic arrest follows.',
      ] },
    },
  ],
  keyPoints: [
    'Tension pneumothorax is clinical — treat without imaging.',
    'Lateral (4th–5th ICS, AAL/MAL) decompression has lower failure rates.',
    'Finger thoracostomy in ventilated patients; chest tube in spontaneously breathing.',
    'Escharotomy for circumferential full-thickness burns restricting ventilation or perfusion.',
    'Damage control: short operation, ICU correction, return later.',
  ],
  pearls: ['After intubation, deterioration = tension until proven otherwise.', 'Clotted blood in tamponade often won\'t aspirate.'],
  pitfalls: ['A needle that is too short for the chest wall.', 'Clamping a chest tube with an air leak.'],
  live: [{ id: 'vent-tension-ptx', label: 'Tension pneumothorax on the ventilator' }, { id: 'vent-needle', label: 'Needle decompression' }],
  questions: [
    { q: 'Tension pneumothorax is diagnosed:', options: ['By chest X-ray only', 'Clinically', 'By CT', 'By ABG'], answer: 1, why: 'Do not delay for imaging.' },
    { q: 'Needle decompression site with lower failure rates:', options: ['2nd ICS MCL', '4th–5th ICS anterior/mid-axillary line', '8th ICS posterior', 'Subxiphoid'], answer: 1, why: 'Thinner chest wall laterally.' },
    { q: 'Finger thoracostomy is suited to:', options: ['Spontaneously breathing patients', 'Ventilated patients', 'Children only', 'Tamponade'], answer: 1, why: 'Positive pressure keeps lung inflated.' },
    { q: 'Chest tubes enter:', options: ['Below the rib', 'Above the rib', 'Through the rib', 'At the nipple medially'], answer: 1, why: 'Avoid the neurovascular bundle.' },
    { q: 'The triangle of safety lies between:', options: ['Sternum and clavicle', 'Pectoralis major, latissimus dorsi, and the 5th ICS line', 'Scapula and spine', 'Diaphragm and liver'], answer: 1, why: 'Landmarks for drains.' },
    { q: 'Definitive treatment for traumatic tamponade:', options: ['Fluids', 'Surgical decompression', 'Diuretics', 'Pericardiocentesis alone always'], answer: 1, why: 'Clotted blood may not aspirate.' },
    { q: 'Escharotomy is indicated for:', options: ['Superficial burns', 'Circumferential full-thickness burns restricting ventilation or perfusion', 'Partial burns of the face', 'Any burn > 10 %'], answer: 1, why: 'Releases constriction.' },
    { q: 'Damage control surgery aims to:', options: ['Complete all repairs', 'Control bleeding and contamination briefly, then correct physiology', 'Avoid surgery', 'Delay all care'], answer: 1, why: 'Avoid the lethal triad.' },
    { q: 'REBOA zone III occlusion targets:', options: ['Abdominal bleeding', 'Pelvic haemorrhage', 'Head injury', 'Chest bleeding'], answer: 1, why: 'Infrarenal aorta.' },
    { q: 'Resuscitative thoracotomy is most effective in:', options: ['Blunt arrest > 15 min', 'Penetrating chest trauma with recent loss of signs of life', 'Isolated TBI', 'Burns'], answer: 1, why: 'Highest survival.' },
    { q: 'A recurrent tension after needle decompression:', options: ['Repeat needle forever', 'Proceed to finger thoracostomy or chest tube', 'Ignore', 'Clamp'], answer: 1, why: 'Needles block and dislodge.' },
    { q: 'Compartment syndrome treatment:', options: ['Escharotomy', 'Fasciotomy', 'Elevation alone', 'Ice'], answer: 1, why: 'Opens the fascia.' },
    { q: 'In traumatic arrest, the reversible causes prioritised are:', options: ['Hypoglycaemia', 'Hypovolaemia, hypoxia, tension, tamponade', 'Hyperkalaemia', 'Toxins'], answer: 1, why: 'Treat these first.' },
    { q: 'Damage control resuscitation includes:', options: ['High-volume crystalloid', 'Permissive hypotension, early balanced blood, TXA', 'Vasopressors first', 'Delay transfusion'], answer: 1, why: 'Partner to damage control surgery.' },
    { q: 'Minimum needle length for adult decompression (commonly cited):', options: ['2.5 cm', '≥ 8 cm', '1 cm', '20 cm'], answer: 1, why: 'Shorter needles often fail.' },
  ],
  sources: [
    { title: 'StatPearls: Tension pneumothorax', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Tension+pneumothorax+StatPearls' },
    { title: 'StatPearls: Escharotomy', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Escharotomy+StatPearls' },
    { title: 'StatPearls: Damage control resuscitation', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Damage+control+resuscitation+StatPearls' },
  ],
};

export const TRAUMA_BLOOD: FpcLesson = {
  id: 'fpc-trauma-blood', domain: 'trauma', ref: 'VII.6',
  title: 'Blood product administration and massive transfusion',
  summary: 'Prehospital blood, whole blood, balanced 1:1:1 resuscitation, massive transfusion protocols, warming, compatibility and transfusion reactions in the injured patient.',
  objectives: [
    'Describe balanced resuscitation and the evidence behind it.',
    'Activate and run a massive transfusion protocol in transport.',
    'Recognise and manage transfusion complications.',
  ],
  sections: [
    {
      id: 'balanced', title: 'Balanced resuscitation', core: true,
      body: [
        'Haemorrhaging patients lose whole blood, and replacing it with crystalloid dilutes clotting factors, platelets and oxygen-carrying capacity while worsening acidosis and hypothermia. Damage control resuscitation replaces like with like: red cells, plasma and platelets in roughly 1:1:1 ratio, or low-titre group O whole blood where available. Crystalloid is minimised.',
        'The PROPPR trial compared 1:1:1 with 1:1:2 ratios; there was no difference in 24-hour or 30-day mortality, but more patients achieved haemostasis and fewer died from exsanguination in the first 24 hours in the 1:1:1 group. The PAMPer trial found that prehospital plasma during air medical transport reduced 30-day mortality in patients at risk of haemorrhagic shock, and later analyses suggest prehospital red cells with plasma may be most beneficial.',
        'Whole blood — low-titre group O (with low anti-A and anti-B titres) — provides all components in one bag, is used increasingly by civilian air services and the military, and simplifies logistics in an aircraft.',
      ],
    },
    {
      id: 'mtp', title: 'Massive transfusion protocols', core: true,
      body: [
        'Massive transfusion is often defined as 10 or more units of red cells in 24 hours, or more than 3–4 units in an hour. Prediction scores trigger the protocol early: the ABC score gives one point each for penetrating mechanism, SBP ≤ 90, HR ≥ 120 and positive FAST — two or more predicts massive transfusion. Shock index above 1.0 is also used.',
        'In flight: use group O red cells (O-negative for women of childbearing age where supply allows; O-positive is acceptable for men and for older women), group AB or low-titre A plasma, and warm every product with an inline fluid warmer. Give calcium early. Document unit numbers, times and vital signs; the blood bank needs the paperwork back.',
        'Pressure infusers and rapid infusers speed delivery. Use large-bore peripheral access or intraosseous access (humeral IO is faster than tibial); flow through IO is slower than through a large peripheral cannula.',
      ],
      table: {
        caption: 'Product compatibility for emergency release',
        head: ['Product', 'Universal donor', 'Notes'],
        rows: [['Red cells', 'O (O-negative for childbearing females)', 'Recipient plasma antibodies matter less in emergency'], ['Plasma', 'AB (or low-titre A)', 'Donor plasma antibodies matter'], ['Platelets', 'Any group, ideally type-specific', 'Stored warm, short shelf life'], ['Cryoprecipitate', 'Any group', 'Fibrinogen, factor VIII, vWF'], ['Whole blood', 'Low-titre group O', 'All components in one']],
      },
    },
    {
      id: 'reactions', title: 'Transfusion complications', core: true,
      body: [
        'Acute haemolytic reaction (ABO incompatibility): fever, hypotension, back or chest pain, haemoglobinuria and DIC — stop the transfusion, support circulation and send the bag back. Febrile non-haemolytic reactions are common and benign but are diagnosed only after excluding haemolysis and sepsis. Allergic reactions range from urticaria (antihistamine; may continue) to anaphylaxis (stop; epinephrine).',
        'Transfusion-related acute lung injury (TRALI) presents within 6 hours as non-cardiogenic pulmonary oedema with hypoxia and often hypotension; transfusion-associated circulatory overload (TACO) presents as cardiogenic oedema with hypertension in patients with poor cardiac reserve. Massive transfusion also brings hypothermia, hypocalcaemia, hyperkalaemia and dilutional coagulopathy.',
      ],
    },
  ],
  keyPoints: [
    'Replace whole blood loss with balanced products or whole blood; minimise crystalloid.',
    'PROPPR: 1:1:1 improved haemostasis and early exsanguination deaths.',
    'PAMPer: prehospital plasma in air transport reduced 30-day mortality.',
    'ABC score ≥ 2 predicts massive transfusion.',
    'O red cells, AB plasma; warm everything; give calcium; document units.',
  ],
  pearls: ['Low-titre group O whole blood simplifies aircraft logistics.', 'Humeral IO flows faster than tibial.'],
  pitfalls: ['Crystalloid "bridging" until blood arrives.', 'Cold products straight from the cooler.'],
  live: [{ id: 'lines-haemorrhage-transfusion', label: 'Haemorrhage and transfusion' }, { id: 'wf-blood', label: 'Giving blood: workflow' }, { id: 'moa-calcium', label: 'Calcium: mechanism' }],
  questions: [
    { q: 'Balanced resuscitation targets a ratio of plasma:platelets:red cells of about:', options: ['1:1:1', '1:4:10', '0:0:1', '3:1:1'], answer: 0, why: 'Replaces whole blood.' },
    { q: 'PROPPR showed 1:1:1 compared with 1:1:2:', options: ['Higher 30-day mortality', 'Better haemostasis and fewer early exsanguination deaths', 'More TRALI', 'No difference in anything'], answer: 1, why: '24-h exsanguination reduced.' },
    { q: 'PAMPer studied:', options: ['Prehospital plasma in air transport', 'TXA', 'Whole blood in children', 'Crystalloid'], answer: 0, why: 'Reduced 30-day mortality.' },
    { q: 'Universal donor plasma:', options: ['O', 'AB', 'A only', 'B'], answer: 1, why: 'No anti-A or anti-B.' },
    { q: 'ABC score components include:', options: ['Age, BP, GCS', 'Penetrating mechanism, SBP ≤ 90, HR ≥ 120, positive FAST', 'Lactate, Hb, INR', 'Temperature, RR, SpO₂'], answer: 1, why: '≥ 2 predicts MT.' },
    { q: 'Massive transfusion is often defined as:', options: ['2 units in 24 h', '≥ 10 units red cells in 24 h', '1 unit/h', '20 units in a week'], answer: 1, why: 'Common definition.' },
    { q: 'O-negative red cells are prioritised for:', options: ['Older men', 'Women of childbearing age', 'Children only', 'Everyone always'], answer: 1, why: 'Prevent Rh sensitisation.' },
    { q: 'TRALI presents as:', options: ['Hypertension and cardiogenic oedema', 'Non-cardiogenic pulmonary oedema within 6 h', 'Rash only', 'Hyperkalaemia'], answer: 1, why: 'Antibody-mediated lung injury.' },
    { q: 'TACO differs from TRALI by:', options: ['Hypertension and volume overload', 'Fever', 'Hypotension', 'Occurring only with platelets'], answer: 0, why: 'Cardiogenic.' },
    { q: 'First step in a suspected acute haemolytic reaction:', options: ['Slow the rate', 'Stop the transfusion', 'Give more blood', 'Antihistamine only'], answer: 1, why: 'Stop exposure.' },
    { q: 'Cryoprecipitate provides mainly:', options: ['Red cells', 'Fibrinogen, factor VIII, vWF', 'Platelets', 'Albumin'], answer: 1, why: 'Concentrated factors.' },
    { q: 'Blood products in flight should be:', options: ['Given cold', 'Warmed inline', 'Diluted with saline', 'Given via pressure only'], answer: 1, why: 'Prevent hypothermia.' },
    { q: 'Platelets are stored:', options: ['Frozen', 'At room temperature with agitation', 'Refrigerated', 'Dried'], answer: 1, why: 'Short shelf life.' },
    { q: 'Low-titre group O whole blood:', options: ['Contains only plasma', 'Provides all components in one unit', 'Requires crossmatch', 'Is never used civilianly'], answer: 1, why: 'Increasingly used by air services.' },
    { q: 'A complication of massive transfusion:', options: ['Hypercalcaemia', 'Hypocalcaemia', 'Hypothermia never', 'Thrombocytosis'], answer: 1, why: 'Citrate binding.' },
  ],
  sources: [
    { title: 'PROPPR trial. JAMA (2015)', url: 'https://pubmed.ncbi.nlm.nih.gov/25647203/' },
    { title: 'PAMPer trial. NEJM (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/30044935/' },
    { title: 'StatPearls: Massive transfusion', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Massive+transfusion+StatPearls' },
  ],
};
