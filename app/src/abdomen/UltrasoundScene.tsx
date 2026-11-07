/** FAST + aorta for the current abdominal state: pick a window; the real clip of that window's finding plays, with the model's reading. */
import { useMemo, useState } from 'react';
import { useAbdUI, currentAbdomen } from './abdomenStore';
import { US_WINDOWS, stripeMm, type UsWindow } from './ultrasound';
import { fastExam, type AbdomenState } from './state';
import { useHideFindings } from '../challenge/caseStore';
import { RealStudy } from '../scene/imaging/RealStudy';

/** Finding key a real study must carry for this window in this state. */
export function fastKey(win: UsWindow, st: AbdomenState): string {
  if (win === 'aorta') return st.aaa.diameterCm >= 3 ? 'aaa' : 'aorta_normal_us';
  const w = fastExam(st).find((x) => x.id === win)!;
  return `fast_${win}_${w.positive ? 'positive' : 'negative'}`;
}
function reading(win: UsWindow, st: AbdomenState): string[] {
  const meta = US_WINDOWS.find((w) => w.id === win)!;
  if (win === 'aorta') return [`${meta.name}: ${st.aaa.diameterCm.toFixed(1)} cm${st.aaa.diameterCm >= 3 ? ' — aneurysm (≥ 3 cm)' : ', normal calibre'}.`,
    ...(st.aaa.rupture !== 'none' ? ['Ultrasound cannot exclude rupture: retroperitoneal blood is usually invisible to it. CT if the patient is stable enough.'] : [])];
  const w = fastExam(st).find((x) => x.id === win)!;
  return [`${meta.name}: ${w.positive ? `anechoic free fluid, stripe about ${Math.round(stripeMm(w.ml, true))} mm` : 'no free fluid'}.`, w.note.charAt(0).toUpperCase() + w.note.slice(1) + '.',
    'FAST sees intraperitoneal and pericardial fluid only — never the retroperitoneum.'];
}

export function UltrasoundScene() {
  const base = useAbdUI((s) => s.base); const minutes = useAbdUI((s) => s.minutes); const st = useMemo(() => currentAbdomen({ base, minutes }), [base, minutes]); const hide = useHideFindings();
  const [win, setWin] = useState<UsWindow>('ruq'); const fast = fastExam(st); const key = fastKey(win, st);
  return (
    <div className="imaging us-view">
      <div className="lus-zones" role="group" aria-label="Ultrasound window">
        {US_WINDOWS.map((w) => { const f = fast.find((x) => x.id === w.id); return <button key={w.id} className={w.id === win ? 'on' : ''} aria-pressed={w.id === win} onClick={() => setWin(w.id)}>
          <span>{w.short}</span>{!hide && <small className={f?.positive || (w.id === 'aorta' && st.aaa.diameterCm >= 3) ? 'bad' : ''}>{w.id === 'aorta' ? `${st.aaa.diameterCm.toFixed(1)} cm` : f?.positive ? 'fluid' : 'negative'}</small>}
        </button>; })}
      </div>
      <RealStudy kinds={['fast', 'tamponade', 'aorta-us']} want={[key]} required={[key]} reading={reading(win, st)} hide={hide} label="ultrasound"
        missing={/negative|normal/.test(key) ? 'A real normal view of this window has not been sourced yet: expect bright, touching organ edges with no black (anechoic) stripe between them.' : undefined} />
    </div>
  );
}
