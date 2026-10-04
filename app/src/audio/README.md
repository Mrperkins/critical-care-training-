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

### Protocol-grade rule: never hide a step inside a noun phrase

A Mental Rep is **not complete** merely because it is hands-first. It must be specific enough to read like the procedural section of a clinical protocol while still preserving device-, scope- and institution-specific boundaries.

Do not write:
- "identify the correct site";
- "find the landmark";
- "obtain pleural access";
- "prepare the system";
- "place the line in the usual location";
- "use the standard approach";
- "confirm placement";
- "reassess the patient";

unless the same beat explicitly explains **how** the learner does that thing.

For every invasive or anatomy-dependent procedure, narration should answer, in order:

1. **Where do my hands start?** Patient position, body surface exposed, probe or equipment in hand.
2. **What is the first unmistakable anchor?** A named bone, tendon, vessel, rib, chamber, device component, waveform, or other reference.
3. **How do I walk from that anchor to the target?** Count ribs/interspaces, slide the probe, sweep proximally/distally, follow a vessel, trace tubing, or move from one device component to the next.
4. **What should be beside the target?** Name neighboring anatomy or hardware so the learner can build a spatial map.
5. **What must I avoid?** Name the major nerve, artery, organ, joint, growth plate, pleural/abdominal boundary, or unsafe device state.
6. **What proves I am at the target?** Palpable contour, ultrasound behavior, waveform transition, return of air/fluid, loss of resistance, direct visualization, measured reference, or other appropriate confirmation.
7. **What exactly happens next?** The next hand movement, connection, incision, needle movement, clamp/stopcock change, device setting, medication action, or reassessment.
8. **What makes me stop?** Lost landmark, unexpected resistance, anatomy that does not match, wrong waveform, disagreement between confirmation methods, new instability, or a device/protocol mismatch.
9. **What proves the procedure worked?** A specific patient, waveform, imaging, drainage, device, perfusion or physiologic endpoint—not a generic "reassess."

If the learner could reasonably ask, "What do you mean by that landmark/site/access?" the script is still too vague.

Examples:
- **Tube thoracostomy:** do not say "identify the pleural access site." Teach how to find and count the ribs/interspaces, cross-check the lateral chest boundaries, identify the rib immediately below the intended interspace, state where the intercostal neurovascular bundle lies, and describe the physical confirmation of pleural entry before advancing the tube.
- **Escharotomy:** do not say "use the standard escharotomy lines." State the surface line being followed, how far proximally/distally the release extends, the tissue depth that defines escharotomy rather than fasciotomy, the named neurovascular structures that change the safe line at the elbow/wrist/fibular head/ankle/neck, and the perfusion or ventilation response that confirms an adequate release.
- **Ultrasound access:** do not say "identify the vessel." State probe position/orientation, the surrounding anatomy, compressibility/pulsatility/course used to distinguish structures, how the true needle tip is reacquired after every movement, and the condition that makes the needle hand stop.

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
