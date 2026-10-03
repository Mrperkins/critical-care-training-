/**
 * Alveolar close-up — a cluster of alveoli around an alveolar duct, their septal capillaries and
 * red cells, and a cross-section of the alveolar–capillary barrier. Every visible state is read
 * from the running VentSession through `alveolarState` (see alveolarMap.ts): alveolar size from
 * regional volume, collapse / recruitment from the engine's open fraction, flooding and
 * interstitial thickening from the scenario's lung, and blood colour from the shared patient's
 * mixed-venous and end-capillary saturations. There is no second respiratory model here.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { StudioCanvas, IS_PHONE, GLSL_NOISE } from '../scene/Studio';
import { LabelChip } from '../scene/labels';
import { rbcGeometry, saturationColor as satColor, approach, budget, MotePool, SAT_PALETTE, frameDt, type Tier } from '../scene/effects';
/** this scene uses the blue→red teaching palette so O₂ loading along the capillary is visible */
const saturationColor = (sat: number, out?: THREE.Color) => satColor(sat, out, true);
import { registerAnchors } from '../scene/cameraTargets';
import { session } from './session';
import { useUI } from '../app/store';
import { useLabUI } from '../labs/labStore';
import { alveolarState, type AlveolarState } from './alveolarMap';

/* ------------------------------------------------------------------ layout (static) */
const R0 = 0.6; const DUCT_R = 0.3; const RING = 0.95; const XS = [-1.95, -0.65, 0.65, 1.95];
const COS_MOUTH = 0.8; const COS_CUT = 0.66; const MEMBRANE_AT = new THREE.Vector3(5.8, 0, 0);
interface UnitDef { i: number; c: THREE.Vector3; mouth: THREE.Vector3; cut: THREE.Vector3 | null; rank: number; front: boolean }
const UNITS: UnitDef[] = (() => {
  const out: UnitDef[] = [];
  XS.forEach((x, ri) => [90, 210, 330].forEach((a0) => {
    const a = THREE.MathUtils.degToRad(a0 + (ri % 2) * 60);
    const c = new THREE.Vector3(x + (ri % 2 ? 0.08 : -0.08), Math.sin(a) * RING, Math.cos(a) * RING);
    const mouth = new THREE.Vector3(x, 0, 0).sub(c).normalize();
    const front = c.z > -0.25;
    out.push({ i: out.length, c, mouth, cut: front ? new THREE.Vector3(0, 0.12, 1).normalize() : null, rank: 0, front });
  }));
  // dependency: lower = more dependent (gravity along −y); tiny x term breaks ties deterministically
  out.forEach((u) => { u.rank = THREE.MathUtils.clamp(((RING - u.c.y) / (2 * RING)) * 0.92 + ((u.c.x + 2.2) / 4.4) * 0.08, 0, 1); });
  return out;
})();
const RANKS = UNITS.map((u) => u.rank);

/* ------------------------------------------------------------------ live state shared by the scene and the HUD */
export const alvLive: { st: AlveolarState | null; glow: number[]; anchors: Record<string, THREE.Vector3> } = { st: null, glow: UNITS.map(() => 0), anchors: {} };
export const readAlveolar = () => alveolarState(session, RANKS);

const segsFor = (t: Tier) => (t === 'high' ? [64, 44] : t === 'medium' ? [48, 32] : [30, 20]);

/** Holes (duct mouth, cutaway window) are cut in the fragment shader so their edges stay round at every tier. */
const HOLE = 'vec3 nl = normalize(vLocal); if (dot(nl, uMouth) > 0.8 || (uCutOn > 0.5 && dot(nl, uCut) > 0.66)) discard;';
const sphereFor = (tier: Tier) => { const [w, h] = segsFor(tier); return new THREE.SphereGeometry(1, w, h); };

/** Septal capillaries: small circles on the alveolar surface, trimmed to avoid the openings. */
function capillaryArcs(u: UnitDef, tier: Tier, seed: number) {
  let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const nArc = tier === 'high' ? 6 : tier === 'medium' ? 5 : 3; const arcs: THREE.Vector3[][] = [];
  for (let tries = 0; arcs.length < nArc && tries < 40; tries++) {
    const ax = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const e1 = new THREE.Vector3().crossVectors(ax, Math.abs(ax.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize(); const e2 = new THREE.Vector3().crossVectors(ax, e1);
    const phi = THREE.MathUtils.degToRad(35 + rnd() * 45); const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 120; i++) { const t = (i / 120) * Math.PI * 2; pts.push(ax.clone().multiplyScalar(Math.cos(phi)).addScaledVector(e1, Math.sin(phi) * Math.cos(t)).addScaledVector(e2, Math.sin(phi) * Math.sin(t))); }
    const ok = pts.map((p) => p.dot(u.mouth) < COS_MOUTH - 0.08 && (!u.cut || p.dot(u.cut) < COS_CUT - 0.08));
    let best: [number, number] = [0, 0]; for (let i = 0; i < 240; i++) { if (!ok[i % 120]) continue; let j = i; while (j < i + 119 && ok[(j + 1) % 120]) j++; if (j - i > best[1] - best[0]) best = [i, j]; i = j; }
    if (best[1] - best[0] < 28) continue;
    const run: THREE.Vector3[] = []; for (let i = best[0]; i <= best[1]; i++) run.push(pts[i % 120].clone().multiplyScalar(1.045));
    arcs.push(run);
  }
  return arcs;
}
const TUBE_R = 0.034 / R0; // capillary lumen ≈ one red cell wide (in unit-sphere coordinates)
function capillaryGeometry(arcs: THREE.Vector3[][], tier: Tier) {
  const radial = tier === 'low' ? 4 : 7;
  const parts = arcs.map((a) => {
    const tubular = Math.max(12, Math.round(a.length * 0.8)); const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(a), tubular, TUBE_R, radial, false);
    const n = g.attributes.position.count; const sAttr = new Float32Array(n); for (let i = 0; i <= tubular; i++) for (let j = 0; j <= radial; j++) sAttr[i * (radial + 1) + j] = i / tubular;
    g.setAttribute('aS', new THREE.BufferAttribute(sAttr, 1)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g;
  });
  return mergeGeometries(parts)!;
}

/** Arrange shader: local-position varying + optional fragment discard, sharing uniforms we own. */
function patch(mat: THREE.Material, uniformsIn: object, opts: { vertex?: string; discard?: string; head?: string; color?: string }) {
  const uniforms = uniformsIn as Record<string, THREE.IUniform>;
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    const decl = `varying vec3 vLocal; ${Object.keys(uniforms).map((k) => `uniform ${typeof uniforms[k].value === 'number' ? 'float' : 'vec3'} ${k};`).join(' ')}\n${opts.head ?? ''}\n`;
    sh.vertexShader = decl.replace(opts.head ?? '\u0000', '') + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n vLocal = position; ${opts.vertex ?? ''}`);
    sh.fragmentShader = decl + sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n ${opts.discard ?? ''}`).replace('#include <color_fragment>', `#include <color_fragment>\n ${opts.color ?? ''}`);
  };
  mat.customProgramCacheKey = () => JSON.stringify(opts);
  return mat;
}

