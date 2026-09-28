/**
 * Labs 3D: a whole-body organ map (Visible Human) and, one click deeper, the microscopic
 * scene for the selected lab. Organs light up for the lab you pick; the cell scene draws the
 * ion / molecule counts, pump speed, cell volume, clot formation etc. from cellSpec().
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, Html } from '@react-three/drei';
import type { BodyAsset } from '../asset/body';
import type { MicroAsset } from '../asset/micro';
import { StudioCanvas, GLSL_TRIPLANAR, tissueTexture, IS_PHONE, damp } from '../scene/Studio';
import { makeGrid, marchingCubes, taubin } from '../scene/iso';
import { bench } from './bench';
import { cellSpec, type CellSpec, type Body } from './cellSpec';
import { LAB, LABS, type Organ } from '../knowledge/labs';
import { useLabUI } from './labStore';
import { NewCell, PATCH_OFF } from './cell/CellScene';
import { BloodScene } from './blood/BloodScene';
import { bloodKindOf } from './blood/model';
import { sceneOf, defaultCellType } from './cell/model';
import { CELL_DEFS } from './cell/anatomy/shapes';
import { resolveTarget } from '../scene/cameraTargets';
import { getCell } from './cell/whole';
import { live as cellLive } from './cell/live';

export const MICRO = new THREE.Vector3(40, 0, 0);
const instant = () => !!(window as unknown as { __instant?: boolean }).__instant;

export function LabScene({ body, micro }: { body: BodyAsset; micro: MicroAsset }) {
  return (
    <StudioCanvas camera={{ position: [0, 2, 26], fov: 30 }}>
      <Show when="body"><BodyMap body={body} /></Show>
      <Show when="cell"><group position={MICRO}><Micro micro={micro} /></group></Show>
      <Rig body={body} />
    </StudioCanvas>
  );
}

/** Draw only the view in use (plus the old one during the camera move). */
function Show({ when, children }: { when: 'body' | 'cell'; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null); const since = useRef(0); const v = useLabUI((s) => s.view);
  useEffect(() => { since.current = performance.now(); }, [v]);
  useFrame(() => { if (g.current) g.current.visible = useLabUI.getState().view === when || performance.now() - since.current < 1200; });
  return <group ref={g}>{children}</group>;
}

/* ================================================================== body map */
const ORGAN_COLOR: Record<string, string> = {
  brain: '#c9a39b', heart: '#8e2c2c', lung_R: '#d59a92', lung_L: '#d59a92', liver: '#6e2a22', gallbladder: '#4d6b3a', pancreas: '#d8b48a', spleen: '#6b2638',
  kidney_L: '#7d3328', kidney_R: '#7d3328', bladder: '#d7a58f', colon: '#c99a82', bone_marrow: '#e8dcc6', aorta: '#a3302a', vena_cava: '#3d2f63',
};
function BodyMap({ body }: { body: BodyAsset }) {
  const sel = useLabUI((s) => s.lab); const organs = LAB[sel]?.organs ?? [];
  const mats = useMemo(() => Object.fromEntries(Object.keys(ORGAN_COLOR).map((k) => [k, new THREE.MeshPhysicalMaterial({ color: ORGAN_COLOR[k], roughness: 0.45, clearcoat: 0.45, clearcoatRoughness: 0.3, sheen: 0.35, sheenColor: new THREE.Color('#ffd7cc'), transparent: true, opacity: 1 })])) as Record<string, THREE.MeshPhysicalMaterial>, []);
  const skin = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: '#d9c2b4', roughness: 0.7, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <output_fragment>', '#include <output_fragment>\n{ float f = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0); gl_FragColor.a = min(0.42, gl_FragColor.a + f * 0.3); }').replace('#include <opaque_fragment>', '#include <opaque_fragment>\n{ float f = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0); gl_FragColor.a = min(0.42, gl_FragColor.a + f * 0.3); }'); };
    return m;
  }, []);
  useFrame((st, dtRaw) => {
    const dt = instant() ? 1 : Math.min(0.05, dtRaw); const t = st.clock.elapsedTime;
    for (const [k, m] of Object.entries(mats)) {
      const on = organs.includes(k as Organ); m.opacity = damp(m.opacity, on ? 1 : 0.28, 5, dt); m.depthWrite = m.opacity > 0.9;
      m.emissive.set(on ? ORGAN_COLOR[k] : '#000000'); m.emissiveIntensity = on ? 0.18 + 0.1 * Math.sin(t * 2.2) : 0;
    }
  });
  const pick = (e: ThreeEvent<MouseEvent>, id: string) => { e.stopPropagation(); const first = LABS.find((l) => l.organs[0] === id) ?? LABS.find((l) => l.organs.includes(id as Organ)); if (first) useLabUI.getState().set({ lab: first.id }); };
  const M = body.meshes;
  return (
    <group>
      <mesh geometry={M.skin.geometry} material={skin} renderOrder={10} />
      {Object.keys(ORGAN_COLOR).filter((k) => M[k]).map((k) => <mesh key={k} geometry={M[k].geometry} material={mats[k]} onClick={(e) => pick(e, k)} onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }} onPointerOut={() => (document.body.style.cursor = '')} />)}
      {organs.slice(0, 1).map((o) => body.mapping.centres[o] && <Html key={o} position={body.mapping.centres[o] as never} center zIndexRange={[20, 0]}><div className="tag3d">{LAB[sel].abbr} · {o.replace('_', ' ').replace(/ [LR]$/, '')}</div></Html>)}
    </group>
  );
}

