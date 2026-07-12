'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { C } from '../../lib/theme'

const SUBJECTS = [
  { value: 'math', label: 'Math', icon: '🔢' },
  { value: 'language_arts', label: 'Language Arts', icon: '✍️' },
]

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
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 760 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Go back</Link>

      <h1 style={{ color: C.navy, fontSize: 26, margin: '10px 0 4px' }}>Create Worksheet</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>
        One merged, print-ready PDF — one page per registered student, each with their own QR code.
      </p>

      <form onSubmit={generate}>
        {/* Subject selector, styled like CoGrader's Grade-level cards */}
        <SectionLabel>Subject</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
          {SUBJECTS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSubject(s.value)}
              style={{
                padding: '18px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                background: subject === s.value ? '#fdf6ea' : '#fff',
                border: subject === s.value ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                color: subject === s.value ? C.gold : C.navy,
                fontFamily: 'inherit', fontWeight: subject === s.value ? 700 : 400,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              {s.label}
            </button>
          ))}
        </div>

        {/* Assignment Details, matching CoGrader's card + heading pattern */}
        <SectionLabel>Assignment Details</SectionLabel>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <FieldLabel>Assignment name</FieldLabel>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Report 3 Writing Prompt"
            required
            style={inputStyle}
          />

          <FieldLabel style={{ marginTop: 20 }}>Rubric</FieldLabel>
          <p style={{ color: C.muted, fontSize: 12, margin: '2px 0 8px' }}>
            Optional free-text rubric to guide AI marking. Leave blank and Claude will derive reasonable criteria itself.
          </p>
          <textarea
            value={rubric}
            onChange={(e) => setRubric(e.target.value)}
            rows={4}
            placeholder="Add the rubric or grading instructions"
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Content / upload, styled like CoGrader's Source documents block */}
        <SectionLabel>Worksheet Content</SectionLabel>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <ModeButton active={mode === 'upload'} onClick={() => setMode('upload')}>Upload existing worksheet</ModeButton>
            <ModeButton active={mode === 'blank'} onClick={() => setMode('blank')}>Blank lined paper</ModeButton>
          </div>

          {mode === 'upload' ? (
            <div style={{
              border: `1px dashed ${C.border}`, borderRadius: 8, padding: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: 13, color: file ? C.navy : C.muted }}>
                {file ? file.name : 'No file chosen'}
              </span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '6px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, cursor: 'pointer' }}
              >
                Choose File
              </button>
              <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 13, margin: 0, fontStyle: 'italic' }}>
              Each student page will have a &quot;Name: ___&quot; header, ruled lines, and their QR code — nothing else uploaded.
            </p>
          )}
        </div>

        <button type="submit" disabled={generating} style={{
          width: '100%', padding: 14, background: C.gold, color: '#fff', border: 'none', borderRadius: 8,
          fontWeight: 700, cursor: 'pointer', fontSize: 15,
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

function SectionLabel({ children }) {
  return <h2 style={{ color: C.navy, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{children}</h2>
}

function FieldLabel({ children, style }) {
  return <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, color: C.navy, fontSize: 13, ...style }}>{children}</label>
}

function ModeButton({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: 10, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
      background: active ? '#1c3557' : '#fff', color: active ? '#fff' : '#1c3557',
      border: `1px solid ${C.border}`,
    }}>
      {children}
    </button>
  )
}

const inputStyle = {
  width: '100%', padding: 10, border: `1px solid ${C.border}`, borderRadius: 6,
  fontFamily: 'inherit', boxSizing: 'border-box', fontSize: 14,
}
