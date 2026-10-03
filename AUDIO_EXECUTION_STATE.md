# Critical Care Audio execution state

## BRANCH
`audio-mastery`

## BASE
`visual-overhaul`

## CURRENT GOAL
Build a standalone audio-first critical-care learning product that shares the physiology app's educational ecosystem without increasing the main app's UI density.

## HARD PRODUCT REQUIREMENTS
- Natural human-quality voice is mandatory.
- No browser/OS TTS production fallback.
- Core curriculum is clinically reviewed and deterministic; AI can personalize or explain but does not silently rewrite the canonical lesson.
- Expert-level knowledge/reasoning is the educational target; the product does not claim to replace supervised bedside or procedural experience.
- Mental Reps are guided procedural visualization / rehearsal with local-policy, credentialing and supervision boundaries.

## IMPLEMENTED
- Standalone `/audio/` build entry that does not load the Three.js anatomy bundle.
- Responsive audio product shell: Home, Listen, Mental Reps, Mastery.
- Six-level critical-care mastery framework.
- Initial mastery concept graph covering physiology, shock, ventilation, RV failure, oxygen delivery, acid-base, neuro, invasive monitoring, eFAST, transfusion, high-risk medication safety and expert uncertainty.
- Audio formats: Daily Dose, Critical Care Rounds, Deep Dive, Audio Case, ICU Literacy.
- Natural-voice prototype playback for the first RV/intubation round.
- Production voice contract: premium neural voice or clinician recording; reviewed + durable audio required before status=published.
- Mental Rep engine and first five modules:
  - push-dose pressor safety
  - blood initiation
  - arterial line
  - eFAST
  - chest tube / pleural drain
- Isolated audio learner progress store (episodes, Mental Reps, positions, concept exposure/accuracy/confidence).
- Mastery browser with concept score scaffolding.
- Audio-specific tests for IDs, prerequisites, concept links, voice publish gate and Mental Rep boundaries.
- Audio README with product/voice/procedural standards.
- Site build + copy scripts publish `audio/index.html`.

## NOT YET IMPLEMENTED
- Durable project-owned premium voice assets / ingestion pipeline.
- Full scripts for all planned audio episodes.
- Shared progress bridge with Critical Care Physiology.
- Confidence UI and retrieval-question scoring.
- Spaced repetition scheduler.
- Hands-free voice commands / follow-up tutor.
- Real procedural visual renderers synchronized to Mental Rep beats.
- Cross-links from mastery concepts into the existing 3D scenes, lessons, MOA, imaging and challenge cases.
- Broader mastery domains: infection/sepsis depth, CRRT, ECMO, PA catheter, sedation/analgesia, nutrition, delirium/mobility, ethics/prognostication/communication.
- Additional Mental Reps: central line, IO, MTP, ventilator setup/troubleshooting, EVD handling, ultrasound-guided PIV.
- Full browser visual QA of /audio/.
- Local typecheck/test/build verification is pending because this chat environment cannot clone the repo; use CI/Claude/Codex with repo filesystem before merge.

## NEXT SLICE
1. Run `cd app && npm test && npm run typecheck && npm run site`.
2. Fix any compile/build/test issue.
3. Open `/audio/` at desktop + phone widths and visually QA.
4. Replace prototype external voice preview with project-owned durable audio.
5. Build the first complete reviewed listening module and one complete synchronized Mental Rep visual.
