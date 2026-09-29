/**
 * Neuro foundation scene: the HuBMAP brain (body.glb) with its arterial supply drawn from
 * anatomy.ts, territory perfusion shading (core / penumbra) from perfusion.ts, haemorrhage
 * primitives and brain.* semantic camera targets. All state comes from useNeuroUI — this file only draws.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import type { BodyAsset } from '../asset/body';
import { StudioCanvas, IS_PHONE, GLSL_NOISE } from '../scene/Studio';
import { tubeAlong, budget, approach, frameDt, type Tier } from '../scene/effects';
import { registerAnchors } from '../scene/cameraTargets';
import { useLabUI } from '../labs/labStore';
import { useNeuroUI } from './neuroStore';
import { buildCerebralVessels, brainFrameFromMesh, toBody, toLocal, TERRITORIES, TERRITORY_CORE, TERRITORY_RADIUS, type BrainFrame, type CerebralVessel, type TerritoryId } from './anatomy';
import { territoryStates, hemorrhageShape } from './perfusion';
import { vesselPerfusion } from './vesselFlow';

/* ------------------------------------------------------------------ brain surface shader (mirrors anatomy.territoryAt) */
const BRAIN_HEAD = /* glsl */ `
uniform vec3 uC; uniform vec3 uH; uniform float uCoreW[7]; uniform float uPenW[7]; uniform float uRegion[7]; uniform vec3 uCtr[7]; uniform float uRad[7]; uniform float uT;
varying vec3 vB;
${GLSL_NOISE}
int territory(vec3 l){
  float ax = abs(l.x); int s = l.x < 0.0 ? 0 : 1;
  if (l.y < -0.55 && l.z < -0.2 && ax < 0.72) return 6;
  if ((l.z < -0.6 && (l.y < 0.3 || ax < 0.45)) || (l.y < -0.32 && l.z < -0.12 && ax > 0.18)) return 4 + s;
  if (l.z > -0.55 && l.y > -0.35 && (ax < 0.3 || (l.y > 0.55 && ax < 0.5))) return 2 + s;
  return s;
}
`;
const BRAIN_COLOR = /* glsl */ `
vec3 ischTint = vec3(0.0);
{
  vec3 l = (vB - uC) / uH;
  // gyri and sulci: meandering contour bands of a low-frequency noise field
  float n = fbm(l * 3.1 + 1.7); float band = abs(fract(n * 7.0) - 0.5) * 2.0;
  float sulcus = smoothstep(0.18, 0.02, band);
  float fissure = smoothstep(0.035, 0.0, abs(l.x)) * step(-0.45, l.y); // interhemispheric fissure
  diffuseColor.rgb *= (0.92 + 0.12 * fbm(l * 14.0)) * (1.0 - 0.38 * sulcus) * (1.0 - 0.6 * fissure);
  vec3 lq = l + (vec3(fbm(l * 2.3), fbm(l * 2.3 + 5.1), fbm(l * 2.3 + 9.7)) - 0.5) * 0.2; // irregular watershed borders (visual only)
  int t = territory(lq);
  float core = 0.0, pen = 0.0, reg = 0.0, cw = 0.0, pw = 0.0, rad = 1.0; vec3 ctr = vec3(0.0);
  for (int i = 0; i < 7; i++) if (i == t) { cw = uCoreW[i]; pw = uPenW[i]; reg = uRegion[i]; ctr = uCtr[i]; rad = uRad[i]; }
  // division occlusions only affect their half of the MCA
  bool inRegion = reg < 0.5 || (reg < 1.5 ? l.y > -0.2 : l.y <= -0.2);
  float w = clamp(length(l - ctr) / rad, 0.0, 1.0);
  if (inRegion) { core = 1.0 - smoothstep(cw - 0.03, cw + 0.03, w); pen = (1.0 - smoothstep(pw - 0.03, pw + 0.03, w)) * (1.0 - core); }
  float pulse = 0.85 + 0.15 * sin(uT * 2.5);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.62, 0.18), pen * 0.62 * pulse);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.12, 0.32), core * 0.78);
  // ischaemic tissue glows and turns opaque so it reads through the glass brain
  ischTint = vec3(0.55, 0.3, 0.05) * pen * pulse * 0.55 + vec3(0.5, 0.04, 0.16) * core * 0.6;
  diffuseColor.a = mix(diffuseColor.a, 0.9, max(pen * 0.75, core));
}`;

