import { describe, it, expect } from 'vitest';
import { drainView, clampTest, DRAIN_DEFAULT, DRAIN_CASES, caseConfig, type DrainConfig, type PleuralSample } from '../src/workflows/chestDrain';
import { CHEST_DRAIN_CHECK } from '../src/workflows/chestTube';
import { evaluate } from '../src/workflows/workflow';
import { useDrain } from '../src/workflows/drainStore';
import { session } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';

const cfg = (p: Partial<DrainConfig> = {}): DrainConfig => ({ ...DRAIN_DEFAULT, ...p });
/** pleural samples from the REAL vent session over a few breaths */
function pleuralTrace(secs = 8) { const ps: number[] = []; for (let i = 0; i < secs * 20; i++) { session.tick(0.05); ps.push(session.pleural()); } return ps; }
const sample = (ps: number[], p: number): PleuralSample => ({ p, lo: Math.min(...ps), hi: Math.max(...ps) });
const run = (secs: number) => { for (let i = 0; i < secs * 20; i++) session.tick(0.05); return { ...ventNumbers(session), tension: session.m.lung.tension }; };

describe('chest drain reading (pure) on the patient’s pleural pressure', () => {
  session.load('ptx'); session.intervene('decompress'); session.intervene('chestTube'); run(12);
  const ps = pleuralTrace(); const hi = sample(ps, Math.max(...ps)), lo = sample(ps, Math.min(...ps));

  it('positive pressure: the pleural pressure swings and the water-seal column FALLS in inspiration', () => {
    expect(hi.hi - hi.lo).toBeGreaterThan(1);
    const up = drainView(cfg(), hi), down = drainView(cfg(), lo);
    expect(up.swing).toBeGreaterThanOrEqual(0.8); expect(up.level).toBeLessThan(0); expect(down.level).toBeGreaterThan(0);
    expect(up.patent).toBe(true); expect(up.findings.join(' ')).toMatch(/Tidaling/);
  });
  it('kink / clamp: no swing, no drainage, and a leaking lung is flagged for tension', () => {
    for (const k of [{ kink: true }, { clamped: true }, { clot: true }]) {
      const v = drainView(cfg({ ...k, leak: 2, fluid: 'serous', rateMlH: 40 }), hi);
      expect(v.swing).toBe(0); expect(v.rate).toBe(0); expect(v.bubbling).toBe('none'); expect(v.tensionRisk).toBe(true);
    }
    expect(drainView(cfg({ kink: true, leak: 0 }), hi).tensionRisk).toBe(false);
  });
  it('suction damps tidaling and turns a patient leak continuous; vigorous source is flagged', () => {
    const off = drainView(cfg({ leak: 1 }), hi), on = drainView(cfg({ leak: 1, suction: true }), hi);
    expect(on.swing).toBeLessThan(off.swing * 0.5); expect(off.bubbling).toBe('every breath'); expect(on.bubbling).toBe('continuous');
    expect(drainView(cfg({ suction: true, source: 0.95 }), hi).suctionChamber).toBe('vigorous');
    expect(drainView(cfg({ suction: true, source: 0.4 }), hi).suctionChamber).toBe('gentle');
  });
  it('a fluid-filled dependent loop slows drainage and absorbs the swing; re-expansion quietens tidaling', () => {
    const a = drainView(cfg({ fluid: 'blood', rateMlH: 100 }), hi), b = drainView(cfg({ fluid: 'blood', rateMlH: 100, loopMl: 90 }), hi);
    expect(b.rate).toBeLessThan(a.rate * 0.5); expect(b.swing).toBeLessThan(a.swing);
    expect(drainView(cfg({ expanded: 1 }), hi).swing).toBeLessThan(drainView(cfg({ expanded: 0 }), hi).swing * 0.5);
  });
  it('bubbling pattern: continuous leak and a side hole out; spontaneous small leak only with breaths', () => {
    expect(drainView(cfg({ leak: 3 }), hi).bubbling).toBe('continuous');
    const s = drainView(cfg({ leak: 1, sideHoleOut: true }), hi); expect(s.bubbling).toBe('continuous'); expect(s.subcutEmphysema).toBe(true);
    expect(drainView(cfg({ leak: 1, ppv: false }), hi).bubbling).toBe('with breaths');
    expect(drainView(cfg({ leak: 2 }), lo).bubblingNow).toBe(false); expect(drainView(cfg({ leak: 2 }), hi).bubblingNow).toBe(true);
  });
  it('clamp test separates patient from system leaks; haemothorax thresholds; unit above chest siphons', () => {
    expect(clampTest(cfg({ leak: 2 }), 'chest').bubblingStops).toBe(true);
    expect(clampTest(cfg({ leak: 1, leakSource: 'system' }), 'chest').bubblingStops).toBe(false);
    expect(drainView(cfg({ leak: 1, leakSource: 'system', clamped: true }), hi).bubbling).toBe('none');
    expect(drainView(cfg({ fluid: 'blood', initialMl: 1600, hours: 0 }), hi).surgical).toBe(true);
    expect(drainView(cfg({ fluid: 'blood', initialMl: 300, rateMlH: 220, hours: 3 }), hi).surgical).toBe(true);
    expect(drainView(cfg({ fluid: 'blood', initialMl: 300, rateMlH: 60, hours: 3 }), hi).surgical).toBe(false);
    expect(drainView(cfg({ unitHigh: true, initialMl: 200 }), hi).siphonBack).toBe(true);
  });
  it('every assessment case is answerable and its model reading supports the answer', () => {
    for (const k of DRAIN_CASES) {
      expect(k.options.map((o) => o.id)).toContain(k.answer);
      const v = drainView(caseConfig(k), hi);
      if (k.answer === 'unkink') expect(v.patent).toBe(false);
      if (k.answer === 'surgeon') expect(v.surgical).toBe(true);
      if (k.answer === 'lower') expect(v.siphonBack).toBe(true);
      if (k.answer === 'source') expect(v.suctionChamber).toBe('vigorous');
      if (k.answer === 'loop') expect(v.rate).toBeLessThan(caseConfig(k).rateMlH);
      if (k.answer === 'leakCheck') expect(clampTest(caseConfig(k), 'chest').bubblingStops).toBe(false);
      if (k.answer === 'site') expect(v.subcutEmphysema).toBe(true);
      expect(v.findings.length).toBeGreaterThan(0);
    }
  });
});