/* ================================================================== microscopic scene */
function blobGeometry(balls: { c: THREE.Vector3; r: number }[], h = 0.09, pad = 0.6) {
  const box = new THREE.Box3(); balls.forEach((b) => box.union(new THREE.Box3(b.c.clone().subScalar(b.r + pad), b.c.clone().addScalar(b.r + pad))));
  const g = makeGrid(box, h, 1); const p = new THREE.Vector3();
  for (let k = 0; k < g.nz; k++) for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) { p.set(g.origin.x + i * h, g.origin.y + j * h, g.origin.z + k * h); let f = 0; for (const b of balls) f += (b.r * b.r) / Math.max(1e-4, p.distanceToSquared(b.c)); g.f[i + g.nx * (j + g.ny * k)] = f; }
  const geo = marchingCubes(g, 1); taubin(geo, 3); return geo;
}
function tube(pts: THREE.Vector3[], r: number, seg = 40) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 12, false); }

function membraneMat(color: string, opacity: number) {
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.6, sheenColor: new THREE.Color('#ffffff'), transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => { sh.uniforms.uTissue = { value: tissueTexture() };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj; varying vec3 vObjN;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvObj = position; vObjN = objectNormal;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vObj; varying vec3 vObjN;\n' + GLSL_TRIPLANAR).replace('#include <color_fragment>', '#include <color_fragment>\n{ vec4 t = tri(vObj, vObjN, 0.35); diffuseColor.rgb *= 0.82 + 0.35 * t.g; }'); };
  return m;
}

function Micro({ micro }: { micro: MicroAsset }) {
  const sel = useLabUI((s) => s.lab); const scene = sceneOf(sel);
  if (scene) return <NewCell key={scene} story={scene} />;
  if (bloodKindOf(sel)) return <BloodScene micro={micro} />;
  return <LegacyMicro micro={micro} sel={sel} />;
}
function LegacyMicro({ micro, sel }: { micro: MicroAsset; sel: string }) {
  const bodyKind: Body = cellSpec(sel, bench.snap, bench.pt).body;
  const specRef = useRef<CellSpec>(cellSpec(sel, bench.snap, bench.pt));
  useFrame(() => { specRef.current = cellSpec(useLabUI.getState().lab, bench.snap, bench.pt); });
  return (
    <group>
      {bodyKind === 'cell' && <CellBody spec={specRef} />}
      {bodyKind === 'neuron' && <NeuronBody spec={specRef} />}
      {(bodyKind === 'vessel' || bodyKind === 'clot') && <VesselBody spec={specRef} micro={micro} clot={bodyKind === 'clot'} />}
      {bodyKind === 'nephron' && <NephronBody spec={specRef} />}
      {bodyKind === 'hepato' && <HepatoBody spec={specRef} micro={micro} />}
      {bodyKind === 'myocyte' && <MyocyteBody spec={specRef} />}
      <Particles spec={specRef} kind={bodyKind} key={sel} />
      <LegacyLabels kind={bodyKind} spec={specRef} />
    </group>
  );
}
type SpecRef = React.MutableRefObject<CellSpec>;

const LEGACY_LABELS: Partial<Record<Body, [string, [number, number, number]][]>> = {
  cell: [['Cell membrane', [0.2, 1.55, 0.3]], ['Nucleus', [0.15, 0.2, 0.5]], ['Mitochondria (make ATP)', [0.95, -0.55, 0.6]], ['Na⁺/K⁺ pumps (in the membrane)', [-1.5, -0.6, 0.6]], ['Outside the cell', [2.7, 1.2, 0]]],
  neuron: [['Neuron cell body', [0.3, 1.2, 0.3]], ['Nucleus', [0, 0, 0.45]], ['Dendrites', [2.2, 0.6, 0.3]], ['Fluid around the cell', [2.6, -1.4, 0]]],
  nephron: [['Glomerulus (capillary loops)', [0, 0.9, 0.6]], ['Bowman’s capsule', [0.6, -1.2, 0.6]], ['Afferent arteriole (blood in)', [-2.2, 1.0, 0]], ['Efferent arteriole (blood out)', [-2.0, 2.0, 0.3]], ['Tubule — filtrate → urine', [2.9, -1.6, 0.3]]],
  hepato: [['Hepatocytes (liver cells)', [-1, 1.55, 0]], ['Sinusoid (blood)', [1.8, -1.05, 0.4]], ['Bile canaliculus', [3.1, 1.05, -0.62]], ['Injured cells leak AST/ALT', [-2.6, 0.1, 0.5]]],
  myocyte: [['Cardiac muscle cells', [-0.4, 1.25, 0.2]], ['Striations (sarcomeres)', [1.4, -1.2, 0.3]], ['Blood around the cells', [2.8, 0.9, 0.6]]],
};
function LegacyLabels({ kind, spec }: { kind: Body; spec: SpecRef }) {
  const on = useLabUI((s) => s.labelsOn); const list = LEGACY_LABELS[kind]; const hurtRef = useRef<THREE.Group>(null);
  useFrame(() => { if (hurtRef.current) hurtRef.current.visible = spec.current.injury > 0.05; });
  if (!on || !list) return null;
  return <group>{list.map(([t, p]) => { const hurt = t.startsWith('Injured'); return <group key={t} position={p} ref={hurt ? hurtRef : undefined}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div className={`blabel${hurt ? ' b-bad' : ''}`}>{t}</div></Html></group>; })}</group>;
}

/* ------------------------------------------------------------------ generic cell (electrolytes, metabolism) */
function CellBody({ spec }: { spec: SpecRef }) {
  const geo = useMemo(() => blobGeometry([{ c: new THREE.Vector3(0, 0, 0), r: 1.25 }, { c: new THREE.Vector3(0.9, 0.25, 0.1), r: 0.9 }, { c: new THREE.Vector3(-0.85, -0.2, -0.1), r: 0.95 }, { c: new THREE.Vector3(0.1, -0.5, 0.6), r: 0.8 }]), []);
  const nucGeo = useMemo(() => blobGeometry([{ c: new THREE.Vector3(0.1, 0.1, 0), r: 0.5 }, { c: new THREE.Vector3(0.35, 0.2, 0.1), r: 0.35 }], 0.06, 0.3), []);
  const mem = useMemo(() => membraneMat('#e7b2a8', 0.32), []); const nuc = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#6f4a86', roughness: 0.4, clearcoat: 0.5 }), []);
  // pumps embedded in the membrane
  const pumps = useMemo(() => { const pos = geo.attributes.position; const out: THREE.Object3D[] = []; for (let i = 0; i < 70; i++) { const k = Math.floor((i / 70) * pos.count); const o = new THREE.Object3D(); const p = new THREE.Vector3().fromBufferAttribute(pos, k); const n = new THREE.Vector3().fromBufferAttribute(geo.attributes.normal, k); o.position.copy(p); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); out.push(o); } return out; }, [geo]);
  const pumpRef = useRef<THREE.InstancedMesh>(null); const pumpMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9c7a0', roughness: 0.35, metalness: 0.1, emissive: new THREE.Color('#ffb347'), emissiveIntensity: 0.1 }), []);
  const mito = useMemo(() => Array.from({ length: 14 }, () => { const v = new THREE.Vector3().randomDirection().multiplyScalar(0.7 + Math.random() * 0.5); return { p: v, r: new THREE.Euler(Math.random() * 3, Math.random() * 3, 0) }; }), []);
  const mitoRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => { const inst = mitoRef.current; if (!inst) return; const o = new THREE.Object3D(); mito.forEach((m, i) => { o.position.copy(m.p); o.rotation.copy(m.r); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); }); inst.instanceMatrix.needsUpdate = true; }, [mito]);
  const spin = useRef(0);
  useFrame((st, dt) => {
    const s = spec.current; const inst = pumpRef.current; if (!inst) return; spin.current += dt * 3 * s.pump;
    pumps.forEach((o, i) => { o.rotation.y = 0; const q = o.quaternion.clone(); o.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), spin.current + i)); o.updateMatrix(); inst.setMatrixAt(i, o.matrix); o.quaternion.copy(q); });
    inst.instanceMatrix.needsUpdate = true; pumpMat.emissiveIntensity = 0.08 + 0.25 * Math.min(1, (s.pump - 1) / 1.5);
    mem.color.setRGB(0.9, 0.66 - 0.25 * s.depol, 0.62 - 0.25 * s.depol);
  });
  return (<group>
    <mesh geometry={geo} material={mem} renderOrder={4} />
    <mesh geometry={nucGeo} material={nuc} />
    <instancedMesh ref={mitoRef} args={[new THREE.CapsuleGeometry(0.07, 0.22, 4, 10), new THREE.MeshStandardMaterial({ color: '#d98b5b', roughness: 0.4 }), mito.length]} />
    <instancedMesh ref={pumpRef} args={[new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), pumpMat, pumps.length]} />
  </group>);
}

