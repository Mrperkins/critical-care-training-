/**
 * What a portable AP chest X-ray of the ventilated patient would show — a pure function of the VENT session state.
 * `cxrFromVent(session)` reads the same mechanics the ventilator uses (pleural collapse per side, recruitment = open
 * fraction, tension, bronchial plug, auto-PEEP, drain / needle) into a small `CxrState`; `cxrFindings` reads it out.
 * The picture on screen is a real, openly licensed film matched to these findings (vent/CxrScene.tsx).
 */
import type { VentSession } from './session';
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));


export interface CxrSide { /** pleural air: fraction of the hemithorax width lost to air */ ptx: number; /** lobar/lung collapse from airway obstruction */ atelectasis: number; /** diffuse airspace opacity 0–1 */ opacity: number; /** effusion 0–1 */ effusion: number }
export interface CxrState {
  side: [CxrSide, CxrSide]; // 0 = right, 1 = left
  tension: number; /** interstitial / alveolar oedema pattern (perihilar, Kerley lines) */ edema: number; /** patchy bilateral airspace disease with air bronchograms */ ards: number;
  hyperinflation: number; habitus: number; /** cardiothoracic ratio */ ctr: number;
  ett: { aboveCarinaCm: number } | null; drain: boolean; needle: boolean;
}
export const NORMAL_CXR: CxrState = { side: [{ ptx: 0, atelectasis: 0, opacity: 0, effusion: 0 }, { ptx: 0, atelectasis: 0, opacity: 0, effusion: 0 }], tension: 0, edema: 0, ards: 0, hyperinflation: 0, habitus: 0, ctr: 0.47, ett: { aboveCarinaCm: 4.5 }, drain: false, needle: false };

/** Read the radiograph's inputs from the live vent session. */
export function cxrFromVent(S: VentSession): CxrState {
  const id = S.sc.id; const m = S.m; const rec = S.sc.lung.recruitable ?? 0;
  const side = [0, 1].map((k) => {
    const c = m.lung.comps[k]; const closed = 1 - m.openFrac(k); // recruitable units collapsed now (0 … rec)
    const base = id === 'ards' ? 0.3 : id === 'edema' ? 0.2 : id === 'obesity' ? 0.05 : 0;
    const opacity = clamp(base + (rec > 0 ? (closed / rec) * (id === 'obesity' ? 0.35 : 0.55) : 0));
    const plug = k === 0 && S.plugR != null ? clamp((S.plugR - 4) / 146) : k === 1 && S.mainstem ? clamp(0.3 + S.mainstemT / 25) : 0; // absorption atelectasis behind the blocked bronchus
    return { ptx: id === 'ptx' ? clamp(c.collapsed) : 0, atelectasis: plug, opacity, effusion: id === 'edema' ? 0.45 : 0 };
  }) as [CxrSide, CxrSide];
  const auto = m.ventilation().autoPeep;
  const hyper = id === 'asthma' || id === 'copd' ? clamp((id === 'copd' ? 0.55 : 0.3) + auto / 12) : 0;
  return { side, tension: m.lung.tension, edema: id === 'edema' ? 1 : 0, ards: id === 'ards' ? 1 : 0, hyperinflation: hyper, habitus: id === 'obesity' ? 1 : 0,
    ctr: id === 'edema' ? 0.62 : hyper > 0 ? 0.42 : 0.47, ett: { aboveCarinaCm: S.mainstem ? -2.5 : 4.5 }, drain: S.tubeT >= 0, needle: S.decompT >= 0 };
}

/** Film geometry used by the readings and tests (x ∈ [−1, 1], image-left = patient right; y ∈ [0, 1] top → bottom). */
export function geometry(st: CxrState) {
  // mediastinal shift toward +x (image right = patient LEFT) is positive: tension pushes away from the air; collapse pulls toward it
  const push = Math.min(0.2, st.tension * 0.022) * (st.side[0].ptx >= st.side[1].ptx ? 1 : -1);
  const pull = 0.14 * (st.side[1].atelectasis - st.side[0].atelectasis);
  const shift = push + pull;
  const dome = [0, 1].map((k) => {
    const s = st.side[k]; let base = 0.76 + (k === 0 ? -0.025 : 0) + 0.08 * st.hyperinflation - 0.07 * st.habitus - 0.12 * s.atelectasis;
    let amp = 0.085 * (1 - 0.7 * st.hyperinflation);
    if (s.ptx > 0 && st.tension > 2) { base += 0.05 * s.ptx; amp *= 1 - 0.8 * s.ptx; } // depressed, flattened
    return { base, amp };
  });
  return { shift, dome, carinaY: 0.33 };
}
/** What a reader would say about this film (derived from the same state). */
export function cxrFindings(st: CxrState): string[] {
  const f: string[] = []; const g = geometry(st); const nm = ['Right', 'Left'];
  st.side.forEach((s, k) => {
    if (s.ptx > 0.1) f.push(`${nm[k]} pneumothorax: visible pleural edge, no lung markings beyond it${st.tension > 2 ? '; depressed, flattened hemidiaphragm and wider rib spaces' : ''}.`);
    if (s.atelectasis > 0.3) f.push(`${nm[k]} lung collapse: dense, airless hemithorax with volume loss — elevated hemidiaphragm, mediastinum pulled toward it.`);
    if (s.effusion > 0.2) f.push(`${nm[k]} effusion: dependent haze and a blunted costophrenic angle.`);
  });
  if (Math.abs(g.shift) > 0.05) f.push(`Mediastinum shifted to the ${g.shift > 0 ? 'left' : 'right'} (${st.tension > 2 ? 'pushed away by tension' : 'pulled toward collapse'}).`);
  if (st.edema) f.push('Perihilar "bat-wing" opacity, septal lines at the bases and an enlarged heart: pulmonary oedema.');
  const op = (st.side[0].opacity + st.side[1].opacity) / 2;
  if (st.ards) f.push(op > 0.45 ? 'Bilateral patchy airspace opacities with air bronchograms, normal heart size: ARDS pattern.' : 'Bilateral opacities, less dense as the lung is recruited.');
  else if (!st.edema && op > 0.12) f.push('Basal opacity from dependent collapse (low lung volumes).');
  if (st.hyperinflation > 0.25) f.push('Hyperinflated, hyperlucent lungs with low, flat hemidiaphragms and a narrow heart.');
  if (st.habitus) f.push('Soft-tissue shadow over both lungs and low volumes (habitus) — do not over-read as consolidation.');
  if (st.ett) f.push(st.ett.aboveCarinaCm < 0 ? `Endotracheal tube tip ${Math.abs(st.ett.aboveCarinaCm).toFixed(1)} cm BELOW the carina, in the right main bronchus — too deep.` : `Endotracheal tube tip ${st.ett.aboveCarinaCm.toFixed(1)} cm above the carina.`);
  if (st.drain) f.push('Right chest drain directed toward the apex.'); if (st.needle && !st.drain) f.push('Decompression catheter in the right 2nd intercostal space.');
  if (!f.some((l) => /pneumothorax|collapse|oedema|ARDS|opacit|Hyperinflated|effusion|shift/.test(l))) f.push('Clear lungs, normal heart size, no pneumothorax.');
  return f;
}
