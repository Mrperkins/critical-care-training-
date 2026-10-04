# Critical Care Audio + Mental Reps

This is a separate, lightweight learner surface built from the same repository as Critical Care Physiology.

## Product goal

Build expert-level critical-care **literacy, physiology, interpretation and clinical reasoning** through audio, then reinforce it with the visual simulator, cases and guided procedural mental rehearsal.

The product does **not** claim that listening to an app creates bedside or procedural expertise. Those require supervised clinical practice, credentialing and real-patient experience.

## Core learning model

Six levels:
1. Language & normal physiology
2. Single-system critical illness
3. Organ support
4. Advanced physiology
5. Multisystem critical care
6. Expert integration

Content types:
- Daily Dose
- Critical Care Rounds
- Deep Dives
- Audio Cases
- ICU Literacy
- Mental Reps

Everything maps to `mastery.ts`. Completion is not mastery: concepts recur across formats and should ultimately be scored by retrieval, confidence calibration and performance in cases.

## Natural voice is a hard requirement

Production audio MUST NOT use browser `speechSynthesis`, operating-system TTS, or an obviously synthetic fallback.

Acceptable production tiers:
- **premium-human**: pre-rendered, natural neural speech that passes human listening QA.
- **recorded-clinician**: a human clinician recording.

A published asset must:
- have a clinically reviewed transcript;
- have a durable audio source stored/owned by the project rather than a temporary preview URL;
- pronounce medical terms, abbreviations and units correctly;
- use natural sentence-level cadence, pauses and emphasis;
- avoid monotonous "text reader" delivery;
- remain intelligible at common playback rates;
- keep narration and visible transcript semantically identical;
- be re-reviewed when the transcript changes.

The current `rounds-rv-intubation` asset is a **prototype natural-voice preview only**. Its `reviewed` flag is false and the tests prevent a lesson from being marked `published` without reviewed durable audio.

## Mental Reps

Mental Reps are guided procedural visualizations, not unsupervised procedural authorization. They use a consistent cognitive sequence:

arrival → orientation → equipment → sequence → decision points → complications → confirmation → debrief

Each module should train:
- indication and goal;
- anatomy / equipment orientation;
- sequencing;
- where attention belongs during the task;
- common failure modes;
- expected physiologic response;
- what would falsify the learner's model;
- post-procedure confirmation and reassessment.

Medication Mental Reps should emphasize standardized/local concentrations and verification. Do not encode one institution's high-risk medication concentration as universally correct.

## Architecture

- `types.ts`: shared contracts.
- `mastery.ts`: critical-care mastery graph.
- `catalog.ts`: audio episodes + Mental Reps.
- `progress.ts`: isolated local progress store.
- `AudioApp.tsx`: standalone interface.
- `audio.css`: standalone responsive design.
- `main.tsx`: separate bundle entry.

`scripts/build-app.ts` builds it to `dist/pub/audio/index.html`; `copy-site.mjs` publishes it to repo-root `audio/` without loading the Three.js physiology bundle.

## Next engineering slices

- durable premium-voice render/ingestion pipeline with pronunciation dictionary and transcript hashes;
- shared progress bridge between Critical Care Physiology and Critical Care Audio;
- confidence-calibrated retrieval questions;
- spaced repetition scheduler;
- voice-driven commands / follow-up tutor;
- visual cue renderers for each Mental Rep;
- cross-links from mastery concepts to existing visual scenes, Director lessons, drugs and challenge cases;
- additional procedure modules: central line, IO, MTP, ventilator setup/troubleshooting, EVD handling, ultrasound-guided PIV;
- broader mastery graph: sepsis/infection, CRRT, ECMO, PA catheter, sedation/analgesia, nutrition, delirium/mobility, ethics, prognostication and communication.
