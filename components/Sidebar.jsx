'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { C } from '../lib/theme'

export default function Sidebar() {
  const pathname = usePathname()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/assignments')
      .then((r) => r.json())
      .then((d) => setAssignments(d.assignments || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const writing = assignments.filter((a) => a.subject === 'language_arts')
  const math = assignments.filter((a) => a.subject === 'math')

  return (
    <div style={{
      width: 260, minHeight: '100vh', background: C.sidebarBg, borderRight: `1px solid ${C.border}`,
      padding: '24px 20px', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column',
    }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
          chalk<span style={{ color: C.gold }}>&circuit</span>
        </div>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, marginBottom: 28 }}>ASSESSMENT TOOL</div>
      </Link>

      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Assignments
        <Link href="/new" style={{ color: C.gold, fontSize: 18, textDecoration: 'none' }}>+</Link>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 6px' }}>✍️ Writing</div>
        {loading && <div style={{ fontSize: 12, color: C.muted }}>Loading…</div>}
        {!loading && writing.length === 0 && <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic' }}>No assignments yet</div>}
        {writing.map((a) => (
          <SidebarLink key={a.id} href={`/review/${a.id}`} active={pathname === `/review/${a.id}`}>{a.title}</SidebarLink>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 6px' }}>🧮 Math Mastery</div>
        <SidebarLink href="/analytics/math" active={pathname === '/analytics/math'}>Class Overview</SidebarLink>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 6px' }}>Tools</div>
        <SidebarLink href="/worksheets" active={pathname === '/worksheets'}>📄 Worksheet Generator</SidebarLink>
        <SidebarLink href="/admin" active={pathname === '/admin'}>👪 Parent Contacts</SidebarLink>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <SidebarLink href="/" active={pathname === '/'}>📊 Dashboard</SidebarLink>
      </div>
    </div>
  )
}

function SidebarLink({ href, active, children }) {
  return (
    <Link href={href} style={{
      display: 'block', padding: '7px 10px', borderRadius: 6, marginBottom: 2,
      fontSize: 13, textDecoration: 'none', color: active ? '#fff' : C.navy,
      background: active ? C.navy : 'transparent',
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {children}
    </Link>
  )
}
