import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export const IS_PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
export const damp = (cur: number, tgt: number, rate: number, dt: number) => THREE.MathUtils.lerp(cur, tgt, 1 - Math.exp(-rate * dt));

/** Soft, neutral studio lighting shared by every 3D view (photographic key/fill/rim, no coloured glow). */
export function StudioLights({ warm = 1 }: { warm?: number }) {
  return (
    <>
      <ambientLight intensity={0.045} />
      <hemisphereLight args={['#bcd8e8', '#170d10', 0.2]} />
      <directionalLight position={[-4.5, 6.2, 6]} intensity={2.05 * warm} color="#ffe6d7" />
      <directionalLight position={[5.2, 2.4, -4]} intensity={0.58} color="#c6dcf0" />
      <directionalLight position={[0, -4.5, 2.5]} intensity={0.18} color="#f0b7a8" />
      <spotLight position={[0, 7, -7]} intensity={1.35} color="#b9dfff" angle={0.5} penumbra={0.72} distance={34} decay={2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.35} position={[-1, 4.6, 4]} scale={[7.5, 2.7, 1]} color="#ffe9dc" />
        <Lightformer form="rect" intensity={0.62} position={[-5, 1.4, 0]} rotation-y={Math.PI / 2} scale={[5.5, 4.5, 1]} color="#f0c9bc" />
        <Lightformer form="rect" intensity={0.72} position={[5.5, 1, -2.5]} rotation-y={-Math.PI / 2} scale={[5, 4.5, 1]} color="#c9ddf0" />
        <Lightformer form="ring" intensity={0.3} position={[0, -3.5, 4]} scale={3.2} color="#ffffff" />
      </Environment>
    </>
  );
}

/** True while the element is on screen (phones stack the scene above the side pane; reading the pane scrolls it away). */
export function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null); const [on, setOn] = useState(true);
  useEffect(() => { const el = ref.current; if (!el || typeof IntersectionObserver === 'undefined') return; const io = new IntersectionObserver((es) => setOn(es.some((e) => e.isIntersecting)), { threshold: 0.01 }); io.observe(el); return () => io.disconnect(); }, []);
  return [ref, on] as const;
}

export function StudioCanvas({ children, camera, className = 'scene-canvas', fog = true, label = 'Interactive 3D anatomy' }: { children: ReactNode; camera: { position: [number, number, number]; fov?: number }; className?: string; fog?: boolean; label?: string }) {
  // stop drawing while scrolled out of view (battery on phones); the physiology engines keep their own clock
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  return (
    <Canvas
      ref={ref as never}
      role="img" aria-label={label}
      frameloop={onScreen ? 'always' : 'never'}
      className={className}
      dpr={IS_PHONE ? [1, 1.4] : [1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.93, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
      camera={{ fov: camera.fov ?? 30, near: 0.05, far: 80, position: camera.position }}
    >
      <color attach="background" args={['#05090d']} />
      {fog && <fog attach="fog" args={['#05090d', 24, 52]} />}
      <StudioLights />
      {children}
    </Canvas>
  );
}

/** GLSL value-noise + Voronoi used for tissue micro-detail (lobules, mottling). */
export const GLSL_NOISE = /* glsl */ `
float h13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }
vec2 voro(vec3 p){ vec3 i=floor(p), f=fract(p); float d1=8.0, d2=8.0;
  for(int z=-1;z<=1;z++) for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec3 g=vec3(x,y,z); vec3 o=vec3(h13(i+g), h13(i+g+17.1), h13(i+g+31.7));
    vec3 r=g+o-f; float d=dot(r,r); if(d<d1){ d2=d1; d1=d; } else if(d<d2) d2=d; }
  return vec2(sqrt(d1), sqrt(d2)); }
`;

/**
 * Tileable tissue-detail texture generated once at start-up (cheap to sample on phones):
 *  R = secondary-lobule septa (Voronoi cell borders), G = low-frequency mottling, B = fine pigment specks.
 * Sampled tri-planar in object space by the tissue shaders.
 */
let tissueTex: THREE.DataTexture | null = null;
export function tissueTexture() {
  if (tissueTex) return tissueTex;
  const N = 256, C = 10; const data = new Uint8Array(N * N * 4);
  let seed = 1234567; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
  const pts: [number, number][] = Array.from({ length: C * C }, (_, i) => [((i % C) + 0.15 + 0.7 * rnd()) / C, (Math.floor(i / C) + 0.15 + 0.7 * rnd()) / C]);
  const G = 16; const grid = Array.from({ length: G * G }, () => rnd());
  const vn = (x: number, y: number, g: number) => { const fx = x * g, fy = y * g; const ix = Math.floor(fx), iy = Math.floor(fy); const tx = fx - ix, ty = fy - iy; const s = (a: number) => a * a * (3 - 2 * a); const at = (i: number, j: number) => grid[(((j % g) + g) % g) * G + (((i % g) + g) % g)]; return (at(ix, iy) * (1 - s(tx)) + at(ix + 1, iy) * s(tx)) * (1 - s(ty)) + (at(ix, iy + 1) * (1 - s(tx)) + at(ix + 1, iy + 1) * s(tx)) * s(ty); };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N, v = y / N; let d1 = 9, d2 = 9;
    for (const [px, py] of pts) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) { const dx = u - px - ox, dy = v - py - oy; const d = Math.sqrt(dx * dx + dy * dy); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
    const edge = 1 - Math.min(1, Math.max(0, (d2 - d1) * C / 0.16));
    const mott = 0.5 * vn(u, v, 4) + 0.3 * vn(u, v, 8) + 0.2 * vn(u, v, 16);
    const speck = rnd() > 0.985 ? 1 : 0;
    const i = (y * N + x) * 4; data[i] = edge * 255; data[i + 1] = mott * 255; data[i + 2] = speck * 255; data[i + 3] = 255;
  }
  tissueTex = new THREE.DataTexture(data, N, N, THREE.RGBAFormat); tissueTex.wrapS = tissueTex.wrapT = THREE.RepeatWrapping; tissueTex.magFilter = THREE.LinearFilter; tissueTex.minFilter = THREE.LinearMipmapLinearFilter; tissueTex.generateMipmaps = true; tissueTex.needsUpdate = true;
  return tissueTex;
}
/** Tri-planar lookup of the tissue texture (object-space position p, object-space normal n, scale k). */
export const GLSL_TRIPLANAR = /* glsl */ `
uniform sampler2D uTissue;
vec4 tri(vec3 p, vec3 n, float k){ vec3 w = pow(abs(n), vec3(4.0)); w /= (w.x + w.y + w.z + 1e-4);
  return texture2D(uTissue, p.yz * k) * w.x + texture2D(uTissue, p.xz * k) * w.y + texture2D(uTissue, p.xy * k) * w.z; }
`;
