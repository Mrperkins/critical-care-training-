// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.hoisted(() => { (window as unknown as { matchMedia: unknown }).matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); });
import { declutter } from '../src/scene/labels';

const rect = (x: number, y: number, w: number, h: number) => ({ left: x, top: y, right: x + w, bottom: y + h, width: w, height: h, x, y, toJSON() {} }) as DOMRect;
function box(cls: string, r: [number, number, number, number], parent: HTMLElement) {
  const e = document.createElement('div'); e.className = cls; parent.append(e);
  e.getBoundingClientRect = () => { const dy = Number(e.dataset.dy || 0); return rect(r[0], r[1] + dy, r[2], r[3]); };
  Object.defineProperty(e, 'offsetParent', { get: () => document.body }); return e;
}
afterEach(() => { document.body.innerHTML = ''; });

describe('scene labels stay clear of each other and of the case screen', () => {
  const scene = () => { const root = document.createElement('div'); document.body.append(root); root.getBoundingClientRect = () => rect(0, 0, 400, 300); return root; };
  it('two labels on the same spot: the second moves to the next free row', () => {
    const root = scene(); const a = box('lchip', [100, 100, 80, 20], root); const b = box('lchip', [110, 104, 80, 20], root);
    declutter(root); expect(a.dataset.dy).toBe(undefined); expect(Number(b.dataset.dy)).not.toBe(0); expect(b.style.visibility).toBe('');
    const ra = a.getBoundingClientRect(); const rb = b.getBoundingClientRect(); expect(rb.top >= ra.bottom || rb.bottom <= ra.top).toBe(true);
  });
  it('a label under the case card or the key numbers moves off it, or is left out when there is no room', () => {
    const root = scene(); box('hud-card', [0, 150, 400, 150], document.body); box('hud-chips', [0, 0, 400, 60], document.body);
    const near = box('lchip', [100, 140, 80, 20], root); const buried = box('lchip', [100, 240, 80, 20], root);
    declutter(root);
    const r = near.getBoundingClientRect(); expect(near.style.visibility).toBe(''); expect(r.bottom).toBeLessThanOrEqual(150); expect(r.top).toBeGreaterThanOrEqual(60);
    expect(buried.style.visibility).toBe('hidden');
    // the card goes away: the label comes back where it belongs
    document.querySelector('.hud-card')!.remove(); declutter(root); expect(buried.style.visibility).toBe(''); expect(Number(buried.dataset.dy || 0)).toBe(0);
  });
});
