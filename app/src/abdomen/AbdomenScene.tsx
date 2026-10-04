/**
 * Reusable abdomen: HuBMAP solid organs from body.glb (liver, spleen, kidneys, pancreas, gallbladder,
 * colon, bladder, aorta, IVC) plus procedurally drawn stomach, small bowel, diaphragm and peritoneal
 * cavity, and pathology primitives driven by `AbdomenState`: free fluid pools (RUQ / LUQ / pelvis /
 * gutters), organ lacerations, retroperitoneal haematoma, AAA (diameter, rupture), free air, bowel
 * distension / ischaemia, pancreatitis.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import type { BodyAsset } from '../asset/body';
import { StudioCanvas, IS_PHONE } from '../scene/Studio';
import { LabelChip } from '../scene/labels';
import { tubeAlong, approach, frameDt } from '../scene/effects';
import { registerAnchors } from '../scene/cameraTargets';
import { useAbdUI, currentAbdomen } from './abdomenStore';
import { fluidDistribution, type AbdomenState } from './state';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const ORGANS: Record<string, { color: string; rough?: number; opacity?: number }> = {
  liver: { color: '#7a2a24' }, gallbladder: { color: '#4d6b3a' }, pancreas: { color: '#d8b48a' }, spleen: { color: '#6b2638' },
  kidney_L: { color: '#8b3a34' }, kidney_R: { color: '#8b3a34' }, bladder: { color: '#d7b9a6', opacity: 0.85 }, colon: { color: '#c9978a', opacity: 0.9 },
  aorta: { color: '#c0392b' }, vena_cava: { color: '#4b3a74' }, lung_R: { color: '#d59a92', opacity: 0.08 }, lung_L: { color: '#d59a92', opacity: 0.08 },
};
/** where things are (body decimetres) */
export const ABD = {
  whole: V(0.05, 2.4, 0.2), ruq: V(-0.78, 3.12, -0.12), luq: V(0.95, 3.35, -0.5), pelvis: V(0, 0.62, 0.1), gutterR: V(-1.05, 1.9, 0.15), gutterL: V(1.1, 1.9, 0.15),
  aaa: V(0.05, 2.25, -0.02), retro: V(0.42, 2.35, -0.45), liver: V(-0.45, 3.7, 0.2), spleen: V(0.82, 3.7, -0.37), pancreas: V(0.2, 3.4, 0.1), bowel: V(0, 1.8, 0.6), diaphragm: V(0, 4.3, 0.2),
};
registerAnchors('abdomen', () => ABD);
const FADEABLE = ['liver', 'gallbladder', 'bowel', 'stomach', 'colon', 'spleen'];
const HIDE: Record<string, string[]> = {
  'abdomen.ruq': ['liver', 'gallbladder', 'colon', 'bowel'], 'abdomen.luq': ['stomach', 'colon', 'bowel'], 'abdomen.pelvis': ['bowel', 'colon'],
  'abdomen.aorta': ['bowel', 'stomach', 'colon'], 'abdomen.retroperitoneum': ['bowel', 'stomach', 'colon'], 'abdomen.pancreas': ['bowel', 'stomach', 'colon'],
};

const blob = (() => { const g = mergeVertices(new THREE.IcosahedronGeometry(1, 5).deleteAttribute('normal').deleteAttribute('uv')); const p = g.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + 0.14 * Math.sin(v.x * 4.3 + v.y * 2.1) * Math.cos(v.z * 3.7 - v.y * 1.3); p.setXYZ(i, v.x * k, v.y * k, v.z * k); } g.computeVertexNormals(); return g; })();
const mlToR = (ml: number) => Math.cbrt((3 * Math.max(0, ml)) / (4 * Math.PI)) / 10; // mL (cm³) → dm radius

