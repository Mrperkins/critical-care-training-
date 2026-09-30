import { describe, it, expect } from 'vitest';
import { APNOEA_BY_ID, apnoeaCurve, safeApnoea } from '../src/physiology/apnoea';
import { compareAirways, resistanceRatio } from '../src/populations/airway';
import { NEO, neoTarget } from '../src/populations/neonatal';
import { solveShunt } from '../src/heart/shunt';
import { resolve } from '../src/director/timeline';
import { APNOEA_LESSON, PEDS_AIRWAY_LESSON, NEO_TRANSITION_LESSON, OB_GAS_LESSON, OB_CIRCULATION_LESSON } from '../src/director/lessons/populations';
import { usePopUI } from '../src/populations/popStore';
import { useHeartUI } from '../src/heart/heartStore';
import { lab } from '../src/abg/lab';
import { lines } from '../src/lines/session';
import { session } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';
import { useUI } from '../src/app/store';
import { shockIndex } from '../src/populations/obstetric';
import { ABG_ACTIONS } from '../src/scenarios/abgChallenges';
import { ABG_PRESET } from '../src/scenarios/abg';

describe('apnoea oxygen stores', () => {
  const t = (id: string, o = {}) => safeApnoea(APNOEA_BY_ID[id], o)!;
  it('times to SpO₂ < 90 % sit in the published ranges and in the right order', () => {
    expect(t('adult')).toBeGreaterThan(7); expect(t('adult')).toBeLessThan(10);
    expect(t('pregnant')).toBeGreaterThan(4); expect(t('pregnant')).toBeLessThan(6.5);
    expect(t('obese')).toBeGreaterThan(3); expect(t('obese')).toBeLessThan(5);
    expect(t('child')).toBeGreaterThan(2.2); expect(t('child')).toBeLessThan(3.8);
    expect(t('infant')).toBeGreaterThan(1.2); expect(t('infant')).toBeLessThan(2.4);
    expect(t('adult', { fao2: 0.14 })).toBeLessThan(1.5);
    expect(t('adult')).toBeGreaterThan(t('pregnant')); expect(t('pregnant')).toBeGreaterThan(t('obese')); expect(t('obese')).toBeGreaterThan(t('child')); expect(t('child')).toBeGreaterThan(t('infant'));
    expect(t('obese', { headUp: true })).toBeGreaterThan(t('obese'));
  });
  it('the curve is flat, then falls off a cliff', () => {
    const c = apnoeaCurve(APNOEA_BY_ID.adult, { minutes: 10 }); for (let i = 1; i < c.spo2.length; i++) expect(c.spo2[i]).toBeLessThanOrEqual(c.spo2[i - 1] + 1e-9);
    const at = (m: number) => c.spo2[Math.round(m * 30)]; expect(at(6)).toBeGreaterThan(0.97); expect(c.t70! - c.t90!).toBeLessThan(1.5);
  });
});

describe('paediatric airway', () => {
  it('1 mm of swelling: infant ×16 (×32 crying), adult ≈ ×3', () => {
    const [inf, ad] = compareAirways(1); expect(inf.laminar).toBeCloseTo(16, 6); expect(inf.turbulent).toBeCloseTo(32, 6); expect(ad.laminar).toBeCloseTo(3.16, 2);
    expect(resistanceRatio(8, 4)).toBe(16);
  });
  it('lesson: a smaller tube widens the peak–plateau gap on the same lungs', () => {
    const gap = (t: number) => { resolve(PEDS_AIRWAY_LESSON, t); const n = ventNumbers(session); return n.pip - n.pplat; };
    const g8 = gap(1), g7 = gap(53), g6 = gap(67);
    expect(g7).toBeGreaterThan(g8 * 1.3); expect(g6).toBeGreaterThan(g8 * 2.2); expect(useUI.getState().ventView).toBe('airway');
    resolve(PEDS_AIRWAY_LESSON, 28); expect(usePopUI.getState().airway.crying).toBe(true);
  });
});

