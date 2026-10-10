/**
 * Added anatomy in the Atlas body view (male reference body only — the layers share the VHM body frame):
 * the skeleton, the real pericardium with an effusion of a given volume, the animated conduction system, and the deep
 * brain (ventricles, basal ganglia, thalamus, internal capsule, brainstem). All geometry is measured anatomy; the
 * condition only chooses what is shown, highlighted, filled or animated.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { vesselCentrelines } from '../heart/heartGeometry';
import { loadHeartAsset, centerlineAt, type HeartAsset } from '../infarct/asset/heartAsset';
import { TERRITORY } from '../infarct/data/territories';
import { loadSkeleton, loadPericardium, loadNeuroDeep, loadHeartInternals, loadUpperAirway, effusionThickness, CONDUCTION, VENTRICLES, DEEP_NUCLEI, LARYNX, UPPER_SOFT, type Layer, type PericardiumMapping } from '../asset/anatomy';
import { conductionMaterial, branchOf, cycleMs } from '../scene/conduction';

function useLayer<M>(load: () => Promise<Layer<M>>) {
  const [l, setL] = useState<Layer<M> | null>(null);
  useEffect(() => { let off = false; load().then((x) => { if (!off) setL(x); }).catch(() => undefined); return () => { off = true; }; }, [load]);
  return l;
}
const centreOf = (m: THREE.Mesh) => { m.geometry.computeBoundingBox(); return m.geometry.boundingBox!.getCenter(new THREE.Vector3()); };

/* ------------------------------------------------------------------ skeleton */
export function SkeletonLayer({ highlight = [], ghost = 0.16 }: { highlight?: string[]; ghost?: number }) {
  const sk = useLayer(loadSkeleton);
  const mats = useMemo(() => ({
    bone: new THREE.MeshStandardMaterial({ color: '#e4dac6', roughness: 0.55, transparent: true, opacity: ghost, depthWrite: false }),
    cartilage: new THREE.MeshStandardMaterial({ color: '#c6d6dc', roughness: 0.4, transparent: true, opacity: ghost, depthWrite: false }),
    hot: new THREE.MeshStandardMaterial({ color: '#f2e6cf', roughness: 0.45, emissive: new THREE.Color('#f0b44a'), emissiveIntensity: 0.25 }),
  }), [ghost]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  if (!sk) return null;
  const hot = new Set(highlight);
  return <group>{Object.entries(sk.meshes).map(([id, m]) => <mesh key={id} geometry={m.geometry} material={hot.has(id) ? mats.hot : /^(costal_|xiphoid)/.test(id) ? mats.cartilage : mats.bone} renderOrder={hot.has(id) ? 0 : 3} dispose={null} />)}</group>;
}

/* ------------------------------------------------------------------ pericardium + effusion */
/** The sac is displaced along its normal by the effusion thickness × the per-vertex freedom `aEff` (tethered at the
 *  great-vessel reflections, freest over the dependent free wall); `ml` is the pericardial fluid volume. */
export function PericardiumLayer({ ml, blood = false }: { ml: number; blood?: boolean }) {
  const pc = useLayer(loadPericardium);
  const u = useMemo(() => ({ uThick: { value: 0 } }), []);
  const sac = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: '#e7dccb', roughness: 0.35, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, u); sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aEff; uniform float uThick;').replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normal * uThick * aEff;'); };
    m.customProgramCacheKey = () => 'pericardium-eff-v1'; return m;
  }, [u]);
  const fluid = useMemo(() => new THREE.MeshStandardMaterial({ color: blood ? '#7d1f30' : '#7fb0d4', roughness: 0.2, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.BackSide }), [blood]);
  useEffect(() => () => { sac.dispose(); fluid.dispose(); }, [sac, fluid]);
  const target = pc ? effusionThickness(pc.mapping as PericardiumMapping, ml) : 0;
  useFrame((_, dt) => { u.uThick.value += (target - u.uThick.value) * (1 - Math.exp(-3 * Math.min(dt, 0.1))); fluid.opacity = Math.min(0.45, 0.08 + u.uThick.value * 4); });
  if (!pc) return null;
  const g = pc.meshes.pericardium.geometry;
  // the fluid is the same displaced surface drawn from inside: it reads as a layer between sac and heart
  return <group><mesh geometry={g} material={fluid} renderOrder={4} dispose={null} /><mesh geometry={g} material={sac} renderOrder={5} dispose={null} /></group>;
}

