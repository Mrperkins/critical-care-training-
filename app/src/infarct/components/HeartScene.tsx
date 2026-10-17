import { supportsWebGL, SceneBoundary, SceneUnavailable } from '../../scene/SceneBoundary';
import { useCameraGate } from '../../scene/cameraPolicy';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Html, Lightformer } from '@react-three/drei';
import type { HeartAsset } from '../asset/heartAsset';
import { centerlineAt } from '../asset/heartAsset';
import { useApp } from '../engine/store';
import { clock } from '../engine/clock';
import { live } from '../engine/rhythm';
import { shared, CLIP, tissueMaterial, coronaryMaterial, territoryMaterial, sliceCapMaterial, withBeat, type TissueKind } from '../engine/shaders';
import { sliceSection } from '../engine/slice';
import { loadHeartInternals, CONDUCTION, type Layer, type HeartInternalsMapping } from '../../asset/anatomy';
import { conductionMaterial, branchOf } from '../../scene/conduction';
import { vesselTargets, regionVector, culpritFor, regionsOfVessel, REGION_ORDER, REGION_TO_TERRITORY } from '../engine/derive';
import { TERRITORY, TERRITORIES } from '../data/territories';
import { focusOf, transmuralOf, lesionOf, asEquivalent } from '../data/focus';
import { VESSEL } from '../data/vessels';
import { upstream, originOf } from '../data/vessels';
import { LEAD, LEADS, TORSO_RADII } from '../data/leads';
import type { LeadId, VesselId, Vec3 } from '../data/types';

const lerp = THREE.MathUtils.lerp;
const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
const damp = (cur: number, tgt: number, rate: number, dt: number) => lerp(cur, tgt, 1 - Math.exp(-rate * dt));

/**
 * `pick` (shared high-detail heart only): the light coronary-heart myocardium, used invisibly for territory picking.
 * `sliceFrom`: closed ventricular shells (LV, RV) to cut for the short-axis slice; the light coronary-heart walls are
 * closed with an inner and an outer surface (the high-detail chambers are open at the septum).
 */
export function HeartScene({ asset, pick, sliceFrom }: { asset: HeartAsset; pick?: THREE.Mesh[]; sliceFrom?: THREE.Mesh[] }) {
  const [attempt, retry] = useState(0);
  const capable = useMemo(() => supportsWebGL(), [attempt]);
  const onRetry = () => retry(n => n + 1);
  if (!capable) return <SceneUnavailable label="MI anatomy renderer unavailable" onRetry={onRetry} />;
  return (
    <SceneBoundary key={attempt} label="MI anatomy renderer unavailable" onRetry={onRetry}><Canvas
      className="heart-canvas"
      dpr={typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.05, far: 60, position: [1.2, 0.6, 4.6] }}
      onPointerMissed={() => { const s = useApp.getState(); if (s.mode === 'explore') s.set({ vesselId: null }); }}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
    >
      <Studio />
      <group position={asset.center.clone().negate()}>
        <HeartModel asset={asset} pick={pick} />
        <FlowFX asset={asset} />
        <Conduction />
        <SliceCaps asset={asset} from={sliceFrom ?? ['myocardium_LV', 'myocardium_RV'].map((id) => asset.meshes[id]).filter(Boolean)} />
      </group>
      <LeadRig />
      <ContactShadows position={[0, -1.18, 0]} opacity={0.5} blur={2.8} far={2.6} scale={7} resolution={256} frames={1} color="#000000" />
      <CameraRig asset={asset} />
    </Canvas></SceneBoundary>
  );
}

/* ------------------------------------------------------------------ lighting */
function Studio() {
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-3, 4, 5]} intensity={1.7} color="#fff1e8" />
      <directionalLight position={[4, 1.5, -3]} intensity={0.9} color="#d8e6ff" />
      <directionalLight position={[0, -4, 2]} intensity={0.25} color="#ffd8cc" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 3, 1]} color="#fff4ec" />
        <Lightformer form="rect" intensity={0.9} position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} color="#ffe6dc" />
        <Lightformer form="rect" intensity={0.7} position={[5, 0.5, -2]} rotation-y={-Math.PI / 2} scale={[5, 4, 1]} color="#dde8ff" />
        <Lightformer form="ring" intensity={0.5} position={[0, -3, 4]} scale={3} color="#ffffff" />
      </Environment>
    </>
  );
}

/* ------------------------------------------------------------------ the heart */
const ROLE_KIND: Record<string, TissueKind> = { myocardium: 'myocardium', atrium: 'atrium', greatArtery: 'greatArtery', greatVein: 'greatVein', cardiacVein: 'cardiacVein' };
const FADEABLE = ['myocardium_RV', 'atrium_RA', 'vein_anterior_cardiac_vein', 'vein_small_cardiac_vein', 'coronary_AM'];