function Pathology({ st }: { st: AbdomenState }) {
  const d = fluidDistribution(st);
  const fluidColor = st.fluidKind === 'blood' ? '#b0101f' : st.fluidKind === 'enteric' ? '#8a7a3a' : '#d9c77a';
  const fluid = useMemo(() => new THREE.MeshPhysicalMaterial({ color: fluidColor, roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85, depthWrite: false, emissive: fluidColor, emissiveIntensity: 0.3 }), [fluidColor]);
  const retro = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#5a0a12', roughness: 0.5, transparent: true, opacity: 0.62, depthWrite: false }), []);
  const air = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#dff4ff', roughness: 0.05, transparent: true, opacity: 0.55, emissive: '#6fb7ff', emissiveIntensity: 0.4, depthWrite: false }), []);
  const aaaMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#c0392b', roughness: 0.4, clearcoat: 0.5, transparent: true, opacity: 0.9 }), []);
  const pool = (p: THREE.Vector3, ml: number, sx: number, sy: number, sz: number, key: string) => ml > 5 ? <mesh key={key} geometry={blob} material={fluid} position={p} scale={[mlToR(ml) * sx * 1.2, mlToR(ml) * sy * 1.2, mlToR(ml) * sz * 1.2]} renderOrder={5} /> : null;
  const aaaR = (st.aaa.diameterCm / 10 / 2) * 1.25;
  return (<group>
    {pool(ABD.ruq, d.ruq, 1.1, 1.4, 0.7, 'ruq')}{pool(ABD.luq, d.luq, 1.0, 1.3, 0.7, 'luq')}{pool(ABD.pelvis, d.pelvis, 1.5, 0.7, 1.1, 'pel')}
    {pool(ABD.gutterR, d.gutters / 2, 0.45, 2.2, 0.55, 'gr')}{pool(ABD.gutterL, d.gutters / 2, 0.45, 2.2, 0.55, 'gl')}
    {st.retroMl > 20 && <mesh geometry={blob} material={retro} position={ABD.retro} scale={[mlToR(st.retroMl) * 1.35, mlToR(st.retroMl) * 1.8, mlToR(st.retroMl) * 0.8]} renderOrder={4} />}
    {st.aaa.diameterCm > 2.5 && <mesh geometry={blob} material={aaaMat} position={ABD.aaa} scale={[aaaR, aaaR * 2.2, aaaR]} renderOrder={3} />}
    {st.freeAir && [-0.55, 0.5].map((x) => <mesh key={x} geometry={blob} material={air} position={[x, 4.28, 0.45]} scale={[0.38, 0.06, 0.3]} renderOrder={6} />)}
    {st.pancreatitis > 0.2 && <mesh geometry={blob} material={fluid} position={[0.25, 3.3, 0.3]} scale={[0.45 * st.pancreatitis, 0.12, 0.25]} renderOrder={5} />}
  </group>);
}

