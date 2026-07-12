'use client'
import { useState, useEffect } from 'react'
import { C } from '../../lib/theme'

export default function OralReadingDashboard() {
  const [passages, setPassages] = useState([])
  const [schedules, setSchedules] = useState([])
  const [pendingAttempts, setPendingAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('score') // 'score' | 'schedule' | 'passages'

  // schedule form
  const [scheduleQrId, setScheduleQrId] = useState('')
  const [frequency, setFrequency] = useState('weekly')

  // scoring form (per attempt)
  const [scoringId, setScoringId] = useState(null)
  const [miscueCount, setMiscueCount] = useState('')
  const [secondsTaken, setSecondsTaken] = useState('')
  const [scoreResult, setScoreResult] = useState(null)
  const [scoring, setScoring] = useState(false)

  async function load() {
    setLoading(true)
    const [pRes, sRes] = await Promise.all([
      fetch('/api/oral-reading/passages').then((r) => r.json()),
      fetch('/api/oral-reading/schedule').then((r) => r.json()),
    ])
    setPassages(pRes.passages || [])
    setSchedules(sRes.schedules || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function addSchedule(e) {
    e.preventDefault()
    if (!scheduleQrId.trim()) return
    await fetch('/api/oral-reading/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrId: scheduleQrId.trim(), frequency }),
    })
    setScheduleQrId('')
    load()
  }

  async function submitScore(attemptId) {
    setScoring(true)
    try {
      const res = await fetch(`/api/oral-reading/attempts/${attemptId}/score`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ miscueCount: parseInt(miscueCount, 10), secondsTaken: secondsTaken ? parseInt(secondsTaken, 10) : null }),
      })
      const data = await res.json()
      setScoreResult(data)
    } finally {
      setScoring(false)
    }
  }

  const dueCount = schedules.filter((s) => s.isDue).length

  return (
    <div style={{ padding: 32, fontFamily: 'Georgia, serif', maxWidth: 900 }}>
      <h1 style={{ color: C.navy, fontSize: 26, margin: '0 0 4px' }}>Oral Reading Assessment</h1>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
        Jerry Johns-style Basic Reading Inventory, using HELPS passages — finding the instructional
        &quot;pocket&quot; for each student.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <TabButton active={tab === 'score'} onClick={() => setTab('score')}>📋 Scoring Queue</TabButton>
        <TabButton active={tab === 'schedule'} onClick={() => setTab('schedule')}>
          📅 Schedule {dueCount > 0 && <Badge>{dueCount} due</Badge>}
        </TabButton>
        <TabButton active={tab === 'passages'} onClick={() => setTab('passages')}>📖 Passage Library ({passages.length})</TabButton>
      </div>

      {loading && <div style={{ color: C.muted }}>Loading…</div>}

      {tab === 'schedule' && !loading && (
        <>
          <form onSubmit={addSchedule} style={{ display: 'flex', gap: 10, marginBottom: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
            <input
              value={scheduleQrId}
              onChange={(e) => setScheduleQrId(e.target.value)}
              placeholder="Student QR ID"
              style={{ flex: 1, padding: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit' }}
            />
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={{ padding: 10, border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: 'inherit' }}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button type="submit" style={{ padding: '10px 20px', background: C.gold, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
              Set
            </button>
          </form>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {schedules.length === 0 && <div style={{ padding: 20, color: C.muted, fontStyle: 'italic' }}>No students scheduled yet.</div>}
            {schedules.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
                <div>
                  <strong>{s.qr_id}</strong> — {s.frequency}
                  {s.current_level && ` · Level ${s.current_level}`}
                </div>
                <div style={{ color: s.isDue ? C.red : C.green, fontWeight: 700, fontSize: 13 }}>
                  {s.isDue ? '⚠️ Due now' : `Next: ${s.next_due_at ? new Date(s.next_due_at).toLocaleDateString() : '—'}`}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'passages' && !loading && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden' }}>
          {passages.length === 0 && <div style={{ padding: 20, color: C.muted, fontStyle: 'italic' }}>No passages yet.</div>}
          {passages.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
              <div>
                <strong>{p.title}</strong>
                <div style={{ fontSize: 12, color: C.muted }}>Level {p.level || '—'} · {p.word_count} words · {p.source}</div>
              </div>
              <a href={`/oral-reading/${p.id}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.gold }}>
                Open student view ↗
              </a>
            </div>
          ))}
        </div>
      )}

      {tab === 'score' && !loading && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>
            Comprehension is already AI-scored. Fluency needs you to listen to the recording and
            count miscues — audio playback wiring is still pending (recordings currently stay
            on-device; storage upload is the next piece to finish before this queue is fully live).
          </p>
          <ScoringForm
            miscueCount={miscueCount} setMiscueCount={setMiscueCount}
            secondsTaken={secondsTaken} setSecondsTaken={setSecondsTaken}
            scoreResult={scoreResult} scoring={scoring}
            onSubmit={() => scoringId && submitScore(scoringId)}
            scoringId={scoringId} setScoringId={setScoringId}
          />
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
      background: active ? C.navy : '#fff', color: active ? '#fff' : C.navy, border: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {children}
    </button>
  )
}

function Badge({ children }) {
  return <span style={{ background: '#fdecea', color: '#c0392b', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{children}</span>
}

function ScoringForm({ scoringId, setScoringId, miscueCount, setMiscueCount, secondsTaken, setSecondsTaken, onSubmit, scoring, scoreResult }) {
  return (
    <div>
      <input
        value={scoringId || ''}
        onChange={(e) => setScoringId(e.target.value)}
        placeholder="Attempt ID to score"
        style={{ width: '100%', padding: 10, marginBottom: 10, border: `1px solid #ddd4c2`, borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input type="number" value={miscueCount} onChange={(e) => setMiscueCount(e.target.value)} placeholder="Miscues counted" style={{ flex: 1, padding: 10, border: `1px solid #ddd4c2`, borderRadius: 6 }} />
        <input type="number" value={secondsTaken} onChange={(e) => setSecondsTaken(e.target.value)} placeholder="Seconds taken" style={{ flex: 1, padding: 10, border: `1px solid #ddd4c2`, borderRadius: 6 }} />
      </div>
      <button onClick={onSubmit} disabled={scoring || !scoringId} style={{ padding: '10px 20px', background: '#1c3557', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
        {scoring ? 'Scoring…' : 'Score Fluency'}
      </button>
      {scoreResult && (
        <div style={{ marginTop: 16, padding: 14, background: '#eef7f0', borderRadius: 8, fontSize: 13 }}>
          Accuracy: {scoreResult.accuracyPct}% · WCPM: {scoreResult.wcpm ?? '—'} · Comprehension: {scoreResult.comprehensionPct}%
          <br />
          <strong>Level: {scoreResult.levelDetermination || 'Needs judgment call (between bands)'}</strong>
        </div>
      )}
    </div>
  )
}
