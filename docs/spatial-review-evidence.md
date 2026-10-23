# Fresh Kage integration evidence

## Source and installation

- Clean starting revision: `4399487d2fb42bce39c7b032fbbb50d230bf4f0b`, verified in upstream MengTo/kage and fork rbifulco/kage.
- New isolated branch: `spatial-review-fresh-20260904`. Existing integrated checkout remains untouched.
- Previous Pages source: `spatial-review-pages` at `7fd91de1ac87fbb31d77b493e967d8b3732c5532`, retained for rollback.
- Registry-confirmed npm SDK `0.7.0`, protocol `0.7.0`, capture-only Three `0.160.1`; lockfile uses registry.npmjs.org package URLs/integrity. Ordinary page keeps original Three r149.
- Original index SHA-256: `c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49`.
- `npm run build` passes. Five focused checks pass: original source/assets unchanged, inline JavaScript parses, project-relative discovery normalization, ordinary-route isolation/dependency pinning, independent navigation comparison.
- Navigation comparison uses original bundled Three r149 as independent reference; all five camera/aim spans match equivalent cubic paths at 0/20/50/80/100%, error <1e-10. Rebuild preserves IDs; changed route input replaces its value under stable stop identity.

## Ordinary page

Baseline Chrome desktop 1440×900, DPR 1, reduced-motion, fresh browser context, `?shot=0&q=high&adapt=0&dpr=1`: hero ready at approximately 4.8 seconds; 236 live meshes; no runtime errors; document/viewport width both 1440. Gate navigation scrolls to 860 and activates #gate with the corresponding source camera motion. Screenshots retained at `.evidence/baseline-hero.png` and `baseline-gate.png`.

The final ordinary HTML and all original public assets are byte-identical to baseline, independently compared against Git blobs. No review script, listener, request, worker, timer, frame callback or serialization work runs there; static discovery was selected. The ordinary-page performance screen is not triggered. The pre-existing runtime has animated noise/leaves; screenshot pixel differences between times are not treated as a source regression.

## Capture and transport

Direct and embedded source capture both advertise 40 independently owned actors, two transform-only assemblies and one six-stop journey. Embedded frame is 1×1; capture resolves authored layout at fixed 1600×900. Both produce finite identical anchors `[0,908,1870,2913.5,3903,4588]`. Frame reaches registry readiness without user interaction after all annotations/ownership/journey registrations are complete.

Representative measured pre-publication pass: registry setup 8.3ms, metadata 12.7ms, torii detail serialization 2.3ms. Torii has 20 geometries and three source materials. Live generated texture transferred 353272 bytes as image/png and decoded at 512×512. Additional source-complexity samples: Sanmon 74 geometries, ~3MB JSON, 3.6ms serialization; instanced maple ~0.86MB, 0.8ms; foreground plane ~16KB, below 1ms. No geometry serialization or transfer-size trigger was observed for these samples.

A separate capture-startup limitation remains: original procedural raster factories have long synchronous tasks (near-grass about 522ms, shell and hall about 90ms each). These are capture-only source texture-generation costs; total direct capture readiness was about 1.5s. They are recorded, not claimed optimized or deferred. Geometry itself remains eager and cheap in measured samples. No custom deferred producer or cache was introduced.

Production preflight: original deployed manifest returns application/json with CORS `*`; representative public source still returns image/webp with CORS `*`; no conflicting X-Frame-Options or frame-ancestors restriction. Generated registered canvas textures use origin-checked live bytes instead of invented public URLs.

## Representation limits

Scene/Experience intentionally begin with presentation-only planes hidden; full actual geometry/textures remain in Asset. No coarse geometry proxy replaces source models. Final cinematic fog, bloom, grading, exact normalScale, alpha-test edge behavior and foreground/background occlusion remain ordinary-page checks. The SDK Scene profile omits UVs/maps; its raw presentation rectangles were visibly unsuitable, which motivated the explicit visibility boundary.

## Editor acceptance

The actual local editor opened through its ordinary-site review landing and completed Scene, Asset and Experience checks. Scene renders physical architecture, stairs, rocks and maples with the explicit presentation-plane visibility boundary. Asset renders the textured red torii with 26 nodes, 1,668 triangles, three materials and 3/3 textures ready. Experience displays six authored stops and five transitions, with journey play/pause working. Representative screenshots are retained locally in `.evidence/local-scene.png`, `local-torii.png` and `local-experience.png`.

A disposable asset observation exported as `asset-feedback-3d/v2` with stable asset ID `kage-torii` and independently resolved source reference `index.html#buildTorii`. Reloading the editor preserved that unresolved observation. The embedded producer reports all 40 actors and the same finite six anchors. An optional extra journey-comment selector failed after these checks; that extra action is not part of the completed asset feedback acceptance. Journey-specific comment export and UI manipulation of derived read-only curve handles were not separately verified.

Two assembly records and their actor ownership are verified at the producer protocol level; editor assembly editing was not exercised. Nested lantern glow cards can remain visibly rectangular in the reduced Scene representation. Asset appearance and the ordinary site remain the relevant checks for those effects.

## Publication

The existing Pages destination `https://rbifulco.github.io/kage/` now builds from `spatial-review-fresh-20260904` at `/`. GitHub Pages reported successful deployment of implementation commit `144f23fb3df05cc25f0524f8f83338c06ebf34a9`. The prior branch and deployment revision remain intact; rollback is a Pages source change back to `spatial-review-pages`, with no history rewrite.

Public `index.html`, `.well-known/spatial-review.json`, `spatial-review.html` and `review/capture.js` return HTTP 200, appropriate MIME types, CORS `*`, and byte-for-byte match the validated local artifacts. Capture build identity is `kage-ab4a26941c64813ce666`; capture bundle SHA-256 is `23100bf7a50064fb609d71b8632c412073a7f2524e70227d41dfdf496387e76d`.

The actual official editor at `https://spatial-review.alterno.dev/review?site=https%3A%2F%2Frbifulco.github.io%2Fkage%2F` opened from the ordinary site URL, discovered the dedicated capture route, and completed Scene, Asset and Experience checks. The production embedded capture had all 40 actors and identical six anchors. Textured torii Asset reported 3/3 textures ready; journey had six stops, five transitions and working play/pause. The actual disposable feedback export again contained `kage-torii` and `index.html#buildTorii`; reloading preserved the unresolved observation. All three production screenshots were visually inspected. These checks ran in a disposable browser context, which was closed afterward. Raw screenshots, compact feedback and machine-readable results are retained in gitignored `.evidence/production-*` files. No production source change followed this validation; the final follow-up commit records this evidence only.
