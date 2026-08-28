const stopNames = ['The Hidden Gate', 'The Sanmon', 'Still Gardens', 'Sacred Craft', 'Afterlight', 'Colophon'];
const stopIds = ['hidden-gate', 'sanmon', 'gardens', 'craft', 'afterlight', 'colophon'];

// Each uniform Catmull–Rom span is exactly a cubic Bézier. Neighbouring CAM
// knots determine its tangents; expose the knots as editable stop endpoints,
// and mark the derived tangent handles read-only. No sampled approximation.
export function catmullSpan(CAM, index, track, tension = .42) {
  const points = CAM.map(c => c[track]);
  const a = points[index], b = points[index + 1];
  const prev = points[index - 1] ?? a.map((v, k) => 2 * v - b[k]);
  const next = points[index + 2] ?? b.map((v, k) => 2 * v - a[k]);
  const handleOut = a.map((v, k) => v + tension * (b[k] - prev[k]) / 3);
  const handleIn = b.map((v, k) => v - tension * (next[k] - a[k]) / 3);
  const role = track === 'p' ? 'camera' : 'aim';
  return {
    kind: 'cubic-bezier',
    points: [
      { id: `${stopIds[index]}-${role}`, role: 'stop', stopId: stopIds[index], position: [...a], sourceRef: `index.html#CAM[${index}].${track}` },
      { id: `${stopIds[index]}-${role}-tangent-out`, role: 'control-out', position: handleOut, editable: false, sourceRef: `index.html#buildRig:CAM[${index}].${track}` },
      { id: `${stopIds[index + 1]}-${role}-tangent-in`, role: 'control-in', position: handleIn, editable: false, sourceRef: `index.html#buildRig:CAM[${index + 1}].${track}` },
      { id: `${stopIds[index + 1]}-${role}`, role: 'stop', stopId: stopIds[index + 1], position: [...b], sourceRef: `index.html#CAM[${index + 1}].${track}` },
    ],
  };
}

export function buildScrollJourney(CAM, anchors, tension = .42) {
  return {
    id: 'kyoto-night-walk', name: 'Kyoto night walk', category: 'Scroll journey', sourceRef: 'index.html#CAM',
    stops: CAM.map((c, i) => ({ id: stopIds[i], name: stopNames[i], camera: [...c.p], target: [...c.t], fov: c.fov, sourceRef: `index.html#CAM[${i}]` })),
    segments: CAM.slice(0, -1).map((_, i) => ({
      id: `${stopIds[i]}--${stopIds[i + 1]}`, fromStopId: stopIds[i], toStopId: stopIds[i + 1],
      camera: catmullSpan(CAM, i, 'p', tension), aim: { kind: 'curve', curve: catmullSpan(CAM, i, 't', tension) },
      weight: Math.max(1, anchors[i + 1] - anchors[i]), lensStart: 0, sourceRef: `index.html#progressFor:CAM[${i}]`,
    })),
  };
}

export function buildIntroJourney(CAM, intro) {
  const c = CAM[0];
  const start = { id: 'opening-dolly', name: 'Opening dolly', camera: c.p.map((v, i) => v + intro.offset[i]), target: [...c.t], fov: c.fov + intro.fov, sourceRef: 'index.html#INTRO_VIEW' };
  const end = { id: 'opening-arrival', name: 'The Hidden Gate', camera: [...c.p], target: [...c.t], fov: c.fov, sourceRef: 'index.html#CAM[0]' };
  return {
    id: 'opening-reveal', name: 'Opening reveal', sourceRef: 'index.html#applyCamera', category: 'Intro', stops: [start, end],
    segments: [{ id: 'opening-dolly--arrival', fromStopId: start.id, toStopId: end.id, weight: intro.duration, lensStart: 0,
      sourceRef: 'index.html#INTRO_VIEW',
      camera: { kind: 'line', points: [start, end].map(s => ({ id: `${s.id}-camera`, role: 'stop', stopId: s.id, position: s.camera, sourceRef: s.sourceRef })) },
      aim: { kind: 'fixed-target', target: [...c.t] },
    }],
  };
}

export function buildCardJourneys(views, push) {
  const names = ['The long climb', 'Lantern court', 'The wet court', 'Sanmon preview'];
  return views.map((view, i) => {
    const direction = view.t.map((v, k) => v - view.p[k]);
    const length = Math.hypot(...direction);
    const sourceRef = `index.html#CARD_VIEWS[${i}]`;
    const stops = [
      { id: `card-${i}-rest`, name: `${names[i]} — rest`, camera: [...view.p], target: [...view.t], fov: view.fov, sourceRef },
      { id: `card-${i}-hover`, name: `${names[i]} — hover`, camera: view.p.map((v, k) => v + direction[k] / length * push), target: [...view.t], fov: view.fov, sourceRef: `index.html#CARD_PUSH:CARD_VIEWS[${i}]` },
    ];
    return { id: `card-${i}`, name: names[i], category: 'Card hover', sourceRef, stops, segments: [{
      id: `card-${i}-push`, fromStopId: stops[0].id, toStopId: stops[1].id, weight: 1, lensStart: 0, sourceRef: 'index.html#aimCard',
      camera: { kind: 'line', points: stops.map((stop, j) => ({ id: `${stop.id}-camera`, role: 'stop', stopId: stop.id, position: stop.camera, sourceRef: stop.sourceRef, editable: j === 0 })) },
      aim: { kind: 'fixed-target', target: [...view.t] },
    }] };
  });
}
