'use client'

import CompanyMarquee from './CompanyMarquee'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }

  return (
    <nav className="navbar">
      <CompanyMarquee />

      <div className="navbar__actions">
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginRight: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #ef444430',
                color: 'var(--diff-hard)',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '3px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ef444415'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              logout
            </button>
          </div>
        )}
        <span className="caption">v0.1</span>
      </div>
    </nav>
  )
}