/* ------------------------------------------------------------------ one alveolus */
interface HoleU { uMouth: { value: THREE.Vector3 }; uCut: { value: THREE.Vector3 }; uCutOn: { value: number } }
interface UnitRuntime { group: THREE.Group; hole: HoleU; wallU: HoleU & { uCol: { value: number }; uBloodV: { value: THREE.Color }; uBloodA: { value: THREE.Color }; uWet: { value: number } }; fluidU: HoleU & { uLevel: { value: number } }; surfU: HoleU & { uSurf: { value: number } }; arcs: THREE.Vector3[][]; cap: THREE.BufferGeometry; wall: THREE.MeshPhysicalMaterial; cur: { s: number; col: number; flood: number; over: number; low: number }; lastSat: number }

// Wall: thin septal tissue whose surface carries the dense capillary sheet (Voronoi network). Blood in the
// sheet runs from the arteriole side (below) to the venule side (above) and is coloured from venous to the
// unit's end-capillary saturation — so shunt units stay blue and aerated units turn red.
const WALL_COLOR = /* glsl */ `
{
  vec3 q = vLocal * 5.2; vec2 vv = voro(q); float edge = 1.0 - smoothstep(0.02, 0.11, vv.y - vv.x);
  vec2 v2 = voro(q * 2.3 + 7.1); edge = max(edge, 0.55 * (1.0 - smoothstep(0.015, 0.07, v2.y - v2.x)));
  float t = smoothstep(-0.95, 0.25, vLocal.y);
  vec3 blood = mix(uBloodV, uBloodA, t);
  float tone = 0.86 + 0.28 * fbm(vLocal * 9.0);
  diffuseColor.rgb *= tone;
  diffuseColor.rgb = mix(diffuseColor.rgb, blood, edge * 0.82 * (1.0 - 0.45 * uCol) * (1.0 - 0.35 * uWet));
}`;

function useUnits(tier: Tier) {
  return useMemo(() => UNITS.map((u): UnitRuntime => {
    const hole: HoleU = { uMouth: { value: u.mouth.clone() }, uCut: { value: (u.cut ?? new THREE.Vector3(0, 0, 1)).clone() }, uCutOn: { value: u.cut ? 1 : 0 } };
    const wallU = { ...hole, uCol: { value: 0 }, uBloodV: { value: new THREE.Color() }, uBloodA: { value: new THREE.Color() }, uWet: { value: 0 } };
    const wall = patch(new THREE.MeshPhysicalMaterial({ color: '#e9b9b0', roughness: 0.5, sheen: 0.7, sheenColor: new THREE.Color('#ffe1d8'), sheenRoughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.45, side: THREE.DoubleSide }), wallU, {
      head: GLSL_NOISE,
      // collapsing alveoli crumple (visual only — the collapse fraction comes from the engine)
      vertex: 'transformed += objectNormal * uCol * 0.11 * sin(position.x * 11.0 + position.y * 7.0) * sin(position.z * 9.0 - position.y * 5.0);',
      discard: HOLE, color: WALL_COLOR,
    }) as THREE.MeshPhysicalMaterial;
    const fluidU = { ...hole, uLevel: { value: -2 } }; const surfU = { ...hole, uSurf: { value: 1 } };
    return { group: new THREE.Group(), hole, wallU, fluidU, surfU, arcs: capillaryArcs(u, tier, u.i + 3), cap: new THREE.BufferGeometry(), wall, cur: { s: 1, col: 0, flood: 0, over: 0, low: 0 }, lastSat: -1 };
  }).map((r) => ({ ...r, cap: capillaryGeometry(r.arcs, tier) })), [tier]);
}

