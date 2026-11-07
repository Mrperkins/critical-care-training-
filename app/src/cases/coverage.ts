import { DISEASES } from '../atlas/registry';
import { FPC_LESSONS } from '../fpc/index';
import { casesForDisease, casesForLesson, CONFERENCES } from './catalog';
import type { CasePopulation, ExamTrack } from './types';

export const BLUEPRINT_SOURCES = [
  { title: 'IBSC · FP-C content outline', url: 'https://www.ibscertifications.org/resource/pdf/FP-C%20EXAM%20OUTLINE.pdf' },
  { title: 'IBSC · CCP-C content outline', url: 'https://www.ibscertifications.org/resource/pdf/CCP-C%20EXAM%20OUTLINE.pdf' },
  { title: 'AACN · Adult CCRN test plan (effective November 12, 2025)', url: 'https://www.aacn.org/~/media/aacn-website/certification/get-certified/ccrn-adult-test-plan.pdf' },
  { title: 'AACN · Pediatric CCRN test plan (effective November 12, 2025)', url: 'https://www.aacn.org/~/media/aacn-website/certification/get-certified/ccrn-ped-test-plan.pdf' },
  { title: 'AACN · Neonatal CCRN test plan (effective November 12, 2025)', url: 'https://www.aacn.org/~/media/aacn-website/certification/get-certified/ccrn-neo-test-plan.pdf' },
];
export const ATLAS_COVERAGE = DISEASES.map(d => {
  const population: CasePopulation = d.population === 'child' ? 'Pediatric' : d.population === 'neonate' ? 'Neonatal' : d.population === 'maternal' || d.population === 'female' ? 'Obstetric' : 'Adult';
  return {id:d.id,title:d.title,population,count:casesForDisease(d.id).length,target:population==='Adult'?3:5};
});
export const LESSON_COVERAGE = FPC_LESSONS.map(l=>({id:l.id,title:l.title,domain:l.domain,count:casesForLesson(l.id).length}));

/** Editorial expansion list, not an exhaustive copy of a certification blueprint or an endorsement. */
export const EXAM_EXPANSION: {population:CasePopulation; exam:ExamTrack; topics:string[]}[] = [
  {population:'Adult',exam:'CCRN Adult',topics:['Endocarditis and myocarditis','Valve emergencies and structural defects','Cardiac surgery and vascular intervention complications','Pulmonary hypertension','Pleural effusion and empyema','Pulmonary hemorrhage','Adrenal crisis','Thyroid storm and myxedema','HHS','Diabetes insipidus and SIADH','DIC, HIT and immune thrombocytopenia','Transfusion lung injury and circulatory overload','Neutropenic sepsis and tumor lysis','Mesenteric ischemia, obstruction and perforation','Hepatic failure and variceal bleeding','Pancreatitis and abdominal compartment syndrome','AKI and dialysis complications','Necrotizing soft tissue infection and skin failure','Compartment syndrome and fractures','Spinal cord and neurogenic shock','Meningitis and encephalitis','Hydrocephalus, neurosurgery and brain death','Neuromuscular respiratory failure','Delirium, withdrawal and behavioral emergencies','Post-arrest care and anoxic injury','Transplant complications and multiorgan failure','Nutrition, refeeding and metabolic derangements']},
  {population:'Pediatric',exam:'CCRN Pediatric',topics:['Myocarditis and cardiomyopathy','Congenital heart lesions and postoperative complications','Pediatric arrhythmias and pulmonary hypertension','Airway malformations and airway trauma','Pediatric ARDS and pneumonia','Adrenal and metabolic crises','Pediatric oncology and hematology emergencies','Pediatric renal and hepatic failure','GI surgical emergencies and ingestion','Nonaccidental injury and pediatric burns','Pediatric stroke, hydrocephalus and CNS infection','Technology-dependent child emergencies','Transplant complications and complex chronic illness','Adolescent behavioral and toxicological emergencies']},
  {population:'Neonatal',exam:'CCRN Neonatal',topics:['Delivery-room transition and resuscitation','Persistent pulmonary hypertension','Meconium aspiration and neonatal air leak','Apnea and bronchopulmonary dysplasia','Neonatal sepsis, meningitis and HSV','Hypoxic ischemic injury, seizures and intraventricular hemorrhage','Hypoglycemia and inborn metabolic disorders','Necrotizing enterocolitis and abdominal wall defects','Neonatal anemia, jaundice and coagulation disorders','Renal injury, fluids, nutrition and thermal instability','Specific congenital lesions and postoperative care']},
  {population:'Obstetric',exam:'FP-C',topics:['Previa and placenta accreta spectrum','Cord prolapse and shoulder dystocia','PPROM, preterm labor and multiple birth','Maternal sepsis and chorioamnionitis','Amniotic fluid embolism','Maternal cardiac arrest and resuscitative delivery','Ectopic pregnancy and acute gynecological bleeding','Pregnancy-associated embolism, stroke and aortic disease']},
];
export const COVERAGE_NOTICE = 'This is an editorial coverage tracker. Linked drafts and exam tags do not establish complete blueprint coverage, clinical approval, CE credit or exam endorsement. Safety, flight physiology, professional practice and nursing ethics also require dedicated teaching.';
export const reviewedCaseCount = CONFERENCES.filter(c=>String(c.reviewStatus)!=='Clinical review pending').length;
