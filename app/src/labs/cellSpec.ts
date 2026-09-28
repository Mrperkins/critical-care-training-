/**
 * What the microscopic scene should show for a lab, computed from the patient snapshot.
 * Pure function — the renderer draws exactly these counts, sizes and rates.
 */
import type { Snapshot, PatientState } from '../physiology/patient';
import { drugEffect } from '../physiology/patient';
import { LAB } from '../knowledge/labs';

export type Body = 'cell' | 'neuron' | 'vessel' | 'clot' | 'nephron' | 'hepato' | 'myocyte';
export interface Species { key: string; label: string; color: string; inside: number; outside: number; cross: number; size?: number }
export interface CellSpec {
  body: Body; caption: string;
  species: Species[];
  cellScale: number;      // neuron / cell volume (1 = normal)
  pump: number;           // Na⁺/K⁺-ATPase activity (1 = baseline)
  caShield: number;       // 0–1 calcium gathered at the membrane (stabilisation)
  depol: number;          // 0–1 how close resting potential is to threshold
  rbc: number; rbcSat: number; wbc: number; plt: number;
  clotSpeed: number; fibrin: number;
  injury: number; stretch: number; gfr: number; bile: number;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export function cellSpec(labId: string, s: Snapshot, pt: PatientState): CellSpec {
  const p = pt.p; const lab = LAB[labId];
  const base: CellSpec = { body: 'cell', caption: '', species: [], cellScale: 1, pump: 1, caShield: 0, depol: clamp((21 - s.gap) / 16), rbc: 0, rbcSat: s.sao2, wbc: 0, plt: 0, clotSpeed: 1, fibrin: 1, injury: 0, stretch: 0, gfr: 1, bile: 0 };
  const insulin = drugEffect(pt, 'insulin'), beta = drugEffect(pt, 'albuterol'), caDose = drugEffect(pt, 'calcium');
  const ionK: Species = { key: 'k', label: 'K⁺', color: '#b48cff', inside: 140, outside: s.k, cross: clamp(0.9 * insulin + 0.55 * beta, 0, 1) * 0.8 - (s.pH < 7.3 ? 0.3 : 0) };
  const ionNa: Species = { key: 'na', label: 'Na⁺', color: '#f2c14e', inside: 12, outside: s.na, cross: 0 };
  const ionCa: Species = { key: 'ca', label: 'Ca²⁺', color: '#f4f1ea', inside: 0.0001, outside: p.ca, cross: 0 };
  switch (lab.scene) {
    case 'membrane':
      return { ...base, body: 'cell', species: [ionK, ionNa, ionCa, ...(labId === 'mg' ? [{ key: 'mg', label: 'Mg²⁺', color: '#7fd1b9', inside: 20, outside: p.mg * 4, cross: 0 }] : []), ...(labId === 'phos' ? [{ key: 'phos', label: 'HPO₄²⁻', color: '#9fd4ff', inside: 100, outside: p.phos * 5, cross: 0 }] : []), ...(labId === 'cl' ? [{ key: 'cl', label: 'Cl⁻', color: '#8fe3a0', inside: 8, outside: s.cl, cross: 0 }] : [])],
        pump: 1 + 1.5 * insulin + 1.0 * beta - 0.3 * clamp((1.7 - p.mg) / 0.8), caShield: clamp(caDose + (p.ca - 1.2) * 1.5, 0, 1.2),
        caption: 'A cardiac muscle cell. Potassium is concentrated inside; the Na⁺/K⁺ pump keeps it there. The ratio inside ÷ outside sets the resting membrane potential.' };
    case 'neuron':
      return { ...base, body: 'neuron', species: [ionNa, { key: 'w', label: 'H₂O', color: '#8fd3ff', inside: 100, outside: 100, cross: clamp((s.cellVolume - 1) * 4, -1, 1), size: 0.8 }], cellScale: s.cellVolume,
        caption: 'A brain cell. Water follows solute: when plasma sodium falls, water moves in and the cell swells inside a rigid skull; when it rises, the cell shrinks.' };
    case 'blood':
      return { ...base, body: 'vessel', species: [{ key: 'o2', label: 'O₂', color: '#d6ecff', inside: 0, outside: s.cao2, cross: 0 }], rbc: clamp(p.hb / 15, 0.05, 1.5), wbc: clamp(p.wbc / 7, 0, 6), plt: clamp(p.plt / 250, 0, 3.5),
        caption: `A capillary. Red cells carry oxygen: content ${s.cao2.toFixed(1)} mL/dL at SaO₂ ${Math.round(s.sao2 * 100)} %. Each red cell is full — the question is how many there are.` };
    case 'clot':
      return { ...base, body: 'clot', species: [], plt: clamp(p.plt / 250, 0, 3.5), clotSpeed: 1 / Math.max(0.5, Math.max(p.inr, p.ptt / 30)), fibrin: clamp(p.fibrinogen / 300, 0.1, 2), rbc: 0.6,
        caption: 'A torn vessel wall. Platelets stick and form a plug; clotting factors (made by the liver) generate thrombin, which weaves fibrinogen into a fibrin mesh.' };
    case 'nephron':
      return { ...base, body: 'nephron', species: [{ key: 'cr', label: 'Creatinine', color: '#f2a65a', inside: 0, outside: p.cr, cross: 0 }, { key: 'urea', label: 'Urea', color: '#a6e38a', inside: 0, outside: p.bun / 14, cross: 0 }], gfr: clamp(s.egfr / 100, 0.02, 1.3),
        caption: `A glomerulus. Blood is filtered into Bowman’s capsule — about ${Math.round(s.egfr)} mL every minute here. Creatinine is filtered and not reabsorbed, so its blood level rises as filtration falls.` };
    case 'hepatocyte':
      return { ...base, body: 'hepato', species: [{ key: 'enz', label: 'AST/ALT', color: '#ff8a65', inside: 100, outside: Math.max(p.ast, p.alt) / 40, cross: 0 }, { key: 'alb', label: 'Albumin', color: '#8fc5ff', inside: 0, outside: p.albumin, cross: 0 }],
        injury: clamp(Math.log10(Math.max(1, Math.max(p.ast, p.alt) / 40)) / 2), bile: clamp((p.bili - 1) / 10) + clamp((p.alp - 150) / 600) * 0.5, rbc: 0.8,
        caption: 'A plate of liver cells beside a sinusoid. Injured cells leak enzymes (AST, ALT); working cells make albumin and clotting factors; bile flows away in canaliculi.' };
    case 'myocyte':
      return { ...base, body: 'myocyte', species: [{ key: 'trop', label: 'Troponin', color: '#ff6b6b', inside: 100, outside: p.trop * 1000 / 14, cross: 0 }, { key: 'bnp', label: 'BNP', color: '#8de0a6', inside: 0, outside: p.bnp / 100, cross: 0 }],
        injury: clamp(Math.log10(Math.max(1, p.trop * 1000 / 14)) / 2.5), stretch: clamp((p.bnp - 100) / 1500),
        caption: 'Cardiac muscle. Troponin is part of the contractile machinery and only leaks out of injured cells; BNP is released when the ventricle is stretched.' };
    case 'metabolic': default:
      return { ...base, body: 'cell', species: [
        { key: 'glu', label: 'Glucose', color: '#f4f1ea', inside: 5, outside: p.glucose / 18, cross: clamp(0.3 + insulin, 0, 1) },
        { key: 'lac', label: 'Lactate', color: '#e16ad0', inside: 2, outside: s.lactate, cross: -clamp((s.lactate - 1) / 5) },
        { key: 'ket', label: 'Ketones', color: '#5fd0c4', inside: 0, outside: s.ketones, cross: 0 },
        { key: 'h', label: 'H⁺', color: '#ff6a5a', inside: 0, outside: Math.max(0, 7.4 - s.pH) * 60 + 1, cross: 0, size: 0.7 },
        { key: 'hco3', label: 'HCO₃⁻', color: '#9fb2ff', inside: 0, outside: s.hco3 / 3, cross: 0 },
      ], caption: 'A working cell. Glucose enters through insulin-driven transporters and is burned in mitochondria; when it cannot be, lactate leaves. Acids consume bicarbonate in the blood.' };
  }
}