function Abdomen({ body }: { body: BodyAsset }) {
  const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes);
  const st = useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]);
  const mats = useMemo(() => Object.fromEntries(Object.entries(ORGANS).map(([k, o]) => [k, new THREE.MeshPhysicalMaterial({ color: o.color, roughness: o.rough ?? 0.45, clearcoat: 0.4, sheen: 0.4, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, depthWrite: (o.opacity ?? 1) >= 0.5 })])) as Record<string, THREE.MeshPhysicalMaterial>, []);
  const skin = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d6a88f', roughness: 0.6, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }), []);
  const bowelMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#e2aa9c', roughness: 0.42, clearcoat: 0.5, sheen: 0.5 }), []);
  const stomachMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d4a08c', roughness: 0.45, clearcoat: 0.5 }), []);
  const dia = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#c77a70', roughness: 0.5, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }), []);
  const perit = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#f0d6cc', roughness: 0.3, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }), []);
  const stomach = useMemo(() => tubeAlong([V(0.3, 4.15, 0.05), V(0.72, 4.05, 0.2), V(0.78, 3.7, 0.55), V(0.45, 3.35, 0.78), V(0.05, 3.3, 0.72), V(-0.22, 3.38, 0.5)], 0.3, 0.14, 18).geometry, []);
  // small bowel: a folded loop filling the central abdomen
  const bowelPts = useMemo(() => {
    // serpentine packed inside the colon frame: horizontal passes joined by U-turns, width limited by an ellipse
    const p: THREE.Vector3[] = []; const rows = 8, y0 = 2.75, y1 = 1.05, cy = (y0 + y1) / 2, ry = (y0 - y1) / 2 + 0.12;
    for (let r = 0; r < rows; r++) {
      const y = y0 - (r / (rows - 1)) * (y0 - y1); const w = 0.78 * Math.sqrt(Math.max(0.15, 1 - ((y - cy) / ry) ** 2)); const dir = r % 2 ? -1 : 1;
      for (let i = 0; i <= 26; i++) { const u = i / 26; const x = dir * (-w + 2 * w * u); p.push(V(x + 0.05, y + 0.05 * Math.sin(u * 9 + r), 0.62 + 0.14 * Math.sin(u * 7 + r * 1.7))); }
    }
    return p;
  }, []);
  // obstruction dilates the loops (thicker tube, same course); rebuilt only when the state changes
  const dil = Math.round(Math.min(1, st.distension + (st.obstruction === 'small' ? 0.3 : 0)) * 10) / 10;
  const bowelGeo = useMemo(() => tubeAlong(bowelPts, 0.1 * (1 + 0.8 * dil), 0.1 * (1 + 0.8 * dil), 12, 24).geometry, [bowelPts, dil]);
  useEffect(() => () => bowelGeo.dispose(), [bowelGeo]);
  // organs that stand between the camera and the space a view is about fade out of the way
  const target = useAbdUI((s) => s.target); const hide = HIDE[target] ?? []; const fade = useRef<Record<string, number>>({});
  useFrame((c, dtRaw) => {
    const dt = frameDt(dtRaw);
    const all: Record<string, THREE.MeshPhysicalMaterial> = { ...mats, bowel: bowelMat, stomach: stomachMat };
    for (const k of FADEABLE) { const m = all[k]; if (!m) continue; const base = ORGANS[k]?.opacity ?? 1; const f = (fade.current[k] = approach(fade.current[k] ?? 1, hide.includes(k) ? 0.18 : 1, 4, dt));
      m.transparent = true; m.opacity = base * f; m.depthWrite = base * f > 0.6; }
     bowelMat.color.set('#e2aa9c').lerp(new THREE.Color('#3a1a2a'), Math.min(1, st.ischaemia * 1.2));
    mats.pancreas.color.set('#d8b48a').lerp(new THREE.Color('#d0542e'), st.pancreatitis);
    const pulse = 0.5 + 0.5 * Math.sin(c.clock.elapsedTime * 5);
    for (const o of ['liver', 'spleen'] as const) { const g = st.injury[o] ?? 0; mats[o].emissive.set('#ff2a2a'); mats[o].emissiveIntensity = g > 0 ? 0.06 * g * pulse : 0; }
  });
  return (<group>
    <mesh geometry={body.meshes.skin.geometry} material={skin} renderOrder={9} />
    {Object.keys(ORGANS).filter((k) => body.meshes[k]).map((k) => <mesh key={k} geometry={body.meshes[k].geometry} material={mats[k]} renderOrder={k.startsWith('lung') ? 7 : 1} />)}
    <mesh geometry={stomach} material={stomachMat} />
    <mesh geometry={bowelGeo} material={bowelMat} />
    <mesh material={dia} position={[0, 3.75, 0.1]} scale={[1.55, 0.85, 1.2]} renderOrder={6}><sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42]} /></mesh>
    <mesh material={perit} position={[0, 2.3, 0.25]} scale={[1.45, 2.15, 1.05]} renderOrder={8}><sphereGeometry args={[1, 40, 28]} /></mesh>
    <Pathology st={st} />
    <Labels st={st} />
  </group>);
}

