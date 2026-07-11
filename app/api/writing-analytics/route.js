import { fetchParentPortal } from '../../../lib/cross-app'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const assignmentId = searchParams.get('assignmentId')
  if (!assignmentId) return Response.json({ error: 'assignmentId required' }, { status: 400 })

  try {
    const data = await fetchParentPortal(`/api/teacher/analytics?assignmentId=${assignmentId}`)
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
