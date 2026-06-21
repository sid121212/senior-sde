export default function Footer() {
  return (
    <footer className="footer">
      <span className="caption">PrepOS — built for the grind</span>
      <span className="caption">{new Date().getFullYear()}</span>
    </footer>
  )
}
