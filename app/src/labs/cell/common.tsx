/** Pieces shared by the whole-cell view and the membrane close-up. */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useLabUI } from '../labStore';
import { TRANSPORTERS, type TransporterKind, type Focus } from './model';
import type { CellSim } from './sim';
import { studGeometry } from './proteins';
import { spriteMaterial, GLYPH } from './glyphs';
import { live, resolveFocus } from './live';

export const PATCH_OFF = new THREE.Vector3(0, -40, 0);
/** the slice through the whole cell (world space): everything above y = constant is cut away */
export const CLIP = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
export const UP = new THREE.Vector3(0, 1, 0);
/** close-up protein scale */
export const PROT = 1.3;
export const focusNow = (): Focus => { const ui = useLabUI.getState(); return resolveFocus(live.model, ui.step, ui.chipFocus); };

export function Studs({ sim, size = 1 }: { sim: CellSim; size?: number }) {
  const kinds = useMemo(() => [...new Set(sim.sites.map((s) => s.kind))] as TransporterKind[], [sim]);
  const groups = useMemo(() => kinds.map((k) => ({ k, sites: sim.sites.filter((s) => s.kind === k), geo: studGeometry(k), mat: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.38, metalness: 0.05, clippingPlanes: [CLIP] }) })), [kinds, sim]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]); const gateRef = useRef<THREE.InstancedMesh>(null);
  const naSites = useMemo(() => sim.sites.filter((s) => s.kind === 'nachan'), [sim]);
  const tmp = useMemo(() => ({ o: new THREE.Object3D(), q: new THREE.Quaternion(), r: new THREE.Quaternion(), ax: new THREE.Vector3(), c: new THREE.Color(), p: new THREE.Vector3() }), []);
  useFrame(() => {
    const f = focusNow();
    groups.forEach((gr, gi) => {
      const inst = refs.current[gi]; if (!inst) return; const base = new THREE.Color(TRANSPORTERS[gr.k].color);
      const on = f.kind === 'transporter' && f.t === gr.k, other = f.kind === 'transporter' && !on;
      gr.sites.forEach((s, i) => {
        tmp.q.setFromUnitVectors(UP, s.n); tmp.o.position.copy(sim.sitePos(s, tmp.p)); tmp.o.quaternion.copy(tmp.q);
        if (s.kind === 'pump') { tmp.ax.set(1, 0, 0); tmp.r.setFromAxisAngle(tmp.ax, (s.phase - 0.5) * 0.7); tmp.o.quaternion.multiply(tmp.r); }
        tmp.o.scale.setScalar(size * (on ? 1.45 + 0.12 * Math.sin(sim.time * 5) : 1)); tmp.o.updateMatrix(); inst.setMatrixAt(i, tmp.o.matrix);
        const lit = 1 + 1.6 * s.flash + 1.4 * s.open; tmp.c.copy(base).multiplyScalar(lit * (other ? 0.45 : 1) * (s.inactivated ? 0.55 : 1) * (on ? 1.3 : 1)); inst.setColorAt(i, tmp.c);
      });
      inst.instanceMatrix.needsUpdate = true; if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    });
    const g = gateRef.current; if (g) {
      naSites.forEach((s, i) => { tmp.q.setFromUnitVectors(UP, s.n); const off = new THREE.Vector3(0.075 * (1 - s.gate), -0.13 - 0.04 * (1 - s.gate), 0).multiplyScalar(size).applyQuaternion(tmp.q); tmp.o.position.copy(sim.sitePos(s, tmp.p)).add(off); tmp.o.quaternion.identity(); tmp.o.scale.setScalar(size); tmp.o.updateMatrix(); g.setMatrixAt(i, tmp.o.matrix); });
      g.instanceMatrix.needsUpdate = true;
    }
  });
  return (<group>
    {groups.map((gr, i) => <instancedMesh key={gr.k} ref={(r) => { refs.current[i] = r; if (r && !r.instanceColor) { r.setColorAt(0, new THREE.Color('#fff')); } }} args={[gr.geo, gr.mat, gr.sites.length]} frustumCulled={false} />)}
    {naSites.length > 0 && <instancedMesh ref={gateRef} args={[new THREE.SphereGeometry(0.036, 12, 10), new THREE.MeshStandardMaterial({ color: '#ff5a2a', roughness: 0.35, emissive: new THREE.Color('#ff5a2a'), emissiveIntensity: 0.25, clippingPlanes: [CLIP] }), naSites.length]} frustumCulled={false} />}
  </group>);
}

