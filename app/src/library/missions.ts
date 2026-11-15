/**
 * Missions: a shift of related calls played back to back. Each leg is an existing case (its own patient);
 * the mission keeps a running result and unlocks nothing — it is a way to practice a run of decisions without
 * going back to the list between cases.
 */
import { create } from 'zustand';

export interface Mission { id: string; title: string; brief: string; legs: { label: string; caseId: string }[] }
export const MISSIONS: Mission[] = [
  { id: 'trauma-shift', title: 'Trauma shift', brief: 'Four calls: a crash with a quiet abdomen, the same patient getting worse, a ventilated patient who crashes, and a child who looks fine.',
    legs: [{ label: 'Scene call', caseId: 'case-abd-fast-early' }, { label: 'In flight', caseId: 'case-abd-fast-spleen' }, { label: 'ICU pickup', caseId: 'case-img-cxr-tension' }, { label: 'Pediatric scene', caseId: 'case-lines-child-shock' }] },
  { id: 'neuro-night', title: 'Neuro transfer night', brief: 'A stroke inside the window, a blown pupil, a drain that misbehaves and a brain running out of room.',
    legs: [{ label: 'Stroke transfer', caseId: 'case-neuro-m1l' }, { label: 'ICH transfer', caseId: 'case-neuro-uncal' }, { label: 'Drain check', caseId: 'case-neuro-evd' }, { label: 'Last call', caseId: 'case-neuro-cushing' }] },
  { id: 'vent-transfers', title: 'Ventilated transfers', brief: 'Three ventilated patients and a monitor you cannot trust at altitude.',
    legs: [{ label: 'ARDS transfer', caseId: 'case-img-cxr-ards' }, { label: 'After the move', caseId: 'case-img-mainstem' }, { label: 'No sliding', caseId: 'case-img-lus-plug' }, { label: 'In the aircraft', caseId: 'lines-c-transport' }] },
  { id: 'mother-baby', title: 'Mother and baby', brief: 'Position, bleeding, a short apnea time and a newborn who stays blue.',
    legs: [{ label: 'Antepartum', caseId: 'case-lines-aortocaval' }, { label: 'Postpartum', caseId: 'case-lines-pph' }, { label: 'Airway plan', caseId: 'case-abg-apnoea-preg' }, { label: 'Newborn', caseId: 'case-heart-pphn' }] },
  { id: 'medical-icu', title: 'Medical ICU runs', brief: 'Four sick medical patients where the numbers decide the first move.',
    legs: [{ label: 'DKA', caseId: 'abg-dka' }, { label: 'Missed dialysis', caseId: 'lab-k-hd' }, { label: 'Septic shock', caseId: 'abg-sepsis' }, { label: 'Lactate', caseId: 'lab-lactate' }] },
];
export const MISSION_BY_ID: Record<string, Mission> = Object.fromEntries(MISSIONS.map((m) => [m.id, m]));

interface MissionState { id: string | null; leg: number; right: number; total: number; set: (p: Partial<Omit<MissionState, 'set'>>) => void }
export const useMission = create<MissionState>((set) => ({ id: null, leg: 0, right: 0, total: 0, set: (p) => set(p) }));

const KEY = 'ccp.missions.v1';
export interface MissionResult { right: number; total: number; at: string }
export function missionResults(): Record<string, MissionResult> { try { return JSON.parse(globalThis.localStorage?.getItem(KEY) ?? '{}'); } catch { return {}; } }
export function saveMission(id: string, right: number, total: number) {
  const all = missionResults(); const prev = all[id];
  if (!prev || right / Math.max(1, total) >= prev.right / Math.max(1, prev.total)) all[id] = { right, total, at: new Date().toISOString() };
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
}
