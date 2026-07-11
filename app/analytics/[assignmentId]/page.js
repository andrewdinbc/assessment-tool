'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { C } from '../../../lib/theme'

const TABS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'strengths', label: 'Strengths', icon: '📈' },
  { key: 'growth', label: 'Areas for growth', icon: '🎯' },
]

export default function AnalyticsPage() {
  const params = useParams()
  const assignmentId = params.assignmentId
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    fetch(`/api/writing-analytics?assignmentId=${assignmentId}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setData({ error: e.message }))
      .finally(() => setLoading(false))
  }, [assignmentId])

  if (loading) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: C.muted }}>Loading…</div>
  if (data?.error) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: '#c0392b' }}>{data.error}</div>

  const { assignment, submissionCount, approvedCount, overview, patterns } = data || {}

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 1200 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
      <h1 style={{ color: C.navy, fontSize: 24, margin: '8px 0 4px' }}>{assignment?.title}</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
        {approvedCount} of {submissionCount} submissions reviewed and approved
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', border: 'none', background: tab === t.key ? C.navy : 'transparent',
            color: tab === t.key ? '#fff' : C.navy, borderRadius: '8px 8px 0 0', cursor: 'pointer',
            fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {!overview && (
        <div style={{ color: C.muted, fontStyle: 'italic' }}>
          No approved feedback yet — approve submissions in the Review page to populate this report.
        </div>
      )}

      {overview && tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard label={`across ${approvedCount} submissions`} value={`${overview.avgScore} / ${overview.maxScore}`} color={C.blue} />
            <StatCard label="approved so far" value={`${approvedCount} / ${submissionCount}`} color={C.green} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
            <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>Distribution</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Score buckets, all approved submissions</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                {(overview.distribution || []).map((d, i) => {
                  const max = Math.max(...overview.distribution.map((x) => x.count), 1)
                  return (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>{d.count}</div>
                      <div style={{ height: `${(d.count / max) * 120}px`, background: C.gold, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{d.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>Criteria</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Class average per criterion</div>
              {(overview.criteria || []).map((c, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{c.name}</span>
                    <span style={{ color: C.muted }}>{c.avgScore}/{c.maxScore}</span>
                  </div>
                  <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
                    <div style={{ height: 6, width: `${(c.avgScore / c.maxScore) * 100}%`, background: C.blue, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {overview && tab === 'strengths' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(patterns?.strengths || []).map((s, i) => (
            <SkillCard key={i} skill={s} good />
          ))}
          {(!patterns?.strengths || patterns.strengths.length === 0) && <EmptyNote text="No strengths data yet." />}
        </div>
      )}

      {overview && tab === 'growth' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {(patterns?.areasForGrowth || []).map((s, i) => (
            <SkillCard key={i} skill={s} />
          ))}
          {(!patterns?.areasForGrowth || patterns.areasForGrowth.length === 0) && <EmptyNote text="No growth-area data yet." />}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 20 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function SkillCard({ skill, good }) {
  const pct = Math.round((skill.avgScore / skill.maxScore) * 100)
  return (
    <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
      <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4, fontSize: 14 }}>{skill.name}</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{skill.studentCount} student{skill.studentCount === 1 ? '' : 's'} scored</div>
      <div style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
        background: good ? '#eef7f0' : '#fdf0ef', color: good ? C.green : C.red,
      }}>
        {pct}% average
      </div>
    </div>
  )
}

function EmptyNote({ text }) {
  return <div style={{ color: C.muted, fontStyle: 'italic', gridColumn: '1 / -1' }}>{text}</div>
}
