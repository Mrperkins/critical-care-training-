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
import { Glossary } from './Glossary';

export type LabelMode = 'all' | 'dots' | 'off';
(globalThis as unknown as { __CCLabels?: unknown }).__CCLabels = { describe: describeLabel, key: labelKey };
const KEY = 'cc.labelMode';
const load = (): LabelMode => { try { const v = globalThis.localStorage?.getItem(KEY); return v === 'dots' || v === 'off' ? v : 'all'; } catch { return 'all'; } };

interface InfoCard { title: string; key: string; desc: string | null; rect: DOMRect; pinned: boolean; host: HTMLElement | null }
/** "Name that structure" drill: names hidden, find the asked structure among the dots. */
export interface Quiz { host: HTMLElement; target: string | null; asked: string[]; right: number; total: number; tries: number; flash: { name: string; kind: 'ok' | 'bad' | 'hint' } | null; done: boolean; note?: string }
interface LabelState { mode: LabelMode; card: InfoCard | null; quiz: Quiz | null; setMode: (m: LabelMode) => void; show: (c: InfoCard | null) => void; setQuiz: (q: Quiz | null) => void }
export const useLabels = create<LabelState>((set) => ({
  mode: load(), card: null, quiz: null,
  setQuiz: (quiz) => set({ quiz, card: null }),
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
  const quiz = useLabels((s) => s.quiz); const inQuiz = !!quiz && !important && !!plain && !quiz.done;
  if (mode === 'off' && !inQuiz) return null;
  const dot = (mode === 'dots' || inQuiz) && !important;
  const fl = inQuiz && quiz.flash && quiz.flash.name === plain ? ` q-${quiz.flash.kind}` : '';
  const setRefs = (el: HTMLButtonElement | null) => { own.current = el; if (typeof ref === 'function') ref(el); else if (ref) ref.current = el; };
  return (
    <button
      ref={setRefs} type="button" style={style}
      className={`lchip ${className}${dot ? ' ldot' : ''}${fl}`} data-quiz={!important && plain ? plain : undefined}
      data-label-key={info ?? labelKey(plain)} data-title={dot ? plain : undefined}
      aria-label={inQuiz ? 'A structure — is this the one?' : dot ? `${plain} — show details` : undefined}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse' && !useLabels.getState().quiz && !useLabels.getState().card?.pinned) card(false); }}
      onPointerLeave={(e) => { const c = useLabels.getState().card; if (e.pointerType === 'mouse' && c && !c.pinned) show(null); }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); if (inQuiz) { answerQuiz(plain); return; } const c = useLabels.getState().card; const t = (own.current?.dataset.title || own.current?.textContent || plain).trim(); if (c?.pinned && c.title === t) show(null); else card(true); }}
    >{dot ? null : text}</button>
  );
});

