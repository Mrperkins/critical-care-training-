/** Induction, sedation, analgesia and paralysis drugs. Original teaching text; demo effect sizes are teaching values. */
import type { MechanismDefinition } from '../types';
import { hemoAdapter } from '../linesAdapter';
import { kRiseAdapter } from '../benchAdapter';

export const ETOMIDATE: MechanismDefinition = {
  id: 'etomidate', drug: 'Etomidate', drugClass: 'GABA-A positive modulator (induction agent)',
  blurb: 'Rapid-sequence intubation in a patient whose blood pressure is borderline. Etomidate is chosen for induction.',
  selectivity: [{ receptor: 'GABA-A (β2/β3)', activity: 1 }, { receptor: '11β-hydroxylase', activity: 0.7 }, { receptor: 'Adrenergic', activity: 0 }],
  nodes: [
    { id: 'eto', kind: 'drug', label: 'Etomidate', sub: '0.3 mg/kg IV', explain: 'Etomidate makes GABA-A receptors open more readily in response to GABA.' },
    { id: 'gaba', kind: 'receptor', label: 'GABA-A receptor', sub: 'β2/β3 subunits' },
    { id: 'cl', kind: 'channel', label: 'Cl⁻ influx ↑ → hyperpolarisation', explain: 'Chloride flows in and neurons are held further from threshold: rapid loss of consciousness.' },
    { id: 'hyp', kind: 'organ', label: 'Hypnosis within a circulation time' },
    { id: 'noan', kind: 'cell', label: 'No analgesia', explain: 'It provides no analgesia — laryngoscopy still hurts and still drives the sympathetic response.' },
    { id: 'hemo', kind: 'vital', label: 'SVR and contractility — little change', explain: 'It has little effect on vascular tone or contractility, which is why it is used when pressure is borderline.' },
    { id: 'cyp', kind: 'enzyme', label: '11β-hydroxylase inhibited', sub: 'adrenal cortex', explain: 'It also inhibits 11-beta-hydroxylase, suppressing cortisol production for many hours after a single dose.' },
    { id: 'cort', kind: 'vital', label: 'Cortisol ↓', sub: 'clinical impact in sepsis debated' },
    { id: 'myo', kind: 'cell', label: 'Myoclonus', sub: 'common, not seizure' },
  ],
  edges: [
    { from: 'eto', to: 'gaba', sign: 1 }, { from: 'gaba', to: 'cl', sign: 1 }, { from: 'cl', to: 'hyp', sign: 1 }, { from: 'eto', to: 'noan', sign: 1, effect: 'none' },
    { from: 'eto', to: 'hemo', sign: 1, effect: 'none' }, { from: 'eto', to: 'cyp', sign: -1 }, { from: 'cyp', to: 'cort', sign: 1 }, { from: 'gaba', to: 'myo', sign: 1 },
  ],
  patient: hemoAdapter({ scenario: 'sepsis', svr: -0.03, co: -0.02, dose: (u) => (u <= 0 ? 'before induction' : '0.3 mg/kg') }),
  summary: 'Hypnosis with haemodynamic stability, no analgesia, and transient adrenal suppression. The laryngoscopy and positive-pressure ventilation that follow still move the pressure.',
};

