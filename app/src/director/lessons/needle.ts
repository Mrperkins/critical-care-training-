/**
 * Needle thoracostomy lesson: the chest-wall model (pure) sets the needle; every cue rebuilds the vent
 * 'ptx' patient with fixed-step settling, and only a needle that reaches the tension air decompresses it.
 */
import type { Timeline } from '../timeline';
import { scene } from './vent';
import { useNeedle } from '../../procedures/needleStore';
import { needlePath, NEEDLE_DEFAULT, type NeedleInput } from '../../procedures/needle';

function needle(p: Partial<NeedleInput>, inserted: boolean) {
  const input = { ...NEEDLE_DEFAULT, ...p }; useNeedle.getState().set({ input, inserted });
  const ok = inserted && needlePath(input).outcome === 'decompressed';
  scene('ptx', {}, ok ? { fix: 'decompress', fixAfter: 16, view: 'front' } : { view: 'front' });
}
export const NEEDLE_LESSON: Timeline = {
  id: 'vent-needle', title: 'Needle thoracostomy: site, rib, depth', level: 'advanced', module: 'vent', absolute: true,
  blurb: 'Through the chest wall layer by layer: where to go in, why over the top of the rib, and why a needle that is too short is worse than it looks.',
  setup: () => needle({}, false),
  cues: [
    { id: 'nd-1', at: 0, dur: 10, hold: true, title: 'Tension on the ventilator', apply: () => needle({}, false),
      say: 'A ventilated patient with a right tension pneumothorax: high peak and plateau pressures, falling saturation, blood pressure collapsing. The treatment is to let the pleural air out — now.' },
    { id: 'nd-2', at: 11, dur: 11, hold: true, title: 'Two sites', apply: () => needle({ site: '2ics-mcl' }, false),
      say: 'Two recognised sites: the second intercostal space in the mid-clavicular line, and the fourth or fifth space at the anterior or mid-axillary line, inside the safe triangle. Stay lateral to the nipple line and above it.' },
    { id: 'nd-3', at: 23, dur: 11, hold: true, title: 'Over the top of the rib', apply: () => needle({ rib: 'underUpper' }, true),
      say: 'Look at the rib above: its lower edge hides the intercostal vein, artery and nerve. A needle under the upper rib risks bleeding into the chest you are trying to decompress. Go over the top of the rib below.' },
    { id: 'nd-4', at: 35, dur: 12, hold: true, title: 'Too short', apply: () => needle({ site: '2ics-mcl', habitus: 'obese', length: 5 }, true),
      say: 'Anteriorly the needle crosses the pectoral muscles. In a heavier patient a five-centimetre catheter ends in muscle. No air, no change — and the attempt looks done when it is not.' },
    { id: 'nd-5', at: 48, dur: 13, hold: true, title: 'Lateral, long enough: decompression', apply: () => needle({ site: '45ics-aal', length: 8 }, true),
      say: 'At the fourth or fifth space laterally, with a longer catheter, over the rib below and perpendicular to the skin: a rush of air as the pleura is crossed. Stop there, advance the catheter off the needle. Watch the peak pressure, the saturation and the blood pressure recover.' },
    { id: 'nd-6', at: 62, dur: 11, hold: true, title: 'Too medial, too low', apply: () => needle({ site: 'parasternal' }, true),
      say: 'Too close to the sternum and you meet the internal thoracic artery, then the heart. Too low and the diaphragm, liver or spleen are in the way. Landmarks matter more than speed.' },
    { id: 'nd-7', at: 74, dur: 10, hold: true, title: 'A bridge, not a fix', apply: () => needle({ site: '45ics-aal', length: 8 }, true),
      say: 'A needle is a bridge. Catheters kink and dislodge, and the tension can return. Reassess often, and follow with a finger thoracostomy or a chest drain.' },
  ],
};
