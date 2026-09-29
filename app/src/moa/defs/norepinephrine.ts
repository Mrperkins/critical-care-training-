/** Norepinephrine — α1 ≫ β1 agonist. Original teaching text (no copied handbook prose). */
import type { MechanismDefinition } from '../types';
import { noreAdapter } from '../linesAdapter';

export const NOREPINEPHRINE: MechanismDefinition = {
  id: 'norepinephrine', drug: 'Norepinephrine', drugClass: 'Catecholamine vasopressor (α1 ≫ β1)',
  blurb: 'A patient in septic shock: the arterioles have lost their tone and the pressure is low. Norepinephrine is started and titrated up.',
  selectivity: [{ receptor: 'α1', activity: 1 }, { receptor: 'β1', activity: 0.55 }, { receptor: 'α2', activity: 0.3 }, { receptor: 'β2', activity: 0.05 }],
  nodes: [
    { id: 'ne', kind: 'drug', label: 'Norepinephrine', sub: 'IV infusion', explain: 'Norepinephrine is the body’s own sympathetic transmitter, given here as a continuous infusion.' },
    { id: 'a1', kind: 'receptor', label: 'α1 receptor', sub: 'vascular smooth muscle', explain: 'Its strongest action is on alpha-1 receptors in the smooth muscle of arterioles and veins.' },
    { id: 'b1', kind: 'receptor', label: 'β1 receptor', sub: 'cardiac myocyte', explain: 'It also stimulates beta-1 receptors on heart muscle, less strongly. It has almost no beta-2 effect, so it does not dilate muscle beds.' },
    { id: 'gq', kind: 'transducer', label: 'Gq → PLC', explain: 'Alpha-1 couples to Gq, which switches on phospholipase C.' },
    { id: 'gs', kind: 'transducer', label: 'Gs → adenylyl cyclase', explain: 'Beta-1 couples to Gs, which switches on adenylyl cyclase.' },
    { id: 'ip3', kind: 'messenger', label: 'IP₃ + DAG', sub: 'Ca²⁺ release from SR', explain: 'Phospholipase C makes IP3, which releases calcium from the sarcoplasmic reticulum.' },
    { id: 'camp', kind: 'messenger', label: 'cAMP → PKA', explain: 'Adenylyl cyclase makes cyclic AMP, which activates protein kinase A.' },
    { id: 'mlck', kind: 'enzyme', label: 'Ca²⁺–calmodulin → MLCK', explain: 'In smooth muscle, calcium–calmodulin activates myosin light-chain kinase and the muscle contracts.' },
    { id: 'ltype', kind: 'channel', label: 'L-type Ca²⁺ channel ↑', sub: 'faster SR cycling', explain: 'In the heart, protein kinase A opens more L-type calcium channels and speeds calcium cycling.' },
    { id: 'art', kind: 'organ', label: 'Arteriolar constriction', explain: 'Arterioles narrow, raising systemic vascular resistance.' },
    { id: 'ven', kind: 'organ', label: 'Venoconstriction', sub: 'stressed volume ↑', explain: 'Veins stiffen too, shifting blood from unstressed to stressed volume, which supports venous return.' },
    { id: 'ino', kind: 'cell', label: 'Contractility ↑', explain: 'Each beat is stronger.' },
    { id: 'chrono', kind: 'cell', label: 'SA node rate ↑', explain: 'The sinus node would speed up…' },
    { id: 'svr', kind: 'vital', label: 'SVR ↑' },
    { id: 'co', kind: 'vital', label: 'Cardiac output ~', sub: 'preload ↑, afterload ↑' },
    { id: 'baro', kind: 'organ', label: 'Baroreflex', sub: 'vagal tone ↑', explain: '…but the rising pressure triggers the baroreflex, so the heart rate barely changes, or even falls.' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ≈' },
    { id: 'map', kind: 'vital', label: 'MAP ↑', explain: 'The net result is a higher mean arterial pressure, mainly from resistance, with cardiac output roughly maintained.' },
  ],
  edges: [
    { from: 'ne', to: 'a1', sign: 1 }, { from: 'ne', to: 'b1', sign: 1 },
    { from: 'a1', to: 'gq', sign: 1 }, { from: 'b1', to: 'gs', sign: 1 },
    { from: 'gq', to: 'ip3', sign: 1 }, { from: 'gs', to: 'camp', sign: 1 },
    { from: 'ip3', to: 'mlck', sign: 1 }, { from: 'camp', to: 'ltype', sign: 1 },
    { from: 'mlck', to: 'art', sign: 1 }, { from: 'mlck', to: 'ven', sign: 1 },
    { from: 'ltype', to: 'ino', sign: 1 }, { from: 'camp', to: 'chrono', sign: 1 },
    { from: 'art', to: 'svr', sign: 1 }, { from: 'ven', to: 'co', sign: 1, label: 'preload' }, { from: 'ino', to: 'co', sign: 1 },
    { from: 'svr', to: 'co', sign: -1, label: 'afterload' },
    { from: 'svr', to: 'baro', sign: 1 }, { from: 'baro', to: 'hr', sign: -1 }, { from: 'chrono', to: 'hr', sign: 1 },
    { from: 'svr', to: 'map', sign: 1 }, { from: 'co', to: 'map', sign: 1 },
  ],
  patient: noreAdapter('sepsis', 0.08),
  summary: 'Watch the numbers: at a modest dose the resistance climbs, the mean pressure recovers past sixty-five, and the heart rate stays about the same. That profile, pressure mostly from resistance with output preserved, is why norepinephrine is the first-line vasopressor in septic shock. Too much raises afterload, lowers output and starves the gut and limbs, so titrate to a mean pressure target, usually sixty-five.',
};
