import { fetchParentPortal } from '../../../lib/cross-app'

export async function GET() {
  try {
    const data = await fetchParentPortal('/api/teacher/skill-analytics')
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
