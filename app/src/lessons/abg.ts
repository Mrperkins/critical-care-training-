/** Narrated blood-gas lessons (data). Steps declare causes; the SyntheticPatient produces the numbers. */
import type { Station } from '../abg/abgStore';
import type { DrugId } from '../physiology/patient';

export interface AbgSetup {
  preset?: string; knobs?: Partial<Record<'fio2' | 'vco2' | 'vo2' | 'hb' | 'lowVQ' | 'shunt' | 'vdAlv' | 'co' | 'drive', number>>;
  vent?: { rr: number; vt: number } | 'own'; metab?: number; station?: Station; ff?: number; drug?: DrugId; sample?: 'abg' | 'vbg';
}
export interface AbgStep { id: string; title: string; say: string; setup?: AbgSetup }
export interface AbgLesson { id: string; title: string; level: string; blurb: string; steps: AbgStep[] }

export const ABG_LESSONS: AbgLesson[] = [
  {
    id: 'o2path', title: 'Oxygen: from air to mitochondria', level: 'Novice', blurb: 'Alveolar gas, loading in the capillary, delivery, extraction — and why anaemia does not lower SpO₂.',
    steps: [
      { id: 'ox1', title: 'Fresh gas in the alveolus', setup: { preset: 'normal', station: 'lung' },
        say: 'Room air is twenty one percent oxygen. By the time it is warmed, humidified and mixed with carbon dioxide in the alveoli, the alveolar oxygen pressure is about one hundred. The alveolar gas equation says it: FiO₂ times seven hundred and thirteen, minus PaCO₂ divided by zero point eight.' },
      { id: 'ox2', title: 'Blood arrives venous', setup: { station: 'alveolus' },
        say: 'Here is one alveolar sac and its capillary basket, drawn to scale. Blood arrives from the pulmonary artery dark, about seventy percent saturated. It spreads over the alveoli in a single layer of red cells, separated from the air by a barrier thinner than one micrometre. It leaves bright red, about ninety seven percent saturated, through the pulmonary venule.' },
      { id: 'ox3', title: 'Loading in the first third', setup: { station: 'capillary' },
        say: 'Zoom in to a single capillary. Red cells squeeze through one at a time. They take about three quarters of a second to cross, but they are fully loaded in the first third of that time. That reserve is why a healthy person can exercise without desaturating.' },
      { id: 'ox4', title: 'Delivery and extraction', setup: { station: 'tissue' },
        say: 'In the muscle, arterial blood gives up oxygen to the mitochondria and picks up carbon dioxide. Oxygen delivery is arterial content times cardiac output: about a thousand millilitres a minute. The tissues use about a quarter of it, so venous blood returns about seventy five percent saturated.' },
      { id: 'ox5', title: 'Anaemia: normal SpO₂, empty blood', setup: { knobs: { hb: 6.5 }, station: 'tissue', ff: 20 },
        say: 'Now drop the haemoglobin to six and a half. Look at the arterial gas: PaO₂ and saturation are unchanged, and the pulse oximeter still reads normal. But oxygen content has halved, because content is one point three four times haemoglobin times saturation, plus a tiny dissolved fraction. The tissues must extract more, so venous saturation falls. SpO₂ tells you how full each lorry is, not how many lorries there are.' },
    ],
  },
  {
    id: 'hypox', title: 'Why is the PaO₂ low?', level: 'Intermediate', blurb: 'Hypoventilation, V/Q mismatch, shunt, dead space — and which ones oxygen fixes.',
    steps: [
      { id: 'hy1', title: 'Hypoventilation', setup: { preset: 'normal', knobs: { drive: 0.35 }, station: 'lung', ff: 30 },
        say: 'First, hypoventilation. Depress the drive, as an opioid would. Less fresh gas reaches the alveoli, so carbon dioxide builds up and, by the alveolar gas equation, alveolar oxygen falls. The lungs themselves are normal, so the A to a gradient stays normal. A little oxygen, or simply more ventilation, fixes it.' },
      { id: 'hy2', title: 'V/Q mismatch', setup: { preset: 'normal', knobs: { lowVQ: 0.35 }, station: 'alveolus', ff: 20 },
        say: 'Now V Q mismatch. Some alveoli get plenty of blood but little air. Blood leaving them is poorly oxygenated, and the A to a gradient widens. This is the commonest cause of hypoxaemia: pneumonia, COPD, asthma, pulmonary embolism.' },
      { id: 'hy3', title: 'Oxygen fixes V/Q mismatch', setup: { knobs: { fio2: 0.4 }, ff: 10 },
        say: 'Raise the FiO₂ to forty percent. Even poorly ventilated alveoli eventually fill with oxygen-rich gas, so their blood saturates and the PaO₂ rises a lot. V Q mismatch is oxygen responsive.' },
      { id: 'hy4', title: 'Shunt does not respond', setup: { preset: 'normal', knobs: { shunt: 0.35, fio2: 1.0 }, station: 'alveolus', ff: 10 },
        say: 'Now shunt: blood passing collapsed or flooded alveoli that receive no gas at all. The dark alveoli are airless, and the blood through them stays venous. Even at one hundred percent oxygen, the PaO₂ barely rises, because extra oxygen never reaches that blood. Shunt needs the alveoli reopened: PEEP, recruitment, treating the cause.' },
      { id: 'hy5', title: 'Dead space', setup: { preset: 'normal', knobs: { vdAlv: 0.45, shunt: 0.03, fio2: 0.21 }, station: 'alveolus', ff: 30 },
        say: 'Finally, dead space: alveoli that are ventilated but not perfused, shown with grey empty capillaries. They waste ventilation, so carbon dioxide clearance falls and the gap between PaCO₂ and end tidal CO₂ widens. Pulmonary embolism, low cardiac output and over-distension all do this.' },
    ],
  },
  {
    id: 'resp', title: 'CO₂, pH and the kidneys', level: 'Intermediate', blurb: 'Acute and chronic respiratory acidosis, and what happens 48 hours later.',
    steps: [
      { id: 'rs1', title: 'Acute respiratory acidosis', setup: { preset: 'opioid', station: 'tissue' },
        say: 'This patient has taken an opioid. Carbon dioxide has risen to the eighties, and the pH has fallen quickly. Carbon dioxide combines with water to form carbonic acid, which releases hydrogen ions. Haemoglobin and proteins buffer some of them, so bicarbonate rises only about one per ten millimetres of mercury. That is acute compensation.' },
      { id: 'rs2', title: 'The acid–base map', setup: { station: 'kidney' },
        say: 'Look at the acid base map. The dot sits in the acute respiratory acidosis band. Now we will keep the ventilation the same and let two days pass.' },
      { id: 'rs3', title: '48 hours later', setup: { station: 'kidney', ff: 2880 },
        say: 'The kidneys have been excreting acid as ammonium and reclaiming and making new bicarbonate. Bicarbonate has risen by about three and a half per ten millimetres of mercury, and the pH is back near normal, even though the CO₂ has not changed. The dot has moved along its path into the chronic band. This is why a COPD patient can live with a PaCO₂ of sixty.' },
      { id: 'rs4', title: 'Post-hypercapnic alkalosis', setup: { drug: 'naloxone', station: 'lung', ff: 30 },
        say: 'Now reverse the opioid. Ventilation returns, and CO₂ falls within minutes. But the kidneys need days to give back the extra bicarbonate, so the patient becomes alkalaemic. The same thing happens when a chronic retainer is over-ventilated on a ventilator.' },
    ],
  },
  {
    id: 'metab', title: 'Metabolic acidosis and the anion gap', level: 'Advanced', blurb: 'DKA, lactate, salicylate: the gap, Winter’s formula and mixed disorders.',
    steps: [
      { id: 'mt1', title: 'Ketoacids consume bicarbonate', setup: { preset: 'dka', station: 'tissue' },
        say: 'Diabetic ketoacidosis. Ketoacids release hydrogen ions, and bicarbonate is used up buffering them. The ketone anions stay behind, unmeasured, so the anion gap, sodium minus chloride plus bicarbonate, widens. This is a high anion gap metabolic acidosis.' },
      { id: 'mt2', title: 'The lungs compensate', setup: { station: 'lung' },
        say: 'The low pH drives deep, fast breathing, Kussmaul respiration. Winter’s formula predicts the expected PaCO₂: one and a half times bicarbonate plus eight, plus or minus two. If the measured CO₂ is higher, the patient is tiring or sedated: a second, respiratory, problem.' },
      { id: 'mt3', title: 'Lactate', setup: { preset: 'sepsis', station: 'tissue' },
        say: 'In septic shock, lactate rises. Some comes from tissues short of oxygen, shown in magenta, but much comes from adrenaline-driven glycolysis and from a liver too poorly perfused to clear it. Lactate is a marker of stress and clearance, not simply of oxygen debt.' },
      { id: 'mt4', title: 'A mixed disorder', setup: { preset: 'salicylate', station: 'lung' },
        say: 'Salicylate poisoning stimulates the respiratory centre directly, causing a respiratory alkalosis, and uncouples oxidative phosphorylation, adding organic acid. The CO₂ is lower than Winter’s formula predicts. Two primary disorders at once. The low CO₂ is protecting the patient: if they are intubated, it must stay low.' },
    ],
  },
  {
    id: 'vbg', title: 'ABG or VBG?', level: 'Novice', blurb: 'Two different samples, two different questions.',
    steps: [
      { id: 'vb1', title: 'Two sampling sites', setup: { preset: 'normal', station: 'tissue' },
        say: 'An arterial gas samples blood on its way to the tissues. A venous gas samples blood that has already given up oxygen and collected carbon dioxide. In a stable patient, venous pH is about zero point zero three lower and venous CO₂ about five higher. Bicarbonate and lactate are almost the same.' },
      { id: 'vb2', title: 'Venous PO₂ is not oxygenation', setup: { station: 'tissue' },
        say: 'Venous PO₂ tells you only what the tissues left behind. A venous PO₂ of forty is normal, not hypoxaemia. To judge oxygenation, use the pulse oximeter or an arterial sample. The app always shows these two samples separately for that reason.' },
      { id: 'vb3', title: 'When they diverge', setup: { preset: 'arrest', station: 'tissue' },
        say: 'During cardiac arrest with CPR, blood flow is so low that carbon dioxide piles up in the tissues. Venous CO₂ is far higher than arterial, and the venous pH far lower. When flow is poor, a venous gas no longer mirrors the arterial one.' },
    ],
  },
];
