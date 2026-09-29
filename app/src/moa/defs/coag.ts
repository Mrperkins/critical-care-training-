/**
 * Haemostasis drugs. This app has no coagulation engine yet, so these are mechanism graphs only, with a
 * clearly shown note instead of an invented patient response. Original teaching text.
 */
import type { MechanismDefinition } from '../types';

const NOTE = 'No coagulation model in this app yet — mechanism only. Patient response (INR, clot strength, bleeding) will come from a shared coagulation engine, not from this drug card.';

export const TXA: MechanismDefinition = {
  id: 'txa', drug: 'Tranexamic acid', drugClass: 'Antifibrinolytic (lysine analogue)',
  blurb: 'Traumatic haemorrhage within three hours of injury. Tranexamic acid is given with blood.',
  nodes: [
    { id: 'txa', kind: 'drug', label: 'Tranexamic acid', sub: '1 g IV, then 1 g over 8 h', explain: 'Tranexamic acid is a lysine analogue.' },
    { id: 'lbs', kind: 'receptor', label: 'Lysine-binding sites', sub: 'on plasminogen', explain: 'It occupies the lysine-binding sites plasminogen uses to attach to fibrin.' },
    { id: 'plg', kind: 'enzyme', label: 'Plasminogen on fibrin ↓' },
    { id: 'pl', kind: 'enzyme', label: 'Plasmin on the clot ↓' },
    { id: 'lys', kind: 'cell', label: 'Fibrinolysis ↓', explain: 'Clots that have formed are broken down more slowly.' },
    { id: 'clot', kind: 'organ', label: 'Clot stability ↑' },
    { id: 'bleed', kind: 'vital', label: 'Bleeding ↓ (early)', explain: 'Given early it reduces death from bleeding; given late after trauma it does not help and may harm.' },
    { id: 'form', kind: 'cell', label: 'Clot formation', sub: 'thrombin — not increased' },
  ],
  edges: [
    { from: 'txa', to: 'lbs', sign: -1 }, { from: 'lbs', to: 'plg', sign: 1 }, { from: 'plg', to: 'pl', sign: 1 }, { from: 'pl', to: 'lys', sign: 1 }, { from: 'lys', to: 'clot', sign: -1 },
    { from: 'clot', to: 'bleed', sign: -1 }, { from: 'txa', to: 'form', sign: 1, effect: 'none' },
  ],
  patientNote: NOTE,
  summary: 'It stops clots being dissolved; it does not make clots form. Timing matters. High doses can cause seizures.',
};

export const PCC: MechanismDefinition = {
  id: 'pcc', drug: '4-factor PCC', drugClass: 'Prothrombin complex concentrate (factors II, VII, IX, X)',
  blurb: 'Warfarin-associated intracranial haemorrhage, INR 3.4. Four-factor PCC and IV vitamin K are given.',
  nodes: [
    { id: 'pcc', kind: 'drug', label: '4F-PCC', sub: 'dose by weight and INR', explain: 'The concentrate contains the four vitamin-K-dependent clotting factors, already made and carboxylated.' },
    { id: 'f', kind: 'enzyme', label: 'Factors II · VII · IX · X replaced', explain: 'Warfarin left these factors low or non-functional. PCC replaces them directly, within minutes.' },
    { id: 'pcs', kind: 'enzyme', label: 'Proteins C and S', sub: 'also in the concentrate' },
    { id: 'thr', kind: 'messenger', label: 'Thrombin generation ↑' },
    { id: 'inr', kind: 'vital', label: 'INR ↓ (minutes)' },
    { id: 'clot', kind: 'organ', label: 'Haemostasis restored' },
    { id: 'vk', kind: 'drug', label: 'IV vitamin K (with it)', explain: 'Factor VII lasts only hours, so vitamin K is given at the same time for the liver to make its own factors.' },
    { id: 'thromb', kind: 'organ', label: 'Thrombosis risk' },
  ],
  edges: [
    { from: 'pcc', to: 'f', sign: 1 }, { from: 'pcc', to: 'pcs', sign: 1 }, { from: 'f', to: 'thr', sign: 1 }, { from: 'thr', to: 'inr', sign: -1 }, { from: 'thr', to: 'clot', sign: 1 },
    { from: 'vk', to: 'f', sign: 1 }, { from: 'thr', to: 'thromb', sign: 1 },
  ],
  patientNote: NOTE,
  summary: 'Immediate replacement of the vitamin-K-dependent factors, sustained by giving vitamin K at the same time.',
};

