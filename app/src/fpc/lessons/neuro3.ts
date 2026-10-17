/** FP-C V.7–V.9: traumatic brain injury; spinal cord injuries; neurological diagnostics (CT). */
import type { FpcLesson } from '../types';

export const TBI: FpcLesson = {
  id: 'fpc-tbi', domain: 'neuro', ref: 'V.7',
  title: 'Traumatic brain injury',
  summary: 'Classifying TBI, the intracranial lesions and their courses, the evidence-based prehospital targets, intubation in head injury, and the lucid interval that catches crews out.',
  objectives: [
    'Classify TBI severity and describe the major intracranial lesions.',
    'Apply prehospital TBI targets for oxygen, ventilation and blood pressure.',
    'Intubate and transport a head-injured patient without causing secondary injury.',
  ],
  sections: [
    {
      id: 'classify', title: 'Classification and lesions', core: true,
      body: [
        'TBI severity by GCS after resuscitation: mild 13–15, moderate 9–12, severe 3–8. Mild TBI makes up most cases, but older and anticoagulated patients with "mild" injuries can harbour significant bleeds. Penetrating injuries and skull fractures — especially depressed or basal fractures (raccoon eyes, Battle\'s sign, CSF otorrhoea or rhinorrhoea, haemotympanum) — raise the risk.',
        'Epidural haematoma: arterial bleeding (classically the middle meningeal artery) between the skull and dura, often with a temporal fracture. Up to a third have a lucid interval — a brief recovery after the injury followed by rapid deterioration as the clot expands. It appears biconvex (lens-shaped) on CT and does not cross suture lines. Prompt evacuation gives excellent outcomes.',
        'Subdural haematoma: venous bleeding from bridging veins between the dura and arachnoid, crescent-shaped on CT, crossing sutures. Acute subdurals follow high-energy injury and carry high mortality from the associated brain injury; chronic subdurals occur in older adults and alcohol users after minor trauma. Diffuse axonal injury from rotational forces causes coma out of proportion to CT findings. Contusions often "blossom" — enlarge — over the first 24–72 hours.',
      ],
    },
    {
      id: 'targets', title: 'Prehospital targets', core: true,
      body: [
        'The EPIC study showed that implementing prehospital TBI guidelines — preventing hypoxia, hyperventilation and hypotension — improved survival in severe TBI. A single systolic below 90 mmHg roughly doubles mortality, and a single SpO₂ below 90 % does similar harm. Brain Trauma Foundation guidelines recommend SBP ≥ 100 mmHg for patients aged 50–69 and ≥ 110 mmHg for ages 15–49 and over 70.',
        'Ventilate to normocapnia: EtCO₂ 35–40 mmHg, confirmed against an arterial gas where possible. Hyperventilation after intubation is common and harmful; use a ventilator or a rate-guided bag with capnography, not enthusiasm. Brief hyperventilation is reserved for signs of herniation.',
        'Transport to a centre with neurosurgery. Give TXA within 3 hours to patients with mild to moderate TBI per local protocol (CRASH-3 showed benefit in that group when given early). Treat seizures; check glucose; keep the head up and midline.',
      ],
      table: {
        caption: 'Lesions on CT',
        head: ['Lesion', 'Source', 'CT shape', 'Clinical'],
        rows: [['Epidural', 'Arterial (middle meningeal)', 'Biconvex, does not cross sutures', 'Lucid interval; rapid decline'], ['Subdural', 'Venous (bridging veins)', 'Crescent, crosses sutures', 'Older, anticoagulated; high mortality acute'], ['Contusion', 'Parenchymal', 'Patchy, "salt and pepper"', 'Blossoms over 24–72 h'], ['DAI', 'Shearing', 'Often near-normal CT', 'Coma out of proportion'], ['Traumatic SAH', 'Cortical vessels', 'Blood in sulci', 'Common, usually not aneurysmal']],
      },
    },
    {
      id: 'rsi', title: 'Intubating the head-injured patient', core: true,
      body: [
        'Indications include GCS ≤ 8, inability to protect the airway, hypoxia or hypoventilation despite simple measures, combativeness that prevents safe care or transport, and a deteriorating GCS with a long transport. Document the pre-intubation GCS (with components) and pupils first.',
        'Preoxygenate thoroughly and use apnoeic oxygenation: a desaturation during intubation is a secondary injury. Choose haemodynamically stable induction (ketamine or etomidate; ketamine does not raise ICP meaningfully in ventilated patients and supports pressure). Rocuronium or succinylcholine are acceptable early. Push-dose vasopressor ready; consider fentanyl to blunt the pressor response if pressure allows.',
        'After intubation: confirm with waveform capnography, set EtCO₂ 35–40, head up 30°, sedate adequately, and loosen any tie or collar compressing the neck veins. Recheck pupils.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the lucid interval',
      body: ['A 19-year-old was struck on the side of the head by a cricket ball, briefly knocked out, then walked off talking. Ninety minutes later he complains of a worsening headache, vomits twice and becomes drowsy (GCS 12 → 10). Left pupil 5 mm, sluggish.'],
      example: { case: 'Act.', steps: [
        'Classic epidural haematoma with lucid interval and early uncal herniation (ipsilateral pupil).',
        'Secure the airway after documenting the GCS and pupils; avoid hypoxia and hypotension.',
        'EtCO₂ 35–40; brief hyperventilation to 30–35 only if herniation progresses; hypertonic saline.',
        'Direct to the nearest neurosurgical centre — evacuation is time-critical and outcomes are excellent if fast.',
      ] },
    },
  ],
  keyPoints: [
    'Mild 13–15, moderate 9–12, severe 3–8.',
    'Epidural: arterial, biconvex, lucid interval. Subdural: venous, crescent, crosses sutures.',
    'One SBP < 90 or SpO₂ < 90 % markedly worsens outcome.',
    'Normocapnia after intubation — no routine hyperventilation.',
    'TXA within 3 h in mild–moderate TBI; transport to neurosurgery.',
  ],
  pearls: ['Contusions blossom over 24–72 hours.', 'Battle\'s sign and raccoon eyes are late signs of basal skull fracture.'],
  pitfalls: ['Over-bagging after intubation.', 'Dismissing a "mild" head injury in an anticoagulated elder.'],
  live: [{ id: 'neuro-icp', label: 'Intracranial pressure' }, { id: 'moa-ketamine', label: 'Ketamine: mechanism' }],
  questions: [
    { q: 'Moderate TBI by GCS:', options: ['13–15', '9–12', '3–8', '14–15'], answer: 1, why: 'Standard classification.' },
    { q: 'An epidural haematoma is classically from:', options: ['Bridging veins', 'Middle meningeal artery', 'Venous sinuses only', 'Berry aneurysm'], answer: 1, why: 'Temporal fracture.' },
    { q: 'Epidural haematoma CT shape:', options: ['Crescent', 'Biconvex (lens)', 'Star-shaped', 'Diffuse'], answer: 1, why: 'Limited by sutures.' },
    { q: 'Subdural haematomas:', options: ['Do not cross sutures', 'Cross suture lines, crescent-shaped', 'Are always arterial', 'Never occur in elders'], answer: 1, why: 'Venous; between dura and arachnoid.' },
    { q: 'A lucid interval is most associated with:', options: ['Subdural', 'Epidural', 'DAI', 'SAH'], answer: 1, why: 'Recovery then rapid decline.' },
    { q: 'Diffuse axonal injury typically shows:', options: ['Large haematoma', 'Coma with near-normal CT', 'Biconvex clot', 'Midline shift always'], answer: 1, why: 'Shearing injury.' },
    { q: 'SBP target for a 35-year-old with TBI (BTF):', options: ['≥ 90', '≥ 110 mmHg', '≥ 70', '≥ 150'], answer: 1, why: 'Ages 15–49 and > 70.' },
    { q: 'The EPIC study demonstrated:', options: ['Hyperventilation benefits', 'Improved survival with guideline-based care preventing hypoxia, hypotension, hyperventilation', 'Steroids help TBI', 'Mannitol prevents herniation'], answer: 1, why: 'Prehospital TBI guidelines.' },
    { q: 'EtCO₂ target after intubation in TBI (no herniation):', options: ['25–30', '35–40 mmHg', '45–55', '< 25'], answer: 1, why: 'Normocapnia.' },
    { q: 'CRASH-3 found TXA benefit in:', options: ['Severe TBI with fixed pupils', 'Mild to moderate TBI given early', 'All TBI after 8 h', 'No group'], answer: 1, why: 'Within 3 hours.' },
    { q: 'Contusions on CT typically:', options: ['Shrink immediately', 'Enlarge over 24–72 h', 'Never change', 'Are arterial'], answer: 1, why: 'Blossoming.' },
    { q: 'A sign of basal skull fracture:', options: ['Pinpoint pupils', 'Battle\'s sign', 'Ptosis', 'Hemiparesis'], answer: 1, why: 'Mastoid bruising.' },
    { q: 'A single episode of SpO₂ < 90 % in TBI:', options: ['Is harmless', 'Worsens outcome', 'Improves ICP', 'Is expected'], answer: 1, why: 'Secondary injury.' },
    { q: 'Induction agent that supports BP in TBI:', options: ['Propofol (large dose)', 'Ketamine', 'Thiopental', 'Midazolam (large dose)'], answer: 1, why: 'Sympathomimetic.' },
    { q: 'Before RSI in TBI, always document:', options: ['Last meal', 'GCS components and pupils', 'Temperature only', 'Weight'], answer: 1, why: 'Last neuro baseline.' },
  ],
  sources: [
    { title: 'Spaite DW et al. EPIC: Prehospital TBI guideline implementation. JAMA Surg (2019)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Spaite+EPIC+prehospital+traumatic+brain+injury+guidelines+JAMA+Surg+2019' },
    { title: 'Brain Trauma Foundation: Prehospital guidelines (3rd ed.)', url: 'https://braintrauma.org/coma/guidelines' },
    { title: 'StatPearls: Epidural hematoma', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Epidural+hematoma+StatPearls' },
  ],
};

export const SCI: FpcLesson = {
  id: 'fpc-sci', domain: 'neuro', ref: 'V.8',
  title: 'Spinal cord injuries',
  summary: 'Spinal motion restriction, cord syndromes, neurogenic versus spinal shock, respiratory failure in cervical injuries, autonomic dysreflexia, and transport positioning.',
  objectives: [
    'Apply selective spinal motion restriction and recognise cord syndromes.',
    'Distinguish neurogenic shock from spinal shock and haemorrhagic shock.',
    'Anticipate respiratory failure and manage the airway in cervical cord injury.',
  ],
  sections: [
    {
      id: 'smr', title: 'Spinal motion restriction', core: true,
      body: [
        'The emphasis has moved from rigid immobilisation on a long board to spinal motion restriction: a cervical collar where indicated, and keeping the spine aligned using a scoop stretcher, vacuum mattress or the stretcher itself. Long boards cause pressure injury, pain and restricted breathing and are best used only for extrication. Validated criteria (NEXUS, Canadian C-spine rule) identify low-risk patients who do not need restriction.',
        'Penetrating injuries to the neck or torso without neurological deficit do not benefit from collars, which can hide bleeding and airway problems and delay care. In TBI, collars can raise ICP by compressing the jugular veins — keep them correctly sized or use blocks and tape instead.',
        'Older patients with ankylosing spondylitis or kyphosis should be immobilised in their usual position — forcing them flat can cause fractures and cord injury.',
      ],
    },
    {
      id: 'syndromes', title: 'Cord levels and syndromes', core: true,
      body: [
        'Key levels: C3–C5 innervate the diaphragm ("C3, 4, 5 keeps the diaphragm alive"); injuries at or above C5 often need ventilation. C5 is elbow flexion, C6 wrist extension, C7 elbow extension, C8 finger flexion, T1 finger abduction; T4 is the nipple line and T10 the umbilicus. A complete injury has no motor or sensory function below the level, including sacral sparing; incomplete injuries have some preserved function and a better prognosis.',
        'Central cord syndrome — weakness greater in the arms than legs — follows hyperextension in older patients with spondylosis. Anterior cord syndrome loses motor function and pain/temperature with preserved proprioception and vibration; prognosis is poor. Brown-Séquard (hemisection, often penetrating) causes ipsilateral motor and proprioceptive loss with contralateral pain and temperature loss. Cauda equina compression causes saddle anaesthesia, urinary retention and leg weakness.',
      ],
      table: {
        caption: 'Shock in spinal injury',
        head: ['', 'Neurogenic shock', 'Spinal shock', 'Haemorrhagic shock'],
        rows: [['What it is', 'Loss of sympathetic tone (injury above T6)', 'Temporary loss of reflexes below injury', 'Blood loss'], ['BP', 'Low', 'Not a BP state', 'Low'], ['HR', 'Bradycardia or normal', '—', 'Tachycardia'], ['Skin', 'Warm, dry, flushed', '—', 'Cool, pale, clammy'], ['Treatment', 'Exclude bleeding; fluids, vasopressors, atropine', 'Time (resolves days–weeks)', 'Blood, haemorrhage control']],
      },
    },
    {
      id: 'manage', title: 'Haemodynamics, breathing and complications', core: true,
      body: [
        'Neurogenic shock is a diagnosis of exclusion in trauma: hypotension in a trauma patient is haemorrhage until proven otherwise, even with a cord injury. Once bleeding is excluded or controlled, give fluids and a vasopressor with alpha and beta effect (norepinephrine) to maintain a MAP of 85–90 mmHg for the first several days — commonly recommended to protect cord perfusion. Treat symptomatic bradycardia with atropine or pacing; suctioning and laryngoscopy can trigger severe bradycardia.',
        'Cervical and high thoracic injuries cause respiratory failure through loss of intercostal and, at C3–C5, diaphragmatic function. Fatigue is progressive over hours to days as the cord swells. Watch vital capacity, paradoxical breathing and rising CO₂, and intubate early before a long flight rather than in the aircraft. Use manual in-line stabilisation and video laryngoscopy; succinylcholine is safe in the first 24–72 hours.',
        'Patients with chronic injuries above T6 are at risk of autonomic dysreflexia — severe hypertension, headache, flushing above the injury and bradycardia triggered by a noxious stimulus below it (a blocked catheter, constipation, pressure, tight clothing). Sit the patient up, remove the trigger and treat pressure if it persists. Steroids are no longer recommended routinely for acute cord injury.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the diver',
      body: ['A 24-year-old dived into a shallow pool. He cannot move his legs or fingers, but can bend his elbows. Breathing is abdominal. BP 82/46, HR 52, skin warm and dry. No other obvious injuries; eFAST negative.'],
      example: { case: 'Interpret and manage.', steps: [
        'Probable C5–C6 complete injury (elbow flexion present, wrist and finger function absent) with neurogenic shock.',
        'Exclude haemorrhage first (eFAST, pelvis, long bones); then fluids and norepinephrine to MAP 85–90.',
        'Anticipate respiratory failure — diaphragmatic breathing only; intubate before departure with in-line stabilisation; atropine ready for bradycardia during laryngoscopy.',
        'Spinal motion restriction on a vacuum mattress; pad pressure points; keep warm (poikilothermia).',
      ] },
    },
  ],
  keyPoints: [
    'Spinal motion restriction, not routine long boards; no collar for penetrating neck trauma without deficit.',
    'C3–C5 diaphragm; injuries at or above C5 often need ventilation.',
    'Neurogenic shock: hypotension, bradycardia, warm skin — exclude bleeding first.',
    'MAP 85–90 for cord perfusion; atropine for bradycardia.',
    'Autonomic dysreflexia: sit up, find and remove the trigger.',
  ],
  pearls: ['Immobilise kyphotic patients in their usual position.', 'Cord-injured patients lose temperature control — keep warm.'],
  pitfalls: ['Attributing hypotension to neurogenic shock without excluding haemorrhage.', 'Delaying intubation in progressive diaphragmatic fatigue.'],
  live: [{ id: 'moa-norepinephrine', label: 'Norepinephrine: mechanism' }],
  questions: [
    { q: 'The diaphragm is innervated by:', options: ['T1–T4', 'C3–C5', 'C7–T1', 'L1–L2'], answer: 1, why: 'Phrenic nerve.' },
    { q: 'Neurogenic shock typically presents with:', options: ['Hypotension, tachycardia, cool skin', 'Hypotension, bradycardia, warm skin', 'Hypertension', 'Fever'], answer: 1, why: 'Loss of sympathetic tone.' },
    { q: 'Spinal shock refers to:', options: ['Hypotension from cord injury', 'Temporary loss of reflexes below the injury', 'Haemorrhage', 'Septic shock'], answer: 1, why: 'Not a haemodynamic state.' },
    { q: 'MAP target after acute spinal cord injury (commonly recommended):', options: ['55–60', '85–90 mmHg', '> 120', '65 only'], answer: 1, why: 'Cord perfusion.' },
    { q: 'Hypotension in a trauma patient with a cord injury is:', options: ['Always neurogenic', 'Haemorrhage until proven otherwise', 'Normal', 'From spinal shock'], answer: 1, why: 'Exclude bleeding.' },
    { q: 'Central cord syndrome causes:', options: ['Leg weakness > arm', 'Arm weakness > leg', 'Ipsilateral motor loss', 'Saddle anaesthesia'], answer: 1, why: 'Hyperextension in elders.' },
    { q: 'Brown-Séquard syndrome causes contralateral loss of:', options: ['Motor function', 'Pain and temperature', 'Proprioception', 'Vision'], answer: 1, why: 'Spinothalamic tracts cross early.' },
    { q: 'Anterior cord syndrome preserves:', options: ['Motor function', 'Proprioception and vibration', 'Pain', 'Temperature'], answer: 1, why: 'Dorsal columns spared.' },
    { q: 'Autonomic dysreflexia is triggered by:', options: ['Low glucose', 'Noxious stimulus below the injury (e.g. blocked catheter)', 'Hypothermia', 'Opioids'], answer: 1, why: 'Injuries above T6.' },
    { q: 'First step in autonomic dysreflexia:', options: ['Lie flat', 'Sit up and remove the trigger', 'Give fluids', 'Atropine'], answer: 1, why: 'Lowers BP; treats cause.' },
    { q: 'Routine steroids in acute spinal cord injury:', options: ['Recommended', 'No longer recommended', 'Mandatory', 'Only for penetrating'], answer: 1, why: 'Harms outweigh benefits.' },
    { q: 'A collar for penetrating neck injury without neurological deficit:', options: ['Mandatory', 'Not recommended', 'Always a long board', 'Required in TBI'], answer: 1, why: 'Hides bleeding and airway.' },
    { q: 'The nipple line dermatome:', options: ['T10', 'T4', 'C4', 'L1'], answer: 1, why: 'Sensory level landmark.' },
    { q: 'Severe bradycardia during suctioning in a cervical injury:', options: ['Ignore', 'Treat with atropine; vagal stimulation unopposed', 'Give beta-blocker', 'Hyperventilate'], answer: 1, why: 'Loss of sympathetic tone.' },
    { q: 'C6 motor function:', options: ['Elbow flexion', 'Wrist extension', 'Finger abduction', 'Hip flexion'], answer: 1, why: 'Key muscle.' },
  ],
  sources: [
    { title: 'ACS-COT, ACEP, NAEMSP: Spinal motion restriction in the trauma patient — joint position statement (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=spinal+motion+restriction+trauma+patient+joint+position+statement+2018' },
    { title: 'StatPearls: Neurogenic shock', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Neurogenic+shock+StatPearls' },
    { title: 'StatPearls: Autonomic dysreflexia', url: 'https://www.ncbi.nlm.nih.gov/books/?term=Autonomic+dysreflexia+StatPearls' },
  ],
};

export const NEURO_DX: FpcLesson = {
  id: 'fpc-neuro-dx', domain: 'neuro', ref: 'V.9',
  title: 'Neurological diagnostics: reading head CT',
  summary: 'A systematic approach to non-contrast head CT, recognising blood by age and location, signs of mass effect and herniation, early ischaemic change, and what CTA, perfusion imaging and lumbar puncture add.',
  objectives: [
    'Read a head CT systematically and identify blood, mass effect and hydrocephalus.',
    'Recognise early signs of ischaemic stroke on CT.',
    'Explain what CTA, CT perfusion and LP add, and their transport implications.',
  ],
  sections: [
    {
      id: 'system', title: 'A systematic read', core: true,
      body: [
        'Use a mnemonic such as "Blood Can Be Very Bad": Blood (extra-axial — epidural, subdural, subarachnoid — and intra-axial), Cisterns (are the basal cisterns open or effaced?), Brain (grey–white differentiation, symmetry, oedema, masses), Ventricles (size, midline shift, blood), Bone (fractures on bone windows; air in the sinuses or around the brain).',
        'Acute blood is bright (hyperdense, about 50–70 Hounsfield units); subacute blood fades to grey over 1–3 weeks and can become isodense with brain — a subacute subdural is easy to miss; chronic blood is dark (hypodense). Mixed density in a subdural suggests acute bleeding into a chronic collection. Patients who are severely anaemic may have acute blood that looks less bright.',
        'Mass effect: midline shift (measured at the septum pellucidum; over 5 mm is significant), effaced sulci, compressed or absent basal cisterns, and compression of the ventricle on the side of the lesion with dilation of the opposite one. Effaced basal cisterns indicate impending or established herniation.',
      ],
    },
    {
      id: 'stroke', title: 'Ischaemia, hydrocephalus and other findings', core: true,
      body: [
        'CT is often normal in the first hours of ischaemic stroke; its main job is to exclude haemorrhage before thrombolysis. Early signs include a hyperdense artery (clot in the MCA — the "hyperdense MCA sign"), loss of the insular ribbon, obscuration of the lentiform nucleus and subtle loss of grey–white differentiation. The ASPECTS score (0–10) quantifies early ischaemic change in the MCA territory; a low score means a large core.',
        'Hydrocephalus: enlarged ventricles with rounded frontal horns and dilated temporal horns; in obstructive hydrocephalus the fourth ventricle may be normal while the lateral and third ventricles balloon. Periventricular low density indicates CSF under pressure seeping into the brain. Pneumocephalus (air) indicates a skull base or open fracture.',
        'Diffuse cerebral oedema — loss of grey–white differentiation throughout, effaced sulci and cisterns — follows hypoxic injury, and the "reversal sign" (cerebellum and brainstem brighter than the cerebrum) suggests severe global injury.',
      ],
      list: { caption: 'Blood Can Be Very Bad', items: ['Blood — epidural, subdural, subarachnoid, intraparenchymal, intraventricular', 'Cisterns — open, compressed or effaced', 'Brain — grey–white differentiation, oedema, masses, symmetry', 'Ventricles — size, shift, blood', 'Bone — fractures, sinus fluid, air'] },
    },
    {
      id: 'beyond', title: 'Beyond plain CT', core: true,
      body: [
        'CT angiography (CTA) shows vessel occlusions (LVO), aneurysms, dissections and a "spot sign" — contrast extravasation within an ICH that predicts expansion. CT perfusion maps the ischaemic core (tissue already infarcted) against the penumbra (at-risk but salvageable tissue); a mismatch selects patients for late thrombectomy. MRI with diffusion-weighted imaging is the most sensitive test for ischaemia but rarely available or practical in the acute transport window.',
        'Lumbar puncture detects SAH when CT is negative beyond 6 hours (xanthochromia appears after about 12 hours) and diagnoses meningitis; it is contraindicated with signs of raised ICP or mass effect. Do not delay antibiotics in suspected meningitis for imaging or LP.',
        'For transport, the images matter as much as the report: ensure the receiving centre can see the CT (image transfer systems) before departure, and don\'t repeat or wait for imaging that will not change destination. A non-contrast CT that excludes haemorrhage and a CTA showing an LVO are usually enough to launch a thrombectomy transfer.',
      ],
    },
    {
      id: 'case', title: 'Reading case: three scans',
      body: ['You are shown three CTs during referral calls: (1) a crescent of mixed bright and grey density over the right hemisphere with 8 mm midline shift in an 81-year-old on warfarin; (2) a bright dot in the left MCA with subtle loss of the insular ribbon in a patient 90 minutes from onset; (3) blood filling the basal cisterns and Sylvian fissures with enlarged temporal horns.'],
      example: { case: 'Interpret each.', steps: [
        '(1) Acute-on-chronic subdural with significant mass effect — reverse warfarin (PCC + vitamin K) and transfer to neurosurgery urgently.',
        '(2) Hyperdense MCA sign with early ischaemia — LVO likely; lysis if eligible and thrombectomy transfer.',
        '(3) Aneurysmal-pattern SAH with early hydrocephalus — BP control, nimodipine plan, neurovascular centre; watch GCS for EVD need.',
      ] },
    },
  ],
  keyPoints: [
    'Blood Can Be Very Bad: blood, cisterns, brain, ventricles, bone.',
    'Acute blood bright; subacute isodense (easily missed); chronic dark.',
    'Midline shift > 5 mm and effaced cisterns = significant mass effect.',
    'Early stroke CT is often normal; look for hyperdense MCA and insular ribbon loss.',
    'CTA finds LVO, aneurysm, spot sign; perfusion maps core vs penumbra.',
  ],
  pearls: ['Mixed-density subdural = acute-on-chronic bleed.', 'Spot sign predicts ICH expansion.'],
  pitfalls: ['Missing an isodense subacute subdural.', 'Delaying antibiotics for CT in meningitis.'],
  live: [{ id: 'neuro-time-machine', label: 'Imaging the brain over time' }],
  questions: [
    { q: 'Acute blood on CT appears:', options: ['Dark', 'Bright (hyperdense)', 'Isodense always', 'Invisible'], answer: 1, why: 'Acute clot measures about 50–70 HU.' },
    { q: 'A subdural that is easy to miss on CT:', options: ['Acute', 'Subacute (isodense)', 'Chronic', 'Calcified'], answer: 1, why: 'Same density as brain.' },
    { q: 'Midline shift considered significant:', options: ['> 1 mm', '> 5 mm', '> 20 mm', 'Any'], answer: 1, why: 'Mass effect.' },
    { q: 'Effaced basal cisterns indicate:', options: ['Normal', 'Impending or established herniation', 'Atrophy', 'Hydrocephalus only'], answer: 1, why: 'No room left.' },
    { q: 'The hyperdense MCA sign represents:', options: ['Haemorrhage', 'Clot in the MCA', 'Calcification only', 'Aneurysm'], answer: 1, why: 'Early stroke sign.' },
    { q: 'The main job of CT in acute stroke:', options: ['Find the clot always', 'Exclude haemorrhage before lysis', 'Measure NIHSS', 'Diagnose seizures'], answer: 1, why: 'Lysis safety.' },
    { q: 'A low ASPECTS score means:', options: ['Small core', 'Large area of early ischaemia', 'Haemorrhage', 'Normal'], answer: 1, why: '10 is normal.' },
    { q: 'CT perfusion distinguishes:', options: ['Blood from bone', 'Core from penumbra', 'Epidural from subdural', 'Arteries from veins'], answer: 1, why: 'Selects late thrombectomy.' },
    { q: 'The spot sign on CTA predicts:', options: ['Vasospasm', 'ICH expansion', 'Seizure', 'Hydrocephalus'], answer: 1, why: 'Active extravasation.' },
    { q: 'Periventricular low density with large ventricles suggests:', options: ['Atrophy', 'Hydrocephalus with transependymal CSF flow', 'Stroke', 'Tumour'], answer: 1, why: 'CSF under pressure.' },
    { q: 'Lumbar puncture is contraindicated with:', options: ['Fever', 'Signs of raised ICP or mass effect', 'Headache', 'Neck stiffness'], answer: 1, why: 'Herniation risk.' },
    { q: 'In suspected meningitis, antibiotics should be:', options: ['Delayed until LP', 'Given without delay for imaging or LP', 'Avoided', 'Given after CT only'], answer: 1, why: 'Time-critical.' },
    { q: 'Pneumocephalus suggests:', options: ['Stroke', 'Skull base or open fracture', 'Hydrocephalus', 'Normal'], answer: 1, why: 'Air has entered through a fracture.' },
    { q: 'The "reversal sign" suggests:', options: ['Mild concussion', 'Severe global hypoxic injury', 'Subdural', 'Epidural'], answer: 1, why: 'Diffuse oedema.' },
    { q: 'Xanthochromia in CSF appears after about:', options: ['10 minutes', '12 hours', '2 weeks', 'Never'], answer: 1, why: 'Haemoglobin breakdown.' },
  ],
  sources: [
    { title: 'StatPearls: CT head', url: 'https://www.ncbi.nlm.nih.gov/books/?term=CT+head+StatPearls' },
    { title: 'Radiopaedia: Hyperdense MCA sign', url: 'https://radiopaedia.org/articles/hyperdense-mca-sign' },
  ],
};
