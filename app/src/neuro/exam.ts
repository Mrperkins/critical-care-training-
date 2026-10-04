/**
 * Synthetic neurological examination derived from the SAME lesion state the brain, imaging and
 * perfusion views use. Pure and deterministic. Principles (teaching model):
 *  - tissue that is core OR still-ischaemic penumbra does not work → deficit now;
 *    after reperfusion only the core keeps its deficit (penumbra recovers);
 *  - findings are contralateral to the lesion; language lives in the dominant hemisphere, spatial
 *    attention (neglect) mainly in the non-dominant one;
 *  - MCA superior division: face/arm motor, frontal eye field, expressive language;
 *    MCA inferior division: receptive language, neglect, optic radiation;
 *    deep MCA (lenticulostriates, only with M1/ICA occlusion): internal capsule → leg too;
 *    ACA: leg > arm; PCA: contralateral hemianopia; vertebrobasilar: consciousness, both sides, ataxia, dysarthria.
 * Not a diagnostic tool.
 */
import { TERRITORY_ML, type TerritoryId } from './anatomy';
import { territoryStates, effectiveHemorrhage, DEFAULT_SYSTEMIC, type NeuroState, type Systemic } from './perfusion';

export type Side = 'L' | 'R';
export interface ExamOptions { dominant?: Side }
export interface NeuroExam {
  gcs: number;
  /** strength 0–5 per limb (patient's side) */ power: { armL: number; armR: number; legL: number; legR: number };
  face: { side: Side | null; grade: 0 | 1 | 2 | 3 };
  gaze: { deviation: Side | null; palsy: boolean };
  drift: Side | null;
  aphasia: 'none' | 'expressive' | 'receptive' | 'global';
  aphasiaSeverity: number;
  neglect: Side | null; // side of space ignored
  dysarthria: 0 | 1 | 2;
  hemianopia: Side | null; hemianopiaPartial: boolean;
  sensory: Side | null;
  ataxia: boolean;
  /** NIH-stroke-scale-style item scores and total (approximate, for teaching) */
  nihss: { items: Record<string, number>; total: number };
  findings: string[];
}
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const other = (s: Side): Side => (s === 'L' ? 'R' : 'L');

/** fraction of a territory that is not working (0–1) */
function dysfunction(st: NeuroState, sys: Systemic) {
  const ts = territoryStates(st, sys); const reopened = st.recanalizedAt != null && st.minutes >= st.recanalizedAt;
  const d = {} as Record<TerritoryId, { now: number; region: 'all' | 'sup' | 'inf' }>;
  for (const id of Object.keys(ts) as TerritoryId[]) {
    const t = ts[id]; const vol = TERRITORY_ML[id] * (t.flow.affected || 1);
    d[id] = { now: clamp((t.coreMl + (reopened ? 0 : t.penumbraMl)) / Math.max(1, vol)), region: t.flow.region };
  }
  return d;
}

