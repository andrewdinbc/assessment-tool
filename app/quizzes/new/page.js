'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { C } from '../../../lib/theme'

const TABS = [
  { key: 'topic', label: 'Topic', icon: '💡' },
  { key: 'text', label: 'Text', icon: '📝' },
]

export default function CreateQuizPage() {
  const router = useRouter()
  const [sourceTab, setSourceTab] = useState('topic')
  const [sourceContent, setSourceContent] = useState('')
  const [questionType, setQuestionType] = useState('multiple_choice')
  const [numQuestions, setNumQuestions] = useState('automatic')
  const [instructions, setInstructions] = useState('')
  const [subject, setSubject] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)

  async function generate() {
    setGenerating(true); setError('')
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceTab, sourceContent, questionType, numQuestions, instructions, subject }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDraft(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ save: { title: draft.title, subject, questionType, questions: draft.questions, source: sourceTab } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/quizzes')
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 800 }}>
      <Link href="/quizzes" style={{ color: C.navy, fontSize: 13, textDecoration: 'none' }}>← Back</Link>
      <h1 style={{ color: C.navy, fontSize: 26, margin: '10px 0 4px', textAlign: 'center' }}>Create Quiz</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, textAlign: 'center' }}>
        Build a custom quiz from any source — topic or text.
      </p>

      {!draft ? (
        <>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, borderBottom: `1px solid ${C.border}` }}>
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setSourceTab(t.key)} style={{
                  padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
                  borderBottom: sourceTab === t.key ? `2px solid ${C.gold}` : '2px solid transparent',
                  color: sourceTab === t.key ? C.gold : C.navy, fontWeight: sourceTab === t.key ? 700 : 400,
                }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={sourceContent}
              onChange={(e) => setSourceContent(e.target.value)}
              rows={6}
              placeholder={sourceTab === 'topic' ? 'Enter a topic (e.g., Solar system, Photosynthesis)' : 'Paste the text to quiz on'}
              style={{ width: '100%', padding: 12, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', fontSize: 14, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <FieldLabel>Question type</FieldLabel>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} style={inputStyle}>
                <option value="multiple_choice">Multiple Choice</option>
              </select>
            </div>
            <div>
              <FieldLabel>Number of questions</FieldLabel>
              <select value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)} style={inputStyle}>
                <option value="automatic">Automatic</option>
                {[5, 8, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <FieldLabel>Subject (optional)</FieldLabel>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ ...inputStyle, marginBottom: 16 }}>
            <option value="">Select subject</option>
            <option value="math">Math</option>
            <option value="language_arts">Language Arts</option>
          </select>

          <FieldLabel>Additional instructions (optional)</FieldLabel>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            placeholder="Specify any additional requirements, such as student level, standards to align to, or any special instructions."
            style={{ ...inputStyle, resize: 'vertical', marginBottom: 24 }}
          />

          <button onClick={generate} disabled={generating || !sourceContent.trim()} style={{
            width: '100%', padding: 14, background: C.gold, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15,
          }}>
            {generating ? 'Generating…' : '✨ Generate Quiz'}
          </button>
        </>
      ) : (
        <>
          <h2 style={{ color: C.navy, fontSize: 20, marginBottom: 16 }}>{draft.title}</h2>
          {draft.questions.map((q, i) => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 10 }}>{i + 1}. {q.question}</div>
              {q.options.map((opt, j) => (
                <div key={j} style={{
                  padding: '6px 10px', marginBottom: 4, borderRadius: 6, fontSize: 13,
                  background: j === q.correctIndex ? '#eef7f0' : 'transparent',
                  color: j === q.correctIndex ? C.green : C.navy, fontWeight: j === q.correctIndex ? 700 : 400,
                }}>
                  {j === q.correctIndex ? '✓ ' : ''}{opt}
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setDraft(null)} style={{ padding: '12px 20px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', color: C.navy }}>
              Start Over
            </button>
            <button onClick={save} disabled={saving} style={{ flex: 1, padding: '12px 20px', background: C.green, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save to Library'}
            </button>
          </div>
        </>
      )}

      {error && <div style={{ marginTop: 16, padding: 12, background: '#fdecea', border: '1px solid #f5b7b1', borderRadius: 8, color: '#c0392b' }}>{error}</div>}
    </div>
  )
}

function FieldLabel({ children }) {
  return <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, color: C.navy, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</label>
}

const inputStyle = { width: '100%', padding: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', fontSize: 14 }
