/**
 * The one narrator used for every spoken line in both apps: an offline neural voice rendered ahead of time
 * (no browser or operating-system speech). Kokoro-82M is Apache-2.0 (weights and voices).
 * Changing any field here re-renders every line on the next narration run.
 */
export const NARRATOR = {
  engine: 'Kokoro-82M v1.0 (ONNX)',
  license: 'Apache-2.0',
  source: 'https://huggingface.co/hexgrad/Kokoro-82M',
  voice: 'af_heart',
  speed: 0.95,
  /** bump when the text normalisation or audio processing changes */
  version: 1,
  label: 'Natural neural narrator (Kokoro, voice “Heart”)',
} as const;
