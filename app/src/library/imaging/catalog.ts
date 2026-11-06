/**
 * Every vetted X-ray, CT and ultrasound study already shipped in imaging/real,
 * plus license-verified external MRI studies. No guessing pathologies from imagery.
 */
import { loadReal, type RealItem } from '../../scene/imaging/RealExamples';
import { MRI_STUDIES } from './mriCatalog';
import clinicalArchive from '../../../clinical-archive.json';
import { AORTA_CEUS } from './ceusCatalog';

export type ImagingModality = 'xray' | 'ct' | 'mri' | 'ultrasound';
export const MODALITY_LABEL: Record<ImagingModality, string> = {
  xray: 'X-ray', ct: 'CT', mri: 'MRI', ultrasound: 'Ultrasound',
};

const XRAY = new Set(['cxr','xray','peds-xray','ptx','ptxseries']);
const US = new Set(['lus','fast','ivc','ijv','ptxlus','pleuraleff','tamponade','aorta-us']);
export function modalityOf(it: RealItem): ImagingModality | null {
  const type = it.type?.toLowerCase();
  if (type === 'mri' || it.kind === 'mri') return 'mri';
  if (type === 'ct' || it.kind.startsWith('ct-')) return 'ct';
  if (type === 'xray' || XRAY.has(it.kind)) return 'xray';
  if (type === 'ultrasound' || US.has(it.kind)) return 'ultrasound';
  return null; // clinical photographs and miscellaneous procedures are not radiology studies
}
/** Published site mirrors SHA-1 pinned Commons originals; raw Commons URLs remain the fallback. */
const MIRRORED_MRI = new Map(clinicalArchive.map((i) => [i.url, `imaging/curated/${i.name}`]));
export const sourceFor = (file: string) =>
  MIRRORED_MRI.get(file) ??
  (/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(file) ? file : `imaging/real/${file}`);
export const needsMirrorFallback = (file: string) => MIRRORED_MRI.has(file);
export const isRemoteStudy = (it: RealItem) => /^https:\/\//.test(it.file);

let studiesPromise: Promise<RealItem[]> | null = null;
export function loadImagingStudies(): Promise<RealItem[]> {
  return (studiesPromise ??= loadReal().then((items) => {
    const eligible = items.filter((i) => modalityOf(i) !== null);
    if (eligible.length === 0) throw new Error('Local clinical imaging manifest unavailable');
    const all = [...eligible, ...MRI_STUDIES, AORTA_CEUS];
    if (new Set(all.map((i) => i.id)).size !== all.length) throw new Error('Duplicate imaging study identifiers');
    return all;
  }));
}

/** Curated topic-to-image matches: only studies actually relevant to the lesson.
 * The global trainer exposes every study whether or not it has a module mapping.
 */
export const COURSE_STUDIES: Readonly<Record<string, readonly string[]>> = {
  'vent-foundations': ['cxr-normal-pa-haggstrom','cxr-ett-ok-ebi-2019','3fd337c1','alines'],
  'vent-pressure': ['cxr-hyperinflation-asthma-2025','cxr-collapse-before-after-2021','cxr-mainstem-right-ebi-2019','lus-lung-pulse-mmode-cureus-2025'],
  'vent-ards': ['cxr-ards-2019','cxr-ards-ecmo-recovery-2026','whitelung','lus-progression-h7n9'],
  'vent-ptx': ['cxr-tension-ptx-right-olv-2024','ptx-expiratory','lus-lung-point-gillman','ptx-series-bonilla','cxr-pigtail-drain-reexpanded-2026'],
  'vent-desat': ['cxr-mainstem-right-ebi-2019','cxr-left-whiteout-mucus-plug-2026','cxr-left-collapse-child-2013','lus-hepatisation-gillman'],
  'gas-basics': ['alines','blines','cxr-normal-pa-haggstrom','cxr-ards-2019'],
  'lines-cvp': ['ivc-2026-video-s1','ivc-collapse-gillman','tamponade-ginghina'],
  'lines-shock': ['ivc-collapse-gillman','fast-ruq-positive','tamponade-ginghina','cxr-chf-haggstrom'],
  'lines-bleed': ['fast-ruq-positive','ct-splenic-laceration-hemoperitoneum-2025'],
  'lines-devices': ['ijv-2026-video-s2','ij-needle-inplane-2025','ij-thrombus-compression-cureus-2025'],
  'neuro-stroke': ['stroke-hmcas-2025','stroke-cta-m1-2025','stroke-ctp-mismatch-2025','mri-dwi-adc-stroke'],
  'neuro-icp': ['ich-thalamic-hydro-yadav','ich-ivh-commons','ich-cerebellar-yadav','mri-t2star-microbleed','mri-normal-t1-anatomy'],
  'abd-fast': ['fast-ruq-positive','fast-luq-positive-scandj-2023','fast-pelvis-positive-vats','fast-pelvis-negative-pocus-2021','ct-splenic-laceration-hemoperitoneum-2025'],
  'abd-aorta': ['aaa-us-sagittal-haggstrom','aaa-us-axial-haggstrom','ct-aaa-rupture-96mm-2026','ct-dissection-type-a-arch-flap-2025'],
  'abd-gut': ['ct-sma-embolism-coronal-2023','ct-sbo-coronal-feces-sign-2026','ct-pneumoperitoneum-large-2026','ct-gastric-pneumatosis-portal-gas-2026'],
  'peds-sick-child': ['peds-croup-steeple-2019','peds-epiglottitis-thumb-2026','peds-bronchiolitis-hyperinflation-commons'],
  'peds-newborn': ['peds-irds-preterm-haggstrom','peds-pneumonia-bocavirus-commons'],
};
export function studiesForCourse(items: readonly RealItem[], moduleId: string): RealItem[] {
  const ids = COURSE_STUDIES[moduleId] ?? [];
  const map = new Map(items.map((i) => [i.id, i]));
  return ids.map((id) => map.get(id)).filter((i): i is RealItem => Boolean(i));
}
