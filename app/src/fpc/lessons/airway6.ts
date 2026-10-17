/** FP-C III.12–III.14: airway suctioning; waveform capnography; non-invasive positive pressure ventilation. */
import type { FpcLesson } from '../types';

export const SUCTION: FpcLesson = {
  id: 'fpc-suction', domain: 'airway', ref: 'III.12',
  title: 'Airway suctioning',
  summary: 'Oral, nasal and endotracheal suction: equipment, pressures, catheter sizing, technique and complications, and decontaminating a soiled airway.',
  objectives: [
    'Choose suction equipment and catheter size for oral and endotracheal suction.',
    'Perform endotracheal suctioning safely, limiting hypoxaemia and trauma.',
    'Manage massive airway contamination.',
  ],
  sections: [
    {
      id: 'equipment', title: 'Equipment and settings', core: true,
      body: [
        'Rigid (Yankauer or large-bore) catheters clear the oropharynx of blood, vomit and particulate matter. Large-bore rigid catheters clear thick material far faster than standard Yankauers. Soft (French) catheters pass through endotracheal and tracheostomy tubes or the nose.',
        'Typical suction pressures are 80–120 mmHg for endotracheal suction in adults (lower in children and neonates, often 60–100 mmHg and 60–80 mmHg respectively); oropharyngeal clearance of heavy contamination may use higher settings. Follow your device and protocol.',
        'Size an endotracheal suction catheter so it occludes no more than about half the internal diameter of the tube; a quick rule is catheter size in French ≈ 2 × the tube size in mm (for example, a 14 Fr catheter for a 7.0 tube). Too large a catheter can evacuate the lungs and cause atelectasis.',
      ],
    },
    {
      id: 'technique', title: 'Endotracheal suction technique', core: true,
      body: [
        'Pre-oxygenate with FiO₂ 1.0 for 30–60 seconds. Insert the catheter without suction to the carina or until resistance, withdraw 1 cm, then apply suction while withdrawing with a rotating motion. Limit each pass to about 10–15 seconds in adults (shorter in children). Allow re-oxygenation between passes.',
        'Closed in-line suction systems allow suctioning without disconnecting the ventilator, preserving PEEP and reducing aerosol exposure — preferable in ARDS, high PEEP, and infectious disease. Routine saline instillation is not recommended: it can worsen oxygenation and spread contamination.',
        'Watch for hypoxaemia, bradycardia (vagal stimulation), arrhythmias, raised intracranial pressure, mucosal trauma and bleeding, and bronchospasm.',
      ],
    },
    {
      id: 'contaminated', title: 'The contaminated airway', core: true,
      body: [
        'Massive regurgitation or haemorrhage defeats laryngoscopy and fills the lungs. Position head-up if possible, use a large-bore rigid suction catheter, and lead with it during laryngoscopy (suction-assisted laryngoscopy and airway decontamination, SALAD). After clearing the oropharynx, park the catheter in the upper oesophagus to the left of the blade to control ongoing regurgitation.',
        'After intubation, suction through the tube before ventilating if aspirated material is present; bronchoscopy at the receiving centre may be needed for particulate aspiration.',
      ],
    },
  ],
  keyPoints: [
    'Rigid large-bore catheters for the mouth; soft catheters for tubes.',
    'Catheter French size ≈ 2 × ETT size (≤ half the lumen).',
    'Pre-oxygenate; suction on withdrawal only; 10–15 s per pass in adults.',
    'Closed in-line suction preserves PEEP; avoid routine saline.',
    'SALAD for massive contamination.',
  ],
  pearls: ['A standard Yankauer clogs with thick vomit — carry a large-bore option.'],
  pitfalls: ['Prolonged suction passes in hypoxaemic children.', 'Routine saline instillation.'],
  questions: [
    { q: 'Appropriate suction catheter for a 7.5 ETT:', options: ['8 Fr', '14 Fr', '20 Fr', '24 Fr'], answer: 1, why: '≈ 2 × 7.5 = 15; choose 14 Fr (≤ half the lumen).' },
    { q: 'Apply suction during:', options: ['Insertion', 'Withdrawal', 'Both', 'Neither'], answer: 1, why: 'Insert without suction, then suction while withdrawing.' },
    { q: 'Maximum duration of a single adult suction pass:', options: ['5 s', '10–15 s', '30 s', '60 s'], answer: 1, why: 'Limits hypoxaemia.' },
    { q: 'Closed in-line suction is preferred in:', options: ['Low PEEP', 'ARDS with high PEEP', 'Spontaneous breathing without a tube', 'Oral suction'], answer: 1, why: 'Preserves PEEP and reduces aerosol.' },
    { q: 'Routine saline instillation before suctioning:', options: ['Recommended', 'Not recommended', 'Required for thick secretions', 'Improves oxygenation'], answer: 1, why: 'It can worsen oxygenation.' },
    { q: 'A vagal response to suction causes:', options: ['Tachycardia', 'Bradycardia', 'Hypertension only', 'Hyperthermia'], answer: 1, why: 'Vagal stimulation slows the heart.' },
    { q: 'Typical adult ET suction pressure:', options: ['20–40 mmHg', '80–120 mmHg', '200–300 mmHg', '400 mmHg'], answer: 1, why: 'Protocol ranges commonly 80–120 mmHg.' },
    { q: 'In SALAD, after clearing the pharynx the suction catheter is parked:', options: ['In the trachea', 'In the upper oesophagus left of the blade', 'Outside the mouth', 'In the nose'], answer: 1, why: 'It controls ongoing regurgitation.' },
    { q: 'Too large a suction catheter can cause:', options: ['Atelectasis', 'Hyperinflation', 'Hyperkalaemia', 'Hypertension only'], answer: 0, why: 'It evacuates lung volume.' },
    { q: 'Before ET suction, pre-oxygenate with:', options: ['Room air', 'FiO₂ 1.0 for 30–60 s', 'No oxygen', 'Nitrous oxide'], answer: 1, why: 'Reduces suction-induced hypoxaemia.' },
  ],
  sources: [
    { title: 'AARC Clinical Practice Guideline: endotracheal suctioning of mechanically ventilated patients (2010)', url: 'https://www.aarc.org/wp-content/uploads/2014/08/06.10.0758.pdf' },
    { title: 'Root CW et al. Suction-assisted laryngoscopy and airway decontamination (SALAD). Resuscitation (2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/31739032/' },
  ],
};

