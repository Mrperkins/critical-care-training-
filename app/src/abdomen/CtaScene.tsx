/** CT angiogram of the aorta and abdomen for the current state: choose a level; the real CT showing that level's main finding, with the model's reading. */
import { useMemo } from 'react';
import { useAbdUI, currentAbdomen } from './abdomenStore';
import { ctaFindings, dissectedAt, aorticDiameter, CTA_LEVELS, type CtaLevel } from './cta';
import type { AbdomenState } from './state';
import { useCtaUI } from './ctaStore';
import { useHideFindings } from '../challenge/caseStore';
import { RealStudy } from '../scene/imaging/RealStudy';
export { useCtaUI };

/** Finding keys for this level, most important first (the first is required of any real CT shown). */
export function ctaKeys(st: AbdomenState, level: CtaLevel): string[] {
  const k: string[] = []; const dz = dissectedAt(st, level); const d = st.dissection; const D = aorticDiameter(st, level); const below = level !== 'chest';
  if (dz.ascending) k.push('dissection_type_a', 'intimal_flap');
  else if (d && dz.aorta) k.push(d.type === 'A' ? 'dissection_type_a' : 'dissection_type_b', 'intimal_flap');
  if (level === 'renal' && d && (d.malperfusion.renalL || d.malperfusion.renalR)) k.push('renal_malperfusion');
  if (level === 'infrarenal' && st.aaa.rupture !== 'none') k.push('aaa_rupture', 'retroperitoneal_hematoma', 'aaa');
  else if ((level === 'infrarenal' || level === 'renal') && D >= 3) k.push('aaa');
  if (below && st.ischaemia > 0) k.push(st.ischaemia > 0.6 && level !== 'bifurcation' ? 'pneumatosis' : 'sma_occlusion');
  if (below && st.obstruction === 'small') k.push('sbo');
  if (below && st.freeAir && level !== 'bifurcation') k.push('pneumoperitoneum');
  if (below && st.freeFluidMl > 300 && st.fluidKind === 'blood') k.push('hemoperitoneum');
  if (!k.length) k.push('aorta_normal');
  return [...new Set(k)];
}

export function CtaScene() {
  const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes); const st = useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]);
  const { level, set } = useCtaUI(); const hide = useHideFindings(); const want = ctaKeys(st, level);
  return (
    <div className="imaging cta-view">
      <div className="lus-zones" role="group" aria-label="Slice level">{CTA_LEVELS.map((l) => <button key={l.id} aria-pressed={l.id === level} className={l.id === level ? 'on' : ''} onClick={() => set(l.id)}><span>{l.short}</span></button>)}</div>
      <RealStudy kinds={['ct-aorta']} want={want} required={[want[0]]} reading={ctaFindings(st, level)} hide={hide} label="CT"
        missing={`A real CT showing this (${want[0].replaceAll('_', ' ')}) has not been sourced yet.`} />
    </div>
  );
}
