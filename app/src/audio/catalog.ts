import type { AudioEpisode, MentalRep } from './types';

const rvTranscript = `You’re at the bedside. The blood pressure has fallen after intubation. Before you reach for fluid, build the physiology in your head. Picture the right ventricle pushing against the pulmonary circulation. Positive pressure has changed venous return, pulmonary vascular resistance, and the pressure surrounding the heart. Your job is not to chase a number. Your job is to decide what changed, predict what your intervention should do, and then watch whether the patient proves your model right.`;

export const EPISODES: AudioEpisode[] = [
  {
    id: 'rounds-rv-intubation', title: 'Why intubation can crash the failing RV',
    subtitle: 'Build the hemodynamic model before you chase the blood pressure.',
    format: 'rounds', level: 4, minutes: 12, domain: 'cardiac',
    concepts: ['rv-failure', 'pvr', 'ppv-hemodynamics', 'ventricular-interdependence', 'uncertainty'],
    status: 'voice-ready',
    chapters: [
      { id: 'scene', title: 'The pressure falls', seconds: 90, conceptIds: ['rv-failure'], prompt: 'Name three mechanisms that could reduce forward flow after intubation.' },
      { id: 'preload', title: 'Venous return changes', seconds: 150, conceptIds: ['venous-return', 'ppv-hemodynamics'] },
      { id: 'afterload', title: 'The RV sees a different afterload', seconds: 180, conceptIds: ['pvr', 'rv-failure'] },
      { id: 'septum', title: 'The LV becomes part of the problem', seconds: 150, conceptIds: ['ventricular-interdependence'] },
      { id: 'test', title: 'Make a prediction', seconds: 150, conceptIds: ['uncertainty'], prompt: 'What finding would make you abandon your current model?' },
    ],
    voice: {
      tier: 'premium-human', voice: 'Natural clinical narrator prototype', locale: 'en-US',
      transcript: rvTranscript, reviewed: false,
      previewSrc: 'https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/000b3aaa-27e2-4489-94db-af1f3e5636e9.mp3',
    },
    outcomes: [
      'Explain the distinct effects of positive pressure on venous return, RV afterload and LV transmural pressure.',
      'Describe why RV distension can reduce LV filling through ventricular interdependence.',
      'State what response you expect from an intervention and what finding would falsify your model.',
    ],
  },
  {
    id: 'dose-normal-spo2', title: 'A normal SpO₂ can still hide terrible oxygen delivery',
    subtitle: 'Five-minute Daily Dose: saturation is only one term in the oxygen-delivery equation.',
    format: 'daily-dose', level: 3, minutes: 6, domain: 'hemodynamics',
    concepts: ['oxygen-delivery', 'oxygen-extraction'],
    chapters: [{ id: 'core', title: 'Saturation is not delivery', seconds: 360, conceptIds: ['oxygen-delivery', 'oxygen-extraction'] }],
    status: 'scripted', outcomes: ['Explain how hemoglobin and cardiac output can make oxygen delivery inadequate despite a normal saturation.'],
  },
  {
    id: 'literacy-transmural', title: 'ICU Literacy: transmural pressure',
    subtitle: 'The pressure that actually distends a chamber is not always the number on the monitor.',
    format: 'icu-literacy', level: 4, minutes: 9, domain: 'foundations',
    concepts: ['preload', 'ppv-hemodynamics'],
    chapters: [{ id: 'core', title: 'Inside pressure minus outside pressure', seconds: 540, conceptIds: ['preload', 'ppv-hemodynamics'] }],
    status: 'scripted', outcomes: ['Use transmural pressure to explain why measured filling pressures change with intrathoracic pressure.'],
  },
  {
    id: 'deep-shock', title: 'Shock is a flow problem before it is a blood-pressure problem',
    subtitle: 'Phenotype the circulation: flow, tone, congestion, oxygen delivery and organ response.',
    format: 'deep-dive', level: 4, minutes: 38, domain: 'hemodynamics',
    concepts: ['shock', 'oxygen-delivery', 'oxygen-extraction', 'venous-return', 'lactate'],
    chapters: [
      { id: 'frame', title: 'Stop naming shock by one number', seconds: 420, conceptIds: ['shock'] },
      { id: 'flow', title: 'Flow and venous return', seconds: 600, conceptIds: ['venous-return'] },
      { id: 'do2', title: 'Delivery and extraction', seconds: 600, conceptIds: ['oxygen-delivery', 'oxygen-extraction'] },
      { id: 'lactate', title: 'Lactate without superstition', seconds: 420, conceptIds: ['lactate'] },
      { id: 'integration', title: 'Mixed shock', seconds: 240, conceptIds: ['shock', 'uncertainty'] },
    ],
    status: 'planned', outcomes: ['Phenotype mixed shock and choose a testable physiologic intervention rather than reflexively treating a pressure.'],
  },
  {
    id: 'case-ards-rv', title: 'Audio Case: ARDS + RV failure',
    subtitle: 'An unfolding multisystem case with no clean single-organ answer.',
    format: 'audio-case', level: 5, minutes: 22, domain: 'multisystem',
    concepts: ['ards', 'rv-failure', 'pvr', 'peep', 'multisystem-tradeoffs', 'uncertainty'],
    chapters: [
      { id: 'arrival', title: 'The handoff', seconds: 240, conceptIds: ['ards', 'rv-failure'], prompt: 'Before more data arrives, what are your competing priorities?' },
      { id: 'vent', title: 'The vent becomes part of the circulation', seconds: 360, conceptIds: ['peep', 'pvr'] },
      { id: 'echo', title: 'The RV is telling you something', seconds: 360, conceptIds: ['rv-failure', 'ventricular-interdependence'] },
      { id: 'choice', title: 'There is no free intervention', seconds: 360, conceptIds: ['multisystem-tradeoffs'], prompt: 'Choose your next move and name the organ you could worsen.' },
    ],
    status: 'planned', outcomes: ['Balance lung recruitment and RV load while explicitly stating uncertainty and tradeoffs.'],
  },
];

