import { describe, it, expect } from 'vitest';
import { LinesSession, axisHeight } from '../src/lines/session';
import { SCENARIOS } from '../src/lines/hemo';
import { readFlush } from '../src/lines/transducer';

const s = new LinesSession();
const run = (sec: number) => { for (let i = 0; i < sec * 10; i++) s.tick(0.1); };
const snap = () => ({ ...s.num });

describe('arterial waveform physiology', () => {
  it('normal adult: radial ≈ 120/75, MAP = CVP + CO×SVR/80, radial systolic above aortic', () => {
    s.load('normal'); run(12); const n = snap();
    expect(n.sys).toBeGreaterThan(110); expect(n.sys).toBeLessThan(135);
    expect(n.dia).toBeGreaterThan(65); expect(n.dia).toBeLessThan(85);
    expect(Math.abs(n.map - s.snap.map)).toBeLessThan(4);
    expect(n.tSys).toBeGreaterThan(n.aoSys); // peripheral amplification
    expect(Math.abs(n.tMap - n.aoMap)).toBeLessThan(2); // mean preserved
  });
  it('every scenario settles to its engine MAP and a plausible pulse', () => {
    for (const sc of SCENARIOS) { s.load(sc.id); run(10); const n = snap(); expect(Math.abs(n.tMap - s.snap.map), sc.id).toBeLessThan(6); expect(n.pp, sc.id).toBeGreaterThan(10); }
  });
  it('hypovolaemia on PPV has a high pulse-pressure variation; cardiogenic shock does not', () => {
    s.load('hypovol'); run(14); const h = snap(); s.load('cardiogenic'); run(14); const c = snap();
    expect(h.ppv!).toBeGreaterThan(13); expect(c.ppv!).toBeLessThan(10);
  });
  it('a fluid bolus lowers PPV in a preload-responsive patient', () => {
    s.load('hypovol'); run(14); const before = snap().ppv!; s.fluid(); s.fluid(); s.fluid(); run(14); expect(snap().ppv!).toBeLessThan(before - 4);
  });
  it('tamponade gives pulsus paradoxus (> 10 mmHg) that pericardiocentesis removes', () => {
    s.load('tamponade'); run(14); expect(snap().spv!).toBeGreaterThan(10); s.pericardiocentesis(); run(30); expect(snap().spv!).toBeLessThan(9); expect(snap().cvpEE).toBeLessThan(10);
  });
  it('aortic regurgitation widens the pulse pressure; aortic stenosis narrows and slows it', () => {
    s.load('ar'); run(10); const ar = snap(); s.load('as'); run(10); const as = snap();
    expect(ar.pp).toBeGreaterThan(75); expect(ar.dia).toBeLessThan(45); expect(as.pp).toBeLessThan(ar.pp / 2);
  });
  it('norepinephrine raises MAP in vasodilatory shock', () => {
    s.load('sepsis'); run(10); const m0 = snap().map; s.setPressor(true); run(40); expect(snap().map).toBeGreaterThan(m0 + 12);
  });
});

