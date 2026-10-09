/**
 * Congenital heart scene on the real heart: the HuBMAP / Visible Human Male heart (models/lines.glb, CC BY 4.0) —
 * hollow chambers, interventricular septum, the four valves, great vessels, coronary vessels — cut open along the
 * plane that best shows the focus (right ventricle opened to face the septum, right atrium opened to face the
 * fossa ovalis, four-chamber slice, or closed for the duct and the arch).
 *
 * Defects are carved into the actual walls: a VSD is a tunnel through the septal slab and the adjacent ventricular
 * walls (perimembranous under the aortic valve, or mid-muscular), an ASD a hole through both atrial walls at the
 * fossa ovalis, a PFO a slit with a flap that opens only right-to-left, a PDA a vessel from the aortic isthmus to
 * the left pulmonary artery. Tetralogy moves the aortic root over the septal crest, narrows the RV outflow and
 * thickens the RV wall; coarctation narrows the isthmus. Sizes, chamber dilation, wall thickness, blood colour and
 * every particle stream come from `solveShunt` (shunt.ts).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import { StudioCanvas, IS_PHONE } from '../scene/Studio';
import { LabelChip } from '../scene/labels';
import { saturationColor, budget, approach, frameDt, tubeAlong, type Tier } from '../scene/effects';
import { registerAnchors } from '../scene/cameraTargets';
import { useLabUI } from '../labs/labStore';
import { loadLinesAsset, type LinesAsset } from '../asset/lines';
import { loadHeartInternals, loadPericardium, CONDUCTION, VALVE_APPARATUS, type Layer, type HeartInternalsMapping, type PericardiumMapping } from '../asset/anatomy';
import { conductionMaterial, branchOf } from '../scene/conduction';
import { useHeartUI, type CutMode } from './heartStore';
import { solveShunt, type ShuntState } from './shunt';
import { CENTRE, SCALE, toScene, LM, SEPTUM_N, ATRIAL_N, holesFor, holeRadius, lesionShape, pinch, shift, thicken, OVERRIDE, overrideWeight, flowPaths, type Hole, type FlowPathId, type Way, type LesionShape } from './heartGeometry';

const HR = 84; const PERIOD = 60 / HR;
/** ventricular systole (0–1) and atrial systole for a time in seconds */
export function cyclePhase(t: number) { const ph = (t % PERIOD) / PERIOD; const sys = ph < 0.36 ? Math.sin((ph / 0.36) * Math.PI) : 0; const atr = ph > 0.82 ? Math.sin(((ph - 0.82) / 0.18) * Math.PI) : 0; return { ph, sys, atr }; }

type PartId = 'ra' | 'la' | 'rv' | 'lv' | 'septum' | 'tricuspid' | 'mitral' | 'aortic_valve' | 'pulm_valve' | 'aorta' | 'arch_branches' | 'pulm_art' | 'svc' | 'ivc' | 'pulm_veins' | 'coronary_art' | 'cardiac_veins';
const PARTS: PartId[] = ['ra', 'la', 'rv', 'lv', 'septum', 'tricuspid', 'mitral', 'aortic_valve', 'pulm_valve', 'aorta', 'arch_branches', 'pulm_art', 'svc', 'ivc', 'pulm_veins', 'coronary_art', 'cardiac_veins'];
const VESSEL = new Set<PartId>(['aorta', 'arch_branches', 'pulm_art', 'svc', 'ivc', 'pulm_veins']);
const CHAMBER: Partial<Record<PartId, THREE.Vector3>> = { ra: LM.ra, la: LM.la, rv: LM.rv, lv: LM.lv, septum: LM.septum };
const BASE_COLOR: Record<PartId, string> = {
  ra: '#a8473c', la: '#a34238', rv: '#8e2c24', lv: '#88271f', septum: '#8a2a22', tricuspid: '#eadbc8', mitral: '#eadbc8', aortic_valve: '#efe2cf', pulm_valve: '#efe2cf',
  aorta: '#c8322b', arch_branches: '#c8322b', pulm_art: '#5a4a9a', svc: '#4b3f86', ivc: '#4b3f86', pulm_veins: '#c8322b', coronary_art: '#d43a2c', cardiac_veins: '#3c3474',
};

