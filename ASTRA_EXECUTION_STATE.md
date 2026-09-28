# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`b10650adfa26df9e65c4667075ba608d1c1923ab` at start of Kir2.1 slice; use `git rev-parse HEAD` for latest committed state.

## LAST VERIFIED LIVE DEPLOY
Live Pages HTML contains the Nav1.5 loader from `07e29e4`. Cell, 9RON, and 9P24 GLBs returned HTTP 200 with the expected glTF MIME type. The cloud browser has WebGL disabled, so a 3D visual check remains unavailable here.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.
- Added cell organelle focus controls (nucleus, mitochondrion, ER, Golgi) using existing procedural anchors through the semantic resolver; active cell and membrane view switching clears focus.
- Added HIGH/MEDIUM/LOW visual tiers. HIGH keeps the vendored cell and full particle draw, MEDIUM keeps the cell with half the free particles, LOW uses the procedural cell and a quarter of the free particle draw. Active/moving and selected particles are preserved. Mobile defaults LOW; desktop HIGH. No physiology or treatment state was changed.
- Added membrane pump, Nav1.5, Kir2.1, and AQP4 focus buttons where those transporter sites exist. Camera derives its aim from existing patch site positions via semantic target IDs.
- Converted CC0 9RON alpha/beta/FXYD C-alpha traces to a 31,272 triangle, 754 KB GLB. The selected pump in membrane closeup uses the mesh at HIGH/MEDIUM quality and its existing procedural proxy at LOW. Simulation pump phase moves the mesh slightly; ion transport remains in the existing state machine. Converter and integrity/provenance are included.
- Converted CC0 9P24 Nav1.5 C-alpha trace to a 30,072 triangle, 724 KB GLB. Selected Nav1.5 uses it at HIGH/MEDIUM quality; open/inactivated state changes its highlight, and existing gating/ion movement remains authoritative. Other sites and LOW retain the procedural proxy. The converter still rebuilds 9RON identically.

- Added Kir2.1 CC0 7ZDZ tetramer mesh (30,912 triangles), wired selected channel to existing closeup loader. Fixed Nav mesh naming and made converter palette sizes safe for multiple chains; disposed cloned visual materials on focus exit. Added reusable mesh/syntax validation.

## CURRENT SLICE
Build AQP4 from biological assembly 1 of 3GD8, then wire the selected aquaporin site to its mesh.

## EXACT RESUME POINT
Use already downloaded `/tmp/3GD8-assembly1.cif` (SHA-256 b23739eab1ddbaf32f5f5e619b8cdab2b9f84e71c31f81d8bd93e7b2b9b85687). It contains four protein chains A/A-2/A-3/A-4, each 223 C-alpha positions. Do not use the monomer-only asymmetric unit. Run converter, add expectedChainCount=4 to manifest, wire membrane.aqp to aqp/3gd8, then run `python tools/validate_visual_assets.py`. No broad re-audit.

## NEXT 10 SLICES
1. Add AQP4 biological assembly mesh and closeup hook.
2. Upgrade reusable membrane bilayer and ion/protein depth.
3. Add reusable alveolar microanatomy driven by existing respiratory model.
4. Add brain and cerebral vessel semantic geometry foundations.
5. Add Lesson Director deterministic timeline driven by SyntheticPatient.
6. Add first MOA data graph and UI shell.
7. Add norepinephrine alpha-1/beta-1 MOA graph with shock context.
8. Add hyperkalemia through shared Lesson Director.
9. Add reusable stroke vascular state and imaging primitives.
10. Add shared lesson curriculum metadata and progress persistence.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.
- None pending for Pages: the initial Nav1.5 404 cleared after deployment; the live file and loader were then verified by HTTP. GPU visual QA remains blocked by the cloud browser's WebGL environment.

## TESTS LAST RUN
- `python tools/validate_visual_assets.py` passed: 9RON/9P24/7ZDZ chain counts, mesh names, material references, index ranges, finite/unit normals, triangle budgets, SHA-256, inline JS syntax and duplicate declaration guard. `git diff --check` passed. Live HTTP was previously verified through 07e29e4. GPU visual QA is still unavailable in this cloud browser.

## FILES CURRENTLY BEING EDITED
- None after Kir2.1 commit. Next: AQP4 GLB, molecular manifest/source notes, index.html, execution state.
