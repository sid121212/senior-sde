'use client'

import { useState, useEffect } from 'react'
import { tracks } from '@/data/tracks'
import TrackCard from '@/components/TrackCard'
import StatsBar from '@/components/StatsBar'
import HowToUse from '@/components/HowToUse'
import LoadingScreen from '@/components/LoadingScreen'
import LeaderboardWidget from '@/components/LeaderboardWidget'
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

      // Sync computed stats back to user profile DB/store
      let totalSolved = 0
      results.forEach(({ done }) => { totalSolved += done })

      let strongestTrack = 'None'
      let maxSolved = 0
      enabled.forEach((t) => {
        const solved = map[t.id] ?? 0
        if (solved > maxSolved) {
          maxSolved = solved
          strongestTrack = t.title
        }
      })

      import('@/lib/firebase').then(({ db, isFirebaseConfigured }) => {
        if (!isFirebaseConfigured || !db) {
          // Mock mode sync
          const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
          try {
            const users = JSON.parse(usersStr)
            if (Array.isArray(users)) {
              const userIdx = users.findIndex((u: { uid: string }) => u.uid === user.uid)
              if (userIdx !== -1) {
                const u = users[userIdx]
                if (u.totalSolved !== totalSolved || u.strongestTrack !== strongestTrack) {
                  u.totalSolved = totalSolved
                  u.strongestTrack = strongestTrack
                  u.trackProgress = map
                  localStorage.setItem('prepos_mock_users', JSON.stringify(users))
                }
              }
            }
          } catch (e) {
            console.error('Error auto-syncing mock statistics:', e)
          }
        } else {
          // Firebase mode sync
          import('firebase/firestore').then(({ doc, getDoc, setDoc }) => {
            const userDocRef = doc(db, 'users', user.uid)
            getDoc(userDocRef).then((docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data()
                if (data.totalSolved !== totalSolved || data.strongestTrack !== strongestTrack) {
                  setDoc(userDocRef, {
                    totalSolved,
                    strongestTrack,
                    trackProgress: map,
                    updatedAt: new Date().toISOString()
                  }, { merge: true }).catch((err) => {
                    console.error('Error updating user stats in Firestore:', err)
                  })
                }
              }
            }).catch((err) => {
              console.error('Error loading user doc to sync:', err)
            })
          })
        }
      })
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

      <div className="dashboard-layout">
        <div className="dashboard-main">
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

        <div className="dashboard-sidebar">
          <LeaderboardWidget />
        </div>
      </div>
    </div>
  )
}

