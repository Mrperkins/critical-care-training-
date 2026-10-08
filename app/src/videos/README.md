# Critical Care Videos

This module is the learner-facing library for curated external critical-care video.

## Product model

A video can be found by:
- clinical category and nested topic
- learning goal: Learn it / Set it up / Perform it / Manage it / Troubleshoot it / See cases
- format: Short or long form
- provider: YouTube, direct HTML5 media, embeddable external media, or official external manufacturer training
- learner level
- search terms
- sort order

A Short can optionally point to a reviewed long-form companion through `pairedLongFormId`.

## Review boundary

Discovery and publication are deliberately separate.

`npm run video:discover` uses the official YouTube Data API and writes a candidate queue to:

`review/youtube-video-candidates.json`

It does **not** add anything to `VIDEO_LIBRARY` and therefore cannot make a newly discovered medical video visible to learners.

Before a candidate is listed, review:
1. clinical accuracy and currentness;
2. whether the creator/source is appropriate for the claimed use;
3. device model and manufacturer-IFU alignment for equipment setup;
4. local-protocol-sensitive claims;
5. whether it is truly a YouTube Short (the public Data API exposes duration and metadata but not a definitive `isShort` flag/aspect ratio);
6. whether a proposed Short → long-form pair actually teaches the same concept.

## API key

Set `YOUTUBE_API_KEY` only in the server/CLI environment. Do not add it to source, the client bundle, GitHub Pages, or public JSON.

Example:

```bash
cd app
YOUTUBE_API_KEY=... npm run video:discover
```

The discovery query set lives in `scripts/youtube-discovery.ts`. Keep it aligned with the taxonomy in `src/videos/catalog.ts`.


## In-app playback and providers

The library is provider-aware. `ClinicalVideo.provider` supports:
- `youtube`: privacy-enhanced YouTube embed with muted autoplay/feed handoff;
- `html5`: direct publisher-authorized media URL played through an HTML5 `<video>` element;
- `embed`: publisher-provided iframe embed URL;
- `external`: official manufacturer training/media page when the publisher does not expose a reliable public embed.

Do not scrape or reverse-engineer protected media URLs. If a manufacturer only exposes training through its own page, list that official page as an `external` resource and let the learner open it. The feed must never pretend an external resource is autoplay-capable.

Manufacturer entries should set `sourceClass: 'manufacturer'`, `sourceUrl`, and a short `sourceLabel`. Direct or embeddable publisher media can additionally set `mediaUrl` or `embedUrl`.

YouTube remains the primary autoplay provider today, but the feed and Browse surfaces no longer assume every indexed resource is YouTube.

Priority channel collections currently include:
- CriticalCareNow
- Lecturio Medical
- Lecturio Nursing

Each collection uses the channel's YouTube uploads playlist so the learner can browse the broader channel library in-app even before every individual video has been classified into the critical-care taxonomy.

The indexed shelf remains separate from the raw channel collections. Channel crawling/classification is handled by `npm run video:discover`, which reviews up to `CHANNEL_VIDEO_LIMIT` uploads per priority channel and writes only candidates to the review queue.


## Manufacturer sources

Official manufacturer-hosted resources are curated separately from the YouTube discovery queue. Current examples include B. Braun Infusomat/Perfusor Space product media, Spaceplus handling media, and B. Braun USA technical training.

For manufacturer sources:
1. prefer the manufacturer's current official domain;
2. preserve the exact device/model identity in tags;
3. do not mirror or download proprietary videos unless the publisher explicitly permits it;
4. use `external` when no stable embed is provided;
5. use `html5` or `embed` only when the publisher exposes a public, authorized media/embed URL;
6. keep manufacturer IFU/documentation review as the final authority for setup and operation.


## Priority manufacturer libraries

The current manufacturer catalog prioritizes critical-care transport and high-acuity bedside devices:
- B. Braun — Infusomat / Perfusor Space
- Eitan Medical — Sapphire infusion pumps
- Fisher & Paykel Healthcare — AIRVO 2 / Optiflow
- Hamilton Medical — HAMILTON-T1 transport ventilation
- ZOLL — Z Vent and LTV respiratory care
- Stryker — LIFEPAK 15 monitor/defibrillator
- Getinge — Cardiosave IABP and Cardiohelp ECMO
- Medtronic — VitalFlow ECMO

Autoplay-oriented feed modes must contain only `canAutoplayInFeed(video) === true` items. External manufacturer resources belong in Skills and Browse so official training can grow without inserting non-playable cards into the normal For You / Shorts / Deep Dives playback flow.
