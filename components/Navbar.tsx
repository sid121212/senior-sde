import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/dashboard" className="navbar__logo">
        Prep<span>OS</span>
      </Link>

      <div className="navbar__actions">
        <span className="caption">v0.1</span>
      </div>
    </nav>
  )
}
