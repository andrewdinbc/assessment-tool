'use client'
import Link from 'next/link'

const C = { navy: '#1c3557', gold: '#b57c2a', border: '#ddd4c2' }

export default function TopHeader() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: `1px solid ${C.border}`,
      padding: '12px 24px', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <Link href="/" style={{ fontWeight: 700, color: C.navy, textDecoration: 'none', fontSize: 15 }}>
        chalk<span style={{ color: C.gold }}>&circuit</span>
      </Link>
      <span style={{ color: C.border }}>|</span>
      <span style={{ color: C.navy, fontSize: 14 }}>Assessment Tool</span>
    </div>
  )
}