/* ------------------------------------------------------------------ material with holes, beat, endocardial tint and cut faces */
interface HeartUniforms { [k: string]: THREE.IUniform; uC: { value: THREE.Vector3 }; uK: { value: number }; uHn: { value: number }; uHc: { value: THREE.Vector4[] }; uHa: { value: THREE.Vector4[] }; uHu: { value: THREE.Vector4[] }; uBlood: { value: THREE.Color }; uBloodMix: { value: number }; uCut: { value: THREE.Color } }
function heartMaterial(id: PartId, planes: THREE.Plane[]) {
  const vessel = /aorta|arch|pulm_art|svc|ivc|pulm_veins/.test(id); const valve = /valve|tricuspid|mitral/.test(id);
  const m = new THREE.MeshPhysicalMaterial({ color: BASE_COLOR[id], roughness: valve ? 0.6 : vessel ? 0.38 : 0.5, clearcoat: valve ? 0 : 0.45, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color('#ffb3a6'), side: THREE.DoubleSide, clippingPlanes: planes });
  const U: HeartUniforms = {
    uC: { value: (CHAMBER[id] ?? CENTRE).clone() }, uK: { value: 1 }, uHn: { value: 0 },
    uHc: { value: [0, 1, 2].map(() => new THREE.Vector4()) }, uHa: { value: [0, 1, 2].map(() => new THREE.Vector4()) }, uHu: { value: [0, 1, 2].map(() => new THREE.Vector4()) },
    uBlood: { value: new THREE.Color('#7a2030') }, uBloodMix: { value: 0 }, uCut: { value: new THREE.Color('#6f1c16') },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform vec3 uC; uniform float uK; varying vec3 vB; varying vec3 vNB;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvB = position; vNB = normal; transformed = uC + (position - uC) * uK;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform vec3 uC; uniform int uHn; uniform vec4 uHc[3]; uniform vec4 uHa[3]; uniform vec4 uHu[3]; uniform vec3 uBlood; uniform float uBloodMix; uniform vec3 uCut; varying vec3 vB; varying vec3 vNB;`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
for (int i = 0; i < 3; i++) { if (i >= uHn) break; vec3 d = vB - uHc[i].xyz; float al = dot(d, uHa[i].xyz);
  if (abs(al) < uHa[i].w) { vec3 e = d - uHa[i].xyz * al; float rad = length(e);
    if (uHu[i].w > 1.0) { float ru = dot(e, uHu[i].xyz); rad = length(vec2(ru / uHu[i].w, length(e - uHu[i].xyz * ru))); }
    if (rad < uHc[i].w) discard; } }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
float inner = step(dot(vNB, vB - uC), 0.0);
diffuseColor.rgb = mix(diffuseColor.rgb, uBlood, inner * uBloodMix);
if (!gl_FrontFacing) diffuseColor.rgb = uCut;`);
  };
  m.customProgramCacheKey = () => 'heart-cutaway-v1';
  return { m, U };
}

/* ------------------------------------------------------------------ cut planes */
const CUT_LABEL: Record<Exclude<CutMode, 'auto'>, string> = { rv: 'Right ventricle opened', ra: 'Right atrium opened', lv: 'Left ventricle opened', slice: 'Four-chamber slice', front: 'Front wall removed', closed: 'Closed' };
/** which cut shows each focus best */
export function autoCut(target: string): Exclude<CutMode, 'auto'> {
  if (/vsd|septum|\.rv$|four/.test(target)) return /four/.test(target) ? 'slice' : 'rv';
  if (/asd|pfo/.test(target)) return 'ra';
  if (/\.lv$/.test(target)) return 'lv';
  if (/outflow|rvot/.test(target)) return 'front';
  return 'closed';
}
/** a world-space plane: fragments with n·p + c < 0 are removed */
function cutPlane(mode: Exclude<CutMode, 'auto'>): THREE.Plane | null {
  const plane = (n: THREE.Vector3, keepPoint: THREE.Vector3) => { const p = toScene(keepPoint); return new THREE.Plane(n.clone().normalize(), -n.clone().normalize().dot(p)); };
  switch (mode) {
    case 'rv': return plane(SEPTUM_N.clone().negate(), LM.vsdPerimembranous.clone().addScaledVector(SEPTUM_N, 0.16));
    case 'ra': return plane(ATRIAL_N.clone(), LM.fossa.clone().addScaledVector(ATRIAL_N, -0.13));
    case 'lv': return plane(SEPTUM_N.clone(), LM.septum.clone().addScaledVector(SEPTUM_N, -0.17));
    case 'slice': { const n4 = new THREE.Vector3(-0.069, -0.889, -0.453); return plane(n4, new THREE.Vector3(0.112, 4.669, 0.312)); }
    case 'front': return plane(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0.47));
    default: return null;
  }
}

