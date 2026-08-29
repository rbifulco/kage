export const REVIEW_OWNER_IDS = Object.freeze({
  grounds: 'temple-grounds',
  courtyard: 'approach-courtyard',
  hall: 'worship-hall-complex',
});

const identity = () => ({ position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });

// These are logical, transform-only owners for review. They intentionally do
// not reparent or duplicate any of Kage's rendered Three.js objects.
export const REVIEW_ASSEMBLIES = Object.freeze([
  {
    assemblyId: REVIEW_OWNER_IDS.grounds,
    name: 'Temple grounds',
    sourceRef: 'src/review-structure.js#temple-grounds',
    localTransform: identity(),
  },
  {
    assemblyId: REVIEW_OWNER_IDS.courtyard,
    parentAssemblyId: REVIEW_OWNER_IDS.grounds,
    name: 'Approach courtyard',
    sourceRef: 'src/review-structure.js#approach-courtyard',
    localTransform: identity(),
  },
  {
    assemblyId: REVIEW_OWNER_IDS.hall,
    parentAssemblyId: REVIEW_OWNER_IDS.grounds,
    name: 'Worship hall complex',
    sourceRef: 'src/review-structure.js#worship-hall-complex',
    localTransform: identity(),
  },
]);

export function registerReviewAssemblies(registry) {
  for (const assembly of REVIEW_ASSEMBLIES) registry.registerAssembly(assembly);
}
