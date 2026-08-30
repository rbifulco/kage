import * as THREE from 'three';
import { SceneAssetRegistry, attachSceneAssetRegistryBridge, attachSpatialReviewDiscoveryBridge } from '@alterno-dev/spatial-review';
import { buildScrollJourney, buildIntroJourney, buildCardJourneys } from './navigation-review.js';
import { registerReviewAssemblies, REVIEW_OWNER_IDS } from './review-structure.js';

// Preserve r149's authored colour values; the website and SDK share ONE runtime.
THREE.ColorManagement.enabled = false;
window.THREE = THREE;
const registry = new SceneAssetRegistry(__KAGE_BUILD_ID__);
registerReviewAssemblies(registry);
// Explicit approval recorded in SPATIAL_REVIEW.md; no other production origins.
const bridgeOptions = { allowOfficialEditor: true, allowedOrigins: [] };
const websiteUrl = new URL('./', location.href).href;
// Keep review geometry at authored high detail, but omit presentation-only GPU
// work. The editor may keep several capture frames alive at once, so each one
// uses a deterministic 1x buffer without post-processing or shadow maps.
const liveCapture = new URL('?spatial-review-capture=1&shot=0&q=high&adapt=0&post=0&shadow=0&dpr=1', websiteUrl).href;
const capture = new URLSearchParams(location.search).get('spatial-review-capture') === '1';
let stopDiscovery, stopCapture, ready = false;

function startBridges() {
  stopDiscovery ??= attachSpatialReviewDiscoveryBridge({ name: 'Kage — Kyoto night walk', websiteUrl, liveCapture }, bridgeOptions);
  if (capture && ready) stopCapture ??= attachSceneAssetRegistryBridge(registry, bridgeOptions);
}
function stopBridges() {
  stopDiscovery?.(); stopCapture?.(); stopDiscovery = stopCapture = undefined;
}

window.KageReview = {
  capture,
  owners: REVIEW_OWNER_IDS,
  register(root, actorId, name, source, category = 'Architecture', assetId = actorId, parentAssemblyId) {
    root.name ||= name;
    root.traverse(node => {
      if (!node.material) return;
      for (const material of [node.material].flat()) {
        material.name ||= `${root.name} — ${node.name || 'surface'}`;
        for (const slot of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'emissiveMap']) {
          if (material[slot]) material[slot].name ||= `${material.name} ${slot}`;
        }
      }
    });
    registry.register({ root, actorId, assetId, name, category, parentAssemblyId, sourceRef: `index.html#${source}`, order: registry.size });
  },
  ready(CAM, anchors, tension, intro, cards, push) {
    registry.registerNavigationSequence(buildScrollJourney(CAM, anchors, tension));
    registry.registerNavigationSequence(buildIntroJourney(CAM, intro));
    for (const journey of buildCardJourneys(cards, push)) registry.registerNavigationSequence(journey);
    ready = true;
    startBridges();
    document.documentElement.dataset.spatialReviewReady = registry.buildId;
  },
  refreshNavigation(CAM, anchors, tension) {
    if (ready) registry.registerNavigationSequence(buildScrollJourney(CAM, anchors, tension));
  },
};
startBridges();
addEventListener('pagehide', stopBridges);
addEventListener('pageshow', startBridges);
