/**
 * Cell model: what the cell scenes show for the selected lab, computed from the shared patient.
 * Pure (no rendering). The simulator (sim.ts) moves molecules toward these targets only through
 * the transporters listed here, and the HUD prints the same numbers, so what moves, what it is
 * called and what it does to the cell always agree with the physiology engine.
 */
import type { Snapshot, PatientState } from '../../physiology/patient';
import { drugEffect, restingPotential, thresholdPotential } from '../../physiology/patient';
import { ecgShape } from '../../physiology/ecg';
import { LAB } from '../../knowledge/labs';
import { registerLabelInfo } from '../../scene/labelInfo';

/** which physiology the scene teaches: membrane potential (K⁺, Ca²⁺, Mg²⁺ …) or cell volume (Na⁺) */
export type Story = 'membrane' | 'volume';
/** which cell is drawn */
export type CellType = 'cardiac' | 'neuron' | 'round';
export const CELL_TYPES: [CellType, string, string][] = [['cardiac', 'Heart', 'heart muscle cell (cardiomyocyte)'], ['neuron', 'Nerve', 'nerve cell (neuron)'], ['round', 'Textbook', 'generic animal cell']];
export type SpeciesKey = 'na' | 'k' | 'ca' | 'mg' | 'cl' | 'pi' | 'w' | 'osm';
export type TransporterKind = 'pump' | 'kchan' | 'nachan' | 'cachan' | 'aqp' | 'vrac';

export interface SpeciesDef { key: SpeciesKey; label: string; name: string; color: string; ink: string; unit: string }
export const SPECIES: Record<SpeciesKey, SpeciesDef> = {
  na: { key: 'na', label: 'Na⁺', name: 'Sodium ion', color: '#f2c14e', ink: '#2a1c00', unit: 'mEq/L' },
  k: { key: 'k', label: 'K⁺', name: 'Potassium ion', color: '#a47cff', ink: '#ffffff', unit: 'mEq/L' },
  ca: { key: 'ca', label: 'Ca²⁺', name: 'Calcium ion', color: '#f1ede4', ink: '#1b1b1f', unit: 'mmol/L' },
  mg: { key: 'mg', label: 'Mg²⁺', name: 'Magnesium ion', color: '#6fd3a8', ink: '#062a1c', unit: 'mmol/L' },
  cl: { key: 'cl', label: 'Cl⁻', name: 'Chloride ion', color: '#8fe36b', ink: '#0d2600', unit: 'mEq/L' },
  pi: { key: 'pi', label: 'HPO₄²⁻', name: 'Phosphate', color: '#ff9f6b', ink: '#2b1000', unit: 'mmol/L' },
  w: { key: 'w', label: 'H₂O', name: 'Water', color: '#7cc8ff', ink: '#ffffff', unit: '' },
  osm: { key: 'osm', label: 'Osm', name: 'Organic osmolytes (taurine, glutamine, myo-inositol)', color: '#4fd1c5', ink: '#00211d', unit: '' },
};
export const SPECIES_ORDER: SpeciesKey[] = ['na', 'k', 'ca', 'mg', 'cl', 'pi', 'w', 'osm'];

export interface TransporterDef { kind: TransporterKind; name: string; short: string; what: string; color: string }
export const TRANSPORTERS: Record<TransporterKind, TransporterDef> = {
  pump: { kind: 'pump', name: 'Na⁺/K⁺-ATPase (sodium–potassium pump)', short: 'Na⁺/K⁺ pump', what: 'Uses one ATP to push 3 Na⁺ out and bring 2 K⁺ in. Sped up by insulin and β₂-agonists; needs Mg²⁺.', color: '#e0b04a' },
  kchan: { kind: 'kchan', name: 'K⁺ leak channel (Kir2.1)', short: 'K⁺ channel', what: 'Open at rest. K⁺ leaks out down its gradient and takes positive charge with it — this sets the resting potential.', color: '#9c6bff' },
  nachan: { kind: 'nachan', name: 'Voltage-gated Na⁺ channel (Nav1.5)', short: 'Na⁺ channel', what: 'Opens at threshold to fire the cell. If the resting potential drifts up, its inactivation gate shuts and stays shut.', color: '#ff9b3d' },
  cachan: { kind: 'cachan', name: 'L-type Ca²⁺ channel', short: 'Ca²⁺ channel', what: 'Opens during each beat; the Ca²⁺ that enters triggers contraction.', color: '#e9e4da' },
  aqp: { kind: 'aqp', name: 'Aquaporin-4 water channel', short: 'Aquaporin', what: 'Lets water cross in seconds. Water always moves toward the side with more dissolved particles.', color: '#5fb4ff' },
  vrac: { kind: 'vrac', name: 'Osmolyte channel (VRAC)', short: 'Osmolyte channel', what: 'Over ~48 h brain cells shed (or rebuild) organic osmolytes so their volume returns to normal.', color: '#35c2b2' },
};
registerLabelInfo(Object.fromEntries(Object.values(TRANSPORTERS).map((t) => [t.short, `${t.name}. ${t.what}`])));


