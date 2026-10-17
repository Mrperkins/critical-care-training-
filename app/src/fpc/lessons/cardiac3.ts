/** FP-C VI.3, VI.7, VI.8: mechanical support devices; infectious cardiac disease; arrhythmias. */
import type { FpcLesson } from '../types';

export const MCS: FpcLesson = {
  id: 'fpc-mcs', domain: 'cardiac', ref: 'VI.3',
  title: 'Mechanical circulatory support: IABP, Impella, ECMO and VADs',
  summary: 'How each device supports the circulation, what to monitor, the alarms and complications that matter in transport, and how to resuscitate a patient on a device.',
  objectives: [
    'Explain the haemodynamic effect of IABP, Impella, VA-ECMO and durable VADs.',
    'Monitor and troubleshoot each device during transport.',
    'Adapt assessment and resuscitation for device-dependent patients.',
  ],
  sections: [
    {
      id: 'iabp', title: 'Intra-aortic balloon pump', core: true,
      body: [
        'A balloon in the descending thoracic aorta, its tip just below the left subclavian artery and above the renal arteries, inflates in diastole (at the dicrotic notch) to augment diastolic pressure and coronary perfusion, and deflates just before systole to reduce afterload. Cardiac output rises modestly (often around 0.5 L/min). It is triggered from the ECG or arterial waveform; pacing spikes or arrhythmias can disrupt timing.',
        'Timing errors: early inflation (before the notch) shortens ejection; late inflation loses augmentation; early deflation loses afterload reduction; late deflation (balloon still inflated as the ventricle ejects) increases afterload and is the most dangerous. Complications include limb ischaemia (check distal pulses), balloon rupture (blood in the helium line — stop the pump and clamp per protocol), malposition (left arm or renal ischaemia), thrombocytopenia and bleeding.',
        'In transport, secure the catheter, confirm position on imaging before departure, carry the console\'s battery and helium supply, and know how to switch triggers. Do not leave a balloon stationary for more than a short period (thrombus risk); hand-inflate per manufacturer guidance if the console fails.',
      ],
    },
    {
      id: 'impella', title: 'Impella', core: true,
      body: [
        'An Impella is a microaxial pump placed across the aortic valve, drawing blood from the left ventricle and ejecting it into the ascending aorta, directly unloading the LV. Support ranges from about 2.5 to 5.5 L/min depending on device. A right-sided version supports the RV.',
        'Monitor position (via console placement signals and, when available, echo), purge pressure and flow, haemolysis (dark urine, rising LDH), limb perfusion and bleeding at the access site. Suction alarms mean the pump inlet is pulling against the ventricle wall — usually hypovolaemia, RV failure or malposition; reduce the support level and treat the cause.',
      ],
    },
    {
      id: 'ecmo', title: 'ECMO', core: true,
      body: [
        'Veno-venous (VV) ECMO drains venous blood, oxygenates it and returns it to the venous side: it supports gas exchange only and relies on the patient\'s own heart. Veno-arterial (VA) ECMO returns oxygenated blood to the arterial system, supporting both heart and lungs. Peripheral femoral VA-ECMO pumps blood retrogradely up the aorta, which raises LV afterload; a non-ejecting LV may distend and need venting, and differential hypoxaemia ("north–south syndrome") can occur when the native heart ejects poorly oxygenated blood to the upper body — check right-hand SpO₂ or right radial gases.',
        'Transporting ECMO patients requires a specialist team: secure cannulas (dislodgement is catastrophic), clamps at the bedside, gas supply and battery for the console, anticoagulation monitoring, and a plan for circuit emergencies. Low flow with "chattering" lines suggests hypovolaemia or kinked cannulas.',
      ],
    },
    {
      id: 'vad', title: 'Durable left ventricular assist devices', core: true,
      body: [
        'Modern LVADs are continuous-flow pumps from the LV apex to the aorta, powered through a driveline by external batteries and a controller. Many patients have no palpable pulse and a narrow or absent pulse pressure; measure MAP with a Doppler (the first Korotkoff sound approximates MAP) or an arterial line, targeting roughly 70–90 mmHg. Pulse oximetry may not read.',
        'Assessment: check perfusion (mentation, skin, capillary refill), listen for the pump hum over the chest, read the controller (flow, power, speed, alarms), check batteries and connections. Common problems: driveline infection, GI bleeding (acquired von Willebrand deficiency plus anticoagulation), pump thrombosis (rising power, haemolysis), arrhythmias (often tolerated), RV failure and stroke.',
        'Cardiac arrest: if the patient is unresponsive with poor perfusion and the pump is not running or not working, many protocols allow chest compressions; check with the VAD centre where possible but do not delay resuscitation in a truly unperfused patient. Always bring the patient\'s spare controller and batteries, and contact the implanting centre.',
      ],
      example: {
        case: 'An LVAD patient is confused with a Doppler MAP of 58 and a low-flow alarm.',
        steps: ['Check batteries, driveline and controller connections first.', 'Low flow with low MAP suggests hypovolaemia (bleeding?), RV failure or arrhythmia — check rhythm and give a cautious fluid bolus.', 'Look for GI bleeding; check haemoglobin when possible.', 'Call the VAD coordinator; transport to the implanting centre with spare equipment.'],
      },
    },
  ],
  keyPoints: [
    'IABP: inflate at the dicrotic notch, deflate before systole; late deflation is the dangerous error.',
    'Impella unloads the LV across the aortic valve; suction alarm → reduce support, treat hypovolaemia or malposition.',
    'VV-ECMO = lungs only; VA-ECMO = heart and lungs, raises LV afterload; watch right-hand SpO₂.',
    'LVAD: often pulseless — Doppler MAP 70–90; check controller, batteries, driveline.',
    'Bring spare batteries and controllers; call the device centre.',
  ],
  pearls: ['Blood in an IABP helium line means balloon rupture.', 'Right radial gases detect differential hypoxaemia on femoral VA-ECMO.'],
  pitfalls: ['Trusting a non-palpable pulse as arrest in an LVAD patient without assessing perfusion.', 'Leaving an IABP balloon stationary.'],
  live: [{ id: 'lines-iabp', label: 'Intra-aortic balloon pump timing' }],
  questions: [
    { q: 'IABP inflation should occur at:', options: ['The R wave', 'The dicrotic notch', 'Peak systole', 'The P wave'], answer: 1, why: 'Onset of diastole.' },
    { q: 'The most dangerous IABP timing error:', options: ['Early deflation', 'Late inflation', 'Late deflation', 'Early inflation'], answer: 2, why: 'Raises afterload during ejection.' },
    { q: 'Ideal IABP tip position:', options: ['Ascending aorta', 'Just below the left subclavian artery', 'Below the renal arteries', 'In the LV'], answer: 1, why: 'Descending thoracic aorta.' },
    { q: 'Blood in the IABP gas line indicates:', options: ['Normal', 'Balloon rupture', 'Good augmentation', 'Malposition only'], answer: 1, why: 'Stop the pump.' },
    { q: 'An Impella pumps blood from:', options: ['RA to aorta', 'LV to ascending aorta', 'Vena cava to oxygenator', 'Aorta to LV'], answer: 1, why: 'Direct LV unloading.' },
    { q: 'Impella suction alarm commonly reflects:', options: ['Hypervolaemia', 'Hypovolaemia or malposition', 'Hypertension', 'Hyperthermia'], answer: 1, why: 'Inlet pulls on the wall.' },
    { q: 'VV-ECMO supports:', options: ['Heart only', 'Gas exchange only', 'Heart and lungs', 'Kidneys'], answer: 1, why: 'Venous return to venous side.' },
    { q: 'Peripheral VA-ECMO may cause:', options: ['LV unloading', 'Increased LV afterload and distension', 'Hypercarbia always', 'RV failure only'], answer: 1, why: 'Retrograde aortic flow.' },
    { q: 'To detect differential hypoxaemia on femoral VA-ECMO, monitor:', options: ['Left foot SpO₂', 'Right hand SpO₂ or right radial gas', 'Femoral venous gas', 'EtCO₂ only'], answer: 1, why: 'Upper body perfused by native heart.' },
    { q: 'MAP in an LVAD patient is best measured by:', options: ['Palpation', 'Doppler (first sound ≈ MAP) or arterial line', 'Automated cuff always', 'SpO₂'], answer: 1, why: 'Low pulsatility.' },
    { q: 'Target MAP for a continuous-flow LVAD:', options: ['40–50', '70–90', '110–130', '> 140'], answer: 1, why: 'Avoid hypo- and hypertension.' },
    { q: 'GI bleeding is common in LVAD patients due to:', options: ['Thrombocytosis', 'Acquired von Willebrand deficiency and anticoagulation', 'Hypertension', 'Vitamin K excess'], answer: 1, why: 'Shear stress degrades vWF.' },
    { q: 'Rising LVAD power with dark urine suggests:', options: ['Hypovolaemia', 'Pump thrombosis with haemolysis', 'Battery failure', 'Normal'], answer: 1, why: 'Thrombus increases load.' },
    { q: 'First step for an LVAD alarm:', options: ['CPR', 'Check batteries, connections and controller', 'Defibrillate', 'Ignore'], answer: 1, why: 'Power problems are common and fixable.' },
    { q: 'IABP may cause which complication in the leg?', options: ['DVT only', 'Limb ischaemia', 'Hyperaemia', 'None'], answer: 1, why: 'Femoral catheter obstruction.' },
  ],
  sources: [
    { title: 'StatPearls: Intra-aortic balloon pump', url: 'https://www.ncbi.nlm.nih.gov/books/NBK542233/' },
    { title: 'ELSO guidelines', url: 'https://www.elso.org/ecmo-resources/elso-ecmo-guidelines.aspx' },
    { title: 'StatPearls: Left ventricular assist device', url: 'https://www.ncbi.nlm.nih.gov/books/NBK546694/' },
  ],
};

