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
import { auth, isFirebaseConfigured } from '@/lib/firebase'

// Minimal User interface to support both Firebase User and Mock User
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
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
            setUser(JSON.parse(stored))
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
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        })
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
      const users = JSON.parse(usersStr)
      const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
      
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
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
      throw err
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setError(null)
    setLoading(true)

    if (!isFirebaseConfigured || !auth) {
      // Mock Sign Up
      await new Promise((resolve) => setTimeout(resolve, 800))
      const usersStr = localStorage.getItem('prepos_mock_users') || '[]'
      const users = JSON.parse(usersStr)
      
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        setLoading(false)
        const err = new Error('auth/email-already-in-use: The email address is already in use by another account.')
        setError(err.message)
        throw err
      }

      const newMockUser = {
        uid: `mock-uid-${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: name,
        password,
      }

      users.push(newMockUser)
      localStorage.setItem('prepos_mock_users', JSON.stringify(users))

      const loggedInUser: AuthUser = {
        uid: newMockUser.uid,
        email: newMockUser.email,
        displayName: newMockUser.displayName,
      }
      setUser(loggedInUser)
      localStorage.setItem('prepos_mock_user', JSON.stringify(loggedInUser))
      setLoading(false)
      return
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      if (credential.user) {
        await updateProfile(credential.user, { displayName: name })
        setUser({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: name,
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
      setLoading(false)
      throw err
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
    } catch (err: any) {
      setError(err.message || 'Failed to sign out')
      setLoading(false)
      throw err
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