function HeartModel({ asset, pick }: { asset: HeartAsset; pick?: THREE.Mesh[] }) {
  const cor = useRef<Record<string, ReturnType<typeof coronaryMaterial>>>({});
  const masks = useRef<Record<string, ReturnType<typeof territoryMaterial>>>({});
  const fadeMats = useRef<THREE.Material[]>([]);
  const cur = useRef<Record<string, { occAt: number; perf: number; down: number; flow: number; state: number; maxS: number; dim: number }>>({});
  const terr = useRef({ w: new Array(8).fill(0), mask: {} as Record<string, number>, hover: {} as Record<string, number> });

  const allMats = useRef<THREE.Material[]>([]); const xrayOn = useRef(false);
  /** shared heart: territories are drawn on the myocardium itself; the mask meshes belong to the light heart */
  const inSurface = !!pick;
  const objects = useMemo(() => {
    const list: THREE.Object3D[] = [];
    const m = asset.meshes; allMats.current = []; fadeMats.current = [];
    for (const [id, mesh] of Object.entries(m)) {
      if (inSurface && id.startsWith('territory_')) continue;
      const role = (mesh.userData.role as string) || '';
      if (role === 'coronary') {
        const mat = coronaryMaterial(); cor.current[mesh.userData.vessel] = mat; mesh.material = mat;
        mesh.renderOrder = 2;
      } else if (role === 'territory') {
        const mat = territoryMaterial(); masks.current[id.replace('territory_', '')] = mat; mesh.material = mat; mesh.renderOrder = 3; mesh.raycast = () => {};
      } else if (ROLE_KIND[role]) {
        const fade = FADEABLE.includes(id);
        const mat = tissueMaterial(ROLE_KIND[role], { fadeable: fade }); mesh.material = mat; if (fade) fadeMats.current.push(mat);
        mesh.renderOrder = fade ? 4 : 0; allMats.current.push(mat);
      }
      if (id === 'coronary_AM') { /* AM is also fadeable with the RV */ (mesh.material as THREE.Material).transparent = true; fadeMats.current.push(mesh.material as THREE.Material); }
      mesh.castShadow = false; mesh.receiveShadow = false;
      list.push(mesh);
    }
    const base = asset.mapping.lvAxis.base, apex = asset.mapping.lvAxis.apex;
    shared.uBase.value.set(...base);
    shared.uAxis.value.set(apex[0] - base[0], apex[1] - base[1], apex[2] - base[2]).normalize();
    shared.uLen.value = asset.mapping.lvAxis.length;
    shared.uAtrC.value.copy(asset.atriaCenter);
    return list;
  }, [asset, inSurface]);
  const pickMats = useMemo(() => new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0 }), []);

  // pick tubes for thin coronaries
  const pickers = useMemo(() => Object.entries(asset.mapping.vessels).map(([id, v]) => {
    const curve = new THREE.CatmullRomCurve3(v.centerline.map((p) => new THREE.Vector3(...p)));
    const g = new THREE.TubeGeometry(curve, 48, 0.04, 6, false);
    return { id: id as VesselId, g };
  }), [asset]);
  const pickMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), []);

  useFrame((_, dt) => {
    const st = useApp.getState();
    const t = clock.time; const rs = live.state; // beat-by-beat: dropped beats do not contract
    shared.uTime.value = t; shared.uVent.value = rs.vent; shared.uAtr.value = rs.atria;
    const T = focusOf(st.territoryId);
    // territory weights: the MI territory, or the regions a selected vessel supplies
    let wTarget = regionVector(T);
    if (!T && st.vesselId) { const r = regionsOfVessel(st.vesselId, st.dominance); wTarget = REGION_ORDER.map((k) => r[k] ?? 0); }
    terr.current.w = terr.current.w.map((w, i) => damp(w, wTarget[i], 3, dt));
    const w = terr.current.w;
    shared.uTerrA.value.set(w[0], w[1], w[2], w[3]); shared.uTerrB.value.set(w[4], w[5], w[6], w[7]);
    shared.uInjury.value = damp(shared.uInjury.value, T ? st.scene.injury : 0, 2.2, dt);
    // subendocardial patterns show little on the outer surface; a transmural STEMI shows all of it
    shared.uSurf.value = damp(shared.uSurf.value, 0.25 + 0.75 * THREE.MathUtils.smoothstep(transmuralOf(T), 0.3, 1), 2, dt);
    shared.uHypo.value = shared.uInjury.value;
    const lead = st.leadId ? LEAD[st.leadId] : null;
    if (lead) shared.uLeadDir.value.lerp(new THREE.Vector3(...lead.view), 1 - Math.exp(-5 * dt)).normalize();
    shared.uLeadOn.value = damp(shared.uLeadOn.value, lead ? 1 : 0, 4, dt);
    const fadeOn = st.cutaway || (T?.cutaway && st.scene.highlightVessel) ? 1 : 0;
    shared.uFade.value = damp(shared.uFade.value, fadeOn, 2.5, dt);
    shared.uXray.value = damp(shared.uXray.value, st.conduction ? 1 : 0, 3, dt);
    const xray = shared.uXray.value > 0.02;
    fadeMats.current.forEach((m) => { m.depthWrite = shared.uFade.value < 0.05; (m as THREE.MeshPhysicalMaterial).opacity = 1 - 0.82 * shared.uFade.value; });
    // switching a compiled material between opaque and transparent needs a recompile (three defines OPAQUE); depth
    // writes stay on so only the nearest wall shows through and inner surfaces never sort over outer ones
    if (xray !== xrayOn.current) { xrayOn.current = xray; allMats.current.forEach((m) => { if (fadeMats.current.includes(m)) return; m.transparent = xray; m.needsUpdate = true; }); }
    // territory highlight on the surface (shared heart), and the territory under the pointer
    const maskOn = T ? (st.scene.highlightVessel || st.mode !== 'quiz' ? 0.35 + 0.65 * st.scene.injury : 0) : st.vesselId ? 0.75 : 0;
    shared.uMaskOn.value = damp(shared.uMaskOn.value, inSurface ? maskOn : 0, 3, dt);
    const hov = st.hoverTerritory && st.hoverTerritory !== st.territoryId ? regionVector(TERRITORY[st.hoverTerritory]) : null;
    if (hov) { shared.uHovA.value.set(hov[0], hov[1], hov[2], hov[3]); shared.uHovB.value.set(hov[4], hov[5], hov[6], hov[7]); }
    shared.uHovOn.value = damp(shared.uHovOn.value, inSurface && hov ? 1 : 0, 6, dt);

    // vessels
    const targets = vesselTargets({ territoryId: st.territoryId, culpritIndex: st.culpritIndex, vesselId: st.vesselId, hoverVessel: st.hoverVessel, dominance: st.dominance, scene: st.scene, origins: { right: asset.mapping.origins, left: asset.mapping.originsLeft } });
    for (const [vid, mat] of Object.entries(cor.current)) {
      const tg = targets[vid as VesselId]; if (!tg) continue;
      const c = (cur.current[vid] ??= { ...tg });
      c.occAt = tg.occAt; c.perf = damp(c.perf, tg.perf, 2, dt); c.down = damp(c.down, tg.down, 2, dt); c.flow = damp(c.flow, tg.flow, 3, dt);
      c.state = tg.state; c.maxS = damp(c.maxS, Math.min(tg.maxS, 1.2), 3, dt); c.dim = damp(c.dim, tg.dim, 3, dt);
      const u = mat.localUniforms; u.uOccAt.value = c.occAt; u.uPerf.value = c.perf; u.uDown.value = c.down; u.uFlow.value = c.flow; u.uState.value = c.state; u.uMaxS.value = c.maxS > 1.1 ? 2 : c.maxS; u.uDim.value = c.dim;
    }
    // territory masks (light heart only)
    if (!inSurface) for (const [tid, mat] of Object.entries(masks.current)) {
      const on = st.territoryId === tid ? (st.scene.highlightVessel || st.mode !== 'quiz' ? 0.35 + 0.65 * st.scene.injury : 0) : 0;
      const hov = st.hoverTerritory === tid && st.territoryId !== tid ? 1 : 0;
      terr.current.mask[tid] = damp(terr.current.mask[tid] ?? 0, on, 3, dt);
      terr.current.hover[tid] = damp(terr.current.hover[tid] ?? 0, hov, 6, dt);
      mat.localUniforms.uAlpha.value = terr.current.mask[tid];
      mat.localUniforms.uHover.value = terr.current.hover[tid];
      mat.localUniforms.uStage.value = shared.uInjury.value;
      const m = asset.meshes[`territory_${tid}`]; if (m) m.visible = terr.current.mask[tid] > 0.01 || terr.current.hover[tid] > 0.01;
    }
  });

  const onMyoMove = (e: ThreeEvent<PointerEvent>) => {
    const st = useApp.getState(); if (st.mode !== 'explore') return;
    const tid = territoryAtHit(e); if (tid !== st.hoverTerritory) st.set({ hoverTerritory: tid });
  };
  const onMyoClick = (e: ThreeEvent<MouseEvent>) => {
    const st = useApp.getState(); if (st.mode !== 'explore' || e.delta > 4) return;
    e.stopPropagation(); const tid = territoryAtHit(e); if (tid) selectTerritory(tid);
  };

  const out = () => useApp.getState().set({ hoverTerritory: null });
  return (
    <group>
      {objects.map((o) => {
        const role = o.userData.role;
        if (role === 'myocardium' && !inSurface) return <primitive key={o.uuid} object={o} onPointerMove={onMyoMove} onPointerOut={out} onClick={onMyoClick} />;
        return <primitive key={o.uuid} object={o} />;
      })}
      {/* picking the high-detail surface would raycast ~260k triangles per pointer move; the light myocardium is the same shape */}
      {inSurface && pick!.map((m) => <mesh key={m.uuid} geometry={m.geometry} material={pickMats} renderOrder={-1} onPointerMove={onMyoMove} onPointerOut={out} onClick={onMyoClick} />)}
      {pickers.map((p) => (
        <mesh key={p.id} geometry={p.g} material={pickMat}
          onPointerOver={(e) => { if (useApp.getState().mode !== 'explore') return; e.stopPropagation(); useApp.getState().set({ hoverVessel: p.id }); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { useApp.getState().set({ hoverVessel: null }); document.body.style.cursor = ''; }}
          onClick={(e) => { const s = useApp.getState(); if (s.mode !== 'explore' || e.delta > 4) return; e.stopPropagation(); s.set({ vesselId: p.id, territoryId: null, seq: 0, seqPlaying: false, scene: { ...s.scene, highlightVessel: false, flow: true, occlusion: 0, perfusionLoss: 0, injury: 0, ecgMorph: 0, emphasizeAffected: false, emphasizeReciprocal: false, camera: 'free' } }); }} />
      ))}
    </group>
  );
}

