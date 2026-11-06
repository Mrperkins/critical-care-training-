# Library thumbnail art, clinical sources, and licensing

All 26 modules retain their original app-captured `app/public/thumbs/<id>.jpg` as reliable local fallbacks. The library prefers the existing `imaging/real/` clinical still for the seven modules listed below, and reverts to the original 3D still if the corresponding real asset fails to load.

Each real image depicts a **different patient** from the simulator. Do not relabel it as an image from the simulated patient, erase its author credit, or imply one image alone proves a clinical diagnosis.

## Selected real thumbnail stills

| Module | Image ID | Shipped file | Attribution | License |
|---|---|---|---|---|
| vent-ards | cxr-ards-2019 | `imaging/real/cxr-ards-2019.jpg` | Ngu et al., Cureus, 2019 · CC BY 3.0 | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| vent-ptx | cxr-tension-ptx-right-olv-2024 | `imaging/real/cxr-tension-ptx-right-olv-2024.jpg` | Chang et al., Cureus, 2024 · CC BY 4.0 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| vent-desat | cxr-mainstem-right-ebi-2019 | `imaging/real/cxr-mainstem-right-ebi-2019.jpg` | Hernandez et al., PloS one, 2019 · CC BY 4.0 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| neuro-stroke | stroke-ctp-mismatch-2025 | `imaging/real/stroke-ctp-mismatch-2025.jpg` | Qureshi et al., Cureus, 2025 · CC BY 4.0 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| neuro-icp | ich-deep-locations-2016 | `imaging/real/ich-deep-locations-2016.jpg` | Manoel et al., Critical care (London, England), 2016 · CC BY 4.0 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| abd-fast | fast-ruq-positive | `imaging/real/fast-ruq-positive.jpg` | Gillman et al., Scand J Trauma Resusc Emerg Med 2009 · CC BY 2.0 | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| abd-aorta | aaa-us-sagittal-haggstrom | `imaging/real/aaa-us-sagittal-haggstrom.jpg` | Häggström, Wikimedia Commons, 2018 · CC0 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |

For the original publication or Commons page and exact provenance, see `imaging/real/manifest.json`. The module detail screen links to each item's source and license.

## Source policy

- Default to unaltered in-app 3D stills that genuinely match the module. The card text remains native UI, not baked into the image.
- Clinical stills come exclusively from the repository's vetted manifest, with original patient distinction and credit.
- Only the existing accepted licenses (`CC0`, Public Domain, `CC BY` 2.0/2.5/3.0/4.0, MIT, Apache-2.0) are eligible. **Do not use CC BY-SA, NC, ND or unclear-license images**, even if a general search describes them as “royalty-free.”
- No externally hosted runtime thumbnails, fabricated monitors, or AI-generated organs.
- If screenshot capture changes, run `node app/scripts/qa/capture-thumbs.mjs` (see script header) and review 640×360 outputs before replacing the checked-in JPEGs.
- Crop gently and keep authentic left/right orientations, findings, ultrasound planes and source labels intact.
