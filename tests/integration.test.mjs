import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as THREE from 'three';
import {
  SceneAssetRegistry,
  SPATIAL_REVIEW_ASSEMBLIES_CAPABILITY,
  SPATIAL_REVIEW_CATALOG,
  SPATIAL_REVIEW_DISCOVERY_REQUEST,
  SPATIAL_REVIEW_REQUEST,
  SPATIAL_REVIEW_RESOURCE_REQUEST,
  attachSceneAssetRegistryBridge,
  attachSpatialReviewDiscoveryBridge,
  validateSceneOwnership,
} from '@alterno-dev/spatial-review';
import { buildScrollJourney, buildIntroJourney, buildCardJourneys } from '../src/navigation-review.js';
import { REVIEW_ASSEMBLIES, REVIEW_OWNER_IDS, registerReviewAssemblies } from '../src/review-structure.js';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const readConstant = name => structuredClone(vm.runInNewContext('(' + html.match(new RegExp(`const ${name} = ([\\s\\S]*?);`))[1] + ')'));
const CAM = readConstant('CAM');
const tension = readConstant('CAM_TENSION');
const anchors = [0, 1100, 2400, 3300, 4100, 4600];
const journey = buildScrollJourney(CAM, anchors, tension);

test('every exported camera/aim span exactly matches the authored runtime Catmull–Rom curve', () => {
  for (const track of ['p', 't']) {
    const runtime = new THREE.CatmullRomCurve3(CAM.map(c => new THREE.Vector3(...c[track])), false, 'catmullrom', tension);
    journey.segments.forEach((segment, i) => {
      const definition = track === 'p' ? segment.camera : segment.aim.curve;
      const curve = new THREE.CubicBezierCurve3(...definition.points.map(p => new THREE.Vector3(...p.position)));
      for (let j = 0; j <= 20; j++) assert.ok(curve.getPoint(j / 20).distanceTo(runtime.getPoint((i + j / 20) / (CAM.length - 1))) < 1e-10);
      assert.equal(definition.points[0].stopId, segment.fromStopId);
      assert.equal(definition.points[3].stopId, segment.toStopId);
      assert.equal(definition.points[1].editable, false);
      assert.equal(definition.points[2].editable, false);
    });
  }
});

test('stops, lens, scroll timing and identities follow source edits', () => {
  journey.stops.forEach((stop, i) => {
    assert.deepEqual([...stop.camera], [...CAM[i].p]);
    assert.deepEqual([...stop.target], [...CAM[i].t]);
    assert.equal(stop.fov, CAM[i].fov);
  });
  journey.segments.forEach((s, i) => { assert.equal(s.weight, anchors[i + 1] - anchors[i]); assert.equal(s.lensStart, 0); });
  const changed = structuredClone(CAM); changed[2].p[0] += 1;
  const updated = buildScrollJourney(changed, anchors, tension);
  assert.deepEqual(updated.stops.map(s => s.id), journey.stops.map(s => s.id));
  assert.equal(updated.segments[1].camera.points[3].position[0], changed[2].p[0]);
  assert.equal(updated.segments[2].camera.points[0].position[0], changed[2].p[0]);
  assert.notDeepEqual(updated.segments[0].camera.points[2].position, journey.segments[0].camera.points[2].position);
});

test('intro and card routes derive from the same runtime inputs', () => {
  const intro = readConstant('INTRO_VIEW');
  const opening = buildIntroJourney(CAM, intro);
  assert.equal(opening.segments[0].weight, intro.duration);
  assert.equal(opening.stops[0].camera[2], CAM[0].p[2] + intro.offset[2]);
  const views = readConstant('CARD_VIEWS');
  const cards = buildCardJourneys(views, readConstant('CARD_PUSH'));
  assert.equal(cards.length, 4);
  cards.forEach(card => assert.ok(Math.abs(new THREE.Vector3(...card.stops[0].camera).distanceTo(new THREE.Vector3(...card.stops[1].camera)) - readConstant('CARD_PUSH')) < 1e-12));
});

