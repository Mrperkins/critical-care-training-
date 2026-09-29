import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(<App />);

// semantic hooks for automated checks and the Lesson Director: same calls the UI makes
import { useApp, sequenceScene } from './engine/store';
(window as unknown as { __app: typeof useApp }).__app = useApp;
(window as unknown as { __IA: unknown }).__IA = {
  app: useApp,
  /** deterministic seek along the Normal → MI sequence (0–1) */
  seek: (v: number) => { const x = Math.max(0, Math.min(1, v)); useApp.getState().set({ seq: x, seqPlaying: false, scene: sequenceScene(x) }); },
  territory: (id: string | null) => useApp.getState().set({ territoryId: id, culpritIndex: 0, seq: 0, seqPlaying: false }),
};
