import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { tracks } from '../data/tracks'

/**
 * Loads the set of completed problem IDs for a user and track.
 */
export async function loadProgress(uid: string, trackId: string): Promise<Set<string>> {
  if (!uid) return new Set<string>()

  if (!isFirebaseConfigured || !db) {
    // Mock Local Database Progress Load
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`prepos_progress_${uid}_${trackId}`)
      if (stored) {
        try {
          const arr = JSON.parse(stored)
          if (Array.isArray(arr)) {
            return new Set<string>(arr)
          }
        } catch (e) {
          console.error('Error parsing mock progress:', e)
        }
      }
    }
    return new Set<string>()
  }

  try {
    const docRef = doc(db, 'users', uid, 'progress', trackId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data && Array.isArray(data.completedProblems)) {
        return new Set<string>(data.completedProblems)
      }
    }
  } catch (error) {
    console.error('Error loading progress from Firestore:', error)
  }

  return new Set<string>()
}

/**
 * Saves the set of completed problem IDs for a user and track.
 */
export async function saveProgress(
  uid: string,
  trackId: string,
  completed: Set<string>
): Promise<void> {
  if (!uid) return

  const completedArray = Array.from(completed)

  // Precompute stats
  const enabledTracks = tracks.filter((t) => t.totalProblems > 0)
  const progressMap: Record<string, number> = {}
  let totalSolved = 0

  for (const track of enabledTracks) {
    if (track.id === trackId) {
      progressMap[track.id] = completed.size
    } else {
      const prevProgress = await loadProgress(uid, track.id)
      progressMap[track.id] = prevProgress.size
    }
    totalSolved += progressMap[track.id]
  }

  let strongestTrack = 'None'
  let maxSolved = 0
  for (const track of enabledTracks) {
    const solved = progressMap[track.id]
    if (solved > maxSolved) {
      maxSolved = solved
      strongestTrack = track.title
    }
  }

  if (!isFirebaseConfigured || !db) {
    // Mock Local Database Progress Save
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `prepos_progress_${uid}_${trackId}`,
        JSON.stringify(completedArray)
      )

      // Update in mock users list
      const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
      try {
        interface MockUserEntry {
          uid: string
          totalSolved?: number
          strongestTrack?: string
          trackProgress?: Record<string, number>
        }
        const users = JSON.parse(usersStr)
        if (Array.isArray(users)) {
          const userIdx = users.findIndex((u: MockUserEntry) => u.uid === uid)
          if (userIdx !== -1) {
            users[userIdx].totalSolved = totalSolved
            users[userIdx].strongestTrack = strongestTrack
            users[userIdx].trackProgress = progressMap
            localStorage.setItem('prepos_mock_users', JSON.stringify(users))
          }
        }
      } catch (e) {
        console.error('Error updating mock statistics:', e)
      }
    }
    return
  }

  try {
    const docRef = doc(db, 'users', uid, 'progress', trackId)
    await setDoc(docRef, {
      completedProblems: completedArray,
      updatedAt: new Date().toISOString(),
    }, { merge: true })

    const userDocRef = doc(db, 'users', uid)
    await setDoc(userDocRef, {
      totalSolved,
      strongestTrack,
      trackProgress: progressMap,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  } catch (error) {
    console.error('Error saving progress to Firestore:', error)
  }
}

