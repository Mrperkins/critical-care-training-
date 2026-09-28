# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`07e29e40e0f825e2687b2c82d4f4472e2b8d1486` last implementation commit. Run `git rev-parse HEAD` for the exact state-file-only follow-up commit.

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

## CURRENT SLICE
Convert pinned Kir2.1 PDB 7ZDZ to a compact visual mesh and wire one selected closeup channel to that mesh, retaining procedural proxy and existing physiology.

## EXACT RESUME POINT
Check `git log -2` and `git status`; use `tools/build_pdb_backbone.py` for 7ZDZ after checking chain composition. Generalize palettes if needed (currently up to four chains). Add `membrane.kir` to the selected closeup mesh mapping, keep a proxy for other sites and LOW quality. Update manifest and source record, validate GLB and inline JS syntax, publish through connected GitHub app if HTTPS git push lacks credentials.

## NEXT 10 SLICES
1. Add Kir2.1 simplified visual geometry and LOD hooks.
2. Add AQP4 simplified visual geometry and LOD hooks.
3. Upgrade reusable membrane bilayer and ion/protein depth.
4. Add reusable alveolar microanatomy driven by existing respiratory model.
5. Add brain and cerebral vessel semantic geometry foundations.
6. Add Lesson Director deterministic timeline shell driven by SyntheticPatient.
7. Add first MOA data graph and UI shell.
8. Add norepinephrine alpha-1/beta-1 MOA graph with synthetic shock context.
9. Add hyperkalemia guided lesson through shared director.
10. Add reusable stroke vascular state and imaging primitives.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.
- None pending for Pages: the initial Nav1.5 404 cleared after deployment; the live file and loader were then verified by HTTP. GPU visual QA remains blocked by the cloud browser's WebGL environment.

## TESTS LAST RUN
- Inline JS and `camera-targets.js`: `node --check` passed; 14 named targets resolve. 9RON and 9P24 GLBs have valid headers, 31,272 and 30,072 triangles, no external images, and hashes match manifest. The converter rebuilds 9RON byte for byte. No `var sw=var sw=`; `git diff --check` passed. Pages HTML and all three GLBs through `07e29e4` confirmed by HTTP. WebGL creation failed in cloud browser, so visual and mobile 3D remain unverified.

## FILES CURRENTLY BEING EDITED
- None after Nav1.5 mesh commit. Next slice likely adds `models/molecular/7zdz-backbone.glb` and updates the same manifest, source notes, `index.html`, and this file.
