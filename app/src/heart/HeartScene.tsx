/**
 * Congenital heart scene: a four-chamber cutaway (atria, ventricles, septa, AV and aortic valves, defects)
 * drawn by a signed-distance shader, with the great vessels in 3D behind it and flow particles for every
 * circuit and every shunt. Everything — chamber size, wall thickness, blood colour, jet direction, speed
 * and amount — is read from `solveShunt` (shunt.ts). Colour flow: oxygen saturation, or Doppler-style
 * (red toward / blue away from an apical probe, mosaic above the aliasing velocity).
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import { StudioCanvas, IS_PHONE, GLSL_NOISE } from '../scene/Studio';
import { LabelChip } from '../scene/labels';
import { saturationColor, tubeAlong, budget, approach, frameDt, type Tier } from '../scene/effects';
import { registerAnchors } from '../scene/cameraTargets';
import { useLabUI } from '../labs/labStore';
import { useHeartUI } from './heartStore';
import { solveShunt, type ShuntState } from './shunt';

const V = (x: number, y: number, z = 0.03) => new THREE.Vector3(x, y, z);
const HR = 84; const PERIOD = 60 / HR;
/** ventricular systole (0–1) and atrial systole for a phase in the cycle */
export function cyclePhase(t: number) { const ph = (t % PERIOD) / PERIOD; const sys = ph < 0.36 ? Math.sin((ph / 0.36) * Math.PI) : 0; const atr = ph > 0.82 ? Math.sin(((ph - 0.82) / 0.18) * Math.PI) : 0; return { ph, sys, atr }; }

/* ------------------------------------------------------------------ geometry (slab coordinates; x = patient's left) */
export const ANCHOR = {
  ra: V(-1.0, 0.95), la: V(0.95, 1.0), rv: V(-0.72, -0.55), lv: V(0.62, -0.72), vsd: V(-0.03, -0.06), asd: V(-0.02, 0.96), pfo: V(-0.02, 0.97),
  septum: V(-0.05, -0.4), outflow: new THREE.Vector3(-0.28, 0.9, -0.35), pda: new THREE.Vector3(0.38, 1.95, -0.65),
};

