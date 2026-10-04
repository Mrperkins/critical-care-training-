import React from 'react';
import { createRoot } from 'react-dom/client';
import { AudioApp } from './AudioApp';
import './audio.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode><AudioApp /></React.StrictMode>);

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost'))
  window.addEventListener('load', () => { navigator.serviceWorker.register('../sw.js').catch(() => undefined); });
