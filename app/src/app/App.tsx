import { CurriculumModule } from '../curriculum/CurriculumModule';
import { initProgressTracking } from '../curriculum/track';
import { useEffect, useRef, useState } from 'react';
import { EXPERIENCES, experienceFor, selectExperience } from './experience';
import { useUI, type Module, type Mode } from './store';
import { session } from '../vent/session';
import { loadRespAsset, type RespAsset } from '../asset/resp';
import { LungScene } from '../vent/LungScene';
import { CxrScene } from '../vent/CxrScene';
import { LusScene } from '../vent/LusScene';
import { AlveolusScene, AlveolusHud, focusVentTarget } from '../vent/AlveolusScene';
import { Scalars, Loops } from '../vent/Waveforms';
import { VentControls, VentNumbersCard, GasCard, ExplainCard, ScenarioPicker, ScenarioStory, Interventions, Seg, loadVentScenario } from '../vent/VentPanel';
import { VentLearn } from '../vent/VentLearn';
import { VentChallenge } from '../vent/VentChallenge';
import { VentWorkbench } from '../vent/VentWorkbench';
import { AbgModule } from '../abg/AbgModule';
import { lab } from '../abg/lab';
import { LabModule } from '../labs/LabModule';
import { bench } from '../labs/bench';
import { LinesModule } from '../lines/LinesModule';
import { NeuroModule } from '../neuro/NeuroModule';
import { MoaModule } from '../moa/MoaModule';
import { HeartModule } from '../heart/HeartModule';
import { AbdomenModule } from '../abdomen/AbdomenModule';
import { lines } from '../lines/session';
import { SceneWrap } from '../scene/labels';
import { VideoLibrary } from '../videos/VideoLibrary';
import { AtlasEntry, AtlasModule } from '../atlas/AtlasModule';
import type { AtlasDomain } from '../atlas/types';
import { conditionsFor, DISEASE_BY_ID } from '../atlas/registry';

export function useIsPhone() {
  const q = '(max-width: 760px)';
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const f = () => setM(mq.matches); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f); }, []);
  return m;
}

function useEngine() {
  useEffect(() => {
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.1, (now - last) / 1000); last = now;
      const ui = useUI.getState();
      if (ui.module === 'vent') session.tick(dt);
      if (ui.module === 'abg') lab.tick(dt);
      if (ui.module === 'labs') bench.tick(dt);
      if (ui.module === 'lines') lines.tick(dt);
      acc += dt; if (acc > 0.14) { acc = 0; ui.set({ pulse: ui.pulse + 1 }); }
    };
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
}

const DOMAINS: { module: Module; label: string; short: string; eyebrow: string }[] = [
  { module: 'curriculum', label: 'Home', short: 'HM', eyebrow: 'Your learning home' },
  { module: 'vent', label: 'Respiratory', short: 'RS', eyebrow: 'Ventilation & gas exchange' },
  { module: 'abg', label: 'Blood gas', short: 'AB', eyebrow: 'Acid–base & oxygenation' },
  { module: 'labs', label: 'Labs', short: 'LB', eyebrow: 'Cellular & metabolic physiology' },
  { module: 'lines', label: 'Hemodynamics', short: 'HD', eyebrow: 'Pressure, flow & access' },
  { module: 'heart', label: 'Cardiac', short: 'CV', eyebrow: 'Pump, rhythm & circulation' },
  { module: 'abdomen', label: 'Abdomen', short: 'GI', eyebrow: 'Perfusion, bleeding & imaging' },
  { module: 'neuro', label: 'Neuro', short: 'NR', eyebrow: 'Brain, perfusion & pressure' },
  { module: 'moa', label: 'Pharmacology', short: 'RX', eyebrow: 'Mechanism to whole patient' },
  { module: 'pediatrics', label: 'Pediatrics', short: 'PD', eyebrow: 'Children & neonatal physiology' },
  { module: 'womens', label: 'Women’s Health / OB', short: 'OB', eyebrow: 'Gynecology, pregnancy & maternal care' },
];
const ATLAS_DOMAINS: Partial<Record<Module, AtlasDomain>> = { vent: 'vent', heart: 'heart', neuro: 'neuro', lines: 'lines', abdomen: 'abdomen', labs: 'labs', pediatrics: 'pediatrics', womens: 'womens' };
const experienceCopy: Record<ReturnType<typeof experienceFor>, string> = {
  learn: 'Guided lessons with a single clinical objective at a time.',
  explore: 'Manipulate physiology and inspect what changes.',
  practice: 'Cases and simulation that make you commit to a decision.',
};

