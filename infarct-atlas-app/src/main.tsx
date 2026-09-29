import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(<App />);

// test hook for automated visual checks
import { useApp } from './engine/store';
(window as unknown as { __app: typeof useApp }).__app = useApp;