/* ------------------------------------------------------------------ neuron (sodium / water) */
function NeuronBody({ spec }: { spec: SpecRef }) {
  const geo = useMemo(() => {
    const soma = blobGeometry([{ c: new THREE.Vector3(0, 0, 0), r: 1.0 }, { c: new THREE.Vector3(0, 0.6, 0), r: 0.55 }], 0.07, 0.5);
    const dend = [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 + 0.4; const d = new THREE.Vector3(Math.cos(a), (i % 2 ? -0.35 : 0.45), Math.sin(a)).normalize(); const pts = [d.clone().multiplyScalar(0.7), d.clone().multiplyScalar(1.6).add(new THREE.Vector3(0, 0.2 * Math.sin(i), 0)), d.clone().multiplyScalar(2.6).add(new THREE.Vector3(0.2 * Math.cos(i), -0.1, 0.2))]; const g = tube(pts, 0.12, 30); const pos = g.attributes.position; const cc = new THREE.CatmullRomCurve3(pts); for (let s = 0; s <= 30; s++) { const c = cc.getPointAt(s / 30); const f = 1 - 0.75 * (s / 30); for (let k = 0; k <= 12; k++) { const idx = s * 13 + k; const v = new THREE.Vector3().fromBufferAttribute(pos, idx).sub(c).multiplyScalar(f).add(c); pos.setXYZ(idx, v.x, v.y, v.z); } } g.computeVertexNormals(); return g; });
    return [soma, ...dend];
  }, []);
  const mem = useMemo(() => membraneMat('#d8b9c9', 0.45), []); const nuc = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#5a4b8a', roughness: 0.4 }), []);
  const g = useRef<THREE.Group>(null); const sc = useRef(1);
  useFrame((_, dtRaw) => { const dt = instant() ? 1 : Math.min(0.05, dtRaw); sc.current = damp(sc.current, spec.current.cellScale, 2, dt); const k = Math.cbrt(Math.max(0.6, Math.min(1.5, sc.current))) ** 1.8; g.current?.scale.setScalar(k); mem.color.setRGB(0.85, 0.72 - 0.3 * Math.max(0, sc.current - 1) * 3, 0.78); });
  return <group ref={g}>{geo.map((x, i) => <mesh key={i} geometry={x} material={mem} renderOrder={4} />)}<mesh material={nuc}><sphereGeometry args={[0.38, 32, 24]} /></mesh></group>;
}

