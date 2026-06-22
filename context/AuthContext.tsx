'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Minimal User interface to support both Firebase User and Mock User
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isMock: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface MockUserData {
  uid: string
  email: string
  displayName: string
  password?: string
  photoURL?: string
  totalSolved?: number
  strongestTrack?: string
  trackProgress?: Record<string, number>
}

export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real Firebase listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Initialize Mock User from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('prepos_mock_user')
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored)
            setUser(parsedUser)

            // Auto-initialize mock user profile inside mock users list if missing
            const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
            const users = JSON.parse(usersStr)
            if (Array.isArray(users) && !users.some((u) => u.uid === parsedUser.uid)) {
              const seed = parsedUser.displayName ? parsedUser.displayName.trim().replace(/\s+/g, '-').toLowerCase() : parsedUser.uid
              users.push({
                uid: parsedUser.uid,
                email: parsedUser.email || '',
                displayName: parsedUser.displayName || 'Anonymous',
                photoURL: parsedUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`,
                totalSolved: 0,
                strongestTrack: 'None',
                trackProgress: { 'design-patterns': 0, 'dsa': 0 }
              })
              localStorage.setItem('prepos_mock_users', JSON.stringify(users))
            }
          } catch {
            localStorage.removeItem('prepos_mock_user')
          }
        }
      }
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const photo = firebaseUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${firebaseUser.uid}`
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: photo,
        })

        // Auto-initialize Firestore profile document if missing
        if (db) {
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          getDoc(userDocRef).then((docSnap) => {
            if (!docSnap.exists()) {
              setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'Anonymous',
                photoURL: photo,
                totalSolved: 0,
                strongestTrack: 'None',
                trackProgress: { 'design-patterns': 0, 'dsa': 0 },
                createdAt: new Date().toISOString()
              }).catch((e) => {
                console.error("Failed to set initial user document:", e)
              })
            }
          }).catch((err) => {
            console.error("Error checking user profile existence in Firestore:", err)
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    
    if (!isFirebaseConfigured || !auth) {
      // Mock Sign In
      await new Promise((resolve) => setTimeout(resolve, 800)) // simulate network delay
      const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
      const users: MockUserData[] = JSON.parse(usersStr)
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      
      if (!found || found.password !== password) {
        setLoading(false)
        const err = new Error('auth/invalid-credential: The email or password is incorrect.')
        setError(err.message)
        throw err
      }

      const mockUser: AuthUser = {
        uid: found.uid,
        email: found.email,
        displayName: found.displayName,
      }
      setUser(mockUser)
      localStorage.setItem('prepos_mock_user', JSON.stringify(mockUser))
      setLoading(false)
      return
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      if (credential.user) {
        setUser({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
        })
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to sign in')
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setError(null)
    setLoading(true)

    if (!isFirebaseConfigured || !auth) {
      // Mock Sign Up
      await new Promise((resolve) => setTimeout(resolve, 800))
      const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
      const users: MockUserData[] = JSON.parse(usersStr)
      
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        setLoading(false)
        const err = new Error('auth/email-already-in-use: The email address is already in use by another account.')
        setError(err.message)
        throw err
      }

      const seed = name.trim().replace(/\s+/g, '-').toLowerCase()
      const newMockUser: MockUserData = {
        uid: `mock-uid-${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: name,
        password,
        photoURL: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`,
        totalSolved: 0,
        strongestTrack: 'None',
        trackProgress: { 'design-patterns': 0, 'dsa': 0 }
      }

      users.push(newMockUser)
      localStorage.setItem('prepos_mock_users', JSON.stringify(users))

      const loggedInUser: AuthUser = {
        uid: newMockUser.uid,
        email: newMockUser.email,
        displayName: newMockUser.displayName,
        photoURL: newMockUser.photoURL
      }
      setUser(loggedInUser)
      localStorage.setItem('prepos_mock_user', JSON.stringify(loggedInUser))
      setLoading(false)
      return
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (credential.user) {
        const photo = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${credential.user.uid}`
        await updateProfile(credential.user, { 
          displayName: name,
          photoURL: photo
        })

        // Save initial profile document to Firestore!
        const { doc, setDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        if (db) {
          await setDoc(doc(db, 'users', credential.user.uid), {
            uid: credential.user.uid,
            email: credential.user.email,
            displayName: name,
            photoURL: photo,
            totalSolved: 0,
            strongestTrack: 'None',
            trackProgress: { 'design-patterns': 0, 'dsa': 0 },
            createdAt: new Date().toISOString()
          })
        }

        setUser({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: name,
          photoURL: photo
        })
      }
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to sign up')
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setError(null)
    setLoading(true)

    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem('prepos_mock_user')
      setUser(null)
      setLoading(false)
      return
    }

    try {
      await signOut(auth)
      setUser(null)
      setLoading(false)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to sign out')
      setLoading(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        logout,
        isMock: !isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }
  return context
}
