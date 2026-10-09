import { Fold } from '../scene/pane';
import { useEffect, useState } from 'react';
import { ApnoeaCard } from '../populations/Cards';
import { loadRespAsset, type RespAsset } from '../asset/resp';
import { loadMicroAsset, type MicroAsset } from '../asset/micro';
import { AbgScene } from './AbgScene';
import { useAbgUI, type Station } from './abgStore';
import { useUI } from '../app/store';
import { AbgPresets, AbgStory, SampleCards, AbgControls, AbgTime, AbgInterpret, AcidBaseMap, StationCard } from './AbgPanel';
import { AbgLearn } from './AbgLearn';
import { AbgChallenge } from './AbgChallenge';
import { AbgSim } from './AbgSim';
import { SceneWrap } from '../scene/labels';

export function AbgModule() {
  const [assets, setAssets] = useState<{ resp: RespAsset; micro: MicroAsset } | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { Promise.all([loadRespAsset(), loadMicroAsset()]).then(([resp, micro]) => setAssets({ resp, micro })).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  const mode = useUI((s) => s.mode);
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap>
          {assets ? <AbgScene resp={assets.resp} micro={assets.micro} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}
          <StationNav />
          <div className="legend">
            <span><i style={{ background: '#b3120d' }} />Oxygenated blood</span><span><i style={{ background: '#3a0617' }} />Deoxygenated</span><span><i style={{ background: '#d6ecff' }} />O₂</span><span><i style={{ background: '#f2b25c' }} />CO₂</span><span><i style={{ background: '#e16ad0' }} />Lactate</span><span><i style={{ background: '#5fd0c4' }} />HCO₃⁻</span>
          </div>
        </SceneWrap>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'explore' && <>
          <AbgPresets />
          <SampleCards />
          <Fold group="abg" id="causes" title="Change the causes" summary="drive, FiO₂, shunt, metabolism…"><AbgControls /></Fold>
          <Fold group="abg" id="interp" title="Interpret it" summary="step-by-step reading"><AbgInterpret /></Fold>
          <Fold group="abg" id="map" title="Acid–base map"><AcidBaseMap /></Fold>
          <Fold group="abg" id="station" title="What's happening here" summary="the station on screen"><StationCard /></Fold>
          <Fold group="abg" id="story" title="Teaching points"><AbgStory /></Fold>
          <Fold group="abg" id="time" title="Time & compensation"><AbgTime /></Fold>
          <Fold group="abg" id="apnoea" title="Apnoea: how fast SpO₂ falls"><ApnoeaCard /></Fold>
        </>}
        {mode === 'learn' && <AbgLearn />}
        {mode === 'challenge' && <AbgChallenge />}
        {mode === 'sim' && <AbgSim />}
        {assets && <details className="credit"><summary>Sources & model notes</summary>Lungs &amp; kidneys: {assets.resp.mapping.attribution.creators}, {assets.resp.mapping.attribution.data} — CC BY 4.0. Microanatomy: {assets.micro.mapping.attribution.data}; capillaries and RBCs to scale (1 alveolus ≈ 0.2 mm), blood flow slowed ~10×.</details>}
      </aside>
    </main>
  );
}

function StationNav() {
  const st = useAbgUI((s) => s.station);
  const L: [Station, string][] = [['lung', 'Lungs'], ['alveolus', 'Alveolus'], ['capillary', 'Capillary'], ['tissue', 'Tissue'], ['kidney', 'Kidney']];
  return <div className="view-btns">{L.map(([k, l]) => <button key={k} className={st === k ? 'on' : ''} onClick={() => useAbgUI.getState().set({ station: k })}>{l}</button>)}</div>;
}
