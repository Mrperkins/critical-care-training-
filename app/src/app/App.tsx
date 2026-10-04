import { CurriculumModule } from '../curriculum/CurriculumModule';
import { initProgressTracking } from '../curriculum/track';
import { useEffect, useState } from 'react';
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
import { VentSim } from '../vent/VentSim';
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
];
type Experience = 'learn' | 'explore' | 'practice';
const EXPERIENCE: { key: Experience; label: string }[] = [
  { key: 'learn', label: 'Learn' },
  { key: 'explore', label: 'Explore' },
  { key: 'practice', label: 'Practice' },
];
const experienceFor = (mode: Mode): Experience => mode === 'challenge' || mode === 'sim' ? 'practice' : mode;
const experienceCopy: Record<Experience, string> = {
  learn: 'Guided lessons with a single clinical objective at a time.',
  explore: 'Manipulate physiology and inspect what changes.',
  practice: 'Cases and simulation that make you commit to a decision.',
};

export function App() {
  useEngine(); useEffect(() => initProgressTracking(), []);
  const module = useUI((s) => s.module); const mode = useUI((s) => s.mode); const phone = useIsPhone();
  const experience = experienceFor(mode);
  const domain = DOMAINS.find((d) => d.module === module) ?? DOMAINS[0];
  const chooseExperience = (next: Experience) => {
    if (next === 'practice') useUI.getState().set({ mode: mode === 'sim' ? 'sim' : 'challenge' });
    else useUI.getState().set({ mode: next });
  };
  return (
    <div className={`app app-v2 m-${module}${phone ? ' phone' : ''}`}>
      <a className="skip-link" href="#workspace" onClick={(e) => { e.preventDefault(); const el = document.getElementById('workspace'); el?.focus(); el?.scrollIntoView({ block: 'start' }); }}>Skip to learning workspace</a>
      <header className="topbar topbar-v2">
        <button className="brand brand-home" onClick={() => useUI.getState().set({ module: 'curriculum' })} aria-label="Go to learning home">
          <Mark /><div><h1 className="b1">Critical Care</h1><div className="b2">see · understand · manipulate · apply</div></div>
        </button>
        <nav className="experience-nav" aria-label="Learning mode">
          {EXPERIENCE.map((item) => <button key={item.key} className={experience === item.key ? 'on' : ''} onClick={() => chooseExperience(item.key)}>{item.label}</button>)}
        </nav>
        <a className="audio-launch" href="audio/"><span className="audio-icon" aria-hidden="true">♪</span><span><b>Audio</b><small>Expert tracks</small></span></a>
      </header>

      <div className="product-shell">
        <aside className="domain-rail" aria-label="Clinical domains">
          {DOMAINS.map((d) => <button key={d.module} className={module === d.module ? 'on' : ''} onClick={() => useUI.getState().set({ module: d.module })} aria-current={module === d.module ? 'page' : undefined}>
            <span className="domain-short" aria-hidden="true">{d.short}</span><span className="domain-label">{d.label}</span>
          </button>)}
        </aside>

        <div id="workspace" tabIndex={-1} className="workspace">
          <div className="workspace-head">
            <div><div className="eyebrow">{domain.eyebrow}</div><div className="workspace-title">{module === 'curriculum' ? 'What do you want to learn?' : domain.label}</div></div>
            <p>{module === 'curriculum' ? 'Continue where you left off, choose a domain, or jump into a focused practice session.' : experienceCopy[experience]}</p>
            {experience === 'practice' && module !== 'curriculum' && <div className="practice-switch" role="group" aria-label="Practice type">
              <button className={mode === 'challenge' ? 'on' : ''} onClick={() => useUI.getState().set({ mode: 'challenge' })}>Cases</button>
              <button className={mode === 'sim' ? 'on' : ''} onClick={() => useUI.getState().set({ mode: 'sim' })}>Simulator</button>
            </div>}
          </div>
          {module === 'vent' && <VentModule />}
          {module === 'abg' && <AbgModule />}
          {module === 'labs' && <LabModule />}
          {module === 'lines' && <LinesModule />}
          {module === 'neuro' && <NeuroModule />}
          {module === 'moa' && <MoaModule />}
          {module === 'heart' && <HeartModule />}
          {module === 'abdomen' && <AbdomenModule />}
          {module === 'curriculum' && <CurriculumModule />}
        </div>
      </div>
    </div>
  );
}

