import { describe, it, expect } from 'vitest';
import { session } from '../src/vent/session';
import { lusFromVent, lusSummary, lusScene, renderMmode, LUS_W, LUS_D, type LusZone } from '../src/vent/lus';
import { renderLinear } from '../src/scene/ultrasound/bmode';

const zones = (id: string, prep?: () => void, secs = 10) => { session.load(id); prep?.(); for (let i = 0; i < secs * 20; i++) session.tick(0.05); return lusFromVent(session); };
const Z = (zs: LusZone[], id: string) => zs.find((z) => z.id === id)!;
/** texture variance below the pleura across time in the M-mode (seashore = grainy, barcode = straight lines) */
function belowPleuraColumnChange(z: LusZone) { const m = renderMmode(z, 120, 150); let diff = 0, n = 0; for (let j = 60; j < 140; j++) for (let i = 1; i < 60; i++) { diff += Math.abs(m.rgba[(j * 120 + i) * 4] - m.rgba[(j * 120 + i - 1) * 4]); n++; } return diff / n; }

describe('lung ultrasound from the vent state', () => {
  it('normal: sliding, A-lines, seashore in all four zones', () => {
    const zs = zones('normal'); for (const z of zs) { expect(z.sliding).toBe(true); expect(z.aLines).toBe(true); expect(z.bLines).toBeLessThan(3); expect(z.mmode).toBe('seashore'); }
    expect(lusSummary(zs).join(' ')).toMatch(/aerated lung/);
  });
  it('tension pneumothorax (R): no anterior sliding, barcode; left normal; the summary calls a pneumothorax', () => {
    const zs = zones('ptx'); const ra = Z(zs, 'R-ant');
    expect(ra.sliding).toBe(false); expect(ra.lungPulse).toBe(false); expect(ra.bLines).toBe(0); expect(ra.mmode).toBe('barcode'); expect(Z(zs, 'L-ant').sliding).toBe(true);
    expect(lusSummary(zs).join(' ')).toMatch(/Right: absent anterior sliding.*pneumothorax/);
    expect(belowPleuraColumnChange(ra)).toBeLessThan(belowPleuraColumnChange(Z(zs, 'L-ant')) * 0.5);
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
  it('the B-mode picture: B-lines are bright columns reaching the bottom; a pneumothorax shows none', () => {
    const img = (z: LusZone) => renderLinear(lusScene(z, 1), LUS_W, LUS_D, 120);
    const deepColumns = (z: LusZone) => { const r = img(z); let bright = 0; for (let i = 20; i < 100; i++) { let s = 0; for (let j = Math.round(r.h * 0.75); j < r.h; j++) s += r.rgba[(j * r.w + i) * 4]; if (s / (r.h * 0.25) > 110) bright++; } return bright; };
    const edema = Z(zones('edema'), 'R-lat'), ptx = Z(zones('ptx'), 'R-ant'); expect(deepColumns(edema)).toBeGreaterThan(deepColumns(ptx) + 3);
  });
});
