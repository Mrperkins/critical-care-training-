/**
 * Camera policy: lesson playback and the camera are separate.
 *
 * A lesson changes the model (state, highlights, animation) on its own clock. It does not move the
 * camera unless the learner asks it to. Every scene rig calls `useCameraGate(ref)` once; after that,
 * any `setLookAt` the scene issues while a lesson owns the model is remembered as the lesson's
 * suggested view instead of being executed. The learner frames it with "Frame this view", or turns
 * on "Follow lesson camera" to get the old guided camera back.
 *
 * Camera moves that come from the learner (a view picker, a structure they click) still run: any
 * pointer press outside the lesson transport and outside the 3D canvas counts as intent for a
 * short window.
 */
import { useEffect, type RefObject } from 'react';
import { create } from 'zustand';
import type { CameraControls } from '@react-three/drei';

const KEY = 'cc.camera.follow';
const readFollow = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };

export interface CameraPolicy {
  /** the learner wants the lesson to drive the camera */ follow: boolean;
  /** a lesson suggested a view the camera has not taken yet */ suggested: boolean;
  /** lesson sources currently holding the model (Director, MI Locator lesson…) */ owners: string[];
  /** bumps on every "Frame this view" */ frame: number;
  /** gated 3D cameras currently mounted (the camera controls only show when there is a camera) */ rigs: number;
  setFollow: (on: boolean) => void;
  frameNow: () => void;
  own: (source: string, on: boolean) => void;
}
export const useCameraPolicy = create<CameraPolicy>((set, get) => ({
  follow: readFollow(), suggested: false, owners: [], frame: 0, rigs: 0,
  setFollow: (on) => { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* storage unavailable: session only */ } set({ follow: on }); if (on) get().frameNow(); },
  frameNow: () => set((s) => ({ frame: s.frame + 1, suggested: false })),
  own: (source, on) => set((s) => {
    const has = s.owners.includes(source); if (has === on) return s;
    if (on) establishUntil = now() + 700; // the opening shot of a lesson still frames
    return { owners: on ? [...s.owners, source] : s.owners.filter((x) => x !== source), suggested: on ? s.suggested : false };
  }),
}));

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
let establishUntil = 0; let intentUntil = 0;
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', (e) => {
    const el = e.target as Element | null;
    if (!el?.closest || el.closest('[data-lesson-transport]') || el.closest('canvas')) return;
    intentUntil = now() + 900;
  }, true);
  document.addEventListener('keydown', (e) => {
    const el = e.target as Element | null;
    if ((e.key === 'Enter' || e.key === ' ') && el?.closest && !el.closest('[data-lesson-transport]')) intentUntil = now() + 900;
  }, true);
}

/** may the scene move the camera on its own right now? */
export function cameraFree(): boolean {
  const p = useCameraPolicy.getState(); const t = now();
  return p.owners.length === 0 || p.follow || t < establishUntil || t < intentUntil;
}

type LookAt = CameraControls['setLookAt'];
/**
 * Gate one CameraControls instance (returns the undo). The first framing always runs (the scene needs a
 * starting view); after that, while a lesson owns the model, framings are remembered, not executed.
 */
export function gateControls(c: Pick<CameraControls, 'setLookAt'>) {
  const orig: LookAt = c.setLookAt.bind(c);
  let first = true; let last: Parameters<LookAt> | null = null;
  c.setLookAt = ((...a: Parameters<LookAt>) => {
    last = a;
    if (first || cameraFree()) { first = false; if (useCameraPolicy.getState().suggested) useCameraPolicy.setState({ suggested: false }); return orig(...a); }
    if (!useCameraPolicy.getState().suggested) useCameraPolicy.setState({ suggested: true });
    return Promise.resolve();
  }) as LookAt;
  useCameraPolicy.setState((s) => ({ rigs: s.rigs + 1 }));
  const off = useCameraPolicy.subscribe((s, p) => { if (s.frame !== p.frame && last) { const [px, py, pz, tx, ty, tz] = last; orig(px, py, pz, tx, ty, tz, true); } });
  return () => { off(); c.setLookAt = orig; useCameraPolicy.setState((s) => ({ rigs: Math.max(0, s.rigs - 1) })); };
}
/** Gate a scene's CameraControls. Call right after `useRef`, before any effect that frames the camera. */
export function useCameraGate(ref: RefObject<CameraControls | null>) {
  useEffect(() => { const c = ref.current; if (!c) return; return gateControls(c); }, [ref]);
}
