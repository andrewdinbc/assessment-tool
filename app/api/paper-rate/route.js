export async function POST(request) {
  try {
    const body = await request.json()
    const res = await fetch('https://parent-portal-silk.vercel.app/api/paper-rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error || 'Rating failed' }, { status: res.status })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
