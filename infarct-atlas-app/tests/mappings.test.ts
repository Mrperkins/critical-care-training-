import { describe, expect, it } from 'vitest';
import { TERRITORIES, TERRITORY } from '../src/data/territories';
import { LEAD, ALL_LEADS, TWELVE } from '../src/data/leads';
import { VESSEL, downstream, ischemicBeyond, parentOf, upstream } from '../src/data/vessels';
import { stDeviationMm, rHeightMm, qDepthMm, sample, T_QRS } from '../src/ecg/ecgModel';
import { buildLesson, primaryCulprit, QUIZ_CASES } from '../src/data/lessons';
import type { LeadId } from '../src/data/types';

const threshold = (l: LeadId) => (LEAD[l].group === 'posterior' ? 0.5 : 1);

describe('territory ↔ lead ↔ vessel data integrity', () => {
  it('every territory references real leads, vessels and regions', () => {
    for (const t of TERRITORIES) {
      for (const l of [...t.affectedLeads, ...t.reciprocalLeads, ...t.extraLeads]) expect(ALL_LEADS).toContain(l);
      for (const c of t.commonCulpritVessels) { expect(VESSEL[c.vessel]).toBeDefined(); expect(c.at).toBeGreaterThanOrEqual(0); expect(c.at).toBeLessThanOrEqual(1); }
      expect(t.commonCulpritVessels.length).toBeGreaterThan(0);
      expect(t.myocardialRegion.length).toBeGreaterThan(0);
      expect(t.affectedLeads.some((l) => t.reciprocalLeads.includes(l))).toBe(false);
    }
  });
  it('matches the classic textbook lead groups', () => {
    expect(TERRITORY.inferior.affectedLeads.sort()).toEqual(['II', 'III', 'aVF'].sort());
    expect(TERRITORY.inferior.reciprocalLeads).toEqual(expect.arrayContaining(['I', 'aVL']));
    expect(TERRITORY.septal.affectedLeads).toEqual(['V1', 'V2']);
    expect(TERRITORY.anterior.affectedLeads).toEqual(['V3', 'V4']);
    expect(TERRITORY.anteroseptal.affectedLeads).toEqual(['V1', 'V2', 'V3', 'V4']);
    expect(TERRITORY.lateral.affectedLeads.sort()).toEqual(['I', 'V5', 'V6', 'aVL'].sort());
    expect(TERRITORY.highLateral.affectedLeads.sort()).toEqual(['I', 'aVL'].sort());
    expect(TERRITORY.posterior.affectedLeads).toEqual(['V7', 'V8', 'V9']);
    expect(TERRITORY.posterior.reciprocalLeads).toEqual(['V1', 'V2', 'V3']);
    expect(TERRITORY.rv.affectedLeads).toContain('V4R');
    for (const l of ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'I', 'aVL'] as LeadId[]) expect(TERRITORY.extensiveAnterior.affectedLeads).toContain(l);
  });
  it('common culprits follow standard associations', () => {
    expect(primaryCulprit(TERRITORY.inferior, 'right').vessel).toBe('RCA');
    expect(primaryCulprit(TERRITORY.inferior, 'left').vessel).toBe('LCx');
    expect(primaryCulprit(TERRITORY.anterior, 'right').vessel).toBe('LAD');
    expect(primaryCulprit(TERRITORY.extensiveAnterior, 'right').vessel).toBe('LAD');
    expect(primaryCulprit(TERRITORY.extensiveAnterior, 'right').at).toBeLessThan(0.2);
    expect(primaryCulprit(TERRITORY.rv, 'right').vessel).toBe('RCA');
    expect(primaryCulprit(TERRITORY.rv, 'right').at).toBeLessThan(0.3);
    expect(['LCx', 'OM1']).toContain(primaryCulprit(TERRITORY.lateral, 'right').vessel);
  });
  it('never claims a territory always equals one artery when alternatives exist', () => {
    for (const t of ['inferior', 'lateral', 'posterior', 'highLateral']) expect(TERRITORY[t].commonCulpritVessels.length).toBeGreaterThan(1);
  });
});

