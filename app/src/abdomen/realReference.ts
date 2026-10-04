import type { AbdomenState } from './state';
import { fastExam } from './state';
import type { StateRealMatch } from '../scene/imaging/StateRealReference';

export function selectAbdomenReal(st: AbdomenState): StateRealMatch | null {
  if (st.aaa.diameterCm >= 3) return {
    id: st.aaa.diameterCm >= 5 ? 'aaa-us-thrombus-haggstrom' : 'aaa-us-axial-haggstrom',
    label: 'Real reference · abdominal aortic aneurysm',
    reason: `The simulated aorta measures ${st.aaa.diameterCm.toFixed(1)} cm. This real ultrasound demonstrates outer-wall measurement and the way mural thrombus can make the patent lumen look deceptively smaller.`,
    caveat: st.aaa.rupture === 'none'
      ? 'Reference patient — use this for aneurysm identification and measurement, not for predicting rupture.'
      : 'Reference patient — this image demonstrates aneurysm anatomy, not the simulated rupture or haemodynamic severity.',
  };

  const fast = fastExam(st);
  const positive = fast.filter((x) => x.positive);
  if (positive.length) {
    const ruq = positive.some((x) => x.id === 'ruq');
    return {
      id: 'fast-ruq-positive',
      label: 'Real reference · positive FAST',
      reason: ruq
        ? 'The simulated RUQ is positive. This real hepatorenal clip demonstrates an anechoic stripe of free intraperitoneal fluid in Morison’s pouch.'
        : `The simulation is FAST-positive in ${positive.map((x) => x.id.toUpperCase()).join(', ')}. The current open-media library has a vetted RUQ example, shown here to teach the appearance of free fluid rather than the exact simulated window.`,
      caveat: 'Reference patient — window, fluid volume, source of bleeding and timing may differ from the simulation.',
    };
  }

  return null;
}
