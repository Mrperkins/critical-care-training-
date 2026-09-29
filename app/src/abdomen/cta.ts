/**
 * Synthetic CT angiogram (arterial phase, axial) of the aorta drawn from the SAME `AbdomenState` as the
 * 3D abdomen and the FAST views: aneurysm diameter, mural thrombus, contained / free rupture, and
 * aortic dissection (flap, true vs false lumen, type A vs B, distal extent, branch malperfusion).
 * Pure: state + level → Hounsfield units → grey-scale RGBA. Schematic generic anatomy, no patient images.
 * Radiological convention: patient's right on the image left, anterior at the top.
 */
import type { AbdomenState } from './state';
import { hash, vnoise, clamp } from '../scene/ultrasound/bmode';

export type CtaLevel = 'chest' | 'celiac' | 'renal' | 'infrarenal' | 'bifurcation';
export const CTA_LEVELS: { id: CtaLevel; name: string; short: string }[] = [
  { id: 'chest', name: 'Chest · pulmonary artery level', short: 'Chest' },
  { id: 'celiac', name: 'Coeliac axis', short: 'Coeliac' },
  { id: 'renal', name: 'Renal arteries', short: 'Renal' },
  { id: 'infrarenal', name: 'Infrarenal aorta', short: 'Infrarenal' },
  { id: 'bifurcation', name: 'Aortic bifurcation · iliacs', short: 'Iliacs' },
];
const CM = 0.057; // image units per cm (body ≈ 35 cm across 2 units)
const HU = { air: -1000, lung: -850, fat: -100, fluid: 10, blood: 45, soft: 45, muscle: 55, liver: 75, spleen: 105, bowel: 50, haematoma: 65, kidneyCx: 185, kidneyMed: 70, contrast: 340, falseLumen: 225, flap: 60, bone: 750, marrow: 260, extravasation: 420 };
const WIN = { L: 100, W: 700 }; // CTA window: contrast vs thrombus vs soft tissue
export const toGrey = (hu: number) => clamp((hu - (WIN.L - WIN.W / 2)) / WIN.W);

const e2 = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;

/** Which aortic segments carry the flap at this level (ascending, descending/abdominal, iliac). */
export function dissectedAt(st: AbdomenState, level: CtaLevel) {
  const d = st.dissection; if (!d) return { ascending: false, aorta: false };
  const reach = { thoracic: 1, renal: 3, iliac: 5 }[d.extent]; const idx = CTA_LEVELS.findIndex((l) => l.id === level);
  return { ascending: level === 'chest' && d.type === 'A', aorta: idx < reach };
}
/** Outer aortic diameter (cm) at this level from the aneurysm state (AAA is infrarenal). */
export function aorticDiameter(st: AbdomenState, level: CtaLevel) {
  const D = st.aaa.diameterCm;
  return level === 'chest' ? 2.6 : level === 'celiac' ? 2.3 : level === 'renal' ? Math.min(D, 2.3) : level === 'infrarenal' ? Math.max(2, D) : Math.max(1.2, Math.min(2, D * 0.35));
}

/** Centre of the abdominal aorta at this level: a large aneurysm bulges anteriorly off the spine. */
export function aortaCenter(st: AbdomenState, level: CtaLevel) { const R = (aorticDiameter(st, level) / 2) * CM; return { x: 0.06, y: 0.13 - Math.max(0, R - 0.09) }; }

