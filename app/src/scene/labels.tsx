/**
 * Shared 3D-label system for every scene.
 *
 *  • One global label mode, remembered per browser: "all" (names), "dots" (tidy: a small dot per structure — hover
 *    or tap it for the name), "off" (none). Labels flagged `important` (alerts, live values) stay readable in "dots".
 *  • Every label is a button: hover (mouse) previews, click / tap pins an info card with a short description from
 *    the glossary (scene/labelInfo.ts). The card lives inside the scene wrapper, so it also works in full screen.
 *  • SceneWrap = the scene container with the full-screen and label-mode controls.
 */
import { forwardRef, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { create } from 'zustand';
import { describeLabel, labelKey } from './labelInfo';

export type LabelMode = 'all' | 'dots' | 'off';
(globalThis as unknown as { __CCLabels?: unknown }).__CCLabels = { describe: describeLabel, key: labelKey };
const KEY = 'cc.labelMode';
const load = (): LabelMode => { try { const v = globalThis.localStorage?.getItem(KEY); return v === 'dots' || v === 'off' ? v : 'all'; } catch { return 'all'; } };

interface InfoCard { title: string; key: string; desc: string | null; rect: DOMRect; pinned: boolean; host: HTMLElement | null }
interface LabelState { mode: LabelMode; card: InfoCard | null; setMode: (m: LabelMode) => void; show: (c: InfoCard | null) => void }
export const useLabels = create<LabelState>((set) => ({
  mode: load(), card: null,
  setMode: (mode) => { try { globalThis.localStorage?.setItem(KEY, mode); } catch { /* storage unavailable */ } set({ mode, card: null }); },
  show: (card) => set({ card }),
}));
export const useSceneLabelMode = () => useLabels((s) => s.mode);
const NEXT: Record<LabelMode, LabelMode> = { all: 'dots', dots: 'off', off: 'all' };
const MODE_TEXT: Record<LabelMode, string> = { all: 'Labels', dots: 'Dots', off: 'No labels' };
const MODE_HINT: Record<LabelMode, string> = { all: 'Labels on — tap any label for details', dots: 'Tidy labels — tap a dot for its name and details', off: 'Labels off' };

/** The scene container a chip sits in (cards are positioned and portalled relative to it). */
const hostOf = (el: Element | null) => (el?.closest('.scene-wrap') as HTMLElement | null) ?? null;

export interface LabelChipProps {
  text: ReactNode;
  /** existing visual classes, e.g. "blabel b-rbc" or "tag3d tk t-art" */
  className?: string;
  /** glossary key when the visible text is dynamic (numbers, states) */
  info?: string;
  /** stay readable (not a dot) in "dots" mode — alerts and live values */
  important?: boolean;
  style?: CSSProperties;
}

/**
 * A label inside a drei <Html>. Renders nothing / a dot / the named chip depending on the global mode, and opens
 * the description card on hover, click or tap. The forwarded ref points at the text element (scenes that update
 * the text or visibility each frame keep working).
 */
export const LabelChip = forwardRef<HTMLButtonElement, LabelChipProps>(function LabelChip({ text, className = 'tag3d', info, important, style }, ref) {
  const mode = useSceneLabelMode(); const show = useLabels((s) => s.show);
  const plain = typeof text === 'string' || typeof text === 'number' ? String(text) : '';
  const own = useRef<HTMLButtonElement | null>(null);
  const card = (pinned: boolean) => {
    const el = own.current; if (!el) return;
    const title = (el.dataset.title || el.textContent || plain).trim(); const key = info ?? labelKey(title);
    show({ title, key, desc: describeLabel(key, title), rect: el.getBoundingClientRect(), pinned, host: hostOf(el) });
  };
  if (mode === 'off') return null;
  const dot = mode === 'dots' && !important;
  const setRefs = (el: HTMLButtonElement | null) => { own.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; };
  return (
    <button
      ref={setRefs} type="button" style={style}
      className={`lchip ${className}${dot ? ' ldot' : ''}`}
      data-label-key={info ?? labelKey(plain)} data-title={dot ? plain : undefined}
      aria-label={dot ? `${plain} — show details` : undefined}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !useLabels.getState().card?.pinned) card(false); }}
      onPointerLeave={(e) => { const c = useLabels.getState().card; if (e.pointerType === 'mouse' && c && !c.pinned) show(null); }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); const c = useLabels.getState().card; const t = (own.current?.dataset.title || own.current?.textContent || plain).trim(); if (c?.pinned && c.title === t) show(null); else card(true); }}
    >{dot ? null : text}</button>
  );
});

