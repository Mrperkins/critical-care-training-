/**
 * Synthetic bedside ultrasound (B-mode) for the FAST windows and a transverse aorta view, drawn from
 * the SAME `AbdomenState` as the 3D abdomen. Pure: state + window → grey-scale RGBA, so images are
 * testable and seekable. Schematic anatomy, generic echotextures and deterministic speckle — no
 * patient images, no atlas copies.
 *
 * Conventions (teaching): curvilinear sector, probe at the top. Longitudinal (coronal) views put the
 * patient's head on screen-LEFT (probe marker to the head); transverse views put the patient's RIGHT
 * on screen-LEFT.
 */
import { fastExam, type AbdomenState } from './state';

export type UsWindow = 'ruq' | 'luq' | 'pelvis' | 'pericardial' | 'aorta';
export const US_WINDOWS: { id: UsWindow; short: string; name: string; plane: string; depthCm: number; fast: boolean }[] = [
  { id: 'ruq', short: 'RUQ', name: 'RUQ · hepatorenal (Morison’s pouch)', plane: 'coronal · head on the left', depthCm: 16, fast: true },
  { id: 'luq', short: 'LUQ', name: 'LUQ · splenorenal', plane: 'coronal · head on the left', depthCm: 15, fast: true },
  { id: 'pelvis', short: 'Pelvis', name: 'Pelvis · behind the bladder', plane: 'transverse · patient right on the left', depthCm: 14, fast: true },
  { id: 'pericardial', short: 'Subxiphoid', name: 'Subxiphoid · pericardium', plane: 'subcostal · patient right on the left', depthCm: 17, fast: true },
  { id: 'aorta', short: 'Aorta', name: 'Aorta (not part of FAST)', plane: 'transverse · patient right on the left', depthCm: 13, fast: false },
];

/** anechoic stripe thickness (mm) for a window's free-fluid volume: zero until the window is positive */
export function stripeMm(ml: number, positive: boolean) { return positive ? Math.min(35, 1.5 + Math.sqrt(Math.max(0, ml - 40))) : 0; }

/* deterministic noise */
const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x: number, y: number) { const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j; const u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v; }
const ell = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
const band = (d: number, w: number) => Math.max(0, 1 - Math.abs(d) / w); // bright line profile
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

type Kind = 'tissue' | 'fluid' | 'none';
interface Px { e: number; k: Kind }
/** tissue echo (0–1) at lateral x cm (screen-left negative), depth z cm */
type Scene = (x: number, z: number) => Px;

function fluidEcho(st: AbdomenState) { return st.fluidKind === 'blood' ? 0.06 : st.fluidKind === 'enteric' ? 0.12 : 0.015; }
function wall(z: number): Px | null { // skin, fat, muscle layers
  if (z < 0.25) return { e: 0.75, k: 'tissue' }; if (z < 1.0) return { e: 0.28, k: 'tissue' }; if (z < 1.35) return { e: 0.62, k: 'tissue' }; if (z < 1.7) return { e: 0.3, k: 'tissue' }; return null;
}
function freeAirArtefact(st: AbdomenState, x: number, z: number): Px | null {
  if (!st.freeAir || z > 7 || x < -3.5) return null; // bright peritoneal line with reverberations across the anterior window
  const d = z - 1.9; if (d < -0.1) return null; const rev = band(((d + 0.1) % 1.6) - 0.1, 0.18) * Math.exp(-d / 3);
  return { e: 0.12 + 0.85 * rev, k: 'tissue' };
}