export function App() {
  useEngine(); useEffect(() => initProgressTracking(), []);
  const module = useUI((s) => s.module); const mode = useUI((s) => s.mode); const phone = useIsPhone();
  const experience = experienceFor(mode);
  const domain = module === 'videos'
    ? { module: 'videos' as Module, label: 'Videos', short: 'VD', eyebrow: 'Curated clinical media' }
    : DOMAINS.find((d) => d.module === module) ?? DOMAINS[0];
  const [mobilePane, setMobilePane] = useState<'scene' | 'context'>('context');
  const atlasDisease = useUI(s=>s.atlasDisease);
  const atlasDomain = ATLAS_DOMAINS[module];
  const showingAtlas = !!atlasDomain && (DISEASE_BY_ID[atlasDisease ?? '']?.domain === atlasDomain || module === 'pediatrics' || module === 'womens');
  const menu = useRef<HTMLDialogElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const resources = useRef<HTMLDetailsElement>(null);
  const chooseDomain = (next: Module) => {
    useUI.getState().set({ module: next, atlasDisease: null }); setMobilePane('context');
    menu.current?.close(); resources.current?.removeAttribute('open');
  };
  const chooseExperience = (next: typeof experience) => {
    selectExperience(next); setMobilePane(next === 'explore' ? 'scene' : 'context'); resources.current?.removeAttribute('open');
  };
  useEffect(() => { setMobilePane(mode === 'explore' ? 'scene' : 'context'); }, [module, mode]);
  useEffect(() => {
    const close = (e: PointerEvent) => { if (resources.current && !resources.current.contains(e.target as Node)) resources.current.removeAttribute('open'); };
    document.addEventListener('pointerdown', close); return () => document.removeEventListener('pointerdown', close);
  }, []);
  const domainItems = DOMAINS.map((d) => <button key={d.module} className={module === d.module ? 'on' : ''} onClick={() => chooseDomain(d.module)} aria-current={module === d.module ? 'page' : undefined}>
    <span className="domain-short" aria-hidden="true">{d.short}</span><span className="domain-label">{d.label}</span>
  </button>);
  return (
    <div className={`app app-v2 m-${module}${phone ? ' phone' : ''}`} data-mobile-pane={mobilePane} data-equipment={module === 'vent' && mode === 'sim' && !showingAtlas ? true : undefined}>
      <a className="skip-link" href="#workspace" onClick={(e) => { e.preventDefault(); const el = document.getElementById('workspace'); el?.focus(); el?.scrollIntoView({ block: 'start' }); }}>Skip to learning workspace</a>
      <header className="topbar topbar-v2">
        <button ref={menuTrigger} className="domain-menu-button" aria-label="Open clinical domains" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>☰</button>
        <button className="brand brand-home" onClick={() => useUI.getState().set({ module: 'curriculum' })} aria-label="Go to learning home">
          <Mark /><div><h1 className="b1">Critical Care</h1><div className="b2">see · understand · manipulate · apply</div></div>
        </button>
        <nav className="experience-nav" aria-label="Learning mode">
          {EXPERIENCES.map((item) => <button key={item.key} className={module !== 'curriculum' && module !== 'videos' && experience === item.key ? 'on' : ''} aria-pressed={module !== 'curriculum' && module !== 'videos' && experience === item.key} onClick={() => chooseExperience(item.key)}>{item.label}</button>)}
        </nav>
        <details className="resources-menu" ref={resources} onKeyDown={(e) => { if (e.key === 'Escape') { resources.current?.removeAttribute('open'); resources.current?.querySelector('summary')?.focus(); } }}>
          <summary aria-label="Learning resources"><span aria-hidden="true">⋯</span><span className="resource-label">Resources</span></summary>
          <nav aria-label="Learning resources">
            <button onClick={() => chooseDomain('videos')}>Videos &amp; Skills</button>
            <a href="audio/">Audio &amp; Mental Reps</a>
            <button onClick={() => chooseDomain('curriculum')}>Progress &amp; bookmarks</button>
          </nav>
        </details>
      </header>

      <dialog ref={menu} className="domain-dialog" aria-labelledby="domain-dialog-title" onClose={() => menuTrigger.current?.focus()} onClick={(e) => { if (e.target === e.currentTarget) menu.current?.close(); }}>
        <div className="domain-dialog-header"><h2 id="domain-dialog-title">Clinical domains</h2><button aria-label="Close clinical domains" onClick={() => menu.current?.close()}>×</button></div>
        <nav className="domain-drawer-list" aria-label="Choose a clinical domain">{domainItems}</nav>
      </dialog>
      <div className="product-shell">
        <aside className="domain-rail" aria-label="Clinical domains">
          {domainItems}
        </aside>

        <div id="workspace" tabIndex={-1} className="workspace">
          <div className="workspace-head">
            <div><div className="eyebrow">{domain.eyebrow}</div><div className="workspace-title">{module === 'curriculum' ? 'What do you want to learn?' : module === 'videos' ? 'Critical Care Videos' : domain.label}</div></div>
            <p>{module === 'curriculum' ? 'Continue where you left off, choose a domain, or jump into a focused practice session.' : module === 'videos' ? 'Browse critical-care Shorts and long-form teaching by category, device, task and level.' : experienceCopy[experience]}</p>
            {atlasDomain && !showingAtlas && <AtlasEntry domain={atlasDomain} onOpen={() => useUI.getState().set({atlasDisease:conditionsFor(atlasDomain)[0].id})} />}
            {experience === 'practice' && module !== 'curriculum' && module !== 'videos' && !showingAtlas && <div className="practice-switch" role="group" aria-label="Practice type">
              <button className={mode === 'challenge' ? 'on' : ''} onClick={() => useUI.getState().set({ mode: 'challenge' })}>Cases</button>
              <button className={mode === 'sim' ? 'on' : ''} onClick={() => useUI.getState().set({ mode: 'sim' })}>Simulator</button>
            </div>}
          </div>
          {module !== 'curriculum' && module !== 'videos' && !(module === 'vent' && mode === 'sim' && !showingAtlas) && <nav className="mobile-workspace-tabs" aria-label="Workspace view">
            <button aria-pressed={mobilePane === 'scene'} onClick={() => setMobilePane('scene')}>Scene</button>
            <button data-context-button aria-pressed={mobilePane === 'context'} onClick={() => setMobilePane('context')}>{experience === 'learn' ? 'Lessons' : experience === 'practice' ? 'Cases & controls' : 'Patient & controls'}</button>
          </nav>}
          {showingAtlas ? <AtlasModule key={module} domain={atlasDomain!} onExit={module === 'pediatrics' || module === 'womens' ? undefined : () => useUI.getState().set({atlasDisease:null})} onOpenVent={scenario => { useUI.getState().set({atlasDisease:null,module:'vent',mode:'sim',ventScenario:scenario}); }} /> : <>
            {module === 'vent' && <VentModule />}
            {module === 'abg' && <AbgModule />}
            {module === 'labs' && <LabModule />}
            {module === 'lines' && <LinesModule />}
            {module === 'neuro' && <NeuroModule />}
            {module === 'moa' && <MoaModule />}
            {module === 'heart' && <HeartModule />}
            {module === 'abdomen' && <AbdomenModule />}
          </>}
          {module === 'curriculum' && <CurriculumModule />}
          {module === 'videos' && <VideoLibrary />}
        </div>
      </div>
    </div>
  );
}