/* ------------------------------------------------------------------ particle paths */
type Path = { pts: THREE.Vector3[]; r: number[]; cum: number[]; len: number };
const mk = (ws: Way[]): Path => { const pts = ws.map((x) => x.p), r = ws.map((x) => x.r); const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); return { pts, r, cum, len: cum[cum.length - 1] }; };
function at(pth: Path, u: number, out: THREE.Vector3, dir: THREE.Vector3) {
  const d = u * pth.len; let i = 1; while (i < pth.cum.length - 1 && pth.cum[i] < d) i++;
  const a = pth.pts[i - 1], b = pth.pts[i]; const f = (d - pth.cum[i - 1]) / Math.max(1e-6, pth.cum[i] - pth.cum[i - 1]);
  out.copy(a).lerp(b, f); dir.copy(b).sub(a).normalize(); return pth.r[i - 1] + (pth.r[i] - pth.r[i - 1]) * f;
}
function streams(s: ShuntState) {
  const L = s.input.lesion; const out: { id: FlowPathId; flow: number; jet: boolean; sat: number }[] = [];
  const pulm = L === 'tof' ? s.qp : s.qs; // in tetralogy only Qp leaves through the narrowed outflow
  out.push({ id: 'svc', flow: pulm * 0.4, jet: false, sat: s.sat.sv }, { id: 'ivc', flow: pulm * 0.6, jet: false, sat: s.sat.sv });
  const pv = L === 'tof' ? s.qp : s.qp; out.push({ id: 'pvR', flow: pv * 0.5, jet: false, sat: 0.98 }, { id: 'pvL', flow: pv * 0.5, jet: false, sat: 0.98 });
  if (L === 'vsd') { out.push({ id: 'vsdLR', flow: s.lr, jet: true, sat: s.sat.lv }, { id: 'vsdRL', flow: s.rl, jet: true, sat: s.sat.rv }); }
  if (L === 'tof') out.push({ id: 'tofRvAo', flow: Math.max(0, s.qs - s.qp), jet: false, sat: s.sat.sv });
  if (L === 'asd') { out.push({ id: 'asdLR', flow: s.lr, jet: false, sat: s.sat.la }, { id: 'asdRL', flow: s.rl, jet: false, sat: s.sat.sv }); }
  if (L === 'pfo') out.push({ id: 'pfoRL', flow: s.rl, jet: false, sat: s.sat.sv });
  if (L === 'pda') { out.push({ id: 'pdaLR', flow: s.lr, jet: true, sat: 0.98 }, { id: 'pdaRL', flow: s.rl, jet: true, sat: s.sat.pa }); }
  if (L === 'coarct' && s.coarct) out.push({ id: 'pdaRL', flow: Math.max(0, s.coarct.ductFlow), jet: false, sat: s.sat.pa });
  return out;
}