/* ------------------------------------------------------------------ vessel (blood count) and clot */
function VesselBody({ spec, micro, clot }: { spec: SpecRef; micro: MicroAsset; clot: boolean }) {
  const L = 7, R = 1.25;
  const wallGeo = useMemo(() => { const g = new THREE.CylinderGeometry(R, R, L, 64, 12, true); g.rotateZ(Math.PI / 2); return g; }, []); // full tube; only the far (inner) wall is drawn
  const wall = useMemo(() => { const m = membraneMat('#c98f86', 0.85); m.side = THREE.BackSide; m.depthWrite = true; m.transparent = false; return m; }, []);
  const rbcGeo = useMemo(() => { const g = micro.meshes.rbc.geometry.clone(); g.scale(10, 10, 10); return g; }, [micro]);
  const N = 70, NW = 12, NP = 60;
  const cells = useMemo(() => Array.from({ length: N + NW + NP }, (_, i) => ({ x: Math.random() * L - L / 2, r: Math.sqrt(Math.random()) * (R - 0.45), a: Math.random() * Math.PI * 2, sp: 0.6 + Math.random() * 0.5, spin: Math.random() * 6, stick: Math.random() })), []);
  const rbcRef = useRef<THREE.InstancedMesh>(null), wbcRef = useRef<THREE.InstancedMesh>(null), pltRef = useRef<THREE.InstancedMesh>(null);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#b3160f', roughness: 0.35, clearcoat: 0.6, sheen: 0.5, sheenColor: new THREE.Color('#ff9a8a') }), []);
  const fibRef = useRef<THREE.LineSegments>(null); const clotT = useRef(0);
  const fibGeo = useMemo(() => { const n = 260; const pos = new Float32Array(n * 6); for (let i = 0; i < n; i++) { const a = new THREE.Vector3((Math.random() - 0.5) * 1.6, -R + 0.05 + Math.random() * 0.9, (Math.random() - 0.3) * 1.4); const b = a.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(0.3 + Math.random() * 0.5)); pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); return g; }, []);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color() }), []);
  useFrame((st, dtRaw) => {
    const dt = Math.min(0.05, dtRaw); const s = spec.current; const t = st.clock.elapsedTime;
    const nR = Math.round(N * Math.min(1.3, s.rbc)), nW = Math.min(NW, Math.round(2 * s.wbc)), nP = Math.min(NP, Math.round(18 * s.plt));
    if (clot) { clotT.current += dt * 0.12 * s.clotSpeed; if (clotT.current > 1.4) clotT.current = 0; }
    const sat = s.rbcSat; rbcMat.color.setRGB(0.06 + 0.66 * Math.max(0, (sat - 0.55) / 0.44) ** 1.5, 0.012, 0.1 - 0.07 * Math.max(0, (sat - 0.55) / 0.44));
    const put = (ref: THREE.InstancedMesh | null, from: number, count: number, max: number, scale: number, stickPlate = false) => {
      if (!ref) return;
      for (let i = 0; i < max; i++) {
        const c = cells[from + i]; const vis = i < count;
        c.x += dt * c.sp * (clot ? 0.45 : 1); if (c.x > L / 2) c.x -= L;
        let x = c.x, y = Math.sin(c.a) * c.r, z = Math.cos(c.a) * c.r;
        if (stickPlate && clot && c.stick < 0.75) { const f = Math.min(1, clotT.current * 1.6); x = (c.stick - 0.37) * 2.2 * (1 - 0.3 * f) + 0.0; y = -R + 0.1 + c.r * 0.35 * f; z = (c.a / Math.PI - 1) * 0.7; }
        tmp.o.position.set(x, y, z); tmp.o.rotation.set(c.spin + t * 0.6, c.spin, 0); tmp.o.scale.setScalar(vis ? scale : 0.0001); tmp.o.updateMatrix(); ref.setMatrixAt(i, tmp.o.matrix);
      }
      ref.instanceMatrix.needsUpdate = true;
    };
    put(rbcRef.current, 0, nR, N, 1); put(wbcRef.current, N, nW, NW, 1); put(pltRef.current, N + NW, nP, NP, 1, true);
    if (fibRef.current) { const f = clot ? Math.max(0, Math.min(1, (clotT.current - 0.25) * 1.5)) : 0; fibGeo.setDrawRange(0, Math.floor(260 * Math.min(1, s.fibrin * 0.6) * f) * 2); (fibRef.current.material as THREE.LineBasicMaterial).opacity = 0.35 + 0.4 * Math.min(1, s.fibrin); }
  });
  return (<group>
    <mesh geometry={wallGeo} material={wall} />
    {clot && <mesh position={[0, -R + 0.02, 0.2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.6, 0.35]} /><meshStandardMaterial color="#5a1010" roughness={0.8} /></mesh>}
    <instancedMesh ref={rbcRef} args={[rbcGeo, rbcMat, N]} frustumCulled={false} />
    <instancedMesh ref={wbcRef} args={[new THREE.IcosahedronGeometry(0.62, 3), new THREE.MeshPhysicalMaterial({ color: '#eee6f2', roughness: 0.55, transparent: true, opacity: 0.9, clearcoat: 0.3 }), NW]} frustumCulled={false} />
    <instancedMesh ref={pltRef} args={[new THREE.CylinderGeometry(0.16, 0.16, 0.05, 14), new THREE.MeshStandardMaterial({ color: '#e9d7a8', roughness: 0.4 }), NP]} frustumCulled={false} />
    <lineSegments ref={fibRef} geometry={fibGeo}><lineBasicMaterial color="#f3ead3" transparent opacity={0.6} /></lineSegments>
  </group>);
}

