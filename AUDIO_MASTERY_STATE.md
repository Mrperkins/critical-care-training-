# Audio Mastery Execution State

Updated: 2026-10-04 — post-main merge

## Branch
- Audio Mastery was merged into `main` on 2026-10-04.
- `main` is the canonical production/source branch.
- Active mockup-driven UI redesign is on `ux-overhaul-v2`.
- GitHub Pages now receives generated Audio artifacts through the main-branch site-sync workflow.

## Mission
Voice-first critical-care expertise training plus guided procedural Mental Reps.
- Expertise expansion lives primarily in audio.
- Visualization is reserved for anatomy, imaging, devices, procedures, waveforms and physiology where spatial rehearsal adds value.
- No browser TTS. Durable natural voice or clinician-recorded audio only.
- Content is deterministic and versioned; no live generative medical lecture at playback.

## Verified curriculum state
- 130 mastery concepts.
- 130/130 concepts have expert teaching notes: mechanism, bedside interpretation, traps and integration principle.
- 130/130 concepts have at least one standalone expertise-audio teaching path.
- 79 expertise audio episodes total.
- 21 ordered domain tracks.
- 26 required Mental Reps.
- 201 Mental Rep narration beats on the active protocol-grade branch. The protocol-grade re-audit added four missing beats to existing reps plus new burn-escharotomy, simple/finger-thoracostomy, emergency surgical-cricothyrotomy, ultrasound-guided pericardiocentesis, ultrasound-guided thoracentesis and emergency transvenous-pacing reps.
- The previously merged 132-beat set has durable natural-voice assets. Protocol-grade revisions have changed many transcripts and added three beats, so matching voice materialization is intentionally pending; stale/missing audio remains blocked by the transcript-hash production gate.
- 130/130 concepts have spaced-retrieval coverage: bespoke questions where available plus deterministic mechanism-vs-trap prompts.
- Unseen concepts are not marked overdue; spaced review starts after exposure.

## Long-form production state
- All 79 episode scripts are materialized and versioned.
- No script currently violates the format-specific depth thresholds.
- Current production render plan: 79 episodes split into 404 provider-safe parts.
- Current long-form source volume: ~1.57 million characters.
- Player supports seamless multi-part episode narration and resume state.
- Full long-form natural-voice rendering is NOT complete.

### External blocker / spend decision
The connected no-cost preview path works for short Mental Rep beats but does not expose raw downloadable full-episode MP3s.
Runway can render durable full audio, but at the current plan the complete long-form library would require roughly 31k credits at the provider's stated character pricing. Do not silently spend those credits. The render plan exists so a chosen provider can be swapped in without changing curriculum/player architecture.

## Mental Reps currently required
- Push-dose pressor
- Blood transfusion
- Arterial line
- eFAST
- Chest tube
- Central line
- Ultrasound-guided peripheral IV
- IO
- Ventilator emergency
- EVD
- Massive transfusion
- RSI preparation
- First five minutes post-intubation
- PA catheter waveform progression
- CRRT circuit
- ECMO circuit
- IABP timing
- Sedation / analgesia
- Status epilepticus
- Integrated POCUS shock survey

## UI / learning system
- Home recommendations.
- Expert Tracks with expandable full session lists.
- Listen search + domain + format filters.
- Mastery graph and concept-specific learning paths.
- Spaced retrieval with confidence calibration.
- Hands-free audio commands where browser support exists.
- Procedural Guided mode auto-advances narrated beats and pauses at retrieval prompts.
- Durable voice assets auto-discovered from the build manifest.
- Long-form player auto-discovers single-file or multi-part durable episode audio.

## Build / governance gates
CI must enforce:
- unique concept / episode / Mental Rep IDs;
- resolvable prerequisite + related graph;
- expert teaching notes for every concept;
- standalone expertise-audio coverage for every concept;
- spaced-review coverage for every concept;
- required Mental Rep set present;
- durable voice for every Mental Rep beat;
- minimum script depth by format;
- every episode assigned to an Expert Track;
- no episode marked published without reviewed durable production audio;
- standalone audio build succeeds.

