/**
 * Live bedside reasoning for the ventilator: turns the current mechanics numbers into the
 * explanations a senior clinician would give. Pure function of measured values.
 */
import type { VentSettings } from '../physiology/mechanics';
import type { Recent } from '../scenarios/dyssynchrony';

export interface VentNumbers {
  pip: number; pplat: number; pplatMeasured: boolean; peep: number; peepTot: number; autoPeep: number; dp: number;
  cstat: number; cdyn: number; raw: number | null; tau: number; vte: number; vtPerKg: number; rr: number; mv: number; ie: string; pmean: number;
  spo2: number; etco2: number; pH: number; paco2: number; pao2: number; map: number; fio2: number; pf: number;
  overdist: number; openFrac: number; te: number;
}
export interface Finding { level: 'ok' | 'info' | 'warn' | 'bad'; title: string; text: string; key: string }

export function explainVent(n: VentNumbers, s: VentSettings, r: Recent, patientActive: boolean): Finding[] {
  const F: Finding[] = [];
  const res = n.pip - n.pplat;
  // equation of motion — always first
  F.push({ key: 'eom', level: 'info', title: 'Where the pressure goes', text: `Peak ${n.pip.toFixed(0)} = resistance ${res.toFixed(0)} (R·V̇) + elastic ${n.dp.toFixed(0)} (Vt/C) + PEEP ${n.peepTot.toFixed(0)}${n.autoPeep > 1 ? ` (incl. ${n.autoPeep.toFixed(0)} auto-PEEP)` : ''}.` });
  if (res > 10) F.push({ key: 'raw', level: 'warn', title: 'High airway resistance', text: `PIP − Pplat = ${res.toFixed(0)} cmH₂O. The pressure is being spent pushing gas through narrow airways (tube, secretions, bronchospasm) — not stretching the lung. Suction, bronchodilate, check the tube.` });
  if (n.pplat > 30) F.push({ key: 'pplat', level: 'bad', title: 'Plateau pressure > 30', text: `Pplat ${n.pplat.toFixed(0)}: alveoli are exposed to injurious stretch. Reduce Vt (target 6 mL/kg PBW). If the chest wall is stiff (obesity, abdomen), a higher Pplat may be tolerated — transpulmonary pressure is what injures.` });
  if (n.dp > 15) F.push({ key: 'dp', level: 'bad', title: `Driving pressure ${n.dp.toFixed(0)} (> 15)`, text: 'ΔP = Vt / Crs — how big the breath is relative to the lung that is open. Lower Vt, or recruit more lung with PEEP so the same Vt goes into more alveoli.' });
  if (n.vtPerKg > 8.2) F.push({ key: 'vt', level: 'warn', title: `Vt ${n.vtPerKg.toFixed(1)} mL/kg PBW`, text: 'Lung-protective ventilation uses 6–8 mL/kg of predicted body weight (height and sex, not actual weight).' });
  if (n.autoPeep > 2 || r.flowNotZero > 2) F.push({ key: 'auto', level: 'warn', title: 'Air trapping (auto-PEEP)', text: `Expiratory flow has not returned to zero when the next breath starts${n.autoPeep > 1 ? ` — about ${n.autoPeep.toFixed(0)} cmH₂O trapped` : ''}. Exhalation needs ≈ 3τ = ${(3 * n.tau).toFixed(1)} s; it gets ${n.te.toFixed(1)} s. Lower RR, shorten Ti, lower Vt, bronchodilate. Confirm with an expiratory hold.` });
  if (n.overdist > 0.5) F.push({ key: 'over', level: 'warn', title: 'Overdistension', text: 'The non-dependent (anterior) lung is being over-stretched: the P–V loop flattens at the top ("beak"). Less Vt or less PEEP.' });
  if (n.openFrac < 0.8) F.push({ key: 'atel', level: 'warn', title: `${Math.round((1 - n.openFrac) * 100)} % of the lung is collapsed`, text: 'Dependent (posterior) alveoli are airless: blood flowing past them is not oxygenated (shunt). PEEP holds them open once they are recruited.' });
  if (patientActive) {
    if (r.scoop > 5) F.push({ key: 'fs', level: 'bad', title: 'Flow starvation', text: 'The pressure curve is scooped — the patient wants more flow than the vent is giving. Raise flow or use a pressure-targeted mode.' });
    if (r.ineffectivePerMin > 3) F.push({ key: 'ie', level: 'bad', title: `Ineffective efforts (${r.ineffectivePerMin.toFixed(0)}/min)`, text: 'Efforts are visible in the expiratory flow but do not trigger a breath. Reduce trapping and make the trigger more sensitive.' });
    if (r.doubleTrigger > 0) F.push({ key: 'dt', level: 'bad', title: 'Double triggering', text: 'Two breaths inside one patient effort — inspiration ends before the patient finishes. Lengthen Ti / lower flow, or let the patient set Ti.' });
    if (r.stacked > 0) F.push({ key: 'st', level: 'bad', title: 'Breath stacking', text: 'The second breath lands on top of the first: the lung receives almost double the set tidal volume.' });
    if (r.prematureCycle > 1) F.push({ key: 'pc', level: 'warn', title: 'Premature cycling', text: 'The vent cycles off while the patient is still inhaling. Lower the cycle-off %.' });
    if (r.delayedCycle > 1) F.push({ key: 'dc', level: 'warn', title: 'Delayed cycling', text: 'The vent keeps inflating after the patient has finished — they push against it. Raise the cycle-off % or lower PS.' });
  }
  // gas exchange
  if (n.spo2 < 0.88) F.push({ key: 'o2', level: 'bad', title: `SpO₂ ${Math.round(n.spo2 * 100)} %`, text: n.openFrac < 0.85 ? 'Hypoxaemia from shunt through collapsed lung: FiO₂ alone helps little — recruit with PEEP.' : 'Raise FiO₂; look for the cause (V/Q mismatch, shunt, low cardiac output).' });
  else if (n.fio2 >= 0.6 && n.spo2 > 0.97) F.push({ key: 'o2hi', level: 'info', title: 'Room to wean oxygen', text: `SpO₂ ${Math.round(n.spo2 * 100)} % on FiO₂ ${n.fio2.toFixed(2)} — hyperoxia has no benefit. Wean toward SpO₂ 92–96 %.` });
  if (n.pH < 7.25 && n.paco2 > 50) F.push({ key: 'co2', level: 'warn', title: `Respiratory acidosis (pH ${n.pH.toFixed(2)})`, text: `PaCO₂ ${n.paco2.toFixed(0)}. Alveolar ventilation = (Vt − dead space) × RR. Increase RR — unless air trapping says the lung needs more time to empty.` });
  if (n.map < 60) F.push({ key: 'map', level: 'bad', title: `MAP ${n.map.toFixed(0)}`, text: 'Positive intrathoracic pressure (PEEP, auto-PEEP, tension) impedes venous return. Check for trapping or tension before giving more PEEP.' });
  if (F.length === 1) F.push({ key: 'fine', level: 'ok', title: 'Nothing unsafe right now', text: 'Pressures, volumes and timing are within lung-protective limits.' });
  return F;
}
