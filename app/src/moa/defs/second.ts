/** Second batch of the initial MOA set. Original teaching text; demo effect sizes are teaching values. */
import type { MechanismDefinition } from '../types';
import { hemoAdapter } from '../linesAdapter';
import { bronchodilatorAdapter, paralysisAdapter } from '../ventAdapter';
import { sodiumAdapter } from '../benchAdapter';

export const NICARDIPINE: MechanismDefinition = {
  id: 'nicardipine', drug: 'Nicardipine', drugClass: 'Dihydropyridine calcium-channel blocker (arteriolar)',
  blurb: 'A patient whose blood pressure must come down smoothly — for example after an intracerebral haemorrhage. A nicardipine infusion is titrated.',
  selectivity: [{ receptor: 'L-type (vascular)', activity: 1 }, { receptor: 'L-type (cardiac)', activity: 0.1 }],
  nodes: [
    { id: 'nic', kind: 'drug', label: 'Nicardipine', sub: 'IV infusion', explain: 'Nicardipine is a dihydropyridine: it blocks L-type calcium channels, with strong selectivity for vascular smooth muscle over heart muscle.' },
    { id: 'lt', kind: 'channel', label: 'L-type Ca²⁺ channel', sub: 'arteriolar smooth muscle', explain: 'It binds the L-type channel in arteriolar smooth muscle and keeps it from opening when the membrane depolarises.' },
    { id: 'ca', kind: 'messenger', label: 'Ca²⁺ entry ↓', explain: 'Less calcium enters each smooth-muscle cell.' },
    { id: 'mlck', kind: 'enzyme', label: 'Ca²⁺–calmodulin → MLCK ↓', explain: 'With less calcium–calmodulin, myosin light-chain kinase is less active and the muscle relaxes.' },
    { id: 'dil', kind: 'organ', label: 'Arteriolar dilation', sub: 'little venodilation', explain: 'Arterioles dilate; veins much less, so preload is largely preserved.' },
    { id: 'svr', kind: 'vital', label: 'SVR ↓' },
    { id: 'baro', kind: 'organ', label: 'Baroreflex', sub: 'sympathetic ↑', explain: 'The falling pressure is sensed by the baroreceptors, which may speed the heart a little.' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↑ (mild)' },
    { id: 'map', kind: 'vital', label: 'BP ↓', explain: 'The main effect is a controlled fall in blood pressure, adjustable minute to minute by the infusion rate.' },
  ],
  edges: [
    { from: 'nic', to: 'lt', sign: -1 }, { from: 'lt', to: 'ca', sign: 1 }, { from: 'ca', to: 'mlck', sign: 1 }, { from: 'mlck', to: 'dil', sign: -1 },
    { from: 'dil', to: 'svr', sign: -1 }, { from: 'svr', to: 'map', sign: 1 }, { from: 'svr', to: 'baro', sign: -1 }, { from: 'baro', to: 'hr', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'stiff', svr: -0.3, hr: 0.07, co: 0.06, dose: (u) => `${(15 * u).toFixed(1)} mg/h` }),
  summary: 'Nicardipine lowers pressure by relaxing arterioles, with little effect on the heart itself. Titrate to the target, and watch for reflex tachycardia and headache.',
};

export const ALBUTEROL: MechanismDefinition = {
  id: 'albuterol', drug: 'Albuterol (salbutamol)', drugClass: 'Short-acting β2 agonist',
  blurb: 'A ventilated patient in status asthmaticus: high peak pressures, prolonged expiration, air trapping. Nebulised albuterol is given in-line.',
  selectivity: [{ receptor: 'β2', activity: 1 }, { receptor: 'β1', activity: 0.25 }, { receptor: 'α', activity: 0 }],
  nodes: [
    { id: 'alb', kind: 'drug', label: 'Albuterol', sub: 'nebulised / MDI', explain: 'Albuterol, called salbutamol outside North America, is a selective beta-2 agonist delivered straight to the airways.' },
    { id: 'b2', kind: 'receptor', label: 'β2 receptor', sub: 'airway smooth muscle', explain: 'It binds beta-2 receptors on bronchial smooth muscle.' },
    { id: 'gs', kind: 'transducer', label: 'Gs → adenylyl cyclase', explain: 'Beta-2 couples to Gs, which switches on adenylyl cyclase.' },
    { id: 'camp', kind: 'messenger', label: 'cAMP → PKA' },
    { id: 'mlck', kind: 'enzyme', label: 'MLCK inhibited · Ca²⁺ ↓', explain: 'Cyclic AMP and protein kinase A switch off myosin light-chain kinase and lower intracellular calcium, so the smooth muscle relaxes.' },
    { id: 'pump', kind: 'enzyme', label: 'Na⁺/K⁺-ATPase ↑', sub: 'skeletal muscle', target: 'membrane.nak_atpase', explain: 'Absorbed drug also stimulates the sodium potassium pump in skeletal muscle, moving potassium into cells — useful in hyperkalaemia, a cause of hypokalaemia in repeated dosing.' },
    { id: 'relax', kind: 'cell', label: 'Bronchial smooth muscle relaxes' },
    { id: 'rad', kind: 'organ', label: 'Airway radius ↑', explain: 'The airways widen. Resistance depends on the fourth power of the radius, so a small widening makes a large difference.' },
    { id: 'k', kind: 'vital', label: 'Plasma K⁺ ↓' },
    { id: 'raw', kind: 'vital', label: 'Resistance ↓ · PIP ↓', explain: 'Resistance falls: peak pressure drops while the plateau barely changes, expiratory flow improves and trapped gas empties.' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↑ (β1 spill-over)' },
  ],
  edges: [
    { from: 'alb', to: 'b2', sign: 1 }, { from: 'b2', to: 'gs', sign: 1 }, { from: 'gs', to: 'camp', sign: 1 }, { from: 'camp', to: 'mlck', sign: 1 }, { from: 'camp', to: 'pump', sign: 1 },
    { from: 'mlck', to: 'relax', sign: 1 }, { from: 'relax', to: 'rad', sign: 1 }, { from: 'rad', to: 'raw', sign: -1 }, { from: 'pump', to: 'k', sign: -1 }, { from: 'camp', to: 'hr', sign: 1 },
  ],
  patient: bronchodilatorAdapter('asthma', 20),
  summary: 'The gap between peak and plateau pressure is the resistive pressure. Albuterol shrinks it by opening the airways. Watch potassium and heart rate with repeated doses.',
};

export const KETAMINE: MechanismDefinition = {
  id: 'ketamine', drug: 'Ketamine', drugClass: 'NMDA-receptor antagonist (dissociative anaesthetic)',
  blurb: 'Induction for intubation. Ketamine is often chosen because it usually supports blood pressure — but not in every patient.',
  selectivity: [{ receptor: 'NMDA', activity: 1 }, { receptor: 'NE reuptake', activity: 0.45 }, { receptor: 'Opioid (μ)', activity: 0.15 }],
  nodes: [
    { id: 'ket', kind: 'drug', label: 'Ketamine', sub: 'IV 1–2 mg/kg (induction)', explain: 'Ketamine blocks the NMDA glutamate receptor, the brain’s main excitatory receptor channel.' },
    { id: 'nmda', kind: 'receptor', label: 'NMDA receptor (channel block)', sub: 'thalamo-cortical, limbic', explain: 'It plugs the open NMDA channel. Thalamo-cortical and limbic circuits are functionally dissociated.' },
    { id: 'net', kind: 'transducer', label: 'Catecholamine reuptake ↓', sub: 'sympathetic outflow ↑', explain: 'Separately, it increases sympathetic outflow and blocks the reuptake of norepinephrine.' },
    { id: 'myo', kind: 'cell', label: 'Direct myocardial depression', explain: 'Ketamine also depresses the heart muscle directly. Normally the sympathetic effect hides this.' },
    { id: 'diss', kind: 'organ', label: 'Dissociative anaesthesia', sub: 'eyes may open, nystagmus', explain: 'The result is dissociative anaesthesia and strong analgesia, with airway reflexes and breathing largely preserved.' },
    { id: 'anal', kind: 'organ', label: 'Analgesia', sub: 'also at low doses' },
    { id: 'emer', kind: 'organ', label: 'Emergence phenomena', sub: 'less with benzodiazepine' },
    { id: 'bronch', kind: 'organ', label: 'Bronchodilation' },
    { id: 'symp', kind: 'organ', label: 'HR ↑ · SVR ↑', sub: 'catecholamine-replete' },
    { id: 'depl', kind: 'organ', label: 'BP may fall', sub: 'catecholamine-depleted', explain: 'In a patient who has been in shock for a long time and has exhausted their catecholamines, the direct depression can show and pressure can fall. The response depends on the patient.' },
    { id: 'bp', kind: 'vital', label: 'BP: patient-dependent' },
  ],
  edges: [
    { from: 'ket', to: 'nmda', sign: -1 }, { from: 'ket', to: 'net', sign: 1 }, { from: 'ket', to: 'myo', sign: 1 },
    { from: 'nmda', to: 'diss', sign: 1 }, { from: 'nmda', to: 'anal', sign: 1 }, { from: 'nmda', to: 'emer', sign: 1 }, { from: 'net', to: 'bronch', sign: 1 },
    { from: 'net', to: 'symp', sign: 1 }, { from: 'myo', to: 'depl', sign: 1 }, { from: 'symp', to: 'bp', sign: 1 }, { from: 'depl', to: 'bp', sign: -1 },
  ],
  contexts: [
    { id: 'replete', label: 'Healthy, catecholamine-replete', note: 'Sympathetic stimulation dominates: heart rate and pressure rise.', patient: hemoAdapter({ scenario: 'normal', svr: 0.12, hr: 0.2, co: 0.12, dose: (u) => `${(1.5 * u).toFixed(1)} mg/kg` }) },
    { id: 'depleted', label: 'Prolonged shock, catecholamine-depleted', note: 'Nothing left to release: direct myocardial depression shows and pressure falls.', patient: hemoAdapter({ scenario: 'cardiogenic', svr: -0.06, hr: 0.02, co: -0.15, dose: (u) => `${(1.5 * u).toFixed(1)} mg/kg` }) },
  ],
  summary: 'Ketamine is the same molecule in both patients; the patient decides the blood pressure response. In the depleted patient, reduce the dose and have a pressor ready.',
};

export const ROCURONIUM: MechanismDefinition = {
  id: 'rocuronium', drug: 'Rocuronium', drugClass: 'Non-depolarising neuromuscular blocker',
  blurb: 'Rapid-sequence intubation, then a patient fighting the ventilator. Rocuronium stops the muscles — and nothing else.',
  selectivity: [{ receptor: 'nAChR (NMJ)', activity: 1 }, { receptor: 'Brain', activity: 0 }, { receptor: 'Pain', activity: 0 }],
  nodes: [
    { id: 'roc', kind: 'drug', label: 'Rocuronium', sub: 'IV 1.2 mg/kg (RSI)', explain: 'Rocuronium is a non-depolarising neuromuscular blocker.' },
    { id: 'nach', kind: 'receptor', label: 'Nicotinic ACh receptor', sub: 'motor end-plate', explain: 'It competes with acetylcholine for the nicotinic receptors on the motor end-plate, without opening them.' },
    { id: 'epp', kind: 'channel', label: 'No end-plate potential', explain: 'Acetylcholine still arrives, but too few receptors open, so the end-plate never reaches threshold.' },
    { id: 'ap', kind: 'cell', label: 'No muscle action potential' },
    { id: 'par', kind: 'organ', label: 'Flaccid paralysis', sub: 'incl. diaphragm', explain: 'Every skeletal muscle goes flaccid, including the diaphragm: the patient cannot breathe or move.' },
    { id: 'effort', kind: 'vital', label: 'Patient effort → 0', explain: 'On the ventilator, all patient effort disappears and every breath is machine-delivered.' },
    { id: 'nosed', kind: 'vital', label: 'NO sedation', explain: 'It has no effect on the brain: no sedation, no analgesia, no amnesia. A paralysed patient can be fully awake and in pain — always give sedation and analgesia first and keep them going.' },
    { id: 'noanal', kind: 'vital', label: 'NO analgesia' },
    { id: 'noamn', kind: 'vital', label: 'NO amnesia' },
    { id: 'rev', kind: 'drug', label: 'Sugammadex', sub: 'encapsulates rocuronium', rank: 3 },
  ],
  edges: [
    { from: 'roc', to: 'nach', sign: -1 }, { from: 'nach', to: 'epp', sign: 1 }, { from: 'epp', to: 'ap', sign: 1 }, { from: 'ap', to: 'par', sign: -1 }, { from: 'par', to: 'effort', sign: 1 },
    { from: 'roc', to: 'nosed', sign: 1, label: 'no CNS effect', effect: 'none' }, { from: 'roc', to: 'noanal', sign: 1, effect: 'none' }, { from: 'roc', to: 'noamn', sign: 1, effect: 'none' }, { from: 'rev', to: 'par', sign: -1, label: 'reversal' },
  ],
  patient: paralysisAdapter('copd'),
  summary: 'Paralysis removes the patient’s effort and protects the ventilator settings, but it hides pain and awareness. Sedation and analgesia are separate drugs and must continue.',
};

export const HYPERTONIC: MechanismDefinition = {
  id: 'hypertonic', drug: 'Hypertonic saline (3 %)', drugClass: 'Osmotic therapy',
  blurb: 'Acute hyponatraemia with seizures: sodium 118 and swollen brain cells. Hypertonic saline is given in small boluses.',
  nodes: [
    { id: 'hts', kind: 'drug', label: '3 % sodium chloride', sub: '100–150 mL boluses', explain: 'Three-percent saline carries about five hundred millimoles of sodium per litre, far more than plasma.' },
    { id: 'na', kind: 'messenger', label: 'Plasma Na⁺ ↑', explain: 'Each hundred-millilitre bolus raises plasma sodium by roughly two.' },
    { id: 'osm', kind: 'messenger', label: 'Extracellular osmolality ↑', explain: 'Extracellular fluid becomes more concentrated than the inside of the cells.' },
    { id: 'bbb', kind: 'channel', label: 'Intact blood–brain barrier', sub: 'Na⁺ cannot follow', explain: 'Sodium cannot cross an intact blood–brain barrier quickly, but water can, through aquaporin-4.' , target: 'membrane.aqp' },
    { id: 'water', kind: 'cell', label: 'Water leaves brain cells' },
    { id: 'vol', kind: 'organ', label: 'Brain-cell volume ↓', explain: 'Water moves out of the swollen cells, and brain volume falls.' },
    { id: 'icp', kind: 'vital', label: 'ICP ↓ · seizures stop', explain: 'Intracranial pressure falls and the seizures usually stop with a rise of only four to six.' },
    { id: 'limit', kind: 'vital', label: 'Limit the daily rise', sub: 'osmotic demyelination risk' },
  ],
  edges: [
    { from: 'hts', to: 'na', sign: 1 }, { from: 'na', to: 'osm', sign: 1 }, { from: 'osm', to: 'bbb', sign: 1 }, { from: 'bbb', to: 'water', sign: 1 }, { from: 'water', to: 'vol', sign: -1 }, { from: 'vol', to: 'icp', sign: 1 }, { from: 'na', to: 'limit', sign: 1 },
  ],
  patient: sodiumAdapter({ scenario: 'acute hyponatraemia 118', na: 118, maxDoses: 3 }),
  summary: 'A small rise in sodium is enough to shrink swollen brain cells. In chronic hyponatraemia the brain has already adapted, so correct slowly: too fast a rise risks osmotic demyelination.',
};
