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
- Media pipeline: `clinical-media.yml` now also runs on `ui-overhaul`. Discovery rounds 2–4 reviewed visually; 102 real items shipped (55 added on this branch). Remaining gaps: normal FAST RUQ and LUQ, adult right-lung collapse film, obese-habitus film, liver/spleen blunt-trauma CT, IO tibia photo, radial-artery and PIV ultrasound. Next discovery lines: `imaging/real/discovery-next.txt` (copy into fetch-request.txt to run). Where a gap remains the imaging view says no real study is sourced; audio rep frames fall back to their schematic only for those gaps.
- Known tool issues: the two Tsung LUS clips fail the duration check (5.87 vs 6.00 s); the two echo stills lack licence evidence.
- Children are shown on the adult reference body (no open pediatric body model found); the scene says so.