function territoryAtHit(e: ThreeEvent<PointerEvent | MouseEvent>): string | null {
  const g = (e.object as THREE.Mesh).geometry; const f = e.face; if (!f) return null;
  const A = g.getAttribute('aRegA'), B = g.getAttribute('aRegB'); if (!A || !B) return null;
  const w = new Array(8).fill(0);
  const comp = (X: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, i: number) => [X.getX(i), X.getY(i), X.getZ(i), X.getW(i)];
  for (const vi of [f.a, f.b, f.c]) { const a = comp(A, vi), b = comp(B, vi); for (let k = 0; k < 4; k++) { w[k] += a[k]; w[4 + k] += b[k]; } }
  let best = -1, bi = -1; w.forEach((x, i) => { if (x > best) { best = x; bi = i; } });
  return best > 1.5 ? REGION_TO_TERRITORY[REGION_ORDER[bi]] : null;
}

export function selectTerritory(tid: string) {
  const s = useApp.getState();
  s.set({ territoryId: tid, vesselId: null, leadId: null, culpritIndex: 0, seq: 0, seqPlaying: s.mode === 'explore' });
}

/* ------------------------------------------------------------------ flow particles + thrombus */
function FlowFX({ asset }: { asset: HeartAsset }) {
  const N = 70;
  const inst = useRef<THREE.InstancedMesh>(null!);
  const clot = useRef<THREE.Mesh>(null!);
  const state = useRef({ key: '', path: [] as THREE.Vector3[], cum: [] as number[], len: 0, stop: Infinity, parts: [] as { u: number; v: number; wait: number; off: THREE.Vector3 }[], clotPos: new THREE.Vector3(), clotR: 0.02, tangent: new THREE.Vector3(0, 1, 0), vesselR: 0.01, flow: 0, occ: 0, thr: 0 });
  const plaque = useRef<THREE.Mesh>(null!);
  const plaqueGeo = useMemo(() => { const g = new THREE.TorusGeometry(1, 0.55, 14, 28); const p = g.attributes.position; const v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + 0.12 * Math.sin(v.x * 9) * Math.cos(v.y * 7); p.setXYZ(i, v.x * k, v.y * k, v.z * 1.6); } g.computeVertexNormals(); return g; }, []);
  const plaqueMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#d9c08e', roughness: 0.55, clearcoat: 0.3, sheen: 0.6, sheenColor: new THREE.Color('#fff0c8'), clippingPlanes: CLIP }), []);
  const rbc = useMemo(() => { const g = new THREE.SphereGeometry(1, 12, 8); g.scale(1, 0.42, 1); return g; }, []);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#b3121c', roughness: 0.35, clearcoat: 0.6, emissive: '#5a0608', emissiveIntensity: 0.6, clippingPlanes: CLIP }), []);
  const clotGeo = useMemo(() => { const g = new THREE.IcosahedronGeometry(1, 4); const p = g.attributes.position; const v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.18 * Math.sin(v.x * 7.1) * Math.sin(v.y * 6.3 + 1) + 0.1 * Math.sin(v.z * 11.0); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y * 0.8, v.z); } g.computeVertexNormals(); return g; }, []);
  const clotMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3d0a0e', roughness: 0.55, clearcoat: 0.5, sheen: 1, sheenColor: new THREE.Color('#d9a45a'), sheenRoughness: 0.4, emissive: '#2a0304', clippingPlanes: CLIP }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => new THREE.Vector3(...asset.mapping.lvAxis.base), [asset]);
  const axis = useMemo(() => new THREE.Vector3(...asset.mapping.lvAxis.apex).sub(base).normalize(), [asset, base]);
  const beat = (p: THREE.Vector3, k: number) => { const d = p.clone().sub(base); const h = d.dot(axis); const ap = base.clone().add(axis.clone().multiplyScalar(h)); const r = p.clone().sub(ap); return ap.add(r.multiplyScalar(1 - 0.075 * k)).sub(axis.clone().multiplyScalar(h * 0.06 * k)); };

  useFrame((_, dt) => {
    const st = useApp.getState(); const s = state.current;
    const T = focusOf(st.territoryId);
    const c = T ? culpritFor(T, st.dominance, st.culpritIndex) : null;
    const target: VesselId | null = c ? c.vessel : st.vesselId;
    const key = `${target}-${st.dominance}-${c?.at}`;
    if (key !== s.key) {
      s.key = key; s.path = []; s.cum = []; s.len = 0;
      if (target) {
        const chain = upstream(target, st.dominance); const pts: THREE.Vector3[] = [];
        chain.forEach((vid, i) => {
          const line = asset.mapping.vessels[vid]?.centerline; if (!line) return;
          const next = chain[i + 1]; const end = next ? (vid === 'LM' ? 1 : originOf(next, st.dominance, { right: asset.mapping.origins, left: asset.mapping.originsLeft })) : 1;
          for (let k = 0; k <= 30; k++) pts.push(centerlineAt(line, (k / 30) * end));
          if (vid === target && c) s.stop = -1;
        });
        s.path = pts; s.cum = [0]; for (let i = 1; i < pts.length; i++) s.cum.push(s.cum[i - 1] + pts[i].distanceTo(pts[i - 1])); s.len = s.cum[s.cum.length - 1];
        // occlusion point along the concatenated path
        s.stop = Infinity;
        if (c) { const line = asset.mapping.vessels[c.vessel].centerline; const p = centerlineAt(line, c.at); let best = 0, bd = Infinity; pts.forEach((q, i) => { const d = q.distanceTo(p); if (d < bd) { bd = d; best = i; } }); s.stop = s.cum[best]; s.clotPos.copy(p); s.vesselR = asset.mapping.vessels[c.vessel].radius || 0.01; s.clotR = Math.max(0.018, s.vesselR * 2.2); s.tangent.copy(centerlineAt(line, Math.min(1, c.at + 0.02))).sub(centerlineAt(line, Math.max(0, c.at - 0.02))).normalize(); }
      }
      s.parts = Array.from({ length: N }, () => ({ u: Math.random() * (s.len || 1), v: 0.7 + Math.random() * 0.6, wait: 0, off: new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.012) }));
    }
    s.flow = damp(s.flow, target && st.scene.flow ? 1 : 0, 3, dt);
    s.occ = damp(s.occ, c ? st.scene.occlusion : 0, 2, dt);
    // the culprit lesion: an occluding thrombus (classic STEMI), a plaque with thrombus nearly closing it (left main
    // pattern), or a tight plaque that occluded and re-opened (Wellens: thrombus only while perfusion is lost)
    const lesion = lesionOf(T);
    const thrTarget = !c ? 0 : lesion === 'occlusion' ? st.scene.occlusion : lesion === 'near-occlusion' ? 0.7 * st.scene.occlusion : st.scene.perfusionLoss;
    s.thr = damp(s.thr, thrTarget, 2, dt);
    const k = shared.uVent.value;
    const blocked = lesion === 'stenosis' ? st.scene.perfusionLoss > 0.6 : s.occ > 0.6;
    const trickle = lesion === 'near-occlusion';
    const speed = 0.55 * (0.5 + 0.9 * live.state.vent); // coronary flow pulses with each contraction
    const findPt = (u: number) => { let i = 1; while (i < s.cum.length - 1 && s.cum[i] < u) i++; const a = s.cum[i - 1], b = s.cum[i]; return s.path[i - 1].clone().lerp(s.path[i], (u - a) / Math.max(1e-6, b - a)); };
    let n = 0;
    if (s.len > 0 && s.flow > 0.02) {
      for (const p of s.parts) {
        if (p.wait > 0) { p.wait -= dt; if (p.wait <= 0) p.u = 0; }
        else { const through = !blocked || (trickle && p.v > 1.12); p.u += speed * p.v * dt * (blocked && through ? 0.45 : 1); const lim = !through ? s.stop - 0.01 - (p.v - 0.7) * 0.06 : s.len; if (p.u >= lim) { p.u = lim; if (through) { p.u = 0; } else if (p.wait <= 0 && Math.random() < dt * 0.6) p.wait = 0.4 + Math.random(); } }
        const pos = beat(findPt(Math.max(0, p.u)).add(p.off), k);
        dummy.position.copy(pos); dummy.rotation.set(p.v * 9 + clock.time * p.v, p.v * 4, 0); dummy.scale.setScalar(0.011 * s.flow); dummy.updateMatrix();
        inst.current.setMatrixAt(n++, dummy.matrix);
      }
    }
    inst.current.count = n; inst.current.instanceMatrix.needsUpdate = true;
    clot.current.visible = s.thr > 0.02 && !!c;
    if (clot.current.visible) { clot.current.position.copy(beat(s.clotPos, k)); clot.current.scale.setScalar(s.clotR * (0.25 + 0.75 * s.thr) * (lesion === 'occlusion' ? 1 : 0.8)); clot.current.rotation.y += dt * 0.1; }
    plaque.current.visible = !!c && lesion !== 'occlusion' && s.occ > 0.02;
    if (plaque.current.visible) { plaque.current.position.copy(beat(s.clotPos, k)); plaque.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), s.tangent); plaque.current.scale.setScalar(s.vesselR * (1.1 + 0.9 * s.occ)); }
  });
  return (
    <>
      <instancedMesh ref={inst} args={[rbc, rbcMat, N]} frustumCulled={false} renderOrder={5} />
      <mesh ref={clot} geometry={clotGeo} material={clotMat} visible={false} renderOrder={6} />
      <mesh ref={plaque} geometry={plaqueGeo} material={plaqueMat} visible={false} renderOrder={6} />
    </>
  );
}

