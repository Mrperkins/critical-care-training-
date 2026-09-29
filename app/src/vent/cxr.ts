/**
 * Synthetic portable AP chest X-ray (supine, ventilated) — a pure function of the VENT session state.
 * `cxrFromVent(session)` reads the same mechanics the ventilator uses (pleural collapse per side,
 * recruitment = open fraction, tension, bronchial plug, auto-PEEP, drain / needle) into a small
 * `CxrState`; `renderCxr(state)` draws it. Schematic teaching radiograph: generic anatomy, deterministic
 * texture, no patient images. Radiological convention: patient's RIGHT on the image LEFT.
 */
import type { VentSession } from './session';
import { vnoise, hash, clamp } from '../scene/ultrasound/bmode';

export interface CxrSide { /** pleural air: fraction of the hemithorax width lost to air */ ptx: number; /** lobar/lung collapse from airway obstruction */ atelectasis: number; /** diffuse airspace opacity 0–1 */ opacity: number; /** effusion 0–1 */ effusion: number }
export interface CxrState {
  side: [CxrSide, CxrSide]; // 0 = right, 1 = left
  tension: number; /** interstitial / alveolar oedema pattern (perihilar, Kerley lines) */ edema: number; /** patchy bilateral airspace disease with air bronchograms */ ards: number;
  hyperinflation: number; habitus: number; /** cardiothoracic ratio */ ctr: number;
  ett: { aboveCarinaCm: number } | null; drain: boolean; needle: boolean;
}
export const NORMAL_CXR: CxrState = { side: [{ ptx: 0, atelectasis: 0, opacity: 0, effusion: 0 }, { ptx: 0, atelectasis: 0, opacity: 0, effusion: 0 }], tension: 0, edema: 0, ards: 0, hyperinflation: 0, habitus: 0, ctr: 0.47, ett: { aboveCarinaCm: 4.5 }, drain: false, needle: false };

/** Read the radiograph's inputs from the live vent session. */
export function cxrFromVent(S: VentSession): CxrState {
  const id = S.sc.id; const m = S.m; const rec = S.sc.lung.recruitable ?? 0;
  const side = [0, 1].map((k) => {
    const c = m.lung.comps[k]; const closed = 1 - m.openFrac(k); // recruitable units collapsed now (0 … rec)
    const base = id === 'ards' ? 0.3 : id === 'edema' ? 0.2 : id === 'obesity' ? 0.05 : 0;
    const opacity = clamp(base + (rec > 0 ? (closed / rec) * (id === 'obesity' ? 0.35 : 0.55) : 0));
    const plug = k === 0 && S.plugR != null ? clamp((S.plugR - 4) / 146) : 0;
    return { ptx: id === 'ptx' ? clamp(c.collapsed) : 0, atelectasis: plug, opacity, effusion: id === 'edema' ? 0.45 : 0 };
  }) as [CxrSide, CxrSide];
  const auto = m.ventilation().autoPeep;
  const hyper = id === 'asthma' || id === 'copd' ? clamp((id === 'copd' ? 0.55 : 0.3) + auto / 12) : 0;
  return { side, tension: m.lung.tension, edema: id === 'edema' ? 1 : 0, ards: id === 'ards' ? 1 : 0, hyperinflation: hyper, habitus: id === 'obesity' ? 1 : 0,
    ctr: id === 'edema' ? 0.62 : hyper > 0 ? 0.42 : 0.47, ett: { aboveCarinaCm: 4.5 }, drain: S.tubeT >= 0, needle: S.decompT >= 0 };
}

