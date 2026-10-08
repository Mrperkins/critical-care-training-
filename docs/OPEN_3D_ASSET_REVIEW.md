# Open 3D bedside asset review — 2026-10-08

The user's requirement is high-fidelity openly licensed 3D anatomy and equipment. No new 2D anatomy/equipment substitutes or primitive replacement models are authorized. Existing equipment prototypes remain visible while replacements are evaluated; this is not a completed equipment-fidelity upgrade.

## Integrated

HRA Visible Human Male airway, source `VH_Male/v1.2/VH_M_Lung.glb`, repository revision `f1a3a63f110e27ff0736047d52d04dba5d3087f9`, CC BY 4.0. Trachea, branching bronchi and cartilage retain source geometry (137,528 source vertices before codec transforms); no decimation or procedural branching. The derived GLB is approximately 1.68 MB, with meshopt compression and coordinate quantization. Exact changes and attribution are recorded in `app/public/models/bedside-airway.provenance.json`.

Rebuild with `app/pipeline/build-bedside-airway.ts`, supplying the source lung v1.2 and skin v1.1 GLBs from the pinned repository revision. Skin establishes the same body-centred coordinate frame as the existing body pipeline. Adult airway inspection makes the lungs translucent. It is reference anatomy, not animated bronchospasm. The airway is not shown as pediatric anatomy.

The existing patient was too large for the mattress and partly intersected it. Placement and camera targets now use the body-centred source frame and fit the licensed mesh to the bed. This changes placement, not source anatomical proportions.

## Candidates requiring acquisition and visual review

| Asset | Source | Publisher license | Status |
| --- | --- | --- | --- |
| Medical ventilator | [lazarys](https://sketchfab.com/3d-models/medical-ventilator-a03a99fab9314aab96fd41ec69acf1a3) | CC Attribution | Listed as downloadable, 66.9k triangles; downloadable file and fidelity not verified. |
| Patient monitor | [Ram-je](https://sketchfab.com/3d-models/patient-monitor-80db1fb4584d4feea54936ea640d00db) | CC Attribution | Listed as downloadable, 156.5k triangles; downloadable file and fidelity not verified. |
| Hospital bed | [Ansh_Singla](https://sketchfab.com/3d-models/hospital-bed-0e974ea6eb9a4c069c56f152ae5162a4) | CC Attribution | Listed as downloadable, 28.3k triangles, described as low poly; must visually verify fidelity before use. |

The listings were discovered through web research. No files from these listings are bundled. Browser downloads may require a user account and a browser handoff; a listing or triangle count alone does not establish fidelity.

## Pediatric gap

[THALIA](https://itis.swiss/virtual-population/virtual-population/hosted-models/thalia) is a detailed MRI-derived 10-month infant model, but the [2026-09-22 license](https://itis.swiss/assets/Downloads/VirtualPopulation/License_Agreements/20260922TermsandConditionsofUserLicenseTHALIA.pdf), section 2.3.2, forbids distribution or redistribution of the model or derivatives. It cannot be included in this public client-side app under those terms. The user was alerted in chat. No replacement pediatric asset was integrated. The existing scaled adult-derived view remains explicitly disclosed, and pediatric fidelity remains a merge blocker.

## QA scope

Chromium, Firefox and WebKit CI at desktop/tablet/phone widths is browser coverage, not physical-device validation. CI frame scheduling samples use software/virtual graphics and cannot establish Galaxy Tab or iPhone rendering performance. Exact run results and remaining failures belong in the PR review record.