function Alveoli({ tier, units }: { tier: Tier; units: UnitRuntime[] }) {
  const sphere = useMemo(() => sphereFor(tier), [tier]);
  const scId = useUI((s) => s.ventScenario);
  const fluidColor = scId === 'ards' ? '#d8a276' : '#e7a3a2'; // protein-rich exudate vs pink frothy transudate
  const mats = useMemo(() => {
    const surf = new THREE.MeshPhysicalMaterial({ color: '#f3e3a4', roughness: 0.2, transparent: true, opacity: 0.34, iridescence: 0.8, iridescenceIOR: 1.3, side: THREE.DoubleSide, depthWrite: false });
    const fluid = new THREE.MeshPhysicalMaterial({ color: fluidColor, roughness: 0.12, transparent: true, opacity: 0.78, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false });
    const cap = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.42, depthWrite: false });
    return { surf, fluid, cap };
  }, [fluidColor]);
  const perUnit = useMemo(() => units.map((r) => ({
    // surfactant film: breaks into islands as its function falls (ARDS, oedema fluid inactivates it)
    surf: patch(mats.surf.clone(), r.surfU, { head: GLSL_NOISE, discard: HOLE + ' if (vnoise(vLocal * 4.5) * 0.7 + vnoise(vLocal * 11.0) * 0.3 > uSurf + 0.08) discard;' }),
    fluid: patch(mats.fluid.clone(), r.fluidU, { discard: HOLE + ' if (vLocal.y > uLevel) discard;' }),
  })), [units, mats]);
  const meniscus = useMemo(() => new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2), []);
  useEffect(() => () => sphere.dispose(), [sphere]);
  return (<>
    {UNITS.map((u, i) => {
      const r = units[i];
      return (
        <primitive key={`${tier}-${i}`} object={r.group} position={u.c}>
          <mesh geometry={sphere} material={r.wall} scale={R0} />
          <mesh geometry={sphere} material={perUnit[i].surf} scale={R0 * 0.955} renderOrder={2} />
          <mesh name={`fluid${i}`} geometry={sphere} material={perUnit[i].fluid} scale={R0 * 0.93} renderOrder={3} />
          <mesh name={`meniscus${i}`} geometry={meniscus} material={mats.fluid} renderOrder={3} visible={false} />
          <mesh geometry={r.cap} material={mats.cap} scale={R0} />
        </primitive>
      );
    })}
  </>);
}