function useBrainMaterial(frame: BrainFrame) {
  return useMemo(() => {
    const u = {
      uC: { value: frame.c.clone() }, uH: { value: frame.h.clone() }, uT: { value: 0 },
      uCoreW: { value: new Array(7).fill(0) }, uPenW: { value: new Array(7).fill(0) }, uRegion: { value: new Array(7).fill(0) },
      uCtr: { value: TERRITORIES.map((t) => new THREE.Vector3(...TERRITORY_CORE[t])) }, uRad: { value: TERRITORIES.map((t) => TERRITORY_RADIUS[t]) },
    };
    const mat = new THREE.MeshPhysicalMaterial({ color: '#e6c2b4', roughness: 0.62, sheen: 0.5, sheenColor: new THREE.Color('#ffe4dc'), clearcoat: 0.15, transparent: true, side: THREE.FrontSide });
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = 'varying vec3 vB;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vB = position;');
      sh.fragmentShader = BRAIN_HEAD + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n' + BRAIN_COLOR).replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += ischTint;');
    };
    return { mat, u };
  }, [frame]);
}

/* ------------------------------------------------------------------ per-vessel perfusion (for colour + flow particles) */
/* ------------------------------------------------------------------ vessels */
const PERF = new THREE.Color('#c81e2a'), DEAD = new THREE.Color('#3a2a3e');
/** Pial arteries run on the cortex: push cortical points out onto the real brain surface (the layout uses an ellipsoid). */
function snapToCortex(vs: CerebralVessel[], frame: BrainFrame, brain: THREE.BufferGeometry) {
  const mesh = new THREE.Mesh(brain, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); const ray = new THREE.Raycaster(); const dir = new THREE.Vector3(); const l = new THREE.Vector3();
  for (const v of vs) {
    if (v.kind !== 'cortical' && !/^m2|^p2/.test(v.id)) continue;
    v.pts = v.pts.map((p, i) => {
      toLocal(frame, p, l); if (i === 0 || l.length() < 0.7) return p;
      dir.copy(p).sub(frame.c).normalize(); ray.set(frame.c, dir); const hit = ray.intersectObject(mesh, false).pop();
      return hit ? hit.point.clone().addScaledVector(dir, v.r1 * 1.2) : p;
    });
  }
  return vs;
}
function Vessels({ frame, tier, brain }: { frame: BrainFrame; tier: Tier; brain: THREE.BufferGeometry }) {
  const vs = useMemo(() => snapToCortex(buildCerebralVessels(frame), frame, brain), [frame, brain]);
  const tubes = useMemo(() => vs.map((v) => ({ v, ...tubeAlong(v.pts, v.r0, v.r1, tier === 'low' ? 6 : 12, tier === 'low' ? 25 : 55) })), [vs, tier]);
  const mats = useMemo(() => tubes.map(() => {
    const u = { uUp: { value: new THREE.Color() }, uDown: { value: new THREE.Color() }, uClot: { value: 2 } };
    const m = new THREE.MeshPhysicalMaterial({ roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.3 });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = 'attribute float aT; varying float vT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vT = aT;');
      sh.fragmentShader = 'uniform vec3 uUp; uniform vec3 uDown; uniform float uClot; varying float vT;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = mix(uUp, uDown, smoothstep(uClot - 0.02, uClot + 0.02, vT));');
    };
    return { m, u };
  }), [tubes]);
  const clotMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#4b0c12', roughness: 0.85, clearcoat: 0.1 }), []);
  const clotGeo = useMemo(() => new THREE.CapsuleGeometry(1, 2.2, 6, 12), []);
  const state = useNeuroUI((s) => s.state);
  const perf = useMemo(() => vesselPerfusion(vs, state), [vs, state]);
  // flow particles along perfused vessels
  const NP = budget(tier, 300); const inst = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => { const w = tubes.map((t) => t.length); const tot = w.reduce((a, b) => a + b, 0); const out: { k: number; t: number }[] = []; tubes.forEach((t, k) => { const n = Math.max(1, Math.round((NP * t.length) / tot)); for (let i = 0; i < n; i++) out.push({ k, t: i / n }); }); return out.slice(0, NP); }, [tubes, NP]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), p: new THREE.Vector3() }), []);
  const shown = useRef(perf); const vis = useRef<Record<string, { up: number; down: number }>>({});
  useFrame((_, dtRaw) => {
    const dt = frameDt(dtRaw); shown.current = perf;
    tubes.forEach((t, k) => {
      const p = perf[t.v.id]; const c = (vis.current[t.v.id] ??= { up: p.up, down: p.down });
      c.up = approach(c.up, p.up, 4, dt); c.down = approach(c.down, p.down, 4, dt);
      mats[k].u.uUp.value.copy(DEAD).lerp(PERF, c.up); mats[k].u.uDown.value.copy(DEAD).lerp(PERF, c.down); mats[k].u.uClot.value = p.clotT ?? 2;
    });
    const im = inst.current; if (!im) return;
    seeds.forEach((s, i) => {
      const t = tubes[s.k]; const p = perf[t.v.id]; const beyond = p.clotT != null && s.t > p.clotT; const f = beyond ? p.down : Math.max(p.up, p.clotT == null ? p.down : p.up);
      const stopped = p.clotT != null && !beyond && s.t > p.clotT - 0.04; // blood piles up against the clot
      s.t += stopped ? 0 : (Math.min(0.05, dtRaw) * f * 0.9) / Math.max(0.3, t.length);
      if (s.t > 1) s.t -= 1; if (p.clotT != null && !beyond && s.t > p.clotT) s.t = p.clotT - 0.04;
      t.curve.getPointAt(s.t, tmp.p); tmp.o.position.copy(tmp.p); tmp.o.scale.setScalar(f > 0.08 ? (t.v.r0 + (t.v.r1 - t.v.r0) * s.t) * 0.34 : 0.00001); tmp.o.updateMatrix(); im.setMatrixAt(i, tmp.o.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  });
  return (<group>
    {tubes.map((t, k) => <mesh key={t.v.id} geometry={t.geometry} material={mats[k].m} renderOrder={2} />)}
    {tubes.map((t) => { const p = perf[t.v.id]; if (p.clotT == null) return null; const pt = t.curve.getPointAt(p.clotT); const tan = t.curve.getTangentAt(p.clotT); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan); const r = (t.v.r0 + t.v.r1) / 2 * 1.08;
      return <mesh key={'clot' + t.v.id} geometry={clotGeo} material={clotMat} position={pt} quaternion={q} scale={[r, r, r]} renderOrder={3} />; })}
    <instancedMesh key={NP} ref={inst} args={[new THREE.SphereGeometry(1, 6, 5), undefined, seeds.length]} frustumCulled={false} renderOrder={3}><meshBasicMaterial color="#ff6a6a" transparent opacity={0.85} depthWrite={false} toneMapped={false} /></instancedMesh>
    <VesselLabels vs={vs} />
  </group>);
}

function VesselLabels({ vs }: { vs: CerebralVessel[] }) {
  const on = useNeuroUI((s) => s.labels); const target = useNeuroUI((s) => s.target); if (!on) return null;
  const pick: [string, number, string][] = target === 'brain.cow' || target === 'brain.basilar'
    ? [['a1_R', 0.5, 'A1'], ['acom', 0.5, 'ACoA'], ['pcom_L', 0.5, 'PCoA'], ['pcom_R', 0.5, 'PCoA'], ['p1_L', 0.6, 'P1'], ['m1_L', 0.6, 'M1'], ['basilar', 0.35, 'Basilar'], ['ica_R', 0.93, 'ICA'], ['sca_L', 0.7, 'SCA']]
    : IS_PHONE
    ? [['m1_L', 0.6, 'MCA'], ['basilar', 0.5, 'Basilar'], ['a2_L', 0.35, 'ACA'], ['p2_L', 0.6, 'PCA']]
    : [['ica_L', 0.2, 'Internal carotid'], ['m1_L', 0.65, 'Middle cerebral (M1)'], ['a2_R', 0.3, 'Anterior cerebral'], ['p2_L', 0.6, 'Posterior cerebral'], ['basilar', 0.4, 'Basilar'], ['vert_R', 0.3, 'Vertebral']];
  return (<>{pick.map(([id, t, label]) => { const v = vs.find((x) => x.id === id); if (!v) return null; const p = new THREE.CatmullRomCurve3(v.pts, false, 'centripetal').getPointAt(t);
    return <Html key={id} position={p} center zIndexRange={[20, 0]}><div className="tag3d tk t-art">{label}</div></Html>; })}</>);
}

/* ------------------------------------------------------------------ brain + pathology */
/** The source brain surface is wound inside-out (front faces point inward); flip it once so FrontSide culling shows the near cortex. */
function outwardGeometry(src: THREE.BufferGeometry) {
  const g = src.clone(); const P = g.attributes.position as THREE.BufferAttribute; const idx = g.index!;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(); let vol = 0;
  for (let i = 0; i < idx.count; i += 3) { a.fromBufferAttribute(P, idx.getX(i)); b.fromBufferAttribute(P, idx.getX(i + 1)); c.fromBufferAttribute(P, idx.getX(i + 2)); vol += a.dot(b.clone().cross(c)); }
  if (vol < 0) { for (let i = 0; i < idx.count; i += 3) { const t = idx.getX(i + 1); idx.setX(i + 1, idx.getX(i + 2)); idx.setX(i + 2, t); } idx.needsUpdate = true; }
  g.computeVertexNormals(); return g;
}
function Brain({ body, frame }: { body: BodyAsset; frame: BrainFrame }) {
  const { mat, u } = useBrainMaterial(frame);
  const geo = useMemo(() => outwardGeometry(body.meshes.brain.geometry), [body]);
  const glass = useNeuroUI((s) => s.glass); const state = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys);
  const ts = useMemo(() => territoryStates(state, sys), [state, sys]);
  const cur = useRef(TERRITORIES.map(() => ({ c: 0, p: 0 })));
  useFrame((st, dtRaw) => {
    const dt = frameDt(dtRaw); u.uT.value = st.clock.elapsedTime;
    TERRITORIES.forEach((t, i) => {
      const s = ts[t]; const c = cur.current[i]; c.c = approach(c.c, s.coreW, 5, dt); c.p = approach(c.p, s.penW, 5, dt);
      u.uCoreW.value[i] = c.c; u.uPenW.value[i] = c.p; u.uRegion.value[i] = s.flow.region === 'sup' ? 1 : s.flow.region === 'inf' ? 2 : 0;
    });
    mat.opacity = approach(mat.opacity, glass ? 0.4 : 1, 6, dt); mat.depthWrite = mat.opacity > 0.95;
  });
  return <mesh geometry={geo} material={mat} renderOrder={glass ? 4 : 1} />;
}

