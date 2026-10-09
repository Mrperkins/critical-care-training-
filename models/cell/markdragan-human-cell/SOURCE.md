# Human Cell source and runtime use

- **Title:** Human Cell
- **Creator:** markdragan
- **Original source:** https://sketchfab.com/3d-models/human-cell-60ef7d2515b0403986ff9e8b7f234a66
- **License:** CC BY 4.0; attribution required; commercial use allowed (see `LICENSE.txt`).
- **Verified mirror and pinned revision:** `rizkikadafi/learn-cell`, commit `988b3503fd9d8ec85d8effafd6128559756c16d9`, `public/human_cell/cell.glb`.
- **Local asset:** `cell.glb` (12,002,868 bytes), SHA-256 `405cf19d250b80d502682c52c9eba27d640d365069367d8e6a3c705bd08cd5de`.
- **Delivery copy:** `cell.opt.glb` (3,096,184 bytes), SHA-256 `f934e8ce8bee02bbf8c3d5bdba5f35e473e211f8070a4e958f2d136feaadcd40` — the same 421,546 triangles, normals and materials, quantised and meshopt-compressed (`app/pipeline/optimize-assets.ts`). The app loads this copy; `cell.glb` stays as the unmodified original.
- **Modifications:** The original binary is unchanged. At runtime the app recenters/rescales a clone and adjusts materials. The procedural layer still supplies physiology, transporters, and the fallback.
- **Role:** Whole-view generic animal cell; not a cardiomyocyte or neuron substitute.

Attribution displayed beside the generic cell in the app: **Human Cell — markdragan · CC BY 4.0**.
