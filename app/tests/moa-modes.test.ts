import { describe, it, expect } from 'vitest';
import { MECHANISMS, MECH } from '../src/moa/registry';
import { withContext } from '../src/moa/registry';
import { branches, emphasis, descendants, ancestors, compare, mainDrug } from '../src/moa/modes';
import { ADVERSE, TIMECOURSE, LESSON_DRUGS, lessonsForDrug } from '../src/moa/meta';
import { lessonById, LESSON_HOSTS } from '../src/director/lessonIndex';

const V = { level: 'cellular' as const, branch: null, focus: null, adverse: false, adverseIds: [] as string[] };

describe('MOA modes (pure)', () => {
  it('branches: norepinephrine splits into α1 and β1 chains; a branch excludes the other receptor’s chain', () => {
    const b = branches(MECH.norepinephrine); expect(b.length).toBeGreaterThanOrEqual(2);
    const ids = b.map((x) => x.id); expect(ids.some((i) => /a1/i.test(i))).toBe(true); expect(ids.some((i) => /b1/i.test(i))).toBe(true);
    const a1 = b.find((x) => /a1/i.test(x.id))!, b1 = b.find((x) => /b1/i.test(x.id))!;
    expect(a1.nodes.has(b1.id)).toBe(false); expect(b1.nodes.has(a1.id)).toBe(false);
    expect(branches(MECH.esmolol)).toEqual([]); // a single target: no branch toggle offered
  });
  it('view levels dim the right kinds; explore highlights the causal path; adverse mode shows only adverse nodes', () => {
    const d = MECH.norepinephrine; const q = emphasis(d, { ...V, level: 'quick' });
    for (const n of d.nodes) expect(q[n.id]).toBe(['drug', 'receptor', 'vital'].includes(n.kind) ? 'on' : 'dim');
    const vital = d.nodes.find((n) => n.kind === 'vital')!.id; const f = emphasis(d, { ...V, focus: vital });
    expect(f[vital]).toBe('focus'); expect(f[mainDrug(d)]).toBe('on'); for (const id of ancestors(d, vital)) expect(f[id]).toBe('on');
    const p = MECH.propofol; const a = emphasis(p, { ...V, adverse: true, adverseIds: ADVERSE.propofol.nodes });
    expect(Object.entries(a).filter(([, e]) => e === 'adverse').map(([id]) => id).sort()).toEqual([...ADVERSE.propofol.nodes].sort());
    expect(descendants(p, mainDrug(p)).size).toBeGreaterThan(5);
  });
  it('compare: norepinephrine vs phenylephrine both raise MAP; phenylephrine slows the heart more', () => {
    const r = compare(MECH.norepinephrine, MECH.phenylephrine); const map = r.rows.find((x) => x.id === 'map')!, hr = r.rows.find((x) => x.id === 'hr')!;
    expect(map.a).toBeGreaterThan(0); expect(map.b).toBeGreaterThan(0); expect(hr.b).toBeLessThan(hr.a);
    const c = compare(withContext(MECH.txa, 'lysis'), withContext(MECH.pcc, 'withk')); expect(c.rows.map((x) => x.id)).toContain('inr'); expect(c.sameScenario).toBe(false);
  });
});

describe('MOA metadata', () => {
  it('every drug has adverse-effect text and a time course; adverse node ids exist in its graph', () => {
    for (const d of MECHANISMS) {
      expect(ADVERSE[d.id], d.id).toBeTruthy(); expect(TIMECOURSE[d.id], d.id).toBeTruthy();
      for (const id of ADVERSE[d.id].nodes) expect(d.nodes.some((n) => n.id === id), `${d.id}:${id}`).toBe(true);
      const t = TIMECOURSE[d.id]; expect(t.onset[0]).toBeLessThanOrEqual(t.onset[1]); expect(t.onset[0]).toBeLessThanOrEqual(t.peak[1]);
    }
  });
  it('lesson ↔ drug links point at real lessons and real drugs', () => {
    for (const [l, ds] of Object.entries(LESSON_DRUGS)) { expect(lessonById(l), l).toBeTruthy(); for (const d of ds) expect(MECH[d], `${l}:${d}`).toBeTruthy(); }
    expect(lessonsForDrug('mannitol')).toContain('neuro-icp'); expect(lessonsForDrug('esmolol')).toContain('abd-dissection');
    const all = LESSON_HOSTS.flatMap((h) => h.timelines.map((t) => t.id)); expect(new Set(all).size).toBe(all.length);
  });
});

describe('lesson → drug → back to the same lesson moment', () => {
  it('openDrug remembers the lesson and time; openLesson restores module, lesson and time', async () => {
    const { director, useDirector } = await import('../src/director/director');
    const { useUI } = await import('../src/app/store');
    const { useMoa } = await import('../src/moa/moaStore');
    const { openDrug, openLesson } = await import('../src/app/navigate');
    const hit = lessonById('abd-dissection')!; director.load(hit.tl, false); director.seek(89);
    openDrug('esmolol');
    expect(useUI.getState().module).toBe('moa'); expect(useMoa.getState().defId).toBe('esmolol');
    const r = useMoa.getState().returnTo!; expect(r.lessonId).toBe('abd-dissection'); expect(r.t).toBeCloseTo(89, 1);
    director.unload(); openLesson(r.lessonId, r.t); await new Promise((res) => setTimeout(res, 5));
    expect(useUI.getState().module).toBe('abdomen'); expect(useUI.getState().mode).toBe('learn');
    expect(useDirector.getState().tl?.id).toBe('abd-dissection'); expect(useDirector.getState().t).toBeCloseTo(89, 1);
  });
});
