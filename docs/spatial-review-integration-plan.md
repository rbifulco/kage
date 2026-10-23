# Fresh Kage Spatial Review integration

## Baseline and authorization

Fresh branch `spatial-review-fresh-20260904` starts at clean original `4399487d2fb42bce39c7b032fbbb50d230bf4f0b`, fork of MengTo/kage. No prior integration code is reused. Existing `spatial-review-pages` at `7fd91de` and its checkout are preserved as rollback. Original repository contains no package manager, build, or tests; its shipped HTML/assets are its build. `index.html` and original assets remain byte-identical.

The current user explicitly authorized replacement and publication of the working review setup at the existing destination. This retains existing official-editor data/framing scope: exact `https://spatial-review.alterno.dev`, deliberately registered public scene/asset/material/source-reference/texture data, and embedding the dedicated capture route. No additional production origins. Local development explicitly permits loopback peers. No cookies/storage/DOM data are registered. Existing GitHub Pages has no restrictive framing headers; no security headers are removed.

Authoritative procedure read from alterno-spatial-review commit `e41ac9603d40b995f1b3ea35f69ba26e07d55303`, agents/install.md and representation/navigation/transport/deferred/performance references. npm registry reports SDK 0.7.0; pin with lockfile. Original Three r149 stays on ordinary page; compatible npm Three 0.160.1 is shared by capture and SDK only.

## Representation and source ownership

All review geometry comes from original inline source factories in `index.html`; `scripts/build.mjs` injects capture-only source annotations in a generated `spatial-review.html`. No hand-built coarse substitute objects. Index remains the sole scene authority. Metres, right-handed Three axes, Y-up; actor transforms retain source pivots. Feedback rotations use XYZ degrees, converted to source radians; owned transforms are parent-local, applied once.

| Subject | Scale / source / owner |
| --- | --- |
| Sanmon hall and construction components | Scene and Asset, `index.html#buildTemple`; sanctuary owner |
| Torii | Scene and Asset, `index.html#buildTorii`; approach owner |
| Six independent stone lantern placements | Shared canonical asset from `index.html#buildLantern`; placement source JOBS, approach owner |
| Five independently seeded maple designs | Scene/Asset, `index.html#buildMaple`, five stable authored placement slots and design seed IDs 71–75; approach owner |
| Eight independent rocks | Scene/Asset, `index.html#buildRocks`, stable spots-array slots; approach owner |
| Ground, podium/coping, flight/rail | Actual source renderables from `index.html#buildShell`; approach/sanctuary owner |
| Moon/disc corona, sky, ridges, hall mist | Actual context geometry/materials from source buildShell/buildMoon/buildTemple; World ownership |
| Six foreground cutouts and KAGE letters | Actual generated textures and source geometry, `buildForeground` and `buildWordmark`; approach owner |
| Six authored camera/aim/FOV states | Experience, `index.html#CAM`, `buildRig`, `applyCamera`, `measure` |

Assemblies are identity transform-only owners for the authored approach and sanctuary, not rendering batches. Lanterns share canonical design; seeded maples and deformed rocks remain distinct assets. Material IDs derive from stable factory role names and deterministic hierarchy/order. Generated node references append serializer IDs to factory sourceRef; resolve the first file/symbol fragment and the named component via build annotations. Material and map slots resolve to factory local declarations: temple timber/post/gold/tileMat/paper/grid; torii lac/gold/cap; lantern stone/dark/paneMat/glow; maple leafMat/trunk; shell wallMat/floorMat/platMat; foreground cutoutMaterial; moon disc/halo. Canvas producers texWood/texStone/texRoof/texLacquer/texShoji/texLeaf/texFloor/texMoon and foreground texture factories remain authoritative.

New semantic baseline: this fresh mapping does not pretend that old experimental IDs identify identical targets. Preserve prior feedback externally; manually migrate unmatched old IDs using factory/placement references.

## Appearance preflight

Full geometry groups, UVs, normals, instancing and supported material slots retained for Asset. Generated canvas images transfer over the live bridge. Public local source URLs contain no credentials. Foreground custom alpha feathering and zero-time sway are baked into capture textures/geometry; maple zero-time wind deformation is baked into instance matrices. This preserves the authored static silhouette. No neutral-grey geometry replacement.

Editor lighting, fog, HDR bloom/grading, additive blending and tone mapping differ from live presentation: texture/construction and placement review are supported; final cinematic appearance must be judged on the ordinary page. Scene profile intentionally omits UV/maps by SDK design; texture-driven alpha cutouts are unsuitable for exact Scene occlusion, so full-detail/Asset remains authoritative. Shader-only drifting particles, rain/wisps, DOM card cloth and page overlays are excluded from editable review; ordinary page retains them. Custom atmospheric shading is not claimed faithful.

## Capture and transport

