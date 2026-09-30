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
import { useLusUI } from '../../vent/LusScene';

const SETTLE_S = 14; // seconds of ventilation simulated before a scene is shown (≈ 3–4 breaths)
const run = (sec: number) => { for (let i = 0; i < Math.round(sec * 20); i++) session.tick(0.05); };
interface SceneOpts { hold?: 'i' | 'e'; fix?: 'decompress' | 'bronchodilator'; fixAfter?: number; view?: import('../../app/store').VentView }
export function scene(id: string, p: Partial<VentSettings>, o: SceneOpts = {}) {
  session.load(id); if (Object.keys(p).length) session.set(p);
  run(SETTLE_S);
  if (o.fix) { session.intervene(o.fix); run(o.fixAfter ?? 14); }
  if (o.hold) { session.hold(o.hold); run(9); } // a hold happens on the next mandatory breath and is then measured
  const ui = useUI.getState(); ui.set({ ventScenario: id, pulse: ui.pulse + 1, ...(o.view ? { ventView: o.view, ventTarget: 'lung.whole' } : {}) });
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
    { id: 'ards-8', at: 77, dur: 12, hold: true, title: 'The film at PEEP five', apply: () => scene('ards', { peep: 5, vt: 0.42 }, { view: 'xray' }),
      say: 'On a portable film at a PEEP of five, both lungs are white with patchy opacities and air bronchograms, and the heart is a normal size. That is the pattern of ARDS, not of heart failure.' },
    { id: 'ards-9', at: 90, dur: 12, hold: true, title: 'The film after recruitment', apply: () => scene('ards', { peep: 16, vt: 0.42 }, { view: 'xray' }),
      say: 'At a PEEP of sixteen the same lungs look clearer, because collapsed units have opened and now hold air. The film changes with the ventilator settings, not only with the disease.' },
    { id: 'ards-10', at: 103, dur: 12, hold: true, title: 'The probe at PEEP five', apply: () => { scene('ards', { peep: 5, vt: 0.42 }, { view: 'lus' }); useLusUI.getState().set('R-lat'); },
      say: 'With a probe on the side of the chest at a PEEP of five, the B-lines merge into a white lung, and the dependent lung under the probe is consolidated and airless.' },
    { id: 'ards-11', at: 116, dur: 12, hold: true, title: 'The probe after recruitment', apply: () => { scene('ards', { peep: 16, vt: 0.42 }, { view: 'lus' }); useLusUI.getState().set('R-lat'); },
      say: 'At sixteen there are fewer B-lines and the consolidation has gone: the same recruitment you saw at the alveoli, seen at the bedside in seconds.' },
  ],
};

export const COMPLIANCE_VS_RESISTANCE: Timeline = {
  id: 'vent-ards-vs-obstruction', title: 'ARDS vs asthma / COPD: stiff lung or narrow airway?', level: 'core', module: 'vent',
  blurb: 'Both raise the peak pressure. An inspiratory hold separates a compliance problem (plateau high) from a resistance problem (peak–plateau gap wide), and an expiratory hold finds the trapped gas.',
  setup: () => scene('normal', { mode: 'VC', vt: 0.45, peep: 5 }, { view: 'front' }),
  cues: [
    { id: 'cr-1', at: 0, dur: 11, hold: true, title: 'Peak = resistance + elastance + PEEP', apply: () => scene('normal', { mode: 'VC', vt: 0.45, peep: 5 }, { hold: 'i', view: 'front' }),
      say: 'In volume control with constant flow, the peak pressure has three parts: PEEP, the pressure to stretch the lung — volume divided by compliance — and the pressure to push flow through the airways — resistance times flow. An inspiratory hold stops the flow, and what remains is the plateau.' },
    { id: 'cr-2', at: 12, dur: 12, hold: true, title: 'ARDS: a compliance problem', apply: () => scene('ards', { mode: 'VC', vt: 0.42, peep: 10 }, { hold: 'i', view: 'side' }),
      say: 'In ARDS the lung is small and stiff. Peak and plateau are both high and close together: the gap between them — the resistive part — is normal. The fix is about volume and PEEP: smaller breaths, keep the plateau under thirty.' },
    { id: 'cr-3', at: 25, dur: 12, hold: true, title: 'Asthma: a resistance problem', apply: () => scene('asthma', {}, { hold: 'i', view: 'airway' }),
      say: 'In severe asthma the airways are narrow. The peak pressure is very high, but the plateau is only modestly raised: the big peak-to-plateau gap is resistance. Raising the peak alarm will not help; opening the airways will.' },
    { id: 'cr-4', at: 38, dur: 12, hold: true, title: 'Air trapping and auto-PEEP', apply: () => scene('asthma', {}, { hold: 'e', view: 'airway' }),
      say: 'Look at the flow trace: expiratory flow has not returned to zero when the next breath starts. Gas is trapped. An expiratory hold measures the pressure it creates: auto-PEEP, on top of the set PEEP. Trapped gas raises intrathoracic pressure and can drop the blood pressure.' },
    { id: 'cr-5', at: 51, dur: 11, hold: true, title: 'Treat the airway, give time to exhale', apply: () => scene('asthma', { rr: 10 }, { fix: 'bronchodilator', hold: 'e', view: 'airway' }),
      say: 'A bronchodilator lowers resistance and a slower rate lengthens expiration. The peak falls, the gap narrows, expiratory flow reaches zero and the auto-PEEP melts away.' },
    { id: 'cr-6', at: 63, dur: 10, hold: true, title: 'COPD: flow limitation', apply: () => scene('copd', { rr: 22 }, { hold: 'e', view: 'airway' }),
      say: 'In COPD the small airways collapse during expiration, limiting flow no matter how hard the patient pushes. The same rules apply: long expiratory times, modest minute ventilation, and measure the trapped pressure.' },
    { id: 'cr-7', at: 74, dur: 12, hold: true, title: 'Two films, two problems', apply: () => scene('asthma', {}, { view: 'xray' }),
      say: 'The films tell the same story. The asthmatic lungs are hyperinflated: dark, over-expanded, with low flat diaphragms and a narrow heart, because trapped air cannot get out. The ARDS film was white.' },
    { id: 'cr-8', at: 87, dur: 12, hold: true, title: 'The ultrasound difference', apply: () => { scene('asthma', {}, { view: 'lus' }); useLusUI.getState().set('R-ant'); },
      say: 'On ultrasound the asthmatic lung slides, with A-lines only: full of air, with no fluid. The ARDS lung showed B-lines everywhere. A stiff lung and a narrow airway look different at the bedside.' },
  ],
};

