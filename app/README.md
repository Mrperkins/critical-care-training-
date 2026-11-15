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

- `pipeline/` rebuilds anatomy from the HuBMAP Visible Human GLBs, which are not committed
  (`assets/source/`, ~90 MB; https://github.com/hubmapconsortium/ccf-3d-reference-object-library).
- Added anatomy (same Visible Human Male body frame as body.glb; `npm run asset:<name>`):
  `skeleton` (86 bones — skull, spine, ribs, sternum, shoulder girdles, humeri from **BodyParts3D, CC BY-SA 2.1 JP**,
  fitted onto the VHM body; pelvis and legs from HuBMAP — so `skeleton.glb` as a whole is CC BY-SA; app code is not
  affected), `pericardium` (sac grown from the real heart, per-vertex effusion freedom), `neuro` (Allen deep structures;
  HuBMAP's Allen side labels are mirrored and are corrected by position), `heart-internals` (papillary muscles, chordae,
  conduction system with activation times). BodyParts3D STLs: https://github.com/Kevin-Mattheus-Moerman/BodyParts3D
  (`assets/source/bp3d/`). Each build prints a fit/sanity report; `tests/anatomy-layers.test.ts` locks the key facts.
- Repo-root assets the build does not own and fetches at runtime: `models/cell/…` (CC BY 4.0
  generic cell), `models/molecular/*-backbone.glb` (CC0 PDB-derived), manifests in `models/*.json`.
