/**
 * Added anatomy in the Atlas body view (male reference body only — the layers share the VHM body frame):
 * the skeleton, the real pericardium with an effusion of a given volume, the animated conduction system, and the deep
 * brain (ventricles, basal ganglia, thalamus, internal capsule, brainstem). All geometry is measured anatomy; the
 * condition only chooses what is shown, highlighted, filled or animated.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
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