/** The description card for the label being hovered or tapped (rendered inside the scene wrapper). */
function LabelInfoCard({ host }: { host: HTMLElement | null }) {
  const card = useLabels((s) => s.card); const show = useLabels((s) => s.show); const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  useEffect(() => {
    if (!card || !host || card.host !== host) { setPos(null); return; }
    const h = host.getBoundingClientRect(); const w = box.current?.offsetWidth ?? 260, ht = box.current?.offsetHeight ?? 90;
    let left = card.rect.left - h.left + card.rect.width / 2 - w / 2; let top = card.rect.bottom - h.top + 8;
    if (top + ht > h.height - 8) top = card.rect.top - h.top - ht - 8; // flip above when there is no room below
    left = Math.max(8, Math.min(left, h.width - w - 8)); top = Math.max(8, Math.min(top, h.height - ht - 8));
    setPos({ left, top });
  }, [card, host]);
  useEffect(() => { // tap/click elsewhere or Escape closes a pinned card
    if (!card?.pinned) return;
    const off = (e: PointerEvent) => { if (!(e.target as Element)?.closest?.('.linfo, .lchip')) show(null); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') show(null); };
    window.addEventListener('pointerdown', off, true); window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', off, true); window.removeEventListener('keydown', esc); };
  }, [card?.pinned, show]);
  if (!card || card.host !== host) return null;
  return (
    <div ref={box} className={`linfo${card.pinned ? ' pinned' : ''}`} role={card.pinned ? 'dialog' : 'tooltip'} aria-label={card.title}
      style={pos ? { left: pos.left, top: pos.top } : { visibility: 'hidden', left: 0, top: 0 }}>
      <div className="linfo-h"><b>{card.title}</b>{card.pinned && <button type="button" className="linfo-x" aria-label="Close" onClick={() => show(null)}>×</button>}</div>
      <p>{card.desc ?? 'A structure in this view.'}</p>
    </div>
  );
}

/** Full screen for the scene container: the Fullscreen API where it exists, a fixed full-viewport overlay otherwise (iPhone). */
function useFullscreen(el: React.RefObject<HTMLElement>) {
  const [on, setOn] = useState(false); const [pseudo, setPseudo] = useState(false);
  useEffect(() => {
    const sync = () => setOn(!!el.current && document.fullscreenElement === el.current);
    document.addEventListener('fullscreenchange', sync); return () => document.removeEventListener('fullscreenchange', sync);
  }, [el]);
  useEffect(() => {
    if (!pseudo) return; const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPseudo(false); };
    document.documentElement.classList.add('fs-lock'); window.addEventListener('keydown', esc);
    return () => { document.documentElement.classList.remove('fs-lock'); window.removeEventListener('keydown', esc); };
  }, [pseudo]);
  const toggle = useCallback(async () => {
    const node = el.current; if (!node) return;
    if (on) { await document.exitFullscreen?.().catch(() => undefined); return; }
    if (pseudo) { setPseudo(false); return; }
    if (document.fullscreenEnabled && node.requestFullscreen) { try { await node.requestFullscreen({ navigationUI: 'hide' }); return; } catch { /* fall back */ } }
    setPseudo(true);
  }, [el, on, pseudo]);
  return { active: on || pseudo, pseudo, toggle };
}

/** Scene container used by every module: full-screen button, label-mode switch, and the label info card. */
export function SceneWrap({ className = '', children, labels = true }: { className?: string; children: ReactNode; labels?: boolean }) {
  const ref = useRef<HTMLDivElement>(null); const fs = useFullscreen(ref); const mode = useSceneLabelMode(); const setMode = useLabels((s) => s.setMode);
  const [host, setHost] = useState<HTMLElement | null>(null); const [hint, setHint] = useState<string | null>(null);
  useEffect(() => { if (!hint) return; const t = setTimeout(() => setHint(null), 2400); return () => clearTimeout(t); }, [hint]);
  useEffect(() => setHost(ref.current), []);
  useEffect(() => { window.dispatchEvent(new Event('resize')); }, [fs.active]); // canvases re-measure on enter/exit
  return (
    <div ref={ref} className={`scene-wrap ${className}${fs.pseudo ? ' fs-pseudo' : ''}${fs.active ? ' fs-on' : ''}`.trim()}>
      {children}
      <div className="scene-tools2" role="toolbar" aria-label="View options">
        {labels && <button type="button" className={`st-btn st-lab m-${mode}`} onClick={() => { const m = NEXT[mode]; setMode(m); setHint(MODE_HINT[m]); }}
          title="Labels: names → dots (tap a dot for its name) → off" aria-label={`Labels: ${MODE_TEXT[mode]}. Change`}>
          <span className="st-ico" aria-hidden="true">{mode === 'all' ? 'Aa' : mode === 'dots' ? '•••' : '⊘'}</span><span className="st-txt">{MODE_TEXT[mode]}</span>
        </button>}
        <button type="button" className="st-btn st-fs" onClick={fs.toggle} aria-pressed={fs.active} title={fs.active ? 'Exit full screen (Esc)' : 'Full screen'} aria-label={fs.active ? 'Exit full screen' : 'Full screen'}>
          <span className="st-ico" aria-hidden="true">{fs.active ? '⤡' : '⤢'}</span><span className="st-txt">{fs.active ? 'Exit' : 'Full screen'}</span>
        </button>
      </div>
      {hint && <div className="st-hint" role="status">{hint}</div>}
      <LabelInfoCard host={host} />
    </div>
  );
}
