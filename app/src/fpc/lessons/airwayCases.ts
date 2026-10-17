/**
 * Domain III extensions: a full transport case for each lesson (worked from dispatch to handover) and five
 * more exam-style questions, so each full course reaches the 15–25 minute target with practice to match.
 */
import type { Question, Section } from '../types';
type Extra = { sections: Section[]; questions: Question[] };
const Q = (q: string, options: [string, string, string, string], answer: 0 | 1 | 2 | 3, why: string): Question => ({ q, options, answer, why });

export const AIRWAY_EXTRAS: Record<string, Extra> = {
  'fpc-airway-assessment': {
    sections: [{
      id: 'case', title: 'Transport case: the trapped driver',
      body: [
        'You land at a rural crash. A 58-year-old man is pinned in a vehicle on its side, GCS 9, snoring respirations, SpO₂ 90 % on a non-rebreather, BP 102/64, HR 112. He has a thick neck, a beard, blood in the mouth, and fire crews estimate 20 minutes to extricate.',
        'The assessment drives the plan. Anatomically, he predicts difficult mask ventilation (beard, obesity, blood) and difficult laryngoscopy (blood, limited access, spinal precautions). Physiologically, he is borderline hypoxaemic and his shock index is above 1. The environment — a vehicle on its side — makes intubation in place a poor choice.',
      ],
      example: {
        case: 'What do you do while he is still trapped, and what changes once he is out?',
        steps: [
          'Trapped: jaw thrust, suction, a nasopharyngeal airway (tolerated with a gag), high-flow oxygen; keep him breathing spontaneously rather than inducing in the wreck.',
          'Prepare in parallel: drugs drawn and labelled, video laryngoscope and bougie, second-generation SGA sized and open, cricothyrotomy kit opened, the membrane palpated and marked when you can reach the neck.',
          'Once out: on the stretcher at waist height, head up with in-line stabilisation, pre-oxygenate with a sealed BVM and PEEP valve plus nasal cannula at 15 L/min.',
          'Resuscitate before induction: blood or fluid per trauma protocol, a push-dose vasopressor ready; reduced-dose ketamine, full-dose rocuronium.',
          'Verbalise: "Plan A video with bougie, two attempts; Plan B i-gel 5; Plan C two-person mask with adjuncts; Plan D scalpel–bougie–tube. Stop at 93 %."',
          'After intubation: waveform capnography, depth documented, analgesia and sedation started before loading.',
        ],
      },
    }],
    questions: [
      Q('Which most clearly predicts a difficult surgical airway?', ['Edentulism', 'Previous neck radiation', 'Mallampati II', 'Age 30'], 1, 'Radiation (the R of SMART) fibroses tissue and obscures landmarks.'),
      Q('Before induction in a predicted difficult airway, an important step is to:', ['Skip the checklist to save time', 'Palpate and mark the cricothyroid membrane', 'Remove nasal oxygen', 'Give a larger induction dose'], 1, 'Marking speeds front-of-neck access if needed.'),
      Q('A patient trapped in a vehicle with a patent but snoring airway is best managed initially with:', ['RSI in the vehicle', 'Basic manoeuvres, NPA, oxygen and preparation', 'Immediate cricothyrotomy', 'No intervention'], 1, 'Keep spontaneous breathing until a controlled setting is available.'),
      Q('Obstructive sleep apnoea primarily predicts difficulty with:', ['Surgical airway', 'Mask ventilation', 'IV access', 'Capnography'], 1, 'OSA is part of ROMAN (obstruction).'),
      Q('Which "physiologic" factor is most commonly associated with peri-intubation arrest?', ['Mild anaemia', 'Hypotension before induction', 'Hyperglycaemia', 'Bradypnoea'], 1, 'Pre-induction hypotension predicts arrest.'),
    ],
  },
  'fpc-airway-anatomy': {
    sections: [{
      id: 'case', title: 'Transport case: the 14-month-old with stridor',
      body: [
        'A 14-month-old with three days of cough now has inspiratory stridor at rest, intercostal recession and SpO₂ 93 % on blow-by oxygen. Weight about 10 kg. The referring hospital has given nebulised adrenaline with partial improvement.',
        'The anatomy explains the danger: a subglottic airway of a few millimetres, a cricoid ring that cannot expand, and resistance rising with the fourth power of the radius. Agitation converts laminar to turbulent flow and worsens the obstruction. Oxygen consumption per kilogram is roughly double an adult\'s, so if the airway closes, desaturation is fast.',
      ],
      example: {
        case: 'How does anatomy shape your management?',
        steps: [
          'Keep the child calm on a parent\'s lap where possible; avoid unnecessary procedures that provoke crying.',
          'Treat the swelling: dexamethasone (if not given) and nebulised adrenaline, recognising rebound after about 2 hours.',
          'Prepare for intubation by the most skilled operator: a tube 0.5–1.0 mm smaller than the age-predicted size, a straight blade available for the floppy epiglottis, a shoulder roll for the large occiput.',
          'Plan oxygenation rescue: a paediatric SGA, two-person mask technique, and needle cricothyrotomy equipment (surgical cricothyrotomy is not appropriate at this age).',
          'In flight: continuous SpO₂ and capnography if intubated; bradycardia is a pre-arrest sign of hypoxia.',
        ],
      },
    }],
    questions: [
      Q('Why does crying worsen upper airway obstruction in a child?', ['It reduces oxygen consumption', 'Turbulent flow raises resistance further', 'It opens the cricoid', 'It reduces dead space'], 1, 'Turbulent flow resistance rises with about the fifth power of radius.'),
      Q('In a 1-year-old with croup needing intubation, choose a tube:', ['Age-predicted size', '0.5–1.0 mm smaller than predicted', '2 sizes larger', 'An SGA only'], 1, 'Subglottic swelling narrows the lumen.'),
      Q('The hyoepiglottic ligament is the reason a curved blade:', ['Lifts the epiglottis indirectly from the vallecula', 'Must be used in infants', 'Cannot see the cords', 'Enters the oesophagus'], 0, 'Pressure in the vallecula tenses the ligament.'),
      Q('The carina lies approximately at:', ['C6', 'T4–T5 (angle of Louis)', 'T10', 'L1'], 1, 'At the sternal angle level.'),
      Q('Oxygen consumption of an infant is roughly:', ['Half an adult\'s per kg', 'Equal per kg', 'Double per kg', 'Ten times per kg'], 2, 'About 6–8 vs 3–4 mL/kg/min.'),
    ],
  },
  'fpc-airway-pharm': {
    sections: [{
      id: 'case', title: 'Transport case: three patients, three drug plans',
      body: [
        'The same flight team sees three patients in a week. Choosing drugs for each one shows how physiology, not habit, decides the plan.',
      ],
      example: {
        case: 'Patient A: 70 kg septic shock, BP 80/45 on norepinephrine. Patient B: 70 kg isolated severe TBI, BP 150/90. Patient C: 70 kg crush injury trapped 6 hours, K⁺ unknown, ECG with peaked T waves.',
        steps: [
          'A: ketamine at a reduced dose (around 0.5–1 mg/kg) or etomidate; rocuronium 1.2 mg/kg (full dose in slow circulation); push-dose pressor ready; avoid propofol.',
          'B: avoid both hypotension and the sympathetic surge of laryngoscopy — an opioid such as fentanyl, a haemodynamically neutral induction agent at full dose, rocuronium; post-intubation propofol infusion if BP allows, MAP maintained for cerebral perfusion.',
          'C: avoid succinylcholine (crush, likely hyperkalaemia); give calcium for the ECG changes, rocuronium for paralysis, and plan hyperkalaemia treatment and fluids.',
          'All three: analgesia and sedation started within minutes of confirmation; reassess before each move and at altitude.',
        ],
      },
    }],
    questions: [
      Q('Fentanyl\'s main role around intubation of a hypertensive head-injured patient is to:', ['Paralyse', 'Blunt the sympathetic response to laryngoscopy', 'Raise BP', 'Reverse rocuronium'], 1, 'Reduces the pressor response that raises ICP.'),
      Q('Malignant hyperthermia can be triggered by:', ['Rocuronium', 'Succinylcholine', 'Ketamine', 'Fentanyl'], 1, 'Succinylcholine and volatile anaesthetics trigger MH.'),
      Q('Ketamine may cause hypotension in:', ['Every patient', 'Catecholamine-depleted shock', 'Hypertensive patients', 'Asthma'], 1, 'Its direct myocardial depression is unmasked.'),
      Q('Duration of succinylcholine block:', ['1–2 min', '6–10 min', '45–70 min', '3–4 h'], 1, 'Rapid hydrolysis by plasma cholinesterase.'),
      Q('Sugammadex dose for immediate reversal of deep rocuronium block:', ['2 mg/kg', '4 mg/kg', '16 mg/kg', '50 mg/kg'], 2, '16 mg/kg for rescue reversal.'),
    ],
  },
  'fpc-passive-oxygenation': {
    sections: [{
      id: 'case', title: 'Transport case: the term pregnant patient',
      body: [
        'A 38-week pregnant woman with eclampsia has a further seizure and remains obtunded after magnesium; she is vomiting and must be intubated before transport. SpO₂ 95 % on a non-rebreather.',
        'Pregnancy compresses the tank and speeds the drain: FRC falls by about a fifth as the uterus pushes up the diaphragm, oxygen consumption rises, and safe apnoea time is shorter than in a non-pregnant adult. Airway oedema and breast tissue make laryngoscopy harder, and aspiration risk is high.',
      ],
      example: {
        case: 'Plan the oxygenation.',
        steps: [
          'Position: head up 20–30° with left uterine displacement to preserve venous return.',
          'Pre-oxygenate for at least three minutes with a sealed BVM and PEEP valve, or NIV if she tolerates it; nasal cannula at 15 L/min underneath.',
          'Choose a smaller tube (6.0–7.0) for airway oedema; video laryngoscope; suction running.',
          'Agree a stop point (for example 93 %); if reached, gentle mask ventilation with low pressures or an SGA.',
          'After intubation, ventilate to her normal pregnancy CO₂ (about 30 mmHg) and keep SpO₂ ≥ 95 % for the fetus.',
        ],
      },
    }],
    questions: [
      Q('Safe apnoea time in a term pregnant patient compared with a non-pregnant adult is:', ['Longer', 'Shorter', 'The same', 'Unaffected by pre-oxygenation'], 1, 'Smaller FRC and higher consumption.'),
      Q('Which position best aids pre-oxygenation at term?', ['Supine flat', 'Head up with left uterine displacement', 'Trendelenburg', 'Prone'], 1, 'Improves FRC and venous return.'),
      Q('The end-tidal oxygen target for ideal pre-oxygenation is about:', ['50 %', '70 %', '90 %', '21 %'], 2, 'EtO₂ near 90 % indicates good denitrogenation.'),
      Q('High-flow nasal oxygen during laryngoscopy works best when:', ['The mouth is closed', 'The airway is patent (jaw thrust or blade)', 'The patient is breathing fast', 'The cuff is inflated'], 1, 'Patency allows bulk flow.'),
      Q('A BVM with a PEEP valve helps pre-oxygenation mainly in:', ['Normal lungs', 'Shunt physiology', 'Hyperventilation', 'Metabolic alkalosis'], 1, 'PEEP recruits collapsed alveoli.'),
    ],
  },
  'fpc-failed-airway': {
    sections: [{
      id: 'case', title: 'Transport case: the anaphylaxis airway',
      body: [
        'A 44-year-old with anaphylaxis after a bee sting has stridor, a swollen tongue and SpO₂ 88 % despite IM adrenaline twice and an adrenaline infusion. The receiving hospital is 45 minutes away.',
        'This is a predicted difficult airway that may fail quickly: oedema distorts anatomy, mask ventilation may be impossible, and SGAs may not seal over a swollen larynx. The plan must assume failure is likely.',
      ],
      example: {
        case: 'Structure the attempt.',
        steps: [
          'Maximise medical therapy: adrenaline infusion titrated, fluids, nebulised adrenaline.',
          'Most experienced operator; video laryngoscope and a smaller tube (6.0–6.5); bougie; suction.',
          'Mark the cricothyroid membrane before induction; open the scalpel–bougie–tube kit; assign a second clinician to the neck.',
          'Consider an awake technique if skills allow; if RSI, double setup.',
          'If the first attempt fails and oxygenation fails, move to the neck without delay — oedema worsens with every attempt.',
        ],
      },
    }],
    questions: [
      Q('In a "can\'t intubate, can oxygenate" situation, the urgency is:', ['Immediate cricothyrotomy', 'Time to re-oxygenate and choose a plan', 'Stop all oxygenation', 'Repeat the same attempt'], 1, 'Oxygenation buys time for a considered decision.'),
      Q('A "double setup" means:', ['Two laryngoscopes', 'Preparing for surgical airway while attempting intubation', 'Two induction drugs', 'Two monitors'], 1, 'The neck is ready before induction.'),
      Q('Who should be empowered to call a stop during intubation?', ['Only the operator', 'Any team member watching the monitor', 'Nobody', 'The pilot'], 1, 'Shared authority reduces fixation.'),
      Q('In the Vortex approach, the three upper-airway lifelines are:', ['Tube, SGA, face mask', 'Tube, NIV, HFNO', 'SGA, cric, needle', 'Mask, cannula, NRB'], 0, 'Failure of all three leads to front-of-neck access.'),
      Q('External laryngeal manipulation is performed by:', ['Pressing the cricoid backward blindly', 'The operator moving the thyroid cartilage to improve the view', 'The patient', 'Inflating the cuff'], 1, 'Then an assistant holds it in place.'),
    ],
  },
  'fpc-surgical-airway': {
    sections: [{
      id: 'case', title: 'Transport case: massive facial trauma',
      body: [
        'A motorcyclist without a helmet has severe midface and mandibular fractures. Blood pours from the mouth, the face is unstable, and SpO₂ is 80 % despite suction and positioning. Mask ventilation is impossible and the oropharynx is unrecognisable.',
        'Oral intubation and SGA placement are likely to fail; front-of-neck access may be the primary airway rather than a rescue. Sitting the patient forward may help drainage while preparing, if the spine assessment allows.',
      ],
      example: {
        case: 'Perform the surgical airway.',
        steps: [
          'Declare the plan and assign roles: operator, assistant with suction, monitor-watcher.',
          'Extend the neck if possible; laryngeal handshake to find the membrane.',
          'Transverse stab through skin and membrane, rotate the blade caudally, open the hole.',
          'Bougie along the blade, 6.0 cuffed tube over the bougie, inflate cuff.',
          'Confirm with capnography, ventilate, secure; suction the trachea through the tube; continue haemorrhage control and resuscitation.',
        ],
      },
    }],
    questions: [
      Q('Primary surgical airway (rather than rescue) is most appropriate in:', ['Mild facial bruising', 'Massive midface trauma preventing oral access', 'COPD', 'Status epilepticus'], 1, 'When upper airway routes are not feasible.'),
      Q('The scalpel blade most often recommended for SBT cricothyrotomy:', ['Number 11', 'Number 10 (wide)', 'Number 15', 'Any'], 1, 'A wide blade makes a hole large enough for the bougie and tube.'),
      Q('Jet ventilation through a needle cric uses an I:E of roughly:', ['1:1', '1:4', '4:1', '1:10'], 1, 'About 1 s in, 4 s out to allow exhalation.'),
      Q('Bleeding after cricothyrotomy is usually:', ['Arterial and torrential', 'Venous and controlled by pressure and the tube', 'Absent', 'From the carotid'], 1, 'Midline is relatively avascular.'),
      Q('Signs of subcutaneous emphysema after cricothyrotomy suggest:', ['Correct placement', 'False passage or leak around the tube', 'Bronchospasm', 'Normal finding'], 1, 'Air tracking in tissues — reassess placement.'),
    ],
  },
  'fpc-mech-vent': {
    sections: [{
      id: 'case', title: 'Transport case: inter-facility ARDS transfer',
      body: [
        'A 40-year-old woman, 165 cm, with influenza pneumonia is on VC: VT 550, RR 18, PEEP 8, FiO₂ 0.8. SpO₂ 89 %, peak 38, plateau 33. ABG pH 7.31, PaCO₂ 52, PaO₂ 58. You are transferring her to an ECMO centre.',
        'Her PBW is 45.5 + 0.91 × (165 − 152.4) ≈ 57 kg. A VT of 550 is about 9.6 mL/kg PBW, and the plateau of 33 exceeds the target. P/F ratio is 58/0.8 ≈ 73: severe ARDS.',
      ],
      example: {
        case: 'Adjust for transport.',
        steps: [
          'Reduce VT to about 340 mL (6 mL/kg PBW); increase RR to around 26–30 to support minute ventilation; accept a higher CO₂ if pH stays above about 7.20.',
          'Increase PEEP (often 12–14 or per a PEEP/FiO₂ table) and FiO₂ to 1.0 for transport; recheck plateau (target ≤ 30) and driving pressure.',
          'Ensure deep sedation and consider paralysis to prevent dyssynchrony during movement.',
          'Use the transport ventilator on the patient for a period before leaving to confirm stability; carry a BVM with PEEP valve; calculate oxygen for the flight with a reserve.',
          'Avoid disconnections (clamp the tube during circuit changes) to prevent derecruitment.',
        ],
      },
    }],
    questions: [
      Q('P/F ratio of PaO₂ 60 on FiO₂ 0.6:', ['36', '100', '160', '360'], 1, '60 / 0.6 = 100: severe ARDS (≤ 100).'),
      Q('Minimum pH commonly accepted with permissive hypercapnia:', ['7.35', '7.20–7.25', '7.00', '6.90'], 1, 'Many protocols accept pH above about 7.20–7.25.'),
      Q('To lower plateau pressure in ARDS, the first change is usually:', ['Increase VT', 'Reduce VT', 'Increase rate only', 'Remove PEEP'], 1, 'Smaller tidal volume reduces plateau.'),
      Q('Disconnecting an ARDS patient\'s circuit causes:', ['Recruitment', 'Derecruitment and desaturation', 'Better compliance', 'No change'], 1, 'Loss of PEEP collapses alveoli.'),
      Q('SIMV with PS differs from AC because:', ['All breaths are full in SIMV', 'Spontaneous breaths between mandatory breaths are supported only by PS', 'SIMV has no set rate', 'AC has no backup rate'], 1, 'Extra patient breaths in SIMV are not full mandatory breaths.'),
    ],
  },
  'fpc-alt-airway': {
    sections: [{
      id: 'case', title: 'Transport case: the cardiac arrest airway',
      body: [
        'An adult in out-of-hospital cardiac arrest with ongoing CPR. Ground crews have placed a King LT; there is a capnography trace of 18 mmHg and good chest rise. You are asked to intubate before flight.',
        'A working supraglottic airway with capnographic confirmation is acceptable airway management during CPR; interrupting compressions for laryngoscopy has a cost. Exchange becomes reasonable when compressions can continue during the attempt, or after ROSC, and only if there is a clear benefit (leak at higher pressures, need for protection, long transport).',
      ],
      example: {
        case: 'Decide and act.',
        steps: [
          'Confirm the existing airway: chest rise, capnography waveform, no large leak.',
          'Continue CPR without interruption; leave the device in place during the arrest if it works.',
          'If ROSC occurs and transport is long, consider exchange with a video laryngoscope after deflating the device\'s cuffs, with a backup SGA ready.',
          'Document device, size, confirmation method and the EtCO₂ trend.',
        ],
      },
    }],
    questions: [
      Q('During CPR, a functioning SGA with a capnography waveform should usually be:', ['Removed immediately', 'Left in place while CPR continues', 'Replaced with a needle cric', 'Converted without regard to compressions'], 1, 'Avoid interrupting compressions.'),
      Q('Prolonged King LT use can cause:', ['Tongue engorgement', 'Hyperkalaemia', 'Hypothermia', 'Pneumothorax'], 0, 'Venous congestion of the tongue.'),
      Q('An NPA traditionally avoided in:', ['Asthma', 'Suspected basilar skull fracture', 'Seizure', 'Obesity'], 1, 'Theoretical risk of intracranial passage.'),
      Q('Video laryngoscopy in sunlight may be limited by:', ['Glare on the screen', 'Battery overheating only', 'Bougie size', 'Cuff pressure'], 0, 'Screen visibility is reduced.'),
      Q('The i-gel cuff is:', ['Inflatable', 'Non-inflatable gel', 'Absent', 'Oesophageal'], 1, 'A soft thermoplastic non-inflatable cuff.'),
    ],
  },
  'fpc-peri-arrest': {
    sections: [{
      id: 'case', title: 'Transport case: massive pulmonary embolism',
      body: [
        'A 55-year-old after hip surgery with sudden dyspnoea: SpO₂ 84 % on a non-rebreather, BP 86/52, HR 128, distended neck veins, RV dilation on bedside ultrasound. He is tiring and the team considers intubation before transfer to a centre for catheter-directed therapy.',
        'This patient is at extreme risk of arrest at induction: a failing, pressure-loaded right ventricle that depends on sympathetic tone and preload, combined with hypoxaemia. Positive pressure raises RV afterload and reduces venous return.',
      ],
      example: {
        case: 'Should you intubate, and if so how?',
        steps: [
          'First ask whether intubation can be avoided: high-flow oxygen or HFNO, cautious NIV, and urgent reperfusion therapy per the receiving centre.',
          'If intubation is unavoidable: norepinephrine running to a robust MAP before induction; avoid large fluid boluses that dilate the RV further.',
          'Minimal-dose induction (for example ketamine at reduced dose), full-dose paralytic, the most skilled operator, first-pass success.',
          'Ventilate with modest VT and low PEEP; avoid hypercapnia and hypoxia which raise PVR.',
          'Be ready for arrest: thrombolysis may be indicated per protocol in PE-related arrest.',
        ],
      },
    }],
    questions: [
      Q('Positive-pressure ventilation affects a failing RV by:', ['Lowering afterload', 'Raising afterload and reducing preload', 'Improving contractility', 'No effect'], 1, 'Intrathoracic pressure raises PVR and lowers venous return.'),
      Q('Which worsens pulmonary vascular resistance?', ['Normocapnia', 'Hypoxia and hypercapnia', 'Normal pH', 'Oxygen'], 1, 'Both cause pulmonary vasoconstriction.'),
      Q('In massive PE with shock, large fluid boluses may:', ['Always help', 'Dilate the RV further and worsen septal shift', 'Lower PVR', 'Treat the clot'], 1, 'Over-distension of the RV compromises the LV.'),
      Q('Timing of most peri-intubation arrests:', ['Hours later', 'Within minutes of induction', 'Before pre-oxygenation', 'At extubation'], 1, 'Most occur early.'),
      Q('Bicarbonate in severe acidaemia before intubation is:', ['Evidence-based standard', 'A bridge some consider; evidence is limited', 'Contraindicated', 'Used to induce anaesthesia'], 1, 'Limited evidence.'),
    ],
  },
  'fpc-trach': {
    sections: [{
      id: 'case', title: 'Transport case: the home-ventilated child',
      body: [
        'A 6-year-old with a tracheostomy on home ventilation becomes acutely distressed during transfer: SpO₂ 82 %, no chest rise with the ventilator, high-pressure alarms. Parents say the tube was changed yesterday and the stoma is mature.',
        'The airway is probably blocked or displaced. Parents are a resource — they often know the tube size, how to change it, and the child\'s baseline.',
      ],
      example: {
        case: 'Work the algorithm.',
        steps: [
          'Disconnect the ventilator and hand-ventilate with oxygen to the stoma and face.',
          'Remove any inner cannula or speaking valve; pass a suction catheter.',
          'Catheter fails: if cuffed, deflate the cuff; if still failing, remove the tracheostomy tube.',
          'Insert a new tube of the same size (or one size smaller) through the mature stoma, ideally over a suction catheter as a guide; confirm with capnography.',
          'If recannulation fails: oxygenate via the stoma with a small mask or via the upper airway (this child\'s larynx is intact), and prepare oral intubation as a secondary plan.',
        ],
      },
    }],
    questions: [
      Q('A spare tracheostomy tube one size smaller is carried because:', ['It fits more easily if the stoma has narrowed', 'It ventilates better', 'Parents prefer it', 'It has no cuff'], 0, 'A narrowed stoma may not accept the same size.'),
      Q('A suction catheter can guide reinsertion by:', ['Acting like a bougie through the new tube', 'Measuring cuff pressure', 'Providing oxygen', 'None'], 0, 'It guides the tube into the tract.'),
      Q('Hereditary angioedema is treated specifically with:', ['Antihistamines only', 'C1-esterase inhibitor or bradykinin-pathway drugs', 'Steroids only', 'Calcium'], 1, 'Targeted therapies address bradykinin excess.'),
      Q('In a burned patient, airway swelling typically peaks:', ['Within 1 minute', 'Over hours, worsened by fluids', 'Never', 'After 2 weeks'], 1, 'Progressive oedema over the first day.'),
      Q('Air bubbling from an open neck wound with obvious tracheal injury may allow:', ['Intubation through the wound in extremis', 'Ignoring the airway', 'NPA only', 'Bag through the mouth only'], 0, 'Direct cannulation through the defect.'),
    ],
  },
  'fpc-tube-confirm': {
    sections: [{
      id: 'peds', title: 'Tube sizing and securing in children',
      body: [
        'For children over about two years, the uncuffed tube size is roughly (age ÷ 4) + 4 mm and the cuffed size (age ÷ 4) + 3.5 mm; have a half size above and below ready. Length-based tapes give tube size and drug doses in one step and reduce calculation errors under stress. Depth at the lips is about three times the internal diameter.',
        'Small movements matter: in an infant the trachea may be only 4–5 cm long, so flexion or extension of the head can move the tip from mid-trachea into a main bronchus or out through the cords. Keep the head in a neutral position, tape securely across the upper lip, and recheck depth and capnography after every move and before take-off.',
        'In neonates, the tip-to-lip depth is approximately weight in kilograms + 6 cm. A chest X-ray on arrival confirms the tip sits between the clavicles and the carina.',
      ],
    }, {
      id: 'case', title: 'Transport case: the loading dock',
      body: [
        'An intubated patient is moved from the ICU bed to your stretcher, then into the aircraft. On reconnection the waveform is absent and the SpO₂ is still 98 %.',
        'High saturation reassures nobody: a well pre-oxygenated patient can keep a high SpO₂ for minutes after displacement. Loss of the waveform after a move is a displaced or disconnected tube until proven otherwise.',
      ],
      example: {
        case: 'Respond.',
        steps: [
          'Check the circuit and sampling line: connections, kinks, water in the line, the capnograph itself.',
          'Hand-ventilate: no chest rise or resistance, or air leaking from the mouth, suggests displacement.',
          'Check the depth mark against the documented depth; look with a laryngoscope if any doubt.',
          'If displaced: remove, oxygenate by mask or SGA, and re-intubate; confirm with sustained waveform.',
          'Prevent recurrence: secure the tube with a commercial holder, use head blocks if appropriate, and recheck after every move.',
        ],
      },
    }],
    questions: [
      Q('Colorimetric CO₂ detectors change from purple to:', ['Blue', 'Yellow (with CO₂)', 'Red', 'Green'], 1, 'Yellow indicates CO₂ ("yellow is yes").'),
      Q('A colorimetric detector may give false negatives during:', ['Normal ventilation', 'Cardiac arrest with low pulmonary flow', 'Hyperventilation', 'Fever'], 1, 'Low CO₂ delivery during low-flow states.'),
      Q('Ultrasound evidence of tracheal intubation includes:', ['A second "double tract" in the neck', 'Bilateral lung sliding with ventilation', 'Absent sliding on both sides', 'Pericardial effusion'], 1, 'Bilateral sliding supports tracheal placement; a double tract suggests oesophageal.'),
      Q('Unilateral absent breath sounds on the left after intubation suggest:', ['Oesophageal intubation', 'Right mainstem intubation', 'Normal', 'Pneumothorax on the right'], 1, 'The tube is in the right main bronchus.'),
      Q('Over-inflated cuff pressure (> 30 cmH₂O) risks:', ['Aspiration', 'Tracheal mucosal ischaemia', 'Hyperventilation', 'Bronchospasm'], 1, 'Capillary perfusion pressure is exceeded.'),
    ],
  },
  'fpc-suction': {
    sections: [{
      id: 'checks', title: 'Equipment checks and complications',
      body: [
        'Check suction at the start of every shift and before every airway: power or battery, canister seated and empty, tubing connected, a rigid catheter and soft catheters of the right sizes, and the vacuum reading with the tubing occluded. Portable units lose strength as batteries drain; a manual hand-powered suction is a useful backup.',
        'Complications are mostly preventable. Hypoxaemia is limited by pre-oxygenation and short passes. Mucosal trauma and bleeding are limited by appropriate pressures, not jabbing the catheter, and stopping 1 cm short of the carina. Atelectasis is limited by catheter size no more than half the tube lumen and by closed systems that preserve PEEP. Infection risk is reduced by sterile technique for endotracheal suction.',
        'Document what you removed — volume, colour, blood or particulate matter — because it informs the receiving team about aspiration, pneumonia or haemorrhage.',
      ],
    }, 
      {
        id: 'special', title: 'Suction in special patients', core: false,
        body: [
          'Neonates and infants: use lower pressures and smaller catheters, limit each pass to about 5–10 seconds, suction the mouth before the nose (nasal stimulation can trigger a gasp and aspiration of oral contents), and watch for bradycardia. In the newly born, routine deep suction is not recommended; suction only if the airway is obstructed.',
          'Raised intracranial pressure: suctioning causes coughing and surges in ICP. Ensure adequate sedation and analgesia, pre-oxygenate, keep passes short, and avoid repeated passes.',
          'Tracheostomy patients: measure the catheter against the tube length or use pre-measured suction to avoid trauma to the carina. Inner cannulas can be removed and cleaned when secretions are thick.',
          'Infectious disease: closed in-line systems reduce aerosol exposure; wear appropriate PPE for open suction.',
        ],
        list: { caption: 'Catheter sizes (approximate)', items: ['Neonate (2.5–3.5 ETT): 5–6 Fr', 'Infant (3.5–4.0): 8 Fr', 'Child (5.0–6.0): 10 Fr', 'Adult (7.0–8.0): 14 Fr'] },
      },
      {
        id: 'case', title: 'Transport case: secretions at altitude',
        body: [
          'An intubated pneumonia patient on a 90-minute flight develops rising peak pressures, a shark-fin capnogram and falling SpO₂. Plateau pressure is unchanged.',
          'A rising peak with an unchanged plateau is a resistance problem; the most likely cause in this patient is secretions in the tube. Dry oxygen and long transport thicken secretions; heat and moisture exchangers help.',
        ],
        example: {
          case: 'Manage it.',
          steps: [
            'Pre-oxygenate with FiO₂ 1.0.',
            'Use the closed in-line system with a 14 Fr catheter for a 7.5 tube; suction on withdrawal for no more than 10–15 seconds.',
            'Reassess peak pressure, capnogram and SpO₂; repeat after re-oxygenation if needed.',
            'If a catheter will not pass, treat as tube obstruction: disconnect, bag, consider changing the tube.',
          ],
        },
      },
    ],
    questions: [
      Q('In neonates, suction the mouth before the nose because:', ['The nose is larger', 'Nasal suction can trigger a gasp and aspiration', 'It is faster', 'It avoids bradycardia entirely'], 1, 'Clear the mouth first.'),
      Q('Rising peak pressure with unchanged plateau and a shark-fin waveform suggests:', ['Pneumothorax', 'Secretions or bronchospasm', 'Mainstem intubation', 'ARDS'], 1, 'A resistance problem.'),
      Q('Suction catheter size for an infant with a 4.0 ETT:', ['5 Fr', '8 Fr', '14 Fr', '18 Fr'], 1, 'About 2 × tube size.'),
      Q('Suction in a patient with raised ICP should be:', ['Prolonged and vigorous', 'Brief, with adequate sedation and pre-oxygenation', 'Avoided entirely', 'Performed with saline lavage'], 1, 'Minimise ICP surges.'),
      Q('A heat and moisture exchanger helps by:', ['Increasing FiO₂', 'Humidifying inspired gas, limiting thick secretions', 'Lowering CO₂', 'Measuring EtCO₂'], 1, 'Humidification keeps secretions thinner.'),
    ],
  },
  'fpc-capnography': {
    sections: [{
      id: 'physiology', title: 'Where the CO₂ comes from',
      body: [
        'End-tidal CO₂ depends on three things: production by metabolism, delivery to the lungs by the circulation, and elimination by ventilation. A change in the number always means one of those three has changed — or the equipment has.',
        'Production rises with fever, shivering, seizures, sepsis, malignant hyperthermia, and when bicarbonate is given (it is converted to CO₂). Production falls with hypothermia and deep sedation.',
        'Delivery depends on cardiac output and pulmonary blood flow. A sudden fall at constant ventilation means falling output, a pulmonary embolism or cardiac arrest; a sudden rise during CPR suggests ROSC.',
        'Elimination depends on alveolar ventilation: rate × (tidal volume − dead space). Hypoventilation raises EtCO₂; hyperventilation lowers it. Increased dead space lowers EtCO₂ relative to PaCO₂ even though the arterial value may be rising.',
      ],
    }, {
      id: 'case', title: 'Transport case: reading the trace through a flight',
      body: [
        'You transport an intubated septic patient. Over the flight, the capnogram tells a story — if you read it.',
      ],
      example: {
        case: 'Interpret each change.',
        steps: [
          'Take-off: EtCO₂ 34 with a normal waveform — baseline after confirmation; gas earlier showed PaCO₂ 39 (gap 5).',
          'Minute 15: EtCO₂ falls to 24 with unchanged ventilation, BP 74/40 — falling cardiac output; treat the hypotension.',
          'Minute 25: the baseline rises above zero — rebreathing; check the circuit, valves and flow.',
          'Minute 40: sudden flat line — disconnection or displacement; check the circuit and depth, hand-ventilate.',
          'Minute 50: clefts appear in the plateau and EtCO₂ rises slightly — the patient is breathing against the ventilator as sedation wears off; give analgesia and sedation.',
        ],
      },
    }],
    questions: [
      Q('With constant ventilation, a falling EtCO₂ most often reflects:', ['Rising metabolism', 'Falling cardiac output', 'Rebreathing', 'Bronchospasm'], 1, 'Less CO₂ is delivered to the lungs.'),
      Q('Malignant hyperthermia causes EtCO₂ to:', ['Fall', 'Rise sharply', 'Stay normal', 'Become zero'], 1, 'Hypermetabolism raises CO₂ production.'),
      Q('Nasal-oral capnography in a sedated, spontaneously breathing patient detects:', ['Tube placement', 'Hypoventilation and apnoea early', 'Cardiac output exactly', 'PaO₂'], 1, 'Before desaturation.'),
      Q('Phase II of the capnogram reflects:', ['Dead-space gas only', 'Mixing of dead-space and alveolar gas', 'Inspiration', 'Rebreathing'], 1, 'The expiratory upstroke.'),
      Q('In DKA before intubation, a low EtCO₂ reflects:', ['Hypoventilation', 'Respiratory compensation', 'Equipment error', 'Rebreathing'], 1, 'Kussmaul breathing lowers CO₂.'),
    ],
  },
  'fpc-nippv': {
    sections: [{
      id: 'interface', title: 'Interfaces, leaks and synchrony',
      body: [
        'The interface decides whether NIV works. Oronasal (full-face) masks suit acute respiratory failure because breathless patients breathe through the mouth. Nasal masks suit calmer patients and allow speech. Total-face masks and helmets spread pressure over a larger area and help when pressure sores or claustrophobia limit other masks.',
        'Fit the mask so it seals without excessive strap tension: one or two fingers should slide under the straps. Small leaks are tolerated by ventilators designed for NIV; large leaks cause asynchrony, failure to trigger or cycle, and dry eyes. Re-fit rather than tighten.',
        'Watch the patient breathe with the machine. Triggering delays, double triggering or breaths that end before the patient finishes inhaling increase work of breathing. Adjust the trigger sensitivity and rise time, coach the patient, and consider low-dose anxiolysis — while never sedating a patient so deeply that airway protection is lost.',
        'Gastric distension, eye irritation, nasal bridge pressure injury and aspiration are the common complications; a gastric tube may be needed on long transports.',
      ],
    }, {
      id: 'case', title: 'Transport case: flash pulmonary oedema',
      body: [
        'A 72-year-old with hypertension is sitting bolt upright, frothy sputum, SpO₂ 82 % on a non-rebreather, BP 210/120, HR 118, crackles to the apices. She is alert and frightened.',
        'Sympathetic crashing acute pulmonary oedema: high afterload drives fluid into the lungs. CPAP or BiPAP lowers preload and afterload and recruits flooded alveoli, while high-dose nitrates lower afterload. Intubation can often be avoided.',
      ],
      example: {
        case: 'Treat it.',
        steps: [
          'Keep her upright; coach and reassure.',
          'Start CPAP 8–10 cmH₂O (or BiPAP if hypercapnic) with FiO₂ high, titrating to SpO₂ 94–98 %.',
          'Give nitroglycerin per protocol in high doses as tolerated, reducing as BP falls.',
          'Reassess every few minutes: respiratory rate, work of breathing, SpO₂, BP and mental status.',
          'If she deteriorates, becomes obtunded or hypotensive, intubate — ideally before departure.',
        ],
      },
    }],
    questions: [
      Q('CPAP improves oxygenation primarily by:', ['Increasing CO₂', 'Recruiting alveoli and raising FRC', 'Raising heart rate', 'Lowering FiO₂'], 1, 'Reduces shunt.'),
      Q('First-line pharmacological adjunct with NIV for hypertensive pulmonary oedema:', ['Fluids', 'High-dose nitroglycerin', 'Beta-agonist', 'Calcium'], 1, 'Reduces afterload and preload.'),
      Q('Which patient is the best NIV candidate?', ['Obtunded with vomiting', 'Alert COPD patient with pH 7.28', 'Facial burns', 'Cardiac arrest'], 1, 'Cooperative hypercapnic patient.'),
      Q('If CO₂ remains high on BiPAP 10/5, a reasonable change is:', ['Lower IPAP', 'Increase IPAP', 'Remove EPAP', 'Lower FiO₂ to 0.21'], 1, 'More pressure support increases VT.'),
      Q('Positive pressure may worsen:', ['Hypertension', 'Hypovolaemic hypotension', 'Oxygenation', 'Pulmonary oedema'], 1, 'It reduces venous return.'),
    ],
  },
};
