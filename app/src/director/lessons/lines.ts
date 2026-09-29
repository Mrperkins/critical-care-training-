/**
 * Shock-states signature lesson on the REAL Lines session (the one the Lines module runs).
 * Each cue rebuilds its scene from scratch — load the scenario, apply the therapy, jump therapy
 * responses to steady state, then run a fixed number of fixed-length ticks — so seeking to the same
 * time always produces the same circulation. After the cue the monitor keeps running live.
 */
import type { Timeline } from '../timeline';
import { lines } from '../../lines/session';
import { useLinesUI, type LinesView } from '../../lines/linesStore';
import { useUI } from '../../app/store';

const SETTLE_S = 16;
export interface ShockScene { id: string; nore?: number; dobutamine?: number; fluids?: number; prbc?: number; tap?: boolean; view: LinesView }
export function shockScene(sc: ShockScene) {
  lines.load(sc.id);
  if (sc.nore) lines.setNore(sc.nore);
  if (sc.dobutamine) lines.setDobutamine(sc.dobutamine);
  for (let i = 0; i < (sc.fluids ?? 0); i++) lines.fluid();
  for (let i = 0; i < (sc.prbc ?? 0); i++) lines.transfuse();
  if (sc.tap) lines.pericardiocentesis();
  lines.settleTherapy();
  for (let i = 0; i < SETTLE_S * 20; i++) lines.tick(0.05);
  useLinesUI.getState().set({ view: sc.view, labels: true, showTrue: false, frozen: false });
  useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}
const at = (sc: ShockScene) => () => shockScene(sc);

export const SHOCK_STATES: Timeline = {
  id: 'lines-shock-states', title: 'Shock states at the bedside', level: 'core', module: 'lines',
  blurb: 'Distributive, cardiogenic, obstructive and hypovolaemic shock on one live circulation: what the arterial line, the CVP and the heart show, and how each responds to the right treatment.',
  setup: at({ id: 'normal', view: 'bed' }),
  cues: [
    { id: 'sh-0', at: 0, dur: 9, hold: true, title: 'Four ways to fail', apply: at({ id: 'normal', view: 'bed' }),
      say: 'Blood pressure is flow times resistance: mean arterial pressure is cardiac output times systemic vascular resistance, plus the venous pressure. Shock is inadequate tissue perfusion, and every type breaks a different part of that equation. This is a normal patient for comparison.' },
    // distributive
    { id: 'sh-1', at: 10, dur: 11, hold: true, title: 'Distributive: the resistance falls', apply: at({ id: 'sepsis', view: 'wrist' }),
      say: 'Septic shock. Inflammatory mediators relax the arterioles, so resistance collapses. The heart speeds up and output is normal or high. On the arterial line the diastolic pressure is low, the pulse pressure is wide for the mean pressure, and the dicrotic notch sits low on the downstroke.' },
    { id: 'sh-2', at: 22, dur: 10, hold: true, title: 'Norepinephrine restores tone', apply: at({ id: 'sepsis', nore: 0.1, view: 'wrist' }),
      say: 'After fluid, norepinephrine constricts the arterioles through alpha-1 receptors. Resistance rises, the diastolic pressure and mean pressure come up, and the heart rate barely changes. The target is a mean pressure of about sixty-five.' },
    // cardiogenic
    { id: 'sh-3', at: 33, dur: 11, hold: true, title: 'Cardiogenic: the pump fails', apply: at({ id: 'cardiogenic', view: 'heart' }),
      say: 'Cardiogenic shock. A failing left ventricle ejects a small stroke volume, so the pulse pressure is narrow. Blood backs up: filling pressures and the CVP are high. Resistance rises as the body tries to hold the pressure, which makes the weak heart work harder.' },
    { id: 'sh-4', at: 45, dur: 10, hold: true, title: 'Dobutamine: squeeze harder', apply: at({ id: 'cardiogenic', dobutamine: 5, view: 'heart' }),
      say: 'Dobutamine stimulates beta-1 receptors on the myocardium. Contractility and stroke volume rise and resistance falls a little, so cardiac output climbs. Pressure may not rise much; a vasopressor is often needed alongside. Fluids would only raise the CVP further.' },
    // obstructive
    { id: 'sh-5', at: 56, dur: 12, hold: true, title: 'Obstructive: tamponade', apply: at({ id: 'tamponade', view: 'heart' }),
      say: 'Cardiac tamponade. Fluid in the pericardium squeezes the heart from outside, so the chambers cannot fill. The CVP is high, the pressures in all four chambers move toward the same value, and the stroke volume is small. The heart is fast, the pulse pressure narrow.' },
    { id: 'sh-6', at: 69, dur: 9, hold: true, title: 'Pulsus paradoxus', apply: at({ id: 'tamponade', view: 'wrist' }),
      say: 'Watch the arterial trace with breathing. On inspiration the right heart fills, the septum bulges left, and the left ventricle fills even less: systolic pressure drops more than ten millimetres of mercury. That exaggerated fall is pulsus paradoxus.' },
    { id: 'sh-7', at: 79, dur: 10, hold: true, title: 'Pericardiocentesis', apply: at({ id: 'tamponade', tap: true, view: 'heart' }),
      say: 'Draining even a small volume of pericardial fluid releases the heart. Filling recovers, the CVP falls, stroke volume and cardiac output return, and the paradox disappears.' },
    // hypovolaemic
    { id: 'sh-8', at: 90, dur: 12, hold: true, title: 'Hypovolaemic: the tank is empty', apply: at({ id: 'hypovol', view: 'bed' }),
      say: 'Haemorrhagic shock. With too little blood, venous return and preload fall: the CVP is low, the stroke volume small and the pulse pressure narrow. Resistance and heart rate rise to compensate. On the ventilator, each breath squeezes the small preload further, so the pulse pressure varies widely with breathing — a high pulse pressure variation.' },
    { id: 'sh-9', at: 103, dur: 10, hold: true, title: 'Volume, then blood', apply: at({ id: 'hypovol', fluids: 1, prbc: 2, view: 'bed' }),
      say: 'Give volume, and in haemorrhage give blood: it restores preload and oxygen-carrying capacity together. Stroke volume rises, the pulse pressure widens, the variation with breathing shrinks and the heart slows. Stopping the bleeding is the definitive treatment.' },
    { id: 'sh-10', at: 114, dur: 10, hold: true, title: 'Read the pattern', apply: at({ id: 'hypovol', fluids: 1, prbc: 2, view: 'vessels' }),
      say: 'Low resistance with high output: distributive. Low output with high filling pressures: cardiogenic. High filling pressures with a heart that cannot fill: obstructive. Low output with low filling pressures: hypovolaemic. The monitor tells you which lever to pull.' },
  ],
};
export const LINES_TIMELINES: Timeline[] = [SHOCK_STATES];
