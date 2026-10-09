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

## stroke-hmcas-2025 — Hyperdense right MCA

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-hmcas-2025.jpg` · `imaging/real/source/stroke-hmcas-2025-source.jpg` |
| Clinical purpose | hyperdense middle cerebral artery sign (ct-ischemic) |
| Creator / authors | Takayuki Inomata, Koji Nakaya, Takaya Sasaki, Hiroto Shiozaki, Yasuto Noda |
| Source | “The Role of Comprehensive Brain Perfusion and Whole-Body CT Using Split-Bolus Injection in Diagnosing Multiple Thromboembolism in a Wake-Up Stroke Patient: A Case Report”, Cureus 17:e86726 (2025), https://doi.org/10.7759/cureus.86726 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12295507.1/cureus-0017-00000086726-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (panel (a), the hyperdense artery); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Takayuki Inomata, Koji Nakaya, Takaya Sasaki, Hiroto Shiozaki, Yasuto Noda. “The Role of Comprehensive Brain Perfusion and Whole-Body CT Using Split-Bolus Injection in Diagnosing Multiple Thromboembolism in a Wake-Up Stroke Patient: A Case Report”, Cureus 17:e86726 (2025), https://doi.org/10.7759/cureus.86726 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12295507.1/cureus-0017-00000086726-i01.jpg. CC BY 4.0. |
| Original title | The Role of Comprehensive Brain Perfusion and Whole-Body CT Using Split-Bolus Injection in Diagnosing Multiple Thromboembolism in a Wake-Up Stroke Patient: A Case Report |
| Source page | https://doi.org/10.7759/cureus.86726 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12295507.1/cureus-0017-00000086726-i01.jpg |
| DOI | 10.7759/cureus.86726 |
| Published | 2025-06-25 |
| Retrieved | 2026-10-04T03:24Z |
| Original format | image/jpeg · 72,083 bytes · `cureus-0017-00000086726-i01.jpg` |
| Original SHA-256 | `05325521968f1aee12cb5a55e32b8ef6148950a6f6209610dc6d2d0661a86dd7` |
| Original preserved | imaging/real/source/stroke-hmcas-2025-source.jpg |
| Licence evidence | Europe PMC full text of PMC12295507 (doi 10.7759/cureus.86726), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-early-change-2025 — Early ischaemic change

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-early-change-2025.jpg` · `imaging/real/source/stroke-early-change-2025-source.jpg` |
| Clinical purpose | early ischaemic change (loss of grey–white differentiation) (ct-ischemic) |
| Creator / authors | Takayuki Inomata, Koji Nakaya, Takaya Sasaki, Hiroto Shiozaki, Yasuto Noda |
| Source | “The Role of Comprehensive Brain Perfusion and Whole-Body CT Using Split-Bolus Injection in Diagnosing Multiple Thromboembolism in a Wake-Up Stroke Patient: A Case Report”, Cureus 17:e86726 (2025), https://doi.org/10.7759/cureus.86726 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12295507.1/cureus-0017-00000086726-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (panel (b), early ischaemic change); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Takayuki Inomata, Koji Nakaya, Takaya Sasaki, Hiroto Shiozaki, Yasuto Noda. “The Role of Comprehensive Brain Perfusion and Whole-Body CT Using Split-Bolus Injection in Diagnosing Multiple Thromboembolism in a Wake-Up Stroke Patient: A Case Report”, Cureus 17:e86726 (2025), https://doi.org/10.7759/cureus.86726 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12295507.1/cureus-0017-00000086726-i01.jpg. CC BY 4.0. |
| Original title | The Role of Comprehensive Brain Perfusion and Whole-Body CT Using Split-Bolus Injection in Diagnosing Multiple Thromboembolism in a Wake-Up Stroke Patient: A Case Report |
| Source page | https://doi.org/10.7759/cureus.86726 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12295507.1/cureus-0017-00000086726-i01.jpg |
| DOI | 10.7759/cureus.86726 |
| Published | 2025-06-25 |
| Retrieved | 2026-10-04T03:24Z |
| Original format | image/jpeg · 72,083 bytes · `cureus-0017-00000086726-i01.jpg` |
| Original SHA-256 | `05325521968f1aee12cb5a55e32b8ef6148950a6f6209610dc6d2d0661a86dd7` |
| Original preserved | imaging/real/source/stroke-early-change-2025-source.jpg |
| Licence evidence | Europe PMC full text of PMC12295507 (doi 10.7759/cureus.86726), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-cta-m1-2025 — CTA: right M1 cut-off

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-cta-m1-2025.jpg` |
| Clinical purpose | right M1 occlusion on CTA (ct-ischemic) |
| Creator / authors | Bushra Qureshi, Sobiya Farook, Mohammadzakir Diwan, Sheeba Philip |
| Source | “Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection”, Cureus 17:e98724 (2025), https://doi.org/10.7759/cureus.98724 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i02.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Bushra Qureshi, Sobiya Farook, Mohammadzakir Diwan, Sheeba Philip. “Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection”, Cureus 17:e98724 (2025), https://doi.org/10.7759/cureus.98724 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i02.jpg. CC BY 4.0. |
| Original title | Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection |
| Source page | https://doi.org/10.7759/cureus.98724 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i02.jpg |
| DOI | 10.7759/cureus.98724 |
| Published | 2025-12-08 |
| Retrieved | 2026-10-04T03:24Z |
| Original format | image/jpeg · 76,050 bytes · `cureus-0017-00000098724-i02.jpg` |
| Original SHA-256 | `cfa49a330fe79d73dc921938776b5a095d585e4a2d3faa594d1c08d1344919bb` |
| Original preserved | imaging/real/stroke-cta-m1-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12778373 (doi 10.7759/cureus.98724), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-ctp-mismatch-2025 — CT perfusion: core and penumbra

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-ctp-mismatch-2025.jpg` |
| Clinical purpose | core–penumbra mismatch (ct-ischemic) |
| Creator / authors | Bushra Qureshi, Sobiya Farook, Mohammadzakir Diwan, Sheeba Philip |
| Source | “Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection”, Cureus 17:e98724 (2025), https://doi.org/10.7759/cureus.98724 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i03.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Bushra Qureshi, Sobiya Farook, Mohammadzakir Diwan, Sheeba Philip. “Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection”, Cureus 17:e98724 (2025), https://doi.org/10.7759/cureus.98724 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i03.jpg. CC BY 4.0. |
| Original title | Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection |
| Source page | https://doi.org/10.7759/cureus.98724 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i03.jpg |
| DOI | 10.7759/cureus.98724 |
| Published | 2025-12-08 |
| Retrieved | 2026-10-04T03:24Z |
| Original format | image/jpeg · 109,545 bytes · `cureus-0017-00000098724-i03.jpg` |
| Original SHA-256 | `9b61c5de01033928cbceeedbe364bac3818e8d2eb5db85240729ca086f86c3ec` |
| Original preserved | imaging/real/stroke-ctp-mismatch-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12778373 (doi 10.7759/cureus.98724), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-infarct-24h-2025 — Established infarct

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-infarct-24h-2025.jpg` |
| Clinical purpose | established infarct at 24 h (ct-ischemic) |
| Creator / authors | Bushra Qureshi, Sobiya Farook, Mohammadzakir Diwan, Sheeba Philip |
| Source | “Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection”, Cureus 17:e98724 (2025), https://doi.org/10.7759/cureus.98724 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i06.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Bushra Qureshi, Sobiya Farook, Mohammadzakir Diwan, Sheeba Philip. “Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection”, Cureus 17:e98724 (2025), https://doi.org/10.7759/cureus.98724 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i06.jpg. CC BY 4.0. |
| Original title | Beating the Clock: Successful Thrombectomy 28 Hours After Stroke in a Young Adult With Internal Carotid Artery Dissection |
| Source page | https://doi.org/10.7759/cureus.98724 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12778373.1/cureus-0017-00000098724-i06.jpg |
| DOI | 10.7759/cureus.98724 |
| Published | 2025-12-08 |
| Retrieved | 2026-10-04T03:24Z |
| Original format | image/jpeg · 92,191 bytes · `cureus-0017-00000098724-i06.jpg` |
| Original SHA-256 | `7df1b57dd76ce1eca6c3fb2d406fdb23eba43436805c747b9eca09bfbdb89b84` |
| Original preserved | imaging/real/stroke-infarct-24h-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12778373 (doi 10.7759/cureus.98724), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 6 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-malignant-edema-2023 — Malignant oedema

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-malignant-edema-2023.jpg` · `imaging/real/source/stroke-malignant-edema-2023-source.jpg` |
| Clinical purpose | malignant brain oedema after MCA infarction (ct-ischemic) |
| Creator / authors | Zhang L, Li J, Yang B, Li W, Wang X, Zou M, Song H, Shi L, Duan Y. |
| Source | “The risk and outcome of malignant brain edema in post-mechanical thrombectomy: acute ischemic stroke by anterior circulation occlusion”, European journal of medical research 28:435 (2023), https://doi.org/10.1186/s40001-023-01414-x — https://pmc-oa-opendata.s3.amazonaws.com/PMC10571427.1/40001_2023_1414_Fig2_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (top row (A–C), the patient with malignant oedema); downscaled 1888×632 → 1600 px wide (aspect kept); no other crop, mirroring or filtering. |
| Required attribution | Zhang L, Li J, Yang B, Li W, Wang X, Zou M, Song H, Shi L, Duan Y.. “The risk and outcome of malignant brain edema in post-mechanical thrombectomy: acute ischemic stroke by anterior circulation occlusion”, European journal of medical research 28:435 (2023), https://doi.org/10.1186/s40001-023-01414-x — https://pmc-oa-opendata.s3.amazonaws.com/PMC10571427.1/40001_2023_1414_Fig2_HTML.jpg. CC BY 4.0. |
| Original title | The risk and outcome of malignant brain edema in post-mechanical thrombectomy: acute ischemic stroke by anterior circulation occlusion |
| Source page | https://doi.org/10.1186/s40001-023-01414-x |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC10571427.1/40001_2023_1414_Fig2_HTML.jpg |
| DOI | 10.1186/s40001-023-01414-x |
| Published | 2023-10-13 |
| Retrieved | 2026-10-04T03:24Z |
| Original format | image/jpeg · 1,222,730 bytes · `40001_2023_1414_Fig2_HTML.jpg` |
| Original SHA-256 | `4393c7a8af49ea6b4520951c2edb5ef2c2f6a7777b14c4e1674124fd163bf8ed` |
| Original preserved | imaging/real/source/stroke-malignant-edema-2023-source.jpg |
| Licence evidence | Europe PMC full text of PMC10571427 (doi 10.1186/s40001-023-01414-x), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-mass-effect-2021 — Large infarct with mass effect

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-mass-effect-2021.jpg` · `imaging/real/source/stroke-mass-effect-2021-source.jpg` |
| Clinical purpose | large MCA infarct with mass effect (ct-ischemic) |
| Creator / authors | Eskandarani R, Sahli S, Sawan S, Alsaeed A. |
| Source | “Simultaneous cardio-cerebral infarction in the coronavirus disease pandemic era: A case series”, Medicine 100:e24496 (2021), https://doi.org/10.1097/md.0000000000024496 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7850703.1/medi-100-e24496-g011.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (the CT panel); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Eskandarani R, Sahli S, Sawan S, Alsaeed A.. “Simultaneous cardio-cerebral infarction in the coronavirus disease pandemic era: A case series”, Medicine 100:e24496 (2021), https://doi.org/10.1097/md.0000000000024496 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7850703.1/medi-100-e24496-g011.jpg. CC BY 4.0. |
| Original title | Simultaneous cardio-cerebral infarction in the coronavirus disease pandemic era: A case series |
| Source page | https://doi.org/10.1097/md.0000000000024496 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC7850703.1/medi-100-e24496-g011.jpg |
| DOI | 10.1097/md.0000000000024496 |
| Published | 2021-01-01 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 169,786 bytes · `medi-100-e24496-g011.jpg` |
| Original SHA-256 | `44290ef293c7caed2f95fc6b15a0c062c87c44bab40f08bc7620404845d10139` |
| Original preserved | imaging/real/source/stroke-mass-effect-2021-source.jpg |
| Licence evidence | Europe PMC full text of PMC7850703 (doi 10.1097/md.0000000000024496), <license>: “This is an open access article distributed under the Creative Commons Attribution License 4.0 (CCBY), which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited. http://creativecommons.org/licenses/by/4.0”; Figure 11 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-hemorrhagic-transformation-2026 — Haemorrhagic transformation

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-hemorrhagic-transformation-2026.jpg` |
| Clinical purpose | haemorrhagic transformation of an infarct (ct-ischemic) |
| Creator / authors | Xu Z, Ding B, Wu J, Wang H, Chen Z, Wang Z. |
| Source | “Zero anticoagulation, zero thrombolysis: successful management of massive pulmonary embolism following hemorrhagic transformation of acute ischemic stroke: a case report”, Frontiers in cardiovascular medicine 13:1747104 (2026), https://doi.org/10.3389/fcvm.2026.1747104 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12907301.1/fcvm-13-1747104-g001.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Xu Z, Ding B, Wu J, Wang H, Chen Z, Wang Z.. “Zero anticoagulation, zero thrombolysis: successful management of massive pulmonary embolism following hemorrhagic transformation of acute ischemic stroke: a case report”, Frontiers in cardiovascular medicine 13:1747104 (2026), https://doi.org/10.3389/fcvm.2026.1747104 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12907301.1/fcvm-13-1747104-g001.jpg. CC BY 4.0. |
| Original title | Zero anticoagulation, zero thrombolysis: successful management of massive pulmonary embolism following hemorrhagic transformation of acute ischemic stroke: a case report |
| Source page | https://doi.org/10.3389/fcvm.2026.1747104 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12907301.1/fcvm-13-1747104-g001.jpg |
| DOI | 10.3389/fcvm.2026.1747104 |
| Published | 2026-02-02 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 145,095 bytes · `fcvm-13-1747104-g001.jpg` |
| Original SHA-256 | `1ba809009572df8cf216203d0665b0f0c32e12f86ba3797ebd29b9ad5e33ed76` |
| Original preserved | imaging/real/stroke-hemorrhagic-transformation-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12907301 (doi 10.3389/fcvm.2026.1747104), <license>: “This is an open-access article distributed under the terms of the Creative Commons Attribution License (CC BY) . The use, distribution or reproduction in other forums is permitted, provided the original author(s) and the copyright owner(s) are credited and that the original publication in this journ”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-hmcas-vs-cta-2022 — Hyperdense sign vs CTA

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-hmcas-vs-cta-2022.jpg` |
| Clinical purpose | hyperdense MCA sign compared with CTA (ct-ischemic) |
| Creator / authors | Kang Z, Wu L, Sun D, Zhou G, Wu X, Qiu H, Mei B, Zhang J. |
| Source | “Proximal hyperdense middle cerebral artery sign is associated with increased risk of asymptomatic hemorrhagic transformation after endovascular thrombectomy: a multicenter retrospective study”, Journal of neurology 270:1587-1599 (2022), https://doi.org/10.1007/s00415-022-11500-5 — https://pmc-oa-opendata.s3.amazonaws.com/PMC9971136.1/415_2022_11500_Fig1_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Kang Z, Wu L, Sun D, Zhou G, Wu X, Qiu H, Mei B, Zhang J.. “Proximal hyperdense middle cerebral artery sign is associated with increased risk of asymptomatic hemorrhagic transformation after endovascular thrombectomy: a multicenter retrospective study”, Journal of neurology 270:1587-1599 (2022), https://doi.org/10.1007/s00415-022-11500-5 — https://pmc-oa-opendata.s3.amazonaws.com/PMC9971136.1/415_2022_11500_Fig1_HTML.jpg. CC BY 4.0. |
| Original title | Proximal hyperdense middle cerebral artery sign is associated with increased risk of asymptomatic hemorrhagic transformation after endovascular thrombectomy: a multicenter retrospective study |
| Source page | https://doi.org/10.1007/s00415-022-11500-5 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC9971136.1/415_2022_11500_Fig1_HTML.jpg |
| DOI | 10.1007/s00415-022-11500-5 |
| Published | 2022-11-29 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 253,934 bytes · `415_2022_11500_Fig1_HTML.jpg` |
| Original SHA-256 | `f1d5bd7c33e48c51ccd31dd979796d905b4689517d2d0eff779cae85348b2ab1` |
| Original preserved | imaging/real/stroke-hmcas-vs-cta-2022.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC9971136 (doi 10.1007/s00415-022-11500-5), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## stroke-ctp-m1-mirza — Perfusion: delayed but preserved volume

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/stroke-ctp-m1-mirza.jpg` · `imaging/real/source/stroke-ctp-m1-mirza-source.png` |
| Clinical purpose | perfusion deficit in M1 occlusion (ct-ischemic) |
| Creator / authors | edit Shazia Mirza and Sankalp Gokhale See also source article for additional image creators. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:CT_perfusion_in_M1_artery_occlusion.png |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0 |
| Modifications | Converted to JPEG; padded by one black pixel to even dimensions; no crop, mirroring or filtering. |
| Required attribution | edit Shazia Mirza and Sankalp Gokhale See also source article for additional image creators.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:CT_perfusion_in_M1_artery_occlusion.png. CC BY 4.0. |
| Original title | edit CT perfusion in M1 artery occlusion.png. For context, see Wikipedia:Imaging in stroke . |
| Source page | https://commons.wikimedia.org/wiki/File:CT_perfusion_in_M1_artery_occlusion.png |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/7/7e/CT_perfusion_in_M1_artery_occlusion.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2016-07-25 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/png · 470,221 bytes · `CT perfusion in M1 artery occlusion.png` |
| Original SHA-256 | `f4659d336e925f5a2f4b780441c7f914ce2069806cbeb5b864ed9809abd53196` |
| Original preserved | imaging/real/source/stroke-ctp-m1-mirza-source.png |
| Licence evidence | Wikimedia Commons API extmetadata for File:CT perfusion in M1 artery occlusion.png: LicenseShortName = “CC BY 4.0”, UsageTerms = “Creative Commons Attribution 4.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ACT+perfusion+in+M1+artery+occlusion.png&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ich-swirl-2012 — Swirl sign

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-swirl-2012.jpg` |
| Clinical purpose | swirl sign in acute intracerebral haemorrhage (ct-ich) |
| Creator / authors | Selariu E, Zia E, Brizzi M, Abul-Kasim K. |
| Source | “Swirl sign in intracerebral haemorrhage: definition, prevalence, reliability and prognostic value”, BMC neurology 12:109 (2012), https://doi.org/10.1186/1471-2377-12-109 — https://pmc-oa-opendata.s3.amazonaws.com/PMC3517489.1/1471-2377-12-109-1.jpg |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Selariu E, Zia E, Brizzi M, Abul-Kasim K.. “Swirl sign in intracerebral haemorrhage: definition, prevalence, reliability and prognostic value”, BMC neurology 12:109 (2012), https://doi.org/10.1186/1471-2377-12-109 — https://pmc-oa-opendata.s3.amazonaws.com/PMC3517489.1/1471-2377-12-109-1.jpg. CC BY 2.0. |
| Original title | Swirl sign in intracerebral haemorrhage: definition, prevalence, reliability and prognostic value |
| Source page | https://doi.org/10.1186/1471-2377-12-109 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC3517489.1/1471-2377-12-109-1.jpg |
| DOI | 10.1186/1471-2377-12-109 |
| Published | 2012-09-26 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 80,630 bytes · `1471-2377-12-109-1.jpg` |
| Original SHA-256 | `24549e906b8c978a33fe4c25c018b340f2fc8255f70b4fd298e236f7e0c4dc8e` |
| Original preserved | imaging/real/ich-swirl-2012.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC3517489 (doi 10.1186/1471-2377-12-109), <license>: “This is an Open Access article distributed under the terms of the Creative Commons Attribution License ( http://creativecommons.org/licenses/by/2.0 ), which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ich-spot-sign-2016 — Spot sign

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-spot-sign-2016.jpg` |
| Clinical purpose | spot sign (ct-ich) |
| Creator / authors | Airton Leonardo de Oliveira Manoel, Alberto Goffi, Fernando Godinho Zampieri, David Turkel-Parrella, Abhijit Duggal, Thomas R. Marotta, R. Loch Macdonald, Simon Abrahamson |
| Source | “The critical care management of spontaneous intracranial hemorrhage: a contemporary review”, Critical care (London, England) 20:272 (2016), https://doi.org/10.1186/s13054-016-1432-0 — https://pmc-oa-opendata.s3.amazonaws.com/PMC5027096.1/13054_2016_1432_Fig3_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Airton Leonardo de Oliveira Manoel, Alberto Goffi, Fernando Godinho Zampieri, David Turkel-Parrella, Abhijit Duggal, Thomas R. Marotta, R. Loch Macdonald, Simon Abrahamson. “The critical care management of spontaneous intracranial hemorrhage: a contemporary review”, Critical care (London, England) 20:272 (2016), https://doi.org/10.1186/s13054-016-1432-0 — https://pmc-oa-opendata.s3.amazonaws.com/PMC5027096.1/13054_2016_1432_Fig3_HTML.jpg. CC BY 4.0. |
| Original title | The critical care management of spontaneous intracranial hemorrhage: a contemporary review |
| Source page | https://doi.org/10.1186/s13054-016-1432-0 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC5027096.1/13054_2016_1432_Fig3_HTML.jpg |
| DOI | 10.1186/s13054-016-1432-0 |
| Published | 2016-09-18 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 38,692 bytes · `13054_2016_1432_Fig3_HTML.jpg` |
| Original SHA-256 | `20c920d88a63506503f52ef296669c09557ece851ae0b775056f273732d8f640` |
| Original preserved | imaging/real/ich-spot-sign-2016.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC5027096 (doi 10.1186/s13054-016-1432-0), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is distributed under the terms of the Creative Commons Attribution 4.0 International License ( http://creativecommons.org/licenses/by/4.0/ ), which permits unrestricted use, distribution, and reproduction in any medium, provided y”; Fig. 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ich-deep-locations-2016 — Hypertensive haemorrhage sites

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-deep-locations-2016.jpg` |
| Clinical purpose | typical sites of hypertensive haemorrhage (ct-ich) |
| Creator / authors | Airton Leonardo de Oliveira Manoel, Alberto Goffi, Fernando Godinho Zampieri, David Turkel-Parrella, Abhijit Duggal, Thomas R. Marotta, R. Loch Macdonald, Simon Abrahamson |
| Source | “The critical care management of spontaneous intracranial hemorrhage: a contemporary review”, Critical care (London, England) 20:272 (2016), https://doi.org/10.1186/s13054-016-1432-0 — https://pmc-oa-opendata.s3.amazonaws.com/PMC5027096.1/13054_2016_1432_Fig2_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Airton Leonardo de Oliveira Manoel, Alberto Goffi, Fernando Godinho Zampieri, David Turkel-Parrella, Abhijit Duggal, Thomas R. Marotta, R. Loch Macdonald, Simon Abrahamson. “The critical care management of spontaneous intracranial hemorrhage: a contemporary review”, Critical care (London, England) 20:272 (2016), https://doi.org/10.1186/s13054-016-1432-0 — https://pmc-oa-opendata.s3.amazonaws.com/PMC5027096.1/13054_2016_1432_Fig2_HTML.jpg. CC BY 4.0. |
| Original title | The critical care management of spontaneous intracranial hemorrhage: a contemporary review |
| Source page | https://doi.org/10.1186/s13054-016-1432-0 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC5027096.1/13054_2016_1432_Fig2_HTML.jpg |
| DOI | 10.1186/s13054-016-1432-0 |
| Published | 2016-09-18 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 85,243 bytes · `13054_2016_1432_Fig2_HTML.jpg` |
| Original SHA-256 | `899b78b4966406bbcede638f5eec60ca2a38a1015598be50760204f179c0bd13` |
| Original preserved | imaging/real/ich-deep-locations-2016.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC5027096 (doi 10.1186/s13054-016-1432-0), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is distributed under the terms of the Creative Commons Attribution 4.0 International License ( http://creativecommons.org/licenses/by/4.0/ ), which permits unrestricted use, distribution, and reproduction in any medium, provided y”; Fig. 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ich-ivh-commons — Ventricular extension

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-ivh-commons.jpg` |
| Clinical purpose | intracerebral haemorrhage with intraventricular extension (ct-ich) |
| Creator / authors | Glitzy queen00 at English Wikipedia |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrage_(CT_scan).jpg |
| Licence | Public Domain — https://creativecommons.org/publicdomain/mark/1.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Glitzy queen00 at English Wikipedia. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrage_(CT_scan).jpg. Public Domain. |
| Original title | This image shows an Intracerebral and Intraventricular haemorrhage of a young woman. The woman was one week post partum, with no known trauma involved. |
| Source page | https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrage_(CT_scan).jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/1/1c/Intracerebral_hemorrage_%28CT_scan%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2007-10-22 16:03:49 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 209,875 bytes · `Intracerebral hemorrage (CT scan).jpg` |
| Original SHA-256 | `8bf0c53b536fea70a1123eb268a0947f6cb372c11e163c97148da44ec4c8054e` |
| Original preserved | imaging/real/ich-ivh-commons.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Intracerebral hemorrage (CT scan).jpg: LicenseShortName = “Public domain”, UsageTerms = “Public domain” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AIntracerebral+hemorrage+%28CT+scan%29.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ich-thalamic-hydro-yadav — Thalamic bleed, hydrocephalus

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-thalamic-hydro-yadav.jpg` |
| Clinical purpose | thalamic haemorrhage with hydrocephalus (ct-ich) |
| Creator / authors | Yadav YR, Mukerji G, Shenoy R, Basoor A, Jain G, Nelson A |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrhage.jpg |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Yadav YR, Mukerji G, Shenoy R, Basoor A, Jain G, Nelson A. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrhage.jpg. CC BY 2.0. |
| Original title | CT scan of intracerebral hemorrhage. Caption reads, "Pre operative CT scan. Representative pre-operative CT scan of a patient showing a thalamic haemorrhage wit |
| Source page | https://commons.wikimedia.org/wiki/File:Intracerebral_hemorrhage.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/e/e4/Intracerebral_hemorrhage.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | Published: 4 January 2007 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 42,094 bytes · `Intracerebral hemorrhage.jpg` |
| Original SHA-256 | `bfe8f92d6717607b11d9cdc63571662a21fbfeb7b3515e35968ce3d1d8e73dc8` |
| Original preserved | imaging/real/ich-thalamic-hydro-yadav.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Intracerebral hemorrhage.jpg: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AIntracerebral+hemorrhage.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ich-cerebellar-yadav — Cerebellar bleed

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-cerebellar-yadav.jpg` |
| Clinical purpose | posterior fossa haemorrhage with hydrocephalus (ct-ich) |
| Creator / authors | Yadav YR, Mukerji G, Shenoy R, Basoor A, Jain G, Nelson A |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Posterior_fossa_hemorrhage.jpg |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Yadav YR, Mukerji G, Shenoy R, Basoor A, Jain G, Nelson A. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Posterior_fossa_hemorrhage.jpg. CC BY 2.0. |
| Original title | CT scan of intracerebral hemorrhage. Caption reads, "Pre operative CT scan. Representative pre-operative CT scan of a patient showing a posterior fossa haemorrh |
| Source page | https://commons.wikimedia.org/wiki/File:Posterior_fossa_hemorrhage.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/b/b0/Posterior_fossa_hemorrhage.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | Published: 4 January 2007 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 36,978 bytes · `Posterior fossa hemorrhage.jpg` |
| Original SHA-256 | `952f586b1d261c0a13c3391c7f7e6597d1d03793106c4f4faf854642fcab05f6` |
| Original preserved | imaging/real/ich-cerebellar-yadav.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Posterior fossa hemorrhage.jpg: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3APosterior+fossa+hemorrhage.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ich-sah-to-iph-2010 — Rebleed in 12 hours

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ich-sah-to-iph-2010.jpg` |
| Clinical purpose | rebleeding: subarachnoid then intraparenchymal haemorrhage (ct-ich) |
| Creator / authors | Isabel Kuo, Theodore Long, Nathan Nguyen, Bharat Chaudry, Michael Karp, Nerses Sanossian |
| Source | “Ruptured intracranial mycotic aneurysm in infective endocarditis: a natural history”, Case reports in medicine 2010:168408 (2010), https://doi.org/10.1155/2010/168408 — https://pmc-oa-opendata.s3.amazonaws.com/PMC2946581.1/CRM2010-168408.003.jpg |
| Licence | CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Isabel Kuo, Theodore Long, Nathan Nguyen, Bharat Chaudry, Michael Karp, Nerses Sanossian. “Ruptured intracranial mycotic aneurysm in infective endocarditis: a natural history”, Case reports in medicine 2010:168408 (2010), https://doi.org/10.1155/2010/168408 — https://pmc-oa-opendata.s3.amazonaws.com/PMC2946581.1/CRM2010-168408.003.jpg. CC BY 3.0. |
| Original title | Ruptured intracranial mycotic aneurysm in infective endocarditis: a natural history |
| Source page | https://doi.org/10.1155/2010/168408 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC2946581.1/CRM2010-168408.003.jpg |
| DOI | 10.1155/2010/168408 |
| Published | 2010-09-22 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 136,413 bytes · `CRM2010-168408.003.jpg` |
| Original SHA-256 | `5481ea94093c9bd081902ea3ef13aa176b1eb14bc16f1397d1c91c92fc58b18b` |
| Original preserved | imaging/real/ich-sah-to-iph-2010.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC2946581 (doi 10.1155/2010/168408), <license>: “https://creativecommons.org/licenses/by/3.0/ This is an open access article distributed under the Creative Commons Attribution License, which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## sah-ct-mirza — Subarachnoid blood

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/sah-ct-mirza.jpg` · `imaging/real/source/sah-ct-mirza-source.png` |
| Clinical purpose | subarachnoid haemorrhage (ct-ich) |
| Creator / authors | edit Shazia Mirza and Sankalp Gokhale See also source article for additional image creators. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:CT_of_subarachnoid_hemorrhage.png |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0 |
| Modifications | Converted to JPEG; padded by one black pixel to even dimensions; no crop, mirroring or filtering. |
| Required attribution | edit Shazia Mirza and Sankalp Gokhale See also source article for additional image creators.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:CT_of_subarachnoid_hemorrhage.png. CC BY 4.0. |
| Original title | edit CT of subarachnoid hemorrhage.png. For context, see Wikipedia:Imaging in stroke . |
| Source page | https://commons.wikimedia.org/wiki/File:CT_of_subarachnoid_hemorrhage.png |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/3/3a/CT_of_subarachnoid_hemorrhage.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2016-07-25 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/png · 136,846 bytes · `CT of subarachnoid hemorrhage.png` |
| Original SHA-256 | `8e164e4819fc62f8a78c530757dba398f70cc4e86d5c79724cec4a0a0f5a4cc8` |
| Original preserved | imaging/real/source/sah-ct-mirza-source.png |
| Licence evidence | Wikimedia Commons API extmetadata for File:CT of subarachnoid hemorrhage.png: LicenseShortName = “CC BY 4.0”, UsageTerms = “Creative Commons Attribution 4.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ACT+of+subarachnoid+hemorrhage.png&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## cxr-chf-haggstrom — Cardiogenic pulmonary oedema

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-chf-haggstrom.jpg` |
| Clinical purpose | congestive heart failure (cardiogenic pulmonary oedema) (cxr) |
| Creator / authors | Mikael Häggström |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Chest_radiograph_of_a_lung_with_Kerley_B_lines.jpg |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mikael Häggström. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Chest_radiograph_of_a_lung_with_Kerley_B_lines.jpg. CC0. |
| Original title | edit Chest radiograph of an 83 year old man with previous coronary artery bypass surgery and multiple percutaneous coronary interventions , now presenting with  |
| Source page | https://commons.wikimedia.org/wiki/File:Chest_radiograph_of_a_lung_with_Kerley_B_lines.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/c/ca/Chest_radiograph_of_a_lung_with_Kerley_B_lines.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2017-07-13 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 338,551 bytes · `Chest radiograph of a lung with Kerley B lines.jpg` |
| Original SHA-256 | `0ad260f0645da04684501d1576510d82fabadb0e002a36cabfa30a6ee1c65334` |
| Original preserved | imaging/real/cxr-chf-haggstrom.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Chest radiograph of a lung with Kerley B lines.jpg: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AChest+radiograph+of+a+lung+with+Kerley+B+lines.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## cxr-hps-edema-cdc — Permeability oedema

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-hps-edema-cdc.jpg` |
| Clinical purpose | non-cardiogenic pulmonary oedema with effusions (hantavirus) (cxr) |
| Creator / authors | CDC/ D. Loren Ketai, M.D. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:6077_lores.jpg |
| Licence | Public Domain — https://creativecommons.org/publicdomain/mark/1.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | CDC/ D. Loren Ketai, M.D.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:6077_lores.jpg. Public Domain. |
| Original title | This AP chest x-ray reveals the mid-staged bilateral pulmonary effusion due to hantavirus pulmonary syndrome, or HPS. The radiological evolution of HPS begins w |
| Source page | https://commons.wikimedia.org/wiki/File:6077_lores.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/a/ae/6077_lores.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 1994 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 35,119 bytes · `6077 lores.jpg` |
| Original SHA-256 | `ada8a9172bac605643d9534cde679fded744cf23a087a0babdba0d46a427bee0` |
| Original preserved | imaging/real/cxr-hps-edema-cdc.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:6077 lores.jpg: LicenseShortName = “Public domain”, UsageTerms = “Public domain” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3A6077+lores.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## cxr-ards-2019 — ARDS

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-ards-2019.jpg` |
| Clinical purpose | acute respiratory distress syndrome (cxr) |
| Creator / authors | Sam Ngu, Sami Pervaiz, Akshay Avula, Michel Chalhoub |
| Source | “Rhinovirus-induced Rapidly Progressing Acute Respiratory Distress Syndrome in an Immunocompetent Host”, Cureus 11:e3997 (2019), https://doi.org/10.7759/cureus.3997 — https://pmc-oa-opendata.s3.amazonaws.com/PMC6443533.1/cureus-0011-00000003997-i02.jpg |
| Licence | CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Sam Ngu, Sami Pervaiz, Akshay Avula, Michel Chalhoub. “Rhinovirus-induced Rapidly Progressing Acute Respiratory Distress Syndrome in an Immunocompetent Host”, Cureus 11:e3997 (2019), https://doi.org/10.7759/cureus.3997 — https://pmc-oa-opendata.s3.amazonaws.com/PMC6443533.1/cureus-0011-00000003997-i02.jpg. CC BY 3.0. |
| Original title | Rhinovirus-induced Rapidly Progressing Acute Respiratory Distress Syndrome in an Immunocompetent Host |
| Source page | https://doi.org/10.7759/cureus.3997 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC6443533.1/cureus-0011-00000003997-i02.jpg |
| DOI | 10.7759/cureus.3997 |
| Published | 2019-02-01 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 60,295 bytes · `cureus-0011-00000003997-i02.jpg` |
| Original SHA-256 | `56484391c09c793de65770ed2ca3f49437f97c56c414aa3629069a6a54daacb1` |
| Original preserved | imaging/real/cxr-ards-2019.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC6443533 (doi 10.7759/cureus.3997), <license>: “https://creativecommons.org/licenses/by/3.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-left-collapse-child-2013 — Whole-lung collapse (child)

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-left-collapse-child-2013.jpg` |
| Clinical purpose | complete left lung collapse (cxr) |
| Creator / authors | Christoph M Rüegger, Walter Bär, Peter Iseli |
| Source | “Simultaneous atelectasis in human bocavirus infected monozygotic twins: was it plastic bronchitis?”, BMC pediatrics 13:209 (2013), https://doi.org/10.1186/1471-2431-13-209 — https://pmc-oa-opendata.s3.amazonaws.com/PMC3878367.1/1471-2431-13-209-1.jpg |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Christoph M Rüegger, Walter Bär, Peter Iseli. “Simultaneous atelectasis in human bocavirus infected monozygotic twins: was it plastic bronchitis?”, BMC pediatrics 13:209 (2013), https://doi.org/10.1186/1471-2431-13-209 — https://pmc-oa-opendata.s3.amazonaws.com/PMC3878367.1/1471-2431-13-209-1.jpg. CC BY 2.0. |
| Original title | Simultaneous atelectasis in human bocavirus infected monozygotic twins: was it plastic bronchitis? |
| Source page | https://doi.org/10.1186/1471-2431-13-209 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC3878367.1/1471-2431-13-209-1.jpg |
| DOI | 10.1186/1471-2431-13-209 |
| Published | 2013-12-18 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 58,576 bytes · `1471-2431-13-209-1.jpg` |
| Original SHA-256 | `9b11009a4b1eca55b24d65aabb27be61b6ecfecdcf79f210552a3fc51960112d` |
| Original preserved | imaging/real/cxr-left-collapse-child-2013.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC3878367 (doi 10.1186/1471-2431-13-209), <license>: “https://creativecommons.org/licenses/by/2.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License ( http://creativecommons.org/licenses/by/2.0 ), which permits unrestricted use, distribution, and reproduction in any medium, provided the original work”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-collapse-before-after-2021 — Collapse, then re-expansion

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-collapse-before-after-2021.jpg` · `imaging/real/source/cxr-collapse-before-after-2021-source.jpg` |
| Clinical purpose | total right lung collapse, before and after bronchoscopy (cxr) |
| Creator / authors | N. Benkalfate, S. Dirou, P. Germaud, C. Defrance, A. Cavailles, T. Pigeanne, M. Robert, T. Madjer, F. Corne, L. Cellerin, C. Sagan, F. X. Blanc |
| Source | “Total unilateral pulmonary collapse secondary to allergic bronchopulmonary aspergillosis: a case series of an unusual cause of complete atelectasis”, BMC pulmonary medicine 21:425 (2021), https://doi.org/10.1186/s12890-021-01789-9 — https://pmc-oa-opendata.s3.amazonaws.com/PMC8709957.1/12890_2021_1789_Fig1_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (bottom row (E, F)); downscaled 1749×830 → 1600 px wide (aspect kept); no other crop, mirroring or filtering. |
| Required attribution | N. Benkalfate, S. Dirou, P. Germaud, C. Defrance, A. Cavailles, T. Pigeanne, M. Robert, T. Madjer, F. Corne, L. Cellerin, C. Sagan, F. X. Blanc. “Total unilateral pulmonary collapse secondary to allergic bronchopulmonary aspergillosis: a case series of an unusual cause of complete atelectasis”, BMC pulmonary medicine 21:425 (2021), https://doi.org/10.1186/s12890-021-01789-9 — https://pmc-oa-opendata.s3.amazonaws.com/PMC8709957.1/12890_2021_1789_Fig1_HTML.jpg. CC BY 4.0. |
| Original title | Total unilateral pulmonary collapse secondary to allergic bronchopulmonary aspergillosis: a case series of an unusual cause of complete atelectasis |
| Source page | https://doi.org/10.1186/s12890-021-01789-9 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC8709957.1/12890_2021_1789_Fig1_HTML.jpg |
| DOI | 10.1186/s12890-021-01789-9 |
| Published | 2021-12-24 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 842,290 bytes · `12890_2021_1789_Fig1_HTML.jpg` |
| Original SHA-256 | `bbfadcf12eaa176c0e83860a5e5f3949a9c20886abcf3532613c0a3c8bdbea30` |
| Original preserved | imaging/real/source/cxr-collapse-before-after-2021-source.jpg |
| Licence evidence | Europe PMC full text of PMC8709957 (doi 10.1186/s12890-021-01789-9), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original auth”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-massive-effusion-2010 — Massive effusion

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-massive-effusion-2010.jpg` · `imaging/real/source/cxr-massive-effusion-2010-source.jpg` |
| Clinical purpose | massive left pleural effusion with mediastinal shift (cxr) |
| Creator / authors | Maounis N, Chorti M, Legaki S, Ellina E, Emmanouilidou A, Demonakou M, Tsiafaki X. |
| Source | “Metastasis to the breast from an adenocarcinoma of the lung with extensive micropapillary component: a case report and review of the literature”, Diagnostic pathology 5:82 (2010), https://doi.org/10.1186/1746-1596-5-82 — https://pmc-oa-opendata.s3.amazonaws.com/PMC3018363.1/1746-1596-5-82-1.jpg |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (panel (a), the chest X-ray); no other crop, mirroring or filtering. |
| Required attribution | Maounis N, Chorti M, Legaki S, Ellina E, Emmanouilidou A, Demonakou M, Tsiafaki X.. “Metastasis to the breast from an adenocarcinoma of the lung with extensive micropapillary component: a case report and review of the literature”, Diagnostic pathology 5:82 (2010), https://doi.org/10.1186/1746-1596-5-82 — https://pmc-oa-opendata.s3.amazonaws.com/PMC3018363.1/1746-1596-5-82-1.jpg. CC BY 2.0. |
| Original title | Metastasis to the breast from an adenocarcinoma of the lung with extensive micropapillary component: a case report and review of the literature |
| Source page | https://doi.org/10.1186/1746-1596-5-82 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC3018363.1/1746-1596-5-82-1.jpg |
| DOI | 10.1186/1746-1596-5-82 |
| Published | 2010-12-17 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 55,994 bytes · `1746-1596-5-82-1.jpg` |
| Original SHA-256 | `1332d0ba04219544818c200c15e6121ca311b19f88dd49f2971af905ba71e6bd` |
| Original preserved | imaging/real/source/cxr-massive-effusion-2010-source.jpg |
| Licence evidence | Europe PMC full text of PMC3018363 (doi 10.1186/1746-1596-5-82), <license>: “This is an Open Access article distributed under the terms of the Creative Commons Attribution License (<url>http://creativecommons.org/licenses/by/2.0</url>), which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## aaa-us-sagittal-haggstrom — AAA, long axis

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/aaa-us-sagittal-haggstrom.jpg` |
| Clinical purpose | abdominal aortic aneurysm (aorta-us) |
| Creator / authors | Mikael Häggström, M.D. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_sagittal_plane.jpg |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mikael Häggström, M.D.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_sagittal_plane.jpg. CC0. |
| Original title | Abdominal ultrasonography of a 78 year old woman in the sagittal plane , showing an abdominal aortic aneurysm . Sagittal plane With anteroposterior measure (das |
| Source page | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_sagittal_plane.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/9/99/Ultrasonography_of_abdominal_aortic_aneurysm_in_sagittal_plane.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2018-12-10 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 65,178 bytes · `Ultrasonography of abdominal aortic aneurysm in sagittal plane.jpg` |
| Original SHA-256 | `1ea9cc5c4f10da09d8988c01087ce925bdfccdaf6c63de3cb0f76d5d97c33188` |
| Original preserved | imaging/real/aaa-us-sagittal-haggstrom.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Ultrasonography of abdominal aortic aneurysm in sagittal plane.jpg: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AUltrasonography+of+abdominal+aortic+aneurysm+in+sagittal+plane.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## aaa-us-axial-haggstrom — AAA, short axis

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/aaa-us-axial-haggstrom.jpg` |
| Clinical purpose | abdominal aortic aneurysm (aorta-us) |
| Creator / authors | Mikael Häggström, M.D. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_axial_plane.jpg |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mikael Häggström, M.D.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_axial_plane.jpg. CC0. |
| Original title | Abdominal ultrasonography of a 78 year old woman in the axial plane , showing an abdominal aortic aneurysm . Sagittal plane With anteroposterior measure (dashed |
| Source page | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_axial_plane.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/d/d6/Ultrasonography_of_abdominal_aortic_aneurysm_in_axial_plane.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2018-12-10 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 62,144 bytes · `Ultrasonography of abdominal aortic aneurysm in axial plane.jpg` |
| Original SHA-256 | `098ead3e995cb01e93da80bcaee2148ea845c81d4e6f6a4e6fb68278173a7e75` |
| Original preserved | imaging/real/aaa-us-axial-haggstrom.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Ultrasonography of abdominal aortic aneurysm in axial plane.jpg: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AUltrasonography+of+abdominal+aortic+aneurysm+in+axial+plane.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## aaa-us-thrombus-haggstrom — AAA with mural thrombus

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/aaa-us-thrombus-haggstrom.jpg` |
| Clinical purpose | abdominal aortic aneurysm (aorta-us) |
| Creator / authors | Mikael Häggström, M.D. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_with_mural_thrombus.jpg |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mikael Häggström, M.D.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_with_mural_thrombus.jpg. CC0. |
| Original title | Abdominal ultrasonography of and abdominal aortic aneurysm with mural thrombus. |
| Source page | https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_with_mural_thrombus.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/f/fb/Ultrasonography_of_abdominal_aortic_aneurysm_with_mural_thrombus.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2019-01-14 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | image/jpeg · 55,068 bytes · `Ultrasonography of abdominal aortic aneurysm with mural thrombus.jpg` |
| Original SHA-256 | `f383eefbda914dd321cf4f2943f0fd5ad154c0f5cc7b7eb9fdea67a01932e6df` |
| Original preserved | imaging/real/aaa-us-thrombus-haggstrom.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Ultrasonography of abdominal aortic aneurysm with mural thrombus.jpg: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AUltrasonography+of+abdominal+aortic+aneurysm+with+mural+thrombus.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## lus-blines-gargani — Interstitial syndrome

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-blines-gargani.mp4` · `imaging/real/lus-blines-gargani.webm` · `imaging/real/lus-blines-gargani.jpg` · `imaging/real/source/lus-blines-gargani-source.ogv` |
| Clinical purpose | blines (lus) |
| Creator / authors | Gargani L |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 800×652, 29.0 fps, 2.966 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; audio none in the source; no crop, mirroring, speed change or other filtering. Poster = frame at 1.0 s. |
| Required attribution | Gargani L. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv. CC BY 2.0. |
| Original title | Sonographic pattern of interstitial syndrome: multiple B-lines originate from the pleural line. |
| Source page | https://commons.wikimedia.org/wiki/File:Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/e/e4/Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2011 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | video/ogg · 1,109,464 bytes · `Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv` |
| Original SHA-256 | `ba2b0c056b92d03cffb72f72f18da935a126e390e129b888e928dc72fe547e83` |
| Original preserved | imaging/real/source/lus-blines-gargani-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Lung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ALung-ultrasound-a-new-tool-for-the-cardiologist-1476-7120-9-6-S2.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## lus-progression-h7n9 — From A-lines to white lung

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-progression-h7n9.mp4` · `imaging/real/lus-progression-h7n9.webm` · `imaging/real/lus-progression-h7n9.jpg` · `imaging/real/source/lus-progression-h7n9-source.ogv` |
| Clinical purpose | progression (lus) |
| Creator / authors | Tsai N, Ngai C, Mok K, Tsung J |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Lung-ultrasound-imaging-in-avian-influenza-A-(H7N9)-respiratory-failure-2036-7902-6-6-S1.ogv |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0 |
| Modifications | Original OGV (theora, 720×480, 29.97 fps, 35.127 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; audio removed; no crop, mirroring, speed change or other filtering. Poster = frame at 1.0 s. |
| Required attribution | Tsai N, Ngai C, Mok K, Tsung J. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Lung-ultrasound-imaging-in-avian-influenza-A-(H7N9)-respiratory-failure-2036-7902-6-6-S1.ogv. CC BY 4.0. |
| Original title | Video S1. Series of video clips depicting progression of A-lines to B-lines, to confluent B-lines, to white lung (ARDS). |
| Source page | https://commons.wikimedia.org/wiki/File:Lung-ultrasound-imaging-in-avian-influenza-A-(H7N9)-respiratory-failure-2036-7902-6-6-S1.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/1/11/Lung-ultrasound-imaging-in-avian-influenza-A-%28H7N9%29-respiratory-failure-2036-7902-6-6-S1.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2014 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | video/ogg · 11,765,246 bytes · `Lung-ultrasound-imaging-in-avian-influenza-A-(H7N9)-respiratory-failure-2036-7902-6-6-S1.ogv` |
| Original SHA-256 | `7768c75e9bddfb73825ebeeabb34883b7ed67c46a8fb9240997b57474c121636` |
| Original preserved | imaging/real/source/lus-progression-h7n9-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Lung-ultrasound-imaging-in-avian-influenza-A-(H7N9)-respiratory-failure-2036-7902-6-6-S1.ogv: LicenseShortName = “CC BY 4.0”, UsageTerms = “Creative Commons Attribution 4.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ALung-ultrasound-imaging-in-avian-influenza-A-%28H7N9%29-respiratory-failure-2036-7902-6-6-S1.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## lus-hepatisation-gillman — Hepatised lung

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-hepatisation-gillman.mp4` · `imaging/real/lus-hepatisation-gillman.webm` · `imaging/real/lus-hepatisation-gillman.jpg` · `imaging/real/source/lus-hepatisation-gillman-source.ogv` |
| Clinical purpose | consolidation (lus) |
| Creator / authors | Gillman L, Kirkpatrick A |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 640×480, 30.0 fps, 10.0 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; audio none in the source; no crop, mirroring, speed change or other filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Kirkpatrick A. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv. CC BY 2.0. |
| Original title | Lung Consolidation. Real time lung ultrasound video illustrating lung consolidation, highlighted by hepatisation of the lung (lung tissue appears similar densit |
| Source page | https://commons.wikimedia.org/wiki/File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/5/53/Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2012 |
| Retrieved | 2026-10-04T03:25Z |
| Original format | video/ogg · 1,686,655 bytes · `Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv` |
| Original SHA-256 | `e735389f555584aec9e392ee21f8de0242627d4186ca2ed413d709b278fa77b5` |
| Original preserved | imaging/real/source/lus-hepatisation-gillman-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Portable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3APortable-bedside-ultrasound-the-visual-stethoscope-of-the-21st-century-1757-7241-20-18-S5.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## cxr-mainstem-right-ebi-2019 — Right mainstem (endobronchial) intubation

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-mainstem-right-ebi-2019.jpg` · `imaging/real/source/cxr-mainstem-right-ebi-2019-source.jpg` |
| Clinical purpose | mainstem_right (cxr) |
| Creator / authors | Hernandez Padilla AC, Trampont T, Lafon T, Daix T, Cailloce D, Barraud O, Dalmay F, Vignon P, François B. |
| Source | “Is prehospital endobronchial intubation a risk factor for subsequent ventilator associated pneumonia? A retrospective analysis”, PloS one 14:e0217466 (2019), https://doi.org/10.1371/journal.pone.0217466 — https://pmc-oa-opendata.s3.amazonaws.com/PMC6532927.1/pone.0217466.g002.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.17–0.57, y 0.04–0.51 of the original); no other crop, mirroring or filtering. |
| Required attribution | Hernandez Padilla AC, Trampont T, Lafon T, Daix T, Cailloce D, Barraud O, Dalmay F, Vignon P, François B.. “Is prehospital endobronchial intubation a risk factor for subsequent ventilator associated pneumonia? A retrospective analysis”, PloS one 14:e0217466 (2019), https://doi.org/10.1371/journal.pone.0217466 — https://pmc-oa-opendata.s3.amazonaws.com/PMC6532927.1/pone.0217466.g002.jpg. CC BY 4.0. |
| Original title | Is prehospital endobronchial intubation a risk factor for subsequent ventilator associated pneumonia? A retrospective analysis |
| Source page | https://doi.org/10.1371/journal.pone.0217466 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC6532927.1/pone.0217466.g002.jpg |
| DOI | 10.1371/journal.pone.0217466 |
| Published | 2019-05-23 |
| Retrieved | 2026-10-09T15:42Z |
| Original format | image/jpeg · 84,003 bytes · `pone.0217466.g002.jpg` |
| Original SHA-256 | `0b3a19991f4b6b71c963cd7afa2384963186a50dadc8c225d3d49294e459165f` |
| Original preserved | imaging/real/source/cxr-mainstem-right-ebi-2019-source.jpg |
| Licence evidence | Europe PMC full text of PMC6532927 (doi 10.1371/journal.pone.0217466), <license>: “This is an open access article distributed under the terms of the Creative Commons Attribution License , which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Fig 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-ett-ok-ebi-2019 — Endotracheal tube in good position

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-ett-ok-ebi-2019.jpg` · `imaging/real/source/cxr-ett-ok-ebi-2019-source.jpg` |
| Clinical purpose | ett_ok (cxr) |
| Creator / authors | Hernandez Padilla AC, Trampont T, Lafon T, Daix T, Cailloce D, Barraud O, Dalmay F, Vignon P, François B. |
| Source | “Is prehospital endobronchial intubation a risk factor for subsequent ventilator associated pneumonia? A retrospective analysis”, PloS one 14:e0217466 (2019), https://doi.org/10.1371/journal.pone.0217466 — https://pmc-oa-opendata.s3.amazonaws.com/PMC6532927.1/pone.0217466.g002.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.17–0.57, y 0.55–1.00 of the original); no other crop, mirroring or filtering. |
| Required attribution | Hernandez Padilla AC, Trampont T, Lafon T, Daix T, Cailloce D, Barraud O, Dalmay F, Vignon P, François B.. “Is prehospital endobronchial intubation a risk factor for subsequent ventilator associated pneumonia? A retrospective analysis”, PloS one 14:e0217466 (2019), https://doi.org/10.1371/journal.pone.0217466 — https://pmc-oa-opendata.s3.amazonaws.com/PMC6532927.1/pone.0217466.g002.jpg. CC BY 4.0. |
| Original title | Is prehospital endobronchial intubation a risk factor for subsequent ventilator associated pneumonia? A retrospective analysis |
| Source page | https://doi.org/10.1371/journal.pone.0217466 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC6532927.1/pone.0217466.g002.jpg |
| DOI | 10.1371/journal.pone.0217466 |
| Published | 2019-05-23 |
| Retrieved | 2026-10-09T15:42Z |
| Original format | image/jpeg · 84,003 bytes · `pone.0217466.g002.jpg` |
| Original SHA-256 | `0b3a19991f4b6b71c963cd7afa2384963186a50dadc8c225d3d49294e459165f` |
| Original preserved | imaging/real/source/cxr-ett-ok-ebi-2019-source.jpg |
| Licence evidence | Europe PMC full text of PMC6532927 (doi 10.1371/journal.pone.0217466), <license>: “This is an open access article distributed under the terms of the Creative Commons Attribution License , which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Fig 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-normal-pa-haggstrom — Normal chest radiograph (PA)

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-normal-pa-haggstrom.jpg` |
| Clinical purpose | cxr_normal (cxr) |
| Creator / authors | Mikael Häggström |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mikael Häggström. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg. CC0. |
| Original title | Posteroanterior chest radiograph ("X-ray") taken of a 21 year old woman who presented with pain on the left side of her thorax after colliding with another play |
| Source page | https://commons.wikimedia.org/wiki/File:Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2017-06-28 |
| Retrieved | 2026-10-09T15:42Z |
| Original format | image/jpeg · 906,335 bytes · `Normal posteroanterior (PA) chest radiograph (X-ray).jpg` |
| Original SHA-256 | `4cbbcf805291db949e4ff085ca3c7258b2823de21b2857ae684e6c91ff9a38a4` |
| Original preserved | imaging/real/cxr-normal-pa-haggstrom.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Normal posteroanterior (PA) chest radiograph (X-ray).jpg: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ANormal+posteroanterior+%28PA%29+chest+radiograph+%28X-ray%29.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## cxr-hyperinflation-asthma-2025 — Hyperinflation in near-fatal asthma

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-hyperinflation-asthma-2025.jpg` |
| Clinical purpose | hyperinflation (cxr) |
| Creator / authors | Almutairi A, Althobaiti K, Antar M, Al Alem H, Kashgari A. |
| Source | “Near-fatal asthma in a 12-year-old girl leading to life-threatening tonsillar herniation: a case report”, Journal of medical case reports 19:435 (2025), https://doi.org/10.1186/s13256-025-05507-5 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12400729.1/13256_2025_5507_Fig1_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Almutairi A, Althobaiti K, Antar M, Al Alem H, Kashgari A.. “Near-fatal asthma in a 12-year-old girl leading to life-threatening tonsillar herniation: a case report”, Journal of medical case reports 19:435 (2025), https://doi.org/10.1186/s13256-025-05507-5 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12400729.1/13256_2025_5507_Fig1_HTML.jpg. CC BY 4.0. |
| Original title | Near-fatal asthma in a 12-year-old girl leading to life-threatening tonsillar herniation: a case report |
| Source page | https://doi.org/10.1186/s13256-025-05507-5 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12400729.1/13256_2025_5507_Fig1_HTML.jpg |
| DOI | 10.1186/s13256-025-05507-5 |
| Published | 2025-09-01 |
| Retrieved | 2026-10-09T15:42Z |
| Original format | image/jpeg · 1,914,633 bytes · `13256_2025_5507_Fig1_HTML.jpg` |
| Original SHA-256 | `ff28d0f878bc378484198e687992062a6db3b7201a51cf4b20fe688465add74c` |
| Original preserved | imaging/real/cxr-hyperinflation-asthma-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12400729 (doi 10.1186/s13256-025-05507-5), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-flash-edema-portable-2026 — Flash pulmonary edema on a portable film

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-flash-edema-portable-2026.jpg` |
| Clinical purpose | pulmonary_edema (cxr) |
| Creator / authors | Fahed J, Ganthan RR, Al-Zakhari R, Isber R, Isber N. |
| Source | “Flash Pulmonary Edema From Brief Loss of Biventricular Pacing During CRT-D Generator Exchange”, JACC. Case reports 31:107942 (2026), https://doi.org/10.1016/j.jaccas.2026.107942 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13221883.1/gr2.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Fahed J, Ganthan RR, Al-Zakhari R, Isber R, Isber N.. “Flash Pulmonary Edema From Brief Loss of Biventricular Pacing During CRT-D Generator Exchange”, JACC. Case reports 31:107942 (2026), https://doi.org/10.1016/j.jaccas.2026.107942 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13221883.1/gr2.jpg. CC BY 4.0. |
| Original title | Flash Pulmonary Edema From Brief Loss of Biventricular Pacing During CRT-D Generator Exchange |
| Source page | https://doi.org/10.1016/j.jaccas.2026.107942 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13221883.1/gr2.jpg |
| DOI | 10.1016/j.jaccas.2026.107942 |
| Published | 2026-04-16 |
| Retrieved | 2026-10-09T15:42Z |
| Original format | image/jpeg · 305,939 bytes · `gr2.jpg` |
| Original SHA-256 | `ea8f24b26f553f3c7ce03489f882c1a90fdb80783713f30392839824169c6703` |
| Original preserved | imaging/real/cxr-flash-edema-portable-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13221883 (doi 10.1016/j.jaccas.2026.107942), <license>: “This is an open access article under the CC BY license (http://creativecommons.org/licenses/by/4.0/).”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-ards-ecmo-recovery-2026 — ARDS on VV-ECMO, then recovery

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-ards-ecmo-recovery-2026.jpg` |
| Clinical purpose | ards (cxr) |
| Creator / authors | Zhang S, Zhang Z, Yang J, Peng J, Yang Y, Su L, Jiang J. |
| Source | “Case Report: Navigating the bleeding-thrombosis paradox: regional nafamostat anticoagulation in a post-intracerebral hemorrhage patient on VV-ECMO”, Frontiers in medicine 13:1840332 (2026), https://doi.org/10.3389/fmed.2026.1840332 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13416251.1/fmed-13-1840332-g002.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Zhang S, Zhang Z, Yang J, Peng J, Yang Y, Su L, Jiang J.. “Case Report: Navigating the bleeding-thrombosis paradox: regional nafamostat anticoagulation in a post-intracerebral hemorrhage patient on VV-ECMO”, Frontiers in medicine 13:1840332 (2026), https://doi.org/10.3389/fmed.2026.1840332 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13416251.1/fmed-13-1840332-g002.jpg. CC BY 4.0. |
| Original title | Case Report: Navigating the bleeding-thrombosis paradox: regional nafamostat anticoagulation in a post-intracerebral hemorrhage patient on VV-ECMO |
| Source page | https://doi.org/10.3389/fmed.2026.1840332 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13416251.1/fmed-13-1840332-g002.jpg |
| DOI | 10.3389/fmed.2026.1840332 |
| Published | 2026-07-15 |
| Retrieved | 2026-10-09T15:42Z |
| Original format | image/jpeg · 52,861 bytes · `fmed-13-1840332-g002.jpg` |
| Original SHA-256 | `351df7d7c392a1a824add2b22db579c1cb81c8dac98382e15520df765c8978f6` |
| Original preserved | imaging/real/cxr-ards-ecmo-recovery-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13416251 (doi 10.3389/fmed.2026.1840332), <license>: “This is an open-access article distributed under the terms of the Creative Commons Attribution License (CC BY) . The use, distribution or reproduction in other forums is permitted, provided the original author(s) and the copyright owner(s) are credited and that the original publication in this journ”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-aaa-rupture-96mm-2026 — Ruptured AAA with left retroperitoneal haematoma

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-aaa-rupture-96mm-2026.jpg` |
| Clinical purpose | aaa_rupture (ct-aorta) |
| Creator / authors | van Schaik TG, Rastogi V, Vriens PWHE, Dinkelman MK, De Fijter MW, Heyligers JMM. |
| Source | “Use of an artificial intelligence-driven software device to assist endovascular repair of a ruptured abdominal aortic aneurysm”, Journal of vascular surgery cases and innovative techniques 12:102288 (2026), https://doi.org/10.1016/j.jvscit.2026.102288 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13285273.1/gr1.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | van Schaik TG, Rastogi V, Vriens PWHE, Dinkelman MK, De Fijter MW, Heyligers JMM.. “Use of an artificial intelligence-driven software device to assist endovascular repair of a ruptured abdominal aortic aneurysm”, Journal of vascular surgery cases and innovative techniques 12:102288 (2026), https://doi.org/10.1016/j.jvscit.2026.102288 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13285273.1/gr1.jpg. CC BY 4.0. |
| Original title | Use of an artificial intelligence-driven software device to assist endovascular repair of a ruptured abdominal aortic aneurysm |
| Source page | https://doi.org/10.1016/j.jvscit.2026.102288 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13285273.1/gr1.jpg |
| DOI | 10.1016/j.jvscit.2026.102288 |
| Published | 2026-04-30 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 239,990 bytes · `gr1.jpg` |
| Original SHA-256 | `5d4664df63e4f770716a5e7598573cab912d780ea788d5189be409122d298fde` |
| Original preserved | imaging/real/ct-aaa-rupture-96mm-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13285273 (doi 10.1016/j.jvscit.2026.102288), <license>: “This is an open access article under the CC BY license (http://creativecommons.org/licenses/by/4.0/).”; Fig 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-aaa-rupture-right-hematoma-2025 — AAA rupture site and massive retroperitoneal haematoma

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-aaa-rupture-right-hematoma-2025.jpg` |
| Clinical purpose | retroperitoneal_hematoma (ct-aorta) |
| Creator / authors | Taguchi S, Nakaji S, Matsumaru I, Hisatomi K, Teratani H, Miura T. |
| Source | “Pulmonary embolism following endovascular aortic repair for a ruptured abdominal aortic aneurysm: A case report”, International journal of surgery case reports 133:111685 (2025), https://doi.org/10.1016/j.ijscr.2025.111685 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12284653.1/gr1.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Taguchi S, Nakaji S, Matsumaru I, Hisatomi K, Teratani H, Miura T.. “Pulmonary embolism following endovascular aortic repair for a ruptured abdominal aortic aneurysm: A case report”, International journal of surgery case reports 133:111685 (2025), https://doi.org/10.1016/j.ijscr.2025.111685 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12284653.1/gr1.jpg. CC BY 4.0. |
| Original title | Pulmonary embolism following endovascular aortic repair for a ruptured abdominal aortic aneurysm: A case report |
| Source page | https://doi.org/10.1016/j.ijscr.2025.111685 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12284653.1/gr1.jpg |
| DOI | 10.1016/j.ijscr.2025.111685 |
| Published | 2025-07-15 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 24,681 bytes · `gr1.jpg` |
| Original SHA-256 | `a53ddb671732ceb7073d81bc2d00426cfb656533bff227dbab898ac634e5b833` |
| Original preserved | imaging/real/ct-aaa-rupture-right-hematoma-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12284653 (doi 10.1016/j.ijscr.2025.111685), <license>: “This is an open access article under the CC BY license (http://creativecommons.org/licenses/by/4.0/).”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-dissection-type-b-flap-2026 — Intimal flap confined to the descending aorta

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-dissection-type-b-flap-2026.jpg` · `imaging/real/source/ct-dissection-type-b-flap-2026-source.jpg` |
| Clinical purpose | dissection_type_b (ct-aorta) |
| Creator / authors | Ruiz-López A, Salido Iniesta M, Gómez Revelles S, Taroncher Domingo C, Viladés Medel D. |
| Source | “Computed tomography pitfalls and diagnostic value in a patient with post-infarction ventricular septal defect, cardiogenic shock, and iatrogenic type B aortic dissection during extracorporeal membrane oxygenation support: a case report”, European heart journal. Case reports 10:ytag524 (2026), https://doi.org/10.1093/ehjcr/ytag524 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13422630.1/ytag524f2.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 1 region(s) with identifiers or burnt-in text blacked out; one panel taken from the figure (panel E (contrast axial, top right)); no other crop, mirroring or filtering. |
| Required attribution | Ruiz-López A, Salido Iniesta M, Gómez Revelles S, Taroncher Domingo C, Viladés Medel D.. “Computed tomography pitfalls and diagnostic value in a patient with post-infarction ventricular septal defect, cardiogenic shock, and iatrogenic type B aortic dissection during extracorporeal membrane oxygenation support: a case report”, European heart journal. Case reports 10:ytag524 (2026), https://doi.org/10.1093/ehjcr/ytag524 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13422630.1/ytag524f2.jpg. CC BY 4.0. |
| Original title | Computed tomography pitfalls and diagnostic value in a patient with post-infarction ventricular septal defect, cardiogenic shock, and iatrogenic type B aortic dissection during extracorporeal membrane oxygenation support: a case report |
| Source page | https://doi.org/10.1093/ehjcr/ytag524 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13422630.1/ytag524f2.jpg |
| DOI | 10.1093/ehjcr/ytag524 |
| Published | 2026-07-14 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 88,058 bytes · `ytag524f2.jpg` |
| Original SHA-256 | `d2967e0a25c15cbdec134b10662994756741f514ef4199b5e134515b1c9a67d1` |
| Original preserved | imaging/real/source/ct-dissection-type-b-flap-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC13422630 (doi 10.1093/ehjcr/ytag524), <license>: “This is an Open Access article distributed under the terms of the Creative Commons Attribution License ( https://creativecommons.org/licenses/by/4.0/ ), which permits unrestricted reuse, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-renal-nonperfusion-aaa-2026 — Non-enhancing left kidney

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-renal-nonperfusion-aaa-2026.jpg` · `imaging/real/source/ct-renal-nonperfusion-aaa-2026-source.jpg` |
| Clinical purpose | renal_malperfusion (ct-aorta) |
| Creator / authors | Jiang Y, Ni J, Zhang L, Jiang L, Li X. |
| Source | “Refractory abdominal compartment syndrome secondary to ruptured abdominal aortic aneurysm treated with total colectomy and upper rectal resection: A case report and literature review”, Medicine 105:e48285 (2026), https://doi.org/10.1097/md.0000000000048285 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13124428.1/medi-105-e48285-g001.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 1 region(s) with identifiers or burnt-in text blacked out; one panel taken from the figure (panel B (post-contrast, renal level)); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Jiang Y, Ni J, Zhang L, Jiang L, Li X.. “Refractory abdominal compartment syndrome secondary to ruptured abdominal aortic aneurysm treated with total colectomy and upper rectal resection: A case report and literature review”, Medicine 105:e48285 (2026), https://doi.org/10.1097/md.0000000000048285 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13124428.1/medi-105-e48285-g001.jpg. CC BY 4.0. |
| Original title | Refractory abdominal compartment syndrome secondary to ruptured abdominal aortic aneurysm treated with total colectomy and upper rectal resection: A case report and literature review |
| Source page | https://doi.org/10.1097/md.0000000000048285 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13124428.1/medi-105-e48285-g001.jpg |
| DOI | 10.1097/md.0000000000048285 |
| Published | 2026-04-01 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 84,347 bytes · `medi-105-e48285-g001.jpg` |
| Original SHA-256 | `21ef1840c62f58cfa3aeb0b630308f69aaa514881ca1a4c75000e473e796373f` |
| Original preserved | imaging/real/source/ct-renal-nonperfusion-aaa-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC13124428 (doi 10.1097/md.0000000000048285), <license>: “This is an open access article distributed under the Creative Commons Attribution License 4.0 (CCBY) , which permits unrestricted use, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 1. caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-aorta-normal-coronal-haggstrom — Normal abdominal aorta, coronal CT

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-aorta-normal-coronal-haggstrom.jpg` · `imaging/real/source/ct-aorta-normal-coronal-haggstrom-source.png` |
| Clinical purpose | aorta_normal (ct-aorta) |
| Creator / authors | Mikael Häggström, M.D. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:CT_of_a_normal_abdomen_and_pelvis,_coronal_plane_60.png |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | Converted to JPEG; one panel taken from the figure (main coronal image without the axial localiser inset); no other crop, mirroring or filtering. |
| Required attribution | Mikael Häggström, M.D.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:CT_of_a_normal_abdomen_and_pelvis,_coronal_plane_60.png. CC0. |
| Original title | edit Computed tomography of the abdomen and pelvis , performed as a contrast CT , here presented in the coronal plane with 3 mm slice thickness. It shows normal |
| Source page | https://commons.wikimedia.org/wiki/File:CT_of_a_normal_abdomen_and_pelvis,_coronal_plane_60.png |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/4/4b/CT_of_a_normal_abdomen_and_pelvis%2C_coronal_plane_60.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2019-03-16 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/png · 310,398 bytes · `CT of a normal abdomen and pelvis, coronal plane 60.png` |
| Original SHA-256 | `649735e95567a27ed8d05981e025ba8980d15343d7a54d9d73cc93c15e65cdba` |
| Original preserved | imaging/real/source/ct-aorta-normal-coronal-haggstrom-source.png |
| Licence evidence | Wikimedia Commons API extmetadata for File:CT of a normal abdomen and pelvis, coronal plane 60.png: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ACT+of+a+normal+abdomen+and+pelvis%2C+coronal+plane+60.png&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## fast-pelvis-positive-vats — Pelvic free fluid on FAST

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-pelvis-positive-vats.jpg` · `imaging/real/source/fast-pelvis-positive-vats-source.jpg` |
| Clinical purpose | fast_pelvis_positive (fast) |
| Creator / authors | Jinming Yao, Yan Xin, Xianzhen Liu |
| Source | “Case Report: Occult splenic rupture during left-sided VATS decortication: diagnostic role of early perioperative FAST”, Frontiers in surgery 13:1883987 (2026), https://doi.org/10.3389/fsurg.2026.1883987 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13429830.1/fsurg-13-1883987-g002.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.34–0.69, y 0.00–0.93 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Jinming Yao, Yan Xin, Xianzhen Liu. “Case Report: Occult splenic rupture during left-sided VATS decortication: diagnostic role of early perioperative FAST”, Frontiers in surgery 13:1883987 (2026), https://doi.org/10.3389/fsurg.2026.1883987 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13429830.1/fsurg-13-1883987-g002.jpg. CC BY 4.0. |
| Original title | Case Report: Occult splenic rupture during left-sided VATS decortication: diagnostic role of early perioperative FAST |
| Source page | https://doi.org/10.3389/fsurg.2026.1883987 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13429830.1/fsurg-13-1883987-g002.jpg |
| DOI | 10.3389/fsurg.2026.1883987 |
| Published | 2026-07-20 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 60,200 bytes · `fsurg-13-1883987-g002.jpg` |
| Original SHA-256 | `04bcee315f8fb035bf23b1940366705af0c8c6ec37dd2a3d4acbebc0e4321fa3` |
| Original preserved | imaging/real/source/fast-pelvis-positive-vats-source.jpg |
| Licence evidence | Europe PMC full text of PMC13429830 (doi 10.3389/fsurg.2026.1883987), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open-access article distributed under the terms of the Creative Commons Attribution License (CC BY) . The use, distribution or reproduction in other forums is permitted, provided the original author(s) and the copyright owner(s) are credited an”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ij-carotid-vexus-2024 — Internal jugular vein beside the carotid

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ij-carotid-vexus-2024.jpg` |
| Clinical purpose | ij_carotid (ijv) |
| Creator / authors | Suppawee Klangthamneam, Krissada Meemook, Tananchai Petnak, Anchana Sonkaew, Taweevat Assavapokee |
| Source | “Correlation between right atrial pressure measured via right heart catheterization and venous excess ultrasound, inferior vena cava diameter, and ultrasound-measured jugular venous pressure: a prospective observational study”, The ultrasound journal 16:50 (2024), https://doi.org/10.1186/s13089-024-00397-y — https://pmc-oa-opendata.s3.amazonaws.com/PMC11607288.1/13089_2024_397_Fig4_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Suppawee Klangthamneam, Krissada Meemook, Tananchai Petnak, Anchana Sonkaew, Taweevat Assavapokee. “Correlation between right atrial pressure measured via right heart catheterization and venous excess ultrasound, inferior vena cava diameter, and ultrasound-measured jugular venous pressure: a prospective observational study”, The ultrasound journal 16:50 (2024), https://doi.org/10.1186/s13089-024-00397-y — https://pmc-oa-opendata.s3.amazonaws.com/PMC11607288.1/13089_2024_397_Fig4_HTML.jpg. CC BY 4.0. |
| Original title | Correlation between right atrial pressure measured via right heart catheterization and venous excess ultrasound, inferior vena cava diameter, and ultrasound-measured jugular venous pressure: a prospective observational study |
| Source page | https://doi.org/10.1186/s13089-024-00397-y |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC11607288.1/13089_2024_397_Fig4_HTML.jpg |
| DOI | 10.1186/s13089-024-00397-y |
| Published | 2024-11-29 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 46,797 bytes · `13089_2024_397_Fig4_HTML.jpg` |
| Original SHA-256 | `995d3ecb2109537c0c2b6bf27bcae4588d5aea2d230aa08ec3bae9294be165ad` |
| Original preserved | imaging/real/ij-carotid-vexus-2024.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC11607288 (doi 10.1186/s13089-024-00397-y), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original auth”; Fig. 4 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ij-needle-inplane-2025 — In-plane needle approaching the IJ

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ij-needle-inplane-2025.jpg` |
| Clinical purpose | ij_needle (ijv) |
| Creator / authors | Michal Kalina, Patricia Vargová, Adéla Bubeníková, Roman Škulec, Vladimír Černý, David Astapenko |
| Source | “A novel "lateral approach short axis in-plane" technique vs. conventional "short-axis out-of-plane approach" for ultrasound-guided internal jugular vein access: a prospective randomized non-inferiority trial”, The ultrasound journal 17:5 (2025), https://doi.org/10.1186/s13089-025-00405-9 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11739437.1/13089_2025_405_Fig3_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Michal Kalina, Patricia Vargová, Adéla Bubeníková, Roman Škulec, Vladimír Černý, David Astapenko. “A novel "lateral approach short axis in-plane" technique vs. conventional "short-axis out-of-plane approach" for ultrasound-guided internal jugular vein access: a prospective randomized non-inferiority trial”, The ultrasound journal 17:5 (2025), https://doi.org/10.1186/s13089-025-00405-9 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11739437.1/13089_2025_405_Fig3_HTML.jpg. CC BY 4.0. |
| Original title | A novel "lateral approach short axis in-plane" technique vs. conventional "short-axis out-of-plane approach" for ultrasound-guided internal jugular vein access: a prospective randomized non-inferiority trial |
| Source page | https://doi.org/10.1186/s13089-025-00405-9 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC11739437.1/13089_2025_405_Fig3_HTML.jpg |
| DOI | 10.1186/s13089-025-00405-9 |
| Published | 2025-01-16 |
| Retrieved | 2026-10-09T15:43Z |
| Original format | image/jpeg · 62,557 bytes · `13089_2025_405_Fig3_HTML.jpg` |
| Original SHA-256 | `8b068d0d70179f7a094c839432b1bd923b1a7ae1fc7ef552ab4c3be17565eb80` |
| Original preserved | imaging/real/ij-needle-inplane-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC11739437 (doi 10.1186/s13089-025-00405-9), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original auth”; Fig. 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-tension-ptx-right-olv-2024 — Right tension pneumothorax during one-lung ventilation

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-tension-ptx-right-olv-2024.jpg` |
| Clinical purpose | tension_ptx (cxr) |
| Creator / authors | Angie H Chang, Hongchengcheng Chen, Lei Li, Yirui Hu, Ruoxi Zhang, Xiaopeng Zhang |
| Source | “Contralateral Tension Pneumothorax in One-Lung Ventilation: A Case Report and Systematic Review”, Cureus 16:e61306 (2024), https://doi.org/10.7759/cureus.61306 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11135384.1/cureus-0016-00000061306-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Angie H Chang, Hongchengcheng Chen, Lei Li, Yirui Hu, Ruoxi Zhang, Xiaopeng Zhang. “Contralateral Tension Pneumothorax in One-Lung Ventilation: A Case Report and Systematic Review”, Cureus 16:e61306 (2024), https://doi.org/10.7759/cureus.61306 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11135384.1/cureus-0016-00000061306-i01.jpg. CC BY 4.0. |
| Original title | Contralateral Tension Pneumothorax in One-Lung Ventilation: A Case Report and Systematic Review |
| Source page | https://doi.org/10.7759/cureus.61306 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC11135384.1/cureus-0016-00000061306-i01.jpg |
| DOI | 10.7759/cureus.61306 |
| Published | 2024-05-29 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 52,724 bytes · `cureus-0016-00000061306-i01.jpg` |
| Original SHA-256 | `775b9c181ba90ac88edd26f8e47824427071dbaf0d1c48f0b99730da930e400e` |
| Original preserved | imaging/real/cxr-tension-ptx-right-olv-2024.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC11135384 (doi 10.7759/cureus.61306), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-ptx-left-large-2024 — Large left pneumothorax

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-ptx-left-large-2024.jpg` |
| Clinical purpose | ptx (cxr) |
| Creator / authors | Mohammed Adul Hai Amer, Saquib Siddiqui |
| Source | “Tale of a Blocked Chest Drain Resulting in Tension Pneumothorax: Are We Always Competent Enough to Troubleshoot a Chest Drain?”, Cureus 16:e66037 (2024), https://doi.org/10.7759/cureus.66037 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11368579.1/cureus-0016-00000066037-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mohammed Adul Hai Amer, Saquib Siddiqui. “Tale of a Blocked Chest Drain Resulting in Tension Pneumothorax: Are We Always Competent Enough to Troubleshoot a Chest Drain?”, Cureus 16:e66037 (2024), https://doi.org/10.7759/cureus.66037 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11368579.1/cureus-0016-00000066037-i01.jpg. CC BY 4.0. |
| Original title | Tale of a Blocked Chest Drain Resulting in Tension Pneumothorax: Are We Always Competent Enough to Troubleshoot a Chest Drain? |
| Source page | https://doi.org/10.7759/cureus.66037 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC11368579.1/cureus-0016-00000066037-i01.jpg |
| DOI | 10.7759/cureus.66037 |
| Published | 2024-08-02 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 63,897 bytes · `cureus-0016-00000066037-i01.jpg` |
| Original SHA-256 | `8cbe189d3ab2871a56f97c6de63d234410e9d367324e2109664de9d796d609c0` |
| Original preserved | imaging/real/cxr-ptx-left-large-2024.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC11368579 (doi 10.7759/cureus.66037), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-ptx-right-spontaneous-2026 — Moderate right spontaneous pneumothorax

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-ptx-right-spontaneous-2026.jpg` |
| Clinical purpose | ptx (cxr) |
| Creator / authors | Louise Nicolette Mendoza, Wyatt Mayer, Mario Loomis |
| Source | “Recurrent Primary Spontaneous Pneumothorax in an 18-Year-Old Man: A Case Report and Review of Considerations for Prophylactic Contralateral Pleurodesis”, Cureus 18:e110257 (2026), https://doi.org/10.7759/cureus.110257 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13332831.1/cureus-0018-00000110257-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Louise Nicolette Mendoza, Wyatt Mayer, Mario Loomis. “Recurrent Primary Spontaneous Pneumothorax in an 18-Year-Old Man: A Case Report and Review of Considerations for Prophylactic Contralateral Pleurodesis”, Cureus 18:e110257 (2026), https://doi.org/10.7759/cureus.110257 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13332831.1/cureus-0018-00000110257-i01.jpg. CC BY 4.0. |
| Original title | Recurrent Primary Spontaneous Pneumothorax in an 18-Year-Old Man: A Case Report and Review of Considerations for Prophylactic Contralateral Pleurodesis |
| Source page | https://doi.org/10.7759/cureus.110257 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13332831.1/cureus-0018-00000110257-i01.jpg |
| DOI | 10.7759/cureus.110257 |
| Published | 2026-06-04 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 86,978 bytes · `cureus-0018-00000110257-i01.jpg` |
| Original SHA-256 | `25d03b5e17618361a6d813afa12122f1078a613e0764838b3a6339c303f96ce5` |
| Original preserved | imaging/real/cxr-ptx-right-spontaneous-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13332831 (doi 10.7759/cureus.110257), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-pigtail-drain-reexpanded-2026 — Pigtail drain in place, right lung re-expanded

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-pigtail-drain-reexpanded-2026.jpg` · `imaging/real/source/cxr-pigtail-drain-reexpanded-2026-source.jpg` |
| Clinical purpose | chest_tube (cxr) |
| Creator / authors | Louise Nicolette Mendoza, Wyatt Mayer, Mario Loomis |
| Source | “Recurrent Primary Spontaneous Pneumothorax in an 18-Year-Old Man: A Case Report and Review of Considerations for Prophylactic Contralateral Pleurodesis”, Cureus 18:e110257 (2026), https://doi.org/10.7759/cureus.110257 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13332831.1/cureus-0018-00000110257-i02.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 2 region(s) with identifiers or burnt-in text blacked out; no crop, mirroring or filtering. |
| Required attribution | Louise Nicolette Mendoza, Wyatt Mayer, Mario Loomis. “Recurrent Primary Spontaneous Pneumothorax in an 18-Year-Old Man: A Case Report and Review of Considerations for Prophylactic Contralateral Pleurodesis”, Cureus 18:e110257 (2026), https://doi.org/10.7759/cureus.110257 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13332831.1/cureus-0018-00000110257-i02.jpg. CC BY 4.0. |
| Original title | Recurrent Primary Spontaneous Pneumothorax in an 18-Year-Old Man: A Case Report and Review of Considerations for Prophylactic Contralateral Pleurodesis |
| Source page | https://doi.org/10.7759/cureus.110257 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13332831.1/cureus-0018-00000110257-i02.jpg |
| DOI | 10.7759/cureus.110257 |
| Published | 2026-06-04 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 59,972 bytes · `cureus-0018-00000110257-i02.jpg` |
| Original SHA-256 | `cce5e6b59984b061ec9dd849529fc1edc26fc76aee8966cb800d9f9787610116` |
| Original preserved | imaging/real/source/cxr-pigtail-drain-reexpanded-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC13332831 (doi 10.7759/cureus.110257), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-drain-persistent-ptx-2024 — Chest drain in place with a persistent left pneumothorax

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-drain-persistent-ptx-2024.jpg` |
| Clinical purpose | chest_tube (cxr) |
| Creator / authors | Mohammed Adul Hai Amer, Saquib Siddiqui |
| Source | “Tale of a Blocked Chest Drain Resulting in Tension Pneumothorax: Are We Always Competent Enough to Troubleshoot a Chest Drain?”, Cureus 16:e66037 (2024), https://doi.org/10.7759/cureus.66037 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11368579.1/cureus-0016-00000066037-i03.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Mohammed Adul Hai Amer, Saquib Siddiqui. “Tale of a Blocked Chest Drain Resulting in Tension Pneumothorax: Are We Always Competent Enough to Troubleshoot a Chest Drain?”, Cureus 16:e66037 (2024), https://doi.org/10.7759/cureus.66037 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11368579.1/cureus-0016-00000066037-i03.jpg. CC BY 4.0. |
| Original title | Tale of a Blocked Chest Drain Resulting in Tension Pneumothorax: Are We Always Competent Enough to Troubleshoot a Chest Drain? |
| Source page | https://doi.org/10.7759/cureus.66037 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC11368579.1/cureus-0016-00000066037-i03.jpg |
| DOI | 10.7759/cureus.66037 |
| Published | 2024-08-02 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 96,714 bytes · `cureus-0016-00000066037-i03.jpg` |
| Original SHA-256 | `b9847129c8ba69786f26c1d017bebba80a57a0168c2b84619b3e05e70bb93ff6` |
| Original preserved | imaging/real/cxr-drain-persistent-ptx-2024.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC11368579 (doi 10.7759/cureus.66037), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-left-whiteout-mucus-plug-2026 — Left lung collapse from mucus plugging (adult)

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-left-whiteout-mucus-plug-2026.jpg` |
| Clinical purpose | collapse_left (cxr) |
| Creator / authors | Sitha Konopack |
| Source | “Severe Mucus Plugging Causing Acute Hypoxic Respiratory Failure and Delayed Hemoptysis in a Renal Transplant Recipient Without Chronic Pulmonary Disease”, Cureus 18:e108907 (2026), https://doi.org/10.7759/cureus.108907 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13265034.1/cureus-0018-00000108907-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Sitha Konopack. “Severe Mucus Plugging Causing Acute Hypoxic Respiratory Failure and Delayed Hemoptysis in a Renal Transplant Recipient Without Chronic Pulmonary Disease”, Cureus 18:e108907 (2026), https://doi.org/10.7759/cureus.108907 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13265034.1/cureus-0018-00000108907-i01.jpg. CC BY 4.0. |
| Original title | Severe Mucus Plugging Causing Acute Hypoxic Respiratory Failure and Delayed Hemoptysis in a Renal Transplant Recipient Without Chronic Pulmonary Disease |
| Source page | https://doi.org/10.7759/cureus.108907 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13265034.1/cureus-0018-00000108907-i01.jpg |
| DOI | 10.7759/cureus.108907 |
| Published | 2026-05-15 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 95,658 bytes · `cureus-0018-00000108907-i01.jpg` |
| Original SHA-256 | `e0d4a00c85dbe1a458ed75628c513ba1ac56555fdbe5f4df6c854328530f6b90` |
| Original preserved | imaging/real/cxr-left-whiteout-mucus-plug-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13265034 (doi 10.7759/cureus.108907), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## peds-croup-steeple-2019 — Croup: steeple sign on a frontal neck film

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/peds-croup-steeple-2019.jpg` · `imaging/real/source/peds-croup-steeple-2019-source.jpg` |
| Clinical purpose | croup_steeple (peds-xray) |
| Creator / authors | Yang WC, Hsu YL, Chen CY, Peng YC, Chen JN, Fu YC, Chang YJ, Lee EP, Lin MJ, Wu HP. |
| Source | “Initial radiographic tracheal ratio in predicting clinical outcomes in croup in children”, Scientific reports 9:17893 (2019), https://doi.org/10.1038/s41598-019-54140-y — https://pmc-oa-opendata.s3.amazonaws.com/PMC6884517.1/41598_2019_54140_Fig2_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.49, y 0.00–1.00 of the original); no other crop, mirroring or filtering. |
| Required attribution | Yang WC, Hsu YL, Chen CY, Peng YC, Chen JN, Fu YC, Chang YJ, Lee EP, Lin MJ, Wu HP.. “Initial radiographic tracheal ratio in predicting clinical outcomes in croup in children”, Scientific reports 9:17893 (2019), https://doi.org/10.1038/s41598-019-54140-y — https://pmc-oa-opendata.s3.amazonaws.com/PMC6884517.1/41598_2019_54140_Fig2_HTML.jpg. CC BY 4.0. |
| Original title | Initial radiographic tracheal ratio in predicting clinical outcomes in croup in children |
| Source page | https://doi.org/10.1038/s41598-019-54140-y |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC6884517.1/41598_2019_54140_Fig2_HTML.jpg |
| DOI | 10.1038/s41598-019-54140-y |
| Published | 2019-11-29 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 57,820 bytes · `41598_2019_54140_Fig2_HTML.jpg` |
| Original SHA-256 | `cadce9377e1e7204d59c1adccb77f1af9484f06772709928030f62fb5d0a7d98` |
| Original preserved | imaging/real/source/peds-croup-steeple-2019-source.jpg |
| Licence evidence | Europe PMC full text of PMC6884517 (doi 10.1038/s41598-019-54140-y), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## peds-epiglottitis-thumb-2026 — Epiglottitis: thumb sign on a lateral neck film

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/peds-epiglottitis-thumb-2026.jpg` |
| Clinical purpose | epiglottitis_thumb (peds-xray) |
| Creator / authors | Madalena Ferreira, Luzia Condessa, Margarida Roquette, Rita Antão, Carina Cardoso, Margarida Chaves |
| Source | “Haemophilus influenzae Epiglottitis: A Rare Disease Not to Be Forgotten”, Cureus 18:e101680 (2026), https://doi.org/10.7759/cureus.101680 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12906715.1/cureus-0018-00000101680-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Madalena Ferreira, Luzia Condessa, Margarida Roquette, Rita Antão, Carina Cardoso, Margarida Chaves. “Haemophilus influenzae Epiglottitis: A Rare Disease Not to Be Forgotten”, Cureus 18:e101680 (2026), https://doi.org/10.7759/cureus.101680 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12906715.1/cureus-0018-00000101680-i01.jpg. CC BY 4.0. |
| Original title | Haemophilus influenzae Epiglottitis: A Rare Disease Not to Be Forgotten |
| Source page | https://doi.org/10.7759/cureus.101680 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12906715.1/cureus-0018-00000101680-i01.jpg |
| DOI | 10.7759/cureus.101680 |
| Published | 2026-01-16 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 74,833 bytes · `cureus-0018-00000101680-i01.jpg` |
| Original SHA-256 | `19a0e8b12ff274da4471c6c9520be2679d3546d8225fbe54cc48d7a650245c33` |
| Original preserved | imaging/real/peds-epiglottitis-thumb-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12906715 (doi 10.7759/cureus.101680), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## peds-irds-preterm-haggstrom — Neonatal respiratory distress syndrome in a 29-week infant

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/peds-irds-preterm-haggstrom.jpg` · `imaging/real/source/peds-irds-preterm-haggstrom-source.png` |
| Clinical purpose | neonatal_rds (peds-xray) |
| Creator / authors | Mikael Häggström, M.D. |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:X-ray_of_infant_respiratory_distress_syndrome_(IRDS).png |
| Licence | CC0 — http://creativecommons.org/publicdomain/zero/1.0/deed.en |
| Modifications | Converted to JPEG; padded by one black pixel to even dimensions; no crop, mirroring or filtering. |
| Required attribution | Mikael Häggström, M.D.. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:X-ray_of_infant_respiratory_distress_syndrome_(IRDS).png. CC0. |
| Original title | Chest radiograph one day after birth of a boy after 29 weeks and 3 days of gestational age who developed respiratory distress. It shows signs of infant respirat |
| Source page | https://commons.wikimedia.org/wiki/File:X-ray_of_infant_respiratory_distress_syndrome_(IRDS).png |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/b/bf/X-ray_of_infant_respiratory_distress_syndrome_%28IRDS%29.png?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2018-08-16 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/png · 271,984 bytes · `X-ray of infant respiratory distress syndrome (IRDS).png` |
| Original SHA-256 | `0f45199a1f511e1893b33cacada2271023ce167afb3992ce8034a75bead2dbf4` |
| Original preserved | imaging/real/source/peds-irds-preterm-haggstrom-source.png |
| Licence evidence | Wikimedia Commons API extmetadata for File:X-ray of infant respiratory distress syndrome (IRDS).png: LicenseShortName = “CC0”, UsageTerms = “Creative Commons Zero, Public Domain Dedication” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AX-ray+of+infant+respiratory+distress+syndrome+%28IRDS%29.png&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ct-dissection-type-a-arch-flap-2025 — Type A dissection: flap through the aortic arch

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-dissection-type-a-arch-flap-2025.jpg` |
| Clinical purpose | dissection_type_a (ct-aorta) |
| Creator / authors | Heloise Paccaud, Guérisse Fabien, Michael Beauprez, Quentin Vangyte |
| Source | “Stanford Type A Aortic Dissection Manifesting as Acute Lower Limb Ischemia”, Cureus 17:e98241 (2025), https://doi.org/10.7759/cureus.98241 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12755286.1/cureus-0017-00000098241-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Heloise Paccaud, Guérisse Fabien, Michael Beauprez, Quentin Vangyte. “Stanford Type A Aortic Dissection Manifesting as Acute Lower Limb Ischemia”, Cureus 17:e98241 (2025), https://doi.org/10.7759/cureus.98241 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12755286.1/cureus-0017-00000098241-i01.jpg. CC BY 4.0. |
| Original title | Stanford Type A Aortic Dissection Manifesting as Acute Lower Limb Ischemia |
| Source page | https://doi.org/10.7759/cureus.98241 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12755286.1/cureus-0017-00000098241-i01.jpg |
| DOI | 10.7759/cureus.98241 |
| Published | 2025-12-01 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 74,315 bytes · `cureus-0017-00000098241-i01.jpg` |
| Original SHA-256 | `3db4eb3c7595708012bb27618fb836e288fd4a0d3e7c6635075bfbcfd9fd5a09` |
| Original preserved | imaging/real/ct-dissection-type-a-arch-flap-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12755286 (doi 10.7759/cureus.98241), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-aaa-intact-66mm-coronal-2025 — Intact infrarenal abdominal aortic aneurysm

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-aaa-intact-66mm-coronal-2025.jpg` · `imaging/real/source/ct-aaa-intact-66mm-coronal-2025-source.jpg` |
| Clinical purpose | aaa (ct-aorta) |
| Creator / authors | Jesse O'Rorke, Greyson Butler, John A Moss |
| Source | “Management of Acute Diverticulitis and Incidental Abdominal Aortic Aneurysm in a 67-Year-Old Male: A Case Report of Balancing Priorities in a High-Risk Patient”, Cureus 17:e78987 (2025), https://doi.org/10.7759/cureus.78987 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11910892.1/cureus-0017-00000078987-i02.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.34–0.84, y 0.00–0.97 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Jesse O'Rorke, Greyson Butler, John A Moss. “Management of Acute Diverticulitis and Incidental Abdominal Aortic Aneurysm in a 67-Year-Old Male: A Case Report of Balancing Priorities in a High-Risk Patient”, Cureus 17:e78987 (2025), https://doi.org/10.7759/cureus.78987 — https://pmc-oa-opendata.s3.amazonaws.com/PMC11910892.1/cureus-0017-00000078987-i02.jpg. CC BY 4.0. |
| Original title | Management of Acute Diverticulitis and Incidental Abdominal Aortic Aneurysm in a 67-Year-Old Male: A Case Report of Balancing Priorities in a High-Risk Patient |
| Source page | https://doi.org/10.7759/cureus.78987 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC11910892.1/cureus-0017-00000078987-i02.jpg |
| DOI | 10.7759/cureus.78987 |
| Published | 2025-02-14 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 55,794 bytes · `cureus-0017-00000078987-i02.jpg` |
| Original SHA-256 | `c99146251807a6752e01a1c25f3c4fbd1224c3041821b8b186a4f9d1b4f1282a` |
| Original preserved | imaging/real/source/ct-aaa-intact-66mm-coronal-2025-source.jpg |
| Licence evidence | Europe PMC full text of PMC11910892 (doi 10.7759/cureus.78987), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-renal-malperfusion-dissection-fl-2025 — Renal malperfusion from aortic dissection

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-renal-malperfusion-dissection-fl-2025.jpg` · `imaging/real/source/ct-renal-malperfusion-dissection-fl-2025-source.jpg` |
| Clinical purpose | renal_malperfusion (ct-aorta) |
| Creator / authors | Yang C, Shao S, Leng X, Qi W, Chen Y, Huang L, Xu L, Luo Y. |
| Source | “Computational Fluid Dynamics in Predicting Renal Malperfusion After Aortic Dissection Repair”, JACC. Case reports 31:106060 (2025), https://doi.org/10.1016/j.jaccas.2025.106060 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12926182.1/gr2.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.01–0.24, y 0.07–0.28 of the original); no other crop, mirroring or filtering. |
| Required attribution | Yang C, Shao S, Leng X, Qi W, Chen Y, Huang L, Xu L, Luo Y.. “Computational Fluid Dynamics in Predicting Renal Malperfusion After Aortic Dissection Repair”, JACC. Case reports 31:106060 (2025), https://doi.org/10.1016/j.jaccas.2025.106060 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12926182.1/gr2.jpg. CC BY 4.0. |
| Original title | Computational Fluid Dynamics in Predicting Renal Malperfusion After Aortic Dissection Repair |
| Source page | https://doi.org/10.1016/j.jaccas.2025.106060 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12926182.1/gr2.jpg |
| DOI | 10.1016/j.jaccas.2025.106060 |
| Published | 2025-11-17 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 319,078 bytes · `gr2.jpg` |
| Original SHA-256 | `f5b38c93c7623478a0404870fb0b5effb256a3ced058d387ef4f3164fea75bb5` |
| Original preserved | imaging/real/source/ct-renal-malperfusion-dissection-fl-2025-source.jpg |
| Licence evidence | Europe PMC full text of PMC12926182 (doi 10.1016/j.jaccas.2025.106060), <license>: “This is an open access article under the CC BY license (http://creativecommons.org/licenses/by/4.0/).”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-renal-hypoperfusion-type-b-renal-level-2026 — Dissection at renal level with poor kidney enhancement

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-renal-hypoperfusion-type-b-renal-level-2026.jpg` · `imaging/real/source/ct-renal-hypoperfusion-type-b-renal-level-2026-source.jpg` |
| Clinical purpose | renal_malperfusion (ct-aorta) |
| Creator / authors | Kurobe H, Higaki T, Fukunishi T, Nishimura T, Izutani H. |
| Source | “Successful thoracic endovascular aortic repair for complicated Stanford type B acute aortic dissection with acute renal failure and vascular remodelling after intervention: case report and 5-year follow-up”, European heart journal. Case reports 10:ytag336 (2026), https://doi.org/10.1093/ehjcr/ytag336 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13195809.1/ytag336f1.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.49, y 0.70–1.00 of the original); no other crop, mirroring or filtering. |
| Required attribution | Kurobe H, Higaki T, Fukunishi T, Nishimura T, Izutani H.. “Successful thoracic endovascular aortic repair for complicated Stanford type B acute aortic dissection with acute renal failure and vascular remodelling after intervention: case report and 5-year follow-up”, European heart journal. Case reports 10:ytag336 (2026), https://doi.org/10.1093/ehjcr/ytag336 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13195809.1/ytag336f1.jpg. CC BY 4.0. |
| Original title | Successful thoracic endovascular aortic repair for complicated Stanford type B acute aortic dissection with acute renal failure and vascular remodelling after intervention: case report and 5-year follow-up |
| Source page | https://doi.org/10.1093/ehjcr/ytag336 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13195809.1/ytag336f1.jpg |
| DOI | 10.1093/ehjcr/ytag336 |
| Published | 2026-05-08 |
| Retrieved | 2026-10-09T16:41Z |
| Original format | image/jpeg · 206,627 bytes · `ytag336f1.jpg` |
| Original SHA-256 | `b26ed4a752d6bff1094f22b60424e359c95c696653c2ab2c0c3e1afd8b221241` |
| Original preserved | imaging/real/source/ct-renal-hypoperfusion-type-b-renal-level-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC13195809 (doi 10.1093/ehjcr/ytag336), <license>: “This is an Open Access article distributed under the terms of the Creative Commons Attribution License ( https://creativecommons.org/licenses/by/4.0/ ), which permits unrestricted reuse, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-sma-embolism-coronal-2023 — Superior mesenteric artery embolism

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-sma-embolism-coronal-2023.jpg` · `imaging/real/source/ct-sma-embolism-coronal-2023-source.jpg` |
| Clinical purpose | sma_occlusion (ct-aorta) |
| Creator / authors | Aoki R, Kato S, Nakajima K, Sakai J, Yoshida K, Masui H, Ikeda S, Yoshigi J, Utsunomiya D. |
| Source | “Superior mesenteric artery embolism associated with Cisplatin-induced aortic thrombosis”, BJR case reports 9:20220149 (2023), https://doi.org/10.1259/bjrcr.20220149 — https://pmc-oa-opendata.s3.amazonaws.com/PMC10513010.1/bjrcr.20220149.g002.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.47, y 0.53–1.00 of the original); no other crop, mirroring or filtering. |
| Required attribution | Aoki R, Kato S, Nakajima K, Sakai J, Yoshida K, Masui H, Ikeda S, Yoshigi J, Utsunomiya D.. “Superior mesenteric artery embolism associated with Cisplatin-induced aortic thrombosis”, BJR case reports 9:20220149 (2023), https://doi.org/10.1259/bjrcr.20220149 — https://pmc-oa-opendata.s3.amazonaws.com/PMC10513010.1/bjrcr.20220149.g002.jpg. CC BY 4.0. |
| Original title | Superior mesenteric artery embolism associated with Cisplatin-induced aortic thrombosis |
| Source page | https://doi.org/10.1259/bjrcr.20220149 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC10513010.1/bjrcr.20220149.g002.jpg |
| DOI | 10.1259/bjrcr.20220149 |
| Published | 2023-09-12 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 105,870 bytes · `bjrcr.20220149.g002.jpg` |
| Original SHA-256 | `9988416a21b302158f69b04034adc369bc7d004c9e4fd7193d9cb50d49450d28` |
| Original preserved | imaging/real/source/ct-sma-embolism-coronal-2023-source.jpg |
| Licence evidence | Europe PMC full text of PMC10513010 (doi 10.1259/bjrcr.20220149), <license>: “This is an open access article distributed under the terms of the Creative Commons Attribution 4.0 International License , which permits unrestricted use, distribution and reproduction in any medium, provided the original author and source are credited.”; Figure 2. caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-gastric-pneumatosis-portal-gas-2026 — Gas in the stomach wall with portal venous gas

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-gastric-pneumatosis-portal-gas-2026.jpg` · `imaging/real/source/ct-gastric-pneumatosis-portal-gas-2026-source.jpg` |
| Clinical purpose | pneumatosis (ct-aorta) |
| Creator / authors | Harsh V Baranwal, Muskan Dugar, Ronit Biswas, Sumit Sharma, Vivek Katiyar |
| Source | “Gas Beyond the Lumen: Gastric Pneumatosis With Portal Venous Gas Following Blunt Abdominal Trauma”, Cureus 18:e106116 (2026), https://doi.org/10.7759/cureus.106116 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13128150.1/cureus-0018-00000106116-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 1 region(s) with identifiers or burnt-in text blacked out; one panel taken from the figure (region x 0.48–0.99, y 0.19–0.75 of the original); no other crop, mirroring or filtering. |
| Required attribution | Harsh V Baranwal, Muskan Dugar, Ronit Biswas, Sumit Sharma, Vivek Katiyar. “Gas Beyond the Lumen: Gastric Pneumatosis With Portal Venous Gas Following Blunt Abdominal Trauma”, Cureus 18:e106116 (2026), https://doi.org/10.7759/cureus.106116 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13128150.1/cureus-0018-00000106116-i01.jpg. CC BY 4.0. |
| Original title | Gas Beyond the Lumen: Gastric Pneumatosis With Portal Venous Gas Following Blunt Abdominal Trauma |
| Source page | https://doi.org/10.7759/cureus.106116 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13128150.1/cureus-0018-00000106116-i01.jpg |
| DOI | 10.7759/cureus.106116 |
| Published | 2026-03-30 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 82,520 bytes · `cureus-0018-00000106116-i01.jpg` |
| Original SHA-256 | `a6c01f72ca31d444c07b27f14c7324442f0842c5aa27b369f1e3f62801c32663` |
| Original preserved | imaging/real/source/ct-gastric-pneumatosis-portal-gas-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC13128150 (doi 10.7759/cureus.106116), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-sbo-coronal-feces-sign-2026 — Small bowel obstruction with small-bowel feces sign

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-sbo-coronal-feces-sign-2026.jpg` · `imaging/real/source/ct-sbo-coronal-feces-sign-2026-source.jpg` |
| Clinical purpose | sbo (ct-aorta) |
| Creator / authors | Erum U, Jamil OBK, Shahid R, Noman A, Imtiaz S, Zafar Z, Babar M. |
| Source | “Strangulated transomental hernia causing small bowel obstruction in a virgin abdomen”, Journal of surgical case reports 2026:rjag586 (2026), https://doi.org/10.1093/jscr/rjag586 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13371963.1/rjag586f2.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 2 region(s) with identifiers or burnt-in text blacked out; padded by one black pixel to even dimensions; no crop, mirroring or filtering. |
| Required attribution | Erum U, Jamil OBK, Shahid R, Noman A, Imtiaz S, Zafar Z, Babar M.. “Strangulated transomental hernia causing small bowel obstruction in a virgin abdomen”, Journal of surgical case reports 2026:rjag586 (2026), https://doi.org/10.1093/jscr/rjag586 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13371963.1/rjag586f2.jpg. CC BY 4.0. |
| Original title | Strangulated transomental hernia causing small bowel obstruction in a virgin abdomen |
| Source page | https://doi.org/10.1093/jscr/rjag586 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13371963.1/rjag586f2.jpg |
| DOI | 10.1093/jscr/rjag586 |
| Published | 2026-07-15 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 77,885 bytes · `rjag586f2.jpg` |
| Original SHA-256 | `7a32243553323517c598ffdd7be12db2497e98d3c2b21652fcce05904063c4f2` |
| Original preserved | imaging/real/source/ct-sbo-coronal-feces-sign-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC13371963 (doi 10.1093/jscr/rjag586), <license>: “This is an Open Access article distributed under the terms of the Creative Commons Attribution License ( https://creativecommons.org/licenses/by/4.0/ ), which permits unrestricted reuse, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-pneumoperitoneum-large-2026 — Large-volume pneumoperitoneum

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-pneumoperitoneum-large-2026.jpg` |
| Clinical purpose | pneumoperitoneum (ct-aorta) |
| Creator / authors | Yifan Liu, Michael Auld, Geoffrey Stieler |
| Source | “The Silent Abdomen: The Conservative Management of Large Idiopathic Pneumoperitoneum”, Cureus 18:e109171 (2026), https://doi.org/10.7759/cureus.109171 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13276633.1/cureus-0018-00000109171-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Yifan Liu, Michael Auld, Geoffrey Stieler. “The Silent Abdomen: The Conservative Management of Large Idiopathic Pneumoperitoneum”, Cureus 18:e109171 (2026), https://doi.org/10.7759/cureus.109171 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13276633.1/cureus-0018-00000109171-i01.jpg. CC BY 4.0. |
| Original title | The Silent Abdomen: The Conservative Management of Large Idiopathic Pneumoperitoneum |
| Source page | https://doi.org/10.7759/cureus.109171 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13276633.1/cureus-0018-00000109171-i01.jpg |
| DOI | 10.7759/cureus.109171 |
| Published | 2026-05-19 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 67,224 bytes · `cureus-0018-00000109171-i01.jpg` |
| Original SHA-256 | `5fd32515c8e0d1522d2e94e4e4c4c9af4c86618cd83c765400e2b4338f961658` |
| Original preserved | imaging/real/ct-pneumoperitoneum-large-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13276633 (doi 10.7759/cureus.109171), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-splenic-laceration-hemoperitoneum-2025 — Splenic injury with haemoperitoneum

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-splenic-laceration-hemoperitoneum-2025.jpg` · `imaging/real/source/ct-splenic-laceration-hemoperitoneum-2025-source.jpg` |
| Clinical purpose | hemoperitoneum (ct-aorta) |
| Creator / authors | Bertch A, Motika C. |
| Source | “Splenic laceration following routine colonoscopy: a case report”, Journal of surgical case reports 2025:rjaf940 (2025), https://doi.org/10.1093/jscr/rjaf940 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12646259.1/rjaf940f1.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–1.00, y 0.00–0.90 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Bertch A, Motika C.. “Splenic laceration following routine colonoscopy: a case report”, Journal of surgical case reports 2025:rjaf940 (2025), https://doi.org/10.1093/jscr/rjaf940 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12646259.1/rjaf940f1.jpg. CC BY 4.0. |
| Original title | Splenic laceration following routine colonoscopy: a case report |
| Source page | https://doi.org/10.1093/jscr/rjaf940 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12646259.1/rjaf940f1.jpg |
| DOI | 10.1093/jscr/rjaf940 |
| Published | 2025-11-25 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 63,895 bytes · `rjaf940f1.jpg` |
| Original SHA-256 | `ed735acd9b77a8e77477a248caa43cf6bf0558536560cbc3d712d159dddd63db` |
| Original preserved | imaging/real/source/ct-splenic-laceration-hemoperitoneum-2025-source.jpg |
| Licence evidence | Europe PMC full text of PMC12646259 (doi 10.1093/jscr/rjaf940), <license>: “This is an Open Access article distributed under the terms of the Creative Commons Attribution License ( https://creativecommons.org/licenses/by/4.0/ ), which permits unrestricted reuse, distribution, and reproduction in any medium, provided the original work is properly cited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-splenic-rupture-hemoperitoneum-axial-2026 — Splenic rupture with subcapsular haematoma

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-splenic-rupture-hemoperitoneum-axial-2026.jpg` |
| Clinical purpose | hemoperitoneum (ct-aorta) |
| Creator / authors | Kiara Sejfullai, Federica Giannini, Martina Sorrentino |
| Source | “Spontaneous Splenic Rupture Associated With Cytomegalovirus Infection: A Case Report”, Cureus 18:e111978 (2026), https://doi.org/10.7759/cureus.111978 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13428986.1/cureus-0018-00000111978-i01.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Kiara Sejfullai, Federica Giannini, Martina Sorrentino. “Spontaneous Splenic Rupture Associated With Cytomegalovirus Infection: A Case Report”, Cureus 18:e111978 (2026), https://doi.org/10.7759/cureus.111978 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13428986.1/cureus-0018-00000111978-i01.jpg. CC BY 4.0. |
| Original title | Spontaneous Splenic Rupture Associated With Cytomegalovirus Infection: A Case Report |
| Source page | https://doi.org/10.7759/cureus.111978 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13428986.1/cureus-0018-00000111978-i01.jpg |
| DOI | 10.7759/cureus.111978 |
| Published | 2026-07-03 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 54,263 bytes · `cureus-0018-00000111978-i01.jpg` |
| Original SHA-256 | `1362a05badfac9b83ca471d91dfb292371f6bf4e82155b558842325202944d5e` |
| Original preserved | imaging/real/ct-splenic-rupture-hemoperitoneum-axial-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13428986 (doi 10.7759/cureus.111978), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## fast-luq-positive-scandj-2023 — Positive FAST: fluid in the splenorenal space

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-luq-positive-scandj-2023.jpg` · `imaging/real/source/fast-luq-positive-scandj-2023-source.jpg` |
| Clinical purpose | fast_luq_positive (fast) |
| Creator / authors | Latif RK, Clifford SP, Baker JA, Lenhardt R, Haq MZ, Huang J, Farah I, Businger JR. |
| Source | “Traumatic hemorrhage and chain of survival”, Scandinavian journal of trauma, resuscitation and emergency medicine 31:25 (2023), https://doi.org/10.1186/s13049-023-01088-8 — https://pmc-oa-opendata.s3.amazonaws.com/PMC10207757.1/13049_2023_1088_Fig3_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 1 region(s) with identifiers or burnt-in text blacked out; one panel taken from the figure (panel b (LUQ view)); no other crop, mirroring or filtering. |
| Required attribution | Latif RK, Clifford SP, Baker JA, Lenhardt R, Haq MZ, Huang J, Farah I, Businger JR.. “Traumatic hemorrhage and chain of survival”, Scandinavian journal of trauma, resuscitation and emergency medicine 31:25 (2023), https://doi.org/10.1186/s13049-023-01088-8 — https://pmc-oa-opendata.s3.amazonaws.com/PMC10207757.1/13049_2023_1088_Fig3_HTML.jpg. CC BY 4.0. |
| Original title | Traumatic hemorrhage and chain of survival |
| Source page | https://doi.org/10.1186/s13049-023-01088-8 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC10207757.1/13049_2023_1088_Fig3_HTML.jpg |
| DOI | 10.1186/s13049-023-01088-8 |
| Published | 2023-05-24 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 70,329 bytes · `13049_2023_1088_Fig3_HTML.jpg` |
| Original SHA-256 | `02c9b50c203d97d38be7afe3c493b023674d59fa4050927ccb3ecd445f937eaf` |
| Original preserved | imaging/real/source/fast-luq-positive-scandj-2023-source.jpg |
| Licence evidence | Europe PMC full text of PMC10207757 (doi 10.1186/s13049-023-01088-8), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## fast-pelvis-negative-pocus-2021 — Negative FAST: normal transverse pelvic view

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-pelvis-negative-pocus-2021.jpg` · `imaging/real/source/fast-pelvis-negative-pocus-2021-source.jpg` |
| Clinical purpose | fast_pelvis_negative (fast) |
| Creator / authors | Fasseaux A, Pès P, Steenebruggen F, Dupriez F. |
| Source | “Are seminal vesicles a potential pitfall during pelvic exploration using point-of-care ultrasound (POCUS)?”, The ultrasound journal 13:14 (2021), https://doi.org/10.1186/s13089-021-00209-7 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7919994.2/13089_2021_209_Fig2_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (ultrasound panel only (drawing on the left removed)); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Fasseaux A, Pès P, Steenebruggen F, Dupriez F.. “Are seminal vesicles a potential pitfall during pelvic exploration using point-of-care ultrasound (POCUS)?”, The ultrasound journal 13:14 (2021), https://doi.org/10.1186/s13089-021-00209-7 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7919994.2/13089_2021_209_Fig2_HTML.jpg. CC BY 4.0. |
| Original title | Are seminal vesicles a potential pitfall during pelvic exploration using point-of-care ultrasound (POCUS)? |
| Source page | https://doi.org/10.1186/s13089-021-00209-7 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC7919994.2/13089_2021_209_Fig2_HTML.jpg |
| DOI | 10.1186/s13089-021-00209-7 |
| Published | 2021-03-01 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 54,031 bytes · `13089_2021_209_Fig2_HTML.jpg` |
| Original SHA-256 | `fdbf7630a43d559fedaca00186548c80adb4efc3dfe51b028298047d73ffc17f` |
| Original preserved | imaging/real/source/fast-pelvis-negative-pocus-2021-source.jpg |
| Licence evidence | Europe PMC full text of PMC7919994 (doi 10.1186/s13089-021-00209-7), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## fast-pelvis-seminal-vesicles-2021 — Pelvic FAST pitfall: seminal vesicles

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-pelvis-seminal-vesicles-2021.jpg` · `imaging/real/source/fast-pelvis-seminal-vesicles-2021-source.jpg` |
| Clinical purpose | fast_pelvis_negative (fast) |
| Creator / authors | Fasseaux A, Pès P, Steenebruggen F, Dupriez F. |
| Source | “Are seminal vesicles a potential pitfall during pelvic exploration using point-of-care ultrasound (POCUS)?”, The ultrasound journal 13:14 (2021), https://doi.org/10.1186/s13089-021-00209-7 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7919994.2/13089_2021_209_Fig1_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (ultrasound panel only (drawing on the left removed)); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Fasseaux A, Pès P, Steenebruggen F, Dupriez F.. “Are seminal vesicles a potential pitfall during pelvic exploration using point-of-care ultrasound (POCUS)?”, The ultrasound journal 13:14 (2021), https://doi.org/10.1186/s13089-021-00209-7 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7919994.2/13089_2021_209_Fig1_HTML.jpg. CC BY 4.0. |
| Original title | Are seminal vesicles a potential pitfall during pelvic exploration using point-of-care ultrasound (POCUS)? |
| Source page | https://doi.org/10.1186/s13089-021-00209-7 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC7919994.2/13089_2021_209_Fig1_HTML.jpg |
| DOI | 10.1186/s13089-021-00209-7 |
| Published | 2021-03-01 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 57,956 bytes · `13089_2021_209_Fig1_HTML.jpg` |
| Original SHA-256 | `db63bf5fc389d37244bf9f8649f4fb62e7ec1d1d9e6ebe5d0ba934acb0217b0b` |
| Original preserved | imaging/real/source/fast-pelvis-seminal-vesicles-2021-source.jpg |
| Licence evidence | Europe PMC full text of PMC7919994 (doi 10.1186/s13089-021-00209-7), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## fast-pericardial-positive-focus-2026 — Subxiphoid view: large pericardial effusion

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-pericardial-positive-focus-2026.jpg` · `imaging/real/source/fast-pericardial-positive-focus-2026-source.jpg` |
| Clinical purpose | fast_pericardial_positive (fast) |
| Creator / authors | H. A. Nati-Castillo, Martin Ocampo-Posada, Wilfredo Antonio Rivera-Martínez, Fredy Lizarazo Davila, Alice Gaibor-Pazmiño, Marlon Rojas-Cadena, Juan S. Izquierdo-Condoy |
| Source | “Myxedema-related cardiac tamponade diagnosed by focused cardiac ultrasound (FoCUS): a case report”, Frontiers in cardiovascular medicine 13:1753361 (2026), https://doi.org/10.3389/fcvm.2026.1753361 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12920499.1/fcvm-13-1753361-g001.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (panel B (subxiphoid four-chamber view)); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | H. A. Nati-Castillo, Martin Ocampo-Posada, Wilfredo Antonio Rivera-Martínez, Fredy Lizarazo Davila, Alice Gaibor-Pazmiño, Marlon Rojas-Cadena, Juan S. Izquierdo-Condoy. “Myxedema-related cardiac tamponade diagnosed by focused cardiac ultrasound (FoCUS): a case report”, Frontiers in cardiovascular medicine 13:1753361 (2026), https://doi.org/10.3389/fcvm.2026.1753361 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12920499.1/fcvm-13-1753361-g001.jpg. CC BY 4.0. |
| Original title | Myxedema-related cardiac tamponade diagnosed by focused cardiac ultrasound (FoCUS): a case report |
| Source page | https://doi.org/10.3389/fcvm.2026.1753361 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12920499.1/fcvm-13-1753361-g001.jpg |
| DOI | 10.3389/fcvm.2026.1753361 |
| Published | 2026-02-06 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 57,901 bytes · `fcvm-13-1753361-g001.jpg` |
| Original SHA-256 | `8bd87241a7b2e82d1d445b64dd603f70e3a586f860dcb356bb072ac81f1982b1` |
| Original preserved | imaging/real/source/fast-pericardial-positive-focus-2026-source.jpg |
| Licence evidence | Europe PMC full text of PMC12920499 (doi 10.3389/fcvm.2026.1753361), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open-access article distributed under the terms of the Creative Commons Attribution License (CC BY) . The use, distribution or reproduction in other forums is permitted, provided the original author(s) and the copyright owner(s) are credited an”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ij-compression-gillman-2010 — IJ vein flattens under probe pressure

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ij-compression-gillman-2010.mp4` · `imaging/real/ij-compression-gillman-2010.webm` · `imaging/real/ij-compression-gillman-2010.jpg` · `imaging/real/source/ij-compression-gillman-2010-source.ogv` |
| Clinical purpose | ij_compression (ijv) |
| Creator / authors | Gillman L, Blaivas M, Lord J, Al-Kadi A, Kirkpatrick A |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | Original OGV (theora, 640×480, 15.0 fps, 6.0 s) re-encoded to H.264 MP4 (CRF 20) and VP9 WebM (CRF 30) at the original frame rate and length; the scanner’s top status bar blacked out; audio none in the source; no crop, mirroring, speed change or other filtering. Poster = frame at 1.0 s. |
| Required attribution | Gillman L, Blaivas M, Lord J, Al-Kadi A, Kirkpatrick A. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Ultrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv. CC BY 2.0. |
| Original title | Identification of jugular vein by obliteration with pressure. Ultrasound guided placement of a left internal jugular central line. The artery and vein are diffe |
| Source page | https://commons.wikimedia.org/wiki/File:Ultrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/8/82/Ultrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2010 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | video/ogg · 617,989 bytes · `Ultrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv` |
| Original SHA-256 | `ea6239d8e1a4edab950368e1bf881b58ecc445632ff73e21056a84841f6cf3e8` |
| Original preserved | imaging/real/source/ij-compression-gillman-2010-source.ogv |
| Licence evidence | Wikimedia Commons API extmetadata for File:Ultrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AUltrasound-confirmation-of-guidewire-position-may-eliminate-accidental-arterial-dilatation-during-1757-7241-18-39-S3.ogv&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## chest-drain-unit-atrium — Water-seal chest drainage unit

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/chest-drain-unit-atrium.jpg` |
| Clinical purpose | chest_drain_unit (procedure) |
| Creator / authors | Johntex |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Chest_drain_-_empty.jpg |
| Licence | CC BY 2.5 — https://creativecommons.org/licenses/by/2.5 |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Johntex. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Chest_drain_-_empty.jpg. CC BY 2.5. |
| Original title | chest drain - empty |
| Source page | https://commons.wikimedia.org/wiki/File:Chest_drain_-_empty.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/3/34/Chest_drain_-_empty.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2006-11 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 3,000,898 bytes · `Chest drain - empty.jpg` |
| Original SHA-256 | `f6b5c0d3a4a77c97d243262eaaae8746c98a23c70affa7ba97107ebb79ebfd5e` |
| Original preserved | imaging/real/chest-drain-unit-atrium.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Chest drain - empty.jpg: LicenseShortName = “CC BY 2.5”, UsageTerms = “Creative Commons Attribution 2.5” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AChest+drain+-+empty.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## chest-drain-unit-bedside — Chest drain in use at the bedside

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/chest-drain-unit-bedside.jpg` |
| Clinical purpose | chest_drain_unit (procedure) |
| Creator / authors | Johntex |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Chest_drain_-_bedside_with_fluids.jpg |
| Licence | CC BY 2.5 — https://creativecommons.org/licenses/by/2.5 |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Johntex. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Chest_drain_-_bedside_with_fluids.jpg. CC BY 2.5. |
| Original title | chest drain - bedside with fluids |
| Source page | https://commons.wikimedia.org/wiki/File:Chest_drain_-_bedside_with_fluids.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/a/a3/Chest_drain_-_bedside_with_fluids.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2006-11 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 3,241,849 bytes · `Chest drain - bedside with fluids.jpg` |
| Original SHA-256 | `0d03c2e6dd2c6e2564669bc6324b1d03b290072b343a4d7a89aa6d3b9e45a5b9` |
| Original preserved | imaging/real/chest-drain-unit-bedside.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Chest drain - bedside with fluids.jpg: LicenseShortName = “CC BY 2.5”, UsageTerms = “Creative Commons Attribution 2.5” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AChest+drain+-+bedside+with+fluids.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## needle-decompression-site-cureus-2022 — Where paramedics placed needle decompression

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/needle-decompression-site-cureus-2022.jpg` |
| Clinical purpose | needle_decompression_site (procedure) |
| Creator / authors | Jeffrey S Lubin, Joshua Knapp, Maude L Kettenmann |
| Source | “Paramedic Understanding of Tension Pneumothorax and Needle Thoracostomy (NT) Site Selection”, Cureus 14:e27013 (2022), https://doi.org/10.7759/cureus.27013 — https://pmc-oa-opendata.s3.amazonaws.com/PMC9386319.1/cureus-0014-00000027013-i01.jpg |
| Licence | CC BY 3.0 — https://creativecommons.org/licenses/by/3.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Jeffrey S Lubin, Joshua Knapp, Maude L Kettenmann. “Paramedic Understanding of Tension Pneumothorax and Needle Thoracostomy (NT) Site Selection”, Cureus 14:e27013 (2022), https://doi.org/10.7759/cureus.27013 — https://pmc-oa-opendata.s3.amazonaws.com/PMC9386319.1/cureus-0014-00000027013-i01.jpg. CC BY 3.0. |
| Original title | Paramedic Understanding of Tension Pneumothorax and Needle Thoracostomy (NT) Site Selection |
| Source page | https://doi.org/10.7759/cureus.27013 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC9386319.1/cureus-0014-00000027013-i01.jpg |
| DOI | 10.7759/cureus.27013 |
| Published | 2022-07-19 |
| Retrieved | 2026-10-09T16:42Z |
| Original format | image/jpeg · 111,869 bytes · `cureus-0014-00000027013-i01.jpg` |
| Original SHA-256 | `554f2cc057bfbac9a4006d1a42ed5db21240013f74ca8d1edf6249b6d2e6586b` |
| Original preserved | imaging/real/needle-decompression-site-cureus-2022.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC9386319 (doi 10.7759/cureus.27013), <license>: “https://creativecommons.org/licenses/by/3.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## fast-pericardial-negative-subcostal-2020 — Normal subcostal four-chamber view

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/fast-pericardial-negative-subcostal-2020.jpg` · `imaging/real/source/fast-pericardial-negative-subcostal-2020-source.jpg` |
| Clinical purpose | fast_pericardial_negative (fast) |
| Creator / authors | Rajkumar Rajendram, Arif Hussain, Naveed Mahmood, Mubashar Kharal |
| Source | “Feasibility of using a handheld ultrasound device to detect and characterize shunt and deep vein thrombosis in patients with COVID-19: an observational study”, The ultrasound journal 12:49 (2020), https://doi.org/10.1186/s13089-020-00197-0 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7702202.2/13089_2020_197_Fig3_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.33, y 0.00–1.00 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Rajkumar Rajendram, Arif Hussain, Naveed Mahmood, Mubashar Kharal. “Feasibility of using a handheld ultrasound device to detect and characterize shunt and deep vein thrombosis in patients with COVID-19: an observational study”, The ultrasound journal 12:49 (2020), https://doi.org/10.1186/s13089-020-00197-0 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7702202.2/13089_2020_197_Fig3_HTML.jpg. CC BY 4.0. |
| Original title | Feasibility of using a handheld ultrasound device to detect and characterize shunt and deep vein thrombosis in patients with COVID-19: an observational study |
| Source page | https://doi.org/10.1186/s13089-020-00197-0 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC7702202.2/13089_2020_197_Fig3_HTML.jpg |
| DOI | 10.1186/s13089-020-00197-0 |
| Published | 2020-11-30 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 62,120 bytes · `13089_2020_197_Fig3_HTML.jpg` |
| Original SHA-256 | `ef3dcc0825cc9f275690d85a6580e1de76bf8c7b741247b3efb0bbd9f82ecdab` |
| Original preserved | imaging/real/source/fast-pericardial-negative-subcostal-2020-source.jpg |
| Licence evidence | Europe PMC full text of PMC7702202 (doi 10.1186/s13089-020-00197-0), <license>: “https://creativecommons.org/licenses/by/4.0/ Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original auth”; Fig. 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## lus-lung-pulse-mmode-cureus-2025 — Lung pulse on M-mode

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/lus-lung-pulse-mmode-cureus-2025.jpg` · `imaging/real/source/lus-lung-pulse-mmode-cureus-2025-source.jpg` |
| Clinical purpose | lung_pulse (lus) |
| Creator / authors | Keith Killu, Monika Kakol |
| Source | “Practical Applications of Lung and Diaphragm Ultrasound in the Intensive Care Unit: An Updated Narrative Review”, Cureus 17:e88584 (2025), https://doi.org/10.7759/cureus.88584 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12309786.1/cureus-0017-00000088584-i02.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.66–1.00, y 0.54–1.00 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Keith Killu, Monika Kakol. “Practical Applications of Lung and Diaphragm Ultrasound in the Intensive Care Unit: An Updated Narrative Review”, Cureus 17:e88584 (2025), https://doi.org/10.7759/cureus.88584 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12309786.1/cureus-0017-00000088584-i02.jpg. CC BY 4.0. |
| Original title | Practical Applications of Lung and Diaphragm Ultrasound in the Intensive Care Unit: An Updated Narrative Review |
| Source page | https://doi.org/10.7759/cureus.88584 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12309786.1/cureus-0017-00000088584-i02.jpg |
| DOI | 10.7759/cureus.88584 |
| Published | 2025-07-23 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 100,752 bytes · `cureus-0017-00000088584-i02.jpg` |
| Original SHA-256 | `9f03ca51d66cc9c14e7a542ceee791e1e714f2d93410d872f5238f9f2c739635` |
| Original preserved | imaging/real/source/lus-lung-pulse-mmode-cureus-2025-source.jpg |
| Licence evidence | Europe PMC full text of PMC12309786 (doi 10.7759/cureus.88584), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ij-thrombus-compression-cureus-2025 — Internal jugular thrombus that does not compress

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ij-thrombus-compression-cureus-2025.jpg` |
| Clinical purpose | ij_thrombus (ijv) |
| Creator / authors | Vaaragie Subramaniam, William Echols, Jessica Houck |
| Source | “Atypical Presentation of Lemierre Syndrome Without an Oropharyngeal Source in a Young Adult Male Patient”, Cureus 17:e95740 (2025), https://doi.org/10.7759/cureus.95740 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12664772.1/cureus-0017-00000095740-i02.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Vaaragie Subramaniam, William Echols, Jessica Houck. “Atypical Presentation of Lemierre Syndrome Without an Oropharyngeal Source in a Young Adult Male Patient”, Cureus 17:e95740 (2025), https://doi.org/10.7759/cureus.95740 — https://pmc-oa-opendata.s3.amazonaws.com/PMC12664772.1/cureus-0017-00000095740-i02.jpg. CC BY 4.0. |
| Original title | Atypical Presentation of Lemierre Syndrome Without an Oropharyngeal Source in a Young Adult Male Patient |
| Source page | https://doi.org/10.7759/cureus.95740 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC12664772.1/cureus-0017-00000095740-i02.jpg |
| DOI | 10.7759/cureus.95740 |
| Published | 2025-10-30 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 57,330 bytes · `cureus-0017-00000095740-i02.jpg` |
| Original SHA-256 | `6d4b14c1d9a62c4c9a15cb1a3c135712931cd7f2ff0872d0884ce0444082dd6f` |
| Original preserved | imaging/real/ij-thrombus-compression-cureus-2025.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC12664772 (doi 10.7759/cureus.95740), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ij-thrombus-longitudinal-cureus-2026 — Internal jugular thrombus, long axis

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ij-thrombus-longitudinal-cureus-2026.jpg` |
| Clinical purpose | ij_thrombus (ijv) |
| Creator / authors | Nikolaos I Davanellos, Despoina Paraskeva, Dimitrios Argiropoulos, Michalis Apergis, Christina Pachi, Ioannis Maragkos, Nikolaos Palyvos |
| Source | “Lemierre Syndrome Presenting With Septic Pulmonary Emboli: A Case Report and Diagnostic Challenges”, Cureus 18:e109678 (2026), https://doi.org/10.7759/cureus.109678 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13296912.1/cureus-0018-00000109678-i02.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Nikolaos I Davanellos, Despoina Paraskeva, Dimitrios Argiropoulos, Michalis Apergis, Christina Pachi, Ioannis Maragkos, Nikolaos Palyvos. “Lemierre Syndrome Presenting With Septic Pulmonary Emboli: A Case Report and Diagnostic Challenges”, Cureus 18:e109678 (2026), https://doi.org/10.7759/cureus.109678 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13296912.1/cureus-0018-00000109678-i02.jpg. CC BY 4.0. |
| Original title | Lemierre Syndrome Presenting With Septic Pulmonary Emboli: A Case Report and Diagnostic Challenges |
| Source page | https://doi.org/10.7759/cureus.109678 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13296912.1/cureus-0018-00000109678-i02.jpg |
| DOI | 10.7759/cureus.109678 |
| Published | 2026-05-26 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 93,313 bytes · `cureus-0018-00000109678-i02.jpg` |
| Original SHA-256 | `51ee94999a292e10c257eb1de6888f27a1bcb63e6098e0a6d9a58fb04616b9f0` |
| Original preserved | imaging/real/ij-thrombus-longitudinal-cureus-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13296912 (doi 10.7759/cureus.109678), <license>: “https://creativecommons.org/licenses/by/4.0/ This is an open access article distributed under the terms of the Creative Commons Attribution License CC-BY 4.0., which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are credited.”; Figure 2 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-tension-ptx-right-hydatid-2023 — Right tension pneumothorax (portable film)

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-tension-ptx-right-hydatid-2023.jpg` · `imaging/real/source/cxr-tension-ptx-right-hydatid-2023-source.jpg` |
| Clinical purpose | tension_ptx (cxr) |
| Creator / authors | Rezaei R, Sadidi H, Taqanaki PB. |
| Source | “Tension pneumothorax caused by the ruptured hydatid cyst of the lung”, Clinical case reports 11:e07542 (2023), https://doi.org/10.1002/ccr3.7542 — https://pmc-oa-opendata.s3.amazonaws.com/PMC10323720.1/CCR3-11-e07542-g001.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 3 region(s) with identifiers or burnt-in text blacked out; padded by one black pixel to even dimensions; no crop, mirroring or filtering. |
| Required attribution | Rezaei R, Sadidi H, Taqanaki PB.. “Tension pneumothorax caused by the ruptured hydatid cyst of the lung”, Clinical case reports 11:e07542 (2023), https://doi.org/10.1002/ccr3.7542 — https://pmc-oa-opendata.s3.amazonaws.com/PMC10323720.1/CCR3-11-e07542-g001.jpg. CC BY 4.0. |
| Original title | Tension pneumothorax caused by the ruptured hydatid cyst of the lung |
| Source page | https://doi.org/10.1002/ccr3.7542 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC10323720.1/CCR3-11-e07542-g001.jpg |
| DOI | 10.1002/ccr3.7542 |
| Published | 2023-07-06 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 70,589 bytes · `CCR3-11-e07542-g001.jpg` |
| Original SHA-256 | `8095bc9ace2f6a54747d9e5ec245f460aff35301711f54106bcfdb244e2d146c` |
| Original preserved | imaging/real/source/cxr-tension-ptx-right-hydatid-2023-source.jpg |
| Licence evidence | Europe PMC full text of PMC10323720 (doi 10.1002/ccr3.7542), <license>: “This is an open access article under the terms of the http://creativecommons.org/licenses/by/4.0/ License, which permits use, distribution and reproduction in any medium, provided the original work is properly cited.”; FIGURE 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## cxr-tension-ptx-right-covid-2022 — Right tension pneumothorax in COVID-19 pneumonia

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/cxr-tension-ptx-right-covid-2022.jpg` · `imaging/real/source/cxr-tension-ptx-right-covid-2022-source.jpg` |
| Clinical purpose | tension_ptx (cxr) |
| Creator / authors | Ata F, Yousaf Z, Farsakoury R, Khan AA, Arshad A, Omran M, Ananthegowda DC, Khatib M, Chughtai TS. |
| Source | “Spontaneous tension pneumothorax as a complication of Coronavirus disease 2019: Case report and literature review”, Clinical case reports 10:e05852 (2022), https://doi.org/10.1002/ccr3.5852 — https://pmc-oa-opendata.s3.amazonaws.com/PMC9083808.2/CCR3-10-0-g003.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; 1 region(s) with identifiers or burnt-in text blacked out; one panel taken from the figure (region x 0.55–1.00, y 0.00–1.00 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Ata F, Yousaf Z, Farsakoury R, Khan AA, Arshad A, Omran M, Ananthegowda DC, Khatib M, Chughtai TS.. “Spontaneous tension pneumothorax as a complication of Coronavirus disease 2019: Case report and literature review”, Clinical case reports 10:e05852 (2022), https://doi.org/10.1002/ccr3.5852 — https://pmc-oa-opendata.s3.amazonaws.com/PMC9083808.2/CCR3-10-0-g003.jpg. CC BY 4.0. |
| Original title | Spontaneous tension pneumothorax as a complication of Coronavirus disease 2019: Case report and literature review |
| Source page | https://doi.org/10.1002/ccr3.5852 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC9083808.2/CCR3-10-0-g003.jpg |
| DOI | 10.1002/ccr3.5852 |
| Published | 2022-05-09 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 41,382 bytes · `CCR3-10-0-g003.jpg` |
| Original SHA-256 | `81b58a35e53613fd360b580b505df8055f5807beb759fcfe18482ece3daab5a3` |
| Original preserved | imaging/real/source/cxr-tension-ptx-right-covid-2022-source.jpg |
| Licence evidence | Europe PMC full text of PMC9083808 (doi 10.1002/ccr3.5852), <license>: “This is an open access article under the terms of the http://creativecommons.org/licenses/by/4.0/ License, which permits use, distribution and reproduction in any medium, provided the original work is properly cited.”; FIGURE 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## peds-bronchiolitis-hyperinflation-commons — Bronchiolitis: hyperinflation with patchy atelectasis

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/peds-bronchiolitis-hyperinflation-commons.jpg` |
| Clinical purpose | bronchiolitis_hyperinflation (peds-xray) |
| Creator / authors | Matteo Di Nardo, Daniela Perrotta, Francesca Stoppa, Corrado Cecchetti, Marco Marano and Nicola Pirozzi |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Bronchiolitis_chest_X-ray.jpg |
| Licence | CC BY 2.0 — https://creativecommons.org/licenses/by/2.0 |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Matteo Di Nardo, Daniela Perrotta, Francesca Stoppa, Corrado Cecchetti, Marco Marano and Nicola Pirozzi. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Bronchiolitis_chest_X-ray.jpg. CC BY 2.0. |
| Original title | A chest radiograph demonstrating lung hyperinflation with a flattened diaphragm and bilateral atelectasis in the right apical and left basal regions in a 16-day |
| Source page | https://commons.wikimedia.org/wiki/File:Bronchiolitis_chest_X-ray.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/e/e1/Bronchiolitis_chest_X-ray.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | Published: 19 June 2008 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 22,692 bytes · `Bronchiolitis chest X-ray.jpg` |
| Original SHA-256 | `03965fd107c11183fd5e4cdacee09a9fd8499f1df46cdc8510eef84f6dd5645c` |
| Original preserved | imaging/real/peds-bronchiolitis-hyperinflation-commons.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Bronchiolitis chest X-ray.jpg: LicenseShortName = “CC BY 2.0”, UsageTerms = “Creative Commons Attribution 2.0” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3ABronchiolitis+chest+X-ray.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## peds-pneumonia-bocavirus-commons — Viral pneumonia in a toddler

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/peds-pneumonia-bocavirus-commons.jpg` |
| Clinical purpose | pediatric_pneumonia (peds-xray) |
| Creator / authors | Alma Jula, Matti Waris, Kalle Kantola, Ville Peltola, Maria Söderlund-Venermo, Klaus Hedman, and Olli Ruuskanen |
| Source | Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Human_bocavirus_1_pneumonia.jpg |
| Licence | Public Domain — https://creativecommons.org/publicdomain/mark/1.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Alma Jula, Matti Waris, Kalle Kantola, Ville Peltola, Maria Söderlund-Venermo, Klaus Hedman, and Olli Ruuskanen. Wikimedia Commons — https://commons.wikimedia.org/wiki/File:Human_bocavirus_1_pneumonia.jpg. Public Domain. |
| Original title | Figure. . Chest radiograph of the index patient, a 16-month-old boy in Finland with human bocavirus 1 pneumonia, on day 2 of hospitalization. Bilateral pulmonar |
| Source page | https://commons.wikimedia.org/wiki/File:Human_bocavirus_1_pneumonia.jpg |
| Original media URL | https://upload.wikimedia.org/wikipedia/commons/8/8a/Human_bocavirus_1_pneumonia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original |
| DOI | — |
| Published | 2013 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 43,815 bytes · `Human bocavirus 1 pneumonia.jpg` |
| Original SHA-256 | `1096552fe88296618c2f3e4be15a791e7091908117c55cb2babf08e30dc1909d` |
| Original preserved | imaging/real/peds-pneumonia-bocavirus-commons.jpg (identical to the original) |
| Licence evidence | Wikimedia Commons API extmetadata for File:Human bocavirus 1 pneumonia.jpg: LicenseShortName = “Public domain”, UsageTerms = “Public domain” (https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo&titles=File%3AHuman+bocavirus+1+pneumonia.jpg&iiprop=url%7Csha1%7Csize%7Cmime%7Cextmetadata) |
| Verified by | tools/clinical_media.py fetch |

## ct-dissection-type-a-ascending-flap-2022 — Type A dissection: flap in the ascending aorta

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-dissection-type-a-ascending-flap-2022.jpg` · `imaging/real/source/ct-dissection-type-a-ascending-flap-2022-source.jpg` |
| Clinical purpose | dissection_type_a (ct-aorta) |
| Creator / authors | Zhang Q, Yang DD, Xu YF, Qiu YG, Zhang ZY. |
| Source | “De Winter electrocardiogram pattern due to type A aortic dissection: a case report”, BMC cardiovascular disorders 22:150 (2022), https://doi.org/10.1186/s12872-022-02596-8 — https://pmc-oa-opendata.s3.amazonaws.com/PMC8981714.1/12872_2022_2596_Fig4_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.60, y 0.00–1.00 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Zhang Q, Yang DD, Xu YF, Qiu YG, Zhang ZY.. “De Winter electrocardiogram pattern due to type A aortic dissection: a case report”, BMC cardiovascular disorders 22:150 (2022), https://doi.org/10.1186/s12872-022-02596-8 — https://pmc-oa-opendata.s3.amazonaws.com/PMC8981714.1/12872_2022_2596_Fig4_HTML.jpg. CC BY 4.0. |
| Original title | De Winter electrocardiogram pattern due to type A aortic dissection: a case report |
| Source page | https://doi.org/10.1186/s12872-022-02596-8 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC8981714.1/12872_2022_2596_Fig4_HTML.jpg |
| DOI | 10.1186/s12872-022-02596-8 |
| Published | 2022-04-05 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 362,271 bytes · `12872_2022_2596_Fig4_HTML.jpg` |
| Original SHA-256 | `180be41a5189da73bc5f3c2ab46180010b22708d51618893354a5e2ae89f1aad` |
| Original preserved | imaging/real/source/ct-dissection-type-a-ascending-flap-2022-source.jpg |
| Licence evidence | Europe PMC full text of PMC8981714 (doi 10.1186/s12872-022-02596-8), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 4 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-dissection-type-a-ascending-tear-2020 — Type A dissection with flaps in ascending and descending aorta

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-dissection-type-a-ascending-tear-2020.jpg` · `imaging/real/source/ct-dissection-type-a-ascending-tear-2020-source.jpg` |
| Clinical purpose | dissection_type_a (ct-aorta) |
| Creator / authors | Zhang K, Dong SB, Pan XD, Sun LZ. |
| Source | “The onset of acute type A aortic dissection following recovery of type B intramural haematoma: a case report”, BMC cardiovascular disorders 20:162 (2020), https://doi.org/10.1186/s12872-020-01440-1 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7137196.1/12872_2020_1440_Fig3_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.34, y 0.00–1.00 of the original); no other crop, mirroring or filtering. |
| Required attribution | Zhang K, Dong SB, Pan XD, Sun LZ.. “The onset of acute type A aortic dissection following recovery of type B intramural haematoma: a case report”, BMC cardiovascular disorders 20:162 (2020), https://doi.org/10.1186/s12872-020-01440-1 — https://pmc-oa-opendata.s3.amazonaws.com/PMC7137196.1/12872_2020_1440_Fig3_HTML.jpg. CC BY 4.0. |
| Original title | The onset of acute type A aortic dissection following recovery of type B intramural haematoma: a case report |
| Source page | https://doi.org/10.1186/s12872-020-01440-1 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC7137196.1/12872_2020_1440_Fig3_HTML.jpg |
| DOI | 10.1186/s12872-020-01440-1 |
| Published | 2020-04-06 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 39,553 bytes · `12872_2020_1440_Fig3_HTML.jpg` |
| Original SHA-256 | `caef735392ce4548a63a90a551957760bdf8c0f4fdb998d14b9f9f737b5b6a50` |
| Original preserved | imaging/real/source/ct-dissection-type-a-ascending-tear-2020-source.jpg |
| Licence evidence | Europe PMC full text of PMC7137196 (doi 10.1186/s12872-020-01440-1), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-aaa-mural-thrombus-8cm-2021 — Intact 8 cm AAA with mural thrombus

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-aaa-mural-thrombus-8cm-2021.jpg` · `imaging/real/source/ct-aaa-mural-thrombus-8cm-2021-source.jpg` |
| Clinical purpose | aaa (ct-aorta) |
| Creator / authors | Peña R, Valverde S, Alcázar JA, Cebrián P, González-Porras JR, Lozano FS. |
| Source | “Abdominal aortic aneurysm and acute appendicitis: a case report and review of the literature”, Journal of medical case reports 15:203 (2021), https://doi.org/10.1186/s13256-021-02703-x — https://pmc-oa-opendata.s3.amazonaws.com/PMC8052834.1/13256_2021_2703_Fig1_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.00–0.49, y 0.00–1.00 of the original); no other crop, mirroring or filtering. |
| Required attribution | Peña R, Valverde S, Alcázar JA, Cebrián P, González-Porras JR, Lozano FS.. “Abdominal aortic aneurysm and acute appendicitis: a case report and review of the literature”, Journal of medical case reports 15:203 (2021), https://doi.org/10.1186/s13256-021-02703-x — https://pmc-oa-opendata.s3.amazonaws.com/PMC8052834.1/13256_2021_2703_Fig1_HTML.jpg. CC BY 4.0. |
| Original title | Abdominal aortic aneurysm and acute appendicitis: a case report and review of the literature |
| Source page | https://doi.org/10.1186/s13256-021-02703-x |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC8052834.1/13256_2021_2703_Fig1_HTML.jpg |
| DOI | 10.1186/s13256-021-02703-x |
| Published | 2021-04-17 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 351,411 bytes · `13256_2021_2703_Fig1_HTML.jpg` |
| Original SHA-256 | `070dfa670d03798b1771b2a8663c93eb0810c3864511bd7a1e77077ec7b04b8f` |
| Original preserved | imaging/real/source/ct-aaa-mural-thrombus-8cm-2021-source.jpg |
| Licence evidence | Europe PMC full text of PMC8052834 (doi 10.1186/s13256-021-02703-x), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-pneumatosis-colon-wall-2021 — Pneumatosis of the ascending colon

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-pneumatosis-colon-wall-2021.jpg` |
| Clinical purpose | pneumatosis (ct-aorta) |
| Creator / authors | Toda S, Iwasaki H, Murayama D, Isoda M, Nakayama H, Suganuma N, Masudo K. |
| Source | “Pneumatosis intestinalis associated with lenvatinib during thyroid cancer treatment: a case report”, Journal of medical case reports 15:556 (2021), https://doi.org/10.1186/s13256-021-03158-w — https://pmc-oa-opendata.s3.amazonaws.com/PMC8588671.1/13256_2021_3158_Fig3_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Toda S, Iwasaki H, Murayama D, Isoda M, Nakayama H, Suganuma N, Masudo K.. “Pneumatosis intestinalis associated with lenvatinib during thyroid cancer treatment: a case report”, Journal of medical case reports 15:556 (2021), https://doi.org/10.1186/s13256-021-03158-w — https://pmc-oa-opendata.s3.amazonaws.com/PMC8588671.1/13256_2021_3158_Fig3_HTML.jpg. CC BY 4.0. |
| Original title | Pneumatosis intestinalis associated with lenvatinib during thyroid cancer treatment: a case report |
| Source page | https://doi.org/10.1186/s13256-021-03158-w |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC8588671.1/13256_2021_3158_Fig3_HTML.jpg |
| DOI | 10.1186/s13256-021-03158-w |
| Published | 2021-11-12 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 170,303 bytes · `13256_2021_3158_Fig3_HTML.jpg` |
| Original SHA-256 | `ad2a1b35e308eca4d8ab0f813fa6bca83aaf7100a0223a6c54a8806362264f0f` |
| Original preserved | imaging/real/ct-pneumatosis-colon-wall-2021.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC8588671 (doi 10.1186/s13256-021-03158-w), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 3 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-pneumatosis-cystoides-coronal-2021 — Cystic pneumatosis of the splenic flexure

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-pneumatosis-cystoides-coronal-2021.jpg` · `imaging/real/source/ct-pneumatosis-cystoides-coronal-2021-source.jpg` |
| Clinical purpose | pneumatosis (ct-aorta) |
| Creator / authors | Lebby E, Hanna M, Bui TL, Rudd A, Lee W, Houshyar R. |
| Source | “Pneumatosis cystoides intestinalis in a trauma patient presenting with pneumoperitoneum: a case report”, Journal of medical case reports 15:597 (2021), https://doi.org/10.1186/s13256-021-03183-9 — https://pmc-oa-opendata.s3.amazonaws.com/PMC8680031.1/13256_2021_3183_Fig1_HTML.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | Converted to JPEG; one panel taken from the figure (region x 0.27–0.67, y 0.00–1.00 of the original); padded by one black pixel to even dimensions; no other crop, mirroring or filtering. |
| Required attribution | Lebby E, Hanna M, Bui TL, Rudd A, Lee W, Houshyar R.. “Pneumatosis cystoides intestinalis in a trauma patient presenting with pneumoperitoneum: a case report”, Journal of medical case reports 15:597 (2021), https://doi.org/10.1186/s13256-021-03183-9 — https://pmc-oa-opendata.s3.amazonaws.com/PMC8680031.1/13256_2021_3183_Fig1_HTML.jpg. CC BY 4.0. |
| Original title | Pneumatosis cystoides intestinalis in a trauma patient presenting with pneumoperitoneum: a case report |
| Source page | https://doi.org/10.1186/s13256-021-03183-9 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC8680031.1/13256_2021_3183_Fig1_HTML.jpg |
| DOI | 10.1186/s13256-021-03183-9 |
| Published | 2021-12-17 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 175,106 bytes · `13256_2021_3183_Fig1_HTML.jpg` |
| Original SHA-256 | `69872846cd8f43ce44f9ff5cfbe0f1af7580e158ebe09aee71df9b3a53b861fe` |
| Original preserved | imaging/real/source/ct-pneumatosis-cystoides-coronal-2021-source.jpg |
| Licence evidence | Europe PMC full text of PMC8680031 (doi 10.1186/s13256-021-03183-9), <license>: “Open Access This article is licensed under a Creative Commons Attribution 4.0 International License, which permits use, sharing, adaptation, distribution and reproduction in any medium or format, as long as you give appropriate credit to the original author(s) and the source, provide a link to the C”; Fig. 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## ct-mesenteric-injury-hemoperitoneum-2026 — Blunt mesenteric injury with active bleeding

| Field | Value |
|---|---|
| Local file(s) | `imaging/real/ct-mesenteric-injury-hemoperitoneum-2026.jpg` |
| Clinical purpose | hemoperitoneum (ct-aorta) |
| Creator / authors | Gottam B, McCoy CE. |
| Source | “Bucket Handle Injury in Blunt Abdominal Trauma”, Clinical practice and cases in emergency medicine 10:219-221 (2026), https://doi.org/10.5811/cpcem.48848 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13135440.1/cpcem-10-219-g001.jpg |
| Licence | CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/ |
| Modifications | None — the displayed file is the original, byte for byte. |
| Required attribution | Gottam B, McCoy CE.. “Bucket Handle Injury in Blunt Abdominal Trauma”, Clinical practice and cases in emergency medicine 10:219-221 (2026), https://doi.org/10.5811/cpcem.48848 — https://pmc-oa-opendata.s3.amazonaws.com/PMC13135440.1/cpcem-10-219-g001.jpg. CC BY 4.0. |
| Original title | Bucket Handle Injury in Blunt Abdominal Trauma |
| Source page | https://doi.org/10.5811/cpcem.48848 |
| Original media URL | https://pmc-oa-opendata.s3.amazonaws.com/PMC13135440.1/cpcem-10-219-g001.jpg |
| DOI | 10.5811/cpcem.48848 |
| Published | 2026-05-01 |
| Retrieved | 2026-10-09T17:10Z |
| Original format | image/jpeg · 30,600 bytes · `cpcem-10-219-g001.jpg` |
| Original SHA-256 | `27c672fcd4d6637c26855822ad97f0f508ef68a14d845a19cf8be1973142d508` |
| Original preserved | imaging/real/ct-mesenteric-injury-hemoperitoneum-2026.jpg (identical to the original) |
| Licence evidence | Europe PMC full text of PMC13135440 (doi 10.5811/cpcem.48848), <license>: “This is an open access article distributed in accordance with the terms of the Creative Commons Attribution (CC BY 4.0) License. See: http://creativecommons.org/licenses/by/4.0/”; Image 1 caption checked for a separate credit. |
| Verified by | tools/clinical_media.py fetch |

## Pending — staged, not yet in the app

Teaching content is written; the media has not been downloaded and the licence has not been verified from the source.

| ID | Finding | Claimed licence | Source page |
|---|---|---|---|
| lus-confluent-tsung | confluent_blines | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Prospective-application-of-clinician-performed-lung-ultrasonography-during-the-2009-H1N1-influenza-2036-7902-4-16-S2.ogv |
| lus-consolidation-tsung | consolidation | CC BY 2.0 (unverified) | https://commons.wikimedia.org/wiki/File:Prospective-application-of-clinician-performed-lung-ultrasonography-during-the-2009-H1N1-influenza-2036-7902-4-16-S3.ogv |
| echo-vsd-color-commons | ventricular septal defect | Public Domain (unverified) | https://commons.wikimedia.org/wiki/File:Ventricular_Septal_Defect.jpg |
| echo-asd-secundum-commons | secundum atrial septal defect | Public Domain (unverified) | https://commons.wikimedia.org/wiki/File:Echokardiogram_von_Atriumseptumdefekt_(Ostium_secundum).jpg |
| aorta-normal-us-axial-haggstrom | aorta_normal_us | CC0 (unverified) | https://commons.wikimedia.org/wiki/File:Axial_plane_ultrasound_at_the_navel.jpg |

## Considered and rejected

- Open Critical Care anesthesia POCUS pocket card (2022): No licence stated; images credited “courtesy of” third parties (JACC, austincc.edu, echocardiographer.org). Used for facts only, in our own words.
- COVID-BLUES lung ultrasound dataset: CC BY-NC-ND 4.0
- covid19_ultrasound clips attributed to “charlotte” (source id 14): Licence listed but origin not identifiable — unclear.
- Radiopaedia-derived images in covid-chestxray-dataset: CC BY-NC-SA
- covid19_ultrasound clip “Pneu_prospective_file3” (The Ultrasound Journal / Critical Ultrasound Journal 4:16, 2012, doi 10.1186/2036-7902-4-16): Listed as CC BY 2.0, but the article page could not be read to confirm authors and licence (rate-limited) — not included until verified.
- CC BY-SA alternative IVC clip offered in the asset bundle: Share-alike is not on this project’s accepted list — kept out, as the bundle recommends.
