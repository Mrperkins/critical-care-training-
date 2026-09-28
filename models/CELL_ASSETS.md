# Cell visual assets

This branch uses a **hybrid visual architecture**:

- open 3D assets improve whole-cell/organelle fidelity;
- the existing procedural scene remains the functional layer for cutaways, ion movement, transporters, swelling/shrinkage, membrane potential, and treatment effects;
- `SyntheticPatient` remains the only source of clinical/physiologic state.

## Selected primary open asset

**Human Cell — markdragan**  
Source: https://sketchfab.com/3d-models/human-cell-60ef7d2515b0403986ff9e8b7f234a66  
License: **CC BY 4.0**  
Commercial use: allowed with attribution.

The source GLTF metadata and accompanying license file are mirrored in
`rizkikadafi/learn-cell/public/human_cell/`, which explicitly preserve the
author, source URL, CC-BY-4.0 license, and commercial-use allowance.

The pinned GLB and accompanying license are vendored at
`models/cell/markdragan-human-cell/`. Runtime now loads the local asset; see
`SOURCE.md` there for the exact revision, integrity hash, and modification
record. The original Sketchfab attribution remains visible in the cell view.

Intended use here:
- generic animal-cell whole view;
- organelle geometry/material reference;
- optional high-fidelity shell;
- **not** as a cardiomyocyte or neuron substitute.

## Cardiomyocyte reference

**Cardiac Muscle Cell Anatomy — _Bonehead14**  
Source: https://sketchfab.com/3d-models/cardiac-muscle-cell-anatomy-16e33d3b0be74b4c800cb7601fb51dd2  
License: **CC BY 4.0**.

Its low polygon count makes it a strong future browser-safe donor, but the
current procedural cardiomyocyte remains the runtime source until the asset is
vendored and verified.

## Important exclusion

Do not assume an asset is commercially reusable merely because it is hosted by
NIH, a university, or an academic repository. Each asset needs explicit reuse
terms. NC/non-commercial assets are excluded from the shipping build.

## Runtime rule

Failure to load any external high-fidelity model must never prevent the lesson
from running. The procedural cell remains the deterministic fallback.
