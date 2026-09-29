import type { ECGLead, LeadId, Vec3 } from './types';

const norm = (v: Vec3): Vec3 => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
/** Frontal-plane (hexaxial) angle: 0° = patient's left, +90° = inferior. */
const frontal = (deg: number): Vec3 => { const r = (deg * Math.PI) / 180; return norm([Math.cos(r), -Math.sin(r), 0]); };
/** Horizontal-plane angle: 0° = left lateral (V6), +90° = straight anterior, negative = posterior. */
const horizontal = (deg: number, y = 0): Vec3 => { const r = (deg * Math.PI) / 180; return norm([Math.cos(r), y, Math.sin(r)]); };
/** Torso ellipsoid used to place electrode markers (heart-centred units). */
export const TORSO_RADII: Vec3 = [1.85, 2.4, 1.3];
const onTorso = (v: Vec3): Vec3 => { const [a, b, c] = TORSO_RADII; const s = 1 / Math.sqrt((v[0] / a) ** 2 + (v[1] / b) ** 2 + (v[2] / c) ** 2); return [v[0] * s, v[1] * s, v[2] * s]; };

const L = (id: LeadId, group: ECGLead['group'], view: Vec3, gain: number, faces: string, label = id as string): ECGLead =>
  ({ id, label, group, view, gain, faces, electrode: onTorso(view) });

export const LEADS: ECGLead[] = [
  L('I', 'limb', frontal(0), 1, 'the lateral wall, from the patient’s left'),
  L('II', 'limb', frontal(60), 1, 'the inferior wall, from below and left'),
  L('III', 'limb', frontal(120), 1, 'the inferior wall, from below and right'),
  L('aVR', 'limb', frontal(-150), 1, 'the cavity, from the right shoulder'),
  L('aVL', 'limb', frontal(-30), 1, 'the high lateral wall, from the left shoulder'),
  L('aVF', 'limb', frontal(90), 1, 'the inferior wall, from directly below'),
  L('V1', 'precordial', horizontal(115, 0.05), 1.9, 'the septum and right ventricle, from the right sternal border'),
  L('V2', 'precordial', horizontal(95, 0.02), 2.1, 'the septum, from the left sternal border'),
  L('V3', 'precordial', horizontal(72, -0.05), 2.1, 'the anterior wall'),
  L('V4', 'precordial', horizontal(52, -0.12), 2.0, 'the anterior wall near the apex'),
  L('V5', 'precordial', horizontal(24, -0.12), 1.8, 'the low lateral wall'),
  L('V6', 'precordial', horizontal(2, -0.1), 1.6, 'the lateral wall, from the mid-axillary line'),
  L('V7', 'posterior', horizontal(-28, 0), 1.3, 'the posterior wall, from the posterior axillary line'),
  L('V8', 'posterior', horizontal(-52, 0), 1.2, 'the posterior wall, from below the scapula'),
  L('V9', 'posterior', horizontal(-72, 0), 1.1, 'the posterior wall, from beside the spine'),
  L('V3R', 'right', horizontal(138, -0.05), 1.7, 'the right ventricle'),
  L('V4R', 'right', horizontal(158, -0.12), 1.6, 'the right ventricular free wall'),
];

export const LEAD: Record<LeadId, ECGLead> = Object.fromEntries(LEADS.map((l) => [l.id, l])) as Record<LeadId, ECGLead>;

/** Standard 12-lead layout (3 rows × 4 columns) plus rhythm strip. */
export const STANDARD_GRID: LeadId[][] = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
];
export const EXTRA_LEADS: LeadId[] = ['V7', 'V8', 'V9', 'V3R', 'V4R'];
export const TWELVE: LeadId[] = STANDARD_GRID.flat();
export const ALL_LEADS: LeadId[] = LEADS.map((l) => l.id);

/** Contiguous lead groups used for teaching "which leads look at which wall". */
export const LEAD_GROUPS: { id: string; name: string; leads: LeadId[]; region: string }[] = [
  { id: 'inferior', name: 'Inferior', leads: ['II', 'III', 'aVF'], region: 'inferior' },
  { id: 'lateral', name: 'Lateral', leads: ['I', 'aVL', 'V5', 'V6'], region: 'lateral' },
  { id: 'septal', name: 'Septal', leads: ['V1', 'V2'], region: 'septum' },
  { id: 'anterior', name: 'Anterior', leads: ['V3', 'V4'], region: 'anterior' },
  { id: 'posterior', name: 'Posterior', leads: ['V7', 'V8', 'V9'], region: 'posterior' },
  { id: 'right', name: 'Right ventricle', leads: ['V3R', 'V4R'], region: 'rvFreeWall' },
];

export const averageView = (ids: LeadId[]): Vec3 => {
  const s: Vec3 = [0, 0, 0];
  ids.forEach((id) => { const v = LEAD[id].view; s[0] += v[0]; s[1] += v[1]; s[2] += v[2]; });
  return norm(s);
};
