// lib/cross-app.js
// assessment-tool holds no database of its own - it's a pure consumer of
// parent-portal (writing/rubric data) and Mastery Studio/math-mastery
// (math practice data), both gated by shared secrets. This centralizes
// those calls so every route/page uses the same pattern.

const PARENT_PORTAL_URL = 'https://parent-portal-silk.vercel.app'
const MASTERY_STUDIO_URL = 'https://math-mastery-three.vercel.app'

export async function fetchParentPortal(path, options = {}) {
  const secret = process.env.PORTFOLIO_SYNC_SECRET
  if (!secret) throw new Error('PORTFOLIO_SYNC_SECRET not configured')
  const res = await fetch(`${PARENT_PORTAL_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-portfolio-sync-secret': secret,
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `parent-portal request failed: ${res.status}`)
  return data
}

export async function fetchMasteryStudio(path, options = {}) {
  const secret = process.env.MICRO_UNIT_SYNC_SECRET
  if (!secret) throw new Error('MICRO_UNIT_SYNC_SECRET not configured')
  const res = await fetch(`${MASTERY_STUDIO_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-micro-unit-sync-secret': secret,
      ...(options.headers || {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Mastery Studio request failed: ${res.status}`)
  return data
}