/** Geometry shared by the renderer and the tests (x ∈ [−1, 1], image-left = patient right; y ∈ [0, 1] top → bottom). */
export function geometry(st: CxrState) {
  // mediastinal shift toward +x (image right = patient LEFT) is positive: tension pushes away from the air; collapse pulls toward it
  const push = Math.min(0.2, st.tension * 0.022) * (st.side[0].ptx >= st.side[1].ptx ? 1 : -1);
  const pull = 0.14 * (st.side[1].atelectasis - st.side[0].atelectasis);
  const shift = push + pull;
  const dome = [0, 1].map((k) => {
    const s = st.side[k]; let base = 0.76 + (k === 0 ? -0.025 : 0) + 0.08 * st.hyperinflation - 0.07 * st.habitus - 0.12 * s.atelectasis;
    let amp = 0.085 * (1 - 0.7 * st.hyperinflation);
    if (s.ptx > 0 && st.tension > 2) { base += 0.05 * s.ptx; amp *= 1 - 0.8 * s.ptx; } // depressed, flattened
    return { base, amp };
  });
  return { shift, dome, carinaY: 0.33 };
}
const domeY = (g: ReturnType<typeof geometry>, k: number, x: number) => { const d = g.dome[k]; const t = clamp((Math.abs(x) - 0.12) / 0.72); return d.base - d.amp * Math.sin(Math.PI * Math.min(1, t * 1.05)) * 0.9 + (t > 0.92 ? (t - 0.92) * 0.9 : 0); };

export interface CxrImage { rgba: Uint8ClampedArray; w: number; h: number }
/** Render the radiograph (grey-scale RGBA). Pure. */
export function renderCxr(st: CxrState, W = 240): CxrImage {
  const H = Math.round(W * 1.08); const rgba = new Uint8ClampedArray(W * H * 4); const g = geometry(st);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = ((i + 0.5) / W) * 2 - 1, y = (j + 0.5) / H;
    put(rgba, (j * W + i) * 4, pixel(st, g, x, y, i, j));
  }
  return { rgba, w: W, h: H };
}
function put(rgba: Uint8ClampedArray, o: number, v: number) { const c = Math.round(255 * clamp(v)); rgba[o] = c; rgba[o + 1] = c; rgba[o + 2] = c; rgba[o + 3] = 255; }

const ASPECT = 2.16; // one y unit is this many x units on screen (image is 2 wide, 1.08 tall)
/** Mediastinal border distance from the (shifted) midline on side k at height y: upper mediastinum, aortic knob (left), heart. */
function border(st: CxrState, k: number, y: number) {
  const hz = Math.sqrt(Math.max(0, 1 - ((y - 0.66) / 0.15) ** 2)); const heartW = st.ctr * 1.64;
  if (k === 0) return 0.1 + (y > 0.5 ? 0.3 * heartW * hz * 0.45 : 0);
  return 0.1 + (y > 0.5 ? Math.max(0, heartW * 0.7 * hz - 0.1) : y > 0.3 && y < 0.43 ? 0.06 * Math.sin((Math.PI * (y - 0.3)) / 0.13) : 0);
}
/** Signed margin inside the NORMAL lung field of side k (> 0 inside, x units). */
function lungMargin(st: CxrState, g: ReturnType<typeof geometry>, k: number, x: number, y: number) {
  const sx = k === 0 ? -1 : 1; const ax = sx * (x - g.shift); if (ax <= 0) return -1;
  const u = (Math.abs(x) - 0.38) / 0.46; const top = 0.075 + 0.2 * u * u; // rounded apex (fixed chest wall — does not move with the mediastinum)
  return Math.min(ax - border(st, k, y), 0.86 - Math.abs(x), (y - top) * ASPECT, (domeY(g, k, x) - y) * ASPECT);
}