/* ------------------------------------------------------------------ the heart */
function Heart({ asset, s, tier }: { asset: LinesAsset; s: ShuntState; tier: Tier }) {
  const mode = useHeartUI((st) => st.mode); const cutSel = useHeartUI((st) => st.cut); const target = useHeartUI((st) => st.target);
  const cut = cutSel === 'auto' ? autoCut(target) : cutSel;
  const gl = useThree((st) => st.gl); const scene = useThree((st) => st.scene); useEffect(() => { gl.localClippingEnabled = true; }, [gl]);
  const planes = useMemo<THREE.Plane[]>(() => [], []);
  const trim = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -toScene(new THREE.Vector3(0, 4.12, 0)).y), []); // hide the abdominal aorta / IVC below the heart
  useEffect(() => { const p = cutPlane(cut); planes.length = 0; planes.push(trim); if (p) planes.push(p); scene.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.Material | undefined; if (m && 'clippingPlanes' in m && m.clippingPlanes === planes) m.needsUpdate = true; }); }, [cut, planes, trim, scene]);

  // geometry: our own copies so lesions can reshape them; originals kept for recomputing
  const parts = useMemo(() => PARTS.filter((id) => asset.meshes[id]).map((id) => {
    const geo = asset.meshes[id].geometry.clone(); const base = (geo.getAttribute('position').array as Float32Array).slice();
    if (!geo.getAttribute('normal')) geo.computeVertexNormals(); const nrm = (geo.getAttribute('normal').array as Float32Array).slice();
    const { m, U } = heartMaterial(id, planes); return { id, geo, base, nrm, m, U };
  }), [asset, planes]);
  const byId = useMemo(() => Object.fromEntries(parts.map((p) => [p.id, p])) as Record<PartId, (typeof parts)[number]>, [parts]);
  useEffect(() => () => parts.forEach((p) => { p.geo.dispose(); p.m.dispose(); }), [parts]);
  useEffect(() => { (window as unknown as { __heart3d?: unknown }).__heart3d = { byId }; }, [byId]); // automation / tests

  // lesion shape (deformations recomputed only when it changes)
  const shape = useMemo(() => lesionShape(s.input, s), [s]);
  const shapeKey = `${shape.coarct.toFixed(2)}|${shape.rvot.toFixed(2)}|${shape.override}|${shape.rvWall.toFixed(3)}`;
  useEffect(() => {
    const set = (id: PartId, f: (pos: Float32Array, p: (typeof parts)[number]) => Float32Array) => { const p = byId[id]; if (!p) return; const a = p.geo.getAttribute('position') as THREE.BufferAttribute; (a.array as Float32Array).set(f(p.base, p)); a.needsUpdate = true; p.geo.computeVertexNormals(); p.geo.computeBoundingSphere(); };
    set('aorta', (b) => shift(pinch(b, LM.isthmus, LM.isthmusAxis, 0.07, 0.12, shape.coarct), OVERRIDE.clone().multiplyScalar(shape.override), overrideWeight));
    set('aortic_valve', (b) => shift(b, OVERRIDE.clone().multiplyScalar(shape.override), () => 1));
    set('pulm_valve', (b) => pinch(b, LM.pulmValve, LM.rvotAxis, 0.06, 0.12, shape.rvot * 0.7));
    set('pulm_art', (b) => pinch(b, new THREE.Vector3(0.17, 5.16, 0.39), LM.rvotAxis, 0.07, 0.12, shape.rvot * 0.45));
    set('rv', (b, p) => pinch(thicken(b, p.nrm, shape.rvWall), LM.rvot, LM.rvotAxis, 0.09, 0.16, shape.rvot));
  }, [shapeKey, byId]); // eslint-disable-line react-hooks/exhaustive-deps

  // holes + linings
  const holes = useMemo(() => holesFor(s.input, s), [s]);
  useEffect(() => {
    for (const p of parts) {
      const list = holes.filter((h) => h.meshes.includes(p.id)); p.U.uHn.value = list.length;
      list.forEach((h, i) => { p.U.uHc.value[i].set(h.c.x, h.c.y, h.c.z, h.r); p.U.uHa.value[i].set(h.ax.x, h.ax.y, h.ax.z, h.half); p.U.uHu.value[i].set(h.u?.x ?? 0, h.u?.y ?? 0, h.u?.z ?? 0, h.squash ?? 0); });
    }
  }, [holes, parts]);
  const liningMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9b3b31', roughness: 0.55, side: THREE.DoubleSide, clippingPlanes: planes }), [planes]);
  const linings = useMemo(() => holes.map((h: Hole) => {
    const geo = new THREE.CylinderGeometry(h.r, h.r, h.half * 2, 28, 1, true);
    if (h.u && h.squash) geo.scale(1, 1, 1); // slit lining approximated by the flap below
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), h.ax);
    const mm = new THREE.Matrix4().compose(h.c, q, h.u && h.squash ? new THREE.Vector3(1, 1, 1) : new THREE.Vector3(1, 1, 1)); geo.applyMatrix4(mm);
    return { id: h.id, geo, slit: !!h.u };
  }), [holes]);
  useEffect(() => () => linings.forEach((l) => l.geo.dispose()), [linings]);

  // PFO flap (septum primum) on the left-atrial side: hinged along its upper edge, swings open with right-to-left flow
  const flap = useRef<THREE.Group>(null); const pfo = holes.find((h) => h.id === 'pfo');
  const flapR = holeRadius(Math.max(4, s.input.sizeMm), (s.input.qs ?? 5) < 2) * 1.25;
  const flapBasis = useMemo(() => { const z = ATRIAL_N.clone(); const y = new THREE.Vector3(0, 1, 0.45).normalize(); y.addScaledVector(z, -y.dot(z)).normalize(); const x = new THREE.Vector3().crossVectors(y, z); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); }, []);
  const flapMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c46a5c', roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.95, clippingPlanes: planes }), [planes]);

  // PDA vessel
  const duct = s.input.lesion === 'pda' ? s.input.sizeMm : s.input.lesion === 'coarct' ? (s.input.ductMm ?? 0) : 0;
  const ductGeo = useMemo(() => {
    if (duct <= 0) return null; const r = holeRadius(duct, (s.input.qs ?? 5) < 2);
    const mid = LM.pdaAorta.clone().lerp(LM.pdaPa, 0.5).add(new THREE.Vector3(0, 0.035, 0.01));
    return tubeAlong([LM.pdaAorta.clone().addScaledVector(LM.pdaPa.clone().sub(LM.pdaAorta).normalize(), -0.03), mid, LM.pdaPa.clone().addScaledVector(LM.pdaPa.clone().sub(LM.pdaAorta).normalize(), 0.03)], r, r * 0.92, 18, 300).geometry;
  }, [duct, s.input.qs]);
  const ductMat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.4, clearcoat: 0.5, side: THREE.DoubleSide, clippingPlanes: planes }), [planes]);

  // particles
  const NP = budget(tier, IS_PHONE ? 500 : 900); const inst = useRef<THREE.InstancedMesh>(null);
  const paths = useMemo(() => Object.fromEntries(Object.entries(flowPaths(shape)).map(([k, ws]) => [k, mk(ws)])) as Record<FlowPathId, Path>, [shapeKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const pts = useMemo(() => Array.from({ length: NP }, () => ({ path: 'svc' as FlowPathId, u: Math.random(), speed: 1, off: new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random())), jet: false, sat: 0.7, alive: false })), [NP]);
  useEffect(() => {
    const st = streams(s); const tot = st.reduce((a, x) => a + x.flow, 0) || 1; let k = 0;
    for (const x of st) { const n = Math.round((NP * x.flow) / tot); for (let j = 0; j < n && k < NP; j++, k++) { const q = pts[k]; q.path = x.id; q.jet = x.jet; q.sat = x.sat; q.alive = x.flow > 0.02 * s.qs; q.speed = x.jet ? Math.min(1.6, 0.5 + 0.25 * s.velocity) : 0.3 + 0.06 * Math.random(); } }
    for (; k < NP; k++) pts[k].alive = false;
  }, [s, pts, NP]);

  const cur = useRef({ lv: 1, la: 1, ra: 1, rv: 1 }); const t = useRef(0);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3(), d: new THREE.Vector3(), c: new THREE.Color(), q: new THREE.Vector3(), probe: LM.lvApex.clone().add(new THREE.Vector3(0.1, -0.1, 0.15)) }), []);
  useFrame((_, dtRaw) => {
    const dt = frameDt(dtRaw); t.current += Math.min(0.05, dtRaw); const c = cyclePhase(t.current); const k = cur.current;
    k.lv = approach(k.lv, Math.min(1.25, 1 + 0.12 * (s.load.lv - 1)), 3, dt); k.la = approach(k.la, Math.min(1.25, 1 + 0.15 * (s.load.la - 1)), 3, dt);
    k.rv = approach(k.rv, Math.min(1.25, 1 + 0.13 * (s.load.rv - 1)), 3, dt); k.ra = approach(k.ra, Math.min(1.25, 1 + 0.15 * (s.load.ra - 1)), 3, dt);
    const sat: Partial<Record<PartId, number>> = { ra: s.sat.ra, rv: s.sat.rv, la: s.sat.la, lv: s.sat.lv, aorta: s.sat.ao, arch_branches: s.sat.ao, pulm_art: s.sat.pa, svc: s.sat.sv, ivc: s.sat.sv, pulm_veins: 0.98 };
    for (const p of parts) {
      const K = p.id === 'lv' ? k.lv * (1 - 0.05 * c.sys) : p.id === 'rv' ? k.rv * (1 - 0.045 * c.sys) : p.id === 'la' ? k.la * (1 - 0.04 * c.atr) : p.id === 'ra' ? k.ra * (1 - 0.04 * c.atr) : p.id === 'septum' ? 1 - 0.015 * c.sys : 1;
      p.U.uK.value = K; const sv = sat[p.id];
      if (sv != null) { if (CHAMBER[p.id]) { saturationColor(sv, p.U.uBlood.value, true); p.U.uBloodMix.value = 0.42; } else saturationColor(sv, p.m.color, true); }
    }
    if (ductGeo) saturationColor(s.lr >= s.rl ? s.sat.ao : s.sat.pa, ductMat.color, true);
    const see = cut === 'closed' ? 0.5 : 1; // closed: vessels see-through so the flow inside stays visible
    for (const p of parts) if (VESSEL.has(p.id)) { if (p.m.opacity !== see) { p.m.opacity = see; p.m.transparent = see < 1; p.m.depthWrite = see === 1; p.m.needsUpdate = true; } }
    if (ductMat.opacity !== see) { ductMat.opacity = see; ductMat.transparent = see < 1; ductMat.depthWrite = see === 1; ductMat.needsUpdate = true; }
    if (flap.current) flap.current.rotation.x = approach(flap.current.rotation.x, -Math.min(0.9, s.rl * 3) * (0.6 + 0.4 * c.atr), 6, dt);
    const im = inst.current; if (!im) return;
    pts.forEach((q, i) => {
      if (!q.alive) { tmp.o.scale.setScalar(0.00001); tmp.o.updateMatrix(); im.setMatrixAt(i, tmp.o.matrix); return; }
      const pth = paths[q.path]; const pulse = q.jet ? 0.3 + 1.4 * (q.path.startsWith('vsd') ? c.sys : 0.6 + 0.4 * c.sys) : 0.55 + 0.7 * c.sys;
      q.u = (q.u + (dt * q.speed * pulse) / pth.len) % 1;
      const r = at(pth, q.u, tmp.p, tmp.d); tmp.p.addScaledVector(q.off, r * 0.85);
      tmp.o.position.copy(tmp.p); tmp.o.scale.setScalar(q.jet ? 0.0068 : 0.0052); tmp.o.updateMatrix(); im.setMatrixAt(i, tmp.o.matrix);
      if (mode === 'doppler') {
        const toward = tmp.d.dot(tmp.q.copy(tmp.probe).sub(tmp.p).normalize()); const vel = q.jet ? 0.8 + 0.8 * s.velocity : 0.6;
        if (vel > 1.6 && q.jet) tmp.c.setHSL(0.13 + 0.2 * ((i * 7919) % 10) / 10, 0.95, 0.55); // aliasing mosaic
        else tmp.c.set(toward > 0 ? '#e0322b' : '#2f6be0').multiplyScalar(0.55 + 0.45 * Math.min(1, Math.abs(toward) * vel));
      } else saturationColor(q.sat, tmp.c, true);
      im.setColorAt(i, tmp.c);
    });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  });

  return (
    <group scale={SCALE} position={CENTRE.clone().multiplyScalar(-SCALE)}>
      {parts.map((p) => <mesh key={p.id} geometry={p.geo} material={p.m} />)}
      {linings.filter((l) => !l.slit).map((l) => <mesh key={l.id} geometry={l.geo} material={liningMat} />)}
      {pfo && <group position={LM.fossa.clone().addScaledVector(ATRIAL_N, 0.05).addScaledVector(new THREE.Vector3(0, 1, 0.45).normalize(), flapR * 0.9)} quaternion={flapBasis}>
        <group ref={flap}><mesh position={[0, -flapR * 0.9, 0]} material={flapMat}><circleGeometry args={[flapR, 28]} /></mesh></group>
      </group>}
      {ductGeo && <mesh geometry={ductGeo} material={ductMat} />}
      <instancedMesh key={NP} ref={inst} args={[new THREE.SphereGeometry(1, 8, 6), undefined, NP]} frustumCulled={false}><meshBasicMaterial toneMapped={false} clippingPlanes={planes} /></instancedMesh>
      <Internals planes={planes} />
      <Labels s={s} shape={shape} cut={cut} />
    </group>
  );
}

