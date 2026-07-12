const LESSON_PLANNER_URL = 'https://lesson-planner-liart.vercel.app'

export async function GET() {
  // Lets the UI know whether to even show the "Generate Remedial Lesson"
  // option - per Aj: products are sold separately, so this feature must
  // not assume every assessment-tool customer also has lesson-planner.
  return Response.json({ connected: !!process.env.LESSON_PLANNER_SYNC_SECRET })
}

export async function POST(request) {
  const secret = process.env.LESSON_PLANNER_SYNC_SECRET
  if (!secret) {
    return Response.json({ error: 'Lesson Planner is not connected on this account.' }, { status: 400 })
  }
  try {
    const body = await request.json()
    const res = await fetch(`${LESSON_PLANNER_URL}/api/generate-remedial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-lesson-planner-sync-secret': secret },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok) return Response.json({ error: data.error || 'Generation failed' }, { status: res.status })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