/* ------------------------------------------------------------------ glomerulus */
function NephronBody({ spec }: { spec: SpecRef }) {
  const loops = useMemo(() => { const gs: THREE.BufferGeometry[] = []; for (let i = 0; i < 16; i++) { const ax = new THREE.Vector3().randomDirection(); const u = new THREE.Vector3(0, 1, 0).cross(ax).normalize(); const w = ax.clone().cross(u); const r = 0.55 + Math.random() * 0.3; const pts = Array.from({ length: 16 }, (_, k) => { const a = (k / 15) * Math.PI * 1.6; return u.clone().multiplyScalar(Math.cos(a) * r).add(w.clone().multiplyScalar(Math.sin(a) * r)).add(ax.clone().multiplyScalar(0.2 * Math.sin(a * 2))); }); gs.push(tube(pts, 0.07, 40)); } gs.push(tube([new THREE.Vector3(-2.8, 1.4, 0), new THREE.Vector3(-1.2, 0.8, 0), new THREE.Vector3(-0.3, 0.2, 0)], 0.16), tube([new THREE.Vector3(-0.2, 0.35, 0.1), new THREE.Vector3(-1.1, 1.3, 0.2), new THREE.Vector3(-2.6, 2.0, 0.3)], 0.12)); return gs; }, []);
  const cap = useMemo(() => { const g = new THREE.SphereGeometry(1.35, 48, 32, 0, Math.PI * 2, 0.55, Math.PI - 0.55); g.rotateZ(Math.PI * 0.72); return g; }, []);
  const tubule = useMemo(() => tube([new THREE.Vector3(1.1, -0.7, 0), new THREE.Vector3(2.0, -1.2, 0.2), new THREE.Vector3(2.9, -0.8, -0.3), new THREE.Vector3(3.6, -1.6, 0)], 0.28), []);
  const cm = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#9b1e1a', roughness: 0.35, clearcoat: 0.6 }), []);
  const bm = useMemo(() => membraneMat('#e3c3b5', 0.25), []);
  useFrame(() => { cm.color.setRGB(0.6 * (0.6 + 0.4 * spec.current.gfr), 0.1, 0.1); });
  return (<group>{loops.map((g, i) => <mesh key={i} geometry={g} material={cm} />)}<mesh geometry={cap} material={bm} renderOrder={4} /><mesh geometry={tubule} material={bm} renderOrder={4} /></group>);
}

