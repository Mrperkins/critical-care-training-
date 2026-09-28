# 9RON Na/K ATPase closeup mesh

- **Structure:** 9RON, human alpha1 Na/K ATPase Na bound E1 state, RCSB PDB: https://www.rcsb.org/structure/9RON
- **Structural data license:** CC0 1.0 under the wwPDB/RCSB archive usage policy: https://www.rcsb.org/pages/usage-policy
- **Input downloaded:** `https://files.rcsb.org/download/9RON.cif`; SHA-256 `e18b3f96d4d30942d5a046b570801d041612507f63490d274c0201bb3db02e5b`.
- **Output:** `9ron-backbone.glb`; SHA-256 `74f61da6dfb1b7072f2e139c2b35f2815a5309a4f6ab65d87886aabce78cdb5c`.
- **Creator:** wwPDB depositors of 9RON; mesh conversion by this project.
- **Modifications:** `tools/build_pdb_backbone.py` extracts C-alpha traces from chains A, B, C; it creates 12 sided backbone tubes, recenters and scales the coordinates, and colors the three chains. The original mmCIF is retrieved from its pinned ID for regeneration. No atoms or inferred contacts are displayed.
- **Role:** Educational molecular silhouette for a *single selected pump* in membrane closeup. The existing procedural pump remains the proxy at other sites and on low quality. The selected silhouette makes a small movement from the existing pump phase; physiologic transport and ATPase state remain calculated by the existing simulation.

Regenerate with `python tools/build_pdb_backbone.py /tmp/9RON.cif models/molecular/9ron-backbone.glb` after downloading the cited mmCIF to `/tmp/9RON.cif` and installing `numpy` and `biopython`.