/* ------------------------------------------------------------------ the scene */
function AlveolusWorld() {
  const tier = useLabUI((s) => s.visualTier) as Tier;
  const units = useUnits(tier);
  const scId = useUI((s) => s.ventScenario);
  const NR = budget(tier, 300); const NM = budget(tier, 180); const NF = budget(tier, 110); const ND = budget(tier, 70);
  const rbcGeo = useMemo(() => rbcGeometry(0.03, tier === 'low' ? 14 : 24), [tier]);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.38, clearcoat: 0.35, sheen: 0.5, sheenColor: new THREE.Color('#ff9a8a') }), []);
  const rbc = useRef<THREE.InstancedMesh>(null); const o2 = useRef<THREE.InstancedMesh>(null); const co2 = useRef<THREE.InstancedMesh>(null); const froth = useRef<THREE.InstancedMesh>(null); const duct = useRef<THREE.InstancedMesh>(null);
  const pools = useMemo(() => ({ o2: new MotePool(NM), co2: new MotePool(NM) }), [NM]);
  const cells = useMemo(() => {
    // distribute red cells over arcs proportional to arc length
    const slots: { u: number; a: number; len: number }[] = []; units.forEach((r, ui) => r.arcs.forEach((a, ai) => slots.push({ u: ui, a: ai, len: a.length })));
    const tot = slots.reduce((x, y) => x + y.len, 0); const out: { u: number; a: number; s: number; v: number }[] = [];
    slots.forEach((sl) => { const k = Math.max(1, Math.round((NR * sl.len) / tot)); for (let j = 0; j < k && out.length < NR; j++) out.push({ u: sl.u, a: sl.a, s: j / k + Math.random() * 0.05, v: 0.9 + Math.random() * 0.25 }); });
    return out;
  }, [units, NR]);
  const frothSeeds = useMemo(() => Array.from({ length: NF }, () => ({ u: 0, x: Math.random() * 2 - 1, z: Math.random() * 2 - 1, r: 0.35 + Math.random() * 0.65, ph: Math.random() * 6.28 })), [NF]);
  const ductSeeds = useMemo(() => Array.from({ length: ND }, () => ({ x: Math.random(), a: Math.random() * 6.28, r: Math.random() })), [ND]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), w: new THREE.Vector3(), n: new THREE.Vector3(), q: new THREE.Quaternion(), c: new THREE.Color(), y: new THREE.Vector3(0, 1, 0), m: new THREE.Matrix4() }), []);
  const colWall = useMemo(() => ({ open: new THREE.Color('#e9b9b0'), col: new THREE.Color('#7a2a2e'), over: new THREE.Color('#efd6cf'), wet: new THREE.Color('#b8736e'), glow: new THREE.Color('#3fd0b8') }), []);
  const art = useRef<THREE.MeshStandardMaterial>(null); const ven = useRef<THREE.MeshStandardMaterial>(null);
  const prevKind = useRef<string[]>(UNITS.map(() => 'open')); const prevSc = useRef('');
  const spawnAcc = useRef(0);

  useFrame((_, dtRaw) => {
    const dt = frameDt(dtRaw);
    const st = readAlveolar(); alvLive.st = st;
    // a new scenario is not a recruitment: resync without the glow
    if (prevSc.current !== session.sc.id) { prevSc.current = session.sc.id; st.units.forEach((u, i) => { prevKind.current[i] = u.kind; alvLive.glow[i] = 0; }); }
    // --- alveoli
    units.forEach((r, i) => {
      const u = st.units[i]; const c = r.cur;
      c.col = approach(c.col, u.collapse, 3, dt); c.flood = approach(c.flood, u.flood, 2, dt); c.over = approach(c.over, u.over, 4, dt); c.low = approach(c.low, u.lowvq, 3, dt);
      const size = st.inflate * (1 - 0.56 * c.col) * (1 - 0.1 * c.low) * (1 + 0.22 * c.over) * (1 - 0.06 * c.flood);
      c.s = approach(c.s, size, 10, dt);
      r.group.scale.set(c.s, c.s * (1 - 0.3 * c.col), c.s); // collapsed alveoli flatten as well as shrink
      r.wallU.uCol.value = c.col;
      // recruitment glow when a unit reopens
      const kind = u.kind; if (prevKind.current[i] === 'collapsed' && kind !== 'collapsed') alvLive.glow[i] = 4; prevKind.current[i] = kind;
      alvLive.glow[i] = Math.max(0, alvLive.glow[i] - dt);
      r.wall.color.copy(colWall.open).lerp(colWall.wet, st.wet * 0.55).lerp(colWall.over, c.over * 0.7).lerp(colWall.col, c.col * 0.85);
      r.wall.emissive.copy(colWall.glow); r.wall.emissiveIntensity = Math.min(1, alvLive.glow[i] / 2) * 0.28;
      r.wall.sheen = 0.6 * (1 - c.col);
      r.surfU.uSurf.value = st.surfactant * (1 - c.col * 0.7);
      saturationColor(st.svo2, r.wallU.uBloodV.value); saturationColor(u.endSat, r.wallU.uBloodA.value); r.wallU.uWet.value = st.wet;
      r.fluidU.uLevel.value = c.flood > 0.01 ? -1 + 2.05 * Math.min(0.96, c.flood) : -2;
      const men = r.group.getObjectByName(`meniscus${i}`) as THREE.Mesh | undefined;
      if (men) { const lv = r.fluidU.uLevel.value * R0 * 0.93; const rr = Math.sqrt(Math.max(0, (R0 * 0.93) ** 2 - lv * lv)); men.visible = c.flood > 0.02 && c.flood < 0.95; men.position.set(0, lv, 0); men.scale.setScalar(rr * 0.98); }
      // capillary blood colour: venous in, end-capillary out (equilibrates in the first third of the capillary normally)
      if (Math.abs(u.endSat - r.lastSat) > 0.004 || Math.abs(st.svo2 - (r.cap.userData.sv ?? -1)) > 0.004) {
        const S = r.cap.attributes.aS as THREE.BufferAttribute; const C = r.cap.attributes.color as THREE.BufferAttribute; const eq = u.lowvq > 0.5 ? 0.9 : 0.35;
        for (let k = 0; k < S.count; k++) { saturationColor(st.svo2 + (u.endSat - st.svo2) * THREE.MathUtils.smoothstep(S.getX(k), 0, eq), tmp.c); C.setXYZ(k, tmp.c.r, tmp.c.g, tmp.c.b); }
        C.needsUpdate = true; r.lastSat = u.endSat; r.cap.userData.sv = st.svo2;
      }
    });
    // --- red cells (transit slowed ×3 so it can be followed; real transit ≈ 0.75 s)
    const rm = rbc.current; if (rm) {
      cells.forEach((cell, k) => {
        const r = units[cell.u]; const a = r.arcs[cell.a]; const u = st.units[cell.u];
        cell.s += (dt / 2.3) * cell.v; if (cell.s >= 1) cell.s -= 1;
        const f = cell.s * (a.length - 1); const i0 = Math.floor(f); const i1 = Math.min(a.length - 1, i0 + 1);
        tmp.v.copy(a[i0]).lerp(a[i1], f - i0); tmp.n.copy(tmp.v).normalize();
        tmp.w.copy(tmp.v).multiplyScalar(R0).applyMatrix4(r.group.matrixWorld);
        tmp.o.position.copy(tmp.w); tmp.o.quaternion.setFromUnitVectors(tmp.y, tmp.n); tmp.o.scale.setScalar(1); tmp.o.updateMatrix(); rm.setMatrixAt(k, tmp.o.matrix);
        const eq = u.lowvq > 0.5 ? 0.9 : 0.35;
        rm.setColorAt(k, saturationColor(st.svo2 + (u.endSat - st.svo2) * THREE.MathUtils.smoothstep(cell.s, 0, eq), tmp.c));
      });
      rm.instanceMatrix.needsUpdate = true; if (rm.instanceColor) rm.instanceColor.needsUpdate = true;
    }
    // --- diffusion: O₂ alveolus → capillary, CO₂ capillary → alveolus. Rate follows the model's gradients (Fick): PAO₂ − PvO₂ and, for CO₂, the fixed venous–alveolar gap.
    const o2Drive = THREE.MathUtils.clamp((st.pAO2 - st.pvo2) / 60, 0.25, 2.2) / (1 + st.wet * 1.5);
    const co2Drive = 0.8 / (1 + st.wet * 0.6);
    spawnAcc.current += dt * NM * 0.5;
    while (spawnAcc.current > 1) {
      spawnAcc.current -= 1;
      const i = Math.floor(Math.random() * units.length); const u = st.units[i]; const r = units[i];
      const vent = (1 - units[i].cur.col) * (1 - units[i].cur.flood) * (1 - 0.7 * units[i].cur.low);
      const arc = r.arcs[Math.floor(Math.random() * r.arcs.length)]; if (!arc) continue;
      const cap = tmp.w.copy(arc[Math.floor(Math.random() * arc.length)]).multiplyScalar(R0).applyMatrix4(r.group.matrixWorld).clone();
      const inside = tmp.v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(R0 * 0.55 * Math.random()).applyMatrix4(r.group.matrixWorld).clone();
      if (Math.random() < vent * o2Drive * 0.5) pools.o2.spawn(inside, cap, 0.9 + Math.random() * 0.6, 0.08);
      if (Math.random() < vent * co2Drive * 0.5 && u.collapse < 0.5) pools.co2.spawn(cap, inside, 0.9 + Math.random() * 0.6, 0.08);
    }
    if (o2.current) pools.o2.update(dt, o2.current, 0.022, tmp.o);
    if (co2.current) pools.co2.update(dt, co2.current, 0.022, tmp.o);
    // --- froth at the fluid surface of flooded units (oedema)
    const fm = froth.current; if (fm) {
      const flooded = units.map((r, i) => ({ r, i })).filter(({ r }) => r.cur.flood > 0.05 && r.cur.flood < 0.96);
      frothSeeds.forEach((b, k) => {
        const f = flooded.length ? flooded[k % flooded.length] : null;
        if (!f) { tmp.o.scale.setScalar(0.00001); } else {
          const L = f.r.fluidU.uLevel.value * 0.93; const rr = Math.sqrt(Math.max(0, 0.93 * 0.93 - L * L)) * 0.9; b.ph += dt * 2;
          const inDisc = b.x * b.x + b.z * b.z <= 1 ? 1 : 0.5;
          tmp.v.set(b.x * rr * inDisc, L + 0.02 + Math.abs(Math.sin(b.ph)) * 0.02, b.z * rr * inDisc);
          tmp.o.position.copy(tmp.v.multiplyScalar(R0)).applyMatrix4(f.r.group.matrixWorld); tmp.o.scale.setScalar(0.028 * b.r * (scId === 'edema' ? 1 : 0.6) * f.r.cur.s);
        }
        tmp.o.quaternion.identity(); tmp.o.updateMatrix(); fm.setMatrixAt(k, tmp.o.matrix);
      });
      fm.instanceMatrix.needsUpdate = true;
    }
    // --- gas moving in the duct with ventilator flow
    const dm = duct.current; if (dm) {
      const q = session.m.lastQ; ductSeeds.forEach((p, k) => {
        p.x = (p.x + q * 0.45 * dt + 1) % 1; const rr = DUCT_R * 0.75 * p.r;
        tmp.o.position.set(-2.8 + p.x * 5.6, Math.sin(p.a) * rr, Math.cos(p.a) * rr); tmp.o.scale.setScalar(0.02 * Math.min(1, Math.abs(q) * 3 + 0.15)); tmp.o.updateMatrix(); dm.setMatrixAt(k, tmp.o.matrix);
      });
      dm.instanceMatrix.needsUpdate = true; (dm.material as THREE.MeshBasicMaterial).color.set(q >= 0 ? '#cfe6ff' : '#f5c79b');
    }
    if (art.current) art.current.color.copy(saturationColor(st.svo2, tmp.c));
    if (ven.current) { const mix = st.units.reduce((a, u) => a + u.endSat, 0) / st.units.length; ven.current.color.copy(saturationColor(mix, tmp.c)); }
    // anchors for the semantic camera targets
    publishAnchors(units, st);
  });

  const ductGeo = useMemo(() => { const g = new THREE.CylinderGeometry(DUCT_R, DUCT_R, 5.8, 28, 1, true); g.rotateZ(Math.PI / 2); return g; }, []);
  const vessel = (pts: [number, number, number][], r: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 64, r, 12, false);
  const artGeo = useMemo(() => vessel([[-3.4, -1.75, -1.0], [-1.5, -1.55, -1.05], [0.5, -1.45, -1.1], [2.6, -1.25, -1.05]], 0.1), []);
  const venGeo = useMemo(() => vessel([[-2.6, 1.3, -1.05], [-0.4, 1.45, -1.1], [1.6, 1.6, -1.05], [3.4, 1.8, -1.0]], 0.12), []);
  const moteGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);

  return (<>
    <Alveoli tier={tier} units={units} />
    <mesh geometry={ductGeo}><meshPhysicalMaterial color="#efcfc8" roughness={0.45} transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    <mesh geometry={artGeo}><meshStandardMaterial ref={art} roughness={0.35} /></mesh>
    <mesh geometry={venGeo}><meshStandardMaterial ref={ven} roughness={0.35} /></mesh>
    <instancedMesh key={`r${NR}`} ref={rbc} args={[rbcGeo, rbcMat, cells.length]} frustumCulled={false} />
    <instancedMesh key={`o${NM}`} ref={o2} args={[moteGeo, undefined, NM]} frustumCulled={false}><meshBasicMaterial color="#8fd0ff" transparent opacity={0.95} depthWrite={false} toneMapped={false} /></instancedMesh>
    <instancedMesh key={`c${NM}`} ref={co2} args={[moteGeo, undefined, NM]} frustumCulled={false}><meshBasicMaterial color="#f2b35a" transparent opacity={0.95} depthWrite={false} toneMapped={false} /></instancedMesh>
    <instancedMesh key={`f${NF}`} ref={froth} args={[moteGeo, undefined, NF]} frustumCulled={false}><meshPhysicalMaterial color="#fbeaea" roughness={0.05} transparent opacity={0.7} clearcoat={1} /></instancedMesh>
    <instancedMesh key={`d${ND}`} ref={duct} args={[moteGeo, undefined, ND]} frustumCulled={false}><meshBasicMaterial color="#cfe6ff" transparent opacity={0.8} depthWrite={false} /></instancedMesh>
    <Barrier tier={tier} />
    <Callouts />
  </>);
}

