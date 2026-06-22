'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db, isFirebaseConfigured } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { tracks } from '@/data/tracks'

interface UserProfile {
  uid: string
  displayName: string
  photoURL: string
  totalSolved: number
  strongestTrack: string
}

interface MockUser {
  uid: string
  displayName?: string
  photoURL?: string
  totalSolved?: number
  strongestTrack?: string
  trackProgress?: Record<string, number>
}

export default function LeaderboardWidget() {
  const { user, isMock } = useAuth()
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isMock || !isFirebaseConfigured || !db) {
      // Mock local storage database mode
      const loadMockLeaderboard = () => {
        try {
          const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
          const parsed = JSON.parse(usersStr)
          
          if (Array.isArray(parsed)) {
            const enabledTracks = tracks.filter((t) => t.totalProblems > 0)
            const list: UserProfile[] = parsed.map((u: MockUser) => {
              let totalSolved = 0
              const progressMap: Record<string, number> = {}

              // Dynamically recalculate solved counts from localStorage to ensure correctness
              enabledTracks.forEach((track) => {
                const stored = localStorage.getItem(`prepos_progress_${u.uid}_${track.id}`)
                if (stored) {
                  try {
                    const arr = JSON.parse(stored)
                    if (Array.isArray(arr)) {
                      progressMap[track.id] = arr.length
                    }
                  } catch {
                    progressMap[track.id] = 0
                  }
                } else {
                  progressMap[track.id] = u.trackProgress?.[track.id] || 0
                }
                totalSolved += progressMap[track.id]
              })

              // Dynamically determine the strongest track
              let strongestTrack = 'None'
              let maxSolved = 0
              enabledTracks.forEach((track) => {
                const solved = progressMap[track.id] || 0
                if (solved > maxSolved) {
                  maxSolved = solved
                  strongestTrack = track.title
                }
              })

              const seed = u.displayName ? u.displayName.trim().replace(/\s+/g, '-').toLowerCase() : u.uid
              const photoURL = u.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`

              return {
                uid: u.uid,
                displayName: u.displayName || 'Anonymous',
                photoURL,
                totalSolved,
                strongestTrack,
              }
            })

            // Sort by totalSolved descending
            list.sort((a, b) => b.totalSolved - a.totalSolved)
            setLeaderboard(list)
          }
          setLoading(false)
        } catch (e) {
          console.error('Error loading mock leaderboard:', e)
          setError('Failed to load mock leaderboard')
          setLoading(false)
        }
      }

      loadMockLeaderboard()
      
      // Setup a window focus listener to refresh mock data in case user solves problems and returns
      window.addEventListener('focus', loadMockLeaderboard)
      return () => {
        window.removeEventListener('focus', loadMockLeaderboard)
      }
    } else {
      // Real Firebase Firestore mode
      try {
        const unsubscribe = onSnapshot(
          collection(db, 'users'),
          (snapshot) => {
            const list: UserProfile[] = []
            snapshot.forEach((doc) => {
              const data = doc.data()
              const seed = data.displayName ? data.displayName.trim().replace(/\s+/g, '-').toLowerCase() : data.uid
              list.push({
                uid: data.uid || doc.id,
                displayName: data.displayName || 'Anonymous',
                photoURL: data.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`,
                totalSolved: data.totalSolved || 0,
                strongestTrack: data.strongestTrack || 'None',
              })
            })
            // Sort by totalSolved descending
            list.sort((a, b) => b.totalSolved - a.totalSolved)
            setLeaderboard(list)
            setLoading(false)
          },
          (err) => {
            console.error('Firestore leaderboard sync error:', err)
            setError(err.message || 'Failed to sync leaderboard')
            setLoading(false)
          }
        )
        return () => unsubscribe()
      } catch (e) {
        console.error('Error attaching Firestore listener:', e)
        const errMsg = e instanceof Error ? e.message : 'Failed to load leaderboard'
        // Wrap state updates in a microtask to prevent react-hooks/set-state-in-effect warning
        Promise.resolve().then(() => {
          setError(errMsg)
          setLoading(false)
        })
      }
    }
  }, [isMock])

  if (loading) {
    return (
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <span className="leaderboard-title">leaderboard</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
          LOADING RANKS...
        </div>
      </div>
    )
  }

  if (error) {
    const isPermissionError = 
      error.toLowerCase().includes('permission') || 
      error.toLowerCase().includes('insufficient')

    return (
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <span className="leaderboard-title">leaderboard</span>
        </div>
        {isPermissionError ? (
          <div style={{ fontSize: '11px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
            <div style={{ color: '#FF4747', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              [Access Denied]
            </div>
            <p style={{ marginBottom: '8px' }}>
              Firestore security rules block reading the <code>users</code> collection.
            </p>
            <p style={{ marginBottom: '8px', color: 'var(--text-faint)' }}>
              To enable rankings, update your Firestore Security Rules:
            </p>
            <pre style={{
              background: '#141414',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#00FF94',
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)'
            }}>
{`match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null 
    && request.auth.uid == userId;
}`}
            </pre>
          </div>
        ) : (
          <div style={{ color: '#FF4747', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
            ERROR: {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="leaderboard-card">
      <div className="leaderboard-header">
        <span className="leaderboard-title">leaderboard</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          {leaderboard.length} user{leaderboard.length !== 1 ? 's' : ''}
        </span>
      </div>

      {leaderboard.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '20px 0' }}>
          NO REGISTERED USERS FOUND.
        </div>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.map((u, index) => {
            const rank = index + 1
            const isCurrentUser = u.uid === user?.uid

            let rankClass = ''
            if (rank === 1) rankClass = ' leaderboard-rank--top1'
            else if (rank === 2) rankClass = ' leaderboard-rank--top2'
            else if (rank === 3) rankClass = ' leaderboard-rank--top3'

            return (
              <div
                key={u.uid}
                className={`leaderboard-row${isCurrentUser ? ' leaderboard-row--active' : ''}`}
                title={isCurrentUser ? 'Your Ranking' : undefined}
              >
                <div className={`leaderboard-rank${rankClass}`}>
                  {rank}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="leaderboard-avatar"
                  src={u.photoURL}
                  alt={`${u.displayName}'s avatar`}
                />
                <div className="leaderboard-userinfo">
                  <div className="leaderboard-name">
                    {u.displayName} {isCurrentUser && <span style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 600 }}>(you)</span>}
                  </div>
                  <div className="leaderboard-track-badge">
                    {u.strongestTrack !== 'None' ? `strongest: ${u.strongestTrack.toLowerCase()}` : 'no solved problems'}
                  </div>
                </div>
                <div className="leaderboard-solved">
                  {u.totalSolved}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

