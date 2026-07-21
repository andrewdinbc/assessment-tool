'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { C, FONT_BODY } from '../../lib/theme'

// Standards Library tab added 2026-07-21 -- browsable framework rubrics
// (BC Core Competencies, 6+1 Traits) distinct from "My Rubrics" below.
// See rubric_library table migration for why AP/IB/Cambridge aren't
// seeded: those are real copyrighted College Board/IB documents, not
// something to fabricate. "Clone to My Rubrics" copies a library entry
// into your own editable rubrics so you can adapt it before grading with it.

export default function RubricLibraryPage() {
  const [tab, setTab] = useState('mine') // 'mine' | 'library'
  const [rubrics, setRubrics] = useState([])
  const [library, setLibrary] = useState([])
  const [loading, setLoading] = useState(true)
  const [cloningId, setCloningId] = useState(null)
  const [cloneMsg, setCloneMsg] = useState(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/rubrics')
    const data = await res.json()
    setRubrics(data.rubrics || [])
    setLoading(false)
  }

  async function loadLibrary() {
    setLoading(true)
    const res = await fetch('/api/rubric-library')
    const data = await res.json()
    setLibrary(data.rubrics || [])
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'mine') load()
    else loadLibrary()
  }, [tab])

  async function remove(id) {
    await fetch('/api/rubrics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  async function cloneToMine(id) {
    setCloningId(id)
    setCloneMsg(null)
    try {
      const res = await fetch('/api/rubric-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloneId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCloneMsg(`Added "${data.rubric.title}" to My Rubrics.`)
    } catch (e) {
      setCloneMsg(e.message)
    } finally {
      setCloningId(null)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: FONT_BODY, maxWidth: 900 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ color: C.navy, fontSize: 26, margin: 0 }}>Rubric Library</h1>
        {tab === 'mine' && (
          <Link href="/rubrics/new" style={{
            padding: '10px 18px', background: C.gold, color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13,
          }}>
            + New Rubric
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
        {[{ key: 'mine', label: 'My Rubrics' }, { key: 'library', label: 'Standards Library' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.key ? C.navy : C.muted,
            borderBottom: tab === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'mine' && (
        <>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
            Build once, reuse across assignments. Write your own, have Claude draft one, or clone one from the Standards Library.
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
                    background: r.source === 'ai_generated' ? '#f3eefc' : r.source === 'library_clone' ? '#eef2fc' : '#eef7f0',
                    color: r.source === 'ai_generated' ? '#7a4fb5' : r.source === 'library_clone' ? '#3355aa' : C.green,
                  }}>
                    {r.source === 'ai_generated' ? '✨ AI-drafted' : r.source === 'library_clone' ? `📖 ${r.standard_alignment || 'From library'}` : '✍️ Manual'}
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
        </>
      )}

      {tab === 'library' && (
        <>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
            Framework rubrics you can clone into My Rubrics and adapt. A small, honestly-sourced starting set — see each card for where its content actually comes from.
          </p>
          {cloneMsg && (
            <div style={{ background: '#eef7f0', border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 12, color: C.green }}>{cloneMsg}</div>
          )}

          {loading && <div style={{ color: C.muted }}>Loading…</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {library.map((r) => (
              <div key={r.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: 'uppercase', marginBottom: 4 }}>{r.framework}</div>
                <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>
                  {r.scale}-point scale{r.subject ? ` · ${r.subject}` : ''}{r.grade_band ? ` · Grades ${r.grade_band}` : ''}
                </div>
                {r.framework_source_note && (
                  <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>{r.framework_source_note}</p>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {r.source_url && (
                    <a href={r.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.muted, textDecoration: 'underline' }}>Source ↗</a>
                  )}
                  <button onClick={() => cloneToMine(r.id)} disabled={cloningId === r.id} style={{
                    marginLeft: 'auto', padding: '6px 12px', background: C.navy, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    opacity: cloningId === r.id ? 0.6 : 1,
                  }}>
                    {cloningId === r.id ? 'Cloning…' : 'Clone to My Rubrics'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
