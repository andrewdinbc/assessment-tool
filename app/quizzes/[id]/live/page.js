'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { C, FONT_BODY } from '../../../../lib/theme'

const QUIZ_SESSION_BASE = 'https://parent-portal-silk.vercel.app/quiz-session'

export default function LiveQuizSessionPage() {
  const params = useParams()
  const quizId = params.id
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(false)

  const startSession = useCallback(async () => {
    setStarting(true); setError('')
    try {
      const res = await fetch('/api/quiz-sessions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quizId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSession(data.session)
    } catch (e) {
      setError(e.message)
    } finally {
      setStarting(false)
    }
  }, [quizId])

  useEffect(() => { startSession() }, [startSession])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    async function poll() {
      const res = await fetch(`/api/quiz-sessions/${session.id}`)
      const data = await res.json()
      if (!cancelled && !data.error) setStatus(data)
    }
    poll()
    const interval = setInterval(poll, 4000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [session])

  async function endSession() {
    await fetch(`/api/quiz-sessions/${session.id}`, { method: 'PATCH' })
    const res = await fetch(`/api/quiz-sessions/${session.id}`)
    setStatus(await res.json())
  }

  if (starting) return <div style={{ padding: 32, fontFamily: FONT_BODY, color: C.muted }}>Starting session…</div>
  if (error) return <div style={{ padding: 32, fontFamily: FONT_BODY, color: '#c0392b' }}>{error}</div>
  if (!session) return null

  const sessionUrl = `${QUIZ_SESSION_BASE}/${session.id}`
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(sessionUrl)}`

  return (
    <div style={{ padding: 32, fontFamily: FONT_BODY, maxWidth: 1000 }}>
      <Link href="/quizzes" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Quiz Library</Link>
      <h1 style={{ color: C.navy, fontSize: 24, margin: '10px 0 4px' }}>{status?.session?.quizzes?.title || 'Live Session'}</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
        {status?.session?.status === 'ended' ? 'Session ended.' : 'Display the QR code on the TV — students scan with their iPad.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, textAlign: 'center' }}>
          {status?.session?.status === 'active' ? (
            <>
              <img src={qrImgUrl} alt="Quiz session QR code" style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
              <button onClick={endSession} style={{ width: '100%', padding: 10, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', color: '#c0392b', fontWeight: 600 }}>
                End Session
              </button>
            </>
          ) : (
            <div style={{ color: C.muted, padding: 20 }}>This session has ended — start a new one from the Quiz Library.</div>
          )}
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <StatCard label="Checked in" value={status?.counts?.checkedIn ?? 0} color={C.navy} />
            <StatCard label="Completed" value={status?.counts?.completed ?? 0} color={C.green} />
            <StatCard label="May have left" value={status?.counts?.likelyAway ?? 0} color={C.gold} />
            <StatCard label="Left the quiz (detected)" value={status?.counts?.flagged ?? 0} color={C.red} />
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', background: '#fafaf7', fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase' }}>
              Devices
            </div>
            {(status?.devices || []).length === 0 ? (
              <div style={{ padding: 20, color: C.muted, fontStyle: 'italic', fontSize: 13 }}>No devices checked in yet.</div>
            ) : (
              status.devices.map((d) => (
                <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `1px solid ${C.border}`, fontSize: 13 }}>
                  <span>{d.qr_id || <em style={{ color: C.muted }}>not yet identified</em>}</span>
                  <StatusBadge device={d} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  )
}

function StatusBadge({ device }) {
  if (device.status === 'completed') {
    return (
      <span style={{ color: C.green, fontWeight: 600 }}>
        ✅ Completed — {device.score_pct}%{device.attempt_count > 1 ? ` (attempt ${device.attempt_count})` : ''}
      </span>
    )
  }
  if (device.recentlyFlagged) {
    return (
      <span style={{ color: C.red, fontWeight: 700 }} title="This device reported leaving the quiz tab/app in the last minute - detected directly, not inferred.">
        🚨 Left the quiz ({device.offQuizEventCount}x)
      </span>
    )
  }
  if (device.likelyAway) {
    return <span style={{ color: C.gold, fontWeight: 600 }} title="No activity in 45s+ - may have left the quiz. Cannot confirm what else the device is doing.">⚠️ May have left ({device.idleSeconds}s idle)</span>
  }
  return <span style={{ color: C.navy }}>🟢 Active</span>
}

