import { useState, useEffect } from 'react'
import ProgressBar from './components/ProgressBar'
import TodayView from './components/TodayView'
import ScheduleBuilder from './components/ScheduleBuilder'
import SettingsView from './components/SettingsView'

const API = '/api/todos'

const TABS = [
  { id: 'today',    icon: 'today',        label: 'Today'    },
  { id: 'schedule', icon: 'auto_awesome', label: 'Build'    },
  { id: 'settings', icon: 'settings',     label: 'Settings' },
]

function loadLocal(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch { return fallback }
}

export default function App() {
  const [todos, setTodos]           = useState([])
  const [tab, setTab]               = useState('today')
  const [kidProfile, setKidProfile] = useState(() => loadLocal('kidProfile', {}))
  const [apiKey, setApiKey]         = useState(() => localStorage.getItem('claudeApiKey') || '')
  const [celebrate, setCelebrate]   = useState(false)

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

  const kidName = kidProfile?.name || ''

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside className="app-sidebar">
        {/* Brand */}
        <div style={{ padding: '4px 8px 16px', borderBottom: '1px solid #ededed', marginBottom: 8 }}>
          <p className="title is-6 mb-1">{kidName ? `${kidName}'s Homework` : 'Focus Time'}</p>
          <p className="help">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Nav */}
        <aside className="menu" style={{ flex: 1 }}>
          <p className="menu-label">Navigation</p>
          <ul className="menu-list">
            {TABS.map(t => (
              <li key={t.id}>
                <a
                  className={tab === t.id ? 'is-active' : ''}
                  onClick={() => setTab(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>{t.icon}</span>
                  {t.label}
                </a>
              </li>
            ))}
          </ul>

          <hr style={{ border: 'none', borderTop: '1px solid #ededed', margin: '12px 0' }} />

          <p className="menu-label">Today's Progress</p>
          <ProgressBar todos={todos} />
        </aside>

        {/* API key CTA */}
        {!apiKey && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setTab('settings')}
              className="button is-warning is-light is-fullwidth is-small"
            >
              <span className="icon"><span className="material-icons" style={{ fontSize: 16 }}>key</span></span>
              <span>Setup Claude AI</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <main className="app-main">
        {tab === 'today'    && <TodayView todos={todos} onAdd={addTodo} onToggle={toggleTodo} onToggleMomHelp={toggleMomHelp} onDelete={deleteTodo} />}
        {tab === 'schedule' && <ScheduleBuilder kidProfile={kidProfile} onAddTasks={addTasks} hasApiKey={!!apiKey} />}
        {tab === 'settings' && <SettingsView kidProfile={kidProfile} onSaveProfile={handleSaveProfile} apiKey={apiKey} onSaveApiKey={handleSaveApiKey} />}
      </main>

      {/* ── Celebration overlay ── */}
      {celebrate && (
        <div className="modal is-active">
          <div className="modal-background" style={{ pointerEvents: 'none', backdropFilter: 'blur(2px)' }} />
          <div className="modal-content" style={{ width: 'auto' }}>
            <div className="box has-text-centered" style={{ padding: '40px 56px' }}>
              <span className="material-icons" style={{ fontSize: 56, color: '#00d1b2', display: 'block', marginBottom: 12 }}>celebration</span>
              <p className="title is-4" style={{ color: '#00d1b2' }}>All Done!</p>
              <p className="subtitle is-6">Amazing work today!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
