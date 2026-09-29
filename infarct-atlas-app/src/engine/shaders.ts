/**
 * Shader layer. Realistic tissue shading (muscle, epicardial fat, baked AO,
 * wet clearcoat, subsurface tint) with educational effects layered on top:
 * beating, hypokinesis, ischemia, lead-view highlighting, coronary flow and occlusion.
 */
import * as THREE from 'three';

/** Uniforms shared by every heart material (same object references). */
export const shared = {
  uTime: { value: 0 },
  uVent: { value: 0 },
  uAtr: { value: 0 },
  uBase: { value: new THREE.Vector3() },
  uAxis: { value: new THREE.Vector3(0, -1, 0) },
  uLen: { value: 1 },
  uAtrC: { value: new THREE.Vector3() },
  uTerrA: { value: new THREE.Vector4() },
  uTerrB: { value: new THREE.Vector4() },
  uInjury: { value: 0 },      // 0..1 how injured the selected territory looks
  uHypo: { value: 0 },        // 0..1 loss of contraction in the territory
  uLeadDir: { value: new THREE.Vector3(0, 0, 1) },
  uLeadOn: { value: 0 },
  uFade: { value: 0 },        // cutaway fade for RV/RA
};

const NOISE = /* glsl */ `
float h13(vec3 p){ p = fract(p*0.1031); p += dot(p, p.zyx+31.32); return fract((p.x+p.y)*p.z); }
float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h13(i),h13(i+vec3(1,0,0)),f.x),mix(h13(i+vec3(0,1,0)),h13(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h13(i+vec3(0,0,1)),h13(i+vec3(1,0,1)),f.x),mix(h13(i+vec3(0,1,1)),h13(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }
`;

const BEAT_VERT = /* glsl */ `
attribute vec4 aRegA; attribute vec4 aRegB; attribute float aCh;
uniform float uVent, uAtr, uLen, uHypo; uniform vec3 uBase, uAxis, uAtrC; uniform vec4 uTerrA, uTerrB;
float terrW(){ return clamp(dot(aRegA,uTerrA)+dot(aRegB,uTerrB),0.0,1.0); }
vec3 beat(vec3 p){
  if(aCh > 0.5 && aCh < 1.5){
    float k = uVent * (1.0 - 0.9 * terrW() * uHypo);
    vec3 d = p - uBase; float h = dot(d, uAxis); vec3 ap = uBase + uAxis*h; vec3 r = p - ap;
    p = ap + r*(1.0 - 0.075*k) - uAxis*h*0.06*k;
  } else if(aCh > 1.5){ p = uAtrC + (p - uAtrC)*(1.0 - 0.04*uAtr); }
  return p;
}
`;

export type TissueKind = 'myocardium' | 'atrium' | 'greatArtery' | 'greatVein' | 'cardiacVein';

/** Tissue material: physically based, with procedural muscle / fat detail and baked AO. */
export function tissueMaterial(kind: TissueKind, opts: { fadeable?: boolean } = {}) {
  const base: Record<TissueKind, THREE.MeshPhysicalMaterialParameters> = {
    myocardium: { color: '#6b1914', roughness: 0.46, clearcoat: 0.55, clearcoatRoughness: 0.32, sheen: 0.6, sheenColor: new THREE.Color('#ff6a5a'), sheenRoughness: 0.5 },
    atrium: { color: '#5c1a1c', roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.35, sheen: 0.5, sheenColor: new THREE.Color('#ff7a70'), sheenRoughness: 0.5 },
    greatArtery: { color: '#c89a8c', roughness: 0.52, clearcoat: 0.4, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color('#ffd6c8'), sheenRoughness: 0.6 },
    greatVein: { color: '#5b3446', roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.4 },
    cardiacVein: { color: '#5a3a5e', roughness: 0.36, clearcoat: 0.6, clearcoatRoughness: 0.25 },
  };
  const m = new THREE.MeshPhysicalMaterial({ ...base[kind], metalness: 0, envMapIntensity: 0.85 });
  const local = { uKind: { value: ['myocardium', 'atrium', 'greatArtery', 'greatVein', 'cardiacVein'].indexOf(kind) }, uFadeable: { value: opts.fadeable ? 1 : 0 } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, local);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\n${BEAT_VERT}\nattribute float aAO; attribute float aFat; varying float vAO; varying float vFat; varying float vW; varying vec3 vPos; varying vec3 vWN;`)
      .replace('#include <begin_vertex>', `vec3 transformed = beat(position); vAO = aAO; vFat = aFat; vW = terrW(); vPos = position; vWN = normalize(mat3(modelMatrix) * normal);`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${NOISE}\nuniform float uKind, uInjury, uLeadOn, uTime, uFade, uFadeable; uniform vec3 uLeadDir; varying float vAO; varying float vFat; varying float vW; varying vec3 vPos; varying vec3 vWN;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float n1 = fbm(vPos*9.0), n2 = fbm(vPos*34.0), n3 = vnoise(vPos*120.0);
        vec3 col = diffuseColor.rgb;
        float fat = 0.0;
        if (uKind < 1.5) {
          vec3 muscle = mix(col*0.72, col*1.28, n1) * (0.9 + 0.2*n2) * (0.96 + 0.08*n3);
          float lob = fbm(vPos*26.0 + 3.1);
          fat = smoothstep(0.62, 0.95, vFat + (lob - 0.5)*0.28) * 0.55;
          vec3 fatC = mix(vec3(0.55,0.38,0.2), vec3(0.72,0.56,0.33), fbm(vPos*60.0)) * (0.88 + 0.12*n3);
          col = mix(muscle, fatC, fat);
          // ischemia → injury: dusky cyanotic, then pale and mottled
          float w = vW * uInjury;
          float mott = fbm(vPos*22.0 + 7.0);
          vec3 dusky = vec3(0.25,0.09,0.16);
          vec3 pale = vec3(0.50,0.36,0.36);
          vec3 inj = mix(dusky, pale, smoothstep(0.3, 0.8, mott) * smoothstep(0.5, 1.0, uInjury));
          col = mix(col, inj * (0.85 + 0.3*n2), w * (1.0 - 0.7*fat));
        } else {
          col *= (0.9 + 0.2*n1) * (0.95 + 0.1*n3);
        }
        diffuseColor.rgb = col * mix(0.38, 1.0, vAO);
        if (uFadeable > 0.5) diffuseColor.a *= 1.0 - 0.82*uFade;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>\n roughnessFactor = clamp(roughnessFactor + (n2-0.5)*0.18 + fat*0.08, 0.2, 0.9);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec3 Vv = normalize(vViewPosition);
        float rim = pow(1.0 - abs(dot(normalize(vNormal), Vv)), 2.2);
        totalEmissiveRadiance += (uKind < 1.5 ? vec3(0.09,0.012,0.01) : vec3(0.05,0.02,0.02)) * rim * (1.0 - fat) * vAO;
        float face = smoothstep(0.72, 0.97, dot(normalize(vWN), uLeadDir));
        totalEmissiveRadiance += vec3(0.42,0.66,0.74) * face * uLeadOn * 0.16 * (uKind < 1.5 ? 1.0 : 0.25);`);
  };
  if (opts.fadeable) { m.transparent = true; }
  m.customProgramCacheKey = () => `tissue-${kind}-${opts.fadeable ? 1 : 0}`;
  return m;
}

