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

const PRIORITY_STYLES = {
  high:   { bg: '#fee2e2', color: '#dc2626', label: 'Priority' },
  medium: { bg: '#fef3c7', color: '#d97706', label: 'Medium'   },
  low:    { bg: '#dcfce7', color: '#16a34a', label: 'Low'      },
}

export default function TaskCard({ todo, onToggle, onToggleMomHelp, onDelete }) {
  const subj = SUBJECTS[todo.subject] || SUBJECTS.other
  const priorityStyle = PRIORITY_STYLES[todo.priority]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      borderLeft: `4px solid ${subj.on}`,
      boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      padding: '12px 16px',
      opacity: todo.completed ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>

      {/* ── Top row: tags + actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>

        {/* Subject tag */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          background: subj.bg, color: subj.on,
          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {todo.subject || 'other'}
        </span>

        {/* Priority tag */}
        {todo.priority && priorityStyle && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: priorityStyle.bg, color: priorityStyle.color,
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            {priorityStyle.label}
          </span>
        )}

        {/* Mom's Help tag (toggleable) */}
        {todo.momHelped ? (
          <button
            onClick={() => onToggleMomHelp(todo)}
            title="Remove mom's help"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: '#fce7f3', color: '#be185d',
              padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}
          >
            <span className="material-icons" style={{ fontSize: 13 }}>account_circle</span>
            Mom's Help
          </button>
        ) : (
          <button
            onClick={() => onToggleMomHelp(todo)}
            title="Mark mom helped"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              background: 'none', color: '#d1d5db',
              padding: '3px 6px', borderRadius: 20, fontSize: 12,
              border: '1.5px dashed #e5e7eb', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#be185d'; e.currentTarget.style.color = '#be185d' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#d1d5db' }}
          >
            <span className="material-icons" style={{ fontSize: 13 }}>favorite_border</span>
            Mom's Help
          </button>
        )}

        {/* AI badge */}
        {todo.aiGenerated && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#ede9fe', color: '#7c3aed',
            padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <span className="material-icons" style={{ fontSize: 11 }}>auto_awesome</span>
            AI
          </span>
        )}

        {/* Delete — pushed right */}
        <button
          onClick={() => onDelete(todo.id)}
          aria-label="Delete"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
            color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '2px',
            borderRadius: 6, transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>delete_outline</span>
        </button>
      </div>

      {/* ── Bottom row: checkbox + task text ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => onToggle(todo)}
          aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
          style={{
            flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
            border: todo.completed ? 'none' : '2px solid #d1d5db',
            backgroundColor: todo.completed ? '#4f46e5' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {todo.completed && (
            <svg width="10" height="8" viewBox="0 0 13 10" fill="none">
              <path d="M1 5l3.5 3.5L12 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 500,
          color: todo.completed ? '#9ca3af' : '#111827',
          textDecoration: todo.completed ? 'line-through' : 'none',
          lineHeight: 1.4,
        }}>
          {todo.text}
        </p>
      </div>

      {/* ── Extra meta (time / notes) ── */}
      {(todo.scheduledTime || todo.timeEstimate || todo.notes) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, paddingLeft: 30 }}>
          {todo.scheduledTime && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6b7280' }}>
              <span className="material-icons" style={{ fontSize: 13 }}>schedule</span>
              {todo.scheduledTime}
            </span>
          )}
          {todo.timeEstimate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6b7280' }}>
              <span className="material-icons" style={{ fontSize: 13 }}>timer</span>
              {todo.timeEstimate} min
            </span>
          )}
          {todo.notes && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
              <span className="material-icons" style={{ fontSize: 12 }}>lightbulb</span>
              {todo.notes}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
