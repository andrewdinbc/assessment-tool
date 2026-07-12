export async function GET() {
  try {
    const res = await fetch('https://parent-portal-silk.vercel.app/api/oral-reading/schedule', { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const res = await fetch('https://parent-portal-silk.vercel.app/api/oral-reading/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store',
    })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