function Hemorrhage({ frame }: { frame: BrainFrame }) {
  const h = useNeuroUI((s) => s.state.hemorrhage);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#5e0a10', roughness: 0.55, clearcoat: 0.4, transparent: true, opacity: 0.94 }), []);
  const sahMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#8a1219', roughness: 0.35, clearcoat: 0.5, transparent: true, opacity: 0.85, depthWrite: false }), []);
  const blob = useMemo(() => { const g = new THREE.IcosahedronGeometry(1, 12); const p = g.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + 0.12 * Math.sin(v.x * 5.1 + v.y * 3.3) * Math.cos(v.z * 4.2 - v.x * 2.0); p.setXYZ(i, v.x * k, v.y * k * 0.85, v.z * k * 1.1); } g.computeVertexNormals(); return g; }, []);
  if (!h) return null;
  const { rCm } = hemorrhageShape(h); const at = toBody(frame, h.at); const r = rCm / 10; // cm → dm
  if (h.kind === 'ich') return <mesh geometry={blob} material={mat} position={at} scale={r} renderOrder={6} />;
  // SAH: blood layering in the basal cisterns and running up both Sylvian fissures
  const pieces: [number, number, number, number, number, number][] = [[0, -0.6, 0.12, 0.34, 0.07, 0.3], [-0.3, -0.52, 0.18, 0.28, 0.05, 0.1], [0.3, -0.52, 0.18, 0.28, 0.05, 0.1], [-0.55, -0.4, 0.14, 0.2, 0.05, 0.08], [0.55, -0.4, 0.14, 0.2, 0.05, 0.08], [0, -0.7, -0.05, 0.14, 0.05, 0.16]];
  const k = Math.cbrt(h.volumeMl / 15);
  return (<>{pieces.map((q, i) => <mesh key={i} geometry={blob} material={sahMat} position={toBody(frame, [q[0], q[1], q[2]])} scale={[q[3] * frame.h.x * k, q[4] * frame.h.y * k, q[5] * frame.h.z * k]} renderOrder={6} />)}</>);
}

