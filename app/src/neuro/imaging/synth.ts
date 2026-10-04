/**
 * Synthetic teaching images generated from the SAME neuro state the 3D brain shows (no patient
 * images, no atlas copies). Pure functions: state + slice → RGBA pixels, so they are testable and
 * seekable. Anatomy is schematic (ellipsoidal brain in the normalized brain frame of anatomy.ts);
 * densities follow textbook Hounsfield values and the brain window (W 80 / L 40).
 *
 * Image convention: axial, viewed from the feet (radiological): the patient's RIGHT is on the image
 * LEFT; anterior is at the top.
 */
import * as THREE from 'three';
import { buildCerebralVessels, DEFAULT_BRAIN_FRAME, territoryAt, peripheryAt, toLocal, type TerritoryId } from '../anatomy';
import { territoryStates, cbfAt, hemorrhageShape, effectiveHemorrhage, CBF_NORMAL, type NeuroState, type Systemic, DEFAULT_SYSTEMIC, type TerritoryState } from '../perfusion';
import { vesselPerfusion } from '../vesselFlow';

export type Modality = 'ncct' | 'cta' | 'cbf' | 'tmax';
export const MODALITY_NAME: Record<Modality, string> = { ncct: 'Non-contrast CT', cta: 'CT angiogram (MIP)', cbf: 'CT perfusion · CBF', tmax: 'CT perfusion · Tmax' };
const EXT = 1.2; // image half-width in local brain units

/* ------------------------------------------------------------------ small deterministic noise */
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x: number, y: number) { const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j; const u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v; }
const fbm = (x: number, y: number) => 0.5 * vnoise(x, y) + 0.25 * vnoise(x * 2.1, y * 2.1) + 0.125 * vnoise(x * 4.3, y * 4.3);

/* ------------------------------------------------------------------ tissue at a point */
interface Ctx { st: NeuroState; ts: Record<TerritoryId, TerritoryState>; ly: number; ischMin: number; reopened: boolean; shift: number; ich: { c: THREE.Vector3; r: THREE.Vector3 } | null; /** lateral-ventricle size (1 = normal) */ vscale?: number }
function ctx(st: NeuroState, sys: Systemic, ly: number): Ctx {
  const reopened = st.recanalizedAt != null && st.minutes >= st.recanalizedAt;
  const h = effectiveHemorrhage(st, sys); const hs = h ? hemorrhageShape(h) : null; const H = DEFAULT_BRAIN_FRAME.h;
  return { st, ts: territoryStates(st, sys), ly, ischMin: reopened ? st.recanalizedAt! : st.minutes, reopened,
    shift: hs && h?.kind === 'ich' ? (hs.shiftMm / 100) / H.x * -Math.sign(h.at[0] || 1) : 0,
    ich: h && h.kind === 'ich' && hs ? { c: new THREE.Vector3(...h.at), r: new THREE.Vector3(hs.rCm / 10 / H.x, hs.rCm / 10 / H.y, hs.rCm / 10 / H.z) } : null };
}
/** fraction of the territory state that is core / penumbra at this point (0/1 with a soft edge) */
function fate(c: Ctx, t: TerritoryId, l: THREE.Vector3) {
  const s = c.ts[t]; if (s.coreW <= 0 && s.penW <= 0) return { core: 0, pen: 0, w: 1, s };
  const reg = s.flow.region; if (reg === 'sup' && l.y <= -0.2) return { core: 0, pen: 0, w: 1, s }; if (reg === 'inf' && l.y > -0.2) return { core: 0, pen: 0, w: 1, s };
  const w = peripheryAt(t, l); const sm = (e: number) => 1 - Math.min(1, Math.max(0, (w - e + 0.03) / 0.06));
  const core = sm(s.coreW); return { core, pen: Math.max(0, sm(s.penW) - core), w, s };
}

