import { fetchParentPortal } from '../../../lib/cross-app'

export async function POST(request) {
  try {
    const body = await request.json()
    const data = await fetchParentPortal('/api/teacher/assessment', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
