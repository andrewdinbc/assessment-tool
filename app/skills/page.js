'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C } from '../../lib/theme'

export default function SkillsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lessonPlannerConnected, setLessonPlannerConnected] = useState(false)

  useEffect(() => {
    fetch('/api/skill-analytics').then((r) => r.json()).then(setData).catch((e) => setData({ error: e.message })).finally(() => setLoading(false))
    fetch('/api/generate-remedial').then((r) => r.json()).then((d) => setLessonPlannerConnected(d.connected)).catch(() => {})
  }, [])

  if (loading) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: C.muted }}>Loading…</div>
  if (data?.error) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: '#c0392b' }}>{data.error}</div>

  const { criterionBreakdown, skillTrends, growthOverTime, totalDataPoints } = data || {}

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 1100 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
      <h1 style={{ color: C.navy, fontSize: 26, margin: '10px 0 4px' }}>Class & Skill Analytics</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 32 }}>
        Across every approved assignment · {totalDataPoints || 0} scored criteria in total
      </p>

      {(!totalDataPoints || totalDataPoints === 0) && (
        <div style={{ padding: 40, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontStyle: 'italic', marginBottom: 32 }}>
          No approved feedback yet — trends appear here once submissions are reviewed and approved in Review.
        </div>
      )}

      {totalDataPoints > 0 && (
        <>
          {/* 1. Skill Mastery Trends */}
          <SectionHeader icon="🎯" title="Skill Mastery Trends" desc="Per-criterion performance over time — which skills need reteaching across the class." />
          <div style={{ display: 'grid', gap: 14, marginBottom: 40 }}>
            {skillTrends.map((s) => (
              <SkillTrendCard key={s.name} skill={s} lessonPlannerConnected={lessonPlannerConnected} />
            ))}
          </div>

          {/* 2. Rubric Criterion Breakdown */}
          <SectionHeader icon="📊" title="Rubric Criterion Breakdown" desc="Average score per rubric category across everything graded — strengths and weaknesses at a glance." />
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 40 }}>
            {criterionBreakdown.map((c) => (
              <div key={c.name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: C.navy }}>{c.name}</span>
                  <span style={{ color: c.avgPct >= 75 ? C.green : c.avgPct >= 60 ? C.gold : C.red, fontWeight: 700 }}>
                    {c.avgPct}% <span style={{ fontWeight: 400, color: C.muted, fontSize: 12 }}>({c.count} scores)</span>
                  </span>
                </div>
                <div style={{ height: 8, background: '#eee', borderRadius: 4 }}>
                  <div style={{
                    height: 8, width: `${c.avgPct}%`, borderRadius: 4,
                    background: c.avgPct >= 75 ? C.green : c.avgPct >= 60 ? C.gold : C.red,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* 3. Growth Over Time */}
          <SectionHeader icon="📈" title="Growth Over Time" desc="Overall average score by week — validates whether interventions are actually working." />
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24 }}>
            {growthOverTime.length < 2 ? (
              <div style={{ color: C.muted, fontStyle: 'italic', fontSize: 13 }}>
                Need at least two weeks of approved feedback to show a trend — currently {growthOverTime.length} week{growthOverTime.length === 1 ? '' : 's'} of data.
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
                {growthOverTime.map((w) => (
                  <div key={w.week} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 700, color: C.navy }}>{w.avgPct}%</div>
                    <div style={{ height: `${w.avgPct * 1.2}px`, background: C.blue, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{w.week}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SectionHeader({ icon, title, desc }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ color: C.navy, fontSize: 18, margin: '0 0 4px' }}>{icon} {title}</h2>
      <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{desc}</p>
    </div>
  )
}

function SkillTrendCard({ skill, lessonPlannerConnected }) {
  const [generating, setGenerating] = useState(false)
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState('')

  async function generateLesson() {
    setGenerating(true); setError('')
    try {
      const res = await fetch('/api/generate-remedial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterionName: skill.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLesson(data.lesson)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const max = Math.max(...skill.series.map((p) => p.avgPct), 1)

  return (
    <div style={{
      background: C.card, border: `1px solid ${skill.needsReteaching ? '#f5b7b1' : C.border}`, borderRadius: 10, padding: 18,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 700, color: C.navy }}>{skill.name}</span>
          {skill.needsReteaching && (
            <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#fdf0ef', color: C.red, fontWeight: 700 }}>
              Needs reteaching
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          {skill.latestPct}% latest {skill.trend !== 0 && (
            <span style={{ color: skill.trend > 0 ? C.green : C.red }}> ({skill.trend > 0 ? '+' : ''}{skill.trend} vs first)</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 50, marginBottom: 12 }}>
        {skill.series.map((p) => (
          <div key={p.week} title={`${p.week}: ${p.avgPct}%`} style={{
            flex: 1, height: `${(p.avgPct / max) * 44}px`, background: C.gold, borderRadius: '3px 3px 0 0', minHeight: 2,
          }} />
        ))}
      </div>

      {skill.needsReteaching && (
        <div>
          {!lesson && (
            lessonPlannerConnected ? (
              <button onClick={generateLesson} disabled={generating} style={{
                padding: '8px 16px', background: C.navy, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}>
                {generating ? 'Designing lesson…' : '📚 Generate Remedial Lesson (via Lesson Planner)'}
              </button>
            ) : (
              <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>
                Connect Lesson Planner to auto-design a remedial mini-lesson for this skill.
              </div>
            )
          )}
          {error && <div style={{ fontSize: 12, color: '#c0392b', marginTop: 8 }}>{error}</div>}
          {lesson && (
            <div style={{ marginTop: 12, padding: 14, background: '#fafaf7', borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{lesson.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}><strong>Objective:</strong> {lesson.objective}</div>
              <LessonBlock label="Hook" text={lesson.hook} />
              <LessonBlock label="Mini-lesson" text={lesson.miniLesson} />
              <LessonBlock label="Guided Practice" text={lesson.guidedPractice} />
              <LessonBlock label="Check for Understanding" text={lesson.checkForUnderstanding} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LessonBlock({ label, text }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{text}</div>
    </div>
  )
}
