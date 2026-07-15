'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { C, FONT_BODY } from '../../../lib/theme'

const TIER_COLOR = {
  'Needs significant revision': C.red,
  'Solid draft': C.gold,
  'Strong': C.green,
}

export default function TriagePage() {
  const params = useParams()
  const assignmentId = params.assignmentId
  const [ratings, setRatings] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runRating() {
    setLoading(true); setError(''); setRatings(null)
    try {
      const res = await fetch('/api/paper-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRatings(data.ratings || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: FONT_BODY, maxWidth: 800 }}>
      <Link href={`/review/${assignmentId}`} style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Back to review</Link>
      <h1 style={{ color: C.navy, fontSize: 24, margin: '10px 0 4px' }}>⚡ Paper Rater</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
        Quick triage across the whole stack — not a grade, just which papers need your attention first before you grade any of them.
      </p>

      {!ratings && (
        <button onClick={runRating} disabled={loading} style={{
          padding: '12px 24px', background: C.gold, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14,
        }}>
          {loading ? 'Rating all submissions…' : 'Rate All Papers'}
        </button>
      )}

      {error && <div style={{ marginTop: 16, padding: 12, background: '#fdecea', border: '1px solid #f5b7b1', borderRadius: 8, color: '#c0392b' }}>{error}</div>}

      {ratings && ratings.length === 0 && (
        <div style={{ color: C.muted, fontStyle: 'italic' }}>No text submissions to rate yet.</div>
      )}

      {ratings && ratings.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {ratings.map((r, i) => (
            <div key={r.submissionId} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, color: C.muted, width: 20 }}>{i + 1}</span>
              <span style={{ fontWeight: 700, color: C.navy, minWidth: 130 }}>{r.qrId}</span>
              {r.tier ? (
                <>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    background: `${TIER_COLOR[r.tier]}15`, color: TIER_COLOR[r.tier],
                  }}>
                    {r.tier}
                  </span>
                  <span style={{ fontSize: 12, color: C.muted }}>{r.weakestArea}</span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: '#c0392b' }}>Rating failed</span>
              )}
              <Link href={`/review/${assignmentId}`} style={{ marginLeft: 'auto', fontSize: 12, color: C.gold, textDecoration: 'none' }}>
                Review →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
