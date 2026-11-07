# Clinical completion execution state

Read this file first. The initial audit is complete; continue from the implementation and QA evidence below.

## CURRENT BRANCH
feat/clinical-completion-20261008. Draft PR #27: https://github.com/Mrperkins/critical-care-training-/pull/27

## CURRENT COMMIT
Disease/vent implementation: ea45a7c91817a71b6f25fc275e7a83a619343024. Subsequent navigation/phone-label polish belongs to CURRENT BRANCH HEAD; use `git rev-parse HEAD` for the full current SHA. Earlier shell/CI repairs: d3764dcd1b2c82a13d66660eceab5226e3b6c909. Consult `git rev-parse HEAD` for a subsequent documentation checkpoint. Remote implementation tree equals the locally tested tree (37f0f0c6fede093ef6439b03138b1060f9fac917).

## LATEST VERIFIED LIVE DEPLOY
Main and generated Pages SHA: 1e5aee3a16bd2d6ab547be9af3c4892f4cf50347, reconfirmed via GitHub on 2026-10-08. Parent source: 809a92c7f7f9bd54a49e23fe3291dc59ee47a7bc. Existing Pages run 37753798843 succeeded. Live Home and Videos/Skills used in the cloud browser. Feature implementation has NOT been merged or deployed.

## CURRENT VISUAL BASELINE
Iteration 1, Simplify & Focus, inspected from the supplied ASTRA redesign board. Live baseline Home has a four-child header in a three-column fixed-height grid; Audio wraps onto the clinical rail. Entering Respiratory blanked the React root after WebGL failed. Only baseline browser screenshots exist. Six updated procedural organ diagrams have been rendered and visually reviewed separately; those are not application screenshots or responsive sign-off.

## COMPLETED WORK
- Fetched latest main, inspected source architecture, installed dependencies, started local HTTP server on 8765 and used live Home/Respiratory/Videos/Skills. app/ is authoritative; root index.html is generated.
- Restored one primary Learn / Explore / Practice hierarchy, restrained Resources disclosure, navy shell, domain drawer at <=1024px, Scene/context task tabs, focused Home, progressive curriculum disclosure, visible lesson progress/Previous/Next and touch-size primary controls.
- Fixed Home/Resources mode dead-end; within-domain mode changes preserve clinical context. DOM regression verifies Learn interaction states at 320/360/390/430/768px. This is not actual responsive browser reproduction or visual verification of the originally reported mobile bug.
- First-class Pediatrics and Women’s Health / OB, with substantive condition-specific content in all three experiences.
- Shared disease-state engine: 84 conditions, 12 organ/modality primitives, bounded progression, labels, distinctions, references and decision consequences. Four-step Director lessons use semantic targets and deterministic progression. Chemistry/systemic circulation have distinct targets so affected-anatomy actions actually reveal their mechanism.
- Atlas lessons integrated into shared curriculum, completion tracking, recent learning, Home resume, bookmarks and deep links. Paused moments and ten-second checkpoints persist without per-frame storage writes.
- Whole-patient adult view reuses shipped HuBMAP geometry, eased semantic camera focus, skin translucency, organ emphasis and procedural pathology overlays. Pediatric/reproductive content uses separate anatomy schematics, not an adult male reproductive stand-in.
- Sixteen atlas conditions integrate exact, shipped real imaging comparators through existing RealCaseCard; provenance and attribution remain. No new external media assets added. Clinical review packet includes 420 atlas mechanism/distinction/decision rows.
- Equipment simulator reuses VentSession / Mechanics / SyntheticPatient: seven modes, 17 constrained numeric parameters, draft editing/atomic confirmation, alarms/limits, holds, circuit faults, patient monitoring, ABG, scalars/loops, feedback and 13 scenario selections. Full patient/stretcher/circuit/monitor is procedural SVG with lung volume/oxygenation response.
- Pediatric ventilation uses scenario weight instead of adult PBW, including dead space and mL/kg reporting.
- Mobile equipment uses Patient / Ventilator / Waveforms / Feedback tabs; global duplicate Scene/context tabs removed for equipment. Atlas Practice uses one decision experience rather than a duplicate Cases/Simulator switch. On small phones, readable HTML captions/findings replace scaled SVG annotation text.
- Graphics failure contained; mobile DPR capped at 1.25; offscreen/hidden drawing paused; waveform observers no longer rebuild at each UI pulse; owned 3D geometry/materials explicitly disposed and per-frame vector/color allocation reduced.
- Existing video feeds/providers/manufacturer resources preserved. npm scripts avoid unsupported tsx CLI IPC in this runtime. CI includes pinned Python/NumPy setup for asset validation.

