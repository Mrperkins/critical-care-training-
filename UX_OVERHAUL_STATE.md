# UX / Product Overhaul State

Updated: 2026-10-04

## Canonical source
- `main` is the canonical production branch.
- Active redesign branch: `ux-overhaul-v2`.
- GitHub Pages serves checked-in repo-root build artifacts, not `app/src` directly.
- `.github/workflows/site-sync.yml` now rebuilds and syncs the root Pages artifacts from `app/` on `main`.

## Product target
Selected direction: the FIRST mockup.

Primary hierarchy:
Home / Curriculum
→ Learn | Explore | Practice
→ clinical domain
→ lesson / interactive scene / case.

Preserve all existing engines, lessons, clinical media, procedures, drug MOA, cases, simulations, labels, glossary, drills and audio systems. This is an information-architecture and presentation overhaul, not a roadmap reduction.

## Audit: what already exists
### Clinical / visualization engines
- Ventilator physiology, waveforms, loops, alveolus, airway, CXR and lung ultrasound.
- ABG / acid-base training.
- Labs / cellular physiology.
- Lines / hemodynamics.
- Cardiac, abdomen, neuro and pharmacology modules.
- Lesson Director and step lessons.
- Real clinical media and synthetic imaging.
- Scene labels / dots / off, tap-for-details, glossary, fullscreen and structure drill.
- Scene-based challenge cases with remediation.
- Curriculum/progress/bookmarks/weak-topic tracking.

### Expertise Audio
- 130 mastery concepts.
- 130/130 concepts have expert teaching notes.
- 130/130 have standalone expertise-audio coverage.
- 79 expertise sessions across 21 ordered tracks.
- 20 guided procedural Mental Reps.
- 132/132 Mental Rep beats have durable natural-voice MP3 assets.
- 130/130 concepts have spaced-retrieval coverage.
- Multi-part long-form audio player and render plan exist.

## Audit: why Audio was not visible
The Audio source was merged, but the repo-root Pages build was stale:
- `app/src/app/App.tsx` had the Audio navigation.
- `app/scripts/build-app.ts` generated `dist/pub/audio/index.html` and copied durable voice assets.
- The repo root did NOT contain an `audio/` directory, so GitHub Pages could not serve it.
- Final source changes had not been rebuilt/copied into the checked-in root `index.html`.
- CI triggers were still pointed at the old `audio-mastery` / `visual-overhaul` branches after the merge.

Operational repair:
- Validation CI now targets `main`.
- A main-branch source → Pages sync workflow was added.
- The first sync exposed a git rebase/worktree bug after successfully generating the audio files; the workflow now cleans non-Pages generated changes before rebasing.

## Audio remaining production limitation
Do not confuse curriculum completeness with rendered long-form media:
- All 79 expert sessions have complete, versioned scripts.
- The 132 procedural Mental Rep beats have durable natural voice.
- The full 79-session expertise library is NOT fully rendered to production natural-voice MP3s yet.
- The long-form render plan is provider-ready, but full rendering is an external provider / cost decision.

## Audit: UI against selected mockup BEFORE this branch
NOT implemented:
- Curriculum as the true Home page.
- Learn / Explore / Practice as the global mental model.
- Clinical domains as secondary navigation.
- Contextual single-purpose right panel.
- Unified scene toolbar: View / Labels / Fullscreen / Glossary / More.
- Focused Learn workspace with step progression.
- Consistent Practice case shell.
- Mobile scene + bottom-sheet interaction model.

Still present before this branch:
- 9 top-level module pills.
- 4 global modes: Explore / Learn / Challenge / Simulate.
- Curriculum as a ninth module.
- Vent Explore stacks Scenario + Story + Numbers + Interventions + Loops + Controls + Gas + Explain simultaneously.
- Scene controls are distributed across multiple overlay groups.
- Mobile stacks the scene followed by a long control page.

## Implemented in UX Overhaul Slice 1
- Curriculum/Home is now the default entry.
- New persistent clinical-domain rail.
- Primary mode model is Learn / Explore / Practice.
- Challenge + Simulate are grouped under Practice.
- Audio is a first-class top-level destination.
- New Home hero and four primary entry cards:
  - Continue Learning
  - Explore
  - Practice
  - Critical Care Audio
- Full curriculum filters moved behind progressive disclosure rather than dominating the landing experience.
- Existing engines and modes remain intact underneath the new shell.
- Responsive desktop/tablet/mobile shell.

## Next implementation slices
1. Scene command bar: consolidate View / Labels / Fullscreen / Glossary / More.
2. Context panel: stop stacking every control/card; expose Patient / Controls / Findings / Reference contextually.
3. Learn workspace: scene dominant + current step + progress + Previous/Next; unrelated controls hidden.
4. Practice workspace: patient → information → decision → intervention → response → debrief.
5. Mobile: keep the scene visible and move content/controls into a tabbed or draggable bottom sheet.
6. Cross-module polish and visual regression at desktop / tablet / phone sizes.

## Non-negotiables
- Do not remove roadmap capabilities to simplify the UI.
- Do not replace natural voice with browser TTS.
- Do not mark unreviewed audio as clinically reviewed.
- Preserve real-media attribution and licenses.
- Preserve accessibility, keyboard navigation and reduced-motion support.
