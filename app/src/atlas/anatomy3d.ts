/** Which reference body, organs and congenital-heart preset show each atlas condition in 3D (pure, testable). */
import type { DiseaseDefinition } from './types';
import type { BodySex } from '../asset/body';
import type { HeartPresetId } from '../heart/shunt';

export const MALE_ORGANS = ['brain', 'airway', 'lung_L', 'lung_R', 'heart', 'aorta', 'vena_cava', 'liver', 'spleen', 'kidney_L', 'kidney_R', 'bladder'] as const;
export const FEMALE_ORGANS = [...MALE_ORGANS, 'uterus', 'ovary_L', 'ovary_R', 'tube_L', 'tube_R', 'placenta', 'amnion', 'cord'] as const;
export type OrganId = (typeof FEMALE_ORGANS)[number];

export const ORGAN_COLOR: Record<OrganId, string> = {
  brain: '#ad8c9a', airway: '#c9b2a4', lung_L: '#bb8790', lung_R: '#bb8790', heart: '#96535b', aorta: '#b6595f', vena_cava: '#5d739b',
  liver: '#763e35', spleen: '#7b3f4a', kidney_L: '#986f6b', kidney_R: '#986f6b', bladder: '#c4a37f',
  uterus: '#b9707a', ovary_L: '#d0a08f', ovary_R: '#d0a08f', tube_L: '#c88a8a', tube_R: '#c88a8a', placenta: '#7e2f3e', amnion: '#b7c9d6', cord: '#9fb2c4',
};

export const bodySexFor = (d: DiseaseDefinition): BodySex => (d.population === 'female' || d.population === 'maternal' ? 'female' : 'male');
export const isPregnant = (d: DiseaseDefinition) => d.population === 'maternal' && !['postpartum', 'atony'].includes(d.variant);
/** Children are shown on the adult reference body; the scene says so. */
export const usesAdultReference = (d: DiseaseDefinition) => d.population === 'child' || d.population === 'neonate';

/** The real 3D congenital heart (Cardiac module) for the pediatric heart conditions. */
export const HEART_PRESET_FOR: Partial<Record<string, HeartPresetId>> = {
  'congenital-heart': 'vsdLarge', 'left-right-shunt': 'asd', 'right-left-shunt': 'tof', 'transitional-circulation': 'newborn', 'duct-dependent-circulation': 'coarctNeoDuct',
};

/** Organs that carry the condition (highlighted; everything else is ghosted). */
export function affectedOrgans(d: DiseaseDefinition): OrganId[] {
  switch (d.anatomy) {
    case 'airway': return d.variant === 'bronchioles' || d.variant === 'bronchospasm' || d.variant === 'aspiration' ? ['airway', 'lung_L', 'lung_R'] : ['airway'];
    case 'alveoli': case 'pleura': return ['lung_L', 'lung_R'];
    case 'pulmonary-vessels': return ['lung_L', 'lung_R', 'heart'];
    case 'heart': return ['heart'];
    case 'aorta': return ['aorta'];
    case 'brain': return ['brain'];
    case 'ovaries': return d.variant === 'torsion' ? ['ovary_R', 'tube_R'] : ['ovary_L', 'ovary_R'];
    case 'uterus': return d.variant === 'tubal' ? ['tube_R', 'ovary_R', 'uterus'] : d.variant === 'lesions' ? ['uterus', 'ovary_L', 'ovary_R', 'tube_L', 'tube_R'] : ['uterus'];
    case 'placenta': return d.variant === 'endothelium' ? ['placenta', 'kidney_L', 'kidney_R', 'liver', 'brain'] : ['placenta', 'amnion', 'cord', 'uterus'];
    case 'chemistry':
      if (d.variant === 'hellp') return ['liver'];
      if (d.variant === 'opioid') return ['brain', 'lung_L', 'lung_R'];
      if (d.variant === 'potassium' || d.variant === 'adrenergic') return ['heart', 'kidney_L', 'kidney_R'];
      return ['kidney_L', 'kidney_R', 'liver', 'brain'];
    case 'circulation':
      if (d.variant === 'abdominal-blood') return ['liver', 'spleen', 'aorta', 'vena_cava'];
      if (d.variant === 'pelvic-blood' || d.variant === 'maternal-blood') return ['aorta', 'vena_cava', 'bladder', ...(d.population === 'maternal' ? ['uterus' as const] : [])];
      if (d.variant === 'obstructive') return ['heart', 'lung_L', 'lung_R', 'vena_cava'];
      if (d.variant === 'anaphylaxis') return ['airway', 'heart', 'aorta'];
      if (d.variant === 'maternal') return ['heart', 'aorta', 'vena_cava', 'kidney_L', 'kidney_R', 'uterus'];
      return ['heart', 'aorta', 'vena_cava', 'kidney_L', 'kidney_R'];
  }
  return ['heart'];
}