/* ------------------------------------------------------------------ short-axis slice */
/** mid-ventricular short-axis level, as a fraction of the LV base → apex length (papillary-muscle level) */
export const SLICE_LEVEL = 0.5;
/** the slice plane in the body frame: through the LV long axis at SLICE_LEVEL, normal pointing to the base (kept side) */
export function slicePlaneBody(asset: HeartAsset) {
  const base = new THREE.Vector3(...asset.mapping.lvAxis.base), apex = new THREE.Vector3(...asset.mapping.lvAxis.apex);
  const axis = apex.clone().sub(base).normalize();
  return { point: base.clone().addScaledVector(axis, asset.mapping.lvAxis.length * SLICE_LEVEL), normal: axis.clone().negate(), axis };
}

/**
 * The cut face of the ventricles. The apical part of the heart is clipped away (every heart material shares CLIP) and
 * the real cross-section of the LV and RV walls is capped and shaded from the endocardium outward, so the depth of the
 * ischaemia — inner layer only, or the full thickness of the wall — can be seen as the MI evolves.
 */
function SliceCaps({ asset, from }: { asset: HeartAsset; from: THREE.Mesh[] }) {
  const on = useApp((s) => s.slice);
  const plane = useMemo(() => slicePlaneBody(asset), [asset]);
  const caps = useMemo(() => from.map((m) => sliceSection(m.geometry, plane.point.clone().addScaledVector(plane.normal, 0.0004), plane.normal)).filter(Boolean) as THREE.BufferGeometry[], [from, plane]);
  const mat = useMemo(() => sliceCapMaterial(), []);
  const world = useMemo(() => new THREE.Plane(), []);
  useEffect(() => () => { caps.forEach((g) => g.dispose()); }, [caps]);
  useEffect(() => () => { mat.dispose(); CLIP.length = 0; }, [mat]);
  const wave = useRef(0);
  useFrame((_, dt) => {
    const st = useApp.getState(); const T = focusOf(st.territoryId);
    // the group is offset by −centre, and clipping planes live in world space
    if (on) { world.setFromNormalAndCoplanarPoint(plane.normal, plane.point.clone().sub(asset.center)); if (CLIP[0] !== world) { CLIP.length = 0; CLIP.push(world); } }
    else if (CLIP.length) CLIP.length = 0;
    // ischaemia starts in the inner layer and spreads outward with time; how far it gets depends on the lesion
    const target = T ? transmuralOf(T) * THREE.MathUtils.smoothstep(st.scene.injury, 0.02, 0.95) : 0;
    wave.current = damp(wave.current, target, 1.6, dt);
    mat.localUniforms.uWave.value = wave.current; mat.localUniforms.uCapInjury.value = shared.uInjury.value;
  });
  if (!on) return null;
  return <group>{caps.map((g, i) => <mesh key={i} geometry={g} material={mat} renderOrder={1} />)}</group>;
}

