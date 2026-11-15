# Critical Care Physiology

Interactive trainers on one simulated patient, with 3D anatomy.

- Critical Care Physiology (ventilator, blood gas, labs, cells, arterial line & CVP): https://mrperkins.github.io/critical-care-training-/
- MI Locator (coronary territories and ECG localisation, formerly the Infarct Atlas) is a view of the Cardiac tab: Cardiac → MI Locator (`?module=heart&view=mi`; `view=coronary` and the old /infarct-atlas/ link still land there). The beating 3D heart and a live 12-lead ECG sit side by side on one clock; the heart is the same high-detail Visible Human heart as Heart & flow, with the coronary territory data transferred onto it at load (`app/src/infarct/asset/sharedHeart.ts`, checked by `tests/mi-shared-heart.test.ts`). Source: `app/src/infarct/`, asset pipeline `app/pipeline/build-coronary.ts`, browser QA `app/scripts/qa-mi-locator.mjs`.
