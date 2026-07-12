'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C } from '../../lib/theme'

export default function QuizLibraryPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/quizzes')
    const data = await res.json()
    setQuizzes(data.quizzes || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function remove(id) {
    await fetch('/api/quizzes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ color: C.navy, fontSize: 26, margin: 0 }}>Quiz Library</h1>
        <Link href="/quizzes/new" style={{ padding: '10px 18px', background: C.gold, color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
          + Create Quiz
        </Link>
      </div>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Start a live session on any quiz to get a class QR code for the TV.</p>

      {loading && <div style={{ color: C.muted }}>Loading…</div>}
      {!loading && quizzes.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontStyle: 'italic' }}>
          No quizzes yet — create your first one.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {quizzes.map((q) => (
          <div key={q.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{q.title}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
              {q.question_type?.replace('_', ' ')}{q.subject ? ` · ${q.subject.replace('_', ' ')}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href={`/quizzes/${q.id}/live`} style={{ padding: '6px 12px', background: C.navy, color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                📺 Start Live Session
              </Link>
              <button onClick={() => remove(q.id)} style={{ padding: '6px 10px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: '#c0392b', fontSize: 12 }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
