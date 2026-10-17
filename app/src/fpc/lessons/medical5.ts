/** FP-C IV.13–IV.15: invasive lines; radiographic interpretation; respiratory physiology. */
import type { FpcLesson } from '../types';

export const LINES_FPC: FpcLesson = {
  id: 'fpc-lines', domain: 'medical', ref: 'IV.13',
  title: 'Invasive lines: arterial, central, IO and PA catheters',
  summary: 'Indications, placement sites and complications of arterial lines, central venous catheters, intraosseous access and pulmonary artery catheters, and how to read and troubleshoot transduced pressures.',
  objectives: [
    'Choose and troubleshoot vascular access for critically ill transport patients.',
    'Level, zero and damping-check transduced pressures.',
    'Interpret CVP and PA catheter values and recognise complications.',
  ],
  sections: [
    {
      id: 'access', title: 'Choosing access', core: true,
      body: [
        'Two large-bore peripheral IVs serve most resuscitations; flow depends on catheter radius and length (Poiseuille), so a short 14–16 gauge peripheral line outflows a long, narrow central lumen. Intraosseous (IO) access is fast and reliable when veins fail — proximal humerus, proximal or distal tibia, and the sternum in some devices. Humeral IO gives higher flow and faster central delivery than tibial. Flush, give lidocaine for pain in awake patients per protocol, and use a pressure bag for flow.',
        'Central venous catheters (internal jugular, subclavian, femoral) allow vasopressors, multiple infusions, CVP monitoring and central venous saturation. Ultrasound guidance reduces complications. Subclavian lines carry the highest pneumothorax risk; femoral lines the highest infection risk; the internal jugular sits in between and is accessible with ultrasound.',
      ],
    },
    {
      id: 'art', title: 'Arterial lines and transduced pressures', core: true,
      body: [
        'An arterial line gives beat-to-beat pressure and arterial sampling — valuable on vasopressors, in labile patients and where non-invasive cuffs fail in vibration. The radial artery is preferred; femoral and brachial are alternatives. Complications include thrombosis, distal ischaemia, infection, haematoma and accidental drug injection.',
        'Level the transducer to the phlebostatic axis (4th intercostal space, mid-axillary line) and zero it to atmosphere. A transducer below the heart reads falsely high; above reads falsely low — roughly 7.4 mmHg per 10 cm. Re-level after every position change, and remember aircraft cabin pressure changes do not affect a properly zeroed system once rezeroed at altitude per protocol.',
        'Perform a square-wave (fast-flush) test: one to two oscillations then return to the waveform indicates optimal damping. Many oscillations mean underdamping (systolic overestimated); a slow return with no oscillation means overdamping (bubble, clot, kink, soft pressure bag; systolic underestimated). The mean arterial pressure is least affected by damping.',
      ],
    },
    {
      id: 'pa', title: 'Central and PA catheter values', core: true,
      body: [
        'CVP approximates right atrial pressure (normal about 2–8 mmHg). Read it at end-expiration. A high CVP occurs with RV failure, tamponade, tension pneumothorax, pulmonary hypertension, volume overload and high PEEP; a low CVP suggests hypovolaemia. CVP alone predicts fluid responsiveness poorly; trends and context matter.',
        'Pulmonary artery catheters measure right-sided pressures, PA pressure (normal about 15–30 systolic / 4–12 diastolic), pulmonary artery occlusion ("wedge") pressure approximating left atrial pressure (about 6–12), cardiac output and mixed venous saturation (SvO₂ about 65–75 %). A wedge above about 18 with low cardiac index points to cardiogenic shock; low wedge with low output points to hypovolaemia; low SVR with high output points to distributive shock.',
        'In transport, a PA catheter must never be left in the wedge position (balloon inflated) — it risks pulmonary infarction and rupture. Watch the waveform: a damped, wedged trace when the balloon is deflated means the catheter has migrated distally; pull it back per protocol. Secure catheters carefully; migration is common with movement.',
      ],
      table: {
        caption: 'Haemodynamic patterns',
        head: ['Shock', 'CVP', 'Wedge', 'CO/CI', 'SVR'],
        rows: [['Hypovolaemic', '↓', '↓', '↓', '↑'], ['Cardiogenic (LV)', '↑ or ↔', '↑', '↓', '↑'], ['Obstructive (tamponade)', '↑ (equalised)', '↑ (equalised)', '↓', '↑'], ['Distributive (septic)', '↓ or ↔', '↓ or ↔', '↑ or ↔', '↓']],
      },
    },
    {
      id: 'complications', title: 'Line complications in transport',
      body: [
        'Air embolism: air entering a central line (especially with the patient upright or during disconnection) causes sudden hypoxia, hypotension and arrest. Clamp the line, place the patient left lateral and head down (Durant\'s manoeuvre), give 100 % oxygen, and aspirate from the catheter if possible.',
        'Dislodgement and bleeding: secure lines and tubing before moves; a dislodged arterial line can bleed briskly. Infection: maintain aseptic handling. Pneumothorax after a recent subclavian or IJ insertion may declare itself at altitude as trapped air expands.',
      ],
      example: {
        case: 'On ascent, the arterial line reads 168/92 while the cuff reads 124/70.',
        steps: [
          'Check level: transducer slipped below the phlebostatic axis? Re-level.',
          'Fast-flush test: many oscillations suggest underdamping and systolic overestimation.',
          'Compare MAPs: if similar, the systolic difference is a damping artefact.',
          'Fix bubbles, shorten tubing, rezero; trust the MAP for decisions.',
        ],
      },
    },
  ],
  keyPoints: [
    'Short, wide peripheral lines flow fastest; humeral IO is fast and reliable.',
    'Level to the phlebostatic axis; ~7.4 mmHg error per 10 cm; zero to air.',
    'Square-wave test: 1–2 oscillations optimal; MAP is least affected by damping.',
    'CVP 2–8, wedge 6–12, SvO₂ 65–75 %; never transport with the PA balloon wedged.',
    'Air embolism: clamp, left lateral head down, 100 % oxygen.',
  ],
  pearls: ['Trust the MAP when systolics disagree.', 'Re-level after every position change.'],
  pitfalls: ['A PA catheter left wedged.', 'Disconnecting a central line with the patient upright.'],
  live: [{ id: 'ln-setup', label: 'From artery to monitor' }, { id: 'ln-level', label: 'Levelling and zeroing' }, { id: 'ln-damp', label: 'Damping and the square-wave test' }, { id: 'lines-cvc', label: 'Ultrasound-guided IJ' }],
  questions: [
    { q: 'Fastest flow for volume resuscitation:', options: ['Triple-lumen central distal port', '14 G short peripheral IV', '22 G peripheral', 'PICC'], answer: 1, why: 'Short and wide wins (Poiseuille).' },
    { q: 'The phlebostatic axis is at:', options: ['2nd ICS MCL', '4th ICS mid-axillary', '5th ICS anterior axillary', 'Xiphoid'], answer: 1, why: 'Right atrial level.' },
    { q: 'Transducer 10 cm below the axis causes:', options: ['False low ~7 mmHg', 'False high ~7 mmHg', 'No error', 'Zero reading'], answer: 1, why: 'Hydrostatic column adds pressure.' },
    { q: 'Optimal square-wave test shows:', options: ['No oscillation', '1–2 oscillations', '6 oscillations', 'Flat line'], answer: 1, why: 'Optimally damped.' },
    { q: 'Overdamping causes systolic to read:', options: ['High', 'Low', 'Accurate', 'Zero'], answer: 1, why: 'Peaks are blunted.' },
    { q: 'Normal PA occlusion (wedge) pressure:', options: ['0–2', '6–12', '20–25', '30–40 mmHg'], answer: 1, why: 'Approximates LA pressure.' },
    { q: 'High wedge, low cardiac output, high SVR suggests:', options: ['Septic shock', 'Cardiogenic shock', 'Hypovolaemia', 'Anaphylaxis'], answer: 1, why: 'Failing LV.' },
    { q: 'Equalised CVP and wedge pressures suggest:', options: ['Tamponade', 'Sepsis', 'Hypovolaemia', 'Normal'], answer: 0, why: 'Diastolic equalisation.' },
    { q: 'A wedged trace with the balloon deflated means:', options: ['Normal', 'Catheter migrated distally', 'Balloon ruptured', 'Air embolism'], answer: 1, why: 'Pull back per protocol.' },
    { q: 'Treatment position for venous air embolism:', options: ['Right lateral head up', 'Left lateral head down', 'Prone', 'Sitting'], answer: 1, why: 'Durant\'s manoeuvre traps air in the RA.' },
    { q: 'Highest pneumothorax risk central line site:', options: ['Femoral', 'Subclavian', 'Internal jugular', 'PICC'], answer: 1, why: 'Proximity to the pleura.' },
    { q: 'Highest infection risk central line site traditionally:', options: ['Subclavian', 'Femoral', 'IJ', 'Radial'], answer: 1, why: 'Groin contamination.' },
    { q: 'Normal mixed venous saturation:', options: ['30–40 %', '65–75 %', '90–100 %', '50 %'], answer: 1, why: 'Reflects oxygen extraction.' },
    { q: 'Which pressure value is least affected by damping?', options: ['Systolic', 'Diastolic', 'Mean', 'Pulse pressure'], answer: 2, why: 'MAP is robust.' },
    { q: 'Humeral IO compared with tibial IO:', options: ['Slower flow', 'Higher flow and faster central delivery', 'Contraindicated', 'Same'], answer: 1, why: 'Closer to the central circulation.' },
  ],
  sources: [
    { title: 'StatPearls: Arterial line placement', url: 'https://www.ncbi.nlm.nih.gov/books/NBK499989/' },
    { title: 'StatPearls: Pulmonary artery catheter', url: 'https://www.ncbi.nlm.nih.gov/books/NBK482170/' },
  ],
};