const SLAB_FRAG = /* glsl */ `
uniform float uSys, uAtr, uRvThick, uVsdR, uAsdR, uPfo, uMode, uT, uLvS, uLaS, uRaS, uRvS;
uniform vec3 uRA, uRV, uLA, uLV;
varying vec2 vP;
${GLSL_NOISE}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float sdE(vec2 p, vec2 c, vec2 r, float a){ vec2 q = rot(-a) * (p - c); float k = length(q / r); return (k - 1.0) * min(r.x, r.y); }
float sdCap(vec2 p, vec2 a, vec2 b, float r){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdSeg(vec2 p, vec2 a, vec2 b){ return sdCap(p, a, b, 0.0); }
vec2 leaf(vec2 hinge, float a0, float open, float len){ float a = a0 - open; return hinge + len * vec2(cos(a), sin(a)); }
void main(){
  vec2 p = vP;
  float dRA = sdE(p, vec2(-1.0, 0.95), vec2(0.62, 0.52) * uRaS * (1.0 - 0.07 * uAtr), 0.0);
  float dLA = sdE(p, vec2(0.95, 1.0), vec2(0.6, 0.45) * uLaS * (1.0 - 0.07 * uAtr), 0.0);
  float dRV = sdE(p, vec2(-0.72, -0.55), vec2(0.56, 0.95) * uRvS * (1.0 - 0.1 * uSys), 0.25);
  float dLV = sdE(p, vec2(0.62, -0.72), vec2(0.48, 1.02) * uLvS * (1.0 - 0.13 * uSys), -0.3);
  float dTV = sdCap(p, vec2(-0.95, 0.55), vec2(-0.82, 0.02), 0.2);
  float dMV = sdCap(p, vec2(0.9, 0.62), vec2(0.72, 0.02), 0.19);
  float dOT = sdCap(p, vec2(0.42, -0.3), vec2(0.15, 0.62), 0.14);
  float dVSD = uVsdR > 0.0 ? sdCap(p, vec2(-0.3, -0.02), vec2(0.24, -0.1), uVsdR) : 1e3;
  float dASD = uAsdR > 0.0 ? sdCap(p, vec2(-0.5, 0.95), vec2(0.45, 0.98), uAsdR) : 1e3;
  float dPFO = uPfo > 0.02 ? sdCap(p, vec2(-0.45, 0.84), vec2(0.4, 1.1), 0.055 * uPfo) : 1e3;
  float cav = min(min(min(dRA, dLA), min(dRV, dLV)), min(min(dTV, dMV), min(dOT, min(dVSD, min(dASD, dPFO)))));
  float myo = min(min(dRV - (0.1 + uRvThick), dLV - 0.24), min(min(dRA - 0.07, dLA - 0.07), min(dOT - 0.07, min(dTV - 0.06, dMV - 0.06))));
  // valves: tricuspid & mitral open in diastole (swing into the ventricle); aortic opens in systole
  float dia = 1.0 - uSys; float val = 1e3;
  val = min(val, sdSeg(p, vec2(-1.17, 0.36), leaf(vec2(-1.17, 0.36), 0.05, dia * 1.2, 0.27)));
  val = min(val, sdSeg(p, vec2(-0.63, 0.3), leaf(vec2(-0.63, 0.3), 3.1, -dia * 1.2, 0.27)));
  val = min(val, sdSeg(p, vec2(0.51, 0.3), leaf(vec2(0.51, 0.3), 0.1, dia * 1.2, 0.26)));
  val = min(val, sdSeg(p, vec2(1.09, 0.36), leaf(vec2(1.09, 0.36), 3.05, -dia * 1.2, 0.26)));
  val = min(val, sdSeg(p, vec2(0.02, 0.55), leaf(vec2(0.02, 0.55), 0.2, -uSys * 1.25, 0.14)));
  val = min(val, sdSeg(p, vec2(0.29, 0.62), leaf(vec2(0.29, 0.62), 3.3, uSys * 1.25, 0.14)));
  float body = min(myo, cav);
  if (body > 0.02) discard;
  float n = fbm(vec3(p * 9.0, 1.3)), n2 = fbm(vec3(p * 30.0, 4.1));
  vec3 col; float a = 1.0;
  if (cav < 0.0) {
    // blood: colour of the chamber it sits in (defect channels take the mean of both sides)
    float wRA = exp(-max(dRA, 0.0) * 30.0 - dRA * 2.0), wRV = exp(-max(min(dRV, dTV), 0.0) * 30.0 - min(dRV, dTV) * 2.0);
    float wLA = exp(-max(dLA, 0.0) * 30.0 - dLA * 2.0), wLV = exp(-max(min(dLV, min(dMV, dOT)), 0.0) * 30.0 - min(dLV, min(dMV, dOT)) * 2.0);
    vec3 blood = (uRA * wRA + uRV * wRV + uLA * wLA + uLV * wLV) / (wRA + wRV + wLA + wLV);
    col = uMode > 0.5 ? vec3(0.02) + 0.03 * n2 : blood * (0.72 + 0.2 * n);
    float edge = smoothstep(-0.035, 0.0, cav); col = mix(col, uMode > 0.5 ? vec3(0.55) : vec3(0.95, 0.78, 0.74), edge * 0.55); // endocardium
    a = uMode > 0.5 ? 1.0 : 0.94;
  } else {
    float ed = smoothstep(0.0, -0.06, myo);
    vec3 m = mix(vec3(0.42, 0.1, 0.09), vec3(0.62, 0.2, 0.17), n) * (0.85 + 0.3 * n2);
    col = uMode > 0.5 ? vec3(0.5 + 0.45 * n2) * (0.55 + 0.45 * ed) : m * (0.55 + 0.45 * ed) + vec3(0.25, 0.08, 0.06) * (1.0 - ed) * 0.4;
    a = smoothstep(0.02, -0.01, myo);
  }
  float vv = smoothstep(0.02, 0.0, val);
  col = mix(col, uMode > 0.5 ? vec3(0.95) : vec3(0.96, 0.88, 0.8), vv);
  if (uMode > 0.5) { // echo sector from an apical probe
    vec2 probe = vec2(0.35, -2.05); vec2 d = p - probe; float ang = atan(d.x, d.y);
    float inside = step(abs(ang), 0.72) * step(length(d), 3.6);
    col *= mix(0.25, 1.0, inside); col += vec3(0.35) * (smoothstep(0.012, 0.0, abs(abs(ang) - 0.72) * length(d)) * step(length(d), 3.6));
  }
  gl_FragColor = vec4(col, max(a, vv));
  #include <colorspace_fragment>
}`;

