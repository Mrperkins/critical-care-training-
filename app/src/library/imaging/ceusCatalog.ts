/** Clinical CEUS reference beyond routine aorta POCUS.
 * Licensed video from Scientific Reports (2016) via Wikimedia Commons.
 * The published Commons 360p H.264 transcode is externally streamed, not offline.
 */
import type { RealItem } from '../../scene/imaging/RealExamples';
export const AORTA_CEUS: RealItem = {
  id:'aorta-ceus-thrombus-2016',kind:'aorta-us',type:'ultrasound',modality:'Ultrasound',
  file:"https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2c/Evaluation-of-the-thrombus-of-abdominal-aortic-aneurysms-using-contrast-enhanced-ultrasound--srep34152-s1.ogv/Evaluation-of-the-thrombus-of-abdominal-aortic-aneurysms-using-contrast-enhanced-ultrasound--srep34152-s1.ogv.360p.mp4",title:'Contrast-enhanced AAA ultrasound: mural thrombus',
  caption:'Contrast-enhanced ultrasound study of an abdominal aortic aneurysm and mural thrombus; this is specialist CEUS, not standard grayscale POCUS screening.',
  look:['Recognize the AAA vascular lumen and the thrombus region','Observe enhancement in the original published cine','Distinguish contrast-specific signal from routine B-mode anatomy'],
  teach:['In the 17-patient preliminary study, mural thrombus enhancement was described in 12 cases.','The authors did not establish that CEUS enhancement reliably predicts aneurysm rupture.','Standard emergency bedside AAA assessment uses grayscale imaging and outer-wall diameter; do not use this cine to teach routine probe placement.'],
  quiz:{q:'What is the appropriate conclusion from this supplementary contrast-enhanced AAA video?',
    options:['CEUS can demonstrate mural thrombus enhancement; rupture prediction remains uncertain','A bright CEUS signal proves acute rupture','The clip is a normal routine grayscale abdominal aorta','The study establishes a new bedside screening rule'],
    answer:0,explain:'Łukasiewicz et al. described mural thrombus enhancement in a small exploratory CEUS cohort, not a validated predictor of aneurysm rupture.'},
  license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',
  author:'Adam Łukasiewicz, Adam Garkowski, Katarzyna Rutka, Jacek Janica and Urszula Łebkowska',
  source:'Łukasiewicz et al., Scientific Reports 6:34152 (2016), supplementary video S1. DOI 10.1038/srep34152.',
  changes:'Wikimedia Commons online MP4 transcode of original OGV. Clip not modified by this app; transcoded stream requires network access.',
  credit:'Łukasiewicz et al. (2016) · CC BY 4.0',
  provenance:{pageUrl:"https://commons.wikimedia.org/wiki/File:Evaluation-of-the-thrombus-of-abdominal-aortic-aneurysms-using-contrast-enhanced-ultrasound--srep34152-s1.ogv",originalUrl:"https://upload.wikimedia.org/wikipedia/commons/2/2c/Evaluation-of-the-thrombus-of-abdominal-aortic-aneurysms-using-contrast-enhanced-ultrasound--srep34152-s1.ogv",doi:'10.1038/srep34152',retrieved:'2026-11-06'}
};
