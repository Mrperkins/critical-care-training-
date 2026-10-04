import { DEFAULT_SYSTEMIC, neuroSummary, type NeuroState, type Systemic } from '../perfusion';

export interface NeuroRealMatch {
  id: string;
  stage: 'vessel-sign' | 'perfusion' | 'early-infarct' | 'mass-effect' | 'established-infarct' | 'ich' | 'sah';
  label: string;
  reason: string;
}

/**
 * Pick one real, openly licensed reference image that best matches the simulated neuro state.
 *
 * This deliberately returns null when the available media would imply anatomy or pathology the
 * model has not established. The selected item is a reference patient, never a claim that the
 * simulated patient would have an identical scan.
 */
export function selectNeuroRealFinding(st: NeuroState, sys: Systemic = DEFAULT_SYSTEMIC): NeuroRealMatch | null {
  if (st.hemorrhage?.kind === 'sah') {
    return {
      id: 'sah-ct-mirza',
      stage: 'sah',
      label: 'Real reference · subarachnoid blood',
      reason: 'The model contains subarachnoid haemorrhage, so a real non-contrast CT example of cisternal and sulcal blood is the closest licensed reference.',
    };
  }
  if (st.hemorrhage?.kind === 'ich') {
    return {
      id: 'ich-deep-locations-2016',
      stage: 'ich',
      label: 'Real reference · deep intracerebral haemorrhage',
      reason: 'The model contains a deep spontaneous ICH. This reference demonstrates the typical deep locations and CT density of acute intraparenchymal blood without inventing ventricular extension or a CTA spot sign.',
    };
  }

  const active = Object.entries(st.occlusion).filter(([, v]) => v > 0.05).map(([id]) => id);
  if (!active.length) return null;

  // The current vetted real stroke set is strongest for anterior-circulation/MCA disease. Do not
  // pretend that an MCA reference is a basilar or isolated PCA scan.
  const mca = active.some((id) => /^m[12][si]?_[LR]$/.test(id) || /^m1_[LR]$/.test(id));
  const anterior = mca || active.some((id) => /^ica_[LR]$/.test(id));
  if (!anterior) return null;

  const summary = neuroSummary(st, sys);
  const reopened = st.recanalizedAt != null && st.minutes >= st.recanalizedAt;
  const core = summary.coreMl;

  if (!reopened && mca && st.minutes <= 45) {
    return {
      id: 'stroke-hmcas-2025',
      stage: 'vessel-sign',
      label: 'Real reference · hyperdense MCA sign',
      reason: 'Very early after an MCA occlusion the parenchyma may still look nearly normal; a hyperdense artery can be the first non-contrast CT clue.',
    };
  }
  if (!reopened && st.minutes <= 180) {
    return {
      id: 'stroke-ctp-mismatch-2025',
      stage: 'perfusion',
      label: 'Real reference · perfusion mismatch',
      reason: 'At this early stage the model still contains threatened but potentially salvageable tissue, so a real core–penumbra mismatch study is the closest visual analogue.',
    };
  }
  if (st.minutes < 480 || (reopened && core < 10 && st.minutes < 720)) {
    return {
      id: 'stroke-early-change-2025',
      stage: 'early-infarct',
      label: 'Real reference · early ischaemic change',
      reason: reopened
        ? 'Flow has been restored in the model, but any tissue already injured can lag behind reperfusion on non-contrast CT; this is an early parenchymal reference, not proof of a large completed infarct.'
        : 'The model has progressed beyond the earliest vessel/perfusion phase, so loss of grey–white differentiation is a better real-world reference than a normal-looking early CT.',
    };
  }
  if (core >= 55 && st.minutes < 1080) {
    return {
      id: 'stroke-malignant-edema-2023',
      stage: 'mass-effect',
      label: 'Real reference · malignant MCA oedema',
      reason: 'The simulated completed core is large and several hours old. A real example of space-occupying MCA infarction demonstrates the mass-effect pattern that becomes the major late threat.',
    };
  }
  if (st.minutes >= 960) {
    return {
      id: 'stroke-infarct-24h-2025',
      stage: 'established-infarct',
      label: 'Real reference · established infarct',
      reason: 'By the late time window the model has declared its completed core. A real follow-up CT with established infarction is a better comparison than the early vessel-sign examples.',
    };
  }
  return {
    id: 'stroke-mass-effect-2021',
    stage: 'mass-effect',
    label: 'Real reference · evolving large infarct',
    reason: 'The model is several hours into an anterior-circulation stroke with a meaningful completed core; this reference shows the evolving hypodensity and swelling pattern without assuming haemorrhagic transformation.',
  };
}
