const MASTERY_STUDIO_URL = 'https://math-mastery-three.vercel.app'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const teacherEmail = searchParams.get('teacherEmail')
  if (!teacherEmail) return Response.json({ error: 'teacherEmail required' }, { status: 400 })

  const secret = process.env.MICRO_UNIT_SYNC_SECRET
  if (!secret) return Response.json({ error: 'MICRO_UNIT_SYNC_SECRET not configured' }, { status: 500 })

  try {
    const res = await fetch(`${MASTERY_STUDIO_URL}/api/analytics?teacherEmail=${encodeURIComponent(teacherEmail)}`, {
      headers: { 'x-micro-unit-sync-secret': secret },
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error || 'Mastery Studio request failed' }, { status: res.status })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
