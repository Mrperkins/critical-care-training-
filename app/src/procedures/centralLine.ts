/**
 * Ultrasound-guided right internal jugular access — a pure model of the neck at the cricoid level, the
 * linear probe, the needle and the Seldinger kit. Everything the learner sees (the B-mode image, the
 * flash, the transduced pressure) is a function of this state; the pressures come from the Lines
 * patient (`tMap` / `tCvp`), so a shocked patient's arterial blood can look "venous" and the waveform
 * is what settles it. Schematic, generic anatomy; distances are illustrative teaching values.
 *
 * Coordinates (cm): x lateral–medial across the neck (screen-LEFT = patient's RIGHT = lateral when the
 * probe marker points to the patient's right), y along the vessels (+ = cephalad), z depth from skin.
 */
import { ell, band, vnoise, type UsPx, type UsScene } from '../scene/ultrasound/bmode';

export type Axis = 'short' | 'long';
export interface ClInput {
  axis: Axis; /** in-plane (whole shaft visible along the beam) vs out-of-plane (needle crosses the beam) */ plane: 'in' | 'out';
  /** probe slid to keep the tip in view (out-of-plane "walk-down") */ track: boolean;
  /** probe pressure 0–1 */ compress: number; /** head-down tilt / Valsalva distend the vein */ trendelenburg: boolean;
  /** vein filling 0.4 (hypovolaemic) … 1.3 (overloaded) */ volume: number;
  /** anatomy variant: IJ lateral to the carotid (usual) or overlying it */ variant: 'lateral' | 'overlying';
  /** needle: aim across the neck (x at the skin), angle to the skin (deg), distance of the skin entry from the probe (cm), length advanced (cm) */
  aimX: number; angle: number; entry: number; advance: number;
  /** cardiac phase 0–1 for pulsation */ phase: number;
}
export const CL_DEFAULT: ClInput = { axis: 'short', plane: 'out', track: true, compress: 0, trendelenburg: true, volume: 1, variant: 'lateral', aimX: -0.55, angle: 45, entry: 1, advance: 0, phase: 0 };

export interface Anatomy { ij: { x: number; z: number; rx: number; rz: number }; ca: { x: number; z: number; r: number }; scm: { x: number; z: number; rx: number; rz: number }; thyroid: { x: number; z: number; rx: number; rz: number } }
/** Neck anatomy for this input: vein size from volume, tilt and probe pressure (the artery barely changes). Pure. */
export function anatomy(c: ClInput): Anatomy {
  const fill = c.volume * (c.trendelenburg ? 1.25 : 1); const s = Math.max(0.25, Math.min(1.5, fill));
  const squash = Math.max(0.02, 1 - c.compress / Math.max(0.2, 0.55 * s)); // a vein flattens under modest pressure — less so when full
  const ijx = c.variant === 'overlying' ? 0.55 : -0.6;
  const pulse = 1 + 0.06 * Math.sin(2 * Math.PI * c.phase);
  return {
    ij: { x: ijx, z: 1.65 + (1 - squash) * 0.35 * 0.55 * s, rx: 0.78 * Math.sqrt(s) * (1 + 0.25 * (1 - squash)), rz: 0.55 * s * squash },
    ca: { x: 0.85, z: c.variant === 'overlying' ? 2.55 : 2.0, r: 0.36 * pulse * (1 - 0.08 * c.compress) },
    scm: { x: -0.3, z: 0.85, rx: 1.9, rz: 0.38 }, thyroid: { x: 2.5, z: 1.25, rx: 1.1, rz: 0.75 },
  };
}

export interface Needle { /** tip */ tip: { x: number; y: number; z: number }; /** where the needle crosses the imaging plane (out-of-plane), if it does */ cross: { x: number; z: number } | null; plane: number }
/** Needle geometry: entry at y = −entry (caudal of the probe), advancing cephalad and down at `angle`. The imaging plane sits at y = 0 — or at the tip when tracking. */
export function needle(c: ClInput): Needle {
  const a = (c.angle * Math.PI) / 180; const tip = { x: c.aimX, y: -c.entry + c.advance * Math.cos(a), z: c.advance * Math.sin(a) };
  const plane = c.plane === 'out' && c.track ? tip.y : 0; // tracking: the probe slides with the tip
  const sCross = (plane + c.entry) / Math.cos(a); const cross = c.advance >= sCross ? { x: c.aimX, z: sCross * Math.sin(a) } : null;
  return { tip, cross, plane };
}

export type TipIn = 'tissue' | 'scm' | 'ijWall' | 'ij' | 'ijBackWall' | 'carotid' | 'deep';
export interface ClState { anat: Anatomy; ndl: Needle; tipIn: TipIn; /** the vein is being tented by the needle (anterior wall indented, not yet punctured) */ tenting: boolean;
  /** the probe shows the TIP (true) or only the shaft (false) */ seesTip: boolean; /** on-screen needle depth vs true tip depth, cm */ shownZ: number | null; trueZ: number;
  flash: 'none' | 'venous' | 'arterial'; throughAndThrough: boolean; compressible: { ij: boolean; carotid: boolean } }

