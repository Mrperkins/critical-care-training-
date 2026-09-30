# Clinical media — provenance and licensing

Generated from `manifest.json` by `tools/clinical_media.py docs`; do not edit by hand. Every file here is checked by
`tools/validate_visual_assets.py` (licence on the accepted list, SHA-256, media signature, no unlisted files).

Accepted licences: CC0, Public Domain, CC BY 2.0, CC BY 3.0, CC BY 4.0, MIT, Apache-2.0. Rejected: NC, ND, share-alike, research-only or unclear terms.

Adding the pending media: create `imaging/real/fetch-request.txt` on `visual-overhaul` (any text). That starts the GitHub Action
**Fetch clinical media**, which reads each licence from the source — the Commons API or the article page — downloads the
originals, transcodes, validates and commits. Or put `original.<ext>` and a
`meta.json` in `DIR/<id>/` and run `python tools/clinical_media.py ingest --from DIR`. The app reads `manifest.json` at run time,
so ingested media appear without rebuilding `index.html`. Overlay marks (`marks`) are added after viewing the real frames.

## 3fd337c1 — Portable AP film, ventilated patient

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-mhh-ventilated-bilateral.jpg` |
| Clinical purpose | Endotracheal tube in the trachea, ECG leads and lines; patchy airspace opacities in both lungs (COVID-19 pneumonia) — the pattern the ARDS lesson draws. (xray) |
| Creator / authors | Institute for Diagnostic and Interventional Radiology, Hannover Medical School (MHH), Germany |
| Source | COVID-19 Image Repository — https://github.com/ml-workgroup/covid-19-image-repository (copy retrieved from https://github.com/ieee8023/covid-chestxray-dataset, images/<id>.jpg) |
| Licence | CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ |
| Modifications | Converted to greyscale JPEG, downscaled to 1000 px. |
| Required attribution | Institute for Diagnostic and Interventional Radiology, Hannover Medical School (MHH), Germany. COVID-19 Image Repository — https://github.com/ml-workgroup/covid-19-image-repository (copy retrieved from https://github.com/ieee8023/covid-chestxray-dataset, images/<id>.jpg). CC BY 3.0. |

## 98c24e39 — Portable AP film, severe bilateral disease

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-mhh-severe-bilateral.jpg` |
| Clinical purpose | Dense opacities in both lungs with many tubes, lines and leads over the chest — typical of a sick ICU patient; the lines are not lung disease. (xray) |
| Creator / authors | Institute for Diagnostic and Interventional Radiology, Hannover Medical School (MHH), Germany |
| Source | COVID-19 Image Repository — https://github.com/ml-workgroup/covid-19-image-repository (copy retrieved from https://github.com/ieee8023/covid-chestxray-dataset, images/<id>.jpg) |
| Licence | CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ |
| Modifications | Converted to greyscale JPEG, downscaled to 1000 px. |
| Required attribution | Institute for Diagnostic and Interventional Radiology, Hannover Medical School (MHH), Germany. COVID-19 Image Repository — https://github.com/ml-workgroup/covid-19-image-repository (copy retrieved from https://github.com/ieee8023/covid-chestxray-dataset, images/<id>.jpg). CC BY 3.0. |

## bfefde5d — Bedside film, lungs largely clear

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-mhh-portable-clear.jpg` |
| Clinical purpose | A bedside ("Bettaufnahme") film with largely clear lungs and an implanted port in the left upper chest — a baseline to compare against. (xray) |
| Creator / authors | Institute for Diagnostic and Interventional Radiology, Hannover Medical School (MHH), Germany |
| Source | COVID-19 Image Repository — https://github.com/ml-workgroup/covid-19-image-repository (copy retrieved from https://github.com/ieee8023/covid-chestxray-dataset, images/<id>.jpg) |
| Licence | CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ |
| Modifications | Converted to greyscale JPEG, downscaled to 1000 px. |
| Required attribution | Institute for Diagnostic and Interventional Radiology, Hannover Medical School (MHH), Germany. COVID-19 Image Repository — https://github.com/ml-workgroup/covid-19-image-repository (copy retrieved from https://github.com/ieee8023/covid-chestxray-dataset, images/<id>.jpg). CC BY 3.0. |

## alines — A-lines: aerated lung

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-alines-vieira2020.mp4` · `imaging/real/lus-alines-vieira2020.jpg` |
| Clinical purpose | Longitudinal anterior chest scan in aerated lung: horizontal repeats of the pleural line (A-lines). Faint in this clip. (lus) |
| Creator / authors | Ana Luisa Silveira Vieira, José Muniz Pazeli Júnior, Marcus Gomes Bastos |
| Source | “Role of point-of-care ultrasound during the COVID-19 pandemic: our recommendations in the management of dialytic patients”, The Ultrasound Journal 12:30 (2020), https://doi.org/10.1186/s13089-020-00177-4 (clip via https://github.com/jannisborn/covid19_ultrasound) |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Cropped (dataset), first 3.5 s re-encoded to H.264 480 px, contrast and brightness increased; poster frame at 1.2 s. |
| Required attribution | Ana Luisa Silveira Vieira, José Muniz Pazeli Júnior, Marcus Gomes Bastos. “Role of point-of-care ultrasound during the COVID-19 pandemic: our recommendations in the management of dialytic patients”, The Ultrasound Journal 12:30 (2020), https://doi.org/10.1186/s13089-020-00177-4 (clip via https://github.com/jannisborn/covid19_ultrasound). CC BY 4.0. |