test('scene ownership is explicit, hierarchical, valid, and backward compatible', () => {
  const registry = new SceneAssetRegistry('ownership-test');
  registerReviewAssemblies(registry);

  const ground = new THREE.Mesh(new THREE.BoxGeometry(10, .2, 8), new THREE.MeshStandardMaterial());
  ground.position.set(0, -.1, -4);
  const hall = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 2), new THREE.MeshStandardMaterial());
  hall.position.set(0, 1.5, -8);
  registry.register({ actorId: 'courtyard-ground', assetId: 'courtyard-ground', name: 'Wet courtyard', sourceRef: 'index.html#buildShell:floor', category: 'Ground', root: ground, parentAssemblyId: REVIEW_OWNER_IDS.grounds });
  registry.register({ actorId: 'worship-hall', assetId: 'worship-hall', name: 'Worship hall', sourceRef: 'index.html#buildTemple', category: 'Architecture', root: hall, parentAssemblyId: REVIEW_OWNER_IDS.hall });

  const scene = registry.toScene(true);
  assert.equal(scene.ownership.capability, SPATIAL_REVIEW_ASSEMBLIES_CAPABILITY);
  assert.equal(scene.ownership.mode, 'hierarchical');
  assert.deepEqual(scene.assemblies.map(assembly => assembly.assemblyId), REVIEW_ASSEMBLIES.map(assembly => assembly.assemblyId));
  assert.equal(scene.assemblies.find(assembly => assembly.assemblyId === REVIEW_OWNER_IDS.hall).parentAssemblyId, REVIEW_OWNER_IDS.grounds);
  assert.equal(scene.actors.find(actor => actor.actorId === 'worship-hall').parentAssemblyId, REVIEW_OWNER_IDS.hall);
  assert.deepEqual(scene.actors.find(actor => actor.actorId === 'worship-hall').localTransform.position, [0, 1.5, -8]);
  assert.ok(scene.assemblies.find(assembly => assembly.assemblyId === REVIEW_OWNER_IDS.grounds).bounds.size.every(Number.isFinite));
  assert.deepEqual(validateSceneOwnership(scene), []);

  const fallback = registry.toScene(false);
  assert.equal(fallback.ownership.mode, 'flattened');
  assert.equal(fallback.assemblies, undefined);
  assert.ok(fallback.actors.every(actor => actor.parentAssemblyId === undefined && actor.localTransform === undefined));
  assert.deepEqual(fallback.actors.map(actor => actor.transform), scene.actors.map(actor => actor.transform));
});

test('both bridges enforce origin and parent-window checks, and detach cleanly', async () => {
  const listeners = new Set(), messages = [];
  const parent = { postMessage: (...args) => messages.push(args) };
  const previous = global.window;
  global.window = { location: new URL('https://rbifulco.github.io/kage/'), parent, opener: null, setTimeout, addEventListener: (name, f) => listeners.add(f), removeEventListener: (name, f) => listeners.delete(f) };
  try {
    const registry = new SceneAssetRegistry('test');
    registerReviewAssemblies(registry);
    registry.register({ actorId: 'gate', assetId: 'gate', name: 'Gate', sourceRef: 'index.html#buildTorii', category: 'Architecture', parentAssemblyId: REVIEW_OWNER_IDS.courtyard, root: new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()) });
    const options = { allowOfficialEditor: true, allowedOrigins: [] };
    const detach = [attachSpatialReviewDiscoveryBridge({ name: 'Kage', websiteUrl: 'https://rbifulco.github.io/kage/', liveCapture: './?spatial-review-capture=1' }, options), attachSceneAssetRegistryBridge(registry, options)];
    messages.length = 0; // SDK's unprotected ready notification is not a catalog.
    const send = (origin, source = parent, suffix = '', data = {}) => {
      for (const type of [SPATIAL_REVIEW_DISCOVERY_REQUEST, SPATIAL_REVIEW_REQUEST, SPATIAL_REVIEW_RESOURCE_REQUEST])
        for (const listener of listeners) listener({ origin, source, data: { type, requestId: origin + type + suffix, resourceId: 'unregistered', ...data } });
    };
    send('https://evil.example'); send('https://spatial-review.alterno.dev.evil.example'); send('http://localhost:4184');
    send('https://spatial-review.alterno.dev', { postMessage: parent.postMessage });
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(messages.length, 0);
    send('https://spatial-review.alterno.dev');
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.equal(messages.length, 3);
    assert.ok(messages.every(([, origin]) => origin === 'https://spatial-review.alterno.dev'));
    assert.ok(messages.some(([message]) => message.payload?.scene.actors[0].actorId === 'gate'));
    assert.equal(messages.find(([message]) => message.type === SPATIAL_REVIEW_CATALOG)[0].payload.scene.ownership.mode, 'flattened');
    messages.length = 0;
    send('https://spatial-review.alterno.dev', parent, '-hierarchical', { capabilities: [SPATIAL_REVIEW_ASSEMBLIES_CAPABILITY] });
    await new Promise(resolve => setTimeout(resolve, 10));
    const hierarchical = messages.find(([message]) => message.type === SPATIAL_REVIEW_CATALOG)[0].payload.scene;
    assert.equal(hierarchical.ownership.mode, 'hierarchical');
    assert.equal(hierarchical.assemblies.length, REVIEW_ASSEMBLIES.length);
    assert.equal(hierarchical.actors[0].parentAssemblyId, REVIEW_OWNER_IDS.courtyard);
    detach.forEach(f => f()); assert.equal(listeners.size, 0);
    const revoke = attachSpatialReviewDiscoveryBridge({ name: 'Kage', liveCapture: './' }, { allowOfficialEditor: false });
    messages.length = 0; send('https://spatial-review.alterno.dev'); assert.equal(messages.length, 0); revoke();
  } finally { global.window = previous; }
});

test('embedded website script parses after runtime migration', () => {
  const inline = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new vm.Script(inline));
});
