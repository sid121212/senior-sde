import CompanyMarquee from './CompanyMarquee'

export default function Navbar() {
  return (
    <nav className="navbar">
      <CompanyMarquee />

      <div className="navbar__actions">
        <span className="caption">v0.1</span>
      </div>
    </nav>
  )
}
