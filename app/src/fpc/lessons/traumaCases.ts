/** Domain VII extensions: extra teaching sections and cases that bring each full course to 15–25 minutes. */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };
const S = (id: string, title: string, body: string[], example?: Section['example']): Section => ({ id, title, body, example });

export const TRAUMA_EXTRAS: Record<string, Extra> = {
  'fpc-trauma-dx': { questions: [], sections: [S('special', 'Populations the primary survey misreads', [
    'Older adults compensate poorly and hide shock. A systolic of 110 in a 75-year-old may be hypotension for that patient, beta-blockers blunt tachycardia, and anticoagulants turn minor falls into major bleeds. Many field triage guidelines treat a systolic below 110 in patients over 65 as a physiological trigger, and ground-level falls in anticoagulated elders as a reason for trauma-centre evaluation.',
    'Children maintain blood pressure until they have lost a large share of their circulating volume, then decompensate abruptly; tachycardia, delayed capillary refill and altered mentation are the earlier signs. Pregnant patients have a physiological rise in heart rate and fall in blood pressure, an expanded blood volume that masks loss, and a uterus that compresses the vena cava when supine after about 20 weeks — tilt or manually displace the uterus to the left. The fetus is often the first to show maternal shock.',
    'Penetrating injuries hide their trajectory. A small wound in the chest below the nipple line may involve the abdomen; a wound in the "box" (between the nipples, clavicles and costal margins) threatens the heart. Log-roll and examine the back, axillae, perineum and scalp — injuries missed in the primary survey are found there.',
  ], { case: 'A 79-year-old on a beta-blocker and warfarin, struck as a pedestrian: HR 76, BP 112/70, GCS 15, left chest wall pain.', steps: [
    'A "normal" heart rate and pressure may be shock in this patient; shock index alone is unreliable with beta-blockade.',
    'eFAST, lactate and INR if available; anticipate rib fractures with pulmonary contusion and delayed deterioration.',
    'Trauma-centre destination; consider reversal for active bleeding; analgesia to allow effective breathing.',
  ] })] },
  'fpc-trauma-labs': { questions: [], sections: [S('poc', 'Point-of-care testing in the aircraft', [
    'Handheld analysers give blood gases, lactate, electrolytes, ionised calcium and haemoglobin in minutes and are carried by many air services. Use them to answer specific questions: is the base deficit worsening (ongoing bleeding), is the ionised calcium falling (more calcium), is the potassium rising (crush, massive transfusion), and is the glucose dangerous in a head injury?',
    'Point-of-care INR devices are designed for warfarin monitoring and are unreliable in trauma-induced coagulopathy; a normal result does not exclude coagulopathy. Analysers have operating temperature and altitude limits and need quality control; low cabin temperatures and pressure changes can produce errors. Document the time of every sample relative to products given — a haemoglobin after three units of blood means something different from one before.',
    'Trends beat single values. A lactate that falls from 7 to 4 over an hour of resuscitation is reassuring even though it is still raised; a lactate that climbs while the blood pressure looks stable means the patient is still bleeding.',
  ])] },
  'fpc-trauma-pharm': { questions: [], sections: [S('case', 'Transport case: the trapped motorcyclist', [
    'A 30-year-old motorcyclist with an open tibial fracture and a deformed femur, trapped for 40 minutes. HR 118, BP 98/60, GCS 15, screaming in pain. Injury occurred 70 minutes ago.',
    'This patient needs analgesia that does not drop the pressure, TXA inside the time window, antibiotics for the open fracture, and a plan for sedation if the airway must be secured.',
  ], { case: 'Choose the drugs.', steps: [
    'TXA 1 g IV over 10 minutes now (70 minutes after injury — within 3 hours), then infusion; document the times.',
    'Analgesia: ketamine 0.1–0.3 mg/kg IV, or fentanyl in small titrated doses; avoid morphine boluses in a patient with borderline pressure.',
    'Cefazolin IV for the open fracture as early as possible; tetanus status noted for the receiving team.',
    'If intubation becomes necessary: blood first, reduced-dose ketamine, full-dose rocuronium.',
  ] })] },
  'fpc-trauma-monitor': { questions: [], sections: [S('case', 'Transport case: the quiet deterioration', [
    'A 22-year-old with a stab wound to the left upper abdomen, intubated at the referring hospital. At departure: HR 104, BP 104/68 (arterial line), EtCO₂ 36 mmHg, temperature 35.8 °C. Thirty minutes later: HR 122, BP 96/70, EtCO₂ 27 mmHg, same ventilator settings, temperature 35.1 °C.',
    'Every number has moved in the same direction: rising heart rate, narrowing pulse pressure (34 down to 26), a falling EtCO₂ with unchanged ventilation, and cooling. The systolic is still above 90, but the trends say he is bleeding.',
  ], { case: 'Act on the trends.', steps: [
    'Shock index has risen from 1.0 to 1.27; treat as ongoing haemorrhage.',
    'Blood products warmed inline; TXA if not given and within 3 hours; calcium.',
    'Active warming; check the abdomen and repeat eFAST if feasible.',
    'Pre-alert the receiving centre for direct transfer to theatre.',
  ] })] },
  'fpc-trauma-surgical': { questions: [], sections: [S('aftercare', 'Caring for procedures in flight', [
    'Every procedure creates something to monitor. After needle decompression, mark the time and site, and reassess breath sounds, airway pressures and blood pressure every few minutes; catheters kink when the patient is moved onto the stretcher. After finger thoracostomy, cover the wound with a loose dressing in ventilated patients and re-sweep with a sterile gloved finger if the patient deteriorates again.',
    'Chest drains: keep the collection system below the chest and upright, secure it to the stretcher, and never clamp it during transport. Heimlich (one-way flutter) valves are useful in aircraft because they do not depend on a water seal staying upright, but they can clog with blood in a haemothorax.',
    'Escharotomy and fasciotomy wounds bleed; dress them and include them in your blood-loss estimate. After any procedure, check distal perfusion, document what was done and by whom, and hand over the exact device sizes and positions.',
  ])] },
  'fpc-trauma-blood': { questions: [], sections: [S('logistics', 'Carrying blood on an aircraft', [
    'Blood products carried on aircraft live in validated coolers that hold red cells and plasma between 1 and 6 °C for a defined time; temperature loggers prove the cold chain, and products outside range are returned and discarded rather than given. Units rotate back to the blood bank before expiry so that nothing is wasted — air services and hospital blood banks agree this in a written policy.',
    'Before giving any unit, two crew members check the product, unit number, expiry date and group against the documentation. In the emergency release setting the patient\'s identity may be unknown; use the trauma alias and band the patient so that later samples can be matched. Draw a pre-transfusion sample (group and screen) before the first unit where possible, because transfused group O cells make later grouping harder.',
    'Plasma must be thawed in advance (liquid or pre-thawed plasma lasts about 5 days refrigerated), and platelets need room-temperature storage with agitation, which is why few aircraft carry them. Freeze-dried plasma and fibrinogen concentrate are stable at room temperature and are used by some military and civilian services.',
  ]), S('case', 'Transport case: running a massive transfusion in the air', [
    'A 41-year-old with a gunshot wound to the pelvis: HR 140, BP 72/40, positive FAST. The aircraft carries two units of low-titre O whole blood, two units of O-positive red cells and two units of thawed plasma.',
    'ABC score: penetrating (1), SBP ≤ 90 (1), HR ≥ 120 (1), positive FAST (1) = 4. Massive transfusion is likely; activate the receiving centre\'s protocol from the air.',
  ], { case: 'Sequence the products.', steps: [
    'Whole blood first through a warmer by pressure infuser; then red cells and plasma together at 1:1.',
    'Calcium after the first two units, then per protocol; TXA if within 3 hours.',
    'Target a systolic around 80–90 (penetrating, no TBI) or a radial pulse and mentation — not a normal pressure.',
    'Record unit numbers and times; request products to meet the aircraft; plan for direct transfer to theatre or interventional radiology.',
  ] })] },
  'fpc-lethal-triad': { questions: [], sections: [S('monitor', 'Measuring the triad in transport', [
    'You cannot treat what you do not measure. Core temperature is best measured by an oesophageal probe in intubated patients or a bladder probe; tympanic infrared thermometers read low in cold, windy conditions, and skin temperature tells you little. Record temperature at departure, every 15 minutes in flight and at handover.',
    'Acidosis is tracked with lactate and base deficit on a point-of-care analyser, and indirectly by EtCO₂ trends. Coagulopathy is harder to measure in the air; anticipate it from the mechanism, the volume of crystalloid already given, the temperature and the pH, and treat empirically with plasma and fibrinogen rather than waiting for laboratory confirmation.',
    'Handover should state each corner explicitly: temperature, pH or base deficit, products and volumes given, calcium given, TXA time, and the last ionised calcium. Receiving teams often lose track of what was given before arrival.',
  ])] },
  'fpc-burn-fluids': { questions: [], sections: [S('case', 'Transport case: the referring hospital\'s estimate', [
    'A 30 kg child scalded 3 hours ago. The referring hospital reports 35 % TBSA and has given 1.5 L of normal saline. On your examination, much of the area is superficial erythema; partial- and full-thickness burns cover the front of the trunk and the right arm (about 18 % + 9 % = 27 %).',
    'Recalculating matters. At 3 mL/kg/%TBSA: 3 × 30 × 27 = 2430 mL over 24 hours, 1215 mL in the first 8 hours from injury. The child has already received 1500 mL — more than the first-half volume — so the rate should drop to maintenance plus titration to urine output, not continue at the referring rate.',
  ], { case: 'What do you set up?', steps: [
    'Switch to lactated Ringer\'s; add maintenance fluid with dextrose for a child of this size.',
    'Urinary catheter; target 1 mL/kg/h (about 30 mL/h).',
    'Adjust the rate hourly by 20–30 % toward the target; watch for fluid creep (abdominal distension, rising airway pressures).',
    'Keep warm; analgesia; hand over the corrected TBSA and total volumes.',
  ] })] },
  'fpc-burns': { questions: [], sections: [S('case', 'Transport case: the high-voltage line worker', [
    'A 35-year-old line worker contacted a 13 000 V line and fell 4 metres. Small charred wounds on the right hand and left foot; GCS 15; HR 110 with frequent ectopics; dark brown urine in the catheter bag. The right forearm is tense and painful on passive finger extension.',
    'The skin wounds are small, but the current passed hand to foot through muscle and possibly the heart. The fall adds spinal and blunt injury risk.',
  ], { case: 'Manage.', steps: [
    'Continuous ECG; treat arrhythmias per ACLS; a 12-lead before departure.',
    'Spinal motion restriction given the fall; full trauma survey.',
    'Fluids for myoglobinuria at 4 mL/kg/%TBSA as a start, titrated to urine output of 1–1.5 mL/kg/h until the urine clears.',
    'Suspected forearm compartment syndrome — notify the burn surgeon for fasciotomy; elevate to heart level, not above.',
    'Check potassium; avoid succinylcholine if rhabdomyolysis or hyperkalaemia is suspected.',
  ] })] },
  'fpc-toxic-inhalation': { questions: [], sections: [S('vent', 'Ventilating the smoke-injured lung', [
    'Inhalation injury produces bronchospasm, mucus plugging, casts of sloughed mucosa and, over hours, ARDS. Use lung-protective ventilation (tidal volumes around 6–8 mL/kg of predicted body weight, plateau pressure under 30 cmH₂O) with enough PEEP to keep alveoli open, and keep FiO₂ at 100 % until carbon monoxide has cleared.',
    'Rising peak pressures with a normal plateau suggest airway resistance — bronchospasm, secretions or a cast in the tube: suction, give bronchodilators, and consider tube obstruction. Rising peak and plateau pressures suggest stiff lungs, pneumothorax or a tight circumferential chest burn that needs escharotomy.',
    'Nebulised heparin and N-acetylcysteine are used in some burn centres to reduce cast formation, but evidence is mixed and they are a receiving-centre decision. In transport, the priorities are a secure large tube, suction, bronchodilators and careful pressure monitoring.',
  ])] },
};