/** Where is the tip, what does the screen show, what comes back up the needle. Pure. */
export function clState(c: ClInput): ClState {
  const A = anatomy({ ...c, compress: 0 }); const ndl = needle(c); const t = ndl.tip;
  const inIJ = ell(t.x, t.z, A.ij.x, A.ij.z, A.ij.rx, A.ij.rz); const inCA = Math.hypot(t.x - A.ca.x, t.z - A.ca.z) / A.ca.r;
  // tenting: a soft vein indents before the needle pierces it (worse when under-filled)
  const tent = 0.35 * Math.max(0, 1.2 - c.volume * (c.trendelenburg ? 1.25 : 1));
  const antWall = A.ij.z - A.ij.rz * Math.sqrt(Math.max(0, 1 - ((t.x - A.ij.x) / A.ij.rx) ** 2));
  const overVein = Math.abs(t.x - A.ij.x) < A.ij.rx;
  let tipIn: TipIn = 'tissue'; let tenting = false;
  if (inCA < 1) tipIn = 'carotid';
  else if (overVein && t.z >= antWall && t.z < antWall + tent) { tipIn = 'ijWall'; tenting = true; }
  else if (inIJ < 1) tipIn = 'ij';
  else if (overVein && t.z > A.ij.z) tipIn = t.z < A.ij.z + A.ij.rz + 0.4 ? 'ijBackWall' : 'deep';
  else if (ell(t.x, t.z, A.scm.x, A.scm.z, A.scm.rx, A.scm.rz) < 1) tipIn = 'scm';
  else if (t.z > 3.2) tipIn = 'deep';
  // a needle that went through the back wall was in the vein on the way: aspiration only returns blood while the tip is in the lumen
  const throughAndThrough = tipIn === 'ijBackWall' || (tipIn === 'carotid' && overVein);
  const seesTip = c.plane === 'in' ? true : c.track ? true : !!ndl.cross && Math.abs(t.y - ndl.plane) < 0.12;
  const shownZ = c.plane === 'in' || c.track ? (c.advance > 0.05 ? t.z : null) : ndl.cross ? ndl.cross.z : null;
  const flash: ClState['flash'] = tipIn === 'ij' ? 'venous' : tipIn === 'carotid' ? 'arterial' : 'none';
  return { anat: anatomy(c), ndl, tipIn, tenting, seesTip, shownZ, trueZ: t.z, flash, throughAndThrough, compressible: { ij: true, carotid: false } };
}

/** What confirms the vessel: colour is unreliable, pulsatility and a TRANSDUCED pressure are not. Uses the Lines patient's true pressures and saturations. */
export function vesselCheck(flash: ClState['flash'], pt: { map: number; cvp: number; sao2: number; svo2: number }) {
  if (flash === 'none') return null;
  const art = flash === 'arterial';
  const sat = art ? pt.sao2 : pt.svo2;
  return {
    colour: sat > 0.9 ? 'bright red' : sat > 0.75 ? 'dark red' : 'very dark red',
    colourMisleading: art ? sat < 0.9 : sat > 0.8,
    pulsatile: art, pressure: Math.round(art ? pt.map : pt.cvp), wave: art ? 'arterial' as const : 'venous' as const,
    columnCm: Math.round((art ? pt.map : pt.cvp) * 1.36),
  };
}

