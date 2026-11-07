/**
 * FAST windows and the transverse aorta view for the abdominal model. What each window shows is read from the
 * same `AbdomenState` as the 3D abdomen (state.ts → fastExam); the clip on screen is a real one matched to it
 * (UltrasoundScene.tsx). Conventions: longitudinal (coronal) views put the patient's head on screen-left;
 * transverse views put the patient's right on screen-left.
 */
export type UsWindow = 'ruq' | 'luq' | 'pelvis' | 'pericardial' | 'aorta';
export const US_WINDOWS: { id: UsWindow; short: string; name: string; plane: string; depthCm: number; fast: boolean }[] = [
  { id: 'ruq', short: 'RUQ', name: 'RUQ · hepatorenal (Morison’s pouch)', plane: 'coronal · head on the left', depthCm: 16, fast: true },
  { id: 'luq', short: 'LUQ', name: 'LUQ · splenorenal', plane: 'coronal · head on the left', depthCm: 15, fast: true },
  { id: 'pelvis', short: 'Pelvis', name: 'Pelvis · behind the bladder', plane: 'transverse · patient right on the left', depthCm: 14, fast: true },
  { id: 'pericardial', short: 'Subxiphoid', name: 'Subxiphoid · pericardium', plane: 'subcostal · patient right on the left', depthCm: 17, fast: true },
  { id: 'aorta', short: 'Aorta', name: 'Aorta (not part of FAST)', plane: 'transverse · patient right on the left', depthCm: 13, fast: false },
];

/** anechoic stripe thickness (mm) for a window's free-fluid volume: zero until the window is positive */
export function stripeMm(ml: number, positive: boolean) { return positive ? Math.min(35, 1.5 + Math.sqrt(Math.max(0, ml - 40))) : 0; }
