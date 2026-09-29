/**
 * Synthetic lung ultrasound (POCUS) from the SAME ventilator state as the chest X-ray (`cxrFromVent`).
 * Four probe zones — anterior and lateral on each side — each reduced to the signs a sonographer reads:
 * lung sliding, A-lines, B-lines (count / confluent), lung point, lung pulse, subpleural consolidation,
 * effusion, and the M-mode pattern (seashore vs barcode). Teaching conventions in our own words
 * (facts cross-checked against open POCUS references; no copied wording or images).
 *   - Sliding = visceral pleura moving against parietal pleura: its absence alone is not diagnostic.
 *   - A lung point (sliding appears and disappears at one spot) confirms a pneumothorax.
 *   - A lung pulse (pleura twitching with the heartbeat, no sliding) means the pleurae are touching but
 *     the lung is not ventilated — e.g. collapse from a plugged bronchus: NOT a pneumothorax.
 *   - B-lines: vertical, from the pleural line to the bottom of the screen, moving with sliding;
 *     three or more in one intercostal space is abnormal; confluent B-lines = "white lung".
 */
import type { VentSession } from './session';
import { cxrFromVent, type CxrState } from './cxr';
import { vnoise, hash, clamp, type UsScene, type UsPx } from '../scene/ultrasound/bmode';

export type LusZoneId = 'R-ant' | 'R-lat' | 'L-ant' | 'L-lat';
export const LUS_ZONES: { id: LusZoneId; side: 0 | 1; name: string }[] = [
  { id: 'R-ant', side: 0, name: 'Right anterior' }, { id: 'R-lat', side: 0, name: 'Right lateral (posterolateral)' },
  { id: 'L-ant', side: 1, name: 'Left anterior' }, { id: 'L-lat', side: 1, name: 'Left lateral (posterolateral)' },
];
export interface LusZone {
  id: LusZoneId; sliding: boolean; lungPoint: boolean; lungPulse: boolean;
  aLines: boolean; bLines: number; white: boolean; consolidation: number; effusion: number;
  mmode: 'seashore' | 'barcode' | 'barcode + lung point'; pattern: string;
}

/** Read the four zones from the radiograph state (which itself is read from the vent session). Pure. */
export function lusFromCxr(st: CxrState): LusZone[] {
  return LUS_ZONES.map(({ id, side }) => {
    const s = st.side[side]; const ant = id.endsWith('ant');
    // pleural air rises to the anterior chest when supine: anterior first, lateral only when large
    const ptxHere = s.ptx > 0.08 && (ant || s.ptx > 0.6);
    const lungPoint = !ant && s.ptx > 0.08 && s.ptx <= 0.6;
    const collapsed = s.atelectasis > 0.4;
    const opacity = s.opacity * (ant ? 0.75 : 1.15); // dependent (posterolateral) lung is worse
    const b = ptxHere ? 0 : clamp(Math.round(opacity * 8 + st.edema * (ant ? 4 : 6) + (collapsed ? 0 : 0)), 0, 10);
    const consolidation = ptxHere ? 0 : collapsed ? 0.9 : clamp((opacity - 0.45) * 1.6);
    const effusion = !ant && !ptxHere ? s.effusion : 0;
    const sliding = !ptxHere && !collapsed;
    const lungPulse = collapsed && !ptxHere;
    const white = b >= 7;
    const mmode: LusZone['mmode'] = ptxHere ? 'barcode' : lungPoint ? 'barcode + lung point' : 'seashore';
    const pattern = ptxHere ? 'No sliding, A-lines only, barcode on M-mode — pneumothorax pattern'
      : lungPoint ? 'Lung point: sliding comes and goes at the edge of the air — confirms a pneumothorax'
      : lungPulse ? 'No sliding but a lung pulse with each heartbeat, consolidated lung: collapse, NOT pneumothorax'
      : white ? 'Confluent B-lines (white lung)' + (consolidation > 0.3 ? ' with subpleural consolidation' : '')
      : b >= 3 ? `${b} B-lines in the space — interstitial syndrome` + (consolidation > 0.3 ? ', subpleural consolidation' : '')
      : consolidation > 0.3 ? 'Subpleural consolidation'
      : 'Sliding with A-lines — aerated lung';
    return { id, sliding, lungPoint, lungPulse, aLines: b < 3, bLines: b, white, consolidation, effusion, mmode, pattern: effusion > 0.2 ? `${pattern}; effusion above the diaphragm` : pattern };
  });
}
export const lusFromVent = (S: VentSession) => lusFromCxr(cxrFromVent(S));

