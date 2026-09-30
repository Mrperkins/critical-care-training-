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

export function AbgModule() {
  const [assets, setAssets] = useState<{ resp: RespAsset; micro: MicroAsset } | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { Promise.all([loadRespAsset(), loadMicroAsset()]).then(([resp, micro]) => setAssets({ resp, micro })).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  const mode = useUI((s) => s.mode);
  return (
    <main className="stage">
      <section className="scene-pane">
        <div className="scene-wrap">
          {assets ? <AbgScene resp={assets.resp} micro={assets.micro} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}
          <StationNav />
          <div className="legend">
            <span><i style={{ background: '#b3120d' }} />Oxygenated blood</span><span><i style={{ background: '#3a0617' }} />Deoxygenated</span><span><i style={{ background: '#d6ecff' }} />O₂</span><span><i style={{ background: '#f2b25c' }} />CO₂</span><span><i style={{ background: '#e16ad0' }} />Lactate</span><span><i style={{ background: '#5fd0c4' }} />HCO₃⁻</span>
          </div>
        </div>
      </section>
      <aside className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'explore' && <>
          <AbgPresets />
          <AbgStory />
          <SampleCards />
          <StationCard />
          <AbgControls />
          <AbgTime />
          <AcidBaseMap />
          <AbgInterpret />
          <ApnoeaCard />
        </>}
        {mode === 'learn' && <AbgLearn />}
        {mode === 'challenge' && <AbgChallenge />}
        {mode === 'sim' && <AbgSim />}
        {assets && <p className="credit">Lungs &amp; kidneys: {assets.resp.mapping.attribution.creators}, {assets.resp.mapping.attribution.data} — CC BY 4.0. Microanatomy: {assets.micro.mapping.attribution.data}; capillaries and RBCs to scale (1 alveolus ≈ 0.2 mm), blood flow slowed ~10×.</p>}
      </aside>
    </main>
  );
}

function StationNav() {
  const st = useAbgUI((s) => s.station);
  const L: [Station, string][] = [['lung', 'Lungs'], ['alveolus', 'Alveolus'], ['capillary', 'Capillary'], ['tissue', 'Tissue'], ['kidney', 'Kidney']];
  return <div className="view-btns">{L.map(([k, l]) => <button key={k} className={st === k ? 'on' : ''} onClick={() => useAbgUI.getState().set({ station: k })}>{l}</button>)}</div>;
}
