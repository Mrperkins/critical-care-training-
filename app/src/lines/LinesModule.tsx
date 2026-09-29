import { useEffect, useState } from 'react';
import { loadBodyAsset, type BodyAsset } from '../asset/body';
import { lines as linesSession } from './session';
import { loadLinesAsset, type LinesAsset } from '../asset/lines';
import { useUI } from '../app/store';
import { useIsPhone } from '../app/App';
import { LinesScene } from './LinesScene';
import { Monitor } from './Monitor';
import { useLinesUI, type LinesView } from './linesStore';
import { ScenarioPicker, StoryCard, SetupCard, LineCard, BreathingCard, TreatCard, NumbersCard, FlushCard, ExplainCard, Toast } from './LinesPanel';
import { LinesLearn } from './LinesLearn';
import { LinesChallenge } from './LinesChallenge';
import { LinesSim } from './LinesSim';

export function LinesModule() {
  const [assets, setAssets] = useState<{ body: BodyAsset; lines: LinesAsset } | null>(null); const [err, setErr] = useState<string | null>(null);
  useEffect(() => { (window as unknown as { __CCLines: unknown }).__CCLines = { session: linesSession, run: (sec: number) => { for (let k = 0; k < sec * 20; k++) linesSession.tick(0.05); } }; }, []);
  useEffect(() => { Promise.all([loadBodyAsset(), loadLinesAsset()]).then(([body, lines]) => setAssets({ body, lines })).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  const mode = useUI((s) => s.mode); const phone = useIsPhone();
  return (
    <main className="stage lines-stage">
      <section className="scene-pane">
        <div className="scene-wrap">
          {assets ? <LinesScene body={assets.body} asset={assets.lines} /> : <div className="loading">{err ? `Could not load anatomy: ${err}` : 'Loading anatomy…'}</div>}
          <SceneOverlay />
          <Toast />
        </div>
        <div className="wave-wrap"><Monitor height={phone ? 230 : 260} /></div>
      </section>
      <aside className="side-pane">
        {mode === 'explore' && <>
          <ScenarioPicker />
          <ExplainCard />
          <SetupCard />
          <LineCard id="art" />
          <LineCard id="cvp" />
          <FlushCard />
          <NumbersCard />
          <BreathingCard />
          <TreatCard />
          <StoryCard />
        </>}
        {mode === 'learn' && <LinesLearn />}
        {mode === 'challenge' && <LinesChallenge />}
        {mode === 'sim' && <LinesSim />}
        {assets && <p className="credit">Anatomy: {assets.lines.mapping.attribution.creators}, {assets.lines.mapping.attribution.data} — <a href={assets.lines.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{assets.lines.mapping.attribution.license}</a>. {assets.lines.mapping.attribution.changes} Pressures come from a beat-by-beat circulation model (three-element Windkessel, right-atrial a–c–x–v–y timing) and a second-order model of the catheter–tubing–transducer system.</p>}
      </aside>
    </main>
  );
}

function SceneOverlay() {
  const view = useLinesUI((s) => s.view); const labels = useLinesUI((s) => s.labels); const skin = useLinesUI((s) => s.skin); const frozen = useLinesUI((s) => s.frozen); const set = useLinesUI.getState().set;
  const views: [LinesView, string][] = [['bed', 'Bedside'], ['vessels', 'Vessels'], ['level', 'Level'], ['heart', 'Heart'], ['neck', 'CVC'], ['wrist', 'Art line']];
  return (<>
    <div className="view-btns">{views.map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => set({ view: k })}>{l}</button>)}</div>
    <div className="scene-tools">
      <button className={`tgl${labels ? ' on' : ''}`} aria-pressed={labels} onClick={() => set({ labels: !labels })}>Labels: {labels ? 'On' : 'Off'}</button>
      <div className="seg small skin-seg" role="group" aria-label="Skin">{([['solid', 'Skin'], ['see', 'See-through'], ['off', 'No skin']] as const).map(([k, l]) => <button key={k} className={skin === k ? 'on' : ''} onClick={() => set({ skin: k })}>{l}</button>)}</div>
    </div>
    <div className="mon-tools"><button className={`tgl${frozen ? ' on' : ''}`} aria-pressed={frozen} onClick={() => set({ frozen: !frozen })}>{frozen ? 'Unfreeze monitor' : 'Freeze & measure'}</button></div>
  </>);
}
