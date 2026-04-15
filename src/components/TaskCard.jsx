import { useState, useRef, useEffect } from 'react'

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

export default function TaskCard({ todo, onToggle, onToggleMomHelp, onDelete, folders = [], onAssignFolder }) {
  const subj = SUBJECTS[todo.subject] || SUBJECTS.other
  const priorityStyle = PRIORITY_STYLES[todo.priority]
  const [folderMenuOpen, setFolderMenuOpen] = useState(false)
  const folderMenuRef = useRef(null)
  const assignedFolder = folders.find(f => f.id === todo.folderId)

  useEffect(() => {
    if (!folderMenuOpen) return
    function handleClick(e) {
      if (folderMenuRef.current && !folderMenuRef.current.contains(e.target)) {
        setFolderMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [folderMenuOpen])

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

        {/* Priority chip — only shown for high priority */}
        {todo.priority === 'high' && (
          <span title="High priority" style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#fff7ed', color: '#ea580c',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <span className="material-icons" style={{ fontSize: 13 }}>bolt</span>
            Priority
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

        {/* Folder chip — inline with other chips */}
        {assignedFolder && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#f3f4f6', color: '#6b7280',
            padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            <span className="material-icons" style={{ fontSize: 13 }}>folder</span>
            {assignedFolder.name}
          </span>
        )}

        {/* Folder button + delete — pushed right */}
        <div style={{ marginLeft: 'auto', position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }} ref={folderMenuRef}>
          {folders.length > 0 && (
            <button
              onClick={() => setFolderMenuOpen(o => !o)}
              aria-label="Add to folder"
              title="Add to folder"
              style={{
                background: folderMenuOpen ? '#ede9fe' : 'none', border: 'none', cursor: 'pointer',
                color: folderMenuOpen ? '#4f46e5' : '#9ca3af', display: 'flex', alignItems: 'center', padding: '2px',
                borderRadius: 6, transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#4f46e5'; e.currentTarget.style.background = '#ede9fe' }}
              onMouseLeave={e => { if (!folderMenuOpen) { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'none' } }}
            >
              <span className="material-icons" style={{ fontSize: 18 }}>create_new_folder</span>
            </button>
          )}

          {/* Folder dropdown */}
          {folderMenuOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6,
              background: '#fff', borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              border: '1px solid #e5e7eb',
              minWidth: 150, zIndex: 200, overflow: 'hidden',
            }}>
              {assignedFolder && (
                <button
                  onClick={() => { onAssignFolder(todo.id, null); setFolderMenuOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '9px 14px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, color: '#9ca3af',
                    textAlign: 'left', borderBottom: '1px solid #f3f4f6',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span className="material-icons" style={{ fontSize: 14 }}>folder_off</span>
                  Remove from folder
                </button>
              )}
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => { onAssignFolder(todo.id, folder.id); setFolderMenuOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '9px 14px',
                    background: todo.folderId === folder.id ? '#ede9fe' : 'none',
                    border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 500,
                    color: todo.folderId === folder.id ? '#4f46e5' : '#374151',
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (todo.folderId !== folder.id) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={e => { if (todo.folderId !== folder.id) e.currentTarget.style.background = 'none' }}
                >
                  <span className="material-icons" style={{ fontSize: 15 }}>folder</span>
                  {folder.name}
                </button>
              ))}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => onDelete(todo.id)}
            aria-label="Delete"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', display: 'flex', alignItems: 'center', padding: '2px',
              borderRadius: 6, transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
          >
            <span className="material-icons" style={{ fontSize: 18 }}>delete_outline</span>
          </button>
        </div>
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