/* ------------------------------------------------------------------ liver plate */
function HepatoBody({ spec, micro }: { spec: SpecRef; micro: MicroAsset }) {
  const cells = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ c: new THREE.Vector3(-3 + i, 0.75, 0), geo: blobGeometry([{ c: new THREE.Vector3(0, 0, 0), r: 0.62 }, { c: new THREE.Vector3(0.18, 0.12, 0.1), r: 0.45 }, { c: new THREE.Vector3(-0.15, -0.1, -0.1), r: 0.48 }], 0.06, 0.35) })), []);
  const sin = useMemo(() => tube([new THREE.Vector3(-4, -0.45, 0), new THREE.Vector3(0, -0.5, 0.05), new THREE.Vector3(4, -0.45, 0)], 0.42, 60), []);
  const canal = useMemo(() => tube([new THREE.Vector3(-4, 0.75, -0.62), new THREE.Vector3(4, 0.75, -0.62)], 0.08, 40), []);
  const hm = useMemo(() => cells.map(() => membraneMat('#b8765e', 0.85)), [cells]); const sm = useMemo(() => membraneMat('#c98f86', 0.3), []);
  const bileM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#b8a64a', roughness: 0.3, clearcoat: 0.8 }), []);
  useFrame(() => { const s = spec.current; hm.forEach((m, i) => { const hurt = i / 7 < s.injury; m.color.set(hurt ? '#8a4a3c' : '#b8765e'); m.opacity = hurt ? 0.55 : 0.85; }); bileM.color.setRGB(0.55 + 0.35 * s.bile, 0.5 + 0.1 * s.bile, 0.18); void micro; });
  return (<group>{cells.map((c, i) => <mesh key={i} geometry={c.geo} material={hm[i]} position={c.c} renderOrder={3} />)}<mesh geometry={sin} material={sm} renderOrder={4} /><mesh geometry={canal} material={bileM} /></group>);
}

/* ------------------------------------------------------------------ cardiac muscle */
function MyocyteBody({ spec }: { spec: SpecRef }) {
  const cells = useMemo(() => { const out: THREE.BufferGeometry[] = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const y = (r - 1) * 0.75, x0 = c * 2.4 - 2.4 + (r % 2) * 0.8; out.push(blobGeometry([0, 1, 2, 3].map((k) => ({ c: new THREE.Vector3(x0 + k * 0.55, y + 0.05 * Math.sin(k + r), 0), r: 0.36 })).concat([{ c: new THREE.Vector3(x0 + 1.2, y + 0.4, 0.05), r: 0.2 }]), 0.06, 0.3)); } return out; }, []);
  const mats = useMemo(() => cells.map(() => { const m = new THREE.MeshPhysicalMaterial({ color: '#9b3b3b', roughness: 0.45, clearcoat: 0.3, transparent: true, opacity: 0.85 }); m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvO = position;'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= 0.78 + 0.3 * smoothstep(0.2, 0.9, 0.5 + 0.5 * sin(vO.x * 34.0));'); }; return m; }), [cells]);
  const g = useRef<THREE.Group>(null);
  useFrame((st) => { const s = spec.current; mats.forEach((m, i) => { const hurt = i / mats.length < s.injury; m.color.set(hurt ? '#5c2a2a' : '#9b3b3b'); m.opacity = hurt ? 0.6 : 0.85; }); if (g.current) { g.current.scale.set(1 + 0.25 * s.stretch, 1, 1); g.current.position.y = 0.02 * Math.sin(st.clock.elapsedTime * 7); } });
  return <group ref={g}>{cells.map((c, i) => <mesh key={i} geometry={c} material={mats[i]} renderOrder={3} />)}</group>;
}