export const CARDIAC_INFECT: FpcLesson = {
  id: 'fpc-cardiac-infect', domain: 'cardiac', ref: 'VI.7',
  title: 'Pericarditis, tamponade, myocarditis, endocarditis and valve disease',
  summary: 'Inflammatory and infectious heart disease: recognising pericarditis and tamponade, myocarditis presenting as shock, endocarditis and its embolic complications, and acute valve failure.',
  objectives: [
    'Differentiate pericarditis from STEMI and recognise tamponade early.',
    'Recognise myocarditis and endocarditis and their complications.',
    'Manage acute valvular emergencies until surgery.',
  ],
  sections: [
    {
      id: 'pericarditis', title: 'Pericarditis', core: true,
      body: [
        'Acute pericarditis causes sharp, pleuritic chest pain that improves sitting forward, a pericardial friction rub, and diffuse concave ST elevation with PR depression (PR elevation in aVR). Causes include viral infection, post-MI (early, and Dressler syndrome weeks later), uraemia, autoimmune disease, malignancy and post-cardiac surgery. Treatment is NSAIDs and colchicine for most; steroids are second-line.',
        'Distinguish from STEMI: pericarditis has diffuse elevation not confined to a territory, no reciprocal depression (except in aVR and V1), PR depression, and no Q waves. When in doubt, bedside echo and serial ECGs help; myopericarditis raises troponin.',
      ],
    },
    {
      id: 'tamponade', title: 'Cardiac tamponade', core: true,
      body: [
        'Fluid in the pericardium raises pressure until the chambers cannot fill. Speed matters more than volume: 100–200 mL accumulating rapidly (trauma, rupture after MI, aortic dissection, post-procedural) can cause tamponade, while slow effusions may reach litres. Beck\'s triad — hypotension, distended neck veins and muffled heart sounds — is classic but often incomplete. Look for tachycardia, a narrow pulse pressure, pulsus paradoxus (systolic fall > 10 mmHg on inspiration) and electrical alternans.',
        'Ultrasound shows the effusion with right atrial systolic collapse and right ventricular diastolic collapse, and a plethoric IVC. Temporising measures: fluid bolus to raise filling pressure, avoid positive-pressure ventilation if possible (it worsens filling), and vasopressors. Definitive treatment is drainage — pericardiocentesis (ideally ultrasound-guided) or surgical drainage, which is preferred in trauma and aortic dissection.',
      ],
    },
    {
      id: 'myo', title: 'Myocarditis and endocarditis', core: true,
      body: [
        'Myocarditis (viral, toxic, autoimmune, vaccine-associated, giant cell) ranges from chest pain with raised troponin to fulminant cardiogenic shock and arrhythmias in young, previously healthy patients. Fulminant cases may need inotropes and mechanical support; transport early to a centre with ECMO capability.',
        'Infective endocarditis presents with fever, a new or changed murmur, and embolic or immunological phenomena (splinter haemorrhages, Janeway lesions, Osler nodes, Roth spots, stroke, renal and splenic infarcts). Risk factors include injection drug use (often right-sided, tricuspid, with septic pulmonary emboli), prosthetic valves and structural heart disease. Complications include acute valve regurgitation with heart failure, abscess with heart block (new PR prolongation), and septic emboli to the brain. Blood cultures before antibiotics when feasible; urgent surgery for heart failure or uncontrolled infection.',
      ],
    },
    {
      id: 'valves', title: 'Acute valve emergencies',
      body: [
        'Acute aortic regurgitation (endocarditis, dissection, trauma) causes sudden pulmonary oedema and shock; the LV cannot dilate quickly. Avoid bradycardia (longer diastole means more regurgitation); vasodilators and inotropes bridge to surgery; an IABP is contraindicated because diastolic inflation worsens regurgitation. Acute mitral regurgitation (papillary muscle rupture, chordal rupture, endocarditis) causes flash pulmonary oedema; afterload reduction and an IABP help.',
        'Prosthetic valve thrombosis or failure presents with sudden heart failure, embolism and muffled prosthetic clicks; anticoagulation history matters.',
      ],
      example: {
        case: 'Post-operative cardiac surgery patient 6 hours out: chest drains stopped draining, BP 74/50, CVP rising from 10 to 19, HR 128.',
        steps: ['Sudden cessation of drain output with falling BP and rising CVP: tamponade (clotted drains).', 'Fluid bolus and vasopressor as a bridge; avoid increasing PEEP.', 'Urgent re-exploration by the surgical team is definitive; bedside ultrasound confirms if time allows.'],
      },
    },
    {
      id: 'case', title: 'Transport case: the penetrating chest wound',
      body: ['A 24-year-old stabbed in the left parasternal region: HR 132, BP 70/52, distended neck veins, SpO₂ 95 %, equal breath sounds. One litre of fluid given with transient improvement.'],
      example: { case: 'What is your diagnosis and intervention?', steps: [
        'Narrow pulse pressure, JVD and a precordial wound with equal breath sounds: tamponade rather than tension pneumothorax.',
        'Confirm with ultrasound if immediately available.',
        'Pericardiocentesis is a temporising, life-saving intervention in the deteriorating patient; definitive treatment is surgical (thoracotomy or sternotomy).',
        'Avoid vasopressors as a substitute for drainage; transport to a trauma centre with surgical capability without delay.',
      ] },
    },
  ],
  keyPoints: [
    'Pericarditis: diffuse concave STE, PR depression, positional pleuritic pain — NSAIDs and colchicine.',
    'Tamponade: hypotension, JVD, muffled sounds, pulsus paradoxus; RV diastolic collapse on echo.',
    'Tamponade: fluid as a bridge, avoid positive pressure, drain (surgically in trauma/dissection).',
    'Endocarditis: fever + murmur + emboli; new heart block suggests abscess.',
    'Acute AR: avoid bradycardia; IABP contraindicated. Acute MR: afterload reduction and IABP.',
  ],
  pearls: ['Fast accumulation of small volumes causes tamponade.', 'Injection drug use endocarditis is often tricuspid with septic lung emboli.'],
  pitfalls: ['Intubating a tamponade patient without drainage ready.', 'IABP in aortic regurgitation.'],
  live: [{ id: 'lines-shock-states', label: 'Shock states (tamponade)' }, { id: 'ln-heartlung', label: 'Heart–lung interactions (pulsus paradoxus)' }],
  questions: [
    { q: 'PR depression with diffuse ST elevation suggests:', options: ['STEMI', 'Pericarditis', 'Hyperkalaemia', 'Brugada'], answer: 1, why: 'Classic pericarditis findings.' },
    { q: 'Beck\'s triad consists of:', options: ['Fever, murmur, emboli', 'Hypotension, JVD, muffled heart sounds', 'Bradycardia, hypertension, irregular breathing', 'Tachycardia, wheeze, rash'], answer: 1, why: 'Tamponade triad.' },
    { q: 'Pulsus paradoxus is a systolic fall on inspiration of more than:', options: ['2 mmHg', '10 mmHg', '30 mmHg', '50 mmHg'], answer: 1, why: 'Definition.' },
    { q: 'Ultrasound sign of tamponade:', options: ['LV hypertrophy', 'RV diastolic collapse', 'Small IVC', 'B-lines'], answer: 1, why: 'High pericardial pressure.' },
    { q: 'Definitive management of traumatic tamponade is:', options: ['Repeated fluid boluses', 'Surgical drainage and repair', 'High-dose vasopressors', 'Intubation with high PEEP'], answer: 1, why: 'Pericardiocentesis temporises; surgery repairs the injury.' },
    { q: 'Electrical alternans suggests:', options: ['Large pericardial effusion', 'Hyperkalaemia', 'WPW', 'RBBB'], answer: 0, why: 'Swinging heart.' },
    { q: 'First-line treatment for viral pericarditis:', options: ['Antibiotics', 'NSAIDs plus colchicine', 'Thrombolysis', 'Pericardiectomy'], answer: 1, why: 'Reduces recurrence.' },
    { q: 'New PR prolongation in endocarditis suggests:', options: ['Benign', 'Perivalvular abscess', 'Hyperkalaemia', 'Drug effect only'], answer: 1, why: 'Abscess near the conduction system.' },
    { q: 'Injection drug use endocarditis commonly affects:', options: ['Mitral valve', 'Tricuspid valve', 'Pulmonary only', 'Aortic only'], answer: 1, why: 'Right-sided with septic pulmonary emboli.' },
    { q: 'IABP is contraindicated in:', options: ['Acute MR', 'Significant aortic regurgitation', 'Cardiogenic shock', 'Unstable angina'], answer: 1, why: 'Diastolic inflation worsens regurgitation.' },
    { q: 'In acute aortic regurgitation, avoid:', options: ['Tachycardia', 'Bradycardia', 'Vasodilators', 'Inotropes'], answer: 1, why: 'Longer diastole increases regurgitant volume.' },
    { q: 'Fulminant myocarditis in a young patient may require:', options: ['Outpatient follow-up', 'Mechanical circulatory support', 'Thrombolysis', 'Pericardiocentesis always'], answer: 1, why: 'Severe pump failure.' },
    { q: 'Janeway lesions and Osler nodes suggest:', options: ['Pericarditis', 'Endocarditis', 'Myocarditis', 'MI'], answer: 1, why: 'Embolic/immunological phenomena.' },
    { q: 'Positive-pressure ventilation in tamponade:', options: ['Improves filling', 'Worsens filling and BP', 'Has no effect', 'Is treatment'], answer: 1, why: 'Raises intrathoracic pressure.' },
    { q: 'Dressler syndrome occurs:', options: ['Hours after MI', 'Weeks after MI', 'Before MI', 'Only in children'], answer: 1, why: 'Autoimmune pericarditis.' },
  ],
  sources: [
    { title: '2025 ESC guidelines for myocarditis and pericarditis', url: 'https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines' },
    { title: 'StatPearls: Cardiac tamponade', url: 'https://www.ncbi.nlm.nih.gov/books/NBK431090/' },
    { title: 'StatPearls: Infective endocarditis', url: 'https://www.ncbi.nlm.nih.gov/books/NBK557641/' },
  ],
};