/** Hounsfield units of the schematic head at local point l (x lateral, y superior, z anterior). */
export function hu(c: Ctx, l: THREE.Vector3): number {
  const rr = Math.hypot(l.x, l.y * 1.02, l.z);
  if (rr > 1.14) return -1000;                      // air
  if (rr > 1.1) return 40;                          // scalp
  if (rr > 1.02) return 1200;                       // skull
  if (rr > 0.975) return 6;                         // subarachnoid CSF
  const q = new THREE.Vector3(l.x - c.shift * Math.max(0, 1 - rr), l.y, l.z); // midline shift, strongest centrally
  // ICH: hyperdense clot with a hypodense oedema rim
  if (c.ich) { const d = Math.hypot((l.x - c.ich.c.x) / c.ich.r.x, (l.y - c.ich.c.y) / c.ich.r.y, (l.z - c.ich.c.z) / c.ich.r.z); if (d < 1) return 68 + 6 * (fbm(l.x * 30, l.z * 30) - 0.5); if (d < 1.35) return 18; }
  // SAH: blood in the basal cisterns and Sylvian fissures
  if (c.st.hemorrhage?.kind === 'sah' && l.y < -0.35) {
    const cis = Math.hypot(q.x / 0.3, (q.z - 0.12) / 0.26) < 1 && Math.hypot(q.x / 0.12, (q.z + 0.02) / 0.1) > 1;
    const syl = Math.abs(Math.abs(q.x) - (0.2 + 0.55 * Math.max(0, q.z + 0.05))) < 0.035 && q.z > -0.05 && q.z < 0.35;
    if (cis || syl) return 62;
  }
  // CSF spaces: lateral ventricles (frontal horns + bodies + occipital horns), third ventricle, Sylvian and interhemispheric fissures
  const vy = l.y; const ax = Math.abs(q.x);
  if (vy > -0.3 && vy < 0.32) {
    const lvl = 1 - Math.abs(vy - 0.02) / 0.3;                      // ventricles are largest mid-height
    const cx = 0.07 + 0.09 * Math.max(0, -q.z) + 0.04 * Math.max(0, q.z - 0.15); // bodies splay laterally toward the occipital horns
    const vs = Math.min(1.9, c.vscale ?? 1); const hw = (0.028 + 0.035 * lvl) * (q.z > 0.18 ? 1.35 : 1) * vs ** 0.75; // frontal horns a little fuller; hydrocephalus balloons them
    if (ax > 0.012 && q.z > -0.48 && q.z < 0.36 && Math.abs(ax - cx) < hw * Math.min(1, (0.36 - q.z) / 0.06) * Math.min(1, (q.z + 0.48) / 0.1)) return 6;
  }
  if (vy < -0.08 && vy > -0.42 && ax < 0.018 * (c.vscale ?? 1) && Math.abs(q.z - 0.02) < 0.13) return 6;
  // temporal horns: slit-like normally, rounded and visible early in hydrocephalus
  if ((c.vscale ?? 1) > 1.3 && vy < -0.25 && vy > -0.5 && Math.abs(ax - 0.33) < 0.02 * (c.vscale ?? 1) && Math.abs(q.z - 0.0) < 0.07) return 6;
  // Sylvian fissure: from the lateral surface in to the insula, nearly transverse, slightly posterior-sloping
  if (vy < 0.05 && vy > -0.58 && ax > 0.5 && ax < 0.97) { const zc = 0.07 - 0.12 * (ax - 0.5) + 0.03 * (fbm(ax * 9, vy * 9) - 0.5); if (Math.abs(q.z - zc) < 0.016 + 0.012 * (ax - 0.5)) return 8; }
  if (ax < 0.012 && (q.z > 0.38 || q.z < -0.46) && vy > -0.45) return 8;
  // grey / white matter: cortical ribbon with gyral undulation, deep grey nuclei
  const gyr = 0.86 + 0.07 * (fbm(l.x * 7 + 3, l.z * 7 + l.y * 5) - 0.5) * 2;
  const deep = Math.hypot((ax - 0.28) / 0.13, (vy + 0.15) / 0.22, (q.z - 0.05) / 0.2) < 1;
  let v = rr > gyr || deep ? 38 : 27;
  v += 2.5 * (fbm(l.x * 40, l.z * 40 + l.y * 17) - 0.5);
  // ischaemia: loss of grey–white differentiation, then frank hypodensity as the core ages
  const t = territoryAt(jitter(l)); const f = fate(c, t, l);
  if (f.core > 0) { const age = Math.min(1, Math.max(0, (c.ischMin - 45) / 360)); v = v + (27 - v) * Math.min(1, c.ischMin / 90) * f.core; v -= 12 * age * f.core; }
  return v;
}
/** territory borders are irregular in life; jitter the lookup (visual only — volumes come from territoryStates) */
const jv = new THREE.Vector3();
function jitter(l: THREE.Vector3) { return jv.set(l.x + (fbm(l.z * 1.9 + 7, l.y * 2.1) - 0.44) * 0.34, l.y, l.z + (fbm(l.x * 2.1 + 2, l.y * 1.8 + 5) - 0.44) * 0.3); }
const brainWindow = (h: number) => Math.round(255 * Math.min(1, Math.max(0, (h - 0) / 80)));