export const PROPOFOL: MechanismDefinition = {
  id: 'propofol', drug: 'Propofol', drugClass: 'GABA-A positive modulator (sedation / induction)',
  blurb: 'Sedation for a ventilated patient, or induction. The same dose in two different patients.',
  selectivity: [{ receptor: 'GABA-A', activity: 1 }, { receptor: 'Sympathetic tone', activity: 0.7 }, { receptor: 'Myocardium', activity: 0.3 }],
  nodes: [
    { id: 'pro', kind: 'drug', label: 'Propofol', sub: 'lipid emulsion', explain: 'Propofol potentiates GABA-A receptors: fast onset, fast offset, and a smooth sedation.' },
    { id: 'gaba', kind: 'receptor', label: 'GABA-A receptor' },
    { id: 'cl', kind: 'channel', label: 'Cl⁻ influx ↑' },
    { id: 'hyp', kind: 'organ', label: 'Hypnosis · amnesia', sub: 'no analgesia' },
    { id: 'symp', kind: 'organ', label: 'Sympathetic outflow ↓', explain: 'It lowers sympathetic tone centrally…' },
    { id: 'vd', kind: 'organ', label: 'Arterial + venous dilation', explain: '…and relaxes vascular smooth muscle directly, arterial and venous.' },
    { id: 'myo', kind: 'cell', label: 'Contractility ↓ (mild)' },
    { id: 'resp', kind: 'organ', label: 'Respiratory drive ↓', sub: 'apnoea at induction doses' },
    { id: 'svr', kind: 'vital', label: 'SVR ↓' }, { id: 'co', kind: 'vital', label: 'Cardiac output ↓' },
    { id: 'map', kind: 'vital', label: 'MAP ↓', explain: 'The pressure falls — modestly in a well-filled patient, sharply in one who is hypovolaemic or relying on sympathetic tone.' },
  ],
  edges: [
    { from: 'pro', to: 'gaba', sign: 1 }, { from: 'gaba', to: 'cl', sign: 1 }, { from: 'cl', to: 'hyp', sign: 1 }, { from: 'cl', to: 'symp', sign: -1 }, { from: 'cl', to: 'resp', sign: -1 },
    { from: 'pro', to: 'vd', sign: 1 }, { from: 'pro', to: 'myo', sign: -1 }, { from: 'symp', to: 'svr', sign: 1 }, { from: 'vd', to: 'svr', sign: -1 },
    { from: 'myo', to: 'co', sign: 1 }, { from: 'svr', to: 'map', sign: 1 }, { from: 'co', to: 'map', sign: 1 },
  ],
  contexts: [
    { id: 'normal', label: 'Well-filled, normal heart', note: 'A modest fall in pressure.', patient: hemoAdapter({ scenario: 'normal', svr: -0.22, co: -0.1, hr: -0.02, dose: (u) => `${Math.round(2 * u * 10) / 10} mg/kg` }) },
    { id: 'hypo', label: 'Hypovolaemic, sympathetically driven', note: 'The tone that was holding the pressure up is removed: a much bigger fall.', patient: hemoAdapter({ scenario: 'hypovol', svr: -0.38, co: -0.2, hr: -0.03, dose: (u) => `${Math.round(2 * u * 10) / 10} mg/kg` }) },
  ],
  summary: 'GABA-A hypnosis with vasodilation, sympatholysis and respiratory depression. No analgesia. Prolonged high doses risk propofol-infusion syndrome; count the lipid calories.',
};

export const MIDAZOLAM: MechanismDefinition = {
  id: 'midazolam', drug: 'Midazolam', drugClass: 'Benzodiazepine (GABA-A, benzodiazepine site)',
  blurb: 'Seizures, agitation or sedation. Midazolam is given.',
  selectivity: [{ receptor: 'GABA-A (α/γ2 site)', activity: 1 }],
  nodes: [
    { id: 'mid', kind: 'drug', label: 'Midazolam', explain: 'Midazolam binds the benzodiazepine site between the alpha and gamma-2 subunits of the GABA-A receptor.' },
    { id: 'gaba', kind: 'receptor', label: 'GABA-A receptor', sub: 'benzodiazepine site' },
    { id: 'freq', kind: 'channel', label: 'Cl⁻ channel opening frequency ↑', explain: 'It does not open the channel by itself; it makes GABA open it more often.' },
    { id: 'hyp', kind: 'cell', label: 'Neuronal hyperpolarisation' },
    { id: 'eff', kind: 'organ', label: 'Anxiolysis · amnesia · sedation · anticonvulsant' },
    { id: 'resp', kind: 'organ', label: 'Respiratory depression', sub: 'synergy with opioids', explain: 'Alone it depresses breathing modestly; with an opioid the effect is multiplied.' },
    { id: 'map', kind: 'vital', label: 'BP ↓ (mild)' },
    { id: 'flu', kind: 'drug', label: 'Flumazenil', sub: 'competitive antagonist' },
  ],
  edges: [
    { from: 'mid', to: 'gaba', sign: 1 }, { from: 'flu', to: 'gaba', sign: -1 }, { from: 'gaba', to: 'freq', sign: 1 }, { from: 'freq', to: 'hyp', sign: 1 },
    { from: 'hyp', to: 'eff', sign: 1 }, { from: 'hyp', to: 'resp', sign: 1 }, { from: 'hyp', to: 'map', sign: -1 },
  ],
  patient: hemoAdapter({ scenario: 'normal', svr: -0.1, co: -0.05, dose: (u) => `${Math.round(5 * u)} mg` }),
  summary: 'More frequent chloride-channel opening, not direct opening — which is why benzodiazepines have a ceiling alone and not with opioids or alcohol. An active metabolite accumulates in renal failure.',
};