/* ------------------------------------------------------------------ heart internals (heart-internals.glb, pericardium.glb; body frame) */
/** Papillary muscles and chordae are always drawn (they are what the cut opens onto); the conduction system lights a
 *  wavefront on the same 84/min clock as the beating chambers; the pericardium is a toggle (it hides the epicardium). */
function Internals({ planes }: { planes: THREE.Plane[] }) {
  const [hi, setHi] = useState<Layer<HeartInternalsMapping> | null>(null); const [pc, setPc] = useState<Layer<PericardiumMapping> | null>(null);
  const showC = useHeartUI((s) => s.conduction); const showP = useHeartUI((s) => s.pericardium);
  useEffect(() => { let off = false; loadHeartInternals().then((x) => { if (!off) setHi(x); }).catch(() => undefined); return () => { off = true; }; }, []);
  useEffect(() => { if (!showP || pc) return; let off = false; loadPericardium().then((x) => { if (!off) setPc(x); }).catch(() => undefined); return () => { off = true; }; }, [showP, pc]);
  const mats = useMemo(() => ({
    pap: new THREE.MeshPhysicalMaterial({ color: '#8f2c24', roughness: 0.5, clearcoat: 0.35, clippingPlanes: planes, side: THREE.DoubleSide }),
    chord: new THREE.MeshStandardMaterial({ color: '#f1e8d8', roughness: 0.35, clippingPlanes: planes }),
    sac: new THREE.MeshPhysicalMaterial({ color: '#e8ddcc', roughness: 0.3, clearcoat: 0.4, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, clippingPlanes: planes }),
    cond: [0, 1, 2].map((b) => { const c = conductionMaterial(b as 0 | 1 | 2); c.material.clippingPlanes = planes; return c; }),
  }), [planes]);
  useEffect(() => () => { mats.pap.dispose(); mats.chord.dispose(); mats.sac.dispose(); mats.cond.forEach((c) => c.material.dispose()); }, [mats]);
  const t = useRef(0);
  useFrame((_, dt) => { t.current += Math.min(0.05, dt); const ms = ((t.current + 0.19) % PERIOD) * 1000; /* electrical precedes mechanical: the SA node fires ~190 ms before systole */ for (const c of mats.cond) { c.uniforms.uT.value = ms; c.uniforms.uHisStart.value = hi?.mapping.activation.hisStart ?? 120; } });
  if (!hi) return null;
  return (<>
    {VALVE_APPARATUS.filter((id) => hi.meshes[id]).map((id) => <mesh key={id} geometry={hi.meshes[id].geometry} material={/^chordae/.test(id) ? mats.chord : mats.pap} dispose={null} />)}
    {showC && CONDUCTION.filter((id) => hi.meshes[id]).map((id) => <mesh key={id} geometry={hi.meshes[id].geometry} material={mats.cond[branchOf(id)].material} renderOrder={6} dispose={null} />)}
    {showP && pc && <mesh geometry={pc.meshes.pericardium.geometry} material={mats.sac} renderOrder={7} dispose={null} />}
  </>);
}

