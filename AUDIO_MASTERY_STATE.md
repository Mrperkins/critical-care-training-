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
- 20 required Mental Reps.
- 132 Mental Rep narration beats.
- 132/132 Mental Rep beats have durable natural-voice MP3 assets in the project.
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
