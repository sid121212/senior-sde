'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { user, loading, error, signIn, signUp } = useAuth()
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Clear errors when toggling modes
  useEffect(() => {
    setFormError(null)
  }, [isLogin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setFormError(null)
    setIsSubmitting(true)

    if (!email || !password || (!isLogin && !name)) {
      setFormError('All fields are required.')
      setIsSubmitting(false)
      return
    }

    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password, name)
      }
      // Successful auth redirects via the useEffect hook
    } catch (err: any) {
      console.error(err)
      // Extract a readable error message
      let msg = err.message || 'Authentication failed.'
      if (msg.includes('auth/invalid-credential') || msg.includes('incorrect')) {
        msg = 'Invalid email or password.'
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'Email address is already registered.'
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password must be at least 6 characters.'
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.'
      }
      setFormError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">Loading shell session...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content" style={{ maxWidth: '480px', paddingTop: '80px' }}>
      <div 
        style={{
          border: '1px solid var(--border-default)',
          background: 'var(--bg-surface)',
          padding: '24px',
          borderRadius: '4px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        {/* Terminal Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            prepos-auth-v0.1.sh
          </span>
        </div>

        {/* Console Command Prompt Banner */}
        <div style={{ marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ color: 'var(--accent)', fontSize: '13px' }}>
            guest@prepos:~ $ <span className="text-white">auth --mode {isLogin ? 'signin' : 'signup'}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Secure session initialization. Monospace shell.
          </div>
        </div>

        {/* Tab Selection */}
        <div 
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: isLogin ? '2px solid var(--accent)' : '2px solid transparent',
              color: isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '10px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: isLogin ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            [ LOGIN ]
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: !isLogin ? '2px solid var(--accent)' : '2px solid transparent',
              color: !isLogin ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '10px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: !isLogin ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            [ CREATE ACCOUNT ]
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label 
                htmlFor="signup-name"
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                name:
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required={!isLogin}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '3px',
                  color: 'var(--text-primary)',
                  padding: '10px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label 
              htmlFor="auth-email"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              email:
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. coder@prepos.com"
              required
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-default)',
                borderRadius: '3px',
                color: 'var(--text-primary)',
                padding: '10px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label 
              htmlFor="auth-password"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              password:
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-default)',
                borderRadius: '3px',
                color: 'var(--text-primary)',
                padding: '10px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>

          {/* Form Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? 'var(--border-default)' : 'var(--accent)',
              color: 'black',
              border: 'none',
              padding: '12px',
              borderRadius: '3px',
              fontWeight: '700',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              letterSpacing: '1px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '10px',
              textTransform: 'uppercase',
              transition: 'transform 0.1s, opacity 0.2s',
            }}
            onMouseDown={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={(e) => { if (!isSubmitting) e.currentTarget.style.transform = 'scale(1)' }}
          >
            {isSubmitting ? 'EXECUTING...' : isLogin ? 'SIGN IN' : 'REGISTER'}
          </button>
        </form>

        {/* Terminal Logs (Errors / Status) */}
        <div 
          style={{
            marginTop: '24px',
            padding: '12px',
            background: '#070707',
            border: '1px solid var(--border-subtle)',
            borderRadius: '3px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
          }}
        >
          <div style={{ color: 'var(--text-muted)' }}>
            &gt; STDOUT LOGS:
          </div>
          {formError ? (
            <div style={{ color: '#ef4444', marginTop: '6px', wordBreak: 'break-word' }}>
              [ERROR] {formError}
            </div>
          ) : isSubmitting ? (
            <div style={{ color: 'var(--accent)', marginTop: '6px' }}>
              [PENDING] authenticating session...
            </div>
          ) : (
            <div style={{ color: '#22c55e', marginTop: '6px' }}>
              [SUCCESS] Shell online. Waiting for user input.
              <span className="inline-block w-1.5 h-3 ml-1 bg-[#22c55e] animate-pulse align-middle" style={{ content: '""' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