/* ------------------------------------------------------------------ paths for flow particles */
type Path = { pts: THREE.Vector3[]; cum: number[]; len: number };
const mk = (pts: THREE.Vector3[]): Path => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); return { pts, cum, len: cum[cum.length - 1] }; };
function at(pth: Path, u: number, out: THREE.Vector3, dir?: THREE.Vector3) {
  const d = u * pth.len; let i = 1; while (i < pth.cum.length - 1 && pth.cum[i] < d) i++;
  const a = pth.pts[i - 1], b = pth.pts[i]; const f = (d - pth.cum[i - 1]) / Math.max(1e-6, pth.cum[i] - pth.cum[i - 1]);
  out.copy(a).lerp(b, f); if (dir) dir.copy(b).sub(a).normalize(); return out;
}
const PA_TAIL = [new THREE.Vector3(-0.3, 0.55, -0.25), new THREE.Vector3(-0.15, 1.6, -0.4), new THREE.Vector3(-0.95, 1.95, -0.75)];
const AO_TAIL = [V(0.14, 0.62), new THREE.Vector3(0.12, 1.05, -0.05), new THREE.Vector3(0.12, 1.95, -0.25), new THREE.Vector3(0.62, 2.35, -0.65), new THREE.Vector3(1.05, 1.8, -1.0), new THREE.Vector3(1.1, -1.6, -1.2)];
const RV_TO_PA = [V(-0.8, -0.95), V(-0.5, -0.6), V(-0.35, 0.05), ...PA_TAIL];
const LV_TO_AO = [V(0.62, -1.3), V(0.42, -0.3), V(0.28, 0.1), ...AO_TAIL];
const PATHS = {
  svc: mk([new THREE.Vector3(-1.1, 2.5, -0.3), new THREE.Vector3(-1.05, 1.6, -0.05), V(-1.0, 1.1), V(-0.95, 0.6), V(-0.85, 0.0), V(-0.85, -0.7), ...RV_TO_PA]),
  ivc: mk([new THREE.Vector3(-1.25, -1.9, -0.6), new THREE.Vector3(-1.15, 0.35, -0.1), V(-1.1, 0.8), V(-0.95, 0.6), V(-0.8, 0.0), V(-0.75, -0.8), ...RV_TO_PA]),
  pv: mk([new THREE.Vector3(2.0, 1.2, -0.45), V(1.35, 1.02), V(0.95, 0.95), V(0.85, 0.5), V(0.75, 0.0), V(0.72, -0.9), ...LV_TO_AO]),
  vsdLR: mk([V(0.5, -0.5), V(0.24, -0.1), V(-0.3, -0.02), V(-0.52, -0.25), V(-0.42, -0.05), V(-0.35, 0.1), ...PA_TAIL]),
  vsdRL: mk([V(-0.7, -0.6), V(-0.3, -0.02), V(0.24, -0.1), V(0.33, 0.15), ...AO_TAIL]),
  asdLR: mk([V(0.95, 1.0), V(0.45, 0.98), V(-0.5, 0.95), V(-0.9, 0.7), V(-0.85, 0.0), V(-0.8, -0.8), ...RV_TO_PA]),
  asdRL: mk([V(-1.0, 1.0), V(-0.5, 0.95), V(0.45, 0.98), V(0.85, 0.6), V(0.75, 0.0), V(0.7, -0.9), ...LV_TO_AO]),
  pfoRL: mk([V(-1.05, 0.9), V(-0.45, 0.84), V(0.4, 1.1), V(0.85, 0.6), V(0.75, 0.0), V(0.7, -0.9), ...LV_TO_AO]),
  pdaLR: mk([new THREE.Vector3(0.12, 1.95, -0.25), new THREE.Vector3(0.45, 2.1, -0.6), new THREE.Vector3(0.3, 1.8, -0.62), new THREE.Vector3(-0.15, 1.6, -0.4), new THREE.Vector3(-0.95, 1.95, -0.75)]),
  pdaRL: mk([new THREE.Vector3(-0.15, 1.6, -0.4), new THREE.Vector3(0.3, 1.8, -0.62), new THREE.Vector3(0.62, 2.05, -0.75), new THREE.Vector3(1.05, 1.8, -1.0), new THREE.Vector3(1.1, -1.6, -1.2)]),
};
type PathId = keyof typeof PATHS;
/** which path is a jet (fast, turbulent) and its source */
function streams(s: ShuntState) {
  const L = s.input.lesion; const out: { id: PathId; flow: number; jet: boolean; sat: number }[] = [
    { id: 'svc', flow: s.qs * 0.4, jet: false, sat: s.sat.sv }, { id: 'ivc', flow: s.qs * 0.6, jet: false, sat: s.sat.sv }, { id: 'pv', flow: s.qp, jet: false, sat: 0.98 }];
  if (L === 'vsd') { out.push({ id: 'vsdLR', flow: s.lr, jet: true, sat: s.sat.lv }); out.push({ id: 'vsdRL', flow: s.rl, jet: true, sat: s.sat.rv }); }
  if (L === 'asd') { out.push({ id: 'asdLR', flow: s.lr, jet: false, sat: s.sat.la }); out.push({ id: 'asdRL', flow: s.rl, jet: false, sat: s.sat.sv }); }
  if (L === 'pfo') out.push({ id: 'pfoRL', flow: s.rl, jet: false, sat: s.sat.sv });
  if (L === 'pda') { out.push({ id: 'pdaLR', flow: s.lr, jet: true, sat: 0.98 }); out.push({ id: 'pdaRL', flow: s.rl, jet: true, sat: s.sat.pa }); }
  return out;
}

