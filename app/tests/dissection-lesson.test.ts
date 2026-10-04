import { describe, it, expect } from 'vitest';
import { DISSECTION_LESSON } from '../src/director/lessons/dissection';
import { resolve } from '../src/director/timeline';
import { useAbdUI, currentAbdomen } from '../src/abdomen/abdomenStore';
import { useCtaUI } from '../src/abdomen/CtaScene';
import { ctaFindings } from '../src/abdomen/cta';
import { lines } from '../src/lines/session';

const at = (id: string) => { resolve(DISSECTION_LESSON, DISSECTION_LESSON.cues.find((c) => c.id === id)!.at + 1); const st = currentAbdomen(); const lvl = useCtaUI.getState().level;
  return { f: ctaFindings(st, lvl).join(' '), lvl, view: useAbdUI.getState().view, hr: Math.round(lines.num.hr), sys: Math.round(lines.num.tSys), map: Math.round(lines.num.tMap) }; };

describe('aortic dissection lesson', () => {
  it('reads type A vs B, lumens, malperfusion and iliac extent from the CTA drawn from the state', () => {
    expect(at('ad-1').view).toBe('cta');
    expect(at('ad-2').f).toMatch(/type A/); expect(at('ad-3').f).toMatch(/type B/);
    expect(at('ad-4').f).toMatch(/true lumen/); expect(at('ad-5').f).toMatch(/Left kidney poorly enhancing/);
    expect(at('ad-6').lvl).toBe('bifurcation'); expect(at('ad-6').f).toMatch(/left common iliac/);
  });
  it('anti-impulse on the Lines patient: rate falls first, then pressure to target; vasodilator alone raises the rate', () => {
    const p = at('ad-1'), b = at('ad-7'), t = at('ad-8'), v = at('ad-9');
    expect(p.sys).toBeGreaterThan(150); expect(p.hr).toBeGreaterThan(100);
    expect(b.hr).toBeLessThan(65); expect(b.sys).toBeGreaterThan(140);
    expect(t.hr).toBeLessThan(65); expect(t.sys).toBeLessThan(120); expect(t.map).toBeGreaterThan(65);
    expect(v.hr).toBeGreaterThan(110);
  });
  it('seeking is exact', () => { const a = JSON.stringify(at('ad-8')); at('ad-2'); expect(JSON.stringify(at('ad-8'))).toBe(a); });
});