describe('drain-check workflow drives the real vent session', () => {
  it('the hidden kink lets tension re-accumulate; tracing the tubing relieves it; clamping brings it back', () => {
    CHEST_DRAIN_CHECK.setup(); const kinked = run(20);
    expect(useDrain.getState().cfg.kink).toBe(true); expect(session.drainBlocked).toBe(true);
    expect(kinked.tension).toBeGreaterThan(3);
    CHEST_DRAIN_CHECK.effects!.tubing(); const fixed = run(12);
    expect(fixed.tension).toBeLessThan(0.5); expect(fixed.pip).toBeLessThan(kinked.pip); expect(fixed.map).toBeGreaterThan(kinked.map);
    CHEST_DRAIN_CHECK.effects!.clamp(); const clamped = run(20);
    expect(clamped.tension).toBeGreaterThan(3); expect(clamped.pip).toBeGreaterThan(fixed.pip);
  });
  it('scores: the right sequence is 100; clamping and lifting the unit are harmful', () => {
    expect(evaluate(CHEST_DRAIN_CHECK, CHEST_DRAIN_CHECK.steps.map((s) => s.id), true).score).toBe(100);
    const r = evaluate(CHEST_DRAIN_CHECK, ['patient', 'clamp', 'bed'], true); expect(r.harmful).toEqual(['clamp', 'bed']); expect(r.criticalMissing).toContain('tubing');
  });
  it('a reload clears the drain occlusion', () => { session.setDrainBlocked(true); session.load('normal'); expect(session.drainBlocked).toBe(false); expect(session.reTension).toBe(0); });
});

describe('low-pressure alarm on the real vent session', () => {
  it('disconnection: peak pressure ~0, nothing exhaled, PEEP lost; reconnect restores; a cuff leak leaves an inspired–exhaled gap', async () => {
    const { LOW_PRESSURE } = await import('../src/workflows/chestTube');
    session.load('ards'); session.set({ peep: 12, vt: 0.42 }); const base = run(12); const baseOpen = base.openFrac;
    LOW_PRESSURE.setup(); const disc = run(12); const last = session.m.history[session.m.history.length - 1];
    expect(disc.pip).toBeLessThan(4); expect(disc.vte).toBeLessThan(40); expect(disc.openFrac).toBeLessThan(baseOpen); expect(last.vti).toBeGreaterThan(0.3);
    LOW_PRESSURE.effects!.trace(); const leak = run(12); const lb = session.m.history[session.m.history.length - 1];
    expect(session.circuitFault).toBe('cuffLeak'); expect(leak.pip).toBeGreaterThan(20); expect(lb.vti - lb.vte).toBeGreaterThan(0.08);
    LOW_PRESSURE.effects!.cuff(); const ok = run(12); const ob = session.m.history[session.m.history.length - 1];
    expect(session.circuitFault).toBe('none'); expect(Math.abs(ob.vti - ob.vte)).toBeLessThan(0.03); expect(ok.vte).toBeGreaterThan(380);
  });
  it('ventilation falls to ~0 while disconnected, so CO₂ climbs on the shared patient', () => {
    session.load('normal'); run(8); const before = session.snap.paco2; session.circuit('disconnect'); run(30); session.fastForward(4);
    expect(session.snap.paco2).toBeGreaterThan(before + 8); session.circuit('none');
  });
});