/** A vessel cross-section with optional thrombus and dissection flap: HU at (x, y) or null outside. */
function vessel(x: number, y: number, cx: number, cy: number, diamCm: number, o: { thrombus?: number; flap?: { angle: number; fl: 'patent' | 'thrombosed' }; crescent?: boolean } = {}): number | null {
  const R = (diamCm / 2) * CM; const dx = x - cx, dy = y - cy; const r = Math.hypot(dx, dy);
  if (r > R + 0.006) return null;
  if (r > R - 0.006) return HU.soft + 40; // wall (slightly enhancing)
  if (o.thrombus && o.thrombus > 0) { // eccentric lumen toward the anterior-right, circumferential thrombus behind it
    const lr = R * (1 - o.thrombus); const lx = cx - 0.15 * R * o.thrombus, ly = cy - 0.35 * R * o.thrombus;
    if (Math.hypot(x - lx, y - ly) < lr) return HU.contrast;
    if (o.crescent && Math.abs(r - R * 0.8) < 0.008 && dy > 0) return 110; // hyperattenuating crescent: blood tracking into thrombus
    return HU.blood + 5;
  }
  if (o.flap) { // flap: a thin line offset so the true lumen is the smaller, denser side
    const nx = Math.cos(o.flap.angle), ny = Math.sin(o.flap.angle); const s = dx * nx + dy * ny - 0.22 * R;
    if (Math.abs(s) < 0.0065) return HU.flap;
    return s > 0 ? HU.contrast : o.flap.fl === 'patent' ? HU.falseLumen : HU.blood + 10; // the segment beyond the offset flap is the smaller true lumen
  }
  return HU.contrast;
}

