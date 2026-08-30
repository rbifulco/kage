# Spatial Review integration

## Access decision

On 2026-08-28 the user explicitly approved `https://spatial-review.alterno.dev`
to receive deliberately registered scene, asset, material, source-reference and
texture data and embed discovery/capture pages. Both bridges use
`allowOfficialEditor: true`, with no additional production origins. Set this
one configuration to `false` to revoke official-editor access. Same-origin and
mutual localhost access are SDK defaults. No arbitrary DOM, application state,
credentials or unregistered objects are exposed by the bridges.

GitHub Pages does not provide per-route custom HTTP headers. This repository
had no existing framing restrictions; no protection is removed or broadened.
The SDK origin checks protect review data even though Pages permits embedding.

## Integration inventory and plan

Refinement: SDK upgraded from 0.4.0 to 0.5.0 (latest npm release checked
2026-08-30), retaining Three.js 0.160.1 within the supported `>=0.160.0 <1`
peer range. The original static site remains on one shared runtime and a
checked-in reproducible browser bundle. The approved origins, exposed data
classes, capture route, and framing scope are unchanged.

| Scale | Registered content | Source owner |
| --- | --- | --- |
| Assembly ownership | `temple-grounds`; nested `approach-courtyard` and `worship-hall-complex` | `src/review-structure.js`; explicit `parentAssemblyId` arguments beside construction calls in `index.html` |
| Scene | Temple, torii, six independent lanterns, five maples, eight rocks | `index.html`: `buildTemple`, `buildTorii`, `buildLantern`, `buildMaple`, `buildRocks`, `JOBS` placements |
| Context | Ground, podium, coping, stairs, rails, sky, ridges, moon, foreground, wordmark | Corresponding `buildShell`, `buildMoon`, `buildForeground`, `buildWordmark` definitions |
| Asset | Named construction parts; six lanterns share `stone-lantern`; seeded maples and deformed rocks are distinct variants | Named meshes in the same construction functions |
| Path | Six-stop Kyoto night walk, opening dolly, four card hover views | `CAM`, `buildRig`, `progressFor`, `INTRO_VIEW`, `applyCamera`, `CARD_VIEWS`, `CARD_PUSH`, `aimCard` |
| Capture | Fixed high-detail 1440×900 authored view at DPR 1, completed intro, clock zero; post-processing and shadow maps disabled; all construction jobs complete | `start`, `KageReview.ready` |

## Run and build

`npm ci && npm test && npm run build`; then `npm run dev` (port 4183).
The checked-in `assets/kage-runtime.js` keeps deployment as branch-root static
hosting. Rebuild after source changes and commit the generated bundle with them.
The build ID includes SDK release and a SHA-256 source/lockfile digest.
The original r149 vendor file is retained for provenance but is no longer loaded.
r160 uses explicit legacy lighting and disabled colour management to preserve
the original rendering intent; the runtime and SDK share the same Three.js.

## Mapping review feedback back to source

World units are metres, Y up; navigation uses the same world frame. Actor IDs
identify placements, while asset IDs identify canonical construction. Lantern
components have the same names/order across all six placements; maple seeds
and rock indices deliberately identify distinct local designs.

Component references append the generated component ID to the registration's
source reference. Locate the named mesh in that factory. Preserve mesh names
and child order when editing unrelated content. Scene edits use a bounds-centred
world-aligned frame: apply translation deltas to the source placement, convert
rotation degrees to radians, and derive scale ratios from reviewed versus
original bounds. Never assign exported size directly to Object3D.scale.
Asset part transforms and pins are local to their named parent/component.

Assembly-aware scene edits instead use explicit source-root frames. All three
review owners currently have identity local transforms. `temple-grounds` owns
the courtyard ground and the two nested owners; `approach-courtyard` owns the
torii, stairs, cheeks, six lanterns, five maples, and eight rocks;
`worship-hall-complex` owns the hall, podium, and coping. Apply one absolute
parent-local assembly operation to the placements listed under that owner and
do not also replay derived child world deltas. A child placement operation stays
independent. Reparenting changes the explicit owner argument and preserves the
actor's world pose. Kage's renderer remains physically flat; the logical owners
do not reparent, clone, or duplicate its Three.js objects.

Actor IDs, asset IDs, component names/order, material identities, and navigation
IDs are retained from the 0.4.0 integration. The three assembly IDs are additive.
Consumers that do not negotiate `scene-assemblies-v1` receive the previous
world-space actor representation with an explicit flattened-mode disclosure.
Ownership-aware scene review begins a new placement-frame baseline; old
bounds-centred flat intent must not be guessed into parent-local operations.
The prior verification session retained no scene operation to migrate.

