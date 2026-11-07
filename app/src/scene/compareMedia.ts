/**
 * Normal ↔ abnormal pairs of real studies for "Compare with normal" (ids from imaging/real/manifest.json and the
 * MRI catalog). A pair is only listed when the normal and abnormal study show the same view on the same kind of
 * study, so the difference on screen is the disease, not the technique.
 */
import type { MediaPair } from './CompareShell';

const LUNG_US: MediaPair[] = [
  { normal: 'lus-sliding-gillman2012', abnormal: 'lus-absent-sliding-gillman', label: 'Lung ultrasound · sliding vs pneumothorax (no sliding)', tags: ['ptx'] },
  { normal: 'lus-sliding-gillman2012', abnormal: 'lus-lung-point-gillman', label: 'Lung ultrasound · sliding vs lung point', tags: ['ptx'] },
  { normal: 'alines', abnormal: 'blines', label: 'Lung ultrasound · A-lines vs B-lines', tags: ['edema', 'pneumonia'] },
  { normal: 'alines', abnormal: 'whitelung', label: 'Lung ultrasound · A-lines vs white lung (ARDS)', tags: ['ards'] },
  { normal: 'alines', abnormal: 'lus-hepatisation-gillman', label: 'Lung ultrasound · A-lines vs consolidation', tags: ['pneumonia', 'plug'] },
];
const CXR: MediaPair[] = [
  { normal: 'cxr-normal-pa-haggstrom', abnormal: 'cxr-ards-2019', label: 'Chest X-ray · normal vs ARDS', tags: ['ards', 'sepsis'] },
  { normal: 'cxr-normal-pa-haggstrom', abnormal: 'cxr-tension-ptx-right-olv-2024', label: 'Chest X-ray · normal vs tension pneumothorax', tags: ['ptx'] },
  { normal: 'cxr-normal-pa-haggstrom', abnormal: 'cxr-hyperinflation-asthma-2025', label: 'Chest X-ray · normal vs hyperinflation (asthma)', tags: ['asthma', 'copd', 'pregAsthma'] },
  { normal: 'cxr-normal-pa-haggstrom', abnormal: 'cxr-left-whiteout-mucus-plug-2026', label: 'Chest X-ray · normal vs left lung collapse (mucus plug)', tags: ['plug'] },
  { normal: 'cxr-normal-pa-haggstrom', abnormal: 'cxr-flash-edema-portable-2026', label: 'Chest X-ray · normal vs pulmonary oedema', tags: ['edema'] },
  { normal: 'cxr-ett-ok-ebi-2019', abnormal: 'cxr-mainstem-right-ebi-2019', label: 'Chest X-ray · tube in the trachea vs right mainstem', tags: ['mainstem'] },
];
const FAST_HEART: MediaPair[] = [
  { normal: 'fast-pericardial-negative-subcostal-2020', abnormal: 'fast-pericardial-positive-focus-2026', label: 'Subcostal view · no effusion vs pericardial effusion' },
  { normal: 'fast-pericardial-negative-subcostal-2020', abnormal: 'tamponade-ginghina', label: 'No effusion (subcostal) vs tamponade loop' },
];
export const COMPARE_MEDIA: Record<string, MediaPair[]> = {
  vent: [...LUNG_US, ...CXR],
  gas: [CXR[0], CXR[4], LUNG_US[2], LUNG_US[3]],
  heart: [...FAST_HEART, { normal: 'cxr-normal-pa-haggstrom', abnormal: 'cxr-chf-haggstrom', label: 'Chest X-ray · normal vs cardiomegaly and congestion' }],
  abdomen: [
    { normal: 'aorta-normal-us-axial-haggstrom', abnormal: 'aaa-us-axial-haggstrom', label: 'Aorta ultrasound (axial) · normal vs aneurysm', tags: ['aaa6', 'aaaContained', 'aaaFree'] },
    { normal: 'ct-aorta-normal-coronal-haggstrom', abnormal: 'ct-aaa-intact-66mm-coronal-2025', label: 'CT aorta (coronal) · normal vs aneurysm', tags: ['aaa6', 'aaaContained', 'aaaFree'] },
    { normal: 'ct-aorta-normal-coronal-haggstrom', abnormal: 'ct-dissection-type-b-flap-2026', label: 'CT aorta · normal vs type B dissection', tags: ['dissectB', 'dissectA'] },
    { normal: 'fast-pelvis-negative-pocus-2021', abnormal: 'fast-pelvis-positive-vats', label: 'FAST pelvis · negative vs free fluid', tags: ['spleen4', 'liver3', 'perforation'] },
    ...FAST_HEART.slice(0, 1),
  ],
  lines: [
    { normal: 'ij-compression-gillman-2010', abnormal: 'ij-thrombus-compression-cureus-2025', label: 'Internal jugular · compresses vs thrombus' },
    ...FAST_HEART,
  ],
  // no same-sequence normal brain CT/MRI in the library yet (see the report): the 3D comparison carries neuro
  neuro: [],
};
