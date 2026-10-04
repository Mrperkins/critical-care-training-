import { describe, it, expect } from 'vitest';
import { needlePath, NEEDLE_DEFAULT, type NeedleInput } from '../src/procedures/needle';
import { NEEDLE_LESSON } from '../src/director/lessons/needle';
import { resolve } from '../src/director/timeline';
import { useNeedle, setNeedle, insertNeedle } from '../src/procedures/needleStore';
import { session } from '../src/vent/session';
import { ventNumbers } from '../src/vent/numbers';

const N = (p: Partial<NeedleInput>) => needlePath({ ...NEEDLE_DEFAULT, ...p });
const state = () => ({ ...ventNumbers(session), tension: +session.m.lung.tension.toFixed(4), n: JSON.stringify(useNeedle.getState()) });

describe('needle thoracostomy chest-wall model (pure)', () => {
  it('layers run skin → fat → muscle → intercostals → parietal pleura → pleural space → lung, contiguous', () => {
    const r = N({}); expect(r.layers.map((l) => l.id)).toEqual(['skin', 'fat', 'muscle', 'intercostal', 'pleura', 'space', 'lung']);
    r.layers.slice(1).forEach((l, i) => expect(l.from).toBeCloseTo(r.layers[i].to, 9));
    expect(r.wall).toBeCloseTo(r.layers.find((l) => l.id === 'pleura')!.to, 9);
  });
  it('anterior 2nd ICS MCL is thicker than the lateral 4–5th ICS; habitus scales the wall', () => {
    expect(N({ site: '2ics-mcl' }).wall).toBeGreaterThan(N({ site: '45ics-aal' }).wall);
    expect(N({ habitus: 'obese' }).wall).toBeGreaterThan(N({}).wall); expect(N({ habitus: 'thin' }).wall).toBeLessThan(N({}).wall);
  });
  it('a 5 cm catheter anteriorly in an obese patient is short; 8 cm laterally decompresses', () => {
    const s = N({ site: '2ics-mcl', habitus: 'obese', length: 5 }); expect(s.outcome).toBe('short'); expect(s.margin).toBeLessThan(0); expect(s.summary).toMatch(/short/);
    const ok = N({ site: '45ics-aal', length: 8 }); expect(ok.outcome).toBe('decompressed'); expect(ok.injuries).toEqual([]); expect(ok.lungRisk).toBe(false);
  });
  it('angling lengthens the path (less depth); under the upper rib, parasternal and low sites name their injuries; on the rib meets bone', () => {
    expect(N({ angle: 45, stopAtAir: false }).depth).toBeLessThan(N({ angle: 0, stopAtAir: false }).depth);
    expect(N({ site: '45ics-aal', habitus: 'obese', length: 5, angle: 0 }).outcome).toBe('short');
    expect(N({ rib: 'underUpper' }).injuries.join(' ')).toMatch(/Intercostal artery/);
    expect(N({ site: 'parasternal' }).injuries.join(' ')).toMatch(/internal thoracic/i);
    expect(N({ site: 'low' }).injuries.join(' ')).toMatch(/liver|spleen/);
    expect(N({ rib: 'midRib' }).outcome).toBe('rib');
  });
  it('advancing to the hub goes past the air into the lung; without tension the lung is at risk as soon as the pleura is crossed', () => {
    expect(N({ stopAtAir: false }).lungRisk).toBe(true); expect(N({ stopAtAir: true }).lungRisk).toBe(false);
    const nt = N({ tension: false }); expect(nt.outcome).toBe('noTension'); expect(nt.lungRisk).toBe(true);
  });
});

describe('insertion drives the real vent patient', () => {
  const run = (s: number) => { for (let i = 0; i < s * 20; i++) session.tick(0.05); return { ...ventNumbers(session), tension: session.m.lung.tension }; };
  it('a short needle changes nothing; a needle that reaches the air decompresses', () => {
    session.load('ptx'); const base = run(10);
    setNeedle({ site: '2ics-mcl', habitus: 'obese', length: 5 }); insertNeedle(); const short = run(12);
    expect(session.decompT).toBe(-1); expect(short.tension).toBeCloseTo(base.tension, 3);
    setNeedle({ site: '45ics-aal', habitus: 'average', length: 8 }); insertNeedle(); const ok = run(14);
    expect(ok.tension).toBeLessThan(0.5); expect(ok.pip).toBeLessThan(base.pip); expect(ok.map).toBeGreaterThan(base.map + 10);
  });
});

describe('needle lesson', () => {
  it('only the decompression cues relieve tension; seek is exact', () => {
    const at = (t: number) => { resolve(NEEDLE_LESSON, t); return state(); };
    const c = Object.fromEntries(NEEDLE_LESSON.cues.map((q) => [q.id, q.at + 1]));
    const short = at(c['nd-4']), ok = at(c['nd-5']), rib = at(c['nd-3']);
    expect(short.tension).toBeGreaterThan(3); expect(ok.tension).toBeLessThan(0.5); expect(ok.map).toBeGreaterThan(short.map);
    expect(rib.tension).toBeLessThan(0.5); // under the rib still reaches the pleura (decompresses) — but names the bundle injury
    expect(needlePath(useNeedle.getState().input).injuries.length).toBeGreaterThan(0);
    const a = at(c['nd-5']); at(c['nd-2']); const b = at(c['nd-5']); expect(b).toEqual(a);
  });
});
