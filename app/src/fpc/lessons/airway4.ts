/** FP-C III.7–III.8: mechanical ventilation in transport; alternative airway devices. */
import type { FpcLesson } from '../types';

export const MECH_VENT: FpcLesson = {
  id: 'fpc-mech-vent', domain: 'airway', ref: 'III.7',
  title: 'Mechanical ventilation in transport',
  summary: 'Modes, initial settings, lung-protective ventilation, troubleshooting with DOPE and the inspiratory hold, and disease-specific strategies for ARDS, obstruction, acidosis and brain injury.',
  objectives: [
    'Set initial ventilator settings from predicted body weight and the clinical problem.',
    'Interpret peak, plateau and driving pressure, and troubleshoot alarms.',
    'Adjust ventilation for ARDS, asthma/COPD, metabolic acidosis and raised ICP.',
  ],
  sections: [
    {
      id: 'modes', title: 'Modes: what you set and what varies', core: true,
      body: [
        'In volume control (VC), you set the tidal volume, rate, flow (or inspiratory time), PEEP and FiO₂. The ventilator guarantees the volume; airway pressure is the result and rises when compliance falls or resistance rises. Watch the peak and plateau pressures.',
        'In pressure control (PC), you set the inspiratory pressure above PEEP, inspiratory time, rate, PEEP and FiO₂. Pressure is capped; tidal volume is the result and falls when the lungs stiffen or the airways narrow. Watch the exhaled tidal volume and minute ventilation.',
        'Assist-control (AC) delivers a full mandatory breath, volume- or pressure-targeted, every time the patient triggers, plus backup breaths at the set rate. SIMV delivers set mandatory breaths synchronised with patient effort and allows spontaneous breaths between them, usually with pressure support. Pressure support (PS) alone requires the patient to trigger every breath and is not appropriate for a paralysed or apnoeic patient.',
      ],
    },
    {
      id: 'initial', title: 'Initial settings', core: true,
      body: [
        'Base tidal volume on predicted body weight (PBW), not actual weight — the lungs are the size of the person\'s height. PBW is 50 + 0.91 × (height in cm − 152.4) kg for men and 45.5 + 0.91 × (height − 152.4) for women. A starting tidal volume of 6–8 mL/kg PBW is lung-protective for most patients; use 6 mL/kg in ARDS.',
        'A typical adult start: AC/VC, VT 6–8 mL/kg PBW, rate 16–20, PEEP 5–8 cmH₂O, FiO₂ 1.0 then titrated to SpO₂ 92–96 %, inspiratory time about 1 second or an I:E ratio of 1:2. Then adjust: match the patient\'s pre-intubation minute ventilation if they were compensating for an acidosis; lengthen expiration in obstruction.',
        'Check an arterial or venous gas and end-tidal CO₂ trends after settings change. EtCO₂ normally runs a few mmHg below PaCO₂; the gap widens with dead space (low cardiac output, pulmonary embolism, COPD, overdistension).',
      ],
      table: {
        caption: 'Predicted body weight and 6 mL/kg tidal volume',
        head: ['Height', 'PBW (male)', 'VT 6 mL/kg (male)', 'PBW (female)', 'VT 6 mL/kg (female)'],
        rows: [
          ['160 cm', '57 kg', '340 mL', '52 kg', '315 mL'],
          ['170 cm', '66 kg', '400 mL', '62 kg', '370 mL'],
          ['180 cm', '75 kg', '450 mL', '71 kg', '425 mL'],
          ['190 cm', '84 kg', '505 mL', '80 kg', '480 mL'],
        ],
      },
    },
    {
      id: 'pressures', title: 'Reading the pressures', core: true,
      body: [
        'Peak inspiratory pressure (PIP) is the pressure needed to push the tidal volume through the airways and stretch the lungs and chest wall. Plateau pressure (Pplat), measured with an inspiratory hold of about 0.5 seconds when flow is zero, reflects only the elastic component. Keep the plateau at or below 30 cmH₂O.',
        'Driving pressure is plateau minus PEEP. It expresses how hard the tidal volume stretches the available lung; lower driving pressures (below about 15 cmH₂O) are associated with better outcomes in ARDS. Static compliance is tidal volume divided by driving pressure.',
        'High peak with a normal plateau (a large peak–plateau gap) is a resistance problem: kinked or bitten tube, secretions, bronchospasm, small tube. High peak with a high plateau is a compliance problem: pneumothorax, mainstem intubation, pulmonary oedema, ARDS, abdominal distension, chest wall rigidity, auto-PEEP.',
      ],
    },
    {
      id: 'dope', title: 'The crashing ventilated patient: DOPE', core: true,
      body: [
        'If a ventilated patient suddenly desaturates or becomes hypotensive, disconnect from the ventilator and ventilate by hand with a BVM on 100 % oxygen. This separates machine problems from patient problems and immediately relieves breath stacking. Then work through DOPE.',
      ],
      list: { caption: 'DOPE (plus S for stacking)', items: ['Displacement: tube out or in a mainstem bronchus — capnography, depth, breath sounds.', 'Obstruction: kink, biting, secretions, blood — pass a suction catheter.', 'Pneumothorax: unilateral sounds, rising pressures, hypotension — decompress.', 'Equipment: oxygen supply, circuit disconnection, ventilator failure.', 'Stacked breaths (auto-PEEP): disconnect and let the chest empty; lower rate and lengthen expiration.'] },
    },
    {
      id: 'disease', title: 'Disease-specific strategies',
      body: [
        'ARDS: VT 6 mL/kg PBW (4–8), plateau ≤ 30, PEEP set by an oxygenation table or response (often 10–16 or higher), accept PaCO₂ elevation if pH > 7.20–7.25, and consider prone positioning and neuromuscular blockade in severe disease at the receiving centre.',
        'Asthma and COPD: the danger is air trapping. Use a low rate (8–12), a normal tidal volume, a short inspiratory time with a high flow, and an I:E ratio of 1:4 or longer so expiratory flow returns to zero before the next breath. Accept hypercapnia. Measure auto-PEEP with an expiratory hold; if the blood pressure falls, disconnect and allow the chest to empty.',
        'Severe metabolic acidosis (DKA, salicylates, sepsis): set a high minute ventilation that matches the patient\'s own pre-intubation effort — often a rate of 28–35 with an adequate volume — and check a gas early. Over-ventilating a salicylate patient is protective; under-ventilating can cause arrest.',
        'Raised ICP: aim for normocapnia (PaCO₂ 35–40 mmHg, using EtCO₂ trends) and normal oxygenation. Brief hyperventilation to PaCO₂ about 30–35 is a temporising measure only for signs of herniation; prolonged hyperventilation causes cerebral vasoconstriction and ischaemia.',
      ],
      example: {
        case: 'A 175 cm woman with asthma, intubated; VC with VT 450, RR 20, PEEP 5. Peak 52, plateau 24. BP falls to 76/40.',
        steps: [
          'Peak–plateau gap of 28: high resistance; plateau acceptable.',
          'Hypotension with obstruction: suspect breath stacking. Disconnect from the ventilator and compress the chest gently while it empties.',
          'Reconnect with RR 10, a shorter inspiratory time, VT about 400 (6 mL/kg PBW for her height is ≈ 400), PEEP low; check expiratory flow reaches zero.',
          'Treat the airway: inhaled bronchodilator in-line, IV magnesium, ketamine for sedation; accept a higher CO₂.',
        ],
      },
    },
    {
      id: 'altitude', title: 'Transport specifics',
      body: [
        'Altitude reduces the partial pressure of oxygen; in unpressurised aircraft or at high cabin altitudes, expect to raise FiO₂ to maintain the same saturation. Gas in the endotracheal tube cuff expands with altitude (Boyle\'s law) — monitor cuff pressure and adjust, or fill the cuff with saline on long or high flights if your protocol allows.',
        'Transport ventilators differ: some compensate for altitude in delivered volume, some do not; know your device. Secure the tube and circuit before moving, carry a BVM with PEEP valve, and calculate oxygen requirement for the flight with a reserve.',
      ],
    },
  ],
  keyPoints: [
    'VC sets volume (watch pressure); PC sets pressure (watch volume).',
    'VT 6–8 mL/kg predicted body weight; plateau ≤ 30; driving pressure < 15.',
    'Big peak–plateau gap = resistance; high plateau = compliance.',
    'Crashing patient: disconnect, bag on 100 %, then DOPE plus stacked breaths.',
    'Obstruction: low rate, long expiration; acidosis: high minute ventilation; raised ICP: normocapnia.',
  ],
  pearls: ['Height, not weight, decides the tidal volume.', 'Disconnecting the circuit is diagnostic and therapeutic in auto-PEEP.', 'Cuff pressure rises at altitude.'],
  pitfalls: ['Pressure support in a paralysed patient.', 'Fast rates in asthma.', 'Normal settings in severe metabolic acidosis.'],
  live: [{ id: 'eom', label: 'One equation runs the ventilator' }, { id: 'rc', label: 'Resistance or compliance?' }, { id: 'vent-ards-signature', label: 'ARDS: open the lung' }, { id: 'auto', label: 'Auto-PEEP and the time constant' }],
  questions: [
    { q: 'PBW for a 180 cm man is about:', options: ['60 kg', '75 kg', '90 kg', 'Equal to actual weight'], answer: 1, why: '50 + 0.91 × (180 − 152.4) ≈ 75 kg.' },
    { q: 'Peak 45, plateau 20 cmH₂O suggests:', options: ['Pneumothorax', 'Increased airway resistance', 'ARDS', 'Mainstem intubation'], answer: 1, why: 'A large peak–plateau gap is resistive.' },
    { q: 'Upper limit for plateau pressure in lung-protective ventilation:', options: ['20', '30', '40', '50 cmH₂O'], answer: 1, why: 'Keep plateau ≤ 30 cmH₂O.' },
    { q: 'In pressure control, a falling exhaled VT suggests:', options: ['Improving compliance', 'Worsening compliance or resistance', 'Leak only', 'Normal'], answer: 1, why: 'Pressure is capped; stiffer lungs receive less volume.' },
    { q: 'First action for sudden desaturation on the ventilator:', options: ['Increase PEEP', 'Disconnect and bag with 100 % oxygen', 'Order a chest X-ray', 'Increase rate'], answer: 1, why: 'Separates machine from patient and relieves stacking.' },
    { q: 'Best initial strategy for intubated status asthmaticus:', options: ['RR 24, I:E 1:1', 'RR 10, short inspiratory time, long expiration', 'High PEEP 15', 'Large VT 10 mL/kg'], answer: 1, why: 'Minimise air trapping.' },
    { q: 'Driving pressure equals:', options: ['PIP − PEEP', 'Pplat − PEEP', 'PIP − Pplat', 'VT ÷ PEEP'], answer: 1, why: 'Plateau minus PEEP.' },
    { q: 'A ventilated DKA patient with pH 7.05 should have:', options: ['Low minute ventilation', 'Minute ventilation matching their pre-intubation effort', 'Permissive hypercapnia', 'PS only'], answer: 1, why: 'Preserve respiratory compensation.' },
    { q: 'Target PaCO₂ in severe TBI without herniation signs:', options: ['25–30', '35–40', '45–50', '>55'], answer: 1, why: 'Normocapnia; hyperventilation only as a bridge for herniation.' },
    { q: 'ETT cuff pressure during ascent in an unpressurised aircraft:', options: ['Falls', 'Rises', 'Unchanged', 'Becomes negative'], answer: 1, why: 'Boyle\'s law: gas expands as ambient pressure falls.' },
  ],
  sources: [
    { title: 'ARDS Network. Ventilation with lower tidal volumes. NEJM (2000)', url: 'https://www.nejm.org/doi/full/10.1056/NEJM200005043421801' },
    { title: 'Amato MBP et al. Driving pressure and survival in ARDS. NEJM (2015)', url: 'https://www.nejm.org/doi/full/10.1056/NEJMsa1410639' },
  ],
};

