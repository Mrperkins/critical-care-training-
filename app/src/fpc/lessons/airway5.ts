/** FP-C III.9–III.11: peri-intubation arrest; tracheostomy and special airways; tube confirmation and monitoring. */
import type { FpcLesson } from '../types';

export const PERI_ARREST: FpcLesson = {
  id: 'fpc-peri-arrest', domain: 'airway', ref: 'III.9',
  title: 'Peri-intubation cardiac arrest',
  summary: 'Why critically ill patients arrest around intubation, how to predict who will, and the resuscitation bundle that prevents it.',
  objectives: [
    'List the mechanisms of peri-intubation arrest: hypoxaemia, hypotension, acidosis and RV failure.',
    'Apply a pre-intubation resuscitation bundle with measurable targets.',
    'Manage post-intubation hypotension and arrest.',
  ],
  sections: [
    {
      id: 'scope', title: 'How often and why', core: true,
      body: [
        'In critically ill adults, cardiac arrest occurs in a few percent of emergency intubations, far more often than in the operating room. Severe hypoxaemia and cardiovascular collapse (a systolic pressure below about 65 mmHg or a new vasopressor requirement) are each common. Most arrests happen within minutes of induction and many are pulseless electrical activity or bradycardia.',
        'Four mechanisms combine. Hypoxaemia from apnoea in a patient with poor reserve. Hypotension from loss of sympathetic tone with induction and reduced venous return from positive pressure. Worsening acidosis when a compensating patient becomes apnoeic and is then under-ventilated. And right-ventricular failure when hypoxia, hypercapnia and positive pressure raise pulmonary vascular resistance in a ventricle already at its limit.',
      ],
      list: { caption: 'Red flags for peri-intubation arrest', items: ['SpO₂ < 93 % despite pre-oxygenation', 'Systolic BP < 90 mmHg or shock index > 0.9', 'Severe metabolic acidosis (pH < 7.1–7.2, high compensatory minute ventilation)', 'Known pulmonary hypertension or RV dysfunction, massive PE', 'Older age, obesity, multiple intubation attempts'] },
    },
    {
      id: 'bundle', title: 'Resuscitate before you intubate', core: true,
      body: [
        'Hypoxaemia: optimise pre-oxygenation with NIV or a PEEP valve, use apnoeic oxygenation, ventilate gently during apnoea if needed, and aim for first-pass success.',
        'Hypotension: treat volume depletion with fluid or blood, start or increase a vasopressor infusion before induction (many teams target a systolic pressure above about 90–100 or MAP above 65 before proceeding), have push-dose vasopressors ready, and reduce the induction dose. Avoid propofol in shock.',
        'Acidosis: minimise apnoea time; immediately after intubation set a minute ventilation matching the pre-intubation effort. Some clinicians consider bicarbonate in extreme acidaemia as a bridge, though evidence is limited.',
        'RV failure: avoid hypotension and hypoxia; consider an inhaled pulmonary vasodilator if available; use modest PEEP and tidal volumes; consider awake or delayed approaches and the smallest possible induction dose.',
      ],
      example: {
        case: 'GI bleed, haemoglobin 6.1, BP 84/50, HR 132, confused and vomiting blood. Airway protection is needed before a 50-minute flight.',
        steps: [
          'Threats: haemorrhagic shock (hypotension), aspiration, low oxygen-carrying capacity.',
          'Transfuse blood products before induction; aim for a better pressure; norepinephrine or push-dose pressor ready.',
          'Head-up, SALAD-ready suction, pre-oxygenate.',
          'Reduced-dose ketamine plus full-dose rocuronium; first-pass with video laryngoscope and bougie.',
          'Post-intubation: modest PEEP, continue transfusion, recheck BP within one to two minutes.',
        ],
      },
    },
    {
      id: 'after', title: 'Post-intubation hypotension and arrest', core: true,
      body: [
        'Check pressure every one to three minutes after induction. If it falls: give a push-dose vasopressor, increase the infusion, reduce PEEP and tidal volume temporarily if positive pressure is limiting venous return, rule out tension pneumothorax and auto-PEEP by disconnecting briefly, and treat bleeding.',
        'If the patient arrests, start high-quality CPR and follow ACLS, and look for reversible causes particular to this setting: hypoxia (tube position, DOPE), hypovolaemia, tension pneumothorax, acidosis, hyperkalaemia (succinylcholine in a susceptible patient), and auto-PEEP. Disconnecting the ventilator for 30–60 seconds treats breath stacking.',
      ],
    },
  ],
  keyPoints: [
    'Peri-intubation arrest is common in the critically ill and mostly physiological, not technical.',
    'Hypoxaemia, hypotension, acidosis and RV failure — resuscitate each before induction.',
    'Vasopressor running or drawn, induction dose reduced, first-pass success.',
    'Match minute ventilation after intubation in acidosis.',
    'Post-induction: check BP every few minutes; in arrest think DOPE, auto-PEEP, potassium.',
  ],
  pearls: ['Shock index above 0.9 predicts post-intubation hypotension.', 'Disconnecting the ventilator is a 30-second test for stacking.'],
  pitfalls: ['Intubating a hypotensive patient "to get it done" before resuscitation.', 'Missing hyperkalaemia from succinylcholine in renal failure.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states at the bedside' }, { id: 'hyperk-signature', label: 'Hyperkalaemia: the membrane, the ECG, the rescue' }],
  questions: [
    { q: 'Most peri-intubation arrests in the critically ill are caused by:', options: ['Failure to place the tube', 'Physiological derangement (hypoxia, hypotension)', 'Drug allergy', 'Equipment failure'], answer: 1, why: 'Physiology, not technique, drives most arrests.' },
    { q: 'A shock index above about ___ predicts post-intubation hypotension:', options: ['0.5', '0.7', '0.9', '1.5'], answer: 2, why: 'SI > 0.9 is a common threshold.' },
    { q: 'Which is part of the pre-intubation bundle for hypotension?', options: ['Full-dose propofol', 'Vasopressor running or drawn up', 'High PEEP', 'Delaying blood'], answer: 1, why: 'Prepare and start vasopressors before induction.' },
    { q: 'After intubation the BP falls to 70/40 and peak pressures are high. A quick diagnostic step:', options: ['Increase PEEP', 'Disconnect the ventilator briefly', 'Give propofol', 'Increase rate'], answer: 1, why: 'Rules out auto-PEEP; consider tension pneumothorax.' },
    { q: 'An arrest one minute after succinylcholine in a dialysis patient suggests:', options: ['Hypoglycaemia', 'Hyperkalaemia', 'Hypocalcaemia', 'Anaphylaxis to rocuronium'], answer: 1, why: 'Succinylcholine raises potassium.' },
    { q: 'In a patient with RV failure, avoid:', options: ['Hypotension and hypoxia', 'Small induction doses', 'Modest PEEP', 'Inhaled pulmonary vasodilators'], answer: 0, why: 'Both worsen RV perfusion and afterload.' },
    { q: 'Common rhythms in peri-intubation arrest:', options: ['VF only', 'PEA and bradycardia', 'Atrial flutter', 'Torsades only'], answer: 1, why: 'Hypoxic and hypotensive arrests are often PEA/brady.' },
    { q: 'Best induction choice in haemorrhagic shock, given the options:', options: ['Propofol 2 mg/kg', 'Reduced-dose ketamine', 'Midazolam 0.3 mg/kg', 'Thiopental'], answer: 1, why: 'Ketamine at reduced dose best preserves BP.' },
    { q: 'Gentle bag-mask ventilation during the apnoeic period:', options: ['Increases arrest risk', 'Reduces severe hypoxaemia in high-risk patients', 'Is contraindicated', 'Replaces pre-oxygenation'], answer: 1, why: 'Low-pressure ventilation reduces desaturation.' },
    { q: 'After intubating a pH 7.02 septic patient, ventilate:', options: ['RR 12', 'At the patient\'s pre-intubation minute ventilation', 'With permissive hypercapnia', 'Only with PS'], answer: 1, why: 'Maintain compensation.' },
  ],
  sources: [
    { title: 'Russotto V et al. Intubation practices and adverse peri-intubation events in critically ill patients (INTUBE). JAMA (2021)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2777606' },
    { title: 'Mosier JM et al. The physiologically difficult airway. West J Emerg Med (2015)', url: 'https://pubmed.ncbi.nlm.nih.gov/26759643/' },
  ],
};

