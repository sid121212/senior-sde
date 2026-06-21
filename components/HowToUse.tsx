const STEPS = [
  ['01', 'Pick a track from the grid above.'],
  ['02', 'Open the first unlocked problem — read the prompt carefully.'],
  ['03', 'Attempt a solution independently before checking hints.'],
  ['04', 'Mark problems done only after you can explain the solution out loud.'],
  ['05', 'Revisit hard problems every 3 days until they feel trivial.'],
  ['06', 'Track your streak — consistency beats intensity.'],
]

export default function HowToUse() {
  return (
    <div className="card">
      <div className="section-label" style={{ marginBottom: '20px' }}>
        how to use
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {STEPS.map(([num, text]) => (
          <div key={num} className="how-to-use__step">
            <span className="how-to-use__num">{num}</span>
            <span className="body-text">{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