/** Hounsfield units at image point (x ∈ [−1, 1] image-left = patient right; y ∈ [−0.72, 0.72], anterior up). Pure. */
export function ctaHU(st: AbdomenState, level: CtaLevel, x: number, y: number): number {
  const chest = level === 'chest';
  const body = e2(x, y, 0, 0.02, chest ? 0.95 : 0.9, chest ? 0.62 : 0.64);
  if (body > 1) return HU.air;
  if (body > 0.86) return HU.fat; // subcutaneous fat
  // spine: vertebral body, canal, posterior elements; paraspinal muscles
  const vb = e2(x, y, 0, 0.36, 0.15, 0.13); if (vb < 1) return vb > 0.8 ? HU.bone : HU.marrow;
  if (e2(x, y, 0, 0.53, 0.05, 0.045) < 1) return HU.fluid + 5; // canal
  if (e2(x, y, 0, 0.6, 0.035, 0.08) < 1 || e2(x, y, 0, 0.5, 0.11, 0.025) < 1) return HU.bone;
  for (const s of [-1, 1]) if (e2(x, y, s * 0.2, 0.52, 0.12, 0.09) < 1) return HU.muscle;
  const dz = dissectedAt(st, level); const flapAngle = { chest: 0.6, celiac: 1.1, renal: 1.6, infrarenal: 2.1, bifurcation: 2.6 }[level];
  const fl = st.dissection?.falseLumen ?? 'patent';
  const D = aorticDiameter(st, level); const thrombus = D > 3.5 ? clamp(1 - 3.2 / D, 0, 0.55) : 0;
  const rupt = st.aaa.rupture; const aneurysmLevel = level === 'infrarenal' || (level === 'renal' && D > 3);
  if (chest) {
    for (const s of [-1, 1]) { const l = e2(x, y, s * 0.5, 0.04, 0.36, 0.44); if (l < 1) { const vsl = vnoise(x * 30, y * 30) > 0.83 ? 60 : 0; return HU.lung + vsl + 40 * (1 - l); } }
    const asc = vessel(x, y, -0.04, -0.2, 3.3, dz.ascending ? { flap: { angle: 0.3, fl } } : {}); if (asc != null) return asc;
    if (e2(x, y, 0.13, -0.17, 0.085, 0.075) < 1) return 280; // pulmonary trunk
    if (e2(x, y, -0.18, -0.16, 0.045, 0.045) < 1) return 520; // SVC with dense contrast inflow
    const des = vessel(x, y, 0.12, 0.2, D, dz.aorta ? { flap: { angle: flapAngle, fl } } : {}); if (des != null) return des;
    if (e2(x, y, 0.02, 0.21, 0.035, 0.03) < 1) return HU.soft; // oesophagus
    if (e2(x, y, 0.02, -0.05, 0.3, 0.2) < 1) return HU.soft - 10; // mediastinal soft tissue / heart base
    return HU.muscle - 5;
  }
  // aorta and IVC
  const { x: ax, y: ay } = aortaCenter(st, level); const Rao = (D / 2) * CM;
  if (level !== 'bifurcation') {
    const a = vessel(x, y, ax, ay, D, dz.aorta ? { flap: { angle: flapAngle, fl } } : aneurysmLevel ? { thrombus, crescent: rupt === 'contained' && level === 'infrarenal' } : {}); if (a != null) return a;
  } else {
    for (const s of [-1, 1]) { const il = vessel(x, y, s * 0.1, 0.15, D, dz.aorta && s > 0 ? { flap: { angle: flapAngle, fl } } : {}); if (il != null) return il; if (e2(x, y, s * 0.12, 0.25, 0.04, 0.03) < 1) return 90; }
  }
  if (level !== 'bifurcation' && e2(x, y, Math.min(-0.13, ax - Rao - 0.075), 0.1, 0.06, 0.045) < 1) return 95; // IVC (mixing, arterial phase) — pushed aside by a large aneurysm
  // rupture: retroperitoneal haematoma to the left of the aorta, active extravasation when free
  if (rupt !== 'none' && (level === 'infrarenal' || level === 'renal' || level === 'bifurcation')) {
    const rr = (0.12 + 0.00035 * st.retroMl) * (level === 'infrarenal' ? 1 : 0.7); const h = e2(x, y, ax + 0.18, ay + 0.1, rr, rr * 0.75) + 0.25 * (vnoise(x * 9, y * 9) - 0.5);
    if (rupt === 'free' && level === 'infrarenal' && e2(x, y, ax + (D / 2) * CM + 0.03, ay + 0.02, 0.05, 0.03) + 0.4 * vnoise(x * 25, y * 25) < 1) return HU.extravasation;
    if (h < 1) return HU.haematoma + 8 * vnoise(x * 20, y * 20);
  }
  if (rupt === 'free' && (level === 'infrarenal' || level === 'bifurcation')) { for (const s of [-1, 1]) if (e2(x, y, s * 0.62, 0.02, 0.1, 0.22) < 1) return HU.blood; } // blood in the paracolic gutters
  // psoas
  for (const s of [-1, 1]) if (e2(x, y, s * (level === 'bifurcation' ? 0.26 : 0.19), 0.33, level === 'renal' ? 0.05 : 0.08, 0.07) < 1) return HU.muscle;
  const mal = st.dissection?.malperfusion ?? {};
  if (level === 'celiac') {
    if (e2(x, y, -0.4, -0.06, 0.5, 0.48) < 1 && x < 0.05) return HU.liver;
    if (e2(x, y, 0.58, 0.18, 0.17, 0.27) < 1) return HU.spleen;
    const sto = e2(x, y, 0.33, -0.26, 0.26, 0.19); if (sto < 1) return y < -0.36 ? HU.air : sto > 0.8 ? HU.bowel + 20 : HU.fluid + 10;
    if (Math.abs(x - ax) < 0.012 && y < ay && y > ay - 0.13) return HU.contrast; // coeliac trunk
    return HU.fat + 20;
  }
  if (level === 'renal') {
    if (e2(x, y, -0.55, -0.12, 0.33, 0.33) < 1) return HU.liver;
    for (const s of [-1, 1]) {
      const kx = s * 0.42, ky = 0.26; const k = e2(x, y, kx, ky, 0.13, 0.19);
      const poor = s > 0 ? mal.renalL : mal.renalR;
      if (k < 1) return k > 0.45 ? (poor ? 75 : HU.kidneyCx) : k < 0.12 ? HU.fat : poor ? 50 : HU.kidneyMed;
      // renal artery from the aorta to the hilum
      const t = (x - ax) / (kx - ax); const ly = ay + t * (ky - 0.03 - ay); if (t > 0 && t < 0.85 && Math.abs(y - ly) < 0.011) return poor ? HU.blood : HU.contrast;
    }
    if (e2(x, y, ax, 0.0, 0.022, 0.022) < 1) return mal.mesenteric ? HU.blood : HU.contrast; // SMA
    if (e2(x, y, 0.02, 0.05, 0.1, 0.018) < 1) return 110; // left renal vein between SMA and aorta
  }
  // bowel loops (anterior abdomen)
  if (e2(x, y, 0, -0.26, 0.72, 0.3) < 1) { const n = vnoise(x * 5 + 3, y * 5 + (level === 'infrarenal' ? 2 : 5)); if (n > 0.55) { const wall = n < 0.6; return wall ? (mal.mesenteric ? 35 : HU.bowel + 30) : vnoise(x * 11, y * 11) > 0.7 ? HU.air : HU.fluid + 15; } }
  return HU.fat + 30 * vnoise(x * 4, y * 4);
}

