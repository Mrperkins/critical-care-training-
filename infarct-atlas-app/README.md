# Infarct Atlas

An interactive 3D lesson on MI localisation. It connects coronary anatomy, perfusion territories, culprit vessels and the 12-lead ECG, including reciprocal, posterior and right-sided leads.

## Stack
React 18 + TypeScript, React Three Fiber and Drei (Three r160), zustand state and esbuild bundling. Tests use Vitest.

## Layout
| Path | What it holds |
|---|---|
| `src/data/` | Medical content only: leads (viewing vectors), vessels (tree, dominance, branch origins), territories (affected, reciprocal and extra leads, culprits, ECG pattern, camera, explanation, pearls), lessons and quiz generators |
| `src/ecg/ecgModel.ts` | Vector-cardiographic ECG synthesis: a P/QRS/T dipole loop plus injury, necrosis and hyperacute vectors projected onto each lead |
| `src/engine/` | Shared cardiac clock (ECG sweep and contraction), state, derived render targets, and tissue, coronary and territory shaders |
| `src/components/` | Heart scene, ECG panel, UI |
| `scripts/build-asset.ts` | Asset pipeline (see below) |
| `scripts/validate-asset.ts` | Asset validation |
| `tests/` | Mapping, ECG-morphology and asset tests |

## Heart asset
- **Source:** *3D Reference Organ for Heart, Male*, from the HuBMAP / Human Reference Atlas, by Kristen Browne and Heidi Schlehlein. It is built on the Visible Human Male (U.S. National Library of Medicine).
- **Licence:** CC BY 4.0 (DOI 10.48539/HBM373.VSTV.568). Attribution is shown in the app footer and in `public/models/heart/ATTRIBUTION.md`.

The pipeline (`npm run asset`) turns the source into the web asset in these steps:
1. Imports the source GLBs and inspects mesh names.
2. Renames meshes to canonical ids using `assets/asset-map.json`.
3. Re-frames and simplifies the geometry.
4. Extracts the centerlines of the source coronaries.
5. Traces the branches the source lacks along the model's own grooves and surfaces: circumflex, D2, OM2, septal perforators and PLB.
6. Bakes per-vertex region weights, epicardial fat and ambient occlusion.
7. Builds territory mask meshes. Each mask is defined by the lead group that views that wall.
8. Assigns PBR materials and applies meshopt compression.
9. Writes `public/models/heart/heart.glb` plus `heart.mapping.json`.

### Swapping the heart
1. Put the new GLB in `assets/source/` and point `source` in `assets/asset-map.json` at it.
2. Adjust the name rules in the same file.
3. Run `npm run asset && npm run validate:asset`.

Scene code only ever references canonical names: `myocardium_LV`, `coronary_LAD`, `coronary_LAD_D1`, `coronary_LCx`, `coronary_RCA`, `coronary_PDA`, `territory_inferior` and so on.

## Commands
- `npm test` runs the mapping, ECG and asset tests.
- `npm run asset` rebuilds the heart asset.
- `npm run validate:asset` checks the built asset.
- `npm run build` writes `dist/index.html` (self-contained) and `dist/dev.html` (loads the GLB from `public/models`).

## Adding a topic later
Add data in `src/data/`: a new `ECGPattern`, and a territory or condition entry. Lessons and quiz questions are generated from that data. The ECG model already accepts arbitrary injury and necrosis vectors, so topics such as pericarditis or hyperkalaemia need a new pattern type, not new rendering code.

## Building inside this repository
This folder is the source of truth for `/infarct-atlas/index.html` (the published page is build output — never edit it by hand).

```bash
cd infarct-atlas-app
npm ci
npm test          # vitest
npm run typecheck
npm run site      # esbuild → dist/index.html → ../infarct-atlas/index.html
```

`npm run asset` (re-baking `public/models/heart/heart.glb`) needs the HuBMAP source GLB, which is not committed (see `.gitignore`): download `VH_M_Heart_v1.1.glb` (CC BY 4.0) from the `sourceUrl` in `assets/asset-map.json` into `assets/source/`. The committed `heart.glb` + `heart.mapping.json` are enough for normal builds.
