# 9RON Na/K ATPase closeup mesh

- **Structure:** 9RON, human alpha1 Na/K ATPase Na bound E1 state, RCSB PDB: https://www.rcsb.org/structure/9RON
- **Structural data license:** CC0 1.0 under the wwPDB/RCSB archive usage policy: https://www.rcsb.org/pages/usage-policy
- **Input downloaded:** `https://files.rcsb.org/download/9RON.cif`; SHA-256 `e18b3f96d4d30942d5a046b570801d041612507f63490d274c0201bb3db02e5b`.
- **Output:** `9ron-backbone.glb`; SHA-256 `74f61da6dfb1b7072f2e139c2b35f2815a5309a4f6ab65d87886aabce78cdb5c`.
- **Creator:** wwPDB depositors of 9RON; mesh conversion by this project.
- **Modifications:** `tools/build_pdb_backbone.py` extracts C-alpha traces from chains A, B, C; it creates 12 sided backbone tubes, recenters and scales the coordinates, and colors the three chains. The original mmCIF is retrieved from its pinned ID for regeneration. No atoms or inferred contacts are displayed.
- **Role:** Educational molecular silhouette for a *single selected pump* in membrane closeup. The existing procedural pump remains the proxy at other sites and on low quality. The selected silhouette makes a small movement from the existing pump phase; physiologic transport and ATPase state remain calculated by the existing simulation.

Regenerate with `python tools/build_pdb_backbone.py /tmp/9RON.cif models/molecular/9ron-backbone.glb` after downloading the cited mmCIF to `/tmp/9RON.cif` and installing `numpy` and `biopython`.

## 9P24 Nav1.5 closeup mesh

- **Structure:** 9P24, human cardiac sodium channel Nav1.5, RCSB PDB: https://www.rcsb.org/structure/9P24
- **Structural data license:** CC0 1.0 under the same wwPDB/RCSB archive policy.
- **Input:** `https://files.rcsb.org/download/9P24.cif`; SHA-256 `2f6a217a00ccb826cc6631808a27bbe8f731223774e577363b353de51fe28b69`.
- **Output:** `9p24-backbone.glb`; SHA-256 `e898b9648abd159b406a7efb95ea557a7273d24705ff4f4185621ae6a7e59293`.
- **Creator:** wwPDB depositors of 9P24; mesh conversion by this project.
- **Modifications:** 1,258 C-alpha positions from chain A converted to a 12 sided backbone tube, recentered/scaled/colored; 30,072 triangles and no external textures.
- **Role:** Visual silhouette of one selected Nav1.5 channel in membrane closeup at HIGH/MEDIUM quality. The existing channel state drives a highlight when open; the simulation still determines gating and ion movement. LOW and unselected sites use the procedural proxy.

Regenerate with `python tools/build_pdb_backbone.py /tmp/9P24.cif models/molecular/9p24-backbone.glb` after downloading the cited mmCIF.


## 7ZDZ Kir2.1 closeup mesh

- **Structure:** 7ZDZ, human Kir2.1 channel: https://www.rcsb.org/structure/7ZDZ
- **Publication:** *Cryo-electron microscopy unveils unique structural features of the human Kir2.1 channel*, PMID 36149965.
- **Structural data license:** CC0 1.0 under the wwPDB/RCSB archive policy.
- **Creator:** wwPDB depositors of 7ZDZ; mesh conversion by this project.
- **Input:** https://files.rcsb.org/download/7ZDZ.cif; SHA-256 `c3d23c7fc293d61effddb711c988580859a95442bf36fa412d6449c6789bf14f`.
- **Assembly:** Deposited protein chains A-D form author-defined biological assembly 1 (tetramer). The assembly uses the identity operator; potassium and strontium ions are not rendered.
- **Modifications:** 1,292 C-alpha positions converted to 12 sided backbone tubes, recentered/scaled/colored; 30,912 triangles, no external textures.
- **Output:** `7zdz-backbone.glb`; SHA-256 `3ce41eabbdb41ca52dcb55a206b3eb04128295802da08988e43bdc10f7db62a1`.
- **Role:** One selected Kir2.1 site at HIGH/MEDIUM quality. LOW and unselected sites retain the functional procedural proxy. This silhouette does not calculate conductance or model atomic movements.

Regenerate with `python tools/build_pdb_backbone.py /tmp/7ZDZ.cif models/molecular/7zdz-backbone.glb`.