/** Overall reading across the four zones (BLUE-protocol style, simplified). */
export function lusSummary(z: LusZone[]): string[] {
  const out: string[] = []; const by = (id: LusZoneId) => z.find((x) => x.id === id)!;
  for (const [a, l, name] of [[by('R-ant'), by('R-lat'), 'Right'], [by('L-ant'), by('L-lat'), 'Left']] as const) {
    if (!a.sliding && !a.lungPulse) out.push(`${name}: absent anterior sliding${l.lungPoint ? ' with a lung point laterally' : ''} → pneumothorax${l.lungPoint ? ' (partial)' : ''}.`);
    if (a.lungPulse) out.push(`${name}: no sliding but a lung pulse → the lung is collapsed, not separated from the chest wall.`);
  }
  const bZones = z.filter((x) => x.bLines >= 3).length;
  if (bZones >= 3) out.push('B-lines in most zones on both sides → diffuse interstitial syndrome (oedema, ARDS, pneumonia).');
  if (z.some((x) => x.consolidation > 0.3 && !x.lungPulse)) out.push('Subpleural consolidation in the dependent zones.');
  if (z.some((x) => x.effusion > 0.2)) out.push('Pleural effusion in the posterolateral zones.');
  if (!out.length) out.push('Sliding with A-lines in all four zones → aerated lung, pneumothorax very unlikely at the probe sites.');
  return out;
}

/** B-mode scene for one zone at time t (s): chest wall, ribs with shadows, pleural line, artefacts. Linear probe, 4 cm wide × 6 cm deep. */
export const LUS_W = 4, LUS_D = 6;
export function lusScene(z: LusZone, t: number): UsScene {
  const PL = 1.35; const breath = Math.sin(2 * Math.PI * t / 4); const slide = z.sliding ? 0.25 * breath : 0; const pulse = z.lungPulse ? 0.03 * Math.max(0, Math.sin(2 * Math.PI * t * 1.3)) : 0;
  // lung point: the edge of the air moves across the screen with breathing (sliding on one side of it only)
  const edge = z.lungPoint ? 0.2 * Math.sin(2 * Math.PI * t / 4) : 99;
  const bx = Array.from({ length: z.bLines }, (_, i) => -1.7 + (3.4 * (i + 0.5 + 0.3 * (hash(i, 7) - 0.5))) / Math.max(1, z.bLines));
  return (x: number, zz: number): UsPx => {
    if (zz < 0.2) return { e: 0.7, k: 'tissue' };
    if (zz < PL - 0.25) return { e: 0.24 + 0.05 * vnoise(x * 3, zz * 5) + (Math.abs(zz - 0.55) < 0.03 || Math.abs(zz - 0.95) < 0.03 ? 0.3 : 0), k: 'tissue' }; // subcutaneous tissue with two fascial planes
    // ribs at both edges with acoustic shadows beneath ("bat sign")
    const rib = Math.abs(x) > 1.45;
    if (rib) return zz < PL - 0.05 ? { e: 0.85, k: 'tissue' } : { e: 0.03, k: 'tissue' };
    const beyondEdge = x > edge; const slidingHere = z.sliding || (z.lungPoint && beyondEdge);
    const pl = PL + pulse;
    if (Math.abs(zz - pl) < 0.06) return { e: slidingHere ? 0.95 * (0.85 + 0.15 * vnoise((x + slide) * 12, t * 4)) : 0.95, k: 'tissue' }; // pleural line (shimmers when sliding)
    // effusion: anechoic band just deep to the pleura in the dependent zone
    if (z.effusion > 0.2 && zz > pl && zz < pl + 1.2 * z.effusion) return { e: 0.03, k: 'fluid' };
    const d = zz - pl;
    // consolidation: tissue-like (hepatised) lung with bright air bronchograms, from the pleura down
    // irregular, "shred" deep border and soft lateral edges
    const depth = 3.2 * z.consolidation * (0.65 + 0.45 * vnoise(x * 2.2 + 5, 1)); const halfW = 1.25 * (0.55 + z.consolidation) * (0.85 + 0.25 * vnoise(d * 1.5, 3));
    if (z.consolidation > 0.3 && d < depth && Math.abs(x) < halfW) {
      const bronch = vnoise(x * 6 + (z.lungPulse ? 0 : slide * 6), d * 3) > 0.78 ? 0.4 : 0;
      return { e: 0.42 + 0.1 * vnoise(x * 4, d * 4) + bronch, k: 'tissue' };
    }
    // B-lines: laser-like vertical lines from the pleura to the bottom, moving with sliding
    const nearest = bx.reduce((m, b) => Math.min(m, Math.abs(x - (b + slide))), 9);
    if (z.white) return { e: 0.55 + 0.1 * vnoise((x + slide) * 5, d * 0.6), k: 'tissue' };
    if (nearest < 0.07) return { e: 0.8 - 0.1 * (d / LUS_D), k: 'tissue' };
    // A-lines: reverberations of the pleural line at multiples of its depth
    const r = d % pl; const aLine = z.aLines && d > 0.3 && (r < 0.05 || pl - r < 0.05) ? 0.55 * Math.exp(-d / 5) : 0; // at 2×, 3×… the skin–pleura depth
    const texture = slidingHere ? 0.12 + 0.08 * vnoise((x + slide) * 8, d * 8) : 0.09 + 0.02 * vnoise(x * 3, d * 3); // air: featureless unless sliding churns it
    return { e: Math.max(texture, aLine), k: 'tissue' };
  };
}