describe('transducer: level, zero and damping', () => {
  it('10 cm below the axis reads +7.4 mmHg on both lines; levelling fixes it', () => {
    s.load('normal'); run(8); const t = snap(); s.setup.transH -= 10; run(8); const low = snap();
    expect(low.map - t.map).toBeGreaterThan(6.5); expect(low.map - t.map).toBeLessThan(8.5);
    expect(low.cvp - t.cvp).toBeGreaterThan(6.5); expect(low.cvp - t.cvp).toBeLessThan(8.5);
    s.levelToAxis(); run(8); expect(Math.abs(snap().map - t.map)).toBeLessThan(1.5);
  });
  it('raising the head of the bed moves the axis up: an unlevelled transducer then reads high', () => {
    expect(axisHeight(70, 45) - axisHeight(70, 0)).toBeGreaterThan(25);
  });
  it('zeroing open to air removes drift; zeroing open to the patient wipes out the pressure', () => {
    s.load('normal'); s.setFault('art', 'drift'); run(8); expect(snap().map - snap().tMap).toBeGreaterThan(7);
    s.setStopcock('art', 'air'); run(2); s.zero('art'); s.setStopcock('art', 'patient'); run(8); expect(Math.abs(snap().map - snap().tMap)).toBeLessThan(1.5);
    s.zero('art'); run(8); expect(snap().map).toBeLessThan(25);
  });
  it('underdamping overestimates systolic; overdamping underestimates it; MAP survives both', () => {
    s.load('normal'); run(8); const ok = snap();
    s.setFault('art', 'smallBubble'); run(10); const u = snap();
    s.setFault('art', 'largeBubble'); run(10); const o = snap();
    expect(u.sys - ok.sys).toBeGreaterThan(8); expect(o.sys - ok.sys).toBeLessThan(-6); expect(o.dia - ok.dia).toBeGreaterThan(2);
    expect(Math.abs(u.map - ok.map)).toBeLessThan(3); expect(Math.abs(o.map - ok.map)).toBeLessThan(3);
  });
  it('fast-flush test: optimal 1.5–2 oscillations, underdamped more, overdamped none', () => {
    const read = (f: Parameters<typeof s.setFault>[1]) => { s.load('normal'); s.setFault('art', f); run(3); s.flush('art'); run(2); return s.flushReading('art')!; };
    const ok = read('none'), u = read('longTubing'), o = read('clot');
    expect(ok.verdict).toBe('optimal'); expect(u.verdict).toBe('underdamped'); expect(o.verdict).toBe('overdamped');
    expect(ok.fn).toBeGreaterThan(18); expect(u.fn).toBeLessThan(10);
  });
  it('readFlush recovers fn and ζ from a synthetic ring-down', () => {
    const fn = 12, z = 0.2, w = 2 * Math.PI * fn, wd = w * Math.sqrt(1 - z * z); const cap: number[] = [], ideal: number[] = [];
    for (let i = 0; i < 600; i++) { const t = i / 1000; cap.push(200 * Math.exp(-z * w * t) * Math.cos(wd * t)); ideal.push(0); }
    const r = readFlush(cap, ideal)!; expect(Math.abs(r.fn - fn * Math.sqrt(1 - z * z))).toBeLessThan(1); expect(Math.abs(r.zeta - z)).toBeLessThan(0.05);
  });
  it('a CVP catheter in the RV shows a ventricular waveform', () => {
    s.load('normal'); s.setFault('cvp', 'migrated'); run(6); let mx = -99, mn = 99; for (let b = 0; b < 1000; b++) { const v = s.cvpD[s.at(b)]; mx = Math.max(mx, v); mn = Math.min(mn, v); }
    expect(mx).toBeGreaterThan(20); expect(mn).toBeLessThan(4);
  });
  it('complete heart block produces cannon a waves', () => {
    s.load('chb'); run(20); expect(s.atria.some((a) => a.cannon)).toBe(true);
  });
});

import { LINES_CASES, systemOK } from '../src/lines/cases';
import { LINES_LESSONS } from '../src/lines/lessons';
describe('lines content', () => {
  it('every lesson step references a real scenario', () => {
    for (const l of LINES_LESSONS) for (const st of l.steps) if (st.do.scenario) expect(SCENARIOS.some((x) => x.id === st.do.scenario), st.id).toBe(true);
  });
  it('every challenge has a valid answer and fix cases start broken', () => {
    for (const c of LINES_CASES) { expect(c.answer).toBeLessThan(c.options.length); expect(SCENARIOS.some((x) => x.id === c.setup.scenario)).toBe(true); }
  });
  it('fixing the classic faults restores a correct system', () => {
    s.load('normal'); s.setFault('art', 'clot'); expect(systemOK(s)).toBe(false);
    expect(s.act('art', 'flushForward').ok).toBe(false); expect(s.act('art', 'aspirate').ok).toBe(true); expect(systemOK(s)).toBe(true);
    s.setFault('art', 'lowBag'); s.act('art', 'inflateBag'); expect(s.art.bag).toBe(300); expect(systemOK(s)).toBe(true);
  });
});
