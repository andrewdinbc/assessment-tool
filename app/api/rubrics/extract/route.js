export async function POST(request) {
  try {
    const formData = await request.formData()
    const res = await fetch('https://parent-portal-silk.vercel.app/api/rubrics/extract', {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error || 'Extraction failed' }, { status: res.status })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