Static discovery only (`.well-known/spatial-review.json`) keeps all review imports/listeners/timers/serialization out of ordinary page. Capture URL `spatial-review.html?shot=0&q=high&adapt=0&dpr=1` constructs deterministic frozen source state, seeded random, time zero, neutral pointer, authored wide camera, no interactions required. One registry attaches after registrations/assemblies/navigation are complete; initial progress gate unsupported by SDK. All review resources belong to capture document; teardown detaches and disposes capture scene resources, renderer and textures. Page refresh replaces registry atomically.

Development site `http://127.0.0.1:4311/`; local editor reserved `http://127.0.0.1:4411/`. Official editor remains compatibility target with asset-stream-v1 and scene-assemblies-v1. Legacy complete catalog may lack assembly editing; no legacy editor is part of this acceptance target.

## Validation plan

Baseline shipped HTML: syntax and static asset checks before adding build inputs. Ordinary hero and chapter navigation compared with same viewport/cache/browser/input and deterministic shot; capture runtime never enters ordinary page. Performance screen applicability: ordinary page unchanged and no new imports/work; source boundary plus ordinary functional/visual parity establish isolation. Capture construction and transfer measured; individual expensive representations use deferred production if ≥50 ms chunk or transport limit is triggered. Bounded one-at-a-time representation demand and explicit terminal results required.

Smoke: Scene torii/lantern ownership, Asset textured torii, Experience hero→Sanmon interval. Export one stable subject comment/operation, resolve to source and refresh preserving unresolved feedback. Texture live bytes must decode; direct public texture MIME checked separately. Production task: existing GitHub Pages destination `https://rbifulco.github.io/kage/`; retain old branch and switch Pages source to validated new branch without force push/delete/revert. Record deployed revision and direct manifest/capture/editor results in evidence summary.

### Navigation adapter detail

`buildRig` uses uniform Catmull–Rom (`curveType: catmullrom`, tension 0.42), evaluated over six knots. Each span is exported as its exactly equivalent cubic Bézier: outgoing = P_i + .42(P_{i+1}−P_{i−1})/3; incoming = P_{i+1} − .42(P_{i+2}−P_i)/3. Endpoints use the source's extrapolated neighbors. Derived tangent controls are read-only with `index.html#buildRig`; stop knots remain editable with `index.html#CAM[index].p` or `.t`. Source feedback must edit CAM knots, never store derived controls as new authored data. Independent tests evaluate original bundled Three r149 curves and npm Three r160 Bézier at five samples per span, camera and aim, error <1e-10. Segment input weights come from the six actual scroll anchors; FOV interpolates at lensStart=0. Intro dolly, pointer parallax, smoothing lag and portrait aspect compensation are excluded from this canonical wide-screen journey. Experience playback has independent playback speed; relative scroll allocation is preserved.

### Texture transport details

SDK 0.7.0 omits source `transparent` and `alphaTest` but hydrates `alphaMap` as transparent. Capture adds a source-derived alpha-coverage map for textured transparent/cutout surfaces, with source alpha encoded into green and stable source material/slot mapping. This retains source alpha coverage for Asset hydration (including frozen edge feathering); it is not new artwork or a coarse proxy. Alpha testing becomes smooth transparency, and SDK omits `normalScale`, vertex colors and several cinematic material fields. Normal intensity therefore differs; exact normal-strength and filmic lighting decisions remain live-page checks. No optional public editor-origin policy is advertised, matching the previous integration scope. Runtime authorization still permits exact official origin and loopback peers only while producer itself is loopback.

### Final Scene/Experience visibility boundary

Actual editor inspection showed that the SDK Scene profile's omitted alpha/UV/maps turn presentation plates into opaque rectangles and dominate scene bounds. The final registration therefore initially hides and labels `Asset appearance` on sky/ridges, moon/corona, hall spill/mist, foreground cutouts and KAGE wordmark. These source actors remain selectable and their full source geometry/materials/textures remain available in Asset. Physical court, stairs/rails, podium, Sanmon, torii, lanterns, maples and rocks remain visible. Scene/Experience support architectural placement and camera-route review; cinematic foreground/background occlusion is explicitly outside those views. This is an intentional representation boundary, not a claim of full appearance fidelity.


### Placement identity mapping

Actor IDs never encode mutable coordinates. Lantern actor roles are `court-east`, `court-west`, `stair-lower-east/west`, `stair-upper-east/west`, injected at their authoritative JOBS call sites; all use asset `kage-stone-lantern`. Maples use actors `kage-maple-placement-1` through `-5` for their source JOBS call slots and distinct `kage-maple-design-71` through `-75` seed designs. Rocks use `kage-rock-placement-1` through `-8`, the corresponding `buildRocks.spots` slots. Moving an existing slot preserves its actor ID; inserting/reordering authored slots requires explicit ID migration instead of renumbering existing feedback targets. No source placement values are copied into the integration module.
