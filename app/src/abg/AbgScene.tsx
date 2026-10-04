/**
 * The blood-gas journey: lungs → alveolus & pulmonary capillary → muscle capillary bed → kidney.
 * Everything is driven by the AbgLab snapshot: RBC colour is the local saturation, the number
 * of gas molecules is the local partial pressure, which alveoli are collapsed / unperfused
 * follows shunt and dead space, mitochondria dim when O₂ supply falls short, and the kidney
 * streams bicarbonate back at the rate renal compensation is actually happening.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import type { RespAsset } from '../asset/resp';
import { polylineAt } from '../asset/resp';
import type { MicroAsset, P3 } from '../asset/micro';
import { StudioCanvas, GLSL_TRIPLANAR, tissueTexture, IS_PHONE, damp } from '../scene/Studio';
import { LabelChip } from '../scene/labels';
import { lungMaterial, airwayMaterial, makeLungUniforms } from '../vent/LungScene';
import { lab } from './lab';
import { useAbgUI, type Station } from './abgStore';
import { alveolarRoles } from './roles';

export const LUNG_POS = new THREE.Vector3(-10, 0, 0);
export const KIDNEY_POS = new THREE.Vector3(19, 0, 0);
const MAXA = 16;
export const CAP_PATH = 12; // the capillary the close-up camera follows
const SLOW = 0.9; // RBC speed in scene units/s (≈ ×0.1 real time)

/* ------------------------------------------------------------------ helpers */
const BLOOD_GLSL = /* glsl */ `
vec3 blood(float s){ s = clamp(s, 0.0, 1.0); vec3 deoxy = vec3(0.06, 0.012, 0.10); vec3 oxy = vec3(0.72, 0.04, 0.03);
  return mix(deoxy, oxy, pow(smoothstep(0.55, 0.99, s), 1.5)); }
`;
const bloodJS = (s: number, out = new THREE.Color()) => { s = Math.min(1, Math.max(0, s)); const t = THREE.MathUtils.smoothstep(s, 0.55, 0.99) ** 1.5; return out.setRGB(0.06 + (0.72 - 0.06) * t, 0.012 + (0.04 - 0.012) * t, 0.10 + (0.03 - 0.10) * t); };
const v3 = (p: P3) => new THREE.Vector3(p[0], p[1], p[2]);
class Poly { pts: THREE.Vector3[]; cum: number[]; len: number;
  constructor(pts: THREE.Vector3[]) { this.pts = pts; this.cum = [0]; for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1])); this.len = this.cum[this.cum.length - 1]; }
  at(d: number, out: THREE.Vector3, dir?: THREE.Vector3) { d = Math.min(this.len - 1e-6, Math.max(0, d)); let lo = 0, hi = this.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.cum[m] <= d) lo = m; else hi = m; } const t = (d - this.cum[lo]) / Math.max(1e-6, this.cum[hi] - this.cum[lo]); out.lerpVectors(this.pts[lo], this.pts[hi], t); if (dir) dir.subVectors(this.pts[hi], this.pts[lo]).normalize(); return out; } }

/* ------------------------------------------------------------------ scene */
export function AbgScene({ resp, micro }: { resp: RespAsset; micro: MicroAsset }) {
  return (
    <StudioCanvas camera={{ position: [0, 1, 14], fov: 30 }}>
      <Gate on={['lung']}><group position={LUNG_POS}><Lungs resp={resp} /></group></Gate>
      <Gate on={['alveolus', 'capillary']}><Alveolus micro={micro} /></Gate>
      <Gate on={['tissue']}><Tissue micro={micro} /></Gate>
      <Gate on={['kidney']}><group position={KIDNEY_POS}><Kidney resp={resp} /></group></Gate>
      <Rig micro={micro} />
    </StudioCanvas>
  );
}

/** Only the station being looked at is drawn (keeps phones fast); the previous one stays visible during the camera move. */
function Gate({ on, children }: { on: Station[]; children: React.ReactNode }) {
  const st = useAbgUI((s) => s.station); const g = useRef<THREE.Group>(null); const since = useRef(0); const prev = useRef<Station>(st);
  useEffect(() => { since.current = performance.now(); }, [st]);
  useFrame(() => { if (!g.current) return; const cur = useAbgUI.getState().station; const lingering = on.includes(prev.current) && performance.now() - since.current < 1400; g.current.visible = on.includes(cur) || lingering; if (performance.now() - since.current >= 1400) prev.current = cur; });
  return <group ref={g}>{children}</group>;
}

