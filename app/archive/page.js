'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C, FONT_BODY } from '../../lib/theme'

export default function ArchivePage() {
  const [assignments, setAssignments] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/assignments/archive')
    const data = await res.json()
    setAssignments(data.assignments || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function toggle(id) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  async function archiveSelected() {
    if (!selected.size) return
    setBusy(true)
    await fetch('/api/assignments/archive', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentIds: Array.from(selected) }),
    })
    setSelected(new Set())
    await load()
    setBusy(false)
  }

  async function unarchive(id) {
    setBusy(true)
    await fetch('/api/assignments/archive', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentIds: [id] }),
    })
    await load()
    setBusy(false)
  }

  const active = assignments.filter((a) => !a.archived_at)
  const archived = assignments.filter((a) => a.archived_at)
  const list = showArchived ? archived : active

  return (
    <div style={{ padding: 32, fontFamily: FONT_BODY, maxWidth: 800 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Dashboard</Link>
      <h1 style={{ color: C.navy, fontSize: 26, margin: '10px 0 4px' }}>Archive Units</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
        Archiving never deletes anything — you still see everything here. It just hides an
        assignment&apos;s grades and feedback from the parent portal, so parents and students only
        see what&apos;s currently relevant instead of a whole year building up. Not a deadline —
        archive whenever it makes sense (a lot of teachers do this after winter break or March break).
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <TabButton active={!showArchived} onClick={() => setShowArchived(false)}>
          Active ({active.length})
        </TabButton>
        <TabButton active={showArchived} onClick={() => setShowArchived(true)}>
          Archived ({archived.length})
        </TabButton>
      </div>

      {!showArchived && selected.size > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={archiveSelected} disabled={busy} style={{
            padding: '10px 20px', background: C.gold, color: '#fff', border: 'none', borderRadius: 8,
            fontWeight: 700, cursor: 'pointer', fontSize: 13,
          }}>
            {busy ? 'Archiving…' : `📦 Archive ${selected.size} selected`}
          </button>
        </div>
      )}

      {loading && <div style={{ color: C.muted }}>Loading…</div>}

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
        {!loading && list.length === 0 && (
          <div style={{ padding: 20, color: C.muted, fontStyle: 'italic', fontSize: 13 }}>
            {showArchived ? 'Nothing archived yet.' : 'No active assignments.'}
          </div>
        )}
        {list.map((a) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
            {!showArchived && (
              <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: C.navy }}>{a.title}</div>
              <div style={{ fontSize: 11, color: C.muted }}>
                {a.subject?.replace('_', ' ')} · Created {new Date(a.created_at).toLocaleDateString()}
                {a.archived_at && ` · Archived ${new Date(a.archived_at).toLocaleDateString()}`}
              </div>
            </div>
            {showArchived && (
              <button onClick={() => unarchive(a.id)} disabled={busy} style={{
                padding: '6px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, cursor: 'pointer',
              }}>
                Unarchive
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
      background: active ? C.navy : '#fff', color: active ? '#fff' : C.navy, border: `1px solid ${C.border}`,
    }}>
      {children}
    </button>
  )
}