/* ------------------------------------------------------------------ alveolar–capillary barrier cross-section */
// base thicknesses are schematic (the real barrier is ~0.2–0.6 µm); interstitium and lining fluid thicken with oedema / ARDS
const LAYERS = [
  { k: 'surf', label: 'Surfactant', w: 0.035, c: '#f3e3a4', o: 0.9 },
  { k: 'lining', label: 'Lining fluid', w: 0.06, c: '#a9cbe0', o: 0.45 },
  { k: 'epi', label: 'Type I cell', w: 0.09, c: '#dfa39a', o: 1 },
  { k: 'bm', label: 'Basement membrane', w: 0.035, c: '#b9b1c9', o: 1 },
  { k: 'int', label: 'Interstitium', w: 0.07, c: '#ead8c2', o: 0.7 },
  { k: 'endo', label: 'Endothelium', w: 0.08, c: '#d4928f', o: 1 },
  { k: 'plasma', label: 'Plasma', w: 0.26, c: '#e8c9a0', o: 0.38 },
] as const;
const BH = 1.7, BD = 1.1, GAS_W = 0.9;
export function barrierWidths(st: Pick<AlveolarState, 'wet' | 'floodFrac' | 'surfactant'>) {
  return LAYERS.map((l) => l.k === 'int' ? l.w + st.wet * 0.42 : l.k === 'lining' ? l.w + st.floodFrac * 0.5 : l.k === 'surf' ? l.w * (0.3 + 0.7 * st.surfactant) : l.w);
}
function Barrier({ tier }: { tier: Tier }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]); const redCell = useRef<THREE.Mesh>(null);
  const NB = budget(tier, 90); const o2 = useRef<THREE.InstancedMesh>(null); const co2 = useRef<THREE.InstancedMesh>(null); const drops = useRef<THREE.InstancedMesh>(null);
  const pools = useMemo(() => ({ o2: new MotePool(NB), co2: new MotePool(NB) }), [NB]);
  const ND = budget(tier, 60); const dropSeeds = useMemo(() => Array.from({ length: ND }, () => [Math.random(), Math.random(), Math.random(), 0.4 + Math.random() * 0.6]), [ND]);
  const geo = useMemo(() => new THREE.BoxGeometry(1, BH, BD), []); const moteGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const rbcGeo = useMemo(() => rbcGeometry(0.62, 40), []);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), a: new THREE.Vector3(), b: new THREE.Vector3() }), []);
  const acc = useRef(0);
  useFrame((_, dtRaw) => {
    const st = alvLive.st; if (!st) return; const dt = Math.min(0.05, dtRaw);
    const ws = barrierWidths(st); let x = -0.2; const edges: number[] = [x];
    ws.forEach((w, i) => { const m = refs.current[i]; if (m) { m.scale.x = w; m.position.x = x + w / 2; } x += w; edges.push(x); });
    const rbcX = x + 0.18; if (redCell.current) { redCell.current.position.x = rbcX; const open = st.units.filter((u) => u.kind === 'open'); const sat = open.length ? open.reduce((a, u) => a + u.endSat, 0) / open.length : st.svo2; (redCell.current.material as THREE.MeshPhysicalMaterial).color.copy(saturationColor(sat, tmp.c)); }
    const total = x + 0.2; const base = barrierWidths({ wet: 0, floodFrac: 0, surfactant: 1 }).reduce((a, b) => a + b, 0);
    const slow = total / base; // Fick: longer path → slower, fewer crossings
    acc.current += dt * NB * 0.6;
    while (acc.current > 1) {
      acc.current -= 1; const y = (Math.random() - 0.5) * BH * 0.8, z = (Math.random() - 0.5) * BD * 0.8;
      const gas = tmp.a.set(-0.2 - GAS_W * (0.2 + 0.8 * Math.random()), y, z).add(MEMBRANE_AT).clone(); const cell = tmp.b.set(rbcX - 0.02, y * 0.6, z * 0.6).add(MEMBRANE_AT).clone();
      const gradO2 = THREE.MathUtils.clamp((st.pAO2 - st.pvo2) / 60, 0.25, 2.2);
      if (Math.random() < 0.5 * gradO2 / slow) pools.o2.spawn(gas, cell, 1.4 * slow, 0.2);
      if (Math.random() < 0.45 / Math.sqrt(slow)) pools.co2.spawn(cell, gas, 1.4 * Math.sqrt(slow), 0.2);
    }
    if (o2.current) pools.o2.update(dt, o2.current, 0.018, tmp.o);
    if (co2.current) pools.co2.update(dt, co2.current, 0.018, tmp.o);
    const dm = drops.current; if (dm) {
      const iw = ws[4]; const ix = edges[4];
      dropSeeds.forEach((d, k) => { const on = st.wet > 0.05; tmp.o.position.set(ix + iw * (0.15 + 0.7 * d[0]), (d[1] - 0.5) * BH * 0.9, (d[2] - 0.5) * BD * 0.9); tmp.o.scale.setScalar(on ? 0.035 * d[3] * Math.min(1, st.wet * 2) : 0.00001); tmp.o.updateMatrix(); dm.setMatrixAt(k, tmp.o.matrix); });
      dm.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group position={MEMBRANE_AT}>
      {LAYERS.map((l, i) => <mesh key={l.k} ref={(m) => { refs.current[i] = m; }} geometry={geo}><meshPhysicalMaterial color={l.c} roughness={0.5} transparent={l.o < 1} opacity={l.o} depthWrite={l.o >= 1} sheen={0.3} /></mesh>)}
      <mesh ref={redCell} geometry={rbcGeo} rotation={[0, 0, Math.PI / 2]}><meshPhysicalMaterial roughness={0.35} clearcoat={0.4} /></mesh>
      <instancedMesh key={`bo${NB}`} ref={o2} args={[moteGeo, undefined, NB]} frustumCulled={false} position={MEMBRANE_AT.clone().negate()}><meshBasicMaterial color="#8fd0ff" toneMapped={false} /></instancedMesh>
      <instancedMesh key={`bc${NB}`} ref={co2} args={[moteGeo, undefined, NB]} frustumCulled={false} position={MEMBRANE_AT.clone().negate()}><meshBasicMaterial color="#f2b35a" toneMapped={false} /></instancedMesh>
      <instancedMesh key={`bd${ND}`} ref={drops} args={[moteGeo, undefined, ND]} frustumCulled={false}><meshPhysicalMaterial color="#bfe0f2" transparent opacity={0.8} roughness={0.05} clearcoat={1} /></instancedMesh>
      <BarrierLabels />
    </group>
  );
}
function BarrierLabels() {
  const show = useUI((s) => s.labels); const target = useUI((s) => s.ventTarget); useUI((s) => s.pulse);
  const st = alvLive.st; if (!show || target !== 'lung.membrane' || !st || IS_PHONE) return null;
  const ws = barrierWidths(st); let x = -0.2;
  const tags = LAYERS.map((l, i) => { const c = x + ws[i] / 2; x += ws[i]; return { l: l.label, x: c, i }; });
  return (<>
    <Html position={[-0.2 - GAS_W * 0.55, 0.75, 0]} center zIndexRange={[20, 0]}><LabelChip className="tag3d t-teal" text="Alveolar gas" /></Html>
    {tags.map((t) => <Html key={t.l} position={[t.x, 0.62 - t.i * 0.19, BD / 2 + 0.02]} center zIndexRange={[20, 0]}><LabelChip className="tag3d tk" text={t.l} /></Html>)}
    <Html position={[x + 0.2, -0.75, 0.3]} center zIndexRange={[20, 0]}><LabelChip className="tag3d t-red" text="Red cell" /></Html>
  </>);
}

/* ------------------------------------------------------------------ labels on the cluster */
function Callouts() {
  const show = useUI((s) => s.labels); const target = useUI((s) => s.ventTarget); useUI((s) => s.pulse);
  const st = alvLive.st; if (!show || !st || target === 'lung.membrane') return null;
  const pick = (k: string) => { const i = UNITS.findIndex((u, j) => u.front && st.units[j].kind === k); return i < 0 ? null : i; };
  const tags: { p: THREE.Vector3; t: string; c?: string }[] = [];
  const open = UNITS.filter((u) => u.front && st.units[u.i].kind === 'open').sort((a, b) => a.rank + Math.abs(a.c.x) * 0.3 - b.rank - Math.abs(b.c.x) * 0.3)[0];
  if (open) tags.push({ p: open.c.clone().add(new THREE.Vector3(0, R0 * 0.95, 0.2)), t: 'Aerated alveolus' });
  const col = pick('collapsed'); if (col != null) tags.push({ p: UNITS[col].c.clone().add(new THREE.Vector3(0, -R0 * 0.55, 0.45)), t: 'Collapsed', c: 't-red' });
  const fl = pick('flooded'); if (fl != null) tags.push({ p: UNITS[fl].c.clone().add(new THREE.Vector3(0, -R0 * 0.3, 0.6)), t: 'Flooded', c: 't-teal' });
  const lv = pick('lowvq'); if (lv != null) tags.push({ p: UNITS[lv].c.clone().add(new THREE.Vector3(0.1, R0 * 0.7, 0.4)), t: 'Low V/Q' });
  const rec = alvLive.glow.findIndex((g) => g > 0.2); if (rec >= 0) tags.push({ p: UNITS[rec].c.clone().add(new THREE.Vector3(0, R0 * 0.8, 0.4)), t: 'Recruited', c: 't-teal' });
  if (!IS_PHONE) tags.push({ p: new THREE.Vector3(-2.85, 0.0, 0.3), t: 'Alveolar duct' });
  if (!IS_PHONE) { tags.push({ p: new THREE.Vector3(-2.3, -1.95, -0.9), t: 'Arteriole (from RV)', c: 't-ven' }); tags.push({ p: new THREE.Vector3(3.05, 1.55, -0.9), t: 'Venule (to LA)', c: 't-art' }); }
  return (<>{tags.map((g) => <Html key={g.t} position={g.p as never} center zIndexRange={[20, 0]}><LabelChip className={`tag3d${g.c ? ' ' + g.c : ''}`} text={g.t} /></Html>)}</>);
}

/* ------------------------------------------------------------------ semantic camera targets */
function publishAnchors(units: UnitRuntime[], st: AlveolarState) {
  const A = alvLive.anchors; const front = UNITS.filter((u) => u.front);
  const by = (score: (i: number) => number) => { let best = front[0].i, bs = -Infinity; front.forEach((u) => { const s = score(u.i); if (s > bs) { bs = s; best = u.i; } }); return best; };
  const set = (k: string, i: number) => { (A[k] ??= new THREE.Vector3()).copy(UNITS[i].c); };
  A.alveolus = new THREE.Vector3(0, 0, 0); A.membrane = MEMBRANE_AT.clone();
  set('capillary', by((i) => -UNITS[i].rank - st.units[i].collapse * 2));
  set('rbc', by((i) => -UNITS[i].rank - st.units[i].collapse * 2));
  set('edema', by((i) => st.units[i].flood * 2 + UNITS[i].rank * 0.1));
  set('collapsed', by((i) => st.units[i].collapse * 2 + UNITS[i].rank * 0.1));
  set('recruited', by((i) => alvLive.glow[i] * 3 + (st.units[i].collapse < 0.5 && st.units[i].flood < 0.5 ? UNITS[i].rank : -1)));
  void units;
}
registerAnchors('vent', () => alvLive.anchors);

const CAM: Record<string, (a: Record<string, THREE.Vector3>) => [THREE.Vector3, THREE.Vector3]> = {
  'lung.alveolus': () => [new THREE.Vector3(0.3, 0.6, IS_PHONE ? 12.2 : 9.2), new THREE.Vector3(0.1, 0, 0)],
  'lung.capillary': (a) => [a.capillary.clone().add(new THREE.Vector3(0.35, 0.55, 2.3)), a.capillary.clone()],
  'lung.rbc': (a) => [a.rbc.clone().add(new THREE.Vector3(0.2, 0.5, 1.25)), a.rbc.clone().add(new THREE.Vector3(0, 0.15, -0.2))],
  'lung.membrane': () => [MEMBRANE_AT.clone().add(new THREE.Vector3(1.1, 0.9, IS_PHONE ? 7.5 : 5.4)), MEMBRANE_AT.clone().add(new THREE.Vector3(0.2, -0.05, 0))],
  'lung.edema': (a) => [a.edema.clone().add(new THREE.Vector3(0.45, 0.8, IS_PHONE ? 4.2 : 3.2)), a.edema.clone()],
  'lung.collapsed': (a) => [a.collapsed.clone().add(new THREE.Vector3(0.45, 0.8, IS_PHONE ? 4.2 : 3.2)), a.collapsed.clone()],
  'lung.recruited': (a) => [a.recruited.clone().add(new THREE.Vector3(0.45, 0.8, IS_PHONE ? 4.2 : 3.2)), a.recruited.clone()],
};
function Rig() {
  const cc = useRef<CameraControls>(null); const target = useUI((s) => s.ventTarget); const first = useRef(true);
  useEffect(() => {
    let raf = 0; const go = () => {
      const f = CAM[target] ?? CAM['lung.alveolus']; const a = alvLive.anchors;
      if (target !== 'lung.alveolus' && target !== 'lung.membrane' && !a.capillary) { raf = requestAnimationFrame(go); return; }
      const [p, l] = f(a); cc.current?.setLookAt(p.x, p.y, p.z, l.x, l.y, l.z, !first.current); first.current = false;
    };
    go(); return () => cancelAnimationFrame(raf);
  }, [target]);
  return <CameraControls ref={cc} makeDefault minDistance={0.6} maxDistance={18} smoothTime={0.55} />;
}

export function AlveolusScene() {
  return (
    <StudioCanvas camera={{ position: [0.3, 0.6, IS_PHONE ? 12.2 : 9.2], fov: 30 }} fog={false}>
      <AlveolusWorld />
      <Rig />
    </StudioCanvas>
  );
}

/* ------------------------------------------------------------------ HUD (DOM, outside the canvas) */
const FOCUS: [string, string][] = [['lung.whole', 'Whole lung'], ['lung.alveolus', 'Alveoli'], ['lung.capillary', 'Capillary'], ['lung.rbc', 'Red cell'], ['lung.membrane', 'Membrane'], ['lung.edema', 'Oedema'], ['lung.collapsed', 'Collapsed'], ['lung.recruited', 'Recruited']];
export function AlveolusHud() {
  useUI((s) => s.pulse); const target = useUI((s) => s.ventTarget);
  const tier = useLabUI((s) => s.visualTier); const setLab = useLabUI.getState().set;
  const st = alvLive.st ?? readAlveolar(); const m = session.m;
  const openPct = Math.round(100 * (1 - st.collapsedFrac) * (1 - st.floodFrac));
  const pplat = m.estPlateau();
  const row = (k: string, v: string) => <div className="alv-row"><span>{k}</span><b>{v}</b></div>;
  return (<>
    <div className="alv-hud">
      {row('PEEP', `${st.peep.toFixed(0)} cmH₂O`)}
      {row('Plateau', `${pplat.toFixed(0)} cmH₂O`)}
      {row('Aerated units', `${openPct}%`)}
      {row('Shunt', `${Math.round(st.shunt * 100)}%`)}
      {row('Low V/Q', `${Math.round(st.lowvqFrac * 100)}%`)}
      {row('PaO₂', `${session.snap.pao2.toFixed(0)} mmHg`)}
      {row('SvO₂ → ScO₂', `${Math.round(st.svo2 * 100)} → ${Math.round(st.ccNormal * 100)}%`)}
      {target === 'lung.membrane' && row('Diffusion path', `×${(barrierWidths(st).reduce((a, b) => a + b, 0) / barrierWidths({ wet: 0, floodFrac: 0, surfactant: 1 }).reduce((a, b) => a + b, 0)).toFixed(1)} normal`)}
    </div>
    <div className="alv-focus">
      <div className="seg small ch-focus" role="group" aria-label="Focus">{FOCUS.map(([id, l]) => <button key={id} className={target === id ? 'on' : ''} onClick={() => focusVentTarget(id)}>{l}</button>)}</div>
      <div className="seg small ch-quality" role="group" aria-label="Visual quality">{(['high', 'medium', 'low'] as const).map((k) => <button key={k} className={tier === k ? 'on' : ''} onClick={() => setLab({ visualTier: k })}>{k[0].toUpperCase() + k.slice(1)}</button>)}</div>
    </div>
    <div className="legend alv-legend">
      <span><i className="lg-air" />Aerated</span><span><i className="lg-col" />Collapsed</span><span><i style={{ background: '#e7a3a2' }} />Flooded</span><span><i style={{ background: '#8fd0ff' }} />O₂</span><span><i style={{ background: '#f2b35a' }} />CO₂</span><span><i style={{ background: SAT_PALETTE.teachVenous }} />Deoxygenated</span><span><i style={{ background: SAT_PALETTE.teachArterial }} />Oxygenated</span>
    </div>
    <span className="alv-note">Schematic scale · red-cell transit slowed ×3</span>
  </>);
}

/** Semantic focus used by buttons, lessons and the Lesson Director: 'lung.whole' returns to the lungs. */
export function focusVentTarget(id: string) {
  const set = useUI.getState().set;
  if (id === 'lung.whole') set({ ventView: 'front', ventTarget: 'lung.whole' });
  else set({ ventView: 'alveolus', ventTarget: id });
}
