// Note: mark-submission on parent-portal has no secret gate (called
// server-to-server today only by that app's own flows) - proxying it as-is.
export async function POST(request) {
  try {
    const body = await request.json()
    const res = await fetch('https://parent-portal-silk.vercel.app/api/mark-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error || 'Marking failed' }, { status: res.status })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
