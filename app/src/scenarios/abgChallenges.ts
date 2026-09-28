/** Blood-gas challenge data: what to do for each preset, and how the model applies it. */
import type { AbgLab } from '../abg/lab';

export interface AbgAction { options: string[]; answer: number; explain: string; apply: (l: AbgLab) => void; ffMin: number }
export const ABG_ACTIONS: Record<string, AbgAction> = {
  opioid: { options: ['Naloxone and support ventilation (bag–valve–mask)', 'Sodium bicarbonate', 'High-flow oxygen alone and observe', 'IV fluid bolus'], answer: 0, ffMin: 20,
    explain: 'The problem is ventilation. Naloxone restores drive; bag–mask ventilation bridges. Oxygen alone would raise SpO₂ while CO₂ keeps climbing.', apply: (l) => l.give('naloxone') },
  dka: { options: ['IV fluids, then insulin infusion once K⁺ is known', 'Sodium bicarbonate', 'Intubate to control the CO₂', 'Furosemide'], answer: 0, ffMin: 360,
    explain: 'Fluids restore perfusion; insulin switches off ketogenesis so the ketoanions are metabolised back to bicarbonate. Intubating a Kussmaul patient removes their compensation and can be lethal.', apply: (l) => { l.give('fluids'); l.give('insulin'); l.pt.p.ketoneProd = 0.15; } },
  asthma: { options: ['Bronchodilators, steroids, magnesium — and prepare for NIV/intubation', 'Sedate for comfort', 'Sodium bicarbonate', 'Reassure — the CO₂ is only mildly raised'], answer: 0, ffMin: 45,
    explain: 'A rising CO₂ in severe asthma means the patient is tiring. Bronchodilation lowers dead space and V/Q mismatch and restores ventilatory capacity.', apply: (l) => { l.pt.p.lowVQ = 0.12; l.pt.p.vdAlv = 0.12; l.pt.p.maxVE = 40; } },
  sepsis: { options: ['Fluids, antibiotics, vasopressors — restore perfusion; repeat lactate', 'Bicarbonate to correct the pH', 'Intubate to lower the CO₂', 'Diuretic'], answer: 0, ffMin: 240,
    explain: 'Lactate clears when perfusion and liver blood flow recover and the adrenergic drive settles. Bicarbonate treats a number, not the cause.', apply: (l) => { l.pt.p.co = 7; l.pt.p.svr = 950; l.pt.p.lactateProd = 1.3; l.pt.p.hepatic = 0.95; l.pt.p.drive = 1.1; } },
  edema: { options: ['CPAP/NIV, nitrates, diuretic', 'IV fluid bolus', 'Sodium bicarbonate', 'Naloxone'], answer: 0, ffMin: 45,
    explain: 'Positive pressure re-opens flooded alveoli (less shunt) and unloads the left ventricle; nitrates and diuretics reduce the hydrostatic pressure that caused the oedema.', apply: (l) => { l.pt.p.shunt = 0.07; l.pt.p.lowVQ = 0.1; l.pt.p.co = 4.4; l.pt.p.drive = 1.15; } },
  copd: { options: ['No acute change: compensated chronic retention — controlled O₂ to SpO₂ 88–92 %', 'Intubate', 'Sodium bicarbonate', 'Naloxone'], answer: 0, ffMin: 30,
    explain: 'pH is near normal because the kidneys have compensated over days. Treat the patient, not the PaCO₂; excess oxygen can worsen hypercapnia.', apply: (l) => l.set('fio2', 0.28) },
  salicylate: { options: ['Alkalinise the urine with bicarbonate; dialysis if severe; avoid intubation if possible', 'Sedate and intubate to rest them', 'Naloxone', 'Fluids only'], answer: 0, ffMin: 180,
    explain: 'Alkalinisation traps salicylate in the urine (and keeps it out of the brain). If intubation is unavoidable, the minute ventilation must stay very high.', apply: (l) => { l.give('bicarb'); l.give('bicarb'); l.pt.p.otherUA = 6; l.pt.p.drive = 1.6; } },
  arrest: { options: ['Improve CPR quality — EtCO₂ guides compressions; ventilate 10/min', 'Routine sodium bicarbonate', 'Hyperventilate at 30/min', 'Stop — the EtCO₂ is too low'], answer: 0, ffMin: 5,
    explain: 'During CPR, EtCO₂ tracks cardiac output. Better compressions raise flow and EtCO₂; hyperventilation raises intrathoracic pressure and lowers coronary perfusion.', apply: (l) => l.set('co', 2.0) },
  rosc: { options: ['Ventilate to normocapnia; titrate FiO₂ to SpO₂ 92–98 %', 'Keep FiO₂ 1.0', 'Hyperventilate to a PaCO₂ of 25', 'Routine bicarbonate'], answer: 0, ffMin: 60,
    explain: 'After ROSC avoid both hypoxaemia and hyperoxia, and aim for normocapnia — hypocapnia constricts cerebral vessels.', apply: (l) => { l.set('fio2', 0.4); l.setVent(16, 0.5); } },
};
