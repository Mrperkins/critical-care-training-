import { create } from 'zustand';
import { studyECG } from './studyECG';

/** Deterministic shared study clock. Speed changes presentation time, never the patient's heart rate. */
interface StudyClock {
  seconds: number; running: boolean; speed: number; enabled: boolean; heartRate: number; rateOverride: number | null;
  set: (patch: Partial<Pick<StudyClock, 'seconds' | 'running' | 'speed' | 'enabled' | 'heartRate' | 'rateOverride'>>) => void;
  advance: (realSeconds: number) => number;
}
export const useStudyClock = create<StudyClock>((set, get) => ({
  seconds: 0, running: true, speed: 1, enabled: false, heartRate: 84, rateOverride: null,
  set: (patch) => set(patch),
  advance: (realSeconds) => {
    const s = get();
    // When the study mode is off, retain the original full-speed animation.
    const seconds = s.seconds + (s.enabled && !s.running ? 0 : Math.max(0, Math.min(s.enabled ? 0.25 : 0.05, Number.isFinite(realSeconds) ? realSeconds : 0)) * (s.enabled ? s.speed : 1));
    if (seconds !== s.seconds) set({ seconds });
    return seconds;
  },
}));
export const studyCycleMs = (seconds: number, bpm: number) => {
  const period = 60000 / Math.max(20, bpm);
  return ((seconds * 1000 + 190) % period + period) % period;
};
export const STUDY_EVENTS = [
  { name: 'SA node', offset: 0, detail: 'Atrial depolarization begins; the ECG P wave follows.' },
  { name: 'Atrial activation', offset: 50, detail: 'Electrical activation spreads across the atria.' },
  { name: 'AV nodal delay', offset: 100, detail: 'Slow conduction contributes to the PR interval.' },
  { name: 'His–Purkinje', offset: 140, detail: 'Rapid conduction precedes ventricular depolarization.' },
  { name: 'QRS', offset: 190, detail: 'Ventricular depolarization; contraction begins after electrical activation.' },
  { name: 'ST/ejection', offset: 280, detail: 'The ventricles are mostly depolarized and ejecting blood.' },
  { name: 'T wave', offset: 410, detail: 'Ventricular repolarization.' },
] as const;
/** Backwards-compatible Lead II utility; same waveform engine as the twelve-lead viewer. */
export const teachingLeadII = (ms: number, bpm: number) => studyECG('II', ms, bpm);
