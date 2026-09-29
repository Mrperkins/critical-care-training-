/** Four synthetic teaching images of the current neuro state, with a slice-level control. */
import { ImagePanel } from '../../scene/imaging/ImagePanel';
import { useNeuroUI } from '../neuroStore';
import { render, perfusionSummary, MODALITY_NAME, type Modality } from './synth';
import { IS_PHONE } from '../../scene/Studio';

const MODS: Modality[] = ['ncct', 'cta', 'cbf', 'tmax'];
function Panel({ mod }: { mod: Modality }) {
  const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys); const ly = useNeuroUI((s) => s.slice); const size = IS_PHONE ? 150 : 210;
  return (
    <ImagePanel draw={() => render(mod, st, ly, size, sys)} deps={[mod, st, ly, sys]} caption={MODALITY_NAME[mod]}>
      <span className="img-side l">R</span><span className="img-side r">L</span>
      {(mod === 'cbf' || mod === 'tmax') && <span className="img-scale"><i />{mod === 'cbf' ? 'low → high flow' : 'short → long delay'}</span>}
    </ImagePanel>
  );
}
export function ClinicalImagingScene() {
  const ly = useNeuroUI((s) => s.slice); const st = useNeuroUI((s) => s.state); const sys = useNeuroUI((s) => s.sys); const set = useNeuroUI.getState().set;
  const p = perfusionSummary(st, sys); const level = ly < -0.45 ? 'Circle of Willis' : ly < -0.15 ? 'Basal ganglia' : ly < 0.25 ? 'Lateral ventricles' : 'Centrum semiovale';
  return (
    <div className="imaging">
      <div className="img-grid">{MODS.map((m) => <Panel key={m} mod={m} />)}</div>
      <div className="img-bar">
        <label className="img-slice"><span>Slice · {level}</span><input type="range" min={-0.62} max={0.55} step={0.01} value={ly} onChange={(e) => set({ slice: +e.target.value })} aria-label="Axial slice level" /></label>
        <div className="img-sum"><span>Core (CBF &lt; 30 %) <b>{Math.round(p.coreMl)} mL</b></span><span>Tmax &gt; 6 s <b>{Math.round(p.tmax6Ml)} mL</b></span><span>Mismatch <b>{Number.isFinite(p.mismatch) ? p.mismatch.toFixed(1) : '∞'}</b></span></div>
        <p className="img-note">Synthetic teaching images generated from the model state — not patient scans. Radiological convention: patient’s right on the image left.</p>
      </div>
    </div>
  );
}
