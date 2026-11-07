/** FP-C V.4–V.6: cerebral ischaemia and LVO; neuroprotective strategies; cerebral haemorrhage. */
import type { FpcLesson } from '../types';

export const STROKE_LVO: FpcLesson = {
  id: 'fpc-stroke-lvo', domain: 'neuro', ref: 'V.4',
  title: 'Acute ischaemic stroke and large-vessel occlusion',
  summary: 'Thrombolysis and thrombectomy windows, eligibility, blood pressure targets before and after reperfusion, and the transport decisions — drip-and-ship versus direct to a comprehensive centre — that decide outcome.',
  objectives: [
    'State the time windows and key contraindications for thrombolysis and thrombectomy.',
    'Manage blood pressure, glucose and oxygen in acute stroke.',
    'Monitor a patient during and after thrombolysis and recognise complications.',
  ],
  sections: [
    {
      id: 'reperfusion', title: 'Reperfusion therapy', core: true,
      body: [
        'In a large-vessel occlusion, about two million neurons die every minute. Intravenous thrombolysis — alteplase 0.9 mg/kg (maximum 90 mg; 10 % as a bolus, the rest over 60 minutes) or tenecteplase as a single bolus (0.25 mg/kg, maximum 25 mg, in many current guidelines) — is given within 4.5 hours of last known well in eligible patients. Imaging-selected patients may be treated later in some centres.',
        'Mechanical thrombectomy removes the clot from the internal carotid, M1 or proximal M2, or basilar artery. It is standard up to 6 hours, and up to 24 hours from last known well in patients selected by perfusion imaging (DAWN and DEFUSE-3), with growing evidence for large-core strokes. Thrombectomy has one of the largest treatment effects in medicine — roughly one in three treated patients has a better functional outcome.',
        'Key thrombolysis contraindications: intracranial haemorrhage on CT, recent major surgery or head trauma, active internal bleeding, known intracranial neoplasm or AVM, platelets below 100 × 10⁹/L, INR above 1.7, therapeutic anticoagulation with a DOAC within 48 hours (unless levels are normal), glucose below 2.8 mmol/L (50 mg/dL) and uncontrolled blood pressure above 185/110 mmHg despite treatment.',
      ],
      table: {
        caption: 'Reperfusion windows (from last known well)',
        head: ['Therapy', 'Window', 'Notes'],
        rows: [['IV alteplase / tenecteplase', '≤ 4.5 h', 'BP < 185/110 before, < 180/105 for 24 h after'], ['Thrombectomy', '≤ 6 h', 'ICA, M1/M2, basilar occlusion'], ['Thrombectomy (selected)', '6–24 h', 'Perfusion or clinical–core mismatch']],
      },
    },
    {
      id: 'supportive', title: 'Supportive care', core: true,
      body: [
        'Blood pressure: in patients not receiving reperfusion, permissive hypertension up to 220/120 is tolerated to preserve flow to the penumbra. Before thrombolysis, lower to below 185/110; after, maintain below 180/105 for 24 hours. Use labetalol (10–20 mg IV) or a nicardipine or clevidipine infusion; avoid abrupt drops. Treat hypotension aggressively.',
        'Oxygen only to keep SpO₂ above 94 %; hyperoxia gives no benefit. Keep glucose between about 7.8 and 10 mmol/L (140–180 mg/dL); both hypo- and hyperglycaemia worsen outcome. Treat fever. Keep the head of the bed flat or at 30° according to protocol and airway protection. Nil by mouth until swallowing is screened.',
        'Large hemispheric (malignant MCA) infarcts swell over 2–5 days and can herniate; young patients may need decompressive craniectomy. Basilar artery occlusion presents with fluctuating consciousness, vertigo, diplopia and quadriparesis and is easily missed; it carries a very high mortality untreated.',
      ],
    },
    {
      id: 'transport', title: 'Transport decisions and post-lysis monitoring', core: true,
      body: [
        'Patients with suspected LVO near a primary centre may receive thrombolysis there and then transfer for thrombectomy ("drip and ship"); bypassing to a comprehensive centre ("mothership") can speed thrombectomy at the cost of delayed lysis. Regional protocols set the threshold using LVO scale scores and transport times. Either way, door-in-door-out times at the referring hospital should be minimised, and the flight crew should not delay departure to finish an infusion that can run in the aircraft.',
        'During and after thrombolysis, check neurological status and blood pressure every 15 minutes for the first two hours. Sudden headache, vomiting, rising blood pressure or neurological deterioration suggests symptomatic intracranial haemorrhage (about 2–7 %): stop the infusion, support the airway and pressure, and notify the receiving team — cryoprecipitate and tranexamic acid are used for reversal. Orolingual angio-oedema occurs in about 1–5 %, more often with ACE inhibitors: stop the drug, give antihistamines and steroids, and prepare for a difficult airway.',
      ],
    },
    {
      id: 'case', title: 'Transport case: drip and ship',
      body: ['A 69-year-old with sudden left hemiplegia, right gaze deviation and neglect; last known well 70 minutes ago. RACE score 7. CT shows no haemorrhage; CTA shows a right M1 occlusion. BP 196/104. Alteplase has been started at the referring hospital; the thrombectomy centre is 35 minutes away by air.'],
      example: { case: 'Manage the flight.', steps: [
        'Do not wait for the infusion to finish — depart with it running.',
        'BP must stay below 180/105: labetalol 10–20 mg IV or a nicardipine infusion.',
        'Neuro checks and BP every 15 minutes; watch for headache, vomiting or decline (haemorrhage) and tongue swelling (angio-oedema).',
        'SpO₂ > 94 %, glucose 7.8–10, head per protocol; call ahead with the last-known-well time and lysis start time.',
      ] },
    },
  ],
  keyPoints: [
    'IV thrombolysis ≤ 4.5 h; thrombectomy ≤ 6 h, up to 24 h with imaging selection.',
    'BP < 185/110 before lysis and < 180/105 for 24 h after; otherwise permissive to 220/120.',
    'SpO₂ > 94 %, glucose 7.8–10 mmol/L, treat fever.',
    'Neuro and BP checks every 15 min after lysis; stop for haemorrhage or angio-oedema.',
    'Don\'t delay transfer for an infusion that can run in flight.',
  ],
  pearls: ['Basilar occlusion fluctuates — don\'t be falsely reassured.', 'ACE inhibitors raise angio-oedema risk with alteplase.'],
  pitfalls: ['Aggressive BP lowering in a non-lysed stroke.', 'Waiting at the referring hospital for the infusion to finish.'],
  live: [{ id: 'neuro-lvo', label: 'Large-vessel occlusion on the live model' }, { id: 'moa-thrombolytic', label: 'Thrombolytics: mechanism' }, { id: 'moa-labetalol', label: 'Labetalol: mechanism' }],
  questions: [
    { q: 'IV thrombolysis window from last known well:', options: ['1 h', '4.5 h', '12 h', '24 h'], answer: 1, why: 'Standard window.' },
    { q: 'Thrombectomy may be offered up to 24 h when:', options: ['Any patient', 'Imaging shows salvageable tissue', 'BP is normal', 'Patient is young'], answer: 1, why: 'DAWN and DEFUSE-3.' },
    { q: 'Alteplase dose for stroke:', options: ['1.5 mg/kg', '0.9 mg/kg (max 90 mg), 10 % bolus', '0.25 mg/kg bolus only', '100 mg flat'], answer: 1, why: 'Stroke regimen.' },
    { q: 'BP threshold before thrombolysis:', options: ['< 220/120', '< 185/110', '< 140/90', 'No limit'], answer: 1, why: 'Reduces haemorrhage risk.' },
    { q: 'BP target for 24 h after thrombolysis:', options: ['< 180/105', '< 220/120', '< 120/80', '< 160/100 only for 1 h'], answer: 0, why: 'Post-lysis target.' },
    { q: 'Permissive hypertension in non-lysed ischaemic stroke allows up to:', options: ['160/90', '220/120', '250/140', '140/80'], answer: 1, why: 'Preserves penumbral flow.' },
    { q: 'An INR above which thrombolysis is contraindicated:', options: ['1.0', '1.7', '3.0', '5.0'], answer: 1, why: 'Bleeding risk.' },
    { q: 'Glucose target in acute stroke:', options: ['3–5 mmol/L', '7.8–10 mmol/L (140–180 mg/dL)', '> 15 mmol/L', 'Not relevant'], answer: 1, why: 'Avoid both extremes.' },
    { q: 'Sudden headache and vomiting during alteplase infusion:', options: ['Continue', 'Stop the infusion — suspect haemorrhage', 'Increase rate', 'Give heparin'], answer: 1, why: 'Symptomatic ICH.' },
    { q: 'Orolingual angio-oedema with alteplase is more likely with:', options: ['Beta-blockers', 'ACE inhibitors', 'Statins', 'Insulin'], answer: 1, why: 'Bradykinin pathway.' },
    { q: 'Neuro checks after lysis in the first 2 h:', options: ['Hourly', 'Every 15 minutes', 'Every 4 h', 'Once'], answer: 1, why: 'Detect complications early.' },
    { q: '"Drip and ship" means:', options: ['Thrombolysis at a primary centre then transfer for thrombectomy', 'Diuretic then transfer', 'Delay until morning', 'Direct to CT'], answer: 0, why: 'Regional stroke systems.' },
    { q: 'Oxygen in acute stroke is given:', options: ['To all at 15 L/min', 'To keep SpO₂ > 94 %', 'Never', 'Only after thrombectomy'], answer: 1, why: 'No benefit from hyperoxia.' },
    { q: 'Basilar artery occlusion often presents with:', options: ['Isolated arm weakness', 'Fluctuating consciousness, diplopia, vertigo, quadriparesis', 'Aphasia only', 'Headache only'], answer: 1, why: 'Posterior circulation.' },
    { q: 'Malignant MCA infarct swelling peaks around:', options: ['1 hour', '2–5 days', '3 weeks', 'Never'], answer: 1, why: 'Cytotoxic oedema.' },
  ],
  sources: [
    { title: 'AHA/ASA Guidelines for early management of acute ischemic stroke (2019 update)', url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000211' },
    { title: 'DAWN trial. NEJM (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/29129157/' },
    { title: 'DEFUSE 3 trial. NEJM (2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/29364767/' },
  ],
};

export const NEUROPROTECTION: FpcLesson = {
  id: 'fpc-neuroprotection', domain: 'neuro', ref: 'V.5',
  title: 'Neuroprotective strategies: positioning, haemodynamics and EVD care',
  summary: 'Preventing secondary brain injury in transport: cerebral perfusion pressure, oxygen and CO₂ targets, positioning, osmotherapy, temperature, sedation, and managing an external ventricular drain in flight.',
  objectives: [
    'Calculate cerebral perfusion pressure and set haemodynamic targets.',
    'Apply the bundle of measures that prevents secondary brain injury.',
    'Manage an external ventricular drain safely during transport.',
  ],
  sections: [
    {
      id: 'cpp', title: 'Perfusion, pressure and secondary injury', core: true,
      body: [
        'The primary injury happens at the moment of insult; everything afterwards is about preventing secondary injury from hypoxia, hypotension, hypercapnia or hypocapnia, hyperthermia, hypo- or hyperglycaemia, seizures and raised intracranial pressure. A single episode of hypotension or hypoxia measurably worsens outcome.',
        'Cerebral perfusion pressure (CPP) = mean arterial pressure − intracranial pressure. With a normal ICP of 5–15 mmHg, a MAP of 80 gives a CPP of around 65–75. When ICP rises to 30, the same MAP gives a CPP of 50 — too low. Targets: ICP below 22 mmHg and CPP 60–70 mmHg in TBI. Without an ICP monitor, assume ICP is raised in severe brain injury and keep the MAP at least 80 mmHg.',
        'The Monro–Kellie doctrine explains why: the skull is a fixed box containing brain, blood and CSF. As a mass expands, CSF and venous blood are displaced to compensate; when compensation is exhausted, small increases in volume cause large rises in pressure. That is why patients can deteriorate abruptly after a period of apparent stability.',
      ],
    },
    {
      id: 'bundle', title: 'The neuroprotective bundle', core: true,
      body: [
        'Position: head of the bed at 30°, head midline, and cervical collars loosened or replaced with blocks if they compress the jugular veins. Avoid tight ETT ties around the neck. Reverse Trendelenburg maintains spinal alignment when the spine is not cleared.',
        'Oxygen and CO₂: SpO₂ ≥ 94 % (PaO₂ 80–120 mmHg); normocapnia with PaCO₂ 35–45 mmHg (EtCO₂ about 35–40, checked against a gas). Prophylactic hyperventilation causes cerebral vasoconstriction and ischaemia; reserve brief hyperventilation (PaCO₂ 30–35) for signs of herniation as a bridge to definitive treatment.',
        'Osmotherapy for raised ICP: 3 % saline 250 mL (or 23.4 % 30 mL via central line) or mannitol 0.5–1 g/kg. Hypertonic saline also expands volume and is preferred in hypotensive patients; mannitol is an osmotic diuretic that can cause hypotension and requires a urinary catheter. Normothermia (treat fever), glucose 6–10 mmol/L, adequate sedation and analgesia (pain and coughing raise ICP), and seizure prophylaxis in severe TBI complete the bundle.',
      ],
      table: {
        caption: 'Neuroprotective targets (adult)',
        head: ['Variable', 'Target'],
        rows: [['SBP', '≥ 100–110 mmHg'], ['MAP', '≥ 80 mmHg (no monitor)'], ['CPP', '60–70 mmHg'], ['ICP', '< 22 mmHg'], ['SpO₂', '≥ 94 %'], ['PaCO₂', '35–45 mmHg'], ['Temperature', '36–37.5 °C'], ['Glucose', '6–10 mmol/L'], ['Sodium', '135–145 (higher if osmotherapy)']],
      },
    },
    {
      id: 'evd', title: 'External ventricular drains in transport', core: true,
      body: [
        'An EVD is a catheter in the lateral ventricle that both measures ICP and drains CSF. The drainage chamber is set at a height above a zero reference — usually the tragus of the ear (approximating the foramen of Monro) — and CSF drains when ICP exceeds that height (for example, 10–15 cmH₂O).',
        'Movement and position changes alter the relationship between the head and the drain, so clamp the EVD for transfers, loading and take-off and landing per local policy, and re-level and re-open it once the patient is settled. Over-drainage can cause ventricular collapse and subdural haemorrhage; under-drainage allows ICP to rise. Never leave it clamped for long without monitoring ICP, and agree a plan for opening it if ICP rises.',
        'Check the dressing and connections, watch for CSF colour changes (fresh blood suggests rebleeding), and record the volume drained. Accidental dislodgement is an emergency: clamp the catheter, cover the site with a sterile dressing and notify neurosurgery.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the ICP that climbs',
      body: ['A 28-year-old with severe TBI, intubated, with an ICP monitor. In flight, ICP rises from 16 to 28 mmHg; MAP 78; EtCO₂ 42; temperature 38.4 °C; he is coughing on the tube.'],
      example: { case: 'Work the bundle.', steps: [
        'CPP = 78 − 28 = 50 — too low.',
        'Check positioning: head up 30°, midline, collar not compressing the neck.',
        'Deepen sedation and analgesia; treat the cough (consider paralysis).',
        'Adjust ventilation to EtCO₂ 35–38; treat fever.',
        'Hypertonic saline 3 % 250 mL; support MAP with a vasopressor to keep CPP 60–70.',
      ] },
    },
  ],
  keyPoints: [
    'CPP = MAP − ICP; target CPP 60–70, ICP < 22.',
    'Avoid hypotension and hypoxia — even one episode worsens outcome.',
    'Head up 30°, midline, nothing compressing the neck veins.',
    'Normocapnia; hyperventilation only briefly for herniation.',
    'Clamp the EVD for moves; re-level at the tragus and reopen per plan.',
  ],
  pearls: ['Hypertonic saline is preferred over mannitol in hypotension.', 'Fresh blood in EVD output suggests rebleeding.'],
  pitfalls: ['Routine hyperventilation.', 'Leaving the EVD open during loading.'],
  live: [{ id: 'neuro-icp', label: 'ICP and cerebral perfusion' }, { id: 'moa-hypertonic', label: 'Hypertonic saline: mechanism' }, { id: 'moa-mannitol', label: 'Mannitol: mechanism' }],
  questions: [
    { q: 'CPP equals:', options: ['MAP + ICP', 'MAP − ICP', 'SBP − ICP', 'ICP − CVP'], answer: 1, why: 'Driving pressure for brain flow.' },
    { q: 'MAP 85, ICP 25. CPP is:', options: ['110', '60', '50', '25'], answer: 1, why: '85 − 25 = 60.' },
    { q: 'ICP treatment threshold in TBI guidelines:', options: ['> 10 mmHg', '> 22 mmHg', '> 40 mmHg', '> 5 mmHg'], answer: 1, why: 'Brain Trauma Foundation.' },
    { q: 'The Monro–Kellie doctrine states:', options: ['The skull expands with pressure', 'Brain, blood and CSF volumes must balance in a fixed space', 'CSF is not compressible', 'ICP is unrelated to volume'], answer: 1, why: 'Compensation then decompensation.' },
    { q: 'Head-of-bed elevation for raised ICP:', options: ['Flat', '30°', '90°', 'Trendelenburg'], answer: 1, why: 'Improves venous drainage.' },
    { q: 'Prophylactic hyperventilation in TBI:', options: ['Recommended', 'Avoided — causes cerebral ischaemia', 'Required in all', 'Targets PaCO₂ 20'], answer: 1, why: 'Vasoconstriction.' },
    { q: 'Osmotherapy preferred in a hypotensive TBI patient:', options: ['Mannitol', 'Hypertonic saline', 'Furosemide', 'D5W'], answer: 1, why: 'Expands volume.' },
    { q: 'Mannitol dose:', options: ['0.5–1 g/kg', '5 g/kg', '10 mg/kg', '50 g/kg'], answer: 0, why: 'Osmotic diuretic.' },
    { q: 'EVD zero reference point:', options: ['Phlebostatic axis', 'Tragus of the ear', 'Umbilicus', 'Sternal notch'], answer: 1, why: 'Approximates foramen of Monro.' },
    { q: 'During loading and take-off, an EVD is usually:', options: ['Left open', 'Clamped per policy', 'Removed', 'Raised high'], answer: 1, why: 'Prevent over-drainage.' },
    { q: 'Over-drainage from an EVD can cause:', options: ['Raised ICP', 'Ventricular collapse and subdural haemorrhage', 'Hyperkalaemia', 'Hypertension'], answer: 1, why: 'Brain pulls away from dura.' },
    { q: 'Fever in brain injury should be:', options: ['Ignored', 'Treated to maintain normothermia', 'Encouraged', 'Treated with hyperthermia'], answer: 1, why: 'Raises metabolic demand and ICP.' },
    { q: 'A cervical collar in TBI can raise ICP by:', options: ['Compressing jugular veins', 'Cooling the neck', 'Causing hypoxia', 'Nothing'], answer: 0, why: 'Impaired venous drainage.' },
    { q: 'PaCO₂ target in TBI without herniation:', options: ['25–30', '35–45 mmHg', '50–60', '< 25'], answer: 1, why: 'Normocapnia.' },
    { q: 'An accidentally dislodged EVD should be:', options: ['Pushed back in', 'Clamped, covered sterilely, neurosurgery notified', 'Ignored', 'Flushed'], answer: 1, why: 'Prevent infection and CSF leak.' },
  ],
  sources: [
    { title: 'Brain Trauma Foundation: Guidelines for the management of severe TBI (4th ed.)', url: 'https://braintrauma.org/coma/guidelines' },
    { title: 'StatPearls: External ventricular drain', url: 'https://www.ncbi.nlm.nih.gov/books/?term=External+ventricular+drain+StatPearls' },
  ],
};

export const BRAIN_BLEED: FpcLesson = {
  id: 'fpc-brain-bleed', domain: 'neuro', ref: 'V.6',
  title: 'Cerebral haemorrhage: ICH and subarachnoid haemorrhage',
  summary: 'Spontaneous intracerebral and subarachnoid haemorrhage: recognition, blood pressure control, anticoagulant reversal, hydrocephalus, vasospasm and rebleeding — and what matters during transfer.',
  objectives: [
    'Distinguish ICH from SAH by presentation and imaging.',
    'Apply blood pressure targets and anticoagulant reversal.',
    'Recognise rebleeding, hydrocephalus and vasospasm.',
  ],
  sections: [
    {
      id: 'ich', title: 'Intracerebral haemorrhage', core: true,
      body: [
        'Spontaneous ICH is bleeding into the brain tissue, most often from hypertension (deep structures — basal ganglia, thalamus, pons, cerebellum) or amyloid angiopathy (lobar bleeds in older patients). It presents like a stroke but more often with headache, vomiting, a reduced level of consciousness and severe hypertension, and it can only be distinguished from ischaemic stroke by imaging.',
        'Haematomas expand in a third of patients in the first hours, and expansion predicts death and disability. Prevention focuses on blood pressure and coagulation. Current guidance favours lowering systolic pressure to about 140 mmHg (avoiding drops below about 130 and avoiding large, abrupt falls) in patients presenting with SBP 150–220, using labetalol, nicardipine or clevidipine.',
        'Reverse anticoagulants immediately: warfarin with 4-factor PCC and IV vitamin K; dabigatran with idarucizumab; factor Xa inhibitors with andexanet alfa or PCC per protocol; heparin with protamine. Platelet transfusion for antiplatelet users is not recommended unless they need surgery. Cerebellar haemorrhages over 3 cm or causing brainstem compression or hydrocephalus need urgent neurosurgery.',
      ],
    },
    {
      id: 'sah', title: 'Subarachnoid haemorrhage', core: true,
      body: [
        'Non-traumatic SAH is usually from a ruptured aneurysm. The classic presentation is a sudden, severe "thunderclap" headache reaching maximal intensity within a minute, often with vomiting, neck stiffness, photophobia, collapse or seizure. A smaller "sentinel" bleed may precede a major rupture. CT within 6 hours of onset is highly sensitive; later, lumbar puncture or CTA is needed.',
        'Severity is graded by Hunt and Hess (I, mild headache, to V, deep coma) or the WFNS scale based on GCS. Grade correlates with outcome. The early danger is rebleeding — highest in the first 24 hours and frequently fatal — until the aneurysm is secured by coiling or clipping. Control systolic pressure below about 160 mmHg (many centres use below 140), treat pain and nausea, and give antifibrinolytics only per neurosurgical direction.',
        'Hydrocephalus occurs early from blood blocking CSF flow: a falling GCS needs an urgent CT and often an EVD. Delayed cerebral ischaemia from vasospasm occurs at days 3–14; nimodipine 60 mg orally (or by tube) every 4 hours is given to all patients to improve outcome, avoiding hypotension. Hyponatraemia (from cerebral salt wasting or SIADH) is common — do not fluid restrict in SAH.',
      ],
      table: {
        caption: 'ICH vs SAH',
        head: ['', 'ICH', 'SAH'],
        rows: [['Cause', 'Hypertension, amyloid, anticoagulation', 'Aneurysm (non-traumatic)'], ['Onset', 'Focal deficit, evolving', 'Thunderclap headache'], ['BP target', 'SBP ~140 (avoid < 130)', 'SBP < 160 (often < 140) until secured'], ['Early threat', 'Haematoma expansion', 'Rebleeding, hydrocephalus'], ['Later threat', 'Oedema', 'Vasospasm days 3–14 (nimodipine)']],
      },
    },
    {
      id: 'transport', title: 'In the aircraft', core: true,
      body: [
        'Haemorrhage patients deteriorate in transport from expansion, rebleeding, hydrocephalus or seizures. Secure the airway before departure if the GCS is falling, airway reflexes are poor, or the patient is vomiting with a reduced conscious level. Use a smooth induction that blunts the hypertensive response to laryngoscopy — a sudden surge can rerupture an aneurysm.',
        'Run an arterial line where possible, with an infusion to hold the target pressure steady; repeated labetalol boluses cause swings. Keep the patient calm, pain-free and nauseated-free; straining and coughing raise ICP and blood pressure. Neurological checks every 15 minutes; any decline is reported immediately and prompts the herniation measures from the neuroprotection lesson.',
      ],
    },
    {
      id: 'case', title: 'Transport case: the thunderclap',
      body: ['A 47-year-old collapsed at the gym after a sudden severe headache. GCS 13 (E3 V4 M6), neck stiffness, BP 192/108, HR 64. CT shows diffuse subarachnoid blood in the basal cisterns and mildly enlarged ventricles. She takes no anticoagulants.'],
      example: { case: 'Priorities for transfer to a neurovascular centre.', steps: [
        'Aneurysmal SAH, Hunt and Hess about III; early hydrocephalus on CT.',
        'BP below 160 (often below 140) with a nicardipine or labetalol infusion; analgesia and antiemetic.',
        'Neuro checks every 15 minutes: a falling GCS suggests worsening hydrocephalus or rebleeding — the centre may need to place an EVD on arrival.',
        'Nimodipine per receiving protocol; avoid hypotension; no fluid restriction.',
      ] },
    },
  ],
  keyPoints: [
    'ICH vs ischaemic stroke needs imaging; ICH expands early.',
    'ICH: SBP about 140 (avoid < 130), reverse anticoagulants immediately.',
    'SAH: thunderclap headache; rebleeding risk highest in first 24 h.',
    'SAH: SBP < 160 until secured; nimodipine 60 mg q4h for vasospasm.',
    'Falling GCS: hydrocephalus or rebleeding — urgent CT/EVD.',
  ],
  pearls: ['Blunt the laryngoscopy pressor response in SAH.', 'Don\'t fluid restrict hyponatraemia in SAH.'],
  pitfalls: ['Big swings in BP from repeated boluses.', 'Platelet transfusion for antiplatelet ICH without surgery.'],
  live: [{ id: 'neuro-ich', label: 'Intracerebral haemorrhage' }, { id: 'neuro-sah', label: 'Subarachnoid haemorrhage' }, { id: 'moa-nimodipine', label: 'Nimodipine: mechanism' }],
  questions: [
    { q: 'ICH can be distinguished from ischaemic stroke by:', options: ['Clinical exam alone', 'Imaging', 'BP level', 'Glucose'], answer: 1, why: 'CT is required.' },
    { q: 'Haematoma expansion in ICH occurs in about:', options: ['1 %', 'One-third, in the first hours', 'All patients', 'Only after 1 week'], answer: 1, why: 'Predicts poor outcome.' },
    { q: 'SBP target in spontaneous ICH (current guidance):', options: ['< 100', 'About 140 (avoid < 130)', '< 220', 'No target'], answer: 1, why: 'Limits expansion.' },
    { q: 'Warfarin-associated ICH reversal:', options: ['Protamine', '4-factor PCC + IV vitamin K', 'Platelets', 'Andexanet'], answer: 1, why: 'Rapid factor replacement.' },
    { q: 'Platelet transfusion for an antiplatelet user with ICH not undergoing surgery:', options: ['Recommended', 'Not recommended', 'Mandatory', 'Only if aspirin'], answer: 1, why: 'PATCH trial: harm.' },
    { q: 'Classic SAH headache:', options: ['Gradual over days', 'Thunderclap — maximal within a minute', 'Positional', 'Morning only'], answer: 1, why: 'Sudden onset.' },
    { q: 'Rebleeding after aneurysmal SAH is highest:', options: ['After 2 weeks', 'In the first 24 hours', 'At 1 year', 'Never'], answer: 1, why: 'Until aneurysm secured.' },
    { q: 'Nimodipine in SAH:', options: ['Lowers ICP', 'Improves outcome from delayed ischaemia', 'Reverses anticoagulation', 'Treats seizures'], answer: 1, why: 'Given to all SAH patients.' },
    { q: 'Nimodipine dose:', options: ['60 mg every 4 hours enterally', '10 mg IV bolus', '1 g daily', '5 mg/h IV only'], answer: 0, why: 'Standard regimen.' },
    { q: 'Vasospasm after SAH typically occurs:', options: ['Within 1 hour', 'Days 3–14', 'At 6 months', 'Only after surgery'], answer: 1, why: 'Delayed cerebral ischaemia.' },
    { q: 'Early hydrocephalus in SAH presents with:', options: ['Improving GCS', 'Falling GCS', 'Hypotension', 'Fever'], answer: 1, why: 'CSF obstruction.' },
    { q: 'Hyponatraemia in SAH should NOT be treated by:', options: ['Fluid restriction', 'Isotonic or hypertonic saline', 'Fludrocortisone', 'Monitoring'], answer: 0, why: 'Risk of vasospasm from hypovolaemia.' },
    { q: 'Cerebellar haemorrhage > 3 cm with brainstem compression needs:', options: ['Observation', 'Urgent neurosurgery', 'Thrombolysis', 'Anticoagulation'], answer: 1, why: 'Posterior fossa decompression.' },
    { q: 'Hunt and Hess grade V corresponds to:', options: ['Mild headache', 'Deep coma', 'Neck stiffness only', 'Drowsiness'], answer: 1, why: 'Most severe grade.' },
    { q: 'Why blunt the pressor response to laryngoscopy in SAH?', options: ['Prevent bradycardia', 'Reduce rebleeding risk', 'Improve oxygenation', 'Shorten paralysis'], answer: 1, why: 'Hypertensive surge can rerupture.' },
  ],
  sources: [
    { title: 'AHA/ASA Guideline for management of spontaneous ICH (2022)', url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000407' },
    { title: 'AHA/ASA Guideline for management of aneurysmal SAH (2023)', url: 'https://www.ahajournals.org/doi/10.1161/STR.0000000000000436' },
  ],
};
