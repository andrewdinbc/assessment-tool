export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    const res = await fetch(`https://parent-portal-silk.vercel.app/api/oral-reading/attempts/${params.id}/score`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
