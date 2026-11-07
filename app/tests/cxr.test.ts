import { describe, it, expect } from 'vitest';
import { session } from '../src/vent/session';
import { cxrFromVent, cxrFindings, geometry, type CxrState } from '../src/vent/cxr';
import { cxrKeys } from '../src/vent/CxrScene';

function film(id: string, prep?: () => void, secs = 10) { session.load(id); prep?.(); for (let i = 0; i < secs * 20; i++) session.tick(0.05); const st = cxrFromVent(session); return { st, keys: cxrKeys(st) }; }
const opac = (st: CxrState) => (st.side[0].opacity + st.side[1].opacity) / 2;
const has = (st: CxrState, re: RegExp) => cxrFindings(st).some((l) => re.test(l));

describe('chest X-ray from the vent session', () => {
  const normal = film('normal');
  it('normal: symmetric clear lungs, midline mediastinum, ETT above the carina', () => {
    expect(Math.abs(normal.st.side[0].opacity - normal.st.side[1].opacity)).toBeLessThan(0.05); expect(normal.keys[0]).toBe('cxr_normal');
    expect(Math.abs(geometry(normal.st).shift)).toBeLessThan(0.01); expect(has(normal.st, /Clear lungs/)).toBe(true); expect(has(normal.st, /above the carina/)).toBe(true);
  });
  it('tension pneumothorax (R): hyperlucent periphery without markings, shift to the LEFT, depressed right dome; decompression + drain reverses it', () => {
    const t = film('ptx'); const g = geometry(t.st), g0 = geometry(normal.st);
    expect(t.keys.slice(0, 3)).toEqual(['tension_ptx', 'ptx', 'ptx_right']);
    expect(g.shift).toBeGreaterThan(0.1); expect(g.dome[0].base).toBeGreaterThan(g0.dome[0].base);
    expect(has(t.st, /Right pneumothorax/)).toBe(true); expect(has(t.st, /shifted to the left.*tension/)).toBe(true);
    const d = film('ptx', () => { session.intervene('decompress'); session.intervene('chestTube'); }, 16);
    expect(Math.abs(geometry(d.st).shift)).toBeLessThan(0.02); expect(d.st.side[0].ptx).toBeLessThan(0.05); expect(d.st.drain).toBe(true);
    expect(d.keys).toContain('chest_tube'); expect(d.keys).not.toContain('tension_ptx'); expect(has(d.st, /chest drain/)).toBe(true);
  });
  it('right main bronchus plug: white right lung, volume loss (right dome up) and shift toward the RIGHT; bronchoscopy clears it', () => {
    const p = film('plug'); const g = geometry(p.st), g0 = geometry(normal.st);
    expect(p.st.side[0].atelectasis).toBeGreaterThan(p.st.side[1].atelectasis + 0.3); expect(p.keys).toContain('collapse_right'); expect(g.shift).toBeLessThan(-0.1); expect(g.dome[0].base).toBeLessThan(g0.dome[0].base - 0.05);
    expect(has(p.st, /Right lung collapse/)).toBe(true);
    const b = film('plug', () => session.intervene('bronchoscopy'), 8); expect(b.st.side[0].atelectasis).toBeLessThan(0.05);
  });
  it('pulmonary oedema: perihilar opacity, big heart, effusions', () => {
    const e = film('edema'); expect(e.st.edema).toBeGreaterThan(0); expect(e.keys).toContain('pulmonary_edema');
    expect(e.st.ctr).toBeGreaterThan(0.55); expect(has(e.st, /bat-wing/)).toBe(true); expect(has(e.st, /effusion/)).toBe(true);
  });
  it('ARDS: bilateral opacities that clear as PEEP recruits the lung', () => {
    const lo = film('ards', () => session.set({ peep: 5 }), 14), hi = film('ards', () => session.set({ peep: 18 }), 14);
    expect(opac(lo.st)).toBeGreaterThan(opac(normal.st) + 0.2); expect(opac(hi.st)).toBeLessThan(opac(lo.st) - 0.05); expect(lo.keys).toContain('ards');
    expect(has(lo.st, /ARDS pattern/)).toBe(true);
  });
  it('asthma: hyperinflated — low flat domes, darker lungs, narrow heart', () => {
    const a = film('asthma'); expect(geometry(a.st).dome[0].base).toBeGreaterThan(geometry(normal.st).dome[0].base + 0.02);
    expect(a.st.ctr).toBeLessThan(normal.st.ctr); expect(a.keys).toContain('hyperinflation'); expect(has(a.st, /Hyperinflated/)).toBe(true);
  });
  it('mainstem intubation asks for a real film of a tube in the right main bronchus', () => {
    const m = film('mainstem', undefined, 30); expect(m.keys[0]).toBe('mainstem_right');
  });
});

