import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AuthContextProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'PrepOS — Senior SWE Interview Prep',
  description: 'Track your Design Patterns, DSA, LLD, System Design prep. Built for senior engineers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthContextProvider>
          <div className="page-wrapper">
            <Navbar />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </AuthContextProvider>
      </body>
    </html>
  )
}