function ruq(st: AbdomenState, mm: number): Scene {
  const t = mm / 10; const fe = fluidEcho(st);
  return (x, z) => {
    const w = wall(z); if (w) return w; const air = freeAirArtefact(st, x, z); if (air) return air;
    const dia = Math.hypot(x + 10, z - 8) - 6.2; // diaphragm arc on the head (left) side
    if (dia < 0) return { e: dia > -0.25 ? 0.95 : 0.3 + 0.15 * vnoise(x * 2, z), k: 'tissue' }; // bright line, then mirror-image artefact
    const fk = ell(x, z, 2.2, 10.2, 5.2, 2.7); const rk = Math.sqrt(fk);
    if (fk < 1) { const sinus = ell(x, z, 2.2, 10.4, 3.1, 1.05); return { e: sinus < 1 ? 0.78 : rk > 0.975 ? 0.68 : 0.3, k: 'tissue' }; }
    const out = (rk - 1) * 2.7; // ≈ cm outside the renal capsule
    if (t > 0 && out < t && z < 11.5) return { e: fe, k: 'fluid' }; // Morison's pouch
    if (t > 0 && out < t * 0.6 && x > 5.5) return { e: fe, k: 'fluid' }; // caudal liver tip
    if (Math.abs(out - Math.max(t, 0)) < 0.14 && z < 11.5) return { e: 0.8, k: 'tissue' }; // Gerota / capsule interface
    if (z > 12.2) return { e: 0.22, k: 'tissue' }; // psoas / posterior
    return { e: 0.46, k: 'tissue' }; // liver
  };
}
function luq(st: AbdomenState, mm: number): Scene {
  const t = mm / 10; const fe = fluidEcho(st);
  return (x, z) => {
    const w = wall(z); if (w) return w;
    const dia = Math.hypot(x + 9, z - 7) - 5.8;
    if (dia < 0) return { e: dia > -0.25 ? 0.95 : 0.28 + 0.12 * vnoise(x * 2, z), k: 'tissue' };
    // subphrenic space fills first on this side (between spleen and diaphragm)
    if (t > 0 && dia < t * 0.7 && z < 9) return { e: fe, k: 'fluid' };
    const sp = ell(x, z, -0.8, 5.6, 4.6, 3.1); const kd = ell(x, z, 2.4, 10.4, 4.6, 2.4);
    if (kd < 1) { const sinus = ell(x, z, 2.4, 10.6, 2.8, 0.95); return { e: sinus < 1 ? 0.78 : Math.sqrt(kd) > 0.975 ? 0.68 : 0.3, k: 'tissue' }; }
    const outK = (Math.sqrt(kd) - 1) * 2.4;
    if (sp < 1) return { e: 0.52, k: 'tissue' };
    const outS = (Math.sqrt(sp) - 1) * 3.1;
    if (t > 0 && outK < t && outS < t + 2.5 && z < 11) return { e: fe, k: 'fluid' }; // splenorenal
    if (Math.abs(outS) < 0.13 || Math.abs(outK) < 0.13) return { e: 0.8, k: 'tissue' };
    // bowel gas: bright irregular echoes with dirty shadowing below
    const gas = vnoise(x * 0.6 + 7, z * 0.5) > 0.62 && z < 9 && x > 3; if (gas) return { e: 0.85, k: 'tissue' };
    return { e: z > 12 ? 0.2 : 0.3 + 0.15 * vnoise(x * 0.8, z * 0.8), k: 'tissue' };
  };
}
function pelvis(st: AbdomenState, mm: number): Scene {
  const t = mm / 10; const fe = fluidEcho(st); const bz = 5.4, bh = 3.0, bw = 4.6; // full bladder
  return (x, z) => {
    const w = wall(z); if (w) return w;
    const bl = (Math.abs(x) / bw) ** 4 + ((z - bz) / bh) ** 4;
    if (bl < 1) return { e: bl > 0.9 ? 0.72 : 0.01, k: 'tissue' }; // bladder: anechoic urine, bright wall
    const behind = z - (bz + bh); const enh = behind > 0 ? 1 + 0.45 * clamp((bw * 0.9 - Math.abs(x)) / 1.4) : 1; // posterior acoustic enhancement
    if (t > 0 && behind > 0.05 && behind < t + 0.2 && Math.abs(x) < 4.2 * (1 - (behind - 0.05) / (t + 0.6))) return { e: fe, k: 'fluid' }; // rectovesical / pouch of Douglas
    const rect = ell(x, z, 0.3, bz + bh + Math.max(1.8, t + 1.4), 2.8, 1.5); if (rect < 1) return { e: Math.min(1, 0.42 * enh), k: 'tissue' };
    const side = Math.abs(x) > 5.5 ? 0.22 : 0.3; return { e: Math.min(1, side * enh * (0.9 + 0.3 * vnoise(x, z))), k: 'tissue' };
  };
}
function subxiphoid(_st: AbdomenState, mm: number): Scene {
  const t = mm / 10; // the abdominal state carries no pericardial fluid: stripe stays 0 (tamponade lives in Lines)
  return (x, z) => {
    const w = wall(z); if (w) return w;
    const hc = ell(x, z, 0.8, 10.2, 6.0, 3.8); const r = Math.sqrt(hc);
    const peri = (r - 1) * 3.8; // cm outside the myocardium
    if (hc < 1) {
      const lumenRV = ell(x, z, -0.2, 8.5, 3.6, 1.2), lumenLV = ell(x, z, 1.6, 11.2, 3.2, 1.7), sept = Math.abs((z - 9.7) - 0.25 * (x - 0.8));
      if ((lumenRV < 1 || lumenLV < 1) && sept > 0.45) return { e: 0.02, k: 'tissue' };
      return { e: 0.5, k: 'tissue' };
    }
    if (t > 0 && peri < t) return { e: 0.02, k: 'fluid' };
    if (Math.abs(peri - t) < 0.17) return { e: 0.95, k: 'tissue' }; // bright pericardium
    if (z < 6.4 - 0.35 * x) return { e: 0.46, k: 'tissue' }; // left lobe of the liver as the window
    return { e: 0.18, k: 'tissue' };
  };
}
function aorta(st: AbdomenState): Scene {
  const R = st.aaa.diameterCm / 2; const cx = 0.9, cz = 6.2 + R * 0.6; const rupt = st.aaa.rupture !== 'none'; const hae = Math.min(4.5, Math.cbrt(Math.max(0, st.retroMl)) * 0.35);
  return (x, z) => {
    const w = wall(z); if (w) return w;
    const vb = Math.hypot(x - 0.2, z - (cz + R + 2.6)) - 2.2; if (vb < 0.35 && vb > -0.05 && z < cz + R + 2.6) return { e: 0.95, k: 'tissue' }; // vertebral body cortex
    if (vb < -0.05 || (Math.abs(x - 0.2) < 2.1 && z > cz + R + 2.6)) return { e: 0.02, k: 'tissue' }; // acoustic shadow
    const d = Math.hypot(x - cx, z - cz) / R;
    if (d < 1) { const thrombus = R > 1.5 ? 1 - Math.min(0.55, (R - 1.5) / (R * 1.4)) : 1; const lumen = Math.hypot(x - cx - R * 0.12, z - cz + R * 0.1) / R;
      return { e: lumen < thrombus ? 0.02 : d > 1 - 0.12 / R ? 0.8 : 0.34 + 0.1 * vnoise(x * 3, z * 3), k: 'tissue' }; }
    if (d < 1 + 0.22 / R) return { e: 0.85, k: 'tissue' }; // wall
    if (ell(x, z, -2.1, cz + 0.2, 1.2, 0.75) < 1) return { e: 0.02, k: 'tissue' }; // IVC
    if (rupt && hae > 0) { const h = ell(x, z, cx + R * 0.75, cz + R * 0.75, hae, hae * 0.65) + 0.35 * vnoise(x * 1.5, z * 1.5); if (h < 1) return { e: 0.14, k: 'tissue' }; } // periaortic haematoma (retroperitoneal)
    if (z < cz - R - 1.2 && vnoise(x * 0.7 + 3, z * 0.7) > 0.64) return { e: 0.85, k: 'tissue' }; // bowel gas
    return { e: 0.3 + 0.12 * vnoise(x * 0.9, z * 0.9), k: 'tissue' };
  };
}