/* ------------------------------------------------------------------ colour maps */
function ramp(x: number): [number, number, number] { // perfusion rainbow: black → blue → cyan → green → yellow → red
  const k = Math.min(1, Math.max(0, x)); const stops: [number, number, number, number][] = [[0, 0, 0, 0], [0.15, 20, 30, 160], [0.35, 0, 170, 220], [0.55, 40, 200, 70], [0.75, 240, 220, 40], [1, 230, 40, 30]];
  for (let i = 1; i < stops.length; i++) if (k <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; const u = (k - a[0]) / (b[0] - a[0]); return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u]; }
  return [230, 40, 30];
}

/* ------------------------------------------------------------------ CTA projection */
interface Seg { a: [number, number]; b: [number, number]; r: number; v: number }
function ctaSegments(st: NeuroState, ly: number, slab: number): Seg[] {
  const vs = buildCerebralVessels(DEFAULT_BRAIN_FRAME); const flow = vesselPerfusion(vs, st); const out: Seg[] = []; const l = new THREE.Vector3();
  for (const v of vs) {
    const curve = new THREE.CatmullRomCurve3(v.pts, false, 'centripetal'); const n = 28; const f = flow[v.id];
    let prev: [number, number] | null = null; let prevY = 0;
    for (let i = 0; i <= n; i++) {
      const u = i / n; toLocal(DEFAULT_BRAIN_FRAME, curve.getPointAt(u), l); const p: [number, number] = [l.x, -l.z];
      const vis = f.clotT != null && u > f.clotT ? f.down : f.up; const inSlab = Math.abs(l.y - ly) < slab || Math.abs(prevY - ly) < slab;
      const narrow = 1 - 0.6 * Math.min(0.95, st.spasm?.[v.id] ?? 0);
      if (prev && inSlab) out.push({ a: prev, b: p, r: (v.r0 + (v.r1 - v.r0) * u) / DEFAULT_BRAIN_FRAME.h.x * 0.75 * narrow, v: vis });
      prev = p; prevY = l.y;
    }
  }
  return out;
}
/** Hyperdense vessel sign: the thrombus itself is visible on non-contrast CT (≈ 60 HU) near its slice. */
function clotSegments(st: NeuroState, ly: number): Seg[] {
  if (st.recanalizedAt != null && st.minutes >= st.recanalizedAt) return [];
  const vs = buildCerebralVessels(DEFAULT_BRAIN_FRAME); const out: Seg[] = []; const l = new THREE.Vector3();
  for (const v of vs) {
    if ((st.occlusion[v.id] ?? 0) < 0.05) continue; const curve = new THREE.CatmullRomCurve3(v.pts, false, 'centripetal'); let prev: [number, number] | null = null;
    for (let u = 0.25; u <= 0.62; u += 0.037) { toLocal(DEFAULT_BRAIN_FRAME, curve.getPointAt(u), l); const p: [number, number] = [l.x, -l.z]; if (prev && Math.abs(l.y - ly) < 0.14) out.push({ a: prev, b: p, r: v.r0 / DEFAULT_BRAIN_FRAME.h.x * 0.9, v: 1 }); prev = p; }
  }
  return out;
}
function segDist(px: number, py: number, s: Seg) { const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1]; const L = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((px - s.a[0]) * dx + (py - s.a[1]) * dy) / L)); return Math.hypot(px - s.a[0] - t * dx, py - s.a[1] - t * dy); }

