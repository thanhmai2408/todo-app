export default function ProgressBar({ todos }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayTasks = todos.filter(t => t.date === today || !t.date)
  const total     = todayTasks.length
  const completed = todayTasks.filter(t => t.completed).length
  const momHelped = todayTasks.filter(t => t.momHelped).length

  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)

  const encouragement =
    completionPct === 100 ? 'All done!'       :
    completionPct >= 75   ? 'Almost there!'   :
    completionPct >= 50   ? 'Halfway through' :
    completionPct >= 25   ? 'Good start!'     :
                            'Ready to Go'

  // Donut chart math
  const radius = 36
  const stroke = 7
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const dashOffset = circumference - (completionPct / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Completion donut ── */}
      <div style={{
        background: '#fff', borderRadius: 16,
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        padding: '20px 20px 16px',
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Progress
        </p>

        {/* Donut + label row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* SVG donut */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
              {/* Track */}
              <circle
                cx={radius} cy={radius} r={normalizedRadius}
                fill="none" stroke="#e5e7eb" strokeWidth={stroke}
              />
              {/* Fill */}
              <circle
                cx={radius} cy={radius} r={normalizedRadius}
                fill="none" stroke="#4f46e5" strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            {/* Center text */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{completionPct}%</span>
            </div>
          </div>

          {/* Right side */}
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{encouragement}</p>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>{completed} of {total} tasks done</p>
          </div>
        </div>

        {/* Task dots */}
        {total > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
            {todayTasks.map((t, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: t.completed ? '#4f46e5' : '#e5e7eb',
                transition: 'background 0.3s',
              }} title={t.text} />
            ))}
          </div>
        )}
      </div>

      {/* ── Mom's help stat ── */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        borderRadius: 16,
        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
        padding: '20px 20px 16px',
        border: '1px solid #fbcfe8',
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#9d174d', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Mom's Help
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Big icon */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#fce7f3', border: '2px solid #f9a8d4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span className="material-icons" style={{ fontSize: 26, color: '#db2777' }}>favorite</span>
          </div>

          {/* Count */}
          <div>
            <p style={{ fontSize: 36, fontWeight: 800, color: '#be185d', lineHeight: 1, marginBottom: 2 }}>
              {momHelped}
            </p>
            <p style={{ fontSize: 12, color: '#9d174d', fontWeight: 500 }}>
              {momHelped === 1 ? 'task mom helped with' : 'tasks mom helped with'}
            </p>
          </div>
        </div>

        {/* Helped task dots */}
        {momHelped > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 14 }}>
            {Array.from({ length: momHelped }).map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: '#ec4899',
              }} />
            ))}
          </div>
        )}

        {momHelped === 0 && (
          <p style={{ fontSize: 12, color: '#f9a8d4', marginTop: 10, fontStyle: 'italic' }}>
            No help needed yet — you've got this!
          </p>
        )}
      </div>

    </div>
  )
}
