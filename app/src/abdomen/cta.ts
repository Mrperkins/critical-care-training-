/**
 * Aortic CT angiogram reading for the abdominal model: which level shows what (flap, true/false lumen, diameter,
 * haematoma, malperfusion, bowel findings). The image on screen is a real, openly licensed CT matched to these
 * findings (CtaScene.tsx).
 */
import type { AbdomenState } from './state';

export type CtaLevel = 'chest' | 'celiac' | 'renal' | 'infrarenal' | 'bifurcation';
export const CTA_LEVELS: { id: CtaLevel; name: string; short: string }[] = [
  { id: 'chest', name: 'Chest · pulmonary artery level', short: 'Chest' },
  { id: 'celiac', name: 'Coeliac axis', short: 'Coeliac' },
  { id: 'renal', name: 'Renal arteries', short: 'Renal' },
  { id: 'infrarenal', name: 'Infrarenal aorta', short: 'Infrarenal' },
  { id: 'bifurcation', name: 'Aortic bifurcation · iliacs', short: 'Iliacs' },
];
export function dissectedAt(st: AbdomenState, level: CtaLevel) {
  const d = st.dissection; if (!d) return { ascending: false, aorta: false };
  const reach = { thoracic: 1, renal: 3, iliac: 5 }[d.extent]; const idx = CTA_LEVELS.findIndex((l) => l.id === level);
  return { ascending: level === 'chest' && d.type === 'A', aorta: idx < reach };
}
/** Outer aortic diameter (cm) at this level from the aneurysm state (AAA is infrarenal). */
export function aorticDiameter(st: AbdomenState, level: CtaLevel) {
  const D = st.aaa.diameterCm;
  return level === 'chest' ? 2.6 : level === 'celiac' ? 2.3 : level === 'renal' ? Math.min(D, 2.3) : level === 'infrarenal' ? Math.max(2, D) : Math.max(1.2, Math.min(2, D * 0.35));
}

/** Centre of the abdominal aorta at this level: a large aneurysm bulges anteriorly off the spine. */
export function ctaFindings(st: AbdomenState, level: CtaLevel): string[] {
  const f: string[] = []; const D = aorticDiameter(st, level); const dz = dissectedAt(st, level); const d = st.dissection;
  if (dz.ascending) f.push('Intimal flap in the ASCENDING aorta: Stanford type A — surgical emergency.');
  if (level === 'chest' && d && !dz.ascending) f.push('Ascending aorta normal; flap in the descending aorta only: Stanford type B.');
  if (dz.aorta && level !== 'chest') f.push(`Dissection flap ${level === 'bifurcation' ? 'extending into the left common iliac' : 'in the abdominal aorta'}: smaller, denser true lumen; ${d!.falseLumen === 'patent' ? 'larger, less dense false lumen' : 'thrombosed false lumen (no contrast)'}.`);
  if (level === 'renal' && d && (d.malperfusion.renalL || d.malperfusion.renalR)) f.push(`${d.malperfusion.renalL ? 'Left' : 'Right'} kidney poorly enhancing: its renal artery arises from the false lumen — malperfusion.`);
  if (level === 'renal' && d && !dz.aorta) f.push('Flap ends above this level; renal arteries fill normally.');
  if ((level === 'infrarenal' || level === 'renal') && D >= 3) f.push(`Aortic diameter ${D.toFixed(1)} cm (outer wall to outer wall)${D > 3.5 ? ' with eccentric mural thrombus; contrast fills only the residual lumen' : ''}.`);
  if (level === 'infrarenal' && st.aaa.rupture === 'contained') f.push('Retroperitoneal haematoma beside the aneurysm, high-attenuation crescent in the thrombus: contained rupture.');
  if (level === 'infrarenal' && st.aaa.rupture === 'free') f.push('Active contrast extravasation and blood in the paracolic gutters: free rupture.');
  if (!f.length) f.push(level === 'chest' ? 'Normal calibre ascending and descending aorta; no flap.' : `Normal calibre aorta (${D.toFixed(1)} cm); no flap, no haematoma.`);
  if (st.ischaemia > 0 && level === 'renal') f.push('The superior mesenteric artery does not fill with contrast: embolic occlusion.');
  if (st.ischaemia > 0.3 && level !== 'chest') f.push(st.ischaemia > 0.6 ? 'Bowel wall not enhancing, with gas in the wall (pneumatosis): infarction.' : 'Small-bowel wall enhancing poorly: ischaemia.');
  if (st.obstruction === 'small' && level !== 'chest') f.push('Dilated, fluid-filled small-bowel loops with air–fluid levels: obstruction.');
  if (st.freeAir && level !== 'chest' && level !== 'bifurcation') f.push('Free air in front of the liver and bowel, outside the gut: pneumoperitoneum.');
  return f;
}