## CURRENT SLICE
Implementation and coverage checkpoints persisted in draft PR. Local tests/build and both source CI workflows are green. Production-build visual QA remains externally blocked; do not merge. Documentation-only commits may trigger the same checks again; verify the latest PR status before continuing.

## NEXT SLICE
Use a permitted browser-accessible feature build with WebGL and viewport control for the requested visual/touch matrix. Compare the actual UI, anatomy, Learn animation and equipment simulator to Simplify & Focus; fix findings on this branch. This is the remaining release gate, not a new initial audit.

## OPEN BUGS
- Baseline header collision: repaired in source; AFTER visual confirmation missing.
- Mobile Learn dead-end/state bug: repaired/tested in DOM; original mobile browser failure has not been independently reproduced at exact widths or touch-verified.
- Renderer root crash: contained in source/tests; graphics-capable scene quality unverified.
- Native drawer Escape/Tab/focus behavior, actual scroll containment, tap hitboxes, contrast and overflow need built-app browser verification.
- Atlas/vent patient and reproductive/pediatric anatomy fidelity, equipment hierarchy and teaching animation quality require actual rendered-app review. Schematics are not realistic replacement 3D models.
- Source has broad coverage; physiological intensity is illustrative, not a validated clinical predictor. Do not equate registry/tests with clinical validation.

## RESPONSIVE QA STATUS
Live baseline Home/Skills inspected at default 1363x930 only. Exact 1440x900, 1920x1080, 1280x800, 1024x768, 768x1024, 430x932, 390x844, 360x800 and 320px-wide matrix NOT signed off. Phone/tablet navigation, atlas transport/bookmarks, mechanism destinations and equipment interaction states are DOM-tested; no visual/layout measurements are claimed.

## SCREENSHOTS CAPTURED
- docs/qa/completion-20261008/home-desktop-before.jpg
- docs/qa/completion-20261008/skills-desktop-before.jpg
- docs/qa/completion-20261008/atlas-static-review.png: six procedural diagrams, visibly labeled STATIC / NOT BROWSER QA.
See UI_FINAL_REVIEW.md. Required AFTER Home/Learn/Explore/Practice/Videos/Skills/vent/disease desktop/mobile screenshots remain missing.

## DISEASE VISUALIZATION COVERAGE
84 definitions: 48 adult, 19 pediatric/neonatal, 17 Women’s/OB. All requested adult respiratory, cardiovascular, neuro, shock/trauma and metabolic/toxicology conditions have state-driven schematic mechanisms, Explore and decision cases; no coming-soon entries. PCOS/endometriosis, normal maternal/fetal physiology and major OB emergencies included. See DISEASE_ATLAS_COVERAGE.md for exact inventory. Every condition’s actual affected-anatomy destination is DOM-tested; each diagram changes geometry/flow with progression. All semantic target references resolve.

## VENT SIMULATOR STATUS
Seven existing-engine modes: VC, PC, PSV, SIMV, PRVC, CPAP, APRV. Equipment scenarios: ARDS, severe asthma, COPD/auto-PEEP, cardiogenic edema, pneumonia, tension pneumothorax, post-intubation hypotension, high peak/normal plateau, high peak/high plateau, tube obstruction, circuit leak, disconnection, pediatric asthma (20 kg). Tests demonstrate confirmed tidal-volume response, ARDS recruitment, asthma expiratory emptying/auto-PEEP, circuit loss/reconnection and valid initial settings. Equipment scene is procedural SVG, not yet visually signed off. Original guided intubation cases remain available from the simulator.

