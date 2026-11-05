/** Search button + dialog in the top bar. "/" opens it from anywhere outside a text field. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { openDrug, openLesson } from '../app/navigate';
import { HIT_LABEL, search, type Hit } from './searchIndex';
import { useLibrary } from './libraryStore';
import { openLibrary, runCase } from './launch';
import { endCase } from './caseRun';

function openHit(h: Hit) {
  if (h.kind === 'module') { openLibrary({ page: 'module', id: h.id }); return; }
  if (h.kind === 'case') { runCase(h.id); return; }
  endCase(); useLibrary.getState().setPlaying(null); useLibrary.getState().setSolo(null);
  if (h.kind === 'drug') openDrug(h.id); else openLesson(h.id);
}

export function SearchButton() {
  const dlg = useRef<HTMLDialogElement>(null); const trigger = useRef<HTMLButtonElement>(null); const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const groups = useMemo(() => search(q), [q]);
  const flat = groups.flatMap((g) => g.hits); const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [q]);
  const open = () => { dlg.current?.showModal(); setTimeout(() => input.current?.focus(), 0); };
  const close = () => dlg.current?.close();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault(); open();
    };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, []);
  const choose = (h: Hit) => { close(); setQ(''); openHit(h); };
  return (
    <>
      <button ref={trigger} className="lib-search-btn" aria-label="Search" aria-haspopup="dialog" onClick={open}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        <span className="lib-search-label">Search</span><kbd>/</kbd>
      </button>
      <dialog ref={dlg} className="lib-search" aria-label="Search" onClose={() => trigger.current?.focus()} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
        <div className="lib-search-box">
          <label className="lib-search-field">
            <span className="sr-only">Search topics, cases, conditions and drugs</span>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input ref={input} type="search" value={q} placeholder="Search topics, cases, conditions, drugs…" autoComplete="off"
              role="combobox" aria-expanded={flat.length > 0} aria-controls="lib-search-results" aria-activedescendant={flat[active] ? `sr-${active}` : undefined}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(flat.length - 1, a + 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                else if (e.key === 'Enter' && flat[active]) { e.preventDefault(); choose(flat[active]); }
              }} />
            <button type="button" className="lib-search-close" onClick={close}>Close</button>
          </label>
          <div id="lib-search-results" role="listbox" aria-label="Results" className="lib-search-results">
            {q.trim().length < 2 && <p className="lib-search-hint">Try “auto-PEEP”, “damping”, “DKA”, “stroke” or a drug name.</p>}
            {q.trim().length >= 2 && !flat.length && <p className="lib-search-hint">Nothing matches “{q}”.</p>}
            {groups.map((g) => <div key={g.kind} role="group" aria-label={HIT_LABEL[g.kind]}>
              <h3>{HIT_LABEL[g.kind]}</h3>
              {g.hits.map((h) => { const i = flat.indexOf(h); return (
                <div key={`${h.kind}-${h.id}`} id={`sr-${i}`} role="option" aria-selected={i === active} className={`lib-search-hit${i === active ? ' on' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => choose(h)}>
                  <b>{h.title}</b>{h.sub && <span>{h.sub}</span>}
                </div>); })}
            </div>)}
          </div>
        </div>
      </dialog>
    </>
  );
}
