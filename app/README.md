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
- `pipeline/` rebuilds anatomy from the HuBMAP Visible Human GLBs, which are not committed
  (`assets/source/`, ~90 MB; https://github.com/hubmapconsortium/ccf-3d-reference-object-library).
- Repo-root assets the build does not own and fetches at runtime: `models/cell/…` (CC BY 4.0
  generic cell), `models/molecular/*-backbone.glb` (CC0 PDB-derived), manifests in `models/*.json`.
