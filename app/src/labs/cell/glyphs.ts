/**
 * One texture atlas for every molecule sprite: a shaded bead in the species colour with its symbol
 * printed on it (Na⁺, K⁺ …), a water molecule, osmolytes, charges and ATP/ADP.
 * 4 × 3 cells of 256 px.
 */
import * as THREE from 'three';
import { SPECIES, type SpeciesKey } from './model';

export const ATLAS_COLS = 4, ATLAS_ROWS = 3;
export const GLYPH: Record<SpeciesKey | 'plus' | 'minus' | 'atp' | 'adp', number> = { na: 0, k: 1, ca: 2, mg: 3, cl: 4, pi: 5, w: 6, osm: 7, plus: 8, minus: 9, atp: 10, adp: 11 };

let tex: THREE.CanvasTexture | null = null;
export function glyphAtlas(): THREE.CanvasTexture {
  if (tex) return tex;
  const C = 256; const cv = document.createElement('canvas'); cv.width = C * ATLAS_COLS; cv.height = C * ATLAS_ROWS; const g = cv.getContext('2d')!;
  const cell = (i: number) => [(i % ATLAS_COLS) * C, Math.floor(i / ATLAS_COLS) * C] as const;
  const bead = (i: number, color: string, r: number) => {
    const [x, y] = cell(i); const cx = x + C / 2, cy = y + C / 2; const c = new THREE.Color(color);
    const lite = `rgb(${Math.min(255, c.r * 255 + 90)},${Math.min(255, c.g * 255 + 90)},${Math.min(255, c.b * 255 + 90)})`, dark = `rgb(${c.r * 120},${c.g * 120},${c.b * 120})`;
    const gr = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r); gr.addColorStop(0, lite); gr.addColorStop(0.55, color); gr.addColorStop(1, dark);
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = gr; g.fill();
    g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.stroke();
    return [cx, cy] as const;
  };
  const label = (cx: number, cy: number, text: string, ink: string, size: number) => {
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `700 ${size}px "Atkinson Hyperlegible Next", system-ui, sans-serif`;
    g.shadowColor = ink === '#ffffff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.35)'; g.shadowBlur = 4; g.fillText(text, cx, cy + size * 0.04); g.shadowBlur = 0;
  };
  for (const k of ['na', 'k', 'ca', 'mg', 'cl', 'pi'] as SpeciesKey[]) {
    const sp = SPECIES[k]; const [cx, cy] = bead(GLYPH[k], sp.color, 112);
    label(cx, cy, sp.label, sp.ink, sp.label.length > 4 ? 64 : sp.label.length > 2 ? 86 : 104);
  }
  { // water: red O with two white H at 104.5°
    const [x, y] = cell(GLYPH.w); const cx = x + C / 2, cy = y + C / 2 + 14;
    const ball = (bx: number, by: number, r: number, col: string, hi: string) => { const gr = g.createRadialGradient(bx - r * 0.35, by - r * 0.4, r * 0.1, bx, by, r); gr.addColorStop(0, hi); gr.addColorStop(1, col); g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fillStyle = gr; g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,0.3)'; g.stroke(); };
    const a = (104.5 / 2) * Math.PI / 180; const d = 88;
    ball(cx - Math.sin(a) * d, cy - Math.cos(a) * d, 50, '#d9e6f2', '#ffffff'); ball(cx + Math.sin(a) * d, cy - Math.cos(a) * d, 50, '#d9e6f2', '#ffffff');
    ball(cx, cy, 82, '#4aa3f0', '#d8efff'); label(cx, cy + 4, 'H₂O', '#ffffff', 50);
  }
  { // organic osmolyte: a small ring molecule (myo-inositol-like hexagon)
    const [x, y] = cell(GLYPH.osm); const cx = x + C / 2, cy = y + C / 2; const r = 96;
    g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (i * Math.PI) / 3; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath();
    const gr = g.createRadialGradient(cx - 30, cy - 30, 10, cx, cy, r); gr.addColorStop(0, '#9ff2e8'); gr.addColorStop(1, SPECIES.osm.color); g.fillStyle = gr; g.fill(); g.lineWidth = 10; g.strokeStyle = '#0f6f66'; g.stroke();
    label(cx, cy, 'osm', '#00211d', 70);
  }
  const sign = (i: number, s: string, col: string) => { const [x, y] = cell(i); g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '700 190px "Atkinson Hyperlegible Mono", monospace'; g.fillText(s, x + C / 2, y + C / 2 + 8); };
  sign(GLYPH.plus, '+', '#ff8a7a'); sign(GLYPH.minus, '−', '#8ab8ff');
  const pill = (i: number, text: string, col: string) => { const [x, y] = cell(i); g.fillStyle = col; const w = 220, h = 110; const rx = x + (C - w) / 2, ry = y + (C - h) / 2; g.beginPath(); g.roundRect(rx, ry, w, h, 50); g.fill(); label(x + C / 2, y + C / 2, text, '#1b1300', 70); };
  pill(GLYPH.atp, 'ATP', '#ffd66b'); pill(GLYPH.adp, 'ADP', '#b9a37a');
  tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

/** Sprite points drawn from the atlas at a fixed world size (so they grow as the camera comes closer). */
export function spriteMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uAtlas: { value: glyphAtlas() }, uScale: { value: 600 }, uClip: { value: new THREE.Vector4(0, 0, -1, 0) }, uCut: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aIdx; attribute float aSize; attribute float aAlpha;
      uniform float uScale; uniform vec4 uClip;
      varying float vIdx; varying float vAlpha; varying float vClip;
      void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vClip = dot(wp.xyz, uClip.xyz) + uClip.w;
        vec4 mv = viewMatrix * wp; gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uScale / max(0.1, -mv.z); vIdx = aIdx; vAlpha = aAlpha; }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uAtlas; uniform float uCut; varying float vIdx; varying float vAlpha; varying float vClip;
      void main(){ if (uCut > 0.5 && vClip > 0.0) discard; if (vAlpha < 0.01) discard;
        vec2 pc = gl_PointCoord; float col = mod(vIdx, ${ATLAS_COLS}.0), row = floor(vIdx / ${ATLAS_COLS}.0);
        vec2 uv = vec2((col + pc.x) / ${ATLAS_COLS}.0, 1.0 - (row + pc.y) / ${ATLAS_ROWS}.0);
        vec4 c = texture2D(uAtlas, uv); if (c.a * vAlpha < 0.04) discard; gl_FragColor = vec4(c.rgb, c.a * vAlpha);
        #include <colorspace_fragment>
      }`,
  });
}