/* ------------------------------------------------------------------ labels (body frame, inside the heart group) */
function Labels({ s, shape, cut }: { s: ShuntState; shape: LesionShape; cut: Exclude<CutMode, 'auto'> }) {
  const on = useHeartUI((st) => st.labels); if (!on) return null; const L = s.input.lesion; const dir = s.direction === 'none' ? '' : ` · ${s.direction}`;
  const tag = (p: THREE.Vector3, t: string, cls = '', info?: string) => <Html key={info ?? t} position={p} center zIndexRange={[20, 0]}><LabelChip className={`tag3d tk ${cls}`} text={t} info={info} important={!!info} /></Html>;
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const closed = cut === 'closed';
  return (<>
    {tag(V(-0.33, 4.62, 0.5), 'RA')}{tag(V(0.36, 4.98, 0.05), 'LA')}{tag(V(0.25, 4.38, 0.82), 'RV')}{tag(V(0.66, 4.55, 0.35), 'LV')}
    {!closed && tag(LM.septum.clone().addScaledVector(SEPTUM_N, 0.06).add(V(0, -0.12, 0)), 'Ventricular septum')}
    {tag(V(-0.05, 5.5, 0.32), 'Aorta', 't-art')}{tag(V(0.3, 5.28, 0.35), 'Pulmonary artery', 't-ven')}
    {!IS_PHONE && tag(V(-0.3, 5.4, 0.22), 'SVC')}{!IS_PHONE && tag(V(-0.42, 4.92, 0.0), 'Pulmonary veins')}
    {(L === 'vsd' || L === 'tof') && tag(holesFor(s.input)[0].c.clone().addScaledVector(SEPTUM_N, 0.12).add(V(0, 0.05, 0)), L === 'tof' ? 'VSD (malaligned)' : `VSD ${s.input.sizeMm} mm${dir}`, 't-teal', 'vsd')}
    {L === 'asd' && tag(LM.fossa.clone().addScaledVector(ATRIAL_N, -0.12).add(V(0, 0.06, 0)), `ASD ${s.input.sizeMm} mm${dir}`, 't-teal', 'asd')}
    {L === 'pfo' && tag(LM.fossa.clone().addScaledVector(ATRIAL_N, -0.12).add(V(0, 0.06, 0)), s.rl > 0.05 ? 'PFO flap open · R→L' : 'PFO flap closed', 't-teal', 'pfo')}
    {(L === 'pda' || (L === 'coarct' && (s.input.ductMm ?? 0) > 0)) && tag(LM.pdaAorta.clone().lerp(LM.pdaPa, 0.5).add(V(0.06, 0.08, -0.04)), `PDA${dir}`, 't-teal', 'pda')}
    {L === 'coarct' && tag(LM.isthmus.clone().add(V(0.12, 0.06, -0.06)), 'Coarctation', 't-teal', 'coarctation')}
    {L === 'tof' && shape.rvot > 0 && tag(LM.rvot.clone().add(V(0.12, 0.02, 0.1)), 'Narrow RV outflow', 't-teal', 'rvot obstruction')}
    {L === 'tof' && tag(LM.aorticValve.clone().add(OVERRIDE).add(V(-0.12, 0.1, 0.08)), 'Overriding aorta', 't-teal', 'overriding aorta')}
    {shape.rvWall > 0.012 && tag(V(0.08, 4.5, 0.86), 'Thick RV wall', '', 'rv hypertrophy')}
  </>);
}

