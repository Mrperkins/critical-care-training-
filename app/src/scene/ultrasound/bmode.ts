/**
 * Shared synthetic B-mode ultrasound: deterministic noise, shape helpers, and the scan-conversion
 * renderers (curvilinear sector for abdominal / cardiac windows, linear array for vascular access).
 * A caller supplies a pure `UsScene(x, z)` → echo; the renderer adds speckle, time-gain compensation and
 * the probe footprint. Used by the FAST views (`abdomen/ultrasound.ts`) and the central-line trainer.
 */
export const hash = (x: number, y: number) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
export function vnoise(x: number, y: number) { const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j; const u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return (hash(i, j) * (1 - u) + hash(i + 1, j) * u) * (1 - v) + (hash(i, j + 1) * (1 - u) + hash(i + 1, j + 1) * u) * v; }
export const ell = (x: number, z: number, cx: number, cz: number, rx: number, rz: number) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
/** bright line profile: 1 at d = 0, falling to 0 at |d| = w */
export const band = (d: number, w: number) => Math.max(0, 1 - Math.abs(d) / w);
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export type UsKind = 'tissue' | 'fluid' | 'none';
export interface UsPx { e: number; k: UsKind }
/** tissue echo (0–1) at lateral x cm (screen-left negative), depth z cm */
export type UsScene = (x: number, z: number) => UsPx;

export interface UsRender { rgba: Uint8ClampedArray; w: number; h: number; fluidPx: number }
const put = (rgba: Uint8ClampedArray, o: number, v: number) => { const g = Math.round(255 * Math.pow(v, 0.85)); rgba[o] = g; rgba[o + 1] = g; rgba[o + 2] = Math.min(255, g + 3); rgba[o + 3] = 255; };
const speckle = (lat: number, depth: number, i: number, j: number) => 0.35 + 1.25 * (0.62 * vnoise(lat * 4 + 11, depth * 9) + 0.38 * vnoise(lat * 9 + 3, depth * 21)) * (0.82 + 0.36 * hash(i, j)); // laterally elongated

/** Curvilinear sector (abdominal probe): radius of curvature R0 cm, half-angle `half` rad. */
export const CURVI = { R0: 2.6, half: 0.62 };
export function curviDims(depthCm: number) { const { R0, half } = CURVI; return { Wcm: (R0 + depthCm) * Math.sin(half) * 1.04, Hcm: depthCm + 0.4 }; }
export function renderCurvilinear(scene: UsScene, depthCm: number, size = 240): UsRender {
  const { R0, half } = CURVI; const D = depthCm; const { Wcm, Hcm } = curviDims(D);
  const W = size, H = Math.round(size * (Hcm / (2 * Wcm))); const rgba = new Uint8ClampedArray(W * H * 4); let fluidPx = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const X = ((i + 0.5) / W - 0.5) * 2 * Wcm, Zs = ((j + 0.5) / H) * Hcm; const zA = Zs + R0; const r = Math.hypot(X, zA), th = Math.atan2(X, zA);
    let v = 0;
    if (Math.abs(th) < half && r >= R0 && r <= R0 + D) {
      const depth = r - R0, lat = th * (R0 + depth); const p = scene(lat, depth); if (p.k === 'fluid') fluidPx++;
      const tgc = 1 - 0.28 * (depth / D); const edge = clamp((half - Math.abs(th)) / 0.04);
      v = clamp(p.e * speckle(lat, depth, i, j) * tgc) * edge;
    }
    put(rgba, (j * W + i) * 4, v);
  }
  return { rgba, w: W, h: H, fluidPx };
}
/** window cm → normalised image position (0–1) for overlays on a curvilinear image */
export function curviUV(depthCm: number, x: number, z: number) {
  const { R0 } = CURVI; const { Wcm, Hcm } = curviDims(depthCm);
  const th = x / (R0 + z); const X = (R0 + z) * Math.sin(th), Z = (R0 + z) * Math.cos(th) - R0;
  return { u: 0.5 + X / (2 * Wcm), v: Z / Hcm };
}

/** Linear array (vascular probe): a rectangle `widthCm` wide and `depthCm` deep; high frequency = finer speckle, less penetration. */
export function renderLinear(scene: UsScene, widthCm: number, depthCm: number, size = 260): UsRender {
  const W = size, H = Math.round(size * (depthCm / widthCm)); const rgba = new Uint8ClampedArray(W * H * 4); let fluidPx = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const x = ((i + 0.5) / W - 0.5) * widthCm, z = ((j + 0.5) / H) * depthCm; const p = scene(x, z); if (p.k === 'fluid') fluidPx++;
    const tgc = 1 - 0.4 * (z / depthCm); const edge = clamp(Math.min(i, W - 1 - i) / 3);
    put(rgba, (j * W + i) * 4, clamp(p.e * speckle(x * 1.8, z * 1.8, i, j) * tgc) * edge);
  }
  return { rgba, w: W, h: H, fluidPx };
}
export const linearUV = (widthCm: number, depthCm: number, x: number, z: number) => ({ u: 0.5 + x / widthCm, v: z / depthCm });
