/**
 * Added anatomy layers, all in the Visible Human Male body frame shared with body.glb and lines.glb
 * (decimetres, centred on the VHM skin; +X patient left, +Y up, +Z anterior):
 *
 *  - skeleton.glb       pipeline/build-skeleton.ts        — 86 bones (BodyParts3D fitted onto VHM + HuBMAP pelvis/legs)
 *  - pericardium.glb    pipeline/build-pericardium.ts     — sac grown from the real heart; `aEff` = effusion freedom 0–1
 *  - neuro.glb          pipeline/build-neuro.ts           — ventricles, basal ganglia, thalamus, limbic, brainstem, cerebellum
 *  - heart-internals.glb pipeline/build-heart-internals.ts — papillary muscles, chordae, conduction system; `aAct` = ms
 *  - upper-airway.glb   pipeline/build-upper-airway.ts    — laryngeal cartilages, epiglottis, trachea (HuBMAP); folds,
 *                       cricothyroid membrane, pharynx, tongue, soft palate (landmark-positioned, schematic)
 *
 * The female reference body (body-f.glb) has its own frame, so these layers are male-body only.
 */
import type * as THREE from 'three';
import { loadMeshes } from './gltf';

export interface Attribution { title: string; creators: string; license: string; licenseUrl: string; sourceUrl: string; changes: string; data?: string; notice?: string }
export interface SkeletonMapping { centres: Record<string, [number, number, number]>; labels: Record<string, string>; attribution: Attribution[]; license: string }
export interface PericardiumMapping {
  sac: { centre: [number, number, number]; areaDm2: number; effAreaDm2: number; enclosedMl: number };
  subxiphoid: { skinEntry: [number, number, number]; direction: [number, number, number]; sacContact: [number, number, number] | null; depthDm: number | null };
  attribution: Attribution;
}
export interface NeuroMapping { centres: Record<string, [number, number, number]>; labels: Record<string, string>; volumesMl: Record<string, number>; derived: Record<string, string>; attribution: Attribution }
export interface HeartInternalsMapping {
  parts: Record<string, { label: string; centre: [number, number, number]; t0?: number; t1?: number; tMax?: number }>;
  activation: { saToAv: number; avNodalDelay: number; hisStart: number; lastVentricularActivation: number };
  schematic: string; attribution: Attribution;
}
export interface UpperAirwayMapping { centres: Record<string, [number, number, number]>; labels: Record<string, string>; landmarks: { cricothyroidMembrane: { centre: [number, number, number]; heightMm: number; skinDepthMm: number | null }; glottisLengthMm: number; anteriorCommissure: [number, number, number]; epiglottisTip: [number, number, number] }; schematic: string; attribution: Attribution }
export interface Layer<M> { meshes: Record<string, THREE.Mesh>; mapping: M }

declare global {
  interface Window {
    __SKELETON_GLB__?: string; __SKELETON_MAP__?: SkeletonMapping; __PERICARDIUM_GLB__?: string; __PERICARDIUM_MAP__?: PericardiumMapping;
    __NEURO_GLB__?: string; __NEURO_MAP__?: NeuroMapping; __HEARTINT_GLB__?: string; __HEARTINT_MAP__?: HeartInternalsMapping;
    __UPPERAIRWAY_GLB__?: string; __UPPERAIRWAY_MAP__?: UpperAirwayMapping;
  }
}

function layer<M>(name: string, glb: () => string | undefined, map: () => M | undefined, attrs: string[] = []) {
  let cache: Promise<Layer<M>> | null = null;
  return () => {
    if (cache) return cache;
    cache = (async () => {
      const mapping = map() ?? ((await (await fetch(`models/${name}.mapping.json`)).json()) as M);
      const meshes = await loadMeshes(glb(), `models/${name}.glb`, attrs);
      if (!Object.keys(meshes).length) throw new Error(`${name} asset is empty`);
      return { meshes, mapping };
    })();
    cache.catch(() => { cache = null; });
    return cache;
  };
}
export const loadSkeleton = layer<SkeletonMapping>('skeleton', () => window.__SKELETON_GLB__, () => window.__SKELETON_MAP__);
export const loadPericardium = layer<PericardiumMapping>('pericardium', () => window.__PERICARDIUM_GLB__, () => window.__PERICARDIUM_MAP__, ['aEff']);
export const loadNeuroDeep = layer<NeuroMapping>('neuro', () => window.__NEURO_GLB__, () => window.__NEURO_MAP__);
export const loadHeartInternals = layer<HeartInternalsMapping>('heart-internals', () => window.__HEARTINT_GLB__, () => window.__HEARTINT_MAP__, ['aAct']);
export interface HeartHDMapping { parts: { id: string; triangles: number }[]; relief: string; attribution: Attribution }
declare global { interface Window { __HEARTHD_GLB__?: string; __HEARTHD_MAP__?: HeartHDMapping } }
/** full-resolution chambers with sculpted endocardial relief (pipeline/build-heart-hd.ts); same ids as lines.glb (lv, rv, ra, la) */
export const loadHeartHD = layer<HeartHDMapping>('heart-hd', () => window.__HEARTHD_GLB__, () => window.__HEARTHD_MAP__);
export const loadUpperAirway = layer<UpperAirwayMapping>('upper-airway', () => window.__UPPERAIRWAY_GLB__, () => window.__UPPERAIRWAY_MAP__);
export const LARYNX = ['thyroid_cartilage', 'cricoid_cartilage', 'arytenoid_R', 'arytenoid_L', 'corniculate_R', 'corniculate_L', 'epiglottis', 'vocal_fold_R', 'vocal_fold_L', 'vestibular_fold_R', 'vestibular_fold_L', 'cricothyroid_membrane'];
export const UPPER_SOFT = ['pharynx', 'tongue', 'soft_palate'];

/** Effusion volume (mL) → outward sac displacement (dm) along the normal at full `aEff`: the extra volume spread over ∫EFF·dA. */
export const effusionThickness = (m: PericardiumMapping, ml: number) => Math.max(0, ml) / 1000 / m.sac.effAreaDm2;

/** Bone groups used by lessons (ids in skeleton.glb). */
export const RIBS = (side: 'L' | 'R') => Array.from({ length: 12 }, (_, i) => `rib_${side}${i + 1}`);
export const SPINE = [...Array.from({ length: 7 }, (_, i) => `C${i + 1}`), ...Array.from({ length: 12 }, (_, i) => `T${i + 1}`), ...Array.from({ length: 5 }, (_, i) => `L${i + 1}`)];
export const CONDUCTION = ['sa_node', 'av_node', 'his', 'rbb', 'lbb', 'lbb_anterior', 'lbb_posterior', 'lbb_septal', 'purkinje_lv', 'purkinje_rv'];
export const VALVE_APPARATUS = ['pap_lv_anterolateral', 'pap_lv_posteromedial', 'pap_rv_anterior', 'pap_rv_posterior', 'pap_rv_septal', 'chordae_mitral', 'chordae_tricuspid'];
export const VENTRICLES = ['lat_ventricle_L', 'lat_ventricle_R', 'third_ventricle', 'aqueduct', 'fourth_ventricle'];
export const DEEP_NUCLEI = ['caudate_L', 'caudate_R', 'putamen_L', 'putamen_R', 'pallidus_L', 'pallidus_R', 'thalamus_L', 'thalamus_R', 'internal_capsule_L', 'internal_capsule_R'];
export const BRAINSTEM = ['midbrain', 'pons', 'medulla'];
