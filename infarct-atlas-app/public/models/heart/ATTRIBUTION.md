# Heart model attribution

**3D Reference Organ for Heart, Male (HuBMAP / Human Reference Atlas)**

- Creators: Kristen Browne; Heidi Schlehlein
- Underlying data: Visible Human Male, U.S. National Library of Medicine
- License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); attribution is required wherever the model is shown.
- DOI: https://doi.org/10.48539/HBM373.VSTV.568
- Source: https://github.com/hubmapconsortium/ccf-releases/tree/main/v1.1/models

## Changes made

Re-centred and scaled; coronary meshes renamed. The source mesh labelled as a second diagonal follows the left atrioventricular groove from the left main bifurcation, so it is used as the course of the proximal circumflex. The circumflex, a second diagonal, a second obtuse marginal, septal perforators and a posterolateral branch are added along the model's own grooves and surfaces. Territory masks, perfusion, epicardial fat and ambient-occlusion attributes are baked; meshopt-compressed.

## Swapping the asset

1. Put the new GLB in `assets/source/` and set `source` in `assets/asset-map.json`.
2. Update the name-matching rules so the chambers, septum and coronaries map to the canonical ids.
3. Run `npm run asset`, then `npm run validate:asset`.