export const CAPNOGRAPHY: FpcLesson = {
  id: 'fpc-capnography', domain: 'airway', ref: 'III.13',
  title: 'Waveform capnography',
  summary: 'The four phases of the capnogram, what each abnormal shape means, the PaCO₂–EtCO₂ gap, and capnography in cardiac arrest, sedation and head injury.',
  objectives: [
    'Name the phases of a normal capnogram.',
    'Recognise bronchospasm, rebreathing, leak, oesophageal placement, hypoventilation and arrest on the waveform.',
    'Use EtCO₂ in CPR, ROSC detection, sedation and brain injury.',
  ],
  sections: [
    {
      id: 'phases', title: 'The normal capnogram', core: true,
      body: [
        'Phase I is the inspiratory baseline, near zero, as dead-space gas without CO₂ leaves first. Phase II is the expiratory upstroke as alveolar gas mixes with dead space. Phase III is the alveolar plateau, ending in the end-tidal value (normally 35–45 mmHg). Phase 0 (sometimes called phase IV) is the inspiratory downstroke as fresh gas enters.',
        'EtCO₂ is usually 2–5 mmHg below PaCO₂ in healthy lungs. The gap widens with dead space: low cardiac output, pulmonary embolism, COPD, overdistension, and hypovolaemia. In those patients EtCO₂ underestimates PaCO₂, so trend EtCO₂ against a blood gas.',
      ],
      table: {
        caption: 'Waveform patterns',
        head: ['Pattern', 'Meaning'],
        rows: [
          ['Sustained normal rectangles', 'Tracheal tube, ventilating perfused lungs'],
          ['Decay to zero over a few breaths', 'Oesophageal intubation'],
          ['Sudden loss of waveform', 'Disconnection, displacement, complete obstruction'],
          ['"Shark fin" (sloped upstroke, no plateau)', 'Bronchospasm, COPD, partial obstruction'],
          ['Baseline does not return to zero', 'Rebreathing (exhausted absorber, insufficient flow, valve failure)'],
          ['Gradually rising EtCO₂', 'Hypoventilation, rising metabolism (fever, MH), bicarbonate'],
          ['Sudden fall in EtCO₂', 'Cardiac arrest, massive PE, sudden hypotension, leak'],
          ['Cleft in the plateau ("curare cleft")', 'Spontaneous effort against the ventilator'],
        ],
      },
    },
    {
      id: 'arrest', title: 'Capnography in cardiac arrest', core: true,
      body: [
        'During CPR, EtCO₂ reflects pulmonary blood flow generated by compressions. A value persistently below about 10 mmHg suggests poor-quality compressions — change compressors, check depth and rate — or a very poor prognosis when it persists after prolonged resuscitation despite good CPR (interpreted alongside other factors, never alone).',
        'A sudden rise in EtCO₂ (often to 35–45 mmHg or more) during compressions is an early sign of return of spontaneous circulation, often before a pulse is palpable. Bicarbonate administration also transiently raises EtCO₂, which must be distinguished from ROSC.',
      ],
    },
    {
      id: 'uses', title: 'Other uses', core: true,
      body: [
        'Sedation and opioids: nasal-oral capnography detects hypoventilation and apnoea before oxygen saturation falls, particularly when supplemental oxygen keeps SpO₂ high.',
        'Brain injury: target normocapnia (PaCO₂ 35–40). Establish the PaCO₂–EtCO₂ gap with a blood gas, then ventilate to the EtCO₂ that corresponds; hyperventilate only briefly for signs of herniation.',
        'Metabolic acidosis: in a spontaneously breathing patient a very low EtCO₂ reflects respiratory compensation (for example, in DKA); after intubation, preserving that low CO₂ is essential.',
        'Shock: falling EtCO₂ at constant ventilation suggests falling cardiac output.',
      ],
      example: {
        case: 'A ventilated TBI patient: EtCO₂ 30, PaCO₂ on the gas 38, BP 84/50.',
        steps: [
          'The gap is 8 mmHg — wider than normal, consistent with reduced pulmonary perfusion from hypotension.',
          'PaCO₂ is already in the normocapnic target; do not increase ventilation to push EtCO₂ up.',
          'Treat the hypotension to protect cerebral perfusion; recheck the gap after resuscitation.',
        ],
      },
    },
  ],
  keyPoints: [
    'Phases: I baseline, II upstroke, III plateau (EtCO₂), 0 downstroke.',
    'EtCO₂ normally 2–5 below PaCO₂; the gap widens with dead space and low output.',
    'Shark fin = bronchospasm; non-zero baseline = rebreathing; decay to zero = oesophagus.',
    'CPR: EtCO₂ < 10 → improve compressions; sudden rise → ROSC.',
    'Capnography detects hypoventilation before SpO₂ in sedated patients.',
  ],
  pearls: ['Calibrate the EtCO₂ target to a blood gas in brain injury.', 'Bicarbonate causes a transient EtCO₂ rise that mimics ROSC.'],
  pitfalls: ['Using EtCO₂ as a direct PaCO₂ substitute in shock.', 'Relying on SpO₂ alone for sedation monitoring on oxygen.'],
  live: [{ id: 'hypox', label: 'Why is the PaO₂ low? (dead space)' }, { id: 'vbg', label: 'ABG or VBG?' }],
  questions: [
    { q: 'Phase III of the capnogram is:', options: ['Inspiratory baseline', 'Expiratory upstroke', 'Alveolar plateau', 'Inspiratory downstroke'], answer: 2, why: 'The plateau ends at end-tidal CO₂.' },
    { q: 'A shark-fin waveform suggests:', options: ['Oesophageal tube', 'Bronchospasm', 'Rebreathing', 'ROSC'], answer: 1, why: 'Obstructed expiration slopes the upstroke.' },
    { q: 'Baseline that fails to return to zero indicates:', options: ['Hypoventilation', 'Rebreathing', 'Bronchospasm', 'Leak'], answer: 1, why: 'Inspired gas contains CO₂.' },
    { q: 'During CPR, EtCO₂ of 8 mmHg should prompt:', options: ['Stopping CPR immediately', 'Improving compression quality', 'Giving bicarbonate', 'Extubation'], answer: 1, why: 'Low EtCO₂ suggests poor compressions.' },
    { q: 'An abrupt EtCO₂ rise from 15 to 40 during CPR most likely indicates:', options: ['Displacement', 'ROSC', 'Hypoventilation', 'Bronchospasm'], answer: 1, why: 'Increased pulmonary flow with ROSC.' },
    { q: 'The PaCO₂–EtCO₂ gap widens with:', options: ['Healthy lungs', 'Pulmonary embolism', 'Hyperventilation', 'Normal output'], answer: 1, why: 'Dead space increases the gap.' },
    { q: 'Sedated patient on 4 L O₂, SpO₂ 99 %, EtCO₂ rising with slow RR. Concern:', options: ['None', 'Hypoventilation', 'Hyperventilation', 'Shunt'], answer: 1, why: 'Capnography detects hypoventilation before desaturation.' },
    { q: 'A cleft in the plateau indicates:', options: ['Spontaneous effort', 'Leak', 'Oesophagus', 'Arrest'], answer: 0, why: 'Patient effort against the ventilator.' },
    { q: 'Normal EtCO₂ range:', options: ['10–20', '35–45', '50–60', '70–80 mmHg'], answer: 1, why: '35–45 mmHg.' },
    { q: 'In a ventilated TBI patient with a known 6 mmHg gap, to achieve PaCO₂ 38 target EtCO₂ of about:', options: ['26', '32', '38', '44'], answer: 1, why: '38 − 6 = 32 mmHg.' },
  ],
  sources: [
    { title: 'StatPearls: Capnography', url: 'https://www.ncbi.nlm.nih.gov/books/NBK539754/' },
    { title: 'AHA guidelines for CPR and ECC: physiological monitoring during CPR', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines' },
  ],
};

export const NIPPV: FpcLesson = {
  id: 'fpc-nippv', domain: 'airway', ref: 'III.14',
  title: 'Non-invasive positive pressure ventilation',
  summary: 'CPAP and BiPAP: physiology, indications, contraindications, settings, monitoring, failure criteria, and high-flow nasal oxygen.',
  objectives: [
    'Explain how CPAP and BiPAP improve oxygenation and ventilation.',
    'Select patients and contraindications for NIV in transport.',
    'Set and titrate NIV and recognise failure early.',
  ],
  sections: [
    {
      id: 'physiology', title: 'How it works', core: true,
      body: [
        'CPAP applies one continuous pressure throughout the breath. It recruits collapsed alveoli and increases FRC, reducing shunt and improving oxygenation; in cardiogenic pulmonary oedema it reduces preload and LV afterload by raising intrathoracic pressure; it splints open the upper airway in obstructive sleep apnoea; and it offsets auto-PEEP, reducing the work of triggering in COPD.',
        'BiPAP (bilevel) adds a higher inspiratory pressure (IPAP) above the expiratory pressure (EPAP, equivalent to PEEP). The difference, the pressure support, augments tidal volume and so improves ventilation and CO₂ clearance — the key indication being hypercapnic COPD exacerbation.',
      ],
    },
    {
      id: 'select', title: 'Who benefits, who must not', core: true,
      body: [
        'Strong evidence supports NIV in acute hypercapnic COPD exacerbation (pH roughly 7.25–7.35) and cardiogenic pulmonary oedema. It is also used for pre-oxygenation, in immunocompromised patients with respiratory failure, and in selected asthma and pneumonia patients with close monitoring.',
        'Contraindications: respiratory or cardiac arrest, inability to protect the airway or clear secretions, severely depressed consciousness (except hypercapnic narcosis expected to improve quickly), vomiting or upper GI bleeding, facial trauma or burns preventing a seal, recent upper airway or oesophageal surgery, untreated pneumothorax, and haemodynamic instability (positive pressure lowers venous return).',
      ],
      list: { caption: 'Typical starting settings (adult)', items: ['CPAP 5–10 cmH₂O (oedema often 8–10).', 'BiPAP: IPAP 10–12, EPAP 5; increase IPAP by 2–3 to target CO₂ and VT about 6–8 mL/kg.', 'FiO₂ titrated to SpO₂ 88–92 % in COPD, 94–98 % otherwise.', 'Keep IPAP below about 20–25 to limit gastric insufflation.'] },
    },
    {
      id: 'monitor', title: 'Monitoring and failure', core: true,
      body: [
        'Reassess within 30–60 minutes and continuously in transport: respiratory rate, work of breathing, SpO₂, EtCO₂ trend, mental status, leak, synchrony and blood pressure. Expected improvement: falling respiratory rate and heart rate, better comfort, improving pH and CO₂.',
        'Failure signs: worsening mental status, inability to tolerate the mask, rising CO₂ or falling pH, persistent tachypnoea, haemodynamic instability, vomiting. Delayed intubation after failed NIV is associated with worse outcomes; in transport, where intubating mid-flight is difficult, the threshold to intubate before departure should be lower if improvement is not clear.',
        'Altitude: mask leak and gastric distension may increase; some transport devices compensate for altitude. Communication is harder under a mask; agree hand signals.',
      ],
      example: {
        case: 'COPD exacerbation: RR 32, SpO₂ 84 % on 4 L, pH 7.27, PaCO₂ 72, alert and cooperative. Flight time 35 minutes.',
        steps: [
          'Hypercapnic respiratory acidosis with intact consciousness: ideal NIV candidate.',
          'Start BiPAP 12/5, FiO₂ to SpO₂ 88–92 %, bronchodilators in-line.',
          'Reassess at 15–30 minutes before departure: RR, EtCO₂ trend, comfort. If worsening, intubate on the ground.',
          'In flight, watch mental status and leak; plan for deterioration with drugs and equipment ready.',
        ],
      },
    },
    {
      id: 'hfno', title: 'High-flow nasal oxygen',
      body: [
        'Heated, humidified high-flow nasal oxygen (often 30–60 L/min) delivers a reliable FiO₂, washes CO₂ from the anatomical dead space, produces a small positive pressure, and is comfortable. It is useful in hypoxaemic respiratory failure, for pre-oxygenation and for apnoeic oxygenation. It is oxygen-hungry, which matters for transport oxygen calculations.',
      ],
    },
  ],
  keyPoints: [
    'CPAP recruits lung and offloads the heart; BiPAP adds pressure support for CO₂.',
    'Best evidence: hypercapnic COPD and cardiogenic pulmonary oedema.',
    'Contraindications: arrest, can\'t protect airway, vomiting, facial trauma, instability, pneumothorax.',
    'Start BiPAP 10–12/5; titrate IPAP for CO₂, EPAP/FiO₂ for oxygen.',
    'Reassess early; intubate on the ground if not clearly improving before flight.',
  ],
  pearls: ['Raise IPAP for CO₂, EPAP for oxygenation.', 'Calculate oxygen consumption for high-flow devices before departure.'],
  pitfalls: ['NIV in a vomiting, obtunded patient.', 'Continuing failing NIV into the aircraft.'],
  live: [{ id: 'peep', label: 'PEEP, recruitment and overdistension' }, { id: 'resp', label: 'CO₂, pH and the kidneys' }],
  questions: [
    { q: 'BiPAP improves CO₂ clearance mainly through:', options: ['EPAP', 'The IPAP–EPAP difference (pressure support)', 'FiO₂', 'Humidification'], answer: 1, why: 'Pressure support augments tidal volume.' },
    { q: 'The strongest NIV indication is:', options: ['Pneumothorax', 'Hypercapnic COPD exacerbation', 'Facial burns', 'Vomiting GI bleed'], answer: 1, why: 'Strong evidence supports NIV here.' },
    { q: 'Which is a contraindication to NIV?', options: ['Cardiogenic oedema', 'Active vomiting', 'COPD with pH 7.30', 'Mild hypoxaemia'], answer: 1, why: 'Aspiration risk.' },
    { q: 'To improve oxygenation on BiPAP, increase:', options: ['IPAP only', 'EPAP and/or FiO₂', 'Backup rate only', 'Mask size'], answer: 1, why: 'EPAP recruits lung; FiO₂ raises alveolar oxygen.' },
    { q: 'CPAP helps cardiogenic pulmonary oedema by:', options: ['Increasing preload', 'Reducing preload and LV afterload', 'Increasing heart rate', 'Diuresis'], answer: 1, why: 'Raised intrathoracic pressure reduces venous return and transmural LV pressure.' },
    { q: 'SpO₂ target for a COPD patient on NIV:', options: ['100 %', '94–98 %', '88–92 %', '80–85 %'], answer: 2, why: 'Avoid worsening hypercapnia.' },
    { q: 'An early sign of NIV failure:', options: ['Falling RR', 'Worsening mental status', 'Improved comfort', 'Falling CO₂'], answer: 1, why: 'Deterioration in consciousness indicates failure.' },
    { q: 'Keep IPAP below about 20–25 cmH₂O to limit:', options: ['Hypoxia', 'Gastric insufflation', 'CO₂ clearance', 'Leak'], answer: 1, why: 'Higher pressures open the oesophageal sphincter.' },
    { q: 'High-flow nasal oxygen reduces CO₂ partly by:', options: ['Bronchodilation', 'Washing out anatomical dead space', 'Increasing tidal volume greatly', 'Lowering metabolism'], answer: 1, why: 'Dead-space washout.' },
    { q: 'A patient on NIV before a long flight is not clearly improving. Best plan:', options: ['Depart and reassess in the air', 'Intubate on the ground', 'Remove NIV', 'Increase sedation'], answer: 1, why: 'Intubating in flight is harder; delayed intubation worsens outcomes.' },
  ],
  sources: [
    { title: 'ERS/ATS guidelines: noninvasive ventilation for acute respiratory failure (2017)', url: 'https://erj.ersjournals.com/content/50/2/1602426' },
    { title: 'StatPearls: Noninvasive positive pressure ventilation', url: 'https://www.ncbi.nlm.nih.gov/books/NBK578188/' },
  ],
};
