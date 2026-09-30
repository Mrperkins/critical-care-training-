import { useEffect, useState } from 'react';
import { CoagCard } from './CoagCard';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { loadMicroAsset, type MicroAsset } from '../asset/micro';
import { LabScene } from './LabScene';
import { useLabUI } from './labStore';
import { useUI } from '../app/store';
import { LabList, LabCard, Consequences } from './LabPanel';
import { LabLearn } from './LabLearn';
import { LabChallenge } from './LabChallenge';
import { LabSim } from './LabSim';
import { LAB } from '../knowledge/labs';
import { sceneOf } from './cell/model';
import { cellSpec } from './cellSpec';
import { bench } from './bench';
import { CellHud, CellStory, LabelsToggle } from './cell/CellHud';
import { BloodHud, BloodStory } from './blood/BloodHud';
import { bloodKindOf } from './blood/model';

function LegacyKey() {
  useUI((s) => s.pulse); const lab = useLabUI((s) => s.lab); const on = useLabUI((s) => s.labelsOn); if (!on) return null;
  const sp = cellSpec(lab, bench.snap, bench.pt).species; if (!sp.length) return null;
  return <div className="ch-legend">{sp.map((x) => <span key={x.key} className="lg-chip"><i className="gl" style={{ background: x.color }} /><b>{x.label}</b></span>)}</div>;
}

export function LabModule() {
  const [assets, setAssets] = useState<{ body: BodyAsset; micro: MicroAsset } | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { Promise.all([loadBodyAsset(), loadMicroAsset()]).then(([body, micro]) => setAssets({ body, micro })).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  const mode = useUI((s) => s.mode); const view = useLabUI((s) => s.view); const lab = useLabUI((s) => s.lab);
  useEffect(() => { useLabUI.getState().set({ cellType: null, picked: null }); }, [lab]);
  return (
    <main className={`stage${view === 'cell' && (sceneOf(lab) || bloodKindOf(lab)) ? ' cellmode' : ''}`}>
      <section className="scene-pane">
        <div className="scene-wrap">
          {assets ? <LabScene body={assets.body} micro={assets.micro} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}
          <div className="view-btns"><button className={view === 'body' ? 'on' : ''} onClick={() => useLabUI.getState().set({ view: 'body' })}>Body</button><button className={view === 'cell' ? 'on' : ''} onClick={() => useLabUI.getState().set({ view: 'cell' })}>Cells · {LAB[lab].abbr}</button></div>
          {view === 'cell' && sceneOf(lab) ? (assets && <CellHud />) : view === 'cell' && bloodKindOf(lab) ? (assets && <BloodHud />) : <div className="scene-tools"><span className="tgl on">{view === 'body' ? 'Tap an organ to see its labs' : 'Microscopic view'}</span>{view === 'cell' && <LabelsToggle />}{view === 'cell' && <LegacyKey />}</div>}
        </div>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'explore' && <><LabList /><LabCard />{LAB[lab]?.group === 'Coagulation' && <CoagCard interactive />}{view === 'cell' && sceneOf(lab) && <CellStory />}{view === 'cell' && bloodKindOf(lab) && <BloodStory />}<Consequences /></>}
        {mode === 'learn' && <LabLearn />}
        {mode === 'challenge' && <LabChallenge />}
        {mode === 'sim' && <LabSim />}
        {assets && <p className="credit">Organs: {assets.body.mapping.attribution.creators}, {assets.body.mapping.attribution.data} — CC BY 4.0 ({assets.body.mapping.attribution.changes}). Cells modelled from histological proportions (membrane drawn far thicker than its real 7 nm so it can be seen); ion counts drawn on a compressed scale, legend numbers are real.</p>}
      </aside>
    </main>
  );
}
