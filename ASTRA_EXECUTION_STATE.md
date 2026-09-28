# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`ed425ba8c67263202b7e147a4ae0e5e4775c4663` at start of visual tier slice. See `git rev-parse HEAD` after commit.

## LAST VERIFIED LIVE DEPLOY
Vendored asset `9b17f76`, registry `9694c07`, and organelle focus `ed425ba` are on `visual-overhaul`; live asset returns HTTP 200 and `model/gltf-binary`. The live page rendered initial controls in the cloud browser, then crashed because that browser has WebGL disabled. A 3D runtime visual check remains unavailable here.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.
- Added cell organelle focus controls (nucleus, mitochondrion, ER, Golgi) using existing procedural anchors through the semantic resolver; active cell and membrane view switching clears focus.
- Added HIGH/MEDIUM/LOW visual tiers. HIGH keeps the vendored cell and full particle draw, MEDIUM keeps the cell with half the free particles, LOW uses the procedural cell and a quarter of the free particle draw. Active/moving and selected particles are preserved. Mobile defaults LOW; desktop HIGH. No physiology or treatment state was changed.

## CURRENT SLICE
Wire membrane protein focus through semantic camera registry using actual transporter sites, then implement browser safe Na/K ATPase LOD geometry from the existing licensed PDB source.

## EXACT RESUME POINT
Check `git log -2` and `git status`. In `camera-targets.js`, transporter IDs map to anchor keys. Inspect `iH` membrane sites and `QK` camera rig to focus the selected transporter using real `n.sites` positions. For Na/K ATPase geometry inspect `models/molecular.assets.json` first. Preserve the transporter state machine. Use the connected GitHub app to publish if HTTPS push lacks credentials.

## NEXT 10 SLICES
1. Wire membrane protein focus through semantic camera registry.
2. Add simplified Na/K ATPase geometry and LOD hooks using the documented CC0 source.
3. Add Nav1.5 simplified visual geometry and LOD hooks.
4. Add Kir2.1 simplified visual geometry and LOD hooks.
5. Add AQP4 simplified visual geometry and LOD hooks.
6. Upgrade reusable membrane bilayer and ion/protein depth.
7. Add reusable alveolar microanatomy driven by the existing respiratory model.
8. Add brain and cerebral vessel semantic geometry foundations.
9. Add Lesson Director deterministic timeline shell driven by SyntheticPatient.
10. Add first MOA data graph and UI shell.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.

## TESTS LAST RUN
- Inline JS and `camera-targets.js`: `node --check` passed; 14 named targets resolve and unknown keys return null. GLB header/length and SHA-256 match the manifest; no `var sw=var sw=`; `git diff --check` passed. Same-process local HTTP boot returned 200 for page, registry script, GLB. Live GLB returned 200 and `model/gltf-binary`. Tier path syntax and guards passed; WebGL context creation failed in cloud browser, so visual and mobile 3D remain unverified.

## FILES CURRENTLY BEING EDITED
- None after visual tier commit. Next slice likely touches `index.html`, `camera-targets.js`, and this file.
