# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## ⚠️ SOURCE OF TRUTH — READ FIRST
The TypeScript source now lives in `app/` (see `app/README.md`). **Do not hand-edit the minified bundle in `index.html` any more.** Edit `app/src/…`, then `cd app && npm install && npm test && npm run site` (rebuilds and copies `index.html`, `models/*.glb.txt`, `vo/*` to the repo root), then `python tools/validate_visual_assets.py`.
All 53 earlier bundle patches (Wave 1 chrome CSS, Studio lighting/fog, cell material palette, open-cell loader + tiers, organelle/protein focus, PDB protein swap, membrane backdrop, semantic camera registry) were ported into source in the slice "Restore source of truth". `camera-targets.js` was removed: the registry is `app/src/scene/cameraTargets.ts` and is still exposed as `window.__CCCameraTargets`.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
Run `git rev-parse HEAD`. Last slice: "Restore source of truth: app/ source with visual-overhaul patches ported".

## LAST VERIFIED LIVE DEPLOY
Live Pages HTML contains the Nav1.5 loader from `07e29e4`. Cell, 9RON, and 9P24 GLBs returned HTTP 200 with the expected glTF MIME type. The cloud browser has WebGL disabled, so a 3D visual check remains unavailable here.

## COMPLETED SLICES
- Restore source of truth: `app/` holds the full source; every visual-overhaul bundle patch re-implemented in TS (`app/src/labs/cell/openAssets.tsx` loaders, `scene/cameraTargets.ts`, tiers in `labStore.visualTier`, focus in `labStore.cameraTargetId`). Studio fog is now a `fog` prop (Lines scene disables it; the fog was washing out its far views). Verified by HTTP boot + WebGL (swiftshader) screenshots: vendored cell (HIGH), nucleus focus, 9RON pump mesh in membrane focus, Lines, vent — no page errors.
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.
- Added cell organelle focus controls (nucleus, mitochondrion, ER, Golgi) using existing procedural anchors through the semantic resolver; active cell and membrane view switching clears focus.
- Added HIGH/MEDIUM/LOW visual tiers. HIGH keeps the vendored cell and full particle draw, MEDIUM keeps the cell with half the free particles, LOW uses the procedural cell and a quarter of the free particle draw. Active/moving and selected particles are preserved. Mobile defaults LOW; desktop HIGH. No physiology or treatment state was changed.
- Added membrane pump, Nav1.5, Kir2.1, and AQP4 focus buttons where those transporter sites exist. Camera derives its aim from existing patch site positions via semantic target IDs.
- Converted CC0 9RON alpha/beta/FXYD C-alpha traces to a 31,272 triangle, 754 KB GLB. The selected pump in membrane closeup uses the mesh at HIGH/MEDIUM quality and its existing procedural proxy at LOW. Simulation pump phase moves the mesh slightly; ion transport remains in the existing state machine. Converter and integrity/provenance are included.
- Converted CC0 9P24 Nav1.5 C-alpha trace to a 30,072 triangle, 724 KB GLB. Selected Nav1.5 uses it at HIGH/MEDIUM quality; open/inactivated state changes its highlight, and existing gating/ion movement remains authoritative. Other sites and LOW retain the procedural proxy. The converter still rebuilds 9RON identically.

- Added Kir2.1 CC0 7ZDZ tetramer mesh (30,912 triangles), wired selected channel to existing closeup loader. Fixed Nav mesh naming and made converter palette sizes safe for multiple chains; disposed cloned visual materials on focus exit. Added reusable mesh/syntax validation.

- Added AQP4 from the full 3GD8 biological assembly (four 223-residue chains, 21,312 triangles). Selected AQP4 uses this mesh at HIGH/MEDIUM, with the existing procedural proxy at LOW. No water/volume physiology changes.

## CURRENT SLICE
Improve the reusable membrane bilayer presentation while preserving channel sites, ion trajectories, and existing transport state.

## EXACT RESUME POINT
Membrane bilayer upgrade, in source: `app/src/labs/cell/patch.tsx` → `Bilayer` (instanced heads/tails), `Backdrop`, and `common.tsx` sprites. Improve bilayer geometry/material/depth without changing `SLAB` dimensions or site positions (the sim in `sim.ts` owns crossings). Keep LOW tier cheap (read `useLabUI(s => s.visualTier)`). Then `npm test && npm run site && python ../tools/validate_visual_assets.py`.

## NEXT 10 SLICES
1. Upgrade reusable membrane bilayer and ion/protein depth.
2. Add reusable alveolar microanatomy driven by existing respiratory model.
3. Add brain and cerebral vessel semantic geometry foundations.
4. Add Lesson Director deterministic timeline driven by SyntheticPatient.
5. Add first MOA data graph and UI shell.
6. Add norepinephrine alpha-1/beta-1 MOA graph with shock context.
7. Add hyperkalemia through shared Lesson Director.
8. Add reusable stroke vascular state and imaging primitives.
9. Add shared lesson curriculum metadata and progress persistence.
10. Port respiratory lessons through shared director.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- None for git: pushes from this environment work with HTTPS credentials.
- Visual QA: this environment has WebGL via swiftshader (`--use-gl=angle --use-angle=swiftshader`); slow but real. Serve the repo root with `python3 -m http.server` (binary GLBs need http, not file://).

## TESTS LAST RUN
- `app`: `tsc --noEmit` clean; `vitest` 87/87 passed. `tools/validate_visual_assets.py` passed (4 proteins, bundle syntax, registry + loader presence). HTTP boot test: no page errors (only favicon 404).

## FILES CURRENTLY BEING EDITED
- None. Next: `app/src/labs/cell/patch.tsx` (bilayer).
