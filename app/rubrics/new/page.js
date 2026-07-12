'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { C } from '../../../lib/theme'

const SCALE_LEVEL_NAMES = {
  3: ['Below Standard', 'Approaching', 'Meets Standard'],
  4: ['Below Standard', 'Approaching', 'Meets Standard', 'Exceeds Standard'],
  5: ['Beginning', 'Developing', 'Approaching', 'Meets Standard', 'Exceeds Standard'],
}

const STANDARDS = [
  { value: 'none', label: 'No Standard Alignment' },
  { value: 'common_core', label: 'Common Core (CCSS)' },
  { value: 'bc_curriculum', label: 'BC Curriculum' },
  { value: 'ap', label: 'AP (Advanced Placement)' },
  { value: 'ib', label: 'IB (International Baccalaureate)' },
]

let uid = 0
function newCriterion(numLevels) {
  uid += 1
  return { key: `c${uid}`, name: '', descriptions: Array(numLevels).fill('') }
}

export default function RubricBuilderPage() {
  const router = useRouter()
  const [mode, setMode] = useState('manual') // 'manual' | 'ai'
  const [scale, setScale] = useState(4)
  const [levelNames, setLevelNames] = useState(SCALE_LEVEL_NAMES[4])
  const [title, setTitle] = useState('')
  const [criteria, setCriteria] = useState([newCriterion(4)])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // AI-generate fields
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [standardAlignment, setStandardAlignment] = useState('none')
  const [assignmentDescription, setAssignmentDescription] = useState('')
  const [numCriteria, setNumCriteria] = useState(4)
  const [generating, setGenerating] = useState(false)

  function setScaleAndReset(n) {
    setScale(n)
    setLevelNames(SCALE_LEVEL_NAMES[n])
    setCriteria((cs) => cs.map((c) => ({ ...c, descriptions: Array(n).fill('') })))
  }

  function updateCriterionName(key, name) {
    setCriteria((cs) => cs.map((c) => (c.key === key ? { ...c, name } : c)))
  }
  function updateDescription(key, i, value) {
    setCriteria((cs) => cs.map((c) => {
      if (c.key !== key) return c
      const descriptions = [...c.descriptions]
      descriptions[i] = value
      return { ...c, descriptions }
    }))
  }
  function removeCriterion(key) {
    setCriteria((cs) => cs.filter((c) => c.key !== key))
  }

  async function generateWithAI() {
    setGenerating(true); setError('')
    try {
      const res = await fetch('/api/rubrics/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, assignmentDescription, standardAlignment, numCriteria, scale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLevelNames(data.levelNames)
      setCriteria(data.criteria.map((c) => ({ key: `ai${Math.random()}`, name: c.name, descriptions: c.descriptions })))
      if (!title) setTitle(assignmentDescription.slice(0, 60))
      setMode('manual') // drop into the editable grid so the teacher can review/tweak before saving
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/rubrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject: subject || null,
          grade: grade || null,
          scale,
          levelNames,
          criteria: criteria.map(({ name, descriptions }) => ({ name, descriptions })),
          source: criteria.some((c) => c.key.startsWith('ai')) ? 'ai_generated' : 'manual',
          standardAlignment: standardAlignment !== 'none' ? standardAlignment : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/rubrics')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 900 }}>
      <Link href="/rubrics" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Go back</Link>
      <h1 style={{ color: C.navy, fontSize: 26, margin: '10px 0 20px' }}>Create manually</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <ModeButton active={mode === 'manual'} onClick={() => setMode('manual')}>✍️ Write my own</ModeButton>
        <ModeButton active={mode === 'ai'} onClick={() => setMode('ai')}>✨ Claude drafts it</ModeButton>
      </div>

      {mode === 'ai' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <FieldLabel>Subject</FieldLabel>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                <option value="">Select subject</option>
                <option value="language_arts">Language Arts</option>
                <option value="math">Math</option>
              </select>
            </div>
            <div>
              <FieldLabel>Grade Level</FieldLabel>
              <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. 5" style={inputStyle} />
            </div>
            <div>
              <FieldLabel>Standard Alignment</FieldLabel>
              <select value={standardAlignment} onChange={(e) => setStandardAlignment(e.target.value)} style={inputStyle}>
                {STANDARDS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <FieldLabel>Assignment Description</FieldLabel>
          <textarea
            value={assignmentDescription}
            onChange={(e) => setAssignmentDescription(e.target.value)}
            rows={3}
            placeholder="Describe the assignment, e.g. 'Write a 5-paragraph persuasive essay using at least 3 cited sources...'"
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 16 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <FieldLabel>Number of Criteria</FieldLabel>
              <select value={numCriteria} onChange={(e) => setNumCriteria(parseInt(e.target.value, 10))} style={inputStyle}>
                {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Grading Scale</FieldLabel>
              <select value={scale} onChange={(e) => setScaleAndReset(parseInt(e.target.value, 10))} style={inputStyle}>
                <option value={3}>3-point</option>
                <option value={4}>4-point</option>
                <option value={5}>5-point</option>
              </select>
            </div>
          </div>
          <button
            onClick={generateWithAI}
            disabled={generating || !assignmentDescription.trim()}
            style={{ width: '100%', padding: 14, background: C.gold, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
          >
            {generating ? 'Generating…' : 'Generate Rubric'}
          </button>
        </div>
      )}

      {mode === 'manual' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[3, 4, 5].map((n) => (
              <ScaleButton key={n} active={scale === n} onClick={() => setScaleAndReset(n)}>{n}-Point</ScaleButton>
            ))}
          </div>

          <FieldLabel>Rubric Title</FieldLabel>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grade 5 Persuasive Essay Rubric" style={{ ...inputStyle, marginBottom: 24 }} />

          <FieldLabel>Level Names</FieldLabel>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scale}, 1fr)`, gap: 10, marginBottom: 24 }}>
            {levelNames.map((name, i) => (
              <input
                key={i}
                value={name}
                onChange={(e) => setLevelNames((ls) => ls.map((l, j) => (j === i ? e.target.value : l)))}
                style={inputStyle}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <FieldLabel style={{ marginBottom: 0 }}>Criteria</FieldLabel>
            <button onClick={() => setCriteria((cs) => [...cs, newCriterion(scale)])} style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              + Add Criterion
            </button>
          </div>

          {criteria.map((c) => (
            <div key={c.key} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <input
                  value={c.name}
                  onChange={(e) => updateCriterionName(c.key, e.target.value)}
                  placeholder="Criterion name (e.g. Organization)"
                  style={{ ...inputStyle, flex: 1, fontWeight: 700 }}
                />
                <button onClick={() => removeCriterion(c.key)} style={{ padding: '0 12px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 6, color: '#c0392b', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${scale}, 1fr)`, gap: 10 }}>
                {levelNames.map((levelName, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 4 }}>{levelName}</div>
                    <textarea
                      value={c.descriptions[i] || ''}
                      onChange={(e) => updateDescription(c.key, i, e.target.value)}
                      placeholder="Describe performance at this level…"
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', fontSize: 13 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={save}
            disabled={saving || !title.trim() || criteria.some((c) => !c.name.trim())}
            style={{ width: '100%', padding: 16, background: C.navy, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15, marginTop: 8 }}
          >
            {saving ? 'Saving…' : '📐 Generate Rubric'}
          </button>
        </>
      )}

      {error && <div style={{ marginTop: 16, padding: 12, background: '#fdecea', border: '1px solid #f5b7b1', borderRadius: 8, color: '#c0392b' }}>{error}</div>}
    </div>
  )
}

function FieldLabel({ children, style }) {
  return <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, color: C.navy, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, ...style }}>{children}</label>
}

function ScaleButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
      background: active ? C.navy : '#fff', color: active ? '#fff' : C.navy, border: `1px solid ${C.border}`,
    }}>
      {children}
    </button>
  )
}

function ModeButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: 12, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
      background: active ? '#fdf6ea' : '#fff', color: active ? C.gold : C.navy,
      border: active ? `2px solid ${C.gold}` : `1px solid ${C.border}`,
    }}>
      {children}
    </button>
  )
}

const inputStyle = {
  width: '100%', padding: 10, border: `1px solid ${C.border}`, borderRadius: 6,
  fontFamily: 'inherit', boxSizing: 'border-box', fontSize: 14,
}