## blines — B-lines

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-blines-volpicelli2020.mp4` · `imaging/real/lus-blines-volpicelli2020.jpg` |
| Clinical purpose | Right lateral chest in COVID-19 pneumonia: vertical bright B-lines from the pleural line to the bottom of the screen, alternating with A-lines, and a thickened pleura. (lus) |
| Creator / authors | Giovanni Volpicelli, Luna Gargani |
| Source | “Sonographic signs and patterns of COVID-19 pneumonia”, The Ultrasound Journal 12:22 (2020), https://doi.org/10.1186/s13089-020-00171-w (clip via https://github.com/jannisborn/covid19_ultrasound) |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Cropped (dataset), first 3.5 s re-encoded to H.264 480 px; poster frame at 1.2 s. |
| Required attribution | Giovanni Volpicelli, Luna Gargani. “Sonographic signs and patterns of COVID-19 pneumonia”, The Ultrasound Journal 12:22 (2020), https://doi.org/10.1186/s13089-020-00171-w (clip via https://github.com/jannisborn/covid19_ultrasound). CC BY 4.0. |

## whitelung — White lung: confluent B-lines

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-whitelung-testa2012.mp4` · `imaging/real/lus-whitelung-testa2012.jpg` |
| Clinical purpose | H1N1 pneumonia, lateral mid-chest: confluent B-lines ("white lung") with superficial consolidation and a thickened pleural line. (lus) |
| Creator / authors | Americo Testa, Gino Soldati, Roberto Copetti, Rosangela Giannuzzi, Grazia Portale, Nicolò Gentiloni-Silveri |
| Source | “Early recognition of the 2009 pandemic influenza A (H1N1) pneumonia by chest ultrasound”, Critical Care 16:R30 (2012), https://doi.org/10.1186/cc11201 (clip via https://github.com/jannisborn/covid19_ultrasound) |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/ |
| Modifications | Cropped (dataset), first 3.5 s re-encoded to H.264 480 px; poster frame at 1.2 s. |
| Required attribution | Americo Testa, Gino Soldati, Roberto Copetti, Rosangela Giannuzzi, Grazia Portale, Nicolò Gentiloni-Silveri. “Early recognition of the 2009 pandemic influenza A (H1N1) pneumonia by chest ultrasound”, Critical Care 16:R30 (2012), https://doi.org/10.1186/cc11201 (clip via https://github.com/jannisborn/covid19_ultrasound). CC BY 2.0. |

## Pending — staged, not yet in the app

Teaching content is written; the media has not been downloaded and the licence has not been verified from the source.

| ID | Finding | Claimed licence | Source page |
|---|---|---|---|
| ptx-expiratory | pneumothorax | CC0 (unverified) | https://commons.wikimedia.org/wiki/File:Expired_X-ray_of_pneumothorax.jpg |
| fast-ruq-positive | free intraperitoneal fluid | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv |
| ivc-2026-video-s1 | IVC traced into the right atrium | CC BY 4.0 (unverified) | https://link.springer.com/article/10.1186/s44348-026-00078-5 |
| ijv-2026-video-s2 | IJV compressibility beside the carotid | CC BY 4.0 (unverified) | https://link.springer.com/article/10.1186/s44348-026-00078-5 |

## Considered and rejected

- Open Critical Care anesthesia POCUS pocket card (2022): No licence stated; images credited “courtesy of” third parties (JACC, austincc.edu, echocardiographer.org). Used for facts only, in our own words.
- COVID-BLUES lung ultrasound dataset: CC BY-NC-ND 4.0
- covid19_ultrasound clips attributed to “charlotte” (source id 14): Licence listed but origin not identifiable — unclear.
- Radiopaedia-derived images in covid-chestxray-dataset: CC BY-NC-SA
- covid19_ultrasound clip “Pneu_prospective_file3” (The Ultrasound Journal / Critical Ultrasound Journal 4:16, 2012, doi 10.1186/2036-7902-4-16): Listed as CC BY 2.0, but the article page could not be read to confirm authors and licence (rate-limited) — not included until verified.
- CC BY-SA alternative IVC clip offered in the asset bundle: Share-alike is not on this project’s accepted list — kept out, as the bundle recommends.
