'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C } from '../../lib/theme'

export default function RubricLibraryPage() {
  const [rubrics, setRubrics] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/rubrics')
    const data = await res.json()
    setRubrics(data.rubrics || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function remove(id) {
    await fetch('/api/rubrics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h1 style={{ color: C.navy, fontSize: 26, margin: 0 }}>Rubric Library</h1>
        <Link href="/rubrics/new" style={{
          padding: '10px 18px', background: C.gold, color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13,
        }}>
          + New Rubric
        </Link>
      </div>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
        Build once, reuse across assignments. Write your own or have Claude draft one to edit.
      </p>

      {loading && <div style={{ color: C.muted }}>Loading…</div>}

      {!loading && rubrics.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontStyle: 'italic' }}>
          No rubrics yet — create your first one.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {rubrics.map((r) => (
          <div key={r.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
              {r.scale}-point scale{r.subject ? ` · ${r.subject.replace('_', ' ')}` : ''}{r.grade ? ` · Grade ${r.grade}` : ''}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                background: r.source === 'ai_generated' ? '#f3eefc' : '#eef7f0',
                color: r.source === 'ai_generated' ? '#7a4fb5' : C.green,
              }}>
                {r.source === 'ai_generated' ? '✨ AI-drafted' : '✍️ Manual'}
              </span>
              <button onClick={() => remove(r.id)} style={{
                marginLeft: 'auto', padding: '4px 10px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, cursor: 'pointer', color: '#c0392b', fontSize: 12,
              }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
