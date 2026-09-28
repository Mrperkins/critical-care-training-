# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`9b17f765475802d60e77ce7d7bfe0b6d25ad7038` at start of camera registry slice. See `git rev-parse HEAD` after commit.

## LAST VERIFIED LIVE DEPLOY
The prior Pages deployment was successful. The vendored asset commit `9b17f76` is on the remote branch; the live page rendered initial controls in the cloud browser, then crashed because that browser has WebGL disabled. A 3D runtime visual check remains unavailable here.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.

## CURRENT SLICE
Wire existing organelle anchors and membrane protein focus actions through `__CCCameraTargets.resolve`, preserving current positions and camera framing; do not invent coordinates for future scenes.

## EXACT RESUME POINT
Check `git log -2` and `git status`; then edit the `QK` camera control near the `cellView` check and `em` cell anchor definitions. Map real organelle positions from the existing `SK(cellType).anchors` list into the semantic resolver and make a focus cue use the resolved position. Preserve existing framing for all current buttons. Use the connected GitHub app for publishing if HTTPS push has no credentials. Do not re-upload the vendored binary: GitHub already has blob `020d530ca3350d21190600292b6bc50be97b1ba1`.

## NEXT 10 SLICES
1. Wire organelle and transporter focus through semantic camera registry.
2. Add high/medium/low cell visual tiers without changing physiology.
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
- Inline JS and `camera-targets.js`: `node --check` passed; 14 named targets resolve and unknown keys return null. GLB header/length and SHA-256 match the manifest; no `var sw=var sw=`; `git diff --check` passed. Same-process local HTTP boot returned 200 for page, registry script, GLB. Live page rendered controls in cloud browser, but WebGL context creation failed; mobile 3D remains unverified.

## FILES CURRENTLY BEING EDITED
- None after semantic registry commit. Next slice likely touches `index.html` and `camera-targets.js`.
