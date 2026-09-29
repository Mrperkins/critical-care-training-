/**
 * Mechanism-of-action data model. A mechanism is a small signed graph from drug to patient:
 * drug → receptor → transducer / second messenger → cell effect → organ effect → vital sign.
 * Content lives in data (defs/*), never in the view; the patient response comes from an adapter
 * onto an EXISTING physiology session — the MOA layer never computes haemodynamics itself.
 */
export type MechKind = 'drug' | 'receptor' | 'transducer' | 'messenger' | 'channel' | 'enzyme' | 'cell' | 'organ' | 'vital';
export interface MechNode {
  id: string; kind: MechKind; label: string; sub?: string;
  /** narration when this node lights up */ explain?: string;
  /** semantic camera target in a 3D scene (scene/cameraTargets.ts), when one exists */ target?: string;
  /** explicit column override (else computed from the graph) */ rank?: number;
}
export interface MechEdge { from: string; to: string; sign: 1 | -1; label?: string; /** drawn dashed with no signal: a teaching 'does NOT change this' link */ effect?: 'none' }
export interface Readout { id: string; label: string; value: number; unit: string; digits?: number }
export interface PatientAdapter {
  /** which existing engine answers (for the credit line) */ engine: string;
  scenario: string;
  /** put the engine into the lesson's starting patient (idempotent) */ setup(): void;
  /** set drug exposure 0–1 of the demo's top dose (idempotent; steady state, so seeking is exact) */ exposure(u: number): void;
  readouts(): Readout[];
  /** human-readable dose for exposure u */ doseLabel(u: number): string;
}
export interface MechanismDefinition {
  id: string; drug: string; drugClass: string; blurb: string;
  nodes: MechNode[]; edges: MechEdge[];
  /** receptor selectivity shown as a bar chart (0–1 relative activity) */ selectivity?: { receptor: string; activity: number }[];
  patient?: PatientAdapter;
  /** shown instead of a patient response when no existing engine models this drug's target yet (never invent one here) */
  patientNote?: string;
  /** the same drug in different patients (state-dependent response); the first is the default */
  contexts?: { id: string; label: string; note: string; patient: PatientAdapter }[];
  /** closing narration once the whole chain is lit */ summary?: string;
  sources?: string[];
}
