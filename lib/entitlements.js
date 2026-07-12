// Central source of truth for "which other Chalk & Circuit products does
// this account have connected" - same live-check pattern already used for
// the Lesson Planner remedial-lesson button, generalized. A product
// counts as "present" if its shared secret is configured, since that's
// only ever set up after the cross-app connection is actually wired
// (matches how every integration this session touched actually works).

export const PRODUCTS = {
  parentPortal: {
    name: 'Student Portfolio',
    envVar: 'PORTFOLIO_SYNC_SECRET',
    purchaseUrl: 'https://optimizeyourfreedom.com/student-portfolio',
  },
  mathMastery: {
    name: 'Math Mastery',
    envVar: 'MICRO_UNIT_SYNC_SECRET',
    purchaseUrl: 'https://optimizeyourfreedom.com/math-mastery',
  },
  lessonPlanner: {
    name: 'Lesson Planner',
    envVar: 'LESSON_PLANNER_SYNC_SECRET',
    purchaseUrl: 'https://optimizeyourfreedom.com/lesson-planner',
  },
}

export function getEntitlements() {
  const result = {}
  for (const [key, product] of Object.entries(PRODUCTS)) {
    result[key] = { connected: !!process.env[product.envVar], name: product.name, purchaseUrl: product.purchaseUrl }
  }
  return result
}
