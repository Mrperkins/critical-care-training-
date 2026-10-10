/**
 * A legible moving 3D fluid column (not a collection of confetti-like tracers).
 * Geometry lives inside an existing vessel/airway path; no anatomical mesh is replaced.
 *
 * The illustrated column volume is qualitative. Numeric stroke/tidal volumes must
 * come from the associated physiology solver, never from this display geometry.
 */
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface FlowPoint { p: THREE.Vector3; r: number }
export interface FlowMotion { time: number; activity: number; direction?: number; speed?: number }
export type FlowSample = () => FlowMotion;

/** Fit the moving column to locally measured path radii rather than a fixed-width stroke. */
export function makeFlowColumn(path: readonly FlowPoint[], width = 0.72) {
  if (path.length < 2) throw new Error('Flow column needs at least two points');
  const positions = path.map((p) => p.p.clone());
  const curve = new THREE.CatmullRomCurve3(positions, false, 'centripetal');
  const segments = Math.min(180, Math.max(28, path.length * 9));
  const geometry = new THREE.TubeGeometry(curve, segments, 1, 10, false);
  const a = geometry.getAttribute('position') as THREE.BufferAttribute;
  const radii = path.map((p) => Math.max(0.003, p.r));
  const lengths = [0];
  for (let i = 1; i < positions.length; i++) lengths.push(lengths[i - 1] + positions[i].distanceTo(positions[i - 1]));
  const total = lengths[lengths.length - 1] || 1;
  const tmp = new THREE.Vector3(), center = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments; const d = u * total;
    let k = 1;
    while (k < lengths.length - 1 && lengths[k] < d) k++;
    const t = THREE.MathUtils.clamp((d - lengths[k - 1]) / Math.max(1e-6, lengths[k] - lengths[k - 1]), 0, 1);
    const r = THREE.MathUtils.lerp(radii[k - 1], radii[k], t) * width;
    curve.getPointAt(u, center);
    for (let j = 0; j <= 10; j++) {
      const index = i * 11 + j;
      tmp.fromBufferAttribute(a, index).sub(center).multiplyScalar(r).add(center);
      a.setXYZ(index, tmp.x, tmp.y, tmp.z);
    }
  }
  a.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export const clampFlow = (v: number) => Number.isFinite(v) ? THREE.MathUtils.clamp(v, 0, 1) : 0;

/**
 * Translucent body-filling stream with a contiguous bright travelling bolus.
 * This is a surface representation of a 3D column; not quantitative CFD.
 * Time is supplied by the patient's existing simulation clock.
 */
export function VolumeFlow({ path, color, sample, width = 0.72, label, opacity = 0.72, clippingPlanes, layer = 3 }: {
  path: readonly FlowPoint[]; color: string; sample: FlowSample;
  width?: number; label: string; opacity?: number; clippingPlanes?: THREE.Plane[]; layer?: number;
}) {
  const geometry = useMemo(() => makeFlowColumn(path, width), [path, width]);
  const motionRef = useRef(sample);
  motionRef.current = sample;
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color(color) }, uTravel: { value: 0 },
    uActivity: { value: 0 }, uOpacity: { value: opacity },
  }), []);
  useEffect(() => { uniforms.uColor.value.set(color); uniforms.uOpacity.value = opacity; }, [color, opacity, uniforms]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide, transparent: true, depthWrite: false,
    clipping: !!clippingPlanes, clippingPlanes,
    vertexShader: `varying float vAlong; varying vec3 vNormal;
      void main() {vAlong=uv.x;vNormal=normalize(normalMatrix*normal);
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform vec3 uColor; uniform float uTravel,uActivity,uOpacity;
      varying float vAlong;varying vec3 vNormal;
      void main() {
        float u=fract(vAlong-uTravel+1.0);
        float envelope=smoothstep(0.01,0.075,u)*(1.0-smoothstep(0.31,0.44,u));
        float wake=smoothstep(0.0,0.06,u)*(1.0-smoothstep(0.49,0.8,u));
        float rim=0.70+0.30*abs(vNormal.z);
        float alpha=(0.14+0.74*envelope+0.13*wake)*uActivity*uOpacity;
        if(alpha<0.012) discard;
        vec3 rgb=uColor*(0.74+0.65*envelope+0.12*wake)*rim;
        gl_FragColor=vec4(rgb,min(0.92,alpha));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }), [uniforms, clippingPlanes]);
  useFrame(() => {
    const flow = motionRef.current();
    const speed = Math.max(0, Number.isFinite(flow.speed ?? 1) ? flow.speed ?? 1 : 1);
    const direction = flow.direction === -1 ? -1 : 1;
    uniforms.uTravel.value = ((flow.time * speed * direction * 0.34) % 1 + 1) % 1;
    uniforms.uActivity.value = clampFlow(flow.activity);
  });
  useEffect(() => () => {geometry.dispose(); material.dispose();}, [geometry, material]);
  return <mesh name={label} geometry={geometry} material={material} renderOrder={layer} frustumCulled={false} />;
}