export const VITAMIN_K: MechanismDefinition = {
  id: 'vitamink', drug: 'Vitamin K (phytonadione)', drugClass: 'Cofactor for γ-carboxylation',
  blurb: 'A supratherapeutic INR on warfarin. Vitamin K is given — and the INR takes hours to respond.',
  nodes: [
    { id: 'vk', kind: 'drug', label: 'Vitamin K', sub: 'IV or oral', explain: 'Vitamin K is the cofactor the liver needs to finish making clotting factors II, VII, IX and X.' },
    { id: 'warf', kind: 'drug', label: 'Warfarin', sub: 'blocks VKOR' },
    { id: 'vkor', kind: 'enzyme', label: 'Vitamin K epoxide reductase (VKOR)', explain: 'Warfarin blocks the enzyme that recycles vitamin K. Enough fresh vitamin K bypasses the block.' },
    { id: 'ggcx', kind: 'enzyme', label: 'γ-glutamyl carboxylase', sub: 'liver' },
    { id: 'gla', kind: 'cell', label: 'Carboxylated (Gla) factors', explain: 'Carboxylated factors can bind calcium and phospholipid membranes — without that they do nothing.' },
    { id: 'thr', kind: 'messenger', label: 'Thrombin generation ↑' },
    { id: 'inr', kind: 'vital', label: 'INR ↓ over 6–24 h', explain: 'New factors have to be made, so the INR falls over hours, not minutes. That is why bleeding needs PCC as well.' },
  ],
  edges: [
    { from: 'warf', to: 'vkor', sign: -1 }, { from: 'vk', to: 'ggcx', sign: 1 }, { from: 'vkor', to: 'ggcx', sign: 1 }, { from: 'ggcx', to: 'gla', sign: 1 }, { from: 'gla', to: 'thr', sign: 1 }, { from: 'thr', to: 'inr', sign: -1 },
  ],
  patientNote: NOTE,
  summary: 'Vitamin K lets the liver make working factors again, so the effect is delayed by hours. IV is faster than oral; give it slowly.',
};

export const PROTAMINE: MechanismDefinition = {
  id: 'protamine', drug: 'Protamine', drugClass: 'Heparin antagonist (cationic protein)',
  blurb: 'Bleeding after a heparin infusion, or reversal after bypass. Protamine is given slowly.',
  nodes: [
    { id: 'pro', kind: 'drug', label: 'Protamine', sub: '1 mg per ~100 units recent heparin', explain: 'Protamine is a strongly positive protein.' },
    { id: 'hep', kind: 'drug', label: 'Unfractionated heparin', sub: 'strongly negative' },
    { id: 'cx', kind: 'messenger', label: 'Protamine–heparin complex', explain: 'It binds the negatively charged heparin chains in a stable, inactive complex.' },
    { id: 'at', kind: 'enzyme', label: 'Antithrombin no longer boosted', explain: 'Heparin works by accelerating antithrombin. Bound heparin cannot do that, so thrombin and factor Xa are free to work again.' },
    { id: 'coag', kind: 'cell', label: 'Thrombin / Xa activity restored' },
    { id: 'aptt', kind: 'vital', label: 'aPTT / ACT ↓' },
    { id: 'lmwh', kind: 'organ', label: 'LMWH: partial reversal only' },
    { id: 'adv', kind: 'organ', label: 'Hypotension · anaphylaxis · pulmonary hypertension', sub: 'give slowly' },
  ],
  edges: [
    { from: 'pro', to: 'cx', sign: 1 }, { from: 'hep', to: 'cx', sign: 1 }, { from: 'cx', to: 'at', sign: -1 }, { from: 'at', to: 'coag', sign: -1 }, { from: 'coag', to: 'aptt', sign: -1 },
    { from: 'cx', to: 'lmwh', sign: 1 }, { from: 'pro', to: 'adv', sign: 1 },
  ],
  patientNote: NOTE,
  summary: 'A charge-based antidote: it neutralises unfractionated heparin completely and low-molecular-weight heparin only partly. Too much protamine is itself anticoagulant; fast injection causes hypotension.',
};
