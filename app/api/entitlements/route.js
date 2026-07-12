import { getEntitlements } from '../../../lib/entitlements'

export async function GET() {
  return Response.json(getEntitlements())
}