/**
 * M-mode through the middle of the zone: depth (rows) × time (columns). Above the pleura the chest wall is
 * still (straight "waves"); below it a sliding lung makes granular "sand" (seashore), a still lung makes
 * straight lines everywhere (barcode). A lung point flips between the two with breathing.
 */
export function renderMmode(z: LusZone, W = 200, H = 150, seconds = 4): { rgba: Uint8ClampedArray; w: number; h: number } {
  const rgba = new Uint8ClampedArray(W * H * 4); const PL = 1.35;
  for (let i = 0; i < W; i++) {
    const t = (i / W) * seconds; const inAir = z.lungPoint ? Math.sin(2 * Math.PI * t / 4) < 0 : !z.sliding;
    for (let j = 0; j < H; j++) {
      const d = (j / H) * LUS_D; let v: number;
      if (d < 0.2) v = 0.7; else if (d < PL - 0.25) v = 0.24 + (Math.abs(d - 0.55) < 0.03 || Math.abs(d - 0.95) < 0.03 ? 0.3 : 0);
      else if (Math.abs(d - PL) < 0.06) v = 0.95;
      else if (d < PL) v = 0.25;
      else if (!inAir && z.effusion > 0.2 && d < PL + 1.2 * z.effusion) v = 0.04;
      else if (z.bLines >= 3 && !inAir) v = 0.45 + 0.25 * hash(i * 3, j);
      else if (inAir) v = (Math.abs(((d - PL) % PL) - PL) < 0.06 || Math.abs((d - PL) % PL) < 0.06 ? 0.5 : 0.1) + 0.05 * vnoise(1, d * 20);
      else v = 0.1 + 0.35 * hash(i, j) * (1 - (d - PL) / LUS_D);
      if (z.lungPulse && Math.abs(d - PL) < 0.2) v = Math.max(v, 0.7 * Math.max(0, Math.sin(2 * Math.PI * t * 1.3)));
      const g = Math.round(255 * clamp(v)); const o = (j * W + i) * 4; rgba[o] = g; rgba[o + 1] = g; rgba[o + 2] = g; rgba[o + 3] = 255;
    }
  }
  return { rgba, w: W, h: H };
}