export const ARRHYTHMIAS: FpcLesson = {
  id: 'fpc-arrhythmias', domain: 'cardiac', ref: 'VI.8',
  title: 'Arrhythmias',
  summary: 'Bradycardias and AV blocks, narrow- and wide-complex tachycardias, AF and flutter, and the stable-versus-unstable decision that drives electrical versus pharmacological treatment.',
  objectives: [
    'Classify and treat bradycardia and AV block, including when to pace.',
    'Differentiate SVT, AF, flutter and VT and choose treatment by stability.',
    'Recognise rhythms where common drugs are dangerous.',
  ],
  sections: [
    {
      id: 'stable', title: 'The first question: stable or unstable?', core: true,
      body: [
        'Signs of instability attributable to the rhythm — hypotension, acutely altered mental status, signs of shock, ischaemic chest pain or acute heart failure — call for electrical therapy: synchronised cardioversion for tachycardias with a pulse, pacing for bradycardias. Stable patients allow time to identify the rhythm and use drugs. Treat the patient, not the monitor: a heart rate of 150 with a fever is usually sinus tachycardia and needs the cause treated.',
      ],
    },
    {
      id: 'brady', title: 'Bradycardias and AV block', core: true,
      body: [
        'First-degree block: PR > 200 ms, every P conducted — usually benign. Second-degree Mobitz I (Wenckebach): progressively lengthening PR then a dropped beat, usually at the AV node, often vagal or inferior MI, usually benign. Mobitz II: constant PR with sudden dropped beats, usually infranodal with a wide QRS, high risk of complete block — prepare to pace. Third-degree (complete) block: P waves and QRS complexes unrelated; escape rhythm narrow (junctional, 40–60) or wide (ventricular, 20–40).',
        'For symptomatic bradycardia: atropine 1 mg IV every 3–5 minutes (maximum 3 mg); if ineffective, transcutaneous pacing or an infusion of epinephrine (2–10 mcg/min) or dopamine (5–20 mcg/kg/min). Atropine is unlikely to work in infranodal block or after heart transplant. Look for causes: hyperkalaemia, beta-blocker or calcium-channel blocker toxicity, digoxin, hypothermia, hypoxia, raised intracranial pressure, and inferior MI.',
      ],
    },
    {
      id: 'narrow', title: 'Narrow-complex tachycardias', core: true,
      body: [
        'Regular narrow-complex tachycardia (often AVNRT or AVRT) in a stable patient: vagal manoeuvres (a modified Valsalva — strain then lie flat with legs raised — is most effective), then adenosine 6 mg rapid IV push with a flush, then 12 mg. Adenosine briefly blocks the AV node; it terminates re-entry through the node and unmasks flutter waves or atrial tachycardia. Warn the patient of a brief, unpleasant sensation. If unsuccessful, a calcium-channel blocker or beta-blocker; unstable patients get synchronised cardioversion.',
        'Atrial fibrillation (irregularly irregular, no P waves) and flutter (sawtooth waves, often 2:1 at about 150): control rate with diltiazem or a beta-blocker in stable patients with preserved function; use amiodarone or digoxin cautiously in heart failure; cardiovert if unstable. Anticoagulation decisions follow at the destination (AF lasting more than 48 hours carries embolic risk with cardioversion). AF with WPW must not receive AV nodal blockers.',
      ],
    },
    {
      id: 'wide', title: 'Wide-complex tachycardias', core: true,
      body: [
        'Assume a regular wide-complex tachycardia is ventricular tachycardia, especially with structural heart disease or prior MI — misdiagnosis of VT as SVT with aberrancy and treatment with calcium-channel blockers can be fatal. Clues for VT: AV dissociation, capture or fusion beats, very wide QRS, concordance across the precordial leads, and extreme axis.',
        'Stable monomorphic VT: amiodarone 150 mg over 10 minutes or procainamide (avoid in long QT and heart failure), or elective synchronised cardioversion with sedation. Unstable VT with a pulse: synchronised cardioversion. Pulseless VT or VF: defibrillation and ACLS. Polymorphic VT with a long QT (torsades de pointes): magnesium 2 g IV, correct potassium, consider overdrive pacing or isoproterenol, and defibrillate if pulseless.',
      ],
      example: {
        case: 'A 70-year-old with prior MI: regular wide-complex tachycardia at 180, BP 112/74, alert, mild chest discomfort.',
        steps: ['Assume VT (structural heart disease).', 'Stable: amiodarone 150 mg IV over 10 min; pads on.', 'If BP falls or mental status changes: synchronised cardioversion (100 J biphasic, escalate).', 'Avoid diltiazem or verapamil.'],
      },
    },
    {
      id: 'case', title: 'Transport case: adenosine reveals the answer',
      body: ['A 45-year-old with a regular narrow-complex tachycardia at 150 that does not respond to vagal manoeuvres. After adenosine 6 mg, the rate briefly slows and sawtooth waves appear at 300 per minute before the rate returns to 150.'],
      example: { case: 'What is the rhythm and what next?', steps: ['Atrial flutter with 2:1 conduction (flutter rate 300, ventricular 150).', 'Adenosine will not terminate flutter; it only revealed it.', 'Rate control (diltiazem or beta-blocker) if stable, or synchronised cardioversion (often 50–100 J) if unstable.', 'Consider anticoagulation implications at the destination.'] },
    },
  ],
  keyPoints: [
    'Unstable (hypotension, AMS, shock, ischaemia, HF) → electricity: cardiovert tachycardias, pace bradycardias.',
    'Atropine 1 mg (max 3 mg); infranodal block or transplant hearts need pacing or epinephrine/dopamine.',
    'Mobitz II and wide-escape CHB: pads on, prepare to pace.',
    'Regular narrow: vagal manoeuvres, adenosine 6 then 12 mg; flutter at 150 is often 2:1.',
    'Regular wide = VT until proven otherwise; torsades = magnesium; AF + WPW = no AV nodal blockers.',
  ],
  pearls: ['The modified Valsalva (strain then legs up) doubles vagal success.', 'A rate of exactly 150 should make you look for flutter.'],
  pitfalls: ['Calcium-channel blockers for presumed SVT with aberrancy that is actually VT.', 'Atropine-only strategy in Mobitz II.'],
  questions: [
    { q: 'Atropine dose for symptomatic bradycardia:', options: ['0.1 mg', '1 mg IV every 3–5 min, max 3 mg', '5 mg once', '0.5 mg max 1 mg only'], answer: 1, why: 'Current ACLS dosing.' },
    { q: 'Progressive PR lengthening then a dropped beat:', options: ['Mobitz II', 'Mobitz I (Wenckebach)', 'Third-degree', 'First-degree'], answer: 1, why: 'Classic Wenckebach.' },
    { q: 'Mobitz II carries high risk of:', options: ['AF', 'Complete heart block', 'Pericarditis', 'Torsades'], answer: 1, why: 'Infranodal disease.' },
    { q: 'First drug for stable regular narrow-complex tachycardia after vagal manoeuvres:', options: ['Amiodarone', 'Adenosine 6 mg rapid push', 'Digoxin', 'Lidocaine'], answer: 1, why: 'Terminates AV nodal re-entry.' },
    { q: 'A regular wide-complex tachycardia in a patient with prior MI should be treated as:', options: ['SVT with aberrancy', 'VT', 'Sinus tachycardia', 'AF'], answer: 1, why: 'VT until proven otherwise.' },
    { q: 'Torsades de pointes first-line treatment:', options: ['Amiodarone', 'Magnesium sulfate 2 g', 'Procainamide', 'Adenosine'], answer: 1, why: 'Stabilises repolarisation.' },
    { q: 'Ventricular rate of 150 with sawtooth waves suggests:', options: ['AF', 'Atrial flutter with 2:1 block', 'VT', 'Sinus'], answer: 1, why: 'Flutter at 300 with 2:1.' },
    { q: 'Unstable tachycardia with a pulse requires:', options: ['Adenosine', 'Synchronised cardioversion', 'Unsynchronised shock', 'Observation'], answer: 1, why: 'Electrical therapy.' },
    { q: 'An irregular wide-complex tachycardia at 240 with varying QRS morphology:', options: ['Give diltiazem', 'Suspect AF with WPW — avoid AV nodal blockers', 'Give adenosine', 'Give digoxin'], answer: 1, why: 'Risk of VF.' },
    { q: 'Junctional escape rate:', options: ['20–40', '40–60', '60–100', '100–150'], answer: 1, why: 'AV junction intrinsic rate.' },
    { q: 'Atropine is ineffective in:', options: ['Vagal bradycardia', 'Heart transplant recipients', 'Sinus bradycardia', 'Inferior MI nodal block'], answer: 1, why: 'Denervated heart.' },
    { q: 'Clue favouring VT over SVT with aberrancy:', options: ['Response to vagal manoeuvres', 'AV dissociation or fusion beats', 'Young age', 'Narrow QRS'], answer: 1, why: 'Specific for VT.' },
    { q: 'Epinephrine infusion dose for bradycardia:', options: ['2–10 mcg/min', '1 mg bolus', '50 mcg/kg/min', '0.01 mcg/min'], answer: 0, why: 'Chronotropic support.' },
    { q: 'Rate control for AF in severe HFrEF should avoid:', options: ['Amiodarone', 'Diltiazem', 'Digoxin', 'Cardioversion if unstable'], answer: 1, why: 'Negative inotropy.' },
    { q: 'Adenosine in atrial flutter typically:', options: ['Terminates it', 'Transiently slows AV conduction, revealing flutter waves', 'Causes VF always', 'Has no effect'], answer: 1, why: 'Diagnostic, not curative.' },
  ],
  sources: [
    { title: 'AHA guidelines for CPR and ECC: adult bradycardia and tachycardia algorithms', url: 'https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines' },
    { title: 'Appelboam A et al. REVERT trial: modified Valsalva for SVT. Lancet (2015)', url: 'https://pubmed.ncbi.nlm.nih.gov/26314489/' },
  ],
};
