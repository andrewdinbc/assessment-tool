'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { C, FONT_BODY } from '../../lib/theme'
import Tooltip from '../../components/Tooltip'
import FeatureLock from '../../components/FeatureLock'

const SUBJECTS = [
  { value: 'math', label: 'Math', icon: '🔢', tip: 'Files this under Math Mastery data - shows up in that class overview, not the Writing sidebar.' },
  { value: 'language_arts', label: 'Language Arts', icon: '✍️', tip: 'Files this under Writing - shows up for review and analytics as a writing assignment.' },
]

const RIGOR = ['Tolerant', 'Balanced', 'Strict', 'Auto']
const READING_LEVEL = ['Basic', 'Average', 'Advanced']
const LENGTH = ['Concise', 'Thorough']
const TONE = ['Friendly', 'Formal']

export default function WorksheetsPage() {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('math')
  const [mode, setMode] = useState('upload')
  const [file, setFile] = useState(null)
  const [rubricMode, setRubricMode] = useState('auto') // 'auto' | 'custom' | 'upload'
  const [customRubric, setCustomRubric] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractedRubricName, setExtractedRubricName] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const rubricFileInputRef = useRef(null)
  const [entitlements, setEntitlements] = useState(null)

  useEffect(() => {
    fetch('/api/entitlements').then((r) => r.json()).then(setEntitlements).catch(() => {})
  }, [])
  const [rigor, setRigor] = useState(0)
  const [readingLevel, setReadingLevel] = useState(0)
  const [length, setLength] = useState(1)
  const [tone, setTone] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  function composeRubric() {
    const params = [
      `Rigor: ${RIGOR[rigor]}`,
      `Reading level: ${READING_LEVEL[readingLevel]}`,
      `Length: ${LENGTH[length]}`,
      `Tone: ${TONE[tone]}`,
    ].join('. ')
    const base = (rubricMode === 'custom' || rubricMode === 'upload') && customRubric.trim()
      ? customRubric.trim()
      : 'Derive reasonable grade-appropriate criteria based on research-based instructional practices.'
    return `${base}\n\nGrading parameters — ${params}.`
  }

  async function extractRubricFile(file) {
    if (!file) return
    setExtracting(true); setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/rubrics/extract', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const lines = []
      if (data.title) lines.push(`Rubric: ${data.title}`, '')
      for (const c of data.criteria) {
        lines.push(`${c.name}:`)
        c.descriptions.forEach((d, i) => {
          const levelName = data.levelNames[i] || `Level ${i + 1}`
          lines.push(`  ${levelName}: ${d}`)
        })
      }
      const formatted = lines.join(String.fromCharCode(10))
      setCustomRubric(formatted)
      setExtractedRubricName(file.name)
      if (!title && data.title) setTitle(data.title)
    } catch (e) {
      setError(e.message)
    } finally {
      setExtracting(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) extractRubricFile(file)
  }

  async function generate(e) {
    e.preventDefault()
    setError(''); setGenerating(true); setResult(null)
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('subject', subject)
      formData.append('rubric', composeRubric())
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
    <div style={{ padding: 32, fontFamily: FONT_BODY, maxWidth: 760 }}>
      <Link href="/" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Go back</Link>

      <h1 style={{ color: C.navy, fontSize: 26, margin: '10px 0 4px' }}>Create Worksheet</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>
        One merged, print-ready PDF — one page per registered student, each with their own QR code.
      </p>

      <form onSubmit={generate}>
        <SectionLabel>Subject</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 28 }}>
          {SUBJECTS.map((s) => (
            <Tooltip key={s.value} text={s.tip}>
              <button
                type="button"
                onClick={() => setSubject(s.value)}
                style={{
                  width: '100%', padding: '18px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  background: subject === s.value ? '#fdf6ea' : '#fff',
                  border: subject === s.value ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
                  color: subject === s.value ? C.gold : C.navy,
                  fontFamily: 'inherit', fontWeight: subject === s.value ? 700 : 400,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                {s.label}
              </button>
            </Tooltip>
          ))}
        </div>

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
        </div>

        {/* Rubric — matching CoGrader's Rubric card */}
        <SectionLabel>Rubric</SectionLabel>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <p style={{ color: C.muted, fontSize: 13, margin: '0 0 14px' }}>
            Claude creates a rubric using research-based instructional practices, write your own, or upload one you already have.
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <Tooltip text="Claude derives criteria automatically based on the assignment name and grading parameters below - nothing to type.">
              <RubricChoiceButton active={rubricMode === 'auto'} onClick={() => setRubricMode('auto')} icon="✨">
                Claude Rubric
              </RubricChoiceButton>
            </Tooltip>
            <Tooltip text="Type or paste your own rubric text - this is what actually gets sent to Claude when marking submissions.">
              <RubricChoiceButton active={rubricMode === 'custom'} onClick={() => setRubricMode('custom')} icon="📄">
                Write my own
              </RubricChoiceButton>
            </Tooltip>
            <Tooltip text="Upload a PDF or photo of a rubric you already have - Claude reads it and fills in the text box below for you to check.">
              <RubricChoiceButton active={rubricMode === 'upload'} onClick={() => setRubricMode('upload')} icon="⬆️">
                Upload a rubric
              </RubricChoiceButton>
            </Tooltip>
          </div>

          {rubricMode === 'upload' && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? C.gold : C.border}`, borderRadius: 8, padding: 28,
                  textAlign: 'center', background: dragActive ? '#fdf6ea' : '#fafaf7', marginBottom: 12,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>⬆️</div>
                <div style={{ fontSize: 13, color: C.navy, marginBottom: 10 }}>
                  {extracting ? 'Reading rubric…' : 'Drag and drop a rubric here (PDF or photo/scan)'}
                </div>
                <Tooltip text="Opens your file browser to pick a rubric file (PDF or photo).">
                  <button
                    type="button"
                    onClick={() => rubricFileInputRef.current?.click()}
                    disabled={extracting}
                    style={{ padding: '8px 18px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, cursor: 'pointer' }}
                  >
                    {extracting ? 'Reading…' : 'Choose File'}
                  </button>
                </Tooltip>
                <input
                  ref={rubricFileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => extractRubricFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </div>
              {extractedRubricName && !extracting && (
                <div style={{ fontSize: 12, color: C.green, marginBottom: 12 }}>✅ Extracted from {extractedRubricName} — review below before generating.</div>
              )}
            </div>
          )}

          {(rubricMode === 'custom' || (rubricMode === 'upload' && customRubric)) && (
            <textarea
              value={customRubric}
              onChange={(e) => setCustomRubric(e.target.value)}
              rows={6}
              placeholder="Add the rubric or grading instructions"
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          )}
        </div>

        {/* Grading Parameters — matching CoGrader's slider group */}
        <SectionLabel>Grading Parameters</SectionLabel>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>
            These directly shape how Claude marks student work — not decorative.
          </p>
          <ParamSlider label="Rigor" options={RIGOR} value={rigor} onChange={setRigor} />
          <ParamSlider label="Reading Level" options={READING_LEVEL} value={readingLevel} onChange={setReadingLevel} />
          <ParamSlider label="Length" options={LENGTH} value={length} onChange={setLength} />
          <ParamSlider label="Tone" options={TONE} value={tone} onChange={setTone} last />
        </div>

        <SectionLabel>Worksheet Content</SectionLabel>
        <FeatureLock entitlement={entitlements?.parentPortal}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <Tooltip text="Use a worksheet you already made - it stays exactly as-is, just with each student's QR code added to the corner.">
                <ModeButton active={mode === 'upload'} onClick={() => setMode('upload')}>Upload existing worksheet</ModeButton>
              </Tooltip>
              <Tooltip text="No worksheet to upload? Each student gets a page with their name line, ruled lines to write on, and their QR code - for handwritten or open-ended responses.">
                <ModeButton active={mode === 'blank'} onClick={() => setMode('blank')}>QR code with lined paper</ModeButton>
              </Tooltip>
            </div>

            {mode === 'upload' ? (
              <div style={{
                border: `1px dashed ${C.border}`, borderRadius: 8, padding: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, color: file ? C.navy : C.muted }}>
                  {file ? file.name : 'No file chosen'}
                </span>
                <Tooltip text="Opens your file browser to pick the worksheet file (PDF or image) students will each get their own copy of.">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '6px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.navy, cursor: 'pointer' }}
                  >
                    Choose File
                  </button>
                </Tooltip>
                <input ref={fileInputRef} type="file" accept="application/pdf,image/*" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
              </div>
            ) : (
              <p style={{ color: C.muted, fontSize: 13, margin: 0, fontStyle: 'italic' }}>
                Each student page will have a &quot;Name: ___&quot; header, ruled lines, and their QR code — nothing else uploaded.
              </p>
            )}
          </div>
        </FeatureLock>

        <Tooltip text="Creates one merged PDF - a page per registered student with their QR code - and sets up this assignment for AI marking." width={260}>
          <button type="submit" disabled={generating} style={{
            width: '100%', padding: 14, background: C.gold, color: '#fff', border: 'none', borderRadius: 8,
            fontWeight: 700, cursor: 'pointer', fontSize: 15,
          }}>
            {generating ? 'Generating…' : 'Generate Class Set'}
          </button>
        </Tooltip>
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

function RubricChoiceButton({ active, onClick, icon, children }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, padding: '12px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
      background: active ? '#fdf6ea' : '#fff', color: active ? C.gold : C.navy,
      border: active ? `2px solid ${C.gold}` : `1px solid ${C.border}`, fontWeight: active ? 700 : 400,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <span>{icon}</span> {children}
    </button>
  )
}

function ParamSlider({ label, options, value, onChange, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 24 }}>
      <div style={{
        background: '#f2ede3', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700,
        color: C.navy, textAlign: 'center', marginBottom: 12,
      }}>
        {label}
      </div>
      <div style={{ position: 'relative', padding: '0 4px' }}>
        <input
          type="range"
          min={0}
          max={options.length - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: C.gold }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
          {options.map((opt, i) => (
            <span key={opt} style={{ color: i === value ? C.gold : C.muted, fontWeight: i === value ? 700 : 400 }}>
              {opt}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: 10, border: `1px solid ${C.border}`, borderRadius: 6,
  fontFamily: 'inherit', boxSizing: 'border-box', fontSize: 14,
}




