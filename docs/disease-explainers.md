# Disease mechanisms and learning navigation

Seven condition-atlas lessons now use disease-specific chapters instead of a shared severity ramp: pulmonary embolism (6), cardiogenic pulmonary edema (6), ARDS (8), septic shock (6), tamponade (6), anaphylaxis (6), and auto-PEEP (7). Each has a prediction checkpoint and linked clinical references. The 45 chapters have current offline Kokoro voice clips.

The Lesson Director owns all chapter transitions. Independent visual channels are reconstructed on seek; changes animate during the opening 40% of each chapter. For example, ARDS recruitment reduces collapse and shunt while leaving edema and inflammation present. Pulmonary embolism progresses from obstruction to perfusion loss and RV strain. Tamponade illustrates filling restriction rather than intrinsic pump weakness.

Existing HuBMAP anatomy and measured vessel paths are reused. Added chamber scaling, pulmonary flow and systemic flow are exaggerated qualitative illustrations, not measured volumes, hemodynamic predictions, CFD or procedural simulation. Reduced-motion preferences suppress moving flow. The existing plain heart stays visible if the detailed chamber asset fails to load. Adult-reference and model provenance disclosures remain available.

Learning screens provide a searchable disease entry, grouped organ explainers, procedures and fundamentals. Common abbreviations are supported. Home recommends ventilation foundations before dependent lessons. Mobile Scene has chapter captions, transport and prediction controls. Cardiac ECG spans the width below the heart, and advanced conduction settings are disclosed separately. The MI renderer now shares the existing WebGL capability guard and error boundary, keeping navigation and readings available on graphics failure.

Existing ARDS narration was revised to avoid a universal PEEP target or guaranteed imaging clearance. DKA narration now uses ketone and acid-base reassessment rather than gap closure alone. Sources include the ATS ARDS guideline update (2024), AHA/ACC PE guideline (2026), SCCM adult sepsis guideline (2026), RCUK anaphylaxis guidance, ESC tamponade review and ADA/EASD hyperglycemic-crisis consensus (2024): https://doi.org/10.2337/dci24-0032. The generated clinical review packet includes chapter and checkpoint claims and source links.

## Verification

919 tests pass across 73 files. Typecheck, audio completion audit and the full site build pass. All 52 new or revised voice clips decode with positive duration. The seven revised clips cover existing ARDS and DKA wording.

Automated coverage includes forward playback versus direct seek, independent injury and support channels, chamber responses, prerequisite-aware recommendations, abbreviation discovery, prediction pause/reveal, disease switching, bookmarked frames and unavailable-WebGL interaction. Existing phone navigation tests use the current chapter launch wording. The cardiac browser QA script expects the disclosed study settings and full-width ECG band.

Rendered GPU and responsive visual review remain pending: the available cloud browser blocked the local preview. Component tests do not verify pixels, 3D appearance, clipping or performance on physical devices. Generated narration has not received human listening or clinical sign-off. This work should remain a draft until those checks are complete.
