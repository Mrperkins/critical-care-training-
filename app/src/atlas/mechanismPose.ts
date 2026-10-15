import type { DiseaseState } from './types';
/** Exaggerated, qualitative chamber comparisons; not volumes, pressures or an echocardiographic model. */
export function chamberScale(id:string, diseaseId:string, s:DiseaseState) {
  if (diseaseId === 'tamponade') return 1 - (id === 'ra' || id === 'rv' ? .14 : .06) * s.pressure;
  if (diseaseId === 'pulmonary-embolism') return id === 'rv' || id === 'ra' ? 1 + .18 * s.pressure : 1 - .1 * s.flowLoss;
  if (diseaseId === 'pulmonary-edema') return id === 'lv' || id === 'la' ? 1 + .1 * s.pressure : 1;
  return 1 - .09 * Math.max(s.flowLoss,s.volumeLoss);
}
