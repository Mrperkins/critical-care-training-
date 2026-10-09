import { describe, it, expect } from 'vitest';
import { session } from '../src/vent/session';
import { lusFromVent, lusSummary, type LusZone } from '../src/vent/lus';
import { lusKeys } from '../src/vent/LusScene';

const zones = (id: string, prep?: () => void, secs = 10) => { session.load(id); prep?.(); for (let i = 0; i < secs * 20; i++) session.tick(0.05); return lusFromVent(session); };
const Z = (zs: LusZone[], id: string) => zs.find((z) => z.id === id)!;

describe('lung ultrasound from the vent state', () => {
  it('normal: sliding, A-lines, seashore in all four zones', () => {
    const zs = zones('normal'); for (const z of zs) { expect(z.sliding).toBe(true); expect(z.aLines).toBe(true); expect(z.bLines).toBeLessThan(3); expect(z.mmode).toBe('seashore'); }
    expect(lusSummary(zs).join(' ')).toMatch(/aerated lung/);
  });
  it('tension pneumothorax (R): no anterior sliding, barcode; left normal; the summary calls a pneumothorax', () => {
    const zs = zones('ptx'); const ra = Z(zs, 'R-ant');
    expect(ra.sliding).toBe(false); expect(ra.lungPulse).toBe(false); expect(ra.bLines).toBe(0); expect(ra.mmode).toBe('barcode'); expect(Z(zs, 'L-ant').sliding).toBe(true);
    expect(lusSummary(zs).join(' ')).toMatch(/Right: absent anterior sliding.*pneumothorax/);
    expect(ra.mmode).toBe('barcode'); expect(Z(zs, 'L-ant').mmode).toBe('seashore');
  });
  it('after needle decompression a small residual pneumothorax gives a lung point laterally; after the drain the lung is back', () => {
    const n = zones('ptx', () => session.intervene('decompress'), 14); expect(Z(n, 'R-lat').lungPoint).toBe(true); expect(Z(n, 'R-lat').mmode).toBe('barcode + lung point');
    const d = zones('ptx', () => { session.intervene('decompress'); session.intervene('chestTube'); }, 16); expect(Z(d, 'R-ant').sliding).toBe(true); expect(Z(d, 'R-lat').lungPoint).toBe(false);
  });
  it('plugged right main bronchus: no sliding but a lung pulse and consolidation — NOT called a pneumothorax', () => {
    const zs = zones('plug'); const ra = Z(zs, 'R-ant'); expect(ra.sliding).toBe(false); expect(ra.lungPulse).toBe(true); expect(ra.consolidation).toBeGreaterThan(0.5);
    const s = lusSummary(zs).join(' '); expect(s).toMatch(/lung pulse/); expect(s).not.toMatch(/Right: absent anterior sliding/);
  });
  it('pulmonary oedema: B-lines everywhere, worse laterally, effusions', () => {
    const zs = zones('edema'); for (const z of zs) expect(z.bLines).toBeGreaterThanOrEqual(3); expect(Z(zs, 'R-lat').bLines).toBeGreaterThanOrEqual(Z(zs, 'R-ant').bLines); expect(Z(zs, 'R-lat').effusion).toBeGreaterThan(0.2);
    expect(lusSummary(zs).join(' ')).toMatch(/interstitial syndrome/);
  });
  it('ARDS: B-lines and dependent consolidation that improve when PEEP recruits the lung', () => {
    const lo = zones('ards', () => session.set({ peep: 5 }), 14), hi = zones('ards', () => session.set({ peep: 18 }), 14);
    const sum = (zs: LusZone[]) => zs.reduce((a, z) => a + z.bLines + 5 * z.consolidation, 0);
    expect(Z(lo, 'R-lat').consolidation).toBeGreaterThan(0.3); expect(sum(hi)).toBeLessThan(sum(lo));
  });
  it('each zone asks for the real clip of its own pattern', () => {
    const edema = Z(zones('edema'), 'R-lat'), ptx = Z(zones('ptx'), 'R-ant'), n = Z(zones('normal'), 'R-ant'), plug = Z(zones('plug'), 'R-ant');
    expect(lusKeys(n)[0]).toBe('alines'); expect(lusKeys(ptx)[0]).toBe('absent_sliding'); expect(lusKeys(plug)[0]).toBe('lung_pulse');
    expect(['blines', 'whitelung', 'pleural_effusion']).toContain(lusKeys(edema)[0]);
  });

});