describe('coronary tree and dominance', () => {
  it('PDA and PLB change parent with dominance', () => {
    expect(parentOf('PDA', 'right')).toBe('RCA');
    expect(parentOf('PDA', 'left')).toBe('LCx');
    expect(downstream('RCA', 'right')).toContain('PDA');
    expect(downstream('RCA', 'left')).not.toContain('PDA');
    expect(downstream('LCx', 'left')).toContain('PDA');
  });
  it('a proximal LAD occlusion starves diagonals and septals; a mid LAD spares D1 and S1', () => {
    const prox = ischemicBeyond('LAD', 0.1, 'right');
    for (const v of ['D1', 'D2', 'S1', 'S2', 'S3']) expect(prox).toContain(v);
    const mid = ischemicBeyond('LAD', 0.33, 'right');
    expect(mid).not.toContain('D1'); expect(mid).not.toContain('S1'); expect(mid).toContain('D2');
  });
  it('a proximal RCA occlusion includes the RV (acute marginal) branch', () => {
    expect(ischemicBeyond('RCA', 0.14, 'right')).toContain('AM');
    expect(ischemicBeyond('RCA', 0.55, 'right')).not.toContain('AM');
  });
  it('upstream chain reaches the ostium', () => {
    expect(upstream('D1', 'right')).toEqual(['LM', 'LAD', 'D1']);
    expect(upstream('PDA', 'left')).toEqual(['LM', 'LCx', 'PDA']);
  });
});

describe('ECG model reproduces each territory’s pattern', () => {
  for (const t of TERRITORIES) {
    it(`${t.name}: facing leads elevate, reciprocal leads depress`, () => {
      for (const l of t.affectedLeads) expect(stDeviationMm(l, t.ecgPattern), `${t.id} ${l}`).toBeGreaterThanOrEqual(threshold(l));
      for (const l of t.reciprocalLeads) expect(stDeviationMm(l, t.ecgPattern), `${t.id} ${l}`).toBeLessThanOrEqual(-0.5);
    });
  }
  it('normal ECG has an isoelectric ST segment in all leads', () => {
    for (const l of ALL_LEADS) expect(Math.abs(stDeviationMm(l, null))).toBeLessThan(0.3);
  });
  it('normal R-wave progression across the precordium', () => {
    const r = ['V1', 'V2', 'V3', 'V4', 'V5'].map((l) => rHeightMm(l as LeadId, null));
    for (let i = 1; i < r.length; i++) expect(r[i] + 0.6).toBeGreaterThanOrEqual(r[i - 1]);
    expect(rHeightMm('V5', null)).toBeGreaterThan(rHeightMm('V1', null) * 2);
  });
  it('inferior MI from the RCA shows III > II', () => {
    expect(stDeviationMm('III', TERRITORY.inferior.ecgPattern)).toBeGreaterThan(stDeviationMm('II', TERRITORY.inferior.ecgPattern));
  });
  it('posterior MI produces tall R waves in V1–V2', () => {
    expect(rHeightMm('V1', TERRITORY.posterior.ecgPattern)).toBeGreaterThan(rHeightMm('V1', null) * 1.8);
  });
  it('anterior MI develops Q waves in facing leads as it evolves', () => {
    expect(qDepthMm('V3', TERRITORY.anterior.ecgPattern, 1)).toBeGreaterThan(qDepthMm('V3', null) + 1);
  });
  it('aVR is negative (normal axis)', () => {
    let m = 0; for (let t = T_QRS; t < T_QRS + 0.09; t += 0.002) m = Math.min(m, sample('aVR', t, null, 0));
    expect(m).toBeLessThan(-0.5);
  });
  it('the standard 12 leads are all present', () => { expect(TWELVE).toHaveLength(12); });
});

describe('lessons and quiz are generated from data', () => {
  it('each territory yields a progressive lesson ending in its explanation', () => {
    for (const t of TERRITORIES) {
      const steps = buildLesson(t, 'right');
      expect(steps[0].show.ecgMorph).toBe(0);
      expect(steps[steps.length - 1].text).toBe(t.explanation);
      expect(steps.some((s) => s.show.occlusion)).toBe(true);
      if (t.reciprocalLeads.length) expect(steps.some((s) => s.show.emphasizeReciprocal)).toBe(true);
    }
  });
  it('quiz cases point at real territories', () => {
    for (const q of QUIZ_CASES) expect(TERRITORY[q.territoryId]).toBeDefined();
    const ids = QUIZ_CASES.map((q) => q.territoryId);
    for (const need of ['inferior', 'anterior', 'anteroseptal', 'lateral', 'posterior', 'rv', 'extensiveAnterior']) expect(ids).toContain(need);
  });
});

describe('processed heart asset', () => {
  it('has every named structure, and each territory mask faces its leads', async () => {
    const { validateAsset } = await import('../scripts/validate-asset');
    const r = await validateAsset();
    expect(r.errors).toEqual([]);
  }, 60000);
});