function VentModule() {
  const mode = useUI((s) => s.mode);
  const [asset, setAsset] = useState<RespAsset | null>(null); const [err, setErr] = useState<string | null>(null);
  const [panel, setPanel] = useState<'patient' | 'controls' | 'findings' | 'reference'>('patient');
  // semantic hook for lessons, the Lesson Director and automated checks (same calls the buttons make)
  useEffect(() => { (window as unknown as { __CCVent: unknown }).__CCVent = { session, focus: focusVentTarget, load: loadVentScenario, set: (p: Record<string, number>) => session.set(p) }; }, []);
  useEffect(() => { if(mode==='sim') return; loadRespAsset().then(setAsset).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, [mode]);
  const showLoops = useUI((s) => s.showLoops); const phone = useIsPhone(); const alv = useUI((s) => s.ventView === 'alveolus'); const xray = useUI((s) => s.ventView === 'xray'); const lus = useUI((s) => s.ventView === 'lus');
  if(mode==='sim') return <VentWorkbench />;
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap className={alv ? 'alv-wrap' : ''}>
          {lus ? <LusScene /> : xray ? <CxrScene /> : alv ? <AlveolusScene /> : asset ? <LungScene asset={asset} /> : <div className="loading">{err ? `Could not load the lung model: ${err}` : 'Loading lungs…'}</div>}
          <SceneOverlay />
        </SceneWrap>
        <div className="wave-wrap"><Scalars height={phone ? 210 : undefined} /></div>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane contextual-pane" aria-label="Learning context and controls"><h2 className="sr-only">Learning context and controls</h2>
        {mode === 'explore' && <>
          <nav className="context-tabs" aria-label="Respiratory workspace panel">
            {([['patient','Patient'],['controls','Controls'],['findings','Findings'],['reference','Reference']] as const).map(([k,l]) => <button key={k} className={panel === k ? 'on' : ''} onClick={() => setPanel(k)}>{l}</button>)}
          </nav>
          {panel === 'patient' && <div className="context-stack"><ScenarioPicker /><ScenarioStory /><VentNumbersCard /></div>}
          {panel === 'controls' && <div className="context-stack"><VentControls /><Interventions />{showLoops && <section className="card"><Loops /></section>}</div>}
          {panel === 'findings' && <div className="context-stack"><GasCard /><VentNumbersCard /></div>}
          {panel === 'reference' && <div className="context-stack"><ExplainCard /></div>}
        </>}
        {mode === 'learn' && <VentLearn />}
        {mode === 'challenge' && <VentChallenge />}
        {asset && <p className="credit">Anatomy: {asset.mapping.attribution.creators}, {asset.mapping.attribution.data} — <a href={asset.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{asset.mapping.attribution.license}</a>. {asset.mapping.attribution.changes} Lung motion is drawn 1.6× so tidal changes are visible.</p>}
      </aside>
    </main>
  );
}

function SceneOverlay() {
  const view = useUI((s) => s.ventView); const pm = useUI((s) => s.showPmus); const loops = useUI((s) => s.showLoops);
  const [viewOpen, setViewOpen] = useState(false); const [moreOpen, setMoreOpen] = useState(false);
  const set = useUI.getState().set;
  const views = [['front', 'Front'], ['side', 'Side'], ['airway', 'Airways'], ['base', 'Bases'], ['alveolus', 'Alveoli'], ['xray', 'X-ray'], ['lus', 'Lung US']] as const;
  const current = views.find(([k]) => k === view)?.[1] ?? 'View';
  const choose = (k: typeof views[number][0]) => { if (k === 'alveolus') focusVentTarget('lung.alveolus'); else set({ ventView: k, ventTarget: 'lung.whole' }); setViewOpen(false); };
  return (
    <>
      <div className="scene-primary-tools" role="toolbar" aria-label="Respiratory scene controls">
        <div className="scene-menu">
          <button className={`st-btn scene-menu-trigger${viewOpen ? ' on' : ''}`} aria-expanded={viewOpen} onClick={() => { setViewOpen(!viewOpen); setMoreOpen(false); }}>
            <span className="st-ico" aria-hidden="true">◫</span><span>View</span><small>{current}</small>
          </button>
          {viewOpen && <div className="scene-popover view-menu" role="menu">{views.map(([k, l]) => <button role="menuitemradio" aria-checked={view === k} key={k} className={view === k ? 'on' : ''} onClick={() => choose(k)}><span>{l}</span>{view === k && <b aria-hidden="true">✓</b>}</button>)}</div>}
        </div>
        {view !== 'xray' && view !== 'lus' && <div className="scene-menu">
          <button className={`st-btn scene-menu-trigger${moreOpen ? ' on' : ''}`} aria-expanded={moreOpen} onClick={() => { setMoreOpen(!moreOpen); setViewOpen(false); }}>
            <span className="st-ico" aria-hidden="true">•••</span><span>More</span>
          </button>
          {moreOpen && <div className="scene-popover more-menu">
            <button className={pm ? 'on' : ''} aria-pressed={pm} onClick={() => set({ showPmus: !pm })}><span>Patient effort</span><b>{pm ? 'On' : 'Off'}</b></button>
            <button className={loops ? 'on' : ''} aria-pressed={loops} onClick={() => set({ showLoops: !loops })}><span>Pressure-volume loops</span><b>{loops ? 'On' : 'Off'}</b></button>
          </div>}
        </div>}
      </div>
      {view === 'xray' || view === 'lus' ? null : view === 'alveolus' ? <AlveolusHud /> : <div className="legend">
        <span><i className="lg-air" />Aerated</span><span><i className="lg-col" />Collapsed</span><span><i className="lg-over" />Over-stretched</span><span><i className="lg-in" />Gas in</span><span><i className="lg-out" />Gas out</span>
      </div>}
    </>
  );
}

function Mark() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v10M16 14c-3 0-4 2-6 4s-5 3-5 7c0 2 1 3 3 3 3 0 5-3 6-6M16 14c3 0 4 2 6 4s5 3 5 7c0 2-1 3-3 3-3 0-5-3-6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>);
}
