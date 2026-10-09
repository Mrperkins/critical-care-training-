/** Domain icons for the rail and drawer: 24-unit line drawings, stroke = currentColor. */
import type { Module } from './store';

const P: Partial<Record<Module, string>> = {
  curriculum: 'M4 11l8-7 8 7M6 9.5V20h4.5v-5.5h3V20H18V9.5',
  vent: 'M12 3v7.5M12 10.5c-1.2 0-2 .8-2.6 1.8M12 10.5c1.2 0 2 .8 2.6 1.8M8.6 6.2C6 6.8 4 10 4 15c0 3 1.1 5 3.1 5 2.4 0 2.9-1.9 2.9-4V8.8c0-1.6-.4-2.8-1.4-2.6zM15.4 6.2C18 6.8 20 10 20 15c0 3-1.1 5-3.1 5-2.4 0-2.9-1.9-2.9-4V8.8c0-1.6.4-2.8 1.4-2.6z',
  abg: 'M12 3.5s6 6.4 6 10.9a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5zM9.2 15h5.6',
  labs: 'M9 3h6M10 3v6.2L5.2 17.6A2.3 2.3 0 0 0 7.2 21h9.6a2.3 2.3 0 0 0 2-3.4L14 9.2V3M7.4 15h9.2',
  lines: 'M2.5 14.5h3.2l2.4-8 2.2 7.2 1.4-2.2 1.6 3h3l1.8-5.5 1.8 5.5h1.6',
  heart: 'M12 20s-7.5-4.6-7.5-10.4A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
  abdomen: 'M9.5 3v4.2c0 1.8-3.5 3-3.5 7.3 0 4 3 6.5 6.8 6.5 3.7 0 6.2-2.6 6.2-5.6 0-2.1-1.4-3.4-3.1-3.4-2.1 0-2.6 2-4.1 2-1.2 0-2.3-.9-2.3-3V3',
  neuro: 'M12 5.2A3 3 0 0 0 6.6 6.6 3 3 0 0 0 4.2 10.4 3 3 0 0 0 5.4 15a3 3 0 0 0 3 3.8A3 3 0 0 0 12 19.6zM12 5.2a3 3 0 0 1 5.4 1.4 3 3 0 0 1 2.4 3.8 3 3 0 0 1-1.2 4.6 3 3 0 0 1-3 3.8 3 3 0 0 1-3.6.8M12 10h-2.5M12 14h2.5',
  moa: 'M10.6 20.2a4.9 4.9 0 0 1-6.9-6.9l6.7-6.7a4.9 4.9 0 0 1 6.9 6.9zM7.1 9.9l7 7',
  pediatrics: 'M12 8.5a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6zM8.6 21l.9-6.2h5l.9 6.2M9.5 14.8 6.4 11.6M14.5 14.8l3.1-3.2M9.5 14.8v-2.3a2.5 2.5 0 0 1 5 0v2.3',
  womens: 'M12 13.5a4.8 4.8 0 1 0 0-9.6 4.8 4.8 0 0 0 0 9.6zM12 13.5V21M8.8 17.5h6.4',
  videos: 'M4 6.5h16v11H4zM10.3 9.6v4.8l4.1-2.4z',
};

export function DomainIcon({ module }: { module: Module }) {
  const d = P[module] ?? P.curriculum!;
  return <svg className="domain-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
