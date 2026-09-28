# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`e88f724ee31bd97f6898979c85007b3223868c77` at start of membrane focus slice. See `git rev-parse HEAD` after commit.

## LAST VERIFIED LIVE DEPLOY
Vendored asset `9b17f76`, registry `9694c07`, organelle focus `ed425ba`, and visual tiers `e88f724` are on `visual-overhaul`; live GLB returned HTTP 200. The cloud browser has WebGL disabled, so a 3D visual check remains unavailable here.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.
- Added cell organelle focus controls (nucleus, mitochondrion, ER, Golgi) using existing procedural anchors through the semantic resolver; active cell and membrane view switching clears focus.
- Added HIGH/MEDIUM/LOW visual tiers. HIGH keeps the vendored cell and full particle draw, MEDIUM keeps the cell with half the free particles, LOW uses the procedural cell and a quarter of the free particle draw. Active/moving and selected particles are preserved. Mobile defaults LOW; desktop HIGH. No physiology or treatment state was changed.
- Added membrane pump, Nav1.5, Kir2.1, and AQP4 focus buttons where those transporter sites exist. Camera derives its aim from existing patch site positions via semantic target IDs.

## CURRENT SLICE
Create simplified browser safe Na/K ATPase visual geometry/LOD from pinned PDB 9RON. Keep the current pump animation/state machine and its procedural fallback.

## EXACT RESUME POINT
Check `git log -2` and `git status`; read `models/molecular.assets.json` and existing `QF("pump")` geometry. Fetch pinned PDB 9RON only if documented source is reachable, simplify offline, and keep output lightweight. Do not render raw atoms or replace the active pump logic. Publish with the connected GitHub app when HTTPS push lacks credentials.

## NEXT 10 SLICES
1. Add simplified Na/K ATPase geometry and LOD hooks using documented CC0 source.
2. Add Nav1.5 simplified visual geometry and LOD hooks.
3. Add Kir2.1 simplified visual geometry and LOD hooks.
4. Add AQP4 simplified visual geometry and LOD hooks.
5. Upgrade reusable membrane bilayer and ion/protein depth.
6. Add reusable alveolar microanatomy driven by existing respiratory model.
7. Add brain and cerebral vessel semantic geometry foundations.
8. Add Lesson Director deterministic timeline shell driven by SyntheticPatient.
9. Add first MOA data graph and UI shell.
10. Add norepinephrine alpha-1/beta-1 MOA graph with synthetic shock context.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.

## TESTS LAST RUN
- Inline JS and `camera-targets.js`: `node --check` passed; 14 named targets resolve, including four active membrane site keys, and unknown keys return null. GLB header/length and SHA-256 match manifest; no `var sw=var sw=`; `git diff --check` passed. Same-process local HTTP boot returned 200 for page, registry script, GLB. Live GLB returned 200 and `model/gltf-binary`. WebGL creation failed in cloud browser, so visual and mobile 3D remain unverified.

## FILES CURRENTLY BEING EDITED
- None after membrane focus commit. Next slice likely adds a simplified mesh file, updates `models/molecular.assets.json`, and touches `index.html`/this file.
