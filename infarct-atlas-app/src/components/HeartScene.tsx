import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Html, Lightformer } from '@react-three/drei';
import type { HeartAsset } from '../asset/heartAsset';
import { centerlineAt } from '../asset/heartAsset';
import { useApp } from '../engine/store';
import { clock, mechanics } from '../engine/clock';
import { shared, tissueMaterial, coronaryMaterial, territoryMaterial, type TissueKind } from '../engine/shaders';
import { vesselTargets, regionVector, culpritFor, regionsOfVessel, REGION_ORDER, REGION_TO_TERRITORY } from '../engine/derive';
import { TERRITORY, TERRITORIES } from '../data/territories';
import { VESSEL } from '../data/vessels';
import { upstream, originOf } from '../data/vessels';
import { LEAD, LEADS, TORSO_RADII } from '../data/leads';
import type { LeadId, VesselId, Vec3 } from '../data/types';

const lerp = THREE.MathUtils.lerp;
const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
const damp = (cur: number, tgt: number, rate: number, dt: number) => lerp(cur, tgt, 1 - Math.exp(-rate * dt));

export function HeartScene({ asset }: { asset: HeartAsset }) {
  return (
    <Canvas
      className="heart-canvas"
      dpr={typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.05, far: 60, position: [1.2, 0.6, 4.6] }}
      onPointerMissed={() => { const s = useApp.getState(); if (s.mode === 'explore') s.set({ vesselId: null }); }}
    >
      <Studio />
      <group position={asset.center.clone().negate()}>
        <HeartModel asset={asset} />
        <FlowFX asset={asset} />
      </group>
      <LeadRig />
      <ContactShadows position={[0, -1.18, 0]} opacity={0.5} blur={2.8} far={2.6} scale={7} resolution={256} frames={1} color="#000000" />
      <CameraRig asset={asset} />
    </Canvas>
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

function HeartModel({ asset }: { asset: HeartAsset }) {
  const cor = useRef<Record<string, ReturnType<typeof coronaryMaterial>>>({});
  const masks = useRef<Record<string, ReturnType<typeof territoryMaterial>>>({});
  const fadeMats = useRef<THREE.Material[]>([]);
  const cur = useRef<Record<string, { occAt: number; perf: number; down: number; flow: number; state: number; maxS: number; dim: number }>>({});
  const terr = useRef({ w: new Array(8).fill(0), mask: {} as Record<string, number>, hover: {} as Record<string, number> });

  const objects = useMemo(() => {
    const list: THREE.Object3D[] = [];
    const m = asset.meshes;
    const origins = { right: asset.mapping.origins, left: asset.mapping.originsLeft };
    void origins;
    for (const [id, mesh] of Object.entries(m)) {
      const role = (mesh.userData.role as string) || '';
      if (role === 'coronary') {
        const mat = coronaryMaterial(); cor.current[mesh.userData.vessel] = mat; mesh.material = mat;
        mesh.renderOrder = 2;
      } else if (role === 'territory') {
        const mat = territoryMaterial(); masks.current[id.replace('territory_', '')] = mat; mesh.material = mat; mesh.renderOrder = 3; mesh.raycast = () => {};
      } else if (ROLE_KIND[role]) {
        const fade = FADEABLE.includes(id);
        const mat = tissueMaterial(ROLE_KIND[role], { fadeable: fade }); mesh.material = mat; if (fade) fadeMats.current.push(mat);
        mesh.renderOrder = fade ? 4 : 0;
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
  }, [asset]);

  // pick tubes for thin coronaries
  const pickers = useMemo(() => Object.entries(asset.mapping.vessels).map(([id, v]) => {
    const curve = new THREE.CatmullRomCurve3(v.centerline.map((p) => new THREE.Vector3(...p)));
    const g = new THREE.TubeGeometry(curve, 48, 0.04, 6, false);
    return { id: id as VesselId, g };
  }), [asset]);
  const pickMat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), []);

  useFrame((_, dt) => {
    const st = useApp.getState();
    const t = clock.tick(); const mech = mechanics(t);
    shared.uTime.value = t; shared.uVent.value = mech.vent; shared.uAtr.value = mech.atria;
    const T = st.territoryId ? TERRITORY[st.territoryId] : null;
    // territory weights: the MI territory, or the regions a selected vessel supplies
    let wTarget = regionVector(T);
    if (!T && st.vesselId) { const r = regionsOfVessel(st.vesselId, st.dominance); wTarget = REGION_ORDER.map((k) => r[k] ?? 0); }
    terr.current.w = terr.current.w.map((w, i) => damp(w, wTarget[i], 3, dt));
    const w = terr.current.w;
    shared.uTerrA.value.set(w[0], w[1], w[2], w[3]); shared.uTerrB.value.set(w[4], w[5], w[6], w[7]);
    shared.uInjury.value = damp(shared.uInjury.value, T ? st.scene.injury : 0, 2.2, dt);
    shared.uHypo.value = shared.uInjury.value;
    const lead = st.leadId ? LEAD[st.leadId] : null;
    if (lead) shared.uLeadDir.value.lerp(new THREE.Vector3(...lead.view), 1 - Math.exp(-5 * dt)).normalize();
    shared.uLeadOn.value = damp(shared.uLeadOn.value, lead ? 1 : 0, 4, dt);
    const fadeOn = st.cutaway || (T?.cutaway && st.scene.highlightVessel) ? 1 : 0;
    shared.uFade.value = damp(shared.uFade.value, fadeOn, 2.5, dt);
    fadeMats.current.forEach((m) => { m.depthWrite = shared.uFade.value < 0.05; (m as any).opacity = 1 - 0.82 * shared.uFade.value; });

    // vessels
    const targets = vesselTargets({ territoryId: st.territoryId, culpritIndex: st.culpritIndex, vesselId: st.vesselId, hoverVessel: st.hoverVessel, dominance: st.dominance, scene: st.scene, origins: { right: asset.mapping.origins, left: asset.mapping.originsLeft } });
    for (const [vid, mat] of Object.entries(cor.current)) {
      const tg = targets[vid as VesselId]; if (!tg) continue;
      const c = (cur.current[vid] ??= { ...tg });
      c.occAt = tg.occAt; c.perf = damp(c.perf, tg.perf, 2, dt); c.down = damp(c.down, tg.down, 2, dt); c.flow = damp(c.flow, tg.flow, 3, dt);
      c.state = tg.state; c.maxS = damp(c.maxS, Math.min(tg.maxS, 1.2), 3, dt); c.dim = damp(c.dim, tg.dim, 3, dt);
      const u = mat.localUniforms; u.uOccAt.value = c.occAt; u.uPerf.value = c.perf; u.uDown.value = c.down; u.uFlow.value = c.flow; u.uState.value = c.state; u.uMaxS.value = c.maxS > 1.1 ? 2 : c.maxS; u.uDim.value = c.dim;
    }
    // territory masks
    for (const [tid, mat] of Object.entries(masks.current)) {
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

  return (
    <group>
      {objects.map((o) => {
        const role = o.userData.role;
        if (role === 'myocardium') return <primitive key={o.uuid} object={o} onPointerMove={onMyoMove} onPointerOut={() => useApp.getState().set({ hoverTerritory: null })} onClick={onMyoClick} />;
        return <primitive key={o.uuid} object={o} />;
      })}
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
  const state = useRef({ key: '', path: [] as THREE.Vector3[], cum: [] as number[], len: 0, stop: Infinity, parts: [] as { u: number; v: number; wait: number; off: THREE.Vector3 }[], clotPos: new THREE.Vector3(), clotR: 0.02, flow: 0, occ: 0 });
  const rbc = useMemo(() => { const g = new THREE.SphereGeometry(1, 12, 8); g.scale(1, 0.42, 1); return g; }, []);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#b3121c', roughness: 0.35, clearcoat: 0.6, emissive: '#5a0608', emissiveIntensity: 0.6 }), []);
  const clotGeo = useMemo(() => { const g = new THREE.IcosahedronGeometry(1, 4); const p = g.attributes.position; const v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = 1 + 0.18 * Math.sin(v.x * 7.1) * Math.sin(v.y * 6.3 + 1) + 0.1 * Math.sin(v.z * 11.0); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y * 0.8, v.z); } g.computeVertexNormals(); return g; }, []);
  const clotMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#3d0a0e', roughness: 0.55, clearcoat: 0.5, sheen: 1, sheenColor: new THREE.Color('#d9a45a'), sheenRoughness: 0.4, emissive: '#2a0304' }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => new THREE.Vector3(...asset.mapping.lvAxis.base), [asset]);
  const axis = useMemo(() => new THREE.Vector3(...asset.mapping.lvAxis.apex).sub(base).normalize(), [asset, base]);
  const beat = (p: THREE.Vector3, k: number) => { const d = p.clone().sub(base); const h = d.dot(axis); const ap = base.clone().add(axis.clone().multiplyScalar(h)); const r = p.clone().sub(ap); return ap.add(r.multiplyScalar(1 - 0.075 * k)).sub(axis.clone().multiplyScalar(h * 0.06 * k)); };

  useFrame((_, dt) => {
    const st = useApp.getState(); const s = state.current;
    const T = st.territoryId ? TERRITORY[st.territoryId] : null;
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
        if (c) { const line = asset.mapping.vessels[c.vessel].centerline; const p = centerlineAt(line, c.at); let best = 0, bd = Infinity; pts.forEach((q, i) => { const d = q.distanceTo(p); if (d < bd) { bd = d; best = i; } }); s.stop = s.cum[best]; s.clotPos.copy(p); s.clotR = Math.max(0.018, (asset.mapping.vessels[c.vessel].radius || 0.02) * 2.2); }
      }
      s.parts = Array.from({ length: N }, () => ({ u: Math.random() * (s.len || 1), v: 0.7 + Math.random() * 0.6, wait: 0, off: new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).multiplyScalar(0.012) }));
    }
    s.flow = damp(s.flow, target && st.scene.flow ? 1 : 0, 3, dt);
    s.occ = damp(s.occ, c ? st.scene.occlusion : 0, 2, dt);
    const k = shared.uVent.value; const blocked = s.occ > 0.6;
    const speed = 0.55 * (0.6 + 0.8 * Math.max(0, Math.sin(clock.time * Math.PI * 2 / 0.833)));
    const findPt = (u: number) => { let i = 1; while (i < s.cum.length - 1 && s.cum[i] < u) i++; const a = s.cum[i - 1], b = s.cum[i]; return s.path[i - 1].clone().lerp(s.path[i], (u - a) / Math.max(1e-6, b - a)); };
    let n = 0;
    if (s.len > 0 && s.flow > 0.02) {
      for (const p of s.parts) {
        if (p.wait > 0) { p.wait -= dt; if (p.wait <= 0) p.u = 0; }
        else { p.u += speed * p.v * dt; const lim = blocked ? s.stop - 0.01 - (p.v - 0.7) * 0.06 : s.len; if (p.u >= lim) { p.u = lim; if (!blocked) { p.u = 0; } else if (p.wait <= 0 && Math.random() < dt * 0.6) p.wait = 0.4 + Math.random(); } }
        const pos = beat(findPt(Math.max(0, p.u)).add(p.off), k);
        dummy.position.copy(pos); dummy.rotation.set(p.v * 9 + clock.time * p.v, p.v * 4, 0); dummy.scale.setScalar(0.011 * s.flow); dummy.updateMatrix();
        inst.current.setMatrixAt(n++, dummy.matrix);
      }
    }
    inst.current.count = n; inst.current.instanceMatrix.needsUpdate = true;
    clot.current.visible = s.occ > 0.02 && !!c;
    if (clot.current.visible) { clot.current.position.copy(beat(s.clotPos, k)); clot.current.scale.setScalar(s.clotR * (0.25 + 0.75 * s.occ)); clot.current.rotation.y += dt * 0.1; }
  });
  return (
    <>
      <instancedMesh ref={inst} args={[rbc, rbcMat, N]} frustumCulled={false} renderOrder={5} />
      <mesh ref={clot} geometry={clotGeo} material={clotMat} visible={false} renderOrder={6} />
    </>
  );
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
  const ref = useRef<CameraControls>(null!);
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
    const T = st.territoryId ? TERRITORY[st.territoryId] : null;
    const aspectBoost = (size.width < size.height ? Math.pow(size.height / size.width, 0.7) : 1) * (size.width < 640 ? 0.86 : 1);
    let key = 'overview'; let dir = new THREE.Vector3(0.28, 0.12, 1).normalize(); let dist = 4.7; let target = new THREE.Vector3(0, -0.05, 0);
    if (st.showLeads && !st.leadId) { key = 'leads'; dir = new THREE.Vector3(0.45, 0.3, 1).normalize(); dist = 9.5; }
    if (st.leadId) { key = 'lead-' + st.leadId; dir = dirVec(LEAD[st.leadId].view); dist = st.showLeads ? 7.5 : 4.6; }
    else if (T && st.scene.camera === 'territory') { key = 'terr-' + T.id; dir = dirVec(T.cameraPosition.dir); dist = T.cameraPosition.distance; }
    else if (T && st.scene.camera === 'vessel') {
      const cp = culpritFor(T, st.dominance, st.culpritIndex); const p = centerlineAt(asset.mapping.vessels[cp.vessel].centerline, cp.at).sub(asset.center);
      key = 'vessel-' + T.id + cp.vessel; dir = p.clone().normalize().multiplyScalar(0.75).add(new THREE.Vector3(0, 0.25, 0.35)).normalize(); dist = 3.4; target = p.multiplyScalar(0.55);
    } else if (st.vesselId && st.scene.camera === 'free') {
      const line = asset.mapping.vessels[st.vesselId].centerline; const p = centerlineAt(line, 0.4).sub(asset.center);
      key = 'sel-' + st.vesselId; dir = p.clone().normalize().add(new THREE.Vector3(0, 0.15, 0.2)).normalize(); dist = 3.8; target = p.multiplyScalar(0.4);
    }
    dist *= aspectBoost;
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
