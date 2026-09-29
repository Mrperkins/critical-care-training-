/**
 * Abdominal pathology state (pure) and the teaching signs derived from it. One state drives the 3D
 * abdomen, the FAST windows, the shock estimate and the lessons. Teaching values, not clinical rules.
 */
export type Organ = 'liver' | 'spleen' | 'kidney_L' | 'kidney_R' | 'pancreas' | 'bowel';
export type FluidKind = 'blood' | 'ascites' | 'enteric';
export interface AbdomenState {
  /** organ injury grade 0–5 (AAST-style scale, teaching) */ injury: Partial<Record<Organ, number>>;
  /** intraperitoneal free fluid, mL, and what it is */ freeFluidMl: number; fluidKind: FluidKind;
  /** retroperitoneal haematoma, mL */ retroMl: number;
  aaa: { diameterCm: number; rupture: 'none' | 'contained' | 'free' };
  /** aortic dissection (null = none): Stanford type, how far distally it runs, false-lumen flow, branches fed only by a thrombosed false lumen */
  dissection: Dissection | null;
  freeAir: boolean;
  obstruction: 'none' | 'small' | 'large';
  /** bowel distension 0–1 */ distension: number;
  /** superior-mesenteric ischaemia 0–1 */ ischaemia: number;
  /** pancreatic inflammation 0–1 */ pancreatitis: number;
  /** minutes since the event (bleeding accumulates, ischaemia progresses) */ minutes: number;
}
export interface Dissection { type: 'A' | 'B'; extent: 'thoracic' | 'renal' | 'iliac'; falseLumen: 'patent' | 'thrombosed'; malperfusion: { renalL?: boolean; renalR?: boolean; mesenteric?: boolean } }
export const emptyAbdomen = (): AbdomenState => ({ injury: {}, freeFluidMl: 0, fluidKind: 'blood', retroMl: 0, aaa: { diameterCm: 2, rupture: 'none' }, dissection: null, freeAir: false, obstruction: 'none', distension: 0, ischaemia: 0, pancreatitis: 0, minutes: 0 });

/** bleeding rate (mL/min) from an injured organ grade — solid organs bleed more with grade */
export const bleedRate = (organ: Organ, grade: number) => (grade <= 0 ? 0 : (organ === 'spleen' ? 3 : organ === 'liver' ? 3.5 : organ.startsWith('kidney') ? 4 : 2) * grade ** 1.6);

/** Where intraperitoneal fluid collects (supine): shares of the free fluid in each FAST-relevant space. */
export function fluidDistribution(st: AbdomenState) {
  const src = (['liver', 'spleen'] as const).map((o) => ({ o, g: st.injury[o] ?? 0 }));
  const fromLiver = src[0].g, fromSpleen = src[1].g; const tot = Math.max(1e-6, fromLiver + fromSpleen);
  // Morison's pouch is the most dependent upper-abdominal space; blood from the spleen reaches it via the left paracolic gutter only once the splenorenal space fills
  const none = fromLiver + fromSpleen <= 0; const liverShare = none ? 0.5 : fromLiver / tot, spleenShare = none ? 0.5 : fromSpleen / tot; const V = st.freeFluidMl;
  const ruq = V * (0.4 * liverShare + 0.18 * spleenShare) * sat(V, 150);
  const luq = V * (0.08 * liverShare + 0.3 * spleenShare) * sat(V, 150);
  const pelvis = V * 0.35 * sat(V, 350); // reached via the paracolic gutters once the upper spaces overflow
  const gutters = Math.max(0, V - ruq - luq - pelvis);
  return { ruq, luq, pelvis, gutters };
}
const sat = (v: number, k: number) => v / (v + k);

export interface FastWindow { id: 'ruq' | 'luq' | 'pelvis' | 'pericardial'; name: string; positive: boolean; ml: number; note: string }
/** FAST: ≈ 100–250 mL of intraperitoneal fluid is needed before a window turns positive (teaching). */
export function fastExam(st: AbdomenState): FastWindow[] {
  const d = fluidDistribution(st); const th = 45;
  return [
    { id: 'ruq', name: 'RUQ — Morison’s pouch', positive: d.ruq > th, ml: d.ruq, note: 'hepatorenal space: most sensitive window supine' },
    { id: 'luq', name: 'LUQ — splenorenal', positive: d.luq > th, ml: d.luq, note: 'look above the spleen too (subphrenic)' },
    { id: 'pelvis', name: 'Pelvis — rectovesical / pouch of Douglas', positive: d.pelvis > th * 0.8, ml: d.pelvis, note: 'best with a full bladder' },
    { id: 'pericardial', name: 'Subxiphoid — pericardium', positive: false, ml: 0, note: 'trauma tamponade (see Lines › tamponade)' },
  ];
}