/* ------------------------------------------------------------------ lungs (macro) */
function Lungs({ resp }: { resp: RespAsset }) {
  const UU = useMemo(() => makeLungUniforms(), []);
  const mats = useMemo(() => ({ lung: lungMaterial(false, UU), wall: airwayMaterial('wall', UU), cart: airwayMaterial('cart', UU) }), [UU]);
  useEffect(() => { const L = resp.mapping.lobes; UU.uHilR.value.set(...L.RUL.hilum); UU.uHilL.value.set(...L.LUL.hilum); UU.uLungH.value = 2.3; }, [resp, UU]);
  const M = resp.meshes; const t = useRef(0);
  const path = useMemo(() => [...resp.mapping.ett.centreline.slice(Math.floor(resp.mapping.ett.centreline.length * 0.35)), resp.mapping.ett.carina], [resp]);
  const N = 60; const parts = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: N }, (_, i) => ({ u: i / N, r: Math.random(), a: Math.random() * Math.PI * 2 })), []);
  const pm = useMemo(() => new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.8, depthWrite: false }), []);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), c1: new THREE.Color('#cfe6ff'), c2: new THREE.Color('#f2b25c') }), []);
  useFrame((_, dtRaw) => {
    const dt = Math.min(0.05, dtRaw); const g = lab.snap; const per = 60 / Math.max(2, g.rr); t.current = (t.current + dt) % per;
    const ph = t.current / per; const insp = ph < 0.35; const v = insp ? Math.sin((ph / 0.35) * Math.PI / 2) : Math.cos(((ph - 0.35) / 0.65) * Math.PI / 2);
    const vol = g.vt * v; const s = (Math.cbrt((1.2 + vol / 2 + 0.3) / 1.2) - 1) * 1.6; UU.uS.value.set(s, s);
    const flow = insp ? 1 : -0.7 * Math.max(0, 1 - (ph - 0.35) / 0.4);
    const inst = parts.current; if (inst) {
      pm.color.lerp(flow >= 0 ? tmp.c1 : tmp.c2, 0.15); pm.opacity = Math.min(0.85, Math.abs(flow) * (g.vt / 0.5));
      seeds.forEach((p, i) => { p.u = (p.u + flow * dt * 0.8 + 1) % 1; polylineAt(path, p.u, tmp.v); const rr = 0.04 * p.r; tmp.v.x += Math.cos(p.a) * rr; tmp.v.z += Math.sin(p.a) * rr; tmp.o.position.copy(tmp.v); tmp.o.updateMatrix(); inst.setMatrixAt(i, tmp.o.matrix); });
      inst.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group position={[0, -0.2, 0]}>
      {['lung_RUL', 'lung_RML', 'lung_RLL', 'lung_LUL', 'lung_LLL'].map((id) => <mesh key={id} geometry={M[id].geometry} material={mats.lung} />)}
      <mesh geometry={M.airway_wall.geometry} material={mats.wall} />
      {M.airway_cartilage && <mesh geometry={M.airway_cartilage.geometry} material={mats.cart} />}
      {M.heart && <mesh geometry={M.heart.geometry}><meshPhysicalMaterial color="#7a2a2a" roughness={0.45} clearcoat={0.4} /></mesh>}
      {M.great_vessels && <mesh geometry={M.great_vessels.geometry}><meshPhysicalMaterial color="#8a3a3c" roughness={0.4} clearcoat={0.4} /></mesh>}
      <instancedMesh ref={parts} args={[new THREE.SphereGeometry(0.014, 8, 6), pm, N]} frustumCulled={false} />
      <Label pos={[0, 1.9, 0]} station="lung" text="Ventilation: fresh gas in, CO₂ out" />
    </group>
  );
}

/* ------------------------------------------------------------------ alveolus + pulmonary capillaries */
function Alveolus({ micro }: { micro: MicroAsset }) {
  const mp = micro.mapping; const M = micro.meshes; const nA = mp.alveoli.length;
  const U = useMemo(() => ({
    uAlvC: { value: mp.alveoli.map((a) => v3(a.c)).concat(Array.from({ length: MAXA - nA }, () => new THREE.Vector3())) },
    uAlvS: { value: new Array(MAXA).fill(1) }, uAlvEnd: { value: new Array(MAXA).fill(0.97) }, uAlvDead: { value: new Array(MAXA).fill(0) },
    uSv: { value: 0.72 }, uSa: { value: 0.97 }, uTissue: { value: tissueTexture() },
  }), [mp, nA]);
  const sacMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#e6a9a2', roughness: 0.42, sheen: 0.6, sheenColor: new THREE.Color('#ffe0da'), clearcoat: 0.4, clearcoatRoughness: 0.3, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nattribute float aAlv; uniform vec3 uAlvC[${MAXA}]; uniform float uAlvS[${MAXA}]; varying float vS; varying vec3 vObj; varying vec3 vObjN;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\nint ai = int(aAlv + 0.5); float sc = 1.0; vec3 cc = vec3(0.0);\nfor (int k = 0; k < ${MAXA}; k++) { if (k == ai) { sc = uAlvS[k]; cc = uAlvC[k]; } }\nif (aAlv > -0.5) transformed = cc + (transformed - cc) * sc; vS = sc; vObj = position; vObjN = objectNormal;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying float vS; varying vec3 vObj; varying vec3 vObjN;\n${GLSL_TRIPLANAR}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n{ vec4 t = tri(vObj, vObjN, 1.6); diffuseColor.rgb *= 0.85 + 0.3 * t.g; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.32, 0.05, 0.07), smoothstep(0.85, 0.55, vS)); diffuseColor.a = mix(diffuseColor.a, 0.85, smoothstep(0.85, 0.55, vS)); }`);
    };
    return m;
  }, [U]);
  const capMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.3, transparent: true, opacity: 1 });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nattribute float aAlv; attribute float aS; attribute float aKind; uniform vec3 uAlvC[${MAXA}]; uniform float uAlvS[${MAXA}]; uniform float uAlvEnd[${MAXA}]; uniform float uAlvDead[${MAXA}]; varying float vEnd; varying float vDead; varying float vS2; varying float vKind;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\nint ai = int(aAlv + 0.5); float sc = 1.0; vec3 cc = vec3(0.0); vEnd = 0.97; vDead = 0.0;\nfor (int k = 0; k < ${MAXA}; k++) { if (k == ai) { sc = uAlvS[k]; cc = uAlvC[k]; vEnd = uAlvEnd[k]; vDead = uAlvDead[k]; } }\nif (aAlv > -0.5) transformed = cc + (transformed - cc) * mix(1.0, sc, 0.9); vS2 = aS; vKind = aKind;`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nuniform float uSv; uniform float uSa; varying float vEnd; varying float vDead; varying float vS2; varying float vKind;\n${BLOOD_GLSL}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n{ float s = vKind < 0.5 ? uSv : vKind > 2.5 ? uSa : mix(uSv, vEnd, 1.0 - exp(-vS2 / 0.14));\n  vec3 c = blood(s); c = mix(c, vec3(0.42, 0.36, 0.36), vDead * 0.85); diffuseColor.rgb = c; }`);
    };
    return m;
  }, [U]);
  // RBC routes: pulmonary artery branch → capillary over one alveolus → venule
  const routes = useMemo(() => {
    const art = mp.arteriole.map(v3), ven = mp.venule.map(v3);
    return mp.paths.map((p) => {
      const pre = art.slice(0, p.a + 1), mid = p.pts.map(v3), post = ven.slice(0, p.v + 1).reverse();
      const poly = new Poly([...pre, ...mid, ...post]);
      const d0 = poly.cum[pre.length], d1 = poly.cum[pre.length + mid.length - 1];
      return { poly, d0: d0 + (d1 - d0) * p.m0 * 0.9, d1: d0 + (d1 - d0) * Math.min(1, p.m1 * 1.05), alv: p.alv };
    });
  }, [mp]);
  const NR = IS_PHONE ? 110 : 190; const rbcRef = useRef<THREE.InstancedMesh>(null);
  const rbcs = useMemo(() => Array.from({ length: NR }, (_, i) => ({ route: i % routes.length, d: Math.random() * 30, spin: Math.random() * Math.PI * 2 })), [NR, routes.length]);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.38, clearcoat: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#ff9a8a') }), []);
  // gas molecules in each alveolus
  const gas = useMemo(() => buildGas(mp), [mp]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), d: new THREE.Vector3(), c: new THREE.Color(), q: new THREE.Quaternion(), up: new THREE.Vector3(0, 0, 1) }), []);
  const breath = useRef(0);
  useFrame((st, dtRaw) => {
    const dt = Math.min(0.05, dtRaw); const g = lab.snap; const p = lab.pt.p;
    const close = useAbgUI.getState().station === 'capillary'; capMat.opacity = damp(capMat.opacity, close ? 0.28 : 1, 4, (window as unknown as { __instant?: boolean }).__instant ? 1 : dt); capMat.depthWrite = capMat.opacity > 0.9;
    const roles = alveolarRoles(nA, mp.alveoli.map((a) => a.c[1]), p.shunt, p.lowVQ, p.vdAlv);
    const per = 60 / Math.max(2, g.rr); breath.current = (breath.current + dt) % per; const ph = breath.current / per;
    const vt = Math.min(1, g.vt / 0.5); const inflate = ph < 0.35 ? Math.sin((ph / 0.35) * Math.PI / 2) : Math.cos(((ph - 0.35) / 0.65) * Math.PI / 2);
    U.uSv.value = damp(U.uSv.value, g.svo2, 3, dt); U.uSa.value = damp(U.uSa.value, g.sao2, 3, dt);
    const endOf = (r: string) => (r === 'shunt' ? g.svo2 : r === 'low' ? g.ccLow : g.ccNormal);
    for (let i = 0; i < nA; i++) {
      const r = roles[i]; const tgtS = r === 'shunt' ? 0.55 : 1 + 0.035 * vt * inflate * (r === 'low' ? 0.3 : 1);
      U.uAlvS.value[i] = damp(U.uAlvS.value[i], tgtS, 4, dt);
      U.uAlvEnd.value[i] = damp(U.uAlvEnd.value[i], endOf(r), 3, dt);
      U.uAlvDead.value[i] = damp(U.uAlvDead.value[i], r === 'dead' ? 1 : 0, 3, dt);
    }
    // gas densities (∝ partial pressure) and exchange direction
    const PIO2 = p.fio2 * 713; const pvco2 = g.vbg.pco2;
    for (let i = 0; i < nA; i++) {
      const r = roles[i];
      const po2 = r === 'shunt' ? 0 : r === 'dead' ? PIO2 : r === 'low' ? Math.max(20, g.pAO2 * 0.45) : g.pAO2;
      const pco2 = r === 'shunt' || r === 'dead' ? 0 : r === 'low' ? pvco2 : g.paco2;
      gas.o2Density[i] = damp(gas.o2Density[i], Math.min(1, po2 / 650), 3, dt); gas.co2Density[i] = damp(gas.co2Density[i], Math.min(1, pco2 / 110), 3, dt);
      gas.scale[i] = U.uAlvS.value[i];
    }
    gas.update(st.clock.elapsedTime, ph);
    // RBCs
    const inst = rbcRef.current; if (!inst) return;
    const weights = routes.map((rt) => (roles[rt.alv] === 'dead' ? 0 : 1));
    rbcs.forEach((b, i) => {
      let rt = routes[b.route];
      b.d += dt * SLOW * (0.85 + 0.3 * ((i * 37) % 10) / 10) * Math.min(1.6, Math.max(0.35, g.co / 5));
      if (b.d > rt.poly.len || weights[b.route] === 0) { let k = b.route; for (let n = 0; n < routes.length; n++) { k = (k + 7) % routes.length; if (weights[k] > 0) break; } b.route = k; b.d = 0; rt = routes[k]; }
      rt.poly.at(b.d, tmp.p, tmp.d); tmp.o.position.copy(tmp.p);
      tmp.q.setFromUnitVectors(tmp.up, tmp.d); tmp.o.quaternion.copy(tmp.q); tmp.o.rotateZ(b.spin + st.clock.elapsedTime * 0.5);
      tmp.o.scale.setScalar(1); tmp.o.updateMatrix(); inst.setMatrixAt(i, tmp.o.matrix);
      const r = roles[rt.alv]; const f = b.d < rt.d0 ? 0 : b.d > rt.d1 ? 1 : (b.d - rt.d0) / (rt.d1 - rt.d0);
      const sEnd = U.uAlvEnd.value[rt.alv]; const s = b.d > rt.d1 ? (r === 'shunt' ? g.svo2 : sEnd) : g.svo2 + (sEnd - g.svo2) * (1 - Math.exp(-f / 0.14));
      inst.setColorAt(i, bloodJS(b.d > rt.d1 + 1.2 ? g.sao2 : s, tmp.c));
    });
    inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });
  return (
    <group>
      <mesh geometry={M.alveolar_sac.geometry} material={sacMat} renderOrder={3} />
      <mesh geometry={M.pulm_capillaries.geometry} material={capMat} />
      {M.pulm_arteriole && <mesh geometry={M.pulm_arteriole.geometry} material={capMat} />}
      {M.pulm_venule && <mesh geometry={M.pulm_venule.geometry} material={capMat} />}
      <instancedMesh ref={rbcRef} args={[M.rbc.geometry, rbcMat, NR]} frustumCulled={false} />
      <primitive object={gas.o2} /><primitive object={gas.co2} />
      <Label pos={v3(mp.arteriole[Math.floor(mp.arteriole.length * 0.42)])} station="alveolus" text="Pulmonary arteriole: mixed venous blood" tone="ven" />
      <Label pos={v3(mp.venule[Math.floor(mp.venule.length * 0.58)])} station="alveolus" text="Pulmonary venule: arterialised blood" tone="art" />
      <Label pos={[0, 3.6, 0]} station="alveolus" text="Alveolar duct" />
      <Label pos={v3(mp.paths[CAP_PATH].pts[Math.floor(mp.paths[CAP_PATH].pts.length / 2)])} station="capillary" text="Capillary: RBCs load O₂ in the first third of their transit" />
    </group>
  );
}