/* ------------------------------------------------------------------ conduction system and the electrical impulse */
/**
 * The impulse, beat by beat, from the rhythm schedule (engine/rhythm.ts) on the same clock as the ECG and the beat:
 * the SA node fires and a front crosses the atria (P wave) with sparks along the internodal routes and Bachmann's
 * bundle; the AV node conducts slowly and holds the impulse for the PR (amber), or blocks it (red) in AV block; then
 * the His bundle, bundle branches and Purkinje fibres light (QRS) — the right or left bundle late in a bundle branch
 * block, nothing above the ventricles for a ventricular escape — and a front sweeps the ventricular walls apex → base.
 * Walls turn see-through while it is on. Pathway positions are schematic; timing follows heart-internals' map.
 */
const ATRIAL_MS = 80;  // SA node → last atrial muscle
const VENT_MS = [117, 200] as const; // ventricular depolarisation window on the ventricular clock
type Group = 'sa' | 'av' | 'his' | 'right' | 'left';
const GROUP: Record<string, Group> = { sa_node: 'sa', av_node: 'av', his: 'his', rbb: 'right', purkinje_rv: 'right', lbb: 'left', lbb_anterior: 'left', lbb_posterior: 'left', lbb_septal: 'left', purkinje_lv: 'left' };
const BRANCH: Record<Group, 0 | 1 | 2> = { sa: 0, av: 0, his: 0, right: 1, left: 2 };

