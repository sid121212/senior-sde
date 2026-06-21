import { tracks } from '@/data/tracks'

type ProgressMap = Record<string, number>

type Props = {
  progressMap: ProgressMap
}

function weeksOfPrep(): number {
  const start = new Date('2025-01-01')
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7))
  return Math.max(1, diff)
}

export default function StatsBar({ progressMap }: Props) {
  const totalDone = tracks.reduce((sum, t) => sum + (progressMap[t.id] ?? 0), 0)
  const totalAvailable = tracks.reduce((sum, t) => sum + t.totalProblems, 0)
  const weeks = weeksOfPrep()
  const pct = totalAvailable > 0 ? Math.round((totalDone / totalAvailable) * 100) : 0

  return (
    <div className="stats-bar">
      {/* Stat text */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700 }}>
          {totalDone} / {totalAvailable} problems
        </span>
        <span style={{ color: 'var(--text-faint)', fontSize: '13px' }}> · </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {weeks} week{weeks !== 1 ? 's' : ''} of prep
        </span>
      </div>

      {/* Progress bar + percentage */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 2, minWidth: '200px' }}>
        <div className="progress-track" style={{ flex: 1 }}>
          <div
            className="progress-fill"
            style={{ width: `${pct}%`, backgroundColor: 'var(--accent-design-patterns)' }}
          />
        </div>
        <span className="caption" style={{ whiteSpace: 'nowrap' }}>{pct}%</span>
      </div>
    </div>
  )
}
