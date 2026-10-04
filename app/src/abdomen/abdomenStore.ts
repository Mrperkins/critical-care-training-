import { create } from 'zustand';
import { emptyAbdomen, evolve, type AbdomenState } from './state';

export type AbdPreset = 'normal' | 'spleen4' | 'liver3' | 'aaa6' | 'aaaContained' | 'aaaFree' | 'perforation' | 'sbo' | 'mesenteric' | 'pancreatitis' | 'dissectB' | 'dissectA';
export const ABD_PRESETS: { id: AbdPreset; name: string; short: string; make: () => AbdomenState }[] = [
  { id: 'normal', name: 'Normal', short: 'No free fluid, normal aorta', make: emptyAbdomen },
  { id: 'spleen4', name: 'Splenic injury (grade IV)', short: 'Blunt trauma: splenic laceration bleeding into the peritoneum', make: () => ({ ...emptyAbdomen(), injury: { spleen: 4 } }) },
  { id: 'liver3', name: 'Liver laceration (grade III)', short: 'Right upper quadrant trauma', make: () => ({ ...emptyAbdomen(), injury: { liver: 3 } }) },
  { id: 'aaa6', name: 'AAA 6 cm (intact)', short: 'Pulsatile mass; above repair threshold', make: () => ({ ...emptyAbdomen(), aaa: { diameterCm: 6, rupture: 'none' } }) },
  { id: 'aaaContained', name: 'Ruptured AAA (contained)', short: 'Back pain and hypotension; retroperitoneal bleed', make: () => ({ ...emptyAbdomen(), aaa: { diameterCm: 7, rupture: 'contained' }, retroMl: 400 }) },
  { id: 'aaaFree', name: 'Ruptured AAA (free)', short: 'Free intraperitoneal rupture', make: () => ({ ...emptyAbdomen(), aaa: { diameterCm: 7.5, rupture: 'free' }, retroMl: 300 }) },
  { id: 'perforation', name: 'Perforated viscus', short: 'Free air and enteric fluid', make: () => ({ ...emptyAbdomen(), freeAir: true, freeFluidMl: 250, fluidKind: 'enteric', injury: { bowel: 2 } }) },
  { id: 'sbo', name: 'Small-bowel obstruction', short: 'Dilated loops, vomiting', make: () => ({ ...emptyAbdomen(), obstruction: 'small', distension: 0.8 }) },
  { id: 'mesenteric', name: 'Mesenteric ischaemia', short: 'Pain out of proportion; SMA occlusion', make: () => ({ ...emptyAbdomen(), ischaemia: 0.35 }) },
  { id: 'dissectB', name: 'Aortic dissection (type B)', short: 'Tearing back pain; flap from beyond the left subclavian to the iliacs; left kidney malperfused', make: () => ({ ...emptyAbdomen(), dissection: { type: 'B', extent: 'iliac', falseLumen: 'patent', malperfusion: { renalL: true } } }) },
  { id: 'dissectA', name: 'Aortic dissection (type A)', short: 'Ascending aorta involved, extending to the renal arteries', make: () => ({ ...emptyAbdomen(), dissection: { type: 'A', extent: 'renal', falseLumen: 'patent', malperfusion: {} } }) },
  { id: 'pancreatitis', name: 'Acute pancreatitis', short: 'Epigastric pain to the back', make: () => ({ ...emptyAbdomen(), pancreatitis: 0.8, freeFluidMl: 150, fluidKind: 'ascites' }) },
];
export type AbdView = '3d' | 'us' | 'cta';
export interface AbdUI { preset: AbdPreset; base: AbdomenState; minutes: number; target: string; labels: boolean; view: AbdView; set: (p: Partial<AbdUI>) => void }
export const useAbdUI = create<AbdUI>((set) => ({ preset: 'spleen4', base: ABD_PRESETS[1].make(), minutes: 30, target: 'abdomen.whole', labels: true, view: '3d', set: (p) => set(p) }));
export const loadAbdPreset = (id: AbdPreset) => useAbdUI.getState().set({ preset: id, base: ABD_PRESETS.find((p) => p.id === id)!.make(), minutes: id === 'normal' ? 0 : 30 });
/** the state on screen: the base condition advanced by `minutes` (pure → seekable) */
export const currentAbdomen = (s: Pick<AbdUI, 'base' | 'minutes'> = useAbdUI.getState()) => evolve(s.base, s.minutes);
