/** Respiratory module: the lungs, waveforms and side pane (Learn / Explore / Practice), or the bedside workbench in Simulator. */
import { useEffect, useState } from 'react';
import { useExploreMemory } from '../app/exploreMemory';
import { Fold } from '../scene/pane';
import { useUI } from '../app/store';
import { useIsPhone } from '../app/useIsPhone';
import { session } from './session';
import { loadRespAsset, type RespAsset } from '../asset/resp';
import { LungScene } from './LungScene';
import { CxrScene } from './CxrScene';
import { LusScene } from './LusScene';
import { AlveolusScene, AlveolusHud, focusVentTarget } from './AlveolusScene';
import { Scalars, Loops } from './Waveforms';
import { VentSettingsFold, GasFold, VentNumbersCard, ExplainCard, ScenarioPicker, ScenarioStory, Interventions, loadVentScenario } from './VentPanel';
import { VentLearn } from './VentLearn';
import { VentChallenge } from './VentChallenge';
import { VentWorkbench } from './VentWorkbench';
import { SceneWrap } from '../scene/labels';
import { usePlayerUI, type Chip } from '../library/playerUI';
import { useLibrary } from '../library/libraryStore';
import { ventNumbers } from './numbers';

/** In the module player: the two to four numbers this lesson scene is about, on the scene (abnormal ones lit). */
function LessonChips() {
  useUI((s) => s.pulse); const focus = usePlayerUI((s) => s.focus); const reading = usePlayerUI((s) => s.readers > 0); const inPlayer = useLibrary((s) => !!s.playing);
  if (!inPlayer || !reading || !focus?.length) return null;
  const n = ventNumbers(session); const out: Chip[] = []; const add = (c: Chip) => { if (out.length < 4 && !out.some((x) => x.label === c.label)) out.push(c); };
  const r = (x: number) => String(Math.round(x));
  if (focus.includes('pressure') || focus.includes('numbers')) { add({ label: 'Peak', value: r(n.pip), tone: n.pip > 30 ? 'hot' : undefined }); add({ label: 'Plateau', value: r(n.pplat), tone: n.pplat > 30 ? 'hot' : undefined }); }
  if (focus.includes('pressure')) { const gap = n.pip - n.pplat; add({ label: 'Gap', value: r(gap), tone: gap > 10 ? 'hot' : undefined }); }
  if (focus.includes('numbers')) { add({ label: 'Driving ΔP', value: r(n.dp), tone: n.dp > 15 ? 'hot' : undefined }); add({ label: 'Vt/kg', value: n.vtPerKg.toFixed(1), tone: n.vtPerKg > 8 ? 'hot' : undefined }); }
  if (focus.includes('flow')) add(n.autoPeep > 0.5 ? { label: 'Auto-PEEP', value: n.autoPeep.toFixed(1), tone: n.autoPeep > 2 ? 'hot' : undefined } : { label: 'Rate', value: r(n.rr) });
  if (focus.includes('volume')) add({ label: 'Vte', value: r(n.vte * 1000) });
  if (focus.includes('gas')) { add({ label: 'SpO₂', value: `${Math.round(n.spo2 * 100)}%`, tone: n.spo2 < 0.9 ? 'bad' : undefined }); add({ label: 'pH', value: n.pH.toFixed(2), tone: n.pH < 7.25 ? 'bad' : undefined }); }
  if (!out.length) return null;
  return <div className="lp-chips" aria-label="Key numbers">{out.map((c) => <div key={c.label} className={`hud-chip${c.tone ? ` ${c.tone}` : ''}`}><small>{c.label}</small><b>{c.value}</b></div>)}</div>;
}
function TraceToggle() {
  const traces = usePlayerUI((s) => s.traces); const all = usePlayerUI((s) => s.allTraces); const reading = usePlayerUI((s) => s.readers > 0); const inPlayer = useLibrary((s) => !!s.playing);
  if (!inPlayer || !reading || !traces?.length || traces.length >= 3) return null;
  return <button className="lp-trace-toggle" aria-pressed={all} onClick={() => usePlayerUI.getState().set({ allTraces: !all })}>{all ? 'Show only this scene’s trace' : 'All waveforms'}</button>;
}

