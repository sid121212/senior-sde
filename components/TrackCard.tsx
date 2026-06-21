'use client'

import { useState } from 'react'
import { Track } from '@/data/tracks'

type Props = {
  track: Track
  done: number
}

export default function TrackCard({ track, done }: Props) {
  const [hovered, setHovered] = useState(false)

  const pct = track.totalProblems > 0
    ? Math.round((done / track.totalProblems) * 100)
    : null

  const linkLabel = done > 0 ? '→ continue' : '→ start'

  /* ── Disabled card ── */
  if (!track.enabled) {
    return (
      <div className="card card--disabled" style={{ minHeight: '160px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '22px' }}>{track.emoji}</span>
          <span className="chip chip--coming-soon">COMING SOON</span>
        </div>

        <div>
          <div className="card-title" style={{ marginBottom: '6px', color: 'var(--text-secondary)' }}>
            {track.title}
          </div>
          <div className="body-text" style={{ fontSize: '12px' }}>
            {track.description}
          </div>
        </div>
      </div>
    )
  }

  /* ── Enabled card ── */
  return (
    <a
      href={track.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '160px',
        borderRadius: '8px',
        padding: '24px',
        backgroundColor: hovered ? 'var(--bg-raised)' : 'var(--bg-surface)',
        border: `1px solid ${hovered ? track.accentColor + '50' : 'var(--border-default)'}`,
        transition: 'all 0.2s',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '22px' }}>{track.emoji}</span>
        <span
          className="caption"
          style={{ fontWeight: 700, color: pct !== null ? track.accentColor : 'var(--text-faint)' }}
        >
          {pct !== null ? `${pct}%` : '—'}
        </span>
      </div>

      {/* Title + description */}
      <div style={{ flex: 1 }}>
        <div className="card-title" style={{ marginBottom: '6px' }}>{track.title}</div>
        <div className="body-text" style={{ fontSize: '12px' }}>{track.description}</div>
      </div>

      {/* Progress bar */}
      <div className="progress-track">
        {pct !== null && (
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: track.accentColor }}
          />
        )}
      </div>

      {/* CTA */}
      <span
        className="caption"
        style={{
          fontWeight: 700,
          color: hovered ? track.accentColor : 'var(--text-faint)',
          transition: 'all 0.2s',
          alignSelf: 'flex-start',
        }}
      >
        {linkLabel}
      </span>
    </a>
  )
}
