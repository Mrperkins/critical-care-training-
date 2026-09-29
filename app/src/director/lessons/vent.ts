/**
 * Respiratory signature lesson on the Lesson Director, using the vent engine and the alveolar close-up.
 * The vent session integrates in time, so each cue rebuilds its state from scratch: load the scenario,
 * apply the settings, then settle for a fixed number of fixed steps. Same inputs → same state → exact seek.
 */
import type { Timeline } from '../timeline';
import { session } from '../../vent/session';
import { useUI } from '../../app/store';
import { focusVentTarget } from '../../vent/AlveolusScene';
import type { VentSettings } from '../../physiology/mechanics';

const SETTLE_S = 14; // seconds of ventilation simulated before a scene is shown (≈ 3–4 breaths)
function scene(id: string, p: Partial<VentSettings>) {
  session.load(id); if (Object.keys(p).length) session.set(p);
  for (let i = 0; i < SETTLE_S * 20; i++) session.tick(0.05);
  const ui = useUI.getState(); ui.set({ ventScenario: id, pulse: ui.pulse + 1 });
}

export const ARDS_SIGNATURE: Timeline = {
  id: 'vent-ards-signature', title: 'ARDS: open the lung, keep it open, don’t overstretch it', level: 'core', module: 'vent',
  blurb: 'From the whole lung down to single alveoli: collapse and shunt at low PEEP, recruitment as PEEP rises, and overdistension when it goes too far.',
  setup: () => { scene('ards', { peep: 5 }); focusVentTarget('lung.whole'); },
  cues: [
    { id: 'ards-1', at: 0, dur: 9, hold: true, target: 'lung.whole', title: 'A small, stiff, heavy lung', apply: () => { scene('ards', { peep: 5 }); focusVentTarget('lung.whole'); },
      say: 'Acute respiratory distress syndrome. The lungs are inflamed, heavy with protein-rich fluid, and the dependent regions at the back have collapsed. At a PEEP of five, look at how little of the lung is aerated.' },
    { id: 'ards-2', at: 10, dur: 10, hold: true, target: 'lung.alveolus', title: 'Down to the alveoli', apply: () => { scene('ards', { peep: 5 }); focusVentTarget('lung.alveolus'); },
      say: 'Zoom in to a cluster of alveoli. The upper units are open. The dependent ones at the bottom are collapsed or flooded, and blood keeps flowing past them.' },
    { id: 'ards-3', at: 21, dur: 10, hold: true, target: 'lung.collapsed', title: 'Shunt: blood that never meets air', apply: () => { scene('ards', { peep: 5 }); focusVentTarget('lung.collapsed'); },
      say: 'Follow the red cells past a collapsed alveolus: they leave as blue as they arrived. This is shunt. Extra oxygen cannot reach these units, which is why the saturation barely moves when you raise the FiO2.' },
    { id: 'ards-4', at: 32, dur: 10, hold: true, target: 'lung.membrane', title: 'A thicker barrier, less surfactant', apply: () => { scene('ards', { peep: 5 }); focusVentTarget('lung.membrane'); },
      say: 'Across the membrane, the interstitium is swollen and the lining fluid is thick. Surfactant is broken into islands, so alveoli collapse at the end of every breath.' },
    { id: 'ards-5', at: 43, dur: 11, hold: true, target: 'lung.recruited', title: 'Raise the PEEP: recruitment', apply: () => { scene('ards', { peep: 16, vt: 0.42 }); focusVentTarget('lung.recruited'); },
      say: 'Now drop the tidal volume to six millilitres per kilogram and raise the PEEP to sixteen. Pressure at end-expiration holds the dependent alveoli open. Collapsed units re-inflate, the shunt falls, and the blood leaving them turns red.' },
    { id: 'ards-6', at: 55, dur: 10, hold: true, target: 'lung.alveolus', title: 'Too much: overdistension', apply: () => { scene('ards', { peep: 24, vt: 0.42 }); focusVentTarget('lung.alveolus'); },
      say: 'Push PEEP to twenty-four and the least dependent alveoli are overstretched. Their walls thin, they compress the capillaries around them, and the plateau pressure climbs past thirty.' },
    { id: 'ards-7', at: 66, dur: 10, hold: true, target: 'lung.whole', title: 'The target', apply: () => { scene('ards', { peep: 14, vt: 0.42 }); focusVentTarget('lung.whole'); },
      say: 'The goal is in between: enough PEEP to keep the dependent lung open, small tidal volumes of about six millilitres per kilogram, a plateau below thirty and a driving pressure below fifteen. Watch the numbers as you choose.' },
  ],
};
export const VENT_TIMELINES: Timeline[] = [ARDS_SIGNATURE];