/** Gas molecules: O₂ (pale blue) and CO₂ (amber) clouds, one per alveolus; density follows partial pressure. */
function buildGas(mp: MicroAsset['mapping']) {
  const nA = mp.alveoli.length; const per = IS_PHONE ? 26 : 40;
  const mk = (color: string, exchangeDir: number) => {
    const n = nA * per; const pos = new Float32Array(n * 3); const home = new Float32Array(n * 3); const tgt = new Float32Array(n * 3); const meta = new Float32Array(n * 3); // alv, rank, phase
    for (let i = 0; i < nA; i++) {
      const a = mp.alveoli[i]; const caps = mp.paths.filter((p) => p.alv === i).flatMap((p) => p.pts.slice(Math.floor(p.pts.length * 0.3), Math.floor(p.pts.length * 0.7)));
      for (let k = 0; k < per; k++) {
        const j = i * per + k; const u = new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * a.r * 0.78);
        home.set([a.c[0] + u.x, a.c[1] + u.y, a.c[2] + u.z], j * 3);
        const c = caps.length ? caps[Math.floor(Math.random() * caps.length)] : a.c; tgt.set(c, j * 3);
        meta.set([i, k / per, Math.random()], j * 3);
      }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aVis', new THREE.BufferAttribute(new Float32Array(n), 1));
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uColor: { value: new THREE.Color(color) }, uSize: { value: IS_PHONE ? 30 : 38 } },
      vertexShader: 'attribute float aVis; varying float vA; uniform float uSize; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aVis / -mv.z; vA = aVis; }',
      fragmentShader: 'uniform vec3 uColor; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d,d); if (r > 0.25) discard; float a = smoothstep(0.25, 0.02, r); gl_FragColor = vec4(uColor * (0.9 + 0.3 * (1.0 - r * 4.0)), a * 0.9 * step(0.01, vA)); }' });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5;
    return { pts, pos, home, tgt, meta, n, exchangeDir };
  };
  const o2 = mk('#d6ecff', +1), co2 = mk('#f2b25c', -1);
  const o2Density = new Array(nA).fill(0.2), co2Density = new Array(nA).fill(0.3), scale = new Array(nA).fill(1);
  const upd = (g: ReturnType<typeof mk>, dens: number[], t: number, ph: number) => {
    const vis = g.pts.geometry.getAttribute('aVis') as THREE.BufferAttribute; const P = g.pos;
    for (let j = 0; j < g.n; j++) {
      const i = g.meta[j * 3], rank = g.meta[j * 3 + 1], phase = g.meta[j * 3 + 2]; const a = mp.alveoli[i]; const sc = scale[i];
      const on = rank < dens[i] ? 1 : 0; vis.setX(j, on);
      const hx = a.c[0] + (g.home[j * 3] - a.c[0]) * sc, hy = a.c[1] + (g.home[j * 3 + 1] - a.c[1]) * sc, hz = a.c[2] + (g.home[j * 3 + 2] - a.c[2]) * sc;
      const w = 0.06; let x = hx + Math.sin(t * 1.3 + phase * 40) * w, y = hy + Math.sin(t * 1.1 + phase * 23) * w, z = hz + Math.cos(t * 1.5 + phase * 31) * w;
      if (rank > 0.72 && on) { // exchanging molecules shuttle between alveolar gas and the capillary
        const c = ((t * 0.35 + phase) % 1); const f = g.exchangeDir > 0 ? c : 1 - c; const e = f * f * (3 - 2 * f);
        x += (g.tgt[j * 3] - x) * e; y += (g.tgt[j * 3 + 1] - y) * e; z += (g.tgt[j * 3 + 2] - z) * e;
        vis.setX(j, on * (g.exchangeDir > 0 ? 1 - c * c : c < 0.1 ? c * 10 : 1));
      }
      if (g.exchangeDir < 0 && ph > 0.4 && rank < 0.25) y += ((ph - 0.4) / 0.6) * 1.2; // exhaled toward the duct
      P[j * 3] = x; P[j * 3 + 1] = y; P[j * 3 + 2] = z;
    }
    vis.needsUpdate = true; (g.pts.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
  };
  return { o2: o2.pts, co2: co2.pts, o2Density, co2Density, scale, update: (t: number, ph: number) => { upd(o2, o2Density, t, ph); upd(co2, co2Density, t, ph); } };
}

