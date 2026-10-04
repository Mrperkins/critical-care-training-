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
import { advance, type PatientParams } from '../../physiology/patient';

const SETTLE_S = 16;
export interface ShockScene { id: string; nore?: number; dobutamine?: number; fluids?: number; prbc?: number; tap?: boolean; view: LinesView;
  /** haemoglobin g/dL (dilution, anaemia), cardiac-output / SVR multipliers, shunt fraction (hypoxaemia) */ hb?: number; coMult?: number; svrMult?: number; shunt?: number;
  /** other patient parameters (e.g. lactate production in sepsis) and minutes of slow physiology to run before settling (lactate, SvO₂ trends) */ params?: Partial<PatientParams>; physioMin?: number }
export function shockScene(sc: ShockScene) {
  lines.load(sc.id);
  if (sc.hb != null) lines.pt.p.hb = sc.hb;
  if (sc.coMult != null) lines.pt.p.co *= sc.coMult;
  if (sc.shunt != null) lines.pt.p.shunt = sc.shunt;
  if (sc.svrMult != null) lines.pt.p.svr *= sc.svrMult;
  if (sc.params) Object.assign(lines.pt.p, sc.params);
  if (sc.nore) lines.setNore(sc.nore);
  if (sc.dobutamine) lines.setDobutamine(sc.dobutamine);
  for (let i = 0; i < (sc.fluids ?? 0); i++) lines.fluid();
  for (let i = 0; i < (sc.prbc ?? 0); i++) lines.transfuse();
  if (sc.tap) lines.pericardiocentesis();
  lines.settleTherapy();
  if (sc.physioMin) { advance(lines.pt, sc.physioMin); lines.recompute(); }
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

export const OXYGEN_DELIVERY: Timeline = {
  id: 'lines-oxygen-delivery', title: 'Oxygen delivery: DO₂ = CO × CaO₂', level: 'core', module: 'lines',
  blurb: 'Haemoglobin, saturation and cardiac output each multiply into oxygen delivery. Break any one and the tissues run short — the lactate and the venous saturation tell you.',
  setup: at({ id: 'normal', view: 'bed' }),
  cues: [
    { id: 'do-1', at: 0, dur: 11, hold: true, title: 'The equation', apply: at({ id: 'normal', view: 'bed' }),
      say: 'Oxygen content is mostly haemoglobin carrying oxygen: one point three four times haemoglobin times saturation, plus a tiny dissolved amount. Delivery is content times cardiac output. Normally about a thousand millilitres a minute is delivered and a quarter is used, so venous blood returns about seventy-five percent saturated.' },
    { id: 'do-2', at: 12, dur: 11, hold: true, title: 'Anaemia halves the content', apply: at({ id: 'normal', hb: 7, svrMult: 0.8, physioMin: 60, view: 'bed' }),
      say: 'Halve the haemoglobin. The saturation is unchanged — the pulse oximeter looks perfect — but the oxygen content has halved. A healthy heart raises its output and thinner blood lowers the resistance, which recovers part of the delivery. The oximeter measures the percentage of haemoglobin that is full, not how much haemoglobin there is.' },
    { id: 'do-3', at: 24, dur: 10, hold: true, title: 'A failing heart cannot compensate', apply: at({ id: 'cardiogenic', hb: 7, physioMin: 60, view: 'heart' }),
      say: 'Give the same anaemia to a patient whose heart cannot raise its output. Now delivery falls far below what the tissues need: venous saturation drops and lactate starts to climb.' },
    { id: 'do-4', at: 35, dur: 10, hold: true, title: 'Hypoxaemia lowers saturation', apply: at({ id: 'normal', shunt: 0.32, physioMin: 60, view: 'bed' }),
      say: 'Now keep the haemoglobin normal but add shunt in the lungs. The saturation falls, and content falls with it — but less than you might expect, because of the shape of the dissociation curve.' },
    { id: 'do-5', at: 46, dur: 11, hold: true, title: 'Low output: cardiogenic shock', apply: at({ id: 'cardiogenic', physioMin: 60, view: 'heart' }),
      say: 'With normal blood but a failing pump, delivery falls in proportion to the output. The tissues extract more, venous saturation falls, and lactate rises as cells switch to anaerobic metabolism.' },
    { id: 'do-6', at: 58, dur: 11, hold: true, title: 'High delivery, still lactic: sepsis', apply: at({ id: 'sepsis', params: { lactateProd: 3 }, physioMin: 60, view: 'wrist' }),
      say: 'Septic shock can have a high cardiac output and high delivery, yet lactate is raised: blood is poorly distributed through the microcirculation, and the cells themselves use oxygen badly. A normal or high venous saturation does not rule out tissue hypoxia.' },
  ],
};

export const HAEMORRHAGE_TRANSFUSION: Timeline = {
  id: 'lines-haemorrhage-transfusion', title: 'Haemorrhagic shock and transfusion', level: 'core', module: 'lines',
  blurb: 'Blood loss empties the tank before the haemoglobin falls; crystalloid dilutes it; blood restores both volume and oxygen content. And how to recognise a reaction.',
  setup: at({ id: 'normal', view: 'bed' }),
  cues: [
    { id: 'ht-1', at: 0, dur: 9, hold: true, title: 'Before', apply: at({ id: 'normal', view: 'bed' }), say: 'A healthy adult. Note the haemoglobin, the pressures, and the oxygen delivery.' },
    { id: 'ht-2', at: 10, dur: 12, hold: true, title: 'Early: the haemoglobin lies', apply: at({ id: 'hypovol', hb: 13.5, physioMin: 30, view: 'bed' }),
      say: 'Rapid bleeding. What is lost is whole blood, so the haemoglobin concentration is almost unchanged at first. The problem is volume: low preload, low CVP, small stroke volume, narrow pulse pressure, a fast heart and falling delivery.' },
    { id: 'ht-3', at: 23, dur: 12, hold: true, title: 'Crystalloid dilutes', apply: at({ id: 'hypovol', hb: 9, fluids: 2, view: 'bed' }),
      say: 'Two litres of crystalloid restore some volume and pressure, but now the haemoglobin falls: the remaining red cells are diluted. Delivery improves less than the blood pressure suggests, and much of the crystalloid leaves the circulation within an hour.' },
    { id: 'ht-4', at: 36, dur: 12, hold: true, title: 'Give blood', apply: at({ id: 'hypovol', hb: 9, prbc: 3, view: 'bed' }),
      say: 'Packed red cells restore volume and oxygen-carrying capacity together. Stroke volume and pulse pressure rise, the heart slows, the haemoglobin climbs and delivery improves. In major haemorrhage, give plasma and platelets with the red cells, and calcium.' },
    { id: 'ht-5', at: 49, dur: 12, hold: true, title: 'Watch for a reaction', apply: at({ id: 'hypovol', hb: 9, prbc: 3, view: 'wrist' }),
      say: 'During every unit, watch the patient. Fever, rigors, a sudden fall in pressure, wheeze, urticaria, back pain or dark urine suggest a reaction. Stop the transfusion, keep the line open with saline, check the patient and the product, and follow your transfusion protocol.' },
    { id: 'ht-6', at: 62, dur: 9, hold: true, title: 'Stop the bleeding', apply: at({ id: 'hypovol', hb: 9, prbc: 3, view: 'vessels' }),
      say: 'Transfusion buys time. Definitive treatment is control of the bleeding: pressure, tourniquet, surgery or interventional radiology.' },
  ],
};

export const LINES_TIMELINES: Timeline[] = [SHOCK_STATES, OXYGEN_DELIVERY, HAEMORRHAGE_TRANSFUSION];
