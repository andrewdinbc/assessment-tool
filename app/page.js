'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C } from '../lib/theme'

const TEACHER_EMAIL = 'andrewsinbc3@gmail.com'

export default function Dashboard() {
  const [assignments, setAssignments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [writingAnalytics, setWritingAnalytics] = useState(null)
  const [mathAnalytics, setMathAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingTrends, setLoadingTrends] = useState(false)

  useEffect(() => {
    fetch('/api/assignments')
      .then((r) => r.json())
      .then((d) => {
        const list = d.assignments || []
        setAssignments(list)
        if (list[0]) setSelectedId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch(`/api/math-analytics?teacherEmail=${encodeURIComponent(TEACHER_EMAIL)}`)
      .then((r) => r.json())
      .then(setMathAnalytics)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoadingTrends(true)
    fetch(`/api/writing-analytics?assignmentId=${selectedId}`)
      .then((r) => r.json())
      .then(setWritingAnalytics)
      .catch(() => {})
      .finally(() => setLoadingTrends(false))
  }, [selectedId])

  const selectedAssignment = assignments.find((a) => a.id === selectedId)

  return (
    <div style={{ padding: 40, maxWidth: 1200, fontFamily: 'Georgia, serif' }}>
      <h1 style={{ color: C.navy, fontSize: 26, marginBottom: 4 }}>Review & Portfolio</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 32 }}>
        Everything a teacher needs: review student submissions, track progress across Math Mastery and Writing, and see the full picture per student.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
        <ActionCard
          icon="✍️"
          title={assignments.length ? 'Review Writing' : 'Create a Writing Assignment'}
          desc={assignments.length ? 'Grade submissions and give personalized feedback.' : 'No writing assignments yet — generate one to get started.'}
          href={assignments[0] ? `/review/${assignments[0].id}` : '/worksheets'}
        />
        <ActionCard icon="🧮" title="Math Mastery" desc="See class progress across micro-units." href="/analytics/math" />
        <ActionCard icon="📁" title="Student Portfolio" desc="Full history per student, both subjects." href="/students" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <h2 style={{ color: C.navy, fontSize: 20, marginBottom: 16 }}>Trends and patterns</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: `1px solid ${C.border}`, fontFamily: 'inherit', minWidth: 280 }}
          >
            {loading && <option>Loading…</option>}
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
          {selectedId && (
            <Link href={`/analytics/${selectedId}`} style={{
              padding: '10px 18px', background: C.gold, color: '#fff', borderRadius: 8,
              textDecoration: 'none', fontWeight: 600, fontSize: 13,
            }}>
              View class report →
            </Link>
          )}
        </div>

        {loadingTrends && <div style={{ color: C.muted }}>Loading…</div>}

        {!loadingTrends && writingAnalytics?.patterns && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <SummaryCard icon="🎯" title="Overall Assessment" color={C.blue}>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#444', margin: 0 }}>
                {writingAnalytics.overview?.avgScore != null
                  ? `Class average: ${writingAnalytics.overview.avgScore} / ${writingAnalytics.overview.maxScore} across ${writingAnalytics.approvedCount} approved submission${writingAnalytics.approvedCount === 1 ? '' : 's'}.`
                  : 'No approved feedback yet for this assignment.'}
              </p>
            </SummaryCard>
            <SummaryCard icon="💪" title="Strengths" color={C.green}>
              {(writingAnalytics.patterns.strengths || []).map((s, i) => (
                <li key={i} style={{ fontSize: 13, marginBottom: 6 }}>{s.name} — {s.avgScore}/{s.maxScore}</li>
              ))}
            </SummaryCard>
            <SummaryCard icon="🌱" title="Areas for Growth" color={C.gold}>
              {(writingAnalytics.patterns.areasForGrowth || []).map((s, i) => (
                <li key={i} style={{ fontSize: 13, marginBottom: 6 }}>{s.name} — {s.avgScore}/{s.maxScore}</li>
              ))}
            </SummaryCard>
          </div>
        )}

        {!loadingTrends && writingAnalytics && !writingAnalytics.patterns && (
          <div style={{ color: C.muted, fontStyle: 'italic', fontSize: 13 }}>
            No approved feedback for &quot;{selectedAssignment?.title}&quot; yet — approve submissions in Review to see trends here.
          </div>
        )}
      </div>

      {mathAnalytics?.overview && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ color: C.navy, fontSize: 20, marginBottom: 16 }}>🧮 Math Mastery — Class Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <StatCard label="Total attempts" value={mathAnalytics.overview.totalAttempts} color={C.navy} />
            <StatCard label="Average score" value={`${mathAnalytics.overview.avgScorePct}%`} color={C.blue} />
            <StatCard label="Mastery rate" value={`${mathAnalytics.overview.masteryRatePct}%`} color={C.green} />
          </div>
        </div>
      )}
    </div>
  )
}

function ActionCard({ icon, title, desc, href }) {
  return (
    <Link href={href} style={{
      display: 'block', padding: 20, background: C.card, borderRadius: 10, border: `1px solid ${C.border}`,
      textDecoration: 'none', transition: 'box-shadow 0.15s',
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4 }}>{desc}</div>
    </Link>
  )
}

function SummaryCard({ icon, title, color, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 10 }}>{icon} {title}</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>{children}</ul>
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

