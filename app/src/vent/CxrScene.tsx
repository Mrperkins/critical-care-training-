/** Portable chest X-ray of the ventilated patient: the real film that matches the model's findings right now. */
import { useEffect, useMemo, useState } from 'react';
import { session } from './session';
import { cxrFromVent, cxrFindings, type CxrState } from './cxr';
import { RealStudy } from '../scene/imaging/RealStudy';
import { useHideFindings } from '../challenge/caseStore';

const round = (st: CxrState) => JSON.stringify(st, (_k, v) => (typeof v === 'number' ? Math.round(v * 40) / 40 : v)); // ignore sub-visible changes
export function useCxr() {
  const [key, setKey] = useState(() => round(cxrFromVent(session)));
  useEffect(() => { const id = setInterval(() => { const k = round(cxrFromVent(session)); setKey((o) => (o === k ? o : k)); }, 600); return () => clearInterval(id); }, []);
  return useMemo(() => JSON.parse(key) as CxrState, [key]);
}

/** Finding keys a real film must show for this state, most important first. */
export function cxrKeys(st: CxrState): string[] {
  const k: string[] = []; const nm = ['right', 'left'];
  st.side.forEach((s, i) => { if (s.ptx > 0.1) k.push(...(st.tension > 2 ? ['tension_ptx'] : []), 'ptx', `ptx_${nm[i]}`); });
  if (st.ett && st.ett.aboveCarinaCm < 0) k.push('mainstem_right');
  st.side.forEach((s, i) => { if (s.atelectasis > 0.3) k.push(`collapse_${nm[i]}`, 'collapse'); });
  if (st.edema) k.push('pulmonary_edema');
  if (st.ards) k.push('ards');
  st.side.forEach((s) => { if (s.effusion > 0.2) k.push(...(s.effusion > 0.6 ? ['effusion_massive'] : []), 'effusion'); });
  if (st.hyperinflation > 0.25) k.push('hyperinflation');
  if (st.drain) k.push('chest_tube');
  if (!k.length) k.push('cxr_normal', 'ett_ok');
  return [...new Set(k)];
}

export function CxrScene() {
  const st = useCxr(); const hide = useHideFindings(); const want = cxrKeys(st);
  const primary = want[0] === 'ptx' || want[0] === 'tension_ptx' ? 'ptx' : want[0];
  return (
    <div className="imaging cxr-view">
      <RealStudy kinds={['cxr', 'xray', 'ptx', 'ptxseries']} want={want} required={[primary]} reading={cxrFindings(st)} hide={hide} label="chest film" />
    </div>
  );
}
