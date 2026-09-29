/** Vasoactive drugs on the Lines engine. Original teaching text; effect sizes are demo-dose teaching values. */
import type { MechanismDefinition } from '../types';
import { hemoAdapter } from '../linesAdapter';

export const EPINEPHRINE: MechanismDefinition = {
  id: 'epinephrine', drug: 'Epinephrine', drugClass: 'Catecholamine (β1 = β2 at low dose, α1 as the dose rises)',
  blurb: 'Septic shock that is not responding to norepinephrine alone. An epinephrine infusion is added.',
  selectivity: [{ receptor: 'α1', activity: 0.8 }, { receptor: 'β1', activity: 1 }, { receptor: 'β2', activity: 0.85 }, { receptor: 'α2', activity: 0.5 }],
  nodes: [
    { id: 'epi', kind: 'drug', label: 'Epinephrine', sub: 'IV infusion', explain: 'Epinephrine is the adrenal medulla’s hormone. It activates all the adrenergic receptors, and which ones dominate depends on the dose.' },
    { id: 'b1', kind: 'receptor', label: 'β1 receptor', sub: 'heart', explain: 'On the heart, beta-1 receptors…' },
    { id: 'b2', kind: 'receptor', label: 'β2 receptor', sub: 'muscle arterioles · bronchi · liver', explain: '…on muscle arterioles, airways and liver, beta-2…' },
    { id: 'a1', kind: 'receptor', label: 'α1 receptor', sub: 'skin · splanchnic vessels', explain: '…and on skin and gut vessels, alpha-1, which takes over at higher doses.' },
    { id: 'gs1', kind: 'transducer', label: 'Gs → cAMP → PKA', sub: 'myocyte' },
    { id: 'gs2', kind: 'transducer', label: 'Gs → cAMP → PKA', sub: 'smooth muscle · hepatocyte' },
    { id: 'gq', kind: 'transducer', label: 'Gq → IP₃ → Ca²⁺' },
    { id: 'ino', kind: 'cell', label: 'Contractility ↑ · rate ↑', explain: 'Cyclic AMP in heart cells raises contractility and heart rate.' },
    { id: 'relax', kind: 'cell', label: 'MLCK inhibited → relaxation', explain: 'In smooth muscle, cyclic AMP relaxes the muscle: muscle-bed arterioles dilate and the bronchi open.' },
    { id: 'glyco', kind: 'cell', label: 'Glycogenolysis · lactate ↑', explain: 'In the liver and muscle it mobilises glucose and raises lactate, even when perfusion is fine. Remember this when you read a lactate on epinephrine.' },
    { id: 'cons', kind: 'organ', label: 'Skin / gut vasoconstriction', explain: 'Alpha-1 constricts the skin and splanchnic beds.' },
    { id: 'dil', kind: 'organ', label: 'Muscle-bed vasodilation' },
    { id: 'co', kind: 'vital', label: 'Cardiac output ↑' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↑' },
    { id: 'svr', kind: 'vital', label: 'SVR ↑ (net)' },
    { id: 'map', kind: 'vital', label: 'MAP ↑', explain: 'Output and resistance both rise, so pressure climbs — with more tachycardia and more lactate than norepinephrine.' },
  ],
  edges: [
    { from: 'epi', to: 'b1', sign: 1 }, { from: 'epi', to: 'b2', sign: 1 }, { from: 'epi', to: 'a1', sign: 1 },
    { from: 'b1', to: 'gs1', sign: 1 }, { from: 'b2', to: 'gs2', sign: 1 }, { from: 'a1', to: 'gq', sign: 1 },
    { from: 'gs1', to: 'ino', sign: 1 }, { from: 'gs2', to: 'relax', sign: 1 }, { from: 'gs2', to: 'glyco', sign: 1 }, { from: 'gq', to: 'cons', sign: 1 },
    { from: 'relax', to: 'dil', sign: 1 }, { from: 'ino', to: 'co', sign: 1 }, { from: 'ino', to: 'hr', sign: 1 },
    { from: 'cons', to: 'svr', sign: 1 }, { from: 'dil', to: 'svr', sign: -1 },
    { from: 'co', to: 'map', sign: 1 }, { from: 'svr', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'sepsis', svr: 0.35, hr: 0.18, co: 0.3, dose: (u) => `${(0.1 * u).toFixed(2)} µg/kg/min` }),
  summary: 'Epinephrine raises pressure through both output and resistance. The price is tachycardia, arrhythmia risk and a lactate that rises for metabolic reasons, not only because of poor perfusion.',
};

export const VASOPRESSIN: MechanismDefinition = {
  id: 'vasopressin', drug: 'Vasopressin', drugClass: 'Non-adrenergic vasopressor (V1a; V2 in the kidney)',
  blurb: 'Septic shock on rising norepinephrine. Low-dose vasopressin is added to spare catecholamine.',
  selectivity: [{ receptor: 'V1a', activity: 1 }, { receptor: 'V2', activity: 0.6 }, { receptor: 'α/β', activity: 0 }],
  nodes: [
    { id: 'avp', kind: 'drug', label: 'Vasopressin', sub: 'fixed low dose', explain: 'Vasopressin is antidiuretic hormone. In septic shock its own level is inappropriately low, so a small fixed dose replaces it.' },
    { id: 'v1', kind: 'receptor', label: 'V1a receptor', sub: 'vascular smooth muscle', explain: 'It acts on V1a receptors on vascular smooth muscle — not on adrenergic receptors at all.' },
    { id: 'v2', kind: 'receptor', label: 'V2 receptor', sub: 'collecting duct', explain: 'In the kidney it acts on V2 receptors in the collecting duct.' },
    { id: 'gq', kind: 'transducer', label: 'Gq → PLC → IP₃', explain: 'V1a couples to Gq, releasing intracellular calcium.' },
    { id: 'gs', kind: 'transducer', label: 'Gs → cAMP', explain: 'V2 couples to Gs and cyclic AMP.' },
    { id: 'katp', kind: 'channel', label: 'K-ATP channels closed', sub: 'membrane depolarised', explain: 'It also closes the ATP-sensitive potassium channels that sepsis and acidosis hold open, so vessels respond again.' },
    { id: 'ca', kind: 'messenger', label: 'Cytosolic Ca²⁺ ↑' },
    { id: 'aqp', kind: 'cell', label: 'Aquaporin-2 inserted', explain: 'Aquaporin-2 channels move into the duct membrane and water is reabsorbed.' },
    { id: 'con', kind: 'organ', label: 'Vasoconstriction', explain: 'The result is vasoconstriction that still works when acidosis blunts the response to catecholamines.' },
    { id: 'water', kind: 'organ', label: 'Free-water retention', sub: 'watch the sodium' },
    { id: 'svr', kind: 'vital', label: 'SVR ↑' },
    { id: 'map', kind: 'vital', label: 'MAP ↑', explain: 'Pressure rises with little change in heart rate, which lets the norepinephrine dose come down.' },
  ],
  edges: [
    { from: 'avp', to: 'v1', sign: 1 }, { from: 'avp', to: 'v2', sign: 1 }, { from: 'v1', to: 'gq', sign: 1 }, { from: 'v2', to: 'gs', sign: 1 },
    { from: 'gq', to: 'ca', sign: 1 }, { from: 'gq', to: 'katp', sign: 1 }, { from: 'katp', to: 'ca', sign: 1 }, { from: 'gs', to: 'aqp', sign: 1 },
    { from: 'ca', to: 'con', sign: 1 }, { from: 'aqp', to: 'water', sign: 1 }, { from: 'con', to: 'svr', sign: 1 }, { from: 'svr', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'sepsis', svr: 0.35, hr: -0.03, co: -0.03, dose: (u) => `${(0.03 * u).toFixed(3)} U/min` }),
  summary: 'Vasopressin raises resistance through a separate receptor and restores vascular responsiveness, so it adds to norepinephrine rather than competing with it. It is not titrated like a catecholamine. At higher doses, gut, skin and coronary ischaemia become the limit.',
};

export const PHENYLEPHRINE: MechanismDefinition = {
  id: 'phenylephrine', drug: 'Phenylephrine', drugClass: 'Pure α1 agonist',
  blurb: 'Vasodilated and hypotensive. Phenylephrine is given — and the heart rate falls.',
  selectivity: [{ receptor: 'α1', activity: 1 }, { receptor: 'α2', activity: 0.05 }, { receptor: 'β1', activity: 0 }, { receptor: 'β2', activity: 0 }],
  nodes: [
    { id: 'pe', kind: 'drug', label: 'Phenylephrine', sub: 'bolus or infusion', explain: 'Phenylephrine is a synthetic agonist that acts almost only on alpha-1 receptors.' },
    { id: 'a1', kind: 'receptor', label: 'α1 receptor', sub: 'arterioles · veins', explain: 'It binds alpha-1 receptors on arterioles and veins, and has no beta action on the heart.' },
    { id: 'gq', kind: 'transducer', label: 'Gq → PLC → IP₃ → Ca²⁺' },
    { id: 'con', kind: 'organ', label: 'Arteriolar + venous constriction', explain: 'Vessels constrict: resistance rises and venous return is supported.' },
    { id: 'svr', kind: 'vital', label: 'SVR ↑' },
    { id: 'baro', kind: 'organ', label: 'Baroreflex', sub: 'vagal tone ↑', explain: 'The pressure rise is sensed by the carotid and aortic baroreceptors, and vagal tone slows the heart.' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↓', explain: 'With no beta effect to oppose it, the reflex bradycardia shows.' },
    { id: 'co', kind: 'vital', label: 'Cardiac output ↓ (slight)' },
    { id: 'map', kind: 'vital', label: 'MAP ↑' },
  ],
  edges: [
    { from: 'pe', to: 'a1', sign: 1 }, { from: 'a1', to: 'gq', sign: 1 }, { from: 'gq', to: 'con', sign: 1 }, { from: 'con', to: 'svr', sign: 1 },
    { from: 'svr', to: 'baro', sign: 1 }, { from: 'baro', to: 'hr', sign: -1 }, { from: 'hr', to: 'co', sign: 1 }, { from: 'svr', to: 'co', sign: -1, label: 'afterload' },
    { from: 'svr', to: 'map', sign: 1 }, { from: 'co', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'sepsis', svr: 0.45, hr: -0.12, co: -0.1, dose: (u) => `${Math.round(100 * u)} µg/min` }),
  summary: 'Phenylephrine raises pressure by resistance alone. That can help a tachycardic patient, or in fixed outflow obstruction such as aortic stenosis. In a failing heart the extra afterload and lower rate reduce output.',
};

export const DOBUTAMINE: MechanismDefinition = {
  id: 'dobutamine', drug: 'Dobutamine', drugClass: 'Inodilator (β1 ≫ β2)',
  blurb: 'Cardiogenic shock with a poorly contracting left ventricle and cold extremities. Dobutamine is started.',
  selectivity: [{ receptor: 'β1', activity: 1 }, { receptor: 'β2', activity: 0.35 }, { receptor: 'α1', activity: 0.2 }],
  nodes: [
    { id: 'dob', kind: 'drug', label: 'Dobutamine', sub: 'infusion', explain: 'Dobutamine is a synthetic catecholamine that mainly stimulates beta-1 receptors.' },
    { id: 'b1', kind: 'receptor', label: 'β1 receptor', sub: 'myocyte' },
    { id: 'b2', kind: 'receptor', label: 'β2 receptor', sub: 'arterioles' },
    { id: 'gs', kind: 'transducer', label: 'Gs → cAMP → PKA', sub: 'myocyte', explain: 'In heart muscle, cyclic AMP activates protein kinase A.' },
    { id: 'gs2', kind: 'transducer', label: 'Gs → cAMP', sub: 'smooth muscle' },
    { id: 'lt', kind: 'channel', label: 'L-type Ca²⁺ ↑ · phospholamban ↓', explain: 'More calcium enters each beat and the sarcoplasmic reticulum reloads faster, so the heart contracts harder and relaxes faster.' },
    { id: 'ino', kind: 'cell', label: 'Contractility ↑' },
    { id: 'dil', kind: 'organ', label: 'Arteriolar dilation', explain: 'A smaller beta-2 effect dilates arterioles, lowering afterload.' },
    { id: 'svr', kind: 'vital', label: 'SVR ↓' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↑' },
    { id: 'co', kind: 'vital', label: 'Cardiac output ↑', explain: 'Stronger contraction against a lower afterload raises stroke volume and output.' },
    { id: 'map', kind: 'vital', label: 'MAP ≈ / ↓' },
  ],
  edges: [
    { from: 'dob', to: 'b1', sign: 1 }, { from: 'dob', to: 'b2', sign: 1 }, { from: 'b1', to: 'gs', sign: 1 }, { from: 'b2', to: 'gs2', sign: 1 },
    { from: 'gs', to: 'lt', sign: 1 }, { from: 'lt', to: 'ino', sign: 1 }, { from: 'gs2', to: 'dil', sign: 1 }, { from: 'dil', to: 'svr', sign: -1 },
    { from: 'gs', to: 'hr', sign: 1 }, { from: 'ino', to: 'co', sign: 1 }, { from: 'svr', to: 'co', sign: -1, label: 'afterload' },
    { from: 'co', to: 'map', sign: 1 }, { from: 'svr', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'cardiogenic', svr: -0.15, hr: 0.12, co: 0.4, dose: (u) => `${(5 * u).toFixed(1)} µg/kg/min` }),
  summary: 'Output rises, but pressure may not, because resistance falls. If the patient is also hypotensive, a vasopressor is usually needed alongside. Watch for tachycardia and arrhythmias.',
};
