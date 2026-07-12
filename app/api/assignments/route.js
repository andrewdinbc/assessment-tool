export async function GET() {
  try {
    const res = await fetch('https://parent-portal-silk.vercel.app/api/assignments', { cache: 'no-store' })
    const data = await res.json()
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
