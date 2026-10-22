# Narrated synthetic case conferences

The Case conference module introduces a fictional patient before disease teaching. Learners can watch synchronized slides or listen to a complete spoken case without answering on-screen questions. Each case includes a handoff, examination, observations, laboratory findings, diagnostic discussion, decision point, clinical reasoning, reassessment and a titled synopsis.

## Current scope

There are 32 draft conferences across 16 topics: 10 pediatric cases, 10 obstetric cases, 4 neonatal cases and 8 adult cases. Each topic has two clinically distinct presentation variants. Pediatric DKA, for example, compares a new diagnosis with suspected cerebral injury during treatment. Postpartum hemorrhage compares atony with persistent bleeding after the uterus becomes firm. Continuous audio and downloadable transcripts are bound to the current speaker script; after editorial changes, all files must be regenerated and audited before release.

The October 22 editorial revision separates concise slide evidence from a fuller conference-style speaker track for every case. Slides present the short history, examination clues, data and decision; the narrator supplies the story, diagnostic uncertainty and interpretation. Four seconds of recorded silence follow the decision chapter before the discussion continues automatically. See [conference-editorial-standard.md](conference-editorial-standard.md) for the format and reference.

Case entries appear before the course-length choice and before the FP-C lesson text, and before atlas explainers. Home, the clinical-domain menu and the resources menu open the case library. Topics without cases explicitly say they are in preparation. Learners can continue to the source disease or lesson after the synopsis. Deep links use `?module=cases&case=eclampsia-postpartum`.

This release does **not** complete all FP-C, CCP-C or CCRN disease coverage. Current links reach 30/84 atlas conditions and 26/122 FP-C lessons, with overlapping diseases and broad lessons counted only as links. All cases require clinical sign-off. The full inventory is in [conference-coverage.md](conference-coverage.md). “MCCPC” was provisionally interpreted as CCP-C; the exact intended third credential remains unconfirmed.

## Clinical and editorial contract

- Patient identity, story, measurements and course are synthetic. Sources support the clinical discussion, rather than proving a fictional outcome.
- Each topic needs an initial, atypical, deteriorating and treatment-response presentation where relevant; pediatric, neonatal and OB work receives additional depth. The editorial targets are at least 3 adult and 5 specialty variants, not exam-board requirements.
- Pediatric records state age and weight. Neonatal records include gestational/postnatal context. OB records state gestation or postpartum timing and include fetal findings when appropriate.
- Every clinical observation needed to follow the case is available in the speaker track, including all displayed data values. Audio does not depend on reading the screen. Screen wording and narration are separately authored; the lecturer expands the evidence rather than reading paragraphs off slides. Tests that are not indicated or not yet obtained are identified explicitly. Numeric medication dosing is deferred to the governing clinical protocol in this draft collection.
- Reference radiographs and clips retain the existing attribution and comparison-patient label. They are **not** presented as the fictional patient's images. Generated scenes depict a general setting; they are not diagnostic evidence or case portraits.
- Review must cover physiological consistency, competing diagnoses, age-specific interpretation, source currency, medication and airway details, transport constraints, and the plausibility of each reassessment.
- A linked case or exam tag never implies full disease coverage, exam endorsement, accreditation or CE credit. Flight operations, professional practice and nursing ethics require their own learning material as well.

## Audio and visual behavior

The existing Kokoro narrator renders every slide ahead of time. Assembly produces one continuous MP3 per case, with chapters timed from the actual media. There is no browser speech synthesis or per-slide media handoff. Switching visual/listening modes preserves the same audio element. Native controls, playback speed, resume position, downloads, transcript access and supported Media Session actions are available.

Audio is bound to the current spoken text, reflection timing and narrator configuration. A mismatch leaves slides and transcript available and refuses stale audio. Resume positions also use that binding, so a revised recording does not resume at an unrelated point in an older script. Loading and decoding failures display a retry control. Leaving the case pauses playback. Real iOS/Android screen-lock, car audio and Bluetooth behavior still needs device verification; desktop browser automation cannot establish those behaviors.

## Authoring and rebuilding

Author clinical records in `app/src/cases/{adult,pediatric,neonatal,obstetric}.ts` and the corresponding screen outlines and speaker commentary in `app/src/cases/conferenceScripts/`. Each of the nine beats has its own title, concise screen points and case-specific spoken commentary. The shared builder combines the original clinical narrative with that commentary only in the speaker track. Missing editorial records fail the build; there is no read-aloud fallback. `datum.spoken` supplies the full verbal equivalent of each data observation. `catalog.ts` links cases to existing disease and lesson IDs. Update the explicit blueprint crosswalk as content expands.

From `app`, generate a narration plan:

```sh
node --import tsx scripts/conference-assets.ts --plan /path/to/scratch-render
python scripts/narrate.py --model /path/to/kokoro.onnx --voices /path/to/voices.bin --jobs /path/to/scratch-render/jobs.json --out /path/to/scratch-render/render
node --import tsx scripts/conference-assets.ts --collect /path/to/scratch-render
npm run typecheck
npm test
npm run build
node scripts/qa-conferences.mjs
```

Use Kokoro-82M v1.0 ONNX and voices from the existing narration workflow. Dependencies are `kokoro-onnx`, `soundfile`, `numpy`, ffmpeg and ffprobe. Model weights are temporary production dependencies and are not committed. Run final collection only after all render processes have exited. Decode validation is required before publishing; a successful render process alone is insufficient.

The dedicated `conference-narration.yml` workflow renders and assembles the collection on the review branch, saving the resulting media directly into git. Run `node --import tsx scripts/conference-audit.ts` to verify complete decode, current text bindings, transcripts and chapter timing. See [conference-validation.md](conference-validation.md) for completed verification and remaining review.

The build copies `app/public/conferences/` into the publishable output. The existing post-merge source-sync workflow owns root Pages artifacts. New case assets are not published by this review branch until the change is merged and deployed.

## Validation and remaining review

The implementation adds content/link integrity tests and player interaction tests, including mode continuity, measured chapter seeking, transcript preservation on unavailable audio, stale-audio rejection and pause-on-unmount. Production browser QA covers 1440×1000, 390×844 and 360×800 layouts, filtering, library/coverage navigation, deep links and audio playback when assets are assembled.

Before release: obtain independent clinical review, listen to all narration for medical pronunciation and numerical accuracy, test screen-lock/Bluetooth on real mobile devices, and finish the item-level exam crosswalk. The present 32 cases are an initial authored library, not the complete multi-presentation curriculum requested.