/* ------------------------------------------------------------------ camera + targets */
const W = (p: THREE.Vector3) => toScene(p);
const look = (from: THREE.Vector3, at: THREE.Vector3, dist: number): [THREE.Vector3, THREE.Vector3] => { const a = W(at); return [a.clone().addScaledVector(from.clone().normalize(), dist), a]; };
const D = IS_PHONE ? 1.3 : 1;
export const HEART_VIEW: Record<string, () => [THREE.Vector3, THREE.Vector3]> = {
  'heart.four_chamber': () => look(new THREE.Vector3(0.069, 0.889, 0.453).add(new THREE.Vector3(0, 0, 0.35)), new THREE.Vector3(0.2, 4.66, 0.38), 8.6 * D),
  'heart.septum': () => look(SEPTUM_N.clone().add(new THREE.Vector3(0, 0.25, 0)), LM.septum, 4.8 * D),
  'heart.vsd': () => look(SEPTUM_N.clone().add(new THREE.Vector3(0.1, 0.25, 0.25)), LM.vsdPerimembranous, 5.6 * D),
  'heart.asd': () => look(ATRIAL_N.clone().negate().add(new THREE.Vector3(0, 0.25, 0.1)), LM.fossa, 5.4 * D),
  'heart.pfo': () => look(ATRIAL_N.clone().negate().add(new THREE.Vector3(0, 0.25, 0.1)), LM.fossa, 4.8 * D),
  'heart.lv': () => look(SEPTUM_N.clone().negate().add(new THREE.Vector3(0, 0.2, 0)), LM.lv, 5.2 * D),
  'heart.rv': () => look(SEPTUM_N.clone().add(new THREE.Vector3(0, 0.15, 0.2)), LM.rv, 5.4 * D),
  'heart.pulmonary_outflow': () => look(new THREE.Vector3(-0.2, 0.35, 1), LM.rvot.clone().add(new THREE.Vector3(0, 0.05, 0)), 4.4 * D),
  'heart.pda': () => look(new THREE.Vector3(1, 0.45, -0.55), LM.pdaAorta.clone().lerp(LM.pdaPa, 0.5), 3.4 * D),
  'heart.coarct': () => look(new THREE.Vector3(1, 0.15, -0.25), LM.isthmus.clone().add(new THREE.Vector3(0, -0.05, 0)), 3.0 * D),
};
registerAnchors('heart', () => ({ four_chamber: W(new THREE.Vector3(0.2, 4.66, 0.38)), septum: W(LM.septum), vsd: W(LM.vsdPerimembranous), asd: W(LM.fossa), pfo: W(LM.fossa), lv: W(LM.lv), rv: W(LM.rv), outflow: W(LM.rvot), pda: W(LM.pdaAorta.clone().lerp(LM.pdaPa, 0.5)), coarct: W(LM.isthmus) }));
function Rig() {
  const cc = useRef<CameraControls>(null); const target = useHeartUI((s) => s.target); const first = useRef(true);
  useEffect(() => { const [p, l] = (HEART_VIEW[target] ?? HEART_VIEW['heart.four_chamber'])(); cc.current?.setLookAt(p.x, p.y, p.z, l.x, l.y, l.z, !first.current); first.current = false; }, [target]);
  return <CameraControls ref={cc} makeDefault minDistance={1} maxDistance={16} smoothTime={0.55} />;
}

export { CUT_LABEL };
export function HeartScene() {
  const input = useHeartUI((s) => s.input); const tier = useLabUI((s) => s.visualTier) as Tier;
  const s = useMemo(() => solveShunt(input), [input]);
  const [asset, setAsset] = useState<LinesAsset | null>(null); const [err, setErr] = useState('');
  useEffect(() => { loadLinesAsset().then(setAsset).catch((e) => setErr(String(e?.message || e))); }, []);
  const [p] = HEART_VIEW['heart.four_chamber']();
  if (err) return <p className="img-note" role="alert">The 3D heart could not be loaded: {err}</p>;
  return (
    <StudioCanvas camera={{ position: [p.x, p.y, p.z], fov: 32 }} fog={false} label="Interactive 3D heart, cut open to show the defect">
      {asset && <Heart asset={asset} s={s} tier={tier} />}
      <Rig />
    </StudioCanvas>
  );
}
