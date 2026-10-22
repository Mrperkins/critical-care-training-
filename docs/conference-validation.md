# Case conference delivery validation

Validation record for October 22, 2026 on the narrated case conference review branch. The conference-style editorial revision supersedes the original slide read-aloud scripts.

## Shipped review content

- 32 synthetic cases across 16 topics; 288 slides and measured audio chapters.
- 10 pediatric, 10 obstetric, 4 neonatal and 8 adult cases.
- All 32 cases now have distinct screen outlines and speaker commentary, with a recorded reflection pause after the decision beat. Revised audio is being regenerated; the original 99-minute recordings are not valid for the revised scripts.
- Four AI-generated care-setting illustrations, explicitly separate from fictional patient data and clinical reference imaging.
- Case introductions before FP-C lesson content and atlas explainers, with a visible inventory of missing coverage.

## Checks completed

| Check | Result |
|---|---|
| Full application unit/regression suite | 1,474 checks pass: 1,473 in the complete run, followed by the asset-dependent offline check after restoring checkout media |
| Revised conference content and player checks | 10 tests passed, including audio-only story preservation and separate editorial tracks |
| TypeScript | Passed for the editorial revision |
| Production build | Passed, 57 split chunks; existing full model assets included |
| Revised mobile slide sweep | All 32 cases and 288 slides checked at 390 × 844; no clipping, horizontal overflow or browser errors |
| Revised media and synchronized playback | Pending the revised narration workflow and production browser pass |
| Repository narration workflow | Revision run 39731420819 in progress; original successful run 39726338153 is superseded |

The original recording passed desktop and two phone-width playback checks before the editorial revision. Those results do not establish that the new recording is complete. The revised build rejects the old audio binding until replacement media is assembled.

GitHub's application validation job passes on revision commit `4593895`. Browser jobs for Chromium, Firefox and WebKit failed at their Playwright browser-install step; local Chromium is available for the production checks recorded here.

The browser tests use Chromium and local production assets. They verify actual media playback, seeking and preservation of the audio element across visual/listening modes. They do not establish screen-lock, Bluetooth or car-audio behavior on physical iOS/Android devices.

## Remaining release work

Clinical sign-off and complete human listening review are pending for every case. The initial drafts link to 30/84 atlas conditions and 26/122 FP-C lessons; this is not complete FP-C, CCP-C or CCRN coverage. Finish the item-level exam crosswalk and the additional disease/presentation variants listed in the coverage tracker.

The change remains a draft pull request and has not been deployed to the live site. Optional Superdesign account sign-in was rejected by automatic approval review because it would establish third-party account access; the interface was implemented directly in the repository.
