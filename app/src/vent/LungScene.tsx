/**
 * The respiratory 3D view. Every motion here is read from the running VentSession each
 * frame — lung volume per side, open/collapsed fraction, overdistension, bronchospasm,
 * pleural collapse, airway flow — so the anatomy can never disagree with the waveforms.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import type { RespAsset } from '../asset/resp';
import { polylineAt } from '../asset/resp';
import { StudioCanvas, GLSL_TRIPLANAR, tissueTexture, IS_PHONE, damp } from '../scene/Studio';
import { VolumeFlow, type FlowPoint } from '../scene/VolumeFlow';
import { LabelChip } from '../scene/labels';
import { session } from './session';
import { useUI } from '../app/store';

/* ------------------------------------------------------------------ shared uniforms */
export const makeLungUniforms = () => ({
  uS: { value: new THREE.Vector2() },        // inflation (linear scale − 1) right, left
  uClosed: { value: new THREE.Vector2() },   // fraction of lung units collapsed
  uOver: { value: new THREE.Vector2() },     // overdistension 0–1
  uColl: { value: new THREE.Vector2() },     // pneumothorax collapse 0–1
  uHilR: { value: new THREE.Vector3() }, uHilL: { value: new THREE.Vector3() },
  uLungH: { value: 2.3 }, uSpasm: { value: 0 }, uTime: { value: 0 }, uOpacity: { value: 1 },
  uMucus: { value: 0 }, uPlug: { value: 0 }, uWet: { value: 0 },
});
export type LungUniforms = ReturnType<typeof makeLungUniforms>;
const U = makeLungUniforms();
const FRC = [1.3, 1.1]; const AMPLIFY = 1.6; // motion shown 1.6× so small tidal changes are visible

const lungVertex = /* glsl */ `
attribute float aLobe; attribute float aDep; attribute float aBase;
uniform vec2 uS; uniform vec2 uClosed; uniform vec2 uOver; uniform vec2 uColl; uniform vec3 uHilR; uniform vec3 uHilL; uniform float uLungH; uniform float uGhost;
varying float vAtel; varying float vOver; varying vec3 vObj; varying vec3 vObjN; varying float vDep;
`;
const lungBegin = /* glsl */ `
#include <begin_vertex>
float side = step(2.5, aLobe);
vec3 hil = side < 0.5 ? uHilR : uHilL;
float s = side < 0.5 ? uS.x : uS.y;
float closed = side < 0.5 ? uClosed.x : uClosed.y;
float coll = (side < 0.5 ? uColl.x : uColl.y) * (1.0 - uGhost);
vec3 d = transformed - hil;
transformed = hil + d * (1.0 + s * 0.42);
transformed.y -= s * aBase * aBase * uLungH * 0.5;              // diaphragmatic excursion moves the bases most
vAtel = closed > 0.002 ? smoothstep(1.0 - closed - 0.06, 1.0 - closed + 0.04, aDep) : 0.0;
transformed -= objectNormal * vAtel * 0.025 * (1.0 - uGhost);   // airless lung sinks slightly
transformed = hil + (transformed - hil) * (1.0 - 0.62 * coll);  // pneumothorax: lung falls toward the hilum
vOver = (side < 0.5 ? uOver.x : uOver.y) * (1.0 - smoothstep(0.3, 0.7, aDep));
vObj = position; vObjN = objectNormal; vDep = aDep;
`;
const lungFragHead = /* glsl */ `
uniform float uGhost; uniform float uOpacity; uniform float uWet;
varying float vAtel; varying float vOver; varying vec3 vObj; varying vec3 vObjN; varying float vDep;
${GLSL_TRIPLANAR}
`;
const lungColor = /* glsl */ `
#include <color_fragment>
{
  vec4 t1 = tri(vObj, vObjN, 0.9); vec4 t2 = tri(vObj * 1.9 + 0.37, vObjN, 0.9);
  float septa = t1.r * 0.7 + t2.r * 0.3;                          // secondary-lobule outlines
  float mott = t1.g * 0.6 + t2.g * 0.4;
  vec3 pink = vec3(0.60, 0.27, 0.23);
  vec3 c = pink * (0.82 + 0.34 * mott);
  c = mix(c, c * 0.72, septa * 0.35);
  float speck = max(t1.b, t2.b) * step(0.35, septa);
  c = mix(c, vec3(0.06, 0.055, 0.06), speck * 0.55);                // anthracotic pigment along septa
  c = mix(c, c * vec3(0.95, 0.9, 0.95), smoothstep(0.4, 1.0, vDep) * 0.25); // gravity-dependent congestion
  c = mix(c, vec3(0.42, 0.14, 0.14), uWet * smoothstep(0.35, 0.9, vDep)); // oedema pooling
  c = mix(c, vec3(0.19, 0.035, 0.045) * (0.8 + 0.4 * mott), vAtel);   // atelectatic: dark, airless, liver-like
  c = mix(c, vec3(0.86, 0.66, 0.60), clamp(vOver, 0.0, 1.0) * 0.75); // overdistended: pale, stretched
  diffuseColor.rgb = mix(c, vec3(0.55, 0.62, 0.7), uGhost);
  diffuseColor.a = uGhost > 0.5 ? 0.13 : uOpacity;
}
`;

