const SUBJECTS = {
  math:     { icon: 'calculate',      bg: 'var(--subj-math-bg)',     on: 'var(--subj-math-on)'     },
  reading:  { icon: 'menu_book',      bg: 'var(--subj-reading-bg)',  on: 'var(--subj-reading-on)'  },
  science:  { icon: 'science',        bg: 'var(--subj-science-bg)',  on: 'var(--subj-science-on)'  },
  writing:  { icon: 'edit',           bg: 'var(--subj-writing-bg)',  on: 'var(--subj-writing-on)'  },
  art:      { icon: 'palette',        bg: 'var(--subj-art-bg)',      on: 'var(--subj-art-on)'      },
  music:    { icon: 'music_note',     bg: 'var(--subj-music-bg)',    on: 'var(--subj-music-on)'    },
  exercise: { icon: 'directions_run', bg: 'var(--subj-exercise-bg)', on: 'var(--subj-exercise-on)' },
  other:    { icon: 'task',           bg: 'var(--subj-other-bg)',    on: 'var(--subj-other-on)'    },
}

const PRIORITY_COLOR = { high: '#cc0f35', medium: '#f4a015', low: '#257942' }

export default function TaskCard({ todo, onToggle, onToggleMomHelp, onDelete }) {
  const subj = SUBJECTS[todo.subject] || SUBJECTS.other

  return (
    <div
      className="card"
      style={{
        borderLeft: `4px solid ${subj.on}`,
        opacity: todo.completed ? 0.55 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="card-content" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

          {/* Checkbox */}
          <button
            onClick={() => onToggle(todo)}
            aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
            style={{
              flexShrink: 0, marginTop: 2, width: 24, height: 24, borderRadius: '50%',
              border: todo.completed ? 'none' : '2px solid #b5b5b5',
              backgroundColor: todo.completed ? '#00d1b2' : 'transparent',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, border 0.2s',
            }}
          >
            {todo.completed && (
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 5l3.5 3.5L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tags row */}
            <div className="tags mb-1" style={{ gap: 4, flexWrap: 'wrap' }}>
              <span
                className="tag is-small"
                style={{ backgroundColor: subj.bg, color: subj.on, display: 'inline-flex', alignItems: 'center', gap: 3 }}
              >
                <span className="material-icons" style={{ fontSize: 12 }}>{subj.icon}</span>
                {todo.subject || 'other'}
              </span>

              {todo.priority && (
                <span
                  style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: PRIORITY_COLOR[todo.priority] || '#aaa', flexShrink: 0, alignSelf: 'center' }}
                  title={`${todo.priority} priority`}
                />
              )}

              {todo.aiGenerated && (
                <span className="tag is-info is-light is-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-icons" style={{ fontSize: 11 }}>auto_awesome</span> AI
                </span>
              )}
            </div>

            {/* Task text */}
            <p
              className="is-size-6"
              style={{
                margin: '0 0 6px',
                color: todo.completed ? '#7a7a7a' : '#363636',
                textDecoration: todo.completed ? 'line-through' : 'none',
                fontWeight: 500,
              }}
            >
              {todo.text}
            </p>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {todo.scheduledTime && (
                <span className="is-size-7 has-text-grey" style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-icons" style={{ fontSize: 13 }}>schedule</span>
                  {todo.scheduledTime}
                </span>
              )}
              {todo.timeEstimate && (
                <span className="tag is-light is-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-icons" style={{ fontSize: 12 }}>timer</span>
                  {todo.timeEstimate} min
                </span>
              )}
              {todo.notes && (
                <span className="is-size-7 has-text-grey" style={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <span className="material-icons" style={{ fontSize: 12 }}>lightbulb</span>
                  {todo.notes}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <button
              className={`button is-small ${todo.momHelped ? 'is-danger is-light' : 'is-light'}`}
              onClick={() => onToggleMomHelp(todo)}
              title={todo.momHelped ? 'Mom helped' : 'Did mom help?'}
              style={{ width: 32, height: 32, padding: 0 }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>
                {todo.momHelped ? 'favorite' : 'favorite_border'}
              </span>
            </button>
            <button
              className="button is-small is-light"
              onClick={() => onDelete(todo.id)}
              aria-label="Delete"
              style={{ width: 32, height: 32, padding: 0 }}
              onMouseEnter={e => { e.currentTarget.classList.add('is-danger'); e.currentTarget.classList.remove('is-light') }}
              onMouseLeave={e => { e.currentTarget.classList.remove('is-danger'); e.currentTarget.classList.add('is-light') }}
            >
              <span className="material-icons" style={{ fontSize: 16 }}>delete_outline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