/* ------------------------------------------------------------------ conduction system */
/** hr: beats/min; avDelay: extra AV-nodal delay (ms) — first-degree block grows it, a dropped beat skips ventricular activation. */
export function ConductionLayer({ hr, avDelay = 0, dropEvery = 0 }: { hr: number; avDelay?: number; dropEvery?: number }) {
  const hi = useLayer(loadHeartInternals);
  const mats = useMemo(() => [0, 1, 2].map((b) => conductionMaterial(b as 0 | 1 | 2)), []);
  const apparatus = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8463e', roughness: 0.5, transparent: true, opacity: 0.55, depthWrite: false }), []);
  useEffect(() => () => { mats.forEach((m) => m.material.dispose()); apparatus.dispose(); }, [mats, apparatus]);
  const clock = useRef(0);
  useFrame((_, dt) => {
    clock.current += Math.min(dt, 0.1); const period = 60 / Math.max(10, hr); const beat = Math.floor(clock.current / period);
    const t = cycleMs(clock.current, hr); const dropped = dropEvery > 1 && beat % dropEvery === dropEvery - 1;
    for (const m of mats) { m.uniforms.uT.value = t; m.uniforms.uAvDelay.value = dropped ? 1e5 : avDelay; m.uniforms.uHisStart.value = hi?.mapping.activation.hisStart ?? 120; }
  });
  if (!hi) return null;
  return <group>
    {CONDUCTION.filter((id) => hi.meshes[id]).map((id) => <mesh key={id} geometry={hi.meshes[id].geometry} material={mats[branchOf(id)].material} renderOrder={6} dispose={null} />)}
    {Object.keys(hi.meshes).filter((id) => /^pap_/.test(id)).map((id) => <mesh key={id} geometry={hi.meshes[id].geometry} material={apparatus} renderOrder={5} dispose={null} />)}
  </group>;
}

/* ------------------------------------------------------------------ deep brain */
const NEURO_COLOR: Record<string, string> = { csf: '#5d9fdc', caudate: '#a07a94', putamen: '#a07a94', pallidus: '#bd9ea8', thalamus: '#9483a8', internal_capsule: '#efe9dc', midbrain: '#b39a9a', pons: '#b39a9a', medulla: '#b39a9a' };
const colorFor = (id: string) => (VENTRICLES.includes(id) ? NEURO_COLOR.csf : NEURO_COLOR[id.replace(/_[LR]$/, '')] ?? '#a8949a');
/**
 * ventricleScale < 1 compresses the ventricles (mass effect / oedema), > 1 dilates them (hydrocephalus);
 * `ich` places a haematoma of `ichMl` centred on that structure (hypertensive ICH: putamen, thalamus).
 */
