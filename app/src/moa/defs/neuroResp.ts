/** Neuro-critical-care and airway drugs on the existing neuro and ventilator models. Original teaching text. */
import type { MechanismDefinition } from '../types';
import { hemoAdapter } from '../linesAdapter';
import { bronchodilatorAdapter } from '../ventAdapter';
import { osmoAdapter, lysisAdapter } from '../neuroAdapter';

export const MANNITOL: MechanismDefinition = {
  id: 'mannitol', drug: 'Mannitol', drugClass: 'Osmotic agent',
  blurb: 'A haematoma past the knee of the pressure–volume curve, with a pupil starting to dilate. Mannitol is given as a bolus.',
  nodes: [
    { id: 'man', kind: 'drug', label: 'Mannitol 20 %', sub: '0.5–1 g/kg', explain: 'Mannitol is a sugar alcohol that stays in the blood and extracellular fluid: it does not cross an intact blood–brain barrier.' },
    { id: 'osm', kind: 'messenger', label: 'Plasma osmolality ↑' },
    { id: 'bbb', kind: 'cell', label: 'Intact blood–brain barrier', explain: 'Where the barrier is intact, the osmotic gradient draws water out of brain tissue into the blood.' },
    { id: 'water', kind: 'organ', label: 'Brain water ↓' },
    { id: 'visc', kind: 'organ', label: 'Blood viscosity ↓', sub: 'early', explain: 'Early on it also thins the blood; vessels constrict a little to keep flow constant, lowering cerebral blood volume.' },
    { id: 'kid', kind: 'organ', label: 'Osmotic diuresis', explain: 'Filtered but not reabsorbed, it pulls water and electrolytes into the urine.' },
    { id: 'icp', kind: 'vital', label: 'ICP ↓' }, { id: 'cpp', kind: 'vital', label: 'CPP ↑' },
    { id: 'vol', kind: 'vital', label: 'Intravascular volume ↓ later', sub: 'replace urine losses; watch sodium, potassium' },
  ],
  edges: [
    { from: 'man', to: 'osm', sign: 1 }, { from: 'osm', to: 'bbb', sign: 1 }, { from: 'bbb', to: 'water', sign: -1 }, { from: 'man', to: 'visc', sign: -1 },
    { from: 'water', to: 'icp', sign: 1 }, { from: 'visc', to: 'icp', sign: 1 }, { from: 'icp', to: 'cpp', sign: -1 }, { from: 'man', to: 'kid', sign: 1 }, { from: 'kid', to: 'vol', sign: -1 },
  ],
  patient: osmoAdapter({ scenario: 'left basal-ganglia haematoma 54 mL', ml: 54, maxMl: 18 }),
  summary: 'An osmotic gradient across an intact barrier draws water out of the brain; the kidneys then lose that water. It works on the same pressure–volume curve as every other ICP treatment, and it buys time rather than removing the cause.',
};

export const NIMODIPINE: MechanismDefinition = {
  id: 'nimodipine', drug: 'Nimodipine', drugClass: 'Lipophilic dihydropyridine calcium-channel blocker',
  blurb: 'Aneurysmal subarachnoid haemorrhage, day 1. Oral nimodipine is started for three weeks.',
  selectivity: [{ receptor: 'L-type (cerebral)', activity: 1 }, { receptor: 'L-type (systemic)', activity: 0.5 }],
  nodes: [
    { id: 'nim', kind: 'drug', label: 'Nimodipine', sub: 'enteral, every 4 h', explain: 'Nimodipine is a lipid-soluble dihydropyridine that reaches the brain well.' },
    { id: 'lt', kind: 'channel', label: 'L-type Ca²⁺ channels', sub: 'vascular smooth muscle · neurons' },
    { id: 'ca', kind: 'messenger', label: 'Ca²⁺ entry ↓' },
    { id: 'dci', kind: 'organ', label: 'Delayed cerebral ischaemia ↓', explain: 'After aneurysmal bleeding it lowers delayed ischaemia and improves outcome — probably through the microcirculation and neuroprotection.' },
    { id: 'spasm', kind: 'organ', label: 'Large-artery (angiographic) spasm', explain: 'It does not reliably widen the large arteries that go into spasm; the benefit is not measured on the angiogram.' },
    { id: 'svr', kind: 'vital', label: 'Systemic SVR ↓' },
    { id: 'map', kind: 'vital', label: 'BP ↓', explain: 'The systemic side effect matters: a fall in pressure lowers cerebral perfusion. Smaller, more frequent doses help.' },
  ],
  edges: [
    { from: 'nim', to: 'lt', sign: -1 }, { from: 'lt', to: 'ca', sign: 1 }, { from: 'ca', to: 'dci', sign: 1 }, { from: 'ca', to: 'spasm', sign: 1, effect: 'none' },
    { from: 'ca', to: 'svr', sign: 1 }, { from: 'svr', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'normal', svr: -0.14, hr: 0.05, dose: (u) => (u <= 0 ? 'before the dose' : '60 mg enteral') }),
  summary: 'Better outcome after aneurysmal SAH without reliably reversing angiographic spasm; the dose-limiting problem is systemic hypotension.',
};