const QUIZ_LEN = 10;
const poolOf = (host: HTMLElement) => [...new Set([...host.querySelectorAll<HTMLElement>('.lchip[data-quiz]')].filter((e) => e.offsetParent !== null).map((e) => e.dataset.quiz!))];
function nextTarget(q: Quiz): Quiz {
  const pool = poolOf(q.host).filter((n) => !q.asked.includes(n));
  if (q.total >= QUIZ_LEN || !pool.length) return { ...q, target: null, done: true, flash: null };
  const target = pool[Math.floor(Math.random() * pool.length)];
  return { ...q, target, asked: [...q.asked, target], tries: 0, flash: null };
}
export function startQuiz(host: HTMLElement) {
  const n = poolOf(host).length; const st = useLabels.getState();
  if (n < 3) { st.setQuiz({ host, target: null, asked: [], right: 0, total: 0, tries: 0, flash: null, done: true, note: 'Not enough labelled structures in this view — switch view or condition and try again.' }); return; }
  st.setQuiz(nextTarget({ host, target: null, asked: [], right: 0, total: 0, tries: 0, flash: null, done: false }));
}
function answerQuiz(name: string) {
  const st = useLabels.getState(); const q = st.quiz; if (!q || !q.target || q.flash?.kind === 'ok') return;
  if (name === q.target) {
    st.setQuiz({ ...q, right: q.right + (q.tries === 0 ? 1 : 0), total: q.total + 1, flash: { name, kind: 'ok' } });
    window.setTimeout(() => { const cur = useLabels.getState().quiz; if (cur && cur.target === q.target) useLabels.getState().setQuiz(nextTarget(cur)); }, 900);
  } else {
    const tries = q.tries + 1;
    st.setQuiz({ ...q, tries, flash: tries >= 2 ? { name: q.target, kind: 'hint' } : { name, kind: 'bad' } });
  }
}
function QuizBanner({ host }: { host: HTMLElement | null }) {
  const q = useLabels((s) => s.quiz); const setQuiz = useLabels((s) => s.setQuiz);
  if (!q || q.host !== host) return null;
  const skip = () => { if (q.target) setQuiz(nextTarget({ ...q, total: q.total + 1 })); };
  const desc = q.done || !q.target ? null : describeLabel(labelKey(q.target), q.target);
  return (
    <div className="lquiz" role="status" aria-live="polite">
      {q.note ? <p>{q.note}</p> : q.done ? <p><b>Done — {q.right} of {q.total}</b> found first time.</p> : <>
        <div className="lquiz-h"><span className="muted small">Find</span><b>{q.target}</b><span className="lquiz-score">{q.right}/{q.total}</span></div>
        {q.flash?.kind === 'bad' && <p className="small bad">Not that one — try again.</p>}
        {q.flash?.kind === 'hint' && <p className="small">It’s the pulsing dot. {desc}</p>}
        {q.flash?.kind === 'ok' && <p className="small ok">Yes. {desc}</p>}
      </>}
      <div className="lquiz-b">{!q.done && <button type="button" className="chip" onClick={skip}>Skip</button>}
        {q.done && !q.note && <button type="button" className="chip" onClick={() => host && startQuiz(host)}>Again</button>}
        <button type="button" className="chip" onClick={() => setQuiz(null)}>{q.done ? 'Close' : 'Stop'}</button></div>
    </div>
  );
}

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
  const [gloss, setGloss] = useState(false);
  useDeclutter(ref, mode); const quizOn = useLabels((s) => !!s.quiz && s.quiz.host === ref.current);
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
        {labels && <button type="button" className={`st-btn st-quiz${quizOn ? ' on' : ''}`} aria-pressed={quizOn} onClick={() => { if (quizOn) useLabels.getState().setQuiz(null); else if (ref.current) startQuiz(ref.current); }}
          title="Name that structure — find each named structure among the dots" aria-label={quizOn ? 'Stop the name-that-structure drill' : 'Name that structure drill'}>
          <span className="st-ico" aria-hidden="true">?</span><span className="st-txt">{quizOn ? 'Stop drill' : 'Name it'}</span>
        </button>}
        {labels && <button type="button" className={`st-btn st-gloss${gloss ? ' on' : ''}`} aria-pressed={gloss} onClick={() => setGloss(!gloss)} title="Glossary — search every labelled structure" aria-label="Glossary">
          <span className="st-ico" aria-hidden="true">A–Z</span><span className="st-txt">Glossary</span>
        </button>}
        <button type="button" className="st-btn st-fs" onClick={fs.toggle} aria-pressed={fs.active} title={fs.active ? 'Exit full screen (Esc)' : 'Full screen'} aria-label={fs.active ? 'Exit full screen' : 'Full screen'}>
          <span className="st-ico" aria-hidden="true">{fs.active ? '⤡' : '⤢'}</span><span className="st-txt">{fs.active ? 'Exit' : 'Full screen'}</span>
        </button>
      </div>
      {hint && <div className="st-hint" role="status">{hint}</div>}
      <QuizBanner host={host} />
      {gloss && <Glossary onClose={() => setGloss(false)} />}
      <LabelInfoCard host={host} />
    </div>
  );
}

/**
 * Keeps named labels from sitting on top of each other (Labels mode). Runs in screen space a few times a second,
 * on the DOM (independent of each canvas's frame loop): labels are sorted top to bottom, alerts first, and each
 * slides up or down by whole rows (CSS `translate`, which composes with the positioning transforms) to the
 * nearest free slot, at most five rows away.
 */
export function declutter(root: HTMLElement) {
  const els = [...root.querySelectorAll<HTMLElement>('.lchip:not(.ldot):not(.olabel)')].filter((e) => e.offsetParent !== null);
  const boxes = els.map((e) => { const r = e.getBoundingClientRect(); const dy = Number(e.dataset.dy || 0); return { e, x: r.left, y: r.top - dy, w: r.width, h: r.height, pri: e.matches('.b-bad, .t-red') ? 0 : 1 }; })
    .filter((b) => b.w > 0).sort((a, b) => a.pri - b.pri || a.y - b.y);
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const hit = (b: { x: number; y: number; w: number; h: number }) => placed.some((q) => b.x < q.x + q.w + 3 && q.x < b.x + b.w + 3 && b.y < q.y + q.h + 2 && q.y < b.y + b.h + 2);
  for (const b of boxes) {
    const step = Math.round(b.h + 3); let dy = 0;
    for (const k of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5]) { if (!hit({ ...b, y: b.y + k * step })) { dy = k * step; break; } }
    placed.push({ x: b.x, y: b.y + dy, w: b.w, h: b.h });
    if (Number(b.e.dataset.dy || 0) !== dy) { b.e.dataset.dy = String(dy); b.e.style.translate = dy ? `0 ${dy}px` : ''; }
  }
}
function useDeclutter(ref: React.RefObject<HTMLElement>, mode: LabelMode) {
  useEffect(() => {
    const root = ref.current; if (!root) return;
    if (mode !== 'all') { root.querySelectorAll<HTMLElement>('.lchip').forEach((e) => { e.style.translate = ''; delete e.dataset.dy; }); return; }
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') declutter(root); }, 160);
    return () => window.clearInterval(id);
  }, [ref, mode]);
}
