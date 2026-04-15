import { useState, useEffect, useRef } from 'react'
import TodayView from './components/TodayView'
import ScheduleBuilder from './components/ScheduleBuilder'
import SettingsView from './components/SettingsView'

const API = '/api/todos'

function loadLocal(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

export default function App() {
  const [todos, setTodos]             = useState([])
  const [tab, setTab]                 = useState('today')
  const [kidProfile, setKidProfile]   = useState(() => loadLocal('kidProfile', {}))
  const [apiKey, setApiKey]           = useState(() => localStorage.getItem('claudeApiKey') || '')
  const [celebrate, setCelebrate]     = useState(false)
  const [showAddForm, setShowAddForm]   = useState(false)

  // Folder state
  const [folders, setFolders]                     = useState([
    { id: '1', name: 'Cooking' },
    { id: '2', name: 'Learning' },
  ])
  const [editingFolderId, setEditingFolderId]     = useState(null)
  const [hoveredFolderId, setHoveredFolderId]     = useState(null)
  const [openMenuFolderId, setOpenMenuFolderId]   = useState(null)
  const menuRef                                   = useRef(null)

  useEffect(() => {
    fetch(API).then(r => r.json()).then(setTodos).catch(() => setTodos([]))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openMenuFolderId) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuFolderId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openMenuFolderId])

  function handleAddFolder() {
    const id = Date.now().toString()
    setFolders(prev => [...prev, { id, name: '' }])
    setEditingFolderId(id)
  }

  function handleFolderNameChange(id, name) {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f))
  }

  function handleFolderBlur(folder) {
    if (!folder.name.trim()) setFolders(prev => prev.filter(f => f.id !== folder.id))
    setEditingFolderId(null)
  }

  function handleFolderKeyDown(e, folder) {
    if (e.key === 'Enter') {
      if (!folder.name.trim()) setFolders(prev => prev.filter(f => f.id !== folder.id))
      setEditingFolderId(null)
    }
    if (e.key === 'Escape') {
      setFolders(prev => prev.filter(f => f.id !== folder.id))
      setEditingFolderId(null)
    }
  }

  function handleDeleteFolder(id) {
    setFolders(prev => prev.filter(f => f.id !== id))
    setOpenMenuFolderId(null)
    setHoveredFolderId(null)
  }

  async function addTodo(data) {
    const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const created = await res.json()
    setTodos(prev => [...prev, created])
  }

  async function addTasks(tasks) {
    const created = await Promise.all(tasks.map(t =>
      fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) }).then(r => r.json())
    ))
    setTodos(prev => [...prev, ...created])
    setTab('today')
  }

  async function toggleTodo(todo) {
    const nowDone = !todo.completed
    const res = await fetch(`${API}/${todo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: nowDone }) })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t))
    if (nowDone) {
      const today = new Date().toISOString().slice(0, 10)
      const todayTasks = todos.filter(t => !t.date || t.date === today)
      if (todayTasks.length > 0 && todayTasks.every(t => t.id === todo.id ? true : t.completed)) {
        setCelebrate(true); setTimeout(() => setCelebrate(false), 3000)
      }
    }
  }

  async function toggleMomHelp(todo) {
    const res = await fetch(`${API}/${todo.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ momHelped: !todo.momHelped }) })
    const updated = await res.json()
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  async function deleteTodo(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function handleSaveProfile(p) { setKidProfile(p); localStorage.setItem('kidProfile', JSON.stringify(p)) }
  function handleSaveApiKey(k) { setApiKey(k); localStorage.setItem('claudeApiKey', k) }

  const kidName = kidProfile?.name || 'Jane'

  function handleAddTaskClick() {
    setTab('today')
    setShowAddForm(true)
  }

  return (
    <div className="app-layout">

      {/* ── Top Navbar ── */}
      <header className="app-topbar">
        <span className="app-brand">LittleWin</span>
        <div className="app-topbar-right">
          <button className="app-icon-btn" aria-label="Help">
            <span className="material-icons">help_outline</span>
          </button>
          <button className="app-icon-btn" aria-label="Notifications">
            <span className="material-icons">notifications</span>
            <span className="notif-dot" />
          </button>
          <div className="app-avatar" onClick={() => setTab('settings')} title="Settings">
            <span className="material-icons">account_circle</span>
          </div>
          <button className="app-topbar-add-btn" onClick={handleAddTaskClick}>
            Add Task
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="app-body">

        {/* ── Left Sidebar ── */}
        <aside className="app-sidebar">
          <nav>
            <a className={`app-nav-item${tab === 'today' ? ' is-active' : ''}`} onClick={() => setTab('today')}>
              <span className="material-icons">calendar_today</span>
              Today
            </a>
            <a className={`app-nav-item${tab === 'schedule' ? ' is-active' : ''}`} onClick={() => setTab('schedule')}>
              <span className="material-icons">grid_view</span>
              Build
            </a>
          </nav>

          <hr className="app-sidebar-divider" />

          <button className="app-add-folder-btn" onClick={handleAddFolder}>
            <span className="material-icons">add</span>
            Add Folder
          </button>

          <nav>
            {folders.map(folder => {
              const isEditing  = editingFolderId  === folder.id
              const isHovered  = hoveredFolderId  === folder.id
              const isMenuOpen = openMenuFolderId === folder.id

              return (
                <div
                  key={folder.id}
                  className="app-nav-item app-folder-item"
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, paddingRight: 4 }}
                  onMouseEnter={() => setHoveredFolderId(folder.id)}
                  onMouseLeave={() => { if (!isMenuOpen) setHoveredFolderId(null) }}
                >
                  <span className="material-icons" style={{ fontSize: 18, flexShrink: 0, color: '#6b7280' }}>folder</span>

                  {isEditing ? (
                    <input
                      autoFocus
                      value={folder.name}
                      onChange={e => handleFolderNameChange(folder.id, e.target.value)}
                      onBlur={() => handleFolderBlur(folder)}
                      onKeyDown={e => handleFolderKeyDown(e, folder)}
                      placeholder="Folder name"
                      style={{
                        flex: 1, border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 13,
                        fontWeight: 500, color: '#374151', minWidth: 0,
                      }}
                    />
                  ) : (
                    <span style={{
                      flex: 1, fontSize: 13, fontWeight: 500, color: '#6b7280',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {folder.name || 'Untitled'}
                    </span>
                  )}

                  {/* Three-dots — visible on hover or when menu is open */}
                  {(isHovered || isMenuOpen) && !isEditing && (
                    <div style={{ position: 'relative', flexShrink: 0 }} ref={isMenuOpen ? menuRef : null}>
                      <button
                        onClick={e => { e.stopPropagation(); setOpenMenuFolderId(isMenuOpen ? null : folder.id) }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 24, height: 24, borderRadius: 6,
                          background: isMenuOpen ? '#e5e7eb' : 'transparent',
                          border: 'none', cursor: 'pointer', color: '#6b7280',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseLeave={e => { if (!isMenuOpen) e.currentTarget.style.background = 'transparent' }}
                      >
                        <span className="material-icons" style={{ fontSize: 16 }}>more_horiz</span>
                      </button>

                      {/* Dropdown */}
                      {isMenuOpen && (
                        <div style={{
                          position: 'absolute', top: '100%', right: 0, marginTop: 4,
                          background: '#fff', borderRadius: 10,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                          border: '1px solid #e5e7eb',
                          minWidth: 140, zIndex: 100, overflow: 'hidden',
                        }}>
                          <button
                            onClick={() => handleDeleteFolder(folder.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              width: '100%', padding: '10px 14px',
                              background: 'none', border: 'none', cursor: 'pointer',
                              fontSize: 13, fontWeight: 500, color: '#ef4444',
                              textAlign: 'left', transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <span className="material-icons" style={{ fontSize: 16 }}>delete_outline</span>
                            Delete folder
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {!apiKey && (
            <div className="app-sidebar-bottom">
              <button onClick={() => setTab('settings')} className="button is-warning is-light is-fullwidth is-small">
                <span className="icon"><span className="material-icons" style={{ fontSize: 16 }}>key</span></span>
                <span>Setup Claude AI</span>
              </button>
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className="app-main">
          {tab === 'today'    && <TodayView todos={todos} onAdd={addTodo} onToggle={toggleTodo} onToggleMomHelp={toggleMomHelp} onDelete={deleteTodo} kidName={kidName} showAddForm={showAddForm} onSetShowAddForm={setShowAddForm} />}
          {tab === 'schedule' && <ScheduleBuilder kidProfile={kidProfile} onAddTasks={addTasks} hasApiKey={!!apiKey} />}
          {tab === 'settings' && <SettingsView kidProfile={kidProfile} onSaveProfile={handleSaveProfile} apiKey={apiKey} onSaveApiKey={handleSaveApiKey} />}
        </main>

      </div>

      {/* ── Celebration overlay ── */}
      {celebrate && (
        <div className="modal is-active">
          <div className="modal-background" style={{ pointerEvents: 'none', backdropFilter: 'blur(2px)' }} />
          <div className="modal-content" style={{ width: 'auto' }}>
            <div className="box has-text-centered" style={{ padding: '40px 56px' }}>
              <span className="material-icons" style={{ fontSize: 56, color: '#4f46e5', display: 'block', marginBottom: 12 }}>celebration</span>
              <p className="title is-4" style={{ color: '#4f46e5' }}>All Done!</p>
              <p className="subtitle is-6">Amazing work today!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
