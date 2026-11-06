/** Real-patient thumbnail stills already shipped under /imaging/real/.
 * Sources were selected from the vetted clinical media manifest; no new third-party hosting.
 * They illustrate findings and must never be described as the simulated patient.
 */
export interface ClinicalThumb {
  id: string;
  file: string;
  title: string;
  credit: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}
export const CLINICAL_THUMBS: Readonly<Record<string, ClinicalThumb>> = {
  "vent-ards": {
    "id": "cxr-ards-2019",
    "file": "cxr-ards-2019.jpg",
    "title": "ARDS",
    "credit": "Ngu et al., Cureus, 2019 · CC BY 3.0",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
    "sourceUrl": "https://doi.org/10.7759/cureus.3997"
  },
  "vent-ptx": {
    "id": "cxr-tension-ptx-right-olv-2024",
    "file": "cxr-tension-ptx-right-olv-2024.jpg",
    "title": "Right tension pneumothorax during one-lung ventilation",
    "credit": "Chang et al., Cureus, 2024 · CC BY 4.0",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "sourceUrl": "https://doi.org/10.7759/cureus.61306"
  },
  "vent-desat": {
    "id": "cxr-mainstem-right-ebi-2019",
    "file": "cxr-mainstem-right-ebi-2019.jpg",
    "title": "Right mainstem (endobronchial) intubation",
    "credit": "Hernandez et al., PloS one, 2019 · CC BY 4.0",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "sourceUrl": "https://doi.org/10.1371/journal.pone.0217466"
  },
  "neuro-stroke": {
    "id": "stroke-ctp-mismatch-2025",
    "file": "stroke-ctp-mismatch-2025.jpg",
    "title": "CT perfusion: core and penumbra",
    "credit": "Qureshi et al., Cureus, 2025 · CC BY 4.0",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "sourceUrl": "https://doi.org/10.7759/cureus.98724"
  },
  "neuro-icp": {
    "id": "ich-deep-locations-2016",
    "file": "ich-deep-locations-2016.jpg",
    "title": "Hypertensive haemorrhage sites",
    "credit": "Manoel et al., Critical care (London, England), 2016 · CC BY 4.0",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "sourceUrl": "https://doi.org/10.1186/s13054-016-1432-0"
  },
  "abd-fast": {
    "id": "fast-ruq-positive",
    "file": "fast-ruq-positive.jpg",
    "title": "Positive FAST — right upper quadrant",
    "credit": "Gillman et al., Scand J Trauma Resusc Emerg Med 2009 · CC BY 2.0",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Clinician-performed-resuscitative-ultrasonography-for-the-initial-evaluation-and-resuscitation-of-1757-7241-17-34-S1.ogv"
  },
  "abd-aorta": {
    "id": "aaa-us-sagittal-haggstrom",
    "file": "aaa-us-sagittal-haggstrom.jpg",
    "title": "AAA, long axis",
    "credit": "Häggström, Wikimedia Commons, 2018 · CC0",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ultrasonography_of_abdominal_aortic_aneurysm_in_sagittal_plane.jpg"
  }
};