/** Coronary artery material with flow, occlusion and state highlighting. */
export function coronaryMaterial() {
  const local = {
    uOccAt: { value: 2 }, uPerf: { value: 0 }, uDown: { value: 0 }, uFlow: { value: 0 }, uFlowSpeed: { value: 1 },
    uState: { value: 0 }, uMaxS: { value: 2 }, uDim: { value: 0 },
  };
  const m = new THREE.MeshPhysicalMaterial({ color: '#c02a22', roughness: 0.32, clearcoat: 0.9, clearcoatRoughness: 0.2, metalness: 0, sheen: 0.5, sheenColor: new THREE.Color('#ff9a8a'), emissive: '#3a0604' });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, shared, local);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>\n${BEAT_VERT}\nattribute float aS; attribute float aAO; varying float vS; varying float vAO2;`)
      .replace('#include <begin_vertex>', `vec3 transformed = beat(position); vS = aS; vAO2 = aAO;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nuniform float uOccAt, uPerf, uDown, uFlow, uFlowSpeed, uState, uMaxS, uTime, uDim; varying float vS; varying float vAO2;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        if (vS > uMaxS) discard;
        float beyond = step(uOccAt, vS) * uPerf;
        float dead = max(beyond, uDown);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.24,0.12,0.16), dead) * mix(0.78, 1.0, vAO2) * (1.0 - 0.45*uDim);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float live = (1.0 - dead) * uFlow * (1.0 - step(uOccAt - 0.004, vS) * step(0.5, uPerf) * 0.0);
        float pulse = smoothstep(0.72, 1.0, fract(vS * 16.0 - uTime * 1.3 * uFlowSpeed));
        totalEmissiveRadiance += vec3(1.0, 0.22, 0.14) * pulse * live * 0.55;
        vec3 st = uState > 2.5 ? vec3(1.0,0.34,0.18) : uState > 1.5 ? vec3(0.95,0.62,0.25) : uState > 0.5 ? vec3(0.6,0.6,0.6) : vec3(0.0);
        totalEmissiveRadiance += st * (uState > 2.5 ? 0.42 : 0.3) * (1.0 - 0.6*dead);`);
  };
  m.customProgramCacheKey = () => 'coronary';
  return Object.assign(m, { localUniforms: local });
}

/** Territory mask overlay: semi-transparent tint with a crisp contour, following the beating surface. */
export function territoryMaterial() {
  const local = { uAlpha: { value: 0 }, uStage: { value: 0 }, uHover: { value: 0 }, uColor: { value: new THREE.Color('#7f5bd6') } };
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.FrontSide,
    uniforms: { ...shared, ...local },
    vertexShader: /* glsl */ `${BEAT_VERT}\nattribute float aW; varying float vW2; varying vec3 vN; varying vec3 vV;
      void main(){ vec3 p = beat(position); vW2 = aW; vec4 mv = modelViewMatrix*vec4(p,1.0); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `uniform float uAlpha, uStage, uHover, uTime; uniform vec3 uColor; varying float vW2; varying vec3 vN; varying vec3 vV;
      void main(){
        float w = smoothstep(0.08, 0.6, vW2);
        float edge = smoothstep(0.1, 0.22, vW2) * (1.0 - smoothstep(0.22, 0.36, vW2));
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 1.5);
        vec3 ischemic = uColor; vec3 injured = mix(uColor, vec3(0.85,0.8,0.86), 0.45);
        vec3 c = mix(ischemic, injured, uStage);
        float a = (w * (0.26 + 0.18*fres) + edge * 0.55) * uAlpha + uHover * (w*0.18 + edge*0.5);
        gl_FragColor = vec4(c + edge*0.25, a);
        #include <colorspace_fragment>
      }`,
  });
  return Object.assign(m, { localUniforms: local });
}