/* ------------------------------------------------------------------ scene */
function Heart({ s, tier }: { s: ShuntState; tier: Tier }) {
  const mode = useHeartUI((st) => st.mode);
  const U = useMemo(() => ({ uSys: { value: 0 }, uAtr: { value: 0 }, uRvThick: { value: 0 }, uVsdR: { value: 0 }, uAsdR: { value: 0 }, uPfo: { value: 0 }, uMode: { value: 0 }, uT: { value: 0 },
    uLvS: { value: 1 }, uLaS: { value: 1 }, uRaS: { value: 1 }, uRvS: { value: 1 }, uRA: { value: new THREE.Color() }, uRV: { value: new THREE.Color() }, uLA: { value: new THREE.Color() }, uLV: { value: new THREE.Color() } }), []);
  const slabMat = useMemo(() => new THREE.ShaderMaterial({ uniforms: U, transparent: true, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: SLAB_FRAG }), [U]);
  // great vessels (3D, behind the cut plane)
  const vessels = useMemo(() => ({
    ao: tubeAlong([V(0.14, 0.55, -0.05), new THREE.Vector3(0.12, 1.05, -0.08), new THREE.Vector3(0.12, 1.95, -0.25), new THREE.Vector3(0.62, 2.35, -0.65), new THREE.Vector3(1.05, 1.8, -1.0), new THREE.Vector3(1.1, -1.6, -1.2)], 0.2, 0.15, 16),
    pa: tubeAlong([new THREE.Vector3(-0.35, 0.1, -0.2), new THREE.Vector3(-0.3, 0.6, -0.28), new THREE.Vector3(-0.15, 1.6, -0.4), new THREE.Vector3(-0.95, 1.95, -0.75)], 0.2, 0.13, 16),
    rpa: tubeAlong([new THREE.Vector3(-0.15, 1.6, -0.4), new THREE.Vector3(0.45, 1.55, -0.85), new THREE.Vector3(1.3, 1.35, -0.95)], 0.12, 0.1, 12),
    svc: tubeAlong([new THREE.Vector3(-1.1, 2.6, -0.3), new THREE.Vector3(-1.05, 1.6, -0.08), new THREE.Vector3(-1.0, 1.25, -0.02)], 0.17, 0.17, 12),
    ivc: tubeAlong([new THREE.Vector3(-1.25, -2.0, -0.6), new THREE.Vector3(-1.15, 0.35, -0.12), new THREE.Vector3(-1.1, 0.7, -0.03)], 0.18, 0.18, 12),
    pv1: tubeAlong([new THREE.Vector3(2.1, 1.25, -0.45), new THREE.Vector3(1.45, 1.05, -0.05)], 0.09, 0.09, 10),
    pv2: tubeAlong([new THREE.Vector3(2.1, 0.75, -0.45), new THREE.Vector3(1.45, 0.9, -0.05)], 0.09, 0.09, 10),
    pda: tubeAlong([new THREE.Vector3(0.45, 2.1, -0.6), new THREE.Vector3(0.3, 1.8, -0.62), new THREE.Vector3(0.05, 1.63, -0.45)], 0.07, 0.07, 10),
  }), []);
  const vm = useMemo(() => Object.fromEntries(Object.keys(vessels).map((k) => [k, new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.6, transparent: true, opacity: 0.92 })])) as Record<keyof typeof vessels, THREE.MeshPhysicalMaterial>, [vessels]);
  // particles
  const NP = budget(tier, 700); const inst = useRef<THREE.InstancedMesh>(null);
  const parts = useMemo(() => Array.from({ length: NP }, (_, i) => ({ path: 'svc' as PathId, u: Math.random(), speed: 1, off: new THREE.Vector3((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.12, 0), jet: false, sat: 0.7, alive: false, k: i })), [NP]);
  const cur = useRef({ lv: 1, la: 1, ra: 1, rv: 1, thick: 0, vsd: 0, asd: 0, pfo: 0 });
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), d: new THREE.Vector3(), c: new THREE.Color(), q: new THREE.Vector3(), probe: new THREE.Vector3(0.35, -2.05, 0) }), []);
  const t = useRef(0);
  // assign particles to streams in proportion to flow whenever the physiology changes
  useEffect(() => {
    const st = streams(s); const tot = st.reduce((a, x) => a + x.flow, 0) || 1; let k = 0;
    for (const x of st) { const n = Math.round((NP * x.flow) / tot); for (let j = 0; j < n && k < NP; j++, k++) { const q = parts[k]; q.path = x.id; q.jet = x.jet; q.sat = x.sat; q.alive = x.flow > 0.05; q.speed = x.jet ? Math.min(2.4, 0.55 + 0.4 * s.velocity) : 0.4 + 0.05 * Math.random(); } }
    for (; k < NP; k++) parts[k].alive = false;
  }, [s, parts, NP]);
  useFrame((_, dtRaw) => {
    const dt = frameDt(dtRaw); t.current += Math.min(0.05, dtRaw); const c = cyclePhase(t.current);
    U.uSys.value = c.sys; U.uAtr.value = c.atr; U.uT.value = t.current; U.uMode.value = mode === 'doppler' ? 1 : 0;
    const k = cur.current; const L = s.input.lesion; const sz = s.input.sizeMm;
    k.lv = approach(k.lv, Math.min(1.35, 1 + 0.16 * (s.load.lv - 1)), 3, dt); k.la = approach(k.la, Math.min(1.35, 1 + 0.2 * (s.load.la - 1)), 3, dt);
    k.rv = approach(k.rv, Math.min(1.35, 1 + 0.18 * (s.load.rv - 1)), 3, dt); k.ra = approach(k.ra, Math.min(1.35, 1 + 0.2 * (s.load.ra - 1)), 3, dt);
    k.thick = approach(k.thick, 0.14 * Math.min(1, Math.max(0, (s.p.rvSys - 30) / 90)), 3, dt);
    k.vsd = approach(k.vsd, L === 'vsd' ? 0.03 + sz * 0.009 : 0, 5, dt); k.asd = approach(k.asd, L === 'asd' ? 0.04 + sz * 0.008 : 0, 5, dt); k.pfo = approach(k.pfo, L === 'pfo' && s.rl > 0.05 ? 1 : 0, 6, dt);
    U.uLvS.value = k.lv; U.uLaS.value = k.la; U.uRvS.value = k.rv; U.uRaS.value = k.ra; U.uRvThick.value = k.thick; U.uVsdR.value = k.vsd; U.uAsdR.value = k.asd; U.uPfo.value = k.pfo;
    saturationColor(s.sat.ra, U.uRA.value, true); saturationColor(s.sat.rv, U.uRV.value, true); saturationColor(s.sat.la, U.uLA.value, true); saturationColor(s.sat.lv, U.uLV.value, true);
    saturationColor(s.sat.ao, vm.ao.color, true); saturationColor(s.sat.pa, vm.pa.color, true); vm.rpa.color.copy(vm.pa.color); saturationColor(s.sat.sv, vm.svc.color, true); vm.ivc.color.copy(vm.svc.color);
    saturationColor(0.98, vm.pv1.color, true); vm.pv2.color.copy(vm.pv1.color); saturationColor(s.lr >= s.rl ? s.sat.ao : s.sat.pa, vm.pda.color, true); vm.pda.opacity = L === 'pda' ? 0.95 : 0;
    const im = inst.current; if (!im) return;
    parts.forEach((q, i) => {
      if (!q.alive) { tmp.o.scale.setScalar(0.00001); tmp.o.updateMatrix(); im.setMatrixAt(i, tmp.o.matrix); return; }
      const pth = PATHS[q.path]; const pulse = q.jet ? (q.path === 'vsdLR' || q.path === 'vsdRL' ? 0.25 + 1.5 * c.sys : 1) : 0.6 + 0.6 * c.sys;
      q.u = (q.u + (dt * q.speed * pulse) / pth.len * 0.9) % 1;
      at(pth, q.u, tmp.p, tmp.d); tmp.p.addScaledVector(q.off, q.jet ? 0.45 : 1);
      tmp.o.position.copy(tmp.p); tmp.o.scale.setScalar(q.jet ? 0.022 : 0.017); tmp.o.updateMatrix(); im.setMatrixAt(i, tmp.o.matrix);
      if (mode === 'doppler') {
        const toward = tmp.d.dot(tmp.q.copy(tmp.probe).sub(tmp.p).normalize()); const v = q.jet ? 0.8 + 0.8 * s.velocity : 0.6;
        if (v > 1.6 && q.jet) tmp.c.setHSL(0.13 + 0.2 * ((i * 7919) % 10) / 10, 0.95, 0.55); // aliasing mosaic
        else tmp.c.set(toward > 0 ? '#e0322b' : '#2f6be0').multiplyScalar(0.55 + 0.45 * Math.min(1, Math.abs(toward) * v));
      } else saturationColor(q.sat, tmp.c, true);
      im.setColorAt(i, tmp.c);
    });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  });
  return (<>
    <mesh material={slabMat} renderOrder={2}><planeGeometry args={[4.6, 4.6]} /></mesh>
    {(Object.keys(vessels) as (keyof typeof vessels)[]).map((k) => <mesh key={k} geometry={vessels[k].geometry} material={vm[k]} renderOrder={1} />)}
    <instancedMesh key={NP} ref={inst} args={[new THREE.SphereGeometry(1, 8, 6), undefined, NP]} frustumCulled={false} renderOrder={3}><meshBasicMaterial toneMapped={false} /></instancedMesh>
  </>);
}

