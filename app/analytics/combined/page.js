'use client'
import { useState, useEffect } from 'react'

const C = { navy: '#1c3557', gold: '#b57c2a', green: '#1a7a3e', red: '#b03a2e', border: '#ddd4c2', bg: '#f2ede3' }

export default function CombinedAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/combined-analytics')
      .then((res) => res.json())
      .then(setData)
      .catch((e) => setData({ error: e.message }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Georgia, serif', padding: 32 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ color: C.navy, fontSize: 26 }}>Combined Analytics</h1>
        <p style={{ color: '#8a7d6e', fontSize: 13, marginBottom: 24 }}>
          Overview / Patterns / Strengths / Areas for Growth — merging Mastery Studio and Assessment Tool data sources.
        </p>

        {loading && <div style={{ color: '#8a7d6e' }}>Loading…</div>}

        {data && !loading && (
          <>
            <Section title="🧮 Mastery Studio (math practice)" block={data.masteryStudio} />
            <Section title="📝 Assessment Tool (rubric-based review)" block={data.assessmentTool} />
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, block }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
      <h2 style={{ color: C.navy, fontSize: 18, marginTop: 0 }}>{title}</h2>

      {block?.error && <div style={{ color: C.red, fontSize: 13 }}>⚠️ {block.error}</div>}
      {block?.note && <div style={{ color: '#8a7d6e', fontSize: 13, fontStyle: 'italic' }}>{block.note}</div>}

      {block?.data && (
        <>
          <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
            <Stat label="Total Attempts" value={block.data.overview.totalAttempts} />
            <Stat label="Avg Score" value={`${block.data.overview.avgScorePct}%`} />
            <Stat label="Mastery Rate" value={`${block.data.overview.masteryRatePct}%`} />
          </div>

          {block.data.patterns?.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: C.navy }}>Patterns</h3>
              <ul style={{ fontSize: 13 }}>
                {block.data.patterns.map((p) => (
                  <li key={p.errorType}>{p.errorType} — {p.count} occurrences across {p.affectedStudentCount} students</li>
                ))}
              </ul>
            </>
          )}

          {block.data.strengths?.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: C.green }}>Strengths</h3>
              <ul style={{ fontSize: 13 }}>
                {block.data.strengths.map((s) => (
                  <li key={s.strand}>{s.strand} — {s.avgScorePct}% average</li>
                ))}
              </ul>
            </>
          )}

          {block.data.areasForGrowth?.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, color: C.red }}>Areas for Growth</h3>
              <ul style={{ fontSize: 13 }}>
                {block.data.areasForGrowth.map((s) => (
                  <li key={s.strand}>
                    {s.strand} — {s.avgScorePct}% average
                    {s.studentNames?.length > 0 && ` (${s.studentNames.join(', ')})`}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.navy }}>{value}</div>
      <div style={{ fontSize: 12, color: '#8a7d6e' }}>{label}</div>
    </div>
  )
}
