# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`9694c079dba7383b6918d9b1b71a60cdc60edd9a` at start of organelle focus slice. See `git rev-parse HEAD` after commit.

## LAST VERIFIED LIVE DEPLOY
Vendored asset commit `9b17f76` and registry commit `9694c07` are on `visual-overhaul`; live asset returns HTTP 200 and `model/gltf-binary`. The live page rendered initial controls in the cloud browser, then crashed because that browser has WebGL disabled. A 3D runtime visual check remains unavailable here.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.
- Added cell organelle focus controls (nucleus, mitochondrion, ER, Golgi) using existing procedural anchors through the semantic resolver; active cell and membrane view switching clears focus.

## CURRENT SLICE
Add HIGH/MEDIUM/LOW visual tiers for the generic cell and its particle layers without changing SyntheticPatient or treatments. Default to an appropriate device tier and allow user override.

## EXACT RESUME POINT
Check `git log -2` and `git status`. Read the `TH` HUD, `rH` cell renderer, and `iv` particle renderer near the named symbols in `index.html`. Add a visual-only tier setting; LOW should avoid GLB load, HIGH should retain the current asset. Keep `SyntheticPatient` unchanged. Use connected GitHub app create_blob/create_tree/create_commit/update_ref to publish if HTTPS push still lacks credentials. The vendored binary already exists remotely; do not re-upload it.

## NEXT 10 SLICES
1. Add high/medium/low cell visual tiers without changing physiology.
2. Wire membrane protein focus through semantic camera registry.
3. Add simplified Na/K ATPase geometry and LOD hooks using the documented CC0 source.
4. Add Nav1.5 simplified visual geometry and LOD hooks.
5. Add Kir2.1 simplified visual geometry and LOD hooks.
6. Add AQP4 simplified visual geometry and LOD hooks.
7. Upgrade reusable membrane bilayer and ion/protein depth.
8. Add reusable alveolar microanatomy driven by the existing respiratory model.
9. Add brain and cerebral vessel semantic geometry foundations.
10. Add Lesson Director deterministic timeline shell driven by SyntheticPatient.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.

## TESTS LAST RUN
- Inline JS and `camera-targets.js`: `node --check` passed; 14 named targets resolve and unknown keys return null. GLB header/length and SHA-256 match the manifest; no `var sw=var sw=`; `git diff --check` passed. Same-process local HTTP boot returned 200 for page, registry script, GLB. Live GLB returned 200 and `model/gltf-binary`. Live page rendered controls in cloud browser, but WebGL context creation failed; mobile 3D remains unverified.

## FILES CURRENTLY BEING EDITED
- None after focus slice commit. Next slice likely touches `index.html`, `ASTRA_EXECUTION_STATE.md`, and optionally a standalone tier helper.
