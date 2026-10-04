/** Portable chest X-ray of the ventilated patient, redrawn from the live vent session as it changes. */
import { useEffect, useMemo, useState } from 'react';
import { session } from './session';
import { cxrFromVent, renderCxr, cxrFindings, type CxrState } from './cxr';
import { ImagePanel } from '../scene/imaging/ImagePanel';
import { IS_PHONE } from '../scene/Studio';
import { StateRealReference } from '../scene/imaging/StateRealReference';
import { selectCxrReal } from './realReference';
import { useHideFindings } from '../challenge/caseStore';

const round = (st: CxrState) => JSON.stringify(st, (_k, v) => (typeof v === 'number' ? Math.round(v * 40) / 40 : v)); // ignore sub-visible changes
export function useCxr() {
  const [key, setKey] = useState(() => round(cxrFromVent(session)));
  useEffect(() => { const id = setInterval(() => { const k = round(cxrFromVent(session)); setKey((o) => (o === k ? o : k)); }, 600); return () => clearInterval(id); }, []);
  return useMemo(() => JSON.parse(key) as CxrState, [key]);
}
export function CxrScene() {
  const st = useCxr(); const f = cxrFindings(st); const hide = useHideFindings(); const size = IS_PHONE ? 300 : 420; const real = hide ? null : selectCxrReal(st);
  return (
    <div className="imaging cxr-view">
      <div className="cxr-wrap">
        <ImagePanel className="cxr-panel" draw={() => renderCxr(st, size)} deps={[st, size]} caption="Portable AP · supine" aria={hide ? 'Chest X-ray' : `Chest X-ray. ${f.join(' ')}`}>
          <span className="img-side l">R</span>
        </ImagePanel>
        <section className="cxr-find"><h4>Findings</h4>{hide ? <p className="muted small">Hidden while you answer — read the film.</p> : <ul>{f.map((l) => <li key={l}>{l}</li>)}</ul>}</section>
      </div>
      <StateRealReference match={real} />
      <div className="img-bar"><p className="img-note">Synthetic teaching radiograph drawn from the ventilator model’s own state. The real image above, when present, is a state-matched reference from a different patient. Radiological convention: patient’s right on the image left.</p></div>
    </div>
  );
}
