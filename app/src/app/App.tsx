import { CurriculumModule } from '../curriculum/CurriculumModule';
import { initProgressTracking } from '../curriculum/track';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AtlasEntry } from '../atlas/AtlasEntry';

// each module loads when it is first opened (Home paints without three.js)
const VentModule = lazy(() => import('../vent/VentModule'));
const AbgModule = lazy(() => import('../abg/AbgModule').then((m) => ({ default: m.AbgModule })));
const LabModule = lazy(() => import('../labs/LabModule').then((m) => ({ default: m.LabModule })));
const LinesModule = lazy(() => import('../lines/LinesModule').then((m) => ({ default: m.LinesModule })));
const NeuroModule = lazy(() => import('../neuro/NeuroModule').then((m) => ({ default: m.NeuroModule })));
const MoaModule = lazy(() => import('../moa/MoaModule').then((m) => ({ default: m.MoaModule })));
const HeartModule = lazy(() => import('../heart/HeartModule').then((m) => ({ default: m.HeartModule })));
const AbdomenModule = lazy(() => import('../abdomen/AbdomenModule').then((m) => ({ default: m.AbdomenModule })));
const AtlasModule = lazy(() => import('../atlas/AtlasModule').then((m) => ({ default: m.AtlasModule })));
const FpcModule = lazy(() => import('../fpc/FpcModule'));
const CasesModule = lazy(() => import('../cases/CasesModule'));
const VideoLibrary = lazy(() => import('../videos/VideoLibrary').then((m) => ({ default: m.VideoLibrary })));
/** shown for the moment a module's code is loading */
function ModuleLoading() { return <div className="module-loading" role="status"><span>Loading</span></div>; }
import { EXPERIENCES, experienceFor, selectExperience } from './experience';
import { useUI, type Module, type Mode } from './store';
import { session } from '../vent/session';
import { lab } from '../abg/lab';
import { bench } from '../labs/bench';
import { lines } from '../lines/session';
import type { AtlasDomain } from '../atlas/types';
import { conditionsFor, DISEASE_BY_ID } from '../atlas/registry';
import { DomainIcon } from './icons';
import { Library } from '../library/Library';
import { PlayerTop } from '../library/PlayerTop';
import { usePlayerUI } from '../library/playerUI';
import { GameHUD } from '../library/GameHUD';
import { CaseGame } from '../library/CaseGame';
import { useGame } from '../library/game';
import { SearchButton } from '../library/Search';
import { OfflineButton } from '../library/OfflineButton';
import { PlayerBar } from '../library/audio/PlayerBar';
import { usePlayer } from '../library/audio/player';
import { useLibrary } from '../library/libraryStore';
import { openLibrary } from '../library/launch';
import { endCase, isSceneCase, useCaseRun } from '../library/caseRun';

import { useIsPhone } from './useIsPhone';
export { useIsPhone };

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