/* ------------------------------------------------------------------ particles (ions, molecules) */
const COUNT = (conc: number, ref: number) => Math.round(Math.min(160, Math.max(0, 40 * Math.log2(1 + conc / ref))));
function Particles({ spec, kind }: { spec: SpecRef; kind: Body }) {
  const MAX = 900;
  const data = useMemo(() => {
    const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3), vis = new Float32Array(MAX), size = new Float32Array(MAX);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.setAttribute('aVis', new THREE.BufferAttribute(vis, 1)); geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, vertexColors: true, uniforms: { uSize: { value: IS_PHONE ? 70 : 90 } },
      vertexShader: 'attribute float aVis; attribute float aSize; varying float vA; varying vec3 vC; uniform float uSize; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * aSize * aVis / -mv.z; vA = aVis; vC = color; }',
      fragmentShader: 'varying float vA; varying vec3 vC; void main(){ vec2 d = gl_PointCoord - 0.5; float r = dot(d,d); if (r > 0.25) discard; gl_FragColor = vec4(vC * (0.85 + 0.4 * (0.25 - r) * 4.0), smoothstep(0.25, 0.03, r) * step(0.01, vA)); }' });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 8;
    const seeds = Array.from({ length: MAX }, () => ({ u: new THREE.Vector3().randomDirection(), r: Math.random(), ph: Math.random() * 10, x: Math.random() }));
    return { pts, pos, col, vis, size, geo, seeds };
  }, []);
  const c = useMemo(() => new THREE.Color(), []);
  useFrame((st) => {
    const s = spec.current; const t = st.clock.elapsedTime; let j = 0;
    const inR = kind === 'neuron' ? 0.9 * Math.cbrt(s.cellScale) ** 1.8 : kind === 'cell' ? 1.2 : 0.8; const outA = kind === 'neuron' ? 1.9 : 2.0, outB = 3.4;
    for (const sp of s.species) {
      const ref = sp.key === 'k' ? 4.5 : sp.key === 'na' ? 60 : sp.key === 'ca' ? 0.6 : sp.key === 'w' ? 30 : 2;
      const nIn = COUNT(sp.inside, sp.key === 'k' ? 30 : ref), nOut = COUNT(sp.outside, ref); c.set(sp.color);
      const place = (n: number, inside: boolean) => {
        for (let i = 0; i < n && j < MAX; i++, j++) {
          const sd = data.seeds[j]; let p: THREE.Vector3;
          if (kind === 'vessel' || kind === 'clot') p = new THREE.Vector3(((sd.x * 7 + t * 0.6) % 7) - 3.5, sd.u.y * 0.8, sd.u.z * 0.8);
          else if (kind === 'hepato') p = inside ? new THREE.Vector3(-3 + Math.floor(sd.x * 7) + sd.u.x * 0.35, 0.75 + sd.u.y * 0.35, sd.u.z * 0.35) : new THREE.Vector3(((sd.x * 8 + t * 0.4) % 8) - 4, -0.45 + sd.u.y * 0.3, sd.u.z * 0.3);
          else if (kind === 'myocyte') p = inside ? new THREE.Vector3(sd.x * 4.8 - 2.6, (Math.floor(sd.r * 3) - 1) * 0.75 + sd.u.y * 0.2, sd.u.z * 0.2) : sd.u.clone().multiplyScalar(1.4 + sd.r * 1.6).add(new THREE.Vector3(0, 0, 0.6));
          else if (kind === 'nephron') p = inside ? new THREE.Vector3(1.1 + sd.x * 2.6, -0.8 - 0.4 * Math.sin(sd.x * 3) + sd.u.y * 0.15, sd.u.z * 0.15) : sd.u.clone().multiplyScalar(0.3 + sd.r * 0.6);
          else { const rr = inside ? inR * Math.cbrt(sd.r) : outA + (outB - outA) * sd.r; p = sd.u.clone().multiplyScalar(rr); }
          // crossing: a fraction of outside particles drift through the membrane (direction by sign)
          if (!inside && sp.cross !== 0 && sd.r < Math.abs(sp.cross) * 0.5 && kind !== 'vessel') { const f = (t * 0.25 + sd.ph) % 1; const e = sp.cross > 0 ? f : 1 - f; p.multiplyScalar(1 - e * 0.6); }
          // calcium shield: Ca²⁺ gathers at the membrane surface when stabilised
          if (sp.key === 'ca' && !inside && sd.r < s.caShield * 0.8) p.setLength(inR + 0.35 + 0.05 * Math.sin(t + sd.ph));
          // filtration: creatinine / urea flow into the tubule at the GFR
          if (kind === 'nephron' && inside) { const f = (t * 0.3 * s.gfr + sd.ph) % 1; p.x = 1.1 + f * 2.6; }
          if (kind === 'hepato' && inside && sp.key === 'enz') { const hurt = (p.x + 3.5) / 7 < s.injury; if (!hurt) { data.vis[j] = 0; continue; } const f = (t * 0.3 + sd.ph) % 1; p.y -= f * 1.1; }
          const w = 0.035; p.x += Math.sin(t * 1.3 + sd.ph) * w; p.y += Math.cos(t * 1.1 + sd.ph * 2) * w; p.z += Math.sin(t * 0.9 + sd.ph * 3) * w;
          data.pos.set([p.x, p.y, p.z], j * 3); data.col.set([c.r, c.g, c.b], j * 3); data.vis[j] = 1; data.size[j] = sp.size ?? 1;
        }
      };
      if (kind === 'nephron') { place(Math.round(nOut * 0.6), false); place(Math.round(Math.min(nOut, 60) * s.gfr), true); }
      else if (kind === 'hepato' && sp.key === 'enz') { place(Math.round(40 * s.injury), true); place(nOut, false); }
      else { place(nIn, true); place(nOut, false); }
    }
    for (; j < MAX; j++) data.vis[j] = 0;
    data.geo.attributes.position.needsUpdate = true; data.geo.attributes.color.needsUpdate = true; (data.geo.getAttribute('aVis') as THREE.BufferAttribute).needsUpdate = true; (data.geo.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
  });
  return <primitive object={data.pts} />;
}

