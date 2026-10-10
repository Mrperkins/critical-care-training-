/**
 * Medical content models. Everything clinical lives in /src/data and is
 * consumed by the renderer and UI — never hard-coded in components.
 *
 * Coordinate frame (body frame, used by both the ECG model and 3D scene):
 *   +X = patient's left, +Y = superior (head), +Z = anterior (chest wall)
 */
export type Vec3 = [number, number, number];

export type LeadId =
  | 'I' | 'II' | 'III' | 'aVR' | 'aVL' | 'aVF'
  | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6'
  | 'V7' | 'V8' | 'V9' | 'V3R' | 'V4R';

export type LeadGroup = 'limb' | 'precordial' | 'posterior' | 'right';

export interface ECGLead {
  id: LeadId;
  label: string;
  group: LeadGroup;
  /** Unit vector from the heart toward the positive pole — the direction the lead "looks from". */
  view: Vec3;
  /** Relative amplitude gain (precordial electrodes sit closer to the heart). */
  gain: number;
  /** Plain-language description of the surface this lead faces. */
  faces: string;
  /** Approximate electrode position on the torso model (body frame, heart-centered units). */
  electrode: Vec3;
}

/** Myocardial regions the renderer knows how to paint. */
export type RegionId =
  | 'septum' | 'anterior' | 'apex' | 'lateral' | 'highLateral'
  | 'inferior' | 'posterior' | 'rvFreeWall';

export type VesselId =
  | 'LM' | 'LAD' | 'D1' | 'D2' | 'S1' | 'S2' | 'S3'
  | 'LCx' | 'OM1' | 'OM2'
  | 'RCA' | 'AM' | 'PDA' | 'PLB';

export type Dominance = 'right' | 'left';

export interface CoronaryVessel {
  id: VesselId;
  name: string;
  short: string;
  parent?: VesselId;
  /** Which dominance patterns this vessel exists in (PDA/PLB change parent with dominance). */
  course: string;
  supplies: RegionId[];
  /** Relative lumen radius (LM = 1). */
  caliber: number;
  /** Where along the parent vessel (0..1) this branch originates. */
  originAt?: number;
  /** Origin on the parent when the parent differs in left-dominant anatomy. */
  originAtLeft?: number;
}

/**
 * The injury ("current of injury") and necrosis vectors are the physiology
 * that generates the ECG. Directions are outward normals of the injured
 * myocardium in body frame. Leads facing the vector show ST elevation;
 * leads facing away show reciprocal depression.
 */
export interface ECGPattern {
  id: string;
  /** Direction + magnitude (mV at lead gain 1) of the ST injury vector. */
  injury: Vec3;
  injuryMv: number;
  /** Loss of early QRS forces toward the infarct (produces Q waves / tall R in opposite leads). */
  necrosisMv: number;
  /** Extra T-wave force toward the region in the hyperacute phase. */
  hyperacuteMv: number;
  /** Optional second injury vector (e.g. inferior + RV). */
  injury2?: Vec3;
  injury2Mv?: number;
}

export interface CameraPose {
  /** Direction from the heart centre toward the camera (body frame). */
  dir: Vec3;
  distance: number;
}

export interface CulpritOption {
  vessel: VesselId;
  /** Where along the vessel (0 origin → 1 end) the occlusion forms. */
  at: number;
  likelihood: 'common' | 'possible';
  dominance?: Dominance;
  note: string;
}

export interface CoronaryTerritory {
  id: string;
  name: string;
  short: string;
  affectedLeads: LeadId[];
  reciprocalLeads: LeadId[];
  /** Additional leads that should be obtained. */
  extraLeads: LeadId[];
  commonCulpritVessels: CulpritOption[];
  myocardialRegion: RegionId[];
  cameraPosition: CameraPose;
  /** Region weights used by the shader (0..1). */
  heartHighlightRegion: Partial<Record<RegionId, number>>;
  ecgPattern: ECGPattern;
  explanation: string;
  clinicalPearls: string[];
  /** Whether a septal cutaway helps show this territory. */
  cutaway?: boolean;
}

export interface LessonStep {
  id: string;
  title: string;
  text: string;
  /** Scene directives for this step. */
  show: {
    highlightVessel?: boolean;
    flow?: boolean;
    occlusion?: number;      // 0..1 progression
    perfusionLoss?: number;  // 0..1
    injury?: number;         // 0..1 visual injury of myocardium
    ecg?: boolean;
    ecgMorph?: number;       // 0 normal → 1 evolved STEMI
    emphasizeAffected?: boolean;
    emphasizeReciprocal?: boolean;
    showExtraLeads?: boolean;
    camera?: 'overview' | 'territory' | 'vessel';
  };
}

export interface QuizCase {
  id: string;
  title: string;
  vignette: string;
  territoryId: string;
  dominance: Dominance;
}