export interface UsImage { rgba: Uint8ClampedArray; w: number; h: number; depthCm: number; stripeMm: number; fluidPx: number; ml: number; positive: boolean }
/** Render one window. `size` = output width in pixels (height follows the depth). */
export function renderUs(win: UsWindow, st: AbdomenState, size = 240): UsImage {
  const meta = US_WINDOWS.find((w) => w.id === win)!; const fast = fastExam(st); const fw = fast.find((w) => w.id === win);
  const ml = fw?.ml ?? 0, positive = !!fw?.positive; const mm = win === 'aorta' ? 0 : stripeMm(ml, positive);
  const scene = win === 'ruq' ? ruq(st, mm) : win === 'luq' ? luq(st, mm) : win === 'pelvis' ? pelvis(st, mm) : win === 'pericardial' ? subxiphoid(st, mm) : aorta(st);
  const D = meta.depthCm, R0 = 2.6, half = 0.62; const Wcm = (R0 + D) * Math.sin(half) * 1.04; const Hcm = D + 0.4;
  const W = size, H = Math.round(size * (Hcm / (2 * Wcm))); const rgba = new Uint8ClampedArray(W * H * 4); let fluidPx = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const X = ((i + 0.5) / W - 0.5) * 2 * Wcm, Zs = ((j + 0.5) / H) * Hcm; const zA = Zs + R0; const r = Math.hypot(X, zA), th = Math.atan2(X, zA);
    const o = (j * W + i) * 4; let v = 0;
    if (Math.abs(th) < half && r >= R0 && r <= R0 + D) {
      const depth = r - R0, lat = th * (R0 + depth); const p = scene(lat, depth); if (p.k === 'fluid') fluidPx++;
      const speck = 0.35 + 1.25 * (0.62 * vnoise(lat * 4 + 11, depth * 9) + 0.38 * vnoise(lat * 9 + 3, depth * 21)) * (0.82 + 0.36 * hash(i, j)); // laterally elongated speckle
      const tgc = 1 - 0.28 * (depth / D); const edge = clamp((half - Math.abs(th)) / 0.04);
      v = clamp(p.e * speck * tgc) * edge;
    }
    const g = Math.round(255 * Math.pow(v, 0.85)); rgba[o] = g; rgba[o + 1] = g; rgba[o + 2] = Math.min(255, g + 3); rgba[o + 3] = 255;
  }
  return { rgba, w: W, h: H, depthCm: D, stripeMm: mm, fluidPx, ml, positive };
}

