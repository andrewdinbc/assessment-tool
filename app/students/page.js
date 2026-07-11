'use client'
import Link from 'next/link'
import { C } from '../../lib/theme'

export default function StudentsPage() {
  return (
    <div style={{ padding: 40, fontFamily: 'Georgia, serif', maxWidth: 700 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
      <h1 style={{ color: C.navy, fontSize: 24, margin: '8px 0 12px' }}>📁 Student Portfolio</h1>
      <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
        Not built yet — this will show a single student&apos;s full history across both Math Mastery and
        Writing in one place (approved feedback, scores over time, submitted work). Review pages
        (<Link href="/" style={{ color: C.gold }}>writing</Link>) and the{' '}
        <Link href="/analytics/math" style={{ color: C.gold }}>Math Mastery class overview</Link> are
        both live now; this per-student combined view is the next piece.
      </p>
    </div>
  )
}
