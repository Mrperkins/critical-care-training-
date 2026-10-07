import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/app.css';
import { useUI, type Module, type Mode } from './app/store';
import { openLesson } from './app/navigate';
import { session } from './vent/session';
import { lab } from './abg/lab';
import { useAbgUI } from './abg/abgStore';

createRoot(document.getElementById('root')!).render(<App />);

// Deep links used by Critical Care Audio to hand a concept back to the visual product.
const qp = new URLSearchParams(location.search);
const linkedLesson = qp.get('lesson');
if (linkedLesson) setTimeout(() => openLesson(linkedLesson), 0);
else {
  const modules: Module[] = ['vent','abg','labs','lines','neuro','moa','heart','abdomen','curriculum','videos'];
  const modes: Mode[] = ['explore','learn','challenge','sim'];
  const module = qp.get('module') as Module | null, mode = qp.get('mode') as Mode | null;
  const patch: Partial<ReturnType<typeof useUI.getState>> = {};
  if (module && modules.includes(module)) patch.module = module;
  if (mode && modes.includes(mode)) patch.mode = mode;
  if (Object.keys(patch).length) useUI.getState().set(patch);
}
// offline support (published site only: the service worker file sits next to index.html)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost') && !(window as unknown as { __NO_SW__?: boolean }).__NO_SW__)
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => undefined); });
// hooks for automated checks
(window as unknown as Record<string, unknown>).__ui = useUI;
(window as unknown as Record<string, unknown>).__vent = session;
(window as unknown as Record<string, unknown>).__lab = lab;
(window as unknown as Record<string, unknown>).__abgui = useAbgUI;
import { bench } from './labs/bench';
import { useLabUI } from './labs/labStore';
(window as unknown as Record<string, unknown>).__bench = bench;
(window as unknown as Record<string, unknown>).__labui = useLabUI;
import { live } from './labs/cell/live';
import { CLIP } from './labs/cell/CellScene';
(window as unknown as Record<string, unknown>).__cell = { live, CLIP };