export const MENTAL_REPS: MentalRep[] = [
  {
    id: 'rep-push-dose-pressor', title: 'Push-dose pressor', subtitle: 'Medication safety first: prepare, verify, label, give, observe, reassess.',
    level: 3, domain: 'procedures', minutes: 8, concepts: ['push-dose-pressor', 'medication-safety', 'shock'],
    disclaimer: 'Mental rehearsal only. Use your service protocol, pharmacy-standard concentration, medical direction and local medication-safety process.',
    beats: [
      { id: 'arrival', phase: 'arrival', title: 'See the patient', narration: 'You are at the bedside. The pressure is falling and you have decided a short bridge is needed while definitive support is prepared. Before touching a vial, state the physiologic problem you are treating.', pauseSeconds: 5, prompt: 'What response do you expect, and what adverse response would make you stop?' },
      { id: 'orient', phase: 'orientation', title: 'Slow the medication step down', narration: 'High-risk medication errors happen when urgency outruns verification. Separate the patient decision from the preparation task. Read the source concentration. Read your protocol. Do not build the final concentration from memory alone.', danger: true },
      { id: 'equip', phase: 'equipment', title: 'Build a clean workspace', narration: 'Picture the syringe, label, medication source and reference in one uncluttered field. Keep look-alike syringes out of that field. Prepare only one high-risk drug at a time.', visual: 'medication-prep' },
      { id: 'verify', phase: 'decision', title: 'Independent verification', narration: 'Before administration, verify drug, concentration, dose, route, patient and indication. Say them out loud. If the concentration does not match the standard you expected, stop and reconcile it.', pauseSeconds: 4, prompt: 'Can you state the six checks without looking?' },
      { id: 'give', phase: 'sequence', title: 'Administer and watch physiology', narration: 'Give according to local protocol through a verified line. Your attention immediately returns to the patient and monitor. Watch rhythm, pressure, perfusion and the clinical endpoint you named before the dose.', visual: 'monitor-response' },
      { id: 'comp', phase: 'complication', title: 'The response is information', narration: 'If the response is excessive, absent or physiologically inconsistent, do not automatically repeat the same action. Recheck the line, concentration, rhythm and your diagnosis.', danger: true, prompt: 'What finding would tell you your original hemodynamic model may be wrong?' },
      { id: 'debrief', phase: 'debrief', title: 'Close the loop', narration: 'The mental anchor is simple: indication, standardized concentration, verify, label, administer, reassess, and transition to definitive support. The procedure is not drawing up a syringe. The procedure is safe physiology-guided medication use.' },
    ],
  },
  {
    id: 'rep-blood', title: 'Start blood safely', subtitle: 'From order and product verification to the first minutes of transfusion and reaction recognition.',
    level: 3, domain: 'procedures', minutes: 10, concepts: ['transfusion', 'oxygen-delivery'],
    disclaimer: 'Mental rehearsal only. Product verification, tubing, warming, rates and reaction protocols vary; follow local blood-bank policy and medical direction.',
    beats: [
      { id: 'arrival', phase: 'arrival', title: 'Why blood?', narration: 'Before you spike anything, name what you are treating: oxygen-carrying capacity, hemorrhagic shock, a component deficiency, or a specific protocol target.', prompt: 'What endpoint will tell you the transfusion is helping?' },
      { id: 'verify', phase: 'orientation', title: 'Identity is the critical step', narration: 'Pause over the product and the patient. Perform the required patient, product, compatibility and expiration checks exactly as your system requires. This is a deliberate interruption, not paperwork.' , danger: true},
      { id: 'setup', phase: 'equipment', title: 'Build the circuit', narration: 'Picture the approved blood tubing and filter, compatible carrier fluid if required by policy, warming equipment when indicated, patent vascular access, and monitoring already running before the product starts.', visual: 'blood-circuit' },
      { id: 'start', phase: 'sequence', title: 'The first minutes matter', narration: 'Begin according to policy and stay clinically present. Reassess the patient, not only the pump. A reaction can begin with subtle symptoms before the monitor changes.', visual: 'monitor-response' },
      { id: 'reaction', phase: 'complication', title: 'If the patient changes', narration: 'New fever, chills, dyspnea, pain, hypotension, rash or a sense that something is wrong demands immediate reassessment and the local transfusion-reaction process. Do not explain away a new change simply because the patient was already sick.', danger: true },
      { id: 'debrief', phase: 'debrief', title: 'Mental anchor', narration: 'Indication. Identity. Product. Circuit. Patient. Early reassessment. Reaction recognition. Documentation and response. Every time.' },
    ],
  },
  {
    id: 'rep-art-line', title: 'Arterial line', subtitle: 'Rehearse the whole system: patient, artery, catheter, transducer, waveform and troubleshooting.',
    level: 3, domain: 'procedures', minutes: 14, concepts: ['arterial-line', 'waveform-damping'],
    disclaimer: 'Mental rehearsal only. Insertion requires supervised procedural training, sterile technique and local policy.',
    beats: [
      { id: 'arrival', phase: 'arrival', title: 'Start with the purpose', narration: 'You need beat-to-beat pressure and arterial sampling. Picture the patient positioned, monitoring visible, rescue equipment available and the entire pressure system prepared before puncture.' },
      { id: 'anatomy', phase: 'orientation', title: 'See the vessel before the needle', narration: 'Visualize the artery in cross-section and long axis. If ultrasound is used, keep the actual needle tip in view rather than following a bright shaft and assuming the tip is there.', visual: 'artery-ultrasound' },
      { id: 'system', phase: 'equipment', title: 'The catheter is only half the procedure', narration: 'Mentally trace catheter to tubing, flush system, pressure source, transducer, cable and monitor. An excellent puncture connected to a poor monitoring system gives poor data.', visual: 'transducer-system' },
      { id: 'level', phase: 'confirmation', title: 'Level and zero', narration: 'Level the transducer to the reference point used by your unit, zero to atmosphere, then restore the system to the patient. Understand what happens to displayed pressure when the transducer is too high or too low.', prompt: 'Transducer too low: what happens to the displayed pressure?' },
      { id: 'wave', phase: 'confirmation', title: 'Interrogate the waveform', narration: 'Do not accept a number without its waveform. Look at upstroke, systolic peak, dicrotic notch, diastolic runoff and respiratory variation in context.', visual: 'arterial-waveform' },
      { id: 'square', phase: 'decision', title: 'Test the system', narration: 'When the trace looks suspicious, use the dynamic response test and inspect the circuit. Think clot, air, compliant tubing, loose connections, catheter position and excessive resonance before blaming the patient.', visual: 'square-wave-test' },
      { id: 'debrief', phase: 'debrief', title: 'Mental anchor', narration: 'Patient, artery, catheter, level, zero, waveform, dynamic response. The arterial line is a measurement system, not simply a line in an artery.' },
    ],
  },
  {
    id: 'rep-efast', title: 'eFAST mental sweep', subtitle: 'Probe position, image orientation, target spaces and the discipline of a repeatable exam.',
    level: 3, domain: 'procedures', minutes: 12, concepts: ['efast'],
    disclaimer: 'Mental rehearsal only. Diagnostic ultrasound requires supervised image-acquisition training and must be integrated with the clinical picture.',
    beats: [
      { id: 'arrival', phase: 'arrival', title: 'Set the question', narration: 'You are not doing ultrasound because a probe is available. State the question: is there blood where it should not be, pericardial fluid, or pleural evidence of pneumothorax or hemothorax?', visual: 'efast-map' },
      { id: 'orientation', phase: 'orientation', title: 'Anchor orientation every time', narration: 'Before interpreting pathology, prove to yourself which side of the screen is cephalad, which anatomy you are seeing, and whether your probe marker matches the convention you are using.' },
      { id: 'ruq', phase: 'sequence', title: 'RUQ', narration: 'Sweep through the hepatorenal interface, diaphragm and inferior liver tip. Do not take one frozen view and call the window negative. Search the dependent spaces.', visual: 'efast-ruq' },
      { id: 'luq', phase: 'sequence', title: 'LUQ', narration: 'Find spleen, kidney and diaphragm. The geometry is less forgiving. Sweep deliberately rather than chasing the textbook picture.', visual: 'efast-luq' },
      { id: 'pelvis', phase: 'sequence', title: 'Pelvis', narration: 'Use the bladder as your acoustic window and examine the dependent space around it in the appropriate planes.', visual: 'efast-pelvis' },
      { id: 'cardiac', phase: 'sequence', title: 'Pericardium', narration: 'Acquire the best cardiac window the patient gives you and identify the pericardial space before deciding fluid is present. Fat, pleural fluid and artifact can mislead.', visual: 'efast-cardiac' },
      { id: 'lung', phase: 'sequence', title: 'Pleura', narration: 'Interrogate the pleural line bilaterally. Lung sliding is a dynamic sign. When absent, use the rest of the ultrasound and clinical picture rather than treating one sign as the diagnosis.', visual: 'efast-lung' },
      { id: 'repeat', phase: 'debrief', title: 'A negative exam is time-stamped', narration: 'Trauma evolves. The mental anchor is orientation, systematic windows, sweeping rather than snapshotting, and repeat examination when physiology changes.' },
    ],
  },
  {
    id: 'rep-chest-tube', title: 'Chest tube / pleural drain', subtitle: 'Anatomy, setup, safe sequence, system behavior and early failure recognition.',
    level: 3, domain: 'procedures', minutes: 15, concepts: ['chest-tube'],
    disclaimer: 'Mental rehearsal only. Tube thoracostomy requires supervised hands-on training, credentialing, sterile technique and local procedural policy.',
    beats: [
      { id: 'arrival', phase: 'arrival', title: 'Indication before incision', narration: 'Picture the patient and state what you are treating. Tension physiology, hemothorax and ongoing pleural air are related problems but they shape urgency, equipment and aftercare differently.' },
      { id: 'anatomy', phase: 'orientation', title: 'Build the chest wall in your head', narration: 'See skin, subcutaneous tissue, intercostal muscles, rib, neurovascular bundle and parietal pleura. Orient to the safe procedural zone taught by your credentialing program and local policy.', visual: 'chest-wall-anatomy' },
      { id: 'setup', phase: 'equipment', title: 'Prepare the whole system', narration: 'The procedure includes the drain system, connections, dressing, suction or water seal plan, monitoring and analgesia strategy. Do not discover missing pieces after entering the pleural space.', visual: 'drain-system' },
      { id: 'sequence', phase: 'sequence', title: 'Controlled entry', narration: 'Mentally rehearse deliberate tissue handling and confirmation that the pleural space has actually been entered before advancing the drain. Maintain awareness of depth and direction rather than using force.', danger: true },
      { id: 'connect', phase: 'confirmation', title: 'Connect and ask what changed', narration: 'Once connected, reassess patient physiology and the drain system together. Improvement should make physiologic sense. If nothing changes, question position, patency, diagnosis and the system.', visual: 'drain-water-seal' },
      { id: 'failure', phase: 'complication', title: 'A drain can fail after it worked', narration: 'Kinked tubing, disconnection, migration, clot, dependent loops or a new air leak can turn a functioning drain into a problem. Trace from patient outward whenever physiology worsens.', danger: true },
      { id: 'debrief', phase: 'debrief', title: 'Mental anchor', narration: 'Indication, anatomy, complete setup, controlled pleural entry, connection, patient response, system response, and continuous troubleshooting.' },
    ],
  },
];

export const EPISODE_BY_ID = Object.fromEntries(EPISODES.map((e) => [e.id, e]));
export const REP_BY_ID = Object.fromEntries(MENTAL_REPS.map((r) => [r.id, r]));
