# Visual overhaul execution state

Read this file first each session. Work on `visual-overhaul` only. Update the commit, tests, and exact resume point after each coherent slice. Re-audit only if the remote branch changed outside this session.

## CURRENT BRANCH
`visual-overhaul`

## CURRENT COMMIT
`749dd574007f635a0b3913eb20e034278770cee5` at initial checkout; this slice's new commit will appear in git log.

## LAST VERIFIED LIVE DEPLOY
Prior successful GitHub Pages deployment from `visual-overhaul` reported in the user audit. Live runtime has not yet been verified during this session.

## COMPLETED SLICES
- Existing Wave 1 cell scene, asset manifest/provenance, remote high fidelity generic cell with procedural fallback (through `749dd574`); see git history. Do not recreate.
- Vendored the pinned CC BY 4.0 generic cell GLB with original license, attribution/source notes, SHA-256 validation, and local loader; procedural fallback remains.

## CURRENT SLICE
Add semantic camera target registry, initially the requested cell, membrane, heart, lung, and brain keys; wire one existing cell camera path to it in a separate small slice.

## EXACT RESUME POINT
Check `git status` and CURRENT SLICE. Find existing cell camera logic around `n$(...)` and the canvas camera component in the inline JS. Add a named target map and a resolver without changing SyntheticPatient or existing view behavior; then route the current cell and membrane view transition through the resolver. Validate the extracted inline script with `node --check` and look for `var sw=var sw=`.

## NEXT 10 SLICES
1. Add semantic camera target registry with cell, membrane, heart, lung, and brain entries.
2. Wire existing cell and membrane camera actions through semantic registry.
3. Add high/medium/low cell visual tiers without changing physiology.
4. Add simplified Na/K ATPase geometry and LOD hooks using the documented CC0 source.
5. Add Nav1.5 simplified visual geometry and LOD hooks.
6. Add Kir2.1 simplified visual geometry and LOD hooks.
7. Add AQP4 simplified visual geometry and LOD hooks.
8. Upgrade reusable membrane bilayer and ion/protein depth.
9. Add reusable alveolar microanatomy driven by the existing respiratory model.
10. Add brain and cerebral vessel semantic geometry foundations.

## KNOWN BUGS
- No new runtime bug confirmed in this session. The previous `var sw=var sw=` parse error was fixed in `570f0d4b`; check for regression before push.

## KNOWN BLOCKERS
- None for asset vendoring. Local HTTP server could not be reached across tool processes in this environment; use same-process boot smoke if needed.

## TESTS LAST RUN
- Baseline and edited inline scripts extracted from `index.html`: `node --check` passed. GLB header/length and SHA-256 match the manifest; no duplicate `var sw=var sw=`; `git diff --check` passed. Live runtime and mobile remain unverified.

## FILES CURRENTLY BEING EDITED
- None after asset slice commit. Next slice will touch `index.html` and likely add `models/camera-targets.json` or a standalone registry file.
