import { useState } from 'react'
import TaskCard from './TaskCard'
import ProgressBar from './ProgressBar'

const BLOCKS = [
  { id: 'morning',   label: 'Morning',   icon: 'light_mode',  range: [0, 12]  },
  { id: 'afternoon', label: 'Afternoon', icon: 'wb_sunny',    range: [12, 17] },
  { id: 'evening',   label: 'Evening',   icon: 'nights_stay', range: [17, 24] },
  { id: 'anytime',   label: 'Anytime',   icon: 'list',        range: null     },
]
const SUBJECTS = ['math','reading','science','writing','art','music','exercise','other']

function getBlock(time) {
  if (!time) return 'anytime'
  const h = parseInt(time.split(':')[0], 10)
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
}

export default function TodayView({ todos, onAdd, onToggle, onToggleMomHelp, onDelete, kidName, showAddForm, onSetShowAddForm }) {
  const [form, setForm] = useState({ text: '', subject: '', scheduledTime: '', timeEstimate: '', priority: 'medium' })

  const today = new Date().toISOString().slice(0, 10)
  const todayTasks = todos.filter(t => !t.date || t.date === today)

  const byBlock = BLOCKS.reduce((acc, b) => {
    acc[b.id] = todayTasks.filter(t => getBlock(t.scheduledTime) === b.id)
    return acc
  }, {})

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.text.trim()) return
    await onAdd({
      text: form.text.trim(), subject: form.subject || 'other',
      scheduledTime: form.scheduledTime,
      timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : null,
      priority: form.priority, date: today,
      completed: false, momHelped: false,
    })
    setForm({ text: '', subject: '', scheduledTime: '', timeEstimate: '', priority: 'medium' })
    onSetShowAddForm(false)
  }

  const totalDone = todayTasks.filter(t => t.completed).length
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ padding: '32px 40px' }}>

      {/* ── Hero Banner (full width, stretches with container) ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(130deg, #3730a3 0%, #4f46e5 60%, #6d52e8 100%)',
        borderRadius: 16,
        padding: '36px 44px',
        overflow: 'hidden',
        marginBottom: 20,
        width: '100%',
      }}>
        {/* Decorative shapes */}
        <div style={{ position: 'absolute', right: -30, top: -40, width: 220, height: 180, background: 'rgba(255,255,255,0.07)', borderRadius: 20, transform: 'rotate(18deg)' }} />
        <div style={{ position: 'absolute', right: 80, top: 10, width: 130, height: 110, background: 'rgba(255,255,255,0.06)', borderRadius: 14 }} />
        <div style={{ position: 'absolute', right: 30, bottom: -30, width: 170, height: 110, background: 'rgba(255,255,255,0.05)', borderRadius: 18, transform: 'rotate(-12deg)' }} />
        <div style={{ position: 'absolute', right: 160, top: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 10, transform: 'rotate(30deg)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>
            Hello {kidName}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 4 }}>
            Today is {dateStr}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14 }}>
            {todayTasks.length === 0
              ? "Ready to conquer the day? Let's add your first task!"
              : `${totalDone} of ${todayTasks.length} tasks completed`}
          </p>
        </div>
      </div>

      {/* ── 3-column grid: left 2 cols = content, right 1 col = progress ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginTop: 20 }}>

        {/* Left 2 columns — tasks or empty state */}
        <div style={{ gridColumn: '1 / 3', padding: 20 }}>

          {/* Add New Task form */}
          {showAddForm && (
            <div style={{
              background: '#fff', borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '20px 24px', marginBottom: 24,
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Add New Task</span>
                <button
                  onClick={() => onSetShowAddForm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#374151'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <span className="material-icons" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>

              <form onSubmit={handleAdd}>
                {/* Task description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Task Description
                  </label>
                  <input
                    className="input"
                    placeholder="What needs to be done?"
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    autoFocus
                    style={{ borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14 }}
                  />
                </div>

                {/* Subject + Priority row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject</label>
                    <div className="select is-fullwidth">
                      <select
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        style={{ borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14 }}
                      >
                        <option value="" disabled>Select</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Priority</label>
                    <div className="select is-fullwidth">
                      <select
                        value={form.priority}
                        onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                        style={{ borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14 }}
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom bar: icons + button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {/* Schedule time icon — toggles time input */}
                    <label title="Scheduled time" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                      color: form.scheduledTime ? '#4f46e5' : '#9ca3af',
                      background: form.scheduledTime ? '#ede9fe' : 'transparent',
                      transition: 'all 0.15s', position: 'relative',
                    }}>
                      <span className="material-icons" style={{ fontSize: 20 }}>calendar_today</span>
                      <input
                        type="time"
                        value={form.scheduledTime}
                        onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                      />
                    </label>
                    {/* Person / assignee icon (decorative) */}
                    <button type="button" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 8,
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                    }}>
                      <span className="material-icons" style={{ fontSize: 20 }}>person_add</span>
                    </button>
                    {/* Notifications icon (decorative) */}
                    <button type="button" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 8,
                      background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                    }}>
                      <span className="material-icons" style={{ fontSize: 20 }}>notifications_none</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: '#4f46e5', color: '#fff', border: 'none',
                      borderRadius: 10, padding: '10px 24px',
                      fontSize: 14, fontWeight: 600, cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#4f46e5'}
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Empty state */}
          {todayTasks.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
              <img src="/empty-state.svg" alt="No tasks" style={{ width: 258, height: 194, marginBottom: 16 }} />
              <p style={{ fontSize: 15, color: '#6b7280', fontWeight: 500 }}>No tasks added for today</p>
            </div>
          )}

          {/* Time blocks */}
          {todayTasks.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {BLOCKS.map(block => {
                const tasks = byBlock[block.id]
                if (!tasks.length) return null
                return (
                  <section key={block.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[...tasks]
                        .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
                        .map(todo => (
                          <TaskCard key={todo.id} todo={todo} onToggle={onToggle} onToggleMomHelp={onToggleMomHelp} onDelete={onDelete} />
                        ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column — progress cards */}
        <div style={{ gridColumn: '3 / 4', padding: 20 }}>
          <ProgressBar todos={todos} />
        </div>

      </div>
    </div>
  )
}
