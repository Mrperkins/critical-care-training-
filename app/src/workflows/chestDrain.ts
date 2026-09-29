/**
 * Chest-drain ASSESSMENT (three-chamber unit: collection · water seal · suction control) — a pure
 * reading of the drainage system from its configuration and the patient's PLEURAL PRESSURE, which comes
 * from the existing vent session (`session.pleural()` = chest-wall recoil − effort + trapped air). The
 * drain never computes lung physiology; an occluded drain on an ongoing leak is fed back to the vent
 * session (`setDrainBlocked`) where tension re-accumulates in the real mechanics.
 *
 * Teaching conventions (own wording; local practice differs):
 *  - water seal ≈ 2 cmH₂O; the column in the seal chamber RISES toward the patient when pleural
 *    pressure falls (spontaneous inspiration) and FALLS when it rises (positive-pressure inspiration);
 *  - suction dampens the visible swing — briefly turn it off to judge tidaling;
 *  - bubbling in the water seal = air leaving the pleura (patient) or entering the tubing (system);
 *    brief clamping near the chest separates the two;
 *  - wet suction: gentle continuous bubbling in the suction-control chamber; vigorous bubbling adds noise
 *    and evaporation, not suction — the water depth sets the negative pressure;
 *  - haemothorax output worth escalating: ~1500 mL on insertion, or ~200 mL/h sustained for 2–4 h.
 */
export type LeakGrade = 0 | 1 | 2 | 3; // none · with positive pressure / cough only · every breath · continuous
export interface DrainConfig {
  suction: boolean; /** suction-control water column, cmH₂O (wet) */ suctionSet: number; /** wall source vigour 0–1 */ source: number;
  leak: LeakGrade; leakSource: 'patient' | 'system';
  kink: boolean; clot: boolean; clamped: boolean;
  /** fluid lying in a dependent loop of tubing (mL); its height opposes drainage */ loopMl: number;
  /** unit lifted above the chest (transfers) */ unitHigh: boolean;
  /** a side hole has migrated outside the pleura (partly pulled out) */ sideHoleOut: boolean;
  /** 0 = collapsed … 1 = lung fully re-expanded against the tube */ expanded: number;
  fluid: 'blood' | 'serous' | 'none'; initialMl: number; rateMlH: number; hours: number;
  /** ventilated (positive pressure) or breathing spontaneously */ ppv: boolean;
}
export const DRAIN_DEFAULT: DrainConfig = {
  suction: false, suctionSet: 20, source: 0.4, leak: 0, leakSource: 'patient', kink: false, clot: false, clamped: false,
  loopMl: 0, unitHigh: false, sideHoleOut: false, expanded: 0.6, fluid: 'serous', initialMl: 150, rateMlH: 20, hours: 2, ppv: true,
};