function Labels({ s }: { s: ShuntState }) {
  const on = useHeartUI((st) => st.labels); if (!on) return null; const L = s.input.lesion;
  const tag = (p: THREE.Vector3, t: string, cls = '', info?: string) => <Html key={info ?? t} position={p} center zIndexRange={[20, 0]}><LabelChip className={`tag3d tk ${cls}`} text={t} info={info} important={!!info} /></Html>;
  const dir = s.direction === 'none' ? '' : ` · ${s.direction}`;
  return (<>
    {tag(V(-1.0, 1.45), 'RA')}{tag(V(1.0, 1.52), 'LA')}{tag(V(-0.95, -1.6), 'RV')}{tag(V(0.85, -1.85), 'LV')}
    {tag(V(-0.03, -0.75), 'Ventricular septum')}{tag(new THREE.Vector3(0.12, 2.1, -0.25), 'Aorta', 't-art')}{tag(new THREE.Vector3(-0.75, 2.0, -0.75), 'Pulmonary artery', 't-ven')}
    {!IS_PHONE && tag(new THREE.Vector3(-1.1, 2.15, -0.3), 'SVC')}{!IS_PHONE && tag(new THREE.Vector3(2.15, 1.45, -0.45), 'Pulmonary veins')}
    {L === 'vsd' && tag(V(-0.03, 0.22), `VSD ${s.input.sizeMm} mm${dir}`, 't-teal', 'vsd')}
    {L === 'asd' && tag(V(-0.02, 1.35), `ASD ${s.input.sizeMm} mm${dir}`, 't-teal', 'asd')}
    {L === 'pfo' && tag(V(-0.02, 1.35), s.rl > 0.05 ? 'PFO flap open · R→L' : 'PFO flap closed', 't-teal', 'pfo')}
    {L === 'pda' && tag(new THREE.Vector3(0.4, 2.35, -0.6), `PDA${dir}`, 't-teal', 'pda')}
  </>);
}

