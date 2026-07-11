'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C } from '../../../lib/theme'

const TEACHER_EMAIL = 'andrewsinbc3@gmail.com'

export default function MathAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/math-analytics?teacherEmail=${encodeURIComponent(TEACHER_EMAIL)}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setData({ error: e.message }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: C.muted }}>Loading…</div>
  if (data?.error) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: '#c0392b' }}>{data.error}</div>

  const { overview, patterns, strengths, areasForGrowth } = data || {}

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 1200 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
      <h1 style={{ color: C.navy, fontSize: 24, margin: '8px 0 24px' }}>🧮 Math Mastery — Class Overview</h1>

      {overview && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total attempts" value={overview.totalAttempts} color={C.navy} />
          <StatCard label="Average score" value={`${overview.avgScorePct}%`} color={C.blue} />
          <StatCard label="Mastery rate" value={`${overview.masteryRatePct}%`} color={C.green} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ fontWeight: 700, color: C.green, marginBottom: 12 }}>💪 Strengths by strand</div>
          {(strengths || []).map((s, i) => (
            <StrandRow key={i} strand={s} good />
          ))}
          {(!strengths || strengths.length === 0) && <EmptyNote text="No attempts recorded yet." />}
        </div>
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ fontWeight: 700, color: C.gold, marginBottom: 12 }}>🎯 Areas for growth</div>
          {(areasForGrowth || []).map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <StrandRow strand={s} />
              {s.studentNames?.length > 0 && (
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Needs support: {s.studentNames.join(', ')}</div>
              )}
            </div>
          ))}
          {(!areasForGrowth || areasForGrowth.length === 0) && <EmptyNote text="No attempts recorded yet." />}
        </div>
      </div>

      {patterns && patterns.length > 0 && (
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
          <div style={{ fontWeight: 700, color: C.navy, marginBottom: 12 }}>Common error patterns</div>
          {patterns.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < patterns.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 13 }}>
              <span>{p.errorType}</span>
              <span style={{ color: C.muted }}>{p.count} occurrences · {p.affectedStudentCount} students</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function StrandRow({ strand, good }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ textTransform: 'capitalize' }}>{strand.strand?.replace(/-/g, ' ')}</span>
        <span style={{ color: good ? C.green : C.red, fontWeight: 600 }}>{strand.avgScorePct}%</span>
      </div>
      <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
        <div style={{ height: 6, width: `${strand.avgScorePct}%`, background: good ? C.green : C.gold, borderRadius: 3 }} />
      </div>
    </div>
  )
}

function EmptyNote({ text }) {
  return <div style={{ color: C.muted, fontStyle: 'italic', fontSize: 13 }}>{text}</div>
}
