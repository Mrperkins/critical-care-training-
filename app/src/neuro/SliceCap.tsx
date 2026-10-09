/**
 * The brain cut open along an axial plane, with the cut face painted by the live pathology: grey/white matter,
 * deep nuclei and ventricles (schematic, placed in the brain's own frame), the ischaemic core and penumbra per
 * territory, swelling and haemorrhagic transformation (from evolution.ts), the haematoma with its age-dependent
 * density, swirl while still bleeding, perihaematomal oedema, ventricular blood and enlargement, and the midline
 * pushed across. This is a model of the tissue, not a picture of a CT — the real CT for the stage is beside it.
 *
 * Classic stencil capping: back faces of the clipped brain increment the stencil, front faces decrement, and the
 * cap plane draws only where the stencil is non-zero (inside the brain).
 */
import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { GLSL_NOISE } from '../scene/Studio';
import { TERRITORIES, TERRITORY_CORE, TERRITORY_RADIUS, type BrainFrame } from './anatomy';
import { territoryStates, effectiveHemorrhage, hemorrhageShape } from './perfusion';
import { evolve } from './evolution';
import { useNeuroUI } from './neuroStore';
import { approach, frameDt } from '../scene/effects';

const CAP_FRAG = /* glsl */ `
uniform vec3 uC; uniform vec3 uH; uniform float uT;
uniform float uCoreW[7]; uniform float uPenW[7]; uniform float uRegion[7]; uniform vec3 uCtr[7]; uniform float uRad[7];
uniform float uSwell, uShift, uHt, uCtVis; uniform vec4 uHem; uniform float uPhe, uClot, uActive, uIvh, uHydro, uOcc;
varying vec3 vW;
${GLSL_NOISE}
int territory(vec3 l){
  float ax = abs(l.x); int s = l.x < 0.0 ? 0 : 1;
  if (l.y < -0.55 && l.z < -0.2 && ax < 0.72) return 6;
  if ((l.z < -0.6 && (l.y < 0.3 || ax < 0.45)) || (l.y < -0.32 && l.z < -0.12 && ax > 0.18)) return 4 + s;
  if (l.z > -0.55 && l.y > -0.35 && (ax < 0.3 || (l.y > 0.55 && ax < 0.5))) return 2 + s;
  return s;
}
float ell(vec3 p, vec3 c, vec3 r){ return length((p - c) / r); }
void main(){
  vec3 l = (vW - uC) / uH;
  // midline shift: tissue near the midline is displaced away from the lesion (sample where it came from)
  float fall = exp(-pow(l.x * 1.7, 2.0)) * smoothstep(-0.7, -0.2, l.y);
  vec3 q = l + vec3(uShift * fall, 0.0, 0.0);
  float n = fbm(q * 9.0), n2 = fbm(q * 26.0 + 3.0);
  // anatomy (schematic): cortex ribbon, white matter, deep nuclei, ventricles
  float rr = length(q / vec3(0.97, 1.0, 0.98));
  float cortex = smoothstep(0.74, 0.8, rr + 0.05 * (n - 0.5));
  float nuclei = min(min(ell(vec3(abs(q.x), q.yz), vec3(0.23, -0.12, 0.1), vec3(0.11, 0.16, 0.2)), ell(vec3(abs(q.x), q.yz), vec3(0.09, -0.13, -0.12), vec3(0.08, 0.12, 0.11))), 9.0);
  float vs = 1.0 + 0.9 * uHydro;
  float vent = min(min(ell(vec3(abs(q.x), q.yz), vec3(0.085 * vs, 0.05, 0.0), vec3(0.055 * vs, 0.15, 0.34)), ell(vec3(abs(q.x), q.yz), vec3(0.1 * vs, -0.06, 0.2), vec3(0.06 * vs, 0.15, 0.13))), ell(q, vec3(0.0, -0.12, -0.04), vec3(0.02 * vs, 0.08, 0.12)));
  vec3 grey = vec3(0.6, 0.48, 0.46), white = vec3(0.88, 0.81, 0.75), csf = vec3(0.16, 0.2, 0.29);
  vec3 col = mix(white, grey, max(cortex, 1.0 - smoothstep(0.9, 1.05, nuclei)));
  col *= 0.9 + 0.14 * n2;
  float inVent = 1.0 - smoothstep(0.92, 1.0, vent);
  col = mix(col, mix(csf, vec3(0.7, 0.06, 0.08) * (0.6 + 0.4 * uClot), uIvh), inVent);
  // ischaemia: core (dead), penumbra (at risk, pulsing while the artery is shut), swelling rim, haemorrhagic transformation
  if (uOcc > 0.5) {
    vec3 lq = q + (vec3(fbm(q * 2.3), fbm(q * 2.3 + 5.1), fbm(q * 2.3 + 9.7)) - 0.5) * 0.2;
    int t = territory(lq); float cw = 0.0, pw = 0.0, reg = 0.0, rad = 1.0; vec3 ctr = vec3(0.0);
    for (int i = 0; i < 7; i++) if (i == t) { cw = uCoreW[i]; pw = uPenW[i]; reg = uRegion[i]; ctr = uCtr[i]; rad = uRad[i]; }
    bool inRegion = reg < 0.5 || (reg < 1.5 ? q.y > -0.2 : q.y <= -0.2);
    float w = clamp(length(q - ctr) / rad, 0.0, 1.0);
    if (inRegion && cortex + (1.0 - inVent) > 0.0) {
      float core = 1.0 - smoothstep(cw - 0.03, cw + 0.03, w);
      float pen = (1.0 - smoothstep(pw - 0.03, pw + 0.03, w)) * (1.0 - core);
      float swell = (1.0 - smoothstep(cw + 0.02, cw + 0.02 + 0.22 * uSwell, w)) * (1.0 - core) * uSwell;
      float pulse = 0.82 + 0.18 * sin(uT * 2.5);
      col = mix(col, vec3(0.95, 0.63, 0.18), pen * 0.6 * pulse);
      col = mix(col, vec3(0.36, 0.5, 0.78), swell * 0.55);
      vec3 dead = mix(vec3(0.62, 0.18, 0.42), vec3(0.42, 0.14, 0.36), uCtVis);
      col = mix(col, dead * (0.85 + 0.2 * n), core * 0.85);
      float speck = step(1.0 - 0.55 * uHt, fbm(q * 34.0)) * core;
      col = mix(col, vec3(0.78, 0.04, 0.06), speck * uHt);
    }
  }
  // haematoma, perihaematomal oedema
  if (uHem.w > 0.0) {
    float d = length((q - uHem.xyz) * vec3(1.0, 1.15, 0.9)) / uHem.w;
    float edge = d + 0.12 * (fbm(q * 7.0) - 0.5);
    float phe = 1.0 - smoothstep(uPhe - 0.08, uPhe, edge);
    col = mix(col, vec3(0.78, 0.83, 0.5), phe * 0.42);
    float blood = 1.0 - smoothstep(0.96, 1.02, edge);
    vec3 b = mix(vec3(0.42, 0.18, 0.12), vec3(0.8, 0.05, 0.08), clamp((uClot - 0.45) / 0.55, 0.0, 1.0));
    float swirl = uActive * smoothstep(0.55, 0.75, fbm(q * 13.0 + vec3(0.0, uT * 0.2, 0.0)));
    b = mix(b, vec3(0.42, 0.08, 0.1), swirl * 0.7); // unclotted blood is darker inside the clot
    col = mix(col, b * (0.85 + 0.25 * n2), blood);
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function useSlicePlane(frame: BrainFrame) {
  const slice = useNeuroUI((s) => s.slice);
  return useMemo(() => { const y = frame.c.y + slice * frame.h.y; return { y, plane: new THREE.Plane(new THREE.Vector3(0, -1, 0), y) }; }, [frame, slice]);
}

/** stencil writers + the painted cap. `geo` = the outward-wound brain geometry. */
export function SliceCap({ frame, geo, plane, y }: { frame: BrainFrame; geo: THREE.BufferGeometry; plane: THREE.Plane; y: number }) {
  const gl = useThree((s) => s.gl);
  const back = useMemo(() => new THREE.MeshBasicMaterial({ side: THREE.BackSide, clippingPlanes: [plane], colorWrite: false, depthWrite: false, depthTest: false,
    stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilFail: THREE.IncrementWrapStencilOp, stencilZFail: THREE.IncrementWrapStencilOp, stencilZPass: THREE.IncrementWrapStencilOp }), [plane]);
  const front = useMemo(() => new THREE.MeshBasicMaterial({ side: THREE.FrontSide, clippingPlanes: [plane], colorWrite: false, depthWrite: false, depthTest: false,
    stencilWrite: true, stencilFunc: THREE.AlwaysStencilFunc, stencilFail: THREE.DecrementWrapStencilOp, stencilZFail: THREE.DecrementWrapStencilOp, stencilZPass: THREE.DecrementWrapStencilOp }), [plane]);
  const U = useMemo(() => ({
    uC: { value: frame.c.clone() }, uH: { value: frame.h.clone() }, uT: { value: 0 },
    uCoreW: { value: new Array(7).fill(0) }, uPenW: { value: new Array(7).fill(0) }, uRegion: { value: new Array(7).fill(0) },
    uCtr: { value: TERRITORIES.map((t) => new THREE.Vector3(...TERRITORY_CORE[t])) }, uRad: { value: TERRITORIES.map((t) => TERRITORY_RADIUS[t]) },
    uSwell: { value: 0 }, uShift: { value: 0 }, uHt: { value: 0 }, uCtVis: { value: 0 }, uHem: { value: new THREE.Vector4(0, 0, 0, 0) }, uPhe: { value: 1 },
    uClot: { value: 1 }, uActive: { value: 0 }, uIvh: { value: 0 }, uHydro: { value: 0 }, uOcc: { value: 0 },
  }), [frame]);
  const cap = useMemo(() => new THREE.ShaderMaterial({ uniforms: U, side: THREE.DoubleSide,
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }', fragmentShader: CAP_FRAG,
    stencilWrite: true, stencilRef: 0, stencilFunc: THREE.NotEqualStencilFunc, stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp, stencilZPass: THREE.ReplaceStencilOp }), [U]);
  const state = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys);
  const ts = useMemo(() => territoryStates(state, sys), [state, sys]); const ev = useMemo(() => evolve(state, sys), [state, sys]);
  const h = useMemo(() => effectiveHemorrhage(state, sys), [state, sys]);
  useFrame((st, dtRaw) => {
    const dt = frameDt(dtRaw); U.uT.value = st.clock.elapsedTime;
    TERRITORIES.forEach((t, i) => { const s = ts[t]; U.uCoreW.value[i] = approach(U.uCoreW.value[i], s.coreW, 5, dt); U.uPenW.value[i] = approach(U.uPenW.value[i], s.penW, 5, dt); U.uRegion.value[i] = s.flow.region === 'sup' ? 1 : s.flow.region === 'inf' ? 2 : 0; });
    const side = h ? Math.sign(h.at[0]) || 1 : Object.keys(state.occlusion).some((k) => k.endsWith('_R')) ? -1 : 1;
    U.uShift.value = approach(U.uShift.value, side * (ev.midlineShiftMm / 100) / frame.h.x, 4, dt);
    U.uSwell.value = approach(U.uSwell.value, ev.swelling, 4, dt); U.uHt.value = approach(U.uHt.value, ev.ht, 4, dt); U.uCtVis.value = ev.ctVisible;
    U.uOcc.value = ev.course === 'ischemic' ? 1 : 0;
    if (h && h.kind === 'ich') {
      const { rCm } = hemorrhageShape(h); const r = (rCm / 10) / ((frame.h.x + frame.h.y + frame.h.z) / 3);
      U.uHem.value.set(h.at[0], h.at[1], h.at[2], approach(U.uHem.value.w, r, 5, dt));
      U.uPhe.value = Math.cbrt((ev.hematomaMl + ev.pheMl) / Math.max(1, ev.hematomaMl)); U.uClot.value = ev.clotDensity; U.uActive.value = ev.active;
    } else U.uHem.value.w = 0;
    U.uIvh.value = approach(U.uIvh.value, ev.ivh, 4, dt); U.uHydro.value = approach(U.uHydro.value, ev.hydro, 3, dt);
  });
  const size = Math.max(frame.h.x, frame.h.z) * 2.6;
  return (<>
    <mesh geometry={geo} material={back} renderOrder={1} />
    <mesh geometry={geo} material={front} renderOrder={1} />
    {([['Front', 0, 1.08], ['Back', 0, -1.1], ['Patient left', 1.12, 0], ['Patient right', -1.12, 0]] as const).map(([t, x, z]) => <Html key={t} position={[frame.c.x + x * frame.h.x, y + 0.02, frame.c.z + z * frame.h.z]} center zIndexRange={[15, 0]}><span className="orient">{t}</span></Html>)}
    <mesh material={cap} renderOrder={1.1} position={[frame.c.x, y, frame.c.z]} rotation={[-Math.PI / 2, 0, 0]} onAfterRender={() => gl.clearStencil()}>
      <planeGeometry args={[size, size]} />
    </mesh>
  </>);
}