const DOMAINS: { module: Module; label: string; eyebrow: string }[] = [
  { module: 'library', label: 'Browse', eyebrow: 'Modules, paths and cases' },
  { module: 'vent', label: 'Respiratory', eyebrow: 'Ventilation & gas exchange' },
  { module: 'abg', label: 'Blood gas', eyebrow: 'Acid–base & oxygenation' },
  { module: 'labs', label: 'Labs', eyebrow: 'Cellular & metabolic physiology' },
  { module: 'lines', label: 'Hemodynamics', eyebrow: 'Pressure, flow & access' },
  { module: 'heart', label: 'Cardiac', eyebrow: 'Pump, rhythm & circulation' },
  { module: 'abdomen', label: 'Abdomen', eyebrow: 'Perfusion, bleeding & imaging' },
  { module: 'neuro', label: 'Neuro', eyebrow: 'Brain, perfusion & pressure' },
  { module: 'moa', label: 'Pharmacology', eyebrow: 'Mechanism to whole patient' },
  { module: 'pediatrics', label: 'Pediatrics', eyebrow: 'Children & neonatal physiology' },
  { module: 'womens', label: 'Women’s Health / OB', eyebrow: 'Gynecology, pregnancy & maternal care' },
  { module: 'fpc', label: 'FP-C exam prep', eyebrow: 'IBSC Certified Flight Paramedic' },
  { module: 'cases', label: 'Case conference', eyebrow: 'Synthetic cases · Slides & audio' },
];
const ATLAS_DOMAINS: Partial<Record<Module, AtlasDomain>> = { vent: 'vent', heart: 'heart', neuro: 'neuro', lines: 'lines', abdomen: 'abdomen', labs: 'labs', pediatrics: 'pediatrics', womens: 'womens' };
export function App() {
  useEngine(); useEffect(() => initProgressTracking(), []);
  const module = useUI((s) => s.module); const mode = useUI((s) => s.mode); const phone = useIsPhone();
  const experience = experienceFor(mode);
  const domain = module === 'videos'
    ? { module: 'videos' as Module, label: 'Videos', eyebrow: 'Curated clinical media' }
    : module === 'curriculum' ? { module: 'curriculum' as Module, label: 'Progress & bookmarks', eyebrow: 'Your progress' }
    : DOMAINS.find((d) => d.module === module) ?? DOMAINS[0];
  const playing = useLibrary((s) => s.playing); const solo = useLibrary((s) => s.solo);
  const runningCase = useCaseRun((s) => s.id); const hasPlayer = usePlayer((s) => !!s.item);
  const libView = useLibrary((s) => s.view);
  const [mobilePane, setMobilePane] = useState<'scene' | 'context'>('context');
  const readers = usePlayerUI((s) => s.readers); const details = usePlayerUI((s) => s.details); const gameOn = useGame((s) => !!s.id);
  const [toolsOn, setToolsOn] = useState(false); const toolsT = useRef(0);
  const readerRef = useRef<(el: HTMLElement | null) => void>((el) => usePlayerUI.getState().set({ reader: el }));
  // a new step starts with the drawer and the step list closed
  useEffect(() => { usePlayerUI.getState().set({ details: false, steps: false, allTraces: false }); }, [playing?.moduleId, playing?.step, solo]);
  useEffect(() => { const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && usePlayerUI.getState().details) usePlayerUI.getState().set({ details: false }); }; document.addEventListener('keydown', esc); return () => document.removeEventListener('keydown', esc); }, []);
  const atlasDisease = useUI(s=>s.atlasDisease);
  const atlasDomain = ATLAS_DOMAINS[module];
  const showingAtlas = !!atlasDomain && (DISEASE_BY_ID[atlasDisease ?? '']?.domain === atlasDomain || module === 'pediatrics' || module === 'womens');
  const chooseDomain = (next: Module) => {
    useLibrary.getState().setPlaying(null); useLibrary.getState().setSolo(null); endCase();
    if (next === 'library') { openLibrary({ page: 'home' }); return; }
    useUI.getState().set({ module: next, atlasDisease: null }); setMobilePane('context');
  };
  const chooseExperience = (next: typeof experience) => {
    selectExperience(next); setMobilePane(next === 'explore' ? 'scene' : 'context');
  };
  useEffect(() => { setMobilePane(mode === 'explore' ? 'scene' : 'context'); }, [module, mode]);
  const inDomain = module !== 'curriculum' && module !== 'videos' && module !== 'fpc' && module !== 'cases' && module !== 'library';
  const inPlayer = inDomain && (!!playing || !!solo);
  const sceneCase = inPlayer && !!runningCase && isSceneCase(runningCase);
  const hasReader = inPlayer && readers > 0 && !sceneCase;
  // the side pane becomes the Details drawer when a lesson reads in the reader column or a case plays on the HUD
  const drawer = (hasReader || gameOn) && !sceneCase;
  const revealTools = (e: React.PointerEvent) => { const el = e.target as HTMLElement; if (!(inPlayer || gameOn) || !el.closest('.scene-pane') || el.closest('.hud, .lp-chips')) return; setToolsOn(true); clearTimeout(toolsT.current); toolsT.current = window.setTimeout(() => setToolsOn(false), 4500); };
  type Dest = 'home' | 'learn' | 'practice' | 'exam' | 'reference' | 'offline';
  const dest: Dest | null = module === 'fpc' ? 'exam' : module === 'cases' || module === 'videos' || module === 'curriculum' ? 'reference'
    : module !== 'library' ? (inPlayerNow(playing, solo) ? null : experience === 'practice' ? 'practice' : 'learn')
    : libView.page === 'home' ? 'home' : libView.page === 'practice' || (libView.page === 'shelf' && libView.filter === 'case') ? 'practice'
    : libView.page === 'offline' ? 'offline' : libView.page === 'reference' || libView.page === 'imaging' || libView.page === 'listen' || libView.page === 'review' ? 'reference' : 'learn';
  const navOn = (k: Dest) => dest === k;
  const DESTS: { k: Dest; label: string; short?: string; go: () => void }[] = [
    { k: 'home', label: 'Today', go: () => openLibrary({ page: 'home' }) },
    { k: 'learn', label: 'Learn', go: () => openLibrary({ page: 'learn' }) },
    { k: 'practice', label: 'Practice', go: () => openLibrary({ page: 'practice' }) },
    { k: 'exam', label: 'Exam prep', short: 'Exam', go: () => chooseDomain('fpc') },
    { k: 'reference', label: 'Reference', short: 'More', go: () => openLibrary({ page: 'reference' }) },
  ];
  const tools = <>
    {atlasDomain && !showingAtlas && <AtlasEntry domain={atlasDomain} onOpen={() => useUI.getState().set({atlasDisease:conditionsFor(atlasDomain)[0].id})} />}
    {experience === 'practice' && inDomain && !showingAtlas && module !== 'moa' && <div className="practice-switch" role="group" aria-label="Practice type">
      <button className={mode === 'challenge' ? 'on' : ''} aria-pressed={mode === 'challenge'} onClick={() => useUI.getState().set({ mode: 'challenge' })}>Cases</button>
      <button className={mode === 'sim' ? 'on' : ''} aria-pressed={mode === 'sim'} onClick={() => useUI.getState().set({ mode: 'sim' })}>Simulator</button>
    </div>}
  </>;
  return (
    <div className={`app app-v2 app-b m-${module}${phone ? ' phone' : ''}${inPlayer ? ' playing' : ''}${inDomain ? ' in-domain' : ''}${sceneCase ? ' scene-case' : ''}${hasPlayer ? ' has-player' : ''}${hasReader ? ' has-reader' : ''}${drawer ? ' drawer-mode' : ''}${drawer && details ? ' details-open' : ''}${gameOn ? ' game' : ''}${toolsOn ? ' tools-on' : ''}`} data-mobile-pane={sceneCase || hasReader || gameOn ? 'scene' : mobilePane} data-equipment={module === 'vent' && mode === 'sim' && !showingAtlas ? true : undefined}>
      <a className="skip-link" href="#workspace" onClick={(e) => { e.preventDefault(); const el = document.getElementById('workspace'); el?.focus(); el?.scrollIntoView({ block: 'start' }); }}>Skip to learning workspace</a>
      {inPlayer ? <PlayerTop /> : <header className="topbar topbar-v2">
        <button className="brand brand-home" onClick={() => { useLibrary.getState().setPlaying(null); openLibrary({ page: 'home' }); }} aria-label="Go to browse">
          <Mark /><h1 className="b1">Critical Care</h1>
        </button>
        <nav className="lib-nav" aria-label="Primary">
          {DESTS.map((d) => <button key={d.k} className={navOn(d.k) ? 'on' : ''} aria-current={navOn(d.k) ? 'page' : undefined} onClick={d.go}>{d.label}</button>)}
        </nav>
        {inDomain && <div className="topbar-context">
          <h2 className="domain-title"><DomainIcon module={domain.module} /><span>{domain.label}</span></h2>
          {!inPlayer && module !== 'moa' && <nav className="experience-nav" aria-label="Learning mode">
            {EXPERIENCES.map((item) => <button key={item.key} className={inDomain && experience === item.key ? 'on' : ''} aria-pressed={inDomain && experience === item.key} onClick={() => chooseExperience(item.key)}>{item.label}</button>)}
          </nav>}
          <div className="topbar-tools">{tools}</div>
        </div>}
        <div className="topbar-end">
        <OfflineButton on={navOn('offline')} />
        <SearchButton />
        </div>
      </header>}

      <div className="product-shell">
        <div id="workspace" tabIndex={-1} className="workspace" onPointerDown={revealTools}>
          {inDomain && !sceneCase && !(module === 'vent' && mode === 'sim' && !showingAtlas) && <nav className="mobile-workspace-tabs" aria-label="Workspace view">
            <button aria-pressed={mobilePane === 'scene'} data-scene-button onClick={() => setMobilePane('scene')}>Scene</button>
            <button data-context-button aria-pressed={mobilePane === 'context'} onClick={() => setMobilePane('context')}>{experience === 'learn' ? 'Lessons' : mode === 'challenge' ? 'Questions' : 'Controls'}</button>
            <span className="mobile-tools">{tools}</span>
          </nav>}
          {inDomain && module === 'vent' && mode === 'sim' && !showingAtlas && <nav className="mobile-workspace-tabs sim-only" aria-label="Practice type"><span className="mobile-tools">{tools}</span></nav>}
          <Suspense fallback={<ModuleLoading />}>{showingAtlas ? <AtlasModule key={module} domain={atlasDomain!} onExit={module === 'pediatrics' || module === 'womens' ? undefined : () => useUI.getState().set({atlasDisease:null})} onOpenVent={scenario => { useUI.getState().set({atlasDisease:null,module:'vent',mode:'sim',ventScenario:scenario}); }} /> : <>
            {module === 'vent' && <VentModule />}
            {module === 'abg' && <AbgModule />}
            {module === 'labs' && <LabModule />}
            {module === 'lines' && <LinesModule />}
            {module === 'neuro' && <NeuroModule />}
            {module === 'moa' && <MoaModule />}
            {module === 'heart' && <HeartModule />}
            {module === 'abdomen' && <AbdomenModule />}
          </>}
          {module === 'library' && <Library />}
          {module === 'curriculum' && <CurriculumModule />}
          {module === 'videos' && <VideoLibrary />}
          {module === 'fpc' && <FpcModule />}</Suspense>
          {module === 'cases' && <Suspense fallback={<ModuleLoading />}><CasesModule /></Suspense>}
          <GameHUD />
          {drawer && details && <button className="lp-drawer-close" onClick={() => usePlayerUI.getState().set({ details: false })} aria-label="Close details">×</button>}
          {drawer && details && <div className="lp-drawer-scrim" onClick={() => usePlayerUI.getState().set({ details: false })} aria-hidden="true" />}
        </div>
        {inPlayer && <aside className="lp-reader" ref={readerRef.current} aria-label="Lesson" />}
        {inPlayer && <CaseGame />}
      </div>
      {!inPlayer && <nav className="tabbar" aria-label="Primary, phone">
        {DESTS.map((d) => <button key={d.k} className={navOn(d.k) ? 'on' : ''} aria-current={navOn(d.k) ? 'page' : undefined} onClick={d.go}><TabIcon k={d.k} /><span>{d.short ?? d.label}</span></button>)}
      </nav>}
      <PlayerBar />
    </div>
  );
}

const inPlayerNow = (playing: unknown, solo: unknown) => !!playing || !!solo;
const TAB_ICON: Record<string, string> = {
  home: 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  learn: 'M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-5a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h5z',
  practice: 'M3 12h4l2-6 4 12 2-6h6',
  exam: 'M6 3h9l4 4v14H6zM9 12l2 2 4-4M9 17h6',
  reference: 'M5 4h4v16H5zM10.5 4h4v16h-4zM16 5l3.5-.8 3 15-3.5.8z',
};
function TabIcon({ k }: { k: string }) { return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={TAB_ICON[k]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function Mark() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v10M16 14c-3 0-4 2-6 4s-5 3-5 7c0 2 1 3 3 3 3 0 5-3 6-6M16 14c3 0 4 2 6 4s5 3 5 7c0 2-1 3-3 3-3 0-5-3-6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>);
}
