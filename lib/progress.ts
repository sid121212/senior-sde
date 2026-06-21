import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

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

  if (!isFirebaseConfigured || !db) {
    // Mock Local Database Progress Save
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `prepos_progress_${uid}_${trackId}`,
        JSON.stringify(completedArray)
      )
    }
    return
  }

  try {
    const docRef = doc(db, 'users', uid, 'progress', trackId)
    await setDoc(docRef, {
      completedProblems: completedArray,
      updatedAt: new Date().toISOString(),
    }, { merge: true })
  } catch (error) {
    console.error('Error saving progress to Firestore:', error)
  }
}
