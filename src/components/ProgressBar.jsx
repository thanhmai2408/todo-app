export default function ProgressBar({ todos }) {
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
                            'Ready to go'

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Completion */}
      <div className="box" style={{ padding: '12px 16px', marginBottom: 10, backgroundColor: '#ebfffc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="is-size-7 has-text-weight-medium">{encouragement}</span>
          <span className="is-size-6 has-text-weight-bold has-text-primary">{completionPct}%</span>
        </div>
        <progress className="progress is-primary is-small mb-1" value={completionPct} max="100">
          {completionPct}%
        </progress>
        <p className="help">{completed} of {total} tasks done</p>
      </div>

      {/* Mom help */}
      <div className="box" style={{ padding: '12px 16px', backgroundColor: '#fff5f7' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span className="is-size-7 has-text-weight-medium" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-icons" style={{ fontSize: 14 }}>volunteer_activism</span>
            Mom helped
          </span>
          <span className="is-size-6 has-text-weight-bold has-text-danger">{momHelpPct}%</span>
        </div>
        <progress className="progress is-danger is-small mb-1" value={momHelpPct} max="100">
          {momHelpPct}%
        </progress>
        <p className="help">{momHelped} of {total} tasks</p>
      </div>
    </div>
  )
}