export function DeepBrainLayer({ highlight = [], ventricleScale = 1, ich, ichMl = 0, show = 'all' }: { highlight?: string[]; ventricleScale?: number; ich?: string; ichMl?: number; show?: 'all' | 'ventricles' }) {
  const nd = useLayer(loadNeuroDeep);
  const ids = useMemo(() => (nd ? Object.keys(nd.meshes).filter((id) => (show === 'ventricles' ? VENTRICLES.includes(id) : [...VENTRICLES, ...DEEP_NUCLEI, 'midbrain', 'pons', 'medulla'].includes(id))) : []), [nd, show]);
  const mats = useMemo(() => Object.fromEntries(ids.map((id) => [id, new THREE.MeshStandardMaterial({ color: colorFor(id), roughness: 0.45, transparent: true, opacity: 0.85 })])), [ids]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  const hot = new Set(highlight);
  const vRefs = useRef<Record<string, THREE.Mesh | null>>({});
  useFrame((_, dt) => { const k = 1 - Math.exp(-3 * Math.min(dt, 0.1)); for (const [id, m] of Object.entries(vRefs.current)) { if (!m) continue; const s = m.scale.x + (ventricleScale - m.scale.x) * k; m.scale.setScalar(s); m.userData.c && m.position.copy((m.userData.c as THREE.Vector3).clone().multiplyScalar(1 - s)); void id; } });
  if (!nd) return null;
  // haematoma volume → radius (sphere-equivalent; mL = 4/3 π r³ with r in cm)
  const r = ichMl > 0 ? Math.cbrt((3 * ichMl) / (4 * Math.PI)) / 10 : 0; const ichC = ich && nd.meshes[ich] ? centreOf(nd.meshes[ich]) : null;
  return <group>
    {ids.map((id) => {
      const m = nd.meshes[id]; const mat = mats[id]; mat.opacity = hot.size && !hot.has(id) ? 0.35 : 0.9; mat.emissive = new THREE.Color(hot.has(id) ? '#f0b44a' : '#000000'); mat.emissiveIntensity = hot.has(id) ? 0.25 : 0;
      const isV = VENTRICLES.includes(id);
      return <mesh key={id} ref={isV ? (el) => { vRefs.current[id] = el; if (el && !el.userData.c) el.userData.c = centreOf(m); } : undefined} geometry={m.geometry} material={mat} renderOrder={4} dispose={null} />;
    })}
    {ichC && r > 0 && <mesh position={ichC} scale={[r * 1.1, r * 0.95, r * 1.25]} renderOrder={5}><sphereGeometry args={[1, 28, 20]} /><meshStandardMaterial color="#6d1726" roughness={0.5} /></mesh>}
  </group>;
}

/* ------------------------------------------------------------------ upper airway */
/**
 * Supraglottic swelling (epiglottitis, angioedema): epiglottis, vestibular folds and tongue enlarge with `edema`.
 * Subglottic swelling (croup): a ring of oedema inside the real cricoid narrows the lumen — the narrowest point of the
 * airway, so the ring's inner radius is what the condition is about.
 */
export function UpperAirwayLayer({ edema = 0, site }: { edema?: number; site?: 'supraglottic' | 'subglottic' }) {
  const ua = useLayer(loadUpperAirway);
  const soft = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d48a8a', roughness: 0.45, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }), []);
  const swollen = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c25b4f', roughness: 0.45 }), []);
  useEffect(() => () => { soft.dispose(); swollen.dispose(); }, [soft, swollen]);
  const refs = useRef<Record<string, THREE.Mesh | null>>({});
  const grow: Record<string, number> = site === 'supraglottic' ? { epiglottis: 1 + 0.7 * edema, vestibular_fold_R: 1 + 0.6 * edema, vestibular_fold_L: 1 + 0.6 * edema, tongue: 1 + 0.22 * edema } : {};
  useFrame((_, dt) => { const k = 1 - Math.exp(-3 * Math.min(dt, 0.1)); for (const [id, m] of Object.entries(refs.current)) { if (!m) continue; const target = grow[id] ?? 1; const s = m.scale.x + (target - m.scale.x) * k; m.scale.setScalar(s); const c = m.userData.c as THREE.Vector3 | undefined; if (c) m.position.copy(c).multiplyScalar(1 - s); } });
  if (!ua) return null;
  const cric = ua.meshes.cricoid_cartilage ? centreOf(ua.meshes.cricoid_cartilage) : null;
  const ring = site === 'subglottic' && cric ? { r: 0.055, tube: 0.01 + 0.035 * edema } : null; // lumen ≈ 1.1 cm → inner radius 5.5 − tube; the swelling runs ~1 cm down the subglottis
  return <group>
    {[...LARYNX, ...UPPER_SOFT].filter((id) => ua.meshes[id]).map((id) => {
      const m = ua.meshes[id]; const hot = (grow[id] ?? 1) > 1.02;
      // croup: the ring sits inside the cricoid, so the cartilages around it are drawn see-through
      const soft_ = (UPPER_SOFT.includes(id) && !(id === 'tongue' && site === 'supraglottic' && edema > 0.05)) || (site === 'subglottic' && /^(thyroid|cricoid)_cartilage$|^cricothyroid/.test(id));
      return <mesh key={id} ref={(el) => { refs.current[id] = el; if (el && !el.userData.c) el.userData.c = centreOf(m); }} geometry={m.geometry} material={hot ? swollen : soft_ ? soft : m.material} renderOrder={soft_ ? 4 : 2} dispose={null} />;
    })}
    {ring && cric && <mesh position={[cric.x, cric.y - 0.02, cric.z + 0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 3.2]} renderOrder={3}><torusGeometry args={[ring.r - ring.tube * 0.4, ring.tube, 16, 40]} /><meshStandardMaterial color="#c25b4f" roughness={0.45} transparent opacity={0.85} /></mesh>}
  </group>;
}

/* ================================================================== pathology shaped on the real anatomy */
type W = { p: THREE.Vector3; r: number };
/** a tube along way points, radius = lumen radius × k (optionally varying along the path) */
function lumenTube(ws: W[], k: number | ((u: number, r: number) => number), seg = 18) {
  const curve = new THREE.CatmullRomCurve3(ws.map((w) => w.p), false, 'centripetal'); const n = Math.max(12, ws.length * 10);
  const g = new THREE.TubeGeometry(curve, n, 1, seg, false); const p = g.attributes.position; const ring = seg + 1; const c = new THREE.Vector3(); const v = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const u = i / n; const fi = u * (ws.length - 1); const a = Math.floor(fi), b = Math.min(ws.length - 1, a + 1); const r = ws[a].r + (ws[b].r - ws[a].r) * (fi - a);
    const rr = typeof k === 'number' ? r * k : k(u, r); curve.getPointAt(u, c);
    for (let j = 0; j < ring; j++) { const o = i * ring + j; v.fromBufferAttribute(p, o).sub(c).multiplyScalar(rr).add(c); p.setXYZ(o, v.x, v.y, v.z); }
  }
  g.computeVertexNormals(); g.deleteAttribute('uv'); return g;
}
const cutPath = (ws: W[], frac: number) => { const n = Math.max(2, Math.round(1 + frac * (ws.length - 1))); return ws.slice(0, n); };
function useDisposable<T extends { dispose: () => void }>(make: () => T, deps: unknown[]) { const x = useMemo(make, deps); useEffect(() => () => x.dispose(), [x]); return x; } // eslint-disable-line react-hooks/exhaustive-deps