export function neuroExam(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC, o: ExamOptions = {}): NeuroExam {
  const dom: Side = o.dominant ?? 'L'; const d = dysfunction(st, sys); const f: string[] = [];
  const hemi = (S: Side) => {
    const mca = d[`MCA_${S}` as TerritoryId], aca = d[`ACA_${S}` as TerritoryId], pca = d[`PCA_${S}` as TerritoryId];
    const sup = mca.region === 'inf' ? 0 : mca.now; const inf = mca.region === 'sup' ? 0 : mca.now; const deep = mca.region === 'all' ? mca.now : 0;
    return { sup, inf, deep, aca: aca.now, pca: pca.now };
  };
  const H = { L: hemi('L'), R: hemi('R') };
  const vb = d.VB.now;
  // haemorrhage: deep (basal ganglia / capsule) haematoma on the side of its x coordinate
  const h = effectiveHemorrhage(st, sys); let ichSide: Side | null = null, ich = 0;
  if (h?.kind === 'ich') { ichSide = h.at[0] >= 0 ? 'L' : 'R'; ich = clamp(h.volumeMl / 45); }
  const sah = h?.kind === 'sah' ? clamp(h.volumeMl / 25) : 0;

  // motor: limbs on the side opposite the lesion
  const armLoss = (S: Side) => clamp(Math.max(0.95 * H[S].sup, 0.9 * H[S].deep, 0.35 * H[S].aca, ichSide === S ? ich : 0, 0.8 * vb));
  const legLoss = (S: Side) => clamp(Math.max(0.35 * H[S].sup, 0.85 * H[S].deep, 0.95 * H[S].aca, ichSide === S ? 0.9 * ich : 0, 0.8 * vb));
  const pw = (loss: number) => Math.round(5 * (1 - loss));
  const power = { armR: pw(armLoss('L')), legR: pw(legLoss('L')), armL: pw(armLoss('R')), legL: pw(legLoss('R')) };

  // face: lower facial weakness opposite a cortical/capsular lesion
  const faceL = Math.max(H.R.sup, H.R.deep, ichSide === 'R' ? ich : 0), faceR = Math.max(H.L.sup, H.L.deep, ichSide === 'L' ? ich : 0);
  const fw = Math.max(faceL, faceR, 0.6 * vb); const face = { side: fw < 0.15 ? null : faceR >= faceL ? 'R' as Side : 'L' as Side, grade: (fw < 0.15 ? 0 : fw < 0.45 ? 1 : fw < 0.85 ? 2 : 3) as 0 | 1 | 2 | 3 };

  // gaze: eyes look toward a large hemispheric lesion (frontal eye field); brainstem → gaze palsy
  const fefL = Math.max(H.L.sup, ichSide === 'L' ? ich * 0.8 : 0), fefR = Math.max(H.R.sup, ichSide === 'R' ? ich * 0.8 : 0);
  const gaze = { deviation: Math.max(fefL, fefR) > 0.45 ? (fefL >= fefR ? 'L' as Side : 'R' as Side) : null, palsy: vb > 0.35 };

  // language (dominant hemisphere) and neglect (non-dominant)
  const dm = H[dom]; const nd = H[other(dom)];
  const expr = Math.max(dm.sup, dm.deep * 0.5, ichSide === dom ? ich * 0.5 : 0), rec = dm.inf;
  const aphasiaSeverity = clamp(Math.max(expr, rec));
  const aphasia: NeuroExam['aphasia'] = aphasiaSeverity < 0.15 ? 'none' : expr > 0.3 && rec > 0.3 ? 'global' : expr >= rec ? 'expressive' : 'receptive';
  const negl = Math.max(nd.inf, nd.sup * 0.6, ichSide === other(dom) ? ich * 0.5 : 0);
  const neglect = negl > 0.3 ? dom : null; // non-dominant (usually right) lesion → neglect of the dominant side of space (usually left)
  // vision: PCA → contralateral homonymous hemianopia; MCA inferior division → partial (optic radiation)
  const hvL = Math.max(H.R.pca, 0.5 * H.R.inf), hvR = Math.max(H.L.pca, 0.5 * H.L.inf);
  const hv = Math.max(hvL, hvR); const hemianopia = hv > 0.25 ? (hvR >= hvL ? 'R' as Side : 'L' as Side) : null;
  const sensL = Math.max(H.R.sup, H.R.deep, H.R.pca * 0.3), sensR = Math.max(H.L.sup, H.L.deep, H.L.pca * 0.3);
  const sensory = Math.max(sensL, sensR) > 0.3 ? (sensR >= sensL ? 'R' as Side : 'L' as Side) : null;
  const dysarthria = (Math.max(fw * 0.7, vb) < 0.25 ? 0 : Math.max(fw * 0.7, vb) < 0.6 ? 1 : 2) as 0 | 1 | 2;
  const ataxia = vb > 0.2;
  // consciousness: brainstem, very large hemispheric lesions, large haematoma or SAH
  const bigHemi = Math.max(H.L.sup + H.L.inf + H.L.deep, H.R.sup + H.R.inf + H.R.deep) / 3;
  const gcs = Math.round(clamp(15 - 11 * vb - 4 * clamp(bigHemi - 0.5, 0, 0.5) * 2 - 6 * clamp(ich - 0.6, 0, 0.4) / 0.4 - 5 * sah, 3, 15));
  const drift = Math.min(power.armL, power.armR) <= 4 ? (power.armL < power.armR ? 'L' : 'R') : null;

  // NIHSS-style scoring (approximate)
  const armScore = (p: number) => (p >= 5 ? 0 : p === 4 ? 1 : p === 3 ? 2 : p >= 1 ? 3 : 4);
  const items: Record<string, number> = {
    '1a LOC': gcs >= 15 ? 0 : gcs >= 13 ? 1 : gcs >= 9 ? 2 : 3, '2 Gaze': gaze.palsy ? 2 : gaze.deviation ? (Math.max(fefL, fefR) > 0.75 ? 2 : 1) : 0,
    '3 Visual': hemianopia ? (hv > 0.6 ? 2 : 1) : 0, '4 Face': face.grade, '5 Arm L': armScore(power.armL), '5 Arm R': armScore(power.armR), '6 Leg L': armScore(power.legL), '6 Leg R': armScore(power.legR),
    '7 Ataxia': ataxia && Math.min(power.armL, power.armR) > 2 ? 1 : 0, '8 Sensory': sensory ? (Math.max(sensL, sensR) > 0.7 ? 2 : 1) : 0,
    '9 Language': aphasia === 'none' ? 0 : aphasiaSeverity < 0.45 ? 1 : aphasiaSeverity < 0.8 ? 2 : 3, '10 Dysarthria': dysarthria, '11 Neglect': neglect ? (negl > 0.65 ? 2 : 1) : 0,
  };
  const total = Object.values(items).reduce((a, b) => a + b, 0);

  // plain-language findings
  if (gcs < 15) f.push(`Reduced consciousness (GCS ≈ ${gcs})`);
  if (gaze.palsy) f.push('Gaze palsy (brainstem)'); else if (gaze.deviation) f.push(`Eyes deviated to the ${gaze.deviation === 'L' ? 'left' : 'right'} (toward the lesion)`);
  if (face.side) f.push(`${face.side === 'L' ? 'Left' : 'Right'} lower facial weakness`);
  for (const [k, side] of [['armL', 'left arm'], ['armR', 'right arm'], ['legL', 'left leg'], ['legR', 'right leg']] as const) if (power[k] < 5) f.push(`${side[0].toUpperCase() + side.slice(1)} power ${power[k]}/5`);
  if (drift) f.push(`${drift === 'L' ? 'Left' : 'Right'} pronator drift`);
  if (aphasia !== 'none') f.push({ expressive: 'Expressive (non-fluent) aphasia', receptive: 'Receptive (fluent) aphasia', global: 'Global aphasia' }[aphasia]);
  if (neglect) f.push(`Neglect of the ${neglect === 'L' ? 'left' : 'right'} side of space`);
  if (hemianopia) f.push(`${hemianopia === 'L' ? 'Left' : 'Right'} homonymous ${hv > 0.6 ? 'hemianopia' : 'field defect'}`);
  if (sensory) f.push(`${sensory === 'L' ? 'Left' : 'Right'}-sided sensory loss`);
  if (dysarthria) f.push(dysarthria === 2 ? 'Severe dysarthria' : 'Dysarthria');
  if (ataxia) f.push('Ataxia / incoordination');
  if (sah > 0.2) f.push('Thunderclap headache, neck stiffness');
  return { gcs, power, face, gaze, drift, aphasia, aphasiaSeverity, neglect, dysarthria, hemianopia, hemianopiaPartial: hv <= 0.6, sensory, ataxia, nihss: { items, total }, findings: f };
}

/** The same patient 24 h later: reopened now vs never reopened (from an identical starting state). */
export function examOutcomes(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC, o: ExamOptions = {}) {
  const occluded = Object.keys(st.occlusion).length > 0 && st.recanalizedAt == null;
  return {
    now: neuroExam(st, sys, o),
    reopened: occluded ? neuroExam({ ...st, minutes: Math.max(st.minutes, 1440), recanalizedAt: st.minutes }, sys, o) : null,
    never: occluded ? neuroExam({ ...st, minutes: Math.max(st.minutes, 1440), recanalizedAt: null }, sys, o) : null,
  };
}