The scroll adapter converts each uniform Catmull–Rom span (tension .42) to an
exact cubic Bézier, retaining editable CAM stops and linked aim endpoints.
Tangent handles are derived, marked read-only, and trace to neighbouring CAM
knots. Edit `CAM[i].p`, `.t`, `.fov`; recompute tangents rather than inserting
independent source controls. Segment weights are measured scroll-anchor spans,
not distance; FOV interpolation begins at segment progress zero. Intro edits map
to `INTRO_VIEW` offsets/FOV/duration and CAM[0]. Re-register on resize; reload
the capture page for source edits. Bridges detach on pagehide and reattach on
pageshow (including the back/forward cache).

## Deliberate exclusions and limits

- HTML typography, cinematic plates, CSS cloth/card animation and layout are
  outside the spatial contract. The visible 3D wordmark and foreground planes
  are included. Four card hover pushes are also exported; their viewport aspect
  adjustment and exponential hover damping remain runtime modifiers.
- Rain, embers, pointer wisps, falling-leaf particles, fog billboards, glow-only
  halos and lights are effects, excluded from independent actor registration.
  Maple foliage geometry is retained. No replacement geometry proxies are used.
- The editor does not reproduce bloom, custom shaders, reflection, scene fog,
  light flicker or animated foliage. Generated material textures are transferred
  live; judge final atmosphere in Kage itself. Capture also disables Kage's own
  bloom and shadow maps to keep concurrent editor frames lightweight; actor and
  asset geometry remains at the authored high-detail setting.
- Paths represent authored desktop motion. Pointer parallax, scroll damping,
  reduced-motion scheduling and responsive aspect compensation remain runtime
  modifiers, not editable navigation controls. Capture freezes these modifiers
  for repeatability. Relative input weights are preserved; editor playback may
  use a different easing for FOV.
- Discovery is browser-only; no static JSON fallbacks are advertised and CLI
  discovery validation is not applicable.
- The sky, two ridges, moon, six foreground planes, and wordmark remain
  World-owned by design. They are scene/cinematic context, not contents of an
  architectural owner. Categories and shared assets do not imply ownership.

## Verification

The pre-upgrade 0.4.0 baseline passed its five Node checks and production build.
The normal website and previously verified flat scene/path/asset behavior were
used as regression references.

- `npm test`: seven checks pass. The ownership test validates the three
  assemblies, parent-local actor transforms, schema/graph constraints, explicit
  origin checks, hierarchical capability negotiation, and flat compatibility;
  the capture-profile check locks high-detail geometry with post-processing,
  shadows, and adaptive DPR disabled.
- `npm run build` produces `kage-sr-0.5.0-45c54501de04009a`; `git diff --check`
  passes. The checked-in bundle resolves SDK/protocol 0.5.0 and Three.js 0.160.1.
- The browser harness across localhost ports 4183/4184 passes cross-origin
  discovery, capture readiness, three advertised and negotiated assemblies,
  37 unique actors, 32 detailed asset families, six journeys, flat fallback,
  five representative live texture transfers, and repeated catalog stability.
- The normal entry page and Still Gardens chapter rendered as expected. Chapter
  navigation moved the authored page state while the 0.5.0 review-ready marker
  remained present. The only observed console warning is Three.js r160's already
  documented `useLegacyLights` deprecation.
- The optimized local capture advertised and enforced
  `post=0&shadow=0&dpr=1`, produced a 1440×900 drawing buffer, and reached the
  `kage-sr-0.5.0-45c54501de04009a` ready marker. The official editor received
  that exact URL in each of its three source frames and resolved all 37 meshes.
- The official editor connected to the local capture and displayed Ownership as
  `World → Temple grounds (26) → Approach courtyard (22)` plus
  `Worship hall complex (3)`. Hiding Temple grounds left exactly the 11
  intentionally World-owned context actors visible; child visibility choices
  stayed intact, and the owner was restored.
- A disposable +0.25 m X move on `temple-grounds` exported one
  `absolute-intent`, `parent-local` assembly transform targeting
  `src/review-structure.js#temple-grounds`. Undo restored X=0 and an empty change
  set. No review feedback remains.
- Experience loaded all six journeys. The primary night walk shows six stops,
  five exact Bézier transitions, authored FOVs, relative timing, and live scene
  context. The current verification did not modify its already-tested controls.
- Asset loaded all 32 canonical families; Approach torii loaded 1,668 triangles,
  26 components, and three materials. `Kasagi crown` remained independently
  selectable and traceable through `index.html#buildTorii` and its generated
  component reference. The live harness loaded every detailed family and the
  representative textures.

The production GitHub Pages URL still serves the previously published build;
deploying this optimized local 0.5.0 bundle was not part of this update. Rotation, scaling,
reparenting, independent child moves, new surface comments, exhaustive journey
scrubbing, mobile rendering, and a source-change refresh remain unverified. The
complete manual review-loop checklist is therefore not claimed as fully passed.