## TEST STATUS
Latest local: npm test 748/748, 54 files; npm run typecheck passed; npm run audio:audit complete with all eight gate lists empty; npm run site passed; tools/validate_visual_assets.py passed. Production JS 2.56 MB uncompressed, self-contained index 28.12 MB. Existing build is IIFE; lazy React components defer mounting/assets but do NOT provide network JS splitting. Build output stays separate from source commit while merge gates are open. Local generated index.html, sw.js, audio production queue and review packets are intentionally uncommitted; app/dist/pub is the tested production output and CI uploads that build as an artifact.

## CI STATUS
Expansion ea45a7c: Clinical app validation run 37774717443 and Audio Mastery CI run 37774717426 both completed successfully. Later documentation/navigation commits trigger the same workflows again. Check latest PR head/runs; fix any failures. Draft PR #27 remains unmerged.

## EXTERNAL BLOCKERS
- Cloud browser WebGL disabled: GL_VENDOR/GL_RENDERER=Disabled; deployed baseline fails creating its context.
- Cloud browser cannot reach shell-local 127.0.0.1:8765: connection refused, separate runtime. Local server/build working is not a browser preview.
- Browser file:// navigation explicitly prohibited. Do not try raw CDP, alternate browser surfaces or indirect file execution as workarounds.
- Supported browser API advertises no viewport/emulation controls. Exact matrix cannot be run in this browser.

User authorizes merge only AFTER full implementation and visual gates. Keep draft; do not merge, publish the generated bundle or call the assignment complete while these checks remain unverified.

