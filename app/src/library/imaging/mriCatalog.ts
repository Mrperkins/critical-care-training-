/**
 * Curated real MRI references with source and CC BY 4.0 verified on their original
 * Wikimedia Commons file pages, 2026-11-05. These images are externally hosted
 * until the published build has mirrored and SHA-1 checked the originals.
 * The raw Commons link remains a fallback for builds without the image archive.
 */
import type { RealItem } from '../../scene/imaging/RealExamples';

const LICENSE = 'https://creativecommons.org/licenses/by/4.0/';
const mri = (
  id: string, file: string, title: string, caption: string,
  quiz: NonNullable<RealItem['quiz']>, look: string[], teach: string[],
  author: string, pageUrl: string, source: string
): RealItem => ({
  id, kind: 'mri', type: 'mri', modality: 'MRI', file,
  title, caption, quiz, look, teach,
  license: 'CC BY 4.0', licenseUrl: LICENSE, author,
  source, changes: 'SHA-1 verified original mirrored in published site and optional offline pack. Original Wikimedia Commons link requires network connection as a fallback.',
  credit: `${author} · CC BY 4.0`,
  provenance: { pageUrl, originalUrl: file, retrieved: '2026-11-05' },
});

export const MRI_STUDIES: RealItem[] = [
  mri(
    'mri-dwi-adc-stroke',
    'https://upload.wikimedia.org/wikipedia/commons/7/7e/DWE_MRI_of_cerebral_infarction.png',
    'Diffusion restriction in cerebral infarction',
    'Axial diffusion-weighted image and corresponding ADC map showing a right hemispheric lesion, bright on DWI and dark on ADC.',
    { q: 'Which paired signal finding supports genuine diffusion restriction?', options: ['DWI bright and ADC dark', 'DWI bright and ADC bright', 'DWI dark and ADC bright', 'Normal DWI and ADC'], answer: 0,
      explain: 'An acute or recent infarct often appears bright on DWI with reduced ADC. DWI brightness alone may represent T2 shine-through; the ADC map is essential.' },
    ['Identify the DWI image (left) and ADC image (right)', 'Find the focal high DWI signal', 'Verify that the corresponding ADC signal is low'],
    ['DWI/ADC restriction is not unique to stroke; correlate with vascular anatomy and clinical onset.', 'MRI diffusion findings complement but do not replace emergency stroke pathways.'],
    'Shazia Mirza and Sankalp Gokhale',
    'https://commons.wikimedia.org/wiki/File:DWE_MRI_of_cerebral_infarction.png',
    'Neuroimaging in Acute Stroke (2016), via Wikimedia Commons'
  ),
  mri(
    'mri-t2star-microbleed',
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Effective_T2-weighted_MRI_of_the_brain_with_a_small_hemorrhages.jpg',
    'T2* susceptibility and small cerebral hemorrhage',
    'Gradient-echo T2*-weighted axial MRI with a small dark susceptibility focus indicated by the image arrow.',
    { q: 'How does blood-related susceptibility commonly appear on T2*-weighted GRE?', options: ['A focal dark signal with blooming', 'A bright CSF signal only', 'Uniform high signal in all white matter', 'No detectable effect'], answer: 0,
      explain: 'Blood products can cause signal loss/blooming on T2* GRE; other susceptibility sources and artifacts can mimic this appearance.' },
    ['Look at the arrow-marked dark focus', 'Consider its size compared with the surrounding brain', 'Remember that susceptibility alone is not a full hemorrhage diagnosis'],
    ['SWI/T2* are sensitive to blood products, calcification and artifacts; compare other MRI sequences and CT when indicated.', 'An image alone cannot establish when the blood products formed.'],
    'Meng Yue Tang, Tian Wu Chen, Xiao Ming Zhang and Xiao Hua Huang',
    'https://commons.wikimedia.org/wiki/File:Effective_T2-weighted_MRI_of_the_brain_with_a_small_hemorrhages.jpg',
    'Tang et al., GRE T2*-weighted MRI: Principles and Clinical Applications, BioMed Research International (2014)'
  ),
  mri(
    'mri-ms-psir',
    'https://upload.wikimedia.org/wikipedia/commons/4/47/Axial_PSIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg',
    'Multiple sclerosis: PSIR cortical lesions',
    'Axial phase-sensitive inversion recovery MRI with arrows and arrowheads marking cortical and juxtacortical lesions.',
    { q: 'What does PSIR add in this example compared with DIR?', options: ['Additional cortical and juxtacortical lesion conspicuity', 'A measurement of intracranial pressure', 'An angiographic map of arterial occlusion', 'A direct measure of cerebral blood flow'], answer: 0,
      explain: 'The source study describes additional lesions visible on PSIR beyond those seen on the comparator DIR images.' },
    ['Locate arrowheads marking lesions found with both sequences', 'Inspect the additional white-arrow lesions', 'Separate imaging appearance from a standalone MS diagnosis'],
    ['MRI lesion distribution and clinical history determine whether demyelination is plausible.', 'This annotated image is a teaching comparison, not the entire diagnostic study.'],
    'Alice Favaretto et al.',
    'https://commons.wikimedia.org/wiki/File:Axial_PSIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg',
    'Favaretto et al., PLOS ONE (2015), DOI 10.1371/journal.pone.0127805'
  ),
  mri(
    'mri-ms-dir',
    'https://upload.wikimedia.org/wikipedia/commons/c/ce/Axial_DIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg',
    'Multiple sclerosis: DIR cortical lesions',
    'Axial double inversion recovery MRI showing annotated cortical and juxtacortical lesions.',
    { q: 'Which type of lesion is highlighted in this DIR reference?', options: ['Cortical and juxtacortical lesions', 'Pleural plaques', 'Abdominal aortic aneurysm', 'Pulmonary embolism'], answer: 0,
      explain: 'DIR suppresses fluid and white-matter signal to improve conspicuity of selected cortical lesions, though the paired PSIR example shows additional lesions.' },
    ['Examine the image’s white circles and arrows', 'Identify lesions near the cortex and gray-white interface', 'Compare with the corresponding PSIR reference'],
    ['Interpret sequences together; DIR appearance alone does not establish multiple sclerosis.', 'PSIR and DIR have different lesion detection performance.'],
    'Alice Favaretto et al.',
    'https://commons.wikimedia.org/wiki/File:Axial_DIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg',
    'Favaretto et al., PLOS ONE (2015), DOI 10.1371/journal.pone.0127805'
  ),
  mri(
    'mri-epidural-abscess',
    'https://upload.wikimedia.org/wikipedia/commons/b/bf/MRI_of_the_lumbar_spine_with_abscess_in_the_posterior_epidural_space%2C_causing_cauda_equina_syndrome.jpg',
    'Lumbar epidural abscess with cauda equina compression',
    'Sagittal lumbar MRI showing a posterior epidural collection and narrowing of the thecal sac, especially in the lower lumbar spine.',
    { q: 'Which finding is most concerning in this image?', options: ['Posterior epidural collection compressing the thecal sac', 'A normal cauda equina', 'An isolated renal cyst', 'A pleural effusion'], answer: 0,
      explain: 'A compressive epidural collection can cause cauda equina syndrome and requires immediate clinical assessment and urgent specialist involvement.' },
    ['Trace the CSF-filled thecal sac inferiorly', 'Find the posterior epidural space narrowing the canal', 'Inspect the lower lumbar levels for compression'],
    ['Suspected spinal epidural abscess with neurologic deficit is a time-critical condition.', 'MRI interpretation requires the entire sequence set and clinical examination.'],
    'Jing Jing Chan and Jen Jen Oh',
    'https://commons.wikimedia.org/wiki/File:MRI_of_the_lumbar_spine_with_abscess_in_the_posterior_epidural_space,_causing_cauda_equina_syndrome.jpg',
    'Chan and Oh, International Journal of Emergency Medicine (2016), DOI 10.1186/s12245-016-0116-5'
  ),
  mri(
    'mri-peds-midline-glioma',
    'https://upload.wikimedia.org/wikipedia/commons/7/73/Diffuse_midline_glioma_MRI_%28cropped%29.jpg',
    'Pediatric diffuse midline glioma: brainstem MRI',
    'Sagittal pediatric MRI showing an expansile brainstem lesion. The original figure describes a diffuse midline glioma.',
    { q: 'What anatomical region appears expanded by the lesion?', options: ['The brainstem/pons', 'The liver', 'The lateral ventricles alone', 'The orbit only'], answer: 0,
      explain: 'The study depicts an infiltrative, expansile lesion in the brainstem. Imaging appearance must be interpreted with clinical context and specialist review.' },
    ['Find the enlarged pontine region anterior to the fourth ventricle', 'Notice the distortion of normal brainstem contour', 'Distinguish the lesion from the cerebellum posteriorly'],
    ['This reference illustrates an existing reported case, not a synthetic training patient.', 'MRI alone does not establish tumor molecular subtype.'],
    'T. Huang et al.',
    'https://commons.wikimedia.org/wiki/File:Diffuse_midline_glioma_MRI_(cropped).jpg',
    'Huang et al., Oncotarget (2018), DOI 10.18632/oncotarget.26430; cropped derivative on Commons'
  ),
  mri(
    'mri-normal-t1-anatomy',
    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Brain_regions_on_T1_MRI.png',
    'Normal T1 MRI: brain regions',
    'Annotated axial T1 MR images of a healthy brain; color overlays identify lobes, brainstem and cerebellum.',
    { q: 'Which structure lies posterior to the brainstem in the lowest axial section?', options: ['Cerebellum', 'Liver', 'Carotid sinus', 'Thyroid'], answer: 0,
      explain: 'The cerebellum sits in the posterior fossa behind the brainstem and is highlighted in the image’s key.' },
    ['Identify the brainstem and cerebellum in the inferior slices', 'Use the original annotation key to locate lobes', 'Recognize that these are color overlays on a real MRI study'],
    ['The colored regions are educational annotations, not intrinsic MRI signals.', 'Know the imaging plane and sequence before interpreting pathology.'],
    'Hongwei Zhao, Jin Wang, Zhonglie Lu, Qingjie Wu, Haijuan Lv, Hu Liu and Xiangyang Gong',
    'https://commons.wikimedia.org/wiki/File:Brain_regions_on_T1_MRI.png',
    'Zhao et al., PLOS ONE (2015), DOI 10.1371/journal.pone.0116632'
  ),
];
export const MRI_EXTERNAL_COUNT = MRI_STUDIES.length;
