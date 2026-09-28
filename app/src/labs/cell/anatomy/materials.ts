/**
 * Physically based "wet tissue" materials: clearcoat + sheen, fine procedural bump (no textures to
 * download), a soft subsurface glow at grazing angles, optional banding (sarcomeres, cristae) and a
 * cut-face colour for the inside of sliced surfaces.
 */
import * as THREE from 'three';
import { GLSL_NOISE } from '../../../scene/Studio';

export interface WetOpts {
  rough?: number; clear?: number; sheen?: number; sheenColor?: string; opacity?: number;
  bump?: number; freq?: number; sss?: string; sssAmt?: number; inner?: string;
  stripes?: { axis: 'x' | 'y' | 'z' | 'attr'; kind: 'sarcomere' | 'cristae' | 'rings' };
  clip?: THREE.Plane[]; clipIntersection?: boolean; side?: THREE.Side; depthWrite?: boolean; emissive?: string; vertexColors?: boolean;
}
export type WetMaterial = THREE.MeshPhysicalMaterial & { userData: { u: { uPer: { value: number }; uGlow: { value: number } } } };

const PERTURB = /* glsl */ `
vec3 wetPerturb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDir){
  vec3 sx = normalize(dFdx(surf_pos)), sy = normalize(dFdy(surf_pos)); vec3 r1 = cross(sy, surf_norm), r2 = cross(surf_norm, sx);
  float det = dot(sx, r1) * faceDir; vec3 g = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2); return normalize(abs(det) * surf_norm - g); }`;

export function wet(color: string, o: WetOpts = {}): WetMaterial {
  const m = new THREE.MeshPhysicalMaterial({
    color, roughness: o.rough ?? 0.42, clearcoat: o.clear ?? 0.42, clearcoatRoughness: 0.28, sheen: o.sheen ?? 0.32, sheenRoughness: 0.62, sheenColor: new THREE.Color(o.sheenColor ?? '#ffffff'),
    transparent: o.opacity !== undefined && o.opacity < 1, opacity: o.opacity ?? 1, depthWrite: o.depthWrite ?? !(o.opacity !== undefined && o.opacity < 1),
    side: o.side ?? THREE.FrontSide, clippingPlanes: o.clip ?? [], clipIntersection: o.clipIntersection ?? false,
    emissive: new THREE.Color(o.emissive ?? '#000000'), vertexColors: o.vertexColors ?? false,
  }) as WetMaterial;
  const u = { uPer: { value: 0.13 }, uGlow: { value: 0 } }; m.userData.u = u;
  const bump = o.bump ?? 0.6, freq = o.freq ?? 9, sss = new THREE.Color(o.sss ?? color), sssAmt = o.sssAmt ?? 0.35; const inner = new THREE.Color(o.inner ?? '#000000');
  const stripes = o.stripes;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uPer = u.uPer; sh.uniforms.uGlow = u.uGlow;
    const attr = stripes?.axis === 'attr';
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nvarying vec3 vObj;${attr ? '\nattribute float aS; varying float vS;' : ''}`).replace('#include <begin_vertex>', `#include <begin_vertex>\nvObj = position;${attr ? ' vS = aS;' : ''}`);
    let f = sh.fragmentShader.replace('#include <common>', `#include <common>\nvarying vec3 vObj; uniform float uPer; uniform float uGlow;${attr ? ' varying float vS;' : ''}\n${GLSL_NOISE}\n${PERTURB}`);
    if (stripes) {
      const ax = attr ? 'x' : stripes.axis;
      const body = stripes.kind === 'sarcomere'
        // A band dark, I band light, Z line dark and thin, H zone paler, M line thin
        ? `float s = fract(${attr ? 'vS' : 'vObj.' + ax} / uPer + 0.5); float A = smoothstep(0.18, 0.22, s) * (1.0 - smoothstep(0.78, 0.82, s)); float Z = 1.0 - smoothstep(0.0, 0.025, min(s, 1.0 - s)); float H = smoothstep(0.42, 0.45, s) * (1.0 - smoothstep(0.55, 0.58, s)); float M = 1.0 - smoothstep(0.0, 0.012, abs(s - 0.5));
           diffuseColor.rgb *= mix(1.22, 0.68, A) * (1.0 + 0.18 * H) * (1.0 - 0.5 * Z) * (1.0 - 0.25 * M);`
        : stripes.kind === 'cristae'
          ? `float s = fract(vObj.${ax} * 18.0); diffuseColor.rgb *= 0.78 + 0.35 * smoothstep(0.3, 0.5, s) * (1.0 - smoothstep(0.5, 0.7, s));`
          : `float s = fract(vObj.${ax} * 7.0); diffuseColor.rgb *= 0.9 + 0.15 * step(0.5, s);`;
      f = f.replace('#include <color_fragment>', `#include <color_fragment>\n{ ${body} }`);
    }
    f = f.replace('#include <color_fragment>', `#include <color_fragment>\n{ float mot = fbm(vObj * ${(freq * 0.35).toFixed(3)}); diffuseColor.rgb *= 0.82 + 0.32 * mot; }`);
    if (bump > 0) f = f.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n{ float hgt = fbm(vObj * ${freq.toFixed(3)}); vec2 dH = vec2(dFdx(hgt), dFdy(hgt)) * ${(bump * 1.0).toFixed(3)}; normal = wetPerturb(-vViewPosition, normal, dH, faceDirection); }`);
    f = f.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>\n{ float rim = pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 2.2); totalEmissiveRadiance += vec3(${sss.r.toFixed(3)}, ${sss.g.toFixed(3)}, ${sss.b.toFixed(3)}) * (rim * ${sssAmt.toFixed(3)} * 0.46 + uGlow); }`);
    if (o.inner) f = f.replace('#include <dithering_fragment>', `#include <dithering_fragment>\nif (!gl_FrontFacing) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(${inner.r.toFixed(3)}, ${inner.g.toFixed(3)}, ${inner.b.toFixed(3)}), 0.7);`);
    sh.fragmentShader = f;
  };
  m.customProgramCacheKey = () => `wet|${bump}|${freq}|${stripes?.axis ?? ''}${stripes?.kind ?? ''}|${o.inner ?? ''}|${sss.getHexString()}|${sssAmt}`;
  return m;
}