describe('newborn transition', () => {
  it('fetal and PPHN states shunt right-to-left across the duct (hand > foot); first breaths reverse it; treatment closes the gap; atrial shunting lowers both', () => {
    const f = solveShunt(NEO.fetal), b = solveShunt(NEO.firstBreaths), p = solveShunt(NEO.pphn), w = solveShunt(NEO.pphnWorse), tx = solveShunt(NEO.pphnTreated), at = solveShunt(NEO.pphnAtrial);
    expect(f.sat.ao - f.sat.aoPost).toBeGreaterThan(0.15); expect(b.rl).toBe(0); expect(b.lr).toBeGreaterThan(0);
    expect(p.sat.ao - p.sat.aoPost).toBeGreaterThan(0.15); expect(w.sat.aoPost).toBeLessThan(p.sat.aoPost); expect(tx.sat.ao - tx.sat.aoPost).toBeLessThan(0.03);
    expect(at.sat.ao).toBeLessThan(0.9); expect(at.direction).toBe('R→L');
    expect(p.p.aoMean).toBeGreaterThan(30); expect(p.p.aoMean).toBeLessThan(50);
  });
  it('pre-ductal targets rise from ≈ 60 % at 1 min to 85–95 % at 10 min; the lesson drives the heart and the band', () => {
    expect(neoTarget(1)).toEqual({ min: 1, lo: 60, hi: 65 }); expect(neoTarget(3)).toMatchObject({ lo: 70, hi: 75 }); expect(neoTarget(7.5).lo).toBeCloseTo(82.5, 5);
    resolve(NEO_TRANSITION_LESSON, 30); expect(usePopUI.getState().neo.minute).toBe(5); expect(useHeartUI.getState().input.qs).toBe(0.6);
    resolve(NEO_TRANSITION_LESSON, 56); expect(useHeartUI.getState().input.pvr).toBe(NEO.pphn.pvr);
  });
});

describe('pregnancy', () => {
  it('the term gas is a compensated respiratory alkalosis; the pregnant asthmatic retains CO₂ at a “normal” value; treatment lowers it', () => {
    resolve(OB_GAS_LESSON, 12); const g = lab.snap; expect(g.paco2).toBeGreaterThan(28); expect(g.paco2).toBeLessThan(34); expect(g.hco3).toBeGreaterThan(18.5); expect(g.hco3).toBeLessThan(22); expect(g.pH).toBeGreaterThan(7.4); expect(g.pH).toBeLessThan(7.47); expect(lab.pt.p.hb).toBeLessThan(12);
    resolve(OB_GAS_LESSON, 50); expect(lab.snap.paco2).toBeGreaterThan(40); expect(lab.snap.pH).toBeLessThan(7.36);
    resolve(OB_GAS_LESSON, 65); expect(lab.snap.paco2).toBeLessThan(36);
    for (const id of ['pregnant', 'pregAsthma']) { expect(ABG_PRESET[id]).toBeTruthy(); expect(ABG_ACTIONS[id].options[ABG_ACTIONS[id].answer]).toBeTruthy(); }
  });
  it('supine hypotension reverses with displacement; PPH holds the pressure then decompensates; blood restores it', () => {
    const n = (t: number) => { resolve(OB_CIRCULATION_LESSON, t); return { ...lines.num }; };
    const base = n(1), sup = n(15), tilt = n(29), l1 = n(41), l2 = n(55), l3 = n(69), tx = n(81);
    expect(sup.tMap).toBeLessThan(base.tMap - 10); expect(tilt.tMap).toBeGreaterThan(sup.tMap + 10); expect(usePopUI.getState().ob.lossMl).toBe(1800);
    expect(l1.tSys).toBeGreaterThan(100); expect(shockIndex(l1.hr, l1.tSys)).toBeLessThan(1.1);
    expect(l2.tSys).toBeGreaterThan(80); expect(shockIndex(l2.hr, l2.tSys)).toBeGreaterThan(1.1);
    expect(l3.tSys).toBeLessThan(75); expect(tx.tMap).toBeGreaterThan(l2.tMap);
  });
});

describe('special-population lessons seek exactly', () => {
  it('apnoea card state and lab state are rebuilt on seek', () => {
    resolve(APNOEA_LESSON, 41); expect(usePopUI.getState().apnoea.highlight).toBe('pregnant'); expect(lab.preset.id).toBe('pregnant');
    resolve(APNOEA_LESSON, 2); expect(usePopUI.getState().apnoea.preox).toBe(false); resolve(APNOEA_LESSON, 94); expect(usePopUI.getState().apnoea.headUp).toBe(true);
    const a = (() => { resolve(OB_CIRCULATION_LESSON, 55); return lines.num.tMap; })(); resolve(OB_CIRCULATION_LESSON, 2); resolve(OB_CIRCULATION_LESSON, 55); expect(lines.num.tMap).toBeCloseTo(a, 6);
  });
});