/* ------------------------------------------------------------------ render */
export interface Rendered { rgba: Uint8ClampedArray; w: number; h: number }
export function render(mod: Modality, st: NeuroState, ly: number, size = 200, sys: Systemic = DEFAULT_SYSTEMIC, vscale = 1): Rendered {
  const c = { ...ctx(st, sys, ly), vscale }; const px = new Uint8ClampedArray(size * size * 4); const l = new THREE.Vector3();
  const segs = mod === 'cta' ? ctaSegments(st, ly, 0.45) : [];
  const clots = mod === 'ncct' ? clotSegments(st, ly) : [];
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const x = (i / (size - 1) * 2 - 1) * EXT, zImg = (j / (size - 1) * 2 - 1) * EXT; l.set(x, ly, -zImg);
    const k = (j * size + i) * 4; let r = 0, g = 0, b = 0;
    const H = hu(c, l);
    if (mod === 'ncct') { let hh = H; for (const q of clots) if (segDist(x, -l.z, q) < q.r) hh = Math.max(hh, 64); const v = hh > 200 ? 250 : brainWindow(hh); r = g = b = v; }
    else if (mod === 'cta') {
      // MIP: vessels bright over a dim parenchyma; skull kept faint for orientation
      let v = H > 200 ? 120 : H > -500 ? brainWindow(H) * 0.45 : 0; let best = 0;
      for (const s of segs) { const d = segDist(x, -l.z, s); if (d < s.r) best = Math.max(best, s.v * (1 - (d / s.r) ** 2)); }
      v = Math.max(v, 255 * Math.min(1, best * 1.1)); r = g = b = v;
    } else {
      const inside = Math.hypot(l.x, l.y * 1.02, l.z) < 0.975 && H > 11 && H < 90;
      if (inside) {
        const t = territoryAt(jitter(l)); const f = fate(c, t, l); const grey = H > 33;
        const base = grey ? 1 : 0.5; // white matter normally has about half the flow of grey
        const aff = f.s.coreW > 0 || f.s.penW > 0 ? (f.s.flow.region === 'all' || (f.s.flow.region === 'sup' ? l.y > -0.2 : l.y <= -0.2)) : false;
        const cbf = aff && !c.reopened ? cbfAt(f.s, peripheryAt(t, l)) / CBF_NORMAL : aff && c.reopened ? (f.core > 0.5 ? 0.45 : 1) : 1;
        const blood = H > 55; const tex = 0.88 + 0.24 * fbm(l.x * 18 + 3, l.z * 18 - l.y * 7); // perfusion maps are noisy
        if (blood) { if (mod === 'cbf') [r, g, b] = ramp(0.08); else [r, g, b] = ramp(0.15); }
        else if (mod === 'cbf') [r, g, b] = ramp(Math.min(1, cbf * base * 0.95 * tex));
        else { const tmax = Math.max(0, Math.min(1, (1 - cbf) * 1.05)); [r, g, b] = ramp((tmax * (tmax > 0.05 ? 1 : 0.2) + 0.12) * (0.94 + 0.12 * (tex - 0.88))); }
      } else if (H > 200) { r = g = b = 70; }
    }
    px[k] = r; px[k + 1] = g; px[k + 2] = b; px[k + 3] = H < -500 && mod !== 'cta' ? 255 : 255;
  }
  return { rgba: px, w: size, h: size };
}

/** Readouts a perfusion package would print (thresholds as used by common automated software). */
export function perfusionSummary(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC) {
  const ts = territoryStates(st, sys); let core = 0, pen = 0; for (const t of Object.values(ts)) { core += t.coreMl; pen += t.penumbraMl; }
  return { coreMl: core, tmax6Ml: core + pen, mismatch: core > 0.5 ? (core + pen) / core : pen > 0 ? Infinity : 1 };
}