export const TENSION_PTX: Timeline = {
  id: 'vent-tension-ptx', title: 'Tension pneumothorax on the ventilator', level: 'core', module: 'vent',
  blurb: 'Pleural air under pressure: the lung collapses, peak pressures climb, venous return falls and the patient goes into obstructive shock — until the chest is decompressed.',
  setup: () => scene('normal', {}, { view: 'front' }),
  cues: [
    { id: 'ptx-1', at: 0, dur: 9, hold: true, target: 'lung.whole', title: 'Before', apply: () => scene('normal', {}, { view: 'front' }),
      say: 'A ventilated patient with normal lungs. Note the peak pressure, the saturation and the blood pressure.' },
    { id: 'ptx-2', at: 10, dur: 12, hold: true, target: 'lung.whole', title: 'Air under pressure', apply: () => scene('ptx', {}, { view: 'front' }),
      say: 'A leak from the right lung lets air into the pleural space with every positive-pressure breath, and it cannot escape. Pleural pressure rises, the right lung collapses toward the hilum, and the mediastinum is pushed away.' },
    { id: 'ptx-3', at: 23, dur: 10, hold: true, target: 'lung.collapsed', title: 'Shunt and falling saturation', apply: () => { scene('ptx', {}); useUI.getState().set({ ventView: 'alveolus', ventTarget: 'lung.collapsed' }); },
      say: 'Down at the alveoli, the compressed lung has collapsed but is still perfused: blood passes through without meeting air, and the saturation falls.' },
    { id: 'ptx-4', at: 34, dur: 11, hold: true, target: 'lung.whole', title: 'Obstructive shock', apply: () => scene('ptx', {}, { view: 'front' }),
      say: 'The high intrathoracic pressure squeezes the great veins, venous return falls, and cardiac output with it. Peak pressures alarm high, the blood pressure drops and the heart races. This is obstructive shock: a mechanical problem that fluids and pressors cannot fix.' },
    { id: 'ptx-5', at: 46, dur: 11, hold: true, target: 'lung.whole', title: 'Decompress', apply: () => scene('ptx', {}, { fix: 'decompress', fixAfter: 16, view: 'front' }),
      say: 'Needle decompression, then a chest tube. The pleural air escapes, the lung re-expands, peak pressure falls, venous return and blood pressure recover, and the saturation climbs.' },
    { id: 'ptx-6', at: 58, dur: 12, hold: true, title: 'What the probe would have shown', apply: () => { scene('ptx', {}, { view: 'lus' }); useLusUI.getState().set('R-ant'); },
      say: 'Back to the moment before decompression, seen with a linear probe on the front of the chest. On the right the bright pleural line does not shimmer: no sliding, only A-line echoes, and the M-mode is a barcode. On the left the lung slides and the M-mode looks like a seashore. Ultrasound takes seconds, but it confirms — it should never delay decompression in a crashing patient.' },
    { id: 'ptx-7', at: 71, dur: 11, hold: true, title: 'What the film would have shown', apply: () => scene('ptx', {}, { view: 'xray' }),
      say: 'The same moment on a portable film: a pleural edge with no lung markings beyond it, a flattened right hemidiaphragm, and the mediastinum pushed to the left. A film like this is a teaching picture; tension is treated on clinical signs.' },
    { id: 'ptx-8', at: 83, dur: 12, hold: true, title: 'A lung point as the lung returns', apply: () => { scene('ptx', {}, { fix: 'decompress', fixAfter: 16, view: 'lus' }); useLusUI.getState().set('R-lat'); },
      say: 'After decompression the tension is gone, but a little air is still trapped at the front of the chest. Anteriorly there is still no sliding. Move the probe laterally: at one spot sliding appears and disappears with each breath — a lung point, the edge of the remaining air. It confirms a pneumothorax, and it moves outward as the drain lets the lung come back.' },
  ],
};

export const VENT_TIMELINES: Timeline[] = [ARDS_SIGNATURE, COMPLIANCE_VS_RESISTANCE, TENSION_PTX];
