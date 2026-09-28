/**
 * Blood scenes. A cut-open venule over a slab of tissue:
 *  - red cells flow (faster in the centre), darkening from arterial SaO₂ at the inlet to venous
 *    SvO₂ at the outlet as O₂ leaves through the wall for the tissue;
 *  - neutrophils (lobed nucleus) and lymphocytes (round nucleus) roll along the wall;
 *  - platelets travel near the wall;
 *  - clot labs: the wall tears, blood escapes, platelets pile into a plug and a fibrin mesh forms
 *    at rates set by platelet count, INR/aPTT and fibrinogen.
 * Counts follow the lab values linearly (blood/model.ts).
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { bench } from '../bench';
import { useLabUI } from '../labStore';
import { useUI } from '../../app/store';
import type { MicroAsset } from '../../asset/micro';
import { bloodModel, type BloodModel, type BloodFocus } from './model';
import { GLSL_NOISE } from '../../scene/Studio';

export const L = 9, R = 1.3, CY = 0.35;
const MAXR = 200, MAXW = 22, MAXP = 80, MAXO = 140, MAXB = 40, MAXPLUG = 70;
export const blood = { model: null as BloodModel | null, t: 0, sealedAt: null as number | null, bleeding: 0, plugFill: 0, fibrinFill: 0 };
const rnd = (() => { let s = 99; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })();
const oxy = new THREE.Color('#d8141a'), deoxy = new THREE.Color('#5a0d24');
const satColor = (sat: number, out: THREE.Color) => out.copy(deoxy).lerp(oxy, Math.max(0, Math.min(1, (sat - 0.45) / 0.53)) ** 1.25);
const focusNow = (): BloodFocus => { const m = blood.model; const st = useLabUI.getState().step; if (!m || !m.chain.length) return 'none'; return m.chain[((st % m.chain.length) + m.chain.length) % m.chain.length].focus; };

/* ------------------------------------------------------------------ materials */
function endothelium(opacity = 1, front = false) {
  const m = new THREE.MeshPhysicalMaterial({ color: '#cf9189', roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: new THREE.Color('#ffd6cc'), side: THREE.DoubleSide, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvO = position;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;\n' + GLSL_NOISE)
      // endothelial cells are long flat cobblestones aligned with the flow; each has an oval nucleus
      .replace('#include <color_fragment>', `#include <color_fragment>
        { vec3 q = vec3(vO.x * 0.9, vO.y * 2.6, vO.z * 2.6); vec2 v = voro(q); float edge = 1.0 - smoothstep(0.03, 0.09, v.y - v.x); float nuc = 1.0 - smoothstep(0.12, 0.2, v.x);
          diffuseColor.rgb *= 0.9 + 0.12 * fbm(vO * 3.0); diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.62, edge); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.55, 0.36, 0.52), nuc * 0.55); }`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>\n${front ? '{ float f = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.5); gl_FragColor.a = clamp(gl_FragColor.a + f * 0.35, 0.0, 0.6); }' : ''}`);
  };
  m.customProgramCacheKey = () => 'endo' + front;
  return m;
}
/** Part of a tube (inner surface), angles a0→a1 around the x axis (a = 0 is +y, π/2 is +z toward the viewer). */
function tubeWall(a0: number, a1: number, r = R) {
  const nx = 90, na = 48; const pos: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= na; j++) { const x = -L / 2 + (i / nx) * L, a = a0 + (j / na) * (a1 - a0); const cy = Math.cos(a), cz = Math.sin(a); pos.push(x, cy * r, cz * r); nor.push(0, -cy, -cz); }
  for (let i = 0; i < nx; i++) for (let j = 0; j < na; j++) { const k = i * (na + 1) + j; idx.push(k, k + na + 1, k + 1, k + 1, k + na + 1, k + na + 2); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx); return g;
}

/** Biconcave disc (Evans–Fung profile), radius r, as a smooth lathe. */
function rbcDisc(r: number) {
  const C0 = 0.81 / 3.91, C2 = 7.83 / 3.91, C4 = -4.39 / 3.91; const n = 28; const pts: THREE.Vector2[] = [];
  const h = (q: number) => 0.5 * Math.sqrt(Math.max(0, 1 - q * q)) * (C0 + C2 * q * q + C4 * q ** 4);
  for (let i = 0; i <= n; i++) { const q = Math.sin((i / n) * Math.PI / 2); pts.push(new THREE.Vector2(q * r, -h(q) * r - (i === n ? 0 : 0))); }
  for (let i = n - 1; i >= 0; i--) { const q = Math.sin((i / n) * Math.PI / 2); pts.push(new THREE.Vector2(q * r, h(q) * r)); }
  pts[0].x = 0.0001; pts[pts.length - 1].x = 0.0001;
  const g = new THREE.LatheGeometry(pts, 36); g.computeVertexNormals(); g.computeBoundingSphere(); return g;
}

/* ------------------------------------------------------------------ scene */
export function BloodScene({ micro }: { micro: MicroAsset }) {
  const key = useRef(-1); const lab = useLabUI((s) => s.lab); const labels = useLabUI((s) => s.labelsOn);
  const clot = useRef(false);
  const rbcGeo = useMemo(() => rbcDisc(0.34), []); void micro;
  const back = useMemo(() => tubeWall(Math.PI * 0.72, Math.PI * 2 + 0.05), []), front = useMemo(() => tubeWall(0.05, Math.PI * 0.72), []);
  const backM = useMemo(() => endothelium(1), []), frontM = useMemo(() => endothelium(0.12, true), []);
  const plasmaM = useMemo(() => new THREE.MeshBasicMaterial({ color: '#f4e3a0', transparent: true, opacity: 0.05, depthWrite: false }), []);
  // pools
  const R_ = useMemo(() => Array.from({ length: MAXR }, () => ({ x: rnd() * L - L / 2, r: Math.sqrt(rnd()) * (R - 0.45), a: rnd() * Math.PI * 2, s: 0, on: false, sp: rnd() * 6, tilt: rnd() * 3 })), []);
  const W_ = useMemo(() => Array.from({ length: MAXW }, (_, i) => ({ x: rnd() * L - L / 2, a: 1.75 + rnd() * 1.2, aBack: Math.PI + 0.6 + rnd() * 1.2, s: 0, on: false, lym: i % 3 === 2, roll: rnd() * 6 })), []);
  const P_ = useMemo(() => Array.from({ length: MAXP }, () => ({ x: rnd() * L - L / 2, r: R - 0.25 - rnd() * 0.35, a: rnd() * Math.PI * 2, s: 0, on: false, sp: rnd() * 6 })), []);
  const O_ = useMemo(() => Array.from({ length: MAXO }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0 })), []);
  const B_ = useMemo(() => Array.from({ length: MAXB }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, rot: rnd() * 6 })), []);
  const PLUG = useMemo(() => Array.from({ length: MAXPLUG }, (_, k) => { const ring = Math.floor(Math.sqrt(k)); const ang = rnd() * Math.PI * 2; const rr = 0.08 * ring + rnd() * 0.06; const h = 0.12 + 0.3 * rnd() * (1 - ring / 9); return { off: new THREE.Vector3(Math.cos(ang) * rr * 1.6, h + Math.max(0, 0.55 - rr) * 0.5, Math.sin(ang) * rr), ord: k }; }), []);
  const rbcRef = useRef<THREE.InstancedMesh>(null), pltRef = useRef<THREE.InstancedMesh>(null), actRef = useRef<THREE.InstancedMesh>(null), o2Ref = useRef<THREE.InstancedMesh>(null), bleedRef = useRef<THREE.InstancedMesh>(null);
  const wbcRefs = useRef<(THREE.Group | null)[]>([]); const fibRef = useRef<THREE.LineSegments>(null); const injury = useRef<THREE.Group>(null);
  const tr = useRef<Record<string, THREE.Group | null>>({}); const tv = useRef<Record<string, HTMLDivElement | null>>({});
  const show = (k: string, on: boolean) => { const g = tr.current[k]; if (g) g.visible = on; const d = tv.current[k]; if (d) { const v = on ? '' : 'none'; if (d.style.display !== v) d.style.display = v; } };
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), c: new THREE.Color(), v: new THREE.Vector3() }), []);
  const rbcMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.25, sheen: 0.6, sheenColor: new THREE.Color('#ff9a8a') }), []);
  const pltMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#eadcaa', roughness: 0.4, clearcoat: 0.5, emissive: new THREE.Color('#3a2f10'), emissiveIntensity: 0.2 }), []);
  const actMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#dcb45e', roughness: 0.5, clearcoat: 0.3, emissive: new THREE.Color('#402a05'), emissiveIntensity: 0.3 }), []);
  const o2Mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#bfeaff', transparent: true, opacity: 0.9 }), []);
  const fibGeo = useMemo(() => { const n = 420; const pos = new Float32Array(n * 6); for (let i = 0; i < n; i++) { const a = new THREE.Vector3((rnd() - 0.5) * 1.8, 0.02 + rnd() * 0.75, (rnd() - 0.5) * 1.1); const b = a.clone().add(new THREE.Vector3().randomDirection().multiplyScalar(0.25 + rnd() * 0.45)); b.y = Math.max(0.01, b.y); pos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setDrawRange(0, 0); return g; }, []);
  const collagen = useMemo(() => { const gs: THREE.BufferGeometry[] = []; for (let i = 0; i < 9; i++) { const z = (rnd() - 0.5) * 0.7; const pts = [new THREE.Vector3(-0.75, -0.02, z), new THREE.Vector3(-0.2, -0.08 - rnd() * 0.08, z + (rnd() - 0.5) * 0.3), new THREE.Vector3(0.3, -0.05, z + (rnd() - 0.5) * 0.3), new THREE.Vector3(0.75, -0.02, z)]; gs.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.025, 6)); } return gs; }, []);
  useEffect(() => { (window as unknown as { __blood: typeof blood }).__blood = blood; return () => { blood.model = null; }; }, []);

  useFrame((st, dtRaw) => {
    const dt = Math.min(0.05, dtRaw); const dtR = Math.min(0.25, dtRaw); const t = st.clock.elapsedTime;
    if (bench.version !== key.current || blood.model?.labId !== lab) {
      key.current = bench.version; const m = bloodModel(lab, bench.snap, bench.pt); if (!m) return;
      const was = blood.model; blood.model = m;
      const d = (a: number, b: number) => (isFinite(a) || isFinite(b)) && !(Math.abs(a - b) < 0.05); if (!was || was.kind !== m.kind || d(was.seal, m.seal) || d(was.plug, m.plug) || d(was.fibrin, m.fibrin)) { blood.t = 0; blood.sealedAt = null; }
      R_.forEach((c, i) => (c.on = i < m.nRbc)); W_.forEach((c, i) => (c.on = i < m.nWbc)); P_.forEach((c, i) => (c.on = i < m.nPlt));
    }
    const m = blood.model; if (!m) return; const isClot = m.kind === 'clot'; clot.current = isClot; const f = focusNow(); const hl = (k: BloodFocus) => (f === 'none' || f === k ? 1 : 0.35);
    // clot timeline
    const S = m.seal; const cycle = isFinite(S) ? Math.min(30, S + 5) : 22; if (isClot) { blood.t += Math.min(0.25, dtRaw); if (blood.t > cycle) { blood.t = 0; blood.sealedAt = null; } }
    const T = blood.t; const prog = isFinite(S) ? Math.min(1, T / S) : Math.min(0.55, T / 30);
    blood.plugFill = isClot ? Math.min(1, T / ((isFinite(S) ? S : 30) * 0.6)) * m.plug : 0;
    const onset = (isFinite(S) ? S : 20) * 0.35; blood.fibrinFill = isClot ? Math.max(0, Math.min(1, (T - onset) / Math.max(0.5, (isFinite(S) ? S : 30) * 0.65))) * m.fibrin : 0;
    blood.bleeding = isClot ? Math.pow(1 - prog, 1.5) : 0; if (isClot && prog >= 1 && blood.sealedAt == null) blood.sealedAt = S;
    // red cells: parabolic flow profile, colour from arterial → venous saturation along the vessel
    const vmax = 1.7 * m.flow; const rbc = rbcRef.current;
    if (rbc) {
      R_.forEach((c, i) => {
        c.s += ((c.on ? 1 : 0) - c.s) * Math.min(1, dtR * 2.5);
        const slow = isClot && Math.abs(c.x) < 1.2 ? 0.6 : 1; c.x += vmax * (1 - (c.r / R) ** 2) * dt * slow; if (c.x > L / 2) { c.x -= L; c.a = rnd() * Math.PI * 2; }
        const zz = Math.sin(c.a) * c.r, yy = Math.cos(c.a) * c.r; const push = isClot && Math.abs(c.x) < 2.2 && zz > -0.25 && yy < 0.2 ? 1 - Math.abs(c.x) / 2.2 : 0; tmp.o.position.set(c.x, CY + yy + push * 0.5, zz - push * (zz + 0.45)); tmp.o.rotation.set(c.sp + t * 0.7 * (1 - c.r / R), c.tilt, t * 0.3 + c.sp); tmp.o.scale.setScalar(Math.max(0.0001, c.s)); tmp.o.updateMatrix(); rbc.setMatrixAt(i, tmp.o.matrix);
        const u = (c.x + L / 2) / L; satColor(m.sao2 + (m.svo2 - m.sao2) * u, tmp.c).multiplyScalar(hl(f === 'o2' || f === 'tissue' ? f : 'rbc') < 1 && f !== 'o2' && f !== 'tissue' ? 0.45 : 1); rbc.setColorAt(i, tmp.c);
      });
      rbc.instanceMatrix.needsUpdate = true; if (rbc.instanceColor) rbc.instanceColor.needsUpdate = true;
    }
    // O₂ leaving the red cells through the wall into the tissue
    const o2 = o2Ref.current;
    if (o2) {
      const rate = isClot ? 0 : 18 * m.flow * Math.max(0.05, m.sao2 - m.svo2) / 0.25;
      let spawn = rate * dt; for (const o of O_) { if (o.life > 0) continue; if (spawn < rnd()) break; spawn -= 1; const c = R_[Math.floor(rnd() * Math.max(1, m.nRbc))]; o.p.set(c.x, CY + Math.cos(c.a) * c.r, Math.sin(c.a) * c.r); o.v.set(0.15 * m.flow, -0.9 - rnd() * 0.4, (rnd() - 0.5) * 0.4); o.life = 1; }
      O_.forEach((o, i) => { if (o.life > 0) { o.p.addScaledVector(o.v, dt); if (o.p.y < CY - R - 0.9) o.life -= dt * 3; } tmp.o.position.copy(o.p); tmp.o.rotation.set(0, 0, 0); tmp.o.scale.setScalar(o.life > 0 ? (f === 'o2' || f === 'tissue' ? 1.5 : 1) : 0.0001); tmp.o.updateMatrix(); o2.setMatrixAt(i, tmp.o.matrix); });
      o2.instanceMatrix.needsUpdate = true;
    }
    // white cells roll slowly along the lower wall (margination)
    W_.forEach((c, i) => {
      const g = wbcRefs.current[i]; if (!g) return; c.s += ((c.on ? 1 : 0) - c.s) * Math.min(1, dtR * 2); const rad = c.lym ? 0.38 : 0.56;
      c.x += 0.28 * m.flow * dt; if (c.x > L / 2) c.x -= L; c.roll += 0.28 * m.flow * dt / rad;
      const aa = isClot ? c.aBack : c.a; g.position.set(c.x, CY + Math.cos(aa) * (R - rad - 0.03), Math.sin(aa) * (R - rad - 0.03)); g.rotation.set(0, 0, -c.roll); g.scale.setScalar(Math.max(0.0001, c.s) * (f === 'wbc' ? 1.08 : 1)); g.visible = c.s > 0.01;
    });
    // platelets near the wall; in a clot some are captured into the plug
    const plt = pltRef.current, act = actRef.current; const nPlug = Math.round(MAXPLUG * blood.plugFill / 1.4);
    if (plt) {
      P_.forEach((c, i) => { c.s += ((c.on ? 1 : 0) - c.s) * Math.min(1, dtR * 2.5); c.x += vmax * (1 - (c.r / R) ** 2) * dt; if (c.x > L / 2) c.x -= L; tmp.o.position.set(c.x, CY + Math.cos(c.a) * c.r, Math.sin(c.a) * c.r); tmp.o.rotation.set(c.sp + t, c.sp, 0); tmp.o.scale.setScalar(Math.max(0.0001, c.s) * (f === 'plt' || f === 'plug' ? 1.35 : 1)); tmp.o.updateMatrix(); plt.setMatrixAt(i, tmp.o.matrix); });
      plt.instanceMatrix.needsUpdate = true;
    }
    if (act) {
      PLUG.forEach((pp, k) => { const on = isClot && k < nPlug; tmp.o.position.set(pp.off.x, CY - R + 0.02 + pp.off.y, pp.off.z); tmp.o.rotation.set(k, k * 0.7, 0); tmp.o.scale.setScalar(on ? 1 + 0.08 * Math.sin(t * 3 + k) : 0.0001); tmp.o.updateMatrix(); act.setMatrixAt(k, tmp.o.matrix); });
      act.instanceMatrix.needsUpdate = true;
    }
    // escaping blood through the tear
    const bl = bleedRef.current;
    if (bl) {
      let spawn = isClot ? 7 * blood.bleeding * dt : 0; for (const b of B_) { if (b.life > 0) continue; if (spawn < rnd()) break; spawn -= 1; b.p.set((rnd() - 0.5) * 0.6, CY - R + 0.2, (rnd() - 0.5) * 0.4); b.v.set((rnd() - 0.5) * 0.5, -1.1 - rnd() * 0.6, (rnd() - 0.5) * 0.6); b.life = 1; }
      B_.forEach((b, i) => { if (b.life > 0) { b.p.addScaledVector(b.v, dt); if (b.p.y < CY - R - 0.75) { b.v.multiplyScalar(0.9); b.life -= dt * 0.35; } b.rot += dt * 2; } tmp.o.position.copy(b.p); tmp.o.rotation.set(b.rot, b.rot * 0.6, 0); tmp.o.scale.setScalar(b.life > 0 ? Math.min(1, b.life * 2) : 0.0001); tmp.o.updateMatrix(); bl.setMatrixAt(i, tmp.o.matrix); tmp.c.copy(deoxy).lerp(oxy, 0.6); bl.setColorAt(i, tmp.c); });
      bl.instanceMatrix.needsUpdate = true; if (bl.instanceColor) bl.instanceColor.needsUpdate = true;
    }
    if (fibRef.current) { fibGeo.setDrawRange(0, Math.floor(420 * Math.min(1, blood.fibrinFill / 1.2)) * 2); (fibRef.current.material as THREE.LineBasicMaterial).opacity = 0.4 + 0.5 * Math.min(1, m.fibrin); }
    if (injury.current) injury.current.visible = isClot;
    // label trackers follow one of each
    const pickR = R_.find((c) => c.on && c.s > 0.9 && Math.abs(c.x + 1.5) < 1.2 && Math.sin(c.a) > 0.2);
    if (tr.current.rbc && pickR) tr.current.rbc.position.set(pickR.x, CY + Math.cos(pickR.a) * pickR.r, Math.sin(pickR.a) * pickR.r);
    const w = W_.findIndex((c) => c.on && !c.lym), ly = W_.findIndex((c) => c.on && c.lym);
    show('neu', w >= 0); if (tr.current.neu && w >= 0 && wbcRefs.current[w]) tr.current.neu.position.copy(wbcRefs.current[w]!.position);
    show('lym', ly >= 0); if (tr.current.lym && ly >= 0 && wbcRefs.current[ly]) tr.current.lym.position.copy(wbcRefs.current[ly]!.position);
    const pp = P_.find((c) => c.on && Math.abs(c.x - 1.8) < 1.5 && Math.sin(c.a) > 0); show('plt', !!pp); if (tr.current.plt && pp) tr.current.plt.position.set(pp.x, CY + Math.cos(pp.a) * pp.r, Math.sin(pp.a) * pp.r);
    show('rbc', !!pickR);
    show('injury', isClot); show('plug', isClot && nPlug > 3); show('fibrin', isClot && blood.fibrinFill > 0.15); show('bleed', isClot && blood.bleeding > 0.1);
    show('o2', !isClot); for (const k of ['wall', 'plasma', 'inlet', 'outlet', 'tissue']) show(k, true);
  });

  const lbl = (k: string, text: string, pos: [number, number, number], cls = '') => <group key={k} ref={(r) => { tr.current[k] = r; }} position={pos}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div ref={(d) => { tv.current[k] = d; }} className={`blabel ${cls}`} style={{ display: 'none' }}>{text}</div></Html></group>;
  return (
    <group>
      <mesh geometry={back} material={backM} />
      <mesh geometry={front} material={frontM} renderOrder={6} />
      <mesh material={plasmaM} rotation={[0, 0, Math.PI / 2]} position={[0, CY, 0]} renderOrder={5}><cylinderGeometry args={[R - 0.02, R - 0.02, L, 48, 1, true]} /></mesh>
      <Tissue />
      <instancedMesh ref={rbcRef} args={[rbcGeo, rbcMat, MAXR]} frustumCulled={false} />
      <instancedMesh ref={pltRef} args={[new THREE.SphereGeometry(0.13, 12, 8).scale(1, 0.35, 1), pltMat, MAXP]} frustumCulled={false} />
      <instancedMesh ref={o2Ref} args={[new THREE.SphereGeometry(0.045, 8, 6), o2Mat, MAXO]} frustumCulled={false} />
      {Array.from({ length: MAXW }, (_, i) => <group key={i} ref={(r) => { wbcRefs.current[i] = r; }} visible={false}><WhiteCell lym={i % 3 === 2} /></group>)}
      <group ref={injury} position={[0, 0, 0]} visible={false}>
        <mesh position={[0, CY - R + 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.72, 40]} /><meshStandardMaterial color="#3a0a10" roughness={0.9} /></mesh>
        {collagen.map((g, i) => <mesh key={i} geometry={g} position={[0, CY - R + 0.02, 0]}><meshStandardMaterial color="#f1e2c0" roughness={0.6} /></mesh>)}
        <group position={[0, CY - R, 0]}>
          <instancedMesh ref={actRef} args={[new THREE.IcosahedronGeometry(0.12, 0), actMat, MAXPLUG]} frustumCulled={false} />
          <lineSegments ref={fibRef} geometry={fibGeo}><lineBasicMaterial color="#f7efd8" transparent opacity={0.7} /></lineSegments>
        </group>
        <instancedMesh ref={bleedRef} args={[rbcGeo, rbcMat, MAXB]} frustumCulled={false} />
      </group>
      {labels && <>
        {lbl('rbc', 'Red blood cell', [0, CY, 0.6], 'b-rbc')}
        {lbl('neu', 'Neutrophil (white cell)', [0, CY - R, 0], 'b-wbc')}
        {lbl('lym', 'Lymphocyte', [0, CY - R, 0], 'b-wbc')}
        {lbl('plt', 'Platelet', [1.8, CY, 0], 'b-plt')}
        {lbl('wall', 'Endothelium (vessel wall)', [-2.6, CY + R * 0.9, -R * 0.5])}
        {lbl('plasma', 'Plasma', [-3.6, CY + 0.35, 0.4])}
        {lbl('o2', 'O₂ leaving for the tissue', [1.0, CY - R - 0.4, 0.9], 'b-o2')}
        {lbl('tissue', 'Tissue (muscle) — uses the O₂', [-2.8, CY - R - 1.05, 1.2])}
        {lbl('inlet', 'Arterial end →', [-L / 2 + 0.6, CY - R - 0.15, R])}
        {lbl('outlet', '→ Venous end', [L / 2 - 0.9, CY - R - 0.15, R])}
        {lbl('injury', 'Tear — collagen exposed', [-0.9, CY - R - 0.2, 0.9], 'b-bad')}
        {lbl('plug', 'Platelet plug', [0.3, CY - R + 0.85, 0.3], 'b-plt')}
        {lbl('fibrin', 'Fibrin mesh', [0.95, CY - R + 0.55, 0.5])}
        {lbl('bleed', 'Blood escaping', [0.8, CY - R - 1.0, 0.6], 'b-bad')}
      </>}
    </group>
  );
}

function WhiteCell({ lym }: { lym: boolean }) {
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#e6e0f2', roughness: 0.55, clearcoat: 0.3, transparent: true, opacity: 0.8, depthWrite: false, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') }), []);
  const nucM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#5b3f9a', roughness: 0.45, clearcoat: 0.4 }), []);
  const granM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8c7e8', roughness: 0.6 }), []);
  const gran = useMemo(() => Array.from({ length: 26 }, () => new THREE.Vector3().randomDirection().multiplyScalar(0.22 + rnd() * 0.24)), []);
  if (lym) return (<group>
    <mesh material={body} renderOrder={7}><icosahedronGeometry args={[0.38, 4]} /></mesh>
    <mesh material={nucM} position={[0.03, 0.02, 0]}><sphereGeometry args={[0.29, 24, 18]} /></mesh>
  </group>);
  // neutrophil: 3–5 connected nuclear lobes, fine granules
  const lobes: [number, number, number][] = [[-0.2, 0.05, 0.05], [-0.05, -0.08, 0.1], [0.12, 0.02, -0.02], [0.22, 0.12, 0.08]];
  return (<group>
    <mesh material={body} renderOrder={7}><icosahedronGeometry args={[0.56, 4]} /></mesh>
    {lobes.map((p, i) => <mesh key={i} material={nucM} position={p}><sphereGeometry args={[0.11, 16, 12]} /></mesh>)}
    {lobes.slice(1).map((p, i) => { const a = new THREE.Vector3(...lobes[i]), b = new THREE.Vector3(...p); const mid = a.clone().add(b).multiplyScalar(0.5); const len = a.distanceTo(b); const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return <mesh key={'b' + i} material={nucM} position={mid} quaternion={q}><cylinderGeometry args={[0.035, 0.035, len, 8]} /></mesh>; })}
    {gran.map((p, i) => <mesh key={'g' + i} material={granM} position={p}><sphereGeometry args={[0.022, 6, 5]} /></mesh>)}
  </group>);
}

function Tissue() {
  const mat = useMemo(() => { const m = new THREE.MeshPhysicalMaterial({ color: '#a8484f', roughness: 0.5, clearcoat: 0.3, sheen: 0.4, sheenColor: new THREE.Color('#ffc6c0') }); m.onBeforeCompile = (sh) => { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvO = position;'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vO;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= 0.8 + 0.25 * smoothstep(0.3, 0.7, 0.5 + 0.5 * sin(vO.y * 50.0));'); }; return m; }, []);
  const fibres = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ z: -1.6 + i * 0.55, y: CY - R - 0.62 - (i % 2) * 0.08 })), []);
  return <group>{fibres.map((f, i) => <mesh key={i} material={mat} position={[0, f.y, f.z]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.26, L - 0.6, 8, 20]} /></mesh>)}</group>;
}

/** Re-render hook for the HUD. */
export function useBloodTick() { return useUI((s) => s.pulse); }
