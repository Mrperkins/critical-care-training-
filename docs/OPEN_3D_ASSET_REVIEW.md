# Open 3D bedside asset review — 2026-10-08

The user's requirement is high-fidelity openly licensed 3D anatomy and equipment. No new 2D anatomy/equipment substitutes or primitive replacement models are authorized. The ventilator now uses an openly licensed detailed asset. Existing monitor, bed and patient-circuit prototypes remain while replacements are evaluated; the full equipment-fidelity upgrade is incomplete.

## Integrated

HRA Visible Human Male airway, source `VH_Male/v1.2/VH_M_Lung.glb`, repository revision `f1a3a63f110e27ff0736047d52d04dba5d3087f9`, CC BY 4.0. Trachea, branching bronchi and cartilage retain source geometry (137,528 source vertices before codec transforms); no decimation or procedural branching. The derived GLB is approximately 1.68 MB, with meshopt compression and coordinate quantization. Exact changes and attribution are recorded in `app/public/models/bedside-airway.provenance.json`.

Rebuild with `app/pipeline/build-bedside-airway.ts`, supplying the source lung v1.2 and skin v1.1 GLBs from the pinned repository revision. Skin establishes the same body-centred coordinate frame as the existing body pipeline. Adult airway inspection makes the lungs translucent. It is reference anatomy, not animated bronchospasm. The airway is not shown as pediatric anatomy.

The existing patient was too large for the mattress and partly intersected it. Placement and camera targets now use the body-centred source frame and fit the licensed mesh to the bed. This changes placement, not source anatomical proportions.

## Licensed ventilator integration

“Medical Ventilator” by lazarys, [source](https://skfb.ly/oSHxK), CC BY 4.0. The user supplied `Medical_Ventilator.usdz` and its attribution after Google sign-in in the cloud browser returned 502 Connection refused. The public listing independently showed CC Attribution. The derived self-contained `medical-ventilator.glb` retains all 66,944 triangles, 51,012 split vertices, source normals, UVs and twelve embedded texture maps (three PBR materials). Texture images retain the original 1024px resolution. Metallic/roughness maps are packed losslessly for glTF. No decimation or generated equipment geometry is used.

Rebuild with `python app/pipeline/convert-ventilator.py Medical_Ventilator.usdz` (usd-core 26.8, NumPy, Pillow). Source SHA-256 and conversion changes are in `medical-ventilator.provenance.json`. The app rotates/scales the equipment to the bedside coordinate frame and overlays the live training display in the authored bezel. Source display graphics are covered by live values. Authored hanging hoses remain static and are disclosed; the existing interactive patient circuit and fault logic remain. The authored markings are not a device specification. If the GLB fails, the app reports the missing asset rather than silently substituting the old housing.

Offline 3D rendering verified front, rear and oblique views, source texture placement and bezel geometry. Browser visual/responsive regression checks are pending for this integration; the prior QA results below do not validate it.

## Candidates requiring acquisition and visual review

| Asset | Source | Publisher license | Status |
| --- | --- | --- | --- |
| Medical ventilator | [lazarys](https://sketchfab.com/3d-models/medical-ventilator-a03a99fab9314aab96fd41ec69acf1a3) | CC Attribution | User-supplied USDZ converted and integrated; see above. |
| Patient monitor | [Ram-je](https://sketchfab.com/3d-models/patient-monitor-80db1fb4584d4feea54936ea640d00db) | CC Attribution | Listed as downloadable, 156.5k triangles; downloadable file and fidelity not verified. |
| Hospital bed | [Ansh_Singla](https://sketchfab.com/3d-models/hospital-bed-0e974ea6eb9a4c069c56f152ae5162a4) | CC Attribution | Listed as downloadable, 28.3k triangles, described as low poly; must visually verify fidelity before use. |

The listings were discovered through web research. The ventilator is bundled; monitor and bed files have not been acquired. Browser downloads may require a user account and a browser handoff; a listing or triangle count alone does not establish fidelity.

## Pediatric gap

[THALIA](https://itis.swiss/virtual-population/virtual-population/hosted-models/thalia) is a detailed MRI-derived 10-month infant model, but the [2026-09-22 license](https://itis.swiss/assets/Downloads/VirtualPopulation/License_Agreements/20260922TermsandConditionsofUserLicenseTHALIA.pdf), section 2.3.2, forbids distribution or redistribution of the model or derivatives. It cannot be included in this public client-side app under those terms. The user was alerted in chat. No replacement pediatric asset was integrated. The existing scaled adult-derived view remains explicitly disclosed, and pediatric fidelity remains a merge blocker.

## QA scope

Chromium, Firefox and WebKit CI at desktop/tablet/phone widths is browser coverage, not physical-device validation. CI frame scheduling samples use software/virtual graphics and cannot establish Galaxy Tab or iPhone rendering performance. Exact run results and remaining failures belong in the PR review record.

## Physical-device acceptance pass (not yet performed)

Use a build of this PR on a real iPhone and Galaxy Tab S9+ before claiming device readiness. Record device, OS, browser, orientation, load time and observed stalls. Open the adult ARDS scenario; orbit and pinch the bedside for at least one minute, inspect the airway, return to the whole bedside, operate a circuit disconnect/reconnect, confirm a ventilator setting, then record a reassessment. Repeat after portrait/landscape rotation and background/resume. Verify readable equipment displays, responsive gestures and controls, continued physiology after returning to the foreground, and absence of a lost WebGL context. CI width coverage alone does not perform this pass.

## Completed validation for application commit 03ad879d6343acfd535b00b7834cd5bb3348055a

[Clinical app validation run 37812297310](https://github.com/Mrperkins/critical-care-training-/actions/runs/37812297310) passed: 755 tests in 57 files, typecheck, audio audit, production build and asset validation. Chromium, Firefox and WebKit each passed the 1440, 1024, 390 and 320 px interaction checks, with no detected page runtime errors or horizontal page overflow. Desktop and phone airway/bedside/control screenshots across the browser engines were visually reviewed; the patient fits the mattress and the airway inspection is unobstructed. The 7-day browser artifacts contain screenshots and per-viewport results.

Frame scheduling on virtual/software graphics ranged from 0 to about 11 callbacks/sec, including one Chromium sample that expired without a callback. These measurements do not meet a smoothness acceptance criterion and do not establish physical-device performance; functionality passing is not a performance sign-off. The pediatric and equipment asset gaps above and the real-device acceptance pass remain open. Do not recommend merging on the basis of these tests alone.