## UI overhaul branch (`ui-overhaul`, PR to main — not merged by the agent)
- Shell v3: domain header strip removed; domain name, Learn/Explore/Practice, condition atlas and Cases/Simulator live in the top bar. Rail has line icons and full labels. One accent (#6cc4b6, selection only), one family (Atkinson Hyperlegible Next + Mono). Sentence-case labels replace tracked capitals.
- Home: one heading with progress, three action cards, no filler hero. Videos: duplicate title removed; feed sections as one segmented control and sources as a dropdown.
- Ported from `visual-overhaul`: scenario picker plus folding sections (Respiratory's four context tabs replaced), compact vent/ABG readouts, Explore memory, and the stroke time slider to day 14 with real CT per stage. Synthetic neuro CT panels (`ClinicalImagingScene`, `synth.ts`) were removed; `realReference.ts` and its tests are kept. Simulator stays on main's `VentWorkbench`.
- Scene toolbar uses SVG icons. Canvas fonts were switched to Atkinson.
- Verified on a local build at 1440×900 and 390×844 with 758/758 tests passing and the visual-asset validator passing. In the sandbox the YouTube embeds render white because there is no network; this is not a layout bug.
- Not done yet: the Peds/OB atlas mannequin restyle; real media for the remaining drawn imaging (CXR, LUS, FAST/aorta, IJ); a review of discovery round 2; 4 pending media items.

### Real images and open 3D models (same branch)
- Rule: anything picturing anatomy, a patient, a device or a medical image is a real openly licensed image/clip or an open 3D model. Live data (waveforms, monitor traces, ABG map, PK and pressure–volume curves, to-scale depth charts, drain gauges) stays programmatic.
- 3D: HuBMAP Visible Human Female body (`app/pipeline/build-body-f.ts` → `body-f.glb`: organs, airway, uterus, ovaries, tubes, term placenta/amnion/cord) and airway added to the male body; HuBMAP eyes (`build-eyes.ts` → `eyes.glb`) for the pupil exam; the condition atlas is 3D for all 84 conditions (`atlas/anatomy3d.ts` maps condition → body/organs; pediatric congenital-heart conditions open the real 3D heart). `atlas/Diagrams.tsx` deleted. Neuro exam shows a 3D weakness map on the reference body.
- Imaging: `scene/imaging/RealStudy.tsx` picks the real study by finding keys from the model (`cxrKeys`, `lusKeys`, `fastKey`, `ctaKeys`, `ijKey`); if no real study carries the finding it says so instead of showing something else. Synthetic renderers removed (`renderCxr`, LUS/FAST/CTA B-mode and HU renderers, `scene/ultrasound/bmode.ts`, `ImagePanel`).
- Media pipeline: `clinical-media.yml` now also runs on `ui-overhaul`. Discovery rounds 2–4 reviewed visually; 103 real items shipped (56 added on this branch). Remaining gaps: normal FAST RUQ and LUQ, adult right-lung collapse film, obese-habitus film, liver/spleen blunt-trauma CT, IO tibia photo, radial-artery and PIV ultrasound. Next discovery lines: `imaging/real/discovery-next.txt` (copy into fetch-request.txt to run). Where a gap remains the imaging view says no real study is sourced; audio rep frames fall back to their schematic only for those gaps.
- Known tool issues: the two Tsung LUS clips fail the duration check (5.87 vs 6.00 s); the two echo stills lack licence evidence.
- Children are shown on the adult reference body (no open pediatric body model found); the scene says so.

## MI Locator in the Cardiac tab (`feat/mi-locator-cardiac`)
- Read first: ChatGPT's merged Infarct Atlas embed (old `infarct/components/App.tsx`, swapped in for the whole Cardiac tab with its own top bar, fonts, clock and lighter heart) and draft PR #40 (canonical-heart projection, tested only on synthetic data). Content (9 territories, culprits, dominance, lead views, lessons, quiz) was sound; ST patterns re-checked per territory against facing/reciprocal leads.
- Now: Cardiac has two views switched at the top of the scene — Heart & flow | MI Locator (`?module=heart&view=mi`; `view=coronary` and /infarct-atlas/ still land there). MI Locator uses the app's stage: 3D heart and live 12-lead side by side (3 × 4 + rhythm when ≥ 2.4 px/mm, else 6 × 2; stacked heart → territories/timeline → ECG on ≤ 1024 px), explanation/lesson/case in the side pane, Learn/Explore/Practice from the app tabs.
- One heart: `infarct/asset/sharedHeart.ts` transfers coronary territory weights, fat/AO and beat channels from coronary-heart.glb onto heart-hd.glb chambers (inverse-distance blend, dense grid; ~0.3–0.6 s once). Registration measured first (p95 1.5–1.8 mm per chamber; refuses and keeps the light heart if > 4 mm). Territory highlight is drawn on the myocardium itself; picking uses the light myocardium as an invisible proxy. `tests/mi-shared-heart.test.ts` runs the real transfer on the real assets.
- Fixed: the coronary heart's meshes kept meshopt de-quantisation in node matrices, so the beat shader worked in quantised space (sheared instead of contracting) — now baked to the body frame on load (AtlasLayers updated to match).
- One clock (`infarct/engine/clock.ts`) advanced by the view (not the canvas) drives ECG sweep, contraction and the new conduction-system overlay (heart-internals activation map; SA at 50 ms, His–Purkinje inside the QRS).
- Narration: STEMI lesson cues (`mi-stemi-*`) and every territory-lesson step (`lessonVoiceId`) added to vo lines (960 total); clips rendered by narration.yml on this branch.
- QA: `scripts/qa-mi-locator.mjs` (desktop/tablet/phone, side-by-side geometry, shared heart registered, inferior STEMI evolves, pixel checks) added to heart-ecg-ci.yml.
- Not done (candidates): left-main / aVR and other STEMI-equivalent patterns; rhythm consequences (e.g. AV block in inferior MI); PR #40's whole-heart/split/layer explorer for Heart & flow remains a separate draft.

## MI Locator: STEMI equivalents + animations (`feat/mi-patterns-animations`)
Split of work (user, Oct 11): Claude owns ECG patterns and 3D animation; ChatGPT reworks lessons and practice cases.
- **Patterns** (`app/src/infarct/data/patterns.ts`, `EQUIVALENTS`): left main / aVR (global subendocardial), de Winter (proximal LAD occlusion), Wellens A (biphasic T) and Wellens B (deep symmetric T inversion). Each has `criteria` (text + leads), `lesion` (occlusion / near-occlusion / stenosis), `transmural` (0 inner layer → 1 full thickness), `action`, `explanation`, `clinicalPearls`, and Wellens has its own sequence (`seqKeys`, `sequence`: plaque → occludes → pain → re-opens → T waves change → pain-free).
- ECG model (`ecg/ecgModel.ts`): new `jDep` (upsloping J depression) and `tWave` ('tall' | 'inverted' | 'biphasic') pattern components; `jPointMm`, `tWaveMm` measurements. `tests/mi-patterns.test.ts` checks each pattern against its criteria (aVR ≥ 1 mm > V1 with ≥ 6 leads depressed; de Winter J −1…−3 mm upsloping + tall T, no STE; Wellens T changes with ST < 1 mm, R preserved, no Q).
- **For lessons/cases (ChatGPT):** equivalents are deliberately NOT in `TERRITORIES` (territory lessons and quiz are generated from it). Select one with `selectFocus(id)` (MILocator.tsx) or `useApp.getState().set({ territoryId: id, ... })`; render lookups go through `FOCUS` / `focusOf` (`data/focus.ts`); playhead scenes through `sceneFor(id, p)`. Lesson cues can set `slice: true` and `scene` directives exactly like the existing STEMI lesson. QuizCase currently expects a territory id — extend `buildQuestions` or write bespoke questions for equivalents.
- **Animations:** short-axis slice (`engine/slice.ts`) cuts the real light-heart LV/RV shells (closed inner + outer surfaces) at mid-ventricle; caps carry depth (0 endocardium → 1 epicardium/mid-septum) and territory weights; ischaemia spreads from the inner layer outward up to the pattern's `transmural` (wavefront line), so left main shows a circumferential subendocardial band and a classic STEMI a transmural wedge. All heart materials share one clip plane (`CLIP`). Culprit lesions: thrombus (occlusion), plaque + partial thrombus with trickle flow (near-occlusion), plaque with a transient thrombus that clears on re-opening (Wellens). Outer-surface injury tint scales with depth (`uSurf`). ECG labels show J (de Winter), T (Wellens) or ST.
- Tests: `mi-patterns`, `mi-slice` (real meshes), helpers in `tests/helpers/heartAssets.ts`; QA script screenshots left main slice and Wellens.

## MI Locator: rhythms and the electrical impulse (`feat/mi-rhythm-impulse`)
- `app/src/infarct/engine/rhythm.ts`: beat-by-beat schedules (sinus, sinus brady/tach, 1st-degree, Wenckebach, Mobitz II with RBBB, CHB with junctional or ventricular escape, RBBB, LBBB), each with `seenWith` MI territories (nodal blocks ↔ inferior/RV/posterior; infranodal and bundle blocks ↔ anterior/septal), explanation and pearl. One schedule drives the ECG (`rhythmVoltage` / `voltageFrom`: every P and every QRS–T summed), the contraction (`rhythmState`: dropped beats do not contract) and the impulse.
- ECG model split into `pPart` + `ventricularPart(kind)` with RBBB, LBBB and ventricular-escape morphologies (`QRS_EXTRA` widens the QRS and shifts ST–T; discordant T in LBBB/escape). `sample()` unchanged for narrow beats.
- Impulse (Show impulse / Rhythm & impulse card): SA node fires → atrial depolarisation front on the atrial walls + sparks along three internodal routes and Bachmann's bundle (heart-internals landmarks) → AV node conducts slowly, amber glow while it holds the impulse for a long PR, red flash when a P is blocked → His/bundles/Purkinje on the QRS clock (right or left bundle late in BBB, His dark for a ventricular escape) → ventricular front sweeps apex → base. Live phase text under the heart. Selecting a rhythm turns the impulse on. Practice resets to sinus.
- For lessons/cases: set `useApp.getState().set({ rhythm: 'wenckebach', conduction: true })`; `rhythmsFor(territoryId)` lists the linked rhythms. Tests: `tests/mi-rhythm.test.ts`.

## Courses, camera and Shell v4 (`feat/premium-course`)
User (Oct 16): premium medical training tool, not an AI-looking app; animations separate from the 3D model and camera; every lesson fully fleshed out with a choice of Full course or an 80/20 TL;DR.
- **Camera policy** (`app/src/scene/cameraPolicy.ts`): every scene rig calls `useCameraGate(ref)` (heart, neuro, abdomen, lines, labs, ABG, lungs, alveolus, atlas patient, bedside, MI Locator). While a lesson owns the model (the Director loads a timeline, or the MI Locator is in lesson mode), a scene's `setLookAt` is stored as the lesson's suggested view instead of moving the camera. The player shows "Frame this view" (highlighted when a suggestion is waiting) and a persisted "Follow lesson camera" switch. A lesson's opening shot, a newly mounted scene's first view and anything the learner clicks outside the transport still frame. Tests: `tests/camera-policy.test.ts`.
- **Courses** (`app/src/director/course.ts`, `director/courses/*`): `CourseMeta` = objectives, essentials (TL;DR scene ids), keyPoints (the 80/20), pearls, pitfalls, bedside, extra checkpoints, selfCheck MCQs. Hand-written for all 54 core lessons (32 Director timelines + 22 step lessons); derived from existing reviewed data for the 84 disease explainers (mechanism, distinction, findings, decisions) and 32 drug mechanisms (blurb, summary, time course, adverse notes). `courseTimeline(tl,'tldr')` reuses the same cues (same narration clips); each kept scene and each silent cue inside it rebuilds the world with `resolve(original, at)` so seeking stays exact; nothing is resolved per frame (vent cues simulate 14 s of ventilation in `apply`).
- **Director**: `load(tl)` opens on the track choice when a course exists (`track: null`); `choose(track)` plays it (switching mid-lesson lands on the same scene); `prefer(track)` lets a button elsewhere (home hero) skip the choice; `load(tl,false,{track:'full'})` for bookmark resumes.
- **Player** (`director/Player.tsx`): choice screen → course player with separate lesson transport, camera bar, numbered scene list, and a recap at the end (key points; full course adds pearls, pitfalls, bedside line and a self-check).
- **Shell v4** (end of `app.css`): graphite chrome; each module takes its bedside-monitor channel colour as `--accent` (`.app.m-<module>`); rail ticks in channel colours; Source Serif 4 for course text (Google Fonts link in `build-app.ts`); sentence-case labels; tabular figures instead of small mono labels. Home: course-aware hero (Full course / TL;DR with lengths) and a Systems index replacing the three cards and the starting-point pills. Lesson lists show full and TL;DR length.
- For ChatGPT: when adding lessons, add a `CourseMeta` entry (tests/course.test.ts fails for any core lesson without one) — disease explainers and drug mechanisms get one automatically.
- **Performance (`feat/premium-perf`)**: the published page is code-split (`build-app.ts` second esbuild pass: ESM + `splitting`, chunks in `js/`, entry `js/app-<hash>.js` as a module script). `App.tsx` lazy-loads every module (Vent moved to `vent/VentModule.tsx`, `AtlasEntry` split out). Home now loads ~0.9 MB of JS with no three.js (was 2.9 MB in one bundle); three-free state/data split from scene files so lessons don't drag scenes in (`vent/focus.ts`, `neuro/territories.ts`; `window.__cell` set by `CellScene.tsx`). The SW precaches the chunk list (`'__CHUNKS__'` replaced at build) and serves `js/` cache-first; `copy-site` replaces the root `js/` folder; site-sync commits it (`git add -A js`); the validator syntax-checks chunks as ES modules. `dist/index.html` stays a single self-contained file. `StudioCanvas` adapts DPR with drei `PerformanceMonitor`.
- Full-course checkpoints for every core lesson (`courses/checkpoints.ts`); lesson lengths now count narration holds and, for the full course, checkpoint, recap and self-check time. Decorative "→" removed from buttons and links (directional arrows in diagrams kept).

## FP-C exam prep (`feat/fpc-airway`)
User (Oct 16): full lessons too short; base all lessons on Kyle Faudree's study guide and the IBSC FP-C Candidate Handbook. The Faudree book is commercial with no free edition (only unauthorised copies online), so content is NOT from it. Decision (user, via questions): organise on the handbook blueprint, 15–25 min full lessons, heaviest exam weight first.
- `app/src/fpc/blueprint.ts`: the IBSC outline (10 domains, 110 items, subtopics). `fpc/types.ts`: `FpcLesson` (objectives, sections with paragraphs/list/table/worked example, `core` = TL;DR, key points, pearls, pitfalls, live links to 3D lessons, 15 questions, sources) and `lessonMinutes` (150 wpm + 40 s per question). `tests/fpc.test.ts` enforces blueprint refs, 15–25 min full, TL;DR < half, 15 valid questions.
- Domain III (Airway, anesthesia, analgesics; 17 items) complete: 14 lessons in `fpc/lessons/airway1–6.ts` + `airwayCases.ts` (a transport case and 5 extra questions per lesson). Lengths 15–21 min.
- UI: `fpc/FpcModule.tsx` (rail item "FP-C exam prep", aviation-orange channel): blueprint home by weight → domain lessons → Full/TL;DR choice → reader (serif chapter layout, per-paragraph narration "Listen" when clips exist, tables, worked examples) → exam-style question set; best score saved (`cc.fpc.scores.v1`), ≥ 80 % marks the lesson complete in progress.
- Narration: every FP-C paragraph is a vo line (`fpc.<lesson>.<section>.<n>`, added in vo-lines.ts and voice.test.ts).
- Next domains in order: IV Medical (14), VI Cardiac (14), VII Trauma/Burn (13), V Neuro (12), I Safety (9), IX Peds (9), VIII OB/Neo (8), II Flight physiology (7), X Professional (7).
- Domain IV (Medical emergencies; 15 subtopics) complete (`feat/fpc-medical`): `fpc/lessons/medical1–5.ts` + `medicalCases.ts` (transport cases and extra sections). All lessons 15–16 min full, 15 questions each.
- Domain VI (Cardiac; 17 subtopics) complete (`feat/fpc-cardiac`): `fpc/lessons/cardiac1–6.ts` + `cardiacCases.ts`. Questions are written fresh; any that echoed the handbook's sample questions were reworded.
- Domain VII (Trauma and burns; 10 subtopics) complete (`feat/fpc-trauma`): `fpc/lessons/trauma1–4.ts` + `traumaCases.ts`. All lessons 15–17 min full, 15 questions each. 
- Domain V (Neurological; 12 subtopics) complete (`feat/fpc-neuro`): `fpc/lessons/neuro1–4.ts` + `neuroCases.ts`. All lessons 15–16 min full. StatPearls sources across FP-C link to a Bookshelf search (article IDs unverifiable from the sandbox). 
- Domain I (Safety and transport; 18 subtopics) complete (`feat/fpc-safety`): `fpc/lessons/safety1–6.ts` + `safetyCases.ts`. All lessons 15–16 min. Regulatory specifics written cautiously (FAA Part 135/HAA rule, 14 CFR cites link to eCFR). 
- Domain IX (Pediatric; 12 subtopics) complete (`feat/fpc-peds`): `fpc/lessons/peds1–4.ts` + `pedsCases.ts`. All lessons 15–16 min. NAT lesson kept at recognition/reporting level. 
- Domain VIII (Maternal, fetal and neonatal; 10 subtopics) complete (`feat/fpc-obneo`): `fpc/lessons/obneo1–4.ts` + `obneoCases.ts`. All lessons 15–17 min. 
- Domains II (Flight physiology; 6) and X (Professional; 8) complete (`feat/fpc-final`): `fpc/lessons/flight1–2.ts`, `prof1–2.ts` + `finalCases.ts`. All 10 domains now built: 122 lessons, each 15–17 min full with 15 questions.