export interface PleuralSample { /** now */ p: number; /** range over the last breaths */ lo: number; hi: number }
export interface DrainView {
  patent: boolean;
  /** peak-to-peak movement of the water-seal column, cm */ swing: number;
  /** column displacement NOW, cm (+ = up toward the patient) */ level: number;
  /** bubbling in the water seal now / pattern */ bubblingNow: boolean; bubbling: 'none' | 'with breaths' | 'every breath' | 'continuous';
  suctionChamber: 'still' | 'gentle' | 'vigorous';
  /** drainage mL/h at present (0 if blocked) and total collected */ rate: number; total: number;
  siphonBack: boolean; subcutEmphysema: boolean; /** tension will re-accumulate */ tensionRisk: boolean;
  /** escalate to surgery (haemothorax thresholds) */ surgical: boolean;
  findings: string[];
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Read the drain from its configuration and the patient's pleural pressure. Pure. */
export function drainView(c: DrainConfig, pl: PleuralSample): DrainView {
  const blocked = c.kink || c.clot || c.clamped;
  const loopHead = c.loopMl > 0 ? Math.min(20, c.loopMl / 6) : 0; // cm of fluid column standing in the loop
  const patent = !blocked;
  const range = Math.max(0, pl.hi - pl.lo); const mid = (pl.hi + pl.lo) / 2;
  // pleural swing reaches the seal only through a patent tube lying in a pleural space that is still open around it;
  // suction holds the pleura near its set pressure and damps the column; a fluid loop takes up the movement itself
  const space = 0.1 + 0.9 * (1 - clamp01(c.expanded));
  const tx = patent ? space * (c.suction ? 0.3 : 1) * (loopHead > 0 ? 0.35 : 1) : 0;
  const swing = +(range * tx).toFixed(1);
  const level = +(-(pl.p - mid) * tx).toFixed(2);
  // bubbling: air leaves the pleura when its pressure exceeds the water seal (+ any loop column)
  // (positive-pressure inspiration, or expiration / cough when breathing spontaneously: the high-pressure part of the cycle)
  const high = pl.p - mid > 0.15 * range;
  const sysLeak = c.leakSource === 'system' && c.leak > 0;
  let bubbling: DrainView['bubbling'] = 'none';
  if (sysLeak && !c.clamped) bubbling = 'continuous';
  else if (patent && c.leak > 0) {
    if (c.leak === 3 || c.sideHoleOut || c.suction) bubbling = 'continuous';
    else if (c.leak === 2) bubbling = 'every breath';
    else bubbling = c.ppv ? 'every breath' : 'with breaths';
  } else if (patent && c.sideHoleOut) bubbling = 'continuous';
  const bubblingNow = bubbling === 'continuous' || (bubbling !== 'none' && high);
  const suctionChamber: DrainView['suctionChamber'] = !c.suction ? 'still' : c.source > 0.7 ? 'vigorous' : c.source > 0.05 ? 'gentle' : 'still';
  const flowFactor = !patent ? 0 : loopHead > 0 ? 0.3 : 1;
  const rate = c.fluid === 'none' ? 0 : Math.round(c.rateMlH * flowFactor);
  const total = Math.round(c.initialMl + (c.fluid === 'none' ? 0 : c.rateMlH * c.hours));
  const tensionRisk = !patent && c.leak > 0 && c.leakSource === 'patient';
  const surgical = c.fluid === 'blood' && (c.initialMl >= 1500 || (c.rateMlH >= 200 && c.hours >= 2));
  const findings: string[] = [];
  if (!patent) findings.push(c.clamped ? 'Clamped: no swing, no bubbling, no drainage.' : c.kink ? 'Kinked tubing: the column is still and drainage has stopped.' : 'Clot in the tube: the column is still and drainage has stopped.');
  if (tensionRisk) findings.push(c.ppv ? 'The lung is still leaking under positive pressure — with the drain occluded, tension will re-accumulate.' : 'An occluded drain on a leaking lung lets the pneumothorax re-accumulate.');
  if (patent && swing >= 0.8) findings.push(`Tidaling ${swing} cm: the tube is patent and in the pleural space (${c.ppv ? 'falls with each ventilator breath' : 'rises with each breath in'}).`);
  else if (patent && c.suction) findings.push('On suction the swing is damped — turn suction off briefly to judge tidaling.');
  else if (patent && c.expanded > 0.9 && loopHead === 0) findings.push('Tidaling has almost stopped with a patent system: the lung has re-expanded against the tube.');
  else if (patent && loopHead === 0) findings.push('Little swing: check the tubing for a partial obstruction and the patient for re-expansion.');
  if (loopHead > 0) findings.push(`Fluid in a dependent loop (~${Math.round(loopHead)} cmH₂O) is opposing drainage.`);
  if (bubbling !== 'none') findings.push(sysLeak ? 'Continuous bubbling from a SYSTEM leak — it continues when the tube is clamped briefly at the chest.' : c.sideHoleOut ? 'Continuous bubbling with a side hole outside the chest wall — air is being drawn in at the insertion site.' : bubbling === 'continuous' ? 'Continuous bubbling: a large air leak from the lung (bronchopleural fistula if it persists).' : 'Bubbling with breaths: an air leak from the lung — expected early after a pneumothorax; grade and trend it.');
  if (c.unitHigh) findings.push('The unit is above the chest: drained fluid can siphon back into the pleura.');
  if (c.sideHoleOut) findings.push('Subcutaneous emphysema around the site — a side hole has come out of the chest.');
  if (suctionChamber === 'vigorous') findings.push('Vigorous bubbling in the suction-control chamber adds noise and evaporation, not suction — the water depth sets the pressure. Turn the wall source down to gentle bubbling.');
  if (surgical) findings.push(c.initialMl >= 1500 ? `${c.initialMl} mL of blood on insertion: massive haemothorax — call surgery.` : `${c.rateMlH} mL/h of blood for ${c.hours} h: ongoing haemorrhage — call surgery.`);
  return { patent, swing, level, bubblingNow, bubbling, suctionChamber, rate, total, siphonBack: c.unitHigh && total > 0, subcutEmphysema: c.sideHoleOut, tensionRisk, surgical, findings };
}

/** Brief clamp test for a bubbling drain: does bubbling stop when clamped at the chest (patient leak) or continue (system leak)? */
export function clampTest(c: DrainConfig, at: 'chest' | 'unit'): { bubblingStops: boolean; meaning: string } {
  if (c.leak === 0 && !c.sideHoleOut) return { bubblingStops: true, meaning: 'No bubbling to test.' };
  if (c.leakSource === 'patient' || c.sideHoleOut) {
    return at === 'chest'
      ? { bubblingStops: true, meaning: 'Stops when clamped at the chest: the air is coming from the patient (lung leak, or the site if a side hole is out). Release the clamp at once.' }
      : { bubblingStops: true, meaning: 'Stops: the leak is on the patient side of the clamp.' };
  }
  return at === 'chest'
    ? { bubblingStops: false, meaning: 'Still bubbling with the tube clamped at the chest: the leak is in the tubing or unit. Move the clamp down the tubing to find it; check every connection.' }
    : { bubblingStops: true, meaning: 'Stops only when clamped at the unit end: the leak is in the tubing between the two clamp sites.' };
}

export interface DrainCase { id: string; title: string; story: string; cfg: Partial<DrainConfig>; question: string; options: { id: string; label: string }[]; answer: string; explain: string }
const O = (ids: [string, string][]) => ids.map(([id, label]) => ({ id, label }));
const ACTIONS = O([
  ['observe', 'Expected — document and keep observing'], ['unkink', 'Find and relieve the obstruction (kink / clot / clamp)'], ['loop', 'Straighten the tubing and drain the loop into the chamber'],
  ['leakCheck', 'Clamp briefly at the chest to locate the leak, then check connections'], ['surgeon', 'Escalate: surgical review for haemorrhage'], ['lower', 'Lower the unit below the chest'],
  ['source', 'Turn the suction source down to gentle bubbling'], ['site', 'Check the site: side hole out — secure, dress, arrange replacement'],
]);
export const DRAIN_CASES: DrainCase[] = [
  { id: 'ok-ppv', title: 'Swinging on the ventilator', story: 'Day 1 after a drain for pneumothorax, ventilated, water seal only. The column falls with each ventilator breath; no bubbling.', cfg: { leak: 0, expanded: 0.5 }, question: 'What does this tell you?', options: ACTIONS, answer: 'observe', explain: 'Tidaling means the tube is patent and in the pleural space. On positive pressure the pleural pressure rises in inspiration, so the column falls — the reverse of spontaneous breathing.' },
  { id: 'leak-ppv', title: 'Bubbles with every breath', story: 'Ventilated, 6 h after a drain for traumatic pneumothorax. Bubbles pass through the water seal with each ventilator breath; SpO₂ stable.', cfg: { leak: 2, expanded: 0.6 }, question: 'Best response?', options: ACTIONS, answer: 'observe', explain: 'A patient air leak with each positive-pressure breath is expected early. Grade and trend it; never clamp a bubbling drain — the air has nowhere else to go.' },
  { id: 'kink', title: 'Nothing moves', story: 'Ventilated patient with a known air leak. The water seal is suddenly still, no bubbling, and peak pressures and heart rate are climbing.', cfg: { leak: 2, kink: true, expanded: 0.6 }, question: 'Most likely problem and action?', options: ACTIONS, answer: 'unkink', explain: 'Loss of swing AND of a known leak with deteriorating pressures means the drain is occluded — here a kink under the patient. Tension is re-accumulating. Relieve it now.' },
  { id: 'expanded', title: 'Still water, well patient', story: 'Day 3, spontaneous breathing, no bubbling for 24 h, chest X-ray shows the lung fully up. The column barely moves; tubing checked and patent.', cfg: { leak: 0, expanded: 1, ppv: false, fluid: 'serous', rateMlH: 5 }, question: 'Interpretation?', options: ACTIONS, answer: 'observe', explain: 'With a patent, well-positioned system, tidaling fades as the lung re-expands against the tube. Absent tidaling is only reassuring when the patient and the tubing say so.' },
  { id: 'loop', title: 'Fluid in the tubing', story: 'Haemothorax drain. Drainage has slowed; a loop of tubing hangs off the bed below the unit inlet and is full of blood.', cfg: { fluid: 'blood', rateMlH: 60, loopMl: 90, expanded: 0.5 }, question: 'What do you do?', options: ACTIONS, answer: 'loop', explain: 'A fluid-filled dependent loop is a column of fluid the pleura has to push against. Straighten the tubing, let the loop drain into the chamber, keep the tubing coiled flat on the bed.' },
  { id: 'system', title: 'Continuous bubbling, new', story: 'Spontaneously breathing patient whose leak had stopped. Now there is continuous bubbling in the water seal; the patient is comfortable, no subcutaneous emphysema.', cfg: { leak: 1, leakSource: 'system', ppv: false, expanded: 0.95 }, question: 'Next step?', options: ACTIONS, answer: 'leakCheck', explain: 'A NEW continuous leak in a well patient is often the system. A brief clamp at the chest: if it keeps bubbling, the leak is between the clamp and the unit — check every connection.' },
  { id: 'site', title: 'Crackling skin', story: 'After a transfer the tube looks longer at the skin; there is new crackling under the skin around the site and continuous bubbling.', cfg: { leak: 1, sideHoleOut: true, ppv: false }, question: 'Most likely problem?', options: ACTIONS, answer: 'site', explain: 'A side hole outside the pleura draws air in at the site and pushes it into the tissues. Do not push the tube back in; secure it, occlusive dressing, and arrange replacement.' },
  { id: 'massive', title: 'Blood on insertion', story: 'Stab wound, drain inserted: 1600 mL of blood into the collection chamber immediately. HR 128, BP 86/50.', cfg: { fluid: 'blood', initialMl: 1600, rateMlH: 150, hours: 0, expanded: 0.5, ppv: false }, question: 'What now?', options: ACTIONS, answer: 'surgeon', explain: 'About 1500 mL on insertion (or around 200 mL/h for several hours) is haemorrhage the drain cannot fix. Resuscitate with blood and call surgery.' },
  { id: 'high', title: 'On the stretcher', story: 'During a transfer the unit has been placed on the patient’s legs, level with the chest; fluid is running back up the tubing.', cfg: { fluid: 'serous', initialMl: 400, unitHigh: true, ppv: false }, question: 'Correct action?', options: ACTIONS, answer: 'lower', explain: 'Keep the unit upright and below the chest at all times; above it, drained fluid siphons back into the pleura. Do not clamp for the move.' },
  { id: 'vigorous', title: 'Roaring suction chamber', story: 'Wet-suction unit at −20 cmH₂O. The suction-control chamber is bubbling violently and the water level keeps dropping.', cfg: { suction: true, source: 0.95, leak: 0 }, question: 'What is the fix?', options: ACTIONS, answer: 'source', explain: 'In a wet system the water depth sets the suction; more wall vacuum only makes it bubble harder and evaporate. Turn the source down until the bubbling is gentle, and top up to the ordered level.' },
];
export const caseConfig = (k: DrainCase): DrainConfig => ({ ...DRAIN_DEFAULT, ...k.cfg });
