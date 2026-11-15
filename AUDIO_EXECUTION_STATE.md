# Critical Care Audio execution state

Read this before continuing work on the audio product. Work on `audio-mastery`; base is `visual-overhaul`. Do not merge to `main`.

## BRANCH
`audio-mastery`

## BASE
`visual-overhaul`

## PRODUCT
Standalone voice-first critical-care mastery product at `/audio/`, connected to Critical Care Physiology but deliberately not loaded inside its already-dense UI.

Pillars:
1. **Listen** — Daily Dose, Critical Care Rounds, ICU Literacy, Deep Dives and unfolding Audio Cases.
2. **Mental Reps** — guided procedural visualization / mental rehearsal.
3. **Review** — spaced retrieval + confidence calibration.
4. **Mastery** — six-level critical-care knowledge graph shared with the visual simulator.
5. **Teach me this until I understand it** — prerequisite → audio → visual physiology → Mental Rep → retrieval path.

## HARD REQUIREMENTS
- Natural human-quality voice is mandatory.
- No browser/OS TTS production fallback.
- Production narration must be a reviewed premium neural voice or clinician recording with a durable project-owned asset.
- Core medical curriculum is deterministic, versioned and clinically reviewed. AI may personalize/explain but must not silently rewrite canonical teaching.
- Expert-level knowledge/reasoning is the educational target; the product does not claim to replace supervised bedside/procedural expertise.
- Mental Reps are rehearsal only and explicitly defer to credentialing, local policy, manufacturer instructions and medical direction where applicable.
- Retrieval prompts intentionally interrupt passive listening; accuracy **and confidence calibration** are learning signals.

## IMPLEMENTED

### Standalone product / UX
- Separate lightweight bundle at `/audio/`; it does not load the Three.js physiology bundle.
- Responsive Home / Listen / Mental Reps / Review / Mastery navigation.
- Adaptive Home recommendations based on weak, unpracticed and overdue concepts.
- Audio-specific installable PWA manifest.
- Shared service worker with separate main/audio navigation cache keys (prevents one offline shell from overwriting the other).
- Listening-position persistence/resume added at current head.

### Mastery framework
- Six levels:
  1. Language & normal physiology
  2. Single-system critical illness
  3. Organ support
  4. Advanced physiology
  5. Multisystem critical care
  6. Expert integration
- 56 defined mastery concepts.
- Core graph includes preload/venous return/stressed volume, shock phenotyping, septic/cardiogenic/RV/obstructive physiology, PEEP/ARDS/driving pressure/mechanical power/dead space, oxygen delivery/extraction, lactate, acid-base/DKA, ICP/CPP/herniation/EVD, arterial monitoring, eFAST/POCUS, transfusion/MTP/coagulopathy, central/IO access, vasoactives, CRRT, antimicrobial PK/PD, PA catheter, ECMO, sedation/delirium, source control, goals-of-care communication, uncertainty and cognitive bias.
- Graph tests require every prerequisite and related concept to resolve (latest closure change currently in CI).

### Audio curriculum
Current catalog: 12 episodes across:
- Daily Dose
- Critical Care Rounds
- ICU Literacy
- Deep Dive
- Audio Case

Examples:
- Why intubation can crash the failing RV
- A normal SpO₂ can still hide terrible oxygen delivery
- ICU Literacy: transmural pressure
- ICU Literacy: stressed volume
- Shock is a flow problem before it is a blood-pressure problem
- Lactate is not a tissue-hypoxia meter
- CRRT without memorizing the machine
- Pulmonary artery catheters: numbers only matter if the waveforms are real
- ECMO: follow the blood
- The agitated ventilated patient
- ARDS + RV failure case
- Septic shock + AKI + fluid accumulation case

Natural-voice prototypes:
- RV/intubation Round
- Oxygen-delivery Daily Dose
- Every beat of the eFAST Mental Rep

Prototype preview URLs are **not** production assets and remain `reviewed:false`.

### Mental Reps
10 modules:
- push-dose pressor safety
- starting blood
- arterial line
- eFAST
- chest tube / pleural drain
- ultrasound-guided IJ central line
- IO access
- sudden ventilator deterioration
- moving a patient with an EVD
- massive transfusion mental run

Mental Rep engine:
- arrival → orientation → equipment → sequence → decision → complication → confirmation → debrief
- procedural visual renderer with anatomy/equipment/monitor/ultrasound/waveform diagrams
- real positive RUQ FAST clip (CC BY 2.0) in the eFAST visualization
- real IJV long-axis clip (CC BY 4.0) in central-line visualization
- one-tap Guided mode for narrated reps
- narration auto-advances between beats but stops at retrieval/thinking prompts

### Adaptive learning
- Spaced-review scheduler based on accuracy, exposure and confidence.
- Review UI asks learner to commit an answer **and** confidence.
- High-confidence misses are explicitly surfaced as priority blind spots.
- Existing Critical Care Physiology challenge results map into the audio mastery store.
- Audio Home recommendations react to those cross-modal mastery signals.
- `Teach me this until I understand it` path builder creates prerequisite → listen → visual → rehearse → test sequences.
- Mastery concepts link back to live visual physiology lessons/scenes via deep links.
- Main app accepts `?module=&mode=` and `?lesson=` deep links from the audio app.

