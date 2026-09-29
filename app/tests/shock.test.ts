import { describe, it, expect } from 'vitest';
import { resolve } from '../src/director/timeline';
import { SHOCK_STATES } from '../src/director/lessons/lines';
import { lines } from '../src/lines/session';
import { useLinesUI } from '../src/lines/linesStore';

const snap = (t: number) => { resolve(SHOCK_STATES, t); const n = lines.num; const co = (lines.circ.sv * lines.circ.hr) / 1000; return { map: n.map, pp: n.pp, dia: n.dia, cvp: n.cvp, hr: n.hr, ppv: n.ppv ?? 0, spv: n.spv ?? 0, co, svr: lines.pt.p.svr * (1 + 0.85 * lines.pressor) * (1 - 0.14 * lines.ino), view: useLinesUI.getState().view }; };

describe('shock-states lesson on the real Lines session', () => {
  const normal = snap(1), sep = snap(11), sepN = snap(23), card = snap(34), cardD = snap(46), tamp = snap(57), tampPara = snap(70), tampTap = snap(80), hypo = snap(91), hypoT = snap(104);
  it('distributive: low SVR and diastolic, relatively wide pulse pressure; norepinephrine raises MAP via SVR', () => {
    expect(sep.svr).toBeLessThan(normal.svr * 0.6); expect(sep.dia).toBeLessThan(normal.dia - 15); expect(sep.pp / sep.map).toBeGreaterThan(card.pp / card.map + 0.2);
    expect(sepN.map).toBeGreaterThan(sep.map + 10); expect(sepN.svr).toBeGreaterThan(sep.svr * 1.2); expect(Math.abs(sepN.hr - sep.hr) / sep.hr).toBeLessThan(0.08); expect(sep.view).toBe('wrist');
  });
  it('cardiogenic: low CO, narrow PP, high CVP; dobutamine raises CO and lowers SVR', () => {
    expect(card.co).toBeLessThan(normal.co * 0.7); expect(card.pp).toBeLessThan(normal.pp * 0.6); expect(card.cvp).toBeGreaterThan(normal.cvp + 8);
    expect(cardD.co).toBeGreaterThan(card.co * 1.2); expect(cardD.svr).toBeLessThan(card.svr); expect(card.view).toBe('heart');
  });
  it('tamponade: high CVP, pulsus paradoxus; pericardiocentesis restores preload and output', () => {
    expect(tamp.cvp).toBeGreaterThan(normal.cvp + 8); expect(tampPara.spv).toBeGreaterThan(10); expect(tamp.co).toBeLessThan(normal.co * 0.75);
    expect(tampTap.cvp).toBeLessThan(tamp.cvp - 6); expect(tampTap.co).toBeGreaterThan(tamp.co * 1.3); expect(tampTap.spv).toBeLessThan(tampPara.spv);
  });
  it('hypovolaemic: low CVP, narrow PP, high PPV on the ventilator; volume + blood reverse it', () => {
    expect(hypo.cvp).toBeLessThan(normal.cvp); expect(hypo.pp).toBeLessThan(normal.pp * 0.6); expect(hypo.ppv).toBeGreaterThan(13);
    expect(hypoT.map).toBeGreaterThan(hypo.map + 8); expect(hypoT.ppv).toBeLessThan(hypo.ppv); expect(hypoT.hr).toBeLessThan(hypo.hr); expect(lines.pt.p.hb).toBeGreaterThan(0);
  });
  it('seeks deterministically', () => { const a = snap(46); snap(91); const b = snap(46); expect(b.map).toBeCloseTo(a.map, 9); expect(b.cvp).toBeCloseTo(a.cvp, 9); });
});