function VentModule() {
  const [asset, setAsset] = useState<RespAsset | null>(null); const [err, setErr] = useState<string | null>(null);
  // semantic hook for lessons, the Lesson Director and automated checks (same calls the buttons make)
  useEffect(() => { (window as unknown as { __CCVent: unknown }).__CCVent = { session, focus: focusVentTarget, load: loadVentScenario, set: (p: Record<string, number>) => session.set(p) }; }, []);
  useEffect(() => { loadRespAsset().then(setAsset).catch((e) => { console.error(e); setErr(String(e?.message || e)); }); }, []);
  const mode = useUI((s) => s.mode); const showLoops = useUI((s) => s.showLoops); const phone = useIsPhone(); const alv = useUI((s) => s.ventView === 'alveolus'); const xray = useUI((s) => s.ventView === 'xray'); const lus = useUI((s) => s.ventView === 'lus');
  return (
    <main className="stage">
      <section className="scene-pane">
        <SceneWrap className={alv ? 'alv-wrap' : ''}>
          {lus ? <LusScene /> : xray ? <CxrScene /> : alv ? <AlveolusScene /> : asset ? <LungScene asset={asset} /> : <div className="loading">{err ? `Could not load the lung model: ${err}` : 'Loading lungs…'}</div>}
          <SceneOverlay />
        </SceneWrap>
        <div className="wave-wrap"><Scalars height={phone ? 210 : undefined} /></div>
      </section>
      <aside id="controls" tabIndex={-1} className="side-pane" aria-label="Controls and readings"><h2 className="sr-only">Controls and readings</h2>
        {mode === 'explore' && <>
          <ScenarioPicker />
          <ScenarioStory />
          <VentNumbersCard />
          <Interventions />
          {showLoops && <section className="card"><Loops /></section>}
          <VentControls />
          <GasCard />
          <ExplainCard />
        </>}
        {mode === 'learn' && <VentLearn />}
        {mode === 'challenge' && <VentChallenge />}
        {mode === 'sim' && <VentSim />}
        {asset && <p className="credit">Anatomy: {asset.mapping.attribution.creators}, {asset.mapping.attribution.data} — <a href={asset.mapping.attribution.licenseUrl} target="_blank" rel="noreferrer">{asset.mapping.attribution.license}</a>. {asset.mapping.attribution.changes} Lung motion is drawn 1.6× so tidal changes are visible.</p>}
      </aside>
    </main>
  );
}

function SceneOverlay() {
  const view = useUI((s) => s.ventView); const pm = useUI((s) => s.showPmus); const loops = useUI((s) => s.showLoops);
  const set = useUI.getState().set;
  return (
    <>
      <div className="view-btns" ref={(n) => { const b = n?.querySelector<HTMLElement>('button.on'); if (n && b && n.scrollWidth > n.clientWidth) n.scrollLeft = b.offsetLeft - 8; }}>
        {([['front', 'Front'], ['side', 'Side'], ['airway', 'Airways'], ['base', 'Bases'], ['alveolus', 'Alveoli'], ['xray', 'X-ray'], ['lus', 'Lung US']] as const).map(([k, l]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => (k === 'alveolus' ? focusVentTarget('lung.alveolus') : set({ ventView: k, ventTarget: 'lung.whole' }))}>{l}</button>)}
      </div>
      {view === 'xray' || view === 'lus' ? null : view === 'alveolus' ? <AlveolusHud /> : <div className="legend">
        <span><i className="lg-air" />Aerated</span><span><i className="lg-col" />Collapsed</span><span><i className="lg-over" />Over-stretched</span><span><i className="lg-in" />Gas in</span><span><i className="lg-out" />Gas out</span>
      </div>}
      {view !== 'xray' && view !== 'lus' && <div className="scene-tools">
        <button className={`tgl${pm ? ' on' : ''}`} onClick={() => set({ showPmus: !pm })}>Patient effort</button>
        <button className={`tgl${loops ? ' on' : ''}`} onClick={() => set({ showLoops: !loops })}>Loops</button>
      </div>}
    </>
  );
}

function Mark() {
  return (<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4v10M16 14c-3 0-4 2-6 4s-5 3-5 7c0 2 1 3 3 3 3 0 5-3 6-6M16 14c3 0 4 2 6 4s5 3 5 7c0 2-1 3-3 3-3 0-5-3-6-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>);
}
