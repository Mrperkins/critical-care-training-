/**
 * Side-pane building blocks that keep every module's controls short:
 *  - Picker: one "Scenario ▾" line that opens a grouped menu, instead of a wall of pills.
 *  - Fold: a collapsible section. Folds in the same group behave as an accordion (opening one closes the
 *    others) and the open one is remembered per module.
 *  - MiniSelect: a compact labelled dropdown for scene overlays (focus / view).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { create } from 'zustand';

/* ------------------------------------------------------------------ Picker */
export interface PickItem { id: string; name: string; hint?: string; right?: ReactNode; tone?: 'bad' | 'ok' }
export interface PickGroup { label?: string; items: PickItem[] }
export function Picker({ label, value, groups, onPick, sub }: { label: string; value: string; groups: PickGroup[]; onPick: (id: string) => void; sub?: ReactNode }) {
  const [open, setOpen] = useState(false); const [q, setQ] = useState(''); const ref = useRef<HTMLDivElement>(null);
  const all = groups.flatMap((g) => g.items); const cur = all.find((i) => i.id === value);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', key);
    requestAnimationFrame(() => { const r = ref.current; (r?.querySelector<HTMLElement>('.pick-item.on') ?? r?.querySelector<HTMLElement>('.pick-item'))?.focus({ preventScroll: false }); });
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', key); };
  }, [open]);
  const match = (i: PickItem) => !q || `${i.name} ${i.hint ?? ''}`.toLowerCase().includes(q.toLowerCase());
  return (
    <div className={`picker${open ? ' open' : ''}`} ref={ref}>
      <button type="button" className="pick-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="pick-l">{label}</span><span className="pick-v">{cur?.name ?? value}</span><span className="pick-ch" aria-hidden="true">▾</span>
      </button>
      {sub && !open && <div className="pick-sub">{sub}</div>}
      {open && <div className="pick-pop" role="listbox" aria-label={label}>
        {all.length > 12 && <input className="pick-q" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${label}`} />}
        {groups.map((g, gi) => { const items = g.items.filter(match); if (!items.length) return null;
          return <div key={g.label ?? gi} className="pick-g">{g.label && <div className="pick-gl">{g.label}</div>}
            {items.map((i) => <button key={i.id} type="button" role="option" aria-selected={i.id === value} className={`pick-item${i.id === value ? ' on' : ''}${i.tone ? ` t-${i.tone}` : ''}`} onClick={() => { onPick(i.id); setOpen(false); setQ(''); }}>
              <span className="pi-n">{i.name}{i.hint && <small>{i.hint}</small>}</span>{i.right != null && <span className="pi-r">{i.right}</span>}
            </button>)}
          </div>; })}
      </div>}
    </div>
  );
}

/* ------------------------------------------------------------------ Fold (accordion) */
const KEY = 'cc.folds';
const read = (): Record<string, string | null> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const useFolds = create<{ open: Record<string, string | null>; set: (g: string, id: string | null) => void }>((set, get) => ({
  open: read(),
  set: (g, id) => { const open = { ...get().open, [g]: id }; set({ open }); try { localStorage.setItem(KEY, JSON.stringify(open)); } catch { /* private mode */ } },
}));
export function Fold({ group, id, title, summary, children, defaultOpen = false }: { group: string; id: string; title: string; summary?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const stored = useFolds((s) => s.open[group]); const set = useFolds((s) => s.set);
  const open = stored === undefined ? defaultOpen : stored === id;
  return (
    <section className={`fold${open ? ' open' : ''}`} data-fold={id}>
      <button type="button" className="fold-h" aria-expanded={open} onClick={() => set(group, open ? null : id)}>
        <span className="fold-t">{title}</span>{summary != null && !open && <span className="fold-s">{summary}</span>}<span className="fold-ch" aria-hidden="true">▾</span>
      </button>
      {open && <div className="fold-b">{children}</div>}
    </section>
  );
}
/** open a fold from code (lessons, remediation links) */
export const openFold = (group: string, id: string) => useFolds.getState().set(group, id);

/* ------------------------------------------------------------------ MiniSelect (scene overlays) */
export function MiniSelect<T extends string>({ label, value, options, onChange, className = '' }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void; className?: string }) {
  return (
    <label className={`mini-sel ${className}`.trim()}>
      <span className="ms-l">{label}</span>
      <select value={options.some(([k]) => k === value) ? value : ''} onChange={(e) => onChange(e.target.value as T)} aria-label={label}>
        {!options.some(([k]) => k === value) && <option value="" disabled>—</option>}
        {options.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    </label>
  );
}
