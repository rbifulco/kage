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

First installation: SDK 0.4.0 (latest npm release checked 2026-08-28), Three.js
0.160.1 (minimum compatible release family). Preserve the original static site,
using one shared runtime and a checked-in reproducible browser bundle.

| Scale | Registered content | Source owner |
| --- | --- | --- |
| Scene | Temple, torii, six independent lanterns, five maples, eight rocks | `index.html`: `buildTemple`, `buildTorii`, `buildLantern`, `buildMaple`, `buildRocks`, `JOBS` placements |
| Context | Ground, podium, coping, stairs, rails, sky, ridges, moon, foreground, wordmark | Corresponding `buildShell`, `buildMoon`, `buildForeground`, `buildWordmark` definitions |
| Asset | Named construction parts; six lanterns share `stone-lantern`; seeded maples and deformed rocks are distinct variants | Named meshes in the same construction functions |
| Path | Six-stop Kyoto night walk, opening dolly, four card hover views | `CAM`, `buildRig`, `progressFor`, `INTRO_VIEW`, `applyCamera`, `CARD_VIEWS`, `CARD_PUSH`, `aimCard` |
| Capture | Fixed high-quality 1440×900 authored view, completed intro, clock zero; all construction jobs complete | `start`, `KageReview.ready` |

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
  live; judge final atmosphere in Kage itself.
- Paths represent authored desktop motion. Pointer parallax, scroll damping,
  reduced-motion scheduling and responsive aspect compensation remain runtime
  modifiers, not editable navigation controls. Capture freezes these modifiers
  for repeatability. Relative input weights are preserved; editor playback may
  use a different easing for FOV.
- Discovery is browser-only; no static JSON fallbacks are advertised and CLI
  discovery validation is not applicable.

## Verification

Baseline: the original site loaded in the browser with no observed warnings or
errors. There was no prior package/build/test suite.

- `npm test`: five checks pass (exact camera/aim curves at 210 positions,
  source edits/shared stops, intro/card inputs, production origin/window denial
  and bridge cleanup, embedded script syntax).
- `npm run build` and `git diff --check`: pass.
- Browser harness across localhost ports 4183/4184: discovery, capture readiness,
  37 unique actors, 32 detailed asset families, six journeys, five representative
  live texture transfers, and repeated catalog stability pass.
- Original versus upgraded desktop appearance checked; r160's changed UV
  shader convention initially hid foreground planes, fixed with explicit
  `USE_UV`. Legacy lighting emits an expected deprecation warning.
- Official hosted editor feedback interactions and production deployment are
  checked separately; refer to the completion report for their outcome.