/** Pulmonary embolism: a saddle clot astride the bifurcation of the real pulmonary trunk, extending down both
 *  pulmonary arteries with `extent` (0–1), inside a see-through arterial tree. */
export function PulmonaryEmbolusLayer({ extent }: { extent: number }) {
  const v = useMemo(() => vesselCentrelines(), []);
  const tree = useDisposable(() => { const gs = [lumenTube(v.trunk, 1), lumenTube([v.trunk[v.trunk.length - 1], ...v.rpa], 1), lumenTube([v.trunk[v.trunk.length - 1], ...v.lpa], 1)]; return mergeTubes(gs); }, [v]);
  const clot = useDisposable(() => {
    const e = Math.max(0.15, extent); const tip = v.trunk[v.trunk.length - 1];
    return mergeTubes([lumenTube([v.trunk[v.trunk.length - 2], tip], 0.55), lumenTube([tip, ...cutPath(v.rpa, e)], (u, r) => r * 0.78 * (1 - 0.35 * u)), lumenTube([tip, ...cutPath(v.lpa, e)], (u, r) => r * 0.78 * (1 - 0.35 * u))]);
  }, [v, Math.round(extent * 20)]);
  return <group>
    <mesh geometry={tree} renderOrder={4}><meshStandardMaterial color="#6a6fb8" roughness={0.4} transparent opacity={0.28} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <mesh geometry={clot} renderOrder={5}><meshStandardMaterial color="#9e1f33" roughness={0.6} emissive="#7a1020" emissiveIntensity={0.55} /></mesh>
  </group>;
}

/** Aortic dissection (Stanford A): the true lumen compressed by a false lumen running along the outer curvature of the
 *  real ascending aorta, arch and descending thoracic aorta. */
