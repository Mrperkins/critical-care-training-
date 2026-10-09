/**
 * What lung ultrasound (POCUS) would show for the SAME ventilator state as the chest X-ray (`cxrFromVent`);
 * the clip on screen is a real one matched to each zone's pattern (vent/LusScene.tsx).
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
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

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