export type Focus = { kind: 'species'; key: SpeciesKey; side?: 'in' | 'out' } | { kind: 'transporter'; t: TransporterKind } | { kind: 'vm' } | { kind: 'threshold' } | { kind: 'volume' } | { kind: 'none' };
export interface ChainStep { text: string; focus: Focus; tone?: 'bad' | 'good' | 'info' }

export interface SpeciesState { key: SpeciesKey; inside: number; outside: number; /** 0–1 how much this species matters for the selected lab (drawn larger) */ emph: number }
export interface CellModel {
  story: Story; cellType: CellType; labId: string;
  species: SpeciesState[];
  transporters: TransporterKind[];
  /** pump turnover relative to baseline */
  pumpRate: number;
  /** share of K⁺ channel traffic that comes back in (grows as outside K⁺ rises) */
  kReturn: number;
  /** fraction of Na⁺ channels not inactivated at the resting potential (h∞) */
  naAvail: number;
  /** K⁺ moved into (+) or out of (−) cells by shifts, mEq/L of plasma */
  kShiftIn: number;
  volume: number; osmolytes: number; plasmaOsm: number; naBrain: number; adapted: boolean;
  rmp: number; threshold: number; rmpNormal: number; thrNormal: number;
  /** firings per minute and 0–1 strength of each (0 = inexcitable); how the cell fires */
  hr: number; beat: number; fire: 'beat' | 'spike' | 'none';
  chain: ChainStep[];
  headline: string;
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const f0 = (x: number) => x.toFixed(0), f1 = (x: number) => x.toFixed(1);
/** Nav1.5 steady-state availability (h∞), centred on this engine's resting potential (−83 mV at K⁺ 4.2): ~80 % ready at rest, ~35 % at K⁺ 7.5, ~20 % at K⁺ 9. */
export const naAvailability = (vm: number) => 1 / (1 + Math.exp((vm + 75) / 6));

export function storyOf(labId: string): Story | null {
  const s = LAB[labId]?.scene; return s === 'membrane' ? 'membrane' : s === 'neuron' ? 'volume' : null;
}
export const sceneOf = storyOf;
export const defaultCellType = (labId: string): CellType => (LAB[labId]?.scene === 'neuron' ? 'neuron' : 'cardiac');

/** Transporters each cell really has for this story (a generic cell has no voltage-gated channels). */
export function transportersFor(story: Story, type: CellType): TransporterKind[] {
  if (story === 'membrane') return type === 'cardiac' ? ['pump', 'kchan', 'nachan', 'cachan'] : type === 'neuron' ? ['pump', 'kchan', 'nachan'] : ['pump', 'kchan'];
  return type === 'round' ? ['pump', 'aqp', 'vrac'] : ['pump', 'aqp', 'vrac', 'nachan'];
}

export function cellModel(labId: string, s: Snapshot, pt: PatientState, cellType?: CellType): CellModel | null {
  const story = storyOf(labId); if (!story) return null; const type = cellType ?? defaultCellType(labId);
  const p = pt.p;
  const insulin = drugEffect(pt, 'insulin'), beta = drugEffect(pt, 'albuterol'), caDose = drugEffect(pt, 'calcium');
  const pumpRate = Math.max(0.3, 1 + 1.5 * insulin + 1.0 * beta - 0.35 * clamp((1.7 - p.mg) / 0.8) - 0.25 * clamp((2.5 - p.phos) / 1.5));
  const rmp = restingPotential(s.k), threshold = thresholdPotential(p.ca, caDose);
  const ecg = ecgShape({ kEff: s.kEffective, k: s.k, ca: p.ca, mg: p.mg, hr: 72 });
  const naAvail = naAvailability(rmp);
  const beat = clamp(1 - 0.9 * ecg.sine - 2.2 * Math.max(0, ecg.qrs - 0.1), 0.05, 1);
  const plasmaOsm = 2 * s.na + p.glucose / 18 + p.bun / 2.8;
  const adapted = Math.abs(pt.naBrain - s.na) < 3 && Math.abs(s.na - 140) > 4;
  const e = (id: string) => (labId === id ? 1 : 0);
  let species: SpeciesState[];
  let transporters: TransporterKind[];
  if (story === 'membrane') {
    species = [{ key: 'k', inside: 140, outside: s.k, emph: e('k') }, { key: 'na', inside: 12, outside: s.na, emph: 0 }];
    if (labId === 'ca') species.push({ key: 'ca', inside: 0.0001, outside: p.ca, emph: 1 });
    if (labId === 'mg') species.push({ key: 'mg', inside: 0.5, outside: (p.mg / 2.43) * 0.65, emph: 1 });
    if (labId === 'cl') species.push({ key: 'cl', inside: 25, outside: s.cl, emph: 1 });
    if (labId === 'phos') species.push({ key: 'pi', inside: 2, outside: p.phos / 3.1, emph: 1 });
  } else {
    species = [{ key: 'na', inside: 12, outside: s.na, emph: 1 }, { key: 'k', inside: 140, outside: s.k, emph: 0 }, { key: 'w', inside: 1, outside: 1, emph: 0.5 }, { key: 'osm', inside: pt.naBrain / 140, outside: 0, emph: 0.4 }];
  }
  transporters = transportersFor(story, type);
  // excitability: heart cells beat (plateau action potential), nerve cells spike, a generic cell does not fire
  const spike = clamp(Math.pow(naAvail / naAvailability(restingPotential(4.2)), 0.8) * clamp((threshold - rmp) / 6), 0, 1);
  const fire: CellModel['fire'] = type === 'cardiac' ? 'beat' : type === 'neuron' ? 'spike' : 'none';
  const kShiftIn = pt.kBal - s.k;
  const m: CellModel = {
    story, cellType: type, labId, species, transporters, pumpRate,
    kReturn: clamp(0.12 * Math.pow(s.k / 4.2, 1.3), 0.04, 0.6), naAvail, kShiftIn,
    volume: s.cellVolume, osmolytes: pt.naBrain / 140, plasmaOsm, naBrain: pt.naBrain, adapted,
    rmp, threshold, rmpNormal: restingPotential(4.2), thrNormal: thresholdPotential(1.2),
    hr: fire === 'beat' ? ecg.hr : fire === 'spike' ? 110 : 0, beat: fire === 'beat' ? beat : fire === 'spike' ? Math.max(0.03, spike) : 0, fire,
    chain: [], headline: '',
  };
  const c = story === 'membrane' ? membraneChain(labId, m, s, pt, { insulin, beta, caDose }) : volumeChain(m, s, pt);
  m.chain = c.chain; m.headline = c.headline;
  return m;
}

/* ------------------------------------------------------------------ cause → effect */
function membraneChain(labId: string, m: CellModel, s: Snapshot, pt: PatientState, d: { insulin: number; beta: number; caDose: number }): { chain: ChainStep[]; headline: string } {
  const p = pt.p; const ch: ChainStep[] = []; const t = m.cellType; const hasNa = t !== 'round';
  const ratio = 140 / s.k; const gap = m.threshold - m.rmp, gapN = m.thrNormal - m.rmpNormal;
  const push = (text: string, focus: Focus, tone?: ChainStep['tone']) => ch.push({ text, focus, tone });
  if (labId === 'k' || labId === 'cl' || labId === 'phos' || labId === 'mg' || labId === 'ca') {
    // drugs first: they are what the learner just did
    if (d.insulin + d.beta > 0.05) push(`${d.insulin > d.beta ? 'Insulin' : 'Albuterol'} is speeding the Na⁺/K⁺ pump ×${f1(m.pumpRate)} → K⁺ is pulled into the cell (plasma K⁺ −${f1(0.9 * d.insulin + 0.55 * d.beta)})`, { kind: 'transporter', t: 'pump' }, 'good');
    if (d.caDose > 0.05) push(`Calcium raises the threshold to ${f0(m.threshold)} mV — the gap is back to ${f0(gap)} mV. K⁺ itself is unchanged.`, { kind: 'threshold' }, 'good');
  }
  if (labId === 'k') {
    if (s.k > 5.2) {
      push(`Plasma K⁺ ${f1(s.k)} — more K⁺ outside the cell (normal 4.2)`, { kind: 'species', key: 'k', side: 'out' }, 'bad');
      push(`The gradient shrinks: inside 140 ÷ outside ${f1(s.k)} = ${f0(ratio)} : 1 (normal 33 : 1)`, { kind: 'species', key: 'k' });
      push('More K⁺ drifts back in through the K⁺ channels, so less positive charge leaves the cell', { kind: 'transporter', t: 'kchan' });
      push(`The inside is less negative: resting potential ${f0(m.rmpNormal)} → ${f0(m.rmp)} mV${hasNa ? `, only ${f0(gap)} mV from threshold` : ''}`, { kind: 'vm' }, 'bad');
      if (hasNa) push(`Na⁺ channels inactivate at this voltage: ${Math.round(m.naAvail * 100)} % still ready to fire (normally ${Math.round(naAvailability(m.rmpNormal) * 100)} %)`, { kind: 'transporter', t: 'nachan' }, 'bad');
      push(t === 'cardiac' ? (s.k > 7.5 ? 'Slow, weak depolarisation: wide QRS → sine wave → VF or asystole' : 'Peaked T waves first; PR lengthens and P flattens as K⁺ climbs')
        : t === 'neuron' ? 'Nerves (and skeletal muscle) fire weakly, then not at all — paraesthesia, ascending weakness'
        : 'Every cell depolarises, but heart, nerve and muscle cells suffer: they need that voltage gap to fire', { kind: 'vm' }, 'bad');
      return { chain: ch, headline: `High K⁺: resting potential ${f0(m.rmp)} mV${hasNa ? `, ${Math.round(m.naAvail * 100)} % of Na⁺ channels ready` : ''}` };
    }
    if (s.k < 3.5) {
      push(`Plasma K⁺ ${f1(s.k)} — fewer K⁺ ions outside`, { kind: 'species', key: 'k', side: 'out' }, 'bad');
      push(`The gradient steepens: 140 ÷ ${f1(s.k)} = ${f0(ratio)} : 1 (normal 33 : 1)`, { kind: 'species', key: 'k' });
      push('Almost nothing drifts back through the K⁺ channels, so more positive charge leaves', { kind: 'transporter', t: 'kchan' });
      push(`The inside is more negative (hyperpolarised): ${f0(m.rmp)} mV`, { kind: 'vm' }, 'bad');
      push(t === 'cardiac' ? 'Repolarisation slows: flat T waves, U waves, ectopy — worse with digoxin or low Mg²⁺' : t === 'neuron' ? 'Further from threshold: nerves and muscle are sluggish → weakness, ileus, cramps' : 'Heart and muscle cells feel it most: slow repolarisation, weakness, arrhythmias', { kind: 'vm' }, 'bad');
      return { chain: ch, headline: `Low K⁺: hyperpolarised at ${f0(m.rmp)} mV` };
    }
    if (!ch.length) {
      push('The Na⁺/K⁺ pump spends one ATP to push 3 Na⁺ out and bring 2 K⁺ in', { kind: 'transporter', t: 'pump' });
      push('K⁺ is 33× more concentrated inside, so it leaks out through open K⁺ channels', { kind: 'transporter', t: 'kchan' });
      push(`Each K⁺ that leaves takes a positive charge with it: the inside settles at ${f0(m.rmp)} mV`, { kind: 'vm' });
      if (hasNa) {
        push(`Threshold is ${f0(m.threshold)} mV — a ${f0(gap)} mV gap the Na⁺ channels must be pushed across to fire`, { kind: 'threshold' });
        push(t === 'cardiac' ? 'Each beat: Na⁺ channels snap open, Na⁺ rushes in and the cell fires and contracts' : 'Each impulse: Na⁺ channels snap open, Na⁺ rushes in and a spike runs down the axon', { kind: 'transporter', t: 'nachan' });
      } else push('This generic cell does not fire, but heart, nerve and muscle cells fire from exactly this resting voltage', { kind: 'vm' }, 'info');
    }
    return { chain: ch, headline: `Resting potential ${f0(m.rmp)} mV · threshold ${f0(m.threshold)} mV` };
  }
  if (labId === 'ca') {
    push(`Ionised Ca²⁺ ${p.ca.toFixed(2)} mmol/L outside the cell (normal 1.12–1.32)`, { kind: 'species', key: 'ca', side: 'out' }, p.ca < 1.12 || p.ca > 1.32 ? 'bad' : undefined);
    push(`Outside Ca²⁺ sets the threshold: ${f0(m.threshold)} mV (normal ${f0(m.thrNormal)})`, { kind: 'threshold' });
    if (p.ca < 1.12) push(`Threshold drops toward rest — gap ${f0(gap)} mV (normal ${f0(gapN)}): nerves and muscle fire too easily → tetany, long QT`, { kind: 'vm' }, 'bad');
    else if (p.ca > 1.32) push(`Threshold moves away from rest — gap ${f0(gap)} mV: cells are harder to fire → weakness, short QT`, { kind: 'vm' }, 'bad');
    if (t === 'cardiac') push('Each beat, Ca²⁺ enters through L-type channels and triggers contraction', { kind: 'transporter', t: 'cachan' });
    else if (t === 'neuron') push('At nerve terminals, Ca²⁺ entry releases neurotransmitter', { kind: 'species', key: 'ca' });
    return { chain: ch, headline: `Threshold ${f0(m.threshold)} mV · gap ${f0(gap)} mV` };
  }
  if (labId === 'mg') {
    push(`Mg²⁺ ${f1(p.mg)} mg/dL — the pump runs on Mg-ATP`, { kind: 'species', key: 'mg', side: 'out' }, p.mg < 1.7 ? 'bad' : undefined);
    push(p.mg < 1.7 ? `Low Mg²⁺ slows the pump to ×${f1(m.pumpRate)} and the kidney wastes K⁺ — hypokalaemia will not correct until Mg²⁺ is replaced` : `Pump turnover ×${f1(m.pumpRate)}`, { kind: 'transporter', t: 'pump' }, p.mg < 1.7 ? 'bad' : undefined);
    push(p.mg < 1.7 ? 'Prolonged repolarisation → long QT → torsades de pointes' : 'Mg²⁺ also steadies repolarisation (why it treats torsades)', { kind: 'vm' });
    return { chain: ch, headline: `Pump ×${f1(m.pumpRate)}` };
  }
  if (labId === 'phos') {
    push(`Phosphate ${f1(p.phos)} mg/dL — the P in ATP`, { kind: 'species', key: 'pi', side: 'out' }, p.phos < 2.5 ? 'bad' : undefined);
    push(p.phos < 2.5 ? `Too little ATP: pump ×${f1(m.pumpRate)}, weak muscle (diaphragm → failure to wean), haemolysis` : 'Enough ATP for the pump and for contraction', { kind: 'transporter', t: 'pump' }, p.phos < 2.5 ? 'bad' : undefined);
    return { chain: ch, headline: `Pump ×${f1(m.pumpRate)}` };
  }
  // chloride
  push(`Cl⁻ ${f0(s.cl)} outside, ~25 inside: it mostly follows Na⁺ and matters most for acid–base (see Blood gas)`, { kind: 'species', key: 'cl' });
  push(`Resting potential ${f0(m.rmp)} mV — set by K⁺, not Cl⁻`, { kind: 'vm' });
  return { chain: ch, headline: `Resting potential ${f0(m.rmp)} mV` };
}

function volumeChain(m: CellModel, s: Snapshot, pt: PatientState): { chain: ChainStep[]; headline: string } {
  const brain = m.cellType === 'neuron';
  const ch: ChainStep[] = []; const push = (text: string, focus: Focus, tone?: ChainStep['tone']) => ch.push({ text, focus, tone });
  const vol = Math.round(m.volume * 100); const nb = pt.naBrain;
  if (s.na < 135) {
    push(`Plasma Na⁺ ${f0(s.na)} — plasma is more dilute (osmolality ≈ ${f0(m.plasmaOsm)}, normal ≈ 290)`, { kind: 'species', key: 'na', side: 'out' }, 'bad');
    if (m.adapted) {
      push(`Over ~48 h the cell has shed organic osmolytes (now ${Math.round(m.osmolytes * 100)} % of normal) to match`, { kind: 'transporter', t: 'vrac' }, 'good');
      push(`So volume is back near normal: ${vol} %`, { kind: 'volume' }, 'good');
      push('Danger now is correcting too fast: plasma rises quicker than osmolytes can be rebuilt → the cell shrinks → osmotic demyelination. Aim ≤ 8–10 mEq/L in 24 h.', { kind: 'transporter', t: 'vrac' }, 'bad');
      return { chain: ch, headline: `Chronic low Na⁺ · adapted · volume ${vol} %` };
    }
    push('Inside is now saltier than outside, so water moves in through aquaporins', { kind: 'transporter', t: 'aqp' });
    push(`The cell swells, heading for ${vol} % of normal size`, { kind: 'volume' }, 'bad');
    push(brain ? 'Inside a rigid skull: cerebral oedema → headache, vomiting, confusion, seizures, herniation' : 'Every cell swells like this; it matters most in the brain, boxed in by the skull → headache, confusion, seizures', { kind: 'volume' }, 'bad');
    push(`If this lasts > 48 h the cell sheds osmolytes (brain adapted to ${f0(nb)} now)`, { kind: 'transporter', t: 'vrac' }, 'info');
    return { chain: ch, headline: `Acute low Na⁺ · cell volume ${vol} %` };
  }
  if (s.na > 145) {
    push(`Plasma Na⁺ ${f0(s.na)} — plasma is more concentrated (osmolality ≈ ${f0(m.plasmaOsm)})`, { kind: 'species', key: 'na', side: 'out' }, 'bad');
    if (m.adapted) {
      push(`The cell has built extra osmolytes (${Math.round(m.osmolytes * 100)} %) to hold on to its water`, { kind: 'transporter', t: 'vrac' }, 'good');
      push(`Volume ${vol} % — lower Na⁺ slowly now, or water rushes in and the brain swells`, { kind: 'volume' }, 'bad');
      return { chain: ch, headline: `Chronic high Na⁺ · adapted · volume ${vol} %` };
    }
    push('Outside is now saltier, so water leaves the cell through aquaporins', { kind: 'transporter', t: 'aqp' });
    push(`The cell shrinks, heading for ${vol} % of normal size`, { kind: 'volume' }, 'bad');
    push(brain ? 'A shrinking brain pulls on bridging veins → confusion, seizures, subdural bleeding' : 'Every cell shrinks; in the brain this tears bridging veins → confusion, seizures, subdural bleeding', { kind: 'volume' }, 'bad');
    return { chain: ch, headline: `Acute high Na⁺ · cell volume ${vol} %` };
  }
  push(`Plasma Na⁺ ${f0(s.na)} sets plasma osmolality ≈ ${f0(m.plasmaOsm)} mOsm/kg`, { kind: 'species', key: 'na', side: 'out' });
  push('Inside, K⁺ and organic osmolytes balance it — so water has no reason to move', { kind: 'species', key: 'osm' });
  push('Aquaporins let water across in seconds whenever that balance changes', { kind: 'transporter', t: 'aqp' });
  push('The Na⁺/K⁺ pump keeps Na⁺ out of the cell (12 inside vs 140 outside)', { kind: 'transporter', t: 'pump' });
  if (Math.abs(m.volume - 1) > 0.03) push(`Cell volume ${vol} % — still settling after the last change`, { kind: 'volume' }, 'info');
  return { chain: ch, headline: `Na⁺ ${f0(s.na)} · cell volume ${vol} %` };
}

/* ------------------------------------------------------------------ particle counts */
export type Targets = Partial<Record<SpeciesKey, { in: number; out: number }>>;
/** Particle targets for each compartment. K⁺ shifted into cells (insulin, β₂, alkalosis) is added inside, so it visibly goes in rather than vanishing. */
export function targetCounts(m: CellModel, scale: number): Targets {
  const t: Targets = {};
  for (const sp of m.species) {
    const inside = sp.key === 'w' ? m.volume : sp.inside;
    // in the volume story K⁺ is background (fewer drawn, same ratio); in the membrane story it is the story
    const sc = m.story === 'volume' && sp.key === 'k' ? scale * 0.4 : scale;
    let nIn = particleCount(sp.key, inside, 'in', sc); const nOut = particleCount(sp.key, sp.outside, 'out', sc);
    if (sp.key === 'k') nIn += particleCount('k', Math.max(0.5, sp.outside + m.kShiftIn), 'out', sc) - nOut;
    t[sp.key] = { in: Math.max(0, nIn), out: Math.max(0, nOut) };
  }
  return t;
}

/** How many particles to draw for a concentration. Power 0.6 keeps a 33 : 1 gradient obvious while a 4 → 7 change is still visible. */
export function particleCount(key: SpeciesKey, conc: number, side: 'in' | 'out', scale: number): number {
  if (key === 'w') return Math.round(scale * (side === 'in' ? 11 : 18) * conc);
  if (key === 'osm') return side === 'in' ? Math.round(scale * 16 * Math.max(0, 1 - 2.6 * (1 - conc))) : 0;
  if (key === 'ca' && side === 'in') return 0;
  const a = key === 'k' || key === 'na' ? 4.4 : key === 'ca' ? 9 : key === 'mg' ? 11 : 4.4;
  return Math.max(conc > 0.05 ? 1 : 0, Math.round(scale * a * Math.pow(conc, 0.6)));
}