export const THROMBOLYTIC: MechanismDefinition = {
  id: 'thrombolytic', drug: 'Alteplase / tenecteplase', drugClass: 'Fibrinolytic (tissue plasminogen activator)',
  blurb: 'Left M1 occlusion, 90 minutes from onset, eligible for thrombolysis. The bolus is given while the team prepares for thrombectomy.',
  nodes: [
    { id: 'tpa', kind: 'drug', label: 'tPA (alteplase / tenecteplase)', explain: 'Tissue plasminogen activator binds fibrin in the clot.' },
    { id: 'fib', kind: 'receptor', label: 'Fibrin in the clot', explain: 'Bound to fibrin, it converts nearby plasminogen much more efficiently than plasminogen floating free in plasma.' },
    { id: 'plg', kind: 'enzyme', label: 'Plasminogen → plasmin' },
    { id: 'lys', kind: 'cell', label: 'Fibrin degraded', sub: 'clot dissolves' },
    { id: 'rec', kind: 'organ', label: 'Recanalisation', sub: 'less likely for large, proximal clots', explain: 'The clot dissolves from its surface. Large proximal clots often do not fully open, which is why thrombectomy follows.' },
    { id: 'cbf', kind: 'vital', label: 'Territory blood flow ↑' },
    { id: 'core', kind: 'vital', label: 'Core growth slowed · penumbra saved' },
    { id: 'bleed', kind: 'organ', label: 'Bleeding (incl. intracranial)', explain: 'Plasmin does not know which fibrin is the stroke clot: bleeding, including into the infarct, is the main risk.' },
  ],
  edges: [
    { from: 'tpa', to: 'fib', sign: 1 }, { from: 'fib', to: 'plg', sign: 1 }, { from: 'plg', to: 'lys', sign: 1 }, { from: 'lys', to: 'rec', sign: 1 },
    { from: 'rec', to: 'cbf', sign: 1 }, { from: 'cbf', to: 'core', sign: 1 }, { from: 'plg', to: 'bleed', sign: 1 },
  ],
  patient: lysisAdapter({ scenario: 'left M1 occlusion, 90 min', minutes: 90, maxLysis: 0.9 }),
  summary: 'Fibrin-bound plasminogen activation dissolves the clot; flow returns to the penumbra if it is in time. Bleeding is the price; tenecteplase is more fibrin-specific and given as a single bolus.',
};

export const IPRATROPIUM: MechanismDefinition = {
  id: 'ipratropium', drug: 'Ipratropium', drugClass: 'Inhaled muscarinic antagonist',
  blurb: 'A ventilated COPD patient with high airway resistance. Ipratropium is added to the bronchodilator.',
  selectivity: [{ receptor: 'M3', activity: 1 }, { receptor: 'M1', activity: 1 }, { receptor: 'M2', activity: 1 }],
  nodes: [
    { id: 'ipr', kind: 'drug', label: 'Ipratropium', sub: 'nebulised / inline', explain: 'Ipratropium blocks muscarinic receptors in the airway, where vagal acetylcholine keeps the smooth muscle toned and the glands secreting.' },
    { id: 'm3', kind: 'receptor', label: 'M3 receptor', sub: 'airway smooth muscle · glands' },
    { id: 'gq', kind: 'transducer', label: 'Gq → IP₃ → Ca²⁺ ↓', explain: 'With M3 blocked, acetylcholine can no longer raise calcium through Gq.' },
    { id: 'relax', kind: 'cell', label: 'Smooth-muscle relaxation' },
    { id: 'sec', kind: 'cell', label: 'Mucus secretion ↓' },
    { id: 'calib', kind: 'organ', label: 'Airway calibre ↑', explain: 'Wider airways and less mucus lower the resistance to flow — on the ventilator the peak pressure falls toward the plateau.' },
    { id: 'raw', kind: 'vital', label: 'Airway resistance ↓' }, { id: 'pip', kind: 'vital', label: 'PIP − Pplat gap ↓' },
  ],
  edges: [
    { from: 'ipr', to: 'm3', sign: -1 }, { from: 'm3', to: 'gq', sign: 1 }, { from: 'gq', to: 'relax', sign: -1 }, { from: 'm3', to: 'sec', sign: 1 },
    { from: 'relax', to: 'calib', sign: 1 }, { from: 'calib', to: 'raw', sign: -1 }, { from: 'raw', to: 'pip', sign: 1 },
  ],
  patient: bronchodilatorAdapter('copd', 14),
  summary: 'Anticholinergic bronchodilation: slower onset than a beta-2 agonist and additive to it, with drier secretions. (The ventilator engine uses one bronchodilator effect for any drug; the magnitude here is not drug-specific.)',
};
