'use client'
import { useState, useRef } from 'react'
import { C } from '../../lib/theme'

export default function WorksheetsPage() {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('math')
  const [mode, setMode] = useState('upload')
  const [file, setFile] = useState(null)
  const [rubric, setRubric] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  async function generate(e) {
    e.preventDefault()
    setError(''); setGenerating(true); setResult(null)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('subject', subject)
      if (rubric.trim()) formData.append('rubric', rubric.trim())
      if (mode === 'upload' && file) formData.append('file', file)

      const res = await fetch('/api/worksheets', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Generation failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const studentCount = res.headers.get('X-Student-Count')
      setResult({ url, studentCount, filename: `${title.replace(/[^a-z0-9]+/gi, '_')}-class-set.pdf` })
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 700 }}>
      <h1 style={{ color: C.navy, fontSize: 24, marginBottom: 4 }}>📄 Bulk Worksheet Generator</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
        One merged, print-ready PDF — one page per registered student, each with their own QR code.
      </p>

      <form onSubmit={generate} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24 }}>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: C.navy, fontSize: 13 }}>Assignment title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required
          style={{ width: '100%', padding: 10, marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />

        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: C.navy, fontSize: 13 }}>Subject</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          style={{ width: '100%', padding: 10, marginBottom: 16, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit' }}>
          <option value="math">Math</option>
          <option value="language_arts">Language Arts</option>
        </select>

        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: C.navy, fontSize: 13 }}>Content</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button type="button" onClick={() => setMode('upload')} style={{
            flex: 1, padding: 10, borderRadius: 6, cursor: 'pointer',
            background: mode === 'upload' ? C.navy : '#fff', color: mode === 'upload' ? '#fff' : C.navy,
            border: `1px solid ${C.border}`, fontFamily: 'inherit',
          }}>Upload existing worksheet</button>
          <button type="button" onClick={() => setMode('blank')} style={{
            flex: 1, padding: 10, borderRadius: 6, cursor: 'pointer',
            background: mode === 'blank' ? C.navy : '#fff', color: mode === 'blank' ? '#fff' : C.navy,
            border: `1px solid ${C.border}`, fontFamily: 'inherit',
          }}>Blank lined paper</button>
        </div>

        {mode === 'upload' && (
          <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: 16 }} />
        )}

        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: C.navy, fontSize: 13 }}>Rubric (optional, free text)</label>
        <textarea value={rubric} onChange={(e) => setRubric(e.target.value)} rows={3}
          style={{ width: '100%', padding: 10, marginBottom: 20, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />

        <button type="submit" disabled={generating} style={{
          width: '100%', padding: 12, background: C.gold, color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 700, cursor: 'pointer', fontSize: 14,
        }}>
          {generating ? 'Generating…' : 'Generate Class Set'}
        </button>
      </form>

      {error && <div style={{ marginTop: 16, padding: 12, background: '#fdecea', border: '1px solid #f5b7b1', borderRadius: 8, color: '#c0392b' }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16, padding: 16, background: '#eef7f0', border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <div style={{ marginBottom: 10 }}>Generated for {result.studentCount} student{result.studentCount === '1' ? '' : 's'}.</div>
          <a href={result.url} download={result.filename} style={{
            display: 'inline-block', padding: '10px 18px', background: C.green, color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600,
          }}>
            Download PDF
          </a>
        </div>
      )}
    </div>
  )
}
