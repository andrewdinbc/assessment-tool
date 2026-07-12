import { fetchParentPortal } from '../../../lib/cross-app'

// Admin/contacts on parent-portal had no auth gate of its own (relied on
// the page-level password prompt, which this migration removes). Adding
// the same server-side secret here rather than leaving it open, since
// it's real parent contact data.

export async function GET() {
  try {
    const data = await fetchParentPortal('/api/admin/contacts', {
      headers: { 'x-portfolio-sync-secret': process.env.PORTFOLIO_SYNC_SECRET },
    })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const data = await fetchParentPortal('/api/admin/contacts', {
      method: 'POST',
      headers: { 'x-portfolio-sync-secret': process.env.PORTFOLIO_SYNC_SECRET },
      body: JSON.stringify(body),
    })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json()
    const data = await fetchParentPortal('/api/admin/contacts', {
      method: 'DELETE',
      headers: { 'x-portfolio-sync-secret': process.env.PORTFOLIO_SYNC_SECRET },
      body: JSON.stringify(body),
    })
    return Response.json(data)
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
