import { useState, useEffect } from 'react'
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [folders]                     = useState(['Cooking', 'Learning'])

  useEffect(() => {
    fetch(API).then(r => r.json()).then(setTodos).catch(() => setTodos([]))
  }, [])

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

          <button className="app-add-folder-btn">
            <span className="material-icons">add</span>
            Add Folder
          </button>

          <nav>
            {folders.map(folder => (
              <a key={folder} className="app-nav-item app-folder-item">
                <span className="material-icons">folder</span>
                {folder}
              </a>
            ))}
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
