import { useState } from 'react'
import TaskCard from './TaskCard'

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

export default function TodayView({ todos, onAdd, onToggle, onToggleMomHelp, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ text: '', subject: 'other', scheduledTime: '', timeEstimate: '', priority: 'medium' })

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
      text: form.text.trim(), subject: form.subject,
      scheduledTime: form.scheduledTime,
      timeEstimate: form.timeEstimate ? parseInt(form.timeEstimate) : null,
      priority: form.priority, date: today,
      completed: false, momHelped: false,
    })
    setForm({ text: '', subject: 'other', scheduledTime: '', timeEstimate: '', priority: 'medium' })
    setShowForm(false)
  }

  const totalDone = todayTasks.filter(t => t.completed).length

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <div className="level mb-5">
        <div className="level-left">
          <div>
            <h1 className="title is-4 mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h1>
            <p className="subtitle is-6 mt-0">
              {todayTasks.length === 0
                ? 'No tasks scheduled yet'
                : `${totalDone} of ${todayTasks.length} tasks completed`
              }
            </p>
          </div>
        </div>
        <div className="level-right">
          <button className="button is-primary" onClick={() => setShowForm(v => !v)}>
            <span className="icon"><span className="material-icons" style={{ fontSize: 18 }}>add</span></span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Add Task form */}
      {showForm && (
        <div className="card mb-5">
          <div className="card-content">
            <p className="title is-6 mb-4">New Task</p>
            <form onSubmit={handleAdd}>
              <div className="field mb-4">
                <label className="label is-small">Task description</label>
                <div className="control">
                  <input
                    className="input"
                    placeholder="What needs to be done?"
                    value={form.text}
                    onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                    autoFocus
                  />
                </div>
              </div>

              <div className="columns">
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Subject</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Priority</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Scheduled time</label>
                    <div className="control">
                      <input
                        type="time"
                        className="input"
                        value={form.scheduledTime}
                        onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="column">
                  <div className="field">
                    <label className="label is-small">Duration (min)</label>
                    <div className="control">
                      <input
                        type="number"
                        className="input"
                        placeholder="e.g. 20"
                        value={form.timeEstimate}
                        onChange={e => setForm(f => ({ ...f, timeEstimate: e.target.value }))}
                        min="5" max="120"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="buttons is-right">
                <button type="button" className="button is-light" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="button is-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayTasks.length === 0 && (
        <div className="has-text-centered" style={{ padding: '80px 24px' }}>
          <span className="material-icons" style={{ fontSize: 64, color: '#dbdbdb', display: 'block', marginBottom: 16 }}>backpack</span>
          <p className="title is-5">No tasks for today</p>
          <p className="subtitle is-6">Add tasks manually or use <strong>Build</strong> to generate a schedule with AI.</p>
        </div>
      )}

      {/* Time blocks — 2-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {BLOCKS.map(block => {
          const tasks = byBlock[block.id]
          if (!tasks.length) return null
          return (
            <section key={block.id}>
              <div className="level is-mobile mb-3">
                <div className="level-left" style={{ gap: 8 }}>
                  <span className="material-icons has-text-grey-light" style={{ fontSize: 18 }}>{block.icon}</span>
                  <span className="is-size-6 has-text-weight-semibold has-text-grey">{block.label}</span>
                </div>
                <div className="level-right">
                  <span className="tag is-light is-small">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
                </div>
              </div>
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
    </div>
  )
}
