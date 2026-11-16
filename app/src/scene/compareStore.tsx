/** Compare-with-normal state and the twin's healthy values. No 3D imports: the player shell reads this before any scene has loaded. */
import { createContext, useContext, type ReactNode } from 'react';
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

