# App source (Critical Care Physiology)

This folder is the **source of truth** for the site's `index.html`. Never hand-edit the
minified bundle in the repo root — edit here and rebuild.

```
cd app
npm install
npm test            # vitest (physiology, cells, labs, lines)
npm run typecheck
npm run site        # builds, then copies dist/pub/{index.html,models/*,vo/*} over the repo root
python ../tools/validate_visual_assets.py   # molecular GLB integrity + bundle syntax guard
```

- `src/` — React + react-three-fiber app (modules: vent, abg, labs, lines).
- `public/models/*.glb` — built anatomy (from `pipeline/`); `public/vo/vo.json` — narration.

### Narration
Every spoken line in both apps — Director cues, step lessons, condition-atlas and pharmacology walk-throughs, Mental Rep
beats and audio episodes — is rendered ahead of time by one natural neural narrator: Kokoro-82M v1.0 (full-precision
ONNX, Apache-2.0), voice and settings in `src/audio/narrator.ts`. Nothing is ever spoken by the browser or operating
system; a line without a current clip shows its caption only.

Clinical text is normalised for speech in `scripts/narrate.py` (acronyms spelled from explicit phonemes, PEEP/MAP/STEMI
said as words, CO₂ → "C O two", units and symbols expanded). Audio: 24 kHz mono, loudness-normalised to −18 LUFS,
MP3 48 kb/s (episodes 32 kb/s). Clips live at repo-root `vo/` (visual app) and `audio/narration/` (audio app);
`public/vo/narration.json` and `public/audio/voice/manifest.json` record each clip's hash, so a changed line is
re-rendered and a stale clip is never played.

To render after changing any spoken text: edit or create `app/narration-request.txt` on the `natural-voice` branch —
`.github/workflows/narration.yml` renders the changed lines on 20 runners and commits the clips. Locally:
```
npx tsx scripts/vo-lines.ts && npx tsx scripts/narration-jobs.ts
pip install --break-system-packages kokoro-onnx soundfile   # model: kokoro-v1.0.onnx + voices-v1.0.bin (thewh1teagle/kokoro-onnx releases)
python3 scripts/narrate.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin --skip narration/done.json --out /tmp/narr
python3 scripts/narration_collect.py /tmp/narr
```
