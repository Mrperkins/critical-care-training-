/** Domain IV extensions: transport cases and extra teaching sections that bring each full course to 15–25 minutes. */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };

export const MEDICAL_EXTRAS: Record<string, Extra> = {
  'fpc-adrenal': { questions: [], sections: [{
    id: 'stress', title: 'Stress dosing and who is at risk',
    body: [
      'Anyone taking the equivalent of prednisone 5 mg a day or more for longer than about three to four weeks in the past year may have a suppressed hypothalamic–pituitary–adrenal axis. So may patients using high-dose inhaled or topical steroids, those with known Addison\'s disease or pituitary disease, and those recently given etomidate repeatedly. In serious illness, trauma, or before surgery they need stress-dose steroids.',
      'Practical doses in transport: hydrocortisone 100 mg IV or IM for crisis or serious illness, followed in hospital by 200 mg per day (by infusion or divided doses). Children receive weight- or body-surface-based doses per protocol. Many patients carry an emergency card and a hydrocortisone injection kit; use the patient\'s own supply if needed and record the time given.',
      'Clues that a shocked patient may have adrenal insufficiency: poor response to fluids and vasopressors, hypoglycaemia, hyponatraemia, hyperkalaemia (primary), eosinophilia, vomiting and abdominal pain, a history of steroid use, or hyperpigmentation. When in doubt in refractory shock, hydrocortisone is low-risk and potentially life-saving.',
    ],
  }] },
  'fpc-renal': { questions: [], sections: [{
    id: 'case', title: 'Transport case: the crush injury',
    body: ['A construction worker trapped under a collapsed wall for five hours. Legs swollen and tense, HR 118, BP 104/66. Extrication is imminent.'],
    example: { case: 'What do you do before and after release?', steps: [
      'Before release: IV or IO access and isotonic fluid (commonly 1–1.5 L/h in adults per protocol) to dilute released potassium and myoglobin.',
      'Cardiac monitoring; calcium and insulin–dextrose ready for hyperkalaemia; consider tourniquets only per protocol for uncontrolled haemorrhage.',
      'After release: watch for sudden hypotension, arrhythmia (peaked T, wide QRS) and acidosis; treat hyperkalaemia immediately with calcium.',
      'Avoid succinylcholine; target high urine output once catheterised; watch for compartment syndrome in the limbs.',
      'Transport to a centre with dialysis capability.',
    ] },
  }] },
  'fpc-sepsis': { questions: [], sections: [{
    id: 'transport', title: 'Keeping the bundle going in flight',
    body: [
      'Transport is not a pause in sepsis care. Make sure the first antibiotic dose has been given and note the time; if the flight is long and a second dose falls due, carry it. Keep fluids and vasopressors on pumps, and bring enough of each for the flight plus a reserve.',
      'Reassess perfusion at regular intervals: MAP, heart rate, mental status, capillary refill and, where measured, urine output and lactate. Escalate norepinephrine and add vasopressin per protocol if MAP falls; consider hydrocortisone for escalating requirements.',
      'Hand over the timeline clearly: when sepsis was recognised, cultures taken, antibiotics given, the fluid volume received, the vasopressor course, and the suspected source with any source-control plan.',
    ],
  }, {
    id: 'special', title: 'Sepsis in special populations',
    body: [
      'Older adults may present with confusion, falls or hypothermia rather than fever. Immunocompromised patients — chemotherapy, transplant, high-dose steroids — may have few signs; neutropenic fever is treated as an emergency with immediate broad-spectrum antibiotics. Pregnant women have physiologically higher heart rates and lower blood pressures, which can mask early sepsis; obstetric sources (endometritis, chorioamnionitis) are common.',
      'Children compensate with tachycardia and vasoconstriction; hypotension appears late. Paediatric fluid boluses are 10–20 mL/kg with reassessment after each, and epinephrine or norepinephrine is chosen by clinical phenotype (cold versus warm shock). Neonates may show apnoea, poor feeding or temperature instability.',
      'Asplenic patients are at risk of overwhelming post-splenectomy infection with encapsulated organisms; they deteriorate rapidly and need immediate antibiotics.',
    ],
  }] },
  'fpc-infectious': { questions: [], sections: [{
    id: 'decon', title: 'Cleaning the aircraft and equipment',
    body: [
      'After a transport, clean all surfaces the patient or crew touched with a hospital-grade disinfectant, respecting the product\'s contact time. For C. difficile and other spore-forming organisms, use a sporicidal (bleach-based) product. Single-use items go to clinical waste; reusable equipment (laryngoscope handles, monitor cables, stretcher mattresses) follows the manufacturer\'s decontamination process.',
      'For airborne pathogens, the aircraft\'s air exchange rate determines how long to leave doors open or ventilation running before the next patient; follow programme policy. Crew should remove PPE in a defined order to avoid self-contamination — usually gloves first, then gown, then eye protection, then respirator, with hand hygiene between steps.',
      'Document exposures and decontamination steps. A clear process protects the next patient and the crew.',
    ],
  }] },
  'fpc-blood': { questions: [], sections: [{
    id: 'equipment', title: 'Running blood in transport',
    body: [
      'Blood is stored in validated coolers that hold 1–6 °C for a defined time; record the temperature and time out of storage, and return unused units per protocol. Inspect each unit for leaks, clots or discolouration, and check the label and expiry. Two-person verification of patient identity is the main defence against ABO-incompatible transfusion, even in emergencies.',
      'Use a filtered blood administration set, a fluid warmer for rapid transfusion, and a pressure infuser for haemorrhage. Do not run blood with dextrose or lactated Ringer\'s in the same line unless the protocol permits — calcium in LR can clot citrated blood, and dextrose can haemolyse cells. Normal saline is compatible.',
      'Document unit numbers, start and stop times, volumes and any reaction. Blood products are traceable to donors; good records protect patients.',
    ],
  }] },
  'fpc-gi': { questions: [], sections: [{
    id: 'scores', title: 'Risk scores and destination',
    body: [
      'The Glasgow–Blatchford score uses BUN, haemoglobin, systolic pressure, pulse, melaena, syncope, liver disease and heart failure to estimate the need for intervention in upper GI bleeding; a score of zero or one identifies very low-risk patients, while high scores indicate need for urgent endoscopy and possibly transfusion. You will not usually calculate it in flight, but its components are the same red flags you assess.',
      'Destination matters: active haemorrhage needs a centre with immediate endoscopy, interventional radiology and surgery. Variceal bleeding may need TIPS (transjugular intrahepatic portosystemic shunt) capability. Pre-alert early so the receiving team can prepare blood and procedures.',
    ],
  }, {
    id: 'case', title: 'Transport case: the anticoagulated older man',
    body: ['An 81-year-old on apixaban for atrial fibrillation, three episodes of melaena, light-headed: HR 108 (on a beta-blocker), BP 96/58, Hb 7.9, BUN 58, creatinine 1.1.'],
    example: { case: 'Interpret and act.', steps: [
      'A high BUN:creatinine ratio (≈ 53) supports an upper GI source; the beta-blocker blunts his tachycardia, so the haemodynamic picture may be worse than it looks.',
      'Resuscitate with blood products to restore perfusion; restrictive target if stable.',
      'Discuss reversal of apixaban per protocol (andexanet alfa or PCC) for life-threatening bleeding.',
      'PPI per protocol; NPO; large-bore access; head up with suction ready.',
      'Destination: a centre with endoscopy available now.',
    ] },
  }] },
  'fpc-labs': { questions: [], sections: [{
    id: 'gas', title: 'Reading a blood gas at the bedside',
    body: [
      'Arterial samples judge oxygenation and acid–base; venous samples are adequate for pH, bicarbonate, lactate and electrolytes in most stable patients (venous pH about 0.03 lower, PCO₂ about 5 mmHg higher). Venous PO₂ does not measure lung oxygenation.',
      'Calculate the P/F ratio (PaO₂ ÷ FiO₂) to grade hypoxaemia: below 300 indicates impaired oxygenation, and in ARDS, 200–300 is mild, 100–200 moderate and below 100 severe. Calculate the A–a gradient (PAO₂ − PaO₂; normal roughly age/4 + 4 on room air) to separate hypoventilation (normal gradient) from lung disease (widened gradient).',
      'Base excess (normal −2 to +2) summarises the metabolic component; a large negative base deficit in trauma reflects shock and predicts transfusion needs. Point-of-care analysers give results in minutes and are increasingly carried by transport teams.',
    ],
  }] },
  'fpc-adv-assess': { questions: [], sections: [{
    id: 'case', title: 'Transport case: undifferentiated shock',
    body: ['A 59-year-old found confused at home: BP 80/50, HR 124, RR 28, SpO₂ 92 %, warm extremities, temperature 38.9 °C, lactate 4.8. A 25-minute flight.'],
    example: { case: 'Work it through.', steps: [
      'Primary survey: airway patent; breathing tachypnoeic; circulation shocked; GCS 13; glucose normal.',
      'Warm extremities and fever suggest distributive (septic) shock; check skin for rashes and a source (urine, lungs, skin).',
      'POCUS: hyperdynamic LV, small collapsible IVC, no effusion — consistent with distributive shock and hypovolaemia.',
      'Treat: antibiotics, cultures if quick, fluids with reassessment, norepinephrine for MAP < 65.',
      'Reassess in flight: mentation, capillary refill, MAP, EtCO₂ trend; hand over with a structured report.',
    ] },
  }, {
    id: 'neuro', title: 'Focused neurological and abdominal assessment',
    body: [
      'In altered patients, document the GCS by component (eye, verbal, motor), pupil size and reactivity, and lateralising signs. A falling motor score is the most important trend. Check glucose early in every altered patient.',
      'The abdomen in critical illness: distension, peritonism, a pulsatile mass, flank bruising (retroperitoneal haemorrhage) and bladder size. A distended abdomen with rising airway pressures and falling urine output suggests abdominal compartment syndrome; bladder pressure above about 20 mmHg with new organ dysfunction confirms it.',
    ],
  }] },
  'fpc-treatment': { questions: [], sections: [{
    id: 'push', title: 'Push-dose vasopressors',
    body: [
      'Push-dose vasopressors bridge brief hypotension — post-induction, during sedation, or while an infusion is prepared. Phenylephrine is commonly prepared at 100 mcg/mL and given in 50–200 mcg boluses; dilute epinephrine is prepared at 10 mcg/mL (for example 1 mL of 0.1 mg/mL epinephrine added to 9 mL of saline) and given in 5–20 mcg boluses. Preparation errors are a recognised hazard: use standard recipes, label syringes clearly, and double-check.',
      'Push-dose pressors are a bridge, not a treatment plan. If repeated boluses are needed, start an infusion and treat the cause — volume, haemorrhage, sepsis, or the induction agent.',
    ],
  }, {
    id: 'sedation', title: 'Sedation and analgesia infusions',
    body: [
      'Ventilated patients need analgesia first, then sedation titrated to a target such as a Richmond Agitation–Sedation Scale (RASS) of −1 to −2 for most, deeper (−4 to −5) when paralysed or for raised ICP. Common infusions: fentanyl 25–200 mcg/h, propofol 5–50 mcg/kg/min (watch blood pressure and triglycerides on prolonged use), midazolam 1–10 mg/h (accumulates in renal and hepatic failure), ketamine 0.5–2 mg/kg/h (haemodynamically supportive), and dexmedetomidine 0.2–1.5 mcg/kg/h (bradycardia and hypotension; little respiratory depression).',
      'Paralysed patients must be deeply sedated; check that sedation infusions are running before any redose of a paralytic. In flight, stimuli are greater and patients may need more; reassess at regular intervals and before landing and transfer.',
    ],
  }] },
  'fpc-radiology': { questions: [], sections: [{
    id: 'case2', title: 'Transport case: two films, two decisions',
    body: ['Two patients are ready for transfer. Patient A, after a fall: supine film with a deep, lucent left costophrenic angle and subcutaneous emphysema. Patient B, with sepsis: bilateral peripheral opacities, normal heart size, ETT tip at the level of the clavicles, central line tip in the right atrium deep.'],
    example: { case: 'What do you change before flight?', steps: [
      'A: deep sulcus sign suggests an anterior pneumothorax; with subcutaneous emphysema and a planned flight (and likely positive pressure), drain before departure per programme policy.',
      'B: the ETT is well placed; the opacities fit ARDS. A central line deep in the right atrium can cause arrhythmia; withdraw it to the cavo-atrial junction per protocol before moving.',
      'Both: document findings and send images with the patient.',
    ] },
  }, {
    id: 'ultrasound', title: 'Ultrasound images you will be shown',
    body: [
      'Bedside ultrasound images increasingly travel with the patient. Recognise the key findings: a pericardial effusion as a black stripe around the heart (with right ventricular diastolic collapse in tamponade); free fluid in Morison\'s pouch on a FAST; absent lung sliding and a barcode M-mode in pneumothorax; B-lines in interstitial oedema; and an abdominal aorta wider than 3 cm.',
      'Ultrasound is operator-dependent; record who performed it and when, and repeat if the patient changes. A negative FAST does not rule out haemorrhage, particularly retroperitoneal.',
    ],
  }] },
  'fpc-resp-sys': { questions: [], sections: [{
    id: 'co2', title: 'Carbon dioxide transport',
    body: [
      'CO₂ travels in three forms: about 70 % as bicarbonate (formed in red cells by carbonic anhydrase), about 20–23 % bound to haemoglobin as carbamino compounds, and 7–10 % dissolved. Deoxygenated haemoglobin carries more CO₂ (the Haldane effect), which helps load CO₂ in the tissues and unload it in the lungs.',
      'Giving high-flow oxygen to some patients with chronic CO₂ retention can raise PaCO₂ through the Haldane effect, worsened V/Q matching (loss of hypoxic pulmonary vasoconstriction) and, to a lesser degree, reduced drive. Target SpO₂ 88–92 % in known retainers while treating the cause.',
      'Ventilation controls PaCO₂ within minutes: halving alveolar ventilation roughly doubles PaCO₂. That is why EtCO₂ responds quickly to rate changes on the ventilator, while bicarbonate adjustment by the kidneys takes days.',
    ],
  }] },
};
