/**
 * Reversing anticoagulation, on the coagulation engine inside the Labs-bench patient. Each cue rebuilds from a
 * preset, gives the drugs and fast-forwards a fixed time, so seeking is exact.
 */
import type { Timeline } from '../timeline';
import { bench } from '../../labs/bench';
import { useLabUI } from '../../labs/labStore';
import { useUI } from '../../app/store';
import type { CoagDrug, CoagPresetId } from '../../physiology/coag';

function coagScene(preset: CoagPresetId, drugs: CoagDrug[] = [], minutes = 0, after: CoagDrug[] = []) {
  bench.reset(); bench.startCoag(preset); for (const d of drugs) bench.coag(d); if (minutes) bench.fastForward(minutes); for (const d of after) bench.coag(d);
  bench.running = false; bench.sel = 'inr'; useLabUI.getState().set({ lab: 'inr', view: 'cell', autoplay: false }); useUI.getState().set({ pulse: useUI.getState().pulse + 1 });
}
const at = (...a: Parameters<typeof coagScene>) => () => coagScene(...a);
export const COAG_LESSON: Timeline = {
  id: 'labs-coag', title: 'Reversing anticoagulation: warfarin, heparin and clots that dissolve', level: 'core', module: 'labs',
  blurb: 'On one patient’s clotting system: why PCC works in minutes but needs vitamin K, why protamine fixes heparin but not an infusion still running, and what tranexamic acid does in trauma.',
  setup: at('normal'),
  cues: [
    { id: 'co-1', at: 0, dur: 12, hold: true, title: 'Normal clotting', apply: at('normal'),
      say: 'When a vessel tears, platelets plug the hole, and clotting factors made by the liver generate thrombin, which weaves fibrinogen into a fibrin mesh. The trace shows a clot forming on time and staying firm.' },
    { id: 'co-2', at: 13, dur: 13, hold: true, title: 'Warfarin, INR over six', apply: at('warfarinBleed'),
      say: 'Warfarin blocks the recycling of vitamin K, so the liver makes clotting factors that cannot work. Here only about seven percent of factors two, seven, nine and ten are active. The INR is over six, the clot forms late and weak, and this patient is bleeding.' },
    { id: 'co-3', at: 27, dur: 12, hold: true, title: 'Prothrombin complex concentrate', apply: at('warfarinBleed', ['pcc'], 30),
      say: 'Prothrombin complex concentrate replaces those four factors directly. Thirty minutes later the INR is close to normal and the clot forms on time.' },
    { id: 'co-4', at: 40, dur: 13, hold: true, title: 'A day later, without vitamin K', apply: at('warfarinBleed', ['pcc'], 1440),
      say: 'But factor seven lasts only about six hours. Without vitamin K the liver still cannot make working factors, and a day later the INR has climbed back toward three.' },
    { id: 'co-5', at: 54, dur: 12, hold: true, title: 'With vitamin K', apply: at('warfarinBleed', ['pcc', 'vitkIV'], 1440),
      say: 'Give intravenous vitamin K with the concentrate, and the liver takes over as the concentrate is used up. A day later the INR is still normal.' },
    { id: 'co-6', at: 67, dur: 12, hold: true, title: 'Heparin', apply: at('heparinHigh'),
      say: 'Heparin works differently. It supercharges antithrombin, which switches off thrombin and factor ten A. The INR hardly moves, but the aPTT is several times normal.' },
    { id: 'co-7', at: 80, dur: 12, hold: true, title: 'Protamine', apply: at('heparinHigh', ['protamine'], 10),
      say: 'Protamine is strongly positive and binds the negative heparin chains. Within minutes the aPTT is back to normal. If an infusion were still running it would climb again, so stop the heparin first.' },
    { id: 'co-8', at: 93, dur: 13, hold: true, title: 'When clots dissolve', apply: at('traumaLysis', [], 60),
      say: 'Major trauma can switch on fibrinolysis: clots break down almost as fast as they form, and fibrinogen is consumed. The trace rises, then melts away, and fibrinogen falls toward one hundred.' },
    { id: 'co-9', at: 107, dur: 13, hold: true, title: 'Tranexamic acid, then fibrinogen', apply: at('traumaLysis', ['txa'], 60, ['cryo', 'cryo']),
      say: 'Tranexamic acid stops plasminogen binding to fibrin, so clots hold; it works best within three hours of injury. Replacing fibrinogen, with cryoprecipitate or concentrate, restores the strength of the clot.' },
  ],
};