/** Brightness at a point (0 black = air … 1 white = bone / metal). */
export function pixel(st: CxrState, g: ReturnType<typeof geometry>, x: number, y: number, i = 0, j = 0): number {
  const grain = 0.022 * (hash(i, j) - 0.5);
  const halfBody = 0.97 - 0.3 * (Math.max(0, 0.13 - y) / 0.13) ** 1.5; // rounded shoulders
  if (Math.abs(x) > halfBody) return 0.04 + grain;
  const k = x - g.shift < 0 ? 0 : 1; const sx = k === 0 ? -1 : 1; const s = st.side[k];
  const dy = domeY(g, k, x);
  let v = 0.36 + 0.1 * st.habitus + 0.07 * clamp((Math.abs(x) - 0.84) / 0.12); // chest wall soft tissue
  const xm = x - g.shift; if (xm > -border(st, 0, y) && xm < border(st, 1, y) && y < dy + 0.03) v = 0.66 + 0.04 * vnoise(x * 6, y * 6); // mediastinum
  const m = lungMargin(st, g, k, x, y);
  if (m > 0) {
    const hx = sx * 0.21 + g.shift, hy = 0.45; const r = Math.hypot(x - hx, (y - hy) * 1.4); const ang = Math.atan2((y - hy) * 1.4, x - hx);
    // vascular markings: broken, branching streaks from the hilum that fade toward the periphery
    const streak = Math.pow(1 - Math.abs(Math.sin(ang * 17 + 4 * vnoise(r * 6, ang * 3))), 6) * (0.3 + 0.7 * vnoise(r * 14 + ang * 5, ang * 9));
    const vessel = streak * clamp(1 - r / 0.7) * 0.12 * (1 - 0.5 * st.hyperinflation) + 0.09 * clamp(1 - r / 0.22);
    let lung = 0.12 - 0.035 * st.hyperinflation + vessel * (1 - 0.8 * s.opacity) + 0.04 * st.habitus; // consolidation hides the vessels
    // pneumothorax: the lung shrinks toward its hilum (a homothety of its own outline); outside it, pleural air without markings
    if (s.ptx > 0) {
      const f = 1 - 0.72 * s.ptx; const mc = lungMargin(st, g, k, hx + (x - hx) / f, hy + (y - hy) / f) * f;
      if (mc < 0) lung = 0.045 + 0.012 * vnoise(x * 9, y * 9);
      else lung += s.ptx * 0.25 * clamp(1 - mc * 4);
      if (Math.abs(mc) < 0.007) lung = 0.55;
    }
    if (s.atelectasis > 0) lung += s.atelectasis * 0.48 * (0.85 + 0.15 * vnoise(x * 4, y * 4));
    if (st.edema > 0) {
      lung += st.edema * (0.3 * Math.exp(-((r / 0.32) ** 2)) + 0.06);
      if (m > 0.012 && m < 0.07 && y > 0.52 && y < dy - 0.08 && Math.abs(((y * 70) % 1) - 0.5) < 0.07 && vnoise(y * 30, k) > 0.4) lung += 0.1 * st.edema; // septal lines at the lower periphery
    }
    if (s.opacity > 0) {
      const patch = st.ards ? 0.45 + 0.55 * vnoise(x * 5 + k * 7, y * 5) : 0.85; const dependent = st.ards ? 1 : clamp((y - 0.42) / 0.3);
      lung += s.opacity * 0.5 * patch * dependent;
      if (st.ards && s.opacity > 0.25) lung -= Math.pow(1 - Math.abs(Math.sin(ang * 7 + 1.5 * vnoise(r * 3, ang * 2))), 30) * clamp(1 - r / 0.42) * (vnoise(r * 10, ang * 4) > 0.35 ? 1 : 0.3) * s.opacity * 0.4; // air bronchograms: dark branching tubes inside the opacity
    }
    if (s.effusion > 0) { const top = dy - s.effusion * 0.15 - 0.06 * clamp(1 - m * 6) * s.effusion; if (y > top) lung += 0.28 * s.effusion; lung += 0.07 * s.effusion * clamp((y - 0.35) / 0.4); }
    v = lung;
  }
  // trachea and main bronchi (air columns)
  const tx = g.shift * 0.7;
  if (y < g.carinaY && y > 0.02 && Math.abs(x - tx) < 0.034) v = Math.min(v, 0.22);
  if (y >= g.carinaY && y < 0.44) { const t = (y - g.carinaY) / 0.11; for (const b of [-1, 1]) { const bx = tx + b * t * (b < 0 ? 0.15 : 0.19); if (Math.abs(x - bx) < 0.02 && !(b < 0 && st.side[0].atelectasis > 0.5)) v = Math.min(v, 0.24); } }
  // abdomen below the domes; gastric bubble under the left dome
  if (y >= dy && Math.abs(x) < 0.9) { v = 0.5 + 0.04 * vnoise(x * 3, y * 3); if (k === 1 && ((x - 0.36) / 0.13) ** 2 + ((y - domeY(g, 1, 0.36) - 0.045) / 0.04) ** 2 < 1) v = 0.22; }
  // spine
  if (Math.abs(x - g.shift * 0.4) < 0.055 && y > 0.04) v += 0.07 + 0.05 * (Math.abs(((y * 14) % 1) - 0.5) < 0.07 ? 1 : 0);
  // posterior ribs: arcs sloping down laterally (wider spaces on a tension side), clavicles
  const spread = s.ptx > 0 && st.tension > 2 ? 1.1 : 1; const ax = Math.abs(x);
  if (ax > 0.1 && ax < 0.9 && y < dy + 0.03) for (let n = 0; n < 10; n++) { const ry = 0.1 + n * 0.068 * spread + 0.12 * ax * ax - 0.02 * ax; v += 0.09 * clamp(1 - Math.abs(y - ry) / 0.011); }
  v += 0.2 * clamp(1 - Math.abs(y - (0.088 - 0.035 * ax)) / 0.012) * (ax > 0.07 && ax < 0.62 ? 1 : 0);
  // devices: ETT radio-opaque stripe, chest drain toward the apex, decompression catheter
  if (st.ett) { const tip = g.carinaY - st.ett.aboveCarinaCm * 0.021; if (y < tip && Math.abs(Math.abs(x - tx) - 0.017) < 0.005) v = 0.95; }
  if (st.drain) { const tt = (y - 0.2) / 0.45; if (tt >= 0 && tt <= 1 && Math.abs(x - (-0.5 - 0.3 * tt * tt)) < 0.011) v = 0.9; }
  if (st.needle && Math.abs(x + 0.45) < 0.006 && y > 0.18 && y < 0.24) v = 0.95;
  return clamp(v + grain);
}

