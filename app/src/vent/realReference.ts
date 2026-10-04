import type { CxrState } from './cxr';
import type { LusZone } from './lus';
import type { StateRealMatch } from '../scene/imaging/StateRealReference';

export function selectCxrReal(st: CxrState): StateRealMatch | null {
  const ptx = Math.max(st.side[0].ptx, st.side[1].ptx);
  if (ptx > 0.08) return {
    id: 'ptx-expiratory',
    label: 'Real reference · pneumothorax',
    reason: 'The simulated film contains pleural air. This licensed radiograph demonstrates the real lung-edge and marking-free pleural-air pattern.',
    caveat: 'Reference patient — this is a left apical, non-tension example; the simulation may differ in side, size, position and tension physiology.',
  };

  const rCollapse = st.side[0].atelectasis;
  const lCollapse = st.side[1].atelectasis;
  if (Math.max(rCollapse, lCollapse) > 0.4) {
    const left = lCollapse >= rCollapse;
    return left ? {
      id: 'cxr-left-collapse-child-2013',
      label: 'Real reference · whole-lung collapse',
      reason: 'The simulated opacity is driven by major left-sided absorption atelectasis. This reference demonstrates volume loss and mediastinal pull toward a collapsed lung.',
      caveat: 'Reference patient — this example is pediatric; use it for the collapse/volume-loss pattern, not age, tube position or exact anatomy.',
    } : {
      id: 'cxr-collapse-before-after-2021',
      label: 'Real reference · collapse and re-expansion',
      reason: 'The simulated film contains major right-sided collapse. This real before/after series demonstrates an opaque, volume-lost hemithorax and subsequent re-expansion.',
    };
  }

  if (st.edema > 0.5) return {
    id: 'cxr-chf-haggstrom',
    label: 'Real reference · cardiogenic pulmonary oedema',
    reason: 'The model is generating oedema with an enlarged cardiac silhouette and bilateral interstitial/alveolar opacity. This real film shows the corresponding congestion pattern.',
    caveat: 'Reference patient — PA versus portable AP technique and the exact severity differ from the simulation.',
  };

  if (st.ards > 0.5) return {
    id: 'cxr-ards-2019',
    label: 'Real reference · ARDS',
    reason: 'The simulated lungs contain bilateral patchy airspace disease from ARDS. This portable radiograph demonstrates a real diffuse patchy-to-confluent ARDS pattern.',
  };

  if (st.side.some((s) => s.effusion > 0.35)) return {
    id: 'cxr-massive-effusion-2010',
    label: 'Real reference · pleural effusion',
    reason: 'The model contains dependent pleural fluid. This real film demonstrates how a large effusion can opacify a hemithorax and displace the mediastinum.',
    caveat: 'Reference patient — this is a massive unilateral effusion and may be much larger than the simulated fluid volume.',
  };

  // Do not pretend the current media library has a state-matched asthma/COPD or obesity film.
  if (st.hyperinflation > 0.2 || st.habitus > 0.4) return null;

  const opacity = Math.max(st.side[0].opacity, st.side[1].opacity);
  if (opacity > 0.25) return {
    id: '3fd337c1',
    label: 'Real reference · ventilated patient with bilateral opacity',
    reason: 'The synthetic film contains bilateral opacity without a more specific matched diagnosis. This real portable AP image is the closest morphology reference.',
  };

  return {
    id: 'bfefde5d',
    label: 'Real reference · largely clear portable film',
    reason: 'The simulated radiograph is close to baseline. This real bedside film provides a normal-ish comparison for peripheral lung markings and sharp diaphragmatic borders.',
  };
}

export function selectLusReal(z: LusZone): StateRealMatch | null {
  if (z.lungPoint) return {
    id: 'lus-lung-point-gillman',
    label: 'Real reference · lung point',
    reason: 'The selected simulated zone contains a lung point. This real clip shows sliding lung meeting a non-sliding pneumothorax region with respiration.',
  };
  if (!z.sliding && !z.lungPulse) return {
    id: 'lus-absent-sliding-gillman',
    label: 'Real reference · absent lung sliding',
    reason: 'The selected simulated zone has absent sliding without a lung pulse. This clip shows the real pleural-line appearance that must still be integrated with other pneumothorax signs.',
  };
  if (z.effusion > 0.2) return {
    id: 'pleural-fluid-gillman',
    label: 'Real reference · pleural effusion',
    reason: 'The simulated posterolateral zone contains pleural fluid. This real clip shows an anechoic pleural collection above the diaphragm.',
  };
  if (z.lungPulse && z.consolidation > 0.3) return {
    id: 'lus-hepatisation-gillman',
    label: 'Real reference · tissue-like collapsed lung',
    reason: 'The simulation contains non-ventilated, consolidated lung with a lung pulse. This reference demonstrates the tissue-like/hepatised component; it does not demonstrate the lung pulse itself.',
  };
  if (z.white) return {
    id: 'whitelung',
    label: 'Real reference · confluent B-lines / white lung',
    reason: 'The selected zone has confluent B-lines. This real clip shows loss of black gaps as vertical artefacts merge into white lung.',
  };
  if (z.bLines >= 3) return {
    id: 'lus-blines-gargani',
    label: 'Real reference · B-lines',
    reason: 'The selected zone has an abnormal B-line burden. This real clip demonstrates bright vertical artefacts arising from the pleural line and reaching the far field.',
  };
  if (z.consolidation > 0.3) return {
    id: 'lus-hepatisation-gillman',
    label: 'Real reference · subpleural consolidation',
    reason: 'The selected zone contains tissue-like consolidation. This real clip demonstrates hepatisation and an irregular deep border.',
  };
  if (z.sliding && z.aLines) return {
    id: 'lus-sliding-gillman2012',
    label: 'Real reference · normal lung sliding',
    reason: 'The selected simulated zone shows sliding with A-lines. This real clip demonstrates the rib shadows, pleural line, sliding and reverberation pattern.',
  };
  return null;
}
