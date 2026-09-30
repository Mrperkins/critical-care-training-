import { it } from 'vitest';
import { ABD_PRESETS } from '../src/abdomen/abdomenStore';
import { evolve, shockClass, abdomenFindings, fastExam } from '../src/abdomen/state';
import { ctaFindings } from '../src/abdomen/cta';
it('p', () => {
  const P = (id: string, x: object = {}) => ({ ...ABD_PRESETS.find((p) => p.id === id)!.make(), ...x });
  const show = (n: string, s: any) => { const c = shockClass(s); console.log(n, Math.round(s.freeFluidMl), 'cls', c.cls, 'hr', c.hr, 'sbp', c.sbp, fastExam(s).filter((w) => w.positive).map((w) => w.id).join(',')); };
  show('spleen2 60', evolve(P('normal', { injury: { spleen: 2 } }), 60));
  show('spleen4 30', evolve(P('spleen4'), 30));
  show('spleen4 30 +1L', evolve(P('spleen4', { transfusedMl: 1000 }), 30));
  show('spleen4 75 +1L', evolve(P('spleen4', { transfusedMl: 1000 }), 75));
  show('spleen4 120 +1L', evolve(P('spleen4', { transfusedMl: 1000 }), 120));
  show('liver5 20 +1L', evolve(P('normal', { injury: { liver: 5 }, transfusedMl: 1000 }), 20));
  show('liver5 20', evolve(P('normal', { injury: { liver: 5 } }), 20));
  show('spleen4 ctrl60 120 +1.5L', evolve(P('spleen4', { transfusedMl: 1500, controlledAt: 60 }), 120));
  show('spleen4 ctrl60 60', evolve(P('spleen4', { controlledAt: 60 }), 60));
  for (const m of [0, 60, 180, 300]) { const s = evolve(P('normal', { ischaemia: 0.05 }), m); console.log('isch', m, s.ischaemia.toFixed(2), ctaFindings(s, 'renal')); }
  console.log('sbo', ctaFindings(evolve(P('sbo'), 30), 'infrarenal')); console.log('perf', ctaFindings(evolve(P('perforation'), 30), 'celiac'), abdomenFindings(evolve(P('perforation'), 30)));
});
