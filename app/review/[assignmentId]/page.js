'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { C, LEVELS } from '../../../lib/theme'
import Tooltip from '../../../components/Tooltip'

export default function ReviewPage() {
  const params = useParams()
  const assignmentId = params.assignmentId
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [idx, setIdx] = useState(0)
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [marking, setMarking] = useState(false)
  const [error, setError] = useState('')

  // Essay Checker (fast, separate from full rubric marking)
  const [check, setCheck] = useState(null)
  const [checking, setChecking] = useState(false)
  const [showCheck, setShowCheck] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/submissions?assignmentId=${assignmentId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAssignment(data.assignment)
      setSubmissions(data.submissions || [])
      if (data.submissions?.[0]) setDraft(data.submissions[0].structured_feedback || null)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [assignmentId])
  useEffect(() => { setDraft(submissions[idx]?.structured_feedback || null); setCheck(null); setShowCheck(false) }, [idx])

  const sub = submissions[idx]

  async function requestMarking() {
    if (!sub) return
    setMarking(true)
    setError('')
    try {
      const res = await fetch('/api/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: sub.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDraft(data.structuredFeedback)
    } catch (e) { setError(e.message) }
    setMarking(false)
  }

  async function requestCheck() {
    if (!sub) return
    setChecking(true)
    setError('')
    setShowCheck(true)
    try {
      const res = await fetch('/api/essay-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: sub.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCheck(data)
    } catch (e) { setError(e.message) }
    setChecking(false)
  }

  function updateCriterion(i, field, value) {
    setDraft((d) => {
      const criteria = [...(d.criteria || [])]
      criteria[i] = { ...criteria[i], [field]: value }
      return { ...d, criteria }
    })
  }

  async function saveAndApprove() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrId: sub.qr_id,
          assessment: { type: 'rubric_feedback', assignmentId, feedback: draft, approvedAt: new Date().toISOString() },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (idx < submissions.length - 1) setIdx(idx + 1)
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  if (loading) return <div style={{ padding: 32, fontFamily: 'Georgia, serif', color: C.muted }}>Loading…</div>
  if (!submissions.length) return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif' }}>
      <Link href="/" style={{ color: C.navy }}>← Dashboard</Link>
      <p style={{ color: C.muted, marginTop: 16 }}>No submissions yet for this assignment.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: C.navy, color: '#fff', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href="/" style={{ color: '#fff', opacity: 0.7, fontSize: 12, textDecoration: 'none' }}>← Dashboard</Link>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{assignment?.title}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Link href={`/triage/${assignmentId}`} style={{ color: '#fff', opacity: 0.85, fontSize: 12, textDecoration: 'none' }}>
            ⚡ Rate all papers first →
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Tooltip text="Go to the previous student's submission in this assignment." width={180}>
              <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 20, opacity: idx === 0 ? 0.3 : 1 }}>‹</button>
            </Tooltip>
            <span style={{ fontSize: 13 }}>{idx + 1} of {submissions.length}</span>
            <Tooltip text="Go to the next student's submission in this assignment." width={180}>
              <button onClick={() => setIdx((i) => Math.min(submissions.length - 1, i + 1))} disabled={idx === submissions.length - 1}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: idx === submissions.length - 1 ? 'default' : 'pointer', fontSize: 20, opacity: idx === submissions.length - 1 ? 0.3 : 1 }}>›</button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* LEFT: submission text */}
        <div style={{ flex: 1.1, padding: 24, borderRight: `1px solid ${C.border}`, maxHeight: 'calc(100vh - 58px)', overflowY: 'auto', background: C.bg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>Student: {sub.qr_id}</div>
            {sub.text_content && (
              <Tooltip text="Fast grammar/clarity pass on the raw text — separate from the full rubric marking below, useful as a quick first look." width={220}>
                <button onClick={requestCheck} disabled={checking} style={{
                  padding: '5px 12px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, cursor: 'pointer',
                }}>
                  {checking ? 'Checking…' : '🔍 Quick Check'}
                </button>
              </Tooltip>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Submitted {new Date(sub.submitted_at).toLocaleString()}</div>

          {showCheck && (
            <div style={{ marginBottom: 16, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8, fontSize: 13 }}>🔍 Quick Check <span style={{ fontWeight: 400, color: C.muted }}>(fast pass, not a grade)</span></div>
              {checking && <div style={{ color: C.muted, fontSize: 13 }}>Checking…</div>}
              {check && !check.error && (
                <>
                  <div style={{
                    display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginBottom: 10,
                    background: check.readyForGrading ? '#eef7f0' : '#fdf5e8', color: check.readyForGrading ? C.green : C.gold,
                  }}>
                    {check.readyForGrading ? '✅ Ready for grading' : '⏳ May need revision first'}
                  </div>
                  <div style={{ fontSize: 12, color: '#444', marginBottom: 10 }}>{check.readyForGradingReason}</div>
                  <div style={{ fontSize: 12, color: '#444', marginBottom: 10, fontStyle: 'italic' }}>{check.structureNote}</div>
                  {(check.issues || []).map((iss, i) => (
                    <div key={i} style={{ fontSize: 12, marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${C.border}` }}>
                      <span style={{
                        fontWeight: 700, textTransform: 'uppercase', fontSize: 10, marginRight: 6,
                        color: iss.category === 'grammar' ? C.red : iss.category === 'clarity' ? C.blue : C.gold,
                      }}>
                        {iss.category}
                      </span>
                      &quot;{iss.quote}&quot; — {iss.note}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {sub.text_content ? (
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.7, background: '#fff', padding: 20, borderRadius: 10, border: `1px solid ${C.border}` }}>
              {sub.text_content}
            </div>
          ) : sub.image_url ? (
            <img src={sub.image_url} alt="submission" style={{ maxWidth: '100%', borderRadius: 10, border: `1px solid ${C.border}` }} />
          ) : (
            <div style={{ color: C.muted, fontStyle: 'italic' }}>No content on this submission.</div>
          )}
        </div>

        {/* MIDDLE: rubric criteria, editable */}
        <div style={{ flex: 1.3, padding: 24, borderRight: `1px solid ${C.border}`, maxHeight: 'calc(100vh - 58px)', overflowY: 'auto' }}>
          {!draft ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}>
              <p style={{ color: C.muted, marginBottom: 16 }}>No AI feedback generated yet for this submission.</p>
              <Tooltip text="Runs the full rubric-based AI marking against this student's submission — scores every criterion with justification quotes, editable before you approve." width={240}>
                <button onClick={requestMarking} disabled={marking} style={{
                  padding: '10px 20px', background: C.gold, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                }}>
                  {marking ? 'Marking…' : '✨ Generate AI Feedback'}
                </button>
              </Tooltip>
            </div>
          ) : draft.error ? (
            <div style={{ color: '#c0392b' }}>AI marking failed: {draft.error}</div>
          ) : (
            (draft.criteria || []).map((c, i) => (
              <div key={i} style={{ marginBottom: 22, paddingBottom: 18, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{i + 1}) {c.name}</div>
                {c.justificationQuote && (
                  <div style={{ fontSize: 13, color: '#444', marginBottom: 10, fontStyle: 'italic' }}>&quot;{c.justificationQuote}&quot;</div>
                )}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <select value={c.level} onChange={(e) => updateCriterion(i, 'level', e.target.value)}
                    style={{ padding: 6, borderRadius: 6, border: `1px solid ${C.border}`, fontFamily: 'inherit' }}>
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="range" min={0} max={c.maxScore || 10} step={0.1} value={c.score}
                      onChange={(e) => updateCriterion(i, 'score', parseFloat(e.target.value))} style={{ flex: 1, accentColor: C.gold }} />
                    <span style={{ fontSize: 13, minWidth: 50 }}>{c.score} / {c.maxScore}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: summary + approve */}
        <div style={{ flex: 0.9, padding: 24, maxHeight: 'calc(100vh - 58px)', overflowY: 'auto', background: '#fafaf7' }}>
          {draft && !draft.error && (
            <>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.navy, marginBottom: 16 }}>{draft.overallScore} / {draft.maxScore}</div>
              <Tooltip text="Saves your edited scores/levels to the student's portfolio and moves to the next submission — this is the final, real save." width={220}>
                <button onClick={saveAndApprove} disabled={saving} style={{
                  width: '100%', padding: '12px 0', background: C.green, color: '#fff', border: 'none', borderRadius: 8,
                  fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 20,
                }}>
                  {saving ? 'Saving…' : '✅ Approve & Next'}
                </button>
              </Tooltip>

              <FeedbackBlock icon="🌟" title="Glow" color="#b8860b" bg="#fef9ec" items={draft.glow} />
              <FeedbackBlock icon="🌱" title="Grow" color={C.green} bg="#eef7f0" items={draft.grow} />
              <FeedbackBlock icon="🤔" title="Think About It" color={C.purple} bg="#f3eefc" items={draft.thinkAboutIt} />
            </>
          )}
          {error && <div style={{ color: '#c0392b', fontSize: 13, marginTop: 12 }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}

function FeedbackBlock({ icon, title, color, bg, items }) {
  if (!items || !items.length) return null
  return (
    <div style={{ marginBottom: 16, padding: 14, background: bg, borderRadius: 8 }}>
      <div style={{ fontWeight: 700, color, marginBottom: 6, fontSize: 13 }}>{icon} {title}</div>
      {items.map((t, i) => <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>• {t}</div>)}
    </div>
  )
}

