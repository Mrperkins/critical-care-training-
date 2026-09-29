/** Axial CT angiogram of the aorta from the current abdominal state: level selector, whole slice, magnified aorta, findings. */
import { useMemo } from 'react';
import { useAbdUI, currentAbdomen } from './abdomenStore';
import { renderCta, aortaCrop, ctaFindings, CTA_LEVELS } from './cta';
import { ImagePanel } from '../scene/imaging/ImagePanel';
import { IS_PHONE } from '../scene/Studio';
import { useCtaUI } from './ctaStore';
import { useHideFindings } from '../challenge/caseStore';
export { useCtaUI };
export function CtaScene() {
  const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes); const st = useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]);
  const { level, set } = useCtaUI(); const meta = CTA_LEVELS.find((l) => l.id === level)!; const size = IS_PHONE ? 300 : 360; const f = ctaFindings(st, level); const hide = useHideFindings();
  return (
    <div className="imaging cta-view">
      <div className="chips cta-levels" role="tablist" aria-label="Slice level">{CTA_LEVELS.map((l) => <button key={l.id} role="tab" aria-selected={l.id === level} className={`chip${l.id === level ? ' on' : ''}`} onClick={() => set(l.id)}>{l.short}</button>)}</div>
      <div className="img-grid cta-grid">
        <ImagePanel draw={() => renderCta(st, level, size)} deps={[st, level, size]} caption={`CTA · ${meta.name}`}><span className="img-side l">R</span><span className="img-side r">L</span></ImagePanel>
        <ImagePanel draw={() => renderCta(st, level, size, aortaCrop(st, level))} deps={[st, level, size]} caption="Aorta · magnified"><span className="img-side l">R</span><span className="img-side r">L</span></ImagePanel>
      </div>
      <section className="cxr-find cta-find"><h4>Findings at this level</h4>{hide ? <p className="muted small">Hidden while you answer — read the image.</p> : <ul>{f.map((l) => <li key={l}>{l}</li>)}</ul>}</section>
      <div className="img-bar"><p className="img-note">Synthetic arterial-phase CT drawn from the same model state as the 3D abdomen and the ultrasound — not patient scans. Patient’s right on the image left; anterior at the top.</p></div>
    </div>
  );
}
