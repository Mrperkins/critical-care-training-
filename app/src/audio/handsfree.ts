export type HandsFreeCommand = 'play' | 'pause' | 'next' | 'previous' | 'repeat' | 'review' | 'deeper' | 'example' | 'unknown';

const rules: [HandsFreeCommand, RegExp][] = [
  ['pause', /\b(pause|stop)\b/i],
  ['play', /\b(play|resume|continue)\b/i],
  ['next', /\b(next|move on|go on)\b/i],
  ['previous', /\b(previous|go back|back one)\b/i],
  ['repeat', /\b(repeat|again|say that again)\b/i],
  ['review', /\b(quiz me|review me|test me)\b/i],
  ['deeper', /\b(go deeper|more detail|explain deeper)\b/i],
  ['example', /\b(example|give me an example)\b/i],
];
export function parseHandsFree(text: string): HandsFreeCommand {
  for (const [cmd, rx] of rules) if (rx.test(text.trim())) return cmd;
  return 'unknown';
}

type RecognitionCtor = new () => {
  lang: string; continuous: boolean; interimResults: boolean;
  start(): void; stop(): void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
};
function ctor(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
export const handsFreeAvailable = () => typeof window !== 'undefined' && !!ctor();

/** One-shot command capture after an explicit learner tap; browsers may use their own speech service. */
export function listenForCommand(done: (command: HandsFreeCommand, transcript: string) => void, ended?: () => void) {
  const C = ctor(); if (!C) { ended?.(); return () => undefined; }
  const r = new C(); r.lang = 'en-US'; r.continuous = false; r.interimResults = false;
  r.onresult = (e) => { const t = e.results[0]?.[0]?.transcript ?? ''; done(parseHandsFree(t), t); };
  r.onerror = () => ended?.(); r.onend = () => ended?.(); r.start();
  return () => { try { r.stop(); } catch { /* already stopped */ } };
}
