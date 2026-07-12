const PARENT_PORTAL_URL = 'https://parent-portal-silk.vercel.app'

export async function POST(request) {
  const secret = process.env.PORTFOLIO_SYNC_SECRET
  if (!secret) return Response.json({ error: 'PORTFOLIO_SYNC_SECRET not configured' }, { status: 500 })

  try {
    const formData = await request.formData()
    const res = await fetch(`${PARENT_PORTAL_URL}/api/qr-worksheet/bulk`, {
      method: 'POST',
      headers: { 'x-portfolio-sync-secret': secret },
      body: formData,
      cache: 'no-store',
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return Response.json({ error: data.error || 'Generation failed' }, { status: res.status })
    }
    const buf = await res.arrayBuffer()
    const studentCount = res.headers.get('X-Student-Count')
    return new Response(buf, {
      headers: {
        'Content-Type': 'application/pdf',
        'X-Student-Count': studentCount || '',
      },
    })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