import { VentSession } from '../src/vent/session';
import { lusFromVent } from '../src/vent/lus';
import { ventNumbers } from '../src/vent/numbers';
import { resolve as resolveTl } from '../src/director/timeline';
import { ARDS_SIGNATURE, COMPLIANCE_VS_RESISTANCE } from '../src/director/lessons/vent';
import { session as liveSession } from '../src/vent/session';
import { useUI as ui } from '../src/app/store';
describe('right mainstem intubation', () => {
  it('left lung excluded: plateau up, shunt, film shows the tip below the carina and left collapse, ultrasound shows a left lung pulse; withdrawing fixes it', () => {
    const S = new VentSession('mainstem'); for (let i = 0; i < 600; i++) S.tick(0.05); const n = ventNumbers(S);
    const N = new VentSession('normal'); for (let i = 0; i < 600; i++) N.tick(0.05); const q = ventNumbers(N);
    expect(n.pplat).toBeGreaterThan(q.pplat + 2.5); expect(S.snap.spo2).toBeLessThan(N.snap.spo2 - 0.04);
    const st = cxrFromVent(S); expect(st.ett!.aboveCarinaCm).toBeLessThan(0); expect(st.side[1].atelectasis).toBeGreaterThan(0.5);
    const z = lusFromVent(S); expect(z.find((x) => x.id === 'L-ant')!.lungPulse).toBe(true); expect(z.find((x) => x.id === 'R-ant')!.sliding).toBe(true);
    S.intervene('withdrawTube'); for (let i = 0; i < 600; i++) S.tick(0.05); expect(cxrFromVent(S).ett!.aboveCarinaCm).toBeGreaterThan(0); expect(S.snap.spo2).toBeGreaterThan(0.97);
  });
  it('ARDS lessons: film and probe clear as PEEP recruits; asthma film is hyperinflated with A-lines', () => {
    resolveTl(ARDS_SIGNATURE, 78); const a5 = cxrFromVent(liveSession).side[0].opacity; expect(ui.getState().ventView).toBe('xray');
    resolveTl(ARDS_SIGNATURE, 91); const a16 = cxrFromVent(liveSession).side[0].opacity; expect(a16).toBeLessThan(a5 - 0.2);
    resolveTl(ARDS_SIGNATURE, 104); const b5 = lusFromVent(liveSession).find((z) => z.id === 'R-lat')!.bLines; resolveTl(ARDS_SIGNATURE, 117); const b16 = lusFromVent(liveSession).find((z) => z.id === 'R-lat')!.bLines; expect(b16).toBeLessThan(b5); expect(ui.getState().ventView).toBe('lus');
    resolveTl(COMPLIANCE_VS_RESISTANCE, 75); expect(cxrFromVent(liveSession).hyperinflation).toBeGreaterThan(0.2); resolveTl(COMPLIANCE_VS_RESISTANCE, 88); expect(lusFromVent(liveSession).every((z) => z.aLines && z.sliding)).toBe(true);
  });
});
