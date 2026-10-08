# UI completion review — release blocked

This is an evidence and handoff report, **not final visual sign-off**. Canonical main was fetched at `1e5aee3`; all repairs are on `feat/clinical-completion-20261008`.

## Reference and observed baseline
The Library image `ASTRA Medical Learning Redesign Board.png` was located and visually inspected. Iteration 1, Simplify & Focus, governs this work.

Live Home and the video/Skills feed were used at the cloud browser's default 1363 × 930 viewport. Saved evidence:
- [Home before](docs/qa/completion-20261008/home-desktop-before.jpg): Audio overlaps the domain rail and workspace heading. A fourth header item wraps inside a three-column grid while the app reserves only 66px for the header.
- [Skills before](docs/qa/completion-20261008/skills-desktop-before.jpg): Skills and the Infusion pumps & tubing filter were clicked; the resulting nine-item shelf includes official sources and YouTube media. The header collision persists.

Entering Respiratory on the live baseline blanked the React root. Browser logs explicitly report `GL_VENDOR = Disabled`, `GL_RENDERER = Disabled` and `Error creating WebGL context`. This confirms a failure-containment bug; it does not establish how anatomy looks in a graphics-capable browser.

## Implemented repairs
- Learn, Explore and Practice now enter Respiratory from Home/Resources; within a clinical domain, they preserve the domain. Selecting Practice again preserves an active simulator.
- The only primary header modes are Learn / Explore / Practice. Videos, Skills, Audio, progress and bookmarks live in one Resources disclosure.
- The header uses an automatic row height; resources cannot spill into a fixed 66px row.
- At ≤1024px, a native modal domain drawer replaces the permanent domain strip. Native dialog behavior provides Escape/focus confinement; closing returns focus to its trigger.
- Touch layouts offer Scene and context tabs. Learn defaults to visible lessons; Explore defaults to the scene. Only one scene/context task occupies the viewport at a time; switching tabs retains mounted clinical state.
- Home exposes one emphasized Continue card, two secondary clinical actions, resource links, progress, bookmarks and a collapsed curriculum browser.
- Lesson transport adds a visible progress bar, step count and text-labeled Previous / Next.
- Core touch controls receive ≥44px minimum height, range and step controls are enlarged, and safe-area bottom padding is included.
- StudioCanvas probes graphics capability and contains renderer exceptions. A graphics failure leaves navigation, teaching context and controls usable. Mobile DPR is capped at 1.25; hidden documents and offscreen scenes stop drawing.
- Existing video catalog/feed/provider behavior and clinical engines were not edited.

## Verification completed
- `npm test`: 439 tests, 51 files passed.
- `npm run typecheck`: passed.
- `npm run audio:audit`: complete; all eight audit gate lists empty (130 concepts, 79 episodes, 20 Mental Reps).
- `npm run site`: passed, publishable bundle generated; JS 2.44MB (uncompressed). Assets/narration remain separately loaded in the publishable build.
- `python3 tools/validate_visual_assets.py`: passed, including molecular assets, syntax and 47 real media items (4 pending).
- New DOM interaction tests cover Learn at 320/360/390/430/768px media-query states, Scene/context switching, mode navigation, drawer selection/focus return, and resource navigation.
- Scene-error tests show sibling navigation and teaching content survive a thrown graphics error.

DOM tests do not measure layout, scrolling, touch hitboxes, contrast or actual WebGL output. Native browser dialog Escape/Tab behavior has not been exercised on the repaired build.

## Responsive visual matrix
| Viewport | Visual result |
| --- | --- |
| 1440 × 900 | Not run |
| 1920 × 1080 | Not run |
| 1280 × 800 | Not run |
| 1024 × 768 | Not run |
| 768 × 1024 touch tablet | Not run; 768px navigation state tested in DOM |
| 430 × 932 | Not run; navigation state tested in DOM |
| 390 × 844 | Not run; navigation state tested in DOM |
| 360 × 800 | Not run; navigation state tested in DOM |
| 320px wide | Not run; navigation state tested in DOM |
| 1363 × 930 | Live baseline Home/Skills only |

No AFTER screenshots, disease screenshots, vent screenshots, production-build visual sign-off, or mobile Learn visual sign-off are claimed.

## External QA blockers
The cloud browser cannot reach the local development server (`127.0.0.1:8765` returns connection refused; browser and shell are separate runtimes). Local file navigation is explicitly prohibited by browser policy; no workaround was attempted. Its supported API advertises no viewport/emulation control and its WebGL is disabled. A permitted browser-accessible development preview with the required viewport/WebGL capabilities is needed for the next visual QA gate.

## Completion status
The wider completion assignment remains open. A reusable disease visualization registry, broad adult disease expansion, first-class pediatric/Women's/OB domains, PCOS/endometriosis, whole-patient camera transitions and an equipment-style ventilator simulator have **not** been implemented in this repair slice. Existing population lessons and vent mechanics are preserved but do not satisfy that full scope. Keep the PR draft and do not merge or deploy these changes as completed work.
