/** Second-wave cardiovascular drugs on the Lines engine. Original teaching text; demo effect sizes are teaching values. */
import type { MechanismDefinition } from '../types';
import { hemoAdapter } from '../linesAdapter';

export const CLEVIDIPINE: MechanismDefinition = {
  id: 'clevidipine', drug: 'Clevidipine', drugClass: 'Ultra-short-acting dihydropyridine calcium-channel blocker',
  blurb: 'Severe hypertension that needs tight, minute-to-minute control. A clevidipine infusion is started and titrated.',
  selectivity: [{ receptor: 'L-type (arteriolar)', activity: 1 }, { receptor: 'L-type (cardiac)', activity: 0.05 }, { receptor: 'Venous tone', activity: 0.1 }],
  nodes: [
    { id: 'clev', kind: 'drug', label: 'Clevidipine', sub: 'IV lipid emulsion', explain: 'Clevidipine is a dihydropyridine given as a lipid emulsion. Blood and tissue esterases break it down within a minute or two, so its effect follows the infusion rate closely.' },
    { id: 'est', kind: 'enzyme', label: 'Plasma esterases', sub: 't½ ≈ 1 min', explain: 'Because it does not depend on the liver or kidney, stopping it ends the effect within minutes.' },
    { id: 'lt', kind: 'channel', label: 'L-type Ca²⁺ channel', sub: 'arteriolar smooth muscle', explain: 'It blocks L-type calcium channels in arteriolar smooth muscle.' },
    { id: 'ca', kind: 'messenger', label: 'Ca²⁺ entry ↓' },
    { id: 'mlck', kind: 'enzyme', label: 'MLCK activity ↓' },
    { id: 'dil', kind: 'organ', label: 'Arteriolar dilation', sub: 'preload preserved' },
    { id: 'svr', kind: 'vital', label: 'SVR ↓' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↑ (reflex, mild)' },
    { id: 'map', kind: 'vital', label: 'BP ↓', explain: 'Afterload falls with little change in venous return, and pressure can be walked down in small steps.' },
  ],
  edges: [
    { from: 'clev', to: 'lt', sign: -1 }, { from: 'clev', to: 'est', sign: 1, label: 'hydrolysed by' }, { from: 'lt', to: 'ca', sign: 1 }, { from: 'ca', to: 'mlck', sign: 1 },
    { from: 'mlck', to: 'dil', sign: -1 }, { from: 'dil', to: 'svr', sign: -1 }, { from: 'svr', to: 'map', sign: 1 }, { from: 'map', to: 'hr', sign: -1, label: 'baroreflex' },
  ],
  patient: hemoAdapter({ scenario: 'stiff', svr: -0.3, hr: 0.07, co: 0.05, dose: (u) => `${(8 * u).toFixed(1)} mg/h` }),
  summary: 'Arteriolar dilation with a very short half-life: fast on, fast off. It is a lipid emulsion — count the calories and avoid it with soy or egg allergy or disordered lipid metabolism.',
};

export const ESMOLOL: MechanismDefinition = {
  id: 'esmolol', drug: 'Esmolol', drugClass: 'Cardioselective β1 antagonist (ultra-short-acting)',
  blurb: 'Aortic dissection, or a rapid rate that needs slowing now. Esmolol is given as a bolus and infusion.',
  selectivity: [{ receptor: 'β1', activity: 1 }, { receptor: 'β2', activity: 0.1 }, { receptor: 'α1', activity: 0 }],
  nodes: [
    { id: 'esm', kind: 'drug', label: 'Esmolol', sub: 'bolus + infusion', explain: 'Esmolol blocks beta-1 receptors on the heart. Red-cell esterases clear it in minutes.' },
    { id: 'b1', kind: 'receptor', label: 'β1 receptor', sub: 'SA node · AV node · myocyte', explain: 'It competes with norepinephrine and epinephrine at the beta-1 receptor.' },
    { id: 'gs', kind: 'transducer', label: 'Gs → cAMP ↓ → PKA ↓' },
    { id: 'if', kind: 'channel', label: 'Pacemaker current (If) ↓ · L-type Ca²⁺ ↓', explain: 'Less cyclic AMP slows the pacemaker current, slows conduction through the AV node and reduces calcium entry into myocytes.' },
    { id: 'rate', kind: 'cell', label: 'SA rate ↓ · AV conduction ↓' },
    { id: 'ino', kind: 'cell', label: 'Contractility ↓ · dP/dt ↓' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↓' },
    { id: 'co', kind: 'vital', label: 'Cardiac output ↓' },
    { id: 'map', kind: 'vital', label: 'BP ↓ (modest)', explain: 'Rate and force of ejection fall, which is exactly what a torn aortic wall needs. In a failing ventricle, the same effect can precipitate shock.' },
    { id: 'svr', kind: 'vital', label: 'SVR — no direct effect' },
  ],
  edges: [
    { from: 'esm', to: 'b1', sign: -1 }, { from: 'b1', to: 'gs', sign: 1 }, { from: 'gs', to: 'if', sign: 1 }, { from: 'if', to: 'rate', sign: 1 }, { from: 'if', to: 'ino', sign: 1 },
    { from: 'rate', to: 'hr', sign: 1 }, { from: 'ino', to: 'co', sign: 1 }, { from: 'hr', to: 'co', sign: 1 }, { from: 'co', to: 'map', sign: 1 }, { from: 'esm', to: 'svr', sign: 1, effect: 'none' },
  ],
  patient: hemoAdapter({ scenario: 'stiff', hr: -0.25, co: -0.15, svr: 0.02, dose: (u) => `${Math.round(200 * u)} µg/kg/min` }),
  summary: 'Pure rate and contractility control that can be switched off in minutes. Watch for bradycardia, hypotension and heart failure; it does not lower vascular resistance.',
};

export const LABETALOL: MechanismDefinition = {
  id: 'labetalol', drug: 'Labetalol', drugClass: 'Combined α1 and non-selective β antagonist (≈ 1 : 7 given IV)',
  blurb: 'Hypertensive emergency, or blood-pressure control after a stroke. Labetalol is given in IV boluses.',
  selectivity: [{ receptor: 'β1', activity: 1 }, { receptor: 'β2', activity: 0.9 }, { receptor: 'α1', activity: 0.15 }],
  nodes: [
    { id: 'lab', kind: 'drug', label: 'Labetalol', sub: 'IV bolus', explain: 'Labetalol blocks beta-1, beta-2 and alpha-1 receptors, with much more beta than alpha blockade when given intravenously.' },
    { id: 'a1', kind: 'receptor', label: 'α1 receptor', sub: 'arterioles' },
    { id: 'b1', kind: 'receptor', label: 'β1 receptor', sub: 'heart' },
    { id: 'b2', kind: 'receptor', label: 'β2 receptor', sub: 'bronchi' },
    { id: 'gq', kind: 'transducer', label: 'Gq → Ca²⁺ ↓' },
    { id: 'gs', kind: 'transducer', label: 'Gs → cAMP ↓' },
    { id: 'dil', kind: 'organ', label: 'Arteriolar dilation', explain: 'Alpha-1 blockade relaxes the arterioles and lowers resistance.' },
    { id: 'brk', kind: 'cell', label: 'No reflex tachycardia', explain: 'Because the heart is beta-blocked at the same time, the usual reflex speeding of the heart is prevented.' },
    { id: 'bron', kind: 'organ', label: 'Bronchoconstriction risk', sub: 'asthma / COPD' },
    { id: 'svr', kind: 'vital', label: 'SVR ↓' }, { id: 'hr', kind: 'vital', label: 'Heart rate ↓ or unchanged' },
    { id: 'map', kind: 'vital', label: 'BP ↓' },
  ],
  edges: [
    { from: 'lab', to: 'a1', sign: -1 }, { from: 'lab', to: 'b1', sign: -1 }, { from: 'lab', to: 'b2', sign: -1 }, { from: 'a1', to: 'gq', sign: 1 }, { from: 'b1', to: 'gs', sign: 1 },
    { from: 'gq', to: 'dil', sign: -1 }, { from: 'gs', to: 'brk', sign: -1 }, { from: 'b2', to: 'bron', sign: -1 }, { from: 'dil', to: 'svr', sign: -1 }, { from: 'brk', to: 'hr', sign: 1 },
    { from: 'svr', to: 'map', sign: 1 }, { from: 'hr', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'stiff', svr: -0.22, hr: -0.12, co: -0.03, dose: (u) => `${Math.round(40 * u)} mg IV (cumulative)` }),
  summary: 'Resistance falls without a reflex tachycardia. Beta-2 blockade can tighten the airways, and it slows AV conduction — caution in asthma, heart block and decompensated heart failure.',
};

export const NITROGLYCERIN: MechanismDefinition = {
  id: 'nitroglycerin', drug: 'Nitroglycerin', drugClass: 'Organic nitrate — nitric-oxide donor (veins > arteries at low dose)',
  blurb: 'Acute pulmonary oedema from a failing left ventricle, or ischaemic chest pain. A nitroglycerin infusion is started.',
  selectivity: [{ receptor: 'Veins', activity: 1 }, { receptor: 'Coronary arteries', activity: 0.7 }, { receptor: 'Arterioles', activity: 0.4 }],
  nodes: [
    { id: 'ntg', kind: 'drug', label: 'Nitroglycerin', sub: 'IV / sublingual', explain: 'Nitroglycerin is converted inside smooth-muscle cells into nitric oxide.' },
    { id: 'no', kind: 'messenger', label: 'Nitric oxide', explain: 'Nitric oxide diffuses to soluble guanylate cyclase.' },
    { id: 'sgc', kind: 'enzyme', label: 'Soluble guanylate cyclase' },
    { id: 'cgmp', kind: 'messenger', label: 'cGMP ↑ → PKG', explain: 'Cyclic GMP activates protein kinase G, which lowers calcium and switches on myosin light-chain phosphatase. The muscle relaxes.' },
    { id: 'pde5', kind: 'enzyme', label: 'PDE5', sub: 'breaks down cGMP · sildenafil blocks it', explain: 'Phosphodiesterase-5 inhibitors keep cyclic GMP high: combined with a nitrate the pressure can collapse.' },
    { id: 'ven', kind: 'organ', label: 'Venodilation', sub: 'dominant at low dose', explain: 'At low doses the veins dilate most. Blood pools in the capacitance vessels, so less returns to the heart.' },
    { id: 'art', kind: 'organ', label: 'Arteriolar / coronary dilation', sub: 'higher dose' },
    { id: 'pre', kind: 'vital', label: 'Preload ↓ (CVP, wedge)' },
    { id: 'svr', kind: 'vital', label: 'SVR ↓ (mild)' },
    { id: 'co', kind: 'vital', label: 'Cardiac output', sub: '↑ LV failure · ↓ preload-dependent', explain: 'A congested, failing ventricle ejects more when filling pressure and afterload fall. A preload-dependent heart — right-ventricular infarction, obstruction, hypovolaemia — loses output and pressure.' },
    { id: 'map', kind: 'vital', label: 'MAP' },
  ],
  edges: [
    { from: 'ntg', to: 'no', sign: 1 }, { from: 'no', to: 'sgc', sign: 1 }, { from: 'sgc', to: 'cgmp', sign: 1 }, { from: 'pde5', to: 'cgmp', sign: -1 },
    { from: 'cgmp', to: 'ven', sign: 1 }, { from: 'cgmp', to: 'art', sign: 1 }, { from: 'ven', to: 'pre', sign: -1 }, { from: 'art', to: 'svr', sign: -1 },
    { from: 'pre', to: 'co', sign: 1 }, { from: 'svr', to: 'co', sign: -1 }, { from: 'co', to: 'map', sign: 1 }, { from: 'svr', to: 'map', sign: 1 },
  ],
  contexts: [
    { id: 'lvf', label: 'LV failure, congested', note: 'Filling pressure falls, afterload falls a little, and the failing ventricle keeps or improves its output.', patient: hemoAdapter({ scenario: 'cardiogenic', cvp: -0.35, svr: -0.15, co: 0.05, dose: (u) => `${Math.round(100 * u)} µg/min` }) },
    { id: 'preload', label: 'Preload-dependent (RV failure)', note: 'The right ventricle needs its filling pressure: venodilation drops output and pressure.', patient: hemoAdapter({ scenario: 'rvfail', cvp: -0.3, svr: -0.1, co: -0.25, dose: (u) => `${Math.round(100 * u)} µg/min` }) },
  ],
  summary: 'Nitric oxide → cyclic GMP → relaxation, mostly venous at low dose. It helps a congested left ventricle and harms a preload-dependent one; never with a PDE5 inhibitor on board. Tolerance develops over a day.',
};

export const MILRINONE: MechanismDefinition = {
  id: 'milrinone', drug: 'Milrinone', drugClass: 'Phosphodiesterase-3 inhibitor ("inodilator")',
  blurb: 'Low-output heart failure with a high systemic resistance, perhaps already on a beta-blocker. Milrinone is started.',
  selectivity: [{ receptor: 'PDE3 (heart)', activity: 1 }, { receptor: 'PDE3 (vessels)', activity: 0.9 }, { receptor: 'β receptors', activity: 0 }],
  nodes: [
    { id: 'mil', kind: 'drug', label: 'Milrinone', sub: 'infusion · renally cleared', explain: 'Milrinone inhibits phosphodiesterase-3, the enzyme that breaks down cyclic AMP in heart and vascular muscle.' },
    { id: 'pde3', kind: 'enzyme', label: 'PDE3', explain: 'It works downstream of the receptors, so it still acts when beta-receptors are blocked or down-regulated.' },
    { id: 'camp1', kind: 'messenger', label: 'cAMP ↑', sub: 'myocyte' },
    { id: 'camp2', kind: 'messenger', label: 'cAMP ↑', sub: 'vascular smooth muscle' },
    { id: 'ca', kind: 'channel', label: 'Ca²⁺ handling ↑', sub: 'L-type · SERCA' },
    { id: 'ino', kind: 'cell', label: 'Contractility ↑ · relaxation ↑', explain: 'In the heart: stronger contraction and faster relaxation.' },
    { id: 'dil', kind: 'organ', label: 'Arterial + pulmonary dilation', explain: 'In vessels, cyclic AMP relaxes the muscle: systemic and pulmonary resistance fall.' },
    { id: 'co', kind: 'vital', label: 'Cardiac output ↑' }, { id: 'svr', kind: 'vital', label: 'SVR ↓ · PVR ↓' },
    { id: 'map', kind: 'vital', label: 'MAP ↔ or ↓' },
  ],
  edges: [
    { from: 'mil', to: 'pde3', sign: -1 }, { from: 'pde3', to: 'camp1', sign: -1 }, { from: 'pde3', to: 'camp2', sign: -1 }, { from: 'camp1', to: 'ca', sign: 1 }, { from: 'ca', to: 'ino', sign: 1 },
    { from: 'camp2', to: 'dil', sign: 1 }, { from: 'ino', to: 'co', sign: 1 }, { from: 'dil', to: 'svr', sign: -1 }, { from: 'co', to: 'map', sign: 1 }, { from: 'svr', to: 'map', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'cardiogenic', co: 0.3, svr: -0.25, hr: 0.05, dose: (u) => `${(0.5 * u).toFixed(2)} µg/kg/min` }),
  summary: 'More output with less resistance, independent of beta-receptors. Hypotension and arrhythmias are the costs, and it accumulates in renal failure.',
};

const dopa = (svr: number, co: number, hr: number, dose: string) => hemoAdapter({ scenario: 'normal', svr, co, hr, dose: (u) => (u <= 0 ? '0' : dose) });
export const DOPAMINE: MechanismDefinition = {
  id: 'dopamine', drug: 'Dopamine', drugClass: 'Catecholamine with dose-dependent receptor effects (D1 → β1 → α1)',
  blurb: 'An older vasoactive drug whose receptor profile changes with the dose. Watch the same patient at three dose ranges.',
  selectivity: [{ receptor: 'D1', activity: 0.6 }, { receptor: 'β1', activity: 0.8 }, { receptor: 'α1', activity: 0.7 }],
  nodes: [
    { id: 'dop', kind: 'drug', label: 'Dopamine', sub: 'infusion', explain: 'Dopamine is norepinephrine’s precursor. Which receptors it activates depends on the dose — and patients vary widely.' },
    { id: 'd1', kind: 'receptor', label: 'D1 receptor', sub: 'renal · splanchnic vessels', explain: 'At low doses, dopamine-1 receptors dilate renal and splanchnic vessels. This does not protect the kidneys.' },
    { id: 'b1', kind: 'receptor', label: 'β1 receptor', sub: 'heart', explain: 'In the middle range, beta-1 effects add contractility and rate, partly by releasing norepinephrine.' },
    { id: 'a1', kind: 'receptor', label: 'α1 receptor', sub: 'arterioles', explain: 'At high doses, alpha-1 vasoconstriction dominates.' },
    { id: 'rel', kind: 'messenger', label: 'NE release from nerve terminals' },
    { id: 'dil', kind: 'organ', label: 'Renal / mesenteric dilation' },
    { id: 'ino', kind: 'cell', label: 'Contractility ↑ · rate ↑' },
    { id: 'con', kind: 'organ', label: 'Vasoconstriction' },
    { id: 'svr', kind: 'vital', label: 'SVR (↓ → ↑ with dose)' }, { id: 'co', kind: 'vital', label: 'Cardiac output ↑' }, { id: 'hr', kind: 'vital', label: 'Heart rate ↑ · arrhythmias' },
    { id: 'map', kind: 'vital', label: 'MAP' },
  ],
  edges: [
    { from: 'dop', to: 'd1', sign: 1 }, { from: 'dop', to: 'b1', sign: 1 }, { from: 'dop', to: 'a1', sign: 1 }, { from: 'dop', to: 'rel', sign: 1 }, { from: 'rel', to: 'ino', sign: 1 },
    { from: 'd1', to: 'dil', sign: 1 }, { from: 'b1', to: 'ino', sign: 1 }, { from: 'a1', to: 'con', sign: 1 },
    { from: 'dil', to: 'svr', sign: -1 }, { from: 'con', to: 'svr', sign: 1 }, { from: 'ino', to: 'co', sign: 1 }, { from: 'ino', to: 'hr', sign: 1 },
    { from: 'svr', to: 'map', sign: 1 }, { from: 'co', to: 'map', sign: 1 },
  ],
  contexts: [
    { id: 'low', label: 'Low dose (≈ 1–3 µg/kg/min)', note: 'Mostly D1: small fall in resistance, little change in pressure.', patient: dopa(-0.06, 0.03, 0.02, '2 µg/kg/min') },
    { id: 'mid', label: 'Middle (≈ 3–10)', note: 'Beta-1 dominates: output and rate rise.', patient: dopa(0.02, 0.22, 0.15, '7 µg/kg/min') },
    { id: 'high', label: 'High (> 10)', note: 'Alpha-1 dominates: resistance and pressure rise, with more tachyarrhythmia than norepinephrine.', patient: dopa(0.35, 0.1, 0.25, '15 µg/kg/min') },
  ],
  summary: 'One drug, three receptor profiles, and overlapping, unpredictable dose ranges. In shock, norepinephrine is generally preferred because dopamine causes more arrhythmias.',
};