/** structure labels in window centimetres (lateral x, depth z); `fluid` labels appear only when that window shows fluid */
export const US_LABELS: Record<UsWindow, { t: string; x: number; z: number; fluid?: boolean }[]> = {
  ruq: [{ t: 'Liver', x: 1.5, z: 4.5 }, { t: 'Kidney', x: 3.4, z: 10.6 }, { t: 'Diaphragm', x: -4.6, z: 7.2 }, { t: 'Free fluid', x: 0.6, z: 7.3, fluid: true }],
  luq: [{ t: 'Spleen', x: -0.8, z: 5.4 }, { t: 'Kidney', x: 3.6, z: 10.8 }, { t: 'Diaphragm', x: -4.2, z: 5.5 }, { t: 'Fluid', x: -3.6, z: 8.6, fluid: true }],
  pelvis: [{ t: 'Bladder', x: 0, z: 5.2 }, { t: 'Rectum / uterus', x: 0.3, z: 11.4 }, { t: 'Free fluid', x: 2.6, z: 9.0, fluid: true }],
  pericardial: [{ t: 'Liver', x: -3.2, z: 4 }, { t: 'RV', x: -0.3, z: 8.5 }, { t: 'LV', x: 1.8, z: 11.2 }, { t: 'Pericardium', x: 4.2, z: 14.4 }],
  aorta: [{ t: 'Aorta', x: 0.9, z: 4.6 }, { t: 'IVC', x: -2.4, z: 5.4 }, { t: 'Vertebral body', x: 0.2, z: 12.2 }],
};
/** window cm → normalised image position (0–1) for overlays */
export function usUV(win: UsWindow, x: number, z: number) {
  const D = US_WINDOWS.find((w) => w.id === win)!.depthCm; const R0 = 2.6, half = 0.62; const Wcm = (R0 + D) * Math.sin(half) * 1.04, Hcm = D + 0.4;
  const th = x / (R0 + z); const X = (R0 + z) * Math.sin(th), Z = (R0 + z) * Math.cos(th) - R0;
  return { u: 0.5 + X / (2 * Wcm), v: Z / Hcm };
}
