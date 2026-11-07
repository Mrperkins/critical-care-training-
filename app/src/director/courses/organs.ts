/** Neuro, cardiac and abdominal courses. */
import type { CourseMeta } from '../course';
const q = (question: string, options: string[], answer: number, why: string) => ({ q: question, options, answer, why });

export const ORGAN_COURSES: Record<string, CourseMeta> = {
  'neuro-time-is-brain': {
    objectives: ['Explain core and penumbra in a large-vessel occlusion.', 'Explain why blood pressure matters before reperfusion.', 'Connect time to reperfusion with final infarct size.'],
    essentials: ['tib-2', 'tib-3', 'tib-5', 'tib-7'],
    keyPoints: [
      'An M1 clot sits beyond the Circle of Willis, so the ring cannot bypass it.',
      'Core dies within minutes; the penumbra survives on collaterals for a time.',
      'Collateral flow is pressure-passive: hypotension grows the core.',
      'Reperfusion saves whatever is still penumbra. Final infarct size is set by collaterals, pressure and time.',
    ],
    pitfalls: ['Lowering blood pressure aggressively before reperfusion in ischaemic stroke.'],
    bedside: 'In suspected large-vessel stroke, avoid hypotension and move fast to imaging and thrombectomy.',
    selfCheck: [
      q('Why does a fall in MAP enlarge the infarct in acute ischaemic stroke?', ['It causes bleeding', 'Collateral flow follows pressure in ischaemic tissue', 'It raises ICP', 'It lowers CO₂'], 1, 'Ischaemic vessels lose autoregulation.'),
    ],
  },
  'neuro-time-machine': {
    objectives: ['Follow a stroke from onset to reperfusion.', 'Know what each scan answers.'],
    essentials: ['tm-3', 'tm-4', 'tm-5', 'tm-7'],
    keyPoints: [
      'Non-contrast CT excludes haemorrhage first.',
      'CT angiography shows the occlusion — the thrombectomy target.',
      'CT perfusion separates core from salvageable tissue: a mismatch means brain to save.',
      'The final infarct is the core at the moment of reperfusion; every hour costs brain.',
    ],
    bedside: 'Count minutes at every step: scene, door, scan, groin.',
    selfCheck: [
      q('Which scan identifies salvageable tissue?', ['Non-contrast CT', 'CT angiography', 'CT perfusion', 'Chest X-ray'], 2, 'Perfusion mapping separates core from delayed tissue.'),
    ],
  },
  'neuro-lvo': {
    objectives: ['Recognise cortical signs of a large-vessel occlusion.', 'Explain fast and slow progressors.', 'Weigh transport time against capability.'],
    essentials: ['lvo-1', 'lvo-2', 'lvo-4', 'lvo-5'],
    keyPoints: [
      'Left MCA: aphasia, right face-and-arm weakness, gaze toward the left (the lesion).',
      'Right MCA: left weakness with neglect.',
      'Poor collaterals: core grows fast. Good collaterals: penumbra lasts hours.',
      'Detours to a centre without thrombectomy usually cost an hour of brain.',
    ],
    bedside: 'Cortical signs plus a dense deficit: think large vessel and route accordingly.',
    selfCheck: [
      q('Aphasia, right arm weakness and eyes deviated to the left. Likely occlusion?', ['Right MCA', 'Left MCA', 'Basilar', 'Lacunar'], 1, 'The eyes look toward the lesion; aphasia localises to the dominant hemisphere.'),
    ],
  },
  'neuro-ich': {
    objectives: ['Recognise ICH on CT and estimate volume.', 'Limit haematoma growth.', 'Recognise mass effect.'],
    essentials: ['ich-1', 'ich-3', 'ich-4', 'ich-5'],
    keyPoints: [
      'Fresh blood is bright on non-contrast CT; every stroke is scanned before thrombolysis.',
      'Volume ≈ A × B × C ÷ 2 (cm). Around 30 mL predicts a worse outcome.',
      'Haematomas grow in the first hours, more so at high pressure.',
      'Early smooth BP control (systolic about 140) and anticoagulant reversal are the first-hour priorities.',
      'Falling consciousness, a new blown pupil or vomiting means mass effect is winning.',
    ],
    pitfalls: ['Delaying reversal of anticoagulation while waiting for other tests.'],
    bedside: 'ICH: lower the systolic smoothly and reverse anticoagulants in the first hour.',
    selfCheck: [
      q('Haematoma 4 × 3 cm on 5 slices of 1 cm. Volume?', ['15 mL', '30 mL', '60 mL', '12 mL'], 1, '4 × 3 × 5 ÷ 2 = 30 mL.'),
    ],
  },
  'neuro-sah': {
    objectives: ['Recognise SAH on CT.', 'Know where aneurysms arise.', 'Anticipate and manage vasospasm.'],
    essentials: ['sah-1', 'sah-3', 'sah-4'],
    keyPoints: [
      'Sudden worst-ever headache; blood in the basal cisterns on CT.',
      'Aneurysms sit at branch points of the circle; securing one early prevents re-bleeding.',
      'Vasospasm peaks between days 3 and 14 with delayed ischaemia.',
      'Euvolaemia, avoid hypotension, nimodipine, and close neuro checks.',
    ],
    bedside: 'Days 3–14 after SAH: a new deficit is vasospasm until proven otherwise.',
    selfCheck: [
      q('Day 6 after SAH, a new arm weakness appears. Most likely cause?', ['Re-bleed', 'Vasospasm with delayed ischaemia', 'Seizure', 'Hyponatraemia only'], 1, 'Classic timing for vasospasm.'),
    ],
  },
  'neuro-icp': {
    objectives: ['Explain the Monro–Kellie doctrine and the pressure–volume curve.', 'Calculate CPP and recognise herniation.', 'Manage ICP and run an EVD safely.'],
    essentials: ['icp-1', 'icp-3', 'icp-4', 'icp-5', 'icp-7', 'icp-10'],
    keyPoints: [
      'Skull volume is fixed: new volume must displace CSF or blood, until the buffers run out.',
      'Past the knee of the curve, each millilitre raises ICP steeply.',
      'CPP = MAP − ICP; hypotension causes ischaemia without any blocked artery.',
      'Uncal herniation: ipsilateral blown pupil, contralateral weakness, falling consciousness. Cushing’s triad is late.',
      'Head up 30°, hyperosmolar therapy, brief hyperventilation as a bridge, then remove the volume.',
      'An EVD is zeroed at the tragus; re-level whenever the bed moves, and never leave it clamped by accident.',
    ],
    pitfalls: ['Prolonged hyperventilation.', 'Raising the bed without re-levelling the EVD.'],
    bedside: 'Check EVD level and clamp status every time the patient or bed is moved.',
    selfCheck: [
      q('MAP 70, ICP 30. CPP?', ['100', '40', '70', '30'], 1, '70 − 30 = 40 mmHg — too low.'),
      q('Head of bed raised 15 cm without moving the EVD chamber. Effect?', ['Underdrainage', 'Overdrainage', 'No effect', 'ICP reads high'], 1, 'The drain is now effectively lower relative to the head.'),
    ],
  },
  'heart-vsd': {
    objectives: ['Relate VSD size to murmur and shunt.', 'Explain left-heart volume loading.', 'Explain why Eisenmenger syndrome closes the window for repair.'],
    essentials: ['vsd-3', 'vsd-4', 'vsd-6', 'vsd-8'],
    keyPoints: [
      'Small VSD: high gradient, fast jet, loud murmur, small shunt.',
      'Large VSD: pressures equalise, softer murmur, Qp:Qs above 2.',
      'Shunted blood returns to the left atrium and ventricle: a VSD volume-loads the left heart.',
      'Years of overcirculation raise pulmonary resistance until the shunt reverses (Eisenmenger) — repair is then no longer possible.',
      'Repair in infancy, before pulmonary vessels remodel.',
    ],
    pitfalls: ['Judging VSD size by murmur loudness.'],
    bedside: 'A fading murmur with new cyanosis in a known VSD means rising pulmonary resistance.',
    selfCheck: [
      q('Which chambers dilate with a large VSD?', ['RA and RV', 'LA and LV', 'RA and LA', 'None'], 1, 'Extra pulmonary flow returns to the left heart.'),
    ],
  },
  'neo-transition': {
    objectives: ['Describe fetal-to-newborn circulatory transition.', 'Use pre-ductal saturation targets.', 'Recognise and treat PPHN.'],
    essentials: ['nt-2', 'nt-3', 'nt-5', 'nt-7'],
    keyPoints: [
      'First breaths drop pulmonary resistance; ductal flow reverses to left-to-right.',
      'Saturation rises slowly: about 60–65 % at 1 minute, 80–85 % at 5. Measure on the right hand.',
      'PPHN: pulmonary pressure stays high; right-to-left ductal flow gives a pre/post-ductal difference.',
      'Break the circle: oxygen, gentle ventilation, warmth, correct acidosis, surfactant, inhaled nitric oxide.',
      'No pre/post difference does not exclude PPHN if the shunt is across the foramen ovale.',
    ],
    pitfalls: ['Chasing 100 % saturation in the first minutes.'],
    bedside: 'Put the first saturation probe on the right hand.',
    selfCheck: [
      q('Right hand SpO₂ 95 %, foot 80 %. Suggests…', ['Normal', 'Right-to-left ductal shunt', 'Left-to-right ductal shunt', 'Probe error only'], 1, 'Deoxygenated blood enters the descending aorta through the ductus.'),
    ],
  },
  'abd-fast': {
    objectives: ['Know where free blood collects when supine.', 'Interpret positive and negative FAST correctly.', 'Recognise retroperitoneal bleeding that FAST cannot see.'],
    essentials: ['fast-1', 'fast-3', 'fast-4', 'fast-8', 'fast-10'],
    keyPoints: [
      'FAST looks at Morison’s pouch, perisplenic space, pelvis and pericardium.',
      'Early bleeding may be invisible: repeat the scan when things change.',
      'Morison’s pouch is usually positive first.',
      'Retroperitoneal bleeding (ruptured AAA, pelvic fracture, kidney) gives a negative FAST.',
      'Positive in shock: the abdomen is a likely source. Negative: not proof of safety.',
    ],
    pitfalls: ['Treating a negative FAST as ruling out bleeding.'],
    bedside: 'Shocked patient with negative FAST: look at the aorta, the pelvis and the chest.',
    selfCheck: [
      q('Unstable patient, all FAST windows negative, wide aorta. Likely source?', ['Splenic laceration', 'Retroperitoneal AAA rupture', 'Liver laceration', 'No bleeding'], 1, 'Retroperitoneal blood is not seen in FAST windows.'),
    ],
  },
  'abd-aaa': {
    objectives: ['Define and measure an AAA.', 'Recognise contained rupture.', 'Prioritise aortic control.'],
    essentials: ['aaa-2', 'aaa-4', 'aaa-5', 'aaa-8'],
    keyPoints: [
      'AAA ≥ 3 cm; repair usually considered above about 5.5 cm.',
      'Measure outer wall to outer wall.',
      'Contained rupture into the retroperitoneum can look deceptively stable — the window to reach repair.',
      'FAST stays negative until free intraperitoneal rupture.',
      'Outcome depends on aortic control; many teams accept a lower pressure while the patient stays conscious.',
    ],
    pitfalls: ['Mistaking back pain and a faint for renal colic in an older patient.'],
    bedside: 'Older patient with back pain and collapse: scan the aorta.',
    selfCheck: [
      q('Why can a ruptured AAA appear haemodynamically stable at first?', ['It is not bleeding', 'Retroperitoneal tissue temporarily tamponades the leak', 'The heart compensates fully', 'Blood pools in the pericardium'], 1, 'Contained rupture.'),
    ],
  },
  'abd-dissection': {
    objectives: ['Classify dissection (Stanford A vs B).', 'Recognise malperfusion.', 'Treat with impulse control: rate before pressure.'],
    essentials: ['ad-2', 'ad-3', 'ad-5', 'ad-7', 'ad-9'],
    keyPoints: [
      'Type A involves the ascending aorta: surgical emergency.',
      'Type B is descending only: medical unless complicated.',
      'Malperfusion of kidney, bowel or leg makes a type B complicated.',
      'Beta-blocker first to a heart rate around 60, then vasodilator to systolic below about 120.',
      'A vasodilator alone causes reflex tachycardia and more shear.',
    ],
    pitfalls: ['Starting a vasodilator before beta-blockade.'],
    bedside: 'Dissection: rate control first, then pressure.',
    selfCheck: [
      q('Which drug comes first in aortic dissection?', ['Nitroprusside', 'Short-acting beta-blocker', 'Hydralazine', 'Furosemide'], 1, 'Reduce dP/dt before vasodilating.'),
    ],
  },
  'abd-solid-organ': {
    objectives: ['Use response to transfusion to decide management of solid-organ injury.'],
    essentials: ['so-1', 'so-3', 'so-4', 'so-5'],
    keyPoints: [
      'Stable patients with low-grade injury: CT and non-operative management with close observation.',
      'Response to blood sorts patients: responders, transient responders, non-responders.',
      'Transient responders are still bleeding: angioembolisation if immediately available and safe, otherwise theatre.',
      'Non-responders go to theatre now with damage control and massive transfusion.',
    ],
    bedside: 'Reassess after every unit; a transient response is a decision point.',
    selfCheck: [
      q('After 1 L of blood, HR improves then rises again in 45 minutes. Category?', ['Responder', 'Transient responder', 'Non-responder', 'Stable'], 1, 'Ongoing bleeding after a temporary response.'),
    ],
  },
  'abd-mesenteric': {
    objectives: ['Recognise acute mesenteric ischaemia early.', 'Know the limits of lactate.', 'Prioritise revascularisation.'],
    essentials: ['me-1', 'me-2', 'me-3', 'me-5'],
    keyPoints: [
      'Pain out of proportion to a soft abdomen is the early sign.',
      'AF with embolus to the SMA is a classic cause.',
      'Lactate can be normal early; do not use it to rule out ischaemia.',
      'Treatment is time: revascularise, resect dead bowel, fluids, antibiotics and anticoagulation.',
    ],
    pitfalls: ['Waiting for peritonism or a high lactate.'],
    bedside: 'Severe pain with a soft abdomen in a patient with AF: CT angiogram now.',
    selfCheck: [
      q('Which finding should NOT reassure you in suspected mesenteric ischaemia?', ['Normal lactate', 'Soft abdomen', 'Both', 'Neither'], 2, 'Both are typical early on.'),
    ],
  },
  'abd-obstruction': {
    objectives: ['Recognise small-bowel obstruction and its fluid losses.', 'Recognise perforation on ultrasound and CT.'],
    essentials: ['sb-1', 'sb-3', 'sb-4', 'sb-6'],
    keyPoints: [
      'Adhesions and hernias cause most small-bowel obstruction.',
      'Litres are lost into bowel and vomit: decompress, replace fluid, watch for strangulation.',
      'Perforation puts free air in the peritoneum — under the diaphragm when upright, anterior when supine.',
      'Perforation with peritonitis needs resuscitation, antibiotics and surgery.',
    ],
    bedside: 'Obstruction: NG tube, fluids, and a surgical review for strangulation.',
    selfCheck: [
      q('Where does free air collect in a supine patient?', ['Pelvis', 'Anterior abdomen', 'Behind the kidneys', 'Pericardium'], 1, 'Air rises to the highest point.'),
    ],
  },
};
