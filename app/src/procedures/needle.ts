/**
 * Needle thoracostomy — a pure layered model of the chest wall along the needle's path. The procedure
 * does not model the lung: success calls the EXISTING vent session (`intervene('decompress')` on the
 * 'ptx' patient) and the mechanics show the result.
 *
 * Chest-wall thicknesses are ILLUSTRATIVE teaching values (adult, supine). Imaging studies report wide
 * variation; the teaching points are relative: the 2nd intercostal space in the mid-clavicular line is
 * usually thicker than the 4th/5th space at the anterior/mid-axillary line, habitus changes everything,
 * and a standard 5 cm catheter often does not reach the pleura anteriorly.
 */
export type NeedleSite = '2ics-mcl' | '45ics-aal' | '5ics-mal' | 'parasternal' | 'low';
export type RibPos = 'overLower' | 'underUpper' | 'midRib';
export type Habitus = 'thin' | 'average' | 'obese';
export interface NeedleInput { site: NeedleSite; rib: RibPos; habitus: Habitus; /** catheter length, cm */ length: number; /** angle from perpendicular, degrees */ angle: number; /** tension pneumothorax present (pleural air) */ tension: boolean; /** advance only until air returns (true) or to the hub regardless (false) */ stopAtAir?: boolean }

export const SITES: Record<NeedleSite, { name: string; short: string; ok: boolean; /** subcutaneous tissue + muscle, cm (average habitus) */ soft: number; muscle: string; muscleCm: number; note: string; x: number; y: number }> = {
  '2ics-mcl': { name: '2nd intercostal space, mid-clavicular line', short: '2nd ICS MCL', ok: true, soft: 2.4, muscle: 'pectoralis major / minor', muscleCm: 1.6, note: 'The classic anterior site: easy to find supine, but it crosses the pectoral muscles and is often the thickest.', x: 0.36, y: 0.24 },
  '45ics-aal': { name: '4th–5th intercostal space, anterior axillary line', short: '4–5th ICS AAL', ok: true, soft: 2.1, muscle: 'serratus anterior', muscleCm: 0.9, note: 'Lateral site in the safe triangle (lateral pectoralis, anterior latissimus, nipple line): usually a thinner wall.', x: 0.2, y: 0.46 },
  '5ics-mal': { name: '5th intercostal space, mid-axillary line', short: '5th ICS MAL', ok: true, soft: 2.0, muscle: 'serratus anterior', muscleCm: 0.8, note: 'The same safe triangle, a little further back: thin wall, but an arm must be moved and the needle can be dislodged.', x: 0.12, y: 0.5 },
  parasternal: { name: '2nd intercostal space, beside the sternum', short: 'Parasternal', ok: false, soft: 1.6, muscle: 'pectoralis major', muscleCm: 1.0, note: 'Too medial: the internal thoracic (mammary) artery runs 1–2 cm from the sternal edge, and deeper lie the heart and great vessels.', x: 0.46, y: 0.24 },
  low: { name: '7th–8th intercostal space', short: 'Too low', ok: false, soft: 2.0, muscle: 'serratus / external oblique', muscleCm: 0.9, note: 'Below the nipple line the diaphragm rises in expiration: liver on the right, spleen on the left.', x: 0.2, y: 0.72 },
};
const HABITUS: Record<Habitus, number> = { thin: 0.65, average: 1, obese: 1.75 };
const SKIN = 0.2, IC = 0.6, PLEURA = 0.05;

export interface Layer { id: 'skin' | 'fat' | 'muscle' | 'intercostal' | 'pleura' | 'space' | 'lung'; name: string; from: number; to: number }
export interface NeedleResult {
  layers: Layer[]; /** perpendicular chest-wall thickness to the parietal pleura, cm */ wall: number;
  /** perpendicular depth the catheter tip reaches */ depth: number; reachesPleura: boolean;
  /** margin beyond the pleura (cm; negative = short) */ margin: number;
  injuries: string[]; outcome: 'decompressed' | 'short' | 'rib' | 'noTension'; lungRisk: boolean; summary: string;
}

/** Walk the needle through the chest wall. Pure. */
export function needlePath(n: NeedleInput): NeedleResult {
  const s = SITES[n.site]; const h = HABITUS[n.habitus];
  const fat = Math.max(0.3, s.soft * h - SKIN); const muscle = s.muscleCm * (n.habitus === 'thin' ? 0.8 : 1);
  const air = n.tension ? 2.5 : 0; // pleural air under tension separates the parietal pleura from the lung
  const L: Layer[] = []; let z = 0;
  const add = (id: Layer['id'], name: string, t: number) => { L.push({ id, name, from: z, to: z + t }); z += t; };
  add('skin', 'Skin', SKIN); add('fat', 'Subcutaneous fat', fat); add('muscle', s.muscle, muscle); add('intercostal', 'Intercostal muscles', IC); add('pleura', 'Parietal pleura', PLEURA);
  const wall = z; add('space', n.tension ? 'Pleural space — air under tension' : 'Pleural space', Math.max(0.02, air)); add('lung', 'Lung', 4);
  const cos = Math.cos((Math.max(0, Math.min(60, n.angle)) * Math.PI) / 180);
  const full = n.length * cos; const stop = n.stopAtAir !== false && n.tension && full > wall; // air returns on entering the space: stop there
  const depth = stop ? Math.min(full, wall + 0.5) : full; const margin = full - wall;
  const injuries: string[] = [];
  if (n.rib === 'underUpper') injuries.push('Intercostal artery, vein and nerve: they run in the groove under each rib — bleeding (haemothorax) and neuralgia.');
  if (n.site === 'parasternal') injuries.push('Internal thoracic artery 1–2 cm from the sternal edge; deeper, the heart and great vessels.');
  if (n.site === 'low') injuries.push('Diaphragm, and below it the liver (right) or spleen (left).');
  if (n.angle > 30) injuries.push(`Angled ${Math.round(n.angle)}°: the path through the wall lengthens and the tip ends up away from the intended space.`);
  const hitsRib = n.rib === 'midRib' && depth > SKIN + fat + muscle;
  const reaches = !hitsRib && margin > 0;
  const lungRisk = reaches && depth > wall + air + 0.2;
  if (lungRisk) injuries.push(n.tension ? 'The tip is past the pleural air and into the lung: advance only until air returns, then advance the catheter off the needle.' : 'No pleural air to cushion the needle: it goes straight into the lung.');
  const outcome: NeedleResult['outcome'] = hitsRib ? 'rib' : !reaches ? 'short' : n.tension ? 'decompressed' : 'noTension';
  const summary = outcome === 'rib' ? 'The needle meets bone: walk it off the TOP of the rib below.'
    : outcome === 'short' ? `The catheter ends ${Math.abs(margin).toFixed(1)} cm short of the pleura, in the ${L.find((l) => depth >= l.from && depth < l.to)?.name.toLowerCase() ?? 'chest wall'} — no air, no decompression, and a falsely reassuring "attempt".`
    : outcome === 'decompressed' ? `In the pleural space with ${margin.toFixed(1)} cm to spare: a rush of air, the tension is released.`
    : 'The pleura is reached but there is no tension air — the needle now risks the lung.';
  return { layers: L, wall, depth, reachesPleura: reaches, margin, injuries, outcome, lungRisk, summary };
}

export const NEEDLE_DEFAULT: NeedleInput = { site: '45ics-aal', rib: 'overLower', habitus: 'average', length: 8, angle: 0, tension: true, stopAtAir: true };
