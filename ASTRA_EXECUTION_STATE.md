# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## ⚠️ SOURCE OF TRUTH — READ FIRST
The TypeScript source now lives in `app/` (see `app/README.md`). **Do not hand-edit the minified bundle in `index.html` any more.** Edit `app/src/…`, then `cd app && npm install && npm test && npm run site` (rebuilds and copies `index.html`, `models/*.glb.txt`, `vo/*` to the repo root), then `python tools/validate_visual_assets.py`.
All 53 earlier bundle patches (Wave 1 chrome CSS, Studio lighting/fog, cell material palette, open-cell loader + tiers, organelle/protein focus, PDB protein swap, membrane backdrop, semantic camera registry) were ported into source in the slice "Restore source of truth". `camera-targets.js` was removed: the registry is `app/src/scene/cameraTargets.ts` and is still exposed as `window.__CCCameraTargets`.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
Run `git rev-parse HEAD`. Last slice: "Neuro / cerebral vascular foundation".

## LAST VERIFIED LIVE DEPLOY
Live Pages HTML contains the Nav1.5 loader from `07e29e4`. Cell, 9RON, and 9P24 GLBs returned HTTP 200 with the expected glTF MIME type. The cloud browser has WebGL disabled, so a 3D visual check remains unavailable here.

## COMPLETED SLICES
- Neuro / cerebral vascular foundation (`app/src/neuro/`): new top-level "Brain" module. `anatomy.ts` — brain frame from the body.glb brain geometry (geometry is pre-baked to body space; do NOT use the node transform), ICA (cervical → siphon → terminus), vertebrals, basilar, Circle of Willis (A1, ACoA, PCoA, P1), M1 → M2 superior/inferior → cortical branches, A2/pericallosal + callosomarginal, P2 + temporal branch, SCA, PICA; `territoryAt` / `peripheryAt` with `TERRITORY_CORE` + `TERRITORY_RADIUS`. `perfusion.ts` — pure, seekable primitives: `territoryFlow` (circle collaterals incl. hypoplastic ACoA/PCoA and fetal PCA, leptomeningeal grade, M2 division occlusions affect only their half), `systemicFactor` (MAP/CPP pressure-passive collaterals, PaCO₂ reactivity, hypoxia), `timeToInfarct(cbf)`, `territoryStates` (core/penumbra mL and shading radii, recanalization freezes core), `hemorrhageShape`, `neuroSummary`. `neuroStore.ts` presets (M1 L/R, M2, ICA ± isolated circle, basilar, P2, ICH, SAH), deterministic clock `setNeuroMinutes`, `recanalize`. `NeuroScene.tsx` — brain surface (winding flipped to outward — the source mesh is inside-out), gyri shader, territory core/penumbra shading with irregular borders, vessel tubes coloured by perfusion with clots and flow particles, pial branches snapped to the cortex, ICH/SAH primitives, `brain.*` targets (`whole, cow, mca_l, mca_r, aca, pca, basilar, ica_l, ica_r`) registered via `registerAnchors('neuro')`. `window.__CCNeuro {store, load, minutes, recanalize, focus}`. `tests/neuro.test.ts` (11).
- Global effects library started in `app/src/scene/effects.ts`: `rbcGeometry`, `saturationColor` (+ teaching palette), `approach`, `budget(tier)`, `MotePool`, `tubeAlong`, `frameDt` (honours `window.__instant`). Used by the alveolar and neuro scenes; port older scenes opportunistically.
- Alveolar close-up (`app/src/vent/AlveolusScene.tsx`, mapping in `app/src/vent/alveolarMap.ts`, shared effects in `app/src/scene/effects.ts`). New vent view "Alveoli" (`ventView: 'alveolus'`, `ventTarget` in `app/src/app/store.ts`). 12 alveoli around an alveolar duct with shader-cut openings, a Voronoi capillary sheet on each wall, septal capillary tubes with instanced biconcave RBCs, pulmonary arteriole/venule, surfactant film (breaks into islands as function falls), fluid fill + froth, O₂/CO₂ diffusion motes, and a barrier cross-section (surfactant, lining fluid, type I cell, basement membrane, interstitium, endothelium, plasma, RBC) whose interstitium/lining thicken with the scenario. Everything is a READ of `session`: collapse = 1−open / pleural collapse / unventilated share (the same terms `updateGasParams` uses), size = regional volume, flooding = the scenario's fixed shunt above normal in wet recruitable lungs, low V/Q = `pt.p.lowVQ`, blood colour = SvO₂ → ccNormal / ccLow (blue→red teaching palette). Semantic targets `lung.whole/alveolus/capillary/rbc/membrane/edema/collapsed/recruited` in `cameraTargets.ts`; `registerAnchors('vent', …)` lets `resolveTarget` return live positions. `focusVentTarget(id)` and `window.__CCVent {session, focus, load, set}` for lessons/automation. HIGH/MEDIUM/LOW change sphere segments, capillary count and particle budgets only. `tests/alveolus.test.ts` (4): normal all aerated, ARDS dependent collapse recruited by PEEP 5→18 with larger end-expiratory size, oedema floods units that keep venous blood, PTX collapse. Screenshots (swiftshader): normal, ARDS PEEP 5/18 (recruited label), membrane normal/ARDS, oedema focus, PTX lung view unchanged, phone 390×844.
- Membrane bilayer upgrade (`app/src/labs/cell/patch.tsx` → `Bilayer`): asymmetric leaflets (outer PC/sphingomyelin, inner PE + negatively charged PS), tapered saturated + cis-kinked unsaturated tails (inner leaflet more unsaturated) with a subtle GPU sway, cholesterol between tails, glycocalyx sugar chains on the outer leaflet, a translucent hydrophobic core band, and compact layer labels (Organelles label mode, hidden while a protein is focused, hidden on phones). LOW tier keeps the old cheap heads + straight tails. `SLAB` dimensions, site positions and ion crossings unchanged.
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
Infarct Atlas source recovery (blocker triage), then coronary/heart polish.