/* ------------------------------------------------------------------ muscle capillary bed */
function Tissue({ micro }: { micro: MicroAsset }) {
  const mp = micro.mapping.tissue; const M = micro.meshes;
  const U = useMemo(() => ({ uSa: { value: 0.97 }, uSv: { value: 0.7 }, uTissue: { value: tissueTexture() }, uAerobic: { value: 1 } }), []);
  const capMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.35, clearcoat: 0.6 });
    m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aS; varying float vS2;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvS2 = aS;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nuniform float uSa; uniform float uSv; varying float vS2;\n${BLOOD_GLSL}`).replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = blood(mix(uSa, uSv, smoothstep(0.0, 1.0, vS2)));'); };
    return m;
  }, [U]);
  const fibreMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#9b3b3b', roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#ffc0b0'), clearcoat: 0.25, transparent: true, opacity: 0.72, depthWrite: false });
    m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj;').replace('#include <color_fragment>', '#include <color_fragment>\n{ float band = 0.5 + 0.5 * sin(vObj.x * 90.0); diffuseColor.rgb *= 0.78 + 0.3 * smoothstep(0.2, 0.9, band); }'); };
    return m;
  }, [U]);
  const mitoRef = useRef<THREE.InstancedMesh>(null); const nM = mp.mito.length / 4;
  const mitoMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d99a5b', roughness: 0.4, emissive: new THREE.Color('#ff9a3c'), emissiveIntensity: 0.6 }), []);
  useEffect(() => { const inst = mitoRef.current; if (!inst) return; const o = new THREE.Object3D(); for (let i = 0; i < nM; i++) { o.position.set(mp.mito[i * 4], mp.mito[i * 4 + 1], mp.mito[i * 4 + 2]); o.rotation.set(0, 0, Math.PI / 2 + mp.mito[i * 4 + 3] * 0.2); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); } inst.instanceMatrix.needsUpdate = true; }, [mp, nM]);
  const routes = useMemo(() => mp.paths.map((p) => new Poly(p.map(v3))), [mp]);
  const NR = IS_PHONE ? 60 : 110; const rbcRef = useRef<THREE.InstancedMesh>(null);
  const rbcs = useMemo(() => Array.from({ length: NR }, (_, i) => ({ route: i % routes.length, d: Math.random() * routes[i % routes.length].len, spin: Math.random() * 6 })), [NR, routes]);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.38, clearcoat: 0.5 }), []);
  const flux = useMemo(() => buildFlux(mp), [mp]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), d: new THREE.Vector3(), c: new THREE.Color(), q: new THREE.Quaternion(), up: new THREE.Vector3(0, 0, 1) }), []);
  useFrame((st, dtRaw) => {
    const dt = Math.min(0.05, dtRaw); const g = lab.snap;
    U.uSa.value = damp(U.uSa.value, g.sao2, 3, dt); U.uSv.value = damp(U.uSv.value, g.svo2, 3, dt);
    const aerobic = g.demandVO2 > 0 ? Math.min(1, g.vo2 / g.demandVO2) : 1; U.uAerobic.value = damp(U.uAerobic.value, aerobic, 3, dt);
    mitoMat.emissiveIntensity = 0.15 + 0.75 * U.uAerobic.value ** 3;
    flux.update(st.clock.elapsedTime, { o2: Math.min(1, g.vo2 / 400), co2: Math.min(1, lab.pt.p.vco2 / 350), lac: Math.min(1, Math.max(0, (g.lactate - 1) / 8) + g.o2debt / 150) });
    const inst = rbcRef.current; if (!inst) return;
    rbcs.forEach((b, i) => {
      const rt = routes[b.route]; b.d += dt * SLOW * Math.min(1.6, Math.max(0.35, g.co / 5)); if (b.d > rt.len) { b.d = 0; b.route = (b.route + 1) % routes.length; }
      const r = routes[b.route]; r.at(b.d, tmp.p, tmp.d); tmp.o.position.copy(tmp.p); tmp.q.setFromUnitVectors(tmp.up, tmp.d); tmp.o.quaternion.copy(tmp.q); tmp.o.rotateZ(b.spin + st.clock.elapsedTime * 0.4); tmp.o.updateMatrix(); inst.setMatrixAt(i, tmp.o.matrix);
      const f = THREE.MathUtils.clamp((b.d / r.len - 0.12) / 0.76, 0, 1); inst.setColorAt(i, bloodJS(U.uSa.value + (U.uSv.value - U.uSa.value) * f, tmp.c));
    });
    inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });
  const c = mp.centre; const half = mp.length / 2;
  return (
    <group>
      <mesh geometry={M.muscle_fibres.geometry} material={fibreMat} renderOrder={2} />
      <instancedMesh ref={mitoRef} args={[new THREE.CapsuleGeometry(0.014, 0.035, 3, 8), mitoMat, nM]} />
      <mesh geometry={M.tissue_capillaries.geometry} material={capMat} />
      {M.tissue_arteriole && <mesh geometry={M.tissue_arteriole.geometry} material={capMat} />}
      {M.tissue_venule && <mesh geometry={M.tissue_venule.geometry} material={capMat} />}
      <instancedMesh ref={rbcRef} args={[M.rbc.geometry, rbcMat, NR]} frustumCulled={false} />
      <primitive object={flux.points} />
      <Label pos={[c[0] - half - 2.6, c[1] + 1.8, c[2] + 0.6]} station="tissue" text="Arteriole — an ABG samples this blood" tone="art" />
      <Label pos={[c[0] + half + 2.6, c[1] - 1.8, c[2] - 0.6]} station="tissue" text="Venule — a VBG samples this blood" tone="ven" />
    </group>
  );
}

/** O₂ leaving capillaries into fibres, CO₂ leaving fibres into capillaries, lactate leaking out when O₂ falls short. */
function buildFlux(mp: MicroAsset['mapping']['tissue']) {
  const N = IS_PHONE ? 260 : 420; const pos = new Float32Array(N * 3); const col = new Float32Array(N * 3); const vis = new Float32Array(N);
  const kinds: number[] = []; const from: THREE.Vector3[] = []; const to: THREE.Vector3[] = []; const phase: number[] = [];
  const capPts = mp.paths.flatMap((p) => p.slice(10, p.length - 10)).map(v3);
  const inFibre = () => { const f = mp.fibres[Math.floor(Math.random() * mp.fibres.length)]; const a = Math.random() * Math.PI * 2, r = f.r * 0.7 * Math.sqrt(Math.random()); return new THREE.Vector3(f.c[0] + (Math.random() - 0.5) * mp.length * 0.9, f.c[1] + Math.sin(a) * r, f.c[2] + Math.cos(a) * r); };
  const C = [new THREE.Color('#d6ecff'), new THREE.Color('#f2b25c'), new THREE.Color('#e16ad0')];
  for (let i = 0; i < N; i++) {
    const k = i % 5 === 4 ? 2 : i % 2; kinds.push(k); phase.push(Math.random());
    const cp = capPts[Math.floor(Math.random() * capPts.length)]; const fp = inFibre();
    if (k === 0) { from.push(cp); to.push(fp); } else { from.push(fp); to.push(k === 1 ? cp : fp.clone().add(new THREE.Vector3(0, 0, 0).randomDirection().multiplyScalar(0.6))); }
    col.set([C[k].r, C[k].g, C[k].b], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aVis', new THREE.BufferAttribute(vis, 1));
  const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true, uniforms: { uSize: { value: IS_PHONE ? 26 : 32 } },
    vertexShader: 'attribute float aVis; varying float vA; varying vec3 vC; uniform float uSize; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aVis / -mv.z; vA = aVis; vC = color; }',
    fragmentShader: 'varying float vA; varying vec3 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d,d); if (r > 0.25) discard; gl_FragColor = vec4(vC, smoothstep(0.25, 0.02, r) * 0.9 * step(0.01, vA)); }' });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false; points.renderOrder = 6;
  const tmp = new THREE.Vector3();
  const update = (t: number, rate: { o2: number; co2: number; lac: number }) => {
    for (let i = 0; i < N; i++) {
      const k = kinds[i]; const dens = k === 0 ? rate.o2 : k === 1 ? rate.co2 : rate.lac; const on = (i / N) < dens * 1.02 ? 1 : 0;
      const c = (t * (k === 2 ? 0.18 : 0.32) + phase[i]) % 1; tmp.lerpVectors(from[i], to[i], c * c * (3 - 2 * c));
      pos.set([tmp.x, tmp.y, tmp.z], i * 3); vis[i] = on * (c < 0.1 ? c * 10 : c > 0.85 ? (1 - c) / 0.15 : 1);
    }
    geo.attributes.position.needsUpdate = true; (geo.getAttribute('aVis') as THREE.BufferAttribute).needsUpdate = true;
  };
  return { points, update };
}

/* ------------------------------------------------------------------ kidney */
function Kidney({ resp }: { resp: RespAsset }) {
  const M = resp.meshes;
  const geo = useMemo(() => {
    const ks = ['kidney_L', 'kidney_R'].filter((k) => M[k]).map((k) => M[k].geometry.clone());
    const box = new THREE.Box3(); ks.forEach((g) => { g.computeBoundingBox(); box.union(g.boundingBox!); });
    const c = box.getCenter(new THREE.Vector3()); const s = 4.2 / Math.max(0.1, box.getSize(new THREE.Vector3()).x);
    ks.forEach((g) => { g.translate(-c.x, -c.y, -c.z); g.scale(s, s, s); }); return ks;
  }, [M]);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#7d3328', roughness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.3, sheen: 0.4, sheenColor: new THREE.Color('#ffc8b8') }), []);
  const N = 160; const pts = useMemo(() => {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vis = new Float32Array(N);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aVis', new THREE.BufferAttribute(vis, 1));
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true, uniforms: { uSize: { value: 40 } },
      vertexShader: 'attribute float aVis; varying float vA; varying vec3 vC; uniform float uSize; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aVis / -mv.z; vA = aVis; vC = color; }',
      fragmentShader: 'varying float vA; varying vec3 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d,d); if (r > 0.25) discard; gl_FragColor = vec4(vC, smoothstep(0.25, 0.02, r) * 0.9 * step(0.01, vA)); }' });
    const p = new THREE.Points(geo, mat); p.frustumCulled = false; return { p, pos, col, vis, geo };
  }, []);
  const teal = useMemo(() => new THREE.Color('#5fd0c4'), []), red = useMemo(() => new THREE.Color('#ff6a5a'), []);
  useFrame((st) => {
    const k = lab.kidney(); const rate = Math.max(-1, Math.min(1, k.rate * 120)); const t = st.clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const hco3 = i % 2 === 0; const up = hco3 ? rate >= 0 : rate < 0; // retained HCO₃⁻ goes back up the renal vein; excreted goes down the ureter
      const c = (t * 0.25 + i / N * 3) % 1; const side = i % 4 < 2 ? -1 : 1;
      const x = side * 1.1 + side * (1 - c) * 0.2, y = up ? -0.2 + c * 3.2 : -0.2 - c * 3.2, z = 0.5 + Math.sin(i * 12.9) * 0.15;
      pts.pos.set([x, y, z], i * 3); const col = hco3 ? teal : red; pts.col.set([col.r, col.g, col.b], i * 3);
      pts.vis[i] = (i / N) < Math.abs(rate) * 1.2 + 0.02 ? (c < 0.1 ? c * 10 : c > 0.85 ? (1 - c) / 0.15 : 1) : 0;
    }
    pts.geo.attributes.position.needsUpdate = true; pts.geo.attributes.color.needsUpdate = true; (pts.geo.getAttribute('aVis') as THREE.BufferAttribute).needsUpdate = true;
  });
  return (
    <group>
      {geo.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}
      <primitive object={pts.p} />
      <Label pos={[0, 3.3, 0.5]} station="kidney" text="Renal vein: reclaimed / new HCO₃⁻" tone="teal" />
      <Label pos={[0, -3.6, 0.5]} station="kidney" text="Urine: H⁺ excreted as NH₄⁺ / H₂PO₄⁻" tone="red" />
    </group>
  );
}

/* ------------------------------------------------------------------ labels + camera */
function Label({ pos, text, station, tone }: { pos: THREE.Vector3 | [number, number, number]; text: string; station: Station; tone?: string }) {
  const cur = useAbgUI((s) => s.station); if (cur !== station) return null;
  return <Html position={pos as never} center zIndexRange={[20, 0]}><LabelChip className={`tag3d${tone ? ' t-' + tone : ''}`} text={text} /></Html>;
}
export const STATIONS: Record<Station, { tgt: [number, number, number]; dir: [number, number, number]; size: [number, number] }> = {
  lung: { tgt: [LUNG_POS.x, 0.2, 0], dir: [0.1, 0.12, 1], size: [3.0, 3.6] },
  alveolus: { tgt: [0, 0.5, 0], dir: [0.35, 0.18, 1], size: [6.2, 8.6] },
  capillary: { tgt: [0, 0, 0], dir: [0.3, 0.2, 1], size: [0.9, 0.7] },
  tissue: { tgt: [9, 0, 0], dir: [0.25, 0.35, 1], size: [7.8, 3.8] },
  kidney: { tgt: [KIDNEY_POS.x, 0, 0], dir: [0.1, 0.1, 1], size: [5, 7.6] },
};
function Rig({ micro }: { micro: MicroAsset }) {
  const three = useThree(); (window as unknown as Record<string, unknown>).__three = three; const ref = useRef<CameraControls>(null); const st = useAbgUI((s) => s.station);
  useMemo(() => { const p = micro.mapping.paths[CAP_PATH]; const q = p.pts[Math.floor(p.pts.length / 2)]; const a = micro.mapping.alveoli[p.alv].c; STATIONS.capillary.tgt = q; STATIONS.capillary.dir = [q[0] - a[0], q[1] - a[1] + 0.3, q[2] - a[2]]; }, [micro]);
  const aspect = three.size.width / Math.max(1, three.size.height);
  useEffect(() => {
    if (!(aspect > 0.05) || !isFinite(aspect)) return;
    const v = STATIONS[st]; const cam = three.camera as THREE.PerspectiveCamera; const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.min(60, Math.max(v.size[1] / (2 * t), v.size[0] / (2 * t * aspect)) * 1.05 + 1);
    const d = new THREE.Vector3(...v.dir).normalize().multiplyScalar(dist);
    ref.current?.setLookAt(v.tgt[0] + d.x, v.tgt[1] + d.y, v.tgt[2] + d.z, ...v.tgt, !(window as unknown as { __instant?: boolean }).__instant);
  }, [st, aspect, three.camera]);
  return <CameraControls ref={ref} makeDefault minDistance={1.5} maxDistance={40} smoothTime={0.9} />;
}
