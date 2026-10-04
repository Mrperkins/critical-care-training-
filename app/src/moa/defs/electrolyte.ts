/** Hyperkalaemia drugs on the labs bench. Original teaching text. */
import type { MechanismDefinition } from '../types';
import { electrolyteAdapter } from '../benchAdapter';

export const CALCIUM: MechanismDefinition = {
  id: 'calcium', drug: 'Calcium gluconate', drugClass: 'Membrane stabiliser (hyperkalaemia)',
  blurb: 'Potassium 7.8 with a widening QRS. Calcium is given first — and potassium does not change.',
  nodes: [
    { id: 'ca', kind: 'drug', label: 'Calcium gluconate / chloride', sub: 'IV over minutes', explain: 'Intravenous calcium raises the ionised calcium outside the cells.' },
    { id: 'surf', kind: 'receptor', label: 'Outer membrane charge', sub: 'surface-charge screening', explain: 'Calcium ions crowd the negative charges on the outer face of the membrane.' },
    { id: 'nav', kind: 'channel', label: 'Nav1.5 voltage sensors', sub: 'need more depolarisation', target: 'membrane.nav', explain: 'The sodium channel voltage sensors now need a larger depolarisation before they open.' },
    { id: 'thr', kind: 'cell', label: 'Threshold potential ↑', sub: 'less negative', explain: 'So the threshold potential moves up, away from the raised resting potential.' },
    { id: 'gap', kind: 'cell', label: 'Gap to threshold restored' },
    { id: 'k', kind: 'vital', label: 'Plasma K⁺ unchanged', explain: 'Potassium itself does not change at all.' },
    { id: 'ecg', kind: 'vital', label: 'QRS narrows', explain: 'The gap between rest and threshold is restored, conduction recovers and the QRS narrows within minutes.' },
  ],
  edges: [
    { from: 'ca', to: 'surf', sign: 1 }, { from: 'surf', to: 'nav', sign: 1 }, { from: 'nav', to: 'thr', sign: 1 }, { from: 'thr', to: 'gap', sign: 1 },
    { from: 'gap', to: 'ecg', sign: 1 }, { from: 'ca', to: 'k', sign: 1, label: 'no effect', effect: 'none' },
  ],
  patient: electrolyteAdapter({ scenario: 'hyperkalaemia 7.8', k: 7.8, drug: 'calcium', minutes: 5 }),
  summary: 'Calcium protects the heart while you treat the potassium. The effect lasts roughly thirty to sixty minutes and may need repeating. It buys time and does nothing to the potassium level.',
};

export const INSULIN: MechanismDefinition = {
  id: 'insulin', drug: 'Insulin + dextrose', drugClass: 'Potassium shift into cells',
  blurb: 'Potassium 7.4 after calcium. Insulin with dextrose is given to move potassium into the cells.',
  nodes: [
    { id: 'ins', kind: 'drug', label: 'Regular insulin IV', sub: 'with dextrose', explain: 'Insulin is given intravenously, with dextrose to prevent hypoglycaemia.' },
    { id: 'ir', kind: 'receptor', label: 'Insulin receptor', sub: 'tyrosine kinase', explain: 'It binds the insulin receptor, a tyrosine kinase, mainly on muscle and liver cells.' },
    { id: 'pi3k', kind: 'transducer', label: 'IRS → PI3K → Akt', explain: 'That signals through PI3 kinase and Akt.' },
    { id: 'pump', kind: 'enzyme', label: 'Na⁺/K⁺-ATPase activity ↑', target: 'membrane.nak_atpase', explain: 'The sodium potassium pump speeds up, pulling potassium into the cells.' },
    { id: 'glut', kind: 'cell', label: 'GLUT4 → glucose uptake', explain: 'Glucose enters too, so blood glucose falls. Check it for hours.' },
    { id: 'kin', kind: 'cell', label: 'K⁺ moves into cells' },
    { id: 'k', kind: 'vital', label: 'Plasma K⁺ ↓ (~1)', explain: 'Plasma potassium falls by about one within the hour. Total-body potassium is unchanged, so it will drift back as the insulin wears off.' },
    { id: 'glu', kind: 'vital', label: 'Glucose ↓ — give dextrose' },
  ],
  edges: [
    { from: 'ins', to: 'ir', sign: 1 }, { from: 'ir', to: 'pi3k', sign: 1 }, { from: 'pi3k', to: 'pump', sign: 1 }, { from: 'pi3k', to: 'glut', sign: 1 },
    { from: 'pump', to: 'kin', sign: 1 }, { from: 'kin', to: 'k', sign: -1 }, { from: 'glut', to: 'glu', sign: -1 },
  ],
  patient: electrolyteAdapter({ scenario: 'hyperkalaemia 7.4', k: 7.4, drug: 'insulin', minutes: 60 }),
  summary: 'Insulin buys hours, not a cure. Salbutamol adds to it through beta-2 receptors on the same pump. Only removal — binders, diuretics or dialysis — lowers total-body potassium.',
};