## EXACT RESUME POINT
`infarct-atlas/index.html` is a built bundle with no source in this repo. Check the user's other repos (`list_repos`) / git history for its source; if none, document the blocker in this file and move to the Lesson Director (deterministic timeline over `setNeuroMinutes`, vent `__CCVent`, lines session) — do NOT hand-edit the bundle.

## NEXT 10 SLICES
1. (done) Alveolar microscene.
2. (done) Brain + cerebral vessel semantic geometry foundations (HuBMAP brain is already in body.glb; cerebral arteries must be drawn — see `app/src/lines/vessels.ts` for the landmark-driven vessel builder pattern).
3. Lesson Director: deterministic timeline (clock-driven, seek/pause, no chained setTimeout) that directs existing sessions; generalise `app/src/app/LessonShell.tsx`.
4. MOA data graph (MechanismDefinition/Node/Edge) + UI shell as a new top-level mode.
5. Norepinephrine α1/β1 MOA with shock context — reuse `lines` session (`setNore`, SVR) for the patient response.
6. Hyperkalemia signature lesson through the Lesson Director (labs bench + cell scene + ECG).
7. Stroke vascular state + imaging primitives (ClinicalImagingScene).
8. Curriculum metadata + progress persistence.
9. Port respiratory lessons through the shared director.
10. Heart/coronary polish in the Infarct Atlas (separate app in `infarct-atlas/`; its source is NOT in this repo — see KNOWN BLOCKERS).

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- `infarct-atlas/index.html` is a built bundle whose source is not in this repo; heart/coronary polish there needs its source added first (same restore-source step as `app/`).
- Visual QA: this environment has WebGL via swiftshader (`--use-gl=angle --use-angle=swiftshader`); slow but real. Serve the repo root with `python3 -m http.server` (binary GLBs need http, not file://).

## TESTS LAST RUN
- `app`: `tsc --noEmit` clean; `vitest` 102/102 (neuro 11). Brain module screenshots: normal, CoW from below, L M1 at 90 min and 8 h (lateral), basilar, ICH, SAH — no page errors. Earlier: `vitest` 91/91. `tools/validate_visual_assets.py` passed; no `var sw=var sw=`. HTTP + WebGL screenshots of the alveolar view (normal, ARDS PEEP 5/18, membrane, oedema, phone) and PTX lung view: no page errors. Screenshot note: call `window.__CCVent.session.tick()` in a loop and set `window.__instant=true` because swiftshader frame rate is too low for the sim to advance in real time.

## FILES CURRENTLY BEING EDITED
- None.
