/** Exact shipped, attributed comparators; never pretend the model predicts this reference patient's scan. */
export const ATLAS_MEDIA: Record<string, { ids:string[]; context:string }> = {
  ards:{ids:['cxr-ards-2019'],context:'Compare bilateral opacities with the schematic alveolar injury.'},
  pneumonia:{ids:['lus-hepatisation-gillman'],context:'Compare a real consolidation pattern; ultrasound alone does not establish its cause.'},
  'pulmonary-edema':{ids:['cxr-chf-haggstrom'],context:'Compare hydrostatic pulmonary congestion with the model.'},
  atelectasis:{ids:['cxr-collapse-before-after-2021'],context:'Compare lung volume loss and re-expansion in a reference patient.'},
  'simple-pneumothorax':{ids:['ptx-expiratory','lus-lung-point-gillman'],context:'Compare pleural air findings. Imaging does not by itself determine hemodynamic tension.'},
  'tension-pneumothorax':{ids:['ptx-series-bonilla'],context:'Compare lung expansion before and after drainage; this reference does not establish tension in the simulated patient.'},
  tamponade:{ids:['tamponade-ginghina'],context:'Compare right-heart collapse in a real pericardial effusion.'},
  lvo:{ids:['stroke-cta-m1-2025','stroke-ctp-mismatch-2025'],context:'Compare an occluded MCA and perfusion mismatch in reference scans.'},
  'core-penumbra':{ids:['stroke-ctp-mismatch-2025'],context:'Compare core and threatened tissue in a reference perfusion study.'},
  ich:{ids:['ich-deep-locations-2016','ich-ivh-commons'],context:'Compare parenchymal blood and possible ventricular extension.'},
  sah:{ids:['sah-ct-mirza'],context:'Compare blood in subarachnoid spaces.'},
  'cerebral-edema':{ids:['stroke-malignant-edema-2023'],context:'This reference illustrates edema after an infarct; other causes of edema differ.'},
  'rising-icp':{ids:['stroke-mass-effect-2021','ich-thalamic-hydro-yadav'],context:'Compare mass effect and hydrocephalus. A scan is not an ICP measurement.'},
  aaa:{ids:['aaa-us-sagittal-haggstrom','aaa-us-axial-haggstrom'],context:'Compare the aneurysmal abdominal aortic lumen in two views.'},
  'rupturing-aaa':{ids:['aaa-us-sagittal-haggstrom'],context:'This comparator shows aneurysmal anatomy, not proof of rupture. Retroperitoneal blood may be missed by FAST.'},
  'abdominal-hemorrhage':{ids:['fast-ruq-positive'],context:'Compare free fluid in the right upper quadrant; the image alone does not identify its source.'},
};
