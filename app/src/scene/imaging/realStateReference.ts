import { fastExam, type AbdomenState } from '../../abdomen/state';
import type { CxrState } from '../../vent/cxr';
import type { LusZone } from '../../vent/lus';

export interface RealReferenceMatch {
  id: string;
  label: string;
  reason: string;
}

/**
 * Select one real, openly licensed reference patient only when the simulator has established
 * a finding that the shipped media can honestly illustrate. A reference is never presented
 * as the simulated patient's actual image.
 */
export function selectCxrRealReference(st: CxrState): RealReferenceMatch | null {
  const maxPtx = Math.max(...st.side.map((s) => s.ptx));
  if (maxPtx > 0.08) {
    if (st.drain) return {
      id: 'ptx-series-bonilla',
      label: 'Real reference · pneumothorax with tube treatment',
      reason: 'The model still contains pleural air and a chest drain. This real before/after series demonstrates the treatment pattern without claiming identical laterality or tube position.',
    };
    return {
      id: 'ptx-expiratory',
      label: 'Real reference · pneumothorax',
      reason: 'The model contains a pneumothorax. This real film shows the pleural line and peripheral absence of lung markings; laterality and tension physiology may differ.',
    };
  }

  if (st.edema > 0.5) return {
    id: 'cxr-chf-haggstrom',
    label: 'Real reference · cardiogenic pulmonary oedema',
    reason: 'The model contains pulmonary oedema with cardiomegaly and effusions, so a real cardiogenic oedema film is the closest licensed reference.',
  };

  if (st.ards > 0.5) return {
    id: 'cxr-ards-2019',
    label: 'Real reference · ARDS',
    reason: 'The model contains bilateral recruitable ARDS opacity. This real ARDS film demonstrates diffuse bilateral air-space disease without implying that the simulated patient has the same cause or distribution.',
  };

  const rightCollapse = st.side[0].atelectasis;
  const leftCollapse = st.side[1].atelectasis;
  if (Math.max(rightCollapse, leftCollapse) > 0.4) return {
    id: 'cxr-collapse-before-after-2021',
    label: 'Real reference · whole-lung collapse',
    reason: 'The model contains major absorption atelectasis. This real collapse/re-expansion series demonstrates volume loss and re-expansion; the reference laterality may differ from the simulation.',
  };

  if (Math.max(...st.side.map((s) => s.effusion)) > 0.5) return {
    id: 'cxr-massive-effusion-2010',
    label: 'Real reference · large pleural effusion',
    reason: 'The model contains a large pleural-fluid burden. This real film demonstrates dense hemithorax opacity and mass effect from a massive effusion.',
  };

  const quiet = st.side.every((s) => s.ptx < 0.03 && s.atelectasis < 0.08 && s.opacity < 0.12 && s.effusion < 0.08);
  if (quiet && st.hyperinflation < 0.15) return {
    id: 'bfefde5d',
    label: 'Real reference · largely clear portable film',
    reason: 'The model is near its clear-lung baseline. This bedside film is a useful real reference for normal peripheral markings and sharp cardiophrenic/diaphragmatic borders.',
  };

  return null;
}

export function selectLusRealReference(z: LusZone): RealReferenceMatch | null {
  if (z.lungPoint) return {
    id: 'lus-lung-point-gillman',
    label: 'Real reference · lung point',
    reason: 'The selected simulated zone contains a lung point, so this real clip shows the transition between sliding and non-sliding pleura that confirms a partial pneumothorax.',
  };
  if (!z.sliding && !z.lungPulse) return {
    id: 'lus-absent-sliding-gillman',
    label: 'Real reference · absent lung sliding',
    reason: 'The selected simulated zone has absent sliding without a lung pulse, matching a pneumothorax-pattern reference. Absence of sliding alone is not diagnostic.',
  };
  if (z.effusion > 0.2) return {
    id: 'pleural-fluid-gillman',
    label: 'Real reference · pleural effusion',
    reason: 'The selected simulated posterolateral zone contains pleural fluid, so this real clip demonstrates an anechoic pleural collection above the diaphragm.',
  };
  if (z.consolidation > 0.4) return {
    id: 'lus-hepatisation-gillman',
    label: 'Real reference · consolidated lung',
    reason: 'The selected simulated zone contains substantial consolidation. This real clip demonstrates tissue-like hepatization rather than aerated lung artifact.',
  };
  if (z.white) return {
    id: 'whitelung',
    label: 'Real reference · confluent B-lines / white lung',
    reason: 'The selected simulated zone has confluent B-lines, so this real clip demonstrates the white-lung pattern and abnormal pleural line.',
  };
  if (z.bLines >= 3) return {
    id: 'lus-blines-gargani',
    label: 'Real reference · interstitial B-lines',
    reason: 'The selected simulated zone contains multiple B-lines. This real clip shows vertical pleural-origin artifacts reaching the far field.',
  };
  if (z.sliding && z.aLines) return {
    id: 'lus-sliding-gillman2012',
    label: 'Real reference · normal lung sliding',
    reason: 'The selected simulated zone is aerated with sliding and A-lines, so this real clip provides a normal pleural-motion reference.',
  };
  return null;
}

export function selectAbdomenRealReference(st: AbdomenState): RealReferenceMatch | null {
  if (st.aaa.diameterCm >= 3) return {
    id: 'aaa-us-sagittal-haggstrom',
    label: 'Real reference · abdominal aortic aneurysm',
    reason: 'The model contains an enlarged abdominal aorta. This real long-axis ultrasound shows aneurysmal aortic dilation; exact diameter and thrombus burden may differ.',
  };

  const ruq = fastExam(st).find((w) => w.id === 'ruq');
  if (ruq?.positive) return {
    id: 'fast-ruq-positive',
    label: 'Real reference · positive RUQ FAST',
    reason: 'The model has enough intraperitoneal fluid to make the RUQ FAST window positive. This real clip demonstrates an anechoic stripe in Morison’s pouch.',
  };

  return null;
}
