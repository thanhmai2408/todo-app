export default function ProgressBar({ todos, row = false }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayTasks = todos.filter(t => t.date === today || !t.date)
  const total     = todayTasks.length
  const completed = todayTasks.filter(t => t.completed).length
  const momHelped = todayTasks.filter(t => t.momHelped).length

  const completionPct = total === 0 ? 0 : Math.round((completed / total) * 100)
  const momHelpPct    = total === 0 ? 0 : Math.round((momHelped / total) * 100)

  const encouragement =
    completionPct === 100 ? 'All done!'       :
    completionPct >= 75   ? 'Almost there!'   :
    completionPct >= 50   ? 'Halfway through' :
    completionPct >= 25   ? 'Good start!'     :
                            'Ready to Go'

  const cardStyle = {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
    ...(row ? { flex: 1 } : { marginBottom: 16 }),
  }

  const trackStyle = {
    height: 6,
    background: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    margin: '10px 0 8px',
  }

  const fillStyle = (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: '#4f46e5',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  })

  return (
    <div style={row ? { display: 'flex', gap: 16 } : {}}>
      {/* Completion */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{encouragement}</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#4f46e5' }}>{completionPct}%</span>
        </div>
        <div style={trackStyle}>
          <div style={fillStyle(completionPct)} />
        </div>
        <p style={{ fontSize: 12, color: '#6b7280' }}>{completed} of {total} tasks done</p>
      </div>

      {/* Mom help */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>Mom's help</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#4f46e5' }}>{momHelpPct}%</span>
        </div>
        <div style={trackStyle}>
          <div style={fillStyle(momHelpPct)} />
        </div>
        <p style={{ fontSize: 12, color: '#6b7280' }}>{momHelped} of {total} tasks</p>
      </div>
    </div>
  )
}