### Hands-free
- Progressive Web Speech command parser/capture after explicit mic tap.
- Implemented player commands: play/resume, pause/stop, next, previous, repeat.
- `quiz me` routes to deterministic spaced review.
- `go deeper` routes to the concept's Teach-Me mastery pathway.
- `give me an example` routes to a related pre-authored Audio Case when available, otherwise to the mastery pathway.
- No browser TTS is used to synthesize medical answers.

### Premium voice pipeline
- `scripts/audio-voice-lines.ts`: canonical narration inventory + transcript hashes.
- `public/audio/voice/pronunciations.json`: provider-neutral medical pronunciation glossary.
- `scripts/audio_voice_validate.py`: checks transcript hash, file hash, duration and review state for durable assets.
- The old prototype importer (`audio_voice_import.py` + `audio-voice-import.yml`) is retired: every clip now comes from `narration.yml` (Kokoro).
- `scripts/audio-review-packet.ts`: generates clinical, pronunciation and listening-QA review rows.
- Production publish gate requires reviewed durable audio before an episode may be `published`.
- `npm run site` generates the premium-voice inventory and packages the standalone audio app.

### CI / verification
- `.github/workflows/audio-ci.yml`: npm ci → Vitest → TypeScript → full site build → assert `dist/pub/audio/index.html`.
- CI caught and we fixed a sparse-array catalog regression introduced during batch expansion.
- CI also caught an offline pre-cache test assumption when the generated `audio/index.html` shell was introduced; the test/build contract was corrected.
- Duplicate push/PR verification runs now cancel via CI concurrency.
- **Verified green at code commit `6521233`**: 384/384 tests, TypeScript clean, full `npm run site` build clean, standalone `dist/pub/audio/index.html` assertion passed.
- Durable eFAST voice import workflow also completed successfully and validated all 8 assets.

## KNOWN BOUNDARIES / PENDING
- eFAST narration is now project-owned/durable but still prototype/unreviewed. RV and oxygen-delivery episode samples still use external preview URLs.
- No episode/rep should be marked production-reviewed until transcript + pronunciation + listening QA are complete.
- Full browser visual QA of `/audio/` at desktop/tablet/phone still required.
- `quiz me`, `go deeper`, and `give me an example` hands-free commands need deterministic/tutor routing.
- Remaining mastery breadth to deepen: nutrition, hepatic/GI failure, endocrine crises beyond DKA, toxicology, transplant/immunosuppression, burns/trauma depth, obstetric critical care, pediatric/neonatal ICU depth, mechanical circulatory support beyond ECMO, liberation/weaning, ICU-acquired weakness and post-ICU recovery.
- Additional Mental Reps worth adding: ultrasound-guided PIV, airway/RSI setup, post-intubation stabilization, PA-catheter waveform run, CRRT circuit walk-through, ECMO circuit walk-through, IABP timing, sedation/analgesia setup, seizure/status sequence.

## NEXT SLICE
1. Browser-QA `/audio/` desktop + phone, including guided eFAST, offline reload, Review, hands-free controls and Teach-Me pathway.
2. Clinically review + lock the first production modules:
   - eFAST Mental Rep (durable audio already present)
   - oxygen-delivery Daily Dose
   - RV/intubation Round
3. Import durable project-owned full episode audio after transcript/pronunciation sign-off.
4. Add additional narrated Mental Reps and richer synchronized visual states.
5. Expand mastery graph and audio curriculum into remaining ICU expert domains.
6. Add instructor/SME review workflow for approving manifest `reviewed/published` state without hand-editing JSON.

## NATURAL NARRATOR (branch `natural-voice`)
- Every spoken line in both apps is rendered offline by one natural neural narrator: Kokoro-82M v1.0 full-precision ONNX (Apache-2.0), voice `af_heart`, speed 0.95 (`app/src/audio/narrator.ts`). Replaces the int8 Kokoro `bf_emma` clips at 24 kb/s, the browser speech fallback, the expired 7-day preview links and the external "AI Voice Generator" rep prototypes.
- Coverage: 870 visual-app lines (Director cues, step lessons, all 84 condition-atlas lessons and pharmacology walk-throughs — the last two previously fell back to robotic browser speech) = 2.6 h; 132 Mental Rep beats + 404 episode parts (all 79 episodes) = 30.5 h.
- Clinical speech normalisation in `app/scripts/narrate.py`: acronyms spelled from explicit phonemes, word-acronyms said as words, subscripts/units/symbols expanded, roman-numeral factors as numbers. −18 LUFS, 24 kHz mono, MP3 48 kb/s (episodes 32 kb/s).
- Storage: repo-root `vo/` and `audio/narration/`; hashes in `app/public/vo/narration.json` and `app/public/audio/voice/manifest.json` (`narrationHash`). The build only plays clips whose hash matches the current text.
- Re-render changed lines: edit `app/narration-request.txt` on `natural-voice` → `.github/workflows/narration.yml` (20 shards, ~1 h for everything; changed lines only otherwise).
- No browser/OS speech anywhere (test enforced). All narration remains `reviewed:false` pending listening + clinical review.
