/**
 * Compare with normal: the scene splits into NORMAL | ABNORMAL. The normal side is a twin of the module's own
 * 3D scene, rendered with the module's disease state swapped for a healthy one (TwinState), or a pair of real
 * clinical images / video loops from the imaging library. The cameras of the two 3D views are linked, so
 * turning either heart (lung, brain…) turns both.
 *
 * How a scene takes part: wherever it reads disease state from its store, it reads it through useTwin(key, live).
 * In the patient view that returns the live value; inside the twin it returns the healthy value the module put in
 * the TwinState. Scenes that run their own physics (ventilator, blood gas) pass a separate engine the same way.
 */
import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { create } from 'zustand';

export type CompareView = 'model' | 'media';
interface CompareState { on: boolean; view: CompareView; pair: number; /** the scene on screen can compare */ available: boolean; set: (p: Partial<Omit<CompareState, 'set'>>) => void }
export const useCompare = create<CompareState>((set) => ({ on: false, view: 'model', pair: 0, available: false, set: (p) => set(p) }));

/** Healthy values for the twin, keyed by what the scene reads (e.g. 'heart.input'). */
export type TwinState = Record<string, unknown>;
const TwinCtx = createContext<TwinState | null>(null);
export function TwinProvider({ state, children }: { state: TwinState; children: ReactNode }) { return <TwinCtx.Provider value={state}>{children}</TwinCtx.Provider>; }
/** The value a scene should draw: the live one, or (in the normal twin) the healthy one. */
export function useTwin<T>(key: string, live: T): T { const t = useContext(TwinCtx); return t && key in t ? (t[key] as T) : live; }
export const useIsTwin = () => useContext(TwinCtx) !== null;

/** Which side of the split a canvas belongs to (only the module's main scene links its camera). */
const SlotCtx = createContext<'main' | 'twin' | null>(null);
export const SceneSlot = SlotCtx.Provider;

const link = { leader: 'main' as 'main' | 'twin', pos: new THREE.Vector3(), tgt: new THREE.Vector3(), has: false, seq: 0 };
interface Ctl { getTarget?: (v: THREE.Vector3) => THREE.Vector3; setLookAt?: (...a: (number | boolean)[]) => unknown; target?: THREE.Vector3; update?: () => void }
/** Mirrors the camera between the two halves; whichever side was touched last leads. */
export function CameraLink() {
  const slot = useContext(SlotCtx); const on = useCompare((s) => s.on && s.view === 'model');
  const gl = useThree((s) => s.gl); const camera = useThree((s) => s.camera); const controls = useThree((s) => s.controls) as unknown as Ctl | null;
  const tmp = useRef(new THREE.Vector3());
  useEffect(() => {
    if (!slot || !on) return;
    const take = () => { link.leader = slot; };
    gl.domElement.addEventListener('pointerdown', take); gl.domElement.addEventListener('wheel', take, { passive: true });
    return () => { gl.domElement.removeEventListener('pointerdown', take); gl.domElement.removeEventListener('wheel', take); };
  }, [gl, slot, on]);
  useFrame(() => {
    if (!slot || !on) return;
    const tgt = tmp.current;
    if (controls?.getTarget) controls.getTarget(tgt); else if (controls?.target) tgt.copy(controls.target); else return;
    if (link.leader === slot) {
      if (!link.has || !link.pos.equals(camera.position) || !link.tgt.equals(tgt)) { link.pos.copy(camera.position); link.tgt.copy(tgt); link.has = true; link.seq++; }
    } else if (link.has && (camera.position.distanceToSquared(link.pos) > 1e-6 || tgt.distanceToSquared(link.tgt) > 1e-6)) {
      // follow every frame, so the follower's own camera rig (view changes, smoothing) cannot drift away
      // the prototype method: lessons gate a scene's own setLookAt (cameraPolicy), but mirroring the other half is not a lesson move
      const look = controls?.setLookAt && (Object.getPrototypeOf(controls).setLookAt as Ctl['setLookAt'] ?? controls.setLookAt);
      if (look) look.call(controls, link.pos.x, link.pos.y, link.pos.z, link.tgt.x, link.tgt.y, link.tgt.z, false);
      else { camera.position.copy(link.pos); if (controls?.target) { controls.target.copy(link.tgt); controls.update?.(); } else camera.lookAt(link.tgt); }
    }
  });
  return null;
}
/** Start each comparison with the main scene leading, so the twin opens on the patient's view. */
export function resetCameraLink() { link.leader = 'main'; link.has = false; link.seq++; }
