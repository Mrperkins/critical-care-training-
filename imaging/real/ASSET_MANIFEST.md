# Clinical media — provenance and licensing

Generated from `manifest.json` by `tools/clinical_media.py docs`; do not edit by hand. Every file here is checked by
`tools/validate_visual_assets.py` (licence on the accepted list, SHA-256, media signature, no unlisted files).

Accepted licences: CC0, Public Domain, CC BY 2.0, CC BY 3.0, CC BY 2.5, CC BY 4.0, MIT, Apache-2.0. Rejected: NC, ND, share-alike, research-only or unclear terms.

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
| Original preserved | The original’s top bar shows a study number, date and mechanism; it is not redistributed here — the Commons URL and SHA-256 identify it. |
| Licence evidence | Wikimedia Commons API extmetadata for File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AClinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S7.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## lus-absent-sliding-gillman — Absent lung sliding

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-absent-sliding-gillman.mp4` · `imaging/real/lus-absent-sliding-gillman.webm` · `imaging/real/lus-absent-sliding-gillman.jpg` |
| Clinical purpose | absent lung sliding (ptxlus) |
| Creator / authors | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A |
| Source | “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S4 (“Absent Lung Sliding”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 640×480, 30.0 fps, 6.0 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; the scanner’s top status bar (patient name, number, date) blacked out; audio none in the source; no crop, mirroring, speed change or filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A. “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S4 (“Absent Lung Sliding”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv. CC BY 2.0. |
| Original title | Absent Lung Sliding. Resuscitative ultrasound video illustrating the absence of lung sliding suggestive of a pneumothorax. |
| Source page | https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/f/f8/Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | 10.1186/1757-7241-17-34 |
| Published | 2009 |
| Retrieved | 2026-10-03T19:50Z |
| Original format | video/ogg · 633,978 bytes · `Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv` |
| Original SHA-256 | `f64ed53a080b543f3bfec484c17b227afab1ed4611db4b80b38840ff51ff0a63` |
| Original preserved | The original’s top bar shows a patient name, number and date; it is not redistributed here — the Commons URL and SHA-256 identify it. |
| Licence evidence | Wikimedia Commons API extmetadata for File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AClinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S4.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ivc-collapse-gillman — IVC collapsing with each breath

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ivc-collapse-gillman.mp4` · `imaging/real/ivc-collapse-gillman.webm` · `imaging/real/ivc-collapse-gillman.jpg` · `imaging/real/source/ivc-collapse-gillman-source.ogv` |
| Clinical purpose | IVC collapsing with breathing (ivc) |
| Creator / authors | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A |
| Source | “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S8 (“Ultrasound Assessment of Volume Status”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 720×480, 29.97 fps, 6.002 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; audio removed; no crop, mirroring, speed change or filtering. Poster = frame at 1.5 s. |
| Required attribution | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A. “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S8 (“Ultrasound Assessment of Volume Status”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv. CC BY 2.0. |
| Original title | Ultrasound Assessment of Volume Status. Resuscitative ultrasound video illustrating complete collapse of the IVC with respiration, suggestive of hypovolemia. |
| Source page | https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/6/6d/Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | 10.1186/1757-7241-17-34 |
| Published | 2009 |
| Retrieved | 2026-10-03T19:50Z |
| Original format | video/ogg · 1,573,758 bytes · `Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv` |
| Original SHA-256 | `26d6850215ba6d61a920d57eacd74eb8af781794d2e7f7edbd4d8dc14d29f7ed` |
| Original preserved | imaging/real/source/ivc-collapse-gillman-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AClinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S8.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## pleural-fluid-gillman — Large pleural effusion

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/pleural-fluid-gillman.mp4` · `imaging/real/pleural-fluid-gillman.webm` · `imaging/real/pleural-fluid-gillman.jpg` · `imaging/real/source/pleural-fluid-gillman-source.ogv` |
| Clinical purpose | pleural effusion (pleuraleff) |
| Creator / authors | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A |
| Source | “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S2 (“Pleural Fluid”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 640×480, 30.0 fps, 10.0 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; audio none in the source; no crop, mirroring, speed change or filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Ball C, Panebianco N, Al-Kadi A, Kirkpatrick A. “Clinician performed resuscitative ultrasonography for the initial evaluation and resuscitation of trauma”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 17:34 (2009), https://doi.org/10.1186/1757-7241-17-34 — supplementary video S2 (“Pleural Fluid”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv. CC BY 2.0. |
| Original title | Pleural Fluid. Resuscitative ultrasound video of a large pleural collection. |
| Source page | https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/3/39/Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | 10.1186/1757-7241-17-34 |
| Published | 2009 |
| Retrieved | 2026-10-03T19:51Z |
| Original format | video/ogg · 1,579,529 bytes · `Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv` |
| Original SHA-256 | `9c0eff55d99fd3754359ea0c2552a9ab73f81169476611e08e743e0e1bee2979` |
| Original preserved | imaging/real/source/pleural-fluid-gillman-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AClinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S2.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## tamponade-ginghina — Cardiac tamponade — right-heart collapse

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/tamponade-ginghina.mp4` · `imaging/real/tamponade-ginghina.webm` · `imaging/real/tamponade-ginghina.jpg` · `imaging/real/source/tamponade-ginghina-source.ogv` |
| Clinical purpose | cardiac tamponade (tamponade) |
| Creator / authors | Ginghina C, Beladan C, Iancu M, Calin A, Popescu B |
| Source | “Respiratory maneuvers in echocardiography: a review of clinical applications”, Cardiovascular Ultrasound 7:42 (2009), https://doi.org/10.1186/1476-7120-7-42 — supplementary video 11, via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 352×288, 25.0 fps, 0.803 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; audio removed; no crop, mirroring, speed change or filtering. Poster = frame at 0.3 s. |
| Required attribution | Ginghina C, Beladan C, Iancu M, Calin A, Popescu B. “Respiratory maneuvers in echocardiography: a review of clinical applications”, Cardiovascular Ultrasound 7:42 (2009), https://doi.org/10.1186/1476-7120-7-42 — supplementary video 11, via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv. CC BY 2.0. |
| Original title | Phasic variation in cardiac volumes caused by cardiac tamponade, visualized in transthoracic apical 4 chamber view. The intermittent collapse of the free walls  |
| Source page | https://commons.wikimedia.org/wiki/File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/c/c1/Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2009 |
| Retrieved | 2026-10-03T19:51Z |
| Original format | video/ogg · 177,592 bytes · `Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv` |
| Original SHA-256 | `129691d5a07ded8944670359d35986dca61dc4b79d5a2aa9d5ff14a6ee7c5362` |
| Original preserved | imaging/real/source/tamponade-ginghina-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Respiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ARespiratory-maneuvers-in-echocardiography-a-review-of-clinical-applications-1476-7120-7-42-S11.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ptx-series-bonilla — Pneumothorax — before and after a chest tube

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ptx-series-bonilla.jpg` · `imaging/real/source/ptx-series-bonilla-source.png` |
| Clinical purpose | pneumothorax before and after a chest tube (ptxseries) |
| Creator / authors | Alex Bonilla, Alexander J. Blair, Suliman M. Alamro, Rebecca A. Ward, Michael B. Feldman, Richard A. Dutko, Theodora K. Karagounis, Adam L. Johnson, Erik E. Folch & Jatin M. Vyas |
| Source | Bonilla A et al., Journal of Medical Case Reports 13 (2019), https://doi.org/10.1186/s13256-019-2215-4 — figure, via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Chest_X-ray_of_pneumothorax.png |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0 |
| Modifications | Converted to JPEG; padded by one black pixel to even dimensions; no crop, mirroring or filtering. |
| Required attribution | Alex Bonilla, Alexander J. Blair, Suliman M. Alamro, Rebecca A. Ward, Michael B. Feldman, Richard A. Dutko, Theodora K. Karagounis, Adam L. Johnson, Erik E. Folch & Jatin M. Vyas. Bonilla A et al., Journal of Medical Case Reports 13 (2019), https://doi.org/10.1186/s13256-019-2215-4 — figure, via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Chest_X-ray_of_pneumothorax.png. CC BY 4.0. |
| Original title | Chest X-ray at initial presentation demonstrating a right-sided pneumothorax (arrow) and resolving right-sided pneumothorax after pigtail chest tube placement f |
| Source page | https://commons.wikimedia.org/wiki/File:Chest_X-ray_of_pneumothorax.png |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/9/9f/Chest_X-ray_of_pneumothorax.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2019-05-04 |
| Retrieved | 2026-10-03T19:51Z |
| Original format | image/png · 759,015 bytes · `Chest X-ray of pneumothorax.png` |
| Original SHA-256 | `a1cf308751177271b79933dc907c4461818e7438f0b55627986ed454871c1dfe` |
| Original preserved | imaging/real/source/ptx-series-bonilla-source.png |
| Licence evidence | Wikimedia Commons API extmetadata for File:Chest X-ray of pneumothorax.png: LicenseShortName = “CC BY 4.0”, UsageTerms = “Creative Commons Attribution 4.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AChest+X-ray+of+pneumothorax.png&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## lus-sliding-gillman2012 — Normal lung sliding

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-sliding-gillman2012.mp4` · `imaging/real/lus-sliding-gillman2012.webm` · `imaging/real/lus-sliding-gillman2012.jpg` |
| Clinical purpose | normal lung sliding (ptxlus) |
| Creator / authors | Gillman L, Kirkpatrick A |
| Source | “Portable bedside ultrasound: the visual stethoscope of the 21st century”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 20:18 (2012), https://doi.org/10.1186/1757-7241-20-18 — supplementary video S1 (“Normal Lung Sliding”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 640×480, 29.97 fps, 5.58 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; the scanner’s top status bar blacked out; frame timing normalised to a constant 29.97 fps (irregular source timestamps; speed unchanged); audio removed; no crop, mirroring, speed change or other filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Kirkpatrick A. “Portable bedside ultrasound: the visual stethoscope of the 21st century”, Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine 20:18 (2012), https://doi.org/10.1186/1757-7241-20-18 — supplementary video S1 (“Normal Lung Sliding”), via Wikimedia Commons https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv. CC BY 2.0. |
| Original title | Normal Lung Sliding. The hallmark of lung ultrasound illustrating the normal lung. The pleural line is seen below the rib shadows on either side. Lung sliding,  |
| Source page | https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/a/ae/Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | 10.1186/1757-7241-20-18 |
| Published | 2012 |
| Retrieved | 2026-10-03T20:01Z |
| Original format | video/ogg · 714,531 bytes · `Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv` |
| Original SHA-256 | `44407556f0a526d14653a31b8331e27189b0e087cce92c3e9c76c4156e2e733d` |
| Original preserved | Not redistributed here because the scanner status bar may show identifiers; the source URL and SHA-256 identify the original. |
| Licence evidence | Wikimedia Commons API extmetadata for File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3APortable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S1.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## Pending — staged, not yet in the app

Teaching content is written; the media has not been downloaded and the licence has not been verified from the source.

| ID | Finding | Claimed licence | Source page |
|---|---|---|---|
| stroke-hmcas-2025 | hyperdense middle cerebral artery sign | CC BY 4.0 (unverified) | https://doi.org/10.7759/cureus.86726 |
| stroke-early-change-2025 | early ischaemic change (loss of grey–white differentiation) | CC BY 4.0 (unverified) | https://doi.org/10.7759/cureus.86726 |
| stroke-cta-m1-2025 | right M1 occlusion on CTA | CC BY 4.0 (unverified) | https://doi.org/10.7759/cureus.98724 |
| stroke-ctp-mismatch-2025 | core–penumbra mismatch | CC BY 4.0 (unverified) | https://doi.org/10.7759/cureus.98724 |
| stroke-infarct-24h-2025 | established infarct at 24 h | CC BY 4.0 (unverified) | https://doi.org/10.7759/cureus.98724 |
| stroke-malignant-edema-2023 | malignant brain oedema after MCA infarction | CC BY 4.0 (unverified) | https://doi.org/10.1186/s40001-023-01414-x |
| stroke-mass-effect-2021 | large MCA infarct with mass effect | CC BY 4.0 (unverified) | https://doi.org/10.1097/md.0000000000024496 |
| stroke-hemorrhagic-transformation-2026 | haemorrhagic transformation of an infarct | CC BY 4.0 (unverified) | https://doi.org/10.3389/fcvm.2026.1747104 |
| stroke-hmcas-vs-cta-2022 | hyperdense MCA sign compared with CTA | CC BY 4.0 (unverified) | https://doi.org/10.1007/s00415-022-11500-5 |
| stroke-ctp-m1-mirza | perfusion deficit in M1 occlusion | CC BY 4.0 (unverified) | https://commons.wikimedia.org/wiki/File:CT_perfusion_in_M1_artery_occlusion.png |
| ich-swirl-2012 | swirl sign in acute intracerebral haemorrhage | CC BY 2.0 (unverified) | https://doi.org/10.1186/1471-2377-12-109 |
| ich-spot-sign-2016 | spot sign | CC BY 4.0 (unverified) | https://doi.org/10.1186/s13054-016-1432-0 |
| ich-deep-locations-2016 | typical sites of hypertensive haemorrhage | CC BY 4.0 (unverified) | https://doi.org/10.1186/s13054-016-1432-0 |
| ich-ivh-commons | intracerebral haemorrhage with intraventricular extension | Public Domain (unverified) | https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrage_(CT_scan).jpg |
| ich-thalamic-hydro-yadav | thalamic haemorrhage with hydrocephalus | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrhage.jpg |
| ich-cerebellar-yadav | posterior fossa haemorrhage with hydrocephalus | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Posterior_fossa_hemorrhage.jpg |
| ich-sah-to-iph-2010 | rebleeding: subarachnoid then intraparenchymal haemorrhage | CC BY 3.0 (unverified) | https://doi.org/10.1155/2010/168408 |
| sah-ct-mirza | subarachnoid haemorrhage | CC BY 4.0 (unverified) | https://commons.wikimedia.org/wiki/File:CT_of_subarachnoid_hemorrhage.png |
| cxr-chf-haggstrom | congestive heart failure (cardiogenic pulmonary oedema) | CC0 (unverified) | https://commons.wikimedia.org/wiki/File:Chest_radiograph_of_a_lung_with_Kerley_B_lines.jpg |
| cxr-hps-edema-cdc | non-cardiogenic pulmonary oedema with effusions (hantavirus) | Public Domain (unverified) | https://commons.wikimedia.org/wiki/File:6077_lores.jpg |
| cxr-ards-2019 | acute respiratory distress syndrome | CC BY 3.0 (unverified) | https://doi.org/10.7759/cureus.3997 |
| cxr-left-collapse-child-2013 | complete left lung collapse | CC BY 2.0 (unverified) | https://doi.org/10.1186/1471-2431-13-209 |
| cxr-collapse-before-after-2021 | total right lung collapse, before and after bronchoscopy | CC BY 4.0 (unverified) | https://doi.org/10.1186/s12890-021-01789-9 |
| cxr-massive-effusion-2010 | massive left pleural effusion with mediastinal shift | CC BY 2.0 (unverified) | https://doi.org/10.1186/1746-1596-5-82 |
| aaa-us-sagittal-haggstrom | abdominal aortic aneurysm | CC0 (unverified) | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_sagittal_plane.jpg |
| aaa-us-axial-haggstrom | abdominal aortic aneurysm | CC0 (unverified) | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_axial_plane.jpg |
| aaa-us-thrombus-haggstrom | abdominal aortic aneurysm | CC0 (unverified) | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_with_mural_thrombus.jpg |
| lus-blines-gargani | blines | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv |
| lus-confluent-tsung | confluent_blines | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Prospective-application-of-clinician-performed-lung-ultrasonography-during-the-2009-H1N1-influenza-2036-7902-4-16-S2.ogv |
| lus-consolidation-tsung | consolidation | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Prospective-application-of-clinician-performed-lung-ultrasonography-during-the-2009-H1N1-influenza-2036-7902-4-16-S3.ogv |
| lus-progression-h7n9 | progression | CC BY 4.0 (unverified) | https://commons.wikimedia.org/wiki/File:Lung-ultrasound-imaging-in-avian-influenza-A-(H7N9)-respiratory-failure-2036-7902-6-6-S1.ogv |
| lus-hepatisation-gillman | consolidation | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv |
| echo-vsd-color-commons | ventricular septal defect | Public Domain (unverified) | https://commons.wikimedia.org/wiki/File:Ventricular_Septal_Defect.jpg |
| echo-asd-secundum-commons | secundum atrial septal defect | Public Domain (unverified) | https://commons.wikimedia.org/wiki/File:Echokardiogram_von_Atriumseptumdefekt_(Ostium_secundum).jpg |

## Considered and rejected

- Open Critical Care anesthesia POCUS pocket card (2022): No licence stated; images credited “courtesy of” third parties (JACC, austincc.edu, echocardiographer.org). Used for facts only, in our own words.
- COVID-BLUES lung ultrasound dataset: CC BY-NC-ND 4.0
- covid19_ultrasound clips attributed to “charlotte” (source id 14): Licence listed but origin not identifiable — unclear.
- Radiopaedia-derived images in covid-chestxray-dataset: CC BY-NC-SA
- covid19_ultrasound clip “Pneu_prospective_file3” (The Ultrasound Journal / Critical Ultrasound Journal 4:16, 2012, doi 10.1186/2036-7902-4-16): Listed as CC BY 2.0, but the article page could not be read to confirm authors and licence (rate-limited) — not included until verified.
- CC BY-SA alternative IVC clip offered in the asset bundle: Share-alike is not on this project’s accepted list — kept out, as the bundle recommends.