/** What a reader would say about this film (derived from the same state). */
export function cxrFindings(st: CxrState): string[] {
  const f: string[] = []; const g = geometry(st); const nm = ['Right', 'Left'];
  st.side.forEach((s, k) => {
    if (s.ptx > 0.1) f.push(`${nm[k]} pneumothorax: visible pleural edge, no lung markings beyond it${st.tension > 2 ? '; depressed, flattened hemidiaphragm and wider rib spaces' : ''}.`);
    if (s.atelectasis > 0.3) f.push(`${nm[k]} lung collapse: dense, airless hemithorax with volume loss — elevated hemidiaphragm, mediastinum pulled toward it.`);
    if (s.effusion > 0.2) f.push(`${nm[k]} effusion: dependent haze and a blunted costophrenic angle.`);
  });
  if (Math.abs(g.shift) > 0.05) f.push(`Mediastinum shifted to the ${g.shift > 0 ? 'left' : 'right'} (${st.tension > 2 ? 'pushed away by tension' : 'pulled toward collapse'}).`);
  if (st.edema) f.push('Perihilar "bat-wing" opacity, septal lines at the bases and an enlarged heart: pulmonary oedema.');
  const op = (st.side[0].opacity + st.side[1].opacity) / 2;
  if (st.ards) f.push(op > 0.45 ? 'Bilateral patchy airspace opacities with air bronchograms, normal heart size: ARDS pattern.' : 'Bilateral opacities, less dense as the lung is recruited.');
  else if (!st.edema && op > 0.12) f.push('Basal opacity from dependent collapse (low lung volumes).');
  if (st.hyperinflation > 0.25) f.push('Hyperinflated, hyperlucent lungs with low, flat hemidiaphragms and a narrow heart.');
  if (st.habitus) f.push('Soft-tissue shadow over both lungs and low volumes (habitus) — do not over-read as consolidation.');
  if (st.ett) f.push(`Endotracheal tube tip ${st.ett.aboveCarinaCm.toFixed(1)} cm above the carina.`);
  if (st.drain) f.push('Right chest drain directed toward the apex.'); if (st.needle && !st.drain) f.push('Decompression catheter in the right 2nd intercostal space.');
  if (!f.some((l) => /pneumothorax|collapse|oedema|ARDS|opacit|Hyperinflated|effusion|shift/.test(l))) f.push('Clear lungs, normal heart size, no pneumothorax.');
  return f;
}