function Conduction() {
  const on = useApp((s) => s.conduction);
  const [hi, setHi] = useState<Layer<HeartInternalsMapping> | null>(null);
  useEffect(() => { if (!on || hi) return; let off = false; loadHeartInternals().then((x) => { if (!off) setHi(x); }).catch(() => undefined); return () => { off = true; }; }, [on, hi]);
  // drawn over the (see-through) walls so the pathway reads from any angle, like the flow overlays elsewhere in Cardiac
  const mats = useMemo(() => Object.fromEntries((['sa', 'av', 'his', 'right', 'left'] as Group[]).map((gname) => {
    const c = conductionMaterial(BRANCH[gname], { base: '#e0b040', glow: '#ffd76a' }); c.material.clippingPlanes = CLIP; c.material.depthTest = false; c.material.transparent = true; withBeat(c.material, 'mi-conduction-' + gname); return [gname, c];
  })) as Record<Group, ReturnType<typeof conductionMaterial>>, []);
  const parts = useMemo(() => {
    if (!hi) return [];
    return [...CONDUCTION, 'av_node_inferior_extension'].filter((id) => hi.meshes[id] && (GROUP[id] || id === 'av_node_inferior_extension')).map((id) => {
      const g = hi.meshes[id].geometry.clone(); const n = g.getAttribute('position').count;
      g.setAttribute('aCh', new THREE.BufferAttribute(new Float32Array(n).fill(id === 'sa_node' ? 2 : 1), 1));
      g.setAttribute('aRegA', new THREE.BufferAttribute(new Float32Array(n * 4), 4)); g.setAttribute('aRegB', new THREE.BufferAttribute(new Float32Array(n * 4), 4));
      return { id, g, mat: mats[GROUP[id] ?? 'av'].material };
    });
  }, [hi, mats]);
  // sparks: internodal routes SA → AV node (anterior, middle, posterior along the crista) and Bachmann's bundle to the LA
  const routes = useMemo(() => {
    if (!hi) return [];
    const L = hi.mapping.landmarks as unknown as Record<string, number[] | number[][]>;
    const v = (k: string) => new THREE.Vector3(...(L[k] as number[]));
    const sa = v('saBlock'), av = v('avBlock'); const mid = sa.clone().lerp(av, 0.5);
    const crista = (L.crista as number[][]).map((p) => new THREE.Vector3(...p));
    const curve = (pts: THREE.Vector3[]) => new THREE.CatmullRomCurve3(pts);
    return [
      { c: curve([sa, mid.clone().add(new THREE.Vector3(0.05, 0.03, 0.12)), av]), ms: 37 },
      { c: curve([sa, v('fossaOvalis').add(new THREE.Vector3(-0.02, 0.06, 0.06)), av]), ms: 37 },
      { c: curve([sa, ...crista.filter((_, i) => i % 4 === 0), v('csOstium'), av]), ms: 37 },
      { c: curve([sa, v('raAppendage').lerp(v('laAppendage'), 0.5).add(new THREE.Vector3(0, 0.05, -0.02)), v('laAppendage')]), ms: 70 },
    ];
  }, [hi]);
  const sparkGeo = useMemo(() => new THREE.SphereGeometry(1, 12, 8), []);
  const sparkMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffe48a', transparent: true, depthTest: false, blending: THREE.AdditiveBlending, clippingPlanes: CLIP }), []);
  const sparks = useRef<THREE.InstancedMesh>(null!);
  const blockMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ff3b2f', transparent: true, depthTest: false, blending: THREE.AdditiveBlending }), []);
  const holdMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffb52e', transparent: true, depthTest: false, blending: THREE.AdditiveBlending }), []);
  const block = useRef<THREE.Mesh>(null!); const hold = useRef<THREE.Mesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => () => parts.forEach((p) => p.g.dispose()), [parts]);
  useEffect(() => () => { Object.values(mats).forEach((c) => c.material.dispose()); sparkMat.dispose(); blockMat.dispose(); holdMat.dispose(); }, [mats, sparkMat, blockMat, holdMat]);
  useFrame((_, dt) => {
    const rs = live.state; const his0 = hi?.mapping.activation?.hisStart ?? 117;
    shared.uImpulse.value = damp(shared.uImpulse.value, on ? 1 : 0, 4, dt);
    // atrial side runs on the SA clock, ventricular side on the QRS clock
    const tA = rs.msSinceP < 0 ? -1000 : rs.msSinceP;
    for (const k of ['sa', 'av'] as Group[]) { mats[k].uniforms.uT.value = tA; mats[k].uniforms.uHisStart.value = 1e6; }
    const escapeV = rs.origin === 'ventricular';
    mats.his.uniforms.uT.value = escapeV ? -1000 : rs.msVent;
    for (const k of ['right', 'left'] as Group[]) {
      const u = mats[k].uniforms; u.uT.value = rs.msVent; u.uHisStart.value = his0;
      u.uRbbDelay.value = rs.kind === 'rbbb' ? 45 : escapeV ? 35 : 0; u.uLbbDelay.value = rs.kind === 'lbbb' ? 55 : escapeV ? 20 : 0;
    }
    // the walls: atrial front from the SA node, ventricular front apex → base
    if (hi) shared.uSA.value.set(...(hi.mapping.landmarks as unknown as Record<string, number[]>).saBlock as [number, number, number]);
    shared.uAtrWave.value = tA >= 0 && tA < ATRIAL_MS + 120 ? (tA / ATRIAL_MS) * 0.75 : -1;
    const wide = rs.kind === 'narrow' ? 1 : 1.7;
    const vw = (rs.msVent - VENT_MS[0]) / ((VENT_MS[1] - VENT_MS[0]) * wide);
    shared.uVentWave.value = vw >= -0.05 && vw < 1.6 ? Math.max(0, vw) : -1;
    // sparks along the atrial routes for the first ~80 ms after the SA node fires
    let n = 0;
    if (sparks.current) {
      if (on && tA >= 0 && tA < 90) for (const r of routes) for (let j = 0; j < 3; j++) {
        const f = (tA - j * 6) / r.ms; if (f < 0 || f > 1) continue;
        dummy.position.copy(r.c.getPointAt(f)); dummy.scale.setScalar(0.009 * (1 - j * 0.25)); dummy.updateMatrix(); sparks.current.setMatrixAt(n++, dummy.matrix);
      }
      sparks.current.count = n; sparks.current.instanceMatrix.needsUpdate = true;
    }
    // the AV node holding (amber) or blocking (red) the impulse
    if (hi && hold.current && block.current) {
      const p = (hi.mapping.landmarks as unknown as Record<string, number[]>).avBlock as [number, number, number];
      hold.current.position.set(...p); block.current.position.set(...p);
      const pulse = 0.75 + 0.25 * Math.sin(clock.time * 30);
      holdMat.opacity = on ? 0.55 * rs.avHold * pulse : 0; hold.current.scale.setScalar(0.022 + 0.006 * pulse);
      blockMat.opacity = on ? 0.85 * rs.avBlocked : 0; block.current.scale.setScalar(0.03 * (1.4 - 0.4 * rs.avBlocked));
    }
  });
  if (!on || !hi) return null;
  return <group>
    {parts.map((p) => <mesh key={p.id} geometry={p.g} material={p.mat} renderOrder={20} />)}
    <instancedMesh ref={sparks} args={[sparkGeo, sparkMat, 16]} frustumCulled={false} renderOrder={21} />
    <mesh ref={hold} geometry={sparkGeo} material={holdMat} renderOrder={22} />
    <mesh ref={block} geometry={sparkGeo} material={blockMat} renderOrder={22} />
  </group>;
}

