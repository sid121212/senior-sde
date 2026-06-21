'use client'

import { useState, useEffect } from 'react'
import { tracks } from '@/data/tracks'
import TrackCard from '@/components/TrackCard'
import StatsBar from '@/components/StatsBar'
import HowToUse from '@/components/HowToUse'
import LoadingScreen from '@/components/LoadingScreen'
import { useAuth } from '@/context/AuthContext'
import { loadProgress } from '@/lib/progress'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressMap = Record<string, number> // trackId → completed count

// ─── Utils ────────────────────────────────────────────────────────────────────

function getFirstName(name: string | null | undefined): string {
  if (!name) return 'there'
  return name.split(' ')[0].toLowerCase()
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [progressMap, setProgressMap] = useState<ProgressMap>({})
  const [progressLoaded, setProgressLoaded] = useState(false)

  // Redirect guard:
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Load all track progress in parallel
  useEffect(() => {
    if (!user) return
    const enabled = tracks.filter((t) => t.totalProblems > 0)
    Promise.all(
      enabled.map((t) =>
        loadProgress(user.uid, t.id).then((set) => ({ id: t.id, done: set.size }))
      )
    ).then((results) => {
      const map: ProgressMap = {}
      results.forEach(({ id, done }) => { map[id] = done })
      setProgressMap(map)
      setProgressLoaded(true)
    })
  }, [user])

  if (loading || !user) return <LoadingScreen />

  const firstName = getFirstName(user.displayName)

  return (
    <div className="page-content">
      {/* ── Greeting ── */}
      <h1 className="page-title" style={{ marginBottom: '6px' }}>
        hey, {firstName}.
      </h1>
      <p className="body-text" style={{ marginBottom: '32px' }}>
        pick a track and get to work.
      </p>

      {/* ── Stats ── */}
      <div style={{ marginBottom: '32px' }}>
        <StatsBar progressMap={progressLoaded ? progressMap : {}} />
      </div>

      {/* ── Tracks ── */}
      <div className="section-label" style={{ marginBottom: '16px' }}>
        tracks
      </div>

      <div className="track-grid" style={{ marginBottom: '32px' }}>
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            done={progressMap[track.id] ?? 0}
          />
        ))}
      </div>

      {/* ── How To Use ── */}
      <HowToUse />
    </div>
  )
}