export const FENTANYL: MechanismDefinition = {
  id: 'fentanyl', drug: 'Fentanyl', drugClass: 'μ-opioid receptor agonist',
  blurb: 'Analgesia for a ventilated or injured patient. Fentanyl is given — and the patient’s state decides what happens to the pressure.',
  selectivity: [{ receptor: 'μ', activity: 1 }, { receptor: 'κ', activity: 0.05 }, { receptor: 'δ', activity: 0.05 }],
  nodes: [
    { id: 'fen', kind: 'drug', label: 'Fentanyl', explain: 'Fentanyl is a potent, lipid-soluble agonist at the mu-opioid receptor.' },
    { id: 'mu', kind: 'receptor', label: 'μ-opioid receptor' },
    { id: 'gi', kind: 'transducer', label: 'Gi/o → cAMP ↓', explain: 'The receptor couples to inhibitory G proteins: potassium channels open, calcium channels close and cyclic AMP falls.' },
    { id: 'ch', kind: 'channel', label: 'K⁺ out ↑ · Ca²⁺ in ↓', sub: 'less transmitter release' },
    { id: 'an', kind: 'organ', label: 'Analgesia', sub: 'spinal and supraspinal' },
    { id: 'rc', kind: 'organ', label: 'Brainstem CO₂ response ↓', explain: 'In the brainstem it blunts the response to carbon dioxide: slower, then absent, breathing.' },
    { id: 'vag', kind: 'organ', label: 'Vagal tone ↑' },
    { id: 'symp', kind: 'organ', label: 'Sympathetic drive ↓ (pain / stress removed)' },
    { id: 'rr', kind: 'vital', label: 'Respiratory rate ↓ · apnoea' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↓' }, { id: 'map', kind: 'vital', label: 'BP ↓ if tone was pain-driven' },
    { id: 'nal', kind: 'drug', label: 'Naloxone', sub: 'competitive antagonist' },
  ],
  edges: [
    { from: 'fen', to: 'mu', sign: 1 }, { from: 'nal', to: 'mu', sign: -1 }, { from: 'mu', to: 'gi', sign: 1 }, { from: 'gi', to: 'ch', sign: 1 },
    { from: 'ch', to: 'an', sign: 1 }, { from: 'ch', to: 'rc', sign: -1 }, { from: 'ch', to: 'vag', sign: 1 }, { from: 'an', to: 'symp', sign: -1 },
    { from: 'rc', to: 'rr', sign: 1 }, { from: 'vag', to: 'hr', sign: -1 }, { from: 'symp', to: 'map', sign: 1 }, { from: 'symp', to: 'hr', sign: 1 },
  ],
  contexts: [
    { id: 'calm', label: 'Comfortable, well-filled', note: 'Little change: a mild vagal slowing.', patient: hemoAdapter({ scenario: 'normal', hr: -0.1, svr: -0.04, dose: (u) => `${Math.round(100 * u)} µg` }) },
    { id: 'stress', label: 'Hypovolaemic, in pain', note: 'The pain-driven sympathetic tone that held the pressure is removed.', patient: hemoAdapter({ scenario: 'hypovol', hr: -0.12, svr: -0.2, co: -0.05, dose: (u) => `${Math.round(100 * u)} µg` }) },
  ],
  summary: 'Mu-receptor activation: analgesia, respiratory depression and vagal slowing; the blood pressure falls when it was being held up by pain and fear. Rapid large doses can stiffen the chest wall.',
};

export const DEXMEDETOMIDINE: MechanismDefinition = {
  id: 'dexmedetomidine', drug: 'Dexmedetomidine', drugClass: 'Selective α2 agonist',
  blurb: 'Light, rousable sedation for an agitated patient on or off the ventilator. Dexmedetomidine is started.',
  selectivity: [{ receptor: 'α2 (central)', activity: 1 }, { receptor: 'α2B (vascular)', activity: 0.4 }, { receptor: 'α1', activity: 0.006 }],
  nodes: [
    { id: 'dex', kind: 'drug', label: 'Dexmedetomidine', explain: 'Dexmedetomidine activates alpha-2 receptors with very high selectivity over alpha-1.' },
    { id: 'lc', kind: 'receptor', label: 'α2A · locus coeruleus', explain: 'In the locus coeruleus it reduces noradrenergic firing: a sleep-like, rousable sedation.' },
    { id: 'pre', kind: 'receptor', label: 'Presynaptic α2', sub: 'sympathetic terminals' },
    { id: 'gi', kind: 'transducer', label: 'Gi → cAMP ↓' },
    { id: 'sed', kind: 'organ', label: 'Rousable sedation · some analgesia' },
    { id: 'ne', kind: 'messenger', label: 'Norepinephrine release ↓' },
    { id: 'hr', kind: 'vital', label: 'Heart rate ↓' }, { id: 'map', kind: 'vital', label: 'BP ↓', sub: 'a fast bolus can transiently raise it (vascular α2B)' },
    { id: 'resp', kind: 'vital', label: 'Respiratory drive — little change', explain: 'Unlike opioids and GABA drugs, it barely depresses breathing.' },
  ],
  edges: [
    { from: 'dex', to: 'lc', sign: 1 }, { from: 'dex', to: 'pre', sign: 1 }, { from: 'lc', to: 'gi', sign: 1 }, { from: 'pre', to: 'gi', sign: 1 }, { from: 'gi', to: 'sed', sign: 1 },
    { from: 'gi', to: 'ne', sign: -1 }, { from: 'ne', to: 'hr', sign: 1 }, { from: 'ne', to: 'map', sign: 1 }, { from: 'dex', to: 'resp', sign: 1, effect: 'none' },
  ],
  patient: hemoAdapter({ scenario: 'normal', hr: -0.25, svr: -0.1, dose: (u) => `${(1 * u).toFixed(1)} µg/kg/h` }),
  summary: 'Sympatholysis from the brainstem down: calm, rousable, breathing preserved — and bradycardia and hypotension, especially with a loading dose.',
};

export const SUCCINYLCHOLINE: MechanismDefinition = {
  id: 'succinylcholine', drug: 'Succinylcholine', drugClass: 'Depolarising neuromuscular blocker',
  blurb: 'Rapid-sequence intubation. Succinylcholine is the paralytic — in two very different patients.',
  selectivity: [{ receptor: 'nAChR (end-plate)', activity: 1 }, { receptor: 'Extrajunctional nAChR', activity: 1 }, { receptor: 'Muscarinic (cardiac)', activity: 0.3 }],
  nodes: [
    { id: 'sux', kind: 'drug', label: 'Succinylcholine', sub: '1.5 mg/kg IV', explain: 'Succinylcholine is two acetylcholine molecules joined together. It activates the nicotinic receptor at the end-plate — and stays there.' },
    { id: 'nach', kind: 'receptor', label: 'Nicotinic ACh receptor', sub: 'end-plate', explain: 'The channel opens and the membrane depolarises, causing visible fasciculations.' },
    { id: 'dep', kind: 'channel', label: 'Sustained depolarisation', explain: 'Because it is not broken down by acetylcholinesterase, the end-plate stays depolarised.' },
    { id: 'nav', kind: 'channel', label: 'Na⁺ channels inactivated', explain: 'The surrounding sodium channels inactivate and cannot fire again: flaccid paralysis follows the fasciculations.' },
    { id: 'para', kind: 'organ', label: 'Fasciculation → flaccid paralysis', sub: 'no sedation' },
    { id: 'kout', kind: 'messenger', label: 'K⁺ efflux from muscle', explain: 'Every open channel lets potassium out. Normally plasma potassium rises by about half a millimole per litre. With up-regulated receptors all over the muscle — burns, denervation, crush, long immobility — it can rise several-fold.' },
    { id: 'k', kind: 'vital', label: 'Plasma K⁺ ↑' },
    { id: 'pche', kind: 'enzyme', label: 'Plasma cholinesterase', sub: 'ends the block in minutes' },
  ],
  edges: [
    { from: 'sux', to: 'nach', sign: 1 }, { from: 'nach', to: 'dep', sign: 1 }, { from: 'dep', to: 'nav', sign: 1 }, { from: 'nav', to: 'para', sign: 1 },
    { from: 'dep', to: 'kout', sign: 1 }, { from: 'kout', to: 'k', sign: 1 }, { from: 'sux', to: 'pche', sign: 1, label: 'hydrolysed by' }, { from: 'pche', to: 'para', sign: -1, label: 'ends the block' },
  ],
  contexts: [
    { id: 'normal', label: 'Healthy muscle', note: 'Potassium rises about 0.5.', patient: kRiseAdapter({ scenario: 'normal K 4.2', k0: 4.2, rise: 0.5, label: 'after 1.5 mg/kg' }) },
    { id: 'upreg', label: 'Burns > 48 h / denervation', note: 'Extrajunctional receptors everywhere: a dangerous potassium surge. Use rocuronium instead.', patient: kRiseAdapter({ scenario: 'burn day 5, K 4.2', k0: 4.2, rise: 3.6, label: 'after 1.5 mg/kg' }) },
  ],
  summary: 'Fast, short paralysis by depolarisation, with a potassium rise that is small in healthy muscle and life-threatening in up-regulated muscle. It is also a malignant-hyperthermia trigger, and repeat doses can slow the heart.',
};
