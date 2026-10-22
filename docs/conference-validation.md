# Case conference delivery validation

Validation record for October 22, 2026 on the narrated case conference review branch. The conference-style editorial revision supersedes the original slide read-aloud scripts.

## Shipped review content

- 32 synthetic cases across 16 topics; 288 slides and measured audio chapters.
- 10 pediatric, 10 obstetric, 4 neonatal and 8 adult cases.
- All 32 cases have distinct screen outlines and speaker commentary, with a recorded reflection pause after the decision beat. The 32 continuous MP3 files total 132.7 minutes and include 32 current transcripts; they replace the original recordings.
- Four AI-generated care-setting illustrations, explicitly separate from fictional patient data and clinical reference imaging.
- Case introductions before FP-C lesson content and atlas explainers, with a visible inventory of missing coverage.

## Checks completed

| Check | Result |
|---|---|
| Full application unit/regression suite | 1,476 tests passed across 78 files in the final complete run |
| Revised conference content and player checks | 12 tests passed, including audio-only story preservation, separate editorial tracks, late metadata, native seek overrides and media-clock rounding |
| TypeScript | Passed for the editorial revision |
| Production build | Passed, 57 split chunks; existing full model assets included |
| Revised mobile slide sweep | All 32 cases and 288 slides checked at 390 × 844; no clipping, horizontal overflow or browser errors |
| Revised media | All 32 files fully decoded; current narration bindings, exact transcripts, 288 measured chapters and actual recorded reflection silence verified |
| Desktop, 1440 × 1000 | Playback, seeking, mode continuity, filters, coverage and navigation passed |
| Phone, 390 × 844 | Same playback checks passed; all 288 slides also passed the complete navigation sweep |
| Small phone, 360 × 800 | Same playback checks passed; no horizontal overflow or browser errors |
| Direct case link and return to lesson | Passed; lesson case introduction remains available |
| Repository narration workflow | Revision run 39731420819 succeeded; media committed at `33cdc4e` |

The revised production build passed Chromium playback at all three viewports. A complete mobile sweep covered all 32 cases and 288 slides without clipping or browser errors. The player queues manual navigation while metadata loads and tolerates sub-millisecond media-clock rounding, so native seek events cannot silently step back to the preceding chapter. Native-control seeks can supersede a slide seek.

GitHub's application validation job passes on revision commit `4593895`. Browser jobs for Chromium, Firefox and WebKit failed at their Playwright browser-install step; local Chromium is available for the production checks recorded here.

The browser tests use Chromium and local production assets. They verify actual media playback, seeking and preservation of the audio element across visual/listening modes. They do not establish screen-lock, Bluetooth or car-audio behavior on physical iOS/Android devices.

## Remaining release work

Clinical sign-off and complete human listening review are pending for every case. The initial drafts link to 30/84 atlas conditions and 26/122 FP-C lessons; this is not complete FP-C, CCP-C or CCRN coverage. Finish the item-level exam crosswalk and the additional disease/presentation variants listed in the coverage tracker.

The change remains a draft pull request and has not been deployed to the live site. Optional Superdesign account sign-in was rejected by automatic approval review because it would establish third-party account access; the interface was implemented directly in the repository.
