# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`b10650adfa26df9e65c4667075ba608d1c1923ab` published base; Kir2.1/AQP4 slices committed locally awaiting connector publication. Run `git rev-parse HEAD` for exact local state.

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

- Added AQP4 from the full 3GD8 biological assembly (four 223-residue chains, 21,312 triangles). Selected AQP4 uses this mesh at HIGH/MEDIUM, with the existing procedural proxy at LOW. No water/volume physiology changes.

## CURRENT SLICE
Improve the reusable membrane bilayer presentation while preserving channel sites, ion trajectories, and existing transport state.

## EXACT RESUME POINT
After confirming both PDB commits are published, inspect `iH`, `AK`, `RK`, `CK`, `PK` and `Nn` near the membrane code. Improve visual bilayer geometry/material/depth without changing simulation dimensions or membrane crossing. Keep mobile LOW inexpensive. Run `python tools/validate_visual_assets.py` before publishing. Molecular meshes are done for all four initial targets; do not repeat downloads.

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
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.
- None pending for Pages: the initial Nav1.5 404 cleared after deployment; the live file and loader were then verified by HTTP. GPU visual QA remains blocked by the cloud browser's WebGL environment.

## TESTS LAST RUN
- `python tools/validate_visual_assets.py` passed for all four proteins: expected chain counts, identity names, materials, indices, finite/unit normals, 20k–60k triangle budgets, hashes, app syntax. `git diff --check` passed. Live/GPU validation remains subject to the previously recorded WebGL blocker.

## FILES CURRENTLY BEING EDITED
- None after AQP4 commit. Next: membrane visuals in index.html and execution state.