export function DissectionLayer({ compression, wallStress }: { compression: number; wallStress: number }) {
  const v = useMemo(() => vesselCentrelines(), []);
  const ao = useMemo(() => [...v.asc, ...v.desc], [v]);
  const centre = useMemo(() => ao.reduce((a, w) => a.add(w.p), new THREE.Vector3()).divideScalar(ao.length), [ao]);
  const tl = useDisposable(() => lumenTube(ao, 1 - 0.4 * compression), [ao, Math.round(compression * 20)]);
  const fl = useDisposable(() => {
    // offset each way point outward (away from the arch's centre, perpendicular to the vessel)
    const curve = new THREE.CatmullRomCurve3(ao.map((w) => w.p), false, 'centripetal');
    const off: W[] = ao.map((w, i) => { const t = curve.getTangentAt(i / (ao.length - 1)); const out = w.p.clone().sub(centre); out.addScaledVector(t, -out.dot(t)).normalize(); return { p: w.p.clone().addScaledVector(out, w.r * (0.45 + 0.15 * wallStress)), r: w.r }; });
    return lumenTube(off, 0.45 + 0.2 * wallStress);
  }, [ao, centre, Math.round(wallStress * 20)]);
  return <group>
    <mesh geometry={tl} renderOrder={4}><meshStandardMaterial color="#c8322b" roughness={0.4} transparent opacity={0.55} depthWrite={false} /></mesh>
    <mesh geometry={fl} renderOrder={5}><meshStandardMaterial color="#6e2a2a" roughness={0.6} transparent opacity={0.92} /></mesh>
  </group>;
}

/** Infrarenal abdominal aortic aneurysm measured on the real aorta: slices of body.glb's aorta between the renal level
 *  and the bifurcation give the centreline and calibre; the sac bulges fusiformly with `dilation`. Rupture adds a
 *  retroperitoneal haematoma against the sac's left posterolateral wall. */
export function AneurysmLayer({ aorta, kidneyY, dilation, bleeding = 0 }: { aorta: THREE.BufferGeometry; kidneyY: number; dilation: number; bleeding?: number }) {
  const path = useMemo(() => {
    const p = aorta.attributes.position; aorta.computeBoundingBox(); const lo = aorta.boundingBox!.min.y + 0.12, hi = kidneyY - 0.12; const N = 10; const out: W[] = [];
    for (let i = 0; i <= N; i++) { const y = hi - ((hi - lo) * i) / N; const c = new THREE.Vector3(); let n = 0; const pts: THREE.Vector3[] = []; const v = new THREE.Vector3();
      for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k); if (Math.abs(v.y - y) < 0.03) { c.add(v); pts.push(v.clone()); n++; } }
      if (n < 6) continue; c.divideScalar(n); const r = pts.reduce((s, q) => s + Math.hypot(q.x - c.x, q.z - c.z), 0) / n; out.push({ p: c, r }); }
    return out;
  }, [aorta, kidneyY]);
  const sac = useDisposable(() => lumenTube(path, (u, r) => r * (1 + 2.2 * dilation * Math.exp(-(((u - 0.55) / 0.22) ** 2)))), [path, Math.round(dilation * 20)]);
  if (path.length < 3) return null;
  const mid = path[Math.floor(path.length * 0.55)]; const r = mid.r * (1 + 2.2 * dilation);
  return <group>
    <mesh geometry={sac} renderOrder={4}><meshStandardMaterial color="#b6595f" roughness={0.45} transparent opacity={0.85} side={THREE.DoubleSide} /></mesh>
    {bleeding > 0.02 && <mesh position={[mid.p.x + r * 0.9, mid.p.y - 0.05, mid.p.z - r * 0.7]} scale={[0.12 + 0.3 * bleeding, 0.25 + 0.35 * bleeding, 0.14 + 0.2 * bleeding]} renderOrder={5}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color="#6d1726" roughness={0.6} transparent opacity={0.85} /></mesh>}
  </group>;
}