function TerritoryTags({ frame }: { frame: BrainFrame }) {
  const on = useNeuroUI((s) => s.labels); const state = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys);
  if (!on) return null; const ts = territoryStates(state, sys);
  return (<>{TERRITORIES.filter((t) => ts[t].coreMl + ts[t].penumbraMl > 0.5).map((t) => { const c = TERRITORY_CORE[t]; const p = toBody(frame, [c[0] * 1.5, c[1] + 0.35, c[2]]);
    return <Html key={t} position={p} center zIndexRange={[20, 0]}><div className="tag3d t-red">Core {Math.round(ts[t].coreMl)} mL · penumbra {Math.round(ts[t].penumbraMl)} mL</div></Html>; })}</>);
}

/* ------------------------------------------------------------------ camera + anchors */
const ANCH: Record<string, THREE.Vector3> = {};
function publish(frame: BrainFrame) {
  const L = (x: number, y: number, z: number) => toBody(frame, [x, y, z]);
  Object.assign(ANCH, { brain: frame.c.clone(), cow: L(0, -0.6, 0.12), mca_l: L(0.75, -0.2, 0.05), mca_r: L(-0.75, -0.2, 0.05), aca: L(0, 0.2, 0.5), pca: L(0, -0.35, -0.75), basilar: L(0, -0.8, -0.05), ica_l: L(0.45, -1.2, 0.1), ica_r: L(-0.45, -1.2, 0.1) });
}
registerAnchors('neuro', () => ANCH);
const VIEW: Record<string, (f: BrainFrame) => [THREE.Vector3, THREE.Vector3]> = {
  'brain.whole': (f) => [f.c.clone().add(new THREE.Vector3(2.4, 1.1, 4.0).multiplyScalar(IS_PHONE ? 1.35 : 1)), f.c.clone().add(new THREE.Vector3(0, -0.3, 0))],
  'brain.cow': () => [ANCH.cow.clone().add(new THREE.Vector3(0.3, -2.9, 1.8).multiplyScalar(IS_PHONE ? 1.3 : 1)), ANCH.cow.clone()],
  'brain.mca_l': () => [ANCH.mca_l.clone().add(new THREE.Vector3(3.6, 0.5, 0.6)), ANCH.mca_l.clone().add(new THREE.Vector3(-0.6, 0, 0))],
  'brain.mca_r': () => [ANCH.mca_r.clone().add(new THREE.Vector3(-3.6, 0.5, 0.6)), ANCH.mca_r.clone().add(new THREE.Vector3(0.6, 0, 0))],
  'brain.aca': () => [ANCH.aca.clone().add(new THREE.Vector3(1.2, 3.2, 1.6)), ANCH.aca.clone()],
  'brain.pca': () => [ANCH.pca.clone().add(new THREE.Vector3(1.2, 1.0, -3.4)), ANCH.pca.clone()],
  'brain.basilar': () => [ANCH.basilar.clone().add(new THREE.Vector3(0.9, -1.6, 2.9)), ANCH.basilar.clone()],
  'brain.ica_l': () => [ANCH.ica_l.clone().add(new THREE.Vector3(2.6, 0.2, 2.4)), ANCH.ica_l.clone().add(new THREE.Vector3(0, 0.4, 0))],
  'brain.ica_r': () => [ANCH.ica_r.clone().add(new THREE.Vector3(-2.6, 0.2, 2.4)), ANCH.ica_r.clone().add(new THREE.Vector3(0, 0.4, 0))],
};
function Rig({ frame }: { frame: BrainFrame }) {
  const cc = useRef<CameraControls>(null); const target = useNeuroUI((s) => s.target); const first = useRef(true);
  useEffect(() => { const f = VIEW[target] ?? VIEW['brain.whole']; const [p, l] = f(frame); cc.current?.setLookAt(p.x, p.y, p.z, l.x, l.y, l.z, !first.current); first.current = false; }, [target, frame]);
  return <CameraControls ref={cc} makeDefault minDistance={0.8} maxDistance={14} smoothTime={0.6} />;
}

export function NeuroScene({ body }: { body: BodyAsset }) {
  const frame = useMemo(() => { const f = brainFrameFromMesh(body.meshes.brain); publish(f); return f; }, [body]);
  const tier = useLabUI((s) => s.visualTier) as Tier;
  const [p, l] = VIEW['brain.whole'](frame);
  return (
    <StudioCanvas camera={{ position: [p.x, p.y, p.z], fov: 30 }} fog={false}>
      <group>
        <Vessels frame={frame} tier={tier} brain={body.meshes.brain.geometry} />
        <Brain body={body} frame={frame} />
        <Hemorrhage frame={frame} />
        <TerritoryTags frame={frame} />
      </group>
      <Rig frame={frame} />
      <mesh position={l} visible={false}><boxGeometry args={[0.01, 0.01, 0.01]} /></mesh>
    </StudioCanvas>
  );
}
