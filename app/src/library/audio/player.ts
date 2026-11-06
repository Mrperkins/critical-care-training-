/**
 * One audio element for the whole visual app, so a session keeps playing while the learner browses
 * lessons. Sources are the same natural-voice files the audio app plays (audio/assets.json written by the
 * build); position and completion are saved to the audio app's own progress store, so both surfaces agree.
 */
import { create } from 'zustand';
import { useAudioProgress } from '../../audio/progress';

export interface Playable { id: string; title: string; kind: 'episode'; minutes: number; concepts: string[] }
type Asset = { file: string; transcriptHash?: string; seconds?: number };
interface PlayerState {
  item: Playable | null; sources: string[]; part: number; playing: boolean; t: number; dur: number; error: string | null;
  set: (p: Partial<PlayerState>) => void;
}
export const usePlayer = create<PlayerState>((set) => ({ item: null, sources: [], part: 0, playing: false, t: 0, dur: 0, error: null, set: (p) => set(p) }));

let assets: Promise<Record<string, Asset>> | null = null;
/** the natural-voice asset map (empty when it is not published, e.g. in tests) */
export function audioAssets(): Promise<Record<string, Asset>> {
  if (!assets) assets = (typeof fetch === 'undefined' ? Promise.resolve({}) : fetch('audio/assets.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return assets;
}
const src = (a: Asset) => `audio/${a.file.includes('/') ? a.file : `voice/${a.file}`}${a.transcriptHash ? `?v=${encodeURIComponent(a.transcriptHash)}` : ''}`;
/** a whole-episode file, or its ordered parts */
export function episodeSources(map: Record<string, Asset>, id: string): string[] {
  const whole = map[`episode.${id}`]; if (whole) return [src(whole)];
  return Object.keys(map).filter((k) => k.startsWith(`episode.${id}.part`)).sort().map((k) => src(map[k]));
}
/** the recorded length of an episode in seconds, when every part's length is known */
export function episodeSeconds(map: Record<string, Asset>, id: string): number | null {
  const keys = map[`episode.${id}`] ? [`episode.${id}`] : Object.keys(map).filter((k) => k.startsWith(`episode.${id}.part`));
  if (!keys.length || keys.some((k) => !map[k].seconds)) return null;
  return keys.reduce((s, k) => s + (map[k].seconds ?? 0), 0);
}
export const hasVoice = (map: Record<string, Asset>, id: string) => episodeSources(map, id).length > 0;
/** where the full audio app opens an item */
export const audioAppHref = (q: string) => `audio/?${q}`;

let el: HTMLAudioElement | null = null; let lastSaved = 0;
function audio(): HTMLAudioElement {
  if (el) return el;
  el = new Audio(); el.preload = 'metadata';
  const save = () => { const s = usePlayer.getState(); if (!s.item || !el) return; const p = useAudioProgress.getState(); p.setPosition(s.item.id, el.currentTime); p.setPosition(`${s.item.id}:part`, s.part); };
  el.addEventListener('timeupdate', () => { const t = el!.currentTime; usePlayer.getState().set({ t, dur: el!.duration || 0 }); if (Math.abs(t - lastSaved) >= 5) { lastSaved = t; save(); } });
  el.addEventListener('pause', () => { usePlayer.getState().set({ playing: false }); save(); });
  el.addEventListener('play', () => usePlayer.getState().set({ playing: true, error: null }));
  el.addEventListener('error', () => usePlayer.getState().set({ playing: false, error: typeof navigator !== 'undefined' && !navigator.onLine ? 'Not saved on this device yet. Download it from the Offline page when you have signal.' : 'This audio file could not be loaded.' }));
  el.addEventListener('ended', () => {
    const s = usePlayer.getState(); if (!s.item) return; const p = useAudioProgress.getState();
    if (s.part + 1 < s.sources.length) { loadPart(s.part + 1, 0, true); return; }
    p.setPosition(s.item.id, 0); p.setPosition(`${s.item.id}:part`, 0); p.completeEpisode(s.item.id, s.item.concepts);
    usePlayer.getState().set({ playing: false, part: 0, t: 0 });
  });
  return el;
}
function loadPart(part: number, at: number, autoplay: boolean) {
  const s = usePlayer.getState(); const a = audio(); const url = s.sources[part]; if (!url) return;
  usePlayer.getState().set({ part, t: at });
  a.src = url; lastSaved = at;
  a.addEventListener('loadedmetadata', () => { if (at > 2 && at < a.duration - 3) a.currentTime = at; }, { once: true });
  if (autoplay) a.play().catch(() => usePlayer.getState().set({ playing: false }));
}

/** Start (or resume) an episode in the player bar. Returns false when it has no published voice file. */
export async function playEpisode(item: Playable): Promise<boolean> {
  const map = await audioAssets(); const sources = episodeSources(map, item.id);
  if (!sources.length) return false;
  const cur = usePlayer.getState();
  if (cur.item?.id === item.id) { togglePlay(); return true; }
  const pos = useAudioProgress.getState().position;
  usePlayer.getState().set({ item, sources, error: null });
  loadPart(Math.min(Math.floor(pos[`${item.id}:part`] ?? 0), sources.length - 1), pos[item.id] ?? 0, true);
  return true;
}
export function togglePlay() { const a = audio(); if (!usePlayer.getState().item) return; if (a.paused) a.play().catch(() => usePlayer.getState().set({ playing: false })); else a.pause(); }
export function seekBy(sec: number) { const a = audio(); a.currentTime = Math.max(0, Math.min((a.duration || 0) - 0.5, a.currentTime + sec)); }
export function seekTo(sec: number) { const a = audio(); a.currentTime = sec; }
export function closePlayer() { const a = audio(); a.pause(); a.removeAttribute('src'); a.load(); usePlayer.getState().set({ item: null, sources: [], playing: false, t: 0, dur: 0 }); }
export const fmtClock = (s: number) => { const n = Math.max(0, Math.floor(s || 0)); return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