/** The B-mode image of this state (linear probe, 4 cm wide, 4 cm deep). */
export const CL_WIDTH = 4, CL_DEPTH = 4;
export function clScene(c: ClInput, wire: 'none' | 'inVein' | 'inArtery' = 'none'): UsScene {
  const s = clState(c); const A = s.anat; const n = s.ndl; const a = (c.angle * Math.PI) / 180;
  // a guidewire is a bright echo lying in the lumen it entered (dot in short axis, line in long axis)
  const wv = wire === 'inVein' ? { x: A.ij.x, z: A.ij.z + 0.35 * A.ij.rz, r: A.ij.rz } : wire === 'inArtery' ? { x: A.ca.x, z: A.ca.z + 0.3 * A.ca.r, r: A.ca.r } : null;
  const vesselAt = (x: number, z: number): UsPx | null => {
    const dIJ = Math.sqrt(ell(x, z, A.ij.x, A.ij.z, A.ij.rx, A.ij.rz));
    if (dIJ < 1) return { e: s.tenting && Math.abs(x - n.tip.x) < 0.25 && z < n.tip.z + 0.1 ? 0.35 : 0.02, k: 'fluid' };
    if (dIJ < 1 + 0.08 / Math.max(0.1, A.ij.rz)) return { e: 0.55, k: 'tissue' }; // thin venous wall
    const dCA = Math.hypot(x - A.ca.x, z - A.ca.z) / A.ca.r;
    if (dCA < 1) return { e: 0.02, k: 'fluid' };
    if (dCA < 1.28) return { e: 0.9, k: 'tissue' }; // thick bright arterial wall
    return null;
  };
  if (c.axis === 'long') {
    // long axis along the IJ at x = aimX: vein as a horizontal channel; the needle, if in plane, is a bright line from the probe edge
    const x0 = c.aimX; const half = A.ij.rz * Math.sqrt(Math.max(0, 1 - ((x0 - A.ij.x) / A.ij.rx) ** 2));
    const caHalf = Math.sqrt(Math.max(0, A.ca.r ** 2 - (x0 - A.ca.x) ** 2));
    return (y, z) => {
      if (z < 0.18) return { e: 0.75, k: 'tissue' }; if (z < 0.45) return { e: 0.3, k: 'tissue' };
      if (wv && Math.abs(z - wv.z) < 0.04 && (wire === 'inVein' ? half : caHalf) > 0.05) return { e: 1, k: 'tissue' };
      if (c.plane === 'in') { // needle in plane: y along the screen, entering at y = −entry
        const along = (y + c.entry) * Math.sin(a) - z * Math.cos(a), dist = Math.abs(along); const s0 = (y + c.entry) * Math.cos(a) + z * Math.sin(a);
        if (dist < 0.05 && s0 >= 0 && s0 <= c.advance) return { e: 1, k: 'tissue' };
        if (dist < 0.05 && s0 > c.advance && s0 < c.advance + 0.02) return { e: 1, k: 'tissue' };
        // reverberation below a steep shaft
        if (s0 >= 0 && s0 <= c.advance && along > 0.1 && along < 0.5 && Math.abs(((along * 10) % 1.5) - 0.2) < 0.12) return { e: 0.45, k: 'tissue' };
      }
      if (half > 0.02 && Math.abs(z - A.ij.z) < half) return { e: 0.02, k: 'fluid' };
      if (half > 0.02 && Math.abs(Math.abs(z - A.ij.z) - half) < 0.06) return { e: 0.55, k: 'tissue' };
      if (caHalf > 0.02 && Math.abs(z - A.ca.z) < caHalf) return { e: 0.02, k: 'fluid' };
      if (caHalf > 0.02 && Math.abs(Math.abs(z - A.ca.z) - caHalf) < 0.1) return { e: 0.9, k: 'tissue' };
      if (Math.abs(z - (A.scm.z)) < A.scm.rz * 0.8) return { e: 0.36 + 0.25 * band(((z * 9) % 1) - 0.5, 0.2), k: 'tissue' };
      return { e: 0.3 + 0.1 * vnoise(y * 2, z * 3), k: 'tissue' };
    };
  }
  return (x, z) => {
    if (z < 0.18) return { e: 0.75, k: 'tissue' }; if (z < 0.45) return { e: 0.3, k: 'tissue' };
    // needle: in-plane in short axis = a bright line across; out-of-plane = a bright dot (with reverberation "ring-down" beneath)
    if (c.plane === 'out' && s.shownZ != null) {
      const d = Math.hypot(x - c.aimX, z - s.shownZ);
      if (d < 0.07) return { e: 1, k: 'tissue' };
      if (Math.abs(x - c.aimX) < 0.05 && z > s.shownZ + 0.1 && z < s.shownZ + 0.8 && ((z - s.shownZ) * 7) % 1 < 0.3) return { e: 0.55, k: 'tissue' };
    }
    if (c.plane === 'in') { const zx = (x - (c.aimX - 1.2)) * Math.tan(a) + 0.2; const len = Math.hypot(x - (c.aimX - 1.2), zx - 0.2);
      if (Math.abs(z - zx) < 0.05 && x >= c.aimX - 1.2 && len <= c.advance) return { e: 1, k: 'tissue' }; }
    if (wv && Math.hypot(x - wv.x, z - wv.z) < 0.06) return { e: 1, k: 'tissue' };
    const v = vesselAt(x, z); if (v) return v;
    if (ell(x, z, A.scm.x, A.scm.z, A.scm.rx, A.scm.rz) < 1) return { e: 0.34 + 0.22 * band(((x * 5 + z * 2) % 1) - 0.5, 0.25), k: 'tissue' }; // striated muscle
    if (ell(x, z, A.thyroid.x, A.thyroid.z, A.thyroid.rx, A.thyroid.rz) < 1) return { e: 0.6, k: 'tissue' };
    if (z > 3.1) return { e: 0.42 + 0.15 * vnoise(x * 3, z * 3), k: 'tissue' }; // prevertebral / scalene
    return { e: 0.26 + 0.1 * vnoise(x * 3, z * 3), k: 'tissue' };
  };
}