/* ================================================================== camera */
function Rig({ body }: { body: BodyAsset }) {
  const three = useThree(); (window as unknown as Record<string, unknown>).__three = three; const ref = useRef<CameraControls>(null);
  const view = useLabUI((s) => s.view); const sel = useLabUI((s) => s.lab); const cellView = useLabUI((s) => s.cellView); const cellType = useLabUI((s) => s.cellType); const target = useLabUI((s) => s.cameraTargetId); const aspect = three.size.width / Math.max(1, three.size.height);
  useEffect(() => {
    if (!(aspect > 0.05)) return; const cam = three.camera as THREE.PerspectiveCamera; const t = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    let tgt: THREE.Vector3, size: [number, number], dir: THREE.Vector3;
    const scene = sceneOf(sel); let jump = false;
    const narrow = aspect < 0.9;
    if (view === 'cell' && scene && resolveTarget(cellView === 'zoom' ? 'membrane.overview' : 'cell.whole')?.view === 'zoom') { tgt = MICRO.clone().add(PATCH_OFF).add(new THREE.Vector3(0, narrow ? 0.1 : -0.2, 0)); size = narrow ? [10.6, 7] : [13.6, 9.6]; dir = new THREE.Vector3(0.0, 0.2, 1); jump = true; }
    else if (view === 'cell' && scene) { const def = CELL_DEFS[cellType ?? defaultCellType(sel)]; tgt = MICRO.clone().add(new THREE.Vector3(def.centre[0], def.cut - 0.25, def.centre[1])); size = narrow ? def.frame.narrow : def.frame.wide; dir = new THREE.Vector3(0.1, 0.95, 1); jump = useLabUI.getState().veil > 0.5; }
    else if (view === 'cell' && bloodKindOf(sel)) { tgt = MICRO.clone().add(new THREE.Vector3(0, narrow ? -0.3 : -0.35, 0)); size = narrow ? [8.4, 5.5] : [9.6, 6.4]; dir = new THREE.Vector3(0.12, 0.32, 1); }
    else if (view === 'cell') { tgt = MICRO.clone(); size = [8, 6.5]; dir = new THREE.Vector3(0.25, 0.3, 1); }
    else { const o = LAB[sel]?.organs[0]; const c = o && body.mapping.centres[o] ? new THREE.Vector3(...body.mapping.centres[o]) : new THREE.Vector3(0, 4.5, 0); tgt = new THREE.Vector3(c.x * 0.5, Math.max(1.5, c.y * 0.7 + 1.5), 0); size = [7.5, 9]; dir = new THREE.Vector3(0.15, 0.08, 1); }
    // semantic focus targets: an organelle in the whole cell, or a named protein in the membrane close-up
    if (view === 'cell' && scene && cellView !== 'zoom' && target) {
      const anchors = Object.fromEntries(getCell(cellType ?? defaultCellType(sel)).anchors.map((a) => [a.key, a.pos]));
      const r = resolveTarget(target, anchors); if (r?.position && r.view === 'whole') { tgt = MICRO.clone().add(r.position); size = narrow ? [4.8, 3.8] : [5.4, 4.2]; dir = new THREE.Vector3(0.1, 0.95, 1); }
    }
    if (view === 'cell' && scene && cellView === 'zoom' && target && cellLive.patch) {
      const p = cellLive.patch; const anchors = Object.fromEntries([...p.sites].reverse().map((z) => [z.kind, p.sitePos(z, new THREE.Vector3())]));
      const r = resolveTarget(target, anchors); if (r?.position && r.view === 'zoom') { tgt = MICRO.clone().add(PATCH_OFF).add(r.position); size = narrow ? [4.3, 3.1] : [5.2, 3.7]; }
    }
    const dist = Math.min(60, Math.max(size[1] / (2 * t), size[0] / (2 * t * aspect)) * 1.05 + 1); const d = dir.normalize().multiplyScalar(dist);
    ref.current?.setLookAt(tgt.x + d.x, tgt.y + d.y, tgt.z + d.z, tgt.x, tgt.y, tgt.z, !instant() && !(jump && useLabUI.getState().veil > 0.5));
  }, [view, sel, cellView, cellType, target, aspect, three.camera, body]);
  return <CameraControls ref={ref} makeDefault minDistance={2} maxDistance={40} smoothTime={0.8} />;
}