export const ALT_AIRWAY: FpcLesson = {
  id: 'fpc-alt-airway', domain: 'airway', ref: 'III.8',
  title: 'Alternative airway devices',
  summary: 'Supraglottic airways, video and direct laryngoscopes, bougies and stylets, and the basic adjuncts: what each is for, how to size it, and how it fails.',
  objectives: [
    'Select and size supraglottic airways and know first- versus second-generation designs.',
    'Compare direct, standard-geometry video and hyperangulated video laryngoscopy.',
    'Use oral and nasal adjuncts correctly and know their contraindications.',
  ],
  sections: [
    {
      id: 'adjuncts', title: 'Basic adjuncts', core: true,
      body: [
        'An oropharyngeal airway (OPA) lifts the tongue off the posterior pharynx. Size from the incisors (or corner of the mouth) to the angle of the jaw. It is tolerated only by patients without a gag reflex; in a patient with a gag it causes vomiting and laryngospasm.',
        'A nasopharyngeal airway (NPA) is tolerated by patients with an intact gag. Size from the nostril to the tragus, lubricate, and insert along the floor of the nose with the bevel toward the septum. Basilar skull fracture is a traditional contraindication, though the risk is very small with careful technique when the airway is otherwise lost. Use two NPAs plus an OPA with two-handed mask ventilation in difficult cases.',
      ],
    },
    {
      id: 'sga', title: 'Supraglottic airways', core: true,
      body: [
        'Supraglottic airways (SGAs) sit above the glottis and seal around the laryngeal inlet. First-generation devices (classic laryngeal mask airway) have a single lumen. Second-generation devices (such as the i-gel or LMA Supreme) add a gastric drainage channel, a bite block and a higher seal pressure, making them better rescue devices and allowing gastric decompression.',
        'Retroglottic devices such as the King LT sit with the distal tip in the oesophagus and balloons above and below the larynx. They are quick to place blind but can cause tongue swelling with prolonged use and are sometimes difficult to exchange.',
        'Sizing is by weight (or height for some devices) — check the device. Insert with the head in a neutral or sniffing position, the device lubricated on its back, along the hard palate until resistance. Confirm with capnography, chest rise and absence of a large leak.',
        'SGAs do not protect fully against aspiration, can leak at high airway pressures (poor lungs, obesity, bronchospasm), and fail with obstruction at or below the larynx. They are an excellent bridge and a reasonable transport airway when intubation is not possible.',
      ],
      table: {
        caption: 'i-gel sizes (manufacturer weight guide)',
        head: ['Size', 'Patient weight'],
        rows: [['1', '2–5 kg'], ['1.5', '5–12 kg'], ['2', '10–25 kg'], ['2.5', '25–35 kg'], ['3', '30–60 kg'], ['4', '50–90 kg'], ['5', '90+ kg']],
      },
    },
    {
      id: 'laryngoscopes', title: 'Laryngoscopes', core: true,
      body: [
        'Direct laryngoscopy aligns the oral, pharyngeal and laryngeal axes to see the cords directly. It is quick, robust in heavy contamination and works when the camera fails, but needs neck extension and mandibular space.',
        'Standard-geometry video laryngoscopes (Macintosh-shaped blades with a camera) allow both direct and indirect views and work with a standard stylet or bougie. Hyperangulated blades see around the tongue with minimal neck movement, which helps in spinal precautions and anterior larynges, but the tube must follow a steep curve: a rigid angled stylet shaped to the blade is needed, and seeing the cords does not guarantee delivering the tube.',
        'Video laryngoscopy improves first-pass success in many emergency settings and lets the team see the view. Fogging, blood and secretions on the lens and screen glare in sunlight are its main field limitations.',
      ],
    },
    {
      id: 'bougie', title: 'Bougies, stylets and exchange',
      body: [
        'A bougie (tracheal tube introducer) has an angled tip that can be steered anterior to the arytenoids in a limited view. Tracheal placement is suggested by clicks against tracheal rings and hold-up at the small airways; oesophageal placement passes without resistance. First-pass success with a bougie on every attempt was higher than with a stylet in some emergency trials.',
        'To convert an SGA to an endotracheal tube, intubating SGAs and fibreoptic or airway-exchange-catheter techniques exist; they are skills best practised before needed. In transport, a functioning SGA is often safer to keep than to exchange in a moving aircraft.',
      ],
    },
  ],
  keyPoints: [
    'OPA only without a gag; NPA tolerated with a gag (bevel to septum).',
    'Second-generation SGAs: gastric drain, better seal — preferred for rescue.',
    'SGAs leak at high pressures and fail with obstruction at or below the glottis.',
    'Hyperangulated video blades need a rigid shaped stylet; seeing is not delivering.',
    'Bougie clicks and distal hold-up suggest tracheal placement.',
  ],
  pearls: ['Keep a direct blade available when blood blinds the camera.', 'A working SGA in flight is often better than a risky exchange.'],
  pitfalls: ['OPA in a patient with a gag reflex.', 'Hyperangulated blade with a straight-to-cuff stylet.'],
  questions: [
    { q: 'An OPA is sized from:', options: ['Nostril to tragus', 'Incisors to angle of jaw', 'Chin to sternum', 'Ear to eye'], answer: 1, why: 'Incisors/mouth corner to the angle of the mandible.' },
    { q: 'An NPA is inserted with the bevel toward:', options: ['The lateral wall', 'The septum', 'The floor', 'Upward'], answer: 1, why: 'Bevel to the septum reduces turbinate trauma.' },
    { q: 'A key feature of second-generation SGAs:', options: ['Single lumen', 'Gastric drainage channel', 'No cuff', 'Requires laryngoscope'], answer: 1, why: 'Drain channel, bite block and higher seal pressure.' },
    { q: 'An i-gel size 4 is for about:', options: ['10–25 kg', '30–60 kg', '50–90 kg', '>90 kg'], answer: 2, why: 'Manufacturer guide: size 4 for 50–90 kg.' },
    { q: 'SGAs are most likely to fail with:', options: ['Edentulous patients', 'Obstruction below the glottis', 'Normal lungs', 'Neutral head position'], answer: 1, why: 'They seal above the glottis.' },
    { q: 'Hyperangulated video laryngoscopy requires:', options: ['A straight stylet', 'A rigid stylet shaped to the blade curve', 'No stylet', 'Cricoid pressure'], answer: 1, why: 'The tube must follow the steep curve.' },
    { q: 'Main field limitation of video laryngoscopy:', options: ['Needs neck extension', 'Blood and secretions on the camera', 'Cannot use a bougie', 'Slower than direct'], answer: 1, why: 'Contamination blinds the lens.' },
    { q: 'Retroglottic devices like the King LT sit with the tip in the:', options: ['Trachea', 'Oesophagus', 'Nasopharynx', 'Vallecula'], answer: 1, why: 'Distal tip and balloon in the oesophagus.' },
    { q: 'Absence of resistance as a bougie is advanced deeply suggests:', options: ['Tracheal placement', 'Oesophageal placement', 'Bronchospasm', 'Mainstem'], answer: 1, why: 'Trachea gives clicks and hold-up; the oesophagus does not.' },
    { q: 'A patient with a strong gag reflex needs an airway adjunct while awaiting RSI. Best choice:', options: ['OPA', 'NPA', 'SGA', 'None'], answer: 1, why: 'NPAs are tolerated with an intact gag.' },
  ],
  sources: [
    { title: 'StatPearls: Laryngeal mask airway', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Laryngeal+mask+airway+StatPearls' },
    { title: 'Driver BE et al. Bougie vs stylet for first-attempt success (BEAM). JAMA (2018)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2686035' },
  ],
};