/** Blood lost so far, mL (intraperitoneal blood + retroperitoneal). */
export const bloodLoss = (st: AbdomenState) => (st.fluidKind === 'blood' ? st.freeFluidMl : 0) + st.retroMl;
export interface ShockClass { cls: 1 | 2 | 3 | 4; lossMl: number; lossPct: number; hr: number; sbp: number; rr: number; urine: number; mental: string }
/** Haemorrhage class from estimated loss (70 kg, 5 L blood volume). Vital-sign trends are the classic teaching table — individual patients differ. */
export function shockClass(st: AbdomenState): ShockClass {
  const loss = bloodLoss(st); const pct = loss / 5000;
  const cls = (pct < 0.15 ? 1 : pct < 0.3 ? 2 : pct < 0.4 ? 3 : 4) as 1 | 2 | 3 | 4;
  // piecewise-linear through the classic table: pressure holds through class II and falls in III–IV
  const at = (ys: number[]) => Math.round(lerpTable(pct, [0, 0.15, 0.3, 0.4, 0.5], ys));
  return { cls, lossMl: loss, lossPct: pct * 100, hr: at([76, 98, 118, 138, 158]), sbp: at([120, 118, 108, 84, 60]), rr: at([14, 18, 25, 33, 38]), urine: at([50, 32, 22, 8, 0]), mental: cls === 1 ? 'slightly anxious' : cls === 2 ? 'anxious' : cls === 3 ? 'confused' : 'lethargic' };
}

const TAMP = 240;
function lerpTable(x: number, xs: number[], ys: number[]) {
  if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + ((x - xs[i - 1]) / (xs[i] - xs[i - 1])) * (ys[i] - ys[i - 1]);
  return ys[ys.length - 1];
}
/** Advance the state by `minutes` of untreated bleeding / progression (pure). */
export function evolve(st: AbdomenState, minutes: number): AbdomenState {
  const s = structuredClone(st); const dt = Math.max(0, minutes);
  let rate = 0; for (const [o, g] of Object.entries(s.injury)) if (o === 'liver' || o === 'spleen') rate += bleedRate(o as Organ, g ?? 0);
  // clot and falling pressure slow the bleed over time: rate·e^(−t/τ), integrated exactly so that
  // evolve(evolve(s, a), b) equals evolve(s, a + b) (seekable lessons)
  s.freeFluidMl += rate * TAMP * (Math.exp(-s.minutes / TAMP) - Math.exp(-(s.minutes + dt) / TAMP));
  if (s.aaa.rupture === 'contained') s.retroMl += 12 * dt;
  if (s.aaa.rupture === 'free') { s.freeFluidMl += 90 * dt; s.fluidKind = 'blood'; }
  for (const k of ['kidney_L', 'kidney_R'] as const) s.retroMl += bleedRate(k, s.injury[k] ?? 0) * dt * 0.8;
  if (s.ischaemia > 0) s.ischaemia = Math.min(1, s.ischaemia + dt / 600);
  s.minutes += dt; return s;
}

/** Plain-language findings for the side panel. */
export function abdomenFindings(st: AbdomenState): string[] {
  const f: string[] = []; const sc = shockClass(st); const fast = fastExam(st);
  if (bloodLoss(st) > 100) f.push(`Estimated blood loss ${Math.round(bloodLoss(st))} mL — class ${['I', 'II', 'III', 'IV'][sc.cls - 1]}`);
  const pos = fast.filter((w) => w.positive).map((w) => w.id.toUpperCase()); if (st.freeFluidMl > 0) f.push(pos.length ? `FAST positive: ${pos.join(', ')}` : 'FAST negative so far (too little free fluid)');
  if (st.retroMl > 200) f.push('Retroperitoneal haematoma — FAST does not see it; flank / back pain, Grey Turner sign late');
  if (st.aaa.diameterCm >= 3) f.push(`Abdominal aortic aneurysm ${st.aaa.diameterCm.toFixed(1)} cm${st.aaa.diameterCm >= 5.5 ? ' (above the usual repair threshold)' : ''}`);
  if (st.aaa.rupture !== 'none') f.push(st.aaa.rupture === 'contained' ? 'Contained rupture into the retroperitoneum' : 'Free intraperitoneal rupture');
  if (st.dissection) { const d = st.dissection; f.push(`Aortic dissection, Stanford type ${d.type}${d.type === 'A' ? ' (ascending aorta involved — surgical emergency)' : ' (descending only)'}, extending to the ${d.extent === 'thoracic' ? 'thoracic aorta' : d.extent === 'renal' ? 'renal arteries' : 'iliac arteries'}; false lumen ${d.falseLumen}`);
    const m = d.malperfusion; const mal = [m.renalL && 'left kidney', m.renalR && 'right kidney', m.mesenteric && 'bowel'].filter(Boolean); if (mal.length) f.push(`Malperfusion: ${mal.join(', ')} fed from a thrombosed false lumen`); }
  if (st.freeAir) f.push('Free air under the diaphragm — perforated viscus');
  if (st.obstruction !== 'none') f.push(`${st.obstruction === 'small' ? 'Small' : 'Large'}-bowel obstruction: dilated loops, vomiting, distension`);
  if (st.ischaemia > 0.05) f.push(`Mesenteric ischaemia — pain out of proportion to the examination${st.ischaemia > 0.6 ? '; bowel infarcting, lactate rising' : ''}`);
  if (st.pancreatitis > 0.05) f.push('Acute pancreatitis — swollen pancreas, peripancreatic fluid, epigastric pain to the back');
  for (const [o, g] of Object.entries(st.injury)) if ((g ?? 0) > 0) f.push(`${o.replace('_', ' ')} injury grade ${g}`);
  return f;
}
