# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`4ca4219ff34cc806a966d291791a4305072307f2` at start of 9RON mesh slice. See `git rev-parse HEAD` after commit.

## LAST VERIFIED LIVE DEPLOY
Live Pages HTML now contains the local cell loader, registry, visual tier controls, and membrane focus controls from `4ca4219`; local GLB returned HTTP 200. The cloud browser has WebGL disabled, so a 3D visual check remains unavailable here.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.
- Added `camera-targets.js` with 14 semantic target IDs and a resolver; the existing cell/zoom camera path now resolves `cell.whole` / `membrane.overview` before choosing its view. All other target anchors await scene wiring.
- Added cell organelle focus controls (nucleus, mitochondrion, ER, Golgi) using existing procedural anchors through the semantic resolver; active cell and membrane view switching clears focus.
- Added HIGH/MEDIUM/LOW visual tiers. HIGH keeps the vendored cell and full particle draw, MEDIUM keeps the cell with half the free particles, LOW uses the procedural cell and a quarter of the free particle draw. Active/moving and selected particles are preserved. Mobile defaults LOW; desktop HIGH. No physiology or treatment state was changed.
- Added membrane pump, Nav1.5, Kir2.1, and AQP4 focus buttons where those transporter sites exist. Camera derives its aim from existing patch site positions via semantic target IDs.
- Converted CC0 9RON alpha/beta/FXYD C-alpha traces to a 31,272 triangle, 754 KB GLB. The selected pump in membrane closeup uses the mesh at HIGH/MEDIUM quality and its existing procedural proxy at LOW. Simulation pump phase moves the mesh slightly; ion transport remains in the existing state machine. Converter and integrity/provenance are included.

## CURRENT SLICE
Convert pinned Nav1.5 PDB 9P24 to a compact visual mesh and wire one selected closeup channel to that mesh, retaining the procedural proxy and existing gating.

## EXACT RESUME POINT
Check `git log -2` and `git status`; use `tools/build_pdb_backbone.py` for 9P24 after checking chain composition. Adapt converter or mesh material names if necessary. Wire only the selected Nav1.5 site to a single closeup mesh, keep a proxy for other sites and LOW quality. Update manifest and source record. Validate GLB triangles/hash and inline JS syntax. Publish through connected GitHub app if HTTPS git push lacks credentials.

## NEXT 10 SLICES
1. Add Nav1.5 simplified visual geometry and LOD hooks.
2. Add Kir2.1 simplified visual geometry and LOD hooks.
3. Add AQP4 simplified visual geometry and LOD hooks.
4. Upgrade reusable membrane bilayer and ion/protein depth.
5. Add reusable alveolar microanatomy driven by existing respiratory model.
6. Add brain and cerebral vessel semantic geometry foundations.
7. Add Lesson Director deterministic timeline shell driven by SyntheticPatient.
8. Add first MOA data graph and UI shell.
9. Add norepinephrine alpha-1/beta-1 MOA graph with synthetic shock context.
10. Add hyperkalemia guided lesson through shared director.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- Git HTTPS push lacks credentials. Connected GitHub app create_blob/create_tree/create_commit/update_ref successfully published vendored asset commit, then local git fetched and aligned to `9b17f76`.
- Cloud browser has WebGL disabled (`THREE.WebGLRenderer: Error creating WebGL context`); use a GPU-enabled environment for actual scene visual QA. This is an inspection-environment limitation, not evidence of a new app bug.

## TESTS LAST RUN
- Inline JS and `camera-targets.js`: `node --check` passed; 14 named targets resolve. Generated 9RON GLB has three chain meshes, 31,272 triangles, no external images, valid glTF header; SHA-256 matches manifest. No `var sw=var sw=`; `git diff --check` passed. Earlier same-process local HTTP boot returned 200 for page, registry script, cell GLB. Pages HTML through `4ca4219` confirmed. WebGL creation failed in cloud browser, so visual and mobile 3D remain unverified.

## FILES CURRENTLY BEING EDITED
- None after 9RON mesh commit. Next slice likely adds `models/molecular/9p24-backbone.glb` and updates the same manifest, source notes, `index.html`, and this file.