/* ------------------------------------------------------------------ "Show me what the leads see" */
function LeadRig() {
  const show = useApp((s) => s.showLeads);
  const leadId = useApp((s) => s.leadId);
  const torsoMat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { uOp: { value: 0.0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform float uOp; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0-abs(dot(normalize(vN),normalize(vV))),3.0); gl_FragColor = vec4(vec3(0.72,0.8,0.86), (0.03 + 0.3*f)*uOp); }',
  }), []);
  const torso = useMemo(() => { const g = new THREE.SphereGeometry(1, 64, 40); g.scale(...TORSO_RADII); return g; }, []);
  const op = useRef(0);
  useFrame((_, dt) => { op.current = damp(op.current, show ? (leadId ? 0.35 : 1) : 0, 3, dt); torsoMat.uniforms.uOp.value = op.current; });
  if (!show) return null;
  return (
    <group>
      <mesh geometry={torso} material={torsoMat} renderOrder={10} />
      {LEADS.map((l) => <LeadVector key={l.id} id={l.id} selected={leadId === l.id} viewing={!!leadId} />)}
    </group>
  );
}

function LeadVector({ id, selected, viewing }: { id: LeadId; selected: boolean; viewing: boolean }) {
  const l = LEAD[id];
  const e = new THREE.Vector3(...l.electrode);
  const dir = new THREE.Vector3(...l.view);
  const color = l.group === 'limb' ? '#9fc3d4' : l.group === 'precordial' ? '#e6d2b8' : l.group === 'posterior' ? '#c9b2e8' : '#e8b0a8';
  const line = useMemo(() => { const g = new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(0.9), e]); return g; }, [id]);
  const beam = useMemo(() => {
    const len = e.length() - 0.7; const g = new THREE.ConeGeometry(0.55, len, 40, 1, true); g.translate(0, -len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone())); g.translate(e.x, e.y, e.z);
    return g;
  }, [id]);
  const beamMat = useMemo(() => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uC: { value: new THREE.Color('#8fd0e0') } },
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = position.y; vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV=-mv.xyz; gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uC; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0-abs(dot(normalize(vN),normalize(vV))); gl_FragColor = vec4(uC, 0.05 + 0.12*f); }' }), []);
  return (
    <group>
      <line>
        <primitive object={line} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={selected ? 0.95 : 0.35} />
      </line>
      {!selected && <mesh position={e} onClick={(ev) => { ev.stopPropagation(); selectLead(id); }}>
        <sphereGeometry args={[selected ? 0.07 : 0.05, 16, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.25} />
      </mesh>}
      {!selected && <Html position={e.clone().multiplyScalar(1.08)} center distanceFactor={(viewing ? 5 : 8) * (PHONE ? 0.6 : 1)} zIndexRange={[20, 0]}>
        <button className={`lead-tag g-${l.group}${viewing ? ' small' : ''}`} onClick={() => selectLead(id)}>{l.label}</button>
      </Html>}
    </group>
  );
}

