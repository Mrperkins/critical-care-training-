/** Narration player: pre-rendered neural voice clips (inlined as base64 MP3). Falls back to silent captions. */
declare global { interface Window { __VO__?: Record<string, string>; __VO_IDS__?: string[] } }
let audio: HTMLAudioElement | null = null; let onEnd: (() => void) | null = null;
export const voice = {
  has(id: string) { return !!window.__VO__?.[id] || !!window.__VO_IDS__?.includes(id); },
  play(id: string, done?: () => void) {
    this.stop(); const b64 = window.__VO__?.[id]; const url = b64 ? 'data:audio/mpeg;base64,' + b64 : window.__VO_IDS__?.includes(id) ? `vo/${id}.mp3` : null;
    if (!url) { done?.(); return false; }
    audio = new Audio(url); onEnd = done ?? null;
    audio.onended = () => { const f = onEnd; onEnd = null; f?.(); };
    audio.play().catch(() => { /* autoplay blocked until a tap */ });
    return true;
  },
  stop() { if (audio) { audio.onended = null; audio.pause(); audio = null; } onEnd = null; },
  progress() { return audio && audio.duration ? audio.currentTime / audio.duration : 0; },
  playing() { return !!audio && !audio.paused; },
};
