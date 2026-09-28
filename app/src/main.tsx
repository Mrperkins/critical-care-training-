import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/app.css';
import { useUI } from './app/store';
import { session } from './vent/session';
import { lab } from './abg/lab';
import { useAbgUI } from './abg/abgStore';

createRoot(document.getElementById('root')!).render(<App />);
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