## Production truth
- Mental Rep audio is durable but remains `review pending` unless explicitly marked reviewed.
- Long-form scripts are production-ready but full natural-voice renders are pending provider/spend selection.
- Do not display unrendered episodes as though production audio exists.


## Mental Rep authoring standard — hands-first + landmark-first

Updated 2026-10-04 after bedside-style review of the push-dose epinephrine rep.

Mental Reps are not mini lectures. They should sound like a calm expert walking the learner's hands, eyes and attention through the procedure in real time.

### Hands-first
When a procedure uses equipment or medication, narration should explicitly rehearse:
- what item the learner picks up;
- what label/source concentration they read;
- what volume or component is removed, retained, added or connected when the example is protocol-defined;
- the arithmetic/conversion out loud;
- the final concentration/device state;
- labeling/verification before administration;
- where attention returns on the patient/monitor;
- what finding means stop rather than continuing the memorized sequence.

### Landmark-first
If a procedure depends on anatomy, image orientation or a reference point, orientation is a procedural step:
- position/orient the patient first;
- palpate, scan or visualize the anchor structure;
- name neighboring structures;
- identify important structures to avoid;
- confirm the target using anatomy, compressibility, pulsatility, contour, vessel course, a second plane/view or another appropriate cue;
- stop and re-orient if the target cannot be confidently identified;
- re-establish the reference after any position change that can invalidate it.

Current landmark-expanded reps:
- chest tube / pleural drain;
- ultrasound-guided IJ central line;
- radial arterial line;
- intraosseous access;
- eFAST;
- EVD movement/re-leveling;
- ultrasound-guided peripheral IV.

The completion audit now treats a durable Mental Rep MP3 as stale when its transcript hash does not match the current narration. Script changes therefore require a fresh natural-voice render/import before the branch can pass the audio completion gate.

### Protocol-grade expansion

The hands-first/landmark-first standard is now strengthened to **protocol-grade narration**.

Every invasive or anatomy-dependent Mental Rep must explicitly narrate:
- patient/body/probe starting position;
- first unmistakable anchor landmark;
- the physical route from anchor to target;
- adjacent structures;
- structures to avoid;
- the sensory, imaging, waveform or device feature that proves the target;
- the next literal hand/device action;
- explicit stop/re-orient criteria;
- a specific endpoint proving the step worked.

Banned as stand-alone abstractions: "identify the correct site," "find the landmark," "obtain access," "prepare the system," "use the standard approach," "confirm placement," or "reassess" without the operational steps that make those phrases real.

When a landmark term itself could be unfamiliar (for example "safe triangle," "pleural access," "phlebostatic axis," "tragus reference," "anterior axillary line," or an escharotomy release line), the narration must define the term spatially instead of assuming it is self-explanatory.


## Active protocol-grade re-audit

Branch: `mental-reps-emergency-systems-v5`

- All 26 required Mental Reps are now covered by the protocol-grade standard; the original 20 were re-audited and burn escharotomy, simple/finger thoracostomy, emergency surgical cricothyrotomy, ultrasound-guided pericardiocentesis, ultrasound-guided thoracentesis and emergency transvenous pacing were authored at protocol-grade depth from their first versions.
- Detailed audit: `MENTAL_REP_PROTOCOL_AUDIT.md`.
- Anatomy-heavy reps now define the landmark itself and the route to it rather than naming it.
- System/device reps now require a physical patient→hardware→monitor/circuit trace rather than generic "check/prepare/reassess" language.
- Four missing procedural beats were added: radial arterial puncture/threading, IJ sterile setup, IJ dilation, and IJ catheter completion.
- Voice rendering is no longer on the engineering critical path. Revised narration may remain voice-pending on the feature branch, but cannot be merged as production-complete while transcript hashes are stale.
