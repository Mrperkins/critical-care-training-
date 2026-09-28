/** Membrane close-up: a strip of lipid bilayer with named proteins, labelled ions, the charge layer and the pump's ATP. */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useLabUI, useLabelMode } from '../labStore';
import { TRANSPORTERS, SPECIES, type SpeciesKey, type CellType } from './model';
import type { CellSim, Site } from './sim';
import { buildProtein } from './proteins';
import { spriteMaterial, GLYPH } from './glyphs';
import { SLAB } from './shapes';
import { live } from './live';
import { loadProteinModel, PROTEIN_FOR_TARGET } from './openAssets';
import { Sprites, focusNow, PROT } from './common';

export function Patch({ sim, cellType }: { sim: CellSim; cellType: CellType }) {
  const labels = useLabelMode() !== 'off';
  const proteins = useMemo(() => sim.sites.map((s) => ({ s, parts: buildProtein(s.kind) })), [sim]);
  // focused protein: swap its procedural proxy for the PDB-derived backbone mesh (HIGH/MEDIUM tiers, visual only)
  const tier = useLabUI((st) => st.visualTier), target = useLabUI((st) => st.cameraTargetId);
  useEffect(() => {
    const sel = target ? PROTEIN_FOR_TARGET[target] : undefined; if (tier === 'low' || !sel) return;
    const hit = proteins.find((x) => x.s.kind === sel[0]); if (!hit) return;
    let alive = true; const group = hit.parts.group; const original = [...group.children]; const vis = original.map((x) => x.visible);
    loadProteinModel(sel[1]).then((model) => {
      if (!alive || !model) return; original.forEach((x) => (x.visible = false));
      const visual = model.clone(true); visual.name = sel[1] + ' visual only'; const mats: THREE.MeshStandardMaterial[] = [];
      visual.traverse((o) => { const m = o as THREE.Mesh; if (!m.isMesh) return; const mt = (m.material as THREE.MeshStandardMaterial).clone(); mt.emissive = new THREE.Color(TRANSPORTERS[hit.s.kind].color); m.material = mt; mats.push(mt); });
      group.add(visual); group.userData.voProtein = visual; group.userData.voProteinMaterials = mats;
    });
    return () => { alive = false; const v = group.userData.voProtein as THREE.Object3D | undefined; if (v) { group.remove(v); (group.userData.voProteinMaterials as THREE.Material[] | undefined)?.forEach((m) => m.dispose()); delete group.userData.voProtein; delete group.userData.voProteinMaterials; } original.forEach((x, j) => (x.visible = vis[j])); };
  }, [proteins, tier, target]);
  useFrame(() => {
    const f = focusNow(); const m = live.model;
    for (const { s, parts } of proteins) {
      const on = f.kind === 'transporter' && f.t === s.kind, other = f.kind === 'transporter' && !on;
      parts.group.position.copy(s.pos); parts.group.scale.setScalar(PROT * (on ? 1.06 + 0.03 * Math.sin(sim.time * 5) : 1));
      const pv = parts.group.userData.voProtein as THREE.Object3D | undefined;
      if (pv) { pv.rotation.z = s.kind === 'pump' ? (s.phase - 0.5) * 0.08 : 0; (parts.group.userData.voProteinMaterials as THREE.MeshStandardMaterial[] | undefined)?.forEach((mt) => (mt.emissiveIntensity = s.kind === 'nachan' ? 0.08 + s.open * 0.85 * (s.inactivated ? 0.25 : 1) : 0.08)); }
      if (parts.head) { parts.head.rotation.z = (s.phase - 0.5) * 0.7; parts.head.position.y = -0.72 - 0.08 * Math.sin(s.phase * Math.PI); }
      const glow = s.flash + s.open * 0.8;
      if (parts.pore) { const pm = parts.pore.material as THREE.MeshPhysicalMaterial; pm.opacity = 0.3 * glow; pm.emissiveIntensity = 1.5 * glow; }
      if (parts.filter) (parts.filter.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.15 + 2.2 * glow;
      if (parts.gate) { const g = s.gate; parts.gate.position.set(0.55 * (1 - g), -0.72 - 0.3 * (1 - g), 0.1 * (1 - g)); }
      if (parts.sensors) parts.sensors.position.y = 0.16 * s.open;
      for (const mt of parts.mats) { if (mt === parts.filter?.material || mt === parts.pore?.material || mt.transparent) continue; mt.emissive.set(TRANSPORTERS[s.kind].color); mt.emissiveIntensity = on ? 0.16 + 0.1 * Math.sin(sim.time * 5) : 0; }
      parts.group.visible = true; void other; void m;
    }
  });
  return (<group>
    <Backdrop />
    <Bilayer sites={sim.sites} />
    {proteins.map(({ s, parts }) => <primitive key={s.i} object={parts.group} />)}
    <Charges sim={sim} />
    <Atp sim={sim} />
    <Sprites sim={sim} size={0.44} />
    {labels && <PatchLabels sim={sim} cellType={cellType} />}
  </group>);
}

function Backdrop() {
  const mat = useMemo(() => new THREE.ShaderMaterial({ depthWrite: false, uniforms: {}, vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vU;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
void main(){
  float y = vU.y;
  vec3 out_ = mix(vec3(0.018, 0.045, 0.068), vec3(0.008, 0.016, 0.026), smoothstep(0.54, 1.0, y));
  vec3 in_ = mix(vec3(0.105, 0.038, 0.036), vec3(0.035, 0.012, 0.016), smoothstep(0.48, 0.0, y));
  vec3 c = y > 0.5 ? out_ : in_;
  float radial = length((vU - 0.5) * vec2(1.0, 1.35)); float vign = smoothstep(0.34, 0.78, radial);
  float grain = (h21(floor(vU * vec2(520.0, 300.0))) - 0.5) * 0.024;
  c *= 1.03 - 0.32 * vign; c += grain;
  float membraneGlow = exp(-abs(y - 0.5) * 42.0); c = mix(c, vec3(0.42, 0.16, 0.14), membraneGlow * 0.18);
  float edge = smoothstep(0.0, 0.12, vU.x) * smoothstep(1.0, 0.88, vU.x);
  gl_FragColor = vec4(c, 0.96 * edge);
#include <colorspace_fragment>
}`, transparent: true }), []);
  return <mesh position={[0, 0, -SLAB.d - 0.4]} material={mat} renderOrder={-1}><planeGeometry args={[SLAB.w * 2.4, SLAB.h * 2]} /></mesh>;
}

function Bilayer({ sites }: { sites: Site[] }) {
  const d = useMemo(() => {
    const heads: THREE.Matrix4[] = [], tails: THREE.Matrix4[] = []; const o = new THREE.Object3D(); const sp = 0.34; let s = 5; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (const side of [1, -1]) for (let x = -SLAB.w; x <= SLAB.w; x += sp) for (let z = -SLAB.d; z <= SLAB.front; z += sp) {
      const px = x + (r() - 0.5) * 0.08 + (side < 0 ? sp / 2 : 0), pz = z + (r() - 0.5) * 0.08;
      if (sites.some((st) => Math.hypot(px - st.pos.x, pz - st.pos.z) < PROT * (st.kind === 'pump' || st.kind === 'vrac' || st.kind === 'aqp' ? 0.78 : st.kind === 'nachan' ? 1.0 : 0.62))) continue;
      o.position.set(px, side * 0.44, pz); o.rotation.set(0, 0, 0); o.scale.setScalar(1); o.updateMatrix(); heads.push(o.matrix.clone());
      for (const dx of [-0.055, 0.055]) { o.position.set(px + dx, side * 0.22, pz); o.rotation.set((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25); o.updateMatrix(); tails.push(o.matrix.clone()); }
    }
    return { heads, tails };
  }, [sites]);
  const hRef = useRef<THREE.InstancedMesh>(null), tRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => { d.heads.forEach((m, i) => hRef.current?.setMatrixAt(i, m)); d.tails.forEach((m, i) => tRef.current?.setMatrixAt(i, m)); if (hRef.current) hRef.current.instanceMatrix.needsUpdate = true; if (tRef.current) tRef.current.instanceMatrix.needsUpdate = true; }, [d]);
  return (<group>
    <instancedMesh ref={hRef} args={[new THREE.SphereGeometry(0.15, 12, 10), new THREE.MeshPhysicalMaterial({ color: '#c99a90', roughness: 0.48, clearcoat: 0.32, clearcoatRoughness: 0.3, sheen: 0.22, sheenRoughness: 0.66, sheenColor: new THREE.Color('#f7d6cd') }), d.heads.length]} />
    <instancedMesh ref={tRef} args={[new THREE.CylinderGeometry(0.03, 0.025, 0.36, 6, 1), new THREE.MeshStandardMaterial({ color: '#aa9067', roughness: 0.72 }), d.tails.length]} />
  </group>);
}

/** + outside, − inside: the charge separation that is the membrane potential. Flips during an action potential. */
function Charges({ sim }: { sim: CellSim }) {
  const three = useThree(); const N = 30;
  const d = useMemo(() => { const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 2 * 3), idx = new Float32Array(N * 2), sz = new Float32Array(N * 2), al = new Float32Array(N * 2); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aIdx', new THREE.BufferAttribute(idx, 1)); geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('aAlpha', new THREE.BufferAttribute(al, 1)); const mat = spriteMaterial(); const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 8; return { geo, pos, idx, sz, al, mat, pts }; }, []);
  useFrame(() => {
    const m = live.model; if (!m) return; const cam = three.camera as THREE.PerspectiveCamera; const f = focusNow();
    d.mat.uniforms.uScale.value = (three.size.height * three.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    const vm = live.vm; const n = Math.round(N * Math.min(1, Math.abs(vm) / 83)); const flip = vm > 0;
    for (let k = 0; k < N; k++) for (const side of [0, 1]) {
      const j = k * 2 + side; const x = -SLAB.w + 0.2 + ((k + 0.5) / N) * (SLAB.w * 2 - 0.4); 
      const outer = side === 0; d.pos.set([x, (outer ? 0.9 : -0.9) + 0.04 * Math.sin(sim.time * 2 + k), SLAB.front + 0.1], j * 3);
      d.idx[j] = (outer !== flip) ? GLYPH.plus : GLYPH.minus; d.sz[j] = 0.34 * (f.kind === 'vm' ? 1.3 : 1); d.al[j] = k < n ? (f.kind === 'vm' ? 1 : 0.75) : 0;
    }
    for (const a of ['position', 'aIdx', 'aSize', 'aAlpha']) (d.geo.getAttribute(a) as THREE.BufferAttribute).needsUpdate = true;
  });
  return <primitive object={d.pts} />;
}

/** ATP → ADP at the pump each cycle. */
function Atp({ sim }: { sim: CellSim }) {
  const three = useThree(); const pump = sim.sites.find((s) => s.kind === 'pump');
  const d = useMemo(() => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3)); geo.setAttribute('aIdx', new THREE.BufferAttribute(new Float32Array([GLYPH.atp]), 1)); geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([0.5]), 1)); geo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array([0]), 1)); const mat = spriteMaterial(); const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 10; return { geo, mat, pts }; }, []);
  useFrame(() => {
    if (!pump) return; const cam = three.camera as THREE.PerspectiveCamera; d.mat.uniforms.uScale.value = (three.size.height * three.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    const a = pump.atp; const pos = d.geo.getAttribute('position') as THREE.BufferAttribute; pos.setXYZ(0, pump.pos.x - 0.75 - (1 - a) * 0.6, -1.7 - (1 - a) * 0.5, pump.pos.z + 0.4); pos.needsUpdate = true;
    const idx = d.geo.getAttribute('aIdx') as THREE.BufferAttribute; idx.setX(0, a > 0.6 ? GLYPH.atp : GLYPH.adp); idx.needsUpdate = true;
    const al = d.geo.getAttribute('aAlpha') as THREE.BufferAttribute; al.setX(0, Math.min(1, a * 2)); al.needsUpdate = true;
  });
  return pump ? <primitive object={d.pts} /> : null;
}

function PatchLabels({ sim, cellType }: { sim: CellSim; cellType: CellType }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]); const zoneO = useRef<HTMLDivElement>(null), zoneI = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const m = live.model; if (!m) return;
    sim.sites.forEach((s, i) => { const el = refs.current[i]; if (!el) return; el.querySelector('i')!.textContent = siteLine(s, m.pumpRate, sim); });
    const sp = (k: SpeciesKey) => m.species.find((x) => x.key === k);
    const fmt = (v: number) => (v < 0.01 ? '0.0001' : v < 10 ? v.toFixed(1) : v.toFixed(0));
    const list = (side: 'inside' | 'outside') => m.species.filter((x) => x.key !== 'w' && x.key !== 'osm' && (side === 'inside' || x.outside > 0)).map((x) => `${SPECIES[x.key].label} ${fmt(x[side])}`).join(' · ');
    if (zoneO.current) zoneO.current.textContent = list('outside') + (sp('w') ? ` · osmolality ≈ ${Math.round(m.plasmaOsm)}` : '');
    if (zoneI.current) zoneI.current.textContent = list('inside') + (sp('osm') ? ` · osmolytes ${Math.round(m.osmolytes * 100)} %` : '');
  });
  return (<group>
    {sim.sites.map((s, i) => <group key={i} position={[s.pos.x, i % 2 ? (s.kind === 'pump' ? -3.0 : -2.05) : (s.kind === 'pump' ? 2.2 : 1.95), s.pos.z]}><Html center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div className={`plabel tk-${s.kind}`} ref={(r) => { refs.current[i] = r; }}><b>{TRANSPORTERS[s.kind].short}</b><i /></div></Html></group>)}
    <group position={[-SLAB.w * 0.62, SLAB.h + 0.25, 0]}><Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div className="zonebig out"><b>Outside the cell</b><span>extracellular fluid</span><em ref={zoneO} /></div></Html></group>
    <group position={[-SLAB.w * 0.08, -SLAB.h + 0.35, 0]}><Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}><div className="zonebig in"><b>Inside the cell</b><span>cytosol{cellType === 'cardiac' ? ' of a heart muscle cell' : cellType === 'neuron' ? ' of a nerve cell' : ' of a cell'}</span><em ref={zoneI} /></div></Html></group>
  </group>);
}
function siteLine(s: Site, pumpRate: number, sim: CellSim): string {
  switch (s.kind) {
    case 'pump': return s.step === 'idle' ? `×${pumpRate.toFixed(1)} · 1 ATP → 3 Na⁺ out, 2 K⁺ in` : s.step === 'bind-na' ? 'binding 3 Na⁺ from inside' : s.step === 'flip-out' ? 'ATP spent → 3 Na⁺ pushed out' : s.step === 'bind-k' ? 'binding 2 K⁺ from outside' : '2 K⁺ carried in';
    case 'kchan': return s.flash > 0.3 ? 'K⁺ passing' : 'open at rest · K⁺ leaks out';
    case 'nachan': return s.open > 0.2 ? 'OPEN — Na⁺ rushing in' : s.inactivated ? 'inactivated · gate shut' : 'closed · ready to fire';
    case 'cachan': return s.open > 0.2 ? 'open — Ca²⁺ entering' : 'opens with each beat';
    case 'aqp': return s.flash > 0.3 ? 'water crossing' : sim.vol > 1.01 && live.model && live.model.volume > sim.vol ? 'water flowing in' : 'water crosses both ways';
    case 'vrac': return s.flash > 0.3 ? 'osmolyte crossing' : 'sheds osmolytes over ~48 h';
  }
}

/* ================================================================== tap a molecule to name it */
