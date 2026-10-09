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
Every Director cue and step lesson has a clip id (cue id / step id); lessons without a clip fall back to the
browser's speech synthesis. To (re)render after changing lesson text:

```
npx tsx scripts/vo-lines.ts                     # collect every narrated line → public/vo/lines.json
pip install --break-system-packages kokoro-onnx soundfile
# model files (Apache-2.0): kokoro-v1.0.int8.onnx + voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases
python3 scripts/vo_render.py <model.onnx> <voices.bin> <cache_dir>   # renders only new or changed lines (hashes.json)
npx tsx scripts/vo-pack.ts <cache_dir>          # packs clips into public/vo/vo.json
npm run site
```
New clips use Kokoro-82M, voice `bf_emma`, encoded like the originals (MP3, 22.05 kHz mono, 24 kb/s).
Abbreviations are expanded for speech in `vo_render.py` (`SAY`).
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