/* ------------------------------------------------------------------ camera + targets */
const A = ANCHOR;
const VIEW: Record<string, () => [THREE.Vector3, THREE.Vector3]> = {
  'heart.four_chamber': () => [new THREE.Vector3(1.1, 0.6, IS_PHONE ? 11.5 : 9.4), new THREE.Vector3(0.2, 0.05, -0.2)],
  'heart.septum': () => [A.septum.clone().add(new THREE.Vector3(0.3, 0.1, 3.0)), A.septum.clone()],
  'heart.vsd': () => [A.vsd.clone().add(new THREE.Vector3(0.3, 0.2, 3.3)), A.vsd.clone()],
  'heart.asd': () => [A.asd.clone().add(new THREE.Vector3(0.3, 0.2, 3.4)), A.asd.clone()],
  'heart.pfo': () => [A.pfo.clone().add(new THREE.Vector3(0.3, 0.2, 3.2)), A.pfo.clone()],
  'heart.lv': () => [A.lv.clone().add(new THREE.Vector3(0.4, 0.2, 3.0)), A.lv.clone()],
  'heart.rv': () => [A.rv.clone().add(new THREE.Vector3(-0.4, 0.2, 3.0)), A.rv.clone()],
  'heart.pulmonary_outflow': () => [A.outflow.clone().add(new THREE.Vector3(-1.4, 1.0, 2.6)), A.outflow.clone().add(new THREE.Vector3(0, 0.4, 0))],
  'heart.pda': () => [A.pda.clone().add(new THREE.Vector3(2.6, 0.9, 4.2)), A.pda.clone().add(new THREE.Vector3(0, -0.3, 0))],
};
registerAnchors('heart', () => ({ four_chamber: V(0.15, 0.25), septum: A.septum, vsd: A.vsd, asd: A.asd, pfo: A.pfo, lv: A.lv, rv: A.rv, outflow: A.outflow, pda: A.pda }));
function Rig() {
  const cc = useRef<CameraControls>(null); const target = useHeartUI((s) => s.target); const first = useRef(true);
  useEffect(() => { const [p, l] = (VIEW[target] ?? VIEW['heart.four_chamber'])(); cc.current?.setLookAt(p.x, p.y, p.z, l.x, l.y, l.z, !first.current); first.current = false; }, [target]);
  return <CameraControls ref={cc} makeDefault minDistance={1} maxDistance={14} smoothTime={0.55} />;
}

export function HeartScene() {
  const input = useHeartUI((s) => s.input); const tier = useLabUI((s) => s.visualTier) as Tier;
  const s = useMemo(() => solveShunt(input), [input]);
  const [p] = VIEW['heart.four_chamber']();
  return (
    <StudioCanvas camera={{ position: [p.x, p.y, p.z], fov: 32 }} fog={false}>
      <Heart s={s} tier={tier} />
      <Labels s={s} />
      <Rig />
    </StudioCanvas>
  );
}