function Labels({ st }: { st: AbdomenState }) {
  const on = useAbdUI((s) => s.labels); if (!on) return null; const d = fluidDistribution(st);
  const tag = (p: THREE.Vector3, t: string, c = '', info?: string) => <Html key={info ?? t} position={p} center zIndexRange={[20, 0]}><LabelChip className={`tag3d tk ${c}`} text={t} info={info} important={c === 't-red' || !!info} /></Html>;
  return (<>
    {tag(V(-0.55, 4.05, 0.9), 'Liver')}{tag(V(1.15, 3.95, -0.3), 'Spleen')}{tag(V(0.55, 4.25, 0.55), 'Stomach')}{tag(V(0.3, 3.2, 0.4), 'Pancreas')}
    {!IS_PHONE && tag(V(-0.85, 2.7, -0.4), 'R kidney')}{!IS_PHONE && tag(V(0.95, 2.75, -0.5), 'L kidney')}{tag(V(0.25, 1.6, -0.1), 'Aorta', 't-art')}{!IS_PHONE && tag(V(-0.4, 1.6, -0.1), 'IVC', 't-ven')}
    {tag(V(0.0, 1.35, 0.95), 'Small bowel')}{!IS_PHONE && tag(V(1.25, 1.1, 0.7), 'Colon')}{tag(V(0.0, 0.25, 0.6), 'Bladder')}{!IS_PHONE && tag(V(-1.25, 4.35, 0.2), 'Diaphragm')}
    {d.ruq > 45 && tag(ABD.ruq.clone().add(V(-0.45, 0.15, 0.6)), 'Morison’s pouch', 't-red')}{d.luq > 45 && tag(ABD.luq.clone().add(V(0.3, -0.35, 0.3)), 'Splenorenal', 't-red')}{d.pelvis > 36 && tag(ABD.pelvis.clone().add(V(0.5, -0.1, 0.4)), 'Pelvic fluid', 't-red')}
    {st.retroMl > 200 && tag(ABD.retro.clone().add(V(0.6, -0.4, -0.2)), 'Retroperitoneal haematoma', 't-red')}
    {st.aaa.diameterCm > 3 && tag(ABD.aaa.clone().add(V(0.45, 0.2, 0.3)), `AAA ${st.aaa.diameterCm.toFixed(1)} cm`, 't-art', 'aaa')}
    {st.freeAir && tag(V(0, 4.55, 0.5), 'Free air', 't-teal', 'free air')}
  </>);
}

/** each view: what to look at, from which direction, and how much (w × h, dm) must fit on screen */
const VIEW: Record<string, { tgt: THREE.Vector3; dir: THREE.Vector3; size: [number, number] }> = {
  'abdomen.whole': { tgt: ABD.whole, dir: V(0.08, 0.1, 1), size: [3.3, 5.0] },
  'abdomen.ruq': { tgt: ABD.ruq, dir: V(-0.55, 0.05, 0.85), size: [2.2, 2.2] },
  'abdomen.luq': { tgt: ABD.luq, dir: V(0.8, 0.2, 0.6), size: [1.9, 1.9] },
  'abdomen.pelvis': { tgt: ABD.pelvis, dir: V(0.1, 0.45, 1), size: [2.0, 1.6] },
  'abdomen.aorta': { tgt: ABD.aaa, dir: V(0.45, 0.15, 1), size: [2.4, 3.0] },
  'abdomen.retroperitoneum': { tgt: ABD.retro, dir: V(0.8, 0.15, -1), size: [2.8, 2.8] },
  'abdomen.liver': { tgt: ABD.liver, dir: V(-0.5, 0.25, 1), size: [2.2, 2.0] },
  'abdomen.spleen': { tgt: ABD.spleen, dir: V(0.9, 0.2, 0.45), size: [1.6, 1.6] },
  'abdomen.pancreas': { tgt: ABD.pancreas, dir: V(0.1, 0.2, 1), size: [1.8, 1.4] },
  'abdomen.bowel': { tgt: ABD.bowel, dir: V(0.1, 0.15, 1), size: [2.4, 2.4] },
  'abdomen.diaphragm': { tgt: ABD.diaphragm, dir: V(0.1, 0.1, 1), size: [3.2, 1.6] },
};
function Rig() {
  const cc = useRef<CameraControls>(null); const target = useAbdUI((s) => s.target); const first = useRef(true);
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera; const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  useEffect(() => {
    const v = VIEW[target] ?? VIEW['abdomen.whole']; const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const dist = Math.max(v.size[1] / (2 * t), v.size[0] / (2 * t * aspect)) * 1.08 + 0.4; const p = v.dir.clone().normalize().multiplyScalar(dist).add(v.tgt);
    const instant = first.current || !!(window as unknown as { __instant?: boolean }).__instant;
    cc.current?.setLookAt(p.x, p.y, p.z, v.tgt.x, v.tgt.y, v.tgt.z, !instant); first.current = false;
  }, [target, aspect, cam]);
  return <CameraControls ref={cc} makeDefault minDistance={1} maxDistance={24} smoothTime={0.55} />;
}
export function AbdomenScene({ body }: { body: BodyAsset }) {
  return <StudioCanvas camera={{ position: [0.6, 3.0, 12], fov: 32 }} fog={false}><Abdomen body={body} /><Rig /></StudioCanvas>;
}
