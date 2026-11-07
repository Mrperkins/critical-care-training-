/**
 * Where the deficit is, on the HuBMAP Visible Human body (CC BY 4.0): the skin is tinted over each weak limb and the
 * drooping side of the face, in proportion to lost power. Facing the patient: their right is on your left.
 */
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { StudioCanvas } from '../scene/Studio';
import type { NeuroExam } from './exam';

/** Region of a skin vertex in the body frame (decimetres, centred; +X patient left, +Y up). */
export function regionOf(x: number, y: number): { side: 'R' | 'L'; part: 'face' | 'arm' | 'leg' | null } {
  const side = x < 0 ? 'R' : 'L'; const ax = Math.abs(x);
  if (y > 7.2) return { side, part: ax > 0.15 && y < 8.6 ? 'face' : null };
  if (y < -0.9) return { side, part: ax > 0.05 ? 'leg' : null };
  if (ax > 1.75 && y < 6.6) return { side, part: 'arm' };
  return { side, part: null };
}

function Skin({ body, e }: { body: BodyAsset; e: NeuroExam }) {
  const geo = useMemo(() => {
    const g = body.meshes.skin.geometry.clone(); const p = g.attributes.position; const col = new Float32Array(p.count * 3);
    const base = new THREE.Color('#bf9e88'), weak = new THREE.Color('#d2493c'), c = new THREE.Color();
    const loss = (side: 'R' | 'L', part: 'face' | 'arm' | 'leg') =>
      part === 'face' ? (e.face.side === side ? Math.min(1, e.face.grade / 3) : 0) : (5 - (part === 'arm' ? (side === 'R' ? e.power.armR : e.power.armL) : side === 'R' ? e.power.legR : e.power.legL)) / 5;
    for (let i = 0; i < p.count; i++) {
      const r = regionOf(p.getX(i), p.getY(i)); const k = r.part ? loss(r.side, r.part) : 0;
      c.copy(base).lerp(weak, k); col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
  }, [body, e.power.armR, e.power.armL, e.power.legR, e.power.legL, e.face.side, e.face.grade]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75 }), []);
  useEffect(() => () => { geo.dispose(); }, [geo]); useEffect(() => () => mat.dispose(), [mat]);
  return <mesh geometry={geo} material={mat} />;
}

export function DeficitBody3D({ e }: { e: NeuroExam }) {
  const [body, setBody] = useState<BodyAsset | null>(null); const [err, setErr] = useState(false);
  useEffect(() => { let on = true; loadBodyAsset('male').then((b) => on && setBody(b)).catch(() => on && setErr(true)); return () => { on = false; }; }, []);
  const weak = (['armR', 'armL', 'legR', 'legL'] as const).filter((k) => e.power[k] < 5);
  return <figure className="deficit3d" aria-label={`Weakness map: ${weak.length ? weak.map((k) => `${k.startsWith('arm') ? 'arm' : 'leg'} ${k.endsWith('R') ? 'right' : 'left'} power ${e.power[k]} of 5`).join(', ') : 'full power in all limbs'}${e.face.side ? `, ${e.face.side === 'R' ? 'right' : 'left'} facial droop` : ''}`}>
    <div className="deficit3d-stage">{err ? <p className="muted small">The 3D body could not load.</p> : body && <StudioCanvas camera={{ position: [0, 0.5, 34], fov: 32 }} fog={false} label="Weakness map on the reference body"><Skin body={body} e={e} /></StudioCanvas>}</div>
    <figcaption><span>R</span><span>red = weaker</span><span>L</span></figcaption>
  </figure>;
}
