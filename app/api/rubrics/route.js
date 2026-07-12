
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  try {
    const path = id ? `/api/rubrics?id=${id}` : '/api/rubrics'
    const res = await fetch(`https://parent-portal-silk.vercel.app${path}`, { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const res = await fetch('https://parent-portal-silk.vercel.app/api/rubrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error || 'Failed to save rubric' }, { status: res.status })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const res = await fetch('https://parent-portal-silk.vercel.app/api/rubrics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
