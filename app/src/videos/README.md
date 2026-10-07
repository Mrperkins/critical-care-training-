# Critical Care Videos

This module is the learner-facing library for curated external critical-care video.

## Product model

A video can be found by:
- clinical category and nested topic
- learning goal: Learn it / Set it up / Perform it / Manage it / Troubleshoot it / See cases
- format: YouTube Short or long form
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


## In-app playback

Individual videos play through the official privacy-enhanced YouTube embed inside the Critical Care Videos surface. The external YouTube link remains as a fallback only.

Priority channel collections currently include:
- CriticalCareNow
- Lecturio Medical
- Lecturio Nursing

Each collection uses the channel's YouTube uploads playlist so the learner can browse the broader channel library in-app even before every individual video has been classified into the critical-care taxonomy.

The indexed shelf remains separate from the raw channel collections. Channel crawling/classification is handled by `npm run video:discover`, which reviews up to `CHANNEL_VIDEO_LIMIT` uploads per priority channel and writes only candidates to the review queue.
