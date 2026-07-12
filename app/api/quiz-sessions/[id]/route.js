const BASE = 'https://parent-portal-silk.vercel.app'

export async function GET(request, { params }) {
  try {
    const res = await fetch(`${BASE}/api/quiz-sessions/${params.id}`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const res = await fetch(`${BASE}/api/quiz-sessions/${params.id}`, { method: 'PATCH', cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
