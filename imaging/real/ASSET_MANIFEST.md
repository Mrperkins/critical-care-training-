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

## ptx-expiratory — Left pneumothorax — film taken in expiration

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ptx-expiratory.jpg` |
| Clinical purpose | pneumothorax (ptx) |
| Creator / authors | Mikael Häggström, M.D. |
| Source | Wikimedia Commons, own work (5 March 2018) — https://commons.wikimedia.org/wiki/File:Expired_X-ray_of_pneumothorax.jpg |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mikael Häggström, M.D.. Wikimedia Commons, own work (5 March 2018) — https://commons.wikimedia.org/wiki/File:Expired_X-ray_of_pneumothorax.jpg. CC0. |
| Original title | Expired X-ray of pneumothorax — anteroposterior film taken in expiration (the Commons page also shows the inspiratory AP and lateral films of the same patient) |
| Source page | https://commons.wikimedia.org/wiki/File:Expired_X-ray_of_pneumothorax.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/c/c6/Expired_X-ray_of_pneumothorax.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2018-03-05 |
| Retrieved | 2026-09-30T18:32Z |
| Original format | image/jpeg · 703,393 bytes · `Expired_X-ray_of_pneumothorax.jpg` |
| Original SHA-256 | `cdc3a924ad281d8b317a93ab42f7bfafb7d159d14dfe64a9a16851461a85bde5` |
| Original preserved | imaging/real/ptx-expiratory.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Expired_X-ray_of_pneumothorax.jpg: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AExpired_X-ray_of_pneumothorax.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## fast-ruq-positive — Positive FAST — right upper quadrant

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-ruq-positive.mp4` · `imaging/real/fast-ruq-positive.webm` · `imaging/real/fast-ruq-positive.jpg` · `imaging/real/source/fast-ruq-positive-source.ogv` |
| Clinical purpose | free intraperitoneal fluid (fast) |
| Creator / authors | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A |
| Source | “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S1 (“Positive FAST of Hepatorenal Fossa”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original Ogg Theora (720×480 stored with 8:9 pixels, shown at 4:3; 29.97 fps; 6.0 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) with the same frames, pixel aspect and length; Vorbis audio removed; no crop, mirroring, speed change or filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A. “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S1 (“Positive FAST of Hepatorenal Fossa”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv. CC BY 2.0. |
| Original title | Positive FAST of Hepatorenal Fossa. Resuscitative ultrasound video of the hepatorenal fossa demonstrating free intra-peritoneal fluid seen as a hypoechoic strip |
| Source page | https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/7/70/Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | 10.1186/1757-7241-17-34 |
| Published | 2009 |
| Retrieved | 2026-09-30T18:32Z |
| Original format | video/ogg · 545,090 bytes · `Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv` |
| Original SHA-256 | `0f923551b28a5fc167f9aa9de9eb7e07cfda0ca4899aa394ad8d141a71eec7ab` |
| Original preserved | imaging/real/source/fast-ruq-positive-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AClinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ivc-2026-video-s1 — IVC — long axis under the liver

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ivc-2026-video-s1.mp4` · `imaging/real/ivc-2026-video-s1.webm` · `imaging/real/ivc-2026-video-s1.jpg` |
| Clinical purpose | IVC traced into the right atrium (ivc) |
| Creator / authors | Nathan C. Shaul, Alan M. Smeltz, Evan J. Raff, Shawn Jia, Lauriane Guichard, Daniel J. Rosenkrans, Jay W. Schoenherr, Jacob D. Acton, Duncan J. McLean, Mark E. Henry, Alexander Doyal |
| Source | “Point-of-care ultrasound to evaluate volume status in congestive heart failure”, Journal of Cardiovascular Imaging 34:17 (2026), https://doi.org/10.1186/s44348-026-00078-5 — supplementary item 1, https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13343992/supplementaryFiles → 44348_2026_78_MOESM1_ESM.avi |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Original AVI (mpeg4, 1692×1692, 23.833 fps, 15.902 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; downscaled 1692×1692 → 1280 px wide (aspect kept); audio none in the source; no crop, mirroring, speed change or filtering. Poster = frame at 9.0 s. |
| Required attribution | Nathan C. Shaul, Alan M. Smeltz, Evan J. Raff, Shawn Jia, Lauriane Guichard, Daniel J. Rosenkrans, Jay W. Schoenherr, Jacob D. Acton, Duncan J. McLean, Mark E. Henry, Alexander Doyal. “Point-of-care ultrasound to evaluate volume status in congestive heart failure”, Journal of Cardiovascular Imaging 34:17 (2026), https://doi.org/10.1186/s44348-026-00078-5 — supplementary item 1, https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13343992/supplementaryFiles → 44348_2026_78_MOESM1_ESM.avi. CC BY 4.0. |
| Original title | Point-of-care ultrasound to evaluate volume status in congestive heart failure |
| Source page | https://doi.org/10.1186/s44348-026-00078-5 |
| Original media URL | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13343992/supplementaryFiles → 44348_2026_78_MOESM1_ESM.avi |
| DOI | 10.1186/s44348-026-00078-5 |
| Published | 2026-07-07 |
| Retrieved | 2026-09-30T18:44Z |
| Original format | video/x-msvideo · 22,471,814 bytes · `44348_2026_78_MOESM1_ESM.avi` |
| Original SHA-256 | `bdcb64796fee4ca68aee6cb59894084caf6598d8360fbd2df49aaadd5cfbcdcd` |
| Original preserved | No — larger than 15 MB; URL and checksum recorded instead |
| Licence evidence | Europe PMC full text of PMC13343992 (doi 10.1186/s44348-026-00078-5), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original auth”; supplementary item 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ijv-2026-video-s2 — Internal jugular vein — long axis and collapse point

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ijv-2026-video-s2.mp4` · `imaging/real/ijv-2026-video-s2.webm` · `imaging/real/ijv-2026-video-s2.jpg` · `imaging/real/source/ijv-2026-video-s2-source.avi` |
| Clinical purpose | IJV compressibility beside the carotid (ijv) |
| Creator / authors | Nathan C. Shaul, Alan M. Smeltz, Evan J. Raff, Shawn Jia, Lauriane Guichard, Daniel J. Rosenkrans, Jay W. Schoenherr, Jacob D. Acton, Duncan J. McLean, Mark E. Henry, Alexander Doyal |
| Source | “Point-of-care ultrasound to evaluate volume status in congestive heart failure”, Journal of Cardiovascular Imaging 34:17 (2026), https://doi.org/10.1186/s44348-026-00078-5 — supplementary item 2, https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13343992/supplementaryFiles → 44348_2026_78_MOESM2_ESM.avi |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Original AVI (mpeg4, 1692×1692, 17.333 fps, 15.404 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; downscaled 1692×1692 → 1280 px wide (aspect kept); audio none in the source; no crop, mirroring, speed change or filtering. Poster = frame at 10.0 s. |
| Required attribution | Nathan C. Shaul, Alan M. Smeltz, Evan J. Raff, Shawn Jia, Lauriane Guichard, Daniel J. Rosenkrans, Jay W. Schoenherr, Jacob D. Acton, Duncan J. McLean, Mark E. Henry, Alexander Doyal. “Point-of-care ultrasound to evaluate volume status in congestive heart failure”, Journal of Cardiovascular Imaging 34:17 (2026), https://doi.org/10.1186/s44348-026-00078-5 — supplementary item 2, https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13343992/supplementaryFiles → 44348_2026_78_MOESM2_ESM.avi. CC BY 4.0. |
| Original title | Point-of-care ultrasound to evaluate volume status in congestive heart failure |
| Source page | https://doi.org/10.1186/s44348-026-00078-5 |
| Original media URL | https://www.ebi.ac.uk/europepmc/webservices/rest/PMC13343992/supplementaryFiles → 44348_2026_78_MOESM2_ESM.avi |
| DOI | 10.1186/s44348-026-00078-5 |
| Published | 2026-07-07 |
| Retrieved | 2026-09-30T18:45Z |
| Original format | video/x-msvideo · 7,257,102 bytes · `44348_2026_78_MOESM2_ESM.avi` |
| Original SHA-256 | `b3a187cbb258f9e7ae8434043069602d1a4035891b02087bbe7aa885538c324a` |
| Original preserved | imaging/real/source/ijv-2026-video-s2-source.avi |
| Licence evidence | Europe PMC full text of PMC13343992 (doi 10.1186/s44348-026-00078-5), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original auth”; supplementary item 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## lus-lung-point-gillman — Lung point — pneumothorax on ultrasound

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-lung-point-gillman.mp4` · `imaging/real/lus-lung-point-gillman.webm` · `imaging/real/lus-lung-point-gillman.jpg` |
| Clinical purpose | lung point (pneumothorax) (ptxlus) |
| Creator / authors | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A |
| Source | “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S7 (“Lung Point”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original Ogg Theora (640×480, 10 fps, 6.0 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; the scanner’s top status bar (study number, date, mechanism) blacked out; no crop, mirroring, speed change or other filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A. “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S7 (“Lung Point”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv. CC BY 2.0. |
| Original title | Lung Point. Resuscitative ultrasound video illustrating the lung point – the lateral limit of the pneumothorax. The lung can be seen sliding in from the right w |
| Source page | https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/c/c2/Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | 10.1186/1757-7241-17-34 |
| Published | 2009 |
| Retrieved | 2026-09-30T18:53Z |
| Original format | video/ogg · 228,567 bytes · `Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv` |
| Original SHA-256 | `1c293788664a00add01a46703b4df8c26b13deea152d35ce72ee3b70f94d9d2a` |
| Original preserved | No — larger than 15 MB; URL and checksum recorded instead |
| Licence evidence | Wikimedia Commons API extmetadata for File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AClinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## Considered and rejected

- Open Critical Care anesthesia POCUS pocket card (2022): No licence stated; images credited “courtesy of” third parties (JACC, austincc.edu, echocardiographer.org). Used for facts only, in our own words.
- COVID-BLUES lung ultrasound dataset: CC BY-NC-ND 4.0
- covid19_ultrasound clips attributed to “charlotte” (source id 14): Licence listed but origin not identifiable — unclear.
- Radiopaedia-derived images in covid-chestxray-dataset: CC BY-NC-SA
- covid19_ultrasound clip “Pneu_prospective_file3” (The Ultrasound Journal / Critical Ultrasound Journal 4:16, 2012, doi 10.1186/2036-7902-4-16): Listed as CC BY 2.0, but the article page could not be read to confirm authors and licence (rate-limited) — not included until verified.
- CC BY-SA alternative IVC clip offered in the asset bundle: Share-alike is not on this project’s accepted list — kept out, as the bundle recommends.