export function lungMaterial(ghost = false, UU: LungUniforms = U) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.52, sheen: 0.7, sheenRoughness: 0.45, sheenColor: new THREE.Color('#ffd9d0'), clearcoat: 0.35, clearcoatRoughness: 0.35, transparent: ghost, depthWrite: !ghost, side: ghost ? THREE.BackSide : THREE.FrontSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, UU, { uGhost: { value: ghost ? 1 : 0 }, uTissue: { value: tissueTexture() } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + lungVertex).replace('#include <begin_vertex>', lungBegin);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + lungFragHead).replace('#include <color_fragment>', lungColor);
  };
  m.customProgramCacheKey = () => 'lung' + ghost;
  return m;
}
export function airwayMaterial(kind: 'wall' | 'cart', UU: LungUniforms = U) {
  const m = new THREE.MeshPhysicalMaterial({ color: kind === 'wall' ? '#d9a79c' : '#ece2d2', roughness: kind === 'wall' ? 0.45 : 0.6, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.3, sheenColor: new THREE.Color('#ffe4dc') });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, UU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aGen; uniform float uSpasm; varying float vW;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nfloat w = smoothstep(0.5, 2.5, aGen); vW = w; transformed -= objectNormal * uSpasm * w * ${kind === 'wall' ? '0.022' : '0.014'};`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uSpasm; varying float vW;')
      .replace('#include <color_fragment>', `#include <color_fragment>\n${kind === 'wall' ? 'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55,0.12,0.12), uSpasm * vW * 0.7);' : ''}`);
  };
  m.customProgramCacheKey = () => 'air' + kind;
  return m;
}
function diaphragmMaterial() {
  const m = new THREE.MeshPhysicalMaterial({ color: '#9a4a45', roughness: 0.5, sheen: 0.4, sheenColor: new THREE.Color('#ffc8c0'), clearcoat: 0.3 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aDome; uniform vec2 uS; uniform float uLungH; varying vec3 vObj; varying vec3 vObjN;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>\nfloat s = position.x < 0.0 ? uS.x : uS.y; transformed.y -= s * uLungH * 0.5 * (0.35 + 0.65 * aDome); vObj = position; vObjN = objectNormal;`);
    sh.uniforms.uTissue = { value: tissueTexture() };
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj; varying vec3 vObjN;\n' + GLSL_TRIPLANAR)
      .replace('#include <color_fragment>', `#include <color_fragment>\n{ float f = tri(vec3(vObj.x * 6.0, vObj.y, vObj.z * 6.0), vObjN, 0.8).g; diffuseColor.rgb *= 0.8 + 0.35 * f; }`);
  };
  return m;
}
function mucusMaterial(uniform: 'uMucus' | 'uPlug') {
  const m = new THREE.MeshPhysicalMaterial({ color: '#c8b46e', roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15, transmission: 0, transparent: true });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.uniforms.uTissue = { value: tissueTexture() };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj; varying vec3 vObjN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position; vObjN = objectNormal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>\nuniform float ${uniform}; varying vec3 vObj; varying vec3 vObjN;\n${GLSL_TRIPLANAR}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n{ float n = tri(vObj * 3.0, vObjN, 1.0).g; if (n < 1.0 - ${uniform} * 0.8) discard; diffuseColor.rgb *= 0.8 + 0.4 * n; }`);
  };
  m.customProgramCacheKey = () => 'mucus' + uniform;
  return m;
}

/* ------------------------------------------------------------------ scene */
export function LungScene({ asset }: { asset: RespAsset }) {
  return (
    <StudioCanvas camera={{ position: [0.6, 0.6, 9], fov: 30 }}>
      <Lungs asset={asset} />
      <Rig />
    </StudioCanvas>
  );
}

function Lungs({ asset }: { asset: RespAsset }) {
  const { meshes: M, mapping } = asset;
  const view = useUI((s) => s.ventView); const scId = useUI((s) => s.ventScenario); const flowDisplay = useUI((s) => s.ventFlowDisplay);
  const mats = useMemo(() => ({
    lung: lungMaterial(false), ghost: lungMaterial(true), wall: airwayMaterial('wall'), cart: airwayMaterial('cart'), dia: diaphragmMaterial(),
    ett: new THREE.MeshPhysicalMaterial({ color: '#e6eef2', roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.5, depthWrite: false }),
    cuff: new THREE.MeshPhysicalMaterial({ color: '#b8d4e6', roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.35, depthWrite: false }),
    heart: new THREE.MeshPhysicalMaterial({ color: '#7a2a2a', roughness: 0.45, clearcoat: 0.4, sheen: 0.3, sheenColor: new THREE.Color('#ffb0a0') }),
    vessel: new THREE.MeshPhysicalMaterial({ color: '#8a3a3c', roughness: 0.4, clearcoat: 0.4 }),
    larynx: new THREE.MeshPhysicalMaterial({ color: '#e9dfcf', roughness: 0.55, clearcoat: 0.3 }),
    skin: new THREE.MeshPhysicalMaterial({ color: '#c9b3a6', roughness: 0.8, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }),
    mucus: mucusMaterial('uMucus'), plug: mucusMaterial('uPlug'),
  }), []);
  const lobes = ['lung_RUL', 'lung_RML', 'lung_RLL', 'lung_LUL', 'lung_LLL'];
  useEffect(() => {
    const L = mapping.lobes; U.uHilR.value.set(...L.RUL.hilum); U.uHilL.value.set(...L.LUL.hilum);
    U.uLungH.value = mapping.lungBox.max[1] - mapping.lungBox.min[1];
  }, [mapping]);
  // translucent lungs to show the airways
  useEffect(() => {
    const x = view === 'airway';
    mats.lung.transparent = x; mats.lung.depthWrite = !x; mats.lung.needsUpdate = true; U.uOpacity.value = x ? 0.22 : 1;
  }, [view, mats]);

  // secretion column inside the ETT and a plug in the right main bronchus
  const ettLine = mapping.ett.centreline;
  const secretion = useMemo(() => {
    const pts = ettLine.slice(Math.floor(ettLine.length * 0.45)).map((p) => new THREE.Vector3(...p));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, mapping.ett.radius * 0.72, 12, false);
  }, [ettLine, mapping.ett.radius]);
  const plugPos = useMemo(() => { const c = new THREE.Vector3(...mapping.ett.carina); const h = new THREE.Vector3(...mapping.lobes.RUL.hilum); return c.clone().add(h.sub(c).normalize().multiplyScalar(0.2)); }, [mapping]);
  const plugGeo = useMemo(() => new THREE.IcosahedronGeometry(0.075, 4), []);

  // flow particles along the tube into the trachea
  const path = useMemo(() => [...ettLine, mapping.ett.carina], [ettLine, mapping.ett.carina]);
  // ETT exports contain overlapping tube-centreline segments. Reorder them by
  // actual superior-to-inferior position so bulk flow never jumps from carina
  // back to the top of the tube (the original particle path can stay optional).
  const airColumn = useMemo<FlowPoint[]>(() => {
    const sorted = [...ettLine].sort((a, b) => b[1] - a[1]);
    const reduced = sorted.filter((point, i) => i === 0 || Math.abs(point[1] - sorted[i - 1][1]) > 0.045);
    return [...reduced, mapping.ett.carina].map((p, i) => ({
      p: new THREE.Vector3(...p),
      r: i === reduced.length ? mapping.ett.trachealRadius : mapping.ett.radius,
    }));
  }, [ettLine, mapping.ett.carina, mapping.ett.radius, mapping.ett.trachealRadius]);
  const NP = IS_PHONE ? 36 : 64;
  const parts = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: NP }, (_, i) => ({ u: i / NP, r: Math.random(), a: Math.random() * Math.PI * 2 })), [NP]);
  const pmat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.8, depthWrite: false }), []);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), v: new THREE.Vector3(), c1: new THREE.Color('#cfe6ff'), c2: new THREE.Color('#f5c79b') }), []);
  const heart = useRef<THREE.Group>(null);

  useFrame((st, dtRaw) => {
    const dt = (window as unknown as { __instant?: boolean }).__instant ? 1 : Math.min(0.05, dtRaw); const m = session.m; const reg = m.regional();
    U.uTime.value += dt;
    for (let k = 0; k < 2; k++) {
      const V = m.V[k]; // litres above the relaxed (ZEEP) volume
      const s = (Math.cbrt(Math.max(0.2, (FRC[k] + V) / FRC[k])) - 1) * AMPLIFY;
      const key = k === 0 ? 'x' : 'y';
      U.uS.value[key] = s;
      const rec = m.lung.comps[k].recruitable; U.uClosed.value[key] = damp(U.uClosed.value[key], rec > 0 ? Math.min(0.95, (1 - reg[k].open) * 1.25) : 0, 6, dt);
      U.uOver.value[key] = damp(U.uOver.value[key], Math.min(1, reg[k].overdist / 6), 6, dt);
      U.uColl.value[key] = damp(U.uColl.value[key], reg[k].collapsed, 4, dt);
    }
    U.uSpasm.value = damp(U.uSpasm.value, session.spasmNow(), 5, dt);
    U.uMucus.value = damp(U.uMucus.value, session.sc.id === 'ett' ? Math.max(0, (m.lung.Rett - 4) / 14) : 0, 4, dt);
    U.uPlug.value = damp(U.uPlug.value, session.plugR != null && session.plugR > 20 ? 1 : 0, 4, dt);
    U.uWet.value = session.sc.id === 'edema' ? 0.6 : 0;
    if (heart.current) { const b = 1 + 0.018 * Math.max(0, Math.sin(st.clock.elapsedTime * 7.5)) ** 3; heart.current.scale.setScalar(b); }
    // particles
    const inst = parts.current; if (inst && flowDisplay !== 'volume') {
      const q = session.m.lastQ; const sp = q * 0.55; const col = q >= 0 ? tmp.c1 : tmp.c2;
      pmat.color.lerp(col, 0.2); pmat.opacity = Math.min(0.85, Math.abs(q) * 1.4);
      seeds.forEach((p, i) => {
        p.u = (p.u + sp * dt + 1) % 1;
        polylineAt(path, p.u, tmp.v);
        const rr = mapping.ett.radius * 0.55 * p.r; tmp.v.x += Math.cos(p.a) * rr; tmp.v.z += Math.sin(p.a) * rr;
        tmp.o.position.copy(tmp.v); tmp.o.scale.setScalar(IS_PHONE ? 1.2 : 1); tmp.o.updateMatrix(); inst.setMatrixAt(i, tmp.o.matrix);
      });
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  const has = (id: string) => !!M[id];
  return (
    <group position={[0, -0.25, 0]}>
      {lobes.map((id) => <mesh key={id} name={id} geometry={M[id].geometry} material={mats.lung} renderOrder={view === 'airway' ? 2 : 0} />)}
      {scId === 'ptx' && ['lung_RUL', 'lung_RML', 'lung_RLL'].map((id) => <mesh key={'g' + id} geometry={M[id].geometry} material={mats.ghost} renderOrder={3} />)}
      <mesh name="airway_wall" geometry={M.airway_wall.geometry} material={mats.wall} />
      {has('airway_cartilage') && <mesh name="airway_cartilage" geometry={M.airway_cartilage.geometry} material={mats.cart} />}
      {has('larynx') && <mesh name="larynx" geometry={M.larynx.geometry} material={mats.larynx} />}
      <mesh name="diaphragm" geometry={M.diaphragm.geometry} material={mats.dia} />
      <group ref={heart} position={[0, 0, 0]}>
        {has('heart') && <mesh name="heart" geometry={M.heart.geometry} material={mats.heart} />}
      </group>
      {has('great_vessels') && <mesh name="great_vessels" geometry={M.great_vessels.geometry} material={mats.vessel} />}
      <mesh name="ett" geometry={M.ett.geometry} material={mats.ett} renderOrder={4} />
      {has('ett_cuff') && <mesh name="ett_cuff" geometry={M.ett_cuff.geometry} material={mats.cuff} renderOrder={4} />}
      {scId === 'ett' && <mesh geometry={secretion} material={mats.mucus} renderOrder={3} />}
      {scId === 'plug' && <mesh geometry={plugGeo} material={mats.plug} position={plugPos} renderOrder={3} />}
      {has('chest_wall') && view !== 'airway' && <mesh name="chest_wall" geometry={M.chest_wall.geometry} material={mats.skin} renderOrder={5} />}
      {flowDisplay !== 'particles' && <VolumeFlow label="bulk-air-through-ett-and-trachea" path={airColumn}
        color="#a6e0ff" width={0.82} opacity={0.93} layer={6}
        sample={() => {
          const q = session.m.lastQ; const strength = Math.min(1, Math.abs(q) * 1.65);
          return { time: U.uTime.value, activity: Math.max(view === 'airway' ? 0.09 : 0, strength),
            direction: q >= 0 ? 1 : -1, speed: Math.min(2.3, Math.abs(q) * 1.2) };
        }}
      />}
      <instancedMesh visible={flowDisplay !== 'volume'} ref={parts} args={[new THREE.SphereGeometry(0.011, 8, 6), pmat, NP]} renderOrder={6} frustumCulled={false} />
      <Callouts asset={asset} plugPos={plugPos} />
    </group>
  );
}

function Callouts({ asset, plugPos }: { asset: RespAsset; plugPos: THREE.Vector3 }) {
  const scId = useUI((s) => s.ventScenario); const show = useUI((s) => s.labels);
  if (!show) return null;
  const mp = asset.mapping; const L = mp.lobes;
  const tag = (pos: THREE.Vector3 | [number, number, number], text: string, key: string) => (
    <Html key={key} position={pos as never} center distanceFactor={IS_PHONE ? 7 : 6} zIndexRange={[20, 0]}><LabelChip className="tag3d" text={text} /></Html>
  );
  const out: JSX.Element[] = [];
  if (scId === 'ett') out.push(tag(polylineAt(mp.ett.centreline, 0.75), 'Secretions narrow the tube', 'ett'));
  if (scId === 'plug') out.push(tag(plugPos, 'Mucus plug', 'plug'));
  if (scId === 'ptx') out.push(tag([L.RUL.hilum[0] - 0.75, 0.3, 0.2], 'Pleural air', 'ptx'));
  if (scId === 'ards' || scId === 'edema' || scId === 'obesity') out.push(tag([L.RLL.hilum[0] - 0.3, -0.55, -0.8], 'Dependent lung', 'dep'));
  return <>{out}</>;
}

/* ------------------------------------------------------------------ camera */
/** Views are directions + a framing box; the distance is solved from the canvas aspect so the lungs always fit. */
const VIEWS: Record<string, { dir: [number, number, number]; tgt: [number, number, number]; size: [number, number] }> = {
  front: { dir: [0.08, 0.1, 1], tgt: [0, 0.15, 0], size: [2.9, 3.4] },
  side: { dir: [-1, 0.1, 0.12], tgt: [0, 0.0, 0], size: [2.4, 3.0] },
  airway: { dir: [0.06, 0.12, 1], tgt: [0, 0.25, 0], size: [2.0, 2.4] },
  base: { dir: [0.3, -0.45, 1], tgt: [0, -0.5, 0], size: [2.8, 2.4] },
};
function Rig() {
  const three = useThree(); (window as unknown as Record<string, unknown>).__three = three;
  const ref = useRef<CameraControls>(null); const view = useUI((s) => s.ventView);
  const aspect = three.size.width / Math.max(1, three.size.height);
  useEffect(() => {
    if (!(aspect > 0.05) || !isFinite(aspect)) return;
    const v = VIEWS[view] ?? VIEWS.front; const cam = three.camera as THREE.PerspectiveCamera; const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.min(60, Math.max(v.size[1] / (2 * t), v.size[0] / (2 * t * aspect)) * 1.08 + 1.0);
    const d = new THREE.Vector3(...v.dir).normalize().multiplyScalar(dist);
    ref.current?.setLookAt(v.tgt[0] + d.x, v.tgt[1] + d.y, v.tgt[2] + d.z, ...v.tgt, !(window as unknown as { __instant?: boolean }).__instant);
  }, [view, aspect, three.camera]);
  return <CameraControls ref={ref} makeDefault minDistance={2} maxDistance={16} smoothTime={0.6} />;
}
