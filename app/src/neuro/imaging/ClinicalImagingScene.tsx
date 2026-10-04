/** Synthetic teaching images driven by the neuro model, plus one state-matched real clinical reference. */
import { useMemo } from 'react';
import { ImagePanel } from '../../scene/imaging/ImagePanel';
import { IS_PHONE } from '../../scene/Studio';
import { useIcpUI } from '../icpStore';
import { ventricleScale } from '../icp';
import { setNeuroMinutes, useNeuroUI } from '../neuroStore';
import { render, perfusionSummary, MODALITY_NAME, type Modality } from './synth';
import { NeuroRealFinding } from './RealFinding';

const useVentricles = () => {
  const st = useNeuroUI((s) => s.state);
  const sys = useNeuroUI((s) => s.sys);
  const inp = useIcpUI((s) => s.input);
  return useMemo(() => Math.round(ventricleScale(st, sys, inp) * 20) / 20, [st, sys, inp]);
};

const MODS: Modality[] = ['ncct', 'cta', 'cbf', 'tmax'];
const hm = (m: number) => (m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} min`);

function Panel({ mod }: { mod: Modality }) {
  const st = useNeuroUI((s) => s.state);
  const sys = useNeuroUI((s) => s.sys);
  const ly = useNeuroUI((s) => s.slice);
  const size = IS_PHONE ? 150 : 210;
  const vs = useVentricles();
  return (
    <ImagePanel draw={() => render(mod, st, ly, size, sys, vs)} deps={[mod, st, ly, sys, vs]} caption={MODALITY_NAME[mod]}>
      <span className="img-side l">R</span><span className="img-side r">L</span>
      {(mod === 'cbf' || mod === 'tmax') && <span className="img-scale"><i />{mod === 'cbf' ? 'low → high flow' : 'short → long delay'}</span>}
    </ImagePanel>
  );
}

export function ClinicalImagingScene() {
  const ly = useNeuroUI((s) => s.slice);
  const st = useNeuroUI((s) => s.state);
  const sys = useNeuroUI((s) => s.sys);
  const set = useNeuroUI.getState().set;
  const vs = useVentricles();
  const p = perfusionSummary(st, sys);
  const level = ly < -0.45 ? 'Circle of Willis' : ly < -0.15 ? 'Basal ganglia' : ly < 0.25 ? 'Lateral ventricles' : 'Centrum semiovale';
  const timed = Object.keys(st.occlusion).length > 0 || st.hemorrhage?.kind === 'ich';

  return (
    <div className="imaging">
      <div className="img-grid">{MODS.map((m) => <Panel key={m} mod={m} />)}</div>
      <div className="img-bar">
        <label className="img-slice"><span>Slice · {level}</span><input type="range" min={-0.62} max={0.55} step={0.01} value={ly} onChange={(e) => set({ slice: +e.target.value })} aria-label="Axial slice level" /></label>
        {timed && <label className="img-slice"><span>Time machine · {hm(st.minutes)}</span><input type="range" min={0} max={1440} step={10} value={Math.round(st.minutes)} onChange={(e) => { set({ playing: false }); setNeuroMinutes(+e.target.value); }} aria-label="Minutes since neurologic event onset" /></label>}
        <div className="img-sum"><span>Core (CBF &lt; 30 %) <b>{Math.round(p.coreMl)} mL</b></span><span>Tmax &gt; 6 s <b>{Math.round(p.tmax6Ml)} mL</b></span><span>Mismatch <b>{Number.isFinite(p.mismatch) ? p.mismatch.toFixed(1) : '∞'}</b></span><span>Ventricles <b>{vs > 1.25 ? 'enlarged (hydrocephalus)' : vs < 0.75 ? 'compressed' : 'normal'}</b></span></div>
        <p className="img-note">The four panels above are synthetic teaching images generated from the same state as the 3D brain. The real reference below is selected from vetted open clinical media and is a different patient. Radiological convention: patient’s right on the image left.</p>
      </div>
      <NeuroRealFinding />
    </div>
  );
}
