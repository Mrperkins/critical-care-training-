/**
 * Ultrasound-guided right internal jugular access — a pure model of the neck at the cricoid level, the
 * linear probe, the needle and the Seldinger kit. Where the tip is, what the screen would show, the
 * flash and the transduced pressure are functions of this state (the scan shown is a matched real one); the pressures come from the Lines
 * patient (`tMap` / `tCvp`), so a shocked patient's arterial blood can look "venous" and the waveform
 * is what settles it. Schematic, generic anatomy; distances are illustrative teaching values.
 *
 * Coordinates (cm): x lateral–medial across the neck (screen-LEFT = patient's RIGHT = lateral when the
 * probe marker points to the patient's right), y along the vessels (+ = cephalad), z depth from skin.
 */

/** normalised ellipse distance: < 1 inside (x lateral, z depth) */
const ell = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;

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

