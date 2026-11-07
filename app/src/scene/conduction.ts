/**
 * Conduction-system shading: every vertex of heart-internals.glb's conduction parts carries `aAct`, its normal
 * activation time in ms after the SA node fires. The material lights a travelling wavefront at the current time in the
 * cardiac cycle and leaves a fading wake (refractory tissue), so the AV-nodal pause, the fast His–Purkinje spread and
 * any added delay are visible. Pure Three — shared by the Atlas and the heart module.
 */
import * as THREE from 'three';

export interface ConductionUniforms { [k: string]: THREE.IUniform; uT: { value: number }; uAvDelay: { value: number }; uHisStart: { value: number }; uRbbDelay: { value: number }; uLbbDelay: { value: number } }
export interface Conduction { material: THREE.MeshStandardMaterial; uniforms: ConductionUniforms }

/** `branch` 0 = proximal (nodes, His), 1 = right bundle/RV Purkinje, 2 = left bundle/fascicles/LV Purkinje */
export function conductionMaterial(branch: 0 | 1 | 2, opts: { base?: string; glow?: string } = {}): Conduction {
  const uniforms: ConductionUniforms = { uT: { value: -1000 }, uAvDelay: { value: 0 }, uHisStart: { value: 120 }, uRbbDelay: { value: 0 }, uLbbDelay: { value: 0 } };
  const material = new THREE.MeshStandardMaterial({ color: opts.base ?? '#c9962e', roughness: 0.45, emissive: new THREE.Color(opts.glow ?? '#ffd25a'), emissiveIntensity: 0 });
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aAct; varying float vAct;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvAct = aAct;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform float uT, uAvDelay, uHisStart, uRbbDelay, uLbbDelay; varying float vAct;`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
float act = vAct + (vAct >= uHisStart ? uAvDelay : 0.0) + ${branch === 1 ? 'uRbbDelay' : branch === 2 ? 'uLbbDelay' : '0.0'};
float dt = uT - act;
float front = exp(-pow(dt / 9.0, 2.0));              // the wavefront (~9 ms wide)
float wake = dt > 0.0 ? 0.35 * exp(-dt / 140.0) : 0.0; // depolarised tissue fading toward repolarisation
totalEmissiveRadiance = emissive * (0.18 + 2.2 * front + wake); // faint baseline so the pathway always reads`);
  };
  material.customProgramCacheKey = () => 'conduction-v1-' + branch;
  return { material, uniforms };
}
export const branchOf = (id: string): 0 | 1 | 2 => (/^(rbb|purkinje_rv)$/.test(id) ? 1 : /^(lbb|lbb_.*|purkinje_lv)$/.test(id) ? 2 : 0);

/** Cycle clock: ms since the SA node last fired, for a heart rate. */
export const cycleMs = (seconds: number, hr: number) => (seconds * 1000) % (60000 / Math.max(10, hr));
