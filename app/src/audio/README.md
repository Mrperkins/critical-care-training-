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

### Mental Rep authoring standard: hands-first rehearsal

Mental Reps should feel like calm, literal guided rehearsal rather than a conceptual lecture. Narration should tell the learner what their hands and eyes are doing in sequence:
- name the exact item being picked up;
- read the exact label/source concentration before manipulating it;
- state the exact volume removed, retained or added when the local/protocol example is intentionally being taught;
- do the arithmetic out loud and state the final concentration;
- label the prepared medication before it leaves the learner's hand;
- convert ordered dose to volume only after the final concentration is established;
- move attention back to the patient/monitor immediately after administration or an irreversible procedural step;
- include a deliberate stop point when a stock concentration, device, anatomy, policy or patient response does not match the rehearsed scenario.

The learner should be able to close their eyes and mentally perform the sequence. Avoid replacing choreography with abstractions such as "prepare per protocol" when the purpose of the rep is to rehearse an explicitly defined, protocol-approved example.

### Landmark rule: orientation is part of the procedure

If a procedure depends on an anatomical landmark, image orientation or device reference point, the Mental Rep must actively rehearse finding it before moving on. The narration should:
- put the learner in the correct patient/body orientation first;
- tell them what structure to palpate, visualize or scan for;
- name the structures immediately adjacent to the target;
- identify the major structure(s) that must be avoided;
- explain what sensory or imaging feature confirms the target (for example contour, compressibility, pulsatility, relation to bone, vessel course or a known reference plane);
- include a stop/re-orient instruction when the landmark is not confidently identified;
- use more than one plane/view when one snapshot could be misleading;
- revisit the landmark after position changes when the reference can move.

Do not treat “find the landmark” as a single sentence. If landmark identification is a meaningful source of procedural error, it deserves its own beat or sub-sequence before equipment enters the patient.

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