export function selectLead(id: LeadId | null) {
  const s = useApp.getState(); s.set({ leadId: s.leadId === id ? null : id });
}

/* ------------------------------------------------------------------ camera */
function dirVec(d: Vec3) { return new THREE.Vector3(...d).normalize(); }

function CameraRig({ asset }: { asset: HeartAsset }) {
  const ref = useRef<CameraControls>(null!); useCameraGate(ref);
  const { size } = useThree();
  const last = useRef({ key: '', t0: 0, idle: 0 });
  const nonce = useApp((s) => s.cameraNonce);
  useEffect(() => { last.current.key = ''; }, [nonce]);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const onStart = () => { last.current.idle = -1; }; const onEnd = () => { last.current.idle = 0; };
    c.addEventListener('controlstart', onStart); c.addEventListener('controlend', onEnd);
    return () => { c.removeEventListener('controlstart', onStart); c.removeEventListener('controlend', onEnd); };
  }, []);
  useFrame((_, dt) => {
    const c = ref.current; if (!c) return;
    const st = useApp.getState();
    const T = focusOf(st.territoryId);
    const aspectBoost = (size.width < size.height ? Math.pow(size.height / size.width, 0.45) : 1) * (size.width < 640 ? 0.9 : 1);
    let key = 'overview'; let dir = new THREE.Vector3(0.28, 0.12, 1).normalize(); let dist = 4.7; let target = new THREE.Vector3(0, -0.05, 0);
    if (st.showLeads && !st.leadId) { key = 'leads'; dir = new THREE.Vector3(0.45, 0.3, 1).normalize(); dist = 9.5; }
    else if (st.slice && !st.leadId) {
      // look at the cut face from the apex side, tilted a little so the wall ring reads as a solid ring
      const sp = slicePlaneBody(asset); key = 'slice';
      dir = sp.axis.clone().add(new THREE.Vector3(0, 0.1, 0.06)).normalize(); dist = 4.0; target = sp.point.clone().sub(asset.center).addScaledVector(sp.axis, -0.08);
    }
    if (key === 'slice') { /* keep the slice view */ }
    else if (st.leadId) { key = 'lead-' + st.leadId; dir = dirVec(LEAD[st.leadId].view); dist = st.showLeads ? 7.5 : 4.6; }
    else if (T && st.scene.camera === 'territory') { key = 'terr-' + T.id; dir = dirVec(T.cameraPosition.dir); dist = T.cameraPosition.distance; }
    else if (T && st.scene.camera === 'vessel') {
      const cp = culpritFor(T, st.dominance, st.culpritIndex); const p = centerlineAt(asset.mapping.vessels[cp.vessel].centerline, cp.at).sub(asset.center);
      key = 'vessel-' + T.id + cp.vessel; dir = p.clone().normalize().multiplyScalar(0.75).add(new THREE.Vector3(0, 0.25, 0.35)).normalize(); dist = 3.4; target = p.multiplyScalar(0.55);
    } else if (st.vesselId && st.scene.camera === 'free') {
      const line = asset.mapping.vessels[st.vesselId].centerline; const p = centerlineAt(line, 0.4).sub(asset.center);
      key = 'sel-' + st.vesselId; dir = p.clone().normalize().add(new THREE.Vector3(0, 0.15, 0.2)).normalize(); dist = 3.8; target = p.multiplyScalar(0.4);
    }
    dist *= aspectBoost * 0.86; // frame the heart closer in the side-by-side pane
    if (key !== last.current.key) {
      last.current.key = key; last.current.t0 = clock.time;
      const pos = target.clone().add(dir.multiplyScalar(dist));
      c.smoothTime = 1.0;
      c.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, true);
    }
    // gentle orbit while idle in the overview
    if (key === 'overview' && last.current.idle >= 0) { last.current.idle += dt; if (last.current.idle > 3) c.rotate(dt * 0.05, 0, false); }
  });
  return <CameraControls ref={ref} makeDefault minDistance={2} maxDistance={12} dollySpeed={0.5} smoothTime={1} draggingSmoothTime={0.12} />;
}
