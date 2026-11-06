# Real Clinical Imaging Trainer

This addition expands the library's real-patient training references without replacing the simulator or its case engine.

## Coverage
- **30 X-ray references** (including older unlabeled X-ray items).
- **39 CT references** (brain, vessels, thoracoabdominal emergencies).
- **31 ultrasound references** (lung US, FAST, vascular access, aorta, IVC and bedside echo).
- **7 MRI examples** are CC BY 4.0 originals with a required SHA-1 verified site mirror in `imaging/curated/`, packaged for offline study after the release site build. Published mirrors fall back to original Commons URLs when network is available.
- **108 imaging studies total** (100 local X-ray/CT/ultrasound + seven MRI + one advanced remote CEUS ultrasound cine), with 102 structured quizzes. Six older references without quizzes use observation-and-reveal exercises.

This is a live renderer for one interpretation exercise per study. It does not pretend these are 108 unique patients: some examples represent different frames, slices or findings in the same publication.

## In-app entry points
- Browse → **Imaging trainer**.
- Top-bar → **Imaging**; Learning Resources menu → **Real imaging trainer**.
- Relevant module pages → **See it on real imaging** with thumbnails and an opening link.
- During a module lesson, the step rail includes **Practice real clinical images for this course**, where a matching verified collection exists.

## Teaching flow
1. Select modality (X-ray, CT, MRI, ultrasound); optionally search.
2. Examine the image or clip before the diagnosis/explanation.
3. Commit to the existing clinically reviewed multiple-choice answer. Older references without a quiz use **Reveal findings** after independent inspection.
4. Review the description, what to look for, explanation, and any honest overlays.
5. Continue to the next image; local storage tracks reviewed, latest correct status and attempts (`ccp.imaging.trainer.v1`).

Clinical photos and other non-imaging media are deliberately excluded. Original `RealCase`, `RealStudy`, staged media and the existing imaging manifest remain unchanged.

## Source controls and limitations
- Existing local studies come from `imaging/real/manifest.json`, which tracks authorship, original published work, licensing, and any transformations. The accepted list excludes NC, ND and SA licenses.
- MRI originals are published only after `app/scripts/prepare-clinical-archive.mjs` validates SHA-1 and byte count against `app/clinical-archive.json`; then they are mirrored into GitHub Pages and an optional offline pack. Each keeps its Commons original, creator and license links.
- For all sources, the visible image is a different real patient from the simulation, not evidence about the simulated patient.
- The pinned MRI archive requires a successful site build before claiming offline delivery. The original images and annotations still require clinical editorial review before the lessons are marketed for high-stakes education.
- Clinical findings/interpretations are educational and must receive clinician review before deployment in a high-stakes training program.

## MRI references and licenses
- [Diffusion-restricted stroke MRI/ADC](https://commons.wikimedia.org/wiki/File:DWE_MRI_of_cerebral_infarction.png) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.
- [T2* cerebral microhemorrhage](https://commons.wikimedia.org/wiki/File:Effective_T2-weighted_MRI_of_the_brain_with_a_small_hemorrhages.jpg) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.
- [MS — PSIR](https://commons.wikimedia.org/wiki/File:Axial_PSIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.
- [MS — DIR](https://commons.wikimedia.org/wiki/File:Axial_DIR_MRI_of_a_brain_with_multiple_sclerosis_lesions.jpg) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.
- [Lumbar spinal epidural abscess](https://commons.wikimedia.org/wiki/File:MRI_of_the_lumbar_spine_with_abscess_in_the_posterior_epidural_space,_causing_cauda_equina_syndrome.jpg) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.
- [Pediatric diffuse midline glioma MRI](https://commons.wikimedia.org/wiki/File:Diffuse_midline_glioma_MRI_(cropped).jpg) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.
- [Annotated T1 brain MRI](https://commons.wikimedia.org/wiki/File:Brain_regions_on_T1_MRI.png) — **CC BY 4.0**, creator and original scientific source recorded in `app/src/library/imaging/mriCatalog.ts`.

## Next clinical-content expansions
Add further studies from Europe PMC open-access collections, Wikimedia Commons, and appropriately cleared institutional archives *only after* checking each individual image's rights, patient privacy, findings, and source traceability. Do not wholesale import clinical images from Radiopaedia or other platforms with incompatible restrictions.

## Large-scale image sources identified for later ingestion

- [The Cancer Imaging Archive — public collections](https://www.cancerimagingarchive.net/browse-data/): extensive CT/MRI/ultrasound/radiography datasets, usually DICOM. **Permissions are per collection and sometimes per subset; head/face-related images can require controlled access.** A dataset image is not yet a vetted teaching case.
- [Cancer Moonshot Biobank colorectal collection](https://www.cancerimagingarchive.net/collection/cmb-crc/): includes a large CC BY 4.0 radiology-image subset, alongside *separately restricted* head imaging. Do not import restricted studies.
- [Wikimedia Commons](https://commons.wikimedia.org/) and [Europe PMC](https://europepmc.org/): good sources for condition-identified figures with traceable author/license details, subject to per-image review.

A future DICOM ingest workflow should de-identify metadata, prevent facial reconstruction disclosure, extract only clinically relevant key frames, independently validate diagnosis and laterality, record license evidence and source, and associate every image with a reviewed interpretation. Large image counts alone are not a substitute for verified educational quality.
