// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
vi.hoisted(() => { (window as unknown as { matchMedia: unknown }).matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); });
import { TwinProvider, useTwin, useIsTwin, useCompare } from '../src/scene/compare';
import { COMPARE_MEDIA } from '../src/scene/compareMedia';
import { MRI_STUDIES } from '../src/library/imaging/mriCatalog';
import { ecgAt } from '../src/heart/HeartECGSceneStrip';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { document.body.innerHTML = ''; useCompare.setState({ on: false, available: false }); vi.unstubAllGlobals(); });

function Probe() { const v = useTwin('heart.input', 'patient'); const twin = useIsTwin(); return <span>{`${v}|${twin}`}</span>; }
const mount = async (node: React.ReactNode) => { const el = document.createElement('div'); document.body.appendChild(el); await act(async () => { createRoot(el).render(node); }); return el; };

describe('Compare with normal', () => {
  it('a scene reads the live state, and the healthy one inside the twin', async () => {
    expect((await mount(<Probe />)).textContent).toBe('patient|false');
    expect((await mount(<TwinProvider state={{ 'heart.input': 'normal' }}><Probe /></TwinProvider>)).textContent).toBe('normal|true');
    expect((await mount(<TwinProvider state={{ other: 1 }}><Probe /></TwinProvider>)).textContent).toBe('patient|true');
  });
  it('every normal/abnormal pair points at a study that ships (or a verified MRI)', () => {
    const items = (JSON.parse(readFileSync(resolve(__dirname, '../../imaging/real/manifest.json'), 'utf8')).items as { id: string }[]).map((i) => i.id);
    const ids = new Set([...items, ...MRI_STUDIES.map((m) => m.id)]);
    const pairs = Object.values(COMPARE_MEDIA).flat();
    expect(pairs.length).toBeGreaterThan(10);
    for (const p of pairs) { expect(ids.has(p.normal), p.normal).toBe(true); expect(ids.has(p.abnormal), p.abnormal).toBe(true); expect(p.normal).not.toBe(p.abnormal); }
  });
});

describe('Heart monitor ECG', () => {
  it('draws real-looking leads: tall R in II and V6, negative QRS in aVR, rS in V1', () => {
    const peak = (lead: Parameters<typeof ecgAt>[0], sign: 1 | -1) => { let m = 0; for (let t = 0; t < 857; t++) m = Math.max(m, sign * ecgAt(lead, t, 70, true)); return m; };
    expect(peak('II', 1)).toBeGreaterThan(0.8); expect(peak('V6', 1)).toBeGreaterThan(0.8);
    expect(peak('aVR', -1)).toBeGreaterThan(peak('aVR', 1));
    expect(peak('V1', -1)).toBeGreaterThan(peak('V1', 1));
  });
  it('adds only a little artefact (baseline wander and noise stay under 0.1 mV)', () => {
    for (let t = 0; t < 5000; t += 37) expect(Math.abs(ecgAt('II', t, 70) - ecgAt('II', t, 70, true))).toBeLessThan(0.1);
  });
});