/* ------------------------------------------------------------------ molecules */
const MAXP = 800;
/** Molecules as labelled sprites. `only` draws just one compartment (so cytosolic ions can sit under the translucent cytosol). */
export function Sprites({ sim, size, only, order = 9 }: { sim: CellSim; size: number; only?: 'in' | 'out'; order?: number }) {
  const three = useThree();
  const d = useMemo(() => {
    const geo = new THREE.BufferGeometry(); const pos = new Float32Array(MAXP * 3), idx = new Float32Array(MAXP), sz = new Float32Array(MAXP), al = new Float32Array(MAXP);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aIdx', new THREE.BufferAttribute(idx, 1)); geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('aAlpha', new THREE.BufferAttribute(al, 1));
    const mat = spriteMaterial(); const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = order;
    return { geo, pos, idx, sz, al, mat, pts };
  }, []);
  useFrame(() => {
    const cam = three.camera as THREE.PerspectiveCamera; const ui = useLabUI.getState(); const f = focusNow(); const m = live.model;
    d.mat.uniforms.uScale.value = (three.size.height * three.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)));
    d.mat.uniforms.uCut.value = 0; d.pts.renderOrder = order;
    const emph = new Set(m?.species.filter((s) => s.emph >= 1).map((s) => s.key));
    let j = 0; const picked = ui.picked && (ui.picked.sim === (sim.shape.scalable ? 'cell' : 'patch')) ? ui.picked.id : -1;
    // quality tiers thin out only free (idle) particles; moving, held and picked particles are always drawn
    const stride = ui.visualTier === 'low' ? 4 : ui.visualTier === 'medium' ? 2 : 1;
    for (const p of sim.particles) {
      if (p.state === 'dead' || j >= MAXP) continue; if (p.state === 'free' && p.id % stride !== 0 && p.id !== picked) continue; if (only && (p.state === 'free' || p.state === 'fade-in' || p.state === 'fade-out') && p.comp !== only) continue; if (only === 'in' && (p.state === 'move' || p.state === 'held')) continue;
      d.pos[j * 3] = p.pos.x; d.pos[j * 3 + 1] = p.pos.y; d.pos[j * 3 + 2] = p.pos.z; d.idx[j] = GLYPH[p.sp];
      let s = size * (p.sp === 'w' ? 1.2 : p.sp === 'osm' ? 1.1 : 1) * (emph.has(p.sp) ? 1.12 : 1); let a = p.alpha;
      if (f.kind === 'species') { if (p.sp === f.key) { s *= 1.3; if (f.side && p.comp !== f.side) a *= 0.45; } else a *= 0.3; }
      else if (f.kind === 'transporter' && p.state === 'free') a *= 0.7;
      if (p.state === 'move' || p.state === 'held') s *= 1.12;
      if (p.id === picked) s *= 1.7;
      d.sz[j] = s; d.al[j] = a; j++;
    }
    for (let k = j; k < MAXP; k++) d.al[k] = 0;
    d.geo.setDrawRange(0, j);
    for (const n of ['position', 'aIdx', 'aSize', 'aAlpha']) (d.geo.getAttribute(n) as THREE.BufferAttribute).needsUpdate = true;
  });
  return <primitive object={d.pts} />;
}

/* ------------------------------------------------------------------ labels on the whole cell */