export const TRACH: FpcLesson = {
  id: 'fpc-trach', domain: 'airway', ref: 'III.10',
  title: 'Tracheostomy, laryngectomy and special airways',
  summary: 'Telling a tracheostomy from a laryngectomy, managing the blocked or displaced tracheostomy, and the airway in angioedema, burns, trauma and obesity.',
  objectives: [
    'Distinguish a patient who can be oxygenated from above (tracheostomy) from one who cannot (laryngectomy).',
    'Follow an emergency algorithm for a blocked or displaced tracheostomy.',
    'Anticipate special airway problems: angioedema, inhalation injury, penetrating neck trauma, obesity.',
  ],
  sections: [
    {
      id: 'neck', title: 'Neck breather or not?', core: true,
      body: [
        'A tracheostomy is an opening into the trachea; the upper airway is still connected to the lungs. These patients can, in principle, be oxygenated from the mouth and nose, or intubated orally, once the stoma is covered.',
        'A laryngectomy removes the larynx and brings the trachea out as an end stoma; there is no connection between the mouth and the lungs. Oxygen must go to the stoma. Oral intubation is impossible. Bedside signs, wristbands and the patient\'s own information should make clear which type you are dealing with.',
      ],
    },
    {
      id: 'blocked', title: 'The blocked or displaced tracheostomy', core: true,
      body: [
        'Call for help, apply oxygen to both the face and the stoma, and assess patency. Remove any speaking valve or cap, remove the inner cannula if present (many blockages are in the inner tube), and pass a suction catheter. If the catheter passes easily, the tube is likely patent: continue assessment and ventilate.',
        'If the catheter will not pass, deflate the cuff and reassess. If the patient is still not breathing adequately, remove the tracheostomy tube. Then oxygenate: for a tracheostomy, by standard upper-airway methods with the stoma covered, or via the stoma with a paediatric face mask or a laryngeal mask applied to the stoma; for a laryngectomy, via the stoma only.',
        'Secondary steps: oral intubation (tracheostomy patients only) or intubation of the stoma with a smaller tracheostomy or endotracheal tube, ideally over a bougie or with a fibreoptic scope. A new or fresh tracheostomy (less than about 7 days) has an immature tract that may close or allow a false passage, so recannulation is riskier.',
      ],
      list: { caption: 'Emergency tracheostomy algorithm (adapted)', items: ['Call for help; oxygen to face and stoma.', 'Remove speaking valve or cap and inner cannula.', 'Can you pass a suction catheter? Yes → ventilate and reassess.', 'No → deflate the cuff; reassess.', 'Still failing → remove the tracheostomy tube.', 'Oxygenate: upper airway (trach) or stoma (laryngectomy).', 'Secondary airway: oral intubation (trach only) or stoma intubation.'], ordered: true },
    },
    {
      id: 'special', title: 'Special airways', core: true,
      body: [
        'Angioedema: from ACE inhibitors (bradykinin-mediated, does not respond reliably to adrenaline or antihistamines), hereditary angioedema, or anaphylaxis (histamine-mediated, responds to IM adrenaline). Look for voice change, stridor, drooling and tongue or floor-of-mouth swelling. An awake fibreoptic nasal approach by an expert, with a surgical airway prepared, is often preferred when swelling is progressing.',
        'Inhalation injury: soot in the airway, facial burns, singed nasal hair, hoarseness or stridor after fire in an enclosed space. Swelling progresses over hours, worsened by resuscitation fluids. Early intubation with a large tube (7.5–8.0 or more for bronchoscopy) before transport is often indicated when signs of airway involvement exist.',
        'Penetrating neck trauma: an expanding haematoma can distort and compress the airway. Avoid blind techniques that may enter a false passage; consider an awake approach or early surgical airway with a surgeon present. Airway injury with air bubbling from the wound may be intubated directly through the wound in extremis.',
        'Obesity: rapid desaturation, difficult mask ventilation and difficult surgical airway. Ramp, head up, pre-oxygenate with PEEP, use apnoeic oxygenation and video laryngoscopy, and mark the membrane by ultrasound if possible.',
      ],
    },
  ],
  keyPoints: [
    'Tracheostomy: upper airway still connected. Laryngectomy: oxygenate the stoma only.',
    'Blocked trach: oxygen to face and stoma, remove inner cannula, suction, deflate cuff, remove tube if failing.',
    'Fresh tracheostomies (< about 7 days) recannulate poorly.',
    'ACE-inhibitor angioedema does not respond reliably to adrenaline.',
    'Inhalation injury swells over hours: intubate early with a large tube when the airway is involved.',
  ],
  pearls: ['Most trach blockages are in the inner cannula.', 'A paediatric mask over a stoma oxygenates well.'],
  pitfalls: ['Trying to bag-mask a laryngectomy patient through the mouth.', 'Waiting for stridor before intubating an airway burn on a long flight.'],
  questions: [
    { q: 'A laryngectomy patient needs oxygen. Apply it to:', options: ['Mouth and nose', 'The stoma', 'Both equally', 'Neither'], answer: 1, why: 'There is no connection between upper airway and lungs.' },
    { q: 'First step for a blocked tracheostomy after calling for help and oxygen:', options: ['Remove the tube immediately', 'Remove the inner cannula and suction', 'Oral intubation', 'Cricothyrotomy'], answer: 1, why: 'Inner cannula blockage is common.' },
    { q: 'A suction catheter will not pass a tracheostomy tube. Next step:', options: ['Inflate the cuff', 'Deflate the cuff and reassess', 'Insert a smaller suction catheter', 'Give sedation'], answer: 1, why: 'Deflating the cuff may allow airflow around the tube.' },
    { q: 'A tracheostomy placed 3 days ago is displaced. Main concern:', options: ['Mature tract', 'Immature tract — recannulation risk and false passage', 'Infection only', 'No concern'], answer: 1, why: 'Fresh tracts may close or create false passages.' },
    { q: 'ACE-inhibitor angioedema is mediated by:', options: ['Histamine', 'Bradykinin', 'IgE', 'Leukotrienes'], answer: 1, why: 'Bradykinin; adrenaline and antihistamines are often ineffective.' },
    { q: 'Which suggests airway involvement in a burn victim?', options: ['Burns to the legs', 'Carbonaceous sputum and hoarseness', 'Normal voice', 'Isolated hand burn'], answer: 1, why: 'Soot and voice change indicate inhalation injury.' },
    { q: 'Preferred tube size when intubating an inhalation injury adult:', options: ['6.0', '7.5–8.0 or larger', '5.0', 'SGA only'], answer: 1, why: 'Large tubes allow bronchoscopy and secretion clearance.' },
    { q: 'An expanding neck haematoma after a stab wound:', options: ['Use blind nasal intubation', 'Prepare for awake or surgical airway with expert help', 'Delay airway', 'Use NPA only'], answer: 1, why: 'Distorted anatomy risks false passages.' },
    { q: 'Can a tracheostomy patient be orally intubated?', options: ['Never', 'Yes, upper airway remains connected', 'Only with a laryngectomy', 'Only with a cuffed trach'], answer: 1, why: 'Cover the stoma and intubate from above if needed.' },
    { q: 'Best oxygenation via a stoma when no trach tube is in place:', options: ['Nasal cannula', 'Paediatric face mask or LMA over the stoma', 'Venturi to mouth', 'NRB to mouth'], answer: 1, why: 'Small masks seal over a stoma.' },
  ],
  sources: [
    { title: 'National Tracheostomy Safety Project: emergency algorithms', url: 'https://www.tracheostomy.org.uk/healthcare-staff/emergency-care' },
    { title: 'StatPearls: Angioedema', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Angioedema+StatPearls' },
  ],
};

export const TUBE_CONFIRM: FpcLesson = {
  id: 'fpc-tube-confirm', domain: 'airway', ref: 'III.11',
  title: 'Tube confirmation and monitoring',
  summary: 'Waveform capnography as the standard for confirmation, the limits of every other sign, securing and depth, and continuous monitoring through transport.',
  objectives: [
    'Confirm endotracheal placement with waveform capnography and explain why other signs are unreliable.',
    'Interpret an absent or decaying capnogram after intubation.',
    'Secure the tube, document depth and monitor cuff pressure.',
  ],
  sections: [
    {
      id: 'standard', title: 'The standard: sustained waveform capnography', core: true,
      body: [
        'A sustained, rectangular capnography waveform over several breaths confirms that the tube delivers gas to and from perfused lungs. Professional guidelines treat continuous waveform capnography as mandatory for confirmation and monitoring of every intubated patient, including during transport. "No trace = wrong place" until proven otherwise.',
        'An oesophageal tube may briefly show CO₂ if the stomach contains exhaled gas from mask ventilation or carbonated drinks, but the trace decays to zero within a few breaths. A tube above the cords can show a trace but will leak and dislodge.',
        'In cardiac arrest, CO₂ delivery to the lungs falls with low flow, but high-quality CPR usually produces a measurable, if low, waveform. A flat trace during CPR should prompt reassessment of tube position (visualise with the laryngoscope) rather than acceptance.',
      ],
    },
    {
      id: 'other', title: 'Other signs and their limits',
      body: [
        'Visualising the tube pass through the cords is strong evidence at the time but does not protect against later displacement. Breath sounds are unreliable in noisy aircraft and may be transmitted from the stomach. Chest rise, misting of the tube and colorimetric CO₂ detectors support placement but are less reliable than waveforms. Ultrasound can show tracheal versus oesophageal placement and bilateral lung sliding. A chest X-ray shows depth, not tracheal versus oesophageal placement.',
        'Oesophageal detector devices (bulb or syringe) are unreliable in obesity, pregnancy and with copious secretions. Pulse oximetry falls late after oesophageal intubation, particularly after good pre-oxygenation — saturation can remain high for minutes with the tube in the oesophagus.',
      ],
    },
    {
      id: 'depth', title: 'Depth, securing and cuff pressure', core: true,
      body: [
        'In adults, a depth of about 21 cm at the incisors in women and 23 cm in men is typical; in children over about two years, three times the tube size or (age ÷ 2) + 12 cm at the lips. Confirm bilateral air entry and, when available, imaging or ultrasound. Document the depth and recheck it after every move.',
        'Neck flexion moves the tube tip toward the carina; extension moves it toward the cords. In small children a few centimetres of movement can extubate or cause mainstem intubation.',
        'Cuff pressure should be about 20–30 cmH₂O, measured with a manometer. Over-inflation causes tracheal mucosal ischaemia; under-inflation allows aspiration and leak. At altitude in unpressurised cabins, air in the cuff expands; check and adjust.',
      ],
    },
    {
      id: 'monitor', title: 'Continuous monitoring in transport', core: true,
      body: [
        'Keep capnography connected from intubation to handover. A sudden loss of the waveform means displacement, disconnection or obstruction until proven otherwise; a sudden fall to a low value suggests cardiac arrest or massive embolism; a gradual rise suggests hypoventilation or rising metabolism; a "shark-fin" upstroke suggests bronchospasm or obstruction.',
        'Before every move — onto the stretcher, into the aircraft, at the receiving facility — recheck depth and waveform. Many unplanned extubations occur during these transfers.',
      ],
    },
  ],
  keyPoints: [
    'Sustained waveform capnography is the standard for confirmation and continuous monitoring.',
    'No trace = wrong place, including during CPR — re-look with the laryngoscope.',
    'Breath sounds, colour change and SpO₂ are unreliable alone.',
    'Typical adult depth 21 (female) / 23 (male) cm at teeth; children 3 × tube size.',
    'Cuff pressure 20–30 cmH₂O; it rises with altitude.',
  ],
  pearls: ['Neck flexion pushes the tube in; extension pulls it out.', 'SpO₂ can stay high for minutes after oesophageal intubation.'],
  pitfalls: ['Accepting a flat capnogram during CPR as "low flow".', 'Moving the patient without rechecking depth and trace.'],
  questions: [
    { q: 'The most reliable confirmation of ETT placement:', options: ['Breath sounds', 'Colorimetric detector', 'Sustained waveform capnography', 'Chest X-ray'], answer: 2, why: 'Sustained waveforms over several breaths confirm ventilation of perfused lungs.' },
    { q: 'A capnogram shows CO₂ for 3 breaths then falls to zero. Most likely:', options: ['Tracheal placement', 'Oesophageal placement', 'Bronchospasm', 'Hyperventilation'], answer: 1, why: 'Gastric CO₂ washes out within a few breaths.' },
    { q: 'During CPR the trace is flat. You should:', options: ['Accept it as low flow', 'Reconfirm placement with laryngoscopy', 'Increase compression rate only', 'Stop CPR'], answer: 1, why: 'High-quality CPR usually yields a waveform.' },
    { q: 'A chest X-ray can confirm:', options: ['Tracheal vs oesophageal placement reliably', 'Tube depth', 'Cuff pressure', 'Ventilation adequacy'], answer: 1, why: 'It shows depth, not reliably oesophageal placement.' },
    { q: 'Neck flexion moves the tube tip:', options: ['Toward the cords', 'Toward the carina', 'Not at all', 'Laterally'], answer: 1, why: 'Flexion pushes the tube deeper.' },
    { q: 'Target cuff pressure:', options: ['5–10 cmH₂O', '20–30 cmH₂O', '40–50 cmH₂O', '60 cmH₂O'], answer: 1, why: 'Prevents ischaemia and leak.' },
    { q: 'Tube depth at the lips for a 6-year-old with a 5.5 tube:', options: ['About 12 cm', 'About 16–17 cm', 'About 22 cm', 'About 8 cm'], answer: 1, why: '3 × 5.5 = 16.5 cm or (6/2)+12 = 15 cm.' },
    { q: 'Why is SpO₂ a poor early sign of oesophageal intubation?', options: ['Oximeters are inaccurate', 'Pre-oxygenation keeps saturation high for minutes', 'It reads too low', 'It measures CO₂'], answer: 1, why: 'Desaturation is delayed.' },
    { q: 'A sudden loss of the waveform mid-flight most likely means:', options: ['Improved ventilation', 'Displacement, disconnection or obstruction', 'Hyperthermia', 'Normal variation'], answer: 1, why: 'Treat as displacement until proven otherwise.' },
    { q: 'Typical adult male depth at the incisors:', options: ['17 cm', '19 cm', '23 cm', '28 cm'], answer: 2, why: 'About 23 cm in men, 21 cm in women.' },
  ],
  sources: [
    { title: 'Cook TM et al. NAP4: major complications of airway management. Br J Anaesth (2011)', url: 'https://www.nationalauditprojects.org.uk/NAP4_home' },
    { title: 'AHA guidelines for CPR and ECC: advanced airway confirmation', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines' },
  ],
};
