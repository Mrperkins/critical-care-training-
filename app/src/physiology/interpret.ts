/**
 * Stepwise ABG interpretation — the reasoning a learner is taught, applied to the numbers
 * the engine generates. Used for feedback, the explainer panel, and challenge scoring.
 */
export type Disorder = 'resp acidosis' | 'resp alkalosis' | 'met acidosis' | 'met alkalosis';
export interface AbgInput { pH: number; paco2: number; hco3: number; pao2?: number; fio2?: number; na?: number; cl?: number; albumin?: number; age?: number; lactate?: number }
export interface Step { key: string; title: string; text: string; tone: 'ok' | 'warn' | 'bad' }
export interface Interpretation {
  status: 'acidaemia' | 'alkalaemia' | 'normal pH';
  primary: Disorder[]; secondary: Disorder[]; chronicity: 'acute' | 'chronic' | 'acute-on-chronic' | null;
  expectedPaco2: [number, number] | null; expectedHco3: [number, number] | null;
  ag: number | null; agCorr: number | null; deltaRatio: number | null; hagma: boolean;
  aa: number | null; aaExpected: number | null; pf: number | null;
  steps: Step[]; summary: string;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

export function interpret(g: AbgInput): Interpretation {
  const steps: Step[] = []; const primary: Disorder[] = []; const secondary: Disorder[] = [];
  const { pH, paco2, hco3 } = g;
  const status: Interpretation['status'] = pH < 7.35 ? 'acidaemia' : pH > 7.45 ? 'alkalaemia' : 'normal pH';
  steps.push({ key: 'ph', title: '1 · pH', text: `pH ${pH.toFixed(2)} → ${status}.`, tone: status === 'normal pH' ? 'ok' : 'bad' });

  const co2Hi = paco2 > 45, co2Lo = paco2 < 35, hHi = hco3 > 26, hLo = hco3 < 22;
  if (status === 'acidaemia') { if (co2Hi) primary.push('resp acidosis'); if (hLo) primary.push('met acidosis'); }
  else if (status === 'alkalaemia') { if (co2Lo) primary.push('resp alkalosis'); if (hHi) primary.push('met alkalosis'); }
  else {
    // normal pH with abnormal values: the side matching the pH direction from 7.40 is primary
    if (co2Hi && hHi) primary.push(pH < 7.4 ? 'resp acidosis' : 'met alkalosis');
    else if (co2Lo && hLo) primary.push(pH > 7.4 ? 'resp alkalosis' : 'met acidosis');
    else if (co2Hi && hLo) primary.push('resp acidosis', 'met acidosis');
    else if (co2Lo && hHi) primary.push('resp alkalosis', 'met alkalosis');
  }
  const primText = primary.length ? primary.join(' + ') : 'none';
  steps.push({ key: 'primary', title: '2 · Which system moved first?', text: `PaCO₂ ${paco2.toFixed(0)} (${co2Hi ? 'high' : co2Lo ? 'low' : 'normal'}), HCO₃⁻ ${hco3.toFixed(1)} (${hHi ? 'high' : hLo ? 'low' : 'normal'}). The value that explains the pH is primary: ${primText}.`, tone: primary.length ? 'warn' : 'ok' });

  let expectedPaco2: [number, number] | null = null, expectedHco3: [number, number] | null = null; let chronicity: Interpretation['chronicity'] = null;
  const main = primary.length === 1 ? primary[0] : null;
  if (main === 'met acidosis') {
    const e = 1.5 * hco3 + 8; expectedPaco2 = [e - 2, e + 2];
    const txt = `Winter's formula: expected PaCO₂ = 1.5 × ${hco3.toFixed(1)} + 8 = ${r1(e)} ± 2.`;
    if (paco2 > e + 2) { secondary.push('resp acidosis'); steps.push({ key: 'comp', title: '3 · Is the compensation appropriate?', text: `${txt} Measured ${paco2.toFixed(0)} is higher → a respiratory acidosis is also present (tiring, sedated, or obstructed).`, tone: 'bad' }); }
    else if (paco2 < e - 2) { secondary.push('resp alkalosis'); steps.push({ key: 'comp', title: '3 · Is the compensation appropriate?', text: `${txt} Measured ${paco2.toFixed(0)} is lower → an additional respiratory alkalosis (sepsis, salicylate, pain).`, tone: 'warn' }); }
    else steps.push({ key: 'comp', title: '3 · Is the compensation appropriate?', text: `${txt} Measured ${paco2.toFixed(0)} fits — appropriate respiratory compensation.`, tone: 'ok' });
  } else if (main === 'met alkalosis') {
    const e = 0.7 * hco3 + 21; expectedPaco2 = [e - 2, e + 2];
    const txt = `Expected PaCO₂ = 0.7 × ${hco3.toFixed(1)} + 21 = ${r1(e)} ± 2.`;
    if (paco2 > e + 2) secondary.push('resp acidosis'); else if (paco2 < e - 2) secondary.push('resp alkalosis');
    steps.push({ key: 'comp', title: '3 · Is the compensation appropriate?', text: `${txt} ${secondary.length ? `Measured ${paco2.toFixed(0)} is outside the range → additional ${secondary[0]}.` : 'Appropriate.'}`, tone: secondary.length ? 'warn' : 'ok' });
  } else if (main === 'resp acidosis' || main === 'resp alkalosis') {
    const d = (paco2 - 40) / 10; const acid = main === 'resp acidosis';
    const acute = 24 + (acid ? 1 : 2) * d, chronic = 24 + (acid ? 3.5 : 5) * d; // per 10 mmHg: +1/+3.5 (acidosis), −2/−5 (alkalosis)
    expectedHco3 = [Math.min(acute, chronic) - 2, Math.max(acute, chronic) + 2];
    const txt = `Acute: HCO₃⁻ ${acid ? '+1' : '−2'} per 10 mmHg → ${r1(acute)}. Chronic (kidneys, 2–5 days): ${acid ? '+3.5' : '−5'} per 10 → ${r1(chronic)}.`;
    const lo = Math.min(acute, chronic), hi = Math.max(acute, chronic);
    if (Math.abs(hco3 - acute) <= 2) chronicity = 'acute';
    else if (Math.abs(hco3 - chronic) <= 2) chronicity = 'chronic';
    else if (hco3 > lo && hco3 < hi) chronicity = 'acute-on-chronic';
    if (hco3 > hi + 2) secondary.push('met alkalosis'); else if (hco3 < lo - 2) secondary.push('met acidosis');
    steps.push({ key: 'comp', title: '3 · Acute or chronic?', text: `${txt} Measured ${hco3.toFixed(1)} → ${secondary.length ? `beyond the chronic range: an additional ${secondary[0]}` : chronicity ?? 'partially compensated'}.`, tone: secondary.length ? 'bad' : 'ok' });
  } else if (primary.length === 2) {
    steps.push({ key: 'comp', title: '3 · Compensation', text: 'Both systems push the pH the same way — a mixed disorder. No compensation is happening; each process makes the other worse.', tone: 'bad' });
  }

  let ag: number | null = null, agCorr: number | null = null, deltaRatio: number | null = null, hagma = false;
  if (g.na != null && g.cl != null) {
    ag = g.na - g.cl - hco3; agCorr = ag + 2.5 * (4 - (g.albumin ?? 4));
    hagma = agCorr >= 16 || (agCorr > 14 && hco3 < 22 && !primary.includes('resp alkalosis'));
    let txt = `AG = Na⁺ − (Cl⁻ + HCO₃⁻) = ${g.na.toFixed(0)} − (${g.cl.toFixed(0)} + ${hco3.toFixed(0)}) = ${ag.toFixed(0)}`;
    if (g.albumin != null && Math.abs(g.albumin - 4) > 0.3) txt += `; corrected for albumin ${g.albumin.toFixed(1)} → ${agCorr.toFixed(0)}`;
    if (hagma) {
      deltaRatio = (agCorr - 12) / Math.max(0.5, 24 - hco3);
      const dd = deltaRatio < 0.4 ? 'a coexisting normal-AG (hyperchloraemic) acidosis' : deltaRatio < 0.8 ? 'a mixed high- and normal-AG acidosis' : deltaRatio <= 2 ? 'a pure high-AG acidosis' : 'a coexisting metabolic alkalosis';
      if (deltaRatio > 2 && !secondary.includes('met alkalosis') && !primary.includes('met alkalosis')) secondary.push('met alkalosis');
      txt += ` — HIGH. Δ-ratio (ΔAG/ΔHCO₃⁻) = ${deltaRatio.toFixed(1)} → ${dd}. Think MUDPILES / GOLDMARK: lactate, ketones, toxins, uraemia.`;
    } else txt += ' — normal.' + (hco3 < 22 ? ' A normal-AG acidosis points to HCO₃⁻ loss (diarrhoea) or Cl⁻ gain (saline).' : '');
    steps.push({ key: 'ag', title: '4 · Anion gap', text: txt, tone: hagma ? 'bad' : 'ok' });
  }

  let aa: number | null = null, aaExpected: number | null = null, pf: number | null = null;
  if (g.pao2 != null && g.fio2 != null) {
    const pA = g.fio2 * 713 - paco2 / 0.8; aa = pA - g.pao2; aaExpected = (g.age ?? 40) / 4 + 4; pf = g.pao2 / g.fio2;
    const ards = pf < 100 ? 'severe' : pf < 200 ? 'moderate' : pf < 300 ? 'mild' : null;
    steps.push({ key: 'ox', title: '5 · Oxygenation', text: `PAO₂ = ${g.fio2.toFixed(2)} × 713 − ${paco2.toFixed(0)}/0.8 = ${pA.toFixed(0)}. A–a gradient ${aa.toFixed(0)} (expected ≤ ${aaExpected.toFixed(0)} for age). P/F ${pf.toFixed(0)}${ards ? ` — ${ards} impairment range` : ''}. ${aa > aaExpected + 5 ? 'Widened: V/Q mismatch, shunt or diffusion problem.' : 'Normal gradient: any hypoxaemia is from hypoventilation or low inspired O₂.'}`, tone: aa > aaExpected + 5 ? 'warn' : 'ok' });
  }

  const all = [...primary, ...secondary];
  const summary = all.length ? `${chronicity && main?.startsWith('resp') ? chronicity[0].toUpperCase() + chronicity.slice(1) + ' ' : ''}${primary.join(' + ')}${secondary.length ? ' with ' + secondary.join(' + ') : ''}${hagma ? ' (high anion gap)' : ''}` : 'Normal acid–base status';
  return { status, primary, secondary, chronicity, expectedPaco2, expectedHco3, ag, agCorr, deltaRatio, hagma, aa, aaExpected, pf, steps, summary };
}