/** Pleural space of one lung, from the lung's own (uncollapsed) surface: air fills it as a pale shell around the
 *  collapsing lung; blood layers in its dependent part up to a level set by the volume. */
export function PleuralLayer({ lung, air = 0, blood = 0 }: { lung: THREE.BufferGeometry; air?: number; blood?: number }) {
  const gl = useThree((s) => s.gl); useEffect(() => { gl.localClippingEnabled = true; }, [gl]);
  const bb = useMemo(() => { lung.computeBoundingBox(); return lung.boundingBox!.clone(); }, [lung]);
  const level = bb.min.y + (bb.max.y - bb.min.y) * (0.08 + 0.5 * blood);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), level), [level]);
  return <group>
    {air > 0.02 && <mesh geometry={lung} renderOrder={6}><meshStandardMaterial color="#cfe3ee" roughness={0.2} transparent opacity={0.12 + 0.22 * air} depthWrite={false} side={THREE.DoubleSide} /></mesh>}
    {blood > 0.02 && <mesh geometry={lung} renderOrder={5}><meshStandardMaterial color="#7d1f30" roughness={0.5} transparent opacity={0.85} side={THREE.DoubleSide} clippingPlanes={[plane]} /></mesh>}
  </group>;
}
function mergeTubes(gs: THREE.BufferGeometry[]) {
  const pos: number[] = []; const idx: number[] = []; let off = 0;
  for (const g of gs) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) pos.push(p.getX(i), p.getY(i), p.getZ(i)); const ix = g.index!.array; for (let i = 0; i < ix.length; i++) idx.push(ix[i] + off); off += p.count; g.dispose(); }
  const r = new THREE.BufferGeometry(); r.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); r.setIndex(idx); r.computeVertexNormals(); return r;
}

/* ------------------------------------------------------------------ STEMI on the coronary heart (merged Infarct Atlas) */
/** The coronary heart sits exactly where the body's heart is (same body frame), so the Atlas shows the real coronary
 *  tree, a thrombus at the territory's usual culprit site and the ischaemic territory, in the patient. */
export function CoronaryLayer({ territory = 'anterior', ischemia }: { territory?: string; ischemia: number }) {
  const [asset, setAsset] = useState<HeartAsset | null>(null);
  useEffect(() => { let off = false; loadHeartAsset().then((a) => { if (!off) setAsset(a); }).catch(() => undefined); return () => { off = true; }; }, []);
  const terr = useDisposable(() => new THREE.MeshStandardMaterial({ color: '#d0245e', emissive: new THREE.Color('#8a1240'), roughness: 0.5, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }), []);
  terr.opacity = 0.35 + 0.55 * ischemia; terr.emissiveIntensity = 0.25 + 0.5 * ischemia;
  if (!asset) return null;
  const t = TERRITORY[territory]; const cp = t?.commonCulpritVessels[0]; const line = cp ? asset.mapping.vessels[cp.vessel]?.centerline : undefined;
  const clot = line && cp ? centerlineAt(line, cp.at) : null; const r = cp ? asset.mapping.vessels[cp.vessel].radius : 0.02;
  const show = Object.entries(asset.meshes).filter(([id]) => !id.startsWith('territory_'));
  const mask = asset.meshes['territory_' + territory];
  return <group>
    {/* the coronary asset keeps meshopt de-quantisation in each node's matrix: draw with it */}
    {show.map(([id, m]) => <mesh key={id} geometry={m.geometry} material={m.material} matrixAutoUpdate={false} matrix={m.matrixWorld} renderOrder={2} dispose={null} />)}
    {mask && <mesh geometry={mask.geometry} material={terr} matrixAutoUpdate={false} matrix={mask.matrixWorld} renderOrder={3} dispose={null} />}
    {/* thrombus: fills and slightly bulges the culprit artery (lumen radius ~0.6 mm here, drawn ≥ 3 mm so it reads) */}
    {clot && <mesh position={clot} scale={Math.max(r * 2.6, 0.03)} renderOrder={4}><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color="#ffd25a" roughness={0.6} emissive="#b07a10" emissiveIntensity={0.6} /></mesh>}
  </group>;
}
