import { describe, it, expect } from 'vitest';
import { session } from '../src/vent/session';
import { cxrFromVent, renderCxr, cxrFindings, geometry, type CxrState } from '../src/vent/cxr';

const W = 160;
function film(id: string, prep?: () => void, secs = 10) { session.load(id); prep?.(); for (let i = 0; i < secs * 20; i++) session.tick(0.05); const st = cxrFromVent(session); return { st, img: renderCxr(st, W) }; }
/** mean and SD of brightness in a box (x −1…1, image-left = patient right; y 0…1) */
function box(img: ReturnType<typeof renderCxr>, x0: number, x1: number, y0: number, y1: number) {
  const v: number[] = []; for (let j = 0; j < img.h; j++) for (let i = 0; i < img.w; i++) { const x = ((i + 0.5) / img.w) * 2 - 1, y = (j + 0.5) / img.h; if (x >= x0 && x <= x1 && y >= y0 && y <= y1) v.push(img.rgba[(j * img.w + i) * 4]); }
  const m = v.reduce((a, b) => a + b, 0) / v.length; return { m, sd: Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length) };
}
const RLAT = [-0.78, -0.62, 0.28, 0.5] as const, LLAT = [0.62, 0.78, 0.28, 0.5] as const, RMID = [-0.6, -0.3, 0.2, 0.45] as const, LMID = [0.3, 0.6, 0.2, 0.45] as const;
const has = (st: CxrState, re: RegExp) => cxrFindings(st).some((l) => re.test(l));

describe('chest X-ray from the vent session', () => {
  const normal = film('normal');
  it('normal: symmetric clear lungs, midline mediastinum, ETT above the carina', () => {
    expect(Math.abs(box(normal.img, ...RMID).m - box(normal.img, ...LMID).m)).toBeLessThan(12);
    expect(Math.abs(geometry(normal.st).shift)).toBeLessThan(0.01); expect(has(normal.st, /Clear lungs/)).toBe(true); expect(has(normal.st, /above the carina/)).toBe(true);
  });
  it('tension pneumothorax (R): hyperlucent periphery without markings, shift to the LEFT, depressed right dome; decompression + drain reverses it', () => {
    const t = film('ptx'); const g = geometry(t.st), g0 = geometry(normal.st);
    const lat = box(t.img, ...RLAT), lat0 = box(normal.img, ...RLAT);
    expect(lat.m).toBeLessThan(lat0.m - 5);
    expect(g.shift).toBeGreaterThan(0.1); expect(g.dome[0].base).toBeGreaterThan(g0.dome[0].base);
    expect(has(t.st, /Right pneumothorax/)).toBe(true); expect(has(t.st, /shifted to the left.*tension/)).toBe(true);
    const d = film('ptx', () => { session.intervene('decompress'); session.intervene('chestTube'); }, 16);
    expect(Math.abs(geometry(d.st).shift)).toBeLessThan(0.02); expect(d.st.side[0].ptx).toBeLessThan(0.05); expect(d.st.drain).toBe(true);
    expect(box(d.img, ...RLAT).m).toBeGreaterThan(lat.m + 3); expect(has(d.st, /chest drain/)).toBe(true);
  });
  it('right main bronchus plug: white right lung, volume loss (right dome up) and shift toward the RIGHT; bronchoscopy clears it', () => {
    const p = film('plug'); const g = geometry(p.st), g0 = geometry(normal.st);
    expect(box(p.img, ...RMID).m).toBeGreaterThan(box(p.img, ...LMID).m + 40); expect(g.shift).toBeLessThan(-0.1); expect(g.dome[0].base).toBeLessThan(g0.dome[0].base - 0.05);
    expect(has(p.st, /Right lung collapse/)).toBe(true);
    const b = film('plug', () => session.intervene('bronchoscopy'), 8); expect(b.st.side[0].atelectasis).toBeLessThan(0.05);
  });
  it('pulmonary oedema: perihilar opacity, big heart, effusions', () => {
    const e = film('edema'); expect(box(e.img, -0.4, -0.2, 0.36, 0.5).m).toBeGreaterThan(box(normal.img, -0.4, -0.2, 0.36, 0.5).m + 15);
    expect(e.st.ctr).toBeGreaterThan(0.55); expect(has(e.st, /bat-wing/)).toBe(true); expect(has(e.st, /effusion/)).toBe(true);
  });
  it('ARDS: bilateral opacities that clear as PEEP recruits the lung', () => {
    const lo = film('ards', () => session.set({ peep: 5 }), 14), hi = film('ards', () => session.set({ peep: 18 }), 14);
    const bothLo = (box(lo.img, ...RMID).m + box(lo.img, ...LMID).m) / 2, bothHi = (box(hi.img, ...RMID).m + box(hi.img, ...LMID).m) / 2;
    expect(bothLo).toBeGreaterThan(box(normal.img, ...RMID).m + 20); expect(bothHi).toBeLessThan(bothLo - 5);
    expect(has(lo.st, /ARDS pattern/)).toBe(true);
  });
  it('asthma: hyperinflated — low flat domes, darker lungs, narrow heart', () => {
    const a = film('asthma'); expect(geometry(a.st).dome[0].base).toBeGreaterThan(geometry(normal.st).dome[0].base + 0.02);
    expect(a.st.ctr).toBeLessThan(normal.st.ctr); expect(box(a.img, ...LMID).m).toBeLessThan(box(normal.img, ...LMID).m); expect(has(a.st, /Hyperinflated/)).toBe(true);
  });
  it('deterministic: the same state renders identically', () => {
    const a = renderCxr(normal.st, 90), b = renderCxr(JSON.parse(JSON.stringify(normal.st)), 90); expect(Buffer.from(a.rgba).equals(Buffer.from(b.rgba))).toBe(true);
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
