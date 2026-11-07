# Imaging Academy — sourced, guided clinical learning

**Scope:** original educational material on a separate review branch based on \`main\`. This is NOT an accredited clinical course, instructor sign-off, diagnostic software or source for bedside treatment recommendations.

## Purpose

The previous 107-image trainer used unstructured "what do you see?" quizzes. The new **Imaging Academy** makes courses the primary navigation destination. Independent drills remain available as a separate review tool.

## Curriculum (10 courses, 38 teaching chapters)

1. Chest X-ray: systematic interpretation — technique, quality, full sweep, urgent patterns and ICU devices.
2. Head CT — axial orientation, hemorrhage spaces, ischemic changes and mass effect.
3. Abdominal CT / CTA — planes, contrast phase, aorta, solid organs and bowel.
4. Brain MRI — T1, diffusion/ADC, susceptibility, anatomic location and pitfalls.
5. POCUS foundations — probe/marker, physics, image optimization, artifacts and reporting.
6. eFAST — standard trauma windows, fluid, focused cardiac exam and pneumothorax assessment.
7. Lung ultrasound — pleural sliding, A/B-lines, lung point, consolidation and effusions.
8. Abdominal aortic ultrasound — transverse/longitudinal views, wall-to-wall measurements, uncertainty in rupture.
9. Vascular POCUS — vein/artery orientation, compression, ultrasound-guided needle tip visualization.
10. Focused cardiac POCUS / IVC — subxiphoid imaging, tamponade physiology and limitations of IVC.

Each chapter contains:
- A clinical learning objective and several original explanation paragraphs.
- A sequenced interpretation/acquisition method, common pitfalls and anatomy correlation.
- One or more existing licensed real-patient image/ultrasound **motion** examples with still-frame toggles where provided.
- A reference **3D app body model**, focused on a related structure. The 3D model uses the app's existing anatomy meshes, not generative illustrations.
- A retrieval checkpoint with explanation; completing a chapter requires the correct answer.
- Links to original clinical publications/guidelines for independent review.

After chapters, a supervised-style **case practicum** uses the existing sourced image questions. Target is 80% of the case set; this is not a proof of clinical competence.

## Side-by-side design and limits

Left: actual source study (ultrasound moving clip + still-frame switch, or X-ray/CT/MRI still). Each image retains source and license.

Right: an interactive **original app 3D model**—the neural cortical model with an adjustable axial cut for head CT/MRI, the abdominal organ model focused on the selected FAST/aortic window, or the Atlas patient reference for thoracic and other topics. Probe-window labels are approximate and not patient-registered. Cases without a matching modeled region are explicitly identified.

**No false co-registration:** the image and 3D model do not represent the same individual; the anatomical plane is not calibrated, the model is not reconstructed from patient DICOM data, and it does not display patient-specific pathology. Do not draw linked probes or synchronized CT slice scroll without actual patient-matched volumetric acquisitions. The axial cut is a **reference-brain slice**, not a synchronized CT or MRI slice from the patient.

The repository already contains **16 video files with ultrasound findings**, including A-lines, B-lines, white lung, normal/absent sliding, lung point, RUQ FAST, IVC and IJ compression, pleural effusion, pericardial tamponade and consolidation. These are from the vetted \`imaging/real/manifest.json\`. Most have a still poster and many have MP4 + WebM alternatives. No third-party LITFL videos were copied.

Routine bedside aortic scanning continues to use vetted grayscale stills. An **additional contrast-enhanced AAA mural-thrombus research cine** is included as an *advanced CEUS* chapter, independently licensed CC BY 4.0 from Łukasiewicz et al., Scientific Reports (2016). It is externally streamed (online only), and is never misrepresented as routine ultrasound or as a validated rupture-risk test.

## Evidence / editorial sources (links, not embedded copied material)

- LITFL: [DRSABCDE Chest X-ray](https://litfl.com/drsabcde-of-cxr-interpretation/), [Chest X-ray](https://litfl.com/chest-x-ray/).
- LITFL: [CT head interpretation](https://litfl.com/ct-head-interpretation/), [Radiology library](https://litfl.com/radiology/).
- LITFL: [POCUS physics](https://litfl.com/pocus-physics-101/), [Ultrasound artifacts](https://litfl.com/ultrasound-library/basics/).
- LITFL: [eFAST](https://litfl.com/pocus-made-easy-efast/), [Lung POCUS](https://litfl.com/pocus-made-easy-lung/), [AAA](https://litfl.com/pocus-made-easy-aaa/), [Basic Echo](https://litfl.com/pocus-made-easy-basic-echo/), [Vascular access](https://litfl.com/ultrasound-guided-vascular-access/).
- [AIUM eFAST practice parameter](https://www.aium.org/resources/practice-parameters/efast).
- [ACR Appropriateness Criteria](https://www.acr.org/clinical-resources/clinical-tools-and-reference/appropriateness-criteria).

These sources informed ordering and fact-checking. The written lessons are original, with short takeaways rather than copied source passages. Links are reviewed as external resources; each imaging file retains its individual license in the manifest.

## Release media and anatomy hardening

- Seven MRI reference originals are pinned in `app/clinical-archive.json` to Wikimedia Commons SHA-1 and exact size; `app/scripts/prepare-clinical-archive.mjs` verifies downloaded bytes before site build. The published `imaging/curated/` mirror supports offline packs. If the build cannot obtain or verify the source, it fails rather than silently substituting a different image. The original Commons URL remains an online fallback.
- The spinal MRI chapter now uses genuine BodyParts3D 3D lumbar vertebrae with level selection, licensed CC BY-SA 2.1 Japan and credited in the UI. The epidural space/cauda equina have **not** been inaccurately invented in 3D.
- The advanced CEUS moving reference is licensed separately and is online only. The other 16 ultrasound clips and posters are already local.
- Dedicated `scripts/imaging-browser-qa.cjs` checks the real eFAST MP4 + still, actual 3D panel, knowledge checkpoint and mobile layout on Chromium, Firefox and WebKit. It runs in the CI browser matrix.
- Site-sync includes `imaging/curated/` so the MRI mirror reaches GitHub Pages after approved merge.

## Quality gates before merging

- CI must pass on the PR; the three existing GitHub Actions checks are currently red, including a baseline predating this change.
- Type-check, Vitest, production build and mobile browser walkthrough needed before merge.
- Clinician/radiologist/POCUS educator should review all chapter teaching notes, laterality, image acquisition instructions, critical thresholds, and source provenance.
- Confirm videos load on iOS and in poor network conditions, and WebGL fallbacks are visible when a 3D body cannot render.
- Verify keyboard navigation and color contrast for new controls; avoid treating course quiz completion as credentialing.