export interface CtaImage { rgba: Uint8ClampedArray; w: number; h: number }
export interface CtaCrop { cx: number; cy: number; half: number }
/** Magnified window around the aorta at this level (the flap and thrombus are a few mm thick). */
export function aortaCrop(st: AbdomenState, level: CtaLevel): CtaCrop {
  if (level === 'chest') return { cx: 0.04, cy: 0, half: 0.3 };
  if (level === 'bifurcation') return { cx: 0, cy: 0.15, half: 0.2 };
  const c = aortaCenter(st, level); return { cx: c.x, cy: c.y, half: Math.max(0.14, aorticDiameter(st, level) * CM * 0.95) };
}
export function renderCta(st: AbdomenState, level: CtaLevel, W = 240, crop?: CtaCrop): CtaImage {
  const H = Math.round(W * 0.72); const rgba = new Uint8ClampedArray(W * H * 4); const c = crop ?? { cx: 0, cy: 0, half: 1 };
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = c.cx + (((i + 0.5) / W) * 2 - 1) * c.half, y = c.cy + (((j + 0.5) / H) * 2 - 1) * 0.72 * c.half;
    const g = Math.round(255 * toGrey(ctaHU(st, level, x, y) + 14 * (hash(i, j) - 0.5))); const o = (j * W + i) * 4;
    rgba[o] = g; rgba[o + 1] = g; rgba[o + 2] = g; rgba[o + 3] = 255;
  }
  return { rgba, w: W, h: H };
}

/** What a reader would report at this level (from the same state). */
export function ctaFindings(st: AbdomenState, level: CtaLevel): string[] {
  const f: string[] = []; const D = aorticDiameter(st, level); const dz = dissectedAt(st, level); const d = st.dissection;
  if (dz.ascending) f.push('Intimal flap in the ASCENDING aorta: Stanford type A — surgical emergency.');
  if (level === 'chest' && d && !dz.ascending) f.push('Ascending aorta normal; flap in the descending aorta only: Stanford type B.');
  if (dz.aorta && level !== 'chest') f.push(`Dissection flap ${level === 'bifurcation' ? 'extending into the left common iliac' : 'in the abdominal aorta'}: smaller, denser true lumen; ${d!.falseLumen === 'patent' ? 'larger, less dense false lumen' : 'thrombosed false lumen (no contrast)'}.`);
  if (level === 'renal' && d && (d.malperfusion.renalL || d.malperfusion.renalR)) f.push(`${d.malperfusion.renalL ? 'Left' : 'Right'} kidney poorly enhancing: its renal artery arises from the false lumen — malperfusion.`);
  if (level === 'renal' && d && !dz.aorta) f.push('Flap ends above this level; renal arteries fill normally.');
  if ((level === 'infrarenal' || level === 'renal') && D >= 3) f.push(`Aortic diameter ${D.toFixed(1)} cm (outer wall to outer wall)${D > 3.5 ? ' with eccentric mural thrombus; contrast fills only the residual lumen' : ''}.`);
  if (level === 'infrarenal' && st.aaa.rupture === 'contained') f.push('Retroperitoneal haematoma beside the aneurysm, high-attenuation crescent in the thrombus: contained rupture.');
  if (level === 'infrarenal' && st.aaa.rupture === 'free') f.push('Active contrast extravasation and blood in the paracolic gutters: free rupture.');
  if (!f.length) f.push(level === 'chest' ? 'Normal calibre ascending and descending aorta; no flap.' : `Normal calibre aorta (${D.toFixed(1)} cm); no flap, no haematoma.`);
  return f;
}