export default function VentModule() {
  const mode = useUI((s) => s.mode);
  const [asset, setAsset] = useState<RespAsset | null>(null); const [err, setErr] = useState<string | null>(null);
  // semantic hook for lessons, the Lesson Director and automated checks (same calls the buttons make)
  useEffect(() => { (window as unknown as { __CCVent: unknown }).__CCVent = { session, focus: focusVentTarget, load: loadVentScenario, set: (p: Record<string, number>) => session.set(p) }; }, []);
  useEffect(() => { if(mode==='sim') return; loadRespAsset().then(setAsset).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, [mode]);
  const showLoops = useUI((s) => s.showLoops); const phone = useIsPhone(); const alv = useUI((s) => s.ventView === 'alveolus'); const xray = useUI((s) => s.ventView === 'xray'); const lus = useUI((s) => s.ventView === 'lus');
  useExploreMemory('vent', () => ({ id: useUI.getState().ventScenario, dyss: session.dyss, s: structuredClone(session.m.s), view: useUI.getState().ventView }),
    (m) => { loadVentScenario(m.id, m.dyss); session.set(m.s); useUI.getState().set({ ventView: m.view, pulse: useUI.getState().pulse + 1 }); });
  if(mode==='sim') return <VentWorkbench />;
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap className={alv ? 'alv-wrap' : ''}>
          {lus ? <LusScene /> : xray ? <CxrScene /> : alv ? <AlveolusScene /> : asset ? <LungScene asset={asset} /> : <div className="loading">{err ? `Could not load the lung model: ${err}` : 'Loading lungs…'}</div>}
          <SceneOverlay />
          <LessonChips />
        </SceneWrap>
        <div className="wave-wrap"><Scalars height={phone ? 210 : undefined} /><TraceToggle /></div>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane contextual-pane" aria-label="Learning context and controls"><h2 className="sr-only">Learning context and controls</h2>
        {mode === 'explore' && <>
          <ScenarioPicker />
          <VentNumbersCard />
          <VentSettingsFold group="vent" />
          <Fold group="vent" id="act" title="Interventions" summary="holds, suction, recruit…"><Interventions /></Fold>
          <Fold group="vent" id="story" title="The patient" summary="story & what to look for"><ScenarioStory /></Fold>
          {showLoops && <Fold group="vent" id="loops" title="Loops"><section className="card"><Loops /></section></Fold>}
          <GasFold group="vent" />
          <Fold group="vent" id="why" title="Why"><ExplainCard /></Fold>
        </>}
        {mode === 'learn' && <VentLearn />}
        {mode === 'challenge' && <VentChallenge />}
        {asset && <details className="credit"><summary>Sources & model notes</summary>Anatomy: {asset.mapping.attribution.creators}, {asset.mapping.attribution.data} — <a href={asset.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{asset.mapping.attribution.license}</a>. {asset.mapping.attribution.changes} Lung motion is drawn 1.6× so tidal changes are visible. Moving air columns use an enhanced X-ray-style overlay to show inspiration and expiration; their thickness is qualitative and is not a computed tidal-volume occupancy map.</details>}
      </aside>
    </main>
  );
}

function SceneOverlay() {
  const view = useUI((s) => s.ventView); const pm = useUI((s) => s.showPmus); const loops = useUI((s) => s.showLoops); const flowDisplay = useUI((s) => s.ventFlowDisplay);
  const [viewOpen, setViewOpen] = useState(false); const [moreOpen, setMoreOpen] = useState(false); const [cutOpen, setCutOpen] = useState(false);
  const ventCut = useUI((s) => s.ventCut);
  const cuts = [['none', 'Whole lungs'], ['front', 'Coronal · front'], ['mid', 'Coronal · middle'], ['back', 'Coronal · back']] as const;
  const set = useUI.getState().set;
  const views = [['front', 'Front'], ['side', 'Side'], ['airway', 'Airways'], ['base', 'Bases'], ['alveolus', 'Alveoli'], ['xray', 'X-ray'], ['lus', 'Lung US']] as const;
  const current = views.find(([k]) => k === view)?.[1] ?? 'View';
  const choose = (k: typeof views[number][0]) => { if (k === 'alveolus') focusVentTarget('lung.alveolus'); else set({ ventView: k, ventTarget: 'lung.whole' }); setViewOpen(false); };
  return (
    <>
      <div className="scene-primary-tools" role="toolbar" aria-label="Respiratory scene controls">
        <div className="scene-menu">
          <button className={`st-btn scene-menu-trigger${viewOpen ? ' on' : ''}`} aria-expanded={viewOpen} onClick={() => { setViewOpen(!viewOpen); setMoreOpen(false); setCutOpen(false); }}>
            <span className="st-ico" aria-hidden="true">◫</span><span>View</span><small>{current}</small>
          </button>
          {viewOpen && <div className="scene-popover view-menu" role="menu">{views.map(([k, l]) => <button role="menuitemradio" aria-checked={view === k} key={k} className={view === k ? 'on' : ''} onClick={() => choose(k)}><span>{l}</span>{view === k && <b aria-hidden="true">✓</b>}</button>)}</div>}
        </div>
        {view !== 'xray' && view !== 'lus' && view !== 'alveolus' && <div className="scene-menu">
          <button className={`st-btn scene-menu-trigger${cutOpen ? ' on' : ''}`} aria-expanded={cutOpen} onClick={() => { setCutOpen(!cutOpen); setViewOpen(false); setMoreOpen(false); }}>
            <span className="st-ico" aria-hidden="true">◧</span><span>Section</span><small>{cuts.find(([k]) => k === ventCut)?.[1]}</small>
          </button>
          {cutOpen && <div className="scene-popover view-menu" role="menu">{cuts.map(([k, l]) => <button role="menuitemradio" aria-checked={ventCut === k} key={k} className={ventCut === k ? 'on' : ''} onClick={() => { set({ ventCut: k, ...(k !== 'none' && view !== 'front' ? { ventView: 'front' as const } : {}) }); setCutOpen(false); }}><span>{l}</span>{ventCut === k && <b aria-hidden="true">✓</b>}</button>)}</div>}
        </div>}
        {view !== 'xray' && view !== 'lus' && <div className="scene-menu">
          <button className={`st-btn scene-menu-trigger${moreOpen ? ' on' : ''}`} aria-expanded={moreOpen} onClick={() => { setMoreOpen(!moreOpen); setViewOpen(false); setCutOpen(false); }}>
            <span className="st-ico" aria-hidden="true">•••</span><span>More</span>
          </button>
          {moreOpen && <div className="scene-popover more-menu">
            <button className={pm ? 'on' : ''} aria-pressed={pm} onClick={() => set({ showPmus: !pm })}><span>Patient effort</span><b>{pm ? 'On' : 'Off'}</b></button>
            <button className={loops ? 'on' : ''} aria-pressed={loops} onClick={() => set({ showLoops: !loops })}><span>Pressure-volume loops</span><b>{loops ? 'On' : 'Off'}</b></button>
            <div role="group" aria-label="Airflow visualization"><span className="muted small">Airflow visualization</span>
              {([['volume','Air volumes'],['both','Volumes + particles'],['particles','Particles only']] as const).map(([value,label])=>
                <button key={value} aria-pressed={flowDisplay===value} className={flowDisplay===value?'on':''}
                  onClick={()=>set({ventFlowDisplay:value})}><span>{label}</span>{flowDisplay===value&&<b aria-hidden="true">✓</b>}</button>)}
            </div>
          </div>}
        </div>}
      </div>
      {view === 'xray' || view === 'lus' ? null : view === 'alveolus' ? <AlveolusHud /> : <div className="legend">
        <span><i className="lg-air" />Aerated</span><span><i className="lg-col" />Collapsed</span><span><i className="lg-over" />Over-stretched</span><span><i className="lg-in" />Gas in</span><span><i className="lg-out" />Gas out</span>
      </div>}
    </>
  );
}