export const RADIOLOGY: FpcLesson = {
  id: 'fpc-radiology', domain: 'medical', ref: 'IV.14',
  title: 'Radiographic interpretation for transport',
  summary: 'A systematic approach to the chest X-ray, tube and line positions, the findings that change transport, and the basics of CT you will be handed at the referring hospital.',
  objectives: [
    'Read a chest X-ray systematically, including tubes and lines.',
    'Recognise pneumothorax, haemothorax, effusion, oedema, consolidation and free air.',
    'Use imaging findings to anticipate problems at altitude.',
  ],
  sections: [
    {
      id: 'system', title: 'A systematic chest film', core: true,
      body: [
        'Confirm the patient, date and projection (AP films magnify the heart and are standard in ICU and transport; PA films are standard in clinics). Check rotation (spinous processes centred between clavicle heads) and inspiration (about 9–10 posterior ribs visible).',
        'Then a fixed sequence, so nothing is skipped: tubes and lines; airway (trachea midline?); breathing (lung fields, pleural spaces, costophrenic angles, apices for pneumothorax); cardiac silhouette and mediastinum; diaphragm (free air beneath?); everything else (bones, soft tissues, surgical emphysema).',
      ],
      list: { caption: 'Tubes and lines', items: ['ETT tip 3–5 cm above the carina (about at the clavicles) with the head neutral.', 'Central line tip at the cavo-atrial junction / lower SVC.', 'Gastric tube below the diaphragm, tip in the stomach, not coiled in the oesophagus or in a bronchus.', 'Chest tube with side holes inside the pleural space.', 'PA catheter tip in a proximal pulmonary artery, not far peripheral.'], ordered: false },
    },
    {
      id: 'findings', title: 'Findings that change transport', core: true,
      body: [
        'Pneumothorax: a visceral pleural line with no lung markings beyond it; on a supine film, look for a deep sulcus sign (a deep, lucent costophrenic angle). Tension pneumothorax is a clinical diagnosis, but a film may show mediastinal shift away and a flattened hemidiaphragm. Any pneumothorax will expand at altitude (Boyle\'s law); drain before flight per programme policy.',
        'Haemothorax and effusion: blunting of the costophrenic angle on an upright film; on a supine film, a diffuse haziness of one hemithorax. Pulmonary oedema: bilateral perihilar ("bat-wing") opacities, cardiomegaly, Kerley B lines and upper-lobe diversion in cardiogenic oedema; ARDS tends to be more peripheral with a normal heart size. Consolidation: a lobar opacity with air bronchograms.',
        'Widened mediastinum (above about 8 cm on a PA film, though AP films magnify) with blunt deceleration raises concern for aortic injury. Free air under the diaphragm on an upright film indicates a perforated viscus. Gastric distension on a film before flight warrants a gastric tube.',
      ],
    },
    {
      id: 'ct', title: 'CT basics you will be handed',
      body: [
        'On CT, density is measured in Hounsfield units: air is about −1000, fat about −100, water 0, acute blood about 40–80 (bright on non-contrast CT), bone +1000. Fresh intracranial blood is bright; acute ischaemic stroke may look normal early. An epidural haematoma is biconvex (lens-shaped) and does not cross sutures; a subdural is crescentic and crosses sutures but not the midline falx.',
        'Ask the referring team for the formal report and send images with the patient. Your job is to recognise findings that change care en route — expanding blood, pneumothorax, free air, tube position — not to provide a formal read.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the pre-flight film',
      body: ['An intubated pneumonia patient\'s pre-transfer film shows: ETT tip 1 cm above the carina, a 15 % right apical pneumothorax after a recent IJ line, and a gastric tube coiled in the oesophagus.'],
      example: {
        case: 'Fix before flight.',
        steps: [
          'Withdraw the ETT 2–3 cm to place the tip 3–5 cm above the carina; recheck depth and capnography.',
          'The pneumothorax will expand at altitude in a ventilated patient: a chest drain before departure (per programme policy).',
          'Reposition the gastric tube into the stomach; confirm.',
          'Repeat imaging if available, then depart with a plan for deterioration.',
        ],
      },
    },
  ],
  keyPoints: [
    'Read every film in the same order: tubes and lines, airway, breathing, cardiac/mediastinum, diaphragm, everything else.',
    'ETT tip 3–5 cm above the carina; central line at the cavo-atrial junction.',
    'Supine pneumothorax: deep sulcus sign; any pneumothorax expands at altitude.',
    'Cardiogenic oedema: big heart, bat-wing, Kerley B; ARDS: peripheral with a normal heart.',
    'CT: acute blood is bright; epidural biconvex, subdural crescentic.',
  ],
  pearls: ['AP films magnify the heart and mediastinum.', 'Count ribs to judge inspiration before calling a film abnormal.'],
  pitfalls: ['Missing a supine pneumothorax.', 'Accepting an ETT just above the carina before a move.'],
  live: [{ id: 'vent-tension-ptx', label: 'Tension pneumothorax on the ventilator' }, { id: 'vent-ards-signature', label: 'ARDS (films and ultrasound)' }],
  questions: [
    { q: 'Ideal ETT tip position on chest film:', options: ['At the carina', '3–5 cm above the carina', 'In the right main bronchus', 'At the vocal cords'], answer: 1, why: 'Allows for head movement.' },
    { q: 'A deep, lucent costophrenic angle on a supine film suggests:', options: ['Effusion', 'Pneumothorax (deep sulcus sign)', 'Consolidation', 'Normal'], answer: 1, why: 'Air collects anteriorly and basally.' },
    { q: 'Central line tip should sit at:', options: ['Right ventricle', 'Cavo-atrial junction / lower SVC', 'Internal jugular', 'Left atrium'], answer: 1, why: 'Reduces arrhythmia and perforation risk.' },
    { q: 'Bat-wing opacities with cardiomegaly suggest:', options: ['ARDS', 'Cardiogenic pulmonary oedema', 'Pneumothorax', 'Lobar pneumonia'], answer: 1, why: 'Classic pattern.' },
    { q: 'Air bronchograms within a lobar opacity suggest:', options: ['Pneumothorax', 'Consolidation', 'Effusion', 'Atelectasis only'], answer: 1, why: 'Air-filled bronchi in fluid-filled alveoli.' },
    { q: 'Adequate inspiration shows about:', options: ['4 posterior ribs', '9–10 posterior ribs', '15 ribs', '2 ribs'], answer: 1, why: 'Standard criterion.' },
    { q: 'AP compared with PA films:', options: ['Minimise heart size', 'Magnify heart and mediastinum', 'Are not used in ICU', 'Show free air better'], answer: 1, why: 'Heart is farther from the detector.' },
    { q: 'Free air under the diaphragm indicates:', options: ['Pneumothorax', 'Perforated viscus', 'Normal gas bubble', 'Effusion'], answer: 1, why: 'Pneumoperitoneum.' },
    { q: 'A small pneumothorax before flight in a ventilated patient:', options: ['Will shrink at altitude', 'Will expand at altitude — consider drainage', 'Is irrelevant', 'Requires only oxygen'], answer: 1, why: 'Boyle\'s law plus positive pressure.' },
    { q: 'Acute blood on non-contrast CT appears:', options: ['Dark', 'Bright (hyperdense)', 'Invisible', 'Fat-density'], answer: 1, why: 'About 40–80 HU.' },
    { q: 'An epidural haematoma is typically:', options: ['Crescentic, crosses sutures', 'Biconvex, does not cross sutures', 'Within the ventricles', 'In the brainstem'], answer: 1, why: 'Arterial bleed bound by suture lines.' },
    { q: 'Air density in Hounsfield units:', options: ['0', '+1000', '−1000', '+40'], answer: 2, why: 'Air is −1000.' },
    { q: 'A gastric tube coiled in the oesophagus should be:', options: ['Left in place', 'Repositioned into the stomach', 'Used for feeding', 'Removed permanently'], answer: 1, why: 'Ineffective and aspiration risk.' },
    { q: 'Upright film costophrenic angle blunting suggests:', options: ['Pneumothorax', 'Pleural fluid', 'Emphysema', 'Normal'], answer: 1, why: 'Fluid collects dependently.' },
    { q: 'Widened mediastinum after high-speed deceleration raises concern for:', options: ['Pneumonia', 'Aortic injury', 'Rib fracture only', 'Normal finding'], answer: 1, why: 'Blunt aortic injury.' },
  ],
  sources: [
    { title: 'StatPearls: Chest radiograph interpretation', url: 'https://www.ncbi.nlm.nih.gov/books/NBK551515/' },
    { title: 'Radiopaedia: Endotracheal tube position', url: 'https://radiopaedia.org/articles/endotracheal-tube' },
  ],
};

export const RESP_SYS: FpcLesson = {
  id: 'fpc-resp-sys', domain: 'medical', ref: 'IV.15',
  title: 'Respiratory physiology: oxygen, CO₂ and intrathoracic pressure',
  summary: 'From the Krebs cycle to the oxyhaemoglobin dissociation curve, V/Q matching, and how changes in intrathoracic pressure move blood — the physiology behind ventilator, shock and flight decisions.',
  objectives: [
    'Explain cellular respiration and why oxygen debt produces lactate.',
    'Use the oxyhaemoglobin dissociation curve and its shifts clinically.',
    'Relate intrathoracic pressure to venous return and cardiac output.',
  ],
  sections: [
    {
      id: 'cell', title: 'Cellular respiration', core: true,
      body: [
        'Glycolysis in the cytoplasm turns glucose into pyruvate and a small amount of ATP (two per glucose) without oxygen. With oxygen, pyruvate enters the mitochondria, feeds the Krebs (citric acid) cycle, and the electron transport chain uses oxygen as the final electron acceptor to produce most of the cell\'s ATP (roughly 30–36 per glucose) and CO₂ and water.',
        'Without enough oxygen — or when mitochondria are poisoned (cyanide) — pyruvate is converted to lactate to keep glycolysis running. Lactate rises; ATP falls. This is why hypoperfusion causes lactic acidosis, and why restoring oxygen delivery, not just blood pressure, is the goal of resuscitation.',
      ],
    },
    {
      id: 'curve', title: 'The oxyhaemoglobin dissociation curve', core: true,
      body: [
        'Haemoglobin binding is cooperative, giving a sigmoid curve. On the flat upper part, a large fall in PaO₂ barely changes saturation (90 % saturation at about 60 mmHg). On the steep part, small falls in PaO₂ release large amounts of oxygen — good for tissues, but meaning saturation can fall quickly once PaO₂ drops below about 60.',
        'A right shift (lower affinity, more oxygen released to tissues) occurs with acidosis, raised CO₂, fever and increased 2,3-DPG — the Bohr effect helps active tissues. A left shift (higher affinity, less release) occurs with alkalosis, low CO₂, hypothermia, low 2,3-DPG (stored blood), carbon monoxide and fetal haemoglobin.',
        'Oxygen content is mostly bound to haemoglobin: CaO₂ ≈ (1.34 × Hb × SaO₂) + (0.003 × PaO₂). Delivery is content × cardiac output. Raising PaO₂ above full saturation adds little oxygen, except in hyperbaric therapy.',
      ],
      list: { caption: 'Right shift ("CADET, face right")', items: ['CO₂ ↑', 'Acid (H⁺ ↑)', '2,3-DPG ↑', 'Exercise', 'Temperature ↑'] },
    },
    {
      id: 'vq', title: 'V/Q, shunt and dead space', core: true,
      body: [
        'Ideal gas exchange matches ventilation (V) to perfusion (Q). Low V/Q units (pneumonia, atelectasis) and shunt (V/Q = 0: flooded or collapsed alveoli, intracardiac shunt) cause hypoxaemia. V/Q mismatch improves with oxygen; true shunt barely does and needs recruitment.',
        'Dead space (V/Q = ∞: pulmonary embolism, low cardiac output, overdistension) wastes ventilation and raises the PaCO₂–EtCO₂ gap. Hypoxic pulmonary vasoconstriction diverts blood away from poorly ventilated regions; vasodilators can worsen V/Q matching by abolishing it.',
        'The alveolar gas equation (PAO₂ = FiO₂ × (Pb − 47) − PaCO₂/0.8) explains why altitude (lower barometric pressure, Pb) and hypoventilation (higher PaCO₂) lower alveolar oxygen even with normal lungs.',
      ],
    },
    {
      id: 'itp', title: 'Intrathoracic pressure and the circulation', core: true,
      body: [
        'Spontaneous inspiration lowers intrathoracic pressure, drawing venous blood into the chest and augmenting right-heart filling. Positive-pressure ventilation does the opposite: it raises intrathoracic pressure, reducing venous return and right-ventricular preload while lowering left-ventricular afterload. Hypovolaemic patients therefore become hypotensive after intubation, while patients with LV failure may improve on positive pressure.',
        'High PEEP, auto-PEEP and tension pneumothorax all raise intrathoracic pressure and can cause obstructive shock. In tamponade, spontaneous inspiration fills the RV, shifts the septum and reduces LV output — pulsus paradoxus. Pulse-pressure variation on controlled ventilation reflects preload responsiveness.',
      ],
      example: {
        case: 'A haemorrhaging trauma patient is intubated; BP falls from 98/60 to 70/40 after the first few breaths.',
        steps: [
          'Positive pressure has reduced venous return in an under-filled circulation.',
          'Give blood, reduce tidal volume and PEEP temporarily, avoid excessive rates.',
          'Exclude tension pneumothorax and auto-PEEP (brief disconnection).',
          'Recheck BP within a minute or two; continue haemorrhage control.',
        ],
      },
    },
  ],
  keyPoints: [
    'Without oxygen, pyruvate becomes lactate and ATP output falls sharply.',
    'SaO₂ 90 % ≈ PaO₂ 60; below that, saturation falls fast.',
    'Right shift (CO₂, acid, 2,3-DPG, exercise, temperature) releases oxygen; CO, alkalosis, cold and fetal Hb shift left.',
    'V/Q mismatch responds to oxygen; shunt needs recruitment; dead space widens the CO₂ gap.',
    'Positive pressure lowers venous return (hypotension in hypovolaemia) and LV afterload.',
  ],
  pearls: ['Stored blood is low in 2,3-DPG and releases oxygen poorly at first.', 'Altitude lowers PAO₂ via barometric pressure.'],
  pitfalls: ['Chasing PaO₂ far above full saturation.', 'Forgetting that intubation removes the "thoracic pump" in hypovolaemia.'],
  live: [{ id: 'o2path', label: 'Oxygen: from air to mitochondria' }, { id: 'hypox', label: 'Why is the PaO₂ low?' }, { id: 'ln-heartlung', label: 'Heart–lung interactions' }],
  questions: [
    { q: 'ATP from glycolysis alone per glucose:', options: ['2', '12', '36', '100'], answer: 0, why: 'Net 2 ATP anaerobically.' },
    { q: 'The final electron acceptor in the electron transport chain:', options: ['CO₂', 'Oxygen', 'Lactate', 'Glucose'], answer: 1, why: 'Oxygen is reduced to water.' },
    { q: 'SaO₂ of 90 % corresponds to PaO₂ of about:', options: ['40', '60', '80', '100 mmHg'], answer: 1, why: 'The curve\'s shoulder.' },
    { q: 'Which shifts the curve to the right?', options: ['Alkalosis', 'Hypothermia', 'Fever', 'Carbon monoxide'], answer: 2, why: 'Temperature increase lowers affinity.' },
    { q: 'Fetal haemoglobin shifts the curve:', options: ['Right', 'Left', 'No change', 'Down only'], answer: 1, why: 'Higher affinity for oxygen.' },
    { q: 'Stored blood\'s low 2,3-DPG causes:', options: ['Right shift', 'Left shift', 'No change', 'Haemolysis'], answer: 1, why: 'Less oxygen offloading initially.' },
    { q: 'Most oxygen in blood is carried:', options: ['Dissolved', 'Bound to haemoglobin', 'As bicarbonate', 'In plasma proteins'], answer: 1, why: '1.34 × Hb × SaO₂ dominates.' },
    { q: 'Shunt hypoxaemia responds to supplemental oxygen:', options: ['Well', 'Poorly', 'Completely', 'Not relevant'], answer: 1, why: 'Shunted blood never meets the oxygen.' },
    { q: 'Pulmonary embolism mainly causes:', options: ['Shunt', 'Dead space', 'Hypoventilation', 'Diffusion block'], answer: 1, why: 'Ventilated but unperfused lung.' },
    { q: 'At altitude, PAO₂ falls mainly because:', options: ['FiO₂ falls', 'Barometric pressure falls', 'CO₂ rises', 'Hb falls'], answer: 1, why: 'FiO₂ stays 0.21; total pressure falls.' },
    { q: 'Positive-pressure ventilation affects venous return by:', options: ['Increasing it', 'Decreasing it', 'No effect', 'Only in children'], answer: 1, why: 'Raised intrathoracic pressure.' },
    { q: 'A patient with LV failure on positive pressure may improve because:', options: ['Preload rises', 'LV afterload falls', 'Heart rate rises', 'SVR rises'], answer: 1, why: 'Transmural LV pressure falls.' },
    { q: 'Cyanide causes lactic acidosis because:', options: ['It lowers PaO₂', 'It blocks mitochondrial oxygen use', 'It lowers Hb', 'It causes hypoventilation'], answer: 1, why: 'Cytochrome oxidase blocked.' },
    { q: 'Hypoxic pulmonary vasoconstriction:', options: ['Worsens V/Q matching', 'Diverts blood from poorly ventilated areas', 'Occurs only at altitude', 'Lowers PVR'], answer: 1, why: 'Improves matching.' },
    { q: 'Mnemonic for right shift factors:', options: ['LEMON', 'CADET (face right)', 'DOPE', 'SLUDGE'], answer: 1, why: 'CO₂, Acid, 2,3-DPG, Exercise, Temperature.' },
  ],
  sources: [
    { title: 'StatPearls: Physiology, oxygen transport', url: 'https://www.ncbi.nlm.nih.gov/books/NBK538336/' },
    { title: 'StatPearls: Physiology, Krebs cycle', url: 'https://www.ncbi.nlm.nih.gov/books/NBK556032/' },
    { title: 'StatPearls: Ventilation-perfusion mismatch', url: 'https://www.ncbi.nlm.nih.gov/books/NBK526021/' },
  ],
};
