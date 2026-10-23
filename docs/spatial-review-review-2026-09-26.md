# Kage Spatial Review review — 2026-09-26

Kage's dedicated capture is pinned to the latest published `@alterno-dev/spatial-review` and protocol release, 0.7.0. It uses Three 0.160.1 in capture; the ordinary page retains its original Three r149 and remains byte-identical to upstream revision `4399487`. The editor accepts its complete catalog: 40 actors, 35 asset families, two assemblies, and one journey with six stops, five segments, and 40 camera/aim points. The serialized catalog measured about 48 KB, well below the editor's 64 MiB catalog budget.

The Scene view provides independently owned architecture, rocks, lantern placements, and seeded maples. Asset exposes the source geometry, materials, and live generated textures; the torii handoff has 26 nodes, three materials, and 3/3 textures ready. Experience preserves the source Catmull–Rom route as exact cubic Bézier spans with read-only derived controls and the original scroll allocation. The official editor had previously accepted the published capture; this review checked the updated local capture against the current local editor at `http://127.0.0.1:5190`.

## Correction

Before this review, the ordinary site's boot logic also ran in capture. It intentionally continued after later construction jobs failed and swallowed rejected asynchronous jobs. A partial scene could therefore reach `install()` and publish a ready catalog. Capture boot now stops on every construction failure, reports `ready: false` with the error, and does not attach the bridge. Before attachment, `install()` also requires 40 unique actors, 35 asset families, scene-attached roots, the three key actors, and six finite increasing journey anchors. These counts are the reviewed source contract; update them deliberately if the authored scene changes. Actor, asset, navigation, and component IDs remain unchanged, preserving existing feedback targets. The ordinary page's boot path was not edited.

The local static server and acceptance scripts now accept a test port/tag, allowing this capture to be checked alongside other sites without replacing their evidence.

## Verification

- `npm run build` and `npm test` pass (6 tests, including missing and duplicate registration rejection); `git diff --check` passes. The ordinary `index.html` SHA-256 remains `c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49`.
- Direct local Chrome capture built all 40 actors and two assemblies without page errors. The torii texture transferred as image/png and decoded at 512×512. Scene ownership and alpha-map isolation checks passed.
- A browser check forced the first capture job's font promise to reject. The capture reported `ready: false`, exposed the failure, and published no scene.
- The current local editor discovered the capture from the ordinary site URL, opened Scene, Asset, and Experience, played the journey, and showed the torii's 3/3 textures. A disposable `asset-feedback-3d/v2` observation exported with `kage-torii` and `index.html#buildTorii`; reloading preserved it. The editor run had no page errors. Local evidence is in gitignored `.evidence/current-kage-*` and `.evidence/capture.json`.

Scene and Experience intentionally hide cinematic planes whose alpha, UV, and maps are unavailable in the SDK's Scene profile. Asset retains their full reviewable construction; final fog, bloom, grading, alpha-test edges, normal strength, and foreground occlusion remain ordinary-page appearance checks. Procedural source textures still run synchronously during capture construction. This change guards completeness but does not reduce their startup cost; one concurrent local run reached ready at about 11 seconds, so startup timing should be remeasured on an unloaded host before treating that number as a regression.

This review changes the local Kage branch only. The deployed GitHub Pages capture remains at its prior validated revision until the updated branch is published.
